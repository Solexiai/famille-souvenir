# Solexi — Production Readiness Audit (Repository State + Implemented Upgrades)

_Date: 2026-04-14_

## 1) Current implementation audit

### Frontend architecture
- React + Vite + TypeScript, route-level protection, MFA challenge integration.
- Invitation token persistence in browser + callback-based acceptance flow.
- Private media/documents served through signed URLs.

### Backend / Edge functions
- Existing: `manage-invitation`, `validate-upload`, `process-email-queue`, `security-alert`, unsubscribe/suppression handlers.
- Added: `create-checkout-session`, `customer-portal`, `stripe-webhook`.

### Database schema
- Existing domain tables (profiles, circles, memberships, invitations, memories, documents, subscriptions).
- Added hardening for uniqueness, payment consistency, and observability tables.

### Storage/media
- Existing private buckets + server-side upload validation.
- Added thumbnail generation/upload path (`-thumb.jpg`) and thumbnail-first rendering.

### Email
- Existing queue-based email infrastructure + suppression/unsubscribe handlers.

### Auth & invitation
- Existing auth callback and invitation auto-accept after login/verify.
- Hardened invitation acceptance with authenticated-email matching and safer validate payload.

### Billing
- Existing subscriptions table was present but no complete Stripe runtime path.
- Implemented checkout, portal, webhook processing, subscription sync.

### Monitoring
- Existing security event pipeline.
- Added global frontend runtime error capture and app-level event storage.

---

## 2) Production gaps ranked by severity

### Critical
1. Invitation acceptance identity mismatch (invited email not enforced) → fixed.
2. Notification insertion policy was too permissive (`WITH CHECK (true)`) → fixed.
3. No production Stripe webhook runtime path → fixed.

### High
4. Membership duplication under concurrent accept attempts → hardened (DB uniqueness + idempotent handling).
5. Partial webhook identity mapping when subscription metadata missing → hardened with customer-id fallback.

### Medium
6. Incomplete environment contract (missing centralized env examples) → fixed.
7. Runtime frontend exceptions not forwarded to backend telemetry → fixed.

### Remaining (not fully eliminable inside repo only)
8. External alerting sinks (PagerDuty/Slack/Sentry DSN routing) still require platform setup.
9. Production secrets rotation + IAM enforcement require cloud/provider config.

---

## 3) Implemented improvements (top feasible in repo)

### Auth and invitation reliability
- `manage-invitation` now:
  - validates token format,
  - enforces authenticated email == invited email,
  - handles duplicate membership race idempotently,
  - updates invitation status with pending-guard,
  - reduces validate response data surface.

### Identity integrity
- Case-insensitive profile email uniqueness and normalization retained + reinforced.
- Added trigger syncing `profiles.email` when `auth.users.email` changes.
- Added subscriptions FK to `auth.users` with `ON DELETE CASCADE`.

### Billing readiness
- New Stripe edge functions:
  - checkout session creation (owner-only gate),
  - customer billing portal,
  - webhook verification + idempotency + subscriptions upsert.
- Settings page wired with billing controls.

### Monitoring and error reporting
- Global frontend `error` and `unhandledrejection` reporting to `security-alert`.
- `app_events` + `stripe_webhook_events` used for observability and dedupe traces.

### Storage/media privacy and cost controls
- Existing EXIF stripping/compression path preserved.
- Added thumbnail generation to reduce media transfer costs.
- Thumbnail-first signed URL fetch added.

### Environment separation
- Added `.env.example` and `supabase/functions/.env.example`.
- Configured JWT enforcement for sensitive user-triggered functions.

### Database consistency
- Unique constraints/indexes for profiles/email, memberships, invitation tokens, Stripe IDs.
- Cleanup + integrity guards in migrations.

---

## 4) Remaining risks and next priorities

### Remaining risks
1. No automated CI gate in this repo for full integration tests against a staging Supabase project.
2. Stripe webhook availability/retries need platform-level monitoring dashboard + alerting.
3. Email domain deliverability (SPF/DKIM/DMARC) depends on DNS and provider setup.

### Next priorities
1. Add deterministic integration tests against staging (invitation + billing + webhook replay).
2. Add dead-letter alerting thresholds to notify ops when queue failure rates spike.
3. Add policy-as-code checks for migrations (RLS and dangerous policy detection).

---

## 5) External setup still required

- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ANNUAL`, webhook endpoint registration.
- **Supabase**: deploy new edge functions and run new migrations in staging then production.
- **DNS/Email**: SPF/DKIM/DMARC, sender domain validation.
- **Hosting (Vercel/Netlify/etc.)**: environment separation (`dev`, `staging`, `prod`) and secret scoping.
- **Observability**: connect `app_events`/function logs to alerting sink (Slack/PagerDuty/Sentry).

---

## 6) Core flows improved (exact)

1. `invite -> signup/login -> callback -> accept -> dashboard` now includes identity enforcement and idempotent acceptance behavior.
2. `settings -> start checkout -> Stripe -> webhook -> subscription state sync` now exists end-to-end.
3. `photo upload -> EXIF strip/compress -> thumbnail upload -> signed thumbnail display` now reduces storage egress costs.
