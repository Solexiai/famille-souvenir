import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Quad, Point } from '@/lib/scan-image-processing';
import { defaultCenteredQuad, fullImageQuad } from '@/lib/scan-image-processing';
import { RotateCcw, Maximize2 } from 'lucide-react';

interface Props {
  image: HTMLImageElement;
  initialQuad?: Quad | null;
  onChange: (quad: Quad) => void;
  labels?: {
    autoDetect?: string;
    reset?: string;
    full?: string;
    zoom?: string;
  };
}

/**
 * Minimal, reliable crop editor (Phase 1 stable).
 *
 * Renders the captured image with object-contain inside a responsive stage,
 * measures the actual displayed rect after layout, and overlays a draggable
 * 4-corner quad mapped between displayed-pixel space and image-pixel space.
 *
 * No pinch/zoom/pan/auto-detect — those are deferred until rendering is stable.
 */
export const ScanCropEditor: React.FC<Props> = ({ image, initialQuad, onChange, labels }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Displayed image rect within the stage (CSS pixels, relative to stage).
  const [rect, setRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [imgError, setImgError] = useState(false);

  const [quad, setQuad] = useState<Quad>(
    initialQuad ?? defaultCenteredQuad(image.naturalWidth, image.naturalHeight, 0.06),
  );

  const dragRef = useRef<{ idx: number | null; pointerId?: number }>({ idx: null });

  // Measure the displayed image rect inside the stage.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;
    const sRect = stage.getBoundingClientRect();
    const iRect = img.getBoundingClientRect();
    if (iRect.width === 0 || iRect.height === 0) return;
    setRect({
      left: iRect.left - sRect.left,
      top: iRect.top - sRect.top,
      width: iRect.width,
      height: iRect.height,
    });
  }, []);

  // Push initial quad up once.
  useEffect(() => {
    onChange(quad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-measure on resize / when image swaps.
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    // small delayed measure for dialog open animation
    const t1 = window.setTimeout(measure, 60);
    const t2 = window.setTimeout(measure, 250);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [measure, image.src]);

  // image-pixel -> stage CSS-pixel
  const scaleX = rect.width / image.naturalWidth || 0;
  const scaleY = rect.height / image.naturalHeight || 0;

  const imgToStage = (p: Point) => ({
    x: rect.left + p.x * scaleX,
    y: rect.top + p.y * scaleY,
  });

  const stageToImg = (sx: number, sy: number): Point => ({
    x: Math.max(0, Math.min(image.naturalWidth, (sx - rect.left) / (scaleX || 1))),
    y: Math.max(0, Math.min(image.naturalHeight, (sy - rect.top) / (scaleY || 1))),
  });

  const setPoint = (idx: number, p: Point) => {
    setQuad((prev) => {
      const next = prev.slice() as Quad;
      next[idx] = p;
      onChange(next);
      return next;
    });
  };

  const onCornerDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { idx, pointerId: e.pointerId };
  };

  const onStagePointerMove = (e: React.PointerEvent) => {
    if (dragRef.current.idx === null) return;
    const sRect = stageRef.current?.getBoundingClientRect();
    if (!sRect) return;
    setPoint(dragRef.current.idx, stageToImg(e.clientX - sRect.left, e.clientY - sRect.top));
  };

  const onStagePointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.pointerId === e.pointerId) dragRef.current = { idx: null };
  };

  const reset = (kind: 'center' | 'full') => {
    const q =
      kind === 'full'
        ? fullImageQuad(image.naturalWidth, image.naturalHeight)
        : defaultCenteredQuad(image.naturalWidth, image.naturalHeight, 0.06);
    setQuad(q);
    onChange(q);
  };

  const polyPoints = useMemo(
    () =>
      quad
        .map((p) => {
          const s = imgToStage(p);
          return `${s.x},${s.y}`;
        })
        .join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quad, rect],
  );

  const labelReset = labels?.reset ?? 'Reset crop';
  const labelFull = labels?.full ?? 'Full image';

  // Stage height: cap at ~60vh, min 320px.
  const stageStyle: React.CSSProperties = {
    height: 'min(60vh, 560px)',
    minHeight: 320,
  };

  return (
    <div className="w-full">
      <div
        ref={stageRef}
        className="relative w-full select-none touch-none rounded-md overflow-hidden bg-muted flex items-center justify-center"
        style={stageStyle}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
      >
        {/* The actual image — visible behind the overlay */}
        <img
          ref={imgRef}
          src={image.src}
          alt="scan"
          draggable={false}
          onLoad={measure}
          onError={() => setImgError(true)}
          className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none select-none"
          style={{ display: imgError ? 'none' : 'block' }}
        />

        {imgError && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
            {labels?.autoDetect ? null : null}
            Unable to display the scanned image. Please retake the photo.
          </div>
        )}

        {/* Overlay (only when we have a measured rect) */}
        {!imgError && rect.width > 0 && rect.height > 0 && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              width="100%"
              height="100%"
            >
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <polygon points={polyPoints} fill="black" />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="black"
                opacity="0.35"
                mask="url(#crop-mask)"
              />
              <polygon
                points={polyPoints}
                fill="hsl(var(--accent) / 0.08)"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
              />
            </svg>
            {quad.map((p, i) => {
              const s = imgToStage(p);
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`corner-${i}`}
                  onPointerDown={(e) => onCornerDown(e, i)}
                  className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-background shadow-md touch-none ring-2 ring-accent/30"
                  style={{ left: s.x, top: s.y }}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 justify-center text-xs">
        <button
          type="button"
          onClick={() => reset('center')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted"
          title={labelReset}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {labelReset}
        </button>
        <button
          type="button"
          onClick={() => reset('full')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          {labelFull}
        </button>
      </div>
    </div>
  );
};

export default ScanCropEditor;
