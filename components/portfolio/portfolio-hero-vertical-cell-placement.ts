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

export const DEFAULT_PORTRAIT_VERTICAL_CELL: HeroVerticalCellPlacement = 'top-left';
export const DEFAULT_META_VERTICAL_CELL: HeroVerticalCellPlacement = 'top-right';

const HERO_VERTICAL_CELL_PLACEMENT_OPTIONS: {
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
