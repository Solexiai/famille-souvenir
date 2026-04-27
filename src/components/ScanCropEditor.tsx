import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Quad, Point } from '@/lib/scan-image-processing';
import { defaultCenteredQuad, fullImageQuad, suggestQuad } from '@/lib/scan-image-processing';
import { ZoomIn, ZoomOut, RotateCcw, Wand2, Maximize2 } from 'lucide-react';

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
 * Document crop editor:
 *  - Image fully visible inside a fixed stage (object-contain), centered
 *  - 4 draggable corner handles overlaid in image-pixel space
 *  - Pinch-to-zoom + pan (image+overlay scale together)
 *  - Auto-detect / Reset / Full / Zoom controls
 */
export const ScanCropEditor: React.FC<Props> = ({ image, initialQuad, onChange, labels }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [baseScale, setBaseScale] = useState(1);   // image-px -> stage-px (fit)
  const [zoom, setZoom] = useState(1);             // user zoom multiplier
  const [pan, setPan] = useState({ x: 0, y: 0 });  // translation in stage-px
  const [quad, setQuad] = useState<Quad>(
    initialQuad ?? defaultCenteredQuad(image.naturalWidth, image.naturalHeight, 0.04),
  );

  const dragRef = useRef<{
    mode: 'corner' | 'pan' | null;
    cornerIdx?: number;
    startClient?: { x: number; y: number };
    startPan?: { x: number; y: number };
    pointerId?: number;
  }>({ mode: null });

  // Pinch state
  const pinchRef = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    midClient: { x: number; y: number };
    startPan: { x: number; y: number };
    pointers: Map<number, { x: number; y: number }>;
  }>({ active: false, startDist: 0, startZoom: 1, midClient: { x: 0, y: 0 }, startPan: { x: 0, y: 0 }, pointers: new Map() });

  // Compute the stage size & base scale so the whole image fits (object-contain).
  useEffect(() => {
    const compute = () => {
      const el = stageRef.current;
      if (!el) return;
      const maxW = el.clientWidth;
      // Allocate ~62vh on mobile, capped — bigger than before so doc is large.
      const maxH = Math.min(window.innerHeight * 0.62, 620);
      const r = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
      setStage({ w: maxW, h: maxH });
      setBaseScale(r > 0 ? r : 1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [image]);

  // Push initial quad up once.
  useEffect(() => {
    onChange(quad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effective scale & centered offset (image -> stage-px) at current zoom/pan.
  const effScale = baseScale * zoom;
  const imgDispW = image.naturalWidth * effScale;
  const imgDispH = image.naturalHeight * effScale;
  const offsetX = (stage.w - imgDispW) / 2 + pan.x;
  const offsetY = (stage.h - imgDispH) / 2 + pan.y;

  const stageToImage = useCallback((sx: number, sy: number): Point => ({
    x: (sx - offsetX) / effScale,
    y: (sy - offsetY) / effScale,
  }), [offsetX, offsetY, effScale]);

  const setPoint = useCallback((idx: number, p: Point) => {
    setQuad((prev) => {
      const next = prev.slice() as Quad;
      next[idx] = {
        x: Math.max(0, Math.min(image.naturalWidth, p.x)),
        y: Math.max(0, Math.min(image.naturalHeight, p.y)),
      };
      onChange(next);
      return next;
    });
  }, [image.naturalWidth, image.naturalHeight, onChange]);

  // ---- Pointer events on the stage (handles pan + pinch). ----
  const onStagePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).dataset.handle === 'corner') return; // handled by handle
    pinchRef.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchRef.current.pointers.size === 2) {
      const pts = Array.from(pinchRef.current.pointers.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      pinchRef.current = {
        ...pinchRef.current,
        active: true,
        startDist: Math.hypot(dx, dy) || 1,
        startZoom: zoom,
        midClient: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
        startPan: { ...pan },
      };
      dragRef.current = { mode: null };
      return;
    }
    // single pointer = pan
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = {
      mode: 'pan',
      startClient: { x: e.clientX, y: e.clientY },
      startPan: { ...pan },
      pointerId: e.pointerId,
    };
  };

  const onStagePointerMove = (e: React.PointerEvent) => {
    if (pinchRef.current.pointers.has(e.pointerId)) {
      pinchRef.current.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pinchRef.current.active && pinchRef.current.pointers.size >= 2) {
      const pts = Array.from(pinchRef.current.pointers.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const factor = dist / pinchRef.current.startDist;
      const newZoom = Math.max(0.5, Math.min(5, pinchRef.current.startZoom * factor));
      setZoom(newZoom);
      return;
    }
    if (dragRef.current.mode === 'corner' && dragRef.current.cornerIdx !== undefined) {
      const rect = stageRef.current!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      setPoint(dragRef.current.cornerIdx, stageToImage(sx, sy));
      return;
    }
    if (dragRef.current.mode === 'pan' && dragRef.current.startClient && dragRef.current.startPan) {
      setPan({
        x: dragRef.current.startPan.x + (e.clientX - dragRef.current.startClient.x),
        y: dragRef.current.startPan.y + (e.clientY - dragRef.current.startClient.y),
      });
    }
  };

  const onStagePointerUp = (e: React.PointerEvent) => {
    pinchRef.current.pointers.delete(e.pointerId);
    if (pinchRef.current.pointers.size < 2) pinchRef.current.active = false;
    if (dragRef.current.pointerId === e.pointerId) dragRef.current = { mode: null };
  };

  const handleCornerDown = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { mode: 'corner', cornerIdx: idx, pointerId: e.pointerId };
  };

  const reset = (kind: 'center' | 'full' | 'auto') => {
    let q: Quad;
    if (kind === 'auto') {
      const s = suggestQuad(image);
      q = s ?? defaultCenteredQuad(image.naturalWidth, image.naturalHeight, 0.04);
    } else if (kind === 'full') {
      q = fullImageQuad(image.naturalWidth, image.naturalHeight);
    } else {
      q = defaultCenteredQuad(image.naturalWidth, image.naturalHeight, 0.04);
    }
    setQuad(q);
    onChange(q);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel zoom (desktop)
  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 30) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.5, Math.min(5, z * factor)));
  };

  const polyPoints = useMemo(
    () => quad.map((p) => `${p.x * effScale + offsetX},${p.y * effScale + offsetY}`).join(' '),
    [quad, effScale, offsetX, offsetY],
  );

  const labelAuto = labels?.autoDetect ?? 'Auto-detect';
  const labelReset = labels?.reset ?? 'Reset crop';
  const labelFull = labels?.full ?? 'Full image';

  return (
    <div className="w-full">
      <div
        ref={stageRef}
        className="relative w-full select-none touch-none rounded-md overflow-hidden bg-neutral-900"
        style={{ height: stage.h }}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
        onWheel={onWheel}
      >
        {stage.w > 0 && (
          <>
            {/* Image at proper position/scale */}
            <img
              src={image.src}
              alt="scan"
              draggable={false}
              className="absolute pointer-events-none select-none"
              style={{
                left: offsetX,
                top: offsetY,
                width: imgDispW,
                height: imgDispH,
                maxWidth: 'none',
              }}
            />
            {/* Quad overlay */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={stage.w}
              height={stage.h}
              viewBox={`0 0 ${stage.w} ${stage.h}`}
            >
              <defs>
                <mask id="crop-mask">
                  <rect width={stage.w} height={stage.h} fill="white" />
                  <polygon points={polyPoints} fill="black" />
                </mask>
              </defs>
              {/* Dim outside the crop */}
              <rect width={stage.w} height={stage.h} fill="black" opacity="0.45" mask="url(#crop-mask)" />
              <polygon
                points={polyPoints}
                fill="hsl(var(--accent) / 0.08)"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
              />
            </svg>
            {/* Corner handles in stage-px */}
            {quad.map((p, i) => {
              const sx = p.x * effScale + offsetX;
              const sy = p.y * effScale + offsetY;
              return (
                <button
                  key={i}
                  type="button"
                  data-handle="corner"
                  aria-label={`corner-${i}`}
                  onPointerDown={(e) => handleCornerDown(e, i)}
                  className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-background shadow-lg touch-none ring-2 ring-accent/30"
                  style={{ left: sx, top: sy }}
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
          onClick={() => reset('auto')}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted"
          title={labelAuto}
        >
          <Wand2 className="h-3.5 w-3.5" />
          {labelAuto}
        </button>
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
          data-testid="use-full"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          {labelFull}
        </button>
        <div className="mx-1 h-5 w-px bg-border" />
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.5, z * 0.85))}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-border hover:bg-muted"
          aria-label="zoom-out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="tabular-nums text-muted-foreground w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(5, z * 1.18))}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-border hover:bg-muted"
          aria-label="zoom-in"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ScanCropEditor;
