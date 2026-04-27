import React, { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, ShieldCheck, Send, Loader2, MessageCircle, ListChecks, Settings as SettingsIcon, AlertTriangle, Bookmark, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { AI_COPY, COUNTRIES, type AILang } from '@/lib/ai-assistant-i18n';

interface AIContext {
  id?: string;
  country: string;
  region: string;
  language: AILang;
  preparing_for: 'myself' | 'family_member';
  ai_disclaimer_accepted: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChecklistItem {
  title: string;
  /** Legacy field — kept for backward compatibility with older payloads. */
  description?: string;
  /** New short, app-friendly fields. */
  category?: string;
  short_explanation?: string;
  recommended_action?: string;
  details?: string;
  section: string;
  professional_review_recommended: boolean;
}

interface ChecklistPayload {
  intro: string;
  closing?: string;
  jurisdiction_section_title?: string;
  items: ChecklistItem[];
}

const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  CA: ['Quebec', 'Ontario', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador', 'PEI', 'Yukon', 'NWT', 'Nunavut'],
  US: ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Pennsylvania', 'Other'],
  FR: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d’Azur', 'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Grand Est', 'Bretagne', 'Normandie', 'Pays de la Loire', 'Centre-Val de Loire', 'Bourgogne-Franche-Comté', 'Corse', 'Outre-mer'],
};

const AssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLocale();
  const aiLang: AILang = (['fr', 'en', 'es'].includes(lang) ? lang : 'en') as AILang;
  const t = AI_COPY[aiLang];

  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState<AIContext>({
    country: '', region: '', language: aiLang, preparing_for: 'myself', ai_disclaimer_accepted: false,
  });
  // Snapshot of the last successfully saved context — drives the unlock gate.
  const [savedCtx, setSavedCtx] = useState<AIContext | null>(null);
  const [savingCtx, setSavingCtx] = useState(false);
  const [showRegionError, setShowRegionError] = useState(false);
  const [tab, setTab] = useState('chat');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const [checklist, setChecklist] = useState<{ intro: string; items: ChecklistItem[] } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  // Load existing context
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('ai_user_context')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        const loaded: AIContext = {
          id: data.id,
          country: data.country || '',
          region: data.region || '',
          language: (data.language as AILang) || aiLang,
          preparing_for: (data.preparing_for as 'myself' | 'family_member') || 'myself',
          ai_disclaimer_accepted: !!data.ai_disclaimer_accepted,
        };
        setCtx(loaded);
        // Only treat as "saved/unlocked" if the persisted row is fully complete.
        const regionRequired = !!REGIONS_BY_COUNTRY[loaded.country];
        const complete = !!loaded.country && !!loaded.language && !!loaded.preparing_for && (!regionRequired || !!loaded.region);
        if (complete) setSavedCtx(loaded);
      }
      setLoading(false);
    })();
  }, [user, aiLang]);

  const saveContext = async (overrides?: Partial<AIContext>) => {
    if (!user) return;
    setSavingCtx(true);
    const next = { ...ctx, ...overrides };
    const payload = {
      user_id: user.id,
      country: next.country || null,
      region: next.region || null,
      language: next.language,
      preparing_for: next.preparing_for,
      ai_disclaimer_accepted: next.ai_disclaimer_accepted,
      ai_disclaimer_accepted_at: next.ai_disclaimer_accepted ? new Date().toISOString() : null,
    };
    const { data, error } = await supabase
      .from('ai_user_context')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    setSavingCtx(false);
    if (error) {
      toast.error(t.error_generic);
      return;
    }
    const saved = { ...next, id: data.id };
    setCtx(saved);
    // Mark as unlocked only if all required fields are present in the saved row.
    const regionRequired = !!REGIONS_BY_COUNTRY[saved.country];
    const complete = !!saved.country && !!saved.language && !!saved.preparing_for && (!regionRequired || !!saved.region);
    if (complete) setSavedCtx(saved);
    return data;
  };

  const acceptDisclaimer = async () => {
    // Persist the disclaimer flag without unlocking the assistant — context still required.
    await saveContext({ ai_disclaimer_accepted: true });
  };

  const callAI = async (action: 'chat_guidance' | 'generate_checklist', extra: Record<string, unknown> = {}) => {
    const body = {
      action,
      country: ctx.country,
      region: ctx.region,
      language: ctx.language,
      preparing_for: ctx.preparing_for,
      ...extra,
    };
    const { data, error } = await supabase.functions.invoke('ai-preparation-assistant', { body });
    if (error) {
      // supabase wraps non-2xx into error; try to surface code
      const msg = (error as any)?.context?.error || error.message || '';
      if (/rate/i.test(msg)) toast.error(t.error_rate);
      else if (/credits|payment/i.test(msg)) toast.error(t.error_credits);
      else toast.error(t.error_generic);
      throw error;
    }
    if (!data?.ok) {
      toast.error(data?.error || t.error_generic);
      throw new Error(data?.error || 'ai_error');
    }
    return data.data;
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    const newHistory = [...messages, { role: 'user' as const, content }];
    setMessages(newHistory);
    setInput('');
    setSending(true);
    try {
      const result = await callAI('chat_guidance', {
        user_question: content,
        history: messages,
      });
      setMessages([...newHistory, { role: 'assistant', content: result.reply }]);
    } catch (_e) {
      setMessages(newHistory); // keep user message visible
    } finally {
      setSending(false);
    }
  };

  const generateChecklist = async () => {
    setGenerating(true);
    setSavedIdx(new Set());
    try {
      const result = await callAI('generate_checklist');
      setChecklist(result);
    } catch (_e) {
      // toast already shown
    } finally {
      setGenerating(false);
    }
  };

  const saveSuggestion = async (item: ChecklistItem, idx: number) => {
    if (!user) return;
    const { error } = await supabase.from('ai_saved_suggestions').insert({
      user_id: user.id,
      suggestion_type: 'checklist_item',
      title: item.title,
      content: item.description,
      professional_review_recommended: item.professional_review_recommended,
      metadata: { section: item.section },
    });
    if (error) { toast.error(t.error_generic); return; }
    setSavedIdx(new Set([...savedIdx, idx]));
    toast.success(t.saved_toast);
  };

  const sectionLabel = (s: string) => (t as any)[`section_${s}`] || s;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  // Disclaimer gate
  if (!ctx.ai_disclaimer_accepted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
              <Sparkles className="h-7 w-7 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-semibold text-primary">{t.page_title}</h1>
            <p className="text-muted-foreground">{t.page_subtitle}</p>
          </div>

          <Card className="shadow-elevated border-accent/30">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <h2 className="font-heading text-xl font-semibold text-primary">{t.disclaimer_title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">{t.disclaimer_body}</p>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                {t.educational_badge}
              </Badge>
              <Button
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                onClick={acceptDisclaimer}
                disabled={savingCtx}
              >
                {savingCtx && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t.disclaimer_accept}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // The assistant is unlocked ONLY when a complete context has been saved.
  const contextReady = !!savedCtx;

  // Validation for the form (live, but doesn't unlock until Save).
  const regionRequired = !!REGIONS_BY_COUNTRY[ctx.country];
  const formComplete =
    !!ctx.country &&
    !!ctx.language &&
    !!ctx.preparing_for &&
    (!regionRequired || !!ctx.region);

  const regionErrorMsg =
    aiLang === 'fr'
      ? 'Veuillez sélectionner votre province ou état avant de continuer.'
      : aiLang === 'es'
        ? 'Seleccione su provincia o estado antes de continuar.'
        : 'Please select your province or state before continuing.';

  const handleSaveClick = async () => {
    if (regionRequired && !ctx.region) {
      setShowRegionError(true);
      return;
    }
    setShowRegionError(false);
    const result = await saveContext();
    if (result) toast.success('✓');
  };

  const SettingsForm = (
    <Card className="shadow-card">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-accent" />
          <h2 className="font-heading text-lg font-semibold">{t.context_title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">{t.context_country}</Label>
            <Select
              value={ctx.country}
              onValueChange={(v) => {
                // Update form state only — never auto-save or unlock on country change.
                setCtx({ ...ctx, country: v, region: '' });
                setShowRegionError(false);
              }}
            >
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {aiLang === 'fr' ? c.label_fr : aiLang === 'es' ? c.label_es : c.label_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              {t.context_region}{regionRequired && <span className="text-destructive"> *</span>}
            </Label>
            {REGIONS_BY_COUNTRY[ctx.country] ? (
              <Select
                value={ctx.region}
                onValueChange={(v) => { setCtx({ ...ctx, region: v }); setShowRegionError(false); }}
              >
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {REGIONS_BY_COUNTRY[ctx.country].map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={ctx.region} onChange={(e) => setCtx({ ...ctx, region: e.target.value })} placeholder="—" />
            )}
            {showRegionError && regionRequired && !ctx.region && (
              <p className="text-xs text-destructive">{regionErrorMsg}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.context_language}</Label>
            <Select value={ctx.language} onValueChange={(v) => setCtx({ ...ctx, language: v as AILang })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.context_preparing_for}</Label>
            <Select value={ctx.preparing_for} onValueChange={(v) => setCtx({ ...ctx, preparing_for: v as 'myself' | 'family_member' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="myself">{t.preparing_self}</SelectItem>
                <SelectItem value="family_member">{t.preparing_family}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSaveClick} disabled={savingCtx || !formComplete}>
          {savingCtx && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t.context_save}
        </Button>
      </CardContent>
    </Card>
  );

  if (!contextReady) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              {t.page_title}
            </h1>
            <p className="text-muted-foreground text-sm">{t.ctx_required_body}</p>
          </div>
          {SettingsForm}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-primary flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-accent" />
              {t.page_title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t.page_subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">
              {t.educational_badge}
            </Badge>
            {savedCtx?.country && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                {t.jurisdiction_aware_label}
              </Badge>
            )}
          </div>
        </div>

        {savedCtx?.country && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">{t.jurisdiction_warning}</p>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="chat" className="gap-1.5"><MessageCircle className="h-3.5 w-3.5" />{t.tab_chat}</TabsTrigger>
            <TabsTrigger value="checklist" className="gap-1.5"><ListChecks className="h-3.5 w-3.5" />{t.tab_checklist}</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5"><SettingsIcon className="h-3.5 w-3.5" />{t.tab_settings}</TabsTrigger>
          </TabsList>

          {/* Chat */}
          <TabsContent value="chat" className="mt-4">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="min-h-[420px] max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-10 space-y-4">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                      <p className="font-heading text-lg text-foreground">{t.chat_empty_title}</p>
                      <p className="text-xs text-muted-foreground">{t.chat_empty_hint}</p>
                      <div className="flex flex-col gap-2 max-w-md mx-auto">
                        {[t.chat_suggestion_1, t.chat_suggestion_2, t.chat_suggestion_3].map((s) => (
                          <Button key={s} variant="outline" size="sm" className="text-xs justify-start text-left h-auto py-2 whitespace-normal" onClick={() => sendMessage(s)}>
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))
                  )}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-secondary text-muted-foreground rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> {t.chat_thinking}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t p-3 flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={t.chat_placeholder}
                    rows={1}
                    className="resize-none min-h-[40px]"
                    disabled={sending}
                  />
                  <Button onClick={() => sendMessage()} disabled={sending || !input.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checklist */}
          <TabsContent value="checklist" className="mt-4 space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="font-heading text-lg font-semibold flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-accent" />
                      {t.tab_checklist}
                    </h2>
                  </div>
                  <Button onClick={generateChecklist} disabled={generating} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {generating ? t.generating_checklist : t.generate_checklist}
                  </Button>
                </div>
                {!checklist && !generating && (
                  <p className="text-sm text-muted-foreground">{t.checklist_empty}</p>
                )}
                {checklist && (
                  <>
                    <p className="text-sm text-foreground/80">{checklist.intro}</p>
                    <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">
                      {t.ai_badge}
                    </Badge>
                    <div className="space-y-3">
                      {checklist.items.map((item, idx) => (
                        <div key={idx} className="rounded-lg border border-border/60 p-4 space-y-2 hover:shadow-soft transition-shadow">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{sectionLabel(item.section)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant={savedIdx.has(idx) ? 'secondary' : 'outline'}
                              onClick={() => saveSuggestion(item, idx)}
                              disabled={savedIdx.has(idx)}
                              className="shrink-0 text-xs"
                            >
                              {savedIdx.has(idx) ? <><Check className="h-3 w-3 mr-1" />{t.saved}</> : <><Bookmark className="h-3 w-3 mr-1" />{t.save_suggestion}</>}
                            </Button>
                          </div>
                          <p className="text-sm text-foreground/80">{item.description}</p>
                          {item.professional_review_recommended && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 gap-1 text-[10px]">
                              <AlertTriangle className="h-3 w-3" />
                              {t.requires_local_verification}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="mt-4">{SettingsForm}</TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AssistantPage;
