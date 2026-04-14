-- ==============================================
-- FIX 1: memories-media SELECT policy
-- Align with memories table RLS visibility logic
-- ==============================================

DROP POLICY IF EXISTS "Circle members can view shared memories media" ON storage.objects;

CREATE POLICY "Memories media access by visibility"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'memories-media'
  AND (
    -- Author can always access their own files
    (auth.uid())::text = (storage.foldername(name))[1]
    OR
    -- Circle visibility: any circle member
    EXISTS (
      SELECT 1 FROM memories m
      JOIN circle_members cm ON cm.circle_id = m.circle_id
      WHERE cm.user_id = auth.uid()
        AND m.visibility = 'circle'
        AND (
          m.media_url = name
          OR m.media_url LIKE '%/' || name
          OR name = m.media_url
        )
    )
    OR
    -- Managers visibility: only owner + family_manager
    EXISTS (
      SELECT 1 FROM memories m
      JOIN circle_members cm ON cm.circle_id = m.circle_id
      WHERE cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'family_manager')
        AND m.visibility = 'managers'
        AND (
          m.media_url = name
          OR m.media_url LIKE '%/' || name
          OR name = m.media_url
        )
    )
  )
);

-- ==============================================
-- FIX 2: vault-private SELECT policy
-- Align with vault_documents table RLS visibility logic
-- ==============================================

DROP POLICY IF EXISTS "Users can view own vault files" ON storage.objects;

CREATE POLICY "Vault access by visibility"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'vault-private'
  AND (
    -- Owner/uploader can always access their own folder
    (auth.uid())::text = (storage.foldername(name))[1]
    OR
    -- Circle visibility: any circle member
    EXISTS (
      SELECT 1 FROM vault_documents vd
      JOIN circle_members cm ON cm.circle_id = vd.circle_id
      WHERE cm.user_id = auth.uid()
        AND vd.visibility = 'circle'
        AND vd.file_url = name
    )
    OR
    -- Managers visibility: only owner + family_manager
    EXISTS (
      SELECT 1 FROM vault_documents vd
      JOIN circle_members cm ON cm.circle_id = vd.circle_id
      WHERE cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'family_manager')
        AND vd.visibility = 'managers'
        AND vd.file_url = name
    )
    OR
    -- Documents table (vault-private also stores documents)
    EXISTS (
      SELECT 1 FROM documents d
      JOIN circle_members cm ON cm.circle_id = d.circle_id
      WHERE cm.user_id = auth.uid()
        AND d.storage_path = name
        AND (
          -- family_circle visibility
          (d.visibility = 'family_circle' AND cm.role IS NOT NULL)
          OR
          -- managers_only
          (d.visibility = 'managers_only' AND cm.role IN ('owner', 'family_manager'))
          OR
          -- heirs_only
          (d.visibility = 'heirs_only' AND cm.role IN ('owner', 'family_manager', 'heir'))
          OR
          -- executor_workspace
          (d.visibility = 'executor_workspace' AND cm.role IN ('owner', 'family_manager', 'proposed_executor', 'verified_executor'))
          OR
          -- verified_executor_only
          (d.visibility = 'verified_executor_only' AND cm.role IN ('owner', 'verified_executor'))
          OR
          -- private_owner — uploader only (handled by foldername check above)
          (d.visibility = 'private_owner' AND d.uploaded_by = auth.uid())
        )
    )
  )
);