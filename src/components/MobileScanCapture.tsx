import React, { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, Check, Loader2, Upload, ArrowLeft, Crop, Sparkles } from 'lucide-react';
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
import {
  loadImageFromFile,
  perspectiveCrop,
  applyFilter,
  suggestQuad,
  canvasToFile,
  defaultCenteredQuad,
  type Quad,
  type ScanFilter,
} from '@/lib/scan-image-processing';
import { ScanCropEditor } from './ScanCropEditor';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  circleId: string;
  onUploaded?: () => void;
}

type Step = 'capture' | 'preview' | 'crop' | 'filter' | 'metadata';

export const MobileScanCapture: React.FC<Props> = ({ open, onOpenChange, circleId, onUploaded }) => {
  const { user } = useAuth();
  const { t, lang } = useLocale();
  const aiLang: AILang = (['fr', 'en', 'es'].includes(lang) ? lang : 'en') as AILang;
  const aiT = AI_COPY[aiLang];

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filterPreviewRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<Step>('capture');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [isPdfInput, setIsPdfInput] = useState(false);
  const [quad, setQuad] = useState<Quad | null>(null);
  const [autoSuggested, setAutoSuggested] = useState(false);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [filter, setFilter] = useState<ScanFilter>('enhanced');
  const [filteredCanvas, setFilteredCanvas] = useState<HTMLCanvasElement | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

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
    setSourceImage(null);
    setIsPdfInput(false);
    setQuad(null);
    setAutoSuggested(false);
    setCroppedCanvas(null);
    setFilter('enhanced');
    setFilteredCanvas(null);
    setTitle('');
    setCategory('other');
    setUploading(false);
    setProcessing(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const isPdf = f.type === 'application/pdf';
    setIsPdfInput(isPdf);
    setStep('preview');

    if (!isPdf && f.type.startsWith('image/')) {
      try {
        const img = await loadImageFromFile(f);
        setSourceImage(img);
        // best-effort initial suggestion
        const suggested = suggestQuad(img);
        if (suggested) {
          setQuad(suggested);
          setAutoSuggested(true);
        } else {
          setQuad(defaultCenteredQuad(img.naturalWidth, img.naturalHeight));
          setAutoSuggested(false);
        }
      } catch {
        setSourceImage(null);
      }
    }
  };

  const goToCrop = () => {
    if (!sourceImage) {
      // PDFs / failed loads → skip crop & filter, go straight to metadata
      setStep('metadata');
      return;
    }
    setStep('crop');
  };

  const confirmCrop = async () => {
    if (!sourceImage || !quad) return;
    setProcessing(true);
    try {
      const cropped = perspectiveCrop(sourceImage, quad);
      setCroppedCanvas(cropped);
      // pre-render default filter
      const filtered = applyFilter(cropped, filter);
      setFilteredCanvas(filtered);
      setStep('filter');
    } finally {
      setProcessing(false);
    }
  };

  const useFullImage = () => {
    if (!sourceImage) return;
    setProcessing(true);
    try {
      // Just copy the source to a canvas
      const c = document.createElement('canvas');
      c.width = sourceImage.naturalWidth;
      c.height = sourceImage.naturalHeight;
      c.getContext('2d')?.drawImage(sourceImage, 0, 0);
      setCroppedCanvas(c);
      setFilteredCanvas(applyFilter(c, filter));
      setStep('filter');
    } finally {
      setProcessing(false);
    }
  };

  // Re-apply filter when selection changes
  useEffect(() => {
    if (step !== 'filter' || !croppedCanvas) return;
    const next = applyFilter(croppedCanvas, filter);
    setFilteredCanvas(next);
  }, [filter, step, croppedCanvas]);

  // Render filter preview to <canvas>
  useEffect(() => {
    if (step !== 'filter' || !filteredCanvas || !filterPreviewRef.current) return;
    const target = filterPreviewRef.current;
    const maxDim = 360;
    const r = Math.min(1, maxDim / Math.max(filteredCanvas.width, filteredCanvas.height));
    target.width = Math.max(1, Math.round(filteredCanvas.width * r));
    target.height = Math.max(1, Math.round(filteredCanvas.height * r));
    const ctx = target.getContext('2d');
    ctx?.drawImage(filteredCanvas, 0, 0, target.width, target.height);
  }, [filteredCanvas, step]);

  const handleSave = async () => {
    if (!file || !user || !title.trim()) return;
    setUploading(true);
    try {
      let toUpload: File;

      if (isPdfInput) {
        // Upload the PDF directly
        toUpload = file;
      } else if (filteredCanvas) {
        // Use the cropped + filtered canvas
        toUpload = await canvasToFile(filteredCanvas, title.trim(), 0.92);
      } else {
        // Fallback: original image, EXIF-stripped + resized
        toUpload = await prepareImageForUpload(file);
      }

      // Try converting raster image → PDF (single-page A4)
      let conversion;
      if (isPdfInput) {
        conversion = {
          file: toUpload,
          converted: false,
          storedFileType: 'application/pdf',
          originalFileType: 'application/pdf',
        };
      } else {
        conversion = await convertScanImageToPdf(toUpload, title.trim());
      }
      const finalFile = conversion.file;

      const validation = await validateUpload(finalFile, 'document', circleId);
      if (!validation.allowed) {
        toast.error(validation.error || t.docs_upload_error);
        return;
      }

      const ext = finalFile.name.split('.').pop() || (conversion.converted ? 'pdf' : 'jpg');
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('vault-private').upload(storagePath, finalFile);
      if (upErr) {
        toast.error(t.docs_upload_error);
        return;
      }
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
        filter: isPdfInput ? null : filter,
        cropped: !isPdfInput,
      });
      toast.success(aiT.scan_success);
      onUploaded?.();
      handleClose(false);
    } finally {
      setUploading(false);
    }
  };

  const filterOptions: { value: ScanFilter; label: string }[] = [
    { value: 'enhanced', label: aiT.scan_filter_enhanced },
    { value: 'original', label: aiT.scan_filter_original },
    { value: 'grayscale', label: aiT.scan_filter_grayscale },
    { value: 'bw', label: aiT.scan_filter_bw },
  ];

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
                <img src={previewUrl} alt="scan preview" className="max-h-[55vh] w-auto" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setFile(null);
                  setPreviewUrl(null);
                  setSourceImage(null);
                  setStep('capture');
                }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {aiT.scan_retake}
              </Button>
              <Button onClick={goToCrop} disabled={processing} className="gap-2">
                <Check className="h-4 w-4" />
                {aiT.scan_use_this}
              </Button>
            </div>
          </div>
        )}

        {step === 'crop' && sourceImage && (
          <div className="space-y-3 py-2">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Crop className="h-4 w-4 text-accent" />
                {aiT.scan_step_crop_title}
              </p>
              <p className="text-xs text-muted-foreground">{aiT.scan_step_crop_hint}</p>
              {autoSuggested && (
                <p className="text-[11px] text-accent mt-1">{aiT.scan_crop_auto_suggested}</p>
              )}
            </div>
            <ScanCropEditor image={sourceImage} initialQuad={quad} onChange={setQuad} />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={useFullImage} disabled={processing}>
                {aiT.scan_crop_use_full}
              </Button>
              <Button onClick={confirmCrop} disabled={processing || !quad} className="gap-2">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {aiT.scan_crop_confirm}
              </Button>
            </div>
            <div className="flex justify-start">
              <Button variant="ghost" size="sm" onClick={() => setStep('preview')} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                {aiT.scan_back}
              </Button>
            </div>
          </div>
        )}

        {step === 'filter' && (
          <div className="space-y-3 py-2">
            <div>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                {aiT.scan_step_filter_title}
              </p>
              <p className="text-xs text-muted-foreground">{aiT.scan_step_filter_hint}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center max-h-[45vh]">
              <canvas ref={filterPreviewRef} className="max-h-[45vh] w-auto" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filterOptions.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFilter(f.value)}
                  className={`text-xs px-3 py-2 rounded-md border transition ${
                    filter === f.value
                      ? 'border-accent bg-accent/10 text-foreground'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep('crop')} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                {aiT.scan_back}
              </Button>
              <Button onClick={() => setStep('metadata')} className="gap-2">
                <Check className="h-4 w-4" />
                {aiT.scan_continue}
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
                onClick={() => setStep(sourceImage ? 'filter' : 'preview')}
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
