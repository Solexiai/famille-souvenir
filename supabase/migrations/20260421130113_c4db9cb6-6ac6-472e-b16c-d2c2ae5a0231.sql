-- Fix RLS policies on public.invitations to allow circle owners (not just managers) to view and create invitations
-- This fixes the 403 error when owners try to invite members

-- Update SELECT policy
DROP POLICY IF EXISTS "Managers can view invitations" ON public.invitations;

CREATE POLICY "Managers or owners can view invitations"
  ON public.invitations FOR SELECT
  USING (
    public.is_circle_manager(auth.uid(), circle_id)
    OR EXISTS (
      SELECT 1
      FROM public.family_circles fc
      WHERE fc.id = circle_id
        AND fc.owner_id = auth.uid()
    )
  );

-- Update INSERT policy
DROP POLICY IF EXISTS "Managers can create invitations" ON public.invitations;

CREATE POLICY "Managers or owners can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    public.is_circle_manager(auth.uid(), circle_id)
    OR EXISTS (
      SELECT 1
      FROM public.family_circles fc
      WHERE fc.id = circle_id
        AND fc.owner_id = auth.uid()
    )
  );

-- Note: UPDATE and DELETE policies remain unchanged (managers only)
-- as owners should not need to modify existing invitations directly through the API
-- (resend/cancel is handled via specific edge functions or UI flows with proper checks)

COMMENT ON POLICY "Managers or owners can view invitations" ON public.invitations IS 'Allows circle managers and circle owners to view invitations for their circles';
COMMENT ON POLICY "Managers or owners can create invitations" ON public.invitations IS 'Allows circle managers and circle owners to create new invitations for their circles';