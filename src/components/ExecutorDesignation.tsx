import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Shield, FileText, UserCheck } from 'lucide-react';
import type { CircleMember, MemberFamilyLabel } from '@/types/database';
import { useLocale } from '@/contexts/LocaleContext';

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
  const { t } = useLocale();
  const executorMap = new Map<string, ExecutorInfo>();

  const getMemberName = (memberId: string) => {
    const m = members.find(m => m.id === memberId);
    return m?.profiles?.full_name || m?.profiles?.email || t.member_default || 'Membre';
  };

  const ensureEntry = (memberId: string): ExecutorInfo => {
    if (!executorMap.has(memberId)) {
      executorMap.set(memberId, { memberId, memberName: getMemberName(memberId), designations: [] });
    }
    return executorMap.get(memberId)!;
  };

  labels.forEach(l => {
    if (l.label === 'proposed_executor_label') {
      ensureEntry(l.member_id).designations.push({
        type: 'family_proposed',
        label: t.exec_desg_family_proposed,
        icon: UserCheck,
        description: t.exec_desg_family_proposed_desc,
      });
    }
    if (l.label === 'testament_named_executor') {
      ensureEntry(l.member_id).designations.push({
        type: 'testament_named',
        label: t.exec_desg_testament_named,
        icon: FileText,
        description: t.exec_desg_testament_named_desc,
      });
    }
  });

  members.forEach(m => {
    if (m.role === 'proposed_executor' || m.role === 'verified_executor') {
      const entry = ensureEntry(m.id);
      entry.designations.push({
        type: 'app_verified',
        label: m.role === 'verified_executor' ? t.exec_desg_app_verified : t.exec_desg_app_proposed,
        icon: Shield,
        description: m.role === 'verified_executor'
          ? t.exec_desg_app_verified_desc
          : t.exec_desg_app_proposed_desc,
      });
    }
  });

  const executors = Array.from(executorMap.values());

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          {t.exec_desg_title}
        </CardTitle>
        <CardDescription>
          {t.exec_desg_subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {executors.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-sm text-muted-foreground">{t.exec_desg_none}</p>
            <p className="text-xs text-muted-foreground">{t.exec_desg_none_desc}</p>
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

        <div className="rounded-lg bg-secondary/30 p-4 space-y-2">
          <p className="text-xs font-medium text-foreground">{t.exec_desg_levels_title}</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• {t.exec_desg_level_family}</p>
            <p>• {t.exec_desg_level_documentary}</p>
            <p>• {t.exec_desg_level_app}</p>
          </div>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-800">
            {t.exec_desg_disclaimer}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
