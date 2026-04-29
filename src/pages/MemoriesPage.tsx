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
import {
  Loader2,
  Plus,
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  ChefHat,
  Mail,
  Sparkles,
  GitBranch,
  Heart,
  Home,
  Users,
  Users2,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MoreHorizontal,
  LayoutGrid,
} from 'lucide-react';
import type { Memory, MemoryType, MemoryVisibility, FamilyCircle } from '@/types/database';
import { z } from 'zod';
import { validateUpload } from '@/lib/upload-validation';
import { prepareImageForUpload, prepareImageThumbnail } from '@/lib/image-preparation';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

const typeIcons: Record<MemoryType, React.FC<{ className?: string }>> = {
  photo: ImageIcon,
  video: Video,
  audio: Mic,
  text: FileText,
};

type MemoryWithMedia = Memory & { mediaSrc?: string };

// Catégories étendues (préparées pour i18n / futures fonctionnalités)
type MemoryCategoryKey =
  | 'recipe'
  | 'story_audio'
  | 'photo_video'
  | 'letter_message'
  | 'tradition'
  | 'timeline_event';

const CATEGORIES: Array<{
  key: MemoryCategoryKey;
  title: string;
  description: string;
  Icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  prefilledType: MemoryType;
}> = [
  {
    key: 'recipe',
    title: 'Recettes familiales',
    description: 'Les plats transmis de génération en génération',
    Icon: ChefHat,
    iconBg: 'bg-[hsl(35_60%_92%)]',
    iconColor: 'text-[hsl(35_70%_45%)]',
    prefilledType: 'text',
  },
  {
    key: 'story_audio',
    title: 'Histoires racontées',
    description: 'Souvenirs audio et anecdotes de vie',
    Icon: Mic,
    iconBg: 'bg-[hsl(220_45%_92%)]',
    iconColor: 'text-[hsl(220_45%_40%)]',
    prefilledType: 'audio',
  },
  {
    key: 'photo_video',
    title: 'Photos & vidéos',
    description: 'Moments précieux à revoir ensemble',
    Icon: ImageIcon,
    iconBg: 'bg-[hsl(140_30%_88%)]',
    iconColor: 'text-[hsl(140_35%_35%)]',
    prefilledType: 'photo',
  },
  {
    key: 'letter_message',
    title: 'Lettres & messages',
    description: 'Mots du cœur à conserver',
    Icon: Mail,
    iconBg: 'bg-[hsl(270_30%_92%)]',
    iconColor: 'text-[hsl(270_35%_45%)]',
    prefilledType: 'text',
  },
  {
    key: 'tradition',
    title: 'Traditions & fêtes',
    description: 'Rituels, célébrations et coutumes',
    Icon: Sparkles,
    iconBg: 'bg-[hsl(15_55%_90%)]',
    iconColor: 'text-[hsl(15_60%_50%)]',
    prefilledType: 'text',
  },
  {
    key: 'timeline_event',
    title: 'Ligne du temps familiale',
    description: 'Moments marquants de la famille',
    Icon: GitBranch,
    iconBg: 'bg-[hsl(210_20%_88%)]',
    iconColor: 'text-[hsl(210_25%_40%)]',
    prefilledType: 'text',
  },
];

const SUGGESTED_COLLECTIONS: Array<{
  title: string;
  Icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}> = [
  { title: 'Recettes de grand-maman', Icon: ChefHat, iconBg: 'bg-[hsl(35_60%_92%)]', iconColor: 'text-[hsl(35_70%_45%)]' },
  { title: 'Naissances et mariages', Icon: Heart, iconBg: 'bg-[hsl(355_70%_94%)]', iconColor: 'text-[hsl(355_60%_55%)]' },
  { title: 'Messages pour plus tard', Icon: Mail, iconBg: 'bg-[hsl(270_30%_92%)]', iconColor: 'text-[hsl(270_35%_45%)]' },
  { title: 'Maison familiale', Icon: Home, iconBg: 'bg-[hsl(140_30%_88%)]', iconColor: 'text-[hsl(140_35%_35%)]' },
];

type FilterKey = 'all' | 'photo' | 'audio' | 'video' | 'text' | 'person' | 'generation';
const FILTERS: Array<{ key: FilterKey; label: string; Icon: React.FC<{ className?: string }> }> = [
  { key: 'all', label: 'Tous', Icon: LayoutGrid },
  { key: 'text', label: 'Recettes', Icon: ChefHat },
  { key: 'audio', label: 'Audio', Icon: Mic },
  { key: 'video', label: 'Vidéo', Icon: Video },
  { key: 'photo', label: 'Documents', Icon: FileText },
  { key: 'person', label: 'Par personne', Icon: Users },
  { key: 'generation', label: 'Par génération', Icon: Users2 },
];

// Exemples de démonstration utilisés quand la base est vide
const DEMO_MEMORIES = [
  {
    id: 'demo-1',
    badge: 'RECETTE',
    badgeIcon: ChefHat,
    title: 'Le gâteau de grand-maman',
    author: 'Marguerite Dupont',
    year: '1968',
    image:
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'demo-2',
    badge: 'AUDIO',
    badgeIcon: Mic,
    title: 'Souvenirs de mon enfance',
    author: 'Jean Dupont',
    year: '1985',
    duration: '15:42',
    image:
      'https://images.unsplash.com/photo-1559131397-f94da358f7ca?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'demo-3',
    badge: 'PHOTO',
    badgeIcon: ImageIcon,
    title: 'Vacances à la mer',
    author: 'Famille Dupont',
    year: '1959',
    image:
      'https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=800&q=80',
  },
];

const resolveMemoryMediaPath = (mediaUrl: string | null): string | null => {
  if (!mediaUrl) return null;
  if (!/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  const bucketMarker = '/memories-media/';
  const markerIndex = mediaUrl.indexOf(bucketMarker);
  if (markerIndex === -1) return null;
  return decodeURIComponent(mediaUrl.slice(markerIndex + bucketMarker.length).split('?')[0]);
};

const MemoriesPage: React.FC = () => {
  const { user } = useAuth();
  const { t, lang } = useLocale();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [memories, setMemories] = useState<MemoryWithMedia[]>([]);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const [caption, setCaption] = useState('');
  const [type, setType] = useState<MemoryType>('text');
  const [visibility, setVisibility] = useState<MemoryVisibility>('circle');
  const [file, setFile] = useState<File | null>(null);

  const memorySchema = z.object({
    caption: z.string().trim().min(1, t.memories_validation_caption).max(500),
    type: z.enum(['photo', 'video', 'audio', 'text']),
    visibility: z.enum(['circle', 'managers', 'private']),
  });

  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES' };

  const loadData = async () => {
    if (!user) return;

    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) {
      setLoading(false);
      return;
    }

    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const [{ data: memData }, { count: memberCountData }] = await Promise.all([
      supabase.from('memories').select('*').eq('circle_id', c.id).order('created_at', { ascending: false }),
      supabase.from('circle_members').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
    ]);

    setMemberCount(memberCountData ?? null);

    const rawMemories = (memData as Memory[]) || [];
    const memoriesWithUrls = await Promise.all(
      rawMemories.map(async (memory) => {
        if (!memory.media_url || !['photo', 'video', 'audio'].includes(memory.type)) return memory;
        const storagePath = resolveMemoryMediaPath(memory.media_url);
        if (!storagePath) {
          return { ...memory, mediaSrc: /^https?:\/\//i.test(memory.media_url) ? memory.media_url : undefined };
        }
        const thumbnailPath = memory.type === 'photo' ? storagePath.replace(/(\.[^./]+)$/, '-thumb.jpg') : null;
        const { data: thumbSignedData } = thumbnailPath
          ? await supabase.storage.from('memories-media').createSignedUrl(thumbnailPath, 3600)
          : { data: null };
        const { data: signedData, error: signedError } = await supabase.storage
          .from('memories-media')
          .createSignedUrl(storagePath, 3600);
        if (signedError && !thumbSignedData?.signedUrl) {
          return { ...memory, mediaSrc: /^https?:\/\//i.test(memory.media_url) ? memory.media_url : undefined };
        }
        return { ...memory, mediaSrc: thumbSignedData?.signedUrl || signedData?.signedUrl };
      })
    );
    setMemories(memoriesWithUrls);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const openCreateDialog = (prefillType?: MemoryType) => {
    if (prefillType) setType(prefillType);
    setDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = memorySchema.safeParse({ caption, type, visibility });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (!circle || !user) return;
    setCreating(true);

    let media_url: string | null = null;

    if (file && (type === 'photo' || type === 'video' || type === 'audio')) {
      let processedFile = file;
      if (type === 'photo') processedFile = await prepareImageForUpload(file);
      const validation = await validateUpload(processedFile, type, circle.id);
      if (!validation.allowed) {
        toast.error(validation.error || t.memories_upload_error);
        setCreating(false);
        return;
      }
      const ext = processedFile.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('memories-media').upload(filePath, processedFile);
      if (uploadError) {
        toast.error(t.memories_upload_error);
        setCreating(false);
        return;
      }
      media_url = filePath;
      if (type === 'photo') {
        const thumbnailFile = await prepareImageThumbnail(processedFile);
        if (thumbnailFile) {
          const thumbnailPath = filePath.replace(/(\.[^./]+)$/, '-thumb.jpg');
          await supabase.storage.from('memories-media').upload(thumbnailPath, thumbnailFile, { upsert: true });
        }
      }
    }

    const { error } = await supabase.from('memories').insert({
      circle_id: circle.id,
      author_id: user.id,
      type,
      caption,
      media_url,
      visibility,
    });

    if (error) {
      toast.error(t.memories_error);
    } else {
      toast.success(t.memories_added);
      setCaption('');
      setType('text');
      setVisibility('circle');
      setFile(null);
      setDialogOpen(false);
      loadData();
    }
    setCreating(false);
  };

  const filteredMemories = useMemo(() => {
    if (activeFilter === 'all' || activeFilter === 'person' || activeFilter === 'generation') return memories;
    return memories.filter((m) => m.type === activeFilter);
  }, [memories, activeFilter]);

  const hasRealMemories = memories.length > 0;
  const displayCount = hasRealMemories ? memories.length : 128;
  const generationsCount = 4;

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
          <p className="text-muted-foreground">{t.must_create_circle_first}</p>
          <Button className="mt-4" onClick={() => (window.location.href = '/circle')}>
            {t.create_circle}
          </Button>
        </div>
      </AppLayout>
    );
  }

  const NewMemoryDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 rounded-xl shadow-md">
          <Plus className="h-5 w-5" />
          {t.memories_new}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{t.memories_add_title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.memories_type}</Label>
            <Select value={type} onValueChange={(v) => setType(v as MemoryType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{t.memories_type_labels.text}</SelectItem>
                <SelectItem value="photo">{t.memories_type_labels.photo}</SelectItem>
                <SelectItem value="video">{t.memories_type_labels.video}</SelectItem>
                <SelectItem value="audio">{t.memories_type_labels.audio}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">{t.memories_caption}</Label>
            <Textarea id="caption" placeholder={t.memories_caption_placeholder} value={caption} onChange={(e) => setCaption(e.target.value)} required />
          </div>
          {type !== 'text' && (
            <div className="space-y-2">
              <Label htmlFor="file">{t.memories_file}</Label>
              <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept={type === 'photo' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'} />
              <p className="text-xs text-muted-foreground">{t.memories_file_hint}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>{t.memories_visibility}</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as MemoryVisibility)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">{t.memories_visibility_labels.circle}</SelectItem>
                <SelectItem value="managers">{t.memories_visibility_labels.managers}</SelectItem>
                <SelectItem value="private">{t.memories_visibility_labels.private}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={creating}>
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.add}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-10">
        {/* 1. En-tête */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
              Souvenirs
            </h1>
            <div className="flex items-center gap-3">
              <span className="h-px w-16 bg-accent/60" />
              <Heart className="h-3.5 w-3.5 text-accent" fill="currentColor" />
              <span className="h-px w-16 bg-accent/60" />
            </div>
            <p className="text-muted-foreground max-w-2xl text-base">
              Préservez les histoires, recettes, traditions et messages qui traversent les générations.
            </p>
          </div>
          <div className="shrink-0">{NewMemoryDialog}</div>
        </header>

        {/* 2. Catégories */}
        <section
          aria-label="Catégories de souvenirs"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => openCreateDialog(cat.prefilledType)}
              className="group text-left rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-full mb-3', cat.iconBg)}>
                <cat.Icon className={cn('h-6 w-6', cat.iconColor)} />
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground leading-snug">
                {cat.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{cat.description}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground/60 mt-3 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </section>

        {/* 3. Bandeau statistiques */}
        <section
          aria-label="Statistiques de votre cercle"
          className="rounded-2xl border border-border bg-card shadow-sm px-6 py-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="flex items-center gap-4 pb-4 md:pb-0 md:pr-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(35_60%_92%)]">
                <Users className="h-6 w-6 text-[hsl(35_70%_45%)]" />
              </div>
              <div>
                <div className="text-2xl font-heading font-semibold text-foreground">{displayCount}</div>
                <div className="text-sm text-muted-foreground">souvenirs</div>
              </div>
            </div>
            <div className="flex items-center gap-4 py-4 md:py-0 md:px-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(140_30%_88%)]">
                <Users2 className="h-6 w-6 text-[hsl(140_35%_35%)]" />
              </div>
              <div>
                <div className="text-2xl font-heading font-semibold text-foreground">{generationsCount}</div>
                <div className="text-sm text-muted-foreground">générations</div>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(220_45%_92%)]">
                <ShieldCheck className="h-6 w-6 text-[hsl(220_45%_35%)]" />
              </div>
              <div>
                <div className="text-base font-heading font-semibold text-foreground">Privé et sécurisé</div>
                <div className="text-sm text-muted-foreground">Vos souvenirs restent en famille</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 & 5. À redécouvrir + Collections */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* À redécouvrir */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading text-xl font-semibold text-foreground">À redécouvrir</h2>
                  <button className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                    Voir tout <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {hasRealMemories ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMemories.slice(0, 3).map((memory) => {
                      const Icon = typeIcons[memory.type];
                      return (
                        <article
                          key={memory.id}
                          className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                            {memory.mediaSrc && memory.type === 'photo' ? (
                              <img src={memory.mediaSrc} alt={memory.caption} className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Icon className="h-12 w-12 text-muted-foreground/50" />
                              </div>
                            )}
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground uppercase text-[10px] tracking-wide">
                              {t.memories_type_labels[memory.type]}
                            </Badge>
                          </div>
                          <div className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-heading text-sm font-semibold text-foreground line-clamp-2">
                                {memory.caption}
                              </h3>
                              <button className="text-muted-foreground hover:text-foreground" aria-label="Options">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(memory.created_at).toLocaleDateString(localeMap[lang], {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {DEMO_MEMORIES.map((m) => {
                        const BIcon = m.badgeIcon;
                        return (
                          <article
                            key={m.id}
                            className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                              <img src={m.image} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground uppercase text-[10px] tracking-wide gap-1">
                                <BIcon className="h-3 w-3" />
                                {m.badge}
                              </Badge>
                              {m.duration && (
                                <span className="absolute top-2 right-2 bg-foreground/80 text-background text-[10px] px-2 py-0.5 rounded">
                                  {m.duration}
                                </span>
                              )}
                            </div>
                            <div className="p-3.5">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-heading text-sm font-semibold text-foreground line-clamp-2">
                                  {m.title}
                                </h3>
                                <button className="text-muted-foreground hover:text-foreground" aria-label="Options">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                <span className="truncate">{m.author}</span>
                                <span className="shrink-0">{m.year}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-secondary/50 border border-border px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Commencez par une recette, une histoire audio ou une photo de famille.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => openCreateDialog('text')} className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        Créer mon premier souvenir
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Collections suggérées */}
          <div>
            <Card className="shadow-sm h-full">
              <CardContent className="p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-5">
                  Collections suggérées
                </h2>
                <ul className="space-y-2">
                  {SUGGESTED_COLLECTIONS.map((col) => (
                    <li key={col.title}>
                      <button
                        onClick={() => openCreateDialog('text')}
                        className="w-full flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 hover:shadow-sm hover:border-accent/40 transition-all group"
                      >
                        <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-full', col.iconBg)}>
                          <col.Icon className={cn('h-4.5 w-4.5', col.iconColor)} />
                        </span>
                        <span className="flex-1 text-left text-sm font-medium text-foreground">{col.title}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 6. Barre de filtres */}
        <section aria-label="Filtres" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-foreground border-border hover:border-accent/40 hover:bg-secondary/60'
                )}
              >
                <f.Icon className="h-4 w-4" />
                {f.label}
              </button>
            );
          })}
        </section>
      </div>
    </AppLayout>
  );
};

export default MemoriesPage;
