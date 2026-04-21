-- Enforce invited-user constraints:
-- 1) Invitation role cannot grant manager/owner authority.
-- 2) Free users cannot create family circles (must be annual plan).

-- -------------------------------------------------------------------
-- A. Restrict invitation roles to non-manager roles only.
-- -------------------------------------------------------------------
ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_role_check;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_role_check
  CHECK (role IN ('family_member'::app_role, 'heir'::app_role));

-- -------------------------------------------------------------------
-- B. Restrict circle creation to annual subscribers.
-- -------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can create circles" ON public.family_circles;

CREATE POLICY "Annual subscribers can create circles"
ON public.family_circles
FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = auth.uid()
      AND s.plan = 'annual_family'
      AND COALESCE(s.payment_state, s.subscription_status, 'inactive') IN ('active', 'trialing')
  )
);
