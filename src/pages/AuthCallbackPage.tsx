import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '@/contexts/LocaleContext';

const INVITATION_TOKEN_KEY = 'solexi_invitation_token';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: setError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (setError) throw new Error(t.auth_cb_session_invalid + setError.message);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error(t.auth_cb_session_not_found)), 5000);
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
            const msg = data?.error || t.auth_cb_attach_error;
            setStatus('error');
            setErrorMessage(msg);
            toast.error(msg);
            setTimeout(() => navigate('/dashboard'), 3000);
          } else {
            setStatus('success');
            toast.success(data.message || t.auth_cb_joined);
            setTimeout(() => navigate('/dashboard'), 2000);
          }
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Auth callback error:', err);
        localStorage.removeItem(INVITATION_TOKEN_KEY);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : t.auth_cb_unexpected);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
    return () => { cancelled = true; };
  }, [navigate, t]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">{t.auth_cb_verifying}</p>
            </>
          )}
          {status === 'accepting' && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-muted-foreground">{t.auth_cb_attaching}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-accent" />
              <p className="text-foreground font-medium">{t.auth_cb_joined}</p>
              <p className="text-sm text-muted-foreground">{t.auth_cb_redirecting}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-foreground font-medium">{errorMessage}</p>
              <p className="text-sm text-muted-foreground">{t.auth_cb_redirecting}</p>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                {t.auth_cb_go_dashboard}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
