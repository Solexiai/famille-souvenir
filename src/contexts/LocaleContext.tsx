import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { SupportedLanguage, Translations, CountryGroup, JurisdictionPack } from '@/i18n/types';
import { TerminologyPack } from '@/i18n/types';
import { getTerminology } from '@/i18n/terminology';
import fr from '@/i18n/locales/fr';
import en from '@/i18n/locales/en';
import es from '@/i18n/locales/es';

const locales: Record<SupportedLanguage, Translations> = { fr, en, es };

interface LocaleContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: Translations;
  terms: TerminologyPack;
  jurisdictionPack: JurisdictionPack | null;
  setJurisdictionPack: (pack: JurisdictionPack | null) => void;
  countryGroup: CountryGroup | null;
  setCountryGroup: (group: CountryGroup | null) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('solexi_lang');
    if (saved === 'en' || saved === 'es' || saved === 'fr') return saved;
    // New users: default to English (preserve existing user choices via the localStorage check above)
    return 'en';
  });
  const [jurisdictionPack, setJurisdictionPackState] = useState<JurisdictionPack | null>(() => {
    return (localStorage.getItem('solexi_jurisdiction') as JurisdictionPack) || null;
  });
  const [countryGroup, setCountryGroupState] = useState<CountryGroup | null>(() => {
    return (localStorage.getItem('solexi_country_group') as CountryGroup) || null;
  });

  const setLang = useCallback((l: SupportedLanguage) => {
    setLangState(l);
    localStorage.setItem('solexi_lang', l);
    document.documentElement.lang = l;
  }, []);

  const setJurisdictionPack = useCallback((p: JurisdictionPack | null) => {
    setJurisdictionPackState(p);
    if (p) localStorage.setItem('solexi_jurisdiction', p);
  }, []);

  const setCountryGroup = useCallback((g: CountryGroup | null) => {
    setCountryGroupState(g);
    if (g) localStorage.setItem('solexi_country_group', g);
  }, []);

  const t = useMemo(() => locales[lang], [lang]);
  const terms = useMemo(() => getTerminology(jurisdictionPack), [jurisdictionPack]);

  return (
    <LocaleContext.Provider value={{ lang, setLang, t, terms, jurisdictionPack, setJurisdictionPack, countryGroup, setCountryGroup }}>
      {children}
    </LocaleContext.Provider>
  );
};

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
