
-- Migrate contributor/viewer to family_member
UPDATE public.circle_members SET role = 'family_member' WHERE role = 'contributor';
UPDATE public.circle_members SET role = 'family_member' WHERE role = 'viewer';

-- ALTER family_circles: add documentary status columns
ALTER TABLE public.family_circles
  ADD COLUMN IF NOT EXISTS testament_status public.documentary_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS mandate_status public.documentary_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS notary_status public.documentary_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS beneficiary_designation_status public.documentary_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS critical_documents_status text NOT NULL DEFAULT 'incomplete',
  ADD COLUMN IF NOT EXISTS dossier_readiness_status public.dossier_readiness_status NOT NULL DEFAULT 'initial',
  ADD COLUMN IF NOT EXISTS death_status public.death_status NOT NULL DEFAULT 'not_reported';

-- NEW TABLE: documents
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id uuid NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL,
  category text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  description text DEFAULT '',
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint DEFAULT 0,
  visibility public.document_visibility NOT NULL DEFAULT 'private_owner',
  verification_status public.verification_status NOT NULL DEFAULT 'unreviewed',
  review_note text DEFAULT '',
  linked_responsible_member uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Document access by visibility and role" ON public.documents FOR SELECT USING (
  (visibility = 'private_owner' AND uploaded_by = auth.uid())
  OR (visibility = 'managers_only' AND is_circle_manager(auth.uid(), circle_id))
  OR (visibility = 'family_circle' AND is_circle_member(auth.uid(), circle_id))
  OR (visibility = 'heirs_only' AND (has_circle_role(auth.uid(), circle_id, 'heir') OR is_circle_manager(auth.uid(), circle_id)))
  OR (visibility = 'executor_workspace' AND (
    is_circle_manager(auth.uid(), circle_id)
    OR has_circle_role(auth.uid(), circle_id, 'proposed_executor')
    OR has_circle_role(auth.uid(), circle_id, 'verified_executor')
  ))
  OR (visibility = 'verified_executor_only' AND (
    has_circle_role(auth.uid(), circle_id, 'verified_executor')
    OR has_circle_role(auth.uid(), circle_id, 'owner')
  ))
);
CREATE POLICY "Managers can create documents" ON public.documents FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND is_circle_member(auth.uid(), circle_id)
  AND get_circle_role(auth.uid(), circle_id) IN ('owner', 'family_manager')
);
CREATE POLICY "Uploaders can update own documents" ON public.documents FOR UPDATE USING (uploaded_by = auth.uid());
CREATE POLICY "Uploaders or owners can delete documents" ON public.documents FOR DELETE USING (
  uploaded_by = auth.uid() OR has_circle_role(auth.uid(), circle_id, 'owner')
);

-- NEW TABLE: member_family_labels
CREATE TABLE public.member_family_labels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id uuid NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  label public.family_label NOT NULL,
  note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, member_id, label)
);
ALTER TABLE public.member_family_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view labels" ON public.member_family_labels FOR SELECT USING (is_circle_member(auth.uid(), circle_id));
CREATE POLICY "Managers can insert labels" ON public.member_family_labels FOR INSERT WITH CHECK (is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers can update labels" ON public.member_family_labels FOR UPDATE USING (is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers can delete labels" ON public.member_family_labels FOR DELETE USING (is_circle_manager(auth.uid(), circle_id));

-- NEW TABLE: checklist_items
CREATE TABLE public.checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id uuid NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  category public.checklist_category NOT NULL DEFAULT 'legal',
  title text NOT NULL,
  description text DEFAULT '',
  status public.checklist_status NOT NULL DEFAULT 'not_started',
  assigned_to uuid,
  due_date date,
  linked_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  evidence_note text DEFAULT '',
  requires_professional_review boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Managers and executors can view checklist" ON public.checklist_items FOR SELECT USING (
  is_circle_manager(auth.uid(), circle_id)
  OR has_circle_role(auth.uid(), circle_id, 'proposed_executor')
  OR has_circle_role(auth.uid(), circle_id, 'verified_executor')
);
CREATE POLICY "Managers can create checklist items" ON public.checklist_items FOR INSERT WITH CHECK (is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers can update checklist items" ON public.checklist_items FOR UPDATE USING (is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers can delete checklist items" ON public.checklist_items FOR DELETE USING (is_circle_manager(auth.uid(), circle_id));

-- NEW TABLE: governance_responsibilities
CREATE TABLE public.governance_responsibilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id uuid NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  area public.governance_area NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status public.governance_status NOT NULL DEFAULT 'assigned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.governance_responsibilities ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_governance_updated_at BEFORE UPDATE ON public.governance_responsibilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Members can view governance" ON public.governance_responsibilities FOR SELECT USING (is_circle_member(auth.uid(), circle_id));
CREATE POLICY "Managers can create governance items" ON public.governance_responsibilities FOR INSERT WITH CHECK (is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers can update governance items" ON public.governance_responsibilities FOR UPDATE USING (is_circle_manager(auth.uid(), circle_id));
CREATE POLICY "Managers can delete governance items" ON public.governance_responsibilities FOR DELETE USING (is_circle_manager(auth.uid(), circle_id));

-- NEW TABLE: executor_workspace_notes
CREATE TABLE public.executor_workspace_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id uuid NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  visibility_scope text NOT NULL DEFAULT 'executor_workspace',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.executor_workspace_notes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_executor_notes_updated_at BEFORE UPDATE ON public.executor_workspace_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.can_access_executor_workspace(_user_id uuid, _circle_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE user_id = _user_id AND circle_id = _circle_id
    AND role IN ('owner', 'family_manager', 'proposed_executor', 'verified_executor')
  )
$$;

CREATE POLICY "Executor workspace access" ON public.executor_workspace_notes FOR SELECT USING (can_access_executor_workspace(auth.uid(), circle_id));
CREATE POLICY "Authorized users can create executor notes" ON public.executor_workspace_notes FOR INSERT WITH CHECK (
  auth.uid() = author_id AND can_access_executor_workspace(auth.uid(), circle_id)
);
CREATE POLICY "Authors can update own executor notes" ON public.executor_workspace_notes FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Authors or owners can delete executor notes" ON public.executor_workspace_notes FOR DELETE USING (
  author_id = auth.uid() OR has_circle_role(auth.uid(), circle_id, 'owner')
);
