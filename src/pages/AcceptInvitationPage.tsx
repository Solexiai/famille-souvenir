import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, Users, LogIn } from 'lucide-react';

interface InvitationInfo {
  id: string;
  email: string;
  role: string;
  status: string;
  first_name: string;
  last_name: string;
  circle_name: string;
}

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  family_manager: 'Gestionnaire',
  family_member: 'Membre',
  heir: 'Héritier',
  proposed_executor: 'Exécuteur pressenti',
  verified_executor: 'Exécuteur documenté',
};

const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Lien d\'invitation invalide. Aucun jeton fourni.');
      setValidating(false);
      return;
    }

    const validate = async () => {
      const { data, error: fnError } = await supabase.functions.invoke('manage-invitation', {
        body: { action: 'validate', token },
      });

      if (fnError || !data) {
        setError('Impossible de vérifier cette invitation.');
      } else if (!data.valid) {
        setError(
          data.invitation?.status === 'accepted' ? 'Cette invitation a déjà été acceptée.'
          : data.invitation?.status === 'expired' ? 'Cette invitation a expiré.'
          : data.invitation?.status === 'declined' ? 'Cette invitation a été déclinée.'
          : 'Cette invitation n\'est plus valide.'
        );
      } else {
        setInvitation(data.invitation);
      }
      setValidating(false);
    };

    validate();
  }, [token]);

  const handleAccept = async () => {
    if (!token || !user) return;
    setAccepting(true);

    const { data, error: fnError } = await supabase.functions.invoke('manage-invitation', {
      body: { action: 'accept', token },
    });

    if (fnError || !data?.success) {
      const msg = data?.error || 'Erreur lors de l\'acceptation de l\'invitation.';
      setError(msg);
      toast.error(msg);
    } else {
      setSuccess(data.message || 'Vous avez bien rejoint le cercle !');
      toast.success(data.message || 'Vous avez bien rejoint le cercle !');
      // Redirect after delay
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setAccepting(false);
  };

  if (authLoading || validating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Vérification de l'invitation…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-foreground font-medium">{error}</p>
            <Link to="/">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardContent className="py-12 flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-accent" />
            <p className="text-foreground font-medium">{success}</p>
            <p className="text-sm text-muted-foreground">Redirection vers le tableau de bord…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation, not authenticated
  if (!user && invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="font-heading text-xl">Rejoindre le cercle</CardTitle>
            <CardDescription>
              Vous êtes invité(e) à rejoindre <strong>{invitation.circle_name}</strong> en tant que {roleLabels[invitation.role] || invitation.role}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            {invitation.first_name && (
              <p className="text-sm text-muted-foreground">
                Invitation adressée à {invitation.first_name} {invitation.last_name}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Connectez-vous ou créez un compte pour accepter cette invitation.
            </p>
            <div className="flex flex-col gap-2">
              <Link to={`/login?redirect=/invitation/accept?token=${token}`}>
                <Button className="w-full gap-2">
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </Button>
              </Link>
              <Link to={`/signup?redirect=/invitation/accept?token=${token}`}>
                <Button variant="outline" className="w-full">
                  Créer un compte
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation, authenticated
  if (user && invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="h-7 w-7 text-accent" />
            </div>
            <CardTitle className="font-heading text-xl">Rejoindre le cercle</CardTitle>
            <CardDescription>
              Vous êtes invité(e) à rejoindre <strong>{invitation.circle_name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-2 text-sm">
              {invitation.first_name && (
                <p><span className="text-muted-foreground">Destinataire :</span> {invitation.first_name} {invitation.last_name}</p>
              )}
              <p><span className="text-muted-foreground">Rôle :</span> {roleLabels[invitation.role] || invitation.role}</p>
              <p><span className="text-muted-foreground">Cercle :</span> {invitation.circle_name}</p>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button onClick={handleAccept} disabled={accepting} className="w-full">
              {accepting && <Loader2 className="h-4 w-4 animate-spin" />}
              Accepter l'invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AcceptInvitationPage;
