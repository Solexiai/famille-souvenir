---
name: Family labels & executor designation
description: 3-tier family labels and executor designation workflow with French UI
type: feature
---
## Family Labels
- Managed via `member_family_labels` table
- Labels: protected_person, caregiver, heir_label, trusted_contact, proposed_executor_label, testament_named_executor, external_professional
- Only owner/family_manager can add/remove
- Labels do NOT grant permissions — purely human identification
- FamilyLabelsManager component in src/components/FamilyLabelsManager.tsx
- FamilyLabelBadge and FamilyLabelsForMember exported for reuse

## Executor Designation (3 tiers)
- Tier 1: Désignation familiale — family label `proposed_executor_label`
- Tier 2: Mention documentaire — family label `testament_named_executor`
- Tier 3: Accès applicatif vérifié — app role `verified_executor`
- ExecutorDesignation component in src/components/ExecutorDesignation.tsx
- Shown on: MembersPage, ExecutorPage, DashboardPage (summary)

## Audit
- family_label_added, family_label_removed logged to audit_logs
