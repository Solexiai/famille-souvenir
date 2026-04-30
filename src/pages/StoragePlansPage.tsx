import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Check,
  Sparkles,
  Loader2,
  Calendar,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Plan {
  id: string;
  code: string;
  label: string;
  storage_gb: number;
  price_annual_cad: number | null;
  price_30_years_cad: number | null;
  is_free: boolean;
  sort_order: number;
}

export default function StoragePlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'annual' | '30_years'>('annual');

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from('storage_plans')
        .select('*')
        .order('sort_order');
      setPlans((data as Plan[]) ?? []);
      setLoading(false);
    })();
  }, []);

  function handleChoose(plan: Plan) {
    if (plan.is_free) {
      toast.info('Vous utilisez déjà le forfait gratuit');
      return;
    }
    toast.info(
      'Le paiement sécurisé sera disponible très bientôt. Nous vous contacterons.',
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/gallery')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour à mon album
          </Button>
        </div>

        <div className="text-center space-y-3">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Choisissez votre espace de stockage
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Conservez en sécurité toutes les photos et vidéos de votre famille.
            Payez à l'année, ou une seule fois pour 30 ans de tranquillité.
          </p>
        </div>

        {/* Switch annuel / 30 ans */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border-2 border-border bg-card p-1">
            <button
              onClick={() => setBillingCycle('annual')}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Calendar className="h-4 w-4" />
              Par année
            </button>
            <button
              onClick={() => setBillingCycle('30_years')}
              className={cn(
                'px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                billingCycle === '30_years'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <InfinityIcon className="h-4 w-4" />
              Pour 30 ans
              <Badge className="bg-accent/20 text-accent-foreground border-0 ml-1">
                économisez
              </Badge>
            </button>
          </div>
        </div>

        {/* Grille des forfaits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const price = plan.is_free
              ? 0
              : billingCycle === 'annual'
              ? plan.price_annual_cad
              : plan.price_30_years_cad;
            const isHighlighted = plan.code === 'paid_500gb';

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col',
                  isHighlighted && 'border-2 border-accent shadow-lg',
                )}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground border-0 px-3 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Recommandé
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <h3 className="font-heading text-2xl font-bold text-foreground">
                      {plan.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.is_free
                        ? 'Pour bien commencer'
                        : plan.storage_gb >= 1024
                        ? 'Toute une vie de souvenirs'
                        : 'Famille moyenne'}
                    </p>
                  </div>

                  <div className="my-6">
                    {plan.is_free ? (
                      <div className="text-4xl font-heading font-bold text-foreground">
                        Gratuit
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-heading font-bold text-foreground">
                            {price} $
                          </span>
                          <span className="text-sm text-muted-foreground">
                            CAD
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {billingCycle === 'annual' ? 'par année' : 'pour 30 ans'}
                        </div>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        <strong>{plan.storage_gb} Go</strong> de stockage
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        Photos et vidéos illimitées (dans la limite)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        Partagé avec tous les membres de la famille
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">
                        Sauvegarde sécurisée
                      </span>
                    </li>
                    {!plan.is_free && billingCycle === '30_years' && (
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-foreground">
                          Garantie 30 ans — un seul paiement
                        </span>
                      </li>
                    )}
                  </ul>

                  <Button
                    className="w-full mt-6"
                    size="lg"
                    variant={isHighlighted ? 'default' : 'outline'}
                    disabled={plan.is_free}
                    onClick={() => handleChoose(plan)}
                  >
                    {plan.is_free ? 'Forfait actuel' : 'Choisir ce forfait'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          Tous les prix sont en dollars canadiens (CAD), taxes en sus. Vous pouvez
          changer ou annuler votre forfait à tout moment.
        </p>
      </div>
    </AppLayout>
  );
}
