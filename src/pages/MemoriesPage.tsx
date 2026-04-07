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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Image, Video, Mic, FileText } from 'lucide-react';
import type { Memory, MemoryType, MemoryVisibility, FamilyCircle } from '@/types/database';
import { z } from 'zod';

const memorySchema = z.object({
  caption: z.string().trim().min(1, 'Veuillez ajouter une légende').max(500),
  type: z.enum(['photo', 'video', 'audio', 'text']),
  visibility: z.enum(['circle', 'managers', 'private']),
});

const typeIcons: Record<MemoryType, React.FC<{ className?: string }>> = {
  photo: Image,
  video: Video,
  audio: Mic,
  text: FileText,
};

const typeLabels: Record<MemoryType, string> = {
  photo: 'Photo',
  video: 'Vidéo',
  audio: 'Audio',
  text: 'Texte',
};

const visibilityLabels: Record<MemoryVisibility, string> = {
  circle: 'Tout le cercle',
  managers: 'Gestionnaires uniquement',
  private: 'Privé (moi uniquement)',
};

const MemoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [memories, setMemories] = useState<(Memory & { signedUrl?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [caption, setCaption] = useState('');
  const [type, setType] = useState<MemoryType>('text');
  const [visibility, setVisibility] = useState<MemoryVisibility>('circle');
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('circle_id', c.id)
      .order('created_at', { ascending: false });
    
    const rawMemories = (data as Memory[]) || [];
    
    // Generate signed URLs for media
    const memoriesWithUrls = await Promise.all(
      rawMemories.map(async (m) => {
        if (m.media_url && (m.type === 'photo' || m.type === 'video' || m.type === 'audio')) {
          const { data: signedData } = await supabase.storage
            .from('memories-media')
            .createSignedUrl(m.media_url, 3600);
          return { ...m, signedUrl: signedData?.signedUrl || undefined };
        }
        return m;
      })
    );
    
    setMemories(memoriesWithUrls);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

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

    // Upload file if provided
    if (file && (type === 'photo' || type === 'video' || type === 'audio')) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error('Le fichier ne doit pas dépasser 50 Mo.');
        setCreating(false);
        return;
      }
      const allowedTypes: Record<string, string[]> = {
        photo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        video: ['video/mp4', 'video/webm', 'video/quicktime'],
        audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      };
      if (!allowedTypes[type]?.includes(file.type)) {
        toast.error('Type de fichier non autorisé.');
        setCreating(false);
        return;
      }

      const ext = file.name.split('.').pop();
      const filePath = `${circle.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('memories-media')
        .upload(filePath, file);
      if (uploadError) {
        toast.error("Erreur lors de l'envoi du fichier.");
        setCreating(false);
        return;
      }
      media_url = filePath;
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
      toast.error('Erreur lors de la création du souvenir.');
    } else {
      toast.success('Souvenir ajouté !');
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
          <p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Souvenirs</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau souvenir
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Ajouter un souvenir</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as MemoryType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texte</SelectItem>
                      <SelectItem value="photo">Photo</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Légende</Label>
                  <Textarea
                    id="caption"
                    placeholder="Décrivez ce souvenir..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    required
                  />
                </div>
                {type !== 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="file">Fichier</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept={type === 'photo' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'}
                    />
                    <p className="text-xs text-muted-foreground">Maximum 50 Mo</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Visibilité</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility(v as MemoryVisibility)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Tout le cercle</SelectItem>
                      <SelectItem value="managers">Gestionnaires uniquement</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Ajouter
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Memory feed */}
        {memories.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun souvenir partagé pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créez votre premier souvenir pour préserver vos moments précieux.
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
                        {memory.signedUrl && memory.type === 'photo' && (
                          <img
                            src={memory.signedUrl}
                            alt={memory.caption}
                            className="rounded-lg max-h-80 object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[memory.type]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {visibilityLabels[memory.visibility]}
                          </Badge>
                          <span>
                            {new Date(memory.created_at).toLocaleDateString('fr-FR', {
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
