import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, CheckSquare, Shield, Briefcase, Image, Plus, UserPlus, Settings, AlertTriangle } from 'lucide-react';
import type { FamilyCircle, ChecklistItem } from '@/types/database';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [checklistSummary, setChecklistSummary] = useState({ total: 0, completed: 0, needsReview: 0 });
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single();
      if (profile) setProfileName(profile.full_name || user.email?.split('@')[0] || '');

      const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
      if (circles && circles.length > 0) {
        const c = circles[0] as FamilyCircle;
        setCircle(c);

        const [{ count: mc }, { count: dc }, { data: clData }] = await Promise.all([
          supabase.from('circle_members').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('checklist_items').select('*').eq('circle_id', c.id),
        ]);
        setMemberCount(mc || 0);
        setDocCount(dc || 0);
        const items = (clData as ChecklistItem[]) || [];
        setChecklistSummary({
          total: items.length,
          completed: items.filter(i => i.status === 'completed').length,
          needsReview: items.filter(i => i.status === 'needs_review').length,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const dossierLabel = (status: string) => {
    const labels: Record<string, string> = {
      initial: 'Initial', in_progress: 'En cours', partial: 'Partiel',
      ready_for_professional_review: 'Prêt pour révision', executor_ready: 'Prêt',
    };
    return labels[status] || status;
  };

  const quickActions = [
    { label: 'Documents', icon: FolderOpen, action: () => navigate('/documents') },
    { label: 'Gouvernance', icon: Shield, action: () => navigate('/governance') },
    { label: 'Checklist', icon: CheckSquare, action: () => navigate('/checklist') },
    { label: 'Souvenirs', icon: Image, action: () => navigate('/memories') },
    { label: 'Exécuteur', icon: Briefcase, action: () => navigate('/executor') },
    { label: 'Membres', icon: UserPlus, action: () => navigate('/circle/members') },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Bonjour, {profileName || 'cher membre'} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenue dans votre espace de préparation et de protection familiale.
          </p>
        </div>

        {!loading && !circle && (
          <Card className="shadow-card border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-accent mb-4" />
              <h2 className="font-heading text-xl font-medium text-foreground">Créez votre cercle familial</h2>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Commencez par créer un cercle pour organiser la protection et la préparation de votre famille.
              </p>
              <Button size="lg" className="mt-6" onClick={() => navigate('/circle')}>Créer mon cercle</Button>
            </CardContent>
          </Card>
        )}

        {circle && (
          <>
            {/* Circle + dossier status */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    {circle.name}
                  </CardTitle>
                  <CardDescription>{circle.description || 'Votre cercle familial'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{memberCount} membre{memberCount !== 1 ? 's' : ''}</p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg">État du dossier</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Préparation</span>
                    <Badge variant="outline">{dossierLabel(circle.dossier_readiness_status)}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Documents</span>
                    <span className="text-sm font-medium">{docCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Checklist</span>
                    <span className="text-sm font-medium">{checklistSummary.completed}/{checklistSummary.total}</span>
                  </div>
                  {checklistSummary.needsReview > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      {checklistSummary.needsReview} élément{checklistSummary.needsReview > 1 ? 's' : ''} à vérifier
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card key={action.label} className="shadow-soft cursor-pointer hover:shadow-card transition-shadow" onClick={action.action}>
                    <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                      <Icon className="h-8 w-8 text-accent mb-2" />
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
