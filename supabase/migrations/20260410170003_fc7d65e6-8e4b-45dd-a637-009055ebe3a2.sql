
-- =============================================
-- 1. SECURITY_EVENTS TABLE (immutable)
-- =============================================
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  ip_address text,
  user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only - select"
ON public.security_events FOR SELECT
USING (auth.role() = 'service_role'::text);

CREATE POLICY "Service role only - insert"
ON public.security_events FOR INSERT
WITH CHECK (auth.role() = 'service_role'::text);

CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_created ON public.security_events(created_at);
CREATE INDEX idx_security_events_user ON public.security_events(user_id);

-- =============================================
-- 2. RATE_LIMITS TABLE
-- =============================================
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  action text NOT NULL,
  attempts integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
ON public.rate_limits FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

CREATE UNIQUE INDEX idx_rate_limits_key_action ON public.rate_limits(key, action);
CREATE INDEX idx_rate_limits_blocked ON public.rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- =============================================
-- 3. UPLOAD_QUOTAS TABLE
-- =============================================
CREATE TABLE public.upload_quotas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid NOT NULL,
  month_key text NOT NULL DEFAULT to_char(now(), 'YYYY-MM'),
  photos_count integer NOT NULL DEFAULT 0,
  photos_bytes bigint NOT NULL DEFAULT 0,
  videos_count integer NOT NULL DEFAULT 0,
  videos_bytes bigint NOT NULL DEFAULT 0,
  documents_count integer NOT NULL DEFAULT 0,
  documents_bytes bigint NOT NULL DEFAULT 0,
  total_bytes bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, month_key)
);

ALTER TABLE public.upload_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view circle quotas"
ON public.upload_quotas FOR SELECT
USING (is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Service role can manage quotas"
ON public.upload_quotas FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- =============================================
-- 4. FIX: checklist_items UPDATE - add WITH CHECK
-- =============================================
DROP POLICY IF EXISTS "Managers can update checklist items" ON public.checklist_items;
CREATE POLICY "Managers can update checklist items"
ON public.checklist_items FOR UPDATE
USING (is_circle_manager(auth.uid(), circle_id))
WITH CHECK (is_circle_manager(auth.uid(), circle_id));

-- =============================================
-- 5. FIX: documents UPDATE - add WITH CHECK
-- =============================================
DROP POLICY IF EXISTS "Uploaders can update own documents" ON public.documents;
CREATE POLICY "Uploaders can update own documents"
ON public.documents FOR UPDATE
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid() AND is_circle_member(auth.uid(), circle_id));

-- =============================================
-- 6. FIX: vault_documents UPDATE - add WITH CHECK
-- =============================================
DROP POLICY IF EXISTS "Uploaders can update own vault docs" ON public.vault_documents;
CREATE POLICY "Uploaders can update own vault docs"
ON public.vault_documents FOR UPDATE
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid() AND is_circle_member(auth.uid(), circle_id));

-- =============================================
-- 7. FIX: audit_logs INSERT - service_role only
-- =============================================
DROP POLICY IF EXISTS "Members can insert audit logs for their circles" ON public.audit_logs;
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.role() = 'service_role'::text);

-- =============================================
-- 8. FIX: executor_workspace_notes UPDATE - add WITH CHECK
-- =============================================
DROP POLICY IF EXISTS "Authors can update own executor notes" ON public.executor_workspace_notes;
CREATE POLICY "Authors can update own executor notes"
ON public.executor_workspace_notes FOR UPDATE
USING (author_id = auth.uid() AND can_access_executor_workspace(auth.uid(), circle_id))
WITH CHECK (author_id = auth.uid() AND can_access_executor_workspace(auth.uid(), circle_id));

-- =============================================
-- 9. Make avatars bucket private
-- =============================================
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- =============================================
-- 10. Rate limit helper function
-- =============================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _key text,
  _action text,
  _max_attempts integer DEFAULT 5,
  _window_seconds integer DEFAULT 900
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _record rate_limits%ROWTYPE;
BEGIN
  SELECT * INTO _record FROM rate_limits WHERE key = _key AND action = _action;
  
  IF NOT FOUND THEN
    INSERT INTO rate_limits (key, action, attempts, window_start)
    VALUES (_key, _action, 1, now())
    ON CONFLICT (key, action) DO UPDATE SET
      attempts = CASE
        WHEN rate_limits.window_start + make_interval(secs => _window_seconds) < now()
        THEN 1
        ELSE rate_limits.attempts + 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start + make_interval(secs => _window_seconds) < now()
        THEN now()
        ELSE rate_limits.window_start
      END;
    RETURN true;
  END IF;
  
  IF _record.blocked_until IS NOT NULL AND _record.blocked_until > now() THEN
    RETURN false;
  END IF;
  
  IF _record.window_start + make_interval(secs => _window_seconds) < now() THEN
    UPDATE rate_limits SET attempts = 1, window_start = now(), blocked_until = NULL
    WHERE key = _key AND action = _action;
    RETURN true;
  END IF;
  
  IF _record.attempts >= _max_attempts THEN
    UPDATE rate_limits SET blocked_until = now() + make_interval(secs => _window_seconds)
    WHERE key = _key AND action = _action;
    RETURN false;
  END IF;
  
  UPDATE rate_limits SET attempts = _record.attempts + 1
  WHERE key = _key AND action = _action;
  RETURN true;
END;
$$;
