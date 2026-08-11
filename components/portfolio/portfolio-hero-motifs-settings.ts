import type { CSSProperties } from 'react';
import {
  DEFAULT_CUSTOM_MOTIF_POINTS,
  DEFAULT_LEFT_CUSTOM_MOTIF_POINTS,
  ensureLeftColumnMotifPoints,
  ensureRightColumnMotifPoints,
  getRightMotifPresetPoints,
  inferMotifPrimitiveFromPoints,
  motifPointsToClipPath,
  sanitizeMotifPoints,
  type MotifPoint,
  type RightMotifPresetShape,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  motifPanelContainerStyle,
  normalizeMotifPositionForContentFrame,
  sanitizeMotifPanelPosition,
  sanitizeMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import {
  DEFAULT_HERO_LEFT_MOTIF_SETTINGS,
  leftMotifInnerStyle,
  type PortfolioHeroLeftMotifPattern,
  type PortfolioHeroLeftMotifSettings,
} from '@/components/portfolio/portfolio-hero-left-motif-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  heroMotifPanelFillStyle,
  type PortfolioHeroBackgroundSettings,
} from '@/components/portfolio/portfolio-hero-background-settings';

/** Mirrors PortfolioHeroMotifShape without importing hero-settings (avoids cycles). */
export type HeroMotifShape =
  | 'diagonal'
  | 'triangle'
  | 'trapezoid'
  | 'block'
  | 'chevron'
  | 'prism'
  | 'custom';

export type HeroMotifKind = 'geometric' | 'pattern' | 'glow' | 'curve';

/**
 * Geometric motif "favor" primitive used by the right-side canvas editor.
 * When not `free`, the editor hides point handles and offers scale + (half-circle) rotation only.
 */
export type HeroMotifPrimitive = 'free' | 'circle' | 'oval' | 'halfCircle';

/** Axis of a curved stroke (endpoints on opposite sides of the motif panel). */
export type HeroMotifCurveAxis = 'vertical' | 'horizontal' | 'diagonal' | 'diagonal-alt';

export const HERO_MOTIF_CURVE_AXIS_OPTIONS: {
  value: HeroMotifCurveAxis;
  label: string;
  description: string;
}[] = [
  { value: 'vertical', label: 'Vertical', description: 'Top → bottom, bend left/right.' },
  { value: 'horizontal', label: 'Horizontal', description: 'Left → right, bend up/down.' },
  { value: 'diagonal', label: 'Diagonal ╲', description: 'Top-left → bottom-right.' },
  { value: 'diagonal-alt', label: 'Diagonal ╱', description: 'Top-right → bottom-left.' },
];

export const HERO_CURVE_BEND_MIN = -500;
export const HERO_CURVE_BEND_MAX = 500;
export const HERO_CURVE_STROKE_MIN = 1;
export const HERO_CURVE_STROKE_MAX = 40;
export const DEFAULT_HERO_CURVE_BEND = 28;
export const DEFAULT_HERO_CURVE_STROKE_PX = 3;
export const HERO_CURVE_GLOW_STRENGTH_MIN = 0;
export const HERO_CURVE_GLOW_STRENGTH_MAX = 100;
export const DEFAULT_HERO_CURVE_GLOW_BLUR_PX = 18;
export const DEFAULT_HERO_CURVE_GLOW_STRENGTH = 65;

/** Breakpoint split matches hero layout: stacked below xl, dual-column at xl+. */
export type HeroMotifVisibility = {
  /** Mobile + tablet (below xl). */
  mobile: boolean;
  /** Desktop (xl and up). */
  desktop: boolean;
};

/** Glow / curve scroll attachment. Geometric & pattern are always section-scoped. */
export type HeroMotifScrollAttach = 'section' | 'fixed';

export const DEFAULT_HERO_MOTIF_SCROLL_ATTACH: HeroMotifScrollAttach = 'section';

export function sanitizeHeroMotifScrollAttach(
  value: unknown,
  fallback: HeroMotifScrollAttach = DEFAULT_HERO_MOTIF_SCROLL_ATTACH
): HeroMotifScrollAttach {
  return value === 'fixed' || value === 'section' ? value : fallback;
}

export type HeroMotifInstance = {
  id: string;
  label: string;
  enabled: boolean;
  kind: HeroMotifKind;
  visibility: HeroMotifVisibility;
  position: MotifPanelPosition;
  size: MotifPanelSize;
  color: string;
  /**
   * Optional per-layer palette token (Principal, Neutre, …).
   * When set (and Hero palette mode is on), this layer’s color follows that token
   * instead of the shared Motif / Principal binding.
   */
  paletteToken?: HeroMotifPaletteToken;
  /** Opacity in light mode (0–100). */
  opacity: number;
  /**
   * Opacity in dark mode (0–100). When omitted, falls back to `opacity`
   * so existing saves keep working until edited.
   */
  opacityDark?: number;
  zIndex: number;
  shape: HeroMotifShape;
  points: MotifPoint[];
  /**
   * Semantic editor primitive. When not `free`, the live motif is rendered as a
   * true CSS circle / ellipse / half-disk (smooth) — never a polygon of points.
   */
  primitive?: HeroMotifPrimitive;
  /**
   * Orientation for half-circle (and reserved for future primitives), degrees 0–360.
   * Applied via CSS/SVG transform — not by baking rotation into polygon points.
   */
  rotationDeg?: number;
  pattern: Exclude<PortfolioHeroLeftMotifPattern, 'none'>;
  /**
   * Soft glow / blob (`kind === 'glow'`): CSS `filter: blur` in px.
   * Curved stroke (`kind === 'curve'`): halo blur around the line (0 = crisp only).
   */
  blurPx?: number;
  /**
   * Soft glow only: `backdrop-filter: blur` — frosts the section background
   * behind the blob (content above motifs stays sharp).
   */
  backdropBlurPx?: number;
  /**
   * Curved stroke motif (`kind === 'curve'`): endpoint axis inside the panel.
   */
  curveAxis?: HeroMotifCurveAxis;
  /**
   * Curved stroke: bend amount (−500…500). 0 = straight line; ± bows the mid control point.
   */
  curveBend?: number;
  /** Curved stroke width in CSS px. */
  strokeWidthPx?: number;
  /**
   * Curved stroke halo intensity (0–100). Used with `blurPx` for the soft under-stroke.
   */
  strokeGlowStrength?: number;
  /**
   * Curved stroke: when true, paints under ambient glow blob layers; when false, above them.
   */
  underGlow?: boolean;
  /**
   * Glow / curve only: where the motif is attached while scrolling.
   * - `section` — stays in the Hero (scrolls away with it)
   * - `fixed` — pinned to the viewport (global site decoration)
   */
  scrollAttach?: HeroMotifScrollAttach;
};

/** True when a glow/curve is pinned to the viewport as a global motif. */
export function isHeroMotifViewportFixed(
  motif: Pick<HeroMotifInstance, 'kind' | 'scrollAttach'>
): boolean {
  return (
    (motif.kind === 'glow' || motif.kind === 'curve') &&
    sanitizeHeroMotifScrollAttach(motif.scrollAttach) === 'fixed'
  );
}

/** Same ids as HeroPaletteTokenId — kept local to avoid import cycles with palette-settings. */
export type HeroMotifPaletteToken =
  | 'principal'
  | 'secondaire'
  | 'texteFort'
  | 'texteMuted'
  | 'texteFaint'
  | 'neutre'
  | 'fond'
  | 'bordure';

export const HERO_MOTIF_PALETTE_TOKENS: HeroMotifPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
  'texteMuted',
  'texteFaint',
  'neutre',
  'fond',
  'bordure',
];

export function sanitizeHeroMotifPaletteToken(
  value: unknown,
  fallback?: HeroMotifPaletteToken
): HeroMotifPaletteToken | undefined {
  if (value === null || value === '') return undefined;
  if (
    typeof value === 'string' &&
    (HERO_MOTIF_PALETTE_TOKENS as readonly string[]).includes(value)
  ) {
    return value as HeroMotifPaletteToken;
  }
  return fallback;
}

export const MAX_HERO_MOTIFS = 8;
export const DEFAULT_MOTIF_COLOR = '#E5E5E5';
export const HERO_GLOW_BLUR_PX_MIN = 0;
export const HERO_GLOW_BLUR_PX_MAX = 120;
export const HERO_GLOW_BACKDROP_BLUR_PX_MIN = 0;
export const HERO_GLOW_BACKDROP_BLUR_PX_MAX = 40;
export const DEFAULT_HERO_GLOW_BLUR_PX = 48;
export const DEFAULT_HERO_GLOW_BACKDROP_BLUR_PX = 0;
export const DEFAULT_HERO_GLOW_COLOR = '#e2572e';

export const DEFAULT_HERO_MOTIF_VISIBILITY: HeroMotifVisibility = {
  mobile: false,
  desktop: true,
};

export const DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY: HeroMotifVisibility = {
  mobile: true,
  desktop: true,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizeMotifOpacity(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? clamp(value, 0, 100)
    : clamp(fallback, 0, 100);
}

/** Effective motif opacity for the active Global color mode. */
export function resolveHeroMotifOpacity(
  motif: Pick<HeroMotifInstance, 'opacity' | 'opacityDark'>,
  colorMode: 'light' | 'dark' = 'dark'
): number {
  if (colorMode === 'dark') {
    return sanitizeMotifOpacity(motif.opacityDark, motif.opacity);
  }
  return sanitizeMotifOpacity(motif.opacity, 100);
}

function newMotifId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function sanitizeHeroGlowBlurPx(value: unknown, fallback = DEFAULT_HERO_GLOW_BLUR_PX): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(clamp(n, HERO_GLOW_BLUR_PX_MIN, HERO_GLOW_BLUR_PX_MAX));
}

export function sanitizeHeroGlowBackdropBlurPx(
  value: unknown,
  fallback = DEFAULT_HERO_GLOW_BACKDROP_BLUR_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(clamp(n, HERO_GLOW_BACKDROP_BLUR_PX_MIN, HERO_GLOW_BACKDROP_BLUR_PX_MAX));
}

export function sanitizeHeroCurveGlowStrength(
  value: unknown,
  fallback = DEFAULT_HERO_CURVE_GLOW_STRENGTH
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(clamp(n, HERO_CURVE_GLOW_STRENGTH_MIN, HERO_CURVE_GLOW_STRENGTH_MAX));
}

/** Motifs that hug the visual column (right edge) vs copy column (left). */
export function heroMotifClampSide(kind: HeroMotifKind): 'left' | 'right' {
  return kind === 'pattern' ? 'left' : 'right';
}

/** Curves (and similar free strokes) may overflow the frame so they can sit at any edge. */
export function heroMotifAllowsOverflow(kind: HeroMotifKind): boolean {
  return kind === 'curve';
}

export function createGeometricMotif(
  partial?: Partial<HeroMotifInstance>
): HeroMotifInstance {
  return {
    id: partial?.id ?? newMotifId('geo'),
    label: partial?.label ?? 'Shape',
    enabled: partial?.enabled ?? true,
    kind: 'geometric',
    visibility: partial?.visibility ?? { ...DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY },
    position: partial?.position ?? { x: 78, y: 48 },
    size: partial?.size ?? { width: 42, height: 56 },
    color: partial?.color ?? DEFAULT_MOTIF_COLOR,
    paletteToken: sanitizeHeroMotifPaletteToken(partial?.paletteToken),
    opacity: partial?.opacity ?? 100,
    opacityDark: partial?.opacityDark ?? partial?.opacity ?? 100,
    zIndex: partial?.zIndex ?? 0,
    shape: partial?.shape ?? 'diagonal',
    points: (partial?.points ?? DEFAULT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    primitive: partial?.primitive ?? 'free',
    rotationDeg: partial?.rotationDeg ?? 0,
    pattern: partial?.pattern ?? 'dots',
    blurPx: 0,
    backdropBlurPx: 0,
  };
}

export function createPatternMotif(partial?: Partial<HeroMotifInstance>): HeroMotifInstance {
  return {
    id: partial?.id ?? newMotifId('pat'),
    label: partial?.label ?? 'Pattern',
    enabled: partial?.enabled ?? true,
    kind: 'pattern',
    visibility: partial?.visibility ?? { ...DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY },
    position: partial?.position ?? { x: 22, y: 78 },
    size: partial?.size ?? { width: 48, height: 42 },
    color: partial?.color ?? DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifColor,
    paletteToken: sanitizeHeroMotifPaletteToken(partial?.paletteToken),
    opacity: partial?.opacity ?? 35,
    opacityDark: partial?.opacityDark ?? partial?.opacity ?? 35,
    zIndex: partial?.zIndex ?? 0,
    shape: partial?.shape ?? 'block',
    points: (partial?.points ?? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    primitive: partial?.primitive ?? 'free',
    rotationDeg: partial?.rotationDeg ?? 0,
    pattern: partial?.pattern ?? 'dots',
    blurPx: 0,
    backdropBlurPx: 0,
  };
}

/** Soft round tint between section background and page content (modern ambient wash). */
export function createGlowMotif(partial?: Partial<HeroMotifInstance>): HeroMotifInstance {
  return {
    id: partial?.id ?? newMotifId('glow'),
    label: partial?.label ?? 'Glow',
    enabled: partial?.enabled ?? true,
    kind: 'glow',
    visibility: partial?.visibility ?? { ...DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY },
    position: partial?.position ?? { x: 72, y: 38 },
    size: partial?.size ?? { width: 46, height: 46 },
    color: partial?.color ?? DEFAULT_HERO_GLOW_COLOR,
    paletteToken: sanitizeHeroMotifPaletteToken(partial?.paletteToken),
    opacity: partial?.opacity ?? 55,
    opacityDark: partial?.opacityDark ?? partial?.opacity ?? 55,
    zIndex: partial?.zIndex ?? 1,
    shape: 'custom',
    points: (partial?.points ?? DEFAULT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    primitive: partial?.primitive === 'oval' ? 'oval' : 'circle',
    rotationDeg: 0,
    pattern: 'dots',
    blurPx: sanitizeHeroGlowBlurPx(partial?.blurPx, DEFAULT_HERO_GLOW_BLUR_PX),
    backdropBlurPx: sanitizeHeroGlowBackdropBlurPx(
      partial?.backdropBlurPx,
      DEFAULT_HERO_GLOW_BACKDROP_BLUR_PX
    ),
    scrollAttach: sanitizeHeroMotifScrollAttach(
      partial?.scrollAttach,
      DEFAULT_HERO_MOTIF_SCROLL_ATTACH
    ),
  };
}

/** Decorative curved stroke — move/resize the panel, bend the line, soft stroke glow. */
export function createCurveMotif(partial?: Partial<HeroMotifInstance>): HeroMotifInstance {
  return {
    id: partial?.id ?? newMotifId('curve'),
    label: partial?.label ?? 'Curve',
    enabled: partial?.enabled ?? true,
    kind: 'curve',
    visibility: partial?.visibility ?? { ...DEFAULT_MOBILE_HERO_MOTIF_VISIBILITY },
    // Wide shallow band near the top — easy to nudge to bottom / corners.
    position: partial?.position ?? { x: 50, y: 22 },
    size: partial?.size ?? { width: 108, height: 48 },
    color: partial?.color ?? DEFAULT_MOTIF_COLOR,
    paletteToken: sanitizeHeroMotifPaletteToken(partial?.paletteToken),
    opacity: partial?.opacity ?? 70,
    opacityDark: partial?.opacityDark ?? partial?.opacity ?? 70,
    zIndex: partial?.zIndex ?? 0,
    shape: 'custom',
    points: (partial?.points ?? DEFAULT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    primitive: 'free',
    rotationDeg: sanitizeMotifRotationDeg(partial?.rotationDeg, 0),
    pattern: 'dots',
    blurPx: sanitizeHeroGlowBlurPx(partial?.blurPx, DEFAULT_HERO_CURVE_GLOW_BLUR_PX),
    backdropBlurPx: 0,
    curveAxis: sanitizeHeroMotifCurveAxis(partial?.curveAxis, 'horizontal'),
    curveBend: sanitizeHeroMotifCurveBend(partial?.curveBend, 42),
    strokeWidthPx: sanitizeHeroMotifStrokeWidthPx(
      partial?.strokeWidthPx,
      DEFAULT_HERO_CURVE_STROKE_PX
    ),
    strokeGlowStrength: sanitizeHeroCurveGlowStrength(
      partial?.strokeGlowStrength,
      DEFAULT_HERO_CURVE_GLOW_STRENGTH
    ),
    underGlow: partial?.underGlow !== false,
    scrollAttach: sanitizeHeroMotifScrollAttach(
      partial?.scrollAttach,
      DEFAULT_HERO_MOTIF_SCROLL_ATTACH
    ),
  };
}

export function motifVisibilityClass(visibility: HeroMotifVisibility): string {
  if (visibility.mobile && visibility.desktop) return 'block';
  if (visibility.mobile && !visibility.desktop) return 'block xl:hidden';
  if (!visibility.mobile && visibility.desktop) return 'hidden xl:block';
  return 'hidden';
}

export function sanitizeHeroMotifVisibility(
  value: unknown,
  base: HeroMotifVisibility = DEFAULT_HERO_MOTIF_VISIBILITY
): HeroMotifVisibility {
  if (!value || typeof value !== 'object') return { ...base };
  const record = value as Record<string, unknown>;
  return {
    mobile: typeof record.mobile === 'boolean' ? record.mobile : base.mobile,
    desktop: typeof record.desktop === 'boolean' ? record.desktop : base.desktop,
  };
}

function sanitizeHeroMotifKind(value: unknown, base: HeroMotifKind): HeroMotifKind {
  return value === 'geometric' || value === 'pattern' || value === 'glow' || value === 'curve'
    ? value
    : base;
}

export function sanitizeHeroMotifCurveAxis(
  value: unknown,
  fallback: HeroMotifCurveAxis = 'diagonal'
): HeroMotifCurveAxis {
  return value === 'vertical' ||
    value === 'horizontal' ||
    value === 'diagonal' ||
    value === 'diagonal-alt'
    ? value
    : fallback;
}

export function sanitizeHeroMotifCurveBend(
  value: unknown,
  fallback = DEFAULT_HERO_CURVE_BEND
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(clamp(n, HERO_CURVE_BEND_MIN, HERO_CURVE_BEND_MAX));
}

export function sanitizeHeroMotifStrokeWidthPx(
  value: unknown,
  fallback = DEFAULT_HERO_CURVE_STROKE_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(clamp(n, HERO_CURVE_STROKE_MIN, HERO_CURVE_STROKE_MAX));
}

/**
 * Quadratic Bezier endpoints + control for a curved stroke in a 0–100 local box.
 * `bend` offsets the mid control along the perpendicular (±% of the short axis).
 */
export function heroMotifCurveControlPoints(
  axis: HeroMotifCurveAxis = 'diagonal',
  bend: number = DEFAULT_HERO_CURVE_BEND
): { start: MotifPoint; control: MotifPoint; end: MotifPoint } {
  const b = sanitizeHeroMotifCurveBend(bend) / 100;
  let start: MotifPoint;
  let end: MotifPoint;
  switch (axis) {
    case 'vertical':
      start = { x: 50, y: 4 };
      end = { x: 50, y: 96 };
      break;
    case 'horizontal':
      start = { x: 4, y: 50 };
      end = { x: 96, y: 50 };
      break;
    case 'diagonal-alt':
      start = { x: 96, y: 4 };
      end = { x: 4, y: 96 };
      break;
    default:
      start = { x: 4, y: 4 };
      end = { x: 96, y: 96 };
      break;
  }
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy) || 1;
  // Unit perpendicular
  const px = -dy / len;
  const py = dx / len;
  // Offset in local % of the 100×100 box. Do NOT clamp to 0–100 — that capped
  // visual bend near |bend|≈100 and made higher slider values look dead.
  // SVG shells use overflow:visible so the stroke can bow outside the motif box.
  const strength = 48; // mid offset at |bend| = 100; scales linearly (500 → ~240)
  return {
    start,
    end,
    control: {
      x: midX + px * b * strength,
      y: midY + py * b * strength,
    },
  };
}

/** SVG path `d` for the curved stroke (viewBox 0 0 100 100). */
export function heroMotifCurvePathD(
  axis: HeroMotifCurveAxis = 'diagonal',
  bend: number = DEFAULT_HERO_CURVE_BEND
): string {
  const { start, control, end } = heroMotifCurveControlPoints(axis, bend);
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
}

/** Effective paint order among motifs only — glow/curve never rise above page content (z ≥ 1). */
export function heroMotifEffectiveZIndex(motif: HeroMotifInstance): number {
  if (motif.kind === 'curve') {
    // underGlow: under glow blobs (−1) vs above glow blobs (0). Always behind content.
    return motif.underGlow === false ? 0 : -1;
  }
  if (motif.kind === 'glow') {
    return 0;
  }
  return Math.min(motif.zIndex, 0);
}

function sanitizeHeroMotifShape(value: unknown, base: HeroMotifShape): HeroMotifShape {
  return value === 'diagonal' ||
    value === 'triangle' ||
    value === 'trapezoid' ||
    value === 'block' ||
    value === 'chevron' ||
    value === 'prism' ||
    value === 'custom'
    ? value
    : base;
}

function sanitizeHeroMotifPrimitive(value: unknown, base: HeroMotifPrimitive): HeroMotifPrimitive {
  return value === 'free' || value === 'circle' || value === 'oval' || value === 'halfCircle' ? value : base;
}

/** Normalize degrees into [0, 360). */
export function sanitizeMotifRotationDeg(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return ((fallback % 360) + 360) % 360;
  return ((n % 360) + 360) % 360;
}

export function isLockedMotifPrimitive(
  primitive: HeroMotifPrimitive | undefined
): primitive is Exclude<HeroMotifPrimitive, 'free'> {
  return primitive === 'circle' || primitive === 'oval' || primitive === 'halfCircle';
}

/** Circle + half-circle must stay round in pixels (not stretched by a landscape hero). */
export function isCircularMotifPrimitive(
  primitive: HeroMotifPrimitive | undefined
): primitive is 'circle' | 'halfCircle' {
  return primitive === 'circle' || primitive === 'halfCircle';
}

/** Keep stored panel size square for circular primitives (editor + persistence). */
export function forceSquareMotifSize(size: MotifPanelSize): MotifPanelSize {
  const side = Math.min(size.width, size.height);
  return { width: side, height: side };
}

/**
 * Shell sizing for circular primitives: width% + aspect-ratio 1.
 * Equal width%/height% on a landscape hero is still an oval in pixels —
 * only aspect-ratio forces a true circle.
 */
export function circularMotifShellSizeStyle(size: MotifPanelSize): CSSProperties {
  const side = Math.min(size.width, size.height);
  return {
    width: `${side}%`,
    height: 'auto',
    aspectRatio: '1 / 1',
  };
}

/**
 * Geometry-only styles for smooth primitives (no fill).
 * circle → border-radius 50% on a square shell (true circle).
 * oval → border-radius 50% on a free rectangle (true ellipse).
 * halfCircle → circle clipped to a half-disk + CSS rotate.
 */
export function heroMotifPrimitiveMaskStyle(
  primitive: Exclude<HeroMotifPrimitive, 'free'>,
  rotationDeg?: number
): CSSProperties {
  if (primitive === 'halfCircle') {
    const rotation = sanitizeMotifRotationDeg(rotationDeg, 0);
    return {
      borderRadius: '50%',
      clipPath: 'inset(0 0 50% 0)',
      transform: `rotate(${rotation}deg)`,
      transformOrigin: '50% 50%',
    };
  }
  return { borderRadius: '50%' };
}

function sanitizeHeroMotifPattern(
  value: unknown,
  base: Exclude<PortfolioHeroLeftMotifPattern, 'none'>
): Exclude<PortfolioHeroLeftMotifPattern, 'none'> {
  return value === 'dots' ||
    value === 'grid' ||
    value === 'diagonal' ||
    value === 'waves' ||
    value === 'crosshatch' ||
    value === 'circles' ||
    value === 'hexagons' ||
    value === 'custom'
    ? value
    : base;
}

export function sanitizeHeroMotifInstance(
  value: unknown,
  fallback?: HeroMotifInstance
): HeroMotifInstance | null {
  const base = fallback ?? createGeometricMotif();
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const kind = sanitizeHeroMotifKind(record.kind, base.kind);
  const clampSide = heroMotifClampSide(kind);
  const freePlacement = heroMotifAllowsOverflow(kind);
  const rawSize = sanitizeMotifPanelSize(record.size, base.size, clampSide, {
    freePlacement,
  });
  const color =
    typeof record.color === 'string' && isValidProfileHexColor(record.color)
      ? record.color.trim()
      : base.color;
  const opacity = sanitizeMotifOpacity(record.opacity, base.opacity);
  const opacityDark = sanitizeMotifOpacity(
    record.opacityDark !== undefined ? record.opacityDark : base.opacityDark,
    opacity
  );
  const zIndex = typeof record.zIndex === 'number' ? clamp(record.zIndex, 0, 40) : base.zIndex;
  const id = typeof record.id === 'string' && record.id.trim() ? record.id.trim() : base.id;
  const label = typeof record.label === 'string' && record.label.trim() ? record.label.trim() : base.label;

  const shape = sanitizeHeroMotifShape(record.shape, base.shape);
  const rawPoints = sanitizeMotifPoints(
    record.points !== undefined ? record.points : base.points,
    kind === 'pattern' ? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS : DEFAULT_CUSTOM_MOTIF_POINTS
  );
  const primitive = sanitizeHeroMotifPrimitive(
    record.primitive !== undefined
      ? record.primitive
      : kind === 'glow'
        ? 'circle'
        : inferMotifPrimitiveFromPoints(rawPoints) ?? base.primitive ?? 'free',
    kind === 'glow' ? (base.primitive === 'oval' ? 'oval' : 'circle') : base.primitive ?? 'free'
  );
  const lockedPrimitive =
    kind === 'glow'
      ? primitive === 'oval'
        ? 'oval'
        : 'circle'
      : kind === 'curve'
        ? 'free'
        : primitive;
  const size = isCircularMotifPrimitive(lockedPrimitive)
    ? forceSquareMotifSize(rawSize)
    : rawSize;
  const position = sanitizeMotifPanelPosition(record.position, base.position, clampSide, size, {
    allowOverflow: freePlacement,
  });
  const paletteToken = sanitizeHeroMotifPaletteToken(
    record.paletteToken !== undefined ? record.paletteToken : base.paletteToken
  );
  // Geometric motifs on the right must hug the right frame edge (classic slash).
  // Auto-fix inverted left-edge silhouettes left over from layout flips.
  // Locked primitives (circle / oval / half-circle) must keep their parametric points intact.
  const points =
    kind === 'geometric' && lockedPrimitive === 'free'
      ? position.x < 50
        ? ensureLeftColumnMotifPoints(rawPoints)
        : ensureRightColumnMotifPoints(rawPoints)
      : rawPoints;

  return {
    id,
    label,
    enabled: typeof record.enabled === 'boolean' ? record.enabled : base.enabled,
    kind,
    visibility: sanitizeHeroMotifVisibility(record.visibility, base.visibility),
    position,
    size,
    color,
    ...(paletteToken ? { paletteToken } : {}),
    opacity,
    opacityDark,
    zIndex,
    shape: kind === 'glow' || kind === 'curve' ? 'custom' : shape,
    points,
    primitive: lockedPrimitive,
    rotationDeg: sanitizeMotifRotationDeg(record.rotationDeg, base.rotationDeg ?? 0),
    pattern: sanitizeHeroMotifPattern(record.pattern, base.pattern),
    blurPx:
      kind === 'glow'
        ? sanitizeHeroGlowBlurPx(record.blurPx, base.blurPx ?? DEFAULT_HERO_GLOW_BLUR_PX)
        : kind === 'curve'
          ? sanitizeHeroGlowBlurPx(
              // Legacy curves stored blurPx:0 with no strokeGlowStrength — enable a soft halo.
              record.strokeGlowStrength === undefined &&
                !(typeof record.blurPx === 'number' && record.blurPx > 0)
                ? DEFAULT_HERO_CURVE_GLOW_BLUR_PX
                : record.blurPx,
              base.blurPx ?? DEFAULT_HERO_CURVE_GLOW_BLUR_PX
            )
          : sanitizeHeroGlowBlurPx(record.blurPx, 0),
    backdropBlurPx:
      kind === 'glow'
        ? sanitizeHeroGlowBackdropBlurPx(
            record.backdropBlurPx,
            base.backdropBlurPx ?? DEFAULT_HERO_GLOW_BACKDROP_BLUR_PX
          )
        : sanitizeHeroGlowBackdropBlurPx(record.backdropBlurPx, 0),
    ...(kind === 'curve'
      ? {
          curveAxis: sanitizeHeroMotifCurveAxis(record.curveAxis, base.curveAxis ?? 'diagonal'),
          curveBend: sanitizeHeroMotifCurveBend(record.curveBend, base.curveBend),
          strokeWidthPx: sanitizeHeroMotifStrokeWidthPx(
            record.strokeWidthPx,
            base.strokeWidthPx
          ),
          strokeGlowStrength: sanitizeHeroCurveGlowStrength(
            // Pre-glow curves only had underGlow (z-order) — bootstrap a real halo.
            record.strokeGlowStrength === undefined &&
              !(typeof record.blurPx === 'number' && record.blurPx > 0)
              ? DEFAULT_HERO_CURVE_GLOW_STRENGTH
              : record.strokeGlowStrength,
            base.strokeGlowStrength ?? DEFAULT_HERO_CURVE_GLOW_STRENGTH
          ),
          underGlow:
            typeof record.underGlow === 'boolean'
              ? record.underGlow
              : base.underGlow !== false,
        }
      : {}),
    ...((kind === 'glow' || kind === 'curve')
      ? {
          scrollAttach: sanitizeHeroMotifScrollAttach(
            record.scrollAttach,
            base.scrollAttach ?? DEFAULT_HERO_MOTIF_SCROLL_ATTACH
          ),
        }
      : {}),
  };
}

export function sanitizeHeroMotifs(value: unknown, base: HeroMotifInstance[]): HeroMotifInstance[] {
  if (!Array.isArray(value)) return base.map((m) => ({ ...m, points: m.points.map((p) => ({ ...p })) }));
  const next: HeroMotifInstance[] = [];
  for (const item of value) {
    if (next.length >= MAX_HERO_MOTIFS) break;
    const sanitized = sanitizeHeroMotifInstance(item);
    if (sanitized) next.push(sanitized);
  }
  return next.length > 0
    ? next
    : base.map((m) => ({ ...m, points: m.points.map((p) => ({ ...p })) }));
}

/** Build motifs from legacy single right + left fields when `heroMotifs` is absent. */
export function migrateLegacyHeroMotifs(legacy: {
  motifShape: HeroMotifShape;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  heroMotifOpacity?: number;
  leftMotifEnabled: boolean;
  leftMotifPattern: PortfolioHeroLeftMotifPattern;
  leftMotifColor: string;
  leftMotifOpacity: number;
  leftMotifPosition: MotifPanelPosition;
  leftMotifSize: MotifPanelSize;
  leftCustomMotifPoints: MotifPoint[];
}): HeroMotifInstance[] {
  const motifs: HeroMotifInstance[] = [
    createGeometricMotif({
      id: 'legacy-right',
      label: 'Right shape',
      enabled: true,
      visibility: { ...DEFAULT_HERO_MOTIF_VISIBILITY },
      position: legacy.motifPosition,
      size: legacy.motifPanelSize,
      color: legacy.motifColor,
      opacity: typeof legacy.heroMotifOpacity === 'number' ? legacy.heroMotifOpacity : 100,
      shape: legacy.motifShape,
      points: legacy.customMotifPoints.map((p) => ({ ...p })),
      zIndex: 0,
    }),
  ];

  if (legacy.leftMotifEnabled && legacy.leftMotifPattern !== 'none') {
    motifs.push(
      createPatternMotif({
        id: 'legacy-left',
        label: 'Left pattern',
        enabled: true,
        visibility: { ...DEFAULT_HERO_MOTIF_VISIBILITY },
        position: legacy.leftMotifPosition,
        size: legacy.leftMotifSize,
        color: legacy.leftMotifColor,
        opacity: legacy.leftMotifOpacity,
        pattern: legacy.leftMotifPattern as Exclude<PortfolioHeroLeftMotifPattern, 'none'>,
        points: legacy.leftCustomMotifPoints.map((p) => ({ ...p })),
        zIndex: 0,
      })
    );
  }

  return motifs;
}

export function mergeHeroMotifsSettings(
  base: HeroMotifInstance[],
  patch: unknown,
  legacyFallback: Parameters<typeof migrateLegacyHeroMotifs>[0]
): HeroMotifInstance[] {
  if (!patch || typeof patch !== 'object') {
    return base.length > 0 ? base : migrateLegacyHeroMotifs(legacyFallback);
  }
  const record = patch as Record<string, unknown>;
  if (Array.isArray(record.heroMotifs)) {
    const sanitized = sanitizeHeroMotifs(record.heroMotifs, base);
    if (sanitized.length > 0) return sanitized;
  }
  if (base.length > 0) return base;
  return migrateLegacyHeroMotifs(legacyFallback);
}

/** Keep legacy scalar fields in sync so flip / older paths still work. */
export function syncLegacyFieldsFromHeroMotifs(motifs: HeroMotifInstance[]): {
  motifShape: HeroMotifShape;
  motifColor: string;
  customMotifPoints: MotifPoint[];
  motifPosition: MotifPanelPosition;
  motifPanelSize: MotifPanelSize;
  leftMotifEnabled: boolean;
  leftMotifPattern: PortfolioHeroLeftMotifPattern;
  leftMotifColor: string;
  leftMotifOpacity: number;
  leftMotifPosition: MotifPanelPosition;
  leftMotifSize: MotifPanelSize;
  leftCustomMotifPoints: MotifPoint[];
} {
  const geo =
    motifs.find((m) => m.kind === 'geometric' && m.enabled) ??
    motifs.find((m) => m.kind === 'geometric');
  const pat =
    motifs.find((m) => m.kind === 'pattern' && m.enabled) ??
    motifs.find((m) => m.kind === 'pattern');

  return {
    motifShape: geo?.shape ?? 'diagonal',
    motifColor: geo?.color ?? DEFAULT_MOTIF_COLOR,
    customMotifPoints: (geo?.points ?? DEFAULT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
    motifPosition: geo?.position ?? { x: 75, y: 50 },
    motifPanelSize: geo?.size ?? { width: 50, height: 76 },
    leftMotifEnabled: Boolean(pat?.enabled),
    leftMotifPattern: pat?.enabled ? pat.pattern : 'none',
    leftMotifColor: pat?.color ?? DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifColor,
    leftMotifOpacity: pat?.opacity ?? DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifOpacity,
    leftMotifPosition: pat?.position ?? { ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifPosition },
    leftMotifSize: pat?.size ?? { ...DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifSize },
    leftCustomMotifPoints: (pat?.points ?? DEFAULT_LEFT_CUSTOM_MOTIF_POINTS).map((p) => ({ ...p })),
  };
}

export function updateHeroMotifInList(
  motifs: HeroMotifInstance[],
  id: string,
  patch: Partial<HeroMotifInstance>
): HeroMotifInstance[] {
  return motifs.map((motif) => {
    if (motif.id !== id) return motif;
    const kind = patch.kind ?? motif.kind;
    const clampSide = heroMotifClampSide(kind);
    const freePlacement = heroMotifAllowsOverflow(kind);
    const primitive =
      patch.primitive !== undefined
        ? sanitizeHeroMotifPrimitive(patch.primitive, motif.primitive ?? 'free')
        : motif.primitive;
    const lockedPrimitive =
      kind === 'glow'
        ? primitive === 'oval'
          ? 'oval'
          : 'circle'
        : kind === 'curve'
          ? 'free'
          : primitive;
    const rawSize = patch.size
      ? clampMotifPanelSize(patch.size, clampSide, { freePlacement })
      : motif.size;
    const size = isCircularMotifPrimitive(lockedPrimitive)
      ? forceSquareMotifSize(rawSize)
      : rawSize;
    const position = patch.position
      ? clampMotifPanelPosition(patch.position, clampSide, size, {
          allowOverflow: freePlacement,
        })
      : freePlacement
        ? clampMotifPanelPosition(motif.position, clampSide, size, { allowOverflow: true })
        : motif.position;

    const next: HeroMotifInstance = {
      ...motif,
      ...patch,
      kind,
      size,
      position,
      visibility: patch.visibility
        ? sanitizeHeroMotifVisibility(patch.visibility, motif.visibility)
        : motif.visibility,
      opacity:
        typeof patch.opacity === 'number' ? clamp(patch.opacity, 0, 100) : motif.opacity,
      opacityDark:
        typeof patch.opacityDark === 'number'
          ? clamp(patch.opacityDark, 0, 100)
          : motif.opacityDark,
      points: patch.points ? patch.points.map((p) => ({ ...p })) : motif.points,
      primitive: lockedPrimitive,
      rotationDeg:
        patch.rotationDeg !== undefined
          ? sanitizeMotifRotationDeg(patch.rotationDeg, motif.rotationDeg ?? 0)
          : motif.rotationDeg,
      blurPx:
        patch.blurPx !== undefined
          ? sanitizeHeroGlowBlurPx(patch.blurPx, motif.blurPx ?? 0)
          : motif.blurPx,
      backdropBlurPx:
        patch.backdropBlurPx !== undefined
          ? sanitizeHeroGlowBackdropBlurPx(patch.backdropBlurPx, motif.backdropBlurPx ?? 0)
          : motif.backdropBlurPx,
    };

    if (kind === 'curve' || motif.kind === 'curve' || patch.kind === 'curve') {
      if (patch.curveAxis !== undefined || kind === 'curve') {
        next.curveAxis = sanitizeHeroMotifCurveAxis(
          patch.curveAxis !== undefined ? patch.curveAxis : motif.curveAxis,
          'diagonal'
        );
      }
      if (patch.curveBend !== undefined || kind === 'curve') {
        next.curveBend = sanitizeHeroMotifCurveBend(
          patch.curveBend !== undefined ? patch.curveBend : motif.curveBend
        );
      }
      if (patch.strokeWidthPx !== undefined || kind === 'curve') {
        next.strokeWidthPx = sanitizeHeroMotifStrokeWidthPx(
          patch.strokeWidthPx !== undefined ? patch.strokeWidthPx : motif.strokeWidthPx
        );
      }
      if (patch.strokeGlowStrength !== undefined || kind === 'curve') {
        next.strokeGlowStrength = sanitizeHeroCurveGlowStrength(
          patch.strokeGlowStrength !== undefined
            ? patch.strokeGlowStrength
            : motif.strokeGlowStrength
        );
      }
      if (patch.underGlow !== undefined) {
        next.underGlow = patch.underGlow;
      } else if (kind === 'curve' && next.underGlow === undefined) {
        next.underGlow = motif.underGlow !== false;
      }
    }

    if (kind === 'glow' || kind === 'curve') {
      if (patch.scrollAttach !== undefined) {
        next.scrollAttach = sanitizeHeroMotifScrollAttach(patch.scrollAttach);
      } else if (next.scrollAttach === undefined) {
        next.scrollAttach = sanitizeHeroMotifScrollAttach(
          motif.scrollAttach,
          DEFAULT_HERO_MOTIF_SCROLL_ATTACH
        );
      }
    } else {
      delete next.scrollAttach;
    }

    if (patch.paletteToken !== undefined) {
      const nextToken = sanitizeHeroMotifPaletteToken(patch.paletteToken);
      if (nextToken) {
        next.paletteToken = nextToken;
      } else {
        delete next.paletteToken;
      }
    }

    return next;
  });
}

export function heroMotifShellStyle(
  motif: HeroMotifInstance,
  fadeOpacity = 1,
  colorMode: 'light' | 'dark' = 'dark'
): CSSProperties {
  const clampSide = heroMotifClampSide(motif.kind);
  const freePlacement = heroMotifAllowsOverflow(motif.kind);
  const rawSize = clampMotifPanelSize(motif.size, clampSide, { freePlacement });
  const size = isCircularMotifPrimitive(motif.primitive)
    ? forceSquareMotifSize(rawSize)
    : rawSize;
  const position = clampMotifPanelPosition(motif.position, clampSide, size, {
    allowOverflow: freePlacement,
  });
  const opacity = (resolveHeroMotifOpacity(motif, colorMode) / 100) * fadeOpacity;
  // Soft-glow blobs need extra shell padding so CSS blur isn't clipped.
  // Curves use an SVG filter with an expanded region — do NOT pad the shell
  // (padding + absolute inset-0 was shifting the stroke relative to the panel).
  const blurPx =
    motif.kind === 'glow' ? sanitizeHeroGlowBlurPx(motif.blurPx, DEFAULT_HERO_GLOW_BLUR_PX) : 0;
  const blurPad = blurPx > 0 ? Math.ceil(blurPx * 1.35) : 0;

  // Free placement relative to the hero section (works on mobile + desktop).
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
    ...(isCircularMotifPrimitive(motif.primitive)
      ? circularMotifShellSizeStyle(size)
      : {
          width: `${size.width}%`,
          height: `${size.height}%`,
        }),
    transform: 'translate(-50%, -50%)',
    zIndex: motif.zIndex,
    ...(blurPad > 0
      ? {
          padding: blurPad,
          margin: -blurPad,
          boxSizing: 'content-box' as const,
          overflow: 'visible' as const,
        }
      : {}),
    ...(opacity >= 1 ? {} : { opacity, willChange: 'opacity' as const }),
  };
}

export function heroMotifInnerStyle(
  motif: HeroMotifInstance,
  background?: PortfolioHeroBackgroundSettings,
  /** Copy/visual column edge — aligns repeating pattern tiles flush to Contact. */
  frameEdge: 'left' | 'right' = 'left'
): CSSProperties {
  if (motif.kind === 'pattern') {
    const asLeft: PortfolioHeroLeftMotifSettings = {
      leftMotifEnabled: true,
      leftMotifPattern: motif.pattern,
      leftMotifColor: motif.color,
      leftMotifOpacity: 100,
      leftMotifPosition: motif.position,
      leftMotifSize: motif.size,
      leftCustomMotifPoints: motif.points,
    };
    return leftMotifInnerStyle(asLeft, frameEdge);
  }

  if (motif.kind === 'glow') {
    const blurPx = sanitizeHeroGlowBlurPx(motif.blurPx, DEFAULT_HERO_GLOW_BLUR_PX);
    const backdropBlurPx = sanitizeHeroGlowBackdropBlurPx(
      motif.backdropBlurPx,
      DEFAULT_HERO_GLOW_BACKDROP_BLUR_PX
    );
    const hex = isValidProfileHexColor(motif.color) ? motif.color.trim() : DEFAULT_HERO_GLOW_COLOR;
    const primitive = motif.primitive === 'oval' ? 'oval' : 'circle';
    // Dense core + soft feather. Extreme filter-only washes disappear on light Fond.
    const feather = Math.min(blurPx, 64);
    return {
      borderRadius: '50%',
      background: `radial-gradient(circle at 50% 50%, ${hex}f2 0%, ${hex}cc 32%, ${hex}66 58%, transparent 72%)`,
      boxShadow: `0 0 ${Math.max(24, Math.round(feather * 0.9))}px ${Math.max(8, Math.round(feather * 0.35))}px ${hex}55`,
      ...(feather > 0 ? { filter: `blur(${Math.max(8, Math.round(feather * 0.55))}px)` } : {}),
      ...(backdropBlurPx > 0
        ? {
            backdropFilter: `blur(${backdropBlurPx}px)`,
            WebkitBackdropFilter: `blur(${backdropBlurPx}px)`,
          }
        : {}),
      ...heroMotifPrimitiveMaskStyle(primitive, motif.rotationDeg),
    };
  }

  // Curve strokes are painted as SVG in MotifsLayer — no CSS fill here.
  if (motif.kind === 'curve') {
    return { background: 'transparent' };
  }

  const fill = background
    ? heroMotifPanelFillStyle(background, motif.color)
    : { backgroundColor: motif.color };

  // Smooth primitives — true CSS circle / ellipse / half-disk (no polygon points).
  if (isLockedMotifPrimitive(motif.primitive)) {
    return {
      ...fill,
      ...heroMotifPrimitiveMaskStyle(motif.primitive, motif.rotationDeg),
    };
  }

  const rawPoints =
    motif.shape === 'custom'
      ? motif.points
      : getRightMotifPresetPoints(motif.shape as RightMotifPresetShape);
  const points =
    motif.position.x < 50
      ? ensureLeftColumnMotifPoints(rawPoints)
      : ensureRightColumnMotifPoints(rawPoints);

  return {
    clipPath: motifPointsToClipPath(points),
    ...fill,
  };
}

/** Prefer free % placement; keep content-frame helper available for overlays. */
export function heroMotifContentFrameStyle(
  motif: HeroMotifInstance,
  fadeOpacity = 1,
  edge: 'left' | 'right' = 'right',
  colorMode: 'light' | 'dark' = 'dark'
): CSSProperties {
  const rawSize = clampMotifPanelSize(motif.size, heroMotifClampSide(motif.kind));
  const size = isCircularMotifPrimitive(motif.primitive)
    ? forceSquareMotifSize(rawSize)
    : rawSize;
  const position = normalizeMotifPositionForContentFrame(motif.position, size, edge);
  // Same as heroMotifShellStyle: the per-motif opacity slider multiplies the scroll fade.
  const opacity = (resolveHeroMotifOpacity(motif, colorMode) / 100) * fadeOpacity;
  const blurPx =
    motif.kind === 'glow' ? sanitizeHeroGlowBlurPx(motif.blurPx, DEFAULT_HERO_GLOW_BLUR_PX) : 0;
  const blurPad = blurPx > 0 ? Math.ceil(blurPx * 1.35) : 0;

  const base = motifPanelContainerStyle(position, size, opacity, '%');
  const withCircle = isCircularMotifPrimitive(motif.primitive)
    ? {
        ...base,
        ...circularMotifShellSizeStyle(size),
      }
    : base;

  if (blurPad <= 0) return withCircle;
  return {
    ...withCircle,
    padding: blurPad,
    margin: -blurPad,
    boxSizing: 'content-box' as const,
    overflow: 'visible' as const,
  };
}
