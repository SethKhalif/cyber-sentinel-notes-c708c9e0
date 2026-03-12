import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Authenticate user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { scanType, url, content, fileName } = await req.json();
    
    let contentToAnalyze = "";
    let source = "";

    if (scanType === "url" && url) {
      source = url;
      // Scrape the URL content
      try {
        const pageResp = await fetch(url, {
          headers: { "User-Agent": "VistaHand-ThreatScanner/1.0" },
          redirect: "follow",
        });
        const pageText = await pageResp.text();
        // Extract text content, strip HTML tags for analysis
        const stripped = pageText
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        
        contentToAnalyze = `URL: ${url}\n\nPage Content:\n${stripped.substring(0, 6000)}`;
        
        // Add URL-specific indicators
        contentToAnalyze += `\n\nURL Analysis Metadata:
- Domain: ${new URL(url).hostname}
- Protocol: ${new URL(url).protocol}
- Full URL: ${url}
- Response Status: ${pageResp.status}
- Content-Type: ${pageResp.headers.get("content-type") || "unknown"}`;
      } catch (fetchErr) {
        contentToAnalyze = `URL: ${url}\nFailed to fetch URL content. Error: ${fetchErr instanceof Error ? fetchErr.message : "Unknown"}. Analyze the URL structure itself for potential threats.`;
      }
    } else if (scanType === "file" || scanType === "image") {
      source = fileName || "uploaded-file";
      contentToAnalyze = `File: ${fileName}\nType: ${scanType}\n\nContent:\n${(content || "").substring(0, 6000)}`;
    } else if (scanType === "barcode") {
      source = content || "barcode-scan";
      contentToAnalyze = `Barcode/QR scan result: ${content}\n\nAnalyze this barcode/QR code data for cybersecurity threats, malicious URLs, or suspicious payloads.`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid scanType" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity threat analysis AI. Analyze the provided resource (URL, file, image, or barcode data) for security threats. Check for:
- Malicious URLs, phishing indicators, suspicious domains
- Known malware signatures or suspicious code patterns
- Data exfiltration indicators
- Social engineering tactics
- Suspicious file characteristics
Map findings to the MITRE ATT&CK framework. You MUST respond by calling the analyze_resource function.`,
          },
          {
            role: "user",
            content: `Analyze this resource for cybersecurity threats:\n\n${contentToAnalyze}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_resource",
              description: "Return structured threat analysis for a scanned resource",
              parameters: {
                type: "object",
                properties: {
                  threat_level: {
                    type: "string",
                    enum: ["None", "Low", "Medium", "High", "Critical"],
                    description: "Overall threat severity level",
                  },
                  attack_type: {
                    type: "string",
                    description: "Type of cyber attack or threat identified",
                  },
                  probability: {
                    type: "integer",
                    description: "Attack probability percentage 0-100",
                  },
                  mitre_mapping: {
                    type: "string",
                    description: "MITRE ATT&CK technique ID and name (e.g., T1566 Phishing)",
                  },
                  mitigation: {
                    type: "string",
                    description: "Recommended mitigation strategy in 2-4 sentences",
                  },
                  malicious_indicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific malicious indicators found (suspicious URLs, code patterns, etc.)",
                  },
                },
                required: ["threat_level", "attack_type", "probability", "mitre_mapping", "mitigation", "malicious_indicators"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_resource" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", status, t);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned from AI");

    const result = JSON.parse(toolCall.function.arguments);

    // Store in database
    const adminClient = createClient(supabaseUrl, supabaseKey);
    await adminClient.from("scan_results").insert({
      user_id: user.id,
      scan_type: scanType,
      source,
      threat_level: result.threat_level,
      attack_type: result.attack_type,
      probability: result.probability,
      mitre_mapping: result.mitre_mapping,
      mitigation: result.mitigation,
      malicious_indicators: result.malicious_indicators,
      raw_content_preview: contentToAnalyze.substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-resource error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
