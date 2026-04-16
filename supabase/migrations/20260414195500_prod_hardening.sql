-- Production hardening: identity, invitations, payments, observability, integrity

-- 1) Identity consistency -----------------------------------------------------
UPDATE public.profiles
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL AND email <> LOWER(TRIM(email));

-- Keep profile emails unique when present
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_ci
ON public.profiles ((LOWER(email)))
WHERE email IS NOT NULL AND email <> '';

-- 2) Membership integrity -----------------------------------------------------
DELETE FROM public.circle_members cm
USING public.circle_members d
WHERE cm.id < d.id
  AND cm.circle_id = d.circle_id
  AND cm.user_id = d.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS circle_members_unique_circle_user
ON public.circle_members (circle_id, user_id);

-- 3) Invitation integrity -----------------------------------------------------
-- Ensure token uniqueness and normalized email lookups
CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_unique
ON public.invitations (token);

CREATE INDEX IF NOT EXISTS invitations_circle_email_idx
ON public.invitations (circle_id, LOWER(email));

-- 4) Notifications security ---------------------------------------------------
DROP POLICY IF EXISTS "System or circle managers can insert notifications" ON public.notifications;

CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 5) Payment hardening --------------------------------------------------------
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_price_id text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_state text NOT NULL DEFAULT 'inactive';

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_payment_state_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_payment_state_check
  CHECK (payment_state IN ('active', 'inactive', 'past_due', 'canceled', 'trialing'));

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_customer_unique
ON public.subscriptions (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_unique
ON public.subscriptions (stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamp with time zone NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages stripe webhook events" ON public.stripe_webhook_events;
CREATE POLICY "service_role manages stripe webhook events"
ON public.stripe_webhook_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 6) Observability ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  level text NOT NULL DEFAULT 'error',
  event_type text NOT NULL,
  user_id uuid NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages app events" ON public.app_events;
CREATE POLICY "service_role manages app events"
ON public.app_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS app_events_created_idx ON public.app_events (created_at DESC);
CREATE INDEX IF NOT EXISTS app_events_type_idx ON public.app_events (event_type);
