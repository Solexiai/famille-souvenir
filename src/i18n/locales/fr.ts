import { Translations } from '../types';

const fr: Translations = {
  app_name: 'Solexi.ai',
  app_tagline: 'Famille',
  sign_in: 'Se connecter',
  sign_up: 'Créer un compte',
  sign_out: 'Déconnexion',
  save: 'Enregistrer',
  cancel: 'Annuler',
  continue_btn: 'Continuer',
  back: 'Retour',
  loading: 'Chargement…',
  free: 'Gratuit',
  upgrade: 'Passer au plan annuel',
  language: 'Langue',

  // Landing
  landing_hero_title: 'Protégez ceux que vous aimez',
  landing_hero_subtitle: 'Un espace sécurisé pour organiser votre dossier familial, coordonner vos proches et préparer l\'essentiel — étape par étape.',
  landing_cta_start: 'Commencer gratuitement',
  landing_cta_login: 'J\'ai déjà un compte',
  landing_why_title: 'Ce que Solexi.ai vous aide à faire',
  landing_why_subtitle: 'Construisez un dossier familial plus clair, étape par étape. La préparation réduit la confusion et les risques.',
  landing_features: [
    { title: 'Cercle familial', description: 'Réunissez vos proches dans un espace privé et sécurisé.' },
    { title: 'Documents protégés', description: 'Organisez et sécurisez vos documents importants avec contrôle de visibilité.' },
    { title: 'Préparation structurée', description: 'Checklists, gouvernance et coordination pour ne rien oublier.' },
    { title: 'Vie privée respectée', description: 'Vos données vous appartiennent. Contrôle total sur le partage.' },
  ],
  landing_why_now_title: 'Pourquoi maintenant ?',
  landing_why_now_items: [
    'Les familles qui se préparent réduisent les conflits et la confusion.',
    'Un dossier organisé facilite le travail des professionnels.',
    'La coordination familiale prend du temps — commencez aujourd\'hui.',
  ],
  landing_footer_rights: '© {year} Solexi.ai — Tous droits réservés',
  landing_privacy: 'Confidentialité',
  landing_terms: 'Conditions',
  landing_pricing: 'Tarifs',

  // Pricing
  pricing_title: 'Tarification simple et transparente',
  pricing_subtitle: 'Commencez gratuitement. Passez au plan annuel quand votre famille est prête.',
  pricing_free_title: 'Gratuit',
  pricing_free_features: [
    '1 cercle familial',
    'Jusqu\'à 5 membres',
    'Documents essentiels',
    'Checklist de base',
    'Gouvernance légère',
    'Score de préparation visible',
  ],
  pricing_annual_title: 'Famille — Annuel',
  pricing_annual_price: '149,99 $ CAD / an',
  pricing_annual_price_note: 'Facturation annuelle uniquement',
  pricing_annual_features: [
    'Membres illimités',
    'Coffre-fort étendu',
    'Checklist complète',
    'Gouvernance avancée',
    'Espace exécuteur / liquidateur',
    'Export du dossier professionnel',
    'Rappels et notifications avancés',
  ],
  pricing_founder_badge: 'Offre fondateur',
  pricing_founder_note: '74,99 $ CAD / an — 50 % de réduction pour les premiers utilisateurs',
  pricing_cta_free: 'Commencer gratuitement',
  pricing_cta_annual: 'Choisir le plan annuel',
  pricing_disclaimer: 'Solexi.ai ne remplace pas un avocat, un notaire ou un comptable. Les informations organisées ici sont destinées à faciliter la coordination familiale et la préparation, non à constituer un avis juridique.',

  // Setup
  setup_title: 'Bienvenue sur Solexi.ai',
  setup_subtitle: 'Configurons votre expérience selon votre situation.',
  setup_country_group: 'Où êtes-vous situé(e) ?',
  setup_country_group_options: {
    canada: 'Canada',
    united_states: 'États-Unis',
    latin_america: 'Amérique latine',
  },
  setup_region: 'Province / Territoire',
  setup_region_placeholder: 'Sélectionnez votre province',
  setup_country: 'Pays',
  setup_country_placeholder: 'Sélectionnez votre pays',
  setup_language: 'Langue d\'interface',
  setup_language_options: { fr: 'Français', en: 'English', es: 'Español' },

  // Onboarding
  onboarding_welcome: 'Bienvenue',
  onboarding_step_identity: 'Étape 1 — Votre identité',
  onboarding_step_identity_desc: 'Comment souhaitez-vous être identifié(e) ?',
  onboarding_step_circle: 'Étape 2 — Votre cercle',
  onboarding_step_circle_desc: 'Donnez un nom à votre cercle familial.',
  onboarding_step_purpose: 'Étape 3 — Votre situation',
  onboarding_step_purpose_desc: 'Ce dossier concerne…',
  onboarding_purpose_options: [
    { value: 'self', label: 'Moi-même' },
    { value: 'parent', label: 'Un parent ou un proche vieillissant' },
    { value: 'partner', label: 'Mon conjoint(e) / partenaire' },
    { value: 'family', label: 'Notre famille ensemble' },
  ],
  onboarding_full_name: 'Nom complet',
  onboarding_circle_name: 'Nom du cercle',
  onboarding_create_space: 'Créer mon espace',
  onboarding_emotional_tagline: 'Commencez par l\'essentiel. Protégez ceux que vous aimez.',

  // Readiness
  readiness_title: 'Préparation du dossier',
  readiness_complete: '{percent} % complété',
  readiness_critical_missing: '{count} élément(s) critique(s) manquant(s)',
  readiness_pro_review: '{count} élément(s) nécessitant une révision professionnelle',
  readiness_disclaimer: 'Ce score reflète la complétude du dossier tel que renseigné. Il ne constitue pas une validation juridique.',

  // Notifications
  notif_title: 'Notifications',
  notif_empty: 'Aucune notification pour le moment.',
  notif_mark_read: 'Marquer comme lu',

  // Plan gating
  plan_upgrade_title: 'Fonctionnalité du plan Famille',
  plan_upgrade_desc: 'Passez au plan annuel pour accéder à cette fonctionnalité.',
  plan_annual_label: 'Famille (Annuel)',
  plan_free_label: 'Gratuit',
  plan_gate_executor: 'Espace exécuteur avancé',
  plan_gate_export: 'Export du dossier',
  plan_gate_advanced_checklist: 'Checklist avancée',
  plan_gate_advanced_governance: 'Gouvernance avancée',
  plan_gate_member_limit: 'Limite de membres atteinte',
  plan_gate_document_limit: 'Limite de documents atteinte',
  plan_gate_reason_executor: 'L\'espace exécuteur complet est disponible avec le plan Famille annuel.',
  plan_gate_reason_export: 'L\'export structuré du dossier familial est disponible avec le plan Famille annuel.',
  plan_gate_reason_checklist: 'Les catégories de checklist avancées sont disponibles avec le plan Famille annuel.',
  plan_gate_reason_governance: 'La gouvernance détaillée et les responsabilités avancées sont disponibles avec le plan Famille annuel.',

  // Legal disclaimers
  disclaimer_jurisdiction: 'Selon votre juridiction, les exigences peuvent varier.',
  disclaimer_not_legal: 'Solexi.ai ne constitue pas un avis juridique.',
  disclaimer_professional: 'À confirmer avec un professionnel qualifié.',
};

export default fr;
