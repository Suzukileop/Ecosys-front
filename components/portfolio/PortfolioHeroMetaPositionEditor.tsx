'use client';

import { useCallback, useRef, useState } from 'react';
import { pointsToPolygonAttribute } from '@/components/portfolio/portfolio-hero-motif-geometry';
import type { MotifPoint } from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  clampMetaRowPosition,
  PORTFOLIO_HERO_META_POSITION_PRESETS,
  resolveMetaCardAnchors,
  type MetaRowPosition,
  type PortfolioHeroMetaSpread,
} from '@/components/portfolio/portfolio-hero-meta-settings';
import {
  getHeroMotifClipPath,
  type PortfolioHeroMotifShape,
} from '@/components/portfolio/portfolio-hero-settings';
import { clientPointToSvgUser } from '@/components/portfolio/portfolio-svg-client-point';

type PortfolioHeroMetaPositionEditorProps = {
  position: MetaRowPosition;
  spread: PortfolioHeroMetaSpread;
  visibleCount: number;
  motifColor: string;
  motifShape: PortfolioHeroMotifShape;
  customMotifPoints: MotifPoint[];
  onChange: (position: MetaRowPosition) => void;
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

export function PortfolioHeroMetaPositionEditor({
  position,
  spread,
  visibleCount,
  motifColor,
  motifShape,
  customMotifPoints,
  onChange,
}: PortfolioHeroMetaPositionEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const clientToPosition = useCallback((clientX: number, clientY: number): MetaRowPosition | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const local = clientPointToSvgUser(svg, clientX, clientY);
    if (!local) return null;
    return clampMetaRowPosition({ x: local.x, y: local.y });
  }, []);

  const clamped = clampMetaRowPosition(position);
  const anchors = resolveMetaCardAnchors(Math.max(visibleCount, 1), clamped.x, spread);
  const motifPolygon = motifPreviewPolygon(motifShape, customMotifPoints);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PORTFOLIO_HERO_META_POSITION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange({ ...preset.position })}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <label className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600">X</span>
          <input
            type="number"
            min={40}
            max={96}
            step={0.5}
            value={clamped.x}
            onChange={(event) => {
              const x = Number(event.target.value);
              if (Number.isFinite(x)) onChange(clampMetaRowPosition({ ...clamped, x }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>%</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600">Y</span>
          <input
            type="number"
            min={20}
            max={98}
            step={0.5}
            value={clamped.y}
            onChange={(event) => {
              const y = Number(event.target.value);
              if (Number.isFinite(y)) onChange(clampMetaRowPosition({ ...clamped, y }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>vh</span>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="h-auto w-full touch-none select-none"
          style={{ aspectRatio: '16 / 10' }}
          onPointerMove={(event) => {
            if (!dragging) return;
            const next = clientToPosition(event.clientX, event.clientY);
            if (next) onChange(next);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          role="img"
          aria-label="Meta cards position editor"
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          <rect x="0" y="0" width="48" height="100" fill="#fafafa" />
          <line x1="48" y1="0" x2="48" y2="100" stroke="#e5e5e5" strokeWidth="0.4" strokeDasharray="2 2" />
          <polygon points={motifPolygon} fill={motifColor} opacity="0.95" />

          {anchors.map((anchorX, index) => (
            <circle
              key={`meta-preview-${index}`}
              cx={anchorX}
              cy={clamped.y}
              r="3.2"
              fill="#ffffff"
              stroke="#171717"
              strokeWidth="0.55"
            />
          ))}

          <g
            transform={`translate(${clamped.x}, ${clamped.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              event.stopPropagation();
              setDragging(true);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
          >
            <circle r="2.2" fill="#ea580c" stroke="#ffffff" strokeWidth="0.45" />
          </g>
        </svg>
      </div>
    </div>
  );
}
