import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const INVITATION_TOKEN_KEY = 'solexi_invitation_token';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        // 1. Recover session from URL hash (email verification redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setError) throw new Error('Session invalide : ' + setError.message);
        } else {
          // No hash tokens — check if session already exists
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Wait briefly for onAuthStateChange
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Session non trouvée')), 5000);
              const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
                if (s) {
                  clearTimeout(timeout);
                  subscription.unsubscribe();
                  resolve();
                }
              });
            });
          }
        }

        if (cancelled) return;

        // 2. Check for pending invitation token (URL query first, then localStorage)
        const urlParams = new URLSearchParams(window.location.search);
        const invitationToken =
          urlParams.get('invitation_token') || localStorage.getItem(INVITATION_TOKEN_KEY);

        if (invitationToken) {
          setStatus('accepting');

          const { data, error: fnError } = await supabase.functions.invoke('manage-invitation', {
            body: { action: 'accept', token: invitationToken },
          });

          localStorage.removeItem(INVITATION_TOKEN_KEY);

          if (cancelled) return;

          if (fnError || !data?.success) {
            const msg = data?.error || 'Erreur lors du rattachement au cercle';
            setStatus('error');
            setErrorMessage(msg);
            toast.error(msg);
            setTimeout(() => navigate('/dashboard'), 3000);
          } else {
            setStatus('success');
            toast.success(data.message || 'Vous avez rejoint le cercle !');
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        } else {
          // No pending invitation — go to dashboard
          navigate('/dashboard');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Auth callback error:', err);
        localStorage.removeItem(INVITATION_TOKEN_KEY);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erreur inattendue');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">Vérification de votre compte…</p>
            </>
          )}
          {status === 'accepting' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">Rattachement au cercle en cours…</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-accent" />
              <p className="text-foreground font-medium">Vous avez rejoint le cercle avec succès !</p>
              <p className="text-sm text-muted-foreground">Redirection en cours…</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-foreground font-medium">{errorMessage}</p>
              <p className="text-sm text-muted-foreground">Redirection en cours…</p>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Aller au tableau de bord
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
