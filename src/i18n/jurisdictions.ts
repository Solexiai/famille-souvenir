import { CountryGroup, JurisdictionPack, LegalTermsPack, SupportedLanguage } from './types';

export const canadianProvinces = [
  { code: 'QC', label: 'Québec' },
  { code: 'ON', label: 'Ontario' },
  { code: 'BC', label: 'British Columbia' },
  { code: 'AB', label: 'Alberta' },
  { code: 'MB', label: 'Manitoba' },
  { code: 'SK', label: 'Saskatchewan' },
  { code: 'NS', label: 'Nova Scotia' },
  { code: 'NB', label: 'New Brunswick' },
  { code: 'NL', label: 'Newfoundland & Labrador' },
  { code: 'PE', label: 'Prince Edward Island' },
  { code: 'NT', label: 'Northwest Territories' },
  { code: 'YT', label: 'Yukon' },
  { code: 'NU', label: 'Nunavut' },
];

export const usStates = [
  { code: 'AL', label: 'Alabama' }, { code: 'AK', label: 'Alaska' }, { code: 'AZ', label: 'Arizona' },
  { code: 'AR', label: 'Arkansas' }, { code: 'CA', label: 'California' }, { code: 'CO', label: 'Colorado' },
  { code: 'CT', label: 'Connecticut' }, { code: 'DE', label: 'Delaware' }, { code: 'FL', label: 'Florida' },
  { code: 'GA', label: 'Georgia' }, { code: 'HI', label: 'Hawaii' }, { code: 'ID', label: 'Idaho' },
  { code: 'IL', label: 'Illinois' }, { code: 'IN', label: 'Indiana' }, { code: 'IA', label: 'Iowa' },
  { code: 'KS', label: 'Kansas' }, { code: 'KY', label: 'Kentucky' }, { code: 'LA', label: 'Louisiana' },
  { code: 'ME', label: 'Maine' }, { code: 'MD', label: 'Maryland' }, { code: 'MA', label: 'Massachusetts' },
  { code: 'MI', label: 'Michigan' }, { code: 'MN', label: 'Minnesota' }, { code: 'MS', label: 'Mississippi' },
  { code: 'MO', label: 'Missouri' }, { code: 'MT', label: 'Montana' }, { code: 'NE', label: 'Nebraska' },
  { code: 'NV', label: 'Nevada' }, { code: 'NH', label: 'New Hampshire' }, { code: 'NJ', label: 'New Jersey' },
  { code: 'NM', label: 'New Mexico' }, { code: 'NY', label: 'New York' }, { code: 'NC', label: 'North Carolina' },
  { code: 'ND', label: 'North Dakota' }, { code: 'OH', label: 'Ohio' }, { code: 'OK', label: 'Oklahoma' },
  { code: 'OR', label: 'Oregon' }, { code: 'PA', label: 'Pennsylvania' }, { code: 'RI', label: 'Rhode Island' },
  { code: 'SC', label: 'South Carolina' }, { code: 'SD', label: 'South Dakota' }, { code: 'TN', label: 'Tennessee' },
  { code: 'TX', label: 'Texas' }, { code: 'UT', label: 'Utah' }, { code: 'VT', label: 'Vermont' },
  { code: 'VA', label: 'Virginia' }, { code: 'WA', label: 'Washington' }, { code: 'WV', label: 'West Virginia' },
  { code: 'WI', label: 'Wisconsin' }, { code: 'WY', label: 'Wyoming' }, { code: 'DC', label: 'District of Columbia' },
];

export const latamCountries = [
  { code: 'MX', label: 'México' },
  { code: 'CO', label: 'Colombia' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CL', label: 'Chile' },
  { code: 'PE', label: 'Perú' },
  { code: 'DO', label: 'República Dominicana' },
  { code: 'OTHER', label: 'Otro país de América Latina' },
];

export function resolveJurisdiction(
  countryGroup: CountryGroup,
  regionCode: string | null
): { jurisdictionPack: JurisdictionPack; legalTermsPack: LegalTermsPack; countryCode: string; defaultLang: SupportedLanguage; currencyCode: string } {
  if (countryGroup === 'canada') {
    if (regionCode === 'QC') {
      return { jurisdictionPack: 'quebec', legalTermsPack: 'quebec_fr', countryCode: 'CA', defaultLang: 'fr', currencyCode: 'CAD' };
    }
    return { jurisdictionPack: 'canada_general', legalTermsPack: 'canada_en', countryCode: 'CA', defaultLang: 'en', currencyCode: 'CAD' };
  }
  if (countryGroup === 'united_states') {
    return { jurisdictionPack: 'us_general', legalTermsPack: 'us_en', countryCode: 'US', defaultLang: 'en', currencyCode: 'USD' };
  }
  // latin_america
  return { jurisdictionPack: 'latam_general', legalTermsPack: 'latam_es_general', countryCode: regionCode ?? 'MX', defaultLang: 'es', currencyCode: 'USD' };
}

export function getDefaultLanguageForGroup(group: CountryGroup): SupportedLanguage {
  if (group === 'latin_america') return 'es';
  if (group === 'canada') return 'fr';
  return 'en';
}
