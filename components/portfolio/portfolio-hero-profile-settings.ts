import type { CSSProperties } from 'react';
import {
  DEFAULT_PORTRAIT_VERTICAL_CELL,
  heroVerticalCellFromPosition,
  heroVerticalCellToPosition,
  sanitizeHeroVerticalCellPlacement,
  type HeroVerticalCellPlacement,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';

export type PortfolioHeroPortraitSize = 'compact' | 'standard' | 'large';

export type PortfolioHeroPortraitRadius = 'square' | 'soft' | 'round' | 'pill';

export type PortfolioHeroCreatorNameSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioHeroCreatorNameFont = 'sans' | 'serif' | 'display';

/** Anchor for name / specialty overlays painted on the photo inside the frame. */
export type PortraitInFrameTextPlacement =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type PortraitInFrameBarEdge = 'top' | 'bottom';

/** Where in-frame captions sit relative to the photo. */
export type PortraitCaptionLayout = 'none' | 'on-photo' | 'mat-footer' | 'mat-header';

export type PortraitObjectFit = 'cover' | 'contain';

/** Content-box X (%) + panel height Y (%) — matches the inset hero portrait layer. */
export type PortraitPosition = { x: number; y: number };

/** Saved fine-tunes for a reusable portrait template. */
export type PortraitDesignOverride = Partial<{
  showPortraitFrame: boolean;
  portraitFrameColor: string;
  portraitFrameWidth: number;
  portraitFrameBorderOpacity: number;
  portraitFrameBackgroundColor: string;
  portraitFrameBackgroundOpacity: number;
  portraitFramePaddingTop: number;
  portraitFramePaddingBottom: number;
  portraitFramePaddingLeft: number;
  portraitFramePaddingRight: number;
  portraitSize: PortfolioHeroPortraitSize;
  portraitSizeScale: number;
  portraitRadius: PortfolioHeroPortraitRadius;
  showCreatorName: boolean;
  creatorNameInFrame: boolean;
  creatorNameFramePlacement: PortraitInFrameTextPlacement;
  showSpecialtyInFrame: boolean;
  specialtyFramePlacement: PortraitInFrameTextPlacement;
  portraitCaptionLayout: PortraitCaptionLayout;
  portraitCaptionBarEnabled: boolean;
  portraitCaptionBarEdge: PortraitInFrameBarEdge;
  portraitCaptionBarColor: string;
  portraitCaptionBarHeight: number;
  portraitCaptionShowDot: boolean;
  portraitSpecialtyUppercase: boolean;
  portraitObjectFit: PortraitObjectFit;
  portraitFocusX: number;
  portraitFocusY: number;
  portraitImageScale: number;
  creatorNameColor: string;
  creatorNameSize: PortfolioHeroCreatorNameSize;
  creatorNameFont: PortfolioHeroCreatorNameFont;
  creatorNameBold: boolean;
  creatorNameUppercase: boolean;
  /** Matches PORTRAIT_DESIGN_FACTORY_REVISION when override is current. */
  factoryRevision?: number;
}>;

export type PortraitDesignOverridesMap = Partial<
  Record<'cinema' | 'signal', PortraitDesignOverride>
>;

export const DEFAULT_PORTRAIT_POSITION: PortraitPosition = { x: 80, y: 44 };

/** Default free placement for vertical (Copy/Visual) screen division — flush under midline. */
export const DEFAULT_PORTRAIT_POSITION_VERTICAL: PortraitPosition = {
  ...heroVerticalCellToPosition(DEFAULT_PORTRAIT_VERTICAL_CELL),
};

export const PORTRAIT_CAPTION_BAR_HEIGHT_MAX = 96;

/** Fine scale on top of Compact / Standard / Large (responsive rem bases). */
export const PORTRAIT_SIZE_SCALE_MIN = 50;
export const PORTRAIT_SIZE_SCALE_MAX = 160;
export const DEFAULT_PORTRAIT_SIZE_SCALE = 100;

export type PortfolioHeroProfileSettings = {
  /** When false, the hero portrait is hidden on mobile and desktop. */
  showPortrait: boolean;
  showPortraitFrame: boolean;
  portraitFrameColor: string;
  portraitFrameWidth: number;
  /** Border opacity 0–100. */
  portraitFrameBorderOpacity: number;
  /** Mat / fill color behind the photo inside the frame. */
  portraitFrameBackgroundColor: string;
  /** Fill opacity 0–100 (0 = transparent mat). */
  portraitFrameBackgroundOpacity: number;
  /** Extra space above the photo inside the frame (px). */
  portraitFramePaddingTop: number;
  /** Extra space below the photo inside the frame (px). */
  portraitFramePaddingBottom: number;
  /** Extra space on the left of the photo inside the frame (px). */
  portraitFramePaddingLeft: number;
  /** Extra space on the right of the photo inside the frame (px). */
  portraitFramePaddingRight: number;
  portraitSize: PortfolioHeroPortraitSize;
  /**
   * Free size multiplier (70–140%) on top of Compact / Standard / Large.
   * Applied via CSS variables so breakpoints stay responsive.
   */
  portraitSizeScale: number;
  portraitRadius: PortfolioHeroPortraitRadius;
  portraitPosition: PortraitPosition;
  /** Free placement when screen division is vertical (top/bottom). Independent from horizontal. */
  portraitPositionVertical: PortraitPosition;
  /** 3×3 cell anchor for vertical division (source of truth over free-drag). */
  portraitVerticalCell: HeroVerticalCellPlacement;
  showCreatorName: boolean;
  /** When true, name sits on the photo inside the frame (hidden below). */
  creatorNameInFrame: boolean;
  creatorNameFramePlacement: PortraitInFrameTextPlacement;
  /** Show profile specialty on the photo inside the frame. */
  showSpecialtyInFrame: boolean;
  specialtyFramePlacement: PortraitInFrameTextPlacement;
  /**
   * on-photo: captions overlay bands above/below the image.
   * mat-footer: captions sit under the photo inside the frame mat (card look).
   * mat-header: specialty band above the photo; name can still overlay the image.
   * none: no caption layout / bands (name below portrait still available separately).
   */
  portraitCaptionLayout: PortraitCaptionLayout;
  /** Optional solid bar behind in-frame captions (top or bottom edge). */
  portraitCaptionBarEnabled: boolean;
  portraitCaptionBarEdge: PortraitInFrameBarEdge;
  portraitCaptionBarColor: string;
  /** Bar thickness in px. */
  portraitCaptionBarHeight: number;
  /** Blinking status dot on the right of the caption plate (same as the availability badge). */
  portraitCaptionShowDot: boolean;
  /** Force specialty text to uppercase (magazine / masthead). */
  portraitSpecialtyUppercase: boolean;
  /** How the photo fills the template window. */
  portraitObjectFit: PortraitObjectFit;
  /** Horizontal focus for object-position (0–100). */
  portraitFocusX: number;
  /** Vertical focus for object-position (0–100). Higher = lower on face crop. */
  portraitFocusY: number;
  /** Extra zoom inside the template window (100–160%). */
  portraitImageScale: number;
  /** Active reusable template id, or null when freestyle. */
  activePortraitDesignId: 'cinema' | 'signal' | null;
  /** Per-template saved fine-tunes. */
  portraitDesignOverrides: PortraitDesignOverridesMap;
  creatorNameColor: string;
  creatorNameSize: PortfolioHeroCreatorNameSize;
  creatorNameFont: PortfolioHeroCreatorNameFont;
};

export const DEFAULT_HERO_PROFILE_SETTINGS: PortfolioHeroProfileSettings = {
  showPortrait: true,
  showPortraitFrame: true,
  /** Matches DEFAULT_HERO_PALETTE.bordure (same token as motif). */
  portraitFrameColor: '#2a2a30',
  portraitFrameWidth: 14,
  portraitFrameBorderOpacity: 100,
  /** Matches DEFAULT_HERO_PALETTE.bordure (mat shares the motif / frame token). */
  portraitFrameBackgroundColor: '#2a2a30',
  portraitFrameBackgroundOpacity: 0,
  portraitFramePaddingTop: 0,
  portraitFramePaddingBottom: 0,
  portraitFramePaddingLeft: 0,
  portraitFramePaddingRight: 0,
  portraitSize: 'standard',
  portraitSizeScale: DEFAULT_PORTRAIT_SIZE_SCALE,
  portraitRadius: 'round',
  portraitPosition: { ...DEFAULT_PORTRAIT_POSITION },
  portraitPositionVertical: {
    ...heroVerticalCellToPosition(DEFAULT_PORTRAIT_VERTICAL_CELL),
  },
  portraitVerticalCell: DEFAULT_PORTRAIT_VERTICAL_CELL,
  showCreatorName: true,
  creatorNameInFrame: false,
  creatorNameFramePlacement: 'bottom-center',
  showSpecialtyInFrame: false,
  specialtyFramePlacement: 'bottom-center',
  portraitCaptionLayout: 'on-photo',
  portraitCaptionBarEnabled: false,
  portraitCaptionBarEdge: 'bottom',
  /** Matches DEFAULT_HERO_PALETTE.bordure (same token as frame / motif). */
  portraitCaptionBarColor: '#2a2a30',
  portraitCaptionBarHeight: 40,
  portraitCaptionShowDot: false,
  portraitSpecialtyUppercase: false,
  portraitObjectFit: 'cover',
  portraitFocusX: 50,
  portraitFocusY: 22,
  portraitImageScale: 100,
  activePortraitDesignId: null,
  portraitDesignOverrides: {},
  creatorNameColor: '#0a0a0a',
  creatorNameSize: 'md',
  creatorNameFont: 'sans',
};

export const PORTFOLIO_HERO_CAPTION_LAYOUT_OPTIONS: {
  value: PortraitCaptionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'none',
    label: 'Hidden',
    description: 'No caption bands around the photo.',
  },
  {
    value: 'on-photo',
    label: 'Split bands',
    description: 'Name/specialty sit in a separate rectangle above or below the image — never over it.',
  },
  {
    value: 'mat-footer',
    label: 'Mat footer',
    description: 'Card style — captions in a bottom rectangle under the photo.',
  },
  {
    value: 'mat-header',
    label: 'Mat header',
    description: 'Specialty band above the photo; name in its own band (usually below).',
  },
];

export const PORTFOLIO_HERO_OBJECT_FIT_OPTIONS: {
  value: PortraitObjectFit;
  label: string;
  description: string;
}[] = [
  {
    value: 'cover',
    label: 'Cover',
    description: 'Fill the template window — crop edges as needed.',
  },
  {
    value: 'contain',
    label: 'Contain',
    description: 'Fit the whole photo inside — may leave mat gaps.',
  },
];

export const PORTFOLIO_HERO_IN_FRAME_TEXT_PLACEMENT_OPTIONS: {
  value: PortraitInFrameTextPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'bottom-left', label: 'Bottom left', description: 'Lower-left corner of the photo.' },
  { value: 'bottom-center', label: 'Bottom center', description: 'Centered along the bottom edge.' },
  { value: 'bottom-right', label: 'Bottom right', description: 'Lower-right corner of the photo.' },
  { value: 'top-left', label: 'Top left', description: 'Upper-left corner of the photo.' },
  { value: 'top-center', label: 'Top center', description: 'Centered along the top edge.' },
  { value: 'top-right', label: 'Top right', description: 'Upper-right corner of the photo.' },
];

export const PORTFOLIO_HERO_IN_FRAME_BAR_EDGE_OPTIONS: {
  value: PortraitInFrameBarEdge;
  label: string;
  description: string;
}[] = [
  { value: 'bottom', label: 'Bottom', description: 'Strip along the lower edge of the photo.' },
  { value: 'top', label: 'Top', description: 'Strip along the upper edge of the photo.' },
];

export const PORTFOLIO_HERO_PORTRAIT_SIZE_OPTIONS: {
  value: PortfolioHeroPortraitSize;
  label: string;
  description: string;
}[] = [
  {
    value: 'compact',
    label: 'Compact',
    description: '~10–13rem — discreet, leaves room for copy.',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: '~15–22rem — balanced editorial default.',
  },
  {
    value: 'large',
    label: 'Large',
    description: '~18–34rem — clearly bigger on desktop.',
  },
];

export const PORTFOLIO_HERO_PORTRAIT_RADIUS_OPTIONS: {
  value: PortfolioHeroPortraitRadius;
  label: string;
  description: string;
}[] = [
  { value: 'square', label: 'Square', description: 'Sharp 0° corners — graphic look.' },
  { value: 'soft', label: 'Soft', description: 'Light rounding (~12px).' },
  { value: 'round', label: 'Round', description: 'Strong rounding (~32px) — default.' },
  { value: 'pill', label: 'Pill', description: 'Fully rounded capsule / oval edges.' },
];

export const PORTFOLIO_HERO_FRAME_WIDTH_OPTIONS: {
  value: number;
  label: string;
}[] = [
  { value: 0, label: 'No border' },
  { value: 4, label: 'Hairline' },
  { value: 6, label: 'Thin' },
  { value: 10, label: 'Medium' },
  { value: 14, label: 'Bold' },
  { value: 20, label: 'Thick' },
  { value: 24, label: 'Heavy' },
];

export const PORTRAIT_FRAME_PADDING_MAX = 48;

function clampUnit(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)));
}

export function clampPortraitFrameOpacity(value: unknown, fallback = 100): number {
  return clampUnit(value, fallback, 0, 100);
}

export function clampPortraitFramePadding(value: unknown, fallback = 0): number {
  return clampUnit(value, fallback, 0, PORTRAIT_FRAME_PADDING_MAX);
}

export function clampPortraitFrameWidth(value: unknown, fallback = 14): number {
  return clampUnit(value, fallback, 0, 24);
}

export function clampPortraitCaptionBarHeight(value: unknown, fallback = 40): number {
  return clampUnit(value, fallback, 4, PORTRAIT_CAPTION_BAR_HEIGHT_MAX);
}

export function clampPortraitFocusAxis(value: unknown, fallback = 50): number {
  return clampUnit(value, fallback, 0, 100);
}

export function clampPortraitImageScale(value: unknown, fallback = 100): number {
  return clampUnit(value, fallback, 100, 160);
}

export function clampPortraitSizeScale(value: unknown, fallback = DEFAULT_PORTRAIT_SIZE_SCALE): number {
  return clampUnit(value, fallback, PORTRAIT_SIZE_SCALE_MIN, PORTRAIT_SIZE_SCALE_MAX);
}

export function isPortraitObjectFit(value: unknown): value is PortraitObjectFit {
  return value === 'cover' || value === 'contain';
}

export function isPortraitDesignId(
  value: unknown
): value is NonNullable<PortfolioHeroProfileSettings['activePortraitDesignId']> {
  return value === 'cinema' || value === 'signal';
}

/** object-fit / object-position / scale for the photo inside a template window. */
export function portraitImageMediaStyle(
  settings: Pick<
    PortfolioHeroProfileSettings,
    'portraitObjectFit' | 'portraitFocusX' | 'portraitFocusY' | 'portraitImageScale'
  >
): CSSProperties {
  const fit = isPortraitObjectFit(settings.portraitObjectFit) ? settings.portraitObjectFit : 'cover';
  const x = clampPortraitFocusAxis(settings.portraitFocusX, 50);
  const y = clampPortraitFocusAxis(settings.portraitFocusY, 22);
  const scale = clampPortraitImageScale(settings.portraitImageScale, 100) / 100;
  return {
    objectFit: fit,
    objectPosition: `${x}% ${y}%`,
    transform: scale === 1 ? undefined : `scale(${scale})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

export function formatPortraitSpecialtyText(
  specialite: string | null | undefined,
  uppercase: boolean
): string {
  const raw = specialite?.trim() ?? '';
  if (!raw) return '';
  return uppercase ? raw.toUpperCase() : raw;
}

export function isPortraitInFrameTextPlacement(value: unknown): value is PortraitInFrameTextPlacement {
  return (
    value === 'bottom-left' ||
    value === 'bottom-center' ||
    value === 'bottom-right' ||
    value === 'top-left' ||
    value === 'top-center' ||
    value === 'top-right'
  );
}

export function isPortraitInFrameBarEdge(value: unknown): value is PortraitInFrameBarEdge {
  return value === 'top' || value === 'bottom';
}

export function isPortraitCaptionLayout(value: unknown): value is PortraitCaptionLayout {
  return (
    value === 'none' ||
    value === 'on-photo' ||
    value === 'mat-footer' ||
    value === 'mat-header'
  );
}

/** Horizontal align for mat-footer captions from placement anchors. */
export function portraitMatFooterAlignClass(placement: PortraitInFrameTextPlacement): string {
  if (placement.endsWith('left')) return 'items-start text-left';
  if (placement.endsWith('right')) return 'items-end text-right';
  return 'items-center text-center';
}

/** Top vs bottom caption band — never overlays the photo. */
export function portraitCaptionBandEdge(
  placement: PortraitInFrameTextPlacement
): 'top' | 'bottom' {
  return placement.startsWith('top') ? 'top' : 'bottom';
}

/**
 * Auto edge for caption rectangles when layout is on-photo or bar-driven.
 * Prefers top when any top-anchored content exists or the bar edge is top.
 */
export function resolvePortraitCaptionAutoEdge(
  settings: Pick<
    PortfolioHeroProfileSettings,
    | 'portraitCaptionLayout'
    | 'portraitCaptionBarEnabled'
    | 'portraitCaptionBarEdge'
    | 'creatorNameFramePlacement'
    | 'specialtyFramePlacement'
    | 'showCreatorName'
    | 'creatorNameInFrame'
    | 'showSpecialtyInFrame'
  >
): 'top' | 'bottom' {
  if (settings.portraitCaptionLayout === 'mat-header') return 'top';
  if (settings.portraitCaptionLayout === 'mat-footer') return 'bottom';
  if (settings.portraitCaptionBarEnabled && settings.portraitCaptionBarEdge === 'top') {
    return 'top';
  }
  if (settings.showCreatorName && settings.creatorNameInFrame) {
    if (portraitCaptionBandEdge(settings.creatorNameFramePlacement) === 'top') return 'top';
  }
  if (settings.showSpecialtyInFrame) {
    if (portraitCaptionBandEdge(settings.specialtyFramePlacement) === 'top') return 'top';
  }
  return 'bottom';
}

/** Absolute flex class for in-frame caption anchors. */
export function portraitInFrameTextPlacementClass(placement: PortraitInFrameTextPlacement): string {
  switch (placement) {
    case 'bottom-left':
      return 'absolute bottom-0 left-0 items-start text-left';
    case 'bottom-center':
      return 'absolute bottom-0 left-1/2 -translate-x-1/2 items-center text-center';
    case 'bottom-right':
      return 'absolute bottom-0 right-0 items-end text-right';
    case 'top-left':
      return 'absolute top-0 left-0 items-start text-left';
    case 'top-center':
      return 'absolute top-0 left-1/2 -translate-x-1/2 items-center text-center';
    case 'top-right':
      return 'absolute top-0 right-0 items-end text-right';
    default:
      return 'absolute bottom-0 left-1/2 -translate-x-1/2 items-center text-center';
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

export function portraitFrameColorWithOpacity(hex: string, opacityPercent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const a = Math.min(1, Math.max(0, opacityPercent / 100));
  if (a >= 1) return hex.startsWith('#') ? hex : `#${hex}`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

/** CSS for the portrait frame shell (border + optional mat + asymmetric padding). */
export function portraitFrameShellStyle(
  settings: Pick<
    PortfolioHeroProfileSettings,
    | 'showPortraitFrame'
    | 'portraitFrameColor'
    | 'portraitFrameWidth'
    | 'portraitFrameBorderOpacity'
    | 'portraitFrameBackgroundColor'
    | 'portraitFrameBackgroundOpacity'
    | 'portraitFramePaddingTop'
    | 'portraitFramePaddingBottom'
    | 'portraitFramePaddingLeft'
    | 'portraitFramePaddingRight'
  >
): CSSProperties | undefined {
  if (!settings.showPortraitFrame) return undefined;

  const width = clampPortraitFrameWidth(settings.portraitFrameWidth, 14);
  const borderOpacity = clampPortraitFrameOpacity(settings.portraitFrameBorderOpacity, 100);
  const bgOpacity = clampPortraitFrameOpacity(settings.portraitFrameBackgroundOpacity, 0);
  const padTop = clampPortraitFramePadding(settings.portraitFramePaddingTop, 0);
  const padBottom = clampPortraitFramePadding(settings.portraitFramePaddingBottom, 0);
  const padLeft = clampPortraitFramePadding(settings.portraitFramePaddingLeft, 0);
  const padRight = clampPortraitFramePadding(settings.portraitFramePaddingRight, 0);
  const borderColor = isValidProfileHexColor(settings.portraitFrameColor)
    ? settings.portraitFrameColor.trim()
    : DEFAULT_HERO_PROFILE_SETTINGS.portraitFrameColor;
  const bgColor = isValidProfileHexColor(settings.portraitFrameBackgroundColor)
    ? settings.portraitFrameBackgroundColor.trim()
    : borderColor;

  const style: CSSProperties = {
    paddingTop: padTop,
    paddingBottom: padBottom,
    paddingLeft: padLeft,
    paddingRight: padRight,
  };

  if (width > 0 && borderOpacity > 0) {
    style.borderWidth = width;
    style.borderStyle = 'solid';
    style.borderColor = portraitFrameColorWithOpacity(borderColor, borderOpacity);
  } else {
    style.borderWidth = 0;
    style.borderStyle = 'solid';
    style.borderColor = 'transparent';
  }

  if (bgOpacity > 0) {
    style.backgroundColor = portraitFrameColorWithOpacity(bgColor, bgOpacity);
  }

  return style;
}

export function portraitFrameHasVisibleChrome(
  settings: Pick<
    PortfolioHeroProfileSettings,
    | 'showPortraitFrame'
    | 'portraitFrameWidth'
    | 'portraitFrameBorderOpacity'
    | 'portraitFrameBackgroundOpacity'
    | 'portraitFramePaddingTop'
    | 'portraitFramePaddingBottom'
    | 'portraitFramePaddingLeft'
    | 'portraitFramePaddingRight'
  >
): boolean {
  if (!settings.showPortraitFrame) return false;
  const width = clampPortraitFrameWidth(settings.portraitFrameWidth, 14);
  const borderOpacity = clampPortraitFrameOpacity(settings.portraitFrameBorderOpacity, 100);
  const bgOpacity = clampPortraitFrameOpacity(settings.portraitFrameBackgroundOpacity, 0);
  const padTop = clampPortraitFramePadding(settings.portraitFramePaddingTop, 0);
  const padBottom = clampPortraitFramePadding(settings.portraitFramePaddingBottom, 0);
  const padLeft = clampPortraitFramePadding(settings.portraitFramePaddingLeft, 0);
  const padRight = clampPortraitFramePadding(settings.portraitFramePaddingRight, 0);
  return (
    (width > 0 && borderOpacity > 0) ||
    bgOpacity > 0 ||
    padTop > 0 ||
    padBottom > 0 ||
    padLeft > 0 ||
    padRight > 0
  );
}

export const PORTFOLIO_HERO_CREATOR_NAME_SIZE_OPTIONS: {
  value: PortfolioHeroCreatorNameSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

export const PORTFOLIO_HERO_CREATOR_NAME_FONT_OPTIONS: {
  value: PortfolioHeroCreatorNameFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Sans', description: 'Clean geometric sans-serif.' },
  { value: 'serif', label: 'Serif', description: 'Playfair Display — editorial.' },
  { value: 'display', label: 'Display caps', description: 'Bold uppercase poster style.' },
];

export const PORTFOLIO_HERO_PORTRAIT_POSITION_PRESETS: {
  id: string;
  label: string;
  position: PortraitPosition;
}[] = [
  { id: 'default', label: 'Default', position: { x: 80, y: 44 } },
  { id: 'center', label: 'Motif center', position: { x: 82, y: 50 } },
  { id: 'upper', label: 'Upper', position: { x: 80, y: 28 } },
  { id: 'lower', label: 'Lower', position: { x: 80, y: 68 } },
  { id: 'left', label: 'Left edge', position: { x: 62, y: 44 } },
  { id: 'right', label: 'Right edge', position: { x: 90, y: 44 } },
];

function clampPortraitAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampPortraitPosition(position: PortraitPosition): PortraitPosition {
  return {
    x: clampPortraitAxis(position.x, 2, 98),
    y: clampPortraitAxis(position.y, 8, 92),
  };
}

export function sanitizePortraitPosition(value: unknown, base: PortraitPosition): PortraitPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampPortraitPosition({ x, y });
}

export function portraitPositionStyle(position: PortraitPosition): CSSProperties {
  const clamped = clampPortraitPosition(position);
  return {
    left: `${clamped.x}%`,
    top: `${clamped.y}%`,
    transform: 'translate(-50%, -50%)',
  };
}

/** Pick horizontal vs vertical placement coords for the active screen division. */
export function resolvePortraitPositionForDivision(
  profile: {
    portraitPosition: PortraitPosition;
    portraitPositionVertical?: PortraitPosition;
    portraitVerticalCell?: HeroVerticalCellPlacement;
  },
  vertical: boolean
): PortraitPosition {
  if (vertical) {
    const cell =
      profile.portraitVerticalCell ??
      (profile.portraitPositionVertical
        ? heroVerticalCellFromPosition(profile.portraitPositionVertical)
        : DEFAULT_PORTRAIT_VERTICAL_CELL);
    return clampPortraitPosition(heroVerticalCellToPosition(cell));
  }
  return { ...profile.portraitPosition };
}

export function resolvePortraitVerticalCell(
  profile: {
    portraitVerticalCell?: HeroVerticalCellPlacement;
    portraitPositionVertical?: PortraitPosition;
  }
): HeroVerticalCellPlacement {
  if (profile.portraitVerticalCell) return profile.portraitVerticalCell;
  if (profile.portraitPositionVertical) {
    return heroVerticalCellFromPosition(profile.portraitPositionVertical);
  }
  return DEFAULT_PORTRAIT_VERTICAL_CELL;
}

export function isValidProfileHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
}

/** Responsive rem bases — Compact / Standard / Large must be clearly distinct. */
const PORTRAIT_SIZE_BASE_REM: Record<
  PortfolioHeroPortraitSize,
  { mobile: number; sm: number; lg: number; xl: number }
> = {
  // Gaps are intentional: Standard ≈ +70% vs Compact, Large ≈ +70% vs Standard (at xl).
  compact: { mobile: 10, sm: 11, lg: 12, xl: 13 },
  standard: { mobile: 15, sm: 17, lg: 19, xl: 22 },
  large: { mobile: 18, sm: 22, lg: 28, xl: 34 },
};

/**
 * No Tailwind max-width utilities here — absolute/shrink-wrap parents make `w-full`
 * + `max-w-*` unreliable. Width is set explicitly via `portraitWrapperSizeStyle`.
 */
export function portraitWrapperSizeClass(_size?: PortfolioHeroPortraitSize): string {
  return 'relative shrink-0';
}

/**
 * Explicit width from preset + fine scale.
 * Uses viewport-relative `min()` so it works inside absolutely positioned heroes
 * (no dependency on a parent with a definite width).
 */
export function portraitWrapperSizeStyle(
  size: PortfolioHeroPortraitSize,
  scalePercent: number = DEFAULT_PORTRAIT_SIZE_SCALE
): CSSProperties {
  const scale = clampPortraitSizeScale(scalePercent) / 100;
  const base = PORTRAIT_SIZE_BASE_REM[size] ?? PORTRAIT_SIZE_BASE_REM.standard;
  // Smooth mobile → desktop growth; caps stay clearly separated per preset.
  const minRem = +(base.mobile * scale).toFixed(2);
  const maxRem = +(base.xl * scale).toFixed(2);
  // Prefer larger growth for Large so it visibly outruns Standard on wide screens.
  const preferred =
    size === 'large'
      ? `calc(${minRem}rem + 12vw)`
      : size === 'compact'
        ? `calc(${minRem}rem + 2vw)`
        : `calc(${minRem}rem + 6vw)`;
  const width = `min(calc(100vw - 2.5rem), clamp(${minRem}rem, ${preferred}, ${maxRem}rem))`;
  return {
    width,
    maxWidth: width,
  };
}

/**
 * CSS fallback before JS measure: keep copy on the left half at xl when a
 * portrait is shown. JS (`useHeroCopyPortraitSafeMaxWidth`) then tightens only
 * when the real portrait box would collide — so wide screens are not wasted.
 */
export function heroCopyPortraitSafeClass(
  size: PortfolioHeroPortraitSize,
  options: { showPortrait: boolean; flipped: boolean }
): string {
  if (!options.showPortrait) {
    return options.flipped ? 'xl:ml-auto xl:max-w-[44rem]' : 'xl:max-w-[44rem]';
  }

  // Soft percentage ceiling at xl; 2xl+ can breathe up to 44rem.
  // Actual collision wrapping is driven by measured portrait edges.
  const tight =
    size === 'large'
      ? 'xl:max-w-[min(44rem,42%)] 2xl:max-w-[min(44rem,48%)]'
      : size === 'compact'
        ? 'xl:max-w-[min(44rem,58%)] 2xl:max-w-[44rem]'
        : 'xl:max-w-[min(44rem,50%)] 2xl:max-w-[min(44rem,54%)]';

  return `${tight} ${options.flipped ? 'xl:ml-auto' : ''}`.trim();
}

export function portraitRadiusClass(radius: PortfolioHeroPortraitRadius): string {
  switch (radius) {
    case 'square':
      return 'rounded-none';
    case 'soft':
      return 'rounded-xl';
    case 'pill':
      return 'rounded-full';
    default:
      return 'rounded-[2rem]';
  }
}

/** Explicit px / full pill — applied inline so it always wins over conflicting classes. */
export function portraitRadiusStyle(radius: PortfolioHeroPortraitRadius): CSSProperties {
  switch (radius) {
    case 'square':
      return { borderRadius: 0 };
    case 'soft':
      return { borderRadius: 12 };
    case 'pill':
      return { borderRadius: 9999 };
    default:
      return { borderRadius: 32 };
  }
}

export function creatorNameSizeClass(size: PortfolioHeroCreatorNameSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-lg sm:text-xl';
    case 'xl':
      return 'text-xl sm:text-2xl';
    default:
      return 'text-base sm:text-lg';
  }
}

export function creatorNameFontClass(font: PortfolioHeroCreatorNameFont): string {
  switch (font) {
    case 'serif':
      return 'font-serif font-semibold tracking-[-0.02em]';
    case 'display':
      return 'font-black uppercase tracking-[0.08em]';
    default:
      return 'font-bold tracking-tight';
  }
}

export function creatorNameFontStyle(font: PortfolioHeroCreatorNameFont): CSSProperties | undefined {
  if (font !== 'serif') return undefined;
  return { fontFamily: "'Playfair Display', serif" };
}

export function mergeHeroProfileSettings(
  base: PortfolioHeroProfileSettings,
  patch: unknown
): PortfolioHeroProfileSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const portraitSize = record.portraitSize;
  const portraitRadius = record.portraitRadius;
  const creatorNameSize = record.creatorNameSize;
  const creatorNameFont = record.creatorNameFont;
  const frameWidth = record.portraitFrameWidth;

  const portraitFrameColor =
    typeof record.portraitFrameColor === 'string' && isValidProfileHexColor(record.portraitFrameColor)
      ? record.portraitFrameColor.trim()
      : base.portraitFrameColor;

  const creatorNameColorRaw =
    typeof record.creatorNameColor === 'string' && isValidProfileHexColor(record.creatorNameColor)
      ? record.creatorNameColor.trim()
      : base.creatorNameColor;
  const nameHex = creatorNameColorRaw.toLowerCase();
  const frameHex = portraitFrameColor.toLowerCase();
  const nameIsWhite = nameHex === '#ffffff' || nameHex === '#fff';
  const frameIsLight =
    frameHex === '#ffffff' ||
    frameHex === '#fff' ||
    frameHex === '#f5f5f5' ||
    frameHex === '#fafafa';
  // Previous editorial factory: white name on white/light frame — migrate to black for contrast.
  // Keep white names on dark frames (e.g. Noir).
  const creatorNameColor = nameIsWhite && frameIsLight ? base.creatorNameColor : creatorNameColorRaw;

  let portraitFrameWidth = clampPortraitFrameWidth(base.portraitFrameWidth, 14);
  if (typeof frameWidth === 'number' && frameWidth >= 0 && frameWidth <= 24) {
    portraitFrameWidth = frameWidth;
  }

  return {
    showPortrait: typeof record.showPortrait === 'boolean' ? record.showPortrait : base.showPortrait,
    showPortraitFrame:
      typeof record.showPortraitFrame === 'boolean' ? record.showPortraitFrame : base.showPortraitFrame,
    portraitFrameColor,
    portraitFrameWidth,
    portraitFrameBorderOpacity: clampPortraitFrameOpacity(
      record.portraitFrameBorderOpacity,
      base.portraitFrameBorderOpacity ?? 100
    ),
    portraitFrameBackgroundColor:
      typeof record.portraitFrameBackgroundColor === 'string' &&
      isValidProfileHexColor(record.portraitFrameBackgroundColor)
        ? record.portraitFrameBackgroundColor.trim()
        : base.portraitFrameBackgroundColor ?? portraitFrameColor,
    portraitFrameBackgroundOpacity: clampPortraitFrameOpacity(
      record.portraitFrameBackgroundOpacity,
      base.portraitFrameBackgroundOpacity ?? 0
    ),
    portraitFramePaddingTop: clampPortraitFramePadding(
      record.portraitFramePaddingTop,
      base.portraitFramePaddingTop ?? 0
    ),
    portraitFramePaddingBottom: clampPortraitFramePadding(
      record.portraitFramePaddingBottom,
      base.portraitFramePaddingBottom ?? 0
    ),
    portraitFramePaddingLeft: clampPortraitFramePadding(
      record.portraitFramePaddingLeft,
      base.portraitFramePaddingLeft ?? 0
    ),
    portraitFramePaddingRight: clampPortraitFramePadding(
      record.portraitFramePaddingRight,
      base.portraitFramePaddingRight ?? 0
    ),
    portraitSize:
      portraitSize === 'compact' || portraitSize === 'standard' || portraitSize === 'large'
        ? portraitSize
        : base.portraitSize,
    portraitSizeScale: clampPortraitSizeScale(
      record.portraitSizeScale,
      base.portraitSizeScale ?? DEFAULT_PORTRAIT_SIZE_SCALE
    ),
    portraitRadius:
      portraitRadius === 'square' ||
      portraitRadius === 'soft' ||
      portraitRadius === 'round' ||
      portraitRadius === 'pill'
        ? portraitRadius
        : base.portraitRadius,
    portraitPosition: sanitizePortraitPosition(record.portraitPosition, base.portraitPosition),
    ...(() => {
      const hasExplicitCell = Object.prototype.hasOwnProperty.call(record, 'portraitVerticalCell');
      const hasExplicitVerticalPos = Object.prototype.hasOwnProperty.call(
        record,
        'portraitPositionVertical'
      );
      if (hasExplicitCell) {
        const portraitVerticalCell = sanitizeHeroVerticalCellPlacement(
          record.portraitVerticalCell,
          base.portraitVerticalCell ?? DEFAULT_PORTRAIT_VERTICAL_CELL
        );
        return {
          portraitVerticalCell,
          portraitPositionVertical: clampPortraitPosition(
            heroVerticalCellToPosition(portraitVerticalCell)
          ),
        };
      }
      if (hasExplicitVerticalPos) {
        const portraitPositionVertical = sanitizePortraitPosition(
          record.portraitPositionVertical,
          base.portraitPositionVertical ?? DEFAULT_PORTRAIT_POSITION_VERTICAL
        );
        return {
          portraitPositionVertical,
          portraitVerticalCell: heroVerticalCellFromPosition(portraitPositionVertical),
        };
      }
      const portraitVerticalCell =
        base.portraitVerticalCell ?? DEFAULT_PORTRAIT_VERTICAL_CELL;
      return {
        portraitVerticalCell,
        portraitPositionVertical: sanitizePortraitPosition(
          base.portraitPositionVertical,
          clampPortraitPosition(heroVerticalCellToPosition(portraitVerticalCell))
        ),
      };
    })(),
    showCreatorName:
      typeof record.showCreatorName === 'boolean' ? record.showCreatorName : base.showCreatorName,
    creatorNameInFrame:
      typeof record.creatorNameInFrame === 'boolean'
        ? record.creatorNameInFrame
        : (base.creatorNameInFrame ?? false),
    creatorNameFramePlacement: isPortraitInFrameTextPlacement(record.creatorNameFramePlacement)
      ? record.creatorNameFramePlacement
      : (base.creatorNameFramePlacement ?? 'bottom-center'),
    showSpecialtyInFrame:
      typeof record.showSpecialtyInFrame === 'boolean'
        ? record.showSpecialtyInFrame
        : (base.showSpecialtyInFrame ?? false),
    specialtyFramePlacement: isPortraitInFrameTextPlacement(record.specialtyFramePlacement)
      ? record.specialtyFramePlacement
      : (base.specialtyFramePlacement ?? 'bottom-center'),
    portraitCaptionLayout: isPortraitCaptionLayout(record.portraitCaptionLayout)
      ? record.portraitCaptionLayout
      : (base.portraitCaptionLayout ?? 'on-photo'),
    portraitCaptionBarEnabled:
      typeof record.portraitCaptionBarEnabled === 'boolean'
        ? record.portraitCaptionBarEnabled
        : (base.portraitCaptionBarEnabled ?? false),
    portraitCaptionBarEdge: isPortraitInFrameBarEdge(record.portraitCaptionBarEdge)
      ? record.portraitCaptionBarEdge
      : (base.portraitCaptionBarEdge ?? 'bottom'),
    portraitCaptionBarColor:
      typeof record.portraitCaptionBarColor === 'string' &&
      isValidProfileHexColor(record.portraitCaptionBarColor)
        ? record.portraitCaptionBarColor.trim()
        : (base.portraitCaptionBarColor ?? DEFAULT_HERO_PROFILE_SETTINGS.portraitCaptionBarColor),
    portraitCaptionBarHeight: clampPortraitCaptionBarHeight(
      record.portraitCaptionBarHeight,
      base.portraitCaptionBarHeight ?? 40
    ),
    portraitCaptionShowDot:
      typeof record.portraitCaptionShowDot === 'boolean'
        ? record.portraitCaptionShowDot
        : (base.portraitCaptionShowDot ?? false),
    portraitSpecialtyUppercase:
      typeof record.portraitSpecialtyUppercase === 'boolean'
        ? record.portraitSpecialtyUppercase
        : (base.portraitSpecialtyUppercase ?? false),
    portraitObjectFit: isPortraitObjectFit(record.portraitObjectFit)
      ? record.portraitObjectFit
      : (base.portraitObjectFit ?? 'cover'),
    portraitFocusX: clampPortraitFocusAxis(
      record.portraitFocusX,
      base.portraitFocusX ?? 50
    ),
    portraitFocusY: clampPortraitFocusAxis(
      record.portraitFocusY,
      base.portraitFocusY ?? 22
    ),
    portraitImageScale: clampPortraitImageScale(
      record.portraitImageScale,
      base.portraitImageScale ?? 100
    ),
    activePortraitDesignId: isPortraitDesignId(record.activePortraitDesignId)
      ? record.activePortraitDesignId
      : record.activePortraitDesignId === null ||
          record.activePortraitDesignId === 'atelier' ||
          record.activePortraitDesignId === 'polaroid' ||
          record.activePortraitDesignId === 'masthead'
        ? null
        : isPortraitDesignId(base.activePortraitDesignId)
          ? base.activePortraitDesignId
          : null,
    portraitDesignOverrides: sanitizePortraitDesignOverrides(
      record.portraitDesignOverrides,
      base.portraitDesignOverrides
    ),
    creatorNameColor,
    creatorNameSize:
      creatorNameSize === 'sm' ||
      creatorNameSize === 'md' ||
      creatorNameSize === 'lg' ||
      creatorNameSize === 'xl'
        ? creatorNameSize
        : base.creatorNameSize,
    creatorNameFont:
      creatorNameFont === 'sans' || creatorNameFont === 'serif' || creatorNameFont === 'display'
        ? creatorNameFont
        : base.creatorNameFont,
  };
}

function sanitizePortraitDesignOverrides(
  value: unknown,
  base: PortraitDesignOverridesMap | undefined
): PortraitDesignOverridesMap {
  const fallback = base ?? {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...fallback };
  const record = value as Record<string, unknown>;
  const next: PortraitDesignOverridesMap = { ...fallback };
  for (const id of ['cinema', 'signal'] as const) {
    const raw = record[id];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    next[id] = { ...(fallback[id] ?? {}), ...(raw as PortraitDesignOverride) };
  }
  return next;
}
