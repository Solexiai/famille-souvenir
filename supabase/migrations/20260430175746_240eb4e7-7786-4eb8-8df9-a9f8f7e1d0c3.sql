-- Add event_date to memories for timeline ordering
ALTER TABLE public.memories
  ADD COLUMN IF NOT EXISTS event_date DATE,
  ADD COLUMN IF NOT EXISTS title TEXT;

CREATE INDEX IF NOT EXISTS idx_memories_event_date ON public.memories(circle_id, event_date);

-- Traditions table
CREATE TABLE IF NOT EXISTS public.traditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'celebration',
  recurrence TEXT NOT NULL DEFAULT 'annual',
  month INTEGER,
  day INTEGER,
  origin_year INTEGER,
  participants TEXT,
  rituals TEXT,
  visibility TEXT NOT NULL DEFAULT 'circle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.traditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view traditions of their circles"
  ON public.traditions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = traditions.circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can insert traditions in their circles"
  ON public.traditions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = traditions.circle_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Authors or owners can update traditions"
  ON public.traditions FOR UPDATE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.family_circles fc WHERE fc.id = traditions.circle_id AND fc.owner_id = auth.uid())
  );

CREATE POLICY "Authors or owners can delete traditions"
  ON public.traditions FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.family_circles fc WHERE fc.id = traditions.circle_id AND fc.owner_id = auth.uid())
  );

CREATE TRIGGER update_traditions_updated_at
  BEFORE UPDATE ON public.traditions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_traditions_circle ON public.traditions(circle_id);

-- Timeline events (standalone events not tied to a memory)
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'milestone',
  related_memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view timeline events of their circles"
  ON public.timeline_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = timeline_events.circle_id AND cm.user_id = auth.uid()));

CREATE POLICY "Members can insert timeline events in their circles"
  ON public.timeline_events FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (SELECT 1 FROM public.circle_members cm WHERE cm.circle_id = timeline_events.circle_id AND cm.user_id = auth.uid())
  );

CREATE POLICY "Authors or owners can update timeline events"
  ON public.timeline_events FOR UPDATE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.family_circles fc WHERE fc.id = timeline_events.circle_id AND fc.owner_id = auth.uid())
  );

CREATE POLICY "Authors or owners can delete timeline events"
  ON public.timeline_events FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.family_circles fc WHERE fc.id = timeline_events.circle_id AND fc.owner_id = auth.uid())
  );

CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_timeline_events_circle_date ON public.timeline_events(circle_id, event_date);
