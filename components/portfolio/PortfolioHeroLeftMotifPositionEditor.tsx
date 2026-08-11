'use client';

import { useCallback, useRef, useState } from 'react';
import { pointsToPolygonAttribute } from '@/components/portfolio/portfolio-hero-motif-geometry';
import type { MotifPoint } from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  clampLeftMotifPosition,
  clampLeftMotifSize,
  PORTFOLIO_HERO_LEFT_MOTIF_POSITION_PRESETS,
  type LeftMotifPosition,
  type LeftMotifSize,
  type PortfolioHeroLeftMotifPattern,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import { clientPointToSvgUser } from '@/components/portfolio/portfolio-svg-client-point';

type PortfolioHeroLeftMotifPositionEditorProps = {
  position: LeftMotifPosition;
  size: LeftMotifSize;
  pattern: PortfolioHeroLeftMotifPattern;
  color: string;
  customPoints: MotifPoint[];
  onChange: (position: LeftMotifPosition) => void;
};

export function PortfolioHeroLeftMotifPositionEditor({
  position,
  size,
  pattern,
  color,
  customPoints,
  onChange,
}: PortfolioHeroLeftMotifPositionEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const clientToPosition = useCallback((clientX: number, clientY: number): LeftMotifPosition | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const local = clientPointToSvgUser(svg, clientX, clientY);
    if (!local) return null;
    return clampLeftMotifPosition({ x: local.x, y: local.y });
  }, []);

  const clamped = clampLeftMotifPosition(position);
  const clampedSize = clampLeftMotifSize(size);
  const isCustom = pattern === 'custom';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PORTFOLIO_HERO_LEFT_MOTIF_POSITION_PRESETS.map((preset) => (
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
            min={8}
            max={52}
            step={0.5}
            value={clamped.x}
            onChange={(event) => {
              const x = Number(event.target.value);
              if (Number.isFinite(x)) onChange(clampLeftMotifPosition({ ...clamped, x }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>vw</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="font-semibold text-neutral-600">Y</span>
          <input
            type="number"
            min={25}
            max={98}
            step={0.5}
            value={clamped.y}
            onChange={(event) => {
              const y = Number(event.target.value);
              if (Number.isFinite(y)) onChange(clampLeftMotifPosition({ ...clamped, y }));
            }}
            className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1 font-mono text-neutral-900"
          />
          <span>vh</span>
        </label>
        <span>Drag the block to reposition freely</span>
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
          aria-label="Left motif position editor"
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          <rect x="52" y="0" width="48" height="100" fill="#e5e5e5" opacity="0.55" />

          <g
            transform={`translate(${clamped.x}, ${clamped.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              event.stopPropagation();
              setDragging(true);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
          >
            <rect
              x={-clampedSize.width / 2}
              y={-clampedSize.height / 2}
              width={clampedSize.width}
              height={clampedSize.height}
              fill={isCustom ? 'transparent' : '#f5f5f5'}
              fillOpacity={0.9}
              stroke="#171717"
              strokeWidth="0.5"
              strokeOpacity="0.35"
              rx="1"
            />
            {isCustom ? (
              <g
                transform={`translate(${-clampedSize.width / 2}, ${-clampedSize.height / 2}) scale(${clampedSize.width / 100}, ${clampedSize.height / 100})`}
              >
                <polygon points={pointsToPolygonAttribute(customPoints)} fill={color} opacity="0.95" />
              </g>
            ) : null}
            <circle r="1.8" fill="#ea580c" stroke="#ffffff" strokeWidth="0.4" />
          </g>
        </svg>
      </div>
    </div>
  );
}
