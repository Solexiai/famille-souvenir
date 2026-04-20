import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileCheck, AlertTriangle, Shield } from 'lucide-react';
import type { FamilyCircle, DocumentaryStatus, DeathStatus, DossierReadinessStatus } from '@/types/database';

const documentaryStatusLabels: Record<DocumentaryStatus, string> = {
  unknown: 'Inconnu',
  declared: 'Déclaré',
  located: 'Localisé',
  professionally_confirmed: 'Confirmé par un professionnel',
};

const deathStatusLabels: Record<DeathStatus, string> = {
  not_reported: 'Non signalé',
  reported: 'Décès signalé',
  manually_verified: 'Décès vérifié manuellement',
};

const dossierReadinessLabels: Record<DossierReadinessStatus, string> = {
  initial: 'Initial',
  in_progress: 'En cours de préparation',
  partial: 'Partiel',
  ready_for_professional_review: 'Prêt pour révision professionnelle',
  executor_ready: 'Prêt pour l\'exécuteur',
};

const criticalDocsLabels: Record<string, string> = {
  incomplete: 'Incomplet',
  partial: 'Partiel',
  ready: 'Complet',
  needs_review: 'À vérifier',
};

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

type StatusField = {
  key:
    | 'testament_status'
    | 'mandate_status'
    | 'notary_status'
    | 'beneficiary_designation_status'
    | 'critical_documents_status'
    | 'dossier_readiness_status'
    | 'death_status';
  label: string;
  options: Record<string, string>;
};

const statusFields: StatusField[] = [
  { key: 'testament_status', label: 'Testament', options: documentaryStatusLabels },
  { key: 'mandate_status', label: 'Mandat / Inaptitude', options: documentaryStatusLabels },
  { key: 'notary_status', label: 'Notaire', options: documentaryStatusLabels },
  { key: 'beneficiary_designation_status', label: 'Désignation de bénéficiaires', options: documentaryStatusLabels },
  { key: 'critical_documents_status', label: 'Documents critiques', options: criticalDocsLabels },
  { key: 'dossier_readiness_status', label: 'État du dossier', options: dossierReadinessLabels },
  { key: 'death_status', label: 'Statut de décès', options: deathStatusLabels },
];

export const DocumentaryStatusManager: React.FC<Props> = ({ circle, canEdit, onUpdate }) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);

  const handleChange = async (field: StatusField['key'], value: string) => {
    setSaving(field);
    const updatePayload = { [field]: value } as Partial<FamilyCircle>;
    const { error } = await supabase
      .from('family_circles')
      .update(updatePayload)
      .eq('id', circle.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour.');
    } else {
      toast.success('Statut mis à jour.');
      onUpdate({ [field]: value });

      // Audit log
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
          Statuts documentaires
        </CardTitle>
        <CardDescription>
          Suivi de la préparation du dossier familial. Ces statuts sont indicatifs et ne constituent pas une validation juridique.
        </CardDescription>
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
            <p>
              Ces statuts reflètent l'état de préparation tel que déclaré par la famille.
              Ils ne remplacent pas une vérification par un professionnel (notaire, conseiller juridique).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
