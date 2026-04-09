/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Famille Souvenir"

interface CircleInvitationProps {
  firstName?: string
  lastName?: string
  circleName?: string
  inviterName?: string
  role?: string
  invitationMessage?: string
  acceptUrl?: string
}

const roleLabels: Record<string, string> = {
  owner: 'Propriétaire',
  family_manager: 'Gestionnaire',
  family_member: 'Membre',
  heir: 'Héritier',
  proposed_executor: 'Exécuteur pressenti',
  verified_executor: 'Exécuteur documenté',
}

const CircleInvitationEmail = ({
  firstName,
  lastName,
  circleName = 'un cercle familial',
  inviterName,
  role = 'family_member',
  invitationMessage,
  acceptUrl = '#',
}: CircleInvitationProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Vous êtes invité(e) à rejoindre {circleName} sur {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Text style={logo}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>
          {firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
        </Heading>

        <Text style={text}>
          {inviterName
            ? `${inviterName} vous invite à rejoindre le cercle familial `
            : `Vous êtes invité(e) à rejoindre le cercle familial `}
          <strong>{circleName}</strong> en tant que <strong>{roleLabels[role] || role}</strong>.
        </Text>

        {invitationMessage && (
          <>
            <Section style={messageBox}>
              <Text style={messageLabel}>Message personnel :</Text>
              <Text style={messageText}>« {invitationMessage} »</Text>
            </Section>
          </>
        )}

        <Section style={buttonSection}>
          <Button style={button} href={acceptUrl}>
            Accepter l'invitation
          </Button>
        </Section>

        <Text style={textSmall}>
          Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :
        </Text>
        <Text style={linkText}>{acceptUrl}</Text>

        <Hr style={hr} />

        <Text style={footer}>
          {SITE_NAME} — Préserver ce qui compte pour votre famille.
        </Text>
        <Text style={footerSmall}>
          Ce courriel a été envoyé car quelqu'un vous a invité à rejoindre un cercle familial. 
          Si vous ne connaissez pas cette personne, vous pouvez ignorer ce message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CircleInvitationEmail,
  subject: (data: Record<string, any>) =>
    `Invitation à rejoindre ${data.circleName || 'un cercle familial'} sur ${SITE_NAME}`,
  displayName: 'Invitation au cercle familial',
  previewData: {
    firstName: 'Marie',
    lastName: 'Dupont',
    circleName: 'Famille Tremblay',
    inviterName: 'Jean Tremblay',
    role: 'family_member',
    invitationMessage: 'Bienvenue dans notre cercle familial ! Nous avons hâte de vous y retrouver.',
    acceptUrl: 'https://solexi.ai/invitation/accept?token=example-token',
  },
} satisfies TemplateEntry

// Styles — matching the app's warm premium design
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = {
  fontSize: '20px',
  fontWeight: '700' as const,
  fontFamily: "'Playfair Display', Georgia, serif",
  color: 'hsl(220, 45%, 25%)',
  margin: '0',
}
const h1 = {
  fontSize: '22px',
  fontWeight: '600' as const,
  color: 'hsl(220, 30%, 15%)',
  margin: '0 0 16px',
  fontFamily: "'Playfair Display', Georgia, serif",
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 15%, 35%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const textSmall = {
  fontSize: '12px',
  color: 'hsl(220, 15%, 50%)',
  lineHeight: '1.5',
  margin: '24px 0 4px',
}
const linkText = {
  fontSize: '11px',
  color: 'hsl(35, 60%, 45%)',
  wordBreak: 'break-all' as const,
  margin: '0 0 20px',
}
const messageBox = {
  backgroundColor: 'hsl(40, 33%, 96%)',
  borderLeft: '3px solid hsl(35, 60%, 55%)',
  padding: '12px 16px',
  borderRadius: '4px',
  margin: '0 0 24px',
}
const messageLabel = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: 'hsl(220, 15%, 50%)',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}
const messageText = {
  fontSize: '14px',
  color: 'hsl(220, 30%, 25%)',
  fontStyle: 'italic' as const,
  lineHeight: '1.5',
  margin: '0',
}
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = {
  backgroundColor: 'hsl(220, 45%, 25%)',
  color: 'hsl(40, 33%, 98%)',
  fontSize: '15px',
  fontWeight: '600' as const,
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: 'hsl(35, 20%, 88%)', margin: '24px 0' }
const footer = {
  fontSize: '13px',
  color: 'hsl(220, 15%, 50%)',
  textAlign: 'center' as const,
  margin: '0 0 8px',
}
const footerSmall = {
  fontSize: '11px',
  color: 'hsl(220, 10%, 65%)',
  textAlign: 'center' as const,
  lineHeight: '1.4',
  margin: '0',
}
