/**
 * Per-element vertical layout for hero copy units:
 * - margins (top / bottom px)
 * - stats side (stay in copy stack, or sit above / below the stats chips)
 */

import type { CSSProperties } from 'react';

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
export type HeroCopyStatsSide = 'in-copy' | 'above-stats' | 'below-stats' | 'free-zone';

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

export const HERO_COPY_ELEMENT_MARGIN_PX_MIN = 0;
export const HERO_COPY_ELEMENT_MARGIN_PX_MAX = 96;
export const HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MIN = 0;
export const HERO_COPY_ELEMENT_BACKGROUND_OPACITY_MAX = 100;
export const HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MIN = 0;
export const HERO_COPY_ELEMENT_BACKGROUND_PADDING_PX_MAX = 64;
export const HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MIN = 0;
/** 999 ≈ full pill (stadium) for tools / compact bars. */
export const HERO_COPY_ELEMENT_BACKGROUND_RADIUS_PX_MAX = 999;

export const PORTFOLIO_HERO_COPY_STATS_SIDE_OPTIONS: {
  value: HeroCopyStatsSide;
  label: string;
  description: string;
}[] = [
  {
    value: 'in-copy',
    label: 'In copy stack',
    description: 'Normal position in the text / tools column.',
  },
  {
    value: 'above-stats',
    label: 'Above stats',
    description: 'Directly above the stats chips (same cell).',
  },
  {
    value: 'below-stats',
    label: 'Below stats',
    description: 'Directly under the stats chips (same cell).',
  },
  {
    value: 'free-zone',
    label: 'Free zone (other part)',
    description: 'Moves into the empty area of the visual part — position it with the "Free zone position" 3×3 picker (Section › General).',
  },
];

/** columns-3: same values, clearer labels (free-zone = portrait column). */
export const PORTFOLIO_HERO_COPY_COLUMNS_3_SIDE_OPTIONS: {
  value: HeroCopyStatsSide;
  label: string;
  description: string;
}[] = [
  {
    value: 'in-copy',
    label: 'Copy column',
    description: 'Stays in the Copy column.',
  },
  {
    value: 'free-zone',
    label: 'Portrait column',
    description: 'Moves into the Portrait column (above / with the photo).',
  },
  {
    value: 'above-stats',
    label: 'Stats column — above',
    description: 'In the Stats column, above the chips.',
  },
  {
    value: 'below-stats',
    label: 'Stats column — below',
    description: 'In the Stats column, under the chips.',
  },
];

export const PORTFOLIO_HERO_COPY_DESKTOP_VERTICAL_OPTIONS: {
  value: 'top' | 'center' | 'bottom';
  label: string;
  description: string;
}[] = [
  { value: 'top', label: 'Top', description: 'Pin content to the top of the column.' },
  { value: 'center', label: 'Center', description: 'Vertically center content in the column.' },
  { value: 'bottom', label: 'Bottom', description: 'Pin content to the bottom of the column.' },
];

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

export function sanitizeHeroCopyElementMarginPx(
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

export function sanitizeHeroCopyStatsSide(
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

export function resolveHeroCopyElementsLayout(presentation: {
  heroCopyElementsLayout?: HeroCopyElementsLayout;
  availabilityMarginTopPx?: number;
  availabilityMarginBottomPx?: number;
  ctaPlacement?: string;
}): HeroCopyElementsLayout {
  const base = sanitizeHeroCopyElementsLayout(presentation.heroCopyElementsLayout);

  const availability: HeroCopyElementLayout = {
    ...base.availability,
    marginTopPx: sanitizeHeroCopyElementMarginPx(
      presentation.heroCopyElementsLayout?.availability?.marginTopPx ??
        presentation.availabilityMarginTopPx,
      base.availability.marginTopPx
    ),
    marginBottomPx: sanitizeHeroCopyElementMarginPx(
      presentation.heroCopyElementsLayout?.availability?.marginBottomPx ??
        presentation.availabilityMarginBottomPx,
      base.availability.marginBottomPx
    ),
  };

  let cta = base.cta;
  if (presentation.ctaPlacement === 'above-stats') {
    cta = { ...cta, statsSide: 'above-stats' };
  } else if (presentation.ctaPlacement === 'below-stats') {
    cta = { ...cta, statsSide: 'below-stats' };
  } else if (presentation.ctaPlacement === 'free-zone') {
    cta = { ...cta, statsSide: 'free-zone' };
  } else if (
    presentation.ctaPlacement === 'below-tools' ||
    presentation.ctaPlacement === 'below-pitch' ||
    presentation.ctaPlacement === 'after-headline' ||
    presentation.ctaPlacement === 'with-tools'
  ) {
    cta = { ...cta, statsSide: 'in-copy' };
  }

  return {
    ...base,
    availability,
    cta,
  };
}

export function heroCopyElementMarginStyle(layout: HeroCopyElementLayout): CSSProperties {
  const style: CSSProperties = {};
  if (layout.marginTopPx > 0) style.marginTop = layout.marginTopPx;
  if (layout.marginBottomPx > 0) style.marginBottom = layout.marginBottomPx;
  return style;
}

/** Background surface owned by one copy element; opacity never fades its content. */
export function heroCopyElementSurfaceStyle(
  layout: HeroCopyElementLayout,
  /** When set (palette mode), replaces the stored hex so the bar follows Neutre / Fond. */
  paletteBackgroundColor?: string
): CSSProperties {
  const style = heroCopyElementMarginStyle(layout);
  if (!layout.backgroundEnabled) return style;

  const raw =
    typeof paletteBackgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(paletteBackgroundColor)
      ? paletteBackgroundColor
      : layout.backgroundColor;
  const hex = raw.slice(1);
  const alpha = Math.round((layout.backgroundOpacity / 100) * 255)
    .toString(16)
    .padStart(2, '0');
  return {
    ...style,
    backgroundColor: `#${hex}${alpha}`,
    padding: layout.backgroundPaddingPx,
    borderRadius: layout.backgroundRadiusPx,
    overflow: 'hidden',
  };
}

/** Paint only (no outer margins) — for a tools pill that sits under a separate label. */
export function heroCopyElementSurfacePaintStyle(
  layout: HeroCopyElementLayout,
  paletteBackgroundColor?: string
): CSSProperties {
  const full = heroCopyElementSurfaceStyle(layout, paletteBackgroundColor);
  const { marginTop: _mt, marginBottom: _mb, ...paint } = full;
  return paint;
}

export function patchHeroCopyElementLayout(
  current: HeroCopyElementsLayout | undefined,
  id: HeroCopyElementId,
  patch: Partial<HeroCopyElementLayout>
): HeroCopyElementsLayout {
  const base = sanitizeHeroCopyElementsLayout(current);
  return {
    ...base,
    [id]: sanitizeElementLayout({ ...base[id], ...patch }, base[id]),
  };
}

/**
 * Leaving columns-3: put every copy unit back in the copy stack.
 * Column routing (stats / portrait) must not leak into horizontal or vertical layouts.
 */
export function resetHeroCopyElementsAfterColumns3(
  layout: HeroCopyElementsLayout | undefined
): HeroCopyElementsLayout {
  const base = sanitizeHeroCopyElementsLayout(layout);
  const resetOne = (element: HeroCopyElementLayout): HeroCopyElementLayout => ({
    ...element,
    statsSide: 'in-copy',
    desktopVerticalAlign: 'top',
  });
  return {
    availability: resetOne(base.availability),
    headline: resetOne(base.headline),
    description: resetOne(base.description),
    tools: resetOne(base.tools),
    cta: resetOne(base.cta),
  };
}
