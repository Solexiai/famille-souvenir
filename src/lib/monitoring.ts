import { supabase } from '@/integrations/supabase/client';

export function setupGlobalMonitoring() {
  window.addEventListener('error', async (event) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      await supabase.functions.invoke('security-alert', {
        body: {
          action: 'log_event',
          event_type: 'frontend_runtime_error',
          user_id: user.id,
          severity: 'high',
          details: {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
      });
    } catch {
      // silent
    }
  });

  window.addEventListener('unhandledrejection', async (event) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      await supabase.functions.invoke('security-alert', {
        body: {
          action: 'log_event',
          event_type: 'frontend_unhandled_rejection',
          user_id: user.id,
          severity: 'high',
          details: {
            reason: String(event.reason),
          },
        },
      });
    } catch {
      // silent
    }
  });
}
