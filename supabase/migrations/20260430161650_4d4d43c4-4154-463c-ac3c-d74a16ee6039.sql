
-- ============ STORIES TABLE ============
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  ai_summary TEXT,
  story_date DATE,
  source TEXT NOT NULL DEFAULT 'written', -- 'written' | 'dictated'
  visibility public.memory_visibility NOT NULL DEFAULT 'circle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_circle ON public.stories(circle_id);
CREATE INDEX idx_stories_author ON public.stories(author_id);
CREATE INDEX idx_stories_created ON public.stories(created_at DESC);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view circle-visible stories"
ON public.stories FOR SELECT
USING (
  ((visibility = 'circle' AND public.is_circle_member(auth.uid(), circle_id))
   OR (visibility = 'managers' AND public.is_circle_manager(auth.uid(), circle_id))
   OR (visibility = 'private' AND author_id = auth.uid()))
);

CREATE POLICY "Members can create stories"
ON public.stories FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND public.is_circle_member(auth.uid(), circle_id)
);

CREATE POLICY "Authors can update own stories"
ON public.stories FOR UPDATE
USING (author_id = auth.uid());

CREATE POLICY "Authors or owners can delete stories"
ON public.stories FOR DELETE
USING (author_id = auth.uid() OR public.has_circle_role(auth.uid(), circle_id, 'owner'::app_role));

CREATE TRIGGER update_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ANECDOTES TABLE ============
CREATE TABLE public.story_anecdotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_anecdotes_story ON public.story_anecdotes(story_id);

ALTER TABLE public.story_anecdotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view anecdotes for accessible stories"
ON public.story_anecdotes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id
    AND (
      (s.visibility = 'circle' AND public.is_circle_member(auth.uid(), s.circle_id))
      OR (s.visibility = 'managers' AND public.is_circle_manager(auth.uid(), s.circle_id))
      OR (s.visibility = 'private' AND s.author_id = auth.uid())
    )
  )
);

CREATE POLICY "Members can add anecdotes to accessible stories"
ON public.story_anecdotes FOR INSERT
WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id
    AND public.is_circle_member(auth.uid(), s.circle_id)
  )
);

CREATE POLICY "Authors can update own anecdotes"
ON public.story_anecdotes FOR UPDATE
USING (author_id = auth.uid());

CREATE POLICY "Authors or story owners can delete anecdotes"
ON public.story_anecdotes FOR DELETE
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id AND s.author_id = auth.uid()
  )
);

CREATE TRIGGER update_anecdotes_updated_at
BEFORE UPDATE ON public.story_anecdotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MEDIA TABLE ============
CREATE TABLE public.story_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id),
  media_type TEXT NOT NULL, -- 'photo' | 'video' | 'audio'
  storage_path TEXT NOT NULL,
  ai_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_media_story ON public.story_media(story_id);

ALTER TABLE public.story_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view media for accessible stories"
ON public.story_media FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id
    AND (
      (s.visibility = 'circle' AND public.is_circle_member(auth.uid(), s.circle_id))
      OR (s.visibility = 'managers' AND public.is_circle_manager(auth.uid(), s.circle_id))
      OR (s.visibility = 'private' AND s.author_id = auth.uid())
    )
  )
);

CREATE POLICY "Members can add media to accessible stories"
ON public.story_media FOR INSERT
WITH CHECK (
  auth.uid() = uploader_id
  AND EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id
    AND public.is_circle_member(auth.uid(), s.circle_id)
  )
);

CREATE POLICY "Uploaders or story authors can delete media"
ON public.story_media FOR DELETE
USING (
  uploader_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id AND s.author_id = auth.uid()
  )
);
