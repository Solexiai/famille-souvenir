# Project Memory

## Core
Multi-jurisdiction family preparation, protection & succession-readiness platform. FR/EN/ES trilingual.
Premium warm design, Playfair Display headings, Inter body.
Primary: navy hsl(220 45% 25%), accent: gold hsl(35 60% 55%), bg: warm off-white hsl(40 33% 98%).
Lovable Cloud for auth, DB, storage. Roles: owner, family_manager, family_member, heir, proposed_executor, verified_executor.
App does NOT replace law/notary/executor. No fake legal authority. No auto-assign executor roles.
3-layer model: app roles (permissions), family labels (human identification), documentary statuses (legal tracking). Never mix them.
Jurisdiction ≠ language. profiles = user preference; family_circles = dossier jurisdiction.
Supported jurisdictions: quebec, canada_general, us_general, latam_general. Terminology packs per jurisdiction.
Monetization: Free + Annual Family ($149.99 CAD/yr, founder 50% off). Stripe deferred to next pass.

## Memories
- [Design system](mem://design/tokens) — Full color palette, typography, shadows
- [Database schema](mem://features/schema) — v2 schema + jurisdiction fields + subscriptions + notifications tables
- [Roles & access](mem://features/roles) — Role-based access with security definer functions, RLS policies, 3-layer model
- [MVP scope](mem://constraints/scope) — v2 boundaries, forbidden features, legal constraints
- [Family labels](mem://features/family-labels) — FamilyLabelsManager, ExecutorDesignation components, 3-tier executor designation
- [Members module](mem://features/members) — MemberCard, MembersList, InviteMemberForm, InvitationsList, extended profiles
- [Invitation workflow](mem://features/invitations) — manage-invitation edge function, AcceptInvitationPage, token validation
- [i18n architecture](mem://features/i18n) — LocaleContext, terminology packs, jurisdiction resolution, trilingual support
- [Monetization](mem://features/monetization) — Free/Annual plans, usePlan hook, PlanGate component, Stripe-ready architecture
