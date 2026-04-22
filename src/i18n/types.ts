export type SupportedLanguage = 'fr' | 'en' | 'es';
export type CountryGroup = 'canada' | 'united_states' | 'latin_america';
export type JurisdictionPack = 'quebec' | 'canada_general' | 'us_general' | 'latam_general';
export type LegalTermsPack = 'quebec_fr' | 'quebec_en' | 'canada_en' | 'canada_fr' | 'us_en' | 'latam_es_general';

export interface Translations {
  // Nav & common
  app_name: string;
  app_tagline: string;
  nav_home: string;
  sign_in: string;
  sign_up: string;
  sign_out: string;
  save: string;
  cancel: string;
  continue_btn: string;
  back: string;
  loading: string;
  free: string;
  upgrade: string;
  language: string;
  add: string;
  edit: string;
  delete_action: string;
  confirm: string;
  close: string;
  none: string;
  member: string;
  members: string;
  error_generic: string;
  success_generic: string;

  // Landing
  landing_hero_title: string;
  landing_hero_subtitle: string;
  landing_cta_start: string;
  landing_cta_login: string;
  landing_why_title: string;
  landing_why_subtitle: string;
  landing_features: Array<{ title: string; description: string }>;
  landing_why_now_title: string;
  landing_why_now_items: string[];
  landing_footer_rights: string;
  landing_privacy: string;
  landing_terms: string;
  landing_pricing: string;
  landing_trust_security: string;
  landing_trust_privacy: string;
  landing_trust_jurisdiction: string;
  landing_trust_multilingual: string;
  landing_how_tag: string;
  landing_how_title: string;
  landing_how_1_title: string;
  landing_how_1_desc: string;
  landing_how_2_title: string;
  landing_how_2_desc: string;
  landing_how_3_title: string;
  landing_how_3_desc: string;
  landing_how_4_title: string;
  landing_how_4_desc: string;
  landing_val_1_title: string;
  landing_val_1_desc: string;
  landing_val_2_title: string;
  landing_val_2_desc: string;
  landing_val_3_title: string;
  landing_val_3_desc: string;
  landing_val_4_title: string;
  landing_val_4_desc: string;

  // Pricing
  pricing_title: string;
  pricing_subtitle: string;
  pricing_free_title: string;
  pricing_free_features: string[];
  pricing_annual_title: string;
  pricing_annual_price: string;
  pricing_annual_price_note: string;
  pricing_annual_features: string[];
  pricing_founder_badge: string;
  pricing_founder_note: string;
  pricing_cta_free: string;
  pricing_cta_annual: string;
  pricing_disclaimer: string;

  // Setup
  setup_title: string;
  setup_subtitle: string;
  setup_country_group: string;
  setup_country_group_options: Record<CountryGroup, string>;
  setup_region: string;
  setup_region_placeholder: string;
  setup_country: string;
  setup_country_placeholder: string;
  setup_language: string;
  setup_language_options: Record<SupportedLanguage, string>;

  // Onboarding
  onboarding_welcome: string;
  onboarding_step_identity: string;
  onboarding_step_identity_desc: string;
  onboarding_step_circle: string;
  onboarding_step_circle_desc: string;
  onboarding_step_purpose: string;
  onboarding_step_purpose_desc: string;
  onboarding_purpose_options: Array<{ value: string; label: string }>;
  onboarding_full_name: string;
  onboarding_circle_name: string;
  onboarding_create_space: string;
  onboarding_emotional_tagline: string;

  // Dashboard / readiness
  readiness_title: string;
  readiness_complete: string;
  readiness_critical_missing: string;
  readiness_pro_review: string;
  readiness_disclaimer: string;

  // Notifications
  notif_title: string;
  notif_empty: string;
  notif_mark_read: string;

  // Plan gating
  plan_upgrade_title: string;
  plan_upgrade_desc: string;
  plan_annual_label: string;
  plan_free_label: string;
  plan_gate_executor: string;
  plan_gate_export: string;
  plan_gate_advanced_checklist: string;
  plan_gate_advanced_governance: string;
  plan_gate_member_limit: string;
  plan_gate_document_limit: string;
  plan_gate_reason_executor: string;
  plan_gate_reason_export: string;
  plan_gate_reason_checklist: string;
  plan_gate_reason_governance: string;

  // Legal disclaimers
  disclaimer_jurisdiction: string;
  disclaimer_not_legal: string;
  disclaimer_professional: string;

  // Auth pages
  auth_app_subtitle: string;
  auth_login_title: string;
  auth_login_desc: string;
  auth_email: string;
  auth_password: string;
  auth_submit_login: string;
  auth_forgot_password: string;
  auth_no_account: string;
  auth_create_account: string;
  auth_signup_title: string;
  auth_signup_desc: string;
  auth_full_name: string;
  auth_confirm_password: string;
  auth_submit_signup: string;
  auth_has_account: string;
  auth_password_hint: string;
  auth_verify_email_title: string;
  auth_verify_email_desc: string;
  auth_back_to_login: string;
  auth_forgot_title: string;
  auth_forgot_desc: string;
  auth_send_reset: string;
  auth_email_sent_title: string;
  auth_email_sent_desc: string;
  auth_invalid_credentials: string;
  auth_signup_error: string;
  auth_reset_error: string;
  auth_validation_email: string;
  auth_validation_password_required: string;
  auth_validation_name_min: string;
  auth_validation_password_min: string;
  auth_validation_password_upper: string;
  auth_validation_password_lower: string;
  auth_validation_password_digit: string;
  auth_validation_password_mismatch: string;

  // Dashboard
  dash_greeting: string;
  dash_greeting_default: string;
  dash_subtitle: string;
  dash_create_circle: string;
  dash_create_circle_desc: string;
  dash_create_circle_btn: string;
  dash_your_circle: string;
  dash_dossier_status: string;
  dash_preparation: string;
  dash_documents: string;
  dash_checklist: string;
  dash_to_verify: string;
  dash_blocked: string;
  dash_pro_review_required: string;
  dash_documentary_prep: string;
  dash_documentary_disclaimer: string;
  dash_manage_statuses: string;
  dash_governance: string;
  dash_responsibilities: string;
  dash_completed: string;
  dash_attention_required: string;
  dash_view_governance: string;
  dash_executor_summary: string;
  dash_proposed_executor: string;
  dash_testament_named: string;
  dash_verified_access: string;
  dash_executor_confirm: string;
  dash_view_designations: string;
  dash_memories: string;
  dash_executor: string;

  // Documentary status labels
  doc_status_unknown: string;
  doc_status_declared: string;
  doc_status_located: string;
  doc_status_confirmed: string;
  doc_status_testament: string;
  doc_status_mandate: string;
  doc_status_notary: string;
  doc_status_beneficiaries: string;

  // Dossier readiness
  dossier_initial: string;
  dossier_in_progress: string;
  dossier_partial: string;
  dossier_ready_review: string;
  dossier_executor_ready: string;

  // Settings page
  settings_title: string;
  settings_profile: string;
  settings_full_name: string;
  settings_email: string;
  settings_language: string;
  settings_privacy_title: string;
  settings_privacy_desc: string;
  settings_default_sharing: string;
  settings_sharing_circle: string;
  settings_sharing_managers: string;
  settings_sharing_private: string;
  settings_privacy_policy: string;
  settings_privacy_accept: string;
  settings_marketing: string;
  settings_marketing_desc: string;
  settings_save_preferences: string;
  settings_export_data: string;
  settings_export_desc: string;
  settings_export_success: string;
  settings_export_error: string;
  settings_delete_account: string;
  settings_delete_title: string;
  settings_delete_desc: string;
  settings_delete_warning: string;
  settings_delete_confirm_word: string;
  settings_delete_type_prompt: string;
  settings_delete_confirm_btn: string;
  settings_delete_submitted: string;
  settings_delete_alert: string;
  settings_save_success: string;
  settings_save_error: string;
  settings_consent_saved: string;

  // Members page
  members_title: string;
  members_tab_members: string;
  members_tab_invitations: string;
  members_tab_labels: string;
  members_tab_executor: string;
  members_no_circle: string;
  members_create_circle: string;
  members_none: string;

  // Circle page
  circle_title: string;
  circle_create_title: string;
  circle_create_desc: string;
  circle_name_label: string;
  circle_name_placeholder: string;
  circle_desc_label: string;
  circle_desc_placeholder: string;
  circle_create_btn: string;
  circle_edit_title: string;
  circle_default_desc: string;
  circle_validation_min: string;

  // Documents page
  docs_title: string;
  docs_subtitle: string;
  docs_add: string;
  docs_add_title: string;
  docs_title_label: string;
  docs_title_placeholder: string;
  docs_description: string;
  docs_category: string;
  docs_file: string;
  docs_file_hint: string;
  docs_visibility: string;
  docs_empty: string;
  docs_empty_desc: string;
  docs_upload_error: string;
  docs_save_error: string;
  docs_added: string;
  docs_download_error: string;
  docs_max_size: string;
  docs_categories: Record<string, string>;
  docs_visibility_labels: Record<string, string>;
  docs_verification_labels: Record<string, string>;

  // Checklist page
  checklist_title: string;
  checklist_subtitle: string;
  checklist_add_title: string;
  checklist_edit_title: string;
  checklist_category: string;
  checklist_title_label: string;
  checklist_title_placeholder: string;
  checklist_description: string;
  checklist_description_placeholder: string;
  checklist_status: string;
  checklist_blocked_reason: string;
  checklist_blocked_placeholder: string;
  checklist_assigned_to: string;
  checklist_unassigned: string;
  checklist_due_date: string;
  checklist_no_due_date: string;
  checklist_remove_date: string;
  checklist_linked_doc: string;
  checklist_evidence_note: string;
  checklist_evidence_placeholder: string;
  checklist_pro_review: string;
  checklist_empty: string;
  checklist_empty_desc: string;
  checklist_no_filter_match: string;
  checklist_all_statuses: string;
  checklist_all_members: string;
  checklist_sort_category: string;
  checklist_sort_urgency: string;
  checklist_sort_due_date: string;
  checklist_complete_count: string;
  checklist_to_verify: string;
  checklist_blocked_label: string;
  checklist_pro_count: string;
  checklist_doc_backed: string;
  checklist_update_error: string;
  checklist_updated: string;
  checklist_create_error: string;
  checklist_created: string;
  checklist_categories: Record<string, string>;
  checklist_statuses: Record<string, string>;

  // Governance page
  gov_title: string;
  gov_subtitle: string;
  gov_add_title: string;
  gov_edit_title: string;
  gov_area: string;
  gov_title_label: string;
  gov_title_placeholder: string;
  gov_description: string;
  gov_description_placeholder: string;
  gov_responsible: string;
  gov_responsible_placeholder: string;
  gov_unassigned: string;
  gov_status: string;
  gov_due_date: string;
  gov_no_due_date: string;
  gov_remove_date: string;
  gov_linked_checklist: string;
  gov_linked_doc: string;
  gov_note: string;
  gov_note_placeholder: string;
  gov_assign_btn: string;
  gov_empty: string;
  gov_empty_desc: string;
  gov_no_filter_match: string;
  gov_all_areas: string;
  gov_all_statuses: string;
  gov_all_members: string;
  gov_assigned_count: string;
  gov_completed_count: string;
  gov_blocked_count: string;
  gov_attention_count: string;
  gov_update_error: string;
  gov_updated: string;
  gov_create_error: string;
  gov_created: string;
  gov_delete_confirm: string;
  gov_deleted: string;
  gov_areas: Record<string, string>;
  gov_statuses: Record<string, string>;

  // Executor page
  exec_title: string;
  exec_subtitle: string;
  exec_disclaimer: string;
  exec_dossier_readiness: string;
  exec_dossier: string;
  exec_death: string;
  exec_death_not_reported: string;
  exec_death_reported: string;
  exec_death_verified: string;
  exec_checklist_summary: string;
  exec_complete: string;
  exec_coordination: string;
  exec_prep_notes: string;
  exec_add_note: string;
  exec_note_title: string;
  exec_note_content: string;
  exec_note_placeholder: string;
  exec_no_notes: string;
  exec_note_error: string;
  exec_note_added: string;
  exec_no_checklist: string;

  // Executor designation
  exec_desg_title: string;
  exec_desg_subtitle: string;
  exec_desg_family_proposed: string;
  exec_desg_family_proposed_desc: string;
  exec_desg_testament_named: string;
  exec_desg_testament_named_desc: string;
  exec_desg_app_verified: string;
  exec_desg_app_verified_desc: string;
  exec_desg_app_proposed: string;
  exec_desg_app_proposed_desc: string;
  exec_desg_none: string;
  exec_desg_none_desc: string;
  exec_desg_levels_title: string;
  exec_desg_level_family: string;
  exec_desg_level_documentary: string;
  exec_desg_level_app: string;
  exec_desg_disclaimer: string;

  // Documentary status manager
  docmgr_title: string;
  docmgr_subtitle: string;
  docmgr_disclaimer: string;
  docmgr_status_updated: string;
  docmgr_update_error: string;
  docmgr_fields: Record<string, string>;
  docmgr_documentary_statuses: Record<string, string>;
  docmgr_death_statuses: Record<string, string>;
  docmgr_readiness_statuses: Record<string, string>;
  docmgr_critical_statuses: Record<string, string>;

  // Family labels
  labels_title: string;
  labels_subtitle: string;
  labels_assign: string;
  labels_assign_title: string;
  labels_member: string;
  labels_member_placeholder: string;
  labels_label: string;
  labels_label_placeholder: string;
  labels_note: string;
  labels_note_placeholder: string;
  labels_assign_btn: string;
  labels_none: string;
  labels_duplicate: string;
  labels_add_error: string;
  labels_added: string;
  labels_remove_error: string;
  labels_removed: string;
  labels_disclaimer: string;
  labels_names: Record<string, string>;

  // Invite member
  invite_title: string;
  invite_first_name: string;
  invite_last_name: string;
  invite_email: string;
  invite_phone: string;
  invite_city: string;
  invite_relationship: string;
  invite_relationship_placeholder: string;
  invite_role: string;
  invite_role_manager: string;
  invite_role_member: string;
  invite_role_heir: string;
  invite_message: string;
  invite_message_placeholder: string;
  invite_submit: string;
  invite_success: string;
  invite_success_desc: string;
  invite_share_link: string;
  invite_link_copied: string;
  invite_error: string;
  invite_validation_first: string;
  invite_validation_last: string;
  invite_validation_email: string;
  invite_already_member: string;
  invite_already_pending: string;
  invite_already_accepted_member: string;
  invite_email_failed: string;
  invite_sent_to: string;
  invite_resent_to: string;
  invite_resent_failed: string;

  // Invitations list
  invitations_title: string;
  invitations_pending: string;
  invitations_accepted: string;
  invitations_declined: string;
  invitations_expired: string;
  invitations_sent_on: string;
  invitations_resent: string;
  invitations_resend: string;
  invitations_cancel_btn: string;
  invitations_resend_error: string;
  invitations_cancel_error: string;
  invitations_cancelled: string;

  // Auth callback
  auth_cb_verifying: string;
  auth_cb_attaching: string;
  auth_cb_joined: string;
  auth_cb_redirecting: string;
  auth_cb_attach_error: string;
  auth_cb_session_invalid: string;
  auth_cb_session_not_found: string;
  auth_cb_unexpected: string;
  auth_cb_go_dashboard: string;

  // Generic create-circle CTA
  please_create_circle: string;
  create_circle: string;

  // Accept invitation page
  accept_title: string;
  accept_verifying: string;
  accept_invalid_link: string;
  accept_already_accepted: string;
  accept_expired: string;
  accept_declined: string;
  accept_no_longer_valid: string;
  accept_cannot_verify: string;
  accept_back_home: string;
  accept_redirecting: string;
  accept_join_circle: string;
  accept_invited_to: string;
  accept_addressed_to: string;
  accept_login_or_signup: string;
  accept_login: string;
  accept_signup: string;
  accept_recipient: string;
  accept_role: string;
  accept_circle: string;
  accept_btn: string;
  accept_success_default: string;
  accept_error_default: string;

  // Member card
  member_roles: Record<string, string>;
  member_emergency: string;

  // Memories page
  memories_title: string;
  memories_new: string;
  memories_add_title: string;
  memories_type: string;
  memories_caption: string;
  memories_caption_placeholder: string;
  memories_file: string;
  memories_file_hint: string;
  memories_visibility: string;
  memories_empty: string;
  memories_empty_desc: string;
  memories_error: string;
  memories_added: string;
  memories_type_labels: Record<string, string>;
  memories_visibility_labels: Record<string, string>;
  memories_validation_caption: string;
  memories_file_too_large: string;
  memories_file_type_error: string;
  memories_upload_error: string;

  // Founder / Soul section
  founder_section_tag: string;
  founder_section_title: string;
  founder_name: string;
  founder_role: string;
  founder_quote_1: string;
  founder_quote_2: string;
  founder_quote_3: string;
  founder_quote_4: string;

  // MFA
  mfa_title: string;
  mfa_desc: string;
  mfa_enabled: string;
  mfa_disabled: string;
  mfa_enable_btn: string;
  mfa_disable_btn: string;
  mfa_scan_qr: string;
  mfa_enter_code: string;
  mfa_verify: string;
  mfa_verifying: string;
  mfa_success: string;
  mfa_disabled_success: string;
  mfa_error: string;
  mfa_invalid_code: string;
  mfa_challenge_title: string;
  mfa_challenge_desc: string;
  mfa_challenge_submit: string;
  mfa_challenge_error: string;
}

export interface TerminologyPack {
  executor: string;
  will: string;
  mandate: string;
  notary: string;
  estate: string;
  beneficiary: string;
  dossier: string;
  trust: string;
  probate: string;
  power_of_attorney: string;
}
