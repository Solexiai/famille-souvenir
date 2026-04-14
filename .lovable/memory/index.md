# Project Memory

## Core
French-first family memory & document app. Premium warm design, Playfair Display headings, Inter body.
Primary: navy hsl(220 45% 25%), accent: gold hsl(35 60% 55%), bg: warm off-white hsl(40 33% 98%).
Lovable Cloud (Supabase) for auth, DB, storage. Roles: owner, family_manager, family_member, heir, viewer.
No succession/legal automation in v1. No fake dashboards or unconnected features.
All buckets private. Audit logs service_role only. HIBP enabled. Upload validation via edge function.
Owner = payeur principal. contributor role deprecated. Test accounts: test.*@solexi.ai pattern.

## Memories
- [Design system](mem://design/tokens) — Full color palette, typography, shadows
- [Database schema](mem://features/schema) — profiles, family_circles, circle_members, invitations, memories, vault_documents, consents, audit_logs
- [Roles & access](mem://features/roles) — Complete role matrix, visibility rules, owner=payer, invitation/revocation logic
- [MVP scope](mem://constraints/scope) — v1 boundaries, forbidden features
- [Invitation workflow](mem://features/invitations) — Edge function, email sending, acceptance page, profile linking
- [Family labels](mem://features/family-labels) — Label system for circle members
- [i18n](mem://features/i18n) — Multi-language support (fr, en, es)
- [Members](mem://features/members) — Member management, roles, permissions
- [Monetization](mem://features/monetization) — Free/premium plans, limits
- [Security hardening](mem://features/security) — RLS audit, private buckets, upload validation, rate limiting, security events, headers
- [Testing](mem://features/testing) — Test accounts, seed/reset scripts, prod/test separation
