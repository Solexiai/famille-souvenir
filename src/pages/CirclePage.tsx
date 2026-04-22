import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';
import type { FamilyCircle, AppRole } from '@/types/database';
import { DocumentaryStatusManager } from '@/components/DocumentaryStatusManager';
import { canEditDocumentaryStatus } from '@/components/PermissionMatrix';
import { z } from 'zod';

const CirclePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  const circleSchema = z.object({
    name: z.string().trim().min(2, t.circle_validation_min).max(100),
    description: z.string().max(500).optional(),
  });

  const loadCircle = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('family_circles')
      .select('*')
      .limit(1);
    if (data && data.length > 0) {
      const c = data[0] as FamilyCircle;
      setCircle(c);
      setName(c.name);
      setDescription(c.description || '');

      const { data: memberData } = await supabase
        .from('circle_members')
        .select('role')
        .eq('circle_id', c.id)
        .eq('user_id', user.id)
        .limit(1);
      if (memberData && memberData.length > 0) {
        setUserRole(memberData[0].role as AppRole);
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadCircle(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = circleSchema.safeParse({ name, description });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    if (!user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('family_circles')
      .insert({ name, description, owner_id: user.id })
      .select()
      .single();

    if (error) { toast.error(t.circle_create_error); setSaving(false); return; }

    await supabase.from('circle_members').insert({ circle_id: data.id, user_id: user.id, role: 'owner' as const });

    toast.success(t.circle_create_success);
    setCircle(data as FamilyCircle);
    setUserRole('owner');
    setSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle) return;
    const result = circleSchema.safeParse({ name, description });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }
    setSaving(true);
    const { error } = await supabase
      .from('family_circles')
      .update({ name, description })
      .eq('id', circle.id);

    if (error) {
      toast.error(t.circle_update_error);
    } else {
      toast.success(t.circle_update_success);
      setCircle({ ...circle, name, description });
      setEditing(false);
    }
    setSaving(false);
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
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 space-y-6 animate-fade-in">
        <h1 className="font-heading text-2xl font-semibold text-foreground">{t.circle_page_title}</h1>

        {!circle ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">{t.circle_create_title}</CardTitle>
              <CardDescription>{t.circle_create_subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.circle_name_input}</Label>
                  <Input id="name" placeholder={t.onboarding_circle_name_placeholder} value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t.circle_desc_input_optional}</Label>
                  <Textarea id="description" placeholder={t.circle_desc_default_placeholder} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <Button type="submit" size="lg" disabled={saving} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.circle_create_btn_long}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : editing ? (
          <Card className="shadow-card">
            <CardHeader><CardTitle className="font-heading text-lg">{t.circle_edit_title}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.circle_name_label}</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t.circle_desc_label}</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{t.circle_save}</Button>
                  <Button type="button" variant="outline" onClick={() => { setEditing(false); setName(circle.name); setDescription(circle.description || ''); }}>{t.circle_cancel}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                {circle.name}
              </CardTitle>
              <CardDescription>{circle.description || t.circle_default_card_desc}</CardDescription>
            </CardHeader>
            <CardContent>
              {circle.owner_id === user?.id && (
                <Button variant="outline" onClick={() => setEditing(true)}>{t.circle_edit_btn}</Button>
              )}
            </CardContent>
          </Card>
        )}

        {circle && (
          <DocumentaryStatusManager
            circle={circle}
            canEdit={canEditDocumentaryStatus(userRole)}
            onUpdate={(updated) => setCircle({ ...circle!, ...updated } as FamilyCircle)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default CirclePage;
