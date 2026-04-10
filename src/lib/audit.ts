/**
 * Audit log helper — routes through edge function since audit_logs
 * INSERT is now service_role only.
 */
import { supabase } from '@/integrations/supabase/client';

export async function logAuditEvent(
  action: string,
  circleId: string | null,
  details?: Record<string, unknown>,
) {
  try {
    await supabase.functions.invoke('security-alert', {
      body: {
        action: 'log_event',
        event_type: `audit_${action}`,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        details: { ...details, audit_action: action, circle_id: circleId },
        severity: 'info',
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}
