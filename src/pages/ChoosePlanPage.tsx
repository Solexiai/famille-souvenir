import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Shield, Heart, Clock, Sparkles, ChevronLeft } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupportedLanguage } from '@/i18n/types';

type PlanKey = 'essential' | 'family' | 'legacy';

interface PlanCopy {
  name: string;
  fit: string;
  benefits: string[];
  cta: string;
  recommendedBadge?: string;
  microReassurance?: string;
}

interface PageCopy {
  step: string;
  back: string;
  headline: string;
  supporting: string;
  reassurance: string;
  plans: Record<PlanKey, PlanCopy>;
  compareLink: string;
  howTitle: string;
  steps: { title: string; desc: string }[];
  trust: string[];
  finalReassurance: string;
}

const COPY: Record<SupportedLanguage, PageCopy> = {
  fr: {
    step: 'Étape 1 sur 2 · Choisir votre protection',
    back: 'Retour',
    headline: 'Choisissez la protection qui vous convient',
    supporting:
      'Que vous commenciez pour vous-même ou pour votre famille, Solexi vous aide à protéger l’essentiel avec clarté, simplicité et sérénité.',
    reassurance: 'Un parcours simple pour avancer à votre rythme.',
    plans: {
      essential: {
        name: 'Essentiel',
        fit: 'Pour commencer simplement, seul ou à deux',
        benefits: [
          'Volontés et documents essentiels',
          'Espace sécurisé personnel',
          'Mise en place facile',
        ],
        cta: 'Choisir Essentiel',
      },
      family: {
        name: 'Famille',
        fit: 'Le plus choisi',
        benefits: [
          'Volontés, documents et souvenirs',
          'Accès pensé pour les proches',
          'Meilleure protection familiale',
        ],
        cta: 'Choisir Famille',
        recommendedBadge: 'Recommandé pour la plupart des familles',
        microReassurance: 'Le meilleur équilibre pour protéger l’essentiel',
      },
      legacy: {
        name: 'Héritage',
        fit: 'Pour une protection plus complète, avec accompagnement notarial',
        benefits: [
          'Volontés, documents et souvenirs enrichis',
          'Protection plus complète',
          'Pensé pour transmettre davantage',
        ],
        cta: 'Choisir Héritage',
      },
    },
    compareLink: 'Comparer les protections',
    howTitle: 'Comment ça fonctionne',
    steps: [
      { title: 'Créez votre espace', desc: 'Commencez simplement dans un environnement sécurisé.' },
      { title: 'Ajoutez l’essentiel', desc: 'Réunissez vos volontés, documents et souvenirs importants.' },
      { title: 'Protégez vos proches', desc: 'Offrez-leur des repères clairs lorsqu’ils en auront le plus besoin.' },
    ],
    trust: ['Espace sécurisé', 'Pensé pour vos proches', 'Jusqu’à 100 ans de conservation'],
    finalReassurance:
      'Choisissez votre protection en toute simplicité. Vous pourrez ensuite compléter votre espace à votre rythme.',
  },
  en: {
    step: 'Step 1 of 2 · Choose your protection',
    back: 'Back',
    headline: 'Choose the protection that is right for you',
    supporting:
      'Whether you are starting for yourself or for your family, Solexi helps you protect what matters with clarity, simplicity, and peace of mind.',
    reassurance: 'A simple path, at your own pace.',
    plans: {
      essential: {
        name: 'Essential',
        fit: 'A simple way to begin',
        benefits: [
          'Essential wishes and documents',
          'Personal secure space',
          'Easy to set up',
        ],
        cta: 'Choose Essential',
      },
      family: {
        name: 'Family',
        fit: 'Most chosen',
        benefits: [
          'Wishes, documents, and memories',
          'Access designed for loved ones',
          'Stronger family protection',
        ],
        cta: 'Choose Family',
        recommendedBadge: 'Recommended for most families',
        microReassurance: 'The best balance to protect what matters',
      },
      legacy: {
        name: 'Legacy',
        fit: 'For more complete protection',
        benefits: [
          'Enriched wishes, documents, and memories',
          'More complete protection',
          'Designed to pass on more',
        ],
        cta: 'Choose Legacy',
      },
    },
    compareLink: 'Compare protections',
    howTitle: 'How it works',
    steps: [
      { title: 'Create your space', desc: 'Begin simply in a secure environment.' },
      { title: 'Add what matters', desc: 'Gather your wishes, documents, and important memories.' },
      { title: 'Protect your loved ones', desc: 'Offer them clear guidance when they need it most.' },
    ],
    trust: ['Secure space', 'Built for your loved ones', 'Up to 100 years of preservation'],
    finalReassurance:
      'Choose your protection with confidence. You can complete your space at your own pace afterwards.',
  },
  es: {
    step: 'Paso 1 de 2 · Elija su protección',
    back: 'Atrás',
    headline: 'Elija la protección que más le convenga',
    supporting:
      'Ya sea que comience por usted o por su familia, Solexi le ayuda a proteger lo esencial con claridad, sencillez y serenidad.',
    reassurance: 'Un camino sencillo para avanzar a su ritmo.',
    plans: {
      essential: {
        name: 'Esencial',
        fit: 'Para comenzar de forma sencilla',
        benefits: [
          'Voluntades y documentos esenciales',
          'Espacio seguro personal',
          'Configuración fácil',
        ],
        cta: 'Elegir Esencial',
      },
      family: {
        name: 'Familia',
        fit: 'El más elegido',
        benefits: [
          'Voluntades, documentos y recuerdos',
          'Acceso pensado para los seres queridos',
          'Mejor protección familiar',
        ],
        cta: 'Elegir Familia',
        recommendedBadge: 'Recomendado para la mayoría de las familias',
        microReassurance: 'El mejor equilibrio para proteger lo esencial',
      },
      legacy: {
        name: 'Legado',
        fit: 'Para una protección más completa',
        benefits: [
          'Voluntades, documentos y recuerdos enriquecidos',
          'Protección más completa',
          'Pensado para transmitir aún más',
        ],
        cta: 'Elegir Legado',
      },
    },
    compareLink: 'Comparar protecciones',
    howTitle: 'Cómo funciona',
    steps: [
      { title: 'Cree su espacio', desc: 'Comience de forma sencilla en un entorno seguro.' },
      { title: 'Añada lo esencial', desc: 'Reúna sus voluntades, documentos y recuerdos importantes.' },
      { title: 'Proteja a sus seres queridos', desc: 'Ofrézcales puntos de referencia claros cuando más lo necesiten.' },
    ],
    trust: ['Espacio seguro', 'Pensado para sus seres queridos', 'Hasta 100 años de conservación'],
    finalReassurance:
      'Elija su protección con toda tranquilidad. Después podrá completar su espacio a su propio ritmo.',
  },
};

const PLAN_ORDER: PlanKey[] = ['essential', 'family', 'legacy'];

const ChoosePlanPage: React.FC = () => {
  const { lang, setLang } = useLocale();
  const navigate = useNavigate();
  const c = COPY[lang];

  const handleChoose = (plan: PlanKey) => {
    navigate(`/selected-plan?plan=${plan}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.7)]" aria-hidden="true" />
            <span className="text-base md:text-xl font-heading font-semibold text-foreground tracking-tight">
              Solexi.ai
            </span>
          </Link>

          <div className="flex items-center gap-1.5 md:gap-3">
            <Select value={lang} onValueChange={(v) => setLang(v as SupportedLanguage)}>
              <SelectTrigger
                aria-label="Language"
                className="h-9 w-[68px] md:w-[88px] rounded-full border border-border bg-background text-foreground text-xs md:text-sm font-medium px-2.5 md:px-3 hover:bg-muted/40 transition-colors"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Intro ─── */}
        <section className="relative overflow-hidden">
          {/* Subtle premium ambient background */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.04] via-background to-background"
          />
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-72 w-72 md:h-[420px] md:w-[420px] rounded-full bg-accent/10 blur-3xl"
          />

          <div className="container max-w-3xl px-5 md:px-6 pt-10 md:pt-20 pb-12 md:pb-16 text-center">
            {/* Back link */}
            <div className="mb-8 md:mb-10 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {c.back}
              </Link>
            </div>

            {/* Step indicator */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-[11px] md:text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {c.step}
            </div>

            <h1 className="mt-7 md:mt-10 font-heading text-[1.875rem] leading-[1.2] md:text-5xl md:leading-[1.1] font-semibold text-foreground tracking-tight">
              {c.headline}
            </h1>

            <p className="mt-5 md:mt-7 text-[16px] md:text-lg leading-[1.65] text-foreground/75 max-w-xl mx-auto">
              {c.supporting}
            </p>

            <p className="mt-7 md:mt-9 text-[14px] md:text-sm leading-relaxed text-foreground/60 italic max-w-md mx-auto">
              {c.reassurance}
            </p>
          </div>
        </section>

        {/* ─── Plan cards ─── */}
        <section className="container max-w-6xl px-4 md:px-6 pt-2 md:pt-4 pb-10 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 lg:gap-7">
            {PLAN_ORDER.map((key) => {
              const plan = c.plans[key];
              const isRecommended = key === 'family';

              return (
                <article
                  key={key}
                  className={[
                    'relative flex flex-col rounded-2xl bg-card transition-all duration-300',
                    isRecommended
                      ? 'border-2 border-accent/80 shadow-elevated md:-translate-y-1.5'
                      : 'border border-border/50 shadow-soft hover:shadow-card hover:-translate-y-0.5',
                  ].join(' ')}
                >
                  {isRecommended && plan.recommendedBadge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[11px] md:text-xs font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.6)] whitespace-nowrap">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        {plan.recommendedBadge}
                      </span>
                    </div>
                  )}

                  <div className="px-6 py-7 md:px-7 md:py-8 flex flex-col flex-1">
                    <header className="text-center md:text-left">
                      <h2 className="font-heading text-[1.625rem] md:text-[1.625rem] font-semibold text-foreground tracking-tight leading-tight">
                        {plan.name}
                      </h2>
                      <p className="mt-2 text-[14.5px] md:text-sm text-foreground/70 leading-relaxed">
                        {plan.fit}
                      </p>
                    </header>

                    <div
                      className="my-5 md:my-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
                      aria-hidden="true"
                    />

                    <ul className="space-y-3.5 md:space-y-3.5 flex-1">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-[15px] md:text-[15px] leading-[1.55] text-foreground/90">
                          <span
                            className={[
                              'mt-[3px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
                              isRecommended ? 'bg-accent/15 text-accent' : 'bg-muted text-foreground/70',
                            ].join(' ')}
                            aria-hidden="true"
                          >
                            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                          </span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {isRecommended && plan.microReassurance && (
                      <p className="mt-5 md:mt-6 text-center md:text-left text-[13.5px] md:text-xs text-accent italic leading-relaxed">
                        {plan.microReassurance}
                      </p>
                    )}

                    <Button
                      onClick={() => handleChoose(key)}
                      size="lg"
                      variant={isRecommended ? 'default' : 'outline'}
                      className={[
                        'mt-6 md:mt-7 w-full gap-2 rounded-full font-semibold',
                        isRecommended
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_10px_30px_-10px_hsl(var(--accent)/0.55)]'
                          : 'border-foreground/15 text-foreground hover:bg-muted/60',
                      ].join(' ')}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Compare link */}
          <div className="mt-10 md:mt-12 text-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-5 py-2.5 text-[14px] md:text-sm font-medium text-foreground/85 hover:text-accent hover:border-accent/40 hover:bg-card transition-colors"
            >
              {c.compareLink}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="border-y border-border/40 bg-muted/20">
          <div className="container max-w-5xl px-5 md:px-6 py-16 md:py-20">
            <h2 className="text-center font-heading text-[1.625rem] md:text-3xl font-semibold text-foreground tracking-tight">
              {c.howTitle}
            </h2>

            <ol className="mt-12 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
              {c.steps.map((step, i) => (
                <li key={i} className="text-center md:text-left">
                  <div className="flex md:block flex-col items-center md:items-start">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent/25 bg-background text-base font-heading font-semibold text-accent shadow-[0_4px_14px_-4px_hsl(var(--accent)/0.25)]"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <h3 className="mt-5 md:mt-6 font-heading text-[1.25rem] md:text-xl font-semibold text-foreground tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 md:mt-3 text-[15px] md:text-[15px] leading-[1.65] text-foreground/70 max-w-[20rem] md:max-w-none">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Trust strip ─── */}
        <section className="container max-w-4xl px-5 md:px-6 py-14 md:py-16">
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {[
              { icon: Shield, label: c.trust[0] },
              { icon: Heart, label: c.trust[1] },
              { icon: Clock, label: c.trust[2] },
            ].map(({ icon: Icon, label }, i) => (
              <li
                key={i}
                className="flex items-center justify-center gap-2.5 rounded-full border border-border/50 bg-card/50 px-4 py-3 text-[14px] md:text-sm font-medium text-foreground/85"
              >
                <Icon className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── Final reassurance ─── */}
        <section className="container max-w-2xl px-6 md:px-6 pb-16 md:pb-24 text-center">
          <p className="text-[15px] md:text-base text-foreground/75 leading-[1.7]">
            {c.finalReassurance}
          </p>
        </section>
      </main>
    </div>
  );
};

export default ChoosePlanPage;
