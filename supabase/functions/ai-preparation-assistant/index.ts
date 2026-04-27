// Solexi AI Preparation Assistant — server-side AI gateway
// Provider abstraction: currently uses Lovable AI Gateway (LOVABLE_API_KEY).
// To migrate to OpenAI directly later, swap the `callProvider` implementation.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Provider abstraction ────────────────────────────────────────────────
// Change PROVIDER + the callProvider() body to switch to OpenAI later.
const PROVIDER = "lovable" as const;
const DEFAULT_MODEL = "google/gemini-2.5-flash";

interface ProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ProviderTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

interface ProviderRequest {
  messages: ProviderMessage[];
  tools?: ProviderTool[];
  toolChoice?: { type: "function"; function: { name: string } };
  model?: string;
}

async function callProvider(req: ProviderRequest): Promise<{
  content: string | null;
  toolCallArgs: Record<string, unknown> | null;
}> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model: req.model ?? DEFAULT_MODEL,
    messages: req.messages,
  };
  if (req.tools) body.tools = req.tools;
  if (req.toolChoice) body.tool_choice = req.toolChoice;

  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (resp.status === 429) throw new Error("rate_limited");
  if (resp.status === 402) throw new Error("payment_required");
  if (!resp.ok) {
    const txt = await resp.text();
    console.error("AI gateway error", resp.status, txt);
    throw new Error(`provider_error_${resp.status}`);
  }

  const data = await resp.json();
  const choice = data.choices?.[0]?.message ?? {};
  const content: string | null = choice.content ?? null;

  let toolCallArgs: Record<string, unknown> | null = null;
  const toolCall = choice.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    try {
      toolCallArgs = JSON.parse(toolCall.function.arguments);
    } catch (_e) {
      toolCallArgs = null;
    }
  }

  return { content, toolCallArgs };
}

// ─── System prompt ───────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Solexi AI Preparation Assistant. You help users organize memories, documents, and estate-preparation information. You provide educational and organizational guidance only. You do not provide legal, tax, financial, medical, or professional advice. You must always recommend consulting a qualified professional when the question involves legal validity, taxation, inheritance rights, medical decisions, notarization, or financial planning. Tailor general guidance to the user's country and state/province, but do not claim certainty unless the information is verified. If unsure, say that the user should verify with a qualified local professional. Always answer in the user's preferred language.`;

function contextBlock(ctx: {
  country?: string;
  region?: string;
  language?: string;
  preparing_for?: string;
}): string {
  return `User context — country: ${ctx.country || "unspecified"}, region/province: ${ctx.region || "unspecified"}, language: ${ctx.language || "fr"}, preparing for: ${ctx.preparing_for || "myself"}.`;
}

// ─── Action handlers ─────────────────────────────────────────────────────
async function classifyDocument(payload: any) {
  const meta = payload.document_metadata ?? {};
  const userPrompt = `Classify this document based on filename and metadata only (no content was extracted).
Filename: ${meta.file_name || "unknown"}
MIME type: ${meta.mime_type || "unknown"}
Size: ${meta.file_size || 0} bytes
Existing user category: ${meta.existing_category || "none"}
Upload date: ${meta.upload_date || "unknown"}

${contextBlock(payload)}

Return a structured classification.`;

  const tool: ProviderTool = {
    type: "function",
    function: {
      name: "classify_document",
      description: "Return a document classification suggestion.",
      parameters: {
        type: "object",
        properties: {
          suggested_category: {
            type: "string",
            description: "One of: identity, testament, mandate, insurance, banking, investments, property, vehicles, debts, taxes, medical, wishes, contracts, subscriptions, digital_assets, funeral, other",
          },
          confidence: { type: "number", description: "Confidence score between 0 and 1" },
          reason: { type: "string" },
          recommended_next_steps: {
            type: "array",
            items: { type: "string" },
          },
          sensitive_data_warning: { type: "boolean" },
          professional_review_recommended: { type: "boolean" },
        },
        required: [
          "suggested_category", "confidence", "reason",
          "recommended_next_steps", "sensitive_data_warning",
          "professional_review_recommended",
        ],
      },
      },
    },
  };

  const { toolCallArgs } = await callProvider({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    tools: [tool],
    toolChoice: { type: "function", function: { name: "classify_document" } },
  });

  if (!toolCallArgs) throw new Error("classification_failed");
  return toolCallArgs;
}

async function generateChecklist(payload: any) {
  const userPrompt = `Generate a personalized estate & family preparation checklist.
${contextBlock(payload)}

Return 8-15 practical checklist items grouped into the standard sections.`;

  const tool: ProviderTool = {
    type: "function",
    function: {
      name: "generate_checklist",
      description: "Return a structured preparation checklist.",
      parameters: {
        type: "object",
        properties: {
          intro: { type: "string", description: "Short reassuring intro (2-3 sentences)." },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                section: {
                  type: "string",
                  description: "One of: identity_civil, legal_estate, financial_insurance, digital_legacy, memories_messages, people_to_contact, professional_review",
                },
                professional_review_recommended: { type: "boolean" },
              },
              required: ["title", "description", "section", "professional_review_recommended"],
            },
          },
        },
        required: ["intro", "items"],
        additionalProperties: false,
      },
    },
  };

  const { toolCallArgs } = await callProvider({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    tools: [tool],
    toolChoice: { type: "function", function: { name: "generate_checklist" } },
  });

  if (!toolCallArgs) throw new Error("checklist_failed");
  return toolCallArgs;
}

async function chatGuidance(payload: any) {
  const messages: ProviderMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextBlock(payload) },
  ];

  // Optional prior conversation turns
  if (Array.isArray(payload.history)) {
    for (const m of payload.history.slice(-10)) {
      if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
        messages.push({ role: m.role, content: m.content });
      }
    }
  }
  messages.push({ role: "user", content: String(payload.user_question || "").slice(0, 4000) });

  const { content } = await callProvider({ messages });
  if (!content) throw new Error("empty_response");
  return { reply: content };
}

// ─── Main handler ────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { action } = body;

    if (!["classify_document", "generate_checklist", "chat_guidance"].includes(action)) {
      return new Response(JSON.stringify({ error: "invalid_action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: unknown;
    let summary = "";
    try {
      if (action === "classify_document") {
        result = await classifyDocument(body);
        summary = `Classified ${body.document_metadata?.file_name || "document"}`;
      } else if (action === "generate_checklist") {
        result = await generateChecklist(body);
        summary = `Generated checklist (${body.country}/${body.region})`;
      } else {
        result = await chatGuidance(body);
        summary = String(body.user_question || "").slice(0, 200);
      }

      // Best-effort log (non-blocking semantics)
      await supabase.from("ai_interactions_log").insert({
        user_id: userId,
        action_type: action,
        request_summary: summary,
        response_summary: typeof result === "object" ? "ok" : String(result).slice(0, 200),
        success: true,
      });

      return new Response(
        JSON.stringify({ ok: true, provider: PROVIDER, data: result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown_error";
      await supabase.from("ai_interactions_log").insert({
        user_id: userId,
        action_type: action,
        request_summary: summary,
        response_summary: null,
        success: false,
        error_message: msg.slice(0, 500),
      });

      const status = msg === "rate_limited" ? 429 : msg === "payment_required" ? 402 : 500;
      const userMessage =
        msg === "rate_limited"
          ? "Rate limits exceeded, please try again in a moment."
          : msg === "payment_required"
          ? "AI credits exhausted. Please add credits to your workspace."
          : "AI service error. Please try again.";

      return new Response(JSON.stringify({ error: userMessage, code: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("ai-preparation-assistant fatal", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
