---
name: Monetization & Plan Gating
description: Free/Annual Family plans with usePlan hook, PlanGate component, and Stripe-ready subscriptions table
type: feature
---

## Plans
- **Free**: 1 circle, 5 members, 10 docs, 20 memories, basic checklist, lightweight governance, visible readiness score
- **Annual Family**: $149.99 CAD/yr (founder: $74.99), unlimited members, extended vault, full checklist, advanced governance, executor workspace, export, advanced reminders

## Architecture
- `subscriptions` table: user_id (unique), plan, subscription_status, billing_cycle, founder_discount_applied, renewal_date, stripe_customer_id, stripe_subscription_id
- `src/hooks/usePlan.ts` — usePlan() hook returns plan, loading, isAnnual, founderDiscount, renewalDate, status
- `src/components/PlanGate.tsx` — Drop-in component for gating premium features
- FREE_LIMITS constant for easy limit checks

## Deferred to next pass
- Stripe checkout session creation
- Webhook handling
- Live payment flow
- Currency adaptation (USD for US, local for LATAM)
