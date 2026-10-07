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
type PortraitDesignOverride = Partial<{
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

const DEFAULT_PORTRAIT_POSITION: PortraitPosition = { x: 80, y: 44 };

/** Default free placement for vertical (Copy/Visual) screen division — flush under midline. */
const DEFAULT_PORTRAIT_POSITION_VERTICAL: PortraitPosition = {
  ...heroVerticalCellToPosition(DEFAULT_PORTRAIT_VERTICAL_CELL),
};

const PORTRAIT_CAPTION_BAR_HEIGHT_MAX = 96;

/** Fine scale on top of Compact / Standard / Large (responsive rem bases). */
const PORTRAIT_SIZE_SCALE_MIN = 50;
const PORTRAIT_SIZE_SCALE_MAX = 160;
const DEFAULT_PORTRAIT_SIZE_SCALE = 100;

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

const PORTRAIT_FRAME_PADDING_MAX = 48;

function clampUnit(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)));
}

function clampPortraitFrameOpacity(value: unknown, fallback = 100): number {
  return clampUnit(value, fallback, 0, 100);
}

function clampPortraitFramePadding(value: unknown, fallback = 0): number {
  return clampUnit(value, fallback, 0, PORTRAIT_FRAME_PADDING_MAX);
}

function clampPortraitFrameWidth(value: unknown, fallback = 14): number {
  return clampUnit(value, fallback, 0, 24);
}

function clampPortraitCaptionBarHeight(value: unknown, fallback = 40): number {
  return clampUnit(value, fallback, 4, PORTRAIT_CAPTION_BAR_HEIGHT_MAX);
}

function clampPortraitFocusAxis(value: unknown, fallback = 50): number {
  return clampUnit(value, fallback, 0, 100);
}

function clampPortraitImageScale(value: unknown, fallback = 100): number {
  return clampUnit(value, fallback, 100, 160);
}

function clampPortraitSizeScale(value: unknown, fallback = DEFAULT_PORTRAIT_SIZE_SCALE): number {
  return clampUnit(value, fallback, PORTRAIT_SIZE_SCALE_MIN, PORTRAIT_SIZE_SCALE_MAX);
}

function isPortraitObjectFit(value: unknown): value is PortraitObjectFit {
  return value === 'cover' || value === 'contain';
}

function isPortraitDesignId(
  value: unknown
): value is NonNullable<PortfolioHeroProfileSettings['activePortraitDesignId']> {
  return value === 'cinema' || value === 'signal';
}

function isPortraitInFrameTextPlacement(value: unknown): value is PortraitInFrameTextPlacement {
  return (
    value === 'bottom-left' ||
    value === 'bottom-center' ||
    value === 'bottom-right' ||
    value === 'top-left' ||
    value === 'top-center' ||
    value === 'top-right'
  );
}

function isPortraitInFrameBarEdge(value: unknown): value is PortraitInFrameBarEdge {
  return value === 'top' || value === 'bottom';
}

function isPortraitCaptionLayout(value: unknown): value is PortraitCaptionLayout {
  return (
    value === 'none' ||
    value === 'on-photo' ||
    value === 'mat-footer' ||
    value === 'mat-header'
  );
}

function clampPortraitAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampPortraitPosition(position: PortraitPosition): PortraitPosition {
  return {
    x: clampPortraitAxis(position.x, 2, 98),
    y: clampPortraitAxis(position.y, 8, 92),
  };
}

function sanitizePortraitPosition(value: unknown, base: PortraitPosition): PortraitPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampPortraitPosition({ x, y });
}

export function isValidProfileHexColor(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim());
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
