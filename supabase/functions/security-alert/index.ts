import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Security alert edge function.
 * Called by the manage-invitation function or other edge functions
 * to check for suspicious activity and create notifications.
 *
 * Actions:
 * - check_failed_logins: checks if a user has too many failed login attempts
 * - log_event: logs a security event and alerts if threshold exceeded
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, event_type, user_id, ip_address, details, severity } = await req.json();

    if (action === "log_event") {
      // Log the security event
      await supabase.from("security_events").insert({
        event_type: event_type || "unknown",
        severity: severity || "medium",
        ip_address,
        user_id,
        details: details || {},
      });

      // Check thresholds for alerting
      const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
      const { count } = await supabase
        .from("security_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", event_type)
        .gte("created_at", oneHourAgo);

      if (count && count >= 5) {
        // Find circle owners to notify
        if (user_id) {
          const { data: memberships } = await supabase
            .from("circle_members")
            .select("circle_id")
            .eq("user_id", user_id);

          if (memberships) {
            for (const m of memberships) {
              const { data: owners } = await supabase
                .from("circle_members")
                .select("user_id")
                .eq("circle_id", m.circle_id)
                .eq("role", "owner");

              if (owners) {
                for (const owner of owners) {
                  await supabase.from("notifications").insert({
                    user_id: owner.user_id,
                    circle_id: m.circle_id,
                    title: "⚠️ Activité suspecte détectée",
                    body: `${count} événements "${event_type}" détectés dans la dernière heure.`,
                    type: "security_alert",
                    link: "/settings",
                  });
                }
              }
            }
          }
        }

        // Log escalation
        await supabase.from("security_events").insert({
          event_type: "alert_escalated",
          severity: "critical",
          user_id,
          details: {
            original_event: event_type,
            count_in_hour: count,
            ip_address,
          },
        });
      }

      return new Response(JSON.stringify({ logged: true, alert_triggered: (count || 0) >= 5 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("security-alert error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
