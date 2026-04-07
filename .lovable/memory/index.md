# Project Memory

## Core
French-first family preparation, protection & succession-readiness app. Premium warm design, Playfair Display headings, Inter body.
Primary: navy hsl(220 45% 25%), accent: gold hsl(35 60% 55%), bg: warm off-white hsl(40 33% 98%).
Lovable Cloud for auth, DB, storage. Roles: owner, family_manager, family_member, heir, proposed_executor, verified_executor.
App does NOT replace law/notary/executor. No fake legal authority. No auto-assign executor roles.
3-layer model: app roles (permissions), family labels (human identification), documentary statuses (legal tracking). Never mix them.

## Memories
- [Design system](mem://design/tokens) — Full color palette, typography, shadows
- [Database schema](mem://features/schema) — v2 schema: documents, checklist_items, governance, executor_workspace_notes, member_family_labels
- [Roles & access](mem://features/roles) — Role-based access with security definer functions, RLS policies, 3-layer model (app roles, family labels, documentary status)
- [MVP scope](mem://constraints/scope) — v2 boundaries, forbidden features, legal constraints
- [Family labels](mem://features/family-labels) — FamilyLabelsManager, ExecutorDesignation components, 3-tier executor designation (family-proposed, testament-named, app-verified)
