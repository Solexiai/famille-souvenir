import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Users, LogIn } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const INVITATION_TOKEN_KEY = 'solexi_invitation_token';

interface InvitationInfo {
  id: string;
  role: string;
  status: string;
  circle_name: string;
}

const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLocale();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const roleLabel = (role: string) => t.member_roles[role] || role;

  // 1. Persist token to localStorage immediately (survives signup + email verify)
  useEffect(() => {
    if (token) {
      localStorage.setItem(INVITATION_TOKEN_KEY, token);
    }
  }, [token]);

  // 2. Validate the invitation token
  useEffect(() => {
    if (!token) {
      setError(t.accept_invalid_link);
      setValidating(false);
      return;
    }

    const validate = async () => {
      const { data, error: fnError } = await supabase.functions.invoke('manage-invitation', {
        body: { action: 'validate', token },
      });

      if (fnError || !data) {
        setError(t.accept_cannot_verify);
      } else if (!data.valid) {
        setError(
          data.invitation?.status === 'accepted' ? t.accept_already_accepted
          : data.invitation?.status === 'expired' ? t.accept_expired
          : data.invitation?.status === 'declined' ? t.accept_declined
          : t.accept_no_longer_valid
        );
      } else {
        setInvitation(data.invitation);
      }
      setValidating(false);
    };

    validate();
  }, [token]);

  // 3. If user is already logged in, accept the invitation directly
  const handleAccept = async () => {
    if (!token || !user) return;
    setAccepting(true);
    setError(null);

    const { data, error: fnError } = await supabase.functions.invoke('manage-invitation', {
      body: { action: 'accept', token },
    });

    if (fnError || !data?.success) {
      const msg = data?.error || t.accept_error_default;
      setError(msg);
      toast.error(msg);
    } else {
      localStorage.removeItem(INVITATION_TOKEN_KEY);
      setSuccess(data.message || t.accept_success_default);
      toast.success(data.message || t.accept_success_default);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setAccepting(false);
  };

  // Loading state
  if (authLoading || validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4"><LanguageSwitcher variant="compact" /></div>
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">{t.accept_verifying}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error without invitation info
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-foreground font-medium">{error}</p>
            <Link to="/"><Button variant="outline">{t.accept_back_home}</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-accent" />
            <p className="text-foreground font-medium">{success}</p>
            <p className="text-sm text-muted-foreground">{t.accept_redirecting}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in — show login/signup options
  // Token is already saved in localStorage. After login or signup+verify,
  // the invitation will be accepted automatically.
  if (!user && invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="font-heading text-xl">{t.accept_join_circle}</CardTitle>
            <CardDescription
              dangerouslySetInnerHTML={{
                __html: t.accept_invited_to
                  .replace('{circle}', invitation.circle_name)
                  .replace('{role}', roleLabel(invitation.role))
              }}
            />
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{t.accept_login_or_signup}</p>
            <div className="flex flex-col gap-2">
              <Link to="/login">
                <Button className="w-full gap-2"><LogIn className="h-4 w-4" />{t.accept_login}</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="w-full">{t.accept_signup}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in — show accept button
  if (user && invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="font-heading text-xl">{t.accept_join_circle}</CardTitle>
            <CardDescription
              dangerouslySetInnerHTML={{
                __html: t.accept_invited_to
                  .replace('{circle}', invitation.circle_name)
                  .replace('{role}', roleLabel(invitation.role))
              }}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">{t.accept_role} :</span> {roleLabel(invitation.role)}</p>
              <p><span className="text-muted-foreground">{t.accept_circle} :</span> {invitation.circle_name}</p>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button onClick={handleAccept} disabled={accepting} className="w-full">
              {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.accept_btn}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AcceptInvitationPage;
