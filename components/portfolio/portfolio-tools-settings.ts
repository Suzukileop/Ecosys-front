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
 * `brand-cards` — compact card grid.
 * `brand-directory` — editorial list rows.
 * `brand-showcase` — Framer Marketplace media-first panels.
 * `brand-tiles` — compact social-style grid (icon left, name right).
 */
export type PortfolioToolsDesign =
  | 'workflow-rail'
  | 'brand-cards'
  | 'brand-directory'
  | 'brand-showcase'
  | 'brand-tiles';

export type PortfolioToolsHeaderFont = 'sans' | 'serif' | 'display';
export type PortfolioToolsHeaderAlignment = 'left' | 'center' | 'right';
export type PortfolioToolsTitlePreset = 'workflow-tools' | 'tools' | 'stack' | 'custom';
export type PortfolioToolsTileSize = 'sm' | 'md' | 'lg';
/** Spacing between tool cards / items. `tight` = current default. */
export type PortfolioToolsCardGap = 'tight' | 'medium' | 'large' | 'xlarge';

export type PortfolioToolsPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioToolsDesign;
  titlePreset: PortfolioToolsTitlePreset;
  titleCustom: string;
  headerAlignment: PortfolioToolsHeaderAlignment;
  titleFont: PortfolioToolsHeaderFont;
  titleColor: string;
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
  showLabels: boolean;
  showDescription: boolean;
  showUseCases: boolean;
  showLevel: boolean;
  /** Opt-in grey pad behind logos. Off by default. */
  iconBackgroundEnabled: boolean;
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
      'Landbook / Framer-style cards — logo, name, description, use cases, and level.',
  },
  {
    value: 'brand-directory',
    label: 'Brand directory',
    description:
      'Webflow / Framer directory rows — logo left, details center, level right, hairline dividers.',
  },
  {
    value: 'brand-showcase',
    label: 'Brand showcase',
    description:
      'Horizontal panels — logo tile beside name, description, use cases, and level (no empty stage).',
  },
  {
    value: 'brand-tiles',
    label: 'Brand tiles',
    description:
      'Compact social grid — rounded icon left, bold name right, optional details below.',
  },
];

export const PORTFOLIO_TOOLS_TITLE_PRESET_OPTIONS = [
  { value: 'workflow-tools' as const, label: 'Workflow & Tools', description: 'Default title.' },
  { value: 'tools' as const, label: 'Tools', description: 'Short label.' },
  { value: 'stack' as const, label: 'Stack', description: 'Tech stack framing.' },
  { value: 'custom' as const, label: 'Custom', description: 'Your own title.' },
];

export const PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS: {
  value: PortfolioToolsTileSize;
  label: string;
}[] = [
  { value: 'sm', label: 'Compact' },
  { value: 'md', label: 'Standard' },
  { value: 'lg', label: 'Large' },
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

export const DEFAULT_TOOLS_TITLE = 'Workflow & Tools';

export const DEFAULT_TOOLS_PRESENTATION: PortfolioToolsPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'workflow-rail',
  titlePreset: 'workflow-tools',
  titleCustom: '',
  headerAlignment: 'left',
  titleFont: 'serif',
  titleColor: '#171717',
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
  showLabels: true,
  showDescription: true,
  showUseCases: true,
  showLevel: true,
  iconBackgroundEnabled: false,
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

export function toolsHeaderFontClass(
  font: PortfolioToolsHeaderFont | undefined,
  kind: 'title' | 'label'
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

export function toolsLabelColorStyle(color: string | undefined): CSSProperties {
  return { color: sanitizeHex(color, '#171717') };
}

export function toolsTileSizePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 64;
  if (size === 'lg') return 96;
  return 80;
}

export function toolsLogoSizePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 28;
  if (size === 'lg') return 44;
  return 36;
}

export function toolsBrandCardLogoTilePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 48;
  if (size === 'lg') return 64;
  return 56;
}

export function toolsBrandCardLogoPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 24;
  if (size === 'lg') return 32;
  return 28;
}

/** Large centered mark for Framer Marketplace–style showcase panels. */
export function toolsShowcaseLogoPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 40;
  if (size === 'lg') return 64;
  return 52;
}

/** Gap between brand-cards grid items. `tight` matches the previous default. */
export function toolsBrandCardsGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-6 sm:gap-7 lg:gap-8';
  if (gap === 'large') return 'gap-8 sm:gap-10 lg:gap-12';
  if (gap === 'xlarge') return 'gap-10 sm:gap-14 lg:gap-16';
  return 'gap-4 sm:gap-5 lg:gap-6';
}

export function toolsBrandTilesIconFramePx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 40;
  if (size === 'lg') return 56;
  return 48;
}

export function toolsBrandTilesLogoPx(size: PortfolioToolsTileSize | undefined): number {
  if (size === 'sm') return 22;
  if (size === 'lg') return 32;
  return 26;
}

/** Gap between brand-tiles grid items. */
export function toolsBrandTilesGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-4 sm:gap-5 lg:gap-6';
  if (gap === 'large') return 'gap-5 sm:gap-7 lg:gap-8';
  if (gap === 'xlarge') return 'gap-6 sm:gap-9 lg:gap-10';
  return 'gap-3 sm:gap-4 lg:gap-5';
}

/** Gap between brand-showcase panels. */
export function toolsBrandShowcaseGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-6 lg:gap-7';
  if (gap === 'large') return 'gap-8 lg:gap-10';
  if (gap === 'xlarge') return 'gap-10 lg:gap-14';
  return 'gap-4 lg:gap-5';
}

/** Gap for workflow-rail logo row. */
export function toolsWorkflowRailGapClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'gap-x-10 gap-y-10 sm:gap-x-8 md:gap-x-12';
  if (gap === 'large') return 'gap-x-14 gap-y-12 sm:gap-x-12 md:gap-x-16';
  if (gap === 'xlarge') return 'gap-x-16 gap-y-14 sm:gap-x-16 md:gap-x-20';
  return 'gap-x-8 gap-y-8 sm:gap-x-6 md:gap-x-8';
}

/** Vertical rhythm for brand-directory rows. */
export function toolsBrandDirectoryRowPadClass(gap: PortfolioToolsCardGap | undefined): string {
  if (gap === 'medium') return 'py-6 sm:py-7 md:py-8';
  if (gap === 'large') return 'py-8 sm:py-10 md:py-11';
  if (gap === 'xlarge') return 'py-10 sm:py-12 md:py-14';
  return 'py-5 sm:py-6 md:py-7';
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
  const next: PortfolioToolsPresentationSettings = {
    ...base,
    ...mergeSectionBackground(base, record),
    design: pick(
      record.design,
      ['workflow-rail', 'brand-cards', 'brand-directory', 'brand-showcase', 'brand-tiles'] as const,
      base.design
    ),
    titlePreset: pick(
      record.titlePreset,
      ['workflow-tools', 'tools', 'stack', 'custom'] as const,
      base.titlePreset
    ),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    headerAlignment: pick(record.headerAlignment, ['left', 'center', 'right'] as const, base.headerAlignment),
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'] as const, base.titleFont),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    tileBackgroundColor: sanitizeHex(record.tileBackgroundColor, base.tileBackgroundColor),
    labelColor: sanitizeHex(record.labelColor, base.labelColor),
    descriptionColor: sanitizeHex(record.descriptionColor, base.descriptionColor ?? '#737373'),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor ?? '#ffffff'),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor ?? '#e5e5e5'),
    chipBackgroundColor: sanitizeHex(record.chipBackgroundColor, base.chipBackgroundColor ?? '#f4f4f5'),
    chipTextColor: sanitizeHex(record.chipTextColor, base.chipTextColor ?? '#525252'),
    levelAccentColor: sanitizeHex(record.levelAccentColor, base.levelAccentColor ?? '#ea580c'),
    tileSize: pick(record.tileSize, ['sm', 'md', 'lg'] as const, base.tileSize),
    cardGap: pick(
      record.cardGap,
      ['tight', 'medium', 'large', 'xlarge'] as const,
      base.cardGap ?? 'tight'
    ),
    showLabels: typeof record.showLabels === 'boolean' ? record.showLabels : base.showLabels,
    showDescription:
      typeof record.showDescription === 'boolean'
        ? record.showDescription
        : (base.showDescription ?? true),
    showUseCases:
      typeof record.showUseCases === 'boolean' ? record.showUseCases : (base.showUseCases ?? true),
    showLevel: typeof record.showLevel === 'boolean' ? record.showLevel : (base.showLevel ?? true),
    iconBackgroundEnabled:
      typeof record.iconBackgroundEnabled === 'boolean'
        ? record.iconBackgroundEnabled
        : (base.iconBackgroundEnabled ?? false),
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

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}
