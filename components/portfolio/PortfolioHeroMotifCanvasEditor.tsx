'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  clampMotifPoint,
  getMotifTemplatePoints,
  inferMotifPrimitiveFromPoints,
  insertMotifPointOnEdge,
  MOTIF_SHAPE_TEMPLATES,
  pointsToLocalPolygonAttribute,
  removeMotifPoint,
  type MotifEditorSide,
  type MotifPoint,
  type MotifShapeTemplateId,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import type { HeroMotifPrimitive } from '@/components/portfolio/portfolio-hero-motifs-settings';
import {
  heroMotifCurvePathD,
  type HeroMotifCurveAxis,
} from '@/components/portfolio/portfolio-hero-motifs-settings';
import { clientPointToSvgUser } from '@/components/portfolio/portfolio-svg-client-point';

export type MotifEditorMode = 'move' | 'shape' | 'resize';

export type MotifCanvasPreviewLayout = 'desktop' | 'mobile';

type PortfolioHeroMotifCanvasEditorProps = {
  side: MotifEditorSide;
  points: MotifPoint[];
  color: string;
  position: MotifPanelPosition;
  size: MotifPanelSize;
  onChangePoints: (points: MotifPoint[]) => void;
  onChangeTransform: (patch: { position?: MotifPanelPosition; size?: MotifPanelSize }) => void;
  showTemplates?: boolean;
  primitive?: HeroMotifPrimitive;
  onChangePrimitive?: (primitive: HeroMotifPrimitive) => void;
  /** Degrees 0–360 for half-circle orientation (smooth CSS/SVG rotate). */
  rotationDeg?: number;
  onChangeRotation?: (rotationDeg: number) => void;
  /**
   * Apply a shape template in one shot (points + primitive).
   * Prefer this over calling onChangePoints + onChangePrimitive separately —
   * two sequential patches race and the second overwrites the first.
   */
  onApplyTemplate?: (result: {
    points: MotifPoint[];
    primitive: HeroMotifPrimitive;
    template: MotifShapeTemplateId;
    rotationDeg: number;
  }) => void;
  /** Wireframe content mockup under the motif for surgical placement. */
  showLayoutMockup?: boolean;
  /** Curved stroke preview (move/resize panel only — no vertex edit). */
  curveMode?: boolean;
  curveAxis?: HeroMotifCurveAxis;
  curveBend?: number;
  strokeWidthPx?: number;
  /** Soft halo blur around the curve stroke (px). */
  curveGlowBlurPx?: number;
  /** Halo opacity 0–100. */
  curveGlowStrength?: number;
};

type DragState =
  | { kind: 'move' }
  | { kind: 'shape'; index: number }
  | { kind: 'resize'; corner: 'nw' | 'ne' | 'sw' | 'se' }
  | { kind: 'rotate' };

function svgToLocalPoint(
  svgPoint: MotifPoint,
  position: MotifPanelPosition,
  size: MotifPanelSize
): MotifPoint {
  const left = position.x - size.width / 2;
  const top = position.y - size.height / 2;
  return clampMotifPoint({
    x: ((svgPoint.x - left) / size.width) * 100,
    y: ((svgPoint.y - top) / size.height) * 100,
  });
}

/** Approximate editorial gutters (medium @ xl) as % of the hero frame. */
const DESKTOP_GUTTER = 12;
const MOBILE_GUTTER = 6;

function MotifCanvasLayoutMockup({
  layout,
  fullBleed = false,
}: {
  layout: MotifCanvasPreviewLayout;
  /** Curves map to the full viewport — gutters are guides only, not a clip. */
  fullBleed?: boolean;
}) {
  if (layout === 'mobile') {
    const contentX = MOBILE_GUTTER;
    const contentW = 100 - MOBILE_GUTTER * 2;
    return (
      <g aria-hidden pointerEvents="none">
        <rect x="0" y="0" width="100" height="100" fill="#fafafa" />
        <rect
          x={contentX}
          y="0"
          width={contentW}
          height="100"
          fill="#f3f3f3"
          stroke="#d4d4d4"
          strokeWidth="0.35"
          strokeDasharray="1.2 1.2"
        />
        {fullBleed ? (
          <>
            <line
              x1={contentX}
              y1="0"
              x2={contentX}
              y2="100"
              stroke="#f97316"
              strokeWidth="0.35"
              strokeOpacity="0.55"
              strokeDasharray="1.5 1.2"
            />
            <line
              x1={100 - contentX}
              y1="0"
              x2={100 - contentX}
              y2="100"
              stroke="#f97316"
              strokeWidth="0.35"
              strokeOpacity="0.55"
              strokeDasharray="1.5 1.2"
            />
            <text
              x="50"
              y="6"
              textAnchor="middle"
              fontSize="2.2"
              fill="#ea580c"
              fontFamily="system-ui,sans-serif"
            >
              Full-bleed curve (past side margins)
            </text>
          </>
        ) : null}
        <rect x={contentX + 2} y="14" width={contentW * 0.72} height="4.2" rx="0.6" fill="#d4d4d4" />
        <rect x={contentX + 2} y="20" width={contentW * 0.55} height="3.2" rx="0.5" fill="#e5e5e5" />
        <rect x={contentX + 2} y="28" width={contentW * 0.88} height="1.6" rx="0.4" fill="#e5e5e5" />
        <rect x={contentX + 2} y="31" width={contentW * 0.78} height="1.6" rx="0.4" fill="#ebebeb" />
        <rect x={contentX + 2} y="34" width={contentW * 0.62} height="1.6" rx="0.4" fill="#ebebeb" />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={`tool-${i}`}
            cx={contentX + 5 + i * 7}
            cy="42"
            r="2.2"
            fill="#e5e5e5"
            stroke="#d4d4d4"
            strokeWidth="0.3"
          />
        ))}
        <rect x={contentX + 2} y="48" width="22" height="5" rx="2.5" fill="#d4d4d4" />
        <rect
          x={contentX + contentW * 0.18}
          y="58"
          width={contentW * 0.64}
          height="22"
          rx="1.2"
          fill="#e8e8e8"
          stroke="#d4d4d4"
          strokeWidth="0.35"
        />
        <text
          x={contentX + contentW * 0.5}
          y="70"
          textAnchor="middle"
          fontSize="2.4"
          fill="#a3a3a3"
          fontFamily="system-ui,sans-serif"
        >
          Portrait
        </text>
        {[0, 1, 2].map((i) => (
          <rect
            key={`stat-${i}`}
            x={contentX + 2 + i * (contentW / 3.2)}
            y="84"
            width={contentW / 3.6}
            height="7"
            rx="1"
            fill="#ececec"
            stroke="#d4d4d4"
            strokeWidth="0.3"
          />
        ))}
        <text
          x="50"
          y="97.5"
          textAnchor="middle"
          fontSize="2.1"
          fill="#a3a3a3"
          fontFamily="system-ui,sans-serif"
        >
          ↓ sections below
        </text>
      </g>
    );
  }

  const g = DESKTOP_GUTTER;
  const contentW = 100 - g * 2;
  const copyW = contentW * 0.42;
  const portraitX = g + contentW * 0.55;
  const portraitW = contentW * 0.32;

  return (
    <g aria-hidden pointerEvents="none">
      <rect x="0" y="0" width="100" height="100" fill="#fafafa" />
      {fullBleed ? (
        <>
          <rect x="0" y="0" width={g} height="100" fill="#f0f0f0" opacity="0.55" />
          <rect x={100 - g} y="0" width={g} height="100" fill="#f0f0f0" opacity="0.55" />
          <line
            x1={g}
            y1="0"
            x2={g}
            y2="100"
            stroke="#f97316"
            strokeWidth="0.4"
            strokeOpacity="0.7"
            strokeDasharray="1.6 1.2"
          />
          <line
            x1={100 - g}
            y1="0"
            x2={100 - g}
            y2="100"
            stroke="#f97316"
            strokeWidth="0.4"
            strokeOpacity="0.7"
            strokeDasharray="1.6 1.2"
          />
          <text
            x="50"
            y="5.5"
            textAnchor="middle"
            fontSize="2.1"
            fill="#ea580c"
            fontFamily="system-ui,sans-serif"
          >
            Full-bleed — curve can cross orange side margins
          </text>
        </>
      ) : (
        <>
          <rect x="0" y="0" width={g} height="100" fill="#f0f0f0" />
          <rect x={100 - g} y="0" width={g} height="100" fill="#f0f0f0" />
        </>
      )}
      <rect
        x={g}
        y="0"
        width={contentW}
        height="100"
        fill="#f5f5f5"
        stroke="#d4d4d4"
        strokeWidth="0.4"
        strokeDasharray="1.4 1.2"
      />
      {!fullBleed ? (
        <>
          <line x1={g} y1="0" x2={g} y2="100" stroke="#a3a3a3" strokeWidth="0.35" strokeOpacity="0.7" />
          <line
            x1={100 - g}
            y1="0"
            x2={100 - g}
            y2="100"
            stroke="#a3a3a3"
            strokeWidth="0.35"
            strokeOpacity="0.7"
          />
        </>
      ) : null}
      <text x={g + 2} y="14" fontSize="2.2" fill="#a3a3a3" fontFamily="system-ui,sans-serif">
        Copy
      </text>
      <rect x={g + 2} y="18" width={copyW * 0.92} height="5" rx="0.7" fill="#d4d4d4" />
      <rect x={g + 2} y="25" width={copyW * 0.7} height="3.8" rx="0.6" fill="#e0e0e0" />
      <rect x={g + 2} y="34" width={copyW * 0.95} height="1.5" rx="0.35" fill="#e5e5e5" />
      <rect x={g + 2} y="37" width={copyW * 0.88} height="1.5" rx="0.35" fill="#ebebeb" />
      <rect x={g + 2} y="40" width={copyW * 0.72} height="1.5" rx="0.35" fill="#ebebeb" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={`d-tool-${i}`}
          cx={g + 5 + i * 6.5}
          cy="48"
          r="2"
          fill="#e5e5e5"
          stroke="#d4d4d4"
          strokeWidth="0.3"
        />
      ))}
      <rect x={g + 2} y="54" width="20" height="5" rx="2.5" fill="#d4d4d4" />
      <rect
        x={portraitX}
        y="22"
        width={portraitW}
        height="42"
        rx="1.4"
        fill="#e8e8e8"
        stroke="#d4d4d4"
        strokeWidth="0.4"
      />
      <text
        x={portraitX + portraitW / 2}
        y="44"
        textAnchor="middle"
        fontSize="2.4"
        fill="#a3a3a3"
        fontFamily="system-ui,sans-serif"
      >
        Portrait
      </text>
      {[0, 1, 2].map((i) => (
        <rect
          key={`d-stat-${i}`}
          x={portraitX - 4 + i * 12}
          y="78"
          width="10"
          height="9"
          rx="1"
          fill="#ececec"
          stroke="#d4d4d4"
          strokeWidth="0.3"
        />
      ))}
      <text
        x={portraitX + 12}
        y="94"
        textAnchor="middle"
        fontSize="2.1"
        fill="#a3a3a3"
        fontFamily="system-ui,sans-serif"
      >
        Stats
      </text>
      <text x="50" y="98.5" textAnchor="middle" fontSize="2" fill="#a3a3a3" fontFamily="system-ui,sans-serif">
        ↓ next sections
      </text>
    </g>
  );
}

export function PortfolioHeroMotifCanvasEditor({
  side,
  points,
  color,
  position,
  size,
  onChangePoints,
  onChangeTransform,
  showTemplates = true,
  primitive,
  onChangePrimitive,
  onApplyTemplate,
  rotationDeg = 0,
  onChangeRotation,
  showLayoutMockup = true,
  curveMode = false,
  curveAxis = 'diagonal',
  curveBend = 28,
  strokeWidthPx = 3,
  curveGlowBlurPx = 0,
  curveGlowStrength = 65,
}: PortfolioHeroMotifCanvasEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mode, setMode] = useState<MotifEditorMode>('move');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [addPointMode, setAddPointMode] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<MotifCanvasPreviewLayout>('desktop');
  const [mockupEnabled, setMockupEnabled] = useState(showLayoutMockup);
  const dragOrigin = useRef<
    | {
        position: MotifPanelPosition;
        size: MotifPanelSize;
        pointer: MotifPoint;
        /** Screen-space origin — move deltas use this to avoid SVG CTM / letterbox drift. */
        clientX: number;
        clientY: number;
        svgWidth: number;
        svgHeight: number;
        // Rotate mode state (when drag.kind === 'rotate')
        pointerAngle?: number;
        lastAngle?: number;
        rotationAccumRad?: number;
        initialRotationDeg?: number;
      }
    | null
  >(null);

  const clientToSvg = useCallback((clientX: number, clientY: number): MotifPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    return clientPointToSvgUser(svg, clientX, clientY);
  }, []);

  const panelLeft = position.x - size.width / 2;
  const panelTop = position.y - size.height / 2;
  const localPolygon = pointsToLocalPolygonAttribute(points, size.width, size.height);
  const motifCenterSvgX = panelLeft + size.width / 2;
  const motifCenterSvgY = panelTop + size.height / 2;
  const rotateHandleSvgX = motifCenterSvgX;
  // Curves are often thin bands — park the ring above the panel so it stays grabable.
  const rotateHandleSvgY = curveMode
    ? Math.max(2, panelTop - Math.min(8, Math.max(4, size.height * 0.2)))
    : panelTop + Math.min(10, Math.max(6, size.height * 0.12));

  // Inference fallback (backward compatibility):
  // - older saved motifs might not have `primitive` persisted yet.
  const inferred = inferMotifPrimitiveFromPoints(points);

  const effectivePrimitive: HeroMotifPrimitive =
    primitive && primitive !== 'free'
      ? primitive
      : inferred === 'halfCircle'
        ? 'halfCircle'
        : inferred === 'circle'
          ? 'circle'
          : 'free';

  const lockPointEditing = curveMode || effectivePrimitive !== 'free';
  const canEditPoints = !lockPointEditing; // vertex editing allowed only for free motifs
  // Circle + half-circle: keep panel square so the silhouette stays round.
  const enforceSquareOnResize =
    !curveMode &&
    (primitive === 'circle' ||
      primitive === 'halfCircle' ||
      effectivePrimitive === 'circle' ||
      effectivePrimitive === 'halfCircle');
  const showRotateHandle =
    curveMode || primitive === 'halfCircle' || inferred === 'halfCircle';
  const useSmoothPrimitive = !curveMode && lockPointEditing;
  const circleRadius =
    Math.min(size.width, size.height) * 0.42;
  const curvePathD = curveMode ? heroMotifCurvePathD(curveAxis, curveBend) : '';
  const showCurveGlow =
    curveMode && curveGlowBlurPx > 0 && curveGlowStrength > 0;
  const curveGlowLayers = showCurveGlow
    ? [
        {
          width: strokeWidthPx + curveGlowBlurPx * 0.55,
          opacity: (curveGlowStrength / 100) * 0.2,
        },
        {
          width: strokeWidthPx + curveGlowBlurPx * 0.32,
          opacity: (curveGlowStrength / 100) * 0.32,
        },
        {
          width: strokeWidthPx + curveGlowBlurPx * 0.16,
          opacity: (curveGlowStrength / 100) * 0.48,
        },
      ]
    : [];

  useEffect(() => {
    if (canEditPoints) return;
    if (mode === 'shape') {
      setMode('resize');
    }
    setAddPointMode(false);
    setSelectedIndex(null);
  }, [canEditPoints, mode]);

  // Capture can land on the orange handle, not the <svg> — listen on window while dragging
  // so move/up still fire under modal backdrop-filter / pointer-capture.
  useEffect(() => {
    if (!drag) return;

    const onMove = (event: PointerEvent) => {
      if (!dragOrigin.current) return;

      if (drag.kind === 'move') {
        const origin = dragOrigin.current;
        if (origin.svgWidth <= 0 || origin.svgHeight <= 0) return;
        const dx = ((event.clientX - origin.clientX) / origin.svgWidth) * 100;
        const dy = ((event.clientY - origin.clientY) / origin.svgHeight) * 100;
        onChangeTransform({
          position: clampMotifPanelPosition(
            {
              x: origin.position.x + dx,
              y: origin.position.y + dy,
            },
            side,
            size,
            { allowOverflow: curveMode }
          ),
        });
        return;
      }

      const next = clientToSvg(event.clientX, event.clientY);
      if (!next) return;

      if (drag.kind === 'shape') {
        const local = svgToLocalPoint(next, dragOrigin.current.position, dragOrigin.current.size);
        onChangePoints(points.map((point, index) => (index === drag.index ? local : point)));
        return;
      }

      if (drag.kind === 'rotate') {
        const origin = dragOrigin.current;
        const pointerLocal = svgToLocalPoint(next, origin.position, origin.size);
        if (origin.lastAngle == null || origin.initialRotationDeg == null) return;

        const adx = pointerLocal.x - 50;
        const adyUp = 50 - pointerLocal.y;
        const angleNow = Math.atan2(adyUp, adx);
        const deltaRaw = angleNow - origin.lastAngle;
        const twoPi = Math.PI * 2;
        const delta = ((deltaRaw + Math.PI) % twoPi) - Math.PI;

        origin.rotationAccumRad = (origin.rotationAccumRad ?? 0) + delta;
        origin.lastAngle = angleNow;

        const nextDeg =
          (((origin.initialRotationDeg - (origin.rotationAccumRad * 180) / Math.PI) % 360) + 360) %
          360;
        onChangeRotation?.(nextDeg);
        return;
      }

      if (drag.kind === 'resize') {
        const halfW = Math.max(5, Math.abs(next.x - dragOrigin.current.position.x));
        const halfH = Math.max(5, Math.abs(next.y - dragOrigin.current.position.y));
        const half = enforceSquareOnResize ? Math.max(halfW, halfH) : null;
        onChangeTransform({
          size: clampMotifPanelSize(
            {
              width: (half ?? halfW) * 2,
              height: (half ?? halfH) * 2,
            },
            side,
            { freePlacement: curveMode }
          ),
        });
      }
    };

    const onUp = () => {
      setDrag(null);
      dragOrigin.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [
    drag,
    clientToSvg,
    onChangeTransform,
    onChangePoints,
    onChangeRotation,
    points,
    side,
    size,
    enforceSquareOnResize,
    curveMode,
  ]);

  const handlePointerUp = () => {
    setDrag(null);
    dragOrigin.current = null;
  };

  const handleCanvasClick = (event: React.PointerEvent<SVGSVGElement>) => {
    if (drag) return;
    if (mode !== 'shape') return;
    const click = clientToSvg(event.clientX, event.clientY);
    if (!click) return;

    if (addPointMode) {
      const local = svgToLocalPoint(click, position, size);
      onChangePoints(insertMotifPointOnEdge(points, local));
      return;
    }

    setSelectedIndex(null);
  };

  const startDrag = (event: React.PointerEvent, state: DragState) => {
    event.stopPropagation();
    const svg = svgRef.current;
    const rect = svg?.getBoundingClientRect();
    const pointer = clientToSvg(event.clientX, event.clientY);
    if (!pointer || !rect || rect.width <= 0 || rect.height <= 0) return;

    const shared = {
      position: { ...position },
      size: { ...size },
      pointer,
      clientX: event.clientX,
      clientY: event.clientY,
      svgWidth: rect.width,
      svgHeight: rect.height,
    };

    if (state.kind === 'rotate') {
      const pointerLocal = svgToLocalPoint(pointer, position, size);
      const dx = pointerLocal.x - 50;
      const dyUp = 50 - pointerLocal.y;
      const pointerAngle = Math.atan2(dyUp, dx);
      dragOrigin.current = {
        ...shared,
        pointerAngle,
        lastAngle: pointerAngle,
        rotationAccumRad: 0,
        initialRotationDeg: rotationDeg,
      };
    } else {
      dragOrigin.current = shared;
    }

    setDrag(state);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const applyTemplate = (template: MotifShapeTemplateId) => {
    const nextPoints = getMotifTemplatePoints(template, side);
    const nextPrimitive: HeroMotifPrimitive =
      template === 'circle'
        ? 'circle'
        : template === 'oval'
          ? 'oval'
          : template === 'half-circle'
            ? 'halfCircle'
            : 'free';

    setSelectedIndex(null);
    setAddPointMode(false);
    setMode('resize');

    // Single parent update — never split points / primitive across two patches.
    if (onApplyTemplate) {
      onApplyTemplate({
        points: nextPoints,
        primitive: nextPrimitive,
        template,
        rotationDeg: 0,
      });
      return;
    }

    onChangePoints(nextPoints);
    onChangePrimitive?.(nextPrimitive);
    onChangeRotation?.(0);
  };

  const deleteSelected = () => {
    if (selectedIndex === null) return;
    onChangePoints(removeMotifPoint(points, selectedIndex));
    setSelectedIndex(null);
  };

  const corners: { id: 'nw' | 'ne' | 'sw' | 'se'; x: number; y: number }[] = [
    { id: 'nw', x: panelLeft, y: panelTop },
    { id: 'ne', x: panelLeft + size.width, y: panelTop },
    { id: 'sw', x: panelLeft, y: panelTop + size.height },
    { id: 'se', x: panelLeft + size.width, y: panelTop + size.height },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'move' as const, label: 'Move motif' },
            { id: 'resize' as const, label: 'Resize' },
            ...(canEditPoints ? [{ id: 'shape' as const, label: 'Edit shape' }] : []),
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setMode(item.id);
              setAddPointMode(false);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              mode === item.id
                ? 'bg-neutral-900 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {showTemplates ? (
        <div className="flex flex-wrap gap-2">
          {MOTIF_SHAPE_TEMPLATES.map((template) => {
            const templatePrimitive: HeroMotifPrimitive =
              template.id === 'circle'
                ? 'circle'
                : template.id === 'oval'
                  ? 'oval'
                  : template.id === 'half-circle'
                    ? 'halfCircle'
                    : 'free';
            // Highlight only locked primitives — free templates share the same primitive value.
            const highlight =
              templatePrimitive !== 'free' && effectivePrimitive === templatePrimitive;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  highlight
                    ? 'border-neutral-900 bg-neutral-950 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {template.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMockupEnabled((current) => !current)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            mockupEnabled
              ? 'bg-neutral-900 text-white'
              : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          Layout mockup
        </button>
        {mockupEnabled ? (
          <>
            <button
              type="button"
              onClick={() => setPreviewLayout('desktop')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                previewLayout === 'desktop'
                  ? 'bg-orange-600 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewLayout('mobile')}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                previewLayout === 'mobile'
                  ? 'bg-orange-600 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              Mobile
            </button>
          </>
        ) : null}
      </div>

      {mode === 'shape' ? (
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
          <span className="text-xs text-neutral-500">{points.length} points</span>
        </div>
      ) : (
        <p className="text-xs text-neutral-500">
          {lockPointEditing
            ? curveMode
              ? 'Curve stroke: drag, resize, and rotate (orange ring handle) to any angle — no vertex points.'
              : showRotateHandle
                ? 'Demi-cercle lisse (SVG/CSS) : déplace, redimensionne, oriente à 360° — sans points.'
                : 'Cercle / ovale lisses (ellipse CSS) : déplace et redimensionne — sans points.'
            : mode === 'move'
              ? mockupEnabled
                ? 'Wireframe shows copy, portrait, and stats — align the motif against these guides.'
                : 'Drag the orange center handle to move the motif freely on the hero.'
              : 'Drag a corner handle to resize the motif panel.'}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-auto w-full touch-none select-none"
          style={{ aspectRatio: previewLayout === 'mobile' ? '9 / 14' : '16 / 10' }}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerDown={handleCanvasClick}
          role="img"
          aria-label={`${side} motif canvas editor`}
        >
          {mockupEnabled ? (
            <MotifCanvasLayoutMockup layout={previewLayout} fullBleed={curveMode} />
          ) : (
            <>
              <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
              <rect
                x={side === 'left' ? 52 : 0}
                y="0"
                width={side === 'left' ? 48 : 52}
                height="100"
                fill="#f5f5f5"
              />
              <line
                x1="52"
                y1="0"
                x2="52"
                y2="100"
                stroke="#e5e5e5"
                strokeWidth="0.4"
                strokeDasharray="2 2"
              />
            </>
          )}

          <rect
            x={panelLeft}
            y={panelTop}
            width={size.width}
            height={size.height}
            fill="none"
            stroke="#171717"
            strokeWidth="0.35"
            strokeOpacity="0.25"
            strokeDasharray="1.5 1.5"
          />

          <g transform={`translate(${panelLeft}, ${panelTop})`}>
            {curveMode ? (
              <svg
                x={0}
                y={0}
                width={size.width}
                height={size.height}
                viewBox="0 0 100 100"
                overflow="visible"
              >
                <g transform={rotationDeg ? `rotate(${rotationDeg} 50 50)` : undefined}>
                  {curveGlowLayers.map((layer, index) => (
                    <path
                      key={`canvas-curve-glow-${index}`}
                      d={curvePathD}
                      fill="none"
                      stroke={color}
                      strokeWidth={Math.max(1.4, layer.width * 0.55)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeOpacity={Math.min(1, layer.opacity)}
                    />
                  ))}
                  <path
                    d={curvePathD}
                    fill="none"
                    stroke={color}
                    strokeWidth={Math.max(1.2, strokeWidthPx * 0.55)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.92"
                  />
                </g>
              </svg>
            ) : useSmoothPrimitive ? (
              effectivePrimitive === 'halfCircle' ? (
                <g
                  transform={`rotate(${rotationDeg}, ${size.width / 2}, ${size.height / 2})`}
                >
                  {/* True SVG half-disk — equal radii so it stays circular. */}
                  <path
                    d={`M ${size.width / 2 - circleRadius} ${size.height / 2} A ${circleRadius} ${circleRadius} 0 0 0 ${size.width / 2 + circleRadius} ${size.height / 2} Z`}
                    fill={color}
                    opacity="0.88"
                  />
                  <path
                    d={`M ${size.width / 2 - circleRadius} ${size.height / 2} A ${circleRadius} ${circleRadius} 0 0 0 ${size.width / 2 + circleRadius} ${size.height / 2} Z`}
                    fill="none"
                    stroke="#171717"
                    strokeWidth="0.45"
                    strokeOpacity="0.35"
                  />
                </g>
              ) : effectivePrimitive === 'circle' ? (
                <>
                  {/* True SVG circle — equal rx/ry (never stretched into an oval). */}
                  <ellipse
                    cx={size.width / 2}
                    cy={size.height / 2}
                    rx={circleRadius}
                    ry={circleRadius}
                    fill={color}
                    opacity="0.88"
                  />
                  <ellipse
                    cx={size.width / 2}
                    cy={size.height / 2}
                    rx={circleRadius}
                    ry={circleRadius}
                    fill="none"
                    stroke="#171717"
                    strokeWidth="0.45"
                    strokeOpacity="0.35"
                  />
                </>
              ) : (
                <>
                  {/* Oval — intentional ellipse from free panel size. */}
                  <ellipse
                    cx={size.width / 2}
                    cy={size.height / 2}
                    rx={size.width * 0.42}
                    ry={size.height * 0.42}
                    fill={color}
                    opacity="0.88"
                  />
                  <ellipse
                    cx={size.width / 2}
                    cy={size.height / 2}
                    rx={size.width * 0.42}
                    ry={size.height * 0.42}
                    fill="none"
                    stroke="#171717"
                    strokeWidth="0.45"
                    strokeOpacity="0.35"
                  />
                </>
              )
            ) : (
              <>
                <polygon points={localPolygon} fill={color} opacity="0.88" />
                <polygon
                  points={localPolygon}
                  fill="none"
                  stroke="#171717"
                  strokeWidth="0.45"
                  strokeOpacity="0.35"
                />
              </>
            )}
          </g>

          {mode === 'shape'
            ? points.map((point, index) => {
                const absX = panelLeft + (point.x / 100) * size.width;
                const absY = panelTop + (point.y / 100) * size.height;
                const selected = selectedIndex === index;
                return (
                  <circle
                    key={`motif-vertex-${index}`}
                    cx={absX}
                    cy={absY}
                    r={selected ? 3 : 2.4}
                    fill={selected ? '#ea580c' : '#ffffff'}
                    stroke={selected ? '#c2410c' : '#171717'}
                    strokeWidth="0.65"
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(event) => {
                      setSelectedIndex(index);
                      startDrag(event, { kind: 'shape', index });
                    }}
                  />
                );
              })
            : null}

          {mode === 'resize'
            ? corners.map((corner) => (
                <rect
                  key={`resize-${corner.id}`}
                  x={corner.x - 1.6}
                  y={corner.y - 1.6}
                  width={3.2}
                  height={3.2}
                  rx="0.6"
                  fill="#ffffff"
                  stroke="#171717"
                  strokeWidth="0.55"
                  className="cursor-nwse-resize"
                  onPointerDown={(event) => startDrag(event, { kind: 'resize', corner: corner.id })}
                />
              ))
            : null}

          {showRotateHandle ? (
            <circle
              cx={rotateHandleSvgX}
              cy={rotateHandleSvgY}
              r={mode === 'move' ? 3 : 2.6}
              fill="#ffffff"
              stroke="#ea580c"
              strokeWidth="1.2"
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(event) => {
                setMode('move');
                startDrag(event, { kind: 'rotate' });
              }}
            />
          ) : null}

          <circle
            cx={position.x}
            cy={position.y}
            r={mode === 'move' ? 3.2 : 2.8}
            fill="#ea580c"
            stroke="#ffffff"
            strokeWidth="0.85"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(event) => {
              setMode('move');
              startDrag(event, { kind: 'move' });
            }}
          />
        </svg>
      </div>
    </div>
  );
}
