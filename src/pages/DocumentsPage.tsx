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
import { Loader2, Plus, FileText, Download, FolderOpen } from 'lucide-react';
import type { FamilyCircle, Document as DocType, DocumentVisibility, VerificationStatus } from '@/types/database';
import { LimitWarning } from '@/components/PlanGate';
import { usePlan, FREE_LIMITS } from '@/hooks/usePlan';
import { useLocale } from '@/contexts/LocaleContext';

const categories = [
  { value: 'identity', label: 'Identité' },
  { value: 'testament', label: 'Testament' },
  { value: 'mandate', label: 'Mandat / Inaptitude' },
  { value: 'insurance', label: 'Assurances' },
  { value: 'banking', label: 'Bancaire' },
  { value: 'investments', label: 'Placements' },
  { value: 'property', label: 'Immobilier' },
  { value: 'vehicles', label: 'Véhicules' },
  { value: 'debts', label: 'Dettes' },
  { value: 'taxes', label: 'Impôts' },
  { value: 'medical', label: 'Médical' },
  { value: 'wishes', label: 'Volontés' },
  { value: 'contracts', label: 'Contrats' },
  { value: 'subscriptions', label: 'Abonnements' },
  { value: 'digital_assets', label: 'Actifs numériques' },
  { value: 'funeral', label: 'Funéraire' },
  { value: 'other', label: 'Autre' },
];

const visibilityLabels: Record<DocumentVisibility, string> = {
  private_owner: 'Moi uniquement',
  managers_only: 'Gestionnaires',
  family_circle: 'Tout le cercle',
  heirs_only: 'Héritiers uniquement',
  executor_workspace: 'Espace exécuteur',
  verified_executor_only: 'Exécuteur vérifié',
};

const verificationLabels: Record<VerificationStatus, string> = {
  unreviewed: 'Non examiné',
  identified: 'Identifié',
  needs_update: 'À mettre à jour',
  needs_professional_review: 'Revoir pro.',
  document_verified: 'Vérifié',
};

const verificationColors: Record<VerificationStatus, string> = {
  unreviewed: 'bg-muted text-muted-foreground',
  identified: 'bg-primary/10 text-primary',
  needs_update: 'bg-amber-100 text-amber-800',
  needs_professional_review: 'bg-orange-100 text-orange-800',
  document_verified: 'bg-green-100 text-green-800',
};

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const { plan } = usePlan();
  const { t } = useLocale();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [visibility, setVisibility] = useState<DocumentVisibility>('private_owner');
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('circle_id', c.id)
      .order('created_at', { ascending: false });
    setDocuments((data as DocType[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !circle || !user || !title.trim()) return;
    if (file.size > 20 * 1024 * 1024) { toast.error('Max 20 Mo.'); return; }
    setUploading(true);

    const ext = file.name.split('.').pop();
    const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('vault-private').upload(storagePath, file);
    if (uploadError) { toast.error("Erreur lors de l'envoi du fichier."); setUploading(false); return; }

    const { error } = await supabase.from('documents').insert({
      circle_id: circle.id,
      uploaded_by: user.id,
      title: title.trim(),
      description,
      category,
      visibility,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
    });

    if (error) toast.error("Erreur lors de l'enregistrement.");
    else {
      await supabase.from('audit_logs').insert({
        circle_id: circle.id, user_id: user.id,
        action: 'document_uploaded',
        details: { title: title.trim(), category, visibility, file_name: file.name },
      });
      toast.success('Document ajouté avec succès.');
      setTitle(''); setDescription(''); setCategory('other'); setVisibility('private_owner'); setFile(null);
      setDialogOpen(false);
      loadData();
    }
    setUploading(false);
  };

  const handleDownload = async (doc: DocType) => {
    const { data, error } = await supabase.storage.from('vault-private').createSignedUrl(doc.storage_path, 300);
    if (error || !data) { toast.error('Erreur lors du téléchargement.'); return; }
    window.open(data.signedUrl, '_blank');
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  if (!circle) return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p><Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button></div></AppLayout>;

  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-heading text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-accent shrink-0" />
                Documents
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Centre documentaire structuré et sécurisé.
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 shrink-0 text-xs sm:text-sm">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg mx-3">
                <DialogHeader>
                  <DialogTitle className="font-heading">Ajouter un document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Titre</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Acte de naissance" required className="text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes..." className="text-sm min-h-[60px]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm">Catégorie</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs sm:text-sm">Visibilité</Label>
                      <Select value={visibility} onValueChange={(v) => setVisibility(v as DocumentVisibility)}>
                        <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(visibilityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Fichier</Label>
                    <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required className="text-sm" />
                    <p className="text-[10px] sm:text-xs text-muted-foreground">PDF, images ou documents. Max 20 Mo.</p>
                  </div>
                  <Button type="submit" className="w-full text-sm" disabled={uploading}>
                    {uploading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
                    Enregistrer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <LimitWarning current={documents.length} max={FREE_LIMITS.maxDocuments} label={t.plan_gate_document_limit} />
        </div>

        {/* Document list */}
        {documents.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-10 sm:py-12 text-center">
              <FolderOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">Aucun document enregistré.</p>
              <p className="text-xs text-muted-foreground mt-1">Centralisez vos documents importants ici.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-soft overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="rounded-lg bg-secondary p-2 shrink-0 mt-0.5">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 break-words">{doc.description}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                          {categories.find(c => c.value === doc.category)?.label || doc.category}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5">
                          {visibilityLabels[doc.visibility]}
                        </Badge>
                        <Badge className={`text-[10px] sm:text-xs px-1.5 py-0.5 ${verificationColors[doc.verification_status]}`}>
                          {verificationLabels[doc.verification_status]}
                        </Badge>
                        <span className="text-[10px] sm:text-xs text-muted-foreground ml-auto">
                          {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
