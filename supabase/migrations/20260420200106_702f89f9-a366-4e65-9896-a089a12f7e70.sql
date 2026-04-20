
-- Backfill: insert any missing owners as circle_members with role 'owner'
INSERT INTO public.circle_members (circle_id, user_id, role)
SELECT fc.id, fc.owner_id, 'owner'::app_role
FROM public.family_circles fc
WHERE NOT EXISTS (
  SELECT 1 FROM public.circle_members cm
  WHERE cm.circle_id = fc.id AND cm.user_id = fc.owner_id
);

-- Trigger: automatically add owner to circle_members when a circle is created
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.circle_members (circle_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner'::app_role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_add_owner_as_member ON public.family_circles;
CREATE TRIGGER trg_add_owner_as_member
AFTER INSERT ON public.family_circles
FOR EACH ROW
EXECUTE FUNCTION public.add_owner_as_member();
