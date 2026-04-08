import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SupportedLanguage } from '@/i18n/types';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLocale();

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const icons = [Users, FileText, CheckSquare, Shield];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold text-foreground">{t.app_name}</span>
            <span className="text-sm text-muted-foreground">{t.app_tagline}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <Select value={lang} onValueChange={(v) => setLang(v as SupportedLanguage)}>
              <SelectTrigger className="w-24 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/pricing">
              <Button variant="ghost" size="sm">{t.landing_pricing}</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost">{t.sign_in}</Button>
            </Link>
            <Link to="/signup">
              <Button>{t.sign_up}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-20 text-center">
        <div className="mx-auto max-w-2xl animate-fade-in">
          <h1 className="font-heading text-4xl font-semibold leading-tight text-foreground md:text-5xl">
            {t.landing_hero_title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            {t.landing_hero_subtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/setup">
              <Button size="xl">{t.landing_cta_start}</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">{t.landing_cta_login}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container pb-16">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl font-semibold text-foreground">{t.landing_why_title}</h2>
          <p className="mt-2 text-muted-foreground">{t.landing_why_subtitle}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.landing_features.map((feature, i) => {
            const Icon = icons[i] ?? Shield;
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-soft text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-medium text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why now */}
      <section className="container pb-16">
        <div className="mx-auto max-w-xl bg-secondary/50 rounded-xl p-8 border border-border">
          <h2 className="font-heading text-xl font-semibold text-foreground text-center mb-6 flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            {t.landing_why_now_title}
          </h2>
          <ul className="space-y-4">
            {t.landing_why_now_items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 h-2 w-2 rounded-full bg-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>{t.landing_footer_rights.replace('{year}', String(new Date().getFullYear()))}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">{t.landing_privacy}</Link>
            <Link to="/terms" className="hover:text-foreground">{t.landing_terms}</Link>
            <Link to="/pricing" className="hover:text-foreground">{t.landing_pricing}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
