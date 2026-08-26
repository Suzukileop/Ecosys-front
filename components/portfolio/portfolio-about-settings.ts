import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
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
  mergeServicesCardDecorSettings,
  type PortfolioServicesCardDecorSettings,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import type { PortfolioCardFrameSettings } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import {
  servicesCardPaddingClass,
  servicesCardRadiusClass,
  type PortfolioServicesCardBorder,
  type PortfolioServicesCardPadding,
  type PortfolioServicesCardRadius,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  sectionBackgroundBlockColor,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  createElementTextStyle,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  DEFAULT_ELEMENT_BODY_COLOR,
  DEFAULT_ELEMENT_MUTED_COLOR,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  isPortfolioListMarkerWeight,
  clampListMarkerSizePx,
  clampListMarkerWeightAmount,
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';

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
export type PortfolioAboutTwinColumnsSplit = 'equal' | 'why-me-70' | 'auto';

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

export type PortfolioAboutWhyMeDesign = 'timeline' | 'split' | 'lined-list' | 'media-aside';

/** How many Why me cards per row on large screens (not Stack). */
export type PortfolioAboutWhyMeItemsPerRow = 1 | 2 | 3 | 4;

export type PortfolioAboutWhyMeMediaPlacement =
  | 'alternate'
  | 'media-left'
  | 'media-right'
  | 'media-top'
  | 'text-only';

export type PortfolioAboutWhyMeContentAlign = 'left' | 'center' | 'right';

/** How header chrome (number / icon) sits relative to the phrase. */
export type PortfolioAboutWhyMeBodyLayout = 'stack' | 'inline';

export type PortfolioAboutWhyMeHeadingPreset =
  | 'default'
  | 'why-work-with-me'
  | 'why-choose-me'
  | 'my-approach'
  | 'strengths'
  | 'value'
  | 'custom';

export type PortfolioAboutWhyMeHeadingSize = 'sm' | 'md' | 'lg';

export type PortfolioAboutWhyMeGap = 'sm' | 'md' | 'lg' | 'custom';

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

/** Where the Why me marker sits: header row (current) or leading before each card. */
export type PortfolioAboutWhyMeMarkerPlacement = 'top' | 'before';

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
export type PortfolioAboutStyleTarget =
  | 'whyMeBody'
  | 'whyMeBullet'
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
  subtitleSerif: boolean;
  headerAlignment: PortfolioAboutHeaderAlignment;
  /** When false, hide the About section sticky title (Infos / Why choose me keep their own). */
  showAboutHeading: boolean;
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
  whyMeMediaPlacement: PortfolioAboutWhyMeMediaPlacement;
  whyMeContentAlign: PortfolioAboutWhyMeContentAlign;
  /** Stack = phrase under number/icon; inline = phrase on the same row. */
  whyMeBodyLayout: PortfolioAboutWhyMeBodyLayout;
  whyMeGap: PortfolioAboutWhyMeGap;
  /** Exact gap in px when whyMeGap is `custom` (or synced from presets). */
  whyMeGapPx: number;
  whyMeBorder: PortfolioServicesCardBorder;
  whyMeBorderColor: string;
  whyMeBackgroundEnabled: boolean;
  whyMeBackgroundColor: string;
  whyMeBorderRadius: PortfolioServicesCardRadius;
  whyMePadding: PortfolioServicesCardPadding;
  whyMeBackgroundFill: PortfolioServicesCardBackgroundSettings['cardBackgroundFill'];
  whyMeBackgroundColorA: string;
  whyMeBackgroundColorB: string;
  whyMeBackgroundSplitAxis: PortfolioServicesCardBackgroundSettings['cardBackgroundSplitAxis'];
  whyMeBackgroundSplitPosition: number;
  whyMeDividerEnabled: boolean;
  whyMeDividerShape: PortfolioServicesCardBackgroundSettings['cardDividerShape'];
  whyMeDividerAngle: number;
  whyMeDividerCurveDepth: number;
  whyMeDividerColor: string;
  whyMeDividerThickness: number;
  whyMeDividerOpacity: number;
  whyMeDecorEnabled: boolean;
  whyMeDecorShape: PortfolioServicesCardDecorSettings['cardDecorShape'];
  whyMeDecorColor: string;
  whyMeDecorOpacity: number;
  whyMeDecorSize: number;
  whyMeDecorX: number;
  whyMeDecorY: number;
  whyMeDecorRotation: number;
  whyMeDecorAlternation: PortfolioServicesCardDecorSettings['cardDecorAlternation'];
  whyMeDesign: PortfolioAboutWhyMeDesign;
  /** Cards per row on large screens (editorial / compact / minimal / grid). */
  whyMeItemsPerRow: PortfolioAboutWhyMeItemsPerRow;
  /** Index marker on Why me cards: 01 / I / hyper bullets / none. */
  whyMeMarkerStyle: PortfolioAboutWhyMeMarkerStyle;
  /** Marker in the header row, or leading in front of each card. */
  whyMeMarkerPlacement: PortfolioAboutWhyMeMarkerPlacement;
  /** Icon chip + accent rule after the marker (circled chrome). */
  whyMeShowHeaderAccent: boolean;
  /** Glyph / number size for the Why me index marker. */
  whyMeMarkerSize: PortfolioAboutWhyMeMarkerSize;
  whyMeMarkerSizePx: number;
  whyMeMarkerWeight: PortfolioListMarkerWeight;
  whyMeMarkerWeightAmount: number;
  /** Marker color (defaults to section accent). */
  whyMeMarkerColor: string;
  whyMeHeadingPreset: PortfolioAboutWhyMeHeadingPreset;
  whyMeHeadingCustom: string;
  whyMeHeadingAlignment: PortfolioAboutWhyMeContentAlign;
  whyMeHeadingFont: PortfolioAboutHeaderFont;
  whyMeHeadingColor: string;
  whyMeHeadingSize: PortfolioAboutWhyMeHeadingSize;
  whyMeHeadingUppercase: boolean;
  accentColor: string;
  showStats: boolean;
  showSidePanel: boolean;
  showWhyMe: boolean;
  showWhyMeHeading: boolean;
  whyMeHeading: string;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /**
   * Runtime light/dark (from Global). Used when `useHeroPalette` is false so
   * element `color` / `colorDark` pairs resolve correctly.
   */
  activeColorMode?: 'light' | 'dark';
  /** About-owned palette copy (same 8 tokens as Hero). */
  aboutPalette?: PortfolioAboutPalette;
  /** Which token each about color slot uses. */
  aboutColorBindings?: PortfolioAboutColorBindings;
  /** Per-element color, font, size, and weight for Why me text and side panel rows. */
  elementStyles: PortfolioAboutElementStyles;
};

export type PortfolioAboutSectionSettings = PortfolioSectionCopy & PortfolioAboutPresentationSettings;

export const DEFAULT_ABOUT_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_ABOUT_SUBTITLE_COLOR = '#737373';
export const DEFAULT_ABOUT_ACCENT_COLOR = '#ea580c';
export const DEFAULT_ABOUT_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_ABOUT_CARD_BACKGROUND_COLOR = '#f5f5f5';
export const DEFAULT_ABOUT_STATS_VALUE_COLOR = '#0a0a0a';
export const DEFAULT_ABOUT_STATS_LABEL_COLOR = '#525252';
export const DEFAULT_ABOUT_STATS_ICON_COLOR = '#525252';
export const DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_ABOUT_SIDE_PANEL_BACKGROUND_COLOR = '#f5f5f5';
/** v2: profile side panel is borderless by default. */
export const ABOUT_SIDE_PANEL_SETTINGS_REVISION = 3;
export const DEFAULT_ABOUT_WHY_ME_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_ABOUT_WHY_ME_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_ABOUT_WHY_ME_HEADING_COLOR = '#a3a3a3';
export const DEFAULT_ABOUT_SIDE_PANEL_HEADING_COLOR = '#171717';
/** Previous factory default (soft accent circle on every card) — migrate off. */
const LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR: Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeDecorEnabled'
  | 'whyMeDecorShape'
  | 'whyMeDecorColor'
  | 'whyMeDecorOpacity'
  | 'whyMeDecorSize'
  | 'whyMeDecorX'
  | 'whyMeDecorY'
  | 'whyMeDecorRotation'
  | 'whyMeDecorAlternation'
> = {
  whyMeDecorEnabled: true,
  whyMeDecorShape: 'circle',
  whyMeDecorColor: DEFAULT_ABOUT_ACCENT_COLOR,
  whyMeDecorOpacity: 8,
  whyMeDecorSize: 48,
  whyMeDecorX: 92,
  whyMeDecorY: 8,
  whyMeDecorRotation: 0,
  whyMeDecorAlternation: 'none',
};

const DEFAULT_ABOUT_WHY_ME_DECOR: typeof LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR = {
  ...LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR,
  whyMeDecorEnabled: false,
};

function isLegacyDefaultWhyMeDecor(
  p: Pick<
    PortfolioAboutPresentationSettings,
    | 'whyMeDecorEnabled'
    | 'whyMeDecorShape'
    | 'whyMeDecorColor'
    | 'whyMeDecorOpacity'
    | 'whyMeDecorSize'
    | 'whyMeDecorX'
    | 'whyMeDecorY'
    | 'whyMeDecorRotation'
    | 'whyMeDecorAlternation'
  >
): boolean {
  const hex = (value: string) => value.trim().toLowerCase();
  return (
    p.whyMeDecorEnabled === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorEnabled &&
    p.whyMeDecorShape === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorShape &&
    hex(p.whyMeDecorColor) === hex(LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorColor) &&
    p.whyMeDecorOpacity === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorOpacity &&
    p.whyMeDecorSize === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorSize &&
    p.whyMeDecorX === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorX &&
    p.whyMeDecorY === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorY &&
    p.whyMeDecorRotation === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorRotation &&
    p.whyMeDecorAlternation === LEGACY_DEFAULT_ABOUT_WHY_ME_DECOR.whyMeDecorAlternation
  );
}

const DEFAULT_ABOUT_WHY_ME_BACKGROUND: Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeBackgroundFill'
  | 'whyMeBackgroundColorA'
  | 'whyMeBackgroundColorB'
  | 'whyMeBackgroundSplitAxis'
  | 'whyMeBackgroundSplitPosition'
  | 'whyMeDividerEnabled'
  | 'whyMeDividerShape'
  | 'whyMeDividerAngle'
  | 'whyMeDividerCurveDepth'
  | 'whyMeDividerColor'
  | 'whyMeDividerThickness'
  | 'whyMeDividerOpacity'
> = {
  whyMeBackgroundFill: 'solid',
  whyMeBackgroundColorA: '#ffffff',
  whyMeBackgroundColorB: '#fafafa',
  whyMeBackgroundSplitAxis: 'y',
  whyMeBackgroundSplitPosition: 55,
  whyMeDividerEnabled: false,
  whyMeDividerShape: 'straight',
  whyMeDividerAngle: 165,
  whyMeDividerCurveDepth: 14,
  whyMeDividerColor: '#e5e5e5',
  whyMeDividerThickness: 1,
  whyMeDividerOpacity: 70,
};

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

export const ABOUT_STYLE_TARGET_IDS: PortfolioAboutStyleTarget[] = [
  'whyMeBody',
  'whyMeBullet',
  'sideLabel',
  'sideTitle',
  'sideSubtitle',
];

export const DEFAULT_ABOUT_ELEMENT_STYLES: PortfolioAboutElementStyles = {
  whyMeBody: createElementTextStyle({ color: DEFAULT_ELEMENT_BODY_COLOR, size: 'md' }),
  whyMeBullet: createElementTextStyle({ color: DEFAULT_ELEMENT_BODY_COLOR, size: 'sm' }),
  sideLabel: createElementTextStyle({
    color: DEFAULT_ELEMENT_MUTED_COLOR,
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  sideTitle: createElementTextStyle({ color: DEFAULT_ABOUT_TITLE_COLOR, size: 'md', bold: true }),
  sideSubtitle: createElementTextStyle({ color: DEFAULT_ELEMENT_MUTED_COLOR, size: 'sm' }),
};

export const PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS: {
  value: PortfolioAboutStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'whyMeBody', label: 'Why me text', description: 'Paragraph text inside each Why me block.' },
  { value: 'whyMeBullet', label: 'Why me bullets', description: 'Bullet list items inside Why me blocks.' },
  {
    value: 'sideLabel',
    label: 'Side panel label',
    description: 'Muted caption above each profile side panel item (LOCATION, LANGUAGES…).',
  },
  {
    value: 'sideTitle',
    label: 'Side panel title',
    description: 'Main value line in the profile side panel.',
  },
  {
    value: 'sideSubtitle',
    label: 'Side panel subtitle',
    description: 'Secondary line under the side panel title.',
  },
];

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
  subtitleSerif: true,
  headerAlignment: 'left',
  showAboutHeading: false,
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
  twinColumnsSplit: 'why-me-70',
  contentPairAlign: 'start',
  whyMeMediaPlacement: 'text-only',
  whyMeContentAlign: 'left',
  whyMeBodyLayout: 'stack',
  whyMeGap: 'md',
  whyMeGapPx: 24,
  whyMeBorder: 'soft',
  whyMeBorderColor: DEFAULT_ABOUT_WHY_ME_BORDER_COLOR,
  whyMeBackgroundEnabled: true,
  whyMeBackgroundColor: DEFAULT_ABOUT_WHY_ME_BACKGROUND_COLOR,
  whyMeBorderRadius: 'lg',
  whyMePadding: 'lg',
  ...DEFAULT_ABOUT_WHY_ME_BACKGROUND,
  ...DEFAULT_ABOUT_WHY_ME_DECOR,
  whyMeDesign: 'timeline',
  whyMeItemsPerRow: 1,
  whyMeMarkerStyle: 'number',
  whyMeMarkerPlacement: 'top',
  whyMeShowHeaderAccent: true,
  whyMeMarkerSize: 'md',
  whyMeMarkerSizePx: ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX.md,
  whyMeMarkerWeight: 'regular',
  whyMeMarkerWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
  whyMeMarkerColor: DEFAULT_ABOUT_ACCENT_COLOR,
  whyMeHeadingPreset: 'default',
  whyMeHeadingCustom: '',
  whyMeHeadingAlignment: 'left',
  whyMeHeadingFont: 'sans',
  whyMeHeadingColor: DEFAULT_ABOUT_WHY_ME_HEADING_COLOR,
  whyMeHeadingSize: 'sm',
  whyMeHeadingUppercase: true,
  accentColor: DEFAULT_ABOUT_ACCENT_COLOR,
  showStats: false,
  showSidePanel: true,
  showWhyMe: true,
  showWhyMeHeading: true,
  whyMeHeading: 'Why work with me',
  useHeroPalette: true,
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

export const PORTFOLIO_ABOUT_TITLE_PRESET_OPTIONS: {
  value: PortfolioAboutTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'about', label: 'About', description: 'Classic section label.' },
  { value: 'my-story', label: 'My story', description: 'Personal narrative tone.' },
  { value: 'who-i-am', label: 'Who I am', description: 'Human and approachable.' },
  { value: 'behind-the-work', label: 'Behind the work', description: 'Process and background focus.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_ABOUT_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioAboutSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One line about approach and background.' },
  { value: 'personal', label: 'Personal', description: 'Warmer, relationship-focused line.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_ABOUT_HEADER_FONT_OPTIONS: {
  value: PortfolioAboutHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_ABOUT_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioAboutSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus, contenu en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre à gauche, contenu à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Contenu à gauche, titre à droite (côte à côte).',
  },
];

export function isPortfolioAboutSectionLayout(value: unknown): value is PortfolioAboutSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function aboutSectionLayoutIsAside(layout: PortfolioAboutSectionLayout | undefined): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + About body (large screens). */
export function aboutAsideLayoutClass(layout: PortfolioAboutSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const PORTFOLIO_ABOUT_ILLUSTRATION_OPTIONS: {
  value: PortfolioAboutIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de SVG décoratif.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point d’interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposés.' },
  { value: 'support', label: 'Support', description: 'Illustration support.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_ABOUT_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioAboutIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche du contenu.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite du contenu.' },
];

export function isPortfolioAboutIllustrationVariant(
  value: unknown
): value is PortfolioAboutIllustrationVariant {
  return (
    value === 'none' ||
    value === 'chat' ||
    value === 'question' ||
    value === 'docs' ||
    value === 'support' ||
    value === 'hex'
  );
}

export function isPortfolioAboutIllustrationPlacement(
  value: unknown
): value is PortfolioAboutIllustrationPlacement {
  return value === 'left' || value === 'right';
}

export const PORTFOLIO_ABOUT_LAYOUT_MODE_OPTIONS: {
  value: PortfolioAboutLayoutMode;
  label: string;
  description: string;
}[] = [
  { value: 'sidebar-right', label: 'Sidebar right', description: 'Main content left, profile panel right.' },
  { value: 'sidebar-left', label: 'Sidebar left', description: 'Profile panel on the left.' },
  { value: 'full-width', label: 'Full width', description: 'No sidebar column — panel stacks below.' },
  {
    value: 'twin-columns',
    label: 'Two columns',
    description:
      'Why me and infos side by side — Why me can take more width (70/30, auto, or equal).',
  },
];

export const PORTFOLIO_ABOUT_SIDE_PANEL_TWIN_ALIGN_OPTIONS: {
  value: PortfolioAboutSidePanelTwinAlign;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Panneau infos collé à gauche de sa colonne.' },
  { value: 'center', label: 'Centre', description: 'Panneau infos centré dans sa colonne.' },
  { value: 'right', label: 'Droite', description: 'Panneau infos collé à droite de sa colonne.' },
];

export const PORTFOLIO_ABOUT_TWIN_COLUMNS_SPLIT_OPTIONS: {
  value: PortfolioAboutTwinColumnsSplit;
  label: string;
  description: string;
}[] = [
  {
    value: 'equal',
    label: 'Égal',
    description: '50 / 50 — Why me et Infos partagent la même largeur.',
  },
  {
    value: 'why-me-70',
    label: '70 / 30',
    description: 'Why me ~70 %, panneau Infos ~30 %.',
  },
  {
    value: 'auto',
    label: 'Auto',
    description: 'Infos épouse son contenu ; Why me prend le reste.',
  },
];

export const PORTFOLIO_ABOUT_CONTENT_PAIR_ALIGN_OPTIONS: {
  value: PortfolioAboutContentPairAlign;
  label: string;
  description: string;
}[] = [
  {
    value: 'start',
    label: 'Gauche',
    description: 'Le duo Infos + Why me reste à gauche de la section.',
  },
  {
    value: 'center',
    label: 'Centre',
    description: 'Centre les deux blocs ensemble au milieu de la page.',
  },
  {
    value: 'end',
    label: 'Droite',
    description: 'Place le duo Infos + Why me à droite de la section.',
  },
];

export const PORTFOLIO_ABOUT_FULL_WIDTH_PANEL_PLACEMENT_OPTIONS: {
  value: PortfolioAboutFullWidthPanelPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'above-stats',
    label: 'Au-dessus des stats',
    description: 'Panneau profil placé entre le titre et la rangée de stats.',
  },
  {
    value: 'below-stats',
    label: 'Sous les stats',
    description: 'Juste après les stats, avant Why me.',
  },
  {
    value: 'below-content',
    label: 'Après le contenu',
    description: 'Sous Why me — position par défaut en pleine largeur.',
  },
];

export const PORTFOLIO_ABOUT_STATS_DESIGN_OPTIONS: {
  value: PortfolioAboutStatsDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'unified-band',
    label: 'Bande unifiée',
    description: 'Une seule barre avec séparateurs verticaux — 4 stats alignées.',
  },
  {
    value: 'featured',
    label: 'Stat en vedette',
    description: 'Note / rating mise en avant à gauche, autres stats en barres à droite.',
  },
  {
    value: 'editorial-list',
    label: 'Liste éditoriale',
    description: 'Icônes et libellés inline, sans grands cadres.',
  },
];

export const PORTFOLIO_ABOUT_STATS_GROUP_MODE_OPTIONS: {
  value: PortfolioAboutStatsGroupMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'unified',
    label: 'Bande unifiée',
    description: 'Cartes rapprochées — même style séparé, espacement plus serré.',
  },
  {
    value: 'separated',
    label: 'Cartes séparées',
    description: 'Chaque stat dans son propre cadre — espacement réglable (défaut).',
  },
];

export const PORTFOLIO_ABOUT_STATS_VALUE_SIZE_OPTIONS: {
  value: PortfolioAboutStatsValueSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Chiffres compacts.' },
  { value: 'md', label: 'M', description: 'Taille équilibrée.' },
  { value: 'lg', label: 'L', description: 'Valeurs bien visibles — défaut.' },
  { value: 'xl', label: 'XL', description: 'Très grand — idéal stat en vedette.' },
];

export const PORTFOLIO_ABOUT_STATS_LABEL_SIZE_OPTIONS: {
  value: PortfolioAboutStatsLabelSize;
  label: string;
  description: string;
}[] = [
  { value: 'xs', label: 'XS', description: 'Petit libellé uppercase — défaut.' },
  { value: 'sm', label: 'S', description: 'Libellé légèrement plus grand.' },
  { value: 'md', label: 'M', description: 'Libellé lisible, style phrase.' },
];

export const PORTFOLIO_ABOUT_STATS_VALUE_WEIGHT_OPTIONS: {
  value: PortfolioAboutStatsValueWeight;
  label: string;
}[] = [
  { value: 'semibold', label: 'Semi-bold' },
  { value: 'bold', label: 'Bold' },
  { value: 'extrabold', label: 'Extra-bold' },
  { value: 'black', label: 'Black' },
];

export const PORTFOLIO_ABOUT_STATS_LABEL_WEIGHT_OPTIONS: {
  value: PortfolioAboutStatsLabelWeight;
  label: string;
}[] = [
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semi-bold' },
  { value: 'bold', label: 'Bold' },
];

export const PORTFOLIO_ABOUT_STATS_LABEL_TRACKING_OPTIONS: {
  value: PortfolioAboutStatsLabelTracking;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Lettres rapprochées.' },
  { value: 'normal', label: 'Normal', description: 'Espacement standard.' },
  { value: 'wide', label: 'Large', description: 'Tracking modéré.' },
  { value: 'extra', label: 'Très large', description: 'Style uppercase éditorial.' },
];

export const PORTFOLIO_ABOUT_STATS_ICON_SIZE_OPTIONS: {
  value: PortfolioAboutStatsIconSize;
  label: string;
}[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

export const PORTFOLIO_ABOUT_SIDE_PANEL_DESIGN_OPTIONS: {
  value: PortfolioAboutSidePanelDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'framed',
    label: 'Framed panel',
    description: 'One shared panel — border, fill and radius follow the palette.',
  },
  {
    value: 'cards',
    label: 'Separate cards',
    description: 'Each detail in its own framed card, synced to the About palette.',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Open list with soft palette dividers — no heavy surface.',
  },
  {
    value: 'info-bar',
    label: 'Bande infos',
    description:
      'Barre horizontale à colonnes égales — icône, libellé et valeur, séparateurs fins.',
  },
  {
    value: 'list',
    label: 'Liste à puces',
    description: 'Infos en liste avec marqueurs (comme Why me) — pas de trait vertical.',
  },
  {
    value: 'info-strip',
    label: 'Ligne d’infos',
    description:
      'Pleine largeur épurée — colonnes égales, icône en haut, libellé gris, valeur en gras (sans grand fond blanc).',
  },
  {
    value: 'profile-cv',
    label: 'Profil CV',
    description:
      'Grille 4 cartes égales pleine largeur (sans Gender) — même langage visuel que Why me.',
  },
];

export const PORTFOLIO_ABOUT_SIDE_PANEL_ICON_PLACEMENT_OPTIONS: {
  value: PortfolioAboutSidePanelIconPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Icône à gauche du texte.' },
  { value: 'top', label: 'Haut', description: 'Icône au-dessus du libellé et de la valeur.' },
  { value: 'right', label: 'Droite', description: 'Icône à droite du texte.' },
];

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

export function isPortfolioAboutSidePanelIconPlacement(
  value: unknown
): value is PortfolioAboutSidePanelIconPlacement {
  return value === 'left' || value === 'top' || value === 'right';
}

export const PORTFOLIO_ABOUT_SIDE_PANEL_CONTENT_GAP_OPTIONS: {
  value: Exclude<PortfolioAboutSidePanelContentGap, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: '0px — rows touch, no vertical gap.' },
  { value: 'sm', label: 'Tight', description: '24px — compact but readable spacing.' },
  { value: 'md', label: 'Medium', description: '32px — balanced spacing (default).' },
  { value: 'lg', label: 'Large', description: '48px — generous air between rows.' },
  { value: 'xl', label: 'Extra large', description: '72px — wide, editorial spacing.' },
];

export const ABOUT_SIDE_PANEL_CONTENT_GAP_PRESET_PX: Record<
  Exclude<PortfolioAboutSidePanelContentGap, 'custom'>,
  number
> = {
  none: 0,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 72,
};

export const ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN = 0;
export const ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX = 100;

export function clampAboutSidePanelContentGapPx(value: unknown, fallback = 28): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN,
    Math.min(ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX, Math.round(n))
  );
}

export function resolveAboutSidePanelContentGapPx(
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

export function isPortfolioAboutSidePanelContentGap(
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
export const PORTFOLIO_ABOUT_SIDE_PANEL_FULL_WIDTH_LAYOUT_OPTIONS: {
  value: PortfolioAboutSidePanelFullWidthLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Liste verticale',
    description: 'Infos empilées dans un seul cadre — idéal pleine largeur.',
  },
  {
    value: 'grid-2',
    label: 'Grille 2 colonnes',
    description: 'Deux colonnes équilibrées sur grand écran.',
  },
  {
    value: 'grid-3',
    label: 'Grille 3 colonnes',
    description: 'Disposition compacte sur toute la largeur.',
  },
  {
    value: 'horizontal',
    label: 'Ligne souple',
    description: 'Items côte à côte avec retour à la ligne.',
  },
  {
    value: 'inline-band',
    label: 'Bande horizontale',
    description: 'Une seule ligne avec séparateurs verticaux entre items.',
  },
  {
    value: 'profile-frame',
    label: 'Cadre profil',
    description:
      'Grand écran : location à gauche (~40%), grille 2×2 des autres infos à droite — idéal au-dessus de Why me.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_DESIGN_OPTIONS: {
  value: PortfolioAboutWhyMeDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'timeline',
    label: 'Timeline',
    description: 'Ligne verticale minimaliste avec jalons numérotés et texte alterné.',
  },
  {
    value: 'split',
    label: 'Split statistique',
    description:
      'Grand titre à gauche, liste numérotée à droite (01…) — pleine largeur, sans filets horizontaux.',
  },
  {
    value: 'lined-list',
    label: 'Liste séparée',
    description:
      'Grand titre centré « The value I bring », puces simples et filets horizontaux fins entre chaque ligne.',
  },
  {
    value: 'media-aside',
    label: 'SVG + liste',
    description:
      'Illustration et titre à gauche, liste numérotée à droite (numéros avant le texte) — disposition type FAQ.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_ITEMS_PER_ROW_OPTIONS: {
  value: `${PortfolioAboutWhyMeItemsPerRow}`;
  label: string;
  description: string;
}[] = [
  { value: '1', label: '1 par ligne', description: 'Pleine largeur — idéal textes longs et média latéral.' },
  { value: '2', label: '2 par ligne', description: '2 colonnes dès tablette (md / lg).' },
  { value: '3', label: '3 par ligne', description: '2 dès md, 3 dès xl — dense sur grand écran.' },
  { value: '4', label: '4 par ligne', description: 'Jusqu’à 4 sur très grand écran — très compact.' },
];

export function whyMeDesignSupportsItemsPerRow(_design: PortfolioAboutWhyMeDesign): boolean {
  return false;
}

/** Designs that own the whole Why me section layout (custom grid / timeline / split). */
export function whyMeDesignOwnsListLayout(design: PortfolioAboutWhyMeDesign): boolean {
  return (
    design === 'timeline' ||
    design === 'split' ||
    design === 'lined-list' ||
    design === 'media-aside'
  );
}

/** Heading lives in the left column for split / media-aside. */
export function whyMeDesignEmbedsHeading(design: PortfolioAboutWhyMeDesign): boolean {
  return design === 'split' || design === 'media-aside';
}

/** Large centered section titles (timeline + lined-list). */
export function whyMeDesignUsesHeroHeading(design: PortfolioAboutWhyMeDesign): boolean {
  return design === 'timeline' || design === 'lined-list';
}

/**
 * Defaults applied when picking a structural Why me design.
 */
export function whyMeDesignSettingsPatch(
  design: PortfolioAboutWhyMeDesign
): Partial<PortfolioAboutPresentationSettings> {
  switch (design) {
    case 'timeline':
      return {
        whyMeDesign: design,
        whyMeContentAlign: 'center',
        whyMeMarkerStyle: 'number',
        whyMeMarkerPlacement: 'top',
        whyMeBackgroundEnabled: false,
        whyMeShowHeaderAccent: false,
        whyMeHeadingSize: 'lg',
        whyMeHeadingFont: 'sans',
        whyMeHeadingUppercase: false,
        whyMeHeadingAlignment: 'center',
        whyMeHeadingColor: '#171717',
        whyMeGap: 'lg',
      };
    case 'split':
      return {
        whyMeDesign: design,
        whyMeContentAlign: 'left',
        whyMeMarkerStyle: 'number',
        whyMeMarkerPlacement: 'top',
        whyMeBackgroundEnabled: false,
        whyMeShowHeaderAccent: false,
        whyMeHeadingSize: 'lg',
        whyMeHeadingFont: 'serif',
        whyMeHeadingUppercase: false,
        whyMeHeadingAlignment: 'left',
        whyMeHeadingColor: '#0a0a0a',
        whyMeHeadingPreset: 'why-choose-me',
        whyMeGap: 'lg',
      };
    case 'lined-list':
      return {
        whyMeDesign: design,
        whyMeContentAlign: 'center',
        whyMeMarkerStyle: 'disc',
        whyMeMarkerPlacement: 'before',
        whyMeBackgroundEnabled: false,
        whyMeShowHeaderAccent: false,
        whyMeHeadingSize: 'lg',
        whyMeHeadingFont: 'sans',
        whyMeHeadingUppercase: false,
        whyMeHeadingAlignment: 'center',
        whyMeHeadingColor: '#171717',
        whyMeHeadingPreset: 'value',
        whyMeGap: 'lg',
      };
    case 'media-aside':
      return {
        whyMeDesign: design,
        whyMeContentAlign: 'left',
        whyMeMarkerStyle: 'number',
        whyMeMarkerPlacement: 'before',
        whyMeBackgroundEnabled: false,
        whyMeShowHeaderAccent: false,
        whyMeHeadingSize: 'lg',
        whyMeHeadingFont: 'sans',
        whyMeHeadingUppercase: false,
        whyMeHeadingAlignment: 'left',
        whyMeHeadingColor: '#171717',
        whyMeHeadingPreset: 'why-choose-me',
        whyMeGap: 'lg',
      };
  }
}

export function resolveWhyMeItemsPerRow(
  _design: PortfolioAboutWhyMeDesign,
  itemsPerRow: PortfolioAboutWhyMeItemsPerRow | undefined
): PortfolioAboutWhyMeItemsPerRow {
  if (itemsPerRow === 1 || itemsPerRow === 2 || itemsPerRow === 3 || itemsPerRow === 4) {
    return itemsPerRow;
  }
  return 1;
}

/**
 * Responsive Why me grid. Mobile always 1 column; higher counts from tablet / desktop up.
 */
export function whyMeItemsPerRowGridClass(itemsPerRow: PortfolioAboutWhyMeItemsPerRow): string {
  switch (itemsPerRow) {
    case 2:
      return 'grid w-full grid-cols-1 lg:grid-cols-2';
    case 3:
      return 'grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
    case 4:
      return 'grid w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';
    default:
      return 'grid w-full grid-cols-1';
  }
}

export function whyMeItemsPerRowResponsiveHint(
  itemsPerRow: PortfolioAboutWhyMeItemsPerRow
): string | null {
  switch (itemsPerRow) {
    case 2:
      return 'Sur mobile, les blocs restent sur 1 colonne. 2 colonnes à partir des grands écrans (lg).';
    case 3:
      return 'Sur mobile : 1 colonne. Tablette : 2. Grand écran (xl) : 3.';
    case 4:
      return '4 colonnes uniquement sur très grand écran (2xl). Sur laptop max 3 ; tablette 2 ; mobile 1.';
    default:
      return null;
  }
}
export const PORTFOLIO_ABOUT_WHY_ME_MEDIA_PLACEMENT_OPTIONS: {
  value: PortfolioAboutWhyMeMediaPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'alternate', label: 'Alterné', description: 'Média à droite puis à gauche — défaut éditorial.' },
  { value: 'media-left', label: 'Média à gauche', description: 'Image toujours à gauche du texte.' },
  { value: 'media-right', label: 'Média à droite', description: 'Image toujours à droite du texte.' },
  { value: 'media-top', label: 'Média au-dessus', description: 'Image au-dessus du texte dans chaque carte.' },
  { value: 'text-only', label: 'Texte seul', description: 'Masquer les médias — texte et icônes uniquement.' },
];

export const PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS: {
  value: PortfolioAboutWhyMeContentAlign;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Gauche',
    description: 'Toute la colonne Why me démarre à gauche — même bord pour chaque bloc.',
  },
  {
    value: 'center',
    label: 'Centre',
    description: 'La colonne est centrée, mais chaque bloc garde le même bord de départ.',
  },
  {
    value: 'right',
    label: 'Droite',
    description: 'La colonne est à droite, avec le même bord de départ pour chaque bloc.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_BODY_LAYOUT_OPTIONS: {
  value: PortfolioAboutWhyMeBodyLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stack',
    label: 'Empilé',
    description: 'Numéro / icône au-dessus, phrase juste en dessous — lien vertical serré.',
  },
  {
    value: 'inline',
    label: 'En ligne',
    description: 'Numéro / icône et phrase sur la même ligne — comble l’espace horizontal.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_GAP_OPTIONS: {
  value: Exclude<PortfolioAboutWhyMeGap, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre les blocs.' },
  { value: 'md', label: 'Moyen', description: 'Espacement équilibré.' },
  { value: 'lg', label: 'Large', description: 'Espacement généreux.' },
];

export const ABOUT_WHY_ME_GAP_PRESET_PX: Record<Exclude<PortfolioAboutWhyMeGap, 'custom'>, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

export const ABOUT_WHY_ME_GAP_PX_MIN = 0;
/** Allow stretching tall layouts (timeline, list, grids). */
export const ABOUT_WHY_ME_GAP_PX_MAX = 160;

export function clampAboutWhyMeGapPx(value: unknown, fallback = 24): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(ABOUT_WHY_ME_GAP_PX_MIN, Math.min(ABOUT_WHY_ME_GAP_PX_MAX, Math.round(n)));
}

export function resolveWhyMeGapPx(
  p: Pick<PortfolioAboutPresentationSettings, 'whyMeGap' | 'whyMeGapPx' | 'whyMeDesign'>
): number {
  const gap = p.whyMeGap ?? 'md';
  if (gap === 'custom') {
    return clampAboutWhyMeGapPx(p.whyMeGapPx, 24);
  }

  let resolved: Exclude<PortfolioAboutWhyMeGap, 'custom'> = gap;

  return ABOUT_WHY_ME_GAP_PRESET_PX[resolved] ?? 24;
}

export function whyMeGapStyle(
  p: Pick<PortfolioAboutPresentationSettings, 'whyMeGap' | 'whyMeGapPx' | 'whyMeDesign'>
): CSSProperties {
  return { gap: `${resolveWhyMeGapPx(p)}px` };
}

export const PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS: {
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

/** Infos / side panel markers — same shapes as Why me, separate settings fields. */
export const PORTFOLIO_ABOUT_SIDE_PANEL_MARKER_STYLE_OPTIONS =
  PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS;

export const PORTFOLIO_ABOUT_WHY_ME_MARKER_PLACEMENT_OPTIONS: {
  value: PortfolioAboutWhyMeMarkerPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'top',
    label: 'En haut',
    description: 'À la place du numéro dans l’en-tête de chaque carte.',
  },
  {
    value: 'before',
    label: 'Devant chaque',
    description: 'Marqueur devant le contenu de chaque bloc Why me.',
  },
];

export const PORTFOLIO_ABOUT_WHY_ME_MARKER_SIZE_OPTIONS: {
  value: PortfolioAboutWhyMeMarkerSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'S', description: 'Petite puce (~14px).' },
  { value: 'md', label: 'M', description: 'Taille moyenne (~20px).' },
  { value: 'lg', label: 'L', description: 'Grande puce (~28px).' },
  { value: 'xl', label: 'XL', description: 'Très grande puce (~36–40px).' },
];

export { PORTFOLIO_LIST_MARKER_WEIGHT_OPTIONS as PORTFOLIO_ABOUT_WHY_ME_MARKER_WEIGHT_OPTIONS } from '@/components/portfolio/portfolio-list-marker';

export function resolveWhyMeMarkerColor(
  presentation: Pick<
    PortfolioAboutPresentationSettings,
    'whyMeMarkerColor' | 'accentColor' | 'useHeroPalette' | 'aboutPalette'
  >
): string {
  if (presentation.useHeroPalette !== false) {
    return aboutPalettePrincipalColor(presentation);
  }
  return sanitizeHex(presentation.whyMeMarkerColor, aboutAccentColor(presentation.accentColor));
}

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
 * Which text color channel to read for About element styles.
 * Palette mode: hex is already painted for the active mode → always use `color`.
 * Manual mode: honor `activeColorMode` so `colorDark` applies in dark.
 */
export function aboutActiveColorMode(
  p: Pick<PortfolioAboutPresentationSettings, 'activeColorMode' | 'useHeroPalette'>
): 'light' | 'dark' {
  if (p.useHeroPalette !== false) return 'light';
  return p.activeColorMode === 'light' ? 'light' : 'dark';
}

/**
 * Page / section fill behind the timeline spine — macaron discs must match this
 * so the vertical line is cleanly masked in both light and dark.
 */
export function resolveWhyMeTimelineSurfaceColor(
  p: Pick<
    PortfolioAboutPresentationSettings,
    | 'useHeroPalette'
    | 'aboutPalette'
    | 'activeColorMode'
    | 'sectionBackgroundEnabled'
    | 'sectionBackgroundFill'
    | 'sectionBackgroundColor'
    | 'sectionBackgroundGradientFrom'
    | 'sectionBackgroundColorA'
  >
): string {
  if (p.sectionBackgroundEnabled) {
    return sectionBackgroundBlockColor(p);
  }
  if (p.useHeroPalette !== false || p.aboutPalette) {
    return resolveHeroPaletteColor(mergeAboutPalette(DEFAULT_ABOUT_PALETTE, p.aboutPalette), 'fond');
  }
  return p.activeColorMode === 'light' ? '#ffffff' : '#0a0a0a';
}

/** Spine / support line — follows palette `bordure` (or Why me border in manual). */
export function resolveWhyMeTimelineLineColor(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'useHeroPalette' | 'aboutPalette' | 'whyMeBorderColor'
  >
): string {
  if (p.useHeroPalette !== false) {
    return resolveHeroPaletteColor(mergeAboutPalette(DEFAULT_ABOUT_PALETTE, p.aboutPalette), 'bordure');
  }
  return sanitizeHex(p.whyMeBorderColor, DEFAULT_ABOUT_WHY_ME_BORDER_COLOR);
}

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

const WHY_ME_MARKER_STYLE_VALUES = PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS.map(
  (option) => option.value
) as PortfolioAboutWhyMeMarkerStyle[];

export function isPortfolioAboutWhyMeMarkerStyle(
  value: unknown
): value is PortfolioAboutWhyMeMarkerStyle {
  return typeof value === 'string' && (WHY_ME_MARKER_STYLE_VALUES as string[]).includes(value);
}

export function isPortfolioAboutWhyMeMarkerPlacement(
  value: unknown
): value is PortfolioAboutWhyMeMarkerPlacement {
  return value === 'top' || value === 'before';
}

/** True when the marker is a glyph bullet (not digits / roman / none). */
export function isWhyMeHyperBulletMarker(style: PortfolioAboutWhyMeMarkerStyle): boolean {
  return (
    style !== 'number' &&
    style !== 'roman' &&
    style !== 'none'
  );
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

export function toRomanNumeral(value: number): string {
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

export const PORTFOLIO_ABOUT_WHY_ME_HEADING_PRESET_OPTIONS: {
  value: PortfolioAboutWhyMeHeadingPreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Personnalisé', description: 'Utilise le titre saisi ci-dessous.' },
  { value: 'why-work-with-me', label: 'Why work with me', description: 'Libellé par défaut en anglais.' },
  { value: 'why-choose-me', label: 'Why choose me', description: 'Titre éditorial du layout Split statistique.' },
  { value: 'my-approach', label: 'My approach', description: 'Approche et méthode.' },
  { value: 'strengths', label: 'Strengths', description: 'Points forts.' },
  { value: 'value', label: 'The value I bring', description: 'Valeur apportée au client.' },
  { value: 'custom', label: 'Custom', description: 'Votre propre titre.' },
];

export const PORTFOLIO_ABOUT_WHY_ME_HEADING_SIZE_OPTIONS: {
  value: PortfolioAboutWhyMeHeadingSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
];

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioAboutSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Strengths, approach, and how I work with clients.',
  personal: 'A bit about me, how I work, and what you can expect when we collaborate.',
};

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

export function resolveAboutSectionTitle(
  settings: Pick<PortfolioAboutSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  const raw = (() => {
    switch (settings.titlePreset) {
      case 'my-story':
        return 'MY STORY';
      case 'who-i-am':
        return 'WHO I AM';
      case 'behind-the-work':
        return 'BEHIND THE WORK';
      case 'custom':
        return settings.titleCustom.trim() || settings.title.trim() || 'About';
      default:
        return settings.title.trim() || 'About';
    }
  })();
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveAboutSectionSubtitle(
  settings: Pick<PortfolioAboutSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'personal':
      return SUBTITLE_PRESET_COPY.personal;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function aboutHeaderFontClass(font: PortfolioAboutHeaderFont, kind: 'title' | 'subtitle'): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black uppercase tracking-[0.08em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold uppercase tracking-[0.1em]';
    default:
      return 'leading-relaxed';
  }
}

export function aboutHeaderFontStyle(
  _font: PortfolioAboutHeaderFont,
  _subtitleSerif: boolean,
  _kind: 'title' | 'subtitle'
): CSSProperties | undefined {
  return undefined;
}

export function aboutTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_ABOUT_TITLE_COLOR) };
}

export function aboutSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_ABOUT_SUBTITLE_COLOR) };
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

export function aboutMainGridClass(
  layoutMode: PortfolioAboutLayoutMode,
  hasSidebar: boolean,
  contentPairAlign: PortfolioAboutContentPairAlign = 'start',
  twinColumnsSplit: PortfolioAboutTwinColumnsSplit = 'why-me-70'
): string {
  if (!hasSidebar || layoutMode === 'full-width') return '';
  const pairCentered = contentPairAlign === 'center' || contentPairAlign === 'end';
  if (layoutMode === 'twin-columns') {
    // Hug content width when the pair is centered/ended so both blocks sit together.
    if (pairCentered) {
      if (twinColumnsSplit === 'equal') {
        return 'w-fit max-w-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:gap-14';
      }
      if (twinColumnsSplit === 'auto') {
        return 'w-fit max-w-full lg:grid-cols-[auto_auto] lg:items-start lg:gap-10 xl:gap-14';
      }
      return 'w-fit max-w-full lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.7fr)] lg:items-start lg:gap-10 xl:gap-14';
    }
    if (twinColumnsSplit === 'equal') {
      return 'w-full lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14';
    }
    if (twinColumnsSplit === 'auto') {
      return 'w-full lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10 xl:gap-14';
    }
    // why-me-70 (default): Why me gets the larger share
    return 'w-full lg:grid-cols-[minmax(0,7fr)_minmax(12rem,3fr)] lg:items-start lg:gap-10 xl:gap-14';
  }
  if (layoutMode === 'sidebar-left') {
    return pairCentered
      ? 'w-fit max-w-full lg:grid-cols-[20rem_auto] lg:gap-10 xl:grid-cols-[22rem_auto] xl:gap-14'
      : 'w-full lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[22rem_minmax(0,1fr)] xl:gap-14';
  }
  return pairCentered
    ? 'w-fit max-w-full lg:grid-cols-[auto_20rem] lg:gap-10 xl:grid-cols-[auto_22rem] xl:gap-14'
    : 'w-full lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-14';
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

export function aboutSidePanelToCardFrameSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioCardFrameSettings {
  return {
    ...aboutSidePanelCardBackgroundSettings(p),
    cardBorder: p.sidePanelBorder,
    cardBorderColor: p.sidePanelBorderColor,
    cardBackgroundEnabled: p.sidePanelBackgroundEnabled,
    cardBackgroundColor: p.sidePanelBackgroundColor,
    cardBorderRadius: p.sidePanelBorderRadius,
    cardPadding: p.sidePanelPadding,
  };
}

export function patchAboutSidePanelFromCardFrame(
  patch: Partial<PortfolioCardFrameSettings>
): Partial<PortfolioAboutPresentationSettings> {
  const next: Partial<PortfolioAboutPresentationSettings> = {};
  if (patch.cardBorder !== undefined) next.sidePanelBorder = patch.cardBorder;
  if (patch.cardBorderColor !== undefined) next.sidePanelBorderColor = patch.cardBorderColor;
  if (patch.cardBackgroundEnabled !== undefined) next.sidePanelBackgroundEnabled = patch.cardBackgroundEnabled;
  if (patch.cardBackgroundColor !== undefined) next.sidePanelBackgroundColor = patch.cardBackgroundColor;
  if (patch.cardBorderRadius !== undefined) next.sidePanelBorderRadius = patch.cardBorderRadius;
  if (patch.cardPadding !== undefined) next.sidePanelPadding = patch.cardPadding;
  if (patch.cardBackgroundFill !== undefined) next.sidePanelBackgroundFill = patch.cardBackgroundFill;
  if (patch.cardBackgroundColorA !== undefined) next.sidePanelBackgroundColorA = patch.cardBackgroundColorA;
  if (patch.cardBackgroundColorB !== undefined) next.sidePanelBackgroundColorB = patch.cardBackgroundColorB;
  if (patch.cardBackgroundSplitAxis !== undefined) next.sidePanelBackgroundSplitAxis = patch.cardBackgroundSplitAxis;
  if (patch.cardBackgroundSplitPosition !== undefined) {
    next.sidePanelBackgroundSplitPosition = patch.cardBackgroundSplitPosition;
  }
  if (patch.cardDividerEnabled !== undefined) next.sidePanelDividerEnabled = patch.cardDividerEnabled;
  if (patch.cardDividerShape !== undefined) next.sidePanelDividerShape = patch.cardDividerShape;
  if (patch.cardDividerAngle !== undefined) next.sidePanelDividerAngle = patch.cardDividerAngle;
  if (patch.cardDividerCurveDepth !== undefined) next.sidePanelDividerCurveDepth = patch.cardDividerCurveDepth;
  if (patch.cardDividerColor !== undefined) next.sidePanelDividerColor = patch.cardDividerColor;
  if (patch.cardDividerThickness !== undefined) next.sidePanelDividerThickness = patch.cardDividerThickness;
  if (patch.cardDividerOpacity !== undefined) next.sidePanelDividerOpacity = patch.cardDividerOpacity;
  return next;
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

export type AboutSideInfoItemId = 'location' | 'languages' | 'gender' | 'member-since' | 'availability';

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

/** Designs that own their full-width composition (ignore Disposition pleine largeur). */
export function aboutSidePanelDesignOwnsLayout(design: PortfolioAboutSidePanelDesign): boolean {
  return design === 'info-strip' || design === 'profile-cv' || design === 'info-bar' || design === 'list';
}

export function aboutSidePanelDividerColor(p: PortfolioAboutPresentationSettings): string {
  return sanitizeHex(p.sidePanelDividerColor, DEFAULT_ABOUT_SIDE_PANEL_BORDER_COLOR);
}

/** Soft principal wash for icon badges (cards / info-bar / profile-cv). */
export function aboutSidePanelAccentSoftBackground(accent: string): string {
  return `color-mix(in srgb, ${aboutAccentColor(accent)} 16%, transparent)`;
}

export function aboutWhyMeBlockClass(_design: PortfolioAboutWhyMeDesign): string {
  return 'group relative transition duration-200';
}

/** Effective padding for Why Me cards — design can tighten without changing saved settings. */
export function aboutWhyMeEffectivePadding(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'whyMePadding' | 'whyMeDesign' | 'whyMeBackgroundEnabled'
  >
): PortfolioServicesCardPadding {
  // No fill → drop card padding so content sits flush left (fond removed completely).
  if (p.whyMeBackgroundEnabled === false) {
    return 'none';
  }
  return p.whyMePadding;
}

export function aboutWhyMeContentPaddingClass(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'whyMePadding' | 'whyMeDesign' | 'whyMeBackgroundEnabled'
  >
): string {
  return servicesCardPaddingClass(aboutWhyMeEffectivePadding(p));
}

const WHY_ME_HEADING_PRESET_COPY: Record<
  Exclude<PortfolioAboutWhyMeHeadingPreset, 'default' | 'custom'>,
  string
> = {
  'why-work-with-me': 'Why work with me',
  'why-choose-me': 'Why choose me',
  'my-approach': 'My approach',
  strengths: 'Strengths',
  value: 'The value I bring',
};

export function resolveWhyMeHeading(
  settings: Pick<
    PortfolioAboutPresentationSettings,
    'whyMeHeadingPreset' | 'whyMeHeadingCustom' | 'whyMeHeading'
  >
): string {
  switch (settings.whyMeHeadingPreset) {
    case 'custom':
      return settings.whyMeHeadingCustom.trim() || settings.whyMeHeading.trim() || 'Why work with me';
    case 'why-work-with-me':
    case 'why-choose-me':
    case 'my-approach':
    case 'strengths':
    case 'value':
      return WHY_ME_HEADING_PRESET_COPY[settings.whyMeHeadingPreset];
    default:
      return settings.whyMeHeading.trim() || 'Why work with me';
  }
}

export function whyMeHeadingClass(
  settings: Pick<
    PortfolioAboutPresentationSettings,
    'whyMeHeadingAlignment' | 'whyMeHeadingFont' | 'whyMeHeadingSize' | 'whyMeHeadingUppercase'
  >
): string {
  const parts = ['font-bold tracking-[0.18em]', aboutHeaderFontClass(settings.whyMeHeadingFont, 'title')];

  switch (settings.whyMeHeadingSize) {
    case 'lg':
      parts.push('text-sm sm:text-base');
      break;
    case 'md':
      parts.push('text-xs sm:text-sm');
      break;
    default:
      parts.push('text-[10px] sm:text-xs');
  }

  if (settings.whyMeHeadingUppercase) parts.push('uppercase');

  switch (settings.whyMeHeadingAlignment) {
    case 'center':
      parts.push('text-center');
      break;
    case 'right':
      parts.push('text-right');
      break;
    default:
      parts.push('text-left');
  }

  return parts.join(' ');
}

export function whyMeHeadingStyle(
  settings: Pick<PortfolioAboutPresentationSettings, 'whyMeHeadingColor' | 'whyMeHeadingFont'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.whyMeHeadingColor, DEFAULT_ABOUT_WHY_ME_HEADING_COLOR),
    ...aboutHeaderFontStyle(settings.whyMeHeadingFont, false, 'title'),
  };
}

/** Infos block title — independent from About section title and Why choose me heading. */
export function sidePanelHeadingClass(): string {
  return 'text-left text-2xl font-bold tracking-[-0.03em] sm:text-3xl lg:text-[2rem]';
}

export function sidePanelHeadingStyle(
  settings: Pick<PortfolioAboutPresentationSettings, 'sidePanelHeadingColor'>
): CSSProperties {
  return {
    color: sanitizeHex(settings.sidePanelHeadingColor, DEFAULT_ABOUT_SIDE_PANEL_HEADING_COLOR),
  };
}

export function resolveSidePanelHeading(
  settings: Pick<PortfolioAboutPresentationSettings, 'sidePanelHeading'>
): string {
  return settings.sidePanelHeading?.trim() || 'Infos';
}

export function whyMeContentAlignClass(align: PortfolioAboutWhyMeContentAlign): {
  /** Place the Why me column in the available width. */
  column: string;
  /** Card / block width so center/right can hug content while keeping a shared start edge. */
  track: string;
  /** Always start-aligned inside the track so 01 / text share one vertical edge. */
  text: string;
  items: string;
  header: string;
} {
  switch (align) {
    case 'center':
      return {
        column: 'items-center',
        track: 'w-fit max-w-full',
        text: 'text-left',
        items: 'items-start',
        header: 'justify-start',
      };
    case 'right':
      return {
        column: 'items-end',
        track: 'w-fit max-w-full',
        text: 'text-left',
        items: 'items-start',
        header: 'justify-start',
      };
    default:
      return {
        column: 'items-stretch',
        track: 'w-full',
        text: 'text-left',
        items: 'items-start',
        header: 'justify-start',
      };
  }
}

export function whyMeGapClass(gap: PortfolioAboutWhyMeGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-4';
    case 'lg':
      return 'gap-8';
    case 'custom':
      return '';
    default:
      return 'gap-6';
  }
}

export function resolveWhyMeMediaLayout(
  _placement: PortfolioAboutWhyMeMediaPlacement,
  _index: number
): 'left' | 'right' | 'top' | 'hidden' {
  // Why choose me is text-only — media insertion removed from studio + portfolio.
  return 'hidden';
}

/** Always false: Why choose me no longer supports block media. */
export function whyMeBlockHasMedia(
  _block: { mediaUrl?: string | null },
  _placement?: PortfolioAboutWhyMeMediaPlacement
): boolean {
  return false;
}

export function aboutWhyMeCardBackgroundSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardBackgroundSettings {
  return {
    cardBackgroundFill: p.whyMeBackgroundFill,
    cardBackgroundColorA: p.whyMeBackgroundColorA,
    cardBackgroundColorB: p.whyMeBackgroundColorB,
    cardBackgroundSplitAxis: p.whyMeBackgroundSplitAxis,
    cardBackgroundSplitPosition: p.whyMeBackgroundSplitPosition,
    cardDividerEnabled: p.whyMeDividerEnabled,
    cardDividerShape: p.whyMeDividerShape,
    cardDividerAngle: p.whyMeDividerAngle,
    cardDividerCurveDepth: p.whyMeDividerCurveDepth,
    cardDividerColor: p.whyMeDividerColor,
    cardDividerThickness: p.whyMeDividerThickness,
    cardDividerOpacity: p.whyMeDividerOpacity,
  };
}

export function aboutWhyMeCardDecorSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardDecorSettings {
  return {
    cardDecorEnabled: p.whyMeDecorEnabled,
    cardDecorShape: p.whyMeDecorShape,
    cardDecorColor: p.whyMeDecorColor,
    cardDecorOpacity: p.whyMeDecorOpacity,
    cardDecorSize: p.whyMeDecorSize,
    cardDecorX: p.whyMeDecorX,
    cardDecorY: p.whyMeDecorY,
    cardDecorRotation: p.whyMeDecorRotation,
    cardDecorAlternation: p.whyMeDecorAlternation,
  };
}

export function aboutWhyMeLayersSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioServicesCardBackgroundSettings & PortfolioServicesCardDecorSettings {
  const background = aboutWhyMeCardBackgroundSettings(p);
  return {
    ...(p.whyMeBackgroundEnabled
      ? background
      : {
          ...background,
          // Solid + disabled skips fill; force solid so split layers also stay off.
          cardBackgroundFill: 'solid',
          cardDividerEnabled: false,
        }),
    ...aboutWhyMeCardDecorSettings(p),
  };
}

export function aboutWhyMeToCardFrameSettings(
  p: PortfolioAboutPresentationSettings
): PortfolioCardFrameSettings {
  return {
    ...aboutWhyMeCardBackgroundSettings(p),
    cardBorder: p.whyMeBorder,
    cardBorderColor: p.whyMeBorderColor,
    cardBackgroundEnabled: p.whyMeBackgroundEnabled,
    cardBackgroundColor: p.whyMeBackgroundColor,
    cardBorderRadius: p.whyMeBorderRadius,
    cardPadding: p.whyMePadding,
  };
}

export function patchAboutWhyMeFromCardFrame(
  patch: Partial<PortfolioCardFrameSettings>
): Partial<PortfolioAboutPresentationSettings> {
  const next: Partial<PortfolioAboutPresentationSettings> = {};
  if (patch.cardBorder !== undefined) next.whyMeBorder = patch.cardBorder;
  if (patch.cardBorderColor !== undefined) next.whyMeBorderColor = patch.cardBorderColor;
  if (patch.cardBackgroundEnabled !== undefined) next.whyMeBackgroundEnabled = patch.cardBackgroundEnabled;
  if (patch.cardBackgroundColor !== undefined) next.whyMeBackgroundColor = patch.cardBackgroundColor;
  if (patch.cardBorderRadius !== undefined) next.whyMeBorderRadius = patch.cardBorderRadius;
  if (patch.cardPadding !== undefined) next.whyMePadding = patch.cardPadding;
  if (patch.cardBackgroundFill !== undefined) next.whyMeBackgroundFill = patch.cardBackgroundFill;
  if (patch.cardBackgroundColorA !== undefined) next.whyMeBackgroundColorA = patch.cardBackgroundColorA;
  if (patch.cardBackgroundColorB !== undefined) next.whyMeBackgroundColorB = patch.cardBackgroundColorB;
  if (patch.cardBackgroundSplitAxis !== undefined) next.whyMeBackgroundSplitAxis = patch.cardBackgroundSplitAxis;
  if (patch.cardBackgroundSplitPosition !== undefined) {
    next.whyMeBackgroundSplitPosition = patch.cardBackgroundSplitPosition;
  }
  if (patch.cardDividerEnabled !== undefined) next.whyMeDividerEnabled = patch.cardDividerEnabled;
  if (patch.cardDividerShape !== undefined) next.whyMeDividerShape = patch.cardDividerShape;
  if (patch.cardDividerAngle !== undefined) next.whyMeDividerAngle = patch.cardDividerAngle;
  if (patch.cardDividerCurveDepth !== undefined) next.whyMeDividerCurveDepth = patch.cardDividerCurveDepth;
  if (patch.cardDividerColor !== undefined) next.whyMeDividerColor = patch.cardDividerColor;
  if (patch.cardDividerThickness !== undefined) next.whyMeDividerThickness = patch.cardDividerThickness;
  if (patch.cardDividerOpacity !== undefined) next.whyMeDividerOpacity = patch.cardDividerOpacity;
  return next;
}

function mergeWhyMeBackgroundFields(
  base: PortfolioAboutPresentationSettings,
  record: Record<string, unknown>
): Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeBackgroundFill'
  | 'whyMeBackgroundColorA'
  | 'whyMeBackgroundColorB'
  | 'whyMeBackgroundSplitAxis'
  | 'whyMeBackgroundSplitPosition'
  | 'whyMeDividerEnabled'
  | 'whyMeDividerShape'
  | 'whyMeDividerAngle'
  | 'whyMeDividerCurveDepth'
  | 'whyMeDividerColor'
  | 'whyMeDividerThickness'
  | 'whyMeDividerOpacity'
> {
  const merged = mergeServicesCardBackgroundSettings(aboutWhyMeCardBackgroundSettings(base), {
    cardBackgroundFill: record.whyMeBackgroundFill,
    cardBackgroundColorA: record.whyMeBackgroundColorA,
    cardBackgroundColorB: record.whyMeBackgroundColorB,
    cardBackgroundSplitAxis: record.whyMeBackgroundSplitAxis,
    cardBackgroundSplitPosition: record.whyMeBackgroundSplitPosition,
    cardDividerEnabled: record.whyMeDividerEnabled,
    cardDividerShape: record.whyMeDividerShape,
    cardDividerAngle: record.whyMeDividerAngle,
    cardDividerCurveDepth: record.whyMeDividerCurveDepth,
    cardDividerColor: record.whyMeDividerColor,
    cardDividerThickness: record.whyMeDividerThickness,
    cardDividerOpacity: record.whyMeDividerOpacity,
  });

  return {
    whyMeBackgroundFill: merged.cardBackgroundFill,
    whyMeBackgroundColorA: merged.cardBackgroundColorA,
    whyMeBackgroundColorB: merged.cardBackgroundColorB,
    whyMeBackgroundSplitAxis: merged.cardBackgroundSplitAxis,
    whyMeBackgroundSplitPosition: merged.cardBackgroundSplitPosition,
    whyMeDividerEnabled: merged.cardDividerEnabled,
    whyMeDividerShape: merged.cardDividerShape,
    whyMeDividerAngle: merged.cardDividerAngle,
    whyMeDividerCurveDepth: merged.cardDividerCurveDepth,
    whyMeDividerColor: merged.cardDividerColor,
    whyMeDividerThickness: merged.cardDividerThickness,
    whyMeDividerOpacity: merged.cardDividerOpacity,
  };
}

function mergeWhyMeDecorFields(
  base: PortfolioAboutPresentationSettings,
  record: Record<string, unknown>
): Pick<
  PortfolioAboutPresentationSettings,
  | 'whyMeDecorEnabled'
  | 'whyMeDecorShape'
  | 'whyMeDecorColor'
  | 'whyMeDecorOpacity'
  | 'whyMeDecorSize'
  | 'whyMeDecorX'
  | 'whyMeDecorY'
  | 'whyMeDecorRotation'
  | 'whyMeDecorAlternation'
> {
  const merged = mergeServicesCardDecorSettings(aboutWhyMeCardDecorSettings(base), {
    cardDecorEnabled: record.whyMeDecorEnabled,
    cardDecorShape: record.whyMeDecorShape,
    cardDecorColor: record.whyMeDecorColor,
    cardDecorOpacity: record.whyMeDecorOpacity,
    cardDecorSize: record.whyMeDecorSize,
    cardDecorX: record.whyMeDecorX,
    cardDecorY: record.whyMeDecorY,
    cardDecorRotation: record.whyMeDecorRotation,
    cardDecorAlternation: record.whyMeDecorAlternation,
  });

  return {
    whyMeDecorEnabled: merged.cardDecorEnabled,
    whyMeDecorShape: merged.cardDecorShape,
    whyMeDecorColor: merged.cardDecorColor,
    whyMeDecorOpacity: merged.cardDecorOpacity,
    whyMeDecorSize: merged.cardDecorSize,
    whyMeDecorX: merged.cardDecorX,
    whyMeDecorY: merged.cardDecorY,
    whyMeDecorRotation: merged.cardDecorRotation,
    whyMeDecorAlternation: merged.cardDecorAlternation,
  };
}

export function aboutWhyMeFrameClass(
  p: Pick<
    PortfolioAboutPresentationSettings,
    'whyMeBorder' | 'whyMeBorderRadius' | 'whyMePadding' | 'whyMeBackgroundEnabled'
  >,
  options?: { includePadding?: boolean }
): string {
  const parts: string[] = [];
  // Radius only matters when there is a visible surface (fill or border).
  if (p.whyMeBackgroundEnabled !== false || p.whyMeBorder !== 'none') {
    parts.push(servicesCardRadiusClass(p.whyMeBorderRadius));
  }
  if (options?.includePadding !== false) {
    // Callers pass shell with whyMePadding already resolved via aboutWhyMeEffectivePadding.
    parts.push(servicesCardPaddingClass(p.whyMePadding));
  }
  if (p.whyMeBorder !== 'none') {
    parts.push(aboutCardBorderWidthClass(p.whyMeBorder));
    if (p.whyMeBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function aboutWhyMeFrameStyle(p: PortfolioAboutPresentationSettings): CSSProperties {
  const style: CSSProperties = {};

  if (p.whyMeBackgroundFill === 'solid' && p.whyMeBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.whyMeBackgroundColor, DEFAULT_ABOUT_WHY_ME_BACKGROUND_COLOR);
  }

  if (p.whyMeBorder === 'accent') {
    style.borderColor = sanitizeHex(p.accentColor, DEFAULT_ABOUT_ACCENT_COLOR);
  } else if (p.whyMeBorder === 'soft' || p.whyMeBorder === 'solid') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.whyMeBorderColor, DEFAULT_ABOUT_WHY_ME_BORDER_COLOR);
  }

  return style;
}

export function patchAboutElementStyle(
  styles: PortfolioAboutElementStyles,
  target: PortfolioAboutStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioAboutElementStyles {
  return patchElementStylesRecord(styles, target, patch, DEFAULT_ABOUT_ELEMENT_STYLES, ABOUT_STYLE_TARGET_IDS);
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
    subtitleSerif: typeof record.subtitleSerif === 'boolean' ? record.subtitleSerif : base.subtitleSerif,
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    showAboutHeading: false,
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
    twinColumnsSplit: pick(
      record.twinColumnsSplit,
      ['equal', 'why-me-70', 'auto'],
      base.twinColumnsSplit ?? 'why-me-70'
    ),
    contentPairAlign: pick(
      record.contentPairAlign,
      ['start', 'center', 'end'],
      base.contentPairAlign ?? 'start'
    ),
    whyMeMediaPlacement: 'text-only',
    whyMeContentAlign: pick(record.whyMeContentAlign, ['left', 'center', 'right'], base.whyMeContentAlign),
    whyMeBodyLayout: pick(record.whyMeBodyLayout, ['stack', 'inline'], base.whyMeBodyLayout ?? 'stack'),
    whyMeGap: pick(record.whyMeGap, ['sm', 'md', 'lg', 'custom'], base.whyMeGap),
    whyMeGapPx: clampAboutWhyMeGapPx(
      record.whyMeGapPx,
      record.whyMeGap === 'sm'
        ? 16
        : record.whyMeGap === 'lg'
          ? 32
          : base.whyMeGapPx ?? 24
    ),
    whyMeBorder: pick(record.whyMeBorder, ['none', 'soft', 'solid', 'accent'], base.whyMeBorder),
    whyMeBorderColor: sanitizeHex(record.whyMeBorderColor, base.whyMeBorderColor),
    whyMeBackgroundEnabled:
      typeof record.whyMeBackgroundEnabled === 'boolean'
        ? record.whyMeBackgroundEnabled
        : base.whyMeBackgroundEnabled,
    whyMeBackgroundColor: sanitizeHex(record.whyMeBackgroundColor, base.whyMeBackgroundColor),
    whyMeBorderRadius: pick(record.whyMeBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.whyMeBorderRadius),
    whyMePadding: pick(record.whyMePadding, ['none', 'sm', 'md', 'lg'], base.whyMePadding),
    ...mergeWhyMeBackgroundFields(base, record),
    ...mergeWhyMeDecorFields(base, record),
    whyMeDesign: pick(
      record.whyMeDesign,
      ['timeline', 'split', 'lined-list', 'media-aside'],
      'timeline'
    ),
    whyMeItemsPerRow: (() => {
      const raw = record.whyMeItemsPerRow;
      if (raw === 1 || raw === 2 || raw === 3 || raw === 4) return raw;
      if (raw === '1' || raw === '2' || raw === '3' || raw === '4') {
        return Number(raw) as PortfolioAboutWhyMeItemsPerRow;
      }
      return base.whyMeItemsPerRow;
    })(),
    whyMeMarkerStyle: isPortfolioAboutWhyMeMarkerStyle(record.whyMeMarkerStyle)
      ? record.whyMeMarkerStyle
      : base.whyMeMarkerStyle,
    whyMeMarkerPlacement: isPortfolioAboutWhyMeMarkerPlacement(record.whyMeMarkerPlacement)
      ? record.whyMeMarkerPlacement
      : base.whyMeMarkerPlacement,
    whyMeShowHeaderAccent:
      typeof record.whyMeShowHeaderAccent === 'boolean'
        ? record.whyMeShowHeaderAccent
        : base.whyMeShowHeaderAccent,
    whyMeMarkerSize: pick(
      record.whyMeMarkerSize,
      ['sm', 'md', 'lg', 'xl', 'custom'],
      base.whyMeMarkerSize
    ),
    whyMeMarkerSizePx: clampListMarkerSizePx(
      record.whyMeMarkerSizePx,
      base.whyMeMarkerSizePx ?? ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX.md
    ),
    whyMeMarkerWeight: isPortfolioListMarkerWeight(record.whyMeMarkerWeight)
      ? record.whyMeMarkerWeight
      : base.whyMeMarkerWeight ?? 'regular',
    whyMeMarkerWeightAmount: clampListMarkerWeightAmount(
      record.whyMeMarkerWeightAmount,
      base.whyMeMarkerWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    whyMeMarkerColor: sanitizeHex(record.whyMeMarkerColor, base.whyMeMarkerColor),
    whyMeHeadingPreset: pick(
      record.whyMeHeadingPreset,
      ['default', 'why-work-with-me', 'why-choose-me', 'my-approach', 'strengths', 'value', 'custom'],
      base.whyMeHeadingPreset
    ),
    whyMeHeadingCustom:
      typeof record.whyMeHeadingCustom === 'string' ? record.whyMeHeadingCustom : base.whyMeHeadingCustom,
    whyMeHeadingAlignment: pick(record.whyMeHeadingAlignment, ['left', 'center', 'right'], base.whyMeHeadingAlignment),
    whyMeHeadingFont: pick(record.whyMeHeadingFont, ['sans', 'serif', 'display'], base.whyMeHeadingFont),
    whyMeHeadingColor: sanitizeHex(record.whyMeHeadingColor, base.whyMeHeadingColor),
    whyMeHeadingSize: pick(record.whyMeHeadingSize, ['sm', 'md', 'lg'], base.whyMeHeadingSize),
    whyMeHeadingUppercase:
      typeof record.whyMeHeadingUppercase === 'boolean'
        ? record.whyMeHeadingUppercase
        : base.whyMeHeadingUppercase,
    accentColor: sanitizeHex(record.accentColor, base.accentColor),
    showStats: false,
    showSidePanel: typeof record.showSidePanel === 'boolean' ? record.showSidePanel : base.showSidePanel,
    showWhyMe: typeof record.showWhyMe === 'boolean' ? record.showWhyMe : base.showWhyMe,
    showWhyMeHeading:
      typeof record.showWhyMeHeading === 'boolean' ? record.showWhyMeHeading : base.showWhyMeHeading,
    whyMeHeading:
      typeof record.whyMeHeading === 'string' && record.whyMeHeading.trim()
        ? record.whyMeHeading.trim()
        : base.whyMeHeading,
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
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

  if (isLegacyDefaultWhyMeDecor(next)) {
    next = {
      ...next,
      ...DEFAULT_ABOUT_WHY_ME_DECOR,
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
