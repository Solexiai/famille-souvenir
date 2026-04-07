import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';
import type { FamilyCircle } from '@/types/database';
import { z } from 'zod';

const circleSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  description: z.string().max(500).optional(),
});

const CirclePage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

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
    }
    setLoading(false);
  };

  useEffect(() => { loadCircle(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = circleSchema.safeParse({ name, description });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (!user) return;
    setSaving(true);

    const { data, error } = await supabase
      .from('family_circles')
      .insert({ name, description, owner_id: user.id })
      .select()
      .single();

    if (error) {
      toast.error('Erreur lors de la création du cercle.');
      setSaving(false);
      return;
    }

    // Add owner as member
    await supabase
      .from('circle_members')
      .insert({ circle_id: data.id, user_id: user.id, role: 'owner' as const });

    toast.success('Cercle familial créé avec succès !');
    setCircle(data as FamilyCircle);
    setSaving(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle) return;
    const result = circleSchema.safeParse({ name, description });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('family_circles')
      .update({ name, description })
      .eq('id', circle.id);

    if (error) {
      toast.error('Erreur lors de la mise à jour.');
    } else {
      toast.success('Cercle mis à jour.');
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
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Cercle familial</h1>

        {!circle ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Créer votre cercle</CardTitle>
              <CardDescription>
                Rassemblez vos proches dans un espace sécurisé pour partager souvenirs et documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du cercle</Label>
                  <Input
                    id="name"
                    placeholder="Famille Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Notre espace familial pour préserver nos souvenirs..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button type="submit" size="lg" disabled={saving} className="w-full">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer le cercle
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : editing ? (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Modifier le cercle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setEditing(false); setName(circle.name); setDescription(circle.description || ''); }}>
                    Annuler
                  </Button>
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
              <CardDescription>{circle.description || 'Votre cercle familial'}</CardDescription>
            </CardHeader>
            <CardContent>
              {circle.owner_id === user?.id && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Modifier
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default CirclePage;
