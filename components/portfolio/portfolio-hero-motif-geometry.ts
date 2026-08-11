export type MotifPoint = { x: number; y: number };

/** Percentage coordinates (0–100) inside the motif panel. */
export const DEFAULT_CUSTOM_MOTIF_POINTS: MotifPoint[] = [
  { x: 0, y: 100 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
];

export const DEFAULT_LEFT_CUSTOM_MOTIF_POINTS: MotifPoint[] = [
  { x: 0, y: 100 },
  { x: 100, y: 100 },
  { x: 100, y: 28 },
  { x: 0, y: 58 },
];

export type MotifShapeTemplateId =
  | 'diagonal'
  | 'rectangle'
  | 'square'
  | 'circle'
  | 'oval'
  | 'triangle'
  | 'diamond'
  | 'half-circle'
  | 'trapezoid';

export type MotifEditorSide = 'left' | 'right';

export const MOTIF_SHAPE_TEMPLATES: {
  id: MotifShapeTemplateId;
  label: string;
}[] = [
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'square', label: 'Square' },
  { id: 'circle', label: 'Circle' },
  { id: 'oval', label: 'Oval' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'half-circle', label: 'Half circle' },
  { id: 'trapezoid', label: 'Trapezoid' },
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampMotifPoint(point: MotifPoint): MotifPoint {
  return { x: clamp(point.x, 0, 100), y: clamp(point.y, 0, 100) };
}

export function motifPointsToClipPath(points: MotifPoint[]): string {
  if (points.length < 3) {
    return motifPointsToClipPath(DEFAULT_CUSTOM_MOTIF_POINTS);
  }
  return `polygon(${points
    .map((point) => {
      const p = clampMotifPoint(point);
      return `${p.x}% ${p.y}%`;
    })
    .join(', ')})`;
}

export function generateCircleMotifPoints(
  cx = 50,
  cy = 50,
  radius = 42,
  segments = 32
): MotifPoint[] {
  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2 - Math.PI / 2;
    return clampMotifPoint({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  });
}

export function generateOvalMotifPoints(
  cx = 50,
  cy = 50,
  radiusX = 42,
  radiusY = 34,
  segments = 32
): MotifPoint[] {
  return Array.from({ length: segments }, (_, index) => {
    const angle = (index / segments) * Math.PI * 2 - Math.PI / 2;
    return clampMotifPoint({
      x: cx + Math.cos(angle) * radiusX,
      y: cy + Math.sin(angle) * radiusY,
    });
  });
}

/**
 * Filled half-disk in motif local space (0–100).
 * Returns polygon points that include the center point so clip-path polygon fills the semicircle.
 */
export function generateHalfCircleMotifPoints(
  cx = 50,
  cy = 50,
  radius = 42,
  segments = 24,
  /** Angles are in radians, 0 points to the right, -π/2 is "top" in this SVG coordinate system. */
  startAngle = -Math.PI,
  endAngle = 0
): MotifPoint[] {
  const arcPoints: MotifPoint[] = Array.from({ length: segments + 1 }, (_, index) => {
    const t = segments === 0 ? 0 : index / segments;
    const angle = startAngle + (endAngle - startAngle) * t;
    return clampMotifPoint({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    });
  });

  // Include center point first so the last arc point closes back to the center for a filled shape.
  return [{ x: cx, y: cy }, ...arcPoints];
}

/** Centered, aligned templates in local 0–100 panel space. */
export function getMotifTemplatePoints(
  template: MotifShapeTemplateId,
  side: MotifEditorSide = 'right'
): MotifPoint[] {
  switch (template) {
    case 'rectangle':
      return [
        { x: 4, y: 4 },
        { x: 96, y: 4 },
        { x: 96, y: 96 },
        { x: 4, y: 96 },
      ];
    case 'square':
      return [
        { x: 18, y: 18 },
        { x: 82, y: 18 },
        { x: 82, y: 82 },
        { x: 18, y: 82 },
      ];
    case 'circle':
      return generateCircleMotifPoints(50, 50, 42);
    case 'oval':
      // Default "soft ellipse": editing still allows resizing of the motif panel.
      return generateOvalMotifPoints(50, 50, 42, 34, 32);
    case 'triangle':
      return side === 'left'
        ? [
            { x: 8, y: 92 },
            { x: 92, y: 92 },
            { x: 92, y: 12 },
          ]
        : [
            { x: 0, y: 100 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ];
    case 'diamond':
      return [
        { x: 50, y: 6 },
        { x: 94, y: 50 },
        { x: 50, y: 94 },
        { x: 6, y: 50 },
      ];
    case 'trapezoid':
      return [
        { x: 8, y: 92 },
        { x: 92, y: 92 },
        { x: 78, y: 12 },
        { x: 22, y: 12 },
      ];
    case 'half-circle':
      // Top semicircle by default (center + arc). Orientation is handled by rotating points in the editor.
      return generateHalfCircleMotifPoints(50, 50, 42, 24, -Math.PI, 0);
    case 'diagonal':
      return side === 'left'
        ? [
            { x: 4, y: 96 },
            { x: 96, y: 58 },
            { x: 96, y: 96 },
          ]
        : [
            { x: 0, y: 100 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ];
    default:
      return side === 'left'
        ? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point }))
        : DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point }));
  }
}

export type RightMotifPresetShape =
  | 'diagonal'
  | 'triangle'
  | 'trapezoid'
  | 'block'
  | 'chevron'
  | 'prism';

export function getRightMotifPresetPoints(shape: RightMotifPresetShape): MotifPoint[] {
  switch (shape) {
    case 'triangle':
      return getMotifTemplatePoints('triangle', 'right');
    case 'trapezoid':
      return getMotifTemplatePoints('trapezoid', 'right');
    case 'block':
      return getMotifTemplatePoints('rectangle', 'right');
    case 'chevron':
      return [
        { x: 4, y: 96 },
        { x: 48, y: 52 },
        { x: 4, y: 8 },
        { x: 96, y: 4 },
        { x: 96, y: 96 },
      ];
    case 'prism':
      return [
        { x: 4, y: 96 },
        { x: 40, y: 44 },
        { x: 96, y: 4 },
        { x: 96, y: 96 },
      ];
    default:
      return getMotifTemplatePoints('diagonal', 'right');
  }
}

function pointToSegmentDistance(
  point: MotifPoint,
  a: MotifPoint,
  b: MotifPoint
): { dist: number; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const dist = Math.hypot(point.x - a.x, point.y - a.y);
    return { dist, t: 0 };
  }
  let t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq;
  t = clamp(t, 0, 1);
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return { dist: Math.hypot(point.x - projX, point.y - projY), t };
}

export function insertMotifPointOnEdge(points: MotifPoint[], click: MotifPoint): MotifPoint[] {
  if (points.length < 2) return points;

  let bestDist = Infinity;
  let bestIndex = 0;
  let bestT = 0;

  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    const { dist, t } = pointToSegmentDistance(click, a, b);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = index;
      bestT = t;
    }
  }

  if (bestDist > 6) return points;

  const a = points[bestIndex];
  const b = points[(bestIndex + 1) % points.length];
  const inserted = clampMotifPoint({
    x: a.x + (b.x - a.x) * bestT,
    y: a.y + (b.y - a.y) * bestT,
  });

  const next = [...points];
  next.splice(bestIndex + 1, 0, inserted);
  return next;
}

export function removeMotifPoint(points: MotifPoint[], index: number): MotifPoint[] {
  if (points.length <= 3 || index < 0 || index >= points.length) return points;
  return points.filter((_, pointIndex) => pointIndex !== index);
}

/** Mirror shape points inside a motif panel (0–100 local space). */
export function mirrorMotifPointsHorizontally(points: MotifPoint[]): MotifPoint[] {
  return points.map((point) =>
    clampMotifPoint({
      x: 100 - point.x,
      y: point.y,
    })
  );
}

/** True when the polygon has a tall edge flush to the left of the panel. */
export function motifHasLeftVerticalEdge(points: MotifPoint[]): boolean {
  const leftPts = points.filter((point) => point.x <= 8);
  if (leftPts.length < 2) return false;
  const ys = leftPts.map((point) => point.y);
  return Math.max(...ys) - Math.min(...ys) > 35;
}

/** True when the polygon has a tall edge flush to the right of the panel. */
export function motifHasRightVerticalEdge(points: MotifPoint[]): boolean {
  const rightPts = points.filter((point) => point.x >= 92);
  if (rightPts.length < 2) return false;
  const ys = rightPts.map((point) => point.y);
  return Math.max(...ys) - Math.min(...ys) > 35;
}

/**
 * Right-column geometric motifs must hug the right edge (classic editorial slash).
 * If a flip left a left-edge silhouette on the right, mirror it back.
 */
export function ensureRightColumnMotifPoints(points: MotifPoint[]): MotifPoint[] {
  if (points.length < 3) {
    return DEFAULT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point }));
  }
  if (motifHasLeftVerticalEdge(points) && !motifHasRightVerticalEdge(points)) {
    return mirrorMotifPointsHorizontally(points);
  }
  return points.map((point) => ({ ...point }));
}

/**
 * Left-column geometric motifs (Visual | Copy) hug the left edge.
 */
export function ensureLeftColumnMotifPoints(points: MotifPoint[]): MotifPoint[] {
  if (points.length < 3) {
    return mirrorMotifPointsHorizontally(DEFAULT_CUSTOM_MOTIF_POINTS);
  }
  if (motifHasRightVerticalEdge(points) && !motifHasLeftVerticalEdge(points)) {
    return mirrorMotifPointsHorizontally(points);
  }
  return points.map((point) => ({ ...point }));
}

export function sanitizeMotifPoints(points: unknown, fallback = DEFAULT_CUSTOM_MOTIF_POINTS): MotifPoint[] {
  if (!Array.isArray(points)) return fallback.map((point) => ({ ...point }));

  const valid = points
    .filter(
      (point): point is MotifPoint =>
        typeof point === 'object' &&
        point !== null &&
        typeof (point as MotifPoint).x === 'number' &&
        typeof (point as MotifPoint).y === 'number'
    )
    .map((point) => clampMotifPoint(point));

  return valid.length >= 3 ? valid : fallback.map((point) => ({ ...point }));
}

export function pointsToPolygonAttribute(points: MotifPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

export function pointsToLocalPolygonAttribute(
  points: MotifPoint[],
  width: number,
  height: number
): string {
  return points
    .map((point) => `${(point.x / 100) * width},${(point.y / 100) * height}`)
    .join(' ');
}

export function getPointsCentroid(points: MotifPoint[]): MotifPoint {
  if (points.length === 0) return { x: 50, y: 50 };
  const sum = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

/**
 * Detect legacy circle / half-circle polygons so we can upgrade them to smooth CSS primitives.
 */
export function inferMotifPrimitiveFromPoints(
  points: MotifPoint[]
): 'circle' | 'halfCircle' | null {
  if (!points || points.length < 8) return null;
  const center = { x: 50, y: 50 };
  const hasCenter = points.some((p) => Math.hypot(p.x - center.x, p.y - center.y) <= 1.6);
  if (hasCenter && points.length >= 10) return 'halfCircle';

  const centroid = getPointsCentroid(points);
  if (Math.hypot(centroid.x - center.x, centroid.y - center.y) > 2.5) return null;

  const radii = points.map((p) => Math.hypot(p.x - center.x, p.y - center.y));
  const mean = radii.reduce((s, r) => s + r, 0) / radii.length;
  if (mean < 20) return null;
  const variance = radii.reduce((s, r) => s + (r - mean) * (r - mean), 0) / radii.length;
  if (Math.sqrt(variance) <= 1.5) return 'circle';
  return null;
}
