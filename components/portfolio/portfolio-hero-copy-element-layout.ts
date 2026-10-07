export type HeroCopyElementId =
  | 'availability'
  | 'headline'
  | 'description'
  | 'tools'
  | 'cta';

/**
 * Where a copy element renders in a vertical division:
 * - in-copy: normal text column
 * - above-stats / below-stats: glued to the stats chips (same cell)
 * - free-zone: moved into the *other* frame (visual part), anchored by the
 *   3×3 "free zone" cell — lets copy elements fill empty visual space.
 */
type HeroCopyStatsSide = 'in-copy' | 'above-stats' | 'below-stats' | 'free-zone';

export type HeroCopyElementLayout = {
  statsSide: HeroCopyStatsSide;
  marginTopPx: number;
  marginBottomPx: number;
  backgroundEnabled: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundPaddingPx: number;
  backgroundRadiusPx: number;
  /**
   * columns-3 (xl+): vertical band inside the assigned column — top / center / bottom.
   * Ignored on other divisions and below xl (elements stack in top→center→bottom order).
   */
  desktopVerticalAlign: 'top' | 'center' | 'bottom';
};

export type HeroCopyElementsLayout = Record<HeroCopyElementId, HeroCopyElementLayout>;

const HERO_COPY_ELEMENT_MARGIN_PX_MIN = 0;
const HERO_COPY_ELEMENT_MARGIN_PX_MAX = 96;
const HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN = 0;
const HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX = 100;
const HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN = 0;
const HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX = 64;
const HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN = 0;
/** 999 ≈ full pill (stadium) for tools / compact bars. */
const HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX = 999;

const DEFAULT_LAYOUT: HeroCopyElementLayout = {
  statsSide: 'in-copy',
  marginTopPx: 0,
  marginBottomPx: 0,
  backgroundEnabled: false,
  backgroundColor: '#ffffff',
  backgroundOpacity: 100,
  backgroundPaddingPx: 12,
  backgroundRadiusPx: 12,
  desktopVerticalAlign: 'top',
};

export const DEFAULT_HERO_COPY_ELEMENTS_LAYOUT: HeroCopyElementsLayout = {
  availability: { ...DEFAULT_LAYOUT },
  headline: { ...DEFAULT_LAYOUT },
  description: { ...DEFAULT_LAYOUT },
  /** Tools bar defaults to a compact pill (hugs icons, full round ends). */
  tools: { ...DEFAULT_LAYOUT, backgroundRadiusPx: 999, backgroundPaddingPx: 14 },
  cta: { ...DEFAULT_LAYOUT },
};

function sanitizeHeroCopyElementMarginPx(
  value: unknown,
  fallback: number = 0
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_COPY_ELEMENT_MARGIN_PX_MAX,
    Math.max(HERO_COPY_ELEMENT_MARGIN_PX_MIN, Math.round(n))
  );
}

function sanitizeHeroCopyStatsSide(
  value: unknown,
  fallback: HeroCopyStatsSide = 'in-copy'
): HeroCopyStatsSide {
  if (
    value === 'in-copy' ||
    value === 'above-stats' ||
    value === 'below-stats' ||
    value === 'free-zone'
  ) {
    return value;
  }
  return fallback;
}

function sanitizeHeroCopyDesktopVerticalAlign(
  value: unknown,
  fallback: 'top' | 'center' | 'bottom' = 'top'
): 'top' | 'center' | 'bottom' {
  if (value === 'top' || value === 'center' || value === 'bottom') return value;
  return fallback;
}

function sanitizeElementLayout(
  value: unknown,
  fallback: HeroCopyElementLayout
): HeroCopyElementLayout {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    statsSide: sanitizeHeroCopyStatsSide(record.statsSide, fallback.statsSide),
    marginTopPx: sanitizeHeroCopyElementMarginPx(record.marginTopPx, fallback.marginTopPx),
    marginBottomPx: sanitizeHeroCopyElementMarginPx(
      record.marginBottomPx,
      fallback.marginBottomPx
    ),
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean'
        ? record.backgroundEnabled
        : fallback.backgroundEnabled,
    backgroundColor:
      typeof record.backgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(record.backgroundColor)
        ? record.backgroundColor
        : fallback.backgroundColor,
    backgroundOpacity: sanitizeRange(
      record.backgroundOpacity,
      HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN,
      HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX,
      fallback.backgroundOpacity
    ),
    backgroundPaddingPx: sanitizeRange(
      record.backgroundPaddingPx,
      HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN,
      HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX,
      fallback.backgroundPaddingPx
    ),
    backgroundRadiusPx: sanitizeRange(
      record.backgroundRadiusPx,
      HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN,
      HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX,
      fallback.backgroundRadiusPx
    ),
    desktopVerticalAlign: sanitizeHeroCopyDesktopVerticalAlign(
      record.desktopVerticalAlign,
      fallback.desktopVerticalAlign
    ),
  };
}

function sanitizeRange(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizeHeroCopyElementsLayout(
  value: unknown,
  fallback: HeroCopyElementsLayout = DEFAULT_HERO_COPY_ELEMENTS_LAYOUT
): HeroCopyElementsLayout {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    availability: sanitizeElementLayout(record.availability, fallback.availability),
    headline: sanitizeElementLayout(record.headline, fallback.headline),
    description: sanitizeElementLayout(record.description, fallback.description),
    tools: sanitizeElementLayout(record.tools, fallback.tools),
    cta: sanitizeElementLayout(record.cta, fallback.cta),
  };
}
