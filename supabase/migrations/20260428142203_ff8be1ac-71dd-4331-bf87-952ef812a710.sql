
-- Track guided onboarding completion per user
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS guided_onboarding_completed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS preparing_for TEXT NULL;

-- Draft members captured during AI onboarding (not yet invited)
CREATE TABLE IF NOT EXISTS public.draft_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL,
  created_by UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NULL,
  role app_role NOT NULL DEFAULT 'family_member'::app_role,
  relationship_label TEXT NULL,
  invited BOOLEAN NOT NULL DEFAULT false,
  invited_at TIMESTAMPTZ NULL,
  invitation_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.draft_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view circle draft members"
  ON public.draft_members FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Managers can insert draft members"
  ON public.draft_members FOR INSERT
  WITH CHECK (public.is_circle_manager(auth.uid(), circle_id) AND created_by = auth.uid());

CREATE POLICY "Managers can update draft members"
  ON public.draft_members FOR UPDATE
  USING (public.is_circle_manager(auth.uid(), circle_id))
  WITH CHECK (public.is_circle_manager(auth.uid(), circle_id));

CREATE POLICY "Managers can delete draft members"
  ON public.draft_members FOR DELETE
  USING (public.is_circle_manager(auth.uid(), circle_id));

CREATE TRIGGER update_draft_members_updated_at
  BEFORE UPDATE ON public.draft_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_draft_members_circle ON public.draft_members(circle_id);
