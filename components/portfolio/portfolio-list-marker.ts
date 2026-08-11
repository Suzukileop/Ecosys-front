/**
 * Shared list / task bullet markers — Experience, Services, FAQ, and Global defaults.
 * Style vocabulary matches About → Why me (plus Services `dot` / `dash`).
 */

export type PortfolioListMarkerStyle =
  | 'number'
  | 'roman'
  | 'disc'
  | 'bar-dot'
  | 'bullseye'
  | 'square'
  | 'check-square'
  | 'x-square'
  | 'check'
  | 'arrow'
  | 'chevron'
  | 'chevron-double'
  | 'triangle'
  | 'dot'
  | 'dash'
  | 'none';

export type PortfolioListMarkerSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

/** Stroke / type weight for markers (numbers + glyph strokes). */
export type PortfolioListMarkerWeight = 'light' | 'regular' | 'bold' | 'heavy' | 'custom';

/** Whether a section uses Global task bullets or its own. */
export type PortfolioListMarkerSource = 'global' | 'section';

export const DEFAULT_LIST_MARKER_COLOR = '#e2572e';

/** Glyph box size (px) for task-list markers — Services / Experience / FAQ / Global. */
export const LIST_MARKER_SIZE_PRESET_PX: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export const LIST_MARKER_SIZE_PX_MIN = 10;
export const LIST_MARKER_SIZE_PX_MAX = 48;

/** SVG stroke width (viewBox 20×20) for outline markers. */
export const LIST_MARKER_WEIGHT_PRESET_AMOUNT: Record<'light' | 'regular' | 'bold' | 'heavy', number> = {
  light: 1.25,
  regular: 1.75,
  bold: 2.15,
  heavy: 2.6,
};

export const LIST_MARKER_WEIGHT_AMOUNT_MIN = 0.75;
export const LIST_MARKER_WEIGHT_AMOUNT_MAX = 3.5;
export const LIST_MARKER_WEIGHT_AMOUNT_STEP = 0.05;

export const PORTFOLIO_LIST_MARKER_STYLE_OPTIONS: {
  value: PortfolioListMarkerStyle;
  label: string;
  description: string;
  preview: string;
}[] = [
  { value: 'number', label: 'Chiffres', description: '01, 02, 03… numérotation.', preview: '01' },
  { value: 'roman', label: 'Romains', description: 'I, II, III… chiffres romains.', preview: 'IV' },
  { value: 'disc', label: 'Disque', description: 'Puce ronde pleine.', preview: '●' },
  { value: 'dot', label: 'Point doux', description: 'Point avec halo soft.', preview: '◦' },
  { value: 'dash', label: 'Tiret', description: 'Trait horizontal court.', preview: '—' },
  { value: 'bar-dot', label: 'Barre + point', description: 'Rectangle vertical avec point.', preview: '▮' },
  { value: 'bullseye', label: 'Cible', description: 'Cercles concentriques.', preview: '◎' },
  { value: 'square', label: 'Carré', description: 'Case vide.', preview: '☐' },
  { value: 'check-square', label: 'Case cochée', description: 'Carré avec coche.', preview: '☑' },
  { value: 'x-square', label: 'Case ×', description: 'Carré avec croix.', preview: '☒' },
  { value: 'check', label: 'Coche', description: 'Checkmark seul.', preview: '✓' },
  { value: 'arrow', label: 'Flèche', description: 'Flèche →.', preview: '→' },
  { value: 'chevron', label: 'Chevron', description: 'Chevron ›.', preview: '›' },
  { value: 'chevron-double', label: 'Double chevron', description: 'Double chevron ».', preview: '»' },
  { value: 'triangle', label: 'Triangle', description: 'Pointe ▶.', preview: '▶' },
  { value: 'none', label: 'Aucun', description: 'Texte seul — pas de puce.', preview: '—' },
];

export const PORTFOLIO_LIST_MARKER_SIZE_OPTIONS: {
  value: PortfolioListMarkerSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Petite puce.' },
  { value: 'md', label: 'M', description: 'Taille moyenne.' },
  { value: 'lg', label: 'L', description: 'Grande puce.' },
  { value: 'xl', label: 'XL', description: 'Très grande puce.' },
];

export const PORTFOLIO_LIST_MARKER_WEIGHT_OPTIONS: {
  value: PortfolioListMarkerWeight;
  label: string;
  description: string;
}[] = [
  { value: 'light', label: 'Light', description: 'Trait / texte fin.' },
  { value: 'regular', label: 'Regular', description: 'Graisse normale.' },
  { value: 'bold', label: 'Bold', description: 'Trait / texte gras.' },
  { value: 'heavy', label: 'Heavy', description: 'Très gras / trait épais.' },
];

export const PORTFOLIO_LIST_MARKER_SOURCE_OPTIONS: {
  value: PortfolioListMarkerSource;
  label: string;
  description: string;
}[] = [
  {
    value: 'global',
    label: 'Global',
    description: 'Use Global → Task list bullets for this section.',
  },
  {
    value: 'section',
    label: 'Section',
    description: 'Override with styles set below for this section only.',
  },
];

const LIST_MARKER_STYLE_VALUES = PORTFOLIO_LIST_MARKER_STYLE_OPTIONS.map(
  (option) => option.value
) as PortfolioListMarkerStyle[];

export function isPortfolioListMarkerStyle(value: unknown): value is PortfolioListMarkerStyle {
  return typeof value === 'string' && (LIST_MARKER_STYLE_VALUES as string[]).includes(value);
}

export function isPortfolioListMarkerSize(value: unknown): value is PortfolioListMarkerSize {
  return value === 'sm' || value === 'md' || value === 'lg' || value === 'xl' || value === 'custom';
}

export function isPortfolioListMarkerWeight(value: unknown): value is PortfolioListMarkerWeight {
  return (
    value === 'light' ||
    value === 'regular' ||
    value === 'bold' ||
    value === 'heavy' ||
    value === 'custom'
  );
}

export function isPortfolioListMarkerSource(value: unknown): value is PortfolioListMarkerSource {
  return value === 'global' || value === 'section';
}

export function clampListMarkerSizePx(value: unknown, fallback = LIST_MARKER_SIZE_PRESET_PX.md): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(LIST_MARKER_SIZE_PX_MAX, Math.max(LIST_MARKER_SIZE_PX_MIN, Math.round(n)));
}

export function clampListMarkerWeightAmount(
  value: unknown,
  fallback = LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const stepped = Math.round(n / LIST_MARKER_WEIGHT_AMOUNT_STEP) * LIST_MARKER_WEIGHT_AMOUNT_STEP;
  return Math.min(
    LIST_MARKER_WEIGHT_AMOUNT_MAX,
    Math.max(LIST_MARKER_WEIGHT_AMOUNT_MIN, Number(stepped.toFixed(2)))
  );
}

export function resolveListMarkerSizePx(
  size: PortfolioListMarkerSize | undefined,
  sizePx: number | undefined,
  presets: Record<'sm' | 'md' | 'lg' | 'xl', number> = LIST_MARKER_SIZE_PRESET_PX
): number {
  if (size === 'custom') {
    return clampListMarkerSizePx(sizePx, presets.md);
  }
  if (size === 'sm' || size === 'md' || size === 'lg' || size === 'xl') {
    return presets[size];
  }
  return clampListMarkerSizePx(sizePx, presets.md);
}

export function resolveListMarkerWeightAmount(
  weight: PortfolioListMarkerWeight | undefined,
  weightAmount: number | undefined
): number {
  if (weight === 'custom') {
    return clampListMarkerWeightAmount(weightAmount);
  }
  if (weight === 'light' || weight === 'regular' || weight === 'bold' || weight === 'heavy') {
    return LIST_MARKER_WEIGHT_PRESET_AMOUNT[weight];
  }
  return clampListMarkerWeightAmount(weightAmount);
}

/** Map stroke amount → CSS font-weight for number / roman markers. */
export function listMarkerFontWeightFromAmount(amount: number | undefined): number {
  const a = clampListMarkerWeightAmount(amount);
  const t =
    (a - LIST_MARKER_WEIGHT_AMOUNT_MIN) /
    (LIST_MARKER_WEIGHT_AMOUNT_MAX - LIST_MARKER_WEIGHT_AMOUNT_MIN);
  return Math.round(400 + t * 500);
}

export function isListMarkerHyperGlyph(style: PortfolioListMarkerStyle): boolean {
  return style !== 'number' && style !== 'roman' && style !== 'none' && style !== 'dot' && style !== 'dash';
}

const ROMAN_MAP: [number, string][] = [
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function listMarkerRomanNumeral(value: number): string {
  let n = Math.max(1, Math.floor(value));
  if (n > 399) n = 399;
  let out = '';
  for (const [amount, glyph] of ROMAN_MAP) {
    while (n >= amount) {
      out += glyph;
      n -= amount;
    }
  }
  return out;
}

export function formatListMarkerIndexLabel(
  index: number,
  style: PortfolioListMarkerStyle
): string | null {
  if (style === 'number') return String(index + 1).padStart(2, '0');
  if (style === 'roman') return listMarkerRomanNumeral(index + 1);
  return null;
}

export function listMarkerGlyphSizeClass(size: PortfolioListMarkerSize): string {
  switch (size) {
    case 'sm':
      return 'h-3.5 w-3.5';
    case 'lg':
      return 'h-5 w-5';
    case 'xl':
      return 'h-6 w-6';
    case 'custom':
      return '';
    default:
      return 'h-4 w-4';
  }
}

export function listMarkerIndexTextClass(size: PortfolioListMarkerSize): string {
  switch (size) {
    case 'sm':
      return 'text-[10px] tabular-nums leading-none tracking-wide';
    case 'lg':
      return 'text-sm tabular-nums leading-none tracking-wide';
    case 'xl':
      return 'text-base tabular-nums leading-none tracking-wide';
    case 'custom':
      return 'tabular-nums leading-none tracking-wide';
    default:
      return 'text-[11px] tabular-nums leading-none tracking-wide';
  }
}

/** Font-weight class for number / roman markers (preset only — prefer amount for custom). */
export function listMarkerWeightFontClass(weight: PortfolioListMarkerWeight | undefined): string {
  switch (weight) {
    case 'light':
      return 'font-medium';
    case 'bold':
      return 'font-extrabold';
    case 'heavy':
      return 'font-black';
    case 'custom':
      return '';
    default:
      return 'font-bold';
  }
}

/** SVG stroke width for outline glyphs (viewBox 20×20). Prefer resolveListMarkerWeightAmount. */
export function listMarkerStrokeWidth(
  weight: PortfolioListMarkerWeight | undefined,
  weightAmount?: number
): number {
  return resolveListMarkerWeightAmount(weight, weightAmount);
}

/** Dash / bar thickness for solid horizontal markers. */
export function listMarkerDashHeightPx(weightAmount: number | undefined): number {
  const a = clampListMarkerWeightAmount(weightAmount);
  return Math.max(1, Math.round(a));
}

/** @deprecated Prefer listMarkerDashHeightPx with resolved amount. */
export function listMarkerDashHeightClass(weight: PortfolioListMarkerWeight | undefined): string {
  switch (weight) {
    case 'light':
      return 'h-px';
    case 'bold':
      return 'h-[2px]';
    case 'heavy':
      return 'h-[3px]';
    case 'custom':
      return '';
    default:
      return 'h-px';
  }
}

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) return trimmed;
  return fallback;
}

export type ResolvedTaskListMarker = {
  style: PortfolioListMarkerStyle;
  color: string;
  size: PortfolioListMarkerSize;
  sizePx: number;
  weight: PortfolioListMarkerWeight;
  weightAmount: number;
};

export type TaskListMarkerSectionSettings = {
  taskBulletSource: PortfolioListMarkerSource;
  taskBulletStyle: PortfolioListMarkerStyle;
  taskBulletColor: string;
  taskBulletSize: PortfolioListMarkerSize;
  taskBulletSizePx?: number;
  taskBulletWeight?: PortfolioListMarkerWeight;
  taskBulletWeightAmount?: number;
};

export type TaskListMarkerGlobalSettings = {
  taskListBulletStyle: PortfolioListMarkerStyle;
  taskListBulletColor: string;
  taskListBulletSize: PortfolioListMarkerSize;
  taskListBulletSizePx?: number;
  taskListBulletWeight?: PortfolioListMarkerWeight;
  taskListBulletWeightAmount?: number;
};

export function resolveTaskListMarker(
  global: TaskListMarkerGlobalSettings | null | undefined,
  section: TaskListMarkerSectionSettings,
  fallbackColor = DEFAULT_LIST_MARKER_COLOR
): ResolvedTaskListMarker {
  const useGlobal = section.taskBulletSource === 'global';
  if (useGlobal) {
    if (global) {
      const size = isPortfolioListMarkerSize(global.taskListBulletSize)
        ? global.taskListBulletSize
        : 'md';
      const weight = isPortfolioListMarkerWeight(global.taskListBulletWeight)
        ? global.taskListBulletWeight
        : 'regular';
      return {
        style: isPortfolioListMarkerStyle(global.taskListBulletStyle)
          ? global.taskListBulletStyle
          : 'disc',
        color: sanitizeHex(global.taskListBulletColor, fallbackColor),
        size,
        sizePx: resolveListMarkerSizePx(size, global.taskListBulletSizePx),
        weight,
        weightAmount: resolveListMarkerWeightAmount(weight, global.taskListBulletWeightAmount),
      };
    }
    // Global requested but context missing — still avoid stale section "check".
    return {
      style: 'disc',
      color: sanitizeHex(fallbackColor, DEFAULT_LIST_MARKER_COLOR),
      size: 'md',
      sizePx: LIST_MARKER_SIZE_PRESET_PX.md,
      weight: 'regular',
      weightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
    };
  }
  const size = isPortfolioListMarkerSize(section.taskBulletSize) ? section.taskBulletSize : 'md';
  const weight = isPortfolioListMarkerWeight(section.taskBulletWeight)
    ? section.taskBulletWeight
    : 'regular';
  return {
    style: isPortfolioListMarkerStyle(section.taskBulletStyle) ? section.taskBulletStyle : 'disc',
    color: sanitizeHex(section.taskBulletColor, fallbackColor),
    size,
    sizePx: resolveListMarkerSizePx(size, section.taskBulletSizePx),
    weight,
    weightAmount: resolveListMarkerWeightAmount(weight, section.taskBulletWeightAmount),
  };
}
