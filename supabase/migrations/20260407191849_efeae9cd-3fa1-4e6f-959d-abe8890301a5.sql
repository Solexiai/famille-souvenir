
-- Add new values to governance_status enum
ALTER TYPE public.governance_status ADD VALUE IF NOT EXISTS 'not_started' BEFORE 'assigned';
ALTER TYPE public.governance_status ADD VALUE IF NOT EXISTS 'blocked' AFTER 'completed';

-- Add new columns to governance_responsibilities
ALTER TABLE public.governance_responsibilities
  ADD COLUMN IF NOT EXISTS due_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linked_checklist_item uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS linked_document uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS note text DEFAULT '';
