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
import { Loader2, Plus, Sparkles, Calendar, Users, Trash2, Edit3 } from 'lucide-react';
import type { FamilyCircle } from '@/types/database';
import { z } from 'zod';
import { useLocale } from '@/contexts/LocaleContext';
import { useMemoriesCopy } from '@/lib/memories-i18n';
import exampleTraditions from '@/assets/example-traditions.png';

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

const TraditionsPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLocale();
  const c = useMemoriesCopy(lang);

  const CATEGORY_OPTIONS = useMemo(() => [
    { value: 'celebration', label: c.tr_cat_celebration, color: 'bg-[hsl(15_55%_90%)] text-[hsl(15_60%_50%)]' },
    { value: 'religious', label: c.tr_cat_religious, color: 'bg-[hsl(270_30%_92%)] text-[hsl(270_35%_45%)]' },
    { value: 'seasonal', label: c.tr_cat_seasonal, color: 'bg-[hsl(35_60%_92%)] text-[hsl(35_70%_45%)]' },
    { value: 'culinary', label: c.tr_cat_culinary, color: 'bg-[hsl(140_30%_88%)] text-[hsl(140_35%_35%)]' },
    { value: 'cultural', label: c.tr_cat_cultural, color: 'bg-[hsl(220_45%_92%)] text-[hsl(220_45%_40%)]' },
    { value: 'other', label: c.tr_cat_other, color: 'bg-muted text-muted-foreground' },
  ], [c]);

  const RECURRENCE_OPTIONS = useMemo(() => [
    { value: 'annual', label: c.tr_rec_annual },
    { value: 'monthly', label: c.tr_rec_monthly },
    { value: 'weekly', label: c.tr_rec_weekly },
    { value: 'occasional', label: c.tr_rec_occasional },
  ], [c]);

  const traditionSchema = z.object({
    name: z.string().trim().min(2, c.tr_validation_name).max(100),
    description: z.string().max(1000).optional(),
  });

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
    const cc = circles[0] as FamilyCircle;
    setCircle(cc);
    const { data } = await supabase
      .from('traditions' as any)
      .select('*')
      .eq('circle_id', cc.id)
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
    if (!confirm(c.tr_confirm_delete)) return;
    const { error } = await supabase.from('traditions' as any).delete().eq('id', id);
    if (error) { toast.error(c.tr_delete_error); return; }
    toast.success(c.tr_deleted);
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

    if (error) { toast.error(c.tr_save_error); setSaving(false); return; }
    toast.success(editingId ? c.tr_saved_updated : c.tr_saved_added);
    resetForm();
    setDialogOpen(false);
    setSaving(false);
    loadData();
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  }

  if (!circle) {
    return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">{c.must_create_circle}</p><Button className="mt-4" onClick={() => window.location.href='/circle'}>{c.create_circle}</Button></div></AppLayout>;
  }

  const formatDate = (t: Tradition) => {
    if (!t.month) return t.recurrence === 'annual' ? c.tr_date_tbd : RECURRENCE_OPTIONS.find(r=>r.value===t.recurrence)?.label;
    const m = c.months[t.month - 1];
    return t.day ? `${t.day} ${m}` : m;
  };

  const getCategoryStyle = (cat: string) => CATEGORY_OPTIONS.find(c2 => c2.value === cat)?.color || 'bg-muted';
  const getCategoryLabel = (cat: string) => CATEGORY_OPTIONS.find(c2 => c2.value === cat)?.label || cat;

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
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground tracking-tight">{c.tr_title}</h1>
                <p className="text-muted-foreground text-base mt-1">{c.tr_subtitle}</p>
              </div>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 rounded-xl shadow-md"><Plus className="h-5 w-5" />{c.tr_new}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-heading">{editingId ? c.tr_edit_title : c.tr_add_title}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{c.tr_name} *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={c.tr_name_placeholder} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{c.tr_category}</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORY_OPTIONS.map(co => <SelectItem key={co.value} value={co.value}>{co.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{c.tr_recurrence}</Label>
                    <Select value={recurrence} onValueChange={setRecurrence}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{RECURRENCE_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>{c.tr_month}</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>{c.months.map((m, i) => <SelectItem key={i} value={(i+1).toString()}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{c.tr_day}</Label>
                    <Input type="number" min="1" max="31" value={day} onChange={(e) => setDay(e.target.value)} placeholder="—" />
                  </div>
                  <div className="space-y-2">
                    <Label>{c.tr_origin_year}</Label>
                    <Input type="number" min="1800" max="2100" value={originYear} onChange={(e) => setOriginYear(e.target.value)} placeholder={c.tr_origin_year_placeholder} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{c.tr_description}</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={c.tr_description_placeholder} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">{c.tr_participants}</Label>
                  <Input id="participants" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder={c.tr_participants_placeholder} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rituals">{c.tr_rituals}</Label>
                  <Textarea id="rituals" value={rituals} onChange={(e) => setRituals(e.target.value)} rows={3} placeholder={c.tr_rituals_placeholder} />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editingId ? c.common_save : c.common_add}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {traditions.length === 0 ? (
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="py-12 text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(15_55%_90%)] mx-auto">
                  <Sparkles className="h-8 w-8 text-[hsl(15_60%_50%)]" />
                </div>
                <h2 className="font-heading text-xl text-foreground">{c.tr_empty_title}</h2>
                <p className="text-muted-foreground max-w-md mx-auto">{c.tr_empty_desc}</p>
                <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />{c.tr_add_first}</Button>
              </CardContent>
            </Card>

            <Card className="shadow-card overflow-hidden border-accent/30">
              <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent px-6 py-4 border-b border-accent/20 flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0" />
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{c.tr_example_title}</h3>
                  <p className="text-sm text-muted-foreground">{c.tr_example_desc}</p>
                </div>
              </div>
              <div className="p-4 md:p-6 bg-muted/20">
                <img
                  src={exampleTraditions}
                  alt={c.tr_example_alt}
                  className="w-full h-auto rounded-lg border border-border shadow-sm"
                  loading="lazy"
                />
              </div>
            </Card>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {traditions.map(t => (
              <Card key={t.id} className="shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge className={getCategoryStyle(t.category)} variant="secondary">{getCategoryLabel(t.category)}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(t)} aria-label={c.common_edit}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)} aria-label={c.common_delete}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground leading-snug">{t.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{formatDate(t)}</span>
                    {t.origin_year && <span className="text-xs">· {c.tr_since} {t.origin_year}</span>}
                  </div>
                  {t.description && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{t.description}</p>}
                  {t.participants && <div className="flex items-start gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{t.participants}</span></div>}
                  {t.rituals && <div className="pt-2 border-t border-border/60"><p className="text-xs uppercase tracking-wide text-muted-foreground/80 mb-1">{c.tr_rituals_section}</p><p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{t.rituals}</p></div>}
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
