import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_META_VERTICAL_CELL,
  heroVerticalCellFromPosition,
  heroVerticalCellToPosition,
  sanitizeHeroVerticalCellPlacement,
  type HeroVerticalCellPlacement,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';

export type PortfolioHeroMetaFrameShape = 'circle' | 'rounded' | 'square' | 'pill';

export type PortfolioHeroMetaFrameShapeMode = 'uniform' | 'per-card';

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

/** Default free placement for vertical (Copy/Visual) screen division — flush under midline. */
const DEFAULT_META_ROW_POSITION_VERTICAL: MetaRowPosition = {
  ...heroVerticalCellToPosition(DEFAULT_META_VERTICAL_CELL),
};
const DEFAULT_META_YEARS_ACCENT = '#ea580c';
const DEFAULT_META_PROJECTS_ACCENT = '#14b8a6';
const DEFAULT_META_LOCATION_ACCENT = '#ea580c';
const META_CARD_GAP_PX_MIN = 0;
const META_CARD_GAP_PX_MAX = 220;
const META_BOTTOM_BAR_HEIGHT_PX_MIN = 1;
const META_BOTTOM_BAR_HEIGHT_PX_MAX = 16;
const META_BOTTOM_BAR_RADIUS_PX_MIN = 0;
const META_BOTTOM_BAR_RADIUS_PX_MAX = 32;
const META_VALUE_INTERCHANGE_SECONDS_MIN = 2;
const META_VALUE_INTERCHANGE_SECONDS_MAX = 12;
const DEFAULT_META_VALUE_INTERCHANGE_SECONDS = 5;

function sanitizeMetaValueInterchangeSeconds(
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

function metaSpreadGapPx(spread: PortfolioHeroMetaSpread): number {
  return spread === 'compact' ? 24 : spread === 'wide' ? 48 : 36;
}

function sanitizeMetaCardGapPx(
  value: unknown,
  fallback: number = metaSpreadGapPx('compact')
): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(META_CARD_GAP_PX_MAX, Math.max(META_CARD_GAP_PX_MIN, Math.round(number)));
}

function sanitizeMetaBottomBarHeightPx(
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

function sanitizeMetaBottomBarRadiusPx(
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

function clampAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampMetaRowPosition(position: MetaRowPosition): MetaRowPosition {
  return {
    x: clampAxis(position.x, 4, 96),
    y: clampAxis(position.y, 20, 98),
  };
}

function sanitizeMetaRowPosition(value: unknown, base: MetaRowPosition): MetaRowPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampMetaRowPosition({ x, y });
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
