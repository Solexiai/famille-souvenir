import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [circleName, setCircleName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if user already has a circle
    const check = async () => {
      const { data } = await supabase
        .from('family_circles')
        .select('id')
        .limit(1);
      if (data && data.length > 0) {
        navigate('/dashboard');
      }
      // Pre-fill name
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

  const handleStep2 = async () => {
    if (!circleName.trim() || !user) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('family_circles')
      .insert({ name: circleName.trim(), owner_id: user.id })
      .select()
      .single();

    if (error || !data) {
      toast.error('Erreur lors de la création du cercle.');
      setSaving(false);
      return;
    }

    await supabase
      .from('circle_members')
      .insert({ circle_id: data.id, user_id: user.id, role: 'owner' as const });

    toast.success('Bienvenue dans votre espace familial !');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-semibold text-foreground">Bienvenue</h1>
          <p className="mt-2 text-muted-foreground">Configurons votre espace en quelques étapes.</p>
        </div>

        {step === 1 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Étape 1 — Votre identité</CardTitle>
              <CardDescription>Comment souhaitez-vous être identifié(e) ?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  placeholder="Jean Dupont"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <Button onClick={handleStep1} className="w-full" size="lg" disabled={saving || !fullName.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Continuer
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Étape 2 — Votre cercle</CardTitle>
              <CardDescription>Donnez un nom à votre cercle familial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="circleName">Nom du cercle</Label>
                <Input
                  id="circleName"
                  placeholder="Famille Dupont"
                  value={circleName}
                  onChange={(e) => setCircleName(e.target.value)}
                />
              </div>
              <Button onClick={handleStep2} className="w-full" size="lg" disabled={saving || !circleName.trim()}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Créer mon espace
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-accent' : 'bg-muted'}`} />
          <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-muted'}`} />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
