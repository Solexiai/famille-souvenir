import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Check, ListChecks, UserPlus, Shield, Loader2, AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Document as DocType, ChecklistCategory, GovernanceArea } from '@/types/database';
import { AI_COPY, type AILang } from '@/lib/ai-assistant-i18n';
import { useAuth } from '@/contexts/AuthContext';
import { logAuditEvent } from '@/lib/audit';

export interface AiClassificationResult {
  suggested_category: string;
  confidence: number;
  reason: string;
  recommended_next_steps: string[];
  professional_review_recommended: boolean;
}

interface Props {
  doc: DocType;
  result: AiClassificationResult;
  circleId: string;
  aiLang: AILang;
  categoryLabel: string;
  onApplied: () => void;
  onDismiss: () => void;
}

// Map document category → checklist category
const docToChecklistCategory = (docCat: string): ChecklistCategory => {
  const map: Record<string, ChecklistCategory> = {
    identity: 'identity',
    testament: 'legal',
    mandate: 'legal',
    insurance: 'insurance',
    banking: 'financial',
    investments: 'financial',
    property: 'property',
    vehicles: 'property',
    debts: 'financial',
    taxes: 'financial',
    medical: 'final_wishes',
    wishes: 'final_wishes',
    contracts: 'legal',
    subscriptions: 'digital_estate',
    digital_assets: 'digital_estate',
    funeral: 'final_wishes',
  };
  return map[docCat] || 'legal';
};

// Map document category → governance area
const docToGovernanceArea = (docCat: string): GovernanceArea => {
  const map: Record<string, GovernanceArea> = {
    identity: 'documents',
    testament: 'legal_follow_up',
    mandate: 'legal_follow_up',
    insurance: 'insurance',
    banking: 'finances',
    investments: 'finances',
    property: 'property',
    vehicles: 'property',
    debts: 'finances',
    taxes: 'finances',
    medical: 'medical_directives',
    wishes: 'funeral_wishes',
    contracts: 'legal_follow_up',
    subscriptions: 'digital_assets',
    digital_assets: 'digital_assets',
    funeral: 'funeral_wishes',
  };
  return map[docCat] || 'documents';
};

export const DocumentClassificationActions: React.FC<Props> = ({
  doc, result, circleId, aiLang, categoryLabel, onApplied, onDismiss,
}) => {
  const { user } = useAuth();
  const aiT = AI_COPY[aiLang];

  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<{ category?: boolean; checklist?: boolean; reviewer?: boolean; governance?: boolean }>({});
  const [reviewerOpen, setReviewerOpen] = useState(false);

  const apply = async () => {
    setBusy('apply');
    try {
      const { error } = await supabase.from('documents').update({
        category: result.suggested_category,
        ai_classification_status: 'classified',
      } as never).eq('id', doc.id);
      if (error) { toast.error(aiT.error_generic); return; }
      setDone((d) => ({ ...d, category: true }));
      onApplied();
    } finally { setBusy(null); }
  };

  const addToChecklist = async () => {
    if (!user) return;
    setBusy('checklist');
    try {
      // Check if already linked
      const { data: existing } = await supabase
        .from('checklist_items')
        .select('id')
        .eq('circle_id', circleId)
        .eq('linked_document_id', doc.id)
        .limit(1);
      if (existing && existing.length > 0) {
        toast.info(aiT.classify_already_in_checklist);
        setDone((d) => ({ ...d, checklist: true }));
        return;
      }
      const { error } = await supabase.from('checklist_items').insert({
        circle_id: circleId,
        category: docToChecklistCategory(result.suggested_category),
        title: `${aiT.classify_checklist_task_prefix} ${doc.title}`,
        description: result.recommended_next_steps?.[0] || result.reason,
        status: 'not_started',
        linked_document_id: doc.id,
        requires_professional_review: result.professional_review_recommended,
        evidence_note: '',
        source: 'ai_document_classification',
      } as never);
      if (error) { toast.error(aiT.error_generic); return; }
      await logAuditEvent('document_added_to_checklist', circleId, {
        document_id: doc.id, source: 'ai_document_classification',
      });
      toast.success(aiT.classify_added_to_checklist);
      setDone((d) => ({ ...d, checklist: true }));
    } finally { setBusy(null); }
  };

  const sendToGovernance = async () => {
    if (!user) return;
    setBusy('governance');
    try {
      const { data: existing } = await supabase
        .from('governance_responsibilities')
        .select('id')
        .eq('circle_id', circleId)
        .eq('linked_document', doc.id)
        .limit(1);
      if (existing && existing.length > 0) {
        toast.info(aiT.classify_already_in_governance);
        setDone((d) => ({ ...d, governance: true }));
        return;
      }
      const { error } = await supabase.from('governance_responsibilities').insert({
        circle_id: circleId,
        member_id: user.id,
        area: docToGovernanceArea(result.suggested_category),
        title: `${aiT.classify_checklist_task_prefix} ${doc.title}`,
        description: result.reason,
        status: 'needs_attention',
        linked_document: doc.id,
        note: result.professional_review_recommended
          ? aiT.pro_review_badge
          : '',
      } as never);
      if (error) { toast.error(aiT.error_generic); return; }
      await logAuditEvent('document_sent_to_governance', circleId, {
        document_id: doc.id, source: 'ai_document_classification',
      });
      toast.success(aiT.classify_sent_to_governance);
      setDone((d) => ({ ...d, governance: true }));
    } finally { setBusy(null); }
  };

  return (
    <div className="mt-2 rounded-lg border border-accent/30 bg-accent/5 p-3 space-y-3">
      {/* AI summary header */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 text-[10px]">
          {aiT.ai_badge}
        </Badge>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
          aria-label="dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground">{aiT.classify_disclaimer}</p>

      <div className="text-xs space-y-1">
        <p>
          <span className="font-medium">{aiT.classify_result_title}: </span>
          {categoryLabel}
          <span className="text-muted-foreground"> · {aiT.classify_confidence} {Math.round(result.confidence * 100)}%</span>
        </p>
        <p className="text-foreground/80"><span className="font-medium">{aiT.classify_reason}: </span>{result.reason}</p>
        {result.recommended_next_steps?.length > 0 && (
          <ul className="list-disc list-inside text-foreground/80">
            {result.recommended_next_steps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        )}
        {result.professional_review_recommended && (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 gap-1 text-[10px] mt-1">
            <AlertTriangle className="h-3 w-3" />
            {aiT.pro_review_badge}
          </Badge>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <Button
          size="sm"
          variant={done.category ? 'outline' : 'default'}
          className="text-[11px] h-8 gap-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-70"
          onClick={apply}
          disabled={busy !== null || done.category}
        >
          {busy === 'apply' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          {done.category ? '✓ ' : ''}{aiT.classify_action_apply}
        </Button>
        <Button
          size="sm"
          variant={done.checklist ? 'secondary' : 'outline'}
          className="text-[11px] h-8 gap-1"
          onClick={addToChecklist}
          disabled={busy !== null || done.checklist}
        >
          {busy === 'checklist' ? <Loader2 className="h-3 w-3 animate-spin" /> : <ListChecks className="h-3 w-3" />}
          {done.checklist ? '✓ ' : ''}{aiT.classify_action_add_checklist}
        </Button>
        <Button
          size="sm"
          variant={done.reviewer ? 'secondary' : 'outline'}
          className="text-[11px] h-8 gap-1"
          onClick={() => setReviewerOpen(true)}
          disabled={busy !== null}
        >
          <UserPlus className="h-3 w-3" />
          {done.reviewer ? '✓ ' : ''}{aiT.classify_action_assign_reviewer}
        </Button>
        <Button
          size="sm"
          variant={done.governance ? 'secondary' : 'outline'}
          className="text-[11px] h-8 gap-1"
          onClick={sendToGovernance}
          disabled={busy !== null || done.governance}
        >
          {busy === 'governance' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
          {done.governance ? '✓ ' : ''}{aiT.classify_action_send_governance}
        </Button>
      </div>

      <ReviewerDialog
        open={reviewerOpen}
        onOpenChange={setReviewerOpen}
        doc={doc}
        aiLang={aiLang}
        onSaved={() => setDone((d) => ({ ...d, reviewer: true }))}
      />
    </div>
  );
};

// ---------- Reviewer Dialog ----------
interface ReviewerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  doc: DocType;
  aiLang: AILang;
  onSaved: () => void;
}

const ReviewerDialog: React.FC<ReviewerDialogProps> = ({ open, onOpenChange, doc, aiLang, onSaved }) => {
  const aiT = AI_COPY[aiLang];
  const { user } = useAuth();
  const [reviewerType, setReviewerType] = useState<'self' | 'circle' | 'external'>('self');
  const [name, setName] = useState('');
  const [role, setRole] = useState('family');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const roleOptions = [
    { value: 'family', label: aiT.reviewer_role_family },
    { value: 'executor', label: aiT.reviewer_role_executor },
    { value: 'notary', label: aiT.reviewer_role_notary },
    { value: 'advisor', label: aiT.reviewer_role_advisor },
    { value: 'other', label: aiT.reviewer_role_other },
  ];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        assigned_reviewer_role: role,
        reviewer_due_date: dueDate || null,
      };
      if (reviewerType === 'self') {
        payload.assigned_reviewer_user_id = user.id;
        payload.assigned_reviewer_name = null;
      } else {
        payload.assigned_reviewer_name = name.trim() || null;
        payload.assigned_reviewer_user_id = null;
      }
      const { error } = await supabase.from('documents').update(payload as never).eq('id', doc.id);
      if (error) { toast.error(aiT.error_generic); return; }
      toast.success(aiT.reviewer_saved);
      onSaved();
      onOpenChange(false);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-3">
        <DialogHeader>
          <DialogTitle className="font-heading">{aiT.reviewer_dialog_title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">{aiT.reviewer_choose}</Label>
            <Select value={reviewerType} onValueChange={(v) => setReviewerType(v as 'self' | 'circle' | 'external')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">{aiT.reviewer_self}</SelectItem>
                <SelectItem value="circle">{aiT.reviewer_circle_member}</SelectItem>
                <SelectItem value="external">{aiT.reviewer_external}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reviewerType !== 'self' && (
            <div className="space-y-1.5">
              <Label className="text-sm">{aiT.reviewer_name_label}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={aiT.reviewer_name_placeholder} />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm">{aiT.reviewer_role_label}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">{aiT.reviewer_due_date_label}</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {aiT.reviewer_save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentClassificationActions;
