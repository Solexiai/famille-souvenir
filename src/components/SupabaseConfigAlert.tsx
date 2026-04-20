import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isSupabaseConfigured, missingSupabaseEnvVars } from '@/integrations/supabase/config';

export function SupabaseConfigAlert() {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="border-b border-border bg-amber-50 px-4 py-3 text-amber-900">
      <div className="mx-auto max-w-5xl">
        <Alert className="border-amber-300 bg-amber-100/70">
          <AlertTitle>Configuration requise</AlertTitle>
          <AlertDescription>
            Variables manquantes: <strong>{missingSupabaseEnvVars.join(', ')}</strong>.
            Copiez <code>.env.example</code> vers <code>.env</code> puis renseignez vos clés Supabase.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
