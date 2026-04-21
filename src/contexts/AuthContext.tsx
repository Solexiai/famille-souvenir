import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getSupabaseConfigError, isSupabaseConfigured } from '@/integrations/supabase/config';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  mfaRequired: boolean;
  mfaVerified: boolean;
  refreshMfaStatus: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);

  const checkMfaStatus = async () => {
    if (!isSupabaseConfigured) {
      setMfaRequired(false);
      setMfaVerified(false);
      return;
    }

    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) {
      setMfaRequired(false);
      setMfaVerified(false);
      return;
    }
    // nextLevel indicates what level the user SHOULD have
    // currentLevel indicates what level they currently have
    const needsMfa = data.nextLevel === 'aal2';
    const hasMfa = data.currentLevel === 'aal2';
    setMfaRequired(needsMfa && !hasMfa);
    setMfaVerified(hasMfa);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        // Defer MFA check to avoid Supabase client deadlock
        setTimeout(() => checkMfaStatus(), 0);
      } else {
        setMfaRequired(false);
        setMfaVerified(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkMfaStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshMfaStatus = async () => {
    await checkMfaStatus();
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { error: getSupabaseConfigError() };
    }

    const invitationToken = typeof window !== 'undefined'
      ? localStorage.getItem('solexi_invitation_token')
      : null;
    const emailRedirectTo = invitationToken
      ? `${window.location.origin}/auth/callback?invitation_token=${encodeURIComponent(invitationToken)}`
      : `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: getSupabaseConfigError() };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: getSupabaseConfigError() };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      mfaRequired, mfaVerified, refreshMfaStatus,
      signUp, signIn, signOut, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
