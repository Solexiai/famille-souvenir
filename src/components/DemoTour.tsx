import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/contexts/LocaleContext';
import { ArrowLeft, ArrowRight, CheckCircle2, PlayCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import circleImg from '@/assets/demo/circle.png';
import membersImg from '@/assets/demo/members.png';
import governanceImg from '@/assets/demo/governance.png';
import documentsImg from '@/assets/demo/documents.png';
import memoriesImg from '@/assets/demo/memories.png';
import checklistImg from '@/assets/demo/checklist.png';

type Lang = 'fr' | 'en' | 'es';

interface DemoStep {
  image: string;
  route?: string;
  fr: { title: string; body: string; cta: string };
  en: { title: string; body: string; cta: string };
  es: { title: string; body: string; cta: string };
}

const STEPS: DemoStep[] = [
  {
    image: circleImg,
    route: '/circle',
    fr: {
      title: '1. Créez votre cercle familial',
      body: "Le cercle est votre espace privé. Donnez-lui un nom et définissez les statuts documentaires (testament, mandat, notaire). C’est le point de départ de tout votre dossier.",
      cta: 'Aller au cercle',
    },
    en: {
      title: '1. Create your family circle',
      body: 'The circle is your private space. Give it a name and set documentary statuses (will, mandate, notary). It’s the starting point of your entire dossier.',
      cta: 'Open the circle',
    },
    es: {
      title: '1. Cree su círculo familiar',
      body: 'El círculo es su espacio privado. Asígnele un nombre y defina los estados documentales (testamento, mandato, notario). Es el punto de partida de su expediente.',
      cta: 'Ir al círculo',
    },
  },
  {
    image: membersImg,
    route: '/circle/members',
    fr: {
      title: '2. Invitez vos proches',
      body: "Ajoutez les membres de votre famille par courriel. Chaque personne reçoit un rôle : propriétaire, gestionnaire, contributeur ou observateur. Vous gardez le contrôle total.",
      cta: 'Inviter un membre',
    },
    en: {
      title: '2. Invite your loved ones',
      body: 'Add family members by email. Each person gets a role: owner, manager, contributor or viewer. You keep full control.',
      cta: 'Invite a member',
    },
    es: {
      title: '2. Invite a sus seres queridos',
      body: 'Añada a los miembros de su familia por correo. Cada persona recibe un rol: propietario, gestor, contribuidor u observador. Usted mantiene el control total.',
      cta: 'Invitar a un miembro',
    },
  },
  {
    image: governanceImg,
    route: '/governance',
    fr: {
      title: '3. Définissez les rôles partagés',
      body: "Attribuez les responsabilités importantes (finances, santé, succession). La gouvernance familiale clarifie qui fait quoi, sans ambiguïté.",
      cta: 'Voir la gouvernance',
    },
    en: {
      title: '3. Set shared roles',
      body: 'Assign key responsibilities (finances, health, estate). Family governance clarifies who does what, without ambiguity.',
      cta: 'Open governance',
    },
    es: {
      title: '3. Defina los roles compartidos',
      body: 'Asigne responsabilidades clave (finanzas, salud, sucesión). La gobernanza familiar aclara quién hace qué, sin ambigüedad.',
      cta: 'Ver gobernanza',
    },
  },
  {
    image: documentsImg,
    route: '/documents',
    fr: {
      title: '4. Centralisez vos documents',
      body: "Téléversez ou scannez vos documents importants (testament, polices d’assurance, actes). Tout est chiffré et organisé en un seul endroit sécurisé.",
      cta: 'Ajouter un document',
    },
    en: {
      title: '4. Centralize your documents',
      body: 'Upload or scan your important documents (will, insurance policies, deeds). Everything is encrypted and organized in one secure place.',
      cta: 'Add a document',
    },
    es: {
      title: '4. Centralice sus documentos',
      body: 'Suba o escanee sus documentos importantes (testamento, pólizas de seguro, escrituras). Todo está cifrado y organizado en un solo lugar seguro.',
      cta: 'Añadir un documento',
    },
  },
  {
    image: memoriesImg,
    route: '/memories',
    fr: {
      title: '5. Préservez vos souvenirs',
      body: "Ajoutez photos, lettres et messages à transmettre. Vos souvenirs accompagnent vos documents pour bâtir un héritage complet.",
      cta: 'Ajouter un souvenir',
    },
    en: {
      title: '5. Preserve your memories',
      body: 'Add photos, letters and messages to share. Your memories accompany your documents to build a complete legacy.',
      cta: 'Add a memory',
    },
    es: {
      title: '5. Preserve sus recuerdos',
      body: 'Añada fotos, cartas y mensajes para transmitir. Sus recuerdos acompañan sus documentos para construir un legado completo.',
      cta: 'Añadir un recuerdo',
    },
  },
  {
    image: checklistImg,
    route: '/checklist',
    fr: {
      title: '6. Suivez votre liste de préparation',
      body: "L’assistant IA génère une liste personnalisée selon votre juridiction. Cochez vos étapes et progressez sereinement vers un dossier complet.",
      cta: 'Voir la liste',
    },
    en: {
      title: '6. Follow your preparation checklist',
      body: 'The AI assistant generates a personalized list based on your jurisdiction. Check off your steps and steadily build a complete dossier.',
      cta: 'Open the checklist',
    },
    es: {
      title: '6. Siga su lista de preparación',
      body: 'El asistente de IA genera una lista personalizada según su jurisdicción. Marque sus pasos y avance con calma hacia un expediente completo.',
      cta: 'Ver la lista',
    },
  },
];

const UI = {
  fr: {
    button: 'Démo guidée',
    subtitle: 'Découvrez comment bâtir votre cercle familial en 6 étapes',
    step: 'Étape',
    of: 'sur',
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Terminer',
    skip: 'Fermer',
    title: 'Démonstration Solexi.ai',
  },
  en: {
    button: 'Guided demo',
    subtitle: 'Discover how to build your family circle in 6 steps',
    step: 'Step',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    finish: 'Finish',
    skip: 'Close',
    title: 'Solexi.ai demo',
  },
  es: {
    button: 'Demo guiada',
    subtitle: 'Descubra cómo construir su círculo familiar en 6 pasos',
    step: 'Paso',
    of: 'de',
    prev: 'Anterior',
    next: 'Siguiente',
    finish: 'Finalizar',
    skip: 'Cerrar',
    title: 'Demostración Solexi.ai',
  },
};

interface Props {
  triggerClassName?: string;
}

export const DemoTour: React.FC<Props> = ({ triggerClassName }) => {
  const { lang } = useLocale();
  const navigate = useNavigate();
  const L: Lang = (['fr', 'en', 'es'].includes(lang) ? lang : 'en') as Lang;
  const ui = UI[L];

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const total = STEPS.length;
  const step = STEPS[idx];
  const content = useMemo(() => step[L], [step, L]);
  const isLast = idx === total - 1;

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setIdx(0), 200);
  };

  const handleGoTo = () => {
    if (step.route) {
      handleClose();
      navigate(step.route);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className={`bg-gradient-to-r from-primary to-[hsl(220,45%,18%)] text-primary-foreground hover:opacity-95 rounded-full shadow-elevated gap-2 ${triggerClassName || ''}`}
      >
        <PlayCircle className="h-5 w-5 text-accent" />
        {ui.button}
      </Button>

      <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 border-border/60">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <DialogTitle className="font-heading text-xl text-primary leading-tight">
                  {ui.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  {ui.subtitle}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 shrink-0">
                {ui.step} {idx + 1} {ui.of} {total}
              </Badge>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1.5 mt-4">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`${ui.step} ${i + 1}`}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i === idx ? 'bg-accent' : i < idx ? 'bg-accent/40' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="rounded-xl overflow-hidden border border-border/60 bg-muted/30 shadow-card">
              <img
                src={step.image}
                alt={content.title}
                className="w-full h-auto block"
                loading="eager"
              />
            </div>

            <div>
              <h3 className="font-heading text-lg sm:text-xl font-semibold text-primary leading-tight">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {content.body}
              </p>
            </div>

            {step.route && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoTo}
                className="rounded-full border-accent/40 text-accent hover:bg-accent/10"
              >
                {content.cta}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          <div className="px-6 py-4 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              {ui.skip}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
                className="rounded-full"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {ui.prev}
              </Button>
              {isLast ? (
                <Button
                  size="sm"
                  onClick={handleClose}
                  className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {ui.finish}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {ui.next}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
