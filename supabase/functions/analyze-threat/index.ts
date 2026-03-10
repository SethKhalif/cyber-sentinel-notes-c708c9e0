import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { noteId, content } = await req.json();
    if (!noteId || !content) {
      return new Response(JSON.stringify({ error: "noteId and content required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
            content: `You are a cybersecurity threat analysis AI. Analyze the given text and extract cyber threat intelligence. You MUST respond by calling the analyze_threat function.`,
          },
          {
            role: "user",
            content: `Analyze this cybersecurity note for threats:\n\n${content.substring(0, 4000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_threat",
              description: "Return structured threat analysis for cybersecurity notes",
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
                    description: "Type of cyber attack identified (e.g., Phishing, Credential Harvesting, Ransomware, DDoS, SQL Injection)",
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
                    description: "Recommended mitigation strategy in 1-3 sentences",
                  },
                },
                required: ["threat_level", "attack_type", "probability", "mitre_mapping", "mitigation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_threat" } },
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

    const analysisResult = JSON.parse(toolCall.function.arguments);

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert: delete old analysis for this note, insert new
    await supabase.from("threat_analysis").delete().eq("note_id", noteId);
    const { error: insertError } = await supabase.from("threat_analysis").insert({
      note_id: noteId,
      threat_level: analysisResult.threat_level,
      attack_type: analysisResult.attack_type,
      probability: analysisResult.probability,
      mitre_mapping: analysisResult.mitre_mapping,
      mitigation: analysisResult.mitigation,
    });

    if (insertError) {
      console.error("DB insert error:", insertError);
      throw new Error("Failed to store analysis");
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-threat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
