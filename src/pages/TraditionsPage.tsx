import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Sparkles, Calendar, Users, Trash2, Edit3 } from 'lucide-react';
import type { FamilyCircle } from '@/types/database';
import { z } from 'zod';

interface Tradition {
  id: string;
  circle_id: string;
  author_id: string;
  name: string;
  description: string | null;
  category: string;
  recurrence: string;
  month: number | null;
  day: number | null;
  origin_year: number | null;
  participants: string | null;
  rituals: string | null;
  created_at: string;
}

const CATEGORY_OPTIONS = [
  { value: 'celebration', label: 'Célébration', color: 'bg-[hsl(15_55%_90%)] text-[hsl(15_60%_50%)]' },
  { value: 'religious', label: 'Religieuse', color: 'bg-[hsl(270_30%_92%)] text-[hsl(270_35%_45%)]' },
  { value: 'seasonal', label: 'Saisonnière', color: 'bg-[hsl(35_60%_92%)] text-[hsl(35_70%_45%)]' },
  { value: 'culinary', label: 'Culinaire', color: 'bg-[hsl(140_30%_88%)] text-[hsl(140_35%_35%)]' },
  { value: 'cultural', label: 'Culturelle', color: 'bg-[hsl(220_45%_92%)] text-[hsl(220_45%_40%)]' },
  { value: 'other', label: 'Autre', color: 'bg-muted text-muted-foreground' },
];

const RECURRENCE_OPTIONS = [
  { value: 'annual', label: 'Annuelle' },
  { value: 'monthly', label: 'Mensuelle' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'occasional', label: 'Occasionnelle' },
];

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const traditionSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit faire au moins 2 caractères').max(100),
  description: z.string().max(1000).optional(),
});

const TraditionsPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('celebration');
  const [recurrence, setRecurrence] = useState('annual');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [originYear, setOriginYear] = useState<string>('');
  const [participants, setParticipants] = useState('');
  const [rituals, setRituals] = useState('');

  const resetForm = () => {
    setName(''); setDescription(''); setCategory('celebration'); setRecurrence('annual');
    setMonth(''); setDay(''); setOriginYear(''); setParticipants(''); setRituals('');
    setEditingId(null);
  };

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);
    const { data } = await supabase
      .from('traditions' as any)
      .select('*')
      .eq('circle_id', c.id)
      .order('month', { ascending: true, nullsFirst: false });
    setTraditions((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleEdit = (t: Tradition) => {
    setEditingId(t.id);
    setName(t.name);
    setDescription(t.description || '');
    setCategory(t.category);
    setRecurrence(t.recurrence);
    setMonth(t.month?.toString() || '');
    setDay(t.day?.toString() || '');
    setOriginYear(t.origin_year?.toString() || '');
    setParticipants(t.participants || '');
    setRituals(t.rituals || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette tradition ?')) return;
    const { error } = await supabase.from('traditions' as any).delete().eq('id', id);
    if (error) { toast.error('Erreur lors de la suppression'); return; }
    toast.success('Tradition supprimée');
    loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = traditionSchema.safeParse({ name, description });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    if (!circle || !user) return;
    setSaving(true);

    const payload = {
      circle_id: circle.id,
      author_id: user.id,
      name,
      description: description || null,
      category,
      recurrence,
      month: month ? parseInt(month) : null,
      day: day ? parseInt(day) : null,
      origin_year: originYear ? parseInt(originYear) : null,
      participants: participants || null,
      rituals: rituals || null,
    };

    const { error } = editingId
      ? await supabase.from('traditions' as any).update(payload).eq('id', editingId)
      : await supabase.from('traditions' as any).insert(payload);

    if (error) { toast.error('Erreur lors de l\'enregistrement'); setSaving(false); return; }
    toast.success(editingId ? 'Tradition mise à jour' : 'Tradition ajoutée');
    resetForm();
    setDialogOpen(false);
    setSaving(false);
    loadData();
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  }

  if (!circle) {
    return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">Créez d'abord votre cercle familial.</p><Button className="mt-4" onClick={() => window.location.href='/circle'}>Créer un cercle</Button></div></AppLayout>;
  }

  const formatDate = (t: Tradition) => {
    if (!t.month) return t.recurrence === 'annual' ? 'Date à définir' : RECURRENCE_OPTIONS.find(r=>r.value===t.recurrence)?.label;
    const m = MONTHS[t.month - 1];
    return t.day ? `${t.day} ${m}` : m;
  };

  const getCategoryStyle = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat)?.color || 'bg-muted';
  const getCategoryLabel = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat)?.label || cat;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-10">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(15_55%_90%)]">
                <Sparkles className="h-6 w-6 text-[hsl(15_60%_50%)]" />
              </div>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground tracking-tight">Traditions & fêtes</h1>
                <p className="text-muted-foreground text-base mt-1">Rituels, célébrations et coutumes qui unissent votre famille.</p>
              </div>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 rounded-xl shadow-md"><Plus className="h-5 w-5" />Nouvelle tradition</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-heading">{editingId ? 'Modifier la tradition' : 'Ajouter une tradition'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Réveillon de Noël" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Récurrence</Label>
                    <Select value={recurrence} onValueChange={setRecurrence}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RECURRENCE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Mois</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={(i+1).toString()}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jour</Label>
                    <Input type="number" min="1" max="31" value={day} onChange={(e) => setDay(e.target.value)} placeholder="—" />
                  </div>
                  <div className="space-y-2">
                    <Label>Depuis (année)</Label>
                    <Input type="number" min="1800" max="2100" value={originYear} onChange={(e) => setOriginYear(e.target.value)} placeholder="Ex. 1952" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Origine, signification..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">Participants</Label>
                  <Input id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Ex. Toute la famille élargie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rituals">Rituels & coutumes</Label>
                  <Textarea id="rituals" value={rituals} onChange={(e) => setRituals(e.target.value)} rows={3} placeholder="Plats préparés, gestes, chansons..." />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editingId ? 'Enregistrer' : 'Ajouter'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {traditions.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(15_55%_90%)] mx-auto">
                <Sparkles className="h-8 w-8 text-[hsl(15_60%_50%)]" />
              </div>
              <h2 className="font-heading text-xl text-foreground">Aucune tradition enregistrée</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Documentez les fêtes, rituels et coutumes qui font la richesse de votre famille pour les transmettre aux prochaines générations.</p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Ajouter la première tradition</Button>
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {traditions.map(t => (
              <Card key={t.id} className="shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={getCategoryStyle(t.category)} variant="secondary">{getCategoryLabel(t.category)}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">{t.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{formatDate(t)}</span>
                    {t.origin_year && <span className="text-xs">· depuis {t.origin_year}</span>}
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{t.description}</p>}
                  {t.participants && <div className="flex items-start gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{t.participants}</span></div>}
                  {t.rituals && <div className="pt-2 border-t border-border/60"><p className="text-xs uppercase tracking-wide text-muted-foreground/80 mb-1">Rituels</p><p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{t.rituals}</p></div>}
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default TraditionsPage;
