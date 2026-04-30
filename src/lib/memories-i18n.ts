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
};

export const MEMORIES_COPY: Record<MemLang, MemoriesCopy> = { fr, en, es };

export function useMemoriesCopy(lang: string): MemoriesCopy {
  const k = (lang === 'en' || lang === 'es' || lang === 'fr') ? lang : 'fr';
  return MEMORIES_COPY[k as MemLang];
}
