
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS upload_source text NOT NULL DEFAULT 'web_upload',
  ADD COLUMN IF NOT EXISTS original_file_type text,
  ADD COLUMN IF NOT EXISTS ai_classification_status text NOT NULL DEFAULT 'not_classified',
  ADD COLUMN IF NOT EXISTS reviewed_by_user boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS professional_review_recommended boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS documents_upload_source_idx ON public.documents (upload_source);
