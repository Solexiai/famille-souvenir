# Project Memory

## Core
French-first family memory & document app. Premium warm design, Playfair Display headings, Inter body.
Primary: navy hsl(220 45% 25%), accent: gold hsl(35 60% 55%), bg: warm off-white hsl(40 33% 98%).
Lovable Cloud (Supabase) for auth, DB, storage. Roles: owner, family_manager, contributor, viewer.
No succession/legal automation in v1. No fake dashboards or unconnected features.

## Memories
- [Design system](mem://design/tokens) — Full color palette, typography, shadows
- [Database schema](mem://features/schema) — profiles, family_circles, circle_members, invitations, memories, vault_documents, consents, audit_logs
- [Roles & access](mem://features/roles) — Role-based access with security definer functions, RLS policies, owner=payer rule, permission matrix
- [Security architecture](mem://features/security) — Complete security posture: auth, RLS, storage, secrets, rate limiting, audit, sessions, invitations, residual risks, V2 roadmap, MFA plan, pre-launch test checklist
- [MVP scope](mem://constraints/scope) — v1 boundaries, forbidden features
- [Resend direct-send migration](mem://features/email-provider-switch) — Direct app-email sending, preserved invitation logic, and current verified domain mismatch
- [Invitations](mem://features/invitations) — Token flow, email normalization, uniqueness constraints
- [Testing](mem://features/testing) — Test accounts, seed scripts, reset procedure, prod/test separation
