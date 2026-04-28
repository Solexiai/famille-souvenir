// Inline copy for the AI-guided onboarding flow.
// Separate from AI_COPY to keep the type stable.

export type GuidedLang = 'fr' | 'en' | 'es';

export interface GuidedOnboardingCopy {
  // Shell
  welcome_eyebrow: string;
  welcome_title: string;
  welcome_subtitle: string;
  step_label: string; // "Step {n} of {total}"
  next: string;
  back: string;
  skip: string;
  finish: string;
  later: string;

  // Step 1
  s1_title: string;
  s1_subtitle: string;
  s1_self: string;
  s1_self_desc: string;
  s1_loved_one: string;
  s1_loved_one_desc: string;

  // Step 2 (members)
  s2_title: string;
  s2_subtitle: string;
  s2_name_placeholder: string;
  s2_email_placeholder: string;
  s2_role_label: string;
  s2_relationship_placeholder: string;
  s2_add: string;
  s2_remove: string;
  s2_empty: string;
  s2_no_invite_note: string;
  s2_role_manager: string;
  s2_role_member: string;
  s2_role_executor: string;
  s2_role_professional: string;

  // Step 3 (roles confirmation)
  s3_title: string;
  s3_subtitle: string;
  s3_role_manager_desc: string;
  s3_role_member_desc: string;
  s3_role_executor_desc: string;
  s3_role_professional_desc: string;

  // Step 4 (checklist generation)
  s4_title: string;
  s4_subtitle: string;
  s4_generating: string;
  s4_base_label: string;
  s4_ai_label: string;
  s4_ai_loading: string;
  s4_ai_failed: string;
  s4_done_title: string;
  s4_done_subtitle: string;
  s4_open_checklist: string;
  s4_open_dashboard: string;

  // Toasts / errors
  toast_saved: string;
  toast_error: string;

  // Base checklist tasks (5-6 universal items)
  base_task_id_title: string;
  base_task_id_desc: string;
  base_task_will_title: string;
  base_task_will_desc: string;
  base_task_accounts_title: string;
  base_task_accounts_desc: string;
  base_task_executor_title: string;
  base_task_executor_desc: string;
  base_task_family_title: string;
  base_task_family_desc: string;
  base_task_doc_title: string;
  base_task_doc_desc: string;
}

export const GUIDED_COPY: Record<GuidedLang, GuidedOnboardingCopy> = {
  fr: {
    welcome_eyebrow: 'Bienvenue',
    welcome_title: 'Préparons votre espace ensemble',
    welcome_subtitle: "Quelques questions pour personnaliser Solexi à votre situation. Cela prend moins de deux minutes.",
    step_label: 'Étape {n} sur {total}',
    next: 'Continuer',
    back: 'Retour',
    skip: 'Passer cette étape',
    finish: 'Terminer',
    later: 'Plus tard',

    s1_title: 'Pour qui préparez-vous cet espace ?',
    s1_subtitle: 'Cela nous aide à adapter les conseils et la liste de préparation.',
    s1_self: 'Pour moi-même',
    s1_self_desc: "J'organise mes propres documents et souhaits.",
    s1_loved_one: 'Pour un proche',
    s1_loved_one_desc: "J'aide un parent ou un proche à préparer son dossier.",

    s2_title: 'Qui devrait faire partie de votre cercle ?',
    s2_subtitle: 'Ajoutez les personnes que vous souhaitez impliquer. Vous pourrez les inviter plus tard.',
    s2_name_placeholder: 'Nom complet',
    s2_email_placeholder: 'Adresse e-mail (optionnel)',
    s2_role_label: 'Rôle envisagé',
    s2_relationship_placeholder: 'Lien (ex. fille, notaire)',
    s2_add: 'Ajouter à mon cercle',
    s2_remove: 'Retirer',
    s2_empty: 'Aucun membre ajouté pour l\'instant.',
    s2_no_invite_note: 'Aucune invitation ne sera envoyée maintenant. Vous garderez le contrôle.',
    s2_role_manager: 'Gestionnaire',
    s2_role_member: 'Membre de la famille',
    s2_role_executor: 'Personne responsable (exécuteur)',
    s2_role_professional: 'Professionnel',

    s3_title: 'Confirmez les rôles initiaux',
    s3_subtitle: "Voici ce que chaque rôle pourra faire. Vous pourrez modifier cela à tout moment.",
    s3_role_manager_desc: 'Aide à organiser les documents, la checklist et les membres.',
    s3_role_member_desc: 'Consulte les documents partagés et ajoute des souvenirs.',
    s3_role_executor_desc: 'Personne pressentie pour exécuter vos volontés.',
    s3_role_professional_desc: 'Notaire, conseiller ou avocat avec accès limité.',

    s4_title: 'Je crée votre première liste de préparation',
    s4_subtitle: 'Une base solide pour démarrer, enrichie de suggestions personnalisées.',
    s4_generating: 'Création en cours…',
    s4_base_label: 'Tâches essentielles',
    s4_ai_label: 'Suggestions personnalisées par Solexi AI',
    s4_ai_loading: 'Personnalisation en cours…',
    s4_ai_failed: "Les suggestions personnalisées arriveront plus tard. Votre liste de base est prête.",
    s4_done_title: 'Votre espace est prêt',
    s4_done_subtitle: 'Vous pouvez avancer à votre rythme. Solexi vous accompagne pas à pas.',
    s4_open_checklist: 'Ouvrir ma checklist',
    s4_open_dashboard: 'Voir mon tableau de bord',

    toast_saved: 'Enregistré',
    toast_error: 'Une erreur est survenue.',

    base_task_id_title: 'Téléverser une pièce d\'identité',
    base_task_id_desc: 'Ajoutez une copie de votre pièce d\'identité dans le coffre.',
    base_task_will_title: 'Identifier ou téléverser un testament',
    base_task_will_desc: "Notez où il se trouve, ou ajoutez une copie s'il existe.",
    base_task_accounts_title: 'Lister vos comptes financiers principaux',
    base_task_accounts_desc: 'Banques, courtiers, assurances : juste les noms et institutions.',
    base_task_executor_title: 'Désigner une personne responsable',
    base_task_executor_desc: 'Indiquez qui pourrait être l\'exécuteur de vos volontés.',
    base_task_family_title: 'Ajouter les membres clés à votre cercle',
    base_task_family_desc: 'Invitez les personnes de confiance dans votre cercle familial.',
    base_task_doc_title: 'Ajouter un document important',
    base_task_doc_desc: 'Acte de naissance, contrat de mariage, ou tout document essentiel.',
  },
  en: {
    welcome_eyebrow: 'Welcome',
    welcome_title: 'Let\'s set up your space together',
    welcome_subtitle: 'A few questions to tailor Solexi to your situation. It takes less than two minutes.',
    step_label: 'Step {n} of {total}',
    next: 'Continue',
    back: 'Back',
    skip: 'Skip this step',
    finish: 'Finish',
    later: 'Later',

    s1_title: 'Who are you preparing this space for?',
    s1_subtitle: 'This helps us tailor the guidance and your starter checklist.',
    s1_self: 'For myself',
    s1_self_desc: 'I am organizing my own documents and wishes.',
    s1_loved_one: 'For a loved one',
    s1_loved_one_desc: 'I am helping a parent or relative prepare their dossier.',

    s2_title: 'Who should be part of your circle?',
    s2_subtitle: 'Add the people you want to involve. You can invite them later.',
    s2_name_placeholder: 'Full name',
    s2_email_placeholder: 'Email (optional)',
    s2_role_label: 'Intended role',
    s2_relationship_placeholder: 'Relationship (e.g. daughter, notary)',
    s2_add: 'Add to my circle',
    s2_remove: 'Remove',
    s2_empty: 'No members added yet.',
    s2_no_invite_note: 'No invitations will be sent now. You stay in control.',
    s2_role_manager: 'Manager',
    s2_role_member: 'Family member',
    s2_role_executor: 'Responsible person (executor)',
    s2_role_professional: 'Professional',

    s3_title: 'Confirm the initial roles',
    s3_subtitle: 'Here is what each role can do. You can change this anytime.',
    s3_role_manager_desc: 'Helps organize documents, checklist, and members.',
    s3_role_member_desc: 'Views shared documents and adds memories.',
    s3_role_executor_desc: 'The person you intend to carry out your wishes.',
    s3_role_professional_desc: 'Notary, advisor, or lawyer with limited access.',

    s4_title: 'Building your first preparation checklist',
    s4_subtitle: 'A solid foundation to start, enriched with personalized suggestions.',
    s4_generating: 'Creating…',
    s4_base_label: 'Essential tasks',
    s4_ai_label: 'Personalized by Solexi AI',
    s4_ai_loading: 'Personalizing…',
    s4_ai_failed: 'Personalized suggestions will arrive later. Your base list is ready.',
    s4_done_title: 'Your space is ready',
    s4_done_subtitle: 'You can move at your own pace. Solexi guides you step by step.',
    s4_open_checklist: 'Open my checklist',
    s4_open_dashboard: 'See my dashboard',

    toast_saved: 'Saved',
    toast_error: 'Something went wrong.',

    base_task_id_title: 'Upload an identity document',
    base_task_id_desc: 'Add a copy of your ID to the secure vault.',
    base_task_will_title: 'Identify or upload a will',
    base_task_will_desc: 'Note where it is, or add a copy if one exists.',
    base_task_accounts_title: 'List your main financial accounts',
    base_task_accounts_desc: 'Banks, brokers, insurance: just names and institutions.',
    base_task_executor_title: 'Designate a responsible person',
    base_task_executor_desc: 'Indicate who could be the executor of your wishes.',
    base_task_family_title: 'Add key members to your circle',
    base_task_family_desc: 'Invite trusted people into your family circle.',
    base_task_doc_title: 'Add one important document',
    base_task_doc_desc: 'Birth certificate, marriage contract, or any essential document.',
  },
  es: {
    welcome_eyebrow: 'Bienvenido',
    welcome_title: 'Preparemos su espacio juntos',
    welcome_subtitle: 'Algunas preguntas para personalizar Solexi a su situación. Toma menos de dos minutos.',
    step_label: 'Paso {n} de {total}',
    next: 'Continuar',
    back: 'Atrás',
    skip: 'Omitir este paso',
    finish: 'Finalizar',
    later: 'Más tarde',

    s1_title: '¿Para quién prepara este espacio?',
    s1_subtitle: 'Esto nos ayuda a adaptar la orientación y su lista inicial.',
    s1_self: 'Para mí',
    s1_self_desc: 'Estoy organizando mis propios documentos y deseos.',
    s1_loved_one: 'Para un ser querido',
    s1_loved_one_desc: 'Ayudo a un familiar a preparar su expediente.',

    s2_title: '¿Quién debería formar parte de su círculo?',
    s2_subtitle: 'Añada las personas que quiere involucrar. Podrá invitarlas más tarde.',
    s2_name_placeholder: 'Nombre completo',
    s2_email_placeholder: 'Correo electrónico (opcional)',
    s2_role_label: 'Rol previsto',
    s2_relationship_placeholder: 'Relación (ej. hija, notario)',
    s2_add: 'Añadir a mi círculo',
    s2_remove: 'Quitar',
    s2_empty: 'Aún no hay miembros añadidos.',
    s2_no_invite_note: 'No se enviarán invitaciones ahora. Usted mantiene el control.',
    s2_role_manager: 'Gestor',
    s2_role_member: 'Miembro de la familia',
    s2_role_executor: 'Persona responsable (ejecutor)',
    s2_role_professional: 'Profesional',

    s3_title: 'Confirme los roles iniciales',
    s3_subtitle: 'Esto es lo que cada rol puede hacer. Puede cambiarlo en cualquier momento.',
    s3_role_manager_desc: 'Ayuda a organizar documentos, lista y miembros.',
    s3_role_member_desc: 'Ve los documentos compartidos y añade recuerdos.',
    s3_role_executor_desc: 'Persona prevista para ejecutar sus deseos.',
    s3_role_professional_desc: 'Notario, asesor o abogado con acceso limitado.',

    s4_title: 'Creando su primera lista de preparación',
    s4_subtitle: 'Una base sólida para empezar, enriquecida con sugerencias personalizadas.',
    s4_generating: 'Creando…',
    s4_base_label: 'Tareas esenciales',
    s4_ai_label: 'Personalizado por Solexi AI',
    s4_ai_loading: 'Personalizando…',
    s4_ai_failed: 'Las sugerencias personalizadas llegarán más tarde. Su lista base está lista.',
    s4_done_title: 'Su espacio está listo',
    s4_done_subtitle: 'Puede avanzar a su ritmo. Solexi le guía paso a paso.',
    s4_open_checklist: 'Abrir mi lista',
    s4_open_dashboard: 'Ver mi panel',

    toast_saved: 'Guardado',
    toast_error: 'Algo salió mal.',

    base_task_id_title: 'Subir un documento de identidad',
    base_task_id_desc: 'Añada una copia de su identificación al cofre seguro.',
    base_task_will_title: 'Identificar o subir un testamento',
    base_task_will_desc: 'Anote dónde está, o añada una copia si existe.',
    base_task_accounts_title: 'Listar sus cuentas financieras principales',
    base_task_accounts_desc: 'Bancos, corredores, seguros: solo nombres e instituciones.',
    base_task_executor_title: 'Designar una persona responsable',
    base_task_executor_desc: 'Indique quién podría ser el ejecutor de sus deseos.',
    base_task_family_title: 'Añadir miembros clave a su círculo',
    base_task_family_desc: 'Invite a personas de confianza a su círculo familiar.',
    base_task_doc_title: 'Añadir un documento importante',
    base_task_doc_desc: 'Certificado de nacimiento, contrato de matrimonio, u otro esencial.',
  },
};

export interface BaseTaskDef {
  title: string;
  description: string;
  category: 'identity' | 'legal' | 'financial' | 'executor_readiness' | 'contacts';
}

export function getBaseChecklistTasks(lang: GuidedLang): BaseTaskDef[] {
  const c = GUIDED_COPY[lang];
  return [
    { title: c.base_task_id_title, description: c.base_task_id_desc, category: 'identity' },
    { title: c.base_task_will_title, description: c.base_task_will_desc, category: 'legal' },
    { title: c.base_task_accounts_title, description: c.base_task_accounts_desc, category: 'financial' },
    { title: c.base_task_executor_title, description: c.base_task_executor_desc, category: 'executor_readiness' },
    { title: c.base_task_family_title, description: c.base_task_family_desc, category: 'contacts' },
    { title: c.base_task_doc_title, description: c.base_task_doc_desc, category: 'legal' },
  ];
}
