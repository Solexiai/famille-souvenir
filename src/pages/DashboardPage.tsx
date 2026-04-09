import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, FolderOpen, CheckSquare, Shield, Briefcase, Image, UserPlus, AlertTriangle, FileCheck, UserCheck, ChevronRight, CircleDot } from 'lucide-react';
import type { FamilyCircle, ChecklistItem, GovernanceResponsibility, DocumentaryStatus, AppRole, MemberFamilyLabel, CircleMember } from '@/types/database';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, terms } = useLocale();
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

  const docStatusLabel = (s: DocumentaryStatus) => {
    const m: Record<string, string> = {
      unknown: t.doc_status_unknown, declared: t.doc_status_declared,
      located: t.doc_status_located, professionally_confirmed: t.doc_status_confirmed,
    };
    return m[s] || s;
  };
  const docStatusColor = (s: DocumentaryStatus) => {
    if (s === 'unknown') return 'bg-muted text-muted-foreground';
    if (s === 'declared') return 'bg-amber-100 text-amber-800';
    if (s === 'located') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const dossierLabel = (status: string) => {
    const labels: Record<string, string> = {
      initial: t.dossier_initial, in_progress: t.dossier_in_progress, partial: t.dossier_partial,
      ready_for_professional_review: t.dossier_ready_review, executor_ready: t.dossier_executor_ready,
    };
    return labels[status] || status;
  };

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

        const [{ data: labelsData }, { data: membersRaw }] = await Promise.all([
          supabase.from('member_family_labels').select('*').eq('circle_id', c.id),
          supabase.from('circle_members').select('*').eq('circle_id', c.id),
        ]);
        const allLabels = (labelsData as MemberFamilyLabel[]) || [];
        const allMembersRaw = (membersRaw as CircleMember[]) || [];
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
          verified: verifiedMember ? (profileMap.get(verifiedMember.user_id)?.full_name || t.doc_status_confirmed) : null,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const executorLabel = terms.executor.charAt(0).toUpperCase() + terms.executor.slice(1);

  const quickActions = [
    { label: t.dash_documents, icon: FolderOpen, action: () => navigate('/documents'), color: 'text-blue-600' },
    { label: t.dash_governance, icon: Shield, action: () => navigate('/governance'), color: 'text-emerald-600' },
    { label: t.dash_checklist, icon: CheckSquare, action: () => navigate('/checklist'), color: 'text-violet-600' },
    { label: t.dash_memories, icon: Image, action: () => navigate('/memories'), color: 'text-rose-500' },
    { label: executorLabel, icon: Briefcase, action: () => navigate('/executor'), color: 'text-amber-600', roles: ['owner', 'family_manager', 'proposed_executor', 'verified_executor'] as AppRole[] },
    { label: t.members, icon: UserPlus, action: () => navigate('/circle/members'), color: 'text-cyan-600', roles: ['owner', 'family_manager'] as AppRole[] },
  ];

  const visibleActions = quickActions.filter(a => !a.roles || !userRole || a.roles.includes(userRole));

  const checklistProgress = checklistSummary.total > 0 ? Math.round((checklistSummary.completed / checklistSummary.total) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Greeting */}
        <div className="space-y-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-foreground leading-tight">
            {t.dash_greeting.replace('{name}', profileName || t.dash_greeting_default)}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t.dash_subtitle}</p>
        </div>

        {/* No circle CTA */}
        {!loading && !circle && (
          <Card className="shadow-card border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-accent mb-4" />
              <h2 className="font-heading text-xl font-medium text-foreground">{t.dash_create_circle}</h2>
              <p className="mt-2 text-muted-foreground max-w-sm">{t.dash_create_circle_desc}</p>
              <Button size="lg" className="mt-6" onClick={() => navigate('/circle')}>{t.dash_create_circle_btn}</Button>
            </CardContent>
          </Card>
        )}

        {circle && (
          <>
            {/* Stats row — stacked on mobile, side by side on tablet+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-4 py-4 px-4">
                  <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold text-foreground leading-none">{memberCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{memberCount !== 1 ? t.members : t.member}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-4 py-4 px-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold text-foreground leading-none">{docCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.dash_documents}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="flex items-center gap-4 py-4 px-4">
                  <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <CheckSquare className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-2xl font-semibold text-foreground leading-none">{checklistSummary.completed}</p>
                      <p className="text-sm text-muted-foreground">/ {checklistSummary.total}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t.dash_checklist}</p>
                    {checklistSummary.total > 0 && (
                      <Progress value={checklistProgress} className="mt-2 h-1.5" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts row */}
            {(checklistSummary.needsReview > 0 || checklistSummary.blocked > 0 || checklistSummary.proReview > 0) && (
              <div className="flex flex-wrap gap-2">
                {checklistSummary.needsReview > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 py-1 px-3 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    {t.dash_to_verify.replace('{count}', String(checklistSummary.needsReview))}
                  </Badge>
                )}
                {checklistSummary.blocked > 0 && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 py-1 px-3 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    {t.dash_blocked.replace('{count}', String(checklistSummary.blocked))}
                  </Badge>
                )}
                {checklistSummary.proReview > 0 && (
                  <Badge variant="outline" className="bg-secondary text-muted-foreground border-border gap-1.5 py-1 px-3 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    {t.dash_pro_review_required.replace('{count}', String(checklistSummary.proReview))}
                  </Badge>
                )}
              </div>
            )}

            {/* Dossier status — full width, clean layout */}
            <Card className="shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-accent" />
                  <h3 className="font-heading text-sm font-semibold text-foreground">{t.dash_documentary_prep}</h3>
                </div>
                <Badge variant="outline" className="text-[11px]">{dossierLabel(circle.dossier_readiness_status)}</Badge>
              </div>
              <CardContent className="pt-2 pb-4 px-4 sm:px-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                  {[
                    { label: t.doc_status_testament, value: circle.testament_status },
                    { label: t.doc_status_mandate, value: circle.mandate_status },
                    { label: t.doc_status_notary, value: circle.notary_status },
                    { label: t.doc_status_beneficiaries, value: circle.beneficiary_designation_status },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center text-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground leading-tight">{item.label}</span>
                      <Badge className={`text-[11px] px-2 py-0.5 ${docStatusColor(item.value as DocumentaryStatus)}`}>
                        {docStatusLabel(item.value as DocumentaryStatus)}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/circle')} className="w-full mt-4 text-xs text-accent hover:text-accent/80">
                  {t.dash_manage_statuses} <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Governance summary */}
            {govSummary.total > 0 && (
              <Card className="shadow-card">
                <CardContent className="py-4 px-4 sm:px-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-accent" />
                      <h3 className="font-heading text-sm font-semibold text-foreground">{t.dash_governance}</h3>
                    </div>
                    <span className="text-sm font-medium text-foreground">{t.dash_completed.replace('{count}', `${govSummary.completed}/${govSummary.total}`)}</span>
                  </div>
                  {(govSummary.blocked > 0 || govSummary.needsAttention > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {govSummary.blocked > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 text-xs py-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          {t.dash_blocked.replace('{count}', String(govSummary.blocked))}
                        </Badge>
                      )}
                      {govSummary.needsAttention > 0 && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs py-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          {t.dash_attention_required.replace('{count}', String(govSummary.needsAttention))}
                        </Badge>
                      )}
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => navigate('/governance')} className="w-full text-xs text-accent hover:text-accent/80">
                    {t.dash_view_governance} <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Executor summary */}
            {(executorSummary.proposed || executorSummary.testamentNamed || executorSummary.verified) && (
              <Card className="shadow-card">
                <CardContent className="py-4 px-4 sm:px-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-accent" />
                    <h3 className="font-heading text-sm font-semibold text-foreground">{t.dash_executor_summary}</h3>
                  </div>
                  <div className="space-y-2">
                    {executorSummary.proposed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.dash_proposed_executor}</span>
                        <span className="font-medium text-foreground">{executorSummary.proposed}</span>
                      </div>
                    )}
                    {executorSummary.testamentNamed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.dash_testament_named}</span>
                        <span className="font-medium text-foreground">{executorSummary.testamentNamed}</span>
                      </div>
                    )}
                    {executorSummary.verified && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t.dash_verified_access}</span>
                        <Badge variant="outline" className="text-xs">{executorSummary.verified}</Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.dash_executor_confirm}</p>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/circle/members')} className="w-full text-xs text-accent hover:text-accent/80">
                    {t.dash_view_designations} <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick actions — 3 cols on mobile, clean icons */}
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Accès rapide</h3>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
                {visibleActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 sm:p-4 hover:border-accent/40 hover:shadow-card transition-all duration-200"
                    >
                      <div className="h-10 w-10 rounded-xl bg-secondary/80 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <span className="text-[11px] sm:text-xs font-medium text-foreground text-center leading-tight">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
