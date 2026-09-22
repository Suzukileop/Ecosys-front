import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { mergeUseHeroPalette } from '@/components/portfolio/portfolio-section-palette';
import { mergeSectionColorMode } from '@/components/portfolio/portfolio-section-color-mode';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
} from '@/components/portfolio/portfolio-section-background-settings';
import {
  applyToolsPaletteToSettings,
  DEFAULT_TOOLS_COLOR_BINDINGS,
  DEFAULT_TOOLS_PALETTE,
  mergeToolsColorBindings,
  mergeToolsPalette,
} from '@/components/portfolio/portfolio-tools-palette-settings';
import {
  mergeLevelIndicatorDisplayStyle,
  type PortfolioToolsBrandGridColumnsPerRow,
  type PortfolioToolsContentAlignment,
  type PortfolioToolsDesign,
  type PortfolioToolsLevelIndicatorDisplayStyle,
} from '@/components/portfolio/portfolio-tools-settings';
import type {
  PortfolioStackAsideTitlePlacement,
  PortfolioStackDesign,
  PortfolioStackPresentationSettings,
  PortfolioStackSectionLayout,
  PortfolioStackSubtitleSize,
  PortfolioStackTagsSize,
  PortfolioStackTitlePreset,
  PortfolioStackTitlePresetLegacy,
  PortfolioStackTitleSize,
} from '@/components/portfolio/portfolio-stack-presentation';
import {
  STACK_HEADER_ACCENT_COUNT_ALIGNMENTS,
  STACK_HEADER_BILLBOARD_WORD_STYLES,
  STACK_HEADER_DESIGNS,
  STACK_HEADER_MARGIN_BOTTOM_STEPS,
  STACK_HEADER_PALETTE_TOKENS,
  STACK_HEADER_TITLE_SIZES,
  STACK_HEADER_TITLE_WEIGHTS,
} from '@/components/portfolio/portfolio-stack-header-settings';

/** Mirrors {@link PortfolioSectionCopy} without importing portfolio-settings-types (avoids circular deps). */
type PortfolioStackSectionCopy = {
  enabled: boolean;
  title: string;
  subtitle: string;
};

export type PortfolioStackSectionSettings = PortfolioStackSectionCopy &
  PortfolioStackPresentationSettings;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidProfileHexColor(value) ? value.trim() : fallback;
}

export function parseBrandGridColumnsPerRow(
  raw: unknown,
  fallback: PortfolioToolsBrandGridColumnsPerRow
): PortfolioToolsBrandGridColumnsPerRow {
  if (raw === 4 || raw === '4') return 4;
  if (raw === 3 || raw === '3') return 3;
  if (raw === 2 || raw === '2') return 2;
  if (raw === 1 || raw === '1') return 1;
  return fallback;
}

function legacySharedBrandColumns(
  record: Record<string, unknown>
): PortfolioToolsBrandGridColumnsPerRow | undefined {
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

function pickStackDesign(value: unknown, fallback: PortfolioStackDesign): PortfolioStackDesign {
  const allowed = [
    'workflow-rail',
    'stack-tags',
    'brand-cards',
    'brand-index',
    'brand-row',
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
  if (value === 'brand-directory' || value === 'brand-float' || value === 'level-stat-bars') {
    return safeFallback;
  }
  return pick(value, allowed, safeFallback);
}

function isPortfolioStackSectionLayout(value: unknown): value is PortfolioStackSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

function isPortfolioStackAsideTitlePlacement(
  value: unknown
): value is PortfolioStackAsideTitlePlacement {
  return value === 'top' || value === 'center';
}

function resolveStackAsideTitlePlacement(
  placement: PortfolioStackAsideTitlePlacement | undefined
): PortfolioStackAsideTitlePlacement {
  return placement === 'top' ? 'top' : 'center';
}

function resolveStackTagsSize(size: PortfolioStackTagsSize | undefined): PortfolioStackTagsSize {
  return size ?? 'medium';
}

function resolveStackTitleSize(size: PortfolioStackTitleSize | undefined): PortfolioStackTitleSize {
  return size ?? 'md';
}

function resolveStackSubtitleSize(
  size: PortfolioStackSubtitleSize | undefined
): PortfolioStackSubtitleSize {
  return size ?? 'md';
}

function pickStackTagsSize(
  value: unknown,
  fallback: PortfolioStackTagsSize | undefined
): PortfolioStackTagsSize {
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

function isStackLevelIndicatorDesign(design: PortfolioStackDesign): boolean {
  return (
    design === 'level-progress-rows' ||
    design === 'level-category-rows' ||
    design === 'level-table-rows' ||
    design === 'level-circular-cards' ||
    design === 'level-star-cards' ||
    design === 'level-svg-rings' ||
    design === 'level-bento-categories'
  );
}

export function resolveStackShowLevel(
  settings: Pick<PortfolioStackPresentationSettings, 'design' | 'showLevel' | 'showLevelOptIn'>
): boolean {
  if (settings.showLevelOptIn === true) return true;
  if (settings.showLevelOptIn === false) return false;
  if (isStackLevelIndicatorDesign(settings.design)) {
    return settings.showLevel !== false;
  }
  return false;
}

/** Stack icon background — no brand-float default-on behavior. */
export function resolveStackIconBackgroundEnabled(
  settings: Pick<
    PortfolioStackPresentationSettings,
    'iconBackgroundEnabled' | 'iconBackgroundOptIn'
  >
): boolean {
  if (settings.iconBackgroundOptIn === true) {
    return settings.iconBackgroundEnabled !== false;
  }
  if (settings.iconBackgroundOptIn === false) {
    return false;
  }
  return settings.iconBackgroundEnabled === true;
}

function mergeStackLevelIndicatorDisplayStyle(
  record: Record<string, unknown>,
  design: PortfolioStackDesign,
  base: Pick<PortfolioStackPresentationSettings, 'levelIndicatorDisplayStyle'>
): PortfolioToolsLevelIndicatorDisplayStyle {
  return mergeLevelIndicatorDisplayStyle(
    record,
    design as PortfolioToolsDesign,
    base
  );
}

function pickStackTitlePreset(
  value: unknown,
  fallback: PortfolioStackTitlePresetLegacy
): PortfolioStackTitlePresetLegacy {
  return pick(
    value,
    ['core-stack', 'tech-stack', 'custom', 'stack', 'tools', 'workflow-tools'] as const,
    fallback
  );
}

export function pickStackPresentationFields(
  settings: PortfolioStackSectionSettings
): PortfolioStackPresentationSettings {
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

export function mergeStackPresentationBase(
  base: PortfolioStackPresentationSettings,
  patch: unknown
): PortfolioStackPresentationSettings {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { ...base };
  }
  const record = patch as Record<string, unknown>;
  const design = pickStackDesign(record.design, base.design);
  const showLevelOptIn =
    typeof record.showLevelOptIn === 'boolean' ? record.showLevelOptIn : base.showLevelOptIn;
  const showLevel = resolveStackShowLevel({
    design,
    showLevel:
      typeof record.showLevel === 'boolean' ? record.showLevel : (base.showLevel ?? false),
    showLevelOptIn,
  });
  const iconBackgroundOptIn =
    typeof record.iconBackgroundOptIn === 'boolean'
      ? record.iconBackgroundOptIn
      : base.iconBackgroundOptIn;
  const iconBackgroundEnabled = resolveStackIconBackgroundEnabled({
    iconBackgroundEnabled:
      typeof record.iconBackgroundEnabled === 'boolean'
        ? record.iconBackgroundEnabled
        : (base.iconBackgroundEnabled ?? false),
    iconBackgroundOptIn,
  });
  const rawSectionLayout = record.sectionLayout ?? base.sectionLayout;
  const sectionLayout: PortfolioStackSectionLayout = isPortfolioStackSectionLayout(
    rawSectionLayout
  )
    ? rawSectionLayout
    : 'stacked';

  const next: PortfolioStackPresentationSettings = {
    ...base,
    ...mergeSectionBackground(base, record),
    design,
    headerDesign: pick(record.headerDesign, STACK_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    headerAnimationEnabled:
      typeof record.headerAnimationEnabled === 'boolean'
        ? record.headerAnimationEnabled
        : (base.headerAnimationEnabled ?? true),
    headerDesignAlignment: pick(
      record.headerDesignAlignment,
      ['left', 'center', 'right'] as const,
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pick(
      record.headerMarginBottom,
      STACK_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pick(record.headerTitleSize, STACK_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'md'),
    headerTitleWeight: pick(
      record.headerTitleWeight,
      STACK_HEADER_TITLE_WEIGHTS,
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
      STACK_HEADER_PALETTE_TOKENS,
      base.headerAccentCountBadgeColor ?? 'principal'
    ),
    headerAccentCountLeadColor: pick(
      record.headerAccentCountLeadColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerAccentCountLeadColor ?? 'secondaire'
    ),
    headerAccentCountSize: pick(
      record.headerAccentCountSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerAccentCountSize ?? 'md'
    ),
    headerAccentCountWeight: pick(
      record.headerAccentCountWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerAccentCountWeight ?? 'regular'
    ),
    headerAccentCountAlignment: pick(
      record.headerAccentCountAlignment,
      STACK_HEADER_ACCENT_COUNT_ALIGNMENTS,
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
    headerSerifLeadLabelColor: pick(
      record.headerSerifLeadLabelColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pick(
      record.headerSerifLeadTitleColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pick(
      record.headerSerifLeadSubtitleColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pick(
      record.headerSerifLeadLabelSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pick(
      record.headerSerifLeadTitleSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pick(
      record.headerSerifLeadSubtitleSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pick(
      record.headerSerifLeadLabelWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pick(
      record.headerSerifLeadTitleWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pick(
      record.headerSerifLeadSubtitleWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadSubtitleWeight ?? 'regular'
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
      STACK_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pick(
      record.headerBillboardWordColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
    ),
    headerBillboardTitleColor: pick(
      record.headerBillboardTitleColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerBillboardTitleColor ?? 'principal'
    ),
    headerBillboardMetaColor: pick(
      record.headerBillboardMetaColor,
      STACK_HEADER_PALETTE_TOKENS,
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
      STACK_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingTitleColor ?? 'principal'
    ),
    headerSplitHeadingLabelColor: pick(
      record.headerSplitHeadingLabelColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingLabelColor ?? 'secondaire'
    ),
    headerSplitHeadingTitleSize: pick(
      record.headerSplitHeadingTitleSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerSplitHeadingTitleSize ?? 'md'
    ),
    headerSplitHeadingTitleWeight: pick(
      record.headerSplitHeadingTitleWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingTitleWeight ?? 'regular'
    ),
    headerSplitHeadingLabelSize: pick(
      record.headerSplitHeadingLabelSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerSplitHeadingLabelSize ?? 'md'
    ),
    headerSplitHeadingLabelWeight: pick(
      record.headerSplitHeadingLabelWeight,
      STACK_HEADER_TITLE_WEIGHTS,
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
      STACK_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pick(
      record.headerMastheadHeadlineSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pick(
      record.headerMastheadHeadlineWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerMastheadHeadlineWeight ?? 'regular'
    ),
    headerIndexLabelText:
      typeof record.headerIndexLabelText === 'string'
        ? record.headerIndexLabelText
        : (base.headerIndexLabelText ?? ''),
    headerIndexTitleText:
      typeof record.headerIndexTitleText === 'string'
        ? record.headerIndexTitleText
        : (base.headerIndexTitleText ?? ''),
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
      STACK_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pick(
      record.headerIndexNumberColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pick(
      record.headerIndexTitleColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pick(
      record.headerIndexSubtitleColor,
      STACK_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pick(
      record.headerIndexLabelSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerIndexLabelSize ?? 'md'
    ),
    headerIndexLabelWeight: pick(
      record.headerIndexLabelWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pick(
      record.headerIndexTitleSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerIndexTitleSize ?? 'md'
    ),
    headerIndexTitleWeight: pick(
      record.headerIndexTitleWeight,
      STACK_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pick(
      record.headerIndexSubtitleSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pick(
      record.headerIndexSubtitleWeight,
      STACK_HEADER_TITLE_WEIGHTS,
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
      STACK_HEADER_PALETTE_TOKENS,
      base.headerMarqueeWordColor ?? 'principal'
    ),
    headerMarqueeSize: pick(
      record.headerMarqueeSize,
      STACK_HEADER_TITLE_SIZES,
      base.headerMarqueeSize ?? 'md'
    ),
    sectionLayout,
    asideTitleSticky:
      typeof record.asideTitleSticky === 'boolean'
        ? record.asideTitleSticky
        : base.asideTitleSticky !== false,
    asideTitlePlacement: isPortfolioStackAsideTitlePlacement(record.asideTitlePlacement)
      ? record.asideTitlePlacement
      : resolveStackAsideTitlePlacement(base.asideTitlePlacement),
    stackTagsSize: pickStackTagsSize(record.stackTagsSize, base.stackTagsSize),
    titleSize: pickStackTitleSize(record.titleSize, base.titleSize),
    subtitleSize: pickStackSubtitleSize(record.subtitleSize, base.subtitleSize),
    titlePreset: pickStackTitlePreset(
      record.titlePreset,
      base.titlePreset as PortfolioStackTitlePresetLegacy
    ) as PortfolioStackTitlePreset,
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pick(
      record.subtitlePreset,
      ['none', 'custom'] as const,
      base.subtitlePreset ?? 'none'
    ),
    subtitleCustom:
      typeof record.subtitleCustom === 'string'
        ? record.subtitleCustom
        : (base.subtitleCustom ?? ''),
    headerAlignment: pick(
      record.headerAlignment,
      ['left', 'center', 'right'] as const,
      base.headerAlignment
    ),
    contentAlignment: pick(
      record.contentAlignment,
      ['left', 'center', 'right'] as const,
      base.contentAlignment ?? 'center'
    ),
    titleFont: pick(record.titleFont, ['sans', 'serif', 'display'] as const, base.titleFont),
    subtitleFont: pick(
      record.subtitleFont,
      ['sans', 'serif', 'display'] as const,
      base.subtitleFont ?? 'sans'
    ),
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor ?? '#737373'),
    tileBackgroundColor: sanitizeHex(record.tileBackgroundColor, base.tileBackgroundColor),
    labelColor: sanitizeHex(record.labelColor, base.labelColor),
    descriptionColor: sanitizeHex(record.descriptionColor, base.descriptionColor ?? '#737373'),
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor ?? '#ffffff'),
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor ?? '#e5e5e5'),
    chipBackgroundColor: sanitizeHex(
      record.chipBackgroundColor,
      base.chipBackgroundColor ?? '#f4f4f5'
    ),
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
    brandCardsColumnsPerRow: parseBrandGridColumnsPerRow(
      record.brandCardsColumnsPerRow ??
        (record.design === 'brand-showcase' ? record.brandShowcaseColumnsPerRow : undefined),
      base.brandCardsColumnsPerRow ?? legacySharedBrandColumns(record) ?? 1
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
    levelIndicatorDisplayStyle: mergeStackLevelIndicatorDisplayStyle(record, design, base),
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
    showLabels: typeof record.showLabels === 'boolean' ? record.showLabels : base.showLabels,
    showDescription:
      typeof record.showDescription === 'boolean'
        ? record.showDescription
        : (base.showDescription ?? true),
    showUseCases:
      typeof record.showUseCases === 'boolean' ? record.showUseCases : (base.showUseCases ?? true),
    showCategory:
      typeof record.showCategory === 'boolean' ? record.showCategory : (base.showCategory ?? false),
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
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
  };

  if (next.useHeroPalette !== false) {
    Object.assign(next, applyToolsPaletteToSettings(next));
  }
  return next;
}

export { DEFAULT_SECTION_BACKGROUND };
