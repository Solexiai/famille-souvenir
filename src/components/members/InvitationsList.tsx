import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCw, XCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Invitation } from '@/types/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.FC<{ className?: string }> }> = {
  pending: { label: 'En attente', variant: 'outline', icon: Clock },
  accepted: { label: 'Acceptée', variant: 'default', icon: CheckCircle },
  declined: { label: 'Déclinée', variant: 'destructive', icon: XCircle },
  expired: { label: 'Expirée', variant: 'secondary', icon: AlertTriangle },
};

interface Props {
  circleId: string;
  userId: string;
  canManage: boolean;
  refreshKey: number;
}

export const InvitationsList: React.FC<Props> = ({ circleId, userId, canManage, refreshKey }) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadInvitations = async () => {
    const { data } = await supabase
      .from('invitations')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false });
    setInvitations((data as Invitation[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadInvitations(); }, [circleId, refreshKey]);

  const handleResend = async (inv: Invitation) => {
    setActionLoading(inv.id);
    const { error } = await supabase
      .from('invitations')
      .update({
        resent_at: new Date().toISOString(),
        resent_count: (inv.resent_count || 0) + 1,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' as const,
      })
      .eq('id', inv.id);

    if (!error) {
      await supabase.from('audit_logs').insert({
        user_id: userId, circle_id: circleId,
        action: 'invitation_resent',
        details: { email: inv.email, invitation_id: inv.id },
      });
      toast.success(`Invitation renvoyée à ${inv.first_name || inv.email}`);
      loadInvitations();
    } else {
      toast.error("Erreur lors du renvoi.");
    }
    setActionLoading(null);
  };

  const handleCancel = async (inv: Invitation) => {
    setActionLoading(inv.id);
    const { error } = await supabase.from('invitations').delete().eq('id', inv.id);

    if (!error) {
      await supabase.from('audit_logs').insert({
        user_id: userId, circle_id: circleId,
        action: 'invitation_cancelled',
        details: { email: inv.email, invitation_id: inv.id },
      });
      toast.success('Invitation annulée.');
      loadInvitations();
    } else {
      toast.error("Erreur lors de l'annulation.");
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Mail className="h-5 w-5 text-accent" />
          Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((inv) => {
          const config = statusConfig[inv.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          const displayName = inv.first_name ? `${inv.first_name} ${inv.last_name}`.trim() : inv.email;
          const isExpired = new Date(inv.expires_at) < new Date() && inv.status === 'pending';
          const effectiveStatus = isExpired ? 'expired' : inv.status;
          const effectiveConfig = statusConfig[effectiveStatus] || config;
          const EffectiveIcon = effectiveConfig.icon;

          return (
            <div key={inv.id} className="rounded-lg border border-border p-3 sm:p-4 space-y-3">
              {/* Top: info + status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground break-all">{inv.email}</p>
                  {inv.relationship_label && (
                    <p className="text-xs text-muted-foreground">{inv.relationship_label}</p>
                  )}
                </div>
                <Badge variant={effectiveConfig.variant} className="flex items-center gap-1 shrink-0 self-start sm:self-center text-xs">
                  <EffectiveIcon className="h-3 w-3" />
                  {effectiveConfig.label}
                </Badge>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Envoyée le {format(new Date(inv.created_at), 'dd MMM yyyy', { locale: fr })}</span>
                {inv.resent_count > 0 && (
                  <span>Renvoyée {inv.resent_count} fois</span>
                )}
              </div>

              {/* Actions */}
              {canManage && (effectiveStatus === 'pending' || effectiveStatus === 'expired') && (
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleResend(inv)}
                    disabled={actionLoading === inv.id}
                  >
                    {actionLoading === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Renvoyer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleCancel(inv)}
                    disabled={actionLoading === inv.id}
                  >
                    <XCircle className="h-3 w-3" />
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
