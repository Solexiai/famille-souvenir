import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileCheck, AlertTriangle } from 'lucide-react';
import type { FamilyCircle, DocumentaryStatus, DeathStatus, DossierReadinessStatus } from '@/types/database';

const statusColor = (val: string) => {
  if (['unknown', 'not_reported', 'incomplete', 'initial'].includes(val)) return 'bg-muted text-muted-foreground';
  if (['declared', 'reported', 'partial', 'in_progress'].includes(val)) return 'bg-amber-100 text-amber-800';
  if (['located', 'ready', 'ready_for_professional_review'].includes(val)) return 'bg-blue-100 text-blue-800';
  if (['professionally_confirmed', 'manually_verified', 'executor_ready'].includes(val)) return 'bg-green-100 text-green-800';
  return 'bg-muted text-muted-foreground';
};

interface Props {
  circle: FamilyCircle;
  canEdit: boolean;
  onUpdate: (updated: Partial<FamilyCircle>) => void;
}

type FieldKey =
  | 'testament_status'
  | 'mandate_status'
  | 'notary_status'
  | 'beneficiary_designation_status'
  | 'critical_documents_status'
  | 'dossier_readiness_status'
  | 'death_status';

export const DocumentaryStatusManager: React.FC<Props> = ({ circle, canEdit, onUpdate }) => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [saving, setSaving] = useState<string | null>(null);

  const documentaryStatusLabels: Record<DocumentaryStatus, string> = {
    unknown: t.docmgr_doc_unknown,
    declared: t.docmgr_doc_declared,
    located: t.docmgr_doc_located,
    professionally_confirmed: t.docmgr_doc_confirmed,
  };

  const deathStatusLabels: Record<DeathStatus, string> = {
    not_reported: t.docmgr_death_not_reported,
    reported: t.docmgr_death_reported,
    manually_verified: t.docmgr_death_verified,
  };

  const dossierReadinessLabels: Record<DossierReadinessStatus, string> = {
    initial: t.docmgr_dossier_initial,
    in_progress: t.docmgr_dossier_in_progress,
    partial: t.docmgr_dossier_partial,
    ready_for_professional_review: t.docmgr_dossier_ready_review,
    executor_ready: t.docmgr_dossier_executor_ready,
  };

  const criticalDocsLabels: Record<string, string> = {
    incomplete: t.docmgr_critical_incomplete,
    partial: t.docmgr_critical_partial,
    ready: t.docmgr_critical_ready,
    needs_review: t.docmgr_critical_needs_review,
  };

  const statusFields: Array<{ key: FieldKey; label: string; options: Record<string, string> }> = [
    { key: 'testament_status', label: t.docmgr_field_testament, options: documentaryStatusLabels },
    { key: 'mandate_status', label: t.docmgr_field_mandate, options: documentaryStatusLabels },
    { key: 'notary_status', label: t.docmgr_field_notary, options: documentaryStatusLabels },
    { key: 'beneficiary_designation_status', label: t.docmgr_field_beneficiaries, options: documentaryStatusLabels },
    { key: 'critical_documents_status', label: t.docmgr_field_critical_docs, options: criticalDocsLabels },
    { key: 'dossier_readiness_status', label: t.docmgr_field_dossier, options: dossierReadinessLabels },
    { key: 'death_status', label: t.docmgr_field_death_status, options: deathStatusLabels },
  ];

  const handleChange = async (field: FieldKey, value: string) => {
    setSaving(field);
    const updatePayload = { [field]: value } as Partial<FamilyCircle>;
    const { error } = await supabase
      .from('family_circles')
      .update(updatePayload)
      .eq('id', circle.id);

    if (error) {
      toast.error(t.docmgr_update_error);
    } else {
      toast.success(t.docmgr_status_updated);
      onUpdate({ [field]: value });

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        circle_id: circle.id,
        action: 'documentary_status_update',
        details: { field, old_value: circle[field], new_value: value },
      });
    }
    setSaving(null);
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-accent" />
          {t.docmgr_card_title}
        </CardTitle>
        <CardDescription>{t.docmgr_subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusFields.map((sf) => {
          const currentValue = String(circle[sf.key] || '');
          return (
            <div key={sf.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
              <div className="shrink-0">
                <p className="text-sm font-medium text-foreground">{sf.label}</p>
              </div>
              {canEdit ? (
                <Select
                  value={currentValue}
                  onValueChange={(v) => handleChange(sf.key, v)}
                  disabled={saving === sf.key}
                >
                  <SelectTrigger className="w-full sm:w-[220px] md:w-[260px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(sf.options).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={`text-xs ${statusColor(currentValue)}`}>
                  {sf.options[currentValue] || currentValue}
                </Badge>
              )}
            </div>
          );
        })}

        <div className="pt-3 border-t border-border">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{t.docmgr_disclaimer_full}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
