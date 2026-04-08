import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ReadinessData {
  totalItems: number;
  completedItems: number;
  criticalMissing: number;
  needsProfessionalReview: number;
}

interface Props {
  data: ReadinessData;
}

export const ReadinessScore: React.FC<Props> = ({ data }) => {
  const { t } = useLocale();
  const percent = data.totalItems > 0 ? Math.round((data.completedItems / data.totalItems) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">{t.readiness_title}</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t.readiness_complete.replace('{percent}', String(percent))}
          </span>
          <span className="font-semibold text-foreground">{data.completedItems}/{data.totalItems}</span>
        </div>
        <Progress value={percent} className="h-3" />

        {data.criticalMissing > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t.readiness_critical_missing.replace('{count}', String(data.criticalMissing))}
          </div>
        )}

        {data.needsProfessionalReview > 0 && (
          <div className="flex items-center gap-2 text-sm text-warning">
            <Info className="h-4 w-4 shrink-0" />
            {t.readiness_pro_review.replace('{count}', String(data.needsProfessionalReview))}
          </div>
        )}

        {percent === 100 && (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle className="h-4 w-4 shrink-0" />
            ✓
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground italic">{t.readiness_disclaimer}</p>
    </div>
  );
};
