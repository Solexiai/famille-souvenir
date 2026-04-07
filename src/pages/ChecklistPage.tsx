import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, CheckSquare, AlertTriangle } from 'lucide-react';
import type { FamilyCircle, ChecklistItem, ChecklistCategory, ChecklistStatus } from '@/types/database';

const categoryLabels: Record<ChecklistCategory, string> = {
  legal: 'Juridique',
  identity: 'Identité',
  financial: 'Financier',
  insurance: 'Assurances',
  property: 'Immobilier',
  digital_estate: 'Patrimoine numérique',
  final_wishes: 'Dernières volontés',
  contacts: 'Contacts',
  executor_readiness: 'Préparation exécuteur',
};

const statusLabels: Record<ChecklistStatus, string> = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  completed: 'Complet',
  needs_review: 'À vérifier',
  blocked: 'Bloqué',
};

const statusColors: Record<ChecklistStatus, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-800',
  needs_review: 'bg-amber-100 text-amber-800',
  blocked: 'bg-destructive/10 text-destructive',
};

const ChecklistPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChecklistCategory>('legal');
  const [requiresPro, setRequiresPro] = useState(false);

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);
    setIsManager(c.owner_id === user.id);

    const { data } = await supabase.from('checklist_items').select('*').eq('circle_id', c.id).order('category').order('created_at');
    setItems((data as ChecklistItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle || !user || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('checklist_items').insert({
      circle_id: circle.id,
      category,
      title: title.trim(),
      description,
      requires_professional_review: requiresPro,
    });
    if (error) { toast.error('Erreur lors de la création.'); }
    else {
      toast.success('Élément ajouté à la checklist.');
      setTitle(''); setDescription(''); setCategory('legal'); setRequiresPro(false);
      setDialogOpen(false);
      loadData();
    }
    setSaving(false);
  };

  const handleStatusChange = async (itemId: string, newStatus: ChecklistStatus) => {
    const { error } = await supabase.from('checklist_items').update({ status: newStatus }).eq('id', itemId);
    if (error) toast.error('Erreur lors de la mise à jour.');
    else loadData();
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  if (!circle) return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p><Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button></div></AppLayout>;

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'completed').length;
  const needsReview = items.filter(i => i.status === 'needs_review').length;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-accent" />
              Checklist de préparation
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Suivi des éléments essentiels pour la préparation du dossier familial.
            </p>
          </div>
          {isManager && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2"><Plus className="h-4 w-4" />Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Ajouter un élément</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ChecklistCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Localiser le testament" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails, notes..." />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={requiresPro} onCheckedChange={setRequiresPro} />
                    <Label className="text-sm">À revoir avec un professionnel</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Ajouter
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary */}
        {totalItems > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-soft">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{completedItems}/{totalItems}</p>
                <p className="text-xs text-muted-foreground">Complets</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{needsReview}</p>
                <p className="text-xs text-muted-foreground">À vérifier</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-semibold text-foreground">{items.filter(i => i.requires_professional_review).length}</p>
                <p className="text-xs text-muted-foreground">Revue pro requise</p>
              </CardContent>
            </Card>
          </div>
        )}

        {items.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun élément dans la checklist.</p>
              <p className="text-sm text-muted-foreground mt-1">Commencez à préparer votre dossier familial.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, catItems]) => (
              <Card key={cat} className="shadow-soft">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-base">{categoryLabels[cat as ChecklistCategory] || cat}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          {item.requires_professional_review && (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" title="À revoir avec un professionnel" />
                          )}
                        </div>
                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                      </div>
                      {isManager ? (
                        <Select value={item.status} onValueChange={(v) => handleStatusChange(item.id, v as ChecklistStatus)}>
                          <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={`text-xs ${statusColors[item.status]}`}>{statusLabels[item.status]}</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChecklistPage;
