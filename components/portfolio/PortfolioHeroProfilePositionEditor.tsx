'use client';

import { useCallback, useRef, useState } from 'react';
import { pointsToPolygonAttribute } from '@/components/portfolio/portfolio-hero-motif-geometry';
import type { MotifPoint } from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  clampPortraitPosition,
  PORTFOLIO_HERO_PORTRAIT_POSITION_PRESETS,
  type PortraitPosition,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  getHeroMotifClipPath,
  type PortfolioHeroMotifShape,
} from '@/components/portfolio/portfolio-hero-settings';
import { clientPointToSvgUser } from '@/components/portfolio/portfolio-svg-client-point';

type PortfolioHeroProfilePositionEditorProps = {
  position: PortraitPosition;
  motifColor: string;
  motifShape: PortfolioHeroMotifShape;
  customMotifPoints: MotifPoint[];
  onChange: (position: PortraitPosition) => void;
};

function motifPreviewPolygon(
  shape: PortfolioHeroMotifShape,
  customMotifPoints: MotifPoint[]
): string {
  if (shape === 'custom') {
    return pointsToPolygonAttribute(customMotifPoints);
  }
  const clipPath = getHeroMotifClipPath(shape);
  return clipPath
    .replace(/^polygon\(/, '')
    .replace(/\)$/, '')
    .split(',')
    .map((pair) => {
      const [xRaw, yRaw] = pair.trim().split(/\s+/);
      const x = parseFloat(xRaw.replace(/vw|%/, ''));
      const y = parseFloat(yRaw.replace(/vw|%/, ''));
      return `${x},${y}`;
    })
    .join(' ');
}

export function PortfolioHeroProfilePositionEditor({
  position,
  motifColor,
  motifShape,
  customMotifPoints,
  onChange,
}: PortfolioHeroProfilePositionEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const clientToPosition = useCallback((clientX: number, clientY: number): PortraitPosition | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const local = clientPointToSvgUser(svg, clientX, clientY);
    if (!local) return null;
    return clampPortraitPosition({ x: local.x, y: local.y });
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

  const clamped = clampPortraitPosition(position);
  const motifPolygon = motifPreviewPolygon(motifShape, customMotifPoints);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PORTFOLIO_HERO_PORTRAIT_POSITION_PRESETS.map((preset) => (
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
          onClick={() => onChange({ x: 75, y: 44 })}
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
            min={35}
            max={98}
            step={0.5}
            value={clamped.x}
            onChange={(event) => {
              const x = Number(event.target.value);
              if (Number.isFinite(x)) onChange(clampPortraitPosition({ ...clamped, x }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>%</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600">Y</span>
          <input
            type="number"
            min={8}
            max={92}
            step={0.5}
            value={clamped.y}
            onChange={(event) => {
              const y = Number(event.target.value);
              if (Number.isFinite(y)) onChange(clampPortraitPosition({ ...clamped, y }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>%</span>
        </label>
        <span>Drag the portrait block to reposition</span>
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
          aria-label="Profile position editor"
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          <rect x="0" y="0" width="48" height="100" fill="#fafafa" />
          <line x1="48" y1="0" x2="48" y2="100" stroke="#e5e5e5" strokeWidth="0.4" strokeDasharray="2 2" />

          <polygon points={motifPolygon} fill={motifColor} opacity="0.95" />
          <polygon
            points={motifPolygon}
            fill="none"
            stroke="#171717"
            strokeWidth="0.45"
            strokeOpacity="0.25"
          />

          <g
            transform={`translate(${clamped.x}, ${clamped.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          >
            <rect
              x="-5.5"
              y="-9"
              width="11"
              height="13.75"
              rx="1.8"
              fill="#ffffff"
              stroke="#171717"
              strokeWidth="0.55"
            />
            <rect x="-4.8" y="-8.2" width="9.6" height="10.5" rx="1.2" fill="#d4d4d4" />
            <rect x="-4" y="5.2" width="8" height="1.1" rx="0.4" fill="#737373" />
            <circle cx="0" cy="0" r="1.4" fill="#ea580c" stroke="#ffffff" strokeWidth="0.35" />
          </g>
        </svg>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500">
        Drag the portrait preview anywhere on the hero panel. X is horizontal (viewport width), Y is vertical within
        the motif band — changes apply instantly on desktop.
      </p>
    </div>
  );
}
