import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Mic, Loader2, Sparkles, Square, Upload } from 'lucide-react';
import { toast } from 'sonner';

export type ExtractedRecipe = {
  detected_language?: string;
  is_handwritten?: boolean;
  title: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  preparation_time_minutes: number;
  cooking_time_minutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  dish_type: 'appetizer' | 'soup' | 'main' | 'side' | 'dessert' | 'preserve' | 'drink' | 'sauce' | 'bread' | 'other';
  notes?: string;
  scannedImageBase64?: string; // we send back the original image so parent can store it
};

interface Props {
  open: boolean;
  onClose: () => void;
  onExtracted: (recipe: ExtractedRecipe) => void;
  initialMode?: 'choose' | 'record';
}

const fileToBase64 = (file: File | Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const RecipeQuickAddDialog: React.FC<Props> = ({ open, onClose, onExtracted, initialMode }) => {
  const [mode, setMode] = useState<'choose' | 'scanning' | 'recording' | 'transcribing'>('choose');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const reset = () => {
    setMode('choose');
    audioChunksRef.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ---- IMAGE FLOW ----
  const handleImageFile = async (file: File) => {
    if (!file) return;
    setMode('scanning');
    try {
      const dataUrl = await fileToBase64(file);
      const { data, error } = await supabase.functions.invoke('scan-recipe', {
        body: { imageBase64: dataUrl, mimeType: file.type || 'image/jpeg' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const recipe = data?.recipe as ExtractedRecipe;
      if (!recipe) throw new Error('Aucune recette détectée');
      recipe.scannedImageBase64 = dataUrl;
      onExtracted(recipe);
      reset();
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Échec de l'analyse";
      if (msg.includes('429') || msg.toLowerCase().includes('trop')) {
        toast.error('Trop de requêtes IA. Réessayez dans quelques secondes.');
      } else if (msg.includes('402') || msg.toLowerCase().includes('crédits')) {
        toast.error('Crédits IA épuisés. Ajoutez des crédits dans votre espace Lovable.');
      } else {
        toast.error(msg);
      }
      setMode('choose');
    }
  };

  // ---- AUDIO FLOW ----
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setMode('recording');
    } catch (e) {
      console.error(e);
      toast.error("Impossible d'accéder au microphone. Autorisez l'accès et réessayez.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setMode('transcribing');
  };

  const processAudio = async (blob: Blob) => {
    try {
      const dataUrl = await fileToBase64(blob);
      const { data, error } = await supabase.functions.invoke('transcribe-recipe', {
        body: { audioBase64: dataUrl, mimeType: 'audio/webm' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const recipe = data?.recipe as ExtractedRecipe;
      if (!recipe) throw new Error('Aucune recette détectée dans l\'audio');
      onExtracted(recipe);
      reset();
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || 'Échec de la transcription';
      if (msg.includes('429') || msg.toLowerCase().includes('trop')) {
        toast.error('Trop de requêtes IA. Réessayez dans quelques secondes.');
      } else if (msg.includes('402') || msg.toLowerCase().includes('crédits')) {
        toast.error('Crédits IA épuisés. Ajoutez des crédits dans votre espace Lovable.');
      } else {
        toast.error(msg);
      }
      setMode('choose');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[hsl(35_70%_45%)]" />
            Ajouter une recette en un éclair
          </DialogTitle>
          <DialogDescription>
            L'IA détecte automatiquement la langue et remplit le formulaire pour vous. Vous n'aurez qu'à valider.
          </DialogDescription>
        </DialogHeader>

        {mode === 'choose' && (
          <div className="space-y-3 py-2">
            <div className="rounded-xl border-2 border-[hsl(35_60%_55%)]/40 bg-[hsl(35_60%_97%)] p-4 flex gap-3">
              <div className="text-2xl leading-none">📸📸</div>
              <div className="text-sm text-foreground/90 leading-relaxed">
                <p className="font-semibold text-[hsl(35_70%_35%)] mb-1">Conseil : prenez 2 photos de suite</p>
                <p>
                  Pour que l'IA analyse <strong>parfaitement</strong> la recette, prenez d'abord une photo de la <strong>page des ingrédients</strong>, puis une photo des <strong>étapes de préparation</strong>. Vous pourrez les ajouter l'une après l'autre.
                </p>
              </div>
            </div>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full text-left p-5 rounded-xl border-2 border-border hover:border-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_97%)] transition-all flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-[hsl(35_60%_92%)] flex items-center justify-center text-[hsl(35_70%_45%)]">
                <Camera className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold">Prendre une photo</h3>
                <p className="text-sm text-muted-foreground">Carnet manuscrit, livre de recettes, fiche imprimée…</p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full text-left p-5 rounded-xl border-2 border-border hover:border-[hsl(35_60%_55%)] hover:bg-[hsl(35_60%_97%)] transition-all flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-[hsl(35_60%_92%)] flex items-center justify-center text-[hsl(35_70%_45%)]">
                <Upload className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold">Choisir une image</h3>
                <p className="text-sm text-muted-foreground">Depuis vos photos ou votre ordinateur.</p>
              </div>
            </button>

            <button
              onClick={startRecording}
              className="w-full text-left p-5 rounded-xl border-2 border-border hover:border-[hsl(220_45%_40%)] hover:bg-[hsl(220_45%_97%)] transition-all flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-[hsl(220_45%_92%)] flex items-center justify-center text-[hsl(220_45%_25%)]">
                <Mic className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-semibold">Dicter la recette</h3>
                <p className="text-sm text-muted-foreground">Parlez naturellement, l'IA structure tout pour vous.</p>
              </div>
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            />
          </div>
        )}

        {mode === 'scanning' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(35_70%_45%)] mx-auto" />
            <p className="font-medium">L'IA lit votre recette…</p>
            <p className="text-sm text-muted-foreground">Détection de la langue · extraction des ingrédients et étapes</p>
          </div>
        )}

        {mode === 'recording' && (
          <div className="py-10 text-center space-y-4">
            <div className="relative inline-flex">
              <div className="h-20 w-20 rounded-full bg-[hsl(355_60%_55%)]/20 animate-ping absolute inset-0" />
              <div className="h-20 w-20 rounded-full bg-[hsl(355_60%_55%)] flex items-center justify-center relative">
                <Mic className="h-10 w-10 text-white" />
              </div>
            </div>
            <p className="font-medium">Enregistrement en cours…</p>
            <p className="text-sm text-muted-foreground">Décrivez la recette : ingrédients, étapes, occasion, anecdotes…</p>
            <Button onClick={stopRecording} className="gap-2 bg-[hsl(220_45%_25%)]">
              <Square className="h-4 w-4" /> Arrêter et analyser
            </Button>
          </div>
        )}

        {mode === 'transcribing' && (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(220_45%_40%)] mx-auto" />
            <p className="font-medium">L'IA transcrit votre dictée…</p>
            <p className="text-sm text-muted-foreground">Structuration en ingrédients, étapes et histoire</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
