'use client';

import { useCallback, useRef, useState } from 'react';
import {
  clampMotifPoint,
  getMotifTemplatePoints,
  insertMotifPointOnEdge,
  MOTIF_SHAPE_TEMPLATES,
  pointsToPolygonAttribute,
  removeMotifPoint,
  type MotifPoint,
  type MotifShapeTemplateId,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import { clientPointToSvgUser } from '@/components/portfolio/portfolio-svg-client-point';

type PortfolioHeroLeftMotifEditorProps = {
  points: MotifPoint[];
  color: string;
  onChange: (points: MotifPoint[]) => void;
};

export function PortfolioHeroLeftMotifEditor({ points, color, onChange }: PortfolioHeroLeftMotifEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [addPointMode, setAddPointMode] = useState(false);

  const clientToSvg = useCallback((clientX: number, clientY: number): MotifPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const local = clientPointToSvgUser(svg, clientX, clientY);
    if (!local) return null;
    return clampMotifPoint({ x: local.x, y: local.y });
  }, []);

  const handlePointerDownOnHandle = (index: number, event: React.PointerEvent<SVGCircleElement>) => {
    event.stopPropagation();
    setSelectedIndex(index);
    setDragIndex(index);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragIndex === null) return;
    const next = clientToSvg(event.clientX, event.clientY);
    if (!next) return;
    onChange(points.map((point, index) => (index === dragIndex ? next : point)));
  };

  const handlePointerUp = () => {
    setDragIndex(null);
  };

  const handleCanvasClick = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragIndex !== null) return;
    const click = clientToSvg(event.clientX, event.clientY);
    if (!click) return;

    if (addPointMode) {
      onChange(insertMotifPointOnEdge(points, click));
      return;
    }

    setSelectedIndex(null);
  };

  const applyTemplate = (template: MotifShapeTemplateId) => {
    onChange(getMotifTemplatePoints(template));
    setSelectedIndex(null);
  };

  const deleteSelected = () => {
    if (selectedIndex === null) return;
    onChange(removeMotifPoint(points, selectedIndex));
    setSelectedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {MOTIF_SHAPE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => applyTemplate(template.id)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            {template.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAddPointMode((current) => !current)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            addPointMode
              ? 'bg-neutral-900 text-white'
              : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          {addPointMode ? 'Click edge to add point' : 'Add point on edge'}
        </button>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={selectedIndex === null || points.length <= 3}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remove point
        </button>
        <span className="text-xs text-neutral-500">{points.length} points · drag handles to reshape</span>
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
          onPointerDown={handleCanvasClick}
          role="img"
          aria-label="Custom left motif shape editor"
        >
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          <rect x="52" y="0" width="48" height="100" fill="#f5f5f5" />
          <line x1="52" y1="0" x2="52" y2="100" stroke="#e5e5e5" strokeWidth="0.4" strokeDasharray="2 2" />

          <polygon points={pointsToPolygonAttribute(points)} fill={color} opacity="0.95" />
          <polygon
            points={pointsToPolygonAttribute(points)}
            fill="none"
            stroke="#171717"
            strokeWidth="0.55"
            strokeOpacity="0.35"
          />

          {points.map((point, index) => {
            const selected = selectedIndex === index;
            return (
              <circle
                key={`left-motif-point-${index}`}
                cx={point.x}
                cy={point.y}
                r={selected ? 3.2 : 2.6}
                fill={selected ? '#ea580c' : '#ffffff'}
                stroke={selected ? '#c2410c' : '#171717'}
                strokeWidth="0.65"
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(event) => handlePointerDownOnHandle(index, event)}
              />
            );
          })}
        </svg>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500">
        Draw the left motif shape — drag points, add corners on edges, or start from a template. Applied live on
        your portfolio.
      </p>
    </div>
  );
}
