import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Users, Shield, Briefcase } from 'lucide-react';
import type { FamilyCircle, GovernanceResponsibility, GovernanceArea, GovernanceStatus, CircleMember } from '@/types/database';

const areaLabels: Record<GovernanceArea, string> = {
  documents: 'Documents',
  legal_follow_up: 'Suivi juridique',
  insurance: 'Assurances',
  finances: 'Finances',
  digital_assets: 'Actifs numériques',
  property: 'Immobilier',
  medical_directives: 'Directives médicales',
  funeral_wishes: 'Volontés funéraires',
  notary_contact: 'Contact notaire',
};

const statusLabels: Record<GovernanceStatus, string> = {
  assigned: 'Assigné',
  in_progress: 'En cours',
  completed: 'Complété',
  needs_attention: 'Attention requise',
};

const statusColors: Record<GovernanceStatus, string> = {
  assigned: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-800',
  needs_attention: 'bg-destructive/10 text-destructive',
};

const GovernancePage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [items, setItems] = useState<GovernanceResponsibility[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<GovernanceArea>('documents');
  const [memberId, setMemberId] = useState('');

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);
    setIsManager(c.owner_id === user.id);

    const [{ data: govData }, { data: memberData }] = await Promise.all([
      supabase.from('governance_responsibilities').select('*').eq('circle_id', c.id).order('created_at', { ascending: false }),
      supabase.from('circle_members').select('*').eq('circle_id', c.id),
    ]);
    setItems((govData as GovernanceResponsibility[]) || []);

    if (memberData) {
      const membersWithProfiles = await Promise.all(
        memberData.map(async (m: any) => {
          const { data: p } = await supabase.from('profiles').select('*').eq('user_id', m.user_id).single();
          return { ...m, profiles: p } as CircleMember;
        })
      );
      setMembers(membersWithProfiles);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle || !user || !memberId) return;
    setSaving(true);
    const { error } = await supabase.from('governance_responsibilities').insert({
      circle_id: circle.id,
      member_id: memberId,
      area,
      title,
      description,
    });
    if (error) { toast.error('Erreur lors de la création.'); }
    else {
      toast.success('Responsabilité ajoutée.');
      setTitle(''); setDescription(''); setArea('documents'); setMemberId('');
      setDialogOpen(false);
      loadData();
    }
    setSaving(false);
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  if (!circle) return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p><Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button></div></AppLayout>;

  const getMemberName = (id: string) => {
    const m = members.find(m => m.user_id === id);
    return m?.profiles?.full_name || m?.profiles?.email || 'Membre';
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6 text-accent" />
              Gouvernance familiale
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Coordination des responsabilités et suivi des domaines importants.
            </p>
          </div>
          {isManager && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2"><Plus className="h-4 w-4" />Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Assigner une responsabilité</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Domaine</Label>
                    <Select value={area} onValueChange={(v) => setArea(v as GovernanceArea)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(areaLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Suivi du notaire" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails de la responsabilité..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsable</Label>
                    <Select value={memberId} onValueChange={setMemberId}>
                      <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                      <SelectContent>
                        {members.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {m.profiles?.full_name || m.profiles?.email || 'Membre'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Assigner
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {items.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune responsabilité assignée.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Organisez la coordination familiale en assignant des responsabilités à chaque membre.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{areaLabels[item.area]}</Badge>
                        <Badge className={`text-xs ${statusColors[item.status]}`}>{statusLabels[item.status]}</Badge>
                        <span className="text-xs text-muted-foreground">
                          <Users className="h-3 w-3 inline mr-1" />
                          {getMemberName(item.member_id)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GovernancePage;
