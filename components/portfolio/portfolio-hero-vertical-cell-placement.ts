/**
 * 3×3 cell anchors for portrait / stats in vertical screen division.
 * More reliable than free-drag for top/bottom layouts.
 *
 * Important: left/center/right and top/middle/bottom are relative to the
 * *visual half* of the hero (not the full viewport). The absolute layers must
 * be clipped/positioned to that band so Y anchors actually move.
 */

import type { CSSProperties } from 'react';

export type HeroVerticalCellPlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Which half of the hero holds portrait + stats for a vertical division. */
export type HeroVerticalVisualBand = 'top' | 'bottom';

export const DEFAULT_PORTRAIT_VERTICAL_CELL: HeroVerticalCellPlacement = 'top-left';
export const DEFAULT_META_VERTICAL_CELL: HeroVerticalCellPlacement = 'top-right';

export const HERO_VERTICAL_CELL_PLACEMENT_OPTIONS: {
  value: HeroVerticalCellPlacement;
  label: string;
  row: 'top' | 'center' | 'bottom';
  col: 'left' | 'center' | 'right';
}[] = [
  { value: 'top-left', label: 'Top left', row: 'top', col: 'left' },
  { value: 'top-center', label: 'Top center', row: 'top', col: 'center' },
  { value: 'top-right', label: 'Top right', row: 'top', col: 'right' },
  { value: 'center-left', label: 'Center left', row: 'center', col: 'left' },
  { value: 'center', label: 'Center', row: 'center', col: 'center' },
  { value: 'center-right', label: 'Center right', row: 'center', col: 'right' },
  { value: 'bottom-left', label: 'Bottom left', row: 'bottom', col: 'left' },
  { value: 'bottom-center', label: 'Bottom center', row: 'bottom', col: 'center' },
  { value: 'bottom-right', label: 'Bottom right', row: 'bottom', col: 'right' },
];

const X_FOR_COL: Record<'left' | 'center' | 'right', number> = {
  left: 18,
  center: 50,
  right: 82,
};

/**
 * Local Y inside the visual frame (0–100).
 * Top sits flush under the division line — not mid-cell — to avoid empty waste.
 */
const Y_FOR_ROW: Record<'top' | 'center' | 'bottom', number> = {
  top: 4,
  center: 50,
  bottom: 96,
};

function cellOption(placement: HeroVerticalCellPlacement) {
  return (
    HERO_VERTICAL_CELL_PLACEMENT_OPTIONS.find((item) => item.value === placement) ??
    HERO_VERTICAL_CELL_PLACEMENT_OPTIONS[0]
  );
}

/** Horizontal column of a cell — used to align stats-adjacent copy with the stats. */
export function heroVerticalCellColumn(
  placement: HeroVerticalCellPlacement
): 'left' | 'center' | 'right' {
  return cellOption(placement).col;
}

/** Vertical row of a cell. */
export function heroVerticalCellRow(
  placement: HeroVerticalCellPlacement
): 'top' | 'center' | 'bottom' {
  return cellOption(placement).row;
}

/** Flex items-* for a cell row inside a visual half. */
export function heroVerticalCellRowAlignClass(placement: HeroVerticalCellPlacement): string {
  const row = cellOption(placement).row;
  if (row === 'top') return 'justify-start';
  if (row === 'bottom') return 'justify-end';
  return 'justify-center';
}

/**
 * Which half (1 = left, 2 = right) of a 50/50 visual split a cell belongs to.
 * Center maps to the opposite of a sibling when possible; otherwise left.
 */
export function heroVerticalCellHalf(
  placement: HeroVerticalCellPlacement,
  sibling?: HeroVerticalCellPlacement
): 1 | 2 {
  const col = cellOption(placement).col;
  if (col === 'left') return 1;
  if (col === 'right') return 2;
  if (sibling) {
    const siblingCol = cellOption(sibling).col;
    if (siblingCol === 'left') return 2;
    if (siblingCol === 'right') return 1;
  }
  return 1;
}

/** Anchor transform so top cells hug the frame top, bottom cells hug the frame bottom. */
export function heroVerticalCellTransform(placement: HeroVerticalCellPlacement): string {
  const row = cellOption(placement).row;
  if (row === 'top') return 'translate(-50%, 0%)';
  if (row === 'bottom') return 'translate(-50%, -100%)';
  return 'translate(-50%, -50%)';
}

export function sanitizeHeroVerticalCellPlacement(
  value: unknown,
  fallback: HeroVerticalCellPlacement
): HeroVerticalCellPlacement {
  if (
    value === 'top-left' ||
    value === 'top-center' ||
    value === 'top-right' ||
    value === 'center-left' ||
    value === 'center' ||
    value === 'center-right' ||
    value === 'bottom-left' ||
    value === 'bottom-center' ||
    value === 'bottom-right'
  ) {
    return value;
  }
  return fallback;
}

/** Map a cell anchor to % coords inside the visual square (layer band). */
export function heroVerticalCellToPosition(placement: HeroVerticalCellPlacement): {
  x: number;
  y: number;
} {
  const option = cellOption(placement);
  return {
    x: X_FOR_COL[option.col],
    y: Y_FOR_ROW[option.row],
  };
}

/**
 * Resolve which half is the visual square.
 * - vertical-copy-top → copy above, visual below
 * - vertical-copy-bottom → visual above, copy below
 */
export function resolveHeroVerticalVisualBand(
  division: string
): HeroVerticalVisualBand | null {
  if (division === 'vertical-copy-top') return 'bottom';
  if (division === 'vertical-copy-bottom') return 'top';
  return null;
}

/**
 * Viewport Y in vh so vertical placement never depends on a parent with height:auto
 * (CSS ignores top:% when the containing block height is indefinite — only left:%
 * worked, which is why left/center/right seemed fine and top/middle/bottom did not).
 */
export function heroVerticalCellToViewportPosition(
  placement: HeroVerticalCellPlacement,
  band: HeroVerticalVisualBand
): { leftPct: number; topVh: number } {
  const local = heroVerticalCellToPosition(placement);
  const bandStartVh = band === 'bottom' ? 50 : 0;
  return {
    leftPct: local.x,
    topVh: bandStartVh + (local.y / 100) * 50,
  };
}

/** CSS grid cell indices (1-based) for inline style placement. */
export function heroVerticalCellGridIndices(placement: HeroVerticalCellPlacement): {
  column: number;
  row: number;
} {
  const option = cellOption(placement);
  return {
    column: option.col === 'left' ? 1 : option.col === 'right' ? 3 : 2,
    row: option.row === 'top' ? 1 : option.row === 'bottom' ? 3 : 2,
  };
}


/** CSS grid placement inside a 3×3 visual-band grid (reliable X + Y). */
export function heroVerticalCellGridClass(placement: HeroVerticalCellPlacement): string {
  const option = cellOption(placement);
  const col =
    option.col === 'left' ? 'col-start-1' : option.col === 'right' ? 'col-start-3' : 'col-start-2';
  const row =
    option.row === 'top' ? 'row-start-1' : option.row === 'bottom' ? 'row-start-3' : 'row-start-2';
  return `${col} ${row}`;
}

/**
 * Pin a layer box to the visual half using top/bottom (not height %),
 * so it wins against HeroEditorialLayerFrame's inset-y-0.
 */
export function heroVerticalVisualBandClass(band: HeroVerticalVisualBand): string {
  if (band === 'bottom') {
    return 'absolute inset-x-0 top-1/2 bottom-0';
  }
  return 'absolute inset-x-0 top-0 bottom-1/2';
}

/**
 * Pin absolute portrait/stats to the visual half for section-level layers.
 * Vertical division no longer uses section bands — the visual frame *is* the band
 * (see PortfolioHeroEditorial). Kept for any residual callers.
 */
export function heroVerticalVisualBandStyle(band: HeroVerticalVisualBand): CSSProperties {
  if (band === 'bottom') {
    return { top: '50%', bottom: '0%', height: 'auto', maxHeight: 'none' };
  }
  return { top: '0%', bottom: '50%', height: 'auto', maxHeight: 'none' };
}

/**
 * In-flow alignment for mobile / ultra-wide grid cells.
 * Tablet/mobile auto-centers horizontally; the cell column applies from xl.
 */
export function heroVerticalCellAlignClass(placement: HeroVerticalCellPlacement): string {
  const option = cellOption(placement);
  const justify =
    option.col === 'left'
      ? 'justify-center xl:justify-start'
      : option.col === 'right'
        ? 'justify-center xl:justify-end'
        : 'justify-center';
  const items =
    option.row === 'top' ? 'items-start' : option.row === 'bottom' ? 'items-end' : 'items-center';
  return `${justify} ${items}`;
}

/** Infer nearest cell from free % coords (for syncing after legacy drag). */
export function heroVerticalCellFromPosition(position: {
  x: number;
  y: number;
}): HeroVerticalCellPlacement {
  const col: 'left' | 'center' | 'right' =
    position.x < 34 ? 'left' : position.x > 66 ? 'right' : 'center';
  const row: 'top' | 'center' | 'bottom' =
    position.y < 34 ? 'top' : position.y > 66 ? 'bottom' : 'center';
  const match = HERO_VERTICAL_CELL_PLACEMENT_OPTIONS.find(
    (item) => item.col === col && item.row === row
  );
  return match?.value ?? 'center';
}
