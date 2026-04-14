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
    const handleCallback = async () => {
      try {
        // Supabase exchanges the hash fragment for a session automatically
        // We just need to wait for the session to be available
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // Try to exchange hash params if present (e.g., from email confirmation link)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { error: setError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setError) {
              throw new Error('Impossible de restaurer la session : ' + setError.message);
            }
          } else {
            // No session and no hash tokens - wait briefly for onAuthStateChange
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

        // Session is now available - check for pending invitation token
        const invitationToken = localStorage.getItem(INVITATION_TOKEN_KEY);

        if (invitationToken) {
          setStatus('accepting');

          const { data, error: fnError } = await supabase.functions.invoke('manage-invitation', {
            body: { action: 'accept', token: invitationToken },
          });

          if (fnError || !data?.success) {
            const msg = data?.error || 'Erreur lors de l\'acceptation de l\'invitation';
            // Clean up token even on error to avoid loops
            localStorage.removeItem(INVITATION_TOKEN_KEY);
            
            // Still redirect to dashboard - account is confirmed
            setStatus('error');
            setErrorMessage(msg);
            toast.error(msg);
            setTimeout(() => navigate('/dashboard'), 3000);
            return;
          }

          // Success - clean up and redirect
          localStorage.removeItem(INVITATION_TOKEN_KEY);
          setStatus('success');
          toast.success(data.message || 'Vous avez rejoint le cercle avec succès !');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          // No pending invitation - just redirect to dashboard
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        localStorage.removeItem(INVITATION_TOKEN_KEY);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erreur inattendue');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
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
