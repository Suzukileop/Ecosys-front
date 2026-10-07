import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import {
  DEFAULT_ABOUT_COLOR_BINDINGS,
  DEFAULT_ABOUT_PALETTE,
  applyAboutPaletteToSettings,
  mergeAboutColorBindings,
  mergeAboutPalette,
  type PortfolioAboutColorBindings,
  type PortfolioAboutPalette,
} from '@/components/portfolio/portfolio-about-palette-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  mergeServicesCardBackgroundSettings,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  servicesCardPaddingClass,
  servicesCardRadiusClass,
  type PortfolioServicesCardBorder,
  type PortfolioServicesCardPadding,
  type PortfolioServicesCardRadius,
} from '@/components/portfolio/portfolio-services-settings';
import { DEFAULT_SECTION_BACKGROUND, mergeSectionBackground, type PortfolioSectionBackgroundSettings } from '@/components/portfolio/portfolio-section-background-settings';
import { createElementTextStyle, normalizeElementStylesRecord, DEFAULT_ELEMENT_MUTED_COLOR, type PortfolioElementTextStyle } from '@/components/portfolio/portfolio-element-text-style';
import { isPortfolioListMarkerWeight, clampListMarkerSizePx, clampListMarkerWeightAmount, LIST_MARKER_WEIGHT_PRESET_AMOUNT, type PortfolioListMarkerWeight } from '@/components/portfolio/portfolio-list-marker';

/** Larger glyph scale for Why me / side-panel list markers. */
export const ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX: Record<'sm' | 'md' | 'lg' | 'xl', number> = {
  sm: 14,
  md: 20,
  lg: 28,
  xl: 40,
};

export type PortfolioAboutTitlePreset = 'about' | 'my-story' | 'who-i-am' | 'behind-the-work' | 'custom';

export type PortfolioAboutSubtitlePreset = 'default' | 'short' | 'personal' | 'minimal' | 'custom';

export type PortfolioAboutHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioAboutHeaderAlignment = 'left' | 'center';

/** How the About title relates to the section body (independent of `layoutMode`). */
export type PortfolioAboutSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Decorative SVG beside About content (`none` hides it). */
export type PortfolioAboutIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioAboutIllustrationPlacement = 'left' | 'right';

export type PortfolioAboutLayoutMode = 'sidebar-right' | 'sidebar-left' | 'full-width' | 'twin-columns';

/** Horizontal align of the infos panel inside twin-columns (large screens). */
export type PortfolioAboutSidePanelTwinAlign = 'left' | 'center' | 'right';

/**
 * Width split for twin-columns (Why me | Infos).
 * Default favors Why me — never forced 50/50 unless the creator picks Equal.
 */
export type PortfolioAboutTwinColumnsSplit = 'equal' | 'main-70' | 'auto';

/** Horizontal place of the Infos + Why me pair on the page (when both are shown). */
export type PortfolioAboutContentPairAlign = 'start' | 'center' | 'end';

export type PortfolioAboutFullWidthPanelPlacement = 'above-stats' | 'below-stats' | 'below-content';

export type PortfolioAboutStatsDesign = 'unified-band' | 'featured' | 'editorial-list';

export type PortfolioAboutStatsGroupMode = 'unified' | 'separated';

export type PortfolioAboutSidePanelDesign =
  | 'framed'
  | 'cards'
  | 'minimal'
  | 'info-bar'
  | 'list'
  /** Full-width: horizontal columns, icon on top, no heavy panel fill. */
  | 'info-strip'
  /** Full-width: bio blurb + compact info badges (CV-style). */
  | 'profile-cv';

/** Vertical gap between side-panel info rows (location, languages, …). */
export type PortfolioAboutSidePanelContentGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export type PortfolioAboutSidePanelFullWidthLayout =
  | 'stacked'
  | 'grid-2'
  | 'grid-3'
  | 'horizontal'
  | 'inline-band'
  | 'profile-frame';

/** Icon vs text for side-panel info cells. */
export type PortfolioAboutSidePanelIconPlacement = 'left' | 'top' | 'right';

/** Card index marker: digits, roman, or hyper-style list bullets (circled puce set). */
export type PortfolioAboutWhyMeMarkerStyle =
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
  | 'none';

export type PortfolioAboutWhyMeMarkerSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export type PortfolioAboutStatsFont = PortfolioAboutHeaderFont;

export type PortfolioAboutStatsValueSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioAboutStatsLabelSize = 'xs' | 'sm' | 'md';

export type PortfolioAboutStatsValueWeight = 'semibold' | 'bold' | 'extrabold' | 'black';

export type PortfolioAboutStatsLabelWeight = 'medium' | 'semibold' | 'bold';

export type PortfolioAboutStatsLabelTracking = 'tight' | 'normal' | 'wide' | 'extra';

export type PortfolioAboutStatsIconSize = 'sm' | 'md' | 'lg';

export type AboutStatValueSizeContext = 'featured' | 'bar' | 'band' | 'editorial';

/** Which about text element can be styled independently (color, font, size, weight). */
type PortfolioAboutStyleTarget =
  | 'sideLabel'
  | 'sideTitle'
  | 'sideSubtitle';

export type PortfolioAboutElementStyles = Record<PortfolioAboutStyleTarget, PortfolioElementTextStyle>;

export type PortfolioAboutPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings & {
  titlePreset: PortfolioAboutTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioAboutSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioAboutHeaderFont;
  subtitleFont: PortfolioAboutHeaderFont;
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  subtitleSerif: boolean;
  headerAlignment: PortfolioAboutHeaderAlignment;
  /** When false, hide the About section sticky title. */
  showAboutHeading: boolean;
  /** When false, hide the stats band under the About header. */
  showStats: boolean;
  /** When false, hide the Infos / side panel block. */
  showSidePanel: boolean;
  /**
   * `stacked` — title above content (default).
   * `aside-left` / `aside-right` — title beside content on large screens.
   * Independent of `layoutMode` (sidebar / twin-columns / full-width).
   */
  sectionLayout: PortfolioAboutSectionLayout;
  /** Decorative SVG beside About content (`none` hides it). */
  illustrationVariant: PortfolioAboutIllustrationVariant;
  /** Side of the content for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioAboutIllustrationPlacement;
  layoutMode: PortfolioAboutLayoutMode;
  fullWidthPanelPlacement: PortfolioAboutFullWidthPanelPlacement;
  statsDesign: PortfolioAboutStatsDesign;
  statsGroupMode: PortfolioAboutStatsGroupMode;
  statsGap: number;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  statsValueColor: string;
  statsLabelColor: string;
  statsIconColor: string;
  statsUseAccentForRating: boolean;
  statsValueFont: PortfolioAboutStatsFont;
  statsLabelFont: PortfolioAboutStatsFont;
  statsValueSize: PortfolioAboutStatsValueSize;
  statsLabelSize: PortfolioAboutStatsLabelSize;
  statsValueWeight: PortfolioAboutStatsValueWeight;
  statsLabelWeight: PortfolioAboutStatsLabelWeight;
  statsLabelUppercase: boolean;
  statsLabelTracking: PortfolioAboutStatsLabelTracking;
  statsIconSize: PortfolioAboutStatsIconSize;
  showStatYears: boolean;
  showStatContent: boolean;
  showStatLanguages: boolean;
  showStatRating: boolean;
  statsAutoCenter: boolean;
  sidePanelDesign: PortfolioAboutSidePanelDesign;
  sidePanelFullWidthLayout: PortfolioAboutSidePanelFullWidthLayout;
  /** Short philosophy / bio for `profile-cv` design (left column). */
  sidePanelBio: string;
  showSidePanelBio: boolean;
  /** Icon position relative to label/value in each info cell. */
  sidePanelIconPlacement: PortfolioAboutSidePanelIconPlacement;
  /** When false, hide icons in the side / info panel. */
  sidePanelShowIcons: boolean;
  /** Optional heading above Infos (all designs — independent from About / Why choose me). */
  showSidePanelHeading: boolean;
  /** Heading copy for Infos (default: Infos). */
  sidePanelHeading: string;
  /** Color of the Infos heading — independent from Why choose me / About titles. */
  sidePanelHeadingColor: string;
  /** List-bullet marker style for the `list` side-panel design (same set as Why me). */
  sidePanelMarkerStyle: PortfolioAboutWhyMeMarkerStyle;
  /** Marker size for the list side-panel design. */
  sidePanelMarkerSize: PortfolioAboutWhyMeMarkerSize;
  sidePanelMarkerSizePx: number;
  /** Marker weight for the list side-panel design. */
  sidePanelMarkerWeight: PortfolioListMarkerWeight;
  sidePanelMarkerWeightAmount: number;
  /** Marker color for the list side-panel design (defaults to accent). */
  sidePanelMarkerColor: string;
  /** Vertical spacing between side-panel rows. */
  sidePanelContentGap: PortfolioAboutSidePanelContentGap;
  /** Manual px gap when sidePanelContentGap is `custom`. */
  sidePanelContentGapPx: number;
  sidePanelBorder: PortfolioServicesCardBorder;
  sidePanelBorderColor: string;
  /** Bumps when factory side-panel defaults change (borderless profile card, etc.). */
  sidePanelSettingsRevision: number;
  sidePanelBackgroundEnabled: boolean;
  sidePanelBackgroundColor: string;
  sidePanelBorderRadius: PortfolioServicesCardRadius;
  sidePanelPadding: PortfolioServicesCardPadding;
  sidePanelBackgroundFill: PortfolioServicesCardBackgroundSettings['cardBackgroundFill'];
  sidePanelBackgroundColorA: string;
  sidePanelBackgroundColorB: string;
  sidePanelBackgroundSplitAxis: PortfolioServicesCardBackgroundSettings['cardBackgroundSplitAxis'];
  sidePanelBackgroundSplitPosition: number;
  sidePanelDividerEnabled: boolean;
  sidePanelDividerShape: PortfolioServicesCardBackgroundSettings['cardDividerShape'];
  sidePanelDividerAngle: number;
  sidePanelDividerCurveDepth: number;
  sidePanelDividerColor: string;
  sidePanelDividerThickness: number;
  sidePanelDividerOpacity: number;
  showSidePanelLocation: boolean;
  showSidePanelLanguages: boolean;
  showSidePanelGender: boolean;
  showSidePanelMemberSince: boolean;
  showSidePanelAvailability: boolean;
  /** Reply / response-time line under availability in the side panel. */
  showSidePanelResponseTime: boolean;
  sidePanelAutoCenter: boolean;
  /** Twin-columns only: align infos panel left / center / right in its column (lg+). */
  sidePanelTwinAlign: PortfolioAboutSidePanelTwinAlign;
  /** Twin-columns only: How width is shared between Why me and Infos. */
  twinColumnsSplit: PortfolioAboutTwinColumnsSplit;
  /** Place Infos + Why me as a pair: start, center, or end of the section width. */
  contentPairAlign: PortfolioAboutContentPairAlign;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /**
   * Runtime light/dark (from Global). Used when `useHeroPalette` is false so
   * element `color` / `colorDark` pairs resolve correctly.
   */
  activeColorMode?: 'light' | 'dark';
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
  /** About-owned palette copy (same 8 tokens as Hero). */
  aboutPalette?: PortfolioAboutPalette;
  /** Which token each about color slot uses. */
  aboutColorBindings?: PortfolioAboutColorBindings;
  /** Per-element color, font, size, and weight for Why me text and side panel rows. */
  elementStyles: PortfolioAboutElementStyles;
};

const DEFAULT_ABOUT_TITLE_COLOR = '#0a0a0a';
const DEFAULT_ABOUT_SUBTITLE_COLOR = '#737373';
const DEFAULT_ABOUT_ACCENT_COLOR = '#ea580c';
const DEFAULT_ABOUT_CARD_BORDER_COLOR = '#e5e5e5';
const DEFAULT_ABOUT_CARD_BACKGROUND_COLOR = '#f5f5f5';
const DEFAULT_ABOUT_STATS_VALUE_COLOR = '#0a0a0a';
const DEFAULT_ABOUT_STATS_LABEL_COLOR = '#525252';
const DEFAULT_ABOUT_STATS_ICON_COLOR = '#525252';
const DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR = '#e5e5e5';
const DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR = '#f5f5f5';
const DEFAULT_ABOUT_SIDE_PANEL_HEADING_COLOR = '#0a0a0a';
/** v2: profile side panel is borderless by default. */
const ABOUT_SIDE_PANEL_SETTINGS_REVISION = 3;


const DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND: Pick<
  PortfolioAboutPresentationSettings,
  | 'sidePanelBackgroundFill'
  | 'sidePanelBackgroundColorA'
  | 'sidePanelBackgroundColorB'
  | 'sidePanelBackgroundSplitAxis'
  | 'sidePanelBackgroundSplitPosition'
  | 'sidePanelDividerEnabled'
  | 'sidePanelDividerShape'
  | 'sidePanelDividerAngle'
  | 'sidePanelDividerCurveDepth'
  | 'sidePanelDividerColor'
  | 'sidePanelDividerThickness'
  | 'sidePanelDividerOpacity'
> = {
  sidePanelBackgroundFill: 'solid',
  sidePanelBackgroundColorA: '#f5f5f5',
  sidePanelBackgroundColorB: '#f5f5f5',
  sidePanelBackgroundSplitAxis: 'x',
  sidePanelBackgroundSplitPosition: 62,
  sidePanelDividerEnabled: false,
  sidePanelDividerShape: 'diagonal',
  sidePanelDividerAngle: 155,
  sidePanelDividerCurveDepth: 14,
  sidePanelDividerColor: '#e5e5e5',
  sidePanelDividerThickness: 1,
  sidePanelDividerOpacity: 70,
};

/** Previous factory default (white / gray diagonal split) — migrate to solid gray. */
function isLegacyDefaultSidePanelBackground(
  p: Pick<
    PortfolioAboutPresentationSettings,
    | 'sidePanelBackgroundFill'
    | 'sidePanelBackgroundColorA'
    | 'sidePanelBackgroundColorB'
    | 'sidePanelBackgroundSplitPosition'
    | 'sidePanelDividerEnabled'
    | 'sidePanelDividerShape'
    | 'sidePanelDividerAngle'
  >
): boolean {
  const hex = (value: string) => value.trim().toLowerCase();
  return (
    p.sidePanelBackgroundFill === 'split' &&
    hex(p.sidePanelBackgroundColorA) === '#ffffff' &&
    hex(p.sidePanelBackgroundColorB) === '#f5f5f5' &&
    p.sidePanelBackgroundSplitPosition === 62 &&
    p.sidePanelDividerEnabled === true &&
    p.sidePanelDividerShape === 'diagonal' &&
    p.sidePanelDividerAngle === 155
  );
}

const DEFAULT_ABOUT_STATS_CARD_BACKGROUND: PortfolioServicesCardBackgroundSettings = {
  ...DEFAULT_SOLID_CARD_BACKGROUND_SETTINGS,
  cardBackgroundColorA: '#f5f5f5',
  cardBackgroundColorB: '#f5f5f5',
  cardDividerColor: '#e5e5e5',
  cardDividerEnabled: false,
};

/** Previous factory default (black cards + white values) — migrate to gray + black text. */
export function isLegacyDefaultAboutStatsCard(
  p: Pick<PortfolioAboutPresentationSettings, 'cardBackgroundColor' | 'statsValueColor'>
): boolean {
  const hex = (value: string) => value.trim().toLowerCase();
  return hex(p.cardBackgroundColor) === '#0a0a0a' && hex(p.statsValueColor) === '#ffffff';
}

export function withDefaultAboutStatsCardColors<T extends PortfolioAboutPresentationSettings>(
  p: T
): T {
  return {
    ...p,
    ...DEFAULT_ABOUT_STATS_CARD_BACKGROUND,
    cardBorderColor: DEFAULT_ABOUT_CARD_BORDER_COLOR,
    cardBackgroundColor: DEFAULT_ABOUT_CARD_BACKGROUND_COLOR,
    statsValueColor: DEFAULT_ABOUT_STATS_VALUE_COLOR,
    statsLabelColor: DEFAULT_ABOUT_STATS_LABEL_COLOR,
    statsIconColor: DEFAULT_ABOUT_STATS_ICON_COLOR,
  };
}

/** Restore light stats text on dark ink cards (Noir / Blanc contrast). */
export function withNoirReadableAboutStatsColors<T extends PortfolioAboutPresentationSettings>(
  p: T
): T {
  return {
    ...p,
    statsValueColor: '#ffffff',
    statsLabelColor: '#a3a3a3',
    statsIconColor: '#a3a3a3',
    statsUseAccentForRating: false,
  };
}

function hexLuminance(hex: string): number {
  const body = hex.replace('#', '').trim();
  const full =
    body.length === 3
      ? body
          .split('')
          .map((ch) => `${ch}${ch}`)
          .join('')
      : body.slice(0, 6);
  if (full.length < 6) return 1;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  if (![r, g, b].every(Number.isFinite)) return 1;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Dark card + dark value text — illegible on Noir ink stats. */
export function isIllegibleDarkAboutStatsCard(
  p: Pick<PortfolioAboutPresentationSettings, 'cardBackgroundColor' | 'statsValueColor' | 'accentColor' | 'statsUseAccentForRating'>
): boolean {
  const bg = hexLuminance(p.cardBackgroundColor);
  if (bg >= 0.28) return false;
  const value = hexLuminance(p.statsValueColor);
  if (value < 0.4) return true;
  if (p.statsUseAccentForRating && hexLuminance(p.accentColor) < 0.35) return true;
  return false;
}

const ABOUT_STYLE_TARGET_IDS: PortfolioAboutStyleTarget[] = [
  'sideLabel',
  'sideTitle',
  'sideSubtitle',
];

const DEFAULT_ABOUT_ELEMENT_STYLES: PortfolioAboutElementStyles = {
  sideLabel: createElementTextStyle({
    color: DEFAULT_ELEMENT_MUTED_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  sideTitle: createElementTextStyle({ color: DEFAULT_ABOUT_TITLE_COLOR, size: 'md', bold: true }),
  sideSubtitle: createElementTextStyle({ color: DEFAULT_ELEMENT_MUTED_COLOR, size: 'sm' }),
};

export const DEFAULT_ABOUT_PRESENTATION: PortfolioAboutPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_ABOUT_STATS_CARD_BACKGROUND,
  titlePreset: 'about',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'serif',
  titleColor: DEFAULT_ABOUT_TITLE_COLOR,
  subtitleColor: DEFAULT_ABOUT_SUBTITLE_COLOR,
  accentColor: DEFAULT_ABOUT_ACCENT_COLOR,
  subtitleSerif: true,
  headerAlignment: 'left',
  showAboutHeading: false,
  showStats: true,
  showSidePanel: true,
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  layoutMode: 'sidebar-right',
  fullWidthPanelPlacement: 'below-content',
  statsDesign: 'unified-band',
  statsGroupMode: 'separated',
  statsGap: 20,
  cardBorder: 'soft',
  cardBorderColor: DEFAULT_ABOUT_CARD_BORDER_COLOR,
  cardBackgroundEnabled: true,
  cardBackgroundColor: DEFAULT_ABOUT_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'md',
  cardPadding: 'md',
  statsValueColor: DEFAULT_ABOUT_STATS_VALUE_COLOR,
  statsLabelColor: DEFAULT_ABOUT_STATS_LABEL_COLOR,
  statsIconColor: DEFAULT_ABOUT_STATS_ICON_COLOR,
  statsUseAccentForRating: true,
  statsValueFont: 'sans',
  statsLabelFont: 'sans',
  statsValueSize: 'lg',
  statsLabelSize: 'xs',
  statsValueWeight: 'extrabold',
  statsLabelWeight: 'bold',
  statsLabelUppercase: true,
  statsLabelTracking: 'extra',
  statsIconSize: 'md',
  showStatYears: true,
  showStatContent: true,
  showStatLanguages: true,
  showStatRating: true,
  statsAutoCenter: false,
  sidePanelDesign: 'framed',
  sidePanelFullWidthLayout: 'stacked',
  sidePanelBio: '',
  showSidePanelBio: true,
  sidePanelIconPlacement: 'left',
  sidePanelShowIcons: true,
  showSidePanelHeading: true,
  sidePanelHeading: 'Infos',
  sidePanelHeadingColor: DEFAULT_ABOUT_SIDE_PANEL_HEADING_COLOR,
  sidePanelMarkerStyle: 'disc',
  sidePanelMarkerSize: 'md',
  sidePanelMarkerSizePx: ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX.md,
  sidePanelMarkerWeight: 'regular',
  sidePanelMarkerWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
  sidePanelMarkerColor: DEFAULT_ABOUT_ACCENT_COLOR,
  sidePanelContentGap: 'md',
  sidePanelContentGapPx: 32,
  sidePanelBorder: 'none',
  sidePanelBorderColor: DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR,
  sidePanelSettingsRevision: ABOUT_SIDE_PANEL_SETTINGS_REVISION,
  sidePanelBackgroundEnabled: true,
  sidePanelBackgroundColor: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
  sidePanelBorderRadius: 'lg',
  sidePanelPadding: 'md',
  ...DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND,
  showSidePanelLocation: true,
  showSidePanelLanguages: true,
  showSidePanelGender: false,
  showSidePanelMemberSince: true,
  showSidePanelAvailability: true,
  showSidePanelResponseTime: false,
  sidePanelAutoCenter: false,
  sidePanelTwinAlign: 'right',
  twinColumnsSplit: 'equal',
  contentPairAlign: 'start',
  useHeroPalette: true,
  colorModeOverride: 'auto',
  aboutPalette: { ...DEFAULT_ABOUT_PALETTE },
  aboutColorBindings: { ...DEFAULT_ABOUT_COLOR_BINDINGS },
  elementStyles: DEFAULT_ABOUT_ELEMENT_STYLES,
};

Object.assign(
  DEFAULT_ABOUT_PRESENTATION,
  applyAboutPaletteToSettings({
    aboutPalette: DEFAULT_ABOUT_PALETTE,
    aboutColorBindings: DEFAULT_ABOUT_COLOR_BINDINGS,
    elementStyles: DEFAULT_ABOUT_ELEMENT_STYLES,
  })
);

function isPortfolioAboutSectionLayout(value: unknown): value is PortfolioAboutSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function sidePanelIconPlacementClass(placement: PortfolioAboutSidePanelIconPlacement): {
  row: string;
  icon: string;
  text: string;
} {
  switch (placement) {
    case 'top':
      return {
        row: 'flex flex-col items-start gap-3',
        icon: 'shrink-0',
        text: 'min-w-0 w-full',
      };
    case 'right':
      return {
        row: 'flex flex-row items-start gap-4 sm:gap-5',
        icon: 'mt-0.5 shrink-0',
        text: 'min-w-0 flex-1',
      };
    default:
      return {
        row: 'flex flex-row items-start gap-4 sm:gap-5',
        icon: 'mt-0.5 shrink-0',
        text: 'min-w-0 flex-1',
      };
  }
}

function isPortfolioAboutSidePanelIconPlacement(
  value: unknown
): value is PortfolioAboutSidePanelIconPlacement {
  return value === 'left' || value === 'top' || value === 'right';
}

const ABOUT_SIDE_PANEL_CONTENT_GAP_PRESET_PX: Record<
  Exclude<PortfolioAboutSidePanelContentGap, 'custom'>,
  number
> = {
  none: 0,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 72,
};

const ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN = 0;
const ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX = 100;

function clampAboutSidePanelContentGapPx(value: unknown, fallback = 28): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN,
    Math.min(ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX, Math.round(n))
  );
}

function resolveAboutSidePanelContentGapPx(
  p: Pick<PortfolioAboutPresentationSettings, 'sidePanelContentGap' | 'sidePanelContentGapPx'>
): number {
  const gap = p.sidePanelContentGap ?? 'md';
  if (gap === 'custom') {
    return clampAboutSidePanelContentGapPx(p.sidePanelContentGapPx, 32);
  }
  return ABOUT_SIDE_PANEL_CONTENT_GAP_PRESET_PX[gap] ?? 32;
}

export function aboutSidePanelContentGapStyle(
  p: Pick<PortfolioAboutPresentationSettings, 'sidePanelContentGap' | 'sidePanelContentGapPx'>,
  options?: { minPx?: number }
): CSSProperties {
  let px = resolveAboutSidePanelContentGapPx(p);
  if (options?.minPx && (p.sidePanelContentGap ?? 'md') !== 'none') {
    px = Math.max(px, options.minPx);
  }
  return { gap: `${px}px` };
}

function isPortfolioAboutSidePanelContentGap(
  value: unknown
): value is PortfolioAboutSidePanelContentGap {
  return (
    value === 'none' ||
    value === 'sm' ||
    value === 'md' ||
    value === 'lg' ||
    value === 'xl' ||
    value === 'custom'
  );
}

const PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS: {
  value: PortfolioAboutWhyMeMarkerStyle;
  label: string;
  description: string;
  preview: string;
}[] = [
  { value: 'number', label: 'Chiffres', description: '01, 02, 03… numérotation classique.', preview: '01' },
  { value: 'roman', label: 'Romains', description: 'I, II, III, IV… chiffres romains.', preview: 'IV' },
  { value: 'disc', label: 'Disque', description: 'Puce ronde pleine.', preview: '●' },
  { value: 'bar-dot', label: 'Barre + point', description: 'Rectangle vertical avec point central.', preview: '▮' },
  { value: 'bullseye', label: 'Cible', description: 'Cercles concentriques.', preview: '◎' },
  { value: 'square', label: 'Carré', description: 'Case vide style checklist.', preview: '☐' },
  { value: 'check-square', label: 'Case cochée', description: 'Carré avec coche.', preview: '☑' },
  { value: 'x-square', label: 'Case ×', description: 'Carré avec croix.', preview: '☒' },
  { value: 'check', label: 'Coche', description: 'Checkmark seul.', preview: '✓' },
  { value: 'arrow', label: 'Flèche', description: 'Flèche horizontale →.', preview: '→' },
  { value: 'chevron', label: 'Chevron', description: 'Chevron ouvert ›.', preview: '›' },
  { value: 'chevron-double', label: 'Double chevron', description: 'Double chevron ».', preview: '»' },
  { value: 'triangle', label: 'Triangle', description: 'Pointe pleine ▶.', preview: '▶' },
  { value: 'none', label: 'Aucun', description: 'Pas de marqueur d’index.', preview: '—' },
];


export function resolveSidePanelMarkerColor(
  presentation: Pick<
    PortfolioAboutPresentationSettings,
    'sidePanelMarkerColor' | 'accentColor' | 'useHeroPalette' | 'aboutPalette'
  >
): string {
  if (presentation.useHeroPalette !== false) {
    return aboutPalettePrincipalColor(presentation);
  }
  return sanitizeHex(presentation.sidePanelMarkerColor, aboutAccentColor(presentation.accentColor));
}

/** Palette `principal` (or accent fallback) — icons, soft washes, markers. */
export function aboutPalettePrincipalColor(
  p: Pick<PortfolioAboutPresentationSettings, 'useHeroPalette' | 'aboutPalette' | 'accentColor'>
): string {
  if (p.useHeroPalette !== false) {
    return resolveHeroPaletteColor(mergeAboutPalette(DEFAULT_ABOUT_PALETTE, p.aboutPalette), 'principal');
  }
  return aboutAccentColor(p.accentColor);
}

/**
 * Page / section fill behind the timeline spine — macaron discs must match this
 * so the vertical line is cleanly masked in both light and dark.
 */

/**
 * Micro-labels (LOCATION, LANGUAGES…) stay muted — accent color is reserved for icons.
 * Uses palette `texteMuted` when hero palette is on.
 */
export function aboutSidePanelMicroLabelColor(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'useHeroPalette' | 'aboutPalette' | 'elementStyles'
  >
): string {
  if (p.useHeroPalette !== false) {
    return resolveHeroPaletteColor(mergeAboutPalette(DEFAULT_ABOUT_PALETTE, p.aboutPalette), 'texteMuted');
  }
  const raw = p.elementStyles?.sideLabel?.color;
  if (
    !raw ||
    raw.toLowerCase() === DEFAULT_ABOUT_ACCENT_COLOR.toLowerCase() ||
    raw.toLowerCase() === '#e2572e'
  ) {
    return '#71717a';
  }
  return sanitizeHex(raw, '#71717a');
}

export function sidePanelHeadingClass(): string {
  return 'text-lg font-bold tracking-tight sm:text-xl';
}

export function sidePanelHeadingStyle(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'sidePanelHeadingColor' | 'useHeroPalette' | 'aboutPalette'
  >
): CSSProperties {
  if (p.useHeroPalette !== false) {
    return {
      color: resolveHeroPaletteColor(
        mergeAboutPalette(DEFAULT_ABOUT_PALETTE, p.aboutPalette),
        'texteFort'
      ),
    };
  }
  return { color: sanitizeHex(p.sidePanelHeadingColor, DEFAULT_ABOUT_SIDE_PANEL_HEADING_COLOR) };
}

export function resolveSidePanelHeading(
  p: Pick<PortfolioAboutPresentationSettings, 'sidePanelHeading'>
): string {
  const trimmed = p.sidePanelHeading?.trim();
  return trimmed || 'Infos';
}

const WHY_ME_MARKER_STYLE_VALUES = PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS.map(
  (option) => option.value
) as PortfolioAboutWhyMeMarkerStyle[];

function isPortfolioAboutWhyMeMarkerStyle(
  value: unknown
): value is PortfolioAboutWhyMeMarkerStyle {
  return typeof value === 'string' && (WHY_ME_MARKER_STYLE_VALUES as string[]).includes(value);
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

function toRomanNumeral(value: number): string {
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

/** Text label for number / roman markers; null for glyph or none. */
export function formatWhyMeIndexLabel(
  index: number,
  style: PortfolioAboutWhyMeMarkerStyle
): string | null {
  if (style === 'number') return String(index + 1).padStart(2, '0');
  if (style === 'roman') return toRomanNumeral(index + 1);
  return null;
}

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function clampStatsGap(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(48, Math.max(0, Math.round(n)));
}

export function aboutStatsGapStyle(gap: number): CSSProperties | undefined {
  const px = clampStatsGap(gap, 0);
  if (px <= 0) return undefined;
  return { gap: `${px}px` };
}

export function aboutAccentColor(accent: string): string {
  return sanitizeHex(accent, DEFAULT_ABOUT_ACCENT_COLOR);
}

export function aboutSidePanelTwinAlignClass(
  align: PortfolioAboutSidePanelTwinAlign | undefined
): string {
  switch (align) {
    case 'left':
      return 'lg:justify-start';
    case 'center':
      return 'lg:justify-center';
    default:
      return 'lg:justify-end';
  }
}

export function aboutContentPairAlignClass(
  align: PortfolioAboutContentPairAlign | undefined
): string {
  switch (align) {
    case 'center':
      return 'justify-center';
    case 'end':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}

export function aboutStatEditorialSuffix(label: string): string {
  switch (label.toLowerCase()) {
    case 'years':
    case 'years exp.':
      return 'années';
    case 'content':
    case 'projects':
      return 'contenus';
    case 'languages':
      return 'langues';
    case 'rating':
      return 'note';
    case 'followers':
      return 'abonnés';
    default:
      return label.toLowerCase();
  }
}

export function isAboutRatingStat(label: string): boolean {
  return label.toLowerCase() === 'rating';
}

function aboutCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
    case 'accent':
      return 'border-2';
    default:
      return 'border-0';
  }
}

export function aboutStatCardFrameClass(
  p: Pick<PortfolioAboutPresentationSettings, 'cardBorder' | 'cardBorderRadius' | 'cardPadding'>,
  options?: { includePadding?: boolean }
): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius)];
  if (options?.includePadding !== false) {
    parts.push(servicesCardPaddingClass(p.cardPadding));
  }
  if (p.cardBorder !== 'none') {
    parts.push(aboutCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function aboutStatCardFrameStyle(p: PortfolioAboutPresentationSettings): CSSProperties {
  const style: CSSProperties = {};

  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_ABOUT_CARD_BACKGROUND_COLOR);
  }

  if (p.cardBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_ABOUT_ACCENT_COLOR);
  } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_ABOUT_CARD_BORDER_COLOR);
  }

  return style;
}

export function aboutStatFontStyle(_font: PortfolioAboutStatsFont): CSSProperties | undefined {
  return undefined;
}

export function aboutStatFontClass(font: PortfolioAboutStatsFont, kind: 'value' | 'label'): string {
  if (font === 'display') return 'uppercase';
  if (font === 'serif' && kind === 'label') return 'leading-snug';
  return '';
}

export function aboutStatValueSizeClass(
  size: PortfolioAboutStatsValueSize,
  context: AboutStatValueSizeContext
): string {
  const featured = {
    sm: 'text-3xl sm:text-4xl',
    md: 'text-4xl sm:text-5xl',
    lg: 'text-5xl sm:text-6xl',
    xl: 'text-6xl sm:text-7xl',
  };
  const bar = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };
  const band = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-[2rem]',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };
  const editorial = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const map = { featured, bar, band, editorial }[context];
  return `${map[size]} leading-none tracking-[-0.04em]`;
}

export function aboutStatLabelSizeClass(size: PortfolioAboutStatsLabelSize): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    default:
      return 'text-[10px]';
  }
}

export function aboutStatValueWeightClass(weight: PortfolioAboutStatsValueWeight): string {
  switch (weight) {
    case 'semibold':
      return 'font-semibold';
    case 'bold':
      return 'font-bold';
    case 'black':
      return 'font-black';
    default:
      return 'font-extrabold';
  }
}

export function aboutStatLabelWeightClass(weight: PortfolioAboutStatsLabelWeight): string {
  switch (weight) {
    case 'medium':
      return 'font-medium';
    case 'semibold':
      return 'font-semibold';
    default:
      return 'font-bold';
  }
}

export function aboutStatLabelTrackingClass(tracking: PortfolioAboutStatsLabelTracking): string {
  switch (tracking) {
    case 'tight':
      return 'tracking-tight';
    case 'normal':
      return 'tracking-normal';
    case 'wide':
      return 'tracking-[0.12em]';
    default:
      return 'tracking-[0.2em]';
  }
}

export function aboutStatIconSizeClass(size: PortfolioAboutStatsIconSize): string {
  switch (size) {
    case 'sm':
      return 'h-4 w-4';
    case 'lg':
      return 'h-7 w-7';
    default:
      return 'h-6 w-6';
  }
}

export function aboutStatValueColorStyle(
  settings: Pick<PortfolioAboutPresentationSettings, 'statsValueColor' | 'statsUseAccentForRating'>,
  statLabel: string,
  accent: string
): CSSProperties {
  const valueColor = sanitizeHex(settings.statsValueColor, DEFAULT_ABOUT_STATS_VALUE_COLOR);
  if (isAboutRatingStat(statLabel) && settings.statsUseAccentForRating) {
    const accentHex = sanitizeHex(accent, DEFAULT_ABOUT_ACCENT_COLOR);
    // Near-black accent on ink cards (Noir) is unreadable — fall back to value color.
    if (hexLuminance(accentHex) >= 0.35) {
      return { color: accentHex };
    }
  }
  return { color: valueColor };
}

export function aboutStatLabelColorStyle(labelColor: string): CSSProperties {
  return { color: sanitizeHex(labelColor, DEFAULT_ABOUT_STATS_LABEL_COLOR) };
}

export function aboutStatIconColorStyle(iconColor: string): CSSProperties {
  return { color: sanitizeHex(iconColor, DEFAULT_ABOUT_STATS_ICON_COLOR) };
}

export function aboutSidePanelCardBackgroundSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardBackgroundSettings {
  if (isLegacyDefaultSidePanelBackground(p)) {
    return {
      cardBackgroundFill: 'solid',
      cardBackgroundColorA: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
      cardBackgroundColorB: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
      cardBackgroundSplitAxis: p.sidePanelBackgroundSplitAxis,
      cardBackgroundSplitPosition: p.sidePanelBackgroundSplitPosition,
      cardDividerEnabled: false,
      cardDividerShape: p.sidePanelDividerShape,
      cardDividerAngle: p.sidePanelDividerAngle,
      cardDividerCurveDepth: p.sidePanelDividerCurveDepth,
      cardDividerColor: p.sidePanelDividerColor,
      cardDividerThickness: p.sidePanelDividerThickness,
      cardDividerOpacity: p.sidePanelDividerOpacity,
    };
  }

  return {
    cardBackgroundFill: p.sidePanelBackgroundFill,
    cardBackgroundColorA: p.sidePanelBackgroundColorA,
    cardBackgroundColorB: p.sidePanelBackgroundColorB,
    cardBackgroundSplitAxis: p.sidePanelBackgroundSplitAxis,
    cardBackgroundSplitPosition: p.sidePanelBackgroundSplitPosition,
    cardDividerEnabled: p.sidePanelDividerEnabled,
    cardDividerShape: p.sidePanelDividerShape,
    cardDividerAngle: p.sidePanelDividerAngle,
    cardDividerCurveDepth: p.sidePanelDividerCurveDepth,
    cardDividerColor: p.sidePanelDividerColor,
    cardDividerThickness: p.sidePanelDividerThickness,
    cardDividerOpacity: p.sidePanelDividerOpacity,
  };
}

function mergeSidePanelBackgroundFields(
  base: PortfolioAboutPresentationSettings,
  record: Record<string, unknown>
): Pick<
  PortfolioAboutPresentationSettings,
  | 'sidePanelBackgroundFill'
  | 'sidePanelBackgroundColorA'
  | 'sidePanelBackgroundColorB'
  | 'sidePanelBackgroundSplitAxis'
  | 'sidePanelBackgroundSplitPosition'
  | 'sidePanelDividerEnabled'
  | 'sidePanelDividerShape'
  | 'sidePanelDividerAngle'
  | 'sidePanelDividerCurveDepth'
  | 'sidePanelDividerColor'
  | 'sidePanelDividerThickness'
  | 'sidePanelDividerOpacity'
> {
  const merged = mergeServicesCardBackgroundSettings(aboutSidePanelCardBackgroundSettings(base), {
    cardBackgroundFill: record.sidePanelBackgroundFill,
    cardBackgroundColorA: record.sidePanelBackgroundColorA,
    cardBackgroundColorB: record.sidePanelBackgroundColorB,
    cardBackgroundSplitAxis: record.sidePanelBackgroundSplitAxis,
    cardBackgroundSplitPosition: record.sidePanelBackgroundSplitPosition,
    cardDividerEnabled: record.sidePanelDividerEnabled,
    cardDividerShape: record.sidePanelDividerShape,
    cardDividerAngle: record.sidePanelDividerAngle,
    cardDividerCurveDepth: record.sidePanelDividerCurveDepth,
    cardDividerColor: record.sidePanelDividerColor,
    cardDividerThickness: record.sidePanelDividerThickness,
    cardDividerOpacity: record.sidePanelDividerOpacity,
  });

  return {
    sidePanelBackgroundFill: merged.cardBackgroundFill,
    sidePanelBackgroundColorA: merged.cardBackgroundColorA,
    sidePanelBackgroundColorB: merged.cardBackgroundColorB,
    sidePanelBackgroundSplitAxis: merged.cardBackgroundSplitAxis,
    sidePanelBackgroundSplitPosition: merged.cardBackgroundSplitPosition,
    sidePanelDividerEnabled: merged.cardDividerEnabled,
    sidePanelDividerShape: merged.cardDividerShape,
    sidePanelDividerAngle: merged.cardDividerAngle,
    sidePanelDividerCurveDepth: merged.cardDividerCurveDepth,
    sidePanelDividerColor: merged.cardDividerColor,
    sidePanelDividerThickness: merged.cardDividerThickness,
    sidePanelDividerOpacity: merged.cardDividerOpacity,
  };
}

export function aboutSidePanelFrameClass(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'sidePanelBorder' | 'sidePanelBorderRadius' | 'sidePanelPadding'
  >,
  options?: { includePadding?: boolean }
): string {
  const parts = [servicesCardRadiusClass(p.sidePanelBorderRadius)];
  if (options?.includePadding !== false) {
    parts.push(servicesCardPaddingClass(p.sidePanelPadding));
  }
  if (p.sidePanelBorder !== 'none') {
    parts.push(aboutCardBorderWidthClass(p.sidePanelBorder));
    if (p.sidePanelBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function aboutSidePanelFrameStyle(p: PortfolioAboutPresentationSettings): CSSProperties {
  const style: CSSProperties = {};
  const legacySplit = isLegacyDefaultSidePanelBackground(p);
  const solidFill = p.sidePanelBackgroundFill === 'solid' || legacySplit;

  if (solidFill && p.sidePanelBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(
      legacySplit ? DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR : p.sidePanelBackgroundColor,
      DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR
    );
  }

  if (p.sidePanelBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_ABOUT_ACCENT_COLOR);
  } else if (p.sidePanelBorder === 'soft' || p.sidePanelBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.sidePanelBorderColor, DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR);
  }

  return style;
}

export function aboutSidePanelFullWidthLayoutClass(
  layout: PortfolioAboutSidePanelFullWidthLayout,
  options?: { gapControlled?: boolean }
): string {
  const gapControlled = options?.gapControlled !== false;
  switch (layout) {
    case 'horizontal':
      return gapControlled
        ? 'flex flex-wrap gap-x-6 gap-y-6 sm:gap-x-8'
        : 'flex flex-wrap gap-x-8 gap-y-6 sm:gap-x-10';
    case 'grid-2':
      return gapControlled ? 'grid gap-x-6 sm:grid-cols-2 sm:gap-x-8' : 'grid gap-6 sm:grid-cols-2 sm:gap-8';
    case 'grid-3':
      return gapControlled
        ? 'grid gap-x-6 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3'
        : 'grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3';
    case 'inline-band':
      return 'flex flex-col divide-y divide-neutral-200/80 sm:flex-row sm:items-stretch sm:divide-x sm:divide-y-0';
    case 'profile-frame':
      return 'flex flex-col divide-y divide-neutral-200/80';
    default:
      return 'flex flex-col';
  }
}

/** Equal-column info bar used by the `info-bar` side-panel design. */
export function aboutSidePanelInfoBarLayoutClass(_itemCount: number): string {
  // Dividers are explicit elements (not Tailwind divide/border-r) so every
  // separator shares the palette divider color — no white currentColor leaks.
  return 'flex flex-col sm:flex-row sm:items-stretch';
}

export function aboutSidePanelItemCellClass(
  layout: PortfolioAboutSidePanelFullWidthLayout,
  design: PortfolioAboutSidePanelDesign,
  options?: { gapControlled?: boolean }
): string {
  const gapControlled = options?.gapControlled !== false;
  if (layout === 'inline-band') {
    return 'flex items-center px-5 py-4 sm:flex-1 sm:px-6 sm:py-5';
  }
  if (design === 'info-bar') {
    // Top-align every cell so labels share one baseline (multi-line values must not recenter the row).
    return 'flex min-w-0 flex-1 items-start px-5 py-5 sm:px-7 sm:py-6 lg:px-8';
  }
  if (layout === 'profile-frame') {
    return 'min-w-0 px-4 py-3.5 sm:px-5 sm:py-4';
  }
  if (design === 'cards') {
    return 'min-w-0';
  }
  if (layout !== 'stacked' && design !== 'minimal') {
    return 'min-w-0';
  }
  if (design === 'minimal') {
    return gapControlled ? 'px-0' : 'px-0 py-4 first:pt-0 last:pb-0';
  }
  return gapControlled ? 'px-5 sm:px-6' : 'px-5 py-5 sm:px-6 sm:py-5';
}

export function aboutStatsAutoCenterClass(autoCenter: boolean): string {
  return autoCenter ? 'mx-auto w-fit max-w-full' : 'w-full';
}

export function aboutSidePanelAutoCenterClass(autoCenter: boolean, layout: PortfolioAboutSidePanelFullWidthLayout): string {
  if (!autoCenter) return '';
  if (layout === 'stacked') return 'mx-auto w-full max-w-2xl';
  return 'mx-auto w-fit max-w-full justify-items-center justify-center';
}

export function filterAboutStats(
  stats: Array<{ value: string; label: string }>,
  settings: Pick<
    PortfolioAboutPresentationSettings,
    'showStatYears' | 'showStatContent' | 'showStatLanguages' | 'showStatRating'
  >
): Array<{ value: string; label: string }> {
  return stats.filter((stat) => {
    switch (stat.label.toLowerCase()) {
      case 'years':
        return settings.showStatYears;
      case 'content':
        return settings.showStatContent;
      case 'languages':
        return settings.showStatLanguages;
      case 'rating':
        return settings.showStatRating;
      default:
        return true;
    }
  });
}

type AboutSideInfoItemId = 'location' | 'languages' | 'gender' | 'member-since' | 'availability';

export function isAboutSideInfoItemVisible(
  id: AboutSideInfoItemId,
  settings: Pick<
    PortfolioAboutPresentationSettings,
    | 'showSidePanelLocation'
    | 'showSidePanelLanguages'
    | 'showSidePanelGender'
    | 'showSidePanelMemberSince'
    | 'showSidePanelAvailability'
  >
): boolean {
  switch (id) {
    case 'location':
      return settings.showSidePanelLocation;
    case 'languages':
      return settings.showSidePanelLanguages;
    case 'gender':
      return settings.showSidePanelGender;
    case 'member-since':
      return settings.showSidePanelMemberSince;
    case 'availability':
      return settings.showSidePanelAvailability;
    default:
      return true;
  }
}

export function aboutSidePanelShellClass(design: PortfolioAboutSidePanelDesign): string {
  switch (design) {
    case 'cards':
      return 'flex w-full flex-col';
    case 'info-bar':
      return 'w-full';
    case 'info-strip':
    case 'profile-cv':
      return 'w-full';
    case 'minimal':
    case 'list':
      return 'flex w-full flex-col';
    default:
      return 'w-full overflow-hidden rounded-[1.35rem] border border-neutral-200/80 pf-muted-card-gradient shadow-sm';
  }
}

export function aboutSidePanelDividerColor(p: PortfolioAboutPresentationSettings): string {
  return sanitizeHex(p.sidePanelDividerColor, DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR);
}

/** Soft principal wash for icon badges (cards / info-bar / profile-cv). */
export function aboutSidePanelAccentSoftBackground(accent: string): string {
  return `color-mix(in srgb, ${aboutAccentColor(accent)} 16%, transparent)`;
}

export function pickAboutPresentationSettings(about: unknown): PortfolioAboutPresentationSettings {
  return mergeAboutPresentation(DEFAULT_ABOUT_PRESENTATION, about);
}

export function mergeAboutPresentation(
  base: PortfolioAboutPresentationSettings,
  patch: unknown
): PortfolioAboutPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const background = mergeSectionBackground(base, patch);
  const cardBackground = mergeServicesCardBackgroundSettings(base, patch);

  const merged: PortfolioAboutPresentationSettings = {
    ...background,
    ...cardBackground,
    titlePreset: pick(
      record.titlePreset,
      ['about', 'my-story', 'who-i-am', 'behind-the-work', 'custom'],
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'personal', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    subtitleSerif: typeof record.subtitleSerif === 'boolean' ? record.subtitleSerif : base.subtitleSerif,
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    showAboutHeading: false,
    showStats: typeof record.showStats === 'boolean' ? record.showStats : base.showStats,
    showSidePanel: typeof record.showSidePanel === 'boolean' ? record.showSidePanel : base.showSidePanel,
    sectionLayout: isPortfolioAboutSectionLayout(record.sectionLayout)
      ? record.sectionLayout
      : (base.sectionLayout ?? 'stacked'),
    illustrationVariant: 'none',
    illustrationPlacement: pick(
      record.illustrationPlacement,
      ['left', 'right'],
      base.illustrationPlacement ?? 'right'
    ),
    layoutMode: pick(
      record.layoutMode,
      ['sidebar-right', 'sidebar-left', 'full-width', 'twin-columns'],
      base.layoutMode
    ),
    fullWidthPanelPlacement: pick(
      record.fullWidthPanelPlacement,
      ['above-stats', 'below-stats', 'below-content'],
      base.fullWidthPanelPlacement
    ),
    statsDesign: (() => {
      const raw = record.statsDesign;
      if (raw === 'unified-band' || raw === 'featured' || raw === 'editorial-list') {
        return raw;
      }
      if (raw === 'grid') return 'unified-band';
      if (raw === 'inline') return 'featured';
      if (raw === 'minimal') return 'editorial-list';
      return base.statsDesign;
    })(),
    statsGroupMode: pick(record.statsGroupMode, ['unified', 'separated'], base.statsGroupMode),
    statsGap: clampStatsGap(record.statsGap, base.statsGap),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean' ? record.cardBackgroundEnabled : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    statsValueColor: sanitizeHex(record.statsValueColor, base.statsValueColor),
    statsLabelColor: sanitizeHex(record.statsLabelColor, base.statsLabelColor),
    statsIconColor: sanitizeHex(record.statsIconColor, base.statsIconColor),
    statsUseAccentForRating:
      typeof record.statsUseAccentForRating === 'boolean'
        ? record.statsUseAccentForRating
        : base.statsUseAccentForRating,
    statsValueFont: pick(record.statsValueFont, ['sans', 'serif', 'display'], base.statsValueFont),
    statsLabelFont: pick(record.statsLabelFont, ['sans', 'serif', 'display'], base.statsLabelFont),
    statsValueSize: pick(record.statsValueSize, ['sm', 'md', 'lg', 'xl'], base.statsValueSize),
    statsLabelSize: pick(record.statsLabelSize, ['xs', 'sm', 'md'], base.statsLabelSize),
    statsValueWeight: pick(
      record.statsValueWeight,
      ['semibold', 'bold', 'extrabold', 'black'],
      base.statsValueWeight
    ),
    statsLabelWeight: pick(record.statsLabelWeight, ['medium', 'semibold', 'bold'], base.statsLabelWeight),
    statsLabelUppercase:
      typeof record.statsLabelUppercase === 'boolean' ? record.statsLabelUppercase : base.statsLabelUppercase,
    statsLabelTracking: pick(
      record.statsLabelTracking,
      ['tight', 'normal', 'wide', 'extra'],
      base.statsLabelTracking
    ),
    statsIconSize: pick(record.statsIconSize, ['sm', 'md', 'lg'], base.statsIconSize),
    showStatYears: typeof record.showStatYears === 'boolean' ? record.showStatYears : base.showStatYears,
    showStatContent:
      typeof record.showStatContent === 'boolean' ? record.showStatContent : base.showStatContent,
    showStatLanguages:
      typeof record.showStatLanguages === 'boolean' ? record.showStatLanguages : base.showStatLanguages,
    showStatRating:
      typeof record.showStatRating === 'boolean' ? record.showStatRating : base.showStatRating,
    statsAutoCenter:
      typeof record.statsAutoCenter === 'boolean' ? record.statsAutoCenter : base.statsAutoCenter,
    sidePanelDesign: pick(
      record.sidePanelDesign,
      ['framed', 'cards', 'minimal', 'info-bar', 'list', 'info-strip', 'profile-cv'],
      base.sidePanelDesign
    ),
    sidePanelFullWidthLayout: pick(
      record.sidePanelFullWidthLayout,
      ['stacked', 'grid-2', 'grid-3', 'horizontal', 'inline-band', 'profile-frame'],
      base.sidePanelFullWidthLayout
    ),
    sidePanelBio:
      typeof record.sidePanelBio === 'string' ? record.sidePanelBio : base.sidePanelBio ?? '',
    showSidePanelBio:
      typeof record.showSidePanelBio === 'boolean'
        ? record.showSidePanelBio
        : (base.showSidePanelBio ?? true),
    sidePanelIconPlacement: isPortfolioAboutSidePanelIconPlacement(record.sidePanelIconPlacement)
      ? record.sidePanelIconPlacement
      : base.sidePanelIconPlacement,
    sidePanelShowIcons:
      typeof record.sidePanelShowIcons === 'boolean'
        ? record.sidePanelShowIcons
        : base.sidePanelShowIcons,
    showSidePanelHeading:
      typeof record.showSidePanelHeading === 'boolean'
        ? record.showSidePanelHeading
        : base.showSidePanelHeading,
    sidePanelHeading:
      typeof record.sidePanelHeading === 'string' && record.sidePanelHeading.trim()
        ? record.sidePanelHeading.trim()
        : base.sidePanelHeading,
    sidePanelHeadingColor: sanitizeHex(
      record.sidePanelHeadingColor,
      base.sidePanelHeadingColor ?? DEFAULT_ABOUT_SIDE_PANEL_HEADING_COLOR
    ),
    sidePanelMarkerStyle: isPortfolioAboutWhyMeMarkerStyle(record.sidePanelMarkerStyle)
      ? record.sidePanelMarkerStyle
      : base.sidePanelMarkerStyle,
    sidePanelMarkerSize: pick(
      record.sidePanelMarkerSize,
      ['sm', 'md', 'lg', 'xl', 'custom'],
      base.sidePanelMarkerSize
    ),
    sidePanelMarkerSizePx: clampListMarkerSizePx(
      record.sidePanelMarkerSizePx,
      base.sidePanelMarkerSizePx ?? ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX.md
    ),
    sidePanelMarkerWeight: isPortfolioListMarkerWeight(record.sidePanelMarkerWeight)
      ? record.sidePanelMarkerWeight
      : base.sidePanelMarkerWeight ?? 'regular',
    sidePanelMarkerWeightAmount: clampListMarkerWeightAmount(
      record.sidePanelMarkerWeightAmount,
      base.sidePanelMarkerWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    sidePanelMarkerColor: sanitizeHex(record.sidePanelMarkerColor, base.sidePanelMarkerColor),
    sidePanelContentGap: isPortfolioAboutSidePanelContentGap(record.sidePanelContentGap)
      ? record.sidePanelContentGap
      : base.sidePanelContentGap,
    sidePanelContentGapPx: clampAboutSidePanelContentGapPx(
      record.sidePanelContentGapPx,
      base.sidePanelContentGapPx
    ),
    sidePanelBorder: pick(record.sidePanelBorder, ['none', 'soft', 'solid', 'accent'], base.sidePanelBorder),
    sidePanelBorderColor: sanitizeHex(record.sidePanelBorderColor, base.sidePanelBorderColor),
    sidePanelSettingsRevision:
      typeof record.sidePanelSettingsRevision === 'number' && Number.isFinite(record.sidePanelSettingsRevision)
        ? Math.max(0, Math.floor(record.sidePanelSettingsRevision))
        : 0,
    sidePanelBackgroundEnabled:
      typeof record.sidePanelBackgroundEnabled === 'boolean'
        ? record.sidePanelBackgroundEnabled
        : base.sidePanelBackgroundEnabled,
    sidePanelBackgroundColor: sanitizeHex(record.sidePanelBackgroundColor, base.sidePanelBackgroundColor),
    sidePanelBorderRadius: pick(
      record.sidePanelBorderRadius,
      ['none', 'sm', 'md', 'lg', 'xl'],
      base.sidePanelBorderRadius
    ),
    sidePanelPadding: pick(record.sidePanelPadding, ['none', 'sm', 'md', 'lg'], base.sidePanelPadding),
    ...mergeSidePanelBackgroundFields(base, record),
    showSidePanelLocation: (() => {
      if (typeof record.showSidePanelLocation !== 'boolean') return base.showSidePanelLocation;
      // Pre-responseTime-flag saves briefly hid location by default — restore show-by-default.
      if (
        record.showSidePanelLocation === false &&
        typeof record.showSidePanelResponseTime !== 'boolean'
      ) {
        return true;
      }
      return record.showSidePanelLocation;
    })(),
    showSidePanelLanguages:
      typeof record.showSidePanelLanguages === 'boolean'
        ? record.showSidePanelLanguages
        : base.showSidePanelLanguages,
    showSidePanelGender:
      typeof record.showSidePanelGender === 'boolean' ? record.showSidePanelGender : base.showSidePanelGender,
    showSidePanelMemberSince:
      typeof record.showSidePanelMemberSince === 'boolean'
        ? record.showSidePanelMemberSince
        : base.showSidePanelMemberSince,
    showSidePanelAvailability:
      typeof record.showSidePanelAvailability === 'boolean'
        ? record.showSidePanelAvailability
        : base.showSidePanelAvailability,
    showSidePanelResponseTime:
      typeof record.showSidePanelResponseTime === 'boolean'
        ? record.showSidePanelResponseTime
        : base.showSidePanelResponseTime,
    sidePanelAutoCenter:
      typeof record.sidePanelAutoCenter === 'boolean' ? record.sidePanelAutoCenter : base.sidePanelAutoCenter,
    sidePanelTwinAlign: pick(
      record.sidePanelTwinAlign,
      ['left', 'center', 'right'],
      base.sidePanelTwinAlign ?? 'right'
    ),
    twinColumnsSplit: (() => {
      const raw = record.twinColumnsSplit;
      if (raw === 'why-me-70') return 'main-70';
      return pick(raw, ['equal', 'main-70', 'auto'], base.twinColumnsSplit ?? 'equal');
    })(),
    contentPairAlign: pick(
      record.contentPairAlign,
      ['start', 'center', 'end'],
      base.contentPairAlign ?? 'start'
    ),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
    aboutPalette: mergeAboutPalette(
      mergeAboutPalette(DEFAULT_ABOUT_PALETTE, base.aboutPalette),
      record.aboutPalette
    ),
    aboutColorBindings: mergeAboutColorBindings(
      mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, base.aboutColorBindings),
      record.aboutColorBindings
    ),
    elementStyles: normalizeElementStylesRecord(
      record.elementStyles ?? base.elementStyles,
      DEFAULT_ABOUT_ELEMENT_STYLES,
      ABOUT_STYLE_TARGET_IDS
    ),
  };

  let next = merged;

  if (next.sidePanelSettingsRevision < ABOUT_SIDE_PANEL_SETTINGS_REVISION) {
    const prevRevision = next.sidePanelSettingsRevision;
    next = {
      ...next,
      ...(next.sidePanelBorder === 'soft' || typeof record.sidePanelBorder !== 'string'
        ? { sidePanelBorder: 'none' as const }
        : {}),
      ...(prevRevision < 3
        ? {
            elementStyles: {
              ...next.elementStyles,
              sideLabel: {
                ...next.elementStyles.sideLabel,
                color: DEFAULT_ELEMENT_MUTED_COLOR,
              },
            },
            aboutColorBindings: mergeAboutColorBindings(
              mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, next.aboutColorBindings),
              { sideLabel: 'texteMuted' }
            ),
            sidePanelContentGapPx:
              next.sidePanelContentGap === 'md'
                ? 32
                : next.sidePanelContentGap === 'sm'
                  ? 24
                  : next.sidePanelContentGapPx,
          }
        : {}),
      sidePanelSettingsRevision: ABOUT_SIDE_PANEL_SETTINGS_REVISION,
    };
  }

  if (isLegacyDefaultSidePanelBackground(next)) {
    next = {
      ...next,
      ...DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND,
      sidePanelBackgroundColor: DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR,
      showSidePanelLocation: true,
      showSidePanelResponseTime: false,
    };
  }


  if (next.useHeroPalette === false) {
    return next;
  }

  return {
    ...next,
    ...(applyAboutPaletteToSettings(next) as Partial<PortfolioAboutPresentationSettings>),
    useHeroPalette: true,
  };
}
