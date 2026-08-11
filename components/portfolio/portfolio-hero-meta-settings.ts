import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_META_VERTICAL_CELL,
  heroVerticalCellFromPosition,
  heroVerticalCellToPosition,
  sanitizeHeroVerticalCellPlacement,
  type HeroVerticalCellPlacement,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';

/** @deprecated Legacy — migrated on read into showMetaFrame + metaFrameShape. */
export type PortfolioHeroMetaFrameStyle =
  | 'circle-pill'
  | 'rounded-square'
  | 'square'
  | 'pill'
  | 'outline'
  | 'minimal';

export type PortfolioHeroMetaFrameShape = 'circle' | 'rounded' | 'square' | 'pill';

export type PortfolioHeroMetaFrameShapeMode = 'uniform' | 'per-card';

export type PortfolioHeroMetaCardId = 'years' | 'projects' | 'location';

/** What part of “city, country” to show on the location badge. */
export type PortfolioHeroMetaLocationContent = 'country' | 'city' | 'both';

export type PortfolioHeroMetaDisplayDesign = 'elevated' | 'flat' | 'soft' | 'glass' | 'dark';

export type PortfolioHeroMetaPlacementMode = 'straddle-bottom' | 'on-motif' | 'free';

export type PortfolioHeroMetaSpread = 'compact' | 'standard' | 'wide';

/** Stat cards laid out as a horizontal row (default) or stacked vertically. */
export type PortfolioHeroMetaCardsOrientation = 'horizontal' | 'vertical';

export type PortfolioHeroMetaInnerLayout = 'stacked' | 'inline' | 'value-first' | 'icon-bottom';

export type PortfolioHeroMetaCardPadding = 'tight' | 'standard' | 'relaxed';

export type PortfolioHeroMetaValueSize = 'sm' | 'md' | 'lg';

export type MetaRowPosition = { x: number; y: number };

export type PortfolioHeroMetaSettings = {
  /** Master switch — hides the entire Stats row when false. */
  showStats: boolean;
  showYearsCard: boolean;
  showProjectsCard: boolean;
  showLocationCard: boolean;
  showMetaFrame: boolean;
  /** Apply one shape to all cards, or set each card independently. */
  metaFrameShapeMode: PortfolioHeroMetaFrameShapeMode;
  metaFrameShape: PortfolioHeroMetaFrameShape;
  metaYearsFrameShape: PortfolioHeroMetaFrameShape;
  metaProjectsFrameShape: PortfolioHeroMetaFrameShape;
  metaLocationFrameShape: PortfolioHeroMetaFrameShape;
  /** Country only (default), city only, or both as “country / city”. */
  metaLocationContent: PortfolioHeroMetaLocationContent;
  metaFrameBorderWidth: number;
  /** Stat card fill — editable under Typography → Stat value / Stat label. */
  metaCardBackgroundColor: string;
  /** Stat card outline color (width stays metaFrameBorderWidth). */
  metaFrameBorderColor: string;
  metaDisplayDesign: PortfolioHeroMetaDisplayDesign;
  metaInnerLayout: PortfolioHeroMetaInnerLayout;
  metaCardPadding: PortfolioHeroMetaCardPadding;
  metaValueSize: PortfolioHeroMetaValueSize;
  metaShowLabels: boolean;
  metaPlacementMode: PortfolioHeroMetaPlacementMode;
  metaPosition: MetaRowPosition;
  /** Free placement when screen division is vertical (top/bottom). Independent from horizontal. */
  metaPositionVertical: MetaRowPosition;
  /** 3×3 cell anchor for vertical division (source of truth over free-drag). */
  metaVerticalCell: HeroVerticalCellPlacement;
  metaSpread: PortfolioHeroMetaSpread;
  /** Exact horizontal gap between stat cards, in pixels. */
  metaCardGapPx: number;
  /** Row (horizontal) or stacked column (vertical) of stat cards. */
  metaCardsOrientation: PortfolioHeroMetaCardsOrientation;
  /** Stats row fills the whole cell width; spacing between cards is automatic. */
  metaCardsFillWidth: boolean;
  showMetaIcons: boolean;
  /** Per-card icon visibility (AND with showMetaIcons). */
  showYearsIcon: boolean;
  showProjectsIcon: boolean;
  showLocationIcon: boolean;
  /**
   * Thin accent bar under each stat — works with or without the card frame.
   * Color follows each card’s accent (palette-bound).
   */
  showMetaBottomBar: boolean;
  metaBottomBarHeightPx: number;
  /** Corner radius of the bottom bar (0 = sharp, high = pill). */
  metaBottomBarRadiusPx: number;
  metaAccentColor: string;
  /** Per-card accent for icons + primary values (years / projects / location). */
  metaYearsAccentColor: string;
  metaProjectsAccentColor: string;
  metaLocationAccentColor: string;
  /** Value text uses the card accent instead of a single flat metaValueColor. */
  metaValueUsesCardAccent: boolean;
  metaValueColor: string;
  metaLabelColor: string;
  /**
   * When on, rotate years / projects / location values across the visible cards
   * with a soft fade (not an abrupt swap).
   */
  metaValueInterchangeEnabled: boolean;
  /** Seconds between each gentle rotation (2–12). */
  metaValueInterchangeSeconds: number;
};

export const DEFAULT_META_ROW_POSITION: MetaRowPosition = { x: 80, y: 88 };

/** Default free placement for vertical (Copy/Visual) screen division — flush under midline. */
export const DEFAULT_META_ROW_POSITION_VERTICAL: MetaRowPosition = {
  ...heroVerticalCellToPosition(DEFAULT_META_VERTICAL_CELL),
};

/** Recommended surface tokens for dark spit / noir heroes. */
export const DARK_META_CARD_SURFACE = '#17171B';
export const DARK_META_CARD_BORDER = '#2A2A30';
export const DARK_META_LABEL_COLOR = '#9A9AA2';
export const DEFAULT_META_YEARS_ACCENT = '#ea580c';
export const DEFAULT_META_PROJECTS_ACCENT = '#14b8a6';
export const DEFAULT_META_LOCATION_ACCENT = '#ea580c';
export const META_CARD_GAP_PX_MIN = 0;
export const META_CARD_GAP_PX_MAX = 220;
export const META_BOTTOM_BAR_HEIGHT_PX_MIN = 1;
export const META_BOTTOM_BAR_HEIGHT_PX_MAX = 16;
export const META_BOTTOM_BAR_RADIUS_PX_MIN = 0;
export const META_BOTTOM_BAR_RADIUS_PX_MAX = 32;
export const META_VALUE_INTERCHANGE_SECONDS_MIN = 2;
export const META_VALUE_INTERCHANGE_SECONDS_MAX = 12;
export const DEFAULT_META_VALUE_INTERCHANGE_SECONDS = 5;

export function sanitizeMetaValueInterchangeSeconds(
  value: unknown,
  fallback = DEFAULT_META_VALUE_INTERCHANGE_SECONDS
): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(
    META_VALUE_INTERCHANGE_SECONDS_MAX,
    Math.max(META_VALUE_INTERCHANGE_SECONDS_MIN, Math.round(number))
  );
}

export function metaSpreadGapPx(spread: PortfolioHeroMetaSpread): number {
  return spread === 'compact' ? 24 : spread === 'wide' ? 48 : 36;
}

export function sanitizeMetaCardGapPx(
  value: unknown,
  fallback: number = metaSpreadGapPx('compact')
): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(META_CARD_GAP_PX_MAX, Math.max(META_CARD_GAP_PX_MIN, Math.round(number)));
}

export function resolveMetaCardGapPx(meta: {
  metaCardGapPx?: number;
  metaSpread: PortfolioHeroMetaSpread;
}): number {
  return sanitizeMetaCardGapPx(meta.metaCardGapPx, metaSpreadGapPx(meta.metaSpread));
}

export function sanitizeMetaBottomBarHeightPx(
  value: unknown,
  fallback = 3
): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(
    META_BOTTOM_BAR_HEIGHT_PX_MAX,
    Math.max(META_BOTTOM_BAR_HEIGHT_PX_MIN, Math.round(number))
  );
}

export function sanitizeMetaBottomBarRadiusPx(
  value: unknown,
  fallback = 32
): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  // Cap at max for storage; 999 in defaults means “full pill” and clamps to max.
  return Math.min(
    META_BOTTOM_BAR_RADIUS_PX_MAX,
    Math.max(META_BOTTOM_BAR_RADIUS_PX_MIN, Math.round(number))
  );
}

export function resolveShowMetaCardIcon(
  meta: Pick<
    PortfolioHeroMetaSettings,
    'showMetaIcons' | 'showYearsIcon' | 'showProjectsIcon' | 'showLocationIcon'
  >,
  cardId: PortfolioHeroMetaCardId
): boolean {
  if (!meta.showMetaIcons) return false;
  if (cardId === 'years') return meta.showYearsIcon !== false;
  if (cardId === 'projects') return meta.showProjectsIcon !== false;
  return meta.showLocationIcon !== false;
}

/** Inline style for the optional accent bar under a stat card. */
export function metaCardBottomBarStyle(
  meta: PortfolioHeroMetaSettings,
  cardId: PortfolioHeroMetaCardId
): CSSProperties | null {
  if (!meta.showMetaBottomBar) return null;
  const height = sanitizeMetaBottomBarHeightPx(meta.metaBottomBarHeightPx);
  const radius = sanitizeMetaBottomBarRadiusPx(meta.metaBottomBarRadiusPx);
  return {
    height,
    borderRadius: radius,
    backgroundColor: resolveMetaCardAccentColor(meta, cardId),
    width: meta.showMetaFrame ? '68%' : '56%',
  };
}

export function resolveMetaCardsOrientation(meta: {
  metaCardsOrientation?: PortfolioHeroMetaCardsOrientation;
}): PortfolioHeroMetaCardsOrientation {
  return meta.metaCardsOrientation === 'vertical' ? 'vertical' : 'horizontal';
}

export function resolveMetaCardsFillWidth(meta: {
  metaCardsFillWidth?: boolean;
}): boolean {
  return meta.metaCardsFillWidth === true;
}

export const DEFAULT_HERO_META_SETTINGS: PortfolioHeroMetaSettings = {
  showStats: true,
  showYearsCard: true,
  showProjectsCard: true,
  showLocationCard: true,
  showMetaFrame: true,
  metaFrameShapeMode: 'uniform',
  metaFrameShape: 'circle',
  metaYearsFrameShape: 'circle',
  metaProjectsFrameShape: 'circle',
  metaLocationFrameShape: 'circle',
  metaLocationContent: 'country',
  metaFrameBorderWidth: 1,
  /** Matches DEFAULT_HERO_PALETTE.neutre / bordure (same tokens as portrait mat / frame). */
  metaCardBackgroundColor: '#17171b',
  metaFrameBorderColor: '#2a2a30',
  metaDisplayDesign: 'elevated',
  metaInnerLayout: 'stacked',
  metaCardPadding: 'standard',
  metaValueSize: 'md',
  metaShowLabels: true,
  metaPlacementMode: 'on-motif',
  metaPosition: { x: 78, y: 86 },
  metaPositionVertical: { ...heroVerticalCellToPosition(DEFAULT_META_VERTICAL_CELL) },
  metaVerticalCell: DEFAULT_META_VERTICAL_CELL,
  metaSpread: 'compact',
  metaCardGapPx: metaSpreadGapPx('compact'),
  metaCardsOrientation: 'horizontal',
  metaCardsFillWidth: false,
  showMetaIcons: true,
  showYearsIcon: true,
  showProjectsIcon: true,
  showLocationIcon: true,
  showMetaBottomBar: false,
  metaBottomBarHeightPx: 3,
  metaBottomBarRadiusPx: 32,
  metaAccentColor: '#f97316',
  metaYearsAccentColor: DEFAULT_META_YEARS_ACCENT,
  metaProjectsAccentColor: DEFAULT_META_PROJECTS_ACCENT,
  metaLocationAccentColor: DEFAULT_META_LOCATION_ACCENT,
  metaValueUsesCardAccent: true,
  metaValueColor: '#171717',
  metaLabelColor: '#737373',
  metaValueInterchangeEnabled: false,
  metaValueInterchangeSeconds: DEFAULT_META_VALUE_INTERCHANGE_SECONDS,
};

export const PORTFOLIO_HERO_META_FRAME_SHAPE_OPTIONS: {
  value: PortfolioHeroMetaFrameShape;
  label: string;
  description: string;
}[] = [
  { value: 'circle', label: 'Round', description: 'Fully circular chips (location becomes a capsule).' },
  { value: 'rounded', label: 'Rounded', description: 'Soft rounded rectangles on every card.' },
  { value: 'square', label: 'Square frame', description: 'Sharp corners — graphic and bold.' },
  { value: 'pill', label: 'Pill', description: 'Capsule shapes — elongated soft ends.' },
];

export const PORTFOLIO_HERO_META_FRAME_SHAPE_MODE_OPTIONS: {
  value: PortfolioHeroMetaFrameShapeMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'uniform',
    label: 'Uniform',
    description: 'One shape for years, projects, and location.',
  },
  {
    value: 'per-card',
    label: 'Per card',
    description: 'Set round / rounded / square independently for each badge.',
  },
];

export const PORTFOLIO_HERO_META_LOCATION_CONTENT_OPTIONS: {
  value: PortfolioHeroMetaLocationContent;
  label: string;
  description: string;
}[] = [
  {
    value: 'country',
    label: 'Country only',
    description: 'Show the country — default, fits a round badge.',
  },
  {
    value: 'city',
    label: 'City only',
    description: 'Show the city name alone.',
  },
  {
    value: 'both',
    label: 'Country & city',
    description: 'Show “country / city” on two lines when needed.',
  },
];

export function parseLocationParts(label: string): { city: string; country: string } {
  const trimmed = label.trim();
  const commaIndex = trimmed.indexOf(',');
  if (commaIndex === -1) return { city: trimmed, country: '' };
  const city = trimmed.slice(0, commaIndex).trim();
  const country = trimmed.slice(commaIndex + 1).trim();
  return { city, country };
}

/** Format location for the hero badge from “city, country” storage. */
export function formatMetaLocationDisplay(
  label: string,
  content: PortfolioHeroMetaLocationContent = 'country'
): string {
  const { city, country } = parseLocationParts(label);
  if (content === 'city') return city || country || label.trim();
  if (content === 'country') return country || city || label.trim();
  if (!city || !country) return (country || city || label).trim();
  return `${country} / ${city}`;
}

export const PORTFOLIO_HERO_META_BORDER_WIDTH_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Thin' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Bold' },
];

export const PORTFOLIO_HERO_META_INNER_LAYOUT_OPTIONS: {
  value: PortfolioHeroMetaInnerLayout;
  label: string;
  description: string;
}[] = [
  { value: 'stacked', label: 'Stacked', description: 'Icon on top, value, then label — classic layout.' },
  { value: 'inline', label: 'Inline', description: 'Icon beside the value — compact horizontal row.' },
  { value: 'value-first', label: 'Value first', description: 'Number prominent, label below, icon last.' },
  { value: 'icon-bottom', label: 'Icon bottom', description: 'Value and label first, icon anchored below.' },
];

export const PORTFOLIO_HERO_META_PADDING_OPTIONS: {
  value: PortfolioHeroMetaCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Tight', description: 'Compact card — less padding and smaller footprint.' },
  { value: 'standard', label: 'Standard', description: 'Default editorial proportions.' },
  { value: 'relaxed', label: 'Relaxed', description: 'More breathing room inside each card.' },
];

export const PORTFOLIO_HERO_META_VALUE_SIZE_OPTIONS: {
  value: PortfolioHeroMetaValueSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const PORTFOLIO_HERO_META_DISPLAY_OPTIONS: {
  value: PortfolioHeroMetaDisplayDesign;
  label: string;
  description: string;
}[] = [
  { value: 'elevated', label: 'Elevated', description: 'White cards with shadow — current default.' },
  { value: 'flat', label: 'Flat', description: 'Clean white surface, thin border, no shadow.' },
  { value: 'soft', label: 'Soft gray', description: 'Neutral fill — subtle on white.' },
  { value: 'glass', label: 'Glass', description: 'Frosted translucent cards.' },
  { value: 'dark', label: 'Dark', description: 'Surface #17171B + #2A2A30 border — fits dark spit heroes.' },
];

export const PORTFOLIO_HERO_META_PLACEMENT_OPTIONS: {
  value: PortfolioHeroMetaPlacementMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'on-motif',
    label: 'On motif panel',
    description: 'Even row fully on the grey motif — no circle straddling the diagonal.',
  },
  {
    value: 'straddle-bottom',
    label: 'Straddle motif edge',
    description: 'Cards spaced across the motif edge — some may sit across the split.',
  },
  { value: 'free', label: 'Free placement', description: 'Drag the whole row anywhere on the hero.' },
];

export const PORTFOLIO_HERO_META_SPREAD_OPTIONS: {
  value: PortfolioHeroMetaSpread;
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'wide', label: 'Wide' },
];

export const PORTFOLIO_HERO_META_CARDS_ORIENTATION_OPTIONS: {
  value: PortfolioHeroMetaCardsOrientation;
  label: string;
  description: string;
}[] = [
  {
    value: 'horizontal',
    label: 'Horizontal',
    description: 'Stat cards side by side in a row — default.',
  },
  {
    value: 'vertical',
    label: 'Vertical',
    description: 'Stat cards stacked in a column, one under the other.',
  },
];

export const PORTFOLIO_HERO_META_POSITION_PRESETS: {
  id: string;
  label: string;
  position: MetaRowPosition;
}[] = [
  { id: 'motif-panel', label: 'Motif panel', position: { x: 78, y: 86 } },
  { id: 'default', label: 'Motif edge', position: { x: 75, y: 88 } },
  { id: 'center', label: 'Motif center', position: { x: 79, y: 55 } },
  { id: 'lower-right', label: 'Lower right', position: { x: 85, y: 92 } },
  { id: 'upper-right', label: 'Upper right', position: { x: 82, y: 35 } },
];

export function resolveMetaCardAccentColor(
  meta: PortfolioHeroMetaSettings,
  cardId: PortfolioHeroMetaCardId
): string {
  const fallback = isValidProfileHexColor(meta.metaAccentColor)
    ? meta.metaAccentColor.trim()
    : DEFAULT_META_YEARS_ACCENT;
  if (cardId === 'years') {
    return isValidProfileHexColor(meta.metaYearsAccentColor)
      ? meta.metaYearsAccentColor.trim()
      : fallback;
  }
  if (cardId === 'projects') {
    return isValidProfileHexColor(meta.metaProjectsAccentColor)
      ? meta.metaProjectsAccentColor.trim()
      : DEFAULT_META_PROJECTS_ACCENT;
  }
  return isValidProfileHexColor(meta.metaLocationAccentColor)
    ? meta.metaLocationAccentColor.trim()
    : fallback;
}

/** Apply dark spit stats surface / rhythm when display design is Dark. */
export function applyDarkMetaStatSurface(): Partial<PortfolioHeroMetaSettings> {
  return {
    metaDisplayDesign: 'dark',
    metaCardBackgroundColor: DARK_META_CARD_SURFACE,
    metaFrameBorderColor: DARK_META_CARD_BORDER,
    metaFrameBorderWidth: 1,
    metaLabelColor: DARK_META_LABEL_COLOR,
    metaYearsAccentColor: DEFAULT_META_YEARS_ACCENT,
    metaProjectsAccentColor: DEFAULT_META_PROJECTS_ACCENT,
    metaLocationAccentColor: DEFAULT_META_LOCATION_ACCENT,
    metaValueUsesCardAccent: true,
    metaPlacementMode: 'on-motif',
    metaPosition: { x: 78, y: 86 },
    metaSpread: 'compact',
    metaCardGapPx: metaSpreadGapPx('compact'),
  };
}

function clampAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampMetaRowPosition(position: MetaRowPosition): MetaRowPosition {
  return {
    x: clampAxis(position.x, 4, 96),
    y: clampAxis(position.y, 20, 98),
  };
}

/** Wider Y range so top-half visual cells (vertical-copy-bottom) are not crushed to 20%. */
export function clampMetaRowPositionVertical(position: MetaRowPosition): MetaRowPosition {
  return {
    x: clampAxis(position.x, 4, 96),
    y: clampAxis(position.y, 4, 98),
  };
}

export function sanitizeMetaRowPosition(value: unknown, base: MetaRowPosition): MetaRowPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampMetaRowPosition({ x, y });
}

export function metaRowPositionStyle(position: MetaRowPosition): CSSProperties {
  const clamped = clampMetaRowPosition(position);
  return {
    left: `${clamped.x}%`,
    top: `${clamped.y}%`,
    transform: 'translate(-50%, -50%)',
  };
}

/** Pick horizontal vs vertical placement coords for the active screen division. */
export function resolveMetaPositionForDivision(
  meta: {
    metaPosition: MetaRowPosition;
    metaPositionVertical?: MetaRowPosition;
    metaVerticalCell?: HeroVerticalCellPlacement;
  },
  vertical: boolean
): MetaRowPosition {
  if (vertical) {
    const cell =
      meta.metaVerticalCell ??
      (meta.metaPositionVertical
        ? heroVerticalCellFromPosition(meta.metaPositionVertical)
        : DEFAULT_META_VERTICAL_CELL);
    return clampMetaRowPosition(heroVerticalCellToPosition(cell));
  }
  return { ...meta.metaPosition };
}

export function resolveMetaVerticalCell(meta: {
  metaVerticalCell?: HeroVerticalCellPlacement;
  metaPositionVertical?: MetaRowPosition;
}): HeroVerticalCellPlacement {
  if (meta.metaVerticalCell) return meta.metaVerticalCell;
  if (meta.metaPositionVertical) {
    return heroVerticalCellFromPosition(meta.metaPositionVertical);
  }
  return DEFAULT_META_VERTICAL_CELL;
}

export function resolveMetaCardAnchors(
  count: number,
  centerX: number,
  spread: PortfolioHeroMetaSpread
): number[] {
  const gap = spread === 'compact' ? 12 : spread === 'wide' ? 22 : 17;
  if (count <= 1) return [centerX];
  if (count === 2) return [centerX - gap, centerX + gap];
  return [centerX - gap, centerX, centerX + gap];
}

function migrateLegacyFrameStyle(
  legacy: unknown,
  base: PortfolioHeroMetaSettings
): Pick<PortfolioHeroMetaSettings, 'showMetaFrame' | 'metaFrameShape' | 'metaFrameBorderWidth'> {
  if (legacy === 'minimal') {
    return { showMetaFrame: false, metaFrameShape: base.metaFrameShape, metaFrameBorderWidth: 0 };
  }
  if (legacy === 'outline') {
    return { showMetaFrame: true, metaFrameShape: 'rounded', metaFrameBorderWidth: 2 };
  }
  if (legacy === 'rounded-square') {
    return { showMetaFrame: true, metaFrameShape: 'rounded', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  if (legacy === 'square') {
    return { showMetaFrame: true, metaFrameShape: 'square', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  if (legacy === 'pill') {
    return { showMetaFrame: true, metaFrameShape: 'pill', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  if (legacy === 'circle-pill') {
    return { showMetaFrame: true, metaFrameShape: 'circle', metaFrameBorderWidth: base.metaFrameBorderWidth };
  }
  return {
    showMetaFrame: base.showMetaFrame,
    metaFrameShape: base.metaFrameShape,
    metaFrameBorderWidth: base.metaFrameBorderWidth,
  };
}

function isMetaFrameShape(value: unknown): value is PortfolioHeroMetaFrameShape {
  return value === 'circle' || value === 'rounded' || value === 'square' || value === 'pill';
}

function metaCardShapeClass(shape: PortfolioHeroMetaFrameShape): string {
  switch (shape) {
    case 'square':
      return 'rounded-none';
    case 'rounded':
      return 'rounded-2xl';
    case 'pill':
    case 'circle':
      return 'rounded-full';
    default:
      return 'rounded-full';
  }
}

export function resolveMetaCardFrameShape(
  meta: PortfolioHeroMetaSettings,
  cardId: PortfolioHeroMetaCardId
): PortfolioHeroMetaFrameShape {
  if (meta.metaFrameShapeMode === 'uniform') return meta.metaFrameShape;
  if (cardId === 'years') return meta.metaYearsFrameShape;
  if (cardId === 'projects') return meta.metaProjectsFrameShape;
  return meta.metaLocationFrameShape;
}

function metaCardSurfaceClass(displayDesign: PortfolioHeroMetaDisplayDesign): string {
  // Fill color comes from metaCardBackgroundColor (inline). Classes only add depth.
  switch (displayDesign) {
    case 'flat':
      return 'shadow-none ring-0';
    case 'soft':
      return 'shadow-none ring-0';
    case 'glass':
      return 'shadow-md ring-0 backdrop-blur-md';
    case 'dark':
      return 'shadow-lg ring-0';
    default:
      return 'shadow-[0_16px_48px_-20px_rgba(0,0,0,0.35)] ring-0';
  }
}

function metaCardDimensions(
  padding: PortfolioHeroMetaCardPadding,
  isLocation: boolean,
  shape: PortfolioHeroMetaFrameShape
): string {
  // Match years/projects footprint when round so location looks like the other circles.
  const useCompactCircle = isLocation && shape === 'circle';

  if (isLocation && !useCompactCircle) {
    switch (padding) {
      case 'tight':
        return 'h-[4rem] min-w-[5.5rem] shrink-0 px-1.5 sm:h-[5.5rem] sm:min-w-[8rem] sm:px-3';
      case 'relaxed':
        return 'h-[5.25rem] min-w-[7.5rem] shrink-0 px-2.5 sm:h-[7.5rem] sm:min-w-[10.5rem] sm:px-5';
      default:
        return 'h-[4.5rem] min-w-[6.25rem] shrink-0 px-2 sm:h-[6.75rem] sm:min-w-[9.5rem] sm:px-4';
    }
  }

  switch (padding) {
    case 'tight':
      return 'h-[4rem] w-[4rem] shrink-0 px-0.5 sm:h-[5.5rem] sm:w-[5.5rem] sm:px-1';
    case 'relaxed':
      return 'h-[5.25rem] w-[5.25rem] shrink-0 px-1 sm:h-[7.5rem] sm:w-[7.5rem] sm:px-2';
    default:
      return 'h-[4.5rem] w-[4.5rem] shrink-0 px-0.5 sm:h-[6.75rem] sm:w-[6.75rem] sm:px-1';
  }
}

export function metaCardShellClass(
  meta: PortfolioHeroMetaSettings,
  cardId: PortfolioHeroMetaCardId
): string {
  const isLocation = cardId === 'location';
  const frameShape = resolveMetaCardFrameShape(meta, cardId);
  const dimensions = metaCardDimensions(meta.metaCardPadding, isLocation, frameShape);
  const shape = metaCardShapeClass(frameShape);

  if (!meta.showMetaFrame) {
    return `relative flex ${dimensions} flex-col items-center justify-center overflow-visible text-center`;
  }

  const surface = metaCardSurfaceClass(meta.metaDisplayDesign);
  return `relative flex ${dimensions} flex-col items-center justify-center overflow-hidden text-center ${shape} ${surface}`;
}

export function metaCardBorderStyle(meta: PortfolioHeroMetaSettings): CSSProperties | undefined {
  if (!meta.showMetaFrame) return undefined;

  const hasCustomBg =
    typeof meta.metaCardBackgroundColor === 'string' &&
    isValidProfileHexColor(meta.metaCardBackgroundColor);
  const hasCustomBorder =
    typeof meta.metaFrameBorderColor === 'string' && isValidProfileHexColor(meta.metaFrameBorderColor);

  const backgroundColor = hasCustomBg
    ? meta.metaCardBackgroundColor.trim()
    : meta.metaDisplayDesign === 'dark'
      ? DARK_META_CARD_SURFACE
      : meta.metaDisplayDesign === 'soft'
        ? '#f5f5f5'
        : '#ffffff';

  const borderColor = hasCustomBorder
    ? meta.metaFrameBorderColor.trim()
    : meta.metaDisplayDesign === 'dark'
      ? DARK_META_CARD_BORDER
      : '#e5e5e5';

  if (meta.metaFrameBorderWidth <= 0) {
    return {
      backgroundColor,
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'transparent',
    };
  }

  return {
    backgroundColor,
    borderWidth: meta.metaFrameBorderWidth,
    borderStyle: 'solid',
    borderColor,
  };
}

export function metaCardInnerClass(layout: PortfolioHeroMetaInnerLayout): string {
  switch (layout) {
    case 'inline':
      return 'flex flex-row items-center gap-2.5 text-left';
    case 'value-first':
      return 'flex flex-col items-center justify-center gap-0.5';
    case 'icon-bottom':
      return 'flex flex-col items-center justify-center gap-1';
    default:
      return 'flex flex-col items-center justify-center';
  }
}

export function metaValueSizeClass(
  size: PortfolioHeroMetaValueSize,
  isLocation: boolean,
  locationCompact = false
): string {
  if (isLocation && !locationCompact) {
    switch (size) {
      case 'sm':
        return 'text-[10px] leading-snug sm:text-[11px]';
      case 'lg':
        return 'text-sm leading-snug sm:text-base';
      default:
        return 'text-[11px] leading-snug sm:text-xs';
    }
  }

  switch (size) {
    case 'sm':
      return 'text-sm leading-tight sm:text-base';
    case 'lg':
      return 'text-xl leading-tight sm:text-2xl';
    default:
      return 'text-base leading-tight sm:text-lg';
  }
}

export function metaLabelSizeClass(size: PortfolioHeroMetaValueSize): string {
  switch (size) {
    case 'sm':
      return 'text-[7px] sm:text-[8px]';
    case 'lg':
      return 'text-[9px] sm:text-[10px]';
    default:
      return 'text-[8px] sm:text-[9px]';
  }
}

export function metaCardValueClass(displayDesign: PortfolioHeroMetaDisplayDesign): string {
  return displayDesign === 'dark' ? 'text-white' : 'text-neutral-950';
}

export function metaCardLabelClass(displayDesign: PortfolioHeroMetaDisplayDesign): string {
  return displayDesign === 'dark' ? 'text-neutral-400' : 'text-neutral-500';
}

export function metaValueTextStyle(valueColor: string): CSSProperties {
  return isValidProfileHexColor(valueColor) ? { color: valueColor.trim() } : { color: '#171717' };
}

export function metaLabelTextStyle(labelColor: string): CSSProperties {
  return isValidProfileHexColor(labelColor) ? { color: labelColor.trim() } : { color: '#737373' };
}

export function metaCardIconStyle(accentColor: string): CSSProperties | undefined {
  if (!isValidProfileHexColor(accentColor) || accentColor === '#f97316') return undefined;
  return { color: accentColor };
}

export function mergeHeroMetaSettings(
  base: PortfolioHeroMetaSettings,
  patch: unknown
): PortfolioHeroMetaSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const legacyFrame = record.metaFrameStyle;
  const legacyMigration =
    typeof legacyFrame === 'string'
      ? migrateLegacyFrameStyle(legacyFrame, base)
      : {
          showMetaFrame: base.showMetaFrame,
          metaFrameShape: base.metaFrameShape,
          metaFrameBorderWidth: base.metaFrameBorderWidth,
        };

  const metaFrameShape = record.metaFrameShape;
  const metaDisplayDesign = record.metaDisplayDesign;
  const metaPlacementMode = record.metaPlacementMode;
  const metaSpread = record.metaSpread;
  const metaInnerLayout = record.metaInnerLayout;
  const metaCardPadding = record.metaCardPadding;
  const metaValueSize = record.metaValueSize;
  const frameWidth = record.metaFrameBorderWidth;

  const metaAccentColor =
    typeof record.metaAccentColor === 'string' && isValidProfileHexColor(record.metaAccentColor)
      ? record.metaAccentColor.trim()
      : base.metaAccentColor;

  const metaValueColor =
    typeof record.metaValueColor === 'string' && isValidProfileHexColor(record.metaValueColor)
      ? record.metaValueColor.trim()
      : base.metaValueColor;

  const metaLabelColor =
    typeof record.metaLabelColor === 'string' && isValidProfileHexColor(record.metaLabelColor)
      ? record.metaLabelColor.trim()
      : base.metaLabelColor;

  let metaFrameBorderWidth = legacyMigration.metaFrameBorderWidth;
  if (typeof frameWidth === 'number' && frameWidth >= 0 && frameWidth <= 4) {
    metaFrameBorderWidth = frameWidth;
  }

  return {
    showStats:
      typeof record.showStats === 'boolean' ? record.showStats : (base.showStats ?? true),
    showYearsCard:
      typeof record.showYearsCard === 'boolean' ? record.showYearsCard : base.showYearsCard,
    showProjectsCard:
      typeof record.showProjectsCard === 'boolean' ? record.showProjectsCard : base.showProjectsCard,
    showLocationCard:
      typeof record.showLocationCard === 'boolean' ? record.showLocationCard : base.showLocationCard,
    showMetaFrame:
      typeof record.showMetaFrame === 'boolean'
        ? record.showMetaFrame
        : legacyMigration.showMetaFrame,
    metaFrameShapeMode:
      record.metaFrameShapeMode === 'uniform' || record.metaFrameShapeMode === 'per-card'
        ? record.metaFrameShapeMode
        : base.metaFrameShapeMode,
    metaFrameShape: isMetaFrameShape(metaFrameShape)
      ? metaFrameShape
      : legacyMigration.metaFrameShape,
    metaYearsFrameShape: isMetaFrameShape(record.metaYearsFrameShape)
      ? record.metaYearsFrameShape
      : base.metaYearsFrameShape,
    metaProjectsFrameShape: isMetaFrameShape(record.metaProjectsFrameShape)
      ? record.metaProjectsFrameShape
      : base.metaProjectsFrameShape,
    metaLocationFrameShape: isMetaFrameShape(record.metaLocationFrameShape)
      ? record.metaLocationFrameShape
      : base.metaLocationFrameShape,
    metaLocationContent:
      record.metaLocationContent === 'country' ||
      record.metaLocationContent === 'city' ||
      record.metaLocationContent === 'both'
        ? record.metaLocationContent
        : base.metaLocationContent,
    metaFrameBorderWidth,
    metaCardBackgroundColor:
      typeof record.metaCardBackgroundColor === 'string' &&
      isValidProfileHexColor(record.metaCardBackgroundColor)
        ? record.metaCardBackgroundColor.trim()
        : base.metaCardBackgroundColor ?? '#ffffff',
    metaFrameBorderColor:
      typeof record.metaFrameBorderColor === 'string' && isValidProfileHexColor(record.metaFrameBorderColor)
        ? record.metaFrameBorderColor.trim()
        : base.metaFrameBorderColor ?? '#e5e5e5',
    metaDisplayDesign:
      metaDisplayDesign === 'elevated' ||
      metaDisplayDesign === 'flat' ||
      metaDisplayDesign === 'soft' ||
      metaDisplayDesign === 'glass' ||
      metaDisplayDesign === 'dark'
        ? metaDisplayDesign
        : base.metaDisplayDesign,
    metaInnerLayout:
      metaInnerLayout === 'stacked' ||
      metaInnerLayout === 'inline' ||
      metaInnerLayout === 'value-first' ||
      metaInnerLayout === 'icon-bottom'
        ? metaInnerLayout
        : base.metaInnerLayout,
    metaCardPadding:
      metaCardPadding === 'tight' || metaCardPadding === 'standard' || metaCardPadding === 'relaxed'
        ? metaCardPadding
        : base.metaCardPadding,
    metaValueSize:
      metaValueSize === 'sm' || metaValueSize === 'md' || metaValueSize === 'lg'
        ? metaValueSize
        : base.metaValueSize,
    metaShowLabels:
      typeof record.metaShowLabels === 'boolean' ? record.metaShowLabels : base.metaShowLabels,
    metaPlacementMode:
      metaPlacementMode === 'straddle-bottom' ||
      metaPlacementMode === 'on-motif' ||
      metaPlacementMode === 'free'
        ? metaPlacementMode
        : base.metaPlacementMode,
    metaPosition: sanitizeMetaRowPosition(record.metaPosition, base.metaPosition),
    ...(() => {
      const hasExplicitCell = Object.prototype.hasOwnProperty.call(record, 'metaVerticalCell');
      const hasExplicitVerticalPos = Object.prototype.hasOwnProperty.call(
        record,
        'metaPositionVertical'
      );
      if (hasExplicitCell) {
        const metaVerticalCell = sanitizeHeroVerticalCellPlacement(
          record.metaVerticalCell,
          base.metaVerticalCell ?? DEFAULT_META_VERTICAL_CELL
        );
        return {
          metaVerticalCell,
          metaPositionVertical: clampMetaRowPosition(heroVerticalCellToPosition(metaVerticalCell)),
        };
      }
      if (hasExplicitVerticalPos) {
        const metaPositionVertical = sanitizeMetaRowPosition(
          record.metaPositionVertical,
          base.metaPositionVertical ?? DEFAULT_META_ROW_POSITION_VERTICAL
        );
        return {
          metaPositionVertical,
          metaVerticalCell: heroVerticalCellFromPosition(metaPositionVertical),
        };
      }
      const metaVerticalCell = base.metaVerticalCell ?? DEFAULT_META_VERTICAL_CELL;
      return {
        metaVerticalCell,
        metaPositionVertical: sanitizeMetaRowPosition(
          base.metaPositionVertical,
          clampMetaRowPosition(heroVerticalCellToPosition(metaVerticalCell))
        ),
      };
    })(),
    metaSpread:
      metaSpread === 'compact' || metaSpread === 'standard' || metaSpread === 'wide'
        ? metaSpread
        : base.metaSpread,
    metaCardGapPx: sanitizeMetaCardGapPx(
      record.metaCardGapPx,
      base.metaCardGapPx ?? metaSpreadGapPx(base.metaSpread)
    ),
    metaCardsOrientation:
      record.metaCardsOrientation === 'horizontal' || record.metaCardsOrientation === 'vertical'
        ? record.metaCardsOrientation
        : base.metaCardsOrientation ?? 'horizontal',
    metaCardsFillWidth:
      typeof record.metaCardsFillWidth === 'boolean'
        ? record.metaCardsFillWidth
        : base.metaCardsFillWidth ?? false,
    showMetaIcons:
      typeof record.showMetaIcons === 'boolean' ? record.showMetaIcons : base.showMetaIcons,
    showYearsIcon:
      typeof record.showYearsIcon === 'boolean' ? record.showYearsIcon : base.showYearsIcon ?? true,
    showProjectsIcon:
      typeof record.showProjectsIcon === 'boolean'
        ? record.showProjectsIcon
        : base.showProjectsIcon ?? true,
    showLocationIcon:
      typeof record.showLocationIcon === 'boolean'
        ? record.showLocationIcon
        : base.showLocationIcon ?? true,
    showMetaBottomBar:
      typeof record.showMetaBottomBar === 'boolean'
        ? record.showMetaBottomBar
        : base.showMetaBottomBar ?? false,
    metaBottomBarHeightPx: sanitizeMetaBottomBarHeightPx(
      record.metaBottomBarHeightPx,
      base.metaBottomBarHeightPx ?? 3
    ),
    metaBottomBarRadiusPx: sanitizeMetaBottomBarRadiusPx(
      record.metaBottomBarRadiusPx,
      base.metaBottomBarRadiusPx ?? 32
    ),
    metaAccentColor,
    metaYearsAccentColor:
      typeof record.metaYearsAccentColor === 'string' && isValidProfileHexColor(record.metaYearsAccentColor)
        ? record.metaYearsAccentColor.trim()
        : base.metaYearsAccentColor ?? DEFAULT_META_YEARS_ACCENT,
    metaProjectsAccentColor:
      typeof record.metaProjectsAccentColor === 'string' &&
      isValidProfileHexColor(record.metaProjectsAccentColor)
        ? record.metaProjectsAccentColor.trim()
        : base.metaProjectsAccentColor ?? DEFAULT_META_PROJECTS_ACCENT,
    metaLocationAccentColor:
      typeof record.metaLocationAccentColor === 'string' &&
      isValidProfileHexColor(record.metaLocationAccentColor)
        ? record.metaLocationAccentColor.trim()
        : base.metaLocationAccentColor ?? DEFAULT_META_LOCATION_ACCENT,
    metaValueUsesCardAccent:
      typeof record.metaValueUsesCardAccent === 'boolean'
        ? record.metaValueUsesCardAccent
        : base.metaValueUsesCardAccent ?? true,
    metaValueColor,
    metaLabelColor,
    metaValueInterchangeEnabled:
      typeof record.metaValueInterchangeEnabled === 'boolean'
        ? record.metaValueInterchangeEnabled
        : base.metaValueInterchangeEnabled ?? false,
    metaValueInterchangeSeconds: sanitizeMetaValueInterchangeSeconds(
      record.metaValueInterchangeSeconds,
      base.metaValueInterchangeSeconds ?? DEFAULT_META_VALUE_INTERCHANGE_SECONDS
    ),
  };
}
