'use client';

import { useCallback, useRef, useState } from 'react';
import {
  clampHeroCopyPosition,
  PORTFOLIO_HERO_COPY_POSITION_PRESETS,
  type HeroCopyPosition,
} from '@/components/portfolio/portfolio-hero-copy-settings';
import { clientPointToSvgUser } from '@/components/portfolio/portfolio-svg-client-point';

type PortfolioHeroCopyPositionEditorProps = {
  position: HeroCopyPosition;
  layoutFlipped: boolean;
  onChange: (position: HeroCopyPosition) => void;
};

export function PortfolioHeroCopyPositionEditor({
  position,
  layoutFlipped,
  onChange,
}: PortfolioHeroCopyPositionEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const clientToPosition = useCallback((clientX: number, clientY: number): HeroCopyPosition | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const local = clientPointToSvgUser(svg, clientX, clientY);
    if (!local) return null;
    return clampHeroCopyPosition({ x: local.x, y: local.y });
  }, []);

  const handlePointerDown = (event: React.PointerEvent<SVGGElement>) => {
    event.stopPropagation();
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const next = clientToPosition(event.clientX, event.clientY);
    if (next) onChange(next);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const clamped = clampHeroCopyPosition(position);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PORTFOLIO_HERO_COPY_POSITION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange({ ...preset.position })}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            {preset.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange(layoutFlipped ? { x: 78, y: 42 } : { x: 22, y: 42 })
          }
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <label className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600">X</span>
          <input
            type="number"
            min={4}
            max={96}
            step={0.5}
            value={clamped.x}
            onChange={(event) => {
              const x = Number(event.target.value);
              if (Number.isFinite(x)) onChange(clampHeroCopyPosition({ ...clamped, x }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>vw</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600">Y</span>
          <input
            type="number"
            min={10}
            max={92}
            step={0.5}
            value={clamped.y}
            onChange={(event) => {
              const y = Number(event.target.value);
              if (Number.isFinite(y)) onChange(clampHeroCopyPosition({ ...clamped, y }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>vh</span>
        </label>
        <span>Drag the orange handle to move the text block</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-auto w-full touch-none select-none"
          style={{ aspectRatio: '16 / 10' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          role="img"
          aria-label="Hero text block position editor"
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          <rect x="0" y="0" width="48" height="100" fill="#fafafa" />
          <rect x="52" y="0" width="48" height="100" fill="#f5f5f5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#e5e5e5" strokeWidth="0.4" strokeDasharray="2 2" />

          <g
            transform={`translate(${clamped.x}, ${clamped.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          >
            <rect
              x="-14"
              y="-11"
              width="28"
              height="22"
              rx="2"
              fill="#ffffff"
              stroke="#171717"
              strokeWidth="0.5"
              strokeOpacity="0.35"
            />
            <rect x="-12" y="-9" width="16" height="2.2" rx="0.6" fill="#171717" opacity="0.85" />
            <rect x="-12" y="-5.5" width="22" height="1.4" rx="0.4" fill="#a3a3a3" />
            <rect x="-12" y="-3.2" width="20" height="1.4" rx="0.4" fill="#a3a3a3" />
            <rect x="-12" y="-0.8" width="18" height="1.4" rx="0.4" fill="#a3a3a3" />
            <rect x="-8" y="3.5" width="10" height="3" rx="1.5" fill="#171717" />
            <circle cx="0" cy="0" r="1.8" fill="#ea580c" stroke="#ffffff" strokeWidth="0.45" />
          </g>
        </svg>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500">
        Moves the headline, description, and contact button together on desktop. X is horizontal (vw), Y is vertical
        (vh) on the hero.
      </p>
    </div>
  );
}
