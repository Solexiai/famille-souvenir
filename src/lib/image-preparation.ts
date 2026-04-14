/**
 * Client-side image preparation: strips EXIF/GPS metadata and resizes large images.
 * Uses Canvas API — no external dependencies.
 */

const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 0.85;

/**
 * Strips EXIF metadata and resizes image if larger than MAX_DIMENSION.
 * Returns a new File ready for upload.
 * Canvas.drawImage inherently drops all EXIF data including GPS coordinates.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  // Only process image files
  if (!file.type.startsWith('image/')) return file;

  // Skip GIFs (animated) and non-raster formats
  if (file.type === 'image/gif') return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Calculate new dimensions if needed
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback: return original file if canvas unavailable
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format: keep PNG for PNGs, JPEG for everything else
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = outputType === 'image/jpeg' ? JPEG_QUALITY : undefined;
      const ext = outputType === 'image/png' ? '.png' : '.jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Preserve original name but update extension if format changed
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFile = new File([blob], `${baseName}${ext}`, {
            type: outputType,
            lastModified: Date.now(),
          });

          resolve(newFile);
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // On error, return original file rather than blocking upload
      resolve(file);
    };

    img.src = url;
  });
}
