-- =============================================================
-- Solexi — Script de seed pour environnement de test
-- =============================================================
-- USAGE : Exécuter APRÈS avoir créé les comptes de test via l'UI
--
-- Prérequis : les 4 comptes suivants doivent exister dans auth.users :
--   test.owner@solexi.ai
--   test.member@solexi.ai
--   test.heir@solexi.ai
--   test.viewer@solexi.ai
--
-- Ce script :
--   1. Met à jour les profils
--   2. Crée un cercle de test
--   3. Assigne les rôles
--   4. Ajoute des données de test (checklist, docs, governance, memories)
-- =============================================================

-- ── Variables (récupérées dynamiquement) ──────────────────────

DO $$
DECLARE
  v_owner_id    uuid;
  v_member_id   uuid;
  v_heir_id     uuid;
  v_viewer_id   uuid;
  v_circle_id   uuid;
BEGIN

  -- Récupérer les user_ids depuis auth.users
  SELECT id INTO v_owner_id  FROM auth.users WHERE email = 'test.owner@solexi.ai';
  SELECT id INTO v_member_id FROM auth.users WHERE email = 'test.member@solexi.ai';
  SELECT id INTO v_heir_id   FROM auth.users WHERE email = 'test.heir@solexi.ai';
  SELECT id INTO v_viewer_id FROM auth.users WHERE email = 'test.viewer@solexi.ai';

  -- Vérifier que tous les comptes existent
  IF v_owner_id IS NULL THEN RAISE EXCEPTION 'Compte test.owner@solexi.ai introuvable'; END IF;
  IF v_member_id IS NULL THEN RAISE EXCEPTION 'Compte test.member@solexi.ai introuvable'; END IF;
  IF v_heir_id IS NULL THEN RAISE EXCEPTION 'Compte test.heir@solexi.ai introuvable'; END IF;
  IF v_viewer_id IS NULL THEN RAISE EXCEPTION 'Compte test.viewer@solexi.ai introuvable'; END IF;

  -- ── Mettre à jour les profils ──────────────────────────────

  UPDATE profiles SET
    full_name = 'Test Owner', first_name = 'Test', last_name = 'Owner',
    city = 'Montréal', language = 'fr', country_group = 'canada',
    country_code = 'CA', region_code = 'QC', preferred_language = 'fr'
  WHERE user_id = v_owner_id;

  UPDATE profiles SET
    full_name = 'Test Member', first_name = 'Test', last_name = 'Member',
    city = 'Québec', language = 'fr', country_group = 'canada',
    country_code = 'CA', region_code = 'QC', preferred_language = 'fr'
  WHERE user_id = v_member_id;

  UPDATE profiles SET
    full_name = 'Test Héritier', first_name = 'Test', last_name = 'Héritier',
    city = 'Laval', language = 'fr', country_group = 'canada',
    country_code = 'CA', region_code = 'QC', preferred_language = 'fr'
  WHERE user_id = v_heir_id;

  UPDATE profiles SET
    full_name = 'Test Viewer', first_name = 'Test', last_name = 'Viewer',
    city = 'Gatineau', language = 'fr', country_group = 'canada',
    country_code = 'CA', region_code = 'QC', preferred_language = 'fr'
  WHERE user_id = v_viewer_id;

  -- ── Créer le cercle de test ────────────────────────────────

  INSERT INTO family_circles (id, name, description, owner_id, country_group, country_code, region_code, jurisdiction_pack, currency_code)
  VALUES (
    gen_random_uuid(), 'Cercle Test Solexi', 'Cercle de test standardisé pour validation QA',
    v_owner_id, 'canada', 'CA', 'QC', 'canada_qc', 'CAD'
  )
  RETURNING id INTO v_circle_id;

  -- ── Assigner les rôles ─────────────────────────────────────

  INSERT INTO circle_members (circle_id, user_id, role) VALUES
    (v_circle_id, v_owner_id,  'owner'),
    (v_circle_id, v_member_id, 'family_member'),
    (v_circle_id, v_heir_id,   'heir'),
    (v_circle_id, v_viewer_id, 'viewer');

  -- ── Labels familiaux ───────────────────────────────────────

  INSERT INTO member_family_labels (circle_id, member_id, label, note) VALUES
    (v_circle_id, v_owner_id,  'protected_person',  'Personne protégée principale'),
    (v_circle_id, v_member_id, 'family_manager_label', 'Gestionnaire familial désigné'),
    (v_circle_id, v_heir_id,   'heir_label',        'Héritier désigné'),
    (v_circle_id, v_viewer_id, 'trusted_contact',   'Contact de confiance externe');

  -- ── Checklist de test ──────────────────────────────────────

  INSERT INTO checklist_items (circle_id, category, title, description, status) VALUES
    (v_circle_id, 'legal',      'Rédiger le testament',           'Consulter un notaire pour la rédaction.', 'not_started'),
    (v_circle_id, 'legal',      'Mandat de protection',           'Préparer le mandat en cas d''inaptitude.', 'not_started'),
    (v_circle_id, 'identity',   'Rassembler les pièces d''identité', 'Passeport, permis, carte santé.', 'in_progress'),
    (v_circle_id, 'financial',  'Inventaire des comptes bancaires', 'Lister tous les comptes et institutions.', 'not_started'),
    (v_circle_id, 'insurance',  'Vérifier les polices d''assurance', 'Assurance vie, habitation, auto.', 'completed'),
    (v_circle_id, 'property',   'Évaluation immobilière',         'Obtenir une évaluation de la résidence.', 'not_started'),
    (v_circle_id, 'digital_estate', 'Inventaire des comptes numériques', 'Email, réseaux sociaux, abonnements.', 'in_progress'),
    (v_circle_id, 'final_wishes', 'Préférences funéraires',       'Documenter les volontés pour les obsèques.', 'not_started'),
    (v_circle_id, 'contacts',   'Liste des contacts importants',  'Notaire, comptable, médecin, banquier.', 'not_started'),
    (v_circle_id, 'executor_readiness', 'Briefing exécuteur',     'Préparer le dossier pour l''exécuteur.', 'not_started');

  -- ── Gouvernance de test ────────────────────────────────────

  INSERT INTO governance_responsibilities (circle_id, member_id, area, title, description, status) VALUES
    (v_circle_id, v_member_id, 'documents',         'Numérisation des documents',   'Scanner et classer tous les documents papier.', 'assigned'),
    (v_circle_id, v_member_id, 'legal_follow_up',   'Suivi notarial',               'Contacter le notaire pour mise à jour du mandat.', 'not_started'),
    (v_circle_id, v_owner_id,  'finances',          'Bilan financier annuel',       'Mettre à jour le bilan des actifs et passifs.', 'in_progress'),
    (v_circle_id, v_member_id, 'insurance',         'Renouvellement assurances',    'Vérifier les dates de renouvellement.', 'assigned'),
    (v_circle_id, v_owner_id,  'funeral_wishes',    'Documentation des volontés',   'Rédiger et stocker les préférences funéraires.', 'not_started');

  -- ── Souvenirs de test ──────────────────────────────────────

  INSERT INTO memories (circle_id, author_id, type, caption, visibility) VALUES
    (v_circle_id, v_owner_id,  'text',  'Premier souvenir du cercle de test.', 'circle'),
    (v_circle_id, v_member_id, 'text',  'Note de la famille : tout va bien !', 'circle'),
    (v_circle_id, v_owner_id,  'text',  'Note privée du propriétaire.',        'private');

  RAISE NOTICE '✅ Seed terminé — Cercle: % | Owner: % | Member: % | Heir: % | Viewer: %',
    v_circle_id, v_owner_id, v_member_id, v_heir_id, v_viewer_id;

END $$;
