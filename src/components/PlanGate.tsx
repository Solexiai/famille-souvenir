import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Crown } from 'lucide-react';

interface Props {
  /** i18n key or direct string for the gated feature name */
  featureName?: string;
  /** Optional explanation of why this is premium */
  reason?: string;
  /** Render inline (small banner) vs full card */
  variant?: 'card' | 'inline';
  children?: React.ReactNode;
}

export const PlanGate: React.FC<Props> = ({ featureName, reason, variant = 'card', children }) => {
  const { t } = useLocale();
  const navigate = useNavigate();

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-accent/40 bg-secondary/50 p-4">
        <Lock className="h-5 w-5 text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{featureName ?? t.plan_upgrade_title}</p>
          {reason && <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>}
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate('/choose-plan')} className="shrink-0">
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          {t.upgrade}
        </Button>
        {children}
      </div>
    );
  }

  return (
    <Card className="shadow-card border-dashed border-2 border-accent/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Lock className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="font-heading text-lg">{featureName ?? t.plan_upgrade_title}</CardTitle>
        <CardDescription>{reason ?? t.plan_upgrade_desc}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={() => navigate('/pricing')} size="lg">
          <Crown className="h-4 w-4 mr-2" />
          {t.upgrade}
        </Button>
        {children}
      </CardContent>
    </Card>
  );
};

/** Small inline limit warning shown near a count */
export const LimitWarning: React.FC<{ current: number; max: number; label: string }> = ({ current, max, label }) => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const pct = Math.round((current / max) * 100);
  if (pct < 80) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 mt-2">
      <span>{label}: {current}/{max}</span>
      {pct >= 100 && (
        <Button size="sm" variant="link" className="text-xs h-auto p-0 text-accent" onClick={() => navigate('/pricing')}>
          {t.upgrade}
        </Button>
      )}
    </div>
  );
};
