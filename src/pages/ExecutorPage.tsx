import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Plus, Briefcase, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import type { FamilyCircle, ExecutorWorkspaceNote, ChecklistItem } from '@/types/database';

const ExecutorPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [notes, setNotes] = useState<ExecutorWorkspaceNote[]>([]);
  const [checklistSummary, setChecklistSummary] = useState({ total: 0, completed: 0, needsReview: 0 });
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);
    setIsManager(c.owner_id === user.id);

    const [{ data: notesData }, { data: checklistData }] = await Promise.all([
      supabase.from('executor_workspace_notes').select('*').eq('circle_id', c.id).order('created_at', { ascending: false }),
      supabase.from('checklist_items').select('*').eq('circle_id', c.id),
    ]);
    setNotes((notesData as ExecutorWorkspaceNote[]) || []);

    const items = (checklistData as ChecklistItem[]) || [];
    setChecklistSummary({
      total: items.length,
      completed: items.filter(i => i.status === 'completed').length,
      needsReview: items.filter(i => i.status === 'needs_review').length,
    });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle || !user || !title.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('executor_workspace_notes').insert({
      circle_id: circle.id,
      author_id: user.id,
      title: title.trim(),
      content,
    });
    if (error) toast.error('Erreur lors de la création.');
    else {
      toast.success('Note ajoutée.');
      setTitle(''); setContent('');
      setDialogOpen(false);
      loadData();
    }
    setSaving(false);
  };

  const dossierLabel = (status: string) => {
    const labels: Record<string, string> = {
      initial: 'Initial',
      in_progress: 'En cours',
      partial: 'Partiel',
      ready_for_professional_review: 'Prêt pour révision professionnelle',
      executor_ready: 'Prêt pour l\'exécuteur',
    };
    return labels[status] || status;
  };

  const docStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      unknown: 'Inconnu',
      declared: 'Déclaré',
      located: 'Localisé',
      professionally_confirmed: 'Confirmé par professionnel',
    };
    return labels[status] || status;
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  if (!circle) return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p><Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-accent" />
            Espace exécuteur
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Préparation et coordination pour la transmission du dossier.
          </p>
        </div>

        {/* Legal disclaimer */}
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            Cet espace soutient la préparation, la coordination familiale et la transmission du dossier.
            Il ne remplace pas les vérifications légales ni la reconnaissance officielle du liquidateur
            ou de l'exécuteur testamentaire.
          </AlertDescription>
        </Alert>

        {/* Readiness overview */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">État de préparation du dossier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Dossier</p>
                <Badge variant="outline">{dossierLabel(circle.dossier_readiness_status)}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Décès</p>
                <Badge variant="outline">{circle.death_status === 'not_reported' ? 'Non signalé' : circle.death_status === 'reported' ? 'Signalé' : 'Vérifié manuellement'}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Testament</p>
                <p className="text-sm text-foreground">{docStatusLabel(circle.testament_status)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Mandat</p>
                <p className="text-sm text-foreground">{docStatusLabel(circle.mandate_status)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Notaire</p>
                <p className="text-sm text-foreground">{docStatusLabel(circle.notary_status)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Bénéficiaires</p>
                <p className="text-sm text-foreground">{docStatusLabel(circle.beneficiary_designation_status)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist summary */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-heading text-base">Checklist — Résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">{checklistSummary.completed}/{checklistSummary.total} complets</span>
              </div>
              {checklistSummary.needsReview > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{checklistSummary.needsReview} à vérifier</span>
                </div>
              )}
              {checklistSummary.total === 0 && (
                <span className="text-sm text-muted-foreground">Aucun élément dans la checklist.</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-medium text-foreground">Notes de préparation</h2>
          {isManager && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-heading">Ajouter une note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Titre</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Contacts importants" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu</Label>
                    <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Détails..." rows={5} />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Ajouter
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {notes.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Aucune note de préparation pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id} className="shadow-soft">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-foreground">{note.title}</p>
                  {note.content && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{note.content}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ExecutorPage;
