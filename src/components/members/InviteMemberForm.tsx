import React, { useState } from 'react';
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

const inviteSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est requis').max(50),
  lastName: z.string().trim().min(1, 'Le nom est requis').max(50),
  email: z.string().trim().email('Adresse email invalide'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  relationshipLabel: z.string().trim().max(100).optional().or(z.literal('')),
  invitationMessage: z.string().trim().max(500).optional().or(z.literal('')),
});

interface Props {
  circleId: string;
  userId: string;
  onInviteSent: () => void;
}

export const InviteMemberForm: React.FC<Props> = ({ circleId, userId, onInviteSent }) => {
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

    const { data: inserted, error } = await supabase.from('invitations').insert({
      circle_id: circleId,
      email: result.data.email,
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
      toast.error("Erreur lors de l'envoi de l'invitation.");
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

      // Audit log
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
        toast.success(`Invitation envoyée à ${result.data.firstName} ${result.data.lastName}`);
      } else {
        toast.error(
          `Invitation créée, mais le courriel n'a pas pu être envoyé. Utilisez le lien généré. ${emailResult.error || ''}`.trim()
        );
      }

      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCity('');
      setRelationshipLabel('');
      setInvitationMessage('');
      onInviteSent();
    }
    setInviting(false);
  };

  const copyLink = () => {
    if (lastInviteLink) {
      navigator.clipboard.writeText(lastInviteLink);
      setLinkCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-accent" />
          Inviter un membre
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invFirstName">Prénom</Label>
              <Input id="invFirstName" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invLastName">Nom</Label>
              <Input id="invLastName" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invEmail">Courriel</Label>
            <Input id="invEmail" type="email" placeholder="membre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invPhone">Téléphone</Label>
              <Input id="invPhone" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invCity">Ville</Label>
              <Input id="invCity" placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invRelation">Lien avec la famille</Label>
              <Input id="invRelation" placeholder="Fils, cousine, ami proche…" value={relationshipLabel} onChange={(e) => setRelationshipLabel(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rôle</Label>
              <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family_manager">Gestionnaire</SelectItem>
                  <SelectItem value="family_member">Membre</SelectItem>
                  <SelectItem value="heir">Héritier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invMessage">Message d'invitation (optionnel)</Label>
            <Textarea id="invMessage" placeholder="Un mot personnel pour accompagner l'invitation…" value={invitationMessage} onChange={(e) => setInvitationMessage(e.target.value)} rows={3} />
          </div>
          <Button type="submit" disabled={inviting} className="w-full">
            {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer l'invitation
          </Button>

          {lastInviteLink && (
            <Alert className="border-accent/30 bg-accent/5">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="space-y-2">
                <p className="text-sm font-medium text-foreground">Invitation créée avec succès !</p>
                <p className="text-xs text-muted-foreground">Partagez ce lien avec la personne invitée :</p>
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
