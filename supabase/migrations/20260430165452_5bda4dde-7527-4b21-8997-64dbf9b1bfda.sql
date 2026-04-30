
-- ENUMS
CREATE TYPE public.time_message_format AS ENUM ('audio', 'video', 'text');
CREATE TYPE public.time_message_trigger AS ENUM ('scheduled_date', 'after_death');
CREATE TYPE public.time_message_status AS ENUM ('draft', 'scheduled', 'released', 'sent', 'cancelled');

-- Main table
CREATE TABLE public.time_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL,
  author_id uuid NOT NULL,
  format public.time_message_format NOT NULL,
  trigger_type public.time_message_trigger NOT NULL,
  title text NOT NULL,
  text_content text DEFAULT '',
  media_path text,
  media_mime_type text,
  media_duration_seconds integer,
  media_size_bytes bigint DEFAULT 0,
  recipient_member_id uuid,
  recipient_name text NOT NULL,
  recipient_email text,
  recipient_relationship text,
  scheduled_for date,
  occasion_label text,
  is_recurring boolean NOT NULL DEFAULT false,
  status public.time_message_status NOT NULL DEFAULT 'draft',
  released_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT time_messages_trigger_check CHECK (
    (trigger_type = 'scheduled_date' AND scheduled_for IS NOT NULL)
    OR (trigger_type = 'after_death')
  )
);

CREATE INDEX idx_time_messages_circle ON public.time_messages(circle_id);
CREATE INDEX idx_time_messages_author ON public.time_messages(author_id);
CREATE INDEX idx_time_messages_status ON public.time_messages(status);
CREATE INDEX idx_time_messages_scheduled ON public.time_messages(scheduled_for) WHERE trigger_type = 'scheduled_date';

-- Guardians (trusted persons who can confirm death)
CREATE TABLE public.time_message_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  circle_id uuid NOT NULL,
  guardian_user_id uuid,
  guardian_name text NOT NULL,
  guardian_email text NOT NULL,
  guardian_relationship text,
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (author_id, guardian_email)
);

CREATE INDEX idx_guardians_author ON public.time_message_guardians(author_id);
CREATE INDEX idx_guardians_user ON public.time_message_guardians(guardian_user_id);

-- Death confirmations
CREATE TABLE public.time_message_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  guardian_id uuid NOT NULL REFERENCES public.time_message_guardians(id) ON DELETE CASCADE,
  confirmed_by_user_id uuid NOT NULL,
  reason text DEFAULT '',
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (author_id, guardian_id)
);

CREATE INDEX idx_releases_author ON public.time_message_releases(author_id);

-- Activity pings (last seen) for inactivity-based release
CREATE TABLE public.user_activity_pings (
  user_id uuid PRIMARY KEY,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  inactivity_threshold_months integer NOT NULL DEFAULT 6,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger updated_at
CREATE TRIGGER set_time_messages_updated_at
BEFORE UPDATE ON public.time_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_user_activity_pings_updated_at
BEFORE UPDATE ON public.user_activity_pings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.time_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_message_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_message_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_pings ENABLE ROW LEVEL SECURITY;

-- time_messages policies
CREATE POLICY "Authors view own messages"
  ON public.time_messages FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Guardians view posthumous messages metadata"
  ON public.time_messages FOR SELECT
  USING (
    trigger_type = 'after_death'
    AND EXISTS (
      SELECT 1 FROM public.time_message_guardians g
      WHERE g.author_id = time_messages.author_id
      AND g.guardian_user_id = auth.uid()
    )
  );

CREATE POLICY "Authors insert own messages"
  ON public.time_messages FOR INSERT
  WITH CHECK (author_id = auth.uid() AND public.is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Authors update own messages"
  ON public.time_messages FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors delete own messages"
  ON public.time_messages FOR DELETE
  USING (author_id = auth.uid());

-- guardians policies
CREATE POLICY "Authors manage own guardians select"
  ON public.time_message_guardians FOR SELECT
  USING (author_id = auth.uid() OR guardian_user_id = auth.uid());

CREATE POLICY "Authors insert own guardians"
  ON public.time_message_guardians FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors update own guardians"
  ON public.time_message_guardians FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors delete own guardians"
  ON public.time_message_guardians FOR DELETE
  USING (author_id = auth.uid());

-- releases policies
CREATE POLICY "Authors and guardians view releases"
  ON public.time_message_releases FOR SELECT
  USING (
    author_id = auth.uid()
    OR confirmed_by_user_id = auth.uid()
  );

CREATE POLICY "Guardians can confirm release"
  ON public.time_message_releases FOR INSERT
  WITH CHECK (
    confirmed_by_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.time_message_guardians g
      WHERE g.id = time_message_releases.guardian_id
      AND g.guardian_user_id = auth.uid()
      AND g.author_id = time_message_releases.author_id
    )
  );

-- user_activity_pings policies
CREATE POLICY "Users manage own activity"
  ON public.user_activity_pings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('time-messages', 'time-messages', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (path = author_id/filename)
CREATE POLICY "Authors upload own time messages"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'time-messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authors read own time messages"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'time-messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Authors delete own time messages"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'time-messages'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
