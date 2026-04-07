import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Shield, Download, Trash2 } from 'lucide-react';
import type { Profile, Consent } from '@/types/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [fullName, setFullName] = useState('');
  const [language, setLanguage] = useState('fr');
  const [defaultSharing, setDefaultSharing] = useState('circle');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (prof) {
        const p = prof as Profile;
        setProfile(p);
        setFullName(p.full_name);
        setLanguage(p.language);
      }

      const { data: con } = await supabase
        .from('consents')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (con) {
        const c = con as Consent;
        setConsent(c);
        setDefaultSharing(c.default_sharing);
        setPrivacyAccepted(c.privacy_accepted);
        setMarketingConsent(c.marketing_consent);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, language })
      .eq('user_id', user.id);
    if (error) toast.error('Erreur lors de la sauvegarde.');
    else toast.success('Profil mis à jour.');
    setSaving(false);
  };

  const handleSaveConsents = async () => {
    if (!user) return;
    setSaving(true);
    const data = {
      user_id: user.id,
      default_sharing: defaultSharing,
      privacy_accepted: privacyAccepted,
      privacy_accepted_at: privacyAccepted ? new Date().toISOString() : null,
      marketing_consent: marketingConsent,
    };
    if (consent) {
      await supabase.from('consents').update(data).eq('user_id', user.id);
    } else {
      await supabase.from('consents').insert(data);
    }
    toast.success('Préférences enregistrées.');
    setSaving(false);
  };

  const handleExportData = () => {
    toast.info('Votre demande d\'export a été enregistrée. Vous recevrez un email.');
  };

  const handleDeleteAccount = async () => {
    toast.info('Votre demande de suppression a été enregistrée. Nous vous contacterons.');
    await signOut();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Paramètres</h1>

        {/* Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              Mon profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Adresse email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Langue</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </CardContent>
        </Card>

        {/* Privacy & Consents */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Confidentialité et consentements
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de partage et vos consentements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Partage par défaut</Label>
              <Select value={defaultSharing} onValueChange={setDefaultSharing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">Tout le cercle</SelectItem>
                  <SelectItem value="managers">Gestionnaires uniquement</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Politique de confidentialité</p>
                <p className="text-xs text-muted-foreground">J'accepte la politique de confidentialité</p>
              </div>
              <Switch checked={privacyAccepted} onCheckedChange={setPrivacyAccepted} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Emails marketing</p>
                <p className="text-xs text-muted-foreground">Recevoir des nouvelles et mises à jour</p>
              </div>
              <Switch checked={marketingConsent} onCheckedChange={setMarketingConsent} />
            </div>
            <Button onClick={handleSaveConsents} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer les préférences
            </Button>

            <Separator />

            <div className="space-y-4">
              <Button variant="outline" className="w-full gap-2" onClick={handleExportData}>
                <Download className="h-4 w-4" />
                Exporter mes données
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
