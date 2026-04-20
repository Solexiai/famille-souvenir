import { describe, expect, it } from 'vitest';

describe('supabase client fallback', () => {
  it('loads even when Supabase env variables are missing', async () => {
    const mod = await import('@/integrations/supabase/client');

    expect(mod.isSupabaseConfigured).toBe(false);
    expect(mod.missingSupabaseConfigMessage).toContain('VITE_SUPABASE_URL');
  });

  it('returns a helpful error instead of throwing', async () => {
    const { supabase, missingSupabaseConfigMessage } = await import('@/integrations/supabase/client');

    const result = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'Password123',
    });

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toBe(missingSupabaseConfigMessage);
  });
});
