---
name: Security architecture — investor-ready audit
description: Complete security posture — auth, RLS, storage, secrets, rate limiting, audit, sessions, invitations, residual risks, V2 roadmap
type: feature
---

## 1. AUTH ✅

| Control | Status | Proof |
|---------|--------|-------|
| Email/password signup | ✅ | AuthContext.tsx → supabase.auth.signUp |
| Email verification required | ✅ | auto_confirm = false |
| Password reset flow | ✅ | ForgotPasswordPage + ResetPasswordPage |
| Google OAuth ready | ✅ | Configurable via Lovable Cloud |
| Anonymous signups disabled | ✅ | external_anonymous_users_enabled = false |
| HIBP password check | ❌ À activer | configure_auth(password_hibp_enabled: true) |
| MFA/TOTP | ❌ V2 | GoTrue supporte TOTP nativement |
| Session auto-refresh | ✅ | autoRefreshToken: true in client.ts |
| Session listing/revocation | ❌ V2 | Nécessite admin API |

## 2. RLS ✅ Exhaustif

| Table | RLS | SELECT | INSERT | UPDATE | DELETE |
|-------|-----|--------|--------|--------|--------|
| audit_logs | ✅ | owner via has_circle_role | service_role only | ❌ blocked | ❌ blocked |
| checklist_items | ✅ | role-based (managers, executors, members filtered) | managers | managers + WITH CHECK | managers |
| circle_members | ✅ | is_circle_member | owner only | owner only | owner or self |
| consents | ✅ | own user | own user | own user | ❌ blocked |
| documents | ✅ | 6-level visibility policy | managers (uploaded_by check) | uploader + WITH CHECK | uploader or owner |
| executor_workspace_notes | ✅ | can_access_executor_workspace | author + workspace access | author + WITH CHECK | author or owner |
| family_circles | ✅ | owner or member | owner_id = auth.uid() | owner or manager | owner only |
| governance_responsibilities | ✅ | is_circle_member | managers | managers | managers |
| invitations | ✅ | managers | managers | managers | managers |
| member_family_labels | ✅ | is_circle_member | managers | managers | managers |
| memories | ✅ | 3-level visibility | owner/manager/member only | author only | author or owner |
| notifications | ✅ | own user | own user or circle manager | own user | own user |
| profiles | ✅ | own or co-member (is_visible_to_family) | own user | own user | ❌ blocked |
| subscriptions | ✅ | own user | own user | service_role only | ❌ blocked |
| rate_limits | ✅ | service_role only | service_role only | service_role only | service_role only |
| security_events | ✅ | service_role only | service_role only | ❌ blocked | ❌ blocked |
| email_send_log | ✅ | service_role | service_role | service_role | ❌ blocked |
| email_send_state | ✅ | service_role | service_role | service_role | service_role |
| email_unsubscribe_tokens | ✅ | service_role | service_role | service_role | ❌ blocked |
| suppressed_emails | ✅ | service_role | service_role | ❌ blocked | ❌ blocked |
| upload_quotas | ✅ | member read + service_role ALL | service_role | service_role | service_role |
| vault_documents | ✅ | 3-level visibility | owner/manager/member | uploader + WITH CHECK | uploader or owner |

### SECURITY DEFINER functions (bypass RLS safely)
- `is_circle_member(_user_id, _circle_id)`
- `is_circle_manager(_user_id, _circle_id)`
- `has_circle_role(_user_id, _circle_id, _role)`
- `get_circle_role(_user_id, _circle_id)`
- `can_access_executor_workspace(_user_id, _circle_id)`
- `check_rate_limit(_key, _action, _max_attempts, _window_seconds)`
- All set `search_path = public` to prevent search_path injection

## 3. SECRETS ✅

| Secret | Usage | Exposure |
|--------|-------|----------|
| SUPABASE_SERVICE_ROLE_KEY | Edge functions only | Never client-side |
| SUPABASE_ANON_KEY | Client SDK | Publishable, safe |
| RESEND_API_KEY | send-transactional-email | Edge function only |
| LOVABLE_API_KEY | process-email-queue | Edge function only |

- .env auto-generated, never committed
- No secrets in codebase (verified)
- ❌ Manque : rotation schedule documenté

## 4. STORAGE ✅ Privé

| Bucket | Public | Usage |
|--------|--------|-------|
| memories-media | ❌ Private | Photos/vidéos de souvenirs |
| vault-private | ❌ Private | Documents sensibles |
| avatars | ❌ Private | Photos de profil |

- Accès uniquement via signed URLs (createSignedUrl)
- Upload validation double : client (upload-validation.ts) + serveur (validate-upload edge fn)
- Magic bytes verification (JPEG, PNG, WebP, GIF, PDF)
- Extensions bloquées : exe, bat, cmd, js, php, html, svg, etc.
- ⚠️ RISQUE TROUVÉ : Storage RLS policies ne reflètent pas complètement la visibilité memories (private/managers). Un membre connaissant le path pourrait accéder au fichier.
- ⚠️ RISQUE TROUVÉ : vault-private policy = owner-folder only, mais vault_documents expose metadata circle/managers.

## 5. RATE LIMITING ✅

- DB function `check_rate_limit()` — SECURITY DEFINER
- Configurable : key, action, max_attempts, window_seconds
- Utilisé dans : invitations (5/heure), edge functions
- Table `rate_limits` : service_role only (RLS)
- Blocage temporaire via `blocked_until`

## 6. AUDIT LOGS ✅

- Table `audit_logs` : INSERT service_role only, SELECT owner only
- Pas de UPDATE/DELETE possible (immutable)
- Logging via `logAuditEvent()` → security-alert edge function
- Actions tracées : document_uploaded, invitation_sent, member_removed, etc.

## 7. SECURITY EVENTS ✅

- Table `security_events` : service_role only (INSERT + SELECT)
- Pas de UPDATE/DELETE (immutable)
- Event types : upload_blocked_extension, upload_invalid_mime, upload_magic_bytes_mismatch, alert_escalated
- Alerting : 5+ events/heure → notification aux owners du cercle
- Edge function : security-alert

## 8. SESSIONS ✅ Partiel

- JWT via GoTrue, stocké localStorage
- Auto-refresh activé
- onAuthStateChange listener avant getSession
- ❌ Manque : session listing, force logout, device tracking

## 9. PROTECTIONS APPLICATIVES ✅

### Security Headers (vercel.json)
- CSP : default-src 'self', script-src 'self' 'unsafe-inline', frame-ancestors 'none'
- HSTS : max-age=63072000 (2 ans), includeSubDomains, preload
- X-Frame-Options : DENY
- X-Content-Type-Options : nosniff
- Referrer-Policy : strict-origin-when-cross-origin
- Permissions-Policy : camera=(), microphone=(), geolocation=(), payment=()
- X-DNS-Prefetch-Control : off

### Upload Security
- Double validation client + serveur
- Magic bytes verification
- Blocked extensions list
- Per-plan quotas (photos, videos, documents, bytes)
- ⚠️ Client "fails open" si edge function échoue (ligne 93 upload-validation.ts)

## 10. SÉCURITÉ DES INVITATIONS ✅

- Token UUID unique par invitation
- Expiration 7 jours (configurable)
- Email normalisé lowercase (trigger DB)
- Contrainte unicité : (circle_id, email) unique pour status pending/accepted
- Validation serveur dans manage-invitation edge function
- Rate limit 5 invitations/heure
- Token stocké localStorage, consommé après auth
- Audit log à chaque action (send, accept, cancel, resend)

## 11. SÉPARATION FRONTEND / BACKEND ✅

- Frontend : React SPA, accès uniquement via anon key + JWT utilisateur
- Backend : Edge Functions avec service_role key
- Aucun accès direct aux tables sensibles depuis le client
- audit_logs, security_events, rate_limits, email_* : service_role only
- Upload quotas : lecture membre, écriture service_role

## 12. POLITIQUE D'ACCÈS SUPPORT

- ❌ Pas de rôle "support" dans le système
- ❌ Pas de panneau admin
- Accès données : uniquement via Lovable Cloud (dashboard DB)
- Recommandation V2 : audit log pour accès admin, rôle support séparé sans accès données utilisateur

---

## RISQUES RÉSIDUELS

| # | Risque | Sévérité | Mitigation |
|---|--------|----------|------------|
| 1 | Storage policies memories-media ne filtrent pas private/managers | 🔴 Élevé | Aligner storage RLS sur memories visibility |
| 2 | vault-private metadata exposée sans accès fichier | 🟡 Moyen | Aligner storage SELECT policy |
| 3 | Upload validation "fails open" si edge fn indisponible | 🟡 Moyen | Changer en "fail closed" |
| 4 | Pas de HIBP password check | 🟡 Moyen | Activer via configure_auth |
| 5 | Pas de MFA | 🟡 Moyen | V2 roadmap |
| 6 | CSP autorise 'unsafe-inline' pour scripts | 🟡 Moyen | Migrer vers nonce-based CSP |
| 7 | Pas de rotation secrets documentée | 🟡 Moyen | Documenter + rotate_api_keys |
| 8 | Pas de session listing/revocation | 🟠 Bas | V2 via admin API |
| 9 | Pas de journal d'accès fichiers sensibles | 🟠 Bas | V2 feature |

---

## PRIORITÉS V2

1. **HIBP** — Quick win, 1 appel API
2. **Storage RLS alignment** — Corriger policies memories-media et vault-private
3. **Fail closed uploads** — Ne pas autoriser si edge function échoue
4. **MFA/TOTP** — GoTrue natif, UI settings
5. **Session management** — Liste, révocation, force logout
6. **Admin audit trail** — Log tout accès support/admin
7. **File access journal** — Table access_logs pour documents vault
8. **Secret rotation schedule** — Trimestriel, documenté
9. **CSP nonce** — Éliminer unsafe-inline
10. **Pentest** — Audit externe avant launch public

---

## MFA ROADMAP

| Phase | Action | Effort |
|-------|--------|--------|
| V2.0 | TOTP enrollment dans Settings (GoTrue enroll/verify) | 2-3 jours |
| V2.0 | Challenge MFA au login si enrolled | 1 jour |
| V2.1 | MFA obligatoire pour owners/managers | 1 jour |
| V2.2 | Recovery codes | 1 jour |
| Future | WebAuthn/passkeys | 3-5 jours |

## STRATÉGIE ROTATION SECRETS

| Secret | Fréquence | Méthode |
|--------|-----------|---------|
| SUPABASE_SERVICE_ROLE_KEY | Trimestriel ou si compromis | rotate_api_keys tool |
| RESEND_API_KEY | Annuel ou si compromis | Régénérer dans connector |
| LOVABLE_API_KEY | Géré par Lovable | Automatique |
| Invitation tokens | Auto-expire 7 jours | Par design |

## POLITIQUE DE RÉVOCATION D'ACCÈS

1. **Membre révoqué** → DELETE circle_members → RLS bloque immédiatement tout accès
2. **Invitation annulée** → DELETE invitations → Token invalide
3. **Compte supprimé** → signOut() + audit log (pas de hard delete auth.users côté client)
4. **Owner ne peut pas être révoqué** — by design
5. **Sessions** → V2 : force logout via admin API après révocation

## JOURNAL D'ACCÈS FICHIERS SENSIBLES (V2)

```
Table: file_access_log
- id UUID PK
- user_id UUID
- document_id UUID (nullable)
- vault_document_id UUID (nullable)
- action: 'view' | 'download' | 'signed_url_created'
- ip_address TEXT
- user_agent TEXT
- created_at TIMESTAMPTZ
RLS: service_role only
```

---

## TESTS SÉCURITÉ MANUELS PRÉ-LANCEMENT

### Auth
- [ ] Signup avec email déjà utilisé → erreur, pas de leak d'info
- [ ] Login avec mauvais mot de passe 10x → rate limit
- [ ] Reset password → token one-time, expire après usage
- [ ] Signup sans vérification email → pas d'accès dashboard

### RLS
- [ ] User A ne voit pas les documents private_owner de User B
- [ ] Viewer ne peut pas créer de document
- [ ] Heir voit uniquement docs heirs_only
- [ ] proposed_executor voit executor_workspace, pas private_owner
- [ ] Non-membre ne voit aucune donnée du cercle

### Invitations
- [ ] Même email ne peut pas recevoir 2 invitations pending dans le même cercle
- [ ] Token expiré → rejeté
- [ ] Token déjà utilisé → rejeté
- [ ] Invitation avec rôle owner → impossible (pas dans invitableRoles)

### Storage
- [ ] Upload .exe → bloqué client + serveur
- [ ] Upload fichier > limite plan → bloqué
- [ ] Accès fichier sans signed URL → 403
- [ ] Magic bytes JPEG avec extension .png → bloqué

### Headers
- [ ] X-Frame-Options DENY vérifié via curl
- [ ] CSP bloque scripts externes
- [ ] HSTS preload header présent

### Edge Functions
- [ ] Appel sans Authorization header → 401
- [ ] Appel avec token invalide → 401
- [ ] Rate limit invitations → 429 après 5/heure
