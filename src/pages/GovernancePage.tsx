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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Loader2, Plus, Shield, User, Filter, CalendarIcon, FileText, CheckSquare,
  ChevronDown, ChevronRight, Ban, AlertTriangle
} from 'lucide-react';
import type {
  FamilyCircle, GovernanceResponsibility, GovernanceArea, GovernanceStatus,
  CircleMember, AppRole, ChecklistItem, Document as DocType
} from '@/types/database';
import { hasPermission } from '@/components/PermissionMatrix';
import type { Database } from '@/integrations/supabase/types';
import { useLocale } from '@/contexts/LocaleContext';

type AuditLogDetails = Database['public']['Tables']['audit_logs']['Insert']['details'];
type GovernanceInsert = Database['public']['Tables']['governance_responsibilities']['Insert'];
type GovernanceUpdate = Database['public']['Tables']['governance_responsibilities']['Update'];

const areaLabels: Record<GovernanceArea, string> = {
  documents: 'Documents',
  legal_follow_up: 'Suivi juridique',
  insurance: 'Assurances',
  finances: 'Finances',
  digital_assets: 'Actifs numériques',
  property: 'Immobilier',
  medical_directives: 'Directives médicales',
  funeral_wishes: 'Volontés funéraires',
  notary_contact: 'Contact notaire',
};

const areaOrder: GovernanceArea[] = [
  'documents', 'legal_follow_up', 'insurance', 'finances', 'digital_assets',
  'property', 'medical_directives', 'funeral_wishes', 'notary_contact',
];

const statusLabels: Record<GovernanceStatus, string> = {
  not_started: 'Non commencé',
  assigned: 'Assigné',
  in_progress: 'En cours',
  completed: 'Complété',
  blocked: 'Bloqué',
  needs_attention: 'Attention requise',
};

const statusColors: Record<GovernanceStatus, string> = {
  not_started: 'bg-muted text-muted-foreground',
  assigned: 'bg-secondary text-secondary-foreground',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-green-100 text-green-800',
  blocked: 'bg-destructive/10 text-destructive',
  needs_attention: 'bg-amber-100 text-amber-800',
};

const GovernancePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const areaLabelsT = t.gov_areas as Record<GovernanceArea, string>;
  const statusLabelsT = t.gov_statuses as Record<GovernanceStatus, string>;
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [items, setItems] = useState<GovernanceResponsibility[]>([]);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<GovernanceResponsibility | null>(null);
  const [saving, setSaving] = useState(false);
  const [collapsedAreas, setCollapsedAreas] = useState<Set<string>>(new Set());

  // Filters
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMember, setFilterMember] = useState<string>('all');

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<GovernanceArea>('documents');
  const [memberId, setMemberId] = useState('');
  const [formStatus, setFormStatus] = useState<GovernanceStatus>('assigned');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [linkedChecklist, setLinkedChecklist] = useState('');
  const [linkedDoc, setLinkedDoc] = useState('');
  const [note, setNote] = useState('');

  const canEdit = hasPermission(userRole, 'governance.edit');

  const loadData = async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }
    const c = circles[0] as FamilyCircle;
    setCircle(c);

    const [{ data: govData }, { data: memberData }, { data: clData }, { data: docData }, { data: roleData }] = await Promise.all([
      supabase.from('governance_responsibilities').select('*').eq('circle_id', c.id).order('area').order('created_at'),
      supabase.from('circle_members').select('*').eq('circle_id', c.id),
      supabase.from('checklist_items').select('id,title').eq('circle_id', c.id).order('title'),
      supabase.from('documents').select('id,title').eq('circle_id', c.id).order('title'),
      supabase.from('circle_members').select('role').eq('circle_id', c.id).eq('user_id', user.id).limit(1),
    ]);

    setItems((govData as GovernanceResponsibility[]) || []);
    setChecklists((clData as ChecklistItem[]) || []);
    setDocuments((docData as DocType[]) || []);
    if (roleData && roleData.length > 0) setUserRole(roleData[0].role as AppRole);

    // Load profiles for members
    const rawMembers = (memberData as CircleMember[]) || [];
    if (rawMembers.length > 0) {
      const enriched = await Promise.all(
        rawMembers.map(async (m) => {
          const { data: p } = await supabase.from('profiles').select('full_name,email').eq('user_id', m.user_id).single();
          return { ...m, profiles: p } as CircleMember;
        })
      );
      setMembers(enriched);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [user]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setArea('documents'); setMemberId('');
    setFormStatus('assigned'); setDueDate(undefined); setLinkedChecklist('');
    setLinkedDoc(''); setNote(''); setEditItem(null);
  };

  const openEdit = (item: GovernanceResponsibility) => {
    setEditItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setArea(item.area);
    setMemberId(item.member_id);
    setFormStatus(item.status);
    setDueDate(item.due_date ? new Date(item.due_date) : undefined);
    setLinkedChecklist(item.linked_checklist_item || '');
    setLinkedDoc(item.linked_document || '');
    setNote(item.note || '');
    setDialogOpen(true);
  };

  const auditLog = async (action: string, details: Record<string, unknown>) => {
    if (!circle || !user) return;
    await supabase.from('audit_logs').insert({
      user_id: user.id, circle_id: circle.id, action, details: details as AuditLogDetails,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circle || !user || !title.trim() || !memberId) return;
    setSaving(true);

    const payload: GovernanceInsert = {
      circle_id: circle.id,
      member_id: memberId,
      area,
      title: title.trim(),
      description: description || null,
      status: formStatus,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      linked_checklist_item: linkedChecklist || null,
      linked_document: linkedDoc || null,
      note: note || null,
    };

    if (editItem) {
      const updatePayload: GovernanceUpdate = payload;
      const { error } = await supabase.from('governance_responsibilities').update(updatePayload).eq('id', editItem.id);
      if (error) { toast.error(t.gov_update_error); }
      else {
        toast.success(t.gov_updated);
        if (editItem.status !== formStatus) await auditLog('governance_status_change', { id: editItem.id, old: editItem.status, new: formStatus });
        if (editItem.member_id !== memberId) await auditLog('governance_assignment_change', { id: editItem.id, old: editItem.member_id, new: memberId });
      }
    } else {
      const { data: newItem, error } = await supabase.from('governance_responsibilities').insert(payload).select().single();
      if (error) { toast.error(t.gov_create_error); }
      else {
        toast.success(t.gov_created);
        await auditLog('governance_created', { id: newItem?.id, title: title.trim(), area });
      }
    }

    resetForm();
    setDialogOpen(false);
    loadData();
    setSaving(false);
  };

  const handleQuickStatus = async (item: GovernanceResponsibility, newStatus: GovernanceStatus) => {
    const updatePayload: GovernanceUpdate = { status: newStatus };
    const { error } = await supabase.from('governance_responsibilities').update(updatePayload).eq('id', item.id);
    if (error) toast.error(t.error_generic);
    else {
      await auditLog('governance_status_change', { id: item.id, old: item.status, new: newStatus });
      loadData();
    }
  };

  const handleDelete = async (item: GovernanceResponsibility) => {
    if (!confirm(t.gov_delete_confirm)) return;
    const { error } = await supabase.from('governance_responsibilities').delete().eq('id', item.id);
    if (error) toast.error(t.error_generic);
    else {
      toast.success(t.gov_deleted);
      await auditLog('governance_deleted', { id: item.id, title: item.title });
      loadData();
    }
  };

  // Derived data
  const filtered = useMemo(() => {
    let result = [...items];
    if (filterArea !== 'all') result = result.filter(i => i.area === filterArea);
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);
    if (filterMember !== 'all') {
      if (filterMember === 'unassigned') result = result.filter(i => !i.member_id);
      else result = result.filter(i => i.member_id === filterMember);
    }
    return result;
  }, [items, filterArea, filterStatus, filterMember]);

  const grouped = useMemo(() => {
    const g: Record<string, GovernanceResponsibility[]> = {};
    for (const item of filtered) {
      if (!g[item.area]) g[item.area] = [];
      g[item.area].push(item);
    }
    return g;
  }, [filtered]);

  const stats = useMemo(() => ({
    total: items.length,
    assigned: items.filter(i => i.member_id).length,
    blocked: items.filter(i => i.status === 'blocked').length,
    needsAttention: items.filter(i => i.status === 'needs_attention').length,
    completed: items.filter(i => i.status === 'completed').length,
  }), [items]);

  const getMemberName = (id: string) => {
    const m = members.find(mb => mb.user_id === id);
    return m?.profiles?.full_name || m?.profiles?.email || 'Membre';
  };

  const toggleArea = (a: string) => {
    setCollapsedAreas(prev => {
      const s = new Set(prev);
      if (s.has(a)) s.delete(a);
      else s.add(a);
      return s;
    });
  };

  if (loading) return <AppLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></AppLayout>;
  if (!circle) return <AppLayout><div className="text-center py-20"><p className="text-muted-foreground">{t.please_create_circle}</p><Button className="mt-4" onClick={() => window.location.href = '/circle'}>{t.create_circle}</Button></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in px-1">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-heading text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent shrink-0" />
                Gouvernance
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                Coordination des responsabilités familiales.
              </p>
            </div>
            {canEdit && (
              <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 shrink-0"><Plus className="h-4 w-4" />Ajouter</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-heading">{editItem ? 'Modifier la responsabilité' : 'Assigner une responsabilité'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Domaine</Label>
                      <Select value={area} onValueChange={(v) => setArea(v as GovernanceArea)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {areaOrder.map(k => <SelectItem key={k} value={k}>{areaLabels[k]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Titre</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Suivi du notaire" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Détails..." rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsable</Label>
                      <Select value={memberId || 'none'} onValueChange={(v) => setMemberId(v === 'none' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Choisir un membre" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Non attribué</SelectItem>
                          {members.map(m => (
                            <SelectItem key={m.user_id} value={m.user_id}>
                              {m.profiles?.full_name || m.profiles?.email || 'Membre'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={formStatus} onValueChange={(v) => setFormStatus(v as GovernanceStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Échéance</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, 'PPP', { locale: fr }) : 'Pas d\'échéance'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                      {dueDate && <Button type="button" variant="ghost" size="sm" onClick={() => setDueDate(undefined)} className="text-xs">Retirer</Button>}
                    </div>
                    <div className="space-y-2">
                      <Label>Checklist lié</Label>
                      <Select value={linkedChecklist || 'none'} onValueChange={(v) => setLinkedChecklist(v === 'none' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {checklists.map(cl => <SelectItem key={cl.id} value={cl.id}>{cl.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Document lié</Label>
                      <Select value={linkedDoc || 'none'} onValueChange={(v) => setLinkedDoc(v === 'none' ? '' : v)}>
                        <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {documents.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Note</Label>
                      <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Remarques..." rows={2} />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving || !memberId}>
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editItem ? 'Enregistrer' : 'Assigner'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Summary cards */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { value: stats.assigned, label: 'Assignées', color: 'text-foreground' },
              { value: stats.completed, label: 'Complétées', color: 'text-green-600' },
              { value: stats.blocked, label: 'Bloquées', color: 'text-destructive' },
              { value: stats.needsAttention, label: 'Attention', color: 'text-amber-600' },
            ].map((s) => (
              <Card key={s.label} className="shadow-soft">
                <CardContent className="p-3 sm:py-4 text-center">
                  <p className={`text-xl sm:text-2xl font-semibold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        {stats.total > 0 && (
          <Card className="shadow-soft">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground">Filtres</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Domaine" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les domaines</SelectItem>
                    {areaOrder.map(k => <SelectItem key={k} value={k}>{areaLabels[k]}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterMember} onValueChange={setFilterMember}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Responsable" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les membres</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.profiles?.full_name || 'Membre'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items grouped by area */}
        {filtered.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {items.length === 0
                  ? 'Aucune responsabilité assignée.'
                  : 'Aucun élément correspondant aux filtres.'}
              </p>
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Assignez des responsabilités à chaque membre.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {areaOrder.filter(a => grouped[a]).map(a => {
              const areaItems = grouped[a];
              const isCollapsed = collapsedAreas.has(a);
              const areaCompleted = areaItems.filter(i => i.status === 'completed').length;
              return (
                <Card key={a} className="shadow-soft overflow-hidden">
                  <CardHeader className="p-3 sm:p-4 pb-2 cursor-pointer" onClick={() => toggleArea(a)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {isCollapsed
                          ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                        <CardTitle className="font-heading text-sm sm:text-base truncate">{areaLabels[a as GovernanceArea]}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0 ml-2">{areaCompleted}/{areaItems.length}</Badge>
                    </div>
                  </CardHeader>
                  {!isCollapsed && (
                    <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
                      {areaItems.map(item => (
                        <div key={item.id} className="rounded-lg border border-border bg-background p-3 space-y-2.5">
                          {/* Title row */}
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground leading-snug flex-1 min-w-0 break-words">
                              {item.title}
                            </p>
                            <Badge className={`text-[10px] px-1.5 py-0.5 shrink-0 ${statusColors[item.status]}`}>
                              {statusLabels[item.status]}
                            </Badge>
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed break-words">{item.description}</p>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate max-w-[120px]">{getMemberName(item.member_id)}</span>
                            </span>
                            {item.due_date && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 shrink-0" />
                                {new Date(item.due_date).toLocaleDateString('fr-FR')}
                              </span>
                            )}
                            {item.linked_document && (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <FileText className="h-3 w-3" />Doc
                              </span>
                            )}
                            {item.linked_checklist_item && (
                              <span className="inline-flex items-center gap-1 text-primary">
                                <CheckSquare className="h-3 w-3" />Check
                              </span>
                            )}
                          </div>

                          {/* Note */}
                          {item.note && (
                            <p className="text-xs text-muted-foreground/80 italic break-words">💬 {item.note}</p>
                          )}

                          {/* Actions */}
                          {canEdit && (
                            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                              <Select value={item.status} onValueChange={(v) => handleQuickStatus(item, v as GovernanceStatus)}>
                                <SelectTrigger className="h-7 text-[11px] flex-1 max-w-[160px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={() => openEdit(item)}>
                                Modifier
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-destructive hover:text-destructive" onClick={() => handleDelete(item)}>
                                ×
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

export default GovernancePage;
