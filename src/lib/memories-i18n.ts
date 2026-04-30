// Trilingual copy (FR/EN/ES) for the Memories section and its sub-pages:
// MemoriesPage, TraditionsPage, TimelinePage, RecipesPage, StoriesPage,
// GalleryPage, TimeMessagesPage.
//
// Kept as a separate module from src/i18n/locales to avoid bloating the main
// translations bundle. Use via: const c = MEMORIES_COPY[lang];

export type MemLang = 'fr' | 'en' | 'es';

export interface MemoriesCopy {
  // ===== Shared =====
  common_loading: string;
  common_add: string;
  common_save: string;
  common_cancel: string;
  common_delete: string;
  common_edit: string;
  common_options: string;
  common_view_all: string;
  common_back: string;
  common_close: string;
  common_yes: string;
  common_no: string;
  common_required: string;
  common_optional: string;
  common_locale: string; // BCP-47 for toLocaleDateString
  must_create_circle: string;
  create_circle: string;

  // ===== MemoriesPage =====
  mem_title: string;
  mem_subtitle: string;
  mem_new: string;
  mem_add_title: string;
  mem_caption: string;
  mem_caption_placeholder: string;
  mem_type: string;
  mem_type_text: string;
  mem_type_photo: string;
  mem_type_video: string;
  mem_type_audio: string;
  mem_file: string;
  mem_file_hint: string;
  mem_visibility: string;
  mem_visibility_circle: string;
  mem_visibility_managers: string;
  mem_visibility_private: string;
  mem_added: string;
  mem_error: string;
  mem_upload_error: string;
  mem_validation_caption: string;

  // Categories
  cat_recipes_title: string;
  cat_recipes_desc: string;
  cat_stories_title: string;
  cat_stories_desc: string;
  cat_photos_title: string;
  cat_photos_desc: string;
  cat_letters_title: string;
  cat_letters_desc: string;
  cat_traditions_title: string;
  cat_traditions_desc: string;
  cat_timeline_title: string;
  cat_timeline_desc: string;
  cat_aria: string;

  // Stats band
  stats_aria: string;
  stats_memories: string;
  stats_generations: string;
  stats_secure_title: string;
  stats_secure_desc: string;

  // Rediscover + collections
  rediscover_title: string;
  rediscover_empty_hint: string;
  rediscover_create_first: string;
  collections_title: string;
  col_grandma_recipes: string;
  col_births_weddings: string;
  col_messages_for_later: string;
  col_family_home: string;

  // Filters
  filters_aria: string;
  filter_all: string;
  filter_recipes: string;
  filter_audio: string;
  filter_video: string;
  filter_documents: string;
  filter_by_person: string;
  filter_by_generation: string;

  // Demo memories
  demo_recipe_badge: string;
  demo_audio_badge: string;
  demo_photo_badge: string;
  demo_cake_title: string;
  demo_cake_author: string;
  demo_childhood_title: string;
  demo_childhood_author: string;
  demo_beach_title: string;
  demo_beach_author: string;

  // ===== TraditionsPage =====
  tr_title: string;
  tr_subtitle: string;
  tr_new: string;
  tr_add_title: string;
  tr_edit_title: string;
  tr_name: string;
  tr_name_placeholder: string;
  tr_category: string;
  tr_recurrence: string;
  tr_month: string;
  tr_day: string;
  tr_origin_year: string;
  tr_origin_year_placeholder: string;
  tr_description: string;
  tr_description_placeholder: string;
  tr_participants: string;
  tr_participants_placeholder: string;
  tr_rituals: string;
  tr_rituals_placeholder: string;
  tr_rituals_section: string;
  tr_since: string;
  tr_date_tbd: string;
  tr_empty_title: string;
  tr_empty_desc: string;
  tr_add_first: string;
  tr_example_title: string;
  tr_example_desc: string;
  tr_example_alt: string;
  tr_confirm_delete: string;
  tr_deleted: string;
  tr_saved_added: string;
  tr_saved_updated: string;
  tr_save_error: string;
  tr_delete_error: string;
  tr_validation_name: string;
  // categories
  tr_cat_celebration: string;
  tr_cat_religious: string;
  tr_cat_seasonal: string;
  tr_cat_culinary: string;
  tr_cat_cultural: string;
  tr_cat_other: string;
  // recurrence
  tr_rec_annual: string;
  tr_rec_monthly: string;
  tr_rec_weekly: string;
  tr_rec_occasional: string;
  // months
  months: [string, string, string, string, string, string, string, string, string, string, string, string];

  // ===== TimelinePage =====
  tl_title: string;
  tl_subtitle: string;
  tl_new: string;
  tl_add_title: string;
  tl_edit_title: string;
  tl_event_title_label: string;
  tl_event_title_placeholder: string;
  tl_date: string;
  tl_category: string;
  tl_description: string;
  tl_description_placeholder: string;
  tl_count_events_one: string;
  tl_count_events_many: string;
  tl_count_dated_one: string;
  tl_count_dated_many: string;
  tl_empty_title: string;
  tl_empty_desc: string;
  tl_add_first: string;
  tl_example_title: string;
  tl_example_desc: string;
  tl_example_alt: string;
  tl_memory_badge: string;
  tl_view_memory: string;
  tl_confirm_delete: string;
  tl_deleted: string;
  tl_saved_added: string;
  tl_saved_updated: string;
  tl_save_error: string;
  tl_delete_error: string;
  tl_validation_title: string;
  tl_validation_date: string;
  // categories
  tl_cat_birth: string;
  tl_cat_wedding: string;
  tl_cat_graduation: string;
  tl_cat_home: string;
  tl_cat_travel: string;
  tl_cat_milestone: string;

  // ===== RecipesPage =====
  rec_title: string;
  rec_subtitle: string;
  rec_action_photo: string;
  rec_action_photo_hint: string;
  rec_action_write: string;
  rec_action_write_hint: string;
  rec_action_dictate: string;
  rec_action_dictate_hint: string;
  rec_search_placeholder: string;
  rec_section_our: string;
  rec_no_match: string;
  rec_organize_title: string;
  rec_organize_hint: string;
  rec_filter_all: string;
  rec_filter_main: string;
  rec_filter_dessert: string;
  rec_filter_favorites: string;
  rec_class_family: string;
  rec_class_family_hint: string;
  rec_class_occasion: string;
  rec_class_occasion_hint: string;
  rec_class_generation: string;
  rec_class_generation_hint: string;
  rec_class_dish: string;
  rec_class_dish_hint: string;
  rec_class_scanned: string;
  rec_class_scanned_hint: string;
  rec_class_favorites: string;
  rec_class_favorites_hint: string;
  rec_back_all: string;
  rec_empty_title: string;
  rec_empty_desc: string;
  rec_empty_add: string;
  rec_empty_scan: string;
  rec_empty_invite: string;
  rec_heritage_title: string;
  rec_heritage_desc: string;
  rec_heritage_photos: string;
  rec_heritage_audio: string;
  rec_heritage_notes: string;
  rec_heritage_anec: string;
  rec_heritage_cta: string;
  rec_featured_badge: string;
  rec_featured_transmitted: string;
  rec_featured_generations: string;
  rec_featured_first: string;
  rec_featured_view: string;
  rec_card_no_photo: string;
  rec_demo_badge: string;
  rec_badge_handwritten: string;
  rec_badge_audio: string;
  rec_badge_memory: string;
  rec_badge_note: string;
  rec_change_photo: string;
  rec_add_photo: string;
  rec_take_photo: string;
  rec_pick_from_device: string;
  rec_no_main_photo: string;
  rec_prep: string;
  rec_cook: string;
  rec_servings: string;
  rec_story_title: string;
  rec_ingredients_title: string;
  rec_steps_title: string;
  rec_transmitted_by: string;
  rec_original_author: string;
  rec_branch: string;
  rec_generation: string;
  rec_occasions: string;
  rec_delete_btn: string;
  rec_add_memory_btn: string;
  rec_close: string;
  rec_confirm_delete_title: string;
  rec_confirm_delete_desc: string;
  rec_confirm_delete_yes: string;
  rec_no_data_view: string;
  rec_no_recipe_in_cat: string;
  rec_without_branch: string;
  rec_without_generation: string;
  rec_without_occasion: string;
  rec_handwritten_group: string;
  rec_favorites_group: string;
  rec_dish_appetizer: string;
  rec_dish_soup: string;
  rec_dish_main: string;
  rec_dish_side: string;
  rec_dish_dessert: string;
  rec_dish_preserve: string;
  rec_dish_drink: string;
  rec_dish_sauce: string;
  rec_dish_bread: string;
  rec_dish_other: string;
  rec_toast_extracted: string;
  rec_toast_photo_updated: string;
  rec_toast_photo_error: string;
  rec_toast_deleted: string;
  rec_toast_delete_error: string;
  rec_demo_recipe_title: string;
  rec_demo_recipe_branch: string;
  rec_demo_recipe_occasion: string;
  rec_demo_recipe_transmitted: string;
  // CreateRecipeDialog form
  rec_must_create_circle: string;
  rec_create_circle_btn: string;
  rec_loading: string;
  rec_create_dialog_title: string;
  rec_create_dialog_desc: string;
  rec_scan_ai: string;
  rec_scan_ai_hint: string;
  rec_dish_photo_label: string;
  rec_dish_photo_optional: string;
  rec_dish_photo_add: string;
  rec_dish_photo_add_hint: string;
  rec_dish_photo_remove: string;
  rec_field_title: string;
  rec_field_title_placeholder: string;
  rec_field_dish_type: string;
  rec_field_difficulty: string;
  rec_difficulty_easy: string;
  rec_difficulty_medium: string;
  rec_difficulty_hard: string;
  rec_field_prep: string;
  rec_field_cook: string;
  rec_field_servings_short: string;
  rec_field_story: string;
  rec_field_story_placeholder: string;
  rec_field_ingredients: string;
  rec_field_ingredients_placeholder: string;
  rec_field_steps: string;
  rec_field_steps_placeholder: string;
  rec_field_branch: string;
  rec_field_generation: string;
  rec_field_none: string;
  rec_field_none_dash: string;
  rec_field_transmitted: string;
  rec_field_no_member: string;
  rec_field_occasions: string;
  rec_field_members: string;
  rec_field_handwritten_linked: string;
  rec_field_visibility: string;
  rec_visibility_circle: string;
  rec_visibility_managers: string;
  rec_visibility_private: string;
  rec_cancel: string;
  rec_add_recipe: string;
  rec_title_required: string;
  rec_choose_image: string;
  rec_save_error: string;
  rec_save_success: string;

  // ===== StoriesPage =====
  st_back_memories: string;
  st_badge: string;
  st_title: string;
  st_subtitle: string;
  st_write: string;
  st_write_hint: string;
  st_dictate: string;
  st_dictate_hint: string;
  st_count_one: string;
  st_count_many: string;
  st_count_none: string;
  st_empty_hint: string;
  st_dictate_dialog_title: string;
  st_dictate_dialog_desc: string;
  st_recording: string;
  st_recording_hint: string;
  st_stop_transcribe: string;
  st_processing: string;
  st_processing_hint: string;
  st_dialog_check: string;
  st_dialog_write: string;
  st_dialog_desc: string;
  st_field_title: string;
  st_field_title_ph: string;
  st_field_date: string;
  st_field_visibility: string;
  st_vis_circle: string;
  st_vis_managers: string;
  st_vis_private: string;
  st_field_content: string;
  st_field_content_ph: string;
  st_field_summary: string;
  st_summarize_ai: string;
  st_field_summary_ph: string;
  st_field_media: string;
  st_add_files: string;
  st_take_photo: string;
  st_save_btn: string;
  st_no_text: string;
  st_dictated_badge: string;
  st_no_title: string;
  st_no_content: string;
  st_added_on: string;
  st_memory_of: string;
  st_media_section: string;
  st_describe_ai: string;
  st_anecdotes_title: string;
  st_anecdote_empty: string;
  st_anecdote_ph: string;
  st_anecdote_add: string;
  st_delete_story: string;
  st_confirm_delete_title: string;
  st_confirm_delete_desc: string;
  st_confirm_delete_yes: string;
  st_toast_mic_error: string;
  st_toast_no_transcription: string;
  st_toast_transcription_failed: string;
  st_toast_transcribed: string;
  st_toast_write_first: string;
  st_toast_summary_done: string;
  st_toast_summary_failed: string;
  st_toast_need_content: string;
  st_toast_saved: string;
  st_toast_save_error: string;
  st_toast_anecdote_added_err: string;
  st_toast_deleted: string;
  st_toast_delete_err: string;
  st_toast_describe_done: string;
  st_toast_describe_err: string;
  st_toast_upload_err: string;

  // ===== GalleryPage =====
  gal_back: string;
  gal_title: string;
  gal_subtitle: string;
  gal_used_of: string;
  gal_plan_free: string;
  gal_plan_other: string;
  gal_increase: string;
  gal_full_title: string;
  gal_full_desc: string;
  gal_near_desc: string;
  gal_pick_files: string;
  gal_pick_files_hint: string;
  gal_pick_folder: string;
  gal_pick_folder_hint: string;
  gal_importing: string;
  gal_empty_title: string;
  gal_empty_desc: string;
  gal_delete: string;
  gal_toast_full: string;
  gal_toast_no_media: string;
  gal_toast_full_remaining: string;
  gal_toast_added: string;
  gal_toast_skipped: string;
  gal_toast_deleted: string;
  gal_confirm_delete: string;

  // ===== TimeMessagesPage =====
  tm_badge: string;
  tm_title: string;
  tm_subtitle: string;
  tm_guardians_btn: string;
  tm_new_btn: string;
  tm_setup_guardians_title: string;
  tm_setup_guardians_desc: string;
  tm_designate_guardian: string;
  tm_tab_scheduled: string;
  tm_tab_posthumous: string;
  tm_empty_scheduled: string;
  tm_empty_posthumous: string;
  tm_for: string;
  tm_yearly: string;
  tm_send_after_death: string;
  tm_format_audio: string;
  tm_format_video: string;
  tm_format_text: string;
  tm_dialog_title: string;
  tm_field_format: string;
  tm_field_text: string;
  tm_field_text_ph: string;
  tm_field_recording: string;
  tm_start_recording: string;
  tm_stop_recording: string;
  tm_upload_file: string;
  tm_restart: string;
  tm_field_title: string;
  tm_field_title_ph: string;
  tm_field_recipient: string;
  tm_field_recipient_ph: string;
  tm_field_relationship: string;
  tm_field_relationship_ph: string;
  tm_field_email: string;
  tm_field_email_ph: string;
  tm_field_phone: string;
  tm_field_phone_ph: string;
  tm_field_occasion: string;
  tm_field_occasion_ph: string;
  tm_field_when: string;
  tm_when_scheduled: string;
  tm_when_after_death: string;
  tm_field_date: string;
  tm_repeat_yearly: string;
  tm_after_death_info: string;
  tm_save_btn: string;
  tm_guardians_dialog_title: string;
  tm_no_guardians: string;
  tm_guardian_name_ph: string;
  tm_guardian_email_ph: string;
  tm_guardian_rel_ph: string;
  tm_guardian_add: string;
  tm_toast_no_circle: string;
  tm_toast_msg_deleted: string;
  tm_toast_confirm_delete_msg: string;
  tm_toast_required_title_recipient: string;
  tm_toast_required_date: string;
  tm_toast_required_media: string;
  tm_toast_required_text: string;
  tm_toast_msg_saved: string;
  tm_toast_save_err: string;
  tm_toast_mic_err: string;
  tm_toast_guardian_added: string;
  tm_toast_guardian_required: string;
  tm_guardians_dialog_desc: string;
  tm_toast_guardian_removed: string;
}

const fr: MemoriesCopy = {
  common_loading: 'Chargement…',
  common_add: 'Ajouter',
  common_save: 'Enregistrer',
  common_cancel: 'Annuler',
  common_delete: 'Supprimer',
  common_edit: 'Modifier',
  common_options: 'Options',
  common_view_all: 'Voir tout',
  common_back: 'Retour',
  common_close: 'Fermer',
  common_yes: 'Oui',
  common_no: 'Non',
  common_required: 'Requis',
  common_optional: 'Optionnel',
  common_locale: 'fr-FR',
  must_create_circle: "Créez d'abord votre cercle familial.",
  create_circle: 'Créer un cercle',

  mem_title: 'Souvenirs',
  mem_subtitle: 'Préservez les histoires, recettes, traditions et messages qui traversent les générations.',
  mem_new: 'Nouveau souvenir',
  mem_add_title: 'Ajouter un souvenir',
  mem_caption: 'Légende',
  mem_caption_placeholder: 'Décrivez ce souvenir…',
  mem_type: 'Type',
  mem_type_text: 'Texte',
  mem_type_photo: 'Photo',
  mem_type_video: 'Vidéo',
  mem_type_audio: 'Audio',
  mem_file: 'Fichier',
  mem_file_hint: 'Formats acceptés selon le type choisi.',
  mem_visibility: 'Visibilité',
  mem_visibility_circle: 'Tout le cercle',
  mem_visibility_managers: 'Gestionnaires uniquement',
  mem_visibility_private: 'Privé',
  mem_added: 'Souvenir ajouté',
  mem_error: "Erreur lors de l'ajout du souvenir",
  mem_upload_error: "Erreur lors de l'envoi du fichier",
  mem_validation_caption: 'La légende est requise',

  cat_recipes_title: 'Recettes familiales',
  cat_recipes_desc: 'Les plats transmis de génération en génération',
  cat_stories_title: 'Histoires racontées',
  cat_stories_desc: 'Souvenirs audio et anecdotes de vie',
  cat_photos_title: 'Photos & vidéos',
  cat_photos_desc: 'Moments précieux à revoir ensemble',
  cat_letters_title: 'Lettres & messages',
  cat_letters_desc: 'Mots du cœur à conserver',
  cat_traditions_title: 'Traditions & fêtes',
  cat_traditions_desc: 'Rituels, célébrations et coutumes',
  cat_timeline_title: 'Ligne du temps familiale',
  cat_timeline_desc: 'Moments marquants de la famille',
  cat_aria: 'Catégories de souvenirs',

  stats_aria: 'Statistiques de votre cercle',
  stats_memories: 'souvenirs',
  stats_generations: 'générations',
  stats_secure_title: 'Privé et sécurisé',
  stats_secure_desc: 'Vos souvenirs restent en famille',

  rediscover_title: 'À redécouvrir',
  rediscover_empty_hint: 'Commencez par une recette, une histoire audio ou une photo de famille.',
  rediscover_create_first: 'Créer mon premier souvenir',
  collections_title: 'Collections suggérées',
  col_grandma_recipes: 'Recettes de grand-maman',
  col_births_weddings: 'Naissances et mariages',
  col_messages_for_later: 'Messages pour plus tard',
  col_family_home: 'Maison familiale',

  filters_aria: 'Filtres',
  filter_all: 'Tous',
  filter_recipes: 'Recettes',
  filter_audio: 'Audio',
  filter_video: 'Vidéo',
  filter_documents: 'Documents',
  filter_by_person: 'Par personne',
  filter_by_generation: 'Par génération',

  demo_recipe_badge: 'RECETTE',
  demo_audio_badge: 'AUDIO',
  demo_photo_badge: 'PHOTO',
  demo_cake_title: 'Le gâteau de grand-maman',
  demo_cake_author: 'Marguerite Dupont',
  demo_childhood_title: 'Souvenirs de mon enfance',
  demo_childhood_author: 'Jean Dupont',
  demo_beach_title: 'Vacances à la mer',
  demo_beach_author: 'Famille Dupont',

  tr_title: 'Traditions & fêtes',
  tr_subtitle: 'Rituels, célébrations et coutumes qui unissent votre famille.',
  tr_new: 'Nouvelle tradition',
  tr_add_title: 'Ajouter une tradition',
  tr_edit_title: 'Modifier la tradition',
  tr_name: 'Nom',
  tr_name_placeholder: 'Ex. Réveillon de Noël',
  tr_category: 'Catégorie',
  tr_recurrence: 'Récurrence',
  tr_month: 'Mois',
  tr_day: 'Jour',
  tr_origin_year: 'Depuis (année)',
  tr_origin_year_placeholder: 'Ex. 1952',
  tr_description: 'Description',
  tr_description_placeholder: 'Origine, signification…',
  tr_participants: 'Participants',
  tr_participants_placeholder: 'Ex. Toute la famille élargie',
  tr_rituals: 'Rituels & coutumes',
  tr_rituals_placeholder: 'Plats préparés, gestes, chansons…',
  tr_rituals_section: 'Rituels',
  tr_since: 'depuis',
  tr_date_tbd: 'Date à définir',
  tr_empty_title: 'Aucune tradition enregistrée',
  tr_empty_desc: 'Documentez les fêtes, rituels et coutumes qui font la richesse de votre famille pour les transmettre aux prochaines générations.',
  tr_add_first: 'Ajouter la première tradition',
  tr_example_title: 'Voici un exemple à suivre',
  tr_example_desc: 'Inspirez-vous de ce modèle pour documenter Noël, Pâques, anniversaires, recettes de famille et coutumes héritées.',
  tr_example_alt: 'Exemple de page Traditions et fêtes',
  tr_confirm_delete: 'Supprimer cette tradition ?',
  tr_deleted: 'Tradition supprimée',
  tr_saved_added: 'Tradition ajoutée',
  tr_saved_updated: 'Tradition mise à jour',
  tr_save_error: "Erreur lors de l'enregistrement",
  tr_delete_error: 'Erreur lors de la suppression',
  tr_validation_name: 'Le nom doit faire au moins 2 caractères',
  tr_cat_celebration: 'Célébration',
  tr_cat_religious: 'Religieuse',
  tr_cat_seasonal: 'Saisonnière',
  tr_cat_culinary: 'Culinaire',
  tr_cat_cultural: 'Culturelle',
  tr_cat_other: 'Autre',
  tr_rec_annual: 'Annuelle',
  tr_rec_monthly: 'Mensuelle',
  tr_rec_weekly: 'Hebdomadaire',
  tr_rec_occasional: 'Occasionnelle',
  months: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],

  tl_title: 'Ligne du temps familiale',
  tl_subtitle: 'Les moments marquants, classés chronologiquement.',
  tl_new: 'Nouvel événement',
  tl_add_title: 'Ajouter un événement',
  tl_edit_title: "Modifier l'événement",
  tl_event_title_label: 'Titre',
  tl_event_title_placeholder: 'Ex. Naissance de Marie',
  tl_date: 'Date',
  tl_category: 'Catégorie',
  tl_description: 'Description',
  tl_description_placeholder: 'Détails, contexte, anecdotes…',
  tl_count_events_one: 'événement',
  tl_count_events_many: 'événements',
  tl_count_dated_one: 'souvenir daté',
  tl_count_dated_many: 'souvenirs datés',
  tl_empty_title: 'Votre ligne du temps est vide',
  tl_empty_desc: 'Ajoutez les naissances, mariages, voyages et grands moments de votre famille. Les souvenirs ayant une date apparaîtront aussi automatiquement ici.',
  tl_add_first: 'Ajouter le premier événement',
  tl_example_title: 'Voici à quoi ressemblera votre ligne du temps',
  tl_example_desc: 'Un exemple pour vous inspirer. Ajoutez vos propres moments pour la voir prendre vie.',
  tl_example_alt: 'Exemple de ligne du temps familiale',
  tl_memory_badge: 'Souvenir',
  tl_view_memory: 'Voir le souvenir →',
  tl_confirm_delete: 'Supprimer cet événement ?',
  tl_deleted: 'Événement supprimé',
  tl_saved_added: 'Événement ajouté',
  tl_saved_updated: 'Événement mis à jour',
  tl_save_error: "Erreur lors de l'enregistrement",
  tl_delete_error: 'Erreur lors de la suppression',
  tl_validation_title: 'Le titre doit faire au moins 2 caractères',
  tl_validation_date: 'La date est requise',
  tl_cat_birth: 'Naissance',
  tl_cat_wedding: 'Mariage',
  tl_cat_graduation: 'Diplôme',
  tl_cat_home: 'Nouvelle maison',
  tl_cat_travel: 'Voyage',
  tl_cat_milestone: 'Moment marquant',

  rec_title: 'Nos recettes de famille',
  rec_subtitle: 'Gardons ensemble les recettes qui nous rassemblent.',
  rec_action_photo: 'Prendre en photo',
  rec_action_photo_hint: "L'IA s'occupe du reste.",
  rec_action_write: 'Écrire une recette',
  rec_action_write_hint: 'À votre rythme.',
  rec_action_dictate: 'Dicter la recette',
  rec_action_dictate_hint: "Parlez, l'IA structure tout.",
  rec_search_placeholder: 'Chercher une recette ou un ingrédient…',
  rec_section_our: 'Nos recettes',
  rec_no_match: 'Aucune recette ne correspond à votre recherche.',
  rec_organize_title: 'Ranger les recettes',
  rec_organize_hint: 'Touchez une catégorie pour voir les recettes regroupées.',
  rec_filter_all: 'Tous',
  rec_filter_main: 'Plats mijotés',
  rec_filter_dessert: 'Desserts',
  rec_filter_favorites: 'Favoris',
  rec_class_family: 'Par famille',
  rec_class_family_hint: 'Branches & lignées',
  rec_class_occasion: 'Par occasion',
  rec_class_occasion_hint: 'Noël, mariages, fêtes',
  rec_class_generation: 'Par génération',
  rec_class_generation_hint: 'Époques & lignées',
  rec_class_dish: 'Par type de plat',
  rec_class_dish_hint: 'Entrées, mains, desserts',
  rec_class_scanned: 'Carnets numérisés',
  rec_class_scanned_hint: 'Recettes manuscrites',
  rec_class_favorites: 'Favoris',
  rec_class_favorites_hint: 'Vos préférées',
  rec_back_all: 'Toutes les recettes',
  rec_empty_title: 'Commencez votre livre de recettes familial',
  rec_empty_desc: 'Ajoutez une première recette, numérisez un carnet manuscrit ou invitez un proche à partager un souvenir culinaire.',
  rec_empty_add: 'Ajouter une recette',
  rec_empty_scan: 'Numériser une recette',
  rec_empty_invite: 'Inviter un proche',
  rec_heritage_title: "L'histoire derrière la recette",
  rec_heritage_desc: 'Chaque recette a une histoire. Préservons-la ensemble pour les générations à venir.',
  rec_heritage_photos: 'Photos de famille',
  rec_heritage_audio: 'Souvenirs audio',
  rec_heritage_notes: 'Notes manuscrites',
  rec_heritage_anec: 'Anecdotes',
  rec_heritage_cta: 'Ajouter un souvenir',
  rec_featured_badge: "Recette à l'honneur",
  rec_featured_transmitted: 'Transmise par',
  rec_featured_generations: 'générations',
  rec_featured_first: 'Ajouter votre première recette',
  rec_featured_view: 'Voir la recette',
  rec_card_no_photo: 'Aucune photo',
  rec_demo_badge: 'DÉMO',
  rec_badge_handwritten: 'Manuscrit',
  rec_badge_audio: 'Audio',
  rec_badge_memory: 'Souvenir',
  rec_badge_note: 'Note',
  rec_change_photo: 'Changer la photo',
  rec_add_photo: 'Ajouter une photo',
  rec_take_photo: 'Prendre une photo',
  rec_pick_from_device: "Choisir depuis l'appareil",
  rec_no_main_photo: 'Aucune photo principale',
  rec_prep: 'Préparation',
  rec_cook: 'Cuisson',
  rec_servings: 'Portions',
  rec_story_title: "L'histoire de cette recette",
  rec_ingredients_title: 'Ingrédients',
  rec_steps_title: 'Étapes',
  rec_transmitted_by: 'Transmise par',
  rec_original_author: 'Auteur original',
  rec_branch: 'Branche familiale',
  rec_generation: 'Génération',
  rec_occasions: 'Occasions',
  rec_delete_btn: '🗑️ Supprimer la recette',
  rec_add_memory_btn: 'Ajouter un souvenir',
  rec_close: 'Fermer',
  rec_confirm_delete_title: 'Supprimer cette recette ?',
  rec_confirm_delete_desc: "Cette action est définitive. La recette sera retirée du livre familial. Les souvenirs liés ne seront pas supprimés.",
  rec_confirm_delete_yes: 'Oui, supprimer',
  rec_no_data_view: 'Aucune donnée à afficher. Commencez par ajouter une recette ou créer des branches familiales.',
  rec_no_recipe_in_cat: 'Aucune recette dans cette catégorie.',
  rec_without_branch: 'Sans branche',
  rec_without_generation: 'Sans génération',
  rec_without_occasion: 'Sans occasion',
  rec_handwritten_group: 'Recettes manuscrites numérisées',
  rec_favorites_group: 'Vos recettes favorites',
  rec_dish_appetizer: 'Entrée',
  rec_dish_soup: 'Soupe',
  rec_dish_main: 'Plat principal',
  rec_dish_side: 'Accompagnement',
  rec_dish_dessert: 'Dessert',
  rec_dish_preserve: 'Conserve',
  rec_dish_drink: 'Boisson',
  rec_dish_sauce: 'Sauce',
  rec_dish_bread: 'Pain',
  rec_dish_other: 'Autre',
  rec_toast_extracted: 'Recette détectée ! Vérifiez et enregistrez.',
  rec_toast_photo_updated: 'Photo principale mise à jour',
  rec_toast_photo_error: 'Impossible de changer la photo',
  rec_toast_deleted: 'Recette supprimée',
  rec_toast_delete_error: 'Impossible de supprimer la recette',
  rec_demo_recipe_title: 'Tourtière de Grand-maman Louise',
  rec_demo_recipe_branch: 'Branche Tremblay',
  rec_demo_recipe_occasion: 'Noël',
  rec_demo_recipe_transmitted: 'Grand-maman Louise',

  st_back_memories: 'Retour aux souvenirs',
  st_badge: 'Histoires racontées',
  st_title: 'Vos histoires de famille',
  st_subtitle: 'Préservez vos récits, vos tranches de vie et vos anecdotes. Écrivez-les, dictez-les, ajoutez des photos ou des vidéos.',
  st_write: 'Écrire une histoire',
  st_write_hint: 'Rédigez vous-même votre récit, à votre rythme. Ajoutez photos et vidéos.',
  st_dictate: 'Dicter une histoire',
  st_dictate_hint: "Parlez naturellement. L'IA transcrit, structure et résume pour vous.",
  st_count_one: 'histoire',
  st_count_many: 'histoires',
  st_count_none: 'Aucune histoire pour le moment',
  st_empty_hint: 'Commencez par écrire ou dicter votre première histoire.',
  st_dictate_dialog_title: 'Dicter votre histoire',
  st_dictate_dialog_desc: "Racontez votre souvenir naturellement, comme à vos proches. L'IA transcrira et proposera un résumé.",
  st_recording: 'Enregistrement en cours…',
  st_recording_hint: 'Prenez votre temps. Décrivez la scène, les personnes, vos émotions.',
  st_stop_transcribe: 'Arrêter et transcrire',
  st_processing: "L'IA transcrit votre récit…",
  st_processing_hint: 'Génération du titre et du résumé',
  st_dialog_check: 'Vérifier la dictée',
  st_dialog_write: 'Écrire une histoire',
  st_dialog_desc: 'Donnez un titre à votre récit, ajoutez la date du souvenir et joignez des photos ou des vidéos si vous le souhaitez.',
  st_field_title: 'Titre',
  st_field_title_ph: 'Ex. Le mariage de tante Yvonne',
  st_field_date: 'Date du souvenir (facultatif)',
  st_field_visibility: 'Visibilité',
  st_vis_circle: 'Toute la famille',
  st_vis_managers: 'Gestionnaires uniquement',
  st_vis_private: 'Privé (moi seulement)',
  st_field_content: 'Votre récit',
  st_field_content_ph: 'Racontez votre souvenir, une tranche de vie, une anecdote…',
  st_field_summary: 'Résumé (facultatif)',
  st_summarize_ai: "Résumer avec l'IA",
  st_field_summary_ph: "Un court résumé pour retrouver l'histoire facilement.",
  st_field_media: 'Photos, vidéos ou audio (facultatif)',
  st_add_files: 'Ajouter des fichiers',
  st_take_photo: 'Prendre une photo',
  st_save_btn: "Enregistrer l'histoire",
  st_no_text: 'Aucun texte.',
  st_dictated_badge: 'Dictée',
  st_no_title: 'Sans titre',
  st_no_content: 'Pas encore de contenu.',
  st_added_on: 'Ajoutée le',
  st_memory_of: 'Souvenir du',
  st_media_section: 'Photos, vidéos & audio',
  st_describe_ai: "Décrire avec l'IA",
  st_anecdotes_title: 'Anecdotes',
  st_anecdote_empty: "Pas encore d'anecdote. Ajoutez un détail savoureux, une variante, un souvenir lié.",
  st_anecdote_ph: 'Ajouter une anecdote à cette histoire…',
  st_anecdote_add: 'Ajouter cette anecdote',
  st_delete_story: 'Supprimer cette histoire',
  st_confirm_delete_title: 'Supprimer cette histoire ?',
  st_confirm_delete_desc: "Cette action est définitive. L'histoire, ses anecdotes et ses médias seront supprimés.",
  st_confirm_delete_yes: 'Supprimer définitivement',
  st_toast_mic_error: "Impossible d'accéder au microphone. Autorisez l'accès et réessayez.",
  st_toast_no_transcription: 'Aucune transcription',
  st_toast_transcription_failed: 'Échec de la transcription',
  st_toast_transcribed: 'Transcription réussie. Vérifiez et enregistrez.',
  st_toast_write_first: "Écrivez d'abord un peu de texte.",
  st_toast_summary_done: 'Résumé généré',
  st_toast_summary_failed: 'Échec du résumé',
  st_toast_need_content: 'Ajoutez au moins un titre ou un récit.',
  st_toast_saved: 'Histoire enregistrée',
  st_toast_save_error: "Échec de l'enregistrement",
  st_toast_anecdote_added_err: "Échec de l'ajout",
  st_toast_deleted: 'Histoire supprimée',
  st_toast_delete_err: 'Échec de la suppression',
  st_toast_describe_done: 'Description générée',
  st_toast_describe_err: 'Échec de la description',
  st_toast_upload_err: "Échec de l'envoi",

  gal_back: 'Retour',
  gal_title: 'Album de la famille',
  gal_subtitle: 'Toutes vos photos et vidéos, classées automatiquement par date. Importez depuis votre téléphone, votre clé USB ou votre ordinateur.',
  gal_used_of: 'utilisés',
  gal_plan_free: 'Forfait gratuit — 5 Go inclus',
  gal_plan_other: 'Forfait',
  gal_increase: 'Augmenter mon stockage',
  gal_full_title: 'Stockage plein',
  gal_full_desc: 'Vous avez atteint la limite de 5 Go. Pour continuer à ajouter des photos et vidéos, choisissez un forfait.',
  gal_near_desc: 'Vous approchez de votre limite. Pensez à passer à un forfait plus grand pour ne pas être bloqué.',
  gal_pick_files: 'Choisir des fichiers',
  gal_pick_files_hint: 'Photos et vidéos depuis votre téléphone ou ordinateur',
  gal_pick_folder: 'Choisir un dossier complet',
  gal_pick_folder_hint: 'Tout un dossier (clé USB, ancien ordinateur)',
  gal_importing: 'Importation',
  gal_empty_title: 'Votre album est vide',
  gal_empty_desc: 'Commencez à transférer les photos et vidéos de votre famille. Elles seront automatiquement classées par date.',
  gal_delete: 'Supprimer',
  gal_toast_full: 'Stockage plein — passez à un forfait pour continuer',
  gal_toast_no_media: 'Aucune photo ou vidéo trouvée',
  gal_toast_full_remaining: 'Stockage plein. Reste à importer',
  gal_toast_added: 'fichier(s) ajouté(s) à votre album',
  gal_toast_skipped: 'fichier(s) non importé(s)',
  gal_toast_deleted: 'Souvenir supprimé',
  gal_confirm_delete: 'Supprimer définitivement ce souvenir ?',

  tm_badge: 'Messages dans le temps',
  tm_title: 'Vos mots, livrés au bon moment',
  tm_subtitle: "Enregistrez aujourd'hui des messages vocaux, vidéo ou écrits qui seront envoyés à vos proches à une date précise (anniversaire, mariage, naissance…) ou après votre décès.",
  tm_guardians_btn: 'Gardiens',
  tm_new_btn: 'Nouveau message',
  tm_setup_guardians_title: 'Configurez vos gardiens de confiance',
  tm_setup_guardians_desc: "Pour les messages posthumes, désignez 1 ou 2 personnes qui pourront confirmer votre décès et déclencher l'envoi. Une vérification d'inactivité (6 mois sans connexion) sert de filet de sécurité.",
  tm_designate_guardian: 'Désigner un gardien →',
  tm_tab_scheduled: 'À date précise',
  tm_tab_posthumous: 'Après mon décès',
  tm_empty_scheduled: "Aucun message programmé pour l'instant.",
  tm_empty_posthumous: 'Aucun message posthume enregistré.',
  tm_for: 'Pour',
  tm_yearly: 'Chaque année',
  tm_send_after_death: 'À envoyer après mon décès',
  tm_format_audio: 'Audio',
  tm_format_video: 'Vidéo',
  tm_format_text: 'Texte',
  tm_dialog_title: 'Nouveau message dans le temps',
  tm_field_format: 'Format',
  tm_field_text: 'Votre message',
  tm_field_text_ph: 'Mon cher petit-fils, le jour de tes 18 ans…',
  tm_field_recording: 'Enregistrement',
  tm_start_recording: "Commencer l'enregistrement",
  tm_stop_recording: 'Arrêter',
  tm_upload_file: 'Téléverser un fichier',
  tm_restart: 'Recommencer',
  tm_field_title: 'Titre du message',
  tm_field_title_ph: 'Ex: Bonne fête pour tes 18 ans',
  tm_field_recipient: 'Destinataire',
  tm_field_recipient_ph: 'Ex: Léa Dupont',
  tm_field_relationship: 'Lien',
  tm_field_relationship_ph: 'Ex: Petite-fille',
  tm_field_email: 'Courriel du destinataire',
  tm_field_email_ph: 'ex: lea.dupont@email.com',
  tm_field_phone: 'Téléphone du destinataire',
  tm_field_phone_ph: 'ex: +1 514 555 0123',
  tm_field_occasion: 'Occasion (facultatif)',
  tm_field_occasion_ph: 'Ex: 18 ans, mariage, naissance…',
  tm_field_when: "Quand l'envoyer ?",
  tm_when_scheduled: 'À une date précise',
  tm_when_after_death: 'Après mon décès',
  tm_field_date: "Date d'envoi",
  tm_repeat_yearly: 'Répéter chaque année',
  tm_after_death_info: "Ce message sera libéré quand vos gardiens de confiance confirmeront votre décès, ou après une longue inactivité (6 mois par défaut).",
  tm_save_btn: 'Enregistrer le message',
  tm_guardians_dialog_title: 'Gardiens de confiance',
  tm_no_guardians: 'Aucun gardien désigné',
  tm_guardian_name_ph: 'Nom complet',
  tm_guardian_email_ph: 'Courriel',
  tm_guardian_rel_ph: 'Lien (ex: enfant aîné)',
  tm_guardian_add: 'Ajouter ce gardien',
  tm_toast_no_circle: "Vous devez d'abord créer ou rejoindre un cercle familial.",
  tm_toast_msg_deleted: 'Message supprimé',
  tm_toast_confirm_delete_msg: 'Supprimer ce message ? Cette action est définitive.',
  tm_toast_required_title_recipient: 'Titre et destinataire sont obligatoires',
  tm_toast_required_date: "Choisissez une date d'envoi",
  tm_toast_required_media: 'Enregistrez ou téléchargez un fichier',
  tm_toast_required_text: 'Écrivez votre message',
  tm_toast_msg_saved: 'Message enregistré',
  tm_toast_save_err: "Erreur lors de l'enregistrement",
  tm_toast_mic_err: "Impossible d'accéder au micro/caméra",
  tm_toast_guardian_added: 'Gardien ajouté',
  tm_toast_guardian_required: 'Nom et courriel obligatoires',
  tm_guardians_dialog_desc: 'Ces personnes pourront confirmer votre décès et libérer vos messages posthumes. Choisissez 1 à 2 personnes en qui vous avez pleinement confiance.',
  tm_toast_guardian_removed: 'Gardien retiré',
};

const en: MemoriesCopy = {
  common_loading: 'Loading…',
  common_add: 'Add',
  common_save: 'Save',
  common_cancel: 'Cancel',
  common_delete: 'Delete',
  common_edit: 'Edit',
  common_options: 'Options',
  common_view_all: 'View all',
  common_back: 'Back',
  common_close: 'Close',
  common_yes: 'Yes',
  common_no: 'No',
  common_required: 'Required',
  common_optional: 'Optional',
  common_locale: 'en-US',
  must_create_circle: 'Please create your family circle first.',
  create_circle: 'Create a circle',

  mem_title: 'Memories',
  mem_subtitle: 'Preserve the stories, recipes, traditions, and messages that span generations.',
  mem_new: 'New memory',
  mem_add_title: 'Add a memory',
  mem_caption: 'Caption',
  mem_caption_placeholder: 'Describe this memory…',
  mem_type: 'Type',
  mem_type_text: 'Text',
  mem_type_photo: 'Photo',
  mem_type_video: 'Video',
  mem_type_audio: 'Audio',
  mem_file: 'File',
  mem_file_hint: 'Accepted formats depend on the chosen type.',
  mem_visibility: 'Visibility',
  mem_visibility_circle: 'Whole circle',
  mem_visibility_managers: 'Managers only',
  mem_visibility_private: 'Private',
  mem_added: 'Memory added',
  mem_error: 'Error adding the memory',
  mem_upload_error: 'Error uploading the file',
  mem_validation_caption: 'Caption is required',

  cat_recipes_title: 'Family recipes',
  cat_recipes_desc: 'Dishes passed down through generations',
  cat_stories_title: 'Spoken stories',
  cat_stories_desc: 'Audio memories and life anecdotes',
  cat_photos_title: 'Photos & videos',
  cat_photos_desc: 'Precious moments to revisit together',
  cat_letters_title: 'Letters & messages',
  cat_letters_desc: 'Heartfelt words to keep',
  cat_traditions_title: 'Traditions & celebrations',
  cat_traditions_desc: 'Rituals, celebrations, and customs',
  cat_timeline_title: 'Family timeline',
  cat_timeline_desc: 'The family\u2019s defining moments',
  cat_aria: 'Memory categories',

  stats_aria: 'Your circle statistics',
  stats_memories: 'memories',
  stats_generations: 'generations',
  stats_secure_title: 'Private and secure',
  stats_secure_desc: 'Your memories stay within the family',

  rediscover_title: 'To rediscover',
  rediscover_empty_hint: 'Start with a recipe, an audio story, or a family photo.',
  rediscover_create_first: 'Create my first memory',
  collections_title: 'Suggested collections',
  col_grandma_recipes: 'Grandma\u2019s recipes',
  col_births_weddings: 'Births and weddings',
  col_messages_for_later: 'Messages for later',
  col_family_home: 'The family home',

  filters_aria: 'Filters',
  filter_all: 'All',
  filter_recipes: 'Recipes',
  filter_audio: 'Audio',
  filter_video: 'Video',
  filter_documents: 'Documents',
  filter_by_person: 'By person',
  filter_by_generation: 'By generation',

  demo_recipe_badge: 'RECIPE',
  demo_audio_badge: 'AUDIO',
  demo_photo_badge: 'PHOTO',
  demo_cake_title: 'Grandma\u2019s cake',
  demo_cake_author: 'Marguerite Dupont',
  demo_childhood_title: 'Memories of my childhood',
  demo_childhood_author: 'Jean Dupont',
  demo_beach_title: 'Holidays by the sea',
  demo_beach_author: 'The Dupont family',

  tr_title: 'Traditions & celebrations',
  tr_subtitle: 'Rituals, celebrations, and customs that bring your family together.',
  tr_new: 'New tradition',
  tr_add_title: 'Add a tradition',
  tr_edit_title: 'Edit the tradition',
  tr_name: 'Name',
  tr_name_placeholder: 'e.g. Christmas Eve',
  tr_category: 'Category',
  tr_recurrence: 'Recurrence',
  tr_month: 'Month',
  tr_day: 'Day',
  tr_origin_year: 'Since (year)',
  tr_origin_year_placeholder: 'e.g. 1952',
  tr_description: 'Description',
  tr_description_placeholder: 'Origin, meaning…',
  tr_participants: 'Participants',
  tr_participants_placeholder: 'e.g. The whole extended family',
  tr_rituals: 'Rituals & customs',
  tr_rituals_placeholder: 'Dishes prepared, gestures, songs…',
  tr_rituals_section: 'Rituals',
  tr_since: 'since',
  tr_date_tbd: 'Date to be set',
  tr_empty_title: 'No traditions recorded yet',
  tr_empty_desc: 'Document the celebrations, rituals, and customs that make your family unique, so you can pass them on to future generations.',
  tr_add_first: 'Add the first tradition',
  tr_example_title: 'Here is an example to follow',
  tr_example_desc: 'Use this as inspiration to document Christmas, Easter, birthdays, family recipes, and inherited customs.',
  tr_example_alt: 'Example Traditions & celebrations page',
  tr_confirm_delete: 'Delete this tradition?',
  tr_deleted: 'Tradition deleted',
  tr_saved_added: 'Tradition added',
  tr_saved_updated: 'Tradition updated',
  tr_save_error: 'Error while saving',
  tr_delete_error: 'Error while deleting',
  tr_validation_name: 'Name must be at least 2 characters',
  tr_cat_celebration: 'Celebration',
  tr_cat_religious: 'Religious',
  tr_cat_seasonal: 'Seasonal',
  tr_cat_culinary: 'Culinary',
  tr_cat_cultural: 'Cultural',
  tr_cat_other: 'Other',
  tr_rec_annual: 'Annual',
  tr_rec_monthly: 'Monthly',
  tr_rec_weekly: 'Weekly',
  tr_rec_occasional: 'Occasional',
  months: ['January','February','March','April','May','June','July','August','September','October','November','December'],

  tl_title: 'Family timeline',
  tl_subtitle: 'The defining moments, in chronological order.',
  tl_new: 'New event',
  tl_add_title: 'Add an event',
  tl_edit_title: 'Edit the event',
  tl_event_title_label: 'Title',
  tl_event_title_placeholder: 'e.g. Birth of Marie',
  tl_date: 'Date',
  tl_category: 'Category',
  tl_description: 'Description',
  tl_description_placeholder: 'Details, context, anecdotes…',
  tl_count_events_one: 'event',
  tl_count_events_many: 'events',
  tl_count_dated_one: 'dated memory',
  tl_count_dated_many: 'dated memories',
  tl_empty_title: 'Your timeline is empty',
  tl_empty_desc: 'Add the births, weddings, trips, and major moments of your family. Memories with a date will also appear here automatically.',
  tl_add_first: 'Add the first event',
  tl_example_title: 'Here is what your timeline will look like',
  tl_example_desc: 'An example for inspiration. Add your own moments to bring it to life.',
  tl_example_alt: 'Example family timeline',
  tl_memory_badge: 'Memory',
  tl_view_memory: 'View memory →',
  tl_confirm_delete: 'Delete this event?',
  tl_deleted: 'Event deleted',
  tl_saved_added: 'Event added',
  tl_saved_updated: 'Event updated',
  tl_save_error: 'Error while saving',
  tl_delete_error: 'Error while deleting',
  tl_validation_title: 'Title must be at least 2 characters',
  tl_validation_date: 'Date is required',
  tl_cat_birth: 'Birth',
  tl_cat_wedding: 'Wedding',
  tl_cat_graduation: 'Graduation',
  tl_cat_home: 'New home',
  tl_cat_travel: 'Travel',
  tl_cat_milestone: 'Milestone',

  rec_title: 'Our family recipes',
  rec_subtitle: 'Together, let\u2019s keep the recipes that bring us together.',
  rec_action_photo: 'Take a photo',
  rec_action_photo_hint: 'AI takes care of the rest.',
  rec_action_write: 'Write a recipe',
  rec_action_write_hint: 'At your own pace.',
  rec_action_dictate: 'Dictate the recipe',
  rec_action_dictate_hint: 'Speak, AI structures everything.',
  rec_search_placeholder: 'Search a recipe or an ingredient…',
  rec_section_our: 'Our recipes',
  rec_no_match: 'No recipe matches your search.',
  rec_organize_title: 'Organize the recipes',
  rec_organize_hint: 'Tap a category to see grouped recipes.',
  rec_filter_all: 'All',
  rec_filter_main: 'Main dishes',
  rec_filter_dessert: 'Desserts',
  rec_filter_favorites: 'Favorites',
  rec_class_family: 'By family',
  rec_class_family_hint: 'Branches & lineages',
  rec_class_occasion: 'By occasion',
  rec_class_occasion_hint: 'Christmas, weddings, holidays',
  rec_class_generation: 'By generation',
  rec_class_generation_hint: 'Eras & lineages',
  rec_class_dish: 'By dish type',
  rec_class_dish_hint: 'Starters, mains, desserts',
  rec_class_scanned: 'Scanned notebooks',
  rec_class_scanned_hint: 'Handwritten recipes',
  rec_class_favorites: 'Favorites',
  rec_class_favorites_hint: 'Your favorites',
  rec_back_all: 'All recipes',
  rec_empty_title: 'Start your family recipe book',
  rec_empty_desc: 'Add a first recipe, scan a handwritten notebook, or invite a loved one to share a culinary memory.',
  rec_empty_add: 'Add a recipe',
  rec_empty_scan: 'Scan a recipe',
  rec_empty_invite: 'Invite a loved one',
  rec_heritage_title: 'The story behind the recipe',
  rec_heritage_desc: 'Every recipe has a story. Let\u2019s preserve it together for the generations to come.',
  rec_heritage_photos: 'Family photos',
  rec_heritage_audio: 'Audio memories',
  rec_heritage_notes: 'Handwritten notes',
  rec_heritage_anec: 'Anecdotes',
  rec_heritage_cta: 'Add a memory',
  rec_featured_badge: 'Featured recipe',
  rec_featured_transmitted: 'Passed down by',
  rec_featured_generations: 'generations',
  rec_featured_first: 'Add your first recipe',
  rec_featured_view: 'View the recipe',
  rec_card_no_photo: 'No photo',
  rec_demo_badge: 'DEMO',
  rec_badge_handwritten: 'Handwritten',
  rec_badge_audio: 'Audio',
  rec_badge_memory: 'Memory',
  rec_badge_note: 'Note',
  rec_change_photo: 'Change photo',
  rec_add_photo: 'Add a photo',
  rec_take_photo: 'Take a photo',
  rec_pick_from_device: 'Choose from device',
  rec_no_main_photo: 'No main photo',
  rec_prep: 'Prep',
  rec_cook: 'Cook',
  rec_servings: 'Servings',
  rec_story_title: 'The story of this recipe',
  rec_ingredients_title: 'Ingredients',
  rec_steps_title: 'Steps',
  rec_transmitted_by: 'Passed down by',
  rec_original_author: 'Original author',
  rec_branch: 'Family branch',
  rec_generation: 'Generation',
  rec_occasions: 'Occasions',
  rec_delete_btn: '🗑️ Delete the recipe',
  rec_add_memory_btn: 'Add a memory',
  rec_close: 'Close',
  rec_confirm_delete_title: 'Delete this recipe?',
  rec_confirm_delete_desc: 'This action is final. The recipe will be removed from the family book. Linked memories will not be deleted.',
  rec_confirm_delete_yes: 'Yes, delete',
  rec_no_data_view: 'No data to display. Start by adding a recipe or creating family branches.',
  rec_no_recipe_in_cat: 'No recipe in this category.',
  rec_without_branch: 'Without branch',
  rec_without_generation: 'Without generation',
  rec_without_occasion: 'Without occasion',
  rec_handwritten_group: 'Scanned handwritten recipes',
  rec_favorites_group: 'Your favorite recipes',
  rec_dish_appetizer: 'Appetizer',
  rec_dish_soup: 'Soup',
  rec_dish_main: 'Main',
  rec_dish_side: 'Side',
  rec_dish_dessert: 'Dessert',
  rec_dish_preserve: 'Preserve',
  rec_dish_drink: 'Drink',
  rec_dish_sauce: 'Sauce',
  rec_dish_bread: 'Bread',
  rec_dish_other: 'Other',
  rec_toast_extracted: 'Recipe detected! Review and save.',
  rec_toast_photo_updated: 'Main photo updated',
  rec_toast_photo_error: 'Could not change the photo',
  rec_toast_deleted: 'Recipe deleted',
  rec_toast_delete_error: 'Could not delete the recipe',
  rec_demo_recipe_title: 'Grandma Louise\u2019s tourtière',
  rec_demo_recipe_branch: 'Tremblay branch',
  rec_demo_recipe_occasion: 'Christmas',
  rec_demo_recipe_transmitted: 'Grandma Louise',

  st_back_memories: 'Back to memories',
  st_badge: 'Spoken stories',
  st_title: 'Your family stories',
  st_subtitle: 'Preserve your tales, life moments, and anecdotes. Write them, dictate them, add photos or videos.',
  st_write: 'Write a story',
  st_write_hint: 'Write your own story, at your own pace. Add photos and videos.',
  st_dictate: 'Dictate a story',
  st_dictate_hint: 'Speak naturally. AI transcribes, structures, and summarizes for you.',
  st_count_one: 'story',
  st_count_many: 'stories',
  st_count_none: 'No stories yet',
  st_empty_hint: 'Start by writing or dictating your first story.',
  st_dictate_dialog_title: 'Dictate your story',
  st_dictate_dialog_desc: 'Tell your memory naturally, as you would to a loved one. AI will transcribe and offer a summary.',
  st_recording: 'Recording in progress…',
  st_recording_hint: 'Take your time. Describe the scene, the people, your emotions.',
  st_stop_transcribe: 'Stop and transcribe',
  st_processing: 'AI is transcribing your story…',
  st_processing_hint: 'Generating the title and summary',
  st_dialog_check: 'Review the dictation',
  st_dialog_write: 'Write a story',
  st_dialog_desc: 'Give your story a title, add the date of the memory, and attach photos or videos if you wish.',
  st_field_title: 'Title',
  st_field_title_ph: 'e.g. Aunt Yvonne\u2019s wedding',
  st_field_date: 'Date of the memory (optional)',
  st_field_visibility: 'Visibility',
  st_vis_circle: 'The whole family',
  st_vis_managers: 'Managers only',
  st_vis_private: 'Private (only me)',
  st_field_content: 'Your story',
  st_field_content_ph: 'Tell your memory, a slice of life, an anecdote…',
  st_field_summary: 'Summary (optional)',
  st_summarize_ai: 'Summarize with AI',
  st_field_summary_ph: 'A short summary to find the story easily.',
  st_field_media: 'Photos, videos or audio (optional)',
  st_add_files: 'Add files',
  st_take_photo: 'Take a photo',
  st_save_btn: 'Save the story',
  st_no_text: 'No text.',
  st_dictated_badge: 'Dictation',
  st_no_title: 'Untitled',
  st_no_content: 'No content yet.',
  st_added_on: 'Added on',
  st_memory_of: 'Memory of',
  st_media_section: 'Photos, videos & audio',
  st_describe_ai: 'Describe with AI',
  st_anecdotes_title: 'Anecdotes',
  st_anecdote_empty: 'No anecdote yet. Add a tasty detail, a variant, a related memory.',
  st_anecdote_ph: 'Add an anecdote to this story…',
  st_anecdote_add: 'Add this anecdote',
  st_delete_story: 'Delete this story',
  st_confirm_delete_title: 'Delete this story?',
  st_confirm_delete_desc: 'This action is final. The story, its anecdotes and media will be deleted.',
  st_confirm_delete_yes: 'Delete permanently',
  st_toast_mic_error: 'Could not access the microphone. Please grant access and try again.',
  st_toast_no_transcription: 'No transcription',
  st_toast_transcription_failed: 'Transcription failed',
  st_toast_transcribed: 'Transcription successful. Review and save.',
  st_toast_write_first: 'Write some text first.',
  st_toast_summary_done: 'Summary generated',
  st_toast_summary_failed: 'Summary failed',
  st_toast_need_content: 'Add at least a title or a story.',
  st_toast_saved: 'Story saved',
  st_toast_save_error: 'Save failed',
  st_toast_anecdote_added_err: 'Failed to add',
  st_toast_deleted: 'Story deleted',
  st_toast_delete_err: 'Delete failed',
  st_toast_describe_done: 'Description generated',
  st_toast_describe_err: 'Description failed',
  st_toast_upload_err: 'Upload failed',

  gal_back: 'Back',
  gal_title: 'Family album',
  gal_subtitle: 'All your photos and videos, automatically sorted by date. Import from your phone, USB key, or computer.',
  gal_used_of: 'used',
  gal_plan_free: 'Free plan — 5 GB included',
  gal_plan_other: 'Plan',
  gal_increase: 'Upgrade my storage',
  gal_full_title: 'Storage full',
  gal_full_desc: 'You\u2019ve reached the 5 GB limit. To keep adding photos and videos, choose a plan.',
  gal_near_desc: 'You\u2019re approaching your limit. Consider upgrading so you don\u2019t get blocked.',
  gal_pick_files: 'Choose files',
  gal_pick_files_hint: 'Photos and videos from your phone or computer',
  gal_pick_folder: 'Choose a whole folder',
  gal_pick_folder_hint: 'A full folder (USB key, old computer)',
  gal_importing: 'Importing',
  gal_empty_title: 'Your album is empty',
  gal_empty_desc: 'Start uploading your family\u2019s photos and videos. They\u2019ll be sorted automatically by date.',
  gal_delete: 'Delete',
  gal_toast_full: 'Storage full — upgrade your plan to continue',
  gal_toast_no_media: 'No photos or videos found',
  gal_toast_full_remaining: 'Storage full. Remaining to import',
  gal_toast_added: 'file(s) added to your album',
  gal_toast_skipped: 'file(s) not imported',
  gal_toast_deleted: 'Memory deleted',
  gal_confirm_delete: 'Permanently delete this memory?',

  tm_badge: 'Messages in time',
  tm_title: 'Your words, delivered at the right moment',
  tm_subtitle: 'Today, record voice, video, or written messages that will be sent to loved ones on a specific date (birthday, wedding, birth…) or after your passing.',
  tm_guardians_btn: 'Guardians',
  tm_new_btn: 'New message',
  tm_setup_guardians_title: 'Set up your trusted guardians',
  tm_setup_guardians_desc: 'For posthumous messages, designate 1 or 2 people who can confirm your passing and trigger delivery. An inactivity check (6 months without login) acts as a safety net.',
  tm_designate_guardian: 'Designate a guardian →',
  tm_tab_scheduled: 'On a specific date',
  tm_tab_posthumous: 'After my passing',
  tm_empty_scheduled: 'No scheduled messages for now.',
  tm_empty_posthumous: 'No posthumous messages recorded.',
  tm_for: 'For',
  tm_yearly: 'Every year',
  tm_send_after_death: 'To be sent after my passing',
  tm_format_audio: 'Audio',
  tm_format_video: 'Video',
  tm_format_text: 'Text',
  tm_dialog_title: 'New message in time',
  tm_field_format: 'Format',
  tm_field_text: 'Your message',
  tm_field_text_ph: 'My dear grandson, on the day of your 18th birthday…',
  tm_field_recording: 'Recording',
  tm_start_recording: 'Start recording',
  tm_stop_recording: 'Stop',
  tm_upload_file: 'Upload a file',
  tm_restart: 'Restart',
  tm_field_title: 'Message title',
  tm_field_title_ph: 'e.g. Happy 18th birthday',
  tm_field_recipient: 'Recipient',
  tm_field_recipient_ph: 'e.g. Léa Dupont',
  tm_field_relationship: 'Relationship',
  tm_field_relationship_ph: 'e.g. Granddaughter',
  tm_field_email: 'Recipient email',
  tm_field_email_ph: 'e.g. lea.dupont@email.com',
  tm_field_phone: 'Recipient phone',
  tm_field_phone_ph: 'e.g. +1 514 555 0123',
  tm_field_occasion: 'Occasion (optional)',
  tm_field_occasion_ph: 'e.g. 18 years old, wedding, birth…',
  tm_field_when: 'When to send it?',
  tm_when_scheduled: 'On a specific date',
  tm_when_after_death: 'After my passing',
  tm_field_date: 'Send date',
  tm_repeat_yearly: 'Repeat every year',
  tm_after_death_info: 'This message will be released when your trusted guardians confirm your passing, or after a long inactivity (6 months by default).',
  tm_save_btn: 'Save the message',
  tm_guardians_dialog_title: 'Trusted guardians',
  tm_no_guardians: 'No guardian designated',
  tm_guardian_name_ph: 'Full name',
  tm_guardian_email_ph: 'Email',
  tm_guardian_rel_ph: 'Relationship (e.g. eldest child)',
  tm_guardian_add: 'Add this guardian',
  tm_toast_no_circle: 'You must first create or join a family circle.',
  tm_toast_msg_deleted: 'Message deleted',
  tm_toast_confirm_delete_msg: 'Delete this message? This action is final.',
  tm_toast_required_title_recipient: 'Title and recipient are required',
  tm_toast_required_date: 'Choose a send date',
  tm_toast_required_media: 'Record or upload a file',
  tm_toast_required_text: 'Write your message',
  tm_toast_msg_saved: 'Message saved',
  tm_toast_save_err: 'Error while saving',
  tm_toast_mic_err: 'Could not access microphone/camera',
  tm_toast_guardian_added: 'Guardian added',
  tm_toast_guardian_required: 'Name and email are required',
  tm_guardians_dialog_desc: 'These people can confirm your passing and release your posthumous messages. Choose 1 or 2 people you fully trust.',
  tm_toast_guardian_removed: 'Guardian removed',
};

const es: MemoriesCopy = {
  common_loading: 'Cargando…',
  common_add: 'Añadir',
  common_save: 'Guardar',
  common_cancel: 'Cancelar',
  common_delete: 'Eliminar',
  common_edit: 'Editar',
  common_options: 'Opciones',
  common_view_all: 'Ver todo',
  common_back: 'Atrás',
  common_close: 'Cerrar',
  common_yes: 'Sí',
  common_no: 'No',
  common_required: 'Obligatorio',
  common_optional: 'Opcional',
  common_locale: 'es-ES',
  must_create_circle: 'Cree primero su círculo familiar.',
  create_circle: 'Crear un círculo',

  mem_title: 'Recuerdos',
  mem_subtitle: 'Preserve las historias, recetas, tradiciones y mensajes que atraviesan generaciones.',
  mem_new: 'Nuevo recuerdo',
  mem_add_title: 'Añadir un recuerdo',
  mem_caption: 'Descripción',
  mem_caption_placeholder: 'Describa este recuerdo…',
  mem_type: 'Tipo',
  mem_type_text: 'Texto',
  mem_type_photo: 'Foto',
  mem_type_video: 'Video',
  mem_type_audio: 'Audio',
  mem_file: 'Archivo',
  mem_file_hint: 'Formatos aceptados según el tipo elegido.',
  mem_visibility: 'Visibilidad',
  mem_visibility_circle: 'Todo el círculo',
  mem_visibility_managers: 'Solo gestores',
  mem_visibility_private: 'Privado',
  mem_added: 'Recuerdo añadido',
  mem_error: 'Error al añadir el recuerdo',
  mem_upload_error: 'Error al subir el archivo',
  mem_validation_caption: 'La descripción es obligatoria',

  cat_recipes_title: 'Recetas familiares',
  cat_recipes_desc: 'Platos transmitidos de generación en generación',
  cat_stories_title: 'Historias contadas',
  cat_stories_desc: 'Recuerdos en audio y anécdotas de vida',
  cat_photos_title: 'Fotos y videos',
  cat_photos_desc: 'Momentos preciosos para revivir juntos',
  cat_letters_title: 'Cartas y mensajes',
  cat_letters_desc: 'Palabras del corazón para conservar',
  cat_traditions_title: 'Tradiciones y fiestas',
  cat_traditions_desc: 'Rituales, celebraciones y costumbres',
  cat_timeline_title: 'Línea del tiempo familiar',
  cat_timeline_desc: 'Momentos memorables de la familia',
  cat_aria: 'Categorías de recuerdos',

  stats_aria: 'Estadísticas de su círculo',
  stats_memories: 'recuerdos',
  stats_generations: 'generaciones',
  stats_secure_title: 'Privado y seguro',
  stats_secure_desc: 'Sus recuerdos permanecen en familia',

  rediscover_title: 'Para redescubrir',
  rediscover_empty_hint: 'Comience con una receta, una historia en audio o una foto familiar.',
  rediscover_create_first: 'Crear mi primer recuerdo',
  collections_title: 'Colecciones sugeridas',
  col_grandma_recipes: 'Recetas de la abuela',
  col_births_weddings: 'Nacimientos y bodas',
  col_messages_for_later: 'Mensajes para más tarde',
  col_family_home: 'Casa familiar',

  filters_aria: 'Filtros',
  filter_all: 'Todos',
  filter_recipes: 'Recetas',
  filter_audio: 'Audio',
  filter_video: 'Video',
  filter_documents: 'Documentos',
  filter_by_person: 'Por persona',
  filter_by_generation: 'Por generación',

  demo_recipe_badge: 'RECETA',
  demo_audio_badge: 'AUDIO',
  demo_photo_badge: 'FOTO',
  demo_cake_title: 'El pastel de la abuela',
  demo_cake_author: 'Marguerite Dupont',
  demo_childhood_title: 'Recuerdos de mi infancia',
  demo_childhood_author: 'Jean Dupont',
  demo_beach_title: 'Vacaciones en el mar',
  demo_beach_author: 'Familia Dupont',

  tr_title: 'Tradiciones y fiestas',
  tr_subtitle: 'Rituales, celebraciones y costumbres que unen a su familia.',
  tr_new: 'Nueva tradición',
  tr_add_title: 'Añadir una tradición',
  tr_edit_title: 'Editar la tradición',
  tr_name: 'Nombre',
  tr_name_placeholder: 'Ej. Nochebuena',
  tr_category: 'Categoría',
  tr_recurrence: 'Recurrencia',
  tr_month: 'Mes',
  tr_day: 'Día',
  tr_origin_year: 'Desde (año)',
  tr_origin_year_placeholder: 'Ej. 1952',
  tr_description: 'Descripción',
  tr_description_placeholder: 'Origen, significado…',
  tr_participants: 'Participantes',
  tr_participants_placeholder: 'Ej. Toda la familia extendida',
  tr_rituals: 'Rituales y costumbres',
  tr_rituals_placeholder: 'Platos preparados, gestos, canciones…',
  tr_rituals_section: 'Rituales',
  tr_since: 'desde',
  tr_date_tbd: 'Fecha por definir',
  tr_empty_title: 'Aún no hay tradiciones registradas',
  tr_empty_desc: 'Documente las fiestas, rituales y costumbres que hacen única a su familia para transmitirlas a las próximas generaciones.',
  tr_add_first: 'Añadir la primera tradición',
  tr_example_title: 'Aquí tiene un ejemplo a seguir',
  tr_example_desc: 'Inspírese en este modelo para documentar Navidad, Pascua, cumpleaños, recetas familiares y costumbres heredadas.',
  tr_example_alt: 'Ejemplo de página Tradiciones y fiestas',
  tr_confirm_delete: '¿Eliminar esta tradición?',
  tr_deleted: 'Tradición eliminada',
  tr_saved_added: 'Tradición añadida',
  tr_saved_updated: 'Tradición actualizada',
  tr_save_error: 'Error al guardar',
  tr_delete_error: 'Error al eliminar',
  tr_validation_name: 'El nombre debe tener al menos 2 caracteres',
  tr_cat_celebration: 'Celebración',
  tr_cat_religious: 'Religiosa',
  tr_cat_seasonal: 'De temporada',
  tr_cat_culinary: 'Culinaria',
  tr_cat_cultural: 'Cultural',
  tr_cat_other: 'Otra',
  tr_rec_annual: 'Anual',
  tr_rec_monthly: 'Mensual',
  tr_rec_weekly: 'Semanal',
  tr_rec_occasional: 'Ocasional',
  months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],

  tl_title: 'Línea del tiempo familiar',
  tl_subtitle: 'Los momentos memorables, ordenados cronológicamente.',
  tl_new: 'Nuevo evento',
  tl_add_title: 'Añadir un evento',
  tl_edit_title: 'Editar el evento',
  tl_event_title_label: 'Título',
  tl_event_title_placeholder: 'Ej. Nacimiento de María',
  tl_date: 'Fecha',
  tl_category: 'Categoría',
  tl_description: 'Descripción',
  tl_description_placeholder: 'Detalles, contexto, anécdotas…',
  tl_count_events_one: 'evento',
  tl_count_events_many: 'eventos',
  tl_count_dated_one: 'recuerdo fechado',
  tl_count_dated_many: 'recuerdos fechados',
  tl_empty_title: 'Su línea del tiempo está vacía',
  tl_empty_desc: 'Añada los nacimientos, bodas, viajes y grandes momentos de su familia. Los recuerdos con fecha aparecerán también aquí automáticamente.',
  tl_add_first: 'Añadir el primer evento',
  tl_example_title: 'Así se verá su línea del tiempo',
  tl_example_desc: 'Un ejemplo para inspirarse. Añada sus propios momentos para verla cobrar vida.',
  tl_example_alt: 'Ejemplo de línea del tiempo familiar',
  tl_memory_badge: 'Recuerdo',
  tl_view_memory: 'Ver el recuerdo →',
  tl_confirm_delete: '¿Eliminar este evento?',
  tl_deleted: 'Evento eliminado',
  tl_saved_added: 'Evento añadido',
  tl_saved_updated: 'Evento actualizado',
  tl_save_error: 'Error al guardar',
  tl_delete_error: 'Error al eliminar',
  tl_validation_title: 'El título debe tener al menos 2 caracteres',
  tl_validation_date: 'La fecha es obligatoria',
  tl_cat_birth: 'Nacimiento',
  tl_cat_wedding: 'Boda',
  tl_cat_graduation: 'Graduación',
  tl_cat_home: 'Nueva casa',
  tl_cat_travel: 'Viaje',
  tl_cat_milestone: 'Hito',

  rec_title: 'Nuestras recetas familiares',
  rec_subtitle: 'Conservemos juntos las recetas que nos unen.',
  rec_action_photo: 'Tomar una foto',
  rec_action_photo_hint: 'La IA se encarga del resto.',
  rec_action_write: 'Escribir una receta',
  rec_action_write_hint: 'A su propio ritmo.',
  rec_action_dictate: 'Dictar la receta',
  rec_action_dictate_hint: 'Hable, la IA lo estructura todo.',
  rec_search_placeholder: 'Buscar una receta o un ingrediente…',
  rec_section_our: 'Nuestras recetas',
  rec_no_match: 'Ninguna receta coincide con su búsqueda.',
  rec_organize_title: 'Organizar las recetas',
  rec_organize_hint: 'Toque una categoría para ver las recetas agrupadas.',
  rec_filter_all: 'Todas',
  rec_filter_main: 'Platos principales',
  rec_filter_dessert: 'Postres',
  rec_filter_favorites: 'Favoritas',
  rec_class_family: 'Por familia',
  rec_class_family_hint: 'Ramas y linajes',
  rec_class_occasion: 'Por ocasión',
  rec_class_occasion_hint: 'Navidad, bodas, fiestas',
  rec_class_generation: 'Por generación',
  rec_class_generation_hint: 'Épocas y linajes',
  rec_class_dish: 'Por tipo de plato',
  rec_class_dish_hint: 'Entradas, principales, postres',
  rec_class_scanned: 'Cuadernos digitalizados',
  rec_class_scanned_hint: 'Recetas manuscritas',
  rec_class_favorites: 'Favoritas',
  rec_class_favorites_hint: 'Sus preferidas',
  rec_back_all: 'Todas las recetas',
  rec_empty_title: 'Comience su libro de recetas familiar',
  rec_empty_desc: 'Añada una primera receta, digitalice un cuaderno manuscrito o invite a un ser querido a compartir un recuerdo culinario.',
  rec_empty_add: 'Añadir una receta',
  rec_empty_scan: 'Digitalizar una receta',
  rec_empty_invite: 'Invitar a un ser querido',
  rec_heritage_title: 'La historia detrás de la receta',
  rec_heritage_desc: 'Cada receta tiene una historia. Conservémosla juntos para las generaciones venideras.',
  rec_heritage_photos: 'Fotos familiares',
  rec_heritage_audio: 'Recuerdos en audio',
  rec_heritage_notes: 'Notas manuscritas',
  rec_heritage_anec: 'Anécdotas',
  rec_heritage_cta: 'Añadir un recuerdo',
  rec_featured_badge: 'Receta destacada',
  rec_featured_transmitted: 'Transmitida por',
  rec_featured_generations: 'generaciones',
  rec_featured_first: 'Añadir su primera receta',
  rec_featured_view: 'Ver la receta',
  rec_card_no_photo: 'Sin foto',
  rec_demo_badge: 'DEMO',
  rec_badge_handwritten: 'Manuscrito',
  rec_badge_audio: 'Audio',
  rec_badge_memory: 'Recuerdo',
  rec_badge_note: 'Nota',
  rec_change_photo: 'Cambiar la foto',
  rec_add_photo: 'Añadir una foto',
  rec_take_photo: 'Tomar una foto',
  rec_pick_from_device: 'Elegir desde el dispositivo',
  rec_no_main_photo: 'Sin foto principal',
  rec_prep: 'Preparación',
  rec_cook: 'Cocción',
  rec_servings: 'Porciones',
  rec_story_title: 'La historia de esta receta',
  rec_ingredients_title: 'Ingredientes',
  rec_steps_title: 'Pasos',
  rec_transmitted_by: 'Transmitida por',
  rec_original_author: 'Autor original',
  rec_branch: 'Rama familiar',
  rec_generation: 'Generación',
  rec_occasions: 'Ocasiones',
  rec_delete_btn: '🗑️ Eliminar la receta',
  rec_add_memory_btn: 'Añadir un recuerdo',
  rec_close: 'Cerrar',
  rec_confirm_delete_title: '¿Eliminar esta receta?',
  rec_confirm_delete_desc: 'Esta acción es definitiva. La receta se retirará del libro familiar. Los recuerdos vinculados no se eliminarán.',
  rec_confirm_delete_yes: 'Sí, eliminar',
  rec_no_data_view: 'No hay datos que mostrar. Comience añadiendo una receta o creando ramas familiares.',
  rec_no_recipe_in_cat: 'Ninguna receta en esta categoría.',
  rec_without_branch: 'Sin rama',
  rec_without_generation: 'Sin generación',
  rec_without_occasion: 'Sin ocasión',
  rec_handwritten_group: 'Recetas manuscritas digitalizadas',
  rec_favorites_group: 'Sus recetas favoritas',
  rec_dish_appetizer: 'Entrada',
  rec_dish_soup: 'Sopa',
  rec_dish_main: 'Plato principal',
  rec_dish_side: 'Acompañamiento',
  rec_dish_dessert: 'Postre',
  rec_dish_preserve: 'Conserva',
  rec_dish_drink: 'Bebida',
  rec_dish_sauce: 'Salsa',
  rec_dish_bread: 'Pan',
  rec_dish_other: 'Otro',
  rec_toast_extracted: '¡Receta detectada! Revise y guarde.',
  rec_toast_photo_updated: 'Foto principal actualizada',
  rec_toast_photo_error: 'No se pudo cambiar la foto',
  rec_toast_deleted: 'Receta eliminada',
  rec_toast_delete_error: 'No se pudo eliminar la receta',
  rec_demo_recipe_title: 'Tourtière de la abuela Louise',
  rec_demo_recipe_branch: 'Rama Tremblay',
  rec_demo_recipe_occasion: 'Navidad',
  rec_demo_recipe_transmitted: 'Abuela Louise',

  st_back_memories: 'Volver a los recuerdos',
  st_badge: 'Historias contadas',
  st_title: 'Sus historias familiares',
  st_subtitle: 'Conserve sus relatos, momentos de vida y anécdotas. Escríbalos, dictelos, añada fotos o videos.',
  st_write: 'Escribir una historia',
  st_write_hint: 'Escriba usted mismo su relato, a su ritmo. Añada fotos y videos.',
  st_dictate: 'Dictar una historia',
  st_dictate_hint: 'Hable naturalmente. La IA transcribe, estructura y resume por usted.',
  st_count_one: 'historia',
  st_count_many: 'historias',
  st_count_none: 'Aún no hay historias',
  st_empty_hint: 'Comience escribiendo o dictando su primera historia.',
  st_dictate_dialog_title: 'Dictar su historia',
  st_dictate_dialog_desc: 'Cuente su recuerdo naturalmente, como a sus seres queridos. La IA transcribirá y propondrá un resumen.',
  st_recording: 'Grabación en curso…',
  st_recording_hint: 'Tómese su tiempo. Describa la escena, las personas, sus emociones.',
  st_stop_transcribe: 'Detener y transcribir',
  st_processing: 'La IA está transcribiendo su relato…',
  st_processing_hint: 'Generando el título y el resumen',
  st_dialog_check: 'Revisar el dictado',
  st_dialog_write: 'Escribir una historia',
  st_dialog_desc: 'Dele un título a su relato, añada la fecha del recuerdo y adjunte fotos o videos si lo desea.',
  st_field_title: 'Título',
  st_field_title_ph: 'Ej. La boda de la tía Yvonne',
  st_field_date: 'Fecha del recuerdo (opcional)',
  st_field_visibility: 'Visibilidad',
  st_vis_circle: 'Toda la familia',
  st_vis_managers: 'Solo gestores',
  st_vis_private: 'Privado (solo yo)',
  st_field_content: 'Su relato',
  st_field_content_ph: 'Cuente su recuerdo, un momento de vida, una anécdota…',
  st_field_summary: 'Resumen (opcional)',
  st_summarize_ai: 'Resumir con IA',
  st_field_summary_ph: 'Un breve resumen para encontrar la historia fácilmente.',
  st_field_media: 'Fotos, videos o audio (opcional)',
  st_add_files: 'Añadir archivos',
  st_take_photo: 'Tomar una foto',
  st_save_btn: 'Guardar la historia',
  st_no_text: 'Sin texto.',
  st_dictated_badge: 'Dictado',
  st_no_title: 'Sin título',
  st_no_content: 'Aún sin contenido.',
  st_added_on: 'Añadida el',
  st_memory_of: 'Recuerdo del',
  st_media_section: 'Fotos, videos y audio',
  st_describe_ai: 'Describir con IA',
  st_anecdotes_title: 'Anécdotas',
  st_anecdote_empty: 'Aún sin anécdota. Añada un detalle sabroso, una variante, un recuerdo relacionado.',
  st_anecdote_ph: 'Añadir una anécdota a esta historia…',
  st_anecdote_add: 'Añadir esta anécdota',
  st_delete_story: 'Eliminar esta historia',
  st_confirm_delete_title: '¿Eliminar esta historia?',
  st_confirm_delete_desc: 'Esta acción es definitiva. La historia, sus anécdotas y sus medios serán eliminados.',
  st_confirm_delete_yes: 'Eliminar definitivamente',
  st_toast_mic_error: 'No se puede acceder al micrófono. Autorice el acceso e inténtelo de nuevo.',
  st_toast_no_transcription: 'Sin transcripción',
  st_toast_transcription_failed: 'Error en la transcripción',
  st_toast_transcribed: 'Transcripción exitosa. Revise y guarde.',
  st_toast_write_first: 'Escriba primero algo de texto.',
  st_toast_summary_done: 'Resumen generado',
  st_toast_summary_failed: 'Error en el resumen',
  st_toast_need_content: 'Añada al menos un título o un relato.',
  st_toast_saved: 'Historia guardada',
  st_toast_save_error: 'Error al guardar',
  st_toast_anecdote_added_err: 'Error al añadir',
  st_toast_deleted: 'Historia eliminada',
  st_toast_delete_err: 'Error al eliminar',
  st_toast_describe_done: 'Descripción generada',
  st_toast_describe_err: 'Error en la descripción',
  st_toast_upload_err: 'Error al enviar',

  gal_back: 'Atrás',
  gal_title: 'Álbum de la familia',
  gal_subtitle: 'Todas sus fotos y videos, clasificados automáticamente por fecha. Importe desde su teléfono, su llave USB o su computadora.',
  gal_used_of: 'usados',
  gal_plan_free: 'Plan gratuito — 5 GB incluidos',
  gal_plan_other: 'Plan',
  gal_increase: 'Ampliar mi almacenamiento',
  gal_full_title: 'Almacenamiento lleno',
  gal_full_desc: 'Ha alcanzado el límite de 5 GB. Para seguir añadiendo fotos y videos, elija un plan.',
  gal_near_desc: 'Se acerca a su límite. Considere pasar a un plan más grande para no quedarse bloqueado.',
  gal_pick_files: 'Elegir archivos',
  gal_pick_files_hint: 'Fotos y videos desde su teléfono o computadora',
  gal_pick_folder: 'Elegir una carpeta completa',
  gal_pick_folder_hint: 'Una carpeta entera (USB, computadora antigua)',
  gal_importing: 'Importando',
  gal_empty_title: 'Su álbum está vacío',
  gal_empty_desc: 'Comience a transferir las fotos y videos de su familia. Se clasificarán automáticamente por fecha.',
  gal_delete: 'Eliminar',
  gal_toast_full: 'Almacenamiento lleno — pase a un plan para continuar',
  gal_toast_no_media: 'No se encontraron fotos ni videos',
  gal_toast_full_remaining: 'Almacenamiento lleno. Quedan por importar',
  gal_toast_added: 'archivo(s) añadido(s) a su álbum',
  gal_toast_skipped: 'archivo(s) no importado(s)',
  gal_toast_deleted: 'Recuerdo eliminado',
  gal_confirm_delete: '¿Eliminar definitivamente este recuerdo?',

  tm_badge: 'Mensajes en el tiempo',
  tm_title: 'Sus palabras, entregadas en el momento justo',
  tm_subtitle: 'Grabe hoy mensajes de voz, video o escritos que serán enviados a sus seres queridos en una fecha precisa (cumpleaños, boda, nacimiento…) o tras su fallecimiento.',
  tm_guardians_btn: 'Guardianes',
  tm_new_btn: 'Nuevo mensaje',
  tm_setup_guardians_title: 'Configure sus guardianes de confianza',
  tm_setup_guardians_desc: 'Para los mensajes póstumos, designe a 1 o 2 personas que puedan confirmar su fallecimiento y activar el envío. Una verificación de inactividad (6 meses sin conexión) sirve de red de seguridad.',
  tm_designate_guardian: 'Designar un guardián →',
  tm_tab_scheduled: 'En fecha precisa',
  tm_tab_posthumous: 'Tras mi fallecimiento',
  tm_empty_scheduled: 'Ningún mensaje programado por ahora.',
  tm_empty_posthumous: 'Ningún mensaje póstumo registrado.',
  tm_for: 'Para',
  tm_yearly: 'Cada año',
  tm_send_after_death: 'A enviar tras mi fallecimiento',
  tm_format_audio: 'Audio',
  tm_format_video: 'Video',
  tm_format_text: 'Texto',
  tm_dialog_title: 'Nuevo mensaje en el tiempo',
  tm_field_format: 'Formato',
  tm_field_text: 'Su mensaje',
  tm_field_text_ph: 'Mi querido nieto, el día de tus 18 años…',
  tm_field_recording: 'Grabación',
  tm_start_recording: 'Comenzar la grabación',
  tm_stop_recording: 'Detener',
  tm_upload_file: 'Subir un archivo',
  tm_restart: 'Reiniciar',
  tm_field_title: 'Título del mensaje',
  tm_field_title_ph: 'Ej: Feliz 18 cumpleaños',
  tm_field_recipient: 'Destinatario',
  tm_field_recipient_ph: 'Ej: Léa Dupont',
  tm_field_relationship: 'Vínculo',
  tm_field_relationship_ph: 'Ej: Nieta',
  tm_field_email: 'Correo del destinatario',
  tm_field_email_ph: 'ej: lea.dupont@email.com',
  tm_field_phone: 'Teléfono del destinatario',
  tm_field_phone_ph: 'ej: +1 514 555 0123',
  tm_field_occasion: 'Ocasión (opcional)',
  tm_field_occasion_ph: 'Ej: 18 años, boda, nacimiento…',
  tm_field_when: '¿Cuándo enviarlo?',
  tm_when_scheduled: 'En una fecha precisa',
  tm_when_after_death: 'Tras mi fallecimiento',
  tm_field_date: 'Fecha de envío',
  tm_repeat_yearly: 'Repetir cada año',
  tm_after_death_info: 'Este mensaje se liberará cuando sus guardianes de confianza confirmen su fallecimiento, o tras una larga inactividad (6 meses por defecto).',
  tm_save_btn: 'Guardar el mensaje',
  tm_guardians_dialog_title: 'Guardianes de confianza',
  tm_no_guardians: 'Ningún guardián designado',
  tm_guardian_name_ph: 'Nombre completo',
  tm_guardian_email_ph: 'Correo',
  tm_guardian_rel_ph: 'Vínculo (ej: hijo mayor)',
  tm_guardian_add: 'Añadir este guardián',
  tm_toast_no_circle: 'Primero debe crear o unirse a un círculo familiar.',
  tm_toast_msg_deleted: 'Mensaje eliminado',
  tm_toast_confirm_delete_msg: '¿Eliminar este mensaje? Esta acción es definitiva.',
  tm_toast_required_title_recipient: 'Título y destinatario son obligatorios',
  tm_toast_required_date: 'Elija una fecha de envío',
  tm_toast_required_media: 'Grabe o suba un archivo',
  tm_toast_required_text: 'Escriba su mensaje',
  tm_toast_msg_saved: 'Mensaje guardado',
  tm_toast_save_err: 'Error al guardar',
  tm_toast_mic_err: 'No se puede acceder al micrófono/cámara',
  tm_toast_guardian_added: 'Guardián añadido',
  tm_toast_guardian_required: 'Nombre y correo obligatorios',
  tm_guardians_dialog_desc: 'Estas personas podrán confirmar su fallecimiento y liberar sus mensajes póstumos. Elija 1 o 2 personas en las que confíe plenamente.',
  tm_toast_guardian_removed: 'Guardián retirado',
};

export const MEMORIES_COPY: Record<MemLang, MemoriesCopy> = { fr, en, es };

export function useMemoriesCopy(lang: string): MemoriesCopy {
  const k = (lang === 'en' || lang === 'es' || lang === 'fr') ? lang : 'fr';
  return MEMORIES_COPY[k as MemLang];
}
