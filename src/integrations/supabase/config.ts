const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
export const PRODUCTION_APP_URL = "https://famille-memories-vault.lovable.app";

export const getSafeAppOrigin = () => {
  if (typeof window === "undefined" || !window.location?.origin) return PRODUCTION_APP_URL;

  const { origin, hostname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isLovableInternal = hostname.includes("lovableproject.com") || hostname === "lovable.dev";

  return isLocal && origin ? origin.replace(/\/$/, "") : isLovableInternal ? PRODUCTION_APP_URL : origin.replace(/\/$/, "");
};

export const missingSupabaseEnvVars = [
  !SUPABASE_URL ? "VITE_SUPABASE_URL" : null,
  !SUPABASE_PUBLISHABLE_KEY ? "VITE_SUPABASE_PUBLISHABLE_KEY" : null,
].filter((value): value is string => value !== null);

export const isSupabaseConfigured = missingSupabaseEnvVars.length === 0;

// Use a syntactically valid URL/JWT-shaped key to keep the client import-safe
// when environment variables are missing.
export const resolvedSupabaseUrl = isSupabaseConfigured
  ? SUPABASE_URL
  : "https://placeholder.supabase.co";

export const resolvedSupabasePublishableKey = isSupabaseConfigured
  ? SUPABASE_PUBLISHABLE_KEY
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbm9uIjp0cnVlLCJpc3MiOiJzb2xleGkifQ.invalid-signature";

export const getSupabaseConfigError = () =>
  new Error(
    `Configuration Supabase manquante (${missingSupabaseEnvVars.join(", ")}). Copiez .env.example vers .env et renseignez vos valeurs.`,
  );
