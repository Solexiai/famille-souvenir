import type { FC } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLocale } from '@/contexts/LocaleContext';
import { isSupabaseConfigured, missingSupabaseConfigMessage } from '@/integrations/supabase/client';
import type { SupportedLanguage } from '@/i18n/types';
import { TriangleAlert } from 'lucide-react';

const copyByLanguage: Record<
  SupportedLanguage,
  {
    title: string;
    description: string;
    steps: string[];
  }
> = {
  fr: {
    title: 'Configuration Supabase manquante',
    description:
      "L'application se charge maintenant, mais les fonctions connectées (connexion, données, invitations, stockage) resteront indisponibles tant que Supabase n'est pas configuré.",
    steps: [
      'Copiez .env.example vers .env a la racine du projet.',
      'Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY.',
      'Redemarrer le serveur avec npm run dev.',
    ],
  },
  en: {
    title: 'Missing Supabase configuration',
    description:
      'The app now loads, but connected features such as auth, data, invitations, and storage stay disabled until Supabase is configured.',
    steps: [
      'Copy .env.example to .env at the project root.',
      'Fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
      'Restart the server with npm run dev.',
    ],
  },
  es: {
    title: 'Falta la configuracion de Supabase',
    description:
      'La aplicacion ya carga, pero las funciones conectadas como autenticacion, datos, invitaciones y almacenamiento seguiran desactivadas hasta configurar Supabase.',
    steps: [
      'Copie .env.example a .env en la raiz del proyecto.',
      'Complete VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.',
      'Reinicie el servidor con npm run dev.',
    ],
  },
};

export const SupabaseConfigurationAlert: FC = () => {
  const { lang } = useLocale();

  if (isSupabaseConfigured) {
    return null;
  }

  const copy = copyByLanguage[lang];

  return (
    <div className="border-b border-amber-200 bg-amber-50/70 px-4 py-3">
      <div className="mx-auto max-w-6xl">
        <Alert className="border-amber-300 bg-amber-50 text-amber-950">
          <TriangleAlert className="h-4 w-4 text-amber-700" />
          <AlertTitle>{copy.title}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{copy.description}</p>
            <p className="break-all rounded-md bg-amber-100 px-3 py-2 font-mono text-xs text-amber-900">
              {missingSupabaseConfigMessage}
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              {copy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
