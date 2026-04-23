import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Shield, Heart, Clock, ChevronLeft } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { SupportedLanguage } from '@/i18n/types';

type PlanKey = 'essential' | 'family' | 'legacy';

interface PageCopy {
  step: string;
  back: string;
  smallLabel: string;
  headline: (planName: string) => string;
  supporting: string;
  reassurance: string;
  includedTitle: string;
  included: string[];
  whyTitle: string;
  whyBody: string;
  whyBullets: string[];
  trust: string[];
  nextTitle: string;
  nextBody: string;
  primaryCta: (planName: string) => string;
  secondaryLink: string;
  planNames: Record<PlanKey, string>;
}

const COPY: Record<SupportedLanguage, PageCopy> = {
  fr: {
    step: 'Étape 2 sur 2 · Confirmer votre protection',
    back: 'Retour aux protections',
    smallLabel: 'Votre protection choisie',
    headline: (n) => `Vous avez choisi ${n}`,
    supporting: 'Une protection pensée pour centraliser l’essentiel et mieux guider vos proches.',
    reassurance: 'Un choix clair, simple et rassurant pour la plupart des familles.',
    includedTitle: 'Ce que comprend votre protection',
    included: [
      'Volontés et documents essentiels',
      'Souvenirs importants',
      'Accès pensé pour les proches',
      'Espace sécurisé structuré',
      'Conservation jusqu’à 100 ans',
    ],
    whyTitle: 'Pourquoi ce forfait convient si bien',
    whyBody:
      'Le forfait Famille offre un excellent équilibre entre simplicité, protection et transmission. Il permet de réunir l’essentiel dans un espace clair, sécurisé et pensé pour vos proches.',
    whyBullets: [
      'Idéal pour la plupart des familles',
      'Facile à mettre en place',
      'Pensé pour éviter le flou et les oublis',
    ],
    trust: ['Espace sécurisé', 'Pensé pour vos proches', 'Jusqu’à 100 ans de conservation'],
    nextTitle: 'La prochaine étape',
    nextBody:
      'Continuez pour créer votre espace et commencer à ajouter ce qui compte le plus, à votre rythme.',
    primaryCta: (n) => `Continuer avec ${n}`,
    secondaryLink: 'Retour aux protections',
    planNames: { essential: 'Essentiel', family: 'Famille', legacy: 'Héritage' },
  },
  en: {
    step: 'Step 2 of 2 · Confirm your protection',
    back: 'Back to protections',
    smallLabel: 'Your chosen protection',
    headline: (n) => `You chose ${n}`,
    supporting:
      'A protection designed to bring together what matters and gently guide your loved ones.',
    reassurance: 'A clear, simple, and reassuring choice for most families.',
    includedTitle: 'What your protection includes',
    included: [
      'Essential wishes and documents',
      'Meaningful memories',
      'Access designed for loved ones',
      'A structured, secure space',
      'Up to 100 years of preservation',
    ],
    whyTitle: 'Why this plan fits so well',
    whyBody:
      'The Family plan offers a great balance between simplicity, protection, and transmission. It brings the essentials together in a clear, secure space designed for your loved ones.',
    whyBullets: [
      'Ideal for most families',
      'Easy to set up',
      'Designed to avoid confusion and oversights',
    ],
    trust: ['Secure space', 'Designed for loved ones', 'Up to 100 years of preservation'],
    nextTitle: 'The next step',
    nextBody:
      'Continue to create your space and start adding what matters most, at your own pace.',
    primaryCta: (n) => `Continue with ${n}`,
    secondaryLink: 'Back to protections',
    planNames: { essential: 'Essential', family: 'Family', legacy: 'Legacy' },
  },
  es: {
    step: 'Paso 2 de 2 · Confirma tu protección',
    back: 'Volver a las protecciones',
    smallLabel: 'Tu protección elegida',
    headline: (n) => `Has elegido ${n}`,
    supporting:
      'Una protección pensada para reunir lo esencial y guiar mejor a tus seres queridos.',
    reassurance: 'Una elección clara, sencilla y tranquilizadora para la mayoría de las familias.',
    includedTitle: 'Lo que incluye tu protección',
    included: [
      'Voluntades y documentos esenciales',
      'Recuerdos importantes',
      'Acceso pensado para los seres queridos',
      'Espacio seguro y estructurado',
      'Conservación hasta 100 años',
    ],
    whyTitle: 'Por qué este plan encaja tan bien',
    whyBody:
      'El plan Familia ofrece un excelente equilibrio entre simplicidad, protección y transmisión. Permite reunir lo esencial en un espacio claro, seguro y pensado para los tuyos.',
    whyBullets: [
      'Ideal para la mayoría de las familias',
      'Fácil de configurar',
      'Pensado para evitar dudas y olvidos',
    ],
    trust: ['Espacio seguro', 'Pensado para los tuyos', 'Hasta 100 años de conservación'],
    nextTitle: 'El siguiente paso',
    nextBody:
      'Continúa para crear tu espacio y empezar a añadir lo que más importa, a tu ritmo.',
    primaryCta: (n) => `Continuar con ${n}`,
    secondaryLink: 'Volver a las protecciones',
    planNames: { essential: 'Esencial', family: 'Familia', legacy: 'Legado' },
  },
};

const SelectedPlanPage: React.FC = () => {
  const { lang } = useLocale();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planParam = (params.get('plan') as PlanKey) || 'family';
  const plan: PlanKey = ['essential', 'family', 'legacy'].includes(planParam) ? planParam : 'family';
  const c = COPY[lang];
  const planName = c.planNames[plan];

  const trustIcons = [Shield, Heart, Clock];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
        {/* Top nav */}
        <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.18em] text-muted-foreground/80">
          <button
            type="button"
            onClick={() => navigate('/choose-plan')}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="normal-case tracking-normal text-[13px]">{c.back}</span>
          </button>
          <span className="hidden sm:inline">{c.step}</span>
        </div>

        {/* Confirmation hero */}
        <section className="mt-10 text-center md:mt-14">
          <p className="text-[11px] uppercase tracking-[0.22em] text-accent/90">
            {c.smallLabel}
          </p>
          <h1 className="mt-5 font-heading text-[1.875rem] leading-[1.15] md:text-5xl font-semibold tracking-tight">
            {c.headline(planName)}
          </h1>
          <p className="mt-6 md:mt-7 text-[16px] md:text-lg leading-[1.65] text-foreground/75 max-w-xl mx-auto">
            {c.supporting}
          </p>
          <p className="mt-6 text-[13px] md:text-sm leading-relaxed text-muted-foreground/80 italic max-w-md mx-auto">
            {c.reassurance}
          </p>
        </section>

        {/* Included features */}
        <section className="mt-14 md:mt-20">
          <h2 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-center">
            {c.includedTitle}
          </h2>
          <ul className="mt-7 md:mt-9 mx-auto max-w-md space-y-4">
            {c.included.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3.5 text-[15px] leading-[1.55] text-foreground/90"
              >
                <span className="mt-[7px] flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/10">
                  <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Why this plan */}
        <section className="mt-14 md:mt-20 rounded-2xl border border-border/50 bg-card/60 px-6 py-8 md:px-9 md:py-10 shadow-soft">
          <h2 className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
            {c.whyTitle}
          </h2>
          <p className="mt-4 text-[15px] md:text-base leading-[1.7] text-foreground/80">
            {c.whyBody}
          </p>
          <ul className="mt-6 space-y-3">
            {c.whyBullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-foreground/85"
              >
                <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent/70" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Trust strip */}
        <section className="mt-12 md:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
            {c.trust.map((t, i) => {
              const Icon = trustIcons[i];
              return (
                <div
                  key={t}
                  className="flex flex-1 items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3.5"
                >
                  <Icon className="h-4 w-4 flex-none text-accent" strokeWidth={1.75} />
                  <span className="text-[14px] leading-snug text-foreground/85">{t}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Next step */}
        <section className="mt-14 md:mt-20 text-center">
          <h2 className="font-heading text-xl md:text-2xl font-semibold tracking-tight">
            {c.nextTitle}
          </h2>
          <p className="mt-5 text-[15.5px] md:text-base leading-[1.7] text-foreground/80 max-w-lg mx-auto">
            {c.nextBody}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(`/setup?plan=${plan}`)}
              className="w-full sm:w-auto sm:min-w-[280px] gap-2 rounded-full px-8 py-6 text-[15px] font-medium shadow-elevated"
            >
              {c.primaryCta(planName)}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              type="button"
              onClick={() => navigate('/choose-plan')}
              className="text-[13.5px] text-muted-foreground/90 underline-offset-4 hover:text-foreground hover:underline transition-colors"
            >
              {c.secondaryLink}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SelectedPlanPage;
