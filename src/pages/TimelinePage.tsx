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
import { Loader2, Plus, GitBranch, Calendar, Trash2, Edit3, Heart, Baby, GraduationCap, Home, Plane, Star, Image as ImageIcon, Mic, Video, FileText, Sparkles } from 'lucide-react';
import type { FamilyCircle, MemoryType } from '@/types/database';
import { z } from 'zod';
import { useLocale } from '@/contexts/LocaleContext';
import { useMemoriesCopy } from '@/lib/memories-i18n';
import exampleTimeline from '@/assets/example-timeline.png';

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

const MEMORY_ICON: Record<MemoryType, React.FC<{ className?: string }>> = {
  photo: ImageIcon, video: Video, audio: Mic, text: FileText,
};

const TimelinePage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLocale();
  const c = useMemoriesCopy(lang);

  const CATEGORY_OPTIONS = useMemo(() => [
    { value: 'birth', label: c.tl_cat_birth, Icon: Baby, color: 'bg-[hsl(355_70%_94%)] text-[hsl(355_60%_55%)]' },
    { value: 'wedding', label: c.tl_cat_wedding, Icon: Heart, color: 'bg-[hsl(15_55%_90%)] text-[hsl(15_60%_50%)]' },
    { value: 'graduation', label: c.tl_cat_graduation, Icon: GraduationCap, color: 'bg-[hsl(220_45%_92%)] text-[hsl(220_45%_40%)]' },
    { value: 'home', label: c.tl_cat_home, Icon: Home, color: 'bg-[hsl(140_30%_88%)] text-[hsl(140_35%_35%)]' },
    { value: 'travel', label: c.tl_cat_travel, Icon: Plane, color: 'bg-[hsl(35_60%_92%)] text-[hsl(35_70%_45%)]' },
    { value: 'milestone', label: c.tl_cat_milestone, Icon: Star, color: 'bg-[hsl(270_30%_92%)] text-[hsl(270_35%_45%)]' },
  ], [c]);

  const eventSchema = z.object({
    title: z.string().trim().min(2, c.tl_validation_title).max(150),
    event_date: z.string().min(1, c.tl_validation_date),
  });

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
    const cc = circles[0] as FamilyCircle;
    setCircle(cc);
    const [{ data: ev }, { data: mem }] = await Promise.all([
      supabase.from('timeline_events' as any).select('*').eq('circle_id', cc.id).order('event_date', { ascending: false }),
      supabase.from('memories').select('id, title, caption, event_date, type').eq('circle_id', cc.id).not('event_date', 'is', null).order('event_date', { ascending: false }),
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
    if (!confirm(c.tl_confirm_delete)) return;
    const { error } = await supabase.from('timeline_events' as any).delete().eq('id', id);
    if (error) { toast.error(c.tl_delete_error); return; }
    toast.success(c.tl_deleted);
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

    if (error) { toast.error(c.tl_save_error); setSaving(false); return; }
    toast.success(editingId ? c.tl_saved_updated : c.tl_saved_added);
    resetForm();
    setDialogOpen(false);
    setSaving(false);
    loadData();
  };

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
    return d.toLocaleDateString(c.common_locale, { day: 'numeric', month: 'long' });
  };

  const getCategory = (cat: string) => CATEGORY_OPTIONS.find(co => co.value === cat) || CATEGORY_OPTIONS[5];

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  }

  if (!circle) {
    return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">{c.must_create_circle}</p><Button className="mt-4" onClick={() => window.location.href='/circle'}>{c.create_circle}</Button></div></AppLayout>;
  }

  const totalItems = events.length + datedMemories.length;
  const evLabel = events.length === 1 ? c.tl_count_events_one : c.tl_count_events_many;
  const memLabel = datedMemories.length === 1 ? c.tl_count_dated_one : c.tl_count_dated_many;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(210_20%_88%)]">
              <GitBranch className="h-6 w-6 text-[hsl(210_25%_40%)]" />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground tracking-tight">{c.tl_title}</h1>
              <p className="text-muted-foreground text-base mt-1">{c.tl_subtitle}</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 rounded-xl shadow-md"><Plus className="h-5 w-5" />{c.tl_new}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle className="font-heading">{editingId ? c.tl_edit_title : c.tl_add_title}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{c.tl_event_title_label} *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={c.tl_event_title_placeholder} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">{c.tl_date} *</Label>
                    <Input id="event_date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{c.tl_category}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORY_OPTIONS.map(co => <SelectItem key={co.value} value={co.value}>{co.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{c.tl_description}</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={c.tl_description_placeholder} />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editingId ? c.common_save : c.common_add}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {totalItems > 0 && (
          <div className="text-sm text-muted-foreground">
            {events.length} {evLabel} · {datedMemories.length} {memLabel}
          </div>
        )}

        {totalItems === 0 ? (
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="py-12 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(210_20%_88%)] mx-auto">
                  <GitBranch className="h-8 w-8 text-[hsl(210_25%_40%)]" />
                </div>
                <h2 className="font-heading text-xl text-foreground">{c.tl_empty_title}</h2>
                <p className="text-muted-foreground max-w-md mx-auto">{c.tl_empty_desc}</p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{c.tl_add_first}</Button>
              </CardContent>
            </Card>

            <Card className="shadow-card overflow-hidden border-accent/30">
              <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent px-6 py-4 border-b border-accent/20 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{c.tl_example_title}</h3>
                  <p className="text-sm text-muted-foreground">{c.tl_example_desc}</p>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-muted/20">
                <img
                  src={exampleTimeline}
                  alt={c.tl_example_alt}
                  className="w-full h-auto rounded-lg border border-border shadow-sm"
                  loading="lazy"
                />
              </div>
            </Card>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/40 via-border to-transparent md:-translate-x-px" aria-hidden />

            <div className="space-y-12">
              {grouped.map(([year, items]) => (
                <div key={year} className="relative">
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
                          <div className="absolute left-4 md:left-1/2 top-5 -translate-x-1/2 z-10">
                            <div className={`h-4 w-4 rounded-full border-2 border-card shadow ${colorClass.split(' ')[0]}`} />
                          </div>

                          <div className={`pl-12 md:pl-0 ${isLeft ? 'md:col-start-1 md:pr-8 md:text-right' : 'md:col-start-2 md:pl-8'}`}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow group">
                              <CardContent className="p-5 space-y-2">
                                <div className={`flex items-center gap-2 ${isLeft ? 'md:justify-end' : ''}`}>
                                  <Badge className={colorClass} variant="secondary">
                                    <Icon className="h-3 w-3 mr-1" />
                                    {isEvent ? cat!.label : c.tl_memory_badge}
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
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item as TimelineEvent)} aria-label={c.common_edit}><Edit3 className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)} aria-label={c.common_delete}><Trash2 className="h-3.5 w-3.5" /></Button>
                                  </div>
                                )}
                                {!isEvent && (
                                  <button onClick={() => window.location.href = '/memories'} className={`text-xs text-accent hover:underline pt-1 ${isLeft ? 'md:block md:text-right' : ''}`}>
                                    {c.tl_view_memory}
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
