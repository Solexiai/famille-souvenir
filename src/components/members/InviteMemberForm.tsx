import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, UserPlus, Copy, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import type { AppRole } from '@/types/database';
import { sendInvitationEmail } from '@/lib/invitation-email';
import { useLocale } from '@/contexts/LocaleContext';

interface Props {
  circleId: string;
  userId: string;
  onInviteSent: () => void;
}

export const InviteMemberForm: React.FC<Props> = ({ circleId, userId, onInviteSent }) => {
  const { t } = useLocale();

  const inviteSchema = useMemo(() => z.object({
    firstName: z.string().trim().min(1, t.invite_validation_first).max(50),
    lastName: z.string().trim().min(1, t.invite_validation_last).max(50),
    email: z.string().trim().email(t.invite_validation_email),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
    city: z.string().trim().max(100).optional().or(z.literal('')),
    relationshipLabel: z.string().trim().max(100).optional().or(z.literal('')),
    invitationMessage: z.string().trim().max(500).optional().or(z.literal('')),
  }), [t]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [relationshipLabel, setRelationshipLabel] = useState('');
  const [role, setRole] = useState<AppRole>('family_member');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [inviting, setInviting] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = inviteSchema.safeParse({ firstName, lastName, email, phone, city, relationshipLabel, invitationMessage });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setInviting(true);
    setLastInviteLink(null);

    const normalizedEmailForProfile = result.data.email.toLowerCase().trim();
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', normalizedEmailForProfile)
      .maybeSingle();

    if (existingProfile) {
      const { data: existingMember } = await supabase
        .from('circle_members')
        .select('id')
        .eq('circle_id', circleId)
        .eq('user_id', existingProfile.user_id)
        .maybeSingle();

      if (existingMember) {
        toast.error(t.invite_already_member);
        setInviting(false);
        return;
      }
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();
    const { data: existingInvitations } = await supabase
      .from('invitations')
      .select('id, status')
      .eq('circle_id', circleId)
      .eq('email', normalizedEmail);

    const activeInvitation = existingInvitations?.find(
      inv => inv.status === 'pending' || inv.status === 'accepted'
    );

    if (activeInvitation) {
      toast.error(activeInvitation.status === 'accepted' ? t.invite_already_accepted_member : t.invite_already_pending);
      setInviting(false);
      return;
    }

    const { data: inserted, error } = await supabase.from('invitations').insert({
      circle_id: circleId,
      email: normalizedEmail,
      role,
      invited_by: userId,
      first_name: result.data.firstName,
      last_name: result.data.lastName,
      phone: result.data.phone || '',
      city: result.data.city || '',
      relationship_label: result.data.relationshipLabel || '',
      invitation_message: result.data.invitationMessage || '',
    }).select('token').single();

    if (error) {
      toast.error(t.invite_error);
    } else {
      const emailResult = await sendInvitationEmail({
        circleId,
        userId,
        invitation: {
          token: inserted.token,
          email: result.data.email,
          role,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          invitationMessage: result.data.invitationMessage || '',
        },
      });

      setLastInviteLink(emailResult.link);

      await supabase.from('audit_logs').insert({
        user_id: userId,
        circle_id: circleId,
        action: 'invitation_sent',
        details: {
          email: result.data.email,
          role,
          name: `${result.data.firstName} ${result.data.lastName}`,
          email_delivery: emailResult.ok ? 'sent' : 'failed',
          email_error: emailResult.error || null,
        },
      });

      if (emailResult.ok) {
        toast.success(t.invite_sent_to.replace('{name}', `${result.data.firstName} ${result.data.lastName}`));
      } else {
        toast.error(`${t.invite_email_failed} ${emailResult.error || ''}`.trim());
      }

      setFirstName(''); setLastName(''); setEmail('');
      setPhone(''); setCity(''); setRelationshipLabel('');
      setInvitationMessage('');
      onInviteSent();
    }
    setInviting(false);
  };

  const copyLink = () => {
    if (lastInviteLink) {
      navigator.clipboard.writeText(lastInviteLink);
      setLinkCopied(true);
      toast.success(t.invite_link_copied);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-accent" />
          {t.invite_title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invFirstName">{t.invite_first_name}</Label>
              <Input id="invFirstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invLastName">{t.invite_last_name}</Label>
              <Input id="invLastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invEmail">{t.invite_email}</Label>
            <Input id="invEmail" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invPhone">{t.invite_phone}</Label>
              <Input id="invPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invCity">{t.invite_city}</Label>
              <Input id="invCity" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invRelation">{t.invite_relationship}</Label>
              <Input id="invRelation" placeholder={t.invite_relationship_placeholder} value={relationshipLabel} onChange={(e) => setRelationshipLabel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.invite_role}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family_manager">{t.invite_role_manager}</SelectItem>
                  <SelectItem value="family_member">{t.invite_role_member}</SelectItem>
                  <SelectItem value="heir">{t.invite_role_heir}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invMessage">{t.invite_message}</Label>
            <Textarea id="invMessage" placeholder={t.invite_message_placeholder} value={invitationMessage} onChange={(e) => setInvitationMessage(e.target.value)} rows={3} />
          </div>
          <Button type="submit" disabled={inviting} className="w-full">
            {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.invite_submit}
          </Button>

          {lastInviteLink && (
            <Alert className="border-accent/30 bg-accent/5">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="space-y-2">
                <p className="text-sm font-medium text-foreground">{t.invite_success}</p>
                <p className="text-xs text-muted-foreground">{t.invite_success_desc}</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-secondary rounded px-2 py-1.5 truncate">{lastInviteLink}</code>
                  <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                    {linkCopied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
