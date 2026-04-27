
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS stored_file_type text,
  ADD COLUMN IF NOT EXISTS converted_to_pdf boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assigned_reviewer_user_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_reviewer_name text,
  ADD COLUMN IF NOT EXISTS assigned_reviewer_role text,
  ADD COLUMN IF NOT EXISTS reviewer_due_date date,
  ADD COLUMN IF NOT EXISTS governance_review_id uuid;
