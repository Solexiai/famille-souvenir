-- =============================================================
-- Solexi — Reset de l'environnement de test
-- =============================================================
-- Ce script supprime TOUTES les données associées aux comptes de test
-- sans toucher aux données de production.
--
-- ATTENTION : irréversible. Ne jamais exécuter en production.
-- =============================================================

DO $$
DECLARE
  v_test_emails text[] := ARRAY[
    'test.owner@solexi.ai',
    'test.member@solexi.ai',
    'test.heir@solexi.ai',
    'test.viewer@solexi.ai'
  ];
  v_test_user_ids uuid[];
  v_test_circle_ids uuid[];
BEGIN

  -- Récupérer les user_ids de test
  SELECT array_agg(id) INTO v_test_user_ids
  FROM auth.users WHERE email = ANY(v_test_emails);

  IF v_test_user_ids IS NULL OR array_length(v_test_user_ids, 1) = 0 THEN
    RAISE NOTICE 'Aucun compte de test trouvé. Rien à nettoyer.';
    RETURN;
  END IF;

  -- Récupérer les cercles de test (cercles dont le owner est un compte test)
  SELECT array_agg(id) INTO v_test_circle_ids
  FROM family_circles WHERE owner_id = ANY(v_test_user_ids);

  IF v_test_circle_ids IS NOT NULL THEN
    -- Supprimer les données liées aux cercles de test
    DELETE FROM executor_workspace_notes WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM governance_responsibilities WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM checklist_items WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM memories WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM documents WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM vault_documents WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM member_family_labels WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM invitations WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM upload_quotas WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM circle_members WHERE circle_id = ANY(v_test_circle_ids);
    DELETE FROM family_circles WHERE id = ANY(v_test_circle_ids);
  END IF;

  -- Supprimer les données utilisateur de test
  DELETE FROM notifications WHERE user_id = ANY(v_test_user_ids);
  DELETE FROM consents WHERE user_id = ANY(v_test_user_ids);
  DELETE FROM subscriptions WHERE user_id = ANY(v_test_user_ids);

  -- Nettoyer les invitations envoyées aux emails de test
  DELETE FROM invitations WHERE email = ANY(v_test_emails);

  RAISE NOTICE '✅ Reset terminé — % comptes nettoyés, % cercles supprimés',
    array_length(v_test_user_ids, 1),
    COALESCE(array_length(v_test_circle_ids, 1), 0);

END $$;
