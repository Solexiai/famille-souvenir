import * as React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { createClient } from "npm:@supabase/supabase-js@2";
import { TEMPLATES } from "../_shared/transactional-email-templates/registry.ts";

const SITE_NAME = "Famille Souvenir";
const SENDER_DOMAIN = "updates.solexi.ai";
const FROM_EMAIL = `noreply@${SENDER_DOMAIN}`;
// Keep direct Resend API usage here: connector-gateway auth caused
// "Unsupported JWT algorithm ES256" in invitation email sends.
const RESEND_API_URL = "https://api.resend.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type TemplateData = Record<string, unknown>;
type SendTransactionalEmailRequestBody = {
  templateName?: string;
  template_name?: string;
  recipientEmail?: string;
  recipient_email?: string;
  idempotencyKey?: string;
  idempotency_key?: string;
  templateData?: TemplateData;
};

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeOrigin(value: string | null): string | null {
  return value ? value.replace(/\/$/, "") : null;
}

function resolveSiteOrigin(req: Request, templateData: TemplateData): string | null {
  const requestOrigin = normalizeOrigin(req.headers.get("origin"));
  if (requestOrigin) return requestOrigin;

  const acceptUrl = typeof templateData.acceptUrl === "string" ? templateData.acceptUrl : null;
  if (!acceptUrl) return null;

  try {
    return new URL(acceptUrl).origin;
  } catch {
    return null;
  }
}

function buildUnsubscribeFooter(unsubscribeUrl: string): string {
  return `
    <div style="padding:24px 32px 32px;color:#6b7280;font-size:12px;line-height:1.6;font-family:Georgia, serif;text-align:center;">
      <p style="margin:0 0 8px;">Vous recevez ce courriel parce qu'une invitation vous a été envoyée depuis ${SITE_NAME}.</p>
      <p style="margin:0;">
        Si vous ne souhaitez plus recevoir ces courriels, <a href="${unsubscribeUrl}" style="color:#1f3b6d;text-decoration:underline;">désabonnez-vous ici</a>.
      </p>
    </div>
  `;
}

Deno.serve(async (req) => {
  console.log("[send-transactional-email] start");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  console.log("[send-transactional-email] env loaded");

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!resendApiKey) {
    console.error("Missing RESEND_API_KEY");
    return new Response(JSON.stringify({ error: "Email provider not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let templateName: string;
  let recipientEmail: string;
  let idempotencyKey: string;
  let messageId: string;
  let templateData: TemplateData = {};

  try {
    const body = (await req.json()) as SendTransactionalEmailRequestBody;
    console.log("[send-transactional-email] body parsed");
    templateName = body.templateName || body.template_name;
    recipientEmail = body.recipientEmail || body.recipient_email;
    messageId = crypto.randomUUID();
    idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId;
    if (body.templateData && typeof body.templateData === "object") {
      templateData = body.templateData;
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!templateName) {
    return new Response(JSON.stringify({ error: "templateName is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const template = TEMPLATES[templateName];
  if (!template) {
    console.error("Template not found in registry", { templateName });
    return new Response(
      JSON.stringify({
        error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`,
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  console.log("[send-transactional-email] template resolved", templateName);

  const effectiveRecipient = template.to || recipientEmail;
  if (!effectiveRecipient) {
    return new Response(JSON.stringify({ error: "recipientEmail is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log("[send-transactional-email] supabase client created");

  const { data: suppressed, error: suppressionError } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", effectiveRecipient.toLowerCase())
    .maybeSingle();

  if (suppressionError) {
    console.error("Suppression check failed", { error: suppressionError });
    return new Response(JSON.stringify({ error: "Failed to verify suppression status" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "suppressed",
    });

    return new Response(JSON.stringify({ success: false, reason: "email_suppressed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const normalizedEmail = effectiveRecipient.toLowerCase();
  let unsubscribeToken: string;

  const { data: existingToken, error: tokenLookupError } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (tokenLookupError) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: "Failed to look up unsubscribe token",
    });

    return new Response(JSON.stringify({ error: "Failed to prepare email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    unsubscribeToken = generateToken();

    const { error: tokenError } = await supabase
      .from("email_unsubscribe_tokens")
      .upsert({ token: unsubscribeToken, email: normalizedEmail }, { onConflict: "email", ignoreDuplicates: true });

    if (tokenError) {
      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: "failed",
        error_message: "Failed to create unsubscribe token",
      });

      return new Response(JSON.stringify({ error: "Failed to prepare email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: storedToken, error: reReadError } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (reReadError || !storedToken) {
      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: "failed",
        error_message: "Failed to confirm unsubscribe token storage",
      });

      return new Response(JSON.stringify({ error: "Failed to prepare email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    unsubscribeToken = storedToken.token;
  } else {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "suppressed",
      error_message: "Unsubscribe token used but email missing from suppressed list",
    });

    return new Response(JSON.stringify({ success: false, reason: "email_suppressed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const siteOrigin = resolveSiteOrigin(req, templateData);
  const unsubscribeUrl = siteOrigin ? `${siteOrigin}/unsubscribe?token=${unsubscribeToken}` : null;

  const renderedHtml = await renderAsync(React.createElement(template.component, templateData));
  const renderedPlainText = await renderAsync(React.createElement(template.component, templateData), {
    plainText: true,
  });

  const html = unsubscribeUrl ? `${renderedHtml}${buildUnsubscribeFooter(unsubscribeUrl)}` : renderedHtml;
  const plainText = unsubscribeUrl ? `${renderedPlainText}\n\nSe désabonner: ${unsubscribeUrl}` : renderedPlainText;

  const resolvedSubject = typeof template.subject === "function" ? template.subject(templateData) : template.subject;

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
    metadata: { idempotencyKey, provider: "resend", from: FROM_EMAIL },
  });

  try {
    const resendPayload: Record<string, unknown> = {
      from: `${SITE_NAME} <${FROM_EMAIL}>`,
      to: [effectiveRecipient],
      subject: resolvedSubject,
      html,
      text: plainText,
    };

    if (unsubscribeUrl) {
      resendPayload.headers = {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      };
    }

    console.log("[send-transactional-email] before resend fetch");
    const resendResponse = await fetch(`${RESEND_API_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(resendPayload),
    });
    console.log("[send-transactional-email] after resend fetch", resendResponse.status);

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      const providerMessage =
        (typeof resendData?.message === "string" && resendData.message) ||
        (typeof resendData?.error === "string" && resendData.error) ||
        "Failed to send email";

      await supabase.from("email_send_log").insert({
        message_id: messageId,
        template_name: templateName,
        recipient_email: effectiveRecipient,
        status: "failed",
        error_message: `Resend error ${resendResponse.status}: ${providerMessage}`,
        metadata: resendData,
      });

      return new Response(JSON.stringify({ error: providerMessage, details: resendData }), {
        status: resendResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "sent",
      metadata: resendData,
    });

    return new Response(JSON.stringify({ success: true, sent: true, resendId: resendData?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[send-transactional-email] fatal error", err);
    const errorMessage = err instanceof Error ? err.message : String(err);

    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: `Send exception: ${errorMessage}`,
    });

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
