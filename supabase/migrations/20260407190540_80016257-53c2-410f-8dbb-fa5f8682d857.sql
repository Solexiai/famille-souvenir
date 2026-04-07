
-- Fix memories INSERT policy: replace old 'contributor' with 'family_member'
DROP POLICY IF EXISTS "Contributors can create memories" ON public.memories;
CREATE POLICY "Members can create memories"
  ON public.memories FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND is_circle_member(auth.uid(), circle_id)
    AND get_circle_role(auth.uid(), circle_id) IN ('owner', 'family_manager', 'family_member')
  );

-- Fix default role on circle_members from viewer to family_member
ALTER TABLE public.circle_members ALTER COLUMN role SET DEFAULT 'family_member'::app_role;

-- Fix default role on invitations from viewer to family_member
ALTER TABLE public.invitations ALTER COLUMN role SET DEFAULT 'family_member'::app_role;
