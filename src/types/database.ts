export type AppRole = 'owner' | 'family_manager' | 'family_member' | 'heir' | 'proposed_executor' | 'verified_executor';
export type MemoryType = 'photo' | 'video' | 'audio' | 'text';
export type MemoryVisibility = 'circle' | 'managers' | 'private';
export type DocumentVisibility = 'private_owner' | 'managers_only' | 'family_circle' | 'heirs_only' | 'executor_workspace' | 'verified_executor_only';
export type VerificationStatus = 'unreviewed' | 'identified' | 'needs_update' | 'needs_professional_review' | 'document_verified';
export type ChecklistStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review' | 'blocked';
export type ChecklistCategory = 'legal' | 'identity' | 'financial' | 'insurance' | 'property' | 'digital_estate' | 'final_wishes' | 'contacts' | 'executor_readiness';
export type GovernanceArea = 'documents' | 'legal_follow_up' | 'insurance' | 'finances' | 'digital_assets' | 'property' | 'medical_directives' | 'funeral_wishes' | 'notary_contact';
export type GovernanceStatus = 'not_started' | 'assigned' | 'in_progress' | 'completed' | 'blocked' | 'needs_attention';
export type DeathStatus = 'not_reported' | 'reported' | 'manually_verified';
export type DossierReadinessStatus = 'initial' | 'in_progress' | 'partial' | 'ready_for_professional_review' | 'executor_ready';
export type DocumentaryStatus = 'unknown' | 'declared' | 'located' | 'professionally_confirmed';
export type FamilyLabel = 'protected_person' | 'family_manager_label' | 'caregiver' | 'heir_label' | 'trusted_contact' | 'proposed_executor_label' | 'testament_named_executor' | 'external_professional';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Legacy types kept for backward compat with vault_documents (to be removed later)
export type VaultVisibility = 'owner' | 'managers' | 'circle';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  language: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyCircle {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  testament_status: DocumentaryStatus;
  mandate_status: DocumentaryStatus;
  notary_status: DocumentaryStatus;
  beneficiary_designation_status: DocumentaryStatus;
  critical_documents_status: string;
  dossier_readiness_status: DossierReadinessStatus;
  death_status: DeathStatus;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: AppRole;
  joined_at: string;
  profiles?: Profile;
}

export interface MemberFamilyLabel {
  id: string;
  circle_id: string;
  member_id: string;
  label: FamilyLabel;
  note: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  circle_id: string;
  email: string;
  role: AppRole;
  token: string;
  status: InvitationStatus;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export interface Memory {
  id: string;
  circle_id: string;
  author_id: string;
  type: MemoryType;
  caption: string;
  media_url: string | null;
  visibility: MemoryVisibility;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Document {
  id: string;
  circle_id: string;
  uploaded_by: string;
  category: string;
  title: string;
  description: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  visibility: DocumentVisibility;
  verification_status: VerificationStatus;
  review_note: string;
  linked_responsible_member: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  circle_id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  status: ChecklistStatus;
  assigned_to: string | null;
  due_date: string | null;
  linked_document_id: string | null;
  evidence_note: string;
  requires_professional_review: boolean;
  blocked_reason: string;
  created_at: string;
  updated_at: string;
}

export interface GovernanceResponsibility {
  id: string;
  circle_id: string;
  member_id: string;
  area: GovernanceArea;
  title: string;
  description: string;
  status: GovernanceStatus;
  due_date: string | null;
  linked_checklist_item: string | null;
  linked_document: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ExecutorWorkspaceNote {
  id: string;
  circle_id: string;
  author_id: string;
  title: string;
  content: string;
  visibility_scope: string;
  created_at: string;
  updated_at: string;
}

// Legacy — kept for backward compat with existing vault_documents table
export interface VaultDocument {
  id: string;
  circle_id: string;
  uploaded_by: string;
  label: string;
  category: string;
  file_url: string;
  file_name: string;
  file_size: number;
  visibility: VaultVisibility;
  created_at: string;
  profiles?: Profile;
}

export interface Consent {
  id: string;
  user_id: string;
  default_sharing: string;
  privacy_accepted: boolean;
  privacy_accepted_at: string | null;
  marketing_consent: boolean;
  updated_at: string;
}
