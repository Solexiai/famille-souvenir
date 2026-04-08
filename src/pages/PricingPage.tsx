import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, X } from 'lucide-react';

const PricingPage: React.FC = () => {
  const { t } = useLocale();

  const freeFeatures = t.pricing_free_features;
  const annualFeatures = t.pricing_annual_features;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold text-foreground">{t.app_name}</span>
            <span className="text-sm text-muted-foreground">{t.app_tagline}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost">{t.sign_in}</Button></Link>
            <Link to="/signup"><Button>{t.sign_up}</Button></Link>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-16 md:py-20">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-4">{t.pricing_title}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t.pricing_subtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-xl border border-border bg-card p-8 shadow-card flex flex-col">
            <h2 className="font-heading text-2xl font-semibold text-foreground">{t.pricing_free_title}</h2>
            <p className="mt-2 text-3xl font-bold text-accent">{t.free}</p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
              {freeFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button variant="outline" className="w-full mt-8" size="lg">{t.pricing_cta_free}</Button>
            </Link>
          </div>

          {/* Annual Plan */}
          <div className="rounded-xl border-2 border-accent bg-card p-8 shadow-elevated flex flex-col relative">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground">
              {t.pricing_founder_badge}
            </Badge>
            <h2 className="font-heading text-2xl font-semibold text-foreground">{t.pricing_annual_title}</h2>
            <p className="mt-2 text-3xl font-bold text-muted-foreground line-through opacity-50">{t.pricing_annual_price}</p>
            <p className="text-lg font-semibold text-foreground">{t.pricing_founder_note}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.pricing_annual_price_note}</p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground flex-1">
              {annualFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button className="w-full mt-8" size="lg">{t.pricing_cta_annual}</Button>
            </Link>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-12 space-y-3 text-center max-w-xl mx-auto">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="h-4 w-4 shrink-0" />
            {t.pricing_disclaimer}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.disclaimer_jurisdiction}
          </p>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
