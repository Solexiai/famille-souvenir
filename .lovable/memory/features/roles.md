---
name: Roles & permissions architecture
description: Complete role matrix, visibility rules, invitation/revocation logic, owner=payer rule
type: feature
---

## Roles (DB enum: app_role — 8 values)

| Role | Description | Peut inviter ? | Peut être révoqué ? |
|------|-------------|----------------|---------------------|
| **owner** | Créateur + payeur du cercle. Contrôle total. | Oui | Non (jamais) |
| **family_manager** | Gestionnaire délégué. Docs, checklist, gouvernance, membres. | Oui | Par owner uniquement |
| **family_member** | Membre actif. Lecture docs partagés + création souvenirs. | Non | Par owner |
| **heir** | Héritier. Accès restreint aux docs `heirs_only`. | Non | Par owner |
| **proposed_executor** | Exécuteur pressenti. Espace exécuteur + checklist read. | Non | Par owner |
| **verified_executor** | Exécuteur confirmé documentairement. Workspace complet. | Non | Par owner |
| **viewer** | Consultation seule. Pour professionnels externes (notaire, comptable). | Non | Par owner |
| **contributor** | **DÉPRÉCIÉ** — alias de family_member. Ne pas assigner. | Non | — |

## Owner = Payer (règle critique)
- `subscriptions.user_id` = owner's `user_id`
- Un seul owner par cercle (enforced par invitation logic + RLS)
- Owner ne peut PAS se retirer ni être révoqué
- Transfert de propriété = future feature (pas v1)

## Matrice de Permissions

| Permission | owner | family_manager | family_member | heir | proposed_executor | verified_executor | viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| documents.read | ✅ | ✅ | ✅¹ | ✅² | ✅³ | ✅ | ✅¹ |
| documents.create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| documents.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| checklist.read | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| checklist.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| governance.read | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| governance.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| executor.read | ✅ | ✅⁴ | ❌ | ❌ | ✅ | ✅ | ❌ |
| executor.notes.create | ✅ | ✅⁴ | ❌ | ❌ | ✅ | ✅ | ❌ |
| memories.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| memories.create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| members.manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| circle.edit | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| documentary_status.edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| vault.read | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

¹ Filtré par visibility RLS (family_circle + managers_only)
² Uniquement docs avec visibility = heirs_only
³ Uniquement docs avec visibility = executor_workspace
⁴ Via can_access_executor_workspace()

## Visibilité des Documents (6 niveaux RLS)

| Visibility | owner | manager | member | heir | prop_exec | ver_exec | viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| private_owner | ✅ (uploader) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| managers_only | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| family_circle | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| heirs_only | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| executor_workspace | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| verified_executor_only | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

## Invitation Rules
- Seuls owner + family_manager peuvent inviter (RLS: `is_circle_manager()`)
- Rôle fixé à l'invitation
- Rôles invitables: family_manager, family_member, heir, proposed_executor, viewer
- owner ne peut PAS être invité (il crée le cercle)
- contributor ne doit PAS être proposé (déprécié)
- Rate limit: 5 invitations/heure via `check_rate_limit()`

## Révocation
- Seul owner peut révoquer un membre (RLS DELETE sur circle_members)
- Un membre peut se retirer sauf s'il est owner
- family_manager ne peut PAS révoquer d'autres membres

## Comptes de test
- Pattern: `test.*@solexi.ai`
- Mêmes rôles que production (pas de rôle "test")
- Séparation via scripts/seed + scripts/reset
- JAMAIS de comptes test en production réelle
- Quand staging existera, tests exclusivement là-bas
