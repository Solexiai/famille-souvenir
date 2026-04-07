import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Image, Lock, UserPlus, Settings, Plus } from 'lucide-react';
import type { FamilyCircle, Memory, VaultDocument } from '@/types/database';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [recentDocs, setRecentDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Load profile name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();
      if (profile) setProfileName(profile.full_name || user.email?.split('@')[0] || '');

      // Load first circle
      const { data: circles } = await supabase
        .from('family_circles')
        .select('*')
        .limit(1);
      
      if (circles && circles.length > 0) {
        const c = circles[0] as FamilyCircle;
        setCircle(c);

        // Load member count
        const { count } = await supabase
          .from('circle_members')
          .select('*', { count: 'exact', head: true })
          .eq('circle_id', c.id);
        setMemberCount(count || 0);

        // Load recent memories
        const { data: memories } = await supabase
          .from('memories')
          .select('*')
          .eq('circle_id', c.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setRecentMemories((memories as Memory[]) || []);

        // Load recent vault docs
        const { data: docs } = await supabase
          .from('vault_documents')
          .select('*')
          .eq('circle_id', c.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setRecentDocs((docs as VaultDocument[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const quickActions = [
    { label: 'Nouveau souvenir', icon: Plus, action: () => navigate('/memories'), color: 'text-accent' },
    { label: 'Inviter un membre', icon: UserPlus, action: () => navigate('/circle/members'), color: 'text-accent' },
    { label: 'Coffre-fort', icon: Lock, action: () => navigate('/vault'), color: 'text-accent' },
    { label: 'Paramètres', icon: Settings, action: () => navigate('/settings'), color: 'text-muted-foreground' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Bonjour, {profileName || 'cher membre'} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenue dans votre espace familial sécurisé.
          </p>
        </div>

        {/* Circle summary or create */}
        {!loading && !circle && (
          <Card className="shadow-card border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-accent mb-4" />
              <h2 className="font-heading text-xl font-medium text-foreground">
                Créez votre cercle familial
              </h2>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Commencez par créer un cercle pour rassembler vos proches et partager vos souvenirs en toute sécurité.
              </p>
              <Button size="lg" className="mt-6" onClick={() => navigate('/circle')}>
                Créer mon cercle
              </Button>
            </CardContent>
          </Card>
        )}

        {circle && (
          <>
            {/* Circle info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent" />
                  {circle.name}
                </CardTitle>
                <CardDescription>{circle.description || 'Votre cercle familial'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {memberCount} membre{memberCount !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.label}
                    className="shadow-soft cursor-pointer hover:shadow-card transition-shadow"
                    onClick={action.action}
                  >
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                      <Icon className={`h-8 w-8 ${action.color} mb-2`} />
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent memories */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Image className="h-5 w-5 text-accent" />
                  Souvenirs récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentMemories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun souvenir pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {recentMemories.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{m.caption || 'Sans titre'}</p>
                          <p className="text-xs text-muted-foreground">
                            {m.type} · {new Date(m.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/memories')}>
                  Voir tous les souvenirs
                </Button>
              </CardContent>
            </Card>

            {/* Recent vault docs */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent" />
                  Documents récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun document dans le coffre-fort.</p>
                ) : (
                  <div className="space-y-3">
                    {recentDocs.map((d) => (
                      <div key={d.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{d.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {d.category} · {new Date(d.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="mt-4 w-full" onClick={() => navigate('/vault')}>
                  Ouvrir le coffre-fort
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
