import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { canadianProvinces, usStates, latamCountries, resolveJurisdiction } from '@/i18n/jurisdictions';
import { CountryGroup, SupportedLanguage } from '@/i18n/types';
import { Globe, MapPin, Languages } from 'lucide-react';

const SetupPage: React.FC = () => {
  const { t, lang, setLang, setJurisdictionPack, setCountryGroup: setCtxGroup } = useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [countryGroup, setCountryGroup] = useState<CountryGroup | null>(null);
  const [regionCode, setRegionCode] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(lang);
  const [saving, setSaving] = useState(false);

  const regionOptions = countryGroup === 'canada'
    ? canadianProvinces
    : countryGroup === 'united_states'
      ? usStates
      : countryGroup === 'latin_america'
        ? latamCountries
        : [];

  const regionLabel = countryGroup === 'canada'
    ? t.setup_region
    : countryGroup === 'united_states'
      ? t.setup_region
      : t.setup_country;

  const canContinue = countryGroup && regionCode;

  const handleContinue = async () => {
    if (!countryGroup || !regionCode) return;
    setSaving(true);

    const resolved = resolveJurisdiction(countryGroup, regionCode);

    // Apply language
    setLang(selectedLang);
    setJurisdictionPack(resolved.jurisdictionPack);
    setCtxGroup(countryGroup);

    // Save to profile if logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({
          country_group: countryGroup,
          country_code: resolved.countryCode,
          region_code: regionCode,
          preferred_language: selectedLang,
          jurisdiction_pack: resolved.jurisdictionPack,
          currency_code: resolved.currencyCode,
        })
        .eq('user_id', user.id);
    }

    setSaving(false);
    navigate(user ? '/onboarding' : '/signup');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">{t.setup_title}</h1>
          <p className="mt-2 text-muted-foreground">{t.setup_subtitle}</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              {t.setup_country_group}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Country group */}
            <Select
              value={countryGroup ?? ''}
              onValueChange={(v) => {
                setCountryGroup(v as CountryGroup);
                setRegionCode(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.setup_country_group} />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(t.setup_country_group_options) as CountryGroup[]).map(g => (
                  <SelectItem key={g} value={g}>{t.setup_country_group_options[g]}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Region / State / Country */}
            {countryGroup && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {regionLabel}
                </label>
                <Select value={regionCode ?? ''} onValueChange={setRegionCode}>
                  <SelectTrigger>
                    <SelectValue placeholder={countryGroup === 'latin_america' ? t.setup_country_placeholder : t.setup_region_placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map(r => (
                      <SelectItem key={r.code} value={r.code}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Language */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                {t.setup_language}
              </label>
              <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as SupportedLanguage)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(t.setup_language_options) as SupportedLanguage[]).map(l => (
                    <SelectItem key={l} value={l}>{t.setup_language_options[l]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleContinue} className="w-full" size="lg" disabled={!canContinue || saving}>
              {t.continue_btn}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupPage;
