import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, UserPlus, Shield, Eye, Edit, Crown } from 'lucide-react';
import type { CircleMember, FamilyCircle, AppRole } from '@/types/database';
import { z } from 'zod';

const inviteSchema = z.object({
  firstName: z.string().trim().min(1, 'Le prénom est requis').max(50),
  lastName: z.string().trim().min(1, 'Le nom est requis').max(50),
  email: z.string().trim().email('Adresse email invalide'),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
});

const roleLabels: Record<AppRole, string> = {
  owner: 'Propriétaire',
  family_manager: 'Gestionnaire',
  family_member: 'Membre',
  heir: 'Héritier',
  proposed_executor: 'Exécuteur pressenti',
  verified_executor: 'Exécuteur documenté',
};

const roleIcons: Record<AppRole, React.FC<{ className?: string }>> = {
  owner: Crown,
  family_manager: Shield,
  family_member: Edit,
  heir: Eye,
  proposed_executor: Eye,
  verified_executor: Shield,
};

const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AppRole>('family_member');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    
    const c = circles[0] as FamilyCircle;
    setCircle(c);
    setIsOwner(c.owner_id === user.id);

    const { data: memberData } = await supabase
      .from('circle_members')
      .select('*')
      .eq('circle_id', c.id);
    
    // Load profiles separately for each member
    if (memberData) {
      const membersWithProfiles = await Promise.all(
        memberData.map(async (m) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', m.user_id)
            .single();
          return { ...m, profiles: profileData } as CircleMember;
        })
      );
      setMembers(membersWithProfiles);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = inviteSchema.safeParse({ firstName, lastName, email, phone });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (!circle || !user) return;
    setInviting(true);

    const { error } = await supabase.from('invitations').insert({
      circle_id: circle.id,
      email,
      role,
      invited_by: user.id,
    });

    if (error) {
      toast.error("Erreur lors de l'envoi de l'invitation.");
    } else {
      toast.success(`Invitation envoyée à ${firstName} ${lastName} (${email})`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    }
    setInviting(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  if (!circle) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Membres du cercle</h1>

        {/* Members list */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {members.length} membre{members.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((m) => {
              const RoleIcon = roleIcons[m.role];
              return (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-medium text-secondary-foreground">
                        {(m.profiles?.full_name || m.profiles?.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.profiles?.full_name || m.profiles?.email || 'Membre'}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <RoleIcon className="h-3 w-3" />
                    {roleLabels[m.role]}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Invite form — visible to owner and managers */}
        {isOwner && (
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
                    <Label htmlFor="inviteFirstName">Prénom</Label>
                    <Input
                      id="inviteFirstName"
                      type="text"
                      placeholder="Jean"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inviteLastName">Nom</Label>
                    <Input
                      id="inviteLastName"
                      type="text"
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Adresse email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="membre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invitePhone">Numéro de téléphone</Label>
                  <Input
                    id="invitePhone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family_manager">Gestionnaire</SelectItem>
                      <SelectItem value="family_member">Membre</SelectItem>
                      <SelectItem value="heir">Héritier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={inviting} className="w-full">
                  {inviting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Envoyer l'invitation
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default MembersPage;
