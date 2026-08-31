import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  applyToolsPaletteToSettings,
  DEFAULT_TOOLS_COLOR_BINDINGS,
  DEFAULT_TOOLS_PALETTE,
  mergeToolsColorBindings,
  mergeToolsPalette,
  type PortfolioToolsColorBindings,
  type PortfolioToolsPalette,
} from '@/components/portfolio/portfolio-tools-palette-settings';

/**
 * `workflow-rail` — logo tiles.
 * `brand-cards` — card grid (icon top or left).
 * `brand-directory` — editorial list rows.
 * `brand-index` — portfolio index rows: logo, title + use cases, description right.
 * `brand-row` — compact horizontal grid: logo + name per cell, vertical dividers.
 * `brand-float` — Framer / Landbook fluid tile grid: logo-centered cards, hover lift & glow.
 * `level-stat-bars` — minimal grid: logo, name, segmented level bar.
 * `level-progress-rows` — ruled list: logo, name, progress bar (no logo frame).
 * `level-category-rows` — editorial rows: logo, name + category, thin bar, % at end.
 * `level-table-rows` — table without header: logo + name, category, level label, %.
 * `level-circular-cards` — card grid: circular ring around logo (no inner square), name + %.
 * `level-bento-categories` — bento grid: one card per category, logo + name + level label per row.
 * `level-star-cards` — horizontal cards: name left, 5-star rating right (no logos).
 * `level-svg-rings` — card grid: SVG progress ring with tool name centered inside (no logos).
 */
export type PortfolioToolsDesign =
  | 'workflow-rail'
  | 'brand-cards'
  | 'brand-directory'
  | 'brand-index'
  | 'brand-row'
  | 'brand-float'
  | 'level-stat-bars'
  | 'level-progress-rows'
  | 'level-category-rows'
  | 'level-table-rows'
  | 'level-circular-cards'
  | 'level-bento-categories'
  | 'level-star-cards'
  | 'level-svg-rings';

export type PortfolioToolsBrandCardsIconPlacement = 'top' | 'left';

export type PortfolioToolsHeaderFont = 'sans' | 'serif' | 'display';
export type PortfolioToolsHeaderAlignment = 'left' | 'center' | 'right';
export type PortfolioToolsContentAlignment = 'left' | 'center' | 'right';
export type PortfolioToolsTitlePreset =
  | 'workflow-tools'
  | 'tools'
  | 'stack'
  | 'core-stack'
  | 'tech-stack'
  | 'custom';
export type PortfolioToolsSubtitlePreset = 'none' | 'custom';
export type PortfolioToolsTileSize = 'sm' | 'md' | 'lg' | 'xl';
/** Spacing between tool cards / items. `tight` = current default. */
export type PortfolioToolsCardGap = 'tight' | 'medium' | 'large' | 'xlarge';
/** Row spacing for `level-progress-rows` only. */
export type PortfolioToolsLevelProgressRowGap = 'tight' | 'medium' | 'large' | 'xlarge';
/** Visual style for level progress / stat bars across level-indicator designs. */
export type PortfolioToolsLevelBarStyle = 'rectangle' | 'pill' | 'pill-gradient' | 'segments';
/** Bar track height and % label size — `tight` = current default (smallest). */
export type PortfolioToolsLevelBarSize = 'tight' | 'small' | 'medium' | 'large' | 'xlarge';
/** Row ordering for `level-table-rows`. */
export type PortfolioToolsLevelTableGroupBy = 'category' | 'level';
/** Columns for `level-progress-rows` on large screens — 2-up activates at `lg` only. */
export type PortfolioToolsLevelProgressColumnsPerRow = 1 | 2;
/** Level indicator style — `brand-directory` design only. */
export type PortfolioToolsBrandDirectoryLevelStyle = 'tag' | 'percentage' | 'stat' | 'dots';
/** Columns per row on large screens — brand-cards & brand-directory. Default 1. */
export type PortfolioToolsBrandGridColumnsPerRow = 1 | 2 | 3 | 4;
/** Cell border style for `brand-row`. */
export type PortfolioToolsBrandRowCellStyle = 'dividers' | 'frames' | 'none';
/** Grid mode for `brand-float`. */
export type PortfolioToolsBrandFloatGridMode = 'fluid' | 'fixed';
/** Tile density for `brand-float` fluid grid. */
export type PortfolioToolsBrandFloatTileDensity = 'compact' | 'comfortable' | 'spacious';
/** Fixed columns for `brand-float` when grid mode is fixed. */
export type PortfolioToolsBrandFloatColumnsPerRow = 2 | 3 | 4;
/** Card surface for `brand-float`. */
export type PortfolioToolsBrandFloatCardStyle = 'framed' | 'plain';
/** Card frame for level card grids (`level-stat-bars`, `level-circular-cards`, `level-bento-categories`). */
export type PortfolioToolsLevelIndicatorCardStyle = 'framed' | 'plain';
/** Bento category grid — equal columns or width by item count. */
export type PortfolioToolsLevelBentoGridMode = 'asymmetric' | 'equal';
/** How proficiency is shown on level-indicator rows (text or visual without labels). */
export type PortfolioToolsLevelIndicatorDisplayStyle =
  | 'text'
  | 'stars'
  | 'dots'
  | 'progress-bar';
/** @deprecated Use `PortfolioToolsBrandGridColumnsPerRow` */
export type PortfolioToolsBrandDirectoryColumnsPerRow = PortfolioToolsBrandGridColumnsPerRow;

export type PortfolioToolsPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioToolsDesign;
  titlePreset: PortfolioToolsTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioToolsSubtitlePreset;
  subtitleCustom: string;
  headerAlignment: PortfolioToolsHeaderAlignment;
  /** @deprecated Legacy shared alignment — use design-specific fields below. */
  contentAlignment: PortfolioToolsContentAlignment;
  titleFont: PortfolioToolsHeaderFont;
  subtitleFont: PortfolioToolsHeaderFont;
  titleColor: string;
  subtitleColor: string;
  tileBackgroundColor: string;
  labelColor: string;
  descriptionColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  chipBackgroundColor: string;
  chipTextColor: string;
  levelAccentColor: string;
  tileSize: PortfolioToolsTileSize;
  cardGap: PortfolioToolsCardGap;
  /** Vertical spacing between rows — `level-progress-rows` design only. */
  levelProgressRowGap: PortfolioToolsLevelProgressRowGap;
  /** `level-progress-rows` only — 2 per row on large screens (`lg+`). Default 1. */
  levelProgressColumnsPerRow: PortfolioToolsLevelProgressColumnsPerRow;
  /** `level-progress-rows` only. Default center. */
  levelProgressContentAlignment: PortfolioToolsContentAlignment;
  /** Level bar shape — progress rows, category rows, stat bars, etc. Default pill. */
  levelBarStyle: PortfolioToolsLevelBarStyle;
  /** Level bar height and % label size. Default tight (current compact size). */
  levelBarSize: PortfolioToolsLevelBarSize;
  /** `workflow-rail` only. Default center. */
  workflowRailContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-directory` only — how the level is rendered on each row. Default percentage. */
  brandDirectoryLevelStyle: PortfolioToolsBrandDirectoryLevelStyle;
  /** `brand-cards` only — columns on `lg+`. Default 1. */
  brandCardsColumnsPerRow: PortfolioToolsBrandGridColumnsPerRow;
  /** `brand-cards` only. Default center. */
  brandCardsContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-cards` only — icon above copy or beside it (showcase-style). Default top. */
  brandCardsIconPlacement: PortfolioToolsBrandCardsIconPlacement;
  /** `brand-directory` only — columns on `lg+`. Default 1. */
  brandDirectoryColumnsPerRow: PortfolioToolsBrandGridColumnsPerRow;
  /** `brand-directory` only. Default center. */
  brandDirectoryContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-index` only. Default center. */
  brandIndexContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-cards` only — stretch to container width instead of max-w-3xl. Default false. */
  brandCardsFullWidth: boolean;
  /** `brand-directory` only — stretch to container width instead of max-w-3xl. Default false. */
  brandDirectoryFullWidth: boolean;
  /** `brand-index` only — stretch to container width instead of max-w-5xl. Default false. */
  brandIndexFullWidth: boolean;
  /** All level-indicator designs — stretch to container width. Default false. */
  levelIndicatorFullWidth: boolean;
  /** @deprecated Use `levelIndicatorFullWidth` — kept for saved settings migration. */
  levelTableFullWidth: boolean;
  /** Level-indicator designs — item order by category or proficiency level. Default category. */
  levelTableGroupBy: PortfolioToolsLevelTableGroupBy;
  /** All level-indicator designs — category filter chips above the list. Default false. */
  levelIndicatorShowCategoryFilter: boolean;
  /** @deprecated Use `levelIndicatorShowCategoryFilter` — kept for saved settings migration. */
  levelTableShowCategoryFilter: boolean;
  /** Level card grids — bordered card surface. Default framed. */
  levelIndicatorCardStyle: PortfolioToolsLevelIndicatorCardStyle;
  /** `level-bento-categories` only — equal columns or wider tiles for larger categories. */
  levelBentoGridMode: PortfolioToolsLevelBentoGridMode;
  /** Level-indicator designs — text label, stars, dots, or progress bar (no level text). */
  levelIndicatorDisplayStyle: PortfolioToolsLevelIndicatorDisplayStyle;
  /** `brand-row` only — columns on `lg+` (and `sm+` when 2–3). Default 3. */
  brandRowColumnsPerRow: PortfolioToolsBrandGridColumnsPerRow;
  /** `brand-row` only. Default center. */
  brandRowContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-row` only — shared dividers or individual framed cells. Default dividers. */
  brandRowCellStyle: PortfolioToolsBrandRowCellStyle;
  /** `brand-float` only — auto-fill fluid or fixed column grid. Default fluid. */
  brandFloatGridMode: PortfolioToolsBrandFloatGridMode;
  /** `brand-float` + fixed mode — 2–4 columns on large screens. Default 3. */
  brandFloatColumnsPerRow: PortfolioToolsBrandFloatColumnsPerRow;
  /** `brand-float` + fluid mode — min tile width preset. Default comfortable. */
  brandFloatTileDensity: PortfolioToolsBrandFloatTileDensity;
  /** `brand-float` only. Default center. */
  brandFloatContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-float` only — bordered card or open tile. Default framed. */
  brandFloatCardStyle: PortfolioToolsBrandFloatCardStyle;
  showLabels: boolean;
  showDescription: boolean;
  showUseCases: boolean;
  /** Brand cards — show skill category above the name. Default true (Tools); Stack forces off. */
  showCategory?: boolean;
  showLevel: boolean;
  /** Explicit opt-in — legacy saves had `showLevel: true` by default without user action. */
  showLevelOptIn?: boolean;
  /** Opt-in grey pad behind logos. Off by default (`brand-float` on unless opted out). */
  iconBackgroundEnabled: boolean;
  /** Explicit opt-in/out for icon background (legacy saves had global `false`). */
  iconBackgroundOptIn?: boolean;
  /** Render all tool logos in noir & blanc (grayscale). Off by default. */
  logosGrayscale: boolean;
  useHeroPalette: boolean;
  toolsPalette?: PortfolioToolsPalette;
  toolsColorBindings?: PortfolioToolsColorBindings;
  activeColorMode?: 'light' | 'dark';
};

export type PortfolioToolsSectionSettings = PortfolioSectionCopy & PortfolioToolsPresentationSettings;

export const PORTFOLIO_TOOLS_DESIGN_OPTIONS: {
  value: PortfolioToolsDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'workflow-rail',
    label: 'Workflow rail',
    description: 'Logo in a rounded tile, tool name below — one horizontal row.',
  },
  {
    value: 'brand-cards',
    label: 'Brand cards',
    description:
      'Card grid — logo top or left, name, description, use cases, and level.',
  },
  {
    value: 'brand-directory',
    label: 'Brand directory',
    description:
      'Webflow / Framer directory rows — logo left, details center, level right, hairline dividers.',
  },
  {
    value: 'brand-index',
    label: 'Brand index',
    description:
      'Portfolio index rows — logo left, title + use cases, description right, hairline dividers.',
  },
  {
    value: 'brand-row',
    label: 'Brand row',
    description:
      'Compact horizontal grid — logo and name per cell, vertical dividers, no arrows.',
  },
  {
    value: 'brand-float',
    label: 'Brand float',
    description:
      'Framer / Landbook fluid tile grid — logo-centered cards, hover lift, soft glow, optional description & tags.',
  },
  {
    value: 'level-stat-bars',
    label: 'Level stat bars',
    description:
      'Minimal card grid — logo, name, and a 4-segment proficiency bar (no text level labels).',
  },
  {
    value: 'level-progress-rows',
    label: 'Level progress rows',
    description:
      'Editorial list — logo without frame, name, and a horizontal progress bar (no text level labels).',
  },
  {
    value: 'level-category-rows',
    label: 'Level category rows',
    description:
      'Editorial list — logo, name + category label, thin progress bar and % on the right.',
  },
  {
    value: 'level-table-rows',
    label: 'Level table rows',
    description:
      'Table layout without header — logo + name, category, colored level label, and % (no experience column).',
  },
  {
    value: 'level-circular-cards',
    label: 'Level circular cards',
    description:
      'Card grid — circular ring around the logo (no inner square), name and % below.',
  },
  {
    value: 'level-star-cards',
    label: 'Level star cards',
    description:
      'Horizontal framed cards — skill name on the left, 5-star rating on the right (no logos).',
  },
  {
    value: 'level-svg-rings',
    label: 'Level SVG rings',
    description:
      'Card grid — circular SVG progress ring with the tool name centered inside (no logo, no %).',
  },
  {
    value: 'level-bento-categories',
    label: 'Level bento categories',
    description:
      'Bento grid — one card per category (Frontend, Backend…), logo + name + colored level label per row.',
  },
];

export const PORTFOLIO_TOOLS_TITLE_PRESET_OPTIONS = [
  { value: 'workflow-tools' as const, label: 'Workflow & Tools', description: 'Default title.' },
  { value: 'tools' as const, label: 'Tools', description: 'Short label.' },
  { value: 'stack' as const, label: 'Stack', description: 'Tech stack framing.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own title.' },
];

export const PORTFOLIO_TOOLS_LEVEL_BAR_STYLE_OPTIONS: {
  value: PortfolioToolsLevelBarStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'rectangle',
    label: 'Rectangle',
    description: 'Continuous horizontal bar with sharp corners (no radius) — default.',
  },
  {
    value: 'pill',
    label: 'Pill',
    description: 'Continuous bar with rounded ends.',
  },
  {
    value: 'pill-gradient',
    label: 'Gradient pill',
    description: 'Pill with a fade-out gradient toward the right.',
  },
  {
    value: 'segments',
    label: 'Segments',
    description: '10 separate pills — one pill per 10% step.',
  },
];

export function resolveToolsLevelBarStyle(
  presentation: Pick<PortfolioToolsPresentationSettings, 'levelBarStyle'>
): PortfolioToolsLevelBarStyle {
  const style = presentation.levelBarStyle;
  if (
    style === 'rectangle' ||
    style === 'pill' ||
    style === 'pill-gradient' ||
    style === 'segments'
  ) {
    return style;
  }
  return 'rectangle';
}

export const PORTFOLIO_TOOLS_LEVEL_BAR_SIZE_OPTIONS: {
  value: PortfolioToolsLevelBarSize;
  label: string;
  description: string;
}[] = [
  {
    value: 'tight',
    label: 'Tight',
    description: 'Thin bar and compact % label (14px).',
  },
  {
    value: 'small',
    label: 'Small',
    description: 'Slightly larger bar and % label (16px) — default.',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Medium bar and % label (18px).',
  },
  {
    value: 'large',
    label: 'Large',
    description: 'Large bar and % label (20px).',
  },
  {
    value: 'xlarge',
    label: 'Extra large',
    description: 'Extra large bar and % label (24px).',
  },
];

export function resolveToolsLevelBarSize(
  presentation: Pick<PortfolioToolsPresentationSettings, 'levelBarSize'>
): PortfolioToolsLevelBarSize {
  const size = presentation.levelBarSize;
  if (
    size === 'tight' ||
    size === 'small' ||
    size === 'medium' ||
    size === 'large' ||
    size === 'xlarge'
  ) {
    return size;
  }
  return 'small';
}

const LEVEL_BAR_HEIGHT_CLASS: Record<
  PortfolioToolsLevelBarSize,
  { default: string; thin: string }
> = {
  tight: { default: 'h-2', thin: 'h-1 sm:h-1.5' },
  small: { default: 'h-2.5', thin: 'h-1.5 sm:h-2' },
  medium: { default: 'h-3', thin: 'h-2 sm:h-2.5' },
  large: { default: 'h-3.5', thin: 'h-2.5 sm:h-3' },
  xlarge: { default: 'h-4', thin: 'h-3 sm:h-3.5' },
};

const LEVEL_BAR_PERCENT_CLASS: Record<PortfolioToolsLevelBarSize, string> = {
  tight: 'text-sm',
  small: 'text-base',
  medium: 'text-lg',
  large: 'text-xl',
  xlarge: 'text-2xl',
};

export function toolsLevelBarHeightClass(
  size: PortfolioToolsLevelBarSize,
  variant: 'default' | 'thin' = 'default'
): string {
  return LEVEL_BAR_HEIGHT_CLASS[size][variant];
}

export function toolsLevelBarPercentClass(size: PortfolioToolsLevelBarSize): string {
  return LEVEL_BAR_PERCENT_CLASS[size];
}

export const PORTFOLIO_TOOLS_LEVEL_TABLE_GROUP_BY_OPTIONS: {
  value: PortfolioToolsLevelTableGroupBy;
  label: string;
  description: string;
}[] = [
  {
    value: 'category',
    label: 'Category',
    description: 'Sort items by category (Backend, Frontend, DevOps…), then by name.',
  },
  {
    value: 'level',
    label: 'Level',
    description: 'Sort items by proficiency (Expert → Beginner), then by name.',
  },
];

export function resolveToolsLevelTableGroupBy(
  presentation: Pick<PortfolioToolsPresentationSettings, 'levelTableGroupBy'>
): PortfolioToolsLevelTableGroupBy {
  return presentation.levelTableGroupBy === 'level' ? 'level' : 'category';
}

export function resolveToolsLevelIndicatorFullWidth(
  presentation: Pick<
    PortfolioToolsPresentationSettings,
    'levelIndicatorFullWidth' | 'levelTableFullWidth'
  >
): boolean {
  return (
    presentation.levelIndicatorFullWidth === true || presentation.levelTableFullWidth === true
  );
}

export function resolveToolsBrandCardsFullWidth(
  presentation: Pick<PortfolioToolsPresentationSettings, 'brandCardsFullWidth'>
): boolean {
  return presentation.brandCardsFullWidth === true;
}

export function resolveToolsBrandDirectoryFullWidth(
  presentation: Pick<PortfolioToolsPresentationSettings, 'brandDirectoryFullWidth'>
): boolean {
  return presentation.brandDirectoryFullWidth === true;
}

export function resolveToolsLevelIndicatorShowCategoryFilter(
  presentation: Pick<
    PortfolioToolsPresentationSettings,
    'levelIndicatorShowCategoryFilter' | 'levelTableShowCategoryFilter'
  >
): boolean {
  return (
    presentation.levelIndicatorShowCategoryFilter === true ||
    presentation.levelTableShowCategoryFilter === true
  );
}

/** Designs that support the All + category chip filter above the gallery. */
export function toolsDesignSupportsCategoryFilter(
  design: PortfolioToolsDesign | undefined
): boolean {
  return isToolsLevelIndicatorDesign(design) || design === 'brand-index';
}

export function toolsLevelIndicatorDesignSupportsCardFrame(
  design: PortfolioToolsDesign | undefined
): boolean {
  return (
    design === 'level-stat-bars' ||
    design === 'level-circular-cards' ||
    design === 'level-bento-categories' ||
    design === 'level-star-cards' ||
    design === 'level-svg-rings'
  );
}

export function resolveToolsLevelIndicatorCardFramed(
  presentation: Pick<PortfolioToolsPresentationSettings, 'levelIndicatorCardStyle'>,
  design: PortfolioToolsDesign
): boolean {
  if (!toolsLevelIndicatorDesignSupportsCardFrame(design)) return false;
  return (presentation.levelIndicatorCardStyle ?? 'framed') === 'framed';
}

/** Card fill — contrasts with section when palette binds both to `fond`. */
export function resolveToolsCardSurfaceColor(
  presentation: Pick<
    PortfolioToolsPresentationSettings,
    | 'cardBackgroundColor'
    | 'sectionBackgroundColor'
    | 'tileBackgroundColor'
    | 'chipBackgroundColor'
  >
): string {
  const card = presentation.cardBackgroundColor?.trim();
  if (!card) {
    return presentation.tileBackgroundColor?.trim() || presentation.chipBackgroundColor?.trim() || '#ffffff';
  }
  const section = presentation.sectionBackgroundColor?.trim();
  if (section && card.toLowerCase() === section.toLowerCase()) {
    return (
      presentation.tileBackgroundColor?.trim() ||
      presentation.chipBackgroundColor?.trim() ||
      card
    );
  }
  return card;
}

export const PORTFOLIO_TOOLS_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioToolsSubtitlePreset;
  label: string;
}[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'custom', label: 'Personnalisé' },
];

export const PORTFOLIO_TOOLS_HEADER_ALIGNMENT_OPTIONS: {
  value: PortfolioToolsHeaderAlignment;
  label: string;
}[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
];

export const PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS: {
  value: PortfolioToolsTileSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Compact' },
  { value: 'md', label: 'Standard' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Très large' },
];

export const PORTFOLIO_TOOLS_CARD_GAP_OPTIONS: {
  value: PortfolioToolsCardGap;
  label: string;
}[] = [
  { value: 'tight', label: 'Serré' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Très large' },
];

export const PORTFOLIO_TOOLS_LEVEL_PROGRESS_ROW_GAP_OPTIONS: {
  value: PortfolioToolsLevelProgressRowGap;
  label: string;
}[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra large' },
];

export const PORTFOLIO_TOOLS_LEVEL_PROGRESS_COLUMNS_OPTIONS: {
  value: '1' | '2';
  label: string;
}[] = [
  { value: '1', label: '1 par ligne' },
  { value: '2', label: '2 par ligne (écran large)' },
];

export const PORTFOLIO_TOOLS_BRAND_ROW_CELL_STYLE_OPTIONS: {
  value: PortfolioToolsBrandRowCellStyle;
  label: string;
}[] = [
  { value: 'dividers', label: 'Séparateurs (lignes)' },
  { value: 'frames', label: 'Cadres individuels' },
  { value: 'none', label: 'Aucun (sans traits)' },
];

export const PORTFOLIO_TOOLS_BRAND_FLOAT_GRID_MODE_OPTIONS: {
  value: PortfolioToolsBrandFloatGridMode;
  label: string;
}[] = [
  { value: 'fluid', label: 'Fluide (auto-fill)' },
  { value: 'fixed', label: 'Colonnes fixes' },
];

export const PORTFOLIO_TOOLS_BRAND_FLOAT_TILE_DENSITY_OPTIONS: {
  value: PortfolioToolsBrandFloatTileDensity;
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Confortable' },
  { value: 'spacious', label: 'Aéré' },
];

export const PORTFOLIO_TOOLS_BRAND_FLOAT_COLUMNS_OPTIONS: {
  value: '2' | '3' | '4';
  label: string;
}[] = [
  { value: '2', label: '2 par ligne' },
  { value: '3', label: '3 par ligne' },
  { value: '4', label: '4 par ligne (écran large)' },
];

export const PORTFOLIO_TOOLS_BRAND_FLOAT_CARD_STYLE_OPTIONS: {
  value: PortfolioToolsBrandFloatCardStyle;
  label: string;
}[] = [
  { value: 'framed', label: 'Avec cadre' },
  { value: 'plain', label: 'Sans cadre' },
];

export const PORTFOLIO_TOOLS_LEVEL_INDICATOR_CARD_STYLE_OPTIONS: {
  value: PortfolioToolsLevelIndicatorCardStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'framed',
    label: 'Framed',
    description: 'Card background and border around each item.',
  },
  {
    value: 'plain',
    label: 'Plain',
    description: 'No card frame — logo, ring, and text sit directly on the section.',
  },
];

export const PORTFOLIO_TOOLS_LEVEL_BENTO_GRID_MODE_OPTIONS: {
  value: PortfolioToolsLevelBentoGridMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'asymmetric',
    label: 'Asymmetric',
    description: 'Wider category cards when they contain more skills.',
  },
  {
    value: 'equal',
    label: 'Equal columns',
    description: 'Same width for every category card.',
  },
];

export const PORTFOLIO_TOOLS_LEVEL_INDICATOR_DISPLAY_STYLE_OPTIONS: {
  value: PortfolioToolsLevelIndicatorDisplayStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'text',
    label: 'Text label',
    description: 'Beginner, Intermediate, Advanced, Expert — colored text.',
  },
  {
    value: 'stars',
    label: 'Stars',
    description: '5-star rating — filled stars use the level accent color.',
  },
  {
    value: 'dots',
    label: 'Glowing dots',
    description: '5 dots — filled dots use semantic level colors with a soft glow.',
  },
  {
    value: 'progress-bar',
    label: 'Progress bar',
    description: 'Horizontal bar with optional % — no level text.',
  },
];

export function toolsLevelStarCardsDesignDefaults(): Partial<PortfolioToolsPresentationSettings> {
  return {
    design: 'level-star-cards',
    brandCardsColumnsPerRow: 4,
    cardGap: 'medium',
    levelIndicatorFullWidth: true,
    levelTableFullWidth: true,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    brandCardsContentAlignment: 'left',
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
  };
}

export function toolsLevelSvgRingsDesignDefaults(): Partial<PortfolioToolsPresentationSettings> {
  return {
    design: 'level-svg-rings',
    levelProgressRowGap: 'medium',
    cardGap: 'medium',
    brandCardsColumnsPerRow: 3,
    brandCardsContentAlignment: 'center',
    levelIndicatorFullWidth: false,
    levelTableFullWidth: false,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
  };
}

export function toolsLevelBentoCategoriesDesignDefaults(): Partial<PortfolioToolsPresentationSettings> {
  return {
    design: 'level-bento-categories',
    levelProgressRowGap: 'medium',
    cardGap: 'medium',
    levelIndicatorFullWidth: true,
    levelTableFullWidth: true,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    levelBentoGridMode: 'equal',
    levelIndicatorDisplayStyle: 'progress-bar',
    brandCardsContentAlignment: 'left',
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
  };
}

export function mergeLevelIndicatorDisplayStyle(
  record: Record<string, unknown>,
  design: PortfolioToolsDesign,
  base: Pick<PortfolioToolsPresentationSettings, 'levelIndicatorDisplayStyle'>
): PortfolioToolsLevelIndicatorDisplayStyle {
  const allowed = ['text', 'stars', 'dots', 'progress-bar'] as const;
  if (
    typeof record.levelIndicatorDisplayStyle === 'string' &&
    (allowed as readonly string[]).includes(record.levelIndicatorDisplayStyle)
  ) {
    return record.levelIndicatorDisplayStyle as PortfolioToolsLevelIndicatorDisplayStyle;
  }
  if (design === 'level-bento-categories') {
    return 'progress-bar';
  }
  const inherited = base.levelIndicatorDisplayStyle;
  if (
    inherited === 'stars' ||
    inherited === 'dots' ||
    inherited === 'progress-bar' ||
    inherited === 'text'
  ) {
    return inherited;
  }
  return 'text';
}

export function resolveToolsLevelIndicatorDisplayStyle(
  presentation: Pick<PortfolioToolsPresentationSettings, 'levelIndicatorDisplayStyle' | 'design'>
): PortfolioToolsLevelIndicatorDisplayStyle {
  const style = presentation.levelIndicatorDisplayStyle;
  if (style === 'stars' || style === 'dots' || style === 'progress-bar' || style === 'text') {
    return style;
  }
  return presentation.design === 'level-bento-categories' ? 'progress-bar' : 'text';
}

export const PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS: {
  value: '1' | '2' | '3' | '4';
  label: string;
}[] = [
  { value: '1', label: '1 par ligne' },
  { value: '2', label: '2 par ligne (écran large)' },
  { value: '3', label: '3 par ligne (écran large)' },
  { value: '4', label: '4 par ligne (écran large)' },
];

export const PORTFOLIO_TOOLS_BRAND_CARDS_ICON_PLACEMENT_OPTIONS: {
  value: PortfolioToolsBrandCardsIconPlacement;
  label: string;
}[] = [
  { value: 'top', label: 'Au-dessus du texte' },
  { value: 'left', label: 'À gauche (panneau horizontal)' },
];

/** @deprecated Use `PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS` */
export const PORTFOLIO_TOOLS_BRAND_DIRECTORY_COLUMNS_OPTIONS = PORTFOLIO_TOOLS_BRAND_GRID_COLUMNS_OPTIONS;

export const PORTFOLIO_TOOLS_BRAND_DIRECTORY_LEVEL_STYLE_OPTIONS: {
  value: PortfolioToolsBrandDirectoryLevelStyle;
  label: string;
}[] = [
  { value: 'tag', label: 'Tag' },
  { value: 'percentage', label: 'Pourcentage' },
  { value: 'stat', label: 'Statistique' },
  { value: 'dots', label: 'Points' },
];

export const PORTFOLIO_TOOLS_CONTENT_ALIGNMENT_OPTIONS: {
  value: PortfolioToolsContentAlignment;
  label: string;
}[] = [
  { value: 'left', label: 'Gauche' },
  { value: 'center', label: 'Centre' },
  { value: 'right', label: 'Droite' },
];

export const DEFAULT_TOOLS_TITLE = 'Workflow & Tools';

export const DEFAULT_TOOLS_PRESENTATION: PortfolioToolsPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'workflow-rail',
  titlePreset: 'workflow-tools',
  titleCustom: '',
  subtitlePreset: 'none',
  subtitleCustom: '',
  headerAlignment: 'left',
  contentAlignment: 'center',
  titleFont: 'serif',
  subtitleFont: 'sans',
  titleColor: '#171717',
  subtitleColor: '#737373',
  tileBackgroundColor: '#f4f4f5',
  labelColor: '#171717',
  descriptionColor: '#737373',
  cardBackgroundColor: '#ffffff',
  cardBorderColor: '#e5e5e5',
  chipBackgroundColor: '#f4f4f5',
  chipTextColor: '#525252',
  levelAccentColor: '#ea580c',
  tileSize: 'md',
  cardGap: 'tight',
  levelProgressRowGap: 'large',
  levelProgressColumnsPerRow: 1,
  levelProgressContentAlignment: 'center',
  levelBarStyle: 'rectangle',
  levelBarSize: 'small',
  workflowRailContentAlignment: 'center',
  brandDirectoryLevelStyle: 'percentage',
  brandCardsColumnsPerRow: 1,
  brandCardsContentAlignment: 'center',
  brandCardsIconPlacement: 'top',
  brandCardsFullWidth: false,
  brandDirectoryColumnsPerRow: 1,
  brandDirectoryContentAlignment: 'center',
  brandDirectoryFullWidth: false,
  brandIndexContentAlignment: 'center',
  brandIndexFullWidth: false,
  levelIndicatorFullWidth: false,
  levelTableFullWidth: false,
  levelTableGroupBy: 'category',
  levelIndicatorShowCategoryFilter: false,
  levelTableShowCategoryFilter: false,
  levelIndicatorCardStyle: 'framed',
  levelBentoGridMode: 'equal',
  levelIndicatorDisplayStyle: 'text',
  brandRowColumnsPerRow: 3,
  brandRowContentAlignment: 'center',
  brandRowCellStyle: 'dividers',
  brandFloatGridMode: 'fluid',
  brandFloatColumnsPerRow: 3,
  brandFloatTileDensity: 'comfortable',
  brandFloatContentAlignment: 'center',
  brandFloatCardStyle: 'framed',
  showLabels: true,
  showDescription: true,
  showUseCases: true,
  showCategory: true,
  showLevel: false,
  iconBackgroundEnabled: false,
  logosGrayscale: false,
  useHeroPalette: true,
  toolsPalette: { ...DEFAULT_TOOLS_PALETTE },
  toolsColorBindings: { ...DEFAULT_TOOLS_COLOR_BINDINGS },
  activeColorMode: 'light',
};

Object.assign(DEFAULT_TOOLS_PRESENTATION, applyToolsPaletteToSettings(DEFAULT_TOOLS_PRESENTATION));

export function resolveToolsSectionTitle(
  settings: Pick<PortfolioToolsSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  if (settings.titlePreset === 'custom') {
    const custom = settings.titleCustom?.trim();
    if (custom) return portfolioSectionTitleSentenceCase(custom);
  }
  if (settings.titlePreset === 'tools') return 'Tools';
  if (settings.titlePreset === 'stack') return 'Stack';
  if (settings.titlePreset === 'workflow-tools') return DEFAULT_TOOLS_TITLE;
  const stored = settings.title?.trim();
  return stored ? portfolioSectionTitleSentenceCase(stored) : DEFAULT_TOOLS_TITLE;
}

export function resolveToolsSectionSubtitle(
  settings: Pick<PortfolioToolsSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  if (settings.subtitlePreset !== 'custom') return '';
  return settings.subtitleCustom.trim() || settings.subtitle.trim();
}

export function toolsHeaderFontClass(
  font: PortfolioToolsHeaderFont | undefined,
  kind: 'title' | 'subtitle' | 'label'
): string {
  if (font === 'serif') {
    return kind === 'title' ? 'font-serif tracking-tight' : 'font-sans tracking-normal';
  }
  if (font === 'display') {
    return kind === 'title'
      ? 'font-sans text-[1.05em] font-semibold tracking-tight'
      : 'font-sans tracking-normal';
  }
  return 'font-sans tracking-tight';
}

export function toolsHeaderFontStyle(font: PortfolioToolsHeaderFont | undefined): CSSProperties {
  if (font === 'serif') return { fontFamily: 'Georgia, "Times New Roman", serif' };
  return {};
}

export function toolsTitleColorStyle(color: string | undefined): CSSProperties {
  return { color: sanitizeHex(color, '#171717') };
}

export function toolsSubtitleColorStyle(color: string | undefined): CSSProperties {
  return { color: sanitizeHex(color, '#737373') };
}

export function toolsLabelColorStyle(color: string | undefined): CSSProperties {
  return { color: sanitizeHex(color, '#171717') };
}

export function toolsTileSizePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 88;
  if (size === 'lg') return 140;
  if (size === 'xl') return 160;
  return 120;
}

export function toolsLogoSizePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 42;
  if (size === 'lg') return 64;
  if (size === 'xl') return 76;
  return 56;
}

export function toolsBrandCardLogoTilePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 68;
  if (size === 'lg') return 100;
  if (size === 'xl') return 120;
  return 84;
}

export function toolsBrandCardLogoPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 38;
  if (size === 'lg') return 52;
  if (size === 'xl') return 60;
  return 44;
}

/** Large centered mark for Framer Marketplace–style showcase panels. */
export function toolsShowcaseLogoPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 58;
  if (size === 'lg') return 96;
  if (size === 'xl') return 112;
  return 80;
}

/** Gap between brand-cards grid items. `tight` matches the previous default. */
export function toolsBrandCardsGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-6 sm:gap-7 lg:gap-8';
  if (gap === 'large') return 'gap-8 sm:gap-10 lg:gap-12';
  if (gap === 'xlarge') return 'gap-10 sm:gap-14 lg:gap-16';
  return 'gap-4 sm:gap-5 lg:gap-6';
}

/** Gap between level-stat-bars grid items. */
export function toolsLevelStatBarsGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-5 sm:gap-6 lg:gap-7';
  if (gap === 'large') return 'gap-6 sm:gap-8 lg:gap-9';
  if (gap === 'xlarge') return 'gap-7 sm:gap-10 lg:gap-12';
  return 'gap-4 sm:gap-5 lg:gap-6';
}

/** Outer ring diameter for `level-circular-cards`. */
export function toolsLevelCircularRingPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 92;
  if (size === 'lg') return 120;
  if (size === 'xl') return 136;
  return 108;
}

/** Outer ring diameter for `level-svg-rings` (label inside ring). */
export function toolsLevelSvgRingPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 100;
  if (size === 'lg') return 132;
  if (size === 'xl') return 148;
  return 120;
}

/** Logo mark inside the circular ring (no tile square). */
export function toolsLevelCircularLogoPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 34;
  if (size === 'lg') return 46;
  if (size === 'xl') return 52;
  return 40;
}

/** Responsive grid for circular level cards — uses brand column preset on lg+. */
export function toolsLevelCircularCardsGridClass(
  columns: PortfolioToolsBrandGridColumnsPerRow | undefined
): string {
  const cols = columns ?? 3;
  if (cols === 1) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (cols === 2) return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6';
}

/** Fixed large-screen column count for `level-star-cards`. */
export const LEVEL_STAR_CARDS_COLUMNS_PER_ROW = 4 as const;

export function resolveLevelStarCardsColumnsPerRow(
  presentation: Pick<PortfolioToolsPresentationSettings, 'brandCardsColumnsPerRow'>
): typeof LEVEL_STAR_CARDS_COLUMNS_PER_ROW {
  void presentation;
  return LEVEL_STAR_CARDS_COLUMNS_PER_ROW;
}
/** Fixed 4-column grid for level star card rows — incomplete rows keep the same card width. */
export function toolsLevelStarCardsGridClass(): string {
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

export function parseBrandGridColumnsPerRow(raw: unknown, fallback: PortfolioToolsBrandGridColumnsPerRow): PortfolioToolsBrandGridColumnsPerRow {
  if (raw === 4 || raw === '4') return 4;
  if (raw === 3 || raw === '3') return 3;
  if (raw === 2 || raw === '2') return 2;
  if (raw === 1 || raw === '1') return 1;
  return fallback;
}

function legacySharedBrandColumns(record: Record<string, unknown>): PortfolioToolsBrandGridColumnsPerRow | undefined {
  const raw = record.brandGridColumnsPerRow ?? record.brandDirectoryColumnsPerRow;
  if (raw === 4 || raw === '4') return 4;
  if (raw === 3 || raw === '3') return 3;
  if (raw === 2 || raw === '2') return 2;
  if (raw === 1 || raw === '1') return 1;
  return undefined;
}

function legacySharedContentAlignment(
  record: Record<string, unknown>,
  base: PortfolioToolsContentAlignment
): PortfolioToolsContentAlignment {
  return pick(record.contentAlignment, ['left', 'center', 'right'] as const, base);
}

/** Content alignment for the active tools design only. */
export function resolveToolsDesignContentAlignment(
  design: PortfolioToolsDesign,
  presentation: PortfolioToolsPresentationSettings
): PortfolioToolsContentAlignment {
  const legacy = presentation.contentAlignment ?? 'center';
  switch (design) {
    case 'level-progress-rows':
    case 'level-category-rows':
    case 'level-table-rows':
      return presentation.levelProgressContentAlignment ?? legacy;
    case 'workflow-rail':
      return presentation.workflowRailContentAlignment ?? legacy;
    case 'brand-cards':
      return presentation.brandCardsContentAlignment ?? legacy;
    case 'brand-directory':
      return presentation.brandDirectoryContentAlignment ?? legacy;
    case 'brand-index':
      return presentation.brandIndexContentAlignment ?? legacy;
    case 'brand-row':
      return presentation.brandRowContentAlignment ?? legacy;
    case 'brand-float':
      return presentation.brandFloatContentAlignment ?? legacy;
    case 'level-circular-cards':
    case 'level-svg-rings':
      return presentation.brandCardsContentAlignment ?? legacy;
    case 'level-bento-categories':
    case 'level-star-cards':
      return presentation.brandCardsContentAlignment ?? legacy;
    default:
      return legacy;
  }
}

/** Large-screen column count for brand-cards / brand-directory. */
export function resolveToolsDesignBrandColumnsPerRow(
  design: PortfolioToolsDesign,
  presentation: PortfolioToolsPresentationSettings
): PortfolioToolsBrandGridColumnsPerRow {
  if (design === 'brand-cards') return presentation.brandCardsColumnsPerRow ?? 1;
  if (design === 'level-star-cards') return LEVEL_STAR_CARDS_COLUMNS_PER_ROW;
  if (design === 'level-circular-cards' || design === 'level-svg-rings') {
    return presentation.brandCardsColumnsPerRow ?? 3;
  }
  if (design === 'brand-directory') return presentation.brandDirectoryColumnsPerRow ?? 1;
  if (design === 'brand-row') return presentation.brandRowColumnsPerRow ?? 3;
  return 1;
}

/** Horizontal placement of the tools gallery block. */
export function toolsContentAlignWrapperClass(
  design: PortfolioToolsDesign,
  presentation: PortfolioToolsPresentationSettings
): string {
  const alignment = resolveToolsDesignContentAlignment(design, presentation);
  const edge = alignment === 'left' ? 'mr-auto' : alignment === 'right' ? 'ml-auto' : 'mx-auto';
  if (isToolsLevelIndicatorDesign(design)) {
    if (design === 'level-star-cards') return `w-full ${edge}`;
    if (resolveToolsLevelIndicatorFullWidth(presentation)) {
      return `w-full ${edge}`;
    }
    if (
      design === 'level-progress-rows' ||
      design === 'level-category-rows' ||
      design === 'level-table-rows'
    ) {
      const maxW = presentation.levelProgressColumnsPerRow === 2 ? 'max-w-5xl' : 'max-w-3xl';
      return `w-full ${maxW} ${edge}`;
    }
    if (design === 'level-stat-bars') return `w-full max-w-5xl ${edge}`;
    if (design === 'level-circular-cards' || design === 'level-svg-rings') {
      return `w-full max-w-6xl ${edge}`;
    }
    if (design === 'level-bento-categories') return `w-full ${edge}`;
  }
  if (design === 'brand-index') {
    if (presentation.brandIndexFullWidth !== false) return `w-full ${edge}`;
    return `w-full max-w-5xl ${edge}`;
  }
  if (design === 'brand-row') return `w-full ${edge}`;
  if (design === 'brand-float') return `w-full max-w-6xl ${edge}`;
  if (design === 'brand-directory') {
    if (resolveToolsBrandDirectoryFullWidth(presentation)) return `w-full ${edge}`;
    const multiCol = resolveToolsDesignBrandColumnsPerRow(design, presentation) > 1;
    if (multiCol) return `w-full ${edge}`;
    return `w-full max-w-3xl ${edge}`;
  }
  if (design === 'brand-cards') {
    if (resolveToolsBrandCardsFullWidth(presentation)) return `w-full ${edge}`;
    const multiCol = resolveToolsDesignBrandColumnsPerRow(design, presentation) > 1;
    if (multiCol) return `w-full ${edge}`;
    return `w-full max-w-3xl ${edge}`;
  }
  return `w-full ${edge}`;
}

export function toolsWorkflowRailJustifyClass(
  alignment: PortfolioToolsContentAlignment | undefined
): string {
  const align = alignment ?? 'center';
  if (align === 'left') return 'justify-start';
  if (align === 'right') return 'justify-end';
  return 'justify-center';
}

/** Gap for workflow-rail logo row. */
export function toolsWorkflowRailGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-x-10 gap-y-10 sm:gap-x-8 md:gap-x-12';
  if (gap === 'large') return 'gap-x-14 gap-y-12 sm:gap-x-12 md:gap-x-16';
  if (gap === 'xlarge') return 'gap-x-16 gap-y-14 sm:gap-x-16 md:gap-x-20';
  return 'gap-x-8 gap-y-8 sm:gap-x-6 md:gap-x-8';
}

/** Row layout spacing for level list rows (padding, min-height). */
export function toolsLevelProgressRowsRowClass(
  gap: PortfolioToolsLevelProgressRowGap | undefined
): string {
  if (gap === 'tight') return 'min-h-[52px] gap-3 py-2.5 sm:gap-3 sm:py-3';
  if (gap === 'large') return 'min-h-[76px] gap-4 py-6 sm:gap-5 sm:py-8';
  if (gap === 'xlarge') return 'min-h-[88px] gap-5 py-8 sm:gap-5 sm:py-10';
  return 'min-h-[64px] gap-4 py-4 sm:gap-4 sm:py-6';
}

/** Grid gutter for level indicator card grids (`level-stat-bars`, `level-circular-cards`). */
export function toolsLevelIndicatorGridGapClass(
  gap: PortfolioToolsLevelProgressRowGap | undefined
): string {
  if (gap === 'tight') return 'gap-3 sm:gap-4 lg:gap-5';
  if (gap === 'large') return 'gap-6 sm:gap-8 lg:gap-10';
  if (gap === 'xlarge') return 'gap-8 sm:gap-10 lg:gap-12';
  return 'gap-5 sm:gap-6 lg:gap-7';
}

/** Gap between bento category cards. */
export function toolsLevelBentoGridGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-4 sm:gap-5 lg:gap-6';
  if (gap === 'large') return 'gap-5 sm:gap-6 lg:gap-8';
  if (gap === 'xlarge') return 'gap-6 sm:gap-8 lg:gap-10';
  return 'gap-3 sm:gap-4 lg:gap-5';
}

/** Equal-width bento columns — matches the item count on the row (max 4) so cards always fill the row. */
export function toolsLevelBentoEqualColumnsClass(columnCount: number): string {
  const cols = Math.min(Math.max(columnCount, 1), 4);
  if (cols === 1) return 'md:grid-cols-1';
  if (cols === 2) return 'md:grid-cols-2';
  if (cols === 3) return 'md:grid-cols-3';
  return 'md:grid-cols-4';
}

/** Grid gutter when `level-progress-rows` uses 2 columns on large screens. */
export function toolsLevelProgressRowsGridGapClass(
  gap: PortfolioToolsLevelProgressRowGap | undefined
): string {
  if (gap === 'tight') return 'gap-x-6 gap-y-4 lg:gap-x-10 lg:gap-y-5';
  if (gap === 'large') return 'gap-x-8 gap-y-7 lg:gap-x-12 lg:gap-y-8';
  if (gap === 'xlarge') return 'gap-x-10 gap-y-9 lg:gap-x-14 lg:gap-y-10';
  return 'gap-x-7 gap-y-5 lg:gap-x-10 lg:gap-y-6';
}

/** Vertical rhythm for brand-directory rows. */
export function toolsBrandDirectoryRowPadClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'py-6 sm:py-7 md:py-8';
  if (gap === 'large') return 'py-8 sm:py-10 md:py-11';
  if (gap === 'xlarge') return 'py-10 sm:py-12 md:py-14';
  return 'py-5 sm:py-6 md:py-7';
}

/** Responsive column layout for `brand-row`. */
export function toolsBrandRowGridClass(
  columns: PortfolioToolsBrandGridColumnsPerRow | undefined
): string {
  const cols = columns ?? 3;
  if (cols === 1) return 'grid-cols-1';
  if (cols === 2) return 'grid-cols-1 sm:grid-cols-2';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
}

/** Inner padding for `brand-row` cells. */
export function toolsBrandRowCellPadClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-3 px-5 py-6 sm:gap-4 sm:px-6 sm:py-7';
  if (gap === 'large') return 'gap-4 px-6 py-7 sm:gap-4 sm:px-7 sm:py-8';
  if (gap === 'xlarge') return 'gap-4 px-7 py-8 sm:gap-5 sm:px-8 sm:py-10';
  return 'gap-3 px-4 py-5 sm:gap-3.5 sm:px-5 sm:py-6';
}

/** Grid gutter for `brand-row` framed cells. */
export function toolsBrandRowGridGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-3 sm:gap-4';
  if (gap === 'large') return 'gap-4 sm:gap-5';
  if (gap === 'xlarge') return 'gap-5 sm:gap-6';
  return 'gap-2 sm:gap-3';
}

/** Gap between `brand-float` tiles. */
export function toolsBrandFloatGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-4 sm:gap-5 lg:gap-6';
  if (gap === 'large') return 'gap-5 sm:gap-6 lg:gap-8';
  if (gap === 'xlarge') return 'gap-6 sm:gap-8 lg:gap-10';
  return 'gap-3 sm:gap-4 lg:gap-5';
}

/** Min tile width (px) for `brand-float` fluid auto-fill grid. */
export function toolsBrandFloatMinTilePx(
  density: PortfolioToolsBrandFloatTileDensity | undefined
): number {
  if (density === 'compact') return 144;
  if (density === 'spacious') return 208;
  return 176;
}

/** Fixed column classes for `brand-float`. */
export function toolsBrandFloatFixedGridClass(
  columns: PortfolioToolsBrandFloatColumnsPerRow | undefined
): string {
  const cols = columns ?? 3;
  if (cols === 4) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  if (cols === 2) return 'grid-cols-2 lg:grid-cols-2';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3';
}

/** `lg+` column count for brand-cards / brand-showcase grids. */
export function toolsBrandGridLargeColumnsClass(
  columns: PortfolioToolsBrandGridColumnsPerRow | undefined
): string {
  const cols = columns ?? 1;
  if (cols === 3) return 'lg:grid-cols-3';
  if (cols === 2) return 'lg:grid-cols-2';
  return 'lg:grid-cols-1';
}

/** Grid layout when `brand-directory` uses 2–3 columns on large screens only. */
export function toolsBrandDirectoryGridClass(
  columns: PortfolioToolsBrandGridColumnsPerRow | undefined,
  gap: PortfolioToolsCardGap | undefined
): string {
  const cols = columns ?? 1;
  if (cols === 1) return '';
  const colClass = cols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';
  if (gap === 'medium') return `lg:grid ${colClass} lg:gap-6`;
  if (gap === 'large') return `lg:grid ${colClass} lg:gap-8`;
  if (gap === 'xlarge') return `lg:grid ${colClass} lg:gap-10`;
  return `lg:grid ${colClass} lg:gap-5`;
}

export function isToolsLevelIndicatorDesign(
  design: PortfolioToolsDesign | undefined
): boolean {
  return (
    design === 'level-stat-bars' ||
    design === 'level-progress-rows' ||
    design === 'level-category-rows' ||
    design === 'level-table-rows' ||
    design === 'level-circular-cards' ||
    design === 'level-star-cards' ||
    design === 'level-svg-rings' ||
    design === 'level-bento-categories'
  );
}

/** Whether level badge / bars should render (handles legacy implicit `showLevel: true`). */
export function resolveToolsShowLevel(
  settings: Pick<PortfolioToolsPresentationSettings, 'design' | 'showLevel' | 'showLevelOptIn'>
): boolean {
  if (settings.showLevelOptIn === true) return true;
  if (settings.showLevelOptIn === false) return false;
  if (isToolsLevelIndicatorDesign(settings.design)) {
    return settings.showLevel !== false;
  }
  return false;
}

/** Whether the logo tile fill is visible (`brand-float` defaults on). */
export function resolveToolsIconBackgroundEnabled(
  settings: Pick<
    PortfolioToolsPresentationSettings,
    'design' | 'iconBackgroundEnabled' | 'iconBackgroundOptIn'
  >
): boolean {
  if (settings.iconBackgroundOptIn === true) {
    return settings.iconBackgroundEnabled !== false;
  }
  if (settings.iconBackgroundOptIn === false) {
    return false;
  }
  if (settings.design === 'brand-float') {
    return true;
  }
  return settings.iconBackgroundEnabled === true;
}

export function pickToolsPresentationSettings(
  settings: PortfolioToolsSectionSettings
): PortfolioToolsPresentationSettings {
  const {
    enabled: _enabled,
    title: _title,
    subtitle: _subtitle,
    ...presentation
  } = settings;
  void _enabled;
  void _title;
  void _subtitle;
  return presentation;
}

export function mergeToolsPresentation(
  base: PortfolioToolsPresentationSettings,
  patch: unknown
): PortfolioToolsPresentationSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { ...base };
  }
  const record = patch as Record<string, unknown>;
  const design =
    record.design === 'brand-showcase'
      ? 'brand-cards'
      : pickToolsDesign(record.design, base.design);
  const showLevelOptIn =
    typeof record.showLevelOptIn === 'boolean' ? record.showLevelOptIn : base.showLevelOptIn;
  const showLevel = resolveToolsShowLevel({
    design,
    showLevel:
      typeof record.showLevel === 'boolean' ? record.showLevel : (base.showLevel ?? false),
    showLevelOptIn,
  });
  const iconBackgroundOptIn =
    typeof record.iconBackgroundOptIn === 'boolean'
      ? record.iconBackgroundOptIn
      : base.iconBackgroundOptIn;
  const iconBackgroundEnabled = resolveToolsIconBackgroundEnabled({
    design,
    iconBackgroundEnabled:
      typeof record.iconBackgroundEnabled === 'boolean'
        ? record.iconBackgroundEnabled
        : (base.iconBackgroundEnabled ?? false),
    iconBackgroundOptIn,
  });
  const next: PortfolioToolsPresentationSettings = {
    ...base,
    ...mergeSectionBackground(base, record),
    design,
    titlePreset: pick(
      record.titlePreset,
      ['workflow-tools', 'tools', 'stack', 'core-stack', 'tech-stack', 'custom'] as const,
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['none', 'custom'] as const,
      base.subtitlePreset ?? 'none'
    ),
    subtitleCustom:
      typeof record.subtitleCustom === 'string' ? record.subtitleCustom : (base.subtitleCustom ?? ''),
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'] as const, base.headerAlignment),
    contentAlignment: pick(
      record.contentAlignment,
      ['left', 'center', 'right'] as const,
      base.contentAlignment ?? 'center'
    ),
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'] as const, base.titleFont),
    subtitleFont: pick(record.subtitleFont, ['sans', 'serif', 'display'] as const, base.subtitleFont ?? 'sans'),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor ?? '#737373'),
    tileBackgroundColor: sanitizeHex(record.tileBackgroundColor, base.tileBackgroundColor),
    labelColor: sanitizeHex(record.labelColor, base.labelColor),
    descriptionColor: sanitizeHex(record.descriptionColor, base.descriptionColor ?? '#737373'),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor ?? '#ffffff'),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor ?? '#e5e5e5'),
    chipBackgroundColor: sanitizeHex(record.chipBackgroundColor, base.chipBackgroundColor ?? '#f4f4f5'),
    chipTextColor: sanitizeHex(record.chipTextColor, base.chipTextColor ?? '#525252'),
    levelAccentColor: sanitizeHex(record.levelAccentColor, base.levelAccentColor ?? '#ea580c'),
    tileSize: pick(record.tileSize, ['sm', 'md', 'lg', 'xl'] as const, base.tileSize),
    cardGap: pick(
      record.cardGap,
      ['tight', 'medium', 'large', 'xlarge'] as const,
      base.cardGap ?? 'tight'
    ),
    levelProgressRowGap: pick(
      record.levelProgressRowGap,
      ['tight', 'medium', 'large', 'xlarge'] as const,
      base.levelProgressRowGap ?? 'large'
    ),
    levelProgressColumnsPerRow:
      record.levelProgressColumnsPerRow === 2 || record.levelProgressColumnsPerRow === '2'
        ? 2
        : record.levelProgressColumnsPerRow === 1 || record.levelProgressColumnsPerRow === '1'
          ? 1
          : (base.levelProgressColumnsPerRow ?? 1),
    levelProgressContentAlignment: pick(
      record.levelProgressContentAlignment,
      ['left', 'center', 'right'] as const,
      base.levelProgressContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    levelBarStyle: pick(
      record.levelBarStyle,
      ['rectangle', 'pill', 'pill-gradient', 'segments'] as const,
      base.levelBarStyle ?? 'rectangle'
    ),
    levelBarSize: pick(
      record.levelBarSize,
      ['tight', 'small', 'medium', 'large', 'xlarge'] as const,
      base.levelBarSize ?? 'small'
    ),
    workflowRailContentAlignment: pick(
      record.workflowRailContentAlignment,
      ['left', 'center', 'right'] as const,
      base.workflowRailContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    brandDirectoryLevelStyle: pick(
      record.brandDirectoryLevelStyle,
      ['tag', 'percentage', 'stat', 'dots'] as const,
      base.brandDirectoryLevelStyle ?? 'percentage'
    ),
    brandCardsColumnsPerRow: parseBrandGridColumnsPerRow(
      record.brandCardsColumnsPerRow ??
        (record.design === 'brand-showcase' ? record.brandShowcaseColumnsPerRow : undefined),
      base.brandCardsColumnsPerRow ??
        legacySharedBrandColumns(record) ??
        1
    ),
    brandCardsContentAlignment: pick(
      record.brandCardsContentAlignment ??
        (record.design === 'brand-showcase' ? record.brandShowcaseContentAlignment : undefined),
      ['left', 'center', 'right'] as const,
      base.brandCardsContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    brandCardsIconPlacement: pick(
      record.brandCardsIconPlacement,
      ['top', 'left'] as const,
      record.design === 'brand-showcase' ? 'left' : (base.brandCardsIconPlacement ?? 'top')
    ),
    brandCardsFullWidth:
      typeof record.brandCardsFullWidth === 'boolean'
        ? record.brandCardsFullWidth
        : (base.brandCardsFullWidth ?? false),
    brandDirectoryColumnsPerRow: parseBrandGridColumnsPerRow(
      record.brandDirectoryColumnsPerRow,
      base.brandDirectoryColumnsPerRow ??
        legacySharedBrandColumns(record) ??
        1
    ),
    brandDirectoryContentAlignment: pick(
      record.brandDirectoryContentAlignment,
      ['left', 'center', 'right'] as const,
      base.brandDirectoryContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    brandDirectoryFullWidth:
      typeof record.brandDirectoryFullWidth === 'boolean'
        ? record.brandDirectoryFullWidth
        : (base.brandDirectoryFullWidth ?? false),
    brandIndexContentAlignment: pick(
      record.brandIndexContentAlignment,
      ['left', 'center', 'right'] as const,
      base.brandIndexContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    brandIndexFullWidth:
      typeof record.brandIndexFullWidth === 'boolean'
        ? record.brandIndexFullWidth
        : (base.brandIndexFullWidth ?? false),
    levelIndicatorFullWidth:
      typeof record.levelIndicatorFullWidth === 'boolean'
        ? record.levelIndicatorFullWidth
        : typeof record.levelTableFullWidth === 'boolean'
          ? record.levelTableFullWidth
          : (base.levelIndicatorFullWidth ?? base.levelTableFullWidth ?? false),
    levelTableFullWidth:
      typeof record.levelTableFullWidth === 'boolean'
        ? record.levelTableFullWidth
        : typeof record.levelIndicatorFullWidth === 'boolean'
          ? record.levelIndicatorFullWidth
          : (base.levelTableFullWidth ?? base.levelIndicatorFullWidth ?? false),
    levelTableGroupBy: pick(
      record.levelTableGroupBy,
      ['category', 'level'] as const,
      base.levelTableGroupBy ?? 'category'
    ),
    levelIndicatorShowCategoryFilter:
      typeof record.levelIndicatorShowCategoryFilter === 'boolean'
        ? record.levelIndicatorShowCategoryFilter
        : typeof record.levelTableShowCategoryFilter === 'boolean'
          ? record.levelTableShowCategoryFilter
          : (base.levelIndicatorShowCategoryFilter ?? base.levelTableShowCategoryFilter ?? false),
    levelTableShowCategoryFilter:
      typeof record.levelTableShowCategoryFilter === 'boolean'
        ? record.levelTableShowCategoryFilter
        : typeof record.levelIndicatorShowCategoryFilter === 'boolean'
          ? record.levelIndicatorShowCategoryFilter
          : (base.levelTableShowCategoryFilter ?? base.levelIndicatorShowCategoryFilter ?? false),
    levelIndicatorCardStyle: pick(
      record.levelIndicatorCardStyle,
      ['framed', 'plain'] as const,
      base.levelIndicatorCardStyle ?? 'framed'
    ),
    levelBentoGridMode: pick(
      record.levelBentoGridMode,
      ['asymmetric', 'equal'] as const,
      base.levelBentoGridMode ?? 'equal'
    ),
    levelIndicatorDisplayStyle: mergeLevelIndicatorDisplayStyle(record, design, base),
    brandRowColumnsPerRow: parseBrandGridColumnsPerRow(
      record.brandRowColumnsPerRow,
      base.brandRowColumnsPerRow ?? 3
    ),
    brandRowContentAlignment: pick(
      record.brandRowContentAlignment,
      ['left', 'center', 'right'] as const,
      base.brandRowContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    brandRowCellStyle: pick(
      record.brandRowCellStyle,
      ['dividers', 'frames', 'none'] as const,
      base.brandRowCellStyle ?? 'dividers'
    ),
    brandFloatGridMode: pick(
      record.brandFloatGridMode,
      ['fluid', 'fixed'] as const,
      base.brandFloatGridMode ?? 'fluid'
    ),
    brandFloatColumnsPerRow:
      record.brandFloatColumnsPerRow === 4 || record.brandFloatColumnsPerRow === '4'
        ? 4
        : record.brandFloatColumnsPerRow === 2 || record.brandFloatColumnsPerRow === '2'
          ? 2
          : (base.brandFloatColumnsPerRow ?? 3),
    brandFloatTileDensity: pick(
      record.brandFloatTileDensity,
      ['compact', 'comfortable', 'spacious'] as const,
      base.brandFloatTileDensity ?? 'comfortable'
    ),
    brandFloatContentAlignment: pick(
      record.brandFloatContentAlignment,
      ['left', 'center', 'right'] as const,
      base.brandFloatContentAlignment ??
        legacySharedContentAlignment(record, base.contentAlignment ?? 'center')
    ),
    brandFloatCardStyle: pick(
      record.brandFloatCardStyle,
      ['framed', 'plain'] as const,
      base.brandFloatCardStyle ?? 'framed'
    ),
    showLabels: typeof record.showLabels === 'boolean' ? record.showLabels : base.showLabels,
    showDescription:
      typeof record.showDescription === 'boolean'
        ? record.showDescription
        : (base.showDescription ?? true),
    showUseCases:
      typeof record.showUseCases === 'boolean' ? record.showUseCases : (base.showUseCases ?? true),
    showCategory:
      typeof record.showCategory === 'boolean' ? record.showCategory : (base.showCategory ?? true),
    showLevel,
    showLevelOptIn,
    iconBackgroundEnabled,
    iconBackgroundOptIn,
    logosGrayscale:
      typeof record.logosGrayscale === 'boolean'
        ? record.logosGrayscale
        : (base.logosGrayscale ?? false),
    useHeroPalette: mergeUseHeroPalette(base.useHeroPalette, record),
    toolsPalette: mergeToolsPalette(base.toolsPalette ?? DEFAULT_TOOLS_PALETTE, record.toolsPalette),
    toolsColorBindings: mergeToolsColorBindings(
      base.toolsColorBindings ?? DEFAULT_TOOLS_COLOR_BINDINGS,
      record.toolsColorBindings
    ),
    activeColorMode:
      record.activeColorMode === 'light' || record.activeColorMode === 'dark'
        ? record.activeColorMode
        : base.activeColorMode,
  };

  if (next.useHeroPalette !== false) {
    Object.assign(next, applyToolsPaletteToSettings(next));
  }
  return next;
}

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidProfileHexColor(value) ? value.trim() : fallback;
}

function pickToolsDesign(value: unknown, fallback: PortfolioToolsDesign): PortfolioToolsDesign {
  const allowed = [
    'workflow-rail',
    'brand-cards',
    'brand-directory',
    'brand-index',
    'brand-row',
    'brand-float',
    'level-stat-bars',
    'level-progress-rows',
    'level-category-rows',
    'level-table-rows',
    'level-circular-cards',
    'level-star-cards',
    'level-svg-rings',
    'level-bento-categories',
  ] as const;
  const safeFallback = (allowed as readonly string[]).includes(fallback)
    ? fallback
    : 'workflow-rail';
  if (value === 'brand-tiles') return 'workflow-rail';
  if (value === 'brand-showcase') return 'brand-cards';
  if (value === 'level-signal-dots') return 'level-progress-rows';
  return pick(value, allowed, safeFallback);
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
