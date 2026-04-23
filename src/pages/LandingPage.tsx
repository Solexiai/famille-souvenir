import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import {
  Shield, Users, FileText, CheckSquare, Lock, Globe, Languages,
  ArrowRight, Heart, Scale, Briefcase, Eye, Star, ChevronLeft, ChevronRight, Quote,
} from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SupportedLanguage } from '@/i18n/types';
import { LANGUAGE_ORDER, LANGUAGE_LABELS } from '@/i18n/config';

import logoSolexi from '@/assets/logo-solexi.png';
import heroBg from '@/assets/landing-hero-bg.jpg';

// Testimonial portraits
import frMarie from '@/assets/testimonials/fr-marie.jpg';
import frJeanFrancois from '@/assets/testimonials/fr-jeanfrancois.jpg';
import frSylvie from '@/assets/testimonials/fr-sylvie.jpg';
import frCarlos from '@/assets/testimonials/fr-carlos.jpg';
import enPatricia from '@/assets/testimonials/en-patricia.jpg';
import enJames from '@/assets/testimonials/en-james.jpg';
import enSarah from '@/assets/testimonials/en-sarah.jpg';
import enTomLisa from '@/assets/testimonials/en-tomlisa.jpg';
import esLucia from '@/assets/testimonials/es-lucia.jpg';
import esAndres from '@/assets/testimonials/es-andres.jpg';
import esIsabel from '@/assets/testimonials/es-isabel.jpg';
import esMartin from '@/assets/testimonials/es-martin.jpg';

interface Testimonial {
  quote: string;
  name: string;
  age: string;
  location: string;
  photo: string;
}

const testimonialsByLang: Record<SupportedLanguage, Testimonial[]> = {
  fr: [
    {
      quote: "J'ai enfin fait ce que je remettais depuis des années. En dix minutes, c'était fait. Un énorme poids de moins — et une paix immense.",
      name: 'Marie T.',
      age: '67 ans',
      location: 'Québec, QC',
      photo: frMarie,
    },
    {
      quote: "Quand mon père est tombé malade, on savait exactement quoi faire. Tout était là, clair, organisé. Solexi nous a épargnés d'un chaos insupportable.",
      name: 'Jean-François L.',
      age: '45 ans',
      location: 'Ottawa, ON',
      photo: frJeanFrancois,
    },
    {
      quote: "Plus simple qu'un formulaire d'impôt. Et infiniment plus important. Je le recommande à toute personne qui aime quelqu'un.",
      name: 'Sylvie M.',
      age: '58 ans',
      location: 'Montréal, QC',
      photo: frSylvie,
    },
    {
      quote: "Ma famille vit entre Montréal et Miami. Solexi nous a permis de tout centraliser, peu importe la juridiction. C'est exactement ce qu'il nous fallait.",
      name: 'Carlos R.',
      age: '52 ans',
      location: 'Miami, FL',
      photo: frCarlos,
    },
  ],
  en: [
    {
      quote: "After my husband's passing, I was lost in paperwork. A friend suggested Solexi — within a week, I had everything organized. It gave me clarity when I needed it most.",
      name: 'Patricia H.',
      age: '71',
      location: 'Scottsdale, AZ',
      photo: enPatricia,
    },
    {
      quote: "I'm a planner by nature, but estate stuff always felt overwhelming. Solexi broke it down into manageable steps. Now my kids won't have to figure it all out alone.",
      name: 'James K.',
      age: '59',
      location: 'Nashville, TN',
      photo: enJames,
    },
    {
      quote: "My parents live in Florida, my brother in Seattle. Solexi gave us one place to coordinate everything — no more scattered emails and lost documents.",
      name: 'Sarah B.',
      age: '42',
      location: 'Portland, OR',
      photo: enSarah,
    },
    {
      quote: "I thought this kind of tool was only for wealthy families. Turns out it's for anyone who wants to spare their loved ones unnecessary stress. Worth every minute.",
      name: 'Tom & Lisa D.',
      age: '53',
      location: 'Charlotte, NC',
      photo: enTomLisa,
    },
  ],
  es: [
    {
      quote: "Después del fallecimiento de mi esposo, no sabía por dónde empezar. Solexi me guió paso a paso. Hoy tengo todo en orden y mis hijos están tranquilos.",
      name: 'Lucía V.',
      age: '68 años',
      location: 'Guadalajara, MX',
      photo: esLucia,
    },
    {
      quote: "Somos una familia grande repartida entre Colombia y Chile. Solexi nos dio un espacio común para organizar lo importante sin depender de mensajes perdidos.",
      name: 'Andrés P.',
      age: '44 años',
      location: 'Medellín, CO',
      photo: esAndres,
    },
    {
      quote: "Pensé que organizar mis documentos legales sería un proceso largo y caro. Con Solexi, lo hice en una tarde desde mi casa. Ojalá lo hubiera descubierto antes.",
      name: 'Isabel M.',
      age: '57 años',
      location: 'Lima, PE',
      photo: esIsabel,
    },
    {
      quote: "Mi mamá siempre decía 'ya lo haré'. Cuando la convencí de usar Solexi, terminó en menos de una hora. Ahora dice que duerme más tranquila.",
      name: 'Martín R.',
      age: '35 años',
      location: 'Santo Domingo, DO',
      photo: esMartin,
    },
  ],
};

const TestimonialsCarousel: React.FC = () => {
  const { lang } = useLocale();
  const testimonials = testimonialsByLang[lang];
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  // Reset to first testimonial when language changes
  useEffect(() => {
    setCurrent(0);
  }, [lang]);

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[current];

  return (
    <section className="py-6 md:py-8 relative overflow-hidden">
      {/* Blurred background photo */}
      <div className="absolute inset-0 z-0">
        <img
          src={t.photo}
          alt=""
          className="w-full h-full object-cover blur-[6px] scale-110 opacity-20"
          loading="lazy"
          width={512}
          height={512}
        />
        <div className="absolute inset-0 bg-secondary/60" />
      </div>
      <div className="container max-w-3xl text-center px-4 relative z-10">
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-accent text-accent" />
          ))}
        </div>

        <div className="relative min-h-[100px] md:min-h-[140px] flex items-center justify-center">
          <Quote className="absolute -top-2 left-0 h-6 w-6 md:h-8 md:w-8 text-accent/20" />
          <p className="font-heading text-base md:text-xl text-foreground leading-relaxed italic px-6 md:px-8">
            «&nbsp;{t.quote}&nbsp;»
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <img
            src={t.photo}
            alt={t.name}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-accent shadow-md"
            loading="lazy"
            width={64}
            height={64}
          />
          <p className="font-semibold text-foreground">{t.name}</p>
          <p className="text-sm text-muted-foreground">{t.age} · {t.location}</p>
        </div>

        <div className="mt-4 md:mt-6 flex items-center justify-center gap-3 md:gap-4">
          <button
            onClick={prev}
            className="p-2 rounded-full border border-border hover:bg-accent/10 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-accent' : 'w-2 bg-border'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="p-2 rounded-full border border-border hover:bg-accent/10 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
};
const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useLocale();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }


  const trustItems = [
    { icon: Shield, label: t.landing_trust_security ?? 'Sécurité avancée' },
    { icon: Lock, label: t.landing_trust_privacy ?? 'Vie privée totale' },
    { icon: Globe, label: t.landing_trust_jurisdiction ?? 'Multi-juridiction' },
    { icon: Languages, label: t.landing_trust_multilingual ?? 'Multilingue' },
  ];

  const howItWorks = [
    { icon: Users, title: t.landing_how_1_title ?? 'Créez votre succession familiale', desc: t.landing_how_1_desc ?? 'Invitez vos proches dans un espace privé et sécurisé.' },
    { icon: FileText, title: t.landing_how_2_title ?? 'Organisez vos documents', desc: t.landing_how_2_desc ?? 'Centralisez les documents importants avec contrôle de visibilité.' },
    { icon: CheckSquare, title: t.landing_how_3_title ?? 'Structurez la préparation', desc: t.landing_how_3_desc ?? 'Suivez les étapes avec des checklists et la gouvernance familiale.' },
    { icon: Briefcase, title: t.landing_how_4_title ?? 'Préparez la transmission', desc: t.landing_how_4_desc ?? 'Désignez un exécuteur et assurez la continuité.' },
  ];

  const valueProps = [
    { icon: Shield, title: t.landing_val_1_title ?? 'Chiffrement et sécurité', desc: t.landing_val_1_desc ?? 'Vos données sont protégées par un chiffrement de niveau bancaire.' },
    { icon: Eye, title: t.landing_val_2_title ?? 'Contrôle de visibilité', desc: t.landing_val_2_desc ?? 'Chaque document a son propre niveau de partage.' },
    { icon: Scale, title: t.landing_val_3_title ?? 'Adapté à votre juridiction', desc: t.landing_val_3_desc ?? 'Terminologie et checklists adaptées à votre région.' },
    { icon: Heart, title: t.landing_val_4_title ?? 'Support continu', desc: t.landing_val_4_desc ?? 'Accompagnement à chaque étape de la préparation.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header — refined, light, premium ─── */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container flex h-14 md:h-20 items-center justify-between px-4 md:px-6">
          {/* Single brand reference */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.7)]" aria-hidden="true" />
            <span className="text-lg md:text-2xl lg:text-3xl font-heading font-semibold text-white tracking-tight">
              Solexi.ai
            </span>
          </Link>

          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Compact, refined language switcher */}
            <Select value={lang} onValueChange={(v) => setLang(v as SupportedLanguage)}>
              <SelectTrigger
                aria-label="Language"
                className="h-9 md:h-10 w-auto min-w-0 gap-1.5 px-2.5 md:px-3 text-xs md:text-sm bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-full font-medium backdrop-blur-sm transition-colors [&>svg]:text-white/70"
              >
                <Globe className="h-3.5 w-3.5 md:h-4 md:w-4 text-white/80" />
                <span className="font-medium">{lang.toUpperCase()}</span>
              </SelectTrigger>
              <SelectContent align="end">
                {LANGUAGE_ORDER.map(l => (
                  <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Secondary login — ghost / understated */}
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm text-white/85 hover:text-white hover:bg-white/10 rounded-full font-medium"
              >
                {t.sign_in}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero — calm, dignified, conversion-focused ─── */}
      <section
        className="relative pt-24 pb-16 md:pt-40 md:pb-20 overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Layered overlays for depth + readability */}
        <div className="absolute inset-0 bg-primary/85" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary/70"
          aria-hidden="true"
        />

        <div className="container relative z-10 text-center px-6 max-w-2xl md:max-w-4xl">
          {/* Headline — elegant serif, generous line-height */}
          <h1 className="font-heading text-[2rem] leading-[1.15] sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground tracking-tight">
            {t.landing_hero_title.split(',').length > 1 ? (
              <>
                {t.landing_hero_title.split(',')[0]},
                <br />
                <span className="text-accent">{t.landing_hero_title.split(',').slice(1).join(',').trim() || ''}</span>
              </>
            ) : (
              <>{t.landing_hero_title}</>
            )}
          </h1>

          {/* Supporting text — refined, breathable */}
          <p className="mt-6 md:mt-8 text-[15px] leading-[1.7] sm:text-lg md:text-xl text-primary-foreground/75 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
            {t.landing_hero_subtitle}
          </p>

          {/* Primary CTA — single dominant action */}
          <div className="mt-9 md:mt-12 flex flex-col items-center">
            <Link
              to="/setup"
              className="relative inline-block rounded-full p-[1.5px] bg-[linear-gradient(110deg,rgba(255,255,255,0.15),rgba(255,255,255,0.95),rgba(255,255,255,0.15),rgba(255,255,255,0.95),rgba(255,255,255,0.15))] bg-[length:200%_100%] animate-shimmer-border shadow-[0_10px_40px_-10px_hsl(var(--accent)/0.55)] focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-primary"
            >
              <Button
                size="lg"
                className="h-14 md:h-[3.75rem] bg-accent text-accent-foreground hover:bg-accent/95 active:bg-accent text-[15px] md:text-base font-semibold px-8 md:px-10 gap-2 border-0 rounded-full transition-transform duration-200 hover:-translate-y-px"
              >
                {t.landing_cta_start}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Micro-copy under CTA — gentle, reassuring */}
            <p className="mt-4 md:mt-5 text-xs md:text-sm text-primary-foreground/60 max-w-xs sm:max-w-md leading-relaxed">
              {t.landing_cta_microcopy}
            </p>
          </div>
        </div>
      </section>

      {/* Spacer — separates hero from social proof on mobile */}
      <div className="h-4 md:h-6 bg-background" aria-hidden="true" />

      {/* ─── Testimonials Carousel ─── */}
      <TestimonialsCarousel />

      {/* ─── L'âme de Solexi.ai ─── */}
      <section className="py-20 bg-[hsl(220,45%,8%)] overflow-hidden">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-wider text-accent mb-4">
              {t.founder_section_tag}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-white">
              {t.founder_section_title}
            </h2>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                {t.founder_quote_1}
              </p>
              <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {t.founder_quote_2}
              </p>
              <p className="text-base sm:text-lg italic text-accent leading-relaxed">
                {t.founder_quote_3}
              </p>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed">
                {t.founder_quote_4}
              </p>
              <p className="text-sm text-white/60 pt-2">
                — {t.founder_name},<br />{t.founder_role}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Ticker (Marquee) ─── */}
      <section className="border-y border-border py-4 overflow-hidden bg-secondary/30">
        <div className="marquee-track flex items-center gap-12 whitespace-nowrap">
          {[...trustItems, ...trustItems, ...trustItems].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-muted-foreground shrink-0">
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>


      {/* ─── How It Works ─── */}
      <section className="bg-primary py-20">
        <div className="container text-center">
          <p className="text-sm md:text-base font-semibold uppercase tracking-widest text-accent mb-4">
            {t.landing_how_tag ?? 'Comment ça marche'}
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-primary-foreground mb-12">
            {t.landing_how_title ?? 'Une approche structurée, étape par étape'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="text-left">
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-accent/20 mb-4">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-heading text-lg font-medium text-primary-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Value Props Grid ─── */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-wider text-accent mb-4">
              {t.landing_why_title}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground">
              {t.landing_why_subtitle}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {valueProps.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div key={i} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-medium text-foreground">{prop.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{prop.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Why Now ─── */}
      <section className="bg-secondary/50 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-8">
              {t.landing_why_now_title}
            </h2>
            <ul className="space-y-4 text-left">
              {t.landing_why_now_items.map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-muted-foreground">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-accent shrink-0" />
                  <span className="text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/setup" className="mt-10 inline-block">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-8">
                {t.landing_cta_start}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-semibold text-foreground">{t.app_name}</span>
            <span className="text-muted-foreground">{t.app_tagline}</span>
          </div>
          <p>{t.landing_footer_rights.replace('{year}', String(new Date().getFullYear()))}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t.landing_privacy}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t.landing_terms}</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">{t.landing_pricing}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
