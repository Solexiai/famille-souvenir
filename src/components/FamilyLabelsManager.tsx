import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
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
import type { Translations } from '@/i18n/types';

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

const assignableLabels: FamilyLabel[] = [
  'protected_person', 'caregiver', 'heir_label', 'trusted_contact',
  'proposed_executor_label', 'testament_named_executor', 'external_professional',
];

const getLabelName = (t: Translations, label: FamilyLabel): string => {
  const map: Record<FamilyLabel, string> = {
    protected_person: t.labels_protected_person,
    family_manager_label: t.labels_family_manager,
    caregiver: t.labels_caregiver,
    heir_label: t.labels_heir,
    trusted_contact: t.labels_trusted_contact,
    proposed_executor_label: t.labels_proposed_executor,
    testament_named_executor: t.labels_testament_executor,
    external_professional: t.labels_external_pro,
  };
  return map[label] || label;
};

interface Props {
  circleId: string;
  members: CircleMember[];
  canEdit: boolean;
  onLabelsChange?: () => void;
}

export function FamilyLabelBadge({ label }: { label: FamilyLabel }) {
  const { t } = useLocale();
  return (
    <Badge variant="outline" className={`text-xs ${labelColors[label] || ''}`}>
      {getLabelName(t, label)}
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
  const { t } = useLocale();
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
    return m?.profiles?.full_name || m?.profiles?.email || t.labels_member_default;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedLabel || !user) return;

    const exists = labels.find(l => l.member_id === selectedMember && l.label === selectedLabel);
    if (exists) { toast.error(t.labels_duplicate); return; }

    setSaving(true);
    const { error } = await supabase.from('member_family_labels').insert({
      circle_id: circleId,
      member_id: selectedMember,
      label: selectedLabel,
      note: note.trim(),
    });
    if (error) { toast.error(t.labels_add_error); }
    else {
      await supabase.from('audit_logs').insert({
        circle_id: circleId,
        user_id: user.id,
        action: 'family_label_added',
        details: { member_id: selectedMember, label: selectedLabel, member_name: getMemberName(selectedMember) },
      });
      toast.success(t.labels_added);
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
    if (error) { toast.error(t.labels_remove_error); return; }
    await supabase.from('audit_logs').insert({
      circle_id: circleId,
      user_id: user.id,
      action: 'family_label_removed',
      details: { member_id: labelEntry.member_id, label: labelEntry.label, member_name: getMemberName(labelEntry.member_id) },
    });
    toast.success(t.labels_removed);
    loadLabels();
    onLabelsChange?.();
  };

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
              {t.labels_card_title}
            </CardTitle>
            <CardDescription className="mt-1">{t.labels_card_desc}</CardDescription>
          </div>
          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" />{t.labels_assign}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">{t.labels_assign_dialog_title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.labels_member}</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger><SelectValue placeholder={t.labels_select_member} /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.profiles?.full_name || m.profiles?.email || t.labels_member_default}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.labels_label}</Label>
                    <Select value={selectedLabel} onValueChange={(v) => setSelectedLabel(v as FamilyLabel)}>
                      <SelectTrigger><SelectValue placeholder={t.labels_select_label} /></SelectTrigger>
                      <SelectContent>
                        {assignableLabels.map(l => (
                          <SelectItem key={l} value={l}>{getLabelName(t, l)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.labels_note_optional}</Label>
                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.labels_note_input_placeholder} />
                  </div>
                  <Button type="submit" className="w-full" disabled={saving || !selectedMember || !selectedLabel}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t.labels_assign_btn_long}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(labelsByMember).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t.labels_empty_state}</p>
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
                      {getLabelName(t, l.label)} : {l.note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">{t.labels_disclaimer_full}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export { labelColors };
