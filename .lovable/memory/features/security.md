---
name: Production security hardening
description: Complete security implementation — RLS, rate limiting, upload validation, security events, headers
type: feature
---
## RLS Audit (all tables)
- All tables have RLS enabled with proper policies
- WITH CHECK added on UPDATE for: checklist_items, documents, vault_documents, executor_workspace_notes
- audit_logs INSERT restricted to service_role only (no client inserts)
- security_events, rate_limits: service_role only access
- upload_quotas: members can read, service_role manages

## Storage Buckets
- ALL buckets private (avatars, memories-media, vault-private)
- Access only via signed URLs (createSignedUrl)

## Upload Validation
- Edge function: validate-upload
- Client-side: src/lib/upload-validation.ts (double validation)
- Magic bytes verification for images/PDFs
- Blocked extensions: exe, bat, cmd, js, php, html, svg, etc.
- Whitelist: JPEG, PNG, WebP, GIF, MP4, WebM, PDF only
- Per-plan limits: free (10MB/file, 50 photos, 5 videos, 500MB/month), premium (50MB, 500 photos, 50 videos, 5GB/month)
- upload_quotas table tracks per-circle monthly usage

## Security Events & Alerting
- Table: security_events (immutable, service_role only)
- Edge function: security-alert (logs events, checks thresholds, notifies owners)
- Alert threshold: 5+ events of same type in 1 hour → notification to circle owners

## Auth Hardening
- HIBP password check enabled
- Anonymous signups disabled
- Email auto-confirm disabled
- Rate limiting via check_rate_limit() DB function

## Security Headers (vercel.json)
- CSP, HSTS (2yr+preload), X-Frame-Options DENY, Permissions-Policy, X-Content-Type-Options nosniff

## Audit Logging
- Client uses logAuditEvent() from src/lib/audit.ts (routes through security-alert edge function)
- No direct client inserts to audit_logs table

## Architecture
- No secrets exposed client-side (only anon key)
- All sensitive ops route through edge functions with service_role
- Compatible with future: encryption at field level, async antivirus scanning
