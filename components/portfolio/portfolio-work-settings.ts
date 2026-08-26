import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import {
  applyWorkPaletteToSettings,
  DEFAULT_WORK_COLOR_BINDINGS,
  DEFAULT_WORK_PALETTE,
  mergeWorkColorBindings,
  mergeWorkPalette,
  type PortfolioWorkColorBindings,
  type PortfolioWorkPalette,
} from '@/components/portfolio/portfolio-work-palette-settings';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import {
  createElementTextStyle,
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
  PortfolioWorkCtaIcon,
  PortfolioWorkCtaIconPosition,
} from '@/components/portfolio/portfolio-work-cta-icons';
export {
  PORTFOLIO_WORK_CTA_ICON_OPTIONS,
  PORTFOLIO_WORK_CTA_ICON_POSITION_OPTIONS,
  normalizePortfolioWorkCtaIcon,
} from '@/components/portfolio/portfolio-work-cta-icons';

export type PortfolioWorkTitlePreset = 'portfolio' | 'selected-work' | 'projects' | 'my-work' | 'custom';

export type PortfolioWorkSubtitlePreset = 'default' | 'short' | 'process' | 'minimal' | 'custom';

export type PortfolioWorkHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioWorkHeaderAlignment = 'left' | 'center';

/**
 * How the Portfolio title relates to the gallery body.
 * `stacked` — title above the projects (default).
 * `aside-left` / `aside-right` — title beside the gallery on large screens.
 */
export type PortfolioWorkSectionLayout = 'stacked' | 'aside-left' | 'aside-right';

/** Decorative SVG beside the Portfolio gallery (`none` hides it). */
export type PortfolioWorkIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';

export type PortfolioWorkIllustrationPlacement = 'left' | 'right';

export type PortfolioWorkContentPlacement = 'side' | 'side-reverse' | 'bottom' | 'top';

/** How info (title, desc, tools, CTA) is laid out when media is hidden. */
export type PortfolioWorkNoMediaInfoLayout = 'fill' | 'readable' | 'centered';

export type PortfolioWorkCardDesign =
  | 'editorial'
  | 'minimal'
  | 'compact'
  | 'stacked'
  | 'overlay'
  | 'framed';

export type PortfolioWorkCardBorder = 'none' | 'soft' | 'solid' | 'accent';

/** Soft lift around the card — independent of border (use for float without outline). */
export type PortfolioWorkCardShadow = 'none' | 'soft' | 'float' | 'deep';

export type PortfolioWorkGalleryLayout =
  | 'stack'
  | 'grid'
  | 'list'
  | 'overlay'
  | 'accordion'
  | 'carousel';

/** How many project cards per row (stack / grid / overlay). Mobile always collapses. */
export type PortfolioWorkItemsPerRow = 1 | 2 | 3 | 4;

/** Cap individual card width so they stay portrait / readable instead of stretching full column. */
export type PortfolioWorkCardMaxWidth = 'full' | 'xl' | 'lg' | 'md' | 'sm';

export type PortfolioWorkCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkCardPadding = 'none' | 'sm' | 'md' | 'lg';

export type PortfolioWorkCardGap = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkCardContentAlignment = 'left' | 'center' | 'right';

/** Vertical placement of the info block beside / under media. */
export type PortfolioWorkCardContentVerticalAlign = 'top' | 'center' | 'bottom';

/** Position of the card frame inside its column (independent from text inside). */
export type PortfolioWorkCardAlignment = PortfolioWorkCardContentAlignment;

/**
 * Free placement of overlay card elements on large screens (lg+).
 * Mobile / tablet keep the classic bottom stack for readability.
 */
export type PortfolioWorkOverlayLayoutMode = 'stack' | 'free';

export type PortfolioWorkOverlayElementId =
  | 'category'
  | 'title'
  | 'description'
  | 'tools'
  | 'cta';

export type PortfolioWorkOverlayCellPlacement =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type PortfolioWorkOverlayElementPlacements = Record<
  PortfolioWorkOverlayElementId,
  PortfolioWorkOverlayCellPlacement
>;

export type PortfolioWorkOverlayElementBand = 'on-media' | 'above' | 'below';

export type PortfolioWorkOverlayElementBands = Record<
  PortfolioWorkOverlayElementId,
  PortfolioWorkOverlayElementBand
>;

export const PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS: PortfolioWorkOverlayElementId[] = [
  'category',
  'title',
  'description',
  'tools',
  'cta',
];

export const PORTFOLIO_WORK_OVERLAY_LAYOUT_MODE_OPTIONS: {
  value: PortfolioWorkOverlayLayoutMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'stack',
    label: 'Pile basse',
    description: 'Texte empilé en bas de la carte (tous écrans).',
  },
  {
    value: 'free',
    label: 'Libre (grand écran)',
    description: 'Place chaque élément dans une cellule 3×3 — desktop seulement.',
  },
];

export const PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS: {
  value: PortfolioWorkOverlayCellPlacement;
  label: string;
  row: 'top' | 'center' | 'bottom';
  col: 'left' | 'center' | 'right';
}[] = [
  { value: 'top-left', label: 'Haut gauche', row: 'top', col: 'left' },
  { value: 'top-center', label: 'Haut centre', row: 'top', col: 'center' },
  { value: 'top-right', label: 'Haut droite', row: 'top', col: 'right' },
  { value: 'center-left', label: 'Milieu gauche', row: 'center', col: 'left' },
  { value: 'center', label: 'Centre', row: 'center', col: 'center' },
  { value: 'center-right', label: 'Milieu droite', row: 'center', col: 'right' },
  { value: 'bottom-left', label: 'Bas gauche', row: 'bottom', col: 'left' },
  { value: 'bottom-center', label: 'Bas centre', row: 'bottom', col: 'center' },
  { value: 'bottom-right', label: 'Bas droite', row: 'bottom', col: 'right' },
];

export const PORTFOLIO_WORK_OVERLAY_ELEMENT_OPTIONS: {
  value: PortfolioWorkOverlayElementId;
  label: string;
}[] = [
  { value: 'category', label: 'Catégorie' },
  { value: 'title', label: 'Titre' },
  { value: 'description', label: 'Description' },
  { value: 'tools', label: 'Outils' },
  { value: 'cta', label: 'Bouton CTA' },
];

export const DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS: PortfolioWorkOverlayElementPlacements = {
  category: 'top-left',
  title: 'bottom-left',
  description: 'center-left',
  tools: 'bottom-center',
  cta: 'bottom-right',
};

export const DEFAULT_WORK_OVERLAY_ELEMENT_BANDS: PortfolioWorkOverlayElementBands = {
  category: 'on-media',
  title: 'on-media',
  description: 'on-media',
  tools: 'on-media',
  cta: 'on-media',
};

const OVERLAY_CELL_X: Record<'left' | 'center' | 'right', number> = {
  left: 4,
  center: 50,
  right: 96,
};

const OVERLAY_CELL_Y: Record<'top' | 'center' | 'bottom', number> = {
  top: 4,
  center: 50,
  bottom: 96,
};

function overlayCellMeta(cell: PortfolioWorkOverlayCellPlacement) {
  return (
    PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS.find((option) => option.value === cell) ??
    PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS[6]
  );
}

export function sanitizeWorkOverlayCellPlacement(
  value: unknown,
  fallback: PortfolioWorkOverlayCellPlacement
): PortfolioWorkOverlayCellPlacement {
  if (
    value === 'top-left' ||
    value === 'top-center' ||
    value === 'top-right' ||
    value === 'center-left' ||
    value === 'center' ||
    value === 'center-right' ||
    value === 'bottom-left' ||
    value === 'bottom-center' ||
    value === 'bottom-right'
  ) {
    return value;
  }
  return fallback;
}

export function mergeWorkOverlayElementPlacements(
  base: PortfolioWorkOverlayElementPlacements,
  patch: unknown
): PortfolioWorkOverlayElementPlacements {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const id of PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS) {
    next[id] = sanitizeWorkOverlayCellPlacement(record[id], base[id]);
  }
  return next;
}

export function sanitizeWorkOverlayElementBand(
  value: unknown,
  fallback: PortfolioWorkOverlayElementBand
): PortfolioWorkOverlayElementBand {
  return value === 'on-media' || value === 'above' || value === 'below' ? value : fallback;
}

export function mergeWorkOverlayElementBands(
  base: PortfolioWorkOverlayElementBands,
  patch: unknown
): PortfolioWorkOverlayElementBands {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return { ...base };
  const record = patch as Record<string, unknown>;
  const next = { ...base };
  for (const id of PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS) {
    next[id] = sanitizeWorkOverlayElementBand(record[id], base[id]);
  }
  return next;
}

/** Absolute position inside the overlay card for a free-placement cell. */
export function workOverlayCellAbsoluteStyle(
  cell: PortfolioWorkOverlayCellPlacement
): CSSProperties {
  const meta = overlayCellMeta(cell);
  const left = OVERLAY_CELL_X[meta.col];
  const top = OVERLAY_CELL_Y[meta.row];
  const transform =
    meta.row === 'top'
      ? meta.col === 'left'
        ? 'translate(0%, 0%)'
        : meta.col === 'right'
          ? 'translate(-100%, 0%)'
          : 'translate(-50%, 0%)'
      : meta.row === 'bottom'
        ? meta.col === 'left'
          ? 'translate(0%, -100%)'
          : meta.col === 'right'
            ? 'translate(-100%, -100%)'
            : 'translate(-50%, -100%)'
        : meta.col === 'left'
          ? 'translate(0%, -50%)'
          : meta.col === 'right'
            ? 'translate(-100%, -50%)'
            : 'translate(-50%, -50%)';
  return {
    left: `${left}%`,
    top: `${top}%`,
    transform,
    textAlign: meta.col === 'left' ? 'left' : meta.col === 'right' ? 'right' : 'center',
  };
}

/** Vertical row of a free-placement cell — lets small screens keep the chosen band. */
export function workOverlayCellRow(
  cell: PortfolioWorkOverlayCellPlacement
): 'top' | 'center' | 'bottom' {
  return overlayCellMeta(cell).row;
}

/** Horizontal column of a free-placement cell — lets small screens keep the chosen side. */
export function workOverlayCellColumn(
  cell: PortfolioWorkOverlayCellPlacement
): 'left' | 'center' | 'right' {
  return overlayCellMeta(cell).col;
}

export function workOverlayCellAlignClass(cell: PortfolioWorkOverlayCellPlacement): string {
  const col = overlayCellMeta(cell).col;
  if (col === 'left') return 'items-start text-left';
  if (col === 'right') return 'items-end text-right';
  return 'items-center text-center';
}

export function workOverlayCellRowAlignClass(cell: PortfolioWorkOverlayCellPlacement): string {
  const col = overlayCellMeta(cell).col;
  if (col === 'left') return 'justify-start';
  if (col === 'right') return 'justify-end';
  return 'justify-center';
}

export type PortfolioWorkCtaAlignment = 'left' | 'center' | 'right';

export type PortfolioWorkToolsDisplay = 'icons' | 'list' | 'both' | 'stacked';
export type PortfolioWorkCtaDesign =
  | 'pill-dark'
  | 'pill-outline'
  | 'pill-accent'
  | 'text-arrow'
  | 'circle-icon';

export type PortfolioWorkCtaBorderWidth = 'none' | 'thin' | 'medium' | 'thick';

export type PortfolioWorkCtaBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/** How categories appear above the work gallery. */
export type PortfolioWorkCategoryDesign = 'pills' | 'underline' | 'tabs' | 'minimal';

/** Filter chips, grouped sections, both, or hidden. */
export type PortfolioWorkCategoryMode = 'off' | 'filter' | 'group' | 'filter-and-group';

/** Which per-card text element can be styled independently. */
export type PortfolioWorkStyleTarget =
  | 'cardTitle'
  | 'cardDescription'
  | 'toolsLabel'
  | 'toolsList'
  | 'categoryOnCard'
  | 'cta';

export type PortfolioWorkElementStyles = Record<PortfolioWorkStyleTarget, PortfolioElementTextStyle>;

export const WORK_STYLE_TARGET_IDS: PortfolioWorkStyleTarget[] = [
  'cardTitle',
  'cardDescription',
  'toolsLabel',
  'toolsList',
  'categoryOnCard',
  'cta',
];

export const DEFAULT_WORK_ELEMENT_STYLES: PortfolioWorkElementStyles = {
  cardTitle: createElementTextStyle({ color: '#0a0a0a', size: 'xl', bold: true }),
  cardDescription: createElementTextStyle({ color: '#737373', size: 'md' }),
  toolsLabel: createElementTextStyle({ color: '#a3a3a3', size: 'sm', bold: true, uppercase: true }),
  toolsList: createElementTextStyle({ color: '#404040', size: 'md', bold: true }),
  categoryOnCard: createElementTextStyle({ color: '#0a0a0a', size: 'sm', bold: true, uppercase: true }),
  cta: createElementTextStyle({ color: '#f4f3ef', size: 'md', bold: true, uppercase: true }),
};

export const PORTFOLIO_WORK_STYLE_TARGET_OPTIONS: {
  value: PortfolioWorkStyleTarget;
  label: string;
  description: string;
}[] = [
  { value: 'cardTitle', label: 'Project title', description: 'Title text on each project card.' },
  { value: 'cardDescription', label: 'Description', description: 'Body text under the title.' },
  { value: 'toolsLabel', label: 'Tools label', description: '“Tools to use” heading above the tool logos.' },
  { value: 'toolsList', label: 'Tools list', description: 'Text list of tool names.' },
  { value: 'categoryOnCard', label: 'Category on card', description: 'Category name shown above the title.' },
  { value: 'cta', label: 'CTA text', description: 'View project button text.' },
];

export function normalizeWorkElementStyles(raw: unknown): PortfolioWorkElementStyles {
  return normalizeElementStylesRecord(raw, DEFAULT_WORK_ELEMENT_STYLES, WORK_STYLE_TARGET_IDS);
}

export function patchWorkElementStyle(
  styles: PortfolioWorkElementStyles,
  target: PortfolioWorkStyleTarget,
  patch: Partial<PortfolioElementTextStyle>
): PortfolioWorkElementStyles {
  return patchElementStylesRecord(styles, target, patch, DEFAULT_WORK_ELEMENT_STYLES, WORK_STYLE_TARGET_IDS);
}

/** Per-element surface chrome (category, title, description, tools block). */
export type PortfolioWorkElementChromeId =
  | 'categoryOnCard'
  | 'cardTitle'
  | 'cardDescription'
  | 'tools';

/** Inner padding for per-element chrome — includes free `custom` px mode. */
export type PortfolioWorkElementChromePadding = PortfolioWorkCardPadding | 'custom';

export type PortfolioWorkElementChromeSettings = {
  enabled: boolean;
  backgroundEnabled: boolean;
  backgroundColor: string;
  border: PortfolioWorkCardBorder;
  borderColor: string;
  borderRadius: PortfolioWorkCardRadius;
  padding: PortfolioWorkElementChromePadding;
  /** Exact inner padding in px when padding is `custom` (also synced from presets). */
  paddingPx: number;
  /** Outer spacing around the element — not tied to content-frame vertical gap. */
  margin: PortfolioWorkCardPadding;
  /**
   * When true, chrome hugs content width (`w-fit`) instead of stretching full column.
   * For tools: background wraps icons only (label stays outside).
   */
  fitContent: boolean;
};

export type PortfolioWorkElementChromes = Record<
  PortfolioWorkElementChromeId,
  PortfolioWorkElementChromeSettings
>;

export const WORK_ELEMENT_CHROME_IDS: PortfolioWorkElementChromeId[] = [
  'categoryOnCard',
  'cardTitle',
  'cardDescription',
  'tools',
];

/** Preset → px map for element chrome inner padding (Compact / Standard / Confortable). */
export const WORK_ELEMENT_CHROME_PADDING_PRESET_PX: Record<PortfolioWorkCardPadding, number> = {
  none: 0,
  sm: 16,
  md: 24,
  lg: 36,
};

export const WORK_ELEMENT_CHROME_PADDING_PX_MIN = 0;
export const WORK_ELEMENT_CHROME_PADDING_PX_MAX = 64;

export function clampWorkElementChromePaddingPx(value: unknown, fallback = 16): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    WORK_ELEMENT_CHROME_PADDING_PX_MIN,
    Math.min(WORK_ELEMENT_CHROME_PADDING_PX_MAX, Math.round(n))
  );
}

export function resolveWorkElementChromePaddingPx(
  chrome: Pick<PortfolioWorkElementChromeSettings, 'padding' | 'paddingPx'>
): number {
  if (chrome.padding === 'custom') {
    return clampWorkElementChromePaddingPx(chrome.paddingPx, 16);
  }
  return WORK_ELEMENT_CHROME_PADDING_PRESET_PX[chrome.padding] ?? 16;
}

export const DEFAULT_WORK_ELEMENT_CHROME: PortfolioWorkElementChromeSettings = {
  enabled: false,
  backgroundEnabled: true,
  backgroundColor: '#fafafa',
  border: 'none',
  borderColor: '#e5e5e5',
  borderRadius: 'md',
  padding: 'sm',
  paddingPx: WORK_ELEMENT_CHROME_PADDING_PRESET_PX.sm,
  margin: 'none',
  fitContent: false,
};

export const DEFAULT_WORK_ELEMENT_CHROMES: PortfolioWorkElementChromes = {
  categoryOnCard: { ...DEFAULT_WORK_ELEMENT_CHROME },
  cardTitle: { ...DEFAULT_WORK_ELEMENT_CHROME },
  cardDescription: { ...DEFAULT_WORK_ELEMENT_CHROME },
  tools: { ...DEFAULT_WORK_ELEMENT_CHROME, fitContent: true },
};

export function mergeWorkElementChrome(
  base: PortfolioWorkElementChromeSettings,
  patch: unknown
): PortfolioWorkElementChromeSettings {
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
      record.padding === 'lg' ||
      record.padding === 'custom'
        ? record.padding
        : base.padding,
    paddingPx: clampWorkElementChromePaddingPx(
      record.paddingPx,
      record.padding === 'none' ||
        record.padding === 'sm' ||
        record.padding === 'md' ||
        record.padding === 'lg'
        ? WORK_ELEMENT_CHROME_PADDING_PRESET_PX[record.padding]
        : base.paddingPx
    ),
    margin:
      record.margin === 'none' ||
      record.margin === 'sm' ||
      record.margin === 'md' ||
      record.margin === 'lg'
        ? record.margin
        : base.margin,
    fitContent: typeof record.fitContent === 'boolean' ? record.fitContent : base.fitContent,
  };
}

export function mergeWorkElementChromes(
  base: PortfolioWorkElementChromes,
  patch: unknown
): PortfolioWorkElementChromes {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return {
      categoryOnCard: { ...base.categoryOnCard },
      cardTitle: { ...base.cardTitle },
      cardDescription: { ...base.cardDescription },
      tools: { ...base.tools },
    };
  }
  const record = patch as Record<string, unknown>;
  return {
    categoryOnCard: mergeWorkElementChrome(base.categoryOnCard, record.categoryOnCard),
    cardTitle: mergeWorkElementChrome(base.cardTitle, record.cardTitle),
    cardDescription: mergeWorkElementChrome(base.cardDescription, record.cardDescription),
    tools: mergeWorkElementChrome(base.tools, record.tools),
  };
}

export function patchWorkElementChrome(
  chromes: PortfolioWorkElementChromes,
  id: PortfolioWorkElementChromeId,
  patch: Partial<PortfolioWorkElementChromeSettings>
): PortfolioWorkElementChromes {
  return {
    ...chromes,
    [id]: mergeWorkElementChrome(chromes[id] ?? DEFAULT_WORK_ELEMENT_CHROME, {
      ...(chromes[id] ?? DEFAULT_WORK_ELEMENT_CHROME),
      ...patch,
    }),
  };
}

function workElementChromeMarginClass(margin: PortfolioWorkCardPadding): string {
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
export function workElementChromeClass(chrome: PortfolioWorkElementChromeSettings | undefined): string {
  if (!chrome?.enabled) return '';
  const parts = [
    chrome.fitContent ? 'w-fit max-w-full' : 'w-full min-w-0',
    workCardRadiusClass(chrome.borderRadius),
    // Custom padding is applied as inline px via workElementChromeStyle.
    chrome.padding === 'custom' ? '' : workCardPaddingClass(chrome.padding),
    workElementChromeMarginClass(chrome.margin),
  ];
  if (chrome.border !== 'none') {
    parts.push(workCardBorderWidthClass(chrome.border));
    if (chrome.border === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function workElementChromeStyle(
  chrome: PortfolioWorkElementChromeSettings | undefined,
  accentColor?: string
): CSSProperties | undefined {
  if (!chrome?.enabled) return undefined;
  const style: CSSProperties = {};
  if (chrome.backgroundEnabled) {
    style.backgroundColor = sanitizeHex(chrome.backgroundColor, DEFAULT_WORK_CARD_BACKGROUND_COLOR);
  }
  if (chrome.border === 'accent') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(accentColor, DEFAULT_WORK_CTA_COLOR);
  } else if (chrome.border !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(chrome.borderColor, DEFAULT_WORK_CARD_BORDER_COLOR);
  }
  if (chrome.padding === 'custom') {
    style.padding = `${resolveWorkElementChromePaddingPx(chrome)}px`;
  }
  return Object.keys(style).length > 0 ? style : undefined;
}

export type PortfolioWorkPresentationSettings = PortfolioSectionBackgroundSettings & {
  titlePreset: PortfolioWorkTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioWorkSubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioWorkHeaderFont;
  subtitleFont: PortfolioWorkHeaderFont;
  titleColor: string;
  subtitleColor: string;
  headerAlignment: PortfolioWorkHeaderAlignment;
  /**
   * `stacked` — title above the gallery (default).
   * `aside-left` / `aside-right` — title beside the gallery on large screens.
   */
  sectionLayout: PortfolioWorkSectionLayout;
  /** Decorative SVG beside the gallery (`none` hides it). */
  illustrationVariant: PortfolioWorkIllustrationVariant;
  /** Side of the gallery for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioWorkIllustrationPlacement;
  contentPlacement: PortfolioWorkContentPlacement;
  galleryLayout: PortfolioWorkGalleryLayout;
  /** Cards per row on large screens (stack / grid / overlay). */
  itemsPerRow: PortfolioWorkItemsPerRow;
  /** Max width of each project card (full = stretch to column). */
  cardMaxWidth: PortfolioWorkCardMaxWidth;
  cardDesign: PortfolioWorkCardDesign;
  cardBorder: PortfolioWorkCardBorder;
  cardBorderColor: string;
  /** Optional thin rule below Overlay immersif cards. */
  overlayBottomRuleEnabled: boolean;
  overlayBottomRuleColor: string;
  /** Keeps a manually picked rule color while palette sync is enabled. */
  overlayBottomRuleManual: boolean;
  /** Overlay immersive media darkening strength. 0 = none, 100 = strongest. */
  overlayMediaDarkness: number;
  /** Diffuse shadow / float halo around the card (no hard border). */
  cardShadow: PortfolioWorkCardShadow;
  /** 0–100 continuous strength of the float / shadow halo. */
  cardShadowIntensity: number;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioWorkCardRadius;
  cardPadding: PortfolioWorkCardPadding;
  cardGap: PortfolioWorkCardGap;
  /** Where the card frame sits in the column when width is capped. */
  cardAlignment: PortfolioWorkCardAlignment;
  /** Alignment of title / description / tools inside the card. */
  cardContentAlignment: PortfolioWorkCardContentAlignment;
  /** Vertical align of the info column (useful beside tall media). */
  cardContentVerticalAlign: PortfolioWorkCardContentVerticalAlign;
  /** Inner frame around title / description / tools / CTA (beside or below media). */
  contentFrameEnabled: boolean;
  contentFrameBorder: PortfolioWorkCardBorder;
  contentFrameBorderColor: string;
  contentFrameBackgroundEnabled: boolean;
  contentFrameBackgroundColor: string;
  /** Manual hex override — palette sync skipped until the token binding changes. */
  contentFrameBorderManual: boolean;
  contentFrameBackgroundManual: boolean;
  contentFrameBorderRadius: PortfolioWorkCardRadius;
  contentFramePadding: PortfolioWorkCardPadding;
  /** Vertical gap between info blocks inside the frame. */
  contentFrameGap: PortfolioWorkCardGap;
  /** Optional surface behind category / title / description / tools (padding, margin, border, fill). */
  elementChromes: PortfolioWorkElementChromes;
  /**
   * Overlay immersive only: classic bottom stack, or free 3×3 placement on lg+.
   * Below lg, free mode still uses the bottom stack.
   */
  overlayLayoutMode: PortfolioWorkOverlayLayoutMode;
  /** Per-element cell when overlayLayoutMode is `free` (desktop). */
  overlayElementPlacements: PortfolioWorkOverlayElementPlacements;
  /** Per-element vertical band; defaults to the legacy on-media rendering. */
  overlayElementBands: PortfolioWorkOverlayElementBands;
  ctaAlignment: PortfolioWorkCtaAlignment;
  mediaRatio: number;
  showMarketplaceLink: boolean;
  /** When false, project media / thumbnails are hidden on all gallery layouts. */
  showCardMedia: boolean;
  /**
   * Info placement when media is off:
   * - fill: full card width
   * - readable: constrained text column (max-width)
   * - centered: constrained + horizontally centered
   */
  noMediaInfoLayout: PortfolioWorkNoMediaInfoLayout;
  showCardTitle: boolean;
  showCardDescription: boolean;
  showCardTools: boolean;
  showCardToolIcons: boolean;
  showCardToolList: boolean;
  showToolsLabel: boolean;
  /** Custom "Tools to use" label text (empty = default English label). */
  toolsLabelText: string;
  toolsIconSize: PortfolioToolsIconSize;
  /**
   * Extra space above the tools block (px). Applied on every card design.
   * When toolsPinToBottom is on, this is the minimum top gap on large screens
   * after the block is pushed down; turn pin off to use only this fixed margin.
   */
  toolsMarginTopPx: number;
  /**
   * On large screens (stacked / equal-height cards), push tools to the bottom
   * so rows align across cards. Turn off to rely only on toolsMarginTopPx.
   */
  toolsPinToBottom: boolean;
  showCardCta: boolean;
  ctaDesign: PortfolioWorkCtaDesign;
  ctaLabel: string;
  /** Show the glyph beside the CTA label. */
  ctaShowIcon: boolean;
  /** Which glyph to render when the icon is on. */
  ctaIcon: PortfolioWorkCtaIcon;
  /** Place the glyph before or after the label. */
  ctaIconPosition: PortfolioWorkCtaIconPosition;
  ctaColor: string;
  /** CTA outline — bound to the same palette token as Hero `ctaBorder`. */
  ctaBorderColor: string;
  /** Border thickness on pill / circle CTA. */
  ctaBorderWidth: PortfolioWorkCtaBorderWidth;
  /** Corner radius on pill CTAs (circle icon shell stays round). */
  ctaBorderRadius: PortfolioWorkCtaBorderRadius;
  /** Hover fill — palette `ctaHoverBackground`. */
  ctaHoverBackgroundColor: string;
  /** Hover label / icon ink — palette `ctaHoverText`. */
  ctaHoverTextColor: string;
  /** Hover outline — palette `ctaHoverBorder`. */
  ctaHoverBorderColor: string;
  /** When false, CTA keeps resting colors on hover. */
  ctaHoverEnabled: boolean;
  /** Tool icon chip fill — bound to Hero `toolsIconBackground`. */
  toolsIconBackgroundColor: string;
  /** Tool icon chip outline — bound to Hero `toolsIconBorder`. */
  toolsIconBorderColor: string;
  toolsDisplay: PortfolioWorkToolsDisplay;
  maxToolsShown: number;
  /** Category (content `genre`) filter / grouping. */
  categoryMode: PortfolioWorkCategoryMode;
  categoryDesign: PortfolioWorkCategoryDesign;
  showCategoryOnCard: boolean;
  categoryAllLabel: string;
  categoryUncategorizedLabel: string;
  categoryActiveColor: string;
  categoryMutedColor: string;
  /** When true, section colors follow the semantic palette tokens. */
  useHeroPalette: boolean;
  /** Work-owned palette copy (same 8 tokens as Hero). */
  workPalette?: PortfolioWorkPalette;
  /** Which token each work color slot uses. */
  workColorBindings?: PortfolioWorkColorBindings;
  /** Per-element color, font, size, and weight for card text. */
  elementStyles: PortfolioWorkElementStyles;
};

export type PortfolioWorkSectionSettings = PortfolioSectionCopy & PortfolioWorkPresentationSettings;

export const DEFAULT_WORK_TITLE_COLOR = '#0a0a0a';
export const DEFAULT_WORK_SUBTITLE_COLOR = '#737373';
export const DEFAULT_WORK_CTA_COLOR = '#ea580c';
export const DEFAULT_WORK_CARD_BORDER_COLOR = '#e5e5e5';
export const DEFAULT_WORK_CARD_BACKGROUND_COLOR = '#fafafa';
export const DEFAULT_WORK_CATEGORY_ACTIVE_COLOR = '#0a0a0a';
export const DEFAULT_WORK_CATEGORY_MUTED_COLOR = '#737373';
export const DEFAULT_WORK_CATEGORY_ALL_LABEL = 'All';
export const DEFAULT_WORK_CATEGORY_UNCATEGORIZED_LABEL = 'Other';

export const DEFAULT_WORK_PRESENTATION: PortfolioWorkPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  titlePreset: 'portfolio',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  titleColor: DEFAULT_WORK_TITLE_COLOR,
  subtitleColor: DEFAULT_WORK_SUBTITLE_COLOR,
  headerAlignment: 'left',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  contentPlacement: 'side',
  galleryLayout: 'stack',
  itemsPerRow: 1,
  cardMaxWidth: 'full',
  cardDesign: 'editorial',
  cardBorder: 'none',
  cardBorderColor: DEFAULT_WORK_CARD_BORDER_COLOR,
  overlayBottomRuleEnabled: false,
  overlayBottomRuleColor: DEFAULT_WORK_CARD_BORDER_COLOR,
  overlayBottomRuleManual: false,
  overlayMediaDarkness: 100,
  cardShadow: 'float',
  cardShadowIntensity: 55,
  cardBackgroundEnabled: false,
  cardBackgroundColor: DEFAULT_WORK_CARD_BACKGROUND_COLOR,
  cardBorderRadius: 'lg',
  cardPadding: 'md',
  cardGap: 'lg',
  cardAlignment: 'left',
  cardContentAlignment: 'left',
  cardContentVerticalAlign: 'center',
  contentFrameEnabled: false,
  contentFrameBorder: 'soft',
  contentFrameBorderColor: DEFAULT_WORK_CARD_BORDER_COLOR,
  contentFrameBackgroundEnabled: true,
  contentFrameBackgroundColor: DEFAULT_WORK_CARD_BACKGROUND_COLOR,
  contentFrameBorderManual: false,
  contentFrameBackgroundManual: false,
  contentFrameBorderRadius: 'md',
  contentFramePadding: 'md',
  contentFrameGap: 'md',
  elementChromes: {
    categoryOnCard: { ...DEFAULT_WORK_ELEMENT_CHROME },
    cardTitle: { ...DEFAULT_WORK_ELEMENT_CHROME },
    cardDescription: { ...DEFAULT_WORK_ELEMENT_CHROME },
    tools: { ...DEFAULT_WORK_ELEMENT_CHROME, fitContent: true },
  },
  overlayLayoutMode: 'stack',
  overlayElementPlacements: { ...DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS },
  overlayElementBands: { ...DEFAULT_WORK_OVERLAY_ELEMENT_BANDS },
  ctaAlignment: 'left',
  mediaRatio: 53,
  showMarketplaceLink: true,
  showCardMedia: true,
  noMediaInfoLayout: 'fill',
  showCardTitle: true,
  showCardDescription: true,
  showCardTools: true,
  showCardToolIcons: true,
  showCardToolList: true,
  showToolsLabel: true,
  toolsLabelText: '',
  toolsIconSize: 'md',
  toolsMarginTopPx: 0,
  toolsPinToBottom: true,
  showCardCta: true,
  ctaDesign: 'circle-icon',
  ctaLabel: 'View project',
  ctaShowIcon: true,
  ctaIcon: 'arrow-up-right',
  ctaIconPosition: 'right',
  ctaColor: DEFAULT_WORK_CTA_COLOR,
  ctaBorderColor: DEFAULT_WORK_CARD_BORDER_COLOR,
  ctaBorderWidth: 'thin',
  ctaBorderRadius: 'full',
  ctaHoverBackgroundColor: DEFAULT_WORK_CTA_COLOR,
  ctaHoverTextColor: '#0b0b0d',
  ctaHoverBorderColor: DEFAULT_WORK_CTA_COLOR,
  ctaHoverEnabled: true,
  toolsIconBackgroundColor: DEFAULT_WORK_CARD_BACKGROUND_COLOR,
  toolsIconBorderColor: DEFAULT_WORK_CARD_BORDER_COLOR,
  toolsDisplay: 'both',
  maxToolsShown: 12,
  categoryMode: 'filter',
  categoryDesign: 'pills',
  showCategoryOnCard: true,
  categoryAllLabel: DEFAULT_WORK_CATEGORY_ALL_LABEL,
  categoryUncategorizedLabel: DEFAULT_WORK_CATEGORY_UNCATEGORIZED_LABEL,
  categoryActiveColor: DEFAULT_WORK_CATEGORY_ACTIVE_COLOR,
  categoryMutedColor: DEFAULT_WORK_CATEGORY_MUTED_COLOR,
  useHeroPalette: true,
  workPalette: { ...DEFAULT_WORK_PALETTE },
  workColorBindings: { ...DEFAULT_WORK_COLOR_BINDINGS },
  elementStyles: DEFAULT_WORK_ELEMENT_STYLES,
};

// Sync hex fields from the default palette without circular init (palette module owns tokens).
Object.assign(
  DEFAULT_WORK_PRESENTATION,
  applyWorkPaletteToSettings({
    workPalette: DEFAULT_WORK_PALETTE,
    workColorBindings: DEFAULT_WORK_COLOR_BINDINGS,
    elementStyles: DEFAULT_WORK_ELEMENT_STYLES,
    elementChromes: DEFAULT_WORK_ELEMENT_CHROMES,
  })
);

export const PORTFOLIO_WORK_TITLE_PRESET_OPTIONS: {
  value: PortfolioWorkTitlePreset;
  label: string;
  description: string;
  preview: string;
}[] = [
  { value: 'portfolio', label: 'Portfolio', description: 'Classic editorial label.', preview: 'PORTFOLIO' },
  { value: 'selected-work', label: 'Selected work', description: 'Curated projects tone.', preview: 'SELECTED WORK' },
  { value: 'projects', label: 'Projects', description: 'Short and direct.', preview: 'PROJECTS' },
  { value: 'my-work', label: 'My work', description: 'Personal and approachable.', preview: 'MY WORK' },
  { value: 'custom', label: 'Custom', description: 'Your own section title text.', preview: 'Custom' },
];

export const PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS: {
  value: PortfolioWorkSubtitlePreset;
  label: string;
  description: string;
}[] = [
  { value: 'default', label: 'Default', description: 'Uses the subtitle field below.' },
  {
    value: 'short',
    label: 'Short',
    description: 'A concise line about your featured projects.',
  },
  {
    value: 'process',
    label: 'Process focus',
    description: 'Highlights craft, tools, and how you work.',
  },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle entirely.' },
  { value: 'custom', label: 'Custom', description: 'Write your own subtitle.' },
];

export const PORTFOLIO_WORK_HEADER_FONT_OPTIONS: {
  value: PortfolioWorkHeaderFont;
  label: string;
  description: string;
}[] = [
  { value: 'sans', label: 'Modern sans', description: 'Bold geometric sans-serif.' },
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display — magazine feel.' },
  { value: 'display', label: 'Display caps', description: 'Uppercase poster style.' },
];

export const WORK_SECTION_LAYOUTS = ['stacked', 'aside-left', 'aside-right'] as const;
export const WORK_ILLUSTRATION_VARIANTS = [
  'none',
  'chat',
  'question',
  'docs',
  'support',
  'hex',
] as const;
export const WORK_ILLUSTRATION_PLACEMENTS = ['left', 'right'] as const;

export const PORTFOLIO_WORK_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioWorkSectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Empilé',
    description: 'Titre au-dessus, projets en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre à gauche, galerie à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Galerie à gauche, titre à droite (côte à côte).',
  },
];

export function isPortfolioWorkSectionLayout(value: unknown): value is PortfolioWorkSectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function workSectionLayoutIsAside(layout: PortfolioWorkSectionLayout | undefined): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

/** Two-column shell for title + gallery (large screens). */
export function workAsideLayoutClass(layout: PortfolioWorkSectionLayout): string {
  if (layout === 'aside-right') {
    return 'grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
  }
  return 'grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-x-12 xl:gap-x-16';
}

export const PORTFOLIO_WORK_ILLUSTRATION_OPTIONS: {
  value: PortfolioWorkIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de SVG décoratif à côté de la galerie.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point d’interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposés.' },
  { value: 'support', label: 'Support', description: 'Illustration support.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_WORK_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioWorkIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche de la galerie.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite de la galerie.' },
];

export function isPortfolioWorkIllustrationVariant(
  value: unknown
): value is PortfolioWorkIllustrationVariant {
  return (
    value === 'none' ||
    value === 'chat' ||
    value === 'question' ||
    value === 'docs' ||
    value === 'support' ||
    value === 'hex'
  );
}

export function isPortfolioWorkIllustrationPlacement(
  value: unknown
): value is PortfolioWorkIllustrationPlacement {
  return value === 'left' || value === 'right';
}

export const PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS: {
  value: PortfolioWorkGalleryLayout;
  label: string;
  description: string;
}[] = [
  { value: 'stack', label: 'Grille portfolio', description: 'Grandes cartes éditoriales — colonnes réglables, design libre.' },
  { value: 'grid', label: 'Grille compacte', description: 'Tuiles denses : média bas, texte serré — colonnes réglables.' },
  { value: 'carousel', label: 'Carrousel', description: 'Un projet à la fois — flèches gauche / droite pour naviguer.' },
  { value: 'list', label: 'Liste compacte', description: 'Lignes élevées : grande vignette, tools à droite, action encerclée.' },
  { value: 'overlay', label: 'Overlay immersif', description: 'Media plein avec texte superposé — colonnes réglables.' },
  { value: 'accordion', label: 'Accordéon', description: 'Lignes dépliables révélant les détails du projet.' },
];

export const PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS: {
  value: '1' | '2' | '3' | '4';
  label: string;
  description: string;
}[] = [
  { value: '1', label: '1 par ligne', description: 'Pleine largeur — idéal mobile et grands projets.' },
  { value: '2', label: '2 par ligne', description: '2 colonnes dès tablette (md).' },
  { value: '3', label: '3 par ligne', description: '2 dès sm, 3 dès xl — dense sur grand écran.' },
  { value: '4', label: '4 par ligne', description: 'Jusqu’à 4 sur très grand écran — très compact.' },
];

export const PORTFOLIO_WORK_CARD_MAX_WIDTH_OPTIONS: {
  value: PortfolioWorkCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'full', label: 'Pleine largeur', description: 'La carte remplit toute la colonne (comportement actuel).' },
  { value: 'xl', label: 'Large', description: 'Max ~42rem — encore confortable, moins étirée.' },
  { value: 'lg', label: 'Carte portrait', description: 'Max ~36rem — forme verticale type référence.' },
  { value: 'md', label: 'Moyenne', description: 'Max ~32rem — carte plus compacte.' },
  { value: 'sm', label: 'Compacte', description: 'Max ~28rem — tuile étroite.' },
];

export const PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS: {
  value: PortfolioWorkCategoryMode;
  label: string;
  description: string;
}[] = [
  { value: 'off', label: 'Off', description: 'No category filter or grouping.' },
  { value: 'filter', label: 'Filter', description: 'Chip bar to filter projects by category.' },
  { value: 'group', label: 'Group', description: 'Projects listed under category headings.' },
  {
    value: 'filter-and-group',
    label: 'Filter + group',
    description: 'Filter chips and section headings together.',
  },
];

export const PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS: {
  value: PortfolioWorkCategoryDesign;
  label: string;
  description: string;
}[] = [
  { value: 'pills', label: 'Pills', description: 'Rounded chips — clear and tap-friendly.' },
  { value: 'underline', label: 'Underline', description: 'Text links with an active underline.' },
  { value: 'tabs', label: 'Tabs', description: 'Segmented control in a soft tray.' },
  { value: 'minimal', label: 'Minimal', description: 'Plain text row, no chrome.' },
];

export const PORTFOLIO_WORK_CARD_RADIUS_OPTIONS: {
  value: PortfolioWorkCardRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Carré', description: 'Coins droits.' },
  { value: 'sm', label: 'Léger', description: 'Arrondi subtil.' },
  { value: 'md', label: 'Moyen', description: 'Arrondi équilibré.' },
  { value: 'lg', label: 'Large', description: 'Coins bien arrondis (défaut).' },
  { value: 'xl', label: 'Très large', description: 'Arrondi prononcé.' },
];

export const PORTFOLIO_WORK_CARD_PADDING_OPTIONS: {
  value: PortfolioWorkCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de marge intérieure.' },
  { value: 'sm', label: 'Compact', description: 'Marge intérieure réduite.' },
  { value: 'md', label: 'Standard', description: 'Marge intérieure équilibrée.' },
  { value: 'lg', label: 'Confortable', description: 'Marge intérieure généreuse.' },
];

export const PORTFOLIO_WORK_CARD_GAP_OPTIONS: {
  value: PortfolioWorkCardGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre les projets.' },
  { value: 'md', label: 'Moyen', description: 'Espacement modéré entre les projets.' },
  { value: 'lg', label: 'Large', description: 'Espacement généreux (défaut).' },
  { value: 'xl', label: 'Très large', description: 'Espacement maximal entre les projets.' },
];

export const PORTFOLIO_WORK_CONTENT_FRAME_GAP_OPTIONS: {
  value: PortfolioWorkCardGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Peu d’espace entre catégorie, titre, outils…' },
  { value: 'md', label: 'Moyen', description: 'Espacement modéré entre les blocs d’info.' },
  { value: 'lg', label: 'Large', description: 'Espacement généreux entre les blocs.' },
  { value: 'xl', label: 'Très large', description: 'Espacement maximal entre les blocs.' },
];

export const PORTFOLIO_WORK_CARD_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCardAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Place le cadre de la carte à gauche de la colonne.' },
  { value: 'center', label: 'Centre', description: 'Centre le cadre de la carte dans la colonne.' },
  { value: 'right', label: 'Droite', description: 'Place le cadre de la carte à droite de la colonne.' },
];

export const PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCardContentAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Titre, texte et outils à l’intérieur de la carte — gauche.' },
  { value: 'center', label: 'Centre', description: 'Éléments à l’intérieur de la carte — centrés.' },
  { value: 'right', label: 'Droite', description: 'Éléments à l’intérieur de la carte — droite.' },
];

export const PORTFOLIO_WORK_CARD_CONTENT_VERTICAL_ALIGN_OPTIONS: {
  value: PortfolioWorkCardContentVerticalAlign;
  label: string;
  description: string;
}[] = [
  {
    value: 'top',
    label: 'Haut',
    description: 'Infos collées en haut de la colonne (espace vide en bas).',
  },
  {
    value: 'center',
    label: 'Centre',
    description: 'Infos centrées verticalement face au média.',
  },
  {
    value: 'bottom',
    label: 'Bas',
    description: 'Infos collées en bas de la colonne.',
  },
];

export const PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCtaAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Bouton aligné à gauche.' },
  { value: 'center', label: 'Centre', description: 'Bouton centré.' },
  { value: 'right', label: 'Droite', description: 'Bouton aligné à droite.' },
];

export const PORTFOLIO_WORK_CARD_DESIGN_OPTIONS: {
  value: PortfolioWorkCardDesign;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'Rounded media, roomy typography — the default.' },
  { value: 'minimal', label: 'Minimal', description: 'Flat sharp media, mono CTA, thin content divider.' },
  { value: 'compact', label: 'Compact', description: 'Smaller preview and tighter content stack.' },
  { value: 'stacked', label: 'Stacked', description: 'Full-width media with content underneath.' },
  { value: 'overlay', label: 'Overlay', description: 'Text layered over media with a dark gradient.' },
  { value: 'framed', label: 'Framed', description: 'Denser spacing and shadow — borders are set in Cadre & espacement.' },
];

export const PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS: {
  value: PortfolioWorkContentPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'side',
    label: 'Média à gauche',
    description: 'Image à gauche, infos complémentaires à droite.',
  },
  {
    value: 'side-reverse',
    label: 'Média à droite',
    description: 'Infos à gauche, image à droite.',
  },
  {
    value: 'bottom',
    label: 'Média en haut',
    description: 'Image au-dessus, texte et CTA en dessous.',
  },
  {
    value: 'top',
    label: 'Média en bas',
    description: 'Texte et CTA au-dessus, image en dessous.',
  },
];

export const PORTFOLIO_WORK_NO_MEDIA_INFO_LAYOUT_OPTIONS: {
  value: PortfolioWorkNoMediaInfoLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'fill',
    label: 'Pleine largeur',
    description: 'Le texte et les infos occupent toute la largeur de la carte.',
  },
  {
    value: 'readable',
    label: 'Colonne lisible',
    description: 'Largeur limitée (comme à côté du média) pour une lecture confortable.',
  },
  {
    value: 'centered',
    label: 'Centré',
    description: 'Bloc d’infos centré avec largeur limitée.',
  },
];

/** Effective placement: when media is hidden, always stack content full-width. */
export function workEffectiveContentPlacement(
  presentation: Pick<PortfolioWorkPresentationSettings, 'showCardMedia' | 'contentPlacement'>
): PortfolioWorkContentPlacement {
  if (presentation.showCardMedia === false) return 'bottom';
  return presentation.contentPlacement;
}

/** Flex direction for list / accordion rows based on media placement. */
export function workListMediaFlexClass(
  placement: PortfolioWorkContentPlacement
): string {
  switch (placement) {
    case 'side-reverse':
      return 'flex-col gap-3.5 sm:flex-row-reverse sm:items-center sm:gap-5';
    case 'bottom':
      return 'flex-col gap-3.5';
    case 'top':
      return 'flex-col-reverse gap-3.5';
    default:
      return 'flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-5';
  }
}

/** Thumb sizing for list rows — full-bleed when stacked, square when beside. */
export function workListThumbClass(
  placement: PortfolioWorkContentPlacement,
  mediaRatio = 50
): string {
  if (placement === 'bottom' || placement === 'top') {
    return 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10';
  }
  const clamped = Math.min(70, Math.max(30, Math.round(mediaRatio)));
  // 30 → ~5.5rem, 50 → 7–8rem, 70 → ~10rem on sm+
  if (clamped <= 40) {
    return 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 sm:aspect-auto sm:h-24 sm:w-24 sm:rounded-xl lg:h-28 lg:w-28 dark:ring-white/10';
  }
  if (clamped >= 60) {
    return 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 sm:aspect-auto sm:h-36 sm:w-36 sm:rounded-2xl lg:h-40 lg:w-40 dark:ring-white/10';
  }
  return 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 sm:aspect-auto sm:h-28 sm:w-28 sm:rounded-2xl lg:h-32 lg:w-32 dark:ring-white/10';
}

export function workNoMediaInfoWidthClass(
  layout: PortfolioWorkNoMediaInfoLayout | undefined
): string {
  switch (layout) {
    case 'readable':
      return 'w-full max-w-xl';
    case 'centered':
      return 'w-full max-w-xl mx-auto';
    default:
      return 'w-full max-w-full';
  }
}

export const PORTFOLIO_WORK_CARD_BORDER_OPTIONS: {
  value: PortfolioWorkCardBorder;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Pas de bordure — les coins restent réglables ci-dessous.' },
  { value: 'soft', label: 'Fine', description: 'Contour léger autour du média ou de la carte.' },
  { value: 'solid', label: 'Pleine', description: 'Bordure marquée autour du média ou de la carte.' },
  { value: 'accent', label: 'Accent', description: 'Bordure teintée avec la couleur d’accent.' },
];

export const PORTFOLIO_WORK_CARD_SHADOW_OPTIONS: {
  value: PortfolioWorkCardShadow;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Carte à plat — pas de profondeur.' },
  { value: 'soft', label: 'Douce', description: 'Ombre légère pour un léger relief.' },
  {
    value: 'float',
    label: 'Flottante',
    description: 'Halo flou autour de la carte — effet de flotte sans bordure.',
  },
  { value: 'deep', label: 'Profonde', description: 'Ombre marquée pour un fort détachement du fond.' },
];

/** Default intensity when picking a shadow preset (slider can still fine-tune). */
export const PORTFOLIO_WORK_CARD_SHADOW_PRESET_INTENSITY: Record<PortfolioWorkCardShadow, number> = {
  none: 0,
  soft: 28,
  float: 55,
  deep: 82,
};

export function clampWorkCardShadowIntensity(value: unknown, fallback = 55): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export const PORTFOLIO_WORK_CTA_DESIGN_OPTIONS: {
  value: PortfolioWorkCtaDesign;
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
    description: 'Capsule accent vive — bordure fine + swap de couleurs au survol.',
  },
  {
    value: 'text-arrow',
    label: 'Text + arrow',
    description: 'Lien minimal — soulignement et couleurs au survol.',
  },
];

export const PORTFOLIO_WORK_CTA_BORDER_WIDTH_OPTIONS: {
  value: PortfolioWorkCtaBorderWidth;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Pas de contour sur le bouton.' },
  { value: 'thin', label: 'Fine', description: 'Contour léger (1px).' },
  { value: 'medium', label: 'Moyenne', description: 'Contour marqué (2px).' },
  { value: 'thick', label: 'Épaisse', description: 'Contour fort (3px).' },
];

export const PORTFOLIO_WORK_CTA_BORDER_RADIUS_OPTIONS: {
  value: PortfolioWorkCtaBorderRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Carré', description: 'Coins droits.' },
  { value: 'sm', label: 'Léger', description: 'Arrondi subtil.' },
  { value: 'md', label: 'Moyen', description: 'Arrondi équilibré.' },
  { value: 'lg', label: 'Large', description: 'Coins bien arrondis.' },
  { value: 'full', label: 'Pilule', description: 'Capsule complètement ronde (défaut).' },
];

export const PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS: {
  value: PortfolioWorkToolsDisplay;
  label: string;
  description: string;
}[] = [
  { value: 'both', label: 'Icons + list', description: 'Logos when available, plus text list.' },
  { value: 'icons', label: 'Icons only', description: 'Compact logo chips from your tool library.' },
  { value: 'stacked', label: 'Stacked icons', description: 'Overlapping circular logos in a compact stack.' },
  { value: 'list', label: 'List only', description: 'Text list without icon row.' },
];

const SUBTITLE_PRESET_COPY: Record<Exclude<PortfolioWorkSubtitlePreset, 'default' | 'custom' | 'minimal'>, string> = {
  short: 'A selection of recent projects and client work.',
  process: 'Process, tools, and outcomes behind each featured project.',
};

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function pickAllowlisted<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

function sanitizeMaxTools(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(24, Math.max(1, Math.round(value)));
}

export const WORK_TOOLS_MARGIN_TOP_PX_MIN = 0;
export const WORK_TOOLS_MARGIN_TOP_PX_MAX = 120;

export function clampWorkToolsMarginTopPx(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(
    WORK_TOOLS_MARGIN_TOP_PX_MIN,
    Math.min(WORK_TOOLS_MARGIN_TOP_PX_MAX, Math.round(n))
  );
}

/**
 * Tools block spacing classes.
 * Pin-to-bottom uses a sibling flex spacer (see EditorialWorkCard) — not mt-auto here —
 * so toolsMarginTopPx always applies as real margin-top.
 */
export function workToolsBlockClass(
  _presentation: Pick<PortfolioWorkPresentationSettings, 'toolsMarginTopPx' | 'toolsPinToBottom'>,
  _pinEligible: boolean,
  extraClass = ''
): string {
  return extraClass.trim();
}

/** Always apply toolsMarginTopPx as inline marginTop (works on every design / breakpoint). */
export function workToolsBlockStyle(
  presentation: Pick<PortfolioWorkPresentationSettings, 'toolsMarginTopPx' | 'toolsPinToBottom'>,
  _pinEligible: boolean,
  chromeStyle?: CSSProperties
): CSSProperties {
  const px = clampWorkToolsMarginTopPx(presentation.toolsMarginTopPx, 0);
  return {
    ...chromeStyle,
    ...(px > 0 ? { marginTop: px } : {}),
  };
}

/** Whether to render a flex grow spacer above tools (equal-height cards on lg+). */
export function workToolsPinSpacerEnabled(
  presentation: Pick<PortfolioWorkPresentationSettings, 'toolsPinToBottom'>,
  pinEligible: boolean
): boolean {
  return pinEligible && presentation.toolsPinToBottom !== false;
}

function sanitizeMediaRatio(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(70, Math.max(30, Math.round(value)));
}

export function resolveWorkSectionTitle(settings: Pick<PortfolioWorkSectionSettings, 'titlePreset' | 'titleCustom' | 'title'>): string {
  const raw = (() => {
    switch (settings.titlePreset) {
      case 'selected-work':
        return 'SELECTED WORK';
      case 'projects':
        return 'PROJECTS';
      case 'my-work':
        return 'MY WORK';
      case 'custom':
        return settings.titleCustom.trim() || settings.title.trim() || 'PORTFOLIO';
      case 'portfolio':
        return 'PORTFOLIO';
      default:
        return settings.title.trim() || 'PORTFOLIO';
    }
  })();
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveWorkSectionSubtitle(
  settings: Pick<PortfolioWorkSectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  switch (settings.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return SUBTITLE_PRESET_COPY.short;
    case 'process':
      return SUBTITLE_PRESET_COPY.process;
    case 'custom':
      return settings.subtitleCustom.trim() || settings.subtitle.trim();
    default:
      return settings.subtitle.trim();
  }
}

export function workHeaderFontClass(font: PortfolioWorkHeaderFont, kind: 'title' | 'subtitle'): string {
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
      return 'font-bold uppercase tracking-[0.12em]';
    default:
      return 'leading-relaxed';
  }
}

export function workHeaderFontStyle(_font: PortfolioWorkHeaderFont): CSSProperties | undefined {
  return undefined;
}

export function workTitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_WORK_TITLE_COLOR) };
}

export function workSubtitleColorStyle(color: string): CSSProperties {
  return { color: sanitizeHex(color, DEFAULT_WORK_SUBTITLE_COLOR) };
}

export function workCardIsStacked(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement
): boolean {
  return (
    placement === 'bottom' ||
    placement === 'top' ||
    design === 'stacked' ||
    design === 'overlay'
  );
}

export function workCardMediaFr(mediaRatio: number): number {
  const clamped = Math.min(70, Math.max(30, Math.round(mediaRatio)));
  return Number((clamped / (100 - clamped)).toFixed(3));
}

export function workCardShellClass(design: PortfolioWorkCardDesign, placement: PortfolioWorkContentPlacement): string {
  if (workCardIsStacked(design, placement)) {
    // Media sits flush with the info block — no empty band between them.
    // `top` = media below content (flex-col-reverse).
    return placement === 'top'
      ? 'group flex h-full flex-col-reverse gap-0'
      : 'group flex h-full flex-col gap-0';
  }
  const gapClass =
    design === 'compact'
      ? 'gap-5 lg:gap-8'
      : design === 'minimal'
        ? 'gap-6 lg:gap-10'
        : 'gap-8 lg:gap-12 xl:gap-16';
  return `group grid items-stretch ${gapClass} lg:[grid-template-columns:var(--pf-work-grid)]`;
}

export function workCardGridStyle(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement,
  mediaRatio: number
): CSSProperties | undefined {
  if (workCardIsStacked(design, placement)) return undefined;
  const fr = workCardMediaFr(mediaRatio);
  const cols =
    placement === 'side-reverse'
      ? `minmax(0,1fr) minmax(0,${fr}fr)`
      : `minmax(0,${fr}fr) minmax(0,1fr)`;
  return { ['--pf-work-grid' as string]: cols };
}

export function workCardMediaOrderClass(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement
): string {
  if (workCardIsStacked(design, placement)) return '';
  return placement === 'side-reverse' ? 'lg:order-2' : '';
}

export function workCardContentOrderClass(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement
): string {
  if (workCardIsStacked(design, placement)) return '';
  return placement === 'side-reverse' ? 'lg:order-1' : '';
}

export function workCardRadiusClass(radius: PortfolioWorkCardRadius): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xl';
    case 'md':
      return 'rounded-2xl';
    case 'xl':
      return 'rounded-[2.5rem]';
    default:
      return 'rounded-[1.85rem]';
  }
}

export function workCardPaddingClass(padding: PortfolioWorkCardPadding): string {
  switch (padding) {
    case 'none':
      return '';
    case 'sm':
      return 'p-4 sm:p-5';
    case 'lg':
      return 'p-7 sm:p-9 lg:p-11';
    default:
      return 'p-5 sm:p-6 lg:p-7';
  }
}

export function workCardGapClass(gap: PortfolioWorkCardGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-6 lg:gap-8';
    case 'md':
      return 'gap-10 lg:gap-12';
    case 'xl':
      return 'gap-20 lg:gap-28';
    default:
      return 'gap-14 lg:gap-20';
  }
}

export function workGallerySupportsItemsPerRow(layout: PortfolioWorkGalleryLayout): boolean {
  return layout === 'stack' || layout === 'grid' || layout === 'overlay';
}

/**
 * When the gallery disposition changes, keep stored cardDesign / placement in sync
 * so settings match what the public page actually renders.
 */
export function workGalleryLayoutSettingsPatch(
  galleryLayout: PortfolioWorkGalleryLayout
): Partial<PortfolioWorkPresentationSettings> {
  switch (galleryLayout) {
    case 'grid':
      return {
        galleryLayout,
        cardDesign: 'compact',
        // Keep user's Media placement; compact cards still honor top/bottom/side.
      };
    case 'overlay':
      return {
        galleryLayout,
        cardDesign: 'overlay',
        // Overlay chrome expects media as the canvas — default to media on top.
        contentPlacement: 'bottom',
        overlayLayoutMode: 'free',
        overlayElementPlacements: { ...DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS },
        overlayElementBands: { ...DEFAULT_WORK_OVERLAY_ELEMENT_BANDS },
      };
    case 'list':
    case 'accordion':
      return { galleryLayout };
    case 'carousel':
      return {
        galleryLayout,
        cardDesign: 'editorial',
        itemsPerRow: 1,
        cardAlignment: 'center',
      };
    case 'stack':
      return {
        galleryLayout,
        // Restore roomy portfolio cards when leaving compact / overlay locks.
        cardDesign: 'editorial',
      };
    default:
      return { galleryLayout };
  }
}

/** Soft list / accordion chrome when no explicit card frame is enabled. */
export function workListRowFallbackStyle(
  presentation: Pick<
    PortfolioWorkPresentationSettings,
    'cardBorderColor' | 'cardBackgroundColor' | 'cardBackgroundEnabled'
  >
): CSSProperties {
  return {
    borderColor: presentation.cardBorderColor,
    backgroundColor: presentation.cardBackgroundEnabled
      ? presentation.cardBackgroundColor
      : 'transparent',
  };
}

/**
 * Liste compacte — flat surface (no forced ambient shadow).
 * Border / shadow follow Frame settings only.
 */
export function workListCardSurfaceClass(
  p: Pick<
    PortfolioWorkPresentationSettings,
    'cardBorder' | 'cardBorderRadius' | 'cardPadding' | 'cardBackgroundEnabled' | 'cardShadow'
  >
): string {
  const parts = [
    workCardRadiusClass(p.cardBorderRadius),
    p.cardPadding !== 'none' ? workCardPaddingClass(p.cardPadding) : 'p-3.5 sm:p-4',
    'transition duration-300',
  ];
  if (p.cardBorder !== 'none') {
    parts.push(workCardBorderWidthClass(p.cardBorder));
  }
  if (p.cardShadow !== 'none') {
    parts.push('pf-work-card-lift');
  }
  return parts.filter(Boolean).join(' ');
}

export function workListCardSurfaceStyle(
  p: PortfolioWorkPresentationSettings
): CSSProperties {
  const style: CSSProperties = {
    ...workCardEdgeStyle(p),
    ...(p.cardShadow !== 'none' ? workCardLiftStyle(p) : {}),
  };

  if (p.cardBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(p.cardBackgroundColor, DEFAULT_WORK_CARD_BACKGROUND_COLOR);
  } else {
    // Plate vs page fond — dark/light via theme tokens (not light-only --pf-surface).
    style.backgroundColor = 'var(--pf-muted-surface, #18181b)';
  }

  return style;
}

export function resolveWorkItemsPerRow(
  layout: PortfolioWorkGalleryLayout,
  itemsPerRow: PortfolioWorkItemsPerRow | undefined
): PortfolioWorkItemsPerRow {
  if (!workGallerySupportsItemsPerRow(layout)) return 1;
  if (itemsPerRow === 1 || itemsPerRow === 2 || itemsPerRow === 3 || itemsPerRow === 4) {
    return itemsPerRow;
  }
  return layout === 'stack' ? 1 : 2;
}

/**
 * Responsive grid for work cards.
 * Mobile always stays 1 column; higher counts unlock only from tablet / desktop up.
 * Prefer wider breakpoints so cards keep readable content width.
 */
export function workItemsPerRowGridClass(
  itemsPerRow: PortfolioWorkItemsPerRow,
  cardGap: PortfolioWorkCardGap = 'lg'
): string {
  const gap = workCardGapClass(cardGap);
  switch (itemsPerRow) {
    case 2:
      return `grid grid-cols-1 ${gap} lg:grid-cols-2`;
    case 3:
      return `grid grid-cols-1 ${gap} md:grid-cols-2 xl:grid-cols-3`;
    case 4:
      return `grid grid-cols-1 ${gap} md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`;
    default:
      return `grid grid-cols-1 ${gap}`;
  }
}

export function workItemsPerRowResponsiveHint(itemsPerRow: PortfolioWorkItemsPerRow): string | null {
  switch (itemsPerRow) {
    case 2:
      return 'Sur mobile, les cartes restent sur 1 colonne. 2 colonnes à partir des grands écrans (lg).';
    case 3:
      return 'Sur mobile : 1 colonne. Tablette : 2. Grand écran (xl) : 3.';
    case 4:
      return '4 colonnes uniquement sur très grand écran (2xl). Sur laptop max 3 ; tablette 2 ; mobile 1.';
    default:
      return null;
  }
}

/** Caps card width so stacked media+info stays portrait instead of stretching full column. */
export function workCardMaxWidthClass(maxWidth: PortfolioWorkCardMaxWidth | undefined): string {
  switch (maxWidth) {
    case 'sm':
      return 'w-full max-w-md';
    case 'md':
      return 'w-full max-w-lg';
    case 'lg':
      return 'w-full max-w-xl';
    case 'xl':
      return 'w-full max-w-2xl';
    default:
      return 'w-full max-w-full';
  }
}

/** Align constrained cards inside their grid / flex cell — card frame only. */
export function workCardMaxWidthJustifyClass(
  maxWidth: PortfolioWorkCardMaxWidth | undefined,
  alignment: PortfolioWorkCardAlignment
): string {
  if (!maxWidth || maxWidth === 'full') return '';
  switch (alignment) {
    case 'center':
      return 'justify-items-center';
    case 'right':
      return 'justify-items-end';
    default:
      return 'justify-items-start';
  }
}

export function workCardMaxWidthFlexAlignClass(
  maxWidth: PortfolioWorkCardMaxWidth | undefined,
  alignment: PortfolioWorkCardAlignment
): string {
  if (!maxWidth || maxWidth === 'full') return '';
  switch (alignment) {
    case 'center':
      return 'items-center';
    case 'right':
      return 'items-end';
    default:
      return 'items-start';
  }
}

/** Align category filter bar with the card frame when categories are active. */
export function workCategoryBarAlignClass(alignment: PortfolioWorkCardAlignment): string {
  switch (alignment) {
    case 'center':
      return 'flex w-full justify-center';
    case 'right':
      return 'flex w-full justify-end';
    default:
      return 'flex w-full justify-start';
  }
}

export function workCardContentAlignClass(alignment: PortfolioWorkCardContentAlignment): {
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

export function workCardContentVerticalAlignClass(
  align: PortfolioWorkCardContentVerticalAlign | undefined
): string {
  switch (align) {
    case 'center':
      return 'justify-center';
    case 'bottom':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}

export function workCtaAlignClass(alignment: PortfolioWorkCtaAlignment): string {
  switch (alignment) {
    case 'center':
      return 'justify-center';
    case 'right':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}

function workCardBorderWidthClass(border: PortfolioWorkCardBorder): string {
  switch (border) {
    case 'soft':
      return 'border';
    case 'solid':
    case 'accent':
      return 'border-2';
    default:
      return '';
  }
}

/** Manual border + corner radius on the visible card surface (media or shell). */
export function workCardEdgeClass(
  p: Pick<PortfolioWorkPresentationSettings, 'cardBorder' | 'cardBorderRadius'>
): string {
  const parts = [workCardRadiusClass(p.cardBorderRadius)];
  if (p.cardBorder !== 'none') {
    parts.push(workCardBorderWidthClass(p.cardBorder));
    if (p.cardBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function workCardEdgeStyle(
  p: PortfolioWorkPresentationSettings
): CSSProperties | undefined {
  if (p.cardBorder === 'none') return undefined;

  const style: CSSProperties = { borderStyle: 'solid' };

  if (p.cardBorder === 'accent') {
    const accent = sanitizeHex(p.ctaColor, DEFAULT_WORK_CTA_COLOR);
    style.borderColor = accent;
    if (!p.cardBackgroundEnabled) {
      style.backgroundImage = `linear-gradient(180deg, ${accent}0a 0%, transparent 40%)`;
    }
  } else {
    style.borderColor = sanitizeHex(p.cardBorderColor, DEFAULT_WORK_CARD_BORDER_COLOR);
  }

  return style;
}

/**
 * Soft lift / float halo around the card — independent of border.
 * Prefer on an outer wrapper (not the same node as overflow-hidden) so the blur isn’t clipped.
 * Intensity (0–100) freely scales blur size + opacity via `--pf-card-lift`.
 * Dark vs light shadow recipe is applied in CSS (`.pf-work-card-lift`) so black-on-black
 * doesn’t swallow the effect in dark mode.
 */
export function workCardLiftStyle(
  p: Pick<PortfolioWorkPresentationSettings, 'cardShadow' | 'cardShadowIntensity'>
): CSSProperties | undefined {
  if (p.cardShadow === 'none') return undefined;
  const intensity = clampWorkCardShadowIntensity(
    p.cardShadowIntensity,
    PORTFOLIO_WORK_CARD_SHADOW_PRESET_INTENSITY[p.cardShadow] ?? 55
  );
  if (intensity <= 0) return undefined;

  return {
    ['--pf-card-lift' as string]: String(Number((intensity / 100).toFixed(3))),
  };
}

/** Radius + lift host class (actual shadow comes from CSS + `--pf-card-lift`). */
export function workCardLiftClass(
  p: Pick<
    PortfolioWorkPresentationSettings,
    'cardBorderRadius' | 'cardShadow' | 'cardShadowIntensity'
  >
): string {
  const intensity =
    p.cardShadow === 'none'
      ? 0
      : clampWorkCardShadowIntensity(
          p.cardShadowIntensity,
          PORTFOLIO_WORK_CARD_SHADOW_PRESET_INTENSITY[p.cardShadow] ?? 55
        );
  const parts = [workCardRadiusClass(p.cardBorderRadius)];
  if (intensity > 0) parts.push('pf-work-card-lift');
  return parts.filter(Boolean).join(' ');
}

/** Optional inner padding / background wrapper around the whole card. */
export function workCardFrameClass(p: PortfolioWorkPresentationSettings): string {
  const hasPadding = p.cardPadding !== 'none';
  const hasBackground = p.cardBackgroundEnabled;
  if (!hasPadding && !hasBackground) return '';

  const parts = [workCardRadiusClass(p.cardBorderRadius)];
  if (hasPadding) parts.push(workCardPaddingClass(p.cardPadding));
  return parts.filter(Boolean).join(' ');
}

export function workCardFrameStyle(
  p: PortfolioWorkPresentationSettings
): CSSProperties | undefined {
  if (!p.cardBackgroundEnabled) return undefined;
  return {
    backgroundColor: sanitizeHex(p.cardBackgroundColor, DEFAULT_WORK_CARD_BACKGROUND_COLOR),
  };
}

/** Vertical gap between info blocks inside the content frame. */
export function workContentFrameGapClass(gap: PortfolioWorkCardGap): string {
  switch (gap) {
    case 'sm':
      return 'gap-2';
    case 'lg':
      return 'gap-5';
    case 'xl':
      return 'gap-7';
    default:
      return 'gap-3.5';
  }
}

/** Inner frame around project info (title, description, tools, CTA). */
export function workContentFrameClass(
  p: Pick<
    PortfolioWorkPresentationSettings,
    'contentFrameEnabled' | 'contentFrameBorder' | 'contentFrameBorderRadius' | 'contentFramePadding'
  >
): string {
  if (!p.contentFrameEnabled) return '';

  const parts = [
    workCardRadiusClass(p.contentFrameBorderRadius),
    workCardPaddingClass(p.contentFramePadding),
  ];
  if (p.contentFrameBorder !== 'none') {
    parts.push(workCardBorderWidthClass(p.contentFrameBorder));
    if (p.contentFrameBorder === 'soft') parts.push('shadow-sm');
  }
  return parts.filter(Boolean).join(' ');
}

export function workContentFrameStyle(
  p: PortfolioWorkPresentationSettings
): CSSProperties | undefined {
  if (!p.contentFrameEnabled) return undefined;

  const style: CSSProperties = {};

  if (p.contentFrameBackgroundEnabled) {
    style.backgroundColor = sanitizeHex(
      p.contentFrameBackgroundColor,
      DEFAULT_WORK_CARD_BACKGROUND_COLOR
    );
  }

  if (p.contentFrameBorder === 'accent') {
    const accent = sanitizeHex(p.ctaColor, DEFAULT_WORK_CTA_COLOR);
    style.borderStyle = 'solid';
    style.borderColor = accent;
    if (!p.contentFrameBackgroundEnabled) {
      style.backgroundImage = `linear-gradient(180deg, ${accent}0a 0%, transparent 40%)`;
    }
  } else if (p.contentFrameBorder !== 'none') {
    style.borderStyle = 'solid';
    style.borderColor = sanitizeHex(p.contentFrameBorderColor, DEFAULT_WORK_CARD_BORDER_COLOR);
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

/** Card-design behavior only (shadow, hover) — border and radius come from manual edge settings. */
export function workCardMediaBehaviorClass(design: PortfolioWorkCardDesign): string {
  const base = 'relative block overflow-hidden transition duration-300';
  switch (design) {
    case 'minimal':
      return `${base} bg-neutral-50 dark:bg-neutral-900`;
    case 'compact':
      return `${base} bg-neutral-100 shadow-sm hover:shadow-md dark:bg-neutral-900`;
    case 'stacked':
      return `${base} bg-neutral-100 shadow-sm hover:shadow-lg dark:bg-neutral-900`;
    case 'overlay':
      return `${base} bg-neutral-900 shadow-md hover:-translate-y-0.5 hover:shadow-xl`;
    case 'framed':
      return `${base} bg-neutral-100 shadow-sm hover:shadow-md dark:bg-neutral-900`;
    default:
      return `${base} bg-neutral-100 shadow-sm hover:-translate-y-0.5 hover:shadow-lg dark:bg-neutral-900`;
  }
}

/** @deprecated Use workCardMediaBehaviorClass + workCardEdgeClass */
export function workCardMediaClass(design: PortfolioWorkCardDesign): string {
  return workCardMediaBehaviorClass(design);
}

export function workCardMediaAspectClass(
  design: PortfolioWorkCardDesign,
  placement?: PortfolioWorkContentPlacement,
  mediaRatio?: number
): string {
  if (
    placement !== undefined &&
    mediaRatio !== undefined &&
    workCardIsStacked(design, placement)
  ) {
    return '';
  }
  switch (design) {
    case 'compact':
      return 'aspect-[16/11]';
    case 'overlay':
      return 'aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]';
    case 'stacked':
      return 'aspect-[16/9]';
    default:
      return 'aspect-[16/10]';
  }
}

/** Maps mediaRatio (30–70) to aspect ratio for stacked layouts — lower = shorter, higher = taller. */
export function workCardMediaAspectStyle(
  design: PortfolioWorkCardDesign,
  placement: PortfolioWorkContentPlacement,
  mediaRatio: number
): CSSProperties | undefined {
  if (!workCardIsStacked(design, placement)) return undefined;
  const clamped = Math.min(70, Math.max(30, Math.round(mediaRatio)));
  // Compact stays flatter (tile feel); portfolio / overlay can go taller.
  const minAspect = design === 'overlay' ? 0.7 : design === 'compact' ? 1.2 : 0.85;
  const maxAspect = design === 'compact' ? 1.55 : design === 'overlay' ? 2.1 : 2.35;
  const aspect = maxAspect - ((clamped - 30) / 40) * (maxAspect - minAspect);
  return { aspectRatio: `${aspect}` };
}

/** One notch denser gap for compact gallery grids. */
export function workCompactGalleryGap(cardGap: PortfolioWorkCardGap): PortfolioWorkCardGap {
  switch (cardGap) {
    case 'xl':
      return 'lg';
    case 'lg':
      return 'md';
    case 'md':
      return 'sm';
    default:
      return 'sm';
  }
}

export function workCardTitleClass(design: PortfolioWorkCardDesign): string {
  switch (design) {
    case 'compact':
      return 'text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl';
    case 'minimal':
      return 'text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[1.75rem]';
    case 'overlay':
      return 'text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-3xl';
    default:
      return 'text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-3xl lg:text-[2rem]';
  }
}

function workHexToRgba(hex: string, alpha: number): string {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Mix hex toward black (positive amount) or white (negative). amount ∈ 0–1. */
function workShadeHex(hex: string, amount: number): string {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return hex;
  const mix = (channel: number) => {
    if (amount >= 0) return Math.round(channel * (1 - amount));
    return Math.round(channel + (255 - channel) * Math.abs(amount));
  };
  const r = mix(parseInt(full.slice(0, 2), 16));
  const g = mix(parseInt(full.slice(2, 4), 16));
  const b = mix(parseInt(full.slice(4, 6), 16));
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function workSameHex(a: string, b: string): boolean {
  return a.replace('#', '').toLowerCase() === b.replace('#', '').toLowerCase();
}

function workCtaBorderWidthClass(
  width: PortfolioWorkCtaBorderWidth | undefined,
  design: PortfolioWorkCtaDesign
): string {
  const resolved = width ?? 'thin';
  if (resolved === 'none') {
    return design === 'pill-outline' ? 'border border-transparent' : 'border-0';
  }
  switch (resolved) {
    case 'medium':
      return 'border-2';
    case 'thick':
      return 'border-[3px]';
    default:
      return 'border';
  }
}

type WorkCtaSurfacePresentation = Pick<
  PortfolioWorkPresentationSettings,
  | 'ctaColor'
  | 'ctaBorderColor'
  | 'ctaBorderWidth'
  | 'ctaHoverEnabled'
  | 'ctaHoverBackgroundColor'
  | 'ctaHoverTextColor'
  | 'ctaHoverBorderColor'
  | 'sectionBackgroundColor'
> & {
  /** Only the `cta` text style is read by the surface helpers below. */
  elementStyles?: { cta?: PortfolioElementTextStyle };
};

/**
 * Resting + hover colors as CSS vars (Navigation-style).
 * Filled pills: label ink = page background (`fond`) — not fixed white —
 * so light/dark modes stay consistent with the original contrast rule.
 */
export function workCtaSurfaceStyle(
  design: PortfolioWorkCtaDesign,
  presentation: WorkCtaSurfacePresentation
): CSSProperties {
  const accent = sanitizeHex(presentation.ctaColor, DEFAULT_WORK_CTA_COLOR);
  const border = sanitizeHex(presentation.ctaBorderColor, accent);
  const labelInk = sanitizeHex(presentation.elementStyles?.cta?.color ?? accent, accent);
  /** Page fill — dark in dark mode, light in light mode. */
  const pageFond = sanitizeHex(
    presentation.sectionBackgroundColor,
    workContrastingInk(accent)
  );
  const hoverEnabled = presentation.ctaHoverEnabled !== false;
  const hoverBgRaw = sanitizeHex(presentation.ctaHoverBackgroundColor, accent);
  const hoverTextRaw = sanitizeHex(presentation.ctaHoverTextColor, pageFond);
  const hoverBorderRaw = sanitizeHex(presentation.ctaHoverBorderColor, hoverBgRaw);

  let bg = 'transparent';
  let fg = labelInk;
  let brd = border;
  let hBg = hoverBgRaw;
  let hFg = hoverTextRaw;
  let hBrd = hoverBorderRaw;

  if (design === 'pill-accent' || design === 'pill-dark') {
    bg = accent;
    fg = pageFond;
    brd = presentation.ctaBorderWidth === 'none' ? accent : border;
    // Visible hover: shade accent if hover token equals resting fill.
    hBg = hoverEnabled
      ? workSameHex(hoverBgRaw, accent)
        ? workShadeHex(accent, 0.18)
        : hoverBgRaw
      : accent;
    hFg = hoverEnabled ? pageFond : pageFond;
    hBrd = hoverEnabled
      ? workSameHex(hoverBorderRaw, brd)
        ? workShadeHex(border === accent ? accent : border, 0.18)
        : hoverBorderRaw
      : brd;
  } else if (design === 'pill-outline') {
    bg = 'transparent';
    fg = labelInk;
    brd = border;
    hBg = hoverEnabled ? hoverBgRaw : 'transparent';
    // Filled on hover → page-fond ink (same rule as accent pills).
    hFg = hoverEnabled ? pageFond : labelInk;
    hBrd = hoverEnabled ? hoverBorderRaw : border;
  } else if (design === 'circle-icon') {
    bg = 'transparent';
    fg = labelInk;
    brd = 'transparent';
    hBg = 'transparent';
    // Label brightens to accent; icon shell handles its own fill hover.
    hFg = hoverEnabled ? accent : labelInk;
    hBrd = 'transparent';
  } else {
    // text-arrow
    bg = 'transparent';
    fg = labelInk;
    brd = 'transparent';
    hBg = 'transparent';
    hFg = hoverEnabled ? accent : labelInk;
    hBrd = 'transparent';
  }

  return {
    ['--work-cta-bg' as string]: bg,
    ['--work-cta-text' as string]: fg,
    ['--work-cta-border' as string]: brd,
    ['--work-cta-hover-bg' as string]: hBg,
    ['--work-cta-hover-text' as string]: hFg,
    ['--work-cta-hover-border' as string]: hBrd,
    ['--work-cta-hover-wash' as string]: workHexToRgba(hoverBgRaw, 0.16),
    ['--work-cta-accent' as string]: accent,
    ['--work-cta-page-fond' as string]: pageFond,
  };
}

function workCtaBorderRadiusClass(
  radius: PortfolioWorkCtaBorderRadius | undefined,
  design: PortfolioWorkCtaDesign
): string {
  // Circle icon shell stays round; text-arrow has no box.
  if (design === 'circle-icon' || design === 'text-arrow') return '';
  switch (radius ?? 'full') {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-lg';
    case 'md':
      return 'rounded-xl';
    case 'lg':
      return 'rounded-2xl';
    default:
      return 'rounded-full';
  }
}

export function workCtaClassName(
  design: PortfolioWorkCtaDesign,
  presentation?: Pick<
    PortfolioWorkPresentationSettings,
    'ctaBorderWidth' | 'ctaBorderRadius' | 'ctaHoverEnabled'
  >
): string {
  const borderW = workCtaBorderWidthClass(presentation?.ctaBorderWidth, design);
  const radius = workCtaBorderRadiusClass(presentation?.ctaBorderRadius, design);
  const hoverOn = presentation?.ctaHoverEnabled !== false;
  const hoverClasses = hoverOn
    ? 'hover:bg-[var(--work-cta-hover-bg)] hover:text-[var(--work-cta-hover-text)] hover:border-[color:var(--work-cta-hover-border)]'
    : '';
  const surface = `bg-[var(--work-cta-bg)] text-[var(--work-cta-text)] border-solid border-[color:var(--work-cta-border)] transition-colors duration-200 ${hoverClasses}`;
  const base = `group/cta inline-flex max-w-full min-w-0 flex-nowrap items-center gap-2.5 text-sm font-bold sm:text-base ${surface}`;

  switch (design) {
    case 'pill-dark':
      return `${base} ${borderW} ${radius} px-5 py-2.5 uppercase tracking-[0.1em] shadow-sm hover:shadow-md sm:px-6 sm:py-3`;
    case 'pill-outline':
      return `${base} ${borderW} ${radius} px-5 py-2.5 uppercase tracking-[0.1em] hover:shadow-sm sm:px-6 sm:py-3`;
    case 'pill-accent':
      return `${base} ${borderW} ${radius} px-5 py-2.5 uppercase tracking-[0.1em] shadow-sm hover:shadow-md hover:-translate-y-px sm:px-6 sm:py-3`;
    case 'text-arrow':
      return `${base} border-0 bg-transparent px-0 py-1 uppercase tracking-[0.12em] underline-offset-4 decoration-transparent hover:underline hover:decoration-current`;
    default:
      return `${base} border-0 bg-transparent uppercase tracking-[0.12em]`;
  }
}

/** Prefer palette color on dark overlay scrims; fall back to white when ink is too dark. */
export function workOverlayReadableColor(preferredHex: string, fallback = '#ffffff'): string {
  const hex = sanitizeHex(preferredHex, fallback);
  return workColorLuminance(hex) < 0.2 ? fallback : hex;
}

/**
 * Overlay ink that also accounts for the element's own chrome fill: a filled
 * pill needs contrast against that pill, not against the dark media scrim.
 */
export function workOverlayElementInk(
  preferredHex: string,
  chrome: Pick<
    PortfolioWorkElementChromeSettings,
    'enabled' | 'backgroundEnabled' | 'backgroundColor'
  > | undefined,
  fallback = '#ffffff'
): string {
  if (!chrome?.enabled || !chrome.backgroundEnabled) {
    return workOverlayReadableColor(preferredHex, fallback);
  }
  const background = sanitizeHex(chrome.backgroundColor, DEFAULT_WORK_CARD_BACKGROUND_COLOR);
  const ink = sanitizeHex(preferredHex, workContrastingInk(background));
  return workContrastRatio(ink, background) >= 2 ? ink : workContrastingInk(background);
}

/** WCAG-style contrast ratio between two hex colors. */
export function workContrastRatio(a: string, b: string): number {
  const first = workColorLuminance(a);
  const second = workColorLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Relative luminance 0–1 for work contrast helpers. */
export function workColorLuminance(hex: string): number {
  const raw = hex.trim().replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.5;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const toLin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/** Pick light or dark ink that stays readable on `backgroundHex`. */
export function workContrastingInk(
  backgroundHex: string,
  light = '#ffffff',
  dark = '#0a0a0a'
): string {
  return workColorLuminance(backgroundHex) > 0.55 ? dark : light;
}

/** @deprecated Prefer workCtaSurfaceStyle */
export function workCtaStyle(
  design: PortfolioWorkCtaDesign,
  presentation: WorkCtaSurfacePresentation
): CSSProperties | undefined {
  return workCtaSurfaceStyle(design, presentation);
}

export function workCtaIconShellClass(
  design: PortfolioWorkCtaDesign,
  presentation?: Pick<PortfolioWorkPresentationSettings, 'ctaBorderWidth' | 'ctaHoverEnabled'>
): string {
  if (design !== 'circle-icon') {
    return 'flex h-4 w-4 items-center justify-center transition-colors duration-200 group-hover/cta:text-[var(--work-cta-hover-text)]';
  }
  const borderW = workCtaBorderWidthClass(presentation?.ctaBorderWidth ?? 'thin', design);
  const hoverOn = presentation?.ctaHoverEnabled !== false;
  const hover = hoverOn
    ? 'group-hover/cta:bg-[var(--work-cta-hover-bg)] group-hover/cta:text-[var(--work-cta-page-fond)] group-hover/cta:border-[color:var(--work-cta-hover-border)] group-hover/cta:shadow-md group-hover/cta:scale-[1.03]'
    : '';
  return `flex h-10 w-10 items-center justify-center rounded-full ${borderW} border-solid border-[color:var(--work-cta-border)] bg-[var(--work-cta-icon-bg)] text-[var(--work-cta-accent)] transition-all duration-200 ${hover}`;
}

export function workCtaIconShellStyle(
  design: PortfolioWorkCtaDesign,
  presentation: WorkCtaSurfacePresentation
): CSSProperties | undefined {
  if (design !== 'circle-icon') return { color: 'inherit' };
  const accent = sanitizeHex(presentation.ctaColor, DEFAULT_WORK_CTA_COLOR);
  const border = sanitizeHex(presentation.ctaBorderColor, accent);
  const pageFond = sanitizeHex(
    presentation.sectionBackgroundColor,
    workContrastingInk(accent)
  );
  const hoverBgRaw = sanitizeHex(presentation.ctaHoverBackgroundColor, accent);
  const hoverBg = workSameHex(hoverBgRaw, accent) ? workShadeHex(accent, 0.12) : hoverBgRaw;
  const hoverBorder = sanitizeHex(presentation.ctaHoverBorderColor, hoverBg);
  return {
    ['--work-cta-accent' as string]: accent,
    ['--work-cta-border' as string]: border,
    ['--work-cta-icon-bg' as string]: workHexToRgba(accent, 0.14),
    ['--work-cta-hover-bg' as string]: hoverBg,
    ['--work-cta-hover-border' as string]: hoverBorder,
    ['--work-cta-page-fond' as string]: pageFond,
  };
}

/** Tool icon circle surface — follows Hero tools icon palette tokens. */
export function workToolIconShellStyle(
  presentation: Pick<
    PortfolioWorkPresentationSettings,
    'toolsIconBackgroundColor' | 'toolsIconBorderColor' | 'cardBorderColor' | 'cardBackgroundColor'
  >
): CSSProperties {
  return {
    borderColor: presentation.toolsIconBorderColor || presentation.cardBorderColor,
    backgroundColor: presentation.toolsIconBackgroundColor || presentation.cardBackgroundColor,
  };
}

export function pickWorkPresentationSettings(work: unknown): PortfolioWorkPresentationSettings {
  return mergeWorkPresentation(DEFAULT_WORK_PRESENTATION, work);
}

export function mergeWorkPresentation(
  base: PortfolioWorkPresentationSettings,
  patch: unknown
): PortfolioWorkPresentationSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const titlePreset = record.titlePreset;
  const subtitlePreset = record.subtitlePreset;
  const titleFont = record.titleFont;
  const subtitleFont = record.subtitleFont;
  const headerAlignment = record.headerAlignment;
  const contentPlacement = record.contentPlacement;
  const galleryLayout = record.galleryLayout;
  const cardDesign = record.cardDesign;
  const cardBorder = record.cardBorder;
  const cardBorderRadius = record.cardBorderRadius;
  const cardPadding = record.cardPadding;
  const cardGap = record.cardGap;
  const cardContentAlignment = record.cardContentAlignment;
  const ctaAlignment = record.ctaAlignment;
  const ctaDesign = record.ctaDesign;
  const toolsDisplay = record.toolsDisplay;
  const categoryMode = record.categoryMode;
  const categoryDesign = record.categoryDesign;
  const background = mergeSectionBackground(base, patch);

  const resolvedCardContentAlignment =
    cardContentAlignment === 'left' ||
    cardContentAlignment === 'center' ||
    cardContentAlignment === 'right'
      ? cardContentAlignment
      : base.cardContentAlignment;
  const resolvedCardContentVerticalAlign =
    record.cardContentVerticalAlign === 'top' ||
    record.cardContentVerticalAlign === 'center' ||
    record.cardContentVerticalAlign === 'bottom'
      ? record.cardContentVerticalAlign
      : base.cardContentVerticalAlign;
  const resolvedCardAlignment =
    record.cardAlignment === 'left' ||
    record.cardAlignment === 'center' ||
    record.cardAlignment === 'right'
      ? record.cardAlignment
      : base.cardAlignment;

  const resolvedCtaAlignment =
    ctaAlignment === 'left' || ctaAlignment === 'center' || ctaAlignment === 'right'
      ? ctaAlignment
      : record.ctaAlignment === undefined
        ? resolvedCardContentAlignment
        : base.ctaAlignment;

  const merged = {
    ...background,
    titlePreset:
      titlePreset === 'portfolio' ||
      titlePreset === 'selected-work' ||
      titlePreset === 'projects' ||
      titlePreset === 'my-work' ||
      titlePreset === 'custom'
        ? titlePreset
        : base.titlePreset,
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset:
      subtitlePreset === 'default' ||
      subtitlePreset === 'short' ||
      subtitlePreset === 'process' ||
      subtitlePreset === 'minimal' ||
      subtitlePreset === 'custom'
        ? subtitlePreset
        : base.subtitlePreset,
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont:
      titleFont === 'sans' || titleFont === 'serif' || titleFont === 'display' ? titleFont : base.titleFont,
    subtitleFont:
      subtitleFont === 'sans' || subtitleFont === 'serif' || subtitleFont === 'display'
        ? subtitleFont
        : base.subtitleFont,
    titleColor: sanitizeHex(record.titleColor, base.titleColor),
    subtitleColor: sanitizeHex(record.subtitleColor, base.subtitleColor),
    headerAlignment:
      headerAlignment === 'left' || headerAlignment === 'center' ? headerAlignment : base.headerAlignment,
    sectionLayout: pickAllowlisted(
      record.sectionLayout,
      WORK_SECTION_LAYOUTS,
      base.sectionLayout ?? 'stacked'
    ),
    illustrationVariant: pickAllowlisted(
      record.illustrationVariant,
      WORK_ILLUSTRATION_VARIANTS,
      base.illustrationVariant ?? 'none'
    ),
    illustrationPlacement: pickAllowlisted(
      record.illustrationPlacement,
      WORK_ILLUSTRATION_PLACEMENTS,
      base.illustrationPlacement ?? 'right'
    ),
    contentPlacement:
      contentPlacement === 'side' ||
      contentPlacement === 'side-reverse' ||
      contentPlacement === 'bottom' ||
      contentPlacement === 'top'
        ? contentPlacement
        : base.contentPlacement,
    cardDesign:
      cardDesign === 'editorial' ||
      cardDesign === 'minimal' ||
      cardDesign === 'compact' ||
      cardDesign === 'stacked' ||
      cardDesign === 'overlay' ||
      cardDesign === 'framed'
        ? cardDesign
        : base.cardDesign,
    galleryLayout:
      galleryLayout === 'stack' ||
      galleryLayout === 'grid' ||
      galleryLayout === 'list' ||
      galleryLayout === 'overlay' ||
      galleryLayout === 'accordion' ||
      galleryLayout === 'carousel'
        ? galleryLayout
        : base.galleryLayout,
    itemsPerRow: (() => {
      const resolvedLayout =
        galleryLayout === 'stack' ||
        galleryLayout === 'grid' ||
        galleryLayout === 'list' ||
        galleryLayout === 'overlay' ||
        galleryLayout === 'accordion' ||
        galleryLayout === 'carousel'
          ? galleryLayout
          : base.galleryLayout;
      if (!('itemsPerRow' in record)) {
        // Preserve legacy grid/overlay two-column behavior for older saves.
        if (resolvedLayout === 'grid' || resolvedLayout === 'overlay') return 2;
        return base.itemsPerRow;
      }
      const raw = record.itemsPerRow;
      if (raw === 1 || raw === 2 || raw === 3 || raw === 4) return raw;
      if (raw === '1' || raw === '2' || raw === '3' || raw === '4') {
        return Number(raw) as PortfolioWorkItemsPerRow;
      }
      return base.itemsPerRow;
    })(),
    cardMaxWidth:
      record.cardMaxWidth === 'full' ||
      record.cardMaxWidth === 'xl' ||
      record.cardMaxWidth === 'lg' ||
      record.cardMaxWidth === 'md' ||
      record.cardMaxWidth === 'sm'
        ? record.cardMaxWidth
        : base.cardMaxWidth,
    cardBorder:
      cardBorder === 'none' ||
      cardBorder === 'soft' ||
      cardBorder === 'solid' ||
      cardBorder === 'accent'
        ? cardBorder
        : base.cardBorder,
    cardBorderColor: sanitizeHex(record.cardBorderColor, base.cardBorderColor),
    overlayBottomRuleEnabled:
      typeof record.overlayBottomRuleEnabled === 'boolean'
        ? record.overlayBottomRuleEnabled
        : base.overlayBottomRuleEnabled,
    overlayBottomRuleColor: sanitizeHex(
      record.overlayBottomRuleColor,
      base.overlayBottomRuleColor
    ),
    overlayBottomRuleManual:
      typeof record.overlayBottomRuleManual === 'boolean'
        ? record.overlayBottomRuleManual
        : base.overlayBottomRuleManual,
    overlayMediaDarkness:
      typeof record.overlayMediaDarkness === 'number' && Number.isFinite(record.overlayMediaDarkness)
        ? Math.min(200, Math.max(0, Math.round(record.overlayMediaDarkness)))
        : (base.overlayMediaDarkness ?? 100),
    cardShadow:
      record.cardShadow === 'none' ||
      record.cardShadow === 'soft' ||
      record.cardShadow === 'float' ||
      record.cardShadow === 'deep'
        ? record.cardShadow
        : base.cardShadow,
    cardShadowIntensity: clampWorkCardShadowIntensity(
      record.cardShadowIntensity,
      record.cardShadow === 'none' ||
        record.cardShadow === 'soft' ||
        record.cardShadow === 'float' ||
        record.cardShadow === 'deep'
        ? PORTFOLIO_WORK_CARD_SHADOW_PRESET_INTENSITY[record.cardShadow]
        : base.cardShadowIntensity
    ),
    cardBackgroundEnabled:
      typeof record.cardBackgroundEnabled === 'boolean'
        ? record.cardBackgroundEnabled
        : base.cardBackgroundEnabled,
    cardBackgroundColor: sanitizeHex(record.cardBackgroundColor, base.cardBackgroundColor),
    cardBorderRadius:
      cardBorderRadius === 'none' ||
      cardBorderRadius === 'sm' ||
      cardBorderRadius === 'md' ||
      cardBorderRadius === 'lg' ||
      cardBorderRadius === 'xl'
        ? cardBorderRadius
        : base.cardBorderRadius,
    cardPadding:
      cardPadding === 'none' ||
      cardPadding === 'sm' ||
      cardPadding === 'md' ||
      cardPadding === 'lg'
        ? cardPadding
        : base.cardPadding,
    cardGap:
      cardGap === 'sm' || cardGap === 'md' || cardGap === 'lg' || cardGap === 'xl'
        ? cardGap
        : base.cardGap,
    cardAlignment: resolvedCardAlignment,
    cardContentAlignment: resolvedCardContentAlignment,
    cardContentVerticalAlign: resolvedCardContentVerticalAlign,
    contentFrameEnabled:
      typeof record.contentFrameEnabled === 'boolean'
        ? record.contentFrameEnabled
        : base.contentFrameEnabled,
    contentFrameBorder:
      record.contentFrameBorder === 'none' ||
      record.contentFrameBorder === 'soft' ||
      record.contentFrameBorder === 'solid' ||
      record.contentFrameBorder === 'accent'
        ? record.contentFrameBorder
        : base.contentFrameBorder,
    contentFrameBorderColor: sanitizeHex(record.contentFrameBorderColor, base.contentFrameBorderColor),
    contentFrameBackgroundEnabled:
      typeof record.contentFrameBackgroundEnabled === 'boolean'
        ? record.contentFrameBackgroundEnabled
        : base.contentFrameBackgroundEnabled,
    contentFrameBackgroundColor: sanitizeHex(
      record.contentFrameBackgroundColor,
      base.contentFrameBackgroundColor
    ),
    contentFrameBorderManual:
      typeof record.contentFrameBorderManual === 'boolean'
        ? record.contentFrameBorderManual
        : (base.contentFrameBorderManual ?? false),
    contentFrameBackgroundManual:
      typeof record.contentFrameBackgroundManual === 'boolean'
        ? record.contentFrameBackgroundManual
        : (base.contentFrameBackgroundManual ?? false),
    contentFrameBorderRadius:
      record.contentFrameBorderRadius === 'none' ||
      record.contentFrameBorderRadius === 'sm' ||
      record.contentFrameBorderRadius === 'md' ||
      record.contentFrameBorderRadius === 'lg' ||
      record.contentFrameBorderRadius === 'xl'
        ? record.contentFrameBorderRadius
        : base.contentFrameBorderRadius,
    contentFramePadding:
      record.contentFramePadding === 'none' ||
      record.contentFramePadding === 'sm' ||
      record.contentFramePadding === 'md' ||
      record.contentFramePadding === 'lg'
        ? record.contentFramePadding
        : base.contentFramePadding,
    contentFrameGap:
      record.contentFrameGap === 'sm' ||
      record.contentFrameGap === 'md' ||
      record.contentFrameGap === 'lg' ||
      record.contentFrameGap === 'xl'
        ? record.contentFrameGap
        : base.contentFrameGap,
    elementChromes: mergeWorkElementChromes(
      mergeWorkElementChromes(DEFAULT_WORK_ELEMENT_CHROMES, base.elementChromes),
      record.elementChromes
    ),
    overlayLayoutMode:
      record.overlayLayoutMode === 'stack' || record.overlayLayoutMode === 'free'
        ? record.overlayLayoutMode
        : base.overlayLayoutMode,
    overlayElementPlacements: mergeWorkOverlayElementPlacements(
      mergeWorkOverlayElementPlacements(
        DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS,
        base.overlayElementPlacements
      ),
      record.overlayElementPlacements
    ),
    overlayElementBands: mergeWorkOverlayElementBands(
      mergeWorkOverlayElementBands(
        DEFAULT_WORK_OVERLAY_ELEMENT_BANDS,
        base.overlayElementBands
      ),
      record.overlayElementBands
    ),
    ctaAlignment: resolvedCtaAlignment,
    mediaRatio: sanitizeMediaRatio(record.mediaRatio, base.mediaRatio),
    showMarketplaceLink:
      typeof record.showMarketplaceLink === 'boolean' ? record.showMarketplaceLink : base.showMarketplaceLink,
    showCardMedia: typeof record.showCardMedia === 'boolean' ? record.showCardMedia : base.showCardMedia,
    noMediaInfoLayout:
      record.noMediaInfoLayout === 'fill' ||
      record.noMediaInfoLayout === 'readable' ||
      record.noMediaInfoLayout === 'centered'
        ? record.noMediaInfoLayout
        : base.noMediaInfoLayout,
    showCardTitle: typeof record.showCardTitle === 'boolean' ? record.showCardTitle : base.showCardTitle,
    showCardDescription:
      typeof record.showCardDescription === 'boolean' ? record.showCardDescription : base.showCardDescription,
    showCardTools: typeof record.showCardTools === 'boolean' ? record.showCardTools : base.showCardTools,
    showCardToolIcons:
      typeof record.showCardToolIcons === 'boolean' ? record.showCardToolIcons : base.showCardToolIcons,
    showCardToolList:
      typeof record.showCardToolList === 'boolean' ? record.showCardToolList : base.showCardToolList,
    showToolsLabel: typeof record.showToolsLabel === 'boolean' ? record.showToolsLabel : base.showToolsLabel,
    toolsLabelText: typeof record.toolsLabelText === 'string' ? record.toolsLabelText : base.toolsLabelText,
    toolsIconSize:
      record.toolsIconSize === 'sm' ||
      record.toolsIconSize === 'md' ||
      record.toolsIconSize === 'lg' ||
      record.toolsIconSize === 'xl'
        ? record.toolsIconSize
        : base.toolsIconSize,
    toolsMarginTopPx: clampWorkToolsMarginTopPx(record.toolsMarginTopPx, base.toolsMarginTopPx),
    toolsPinToBottom:
      typeof record.toolsPinToBottom === 'boolean' ? record.toolsPinToBottom : base.toolsPinToBottom,
    showCardCta: typeof record.showCardCta === 'boolean' ? record.showCardCta : base.showCardCta,
    ctaDesign:
      ctaDesign === 'pill-dark' ||
      ctaDesign === 'pill-outline' ||
      ctaDesign === 'pill-accent' ||
      ctaDesign === 'text-arrow' ||
      ctaDesign === 'circle-icon'
        ? ctaDesign
        : base.ctaDesign,
    ctaLabel: typeof record.ctaLabel === 'string' && record.ctaLabel.trim() ? record.ctaLabel.trim() : base.ctaLabel,
    ctaShowIcon: typeof record.ctaShowIcon === 'boolean' ? record.ctaShowIcon : base.ctaShowIcon,
    ctaIcon: normalizePortfolioWorkCtaIcon(record.ctaIcon, base.ctaIcon),
    ctaIconPosition:
      record.ctaIconPosition === 'left' || record.ctaIconPosition === 'right'
        ? record.ctaIconPosition
        : base.ctaIconPosition,
    ctaColor: sanitizeHex(record.ctaColor, base.ctaColor),
    ctaBorderColor: sanitizeHex(record.ctaBorderColor, base.ctaBorderColor),
    ctaBorderWidth:
      record.ctaBorderWidth === 'none' ||
      record.ctaBorderWidth === 'thin' ||
      record.ctaBorderWidth === 'medium' ||
      record.ctaBorderWidth === 'thick'
        ? record.ctaBorderWidth
        : base.ctaBorderWidth,
    ctaBorderRadius:
      record.ctaBorderRadius === 'none' ||
      record.ctaBorderRadius === 'sm' ||
      record.ctaBorderRadius === 'md' ||
      record.ctaBorderRadius === 'lg' ||
      record.ctaBorderRadius === 'full'
        ? record.ctaBorderRadius
        : base.ctaBorderRadius,
    ctaHoverEnabled:
      typeof record.ctaHoverEnabled === 'boolean' ? record.ctaHoverEnabled : base.ctaHoverEnabled,
    ctaHoverBackgroundColor: sanitizeHex(
      record.ctaHoverBackgroundColor,
      base.ctaHoverBackgroundColor
    ),
    ctaHoverTextColor: sanitizeHex(record.ctaHoverTextColor, base.ctaHoverTextColor),
    ctaHoverBorderColor: sanitizeHex(record.ctaHoverBorderColor, base.ctaHoverBorderColor),
    toolsIconBackgroundColor: sanitizeHex(
      record.toolsIconBackgroundColor,
      base.toolsIconBackgroundColor
    ),
    toolsIconBorderColor: sanitizeHex(record.toolsIconBorderColor, base.toolsIconBorderColor),
    toolsDisplay:
      toolsDisplay === 'icons' ||
      toolsDisplay === 'list' ||
      toolsDisplay === 'both' ||
      toolsDisplay === 'stacked'
        ? toolsDisplay
        : base.toolsDisplay,
    maxToolsShown: sanitizeMaxTools(record.maxToolsShown, base.maxToolsShown),
    categoryMode:
      categoryMode === 'off' ||
      categoryMode === 'filter' ||
      categoryMode === 'group' ||
      categoryMode === 'filter-and-group'
        ? categoryMode
        : base.categoryMode,
    categoryDesign:
      categoryDesign === 'pills' ||
      categoryDesign === 'underline' ||
      categoryDesign === 'tabs' ||
      categoryDesign === 'minimal'
        ? categoryDesign
        : base.categoryDesign,
    showCategoryOnCard:
      typeof record.showCategoryOnCard === 'boolean' ? record.showCategoryOnCard : base.showCategoryOnCard,
    categoryAllLabel:
      typeof record.categoryAllLabel === 'string' && record.categoryAllLabel.trim()
        ? record.categoryAllLabel.trim()
        : base.categoryAllLabel,
    categoryUncategorizedLabel:
      typeof record.categoryUncategorizedLabel === 'string' && record.categoryUncategorizedLabel.trim()
        ? record.categoryUncategorizedLabel.trim()
        : base.categoryUncategorizedLabel,
    categoryActiveColor: sanitizeHex(record.categoryActiveColor, base.categoryActiveColor),
    categoryMutedColor: sanitizeHex(record.categoryMutedColor, base.categoryMutedColor),
    useHeroPalette:
      typeof record.useHeroPalette === 'boolean' ? record.useHeroPalette : base.useHeroPalette,
    workPalette: mergeWorkPalette(
      mergeWorkPalette(DEFAULT_WORK_PALETTE, base.workPalette),
      record.workPalette
    ),
    workColorBindings: mergeWorkColorBindings(
      mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, base.workColorBindings),
      record.workColorBindings
    ),
    elementStyles: normalizeWorkElementStyles(record.elementStyles ?? base.elementStyles),
  };

  if (!merged.useHeroPalette) {
    return merged;
  }

  return {
    ...merged,
    ...(applyWorkPaletteToSettings(merged) as Partial<PortfolioWorkPresentationSettings>),
    useHeroPalette: true,
  };
}

export const WORK_CATEGORY_ALL_KEY = '__all__';
export const WORK_CATEGORY_UNCATEGORIZED_KEY = '__uncategorized__';

export function resolveWorkItemCategoryKey(genre: string | null | undefined): string {
  const trimmed = genre?.trim();
  return trimmed ? trimmed : WORK_CATEGORY_UNCATEGORIZED_KEY;
}

export function resolveWorkItemCategoryLabel(
  genre: string | null | undefined,
  uncategorizedLabel: string
): string {
  const trimmed = genre?.trim();
  return trimmed || uncategorizedLabel;
}

export function collectWorkCategories(
  items: { genre?: string | null }[],
  uncategorizedLabel: string
): { key: string; label: string; count: number }[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const item of items) {
    const key = resolveWorkItemCategoryKey(item.genre);
    const label = resolveWorkItemCategoryLabel(item.genre, uncategorizedLabel);
    const prev = counts.get(key);
    if (prev) prev.count += 1;
    else counts.set(key, { label, count: 1 });
  }
  return Array.from(counts.entries())
    .map(([key, value]) => ({ key, label: value.label, count: value.count }))
    .sort((a, b) => {
      if (a.key === WORK_CATEGORY_UNCATEGORIZED_KEY) return 1;
      if (b.key === WORK_CATEGORY_UNCATEGORIZED_KEY) return -1;
      return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
    });
}

export function filterWorkItemsByCategory<T extends { genre?: string | null }>(
  items: T[],
  activeKey: string
): T[] {
  if (!activeKey || activeKey === WORK_CATEGORY_ALL_KEY) return items;
  return items.filter((item) => resolveWorkItemCategoryKey(item.genre) === activeKey);
}

export function groupWorkItemsByCategory<T extends { genre?: string | null }>(
  items: T[],
  uncategorizedLabel: string
): { key: string; label: string; items: T[] }[] {
  const categories = collectWorkCategories(items, uncategorizedLabel);
  return categories.map((category) => ({
    key: category.key,
    label: category.label,
    items: items.filter((item) => resolveWorkItemCategoryKey(item.genre) === category.key),
  }));
}

export function workCategoryNavClass(design: PortfolioWorkCategoryDesign): string {
  switch (design) {
    case 'tabs':
      return 'inline-flex flex-wrap gap-1 rounded-2xl p-1.5';
    case 'underline':
      return 'flex flex-wrap gap-x-5 gap-y-2';
    case 'minimal':
      return 'flex flex-wrap items-center gap-x-4 gap-y-2';
    default:
      return 'flex flex-wrap gap-2';
  }
}

export function workCategoryChipClass(
  design: PortfolioWorkCategoryDesign,
  active: boolean
): string {
  const base = 'text-sm font-semibold transition-colors duration-200';
  switch (design) {
    case 'tabs':
      return `${base} rounded-xl px-3.5 py-2 ${
        active
          ? 'shadow-sm'
          : 'opacity-70 hover:opacity-100 hover:bg-[var(--work-cat-hover-bg)] hover:text-[color:var(--work-cat-hover-text)]'
      }`;
    case 'underline':
      return `${base} border-b-2 pb-2.5 ${
        active
          ? 'border-current'
          : 'border-transparent opacity-70 hover:opacity-100 hover:text-[color:var(--work-cat-hover-text)]'
      }`;
    case 'minimal':
      return `${base} ${
        active ? '' : 'opacity-55 hover:opacity-100 hover:text-[color:var(--work-cat-hover-text)]'
      }`;
    default:
      return `${base} rounded-full px-3.5 py-1.5 border ${
        active
          ? ''
          : 'bg-transparent hover:bg-[var(--work-cat-hover-bg)] hover:border-[color:var(--work-cat-hover-border)] hover:text-[color:var(--work-cat-hover-text)]'
      }`;
  }
}
