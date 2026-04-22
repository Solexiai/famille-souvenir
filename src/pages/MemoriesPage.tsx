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
import { Loader2, Plus, Image, Video, Mic, FileText } from 'lucide-react';
import type { Memory, MemoryType, MemoryVisibility, FamilyCircle } from '@/types/database';
import { z } from 'zod';
import { validateUpload } from '@/lib/upload-validation';
import { prepareImageForUpload, prepareImageThumbnail } from '@/lib/image-preparation';
import { useLocale } from '@/contexts/LocaleContext';

const typeIcons: Record<MemoryType, React.FC<{ className?: string }>> = {
  photo: Image,
  video: Video,
  audio: Mic,
  text: FileText,
};

type MemoryWithMedia = Memory & { mediaSrc?: string };

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
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('circle_id', c.id)
      .order('created_at', { ascending: false });

    const rawMemories = (data as Memory[]) || [];

    const memoriesWithUrls = await Promise.all(
      rawMemories.map(async (memory) => {
        if (!memory.media_url || !['photo', 'video', 'audio'].includes(memory.type)) {
          return memory;
        }

        const storagePath = resolveMemoryMediaPath(memory.media_url);
        if (!storagePath) {
          return {
            ...memory,
            mediaSrc: /^https?:\/\//i.test(memory.media_url) ? memory.media_url : undefined,
          };
        }

        const thumbnailPath = memory.type === 'photo' ? storagePath.replace(/(\.[^./]+)$/, '-thumb.jpg') : null;

        const { data: thumbSignedData } = thumbnailPath
          ? await supabase.storage.from('memories-media').createSignedUrl(thumbnailPath, 3600)
          : { data: null };

        const { data: signedData, error: signedError } = await supabase.storage
          .from('memories-media')
          .createSignedUrl(storagePath, 3600);

        if (signedError && !thumbSignedData?.signedUrl) {
          return {
            ...memory,
            mediaSrc: /^https?:\/\//i.test(memory.media_url) ? memory.media_url : undefined,
          };
        }

        return {
          ...memory,
          mediaSrc: thumbSignedData?.signedUrl || signedData?.signedUrl,
        };
      })
    );

    setMemories(memoriesWithUrls);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

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
      if (type === 'photo') {
        processedFile = await prepareImageForUpload(file);
      }

      const validation = await validateUpload(processedFile, type, circle.id);
      if (!validation.allowed) {
        toast.error(validation.error || t.memories_upload_error);
        setCreating(false);
        return;
      }

      const ext = processedFile.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('memories-media')
        .upload(filePath, processedFile);
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
          <Button className="mt-4" onClick={() => window.location.href = '/circle'}>{t.create_circle}</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground">{t.memories_title}</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
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
                  <Textarea
                    id="caption"
                    placeholder={t.memories_caption_placeholder}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                  />
                </div>
                {type !== 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="file">{t.memories_file}</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept={type === 'photo' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'}
                    />
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
        </div>

        {memories.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.memories_empty}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t.memories_empty_desc}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => {
              const Icon = typeIcons[memory.type];
              return (
                <Card key={memory.id} className="shadow-soft">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-lg bg-secondary p-2">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-foreground">{memory.caption}</p>
                        {memory.mediaSrc && memory.type === 'photo' && (
                          <img
                            src={memory.mediaSrc}
                            alt={memory.caption}
                            className="rounded-lg max-h-80 object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {t.memories_type_labels[memory.type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t.memories_visibility_labels[memory.visibility]}
                          </Badge>
                          <span>
                            {new Date(memory.created_at).toLocaleDateString(localeMap[lang], {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default MemoriesPage;
