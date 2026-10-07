import {
  DEFAULT_SERVICES_PRICING_STYLE_SETTINGS,
  mergeServicesPricingStyleSettings,
  type PortfolioServicesPricingStyleSettings,
} from '@/components/portfolio/portfolio-services-pricing-style';
import type { CSSProperties } from 'react';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import { DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS, mergeServicesCardBackgroundSettings, withMigratedServicesCardBackground, type PortfolioServicesCardBackgroundSettings } from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
  mergeServicesCardDecorSettings,
  type PortfolioServicesCardDecorSettings,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import { createElementTextStyle, ELEMENT_TEXT_SIZE_PRESET_PX, ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT, normalizeElementStylesRecord, type PortfolioElementTextStyle, type PortfolioToolsIconSize } from '@/components/portfolio/portfolio-element-text-style';
import {
  normalizePortfolioWorkCtaIcon,
  type PortfolioWorkCtaIcon,
  type PortfolioWorkCtaIconPosition,
} from '@/components/portfolio/portfolio-work-cta-icons';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import { isPortfolioListMarkerSize, isPortfolioListMarkerSource, isPortfolioListMarkerStyle, isPortfolioListMarkerWeight, clampListMarkerSizePx, clampListMarkerWeightAmount, LIST_MARKER_SIZE_PRESET_PX, LIST_MARKER_WEIGHT_PRESET_AMOUNT, type PortfolioListMarkerSize, type PortfolioListMarkerSource, type PortfolioListMarkerStyle, type PortfolioListMarkerWeight } from '@/components/portfolio/portfolio-list-marker';
import {
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  applyServicesPaletteToSettings,
  mergeServicesColorBindings,
  mergeServicesPalette,
  type PortfolioServicesColorBindings,
  type PortfolioServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  SERVICES_HEADER_ACCENT_COUNT_ALIGNMENTS,
  SERVICES_HEADER_BILLBOARD_WORD_STYLES,
  SERVICES_HEADER_DESIGNS,
  SERVICES_HEADER_MARGIN_BOTTOM_STEPS,
  SERVICES_HEADER_PALETTE_TOKENS,
  SERVICES_HEADER_TITLE_SIZES,
  SERVICES_HEADER_TITLE_WEIGHTS,
  type PortfolioServicesHeaderAccentCountAlignment,
  type PortfolioServicesHeaderBillboardWordStyle,
  type PortfolioServicesHeaderDesign,
  type PortfolioServicesHeaderDesignAlignment,
  type PortfolioServicesHeaderMarginBottom,
  type PortfolioServicesHeaderPaletteToken,
  type PortfolioServicesHeaderTitleSize,
  type PortfolioServicesHeaderTitleWeight,
} from '@/components/portfolio/portfolio-services-header-settings';

export type PortfolioServicesTitlePreset =
  | 'services-skills'
  | 'expertise'
  | 'what-i-offer'
  | 'skills-services'
  | 'custom';

export type PortfolioServicesSubtitlePreset =
  | 'default'
  | 'short'
  | 'collaboration'
  | 'craft'
  | 'minimal'
  | 'custom';

export type PortfolioServicesHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioServicesHeaderAlignment = 'left' | 'center';

export type PortfolioServicesLayoutMode = 'combined' | 'separated';

export type PortfolioServicesSectionOrganization = 'combined' | 'separated' | 'distinct';

export type PortfolioServicesBlockScope = 'skills' | 'services';

/**
 * Body/content design for the Services section (Design tab) — independent of the shared
 * GSAP header above. The legacy `carousel` layout (EditorialServicesCarousel) has been
 * removed; any stored `carousel` value (or other unrecognized value) resolves to the
 * default below.
 */
export type PortfolioServicesSectionDesign =
  | 'showcase-hero'
  | 'services-pricing-grid'
  | 'services-pricing-bento'
  | 'services-pricing-monolith'
  | 'services-pricing-aurora'
  | 'services-pricing-toggle'
  | 'services-index-list'
  | 'services-media-columns';

const DEFAULT_PORTFOLIO_SERVICES_SECTION_DESIGN: PortfolioServicesSectionDesign = 'showcase-hero';

const PORTFOLIO_SERVICES_SECTION_DESIGNS: readonly PortfolioServicesSectionDesign[] = [
  'showcase-hero',
  'services-pricing-grid',
  'services-pricing-bento',
  'services-pricing-monolith',
  'services-pricing-aurora',
  'services-pricing-toggle',
  'services-index-list',
  'services-media-columns',
];

export const PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS: {
  value: PortfolioServicesSectionDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'showcase-hero',
    label: 'Showcase Hero',
    description:
      'Full-bleed cinematic hero — a tilted thumbnail with an overlapping display title, magnetic edge arrows, mouse parallax, and split-text reveals on every transition.',
  },
  {
    value: 'services-pricing-grid',
    label: 'Pricing Grid',
    description:
      'Three-tier editorial pricing cards — a centered popular plan with a radical color inversion, borderless opacity-0.6 feature lists, a magnetic "Get started" CTA to Contact, and a GSAP 3D-tilt/focus-blur hover.',
  },
  {
    value: 'services-pricing-bento',
    label: 'Pricing Bento',
    description:
      'Two-tier bento composition — one card carries a textured, asymmetric graphic header in the palette accent; bullet-less features float at 0.5 opacity with generous line-height.',
  },
  {
    value: 'services-pricing-monolith',
    label: 'Pricing Monolith',
    description:
      'Borderless glassmorphic cards with monumental, ultra-tight display pricing, capital micro-labels, a theatrical 3D-tilt/motion-blur hover, and a magnetic "[ Get Started → ]" link.',
  },
  {
    value: 'services-pricing-aurora',
    label: 'Pricing Aurora',
    description:
      'Glassmorphic three-tier grid with a gradient-border focus on the popular plan, massive tight-leading prices, and a magnetic bracket CTA.',
  },
  {
    value: 'services-pricing-toggle',
    label: 'Pricing Toggle',
    description:
      'Horizontal three-row layout with a spring-physics Monthly/Yearly switch, an animated price transition, and a full-color-inversion popular row.',
  },
  {
    value: 'services-index-list',
    label: 'Index List',
    description:
      'Numbered editorial rows — index, large title, description and task tags on the left, the service media on the right, with a drawn rule and a clip-path media reveal on scroll.',
  },
  {
    value: 'services-media-columns',
    label: 'Media Columns',
    description:
      'A clean grid of service cards — large cover media on top, title and description underneath. Columns, corner radius, gap, media ratio and alignment are all configurable.',
  },
];

/** Where the media sits in each Index List row; `zigzag` alternates it row by row. */
export type PortfolioServicesIndexListLayout = 'media-right' | 'media-left' | 'zigzag';

/** How a service's tasks are presented in the Index List design. */
export type PortfolioServicesIndexListTasksStyle =
  | 'pills'
  | 'ledger'
  | 'numbered'
  | 'inline';

export type PortfolioServicesIndexListMediaRatio = 'wide' | 'standard' | 'square';

/** Options that apply only when `sectionDesign === 'services-index-list'`. */
export type PortfolioServicesIndexListSettings = {
  layout: PortfolioServicesIndexListLayout;
  tasksStyle: PortfolioServicesIndexListTasksStyle;
  mediaRatio: PortfolioServicesIndexListMediaRatio;
  /** Shows the small "01/" index above each title. */
  showIndex: boolean;
};

export const DEFAULT_SERVICES_INDEX_LIST_SETTINGS: PortfolioServicesIndexListSettings = {
  layout: 'media-right',
  tasksStyle: 'pills',
  mediaRatio: 'wide',
  showIndex: true,
};

export const PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS: {
  value: PortfolioServicesIndexListLayout;
  label: string;
}[] = [
  { value: 'media-right', label: 'Media right' },
  { value: 'media-left', label: 'Media left' },
  { value: 'zigzag', label: 'Zigzag' },
];

export const PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS: {
  value: PortfolioServicesIndexListTasksStyle;
  label: string;
}[] = [
  { value: 'pills', label: 'Pills' },
  { value: 'ledger', label: 'Ledger' },
  { value: 'numbered', label: 'Numbered' },
  { value: 'inline', label: 'Inline' },
];

export const PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS: {
  value: PortfolioServicesIndexListMediaRatio;
  label: string;
}[] = [
  { value: 'wide', label: '16:9' },
  { value: 'standard', label: '4:3' },
  { value: 'square', label: '1:1' },
];

function pickOption<T extends string | number>(
  value: unknown,
  options: readonly { value: T }[],
  fallback: T
): T {
  return options.some((option) => option.value === value) ? (value as T) : fallback;
}

function mergeServicesIndexListSettings(
  base: PortfolioServicesIndexListSettings,
  patch: unknown
): PortfolioServicesIndexListSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    layout: pickOption(record.layout, PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS, base.layout),
    tasksStyle: pickOption(record.tasksStyle, PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS, base.tasksStyle),
    mediaRatio: pickOption(record.mediaRatio, PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS, base.mediaRatio),
    showIndex: typeof record.showIndex === 'boolean' ? record.showIndex : base.showIndex,
  };
}

/** Options that apply only when `sectionDesign === 'services-media-columns'`. */
export type PortfolioServicesMediaColumnsCount = 2 | 3 | 4;
export type PortfolioServicesMediaColumnsMobileCount = 1 | 2;
export type PortfolioServicesMediaColumnsRatio = 'portrait' | 'square' | 'landscape' | 'wide';
export type PortfolioServicesMediaColumnsRadius = 'none' | 'small' | 'medium' | 'large' | 'round';
export type PortfolioServicesMediaColumnsGap = 'tight' | 'normal' | 'wide' | 'roomy';
export type PortfolioServicesMediaColumnsTextAlign = 'left' | 'center';
export type PortfolioServicesMediaColumnsHover = 'zoom' | 'lift' | 'none';

export type PortfolioServicesMediaColumnsSettings = {
  /** Cards per row on desktop (tablet always shows 2). */
  columns: PortfolioServicesMediaColumnsCount;
  /** Cards per row on phones. */
  mobileColumns: PortfolioServicesMediaColumnsMobileCount;
  mediaRatio: PortfolioServicesMediaColumnsRatio;
  cardRadius: PortfolioServicesMediaColumnsRadius;
  gap: PortfolioServicesMediaColumnsGap;
  textAlign: PortfolioServicesMediaColumnsTextAlign;
  /** Centers an incomplete last row instead of leaving it flush left. */
  centerLastRow: boolean;
  showDescription: boolean;
  hoverEffect: PortfolioServicesMediaColumnsHover;
};

export const DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS: PortfolioServicesMediaColumnsSettings = {
  columns: 4,
  mobileColumns: 1,
  mediaRatio: 'portrait',
  cardRadius: 'medium',
  gap: 'normal',
  textAlign: 'left',
  centerLastRow: false,
  showDescription: true,
  hoverEffect: 'zoom',
};

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS: {
  value: PortfolioServicesMediaColumnsCount;
  label: string;
}[] = [
  { value: 2, label: '2 per row' },
  { value: 3, label: '3 per row' },
  { value: 4, label: '4 per row' },
];

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_MOBILE_OPTIONS: {
  value: PortfolioServicesMediaColumnsMobileCount;
  label: string;
}[] = [
  { value: 1, label: '1 column' },
  { value: 2, label: '2 columns' },
];

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS: {
  value: PortfolioServicesMediaColumnsRatio;
  label: string;
}[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'square', label: 'Square' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'wide', label: 'Wide' },
];

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS: {
  value: PortfolioServicesMediaColumnsRadius;
  label: string;
}[] = [
  { value: 'none', label: 'Square' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'round', label: 'Round' },
];

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS: {
  value: PortfolioServicesMediaColumnsGap;
  label: string;
}[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
  { value: 'roomy', label: 'Roomy' },
];

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS: {
  value: PortfolioServicesMediaColumnsTextAlign;
  label: string;
}[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];

export const PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS: {
  value: PortfolioServicesMediaColumnsHover;
  label: string;
}[] = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'lift', label: 'Lift' },
  { value: 'none', label: 'None' },
];

function mergeServicesMediaColumnsSettings(
  base: PortfolioServicesMediaColumnsSettings,
  patch: unknown
): PortfolioServicesMediaColumnsSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    columns: pickOption(record.columns, PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS, base.columns),
    mobileColumns: pickOption(
      record.mobileColumns,
      PORTFOLIO_SERVICES_MEDIA_COLUMNS_MOBILE_OPTIONS,
      base.mobileColumns
    ),
    mediaRatio: pickOption(record.mediaRatio, PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS, base.mediaRatio),
    cardRadius: pickOption(record.cardRadius, PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS, base.cardRadius),
    gap: pickOption(record.gap, PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS, base.gap),
    textAlign: pickOption(
      record.textAlign,
      PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS,
      base.textAlign
    ),
    centerLastRow: typeof record.centerLastRow === 'boolean' ? record.centerLastRow : base.centerLastRow,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    hoverEffect: pickOption(record.hoverEffect, PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS, base.hoverEffect),
  };
}

/** One of 4 fixed palette tokens the creator can pick for the popular card's fill — always a
 *  real color from the active theme palette, never a free hex picker. */
export type PortfolioServicesPricingGridPopularColorToken = 'principal' | 'secondaire' | 'texteFort' | 'neutre';

/** Options that apply only when `sectionDesign === 'services-pricing-grid'`. */
export type PortfolioServicesPricingGridSettings = {
  /** 0-based index of the service that renders as the centered, elevated "popular" tier. */
  popularIndex: number;
  /** Micro-label on the popular card's badge ("Popular", "Top"…). Empty hides it. */
  popularBadgeLabel: string;
  /** Small suffix after the price ("/ month"…). Hidden on Free / price-on-request cards. */
  periodLabel: string;
  /** CTA button label — the real data model has no per-item CTA text field. */
  ctaLabel: string;
  /** Which palette token fills the popular card's background (dark mode). */
  popularColorToken: PortfolioServicesPricingGridPopularColorToken;
};

export const DEFAULT_SERVICES_PRICING_GRID_SETTINGS: PortfolioServicesPricingGridSettings = {
  popularIndex: 1,
  popularBadgeLabel: 'Popular',
  periodLabel: '/ month',
  ctaLabel: 'Get started',
  popularColorToken: 'principal',
};

function mergeServicesPricingGridSettings(
  base: PortfolioServicesPricingGridSettings,
  patch: unknown
): PortfolioServicesPricingGridSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? Math.max(0, Math.round(record.popularIndex))
        : base.popularIndex,
    popularBadgeLabel:
      typeof record.popularBadgeLabel === 'string' ? record.popularBadgeLabel : base.popularBadgeLabel,
    periodLabel: typeof record.periodLabel === 'string' ? record.periodLabel : base.periodLabel,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
    popularColorToken:
      record.popularColorToken === 'principal' ||
      record.popularColorToken === 'secondaire' ||
      record.popularColorToken === 'texteFort' ||
      record.popularColorToken === 'neutre'
        ? record.popularColorToken
        : base.popularColorToken,
  };
}

export type PortfolioServicesPricingBentoMotif = 'shapes' | 'lines' | 'dots' | 'grid' | 'waves' | 'none';

export const PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS: {
  value: PortfolioServicesPricingBentoMotif;
  label: string;
}[] = [
  { value: 'shapes', label: 'Shapes' },
  { value: 'lines', label: 'Lines' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'waves', label: 'Waves' },
  { value: 'none', label: 'None' },
];

/** Options that apply only when `sectionDesign === 'services-pricing-bento'`. */
export type PortfolioServicesPricingBentoSettings = {
  /** Index (within the rendered service list) of the card that gets the textured,
   *  asymmetric graphic header. Clamped to the available items at render time. */
  graphicHeaderIndex: number;
  /** Small suffix shown after a non-free price (e.g. "/ project", "/ mo"). Empty hides it. */
  periodLabel: string;
  /** Label on every card's CTA button (routes to the Contact section). */
  ctaLabel: string;
  /** Pattern drawn in the featured card's graphic header; `none` removes the header. */
  graphicMotif: PortfolioServicesPricingBentoMotif;
};

export const DEFAULT_SERVICES_PRICING_BENTO_SETTINGS: PortfolioServicesPricingBentoSettings = {
  graphicHeaderIndex: 0,
  periodLabel: '/ project',
  ctaLabel: 'Get Started',
  graphicMotif: 'shapes',
};

export function mergeServicesPricingBentoSettings(
  base: PortfolioServicesPricingBentoSettings,
  patch: unknown
): PortfolioServicesPricingBentoSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    graphicHeaderIndex:
      typeof record.graphicHeaderIndex === 'number' && Number.isFinite(record.graphicHeaderIndex)
        ? Math.max(0, Math.round(record.graphicHeaderIndex))
        : base.graphicHeaderIndex,
    periodLabel: typeof record.periodLabel === 'string' ? record.periodLabel : base.periodLabel,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
    graphicMotif:
      record.graphicMotif === 'shapes' ||
      record.graphicMotif === 'lines' ||
      record.graphicMotif === 'dots' ||
      record.graphicMotif === 'grid' ||
      record.graphicMotif === 'waves' ||
      record.graphicMotif === 'none'
        ? record.graphicMotif
        : base.graphicMotif,
  };
}

/** Options that apply only when `sectionDesign === 'services-pricing-monolith'`. */
export type PortfolioServicesPricingMonolithColumns = 1 | 2 | 3 | 4;

export type PortfolioServicesPricingMonolithSettings = {
  /** 0-based item index rendered as the "Popular" focal tier. */
  popularIndex: number;
  /** Suffix after the price on paid tiers, e.g. "/ month", "/ life". */
  periodLabel: string;
  /** Whether the period suffix renders at all. */
  showPeriod: boolean;
  /** The magnetic CTA link label ("[ Get Started → ]"). */
  ctaLabel: string;
  /** Cards per row on tablet/desktop. Always capped to the number of services and
   *  centered (via flexbox, not CSS grid) when the last row doesn't fill every column —
   *  mobile always stays a single stacked column regardless of this value. */
  cardsPerRow: PortfolioServicesPricingMonolithColumns;
};

export const DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS: PortfolioServicesPricingMonolithSettings = {
  popularIndex: 1,
  periodLabel: '/ month',
  showPeriod: true,
  ctaLabel: 'Get Started',
  cardsPerRow: 3,
};

function mergeServicesPricingMonolithSettings(
  base: PortfolioServicesPricingMonolithSettings,
  patch: unknown
): PortfolioServicesPricingMonolithSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? Math.trunc(record.popularIndex)
        : base.popularIndex,
    periodLabel:
      typeof record.periodLabel === 'string' && record.periodLabel.trim()
        ? record.periodLabel
        : base.periodLabel,
    showPeriod: typeof record.showPeriod === 'boolean' ? record.showPeriod : base.showPeriod,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
    cardsPerRow:
      record.cardsPerRow === 1 || record.cardsPerRow === 2 || record.cardsPerRow === 3 || record.cardsPerRow === 4
        ? record.cardsPerRow
        : base.cardsPerRow,
  };
}

export const PORTFOLIO_SERVICES_PRICING_MONOLITH_COLUMNS_OPTIONS: {
  value: PortfolioServicesPricingMonolithColumns;
  label: string;
  description: string;
}[] = [
  { value: 1, label: '1 per row', description: 'Full-width cards, stacked — a large editorial spotlight per plan.' },
  { value: 2, label: '2 per row', description: 'Wide side-by-side pairing.' },
  { value: 3, label: '3 per row', description: 'Classic three-tier grid (default).' },
  { value: 4, label: '4 per row', description: 'Compact grid for larger service catalogs.' },
];

export type PortfolioServicesPricingAuroraColumns = 1 | 2 | 3 | 4;
/** One of 4 fixed palette tokens the creator can pick for the featured card's accent —
 *  same convention as Pricing Grid's `popularColorToken`, always a real palette color. */
export type PortfolioServicesPricingAuroraPopularColorToken = 'principal' | 'secondaire' | 'texteFort' | 'neutre';

/** Options that apply only when `sectionDesign === 'services-pricing-aurora'`. */
export type PortfolioServicesPricingAuroraSettings = {
  /** 0-based index into the real (filtered) services list that gets the featured-card
   *  accent treatment. */
  popularIndex: number;
  /** Suffix shown after a numeric price, e.g. "/ month". Empty hides it. */
  periodLabel: string;
  /** Magnetic CTA label, e.g. "Try for free". */
  ctaLabel: string;
  /** Cards per row on tablet/desktop; mobile always stays a single stacked column. */
  cardsPerRow: PortfolioServicesPricingAuroraColumns;
  /** Which palette token drives the featured card's gradient-border/glass-tint accent. */
  popularColorToken: PortfolioServicesPricingAuroraPopularColorToken;
};

export const DEFAULT_SERVICES_PRICING_AURORA_SETTINGS: PortfolioServicesPricingAuroraSettings = {
  popularIndex: 1,
  periodLabel: '/ month',
  ctaLabel: 'Try for free',
  cardsPerRow: 3,
  popularColorToken: 'principal',
};

function mergeServicesPricingAuroraSettings(
  base: PortfolioServicesPricingAuroraSettings,
  patch: unknown
): PortfolioServicesPricingAuroraSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? Math.max(0, Math.round(record.popularIndex))
        : base.popularIndex,
    periodLabel: typeof record.periodLabel === 'string' ? record.periodLabel : base.periodLabel,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
    cardsPerRow:
      record.cardsPerRow === 1 || record.cardsPerRow === 2 || record.cardsPerRow === 3 || record.cardsPerRow === 4
        ? record.cardsPerRow
        : base.cardsPerRow,
    popularColorToken:
      record.popularColorToken === 'principal' ||
      record.popularColorToken === 'secondaire' ||
      record.popularColorToken === 'texteFort' ||
      record.popularColorToken === 'neutre'
        ? record.popularColorToken
        : base.popularColorToken,
  };
}

export const PORTFOLIO_SERVICES_PRICING_AURORA_COLUMNS_OPTIONS: {
  value: PortfolioServicesPricingAuroraColumns;
  label: string;
  description: string;
}[] = [
  { value: 1, label: '1 per row', description: 'Full-width cards, stacked — a large editorial spotlight per plan.' },
  { value: 2, label: '2 per row', description: 'Wide side-by-side pairing.' },
  { value: 3, label: '3 per row', description: 'Classic three-tier grid (default).' },
  { value: 4, label: '4 per row', description: 'Compact grid for larger service catalogs.' },
];

/** Options that apply only when `sectionDesign === 'services-pricing-toggle'`. */
type PortfolioServicesPricingToggleBillingCycle = 'monthly' | 'yearly';

export type PortfolioServicesPricingToggleSettings = {
  /** Which visible row (0-indexed) gets the full color-inversion treatment. */
  popularIndex: number;
  /** Small label on the popular row's badge. Empty hides the badge. */
  popularBadgeLabel: string;
  /** Suffix after the monthly price, e.g. "/ month". */
  periodMonthlyLabel: string;
  /** Suffix after the yearly price, e.g. "/ year". */
  periodYearlyLabel: string;
  /** No separate yearly price exists on a service (only `basePriceCents`), so Yearly is
   *  derived: monthly x 12 x (1 - discount / 100). */
  yearlyDiscountPercent: number;
  /** CTA pill label on every row. */
  ctaLabel: string;
  /** Toggle position on first paint. */
  defaultBilling: PortfolioServicesPricingToggleBillingCycle;
};

export const DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS: PortfolioServicesPricingToggleSettings = {
  popularIndex: 0,
  popularBadgeLabel: 'Most popular',
  periodMonthlyLabel: '/ month',
  periodYearlyLabel: '/ year',
  yearlyDiscountPercent: 15,
  ctaLabel: 'Get Started',
  defaultBilling: 'monthly',
};

function mergeServicesPricingToggleSettings(
  base: PortfolioServicesPricingToggleSettings,
  patch: unknown
): PortfolioServicesPricingToggleSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? Math.max(0, Math.round(record.popularIndex))
        : base.popularIndex,
    popularBadgeLabel:
      typeof record.popularBadgeLabel === 'string'
        ? record.popularBadgeLabel.trim().slice(0, 40)
        : base.popularBadgeLabel,
    periodMonthlyLabel:
      typeof record.periodMonthlyLabel === 'string' && record.periodMonthlyLabel.trim()
        ? record.periodMonthlyLabel.trim().slice(0, 24)
        : base.periodMonthlyLabel,
    periodYearlyLabel:
      typeof record.periodYearlyLabel === 'string' && record.periodYearlyLabel.trim()
        ? record.periodYearlyLabel.trim().slice(0, 24)
        : base.periodYearlyLabel,
    yearlyDiscountPercent:
      typeof record.yearlyDiscountPercent === 'number' && Number.isFinite(record.yearlyDiscountPercent)
        ? Math.min(90, Math.max(0, Math.round(record.yearlyDiscountPercent)))
        : base.yearlyDiscountPercent,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim().slice(0, 32)
        : base.ctaLabel,
    defaultBilling:
      record.defaultBilling === 'monthly' || record.defaultBilling === 'yearly'
        ? record.defaultBilling
        : base.defaultBilling,
  };
}

export type PortfolioServicesBlockSettings = PortfolioServicesCardBackgroundSettings &
  PortfolioServicesCardDecorSettings & {
  galleryLayout: PortfolioServicesGalleryLayout;
  columns: PortfolioServicesCardColumns;
  displayMode: PortfolioServicesDisplayMode;
  contentAlignment: PortfolioServicesContentAlignment;
  pricePlacement: PortfolioServicesPricePlacement;
  iconPlacement: PortfolioServicesIconPlacement;
  cardDesign: PortfolioServicesCardDesign;
  cardDesignIntensities: PortfolioServicesCardDesignIntensities;
  cardDesignTints: PortfolioServicesCardDesignTints;
  cardAccentColor: string;
  stageDesign: PortfolioServicesStageDesign;
} & PortfolioServicesStageChromeSettings & {
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  /** 0–100 opacity for the card outline (soft / solid / accent). */
  cardBorderOpacity: number;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBackgroundColorDark: string;
  cardBackgroundColorBDark: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  cardBackgroundAlternation: PortfolioServicesCardBackgroundAlternation;
};

export type PortfolioServicesDistinctHeaderSettings = {
  titlePreset: PortfolioServicesTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioServicesSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioServicesHeaderFont;
  subtitleFont: PortfolioServicesHeaderFont;
  titleColor: string;
  subtitleColor: string;
  headerAlignment: PortfolioServicesHeaderAlignment;
  sectionLayout: PortfolioServicesSectionLayout;
};

export type PortfolioServicesDisplayMode = 'marquee' | 'grid' | 'stack' | 'coverflow' | 'deck';

/** Scroll direction for infinite marquee (Carrousel infini). */
export type PortfolioServicesMarqueeDirection = 'left' | 'right';

/**
 * Deck entrance motion — room to add more presets later.
 * - none: fan already open (no scroll expand)
 * - expand: stacked → diagonal fan on enter
 */
export type PortfolioServicesDeckEntranceEffect = 'none' | 'expand' | 'cascade';

/** Caps skill/service card width — same scale as Work portfolio cards. */
export type PortfolioServicesCardMaxWidth = 'full' | 'xl' | 'lg' | 'md' | 'sm';

/** Frame alignment in the column when width is capped (like Work cardAlignment). */
export type PortfolioServicesCardAlignment = 'left' | 'center' | 'right';

export type PortfolioServicesGalleryLayout =
  | 'card'
  | 'list'
  | 'service-selector'
  | 'service-accordion'
  | 'commercial-list'
  | 'pricing-hero'
  | 'tier'
  | 'plan'
  | 'plan-split'
  | 'card-media'
  | 'media-banner'
  | 'media-checklist'
  | 'media-split'
  | 'icon-stack'
  | 'pill-cloud'
  | 'tool-inspector';

/**
 * Presentation knobs that belong to one gallery design.
 * Switching layouts saves/restores these so each design stays independent.
 */
export type PortfolioServicesGalleryLayoutPreset = Partial<
  Pick<
    PortfolioServicesPresentationSettings,
    | 'displayMode'
    | 'servicesColumns'
    | 'cardMaxWidth'
    | 'cardAlignment'
    | 'servicesContentAlignment'
    | 'servicePriceAlign'
    | 'servicePricePrefixEnabled'
    | 'servicePricePeriodSuffix'
    | 'showServiceTitle'
    | 'showServiceDescription'
    | 'showServicePrice'
    | 'showServiceDelivery'
    | 'showServiceTasks'
    | 'showServiceCta'
    | 'servicesTaskBulletSource'
    | 'servicesTaskBulletStyle'
    | 'servicesTaskBulletColor'
    | 'servicesTaskBulletSize'
    | 'servicesTaskBulletSizePx'
    | 'servicesTaskBulletWeight'
    | 'servicesTaskBulletWeightAmount'
    | 'ctaLabel'
    | 'ctaDesign'
    | 'ctaAlignment'
    | 'ctaShowIcon'
    | 'ctaIcon'
    | 'ctaIconPosition'
    | 'elementStyles'
    | 'servicesColorBindings'
    | 'cardBackgroundEnabled'
    | 'servicesPrincipalSurfaceEnabled'
    | 'servicesPrincipalSurfaceAlternation'
    | 'servicesPrincipalSurfaceAlternateStart'
    | 'servicesMediaSide'
    | 'servicesMediaSideAlternation'
    | 'cardBorder'
    | 'cardBorderOpacity'
    | 'cardBackgroundFill'
    | 'cardBackgroundAlternation'
    | 'cardDecorEnabled'
    | 'cardDividerEnabled'
    | 'cardPadding'
    | 'commercialPriceWidthPx'
    | 'commercialCtaWidthPx'
    | 'commercialColumnGapPx'
  >
>;

/** Layouts removed from the picker — remap legacy saved values to Carte horizontal. */
const REMOVED_SERVICES_GALLERY_LAYOUTS = new Set<string>([
  'service-accordion',
  'pricing-hero',
  'accordion',
]);

const SERVICES_GALLERY_LAYOUT_VALUES: PortfolioServicesGalleryLayout[] = [
  'card',
  'list',
  'service-selector',
  'commercial-list',
  'tier',
  'plan',
  'plan-split',
  'card-media',
  'media-banner',
  'media-checklist',
  'media-split',
];

const SKILLS_GALLERY_LAYOUT_VALUES: PortfolioServicesGalleryLayout[] = [
  'card',
  'list',
  'icon-stack',
  'pill-cloud',
  'tool-inspector',
];

function normalizeServicesGalleryLayoutValue(
  raw: unknown,
  fallback: PortfolioServicesGalleryLayout,
  kind: 'services' | 'skills' = 'services'
): PortfolioServicesGalleryLayout {
  if (typeof raw === 'string' && REMOVED_SERVICES_GALLERY_LAYOUTS.has(raw)) {
    return 'card';
  }
  if (
    kind === 'skills' &&
    (raw === 'service-selector' ||
      raw === 'commercial-list' ||
      raw === 'tier' ||
      raw === 'plan' ||
      raw === 'plan-split' ||
      raw === 'card-media' ||
      raw === 'media-banner' ||
      raw === 'media-checklist' ||
      raw === 'media-split')
  ) {
    return 'card';
  }
  const allowed = kind === 'skills' ? SKILLS_GALLERY_LAYOUT_VALUES : SERVICES_GALLERY_LAYOUT_VALUES;
  if (typeof raw === 'string' && (allowed as string[]).includes(raw)) {
    return raw as PortfolioServicesGalleryLayout;
  }
  return fallback;
}

export type PortfolioSkillsInspectorRailPlacement = 'left' | 'right' | 'top';
type PortfolioServicesSectionLayout = 'stacked' | 'aside-left' | 'aside-right';
export type PortfolioSkillsInspectorIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';
export type PortfolioSkillsInspectorIllustrationPlacement = 'left' | 'right';
/** Decorative SVG beside the Services gallery (section-level). */
export type PortfolioServicesIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';
export type PortfolioServicesIllustrationPlacement = 'left' | 'right';

export type PortfolioServicesCardDesign = 'editorial' | 'minimal' | 'compact' | 'glass' | 'frost' | 'accent';

export type PortfolioServicesCardDesignIntensities = Record<PortfolioServicesCardDesign, number>;

export type PortfolioServicesCardDesignTints = Record<PortfolioServicesCardDesign, number>;

export type PortfolioServicesStageDesign = 'framed' | 'open' | 'soft' | 'none';

export type PortfolioServicesStageBorder = 'none' | 'soft' | 'solid';

export type PortfolioServicesStageRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioServicesStagePadding = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioServicesStagePattern = 'none' | 'dots' | 'grid' | 'diagonal';

/** Decorative corner marks on the stage shell (L-brackets). */
export type PortfolioServicesStageCorners = 'none' | 'diagonal' | 'all';

/** Chrome controls for the outer stage wrapper (framed / soft). */
type PortfolioServicesStageChromeSettings = {
  stageBackgroundEnabled: boolean;
  stageBackgroundColor: string;
  stageBackgroundOpacity: number;
  stageBorder: PortfolioServicesStageBorder;
  stageBorderColor: string;
  stageBorderRadius: PortfolioServicesStageRadius;
  stagePadding: PortfolioServicesStagePadding;
  stagePattern: PortfolioServicesStagePattern;
  stagePatternColor: string;
  stagePatternOpacity: number;
  /** Corner accents — `diagonal` = top-left + bottom-right. */
  stageCorners: PortfolioServicesStageCorners;
  /** Cap the stage panel width (like card max width). */
  stageMaxWidth: PortfolioServicesCardMaxWidth;
};

export type PortfolioServicesStackOrder = 'skills-first' | 'services-first';

export type PortfolioServicesCardBorder = 'none' | 'soft' | 'solid' | 'accent';

export type PortfolioServicesCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

/** Alternate light / muted card surfaces across the gallery. */
export type PortfolioServicesCardBackgroundAlternation = 'uniform' | 'alternate';
/** Which fill leads when principal-surface alternation is enabled. */
export type PortfolioServicesPrincipalSurfaceAlternateStart = 'principal' | 'normal';
/** Media column side for cover-image service layouts. */
export type PortfolioServicesMediaSide = 'media-left' | 'media-right';
/** Uniform = same side every card; alternate = flip media/info each card. */
export type PortfolioServicesMediaSideAlternation = 'uniform' | 'alternate';

export type PortfolioServicesCardPadding = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioServicesCardColumns = 1 | 2 | 3 | 4;

export type PortfolioServicesContentAlignment = 'left' | 'center' | 'right';

/** Vertical gap between elements inside a service / skill card frame. */
export type PortfolioServicesContentGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';

export type PortfolioServicesPricePlacement = 'end' | 'below' | 'top';

/** Whether the currency symbol appears before or after the amount digits. */
export type PortfolioServicesCurrencyPlacement = 'before' | 'after';

/** ISO 4217 currency code used for the price symbol on service cards. */
export type PortfolioServicesCurrencyCode = string;

export type PortfolioServicesIconPlacement = 'start' | 'top';
export type PortfolioSkillsIconRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/** Same CTA designs as Portfolio work cards (View project). */
export type PortfolioServicesCtaDesign =
  | 'pill-dark'
  | 'pill-outline'
  | 'pill-accent'
  | 'text-arrow'
  | 'circle-icon';

export type PortfolioServicesCtaBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export type PortfolioServicesCtaBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type PortfolioServicesCtaAlignment = 'left' | 'center' | 'right';

/** Which text element inside the skills / services section can be styled independently. */
type PortfolioServicesStyleTarget =
  | 'blockSubheading'
  | 'cardTitle'
  | 'cardBody'
  | 'price'
  | 'delivery'
  | 'tasks'
  | 'skillTitle'
  | 'skillBody'
  | 'cta';

export type PortfolioServicesElementStyles = Record<PortfolioServicesStyleTarget, PortfolioElementTextStyle>;

/** Per-element surface chrome (title / description / price / delivery / tasks on cards). */
type PortfolioServicesElementChromeId =
  | 'cardTitle'
  | 'cardBody'
  | 'skillTitle'
  | 'skillBody'
  | 'price'
  | 'delivery'
  | 'tasks';

type PortfolioServicesElementChromeSettings = {
  enabled: boolean;
  backgroundEnabled: boolean;
  backgroundColor: string;
  border: PortfolioServicesCardBorder;
  borderColor: string;
  borderRadius: PortfolioServicesCardRadius;
  padding: PortfolioServicesCardPadding;
  margin: PortfolioServicesCardPadding;
};

export type PortfolioServicesElementChromes = Record<
  PortfolioServicesElementChromeId,
  PortfolioServicesElementChromeSettings
>;

/** List marker for service card task / deliverable lines (shared vocabulary). */
export type PortfolioServicesTaskBulletStyle = PortfolioListMarkerStyle;

const DEFAULT_SERVICES_TASK_BULLET_COLOR = '#10b981';

const DEFAULT_SERVICES_ELEMENT_CHROME: PortfolioServicesElementChromeSettings = {
  enabled: false,
  backgroundEnabled: true,
  backgroundColor: '#fafafa',
  border: 'none',
  borderColor: '#e5e5e5',
  borderRadius: 'md',
  padding: 'sm',
  margin: 'none',
};

const DEFAULT_SERVICES_ELEMENT_CHROMES: PortfolioServicesElementChromes = {
  cardTitle: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
  cardBody: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
  skillTitle: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
  skillBody: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
  price: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
  delivery: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
  tasks: { ...DEFAULT_SERVICES_ELEMENT_CHROME },
};

/**
 * How card title/body ink adapts when backgrounds differ (esp. Alterné A/B).
 * - auto: pick dark or light ink from each card's painted surface luminance
 * - pair-ab: use explicit ink pairs for light (A) vs muted/alternate (B) cards
 */
export type PortfolioServicesCardTextContrast = 'auto' | 'pair-ab';

/**
 * Global type-size control for every Services design (pricing cards + showcase hero) — same
 * standardized-shared-value architecture as Experience/Footer/FAQ's "Font size" control: ONE
 * unified scale every design reads via its own `--pf-services-font-scale` CSS custom property
 * (set on the section's shared `<section id="services">` root), multiplying standardized
 * body/label font-size declarations. `medium` is each design's own current baseline size —
 * the other tiers scale relative to that, not to some other absolute reference.
 */
export type PortfolioServicesPremiumFontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

const SERVICES_PREMIUM_FONT_SIZES: PortfolioServicesPremiumFontSize[] = [
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
];

export const PORTFOLIO_SERVICES_PREMIUM_FONT_SIZE_OPTIONS: {
  value: PortfolioServicesPremiumFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Small', description: 'Compact type across every Services design.' },
  { value: 'medium', label: 'Medium', description: 'Default, balanced type size.' },
  { value: 'large', label: 'Large', description: 'Bigger type for maximum readability.' },
  { value: 'xlarge', label: 'Extra Large', description: 'Extra large type for a bold, high-impact look.' },
  {
    value: 'xxlarge',
    label: 'Super Extra Large',
    description: 'Maximum type size for the most dramatic, oversized look.',
  },
];

/** Multiplier every Services design's own standardized body/label text sizes are scaled by,
 *  via `calc(<base> * var(--pf-services-font-scale, 1))` in globals.css — same values as
 *  Experience/Footer/FAQ's identical scale, kept in sync deliberately. */
const SERVICES_PREMIUM_FONT_SCALE: Record<PortfolioServicesPremiumFontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
  xxlarge: 1.45,
};

export function servicesPremiumFontScale(size: PortfolioServicesPremiumFontSize): number {
  return SERVICES_PREMIUM_FONT_SCALE[size] ?? 1;
}

export type PortfolioServicesPresentationSettings = PortfolioSectionBackgroundSettings &
  PortfolioServicesCardBackgroundSettings &
  PortfolioServicesCardDecorSettings & {
  titlePreset: PortfolioServicesTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioServicesSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioServicesHeaderFont;
  subtitleFont: PortfolioServicesHeaderFont;
  titleColor: string;
  subtitleColor: string;
  headerAlignment: PortfolioServicesHeaderAlignment;
  /**
   * Header — one shared, GSAP-animated header mounted above the Services section, copied
   * 1:1 from the Portfolio/Work section's "Header" mechanism (services-portfolio-header-designs/*).
   * Independent of the section's own per-design layout (Design tab).
   */
  headerDesign: PortfolioServicesHeaderDesign;
  /** Master switch for the header's GSAP entrance/scroll motion (respects prefers-reduced-motion regardless). */
  headerAnimationEnabled: boolean;
  headerDesignAlignment: PortfolioServicesHeaderDesignAlignment;
  /** Bottom spacing under every header design — shared across all of them. */
  headerMarginBottom: PortfolioServicesHeaderMarginBottom;
  /** Title size/weight — shared across every header design. */
  headerTitleSize: PortfolioServicesHeaderTitleSize;
  headerTitleWeight: PortfolioServicesHeaderTitleWeight;
  /** Header accent count — badge text supports a {count} token for the service count. */
  headerAccentCountBadgeText: string;
  headerAccentCountLeadText: string;
  /** Header accent count — badge and lead bound to a palette token, independently. */
  headerAccentCountBadgeColor: PortfolioServicesHeaderPaletteToken;
  headerAccentCountLeadColor: PortfolioServicesHeaderPaletteToken;
  /** Header accent count — one size/weight for the whole line (badge + lead flow together). */
  headerAccentCountSize: PortfolioServicesHeaderTitleSize;
  headerAccentCountWeight: PortfolioServicesHeaderTitleWeight;
  /** Header accent count — its own 3-way alignment (adds "right", unlike the shared control). */
  headerAccentCountAlignment: PortfolioServicesHeaderAccentCountAlignment;
  /** Header serif lead — small label above the large serif title. */
  headerSerifLeadLabelText: string;
  /** Header serif lead — the large serif title itself, independent of the section title. */
  headerSerifLeadTitleText: string;
  /** Header serif lead — the line under the title; empty = the section subtitle. */
  headerSerifLeadSubtitleText: string;
  /** Header serif lead — each element bound to a palette token, independently. */
  headerSerifLeadLabelColor: PortfolioServicesHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioServicesHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioServicesHeaderPaletteToken;
  /** Header serif lead — each element sized/weighted independently. */
  headerSerifLeadLabelSize: PortfolioServicesHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioServicesHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioServicesHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioServicesHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioServicesHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioServicesHeaderTitleWeight;
  /** Header editorial — kicker above the title; empty = "Services". */
  headerEditorialLabelText: string;
  /** Header editorial — the big title; empty = the section title. */
  headerEditorialTitleText: string;
  /** Header editorial — the line under the title; empty = the section subtitle. */
  headerEditorialSubtitleText: string;
  /** Header editorial — each text bound to a palette token, independently. */
  headerEditorialLabelColor: PortfolioServicesHeaderPaletteToken;
  headerEditorialTitleColor: PortfolioServicesHeaderPaletteToken;
  headerEditorialSubtitleColor: PortfolioServicesHeaderPaletteToken;
  /** Header editorial — each text sized/weighted independently. */
  headerEditorialLabelSize: PortfolioServicesHeaderTitleSize;
  headerEditorialTitleSize: PortfolioServicesHeaderTitleSize;
  headerEditorialSubtitleSize: PortfolioServicesHeaderTitleSize;
  headerEditorialLabelWeight: PortfolioServicesHeaderTitleWeight;
  headerEditorialTitleWeight: PortfolioServicesHeaderTitleWeight;
  headerEditorialSubtitleWeight: PortfolioServicesHeaderTitleWeight;
  /** Header billboard — big faint background word + a {count}-token line. */
  headerBillboardBigWord: string;
  headerBillboardCountText: string;
  /** Header billboard — the editorial split title beneath the big word, independent of the section title. */
  headerBillboardTitleText: string;
  /** Header billboard — outline (stroke only) or fill (solid) big word. */
  headerBillboardWordStyle: PortfolioServicesHeaderBillboardWordStyle;
  /** Header billboard — each element bound to a palette token, independently. */
  headerBillboardWordColor: PortfolioServicesHeaderPaletteToken;
  headerBillboardTitleColor: PortfolioServicesHeaderPaletteToken;
  headerBillboardMetaColor: PortfolioServicesHeaderPaletteToken;
  /** Header split heading — small label on the side opposite the narrative title. */
  headerSplitHeadingLabelText: string;
  /** Header split heading — the narrative title itself, independent of the section title. */
  headerSplitHeadingTitleText: string;
  /** Header split heading — each element bound to a palette token, independently. */
  headerSplitHeadingTitleColor: PortfolioServicesHeaderPaletteToken;
  headerSplitHeadingLabelColor: PortfolioServicesHeaderPaletteToken;
  /** Header split heading — each element sized/weighted independently. */
  headerSplitHeadingTitleSize: PortfolioServicesHeaderTitleSize;
  headerSplitHeadingTitleWeight: PortfolioServicesHeaderTitleWeight;
  headerSplitHeadingLabelSize: PortfolioServicesHeaderTitleSize;
  headerSplitHeadingLabelWeight: PortfolioServicesHeaderTitleWeight;
  /** Header masthead — up to 3 independent lines, monumental headline text,
   *  each stacked into the mast (no more period-splitting a single string). */
  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  /** Header masthead — one color for the whole headline, across every line. */
  headerMastheadHeadlineColor: PortfolioServicesHeaderPaletteToken;
  /** Header masthead — one size/weight for the whole headline, across every line. */
  headerMastheadHeadlineSize: PortfolioServicesHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioServicesHeaderTitleWeight;
  /** Header index — small label on the top divider rule (e.g. "Index", "Catalog"). */
  headerIndexLabelText: string;
  /** Header index — the title beside the counting numeral, independent of the section title. */
  headerIndexTitleText: string;
  /** Header index — caption under the counter (e.g. "Services"). Empty falls back to automatic pluralization. */
  headerIndexCountLabelText: string;
  /** Header index — the small subtitle under the title, independent of the section subtitle. */
  headerIndexSubtitleText: string;
  /** Header index — each element bound to a palette token, independently. */
  headerIndexLabelColor: PortfolioServicesHeaderPaletteToken;
  headerIndexNumberColor: PortfolioServicesHeaderPaletteToken;
  headerIndexTitleColor: PortfolioServicesHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioServicesHeaderPaletteToken;
  /** Header index — each element sized/weighted independently. */
  headerIndexLabelSize: PortfolioServicesHeaderTitleSize;
  headerIndexLabelWeight: PortfolioServicesHeaderTitleWeight;
  headerIndexTitleSize: PortfolioServicesHeaderTitleSize;
  headerIndexTitleWeight: PortfolioServicesHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioServicesHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioServicesHeaderTitleWeight;
  /** Header marquee — up to 4 independent words in the repeating band, each its own field (empty slots are dropped). */
  headerMarqueeWord1Text: string;
  headerMarqueeWord2Text: string;
  headerMarqueeWord3Text: string;
  headerMarqueeWord4Text: string;
  /** Header marquee — alternating fill/outline words bound to one palette token. */
  headerMarqueeWordColor: PortfolioServicesHeaderPaletteToken;
  /** Header marquee — scales the repeating word band. */
  headerMarqueeSize: PortfolioServicesHeaderTitleSize;
  sectionOrganization: PortfolioServicesSectionOrganization;
  layoutMode: PortfolioServicesLayoutMode;
  /** Body/content design for the section (Design tab) — see PortfolioServicesSectionDesign. */
  sectionDesign: PortfolioServicesSectionDesign;
  /** Index List design–only options. */
  indexList: PortfolioServicesIndexListSettings;
  /** Media Columns design–only options. */
  mediaColumns: PortfolioServicesMediaColumnsSettings;
  /** Pricing Grid design–only options. */
  pricingGrid: PortfolioServicesPricingGridSettings;
  /** Pricing Bento design–only options. */
  pricingBento: PortfolioServicesPricingBentoSettings;
  /** Pricing Monolith design–only options. */
  servicesPricingMonolith: PortfolioServicesPricingMonolithSettings;
  /** Pricing Aurora design–only options. */
  servicesPricingAurora: PortfolioServicesPricingAuroraSettings;
  /** Pricing Toggle design–only options. */
  pricingToggle: PortfolioServicesPricingToggleSettings;
  /** Card corners / border / order-button options shared by every Pricing design. */
  pricingStyle: PortfolioServicesPricingStyleSettings;
  displayMode: PortfolioServicesDisplayMode;
  /**
   * Entrance motion for Deck diagonal (ignored for other display modes).
   * `none` shows the fan immediately; `expand` plays the scroll reveal.
   */
  deckEntranceEffect: PortfolioServicesDeckEntranceEffect;
  /** Infinite carousel scroll direction — services block. */
  servicesMarqueeDirection: PortfolioServicesMarqueeDirection;
  /** Infinite carousel scroll direction — skills block. */
  skillsMarqueeDirection: PortfolioServicesMarqueeDirection;
  servicesGalleryLayout: PortfolioServicesGalleryLayout;
  skillsGalleryLayout: PortfolioServicesGalleryLayout;
  stackOrder: PortfolioServicesStackOrder;
  cardDesign: PortfolioServicesCardDesign;
  cardDesignIntensities: PortfolioServicesCardDesignIntensities;
  cardDesignTints: PortfolioServicesCardDesignTints;
  stageDesign: PortfolioServicesStageDesign;
  cardAccentColor: string;
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  /** 0–100 opacity for the card outline (soft / solid / accent). */
  cardBorderOpacity: number;
  cardBackgroundEnabled: boolean;
  /**
   * When true, featured cards use principal fill + contrasting ink (static — no hover fill).
   */
  servicesPrincipalSurfaceEnabled: boolean;
  /** Uniform = every card; alternate = every other card (normal / principal). */
  servicesPrincipalSurfaceAlternation: PortfolioServicesCardBackgroundAlternation;
  /** When alternation is on: which fill leads on the first card. */
  servicesPrincipalSurfaceAlternateStart: PortfolioServicesPrincipalSurfaceAlternateStart;
  /**
   * Cover-image layouts (Carte média / Bannière / Checklist): media left or right.
   * With alternation, this is the first card’s side.
   */
  servicesMediaSide: PortfolioServicesMediaSide;
  /** Uniform = every card same side; alternate = flip media ↔ info each card. */
  servicesMediaSideAlternation: PortfolioServicesMediaSideAlternation;
  cardBackgroundColor: string;
  /** Manual dark-mode card fill when palette is off. */
  cardBackgroundColorDark: string;
  /** Manual dark-mode zone B / alternate fill when palette is off. */
  cardBackgroundColorBDark: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
  cardBackgroundAlternation: PortfolioServicesCardBackgroundAlternation;
  /**
   * Text contrast strategy for alternating (or any) card fills.
   * Default `auto` keeps titles/bodies readable without per-card edits.
   */
  cardTextContrast: PortfolioServicesCardTextContrast;
  /** Title ink on light / A cards when `cardTextContrast === 'pair-ab'`. */
  cardInkStrongA: string;
  /** Body ink on light / A cards when `cardTextContrast === 'pair-ab'`. */
  cardInkMutedA: string;
  /** Title ink on alternate / B cards when `cardTextContrast === 'pair-ab'`. */
  cardInkStrongB: string;
  /** Body ink on alternate / B cards when `cardTextContrast === 'pair-ab'`. */
  cardInkMutedB: string;
  stageBackgroundEnabled: boolean;
  stageBackgroundColor: string;
  stageBackgroundOpacity: number;
  stageBorder: PortfolioServicesStageBorder;
  stageBorderColor: string;
  stageBorderRadius: PortfolioServicesStageRadius;
  stagePadding: PortfolioServicesStagePadding;
  stagePattern: PortfolioServicesStagePattern;
  stagePatternColor: string;
  stagePatternOpacity: number;
  stageCorners: PortfolioServicesStageCorners;
  stageMaxWidth: PortfolioServicesCardMaxWidth;
  servicesColumns: PortfolioServicesCardColumns;
  skillsColumns: PortfolioServicesCardColumns;
  /** Max width for vertical cards / coverflow / stack (like Work cardMaxWidth). */
  cardMaxWidth: PortfolioServicesCardMaxWidth;
  /** Frame alignment in the column (left / center / right). */
  cardAlignment: PortfolioServicesCardAlignment;
  servicesContentAlignment: PortfolioServicesContentAlignment;
  skillsContentAlignment: PortfolioServicesContentAlignment;
  /** Vertical spacing between elements inside service cards. */
  servicesContentGap: PortfolioServicesContentGap;
  /** Manual px gap when servicesContentGap is `custom`. */
  servicesContentGapPx: number;
  /** Vertical spacing between elements inside skill cards. */
  skillsContentGap: PortfolioServicesContentGap;
  /** Manual px gap when skillsContentGap is `custom`. */
  skillsContentGapPx: number;
  servicesPricePlacement: PortfolioServicesPricePlacement;
  /** ISO 4217 code — drives the currency symbol next to the price (€, $, £…). */
  servicesCurrency: PortfolioServicesCurrencyCode;
  /** Currency symbol before (`$50`) or after (`50 €`) the amount. */
  serviceCurrencyPlacement: PortfolioServicesCurrencyPlacement;
  /** When true, show a prefix before the amount (e.g. "From"). */
  servicePricePrefixEnabled: boolean;
  /** Custom prefix text; empty while enabled still falls back to "From". */
  servicePricePrefix: string;
  /** Optional suffix after the amount (e.g. "/ mois", "/ first month"). */
  servicePricePeriodSuffix: string;
  /** Horizontal alignment of the price block. */
  servicePriceAlign: PortfolioServicesContentAlignment;
  /** Extra top margin on the price block (0–80px). */
  servicePriceMarginTopPx: number;
  /** Extra bottom margin on the price block (0–80px). */
  servicePriceMarginBottomPx: number;
  /** Commercial list only — 1-based row receiving the merchandising badge; 0 hides it. */
  commercialPopularItemNumber: number;
  /** Commercial list only — text displayed in the merchandising badge. */
  commercialPopularLabel: string;
  /** Commercial list only — vertical space between service rows (0–80px). */
  commercialRowGapPx: number;
  /** Commercial list only — horizontal space between marker, content, price and CTA (12–80px). */
  commercialColumnGapPx: number;
  /** Commercial list only — numbered marker diameter (32–72px). */
  commercialMarkerSizePx: number;
  /** Commercial list only — preferred price-column width (112–260px). */
  commercialPriceWidthPx: number;
  /** Commercial list only — preferred CTA-column width (112–260px). */
  commercialCtaWidthPx: number;
  skillsIconPlacement: PortfolioServicesIconPlacement;
  /** Shape and chrome of the shell behind every skill/tool icon. */
  skillsIconRadius: PortfolioSkillsIconRadius;
  skillsIconBackgroundEnabled: boolean;
  skillsIconBackgroundColor: string;
  skillsIconBackgroundManual: boolean;
  skillsIconBorderEnabled: boolean;
  skillsIconBorderColor: string;
  skillsIconBorderManual: boolean;
  skillsIconBorderWidthPx: number;
  showSkills: boolean;
  showServices: boolean;
  showSkillIcon: boolean;
  showSkillTitle: boolean;
  showSkillDescription: boolean;
  /** Tool-inspector: show mastery level in the detail panel. */
  showSkillLevel: boolean;
  /** Tool-inspector: show practical use-case chips. */
  showSkillUseCases: boolean;
  /** Tool-inspector: show experience years / label in the footer. */
  showSkillExperience: boolean;
  /** Tool-inspector: show "currently used" status in the footer. */
  showSkillCurrentlyUsed: boolean;
  /** Tool-inspector: icon rail on the left, right, or above the detail panel. */
  skillsInspectorRailPlacement: PortfolioSkillsInspectorRailPlacement;
  /** Tool-inspector: show the outer frame around the icon rail. */
  skillsInspectorRailFrameEnabled: boolean;
  /** Tool-inspector: exact space between rail icons. */
  skillsInspectorIconGapPx: number;
  /** Tool-inspector: optional decorative SVG, matching FAQ presets. */
  skillsInspectorIllustrationVariant: PortfolioSkillsInspectorIllustrationVariant;
  skillsInspectorIllustrationPlacement: PortfolioSkillsInspectorIllustrationPlacement;
  /** Services section: optional decorative SVG beside the gallery (FAQ-like presets). */
  servicesIllustrationVariant: PortfolioServicesIllustrationVariant;
  servicesIllustrationPlacement: PortfolioServicesIllustrationPlacement;
  /** Tool-inspector: show footer hint to click icons. */
  skillsInspectorShowHint: boolean;
  /** Show a list marker before each skill icon / title. */
  skillsShowBullet: boolean;
  /** Global vs section override for skill list bullets. */
  skillsBulletSource: PortfolioListMarkerSource;
  skillsBulletStyle: PortfolioServicesTaskBulletStyle;
  skillsBulletColor: string;
  skillsBulletSize: PortfolioListMarkerSize;
  skillsBulletSizePx: number;
  skillsBulletWeight: PortfolioListMarkerWeight;
  skillsBulletWeightAmount: number;
  /**
   * When true, each skill card uses that tool’s brand color as its fill
   * (from the creator tools catalog). Text/icons auto-adapt for contrast.
   */
  skillsCardBrandFill: boolean;
  showServiceTitle: boolean;
  showServiceDescription: boolean;
  showServicePrice: boolean;
  showServiceDelivery: boolean;
  /** Checklist of deliverables / tasks on service cards. */
  showServiceTasks: boolean;
  /** Global vs section override for task list bullets. */
  servicesTaskBulletSource: PortfolioListMarkerSource;
  /** Marker shown before each task line. */
  servicesTaskBulletStyle: PortfolioServicesTaskBulletStyle;
  /** Marker color (synced from palette when useHeroPalette is on). */
  servicesTaskBulletColor: string;
  servicesTaskBulletSize: PortfolioListMarkerSize;
  servicesTaskBulletSizePx: number;
  servicesTaskBulletWeight: PortfolioListMarkerWeight;
  servicesTaskBulletWeightAmount: number;
  /** Order / contact CTA on service cards (same styles as Portfolio View project). */
  showServiceCta: boolean;
  ctaLabel: string;
  ctaDesign: PortfolioServicesCtaDesign;
  /** Show the glyph beside the CTA label. */
  ctaShowIcon: boolean;
  /** Which glyph to render when the icon is on. */
  ctaIcon: PortfolioWorkCtaIcon;
  /** Place the glyph before or after the label. */
  ctaIconPosition: PortfolioWorkCtaIconPosition;
  ctaColor: string;
  ctaBorderColor: string;
  ctaBorderWidth: PortfolioServicesCtaBorderWidth;
  ctaBorderRadius: PortfolioServicesCtaBorderRadius;
  ctaHoverBackgroundColor: string;
  ctaHoverTextColor: string;
  ctaHoverBorderColor: string;
  ctaHoverEnabled: boolean;
  ctaAlignment: PortfolioServicesCtaAlignment;
  showResponseTime: boolean;
  showSkillsSubheading: boolean;
  showServicesSubheading: boolean;
  /** Custom subheading labels (empty = default English labels). */
  skillsSubheadingLabel: string;
  servicesSubheadingLabel: string;
  /** Tool / skill icon size — independent from the card design typography. */
  skillsIconSize: PortfolioToolsIconSize;
  /** When true, section colors follow the Hero semantic palette. */
  useHeroPalette: boolean;
  /**
   * Active Global color mode used when palette is off — picks light vs dark
   * manual colors for card fill + element text.
   */
  activeColorMode?: 'light' | 'dark';
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
  /** Global type-size control — see `PortfolioServicesPremiumFontSize` doc comment. */
  premiumFontSize: PortfolioServicesPremiumFontSize;
  /** Services-owned palette copy (same 8 tokens as Hero). */
  servicesPalette?: PortfolioServicesPalette;
  /** Which token each services color slot uses. */
  servicesColorBindings?: PortfolioServicesColorBindings;
  /** Per-element color, font, size, and weight for card text. */
  elementStyles: PortfolioServicesElementStyles;
  /** Optional surface chrome behind title / description / price / delivery. */
  elementChromes: PortfolioServicesElementChromes;
  skillsBlock: PortfolioServicesBlockSettings;
  servicesBlock: PortfolioServicesBlockSettings;
  /**
   * Bumps when Carte horizontal frame defaults change so saved portfolios
   * migrate once (border-only chrome) without locking later user edits.
   */
  servicesCardChromeVersion?: number;
  /**
   * Per gallery-layout presentation snapshot so switching designs
   * (Carte / Offre·Tarif / Plan / …) restores that design’s own settings
   * instead of forcing one shared config onto every card.
   */
  servicesGalleryLayoutPresets?: Partial<
    Record<PortfolioServicesGalleryLayout, PortfolioServicesGalleryLayoutPreset>
  >;
  skillsHeader: PortfolioServicesDistinctHeaderSettings;
  servicesHeader: PortfolioServicesDistinctHeaderSettings;
};

export type PortfolioServicesSectionSettings = PortfolioSectionCopy & PortfolioServicesPresentationSettings;

export {
  PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS,
  SERVICES_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  SERVICES_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  SERVICES_HEADER_PALETTE_TOKEN_OPTIONS,
  servicesHeaderPaletteTokenColor,
  type PortfolioServicesHeaderAccentCountAlignment,
  type PortfolioServicesHeaderBillboardWordStyle,
  type PortfolioServicesHeaderDesign,
  type PortfolioServicesHeaderDesignAlignment,
  type PortfolioServicesHeaderMarginBottom,
  type PortfolioServicesHeaderPaletteToken,
  type PortfolioServicesHeaderTitleSize,
  type PortfolioServicesHeaderTitleWeight,
} from '@/components/portfolio/portfolio-services-header-settings';

const DEFAULT_SERVICES_TITLE_COLOR = '#0a0a0a';
const DEFAULT_SERVICES_SUBTITLE_COLOR = '#737373';
const DEFAULT_SERVICES_ACCENT_COLOR = '#f97316';
const DEFAULT_SERVICES_CARD_BORDER_COLOR = '#e5e5e5';
const DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR = '#fafafa';
const DEFAULT_SERVICES_STAGE_BORDER_COLOR = '#e5e5e5';
const DEFAULT_SERVICES_STAGE_PATTERN_COLOR = '#a3a3a3';

/** Defaults matching the previous hardcoded framed stage shell. */
const DEFAULT_SERVICES_STAGE_CHROME: PortfolioServicesStageChromeSettings = {
  stageBackgroundEnabled: false,
  stageBackgroundColor: DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR,
  stageBackgroundOpacity: 80,
  stageBorder: 'soft',
  stageBorderColor: DEFAULT_SERVICES_STAGE_BORDER_COLOR,
  stageBorderRadius: 'xl',
  stagePadding: 'md',
  stagePattern: 'none',
  stagePatternColor: DEFAULT_SERVICES_STAGE_PATTERN_COLOR,
  stagePatternOpacity: 18,
  stageCorners: 'none',
  stageMaxWidth: 'full',
};
const DEFAULT_SERVICES_CARD_BACKGROUND_COLOR = '#ffffff';
const DEFAULT_SERVICES_BODY_COLOR = '#737373';
const DEFAULT_SERVICES_SUBHEADING_COLOR = '#a3a3a3';

/** Defaults tuned to match the current editorial card look (title/body/price/delivery). */
const DEFAULT_SERVICES_ELEMENT_STYLES: PortfolioServicesElementStyles = {
  blockSubheading: createElementTextStyle({
    color: DEFAULT_SERVICES_SUBHEADING_COLOR,
    colorDark: '#a3a3a3',
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  cardTitle: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    colorDark: '#f4f4f5',
    size: 'sm',
    bold: true,
  }),
  cardBody: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    colorDark: '#a3a3a3',
    size: 'md',
  }),
  price: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    colorDark: '#f4f4f5',
    size: 'sm',
    bold: true,
  }),
  delivery: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    colorDark: '#a3a3a3',
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
  tasks: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    colorDark: '#a3a3a3',
    size: 'md',
  }),
  skillTitle: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    colorDark: '#f4f4f5',
    size: 'sm',
    bold: true,
  }),
  skillBody: createElementTextStyle({
    color: DEFAULT_SERVICES_BODY_COLOR,
    colorDark: '#a3a3a3',
    size: 'md',
  }),
  cta: createElementTextStyle({
    color: DEFAULT_SERVICES_TITLE_COLOR,
    colorDark: '#f4f4f5',
    size: 'sm',
    bold: true,
    uppercase: true,
  }),
};

const SERVICES_STYLE_TARGET_IDS: PortfolioServicesStyleTarget[] = [
  'blockSubheading',
  'cardTitle',
  'cardBody',
  'price',
  'delivery',
  'tasks',
  'skillTitle',
  'skillBody',
  'cta',
];

function isPortfolioServicesTaskBulletStyle(
  value: unknown
): value is PortfolioServicesTaskBulletStyle {
  return isPortfolioListMarkerStyle(value);
}

function normalizeServicesElementStyles(raw: unknown): PortfolioServicesElementStyles {
  return normalizeElementStylesRecord(raw, DEFAULT_SERVICES_ELEMENT_STYLES, SERVICES_STYLE_TARGET_IDS);
}

function mergeServicesElementChrome(
  base: PortfolioServicesElementChromeSettings,
  patch: unknown
): PortfolioServicesElementChromeSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  return {
    enabled: typeof record.enabled === 'boolean' ? record.enabled : base.enabled,
    backgroundEnabled:
      typeof record.backgroundEnabled === 'boolean' ? record.backgroundEnabled : base.backgroundEnabled,
    backgroundColor: sanitizeHex(record.backgroundColor, base.backgroundColor),
    border:
      record.border === 'none' ||
      record.border === 'soft' ||
      record.border === 'solid' ||
      record.border === 'accent'
        ? record.border
        : base.border,
    borderColor: sanitizeHex(record.borderColor, base.borderColor),
    borderRadius:
      record.borderRadius === 'none' ||
      record.borderRadius === 'sm' ||
      record.borderRadius === 'md' ||
      record.borderRadius === 'lg' ||
      record.borderRadius === 'xl'
        ? record.borderRadius
        : base.borderRadius,
    padding:
      record.padding === 'none' ||
      record.padding === 'sm' ||
      record.padding === 'md' ||
      record.padding === 'lg'
        ? record.padding
        : base.padding,
    margin:
      record.margin === 'none' ||
      record.margin === 'sm' ||
      record.margin === 'md' ||
      record.margin === 'lg'
        ? record.margin
        : base.margin,
  };
}

function mergeServicesElementChromes(
  base: PortfolioServicesElementChromes,
  patch: unknown
): PortfolioServicesElementChromes {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return {
      cardTitle: { ...base.cardTitle },
      cardBody: { ...base.cardBody },
      skillTitle: { ...base.skillTitle },
      skillBody: { ...base.skillBody },
      price: { ...base.price },
      delivery: { ...base.delivery },
      tasks: { ...base.tasks },
    };
  }
  const record = patch as Record<string, unknown>;
  return {
    cardTitle: mergeServicesElementChrome(base.cardTitle, record.cardTitle),
    cardBody: mergeServicesElementChrome(base.cardBody, record.cardBody),
    skillTitle: mergeServicesElementChrome(base.skillTitle, record.skillTitle),
    skillBody: mergeServicesElementChrome(base.skillBody, record.skillBody),
    price: mergeServicesElementChrome(base.price, record.price),
    delivery: mergeServicesElementChrome(base.delivery, record.delivery),
    tasks: mergeServicesElementChrome(base.tasks, record.tasks),
  };
}

const DEFAULT_SERVICES_CARD_INK_STRONG_A = '#15151a';
const DEFAULT_SERVICES_CARD_INK_MUTED_A = '#65656d';
const DEFAULT_SERVICES_CARD_INK_STRONG_B = '#f4f3ef';
const DEFAULT_SERVICES_CARD_INK_MUTED_B = '#e8ddd2';

function pickServicesCardTextContrast(
  value: unknown,
  fallback: PortfolioServicesCardTextContrast = 'auto'
): PortfolioServicesCardTextContrast {
  return value === 'pair-ab' || value === 'auto' ? value : fallback;
}

const DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES: PortfolioServicesCardDesignIntensities = {
  editorial: 65,
  minimal: 55,
  compact: 60,
  glass: 70,
  frost: 70,
  accent: 65,
};

const DEFAULT_SERVICES_CARD_DESIGN_TINTS: PortfolioServicesCardDesignTints = {
  editorial: 100,
  minimal: 0,
  compact: 0,
  glass: 75,
  frost: 0,
  accent: 80,
};

function createDefaultServicesBlockSettings(
  kind: PortfolioServicesBlockScope,
  source: Pick<
    PortfolioServicesPresentationSettings,
    | 'skillsGalleryLayout'
    | 'servicesGalleryLayout'
    | 'skillsColumns'
    | 'servicesColumns'
    | 'displayMode'
    | 'skillsContentAlignment'
    | 'servicesContentAlignment'
    | 'servicesPricePlacement'
    | 'skillsIconPlacement'
    | 'cardDesign'
    | 'cardDesignIntensities'
    | 'cardDesignTints'
    | 'cardAccentColor'
    | 'stageDesign'
    | 'stageBackgroundEnabled'
    | 'stageBackgroundColor'
    | 'stageBackgroundOpacity'
    | 'stageBorder'
    | 'stageBorderColor'
    | 'stageBorderRadius'
    | 'stagePadding'
    | 'stagePattern'
    | 'stagePatternColor'
    | 'stagePatternOpacity'
    | 'stageCorners'
    | 'stageMaxWidth'
    | 'cardBorder'
    | 'cardBorderColor'
    | 'cardBorderOpacity'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundColor'
    | 'cardBackgroundColorDark'
    | 'cardBackgroundColorBDark'
    | 'cardBorderRadius'
    | 'cardPadding'
    | 'cardBackgroundAlternation'
    | 'cardDecorEnabled'
    | 'cardDecorShape'
    | 'cardDecorColor'
    | 'cardDecorOpacity'
    | 'cardDecorSize'
    | 'cardDecorX'
    | 'cardDecorY'
    | 'cardDecorRotation'
    | 'cardDecorAlternation'
  > &
    PortfolioServicesCardBackgroundSettings &
    PortfolioServicesCardDecorSettings
): PortfolioServicesBlockSettings {
  return {
    ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
    ...DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
    cardBackgroundFill: source.cardBackgroundFill,
    cardBackgroundColorA: source.cardBackgroundColorA,
    cardBackgroundColorB: source.cardBackgroundColorB,
    cardBackgroundSplitAxis: source.cardBackgroundSplitAxis,
    cardBackgroundSplitPosition: source.cardBackgroundSplitPosition,
    cardDividerEnabled: source.cardDividerEnabled,
    cardDividerShape: source.cardDividerShape,
    cardDividerAngle: source.cardDividerAngle,
    cardDividerCurveDepth: source.cardDividerCurveDepth,
    cardDividerColor: source.cardDividerColor,
    cardDividerThickness: source.cardDividerThickness,
    cardDividerOpacity: source.cardDividerOpacity,
    cardDecorEnabled: source.cardDecorEnabled,
    cardDecorShape: source.cardDecorShape,
    cardDecorColor: source.cardDecorColor,
    cardDecorOpacity: source.cardDecorOpacity,
    cardDecorSize: source.cardDecorSize,
    cardDecorX: source.cardDecorX,
    cardDecorY: source.cardDecorY,
    cardDecorRotation: source.cardDecorRotation,
    cardDecorAlternation: source.cardDecorAlternation,
    galleryLayout: kind === 'skills' ? source.skillsGalleryLayout : source.servicesGalleryLayout,
    columns: kind === 'skills' ? source.skillsColumns : source.servicesColumns,
    displayMode: source.displayMode,
    contentAlignment:
      kind === 'skills' ? source.skillsContentAlignment : source.servicesContentAlignment,
    pricePlacement: source.servicesPricePlacement,
    iconPlacement: source.skillsIconPlacement,
    cardDesign: source.cardDesign,
    cardDesignIntensities: { ...source.cardDesignIntensities },
    cardDesignTints: { ...source.cardDesignTints },
    cardAccentColor: source.cardAccentColor,
    stageDesign: source.stageDesign,
    stageBackgroundEnabled: source.stageBackgroundEnabled,
    stageBackgroundColor: source.stageBackgroundColor,
    stageBackgroundOpacity: source.stageBackgroundOpacity,
    stageBorder: source.stageBorder,
    stageBorderColor: source.stageBorderColor,
    stageBorderRadius: source.stageBorderRadius,
    stagePadding: source.stagePadding,
    stagePattern: source.stagePattern,
    stagePatternColor: source.stagePatternColor,
    stagePatternOpacity: source.stagePatternOpacity,
    stageCorners: source.stageCorners ?? 'none',
    stageMaxWidth: source.stageMaxWidth ?? 'full',
    cardBorder: source.cardBorder,
    cardBorderColor: source.cardBorderColor,
    cardBorderOpacity: source.cardBorderOpacity,
    cardBackgroundEnabled: source.cardBackgroundEnabled,
    cardBackgroundColor: source.cardBackgroundColor,
    cardBackgroundColorDark: source.cardBackgroundColorDark,
    cardBackgroundColorBDark: source.cardBackgroundColorBDark,
    cardBorderRadius: source.cardBorderRadius,
    cardPadding: source.cardPadding,
    cardBackgroundAlternation: source.cardBackgroundAlternation,
  };
}

function createDefaultDistinctHeaderSettings(
  kind: PortfolioServicesBlockScope
): PortfolioServicesDistinctHeaderSettings {
  return {
    titlePreset: kind === 'skills' ? 'services-skills' : 'what-i-offer',
    titleCustom: '',
    subtitlePreset: kind === 'skills' ? 'craft' : 'collaboration',
    subtitleCustom: '',
    titleFont: 'sans',
    subtitleFont: 'sans',
    titleColor: DEFAULT_SERVICES_TITLE_COLOR,
    subtitleColor: DEFAULT_SERVICES_SUBTITLE_COLOR,
    headerAlignment: 'left',
    sectionLayout: 'stacked',
  };
}

const DEFAULT_SERVICES_PRESENTATION_BASE = {
  ...DEFAULT_SECTION_BACKGROUND,
  ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  ...DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
  titlePreset: 'services-skills' as const,
  titleCustom: '',
  subtitlePreset: 'default' as const,
  subtitleCustom: '',
  titleFont: 'sans' as const,
  subtitleFont: 'sans' as const,
  titleColor: DEFAULT_SERVICES_TITLE_COLOR,
  subtitleColor: DEFAULT_SERVICES_SUBTITLE_COLOR,
  headerAlignment: 'left' as const,
  headerDesign: 'editorial' as const,
  headerAnimationEnabled: true as const,
  headerDesignAlignment: 'left' as const,
  headerMarginBottom: 'md' as const,
  headerTitleSize: 'md' as const,
  headerTitleWeight: 'regular' as const,
  headerAccentCountBadgeText: '' as const,
  headerAccentCountLeadText: '' as const,
  headerAccentCountBadgeColor: 'principal' as const,
  headerAccentCountLeadColor: 'secondaire' as const,
  headerAccentCountSize: 'md' as const,
  headerAccentCountWeight: 'regular' as const,
  headerAccentCountAlignment: 'left' as const,
  headerSerifLeadLabelText: '' as const,
  headerSerifLeadTitleText: '' as const,
  headerSerifLeadSubtitleText: '' as const,
  headerSerifLeadLabelColor: 'texteFort' as const,
  headerSerifLeadTitleColor: 'texteFort' as const,
  headerSerifLeadSubtitleColor: 'texteFort' as const,
  headerSerifLeadLabelSize: 'md' as const,
  headerSerifLeadTitleSize: 'md' as const,
  headerSerifLeadSubtitleSize: 'md' as const,
  headerSerifLeadLabelWeight: 'regular' as const,
  headerSerifLeadTitleWeight: 'regular' as const,
  headerSerifLeadSubtitleWeight: 'regular' as const,
  headerEditorialLabelText: '' as const,
  headerEditorialTitleText: '' as const,
  headerEditorialSubtitleText: '' as const,
  headerEditorialLabelColor: 'texteFort' as const,
  headerEditorialTitleColor: 'texteFort' as const,
  headerEditorialSubtitleColor: 'texteFort' as const,
  headerEditorialLabelSize: 'md' as const,
  headerEditorialTitleSize: 'md' as const,
  headerEditorialSubtitleSize: 'md' as const,
  headerEditorialLabelWeight: 'regular' as const,
  headerEditorialTitleWeight: 'regular' as const,
  headerEditorialSubtitleWeight: 'regular' as const,
  headerBillboardBigWord: '' as const,
  headerBillboardCountText: '' as const,
  headerBillboardTitleText: '' as const,
  headerBillboardWordStyle: 'outline' as const,
  headerBillboardWordColor: 'principal' as const,
  headerBillboardTitleColor: 'principal' as const,
  headerBillboardMetaColor: 'secondaire' as const,
  headerSplitHeadingLabelText: '' as const,
  headerSplitHeadingTitleText: '' as const,
  headerSplitHeadingTitleColor: 'principal' as const,
  headerSplitHeadingLabelColor: 'secondaire' as const,
  headerSplitHeadingTitleSize: 'md' as const,
  headerSplitHeadingTitleWeight: 'regular' as const,
  headerSplitHeadingLabelSize: 'md' as const,
  headerSplitHeadingLabelWeight: 'regular' as const,
  headerMastheadLine1Text: '' as const,
  headerMastheadLine2Text: '' as const,
  headerMastheadLine3Text: '' as const,
  headerMastheadHeadlineColor: 'principal' as const,
  headerMastheadHeadlineSize: 'md' as const,
  headerMastheadHeadlineWeight: 'regular' as const,
  headerIndexLabelText: '' as const,
  headerIndexTitleText: '' as const,
  headerIndexCountLabelText: '' as const,
  headerIndexSubtitleText: '' as const,
  headerIndexLabelColor: 'texteFort' as const,
  headerIndexNumberColor: 'principal' as const,
  headerIndexTitleColor: 'texteFort' as const,
  headerIndexSubtitleColor: 'texteFort' as const,
  headerIndexLabelSize: 'md' as const,
  headerIndexLabelWeight: 'regular' as const,
  headerIndexTitleSize: 'md' as const,
  headerIndexTitleWeight: 'regular' as const,
  headerIndexSubtitleSize: 'md' as const,
  headerIndexSubtitleWeight: 'regular' as const,
  headerMarqueeWord1Text: '' as const,
  headerMarqueeWord2Text: '' as const,
  headerMarqueeWord3Text: '' as const,
  headerMarqueeWord4Text: '' as const,
  headerMarqueeWordColor: 'principal' as const,
  headerMarqueeSize: 'md' as const,
  sectionOrganization: 'distinct' as const,
  layoutMode: 'separated' as const,
  sectionDesign: 'showcase-hero' as const,
  indexList: { ...DEFAULT_SERVICES_INDEX_LIST_SETTINGS },
  mediaColumns: { ...DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS },
  pricingGrid: { ...DEFAULT_SERVICES_PRICING_GRID_SETTINGS },
  pricingBento: { ...DEFAULT_SERVICES_PRICING_BENTO_SETTINGS },
  servicesPricingMonolith: { ...DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS },
  servicesPricingAurora: { ...DEFAULT_SERVICES_PRICING_AURORA_SETTINGS },
  pricingToggle: { ...DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS },
  pricingStyle: { ...DEFAULT_SERVICES_PRICING_STYLE_SETTINGS },
  displayMode: 'grid' as const,
  deckEntranceEffect: 'expand' as const,
  servicesMarqueeDirection: 'left' as const,
  skillsMarqueeDirection: 'left' as const,
  servicesGalleryLayout: 'card' as const,
  skillsGalleryLayout: 'card' as const,
  stackOrder: 'skills-first' as const,
  cardDesign: 'editorial' as const,
  cardDesignIntensities: { ...DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES },
  cardDesignTints: { ...DEFAULT_SERVICES_CARD_DESIGN_TINTS },
  stageDesign: 'framed' as const,
  ...DEFAULT_SERVICES_STAGE_CHROME,
  cardAccentColor: DEFAULT_SERVICES_ACCENT_COLOR,
  cardBorder: 'soft' as const,
  cardBorderColor: DEFAULT_SERVICES_CARD_BORDER_COLOR,
  cardBorderOpacity: 100,
  cardBackgroundEnabled: false,
  servicesPrincipalSurfaceEnabled: false,
  servicesPrincipalSurfaceAlternation: 'uniform' as const,
  servicesPrincipalSurfaceAlternateStart: 'principal' as const,
  servicesMediaSide: 'media-left' as const,
  servicesMediaSideAlternation: 'alternate' as const,
  cardBackgroundColor: DEFAULT_SERVICES_CARD_BACKGROUND_COLOR,
  cardBackgroundColorDark: '#171717',
  cardBackgroundColorBDark: '#262626',
  cardBorderRadius: 'lg' as const,
  cardPadding: 'md' as const,
  cardBackgroundAlternation: 'uniform' as const,
  cardTextContrast: 'auto' as const,
  cardInkStrongA: DEFAULT_SERVICES_CARD_INK_STRONG_A,
  cardInkMutedA: DEFAULT_SERVICES_CARD_INK_MUTED_A,
  cardInkStrongB: DEFAULT_SERVICES_CARD_INK_STRONG_B,
  cardInkMutedB: DEFAULT_SERVICES_CARD_INK_MUTED_B,
  servicesColumns: 3 as const,
  skillsColumns: 3 as const,
  cardMaxWidth: 'full' as const,
  cardAlignment: 'center' as const,
  servicesContentAlignment: 'left' as const,
  skillsContentAlignment: 'left' as const,
  servicesContentGap: 'md' as const,
  servicesContentGapPx: 14,
  skillsContentGap: 'md' as const,
  skillsContentGapPx: 14,
  servicesPricePlacement: 'end' as const,
  servicesCurrency: 'EUR',
  serviceCurrencyPlacement: 'after' as const,
  servicePricePrefixEnabled: false,
  servicePricePrefix: 'From',
  servicePricePeriodSuffix: '',
  servicePriceAlign: 'left' as const,
  servicePriceMarginTopPx: 0,
  servicePriceMarginBottomPx: 0,
  commercialPopularItemNumber: 2,
  commercialPopularLabel: 'Popular',
  commercialRowGapPx: 20,
  commercialColumnGapPx: 48,
  commercialMarkerSizePx: 48,
  commercialPriceWidthPx: 200,
  commercialCtaWidthPx: 210,
  skillsIconPlacement: 'start' as const,
  skillsIconRadius: 'full' as const,
  skillsIconBackgroundEnabled: true,
  skillsIconBackgroundColor: DEFAULT_SERVICES_CARD_BACKGROUND_COLOR,
  skillsIconBackgroundManual: false,
  skillsIconBorderEnabled: true,
  skillsIconBorderColor: DEFAULT_SERVICES_CARD_BORDER_COLOR,
  skillsIconBorderManual: false,
  skillsIconBorderWidthPx: 1,
  showSkills: false,
  showServices: true,
  showSkillIcon: true,
  showSkillTitle: true,
  showSkillDescription: true,
  showSkillLevel: true,
  showSkillUseCases: true,
  showSkillExperience: true,
  showSkillCurrentlyUsed: false,
  skillsInspectorRailPlacement: 'left' as const,
  skillsInspectorRailFrameEnabled: true,
  skillsInspectorIconGapPx: 12,
  skillsInspectorIllustrationVariant: 'none' as const,
  skillsInspectorIllustrationPlacement: 'right' as const,
  servicesIllustrationVariant: 'none' as const,
  servicesIllustrationPlacement: 'right' as const,
  skillsInspectorShowHint: false,
  skillsShowBullet: false,
  skillsBulletSource: 'section' as const,
  skillsBulletStyle: 'disc' as const,
  skillsBulletColor: DEFAULT_SERVICES_TASK_BULLET_COLOR,
  skillsBulletSize: 'md' as const,
  skillsBulletSizePx: LIST_MARKER_SIZE_PRESET_PX.md,
  skillsBulletWeight: 'regular' as const,
  skillsBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
  skillsCardBrandFill: false,
  showServiceTitle: true,
  showServiceDescription: true,
  showServicePrice: true,
  showServiceDelivery: true,
  showServiceTasks: true,
  servicesTaskBulletSource: 'section' as const,
  servicesTaskBulletStyle: 'check' as const,
  servicesTaskBulletColor: DEFAULT_SERVICES_TASK_BULLET_COLOR,
  servicesTaskBulletSize: 'md' as const,
  servicesTaskBulletSizePx: LIST_MARKER_SIZE_PRESET_PX.md,
  servicesTaskBulletWeight: 'regular' as const,
  servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
  showServiceCta: true,
  ctaLabel: 'Get started',
  ctaDesign: 'pill-accent' as const,
  ctaShowIcon: true,
  ctaIcon: 'arrow-up-right' as const,
  ctaIconPosition: 'right' as const,
  ctaColor: DEFAULT_SERVICES_ACCENT_COLOR,
  ctaBorderColor: DEFAULT_SERVICES_CARD_BORDER_COLOR,
  ctaBorderWidth: 'thin' as const,
  ctaBorderRadius: 'full' as const,
  ctaHoverBackgroundColor: DEFAULT_SERVICES_ACCENT_COLOR,
  ctaHoverTextColor: '#0b0b0d',
  ctaHoverBorderColor: DEFAULT_SERVICES_ACCENT_COLOR,
  ctaHoverEnabled: true,
  ctaAlignment: 'left' as const,
  showResponseTime: false,
  showSkillsSubheading: true,
  showServicesSubheading: true,
  skillsSubheadingLabel: '',
  servicesSubheadingLabel: '',
  skillsIconSize: 'md' as const,
};

export const DEFAULT_SERVICES_PRESENTATION: PortfolioServicesPresentationSettings = {
  ...DEFAULT_SERVICES_PRESENTATION_BASE,
  skillsBlock: createDefaultServicesBlockSettings('skills', {
    ...DEFAULT_SERVICES_PRESENTATION_BASE,
    ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  }),
  servicesBlock: createDefaultServicesBlockSettings('services', {
    ...DEFAULT_SERVICES_PRESENTATION_BASE,
    ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  }),
  skillsHeader: createDefaultDistinctHeaderSettings('skills'),
  servicesHeader: createDefaultDistinctHeaderSettings('services'),
  useHeroPalette: true,
  colorModeOverride: 'auto',
  premiumFontSize: 'medium',
  servicesPalette: { ...DEFAULT_SERVICES_PALETTE },
  servicesColorBindings: { ...DEFAULT_SERVICES_COLOR_BINDINGS },
  elementStyles: DEFAULT_SERVICES_ELEMENT_STYLES,
  elementChromes: DEFAULT_SERVICES_ELEMENT_CHROMES,
  servicesCardChromeVersion: 15,
  servicesGalleryLayoutPresets: {},
};

// Sync hex fields from the default palette without circular init.
Object.assign(
  DEFAULT_SERVICES_PRESENTATION,
  applyServicesPaletteToSettings(DEFAULT_SERVICES_PRESENTATION)
);

export const PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Services', description: 'Displayed title: SERVICES' },
  { value: 'what-i-offer', label: 'What I offer', description: 'Displayed title: WHAT I OFFER' },
  { value: 'expertise', label: 'Expertise', description: 'Displayed title: EXPERTISE' },
  { value: 'custom', label: 'Custom', description: 'Write the main title yourself.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'collaboration', label: 'Collaboration', description: 'A client-focused subtitle.' },
  { value: 'short', label: 'Short', description: 'One short line under the title.' },
  { value: 'minimal', label: 'None', description: 'Hide the section subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write the subtitle yourself.' },
];

const SKILLS_INSPECTOR_ICON_GAP_PX_MIN = 0;
const SKILLS_INSPECTOR_ICON_GAP_PX_MAX = 40;

function clampSkillsInspectorIconGapPx(value: unknown, fallback = 12): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(
    SKILLS_INSPECTOR_ICON_GAP_PX_MIN,
    Math.min(SKILLS_INSPECTOR_ICON_GAP_PX_MAX, Math.round(parsed))
  );
}

/**
 * Services order / GET CTA destination:
 * Contact section → direct phone → footer.
 */
export function resolveServicesOrderCtaHref(opts: {
  contactSectionVisible?: boolean;
  phone?: string | null;
  /** When contact is visible (e.g. pages mode `#contact` page id). */
  contactHref?: string;
}): string {
  if (opts.contactSectionVisible) return opts.contactHref?.trim() || '#contact';
  const phone = opts.phone?.trim();
  if (phone) return `tel:${phone.replace(/\s+/g, '')}`;
  return '#footer';
}

const SERVICES_CONTENT_GAP_PX_MIN = 0;
const SERVICES_CONTENT_GAP_PX_MAX = 48;

function clampServicesContentGapPx(value: unknown, fallback = 14): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    SERVICES_CONTENT_GAP_PX_MIN,
    Math.min(SERVICES_CONTENT_GAP_PX_MAX, Math.round(n))
  );
}

const SERVICE_PRICE_MARGIN_PX_MIN = 0;
const SERVICE_PRICE_MARGIN_PX_MAX = 80;

function clampServicePriceMarginPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    SERVICE_PRICE_MARGIN_PX_MIN,
    Math.min(SERVICE_PRICE_MARGIN_PX_MAX, Math.round(n))
  );
}

function clampCommercialLayoutPx(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function sanitizeServicesCurrencyCode(value: unknown, fallback = 'EUR'): string {
  if (typeof value !== 'string') return fallback;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(code)) return fallback;
  try {
    new Intl.NumberFormat('en', { style: 'currency', currency: code }).format(0);
    return code;
  } catch {
    return fallback;
  }
}

const SKILLS_ICON_BORDER_WIDTH_PX_MIN = 0;
const SKILLS_ICON_BORDER_WIDTH_PX_MAX = 8;

function clampSkillsIconBorderWidthPx(value: unknown, fallback = 1): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(
    SKILLS_ICON_BORDER_WIDTH_PX_MAX,
    Math.max(SKILLS_ICON_BORDER_WIDTH_PX_MIN, Math.round(parsed))
  );
}

const SUBTITLE_PRESET_COPY: Record<
  Exclude<PortfolioServicesSubtitlePreset, 'default' | 'custom' | 'minimal'>,
  string
> = {
  short: 'Tools, services, and how I can help on your next project.',
  collaboration: 'Tailored support from brief to delivery — built around your goals.',
  craft: 'Hands-on expertise across tools and services you can rely on.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

const PORTFOLIO_SERVICES_CARD_DESIGNS: PortfolioServicesCardDesign[] = [
  'editorial',
  'minimal',
  'compact',
  'glass',
  'frost',
  'accent',
];

function clampCardDesignIntensity(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function mergeCardDesignIntensities(
  base: PortfolioServicesCardDesignIntensities,
  patch: unknown
): PortfolioServicesCardDesignIntensities {
  if (!patch || typeof patch !== 'object') return { ...DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES, ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES, ...base };
  for (const design of PORTFOLIO_SERVICES_CARD_DESIGNS) {
    if (record[design] !== undefined) {
      next[design] = clampCardDesignIntensity(record[design], base[design] ?? DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design]);
    }
  }
  return next;
}

function mergeCardDesignTints(
  base: PortfolioServicesCardDesignTints,
  patch: unknown
): PortfolioServicesCardDesignTints {
  if (!patch || typeof patch !== 'object') return { ...DEFAULT_SERVICES_CARD_DESIGN_TINTS, ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...DEFAULT_SERVICES_CARD_DESIGN_TINTS, ...base };
  for (const design of PORTFOLIO_SERVICES_CARD_DESIGNS) {
    if (record[design] !== undefined) {
      next[design] = clampCardDesignIntensity(record[design], base[design] ?? DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]);
    }
  }
  return next;
}

export function resolveServicesSectionTitle(
  settings: Pick<PortfolioServicesSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  const raw = (() => {
    switch (settings.titlePreset) {
      case 'expertise':
        return 'EXPERTISE';
      case 'what-i-offer':
        return 'WHAT I OFFER';
      case 'skills-services':
        return 'SKILLS & SERVICES';
      case 'custom':
        return settings.titleCustom.trim() || settings.title.trim() || 'SERVICES & SKILLS';
      default:
        return 'SERVICES & SKILLS';
    }
  })();
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveServicesSectionSubtitle(
  settings: Pick<PortfolioServicesSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'collaboration':
      return SUBTITLE_PRESET_COPY.collaboration;
    case 'craft':
      return SUBTITLE_PRESET_COPY.craft;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function servicesTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_SERVICES_TITLE_COLOR) };
}

export function servicesSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_SERVICES_SUBTITLE_COLOR) };
}

function mergeServicesStageChrome(
  base: PortfolioServicesStageChromeSettings,
  record: Record<string, unknown>
): PortfolioServicesStageChromeSettings {
  const pickStage = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  return {
    stageBackgroundEnabled:
      typeof record.stageBackgroundEnabled === 'boolean'
        ? record.stageBackgroundEnabled
        : base.stageBackgroundEnabled,
    stageBackgroundColor: sanitizeHex(record.stageBackgroundColor, base.stageBackgroundColor),
    stageBackgroundOpacity: clampCardDesignIntensity(
      record.stageBackgroundOpacity,
      base.stageBackgroundOpacity
    ),
    stageBorder: pickStage(record.stageBorder, ['none', 'soft', 'solid'] as const, base.stageBorder),
    stageBorderColor: sanitizeHex(record.stageBorderColor, base.stageBorderColor),
    stageBorderRadius: pickStage(
      record.stageBorderRadius,
      ['none', 'sm', 'md', 'lg', 'xl'] as const,
      base.stageBorderRadius
    ),
    stagePadding: pickStage(
      record.stagePadding,
      ['none', 'sm', 'md', 'lg'] as const,
      base.stagePadding
    ),
    stagePattern: pickStage(
      record.stagePattern,
      ['none', 'dots', 'grid', 'diagonal'] as const,
      base.stagePattern
    ),
    stagePatternColor: sanitizeHex(record.stagePatternColor, base.stagePatternColor),
    stagePatternOpacity: clampCardDesignIntensity(
      record.stagePatternOpacity,
      base.stagePatternOpacity
    ),
    stageCorners: pickStage(
      record.stageCorners,
      ['none', 'diagonal', 'all'] as const,
      base.stageCorners ?? 'none'
    ),
    stageMaxWidth: pickStage(
      record.stageMaxWidth,
      ['full', 'xl', 'lg', 'md', 'sm'] as const,
      base.stageMaxWidth ?? 'full'
    ),
  };
}

export function servicesCardRadiusClass(radius: PortfolioServicesCardRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl';
    case 'md':
      return 'rounded-2xl';
    case 'xl':
      return 'rounded-[2.25rem]';
    default:
      return 'rounded-[1.5rem]';
  }
}

export function servicesCardPaddingClass(padding: PortfolioServicesCardPadding): string {
  switch (padding) {
    case 'none':
      return 'p-0';
    case 'sm':
      return 'p-3 sm:p-3.5';
    case 'lg':
      return 'p-6 sm:p-7';
    default:
      return 'p-4 sm:p-5';
  }
}

/** Merges design-specific surface (accent bar, glass blur) with user frame overrides. */
/**
 * Relative luminance 0–1 for Services card contrast (same curve as Work / FAQ).
 */
export function servicesColorLuminance(hex: string): number {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.5;
  const channel = (start: number) => {
    const c = parseInt(full.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

function pickServicesContentGap(
  value: unknown,
  fallback: PortfolioServicesContentGap = 'md'
): PortfolioServicesContentGap {
  return value === 'none' ||
    value === 'sm' ||
    value === 'md' ||
    value === 'lg' ||
    value === 'xl' ||
    value === 'custom'
    ? value
    : fallback;
}

/**
 * Sensible defaults when picking Offre / Tarif or Plan tarifaire layouts.
 */
const SERVICES_VERTICAL_CARD_CHROME_VERSION = 44;

/** Default width for Bannière média (commercial-list steps: lg ≈ max-w-6xl). */
const SERVICES_MEDIA_BANNER_DEFAULT_MAX_WIDTH = 'lg' as const;

/** Shared max width for Carte / Offre·Tarif / Plan (same footprint). */
const SERVICES_HORIZONTAL_CARD_MAX_WIDTH = 'lg' as const;

/** Border-only chrome (fill / decor remain editable after). */
const SERVICES_VERTICAL_CARD_FRAME_DEFAULTS = {
  cardBackgroundEnabled: false as const,
  cardBorder: 'soft' as const,
  cardBorderOpacity: 100,
  cardBackgroundFill: 'solid' as const,
  cardBackgroundAlternation: 'uniform' as const,
  cardDecorEnabled: false as const,
  cardDividerEnabled: false as const,
};

/** Filled card surface by default (light + dark) — Carte / Offre / Plan / Liste commerciale. */
const SERVICES_FILLED_CARD_FRAME_DEFAULTS = {
  ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
  cardBackgroundEnabled: true as const,
};

/** Media layouts — filled surface, no outline by default. */
const SERVICES_MEDIA_CARD_FRAME_DEFAULTS = {
  ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
  cardBorder: 'none' as const,
};

/** Layouts that start with a solid card fill (including light mode). */
function servicesLayoutUsesFilledCardFrame(layout: PortfolioServicesGalleryLayout): boolean {
  return (
    layout === 'card' ||
    layout === 'tier' ||
    layout === 'plan' ||
    layout === 'plan-split' ||
    layout === 'card-media' ||
    layout === 'media-banner' ||
    layout === 'media-checklist' ||
    layout === 'media-split' ||
    layout === 'commercial-list'
  );
}

/** Default task bullet size for Carte horizontal (still editable). */
const SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX = 26;

/** Type scale for Carte horizontal — shared by card / tier / plan (still editable). */
function servicesVerticalCardElementStyles(
  current?: PortfolioServicesElementStyles
): PortfolioServicesElementStyles {
  const base = normalizeServicesElementStyles(current ?? DEFAULT_SERVICES_ELEMENT_STYLES);
  return {
    ...base,
    cardTitle: {
      ...base.cardTitle,
      size: 'custom',
      // Between md (24) and lg (30) — slightly softer than full LG.
      sizePx: 27,
      weight: 'semibold',
      weightAmount: ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT.semibold,
      bold: true,
    },
    cardBody: {
      ...base.cardBody,
      size: 'custom',
      // Between md (16) and lg (18).
      sizePx: 17,
    },
    tasks: {
      ...base.tasks,
      size: 'custom',
      sizePx: 17,
    },
    price: {
      ...base.price,
      size: 'xl',
      sizePx: ELEMENT_TEXT_SIZE_PRESET_PX.title.xl,
      weight: 'semibold',
      weightAmount: ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT.semibold,
      bold: true,
    },
  };
}

/**
 * Shared defaults for horizontal card layouts (Carte / Offre·Tarif / Plan).
 * Grid + 3 columns, left CTA, check-circle bullets.
 * Colors stay on the section palette — never invent accent hexes here.
 * Filled card background for Carte / Offre / Plan (light + dark).
 */
function applyServicesHorizontalCardDesignDefaults(
  layout: 'card' | 'tier' | 'plan',
  services: Pick<
    PortfolioServicesPresentationSettings,
    | 'servicesBlock'
    | 'skillsBlock'
    | 'skillsGalleryLayout'
    | 'elementStyles'
    | 'servicesColorBindings'
  >
): Partial<PortfolioServicesPresentationSettings> {
  // Background fill for Carte / Offre / Plan; skills stay border-only.
  const frame = servicesLayoutUsesFilledCardFrame(layout)
    ? SERVICES_FILLED_CARD_FRAME_DEFAULTS
    : SERVICES_VERTICAL_CARD_FRAME_DEFAULTS;
  const nextServicesBlock = {
    ...services.servicesBlock,
    galleryLayout: layout,
    columns: 3 as const,
    displayMode: 'grid' as const,
    ...frame,
  };
  // Skills keep border-only chrome — never inherit Offre / Tarif fill from services.
  const nextSkillsBlock =
    services.skillsGalleryLayout === 'card' ||
    services.skillsGalleryLayout === 'tier' ||
    services.skillsGalleryLayout === 'plan'
      ? {
          ...services.skillsBlock,
          columns: 3 as const,
          displayMode: 'grid' as const,
          ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
        }
      : services.skillsBlock;

  const bindings = mergeServicesColorBindings(
    DEFAULT_SERVICES_COLOR_BINDINGS,
    services.servicesColorBindings
  );

  const alignmentPatch =
    layout === 'tier'
      ? {
          servicesContentAlignment: 'center' as const,
          servicePriceAlign: 'center' as const,
          servicePricePrefixEnabled: false,
          showServiceDescription: true,
          ctaDesign: 'pill-accent' as const,
          ctaAlignment: 'center' as const,
          servicePricePeriodSuffix: '',
          // Match task copy — texteMuted from palette (not principal / accent).
          servicesColorBindings: {
            ...bindings,
            tasksBullet: 'texteMuted' as const,
            ctaAccent: 'principal' as const,
            ctaBorder: 'principal' as const,
          },
        }
      : layout === 'plan'
        ? {
            servicesContentAlignment: 'left' as const,
            servicePriceAlign: 'left' as const,
            servicePricePrefixEnabled: false,
            showServiceDescription: false,
            showServiceTasks: true,
            ctaDesign: 'pill-accent' as const,
            servicesTaskBulletStyle: 'check-circle' as const,
            servicesTaskBulletSource: 'section' as const,
            servicesColorBindings: {
              ...bindings,
              tasksBullet: 'principal' as const,
              ctaAccent: 'principal' as const,
              ctaBorder: 'principal' as const,
            },
          }
        : layout === 'card'
          ? {
              showServiceDescription: true,
              ctaDesign: 'pill-accent' as const,
              ctaAlignment: 'left' as const,
              servicesContentAlignment: 'left' as const,
              servicePriceAlign: 'left' as const,
              servicesTaskBulletStyle: 'check-circle-fill' as const,
              servicesTaskBulletSource: 'section' as const,
              servicesColorBindings: {
                ...bindings,
                ctaAccent: 'principal' as const,
                ctaBorder: 'principal' as const,
                tasksBullet: 'principal' as const,
              },
            }
          : {};

  return {
    servicesGalleryLayout: layout,
    servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
    displayMode: 'grid',
    servicesColumns: 3,
    cardMaxWidth: SERVICES_HORIZONTAL_CARD_MAX_WIDTH,
    ctaLabel: 'Get started',
    ctaAlignment: 'left',
    servicesTaskBulletSource: 'section',
    servicesTaskBulletStyle: layout === 'card' ? 'check-circle-fill' : 'check-circle',
    servicesTaskBulletSize: 'custom',
    servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
    servicesTaskBulletWeight: 'regular',
    servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
    // Same type scale for Carte / Offre·Tarif / Plan.
    elementStyles: servicesVerticalCardElementStyles(services.elementStyles),
    ...alignmentPatch,
    ...frame,
    // Empty period wins over any layout patch that reintroduced "/ month".
    servicePricePeriodSuffix: '',
    servicesBlock: nextServicesBlock,
    skillsBlock: nextSkillsBlock,
  };
}

const SERVICES_GALLERY_LAYOUT_PRESET_KEYS = [
  'displayMode',
  'servicesColumns',
  'cardMaxWidth',
  'cardAlignment',
  'servicesContentAlignment',
  'servicePriceAlign',
  'servicePricePrefixEnabled',
  'servicePricePeriodSuffix',
  'showServiceTitle',
  'showServiceDescription',
  'showServicePrice',
  'showServiceDelivery',
  'showServiceTasks',
  'showServiceCta',
  'servicesTaskBulletSource',
  'servicesTaskBulletStyle',
  'servicesTaskBulletColor',
  'servicesTaskBulletSize',
  'servicesTaskBulletSizePx',
  'servicesTaskBulletWeight',
  'servicesTaskBulletWeightAmount',
  'ctaLabel',
  'ctaDesign',
  'ctaAlignment',
  'ctaShowIcon',
  'ctaIcon',
  'ctaIconPosition',
  'elementStyles',
  'servicesColorBindings',
  'cardBackgroundEnabled',
  'servicesPrincipalSurfaceEnabled',
  'servicesPrincipalSurfaceAlternation',
  'servicesPrincipalSurfaceAlternateStart',
  'servicesMediaSide',
  'servicesMediaSideAlternation',
  'cardBorder',
  'cardBorderOpacity',
  'cardBackgroundFill',
  'cardBackgroundAlternation',
  'cardDecorEnabled',
  'cardDividerEnabled',
  'commercialPriceWidthPx',
  'commercialCtaWidthPx',
  'commercialColumnGapPx',
] as const satisfies ReadonlyArray<keyof PortfolioServicesGalleryLayoutPreset>;

function captureServicesGalleryLayoutPreset(
  services: PortfolioServicesPresentationSettings
): PortfolioServicesGalleryLayoutPreset {
  const preset: PortfolioServicesGalleryLayoutPreset = {};
  for (const key of SERVICES_GALLERY_LAYOUT_PRESET_KEYS) {
    const value = services[key];
    if (value === undefined) continue;
    if (key === 'elementStyles') {
      preset.elementStyles = normalizeServicesElementStyles(value);
      continue;
    }
    if (key === 'servicesColorBindings') {
      preset.servicesColorBindings = mergeServicesColorBindings(
        DEFAULT_SERVICES_COLOR_BINDINGS,
        value
      );
      continue;
    }
    (preset as Record<string, unknown>)[key] = value;
  }
  return preset;
}

function mergeServicesGalleryLayoutPresets(
  base: PortfolioServicesPresentationSettings['servicesGalleryLayoutPresets'],
  raw: unknown
): Partial<Record<PortfolioServicesGalleryLayout, PortfolioServicesGalleryLayoutPreset>> {
  const out: Partial<
    Record<PortfolioServicesGalleryLayout, PortfolioServicesGalleryLayoutPreset>
  > = { ...(base ?? {}) };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!SERVICES_GALLERY_LAYOUT_VALUES.includes(key as PortfolioServicesGalleryLayout)) {
      // Allow legacy / skills layouts that may still be stored.
      if (
        key !== 'pricing-hero' &&
        key !== 'service-accordion' &&
        key !== 'icon-stack' &&
        key !== 'pill-cloud' &&
        key !== 'tool-inspector'
      ) {
        continue;
      }
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const layout = key as PortfolioServicesGalleryLayout;
    const record = value as Record<string, unknown>;
    const preset: PortfolioServicesGalleryLayoutPreset = { ...(out[layout] ?? {}) };
    for (const field of SERVICES_GALLERY_LAYOUT_PRESET_KEYS) {
      if (!(field in record)) continue;
      if (field === 'elementStyles') {
        preset.elementStyles = normalizeServicesElementStyles(record.elementStyles);
        continue;
      }
      if (field === 'servicesColorBindings') {
        preset.servicesColorBindings = mergeServicesColorBindings(
          DEFAULT_SERVICES_COLOR_BINDINGS,
          record.servicesColorBindings
        );
        continue;
      }
      (preset as Record<string, unknown>)[field] = record[field];
    }
    out[layout] = preset;
  }
  return out;
}

/** Caps card / coverflow width so the stack stays portrait instead of stretching full column. */
export function servicesCardMaxWidthClass(maxWidth: PortfolioServicesCardMaxWidth | undefined): string {
  switch (maxWidth) {
    case 'sm':
      return 'w-full max-w-sm';
    case 'md':
      return 'w-full max-w-md';
    case 'lg':
      return 'w-full max-w-lg';
    case 'xl':
      return 'w-full max-w-xl';
    default:
      return 'w-full max-w-full';
  }
}

/**
 * Liste commerciale — wider steps than tile cards so price + CTA fit,
 * but still capped (default `xl` = max-w-7xl) instead of full bleed.
 */
function servicesCommercialListMaxWidthClass(
  maxWidth: PortfolioServicesCardMaxWidth | undefined
): string {
  switch (maxWidth) {
    case 'sm':
      return 'w-full max-w-4xl';
    case 'md':
      return 'w-full max-w-5xl';
    case 'lg':
      return 'w-full max-w-6xl';
    case 'xl':
      return 'w-full max-w-7xl';
    default:
      return 'w-full max-w-full';
  }
}

/** Align a width-capped card stack inside its column. */
export function servicesCardMaxWidthShellClass(
  maxWidth: PortfolioServicesCardMaxWidth | undefined,
  alignment: PortfolioServicesCardAlignment | PortfolioServicesContentAlignment = 'center',
  /** Use commercial-list width steps when rendering Liste commerciale rows. */
  variant: 'card' | 'commercial-list' = 'card'
): string {
  const width =
    variant === 'commercial-list'
      ? servicesCommercialListMaxWidthClass(maxWidth)
      : servicesCardMaxWidthClass(maxWidth);
  if (!maxWidth || maxWidth === 'full') return width;
  switch (alignment) {
    case 'left':
      return `${width} mr-auto`;
    case 'right':
      return `${width} ml-auto`;
    default:
      return `${width} mx-auto`;
  }
}

export function pickServicesPresentationSettings(services: unknown): PortfolioServicesPresentationSettings {
  return mergeServicesPresentation(DEFAULT_SERVICES_PRESENTATION, services);
}

/** Legacy `none` (old factory uniforme) → `alternate`. Explicit uniforme is now `uniform`. */
function pickServicesCardBackgroundAlternation(
  value: unknown,
  fallback: PortfolioServicesCardBackgroundAlternation
): PortfolioServicesCardBackgroundAlternation {
  if (value === 'alternate' || value === 'uniform') return value;
  if (value === 'none') return 'alternate';
  return fallback;
}

export function mergeServicesPresentation(
  base: PortfolioServicesPresentationSettings,
  patch: unknown
): PortfolioServicesPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

  const pickColumns = (value: unknown, fallback: PortfolioServicesCardColumns): PortfolioServicesCardColumns => {
    const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    return n === 1 || n === 2 || n === 3 || n === 4 ? n : fallback;
  };

  const background = mergeSectionBackground(base, patch);
  const cardBackground = withMigratedServicesCardBackground(
    mergeServicesCardBackgroundSettings(base, patch)
  );
  const cardDecor = mergeServicesCardDecorSettings(base, patch);

  const organizationRaw = record.sectionOrganization;
  const layoutModeRaw = record.layoutMode;
  const layoutMode: PortfolioServicesLayoutMode = 'separated';
  // Legacy org values are ignored — Skills / Services are always distinct sections.
  void organizationRaw;
  void layoutModeRaw;

  const mergedPresentation = {
    ...background,
    ...cardBackground,
    ...cardDecor,
    titlePreset: pick(record.titlePreset, ['services-skills', 'expertise', 'what-i-offer', 'skills-services', 'custom'], base.titlePreset),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['default', 'short', 'collaboration', 'craft', 'minimal', 'custom'],
      base.subtitlePreset
    ),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    headerAlignment: pick(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    headerDesign: pick(record.headerDesign, SERVICES_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    // The header motion switch was removed from the UI — always on (reduced-motion is still honoured).
    headerAnimationEnabled: true,
    headerDesignAlignment: pick(
      record.headerDesignAlignment,
      ['left', 'center', 'right'] as const,
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pick(
      record.headerMarginBottom,
      SERVICES_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pick(record.headerTitleSize, SERVICES_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'md'),
    headerTitleWeight: pick(
      record.headerTitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerTitleWeight ?? 'regular'
    ),
    headerAccentCountBadgeText:
      typeof record.headerAccentCountBadgeText === 'string'
        ? record.headerAccentCountBadgeText
        : (base.headerAccentCountBadgeText ?? ''),
    headerAccentCountLeadText:
      typeof record.headerAccentCountLeadText === 'string'
        ? record.headerAccentCountLeadText
        : (base.headerAccentCountLeadText ?? ''),
    headerAccentCountBadgeColor: pick(
      record.headerAccentCountBadgeColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerAccentCountBadgeColor ?? 'principal'
    ),
    headerAccentCountLeadColor: pick(
      record.headerAccentCountLeadColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerAccentCountLeadColor ?? 'secondaire'
    ),
    headerAccentCountSize: pick(
      record.headerAccentCountSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerAccentCountSize ?? 'md'
    ),
    headerAccentCountWeight: pick(
      record.headerAccentCountWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerAccentCountWeight ?? 'regular'
    ),
    headerAccentCountAlignment: pick(
      record.headerAccentCountAlignment,
      SERVICES_HEADER_ACCENT_COUNT_ALIGNMENTS,
      base.headerAccentCountAlignment ?? 'left'
    ),
    headerSerifLeadLabelText:
      typeof record.headerSerifLeadLabelText === 'string'
        ? record.headerSerifLeadLabelText
        : (base.headerSerifLeadLabelText ?? ''),
    headerSerifLeadTitleText:
      typeof record.headerSerifLeadTitleText === 'string'
        ? record.headerSerifLeadTitleText
        : (base.headerSerifLeadTitleText ?? ''),
    headerSerifLeadSubtitleText:
      typeof record.headerSerifLeadSubtitleText === 'string'
        ? record.headerSerifLeadSubtitleText
        : (base.headerSerifLeadSubtitleText ?? ''),
    headerSerifLeadLabelColor: pick(
      record.headerSerifLeadLabelColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pick(
      record.headerSerifLeadTitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pick(
      record.headerSerifLeadSubtitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pick(
      record.headerSerifLeadLabelSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pick(
      record.headerSerifLeadTitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pick(
      record.headerSerifLeadSubtitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pick(
      record.headerSerifLeadLabelWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pick(
      record.headerSerifLeadTitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pick(
      record.headerSerifLeadSubtitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadSubtitleWeight ?? 'regular'
    ),
    headerEditorialLabelText:
      typeof record.headerEditorialLabelText === 'string'
        ? record.headerEditorialLabelText
        : (base.headerEditorialLabelText ?? ''),
    headerEditorialTitleText:
      typeof record.headerEditorialTitleText === 'string'
        ? record.headerEditorialTitleText
        : (base.headerEditorialTitleText ?? ''),
    headerEditorialSubtitleText:
      typeof record.headerEditorialSubtitleText === 'string'
        ? record.headerEditorialSubtitleText
        : (base.headerEditorialSubtitleText ?? ''),
    headerEditorialLabelColor: pick(
      record.headerEditorialLabelColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerEditorialLabelColor ?? 'texteFort'
    ),
    headerEditorialTitleColor: pick(
      record.headerEditorialTitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerEditorialTitleColor ?? 'texteFort'
    ),
    headerEditorialSubtitleColor: pick(
      record.headerEditorialSubtitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerEditorialSubtitleColor ?? 'texteFort'
    ),
    headerEditorialLabelSize: pick(
      record.headerEditorialLabelSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerEditorialLabelSize ?? 'md'
    ),
    headerEditorialTitleSize: pick(
      record.headerEditorialTitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerEditorialTitleSize ?? 'md'
    ),
    headerEditorialSubtitleSize: pick(
      record.headerEditorialSubtitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerEditorialSubtitleSize ?? 'md'
    ),
    headerEditorialLabelWeight: pick(
      record.headerEditorialLabelWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerEditorialLabelWeight ?? 'regular'
    ),
    headerEditorialTitleWeight: pick(
      record.headerEditorialTitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerEditorialTitleWeight ?? 'regular'
    ),
    headerEditorialSubtitleWeight: pick(
      record.headerEditorialSubtitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerEditorialSubtitleWeight ?? 'regular'
    ),
    headerBillboardBigWord:
      typeof record.headerBillboardBigWord === 'string'
        ? record.headerBillboardBigWord
        : (base.headerBillboardBigWord ?? ''),
    headerBillboardCountText:
      typeof record.headerBillboardCountText === 'string'
        ? record.headerBillboardCountText
        : (base.headerBillboardCountText ?? ''),
    headerBillboardTitleText:
      typeof record.headerBillboardTitleText === 'string'
        ? record.headerBillboardTitleText
        : (base.headerBillboardTitleText ?? ''),
    headerBillboardWordStyle: pick(
      record.headerBillboardWordStyle,
      SERVICES_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pick(
      record.headerBillboardWordColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
    ),
    headerBillboardTitleColor: pick(
      record.headerBillboardTitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerBillboardTitleColor ?? 'principal'
    ),
    headerBillboardMetaColor: pick(
      record.headerBillboardMetaColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerBillboardMetaColor ?? 'secondaire'
    ),
    headerSplitHeadingLabelText:
      typeof record.headerSplitHeadingLabelText === 'string'
        ? record.headerSplitHeadingLabelText
        : (base.headerSplitHeadingLabelText ?? ''),
    headerSplitHeadingTitleText:
      typeof record.headerSplitHeadingTitleText === 'string'
        ? record.headerSplitHeadingTitleText
        : (base.headerSplitHeadingTitleText ?? ''),
    headerSplitHeadingTitleColor: pick(
      record.headerSplitHeadingTitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingTitleColor ?? 'principal'
    ),
    headerSplitHeadingLabelColor: pick(
      record.headerSplitHeadingLabelColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingLabelColor ?? 'secondaire'
    ),
    headerSplitHeadingTitleSize: pick(
      record.headerSplitHeadingTitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerSplitHeadingTitleSize ?? 'md'
    ),
    headerSplitHeadingTitleWeight: pick(
      record.headerSplitHeadingTitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingTitleWeight ?? 'regular'
    ),
    headerSplitHeadingLabelSize: pick(
      record.headerSplitHeadingLabelSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerSplitHeadingLabelSize ?? 'md'
    ),
    headerSplitHeadingLabelWeight: pick(
      record.headerSplitHeadingLabelWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingLabelWeight ?? 'regular'
    ),
    headerMastheadLine1Text:
      typeof record.headerMastheadLine1Text === 'string'
        ? record.headerMastheadLine1Text
        : (base.headerMastheadLine1Text ?? ''),
    headerMastheadLine2Text:
      typeof record.headerMastheadLine2Text === 'string'
        ? record.headerMastheadLine2Text
        : (base.headerMastheadLine2Text ?? ''),
    headerMastheadLine3Text:
      typeof record.headerMastheadLine3Text === 'string'
        ? record.headerMastheadLine3Text
        : (base.headerMastheadLine3Text ?? ''),
    headerMastheadHeadlineColor: pick(
      record.headerMastheadHeadlineColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pick(
      record.headerMastheadHeadlineSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pick(
      record.headerMastheadHeadlineWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerMastheadHeadlineWeight ?? 'regular'
    ),
    headerIndexLabelText:
      typeof record.headerIndexLabelText === 'string' ? record.headerIndexLabelText : (base.headerIndexLabelText ?? ''),
    headerIndexTitleText:
      typeof record.headerIndexTitleText === 'string' ? record.headerIndexTitleText : (base.headerIndexTitleText ?? ''),
    headerIndexCountLabelText:
      typeof record.headerIndexCountLabelText === 'string'
        ? record.headerIndexCountLabelText
        : (base.headerIndexCountLabelText ?? ''),
    headerIndexSubtitleText:
      typeof record.headerIndexSubtitleText === 'string'
        ? record.headerIndexSubtitleText
        : (base.headerIndexSubtitleText ?? ''),
    headerIndexLabelColor: pick(
      record.headerIndexLabelColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pick(
      record.headerIndexNumberColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pick(
      record.headerIndexTitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pick(
      record.headerIndexSubtitleColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pick(
      record.headerIndexLabelSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerIndexLabelSize ?? 'md'
    ),
    headerIndexLabelWeight: pick(
      record.headerIndexLabelWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pick(
      record.headerIndexTitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerIndexTitleSize ?? 'md'
    ),
    headerIndexTitleWeight: pick(
      record.headerIndexTitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pick(
      record.headerIndexSubtitleSize,
      SERVICES_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pick(
      record.headerIndexSubtitleWeight,
      SERVICES_HEADER_TITLE_WEIGHTS,
      base.headerIndexSubtitleWeight ?? 'regular'
    ),
    headerMarqueeWord1Text:
      typeof record.headerMarqueeWord1Text === 'string'
        ? record.headerMarqueeWord1Text
        : (base.headerMarqueeWord1Text ?? ''),
    headerMarqueeWord2Text:
      typeof record.headerMarqueeWord2Text === 'string'
        ? record.headerMarqueeWord2Text
        : (base.headerMarqueeWord2Text ?? ''),
    headerMarqueeWord3Text:
      typeof record.headerMarqueeWord3Text === 'string'
        ? record.headerMarqueeWord3Text
        : (base.headerMarqueeWord3Text ?? ''),
    headerMarqueeWord4Text:
      typeof record.headerMarqueeWord4Text === 'string'
        ? record.headerMarqueeWord4Text
        : (base.headerMarqueeWord4Text ?? ''),
    headerMarqueeWordColor: pick(
      record.headerMarqueeWordColor,
      SERVICES_HEADER_PALETTE_TOKENS,
      base.headerMarqueeWordColor ?? 'principal'
    ),
    headerMarqueeSize: pick(record.headerMarqueeSize, SERVICES_HEADER_TITLE_SIZES, base.headerMarqueeSize ?? 'md'),
    sectionOrganization: 'distinct' as const,
    layoutMode,
    sectionDesign: pick(
      record.sectionDesign,
      PORTFOLIO_SERVICES_SECTION_DESIGNS,
      base.sectionDesign ?? DEFAULT_PORTFOLIO_SERVICES_SECTION_DESIGN
    ),
    indexList: mergeServicesIndexListSettings(
      mergeServicesIndexListSettings(DEFAULT_SERVICES_INDEX_LIST_SETTINGS, base.indexList),
      record.indexList
    ),
    mediaColumns: mergeServicesMediaColumnsSettings(
      mergeServicesMediaColumnsSettings(DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS, base.mediaColumns),
      record.mediaColumns
    ),
    pricingGrid: mergeServicesPricingGridSettings(
      mergeServicesPricingGridSettings(DEFAULT_SERVICES_PRICING_GRID_SETTINGS, base.pricingGrid),
      record.pricingGrid
    ),
    pricingBento: mergeServicesPricingBentoSettings(
      mergeServicesPricingBentoSettings(DEFAULT_SERVICES_PRICING_BENTO_SETTINGS, base.pricingBento),
      record.pricingBento
    ),
    servicesPricingMonolith: mergeServicesPricingMonolithSettings(
      mergeServicesPricingMonolithSettings(DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS, base.servicesPricingMonolith),
      record.servicesPricingMonolith
    ),
    servicesPricingAurora: mergeServicesPricingAuroraSettings(
      mergeServicesPricingAuroraSettings(DEFAULT_SERVICES_PRICING_AURORA_SETTINGS, base.servicesPricingAurora),
      record.servicesPricingAurora
    ),
    pricingToggle: mergeServicesPricingToggleSettings(
      mergeServicesPricingToggleSettings(DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS, base.pricingToggle),
      record.pricingToggle
    ),
    pricingStyle: mergeServicesPricingStyleSettings(
      mergeServicesPricingStyleSettings(DEFAULT_SERVICES_PRICING_STYLE_SETTINGS, base.pricingStyle),
      record.pricingStyle
    ),
    displayMode: pick(record.displayMode, ['marquee', 'grid', 'stack', 'coverflow', 'deck'], base.displayMode),
    deckEntranceEffect: pick(
      record.deckEntranceEffect,
      ['none', 'expand', 'cascade'],
      base.deckEntranceEffect ?? 'expand'
    ),
    servicesMarqueeDirection: pick(
      record.servicesMarqueeDirection,
      ['left', 'right'],
      base.servicesMarqueeDirection ?? 'left'
    ),
    skillsMarqueeDirection: pick(
      record.skillsMarqueeDirection,
      ['left', 'right'],
      base.skillsMarqueeDirection ?? 'left'
    ),
    servicesGalleryLayout: normalizeServicesGalleryLayoutValue(
      record.servicesGalleryLayout,
      base.servicesGalleryLayout,
      'services'
    ),
    skillsGalleryLayout: normalizeServicesGalleryLayoutValue(
      record.skillsGalleryLayout,
      base.skillsGalleryLayout,
      'skills'
    ),
    stackOrder: pick(record.stackOrder, ['skills-first', 'services-first'], base.stackOrder),
    cardDesign: pick(record.cardDesign, ['editorial', 'minimal', 'compact', 'glass', 'frost', 'accent'], base.cardDesign),
    cardDesignIntensities: mergeCardDesignIntensities(base.cardDesignIntensities, record.cardDesignIntensities),
    cardDesignTints: mergeCardDesignTints(base.cardDesignTints, record.cardDesignTints),
    stageDesign: pick(record.stageDesign, ['framed', 'open', 'soft', 'none'], base.stageDesign),
    ...mergeServicesStageChrome(base, record),
    cardAccentColor: sanitizeHex(record.cardAccentColor, base.cardAccentColor),
    cardBorder: pick(record.cardBorder, ['none', 'soft', 'solid', 'accent'], base.cardBorder),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    cardBorderOpacity: clampCardDesignIntensity(
      record.cardBorderOpacity,
      base.cardBorderOpacity ?? 100
    ),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : base.cardBackgroundEnabled,
    servicesPrincipalSurfaceEnabled:
      typeof record.servicesPrincipalSurfaceEnabled === 'boolean'
        ? record.servicesPrincipalSurfaceEnabled
        : (base.servicesPrincipalSurfaceEnabled ?? false),
    servicesPrincipalSurfaceAlternation: pickServicesCardBackgroundAlternation(
      record.servicesPrincipalSurfaceAlternation,
      base.servicesPrincipalSurfaceAlternation ?? 'uniform'
    ),
    servicesPrincipalSurfaceAlternateStart: pick(
      record.servicesPrincipalSurfaceAlternateStart,
      ['principal', 'normal'],
      base.servicesPrincipalSurfaceAlternateStart ?? 'principal'
    ),
    servicesMediaSide: pick(
      record.servicesMediaSide,
      ['media-left', 'media-right'],
      base.servicesMediaSide ?? 'media-left'
    ),
    servicesMediaSideAlternation: pick(
      record.servicesMediaSideAlternation,
      ['uniform', 'alternate'],
      base.servicesMediaSideAlternation ?? 'alternate'
    ),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBackgroundColorDark: sanitizeHex(
      record.cardBackgroundColorDark,
      base.cardBackgroundColorDark ?? '#171717'
    ),
    cardBackgroundColorBDark: sanitizeHex(
      record.cardBackgroundColorBDark,
      base.cardBackgroundColorBDark ?? '#262626'
    ),
    cardBorderRadius: pick(record.cardBorderRadius, ['none', 'sm', 'md', 'lg', 'xl'], base.cardBorderRadius),
    cardPadding: pick(record.cardPadding, ['none', 'sm', 'md', 'lg'], base.cardPadding),
    cardBackgroundAlternation: pickServicesCardBackgroundAlternation(
      record.cardBackgroundAlternation,
      base.cardBackgroundAlternation
    ),
    cardTextContrast: pickServicesCardTextContrast(record.cardTextContrast, base.cardTextContrast ?? 'auto'),
    cardInkStrongA: sanitizeHex(
      record.cardInkStrongA,
      base.cardInkStrongA ?? DEFAULT_SERVICES_CARD_INK_STRONG_A
    ),
    cardInkMutedA: sanitizeHex(record.cardInkMutedA, base.cardInkMutedA ?? DEFAULT_SERVICES_CARD_INK_MUTED_A),
    cardInkStrongB: sanitizeHex(
      record.cardInkStrongB,
      base.cardInkStrongB ?? DEFAULT_SERVICES_CARD_INK_STRONG_B
    ),
    cardInkMutedB: sanitizeHex(record.cardInkMutedB, base.cardInkMutedB ?? DEFAULT_SERVICES_CARD_INK_MUTED_B),
    servicesColumns: pickColumns(record.servicesColumns, base.servicesColumns),
    skillsColumns: pickColumns(record.skillsColumns, base.skillsColumns),
    cardMaxWidth: pick(record.cardMaxWidth, ['full', 'xl', 'lg', 'md', 'sm'], base.cardMaxWidth),
    cardAlignment: pick(record.cardAlignment, ['left', 'center', 'right'], base.cardAlignment),
    servicesContentAlignment: pick(
      record.servicesContentAlignment,
      ['left', 'center', 'right'],
      base.servicesContentAlignment
    ),
    skillsContentAlignment: pick(
      record.skillsContentAlignment,
      ['left', 'center', 'right'],
      base.skillsContentAlignment
    ),
    servicesContentGap: pickServicesContentGap(record.servicesContentGap, base.servicesContentGap),
    servicesContentGapPx: clampServicesContentGapPx(
      record.servicesContentGapPx,
      base.servicesContentGapPx ?? 14
    ),
    skillsContentGap: pickServicesContentGap(record.skillsContentGap, base.skillsContentGap),
    skillsContentGapPx: clampServicesContentGapPx(
      record.skillsContentGapPx,
      base.skillsContentGapPx ?? 14
    ),
    servicesPricePlacement: pick(
      record.servicesPricePlacement,
      ['end', 'below', 'top'],
      base.servicesPricePlacement
    ),
    servicesCurrency: sanitizeServicesCurrencyCode(record.servicesCurrency, base.servicesCurrency),
    serviceCurrencyPlacement: pick(
      record.serviceCurrencyPlacement,
      ['before', 'after'],
      base.serviceCurrencyPlacement ?? 'after'
    ),
    servicePricePrefixEnabled:
      typeof record.servicePricePrefixEnabled === 'boolean'
        ? record.servicePricePrefixEnabled
        : base.servicePricePrefixEnabled,
    servicePricePrefix:
      typeof record.servicePricePrefix === 'string'
        ? record.servicePricePrefix
        : base.servicePricePrefix,
    servicePricePeriodSuffix: (() => {
      const raw =
        typeof record.servicePricePeriodSuffix === 'string'
          ? record.servicePricePeriodSuffix
          : base.servicePricePeriodSuffix ?? '';
      const trimmed = raw.trim();
      // Drop legacy "/ month" / "per month" suffixes from every design.
      if (!trimmed) return '';
      if (/^\/?\s*(per\s+)?months?$/i.test(trimmed)) return '';
      return trimmed;
    })(),
    servicePriceAlign: pick(
      record.servicePriceAlign,
      ['left', 'center', 'right'],
      base.servicePriceAlign
    ),
    servicePriceMarginTopPx: clampServicePriceMarginPx(
      record.servicePriceMarginTopPx,
      base.servicePriceMarginTopPx ?? 0
    ),
    servicePriceMarginBottomPx: clampServicePriceMarginPx(
      record.servicePriceMarginBottomPx,
      base.servicePriceMarginBottomPx ?? 0
    ),
    commercialPopularItemNumber:
      typeof record.commercialPopularItemNumber === 'number' &&
      Number.isFinite(record.commercialPopularItemNumber)
        ? Math.max(0, Math.min(99, Math.round(record.commercialPopularItemNumber)))
        : base.commercialPopularItemNumber ?? 2,
    commercialPopularLabel:
      typeof record.commercialPopularLabel === 'string'
        ? record.commercialPopularLabel.slice(0, 40)
        : base.commercialPopularLabel ?? 'Popular',
    commercialRowGapPx: clampCommercialLayoutPx(
      record.commercialRowGapPx,
      base.commercialRowGapPx ?? 20,
      0,
      80
    ),
    commercialColumnGapPx: clampCommercialLayoutPx(
      record.commercialColumnGapPx,
      base.commercialColumnGapPx ?? 48,
      12,
      80
    ),
    commercialMarkerSizePx: clampCommercialLayoutPx(
      record.commercialMarkerSizePx,
      base.commercialMarkerSizePx ?? 48,
      32,
      72
    ),
    commercialPriceWidthPx: clampCommercialLayoutPx(
      record.commercialPriceWidthPx,
      base.commercialPriceWidthPx ?? 220,
      112,
      320
    ),
    commercialCtaWidthPx: clampCommercialLayoutPx(
      record.commercialCtaWidthPx,
      base.commercialCtaWidthPx ?? 200,
      112,
      320
    ),
    skillsIconPlacement: pick(record.skillsIconPlacement, ['start', 'top'], base.skillsIconPlacement),
    skillsIconRadius: pick(
      record.skillsIconRadius,
      ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      base.skillsIconRadius ?? 'full'
    ),
    skillsIconBackgroundEnabled:
      typeof record.skillsIconBackgroundEnabled === 'boolean'
        ? record.skillsIconBackgroundEnabled
        : (base.skillsIconBackgroundEnabled ?? true),
    skillsIconBackgroundColor: sanitizeHex(
      record.skillsIconBackgroundColor,
      base.skillsIconBackgroundColor ?? DEFAULT_SERVICES_CARD_BACKGROUND_COLOR
    ),
    skillsIconBackgroundManual:
      typeof record.skillsIconBackgroundManual === 'boolean'
        ? record.skillsIconBackgroundManual
        : (base.skillsIconBackgroundManual ?? false),
    skillsIconBorderEnabled:
      typeof record.skillsIconBorderEnabled === 'boolean'
        ? record.skillsIconBorderEnabled
        : (base.skillsIconBorderEnabled ?? true),
    skillsIconBorderColor: sanitizeHex(
      record.skillsIconBorderColor,
      base.skillsIconBorderColor ?? DEFAULT_SERVICES_CARD_BORDER_COLOR
    ),
    skillsIconBorderManual:
      typeof record.skillsIconBorderManual === 'boolean'
        ? record.skillsIconBorderManual
        : (base.skillsIconBorderManual ?? false),
    skillsIconBorderWidthPx: clampSkillsIconBorderWidthPx(
      record.skillsIconBorderWidthPx,
      base.skillsIconBorderWidthPx ?? 1
    ),
    showSkills: false,
    showServices: typeof record.showServices === 'boolean' ? record.showServices : base.showServices,
    showSkillIcon: typeof record.showSkillIcon === 'boolean' ? record.showSkillIcon : base.showSkillIcon,
    showSkillTitle: typeof record.showSkillTitle === 'boolean' ? record.showSkillTitle : base.showSkillTitle,
    showSkillDescription:
      typeof record.showSkillDescription === 'boolean' ? record.showSkillDescription : base.showSkillDescription,
    showSkillLevel:
      typeof record.showSkillLevel === 'boolean' ? record.showSkillLevel : (base.showSkillLevel ?? true),
    showSkillUseCases:
      typeof record.showSkillUseCases === 'boolean'
        ? record.showSkillUseCases
        : (base.showSkillUseCases ?? true),
    showSkillExperience:
      typeof record.showSkillExperience === 'boolean'
        ? record.showSkillExperience
        : (base.showSkillExperience ?? true),
    showSkillCurrentlyUsed:
      typeof record.showSkillCurrentlyUsed === 'boolean'
        ? record.showSkillCurrentlyUsed
        : (base.showSkillCurrentlyUsed ?? false),
    skillsInspectorRailPlacement: pick(
      record.skillsInspectorRailPlacement,
      ['left', 'right', 'top'],
      base.skillsInspectorRailPlacement ?? 'left'
    ),
    skillsInspectorRailFrameEnabled:
      typeof record.skillsInspectorRailFrameEnabled === 'boolean'
        ? record.skillsInspectorRailFrameEnabled
        : (base.skillsInspectorRailFrameEnabled ?? true),
    skillsInspectorIconGapPx: clampSkillsInspectorIconGapPx(
      record.skillsInspectorIconGapPx,
      base.skillsInspectorIconGapPx ?? 12
    ),
    skillsInspectorIllustrationVariant: pick(
      record.skillsInspectorIllustrationVariant,
      ['none', 'chat', 'question', 'docs', 'support', 'hex'],
      base.skillsInspectorIllustrationVariant ?? 'none'
    ),
    skillsInspectorIllustrationPlacement: pick(
      record.skillsInspectorIllustrationPlacement,
      ['left', 'right'],
      base.skillsInspectorIllustrationPlacement ?? 'right'
    ),
    servicesIllustrationVariant: pick(
      record.servicesIllustrationVariant,
      ['none', 'chat', 'question', 'docs', 'support', 'hex'],
      base.servicesIllustrationVariant ?? 'none'
    ),
    servicesIllustrationPlacement: pick(
      record.servicesIllustrationPlacement,
      ['left', 'right'],
      base.servicesIllustrationPlacement ?? 'right'
    ),
    skillsInspectorShowHint:
      typeof record.skillsInspectorShowHint === 'boolean'
        ? record.skillsInspectorShowHint
        : (base.skillsInspectorShowHint ?? false),
    skillsShowBullet:
      typeof record.skillsShowBullet === 'boolean' ? record.skillsShowBullet : (base.skillsShowBullet ?? false),
    skillsBulletSource: (() => {
      if (isPortfolioListMarkerSource(record.skillsBulletSource)) return record.skillsBulletSource;
      return base.skillsBulletSource ?? 'global';
    })(),
    skillsBulletStyle: isPortfolioServicesTaskBulletStyle(record.skillsBulletStyle)
      ? record.skillsBulletStyle
      : (base.skillsBulletStyle ?? 'disc'),
    skillsBulletColor: sanitizeHex(
      record.skillsBulletColor,
      base.skillsBulletColor ?? DEFAULT_SERVICES_TASK_BULLET_COLOR
    ),
    skillsBulletSize: isPortfolioListMarkerSize(record.skillsBulletSize)
      ? record.skillsBulletSize
      : (base.skillsBulletSize ?? 'md'),
    skillsBulletSizePx: clampListMarkerSizePx(
      record.skillsBulletSizePx,
      base.skillsBulletSizePx ?? LIST_MARKER_SIZE_PRESET_PX.md
    ),
    skillsBulletWeight: isPortfolioListMarkerWeight(record.skillsBulletWeight)
      ? record.skillsBulletWeight
      : (base.skillsBulletWeight ?? 'regular'),
    skillsBulletWeightAmount: clampListMarkerWeightAmount(
      record.skillsBulletWeightAmount,
      base.skillsBulletWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    skillsCardBrandFill:
      typeof record.skillsCardBrandFill === 'boolean' ? record.skillsCardBrandFill : base.skillsCardBrandFill,
    showServiceTitle: typeof record.showServiceTitle === 'boolean' ? record.showServiceTitle : base.showServiceTitle,
    showServiceDescription:
      typeof record.showServiceDescription === 'boolean' ? record.showServiceDescription : base.showServiceDescription,
    showServicePrice: typeof record.showServicePrice === 'boolean' ? record.showServicePrice : base.showServicePrice,
    showServiceDelivery:
      typeof record.showServiceDelivery === 'boolean' ? record.showServiceDelivery : base.showServiceDelivery,
    showServiceTasks:
      typeof record.showServiceTasks === 'boolean' ? record.showServiceTasks : base.showServiceTasks,
    servicesTaskBulletSource: isPortfolioListMarkerSource(record.servicesTaskBulletSource)
      ? record.servicesTaskBulletSource
      : (base.servicesTaskBulletSource ?? 'global'),
    servicesTaskBulletStyle: isPortfolioServicesTaskBulletStyle(record.servicesTaskBulletStyle)
      ? record.servicesTaskBulletStyle
      : base.servicesTaskBulletStyle,
    servicesTaskBulletColor: sanitizeHex(
      record.servicesTaskBulletColor,
      base.servicesTaskBulletColor
    ),
    servicesTaskBulletSize: isPortfolioListMarkerSize(record.servicesTaskBulletSize)
      ? record.servicesTaskBulletSize
      : (base.servicesTaskBulletSize ?? 'md'),
    servicesTaskBulletSizePx: clampListMarkerSizePx(
      record.servicesTaskBulletSizePx,
      base.servicesTaskBulletSizePx ?? LIST_MARKER_SIZE_PRESET_PX.md
    ),
    servicesTaskBulletWeight: isPortfolioListMarkerWeight(record.servicesTaskBulletWeight)
      ? record.servicesTaskBulletWeight
      : (base.servicesTaskBulletWeight ?? 'regular'),
    servicesTaskBulletWeightAmount: clampListMarkerWeightAmount(
      record.servicesTaskBulletWeightAmount,
      base.servicesTaskBulletWeightAmount ?? LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular
    ),
    showServiceCta: typeof record.showServiceCta === 'boolean' ? record.showServiceCta : base.showServiceCta,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
    ctaDesign: pick(
      record.ctaDesign,
      ['pill-dark', 'pill-outline', 'pill-accent', 'text-arrow', 'circle-icon'],
      base.ctaDesign
    ),
    ctaShowIcon: typeof record.ctaShowIcon === 'boolean' ? record.ctaShowIcon : base.ctaShowIcon,
    ctaIcon: normalizePortfolioWorkCtaIcon(record.ctaIcon, base.ctaIcon),
    ctaIconPosition:
      record.ctaIconPosition === 'left' || record.ctaIconPosition === 'right'
        ? record.ctaIconPosition
        : base.ctaIconPosition,
    ctaColor: sanitizeHex(record.ctaColor, base.ctaColor),
    ctaBorderColor: sanitizeHex(record.ctaBorderColor, base.ctaBorderColor),
    ctaBorderWidth: pick(record.ctaBorderWidth, ['none', 'thin', 'medium', 'thick'], base.ctaBorderWidth),
    ctaBorderRadius: pick(
      record.ctaBorderRadius,
      ['none', 'sm', 'md', 'lg', 'full'],
      base.ctaBorderRadius
    ),
    ctaHoverBackgroundColor: sanitizeHex(record.ctaHoverBackgroundColor, base.ctaHoverBackgroundColor),
    ctaHoverTextColor: sanitizeHex(record.ctaHoverTextColor, base.ctaHoverTextColor),
    ctaHoverBorderColor: sanitizeHex(record.ctaHoverBorderColor, base.ctaHoverBorderColor),
    ctaHoverEnabled:
      typeof record.ctaHoverEnabled === 'boolean' ? record.ctaHoverEnabled : base.ctaHoverEnabled,
    ctaAlignment: pick(record.ctaAlignment, ['left', 'center', 'right'], base.ctaAlignment),
    // Previous factory default was true — hide the “Typically replies…” line by default.
    showResponseTime: false,
    // Combined-mode block subheadings are unused when Skills / Services are distinct sections.
    showSkillsSubheading: false,
    showServicesSubheading: false,
    skillsSubheadingLabel:
      typeof record.skillsSubheadingLabel === 'string' ? record.skillsSubheadingLabel : base.skillsSubheadingLabel,
    servicesSubheadingLabel:
      typeof record.servicesSubheadingLabel === 'string'
        ? record.servicesSubheadingLabel
        : base.servicesSubheadingLabel,
    skillsIconSize: pick(record.skillsIconSize, ['sm', 'md', 'lg', 'xl'], base.skillsIconSize),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
    premiumFontSize: pick(record.premiumFontSize, SERVICES_PREMIUM_FONT_SIZES, base.premiumFontSize ?? 'medium'),
    servicesPalette: mergeServicesPalette(
      mergeServicesPalette(DEFAULT_SERVICES_PALETTE, base.servicesPalette),
      record.servicesPalette
    ),
    servicesColorBindings: mergeServicesColorBindings(
      mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, base.servicesColorBindings),
      record.servicesColorBindings
    ),
    elementStyles: normalizeServicesElementStyles(record.elementStyles ?? base.elementStyles),
    elementChromes: mergeServicesElementChromes(
      mergeServicesElementChromes(DEFAULT_SERVICES_ELEMENT_CHROMES, base.elementChromes),
      record.elementChromes
    ),
  } satisfies Omit<
    PortfolioServicesPresentationSettings,
    'skillsBlock' | 'servicesBlock' | 'skillsHeader' | 'servicesHeader'
  >;

  const mergeBlock = (
    blockBase: PortfolioServicesBlockSettings,
    blockPatch: unknown,
    kind: PortfolioServicesBlockScope
  ): PortfolioServicesBlockSettings => {
    const fallback = createDefaultServicesBlockSettings(kind, {
      ...mergedPresentation,
      ...cardBackground,
    });
    if (!blockPatch || typeof blockPatch !== 'object') {
      const withoutPatch = {
        ...fallback,
        ...blockBase,
        cardBackgroundAlternation: pickServicesCardBackgroundAlternation(
          blockBase.cardBackgroundAlternation,
          fallback.cardBackgroundAlternation
        ),
      };
      return {
        ...withoutPatch,
        ...withMigratedServicesCardBackground(
          mergeServicesCardBackgroundSettings(fallback, withoutPatch)
        ),
      };
    }
    const blockRecord = blockPatch as Partial<PortfolioServicesBlockSettings>;
    const mergedBlock = { ...fallback, ...blockBase, ...blockRecord };
    const rawGalleryLayout = (blockPatch as Record<string, unknown>).galleryLayout;
    return {
      ...mergedBlock,
      galleryLayout:
        kind === 'services'
          ? normalizeServicesGalleryLayoutValue(
              rawGalleryLayout,
              fallback.galleryLayout,
              'services'
            )
          : normalizeServicesGalleryLayoutValue(
              rawGalleryLayout,
              fallback.galleryLayout,
              'skills'
            ),
      ...withMigratedServicesCardBackground(
        mergeServicesCardBackgroundSettings(fallback, mergedBlock)
      ),
      cardBorderOpacity: clampCardDesignIntensity(
        mergedBlock.cardBorderOpacity,
        fallback.cardBorderOpacity ?? 100
      ),
      cardBackgroundAlternation: pickServicesCardBackgroundAlternation(
        blockRecord.cardBackgroundAlternation ?? blockBase.cardBackgroundAlternation,
        fallback.cardBackgroundAlternation
      ),
    };
  };

  const mergeDistinctHeader = (
    headerBase: PortfolioServicesDistinctHeaderSettings,
    headerPatch: unknown
  ): PortfolioServicesDistinctHeaderSettings => {
    if (!headerPatch || typeof headerPatch !== 'object') return headerBase;
    const headerRecord = headerPatch as Record<string, unknown>;
    return {
      titlePreset: pick(
        headerRecord.titlePreset,
        ['services-skills', 'expertise', 'what-i-offer', 'skills-services', 'custom'],
        headerBase.titlePreset
      ),
      titleCustom:
        typeof headerRecord.titleCustom === 'string' ? headerRecord.titleCustom : headerBase.titleCustom,
      subtitlePreset: pick(
        headerRecord.subtitlePreset,
        ['default', 'short', 'collaboration', 'craft', 'minimal', 'custom'],
        headerBase.subtitlePreset
      ),
      subtitleCustom:
        typeof headerRecord.subtitleCustom === 'string'
          ? headerRecord.subtitleCustom
          : headerBase.subtitleCustom,
      titleFont: pick(headerRecord.titleFont, ['sans', 'serif', 'display'], headerBase.titleFont),
      subtitleFont: pick(headerRecord.subtitleFont, ['sans', 'serif', 'display'], headerBase.subtitleFont),
      titleColor: sanitizeHex(headerRecord.titleColor, headerBase.titleColor),
      subtitleColor: sanitizeHex(headerRecord.subtitleColor, headerBase.subtitleColor),
      headerAlignment: pick(headerRecord.headerAlignment, ['left', 'center'], headerBase.headerAlignment),
      sectionLayout: pick(
        headerRecord.sectionLayout,
        ['stacked', 'aside-left', 'aside-right'],
        headerBase.sectionLayout ?? 'stacked'
      ),
    };
  };

  const merged: PortfolioServicesPresentationSettings = {
    ...mergedPresentation,
    skillsBlock: mergeBlock(base.skillsBlock, record.skillsBlock, 'skills'),
    servicesBlock: mergeBlock(base.servicesBlock, record.servicesBlock, 'services'),
    skillsHeader: mergeDistinctHeader(
      base.skillsHeader ?? createDefaultDistinctHeaderSettings('skills'),
      record.skillsHeader
    ),
    servicesHeader: mergeDistinctHeader(
      base.servicesHeader ?? createDefaultDistinctHeaderSettings('services'),
      record.servicesHeader
    ),
    servicesCardChromeVersion:
      typeof (record as { servicesCardChromeVersion?: unknown }).servicesCardChromeVersion ===
      'number'
        ? (record as { servicesCardChromeVersion: number }).servicesCardChromeVersion
        : 0,
    servicesGalleryLayoutPresets: mergeServicesGalleryLayoutPresets(
      base.servicesGalleryLayoutPresets,
      (record as { servicesGalleryLayoutPresets?: unknown }).servicesGalleryLayoutPresets
    ),
  };

  // One-time migration: horizontal card chrome + grid / 3 columns for card / tier / plan.
  const chromeVersion = merged.servicesCardChromeVersion ?? 0;
  let migrated = merged;
  if (chromeVersion < SERVICES_VERTICAL_CARD_CHROME_VERSION) {
    const presets = { ...(merged.servicesGalleryLayoutPresets ?? {}) };
    // Keep Carte horizontal description, filled CTA, and principal checked bullets.
    presets.card = {
      ...presets.card,
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
      showServiceDescription: true,
      ctaDesign: 'pill-accent',
      ctaAlignment: 'left',
      cardMaxWidth: SERVICES_HORIZONTAL_CARD_MAX_WIDTH,
      servicesTaskBulletStyle: 'check-circle-fill',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      elementStyles: servicesVerticalCardElementStyles(
        (presets.card?.elementStyles as PortfolioServicesElementStyles | undefined) ??
          merged.elementStyles
      ),
      servicesColorBindings: {
        ...DEFAULT_SERVICES_COLOR_BINDINGS,
        ...presets.card?.servicesColorBindings,
        ctaAccent: 'principal',
        ctaBorder: 'principal',
        tasksBullet: 'principal',
      },
    };
    // Offre / Tarif only: filled card surface + filled CTA + Carte horizontal type scale.
    presets.tier = {
      ...presets.tier,
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
      ctaDesign: 'pill-accent',
      cardMaxWidth: SERVICES_HORIZONTAL_CARD_MAX_WIDTH,
      showServiceDescription: true,
      servicePricePeriodSuffix: '',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      elementStyles: servicesVerticalCardElementStyles(
        (presets.tier?.elementStyles as PortfolioServicesElementStyles | undefined) ??
          merged.elementStyles
      ),
    };
    // Plan tarifaire: same type scale + filled background (light + dark).
    presets.plan = {
      ...presets.plan,
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
      cardMaxWidth: SERVICES_HORIZONTAL_CARD_MAX_WIDTH,
      showServiceDescription: false,
      showServiceTasks: true,
      ctaDesign: 'pill-accent',
      servicesTaskBulletStyle: 'check-circle',
      servicesTaskBulletSource: 'section',
      servicePricePeriodSuffix: '',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      elementStyles: servicesVerticalCardElementStyles(
        (presets.plan?.elementStyles as PortfolioServicesElementStyles | undefined) ??
          merged.elementStyles
      ),
      servicesColorBindings: {
        ...DEFAULT_SERVICES_COLOR_BINDINGS,
        ...presets.plan?.servicesColorBindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
    };
    // Plan en colonnes: full-width bandeau + filled surface.
    presets['plan-split'] = {
      ...presets['plan-split'],
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
      servicesColumns: 1,
      cardMaxWidth: 'full',
      cardAlignment: 'center',
      cardPadding: 'lg',
      showServiceDescription: true,
      showServiceTasks: true,
      ctaDesign: 'pill-accent',
      ctaLabel: presets['plan-split']?.ctaLabel === 'Start Free Trial'
        ? 'Get started'
        : (presets['plan-split']?.ctaLabel ?? 'Get started'),
      servicePricePeriodSuffix:
        typeof presets['plan-split']?.servicePricePeriodSuffix === 'string'
          ? presets['plan-split'].servicePricePeriodSuffix
          : '/ month',
      servicesTaskBulletStyle: 'check-circle',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      elementStyles: servicesVerticalCardElementStyles(
        (presets['plan-split']?.elementStyles as PortfolioServicesElementStyles | undefined) ??
          merged.elementStyles
      ),
      servicesColorBindings: {
        ...DEFAULT_SERVICES_COLOR_BINDINGS,
        ...presets['plan-split']?.servicesColorBindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
    };
    // Liste / menu: same width + full description as Carte horizontal.
    presets.list = {
      ...presets.list,
      ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
      cardMaxWidth: 'md',
      showServiceDescription: true,
      showServiceDelivery: true,
      cardBackgroundEnabled: false,
      servicePricePeriodSuffix: '',
    };
    // Clear leaked fill from Offre / Tarif on layouts that stay border-only.
    for (const layout of SERVICES_GALLERY_LAYOUT_VALUES) {
      if (servicesLayoutUsesFilledCardFrame(layout)) continue;
      if (!presets[layout]) continue;
      const keepPeriod = layout === 'plan-split';
      presets[layout] = {
        ...presets[layout],
        ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
        cardBackgroundEnabled: false,
        ...(keepPeriod ? {} : { servicePricePeriodSuffix: '' }),
      };
    }
    // Liste commerciale: wider card + filled surface by default.
    presets['commercial-list'] = {
      ...presets['commercial-list'],
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
      cardMaxWidth:
        presets['commercial-list']?.cardMaxWidth === 'xl' ||
        presets['commercial-list']?.cardMaxWidth === 'full'
          ? presets['commercial-list'].cardMaxWidth
          : 'xl',
      cardAlignment: presets['commercial-list']?.cardAlignment ?? 'center',
      commercialPriceWidthPx: presets['commercial-list']?.commercialPriceWidthPx ?? 200,
      commercialCtaWidthPx: presets['commercial-list']?.commercialCtaWidthPx ?? 210,
      commercialColumnGapPx: presets['commercial-list']?.commercialColumnGapPx ?? 48,
      ctaDesign: 'pill-accent',
      servicesTaskBulletStyle: 'check',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: 24,
      servicesTaskBulletWeight: 'bold',
    };

    if (
      merged.servicesGalleryLayout === 'card' ||
      merged.servicesGalleryLayout === 'tier' ||
      merged.servicesGalleryLayout === 'plan'
    ) {
      const layoutDefaults = applyServicesHorizontalCardDesignDefaults(
        merged.servicesGalleryLayout,
        merged
      );
      const afterDefaults = {
        ...merged,
        ...layoutDefaults,
        servicePricePeriodSuffix: '',
        servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
        servicesGalleryLayoutPresets: presets,
      } as PortfolioServicesPresentationSettings;
      migrated = {
        ...afterDefaults,
        servicesGalleryLayoutPresets: {
          ...presets,
          [merged.servicesGalleryLayout]: captureServicesGalleryLayoutPreset(afterDefaults),
        },
      };
    } else if (merged.servicesGalleryLayout === 'plan-split') {
      migrated = {
        ...merged,
        ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
        cardBackgroundEnabled: true,
        cardBackgroundFill: 'solid',
        servicesColumns: 1,
        cardMaxWidth:
          merged.cardMaxWidth === 'full' || merged.cardMaxWidth === 'xl'
            ? merged.cardMaxWidth
            : 'full',
        cardAlignment: merged.cardAlignment || 'center',
        cardPadding: 'lg',
        showServiceDescription: true,
        showServiceTasks: true,
        ctaDesign: 'pill-accent',
        ctaLabel:
          merged.ctaLabel === 'Start Free Trial' || !merged.ctaLabel?.trim()
            ? 'Get started'
            : merged.ctaLabel,
        servicePricePeriodSuffix:
          typeof merged.servicePricePeriodSuffix === 'string'
            ? merged.servicePricePeriodSuffix
            : '/ month',
        servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
        servicesGalleryLayoutPresets: {
          ...presets,
          'plan-split': {
            ...presets['plan-split'],
            servicesColumns: 1,
            cardMaxWidth: 'full',
            ctaLabel: 'Get started',
            cardBackgroundEnabled: true,
            cardBackgroundFill: 'solid',
          },
        },
        servicesBlock: {
          ...merged.servicesBlock,
          ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
          cardBackgroundEnabled: true,
          columns: 1,
          galleryLayout: 'plan-split',
        },
      };
    } else if (merged.servicesGalleryLayout === 'commercial-list') {
      migrated = {
        ...merged,
        ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
        cardBackgroundEnabled: true,
        cardBackgroundFill: 'solid',
        servicePricePeriodSuffix: '',
        cardMaxWidth:
          merged.cardMaxWidth === 'full' || merged.cardMaxWidth === 'lg'
            ? 'xl'
            : merged.cardMaxWidth || 'xl',
        cardAlignment: merged.cardAlignment || 'center',
        commercialPriceWidthPx: merged.commercialPriceWidthPx || 200,
        commercialCtaWidthPx: merged.commercialCtaWidthPx || 210,
        commercialColumnGapPx: merged.commercialColumnGapPx || 48,
        ctaDesign: 'pill-accent',
        servicesTaskBulletStyle: 'check',
        servicesTaskBulletSource: 'section',
        servicesTaskBulletSize: 'custom',
        servicesTaskBulletSizePx: 24,
        servicesTaskBulletWeight: 'bold',
        servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
        servicesGalleryLayoutPresets: {
          ...presets,
          'commercial-list': {
            ...presets['commercial-list'],
            cardBackgroundEnabled: true,
            cardBackgroundFill: 'solid',
          },
        },
        servicesBlock: {
          ...merged.servicesBlock,
          ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
          cardBackgroundEnabled: true,
        },
      };
    } else if (merged.servicesGalleryLayout === 'list') {
      migrated = {
        ...merged,
        ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
        cardMaxWidth: 'md',
        showServiceDescription: true,
        showServiceDelivery: true,
        servicePricePeriodSuffix: '',
        servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
        servicesGalleryLayoutPresets: {
          ...presets,
          list: {
            ...presets.list,
            cardMaxWidth: 'md',
            showServiceDescription: true,
            showServiceDelivery: true,
          },
        },
        servicesBlock: {
          ...merged.servicesBlock,
          ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
        },
      };
    } else if (
      merged.servicesGalleryLayout === 'media-banner' ||
      merged.servicesGalleryLayout === 'media-checklist' ||
      merged.servicesGalleryLayout === 'card-media' ||
      merged.servicesGalleryLayout === 'media-split'
    ) {
      const mediaLayout = merged.servicesGalleryLayout;
      const bannerWidth =
        mediaLayout === 'media-banner'
          ? merged.cardMaxWidth === 'xl' ||
            merged.cardMaxWidth === 'lg' ||
            merged.cardMaxWidth === 'md' ||
            merged.cardMaxWidth === 'sm'
            ? merged.cardMaxWidth
            : SERVICES_MEDIA_BANNER_DEFAULT_MAX_WIDTH
          : mediaLayout === 'media-checklist'
            ? ('full' as const)
            : mediaLayout === 'media-split'
              ? merged.cardMaxWidth === 'full' ||
                merged.cardMaxWidth === 'xl' ||
                merged.cardMaxWidth === 'lg' ||
                merged.cardMaxWidth === 'md' ||
                merged.cardMaxWidth === 'sm'
                ? merged.cardMaxWidth
                : ('xl' as const)
              : merged.cardMaxWidth === 'full' ||
                  merged.cardMaxWidth === 'xl' ||
                  merged.cardMaxWidth === 'lg' ||
                  merged.cardMaxWidth === 'md' ||
                  merged.cardMaxWidth === 'sm'
                ? merged.cardMaxWidth
                : ('full' as const);
      migrated = {
        ...merged,
        ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
        cardBackgroundEnabled: true,
        cardBackgroundFill: 'solid',
        cardBorder: 'none',
        servicesColumns: 1,
        cardMaxWidth: bannerWidth,
        cardAlignment:
          merged.cardAlignment === 'left' ||
          merged.cardAlignment === 'center' ||
          merged.cardAlignment === 'right'
            ? merged.cardAlignment
            : ('center' as const),
        ...(mediaLayout === 'media-checklist'
          ? {
              showServiceCta: true as const,
              showServiceDescription: false as const,
              showServicePrice: false as const,
              showServiceDelivery: false as const,
            }
          : mediaLayout === 'media-banner'
            ? { showServiceCta: true as const }
            : mediaLayout === 'media-split'
              ? {
                  showServiceCta: false as const,
                  showServiceDescription: true as const,
                  showServicePrice: true as const,
                  showServiceDelivery: true as const,
                }
              : {}),
        servicePricePeriodSuffix: '',
        servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
        servicesGalleryLayoutPresets: {
          ...presets,
          [mediaLayout]: {
            ...presets[mediaLayout],
            cardMaxWidth: bannerWidth,
            cardAlignment: 'center',
            cardBackgroundEnabled: true,
            cardBackgroundFill: 'solid',
            cardBorder: 'none',
            servicesColumns: 1,
          },
        },
        servicesBlock: {
          ...merged.servicesBlock,
          ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
          cardBackgroundEnabled: true,
          cardBorder: 'none',
          columns: 1,
          galleryLayout: mediaLayout,
        },
      };
    } else {
      migrated = {
        ...merged,
        ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
        servicePricePeriodSuffix: '',
        servicesCardChromeVersion: SERVICES_VERTICAL_CARD_CHROME_VERSION,
        servicesGalleryLayoutPresets: presets,
        servicesBlock: {
          ...merged.servicesBlock,
          ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
        },
      };
    }
  }

  if (migrated.useHeroPalette === false) {
    return migrated;
  }

  return {
    ...migrated,
    ...(applyServicesPaletteToSettings(migrated) as Partial<PortfolioServicesPresentationSettings>),
    useHeroPalette: true,
  };
}
