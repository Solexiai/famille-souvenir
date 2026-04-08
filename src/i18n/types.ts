export type SupportedLanguage = 'fr' | 'en' | 'es';
export type CountryGroup = 'canada' | 'united_states' | 'latin_america';
export type JurisdictionPack = 'quebec' | 'canada_general' | 'us_general' | 'latam_general';
export type LegalTermsPack = 'quebec_fr' | 'quebec_en' | 'canada_en' | 'canada_fr' | 'us_en' | 'latam_es_general';

export interface Translations {
  // Nav & common
  app_name: string;
  app_tagline: string;
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

  // Legal disclaimers
  disclaimer_jurisdiction: string;
  disclaimer_not_legal: string;
  disclaimer_professional: string;
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
