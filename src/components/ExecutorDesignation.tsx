import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield, FileText, UserCheck } from 'lucide-react';
import type { CircleMember, MemberFamilyLabel, AppRole, FamilyLabel } from '@/types/database';
import { FamilyLabelBadge } from './FamilyLabelsManager';

const roleLabels: Record<string, string> = {
  proposed_executor: 'Exécuteur pressenti (rôle applicatif)',
  verified_executor: 'Exécuteur documenté (rôle applicatif vérifié)',
};

interface Props {
  members: CircleMember[];
  labels: MemberFamilyLabel[];
}

interface ExecutorInfo {
  memberId: string;
  memberName: string;
  designations: {
    type: 'family_proposed' | 'testament_named' | 'app_verified';
    label: string;
    icon: React.FC<{ className?: string }>;
    description: string;
  }[];
}

export const ExecutorDesignation: React.FC<Props> = ({ members, labels }) => {
  // Build executor info from 3 layers
  const executorMap = new Map<string, ExecutorInfo>();

  const getMemberName = (memberId: string) => {
    const m = members.find(m => m.id === memberId);
    return m?.profiles?.full_name || m?.profiles?.email || 'Membre';
  };

  const ensureEntry = (memberId: string): ExecutorInfo => {
    if (!executorMap.has(memberId)) {
      executorMap.set(memberId, { memberId, memberName: getMemberName(memberId), designations: [] });
    }
    return executorMap.get(memberId)!;
  };

  // Layer 1: Family labels (proposed_executor_label, testament_named_executor)
  labels.forEach(l => {
    if (l.label === 'proposed_executor_label') {
      ensureEntry(l.member_id).designations.push({
        type: 'family_proposed',
        label: 'Désignation familiale',
        icon: UserCheck,
        description: 'Identifié par la famille comme exécuteur pressenti.',
      });
    }
    if (l.label === 'testament_named_executor') {
      ensureEntry(l.member_id).designations.push({
        type: 'testament_named',
        label: 'Mention documentaire',
        icon: FileText,
        description: 'Mentionné dans un testament ou document comme exécuteur.',
      });
    }
  });

  // Layer 2: App roles (proposed_executor, verified_executor)
  members.forEach(m => {
    if (m.role === 'proposed_executor' || m.role === 'verified_executor') {
      const entry = ensureEntry(m.id);
      entry.designations.push({
        type: 'app_verified',
        label: m.role === 'verified_executor' ? 'Accès applicatif vérifié' : 'Accès applicatif pressenti',
        icon: Shield,
        description: m.role === 'verified_executor'
          ? 'Dispose d\'un accès applicatif vérifié à l\'espace exécuteur.'
          : 'Dispose d\'un accès limité à l\'espace exécuteur.',
      });
    }
  });

  const executors = Array.from(executorMap.values());

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          Désignation de l'exécuteur
        </CardTitle>
        <CardDescription>
          Trois niveaux distincts : désignation familiale, mention documentaire, et accès applicatif.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {executors.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-muted-foreground">Aucune désignation d'exécuteur pour le moment.</p>
            <p className="text-xs text-muted-foreground">
              Utilisez les labels familiaux pour identifier un exécuteur pressenti ou nommé au testament.
            </p>
          </div>
        ) : (
          executors.map(exec => (
            <div key={exec.memberId} className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{exec.memberName}</p>
              <div className="space-y-2">
                {exec.designations.map((d, i) => {
                  const Icon = d.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-md bg-secondary/50 p-3">
                      <Icon className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.label}</p>
                        <p className="text-xs text-muted-foreground">{d.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* 3-tier explanation */}
        <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
          <p className="text-xs font-medium text-foreground">Comprendre les niveaux :</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• <strong>Désignation familiale</strong> — Coordination familiale. Ne confère pas de pouvoir légal.</p>
            <p>• <strong>Mention documentaire</strong> — Basée sur un document existant. À confirmer selon les vérifications applicables.</p>
            <p>• <strong>Accès applicatif vérifié</strong> — Donne accès à l'espace exécuteur dans l'application. Ne constitue pas une nomination légale.</p>
          </div>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            Les désignations affichées ici soutiennent la coordination familiale et la préparation du dossier.
            Elles ne remplacent pas les vérifications légales ni les documents officiels.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
