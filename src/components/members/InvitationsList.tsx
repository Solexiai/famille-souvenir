import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCw, XCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Invitation } from '@/types/database';
import { format } from 'date-fns';
import { fr as frLocale, enUS, es as esLocale } from 'date-fns/locale';
import { sendInvitationEmail } from '@/lib/invitation-email';
import { useLocale } from '@/contexts/LocaleContext';

interface Props {
  circleId: string;
  userId: string;
  canManage: boolean;
  refreshKey: number;
}

export const InvitationsList: React.FC<Props> = ({ circleId, userId, canManage, refreshKey }) => {
  const { t, lang } = useLocale();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const dateLocale = lang === 'fr' ? frLocale : lang === 'es' ? esLocale : enUS;

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.FC<{ className?: string }> }> = {
    pending: { label: t.invitations_pending, variant: 'outline', icon: Clock },
    accepted: { label: t.invitations_accepted, variant: 'default', icon: CheckCircle },
    declined: { label: t.invitations_declined, variant: 'destructive', icon: XCircle },
    expired: { label: t.invitations_expired, variant: 'secondary', icon: AlertTriangle },
  };

  const roleLabel = (role: string) => t.member_roles[role] || role;

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
      const emailResult = await sendInvitationEmail({
        circleId, userId,
        invitation: {
          token: inv.token, email: inv.email, role: inv.role,
          firstName: inv.first_name, lastName: inv.last_name,
          invitationMessage: inv.invitation_message,
        },
      });

      await supabase.from('audit_logs').insert({
        user_id: userId, circle_id: circleId,
        action: 'invitation_resent',
        details: {
          email: inv.email, invitation_id: inv.id,
          email_delivery: emailResult.ok ? 'sent' : 'failed',
          email_error: emailResult.error || null,
        },
      });

      if (emailResult.ok) {
        toast.success(t.invite_resent_to.replace('{name}', inv.first_name || inv.email));
      } else {
        toast.error(`${t.invite_resent_failed} ${emailResult.error || ''}`.trim());
      }

      loadInvitations();
    } else {
      toast.error(t.invitations_resend_error);
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
      toast.success(t.invitations_cancelled);
      loadInvitations();
    } else {
      toast.error(t.invitations_cancel_error);
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
          {t.invitations_title} ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((inv) => {
          const config = statusConfig[inv.status] || statusConfig.pending;
          const displayName = inv.first_name ? `${inv.first_name} ${inv.last_name}`.trim() : inv.email;
          const isExpired = new Date(inv.expires_at) < new Date() && inv.status === 'pending';
          const effectiveStatus = isExpired ? 'expired' : inv.status;
          const effectiveConfig = statusConfig[effectiveStatus] || config;
          const EffectiveIcon = effectiveConfig.icon;

          return (
            <div key={inv.id} className="rounded-lg border border-border p-3 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground break-all">{inv.email}</p>
                  {inv.phone && <p className="text-xs text-muted-foreground">📞 {inv.phone}</p>}
                  {inv.city && <p className="text-xs text-muted-foreground">📍 {inv.city}</p>}
                  {inv.relationship_label && <p className="text-xs text-muted-foreground">{inv.relationship_label}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 self-start sm:self-center">
                  <Badge variant="secondary" className="text-xs">{roleLabel(inv.role)}</Badge>
                  <Badge variant={effectiveConfig.variant} className="flex items-center gap-1 text-xs">
                    <EffectiveIcon className="h-3 w-3" />
                    {effectiveConfig.label}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t.invitations_sent_on.replace('{date}', format(new Date(inv.created_at), 'dd MMM yyyy', { locale: dateLocale }))}</span>
                {inv.resent_count > 0 && (
                  <span>{t.invitations_resent.replace('{count}', String(inv.resent_count))}</span>
                )}
              </div>

              {canManage && (effectiveStatus === 'pending' || effectiveStatus === 'expired') && (
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs"
                    onClick={() => handleResend(inv)} disabled={actionLoading === inv.id}>
                    {actionLoading === inv.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {t.invitations_resend}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleCancel(inv)} disabled={actionLoading === inv.id}>
                    <XCircle className="h-3 w-3" />
                    {t.invitations_cancel_btn}
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
