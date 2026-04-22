import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Heart } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const { t, jurisdictionPack, countryGroup } = useLocale();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [circleName, setCircleName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from('family_circles')
        .select('id')
        .limit(1);
      if (data && data.length > 0) {
        navigate('/dashboard');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      if (profile?.full_name) setFullName(profile.full_name);
    };
    check();
  }, [user, navigate]);

  const handleStep1 = async () => {
    if (!fullName.trim() || !user) return;
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('user_id', user.id);
    setSaving(false);
    setStep(2);
  };

  const handleStep2 = () => {
    if (!circleName.trim()) return;
    setStep(3);
  };

  const handleStep3 = async () => {
    if (!user || !circleName.trim()) return;
    setSaving(true);

    // Resolve jurisdiction from context for the circle
    const profileData = await supabase
      .from('profiles')
      .select('country_group, country_code, region_code, jurisdiction_pack, currency_code')
      .eq('user_id', user.id)
      .single();

    const p = profileData.data;

    const { data, error } = await supabase
      .from('family_circles')
      .insert({
        name: circleName.trim(),
        owner_id: user.id,
        country_group: p?.country_group ?? null,
        country_code: p?.country_code ?? null,
        region_code: p?.region_code ?? null,
        jurisdiction_pack: p?.jurisdiction_pack ?? null,
        legal_terms_pack: p?.jurisdiction_pack ? `${p.jurisdiction_pack}_pack` : null,
        currency_code: p?.currency_code ?? 'CAD',
      })
      .select()
      .single();

    if (error || !data) {
      toast.error(t.onboarding_circle_create_error);
      setSaving(false);
      return;
    }

    await supabase
      .from('circle_members')
      .insert({ circle_id: data.id, user_id: user.id, role: 'owner' as const });

    toast.success(t.onboarding_create_space + ' ✓');
    navigate('/dashboard');
  };

  const totalSteps = 3;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">{t.onboarding_welcome}</h1>
          <p className="mt-2 text-muted-foreground flex items-center justify-center gap-2">
            <Heart className="h-4 w-4 text-accent" />
            {t.onboarding_emotional_tagline}
          </p>
        </div>

        {step === 1 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t.onboarding_step_identity}</CardTitle>
              <CardDescription>{t.onboarding_step_identity_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.onboarding_full_name}</Label>
                <Input id="fullName" placeholder={t.onboarding_full_name_placeholder} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <Button onClick={handleStep1} className="w-full" size="lg" disabled={saving || !fullName.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.continue_btn}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t.onboarding_step_circle}</CardTitle>
              <CardDescription>{t.onboarding_step_circle_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="circleName">{t.onboarding_circle_name}</Label>
                <Input id="circleName" placeholder={t.onboarding_circle_name_placeholder} value={circleName} onChange={(e) => setCircleName(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t.back}</Button>
                <Button onClick={handleStep2} className="flex-1" size="lg" disabled={!circleName.trim()}>
                  {t.continue_btn}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t.onboarding_step_purpose}</CardTitle>
              <CardDescription>{t.onboarding_step_purpose_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {t.onboarding_purpose_options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPurpose(opt.value)}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                      purpose === opt.value
                        ? 'border-accent bg-secondary text-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-accent/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">{t.back}</Button>
                <Button onClick={handleStep3} className="flex-1" size="lg" disabled={saving || !purpose}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.onboarding_create_space}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full ${step >= i + 1 ? 'bg-accent' : 'bg-muted'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
