
-- Fix circle_members UPDATE: add WITH CHECK to prevent role escalation
DROP POLICY IF EXISTS "Owner can update member roles" ON public.circle_members;
CREATE POLICY "Owner can update member roles"
  ON public.circle_members FOR UPDATE
  USING (has_circle_role(auth.uid(), circle_id, 'owner'::app_role))
  WITH CHECK (has_circle_role(auth.uid(), circle_id, 'owner'::app_role));
