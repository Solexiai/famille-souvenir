/**
 * Client-side upload validation + server-side validation via edge function.
 * Double validation: client filters obvious issues, server enforces rules.
 */

import { supabase } from '@/integrations/supabase/client';

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'scr', 'pif',
  'js', 'vbs', 'wsf', 'ps1', 'sh', 'bash',
  'php', 'asp', 'aspx', 'jsp', 'cgi',
  'html', 'htm', 'svg', 'xml',
  'dll', 'sys', 'drv',
]);

const ALLOWED_MIMES: Record<string, string[]> = {
  photo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  document: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
};

export interface UploadValidationResult {
  allowed: boolean;
  error?: string;
  code?: string;
}

/**
 * Read first 8 bytes of a file as hex string for magic byte validation.
 */
async function readMagicBytes(file: File): Promise<string> {
  const slice = file.slice(0, 8);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates a file upload both client-side and server-side.
 */
export async function validateUpload(
  file: File,
  fileType: 'photo' | 'video' | 'audio' | 'document',
  circleId: string,
): Promise<UploadValidationResult> {
  // 1. Client-side: extension check
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { allowed: false, error: 'Format de fichier interdit', code: 'BLOCKED_FORMAT' };
  }

  // 2. Client-side: MIME check
  const allowedMimes = ALLOWED_MIMES[fileType];
  if (!allowedMimes?.includes(file.type)) {
    return { allowed: false, error: 'Type de fichier non autorisé', code: 'INVALID_MIME' };
  }

  // 3. Client-side: basic size check (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return { allowed: false, error: 'Fichier trop volumineux (max 50 Mo)', code: 'FILE_TOO_LARGE' };
  }

  // 4. Read magic bytes
  const magicBytesHex = await readMagicBytes(file);

  // 5. Server-side validation (quotas, plan limits, magic bytes)
  try {
    const { data, error } = await supabase.functions.invoke('validate-upload', {
      body: {
        fileType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        circleId,
        magicBytesHex,
      },
    });

    if (error) {
      console.error('Upload validation error:', error, 'data:', data);
      // Si la fonction a renvoyé un message d'erreur structuré dans data, l'utiliser
      const serverMsg = (data as { error?: string; code?: string } | null)?.error;
      const serverCode = (data as { error?: string; code?: string } | null)?.code;
      return {
        allowed: false,
        error: serverMsg || `Erreur de validation: ${error.message || 'fonction indisponible'}`,
        code: serverCode || 'SERVER_ERROR',
      };
    }

    if (!data?.allowed) {
      return { allowed: false, error: data?.error || 'Upload refusé', code: data?.code };
    }

    return { allowed: true };
  } catch (err) {
    console.error('Upload validation failed:', err);
    // Fail closed — refuse upload if server validation is unavailable
    return { allowed: false, error: 'Validation du fichier indisponible. Réessayez.', code: 'VALIDATION_UNAVAILABLE' };
  }
}
