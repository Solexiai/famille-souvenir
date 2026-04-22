import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const TermsPage: React.FC = () => {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-heading text-xl font-semibold text-foreground">{t.app_name}</span>
            <span className="text-sm text-muted-foreground">{t.app_tagline}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="container max-w-3xl py-12">
        <h1 className="font-heading text-3xl font-semibold text-foreground mb-6">{t.terms_title}</h1>
        <div className="prose prose-neutral max-w-none space-y-4 text-muted-foreground">
          <p>{t.terms_intro}</p>
          <h2 className="font-heading text-xl font-medium text-foreground mt-8">{t.terms_service_title}</h2>
          <p>{t.terms_service_desc}</p>
          <h2 className="font-heading text-xl font-medium text-foreground mt-8">{t.terms_responsibility_title}</h2>
          <p>{t.terms_responsibility_desc}</p>
          <h2 className="font-heading text-xl font-medium text-foreground mt-8">{t.terms_ip_title}</h2>
          <p>{t.terms_ip_desc}</p>
        </div>
        <div className="mt-8">
          <Link to="/"><Button variant="outline">{t.terms_back_home}</Button></Link>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
