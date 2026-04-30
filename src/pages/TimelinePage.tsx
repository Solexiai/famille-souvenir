import React, { useEffect, useMemo, useState } from 'react';
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
import { Loader2, Plus, GitBranch, Calendar, Trash2, Edit3, Heart, Baby, GraduationCap, Home, Plane, Star, Image as ImageIcon, Mic, Video, FileText } from 'lucide-react';
import type { FamilyCircle, MemoryType } from '@/types/database';
import { z } from 'zod';

interface TimelineEvent {
  id: string;
  circle_id: string;
  author_id: string;
  title: string;
  description: string | null;
  event_date: string;
  category: string;
  related_memory_id: string | null;
  source: 'event';
}

interface MemoryWithDate {
  id: string;
  title: string | null;
  caption: string;
  event_date: string;
  type: MemoryType;
  source: 'memory';
}

type TimelineItem = TimelineEvent | MemoryWithDate;

const CATEGORY_OPTIONS = [
  { value: 'birth', label: 'Naissance', Icon: Baby, color: 'bg-[hsl(355_70%_94%)] text-[hsl(355_60%_55%)]' },
  { value: 'wedding', label: 'Mariage', Icon: Heart, color: 'bg-[hsl(15_55%_90%)] text-[hsl(15_60%_50%)]' },
  { value: 'graduation', label: 'Diplôme', Icon: GraduationCap, color: 'bg-[hsl(220_45%_92%)] text-[hsl(220_45%_40%)]' },
  { value: 'home', label: 'Nouvelle maison', Icon: Home, color: 'bg-[hsl(140_30%_88%)] text-[hsl(140_35%_35%)]' },
  { value: 'travel', label: 'Voyage', Icon: Plane, color: 'bg-[hsl(35_60%_92%)] text-[hsl(35_70%_45%)]' },
  { value: 'milestone', label: 'Moment marquant', Icon: Star, color: 'bg-[hsl(270_30%_92%)] text-[hsl(270_35%_45%)]' },
];

const MEMORY_ICON: Record<MemoryType, React.FC<{ className?: string }>> = {
  photo: ImageIcon, video: Video, audio: Mic, text: FileText,
};

const eventSchema = z.object({
  title: z.string().trim().min(2, 'Le titre doit faire au moins 2 caractères').max(150),
  event_date: z.string().min(1, 'La date est requise'),
});

const TimelinePage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [datedMemories, setDatedMemories] = useState<MemoryWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('milestone');

  const resetForm = () => {
    setTitle(''); setDescription(''); setEventDate(''); setCategory('milestone'); setEditingId(null);
  };

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);
    const [{ data: ev }, { data: mem }] = await Promise.all([
      supabase.from('timeline_events' as any).select('*').eq('circle_id', c.id).order('event_date', { ascending: false }),
      supabase.from('memories').select('id, title, caption, event_date, type').eq('circle_id', c.id).not('event_date', 'is', null).order('event_date', { ascending: false }),
    ]);
    setEvents(((ev as any) || []).map((e: any) => ({ ...e, source: 'event' })));
    setDatedMemories(((mem as any) || []).map((m: any) => ({ ...m, source: 'memory' })));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleEdit = (e: TimelineEvent) => {
    setEditingId(e.id);
    setTitle(e.title);
    setDescription(e.description || '');
    setEventDate(e.event_date);
    setCategory(e.category);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    const { error } = await supabase.from('timeline_events' as any).delete().eq('id', id);
    if (error) { toast.error('Erreur lors de la suppression'); return; }
    toast.success('Événement supprimé');
    loadData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = eventSchema.safeParse({ title, event_date: eventDate });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    if (!circle || !user) return;
    setSaving(true);

    const payload = {
      circle_id: circle.id,
      author_id: user.id,
      title,
      description: description || null,
      event_date: eventDate,
      category,
    };

    const { error } = editingId
      ? await supabase.from('timeline_events' as any).update(payload).eq('id', editingId)
      : await supabase.from('timeline_events' as any).insert(payload);

    if (error) { toast.error('Erreur lors de l\'enregistrement'); setSaving(false); return; }
    toast.success(editingId ? 'Événement mis à jour' : 'Événement ajouté');
    resetForm();
    setDialogOpen(false);
    setSaving(false);
    loadData();
  };

  // Merge & group by year
  const grouped = useMemo(() => {
    const items: TimelineItem[] = [...events, ...datedMemories];
    items.sort((a, b) => b.event_date.localeCompare(a.event_date));
    const byYear: Record<string, TimelineItem[]> = {};
    items.forEach(it => {
      const y = it.event_date.slice(0, 4);
      if (!byYear[y]) byYear[y] = [];
      byYear[y].push(it);
    });
    return Object.entries(byYear).sort((a, b) => b[0].localeCompare(a[0]));
  }, [events, datedMemories]);

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const getCategory = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat) || CATEGORY_OPTIONS[5];

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  }

  if (!circle) {
    return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">Créez d'abord votre cercle familial.</p><Button className="mt-4" onClick={() => window.location.href='/circle'}>Créer un cercle</Button></div></AppLayout>;
  }

  const totalItems = events.length + datedMemories.length;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(210_20%_88%)]">
              <GitBranch className="h-6 w-6 text-[hsl(210_25%_40%)]" />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground tracking-tight">Ligne du temps familiale</h1>
              <p className="text-muted-foreground text-base mt-1">Les moments marquants, classés chronologiquement.</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 rounded-xl shadow-md"><Plus className="h-5 w-5" />Nouvel événement</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle className="font-heading">{editingId ? 'Modifier l\'événement' : 'Ajouter un événement'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Naissance de Marie" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Date *</Label>
                    <Input id="event_date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Détails, contexte, anecdotes..." />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editingId ? 'Enregistrer' : 'Ajouter'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {totalItems > 0 && (
          <div className="text-sm text-muted-foreground">
            {events.length} événement{events.length > 1 ? 's' : ''} · {datedMemories.length} souvenir{datedMemories.length > 1 ? 's' : ''} daté{datedMemories.length > 1 ? 's' : ''}
          </div>
        )}

        {totalItems === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-16 text-center space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(210_20%_88%)] mx-auto">
                <GitBranch className="h-8 w-8 text-[hsl(210_25%_40%)]" />
              </div>
              <h2 className="font-heading text-xl text-foreground">Votre ligne du temps est vide</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Ajoutez les naissances, mariages, voyages et grands moments de votre famille. Les souvenirs ayant une date apparaîtront aussi automatiquement ici.</p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Ajouter le premier événement</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/40 via-border to-transparent md:-translate-x-px" aria-hidden />

            <div className="space-y-12">
              {grouped.map(([year, items]) => (
                <div key={year} className="relative">
                  {/* Year badge */}
                  <div className="relative flex md:justify-center mb-6">
                    <div className="ml-12 md:ml-0 inline-flex items-center gap-2 rounded-full bg-card border-2 border-accent px-5 py-1.5 shadow-sm">
                      <span className="font-heading text-lg font-semibold text-foreground">{year}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {items.map((item, idx) => {
                      const isEvent = item.source === 'event';
                      const cat = isEvent ? getCategory((item as TimelineEvent).category) : null;
                      const Icon = isEvent ? cat!.Icon : MEMORY_ICON[(item as MemoryWithDate).type];
                      const colorClass = isEvent ? cat!.color : 'bg-muted text-muted-foreground';
                      const itemTitle = isEvent ? (item as TimelineEvent).title : ((item as MemoryWithDate).title || (item as MemoryWithDate).caption);
                      const itemDesc = isEvent ? (item as TimelineEvent).description : ((item as MemoryWithDate).title ? (item as MemoryWithDate).caption : null);
                      const isLeft = idx % 2 === 0;

                      return (
                        <div key={`${item.source}-${item.id}`} className={`relative md:grid md:grid-cols-2 md:gap-8 items-start`}>
                          {/* Dot on line */}
                          <div className="absolute left-4 md:left-1/2 top-5 -translate-x-1/2 z-10">
                            <div className={`h-4 w-4 rounded-full border-2 border-card shadow ${colorClass.split(' ')[0]}`} />
                          </div>

                          {/* Card */}
                          <div className={`pl-12 md:pl-0 ${isLeft ? 'md:col-start-1 md:pr-8 md:text-right' : 'md:col-start-2 md:pl-8'}`}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow group">
                              <CardContent className="p-5 space-y-2">
                                <div className={`flex items-center gap-2 ${isLeft ? 'md:justify-end' : ''}`}>
                                  <Badge className={colorClass} variant="secondary">
                                    <Icon className="h-3 w-3 mr-1" />
                                    {isEvent ? cat!.label : 'Souvenir'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(item.event_date)}
                                  </span>
                                </div>
                                <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">{itemTitle}</h3>
                                {itemDesc && <p className="text-sm text-muted-foreground leading-relaxed">{itemDesc}</p>}
                                {isEvent && (
                                  <div className={`flex gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity ${isLeft ? 'md:justify-end' : ''}`}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item as TimelineEvent)}><Edit3 className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                )}
                                {!isEvent && (
                                  <button onClick={() => window.location.href = '/memories'} className={`text-xs text-accent hover:underline pt-1 ${isLeft ? 'md:block md:text-right' : ''}`}>
                                    Voir le souvenir →
                                  </button>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TimelinePage;
