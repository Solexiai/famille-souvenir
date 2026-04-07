
-- Drop the existing SELECT policy and replace with one that also allows owner
DROP POLICY IF EXISTS "Members can view their circles" ON public.family_circles;

CREATE POLICY "Members or owner can view circles"
ON public.family_circles
FOR SELECT
USING (
  owner_id = auth.uid() OR is_circle_member(auth.uid(), id)
);
