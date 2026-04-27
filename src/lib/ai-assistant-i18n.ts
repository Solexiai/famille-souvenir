// Inline copy for the AI Assistant module (Phase 1).
// Kept separate from the main i18n bundle to minimize blast radius.

export type AILang = 'fr' | 'en' | 'es';

export const AI_COPY: Record<AILang, {
  page_title: string;
  page_subtitle: string;
  disclaimer_title: string;
  disclaimer_body: string;
  disclaimer_accept: string;
  context_title: string;
  context_country: string;
  context_region: string;
  context_language: string;
  context_preparing_for: string;
  context_save: string;
  preparing_self: string;
  preparing_family: string;
  tab_chat: string;
  tab_checklist: string;
  tab_settings: string;
  chat_placeholder: string;
  chat_send: string;
  chat_thinking: string;
  chat_empty_title: string;
  chat_empty_hint: string;
  chat_suggestion_1: string;
  chat_suggestion_2: string;
  chat_suggestion_3: string;
  generate_checklist: string;
  generating_checklist: string;
  checklist_empty: string;
  save_suggestion: string;
  saved: string;
  pro_review_badge: string;
  ai_badge: string;
  educational_badge: string;
  classify_btn: string;
  classify_running: string;
  classify_disclaimer: string;
  classify_result_title: string;
  classify_confidence: string;
  classify_reason: string;
  classify_next_steps: string;
  classify_pro_review: string;
  classify_apply: string;
  classify_dismiss: string;
  error_generic: string;
  error_rate: string;
  error_credits: string;
  saved_toast: string;
  ctx_required_title: string;
  ctx_required_body: string;
  ctx_required_cta: string;
  next_step_title: string;
  next_step_open_assistant: string;
  next_step_upload_doc: string;
  next_step_invite_member: string;
  empty_documents: string;
  empty_memories: string;
  empty_assistant: string;
  empty_family: string;
  section_identity_civil: string;
  section_legal_estate: string;
  section_financial_insurance: string;
  section_digital_legacy: string;
  section_memories_messages: string;
  section_people_to_contact: string;
  section_professional_review: string;
  section_state_province_specific: string;
  jurisdiction_aware_label: string;
  requires_local_verification: string;
  jurisdiction_warning: string;
  nav_assistant: string;
  // Mobile scan
  scan_btn: string;
  scan_dialog_title: string;
  scan_use_camera: string;
  scan_choose_file: string;
  scan_camera_hint: string;
  scan_preview_title: string;
  scan_retake: string;
  scan_use_this: string;
  scan_name_label: string;
  scan_name_placeholder: string;
  scan_category: string;
  scan_save: string;
  scan_uploading: string;
  scan_success: string;
  scan_source_badge: string;
  scan_dashboard_title: string;
  scan_dashboard_desc: string;
  scan_dashboard_cta: string;
  scan_pdf_hint: string;
  scan_source_badge_short: string;
  scan_source_badge_tooltip: string;
  // Documents helper
  documents_vault_helper: string;
  // Post-classification actions
  classify_action_apply: string;
  classify_action_add_checklist: string;
  classify_action_assign_reviewer: string;
  classify_action_send_governance: string;
  classify_added_to_checklist: string;
  classify_sent_to_governance: string;
  classify_already_in_checklist: string;
  classify_already_in_governance: string;
  // Reviewer dialog
  reviewer_dialog_title: string;
  reviewer_choose: string;
  reviewer_self: string;
  reviewer_circle_member: string;
  reviewer_external: string;
  reviewer_name_label: string;
  reviewer_name_placeholder: string;
  reviewer_role_label: string;
  reviewer_due_date_label: string;
  reviewer_save: string;
  reviewer_saved: string;
  reviewer_role_family: string;
  reviewer_role_executor: string;
  reviewer_role_notary: string;
  reviewer_role_advisor: string;
  reviewer_role_other: string;
  reviewer_assigned_badge: string;
  // Checklist task title prefix
  classify_checklist_task_prefix: string;
}> = {
  fr: {
    page_title: 'Assistant IA Solexi',
    page_subtitle: 'Un guide bienveillant pour préparer vos documents, vos souvenirs et votre cercle familial.',
    disclaimer_title: 'Avant de commencer',
    disclaimer_body: "L'Assistant IA Solexi fournit une aide éducative et organisationnelle uniquement. Il ne donne pas de conseils juridiques, financiers, fiscaux, médicaux ou professionnels. Les règles successorales varient selon le pays, l'État et la province. Veuillez consulter un notaire, avocat, fiscaliste, conseiller financier ou autre professionnel qualifié avant toute décision.",
    disclaimer_accept: "J'ai compris, activer l'Assistant",
    context_title: 'Personnaliser mon assistant',
    context_country: 'Pays',
    context_region: 'État ou province',
    context_language: 'Langue préférée',
    context_preparing_for: 'Je prépare pour…',
    context_save: 'Enregistrer',
    preparing_self: 'Moi-même',
    preparing_family: 'Un proche',
    tab_chat: 'Conversation',
    tab_checklist: 'Liste de préparation',
    tab_settings: 'Préférences',
    chat_placeholder: 'Posez votre question à Solexi…',
    chat_send: 'Envoyer',
    chat_thinking: 'Solexi réfléchit…',
    chat_empty_title: 'Commencez la conversation',
    chat_empty_hint: 'Voici quelques pistes pour démarrer :',
    chat_suggestion_1: 'Quels documents devrais-je préparer pour ma famille ?',
    chat_suggestion_2: 'Aide-moi à organiser mes documents avant de rencontrer un notaire.',
    chat_suggestion_3: 'Que devrais-je préparer avant une discussion successorale ?',
    generate_checklist: 'Générer ma liste de préparation',
    generating_checklist: 'Création de votre liste personnalisée…',
    checklist_empty: 'Cliquez sur « Générer ma liste » pour obtenir un plan adapté à votre pays et à votre province.',
    save_suggestion: 'Enregistrer',
    saved: 'Enregistré',
    pro_review_badge: 'Vérification professionnelle recommandée',
    ai_badge: 'Suggestion assistée par IA',
    educational_badge: 'Conseil éducatif uniquement',
    classify_btn: 'Classer avec IA',
    classify_running: 'Analyse…',
    classify_disclaimer: "La classification IA s'appuie uniquement sur le nom et les métadonnées du fichier. Pour plus de précision, l'analyse du texte des documents pourra être ajoutée ultérieurement.",
    classify_result_title: 'Suggestion de l\'IA',
    classify_confidence: 'Confiance',
    classify_reason: 'Raison',
    classify_next_steps: 'Prochaines étapes recommandées',
    classify_pro_review: 'Une vérification professionnelle est recommandée pour ce document.',
    classify_apply: 'Appliquer cette catégorie',
    classify_dismiss: 'Ignorer',
    error_generic: 'Une erreur est survenue. Veuillez réessayer.',
    error_rate: "Trop de requêtes, veuillez patienter un instant.",
    error_credits: 'Crédits IA épuisés. Ajoutez des crédits dans Paramètres.',
    saved_toast: 'Suggestion enregistrée',
    ctx_required_title: 'Activez votre assistant',
    ctx_required_body: 'Sélectionnez votre pays, votre province et votre langue préférée pour recevoir des conseils adaptés.',
    ctx_required_cta: 'Configurer mon assistant',
    next_step_title: 'Étape recommandée',
    next_step_open_assistant: "Activez l'Assistant IA Solexi",
    next_step_upload_doc: 'Ajoutez votre premier document',
    next_step_invite_member: 'Invitez un proche dans votre cercle',
    empty_documents: "Vous n'avez encore ajouté aucun document. Commencez par une pièce d'identité, une assurance, un testament, un mandat ou un souvenir familial.",
    empty_memories: "Vous n'avez pas encore ajouté de souvenirs. Vous pouvez préserver photos, vidéos, audios, lettres et histoires familiales.",
    empty_assistant: "Activez l'Assistant Solexi IA pour recevoir une aide guidée à organiser vos documents, vos souvenirs et votre liste de préparation.",
    empty_family: 'Invitez des proches ou contacts de confiance pour bâtir votre cercle familial.',
    section_identity_civil: 'Identité et documents civils',
    section_legal_estate: 'Documents juridiques et successoraux',
    section_financial_insurance: 'Documents financiers et assurances',
    section_digital_legacy: 'Héritage numérique',
    section_memories_messages: 'Souvenirs et messages familiaux',
    section_people_to_contact: 'Personnes à contacter',
    section_professional_review: 'Vérification professionnelle requise',
    section_state_province_specific: 'Éléments spécifiques à votre État/province à vérifier',
    jurisdiction_aware_label: 'Conseils adaptés à votre juridiction',
    requires_local_verification: 'Nécessite une vérification par un professionnel local',
    jurisdiction_warning: "Solexi AI adapte ses suggestions selon votre localisation, mais ne fournit pas de conseils juridiques. Les règles successorales, fiscales, de probate et de directives médicales varient selon la juridiction. Veuillez consulter un professionnel qualifié de votre région.",
    nav_assistant: 'Assistant IA',
    scan_btn: 'Scanner un document',
    scan_dialog_title: 'Scanner un document',
    scan_use_camera: "Utiliser l'appareil photo",
    scan_choose_file: 'Choisir un fichier',
    scan_camera_hint: "Sur mobile, votre appareil photo s'ouvrira automatiquement.",
    scan_preview_title: 'Aperçu',
    scan_retake: 'Reprendre',
    scan_use_this: 'Utiliser ce scan',
    scan_name_label: 'Nommer ce document',
    scan_name_placeholder: 'Ex. Testament, Carte d\'identité, Police d\'assurance…',
    scan_category: 'Catégorie',
    scan_save: 'Enregistrer dans mes documents',
    scan_uploading: 'Envoi en cours…',
    scan_success: 'Document scanné enregistré',
    scan_source_badge: 'Importé depuis le scan mobile',
    scan_dashboard_title: 'Scannez votre premier document important',
    scan_dashboard_desc: 'Utilisez votre appareil photo pour ajouter rapidement un testament, une assurance, une pièce d\'identité ou un souvenir familial à votre coffre Solexi.',
    scan_dashboard_cta: 'Scanner maintenant',
    scan_pdf_hint: 'Votre scan sera enregistré en PDF lorsque possible.',
    scan_source_badge_short: 'Scan mobile',
    scan_source_badge_tooltip: 'Document importé depuis le scan mobile Solexi',
    documents_vault_helper: 'Vos documents restent dans votre coffre sécurisé. Après classification, vous pouvez les ajouter à votre Checklist ou les envoyer en Gouvernance pour révision.',
    classify_action_apply: 'Appliquer cette catégorie',
    classify_action_add_checklist: 'Ajouter à la Checklist',
    classify_action_assign_reviewer: 'Attribuer un responsable',
    classify_action_send_governance: 'Envoyer à la Gouvernance',
    classify_added_to_checklist: 'Tâche ajoutée à votre Checklist',
    classify_sent_to_governance: 'Document envoyé en Gouvernance',
    classify_already_in_checklist: 'Déjà dans la Checklist',
    classify_already_in_governance: 'Déjà en Gouvernance',
    reviewer_dialog_title: 'Attribuer un responsable',
    reviewer_choose: 'Choisir le type de responsable',
    reviewer_self: 'Moi-même',
    reviewer_circle_member: 'Un membre du cercle familial',
    reviewer_external: 'Un professionnel externe',
    reviewer_name_label: 'Nom du responsable',
    reviewer_name_placeholder: 'Ex. Marie Tremblay',
    reviewer_role_label: 'Rôle du responsable',
    reviewer_due_date_label: 'Date limite (optionnelle)',
    reviewer_save: 'Enregistrer',
    reviewer_saved: 'Responsable assigné',
    reviewer_role_family: 'Responsable familial',
    reviewer_role_executor: 'Exécuteur / liquidateur',
    reviewer_role_notary: 'Notaire / avocat',
    reviewer_role_advisor: 'Conseiller financier',
    reviewer_role_other: 'Autre',
    reviewer_assigned_badge: 'Responsable',
    classify_checklist_task_prefix: 'Réviser le document :',
  },
  en: {
    page_title: 'Solexi AI Assistant',
    page_subtitle: 'A calm guide to help you organize documents, memories, and your family circle.',
    disclaimer_title: 'Before we begin',
    disclaimer_body: 'Solexi AI provides educational and organizational assistance only. It does not provide legal, financial, tax, medical, or professional advice. Estate and succession rules vary by country, state, and province. Please consult a qualified notary, lawyer, tax professional, financial advisor, or other qualified professional before making decisions.',
    disclaimer_accept: 'I understand, activate the Assistant',
    context_title: 'Personalize my assistant',
    context_country: 'Country',
    context_region: 'State or province',
    context_language: 'Preferred language',
    context_preparing_for: 'I am preparing for…',
    context_save: 'Save',
    preparing_self: 'Myself',
    preparing_family: 'A family member',
    tab_chat: 'Chat',
    tab_checklist: 'Preparation checklist',
    tab_settings: 'Preferences',
    chat_placeholder: 'Ask Solexi a question…',
    chat_send: 'Send',
    chat_thinking: 'Solexi is thinking…',
    chat_empty_title: 'Start the conversation',
    chat_empty_hint: 'Here are a few ideas to begin:',
    chat_suggestion_1: 'What documents should I prepare for my family?',
    chat_suggestion_2: 'Help me organize my documents before meeting a notary.',
    chat_suggestion_3: 'What should I prepare before a succession discussion?',
    generate_checklist: 'Generate my preparation checklist',
    generating_checklist: 'Building your personalized checklist…',
    checklist_empty: 'Click "Generate my checklist" to receive a plan tailored to your country and province.',
    save_suggestion: 'Save',
    saved: 'Saved',
    pro_review_badge: 'Professional review recommended',
    ai_badge: 'AI-assisted suggestion',
    educational_badge: 'Educational guidance only',
    classify_btn: 'Classify with AI',
    classify_running: 'Analyzing…',
    classify_disclaimer: 'AI classification uses filename and metadata only. Document text analysis may be added later for higher accuracy.',
    classify_result_title: 'AI suggestion',
    classify_confidence: 'Confidence',
    classify_reason: 'Reason',
    classify_next_steps: 'Recommended next steps',
    classify_pro_review: 'Professional review is recommended for this document.',
    classify_apply: 'Apply this category',
    classify_dismiss: 'Dismiss',
    error_generic: 'Something went wrong. Please try again.',
    error_rate: 'Too many requests. Please wait a moment.',
    error_credits: 'AI credits exhausted. Please add credits in Settings.',
    saved_toast: 'Suggestion saved',
    ctx_required_title: 'Activate your assistant',
    ctx_required_body: 'Select your country, province and preferred language to receive tailored guidance.',
    ctx_required_cta: 'Set up my assistant',
    next_step_title: 'Recommended next step',
    next_step_open_assistant: 'Activate Solexi AI Assistant',
    next_step_upload_doc: 'Add your first document',
    next_step_invite_member: 'Invite a loved one to your circle',
    empty_documents: "You haven't uploaded any documents yet. Start with an ID, insurance, will, mandate, or a family memory.",
    empty_memories: "You haven't added memories yet. Preserve photos, videos, audio, letters, and family stories.",
    empty_assistant: 'Activate Solexi AI to receive guided help organizing your documents, memories, and preparation checklist.',
    empty_family: 'Invite trusted family members or contacts to build your family circle.',
    section_identity_civil: 'Identity and civil documents',
    section_legal_estate: 'Legal and estate documents',
    section_financial_insurance: 'Financial and insurance documents',
    section_digital_legacy: 'Digital legacy',
    section_memories_messages: 'Family memories and messages',
    section_people_to_contact: 'People to contact',
    section_professional_review: 'Professional review needed',
    section_state_province_specific: 'State/province-specific items to verify',
    jurisdiction_aware_label: 'Jurisdiction-aware guidance',
    requires_local_verification: 'Requires local professional verification',
    jurisdiction_warning: 'Solexi AI adapts suggestions based on your selected location, but it does not provide legal advice. Estate, inheritance, probate, tax, and healthcare directive rules vary by jurisdiction. Please consult a qualified local professional.',
    nav_assistant: 'AI Assistant',
    scan_btn: 'Scan a document',
    scan_dialog_title: 'Scan a document',
    scan_use_camera: 'Use phone camera',
    scan_choose_file: 'Choose a file',
    scan_camera_hint: 'On mobile, your camera will open automatically.',
    scan_preview_title: 'Preview',
    scan_retake: 'Retake',
    scan_use_this: 'Use this scan',
    scan_name_label: 'Name this document',
    scan_name_placeholder: 'e.g. Will, ID card, Insurance policy…',
    scan_category: 'Category',
    scan_save: 'Save to my documents',
    scan_uploading: 'Uploading…',
    scan_success: 'Scanned document saved',
    scan_source_badge: 'Uploaded from mobile scan',
    scan_dashboard_title: 'Scan your first important document',
    scan_dashboard_desc: 'Use your phone camera to quickly add a will, insurance document, identity document, or family memory to your Solexi vault.',
    scan_dashboard_cta: 'Scan now',
    scan_pdf_hint: 'Your scan will be saved as a PDF when possible.',
    scan_source_badge_short: 'Mobile scan',
    scan_source_badge_tooltip: 'Document uploaded from Solexi mobile scan',
    documents_vault_helper: 'Your documents remain in your secure vault. After classification, you can add them to your Checklist or send them to Governance for review.',
    classify_action_apply: 'Apply category',
    classify_action_add_checklist: 'Add to Checklist',
    classify_action_assign_reviewer: 'Assign reviewer',
    classify_action_send_governance: 'Send to Governance',
    classify_added_to_checklist: 'Task added to your Checklist',
    classify_sent_to_governance: 'Document sent to Governance',
    classify_already_in_checklist: 'Already in Checklist',
    classify_already_in_governance: 'Already in Governance',
    reviewer_dialog_title: 'Assign reviewer',
    reviewer_choose: 'Choose reviewer type',
    reviewer_self: 'Myself',
    reviewer_circle_member: 'A family circle member',
    reviewer_external: 'An external professional',
    reviewer_name_label: 'Reviewer name',
    reviewer_name_placeholder: 'e.g. Marie Tremblay',
    reviewer_role_label: 'Reviewer role',
    reviewer_due_date_label: 'Due date (optional)',
    reviewer_save: 'Save',
    reviewer_saved: 'Reviewer assigned',
    reviewer_role_family: 'Family responsible person',
    reviewer_role_executor: 'Executor',
    reviewer_role_notary: 'Notary / attorney',
    reviewer_role_advisor: 'Financial advisor',
    reviewer_role_other: 'Other',
    reviewer_assigned_badge: 'Reviewer',
    classify_checklist_task_prefix: 'Review document:',
  },
  es: {
    page_title: 'Asistente IA Solexi',
    page_subtitle: 'Una guía serena para organizar tus documentos, recuerdos y círculo familiar.',
    disclaimer_title: 'Antes de empezar',
    disclaimer_body: 'Solexi AI ofrece asistencia educativa y organizativa únicamente. No proporciona asesoramiento legal, financiero, fiscal, médico ni profesional. Las normas sucesorias varían según el país, estado y provincia. Consulte a un notario, abogado, asesor fiscal, financiero u otro profesional cualificado antes de tomar decisiones.',
    disclaimer_accept: 'Lo entiendo, activar el Asistente',
    context_title: 'Personalizar mi asistente',
    context_country: 'País',
    context_region: 'Estado o provincia',
    context_language: 'Idioma preferido',
    context_preparing_for: 'Estoy preparando para…',
    context_save: 'Guardar',
    preparing_self: 'Mí mismo',
    preparing_family: 'Un familiar',
    tab_chat: 'Conversación',
    tab_checklist: 'Lista de preparación',
    tab_settings: 'Preferencias',
    chat_placeholder: 'Hazle una pregunta a Solexi…',
    chat_send: 'Enviar',
    chat_thinking: 'Solexi está pensando…',
    chat_empty_title: 'Empieza la conversación',
    chat_empty_hint: 'Algunas ideas para comenzar:',
    chat_suggestion_1: '¿Qué documentos debo preparar para mi familia?',
    chat_suggestion_2: 'Ayúdame a organizar mis documentos antes de ver a un notario.',
    chat_suggestion_3: '¿Qué debería preparar antes de una conversación sucesoria?',
    generate_checklist: 'Generar mi lista de preparación',
    generating_checklist: 'Creando tu lista personalizada…',
    checklist_empty: 'Pulsa "Generar mi lista" para obtener un plan adaptado a tu país y provincia.',
    save_suggestion: 'Guardar',
    saved: 'Guardado',
    pro_review_badge: 'Revisión profesional recomendada',
    ai_badge: 'Sugerencia asistida por IA',
    educational_badge: 'Orientación educativa únicamente',
    classify_btn: 'Clasificar con IA',
    classify_running: 'Analizando…',
    classify_disclaimer: 'La clasificación IA solo usa nombre y metadatos del archivo. Más adelante podrá añadirse análisis del texto.',
    classify_result_title: 'Sugerencia de IA',
    classify_confidence: 'Confianza',
    classify_reason: 'Motivo',
    classify_next_steps: 'Próximos pasos recomendados',
    classify_pro_review: 'Se recomienda una revisión profesional de este documento.',
    classify_apply: 'Aplicar esta categoría',
    classify_dismiss: 'Descartar',
    error_generic: 'Ha ocurrido un error. Inténtalo de nuevo.',
    error_rate: 'Demasiadas solicitudes. Espera un momento.',
    error_credits: 'Créditos IA agotados. Añade créditos en Ajustes.',
    saved_toast: 'Sugerencia guardada',
    ctx_required_title: 'Activa tu asistente',
    ctx_required_body: 'Selecciona país, provincia e idioma preferido para recibir orientación adaptada.',
    ctx_required_cta: 'Configurar mi asistente',
    next_step_title: 'Paso recomendado',
    next_step_open_assistant: 'Activar el Asistente IA Solexi',
    next_step_upload_doc: 'Añade tu primer documento',
    next_step_invite_member: 'Invita a un ser querido a tu círculo',
    empty_documents: 'Aún no has subido documentos. Empieza con una identificación, seguro, testamento, mandato o recuerdo familiar.',
    empty_memories: 'Aún no has añadido recuerdos. Conserva fotos, vídeos, audios, cartas e historias familiares.',
    empty_assistant: 'Activa Solexi AI para recibir ayuda guiada organizando tus documentos, recuerdos y lista de preparación.',
    empty_family: 'Invita a familiares o contactos de confianza para construir tu círculo familiar.',
    section_identity_civil: 'Identidad y documentos civiles',
    section_legal_estate: 'Documentos legales y sucesorios',
    section_financial_insurance: 'Documentos financieros y seguros',
    section_digital_legacy: 'Herencia digital',
    section_memories_messages: 'Recuerdos y mensajes familiares',
    section_people_to_contact: 'Personas a contactar',
    section_professional_review: 'Requiere revisión profesional',
    section_state_province_specific: 'Elementos específicos de su estado/provincia a verificar',
    jurisdiction_aware_label: 'Orientación adaptada a su jurisdicción',
    requires_local_verification: 'Requiere verificación por un profesional local',
    jurisdiction_warning: 'Solexi AI adapta las sugerencias según su ubicación seleccionada, pero no proporciona asesoramiento legal. Las normas sucesorias, fiscales, de probate y de directivas médicas varían según la jurisdicción. Consulte a un profesional cualificado de su región.',
    nav_assistant: 'Asistente IA',
    scan_btn: 'Escanear un documento',
    scan_dialog_title: 'Escanear un documento',
    scan_use_camera: 'Usar la cámara del teléfono',
    scan_choose_file: 'Elegir un archivo',
    scan_camera_hint: 'En móvil, la cámara se abrirá automáticamente.',
    scan_preview_title: 'Vista previa',
    scan_retake: 'Repetir',
    scan_use_this: 'Usar este escaneo',
    scan_name_label: 'Nombrar este documento',
    scan_name_placeholder: 'Ej. Testamento, Documento de identidad, Póliza de seguro…',
    scan_category: 'Categoría',
    scan_save: 'Guardar en mis documentos',
    scan_uploading: 'Subiendo…',
    scan_success: 'Documento escaneado guardado',
    scan_source_badge: 'Subido desde escaneo móvil',
    scan_dashboard_title: 'Escanea tu primer documento importante',
    scan_dashboard_desc: 'Usa la cámara de tu teléfono para añadir rápidamente un testamento, un seguro, un documento de identidad o un recuerdo familiar a tu caja fuerte Solexi.',
    scan_dashboard_cta: 'Escanear ahora',
    scan_pdf_hint: 'Su escaneo se guardará como PDF cuando sea posible.',
    scan_source_badge_short: 'Escaneo móvil',
    scan_source_badge_tooltip: 'Documento subido desde escaneo móvil Solexi',
    documents_vault_helper: 'Sus documentos permanecen en su bóveda segura. Después de la clasificación, puede añadirlos a su Checklist o enviarlos a Gobernanza para revisión.',
    classify_action_apply: 'Aplicar esta categoría',
    classify_action_add_checklist: 'Añadir a la Checklist',
    classify_action_assign_reviewer: 'Asignar revisor',
    classify_action_send_governance: 'Enviar a Gobernanza',
    classify_added_to_checklist: 'Tarea añadida a su Checklist',
    classify_sent_to_governance: 'Documento enviado a Gobernanza',
    classify_already_in_checklist: 'Ya está en la Checklist',
    classify_already_in_governance: 'Ya está en Gobernanza',
    reviewer_dialog_title: 'Asignar revisor',
    reviewer_choose: 'Elegir tipo de revisor',
    reviewer_self: 'Mí mismo',
    reviewer_circle_member: 'Un miembro del círculo familiar',
    reviewer_external: 'Un profesional externo',
    reviewer_name_label: 'Nombre del revisor',
    reviewer_name_placeholder: 'Ej. Marie Tremblay',
    reviewer_role_label: 'Rol del revisor',
    reviewer_due_date_label: 'Fecha límite (opcional)',
    reviewer_save: 'Guardar',
    reviewer_saved: 'Revisor asignado',
    reviewer_role_family: 'Responsable familiar',
    reviewer_role_executor: 'Ejecutor',
    reviewer_role_notary: 'Notario / abogado',
    reviewer_role_advisor: 'Asesor financiero',
    reviewer_role_other: 'Otro',
    reviewer_assigned_badge: 'Revisor',
    classify_checklist_task_prefix: 'Revisar el documento:',
  },
};

export const COUNTRIES = [
  { code: 'CA', label_fr: 'Canada', label_en: 'Canada', label_es: 'Canadá' },
  { code: 'US', label_fr: 'États-Unis', label_en: 'United States', label_es: 'Estados Unidos' },
  { code: 'FR', label_fr: 'France', label_en: 'France', label_es: 'Francia' },
  { code: 'BE', label_fr: 'Belgique', label_en: 'Belgium', label_es: 'Bélgica' },
  { code: 'CH', label_fr: 'Suisse', label_en: 'Switzerland', label_es: 'Suiza' },
  { code: 'ES', label_fr: 'Espagne', label_en: 'Spain', label_es: 'España' },
  { code: 'MX', label_fr: 'Mexique', label_en: 'Mexico', label_es: 'México' },
  { code: 'OTHER', label_fr: 'Autre', label_en: 'Other', label_es: 'Otro' },
];

export function countryLabel(code: string, lang: AILang): string {
  const c = COUNTRIES.find(x => x.code === code);
  if (!c) return code;
  return lang === 'fr' ? c.label_fr : lang === 'es' ? c.label_es : c.label_en;
}
