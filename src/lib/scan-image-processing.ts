/**
 * Lightweight client-side image processing for the mobile document scan flow.
 * Pure Canvas2D — no external dependencies.
 *
 * Provides:
 *  - perspective crop from 4 corners (trapezoid → rectangle)
 *  - simple rectangular crop fallback
 *  - filters: original / bw / grayscale / enhanced
 *  - brightness normalization + slight sharpening
 *  - lightweight edge-based corner suggestion (best-effort, optional)
 */

export type ScanFilter = 'original' | 'bw' | 'grayscale' | 'enhanced';

export interface Point {
  x: number;
  y: number;
}

export type Quad = [Point, Point, Point, Point]; // TL, TR, BR, BL (clockwise)

const MAX_OUTPUT_DIM = 2200;

// ---------- helpers ----------

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

export function defaultCenteredQuad(width: number, height: number, inset = 0.08): Quad {
  const ix = width * inset;
  const iy = height * inset;
  return [
    { x: ix, y: iy },
    { x: width - ix, y: iy },
    { x: width - ix, y: height - iy },
    { x: ix, y: height - iy },
  ];
}

export function fullImageQuad(width: number, height: number): Quad {
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ---------- perspective transform ----------
// Solve homography mapping source quad -> destination rectangle.
// Reference: classic 8-DoF projective transform via 8x8 linear system.

function solve8x8(A: number[][], b: number[]): number[] | null {
  // Gaussian elimination
  const n = 8;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    // pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    if (Math.abs(M[i][i]) < 1e-10) return null;
    for (let k = i + 1; k < n; k++) {
      const f = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

/**
 * Compute homography H (3x3) mapping src points to dst points.
 * Returns null if not solvable.
 */
function computeHomography(src: Point[], dst: Point[]): number[] | null {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x: sx, y: sy } = src[i];
    const { x: dx, y: dy } = dst[i];
    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    b.push(dy);
  }
  const h = solve8x8(A, b);
  if (!h) return null;
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/**
 * Apply perspective crop: takes a source image and 4 corners (TL,TR,BR,BL in image px),
 * outputs a rectified rectangular canvas.
 */
export function perspectiveCrop(
  img: HTMLImageElement | HTMLCanvasElement,
  quad: Quad,
): HTMLCanvasElement {
  // Estimate output dimensions from the quad's average widths/heights
  const widthTop = dist(quad[0], quad[1]);
  const widthBot = dist(quad[3], quad[2]);
  const heightL = dist(quad[0], quad[3]);
  const heightR = dist(quad[1], quad[2]);
  let outW = Math.round(Math.max(widthTop, widthBot));
  let outH = Math.round(Math.max(heightL, heightR));
  // Constrain
  const scale = Math.min(1, MAX_OUTPUT_DIM / Math.max(outW, outH));
  outW = Math.max(1, Math.round(outW * scale));
  outH = Math.max(1, Math.round(outH * scale));

  // Compute inverse homography (dst rect → src quad), so each output pixel samples source.
  const dst: Point[] = [
    { x: 0, y: 0 },
    { x: outW, y: 0 },
    { x: outW, y: outH },
    { x: 0, y: outH },
  ];
  const Hinv = computeHomography(dst, [quad[0], quad[1], quad[2], quad[3]]);

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const octx = out.getContext('2d');
  if (!octx) return out;

  // If homography failed, fallback: draw bounding rect.
  if (!Hinv) {
    const minX = Math.min(...quad.map(p => p.x));
    const minY = Math.min(...quad.map(p => p.y));
    const maxX = Math.max(...quad.map(p => p.x));
    const maxY = Math.max(...quad.map(p => p.y));
    octx.drawImage(
      img as CanvasImageSource,
      minX, minY, maxX - minX, maxY - minY,
      0, 0, outW, outH,
    );
    return out;
  }

  // Source canvas to read pixels
  const srcCanvas = document.createElement('canvas');
  const sw = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width;
  const sh = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height;
  srcCanvas.width = sw;
  srcCanvas.height = sh;
  const sctx = srcCanvas.getContext('2d');
  if (!sctx) return out;
  sctx.drawImage(img as CanvasImageSource, 0, 0, sw, sh);
  const srcData = sctx.getImageData(0, 0, sw, sh);
  const sd = srcData.data;

  const outData = octx.createImageData(outW, outH);
  const od = outData.data;

  const [a, b, c, d, e, f, g, h] = Hinv;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const denom = g * x + h * y + 1;
      const sx = (a * x + b * y + c) / denom;
      const sy = (d * x + e * y + f) / denom;
      // bilinear sample
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = x0 + 1;
      const y1 = y0 + 1;
      if (x0 < 0 || y0 < 0 || x1 >= sw || y1 >= sh) {
        const idx = (y * outW + x) * 4;
        od[idx] = 255; od[idx + 1] = 255; od[idx + 2] = 255; od[idx + 3] = 255;
        continue;
      }
      const dx0 = sx - x0;
      const dy0 = sy - y0;
      const w00 = (1 - dx0) * (1 - dy0);
      const w10 = dx0 * (1 - dy0);
      const w01 = (1 - dx0) * dy0;
      const w11 = dx0 * dy0;
      const i00 = (y0 * sw + x0) * 4;
      const i10 = (y0 * sw + x1) * 4;
      const i01 = (y1 * sw + x0) * 4;
      const i11 = (y1 * sw + x1) * 4;
      const idx = (y * outW + x) * 4;
      od[idx]     = sd[i00]     * w00 + sd[i10]     * w10 + sd[i01]     * w01 + sd[i11]     * w11;
      od[idx + 1] = sd[i00 + 1] * w00 + sd[i10 + 1] * w10 + sd[i01 + 1] * w01 + sd[i11 + 1] * w11;
      od[idx + 2] = sd[i00 + 2] * w00 + sd[i10 + 2] * w10 + sd[i01 + 2] * w01 + sd[i11 + 2] * w11;
      od[idx + 3] = 255;
    }
  }

  octx.putImageData(outData, 0, 0);
  return out;
}

// ---------- filters ----------

/**
 * Apply a filter + light enhancement to an existing canvas, returning a new canvas.
 */
export function applyFilter(src: HTMLCanvasElement, filter: ScanFilter): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const ctx = out.getContext('2d');
  if (!ctx) return src;
  ctx.drawImage(src, 0, 0);

  if (filter === 'original') return out;

  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // brightness normalization: stretch luminance histogram between p2..p98
  const lum = new Uint8ClampedArray(w * h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    lum[j] = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0;
  }
  const hist = new Array(256).fill(0);
  for (let i = 0; i < lum.length; i++) hist[lum[i]]++;
  const total = lum.length;
  let acc = 0;
  let lo = 0, hi = 255;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.02) { lo = v; break; } }
  acc = 0;
  for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc >= total * 0.02) { hi = v; break; } }
  const range = Math.max(1, hi - lo);

  const stretch = (v: number) => clamp(((v - lo) / range) * 255, 0, 255);

  if (filter === 'grayscale') {
    for (let i = 0; i < d.length; i += 4) {
      const g = stretch(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
      d[i] = g; d[i + 1] = g; d[i + 2] = g;
    }
  } else if (filter === 'bw') {
    // adaptive-ish: contrast stretch then threshold around mean
    let sum = 0;
    for (let i = 0; i < lum.length; i++) sum += lum[i];
    const mean = sum / lum.length;
    const threshold = clamp(mean * 0.95, 90, 200);
    for (let i = 0; i < d.length; i += 4) {
      const g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
      const v = g > threshold ? 255 : 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v;
    }
  } else if (filter === 'enhanced') {
    // contrast boost on color while keeping document-y look:
    // stretch luminance, slight saturation reduction, brightness +5
    const contrast = 1.18;
    const brightness = 6;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const yL = r * 0.299 + g * 0.587 + b * 0.114;
      const ySt = stretch(yL);
      const factor = ySt / Math.max(1, yL);
      let nr = r * factor;
      let ng = g * factor;
      let nb = b * factor;
      // contrast around 128
      nr = (nr - 128) * contrast + 128 + brightness;
      ng = (ng - 128) * contrast + 128 + brightness;
      nb = (nb - 128) * contrast + 128 + brightness;
      d[i]     = clamp(nr, 0, 255);
      d[i + 1] = clamp(ng, 0, 255);
      d[i + 2] = clamp(nb, 0, 255);
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Slight sharpen via 3x3 convolution (skip for B/W to avoid noise)
  if (filter !== 'bw') {
    sharpen(ctx, w, h, 0.35);
  }
  return out;
}

function sharpen(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const o = dst.data;
  const k0 = 1 + 4 * amount;
  const k1 = -amount;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * w + x) * 4 + c;
        const v =
          s[i] * k0 +
          s[i - 4] * k1 +
          s[i + 4] * k1 +
          s[i - w * 4] * k1 +
          s[i + w * 4] * k1;
        o[i] = clamp(v, 0, 255);
      }
      o[(y * w + x) * 4 + 3] = 255;
    }
  }
  // copy borders
  for (let i = 0; i < s.length; i += 4) {
    if (o[i + 3] === 0) {
      o[i] = s[i]; o[i + 1] = s[i + 1]; o[i + 2] = s[i + 2]; o[i + 3] = 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
}

// ---------- best-effort edge detection for initial crop suggestion ----------
/**
 * Lightweight document corner suggestion. Downsamples, computes gradient magnitudes,
 * finds rows/cols with highest cumulative edges to suggest a bounding rectangle.
 * NOT a real document detector — just a heuristic better than dead-center.
 * Returns null if heuristic isn't confident.
 */
export function suggestQuad(img: HTMLImageElement): Quad | null {
  try {
    const maxDim = 240;
    const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const sw = Math.max(1, Math.round(img.naturalWidth * ratio));
    const sh = Math.max(1, Math.round(img.naturalHeight * ratio));
    const c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, sw, sh);
    const data = ctx.getImageData(0, 0, sw, sh).data;
    const gray = new Float32Array(sw * sh);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      gray[j] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }
    // Sobel magnitude row/col sums
    const rowSum = new Float32Array(sh);
    const colSum = new Float32Array(sw);
    for (let y = 1; y < sh - 1; y++) {
      for (let x = 1; x < sw - 1; x++) {
        const i = y * sw + x;
        const gx =
          -gray[i - sw - 1] - 2 * gray[i - 1] - gray[i + sw - 1] +
           gray[i - sw + 1] + 2 * gray[i + 1] + gray[i + sw + 1];
        const gy =
          -gray[i - sw - 1] - 2 * gray[i - sw] - gray[i - sw + 1] +
           gray[i + sw - 1] + 2 * gray[i + sw] + gray[i + sw + 1];
        const m = Math.abs(gx) + Math.abs(gy);
        rowSum[y] += m;
        colSum[x] += m;
      }
    }
    // Find first/last rows where edge density exceeds mean
    const rMean = rowSum.reduce((a, v) => a + v, 0) / sh;
    const cMean = colSum.reduce((a, v) => a + v, 0) / sw;
    let top = 0, bottom = sh - 1, left = 0, right = sw - 1;
    for (let y = 0; y < sh; y++) if (rowSum[y] > rMean * 1.1) { top = y; break; }
    for (let y = sh - 1; y >= 0; y--) if (rowSum[y] > rMean * 1.1) { bottom = y; break; }
    for (let x = 0; x < sw; x++) if (colSum[x] > cMean * 1.1) { left = x; break; }
    for (let x = sw - 1; x >= 0; x--) if (colSum[x] > cMean * 1.1) { right = x; break; }

    // Sanity: must cover at least 35% of each dim, and not the full frame.
    const wFrac = (right - left) / sw;
    const hFrac = (bottom - top) / sh;
    if (wFrac < 0.35 || hFrac < 0.35 || wFrac > 0.98 || hFrac > 0.98) return null;

    // Inset slightly for safety, then map back to image coords
    const insetX = (right - left) * 0.02;
    const insetY = (bottom - top) * 0.02;
    const sx = img.naturalWidth / sw;
    const sy = img.naturalHeight / sh;
    const L = (left + insetX) * sx;
    const R = (right - insetX) * sx;
    const T = (top + insetY) * sy;
    const B = (bottom - insetY) * sy;
    return [
      { x: L, y: T },
      { x: R, y: T },
      { x: R, y: B },
      { x: L, y: B },
    ];
  } catch {
    return null;
  }
}

// ---------- output helpers ----------

export function canvasToFile(
  canvas: HTMLCanvasElement,
  baseName: string,
  quality = 0.9,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('canvas-toBlob-failed'));
      const safe = (baseName || 'scan').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'scan';
      resolve(new File([blob], `${safe}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }));
    }, 'image/jpeg', quality);
  });
}
