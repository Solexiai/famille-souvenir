import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Clock, Mic, Video, FileText, Plus, Loader2, Calendar as CalendarIcon,
  Heart, ShieldCheck, Trash2, Play, Square, UserPlus, AlertCircle,
} from 'lucide-react';

type Format = 'audio' | 'video' | 'text';
type Trigger = 'scheduled_date' | 'after_death';

interface TimeMessage {
  id: string;
  format: Format;
  trigger_type: Trigger;
  title: string;
  text_content: string | null;
  media_path: string | null;
  recipient_name: string;
  recipient_relationship: string | null;
  scheduled_for: string | null;
  occasion_label: string | null;
  is_recurring: boolean;
  status: string;
  created_at: string;
}

interface Guardian {
  id: string;
  guardian_name: string;
  guardian_email: string;
  guardian_relationship: string | null;
  accepted_at: string | null;
}

const formatIcon = (f: Format) => f === 'audio' ? Mic : f === 'video' ? Video : FileText;
const formatLabel = (f: Format) => f === 'audio' ? 'Audio' : f === 'video' ? 'Vidéo' : 'Texte';

export default function TimeMessagesPage() {
  const { user } = useAuth();
  const [circleId, setCircleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<TimeMessage[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [guardianOpen, setGuardianOpen] = useState(false);

  const loadData = async (cid: string) => {
    const [msgRes, gRes] = await Promise.all([
      supabase.from('time_messages').select('*').eq('circle_id', cid).order('created_at', { ascending: false }),
      supabase.from('time_message_guardians').select('*').eq('author_id', user!.id),
    ]);
    if (msgRes.data) setMessages(msgRes.data as TimeMessage[]);
    if (gRes.data) setGuardians(gRes.data as Guardian[]);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cm } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      if (cm?.circle_id) {
        setCircleId(cm.circle_id);
        await loadData(cm.circle_id);
        // Update activity ping
        await supabase.from('user_activity_pings').upsert({
          user_id: user.id,
          last_seen_at: new Date().toISOString(),
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const refresh = () => circleId && loadData(circleId);

  const upcoming = useMemo(
    () => messages.filter(m => m.trigger_type === 'scheduled_date' && m.status !== 'sent'),
    [messages],
  );
  const posthumous = useMemo(
    () => messages.filter(m => m.trigger_type === 'after_death'),
    [messages],
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!circleId) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto p-8 text-center">
          <p className="text-muted-foreground">Vous devez d'abord créer ou rejoindre un cercle familial.</p>
          <Button className="mt-4" onClick={() => (window.location.href = '/circle')}>Créer un cercle</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(270_30%_92%)] text-[hsl(270_35%_45%)] text-xs font-medium mb-3">
              <Clock className="w-3.5 h-3.5" />
              Messages dans le temps
            </div>
            <h1 className="font-heading text-3xl md:text-4xl text-foreground">
              Vos mots, livrés au bon moment
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Enregistrez aujourd'hui des messages vocaux, vidéo ou écrits qui seront envoyés à vos proches
              à une date précise (anniversaire, mariage, naissance…) ou après votre décès.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setGuardianOpen(true)} className="gap-2">
              <ShieldCheck className="w-4 h-4" />
              Gardiens ({guardians.length})
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau message
            </Button>
          </div>
        </div>

        {/* Posthumous setup banner */}
        {guardians.length === 0 && (
          <Card className="border-[hsl(35_60%_85%)] bg-[hsl(40_45%_97%)]">
            <CardContent className="p-5 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[hsl(35_70%_45%)] mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Configurez vos gardiens de confiance</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Pour les messages posthumes, désignez 1 ou 2 personnes qui pourront confirmer votre décès et
                  déclencher l'envoi. Une vérification d'inactivité (6 mois sans connexion) sert de filet de sécurité.
                </p>
                <Button variant="link" className="px-0 h-auto mt-2" onClick={() => setGuardianOpen(true)}>
                  Désigner un gardien →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList>
            <TabsTrigger value="scheduled" className="gap-2">
              <CalendarIcon className="w-4 h-4" /> À date précise ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="posthumous" className="gap-2">
              <Heart className="w-4 h-4" /> Après mon décès ({posthumous.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="mt-6">
            <MessageList
              messages={upcoming}
              emptyText="Aucun message programmé pour l'instant."
              onChange={refresh}
            />
          </TabsContent>
          <TabsContent value="posthumous" className="mt-6">
            <MessageList
              messages={posthumous}
              emptyText="Aucun message posthume enregistré."
              onChange={refresh}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateMessageDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={user!.id}
        circleId={circleId}
        onCreated={refresh}
      />
      <GuardiansDialog
        open={guardianOpen}
        onOpenChange={setGuardianOpen}
        userId={user!.id}
        circleId={circleId}
        guardians={guardians}
        onChange={refresh}
      />
    </AppLayout>
  );
}

function MessageList({
  messages, emptyText, onChange,
}: { messages: TimeMessage[]; emptyText: string; onChange: () => void }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>{emptyText}</p>
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ? Cette action est définitive.')) return;
    const { error } = await supabase.from('time_messages').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Message supprimé'); onChange(); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {messages.map((m) => {
        const Icon = formatIcon(m.format);
        return (
          <Card key={m.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-xs">{formatLabel(m.format)}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>

              <h3 className="font-heading text-lg mt-3 text-foreground">{m.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pour <span className="font-medium text-foreground">{m.recipient_name}</span>
                {m.recipient_relationship && <> · {m.recipient_relationship}</>}
              </p>

              {m.occasion_label && (
                <p className="text-sm mt-2 text-[hsl(270_35%_45%)]">{m.occasion_label}</p>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                {m.trigger_type === 'scheduled_date' && m.scheduled_for ? (
                  <>
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {new Date(m.scheduled_for).toLocaleDateString('fr-CA', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                    {m.is_recurring && <Badge variant="secondary" className="text-xs">Chaque année</Badge>}
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5" />
                    À envoyer après mon décès
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CreateMessageDialog({
  open, onOpenChange, userId, circleId, onCreated,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  userId: string; circleId: string; onCreated: () => void;
}) {
  const [format, setFormat] = useState<Format>('audio');
  const [trigger, setTrigger] = useState<Trigger>('scheduled_date');
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [occasion, setOccasion] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const reset = () => {
    setFormat('audio'); setTrigger('scheduled_date'); setTitle(''); setRecipientName('');
    setRelationship(''); setOccasion(''); setScheduledFor(''); setRecurring(false);
    setTextContent(''); setMediaBlob(null); setMediaUrl(null);
  };

  const startRecording = async () => {
    try {
      const constraints = format === 'video'
        ? { audio: true, video: { facingMode: 'user' } }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (format === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
      const mime = format === 'video' ? 'video/webm' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        setMediaBlob(blob);
        setMediaUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch (e: any) {
      toast.error('Impossible d\'accéder au micro/caméra : ' + (e.message || ''));
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaBlob(f);
    setMediaUrl(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!title.trim() || !recipientName.trim()) {
      toast.error('Titre et destinataire sont obligatoires');
      return;
    }
    if (trigger === 'scheduled_date' && !scheduledFor) {
      toast.error('Choisissez une date d\'envoi');
      return;
    }
    if (format !== 'text' && !mediaBlob) {
      toast.error('Enregistrez ou téléchargez un fichier ' + formatLabel(format).toLowerCase());
      return;
    }
    if (format === 'text' && !textContent.trim()) {
      toast.error('Écrivez votre message');
      return;
    }

    setSaving(true);
    try {
      let mediaPath: string | null = null;
      let mediaMime: string | null = null;
      let mediaSize = 0;
      if (mediaBlob) {
        const ext = format === 'video' ? 'webm' : (mediaBlob.type.split('/')[1] || 'webm').split(';')[0];
        const fileName = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('time-messages')
          .upload(fileName, mediaBlob, { contentType: mediaBlob.type });
        if (upErr) throw upErr;
        mediaPath = fileName;
        mediaMime = mediaBlob.type;
        mediaSize = mediaBlob.size;
      }

      const { error } = await supabase.from('time_messages').insert({
        circle_id: circleId,
        author_id: userId,
        format,
        trigger_type: trigger,
        title: title.trim(),
        text_content: format === 'text' ? textContent.trim() : '',
        media_path: mediaPath,
        media_mime_type: mediaMime,
        media_size_bytes: mediaSize,
        recipient_name: recipientName.trim(),
        recipient_relationship: relationship.trim() || null,
        occasion_label: occasion.trim() || null,
        scheduled_for: trigger === 'scheduled_date' ? scheduledFor : null,
        is_recurring: trigger === 'scheduled_date' ? recurring : false,
        status: trigger === 'scheduled_date' ? 'scheduled' : 'draft',
      });
      if (error) throw error;

      toast.success('Message enregistré');
      reset();
      onOpenChange(false);
      onCreated();
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); } onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Nouveau message dans le temps</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Format */}
          <div>
            <Label className="mb-2 block">Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['audio', 'video', 'text'] as Format[]).map((f) => {
                const Icon = formatIcon(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setFormat(f); setMediaBlob(null); setMediaUrl(null); }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      format === f ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-sm font-medium">{formatLabel(f)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recording / file / text */}
          {format === 'text' ? (
            <div>
              <Label htmlFor="text">Votre message</Label>
              <Textarea
                id="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={6}
                placeholder="Mon cher petit-fils, le jour de tes 18 ans…"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Enregistrement</Label>
              {format === 'video' && (
                <video
                  ref={videoPreviewRef}
                  className="w-full rounded-lg bg-black aspect-video"
                  muted
                  playsInline
                />
              )}
              <div className="flex flex-wrap gap-2">
                {!recording && !mediaUrl && (
                  <Button onClick={startRecording} type="button" className="gap-2">
                    {format === 'video' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    Commencer l'enregistrement
                  </Button>
                )}
                {recording && (
                  <Button onClick={stopRecording} type="button" variant="destructive" className="gap-2">
                    <Square className="w-4 h-4" />
                    Arrêter
                  </Button>
                )}
                {!recording && (
                  <>
                    <input
                      id="file-upload"
                      type="file"
                      accept={format === 'video' ? 'video/*' : 'audio/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button asChild variant="outline" type="button">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Téléverser un fichier
                      </label>
                    </Button>
                  </>
                )}
                {mediaUrl && !recording && (
                  <Button variant="ghost" type="button" onClick={() => { setMediaBlob(null); setMediaUrl(null); }}>
                    Recommencer
                  </Button>
                )}
              </div>
              {mediaUrl && !recording && (
                format === 'video'
                  ? <video src={mediaUrl} controls className="w-full rounded-lg" />
                  : <audio src={mediaUrl} controls className="w-full" />
              )}
            </div>
          )}

          <div>
            <Label htmlFor="title">Titre du message</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Bonne fête pour tes 18 ans" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="recipient">Destinataire</Label>
              <Input id="recipient" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: Léa Dupont" />
            </div>
            <div>
              <Label htmlFor="rel">Lien</Label>
              <Input id="rel" value={relationship} onChange={(e) => setRelationship(e.target.value)}
                placeholder="Ex: Petite-fille" />
            </div>
          </div>

          <div>
            <Label htmlFor="occ">Occasion (facultatif)</Label>
            <Input id="occ" value={occasion} onChange={(e) => setOccasion(e.target.value)}
              placeholder="Ex: 18 ans, mariage, naissance…" />
          </div>

          {/* Trigger */}
          <div>
            <Label className="mb-2 block">Quand l'envoyer ?</Label>
            <Select value={trigger} onValueChange={(v) => setTrigger(v as Trigger)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled_date">À une date précise</SelectItem>
                <SelectItem value="after_death">Après mon décès</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {trigger === 'scheduled_date' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date d'envoi</Label>
                <Input id="date" type="date" value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
                  <span className="text-sm">Répéter chaque année</span>
                </label>
              </div>
            </div>
          )}

          {trigger === 'after_death' && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground flex gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              Ce message sera libéré quand vos gardiens de confiance confirmeront votre décès,
              ou après une longue inactivité (6 mois par défaut).
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer le message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GuardiansDialog({
  open, onOpenChange, userId, circleId, guardians, onChange,
}: {
  open: boolean; onOpenChange: (o: boolean) => void;
  userId: string; circleId: string; guardians: Guardian[]; onChange: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rel, setRel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error('Nom et courriel obligatoires');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('time_message_guardians').insert({
      author_id: userId,
      circle_id: circleId,
      guardian_name: name.trim(),
      guardian_email: email.trim().toLowerCase(),
      guardian_relationship: rel.trim() || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setName(''); setEmail(''); setRel('');
    toast.success('Gardien ajouté');
    onChange();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('time_message_guardians').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Gardien retiré'); onChange(); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Gardiens de confiance
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ces personnes pourront confirmer votre décès et libérer vos messages posthumes.
            Choisissez 1 à 2 personnes en qui vous avez pleinement confiance.
          </p>

          <div className="space-y-2">
            {guardians.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-foreground">{g.guardian_name}</p>
                  <p className="text-xs text-muted-foreground">{g.guardian_email}
                    {g.guardian_relationship && <> · {g.guardian_relationship}</>}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(g.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {guardians.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-4">Aucun gardien désigné</p>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Ajouter un gardien
            </h4>
            <Input placeholder="Nom complet" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Courriel" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Lien (ex: enfant aîné)" value={rel} onChange={(e) => setRel(e.target.value)} />
            <Button onClick={handleAdd} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Ajouter ce gardien
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
