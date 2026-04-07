import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, CheckSquare, Shield, Briefcase, Image, UserPlus, AlertTriangle, FileCheck, UserCheck } from 'lucide-react';
import type { FamilyCircle, ChecklistItem, GovernanceResponsibility, DocumentaryStatus, AppRole, MemberFamilyLabel, CircleMember } from '@/types/database';
import { familyLabelsFr } from '@/components/FamilyLabelsManager';

const docStatusLabel = (s: DocumentaryStatus) => {
  const m: Record<DocumentaryStatus, string> = { unknown: 'Inconnu', declared: 'Déclaré', located: 'Localisé', professionally_confirmed: 'Confirmé' };
  return m[s] || s;
};
const docStatusColor = (s: DocumentaryStatus) => {
  if (s === 'unknown') return 'bg-muted text-muted-foreground';
  if (s === 'declared') return 'bg-amber-100 text-amber-800';
  if (s === 'located') return 'bg-blue-100 text-blue-800';
  return 'bg-green-100 text-green-800';
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [checklistSummary, setChecklistSummary] = useState({ total: 0, completed: 0, needsReview: 0, blocked: 0, proReview: 0 });
  const [govSummary, setGovSummary] = useState({ total: 0, completed: 0, blocked: 0, needsAttention: 0 });
  const [executorSummary, setExecutorSummary] = useState<{ proposed: string | null; testamentNamed: string | null; verified: string | null }>({ proposed: null, testamentNamed: null, verified: null });
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single();
      if (profile) setProfileName(profile.full_name || user.email?.split('@')[0] || '');

      const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
      if (circles && circles.length > 0) {
        const c = circles[0] as FamilyCircle;
        setCircle(c);

        const [{ count: mc }, { count: dc }, { data: clData }, { data: memberData }, { data: govData }] = await Promise.all([
          supabase.from('circle_members').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('checklist_items').select('*').eq('circle_id', c.id),
          supabase.from('circle_members').select('role').eq('circle_id', c.id).eq('user_id', user.id).limit(1),
          supabase.from('governance_responsibilities').select('*').eq('circle_id', c.id),
        ]);
        setMemberCount(mc || 0);
        setDocCount(dc || 0);
        if (memberData && memberData.length > 0) setUserRole(memberData[0].role as AppRole);
        const items = (clData as ChecklistItem[]) || [];
        setChecklistSummary({
          total: items.length,
          completed: items.filter(i => i.status === 'completed').length,
          needsReview: items.filter(i => i.status === 'needs_review').length,
          blocked: items.filter(i => i.status === 'blocked').length,
          proReview: items.filter(i => i.requires_professional_review && i.status !== 'completed').length,
        });
        const govItems = (govData as GovernanceResponsibility[]) || [];
        setGovSummary({
          total: govItems.length,
          completed: govItems.filter(i => i.status === 'completed').length,
          blocked: govItems.filter(i => i.status === 'blocked').length,
          needsAttention: govItems.filter(i => i.status === 'needs_attention').length,
        });

        // Load executor designation summary
        const [{ data: labelsData }, { data: membersRaw }] = await Promise.all([
          supabase.from('member_family_labels').select('*').eq('circle_id', c.id),
          supabase.from('circle_members').select('*').eq('circle_id', c.id),
        ]);
        const allLabels = (labelsData as MemberFamilyLabel[]) || [];
        const allMembersRaw = (membersRaw as CircleMember[]) || [];

        // Load profiles for members
        const profileIds = allMembersRaw.map(m => m.user_id);
        const { data: profilesData } = await supabase.from('profiles').select('user_id, full_name, email').in('user_id', profileIds);
        const profileMap = new Map((profilesData || []).map(p => [p.user_id, p]));

        const getMName = (memberId: string) => {
          const m = allMembersRaw.find(m => m.id === memberId);
          if (!m) return null;
          const p = profileMap.get(m.user_id);
          return p?.full_name || p?.email || null;
        };

        const proposedLabel = allLabels.find(l => l.label === 'proposed_executor_label');
        const testamentLabel = allLabels.find(l => l.label === 'testament_named_executor');
        const verifiedMember = allMembersRaw.find(m => m.role === 'verified_executor');

        setExecutorSummary({
          proposed: proposedLabel ? getMName(proposedLabel.member_id) : null,
          testamentNamed: testamentLabel ? getMName(testamentLabel.member_id) : null,
          verified: verifiedMember ? (profileMap.get(verifiedMember.user_id)?.full_name || 'Vérifié') : null,
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
    { label: 'Exécuteur', icon: Briefcase, action: () => navigate('/executor'), roles: ['owner', 'family_manager', 'proposed_executor', 'verified_executor'] as AppRole[] },
    { label: 'Membres', icon: UserPlus, action: () => navigate('/circle/members'), roles: ['owner', 'family_manager'] as AppRole[] },
  ];

  const visibleActions = quickActions.filter(a => !a.roles || !userRole || a.roles.includes(userRole));

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
                      {checklistSummary.needsReview} à vérifier
                    </div>
                  )}
                  {checklistSummary.blocked > 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      {checklistSummary.blocked} bloqué{checklistSummary.blocked > 1 ? 's' : ''}
                    </div>
                  )}
                  {checklistSummary.proReview > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-4 w-4" />
                      {checklistSummary.proReview} revue pro requise
                     </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Documentary status summary */}
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-accent" />
                  Préparation documentaire
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble des statuts déclarés. Indicatif — ne constitue pas une validation juridique.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Testament', value: circle.testament_status },
                    { label: 'Mandat', value: circle.mandate_status },
                    { label: 'Notaire', value: circle.notary_status },
                    { label: 'Bénéficiaires', value: circle.beneficiary_designation_status },
                  ].map((item) => (
                    <div key={item.label} className="text-center space-y-1">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <Badge className={`text-xs ${docStatusColor(item.value as DocumentaryStatus)}`}>
                        {docStatusLabel(item.value as DocumentaryStatus)}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-right">
                  <Button variant="link" size="sm" onClick={() => navigate('/circle')} className="text-xs">
                    Gérer les statuts →
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Governance summary */}
            {govSummary.total > 0 && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-accent" />
                    Gouvernance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Responsabilités</span>
                    <span className="text-sm font-medium">{govSummary.completed}/{govSummary.total} complétées</span>
                  </div>
                  {govSummary.blocked > 0 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      {govSummary.blocked} bloquée{govSummary.blocked > 1 ? 's' : ''}
                    </div>
                  )}
                  {govSummary.needsAttention > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      {govSummary.needsAttention} attention requise
                    </div>
                  )}
                  <div className="text-right">
                    <Button variant="link" size="sm" onClick={() => navigate('/governance')} className="text-xs">
                      Voir la gouvernance →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Executor designation summary */}
            {(executorSummary.proposed || executorSummary.testamentNamed || executorSummary.verified) && (
              <Card className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-accent" />
                    Exécuteur — Résumé
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {executorSummary.proposed && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Exécuteur pressenti</span>
                      <span className="text-sm font-medium">{executorSummary.proposed}</span>
                    </div>
                  )}
                  {executorSummary.testamentNamed && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Nommé au testament</span>
                      <span className="text-sm font-medium">{executorSummary.testamentNamed}</span>
                    </div>
                  )}
                  {executorSummary.verified && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Accès vérifié</span>
                      <Badge variant="outline" className="text-xs">{executorSummary.verified}</Badge>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">
                    À confirmer selon les documents et les vérifications applicables.
                  </p>
                  <div className="text-right">
                    <Button variant="link" size="sm" onClick={() => navigate('/circle/members')} className="text-xs">
                      Voir les désignations →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {visibleActions.map((action) => {
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
