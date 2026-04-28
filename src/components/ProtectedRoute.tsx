import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MfaChallenge } from '@/components/MfaChallenge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, mfaRequired, refreshMfaStatus } = useAuth();
  const location = useLocation();
  const [checkingJurisdiction, setCheckingJurisdiction] = useState(true);
  const [needsJurisdiction, setNeedsJurisdiction] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingJurisdiction(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('country_code')
        .eq('user_id', user.id)
        .maybeSingle();
      if (cancelled) return;
      setNeedsJurisdiction(!data?.country_code);
      setCheckingJurisdiction(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || (user && checkingJurisdiction)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (mfaRequired) {
    return <MfaChallenge onVerified={refreshMfaStatus} />;
  }

  // Gate: first-time users must complete jurisdiction setup before anything else.
  if (needsJurisdiction && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};
