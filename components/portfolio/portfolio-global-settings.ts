import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  DEFAULT_HERO_PALETTE,
  HERO_PALETTE_TOKEN_IDS,
  LIGHT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_MOTION_PROFILE,
  DEFAULT_MOTION_TIMING,
  defaultMotionTimingForProfile,
  mergeMotionProfile,
  mergeMotionTiming,
  resolveMotionProfileFromStorage,
  type PortfolioGlobalMotionProfile,
  type PortfolioMotionTiming,
} from '@/components/portfolio/portfolio-motion-settings';
import type { PortfolioNavSectionKey } from '@/components/portfolio/portfolio-nav-items';
import {
  isPortfolioPresenceKind,
  type PortfolioPresenceKind,
} from '@/components/portfolio/portfolio-presence';
import {
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import {
  DEFAULT_LIST_MARKER_COLOR,
  isPortfolioListMarkerSize,
  isPortfolioListMarkerStyle,
  isPortfolioListMarkerWeight,
  clampListMarkerSizePx,
  clampListMarkerWeightAmount,
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  type PortfolioListMarkerSize,
  type PortfolioListMarkerStyle,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';

export type PortfolioGlobalTitleAlignment = 'section' | 'left' | 'center' | 'right';

export type PortfolioGlobalContentWidth = 'standard' | 'wide' | 'full';

export type { PortfolioContentGutter };
export type PortfolioGlobalContentGutter = PortfolioContentGutter;

export type PortfolioGlobalTitleScroll = 'sticky' | 'static';

/** Soft enter/exit for the left title block — Split screen navigation only. */
export type PortfolioGlobalSplitTitleMotion = 'fade' | 'fade-up' | 'fade-scale';

export type { PortfolioGlobalMotionProfile };

export type PortfolioGlobalTitleOrientation = 'horizontal' | 'vertical';

export type PortfolioGlobalTitleOrientationTargets = Record<PortfolioNavSectionKey, boolean>;

export type PortfolioGlobalSectionTitleTopSpacing = 'compact' | 'standard' | 'comfortable' | 'spacious';

export type PortfolioGlobalTypographyScope = 'section' | 'global';

/**
 * Site-wide body / UI typeface for the public portfolio.
 * When {@link PortfolioGlobalSettings.bodyFontForceAll} is true, this typeface
 * overrides every element font (serif / display / hardcoded) without exception.
 */
export type PortfolioGlobalBodyFont =
  | 'aeonik'
  | 'default'
  | 'plusJakarta'
  | 'geist'
  | 'montserrat'
  | 'raleway'
  | 'roboto';

export type PortfolioGlobalHeaderFont =
  | 'aeonik'
  | 'geist'
  | 'sans'
  | 'serif'
  | 'display'
  | 'condensed'
  | 'geometric';

export type PortfolioGlobalTitleSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioGlobalSubtitleSize = 'sm' | 'md' | 'lg';

export type PortfolioGlobalTextDecoration = 'none' | 'underline' | 'highlight';

/** Title font weight when Global title typography is active. */
export type PortfolioGlobalTitleFontWeight = 'simple' | 'semibold' | 'bold';

export type PortfolioGlobalTitleChromePadding = 'none' | 'compact' | 'standard' | 'comfortable';

export type PortfolioGlobalTitleChromeRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type PortfolioGlobalTitleChromeBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export type PortfolioGlobalTitleChrome = {
  scope: PortfolioGlobalTypographyScope;
  backgroundEnabled: boolean;
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: PortfolioGlobalTitleChromeBorderWidth;
  borderRadius: PortfolioGlobalTitleChromeRadius;
  padding: PortfolioGlobalTitleChromePadding;
};

/**
 * Frame around the Split screen left-rail title block
 * (title + description + optional trailing CTA).
 */
export type PortfolioGlobalSplitTitleFrameBorderSides = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

/** Soft outer glow on the frame border (box-shadow). */
export type PortfolioGlobalSplitTitleFrameBorderBlur = 'none' | 'soft' | 'medium' | 'strong';

export type PortfolioGlobalSplitTitleFrame = {
  enabled: boolean;
  backgroundEnabled: boolean;
  backgroundColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: PortfolioGlobalTitleChromeBorderWidth;
  /** Which sides draw a stroke when border is enabled. */
  borderSides: PortfolioGlobalSplitTitleFrameBorderSides;
  /** Soft blurred outer edge (glow), independent of solid sides. */
  borderBlur: PortfolioGlobalSplitTitleFrameBorderBlur;
  /** Second outer border line (doublure). */
  borderDoubleEnabled: boolean;
  borderDoubleColor: string;
  borderDoubleGap: PortfolioGlobalSplitTitleFrameBorderDoubleGap;
  borderRadius: PortfolioGlobalTitleChromeRadius;
  padding: PortfolioGlobalTitleChromePadding;
  /**
   * Nudge the title block left (−) or right (+) inside the split rail (px).
   * Applies even when the decorative frame is off.
   */
  offsetX: number;
};

/** Gap between the main border and the outer doublure. */
export type PortfolioGlobalSplitTitleFrameBorderDoubleGap = 'tight' | 'standard' | 'wide';

/** Where Global title/subtitle text color comes from. */
export type PortfolioGlobalColorSource = 'palette' | 'manual';

export type PortfolioGlobalTitleTypography = {
  scope: PortfolioGlobalTypographyScope;
  font: PortfolioGlobalHeaderFont;
  size: PortfolioGlobalTitleSize;
  /** Font weight — Simple / Semi-bold / Bold. */
  weight: PortfolioGlobalTitleFontWeight;
  color: string;
  /** Palette token vs free hex — default `manual` for backwards compatibility. */
  colorSource: PortfolioGlobalColorSource;
  /** Used when `colorSource` is `palette`. */
  colorToken: HeroPaletteTokenId;
  decoration: PortfolioGlobalTextDecoration;
  highlightColor: string;
  italic: boolean;
  uppercase: boolean;
};

export type PortfolioGlobalSubtitleTypography = {
  scope: PortfolioGlobalTypographyScope;
  font: PortfolioGlobalHeaderFont;
  size: PortfolioGlobalSubtitleSize;
  color: string;
  colorSource: PortfolioGlobalColorSource;
  colorToken: HeroPaletteTokenId;
  decoration: PortfolioGlobalTextDecoration;
  highlightColor: string;
  italic: boolean;
  uppercase: boolean;
};

export type PortfolioGlobalBackgroundImageSize = 'cover' | 'contain' | 'fill';

/** Decorative repeating motif painted above the page fill (branding-style geometry). */
export type PortfolioGlobalBackgroundPattern =
  | 'none'
  | 'arrows'
  | 'cubes'
  | 'hexagons'
  | 'double-hexagon'
  | 'axis-reticle'
  | 'faceted-diamond'
  | 'opposed-triangles'
  | 'asymmetric-grid';

export type PortfolioGlobalBackgroundImagePosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type PortfolioGlobalSettings = {
  backgroundEnabled: boolean;
  backgroundColor: string;
  /** Fixed viewport background image (stays put while scrolling). */
  backgroundImageEnabled: boolean;
  backgroundImageUrl: string;
  /**
   * Shared background image library (max {@link MAX_PORTFOLIO_BACKGROUND_IMAGES}).
   * Global + section pickers select an active URL from this list.
   */
  backgroundImageLibrary: string[];
  backgroundImageSize: PortfolioGlobalBackgroundImageSize;
  backgroundImagePosition: PortfolioGlobalBackgroundImagePosition;
  /** Image layer opacity 0–100. */
  backgroundImageOpacity: number;
  /** Insets from each viewport edge in px (0–240). */
  backgroundImageInsetTop: number;
  backgroundImageInsetRight: number;
  backgroundImageInsetBottom: number;
  backgroundImageInsetLeft: number;
  /** Repeating geometric motif over the page background (any mode). */
  backgroundPattern: PortfolioGlobalBackgroundPattern;
  backgroundPatternColor: string;
  /** Second stroke/fill color used by the duotone geometric patterns. */
  backgroundPatternSecondaryColor: string;
  /** Pattern layer opacity 0–100. */
  backgroundPatternOpacity: number;
  /** Units (tiles) per row. 0 = auto (natural tile size). 1 = single centered unit. */
  backgroundPatternUnitsPerRow: number;
  /**
   * Size of the single centered unit as % of viewport width (only when units per row = 1).
   */
  backgroundPatternUnitSize: number;
  /** Horizontal spacing between units, in tile px. */
  backgroundPatternGapX: number;
  /** Vertical spacing between units, in tile px. */
  backgroundPatternGapY: number;
  /**
   * When true, keep social brands + hardcoded accent utilities monochrome.
   * Set by Noir / Blanc and preserved on duplicates so images/icons don’t flip on edit.
   */
  monochromeUi: boolean;
  /**
   * Site-wide dark / light appearance. Switching selects {@link paletteDark} or
   * {@link paletteLight} of the current {@link paletteFamily} — never swaps families.
   */
  colorMode: 'dark' | 'light';
  /**
   * Which coupled preset pair is active. Light mode only flips dark↔light inside this family.
   * `custom` = user-edited tokens (still a dark/light pair).
   */
  paletteFamily: 'indigo' | 'classic' | 'verdant' | 'vive' | 'safran' | 'citron' | 'rouge' | 'ecarlate' | 'ardoise' | 'custom';
  /**
   * Coupled site palette for dark mode (eight semantic tokens).
   * Edited under Global → Theme; Hero/Nav mirrors are painted from this pair.
   */
  paletteDark: PortfolioHeroPalette;
  /** Coupled site palette for light mode. */
  paletteLight: PortfolioHeroPalette;
  /** Owner-only: Ctrl+, (⌘,) opens portfolio settings. */
  settingsShortcutEnabled: boolean;
  titleAlignment: PortfolioGlobalTitleAlignment;
  titleOrientation: PortfolioGlobalTitleOrientation;
  titleOrientationTargets: PortfolioGlobalTitleOrientationTargets;
  contentWidth: PortfolioGlobalContentWidth;
  /** Left/right page gutters for hero + sections. */
  contentGutter: PortfolioGlobalContentGutter;
  titleScroll: PortfolioGlobalTitleScroll;
  /** Animation for title + description + trailing in Split screen left rail. */
  splitTitleMotion: PortfolioGlobalSplitTitleMotion;
  /** Frame (border / background / padding) around Split screen title block. */
  splitTitleFrame: PortfolioGlobalSplitTitleFrame;
  /** Top padding on right-column sections in Split screen (between content blocks). */
  splitContentTopSpacing: PortfolioGlobalSectionTitleTopSpacing;
  /**
   * Extra pixels added on top of {@link splitContentTopSpacing} in Split screen.
   * Fine-tune the gap between right-column sections (0–200).
   */
  splitContentTopExtraPx: number;
  motionProfile: PortfolioGlobalMotionProfile;
  /** Timing overrides for the active motion profile (delay / duration / stagger / distance). */
  motionTiming: PortfolioMotionTiming;
  /**
   * Default bullet style for Experience / Services task lists when those sections
   * use source = Global.
   */
  taskListBulletStyle: PortfolioListMarkerStyle;
  taskListBulletColor: string;
  taskListBulletSize: PortfolioListMarkerSize;
  taskListBulletSizePx: number;
  taskListBulletWeight: PortfolioListMarkerWeight;
  taskListBulletWeightAmount: number;
  sectionTitleTopSpacing: PortfolioGlobalSectionTitleTopSpacing;
  /**
   * Extra pixels added on top of {@link sectionTitleTopSpacing}.
   * Fine-tune space above every section title (0–200).
   */
  sectionTitleTopExtraPx: number;
  sectionOrder: PortfolioNavSectionKey[];
  /** Session presence type for the public page (About us is business + storefront only). */
  presenceKind: PortfolioPresenceKind | null;
  /**
   * Base typeface for all portfolio text.
   * With {@link bodyFontForceAll}, it wins over every per-element font.
   */
  bodyFont: PortfolioGlobalBodyFont;
  /**
   * When true, force {@link bodyFont} on every text node in the portfolio
   * (titles, cards, hero, footer — no serif/display exceptions).
   */
  bodyFontForceAll: boolean;
  titleTypography: PortfolioGlobalTitleTypography;
  subtitleTypography: PortfolioGlobalSubtitleTypography;
  titleChrome: PortfolioGlobalTitleChrome;
};

/** Partial patch accepted by updateGlobal — nested objects merge deeply via mergeGlobalSettings. */
export type PortfolioGlobalSettingsPatch = Partial<PortfolioGlobalSettings>;

export const DEFAULT_GLOBAL_BACKGROUND_COLOR = '#ffffff';

export const DEFAULT_GLOBAL_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_GLOBAL_SUBTITLE_COLOR = '#737373';
export const DEFAULT_GLOBAL_HIGHLIGHT_COLOR = '#fde68a';

export const DEFAULT_GLOBAL_TITLE_TYPOGRAPHY: PortfolioGlobalTitleTypography = {
  scope: 'section',
  font: 'sans',
  size: 'lg',
  weight: 'bold',
  color: DEFAULT_GLOBAL_TITLE_COLOR,
  colorSource: 'manual',
  colorToken: 'texteFort',
  decoration: 'none',
  highlightColor: DEFAULT_GLOBAL_HIGHLIGHT_COLOR,
  italic: false,
  uppercase: false,
};

export const DEFAULT_GLOBAL_SUBTITLE_TYPOGRAPHY: PortfolioGlobalSubtitleTypography = {
  scope: 'section',
  font: 'sans',
  size: 'md',
  color: DEFAULT_GLOBAL_SUBTITLE_COLOR,
  colorSource: 'manual',
  colorToken: 'texteMuted',
  decoration: 'none',
  highlightColor: '#fef3c7',
  italic: false,
  uppercase: false,
};

export const PORTFOLIO_GLOBAL_COLOR_SOURCE_OPTIONS: {
  value: PortfolioGlobalColorSource;
  label: string;
  description: string;
}[] = [
  {
    value: 'palette',
    label: 'Palette',
    description: 'Bind to a Global theme token.',
  },
  {
    value: 'manual',
    label: 'Manual',
    description: 'Pick a hex color freely.',
  },
];

function isHeroPaletteTokenId(value: unknown): value is HeroPaletteTokenId {
  return typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value);
}

function isPortfolioGlobalColorSource(value: unknown): value is PortfolioGlobalColorSource {
  return value === 'palette' || value === 'manual';
}

/** Active dark/light Global palette without importing portfolio-color-mode (avoids cycles). */
function resolveGlobalActivePalette(
  global: Pick<PortfolioGlobalSettings, 'colorMode' | 'paletteDark' | 'paletteLight'>
): PortfolioHeroPalette {
  const mode = global.colorMode === 'light' ? 'light' : 'dark';
  return mode === 'light'
    ? mergeHeroPalette(LIGHT_HERO_PALETTE, global.paletteLight)
    : mergeHeroPalette(DEFAULT_HERO_PALETTE, global.paletteDark);
}

export function resolveGlobalTypographyTextColor(
  global: PortfolioGlobalSettings,
  kind: 'title' | 'subtitle'
): string {
  const typo = kind === 'title' ? global.titleTypography : global.subtitleTypography;
  const fallback = kind === 'title' ? DEFAULT_GLOBAL_TITLE_COLOR : DEFAULT_GLOBAL_SUBTITLE_COLOR;
  const defaultToken: HeroPaletteTokenId = kind === 'title' ? 'texteFort' : 'texteMuted';
  if (typo.colorSource === 'palette') {
    const token = isHeroPaletteTokenId(typo.colorToken) ? typo.colorToken : defaultToken;
    return resolveHeroPaletteColor(resolveGlobalActivePalette(global), token);
  }
  return sanitizeHex(typo.color, fallback);
}

export const DEFAULT_GLOBAL_TITLE_CHROME: PortfolioGlobalTitleChrome = {
  scope: 'section',
  backgroundEnabled: false,
  backgroundColor: '#f5f5f5',
  borderEnabled: false,
  borderColor: '#d4d4d4',
  borderWidth: 'thin',
  borderRadius: 'md',
  padding: 'none',
};

export const DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES: PortfolioGlobalSplitTitleFrameBorderSides = {
  top: true,
  right: true,
  bottom: true,
  left: true,
};

export const DEFAULT_GLOBAL_SPLIT_TITLE_FRAME: PortfolioGlobalSplitTitleFrame = {
  enabled: false,
  backgroundEnabled: true,
  backgroundColor: '#f5f5f5',
  borderEnabled: true,
  borderColor: '#e5e5e5',
  borderWidth: 'thin',
  borderSides: { ...DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES },
  borderBlur: 'none',
  borderDoubleEnabled: false,
  borderDoubleColor: '#d4d4d4',
  borderDoubleGap: 'standard',
  borderRadius: 'lg',
  padding: 'standard',
  offsetX: 0,
};

export const GLOBAL_SPLIT_TITLE_OFFSET_X_MIN = -80;
export const GLOBAL_SPLIT_TITLE_OFFSET_X_MAX = 80;

export function clampGlobalSplitTitleOffsetX(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(
    Math.min(GLOBAL_SPLIT_TITLE_OFFSET_X_MAX, Math.max(GLOBAL_SPLIT_TITLE_OFFSET_X_MIN, n))
  );
}

export const PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_BLUR_OPTIONS: {
  value: PortfolioGlobalSplitTitleFrameBorderBlur;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Sharp edge only — no outer glow.' },
  { value: 'soft', label: 'Soft', description: 'Light blurred outline around the frame.' },
  { value: 'medium', label: 'Medium', description: 'Clearer soft haze outside the border.' },
  { value: 'strong', label: 'Strong', description: 'Wide diffused glow on the outer edge.' },
];

export const PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_DOUBLE_GAP_OPTIONS: {
  value: PortfolioGlobalSplitTitleFrameBorderDoubleGap;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Tight', description: 'Petit espace entre les deux traits.' },
  { value: 'standard', label: 'Standard', description: 'Espace équilibré entre les deux bordures.' },
  { value: 'wide', label: 'Wide', description: 'Grand espace entre les deux bordures.' },
];

export const PORTFOLIO_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDE_OPTIONS: {
  key: keyof PortfolioGlobalSplitTitleFrameBorderSides;
  label: string;
}[] = [
  { key: 'top', label: 'Top' },
  { key: 'right', label: 'Right' },
  { key: 'bottom', label: 'Bottom' },
  { key: 'left', label: 'Left' },
];

export const DEFAULT_GLOBAL_TITLE_ORIENTATION_TARGETS: PortfolioGlobalTitleOrientationTargets = {
  work: false,
  services: false,
  skills: false,
  about: false,
  aboutUs: false,
  experience: false,
  team: false,
  gallery: false,
  faq: false,
  contact: false,
};

export const DEFAULT_CONTENT_SECTION_ORDER: PortfolioNavSectionKey[] = [
  'work',
  'skills',
  'services',
  'about',
  'aboutUs',
  'experience',
  'team',
  'gallery',
  'faq',
  'contact',
];

const CONTENT_SECTION_ORDER_KEYS = new Set<PortfolioNavSectionKey>([
  ...DEFAULT_CONTENT_SECTION_ORDER,
]);

/** Normalizes stored order: dedupes, drops unknown keys, appends any missing sections. */
export function resolveSectionOrder(order: PortfolioNavSectionKey[] | undefined): PortfolioNavSectionKey[] {
  if (!order?.length) return [...DEFAULT_CONTENT_SECTION_ORDER];

  const seen = new Set<PortfolioNavSectionKey>();
  const next: PortfolioNavSectionKey[] = [];

  for (const key of order) {
    if (!CONTENT_SECTION_ORDER_KEYS.has(key) || seen.has(key)) continue;
    seen.add(key);
    next.push(key);
  }

  for (const key of DEFAULT_CONTENT_SECTION_ORDER) {
    if (seen.has(key)) continue;
    if (key === 'experience') {
      const aboutIdx = next.indexOf('about');
      if (aboutIdx >= 0) {
        next.splice(aboutIdx + 1, 0, 'experience');
      } else {
        next.push('experience');
      }
      seen.add('experience');
      continue;
    }
    // Skills sits above Services by default (tools → offers).
    if (key === 'skills') {
      const servicesIdx = next.indexOf('services');
      if (servicesIdx >= 0) {
        next.splice(servicesIdx, 0, 'skills');
      } else {
        next.push('skills');
      }
      seen.add('skills');
      continue;
    }
    next.push(key);
    seen.add(key);
  }

  return next;
}

export function moveSectionInOrder(
  order: PortfolioNavSectionKey[],
  key: PortfolioNavSectionKey,
  direction: 'up' | 'down'
): PortfolioNavSectionKey[] {
  const resolved = resolveSectionOrder(order);
  const index = resolved.indexOf(key);
  if (index === -1) return resolved;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= resolved.length) return resolved;

  const next = [...resolved];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

export const DEFAULT_GLOBAL_BACKGROUND_IMAGE_OPACITY = 100;
export const DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET = 0;
export const DEFAULT_GLOBAL_BACKGROUND_PATTERN_COLOR = '#a3a3a3';
export const DEFAULT_GLOBAL_BACKGROUND_PATTERN_SECONDARY_COLOR = '#22c48f';
export const DEFAULT_GLOBAL_BACKGROUND_PATTERN_OPACITY = 12;
/** 0 = auto (natural tile size, previous behavior). */
export const DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW = 0;
export const GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW_MAX = 32;
/** Single-unit size (% of viewport width) when units per row = 1. */
export const DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE = 40;
export const GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MIN = 8;
export const GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MAX = 100;
export const DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP = 0;
export const GLOBAL_BACKGROUND_PATTERN_GAP_MAX = 160;
/** Max images stored in the shared portfolio background library. */
export const MAX_PORTFOLIO_BACKGROUND_IMAGES = 5;

export const DEFAULT_GLOBAL_SETTINGS: PortfolioGlobalSettings = {
  backgroundEnabled: false,
  backgroundColor: DEFAULT_GLOBAL_BACKGROUND_COLOR,
  backgroundImageEnabled: false,
  backgroundImageUrl: '',
  backgroundImageLibrary: [],
  backgroundImageSize: 'cover',
  backgroundImagePosition: 'center',
  backgroundImageOpacity: DEFAULT_GLOBAL_BACKGROUND_IMAGE_OPACITY,
  backgroundImageInsetTop: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundImageInsetRight: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundImageInsetBottom: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundImageInsetLeft: DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET,
  backgroundPattern: 'none',
  backgroundPatternColor: DEFAULT_GLOBAL_BACKGROUND_PATTERN_COLOR,
  backgroundPatternSecondaryColor: DEFAULT_GLOBAL_BACKGROUND_PATTERN_SECONDARY_COLOR,
  backgroundPatternOpacity: DEFAULT_GLOBAL_BACKGROUND_PATTERN_OPACITY,
  backgroundPatternUnitsPerRow: DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW,
  backgroundPatternUnitSize: DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE,
  backgroundPatternGapX: DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP,
  backgroundPatternGapY: DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP,
  monochromeUi: false,
  colorMode: 'dark',
  paletteFamily: 'classic',
  paletteDark: { ...DEFAULT_HERO_PALETTE },
  paletteLight: { ...LIGHT_HERO_PALETTE },
  settingsShortcutEnabled: true,
  titleAlignment: 'section',
  titleOrientation: 'horizontal',
  titleOrientationTargets: { ...DEFAULT_GLOBAL_TITLE_ORIENTATION_TARGETS },
  contentWidth: 'full',
  contentGutter: DEFAULT_CONTENT_GUTTER,
  titleScroll: 'sticky',
  splitTitleMotion: 'fade',
  splitTitleFrame: { ...DEFAULT_GLOBAL_SPLIT_TITLE_FRAME },
  splitContentTopSpacing: 'compact',
  splitContentTopExtraPx: 0,
  motionProfile: DEFAULT_MOTION_PROFILE,
  motionTiming: { ...DEFAULT_MOTION_TIMING },
  taskListBulletStyle: 'disc',
  taskListBulletColor: DEFAULT_LIST_MARKER_COLOR,
  taskListBulletSize: 'md',
  taskListBulletSizePx: LIST_MARKER_SIZE_PRESET_PX.md,
  taskListBulletWeight: 'regular',
  taskListBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
  sectionTitleTopSpacing: 'standard',
  sectionTitleTopExtraPx: 0,
  sectionOrder: [...DEFAULT_CONTENT_SECTION_ORDER],
  presenceKind: null,
  bodyFont: 'plusJakarta',
  bodyFontForceAll: true,
  titleTypography: { ...DEFAULT_GLOBAL_TITLE_TYPOGRAPHY },
  subtitleTypography: { ...DEFAULT_GLOBAL_SUBTITLE_TYPOGRAPHY },
  titleChrome: { ...DEFAULT_GLOBAL_TITLE_CHROME },
};

export const PORTFOLIO_GLOBAL_TITLE_ALIGNMENT_OPTIONS: {
  value: PortfolioGlobalTitleAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'section', label: 'Per section', description: 'Each section keeps its own alignment.' },
  { value: 'left', label: 'Left', description: 'Force every section title to the left.' },
  { value: 'center', label: 'Center', description: 'Center every section title.' },
  { value: 'right', label: 'Right', description: 'Align every section title to the right.' },
];

export const PORTFOLIO_GLOBAL_CONTENT_WIDTH_OPTIONS: {
  value: PortfolioGlobalContentWidth;
  label: string;
  description: string;
}[] = [
  {
    value: 'standard',
    label: 'Standard',
    description: 'Caps the column at ~1760px (centered) — roomy editorial width.',
  },
  {
    value: 'wide',
    label: 'Wide',
    description: 'Caps at ~1920px — almost edge-to-edge on large monitors.',
  },
  {
    value: 'full',
    label: 'Full',
    description: 'No max width — only Side margins control the edges.',
  },
];

export const PORTFOLIO_GLOBAL_CONTENT_GUTTER_OPTIONS: {
  value: PortfolioGlobalContentGutter;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No left/right margins — edge to edge.' },
  { value: 'wide', label: 'Wider', description: 'Slightly less margin — content a bit wider.' },
  { value: 'medium', label: 'Medium', description: 'Default Editorial Warm side margins.' },
  { value: 'narrow', label: 'Narrower', description: 'Slightly more margin — content a bit tighter.' },
];

export const PORTFOLIO_GLOBAL_TITLE_SCROLL_OPTIONS: {
  value: PortfolioGlobalTitleScroll;
  label: string;
  description: string;
}[] = [
  {
    value: 'sticky',
    label: 'Sticky pill',
    description: 'Title shrinks into a floating pill at the top-left while scrolling.',
  },
  {
    value: 'static',
    label: 'Simple',
    description: 'No animation — the title scrolls away with the content.',
  },
];

export const PORTFOLIO_GLOBAL_SPLIT_TITLE_MOTION_OPTIONS: {
  value: PortfolioGlobalSplitTitleMotion;
  label: string;
  description: string;
}[] = [
  {
    value: 'fade',
    label: 'Fade',
    description: 'Soft opacity only — the title block dissolves in and out.',
  },
  {
    value: 'fade-up',
    label: 'Fade soft',
    description: 'Same as Fade — appears in place at center with no slide.',
  },
  {
    value: 'fade-scale',
    label: 'Fade scale',
    description: 'Slight scale with fade — polished enter / leave transition.',
  },
];

export function splitTitleMotionClassNames(
  motion: PortfolioGlobalSplitTitleMotion,
  active: boolean
): string {
  const ease = 'duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
  // Titles stay fixed in the left frame — never translate/slide, only fade (or soft scale).
  switch (motion) {
    case 'fade-scale':
      return `transition-[opacity,visibility,transform] ${ease} ${
        active
          ? 'pointer-events-auto visible scale-100 opacity-100'
          : 'pointer-events-none invisible scale-[0.96] opacity-0'
      }`;
    case 'fade-up':
    case 'fade':
    default:
      return `transition-[opacity,visibility] ${ease} ${
        active
          ? 'pointer-events-auto visible opacity-100'
          : 'pointer-events-none invisible opacity-0'
      }`;
  }
}
export const PORTFOLIO_GLOBAL_TITLE_ORIENTATION_OPTIONS: {
  value: PortfolioGlobalTitleOrientation;
  label: string;
  description: string;
}[] = [
  { value: 'horizontal', label: 'Horizontal', description: 'Standard title reading left to right.' },
  { value: 'vertical', label: 'Vertical', description: 'Rotate the title to run down the side rail.' },
];

export const PORTFOLIO_GLOBAL_SECTION_TOP_SPACING_OPTIONS: {
  value: PortfolioGlobalSectionTitleTopSpacing;
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'Compact', description: 'Tighter space above every section title.' },
  { value: 'standard', label: 'Standard', description: 'Default editorial spacing above titles.' },
  { value: 'comfortable', label: 'Comfortable', description: 'More breathing room above titles.' },
  { value: 'spacious', label: 'Spacious', description: 'Maximum space above section titles.' },
];

export const PORTFOLIO_GLOBAL_SPLIT_CONTENT_TOP_SPACING_OPTIONS: {
  value: PortfolioGlobalSectionTitleTopSpacing;
  label: string;
  description: string;
}[] = [
  {
    value: 'compact',
    label: 'Compact',
    description: 'Petit écart entre les blocs de la colonne droite.',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'Écart équilibré au-dessus de chaque bloc.',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'Plus d’air entre les sections en Split screen.',
  },
  {
    value: 'spacious',
    label: 'Spacious',
    description: 'Grand écart entre les blocs de la colonne droite.',
  },
];

export const PORTFOLIO_GLOBAL_TYPOGRAPHY_SCOPE_OPTIONS: {
  value: PortfolioGlobalTypographyScope;
  label: string;
  description: string;
}[] = [
  { value: 'section', label: 'Per section', description: 'Each section keeps its own title or subtitle style.' },
  { value: 'global', label: 'Global', description: 'Apply one shared style to every section.' },
];

export const AEONIK_FONT_FAMILY =
  'var(--font-aeonik), ui-sans-serif, system-ui, sans-serif';

export const GEIST_FONT_FAMILY =
  'var(--font-geist), ui-sans-serif, system-ui, sans-serif';

export const PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS: {
  value: PortfolioGlobalHeaderFont;
  label: string;
  description: string;
  /** Google Font stack already loaded in globals.css / local Aeonik */
  fontFamily: string;
  /** Short sample shown on the settings mockup card. */
  previewText: string;
}[] = [
  {
    value: 'aeonik',
    label: 'Aeonik',
    description: 'Grotesk trial — option portfolio, plus seulement Light / Regular / Bold.',
    fontFamily: AEONIK_FONT_FAMILY,
    previewText: 'Projects',
  },
  {
    value: 'geist',
    label: 'Geist',
    description: 'Police du site — UI moderne, SemiBold réel (600).',
    fontFamily: GEIST_FONT_FAMILY,
    previewText: 'Projects',
  },
  {
    value: 'sans',
    label: 'Montserrat',
    description: 'Modern geometric sans — clean and bold.',
    fontFamily: "'Montserrat', sans-serif",
    previewText: 'PROJECTS',
  },
  {
    value: 'serif',
    label: 'Playfair',
    description: 'Editorial serif — magazine feel.',
    fontFamily: "'Playfair Display', serif",
    previewText: 'Projects',
  },
  {
    value: 'display',
    label: 'Bebas Neue',
    description: 'Poster display caps — strong impact.',
    fontFamily: "'Bebas Neue', sans-serif",
    previewText: 'PROJECTS',
  },
  {
    value: 'condensed',
    label: 'Oswald',
    description: 'Condensed sans — tight and athletic.',
    fontFamily: "'Oswald', sans-serif",
    previewText: 'PROJECTS',
  },
  {
    value: 'geometric',
    label: 'Raleway',
    description: 'Elegant geometric — refined headlines.',
    fontFamily: "'Raleway', sans-serif",
    previewText: 'Projects',
  },
];

export const PORTFOLIO_GLOBAL_BODY_FONT_OPTIONS: {
  value: PortfolioGlobalBodyFont;
  label: string;
  description: string;
  /** Empty only for legacy `default` — resolved to Geist at runtime. */
  fontFamily: string;
  previewText: string;
}[] = [
  {
    value: 'aeonik',
    label: 'Aeonik',
    description: 'Grotesk trial — Light / Regular / Bold uniquement. Peut tout forcer.',
    fontFamily: AEONIK_FONT_FAMILY,
    previewText: 'The quick brown fox',
  },
  {
    value: 'plusJakarta',
    label: 'Plus Jakarta Sans',
    description: 'Google Fonts equivalent to Maison Neue — premium neo-grotesque.',
    fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    previewText: 'The quick brown fox',
  },
  {
    value: 'geist',
    label: 'Geist',
    description: 'Police du site — UI moderne, SemiBold réel (600). Peut tout forcer.',
    fontFamily: GEIST_FONT_FAMILY,
    previewText: 'The quick brown fox',
  },
  {
    value: 'default',
    label: 'Site default (Geist)',
    description: 'Alias historique — même police que Geist.',
    fontFamily: GEIST_FONT_FAMILY,
    previewText: 'The quick brown fox',
  },
  {
    value: 'montserrat',
    label: 'Montserrat',
    description: 'Clean geometric sans — versatile and sharp.',
    fontFamily: "'Montserrat', ui-sans-serif, system-ui, sans-serif",
    previewText: 'The quick brown fox',
  },
  {
    value: 'raleway',
    label: 'Raleway',
    description: 'Elegant geometric — refined body and UI.',
    fontFamily: "'Raleway', ui-sans-serif, system-ui, sans-serif",
    previewText: 'The quick brown fox',
  },
  {
    value: 'roboto',
    label: 'Roboto',
    description: 'Neutral product sans — highly readable.',
    fontFamily: "'Roboto', ui-sans-serif, system-ui, sans-serif",
    previewText: 'The quick brown fox',
  },
];

const GLOBAL_BODY_FONT_VALUES = new Set<PortfolioGlobalBodyFont>(
  PORTFOLIO_GLOBAL_BODY_FONT_OPTIONS.map((option) => option.value)
);

export function isPortfolioGlobalBodyFont(value: unknown): value is PortfolioGlobalBodyFont {
  return typeof value === 'string' && GLOBAL_BODY_FONT_VALUES.has(value as PortfolioGlobalBodyFont);
}

/** Normalize legacy `default` → `geist`. */
export function resolvePortfolioGlobalBodyFont(
  font: PortfolioGlobalBodyFont | undefined
): Exclude<PortfolioGlobalBodyFont, 'default'> {
  if (!font || font === 'default') return 'geist';
  return font;
}

/** Resolved CSS font-family for the portfolio root. */
export function globalBodyFontFamily(
  font: PortfolioGlobalBodyFont | undefined
): string {
  const resolved = resolvePortfolioGlobalBodyFont(font);
  if (resolved === 'geist') return GEIST_FONT_FAMILY;
  const option = PORTFOLIO_GLOBAL_BODY_FONT_OPTIONS.find((item) => item.value === resolved);
  return option?.fontFamily?.trim() || GEIST_FONT_FAMILY;
}

/** Inline style + CSS var override so Tailwind `font-sans` inside the portfolio follows bodyFont. */
export function globalBodyFontRootStyle(
  font: PortfolioGlobalBodyFont | undefined
): CSSProperties {
  const family = globalBodyFontFamily(font);
  const resolved = resolvePortfolioGlobalBodyFont(font);
  const style: CSSProperties = {
    fontFamily: family,
    ['--portfolio-body-font' as string]: family,
  };
  // Remap Tailwind `font-sans` (--font-geist) only when not using the real Geist face,
  // so the site variable on <html> stays intact for the Geist option.
  if (resolved !== 'geist') {
    (style as Record<string, string>)['--font-geist'] = family;
  }
  return style;
}

const GLOBAL_HEADER_FONT_VALUES = new Set<PortfolioGlobalHeaderFont>(
  PORTFOLIO_GLOBAL_HEADER_FONT_OPTIONS.map((option) => option.value)
);

export function isPortfolioGlobalHeaderFont(value: unknown): value is PortfolioGlobalHeaderFont {
  return typeof value === 'string' && GLOBAL_HEADER_FONT_VALUES.has(value as PortfolioGlobalHeaderFont);
}

export const PORTFOLIO_GLOBAL_TITLE_SIZE_OPTIONS: {
  value: PortfolioGlobalTitleSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact section titles.' },
  { value: 'md', label: 'Medium', description: 'Balanced editorial scale.' },
  { value: 'lg', label: 'Large', description: 'Default hero-style headings.' },
  { value: 'xl', label: 'Extra large', description: 'Maximum impact headlines.' },
];

export const PORTFOLIO_GLOBAL_SUBTITLE_SIZE_OPTIONS: {
  value: PortfolioGlobalSubtitleSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Compact descriptive text.' },
  { value: 'md', label: 'Medium', description: 'Default reading size.' },
  { value: 'lg', label: 'Large', description: 'Roomier lead paragraph.' },
];

export const PORTFOLIO_GLOBAL_TEXT_DECORATION_OPTIONS: {
  value: PortfolioGlobalTextDecoration;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Plain text without extra emphasis.' },
  { value: 'underline', label: 'Underline', description: 'Underline the text.' },
  { value: 'highlight', label: 'Highlight', description: 'Marker-style background behind the text.' },
];

export const PORTFOLIO_GLOBAL_TITLE_FONT_WEIGHT_OPTIONS: {
  value: PortfolioGlobalTitleFontWeight;
  label: string;
  description: string;
}[] = [
  { value: 'simple', label: 'Simple', description: 'Regular (400) — lightest title weight.' },
  { value: 'semibold', label: 'Semi-bold', description: 'Semi-bold (600) — clear mid weight.' },
  { value: 'bold', label: 'Bold', description: 'Extra bold (800) — heaviest title weight.' },
];

export const PORTFOLIO_GLOBAL_TITLE_CHROME_PADDING_OPTIONS: {
  value: PortfolioGlobalTitleChromePadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No extra space around the title.' },
  { value: 'compact', label: 'Compact', description: 'Tight padding around the title.' },
  { value: 'standard', label: 'Standard', description: 'Balanced padding.' },
  { value: 'comfortable', label: 'Comfortable', description: 'Roomier padding.' },
];

export const PORTFOLIO_GLOBAL_TITLE_CHROME_RADIUS_OPTIONS: {
  value: PortfolioGlobalTitleChromeRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Square corners.' },
  { value: 'sm', label: 'Small', description: 'Subtle rounding.' },
  { value: 'md', label: 'Medium', description: 'Default rounded corners.' },
  { value: 'lg', label: 'Large', description: 'Softer corners.' },
  { value: 'full', label: 'Pill', description: 'Fully rounded capsule shape.' },
];

export const PORTFOLIO_GLOBAL_TITLE_CHROME_BORDER_WIDTH_OPTIONS: {
  value: PortfolioGlobalTitleChromeBorderWidth;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No border stroke.' },
  { value: 'thin', label: 'Thin', description: '1px border.' },
  { value: 'medium', label: 'Medium', description: '2px border.' },
  { value: 'thick', label: 'Thick', description: '3px border.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

/** Resolves the effective title alignment for a section given the global override. */
export function resolveSectionHeaderAlign(
  global: PortfolioGlobalSettings,
  sectionAlignment: 'left' | 'center'
): { centered: boolean; alignRight: boolean; alwaysCentered: boolean } {
  if (global.titleAlignment === 'section') {
    return {
      centered: sectionAlignment === 'center',
      alignRight: false,
      alwaysCentered: sectionAlignment === 'center',
    };
  }
  const align = global.titleAlignment;
  return {
    centered: align === 'center',
    alignRight: align === 'right',
    alwaysCentered: true,
  };
}

/** Below xl (mobile + tablet): section titles/subtitles are centered; xl+ follows alignment. */
export function sectionHeaderTitleTextAlignClass(centered: boolean, alignRight: boolean): string {
  if (centered) return 'text-center';
  if (alignRight) return 'text-center xl:text-right';
  return 'text-center xl:text-left';
}

export function sectionHeaderSubtitleAlignClass(centered: boolean, alignRight: boolean): string {
  if (centered) return 'mx-auto text-center';
  if (alignRight) return 'mx-auto text-center xl:ml-auto xl:mr-0 xl:text-right';
  return 'mx-auto text-center xl:mx-0 xl:text-left';
}

export function sectionHeaderOuterLayoutClass(centerContent: boolean, rightContent: boolean): string {
  if (centerContent) return 'flex justify-center';
  if (rightContent) return 'flex justify-center xl:justify-end';
  return 'flex justify-center xl:block';
}

export function sectionHeaderTitleWrapClass(
  showPill: boolean,
  centered: boolean,
  alignRight: boolean,
  floatingChromeClass: string
): string {
  const pill = showPill ? floatingChromeClass : '';
  if (centered) return `mx-auto w-fit max-w-full ${pill}`.trim();
  if (alignRight) return `mx-auto w-fit max-w-full xl:ml-auto xl:mr-0 ${pill}`.trim();
  return `mx-auto w-fit max-w-full xl:mx-0 ${pill}`.trim();
}

export function sectionHeaderTrailingLayoutClass(centered: boolean, alignRight: boolean): string {
  if (centered) return 'flex justify-center';
  if (alignRight) return 'flex justify-center xl:justify-end';
  return 'flex justify-center xl:block';
}

/** Resolves vertical orientation for a single section (only when globally enabled and targeted). */
export function resolveSectionTitleOrientation(
  global: PortfolioGlobalSettings,
  section: PortfolioNavSectionKey
): PortfolioGlobalTitleOrientation {
  if (global.titleOrientation !== 'vertical') return 'horizontal';
  return global.titleOrientationTargets[section] ? 'vertical' : 'horizontal';
}

function globalTitleChromePaddingClass(padding: PortfolioGlobalTitleChromePadding): string {
  switch (padding) {
    case 'compact':
      return 'px-2 py-1 sm:px-2.5 sm:py-1.5';
    case 'comfortable':
      return 'px-5 py-3 sm:px-6 sm:py-4';
    case 'standard':
      return 'px-3 py-2 sm:px-4 sm:py-2.5';
    default:
      return '';
  }
}

/** Roomier padding for the Split title block (title + subtitle + CTA). */
function globalSplitTitleFramePaddingClass(padding: PortfolioGlobalTitleChromePadding): string {
  switch (padding) {
    case 'compact':
      return 'px-4 py-4 sm:px-5 sm:py-5';
    case 'comfortable':
      return 'px-8 py-8 sm:px-10 sm:py-10';
    case 'standard':
      return 'px-6 py-6 sm:px-7 sm:py-7';
    default:
      return 'px-5 py-5';
  }
}

function globalTitleChromeRadiusClass(radius: PortfolioGlobalTitleChromeRadius): string {
  switch (radius) {
    case 'sm':
      return 'rounded-md';
    case 'md':
      return 'rounded-xl';
    case 'lg':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return '';
  }
}

function globalTitleChromeBorderWidthClass(width: PortfolioGlobalTitleChromeBorderWidth): string {
  switch (width) {
    case 'thin':
      return 'border';
    case 'medium':
      return 'border-2';
    case 'thick':
      return 'border-[3px]';
    default:
      return '';
  }
}

function globalSplitTitleFrameBorderWidthPx(width: PortfolioGlobalTitleChromeBorderWidth): number {
  switch (width) {
    case 'medium':
      return 2;
    case 'thick':
      return 3;
    case 'thin':
      return 1;
    default:
      return 0;
  }
}

function globalSplitTitleFrameDoubleGapPx(
  gap: PortfolioGlobalSplitTitleFrameBorderDoubleGap
): number {
  switch (gap) {
    case 'tight':
      return 3;
    case 'wide':
      return 8;
    default:
      return 5;
  }
}

function globalSplitTitleFrameBlurGlowBase(hex: string): string {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (full.length !== 6) return '#404040';
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Light borders vanish as glow on white — darken the blur tint.
  return lum > 0.65 ? '#404040' : hex;
}

function globalSplitTitleFrameBlurParams(blur: PortfolioGlobalSplitTitleFrameBorderBlur): {
  blurPx: number;
  offsetPx: number;
  alpha: string;
} | null {
  switch (blur) {
    case 'soft':
      return { blurPx: 14, offsetPx: 4, alpha: '55' };
    case 'medium':
      return { blurPx: 22, offsetPx: 6, alpha: '66' };
    case 'strong':
      return { blurPx: 34, offsetPx: 8, alpha: '7a' };
    default:
      return null;
  }
}

/**
 * Soft outer glow on selected sides only.
 * Applied on the full frame box with negative spread so unselected edges stay clean.
 */
function globalSplitTitleFrameSideBlurShadows(
  sides: PortfolioGlobalSplitTitleFrameBorderSides,
  blur: PortfolioGlobalSplitTitleFrameBorderBlur,
  color: string
): string[] {
  const params = globalSplitTitleFrameBlurParams(blur);
  if (!params) return [];
  const safe = sanitizeHex(color, DEFAULT_GLOBAL_SPLIT_TITLE_FRAME.borderColor);
  const tint = `${globalSplitTitleFrameBlurGlowBase(safe)}${params.alpha}`;
  const { blurPx, offsetPx } = params;
  const spread = -Math.max(blurPx - 2, offsetPx);
  const out: string[] = [];
  if (sides.top) out.push(`0 -${offsetPx}px ${blurPx}px ${spread}px ${tint}`);
  if (sides.right) out.push(`${offsetPx}px 0 ${blurPx}px ${spread}px ${tint}`);
  if (sides.bottom) out.push(`0 ${offsetPx}px ${blurPx}px ${spread}px ${tint}`);
  if (sides.left) out.push(`-${offsetPx}px 0 ${blurPx}px ${spread}px ${tint}`);
  return out;
}

function applySelectedSideBorders(
  style: CSSProperties,
  sides: PortfolioGlobalSplitTitleFrameBorderSides,
  widthPx: number,
  color: string
) {
  if (widthPx <= 0) return;
  style.borderColor = color;
  style.borderStyle = 'solid';
  style.borderTopWidth = sides.top ? widthPx : 0;
  style.borderRightWidth = sides.right ? widthPx : 0;
  style.borderBottomWidth = sides.bottom ? widthPx : 0;
  style.borderLeftWidth = sides.left ? widthPx : 0;
}

function applySelectedSideGapPadding(
  style: CSSProperties,
  sides: PortfolioGlobalSplitTitleFrameBorderSides,
  gapPx: number
) {
  style.paddingTop = sides.top ? gapPx : 0;
  style.paddingRight = sides.right ? gapPx : 0;
  style.paddingBottom = sides.bottom ? gapPx : 0;
  style.paddingLeft = sides.left ? gapPx : 0;
}

function mergeSplitTitleFrameBorderSides(
  base: PortfolioGlobalSplitTitleFrameBorderSides,
  patch: unknown
): PortfolioGlobalSplitTitleFrameBorderSides {
  if (!patch || typeof patch !== 'object') return { ...base };
  const record = patch as Record<string, unknown>;
  return {
    top: typeof record.top === 'boolean' ? record.top : base.top,
    right: typeof record.right === 'boolean' ? record.right : base.right,
    bottom: typeof record.bottom === 'boolean' ? record.bottom : base.bottom,
    left: typeof record.left === 'boolean' ? record.left : base.left,
  };
}

export type ResolvedGlobalTitleChrome = {
  className: string;
  style: CSSProperties;
};

/** Box background, border, and padding around section titles when global chrome is active. */
export function resolveGlobalSectionTitleChrome(
  global: PortfolioGlobalSettings
): ResolvedGlobalTitleChrome {
  const chrome = global.titleChrome;
  if (chrome.scope !== 'global') return { className: '', style: {} };

  const hasChrome =
    chrome.backgroundEnabled ||
    chrome.borderEnabled ||
    chrome.padding !== 'none' ||
    chrome.borderRadius !== 'none';

  if (!hasChrome) return { className: '', style: {} };

  const className = [
    'inline-block w-fit',
    globalTitleChromePaddingClass(chrome.padding),
    globalTitleChromeRadiusClass(chrome.borderRadius),
    chrome.borderEnabled ? globalTitleChromeBorderWidthClass(chrome.borderWidth) : '',
  ]
    .filter(Boolean)
    .join(' ');

  const style: CSSProperties = {};
  if (chrome.backgroundEnabled) {
    style.backgroundColor = sanitizeHex(chrome.backgroundColor, DEFAULT_GLOBAL_TITLE_CHROME.backgroundColor);
  }
  if (chrome.borderEnabled && chrome.borderWidth !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.borderColor, DEFAULT_GLOBAL_TITLE_CHROME.borderColor);
  }

  return { className, style };
}

export type ResolvedGlobalSplitTitleFrame = {
  className: string;
  style: CSSProperties;
  /** Outer doublure shell — borders + gap only on selected sides. */
  shellClassName?: string;
  shellStyle?: CSSProperties;
  /** Horizontal nudge inside the left rail (px). */
  offsetX: number;
};

/** Frame around Split screen title + description + trailing CTA. */
export function resolveGlobalSplitTitleFrame(
  global: PortfolioGlobalSettings
): ResolvedGlobalSplitTitleFrame {
  const frame = {
    ...DEFAULT_GLOBAL_SPLIT_TITLE_FRAME,
    ...(global.splitTitleFrame ?? {}),
    borderSides: {
      ...DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES,
      ...(global.splitTitleFrame?.borderSides ?? {}),
    },
  };
  const offsetX = clampGlobalSplitTitleOffsetX(frame.offsetX, 0);
  if (!frame.enabled) return { className: '', style: {}, offsetX };

  const sides = frame.borderSides;
  const anySide = sides.top || sides.right || sides.bottom || sides.left;
  const widthPx = globalSplitTitleFrameBorderWidthPx(frame.borderWidth);
  const drawMainBorder =
    frame.borderEnabled && frame.borderWidth !== 'none' && anySide && widthPx > 0;
  const hasBlur = frame.borderBlur !== 'none' && anySide;
  const hasDouble = Boolean(frame.borderDoubleEnabled) && anySide;

  const hasVisual =
    frame.backgroundEnabled ||
    drawMainBorder ||
    hasBlur ||
    hasDouble ||
    frame.padding !== 'none' ||
    frame.borderRadius !== 'none';

  if (!hasVisual) return { className: '', style: {}, offsetX };

  const radiusClass = globalTitleChromeRadiusClass(frame.borderRadius);
  const borderColor = sanitizeHex(
    frame.borderColor,
    DEFAULT_GLOBAL_SPLIT_TITLE_FRAME.borderColor
  );
  const doubleColor = sanitizeHex(
    frame.borderDoubleColor,
    DEFAULT_GLOBAL_SPLIT_TITLE_FRAME.borderDoubleColor
  );
  const gapPx = globalSplitTitleFrameDoubleGapPx(frame.borderDoubleGap ?? 'standard');
  const doubleLinePx = Math.max(1, widthPx || 1);

  const className = [
    'relative box-border w-fit max-w-full overflow-visible',
    globalSplitTitleFramePaddingClass(frame.padding),
    radiusClass,
  ]
    .filter(Boolean)
    .join(' ');

  const style: CSSProperties = {};
  if (frame.backgroundEnabled) {
    style.backgroundColor = sanitizeHex(
      frame.backgroundColor,
      DEFAULT_GLOBAL_SPLIT_TITLE_FRAME.backgroundColor
    );
  }

  if (drawMainBorder) {
    applySelectedSideBorders(style, sides, widthPx, borderColor);
  }

  if (hasBlur) {
    const shadows = globalSplitTitleFrameSideBlurShadows(sides, frame.borderBlur, borderColor);
    if (shadows.length > 0) {
      style.boxShadow = shadows.join(', ');
    }
  }

  if (!hasDouble) {
    return { className, style, offsetX };
  }

  const shellStyle: CSSProperties = { overflow: 'visible' };
  applySelectedSideBorders(shellStyle, sides, doubleLinePx, doubleColor);
  applySelectedSideGapPadding(shellStyle, sides, gapPx);

  return {
    className,
    style,
    shellClassName: ['box-border w-fit max-w-full overflow-visible', radiusClass]
      .filter(Boolean)
      .join(' '),
    shellStyle,
    offsetX,
  };
}

export const PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS: {
  value: PortfolioGlobalBackgroundImageSize;
  label: string;
  description: string;
}[] = [
  { value: 'cover', label: 'Cover', description: 'Fill the area — may crop the image.' },
  { value: 'contain', label: 'Contain', description: 'Fit the whole image — may leave gaps.' },
  { value: 'fill', label: 'Stretch', description: 'Stretch to every edge, ignoring aspect ratio.' },
];

export const PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS: {
  value: PortfolioGlobalBackgroundImagePosition;
  label: string;
  description: string;
}[] = [
  { value: 'center', label: 'Center', description: 'Anchor the image in the middle.' },
  { value: 'top', label: 'Top', description: 'Pin to the top edge.' },
  { value: 'bottom', label: 'Bottom', description: 'Pin to the bottom edge.' },
  { value: 'left', label: 'Left', description: 'Pin to the left edge.' },
  { value: 'right', label: 'Right', description: 'Pin to the right edge.' },
  { value: 'top-left', label: 'Top left', description: 'Pin to the top-left corner.' },
  { value: 'top-right', label: 'Top right', description: 'Pin to the top-right corner.' },
  { value: 'bottom-left', label: 'Bottom left', description: 'Pin to the bottom-left corner.' },
  { value: 'bottom-right', label: 'Bottom right', description: 'Pin to the bottom-right corner.' },
];

export const PORTFOLIO_GLOBAL_BACKGROUND_PATTERN_OPTIONS: {
  value: PortfolioGlobalBackgroundPattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No motif — plain page fill only.' },
  { value: 'arrows', label: 'Arrows', description: 'Rounded chevrons drifting diagonally.' },
  { value: 'cubes', label: 'Cubes', description: '3D isometric blocks, branding style.' },
  { value: 'hexagons', label: 'Hexagons', description: 'Honeycomb outline mesh.' },
  {
    value: 'double-hexagon',
    label: 'Double hexagon',
    description: 'Two nested hexagons with a central point.',
  },
  {
    value: 'axis-reticle',
    label: 'Axis reticle',
    description: 'Vertical and horizontal measuring axes around a ring.',
  },
  {
    value: 'faceted-diamond',
    label: 'Faceted diamond',
    description: 'Divided diamond with contrasting facets.',
  },
  {
    value: 'opposed-triangles',
    label: 'Opposed triangles',
    description: 'Two opposing triangles joined at the center.',
  },
  {
    value: 'asymmetric-grid',
    label: 'Asymmetric grid',
    description: 'Irregular grid crossed by a highlighted vertical axis.',
  },
];

export function globalBackgroundPatternUsesSecondaryColor(
  pattern: PortfolioGlobalBackgroundPattern
): boolean {
  return (
    pattern === 'double-hexagon' ||
    pattern === 'axis-reticle' ||
    pattern === 'faceted-diamond' ||
    pattern === 'opposed-triangles' ||
    pattern === 'asymmetric-grid'
  );
}

/** Base unit markup for each motif (inner SVG content + natural size). */
function globalBackgroundPatternUnit(
  pattern: PortfolioGlobalBackgroundPattern,
  color: string,
  secondaryColor: string
): { width: number; height: number; scale: number; content: string } | null {
  switch (pattern) {
    case 'arrows':
      return {
        width: 120,
        height: 120,
        scale: 1,
        content:
          `<g fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">` +
          `<path d="M14 44 L34 24 L54 44"/>` +
          `<path d="M72 102 L92 82 L112 102"/>` +
          `<path d="M76 40 L94 22" opacity="0.55"/>` +
          `<path d="M16 100 L34 82" opacity="0.55"/>` +
          `</g>`,
      };
    case 'cubes':
      return {
        width: 112,
        height: 128,
        scale: 1,
        content:
          `<g fill="${color}">` +
          `<path d="M56 16 L92 37 L56 58 L20 37 Z" opacity="0.85"/>` +
          `<path d="M20 37 L56 58 L56 100 L20 79 Z" opacity="0.5"/>` +
          `<path d="M92 37 L56 58 L56 100 L92 79 Z" opacity="0.28"/>` +
          `</g>`,
      };
    case 'hexagons':
      // Seamless honeycomb outline (Hero Patterns "hexagons" path, scaled 2x).
      return {
        width: 56,
        height: 98,
        scale: 2,
        content:
          `<path fill="${color}" fill-rule="evenodd" d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z"/>`,
      };
    case 'double-hexagon':
      return {
        width: 120,
        height: 120,
        scale: 1,
        content:
          `<g fill="none" stroke-width="2.2" stroke-linejoin="round">` +
          `<path stroke="${color}" d="M60 12 104 37 104 83 60 108 16 83 16 37Z"/>` +
          `<path stroke="${secondaryColor}" d="M60 32 84 46 84 74 60 88 36 74 36 46Z"/>` +
          `<circle cx="60" cy="60" r="4" fill="${color}" stroke="none"/>` +
          `</g>`,
      };
    case 'axis-reticle':
      return {
        width: 140,
        height: 140,
        scale: 1,
        content:
          `<g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="square">` +
          `<path d="M70 10v36M70 94v36M10 70h36M94 70h36"/>` +
          `<path d="M60 10h20M60 130h20M10 60v20M130 60v20"/>` +
          `</g>` +
          `<circle cx="70" cy="70" r="16" fill="none" stroke="${secondaryColor}" stroke-width="2"/>` +
          `<circle cx="70" cy="70" r="4" fill="${color}"/>`,
      };
    case 'faceted-diamond':
      return {
        width: 120,
        height: 120,
        scale: 1,
        content:
          `<g fill="none" stroke-width="2" stroke-linejoin="round">` +
          `<path stroke="${color}" d="M60 12 108 60 60 108 12 60Z"/>` +
          `<path stroke="${secondaryColor}" d="M12 60h96M60 12v96"/>` +
          `<circle cx="60" cy="60" r="4" fill="${color}" stroke="none"/>` +
          `</g>`,
      };
    case 'opposed-triangles':
      return {
        width: 120,
        height: 120,
        scale: 1,
        content:
          `<g fill="none" stroke-width="2.2" stroke-linejoin="round">` +
          `<path stroke="${color}" d="M60 10 104 60H16Z"/>` +
          `<path stroke="${secondaryColor}" d="M16 60h88L60 110Z"/>` +
          `<circle cx="60" cy="60" r="4" fill="${color}" stroke="none"/>` +
          `</g>`,
      };
    case 'asymmetric-grid':
      return {
        width: 140,
        height: 140,
        scale: 1,
        content:
          `<g fill="none" stroke="${color}" stroke-width="1.5" opacity="0.45">` +
          `<path d="M22 42h96M12 62h116M18 86h104M44 20v100M64 28v84M94 18v104"/>` +
          `</g>` +
          `<path d="M70 10v120" stroke="${secondaryColor}" stroke-width="2.5"/>` +
          `<circle cx="70" cy="10" r="4" fill="none" stroke="${secondaryColor}" stroke-width="2"/>` +
          `<circle cx="70" cy="130" r="4" fill="none" stroke="${secondaryColor}" stroke-width="2"/>` +
          `<circle cx="70" cy="72" r="5" fill="${secondaryColor}"/>`,
      };
    default:
      return null;
  }
}

/**
 * Repeating SVG tile for each motif (single-color, opacity applied on the layer).
 * Optional gaps pad the tile around the unit so repeats spread apart.
 */
function globalBackgroundPatternTile(
  pattern: PortfolioGlobalBackgroundPattern,
  color: string,
  secondaryColor: string,
  gapX = 0,
  gapY = 0
): { svg: string; width: number; height: number } | null {
  const unit = globalBackgroundPatternUnit(pattern, color, secondaryColor);
  if (!unit) return null;
  const width = unit.width + Math.max(0, gapX);
  const height = unit.height + Math.max(0, gapY);
  const transforms = [
    `translate(${Math.max(0, gapX) / 2}, ${Math.max(0, gapY) / 2})`,
    unit.scale !== 1 ? `scale(${unit.scale})` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return {
    width,
    height,
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<g transform="${transforms}">${unit.content}</g></svg>`,
  };
}

/** Repeating tile only (no opacity/positioning) — settings-panel swatch previews. */
export function globalBackgroundPatternSwatchStyle(
  pattern: PortfolioGlobalBackgroundPattern,
  color = '#e2572e',
  secondaryColor = '#22c48f'
): CSSProperties | undefined {
  const tile = globalBackgroundPatternTile(pattern, color, secondaryColor);
  if (!tile) return undefined;
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tile.svg)}")`,
    backgroundSize: `${Math.round(tile.width * 0.6)}px ${Math.round(tile.height * 0.6)}px`,
    backgroundRepeat: 'repeat',
  };
}

/** True when a motif should be painted over the page background. */
export function hasGlobalBackgroundPattern(global: PortfolioGlobalSettings): boolean {
  return global.backgroundPattern !== 'none' && global.backgroundPatternOpacity > 0;
}

function sanitizePatternUnitsPerRow(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW_MAX, Math.max(0, Math.round(value)));
}

function sanitizePatternUnitSize(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(
    GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MAX,
    Math.max(GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE_MIN, Math.round(value))
  );
}

function sanitizePatternGapPx(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(GLOBAL_BACKGROUND_PATTERN_GAP_MAX, Math.max(0, Math.round(value)));
}

/** Fixed full-viewport layer with the repeating motif tile. */
export function globalBackgroundPatternStyle(
  global: PortfolioGlobalSettings
): CSSProperties | undefined {
  if (!hasGlobalBackgroundPattern(global)) return undefined;
  const color = sanitizeHex(global.backgroundPatternColor, DEFAULT_GLOBAL_BACKGROUND_PATTERN_COLOR);
  const secondaryColor = sanitizeHex(
    global.backgroundPatternSecondaryColor,
    DEFAULT_GLOBAL_BACKGROUND_PATTERN_SECONDARY_COLOR
  );
  const unitsPerRow = sanitizePatternUnitsPerRow(
    global.backgroundPatternUnitsPerRow,
    DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW
  );
  const isSingleUnit = unitsPerRow === 1;
  const gapX = isSingleUnit
    ? 0
    : sanitizePatternGapPx(global.backgroundPatternGapX, DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP);
  const gapY = isSingleUnit
    ? 0
    : sanitizePatternGapPx(global.backgroundPatternGapY, DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP);
  const tile = globalBackgroundPatternTile(
    global.backgroundPattern,
    color,
    secondaryColor,
    gapX,
    gapY
  );
  if (!tile) return undefined;
  const opacity = sanitizeOpacityPercent(
    global.backgroundPatternOpacity,
    DEFAULT_GLOBAL_BACKGROUND_PATTERN_OPACITY
  );

  /**
   * Units per row:
   * - 0: natural pixel tile size, repeating
   * - 1: single centered unit (no repeat), size = % of viewport width
   * - 2+: each tile spans 100/n % of viewport width, repeating
   */
  if (isSingleUnit) {
    const unitSize = sanitizePatternUnitSize(
      global.backgroundPatternUnitSize,
      DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE
    );
    return {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tile.svg)}")`,
      backgroundSize: `${unitSize}% auto`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      opacity: opacity / 100,
    };
  }

  const backgroundSize =
    unitsPerRow > 0
      ? `${(100 / unitsPerRow).toFixed(4)}% auto`
      : `${tile.width}px ${tile.height}px`;
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(tile.svg)}")`,
    backgroundSize,
    backgroundRepeat: 'repeat',
    opacity: opacity / 100,
  };
}

function sanitizeBackgroundImageUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
  } catch {
    return '';
  }
  return '';
}

/** Normalize + dedupe + cap the shared background image library. */
export function normalizeBackgroundImageLibrary(
  value: unknown,
  seedUrl = ''
): string[] {
  const fromArray = Array.isArray(value)
    ? value
        .map((item) => sanitizeBackgroundImageUrl(item))
        .filter(Boolean)
    : [];
  const seed = sanitizeBackgroundImageUrl(seedUrl);
  const merged = seed ? [seed, ...fromArray.filter((url) => url !== seed)] : fromArray;
  const unique: string[] = [];
  for (const url of merged) {
    if (!unique.includes(url)) unique.push(url);
    if (unique.length >= MAX_PORTFOLIO_BACKGROUND_IMAGES) break;
  }
  return unique;
}

/** Prepend an uploaded URL; drops the oldest entry when over the max. */
export function addBackgroundImageToLibrary(library: string[], url: string): string[] {
  const clean = sanitizeBackgroundImageUrl(url);
  if (!clean) return normalizeBackgroundImageLibrary(library);
  return normalizeBackgroundImageLibrary([clean, ...library]);
}

export function removeBackgroundImageFromLibrary(library: string[], url: string): string[] {
  const clean = sanitizeBackgroundImageUrl(url);
  if (!clean) return normalizeBackgroundImageLibrary(library);
  return normalizeBackgroundImageLibrary(library.filter((item) => item !== clean));
}

function sanitizeInsetPx(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(240, Math.max(0, Math.round(value)));
}

function sanitizeOpacityPercent(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function backgroundImagePositionCss(position: PortfolioGlobalBackgroundImagePosition): string {
  switch (position) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    case 'left':
      return 'left center';
    case 'right':
      return 'right center';
    case 'top-left':
      return 'left top';
    case 'top-right':
      return 'right top';
    case 'bottom-left':
      return 'left bottom';
    case 'bottom-right':
      return 'right bottom';
    default:
      return 'center center';
  }
}

function backgroundImageSizeCss(size: PortfolioGlobalBackgroundImageSize): string {
  switch (size) {
    case 'contain':
      return 'contain';
    case 'fill':
      return '100% 100%';
    default:
      return 'cover';
  }
}

/** Active fixed wallpaper (image wins over solid when both flags are somehow set). */
export function hasActiveGlobalBackgroundImage(global: PortfolioGlobalSettings): boolean {
  return (
    global.backgroundImageEnabled && Boolean(sanitizeBackgroundImageUrl(global.backgroundImageUrl))
  );
}

/** True when a solid color or fixed image should replace default white page chrome. */
export function hasGlobalPageBackground(global: PortfolioGlobalSettings): boolean {
  return hasGlobalSolidBackground(global) || hasActiveGlobalBackgroundImage(global);
}

/**
 * Solid page color only — mutually exclusive with the fixed image.
 * Sections without their own fill stay transparent so this color shows through;
 * an enabled per-section background paints on top for that section only.
 */
export function hasGlobalSolidBackground(global: PortfolioGlobalSettings): boolean {
  return global.backgroundEnabled && !hasActiveGlobalBackgroundImage(global);
}

export function globalBackgroundStyle(global: PortfolioGlobalSettings): CSSProperties | undefined {
  if (!hasGlobalSolidBackground(global)) return undefined;
  return { backgroundColor: sanitizeHex(global.backgroundColor, DEFAULT_GLOBAL_BACKGROUND_COLOR) };
}

/** Fixed layer style for the viewport background image (insets from all sides). */
export function globalFixedBackgroundImageStyle(
  global: PortfolioGlobalSettings
): CSSProperties | undefined {
  // Never stack image under/over solid — solid mode suppresses the wallpaper.
  if (hasGlobalSolidBackground(global)) return undefined;
  if (!global.backgroundImageEnabled) return undefined;
  const url = sanitizeBackgroundImageUrl(global.backgroundImageUrl);
  if (!url) return undefined;

  const opacity = sanitizeOpacityPercent(
    global.backgroundImageOpacity,
    DEFAULT_GLOBAL_BACKGROUND_IMAGE_OPACITY
  );

  return {
    top: `max(${sanitizeInsetPx(global.backgroundImageInsetTop, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET)}px, env(safe-area-inset-top, 0px))`,
    right: `max(${sanitizeInsetPx(global.backgroundImageInsetRight, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET)}px, env(safe-area-inset-right, 0px))`,
    bottom: `max(${sanitizeInsetPx(global.backgroundImageInsetBottom, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET)}px, env(safe-area-inset-bottom, 0px))`,
    left: `max(${sanitizeInsetPx(global.backgroundImageInsetLeft, DEFAULT_GLOBAL_BACKGROUND_IMAGE_INSET)}px, env(safe-area-inset-left, 0px))`,
    backgroundImage: `url(${JSON.stringify(url)})`,
    backgroundSize: backgroundImageSizeCss(global.backgroundImageSize),
    backgroundPosition: backgroundImagePositionCss(global.backgroundImagePosition),
    backgroundRepeat: 'no-repeat',
    opacity: opacity / 100,
  };
}

/**
 * Max width of the editorial content column (centered with mx-auto).
 * Standard was previously undefined — so Standard looked identical to Full.
 */
export function globalContentWidthClass(width: PortfolioGlobalContentWidth): string {
  switch (width) {
    case 'wide':
      return 'max-w-[120rem]';
    case 'full':
      return 'max-w-none';
    default:
      // Standard: near full on large monitors (was 90rem / 1440px — left huge side voids).
      return 'max-w-[110rem]';
  }
}

/** Uniform padding-top above section titles (Portfolio → Footer).
 *  Grows with the measured top-nav clearance so titles clear a fixed top bar
 *  without a separate empty white slab above the section.
 *  Uses CSS var `--pf-section-title-pt-extra` so a manual px slider can add on top.
 *  Class names must be full static strings so Tailwind JIT keeps them. */
export function globalSectionTitleTopClass(
  spacing: PortfolioGlobalSectionTitleTopSpacing
): string {
  switch (spacing) {
    case 'compact':
      return 'pt-[calc(max(2rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] sm:pt-[calc(max(2.5rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] lg:pt-[calc(max(3rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
    case 'comfortable':
      return 'pt-[calc(max(4rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] sm:pt-[calc(max(5rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] lg:pt-[calc(max(6rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
    case 'spacious':
      return 'pt-[calc(max(5rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] sm:pt-[calc(max(7rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] lg:pt-[calc(max(9rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
    default:
      return 'pt-[calc(max(3rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] sm:pt-[calc(max(4rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] lg:pt-[calc(max(5rem,var(--portfolio-nav-top-clearance,0px))+var(--pf-section-title-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
  }
}

export const GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MIN = 0;
export const GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MAX = 200;

export function clampGlobalSectionTitleTopExtraPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(
    Math.min(
      GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MAX,
      Math.max(GLOBAL_SECTION_TITLE_TOP_EXTRA_PX_MIN, n)
    )
  );
}

export function globalSectionTitleTopExtraStyle(extraPx: number): CSSProperties {
  return {
    ['--pf-section-title-pt-extra' as string]: `${clampGlobalSectionTitleTopExtraPx(extraPx, 0)}px`,
  };
}

export const GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MIN = 0;
export const GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MAX = 200;

export function clampGlobalSplitContentTopExtraPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(
    Math.min(
      GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MAX,
      Math.max(GLOBAL_SPLIT_CONTENT_TOP_EXTRA_PX_MIN, n)
    )
  );
}

/**
 * Split screen right column — top padding between content sections.
 * No nav clearance baked in (titles live on the left rail).
 * Uses CSS var `--pf-split-pt-extra` so a manual px slider can add on top.
 * Full class strings must stay static for Tailwind JIT.
 */
export function globalSplitContentTopClass(
  spacing: PortfolioGlobalSectionTitleTopSpacing
): string {
  switch (spacing) {
    case 'compact':
      return 'pt-[calc(2.5rem+var(--pf-split-pt-extra,0px))] sm:pt-[calc(3rem+var(--pf-split-pt-extra,0px))] lg:pt-[calc(3.5rem+var(--pf-split-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
    case 'comfortable':
      return 'pt-[calc(5rem+var(--pf-split-pt-extra,0px))] sm:pt-[calc(7rem+var(--pf-split-pt-extra,0px))] lg:pt-[calc(8rem+var(--pf-split-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
    case 'spacious':
      return 'pt-[calc(7rem+var(--pf-split-pt-extra,0px))] sm:pt-[calc(9.5rem+var(--pf-split-pt-extra,0px))] lg:pt-[calc(11rem+var(--pf-split-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
    default:
      return 'pt-[calc(3.5rem+var(--pf-split-pt-extra,0px))] sm:pt-[calc(4.5rem+var(--pf-split-pt-extra,0px))] lg:pt-[calc(5.5rem+var(--pf-split-pt-extra,0px))] transition-[padding-top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';
  }
}

export function globalSplitContentTopExtraStyle(extraPx: number): CSSProperties {
  return {
    ['--pf-split-pt-extra' as string]: `${clampGlobalSplitContentTopExtraPx(extraPx, 0)}px`,
  };
}

function globalHeaderFontClass(font: PortfolioGlobalHeaderFont, kind: 'title' | 'subtitle'): string {
  if (kind === 'title') {
    // Weight is applied separately via {@link globalTitleFontWeightClass}.
    switch (font) {
      case 'aeonik':
      case 'geist':
        return 'tracking-[-0.03em]';
      case 'serif':
        return 'tracking-[-0.03em]';
      case 'display':
        return 'uppercase tracking-[0.06em]';
      case 'condensed':
        return 'uppercase tracking-[0.04em]';
      case 'geometric':
        return 'tracking-[-0.02em]';
      default:
        return 'tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'aeonik':
    case 'geist':
      return 'leading-relaxed';
    case 'serif':
      return 'leading-relaxed';
    case 'display':
      return 'font-normal uppercase tracking-[0.12em]';
    case 'condensed':
      return 'font-semibold uppercase tracking-[0.08em]';
    case 'geometric':
      return 'font-medium leading-relaxed';
    default:
      return 'leading-relaxed';
  }
}

export function globalTitleFontWeightClass(weight: PortfolioGlobalTitleFontWeight): string {
  switch (weight) {
    case 'simple':
      return 'font-normal';
    case 'semibold':
      return 'font-semibold';
    default:
      // Extra-bold so Semi-bold (600) and Bold read clearly apart.
      return 'font-extrabold';
  }
}

export function globalTitleFontWeightValue(weight: PortfolioGlobalTitleFontWeight): number {
  switch (weight) {
    case 'simple':
      return 400;
    case 'semibold':
      return 600;
    default:
      return 800;
  }
}

function globalHeaderFontStyle(_font: PortfolioGlobalHeaderFont): CSSProperties | undefined {
  // Font family is controlled only by Global → Police principale (forced site-wide).
  return undefined;
}

function globalTitleSizeClass(size: PortfolioGlobalTitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl lg:text-5xl lg:leading-[0.95]';
    case 'md':
      return 'text-4xl sm:text-5xl lg:text-6xl lg:leading-[0.95]';
    case 'xl':
      // Cap below lg so chrome + gutters don’t overflow phones/tablets.
      return 'text-4xl sm:text-5xl lg:text-8xl lg:leading-[0.92]';
    default:
      return 'text-4xl sm:text-5xl lg:text-7xl lg:leading-[0.95]';
  }
}

/** Title sizes capped for the narrow (~40%) split-screen left rail. */
export function globalSplitRailTitleSizeClass(size: PortfolioGlobalTitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-2xl sm:text-3xl lg:text-4xl lg:leading-[0.95]';
    case 'md':
      return 'text-3xl sm:text-4xl lg:text-5xl lg:leading-[0.95]';
    case 'xl':
      return 'text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[0.92]';
    default:
      return 'text-3xl sm:text-4xl lg:text-5xl lg:leading-[0.95]';
  }
}

function globalSubtitleSizeClass(size: PortfolioGlobalSubtitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-lg sm:text-xl';
    default:
      return 'text-base sm:text-lg';
  }
}

/** Subtitle sizes capped for the split-screen left rail. */
export function globalSplitRailSubtitleSizeClass(size: PortfolioGlobalSubtitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-xs sm:text-sm';
    case 'lg':
      return 'text-base sm:text-lg';
    default:
      return 'text-sm sm:text-base';
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const trimmed = hex.trim();
  const short = /^#([0-9A-Fa-f]{3})$/.exec(trimmed);
  const long = /^#([0-9A-Fa-f]{6})$/.exec(trimmed);
  const h = short ? short[1].split('').map((c) => c + c).join('') : long ? long[1] : null;
  if (!h) return `rgba(253, 230, 138, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function globalTextDecorationStyle(
  decoration: PortfolioGlobalTextDecoration,
  highlightColor: string
): CSSProperties {
  switch (decoration) {
    case 'underline':
      return {
        textDecoration: 'underline',
        textDecorationThickness: '2px',
        textUnderlineOffset: '0.18em',
      };
    case 'highlight':
      return {
        display: 'inline',
        backgroundImage: `linear-gradient(transparent 58%, ${hexToRgba(highlightColor, 0.55)} 58%)`,
        backgroundRepeat: 'no-repeat',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        padding: '0 0.08em',
        margin: '0 -0.08em',
      };
    default:
      return {};
  }
}

export type ResolvedGlobalHeaderTypography = {
  className: string;
  style: CSSProperties;
  /** Applied to an inline span wrapping the text so highlight/underline hug the glyphs. */
  decorationStyle: CSSProperties;
  customSizing: boolean;
};

export type GlobalSectionTypographyContext = {
  /** Narrow split-screen left rail — uses capped sizes that fit ~40% column width. */
  splitRail?: boolean;
};

export function resolveGlobalSectionTitleTypography(
  global: PortfolioGlobalSettings,
  section: {
    fontClass: string;
    fontStyle?: CSSProperties;
    colorStyle?: CSSProperties;
  },
  context: GlobalSectionTypographyContext = {}
): ResolvedGlobalHeaderTypography {
  if (global.titleTypography.scope === 'section') {
    return {
      className: section.fontClass,
      style: { ...section.fontStyle, ...section.colorStyle },
      decorationStyle: {},
      customSizing: false,
    };
  }

  const typo = global.titleTypography;
  const sizeClass = context.splitRail
    ? globalSplitRailTitleSizeClass(typo.size)
    : globalTitleSizeClass(typo.size);
  const className = [
    globalHeaderFontClass(typo.font, 'title'),
    globalTitleFontWeightClass(typo.weight ?? 'bold'),
    sizeClass,
    typo.italic ? 'italic' : '',
    typo.uppercase && typo.font !== 'display' ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    className,
    style: {
      ...globalHeaderFontStyle(typo.font),
      color: resolveGlobalTypographyTextColor(global, 'title'),
      fontWeight: globalTitleFontWeightValue(typo.weight ?? 'bold'),
    },
    decorationStyle: globalTextDecorationStyle(typo.decoration, typo.highlightColor),
    customSizing: true,
  };
}

export function resolveGlobalSectionSubtitleTypography(
  global: PortfolioGlobalSettings,
  section: {
    fontClass: string;
    fontStyle?: CSSProperties;
    colorStyle?: CSSProperties;
  },
  context: GlobalSectionTypographyContext = {}
): ResolvedGlobalHeaderTypography {
  if (global.subtitleTypography.scope === 'section') {
    return {
      className: section.fontClass,
      style: { ...section.fontStyle, ...section.colorStyle },
      decorationStyle: {},
      customSizing: false,
    };
  }

  const typo = global.subtitleTypography;
  const sizeClass = context.splitRail
    ? globalSplitRailSubtitleSizeClass(typo.size)
    : globalSubtitleSizeClass(typo.size);
  const className = [
    globalHeaderFontClass(typo.font, 'subtitle'),
    sizeClass,
    typo.italic ? 'italic' : '',
    typo.uppercase && typo.font !== 'display' ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    className,
    style: {
      ...globalHeaderFontStyle(typo.font),
      color: resolveGlobalTypographyTextColor(global, 'subtitle'),
    },
    decorationStyle: globalTextDecorationStyle(typo.decoration, typo.highlightColor),
    customSizing: true,
  };
}

function mergeTitleTypography(
  base: PortfolioGlobalTitleTypography,
  patch: unknown
): PortfolioGlobalTitleTypography {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const scope = record.scope;
  const font = record.font;
  const size = record.size;
  const decoration = record.decoration;
  const weight = record.weight;

  return {
    scope: scope === 'section' || scope === 'global' ? scope : base.scope,
    font: isPortfolioGlobalHeaderFont(font) ? font : base.font,
    size: size === 'sm' || size === 'md' || size === 'lg' || size === 'xl' ? size : base.size,
    weight:
      weight === 'simple' || weight === 'semibold' || weight === 'bold'
        ? weight
        : (base.weight ?? 'bold'),
    color: sanitizeHex(record.color, base.color),
    colorSource: isPortfolioGlobalColorSource(record.colorSource)
      ? record.colorSource
      : base.colorSource,
    colorToken: isHeroPaletteTokenId(record.colorToken) ? record.colorToken : base.colorToken,
    decoration:
      decoration === 'none' || decoration === 'underline' || decoration === 'highlight'
        ? decoration
        : base.decoration,
    highlightColor: sanitizeHex(record.highlightColor, base.highlightColor),
    italic: typeof record.italic === 'boolean' ? record.italic : base.italic,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : base.uppercase,
  };
}

function mergeSubtitleTypography(
  base: PortfolioGlobalSubtitleTypography,
  patch: unknown
): PortfolioGlobalSubtitleTypography {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const scope = record.scope;
  const font = record.font;
  const size = record.size;
  const decoration = record.decoration;

  return {
    scope: scope === 'section' || scope === 'global' ? scope : base.scope,
    font: isPortfolioGlobalHeaderFont(font) ? font : base.font,
    size: size === 'sm' || size === 'md' || size === 'lg' ? size : base.size,
    color: sanitizeHex(record.color, base.color),
    colorSource: isPortfolioGlobalColorSource(record.colorSource)
      ? record.colorSource
      : base.colorSource,
    colorToken: isHeroPaletteTokenId(record.colorToken) ? record.colorToken : base.colorToken,
    decoration:
      decoration === 'none' || decoration === 'underline' || decoration === 'highlight'
        ? decoration
        : base.decoration,
    highlightColor: sanitizeHex(record.highlightColor, base.highlightColor),
    italic: typeof record.italic === 'boolean' ? record.italic : base.italic,
    uppercase: typeof record.uppercase === 'boolean' ? record.uppercase : base.uppercase,
  };
}

const ORIENTATION_TARGET_KEYS: PortfolioNavSectionKey[] = [...DEFAULT_CONTENT_SECTION_ORDER];

function mergeSectionOrder(base: PortfolioNavSectionKey[], patch: unknown): PortfolioNavSectionKey[] {
  if (!Array.isArray(patch)) return resolveSectionOrder(base);
  return resolveSectionOrder(patch as PortfolioNavSectionKey[]);
}

function mergeTitleOrientationTargets(
  base: PortfolioGlobalTitleOrientationTargets,
  patch: unknown
): PortfolioGlobalTitleOrientationTargets {
  if (!patch || typeof patch !== 'object') return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const key of ORIENTATION_TARGET_KEYS) {
    if (typeof record[key] === 'boolean') next[key] = record[key];
  }
  return next;
}

function mergeTitleChrome(
  base: PortfolioGlobalTitleChrome,
  patch: unknown
): PortfolioGlobalTitleChrome {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const scope = record.scope;
  const borderWidth = record.borderWidth;
  const borderRadius = record.borderRadius;
  const padding = record.padding;

  return {
    scope: scope === 'section' || scope === 'global' ? scope : base.scope,
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    borderEnabled: typeof record.borderEnabled === 'boolean' ? record.borderEnabled : base.borderEnabled,
    borderColor: sanitizeHex(record.borderColor, base.borderColor),
    borderWidth:
      borderWidth === 'none' ||
      borderWidth === 'thin' ||
      borderWidth === 'medium' ||
      borderWidth === 'thick'
        ? borderWidth
        : base.borderWidth,
    borderRadius:
      borderRadius === 'none' ||
      borderRadius === 'sm' ||
      borderRadius === 'md' ||
      borderRadius === 'lg' ||
      borderRadius === 'full'
        ? borderRadius
        : base.borderRadius,
    padding:
      padding === 'none' ||
      padding === 'compact' ||
      padding === 'standard' ||
      padding === 'comfortable'
        ? padding
        : base.padding,
  };
}

function mergeSplitTitleFrame(
  base: PortfolioGlobalSplitTitleFrame,
  patch: unknown
): PortfolioGlobalSplitTitleFrame {
  if (!patch || typeof patch !== 'object') {
    return {
      ...base,
      borderSides: { ...(base.borderSides ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES) },
    };
  }
  const record = patch as Record<string, unknown>;
  const borderWidth = record.borderWidth;
  const borderRadius = record.borderRadius;
  const padding = record.padding;
  const borderBlur = record.borderBlur;
  const borderDoubleGap = record.borderDoubleGap;

  return {
    enabled: typeof record.enabled === 'boolean' ? record.enabled : base.enabled,
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    borderEnabled: typeof record.borderEnabled === 'boolean' ? record.borderEnabled : base.borderEnabled,
    borderColor: sanitizeHex(record.borderColor, base.borderColor),
    borderWidth:
      borderWidth === 'none' ||
      borderWidth === 'thin' ||
      borderWidth === 'medium' ||
      borderWidth === 'thick'
        ? borderWidth
        : base.borderWidth,
    borderSides: mergeSplitTitleFrameBorderSides(
      base.borderSides ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME_BORDER_SIDES,
      record.borderSides
    ),
    borderBlur:
      borderBlur === 'none' ||
      borderBlur === 'soft' ||
      borderBlur === 'medium' ||
      borderBlur === 'strong'
        ? borderBlur
        : base.borderBlur ?? 'none',
    borderDoubleEnabled:
      typeof record.borderDoubleEnabled === 'boolean'
        ? record.borderDoubleEnabled
        : base.borderDoubleEnabled ?? false,
    borderDoubleColor: sanitizeHex(
      record.borderDoubleColor,
      base.borderDoubleColor ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME.borderDoubleColor
    ),
    borderDoubleGap:
      borderDoubleGap === 'tight' ||
      borderDoubleGap === 'standard' ||
      borderDoubleGap === 'wide'
        ? borderDoubleGap
        : base.borderDoubleGap ?? 'standard',
    borderRadius:
      borderRadius === 'none' ||
      borderRadius === 'sm' ||
      borderRadius === 'md' ||
      borderRadius === 'lg' ||
      borderRadius === 'full'
        ? borderRadius
        : base.borderRadius,
    padding:
      padding === 'none' ||
      padding === 'compact' ||
      padding === 'standard' ||
      padding === 'comfortable'
        ? padding
        : base.padding,
    offsetX: clampGlobalSplitTitleOffsetX(record.offsetX, base.offsetX ?? 0),
  };
}

export function mergeGlobalSettings(base: PortfolioGlobalSettings, patch: unknown): PortfolioGlobalSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const titleAlignment = record.titleAlignment;
  const contentWidth = record.contentWidth;
  const contentGutter = record.contentGutter;
  const titleScroll = record.titleScroll;
  const splitTitleMotion = record.splitTitleMotion;
  const splitContentTopSpacing = record.splitContentTopSpacing;
  const sectionTitleTopSpacing = record.sectionTitleTopSpacing;
  const titleOrientation =
    record.titleOrientation === 'horizontal' || record.titleOrientation === 'vertical'
      ? record.titleOrientation
      : base.titleOrientation;

  const titleOrientationTargets = mergeTitleOrientationTargets(
    base.titleOrientationTargets,
    record.titleOrientationTargets
  );

  // Partial patches omit titleOrientationTargets — keep the current selection, never reset it.
  const backgroundImageSize = record.backgroundImageSize;
  const backgroundImagePosition = record.backgroundImagePosition;

  let backgroundEnabled =
    typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled;
  let backgroundImageEnabled =
    typeof record.backgroundImageEnabled === 'boolean'
      ? record.backgroundImageEnabled
      : base.backgroundImageEnabled;
  const backgroundImageUrl =
    typeof record.backgroundImageUrl === 'string'
      ? record.backgroundImageUrl.trim()
      : base.backgroundImageUrl;

  // Color OR fixed image — never both. Enabling one clears the other.
  if (typeof record.backgroundEnabled === 'boolean' && record.backgroundEnabled) {
    backgroundImageEnabled = false;
  } else if (typeof record.backgroundImageEnabled === 'boolean' && record.backgroundImageEnabled) {
    backgroundEnabled = false;
  } else if (backgroundEnabled && backgroundImageEnabled) {
    // Legacy: both flags on — keep image when a URL exists, otherwise solid.
    if (sanitizeBackgroundImageUrl(backgroundImageUrl)) {
      backgroundEnabled = false;
    } else {
      backgroundImageEnabled = false;
    }
  }

  const backgroundImageLibrary = normalizeBackgroundImageLibrary(
    record.backgroundImageLibrary !== undefined
      ? record.backgroundImageLibrary
      : base.backgroundImageLibrary,
    backgroundImageUrl
  );

  return {
    backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    backgroundImageEnabled,
    backgroundImageUrl,
    backgroundImageLibrary,
    backgroundImageSize:
      backgroundImageSize === 'cover' ||
      backgroundImageSize === 'contain' ||
      backgroundImageSize === 'fill'
        ? backgroundImageSize
        : base.backgroundImageSize,
    backgroundImagePosition:
      backgroundImagePosition === 'center' ||
      backgroundImagePosition === 'top' ||
      backgroundImagePosition === 'bottom' ||
      backgroundImagePosition === 'left' ||
      backgroundImagePosition === 'right' ||
      backgroundImagePosition === 'top-left' ||
      backgroundImagePosition === 'top-right' ||
      backgroundImagePosition === 'bottom-left' ||
      backgroundImagePosition === 'bottom-right'
        ? backgroundImagePosition
        : base.backgroundImagePosition,
    backgroundImageOpacity: sanitizeOpacityPercent(
      record.backgroundImageOpacity,
      base.backgroundImageOpacity
    ),
    backgroundImageInsetTop: sanitizeInsetPx(
      record.backgroundImageInsetTop,
      base.backgroundImageInsetTop
    ),
    backgroundImageInsetRight: sanitizeInsetPx(
      record.backgroundImageInsetRight,
      base.backgroundImageInsetRight
    ),
    backgroundImageInsetBottom: sanitizeInsetPx(
      record.backgroundImageInsetBottom,
      base.backgroundImageInsetBottom
    ),
    backgroundImageInsetLeft: sanitizeInsetPx(
      record.backgroundImageInsetLeft,
      base.backgroundImageInsetLeft
    ),
    backgroundPattern:
      record.backgroundPattern === 'none' ||
      record.backgroundPattern === 'arrows' ||
      record.backgroundPattern === 'cubes' ||
      record.backgroundPattern === 'hexagons' ||
      record.backgroundPattern === 'double-hexagon' ||
      record.backgroundPattern === 'axis-reticle' ||
      record.backgroundPattern === 'faceted-diamond' ||
      record.backgroundPattern === 'opposed-triangles' ||
      record.backgroundPattern === 'asymmetric-grid'
        ? record.backgroundPattern
        : base.backgroundPattern ?? 'none',
    backgroundPatternColor: sanitizeHex(
      record.backgroundPatternColor,
      base.backgroundPatternColor ?? DEFAULT_GLOBAL_BACKGROUND_PATTERN_COLOR
    ),
    backgroundPatternSecondaryColor: sanitizeHex(
      record.backgroundPatternSecondaryColor,
      base.backgroundPatternSecondaryColor ??
        DEFAULT_GLOBAL_BACKGROUND_PATTERN_SECONDARY_COLOR
    ),
    backgroundPatternOpacity: sanitizeOpacityPercent(
      record.backgroundPatternOpacity,
      base.backgroundPatternOpacity ?? DEFAULT_GLOBAL_BACKGROUND_PATTERN_OPACITY
    ),
    backgroundPatternUnitsPerRow: sanitizePatternUnitsPerRow(
      record.backgroundPatternUnitsPerRow,
      base.backgroundPatternUnitsPerRow ?? DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNITS_PER_ROW
    ),
    backgroundPatternUnitSize: sanitizePatternUnitSize(
      record.backgroundPatternUnitSize,
      base.backgroundPatternUnitSize ?? DEFAULT_GLOBAL_BACKGROUND_PATTERN_UNIT_SIZE
    ),
    backgroundPatternGapX: sanitizePatternGapPx(
      record.backgroundPatternGapX,
      base.backgroundPatternGapX ?? DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP
    ),
    backgroundPatternGapY: sanitizePatternGapPx(
      record.backgroundPatternGapY,
      base.backgroundPatternGapY ?? DEFAULT_GLOBAL_BACKGROUND_PATTERN_GAP
    ),
    monochromeUi:
      typeof record.monochromeUi === 'boolean' ? record.monochromeUi : base.monochromeUi,
    colorMode:
      record.colorMode === 'dark' || record.colorMode === 'light'
        ? record.colorMode
        : (base.colorMode ?? 'dark'),
    paletteFamily:
      record.paletteFamily === 'indigo' ||
      record.paletteFamily === 'classic' ||
      record.paletteFamily === 'verdant' ||
      record.paletteFamily === 'vive' ||
      record.paletteFamily === 'safran' ||
      record.paletteFamily === 'citron' ||
      record.paletteFamily === 'rouge' ||
      record.paletteFamily === 'ecarlate' ||
      record.paletteFamily === 'ardoise' ||
      record.paletteFamily === 'custom'
        ? record.paletteFamily
        : (base.paletteFamily ?? 'classic'),
    paletteDark: mergeHeroPalette(
      base.paletteDark ?? DEFAULT_HERO_PALETTE,
      record.paletteDark !== undefined ? record.paletteDark : base.paletteDark
    ),
    paletteLight: mergeHeroPalette(
      base.paletteLight ?? LIGHT_HERO_PALETTE,
      record.paletteLight !== undefined ? record.paletteLight : base.paletteLight
    ),
    settingsShortcutEnabled:
      typeof record.settingsShortcutEnabled === 'boolean'
        ? record.settingsShortcutEnabled
        : base.settingsShortcutEnabled ?? true,
    titleAlignment:
      titleAlignment === 'section' ||
      titleAlignment === 'left' ||
      titleAlignment === 'center' ||
      titleAlignment === 'right'
        ? titleAlignment
        : base.titleAlignment,
    titleOrientation,
    titleOrientationTargets,
    contentWidth:
      contentWidth === 'standard' || contentWidth === 'wide' || contentWidth === 'full'
        ? contentWidth
        : base.contentWidth,
    contentGutter:
      contentGutter === 'none' ||
      contentGutter === 'wide' ||
      contentGutter === 'medium' ||
      contentGutter === 'narrow'
        ? contentGutter
        : base.contentGutter,
    titleScroll:
      titleScroll === 'sticky' || titleScroll === 'static' ? titleScroll : base.titleScroll,
    splitTitleMotion:
      splitTitleMotion === 'fade' ||
      splitTitleMotion === 'fade-up' ||
      splitTitleMotion === 'fade-scale'
        ? splitTitleMotion
        : base.splitTitleMotion,
    splitTitleFrame: mergeSplitTitleFrame(
      base.splitTitleFrame ?? DEFAULT_GLOBAL_SPLIT_TITLE_FRAME,
      record.splitTitleFrame
    ),
    splitContentTopSpacing:
      splitContentTopSpacing === 'compact' ||
      splitContentTopSpacing === 'standard' ||
      splitContentTopSpacing === 'comfortable' ||
      splitContentTopSpacing === 'spacious'
        ? splitContentTopSpacing
        : base.splitContentTopSpacing,
    splitContentTopExtraPx: clampGlobalSplitContentTopExtraPx(
      record.splitContentTopExtraPx,
      base.splitContentTopExtraPx ?? 0
    ),
    motionProfile: resolveMotionProfileFromStorage(
      record,
      mergeMotionProfile(base.motionProfile, record.motionProfile)
    ),
    motionTiming: (() => {
      const profile = resolveMotionProfileFromStorage(
        record,
        mergeMotionProfile(base.motionProfile, record.motionProfile)
      );
      return mergeMotionTiming(
        defaultMotionTimingForProfile(profile),
        record.motionTiming ?? base.motionTiming
      );
    })(),
    taskListBulletStyle: isPortfolioListMarkerStyle(record.taskListBulletStyle)
      ? record.taskListBulletStyle
      : (base.taskListBulletStyle ?? 'disc'),
    taskListBulletColor: sanitizeHex(
      record.taskListBulletColor,
      base.taskListBulletColor ?? DEFAULT_LIST_MARKER_COLOR
    ),
    taskListBulletSize: isPortfolioListMarkerSize(record.taskListBulletSize)
      ? record.taskListBulletSize
      : (base.taskListBulletSize ?? 'md'),
    taskListBulletSizePx: clampListMarkerSizePx(
      record.taskListBulletSizePx,
      base.taskListBulletSizePx ?? LIST_MARKER_SIZE_PRESET_PX.md
    ),
    taskListBulletWeight: isPortfolioListMarkerWeight(record.taskListBulletWeight)
      ? record.taskListBulletWeight
      : (base.taskListBulletWeight ?? 'regular'),
    taskListBulletWeightAmount: clampListMarkerWeightAmount(
      record.taskListBulletWeightAmount,
      base.taskListBulletWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    sectionTitleTopSpacing:
      sectionTitleTopSpacing === 'compact' ||
      sectionTitleTopSpacing === 'standard' ||
      sectionTitleTopSpacing === 'comfortable' ||
      sectionTitleTopSpacing === 'spacious'
        ? sectionTitleTopSpacing
        : base.sectionTitleTopSpacing,
    sectionTitleTopExtraPx: clampGlobalSectionTitleTopExtraPx(
      record.sectionTitleTopExtraPx,
      base.sectionTitleTopExtraPx ?? 0
    ),
    sectionOrder: mergeSectionOrder(base.sectionOrder, record.sectionOrder),
    presenceKind: isPortfolioPresenceKind(record.presenceKind)
      ? record.presenceKind
      : record.presenceKind === null
        ? null
        : (base.presenceKind ?? null),
    bodyFont: isPortfolioGlobalBodyFont(record.bodyFont)
      ? record.bodyFont
      : base.bodyFont ?? 'plusJakarta',
    bodyFontForceAll: true,
    titleTypography: mergeTitleTypography(base.titleTypography, record.titleTypography),
    subtitleTypography: mergeSubtitleTypography(base.subtitleTypography, record.subtitleTypography),
    titleChrome: mergeTitleChrome(base.titleChrome, record.titleChrome),
  };
}
