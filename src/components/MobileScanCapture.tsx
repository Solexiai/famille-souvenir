import React, { useRef, useState } from 'react';
import { Camera, RotateCcw, Check, Loader2, Upload, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { validateUpload } from '@/lib/upload-validation';
import { prepareImageForUpload } from '@/lib/image-preparation';
import { logAuditEvent } from '@/lib/audit';
import { AI_COPY, type AILang } from '@/lib/ai-assistant-i18n';
import { useLocale } from '@/contexts/LocaleContext';
import { convertScanImageToPdf } from '@/lib/scan-to-pdf';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  circleId: string;
  onUploaded?: () => void;
}

/**
 * Kickstarter-demo stable scan flow:
 *   capture → preview → metadata → save
 *
 * No crop, no filter, no perspective correction. PDF conversion is best-effort
 * with a graceful fallback to the original image (JPG).
 */
type Step = 'capture' | 'preview' | 'metadata';

export const MobileScanCapture: React.FC<Props> = ({ open, onOpenChange, circleId, onUploaded }) => {
  const { user } = useAuth();
  const { t, lang } = useLocale();
  const aiLang: AILang = (['fr', 'en', 'es'].includes(lang) ? lang : 'en') as AILang;
  const aiT = AI_COPY[aiLang];

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('capture');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdfInput, setIsPdfInput] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'identity', label: t.category_doc_identity },
    { value: 'testament', label: t.category_doc_testament },
    { value: 'mandate', label: t.category_doc_mandate },
    { value: 'insurance', label: t.category_doc_insurance },
    { value: 'banking', label: t.category_doc_banking },
    { value: 'property', label: t.category_doc_property },
    { value: 'medical', label: t.category_doc_medical },
    { value: 'wishes', label: t.category_doc_wishes },
    { value: 'other', label: t.category_doc_other },
  ];

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep('capture');
    setFile(null);
    setPreviewUrl(null);
    setIsPdfInput(false);
    setTitle('');
    setCategory('other');
    setUploading(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setIsPdfInput(f.type === 'application/pdf');
    setStep('preview');
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setIsPdfInput(false);
    setStep('capture');
  };

  const handleSave = async () => {
    if (!file || !user || !title.trim()) return;
    setUploading(true);
    try {
      // 1. Prepare the file (PDFs as-is, images get EXIF strip + resize)
      let prepared: File;
      try {
        prepared = isPdfInput ? file : await prepareImageForUpload(file);
      } catch {
        prepared = file;
      }

      // 2. Try PDF conversion (best-effort). Falls back to original image silently.
      let conversion;
      if (isPdfInput) {
        conversion = {
          file: prepared,
          converted: false,
          storedFileType: 'application/pdf',
          originalFileType: 'application/pdf',
        };
      } else {
        try {
          conversion = await convertScanImageToPdf(prepared, title.trim());
        } catch {
          conversion = {
            file: prepared,
            converted: false,
            storedFileType: prepared.type || 'image/jpeg',
            originalFileType: prepared.type || 'image/jpeg',
          };
        }
      }
      const finalFile = conversion.file;

      // 3. Validate
      const validation = await validateUpload(finalFile, 'document', circleId);
      if (!validation.allowed) {
        toast.error(validation.error || t.docs_upload_error);
        return;
      }

      // 4. Upload to storage
      const ext = (finalFile.name.split('.').pop() || (conversion.converted ? 'pdf' : 'jpg')).toLowerCase();
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('vault-private').upload(storagePath, finalFile);
      if (upErr) {
        toast.error(t.docs_upload_error);
        return;
      }

      // 5. Insert document row
      const { error } = await supabase.from('documents').insert({
        circle_id: circleId,
        uploaded_by: user.id,
        title: title.trim(),
        description: '',
        category,
        visibility: 'private_owner',
        storage_path: storagePath,
        file_name: finalFile.name,
        file_size: finalFile.size,
        upload_source: 'mobile_scan',
        original_file_type: conversion.originalFileType,
        stored_file_type: conversion.storedFileType,
        converted_to_pdf: conversion.converted,
        ai_classification_status: 'not_classified',
        reviewed_by_user: false,
      } as never);
      if (error) {
        toast.error(t.docs_save_error);
        return;
      }

      await logAuditEvent('document_scanned', circleId, {
        title: title.trim(),
        category,
        source: 'mobile_scan',
        converted_to_pdf: conversion.converted,
        original_file_type: conversion.originalFileType,
        stored_file_type: conversion.storedFileType,
      });

      toast.success(aiT.scan_vault_toast);
      onUploaded?.();
      handleClose(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg mx-3 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Camera className="h-5 w-5 text-accent" />
            {aiT.scan_dialog_title}
          </DialogTitle>
        </DialogHeader>

        {step === 'capture' && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">{aiT.scan_camera_hint}</p>
            <p className="text-xs text-muted-foreground/80 italic">{aiT.scan_pdf_hint}</p>
            <div className="grid gap-2">
              <Button size="lg" className="w-full gap-2" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="h-5 w-5" />
                {aiT.scan_use_camera}
              </Button>
              <Button size="lg" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-5 w-5" />
                {aiT.scan_choose_file}
              </Button>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileSelected}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileSelected}
            />
          </div>
        )}

        {step === 'preview' && previewUrl && (
          <div className="space-y-3 py-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{aiT.scan_preview_title}</p>
            <div className="rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center max-h-[55vh]">
              {isPdfInput ? (
                <div className="p-8 text-center text-sm text-muted-foreground">PDF · {file?.name}</div>
              ) : (
                <img src={previewUrl} alt="scan preview" className="max-h-[55vh] w-auto object-contain" />
              )}
            </div>
            <p className="text-xs text-muted-foreground italic">{aiT.scan_future_hint}</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={retake} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {aiT.scan_retake}
              </Button>
              <Button onClick={() => setStep('metadata')} className="gap-2">
                <Check className="h-4 w-4" />
                {aiT.scan_use_this}
              </Button>
            </div>
          </div>
        )}

        {step === 'metadata' && (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm">{aiT.scan_name_label}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={aiT.scan_name_placeholder}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">{aiT.scan_category}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setStep('preview')}
                disabled={uploading}
                className="gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {aiT.scan_back}
              </Button>
              <Button onClick={handleSave} disabled={uploading || !title.trim()} className="gap-2">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {uploading ? aiT.scan_uploading : aiT.scan_save}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MobileScanCapture;
