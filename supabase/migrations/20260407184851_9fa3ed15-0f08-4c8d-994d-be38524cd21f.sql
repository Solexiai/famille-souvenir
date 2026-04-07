
-- Add new values to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'family_member';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'heir';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'proposed_executor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'verified_executor';

-- Create new enum types
CREATE TYPE public.document_visibility AS ENUM (
  'private_owner', 'managers_only', 'family_circle', 'heirs_only', 'executor_workspace', 'verified_executor_only'
);
CREATE TYPE public.verification_status AS ENUM (
  'unreviewed', 'identified', 'needs_update', 'needs_professional_review', 'document_verified'
);
CREATE TYPE public.checklist_status AS ENUM (
  'not_started', 'in_progress', 'completed', 'needs_review', 'blocked'
);
CREATE TYPE public.checklist_category AS ENUM (
  'legal', 'identity', 'financial', 'insurance', 'property', 'digital_estate', 'final_wishes', 'contacts', 'executor_readiness'
);
CREATE TYPE public.governance_area AS ENUM (
  'documents', 'legal_follow_up', 'insurance', 'finances', 'digital_assets', 'property', 'medical_directives', 'funeral_wishes', 'notary_contact'
);
CREATE TYPE public.governance_status AS ENUM (
  'assigned', 'in_progress', 'completed', 'needs_attention'
);
CREATE TYPE public.death_status AS ENUM (
  'not_reported', 'reported', 'manually_verified'
);
CREATE TYPE public.dossier_readiness_status AS ENUM (
  'initial', 'in_progress', 'partial', 'ready_for_professional_review', 'executor_ready'
);
CREATE TYPE public.documentary_status AS ENUM (
  'unknown', 'declared', 'located', 'professionally_confirmed'
);
CREATE TYPE public.family_label AS ENUM (
  'protected_person', 'family_manager_label', 'caregiver', 'heir_label', 'trusted_contact', 'proposed_executor_label', 'testament_named_executor', 'external_professional'
);
