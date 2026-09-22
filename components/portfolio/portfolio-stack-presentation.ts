import type { PortfolioSectionBackgroundSettings } from '@/components/portfolio/portfolio-section-background-settings';
import type {
  PortfolioToolsBrandCardsIconPlacement,
  PortfolioToolsBrandGridColumnsPerRow,
  PortfolioToolsBrandRowCellStyle,
  PortfolioToolsCardGap,
  PortfolioToolsContentAlignment,
  PortfolioToolsHeaderAlignment,
  PortfolioToolsHeaderFont,
  PortfolioToolsLevelBarSize,
  PortfolioToolsLevelBarStyle,
  PortfolioToolsLevelBentoGridMode,
  PortfolioToolsLevelIndicatorCardStyle,
  PortfolioToolsLevelIndicatorDisplayStyle,
  PortfolioToolsLevelProgressColumnsPerRow,
  PortfolioToolsLevelProgressRowGap,
  PortfolioToolsLevelTableGroupBy,
  PortfolioToolsSubtitlePreset,
  PortfolioToolsTileSize,
} from '@/components/portfolio/portfolio-tools-settings';
import type {
  PortfolioToolsColorBindings,
  PortfolioToolsPalette,
} from '@/components/portfolio/portfolio-tools-palette-settings';
import type { PortfolioSectionColorMode } from '@/components/portfolio/portfolio-section-color-mode';
import type {
  PortfolioStackHeaderAccentCountAlignment,
  PortfolioStackHeaderDesignAlignment,
  PortfolioStackHeaderBillboardWordStyle,
  PortfolioStackHeaderDesign,
  PortfolioStackHeaderMarginBottom,
  PortfolioStackHeaderPaletteToken,
  PortfolioStackHeaderTitleSize,
  PortfolioStackHeaderTitleWeight,
} from '@/components/portfolio/portfolio-stack-header-settings';

export type PortfolioStackDesign =
  | 'workflow-rail'
  | 'stack-tags'
  | 'brand-cards'
  | 'brand-index'
  | 'brand-row'
  | 'level-progress-rows'
  | 'level-category-rows'
  | 'level-table-rows'
  | 'level-circular-cards'
  | 'level-star-cards'
  | 'level-svg-rings'
  | 'level-bento-categories';

export type PortfolioStackTitlePreset = 'core-stack' | 'tech-stack' | 'custom';

/** Title beside content on large screens (split half). */
export type PortfolioStackSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Vertical title position in the aside column (left/right split on lg+). */
export type PortfolioStackAsideTitlePlacement = 'top' | 'center';

/** Tag scale for `stack-tags` — medium matches the default enlarged look. */
export type PortfolioStackTagsSize = 'compact' | 'medium' | 'large' | 'xlarge';

/** Section title scale for all Stack designs. */
export type PortfolioStackTitleSize = 'sm' | 'md' | 'lg' | 'xl';

/** Section subtitle scale for all Stack designs. */
export type PortfolioStackSubtitleSize = 'sm' | 'md' | 'lg';

/**
 * Standalone Stack gallery/presentation settings — shared visual fields used by Stack
 * designs without Tools-only design fields (brand-directory, brand-float, level-stat-bars).
 */
export type PortfolioStackPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioStackDesign;
  titlePreset: PortfolioStackTitlePreset;
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
  /** Vertical spacing between rows — level-progress / category / table designs. */
  levelProgressRowGap: PortfolioToolsLevelProgressRowGap;
  /** Level-progress-rows only — 2 per row on large screens (`lg+`). Default 1. */
  levelProgressColumnsPerRow: PortfolioToolsLevelProgressColumnsPerRow;
  /** Level-progress-rows only. Default center. */
  levelProgressContentAlignment: PortfolioToolsContentAlignment;
  /** Level bar shape — progress rows, category rows, stat bars, etc. Default pill. */
  levelBarStyle: PortfolioToolsLevelBarStyle;
  /** Level bar height and % label size. Default tight (current compact size). */
  levelBarSize: PortfolioToolsLevelBarSize;
  /** `workflow-rail` only. Default center. */
  workflowRailContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-cards` only — columns on `lg+`. Default 1. */
  brandCardsColumnsPerRow: PortfolioToolsBrandGridColumnsPerRow;
  /** `brand-cards` only. Default center. */
  brandCardsContentAlignment: PortfolioToolsContentAlignment;
  /** `brand-cards` only — icon above copy or beside it (showcase-style). Default top. */
  brandCardsIconPlacement: PortfolioToolsBrandCardsIconPlacement;
  /** `brand-cards` only — stretch to container width instead of max-w-3xl. Default false. */
  brandCardsFullWidth: boolean;
  /** `brand-index` only. Default center. */
  brandIndexContentAlignment: PortfolioToolsContentAlignment;
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
  showLabels: boolean;
  showDescription: boolean;
  showUseCases: boolean;
  /** Brand cards — show skill category above the name. Default false for Stack. */
  showCategory?: boolean;
  showLevel: boolean;
  /** Explicit opt-in — legacy saves had `showLevel: true` by default without user action. */
  showLevelOptIn?: boolean;
  /** Opt-in grey pad behind logos. Off by default for Stack. */
  iconBackgroundEnabled: boolean;
  /** Explicit opt-in/out for icon background (legacy saves had global `false`). */
  iconBackgroundOptIn?: boolean;
  /** Render all tool logos in noir & blanc (grayscale). Off by default. */
  logosGrayscale: boolean;
  useHeroPalette: boolean;
  /** JSON field name kept for backward compatibility with Tools palette wiring. */
  toolsPalette?: PortfolioToolsPalette;
  /** JSON field name kept for backward compatibility with Tools color bindings. */
  toolsColorBindings?: PortfolioToolsColorBindings;
  activeColorMode?: 'light' | 'dark';
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
  /**
   * `aside-left` / `aside-right` — title in one half (centered), list in the other.
   * When aside, level-progress-rows always shows 1 column.
   */
  sectionLayout?: PortfolioStackSectionLayout;
  /**
   * When aside layout is active: keep the title sticky in its half while scrolling
   * through the stack list (large screens). Default true.
   */
  asideTitleSticky?: boolean;
  /**
   * Aside layout only — vertical position of the title in its half:
   * flush top or centered in the column (current default).
   */
  asideTitlePlacement?: PortfolioStackAsideTitlePlacement;
  /** `stack-tags` only — chip scale. */
  stackTagsSize?: PortfolioStackTagsSize;
  /** Title size — applies to sticky header and embedded stack-tags kicker. */
  titleSize?: PortfolioStackTitleSize;
  /** Subtitle size — applies to sticky header and embedded stack-tags subtitle. */
  subtitleSize?: PortfolioStackSubtitleSize;
  /** Header design — one shared, GSAP-animated header mounted above the Stack section. */
  headerDesign: PortfolioStackHeaderDesign;
  /** Master switch for Header's GSAP entrance/scroll motion (respects prefers-reduced-motion regardless). */
  headerAnimationEnabled: boolean;
  headerDesignAlignment: PortfolioStackHeaderDesignAlignment;
  /** Bottom spacing under every Header design — shared across all of them. */
  headerMarginBottom: PortfolioStackHeaderMarginBottom;
  /** Title size/weight — shared across every Header design. */
  headerTitleSize: PortfolioStackHeaderTitleSize;
  headerTitleWeight: PortfolioStackHeaderTitleWeight;
  /** Header accent count — badge text supports a {count} token for the stack item count. */
  headerAccentCountBadgeText: string;
  headerAccentCountLeadText: string;
  /** Header accent count — badge and lead bound to a palette token, independently. */
  headerAccentCountBadgeColor: PortfolioStackHeaderPaletteToken;
  headerAccentCountLeadColor: PortfolioStackHeaderPaletteToken;
  /** Header accent count — one size/weight for the whole line (badge + lead flow together). */
  headerAccentCountSize: PortfolioStackHeaderTitleSize;
  headerAccentCountWeight: PortfolioStackHeaderTitleWeight;
  /** Header accent count — its own 3-way alignment (adds "right", unlike the shared control). */
  headerAccentCountAlignment: PortfolioStackHeaderAccentCountAlignment;
  /** Header serif lead — small label above the large serif title. */
  headerSerifLeadLabelText: string;
  /** Header serif lead — the large serif title itself, independent of the section title. */
  headerSerifLeadTitleText: string;
  /** Header serif lead — each element bound to a palette token, independently. */
  headerSerifLeadLabelColor: PortfolioStackHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioStackHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioStackHeaderPaletteToken;
  /** Header serif lead — each element sized/weighted independently. */
  headerSerifLeadLabelSize: PortfolioStackHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioStackHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioStackHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioStackHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioStackHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioStackHeaderTitleWeight;
  /** Header billboard — big faint background word + a {count}-token line. */
  headerBillboardBigWord: string;
  headerBillboardCountText: string;
  /** Header billboard — the editorial split title beneath the big word, independent of the section title. */
  headerBillboardTitleText: string;
  /** Header billboard — outline (stroke only) or fill (solid) big word. */
  headerBillboardWordStyle: PortfolioStackHeaderBillboardWordStyle;
  /** Header billboard — each element bound to a palette token, independently. */
  headerBillboardWordColor: PortfolioStackHeaderPaletteToken;
  headerBillboardTitleColor: PortfolioStackHeaderPaletteToken;
  headerBillboardMetaColor: PortfolioStackHeaderPaletteToken;
  /** Header split heading — small label on the side opposite the narrative title. */
  headerSplitHeadingLabelText: string;
  /** Header split heading — the narrative title itself, independent of the section title. */
  headerSplitHeadingTitleText: string;
  /** Header split heading — each element bound to a palette token, independently. */
  headerSplitHeadingTitleColor: PortfolioStackHeaderPaletteToken;
  headerSplitHeadingLabelColor: PortfolioStackHeaderPaletteToken;
  /** Header split heading — each element sized/weighted independently. */
  headerSplitHeadingTitleSize: PortfolioStackHeaderTitleSize;
  headerSplitHeadingTitleWeight: PortfolioStackHeaderTitleWeight;
  headerSplitHeadingLabelSize: PortfolioStackHeaderTitleSize;
  headerSplitHeadingLabelWeight: PortfolioStackHeaderTitleWeight;
  /** Header masthead — up to 3 independent lines, monumental headline text,
   *  each stacked into the mast (no more period-splitting a single string). */
  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  /** Header masthead — one color for the whole headline, across every line. */
  headerMastheadHeadlineColor: PortfolioStackHeaderPaletteToken;
  /** Header masthead — one size/weight for the whole headline, across every line. */
  headerMastheadHeadlineSize: PortfolioStackHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioStackHeaderTitleWeight;
  /** Header index — small label on the top divider rule (e.g. "Index", "Catalog"). */
  headerIndexLabelText: string;
  /** Header index — the title beside the counting numeral, independent of the section title. */
  headerIndexTitleText: string;
  /** Header index — caption under the counter (e.g. "Technologies"). Empty falls back to automatic pluralization. */
  headerIndexCountLabelText: string;
  /** Header index — the small subtitle under the title, independent of the section subtitle. */
  headerIndexSubtitleText: string;
  /** Header index — each element bound to a palette token, independently. */
  headerIndexLabelColor: PortfolioStackHeaderPaletteToken;
  headerIndexNumberColor: PortfolioStackHeaderPaletteToken;
  headerIndexTitleColor: PortfolioStackHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioStackHeaderPaletteToken;
  /** Header index — each element sized/weighted independently. */
  headerIndexLabelSize: PortfolioStackHeaderTitleSize;
  headerIndexLabelWeight: PortfolioStackHeaderTitleWeight;
  headerIndexTitleSize: PortfolioStackHeaderTitleSize;
  headerIndexTitleWeight: PortfolioStackHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioStackHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioStackHeaderTitleWeight;
  /** Header marquee — up to 4 independent words in the repeating band, each its own field (empty slots are dropped). */
  headerMarqueeWord1Text: string;
  headerMarqueeWord2Text: string;
  headerMarqueeWord3Text: string;
  headerMarqueeWord4Text: string;
  /** Header marquee — alternating fill/outline words bound to one palette token. */
  headerMarqueeWordColor: PortfolioStackHeaderPaletteToken;
  /** Header marquee — scales the repeating word band. */
  headerMarqueeSize: PortfolioStackHeaderTitleSize;
};

/** Legacy title presets accepted in saved JSON — normalized by mergeStackPresentation. */
export type PortfolioStackTitlePresetLegacy =
  | PortfolioStackTitlePreset
  | 'stack'
  | 'tools'
  | 'workflow-tools';
