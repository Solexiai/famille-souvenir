ALTER TABLE public.checklist_items ADD COLUMN IF NOT EXISTS blocked_reason text DEFAULT '' ;
