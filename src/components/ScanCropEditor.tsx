import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Quad, Point } from '@/lib/scan-image-processing';
import { defaultCenteredQuad, fullImageQuad } from '@/lib/scan-image-processing';

interface Props {
  image: HTMLImageElement;
  initialQuad?: Quad | null;
  onChange: (quad: Quad) => void;
}

/**
 * Visual editor with 4 draggable corner handles overlaid on a scaled image.
 * Quad is stored in IMAGE pixel coordinates and exposed via onChange.
 */
export const ScanCropEditor: React.FC<Props> = ({ image, initialQuad, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [quad, setQuad] = useState<Quad>(
    initialQuad ?? defaultCenteredQuad(image.naturalWidth, image.naturalHeight),
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Recompute display size to fit container while preserving aspect.
  useEffect(() => {
    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const maxW = el.clientWidth;
      const maxH = Math.min(window.innerHeight * 0.55, 520);
      const r = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
      const w = Math.max(1, Math.round(image.naturalWidth * r));
      const h = Math.max(1, Math.round(image.naturalHeight * r));
      setDisplaySize({ w, h });
      setScale(r);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [image]);

  // Push initial quad up.
  useEffect(() => {
    onChange(quad);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handlePointer = (e: React.PointerEvent, idx: number) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragIdx(idx);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (dragIdx === null) return;
    const el = containerRef.current?.querySelector('.scan-stage') as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setPoint(dragIdx, { x, y });
  };

  const handleUp = () => setDragIdx(null);

  const reset = (kind: 'center' | 'full') => {
    const q = kind === 'center'
      ? defaultCenteredQuad(image.naturalWidth, image.naturalHeight)
      : fullImageQuad(image.naturalWidth, image.naturalHeight);
    setQuad(q);
    onChange(q);
  };

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="scan-stage relative mx-auto select-none touch-none rounded-md overflow-hidden bg-muted"
        style={{ width: displaySize.w, height: displaySize.h }}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
      >
        {displaySize.w > 0 && (
          <>
            <img
              src={image.src}
              alt="scan"
              className="block w-full h-full pointer-events-none"
              draggable={false}
            />
            {/* SVG overlay */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width={displaySize.w}
              height={displaySize.h}
              viewBox={`0 0 ${displaySize.w} ${displaySize.h}`}
            >
              <polygon
                points={quad.map((p) => `${p.x * scale},${p.y * scale}`).join(' ')}
                fill="hsl(var(--accent) / 0.12)"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
              />
            </svg>
            {/* Corner handles */}
            {quad.map((p, i) => (
              <button
                key={i}
                type="button"
                aria-label={`corner-${i}`}
                onPointerDown={(e) => handlePointer(e, i)}
                className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-background shadow-md touch-none"
                style={{ left: p.x * scale, top: p.y * scale }}
              />
            ))}
          </>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 justify-center text-xs">
        <button
          type="button"
          onClick={() => reset('center')}
          className="px-3 py-1.5 rounded-md border border-border hover:bg-muted"
        >
          ↺
        </button>
        <button
          type="button"
          onClick={() => reset('full')}
          className="px-3 py-1.5 rounded-md border border-border hover:bg-muted"
          data-testid="use-full"
        >
          Full Image
        </button>
      </div>
    </div>
  );
};

export default ScanCropEditor;
