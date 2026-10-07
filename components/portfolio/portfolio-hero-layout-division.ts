import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';

/**
 * Screen division for hero groups:
 * - Copy group: headline, description, tools, CTA, availability
 * - Visual group: portrait, motif, stats
 * - columns-3: Copy | Portrait | Stats as three peer columns (xl+)
 *
 * Matches L|R, R|L, top/bottom, bottom/top, and three-column.
 */
export type HeroLayoutDivision =
  | 'horizontal-copy-left'
  | 'horizontal-copy-right'
  | 'vertical-copy-top'
  | 'vertical-copy-bottom'
  | 'columns-3';

export const DEFAULT_HERO_LAYOUT_DIVISION: HeroLayoutDivision = 'horizontal-copy-left';

/** Pixel gap between frames in vertical / columns-3 screen division. */
export const DEFAULT_HERO_VERTICAL_FRAME_GAP_PX = 16;
const HERO_VERTICAL_FRAME_GAP_PX_MIN = 0;
const HERO_VERTICAL_FRAME_GAP_PX_MAX = 120;

export function sanitizeHeroVerticalFrameGapPx(
  value: unknown,
  fallback: number = DEFAULT_HERO_VERTICAL_FRAME_GAP_PX
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_VERTICAL_FRAME_GAP_PX_MAX,
    Math.max(HERO_VERTICAL_FRAME_GAP_PX_MIN, Math.round(n))
  );
}

/** Peer columns in the columns-3 screen division. */
export type HeroColumns3Slot = 'copy' | 'portrait' | 'stats';

export const DEFAULT_HERO_COLUMNS_3_ORDER: HeroColumns3Slot[] = [
  'copy',
  'portrait',
  'stats',
];

export function sanitizeHeroColumns3Order(
  value: unknown,
  fallback: HeroColumns3Slot[] = DEFAULT_HERO_COLUMNS_3_ORDER
): HeroColumns3Slot[] {
  const allowed = new Set<HeroColumns3Slot>(['copy', 'portrait', 'stats']);
  if (!Array.isArray(value)) return [...fallback];
  const seen = new Set<HeroColumns3Slot>();
  const next: HeroColumns3Slot[] = [];
  for (const item of value) {
    if (item === 'copy' || item === 'portrait' || item === 'stats') {
      if (!seen.has(item) && allowed.has(item)) {
        seen.add(item);
        next.push(item);
      }
    }
  }
  for (const slot of DEFAULT_HERO_COLUMNS_3_ORDER) {
    if (!seen.has(slot)) next.push(slot);
  }
  return next;
}

/**
 * Relative width of the middle column (index 1) vs the side columns (1fr each).
 * Stored as tenths (10 = 1fr, 16 = 1.6fr, 30 = 3fr).
 */
export const DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT = 16;
const HERO_COLUMNS_3_MIDDLE_WEIGHT_MIN = 10;
const HERO_COLUMNS_3_MIDDLE_WEIGHT_MAX = 30;

export function sanitizeHeroColumns3MiddleWeight(
  value: unknown,
  fallback: number = DEFAULT_HERO_COLUMNS_3_MIDDLE_WEIGHT
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(
    HERO_COLUMNS_3_MIDDLE_WEIGHT_MAX,
    Math.max(HERO_COLUMNS_3_MIDDLE_WEIGHT_MIN, Math.round(n))
  );
}

export type HeroColumns3VerticalAlign = 'top' | 'center' | 'bottom';

export const DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL: Record<
  HeroColumns3Slot,
  HeroColumns3VerticalAlign
> = {
  copy: 'top',
  portrait: 'top',
  stats: 'top',
};

function sanitizeHeroColumns3VerticalAlign(
  value: unknown,
  fallback: HeroColumns3VerticalAlign = 'top'
): HeroColumns3VerticalAlign {
  if (value === 'top' || value === 'center' || value === 'bottom') return value;
  return fallback;
}

export function sanitizeHeroColumns3SlotVertical(
  value: unknown,
  fallback: Record<HeroColumns3Slot, HeroColumns3VerticalAlign> = DEFAULT_HERO_COLUMNS_3_SLOT_VERTICAL
): Record<HeroColumns3Slot, HeroColumns3VerticalAlign> {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    copy: sanitizeHeroColumns3VerticalAlign(record.copy, fallback.copy),
    portrait: sanitizeHeroColumns3VerticalAlign(record.portrait, fallback.portrait),
    stats: sanitizeHeroColumns3VerticalAlign(record.stats, fallback.stats),
  };
}

function heroLayoutDivisionFromFlipped(flipped: boolean): HeroLayoutDivision {
  return flipped ? 'horizontal-copy-right' : 'horizontal-copy-left';
}

export function resolveHeroLayoutDivision(
  presentation: Pick<PortfolioHeroSectionSettings, 'heroLayoutDivision' | 'heroLayoutFlipped'>
): HeroLayoutDivision {
  if (
    presentation.heroLayoutDivision === 'horizontal-copy-left' ||
    presentation.heroLayoutDivision === 'horizontal-copy-right' ||
    presentation.heroLayoutDivision === 'vertical-copy-top' ||
    presentation.heroLayoutDivision === 'vertical-copy-bottom' ||
    presentation.heroLayoutDivision === 'columns-3'
  ) {
    return presentation.heroLayoutDivision;
  }
  return heroLayoutDivisionFromFlipped(Boolean(presentation.heroLayoutFlipped));
}

export function sanitizeHeroLayoutDivision(
  value: unknown,
  fallback: HeroLayoutDivision = DEFAULT_HERO_LAYOUT_DIVISION
): HeroLayoutDivision {
  if (
    value === 'horizontal-copy-left' ||
    value === 'horizontal-copy-right' ||
    value === 'vertical-copy-top' ||
    value === 'vertical-copy-bottom' ||
    value === 'columns-3'
  ) {
    return value;
  }
  return fallback;
}
