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
import founderImg from '@/assets/solexi-founder.png';
import imgCircle from '@/assets/landing-circle.jpg';
import imgDocuments from '@/assets/landing-documents.jpg';
import imgChecklist from '@/assets/landing-checklist.jpg';
import imgPrivacy from '@/assets/landing-privacy.jpg';

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

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const featureCards = [
    { img: imgCircle, label: t.landing_features[0]?.title ?? 'Cercle familial', href: '/setup' },
    { img: imgDocuments, label: t.landing_features[1]?.title ?? 'Documents', href: '/setup' },
    { img: imgChecklist, label: t.landing_features[2]?.title ?? 'Préparation', href: '/setup' },
    { img: imgPrivacy, label: t.landing_features[3]?.title ?? 'Vie privée', href: '/setup' },
  ];

  const trustItems = [
    { icon: Shield, label: t.landing_trust_security ?? 'Sécurité avancée' },
    { icon: Lock, label: t.landing_trust_privacy ?? 'Vie privée totale' },
    { icon: Globe, label: t.landing_trust_jurisdiction ?? 'Multi-juridiction' },
    { icon: Languages, label: t.landing_trust_multilingual ?? 'Multilingue' },
  ];

  const howItWorks = [
    { icon: Users, title: t.landing_how_1_title ?? 'Créez votre cercle', desc: t.landing_how_1_desc ?? 'Invitez vos proches dans un espace privé et sécurisé.' },
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
      {/* ─── Header ─── */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            <span className="text-xl md:text-3xl lg:text-4xl font-heading font-bold text-white drop-shadow-md">Solexi.ai</span>
          </div>
           <div className="flex items-center gap-3 md:gap-4">
            <Select value={lang} onValueChange={(v) => setLang(v as SupportedLanguage)}>
              <SelectTrigger className="w-[7.5rem] md:w-[8.5rem] h-10 md:h-11 text-sm bg-accent border-2 border-accent text-black rounded-full font-bold justify-center">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_ORDER.map(l => (
                  <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/login">
              <Button size="sm" className="w-[7.5rem] md:w-[8.5rem] h-10 md:h-11 bg-accent border-2 border-accent text-black hover:bg-accent/90 text-sm whitespace-nowrap rounded-full font-bold justify-center">
                {t.sign_in}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        className="relative pt-28 pb-12 md:pt-40 md:pb-14 overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-primary/80" />
        <div className="container relative z-10 text-center px-6">
          <p className="text-sm font-medium text-accent mb-4 tracking-widest uppercase">
            {t.app_name}
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground leading-[1.1] max-w-4xl mx-auto">
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
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            {t.landing_hero_subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center">
            <Link to="/setup">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 gap-2">
                {t.landing_cta_start}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

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
          <div className="mx-auto max-w-4xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="shrink-0 w-48 sm:w-56 lg:w-64">
              <img
                src={founderImg}
                alt={t.founder_name}
                loading="lazy"
                className="w-full rounded-2xl shadow-elevated"
              />
            </div>
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

      {/* ─── Feature Cards Grid (Medvi-style) ─── */}
      <section className="container relative z-20 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card, i) => (
            <Link
              key={i}
              to={card.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card hover:shadow-elevated transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={card.img}
                  alt={card.label}
                  loading="lazy"
                  width={640}
                  height={640}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card/95 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-sm md:text-base font-medium text-foreground">
                    {card.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
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

      {/* ─── Alternating Feature Sections ─── */}
      <section className="py-20">
        {t.landing_features.map((feature, i) => {
          const images = [imgCircle, imgDocuments, imgChecklist, imgPrivacy];
          const icons = [Users, FileText, CheckSquare, Shield];
          const Icon = icons[i] ?? Shield;
          const isReversed = i % 2 !== 0;

          return (
            <div
              key={i}
              className={`container py-12 flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">
                    {t.app_name}
                  </span>
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-semibold text-foreground leading-tight">
                  {feature.title}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed text-lg">
                  {feature.description}
                </p>
                <Link to="/setup" className="mt-6 inline-block">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                    {t.landing_cta_start}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex-1 max-w-md">
                <img
                  src={images[i]}
                  alt={feature.title}
                  loading="lazy"
                  width={640}
                  height={640}
                  className="rounded-2xl shadow-card w-full"
                />
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-primary py-20">
        <div className="container text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-accent mb-4">
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
      <section className="py-20">
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


      {/* ─── Final CTA ─── */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-primary/85" />
        <div className="container relative z-10 text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-semibold text-primary-foreground mb-6">
            {t.landing_hero_title}
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto">
            {t.landing_hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/setup">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 py-6 gap-2">
                {t.landing_cta_start}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8 py-6">
                {t.landing_pricing}
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
