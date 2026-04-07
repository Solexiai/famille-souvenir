import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Tag, X, Info } from 'lucide-react';
import type { FamilyLabel, MemberFamilyLabel, CircleMember } from '@/types/database';

const familyLabelsFr: Record<FamilyLabel, string> = {
  protected_person: 'Personne protégée',
  family_manager_label: 'Gestionnaire familial',
  caregiver: 'Proche aidant',
  heir_label: 'Héritier',
  trusted_contact: 'Contact de confiance',
  proposed_executor_label: 'Exécuteur pressenti',
  testament_named_executor: 'Exécuteur nommé au testament',
  external_professional: 'Professionnel externe',
};

const labelColors: Record<FamilyLabel, string> = {
  protected_person: 'bg-purple-100 text-purple-800 border-purple-200',
  family_manager_label: 'bg-blue-100 text-blue-800 border-blue-200',
  caregiver: 'bg-green-100 text-green-800 border-green-200',
  heir_label: 'bg-amber-100 text-amber-800 border-amber-200',
  trusted_contact: 'bg-teal-100 text-teal-800 border-teal-200',
  proposed_executor_label: 'bg-orange-100 text-orange-800 border-orange-200',
  testament_named_executor: 'bg-red-100 text-red-800 border-red-200',
  external_professional: 'bg-gray-100 text-gray-800 border-gray-200',
};

// Available labels for assignment (exclude family_manager_label as it mirrors the app role)
const assignableLabels: FamilyLabel[] = [
  'protected_person', 'caregiver', 'heir_label', 'trusted_contact',
  'proposed_executor_label', 'testament_named_executor', 'external_professional',
];

interface Props {
  circleId: string;
  members: CircleMember[];
  canEdit: boolean;
  onLabelsChange?: () => void;
}

export function FamilyLabelBadge({ label }: { label: FamilyLabel }) {
  return (
    <Badge variant="outline" className={`text-xs ${labelColors[label] || ''}`}>
      {familyLabelsFr[label] || label}
    </Badge>
  );
}

export function FamilyLabelsForMember({ labels }: { labels: MemberFamilyLabel[] }) {
  if (!labels.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map(l => <FamilyLabelBadge key={l.id} label={l.label} />)}
    </div>
  );
}

export const FamilyLabelsManager: React.FC<Props> = ({ circleId, members, canEdit, onLabelsChange }) => {
  const { user } = useAuth();
  const [labels, setLabels] = useState<MemberFamilyLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<FamilyLabel | ''>('');
  const [note, setNote] = useState('');

  const loadLabels = async () => {
    const { data } = await supabase
      .from('member_family_labels')
      .select('*')
      .eq('circle_id', circleId);
    setLabels((data as MemberFamilyLabel[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadLabels(); }, [circleId]);

  const getMemberName = (memberId: string) => {
    const m = members.find(m => m.id === memberId);
    return m?.profiles?.full_name || m?.profiles?.email || 'Membre';
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedLabel || !user) return;

    // Check for duplicate
    const exists = labels.find(l => l.member_id === selectedMember && l.label === selectedLabel);
    if (exists) { toast.error('Ce label est déjà attribué à ce membre.'); return; }

    setSaving(true);
    const { error } = await supabase.from('member_family_labels').insert({
      circle_id: circleId,
      member_id: selectedMember,
      label: selectedLabel,
      note: note.trim(),
    });
    if (error) { toast.error('Erreur lors de l\'ajout du label.'); }
    else {
      // Audit log
      await supabase.from('audit_logs').insert({
        circle_id: circleId,
        user_id: user.id,
        action: 'family_label_added',
        details: { member_id: selectedMember, label: selectedLabel, member_name: getMemberName(selectedMember) },
      });
      toast.success('Label familial ajouté.');
      setSelectedMember(''); setSelectedLabel(''); setNote('');
      setDialogOpen(false);
      loadLabels();
      onLabelsChange?.();
    }
    setSaving(false);
  };

  const handleRemove = async (labelEntry: MemberFamilyLabel) => {
    if (!user) return;
    const { error } = await supabase.from('member_family_labels').delete().eq('id', labelEntry.id);
    if (error) { toast.error('Erreur lors de la suppression.'); return; }
    await supabase.from('audit_logs').insert({
      circle_id: circleId,
      user_id: user.id,
      action: 'family_label_removed',
      details: { member_id: labelEntry.member_id, label: labelEntry.label, member_name: getMemberName(labelEntry.member_id) },
    });
    toast.success('Label supprimé.');
    loadLabels();
    onLabelsChange?.();
  };

  // Group labels by member
  const labelsByMember = labels.reduce<Record<string, MemberFamilyLabel[]>>((acc, l) => {
    (acc[l.member_id] = acc[l.member_id] || []).push(l);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Tag className="h-5 w-5 text-accent" />
              Labels familiaux
            </CardTitle>
            <CardDescription className="mt-1">
              Identifications familiales et humaines — distinctes des rôles applicatifs.
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" />Attribuer</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Attribuer un label familial</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Membre</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.profiles?.full_name || m.profiles?.email || 'Membre'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Select value={selectedLabel} onValueChange={(v) => setSelectedLabel(v as FamilyLabel)}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner un label" /></SelectTrigger>
                      <SelectContent>
                        {assignableLabels.map(l => (
                          <SelectItem key={l} value={l}>{familyLabelsFr[l]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Note (optionnel)</Label>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Précision..." />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving || !selectedMember || !selectedLabel}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Attribuer le label
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(labelsByMember).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun label familial attribué.</p>
        ) : (
          Object.entries(labelsByMember).map(([memberId, memberLabels]) => (
            <div key={memberId} className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">{getMemberName(memberId)}</p>
              <div className="flex flex-wrap gap-2">
                {memberLabels.map(l => (
                  <div key={l.id} className="flex items-center gap-1">
                    <FamilyLabelBadge label={l.label} />
                    {canEdit && (
                      <button onClick={() => handleRemove(l)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {memberLabels.some(l => l.note) && (
                <div className="space-y-1">
                  {memberLabels.filter(l => l.note).map(l => (
                    <p key={l.id} className="text-xs text-muted-foreground italic">
                      {familyLabelsFr[l.label]} : {l.note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            Les labels familiaux identifient le rôle humain de chaque personne dans la famille.
            Ils ne modifient pas les permissions applicatives et ne constituent pas une désignation légale.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export { familyLabelsFr, labelColors };
