
-- ============================================================
-- 1. FIX STORAGE: vault-private — restrict SELECT to own folder
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view vault files" ON storage.objects;
CREATE POLICY "Users can view own vault files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vault-private'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- FIX STORAGE: vault-private — restrict INSERT to own folder
DROP POLICY IF EXISTS "Authenticated users can upload vault files" ON storage.objects;
CREATE POLICY "Users can upload to own vault folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vault-private'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 2. FIX STORAGE: memories-media — restrict SELECT to own folder
-- ============================================================
DROP POLICY IF EXISTS "Circle members can view memories media" ON storage.objects;
CREATE POLICY "Users can view own memories media"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories-media'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- FIX STORAGE: memories-media — restrict INSERT to own folder
DROP POLICY IF EXISTS "Authenticated users can upload memories media" ON storage.objects;
CREATE POLICY "Users can upload to own memories folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories-media'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 3. FIX PROFILES: allow circle co-members to read profiles
-- ============================================================
CREATE POLICY "Circle members can view co-member profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.circle_members cm1
      JOIN public.circle_members cm2 ON cm1.circle_id = cm2.circle_id
      WHERE cm1.user_id = auth.uid()
        AND cm2.user_id = profiles.user_id
    )
  );

-- Drop the old restrictive policy (replaced by the above)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- ============================================================
-- 4. FIX AUDIT LOGS: validate circle membership on insert
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
CREATE POLICY "Members can insert audit logs for their circles"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      circle_id IS NULL
      OR is_circle_member(auth.uid(), circle_id)
    )
  );

-- ============================================================
-- 5. FIX FAMILY CIRCLES: allow family_manager to update (not just owner)
-- ============================================================
DROP POLICY IF EXISTS "Owner can update circle" ON public.family_circles;
CREATE POLICY "Owner or manager can update circle"
  ON public.family_circles FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR is_circle_manager(auth.uid(), id)
  );

-- ============================================================
-- 6. FIX VAULT_DOCUMENTS: replace legacy 'contributor' with 'family_member'
-- ============================================================
DROP POLICY IF EXISTS "Authorized users can upload vault docs" ON public.vault_documents;
CREATE POLICY "Authorized users can upload vault docs"
  ON public.vault_documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND is_circle_member(auth.uid(), circle_id)
    AND get_circle_role(auth.uid(), circle_id) IN ('owner', 'family_manager', 'family_member')
  );

-- ============================================================
-- 7. CHECKLIST: allow family_member read access (view-only)
-- ============================================================
DROP POLICY IF EXISTS "Managers and executors can view checklist" ON public.checklist_items;
CREATE POLICY "Circle members can view relevant checklist items"
  ON public.checklist_items FOR SELECT
  USING (
    is_circle_manager(auth.uid(), circle_id)
    OR has_circle_role(auth.uid(), circle_id, 'proposed_executor'::app_role)
    OR has_circle_role(auth.uid(), circle_id, 'verified_executor'::app_role)
    OR (
      has_circle_role(auth.uid(), circle_id, 'family_member'::app_role)
      AND category NOT IN ('executor_readiness')
    )
  );
