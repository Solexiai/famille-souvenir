---
name: Invitation workflow
description: Complete invitation lifecycle with edge function, acceptance page, email sending, and profile linking
type: feature
---
## Flow simplifié

1. **Gestionnaire envoie invitation** → email envoyé avec lien `/invitation/accept?token=XYZ`
2. **Invité clique le lien** → AcceptInvitationPage sauvegarde token dans `localStorage` (`solexi_invitation_token`)
3. **Invité crée un compte** → SignupPage (pas de paramètre redirect, le token est en localStorage)
4. **Invité confirme son email** → Supabase redirige vers `/auth/callback` (via `emailRedirectTo`)
5. **AuthCallbackPage** → récupère session depuis hash fragments → lit token localStorage → appelle `manage-invitation` accept → rejoint le cercle → redirige vers dashboard
6. **Si utilisateur existant** → LoginPage accepte l'invitation directement après login via localStorage

## Token Persistence
- Clé: `solexi_invitation_token` dans localStorage
- Sauvegardé dès l'arrivée sur AcceptInvitationPage
- Supprimé après acceptation réussie (dans LoginPage, AuthCallbackPage, ou AcceptInvitationPage)
- Survit au signup + email verification car en localStorage

## Edge Function: manage-invitation
- Actions: `validate` (check token without accepting), `accept` (authenticate + join circle)
- Token validated server-side with service role key
- Checks: expiration, status, duplicate membership
- On accept: creates circle_members entry, populates profile from invitation data, logs to audit_logs

## Auth Callback: /auth/callback
- Récupère session depuis URL hash fragments (access_token, refresh_token)
- Vérifie localStorage pour invitation token pending
- Accepte automatiquement l'invitation si token présent
- Redirige vers /dashboard

## Email Sending
- Transactional email via `send-transactional-email` edge function
- Template: `circle-invitation` in `_shared/transactional-email-templates/`
- Idempotency key: `circle-invite-{token}`

## Profile Linking
- On acceptance, invitation first_name/last_name/phone/city/relationship_label populate empty profile fields
