import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Shield, Heart, Clock, Sparkles, ChevronLeft, Leaf, Users, Gem, FolderHeart, Compass } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupportedLanguage } from '@/i18n/types';

type PlanKey = 'essential' | 'family' | 'legacy';

interface PlanCopy {
  name: string;
  subtitle: string;
  description: string;
  benefits: string[];
  price: string;
  priceNote?: string;
  cta: string;
  smallLine: string;
  recommendedBadge?: string;
}

interface BenefitLine {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface PageCopy {
  step: string;
  back: string;
  signin: string;
  headline: string;
  supporting: string;
  reassurance: string;
  benefitLines: BenefitLine[];
  plans: Record<PlanKey, PlanCopy>;
  trust: string[];
  finalReassurance: string;
}

const COPY: Record<SupportedLanguage, PageCopy> = {
  fr: {
    step: 'Étape 1 sur 1 · Choisir votre protection',
    back: 'Retour',
    signin: 'Se connecter',
    headline: 'Choisissez la protection qui vous convient',
    supporting:
      'Que vous commenciez seul, à deux ou pour votre famille, Solexi vous aide à protéger l’essentiel avec clarté, simplicité et sérénité.',
    reassurance: 'Un parcours simple pour avancer à votre rythme.',
    benefitLines: [
      { icon: Sparkles, label: 'Vos volontés mieux organisées' },
      { icon: FolderHeart, label: 'Vos documents réunis au même endroit' },
      { icon: Compass, label: 'Vos proches mieux guidés' },
    ],
    plans: {
      essential: {
        name: 'Essentiel',
        subtitle: 'Pour commencer simplement, seul ou à deux',
        description:
          'Un guide structuré pour organiser vos volontés et vos informations essentielles.',
        benefits: [
          'Sections claires pour ne rien oublier',
          'Informations importantes réunies au même endroit',
          'À compléter chez vous, à votre rythme',
        ],
        price: '49,99 $',
        priceNote: 'accès immédiat',
        cta: 'Continuer avec Essentiel',
        smallLine: 'Téléchargement immédiat · À imprimer et compléter',
      },
      family: {
        name: 'Famille',
        subtitle: 'Le plus choisi',
        description:
          'La plateforme Solexi.ai pour organiser, partager et protéger l’essentiel en famille.',
        benefits: [
          'Créez votre cercle familial et invitez vos proches',
          'Centralisez volontés, documents et souvenirs',
          'Définissez vos priorités et votre organisation',
          'Accès structuré et sécurisé pour les membres',
        ],
        price: '149,99 $',
        priceNote: 'par an',
        cta: 'Continuer avec Famille',
        smallLine: 'Accès à la plateforme · Mise en place immédiate',
        recommendedBadge: 'Recommandé pour la plupart des familles',
      },
      legacy: {
        name: 'Héritage',
        subtitle: 'Pour aller plus loin avec votre famille',
        description:
          'La plateforme Solexi.ai avec préparation testamentaire pour votre cercle familial.',
        benefits: [
          'Tout ce qui est inclus dans Famille',
          'Accès à un testament pour votre cercle familial',
          'Orientation vers un notaire',
          'Transmission plus structurée et sécurisée',
        ],
        price: '299,99 $',
        priceNote: 'par an',
        cta: 'Continuer avec Héritage',
        smallLine: 'Accès à la plateforme · Accompagnement avancé',
      },
    },
    trust: ['Espace sécurisé', 'Pensé pour vos proches', 'Jusqu’à 100 ans de conservation'],
    finalReassurance:
      'Choisissez votre protection en toute simplicité. Vous pourrez ensuite compléter votre espace à votre rythme.',
  },
  en: {
    step: 'Step 1 of 1 · Choose your protection',
    back: 'Back',
    signin: 'Sign in',
    headline: 'Choose the protection that is right for you',
    supporting:
      'Whether you start on your own, as a couple, or for your family, Solexi helps you protect what matters with clarity, simplicity, and peace of mind.',
    reassurance: 'A simple path, at your own pace.',
    benefitLines: [
      { icon: Sparkles, label: 'Your wishes better organized' },
      { icon: FolderHeart, label: 'Your documents in one place' },
      { icon: Compass, label: 'Your loved ones better guided' },
    ],
    plans: {
      essential: {
        name: 'Essential',
        subtitle: 'A simple way to begin, alone or as a couple',
        description:
          'A structured guide to organize your wishes and your essential information.',
        benefits: [
          'Clear sections so nothing is forgotten',
          'Important information gathered in one place',
          'Complete at home, at your own pace',
        ],
        price: '$49.99',
        priceNote: 'instant access',
        cta: 'Continue with Essential',
        smallLine: 'Instant download · Print and complete',
      },
      family: {
        name: 'Family',
        subtitle: 'Most chosen',
        description:
          'The Solexi.ai platform to organize, share, and protect what matters as a family.',
        benefits: [
          'Create your family circle and invite loved ones',
          'Centralize wishes, documents, and memories',
          'Define your priorities and organization',
          'Structured, secure access for members',
        ],
        price: '$149.99',
        priceNote: 'per year',
        cta: 'Continue with Family',
        smallLine: 'Platform access · Immediate setup',
        recommendedBadge: 'Recommended for most families',
      },
      legacy: {
        name: 'Legacy',
        subtitle: 'To go further with your family',
        description:
          'The Solexi.ai platform with will preparation for your family circle.',
        benefits: [
          'Everything included in Family',
          'Access to a will for your family circle',
          'Guidance toward a notary',
          'More structured and secure transmission',
        ],
        price: '$299.99',
        priceNote: 'per year',
        cta: 'Continue with Legacy',
        smallLine: 'Platform access · Advanced support',
      },
    },
    trust: ['Secure space', 'Built for your loved ones', 'Up to 100 years of preservation'],
    finalReassurance:
      'Choose your protection with confidence. You can complete your space at your own pace afterwards.',
  },
  es: {
    step: 'Paso 1 de 1 · Elija su protección',
    back: 'Atrás',
    signin: 'Iniciar sesión',
    headline: 'Elija la protección que más le convenga',
    supporting:
      'Ya sea que comience solo, en pareja o por su familia, Solexi le ayuda a proteger lo esencial con claridad, sencillez y serenidad.',
    reassurance: 'Un camino sencillo para avanzar a su ritmo.',
    benefitLines: [
      { icon: Sparkles, label: 'Sus voluntades mejor organizadas' },
      { icon: FolderHeart, label: 'Sus documentos reunidos en un solo lugar' },
      { icon: Compass, label: 'Sus seres queridos mejor guiados' },
    ],
    plans: {
      essential: {
        name: 'Esencial',
        subtitle: 'Para comenzar de forma sencilla, solo o en pareja',
        description:
          'Una guía estructurada para organizar sus voluntades y su información esencial.',
        benefits: [
          'Secciones claras para no olvidar nada',
          'Información importante reunida en un solo lugar',
          'Para completar en casa, a su ritmo',
        ],
        price: '$49.99',
        priceNote: 'acceso inmediato',
        cta: 'Continuar con Esencial',
        smallLine: 'Descarga inmediata · Para imprimir y completar',
      },
      family: {
        name: 'Familia',
        subtitle: 'El más elegido',
        description:
          'La plataforma Solexi.ai para organizar, compartir y proteger lo esencial en familia.',
        benefits: [
          'Cree su círculo familiar e invite a sus seres queridos',
          'Centralice voluntades, documentos y recuerdos',
          'Defina sus prioridades y su organización',
          'Acceso estructurado y seguro para los miembros',
        ],
        price: '$149.99',
        priceNote: 'por año',
        cta: 'Continuar con Familia',
        smallLine: 'Acceso a la plataforma · Configuración inmediata',
        recommendedBadge: 'Recomendado para la mayoría de las familias',
      },
      legacy: {
        name: 'Legado',
        subtitle: 'Para ir más lejos con su familia',
        description:
          'La plataforma Solexi.ai con preparación testamentaria para su círculo familiar.',
        benefits: [
          'Todo lo incluido en Familia',
          'Acceso a un testamento para su círculo familiar',
          'Orientación hacia un notario',
          'Transmisión más estructurada y segura',
        ],
        price: '$299.99',
        priceNote: 'por año',
        cta: 'Continuar con Legado',
        smallLine: 'Acceso a la plataforma · Acompañamiento avanzado',
      },
    },
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
    // Direct to signup/checkout — no intermediate steps
    navigate(`/signup?plan=${plan}`);
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
            <Link
              to="/login"
              className="hidden sm:inline-flex text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
            >
              {c.signin}
            </Link>
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
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.04] via-background to-background"
          />
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 h-72 w-72 md:h-[420px] md:w-[420px] rounded-full bg-accent/10 blur-3xl"
          />

          <div className="container max-w-3xl px-5 md:px-6 pt-8 md:pt-20 pb-8 md:pb-12 text-center">
            {/* Back link */}
            <div className="mb-7 md:mb-10 flex justify-center">
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

            <h1 className="mt-6 md:mt-10 font-heading text-[1.75rem] leading-[1.2] md:text-5xl md:leading-[1.1] font-semibold text-foreground tracking-tight">
              <span className="relative inline-block">
                <span className="relative z-10">{c.headline}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 400 12"
                  preserveAspectRatio="none"
                  className="absolute left-0 right-0 -bottom-2 md:-bottom-3 w-full h-[8px] md:h-[12px] text-accent"
                >
                  <path
                    d="M3 7 C 60 2, 140 10, 210 5 S 340 9, 397 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-5 md:mt-7 text-[15.5px] md:text-lg leading-[1.65] text-foreground/75 max-w-xl mx-auto">
              {c.supporting}
            </p>

            <p className="mt-5 md:mt-7 text-[13.5px] md:text-sm leading-relaxed text-foreground/55 italic max-w-md mx-auto">
              {c.reassurance}
            </p>

            {/* 3 benefit lines */}
            <ul className="mt-7 md:mt-9 flex flex-col sm:flex-row sm:flex-wrap sm:justify-center items-center gap-3 sm:gap-x-6 sm:gap-y-2.5">
              {c.benefitLines.map(({ icon: Icon, label }, i) => (
                <li
                  key={i}
                  className="inline-flex items-center gap-2 text-[13.5px] md:text-sm text-foreground/75"
                >
                  <Icon className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Plan cards ─── */}
        <section className="container max-w-6xl px-4 md:px-6 pt-2 md:pt-4 pb-8 md:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6 lg:gap-7 md:items-stretch">
            {PLAN_ORDER.map((key) => {
              const plan = c.plans[key];
              const isRecommended = key === 'family';
              const PlanIcon = key === 'essential' ? Leaf : key === 'family' ? Users : Gem;

              return (
                <article
                  key={key}
                  className={[
                    'relative flex flex-col rounded-2xl transition-all duration-300 overflow-hidden',
                    isRecommended
                      ? 'bg-card border-2 border-accent shadow-elevated md:-translate-y-2 ring-1 ring-accent/20'
                      : 'bg-card/80 border border-border shadow-soft hover:shadow-card hover:-translate-y-0.5 hover:border-foreground/20',
                  ].join(' ')}
                >
                  {/* Top accent bar */}
                  <div
                    aria-hidden="true"
                    className={[
                      'h-1 w-full',
                      key === 'essential' && 'bg-gradient-to-r from-transparent via-foreground/30 to-transparent',
                      key === 'family' && 'bg-gradient-to-r from-accent/60 via-accent to-accent/60',
                      key === 'legacy' && 'bg-gradient-to-r from-transparent via-primary/40 to-transparent',
                    ].filter(Boolean).join(' ')}
                  />

                  {isRecommended && plan.recommendedBadge && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[11px] md:text-xs font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.6)] whitespace-nowrap">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        {plan.recommendedBadge}
                      </span>
                    </div>
                  )}

                  <div className={[
                    'px-6 py-7 md:px-7 md:py-8 flex flex-col flex-1',
                    isRecommended ? 'pt-9 md:pt-10' : '',
                  ].join(' ')}>
                    <header className="text-center md:text-left">
                      <div className="flex justify-center md:justify-start mb-4">
                        <span
                          className={[
                            'inline-flex h-11 w-11 items-center justify-center rounded-xl',
                            isRecommended
                              ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                              : key === 'legacy'
                                ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
                                : 'bg-muted text-foreground/70 ring-1 ring-border',
                          ].join(' ')}
                          aria-hidden="true"
                        >
                          <PlanIcon className="h-5 w-5" />
                        </span>
                      </div>

                      <h2 className="font-heading text-[1.5rem] md:text-[1.625rem] font-semibold text-foreground tracking-tight leading-tight">
                        {plan.name}
                      </h2>
                      <p className="mt-1.5 text-[13px] md:text-[13px] uppercase tracking-wider font-medium text-accent/90">
                        {plan.subtitle}
                      </p>
                      <p className="mt-3 text-[14px] md:text-sm text-foreground/70 leading-relaxed">
                        {plan.description}
                      </p>
                    </header>

                    {/* Price */}
                    <div className="mt-6 md:mt-7 text-center md:text-left">
                      <div className="flex items-baseline justify-center md:justify-start gap-2 flex-wrap">
                        <span className="font-heading text-[2rem] md:text-[2.25rem] leading-none font-semibold text-foreground tracking-tight">
                          {plan.price}
                        </span>
                        {plan.priceNote && (
                          <span className="text-[13.5px] md:text-sm text-foreground/60">
                            {plan.priceNote}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="my-5 md:my-6 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
                      aria-hidden="true"
                    />

                    <ul className="space-y-3 md:space-y-3.5 flex-1">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3 text-[14.5px] md:text-[15px] leading-[1.55] text-foreground/90">
                          <span
                            className={[
                              'mt-[3px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
                              isRecommended
                                ? 'bg-accent/15 text-accent'
                                : key === 'legacy'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-foreground/70',
                            ].join(' ')}
                            aria-hidden="true"
                          >
                            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                          </span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

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

                    <p className="mt-3.5 text-center text-[12.5px] md:text-xs text-foreground/55 leading-relaxed">
                      {plan.smallLine}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ─── Trust strip ─── */}
        <section className="container max-w-4xl px-5 md:px-6 py-8 md:py-14">
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 md:gap-4">
            {[
              { icon: Shield, label: c.trust[0] },
              { icon: Heart, label: c.trust[1] },
              { icon: Clock, label: c.trust[2] },
            ].map(({ icon: Icon, label }, i) => (
              <li
                key={i}
                className="flex items-center justify-center gap-2.5 rounded-full border border-border/50 bg-card/50 px-4 py-2.5 md:py-3 text-[13.5px] md:text-sm font-medium text-foreground/85"
              >
                <Icon className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ─── Final reassurance ─── */}
        <section className="container max-w-2xl px-6 md:px-6 pb-14 md:pb-24 text-center">
          <p className="text-[14.5px] md:text-base text-foreground/70 leading-[1.7]">
            {c.finalReassurance}
          </p>
        </section>
      </main>
    </div>
  );
};

export default ChoosePlanPage;
