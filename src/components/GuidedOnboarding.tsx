import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Sparkles, User, Heart, Users, Briefcase, ShieldCheck, Plus, X, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  GUIDED_COPY,
  type GuidedLang,
  getBaseChecklistTasks,
} from '@/lib/guided-onboarding-i18n';

interface Props {
  open: boolean;
  circleId: string;
  onClose: () => void;
  onCompleted: () => void;
}

type PreparingFor = 'self' | 'loved_one';
type DraftRole = 'family_manager' | 'family_member' | 'proposed_executor' | 'viewer';

interface DraftMemberInput {
  full_name: string;
  email: string;
  role: DraftRole;
  relationship_label: string;
}

const DEFAULT_DRAFT: DraftMemberInput = {
  full_name: '',
  email: '',
  role: 'family_member',
  relationship_label: '',
};

export const GuidedOnboarding: React.FC<Props> = ({ open, circleId, onClose, onCompleted }) => {
  const { user } = useAuth();
  const { lang } = useLocale();
  const navigate = useNavigate();
  const guidedLang: GuidedLang = (['fr', 'en', 'es'].includes(lang) ? lang : 'en') as GuidedLang;
  const c = GUIDED_COPY[guidedLang];

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [preparingFor, setPreparingFor] = useState<PreparingFor | null>(null);
  const [drafts, setDrafts] = useState<DraftMemberInput[]>([]);
  const [current, setCurrent] = useState<DraftMemberInput>(DEFAULT_DRAFT);

  const [generating, setGenerating] = useState(false);
  const [baseInserted, setBaseInserted] = useState(false);
  const [aiInserting, setAiInserting] = useState(false);
  const [aiTasks, setAiTasks] = useState<{ title: string; description?: string; category: string; professional_review_recommended?: boolean }[]>([]);
  const [aiFailed, setAiFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;
  const progress = step <= 4 ? (step / totalSteps) * 100 : 100;

  const rolesPresent = useMemo(() => {
    const set = new Set<string>(['owner']);
    drafts.forEach(d => set.add(d.role));
    return Array.from(set);
  }, [drafts]);

  const addDraft = () => {
    const name = current.full_name.trim();
    if (!name) return;
    setDrafts(prev => [...prev, { ...current, full_name: name, email: current.email.trim() }]);
    setCurrent(DEFAULT_DRAFT);
  };

  const removeDraft = (idx: number) => {
    setDrafts(prev => prev.filter((_, i) => i !== idx));
  };

  const goNext = async () => {
    if (step === 1 && !preparingFor) return;
    if (step < 4) {
      setStep((step + 1) as typeof step);
      if (step === 3) {
        void generateChecklist();
      }
    }
  };

  const goBack = () => {
    if (step > 1 && step < 5) setStep((step - 1) as typeof step);
  };

  const generateChecklist = async () => {
    if (!user) return;
    setGenerating(true);
    setAiFailed(false);

    try {
      await supabase
        .from('profiles')
        .update({ preparing_for: preparingFor })
        .eq('user_id', user.id);

      if (drafts.length > 0) {
        const rows = drafts.map(d => ({
          circle_id: circleId,
          created_by: user.id,
          full_name: d.full_name,
          email: d.email || null,
          role: d.role,
          relationship_label: d.relationship_label || null,
        }));
        await supabase.from('draft_members').insert(rows);
      }
    } catch (e) {
      console.error('save draft state', e);
    }

    try {
      const base = getBaseChecklistTasks(guidedLang);
      const baseRows = base.map(t => ({
        circle_id: circleId,
        title: t.title,
        description: t.description,
        category: t.category,
        status: 'not_started' as const,
        source: 'guided_onboarding',
      }));
      const { error: baseErr } = await supabase.from('checklist_items').insert(baseRows);
      if (baseErr) throw baseErr;
      setBaseInserted(true);
    } catch (e) {
      console.error('insert base tasks', e);
      toast.error(c.toast_error);
    } finally {
      setGenerating(false);
    }

    setAiInserting(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('country_group, country_code, region_code, jurisdiction_pack')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('generate-onboarding-checklist', {
        body: {
          preparingFor: preparingFor === 'loved_one' ? 'loved_one' : 'self',
          language: guidedLang,
          countryGroup: profile?.country_group || null,
          countryCode: profile?.country_code || null,
          regionCode: profile?.region_code || null,
          jurisdictionPack: profile?.jurisdiction_pack || null,
          rolesPresent,
        },
      });

      if (error) throw error;
      const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
      if (tasks.length === 0) {
        setAiFailed(true);
      } else {
        setAiTasks(tasks);
        const aiRows = tasks.map((t: { title: string; description?: string; category: string; professional_review_recommended?: boolean }) => ({
          circle_id: circleId,
          title: t.title,
          description: t.description || '',
          category: t.category,
          status: 'not_started' as const,
          source: 'ai_suggestion',
          professional_review_recommended: !!t.professional_review_recommended,
        }));
        await supabase.from('checklist_items').insert(aiRows);
      }
    } catch (e) {
      console.error('ai personalization failed', e);
      setAiFailed(true);
    } finally {
      setAiInserting(false);
    }
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({ guided_onboarding_completed_at: new Date().toISOString() })
        .eq('user_id', user.id);
      toast.success(c.toast_saved);
      onCompleted();
    } finally {
      setSaving(false);
    }
  };

  const goToChecklist = async () => {
    await finish();
    navigate('/checklist');
  };

  const goToDashboard = async () => {
    await finish();
    onClose();
  };

  useEffect(() => {
    if (step === 4 && baseInserted && !generating) {
      if (!aiInserting) setStep(5);
    }
  }, [step, baseInserted, generating, aiInserting]);

  const roleOptions: { value: DraftRole; label: string }[] = [
    { value: 'family_manager', label: c.s2_role_manager },
    { value: 'family_member', label: c.s2_role_member },
    { value: 'proposed_executor', label: c.s2_role_executor },
    { value: 'viewer', label: c.s2_role_professional },
  ];

  const roleIcon = (role: DraftRole) => {
    switch (role) {
      case 'family_manager': return ShieldCheck;
      case 'proposed_executor': return Briefcase;
      case 'viewer': return User;
      default: return Users;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && step === 5) onClose(); }}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-accent/20">
        <div className="bg-gradient-to-br from-primary to-[hsl(220,45%,18%)] text-primary-foreground px-6 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <p className="text-[11px] uppercase tracking-[0.18em] text-accent font-medium">{c.welcome_eyebrow}</p>
          </div>
          <h2 className="font-heading text-2xl font-semibold leading-tight">{c.welcome_title}</h2>
          <p className="text-sm text-primary-foreground/75 mt-1.5">{c.welcome_subtitle}</p>
          {step <= 4 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-primary-foreground/80 mb-1.5">
                <span>{c.step_label.replace('{n}', String(step)).replace('{total}', String(totalSteps))}</span>
              </div>
              <Progress value={progress} className="h-1 bg-primary-foreground/15" />
            </div>
          )}
        </div>

        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-lg text-foreground">{c.s1_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.s1_subtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPreparingFor('self')}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${preparingFor === 'self' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}
                >
                  <User className="h-5 w-5 text-accent mb-2" />
                  <p className="font-medium text-foreground">{c.s1_self}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.s1_self_desc}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPreparingFor('loved_one')}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${preparingFor === 'loved_one' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'}`}
                >
                  <Heart className="h-5 w-5 text-accent mb-2" />
                  <p className="font-medium text-foreground">{c.s1_loved_one}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.s1_loved_one_desc}</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-lg text-foreground">{c.s2_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.s2_subtitle}</p>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-2">
                <Input
                  placeholder={c.s2_name_placeholder}
                  value={current.full_name}
                  onChange={(e) => setCurrent(prev => ({ ...prev, full_name: e.target.value }))}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder={c.s2_email_placeholder}
                    type="email"
                    value={current.email}
                    onChange={(e) => setCurrent(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder={c.s2_relationship_placeholder}
                    value={current.relationship_label}
                    onChange={(e) => setCurrent(prev => ({ ...prev, relationship_label: e.target.value }))}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">{c.s2_role_label}</Label>
                    <Select value={current.role} onValueChange={(v) => setCurrent(prev => ({ ...prev, role: v as DraftRole }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addDraft} disabled={!current.full_name.trim()} className="sm:self-end">
                    <Plus className="h-4 w-4 mr-1" />{c.s2_add}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {drafts.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">{c.s2_empty}</p>
                )}
                {drafts.map((d, i) => {
                  const Icon = roleIcon(d.role);
                  const roleLabel = roleOptions.find(r => r.value === d.role)?.label || d.role;
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2">
                      <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{d.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {roleLabel}{d.relationship_label ? ` · ${d.relationship_label}` : ''}{d.email ? ` · ${d.email}` : ''}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeDraft(i)} aria-label={c.s2_remove}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />{c.s2_no_invite_note}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-lg text-foreground">{c.s3_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.s3_subtitle}</p>
              </div>
              <div className="space-y-2">
                {[
                  { icon: ShieldCheck, label: c.s2_role_manager, desc: c.s3_role_manager_desc },
                  { icon: Users, label: c.s2_role_member, desc: c.s3_role_member_desc },
                  { icon: Briefcase, label: c.s2_role_executor, desc: c.s3_role_executor_desc },
                  { icon: User, label: c.s2_role_professional, desc: c.s3_role_professional_desc },
                ].map((r, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card px-3 py-3">
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                      <r.icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {drafts.length > 0 && (
                <div className="rounded-lg bg-secondary/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    {drafts.length} {drafts.length === 1 ? c.s2_role_member.toLowerCase() : c.s2_role_member.toLowerCase() + 's'} ·{' '}
                    {Array.from(new Set(drafts.map(d => roleOptions.find(r => r.value === d.role)?.label))).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="h-14 w-14 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
                {generating ? <Loader2 className="h-6 w-6 text-accent animate-spin" /> : <Sparkles className="h-6 w-6 text-accent" />}
              </div>
              <div>
                <h3 className="font-heading text-lg text-foreground">{c.s4_title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{c.s4_subtitle}</p>
              </div>
              <div className="text-left rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {baseInserted ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <span className={baseInserted ? 'text-foreground' : 'text-muted-foreground'}>{c.s4_base_label}</span>
                  {baseInserted && <Badge variant="outline" className="ml-auto text-[10px]">6</Badge>}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {aiInserting ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : aiFailed ? <X className="h-4 w-4 text-muted-foreground" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  <span className={aiInserting ? 'text-muted-foreground' : 'text-foreground'}>{aiInserting ? c.s4_ai_loading : c.s4_ai_label}</span>
                  {!aiInserting && aiTasks.length > 0 && <Badge variant="outline" className="ml-auto text-[10px]">{aiTasks.length}</Badge>}
                </div>
              </div>
              {aiFailed && !aiInserting && (
                <p className="text-xs text-muted-foreground italic">{c.s4_ai_failed}</p>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5 text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-heading text-xl text-foreground">{c.s4_done_title}</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{c.s4_done_subtitle}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 px-4 py-3 inline-flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">{c.s4_base_label} · {c.s4_ai_label}</p>
                <p className="font-heading text-2xl text-primary">{6 + aiTasks.length}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-secondary/20 px-6 py-4 flex items-center justify-between gap-3">
          {step > 1 && step < 4 ? (
            <Button variant="ghost" onClick={goBack}>{c.back}</Button>
          ) : <span />}

          {step === 1 && (
            <Button onClick={goNext} disabled={!preparingFor}>
              {c.next}<ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep(3)}>{c.skip}</Button>
              <Button onClick={goNext}>{c.next}<ArrowRight className="h-4 w-4 ml-1" /></Button>
            </div>
          )}
          {step === 3 && (
            <Button onClick={goNext}>{c.next}<ArrowRight className="h-4 w-4 ml-1" /></Button>
          )}
          {step === 4 && (
            <Button disabled className="ml-auto">
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />{c.s4_generating}
            </Button>
          )}
          {step === 5 && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={goToDashboard} disabled={saving}>
                {c.s4_open_dashboard}
              </Button>
              <Button onClick={goToChecklist} disabled={saving}>
                {c.s4_open_checklist}<ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuidedOnboarding;
