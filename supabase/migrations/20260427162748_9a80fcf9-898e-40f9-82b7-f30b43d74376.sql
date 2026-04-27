
ALTER TABLE public.checklist_items
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS ai_suggestion_id uuid NULL;

CREATE UNIQUE INDEX IF NOT EXISTS checklist_items_ai_suggestion_unique
  ON public.checklist_items (circle_id, ai_suggestion_id)
  WHERE ai_suggestion_id IS NOT NULL;
