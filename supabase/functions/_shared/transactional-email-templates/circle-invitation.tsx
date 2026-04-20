/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Famille Souvenir"

type Lang = 'fr' | 'en' | 'es'

const i18n: Record<Lang, {
  preview: (circle: string) => string
  greeting: (name?: string) => string
  body: (inviter: string | undefined, circle: string, role: string) => string
  personalMessage: string
  cta: string
  fallback: string
  footer: string
  footerSmall: string
  subject: (circle: string) => string
}> = {
  fr: {
    preview: (c) => `Vous êtes invité(e) à rejoindre ${c} sur ${SITE_NAME}`,
    greeting: (n) => n ? `Bonjour ${n},` : 'Bonjour,',
    body: (inv, c, r) => inv
      ? `${inv} vous invite à rejoindre le cercle familial **${c}** en tant que **${r}**.`
      : `Vous êtes invité(e) à rejoindre le cercle familial **${c}** en tant que **${r}**.`,
    personalMessage: 'Message personnel :',
    cta: 'Accepter l\'invitation',
    fallback: 'Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :',
    footer: `${SITE_NAME} — Préserver ce qui compte pour votre famille.`,
    footerSmall: 'Ce courriel a été envoyé car quelqu\'un vous a invité à rejoindre un cercle familial. Si vous ne connaissez pas cette personne, vous pouvez ignorer ce message.',
    subject: (c) => `Invitation à rejoindre ${c} sur ${SITE_NAME}`,
  },
  en: {
    preview: (c) => `You're invited to join ${c} on ${SITE_NAME}`,
    greeting: (n) => n ? `Hello ${n},` : 'Hello,',
    body: (inv, c, r) => inv
      ? `${inv} invites you to join the family circle **${c}** as **${r}**.`
      : `You are invited to join the family circle **${c}** as **${r}**.`,
    personalMessage: 'Personal message:',
    cta: 'Accept invitation',
    fallback: 'If the button doesn\'t work, copy and paste this link into your browser:',
    footer: `${SITE_NAME} — Preserving what matters for your family.`,
    footerSmall: 'This email was sent because someone invited you to join a family circle. If you don\'t know this person, you can ignore this message.',
    subject: (c) => `Invitation to join ${c} on ${SITE_NAME}`,
  },
  es: {
    preview: (c) => `Está invitado(a) a unirse a ${c} en ${SITE_NAME}`,
    greeting: (n) => n ? `Hola ${n},` : 'Hola,',
    body: (inv, c, r) => inv
      ? `${inv} le invita a unirse al círculo familiar **${c}** como **${r}**.`
      : `Está invitado(a) a unirse al círculo familiar **${c}** como **${r}**.`,
    personalMessage: 'Mensaje personal:',
    cta: 'Aceptar invitación',
    fallback: 'Si el botón no funciona, copie y pegue este enlace en su navegador:',
    footer: `${SITE_NAME} — Preservar lo que importa para su familia.`,
    footerSmall: 'Este correo fue enviado porque alguien le invitó a unirse a un círculo familiar. Si no conoce a esta persona, puede ignorar este mensaje.',
    subject: (c) => `Invitación a unirse a ${c} en ${SITE_NAME}`,
  },
}

const roleLabels: Record<Lang, Record<string, string>> = {
  fr: {
    owner: 'Propriétaire', family_manager: 'Gestionnaire', family_member: 'Membre',
    heir: 'Héritier', proposed_executor: 'Exécuteur pressenti', verified_executor: 'Exécuteur documenté',
  },
  en: {
    owner: 'Owner', family_manager: 'Manager', family_member: 'Member',
    heir: 'Heir', proposed_executor: 'Proposed executor', verified_executor: 'Verified executor',
  },
  es: {
    owner: 'Propietario', family_manager: 'Gestor', family_member: 'Miembro',
    heir: 'Heredero', proposed_executor: 'Albacea propuesto', verified_executor: 'Albacea verificado',
  },
}

interface CircleInvitationProps {
  firstName?: string
  lastName?: string
  circleName?: string
  inviterName?: string
  role?: string
  invitationMessage?: string
  acceptUrl?: string
  lang?: string
}

type CircleInvitationTemplateData = Partial<CircleInvitationProps> & {
  lang?: Lang
}

const CircleInvitationEmail = ({
  firstName,
  circleName = 'un cercle familial',
  inviterName,
  role = 'family_member',
  invitationMessage,
  acceptUrl = '#',
  lang: rawLang,
}: CircleInvitationProps) => {
  const lang: Lang = (rawLang === 'en' || rawLang === 'es') ? rawLang : 'fr'
  const strings = i18n[lang]
  const roleName = roleLabels[lang][role] || role

  // Simple bold substitution for email
  const bodyParts = strings.body(inviterName, circleName, roleName).split(/\*\*(.*?)\*\*/g)

  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Preview>{strings.preview(circleName)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logo}>{SITE_NAME}</Text>
          </Section>

          <Heading style={h1}>{strings.greeting(firstName)}</Heading>

          <Text style={textStyle}>
            {bodyParts.map((part, i) =>
              i % 2 === 1
                ? <strong key={i}>{part}</strong>
                : <React.Fragment key={i}>{part}</React.Fragment>
            )}
          </Text>

          {invitationMessage && (
            <Section style={messageBox}>
              <Text style={messageLabel}>{strings.personalMessage}</Text>
              <Text style={messageText}>« {invitationMessage} »</Text>
            </Section>
          )}

          <Section style={buttonSection}>
            <Button style={button} href={acceptUrl}>
              {strings.cta}
            </Button>
          </Section>

          <Text style={textSmall}>{strings.fallback}</Text>
          <Text style={linkText}>{acceptUrl}</Text>

          <Hr style={hr} />

          <Text style={footer}>{strings.footer}</Text>
          <Text style={footerSmallStyle}>{strings.footerSmall}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CircleInvitationEmail,
  subject: (data: CircleInvitationTemplateData) => {
    const lang: Lang = (data.lang === 'en' || data.lang === 'es') ? data.lang : 'fr'
    return i18n[lang].subject(data.circleName || 'un cercle familial')
  },
  displayName: 'Invitation au cercle familial',
  previewData: {
    firstName: 'Marie',
    lastName: 'Dupont',
    circleName: 'Famille Tremblay',
    inviterName: 'Jean Tremblay',
    role: 'family_member',
    invitationMessage: 'Bienvenue dans notre cercle familial !',
    acceptUrl: 'https://solexi.ai/invitation/accept?token=example-token',
    lang: 'fr',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = {
  fontSize: '20px', fontWeight: '700' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  color: 'hsl(220, 45%, 25%)', margin: '0',
}
const h1 = {
  fontSize: '22px', fontWeight: '600' as const, color: 'hsl(220, 30%, 15%)',
  margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif",
}
const textStyle = {
  fontSize: '15px', color: 'hsl(220, 15%, 35%)', lineHeight: '1.6', margin: '0 0 20px',
}
const textSmall = {
  fontSize: '12px', color: 'hsl(220, 15%, 50%)', lineHeight: '1.5', margin: '24px 0 4px',
}
const linkText = {
  fontSize: '11px', color: 'hsl(35, 60%, 45%)', wordBreak: 'break-all' as const, margin: '0 0 20px',
}
const messageBox = {
  backgroundColor: 'hsl(40, 33%, 96%)', borderLeft: '3px solid hsl(35, 60%, 55%)',
  padding: '12px 16px', borderRadius: '4px', margin: '0 0 24px',
}
const messageLabel = {
  fontSize: '12px', fontWeight: '600' as const, color: 'hsl(220, 15%, 50%)',
  margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
}
const messageText = {
  fontSize: '14px', color: 'hsl(220, 30%, 25%)', fontStyle: 'italic' as const,
  lineHeight: '1.5', margin: '0',
}
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: 'hsl(220, 45%, 25%)', color: 'hsl(40, 33%, 98%)',
  fontSize: '15px', fontWeight: '600' as const, padding: '12px 32px',
  borderRadius: '8px', textDecoration: 'none', display: 'inline-block',
}
const hr = { borderColor: 'hsl(35, 20%, 88%)', margin: '24px 0' }
const footer = {
  fontSize: '13px', color: 'hsl(220, 15%, 50%)', textAlign: 'center' as const, margin: '0 0 8px',
}
const footerSmallStyle = {
  fontSize: '11px', color: 'hsl(220, 10%, 65%)', textAlign: 'center' as const,
  lineHeight: '1.4', margin: '0',
}
