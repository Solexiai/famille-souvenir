-- Fix invitation creation/select for circle owners not present in circle_members.
-- The UI treats family_circles.owner_id as manager authority, while the previous
-- invitations policies only trusted is_circle_manager() (circle_members roles).

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
