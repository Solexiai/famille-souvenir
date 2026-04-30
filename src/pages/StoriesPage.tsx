import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Mic, Loader2, Plus, Pencil, Camera, Video, Image as ImageIcon, Sparkles,
  Trash2, Square, BookOpen, MessageCircle, Calendar, ArrowLeft, Upload,
} from 'lucide-react';
import { prepareImageForUpload, prepareImageThumbnail } from '@/lib/image-preparation';
import { cn } from '@/lib/utils';
import { useLocale } from '@/contexts/LocaleContext';
import { useMemoriesCopy } from '@/lib/memories-i18n';

type StCopy = ReturnType<typeof useMemoriesCopy>;

type Visibility = 'circle' | 'managers' | 'private';

type Story = {
  id: string;
  circle_id: string;
  author_id: string;
  title: string;
  content: string;
  ai_summary: string | null;
  story_date: string | null;
  source: 'written' | 'dictated';
  visibility: Visibility;
  created_at: string;
  updated_at: string;
};

type Anecdote = {
  id: string;
  story_id: string;
  author_id: string;
  content: string;
  created_at: string;
};

type StoryMedia = {
  id: string;
  story_id: string;
  uploader_id: string;
  media_type: 'photo' | 'video' | 'audio';
  storage_path: string;
  ai_description: string | null;
  created_at: string;
  signedUrl?: string;
};

const fileToBase64 = (file: File | Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const localeMap = { fr: 'fr-FR', en: 'en-US', es: 'es-ES' } as const;
const formatLocale = (iso: string, lang: 'fr' | 'en' | 'es') =>
  new Date(iso).toLocaleString(localeMap[lang], {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// ============ AUDIO RECORDING DIALOG ============
const DictateStoryDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onTranscribed: (data: { title: string; content: string; summary: string }) => void;
  t: StCopy;
}> = ({ open, onClose, onTranscribed, t }) => {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'processing'>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    setPhase('idle');
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setPhase('processing');
        try {
          const dataUrl = await fileToBase64(blob);
          const { data, error } = await supabase.functions.invoke('transcribe-story', {
            body: { audioBase64: dataUrl, mimeType: 'audio/webm' },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          if (!data?.story) throw new Error(t.st_toast_no_transcription);
          onTranscribed(data.story);
          cleanup();
          onClose();
        } catch (e: any) {
          toast.error(e?.message || t.st_toast_transcription_failed);
          cleanup();
        }
      };
      mr.start();
      recorderRef.current = mr;
      setPhase('recording');
    } catch {
      toast.error(t.st_toast_mic_error);
    }
  };

  const stop = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  useEffect(() => {
    if (open && phase === 'idle') start();
    if (!open) cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && (cleanup(), onClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Mic className="h-5 w-5 text-[hsl(220_45%_25%)]" />
            {t.st_dictate_dialog_title}
          </DialogTitle>
          <DialogDescription>
            {t.st_dictate_dialog_desc}
          </DialogDescription>
        </DialogHeader>

        {phase === 'recording' && (
          <div className="py-8 text-center space-y-5">
            <div className="relative inline-flex">
              <div className="h-24 w-24 rounded-full bg-[hsl(355_60%_55%)]/20 animate-ping absolute inset-0" />
              <div className="h-24 w-24 rounded-full bg-[hsl(355_60%_55%)] flex items-center justify-center relative">
                <Mic className="h-12 w-12 text-white" />
              </div>
            </div>
            <p className="font-medium text-lg">{t.st_recording}</p>
            <p className="text-sm text-muted-foreground px-4">
              {t.st_recording_hint}
            </p>
            <Button onClick={stop} size="lg" className="gap-2 bg-[hsl(220_45%_25%)] text-white">
              <Square className="h-4 w-4" /> {t.st_stop_transcribe}
            </Button>
          </div>
        )}

        {phase === 'processing' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(220_45%_40%)] mx-auto" />
            <p className="font-medium">{t.st_processing}</p>
            <p className="text-sm text-muted-foreground">{t.st_processing_hint}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============ MAIN PAGE ============
const StoriesPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLocale();
  const t = useMemoriesCopy(lang);
  const [circleId, setCircleId] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose dialog state
  const [composeOpen, setComposeOpen] = useState(false);
  const [dictateOpen, setDictateOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeSummary, setComposeSummary] = useState('');
  const [composeDate, setComposeDate] = useState('');
  const [composeVisibility, setComposeVisibility] = useState<Visibility>('circle');
  const [composeSource, setComposeSource] = useState<'written' | 'dictated'>('written');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  // Detail
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const loadStories = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('id').limit(1);
    const cid = circles?.[0]?.id || null;
    setCircleId(cid);
    if (!cid) {
      setLoading(false);
      return;
    }
    const { data } = await (supabase as any)
      .from('stories')
      .select('*')
      .eq('circle_id', cid)
      .order('created_at', { ascending: false });
    setStories((data as Story[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadStories();
  }, [user]);

  const resetCompose = () => {
    setComposeTitle('');
    setComposeContent('');
    setComposeSummary('');
    setComposeDate('');
    setComposeVisibility('circle');
    setComposeSource('written');
    setPendingFiles([]);
  };

  const openWriteDialog = () => {
    resetCompose();
    setComposeSource('written');
    setComposeOpen(true);
  };

  const openDictateFlow = () => {
    setDictateOpen(true);
  };

  const handleDictated = (data: { title: string; content: string; summary: string }) => {
    resetCompose();
    setComposeTitle(data.title);
    setComposeContent(data.content);
    setComposeSummary(data.summary);
    setComposeSource('dictated');
    setComposeOpen(true);
    toast.success(t.st_toast_transcribed);
  };

  const summarizeContent = async () => {
    if (!composeContent.trim()) {
      toast.error(t.st_toast_write_first);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('summarize-story-media', {
        body: { kind: 'story', text: composeContent },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setComposeSummary(data.summary || '');
      toast.success(t.st_toast_summary_done);
    } catch (e: any) {
      toast.error(e?.message || t.st_toast_summary_failed);
    }
  };

  const handleSave = async () => {
    if (!user || !circleId) return;
    if (!composeContent.trim() && !composeTitle.trim()) {
      toast.error(t.st_toast_need_content);
      return;
    }
    setSaving(true);
    try {
      const { data: inserted, error } = await (supabase as any)
        .from('stories')
        .insert({
          circle_id: circleId,
          author_id: user.id,
          title: composeTitle || t.st_no_title,
          content: composeContent,
          ai_summary: composeSummary || null,
          story_date: composeDate || null,
          source: composeSource,
          visibility: composeVisibility,
        })
        .select('id')
        .single();
      if (error) throw error;

      const storyId = inserted.id;

      // Upload media
      for (const file of pendingFiles) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        const mediaType: 'photo' | 'video' | 'audio' = isImage ? 'photo' : isVideo ? 'video' : 'audio';
        let toUpload: File = file;
        if (isImage) toUpload = await prepareImageForUpload(file);
        const ext = toUpload.name.split('.').pop() || 'bin';
        const path = `${user.id}/stories/${storyId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('memories-media').upload(path, toUpload, {
          contentType: toUpload.type,
        });
        if (upErr) {
          console.error(upErr);
          toast.error(`${t.st_toast_upload_err}: ${file.name}`);
          continue;
        }
        if (isImage) {
          const thumb = await prepareImageThumbnail(toUpload);
          if (thumb) {
            await supabase.storage
              .from('memories-media')
              .upload(path.replace(/(\.[^./]+)$/, '-thumb.jpg'), thumb, { upsert: true });
          }
        }
        await (supabase as any).from('story_media').insert({
          story_id: storyId,
          uploader_id: user.id,
          media_type: mediaType,
          storage_path: path,
        });
      }

      toast.success(t.st_toast_saved);
      setComposeOpen(false);
      resetCompose();
      loadStories();
      setSelectedStoryId(storyId);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || t.st_toast_save_error);
    } finally {
      setSaving(false);
    }
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

  if (!circleId) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">{t.must_create_circle}</p>
          <Button className="mt-4" onClick={() => (window.location.href = '/circle')}>
            {t.create_circle}
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="self-start gap-2 text-muted-foreground"
            onClick={() => (window.location.href = '/memories')}
          >
            <ArrowLeft className="h-4 w-4" /> {t.st_back_memories}
          </Button>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(220_45%_92%)] text-[hsl(220_45%_25%)] text-xs font-medium">
                <BookOpen className="h-3.5 w-3.5" /> {t.st_badge}
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight">
                {t.st_title}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {t.st_subtitle}
              </p>
            </div>
          </div>
        </header>

        {/* Action cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={openWriteDialog}
            className="text-left p-6 rounded-2xl border-2 border-border bg-card hover:border-[hsl(220_45%_40%)] hover:bg-[hsl(220_45%_98%)] transition-all flex items-start gap-4 shadow-sm hover:shadow-md"
          >
            <div className="h-14 w-14 rounded-full bg-[hsl(220_45%_92%)] flex items-center justify-center shrink-0">
              <Pencil className="h-7 w-7 text-[hsl(220_45%_25%)]" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold">{t.st_write}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.st_write_hint}
              </p>
            </div>
          </button>

          <button
            onClick={openDictateFlow}
            className="text-left p-6 rounded-2xl border-2 border-border bg-card hover:border-[hsl(355_60%_55%)] hover:bg-[hsl(355_60%_98%)] transition-all flex items-start gap-4 shadow-sm hover:shadow-md"
          >
            <div className="h-14 w-14 rounded-full bg-[hsl(355_60%_94%)] flex items-center justify-center shrink-0">
              <Mic className="h-7 w-7 text-[hsl(355_60%_55%)]" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold">{t.st_dictate}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.st_dictate_hint}
              </p>
            </div>
          </button>
        </section>

        {/* Stories list */}
        <section className="space-y-4">
          <h2 className="font-heading text-2xl font-semibold">
            {stories.length === 0
              ? t.st_count_none
              : stories.length === 1
              ? t.st_count_one.replace('{n}', '1')
              : t.st_count_many.replace('{n}', String(stories.length))}
          </h2>

          {stories.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
              <p className="mt-4 text-muted-foreground">
                {t.st_empty_hint}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stories.map((s) => (
              <StoryCard key={s.id} story={s} lang={lang} t={t} onOpen={() => setSelectedStoryId(s.id)} />
            ))}
          </div>
        </section>
      </div>

      {/* Dictate dialog */}
      <DictateStoryDialog
        open={dictateOpen}
        onClose={() => setDictateOpen(false)}
        onTranscribed={handleDictated}
        t={t}
      />

      {/* Compose / Edit dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl flex items-center gap-2">
              {composeSource === 'dictated' ? <Mic className="h-5 w-5 text-[hsl(355_60%_55%)]" /> : <Pencil className="h-5 w-5 text-[hsl(220_45%_25%)]" />}
              {composeSource === 'dictated' ? t.st_dialog_check : t.st_dialog_write}
            </DialogTitle>
            <DialogDescription>
              {t.st_dialog_desc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="story-title" className="text-base">{t.st_field_title}</Label>
              <Input
                id="story-title"
                value={composeTitle}
                onChange={(e) => setComposeTitle(e.target.value)}
                placeholder={t.st_field_title_ph}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="story-date" className="text-base">{t.st_field_date}</Label>
                <Input
                  id="story-date"
                  type="date"
                  value={composeDate}
                  onChange={(e) => setComposeDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">{t.st_field_visibility}</Label>
                <Select value={composeVisibility} onValueChange={(v) => setComposeVisibility(v as Visibility)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">{t.st_vis_circle}</SelectItem>
                    <SelectItem value="managers">{t.st_vis_managers}</SelectItem>
                    <SelectItem value="private">{t.st_vis_private}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="story-content" className="text-base">{t.st_field_content}</Label>
              <Textarea
                id="story-content"
                value={composeContent}
                onChange={(e) => setComposeContent(e.target.value)}
                rows={10}
                placeholder={t.st_field_content_ph}
                className="text-base leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="story-summary" className="text-base">{t.st_field_summary}</Label>
                <Button type="button" variant="outline" size="sm" onClick={summarizeContent} className="gap-2">
                  <Sparkles className="h-4 w-4 text-[hsl(35_70%_45%)]" /> {t.st_summarize_ai}
                </Button>
              </div>
              <Textarea
                id="story-summary"
                value={composeSummary}
                onChange={(e) => setComposeSummary(e.target.value)}
                rows={3}
                placeholder={t.st_field_summary_ph}
              />
            </div>

            {/* Media picker */}
            <div className="space-y-2">
              <Label className="text-base">{t.st_field_media}</Label>
              <div className="rounded-xl border-2 border-dashed border-border p-4 space-y-3">
                <input
                  id="story-files"
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    setPendingFiles((prev) => [...prev, ...list]);
                    e.target.value = '';
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => document.getElementById('story-files')?.click()}>
                    <Upload className="h-4 w-4" /> {t.st_add_files}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      (input as any).capture = 'environment';
                      input.onchange = (ev: any) => {
                        const f = ev.target.files?.[0];
                        if (f) setPendingFiles((prev) => [...prev, f]);
                      };
                      input.click();
                    }}
                  >
                    <Camera className="h-4 w-4" /> {t.st_take_photo}
                  </Button>
                </div>
                {pendingFiles.length > 0 && (
                  <ul className="space-y-1 text-sm">
                    {pendingFiles.map((f, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 bg-muted/40 rounded px-2 py-1">
                        <span className="truncate flex items-center gap-2">
                          {f.type.startsWith('image/') ? <ImageIcon className="h-4 w-4" /> : f.type.startsWith('video/') ? <Video className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPendingFiles((prev) => prev.filter((_, j) => j !== i))}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setComposeOpen(false)} disabled={saving}>
              {t.common_cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t.st_save_btn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      {selectedStoryId && (
        <StoryDetailDialog
          storyId={selectedStoryId}
          lang={lang}
          t={t}
          onClose={() => setSelectedStoryId(null)}
          onDeleted={() => {
            setSelectedStoryId(null);
            loadStories();
          }}
        />
      )}
    </AppLayout>
  );
};

// ============ STORY CARD ============
const StoryCard: React.FC<{ story: Story; lang: 'fr' | 'en' | 'es'; t: StCopy; onOpen: () => void }> = ({ story, lang, t, onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="text-left rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Calendar className="h-3.5 w-3.5" />
        {formatLocale(story.created_at, lang)}
        {story.source === 'dictated' && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(355_60%_94%)] text-[hsl(355_60%_45%)] text-[10px] font-medium">
            <Mic className="h-3 w-3" /> {t.st_dictated_badge}
          </span>
        )}
      </div>
      <h3 className="font-heading text-lg font-semibold leading-snug line-clamp-2">{story.title || t.st_no_title}</h3>
      <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
        {story.ai_summary || story.content || t.st_no_content}
      </p>
    </button>
  );
};

// ============ STORY DETAIL ============
const StoryDetailDialog: React.FC<{
  storyId: string;
  lang: 'fr' | 'en' | 'es';
  t: StCopy;
  onClose: () => void;
  onDeleted: () => void;
}> = ({ storyId, lang, t, onClose, onDeleted }) => {
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [media, setMedia] = useState<StoryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnecdote, setNewAnecdote] = useState('');
  const [addingAnecdote, setAddingAnecdote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [summarizingMedia, setSummarizingMedia] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: a }, { data: m }] = await Promise.all([
      (supabase as any).from('stories').select('*').eq('id', storyId).maybeSingle(),
      (supabase as any).from('story_anecdotes').select('*').eq('story_id', storyId).order('created_at', { ascending: true }),
      (supabase as any).from('story_media').select('*').eq('story_id', storyId).order('created_at', { ascending: true }),
    ]);
    setStory(s as Story);
    setAnecdotes((a as Anecdote[]) || []);
    const mediaList = (m as StoryMedia[]) || [];
    // sign URLs
    const withUrls = await Promise.all(
      mediaList.map(async (mi) => {
        const { data } = await supabase.storage.from('memories-media').createSignedUrl(mi.storage_path, 3600);
        return { ...mi, signedUrl: data?.signedUrl };
      })
    );
    setMedia(withUrls);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyId]);

  const addAnecdote = async () => {
    if (!user || !newAnecdote.trim()) return;
    setAddingAnecdote(true);
    const { error } = await (supabase as any).from('story_anecdotes').insert({
      story_id: storyId,
      author_id: user.id,
      content: newAnecdote.trim(),
    });
    if (error) toast.error('Échec de l\'ajout');
    else {
      setNewAnecdote('');
      load();
    }
    setAddingAnecdote(false);
  };

  const deleteStory = async () => {
    // delete media files from storage
    if (media.length > 0) {
      const paths = media.map((m) => m.storage_path);
      await supabase.storage.from('memories-media').remove(paths);
    }
    const { error } = await (supabase as any).from('stories').delete().eq('id', storyId);
    if (error) toast.error('Échec de la suppression');
    else {
      toast.success('Histoire supprimée');
      onDeleted();
    }
  };

  const summarizeMediaItem = async (mi: StoryMedia) => {
    if (mi.media_type === 'audio') return;
    if (!mi.signedUrl) return;
    setSummarizingMedia(mi.id);
    try {
      // fetch the image as base64
      const resp = await fetch(mi.signedUrl);
      const blob = await resp.blob();
      const dataUrl = await fileToBase64(blob);
      const { data, error } = await supabase.functions.invoke('summarize-story-media', {
        body: { kind: mi.media_type, imageBase64: dataUrl, mimeType: blob.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await (supabase as any).from('story_media').update({ ai_description: data.summary }).eq('id', mi.id);
      toast.success('Description générée');
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Échec de la description');
    } finally {
      setSummarizingMedia(null);
    }
  };

  if (loading || !story) {
    return (
      <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-3xl">
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isAuthor = user?.id === story.author_id;

  return (
    <>
      <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Ajoutée le {formatFR(story.created_at)}
              {story.story_date && (
                <span className="ml-2">· Souvenir du {new Date(story.story_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              )}
              {story.source === 'dictated' && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(355_60%_94%)] text-[hsl(355_60%_45%)] font-medium">
                  <Mic className="h-3 w-3" /> Dictée
                </span>
              )}
            </div>
            <DialogTitle className="font-heading text-2xl md:text-3xl">{story.title || 'Sans titre'}</DialogTitle>
            {story.ai_summary && (
              <DialogDescription className="text-base italic border-l-4 border-[hsl(35_60%_55%)] pl-4 py-2 bg-[hsl(35_60%_97%)] rounded">
                {story.ai_summary}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Content */}
          <article className="prose prose-sm max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {story.content || <span className="text-muted-foreground italic">Aucun texte.</span>}
          </article>

          {/* Media */}
          {media.length > 0 && (
            <>
              <div className="border-t border-border pt-4">
                <h3 className="font-heading text-lg font-semibold mb-3">Photos, vidéos & audio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {media.map((mi) => (
                    <div key={mi.id} className="rounded-xl border border-border overflow-hidden bg-muted/30">
                      {mi.media_type === 'photo' && mi.signedUrl && (
                        <img src={mi.signedUrl} alt="" className="w-full h-48 object-cover" loading="lazy" />
                      )}
                      {mi.media_type === 'video' && mi.signedUrl && (
                        <video src={mi.signedUrl} controls className="w-full h-48 object-cover bg-black" />
                      )}
                      {mi.media_type === 'audio' && mi.signedUrl && (
                        <div className="p-4">
                          <audio src={mi.signedUrl} controls className="w-full" />
                        </div>
                      )}
                      <div className="p-3 space-y-2">
                        {mi.ai_description ? (
                          <p className="text-xs text-muted-foreground italic">{mi.ai_description}</p>
                        ) : mi.media_type !== 'audio' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-7 text-xs"
                            onClick={() => summarizeMediaItem(mi)}
                            disabled={summarizingMedia === mi.id}
                          >
                            {summarizingMedia === mi.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            Décrire avec l'IA
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Anecdotes */}
          <div className="border-t border-border pt-4 space-y-3">
            <h3 className="font-heading text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[hsl(220_45%_25%)]" />
              Anecdotes ({anecdotes.length})
            </h3>
            {anecdotes.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Pas encore d'anecdote. Ajoutez un détail savoureux, une variante, un souvenir lié.
              </p>
            )}
            <ul className="space-y-2">
              {anecdotes.map((a) => (
                <li key={a.id} className="rounded-xl bg-[hsl(40_33%_96%)] border border-border p-3">
                  <p className="text-sm whitespace-pre-wrap">{a.content}</p>
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatFR(a.created_at)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Textarea
                placeholder="Ajouter une anecdote à cette histoire…"
                value={newAnecdote}
                onChange={(e) => setNewAnecdote(e.target.value)}
                rows={3}
              />
              <Button onClick={addAnecdote} disabled={addingAnecdote || !newAnecdote.trim()} size="sm" className="gap-2">
                {addingAnecdote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Ajouter cette anecdote
              </Button>
            </div>
          </div>

          {isAuthor && (
            <DialogFooter className="border-t border-border pt-4">
              <Button variant="destructive" onClick={() => setConfirmDelete(true)} className="gap-2">
                <Trash2 className="h-4 w-4" /> Supprimer cette histoire
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette histoire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. L'histoire, ses anecdotes et ses médias seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteStory} className={cn('bg-destructive text-destructive-foreground hover:bg-destructive/90')}>
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StoriesPage;
