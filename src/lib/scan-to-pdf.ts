/**
 * Convert a single captured image into a single-page PDF (A4, fits image).
 * Falls back gracefully if conversion fails — caller should keep the original file.
 */
import { jsPDF } from 'jspdf';

export interface ScanConvertResult {
  file: File;
  converted: boolean;
  storedFileType: string;
  originalFileType: string;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 8;

function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

/**
 * Convert an image File to a single-page PDF File.
 * Returns the original file if not an image or if conversion fails.
 */
export async function convertScanImageToPdf(
  imageFile: File,
  baseName: string,
): Promise<ScanConvertResult> {
  const originalFileType = imageFile.type || 'image/jpeg';

  if (!imageFile.type.startsWith('image/')) {
    return { file: imageFile, converted: false, storedFileType: originalFileType, originalFileType };
  }

  try {
    const img = await readImage(imageFile);

    // Compute fit-into-A4 dimensions preserving aspect ratio
    const maxW = A4_WIDTH_MM - MARGIN_MM * 2;
    const maxH = A4_HEIGHT_MM - MARGIN_MM * 2;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const drawW = img.width * ratio;
    const drawH = img.height * ratio;
    const offsetX = (A4_WIDTH_MM - drawW) / 2;
    const offsetY = (A4_HEIGHT_MM - drawH) / 2;

    // Draw to canvas to obtain JPEG dataURL (small, embedded)
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas-unavailable');
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(dataUrl, 'JPEG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');

    const blob = pdf.output('blob');
    const safeBase = (baseName || 'scan').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'scan';
    const pdfFile = new File([blob], `${safeBase}.pdf`, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });

    return {
      file: pdfFile,
      converted: true,
      storedFileType: 'application/pdf',
      originalFileType,
    };
  } catch (err) {
    console.warn('PDF conversion failed, falling back to image:', err);
    return { file: imageFile, converted: false, storedFileType: originalFileType, originalFileType };
  }
}
