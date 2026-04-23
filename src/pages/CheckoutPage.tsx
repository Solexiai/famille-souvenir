import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Loader2,
  Lock,
  Shield,
  Heart,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SupportedLanguage } from '@/i18n/types';

type PlanKey = 'essential' | 'family' | 'legacy';

interface PlanCopy {
  name: string;
  description: string;
  price: string;
  priceNote: string;
}

interface CheckoutCopy {
  back: string;
  signin: string;
  yourPlan: string;
  changePlan: string;
  includedTitle: string;
  included: string[];
  accountTitle: string;
  accountSubtitle: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordHint: string;
  confirmPassword: string;
  accountReassurance: string;
  paymentTitle: string;
  paymentNote: string;
  cta: string;
  ctaLoading: string;
  finalReassurance: string;
  trust: string[];
  hasAccount: string;
  signinLink: string;
  validation: {
    nameMin: string;
    email: string;
    passwordMin: string;
    passwordUpper: string;
    passwordLower: string;
    passwordDigit: string;
    passwordMismatch: string;
  };
  errorTitle: string;
  successTitle: string;
  successDesc: string;
  backToLogin: string;
  plans: Record<PlanKey, PlanCopy>;
}

const COPY: Record<SupportedLanguage, CheckoutCopy> = {
  fr: {
    back: 'Retour',
    signin: 'Se connecter',
    yourPlan: 'Votre protection choisie',
    changePlan: 'Modifiable à tout moment',
    includedTitle: 'Ce qui est inclus',
    included: [
      'Volontés, documents et souvenirs',
      'Accès pensé pour vos proches',
      'Espace sécurisé et structuré',
      'Jusqu’à 100 ans de conservation',
    ],
    accountTitle: 'Créer votre espace',
    accountSubtitle: 'Quelques informations suffisent pour commencer.',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Courriel',
    password: 'Mot de passe',
    passwordHint: 'Au moins 8 caractères, avec majuscule, minuscule et chiffre.',
    confirmPassword: 'Confirmer le mot de passe',
    accountReassurance: 'Vos informations sont sécurisées et confidentielles.',
    paymentTitle: 'Paiement sécurisé',
    paymentNote: 'Paiement sécurisé · Vos données sont protégées',
    cta: 'Créer mon espace et continuer',
    ctaLoading: 'Création en cours…',
    finalReassurance:
      'Vous pourrez compléter votre espace à votre rythme après la création.',
    trust: ['Espace sécurisé', 'Pensé pour vos proches', 'Jusqu’à 100 ans de conservation'],
    hasAccount: 'Vous avez déjà un compte ?',
    signinLink: 'Se connecter',
    validation: {
      nameMin: 'Veuillez entrer au moins 2 caractères.',
      email: 'Veuillez entrer un courriel valide.',
      passwordMin: 'Le mot de passe doit comporter au moins 8 caractères.',
      passwordUpper: 'Le mot de passe doit contenir une majuscule.',
      passwordLower: 'Le mot de passe doit contenir une minuscule.',
      passwordDigit: 'Le mot de passe doit contenir un chiffre.',
      passwordMismatch: 'Les mots de passe ne correspondent pas.',
    },
    errorTitle: 'La création de votre espace a échoué. Veuillez réessayer.',
    successTitle: 'Vérifiez votre courriel',
    successDesc:
      'Nous avons envoyé un lien de confirmation à <strong>{email}</strong>. Ouvrez-le pour activer votre espace.',
    backToLogin: 'Retour à la connexion',
    plans: {
      essential: {
        name: 'Forfait Essentiel',
        description:
          'Un guide structuré pour organiser vos volontés et vos informations essentielles.',
        price: '49,99 $',
        priceNote: 'accès immédiat',
      },
      family: {
        name: 'Forfait Famille',
        description:
          'La plateforme Solexi.ai pour organiser, partager et protéger l’essentiel en famille.',
        price: '149,99 $',
        priceNote: 'par an',
      },
      legacy: {
        name: 'Forfait Héritage',
        description:
          'La plateforme Solexi.ai avec préparation testamentaire pour votre cercle familial.',
        price: '299,99 $',
        priceNote: 'par an',
      },
    },
  },
  en: {
    back: 'Back',
    signin: 'Sign in',
    yourPlan: 'Your chosen protection',
    changePlan: 'Changeable at any time',
    includedTitle: "What's included",
    included: [
      'Wishes, documents, and memories',
      'Access built for your loved ones',
      'A secure, structured space',
      'Up to 100 years of preservation',
    ],
    accountTitle: 'Create your space',
    accountSubtitle: 'Just a few details to get started.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 8 characters, with uppercase, lowercase, and a digit.',
    confirmPassword: 'Confirm password',
    accountReassurance: 'Your information is secure and confidential.',
    paymentTitle: 'Secure payment',
    paymentNote: 'Secure payment · Your data is protected',
    cta: 'Create my space and continue',
    ctaLoading: 'Creating…',
    finalReassurance:
      'You can complete your space at your own pace after creation.',
    trust: ['Secure space', 'Built for your loved ones', 'Up to 100 years of preservation'],
    hasAccount: 'Already have an account?',
    signinLink: 'Sign in',
    validation: {
      nameMin: 'Please enter at least 2 characters.',
      email: 'Please enter a valid email.',
      passwordMin: 'Password must be at least 8 characters.',
      passwordUpper: 'Password must contain an uppercase letter.',
      passwordLower: 'Password must contain a lowercase letter.',
      passwordDigit: 'Password must contain a digit.',
      passwordMismatch: 'Passwords do not match.',
    },
    errorTitle: 'We could not create your space. Please try again.',
    successTitle: 'Check your email',
    successDesc:
      'We sent a confirmation link to <strong>{email}</strong>. Open it to activate your space.',
    backToLogin: 'Back to sign in',
    plans: {
      essential: {
        name: 'Essential plan',
        description:
          'A structured guide to organize your wishes and essential information.',
        price: '$49.99',
        priceNote: 'instant access',
      },
      family: {
        name: 'Family plan',
        description:
          'The Solexi.ai platform to organize, share, and protect what matters as a family.',
        price: '$149.99',
        priceNote: 'per year',
      },
      legacy: {
        name: 'Legacy plan',
        description:
          'The Solexi.ai platform with will preparation for your family circle.',
        price: '$299.99',
        priceNote: 'per year',
      },
    },
  },
  es: {
    back: 'Atrás',
    signin: 'Iniciar sesión',
    yourPlan: 'Su protección elegida',
    changePlan: 'Modificable en cualquier momento',
    includedTitle: 'Qué incluye',
    included: [
      'Voluntades, documentos y recuerdos',
      'Acceso pensado para sus seres queridos',
      'Espacio seguro y estructurado',
      'Hasta 100 años de conservación',
    ],
    accountTitle: 'Cree su espacio',
    accountSubtitle: 'Solo unos pocos datos para comenzar.',
    firstName: 'Nombre',
    lastName: 'Apellido',
    email: 'Correo electrónico',
    password: 'Contraseña',
    passwordHint: 'Al menos 8 caracteres, con mayúscula, minúscula y número.',
    confirmPassword: 'Confirmar contraseña',
    accountReassurance: 'Su información es segura y confidencial.',
    paymentTitle: 'Pago seguro',
    paymentNote: 'Pago seguro · Sus datos están protegidos',
    cta: 'Crear mi espacio y continuar',
    ctaLoading: 'Creando…',
    finalReassurance:
      'Podrá completar su espacio a su propio ritmo después de la creación.',
    trust: ['Espacio seguro', 'Pensado para sus seres queridos', 'Hasta 100 años de conservación'],
    hasAccount: '¿Ya tiene una cuenta?',
    signinLink: 'Iniciar sesión',
    validation: {
      nameMin: 'Ingrese al menos 2 caracteres.',
      email: 'Ingrese un correo válido.',
      passwordMin: 'La contraseña debe tener al menos 8 caracteres.',
      passwordUpper: 'La contraseña debe contener una mayúscula.',
      passwordLower: 'La contraseña debe contener una minúscula.',
      passwordDigit: 'La contraseña debe contener un número.',
      passwordMismatch: 'Las contraseñas no coinciden.',
    },
    errorTitle: 'No pudimos crear su espacio. Inténtelo de nuevo.',
    successTitle: 'Revise su correo',
    successDesc:
      'Enviamos un enlace de confirmación a <strong>{email}</strong>. Ábralo para activar su espacio.',
    backToLogin: 'Volver a iniciar sesión',
    plans: {
      essential: {
        name: 'Plan Esencial',
        description:
          'Una guía estructurada para organizar sus voluntades e información esencial.',
        price: '$49.99',
        priceNote: 'acceso inmediato',
      },
      family: {
        name: 'Plan Familia',
        description:
          'La plataforma Solexi.ai para organizar, compartir y proteger lo esencial en familia.',
        price: '$149.99',
        priceNote: 'por año',
      },
      legacy: {
        name: 'Plan Legado',
        description:
          'La plataforma Solexi.ai con preparación testamentaria para su círculo familiar.',
        price: '$299.99',
        priceNote: 'por año',
      },
    },
  },
};

const TRUST_ICONS = [Shield, Heart, Clock];

const CheckoutPage: React.FC = () => {
  const { lang, setLang } = useLocale();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const c = COPY[lang];

  const planParam = (searchParams.get('plan') as PlanKey) || 'family';
  const planKey: PlanKey = ['essential', 'family', 'legacy'].includes(planParam)
    ? planParam
    : 'family';
  const plan = c.plans[planKey];

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          firstName: z.string().trim().min(2, c.validation.nameMin).max(60),
          lastName: z.string().trim().min(2, c.validation.nameMin).max(60),
          email: z.string().trim().email(c.validation.email).max(255),
          password: z
            .string()
            .min(8, c.validation.passwordMin)
            .regex(/[A-Z]/, c.validation.passwordUpper)
            .regex(/[a-z]/, c.validation.passwordLower)
            .regex(/[0-9]/, c.validation.passwordDigit),
          confirmPassword: z.string(),
        })
        .refine((d) => d.password === d.confirmPassword, {
          message: c.validation.passwordMismatch,
          path: ['confirmPassword'],
        }),
    [c.validation],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ firstName, lastName, email, password, confirmPassword });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      toast.error(c.errorTitle);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card animate-fade-in">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Check className="h-6 w-6" />
          </div>
          <h1 className="font-heading text-2xl text-foreground text-center">
            {c.successTitle}
          </h1>
          <p
            className="mt-3 text-center text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: c.successDesc.replace('{email}', email) }}
          />
          <Link to="/login" className="mt-6 block">
            <Button variant="outline" className="w-full">
              {c.backToLogin}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.7)]"
              aria-hidden="true"
            />
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
              <SelectContent align="end">
                <SelectItem value="fr">FR</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="container max-w-2xl px-4 md:px-6 py-6 md:py-10">
        <button
          type="button"
          onClick={() => navigate('/choose-plan')}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ChevronLeft className="h-4 w-4" />
          {c.back}
        </button>

        {/* Plan confirmation */}
        <section
          aria-labelledby="plan-heading"
          className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/5 via-card to-card p-5 md:p-7 shadow-card animate-fade-in"
        >
          <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-medium">
            {c.yourPlan}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 id="plan-heading" className="font-heading text-2xl md:text-3xl text-foreground">
                {plan.name}
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                {plan.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-heading text-2xl md:text-3xl text-foreground">
                {plan.price}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{plan.priceNote}</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/80 italic">{c.changePlan}</p>
        </section>

        {/* Included */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-6">
          <h2 className="font-heading text-lg text-foreground">{c.includedTitle}</h2>
          <ul className="mt-3 space-y-2.5">
            {c.included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Account creation */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-7">
          <h2 className="font-heading text-xl md:text-2xl text-foreground">
            {c.accountTitle}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{c.accountSubtitle}</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{c.firstName}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{c.lastName}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{c.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{c.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <p className="text-[11px] text-muted-foreground">{c.passwordHint}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{c.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
              <Lock className="h-3.5 w-3.5 text-accent/80" />
              {c.accountReassurance}
            </p>

            {/* Payment placeholder section */}
            <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-accent" />
                {c.paymentTitle}
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {c.paymentNote}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 h-12 text-base shadow-card"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {c.ctaLoading}
                </>
              ) : (
                <>
                  {c.cta}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground pt-1">
              {c.hasAccount}{' '}
              <Link to="/login" className="text-accent hover:underline">
                {c.signinLink}
              </Link>
            </p>
          </form>
        </section>

        {/* Final reassurance */}
        <p className="mt-6 text-center text-sm text-muted-foreground italic px-4">
          {c.finalReassurance}
        </p>

        {/* Trust strip */}
        <div className="mt-5 grid grid-cols-3 gap-2 md:gap-4">
          {c.trust.map((label, i) => {
            const Icon = TRUST_ICONS[i] ?? Sparkles;
            return (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/50 px-2 py-3 text-center"
              >
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-[11px] md:text-xs text-muted-foreground leading-tight">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
