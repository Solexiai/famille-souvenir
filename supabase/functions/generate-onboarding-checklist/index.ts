import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface RequestBody {
  preparingFor?: "self" | "loved_one";
  language?: "fr" | "en" | "es";
  countryGroup?: string | null;
  countryCode?: string | null;
  regionCode?: string | null;
  jurisdictionPack?: string | null;
  rolesPresent?: string[];
}

const SYSTEM_PROMPT = `You are a preparation assistant for a family-document app called Solexi.
You generate 2 to 3 short, actionable checklist tasks tailored to the user's situation.
Each task must be:
- concrete and doable (verb-led, max 90 chars)
- relevant to the jurisdiction and "preparing for" context
- complementary to a generic base checklist (do NOT repeat: upload ID, locate will, list bank accounts, designate executor, add family members, add one important document)
- written in the requested language

Return ONLY via the suggest_tasks tool.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as RequestBody;
    const lang = body.language || "fr";
    const preparingFor = body.preparingFor || "self";

    const userPrompt = `Context:
- Language: ${lang}
- Preparing for: ${preparingFor === "self" ? "themselves" : "a loved one"}
- Country group: ${body.countryGroup || "unknown"}
- Country: ${body.countryCode || "unknown"}
- Region: ${body.regionCode || "unknown"}
- Jurisdiction pack: ${body.jurisdictionPack || "generic"}
- Roles present in circle: ${(body.rolesPresent || []).join(", ") || "none yet"}

Generate 2 or 3 personalized starter tasks.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tasks",
              description: "Return 2-3 personalized starter checklist tasks.",
              parameters: {
                type: "object",
                properties: {
                  tasks: {
                    type: "array",
                    minItems: 2,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        category: {
                          type: "string",
                          enum: [
                            "legal",
                            "identity",
                            "financial",
                            "insurance",
                            "property",
                            "digital_estate",
                            "final_wishes",
                            "contacts",
                            "executor_readiness",
                          ],
                        },
                        professional_review_recommended: { type: "boolean" },
                      },
                      required: ["title", "category"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["tasks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_tasks" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "credits_exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "ai_error", tasks: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    let tasks: unknown[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
      } catch (e) {
        console.error("parse error", e);
      }
    }

    return new Response(JSON.stringify({ tasks }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("onboarding-checklist error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown", tasks: [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
