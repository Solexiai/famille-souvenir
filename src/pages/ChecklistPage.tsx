import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Loader2, Plus, CheckSquare, AlertTriangle, FileText, Ban, CalendarIcon,
  User, Filter, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {
  FamilyCircle, ChecklistItem, ChecklistCategory, ChecklistStatus,
  CircleMember, AppRole, Document as DocType
} from '@/types/database';
import { hasPermission } from '@/components/PermissionMatrix';
import type { Database } from '@/integrations/supabase/types';
import { useLocale } from '@/contexts/LocaleContext';

const categoryLabels: Record<ChecklistCategory, string> = {
  legal: 'Juridique',
  identity: 'Identité',
  financial: 'Financier',
  insurance: 'Assurances',
  property: 'Immobilier',
  digital_estate: 'Patrimoine numérique',
  final_wishes: 'Dernières volontés',
  contacts: 'Contacts',
  executor_readiness: 'Préparation exécuteur',
};

const categoryOrder: ChecklistCategory[] = [
  'legal', 'identity', 'financial', 'insurance', 'property',
  'digital_estate', 'final_wishes', 'contacts', 'executor_readiness',
];

const statusLabels: Record<ChecklistStatus, string> = {
  not_started: 'Incomplet',
  in_progress: 'En cours',
  completed: 'Complet',
  needs_review: 'À vérifier',
  blocked: 'Bloqué',
};

const statusColors: Record<ChecklistStatus, string> = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-800',
  needs_review: 'bg-amber-100 text-amber-800',
  blocked: 'bg-destructive/10 text-destructive',
};

const statusIcons: Record<ChecklistStatus, React.ReactNode> = {
  not_started: null,
  in_progress: null,
  completed: <CheckSquare className="h-3.5 w-3.5" />,
  needs_review: <AlertTriangle className="h-3.5 w-3.5" />,
  blocked: <Ban className="h-3.5 w-3.5" />,
};

type ChecklistInsert = Database['public']['Tables']['checklist_items']['Insert'];
type ChecklistUpdate = Database['public']['Tables']['checklist_items']['Update'];
type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

const ChecklistPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const categoryLabelsT = t.checklist_categories as Record<ChecklistCategory, string>;
  const statusLabelsT = t.checklist_statuses as Record<ChecklistStatus, string>;
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ChecklistItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssigned, setFilterAssigned] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'incomplete' | 'due_date'>('default');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChecklistCategory>('legal');
  const [requiresPro, setRequiresPro] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [linkedDocId, setLinkedDocId] = useState<string>('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [blockedReason, setBlockedReason] = useState('');
  const [formStatus, setFormStatus] = useState<ChecklistStatus>('not_started');

  const canEdit = hasPermission(userRole, 'checklist.edit');

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const [{ data: itemData }, { data: memberData }, { data: docData }, { data: roleData }] = await Promise.all([
      supabase.from('checklist_items').select('*').eq('circle_id', c.id).order('category').order('created_at'),
      supabase.from('circle_members').select('*').eq('circle_id', c.id),
      supabase.from('documents').select('id,title').eq('circle_id', c.id).order('title'),
      supabase.from('circle_members').select('role').eq('circle_id', c.id).eq('user_id', user.id).limit(1),
    ]);

    setItems((itemData as ChecklistItem[]) || []);
    // Enrich members with profile names
    const rawMembers = (memberData as CircleMember[]) || [];
    if (rawMembers.length > 0) {
      const profilePromises = rawMembers.map(async (m) => {
        const { data: p } = await supabase.from('profiles').select('full_name,email').eq('user_id', m.user_id).single();
        return { ...m, profiles: p } as CircleMember;
      });
      setMembers(await Promise.all(profilePromises));
    } else {
      setMembers([]);
    }
    setDocuments((docData as DocType[]) || []);
    if (roleData && roleData.length > 0) setUserRole(roleData[0].role as AppRole);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory('legal'); setRequiresPro(false);
    setAssignedTo(''); setDueDate(undefined); setLinkedDocId(''); setEvidenceNote('');
    setBlockedReason(''); setFormStatus('not_started'); setEditItem(null);
  };

  const openEditDialog = (item: ChecklistItem) => {
    setEditItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setCategory(item.category);
    setRequiresPro(item.requires_professional_review);
    setAssignedTo(item.assigned_to || '');
    setDueDate(item.due_date ? new Date(item.due_date) : undefined);
    setLinkedDocId(item.linked_document_id || '');
    setEvidenceNote(item.evidence_note || '');
    setBlockedReason(item.blocked_reason || '');
    setFormStatus(item.status);
    setDialogOpen(true);
  };

  const auditLog = async (action: string, details: Record<string, unknown>) => {
    if (!circle || !user) return;
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      circle_id: circle.id,
      action,
      details: details as AuditLogInsert['details'],
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle || !user || !title.trim()) return;
    setSaving(true);

    const payload: ChecklistInsert = {
      circle_id: circle.id,
      category,
      title: title.trim(),
      description: description || null,
      status: formStatus,
      requires_professional_review: requiresPro,
      assigned_to: assignedTo || null,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      linked_document_id: linkedDocId || null,
      evidence_note: evidenceNote || null,
      blocked_reason: blockedReason || null,
    };

    if (editItem) {
      const updatePayload: ChecklistUpdate = payload;
      const { error } = await supabase.from('checklist_items').update(updatePayload).eq('id', editItem.id);
      if (error) { toast.error(t.checklist_update_error); }
      else {
        toast.success(t.checklist_updated);
        // Audit changes
        if (editItem.status !== formStatus) await auditLog('checklist_status_change', { item_id: editItem.id, old: editItem.status, new: formStatus });
        if (editItem.assigned_to !== (assignedTo || null)) await auditLog('checklist_assignment_change', { item_id: editItem.id, old: editItem.assigned_to, new: assignedTo || null });
        if (editItem.linked_document_id !== (linkedDocId || null)) await auditLog('checklist_linked_document_change', { item_id: editItem.id, old: editItem.linked_document_id, new: linkedDocId || null });
      }
    } else {
      const { data: newItem, error } = await supabase.from('checklist_items').insert(payload).select().single();
      if (error) { toast.error(t.checklist_create_error); }
      else {
        toast.success(t.checklist_created);
        await auditLog('checklist_item_created', { item_id: newItem?.id, title: title.trim(), category });
      }
    }

    resetForm();
    setDialogOpen(false);
    loadData();
    setSaving(false);
  };

  const handleQuickStatus = async (item: ChecklistItem, newStatus: ChecklistStatus) => {
    const { error } = await supabase.from('checklist_items').update({ status: newStatus }).eq('id', item.id);
    if (error) toast.error(t.error_generic);
    else {
      await auditLog('checklist_status_change', { item_id: item.id, old: item.status, new: newStatus });
      loadData();
    }
  };

  // Derived data
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);
    if (filterAssigned !== 'all') {
      if (filterAssigned === 'unassigned') result = result.filter(i => !i.assigned_to);
      else result = result.filter(i => i.assigned_to === filterAssigned);
    }
    if (sortBy === 'incomplete') {
      const order: ChecklistStatus[] = ['blocked', 'needs_review', 'not_started', 'in_progress', 'completed'];
      result.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    } else if (sortBy === 'due_date') {
      result.sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    }
    return result;
  }, [items, filterStatus, filterAssigned, sortBy]);

  const grouped = useMemo(() => {
    const g: Record<string, ChecklistItem[]> = {};
    for (const item of filteredItems) {
      if (!g[item.category]) g[item.category] = [];
      g[item.category].push(item);
    }
    return g;
  }, [filteredItems]);

  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter(i => i.status === 'completed').length,
    needsReview: items.filter(i => i.status === 'needs_review').length,
    blocked: items.filter(i => i.status === 'blocked').length,
    proReview: items.filter(i => i.requires_professional_review && i.status !== 'completed').length,
    withDoc: items.filter(i => i.linked_document_id).length,
  }), [items]);

  const getMemberName = (userId: string | null) => {
    if (!userId) return null;
    const m = members.find(mb => mb.user_id === userId);
    return m ? m.profiles?.full_name || 'Membre' : null;
  };

  const toggleCat = (cat: string) => {
    setCollapsedCats(prev => {
      const s = new Set(prev);
      if (s.has(cat)) {
        s.delete(cat);
      } else {
        s.add(cat);
      }
      return s;
    });
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  if (!circle) return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">{t.please_create_circle}</p><Button className="mt-4" onClick={() => window.location.href = '/circle'}>{t.create_circle}</Button></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-accent" />
              {t.checklist_title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t.checklist_subtitle}
            </p>
          </div>
          {canEdit && (
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2"><Plus className="h-4 w-4" />{t.add}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading">{editItem ? t.checklist_edit_title : t.checklist_add_title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t.checklist_category}</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ChecklistCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categoryOrder.map(k => <SelectItem key={k} value={k}>{categoryLabelsT[k]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.checklist_title_label}</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.checklist_title_placeholder} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.checklist_description}</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.checklist_description_placeholder} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.checklist_status}</Label>
                    <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ChecklistStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabelsT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {formStatus === 'blocked' && (
                    <div className="space-y-2">
                      <Label>{t.checklist_blocked_reason}</Label>
                      <Input value={blockedReason} onChange={(e) => setBlockedReason(e.target.value)} placeholder={t.checklist_blocked_placeholder} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{t.checklist_assigned_to}</Label>
                    <Select value={assignedTo || 'none'} onValueChange={(v) => setAssignedTo(v === 'none' ? '' : v)}>
                      <SelectTrigger><SelectValue placeholder={t.checklist_unassigned} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t.checklist_unassigned}</SelectItem>
                        {members.map(m => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {m.profiles?.full_name || m.profiles?.email || 'Membre'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.checklist_due_date}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, 'PPP', { locale: fr }) : t.checklist_no_due_date}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                    {dueDate && <Button type="button" variant="ghost" size="sm" onClick={() => setDueDate(undefined)} className="text-xs">{t.checklist_remove_date}</Button>}
                  </div>
                  <div className="space-y-2">
                    <Label>{t.checklist_linked_doc}</Label>
                    <Select value={linkedDocId || 'none'} onValueChange={(v) => setLinkedDocId(v === 'none' ? '' : v)}>
                      <SelectTrigger><SelectValue placeholder={t.none} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t.none}</SelectItem>
                        {documents.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.checklist_evidence_note}</Label>
                    <Input value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)} placeholder={t.checklist_evidence_placeholder} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={requiresPro} onCheckedChange={setRequiresPro} />
                    <Label className="text-sm">{t.checklist_pro_review}</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editItem ? t.save : t.add}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary cards */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:py-4 text-center">
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{stats.completed}/{stats.total}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{t.checklist_complete_count}</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:py-4 text-center">
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{stats.needsReview}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{t.checklist_to_verify}</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:py-4 text-center">
                <p className="text-xl sm:text-2xl font-semibold text-amber-600">{stats.blocked}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{t.checklist_blocked_label}</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft">
              <CardContent className="p-3 sm:py-4 text-center">
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{stats.proReview}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{t.checklist_pro_count}</p>
              </CardContent>
            </Card>
            <Card className="shadow-soft col-span-2 sm:col-span-1">
              <CardContent className="p-3 sm:py-4 text-center">
                <p className="text-xl sm:text-2xl font-semibold text-foreground">{stats.withDoc}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">{t.checklist_doc_backed}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {stats.total > 0 && (
          <Card className="shadow-soft">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:hidden">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{"Filtres"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 text-xs w-full"><SelectValue placeholder={t.checklist_status} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.checklist_all_statuses}</SelectItem>
                    {Object.entries(statusLabelsT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterAssigned} onValueChange={setFilterAssigned}>
                  <SelectTrigger className="h-9 text-xs w-full"><SelectValue placeholder={t.checklist_assigned_to} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.checklist_all_members}</SelectItem>
                    <SelectItem value="unassigned">{t.checklist_unassigned}</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.profiles?.full_name || 'Membre'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={(v: 'default' | 'incomplete' | 'due_date') => setSortBy(v)}
                >
                  <SelectTrigger className="h-9 text-xs w-full"><SelectValue placeholder={'Tri'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t.checklist_sort_category}</SelectItem>
                    <SelectItem value="incomplete">{t.checklist_sort_urgency}</SelectItem>
                    <SelectItem value="due_date">{t.checklist_sort_due_date}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist items grouped by category */}
        {filteredItems.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {items.length === 0 ? t.checklist_empty : t.checklist_no_filter_match}
              </p>
              {items.length === 0 && <p className="text-sm text-muted-foreground mt-1">{t.checklist_empty_desc}</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {categoryOrder.filter(cat => grouped[cat]).map(cat => {
              const catItems = grouped[cat];
              const isCollapsed = collapsedCats.has(cat);
              const catCompleted = catItems.filter(i => i.status === 'completed').length;
              return (
                <Card key={cat} className="shadow-soft">
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleCat(cat)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        <CardTitle className="font-heading text-base">{categoryLabelsT[cat]}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">{catCompleted}/{catItems.length}</Badge>
                    </div>
                  </CardHeader>
                  {!isCollapsed && (
                    <CardContent className="space-y-2 pt-0">
                      {catItems.map(item => (
                        <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
                          {/* Title + badges row */}
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground break-words min-w-0 flex-1">{item.title}</p>
                            {!canEdit && (
                              <Badge className={`text-xs shrink-0 ${statusColors[item.status]}`}>
                                {statusIcons[item.status]}
                                {statusLabelsT[item.status]}
                              </Badge>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.requires_professional_review && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                <AlertTriangle className="h-3 w-3" /> Pro
                              </span>
                            )}
                            {item.linked_document_id && (
                              <span className="inline-flex items-center gap-1 text-xs text-primary">
                                <FileText className="h-3 w-3" /> Doc
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="text-xs text-muted-foreground break-words">{item.description}</p>
                          )}

                          {/* Meta: assignee, date, evidence, blocked */}
                          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                            {item.assigned_to && (
                              <span className="inline-flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {getMemberName(item.assigned_to)}
                              </span>
                            )}
                            {item.due_date && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(item.due_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                            {item.evidence_note && <span className="break-words">📎 {item.evidence_note}</span>}
                            {item.status === 'blocked' && item.blocked_reason && (
                              <span className="text-destructive break-words">⛔ {item.blocked_reason}</span>
                            )}
                          </div>

                          {/* Actions row */}
                          {canEdit && (
                            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                              <Select value={item.status} onValueChange={(v) => handleQuickStatus(item, v as ChecklistStatus)}>
                                <SelectTrigger className="h-8 text-xs flex-1 min-w-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusLabelsT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" className="text-xs h-8 px-3 shrink-0" onClick={() => openEditDialog(item)}>
                                {t.edit}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ChecklistPage;
