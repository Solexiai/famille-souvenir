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
import { Users, FolderOpen, CheckSquare, Shield, Briefcase, Image, UserPlus, AlertTriangle, FileCheck, UserCheck, ChevronRight, Sparkles, Camera, Check, ArrowRight, Heart, Lock, Scan } from 'lucide-react';
import type { FamilyCircle, ChecklistItem, GovernanceResponsibility, DocumentaryStatus, AppRole, MemberFamilyLabel, CircleMember } from '@/types/database';
import { AI_COPY, type AILang } from '@/lib/ai-assistant-i18n';
import { GuidedOnboarding } from '@/components/GuidedOnboarding';
import { DemoTour } from '@/components/DemoTour';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, lang } = useLocale();
  const aiLang: AILang = (['fr', 'en', 'es'].includes(lang) ? lang : 'en') as AILang;
  const aiT = AI_COPY[aiLang];
  const navigate = useNavigate();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [docCount, setDocCount] = useState(0);
  const [memoryCount, setMemoryCount] = useState(0);
  const [invitationCount, setInvitationCount] = useState(0);
  const [checklistSummary, setChecklistSummary] = useState({ total: 0, completed: 0, needsReview: 0, blocked: 0, proReview: 0 });
  const [govSummary, setGovSummary] = useState({ total: 0, completed: 0, blocked: 0, needsAttention: 0 });
  const [executorSummary, setExecutorSummary] = useState<{ proposed: string | null; testamentNamed: string | null; verified: string | null }>({ proposed: null, testamentNamed: null, verified: null });
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('');
  const [, setUserRole] = useState<AppRole | null>(null);
  const [showGuided, setShowGuided] = useState(false);

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
      const { data: profile } = await supabase.from('profiles').select('full_name, guided_onboarding_completed_at').eq('user_id', user.id).single();
      if (profile) setProfileName(profile.full_name || user.email?.split('@')[0] || '');
      const onboardingDone = !!profile?.guided_onboarding_completed_at;

      let { data: circles } = await supabase.from('family_circles').select('*').limit(1);

      // Auto-create a default circle for first-time users so the guided onboarding modal
      // can run immediately (without forcing them through the /circle page first).
      if ((!circles || circles.length === 0) && !onboardingDone) {
        const defaultName = (profile?.full_name?.split(' ')?.[0]
          ? `${t.app_name} · ${profile.full_name.split(' ')[0]}`
          : t.app_name);
        const { data: newCircle } = await supabase
          .from('family_circles')
          .insert({ name: defaultName, owner_id: user.id })
          .select()
          .single();
        if (newCircle) circles = [newCircle];
      }

      if (circles && circles.length > 0) {
        const c = circles[0] as FamilyCircle;
        setCircle(c);

        const [{ count: mc }, { count: dc }, { count: memC }, { count: invC }, { data: clData }, { data: memberData }, { data: govData }] = await Promise.all([
          supabase.from('circle_members').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('memories').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('circle_id', c.id),
          supabase.from('checklist_items').select('*').eq('circle_id', c.id),
          supabase.from('circle_members').select('role').eq('circle_id', c.id).eq('user_id', user.id).limit(1),
          supabase.from('governance_responsibilities').select('*').eq('circle_id', c.id),
        ]);
        setMemberCount(mc || 0);
        setDocCount(dc || 0);
        setMemoryCount(memC || 0);
        setInvitationCount(invC || 0);
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
      // Trigger AI-guided onboarding on first dashboard visit (owners only, once per user)
      if (circles && circles.length > 0 && !onboardingDone && circles[0].owner_id === user.id) {
        setShowGuided(true);
      }
      setLoading(false);
    };
    load();
  }, [user, t.app_name, t.doc_status_confirmed]);

  // executorLabel & checklistProgress reserved for future use

  // Compute next incomplete journey step (used by hero "Continue" CTA)
  const computeNextRoute = (): string => {
    if (!circle) return '/circle';
    if (memberCount <= 1 && invitationCount === 0) return '/circle/members';
    if (govSummary.total === 0) return '/governance';
    if (docCount === 0) return '/documents';
    if (memoryCount === 0) return '/memories';
    return '/checklist';
  };

  // Overall progress (UI only, derived from real engagement signals)
  const overallProgress = (() => {
    if (!circle) return 0;
    const flags = [
      true, // circle exists
      memberCount > 1 || invitationCount > 0,
      govSummary.total > 0,
      docCount > 0,
      memoryCount > 0,
      checklistSummary.completed > 0,
    ];
    return Math.round((flags.filter(Boolean).length / flags.length) * 100);
  })();

  // Status helpers for journey steps
  type StepStatus = 'done' | 'in_progress' | 'todo';
  const statusBadge = (s: StepStatus) => {
    const map: Record<StepStatus, { label: string; cls: string }> = {
      done:        { label: t.dash_step_status_done ?? 'Terminé',   cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      in_progress: { label: t.dash_step_status_in_progress ?? 'En cours', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
      todo:        { label: t.dash_step_status_todo ?? 'À faire',   cls: 'bg-muted text-muted-foreground border-border' },
    };
    return map[s];
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary to-[hsl(220,45%,18%)] text-primary-foreground shadow-elevated">
          {/* warm decorative glows */}
          <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_70%_50%,hsl(35_60%_55%/0.18),transparent_60%)]" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />

          <div className="relative px-6 sm:px-10 py-10 sm:py-14 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.22em] text-accent mb-3">
                {t.app_name} · {t.app_tagline}
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.08] max-w-2xl">
                {t.dash_greeting.replace('{name}', profileName || t.dash_greeting_default)}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
                {t.dash_hero_subtitle_v2 ?? t.dash_subtitle}
              </p>
              <p className="mt-2 text-sm text-accent/90 italic">
                {t.dash_hero_supporting ?? ''}
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => navigate(computeNextRoute())}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-7 h-12 text-base font-medium shadow-lg shadow-accent/20 gap-2"
                >
                  <ArrowRight className="h-5 w-5" />
                  {t.dash_hero_cta_continue ?? 'Continuer mon parcours'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/documents')}
                  className="rounded-full px-7 h-12 text-base font-medium bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground gap-2"
                >
                  <FolderOpen className="h-5 w-5" />
                  {t.dash_hero_cta_documents ?? 'Voir mes documents'}
                </Button>
              </div>

              <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-primary-foreground/10 backdrop-blur px-4 py-2 border border-primary-foreground/15">
                <Shield className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs sm:text-sm text-primary-foreground/85">
                  {t.dash_hero_badge ?? 'Simple • Sécurisé • Accessible à votre famille'}
                </span>
              </div>
            </div>

            {/* Progress card */}
            <div className="relative">
              <div className="rounded-2xl bg-primary-foreground/[0.07] backdrop-blur-md border border-primary-foreground/15 p-5 sm:p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/70">
                    {t.dash_hero_progress_label ?? 'Progression globale'}
                  </p>
                  <span className="font-heading text-3xl sm:text-4xl font-semibold text-accent leading-none">
                    {overallProgress}<span className="text-lg ml-0.5">%</span>
                  </span>
                </div>
                <Progress value={overallProgress} className="h-2 bg-primary-foreground/15 [&>div]:bg-accent" />
                {circle && checklistSummary.total > 0 && (
                  <p className="mt-3 text-xs text-primary-foreground/70 leading-relaxed">
                    {t.dash_completed.replace('{count}', `${checklistSummary.completed}/${checklistSummary.total}`)} · {dossierLabel(circle.dossier_readiness_status)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============ NO CIRCLE CTA ============ */}
        {!loading && !circle && (
          <Card className="shadow-card border-dashed border-2 border-accent/40 bg-card">
            <CardContent className="flex flex-col items-center justify-center py-14 text-center">
              <div className="h-14 w-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-5">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-primary">{t.dash_create_circle}</h2>
              <p className="mt-3 text-muted-foreground max-w-sm leading-relaxed">{t.dash_create_circle_desc}</p>
              <Button size="lg" className="mt-7 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8" onClick={() => navigate('/circle')}>
                {t.dash_create_circle_btn}
              </Button>
            </CardContent>
          </Card>
        )}

        {circle && (
          <>
            {/* ============ PRIMARY ACTION CARDS ============ */}
            {(() => {
              const cards = [
                { icon: Users,      title: t.dash_card_circle_title    ?? 'Mon cercle familial', desc: t.dash_card_circle_desc    ?? 'Voir les proches et leurs rôles',         route: '/circle',          tint: 'bg-accent/10 text-accent' },
                { icon: FolderOpen, title: t.dash_card_documents_title ?? 'Mes documents',       desc: t.dash_card_documents_desc ?? 'Centraliser mes documents importants',    route: '/documents',       tint: 'bg-sky-100 text-sky-700' },
                { icon: Image,      title: t.dash_card_memories_title  ?? 'Mes souvenirs',       desc: t.dash_card_memories_desc  ?? 'Photos, vidéos et messages à transmettre',route: '/memories',        tint: 'bg-rose-100 text-rose-700' },
                { icon: CheckSquare,title: t.dash_card_checklist_title ?? 'Ma checklist',        desc: t.dash_card_checklist_desc ?? 'Les actions à faire, étape par étape',   route: '/checklist',       tint: 'bg-emerald-100 text-emerald-700' },
              ];
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {cards.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.title}
                        onClick={() => navigate(c.route)}
                        aria-label={c.title}
                        className="group text-left rounded-2xl bg-card border border-border/70 p-5 shadow-soft hover:shadow-elevated hover:border-accent/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                      >
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${c.tint}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-primary leading-tight">{c.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-snug min-h-[2.5rem]">{c.desc}</p>
                        <div className="mt-4 flex items-center justify-between text-sm font-medium text-primary group-hover:text-accent transition-colors">
                          <span>{t.dash_card_open ?? 'Ouvrir'}</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* ============ GUIDED JOURNEY ============ */}
            {(() => {
              const rawSteps: Array<{ icon: typeof Users; title: string; desc: string; status: StepStatus; route: string }> = [
                { icon: Users,       title: t.dash_step_circle_title,     desc: t.dash_step_circle_desc,     status: circle ? 'done' : 'todo',                                                       route: '/circle' },
                { icon: UserPlus,    title: t.dash_step_members_title,    desc: t.dash_step_members_desc,    status: memberCount > 1 ? 'done' : invitationCount > 0 ? 'in_progress' : 'todo',       route: '/circle/members' },
                { icon: Shield,      title: t.dash_step_roles_title,      desc: t.dash_step_roles_desc,      status: govSummary.completed > 0 ? 'done' : govSummary.total > 0 ? 'in_progress' : 'todo', route: '/governance' },
                { icon: FolderOpen,  title: t.dash_step_documents_title,  desc: t.dash_step_documents_desc,  status: docCount > 0 ? 'done' : 'todo',                                                  route: '/documents' },
                { icon: Image,       title: t.dash_step_memories_title,   desc: t.dash_step_memories_desc,   status: memoryCount > 0 ? 'done' : 'todo',                                               route: '/memories' },
                { icon: CheckSquare, title: t.dash_step_checklist_title,  desc: t.dash_step_checklist_desc,  status: checklistSummary.completed >= checklistSummary.total && checklistSummary.total > 0 ? 'done' : checklistSummary.completed > 0 ? 'in_progress' : 'todo', route: '/checklist' },
              ];
              const nextIdx = rawSteps.findIndex((s) => s.status !== 'done');
              return (
                <Card className="shadow-card overflow-hidden border-border/60">
                  <div className="px-5 sm:px-7 pt-6 pb-5 border-b border-border/50">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="h-5 w-5 text-accent mt-0.5 shrink-0" aria-hidden="true" />
                      <div>
                        <h2 className="font-heading text-xl sm:text-2xl font-semibold text-primary leading-tight">{t.dash_journey_title}</h2>
                        <p className="text-sm text-muted-foreground mt-1 leading-snug">{t.dash_journey_subtitle_v2 ?? t.dash_journey_subtitle}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 sm:p-6">
                    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                      {rawSteps.map((step, i) => {
                        const Icon = step.icon;
                        const isNext = i === nextIdx;
                        const badge = statusBadge(step.status);
                        return (
                          <li key={i} className="relative">
                            {isNext && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-800 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 border border-sky-200 shadow-sm whitespace-nowrap">
                                <Sparkles className="h-3 w-3" />
                                {t.dash_step_next_action ?? 'Prochaine action'}
                              </span>
                            )}
                            <button
                              onClick={() => navigate(step.route)}
                              aria-label={step.title}
                              className={`w-full h-full text-left rounded-2xl border p-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                                isNext
                                  ? 'bg-sky-50/60 border-sky-300 shadow-md hover:shadow-lg'
                                  : 'bg-card border-border/70 hover:border-accent/40 hover:shadow-soft'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-heading text-sm font-semibold shrink-0 ${
                                  step.status === 'done'
                                    ? 'bg-emerald-500 text-white'
                                    : isNext
                                      ? 'bg-sky-500 text-white'
                                      : 'bg-muted text-muted-foreground'
                                }`}>
                                  {step.status === 'done' ? <Check className="h-4 w-4" /> : i + 1}
                                </div>
                                <Icon className="h-4 w-4 text-primary/70" />
                              </div>
                              <p className="font-heading text-sm font-semibold text-primary leading-tight">{step.title}</p>
                              <p className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">{step.desc}</p>
                              <Badge variant="outline" className={`mt-3 text-[10px] px-2 py-0.5 ${badge.cls}`}>
                                {badge.label}
                              </Badge>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </CardContent>
                </Card>
              );
            })()}

            {/* ============ SUPPORT TOOLS ROW ============ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-soft border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent overflow-hidden">
                <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-7 w-7 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-primary leading-tight">{t.dash_support_assistant_title ?? aiT.scan_dashboard_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-snug">{t.dash_support_assistant_desc ?? aiT.empty_assistant}</p>
                  </div>
                  <Button
                    onClick={() => navigate('/assistant')}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5 h-11 shrink-0 font-medium"
                  >
                    {t.dash_support_assistant_cta ?? aiT.nav_assistant}
                  </Button>
                </CardContent>
              </Card>
              <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-sky-50 via-sky-50/40 to-transparent overflow-hidden">
                <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
                    <Scan className="h-7 w-7 text-sky-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-primary leading-tight">{t.dash_support_scan_title ?? aiT.scan_dashboard_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-snug">{t.dash_support_scan_desc ?? aiT.scan_dashboard_desc}</p>
                  </div>
                  <Button
                    onClick={() => navigate('/documents?scan=1')}
                    variant="outline"
                    className="rounded-full px-5 h-11 shrink-0 border-primary/30 text-primary hover:bg-primary/5 gap-2 font-medium"
                  >
                    <Camera className="h-4 w-4" />
                    {t.dash_support_scan_cta ?? aiT.scan_dashboard_cta}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Discreet demo tour link */}
            <div className="flex justify-center">
              <DemoTour triggerClassName="" />
            </div>

            {/* ============ ALERTS ROW ============ */}
            {(checklistSummary.needsReview > 0 || checklistSummary.blocked > 0 || checklistSummary.proReview > 0) && (
              <div className="flex flex-wrap gap-2">
                {checklistSummary.needsReview > 0 && (
                  <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/40 gap-1.5 py-1 px-3 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    {t.dash_to_verify.replace('{count}', String(checklistSummary.needsReview))}
                  </Badge>
                )}
                {checklistSummary.blocked > 0 && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1.5 py-1 px-3 text-xs">
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

            {(() => {
              const docItems = [
                { key: 'testament', icon: FileCheck, label: t.doc_status_testament, desc: t.dash_doc_desc_testament, value: circle.testament_status },
                { key: 'mandate', icon: Shield, label: t.doc_status_mandate, desc: t.dash_doc_desc_mandate, value: circle.mandate_status },
                { key: 'notary', icon: Briefcase, label: t.doc_status_notary, desc: t.dash_doc_desc_notary, value: circle.notary_status },
                { key: 'beneficiaries', icon: Users, label: t.doc_status_beneficiaries, desc: t.dash_doc_desc_beneficiaries, value: circle.beneficiary_designation_status },
              ];
              const score = (v: string) => v === 'professionally_confirmed' ? 100 : v === 'located' ? 66 : v === 'declared' ? 33 : 0;
              const progress = Math.round(docItems.reduce((s, i) => s + score(String(i.value)), 0) / docItems.length);
              return (
                <Card className="shadow-card overflow-hidden border-border/60">
                  <div className="px-5 pt-5 pb-3 border-b border-border/50 bg-gradient-to-br from-accent/5 to-transparent">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                          <FileCheck className="h-4.5 w-4.5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading text-base font-semibold text-foreground leading-tight">{t.dash_documentary_prep}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t.dash_documentary_subtitle}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[11px] shrink-0 bg-background">{dossierLabel(circle.dossier_readiness_status)}</Badge>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                        <span>{t.dash_doc_progress_label}</span>
                        <span className="font-medium text-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/50">
                      {docItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.key} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                            </div>
                            <Badge className={`text-[11px] px-2 py-0.5 shrink-0 ${docStatusColor(item.value as DocumentaryStatus)}`}>
                              {docStatusLabel(item.value as DocumentaryStatus)}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-[10.5px] text-muted-foreground leading-tight flex-1 min-w-0">{t.dash_doc_legend}</p>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/circle')} className="h-7 text-xs text-accent hover:text-accent/80 px-2">
                        {t.dash_manage_statuses} <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

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
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1 text-xs py-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          {t.dash_blocked.replace('{count}', String(govSummary.blocked))}
                        </Badge>
                      )}
                      {govSummary.needsAttention > 0 && (
                        <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/40 gap-1 text-xs py-0.5">
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

          </>
        )}
      </div>
      {circle && (
        <GuidedOnboarding
          open={showGuided}
          circleId={circle.id}
          onClose={() => setShowGuided(false)}
          onCompleted={() => setShowGuided(false)}
        />
      )}
    </AppLayout>
  );
};

export default DashboardPage;
