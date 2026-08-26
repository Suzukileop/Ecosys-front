import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

export type PortfolioElementFont = 'sans' | 'serif' | 'display';

export type PortfolioElementTextSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export type PortfolioElementTextWeight =
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'custom';

export type PortfolioElementTextDecoration = 'none' | 'underline' | 'highlight';

export type PortfolioElementTextRole = 'title' | 'body' | 'label';

/** Shared color / font / size / weight controls for portfolio section text. */
export type PortfolioElementTextStyle = {
  /** Active / light-mode color (and palette-bound color when palette is on). */
  color: string;
  /**
   * Manual dark-mode color (used when the section palette is off and
   * Global → Theme is Dark). Falls back to `color` when empty/unset.
   */
  colorDark: string;
  font: PortfolioElementFont;
  size: PortfolioElementTextSize;
  /** Exact font size in px when `size` is `custom`. */
  sizePx: number;
  /** Font weight — preferred over the legacy `bold` flag. */
  weight: PortfolioElementTextWeight;
  /** Numeric font-weight (100–900) when `weight` is `custom`. */
  weightAmount: number;
  italic: boolean;
  /** @deprecated Prefer `weight`. Kept in sync for older saved settings. */
  bold: boolean;
  uppercase: boolean;
  /** Optional text decoration (used by headline emphasis word, etc.). */
  decoration: PortfolioElementTextDecoration;
  /** Marker / highlight wash color when decoration is `highlight`. */
  highlightColor: string;
};

export const DEFAULT_ELEMENT_BODY_COLOR = '#525252';
export const DEFAULT_ELEMENT_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_ELEMENT_MUTED_COLOR = '#a3a3a3';
export const DEFAULT_ELEMENT_HIGHLIGHT_COLOR = '#fde68a';

/** Approximate CSS px for each size preset, by typography role. */
export const ELEMENT_TEXT_SIZE_PRESET_PX: Record<
  PortfolioElementTextRole,
  Record<'sm' | 'md' | 'lg' | 'xl', number>
> = {
  title: { sm: 20, md: 24, lg: 30, xl: 36 },
  body: { sm: 14, md: 16, lg: 18, xl: 22 },
  label: { sm: 11, md: 12, lg: 14, xl: 16 },
};

export const ELEMENT_TEXT_SIZE_PX_MIN = 10;
export const ELEMENT_TEXT_SIZE_PX_MAX = 72;

export const ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT: Record<
  'normal' | 'medium' | 'semibold' | 'bold',
  number
> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const ELEMENT_TEXT_WEIGHT_AMOUNT_MIN = 100;
export const ELEMENT_TEXT_WEIGHT_AMOUNT_MAX = 900;
export const ELEMENT_TEXT_WEIGHT_AMOUNT_STEP = 50;

export function clampElementTextSizePx(
  value: unknown,
  fallback = ELEMENT_TEXT_SIZE_PRESET_PX.body.md
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(ELEMENT_TEXT_SIZE_PX_MAX, Math.max(ELEMENT_TEXT_SIZE_PX_MIN, Math.round(n)));
}

export function clampElementTextWeightAmount(
  value: unknown,
  fallback = ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT.normal
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const stepped =
    Math.round(n / ELEMENT_TEXT_WEIGHT_AMOUNT_STEP) * ELEMENT_TEXT_WEIGHT_AMOUNT_STEP;
  return Math.min(
    ELEMENT_TEXT_WEIGHT_AMOUNT_MAX,
    Math.max(ELEMENT_TEXT_WEIGHT_AMOUNT_MIN, stepped)
  );
}

export function resolveElementTextSizePx(
  size: PortfolioElementTextSize,
  sizePx: number | undefined,
  role: PortfolioElementTextRole = 'body'
): number {
  const presets = ELEMENT_TEXT_SIZE_PRESET_PX[role];
  if (size === 'custom') {
    return clampElementTextSizePx(sizePx, presets.md);
  }
  if (size === 'sm' || size === 'md' || size === 'lg' || size === 'xl') {
    return presets[size];
  }
  return clampElementTextSizePx(sizePx, presets.md);
}

export function resolveElementTextWeightAmount(
  weight: PortfolioElementTextWeight,
  weightAmount: number | undefined
): number {
  if (weight === 'custom') {
    return clampElementTextWeightAmount(weightAmount);
  }
  if (weight === 'normal' || weight === 'medium' || weight === 'semibold' || weight === 'bold') {
    return ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT[weight];
  }
  return clampElementTextWeightAmount(weightAmount);
}

export const PORTFOLIO_ELEMENT_TEXT_DECORATION_OPTIONS: {
  value: PortfolioElementTextDecoration;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No underline or highlight.' },
  { value: 'underline', label: 'Underline', description: 'Classic text underline.' },
  { value: 'highlight', label: 'Highlight', description: 'Soft marker wash behind the word.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

export function createElementTextStyle(
  overrides: Partial<PortfolioElementTextStyle> = {}
): PortfolioElementTextStyle {
  const color = overrides.color ?? DEFAULT_ELEMENT_BODY_COLOR;
  const weight =
    overrides.weight ??
    (overrides.bold === true ? 'bold' : overrides.bold === false ? 'normal' : 'normal');
  const size = overrides.size ?? 'md';
  const sizePx = clampElementTextSizePx(
    overrides.sizePx,
    size === 'sm' || size === 'md' || size === 'lg' || size === 'xl'
      ? ELEMENT_TEXT_SIZE_PRESET_PX.body[size]
      : ELEMENT_TEXT_SIZE_PRESET_PX.body.md
  );
  const weightAmount = clampElementTextWeightAmount(
    overrides.weightAmount,
    weight === 'normal' || weight === 'medium' || weight === 'semibold' || weight === 'bold'
      ? ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT[weight]
      : ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT.normal
  );
  return {
    font: 'sans',
    italic: false,
    uppercase: false,
    decoration: 'none',
    highlightColor: DEFAULT_ELEMENT_HIGHLIGHT_COLOR,
    ...overrides,
    color,
    colorDark: overrides.colorDark ?? color,
    size,
    sizePx,
    weight,
    weightAmount,
    bold: weight === 'bold' || weight === 'semibold',
  };
}

function normalizeElementTextWeight(
  record: Record<string, unknown>,
  fallback: PortfolioElementTextStyle
): PortfolioElementTextWeight {
  const raw = record.weight;
  if (
    raw === 'normal' ||
    raw === 'medium' ||
    raw === 'semibold' ||
    raw === 'bold' ||
    raw === 'custom'
  ) {
    return raw;
  }
  if (typeof record.bold === 'boolean') return record.bold ? 'bold' : 'normal';
  return fallback.weight ?? (fallback.bold ? 'bold' : 'normal');
}

export function normalizeElementTextStyle(
  raw: unknown,
  fallback: PortfolioElementTextStyle
): PortfolioElementTextStyle {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...fallback };
  const record = raw as Record<string, unknown>;
  const font =
    record.font === 'sans' || record.font === 'serif' || record.font === 'display'
      ? record.font
      : fallback.font;
  const size =
    record.size === 'sm' ||
    record.size === 'md' ||
    record.size === 'lg' ||
    record.size === 'xl' ||
    record.size === 'custom'
      ? record.size
      : fallback.size;
  const decoration =
    record.decoration === 'none' ||
    record.decoration === 'underline' ||
    record.decoration === 'highlight'
      ? record.decoration
      : fallback.decoration;
  const color = sanitizeHex(record.color, fallback.color);
  const weight = normalizeElementTextWeight(record, fallback);
  const sizePx = clampElementTextSizePx(
    record.sizePx,
    resolveElementTextSizePx(size, fallback.sizePx, 'body')
  );
  const weightAmount = clampElementTextWeightAmount(
    record.weightAmount,
    resolveElementTextWeightAmount(weight, fallback.weightAmount)
  );
  return {
    color,
    colorDark: sanitizeHex(record.colorDark, fallback.colorDark || color),
    font,
    size,
    sizePx,
    weight,
    weightAmount,
    italic: typeof record.italic === 'boolean' ? record.italic : fallback.italic,
    bold: weight === 'bold' || weight === 'semibold',
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : fallback.uppercase,
    decoration,
    highlightColor: sanitizeHex(
      record.highlightColor,
      fallback.highlightColor || DEFAULT_ELEMENT_HIGHLIGHT_COLOR
    ),
  };
}

export function normalizeElementStylesRecord<T extends string>(
  raw: unknown,
  defaults: Record<T, PortfolioElementTextStyle>,
  ids: readonly T[]
): Record<T, PortfolioElementTextStyle> {
  const next = {} as Record<T, PortfolioElementTextStyle>;
  for (const id of ids) {
    next[id] = { ...defaults[id] };
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return next;
  const record = raw as Record<string, unknown>;
  for (const id of ids) {
    next[id] = normalizeElementTextStyle(record[id], defaults[id]);
  }
  return next;
}

export function patchElementStylesRecord<T extends string>(
  styles: Record<T, PortfolioElementTextStyle>,
  target: T,
  patch: Partial<PortfolioElementTextStyle>,
  defaults: Record<T, PortfolioElementTextStyle>,
  ids: readonly T[]
): Record<T, PortfolioElementTextStyle> {
  return normalizeElementStylesRecord(
    { ...styles, [target]: { ...styles[target], ...patch } },
    defaults,
    ids
  );
}

export function elementTextSizeClass(
  size: PortfolioElementTextSize,
  role: PortfolioElementTextRole = 'body'
): string {
  if (size === 'custom') return '';
  if (role === 'title') {
    switch (size) {
      case 'sm':
        return 'text-xl sm:text-2xl';
      case 'lg':
        return 'text-3xl sm:text-4xl';
      case 'xl':
        return 'text-3xl font-bold sm:text-4xl lg:text-[2.6rem]';
      default:
        return 'text-2xl sm:text-3xl';
    }
  }
  if (role === 'label') {
    switch (size) {
      case 'sm':
        return 'text-[11px]';
      case 'lg':
        return 'text-sm';
      case 'xl':
        return 'text-base';
      default:
        return 'text-xs';
    }
  }
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-[0.9375rem]';
    case 'lg':
      return 'text-lg sm:text-xl';
    case 'xl':
      return 'text-xl sm:text-2xl';
    default:
      return 'text-base sm:text-lg';
  }
}

export function elementTextStyleClass(
  style: PortfolioElementTextStyle,
  role: PortfolioElementTextRole = 'body'
): string {
  const parts = [elementTextSizeClass(style.size, role)].filter(Boolean);
  if (style.italic) parts.push('italic');
  const weight = style.weight ?? (style.bold ? 'bold' : 'normal');
  if (weight !== 'custom') {
    switch (weight) {
      case 'medium':
        parts.push('font-medium');
        break;
      case 'semibold':
        parts.push('font-semibold');
        break;
      case 'bold':
        parts.push('font-bold');
        break;
      default:
        parts.push('font-normal');
    }
  }
  if (style.uppercase) {
    parts.push(role === 'label' ? 'uppercase tracking-[0.16em]' : 'uppercase tracking-[0.08em]');
  }
  return parts.join(' ');
}

export function elementTextInlineStyle(
  style: PortfolioElementTextStyle,
  mode: 'light' | 'dark' = 'light',
  role: PortfolioElementTextRole = 'body'
): CSSProperties {
  const color =
    mode === 'dark'
      ? sanitizeHex(style.colorDark || style.color, DEFAULT_ELEMENT_BODY_COLOR)
      : sanitizeHex(style.color, DEFAULT_ELEMENT_BODY_COLOR);
  const base: CSSProperties = { color };
  if (style.size === 'custom') {
    base.fontSize = `${resolveElementTextSizePx(style.size, style.sizePx, role)}px`;
    base.lineHeight = role === 'title' ? 1.15 : 1.45;
  }
  if (style.weight === 'custom') {
    base.fontWeight = resolveElementTextWeightAmount(style.weight, style.weightAmount);
  }
  // Font family is owned by Global → Police principale only (no per-element Playfair/serif).
  if (style.font === 'display') {
    base.letterSpacing = '-0.02em';
  }
  if (style.decoration === 'underline') {
    base.textDecoration = 'underline';
    base.textUnderlineOffset = '0.18em';
  } else if (style.decoration === 'highlight') {
    const wash = sanitizeHex(
      style.highlightColor,
      DEFAULT_ELEMENT_HIGHLIGHT_COLOR
    );
    return {
      ...base,
      backgroundImage: `linear-gradient(transparent 58%, ${wash}cc 58%)`,
      backgroundRepeat: 'no-repeat',
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
    } as CSSProperties;
  }
  return base;
}

/** Pick light or dark text color for manual (non-palette) mode. */
export function resolveElementTextColor(
  style: PortfolioElementTextStyle,
  mode: 'light' | 'dark' = 'light'
): string {
  if (mode === 'dark') {
    return sanitizeHex(style.colorDark || style.color, DEFAULT_ELEMENT_BODY_COLOR);
  }
  return sanitizeHex(style.color, DEFAULT_ELEMENT_BODY_COLOR);
}

export const PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS: {
  value: Exclude<PortfolioElementTextSize, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact body text.' },
  { value: 'md', label: 'Medium', description: 'Default readable size.' },
  { value: 'lg', label: 'Large', description: 'More prominent.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-level emphasis.' },
];

export const PORTFOLIO_ELEMENT_TEXT_WEIGHT_OPTIONS: {
  value: Exclude<PortfolioElementTextWeight, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'normal', label: 'Regular', description: 'Default body weight.' },
  { value: 'medium', label: 'Medium', description: 'Slightly stronger.' },
  { value: 'semibold', label: 'Semibold', description: 'Clear emphasis.' },
  { value: 'bold', label: 'Bold', description: 'Strongest weight.' },
];

export const PORTFOLIO_ELEMENT_FONT_OPTIONS: {
  value: PortfolioElementFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Sans', description: 'Clean modern sans-serif.' },
  { value: 'serif', label: 'Serif', description: 'Editorial serif.' },
  { value: 'display', label: 'Display', description: 'Strong display weight.' },
];

export type PortfolioToolsIconSize = 'sm' | 'md' | 'lg' | 'xl';

export function toolsIconPixelSize(size: PortfolioToolsIconSize): number {
  switch (size) {
    case 'sm':
      return 20;
    case 'lg':
      return 32;
    case 'xl':
      return 40;
    default:
      return 26;
  }
}

export function toolsIconShellClass(size: PortfolioToolsIconSize): string {
  switch (size) {
    case 'sm':
      return 'h-9 w-9';
    case 'lg':
      return 'h-12 w-12';
    case 'xl':
      return 'h-16 w-16';
    default:
      return 'h-11 w-11 sm:h-14 sm:w-14';
  }
}

export const PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS: {
  value: PortfolioToolsIconSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact logos.' },
  { value: 'md', label: 'Medium', description: 'Default size.' },
  { value: 'lg', label: 'Large', description: 'More visible logos.' },
  { value: 'xl', label: 'Extra large', description: 'Hero-sized tool icons.' },
];
