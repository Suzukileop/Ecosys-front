import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import type { PortfolioSectionBackgroundSettings } from '@/components/portfolio/portfolio-section-background-settings';
import {
  applyToolsPaletteToSettings,
  DEFAULT_TOOLS_COLOR_BINDINGS,
  DEFAULT_TOOLS_PALETTE,
} from '@/components/portfolio/portfolio-tools-palette-settings';
import {
  mergeStackPresentationBase,
  pickStackPresentationFields,
  DEFAULT_SECTION_BACKGROUND,
  type PortfolioStackSectionSettings,
} from '@/components/portfolio/portfolio-stack-merge';
import {
  type PortfolioStackAsideTitlePlacement,
  type PortfolioStackDesign,
  type PortfolioStackPresentationSettings,
  type PortfolioStackSectionLayout,
  type PortfolioStackSubtitleSize,
  type PortfolioStackTagsSize,
  type PortfolioStackTitlePreset,
  type PortfolioStackTitlePresetLegacy,
  type PortfolioStackTitleSize,
} from '@/components/portfolio/portfolio-stack-presentation';
import {
  mergeLevelIndicatorDisplayStyle,
  LEVEL_STAR_CARDS_COLUMNS_PER_ROW,
  toolsHeaderFontClass,
  toolsHeaderFontStyle,
  toolsSubtitleColorStyle,
  toolsTitleColorStyle,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsHeaderAlignment,
} from '@/components/portfolio/portfolio-tools-settings';

export type {
  PortfolioStackAsideTitlePlacement,
  PortfolioStackDesign,
  PortfolioStackPresentationSettings,
  PortfolioStackSectionLayout,
  PortfolioStackSubtitleSize,
  PortfolioStackTagsSize,
  PortfolioStackTitlePreset,
  PortfolioStackTitleSize,
} from '@/components/portfolio/portfolio-stack-presentation';
export type { PortfolioStackSectionSettings } from '@/components/portfolio/portfolio-stack-merge';
export { pickStackPresentationFields, mergeStackPresentationBase, resolveStackShowLevel, resolveStackIconBackgroundEnabled } from '@/components/portfolio/portfolio-stack-merge';
export { stackPresentationToToolsGallery } from '@/components/portfolio/portfolio-stack-gallery-mapper';

export const PORTFOLIO_STACK_TAGS_SIZE_OPTIONS: {
  value: PortfolioStackTagsSize;
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'Compacte', description: 'Petits tags — rendu dense.' },
  { value: 'medium', label: 'Moyenne', description: 'Taille équilibrée (défaut).' },
  { value: 'large', label: 'Grande', description: 'Tags plus lisibles sur grand écran.' },
  { value: 'xlarge', label: 'Très grande', description: 'Maximum — pastilles XXL.' },
];

export const PORTFOLIO_STACK_TITLE_SIZE_OPTIONS: {
  value: PortfolioStackTitleSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Petite', description: 'Titre compact.' },
  { value: 'md', label: 'Moyenne', description: 'Taille équilibrée (défaut).' },
  { value: 'lg', label: 'Grande', description: 'Titre plus affirmé.' },
  { value: 'xl', label: 'Très grande', description: 'Impact maximum.' },
];

export const PORTFOLIO_STACK_SUBTITLE_SIZE_OPTIONS: {
  value: PortfolioStackSubtitleSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Petite', description: 'Sous-titre compact.' },
  { value: 'md', label: 'Moyenne', description: 'Taille de lecture par défaut.' },
  { value: 'lg', label: 'Grande', description: 'Sous-titre plus aéré.' },
];

export function resolveStackTagsSize(
  size: PortfolioStackTagsSize | undefined
): PortfolioStackTagsSize {
  return size ?? 'medium';
}

export function resolveStackTitleSize(
  size: PortfolioStackTitleSize | undefined
): PortfolioStackTitleSize {
  return size ?? 'md';
}

export function resolveStackSubtitleSize(
  size: PortfolioStackSubtitleSize | undefined
): PortfolioStackSubtitleSize {
  return size ?? 'md';
}

/** Sticky / section header title sizes (workflow-rail). */
export function stackSectionTitleSizeClass(size: PortfolioStackTitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-3xl sm:text-4xl lg:text-5xl lg:leading-[0.95]';
    case 'lg':
      return 'text-4xl sm:text-5xl lg:text-7xl lg:leading-[0.95]';
    case 'xl':
      return 'text-4xl sm:text-5xl lg:text-8xl lg:leading-[0.92]';
    default:
      return 'text-4xl sm:text-5xl lg:text-6xl lg:leading-[0.95]';
  }
}

/** Sticky / section header subtitle sizes (workflow-rail). */
export function stackSectionSubtitleSizeClass(size: PortfolioStackSubtitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-sm sm:text-base';
    case 'lg':
      return 'text-lg sm:text-xl';
    default:
      return 'text-base sm:text-lg';
  }
}

export function stackTagsContainerMaxWidth(
  _size: PortfolioStackTagsSize,
  _alignment: 'left' | 'center' | 'right'
): string {
  // Full-bleed section width — alignment uses flex justify, not a capped box.
  return '100%';
}

/** Embedded kicker title for `stack-tags` — driven by titleSize. */
export function stackTagsKickerClass(size: PortfolioStackTitleSize): string {
  switch (size) {
    case 'sm':
      return 'text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]';
    case 'lg':
      return 'text-sm font-semibold uppercase tracking-[0.22em] sm:text-base';
    case 'xl':
      return 'text-base font-semibold uppercase tracking-[0.24em] sm:text-lg';
    default:
      return 'text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm';
  }
}

/** Embedded subtitle for `stack-tags` — driven by subtitleSize. */
export function stackTagsSubtitleClass(size: PortfolioStackSubtitleSize): string {
  switch (size) {
    case 'sm':
      return 'mt-2 text-sm leading-relaxed';
    case 'lg':
      return 'mt-4 text-[1.0625rem] leading-relaxed sm:text-lg';
    default:
      return 'mt-3 text-base leading-relaxed sm:text-[1.0625rem]';
  }
}

export function stackTagsListClass(size: PortfolioStackTagsSize): string {
  switch (size) {
    case 'compact':
      return 'mt-4';
    case 'large':
      return 'mt-6 sm:mt-7';
    case 'xlarge':
      return 'mt-7 sm:mt-8';
    default:
      return 'mt-5 sm:mt-6';
  }
}

export function stackTagsChipClass(size: PortfolioStackTagsSize): string {
  switch (size) {
    case 'compact':
      return 'rounded-md px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em] sm:text-xs';
    case 'large':
      return 'rounded-lg px-5 py-2.5 text-[0.9375rem] font-medium tracking-[-0.01em] sm:px-6 sm:py-3 sm:text-base';
    case 'xlarge':
      return 'rounded-xl px-6 py-3 text-base font-medium tracking-[-0.01em] sm:px-7 sm:py-3.5 sm:text-lg';
    default:
      return 'rounded-lg px-4 py-2 text-sm font-medium tracking-[-0.01em] sm:px-[1.125rem] sm:py-2.5 sm:text-[0.9375rem]';
  }
}

/**
 * stack-tags title alignment — center by default.
 * Legacy: title left + tags centered (workflow-rail carry-over) → center title.
 */
export function resolveStackTagsHeaderAlignment(
  presentation: Pick<
    PortfolioStackPresentationSettings,
    'design' | 'headerAlignment' | 'contentAlignment'
  >
): PortfolioToolsHeaderAlignment {
  if (presentation.design !== 'stack-tags') {
    return presentation.headerAlignment ?? 'center';
  }
  if (presentation.headerAlignment === 'right') return 'right';
  if (
    presentation.headerAlignment === 'left' &&
    presentation.contentAlignment === 'left'
  ) {
    return 'left';
  }
  return 'center';
}

/** stack-tags tag row alignment — center by default. */
export function resolveStackTagsContentAlignment(
  presentation: Pick<
    PortfolioStackPresentationSettings,
    'design' | 'contentAlignment'
  >
): PortfolioToolsContentAlignment {
  if (presentation.design !== 'stack-tags') {
    return presentation.contentAlignment ?? 'center';
  }
  if (presentation.contentAlignment === 'right') return 'right';
  if (presentation.contentAlignment === 'left') return 'left';
  return 'center';
}

export const DEFAULT_STACK_TITLE = 'Core Stack';
export const DEFAULT_STACK_BRAND_CARDS_TITLE = 'Tech Stack';
export const DEFAULT_STACK_BRAND_CARDS_SUBTITLE =
  'Languages, frameworks, and platforms I use to ship reliable products.';

/** Stack layouts — workflow rail is the default (first) design. */
export const PORTFOLIO_STACK_DESIGN_OPTIONS: {
  value: PortfolioStackDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'workflow-rail',
    label: 'Core stack rail',
    description: 'Logo in a rounded tile, name below — one centered horizontal row.',
  },
  {
    value: 'stack-tags',
    label: 'Core stack tags',
    description: 'Accent kicker and wrapped name chips on a dark surface — no logos.',
  },
  {
    value: 'brand-cards',
    label: 'Brand cards',
    description:
      'Card grid — logo left by default, 2 per row, name, description, and level.',
  },
  {
    value: 'brand-index',
    label: 'Brand index',
    description:
      'Portfolio index rows — logo left, name, category center, description right, hairline dividers.',
  },
  {
    value: 'brand-row',
    label: 'Brand row',
    description:
      'Compact horizontal grid — logo and name per cell, vertical dividers, no arrows.',
  },
  {
    value: 'level-progress-rows',
    label: 'Level progress rows',
    description:
      'Editorial list — logo, name, % and progress bar (logo color). Gap, alignment, and 1–2 columns.',
  },
  {
    value: 'level-category-rows',
    label: 'Level category rows',
    description:
      'Editorial list — logo, name + category, thin bar and % on the right (like a skills résumé).',
  },
  {
    value: 'level-table-rows',
    label: 'Level table rows',
    description:
      'Table without header — logo + name, category, colored level label, and % (no experience column).',
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
      'Bento grid — one card per category, logo + name + colored level label per row.',
  },
];

export const PORTFOLIO_STACK_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioStackSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus de la liste (disposition classique).',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Écran coupé en deux — titre centré à gauche, liste à droite.',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Écran coupé en deux — liste à gauche, titre centré à droite.',
  },
];

export function isPortfolioStackSectionLayout(
  value: unknown
): value is PortfolioStackSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function stackSectionLayoutIsAside(
  layout: PortfolioStackSectionLayout | undefined
): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

export function stackLevelIndicatorDesignSupportsCardFrame(
  design: PortfolioStackDesign | undefined
): boolean {
  return (
    design === 'level-circular-cards' ||
    design === 'level-bento-categories' ||
    design === 'level-star-cards' ||
    design === 'level-svg-rings'
  );
}

export const PORTFOLIO_STACK_ASIDE_TITLE_PLACEMENT_OPTIONS: {
  value: PortfolioStackAsideTitlePlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'top',
    label: 'En haut',
    description: 'Titre aligné en haut, face au début de la liste.',
  },
  {
    value: 'center',
    label: 'Centré face à la liste',
    description: 'Titre centré verticalement par rapport à la hauteur de la liste à côté.',
  },
];

export function isPortfolioStackAsideTitlePlacement(
  value: unknown
): value is PortfolioStackAsideTitlePlacement {
  return value === 'top' || value === 'center';
}

export function resolveStackAsideTitlePlacement(
  placement: PortfolioStackAsideTitlePlacement | undefined
): PortfolioStackAsideTitlePlacement {
  return placement === 'top' ? 'top' : 'center';
}

/** Defaults applied when switching to Brand index. */
export function stackBrandIndexDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'brand-index',
    titlePreset: 'tech-stack',
    title: DEFAULT_STACK_BRAND_CARDS_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: true,
    showUseCases: false,
    showCategory: true,
    showLevel: false,
    showLevelOptIn: false,
    showLabels: true,
    brandIndexContentAlignment: 'center',
    brandIndexFullWidth: true,
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    cardGap: 'medium',
    headerAlignment: 'left',
  };
}

/** Defaults applied when switching to Brand row. */
export function stackBrandRowDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'brand-row',
    titlePreset: 'tech-stack',
    title: DEFAULT_STACK_BRAND_CARDS_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: false,
    showLevelOptIn: false,
    showLabels: true,
    brandRowColumnsPerRow: 3,
    brandRowContentAlignment: 'center',
    brandRowCellStyle: 'dividers',
    cardGap: 'tight',
    headerAlignment: 'left',
  };
}

/** Defaults applied when switching to Brand cards. */
export function stackBrandCardsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'brand-cards',
    titlePreset: 'tech-stack',
    title: DEFAULT_STACK_BRAND_CARDS_TITLE,
    titleCustom: '',
    subtitlePreset: 'custom',
    subtitle: DEFAULT_STACK_BRAND_CARDS_SUBTITLE,
    subtitleCustom: DEFAULT_STACK_BRAND_CARDS_SUBTITLE,
    showDescription: true,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    brandCardsIconPlacement: 'left',
    brandCardsColumnsPerRow: 2,
    brandCardsContentAlignment: 'center',
    brandCardsFullWidth: false,
    headerAlignment: 'left',
  };
}

/** Defaults applied when switching to Level category rows. */
export function stackLevelCategoryRowsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-category-rows',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
    levelProgressRowGap: 'large',
    levelProgressColumnsPerRow: 1,
    levelProgressContentAlignment: 'center',
    levelBarStyle: 'rectangle',
    levelBarSize: 'small',
    levelIndicatorFullWidth: false,
    levelTableFullWidth: false,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

/** Defaults applied when switching to Level table rows. */
export function stackLevelTableRowsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-table-rows',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
    levelProgressRowGap: 'large',
    levelProgressColumnsPerRow: 1,
    levelProgressContentAlignment: 'center',
    levelBarStyle: 'rectangle',
    levelBarSize: 'small',
    levelIndicatorFullWidth: false,
    levelTableFullWidth: false,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

/** Defaults applied when switching to Level bento categories. */
export function stackLevelBentoCategoriesDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-bento-categories',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
    levelProgressRowGap: 'medium',
    cardGap: 'medium',
    levelBarStyle: 'rectangle',
    levelBarSize: 'small',
    levelIndicatorFullWidth: true,
    levelTableFullWidth: true,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    levelBentoGridMode: 'equal',
    levelIndicatorDisplayStyle: 'progress-bar',
    brandCardsContentAlignment: 'left',
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

/** Defaults applied when switching to Level circular cards. */
export function stackLevelCircularCardsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-circular-cards',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
    brandCardsColumnsPerRow: 3,
    brandCardsContentAlignment: 'center',
    levelBarStyle: 'rectangle',
    levelBarSize: 'small',
    levelIndicatorFullWidth: false,
    levelTableFullWidth: false,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

/** Defaults applied when switching to Level star cards. */
export function stackLevelStarCardsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-star-cards',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
    brandCardsColumnsPerRow: 4,
    brandCardsContentAlignment: 'left',
    cardGap: 'medium',
    levelIndicatorFullWidth: true,
    levelTableFullWidth: true,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

/** Defaults applied when switching to Level SVG rings. */
export function stackLevelSvgRingsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-svg-rings',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: false,
    brandCardsColumnsPerRow: 3,
    brandCardsContentAlignment: 'center',
    levelProgressRowGap: 'medium',
    cardGap: 'medium',
    levelIndicatorFullWidth: false,
    levelTableFullWidth: false,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    levelIndicatorCardStyle: 'framed',
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

/** Defaults applied when switching to Level progress rows (same as Tools). */
export function stackLevelProgressRowsDesignDefaults(): Partial<PortfolioStackSectionSettings> {
  return {
    design: 'level-progress-rows',
    titlePreset: 'core-stack',
    title: DEFAULT_STACK_TITLE,
    titleCustom: '',
    subtitlePreset: 'none',
    subtitle: '',
    subtitleCustom: '',
    showDescription: false,
    showUseCases: false,
    showCategory: false,
    showLevel: true,
    showLevelOptIn: true,
    showLabels: true,
    iconBackgroundEnabled: false,
    iconBackgroundOptIn: true,
    levelProgressRowGap: 'large',
    levelProgressColumnsPerRow: 2,
    levelProgressContentAlignment: 'center',
    levelBarStyle: 'rectangle',
    levelBarSize: 'small',
    levelIndicatorFullWidth: false,
    levelTableFullWidth: false,
    levelTableGroupBy: 'category',
    levelIndicatorShowCategoryFilter: false,
    levelTableShowCategoryFilter: false,
    headerAlignment: 'center',
    contentAlignment: 'center',
  };
}

export const PORTFOLIO_STACK_TITLE_PRESET_OPTIONS = [
  { value: 'core-stack' as const, label: 'Core Stack', description: 'Default for rail & tags.' },
  { value: 'tech-stack' as const, label: 'Tech Stack', description: 'Default for brand cards.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own title.' },
];

export const DEFAULT_STACK_PRESENTATION: PortfolioStackPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'workflow-rail',
  sectionLayout: 'stacked',
  asideTitleSticky: true,
  asideTitlePlacement: 'center',
  stackTagsSize: 'medium',
  titleSize: 'md',
  subtitleSize: 'md',
  titlePreset: 'core-stack',
  titleCustom: '',
  subtitlePreset: 'none',
  subtitleCustom: '',
  headerAlignment: 'center',
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
  levelProgressColumnsPerRow: 2,
  levelProgressContentAlignment: 'center',
  levelBarStyle: 'rectangle',
  levelBarSize: 'small',
  workflowRailContentAlignment: 'center',
  brandCardsColumnsPerRow: 1,
  brandCardsContentAlignment: 'center',
  brandCardsIconPlacement: 'top',
  brandCardsFullWidth: false,
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
  showLabels: true,
  showDescription: false,
  showUseCases: false,
  showCategory: false,
  showLevel: false,
  iconBackgroundEnabled: true,
  logosGrayscale: false,
  useHeroPalette: true,
  toolsPalette: { ...DEFAULT_TOOLS_PALETTE },
  toolsColorBindings: { ...DEFAULT_TOOLS_COLOR_BINDINGS },
  activeColorMode: 'light',
};

Object.assign(DEFAULT_STACK_PRESENTATION, applyToolsPaletteToSettings(DEFAULT_STACK_PRESENTATION));

export function resolveStackSectionTitle(
  settings: Pick<PortfolioStackSectionSettings, 'titleCustom' | 'title' | 'design'> & {
    titlePreset?: PortfolioStackTitlePresetLegacy;
  }
): string {
  const titlePreset = settings.titlePreset;
  if (titlePreset === 'custom') {
    const custom = settings.titleCustom?.trim();
    if (custom) return portfolioSectionTitleSentenceCase(custom);
  }
  // Core stack tags — always "Core Stack" unless a custom title is set.
  if (settings.design === 'stack-tags') {
    return DEFAULT_STACK_TITLE;
  }
  if (titlePreset === 'core-stack') return DEFAULT_STACK_TITLE;
  if (titlePreset === 'tech-stack') return DEFAULT_STACK_BRAND_CARDS_TITLE;
  // Legacy preset from before Core Stack existed.
  if (titlePreset === 'stack') return DEFAULT_STACK_TITLE;
  if (titlePreset === 'tools') return 'Tools';
  if (titlePreset === 'workflow-tools') return 'Workflow & Tools';
  // Brand layouts default title when design matches.
  if (
    settings.design === 'brand-cards' ||
    settings.design === 'brand-index' ||
    settings.design === 'brand-row'
  ) {
    return DEFAULT_STACK_BRAND_CARDS_TITLE;
  }
  const stored = settings.title?.trim();
  if (stored) {
    const normalized = stored.toLocaleLowerCase();
    if (normalized === 'stack') return DEFAULT_STACK_TITLE;
    return portfolioSectionTitleSentenceCase(stored);
  }
  return DEFAULT_STACK_TITLE;
}

export function resolveStackSectionSubtitle(
  settings: Pick<PortfolioStackSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  if (settings.subtitlePreset !== 'custom') return '';
  const custom = settings.subtitleCustom?.trim();
  if (custom) return custom;
  return settings.subtitle?.trim() ?? '';
}

function normalizeStackTagsAlignments(
  presentation: PortfolioStackPresentationSettings
): Pick<PortfolioStackPresentationSettings, 'headerAlignment' | 'contentAlignment'> {
  if (presentation.design !== 'stack-tags') {
    return {
      headerAlignment: presentation.headerAlignment,
      contentAlignment: presentation.contentAlignment,
    };
  }
  const headerAlignment = resolveStackTagsHeaderAlignment(presentation);
  const contentAlignment = resolveStackTagsContentAlignment(presentation);
  return { headerAlignment, contentAlignment };
}

export function pickStackPresentationSettings(
  settings: PortfolioStackSectionSettings
): PortfolioStackPresentationSettings {
  const picked = pickStackPresentationFields(settings);
  const allowed = new Set(PORTFOLIO_STACK_DESIGN_OPTIONS.map((item) => item.value));
  const design: PortfolioStackDesign = allowed.has(picked.design) ? picked.design : 'workflow-rail';
  const sectionLayout: PortfolioStackSectionLayout = isPortfolioStackSectionLayout(
    settings.sectionLayout ?? picked.sectionLayout
  )
    ? (settings.sectionLayout ?? picked.sectionLayout)!
    : 'stacked';
  const aside = stackSectionLayoutIsAside(sectionLayout);
  const withDesign = { ...picked, design, sectionLayout };
  return {
    ...withDesign,
    asideTitleSticky: picked.asideTitleSticky !== false,
    asideTitlePlacement: resolveStackAsideTitlePlacement(picked.asideTitlePlacement),
    stackTagsSize: resolveStackTagsSize(picked.stackTagsSize),
    titleSize: resolveStackTitleSize(picked.titleSize),
    subtitleSize: resolveStackSubtitleSize(picked.subtitleSize),
    showCategory: false,
    ...normalizeStackTagsAlignments(withDesign),
    ...(design === 'brand-cards'
      ? {
          brandCardsIconPlacement: picked.brandCardsIconPlacement ?? 'left',
          brandCardsColumnsPerRow: aside ? 1 : (picked.brandCardsColumnsPerRow ?? 2),
          brandCardsFullWidth: picked.brandCardsFullWidth === true,
        }
      : design === 'brand-index'
        ? {
            showDescription: picked.showDescription === false ? false : true,
            showUseCases: false,
            showCategory: true,
            showLevel: false,
            showLabels: picked.showLabels !== false,
            brandIndexContentAlignment: picked.brandIndexContentAlignment ?? 'center',
            brandIndexFullWidth: picked.brandIndexFullWidth !== false,
            levelIndicatorShowCategoryFilter: picked.levelIndicatorShowCategoryFilter === true,
            levelTableShowCategoryFilter: picked.levelTableShowCategoryFilter === true,
            cardGap: picked.cardGap ?? 'medium',
          }
        : design === 'brand-row'
          ? {
              showDescription: false,
              showUseCases: false,
              showCategory: false,
              showLevel: false,
              showLabels: picked.showLabels !== false,
              brandRowColumnsPerRow: aside ? 1 : (picked.brandRowColumnsPerRow ?? 3),
              brandRowContentAlignment: picked.brandRowContentAlignment ?? 'center',
              brandRowCellStyle: picked.brandRowCellStyle ?? 'dividers',
              cardGap: picked.cardGap ?? 'tight',
            }
      : design === 'level-progress-rows'
        ? {
            showLevel: picked.showLevel !== false,
            levelProgressRowGap: picked.levelProgressRowGap ?? 'large',
            levelProgressColumnsPerRow: aside
              ? 1
              : (picked.levelProgressColumnsPerRow ?? 2),
            levelProgressContentAlignment: picked.levelProgressContentAlignment ?? 'center',
            levelIndicatorFullWidth: picked.levelIndicatorFullWidth === true,
            levelTableFullWidth: picked.levelTableFullWidth === true,
          }
        : design === 'level-category-rows'
          ? {
              showLevel: picked.showLevel !== false,
              showLabels: picked.showLabels !== false,
              iconBackgroundEnabled: false,
              iconBackgroundOptIn: false,
              levelProgressRowGap: picked.levelProgressRowGap ?? 'large',
              levelProgressColumnsPerRow: aside ? 1 : (picked.levelProgressColumnsPerRow ?? 1),
              levelProgressContentAlignment: picked.levelProgressContentAlignment ?? 'center',
              levelIndicatorFullWidth: picked.levelIndicatorFullWidth === true,
              levelTableFullWidth: picked.levelTableFullWidth === true,
            }
          : design === 'level-table-rows'
            ? {
                showLevel: picked.showLevel !== false,
                showLabels: picked.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                levelProgressRowGap: picked.levelProgressRowGap ?? 'large',
                levelProgressColumnsPerRow: 1,
                levelProgressContentAlignment: picked.levelProgressContentAlignment ?? 'center',
              }
          : design === 'level-circular-cards'
          ? {
              showLevel: picked.showLevel !== false,
              showLabels: picked.showLabels !== false,
              iconBackgroundEnabled: false,
              iconBackgroundOptIn: false,
              brandCardsColumnsPerRow: aside ? 2 : (picked.brandCardsColumnsPerRow ?? 3),
              brandCardsContentAlignment: picked.brandCardsContentAlignment ?? 'center',
            }
          : design === 'level-star-cards'
            ? {
                showLevel: picked.showLevel !== false,
                showLabels: picked.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                brandCardsColumnsPerRow: aside ? 2 : LEVEL_STAR_CARDS_COLUMNS_PER_ROW,
                brandCardsContentAlignment: picked.brandCardsContentAlignment ?? 'left',
                cardGap: picked.cardGap ?? 'medium',
                levelIndicatorFullWidth: picked.levelIndicatorFullWidth ?? true,
                levelTableFullWidth: picked.levelTableFullWidth ?? true,
                levelIndicatorCardStyle: picked.levelIndicatorCardStyle ?? 'framed',
              }
          : design === 'level-svg-rings'
            ? {
                showLevel: picked.showLevel !== false,
                showLabels: picked.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                brandCardsColumnsPerRow: aside ? 2 : (picked.brandCardsColumnsPerRow ?? 3),
                brandCardsContentAlignment: picked.brandCardsContentAlignment ?? 'center',
                levelProgressRowGap: picked.levelProgressRowGap ?? 'medium',
                cardGap: picked.cardGap ?? 'medium',
                levelIndicatorCardStyle: picked.levelIndicatorCardStyle ?? 'framed',
              }
          : design === 'level-bento-categories'
            ? {
                showLevel: picked.showLevel !== false,
                showLabels: picked.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                levelProgressRowGap: picked.levelProgressRowGap ?? 'medium',
                cardGap: picked.cardGap ?? 'medium',
                levelIndicatorCardStyle: picked.levelIndicatorCardStyle ?? 'framed',
                levelBentoGridMode: picked.levelBentoGridMode ?? 'equal',
                brandCardsContentAlignment: picked.brandCardsContentAlignment ?? 'left',
              }
          : {}),
  };
}

export function mergeStackPresentation(
  base: PortfolioStackPresentationSettings,
  patch: unknown
): PortfolioStackPresentationSettings {
  const record =
    typeof patch === 'object' && patch !== null ? (patch as Record<string, unknown>) : null;
  const withoutDesign = record ? { ...record } : {};
  if ('design' in withoutDesign) delete withoutDesign.design;

  const merged = mergeStackPresentationBase(base, withoutDesign);
  const allowedDesigns = new Set(PORTFOLIO_STACK_DESIGN_OPTIONS.map((item) => item.value));
  const requestedDesign =
    typeof record?.design === 'string' ? record.design : merged.design;
  const design: PortfolioStackDesign = allowedDesigns.has(requestedDesign as PortfolioStackDesign)
    ? (requestedDesign as PortfolioStackDesign)
    : allowedDesigns.has(merged.design)
      ? merged.design
      : 'workflow-rail';
  const rawSectionLayout = record?.sectionLayout ?? merged.sectionLayout;
  const sectionLayout: PortfolioStackSectionLayout = isPortfolioStackSectionLayout(
    rawSectionLayout
  )
    ? rawSectionLayout
    : 'stacked';
  const aside = stackSectionLayoutIsAside(sectionLayout);
  const stackTagsSize = pickStackTagsSize(record?.stackTagsSize, merged.stackTagsSize);
  const titleSize = pickStackTitleSize(record?.titleSize, merged.titleSize);
  const subtitleSize = pickStackSubtitleSize(record?.subtitleSize, merged.subtitleSize);

  // Migrate legacy "Stack" preset → Core Stack (especially for stack-tags).
  let titlePreset: PortfolioStackTitlePresetLegacy = merged.titlePreset as PortfolioStackTitlePresetLegacy;
  if (titlePreset !== 'custom') {
    if (
      design === 'brand-cards' ||
      design === 'brand-index' ||
      design === 'brand-row'
    ) {
      if (
        titlePreset === 'core-stack' ||
        titlePreset === 'stack' ||
        titlePreset === 'tools' ||
        titlePreset === 'workflow-tools'
      ) {
        titlePreset = 'tech-stack';
      }
    } else if (
      design === 'stack-tags' ||
      titlePreset === 'stack' ||
      titlePreset === 'tools' ||
      titlePreset === 'workflow-tools'
    ) {
      titlePreset = 'core-stack';
    }
  }

  return {
    ...merged,
    design,
    sectionLayout,
    asideTitleSticky:
      typeof record?.asideTitleSticky === 'boolean'
        ? record.asideTitleSticky
        : merged.asideTitleSticky !== false,
    asideTitlePlacement: isPortfolioStackAsideTitlePlacement(record?.asideTitlePlacement)
      ? record.asideTitlePlacement
      : resolveStackAsideTitlePlacement(merged.asideTitlePlacement),
    stackTagsSize,
    titleSize,
    subtitleSize,
    titlePreset: titlePreset as PortfolioStackTitlePreset,
    ...normalizeStackTagsAlignments({ ...merged, design }),
    ...(design === 'brand-cards'
      ? {
          showDescription: merged.showDescription !== false,
          showUseCases: false,
          showCategory: false,
          showLevel: merged.showLevel !== false,
          // Prefer brand-cards defaults when still on Tools-like first defaults.
          brandCardsIconPlacement:
            merged.brandCardsIconPlacement === 'top' &&
            (merged.brandCardsColumnsPerRow ?? 1) === 1
              ? 'left'
              : (merged.brandCardsIconPlacement ?? 'left'),
          brandCardsColumnsPerRow: aside
            ? 1
            : merged.brandCardsIconPlacement === 'top' &&
                (merged.brandCardsColumnsPerRow ?? 1) === 1
              ? 2
              : (merged.brandCardsColumnsPerRow ?? 2),
          brandCardsFullWidth: merged.brandCardsFullWidth === true,
          subtitlePreset: 'custom' as const,
          subtitleCustom:
            merged.subtitleCustom?.trim() ||
            (typeof record?.['subtitle'] === 'string'
              ? (record['subtitle'] as string).trim()
              : '') ||
            DEFAULT_STACK_BRAND_CARDS_SUBTITLE,
        }
      : design === 'brand-index'
        ? {
            showDescription: merged.showDescription === false ? false : true,
            showUseCases: false,
            showCategory: true,
            showLevel: false,
            showLabels: merged.showLabels !== false,
            brandIndexContentAlignment: merged.brandIndexContentAlignment ?? 'center',
            brandIndexFullWidth: merged.brandIndexFullWidth !== false,
            levelIndicatorShowCategoryFilter: merged.levelIndicatorShowCategoryFilter === true,
            levelTableShowCategoryFilter: merged.levelTableShowCategoryFilter === true,
            cardGap: merged.cardGap ?? 'medium',
            subtitlePreset: 'none' as const,
            subtitle: '',
            subtitleCustom: '',
          }
        : design === 'brand-row'
          ? {
              showDescription: false,
              showUseCases: false,
              showCategory: false,
              showLevel: false,
              showLabels: merged.showLabels !== false,
              brandRowColumnsPerRow: aside ? 1 : (merged.brandRowColumnsPerRow ?? 3),
              brandRowContentAlignment: merged.brandRowContentAlignment ?? 'center',
              brandRowCellStyle: merged.brandRowCellStyle ?? 'dividers',
              cardGap: merged.cardGap ?? 'tight',
              subtitlePreset: 'none' as const,
              subtitle: '',
              subtitleCustom: '',
            }
      : design === 'level-progress-rows'
        ? {
            showDescription: false,
            showUseCases: false,
            showCategory: false,
            showLevel: merged.showLevel !== false,
            showLabels: merged.showLabels !== false,
            levelProgressRowGap: merged.levelProgressRowGap ?? 'large',
            levelProgressColumnsPerRow: aside
              ? 1
              : (merged.levelProgressColumnsPerRow ?? 2),
            levelProgressContentAlignment: merged.levelProgressContentAlignment ?? 'center',
            levelIndicatorFullWidth: merged.levelIndicatorFullWidth === true,
            levelTableFullWidth: merged.levelTableFullWidth === true,
          }
        : design === 'level-category-rows'
          ? {
              showDescription: false,
              showUseCases: false,
              showCategory: false,
              showLevel: merged.showLevel !== false,
              showLabels: merged.showLabels !== false,
              iconBackgroundEnabled: false,
              iconBackgroundOptIn: false,
              levelProgressRowGap: merged.levelProgressRowGap ?? 'large',
              levelProgressColumnsPerRow: aside ? 1 : (merged.levelProgressColumnsPerRow ?? 1),
              levelProgressContentAlignment: merged.levelProgressContentAlignment ?? 'center',
              levelIndicatorFullWidth: merged.levelIndicatorFullWidth === true,
              levelTableFullWidth: merged.levelTableFullWidth === true,
            }
          : design === 'level-table-rows'
            ? {
                showDescription: false,
                showUseCases: false,
                showCategory: false,
                showLevel: merged.showLevel !== false,
                showLabels: merged.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                levelProgressRowGap: merged.levelProgressRowGap ?? 'large',
                levelProgressColumnsPerRow: 1,
                levelProgressContentAlignment: merged.levelProgressContentAlignment ?? 'center',
              }
          : design === 'level-circular-cards'
          ? {
              showDescription: false,
              showUseCases: false,
              showCategory: false,
              showLevel: merged.showLevel !== false,
              showLabels: merged.showLabels !== false,
              iconBackgroundEnabled: false,
              iconBackgroundOptIn: false,
              brandCardsColumnsPerRow: aside ? 2 : (merged.brandCardsColumnsPerRow ?? 3),
              brandCardsContentAlignment: merged.brandCardsContentAlignment ?? 'center',
            }
          : design === 'level-star-cards'
            ? {
                showDescription: false,
                showUseCases: false,
                showCategory: false,
                showLevel: merged.showLevel !== false,
                showLabels: merged.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                brandCardsColumnsPerRow: aside ? 2 : LEVEL_STAR_CARDS_COLUMNS_PER_ROW,
                brandCardsContentAlignment: merged.brandCardsContentAlignment ?? 'left',
                cardGap: merged.cardGap ?? 'medium',
                levelIndicatorFullWidth: merged.levelIndicatorFullWidth ?? true,
                levelTableFullWidth: merged.levelTableFullWidth ?? true,
                levelIndicatorCardStyle: merged.levelIndicatorCardStyle ?? 'framed',
              }
          : design === 'level-svg-rings'
            ? {
                showDescription: false,
                showUseCases: false,
                showCategory: false,
                showLevel: merged.showLevel !== false,
                showLabels: merged.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                brandCardsColumnsPerRow: aside ? 2 : (merged.brandCardsColumnsPerRow ?? 3),
                brandCardsContentAlignment: merged.brandCardsContentAlignment ?? 'center',
                levelProgressRowGap: merged.levelProgressRowGap ?? 'medium',
                cardGap: merged.cardGap ?? 'medium',
                levelIndicatorCardStyle: merged.levelIndicatorCardStyle ?? 'framed',
              }
          : design === 'level-bento-categories'
            ? {
                showDescription: false,
                showUseCases: false,
                showCategory: false,
                showLevel: merged.showLevel !== false,
                showLabels: merged.showLabels !== false,
                iconBackgroundEnabled: false,
                iconBackgroundOptIn: false,
                levelProgressRowGap: merged.levelProgressRowGap ?? 'medium',
                cardGap: merged.cardGap ?? 'medium',
                levelIndicatorCardStyle: merged.levelIndicatorCardStyle ?? 'framed',
                levelBentoGridMode: merged.levelBentoGridMode ?? 'equal',
                levelIndicatorDisplayStyle: mergeLevelIndicatorDisplayStyle(
                  record ?? {},
                  design,
                  merged
                ),
                brandCardsContentAlignment: merged.brandCardsContentAlignment ?? 'left',
              }
          : {
            showUseCases: false,
            showCategory: false,
            showDescription: design === 'stack-tags' ? false : (merged.showDescription ?? false),
          }),
  };
}

function pickStackTagsSize(value: unknown, fallback: PortfolioStackTagsSize | undefined): PortfolioStackTagsSize {
  const allowed = ['compact', 'medium', 'large', 'xlarge'] as const;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
    return value as PortfolioStackTagsSize;
  }
  return resolveStackTagsSize(fallback);
}

function pickStackTitleSize(
  value: unknown,
  fallback: PortfolioStackTitleSize | undefined
): PortfolioStackTitleSize {
  const allowed = ['sm', 'md', 'lg', 'xl'] as const;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
    return value as PortfolioStackTitleSize;
  }
  return resolveStackTitleSize(fallback);
}

function pickStackSubtitleSize(
  value: unknown,
  fallback: PortfolioStackSubtitleSize | undefined
): PortfolioStackSubtitleSize {
  const allowed = ['sm', 'md', 'lg'] as const;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
    return value as PortfolioStackSubtitleSize;
  }
  return resolveStackSubtitleSize(fallback);
}

export {
  toolsHeaderFontClass as stackHeaderFontClass,
  toolsHeaderFontStyle as stackHeaderFontStyle,
  toolsTitleColorStyle as stackTitleColorStyle,
  toolsSubtitleColorStyle as stackSubtitleColorStyle,
};

export type { PortfolioSectionBackgroundSettings };
