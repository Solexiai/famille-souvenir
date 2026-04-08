---
name: Monetization & Plan Gating
description: Free/Annual Family plans with usePlan hook, PlanGate component, LimitWarning, and contextual upgrade flows
type: feature
---

## Plans
- **Free**: 1 circle, 5 members, 10 docs, 20 memories, basic checklist, lightweight governance, visible readiness score
- **Annual Family**: $149.99 CAD/yr (founder: $74.99), unlimited members, extended vault, full checklist, advanced governance, executor workspace, export, advanced reminders

## Architecture
- `subscriptions` table: user_id (unique), plan, subscription_status, billing_cycle, founder_discount_applied, renewal_date, stripe_customer_id, stripe_subscription_id
- `src/hooks/usePlan.ts` — usePlan() hook, FREE_LIMITS, ANNUAL_UNLOCKS, isOverFreeLimit(), hasPremiumFeature()
- `src/components/PlanGate.tsx` — Card + inline variants for gating premium features; LimitWarning for approaching/hitting limits
- Gating wired into: ExecutorPage (advanced workspace), MembersPage (member limit), DocumentsPage (document limit)
- i18n keys: plan_gate_executor, plan_gate_export, plan_gate_advanced_checklist, plan_gate_advanced_governance, plan_gate_member_limit, plan_gate_document_limit + reason variants

## Free vs Annual Matrix
| Domain | Free | Annual |
|---|---|---|
| Circles | 1 | 3 |
| Members | 5 | 50 |
| Documents | 10 | 500 |
| Memories | 20 | 1000 |
| Checklist | Basic | Advanced categories |
| Governance | Lightweight | Full |
| Executor workspace | Designation only | Full workspace |
| Readiness score | Visible | Visible |
| Export | — | Structured dossier |
| Reminders | — | Advanced |

## Deferred to next pass
- Stripe checkout session creation
- Webhook handling
- Live payment flow
- Currency adaptation (USD for US, local for LATAM)
