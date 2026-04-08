import { SupportedLanguage, CountryGroup } from './types';

/** Canonical language order: FR → EN → ES */
export const LANGUAGE_ORDER: SupportedLanguage[] = ['fr', 'en', 'es'];

/** Display names for each language (always the same regardless of current locale) */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

/** Canonical jurisdiction display order */
export const COUNTRY_GROUP_ORDER: CountryGroup[] = ['canada', 'united_states', 'latin_america'];
