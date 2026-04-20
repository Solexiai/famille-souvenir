import React from 'react';
import { isSupabaseConfigured } from '@/integrations/supabase/client';

export const SupabaseConfigBanner: React.FC = () => {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.92)',
        color: '#f8fafc',
        padding: '1.5rem',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 12,
          padding: '1.75rem',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 600 }}>
          Configuration Supabase manquante
        </h1>
        <p style={{ marginTop: '0.75rem', lineHeight: 1.55, color: '#cbd5f5' }}>
          L&apos;application ne peut pas démarrer car les variables
          d&apos;environnement Supabase ne sont pas définies.
        </p>
        <ol style={{ marginTop: '1rem', paddingLeft: '1.1rem', color: '#e2e8f0', lineHeight: 1.6 }}>
          <li>
            Copie <code>.env.example</code> vers <code>.env.local</code>.
          </li>
          <li>
            Renseigne <code>VITE_SUPABASE_URL</code> et{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.
          </li>
          <li>Redémarre le serveur de développement (<code>npm run dev</code>).</li>
        </ol>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          Ces valeurs proviennent de ton projet Supabase (Project Settings → API).
        </p>
      </div>
    </div>
  );
};

export default SupabaseConfigBanner;
