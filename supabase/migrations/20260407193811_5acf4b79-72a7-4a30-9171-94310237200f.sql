
-- ============================================================
-- CRITICAL: Fix circle_members INSERT — prevent self-join to any circle
-- ============================================================
DROP POLICY IF EXISTS "Owner can add members" ON public.circle_members;
CREATE POLICY "Owner can add members"
  ON public.circle_members FOR INSERT
  WITH CHECK (
    has_circle_role(auth.uid(), circle_id, 'owner'::app_role)
  );

-- ============================================================
-- FIX: memories-media — allow circle co-members to view media
-- ============================================================
CREATE POLICY "Circle members can view shared memories media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories-media'
    AND (
      (auth.uid())::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.memories m
        JOIN public.circle_members cm ON cm.circle_id = m.circle_id
        WHERE m.media_url = name
          AND cm.user_id = auth.uid()
          AND m.visibility = 'circle'
      )
    )
  );

-- Drop the overly restrictive own-only policy (replaced by the above)
DROP POLICY IF EXISTS "Users can view own memories media" ON storage.objects;

-- ============================================================
-- FIX: executor_workspace_notes UPDATE — require active membership
-- ============================================================
DROP POLICY IF EXISTS "Authors can update own executor notes" ON public.executor_workspace_notes;
CREATE POLICY "Authors can update own executor notes"
  ON public.executor_workspace_notes FOR UPDATE
  USING (
    author_id = auth.uid()
    AND can_access_executor_workspace(auth.uid(), circle_id)
  );
