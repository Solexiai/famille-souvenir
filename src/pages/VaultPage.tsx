import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Lock, FileText, Download } from 'lucide-react';
import type { VaultDocument, VaultVisibility, FamilyCircle } from '@/types/database';
import { z } from 'zod';

const docSchema = z.object({
  label: z.string().trim().min(1, 'Veuillez ajouter un libellé').max(200),
  category: z.string().min(1),
  visibility: z.enum(['owner', 'managers', 'circle']),
});

const categories = [
  { value: 'general', label: 'Général' },
  { value: 'identity', label: 'Identité' },
  { value: 'property', label: 'Propriété' },
  { value: 'insurance', label: 'Assurance' },
  { value: 'financial', label: 'Financier' },
  { value: 'medical', label: 'Médical' },
  { value: 'legal', label: 'Juridique' },
  { value: 'other', label: 'Autre' },
];

const visibilityLabels: Record<VaultVisibility, string> = {
  owner: 'Moi uniquement',
  managers: 'Gestionnaires',
  circle: 'Tout le cercle',
};

const VaultPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('general');
  const [visibility, setVisibility] = useState<VaultVisibility>('owner');
  const [file, setFile] = useState<File | null>(null);

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const { data } = await supabase
      .from('vault_documents')
      .select('*')
      .eq('circle_id', c.id)
      .order('created_at', { ascending: false });
    setDocuments((data as VaultDocument[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = docSchema.safeParse({ label, category, visibility });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (!file) {
      toast.error('Veuillez sélectionner un fichier.');
      return;
    }
    if (!circle || !user) return;

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      toast.error('Le fichier ne doit pas dépasser 20 Mo.');
      return;
    }

    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('vault-private')
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur lors de l'envoi du fichier.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('vault-private').getPublicUrl(filePath);

    const { error } = await supabase.from('vault_documents').insert({
      circle_id: circle.id,
      uploaded_by: user.id,
      label,
      category,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      visibility,
    });

    if (error) {
      toast.error("Erreur lors de l'enregistrement.");
    } else {
      toast.success('Document ajouté au coffre-fort.');
      setLabel('');
      setCategory('general');
      setVisibility('owner');
      setFile(null);
      setDialogOpen(false);
      loadData();
    }
    setUploading(false);
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
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-6 w-6 text-accent" />
              Coffre-fort
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Vos documents privés et confidentiels, stockés en toute sécurité.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Ajouter un document</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Libellé</Label>
                  <Input
                    id="label"
                    placeholder="Acte de naissance, testament..."
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docFile">Fichier</Label>
                  <Input
                    id="docFile"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <p className="text-xs text-muted-foreground">PDF, images ou documents. Max 20 Mo.</p>
                </div>
                <div className="space-y-2">
                  <Label>Visibilité</Label>
                  <Select value={visibility} onValueChange={(v) => setVisibility(v as VaultVisibility)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Moi uniquement</SelectItem>
                      <SelectItem value="managers">Gestionnaires</SelectItem>
                      <SelectItem value="circle">Tout le cercle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {documents.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun document dans le coffre-fort.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ajoutez vos documents importants ici pour les garder en sécurité.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-secondary p-2">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.value === doc.category)?.label || doc.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {visibilityLabels[doc.visibility]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
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

export default VaultPage;
