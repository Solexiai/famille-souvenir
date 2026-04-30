import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Upload,
  FolderOpen,
  Loader2,
  ImageIcon,
  Video,
  Trash2,
  CloudUpload,
  Sparkles,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import { prepareImageForUpload } from '@/lib/image-preparation';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  circle_id: string;
  uploaded_by: string;
  media_type: 'photo' | 'video';
  storage_path: string;
  thumbnail_path: string | null;
  file_name: string;
  mime_type: string;
  file_size: number;
  taken_at: string | null;
  created_at: string;
  caption: string | null;
}

interface UserStorage {
  circle_id: string;
  plan_code: string;
  quota_bytes: number;
  used_bytes: number;
}

const FREE_QUOTA = 5 * 1024 * 1024 * 1024; // 5 Go

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} Ko`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} Mo`;
  return `${(mb / 1024).toFixed(2)} Go`;
}

function formatGB(bytes: number): string {
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function GalleryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [circleId, setCircleId] = useState<string | null>(null);
  const [storage, setStorage] = useState<UserStorage | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Charger cercle + stockage + items
  useEffect(() => {
    if (!user) return;
    void loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      const { data: circles } = await supabase
        .from('family_circles')
        .select('id')
        .or(`owner_id.eq.${user!.id}`)
        .limit(1);
      let cid = circles?.[0]?.id ?? null;
      if (!cid) {
        const { data: mems } = await supabase
          .from('circle_members')
          .select('circle_id')
          .eq('user_id', user!.id)
          .limit(1);
        cid = mems?.[0]?.circle_id ?? null;
      }
      if (!cid) {
        setLoading(false);
        return;
      }
      setCircleId(cid);

      const [{ data: stor }, { data: med }] = await Promise.all([
        supabase.from('user_storage').select('*').eq('circle_id', cid).maybeSingle(),
        supabase
          .from('media_items')
          .select('*')
          .eq('circle_id', cid)
          .order('taken_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(500),
      ]);

      setStorage(
        (stor as UserStorage) ?? {
          circle_id: cid,
          plan_code: 'free_5gb',
          quota_bytes: FREE_QUOTA,
          used_bytes: 0,
        },
      );
      setItems((med as MediaItem[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  // Charger les URLs signées des miniatures (par lots)
  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    void (async () => {
      const paths = items
        .map((i) => i.thumbnail_path || i.storage_path)
        .filter(Boolean) as string[];
      const uniq = [...new Set(paths)];
      const next: Record<string, string> = {};
      // signer par lots de 50
      for (let i = 0; i < uniq.length; i += 50) {
        const batch = uniq.slice(i, i + 50);
        const { data } = await supabase.storage
          .from('family-media')
          .createSignedUrls(batch, 3600);
        data?.forEach((d) => {
          if (d.path && d.signedUrl) next[d.path] = d.signedUrl;
        });
      }
      if (!cancelled) setThumbUrls(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [items]);

  const usedBytes = storage?.used_bytes ?? 0;
  const quotaBytes = storage?.quota_bytes ?? FREE_QUOTA;
  const usedPct = Math.min(100, (usedBytes / quotaBytes) * 100);
  const isOverQuota = usedBytes >= quotaBytes;
  const isNearQuota = usedPct >= 80;

  // Regrouper par mois
  const grouped = useMemo(() => {
    const map = new Map<string, MediaItem[]>();
    items.forEach((it) => {
      const key = monthLabel(it.taken_at || it.created_at);
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [items]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || !circleId || !user) return;
    if (isOverQuota) {
      toast.error('Stockage plein — passez à un forfait pour continuer');
      navigate('/storage-plans');
      return;
    }

    const list = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    if (list.length === 0) {
      toast.error('Aucune photo ou vidéo trouvée');
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: list.length });

    let remaining = quotaBytes - usedBytes;
    let uploaded = 0;
    let skipped = 0;

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      try {
        const isImage = file.type.startsWith('image/');
        const prepared = isImage ? await prepareImageForUpload(file) : file;

        if (prepared.size > remaining) {
          skipped++;
          toast.error(`Stockage plein. Reste à importer : ${list.length - i}`);
          break;
        }

        const mediaId = crypto.randomUUID();
        const ext = prepared.name.split('.').pop()?.toLowerCase() || 'bin';
        const path = `${circleId}/${mediaId}/${mediaId}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from('family-media')
          .upload(path, prepared, {
            contentType: prepared.type,
            cacheControl: '3600',
            upsert: false,
          });
        if (upErr) throw upErr;

        // Détecter date EXIF approximative via lastModified
        const takenAt = file.lastModified
          ? new Date(file.lastModified).toISOString()
          : null;

        // dossier source (si webkitdirectory)
        const relPath = (file as any).webkitRelativePath as string | undefined;
        const sourceFolder = relPath ? relPath.split('/').slice(0, -1).join('/') : null;

        const { error: insErr } = await supabase.from('media_items').insert({
          id: mediaId,
          circle_id: circleId,
          uploaded_by: user.id,
          media_type: isImage ? 'photo' : 'video',
          storage_path: path,
          thumbnail_path: path, // pour les images, on utilise l'image elle-même
          file_name: file.name,
          mime_type: prepared.type,
          file_size: prepared.size,
          taken_at: takenAt,
          source_folder: sourceFolder,
        } as any);
        if (insErr) throw insErr;

        remaining -= prepared.size;
        uploaded++;
      } catch (e) {
        console.error('upload error', e);
        skipped++;
      }
      setProgress({ done: i + 1, total: list.length });
    }

    setUploading(false);
    setProgress({ done: 0, total: 0 });
    if (uploaded > 0) toast.success(`${uploaded} fichier(s) ajouté(s) à votre album`);
    if (skipped > 0) toast.warning(`${skipped} fichier(s) non importé(s)`);
    await loadAll();
  }

  async function openPreview(item: MediaItem) {
    setPreviewItem(item);
    const { data } = await supabase.storage
      .from('family-media')
      .createSignedUrl(item.storage_path, 3600);
    setPreviewUrl(data?.signedUrl ?? null);
  }

  async function deleteItem(item: MediaItem) {
    if (!confirm('Supprimer définitivement ce souvenir ?')) return;
    await supabase.storage.from('family-media').remove([item.storage_path]);
    await supabase.from('media_items').delete().eq('id', item.id);
    toast.success('Souvenir supprimé');
    setPreviewItem(null);
    setPreviewUrl(null);
    await loadAll();
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/memories')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Album de la famille
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mt-2">
            Toutes vos photos et vidéos, classées automatiquement par date.
            Importez depuis votre téléphone, votre clé USB ou votre ordinateur.
          </p>
        </div>

        {/* Compteur de stockage */}
        <Card className="border-2">
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(220_45%_92%)]">
                  <CloudUpload className="h-6 w-6 text-[hsl(220_45%_25%)]" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-heading font-semibold text-foreground">
                    {formatBytes(usedBytes)} sur {formatGB(quotaBytes)} utilisés
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {storage?.plan_code === 'free_5gb'
                      ? 'Forfait gratuit — 5 Go inclus'
                      : `Forfait ${storage?.plan_code}`}
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                variant={isNearQuota ? 'default' : 'outline'}
                onClick={() => navigate('/storage-plans')}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Augmenter mon stockage
              </Button>
            </div>
            <Progress value={usedPct} className="h-3" />
            {isOverQuota && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">
                    Stockage plein
                  </div>
                  <p className="text-sm text-foreground/80 mt-1">
                    Vous avez atteint la limite de 5 Go. Pour continuer à ajouter
                    des photos et vidéos, choisissez un forfait.
                  </p>
                </div>
              </div>
            )}
            {!isOverQuota && isNearQuota && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">
                  Vous approchez de votre limite. Pensez à passer à un forfait
                  plus grand pour ne pas être bloqué.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Boutons d'import */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore - non-standard mais largement supporté
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <Button
            size="lg"
            disabled={uploading || isOverQuota}
            onClick={() => fileInputRef.current?.click()}
            className="h-auto py-6 text-base flex flex-col gap-2"
          >
            <Upload className="h-7 w-7" />
            <span className="font-semibold">Choisir des fichiers</span>
            <span className="text-xs opacity-80">
              Photos et vidéos depuis votre téléphone ou ordinateur
            </span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={uploading || isOverQuota}
            onClick={() => folderInputRef.current?.click()}
            className="h-auto py-6 text-base flex flex-col gap-2 border-2"
          >
            <FolderOpen className="h-7 w-7" />
            <span className="font-semibold">Choisir un dossier complet</span>
            <span className="text-xs opacity-80">
              Tout un dossier (clé USB, ancien ordinateur)
            </span>
          </Button>
        </div>

        {/* Progression */}
        {uploading && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="font-medium">
                  Importation : {progress.done} / {progress.total}
                </span>
              </div>
              <Progress
                value={(progress.done / Math.max(1, progress.total)) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>
        )}

        {/* Galerie */}
        {items.length === 0 && !uploading ? (
          <Card className="border-dashed border-2">
            <CardContent className="p-12 text-center space-y-3">
              <ImageIcon className="h-16 w-16 text-muted-foreground/40 mx-auto" />
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Votre album est vide
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Commencez à transférer les photos et vidéos de votre famille.
                Elles seront automatiquement classées par date.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {grouped.map(([month, group]) => (
              <section key={month}>
                <h2 className="font-heading text-xl font-semibold text-foreground capitalize mb-3">
                  {month}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({group.length})
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {group.map((it) => {
                    const url = thumbUrls[it.thumbnail_path || it.storage_path];
                    return (
                      <button
                        key={it.id}
                        onClick={() => openPreview(it)}
                        className={cn(
                          'group relative aspect-square overflow-hidden rounded-lg bg-muted',
                          'border border-border hover:border-accent transition-all hover:shadow-md',
                        )}
                      >
                        {it.media_type === 'photo' && url ? (
                          <img
                            src={url}
                            alt={it.file_name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-foreground/80">
                            <Video className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {it.media_type === 'video' && (
                          <div className="absolute top-1.5 right-1.5 bg-black/60 rounded p-1">
                            <Video className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Aperçu */}
      <Dialog
        open={!!previewItem}
        onOpenChange={(o) => {
          if (!o) {
            setPreviewItem(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              {previewItem?.file_name}
            </DialogTitle>
          </DialogHeader>
          {previewUrl && previewItem?.media_type === 'photo' && (
            <img
              src={previewUrl}
              alt={previewItem.file_name}
              className="w-full max-h-[70vh] object-contain rounded"
            />
          )}
          {previewUrl && previewItem?.media_type === 'video' && (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[70vh] rounded"
            />
          )}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-sm text-muted-foreground">
              {previewItem && formatBytes(previewItem.file_size)} •{' '}
              {previewItem &&
                new Date(
                  previewItem.taken_at || previewItem.created_at,
                ).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => previewItem && deleteItem(previewItem)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
