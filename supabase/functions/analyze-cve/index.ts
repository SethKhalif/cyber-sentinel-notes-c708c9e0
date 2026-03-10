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

    const { cveInput } = await req.json();
    if (!cveInput) {
      return new Response(JSON.stringify({ error: "cveInput required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
            content: "You are a CVE vulnerability analysis AI. Analyze the given CVE or vulnerability data. You MUST respond by calling the analyze_cve function.",
          },
          {
            role: "user",
            content: `Analyze this CVE or vulnerability information:\n\n${cveInput.substring(0, 4000)}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_cve",
              description: "Return structured CVE analysis",
              parameters: {
                type: "object",
                properties: {
                  cve_id: { type: "string", description: "CVE ID if found, otherwise 'UNKNOWN'" },
                  summary: { type: "string", description: "Vulnerability summary in 2-3 sentences" },
                  exploitation_likelihood: { type: "string", description: "Exploitation likelihood: Low, Medium, High, Critical" },
                  affected_systems: { type: "string", description: "Affected systems and software" },
                  mitigation: { type: "string", description: "Patch guidance and mitigation steps" },
                },
                required: ["cve_id", "summary", "exploitation_likelihood", "affected_systems", "mitigation"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_cve" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");

    const result = JSON.parse(toolCall.function.arguments);

    // Store in database
    const adminClient = createClient(supabaseUrl, supabaseKey);
    await adminClient.from("cve_analyses").insert({
      user_id: user.id,
      cve_id: result.cve_id,
      summary: result.summary,
      exploitation_likelihood: result.exploitation_likelihood,
      affected_systems: result.affected_systems,
      mitigation: result.mitigation,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-cve error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
