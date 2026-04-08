import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface Props {
  featureName?: string;
  children?: React.ReactNode;
}

export const PlanGate: React.FC<Props> = ({ featureName, children }) => {
  const { t } = useLocale();
  const navigate = useNavigate();

  return (
    <Card className="shadow-card border-dashed border-2 border-accent/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Lock className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="font-heading text-lg">{featureName ?? t.plan_upgrade_title}</CardTitle>
        <CardDescription>{t.plan_upgrade_desc}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={() => navigate('/pricing')} size="lg">
          {t.upgrade}
        </Button>
        {children}
      </CardContent>
    </Card>
  );
};
