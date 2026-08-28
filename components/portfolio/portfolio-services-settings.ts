import type { CSSProperties } from 'react';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import {
  DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
  DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B,
  mergeServicesCardBackgroundSettings,
  withMigratedServicesCardBackground,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  DEFAULT_SERVICES_CARD_DECOR_SETTINGS,
  mergeServicesCardDecorSettings,
  type PortfolioServicesCardDecorSettings,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import {
  createElementTextStyle,
  ELEMENT_TEXT_SIZE_PRESET_PX,
  ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT,
  normalizeElementStylesRecord,
  patchElementStylesRecord,
  type PortfolioElementTextStyle,
  type PortfolioToolsIconSize,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  normalizePortfolioWorkCtaIcon,
  type PortfolioWorkCtaIcon,
  type PortfolioWorkCtaIconPosition,
} from '@/components/portfolio/portfolio-work-cta-icons';

export type {
  PortfolioWorkCtaIcon as PortfolioServicesCtaIcon,
  PortfolioWorkCtaIconPosition as PortfolioServicesCtaIconPosition,
} from '@/components/portfolio/portfolio-work-cta-icons';
export {
  PORTFOLIO_WORK_CTA_ICON_OPTIONS as PORTFOLIO_SERVICES_CTA_ICON_OPTIONS,
  PORTFOLIO_WORK_CTA_ICON_POSITION_OPTIONS as PORTFOLIO_SERVICES_CTA_ICON_POSITION_OPTIONS,
} from '@/components/portfolio/portfolio-work-cta-icons';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_LIST_MARKER_COLOR,
  isPortfolioListMarkerSize,
  isPortfolioListMarkerSource,
  isPortfolioListMarkerStyle,
  isPortfolioListMarkerWeight,
  clampListMarkerSizePx,
  clampListMarkerWeightAmount,
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  PORTFOLIO_LIST_MARKER_STYLE_OPTIONS,
  type PortfolioListMarkerSize,
  type PortfolioListMarkerSource,
  type PortfolioListMarkerStyle,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';
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
export type PortfolioServicesSectionLayout = 'stacked' | 'aside-left' | 'aside-right';
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
export type PortfolioServicesStageChromeSettings = {
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
export type PortfolioServicesStyleTarget =
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
export type PortfolioServicesElementChromeId =
  | 'cardTitle'
  | 'cardBody'
  | 'skillTitle'
  | 'skillBody'
  | 'price'
  | 'delivery'
  | 'tasks';

export type PortfolioServicesElementChromeSettings = {
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

export const DEFAULT_SERVICES_TASK_BULLET_COLOR = '#10b981';
export const SERVICES_ELEMENT_CHROME_IDS: PortfolioServicesElementChromeId[] = [
  'cardTitle',
  'cardBody',
  'skillTitle',
  'skillBody',
  'price',
  'delivery',
  'tasks',
];

export const DEFAULT_SERVICES_ELEMENT_CHROME: PortfolioServicesElementChromeSettings = {
  enabled: false,
  backgroundEnabled: true,
  backgroundColor: '#fafafa',
  border: 'none',
  borderColor: '#e5e5e5',
  borderRadius: 'md',
  padding: 'sm',
  margin: 'none',
};

export const DEFAULT_SERVICES_ELEMENT_CHROMES: PortfolioServicesElementChromes = {
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
  sectionOrganization: PortfolioServicesSectionOrganization;
  layoutMode: PortfolioServicesLayoutMode;
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

export const DEFAULT_SERVICES_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_SERVICES_SUBTITLE_COLOR = '#737373';
export const DEFAULT_SERVICES_ACCENT_COLOR = '#f97316';
export const DEFAULT_SERVICES_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR = '#fafafa';
export const DEFAULT_SERVICES_STAGE_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_SERVICES_STAGE_PATTERN_COLOR = '#a3a3a3';

/** Defaults matching the previous hardcoded framed stage shell. */
export const DEFAULT_SERVICES_STAGE_CHROME: PortfolioServicesStageChromeSettings = {
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

/** Apply stage-design presets so Soft / Framed keep expected looks when switching. */
export function stageChromePresetForDesign(
  design: PortfolioServicesStageDesign
): Partial<PortfolioServicesStageChromeSettings> {
  switch (design) {
    case 'soft':
      return {
        stageBackgroundEnabled: true,
        stageBackgroundColor: DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR,
        stageBackgroundOpacity: 80,
        stageBorder: 'none',
        stageBorderColor: DEFAULT_SERVICES_ACCENT_COLOR,
        stageBorderRadius: 'xl',
        stagePadding: 'md',
        stagePattern: 'none',
        stageCorners: 'diagonal',
        stageMaxWidth: 'full',
      };
    case 'framed':
      return {
        stageBackgroundEnabled: false,
        stageBorder: 'soft',
        stageBorderColor: DEFAULT_SERVICES_STAGE_BORDER_COLOR,
        stageBorderRadius: 'xl',
        stagePadding: 'md',
        stagePattern: 'none',
        stageCorners: 'diagonal',
        stageMaxWidth: 'full',
      };
    case 'open':
    case 'none':
      return {
        stageBackgroundEnabled: false,
        stageBorder: 'none',
        stagePadding: 'none',
        stagePattern: 'none',
        stageBorderRadius: 'none',
        stageCorners: 'none',
        stageMaxWidth: 'full',
      };
  }
}

export function servicesStageChromeIsActive(chrome: PortfolioServicesStageChromeSettings): boolean {
  return (
    chrome.stageBackgroundEnabled ||
    chrome.stageBorder !== 'none' ||
    chrome.stagePattern !== 'none' ||
    chrome.stagePadding !== 'none' ||
    (chrome.stageCorners != null && chrome.stageCorners !== 'none')
  );
}
export const DEFAULT_SERVICES_CARD_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_SERVICES_BODY_COLOR = '#737373';
export const DEFAULT_SERVICES_SUBHEADING_COLOR = '#a3a3a3';

/** Defaults tuned to match the current editorial card look (title/body/price/delivery). */
export const DEFAULT_SERVICES_ELEMENT_STYLES: PortfolioServicesElementStyles = {
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

export const SERVICES_STYLE_TARGET_IDS: PortfolioServicesStyleTarget[] = [
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

export const PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS: {
  value: PortfolioServicesStyleTarget;
  label: string;
  description: string;
}[] = [
  {
    value: 'blockSubheading',
    label: 'Block subheading',
    description: '“Skills & tools” / “Services” small label above each block.',
  },
  { value: 'cardTitle', label: 'Service title', description: 'Title text on service cards.' },
  { value: 'cardBody', label: 'Service description', description: 'Description text on service cards.' },
  { value: 'price', label: 'Price', description: 'Price amount shown on service cards.' },
  { value: 'delivery', label: 'Delivery', description: 'Delivery time badge on service cards.' },
  { value: 'tasks', label: 'Tasks', description: 'Deliverable checklist items on service cards.' },
  { value: 'skillTitle', label: 'Skill title', description: 'Title text on skill / tool cards.' },
  { value: 'skillBody', label: 'Skill description', description: 'Description text on skill / tool cards.' },
  { value: 'cta', label: 'CTA', description: 'Label typography on the Commander / Order button.' },
];

export const PORTFOLIO_SERVICES_TASK_BULLET_STYLE_OPTIONS = PORTFOLIO_LIST_MARKER_STYLE_OPTIONS;

export function resolveServicesTaskBulletColor(
  presentation: Pick<PortfolioServicesPresentationSettings, 'servicesTaskBulletColor'>
): string {
  return sanitizeHex(presentation.servicesTaskBulletColor, DEFAULT_SERVICES_TASK_BULLET_COLOR);
}

export function resolveServicesTaskBulletSource(
  _presentation?: Pick<
    PortfolioServicesPresentationSettings,
    'servicesTaskBulletSource' | 'servicesTaskBulletStyle'
  >
): PortfolioListMarkerSource {
  // Global task-list bullets were removed — Services always uses section markers.
  return 'section';
}

export function isPortfolioServicesTaskBulletStyle(
  value: unknown
): value is PortfolioServicesTaskBulletStyle {
  return isPortfolioListMarkerStyle(value);
}

export function normalizeServicesElementStyles(raw: unknown): PortfolioServicesElementStyles {
  return normalizeElementStylesRecord(raw, DEFAULT_SERVICES_ELEMENT_STYLES, SERVICES_STYLE_TARGET_IDS);
}

export function mergeServicesElementChrome(
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

export function mergeServicesElementChromes(
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

export function patchServicesElementChrome(
  chromes: PortfolioServicesElementChromes,
  id: PortfolioServicesElementChromeId,
  patch: Partial<PortfolioServicesElementChromeSettings>
): PortfolioServicesElementChromes {
  return {
    ...chromes,
    [id]: mergeServicesElementChrome(chromes[id] ?? DEFAULT_SERVICES_ELEMENT_CHROME, {
      ...(chromes[id] ?? DEFAULT_SERVICES_ELEMENT_CHROME),
      ...patch,
    }),
  };
}

function servicesElementChromeMarginClass(margin: PortfolioServicesCardPadding): string {
  switch (margin) {
    case 'sm':
      return 'my-1';
    case 'md':
      return 'my-2';
    case 'lg':
      return 'my-3';
    default:
      return '';
  }
}

/** Class names for a per-element chrome surface (when enabled). */
export function servicesElementChromeClass(
  chrome: PortfolioServicesElementChromeSettings | undefined
): string {
  if (!chrome?.enabled) return '';
  const parts = [
    'w-full min-w-0',
    servicesCardRadiusClass(chrome.borderRadius),
    servicesCardPaddingClass(chrome.padding),
    servicesElementChromeMarginClass(chrome.margin),
  ];
  if (chrome.border !== 'none') {
    parts.push(servicesCardBorderWidthClass(chrome.border));
    if (chrome.border === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function servicesElementChromeStyle(
  chrome: PortfolioServicesElementChromeSettings | undefined,
  accentColor?: string
): CSSProperties | undefined {
  if (!chrome?.enabled) return undefined;
  const style: CSSProperties = {};
  if (chrome.backgroundEnabled) {
    style.backgroundColor = sanitizeHex(chrome.backgroundColor, '#fafafa');
  }
  if (chrome.border === 'accent') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(accentColor, DEFAULT_SERVICES_ACCENT_COLOR);
  } else if (chrome.border !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.borderColor, DEFAULT_SERVICES_CARD_BORDER_COLOR);
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

export const DEFAULT_SERVICES_CARD_INK_STRONG_A = '#15151a';
export const DEFAULT_SERVICES_CARD_INK_MUTED_A = '#65656d';
export const DEFAULT_SERVICES_CARD_INK_STRONG_B = '#f4f3ef';
export const DEFAULT_SERVICES_CARD_INK_MUTED_B = '#e8ddd2';

export const PORTFOLIO_SERVICES_CARD_TEXT_CONTRAST_OPTIONS: {
  value: PortfolioServicesCardTextContrast;
  label: string;
  description: string;
}[] = [
  {
    value: 'auto',
    label: 'Contraste auto',
    description: 'Texte clair ou foncé selon la luminance du fond de chaque carte.',
  },
  {
    value: 'pair-ab',
    label: 'Couleurs A / B',
    description: 'Deux paires de texte : cartes claires (A) et cartes alternées (B).',
  },
];

export function pickServicesCardTextContrast(
  value: unknown,
  fallback: PortfolioServicesCardTextContrast = 'auto'
): PortfolioServicesCardTextContrast {
  return value === 'pair-ab' || value === 'auto' ? value : fallback;
}

export function patchServicesElementStyle(
  styles: PortfolioServicesElementStyles,
  target: PortfolioServicesStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioServicesElementStyles {
  return patchElementStylesRecord(
    styles,
    target,
    patch,
    DEFAULT_SERVICES_ELEMENT_STYLES,
    SERVICES_STYLE_TARGET_IDS
  );
}

export function resolveServicesSkillsSubheadingLabel(
  settings: Pick<PortfolioServicesPresentationSettings, 'skillsSubheadingLabel'>
): string {
  return settings.skillsSubheadingLabel.trim() || 'Skills & tools';
}

export function resolveServicesServicesSubheadingLabel(
  settings: Pick<PortfolioServicesPresentationSettings, 'servicesSubheadingLabel'>
): string {
  return settings.servicesSubheadingLabel.trim() || 'Services';
}

export const DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES: PortfolioServicesCardDesignIntensities = {
  editorial: 65,
  minimal: 55,
  compact: 60,
  glass: 70,
  frost: 70,
  accent: 65,
};

export const DEFAULT_SERVICES_CARD_DESIGN_TINTS: PortfolioServicesCardDesignTints = {
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

export function snapshotServicesBlocksFromSection(
  services: PortfolioServicesSectionSettings
): Pick<PortfolioServicesSectionSettings, 'skillsBlock' | 'servicesBlock'> {
  return {
    skillsBlock: createDefaultServicesBlockSettings('skills', services),
    servicesBlock: createDefaultServicesBlockSettings('services', services),
  };
}

function mapCombinedTitleToSkillsPreset(
  preset: PortfolioServicesTitlePreset
): PortfolioServicesTitlePreset {
  switch (preset) {
    case 'skills-services':
      return 'skills-services';
    case 'expertise':
      return 'expertise';
    case 'what-i-offer':
      return 'expertise';
    default:
      return 'services-skills';
  }
}

function mapCombinedTitleToServicesPreset(
  preset: PortfolioServicesTitlePreset
): PortfolioServicesTitlePreset {
  switch (preset) {
    case 'what-i-offer':
      return 'what-i-offer';
    case 'expertise':
      return 'expertise';
    case 'skills-services':
      return 'services-skills';
    default:
      return 'services-skills';
  }
}

function mapCombinedSubtitleToSkillsPreset(
  preset: PortfolioServicesSubtitlePreset
): PortfolioServicesSubtitlePreset {
  if (preset === 'collaboration') return 'short';
  if (preset === 'default') return 'craft';
  return preset === 'custom' || preset === 'minimal' || preset === 'short' || preset === 'craft'
    ? preset
    : 'craft';
}

function mapCombinedSubtitleToServicesPreset(
  preset: PortfolioServicesSubtitlePreset
): PortfolioServicesSubtitlePreset {
  if (preset === 'craft') return 'collaboration';
  if (preset === 'default') return 'collaboration';
  return preset === 'custom' || preset === 'minimal' || preset === 'short' || preset === 'collaboration'
    ? preset
    : 'collaboration';
}

export function snapshotServicesHeadersFromSection(
  services: PortfolioServicesSectionSettings
): Pick<
  PortfolioServicesSectionSettings,
  'skillsHeader' | 'servicesHeader' | 'showSkillsSubheading' | 'showServicesSubheading'
> {
  return {
    skillsHeader: {
      ...createDefaultDistinctHeaderSettings('skills'),
      titlePreset: mapCombinedTitleToSkillsPreset(services.titlePreset),
      titleCustom: services.titlePreset === 'custom' ? services.titleCustom : '',
      subtitlePreset: mapCombinedSubtitleToSkillsPreset(services.subtitlePreset),
      subtitleCustom: services.subtitlePreset === 'custom' ? services.subtitleCustom : '',
      titleFont: services.titleFont,
      subtitleFont: services.subtitleFont,
      titleColor: services.titleColor,
      subtitleColor: services.subtitleColor,
      headerAlignment: services.headerAlignment,
    },
    servicesHeader: {
      ...createDefaultDistinctHeaderSettings('services'),
      titlePreset: mapCombinedTitleToServicesPreset(services.titlePreset),
      titleCustom: services.titlePreset === 'custom' ? services.titleCustom : '',
      subtitlePreset: mapCombinedSubtitleToServicesPreset(services.subtitlePreset),
      subtitleCustom: services.subtitlePreset === 'custom' ? services.subtitleCustom : '',
      titleFont: services.titleFont,
      subtitleFont: services.subtitleFont,
      titleColor: services.titleColor,
      subtitleColor: services.subtitleColor,
      headerAlignment: services.headerAlignment,
    },
    showSkillsSubheading: false,
    showServicesSubheading: false,
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
  sectionOrganization: 'distinct' as const,
  layoutMode: 'separated' as const,
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

export const PORTFOLIO_SERVICES_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Services & skills', description: 'Default balanced label.' },
  { value: 'expertise', label: 'Expertise', description: 'Short and professional.' },
  { value: 'what-i-offer', label: 'What I offer', description: 'Client-friendly wording.' },
  { value: 'skills-services', label: 'Skills & services', description: 'Tools first, services second.' },
  { value: 'custom', label: 'Custom', description: 'Your own section title.' },
];

export const PORTFOLIO_SERVICES_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  { value: 'short', label: 'Short', description: 'One concise supporting line.' },
  { value: 'collaboration', label: 'Collaboration', description: 'Emphasizes partnership and delivery.' },
  { value: 'craft', label: 'Craft focus', description: 'Highlights tools, process, and quality.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SKILLS_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Skills & tools', description: 'Titre affiché : SKILLS & TOOLS' },
  { value: 'expertise', label: 'Expertise', description: 'Titre affiché : EXPERTISE' },
  { value: 'skills-services', label: 'Stack technique', description: 'Titre affiché : SKILLS & SERVICES' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le titre principal vous-même.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS: {
  value: PortfolioServicesTitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'services-skills', label: 'Services', description: 'Titre affiché : SERVICES' },
  { value: 'what-i-offer', label: 'What I offer', description: 'Titre affiché : WHAT I OFFER' },
  { value: 'expertise', label: 'Expertise', description: 'Titre affiché : EXPERTISE' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le titre principal vous-même.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SKILLS_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'craft', label: 'Focus outils', description: 'Sous-titre sur votre stack et vos outils.' },
  { value: 'short', label: 'Court', description: 'Une ligne courte sous le titre.' },
  { value: 'minimal', label: 'Aucun sous-titre', description: 'Masquer le sous-titre de section.' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le sous-titre vous-même.' },
];

export const PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioServicesSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'collaboration', label: 'Collaboration', description: 'Sous-titre orienté accompagnement client.' },
  { value: 'short', label: 'Court', description: 'Une ligne courte sous le titre.' },
  { value: 'minimal', label: 'Aucun sous-titre', description: 'Masquer le sous-titre de section.' },
  { value: 'custom', label: 'Personnalisé', description: 'Écrivez le sous-titre vous-même.' },
];

export const PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS: {
  value: PortfolioServicesHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const PORTFOLIO_SERVICES_LAYOUT_MODE_OPTIONS: {
  value: PortfolioServicesLayoutMode;
  label: string;
  description: string;
}[] = [
  { value: 'combined', label: 'Combined frame', description: 'Skills and services inside one panel.' },
  { value: 'separated', label: 'Separated blocks', description: 'Distinct skills and services areas.' },
];

export const PORTFOLIO_SERVICES_SECTION_ORGANIZATION_OPTIONS: {
  value: PortfolioServicesSectionOrganization;
  label: string;
  description: string;
}[] = [
  {
    value: 'combined',
    label: 'Cadre combiné',
    description: 'Skills et services dans un même panneau — réglages partagés.',
  },
  {
    value: 'separated',
    label: 'Blocs séparés',
    description: 'Deux zones, un titre combiné — cadre et design indépendants par bloc.',
  },
  {
    value: 'distinct',
    label: 'Sections distinctes',
    description: 'Deux sections avec titres séparés (Skills / Services) — nav et fonds indépendants.',
  },
];

export const PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS: {
  value: PortfolioServicesDisplayMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'marquee',
    label: 'Carrousel infini',
    description: 'Défilement automatique fluide — nécessite le design « Carte horizontal ».',
  },
  {
    value: 'coverflow',
    label: 'Coverflow vertical',
    description: 'Pile centrée auto-rotative — nécessite le design « Carte horizontal ».',
  },
  {
    value: 'deck',
    label: 'Deck diagonal',
    description: 'Éventail diagonal fluide — nécessite le design « Carte horizontal ».',
  },
  { value: 'grid', label: 'Grille statique', description: 'Grille responsive sans animation.' },
  { value: 'stack', label: 'Pile verticale', description: 'Cartes pleine largeur empilées.' },
];

export const PORTFOLIO_SERVICES_MARQUEE_DIRECTION_OPTIONS: {
  value: PortfolioServicesMarqueeDirection;
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Vers la gauche',
    description: 'Le carrousel défile de droite vers la gauche.',
  },
  {
    value: 'right',
    label: 'Vers la droite',
    description: 'Le carrousel défile de gauche vers la droite.',
  },
];

export const PORTFOLIO_SERVICES_DECK_ENTRANCE_EFFECT_OPTIONS: {
  value: PortfolioServicesDeckEntranceEffect;
  label: string;
  description: string;
}[] = [
  {
    value: 'expand',
    label: 'Expand',
    description: 'Une carte seule, puis éventail fluide — toutes les cartes partent ensemble.',
  },
  {
    value: 'cascade',
    label: 'Cascade',
    description: 'Les cartes sortent une par une en diagonale (pas toutes en même temps).',
  },
  {
    value: 'none',
    label: 'None',
    description: 'Éventail déjà ouvert — pas d’effet d’entrée.',
  },
];

export const PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS: {
  value: PortfolioServicesGalleryLayout;
  label: string;
  description: string;
}[] = [
  { value: 'card', label: 'Carte horizontal', description: 'Titre, description, tâches alignées, CTA plein — 3 par ligne.' },
  {
    value: 'list',
    label: 'Liste / menu',
    description: 'Cartes premium : titre + prix à gauche, délai et action en pied.',
  },
  {
    value: 'service-selector',
    label: 'Service selector',
    description: 'Onglets verticaux et panneau détaillé avec prix, inclusions et CTA.',
  },
  {
    value: 'commercial-list',
    label: 'Liste commerciale',
    description: 'Lignes pleine largeur numérotées, prestations incluses, prix et action.',
  },
  {
    value: 'tier',
    label: 'Offre / Tarif horizontal',
    description: 'Tarif, titre encadré, tâches et CTA outline — description masquée par défaut.',
  },
  {
    value: 'plan',
    label: 'Plan tarifaire horizontal',
    description: 'Titre, description, prix, bouton puis liste — 3 par ligne par défaut.',
  },
  {
    value: 'plan-split',
    label: 'Plan en colonnes',
    description: 'Bandeau 3 colonnes : titre + description, inclusions, prix et CTA.',
  },
  {
    value: 'card-media',
    label: 'Carte média',
    description: 'Contenu à gauche (titre, tâches, prix / délai) et image de couverture à droite.',
  },
  {
    value: 'media-banner',
    label: 'Bannière média',
    description:
      'Image à gauche, contenu à droite : tags, prix, délai et CTA — style offre / formation.',
  },
  {
    value: 'media-checklist',
    label: 'Média checklist',
    description: 'Image à gauche, grand titre, tâches cochées et CTA Get started.',
  },
  {
    value: 'media-split',
    label: 'Média split',
    description:
      'Image en bandeau, titre et description à gauche, checklist et prix / délai à droite.',
  },
];

/** Skills-only layouts (includes stacked tool icons). */
export const PORTFOLIO_SKILLS_GALLERY_LAYOUT_OPTIONS: {
  value: PortfolioServicesGalleryLayout;
  label: string;
  description: string;
}[] = [
  ...PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS.filter(
    (option) =>
      option.value !== 'service-selector' &&
      option.value !== 'commercial-list' &&
      option.value !== 'tier' &&
      option.value !== 'plan' &&
      option.value !== 'plan-split' &&
      option.value !== 'card-media' &&
      option.value !== 'media-banner' &&
      option.value !== 'media-checklist' &&
      option.value !== 'media-split'
  ),
  {
    value: 'icon-stack',
    label: 'Stacked icons',
    description: 'Overlapping circular skill logos only — no cards.',
  },
  {
    value: 'pill-cloud',
    label: 'Nuage de pilules',
    description: 'Capsules compactes centrées avec pastilles aux couleurs des outils.',
  },
  {
    value: 'tool-inspector',
    label: 'Tool inspector',
    description: 'Rail d’icônes + panneau détail (niveau, cas d’usage, expérience).',
  },
];

export const PORTFOLIO_SERVICES_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioServicesSectionLayout;
  label: string;
  description: string;
}[] = [
  { value: 'stacked', label: 'Empilé', description: 'Titre au-dessus du contenu.' },
  { value: 'aside-left', label: 'Titre à gauche', description: 'Titre et contenu côte à côte.' },
  { value: 'aside-right', label: 'Titre à droite', description: 'Contenu à gauche, titre à droite.' },
];

export const PORTFOLIO_SKILLS_INSPECTOR_ILLUSTRATION_OPTIONS: {
  value: PortfolioSkillsInspectorIllustrationVariant;
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

export const PORTFOLIO_SKILLS_INSPECTOR_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioSkillsInspectorIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche de l’inspecteur.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite de l’inspecteur.' },
];

export const PORTFOLIO_SERVICES_ILLUSTRATION_OPTIONS: {
  value: PortfolioServicesIllustrationVariant;
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

export const PORTFOLIO_SERVICES_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioServicesIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche du contenu.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite du contenu.' },
];

export function isPortfolioServicesSectionLayout(
  value: unknown
): value is PortfolioServicesSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function servicesSectionLayoutIsAside(
  layout: PortfolioServicesSectionLayout | undefined
): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

export const SKILLS_INSPECTOR_ICON_GAP_PX_MIN = 0;
export const SKILLS_INSPECTOR_ICON_GAP_PX_MAX = 40;

export function clampSkillsInspectorIconGapPx(value: unknown, fallback = 12): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(
    SKILLS_INSPECTOR_ICON_GAP_PX_MIN,
    Math.min(SKILLS_INSPECTOR_ICON_GAP_PX_MAX, Math.round(parsed))
  );
}

export const PORTFOLIO_SERVICES_CTA_DESIGN_OPTIONS: {
  value: PortfolioServicesCtaDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'circle-icon',
    label: 'Circle icon',
    description: 'Label + cercle flèche — bordure et hover sur l’icône.',
  },
  {
    value: 'pill-dark',
    label: 'Dark pill',
    description: 'Capsule remplie (accent) — bordure et hover configurables.',
  },
  {
    value: 'pill-outline',
    label: 'Outline pill',
    description: 'Capsule à contour — au survol, fond hover + texte.',
  },
  {
    value: 'pill-accent',
    label: 'Accent pill',
    description: 'Capsule accent vive — comme View project du Portfolio.',
  },
  {
    value: 'text-arrow',
    label: 'Text + arrow',
    description: 'Lien minimal — soulignement et couleurs au survol.',
  },
];

export const PORTFOLIO_SERVICES_CTA_BORDER_WIDTH_OPTIONS: {
  value: PortfolioServicesCtaBorderWidth;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Pas de contour sur le bouton.' },
  { value: 'thin', label: 'Fine', description: 'Contour léger (1px).' },
  { value: 'medium', label: 'Moyenne', description: 'Contour marqué (2px).' },
  { value: 'thick', label: 'Épaisse', description: 'Contour fort (3px).' },
];

export const PORTFOLIO_SERVICES_CTA_BORDER_RADIUS_OPTIONS: {
  value: PortfolioServicesCtaBorderRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Carré', description: 'Coins droits.' },
  { value: 'sm', label: 'Léger', description: 'Arrondi subtil.' },
  { value: 'md', label: 'Moyen', description: 'Arrondi équilibré.' },
  { value: 'lg', label: 'Large', description: 'Coins bien arrondis.' },
  { value: 'full', label: 'Pilule', description: 'Capsule complètement ronde (défaut).' },
];

export const PORTFOLIO_SERVICES_CTA_ALIGNMENT_OPTIONS: {
  value: PortfolioServicesCtaAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Bouton aligné à gauche.' },
  { value: 'center', label: 'Centre', description: 'Bouton centré.' },
  { value: 'right', label: 'Droite', description: 'Bouton aligné à droite.' },
];

export function servicesCtaAlignClass(alignment: PortfolioServicesCtaAlignment): string {
  switch (alignment) {
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    default:
      return 'justify-start';
  }
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

/**
 * Bridge Services CTA settings into the Work CTA surface helpers
 * so Order / Commander matches View project styling exactly.
 * When the section palette is on, resolve CTA colors live from tokens
 * so light/dark switches never leave a stale gray fill + white label.
 */
export function servicesCtaWorkPresentation(p: PortfolioServicesPresentationSettings) {
  const paletteOn = p.useHeroPalette !== false;
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, p.servicesPalette);
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, p.servicesColorBindings);

  const accent = paletteOn
    ? resolveHeroPaletteColor(palette, bindings.ctaAccent)
    : sanitizeHex(p.ctaColor || p.cardAccentColor, DEFAULT_SERVICES_ACCENT_COLOR);
  const pageFond = paletteOn
    ? resolveHeroPaletteColor(palette, bindings.sectionBackground)
    : sanitizeHex(p.sectionBackgroundColor, '#0b0b0d');
  const hoverBg = paletteOn
    ? resolveHeroPaletteColor(palette, bindings.ctaHoverBackground)
    : sanitizeHex(p.ctaHoverBackgroundColor || accent, accent);
  const hoverText = paletteOn
    ? resolveHeroPaletteColor(palette, bindings.ctaHoverText)
    : sanitizeHex(p.ctaHoverTextColor || pageFond, pageFond);
  const hoverBorder = paletteOn
    ? resolveHeroPaletteColor(palette, bindings.ctaHoverBorder)
    : sanitizeHex(p.ctaHoverBorderColor || accent, accent);

  return {
    ctaColor: accent,
    // Outline CTAs need border = principal too (not bordure gray).
    ctaBorderColor: accent,
    ctaBorderWidth: p.ctaBorderWidth,
    ctaBorderRadius: p.ctaBorderRadius,
    ctaHoverEnabled: p.ctaHoverEnabled !== false,
    ctaHoverBackgroundColor: hoverBg,
    ctaHoverTextColor: hoverText,
    ctaHoverBorderColor: hoverBorder,
    ctaShowIcon: p.ctaShowIcon !== false,
    ctaIcon: normalizePortfolioWorkCtaIcon(p.ctaIcon, 'arrow-up-right'),
    ctaIconPosition: p.ctaIconPosition === 'left' ? 'left' : 'right',
    sectionBackgroundColor: pageFond,
    elementStyles: {
      cta: (() => {
        const stored = normalizeServicesElementStyles(p.elementStyles).cta;
        return {
          ...stored,
          // Always ink from palette principal (ctaAccent) — never the stale orange default.
          color: accent,
        };
      })(),
    },
  };
}

export const PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS: {
  value: PortfolioServicesCardBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Sans bordure.' },
  { value: 'soft', label: 'Douce', description: 'Liseré fin + ombre légère.' },
  { value: 'solid', label: 'Solide', description: 'Bordure nette configurable.' },
  { value: 'accent', label: 'Accent', description: 'Bordure teintée avec la couleur accent.' },
];

export const PORTFOLIO_SERVICES_CARD_BACKGROUND_ALTERNATION_OPTIONS: {
  value: PortfolioServicesCardBackgroundAlternation;
  label: string;
  description: string;
}[] = [
  {
    value: 'uniform',
    label: 'Uniforme',
    description: 'Toutes les cartes utilisent la même couleur de fond.',
  },
  {
    value: 'alternate',
    label: 'Alterné',
    description: 'Alterne deux couleurs (A / B) d’une carte à l’autre. Nécessite un fond uni.',
  },
];

export const PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS: {
  value: PortfolioServicesCardRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Coins droits.' },
  { value: 'sm', label: 'S', description: 'Léger arrondi.' },
  { value: 'md', label: 'M', description: 'Arrondi moyen.' },
  { value: 'lg', label: 'L', description: 'Arrondi généreux.' },
  { value: 'xl', label: 'XL', description: 'Très arrondi.' },
];

export const PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS: {
  value: PortfolioServicesCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Contenu collé au bord.' },
  { value: 'sm', label: 'S', description: 'Padding serré.' },
  { value: 'md', label: 'M', description: 'Padding équilibré.' },
  { value: 'lg', label: 'L', description: 'Padding généreux.' },
];

export const PORTFOLIO_SERVICES_COLUMNS_OPTIONS: {
  value: PortfolioServicesCardColumns;
  label: string;
  description: string;
}[] = [
  { value: 1, label: '1', description: 'Une colonne — pleine largeur.' },
  { value: 2, label: '2', description: 'Deux colonnes sur grand écran.' },
  { value: 3, label: '3', description: 'Trois colonnes — dense et équilibré.' },
  { value: 4, label: '4', description: 'Quatre colonnes — très compact.' },
];

export const PORTFOLIO_SERVICES_CARD_MAX_WIDTH_OPTIONS: {
  value: PortfolioServicesCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'full', label: 'Pleine largeur', description: 'La carte remplit toute la colonne.' },
  { value: 'xl', label: 'Large', description: 'Max ~36rem — encore confortable.' },
  { value: 'lg', label: 'Carte portrait', description: 'Max ~32rem — défaut Carte / Offre / Plan.' },
  { value: 'md', label: 'Moyenne', description: 'Max ~28rem — plus compacte.' },
  { value: 'sm', label: 'Compacte', description: 'Max ~24rem — tuile étroite.' },
];

/** Liste commerciale — row widths (wider steps so price + CTA stay readable). */
export const PORTFOLIO_SERVICES_COMMERCIAL_LIST_MAX_WIDTH_OPTIONS: {
  value: PortfolioServicesCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'full', label: 'Pleine largeur', description: 'La ligne remplit toute la colonne.' },
  { value: 'xl', label: 'Très large', description: 'Max ~80rem — grand espace entre sections (défaut).' },
  { value: 'lg', label: 'Large', description: 'Max ~72rem — défaut Bannière média.' },
  { value: 'md', label: 'Moyenne', description: 'Max ~64rem — plus compacte.' },
  { value: 'sm', label: 'Compacte', description: 'Max ~56rem — ligne plus étroite.' },
];

/** Tool inspector widths — spread further apart than card tiles (~32–72rem). */
export const PORTFOLIO_SKILLS_INSPECTOR_MAX_WIDTH_OPTIONS: {
  value: PortfolioServicesCardMaxWidth;
  label: string;
  description: string;
}[] = [
  {
    value: 'full',
    label: 'Pleine largeur',
    description: 'L’inspecteur occupe toute la colonne.',
  },
  {
    value: 'xl',
    label: 'Très large',
    description: 'Max ~72rem — presque toute la section.',
  },
  {
    value: 'lg',
    label: 'Large',
    description: 'Max ~56rem — rail + détail confortables.',
  },
  {
    value: 'md',
    label: 'Moyenne',
    description: 'Max ~42rem — largeur de lecture.',
  },
  {
    value: 'sm',
    label: 'Étroite',
    description: 'Max ~32rem — bloc compact.',
  },
];

export const PORTFOLIO_SERVICES_CARD_ALIGNMENT_OPTIONS: {
  value: PortfolioServicesCardAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Place le cadre à gauche de la colonne.' },
  { value: 'center', label: 'Centre', description: 'Centre le cadre dans la colonne.' },
  { value: 'right', label: 'Droite', description: 'Place le cadre à droite de la colonne.' },
];

export const PORTFOLIO_SKILLS_INSPECTOR_ALIGNMENT_OPTIONS: {
  value: PortfolioServicesCardAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Colle l’inspecteur à gauche.' },
  { value: 'center', label: 'Centre', description: 'Centre l’inspecteur dans la colonne.' },
  { value: 'right', label: 'Droite', description: 'Colle l’inspecteur à droite.' },
];

export const PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS: {
  value: PortfolioServicesContentAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Éléments alignés à gauche.' },
  { value: 'center', label: 'Centre', description: 'Éléments centrés.' },
  { value: 'right', label: 'Droite', description: 'Éléments alignés à droite.' },
];

export const PORTFOLIO_SERVICES_CONTENT_GAP_OPTIONS: {
  value: Exclude<PortfolioServicesContentGap, 'custom'>;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Preset — pas d’écart entre les éléments.' },
  { value: 'sm', label: 'Serré', description: 'Preset — espacement compact.' },
  { value: 'md', label: 'Moyen', description: 'Preset — espacement équilibré (défaut).' },
  { value: 'lg', label: 'Large', description: 'Preset — plus d’air entre les blocs.' },
  { value: 'xl', label: 'Très large', description: 'Preset — espacement maximum.' },
];

/** Pixel values used by presets (and as starting points for Manual). */
export const SERVICES_CONTENT_GAP_PRESET_PX: Record<
  Exclude<PortfolioServicesContentGap, 'custom'>,
  number
> = {
  none: 0,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const SERVICES_CONTENT_GAP_PX_MIN = 0;
export const SERVICES_CONTENT_GAP_PX_MAX = 48;

export function clampServicesContentGapPx(value: unknown, fallback = 14): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    SERVICES_CONTENT_GAP_PX_MIN,
    Math.min(SERVICES_CONTENT_GAP_PX_MAX, Math.round(n))
  );
}

export const PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS: {
  value: PortfolioServicesPricePlacement;
  label: string;
  description: string;
}[] = [
  { value: 'end', label: 'À droite', description: 'Prix / livraison à côté du titre.' },
  { value: 'below', label: 'En dessous', description: 'Prix sous le texte principal.' },
  { value: 'top', label: 'En haut', description: 'Prix mis en avant avant le titre.' },
];

export const PORTFOLIO_SERVICES_PRICE_ALIGN_OPTIONS: {
  value: PortfolioServicesContentAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Prix aligné à gauche.' },
  { value: 'center', label: 'Centre', description: 'Prix centré.' },
  { value: 'right', label: 'Droite', description: 'Prix aligné à droite.' },
];

export const PORTFOLIO_SERVICES_CURRENCY_PLACEMENT_OPTIONS: {
  value: PortfolioServicesCurrencyPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'before', label: 'Devant', description: 'Symbole avant le chiffre ($50, €50).' },
  { value: 'after', label: 'Derrière', description: 'Symbole après le chiffre (50 €).' },
];

/** Format cents as a locale number string (no currency symbol). */
export function formatServicesPriceAmount(cents: number): string {
  const euros = cents / 100;
  if (!Number.isFinite(euros)) return '0';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(euros);
}

export function resolveServiceCurrencyPlacement(
  placement: PortfolioServicesCurrencyPlacement | undefined
): 'before' | 'after' {
  return placement === 'before' ? 'before' : 'after';
}

export const SERVICE_PRICE_MARGIN_PX_MIN = 0;
export const SERVICE_PRICE_MARGIN_PX_MAX = 80;

export function clampServicePriceMarginPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    SERVICE_PRICE_MARGIN_PX_MIN,
    Math.min(SERVICE_PRICE_MARGIN_PX_MAX, Math.round(n))
  );
}

export function clampCommercialLayoutPx(
  value: unknown,
  fallback: number,
  min: number,
  max: number
): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Prefix shown before the amount, or null when disabled. Empty custom text falls back to "From". */
export function resolveServicePricePrefix(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'servicePricePrefixEnabled' | 'servicePricePrefix'
  >
): string | null {
  if (!presentation.servicePricePrefixEnabled) return null;
  const custom = presentation.servicePricePrefix?.trim() ?? '';
  return custom || 'From';
}

export function servicePriceAlignClass(
  align: PortfolioServicesContentAlignment | undefined
): string {
  switch (align) {
    case 'center':
      return 'flex justify-center text-center';
    case 'right':
      return 'flex justify-end text-right';
    default:
      return 'flex justify-start text-left';
  }
}

export function servicePriceBoxStyle(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'servicePriceMarginTopPx' | 'servicePriceMarginBottomPx'
  >
): CSSProperties {
  return {
    marginTop: `${clampServicePriceMarginPx(presentation.servicePriceMarginTopPx, 0)}px`,
    marginBottom: `${clampServicePriceMarginPx(presentation.servicePriceMarginBottomPx, 0)}px`,
  };
}

const FALLBACK_SERVICES_CURRENCY_CODES = [
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'CAD',
  'AUD',
  'NZD',
  'JPY',
  'CNY',
  'HKD',
  'SGD',
  'KRW',
  'INR',
  'IDR',
  'THB',
  'MYR',
  'PHP',
  'VND',
  'AED',
  'SAR',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
  'ILS',
  'TRY',
  'RUB',
  'UAH',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'BGN',
  'SEK',
  'NOK',
  'DKK',
  'ISK',
  'BRL',
  'MXN',
  'ARS',
  'CLP',
  'COP',
  'PEN',
  'UYU',
  'ZAR',
  'NGN',
  'EGP',
  'KES',
  'GHS',
  'MAD',
  'TND',
  'DZD',
  'XOF',
  'XAF',
  'XPF',
] as const;

function listServicesCurrencyCodes(): string[] {
  try {
    const intlWithSupported = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };
    if (typeof intlWithSupported.supportedValuesOf === 'function') {
      return intlWithSupported.supportedValuesOf('currency').slice().sort((a, b) => a.localeCompare(b));
    }
  } catch {
    /* fall through */
  }
  return [...FALLBACK_SERVICES_CURRENCY_CODES];
}

/** Resolve a display symbol for an ISO 4217 currency (€, $, £, MAD…). */
export function servicesCurrencySymbol(code: string | undefined): string {
  const currency = sanitizeServicesCurrencyCode(code);
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);
    const symbol = parts.find((part) => part.type === 'currency')?.value?.trim();
    if (symbol) return symbol;
  } catch {
    /* fall through */
  }
  return currency === 'EUR' ? '€' : currency;
}

export function sanitizeServicesCurrencyCode(value: unknown, fallback = 'EUR'): string {
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

export const PORTFOLIO_SERVICES_CURRENCY_OPTIONS: {
  value: string;
  label: string;
  description: string;
}[] = (() => {
  const displayNames =
    typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
      ? new Intl.DisplayNames(['fr', 'en'], { type: 'currency' })
      : null;
  return listServicesCurrencyCodes().map((code) => {
    const symbol = servicesCurrencySymbol(code);
    const name = displayNames?.of(code) ?? code;
    return {
      value: code,
      label: `${code} · ${symbol}`,
      description: name,
    };
  });
})();

export const PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS: {
  value: PortfolioServicesIconPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'start', label: 'À gauche', description: 'Icône avant le titre (ligne).' },
  { value: 'top', label: 'Au-dessus', description: 'Icône centrée au-dessus du texte.' },
];

export const PORTFOLIO_SKILLS_ICON_RADIUS_OPTIONS: {
  value: PortfolioSkillsIconRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Carré', description: 'Aucun arrondi.' },
  { value: 'sm', label: 'S', description: 'Coins légèrement arrondis.' },
  { value: 'md', label: 'M', description: 'Arrondi moyen.' },
  { value: 'lg', label: 'L', description: 'Arrondi généreux.' },
  { value: 'xl', label: 'XL', description: 'Coins très arrondis.' },
  { value: 'full', label: 'Rond', description: 'Icône entièrement circulaire.' },
];

export const SKILLS_ICON_BORDER_WIDTH_PX_MIN = 0;
export const SKILLS_ICON_BORDER_WIDTH_PX_MAX = 8;

export function clampSkillsIconBorderWidthPx(value: unknown, fallback = 1): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(
    SKILLS_ICON_BORDER_WIDTH_PX_MAX,
    Math.max(SKILLS_ICON_BORDER_WIDTH_PX_MIN, Math.round(parsed))
  );
}

export const PORTFOLIO_SERVICES_CARD_DESIGN_OPTIONS: {
  value: PortfolioServicesCardDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Ombre portée et hover chaleureux — laisse voir le fond diagonal.',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Plat et épuré — fin liseré gris, sans ombre.',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Fond gris clair, typo serrée — idéal en grille dense.',
  },
  {
    value: 'glass',
    label: 'Glass',
    description: 'Verre dépoli, transparence et reflet teinté accent.',
  },
  {
    value: 'frost',
    label: 'Frost',
    description: 'Verre dépoli neutre — blanc pur, sans teinte chaude.',
  },
  {
    value: 'accent',
    label: 'Accent edge',
    description: 'Bandeau coloré à gauche + fond teinté accent.',
  },
];

export const PORTFOLIO_SERVICES_CARD_DESIGN_INTENSITY_HINTS: Record<
  PortfolioServicesCardDesign,
  { label: string; low: string; high: string }
> = {
  editorial: {
    label: 'Intensité du dégradé & ombre',
    low: 'Ombre légère, wash discret',
    high: 'Dégradé orange marqué, ombre profonde',
  },
  minimal: {
    label: 'Intensité du liseré',
    low: 'Bordure très fine et pâle',
    high: 'Liseré net et visible',
  },
  compact: {
    label: 'Intensité du fond gris',
    low: 'Fond presque blanc',
    high: 'Contraste gris plus fort',
  },
  glass: {
    label: 'Intensité du verre dépoli',
    low: 'Léger flou et transparence',
    high: 'Flou épais, reflet lumineux fort',
  },
  frost: {
    label: 'Intensité du verre neutre',
    low: 'Léger flou et transparence',
    high: 'Flou épais, reflet blanc fort',
  },
  accent: {
    label: 'Intensité du bandeau accent',
    low: 'Bandeau fin, teinte légère',
    high: 'Bandeau large, fond teinté marqué',
  },
};

export const PORTFOLIO_SERVICES_CARD_DESIGN_TINT_HINTS: Record<
  PortfolioServicesCardDesign,
  { label: string; low: string; high: string }
> = {
  editorial: {
    label: 'Teinte du dégradé',
    low: 'Sans wash coloré',
    high: 'Wash accent saturé',
  },
  minimal: {
    label: 'Teinte',
    low: '—',
    high: '—',
  },
  compact: {
    label: 'Teinte',
    low: '—',
    high: '—',
  },
  glass: {
    label: 'Teinte du reflet',
    low: 'Blanc pur',
    high: 'Reflet accent marqué',
  },
  frost: {
    label: 'Teinte optionnelle',
    low: 'Verre 100 % neutre',
    high: 'Légère teinte accent',
  },
  accent: {
    label: 'Teinte du fond',
    low: 'Fond presque blanc',
    high: 'Fond accent prononcé',
  },
};

export const PORTFOLIO_SERVICES_STAGE_DESIGN_OPTIONS: {
  value: PortfolioServicesStageDesign;
  label: string;
  description: string;
}[] = [
  { value: 'framed', label: 'Framed panel', description: 'Bordered container around the content.' },
  { value: 'soft', label: 'Soft panel', description: 'Light background padding without hard border.' },
  { value: 'open', label: 'Open', description: 'No outer wrapper — cards float freely.' },
  { value: 'none', label: 'None', description: 'Same as open — maximum air.' },
];

export const PORTFOLIO_SERVICES_STAGE_BORDER_OPTIONS: {
  value: PortfolioServicesStageBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Sans bordure autour du stage.' },
  { value: 'soft', label: 'Douce', description: 'Liseré fin autour du panneau.' },
  { value: 'solid', label: 'Solide', description: 'Bordure nette configurable.' },
];

export const PORTFOLIO_SERVICES_STAGE_RADIUS_OPTIONS: {
  value: PortfolioServicesStageRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Coins droits.' },
  { value: 'sm', label: 'S', description: 'Léger arrondi.' },
  { value: 'md', label: 'M', description: 'Arrondi moyen.' },
  { value: 'lg', label: 'L', description: 'Arrondi généreux.' },
  { value: 'xl', label: 'XL', description: 'Très arrondi (défaut Soft / Framed).' },
];

export const PORTFOLIO_SERVICES_STAGE_PADDING_OPTIONS: {
  value: PortfolioServicesStagePadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Contenu collé au bord du stage.' },
  { value: 'sm', label: 'S', description: 'Padding serré.' },
  { value: 'md', label: 'M', description: 'Padding équilibré (défaut).' },
  { value: 'lg', label: 'L', description: 'Padding généreux.' },
];

export const PORTFOLIO_SERVICES_STAGE_PATTERN_OPTIONS: {
  value: PortfolioServicesStagePattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Fond uni uniquement.' },
  { value: 'dots', label: 'Points', description: 'Trame de points discrète.' },
  { value: 'grid', label: 'Grille', description: 'Quadrillage léger sur le fond.' },
  { value: 'diagonal', label: 'Diagonale', description: 'Hachures diagonales.' },
];

export const PORTFOLIO_SERVICES_STAGE_CORNERS_OPTIONS: {
  value: PortfolioServicesStageCorners;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de marques dans les coins.' },
  {
    value: 'diagonal',
    label: 'Diagonale',
    description: 'Accents en haut à gauche et en bas à droite.',
  },
  { value: 'all', label: 'Quatre coins', description: 'Un accent L dans chaque coin du stage.' },
];

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

function hexWithAlpha(hex: string, alpha: number): string {
  const channel = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${sanitizeHex(hex, DEFAULT_SERVICES_ACCENT_COLOR)}${channel}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = sanitizeHex(hex, DEFAULT_SERVICES_ACCENT_COLOR).replace('#', '');
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function servicesCardDesignSupportsTint(design: PortfolioServicesCardDesign): boolean {
  return design === 'editorial' || design === 'glass' || design === 'frost' || design === 'accent';
}

export function resolveCardDesignIntensity(
  intensities: PortfolioServicesCardDesignIntensities,
  design: PortfolioServicesCardDesign
): number {
  return clampCardDesignIntensity(intensities[design], DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design]);
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

export function resolveCardDesignTint(
  tints: PortfolioServicesCardDesignTints,
  design: PortfolioServicesCardDesign
): number {
  return clampCardDesignIntensity(tints[design], DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]);
}

function glassSurfaceStyle(intensity: number): {
  borderColor: string;
  borderWidth: string;
  borderStyle: 'solid';
  backdropFilter: string;
  WebkitBackdropFilter: string;
  boxShadow: string;
} {
  const t = intensity / 100;
  return {
    borderColor: `rgba(255,255,255,${0.45 + t * 0.45})`,
    borderWidth: '1px',
    borderStyle: 'solid',
    backdropFilter: `blur(${Math.round(4 + t * 22)}px)`,
    WebkitBackdropFilter: `blur(${Math.round(4 + t * 22)}px)`,
    boxShadow: `0 ${Math.round(6 + t * 10)}px ${Math.round(16 + t * 20)}px -${Math.round(4 + t * 8)}px rgba(15,23,42,${0.04 + t * 0.1})`,
  };
}

export function servicesCardDesignIntensityStyle(
  design: PortfolioServicesCardDesign,
  intensity: number,
  accentColor: string,
  tint = DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]
): CSSProperties {
  const t = clampCardDesignIntensity(intensity, DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design]) / 100;
  const tintMix = clampCardDesignIntensity(tint, DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]) / 100;
  const accent = sanitizeHex(accentColor, DEFAULT_SERVICES_ACCENT_COLOR);
  const { r, g, b } = hexToRgb(accent);

  switch (design) {
    case 'editorial': {
      const wash = tintMix * (0.04 + t * 0.2);
      return {
        boxShadow: `0 ${Math.round(4 + t * 14)}px ${Math.round(10 + t * 22)}px -${Math.round(2 + t * 6)}px rgba(15,23,42,${0.05 + t * 0.14})`,
        ...(wash > 0
          ? {
              backgroundImage: `linear-gradient(135deg, rgba(${r},${g},${b},${wash}) 0%, transparent 58%)`,
            }
          : {}),
      };
    }
    case 'minimal': {
      const alpha = 0.08 + t * 0.35;
      const width = 1 + Math.round(t * 2);
      return {
        boxShadow: 'none',
        outline: `${width}px solid rgba(163,163,163,${alpha})`,
        outlineOffset: '-1px',
      };
    }
    case 'compact': {
      const gray = Math.round(250 - t * 38);
      return {
        backgroundColor: `rgb(${gray},${gray},${Math.min(255, gray + 2)})`,
      };
    }
    case 'glass': {
      const warmAlpha = tintMix * (0.08 + t * 0.22);
      return {
        backgroundImage:
          warmAlpha > 0
            ? `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(${r},${g},${b},${warmAlpha}) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(255,255,255,${0.15 + t * 0.25}) 100%)`,
        ...glassSurfaceStyle(t * 100),
      };
    }
    case 'frost': {
      const optionalTint = tintMix * (0.05 + t * 0.16);
      return {
        backgroundImage:
          optionalTint > 0
            ? `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(248,250,252,${0.18 + t * 0.28}) 55%, rgba(${r},${g},${b},${optionalTint}) 100%)`
            : `linear-gradient(135deg, rgba(255,255,255,${0.35 + t * 0.45}) 0%, rgba(248,250,252,${0.2 + t * 0.35}) 100%)`,
        ...glassSurfaceStyle(t * 100),
      };
    }
    case 'accent': {
      const borderW = Math.round(2 + t * 6);
      const wash = tintMix * (0.05 + t * 0.28);
      return {
        borderLeftWidth: `${borderW}px`,
        borderLeftStyle: 'solid',
        borderLeftColor: accent,
        ...(wash > 0
          ? {
              backgroundImage: `linear-gradient(90deg, ${hexWithAlpha(accent, wash)} 0%, transparent ${Math.round(38 + t * 28)}%)`,
            }
          : {}),
      };
    }
    default:
      return {};
  }
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

export function servicesHeaderFontClass(font: PortfolioServicesHeaderFont, kind: 'title' | 'subtitle'): string {
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

export function servicesHeaderFontStyle(_font: PortfolioServicesHeaderFont): CSSProperties | undefined {
  return undefined;
}

export function servicesTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_SERVICES_TITLE_COLOR) };
}

export function servicesSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_SERVICES_SUBTITLE_COLOR) };
}

function servicesStageRadiusClass(radius: PortfolioServicesStageRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl sm:rounded-2xl';
    case 'md':
      return 'rounded-2xl sm:rounded-[1.5rem]';
    case 'lg':
      return 'rounded-[1.5rem] sm:rounded-[1.75rem]';
    default:
      return 'rounded-[1.75rem] sm:rounded-[2rem]';
  }
}

function servicesStagePaddingClass(padding: PortfolioServicesStagePadding): string {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'px-1.5 py-2 sm:px-2 sm:py-3';
    case 'lg':
      return 'px-3 py-5 sm:px-5 sm:py-6 lg:px-6 lg:py-8';
    default:
      return 'px-2 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6';
  }
}

function servicesStageBorderWidthClass(border: PortfolioServicesStageBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
      return 'border-2';
    default:
      return 'border-0';
  }
}

function servicesStagePatternImage(
  pattern: PortfolioServicesStagePattern,
  color: string,
  opacity: number
): string | undefined {
  if (pattern === 'none') return undefined;
  const { r, g, b } = hexToRgb(sanitizeHex(color, DEFAULT_SERVICES_STAGE_PATTERN_COLOR));
  const a = Math.min(1, Math.max(0, opacity / 100));
  const ink = `rgba(${r}, ${g}, ${b}, ${a})`;
  switch (pattern) {
    case 'dots':
      return `radial-gradient(circle at 1px 1px, ${ink} 1px, transparent 0)`;
    case 'grid':
      return `linear-gradient(to right, ${ink} 1px, transparent 1px), linear-gradient(to bottom, ${ink} 1px, transparent 1px)`;
    case 'diagonal':
      return `repeating-linear-gradient(135deg, ${ink} 0 1px, transparent 1px 10px)`;
    default:
      return undefined;
  }
}

function servicesStagePatternSize(pattern: PortfolioServicesStagePattern): string | undefined {
  switch (pattern) {
    case 'dots':
      return '14px 14px';
    case 'grid':
      return '18px 18px, 18px 18px';
    case 'diagonal':
      return undefined;
    default:
      return undefined;
  }
}

/** Whether the stage needs a DOM wrapper for the chosen design + chrome. */
export function servicesStageNeedsShell(
  design: PortfolioServicesStageDesign,
  chrome: PortfolioServicesStageChromeSettings = DEFAULT_SERVICES_STAGE_CHROME
): boolean {
  if (design === 'soft' || design === 'framed') return true;
  return servicesStageChromeIsActive(chrome);
}

export function servicesStageShellClass(
  design: PortfolioServicesStageDesign,
  chrome: PortfolioServicesStageChromeSettings = DEFAULT_SERVICES_STAGE_CHROME
): string {
  if (!servicesStageNeedsShell(design, chrome)) return '';

  const parts = [
    'relative overflow-hidden',
    servicesStageRadiusClass(chrome.stageBorderRadius),
    servicesStagePaddingClass(chrome.stagePadding),
  ];
  if (chrome.stageBorder !== 'none') {
    parts.push(servicesStageBorderWidthClass(chrome.stageBorder));
  }
  return parts.filter(Boolean).join(' ');
}

export function servicesStageShellStyle(
  chrome: PortfolioServicesStageChromeSettings = DEFAULT_SERVICES_STAGE_CHROME
): CSSProperties {
  const style: CSSProperties = {};

  if (chrome.stageBackgroundEnabled) {
    style.backgroundColor = hexWithAlpha(
      sanitizeHex(chrome.stageBackgroundColor, DEFAULT_SERVICES_STAGE_BACKGROUND_COLOR),
      chrome.stageBackgroundOpacity / 100
    );
  }

  if (chrome.stageBorder !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.stageBorderColor, DEFAULT_SERVICES_STAGE_BORDER_COLOR);
  }

  const patternImage = servicesStagePatternImage(
    chrome.stagePattern,
    chrome.stagePatternColor,
    chrome.stagePatternOpacity
  );
  if (patternImage) {
    style.backgroundImage = patternImage;
    const size = servicesStagePatternSize(chrome.stagePattern);
    if (size) style.backgroundSize = size;
  }

  return style;
}

export function pickServicesStageChrome(
  source: PortfolioServicesStageChromeSettings
): PortfolioServicesStageChromeSettings {
  return {
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
  };
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

export function servicesCardDesignShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  options?: { applyMutedClass?: boolean; omitDefaultFill?: boolean }
): string {
  const base = 'pf-services-card group relative h-full overflow-hidden transition';
  const applyMuted = options?.applyMutedClass !== false && tone === 'muted';
  const muted = applyMuted ? 'pf-muted-card-gradient' : '';
  const omitFill = options?.omitDefaultFill === true;
  // Default Tailwind fills fight palette / custom hex — omit when surface style owns the fill.
  const lightFill = omitFill ? '' : 'bg-white';
  const darkFill = omitFill ? '' : 'dark:bg-neutral-900';
  switch (design) {
    case 'minimal':
      return `${base} ${lightFill} shadow-none ${darkFill} ${muted}`.trim();
    case 'compact':
      return `${base} ${omitFill ? '' : 'dark:bg-neutral-900/80'} ${muted}`.trim();
    case 'glass':
    case 'frost':
      return `${base} ${muted}`.trim();
    case 'accent':
      return `${base} ${lightFill} shadow-none ${darkFill} ${muted}`.trim();
    default:
      return `${base} ${lightFill} ${darkFill} ${muted}`.trim();
  }
}

export function resolveServicesCardTone(
  index: number,
  alternation: PortfolioServicesCardBackgroundAlternation = 'uniform',
  rowOffset: 0 | 1 = 0
): 'light' | 'muted' {
  if (alternation !== 'alternate') return 'light';
  return (index + rowOffset) % 2 === 0 ? 'light' : 'muted';
}

/** Compact / glass paint their own fill — they win over the diagonal split layer.
 *  Frost stays translucent so the default diagonal theme remains visible. */
export function servicesCardDesignOwnsBackground(design: PortfolioServicesCardDesign): boolean {
  return design === 'compact' || design === 'glass';
}

/** All service card designs except Service selector, Carte média, Bannière média and Média checklist. */
export function servicesLayoutSupportsPrincipalSurface(
  layout: PortfolioServicesGalleryLayout | undefined
): boolean {
  return (
    layout != null &&
    layout !== 'service-selector' &&
    layout !== 'card-media' &&
    layout !== 'media-banner' &&
    layout !== 'media-checklist' &&
    layout !== 'media-split'
  );
}

/** Layouts that show a cover image beside service copy (side-by-side). */
export function servicesLayoutHasCoverMedia(
  layout: PortfolioServicesGalleryLayout | undefined
): boolean {
  return layout === 'card-media' || layout === 'media-banner' || layout === 'media-checklist';
}

/** Layouts that include a cover image (side-by-side or top banner). */
export function servicesLayoutHasMediaCover(
  layout: PortfolioServicesGalleryLayout | undefined
): boolean {
  return servicesLayoutHasCoverMedia(layout) || layout === 'media-split';
}

/** Whether the media column is on the left for this card index. */
export function servicesMediaOnLeft(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'servicesMediaSide' | 'servicesMediaSideAlternation'
  >,
  cardIndex = 0
): boolean {
  const startLeft = presentation.servicesMediaSide !== 'media-right';
  if (presentation.servicesMediaSideAlternation !== 'alternate') return startLeft;
  return cardIndex % 2 === 0 ? startLeft : !startLeft;
}

export const PORTFOLIO_SERVICES_MEDIA_SIDE_OPTIONS: {
  value: PortfolioServicesMediaSide;
  label: string;
  description: string;
}[] = [
  {
    value: 'media-left',
    label: 'Média à gauche',
    description: 'Image à gauche, informations à droite (1re carte si alternance).',
  },
  {
    value: 'media-right',
    label: 'Média à droite',
    description: 'Informations à gauche, image à droite (1re carte si alternance).',
  },
];

export const PORTFOLIO_SERVICES_MEDIA_SIDE_ALTERNATION_OPTIONS: {
  value: PortfolioServicesMediaSideAlternation;
  label: string;
  description: string;
}[] = [
  {
    value: 'uniform',
    label: 'Uniforme',
    description: 'Toutes les cartes gardent le même côté média / infos.',
  },
  {
    value: 'alternate',
    label: 'Alterné',
    description: 'Alterne média gauche / infos droite puis l’inverse à chaque carte.',
  },
];

export const PORTFOLIO_SERVICES_PRINCIPAL_SURFACE_ALTERNATION_OPTIONS: {
  value: PortfolioServicesCardBackgroundAlternation;
  label: string;
  description: string;
}[] = [
  {
    value: 'uniform',
    label: 'Uniforme',
    description: 'Toutes les cartes ont le fond couleur principale (sans survol sur ce fond).',
  },
  {
    value: 'alternate',
    label: 'Alterné',
    description: 'Alterne cartes mises en avant (fond principal) et cartes normales.',
  },
];

export const PORTFOLIO_SERVICES_PRINCIPAL_SURFACE_ALTERNATE_START_OPTIONS: {
  value: PortfolioServicesPrincipalSurfaceAlternateStart;
  label: string;
  description: string;
}[] = [
  {
    value: 'principal',
    label: 'Principal d’abord',
    description: 'La 1re carte a le fond couleur principale, puis normal, etc.',
  },
  {
    value: 'normal',
    label: 'Normal d’abord',
    description: 'La 1re carte est normale, puis fond couleur principale, etc.',
  },
];

/** True when the card uses static principal fill (no principal-background hover). */
export function servicesPrincipalSurfaceActive(
  p: Pick<
    PortfolioServicesPresentationSettings,
    | 'servicesPrincipalSurfaceEnabled'
    | 'servicesPrincipalSurfaceAlternation'
    | 'servicesPrincipalSurfaceAlternateStart'
    | 'servicesGalleryLayout'
  >,
  cardIndex = 0
): boolean {
  if (
    p.servicesPrincipalSurfaceEnabled !== true ||
    !servicesLayoutSupportsPrincipalSurface(p.servicesGalleryLayout)
  ) {
    return false;
  }
  if (p.servicesPrincipalSurfaceAlternation === 'alternate') {
    const startPrincipal = p.servicesPrincipalSurfaceAlternateStart !== 'normal';
    const evenIsPrincipal = startPrincipal;
    return cardIndex % 2 === 0 ? evenIsPrincipal : !evenIsPrincipal;
  }
  return true;
}

/** Layouts that stay border-only in light mode but get a solid fill in dark (like Offre / Tarif). */
export function servicesLayoutUsesDarkOnlyCardFill(
  layout: PortfolioServicesGalleryLayout | undefined
): boolean {
  // Carte / Liste commerciale now use explicit fill by default; keep dark-only for Liste / menu.
  return layout === 'list';
}

/** True when this presentation should paint a card fill only because Global mode is dark. */
export function servicesCardDarkOnlyFillActive(
  p: Pick<
    PortfolioServicesPresentationSettings,
    'servicesGalleryLayout' | 'activeColorMode' | 'cardBackgroundEnabled'
  >
): boolean {
  if (p.cardBackgroundEnabled) return false;
  if (!servicesLayoutUsesDarkOnlyCardFill(p.servicesGalleryLayout)) return false;
  // Strict: only when Global color mode is explicitly dark (not undefined / light).
  return p.activeColorMode === 'dark';
}

/** True when the user-controlled card fill should win over theme/design defaults. */
export function servicesCardHasCustomFill(
  p: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'servicesGalleryLayout'
    | 'activeColorMode'
  >
): boolean {
  if (servicesCardDesignOwnsBackground(p.cardDesign)) return false;
  if (p.cardBackgroundFill === 'split') return true;
  if (p.cardBackgroundEnabled) return true;
  return servicesCardDarkOnlyFillActive(p);
}

export function servicesCardFillDataAttrs(
  p: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'servicesGalleryLayout'
    | 'activeColorMode'
  >
): { 'data-pf-card-fill'?: 'custom' } {
  return servicesCardHasCustomFill(p) ? { 'data-pf-card-fill': 'custom' } : {};
}

export function servicesCardDesignStyle(
  design: PortfolioServicesCardDesign,
  accentColor: string,
  intensity = DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES[design],
  tint = DEFAULT_SERVICES_CARD_DESIGN_TINTS[design]
): CSSProperties {
  return servicesCardDesignIntensityStyle(design, intensity, accentColor, tint);
}

/** @deprecated Use servicesCardDesignStyle — kept for callers during migration */
export function servicesCardAccentStyle(
  design: PortfolioServicesCardDesign,
  accentColor: string
): CSSProperties | undefined {
  return servicesCardDesignStyle(design, accentColor);
}

export function servicesCardTypographyClass(design: PortfolioServicesCardDesign): {
  title: string;
  body: string;
  icon: number;
  iconShell: string;
} {
  if (design === 'compact') {
    return {
      title: 'text-base font-bold sm:text-lg',
      body: 'text-xs sm:text-sm',
      icon: 24,
      iconShell: 'h-10 w-10',
    };
  }
  if (design === 'minimal') {
    return {
      title: 'text-lg font-semibold sm:text-xl',
      body: 'text-sm',
      icon: 28,
      iconShell: 'h-12 w-12',
    };
  }
  if (design === 'glass' || design === 'frost') {
    return {
      title: 'text-lg font-bold sm:text-xl',
      body: 'text-sm',
      icon: 30,
      iconShell: 'h-12 w-12',
    };
  }
  return {
    title: 'text-xl font-extrabold sm:text-2xl',
    body: 'text-base sm:text-[1.05rem]',
    icon: 34,
    iconShell: 'h-14 w-14 sm:h-16 sm:w-16',
  };
}

export function servicesListIconShellClass(design: PortfolioServicesCardDesign): string {
  switch (design) {
    case 'minimal':
      return 'text-neutral-700 dark:text-neutral-200';
    case 'compact':
      return 'text-neutral-800 dark:text-neutral-100';
    case 'glass':
    case 'frost':
      return 'text-neutral-800 dark:text-white';
    case 'accent':
      return 'text-white';
    default:
      return 'text-white';
  }
}

export function servicesListIconShellStyle(
  design: PortfolioServicesCardDesign,
  intensities: PortfolioServicesCardDesignIntensities,
  accentColor: string,
  tints?: PortfolioServicesCardDesignTints
): CSSProperties | undefined {
  const intensity = resolveCardDesignIntensity(intensities, design);
  const t = intensity / 100;
  const accent = sanitizeHex(accentColor, DEFAULT_SERVICES_ACCENT_COLOR);
  const tintMix = tints ? resolveCardDesignTint(tints, design) / 100 : 0;
  const { r, g, b } = hexToRgb(accent);

  switch (design) {
    case 'minimal': {
      const gray = Math.round(245 - t * 50);
      return { backgroundColor: `rgb(${gray},${gray},${gray})` };
    }
    case 'compact': {
      const gray = Math.round(229 - t * 45);
      return { backgroundColor: `rgb(${gray},${gray},${Math.min(255, gray + 2)})` };
    }
    case 'glass':
      return {
        backgroundColor:
          tintMix > 0
            ? `rgba(${Math.round(255 * (1 - tintMix * 0.35) + r * tintMix * 0.35)},${Math.round(255 * (1 - tintMix * 0.35) + g * tintMix * 0.35)},${Math.round(255 * (1 - tintMix * 0.35) + b * tintMix * 0.35)},${0.2 + t * 0.55})`
            : `rgba(255,255,255,${0.2 + t * 0.55})`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `rgba(255,255,255,${0.4 + t * 0.45})`,
        backdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
        WebkitBackdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
      };
    case 'frost':
      return {
        backgroundColor:
          tintMix > 0
            ? `rgba(${Math.round(248 * (1 - tintMix) + r * tintMix)},${Math.round(250 * (1 - tintMix) + g * tintMix)},${Math.round(252 * (1 - tintMix) + b * tintMix)},${0.22 + t * 0.5})`
            : `rgba(248,250,252,${0.22 + t * 0.5})`,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: `rgba(255,255,255,${0.45 + t * 0.4})`,
        backdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
        WebkitBackdropFilter: `blur(${Math.round(2 + t * 10)}px)`,
      };
    case 'accent':
      return { backgroundColor: accent, opacity: 0.75 + t * 0.25 };
    default: {
      const dark = Math.round(10 + (1 - t) * 15);
      return { backgroundColor: `rgb(${dark},${dark},${dark})` };
    }
  }
}

export function servicesCardShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
    | 'servicesGalleryLayout'
    | 'activeColorMode'
  >
): string {
  const custom = presentation ? servicesCardHasCustomFill(presentation) : false;
  const omitDefaultFill =
    custom ||
    (presentation != null && !presentation.cardBackgroundEnabled) ||
    presentation?.useHeroPalette !== false;
  return `${servicesCardDesignShellClass(design, tone, {
    // Never paint muted gray fill when the user turned the card background off.
    applyMutedClass: custom,
    omitDefaultFill,
  })} flex flex-col`;
}

export function servicesServiceCardMinHeight(design: PortfolioServicesCardDesign): string {
  return design === 'compact' ? 'min-h-[18rem]' : design === 'minimal' ? 'min-h-[20rem]' : 'min-h-[22rem] sm:min-h-[23rem]';
}

export function servicesSkillCardMinHeight(design: PortfolioServicesCardDesign): string {
  return design === 'compact' ? 'min-h-[12rem]' : design === 'minimal' ? 'min-h-[13rem]' : 'min-h-[14rem] sm:min-h-[15rem]';
}

export function servicesGallerySupportsMarquee(layout: PortfolioServicesGalleryLayout): boolean {
  return layout === 'card';
}

export function servicesGallerySupportsCoverflow(layout: PortfolioServicesGalleryLayout): boolean {
  return layout === 'card';
}

export function servicesGallerySupportsDeck(layout: PortfolioServicesGalleryLayout): boolean {
  return layout === 'card';
}

export function servicesMarqueeActiveFor(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'displayMode' | 'servicesGalleryLayout' | 'skillsGalleryLayout'
  >,
  kind: 'services' | 'skills'
): boolean {
  if (presentation.displayMode !== 'marquee') return false;
  const layout =
    kind === 'services' ? presentation.servicesGalleryLayout : presentation.skillsGalleryLayout;
  return servicesGallerySupportsMarquee(layout);
}

export function servicesCoverflowActiveFor(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'displayMode' | 'servicesGalleryLayout' | 'skillsGalleryLayout'
  >,
  kind: 'services' | 'skills'
): boolean {
  if (presentation.displayMode !== 'coverflow') return false;
  const layout =
    kind === 'services' ? presentation.servicesGalleryLayout : presentation.skillsGalleryLayout;
  return servicesGallerySupportsCoverflow(layout);
}

export function servicesDeckActiveFor(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'displayMode' | 'servicesGalleryLayout' | 'skillsGalleryLayout'
  >,
  kind: 'services' | 'skills'
): boolean {
  if (presentation.displayMode !== 'deck') return false;
  const layout =
    kind === 'services' ? presentation.servicesGalleryLayout : presentation.skillsGalleryLayout;
  return servicesGallerySupportsDeck(layout);
}

/** Modes that need « Carte horizontal » — auto-applied when selecting the mode. */
export function servicesDisplayModeNeedsCardLayout(mode: PortfolioServicesDisplayMode): boolean {
  return mode === 'marquee' || mode === 'coverflow' || mode === 'deck';
}

/** Patch to apply a display mode and keep gallery layouts in sync (root + both blocks). */
export function servicesDisplayModeSettingsPatch(
  services: PortfolioServicesPresentationSettings,
  displayMode: PortfolioServicesDisplayMode
): Partial<PortfolioServicesPresentationSettings> {
  const needsCard = servicesDisplayModeNeedsCardLayout(displayMode);
  const galleryLayout = needsCard ? ('card' as const) : undefined;
  return {
    displayMode,
    ...(galleryLayout
      ? {
          skillsGalleryLayout: galleryLayout,
          servicesGalleryLayout: galleryLayout,
        }
      : {}),
    skillsBlock: {
      ...services.skillsBlock,
      displayMode,
      ...(galleryLayout ? { galleryLayout } : {}),
    },
    servicesBlock: {
      ...services.servicesBlock,
      displayMode,
      ...(galleryLayout ? { galleryLayout } : {}),
    },
  };
}

function servicesColumnsGridClass(columns: PortfolioServicesCardColumns, gapClass = 'gap-3'): string {
  switch (columns) {
    case 1:
      return `mx-auto flex w-full max-w-2xl flex-col ${gapClass}`;
    case 2:
      return `grid items-stretch ${gapClass} grid-cols-1 sm:grid-cols-2`;
    case 4:
      return `grid items-stretch ${gapClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`;
    default:
      // 3 columns: single on phone, 2 on tablet, 3 from lg (not only xl).
      return `grid items-stretch ${gapClass} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`;
  }
}

export function servicesGalleryContainerClass(
  layout: PortfolioServicesGalleryLayout,
  displayMode: PortfolioServicesDisplayMode,
  kind: 'services' | 'skills' = 'services',
  columns?: PortfolioServicesCardColumns
): string {
  const cols =
    columns ??
    (kind === 'skills'
      ? DEFAULT_SERVICES_PRESENTATION.skillsColumns
      : DEFAULT_SERVICES_PRESENTATION.servicesColumns);

  if (layout === 'commercial-list') {
    return 'flex w-full flex-col gap-0';
  }

  if (
    layout === 'card-media' ||
    layout === 'media-banner' ||
    layout === 'media-checklist' ||
    layout === 'media-split'
  ) {
    return 'flex w-full flex-col gap-12 sm:gap-16 lg:gap-20';
  }

  if (layout === 'plan-split') {
    return 'flex w-full flex-col gap-5';
  }

  if (layout === 'service-accordion') {
    return 'flex w-full flex-col gap-4';
  }

  if (
    layout === 'list' ||
    layout === 'service-selector' ||
    layout === 'pricing-hero' ||
    layout === 'tier' ||
    layout === 'plan'
  ) {
    return servicesColumnsGridClass(cols, layout === 'list' ? 'gap-3' : 'gap-5');
  }

  if (layout === 'icon-stack') {
    return 'flex w-full flex-wrap items-center';
  }

  if (layout === 'tool-inspector') {
    return 'flex w-full flex-col';
  }

  if (displayMode === 'stack' || displayMode === 'coverflow' || displayMode === 'deck') {
    return servicesColumnsGridClass(1, 'gap-5');
  }

  return servicesColumnsGridClass(cols, 'gap-5');
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

function servicesCardBorderWidthClass(border: PortfolioServicesCardBorder): string {
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

/** Frame override applied on top of design shells (border / radius / padding / bg). */
export function servicesCardFrameClass(p: PortfolioServicesPresentationSettings): string {
  const parts = [servicesCardRadiusClass(p.cardBorderRadius), servicesCardPaddingClass(p.cardPadding)];
  if (p.cardBorder !== 'none') {
    parts.push(servicesCardBorderWidthClass(p.cardBorder));
    // Soft shadow only when there is a fill — border-only cards stay flat.
    if (p.cardBorder === 'soft' && p.cardBackgroundEnabled) parts.push('shadow-sm');
  } else {
    parts.push('border-0 shadow-none');
  }
  return parts.filter(Boolean).join(' ');
}

/**
 * Cover-media layouts default to no outline. Soft (legacy shared default) is remapped to none
 * so old sessions actually lose the border; solid / accent stay if the user set them.
 */
export function resolveServicesMediaCardPresentation(
  presentation: PortfolioServicesPresentationSettings
): PortfolioServicesPresentationSettings {
  if (
    presentation.cardBorder === 'solid' ||
    presentation.cardBorder === 'accent'
  ) {
    return presentation;
  }
  return { ...presentation, cardBorder: 'none' };
}

/** Surface style for media cards — kills leftover soft border / minimal outline / soft shadow. */
export function servicesMediaCardSurfaceStyle(
  presentation: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted' = 'light'
): CSSProperties {
  const resolved = resolveServicesMediaCardPresentation(presentation);
  const surface = servicesCardSurfaceStyle(resolved, tone);
  if (resolved.cardBorder !== 'none') return surface;
  return {
    ...surface,
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    outline: 'none',
    boxShadow: 'none',
  };
}

export function servicesCardFrameStyle(p: PortfolioServicesPresentationSettings): CSSProperties {
  const style: CSSProperties = {};

  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_SERVICES_CARD_BACKGROUND_COLOR);
  }

  if (p.cardBorder !== 'none') {
    const opacity = clampCardDesignIntensity(p.cardBorderOpacity, 100) / 100;
    style.borderStyle = 'solid';
    if (p.cardBorder === 'accent') {
      const accent = sanitizeHex(p.cardAccentColor, DEFAULT_SERVICES_ACCENT_COLOR);
      style.borderColor = opacity >= 0.999 ? accent : hexWithAlpha(accent, opacity);
    } else if (p.cardBorder === 'soft' || p.cardBorder === 'solid') {
      const border = sanitizeHex(p.cardBorderColor, DEFAULT_SERVICES_CARD_BORDER_COLOR);
      style.borderColor = opacity >= 0.999 ? border : hexWithAlpha(border, opacity);
    }
  } else {
    style.borderWidth = 0;
    style.borderStyle = 'none';
    style.borderColor = 'transparent';
  }

  return style;
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

/**
 * Hex of the fill the user actually sees behind skill/service card content.
 * Must stay in sync with {@link servicesCardSurfaceStyle} (+ design-owned fills).
 * When the card fill is off, content sits on the section background — not a white default
 * (otherwise auto ink flips to dark text on a dark page).
 */
export function resolveServicesSectionSurfaceHex(
  p: Pick<
    PortfolioServicesPresentationSettings,
    | 'useHeroPalette'
    | 'servicesPalette'
    | 'servicesColorBindings'
    | 'sectionBackgroundColor'
  >
): string {
  if (p.useHeroPalette !== false) {
    const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, p.servicesPalette);
    const bindings = mergeServicesColorBindings(
      DEFAULT_SERVICES_COLOR_BINDINGS,
      p.servicesColorBindings
    );
    return resolveHeroPaletteColor(palette, bindings.sectionBackground);
  }
  return sanitizeHex(p.sectionBackgroundColor, '#0b0b0d');
}

export function resolveServicesCardSurfaceHex(
  p: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted' = 'light'
): string {
  const lightColor = resolveServicesManualHex(
    p.cardBackgroundColor,
    p.cardBackgroundColorDark,
    p,
    DEFAULT_SERVICES_CARD_BACKGROUND_COLOR
  );
  const mutedColor = resolveServicesManualHex(
    p.cardBackgroundColorB,
    p.cardBackgroundColorBDark,
    p,
    DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B
  );
  const designOwnsBackground = servicesCardDesignOwnsBackground(p.cardDesign);

  if (designOwnsBackground) {
    if (p.cardDesign === 'compact') {
      const intensity = resolveCardDesignIntensity(p.cardDesignIntensities, p.cardDesign);
      const t =
        clampCardDesignIntensity(intensity, DEFAULT_SERVICES_CARD_DESIGN_INTENSITIES.compact) / 100;
      const gray = Math.round(250 - t * 38);
      const hex = gray.toString(16).padStart(2, '0');
      return `#${hex}${hex}${hex}`;
    }
    // glass — frosted light wash
    return '#f3f3f5';
  }

  if (
    p.cardBackgroundAlternation === 'alternate' &&
    p.cardBackgroundEnabled &&
    p.cardBackgroundFill !== 'split'
  ) {
    return tone === 'muted' ? mutedColor : lightColor;
  }

  if (p.cardBackgroundFill === 'split') {
    // Split layers expose zone A as the dominant reading surface.
    return sanitizeHex(p.cardBackgroundColorA, lightColor);
  }

  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled) {
    return lightColor;
  }

  // Carte / Liste / Liste commerciale — fill like Offre·Tarif, but dark mode only.
  if (servicesCardDarkOnlyFillActive(p)) {
    return tone === 'muted' ? mutedColor : lightColor;
  }

  // Transparent card — contrast against the section, not a phantom white fill.
  return resolveServicesSectionSurfaceHex(p);
}

/**
 * Card text binds to element colors. When `cardTextContrast === 'pair-ab'`
 * and Alterné is on, use explicit A/B ink pairs instead of element hexes.
 * Otherwise prefer the painted element colors (palette / manual).
 */
export function servicesReadableCardInk(
  p: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted',
  preferredStrong: string,
  preferredMuted: string,
  /** Kept for call-site compatibility; contrast now trusts preferred hexes unless pair-ab. */
  _surfaceHexOverride?: string
): { strong: string; muted: string } {
  const contrast = pickServicesCardTextContrast(p.cardTextContrast, 'auto');
  const alternate = p.cardBackgroundAlternation === 'alternate';

  if (alternate && contrast === 'pair-ab') {
    if (tone === 'muted') {
      return {
        strong: sanitizeHex(p.cardInkStrongB, DEFAULT_SERVICES_CARD_INK_STRONG_B),
        muted: sanitizeHex(p.cardInkMutedB, DEFAULT_SERVICES_CARD_INK_MUTED_B),
      };
    }
    return {
      strong: sanitizeHex(p.cardInkStrongA, DEFAULT_SERVICES_CARD_INK_STRONG_A),
      muted: sanitizeHex(p.cardInkMutedA, DEFAULT_SERVICES_CARD_INK_MUTED_A),
    };
  }

  // Default / auto: trust the preferred (painted) colors.
  return {
    strong: sanitizeHex(preferredStrong, DEFAULT_SERVICES_CARD_INK_STRONG_A),
    muted: sanitizeHex(preferredMuted, DEFAULT_SERVICES_CARD_INK_MUTED_A),
  };
}

/** Active Global color mode for manual (non-palette) light/dark picks. */
export function servicesActiveColorMode(
  p: Pick<PortfolioServicesPresentationSettings, 'activeColorMode'>
): 'light' | 'dark' {
  return p.activeColorMode === 'light' ? 'light' : 'dark';
}

/** Resolve a manual light/dark hex pair when palette is off. */
export function resolveServicesManualHex(
  light: string,
  dark: string,
  p: Pick<PortfolioServicesPresentationSettings, 'useHeroPalette' | 'activeColorMode'>,
  fallback: string
): string {
  const mode = servicesActiveColorMode(p);
  if (p.useHeroPalette === false && mode === 'dark') {
    return sanitizeHex(dark || light, fallback);
  }
  return sanitizeHex(light, fallback);
}

/**
 * Soft icon disc when the skill card has no painted fill (or sits on a brand
 * fill). Never pure white on dark surfaces — that reads as a harsh “light mode”
 * chip in dark portfolios.
 */
export function servicesSoftIconChipBg(surfaceHex: string): string {
  if (servicesColorLuminance(surfaceHex) < 0.45) {
    return '#2a2a2e';
  }
  return '#ececf0';
}

/**
 * Skill icon chip fill — same contract as Work `toolsIconBackground` /
 * {@link workToolIconShellStyle}: use the painted card surface (neutre), not a
 * forced light wash. Must be a solid hex so CreatorToolLogo can invert marks.
 */
export function resolveServicesSkillIconChipBg(
  p: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted' = 'light'
): string {
  return resolveServicesCardSurfaceHex(p, tone);
}

/** Icon chip chrome — mirrors Work tool circles (surface + border tokens). */
export function servicesSkillIconChromeStyle(
  p: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted' = 'light'
): CSSProperties {
  const radius =
    p.skillsIconRadius === 'none'
      ? '0'
      : p.skillsIconRadius === 'sm'
        ? '0.375rem'
        : p.skillsIconRadius === 'md'
          ? '0.625rem'
          : p.skillsIconRadius === 'lg'
            ? '0.875rem'
            : p.skillsIconRadius === 'xl'
              ? '1.25rem'
              : '9999px';
  return {
    borderStyle: 'solid',
    borderWidth:
      p.skillsIconBorderEnabled === false
        ? 0
        : clampSkillsIconBorderWidthPx(p.skillsIconBorderWidthPx, 1),
    borderColor:
      p.skillsIconBorderEnabled === false
        ? 'transparent'
        : p.skillsIconBorderManual
          ? sanitizeHex(p.skillsIconBorderColor, DEFAULT_SERVICES_CARD_BORDER_COLOR)
          : sanitizeHex(p.cardBorderColor, DEFAULT_SERVICES_CARD_BORDER_COLOR),
    backgroundColor:
      p.skillsIconBackgroundEnabled === false
        ? 'transparent'
        : p.skillsIconBackgroundManual
          ? sanitizeHex(p.skillsIconBackgroundColor, DEFAULT_SERVICES_CARD_BACKGROUND_COLOR)
          : resolveServicesSkillIconChipBg(p, tone),
    borderRadius: radius,
  };
}

export function servicesCardSurfaceStyle(
  p: PortfolioServicesPresentationSettings,
  tone: 'light' | 'muted' = 'light'
): CSSProperties {
  const intensity = resolveCardDesignIntensity(p.cardDesignIntensities, p.cardDesign);
  const tint = resolveCardDesignTint(p.cardDesignTints, p.cardDesign);
  const designStyle = servicesCardDesignIntensityStyle(p.cardDesign, intensity, p.cardAccentColor, tint);
  const frameStyle = servicesCardFrameStyle(p);
  const designOwnsBackground = servicesCardDesignOwnsBackground(p.cardDesign);
  const lightColor = resolveServicesManualHex(
    p.cardBackgroundColor,
    p.cardBackgroundColorDark,
    p,
    DEFAULT_SERVICES_CARD_BACKGROUND_COLOR
  );
  const mutedColor = resolveServicesManualHex(
    p.cardBackgroundColorB,
    p.cardBackgroundColorBDark,
    p,
    DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B
  );

  // Alternating solid fills — require the fill toggle (alternation alone must not keep fill on).
  if (
    p.cardBackgroundAlternation === 'alternate' &&
    p.cardBackgroundEnabled &&
    p.cardBackgroundFill !== 'split' &&
    !designOwnsBackground
  ) {
    return {
      ...designStyle,
      ...frameStyle,
      backgroundImage: 'none',
      backgroundColor: tone === 'muted' ? mutedColor : lightColor,
      ['--pf-card-muted-bg' as string]: mutedColor,
    };
  }

  // Diagonal / geometric split is drawn in ServicesCardBackgroundLayers.
  if (p.cardBackgroundFill === 'split' && !designOwnsBackground) {
    const { backgroundColor: _bg, backgroundImage: _img, ...restDesign } = designStyle as CSSProperties & {
      backgroundColor?: string;
      backgroundImage?: string;
    };
    void _bg;
    void _img;
    return {
      ...restDesign,
      ...frameStyle,
      backgroundColor: 'transparent',
      backgroundImage: 'none',
    };
  }

  // Uniform solid fill when enabled — clear design backgroundImage so the color is visible.
  if (p.cardBackgroundFill === 'solid' && p.cardBackgroundEnabled && !designOwnsBackground) {
    return {
      ...designStyle,
      ...frameStyle,
      backgroundImage: 'none',
      backgroundColor: lightColor,
    };
  }

  // Carte / Liste / Liste commerciale: solid fill in dark mode only (Offre·Tarif-like surface).
  if (servicesCardDarkOnlyFillActive(p) && !designOwnsBackground) {
    const { backgroundColor: _bg, backgroundImage: _img, ...restDesign } = designStyle as CSSProperties & {
      backgroundColor?: string;
      backgroundImage?: string;
    };
    void _bg;
    void _img;
    return {
      ...restDesign,
      ...frameStyle,
      backgroundImage: 'none',
      backgroundColor: tone === 'muted' ? mutedColor : lightColor,
    };
  }

  // Fill off wins over design-owned paints (compact / glass) so "Fond du cadre" is authoritative.
  if (!p.cardBackgroundEnabled) {
    const { backgroundColor: _bg, backgroundImage: _img, ...restDesign } = designStyle as CSSProperties & {
      backgroundColor?: string;
      backgroundImage?: string;
    };
    void _bg;
    void _img;
    return {
      ...restDesign,
      ...frameStyle,
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      boxShadow: 'none',
    };
  }

  return {
    ...designStyle,
    ...frameStyle,
  };
}

export function servicesContentAlignClass(alignment: PortfolioServicesContentAlignment): {
  container: string;
  text: string;
  row: string;
  block: string;
} {
  switch (alignment) {
    case 'center':
      return {
        container: 'items-center',
        text: 'text-center',
        row: 'justify-center',
        block: 'mx-auto',
      };
    case 'right':
      return {
        container: 'items-end',
        text: 'text-right',
        row: 'justify-end',
        block: 'ml-auto',
      };
    default:
      return {
        container: 'items-start',
        text: 'text-left',
        row: 'justify-start',
        block: '',
      };
  }
}

/** Vertical gap between title / description / tasks / price / CTA inside a card. */
export function servicesCardContentGapClass(gap: PortfolioServicesContentGap | undefined): string {
  switch (gap) {
    case 'none':
      return 'gap-0';
    case 'sm':
      return 'gap-2';
    case 'lg':
      return 'gap-5';
    case 'xl':
      return 'gap-7';
    case 'custom':
      return '';
    default:
      return 'gap-3.5';
  }
}

export function servicesCardContentGapProps(
  gap: PortfolioServicesContentGap | undefined,
  customPx?: number
): { className: string; style?: { gap: string } } {
  if (gap === 'custom') {
    return {
      className: '',
      style: { gap: `${clampServicesContentGapPx(customPx, 14)}px` },
    };
  }
  return { className: servicesCardContentGapClass(gap) };
}

export function pickServicesContentGap(
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

export function servicesListRowShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
    | 'servicesGalleryLayout'
    | 'activeColorMode'
  >
): string {
  const custom = presentation ? servicesCardHasCustomFill(presentation) : false;
  const omitDefaultFill = custom || presentation?.useHeroPalette !== false;
  return servicesCardDesignShellClass(design, tone, {
    applyMutedClass: !custom,
    omitDefaultFill,
  });
}

export function servicesPricingHeroShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
    | 'servicesGalleryLayout'
    | 'activeColorMode'
  >
): string {
  return `${servicesListRowShellClass(design, tone, presentation)} flex flex-col`;
}

/** Shell for the vertical subscription / tier offer card. */
export function servicesTierShellClass(
  design: PortfolioServicesCardDesign,
  tone: 'light' | 'muted' = 'light',
  presentation?: Pick<
    PortfolioServicesPresentationSettings,
    | 'cardDesign'
    | 'cardBackgroundFill'
    | 'cardBackgroundEnabled'
    | 'cardBackgroundAlternation'
    | 'useHeroPalette'
    | 'servicesGalleryLayout'
    | 'activeColorMode'
  >
): string {
  return `${servicesCardShellClass(design, tone, presentation)} flex flex-col`;
}

/**
 * Sensible defaults when picking Offre / Tarif or Plan tarifaire layouts.
 */
export const SERVICES_VERTICAL_CARD_CHROME_VERSION = 44;

/** Default width for Bannière média (commercial-list steps: lg ≈ max-w-6xl). */
export const SERVICES_MEDIA_BANNER_DEFAULT_MAX_WIDTH = 'lg' as const;

/**
 * Resolve display width for Bannière média.
 * Pre-migration profiles still store `full` (old default) — show the capped default until chrome migrates.
 * After migration, `full` and other sizes are respected as configured.
 */
export function resolveMediaBannerCardMaxWidth(
  presentation: Pick<
    PortfolioServicesPresentationSettings,
    'cardMaxWidth' | 'servicesCardChromeVersion'
  >
): PortfolioServicesCardMaxWidth {
  const width = presentation.cardMaxWidth;
  const version = presentation.servicesCardChromeVersion ?? 0;
  if (version < SERVICES_VERTICAL_CARD_CHROME_VERSION) {
    if (!width || width === 'full') return SERVICES_MEDIA_BANNER_DEFAULT_MAX_WIDTH;
  }
  if (
    width === 'full' ||
    width === 'xl' ||
    width === 'lg' ||
    width === 'md' ||
    width === 'sm'
  ) {
    return width;
  }
  return SERVICES_MEDIA_BANNER_DEFAULT_MAX_WIDTH;
}

/** Shared max width for Carte / Offre·Tarif / Plan (same footprint). */
export const SERVICES_HORIZONTAL_CARD_MAX_WIDTH = 'lg' as const;

/** Border-only chrome (fill / decor remain editable after). */
export const SERVICES_VERTICAL_CARD_FRAME_DEFAULTS = {
  cardBackgroundEnabled: false as const,
  cardBorder: 'soft' as const,
  cardBorderOpacity: 100,
  cardBackgroundFill: 'solid' as const,
  cardBackgroundAlternation: 'uniform' as const,
  cardDecorEnabled: false as const,
  cardDividerEnabled: false as const,
};

/** Filled card surface by default (light + dark) — Carte / Offre / Plan / Liste commerciale. */
export const SERVICES_FILLED_CARD_FRAME_DEFAULTS = {
  ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
  cardBackgroundEnabled: true as const,
};

/** Media layouts — filled surface, no outline by default. */
export const SERVICES_MEDIA_CARD_FRAME_DEFAULTS = {
  ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
  cardBorder: 'none' as const,
};

/** @deprecated Prefer SERVICES_FILLED_CARD_FRAME_DEFAULTS — Offre / Tarif alias. */
export const SERVICES_TIER_CARD_FRAME_DEFAULTS = SERVICES_FILLED_CARD_FRAME_DEFAULTS;

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

function servicesLayoutUsesMediaCardFrame(layout: PortfolioServicesGalleryLayout): boolean {
  return (
    layout === 'card-media' ||
    layout === 'media-banner' ||
    layout === 'media-checklist' ||
    layout === 'media-split'
  );
}

/**
 * Common frame shape returned by layout presets. The defaults are intentionally
 * narrow literals, but saved settings can use every valid presentation value.
 */
type ServicesGalleryLayoutFrame = Pick<
  PortfolioServicesPresentationSettings,
  | 'cardBackgroundEnabled'
  | 'cardBorder'
  | 'cardBorderOpacity'
  | 'cardBackgroundFill'
  | 'cardBackgroundAlternation'
  | 'cardDecorEnabled'
  | 'cardDividerEnabled'
>;

/**
 * Per-layout frame defaults.
 * Carte / Offre / Plan / Plan en colonnes / Liste commerciale start filled; media layouts filled without border; others stay border-only.
 */
export function servicesGalleryLayoutFrameDefaults(
  layout: PortfolioServicesGalleryLayout
): ServicesGalleryLayoutFrame {
  if (servicesLayoutUsesMediaCardFrame(layout)) return SERVICES_MEDIA_CARD_FRAME_DEFAULTS;
  return servicesLayoutUsesFilledCardFrame(layout)
    ? SERVICES_FILLED_CARD_FRAME_DEFAULTS
    : SERVICES_VERTICAL_CARD_FRAME_DEFAULTS;
}

/** Resolve frame for a layout from its individual preset, falling back to that layout’s defaults. */
function resolveServicesGalleryLayoutFrame(
  layout: PortfolioServicesGalleryLayout,
  saved?: PortfolioServicesGalleryLayoutPreset | null
): ServicesGalleryLayoutFrame {
  const defaults = servicesGalleryLayoutFrameDefaults(layout);
  if (!saved) return defaults;
  return {
    cardBackgroundEnabled:
      typeof saved.cardBackgroundEnabled === 'boolean'
        ? saved.cardBackgroundEnabled
        : defaults.cardBackgroundEnabled,
    cardBorder:
      saved.cardBorder === 'none' ||
      saved.cardBorder === 'soft' ||
      saved.cardBorder === 'solid' ||
      saved.cardBorder === 'accent'
        ? saved.cardBorder
        : defaults.cardBorder,
    cardBorderOpacity:
      typeof saved.cardBorderOpacity === 'number'
        ? saved.cardBorderOpacity
        : defaults.cardBorderOpacity,
    cardBackgroundFill:
      saved.cardBackgroundFill === 'solid' || saved.cardBackgroundFill === 'split'
        ? saved.cardBackgroundFill
        : defaults.cardBackgroundFill,
    cardBackgroundAlternation:
      saved.cardBackgroundAlternation === 'uniform' ||
      saved.cardBackgroundAlternation === 'alternate'
        ? saved.cardBackgroundAlternation
        : defaults.cardBackgroundAlternation,
    cardDecorEnabled:
      typeof saved.cardDecorEnabled === 'boolean'
        ? saved.cardDecorEnabled
        : defaults.cardDecorEnabled,
    cardDividerEnabled:
      typeof saved.cardDividerEnabled === 'boolean'
        ? saved.cardDividerEnabled
        : defaults.cardDividerEnabled,
  };
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
export function applyServicesHorizontalCardDesignDefaults(
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

/** @deprecated Prefer applyServicesHorizontalCardDesignDefaults('card', …). */
export function applyServicesVerticalCardDesignDefaults(
  services: Pick<
    PortfolioServicesPresentationSettings,
    | 'servicesBlock'
    | 'skillsBlock'
    | 'skillsGalleryLayout'
    | 'elementStyles'
    | 'servicesColorBindings'
  >
): Partial<PortfolioServicesPresentationSettings> {
  return applyServicesHorizontalCardDesignDefaults('card', services);
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

export function captureServicesGalleryLayoutPreset(
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

/**
 * Switch gallery design while keeping each layout’s presentation independent:
 * snapshot the current design, then restore the target’s saved preset
 * (or apply first-time defaults only when that design was never configured).
 * Frame/background is always restored from that layout’s individual config
 * (Offre / Tarif defaults to fill; every other design defaults to no fill).
 */
export function switchServicesGalleryLayout(
  nextLayout: PortfolioServicesGalleryLayout,
  current: PortfolioServicesPresentationSettings
): Partial<PortfolioServicesPresentationSettings> {
  const prevLayout = current.servicesGalleryLayout;
  const presets: Partial<
    Record<PortfolioServicesGalleryLayout, PortfolioServicesGalleryLayoutPreset>
  > = { ...(current.servicesGalleryLayoutPresets ?? {}) };

  if (prevLayout && prevLayout !== nextLayout) {
    presets[prevLayout] = {
      ...presets[prevLayout],
      ...captureServicesGalleryLayoutPreset(current),
    };
  }

  const saved = presets[nextLayout];
  const frame = resolveServicesGalleryLayoutFrame(nextLayout, saved);

  if (saved && Object.keys(saved).length > 0) {
    const nextColumns =
      typeof saved.servicesColumns === 'number' ? saved.servicesColumns : current.servicesColumns;
    const nextDisplayMode = saved.displayMode ?? current.displayMode;
    const restored: Partial<PortfolioServicesPresentationSettings> = {
      servicesGalleryLayout: nextLayout,
      servicesGalleryLayoutPresets: presets,
      ...saved,
      // Always re-apply this layout’s own frame — never leave the previous design’s fill.
      ...frame,
      // Older card presets often omitted this flag or inherited `false` from another layout.
      ...(nextLayout === 'card' && saved.showServiceDescription == null
        ? { showServiceDescription: true as const }
        : {}),
      // Liste / menu always shows description under delivery.
      ...(nextLayout === 'list'
        ? {
            showServiceDescription: true as const,
            showServiceDelivery: true as const,
            cardMaxWidth:
              saved.cardMaxWidth === 'full' ||
              saved.cardMaxWidth === 'xl' ||
              saved.cardMaxWidth === 'lg' ||
              saved.cardMaxWidth === 'md' ||
              saved.cardMaxWidth === 'sm'
                ? saved.cardMaxWidth === 'sm'
                  ? ('md' as const)
                  : saved.cardMaxWidth
                : ('md' as const),
          }
        : {}),
      // Plan en colonnes / Carte média / Bannière média / Média split: pleine largeur + fond activé.
      ...(nextLayout === 'plan-split' ||
      nextLayout === 'card-media' ||
      nextLayout === 'media-banner' ||
      nextLayout === 'media-split'
        ? {
            showServiceDescription: true as const,
            showServiceTasks: true as const,
            showServicePrice: true as const,
            showServiceDelivery: true as const,
            ctaDesign: 'pill-accent' as const,
            servicesColumns: 1 as const,
            cardPadding: 'lg' as const,
            cardBackgroundEnabled: true as const,
            cardBackgroundFill: 'solid' as const,
            ...(nextLayout === 'card-media' ||
            nextLayout === 'media-banner' ||
            nextLayout === 'media-split'
              ? { cardBorder: 'none' as const }
              : {}),
            ctaLabel:
              nextLayout === 'media-banner'
                ? saved.ctaLabel === 'Start Free Trial' ||
                  saved.ctaLabel === 'Get started' ||
                  !saved.ctaLabel?.trim()
                  ? ('Order now' as const)
                  : saved.ctaLabel
                : saved.ctaLabel === 'Start Free Trial' || !saved.ctaLabel?.trim()
                  ? ('Get started' as const)
                  : saved.ctaLabel,
            cardMaxWidth:
              nextLayout === 'media-banner'
                ? saved.cardMaxWidth === 'xl' ||
                  saved.cardMaxWidth === 'lg' ||
                  saved.cardMaxWidth === 'md' ||
                  saved.cardMaxWidth === 'sm'
                  ? saved.cardMaxWidth
                  : ('lg' as const)
                : nextLayout === 'media-split'
                  ? saved.cardMaxWidth === 'full' ||
                    saved.cardMaxWidth === 'xl' ||
                    saved.cardMaxWidth === 'lg' ||
                    saved.cardMaxWidth === 'md' ||
                    saved.cardMaxWidth === 'sm'
                    ? saved.cardMaxWidth
                    : ('xl' as const)
                  : saved.cardMaxWidth === 'full' || saved.cardMaxWidth === 'xl'
                    ? saved.cardMaxWidth
                    : ('full' as const),
            cardAlignment:
              nextLayout === 'media-banner' || nextLayout === 'media-split'
                ? saved.cardAlignment === 'left' ||
                  saved.cardAlignment === 'center' ||
                  saved.cardAlignment === 'right'
                  ? saved.cardAlignment
                  : ('center' as const)
                : saved.cardAlignment === 'left' ||
                    saved.cardAlignment === 'center' ||
                    saved.cardAlignment === 'right'
                  ? saved.cardAlignment
                  : ('center' as const),
            ...(nextLayout === 'plan-split'
              ? {
                  servicePricePeriodSuffix:
                    typeof saved.servicePricePeriodSuffix === 'string'
                      ? saved.servicePricePeriodSuffix
                      : '/ month',
                }
              : nextLayout === 'media-banner'
                ? { servicePricePeriodSuffix: '' as const, showServiceCta: true as const }
                : nextLayout === 'media-split'
                  ? { servicePricePeriodSuffix: '' as const, showServiceCta: false as const }
                  : { servicePricePeriodSuffix: '' as const, showServiceCta: false as const }),
          }
        : {}),
      // Média checklist: image + titre + tâches cochées + CTA only.
      ...(nextLayout === 'media-checklist'
        ? {
            showServiceTitle: true as const,
            showServiceDescription: false as const,
            showServicePrice: false as const,
            showServiceDelivery: false as const,
            showServiceTasks: true as const,
            showServiceCta: true as const,
            ctaDesign: 'pill-accent' as const,
            ctaLabel: 'Get started' as const,
            servicesColumns: 1 as const,
            cardPadding: 'lg' as const,
            cardBackgroundEnabled: true as const,
            cardBackgroundFill: 'solid' as const,
            servicePricePeriodSuffix: '' as const,
            servicesTaskBulletStyle: 'check' as const,
            servicesTaskBulletSource: 'section' as const,
            cardBorder: 'none' as const,
            cardMaxWidth: 'full' as const,
            cardAlignment:
              saved.cardAlignment === 'left' ||
              saved.cardAlignment === 'center' ||
              saved.cardAlignment === 'right'
                ? saved.cardAlignment
                : ('center' as const),
          }
        : {}),
      // Carte / Offre / Plan: même largeur de cadre + fond activé.
      ...(nextLayout === 'card' || nextLayout === 'tier' || nextLayout === 'plan'
        ? {
            cardBackgroundEnabled: true as const,
            cardBackgroundFill: 'solid' as const,
            cardMaxWidth:
              saved.cardMaxWidth === 'full' || saved.cardMaxWidth === 'xl'
                ? saved.cardMaxWidth
                : SERVICES_HORIZONTAL_CARD_MAX_WIDTH,
          }
        : {}),
      // Offre / Tarif: description on.
      ...(nextLayout === 'tier' ? { showServiceDescription: true as const } : {}),
      // Plan tarifaire: description hidden by default; filled CTA.
      ...(nextLayout === 'plan'
        ? {
            showServiceDescription: false as const,
            ctaDesign: 'pill-accent' as const,
          }
        : {}),
      // Liste commerciale / tarifaire: roomier price + CTA columns + filled surface.
      ...(nextLayout === 'commercial-list'
        ? {
            cardBackgroundEnabled: true as const,
            cardBackgroundFill: 'solid' as const,
            commercialPriceWidthPx:
              typeof saved.commercialPriceWidthPx === 'number' &&
              saved.commercialPriceWidthPx > 160
                ? saved.commercialPriceWidthPx
                : 200,
            commercialCtaWidthPx:
              typeof saved.commercialCtaWidthPx === 'number' && saved.commercialCtaWidthPx > 160
                ? Math.max(saved.commercialCtaWidthPx, 210)
                : 210,
            ctaDesign: 'pill-accent' as const,
            servicesTaskBulletStyle: 'check' as const,
            servicesTaskBulletSource: 'section' as const,
            servicesTaskBulletSize: 'custom' as const,
            servicesTaskBulletSizePx: 24,
            servicesTaskBulletWeight: 'bold' as const,
            cardMaxWidth:
              saved.cardMaxWidth === 'full' ||
              saved.cardMaxWidth === 'xl' ||
              saved.cardMaxWidth === 'lg' ||
              saved.cardMaxWidth === 'md' ||
              saved.cardMaxWidth === 'sm'
                ? saved.cardMaxWidth === 'full' || saved.cardMaxWidth === 'lg'
                  ? ('xl' as const) // migrate older compact presets to wider default
                  : saved.cardMaxWidth
                : ('xl' as const),
            cardAlignment:
              saved.cardAlignment === 'left' ||
              saved.cardAlignment === 'center' ||
              saved.cardAlignment === 'right'
                ? saved.cardAlignment
                : ('center' as const),
            commercialColumnGapPx:
              typeof saved.commercialColumnGapPx === 'number' &&
              saved.commercialColumnGapPx >= 32
                ? saved.commercialColumnGapPx
                : 48,
          }
        : {}),
      // Carte / Plan / Offre / Plan en colonnes share Carte horizontal type scale.
      ...(nextLayout === 'card' ||
      nextLayout === 'plan' ||
      nextLayout === 'tier' ||
      nextLayout === 'plan-split' ||
      nextLayout === 'card-media' ||
      nextLayout === 'media-banner' ||
      nextLayout === 'media-checklist' ||
      nextLayout === 'media-split'
        ? {
            servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
            elementStyles: servicesVerticalCardElementStyles(
              (saved.elementStyles as PortfolioServicesElementStyles | undefined) ??
                current.elementStyles
            ),
          }
        : {}),
      // Offre / Tarif CTA is filled (plein couleur).
      ...(nextLayout === 'tier' ||
      nextLayout === 'plan-split' ||
      nextLayout === 'card-media' ||
      nextLayout === 'media-banner' ||
      nextLayout === 'media-checklist' ||
      nextLayout === 'media-split'
        ? { ctaDesign: 'pill-accent' as const }
        : {}),
      // Period suffix: keep for Plan en colonnes; clear elsewhere.
      ...(nextLayout === 'plan-split'
        ? {}
        : { servicePricePeriodSuffix: '' as const }),
      servicesBlock: {
        ...current.servicesBlock,
        galleryLayout: nextLayout,
        columns:
          nextLayout === 'plan-split' ||
          nextLayout === 'card-media' ||
          nextLayout === 'media-banner' ||
          nextLayout === 'media-checklist' ||
          nextLayout === 'media-split'
            ? (1 as const)
            : nextColumns,
        displayMode: nextDisplayMode,
        ...frame,
        ...(servicesLayoutUsesFilledCardFrame(nextLayout)
          ? {
              cardBackgroundEnabled: true as const,
              cardBackgroundFill: 'solid' as const,
            }
          : {}),
      },
    };
    if (current.useHeroPalette !== false) {
      const palettePatch = applyServicesPaletteToSettings({
        ...current,
        ...restored,
      }) as Partial<PortfolioServicesPresentationSettings>;
      const filledFrame = servicesLayoutUsesFilledCardFrame(nextLayout)
        ? {
            cardBackgroundEnabled: true as const,
            cardBackgroundFill: 'solid' as const,
          }
        : {};
      return {
        ...restored,
        ...palettePatch,
        ...frame,
        ...filledFrame,
        servicesGalleryLayout: nextLayout,
        servicesGalleryLayoutPresets: presets,
        useHeroPalette: true,
        servicesBlock: {
          ...restored.servicesBlock!,
          ...frame,
          ...filledFrame,
        },
      };
    }
    return restored;
  }

  const firstTime = servicesGalleryLayoutSettingsPatch(nextLayout, current);
  const filledFrameFirst = servicesLayoutUsesFilledCardFrame(nextLayout)
    ? {
        cardBackgroundEnabled: true as const,
        cardBackgroundFill: 'solid' as const,
      }
    : {};
  const seeded: Partial<PortfolioServicesPresentationSettings> = {
    ...firstTime,
    // First visit: layout defaults for frame (filled layouts keep solid fill).
    ...frame,
    ...filledFrameFirst,
    ...(nextLayout === 'plan-split'
      ? {}
      : { servicePricePeriodSuffix: '' as const }),
    servicesGalleryLayout: nextLayout,
    servicesGalleryLayoutPresets: presets,
    servicesBlock: {
      ...current.servicesBlock,
      ...(firstTime.servicesBlock ?? {}),
      galleryLayout: nextLayout,
      ...frame,
      ...filledFrameFirst,
    },
  };
  if (current.useHeroPalette !== false) {
    const palettePatch = applyServicesPaletteToSettings({
      ...current,
      ...seeded,
    }) as Partial<PortfolioServicesPresentationSettings>;
    return {
      ...seeded,
      ...palettePatch,
      ...frame,
      ...filledFrameFirst,
      servicesGalleryLayout: nextLayout,
      servicesGalleryLayoutPresets: presets,
      useHeroPalette: true,
      servicesBlock: {
        ...seeded.servicesBlock!,
        ...frame,
        ...filledFrameFirst,
      },
    };
  }
  return seeded;
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

export function servicesGalleryLayoutSettingsPatch(
  layout: PortfolioServicesGalleryLayout,
  current?: Pick<
    PortfolioServicesPresentationSettings,
    | 'servicesBlock'
    | 'skillsBlock'
    | 'skillsGalleryLayout'
    | 'elementStyles'
    | 'servicesColorBindings'
  >
): Partial<PortfolioServicesPresentationSettings> {
  if (layout === 'commercial-list') {
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      servicesContentAlignment: 'left',
      servicePriceAlign: 'left',
      ctaAlignment: 'left',
      // Compact card width with a bit of air (still configurable via Largeur de la carte).
      cardMaxWidth: 'xl',
      cardAlignment: 'center',
      commercialPriceWidthPx: 200,
      commercialCtaWidthPx: 210,
      commercialColumnGapPx: 48,
      ctaDesign: 'pill-accent',
      servicesTaskBulletStyle: 'check',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: 24,
      servicesTaskBulletWeight: 'bold',
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
    };
  }
  if (layout === 'service-selector') {
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      servicesContentAlignment: 'left',
      servicePriceAlign: 'right',
      ctaAlignment: 'left',
      ctaDesign: 'pill-accent',
      servicesTaskBulletStyle: 'dash',
      servicesTaskBulletSource: 'section',
      ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
    };
  }
  if (layout === 'service-accordion') {
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      servicesContentAlignment: 'left',
      servicePriceAlign: 'right',
      ctaAlignment: 'left',
      ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
    };
  }
  if (layout === 'list') {
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      cardMaxWidth: 'md',
      ctaAlignment: 'left',
      showServiceDescription: true,
      showServiceDelivery: true,
      ...SERVICES_VERTICAL_CARD_FRAME_DEFAULTS,
    };
  }
  if (layout === 'plan-split') {
    const bindings = current
      ? mergeServicesColorBindings(
          DEFAULT_SERVICES_COLOR_BINDINGS,
          current.servicesColorBindings
        )
      : { ...DEFAULT_SERVICES_COLOR_BINDINGS };
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      cardMaxWidth: 'full',
      cardAlignment: 'center',
      cardPadding: 'lg',
      servicesContentAlignment: 'left',
      servicePriceAlign: 'left',
      servicePricePrefixEnabled: false,
      servicePricePeriodSuffix: '/ month',
      showServiceTitle: true,
      showServiceDescription: true,
      showServicePrice: true,
      showServiceTasks: true,
      showServiceCta: true,
      ctaLabel: 'Get started',
      ctaDesign: 'pill-accent',
      ctaAlignment: 'left',
      servicesTaskBulletStyle: 'check-circle',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      servicesTaskBulletWeight: 'regular',
      servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
      elementStyles: servicesVerticalCardElementStyles(
        current?.elementStyles ?? DEFAULT_SERVICES_ELEMENT_STYLES
      ),
      servicesColorBindings: {
        ...bindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
      ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
      ...(current
        ? {
            servicesBlock: {
              ...current.servicesBlock,
              galleryLayout: layout,
              columns: 1 as const,
              displayMode: 'grid' as const,
              ...SERVICES_FILLED_CARD_FRAME_DEFAULTS,
            },
          }
        : {}),
    };
  }
  if (layout === 'card-media') {
    const bindings = current
      ? mergeServicesColorBindings(
          DEFAULT_SERVICES_COLOR_BINDINGS,
          current.servicesColorBindings
        )
      : { ...DEFAULT_SERVICES_COLOR_BINDINGS };
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      cardMaxWidth: 'full',
      cardAlignment: 'center',
      cardPadding: 'lg',
      servicesContentAlignment: 'left',
      servicePriceAlign: 'left',
      servicePricePrefixEnabled: false,
      servicePricePeriodSuffix: '',
      showServiceTitle: true,
      showServiceDescription: true,
      showServicePrice: true,
      showServiceDelivery: true,
      showServiceTasks: true,
      showServiceCta: false,
      ctaLabel: 'Get started',
      ctaDesign: 'pill-accent',
      ctaAlignment: 'left',
      servicesTaskBulletStyle: 'check-circle',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      servicesTaskBulletWeight: 'regular',
      servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
      elementStyles: servicesVerticalCardElementStyles(
        current?.elementStyles ?? DEFAULT_SERVICES_ELEMENT_STYLES
      ),
      servicesColorBindings: {
        ...bindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
      ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
      ...(current
        ? {
            servicesBlock: {
              ...current.servicesBlock,
              galleryLayout: layout,
              columns: 1 as const,
              displayMode: 'grid' as const,
              ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
            },
          }
        : {}),
    };
  }
  if (layout === 'media-banner') {
    const bindings = current
      ? mergeServicesColorBindings(
          DEFAULT_SERVICES_COLOR_BINDINGS,
          current.servicesColorBindings
        )
      : { ...DEFAULT_SERVICES_COLOR_BINDINGS };
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      cardMaxWidth: SERVICES_MEDIA_BANNER_DEFAULT_MAX_WIDTH,
      cardAlignment: 'center',
      cardPadding: 'lg',
      servicesContentAlignment: 'left',
      servicePriceAlign: 'left',
      servicePricePrefixEnabled: false,
      servicePricePeriodSuffix: '',
      showServiceTitle: true,
      showServiceDescription: true,
      showServicePrice: true,
      showServiceDelivery: true,
      showServiceTasks: true,
      showServiceCta: true,
      ctaLabel: 'Order now',
      ctaDesign: 'pill-accent',
      ctaAlignment: 'left',
      servicesTaskBulletStyle: 'check-circle',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      servicesTaskBulletWeight: 'regular',
      servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
      elementStyles: servicesVerticalCardElementStyles(
        current?.elementStyles ?? DEFAULT_SERVICES_ELEMENT_STYLES
      ),
      servicesColorBindings: {
        ...bindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
      ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
      ...(current
        ? {
            servicesBlock: {
              ...current.servicesBlock,
              galleryLayout: layout,
              columns: 1 as const,
              displayMode: 'grid' as const,
              ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
            },
          }
        : {}),
    };
  }
  if (layout === 'media-checklist') {
    const bindings = current
      ? mergeServicesColorBindings(
          DEFAULT_SERVICES_COLOR_BINDINGS,
          current.servicesColorBindings
        )
      : { ...DEFAULT_SERVICES_COLOR_BINDINGS };
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      cardMaxWidth: 'full',
      cardAlignment: 'center',
      cardPadding: 'lg',
      servicesContentAlignment: 'left',
      servicePriceAlign: 'left',
      servicePricePrefixEnabled: false,
      servicePricePeriodSuffix: '',
      showServiceTitle: true,
      showServiceDescription: false,
      showServicePrice: false,
      showServiceDelivery: false,
      showServiceTasks: true,
      showServiceCta: true,
      ctaLabel: 'Get started',
      ctaDesign: 'pill-accent',
      ctaAlignment: 'left',
      servicesTaskBulletStyle: 'check',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      servicesTaskBulletWeight: 'regular',
      servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
      elementStyles: servicesVerticalCardElementStyles(
        current?.elementStyles ?? DEFAULT_SERVICES_ELEMENT_STYLES
      ),
      servicesColorBindings: {
        ...bindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
      ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
      ...(current
        ? {
            servicesBlock: {
              ...current.servicesBlock,
              galleryLayout: layout,
              columns: 1 as const,
              displayMode: 'grid' as const,
              ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
            },
          }
        : {}),
    };
  }
  if (layout === 'media-split') {
    const bindings = current
      ? mergeServicesColorBindings(
          DEFAULT_SERVICES_COLOR_BINDINGS,
          current.servicesColorBindings
        )
      : { ...DEFAULT_SERVICES_COLOR_BINDINGS };
    return {
      servicesGalleryLayout: layout,
      displayMode: 'grid',
      servicesColumns: 1,
      cardMaxWidth: 'xl',
      cardAlignment: 'center',
      cardPadding: 'lg',
      servicesContentAlignment: 'left',
      servicePriceAlign: 'left',
      servicePricePrefixEnabled: false,
      servicePricePeriodSuffix: '',
      showServiceTitle: true,
      showServiceDescription: true,
      showServicePrice: true,
      showServiceDelivery: true,
      showServiceTasks: true,
      showServiceCta: false,
      ctaLabel: 'Get started',
      ctaDesign: 'pill-accent',
      ctaAlignment: 'left',
      servicesTaskBulletStyle: 'check-square',
      servicesTaskBulletSource: 'section',
      servicesTaskBulletSize: 'custom',
      servicesTaskBulletSizePx: SERVICES_VERTICAL_CARD_TASK_BULLET_SIZE_PX,
      servicesTaskBulletWeight: 'regular',
      servicesTaskBulletWeightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.regular,
      elementStyles: servicesVerticalCardElementStyles(
        current?.elementStyles ?? DEFAULT_SERVICES_ELEMENT_STYLES
      ),
      servicesColorBindings: {
        ...bindings,
        tasksBullet: 'principal',
        ctaAccent: 'principal',
        ctaBorder: 'principal',
      },
      ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
      ...(current
        ? {
            servicesBlock: {
              ...current.servicesBlock,
              galleryLayout: layout,
              columns: 1 as const,
              displayMode: 'grid' as const,
              ...SERVICES_MEDIA_CARD_FRAME_DEFAULTS,
            },
          }
        : {}),
    };
  }
  if (layout === 'tier' || layout === 'plan' || layout === 'card') {
    if (current) return applyServicesHorizontalCardDesignDefaults(layout, current);
    return applyServicesHorizontalCardDesignDefaults(layout, {
      servicesBlock: createDefaultServicesBlockSettings('services', {
        ...DEFAULT_SERVICES_PRESENTATION_BASE,
        ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
      }),
      skillsBlock: createDefaultServicesBlockSettings('skills', {
        ...DEFAULT_SERVICES_PRESENTATION_BASE,
        ...DEFAULT_SERVICES_CARD_BACKGROUND_SETTINGS,
      }),
      skillsGalleryLayout: 'card',
      elementStyles: DEFAULT_SERVICES_ELEMENT_STYLES,
      servicesColorBindings: { ...DEFAULT_SERVICES_COLOR_BINDINGS },
    });
  }
  return { servicesGalleryLayout: layout };
}

export function servicesGridClass(displayMode: PortfolioServicesDisplayMode): string {
  if (displayMode === 'stack' || displayMode === 'coverflow' || displayMode === 'deck') {
    return 'flex flex-col gap-5';
  }
  return 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3';
}

export function servicesCardWidthClass(displayMode: PortfolioServicesDisplayMode): string {
  if (displayMode === 'stack' || displayMode === 'coverflow' || displayMode === 'deck') return 'w-full';
  // Carte / Offre / Plan marquee — same slightly roomier footprint.
  return 'w-[20.5rem] shrink-0 py-1 sm:w-[22.5rem] lg:w-[26rem]';
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
export function servicesCommercialListMaxWidthClass(
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

/** Wider, more spaced steps for the Tool inspector (vs. card tiles). */
export function skillsInspectorMaxWidthClass(
  maxWidth: PortfolioServicesCardMaxWidth | undefined
): string {
  switch (maxWidth) {
    case 'sm':
      return 'w-full max-w-lg';
    case 'md':
      return 'w-full max-w-2xl';
    case 'lg':
      return 'w-full max-w-4xl';
    case 'xl':
      return 'w-full max-w-6xl';
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

/** Align a width-capped Tool inspector inside its column. */
export function skillsInspectorMaxWidthShellClass(
  maxWidth: PortfolioServicesCardMaxWidth | undefined,
  alignment: PortfolioServicesCardAlignment | PortfolioServicesContentAlignment = 'center'
): string {
  const width = skillsInspectorMaxWidthClass(maxWidth);
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
export function pickServicesCardBackgroundAlternation(
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
    sectionOrganization: 'distinct' as const,
    layoutMode,
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
