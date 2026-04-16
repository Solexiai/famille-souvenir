import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, User, Shield, Download, Trash2, Info, CreditCard } from 'lucide-react';
import type { Profile, Consent } from '@/types/database';
import { LANGUAGE_ORDER, LANGUAGE_LABELS } from '@/i18n/config';
import { MfaEnrollment } from '@/components/MfaEnrollment';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const SettingsPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t } = useLocale();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [fullName, setFullName] = useState('');
  const [language, setLanguage] = useState('fr');
  const [defaultSharing, setDefaultSharing] = useState('circle');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [billingLoading, setBillingLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('inactive');

  const deleteWord = t.settings_delete_confirm_word;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: prof } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (prof) {
        const p = prof as Profile;
        setProfile(p);
        setFullName(p.full_name);
        setLanguage(p.language);
      }
      const { data: con } = await supabase.from('consents').select('*').eq('user_id', user.id).single();
      const { data: sub } = await supabase.from('subscriptions').select('payment_state, subscription_status').eq('user_id', user.id).single();
      if (sub) {
        setSubscriptionStatus(sub.payment_state || sub.subscription_status || 'inactive');
      }
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
    const { error } = await supabase.from('profiles').update({ full_name: fullName, language }).eq('user_id', user.id);
    if (error) toast.error(t.settings_save_error);
    else toast.success(t.settings_save_success);
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
    toast.success(t.settings_consent_saved);
    setSaving(false);
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [
        { data: profileData }, { data: consentsData }, { data: circlesData },
        { data: membershipsData }, { data: documentsData }, { data: memoriesData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id),
        supabase.from('consents').select('*').eq('user_id', user.id),
        supabase.from('family_circles').select('*').eq('owner_id', user.id),
        supabase.from('circle_members').select('*').eq('user_id', user.id),
        supabase.from('documents').select('id, title, category, file_name, visibility, verification_status, created_at').eq('uploaded_by', user.id),
        supabase.from('memories').select('id, type, caption, visibility, created_at').eq('author_id', user.id),
      ]);
      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileData, consents: consentsData, circles_owned: circlesData,
        memberships: membershipsData, documents_uploaded: documentsData, memories_created: memoriesData,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solexi-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await supabase.from('audit_logs').insert({ user_id: user.id, action: 'data_export_requested', details: { timestamp: new Date().toISOString() } });
      toast.success(t.settings_export_success);
    } catch {
      toast.error(t.settings_export_error);
    }
    setExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== deleteWord) {
      toast.error(t.error_generic);
      return;
    }
    await supabase.from('audit_logs').insert({ user_id: user.id, action: 'account_deletion_requested', details: { timestamp: new Date().toISOString(), email: user.email } });
    toast.info(t.settings_delete_submitted);
    await signOut();
  };



  const openCheckout = async () => {
    if (!user) return;
    setBillingLoading(true);
    try {
      const { data: ownedCircle } = await supabase
        .from('family_circles')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!ownedCircle?.id) {
        toast.error('Vous devez être propriétaire du cercle pour souscrire.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { circleId: ownedCircle.id },
      });

      if (error || !data?.checkoutUrl) {
        toast.error('Impossible de démarrer le paiement.');
        return;
      }

      window.location.href = data.checkoutUrl;
    } finally {
      setBillingLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error || !data?.portalUrl) {
        toast.error('Portail de facturation indisponible.');
        return;
      }
      window.location.href = data.portalUrl;
    } finally {
      setBillingLoading(false);
    }
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
        <h1 className="font-heading text-2xl font-semibold text-foreground">{t.settings_title}</h1>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              {t.settings_profile}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t.settings_full_name}</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t.settings_email}</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>{t.settings_language}</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_ORDER.map(l => (
                    <SelectItem key={l} value={l}>{LANGUAGE_LABELS[l]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.save}
            </Button>
          </CardContent>
        </Card>

        <MfaEnrollment />

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" />
              Facturation
            </CardTitle>
            <CardDescription>
              Statut actuel: <span className="font-medium">{subscriptionStatus}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={openCheckout} disabled={billingLoading} className="w-full">
              {billingLoading && <Loader2 className="h-4 w-4 animate-spin" />} Passer au plan annuel
            </Button>
            <Button variant="outline" onClick={openBillingPortal} disabled={billingLoading} className="w-full">
              Gérer mon abonnement Stripe
            </Button>
          </CardContent>
        </Card>


        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              {t.settings_privacy_title}
            </CardTitle>
            <CardDescription>{t.settings_privacy_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t.settings_default_sharing}</Label>
              <Select value={defaultSharing} onValueChange={setDefaultSharing}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">{t.settings_sharing_circle}</SelectItem>
                  <SelectItem value="managers">{t.settings_sharing_managers}</SelectItem>
                  <SelectItem value="private">{t.settings_sharing_private}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t.settings_privacy_policy}</p>
                <p className="text-xs text-muted-foreground">{t.settings_privacy_accept}</p>
              </div>
              <Switch checked={privacyAccepted} onCheckedChange={setPrivacyAccepted} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t.settings_marketing}</p>
                <p className="text-xs text-muted-foreground">{t.settings_marketing_desc}</p>
              </div>
              <Switch checked={marketingConsent} onCheckedChange={setMarketingConsent} />
            </div>
            <Button onClick={handleSaveConsents} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.settings_save_preferences}
            </Button>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full gap-2" onClick={handleExportData} disabled={exporting}>
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {t.settings_export_data}
                </Button>
                <p className="text-xs text-muted-foreground">{t.settings_export_desc}</p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t.settings_delete_account}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">{t.settings_delete_title}</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <span className="block">{t.settings_delete_desc}</span>
                      <span className="block font-medium">{t.settings_delete_warning}</span>
                      <span className="block text-sm" dangerouslySetInnerHTML={{ __html: t.settings_delete_type_prompt.replace('{word}', deleteWord) }} />
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={deleteWord}
                    className="mt-2"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} disabled={deleteConfirmText !== deleteWord}>
                      {t.settings_delete_confirm_btn}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Alert className="border-amber-200 bg-amber-50">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-800">{t.settings_delete_alert}</AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
