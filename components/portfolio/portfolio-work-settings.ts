import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
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

/**
 * Header design applied from Header — independent of Design's `sectionDesign` (which layout the
 * projects render in). One shared, GSAP-animated header mounts above every project layout.
 */
export type PortfolioWorkHeaderDesign =
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

/** Per-element header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioWorkPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioWorkAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioWorkBillboardWordStyle = 'outline' | 'fill' | 'simple';

export type PortfolioWorkHeaderAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every header design — one shared scale, same 4 steps everywhere. */
export type PortfolioWorkHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const WORK_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioWorkHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every header design. */
export type PortfolioWorkHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioWorkHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';
/** `!`-flagged so this always wins over the baked-in weight in `workHeaderFontClass('title')`
 *  (both are plain utility classes on the same element; Tailwind's `important` modifier is the
 *  only reliable way to guarantee winner regardless of generated-CSS order). */
export const WORK_HEADER_TITLE_WEIGHT_CLASS: Record<PortfolioWorkHeaderTitleWeight, string> = {
  light: '!font-light',
  regular: '!font-normal',
  semibold: '!font-semibold',
  bold: '!font-bold',
};

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

/**
 * Named Portfolio section designs (Settings → Portfolio → Design).
 * Legacy stored value `classic` is remapped to `projects-board`.
 */
export type PortfolioWorkSectionDesign =
  | 'projects-board'
  | 'projects-accordion'
  | 'projects-frames'
  | 'projects-index'
  | 'projects-grid'
  | 'projects-split'
  | 'projects-carousel'
  | 'projects-showcase'
  | 'projects-ledger'
  | 'projects-spec'
  | 'projects-case'
  | 'projects-press'
  | 'projects-duotone'
  | 'projects-cascade';

export const DEFAULT_PORTFOLIO_WORK_SECTION_DESIGN: PortfolioWorkSectionDesign = 'projects-board';

const PORTFOLIO_WORK_SECTION_DESIGNS: readonly PortfolioWorkSectionDesign[] = [
  'projects-board',
  'projects-accordion',
  'projects-frames',
  'projects-index',
  'projects-grid',
  'projects-split',
  'projects-carousel',
  'projects-showcase',
  'projects-ledger',
  'projects-spec',
  'projects-case',
  'projects-press',
  'projects-duotone',
  'projects-cascade',
];

/** Maps removed `classic` (and invalid ids) onto a live named design. */
export function resolveWorkSectionDesign(value: unknown): PortfolioWorkSectionDesign {
  if (value === 'classic') return DEFAULT_PORTFOLIO_WORK_SECTION_DESIGN;
  if (
    typeof value === 'string' &&
    (PORTFOLIO_WORK_SECTION_DESIGNS as readonly string[]).includes(value)
  ) {
    return value as PortfolioWorkSectionDesign;
  }
  return DEFAULT_PORTFOLIO_WORK_SECTION_DESIGN;
}

/** Options that apply only when `sectionDesign === 'projects-board'`. */
export type PortfolioWorkProjectsBoardColumns = 1 | 2 | 3 | 4;

/** Thumbnail aspect ratio — matters most at 1 per row, where the card spans the
 *  full row width and a fixed ratio can otherwise look oversized or cramped. */
export type PortfolioWorkProjectsBoardThumbnailSize = 'compact' | 'standard' | 'large';

export type PortfolioWorkProjectsBoardSettings = {
  /** Thumbnail above each card. */
  showThumbnail: boolean;
  /** Thumbnail aspect ratio (compact/standard/large). */
  thumbnailSize: PortfolioWorkProjectsBoardThumbnailSize;
  /** Role label in the card footer (accent). */
  showRole: boolean;
  /** Category in the card footer, beside the role. */
  showCategory: boolean;
  /** "View project" text link at the bottom of every card (uses project link). */
  showConsultOnHover: boolean;
  consultLabel: string;
  /** Cards per row on large screens. 2 (default) keeps the asymmetric diagonal
   *  rhythm (wide/narrow pairs); 1, 3 and 4 switch to an even, non-offset grid. */
  columnsPerRow: PortfolioWorkProjectsBoardColumns;
};

export const DEFAULT_PROJECTS_BOARD_SETTINGS: PortfolioWorkProjectsBoardSettings = {
  showThumbnail: true,
  thumbnailSize: 'standard',
  showRole: true,
  showCategory: true,
  showConsultOnHover: true,
  consultLabel: 'View project',
  columnsPerRow: 2,
};

export function mergeProjectsBoardSettings(
  base: PortfolioWorkProjectsBoardSettings,
  patch: unknown
): PortfolioWorkProjectsBoardSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const label =
    typeof record.consultLabel === 'string' && record.consultLabel.trim()
      ? record.consultLabel.trim().slice(0, 32)
      : base.consultLabel;
  const columnsPerRow =
    record.columnsPerRow === 1 ||
    record.columnsPerRow === 2 ||
    record.columnsPerRow === 3 ||
    record.columnsPerRow === 4
      ? record.columnsPerRow
      : record.columnsPerRow === '1' ||
          record.columnsPerRow === '2' ||
          record.columnsPerRow === '3' ||
          record.columnsPerRow === '4'
        ? (Number(record.columnsPerRow) as PortfolioWorkProjectsBoardColumns)
        : base.columnsPerRow;
  const thumbnailSize =
    record.thumbnailSize === 'compact' ||
    record.thumbnailSize === 'standard' ||
    record.thumbnailSize === 'large'
      ? record.thumbnailSize
      : base.thumbnailSize;
  return {
    showThumbnail:
      typeof record.showThumbnail === 'boolean' ? record.showThumbnail : base.showThumbnail,
    thumbnailSize,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showConsultOnHover:
      typeof record.showConsultOnHover === 'boolean'
        ? record.showConsultOnHover
        : base.showConsultOnHover,
    consultLabel: label,
    columnsPerRow,
  };
}

export const PORTFOLIO_WORK_PROJECTS_BOARD_COLUMNS_OPTIONS: {
  value: PortfolioWorkProjectsBoardColumns;
  label: string;
  description: string;
}[] = [
  { value: 1, label: '1 per row', description: 'Full-width cards, stacked — large editorial spotlight.' },
  { value: 2, label: '2 per row', description: 'Asymmetric diagonal pairs (default).' },
  {
    value: 3,
    label: '3 per row',
    description: 'Even 3-column grid on desktop — 2 on tablet, 1 on mobile.',
  },
  {
    value: 4,
    label: '4 per row',
    description: 'Dense even grid — 4 on large desktop, 3 on laptop, 2 on tablet, 1 on mobile.',
  },
];

export const PORTFOLIO_WORK_PROJECTS_BOARD_THUMBNAIL_SIZE_OPTIONS: {
  value: PortfolioWorkProjectsBoardThumbnailSize;
  label: string;
}[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
];

/** Options that apply only when `sectionDesign === 'projects-accordion'`. */
export type PortfolioWorkProjectsAccordionSettings = {
  /** Section title / subtitle alignment for this design only. */
  headerAlign: 'left' | 'center' | 'right';
  /** Which column holds the large preview image. */
  previewSide: 'left' | 'right';
  /** Label above stacks under the large preview. */
  toolsLabel: string;
  /** Show the label (and short rule) above stack chips. Off by default. */
  showToolsLabel: boolean;
  showTools: boolean;
  /** Description inside the open accordion panel. */
  showDescription: boolean;
  /** Role label inside the open accordion panel. */
  showRoleInPanel: boolean;
  /** Category label inside the open accordion panel. */
  showCategoryInPanel: boolean;
  /** Text “Consult” link under the preview (uses project link). */
  showConsult: boolean;
  consultLabel: string;
};

export const DEFAULT_PROJECTS_ACCORDION_SETTINGS: PortfolioWorkProjectsAccordionSettings = {
  headerAlign: 'center',
  previewSide: 'right',
  toolsLabel: 'Tools I use',
  showToolsLabel: false,
  showTools: true,
  showDescription: true,
  showRoleInPanel: true,
  showCategoryInPanel: true,
  showConsult: true,
  consultLabel: 'Consult',
};

export function mergeProjectsAccordionSettings(
  base: PortfolioWorkProjectsAccordionSettings,
  patch: unknown
): PortfolioWorkProjectsAccordionSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const toolsLabel =
    typeof record.toolsLabel === 'string' && record.toolsLabel.trim()
      ? record.toolsLabel.trim().slice(0, 48)
      : base.toolsLabel;
  const consultLabel =
    typeof record.consultLabel === 'string' && record.consultLabel.trim()
      ? record.consultLabel.trim().slice(0, 32)
      : base.consultLabel;
  // Recover from a brief bug that saved showRoleInPanel:false when migrating
  // off legacy showStackInPanel (before showCategoryInPanel existed).
  const showRoleInPanel =
    typeof record.showRoleInPanel === 'boolean'
      ? record.showRoleInPanel === false && !('showCategoryInPanel' in record)
        ? base.showRoleInPanel
        : record.showRoleInPanel
      : base.showRoleInPanel;
  return {
    headerAlign:
      record.headerAlign === 'left' ||
      record.headerAlign === 'center' ||
      record.headerAlign === 'right'
        ? record.headerAlign
        : base.headerAlign,
    previewSide: record.previewSide === 'left' || record.previewSide === 'right'
      ? record.previewSide
      : base.previewSide,
    toolsLabel,
    showToolsLabel:
      typeof record.showToolsLabel === 'boolean' ? record.showToolsLabel : base.showToolsLabel,
    showTools: typeof record.showTools === 'boolean' ? record.showTools : base.showTools,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showRoleInPanel,
    showCategoryInPanel:
      typeof record.showCategoryInPanel === 'boolean'
        ? record.showCategoryInPanel
        : base.showCategoryInPanel,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel,
  };
}

/** Options that apply only when `sectionDesign === 'projects-frames'`. */
export type PortfolioWorkProjectsFramesThumbnailSize = 'md' | 'lg' | 'xl' | 'xxl' | 'half';
export type PortfolioWorkProjectsFramesRadius = 'none' | 'md' | 'xl';
export type PortfolioWorkProjectsFramesCardGap = 'tight' | 'md' | 'xl';

export type PortfolioWorkProjectsFramesSettings = {
  showRole: boolean;
  showCategory: boolean;
  showDescription: boolean;
  /** Stack as plain text with hairline separators (not pill tags). */
  showStack: boolean;
  showConsult: boolean;
  consultLabel: string;
  /** Thumbnail width / height scale (xxl is larger than the previous default). */
  thumbnailSize: PortfolioWorkProjectsFramesThumbnailSize;
  /** Base side for the image (info on the opposite side). */
  imageSide: 'left' | 'right';
  /** Alternate image left / right on each successive card. */
  alternateSides: boolean;
  /** When false, the thumbnail sits flush against the card edge (no inner padding). */
  imagePadding: boolean;
  /** Shared corner radius for the card shell and the thumbnail. */
  radius: PortfolioWorkProjectsFramesRadius;
  /** Vertical space between stacked cards. */
  cardGap: PortfolioWorkProjectsFramesCardGap;
};

export const DEFAULT_PROJECTS_FRAMES_SETTINGS: PortfolioWorkProjectsFramesSettings = {
  showRole: true,
  showCategory: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  consultLabel: 'Consult',
  thumbnailSize: 'xl',
  imageSide: 'left',
  alternateSides: false,
  imagePadding: true,
  radius: 'xl',
  cardGap: 'tight',
};

export function mergeProjectsFramesSettings(
  base: PortfolioWorkProjectsFramesSettings,
  patch: unknown
): PortfolioWorkProjectsFramesSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const consultLabel =
    typeof record.consultLabel === 'string' && record.consultLabel.trim()
      ? record.consultLabel.trim().slice(0, 32)
      : base.consultLabel;
  const thumbnailSize =
    record.thumbnailSize === 'md' ||
    record.thumbnailSize === 'lg' ||
    record.thumbnailSize === 'xl' ||
    record.thumbnailSize === 'xxl' ||
    record.thumbnailSize === 'half'
      ? record.thumbnailSize
      : base.thumbnailSize;
  const radius =
    record.radius === 'none' || record.radius === 'md' || record.radius === 'xl'
      ? record.radius
      : base.radius;
  const cardGap =
    record.cardGap === 'tight' || record.cardGap === 'md' || record.cardGap === 'xl'
      ? record.cardGap
      : base.cardGap;
  return {
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel,
    thumbnailSize,
    imageSide: record.imageSide === 'left' || record.imageSide === 'right' ? record.imageSide : base.imageSide,
    alternateSides:
      typeof record.alternateSides === 'boolean' ? record.alternateSides : base.alternateSides,
    imagePadding: typeof record.imagePadding === 'boolean' ? record.imagePadding : base.imagePadding,
    radius,
    cardGap,
  };
}

export const PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS: {
  value: PortfolioWorkProjectsFramesThumbnailSize;
  label: string;
  description: string;
}[] = [
  { value: 'md', label: 'Medium', description: 'Compact thumbnail beside the info.' },
  { value: 'lg', label: 'Large', description: 'Wider thumbnail, balanced with text.' },
  { value: 'xl', label: 'Extra large', description: 'Current large default size.' },
  { value: 'xxl', label: 'Huge', description: 'Very large — bigger than the previous max.' },
  {
    value: 'half',
    label: 'Two columns',
    description: 'Image and info split evenly — 50 / 50.',
  },
];

export const PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS: {
  value: PortfolioWorkProjectsFramesSettings['imageSide'];
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Image left', description: 'Thumbnail on the left, info on the right.' },
  { value: 'right', label: 'Image right', description: 'Thumbnail on the right, info on the left.' },
];

export const PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsFramesRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Sharp corners on the card and thumbnail.' },
  { value: 'md', label: 'Medium', description: 'Soft rounded corners.' },
  { value: 'xl', label: 'Large', description: 'Very rounded card and thumbnail (default).' },
];

export const PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS: {
  value: PortfolioWorkProjectsFramesCardGap;
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Current compact spacing between cards.' },
  { value: 'md', label: 'Moyen', description: 'More vertical breathing room.' },
  { value: 'xl', label: 'Très grand', description: 'Wide vertical gap between each card.' },
];

/** Options that apply only when `sectionDesign === 'projects-index'`. */
export type PortfolioWorkProjectsIndexMarker = 'number' | 'bullet';

export type PortfolioWorkProjectsIndexSettings = {
  showNumber: boolean;
  /** Left column marker — padded numbers or list bullet. */
  indexMarker: PortfolioWorkProjectsIndexMarker;
  showStack: boolean;
  showDescription: boolean;
  /** Vertical padding around each numbered row. */
  rowGap: 'tight' | 'md' | 'xl';
};

export const DEFAULT_PROJECTS_INDEX_SETTINGS: PortfolioWorkProjectsIndexSettings = {
  showNumber: true,
  indexMarker: 'number',
  showStack: true,
  showDescription: true,
  rowGap: 'md',
};

export function mergeProjectsIndexSettings(
  base: PortfolioWorkProjectsIndexSettings,
  patch: unknown
): PortfolioWorkProjectsIndexSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    showNumber: typeof record.showNumber === 'boolean' ? record.showNumber : base.showNumber,
    indexMarker:
      record.indexMarker === 'number' || record.indexMarker === 'bullet'
        ? record.indexMarker
        : base.indexMarker,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    rowGap:
      record.rowGap === 'tight' || record.rowGap === 'md' || record.rowGap === 'xl'
        ? record.rowGap
        : base.rowGap,
  };
}

export const PORTFOLIO_WORK_INDEX_MARKER_OPTIONS: {
  value: PortfolioWorkProjectsIndexMarker;
  label: string;
  description: string;
}[] = [
  { value: 'number', label: 'Numérotation', description: '001, 002… in the left column.' },
  { value: 'bullet', label: 'Puce', description: 'Simple list bullet instead of numbers.' },
];

export const PORTFOLIO_WORK_INDEX_ROW_GAP_OPTIONS: {
  value: PortfolioWorkProjectsIndexSettings['rowGap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Compact padding above / below each separator.' },
  { value: 'md', label: 'Moyen', description: 'Balanced spacing (default).' },
  { value: 'xl', label: 'Très grand', description: 'Airy space between numbered rows.' },
];

/** Options that apply only when `sectionDesign === 'projects-grid'`. */
export type PortfolioWorkProjectsGridColumns = 2 | 3;

export type PortfolioWorkProjectsGridRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkProjectsGridSettings = {
  /** Cards per row on large screens (2 or 3). */
  columnsPerRow: PortfolioWorkProjectsGridColumns;
  showDescription: boolean;
  /** Card / thumbnail frame border for this design. */
  cardBorder: PortfolioWorkCardBorder;
  /** Shared corner radius on card frame and thumbnail. */
  cardRadius: PortfolioWorkProjectsGridRadius;
  /** Slide between rows when more projects than fit on screen. */
  carouselEnabled: boolean;
};

export const DEFAULT_PROJECTS_GRID_SETTINGS: PortfolioWorkProjectsGridSettings = {
  columnsPerRow: 2,
  showDescription: true,
  cardBorder: 'none',
  cardRadius: 'none',
  carouselEnabled: false,
};

export function mergeProjectsGridSettings(
  base: PortfolioWorkProjectsGridSettings,
  patch: unknown
): PortfolioWorkProjectsGridSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const columnsPerRow =
    record.columnsPerRow === 2 || record.columnsPerRow === 3
      ? record.columnsPerRow
      : record.columnsPerRow === '2' || record.columnsPerRow === '3'
        ? (Number(record.columnsPerRow) as PortfolioWorkProjectsGridColumns)
        : base.columnsPerRow;
  const cardBorder =
    record.cardBorder === 'none' ||
    record.cardBorder === 'soft' ||
    record.cardBorder === 'solid' ||
    record.cardBorder === 'accent'
      ? record.cardBorder
      : base.cardBorder;
  const cardRadius =
    record.cardRadius === 'none' ||
    record.cardRadius === 'sm' ||
    record.cardRadius === 'md' ||
    record.cardRadius === 'lg' ||
    record.cardRadius === 'xl'
      ? record.cardRadius
      : base.cardRadius;
  return {
    columnsPerRow,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    cardBorder,
    cardRadius,
    carouselEnabled:
      typeof record.carouselEnabled === 'boolean' ? record.carouselEnabled : base.carouselEnabled,
  };
}

export const PORTFOLIO_WORK_GRID_COLUMNS_OPTIONS: {
  value: PortfolioWorkProjectsGridColumns;
  label: string;
  description: string;
}[] = [
  { value: 2, label: '2 columns', description: 'Two cards per row on large screens (default).' },
  { value: 3, label: '3 columns', description: 'Three cards per row on large screens.' },
];

/** Options that apply only when `sectionDesign === 'projects-split'`. */
export type PortfolioWorkProjectsSplitThumbnailSize = 'lg' | 'xl' | 'half';

export type PortfolioWorkProjectsSplitRadius = 'none' | 'md' | 'xl';

export type PortfolioWorkProjectsSplitSettings = {
  thumbnailSize: PortfolioWorkProjectsSplitThumbnailSize;
  thumbnailRadius: PortfolioWorkProjectsSplitRadius;
  rowGap: 'tight' | 'md' | 'xl';
  showDescription: boolean;
  /** Image left, right, or centered in the row. */
  imageSide: 'left' | 'right' | 'center';
  /**
   * When image is centered: title on the left (default) or right.
   * Ignored for left/right image placement (title takes the other side).
   */
  titleSide: 'left' | 'right';
  /**
   * When image is centered: title/description at the top or bottom of the side column.
   * When description is separated, this only applies to the title.
   */
  titleVerticalAlign: 'top' | 'bottom';
  /**
   * When image is centered: keep description under the title, or place it on the
   * opposite side of the image.
   */
  descriptionPlacement: 'with-title' | 'opposite';
  /**
   * When description is on the opposite side: top or bottom of that column.
   */
  descriptionVerticalAlign: 'top' | 'bottom';
  /** Zigzag: odd rows keep imageSide, even rows flip (ignored when center). */
  alternateSides: boolean;
};

export const DEFAULT_PROJECTS_SPLIT_SETTINGS: PortfolioWorkProjectsSplitSettings = {
  thumbnailSize: 'xl',
  thumbnailRadius: 'none',
  rowGap: 'md',
  showDescription: false,
  imageSide: 'left',
  titleSide: 'left',
  titleVerticalAlign: 'top',
  descriptionPlacement: 'with-title',
  descriptionVerticalAlign: 'bottom',
  alternateSides: false,
};

export function mergeProjectsSplitSettings(
  base: PortfolioWorkProjectsSplitSettings,
  patch: unknown
): PortfolioWorkProjectsSplitSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const thumbnailSize =
    record.thumbnailSize === 'lg' || record.thumbnailSize === 'xl' || record.thumbnailSize === 'half'
      ? record.thumbnailSize
      : base.thumbnailSize;
  const thumbnailRadius =
    record.thumbnailRadius === 'none' || record.thumbnailRadius === 'md' || record.thumbnailRadius === 'xl'
      ? record.thumbnailRadius
      : base.thumbnailRadius;
  const rowGap =
    record.rowGap === 'tight' || record.rowGap === 'md' || record.rowGap === 'xl'
      ? record.rowGap
      : base.rowGap;
  return {
    thumbnailSize,
    thumbnailRadius,
    rowGap,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    imageSide:
      record.imageSide === 'left' || record.imageSide === 'right' || record.imageSide === 'center'
        ? record.imageSide
        : base.imageSide,
    titleSide: record.titleSide === 'left' || record.titleSide === 'right' ? record.titleSide : base.titleSide,
    titleVerticalAlign:
      record.titleVerticalAlign === 'top' || record.titleVerticalAlign === 'bottom'
        ? record.titleVerticalAlign
        : base.titleVerticalAlign,
    descriptionPlacement:
      record.descriptionPlacement === 'with-title' || record.descriptionPlacement === 'opposite'
        ? record.descriptionPlacement
        : base.descriptionPlacement,
    descriptionVerticalAlign:
      record.descriptionVerticalAlign === 'top' || record.descriptionVerticalAlign === 'bottom'
        ? record.descriptionVerticalAlign
        : base.descriptionVerticalAlign,
    alternateSides:
      typeof record.alternateSides === 'boolean' ? record.alternateSides : base.alternateSides,
  };
}

export const PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS: {
  value: PortfolioWorkProjectsSplitThumbnailSize;
  label: string;
  description: string;
}[] = [
  { value: 'lg', label: 'Large', description: 'Big thumbnail, more room for the title beside it.' },
  { value: 'xl', label: 'Very large', description: 'Dominant thumbnail (default).' },
  { value: 'half', label: 'Half width', description: 'Thumbnail and title each take 50%.' },
];

export const PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsSplitRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Sharp corners (default).' },
  { value: 'md', label: 'Medium', description: 'Soft rounded corners.' },
  { value: 'xl', label: 'Large', description: 'Very rounded thumbnail.' },
];

export const PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS: {
  value: PortfolioWorkProjectsSplitSettings['rowGap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Compact spacing between rows.' },
  { value: 'md', label: 'Moyen', description: 'Balanced spacing (default).' },
  { value: 'xl', label: 'Très grand', description: 'Airy vertical rhythm.' },
];

export const PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS: {
  value: PortfolioWorkProjectsSplitSettings['imageSide'];
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Image left', description: 'Thumbnail on the left, title on the right.' },
  {
    value: 'center',
    label: 'Image center',
    description: 'Thumbnail centered in the row; title stays left or right.',
  },
  { value: 'right', label: 'Image right', description: 'Thumbnail on the right, title on the left.' },
];

export const PORTFOLIO_WORK_SPLIT_TITLE_SIDE_OPTIONS: {
  value: PortfolioWorkProjectsSplitSettings['titleSide'];
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Title left',
    description: 'Title + description on the left of the centered image (default).',
  },
  {
    value: 'right',
    label: 'Title right',
    description: 'Title + description on the right of the centered image.',
  },
];

export const PORTFOLIO_WORK_SPLIT_TITLE_VERTICAL_OPTIONS: {
  value: PortfolioWorkProjectsSplitSettings['titleVerticalAlign'];
  label: string;
  description: string;
}[] = [
  {
    value: 'top',
    label: 'En haut',
    description: 'Aligné en haut avec le bord supérieur de l’image.',
  },
  {
    value: 'bottom',
    label: 'En bas',
    description: 'Aligné en bas — titre au bas du côté.',
  },
];

export const PORTFOLIO_WORK_SPLIT_DESCRIPTION_PLACEMENT_OPTIONS: {
  value: PortfolioWorkProjectsSplitSettings['descriptionPlacement'];
  label: string;
  description: string;
}[] = [
  {
    value: 'with-title',
    label: 'Sous le titre',
    description: 'La description reste avec le titre.',
  },
  {
    value: 'opposite',
    label: 'Autre côté',
    description: 'La description passe de l’autre côté de l’image (titre inchangé).',
  },
];

export const PORTFOLIO_WORK_SPLIT_DESCRIPTION_VERTICAL_OPTIONS: {
  value: PortfolioWorkProjectsSplitSettings['descriptionVerticalAlign'];
  label: string;
  description: string;
}[] = [
  {
    value: 'top',
    label: 'En haut',
    description: 'Description en haut, de l’autre côté de l’image.',
  },
  {
    value: 'bottom',
    label: 'En bas',
    description: 'Description en bas, de l’autre côté de l’image.',
  },
];

/** Options that apply only when `sectionDesign === 'projects-carousel'`. */
export type PortfolioWorkProjectsCarouselImageSize = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkProjectsCarouselRadius = 'none' | 'md' | 'xl';

export type PortfolioWorkProjectsCarouselAspect = 'square' | 'landscape' | 'portrait';

export type PortfolioWorkProjectsCarouselSettings = {
  /** Width of each slide image. */
  imageSize: PortfolioWorkProjectsCarouselImageSize;
  imageRadius: PortfolioWorkProjectsCarouselRadius;
  aspectRatio: PortfolioWorkProjectsCarouselAspect;
  gap: 'tight' | 'md' | 'xl';
  /** On hover: zoom image slightly, dim, and show title + description centered. */
  hoverReveal: boolean;
  /** On hover: blur sibling slides so the hovered card feels in focus. */
  focusBlurSiblings: boolean;
  /** On hover: show project stack in a borderless strip under the image. */
  hoverStack: boolean;
};

export const DEFAULT_PROJECTS_CAROUSEL_SETTINGS: PortfolioWorkProjectsCarouselSettings = {
  imageSize: 'lg',
  imageRadius: 'none',
  aspectRatio: 'square',
  gap: 'md',
  hoverReveal: true,
  focusBlurSiblings: true,
  hoverStack: true,
};

export function mergeProjectsCarouselSettings(
  base: PortfolioWorkProjectsCarouselSettings,
  patch: unknown
): PortfolioWorkProjectsCarouselSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const imageSize =
    record.imageSize === 'sm' ||
    record.imageSize === 'md' ||
    record.imageSize === 'lg' ||
    record.imageSize === 'xl'
      ? record.imageSize
      : base.imageSize;
  const imageRadius =
    record.imageRadius === 'none' || record.imageRadius === 'md' || record.imageRadius === 'xl'
      ? record.imageRadius
      : base.imageRadius;
  const aspectRatio =
    record.aspectRatio === 'square' ||
    record.aspectRatio === 'landscape' ||
    record.aspectRatio === 'portrait'
      ? record.aspectRatio
      : base.aspectRatio;
  const gap =
    record.gap === 'tight' || record.gap === 'md' || record.gap === 'xl' ? record.gap : base.gap;
  return {
    imageSize,
    imageRadius,
    aspectRatio,
    gap,
    hoverReveal: typeof record.hoverReveal === 'boolean' ? record.hoverReveal : base.hoverReveal,
    focusBlurSiblings:
      typeof record.focusBlurSiblings === 'boolean'
        ? record.focusBlurSiblings
        : base.focusBlurSiblings,
    hoverStack: typeof record.hoverStack === 'boolean' ? record.hoverStack : base.hoverStack,
  };
}

export const PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS: {
  value: PortfolioWorkProjectsCarouselImageSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Petite', description: 'Images compactes — plusieurs visibles à la fois.' },
  { value: 'md', label: 'Moyenne', description: 'Taille équilibrée.' },
  { value: 'lg', label: 'Grande', description: 'Image dominante (défaut).' },
  { value: 'xl', label: 'Très grande', description: 'Presque plein écran, léger aperçu suivant.' },
];

export const PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsCarouselRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Coins droits (défaut).' },
  { value: 'md', label: 'Medium', description: 'Coins légèrement arrondis.' },
  { value: 'xl', label: 'Large', description: 'Coins très arrondis.' },
];

export const PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS: {
  value: PortfolioWorkProjectsCarouselAspect;
  label: string;
  description: string;
}[] = [
  { value: 'square', label: 'Carré', description: 'Format 1:1 (défaut).' },
  { value: 'landscape', label: 'Paysage', description: 'Format 4:3 horizontal.' },
  { value: 'portrait', label: 'Portrait', description: 'Format 3:4 vertical.' },
];

export const PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS: {
  value: PortfolioWorkProjectsCarouselSettings['gap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Peu d’espace entre les images.' },
  { value: 'md', label: 'Moyen', description: 'Espacement lisible entre les slides.' },
  { value: 'xl', label: 'Large', description: 'Grand air entre chaque image.' },
];

/** Options that apply only when `sectionDesign === 'projects-showcase'`. */
export type PortfolioWorkProjectsShowcaseRadius = 'none' | 'md' | 'xl';

export type PortfolioWorkProjectsShowcaseSettings = {
  /** Primary media on the left (default) or right. */
  mediaSide: 'left' | 'right';
  mediaRadius: PortfolioWorkProjectsShowcaseRadius;
  showRole: boolean;
  showDescription: boolean;
  showCategory: boolean;
  categoryLabel: string;
};

export const DEFAULT_PROJECTS_SHOWCASE_SETTINGS: PortfolioWorkProjectsShowcaseSettings = {
  mediaSide: 'left',
  mediaRadius: 'xl',
  showRole: true,
  showDescription: true,
  showCategory: true,
  categoryLabel: 'Category',
};

export function mergeProjectsShowcaseSettings(
  base: PortfolioWorkProjectsShowcaseSettings,
  patch: unknown
): PortfolioWorkProjectsShowcaseSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    mediaSide:
      record.mediaSide === 'left' || record.mediaSide === 'right' ? record.mediaSide : base.mediaSide,
    mediaRadius:
      record.mediaRadius === 'none' || record.mediaRadius === 'md' || record.mediaRadius === 'xl'
        ? record.mediaRadius
        : base.mediaRadius,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    categoryLabel:
      typeof record.categoryLabel === 'string' && record.categoryLabel.trim()
        ? record.categoryLabel.trim()
        : base.categoryLabel,
  };
}

export const PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS: {
  value: PortfolioWorkProjectsShowcaseSettings['mediaSide'];
  label: string;
  description: string;
}[] = [
  {
    value: 'left',
    label: 'Media left',
    description: 'Large image left, details + thumbs right (default).',
  },
  {
    value: 'right',
    label: 'Media right',
    description: 'Details left, large image right.',
  },
];

export const PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsShowcaseRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Sharp corners.' },
  { value: 'md', label: 'Medium', description: 'Soft rounded corners.' },
  { value: 'xl', label: 'Large', description: 'Editorial rounded media (default).' },
];


/** Options that apply only when `sectionDesign === 'projects-ledger'`. */
export type PortfolioWorkProjectsLedgerExpandMode = 'hover' | 'click' | 'always';

export type PortfolioWorkProjectsLedgerSettings = {
  /** How project details open under each ledger row. */
  expandMode: PortfolioWorkProjectsLedgerExpandMode;
  showIndex: boolean;
  showRole: boolean;
  showDescription: boolean;
  showStack: boolean;
  showConsult: boolean;
  showCount: boolean;
  consultLabel: string;
  /** Alternating row background tint, ledger-book style. */
  stripedRows: boolean;
};

export const DEFAULT_PROJECTS_LEDGER_SETTINGS: PortfolioWorkProjectsLedgerSettings = {
  expandMode: 'hover',
  showIndex: true,
  showRole: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  showCount: true,
  consultLabel: 'Consult this project',
  stripedRows: false,
};

export function mergeProjectsLedgerSettings(
  base: PortfolioWorkProjectsLedgerSettings,
  patch: unknown
): PortfolioWorkProjectsLedgerSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    expandMode:
      record.expandMode === 'hover' ||
      record.expandMode === 'click' ||
      record.expandMode === 'always'
        ? record.expandMode
        : base.expandMode,
    showIndex: typeof record.showIndex === 'boolean' ? record.showIndex : base.showIndex,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    showCount: typeof record.showCount === 'boolean' ? record.showCount : base.showCount,
    consultLabel:
      typeof record.consultLabel === 'string' && record.consultLabel.trim()
        ? record.consultLabel.trim()
        : base.consultLabel,
    stripedRows:
      typeof record.stripedRows === 'boolean' ? record.stripedRows : base.stripedRows,
  };
}

/** Options that apply only when `sectionDesign === 'projects-spec'`. */
export type PortfolioWorkProjectsSpecConsultDesign =
  | 'link'
  | 'underline'
  | 'bracket'
  | 'footer'
  | 'pill'
  | 'outline'
  | 'ghost'
  | 'solid';

export type PortfolioWorkProjectsSpecSettings = {
  showRole: boolean;
  showCategory: boolean;
  showDescription: boolean;
  showStack: boolean;
  showConsult: boolean;
  consultLabel: string;
  /** How the Consult CTA is rendered. */
  consultDesign: PortfolioWorkProjectsSpecConsultDesign;
  /** Vertical gap between each spec sheet. */
  sheetGap: 'tight' | 'md' | 'xl' | '2xl';
  /**
   * Large screens: 1 full-width sheet, or 2 columns with horizontal gap
   * (title font size shrinks automatically in 2-col mode).
   */
  columnsPerRow: 1 | 2;
  /** Outer frame / border around each spec sheet. */
  sheetFrame: 'none' | 'thin' | 'solid' | 'accent';
  /** Show project media thumbnail on the right of each sheet. */
  showThumbnail: boolean;
  /** Show Summary / Stack / Link labels in the definition grid. */
  showFieldLabels: boolean;
  /** Label for the description row (default: Summary). */
  descriptionLabel: string;
  /** Label for the stack row (default: Stack). */
  stackLabel: string;
  /** Label for the consult row (default: Link). */
  linkLabel: string;
};

export const DEFAULT_PROJECTS_SPEC_SETTINGS: PortfolioWorkProjectsSpecSettings = {
  showRole: true,
  showCategory: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  consultLabel: 'Consult this project',
  consultDesign: 'bracket',
  sheetGap: 'xl',
  columnsPerRow: 1,
  sheetFrame: 'none',
  showThumbnail: false,
  showFieldLabels: true,
  descriptionLabel: 'Summary',
  stackLabel: 'Stack',
  linkLabel: 'Link',
};

export function mergeProjectsSpecSettings(
  base: PortfolioWorkProjectsSpecSettings,
  patch: unknown
): PortfolioWorkProjectsSpecSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel:
      typeof record.consultLabel === 'string' && record.consultLabel.trim()
        ? record.consultLabel.trim()
        : base.consultLabel,
    consultDesign:
      record.consultDesign === 'link' ||
      record.consultDesign === 'underline' ||
      record.consultDesign === 'bracket' ||
      record.consultDesign === 'footer' ||
      record.consultDesign === 'pill' ||
      record.consultDesign === 'outline' ||
      record.consultDesign === 'ghost' ||
      record.consultDesign === 'solid'
        ? record.consultDesign
        : base.consultDesign,
    sheetGap:
      record.sheetGap === 'tight' ||
      record.sheetGap === 'md' ||
      record.sheetGap === 'xl' ||
      record.sheetGap === '2xl'
        ? record.sheetGap
        : base.sheetGap,
    columnsPerRow: record.columnsPerRow === 2 || record.columnsPerRow === 1 ? record.columnsPerRow : base.columnsPerRow,
    sheetFrame:
      record.sheetFrame === 'none' ||
      record.sheetFrame === 'thin' ||
      record.sheetFrame === 'solid' ||
      record.sheetFrame === 'accent'
        ? record.sheetFrame
        : base.sheetFrame,
    showThumbnail:
      typeof record.showThumbnail === 'boolean' ? record.showThumbnail : base.showThumbnail,
    showFieldLabels:
      typeof record.showFieldLabels === 'boolean' ? record.showFieldLabels : base.showFieldLabels,
    descriptionLabel:
      typeof record.descriptionLabel === 'string' && record.descriptionLabel.trim()
        ? record.descriptionLabel.trim()
        : base.descriptionLabel,
    stackLabel:
      typeof record.stackLabel === 'string' && record.stackLabel.trim()
        ? record.stackLabel.trim()
        : base.stackLabel,
    linkLabel:
      typeof record.linkLabel === 'string' && record.linkLabel.trim()
        ? record.linkLabel.trim()
        : base.linkLabel,
  };
}

/** Options that apply only when `sectionDesign === 'projects-case'`. */
export type PortfolioWorkProjectsCaseSettings = {
  showRole: boolean;
  showCategory: boolean;
  showDescription: boolean;
  showStack: boolean;
  showConsult: boolean;
  consultLabel: string;
  /** How the Consult CTA is rendered (same union as Spec). */
  consultDesign: PortfolioWorkProjectsSpecConsultDesign;
  /** Vertical gap between each case row. */
  sheetGap: 'tight' | 'md' | 'xl' | '2xl';
  /** Outer frame / border around each case content sheet. */
  sheetFrame: 'none' | 'thin' | 'solid' | 'accent';
  /** Show large left thumbnail (50/50). When false, content is full width. */
  showThumbnail: boolean;
  /** Thumbnail height preset — `md` matches the original Case size. */
  thumbnailHeight: 'sm' | 'md' | 'lg' | 'xl';
  /** Show Summary / Stack / Link labels in the definition grid. */
  showFieldLabels: boolean;
  /** Label for the description row (default: Summary). */
  descriptionLabel: string;
  /** Label for the stack row (default: Stack). */
  stackLabel: string;
  /** Label for the consult row (default: Link). */
  linkLabel: string;
  /** Alternates image/copy sides per row (zig-zag). Off = every row keeps the same side. */
  zigzagEnabled: boolean;
};

export const DEFAULT_PROJECTS_CASE_SETTINGS: PortfolioWorkProjectsCaseSettings = {
  showRole: true,
  showCategory: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  consultLabel: 'Consult this project',
  consultDesign: 'footer',
  sheetGap: 'xl',
  sheetFrame: 'none',
  showThumbnail: true,
  thumbnailHeight: 'xl',
  showFieldLabels: false,
  descriptionLabel: 'Summary',
  stackLabel: 'Stack',
  linkLabel: 'Link',
  zigzagEnabled: true,
};

export function mergeProjectsCaseSettings(
  base: PortfolioWorkProjectsCaseSettings,
  patch: unknown
): PortfolioWorkProjectsCaseSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel:
      typeof record.consultLabel === 'string' && record.consultLabel.trim()
        ? record.consultLabel.trim()
        : base.consultLabel,
    consultDesign:
      record.consultDesign === 'link' ||
      record.consultDesign === 'underline' ||
      record.consultDesign === 'bracket' ||
      record.consultDesign === 'footer' ||
      record.consultDesign === 'pill' ||
      record.consultDesign === 'outline' ||
      record.consultDesign === 'ghost' ||
      record.consultDesign === 'solid'
        ? record.consultDesign
        : base.consultDesign,
    sheetGap:
      record.sheetGap === 'tight' ||
      record.sheetGap === 'md' ||
      record.sheetGap === 'xl' ||
      record.sheetGap === '2xl'
        ? record.sheetGap
        : base.sheetGap,
    sheetFrame:
      record.sheetFrame === 'none' ||
      record.sheetFrame === 'thin' ||
      record.sheetFrame === 'solid' ||
      record.sheetFrame === 'accent'
        ? record.sheetFrame
        : base.sheetFrame,
    showThumbnail:
      typeof record.showThumbnail === 'boolean' ? record.showThumbnail : base.showThumbnail,
    thumbnailHeight:
      record.thumbnailHeight === 'sm' ||
      record.thumbnailHeight === 'md' ||
      record.thumbnailHeight === 'lg' ||
      record.thumbnailHeight === 'xl'
        ? record.thumbnailHeight
        : base.thumbnailHeight,
    showFieldLabels:
      typeof record.showFieldLabels === 'boolean' ? record.showFieldLabels : base.showFieldLabels,
    descriptionLabel:
      typeof record.descriptionLabel === 'string' && record.descriptionLabel.trim()
        ? record.descriptionLabel.trim()
        : base.descriptionLabel,
    stackLabel:
      typeof record.stackLabel === 'string' && record.stackLabel.trim()
        ? record.stackLabel.trim()
        : base.stackLabel,
    linkLabel:
      typeof record.linkLabel === 'string' && record.linkLabel.trim()
        ? record.linkLabel.trim()
        : base.linkLabel,
    zigzagEnabled:
      typeof record.zigzagEnabled === 'boolean' ? record.zigzagEnabled : base.zigzagEnabled,
  };
}

/** Eyebrow font size, on `sectionDesign === 'projects-press'`. */
export type PortfolioWorkProjectsPressEyebrowSize = 'sm' | 'md' | 'lg';

export const PORTFOLIO_WORK_PRESS_EYEBROW_SIZE_OPTIONS: {
  value: PortfolioWorkProjectsPressEyebrowSize;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Small', description: 'Quieter — a discreet side label.' },
  { value: 'md', label: 'Medium', description: 'Default size.' },
  { value: 'lg', label: 'Large', description: 'Bolder — reads more like a heading.' },
];

/** Options that apply only when `sectionDesign === 'projects-press'`. */
export type PortfolioWorkProjectsPressSettings = {
  /** Left-column blurb shown beside the row feed on large screens (empty = single column). */
  introText: string;
  /** Small left-column eyebrow word, aligned with the top of the first row — large screens
   *  only. Empty falls back to "Project". Its presence (always, via the fallback) is what
   *  shifts the row feed into the two-column layout, giving it breathing room on the left. */
  eyebrowText: string;
  /** Pins the eyebrow (+ intro text, if set) in place while the row feed scrolls past it —
   *  large screens only. Defaults on. */
  eyebrowSticky: boolean;
  /** Eyebrow font size. */
  eyebrowSize: PortfolioWorkProjectsPressEyebrowSize;
  /** Corner radius of each row's square thumbnail. */
  thumbnailRadius: PortfolioWorkCardRadius;
};

export const DEFAULT_PROJECTS_PRESS_SETTINGS: PortfolioWorkProjectsPressSettings = {
  introText: '',
  eyebrowText: '',
  eyebrowSticky: true,
  eyebrowSize: 'md',
  thumbnailRadius: 'md',
};

export function mergeProjectsPressSettings(
  base: PortfolioWorkProjectsPressSettings,
  patch: unknown
): PortfolioWorkProjectsPressSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    introText: typeof record.introText === 'string' ? record.introText : base.introText,
    eyebrowText: typeof record.eyebrowText === 'string' ? record.eyebrowText : base.eyebrowText,
    eyebrowSticky:
      typeof record.eyebrowSticky === 'boolean' ? record.eyebrowSticky : base.eyebrowSticky,
    eyebrowSize:
      record.eyebrowSize === 'sm' || record.eyebrowSize === 'md' || record.eyebrowSize === 'lg'
        ? record.eyebrowSize
        : base.eyebrowSize,
    thumbnailRadius:
      record.thumbnailRadius === 'none' ||
      record.thumbnailRadius === 'sm' ||
      record.thumbnailRadius === 'md' ||
      record.thumbnailRadius === 'lg' ||
      record.thumbnailRadius === 'xl'
        ? record.thumbnailRadius
        : base.thumbnailRadius,
  };
}

/** Options that apply only when `sectionDesign === 'projects-duotone'`. */
export type PortfolioWorkProjectsDuotoneScrollMode = 'sticky' | 'scroll' | 'slide';
export type PortfolioWorkProjectsDuotoneThumbnailEffect = 'grayscale' | 'tint' | 'none';
export type PortfolioWorkProjectsDuotoneThumbnailHeight = 'sm' | 'md' | 'lg';
export type PortfolioWorkProjectsDuotoneFrameColor = 'none' | 'neutral' | 'muted';
export type PortfolioWorkProjectsDuotoneFrameRadius = 'none' | 'sm' | 'lg';
export type PortfolioWorkProjectsDuotoneSlideNavStyle = 'chevron' | 'text';
export type PortfolioWorkProjectsDuotoneVerticalGap = 'sm' | 'md' | 'lg' | 'xl';

export type PortfolioWorkProjectsDuotoneSettings = {
  /** Sticky: story panel pinned, crossfades as the project list scrolls. Scroll: plain, no
   *  pinning. Slide: one project at a time, chevron-navigated. */
  scrollMode: PortfolioWorkProjectsDuotoneScrollMode;
  /** Full-width intro screen shown before the first project (desktop only). */
  showIntro: boolean;
  thumbnailEffect: PortfolioWorkProjectsDuotoneThumbnailEffect;
  thumbnailHeight: PortfolioWorkProjectsDuotoneThumbnailHeight;
  /** Scroll / Slide modes only: an optional frame drawn around each screen. */
  frameColor: PortfolioWorkProjectsDuotoneFrameColor;
  frameRadius: PortfolioWorkProjectsDuotoneFrameRadius;
  /** Slide mode only. */
  slideNavStyle: PortfolioWorkProjectsDuotoneSlideNavStyle;
  /** Slide mode only — advance every 5s, paused while the frame is hovered. */
  autoAdvance: boolean;
  /** Sticky / Scroll: swap which side the thumbnail column renders on. */
  swapSides: boolean;
  /** Scroll mode only: alternate sides every other project. */
  alternateSides: boolean;
  /** Scroll mode only: title spans both columns above thumbnail + details. */
  scrollFullWidthTitle: boolean;
  /** Sticky / Scroll: vertical air between title / media / details blocks. */
  verticalGap: PortfolioWorkProjectsDuotoneVerticalGap;
};

export const DEFAULT_PROJECTS_DUOTONE_SETTINGS: PortfolioWorkProjectsDuotoneSettings = {
  scrollMode: 'sticky',
  showIntro: false,
  thumbnailEffect: 'grayscale',
  thumbnailHeight: 'md',
  frameColor: 'none',
  frameRadius: 'sm',
  slideNavStyle: 'chevron',
  autoAdvance: false,
  swapSides: false,
  alternateSides: false,
  scrollFullWidthTitle: false,
  verticalGap: 'md',
};

export function mergeProjectsDuotoneSettings(
  base: PortfolioWorkProjectsDuotoneSettings,
  patch: unknown
): PortfolioWorkProjectsDuotoneSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    scrollMode:
      record.scrollMode === 'sticky' || record.scrollMode === 'scroll' || record.scrollMode === 'slide'
        ? record.scrollMode
        : base.scrollMode,
    showIntro: typeof record.showIntro === 'boolean' ? record.showIntro : base.showIntro,
    thumbnailEffect:
      record.thumbnailEffect === 'grayscale' ||
      record.thumbnailEffect === 'tint' ||
      record.thumbnailEffect === 'none'
        ? record.thumbnailEffect
        : base.thumbnailEffect,
    thumbnailHeight:
      record.thumbnailHeight === 'sm' || record.thumbnailHeight === 'md' || record.thumbnailHeight === 'lg'
        ? record.thumbnailHeight
        : base.thumbnailHeight,
    frameColor:
      record.frameColor === 'none' || record.frameColor === 'neutral' || record.frameColor === 'muted'
        ? record.frameColor
        : base.frameColor,
    frameRadius:
      record.frameRadius === 'none' || record.frameRadius === 'sm' || record.frameRadius === 'lg'
        ? record.frameRadius
        : base.frameRadius,
    slideNavStyle:
      record.slideNavStyle === 'chevron' || record.slideNavStyle === 'text'
        ? record.slideNavStyle
        : base.slideNavStyle,
    autoAdvance: typeof record.autoAdvance === 'boolean' ? record.autoAdvance : base.autoAdvance,
    swapSides: typeof record.swapSides === 'boolean' ? record.swapSides : base.swapSides,
    alternateSides:
      typeof record.alternateSides === 'boolean' ? record.alternateSides : base.alternateSides,
    scrollFullWidthTitle:
      typeof record.scrollFullWidthTitle === 'boolean'
        ? record.scrollFullWidthTitle
        : base.scrollFullWidthTitle,
    verticalGap:
      record.verticalGap === 'sm' ||
      record.verticalGap === 'md' ||
      record.verticalGap === 'lg' ||
      record.verticalGap === 'xl'
        ? record.verticalGap
        : base.verticalGap,
  };
}

/** Options that apply only when `sectionDesign === 'projects-cascade'`. */
export type PortfolioWorkProjectsCascadeStackEffect = 'cascade' | 'static';
export type PortfolioWorkProjectsCascadeCardWidth = 'small' | 'medium' | 'full';
export type PortfolioWorkProjectsCascadeVerticalGap = 'sm' | 'md' | 'lg';
export type PortfolioWorkProjectsCascadeImageRadius = 'none' | 'md' | 'xl';
export type PortfolioWorkProjectsCascadeCardHeight = 'compact' | 'standard' | 'tall' | 'xl';

export type PortfolioWorkProjectsCascadeSettings = {
  /** Same stacking-cards scroll effect as Experience → Cards: cascade (sticky, full-cover,
   *  depth recede) vs. static (plain vertical stack, no pinning). */
  stackEffect: PortfolioWorkProjectsCascadeStackEffect;
  /** Stretch every card to the tallest one's height (min-height, JS-measured). */
  equalHeight: boolean;
  cardWidth: PortfolioWorkProjectsCascadeCardWidth;
  verticalGap: PortfolioWorkProjectsCascadeVerticalGap;
  imageRadius: PortfolioWorkProjectsCascadeImageRadius;
  /** Minimum card height on desktop (drives thumbnail height via items-stretch). */
  cardHeight: PortfolioWorkProjectsCascadeCardHeight;
  showCategory: boolean;
  showRole: boolean;
  showDescription: boolean;
  showTags: boolean;
  showTools: boolean;
  showLink: boolean;
  linkLabel: string;
};

export const DEFAULT_PROJECTS_CASCADE_SETTINGS: PortfolioWorkProjectsCascadeSettings = {
  stackEffect: 'cascade',
  equalHeight: false,
  cardWidth: 'full',
  verticalGap: 'md',
  imageRadius: 'md',
  cardHeight: 'tall',
  showCategory: true,
  showRole: true,
  showDescription: true,
  showTags: true,
  showTools: true,
  showLink: true,
  linkLabel: 'View project',
};

export function mergeProjectsCascadeSettings(
  base: PortfolioWorkProjectsCascadeSettings,
  patch: unknown
): PortfolioWorkProjectsCascadeSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    stackEffect:
      record.stackEffect === 'cascade' || record.stackEffect === 'static'
        ? record.stackEffect
        : base.stackEffect,
    equalHeight: typeof record.equalHeight === 'boolean' ? record.equalHeight : base.equalHeight,
    cardWidth:
      record.cardWidth === 'small' || record.cardWidth === 'medium' || record.cardWidth === 'full'
        ? record.cardWidth
        : base.cardWidth,
    verticalGap:
      record.verticalGap === 'sm' || record.verticalGap === 'md' || record.verticalGap === 'lg'
        ? record.verticalGap
        : base.verticalGap,
    imageRadius:
      record.imageRadius === 'none' || record.imageRadius === 'md' || record.imageRadius === 'xl'
        ? record.imageRadius
        : base.imageRadius,
    cardHeight:
      record.cardHeight === 'compact' ||
      record.cardHeight === 'standard' ||
      record.cardHeight === 'tall' ||
      record.cardHeight === 'xl'
        ? record.cardHeight
        : base.cardHeight,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showTags: typeof record.showTags === 'boolean' ? record.showTags : base.showTags,
    showTools: typeof record.showTools === 'boolean' ? record.showTools : base.showTools,
    showLink: typeof record.showLink === 'boolean' ? record.showLink : base.showLink,
    linkLabel:
      typeof record.linkLabel === 'string' && record.linkLabel.trim()
        ? record.linkLabel.trim()
        : base.linkLabel,
  };
}

export const PORTFOLIO_WORK_CASCADE_STACK_EFFECT_OPTIONS: {
  value: PortfolioWorkProjectsCascadeStackEffect;
  label: string;
  description: string;
}[] = [
  { value: 'cascade', label: 'Cascade', description: 'Stacked sticky cards, each covering the previous one while scrolling.' },
  { value: 'static', label: 'Static', description: 'Simple vertical stack, no scroll effect.' },
];

export const PORTFOLIO_WORK_CASCADE_CARD_WIDTH_OPTIONS: {
  value: PortfolioWorkProjectsCascadeCardWidth;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Narrow', description: 'Tighter column.' },
  { value: 'medium', label: 'Medium', description: 'Intermediate width.' },
  { value: 'full', label: 'Full', description: 'Full width — default.' },
];

export const PORTFOLIO_WORK_CASCADE_VERTICAL_GAP_OPTIONS: {
  value: PortfolioWorkProjectsCascadeVerticalGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Tight', description: 'More compact rhythm.' },
  { value: 'md', label: 'Medium', description: 'Balanced spacing — default.' },
  { value: 'lg', label: 'Large', description: 'More air between cards.' },
];

export const PORTFOLIO_WORK_CASCADE_IMAGE_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsCascadeImageRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Sharp corners.' },
  { value: 'md', label: 'Medium', description: 'Slightly rounded corners — default.' },
  { value: 'xl', label: 'Large', description: 'Well-rounded corners.' },
];

export const PORTFOLIO_WORK_CASCADE_CARD_HEIGHT_OPTIONS: {
  value: PortfolioWorkProjectsCascadeCardHeight;
  label: string;
  description: string;
}[] = [
  { value: 'compact', label: 'Compact', description: 'Shorter card, smaller thumbnail.' },
  { value: 'standard', label: 'Standard', description: 'Balanced height.' },
  { value: 'tall', label: 'Tall', description: 'Larger thumbnail — default.' },
  { value: 'xl', label: 'Extra tall', description: 'Maximum card height, imposing thumbnail.' },
];

export const PORTFOLIO_WORK_DUOTONE_SCROLL_MODE_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneScrollMode;
  label: string;
  description: string;
}[] = [
  { value: 'sticky', label: 'Sticky', description: 'Story panel pinned, crossfades as you scroll the list.' },
  { value: 'scroll', label: 'Scroll', description: 'Plain stack — no pinning, everything scrolls together.' },
  { value: 'slide', label: 'Slide', description: 'One project at a time, chevron-navigated.' },
];

export const PORTFOLIO_WORK_DUOTONE_THUMBNAIL_EFFECT_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneThumbnailEffect;
  label: string;
  description: string;
}[] = [
  { value: 'grayscale', label: 'Grayscale', description: 'Desaturated thumbnail — the classic duotone look.' },
  { value: 'tint', label: 'Tint', description: 'Grayscale with an accent-color wash on top.' },
  { value: 'none', label: 'None', description: 'Full-color thumbnail, no filter.' },
];

export const PORTFOLIO_WORK_DUOTONE_THUMBNAIL_HEIGHT_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneThumbnailHeight;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Petite', description: 'Ratio 16:9, plus compacte.' },
  { value: 'md', label: 'Moyenne', description: 'Ratio 4:3 — défaut.' },
  { value: 'lg', label: 'Grande', description: 'Ratio carré 1:1.' },
];

export const PORTFOLIO_WORK_DUOTONE_FRAME_COLOR_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneFrameColor;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de cadre — Scroll et Slide uniquement.' },
  { value: 'neutral', label: 'Neutre', description: 'Cadre discret basé sur la bordure.' },
  { value: 'muted', label: 'Atténué', description: 'Cadre basé sur la couleur muted.' },
];

export const PORTFOLIO_WORK_DUOTONE_FRAME_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneFrameRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Carré', description: 'Coins droits.' },
  { value: 'sm', label: 'Léger', description: 'Arrondi discret — défaut.' },
  { value: 'lg', label: 'Large', description: 'Arrondi prononcé.' },
];

export const PORTFOLIO_WORK_DUOTONE_SLIDE_NAV_STYLE_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneSlideNavStyle;
  label: string;
  description: string;
}[] = [
  { value: 'chevron', label: 'Flèches', description: 'Boutons ronds précédent / suivant.' },
  { value: 'text', label: 'Texte', description: 'Liens texte "Previous" / "Next".' },
];

export const PORTFOLIO_WORK_DUOTONE_VERTICAL_GAP_OPTIONS: {
  value: PortfolioWorkProjectsDuotoneVerticalGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Serré', description: 'Rythme plus compact.' },
  { value: 'md', label: 'Moyen', description: 'Espacement équilibré — défaut.' },
  { value: 'lg', label: 'Grand', description: 'Plus d’air entre les éléments.' },
  { value: 'xl', label: 'Très grand', description: 'Respiration maximale.' },
];

export const PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS: {
  value: PortfolioWorkProjectsCaseSettings['thumbnailHeight'];
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Petite', description: 'Hauteur réduite.' },
  { value: 'md', label: 'Moyenne', description: 'Hauteur moyenne.' },
  { value: 'lg', label: 'Grande', description: 'Miniature plus haute.' },
  { value: 'xl', label: 'Très grande', description: 'Hauteur maximale (défaut).' },
];

export const PORTFOLIO_WORK_SPEC_FRAME_OPTIONS: {
  value: PortfolioWorkProjectsSpecSettings['sheetFrame'];
  label: string;
  description: string;
}[] = [
  {
    value: 'none',
    label: 'Aucun',
    description: 'Pas de cadre (défaut).',
  },
  {
    value: 'thin',
    label: 'Fin',
    description: 'Trait fin (token bordure carte).',
  },
  {
    value: 'solid',
    label: 'Solid',
    description: 'Cadre plus marqué autour de la fiche.',
  },
  {
    value: 'accent',
    label: 'Accent',
    description: 'Cadre couleur CTA / accent.',
  },
];

export const PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS: {
  value: '1' | '2';
  label: string;
  description: string;
}[] = [
  {
    value: '1',
    label: '1 par ligne',
    description: 'Fiche pleine largeur (défaut).',
  },
  {
    value: '2',
    label: '2 par ligne',
    description: '2 colonnes en grand écran + titre réduit + gap horizontal.',
  },
];

export const PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS: {
  value: PortfolioWorkProjectsSpecSettings['sheetGap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'Serré', description: 'Compact, un peu plus d’air qu’avant.' },
  { value: 'md', label: 'Moyen', description: 'Espacement généreux entre fiches.' },
  { value: 'xl', label: 'Large', description: 'Très aéré (défaut).' },
  { value: '2xl', label: 'Très large', description: 'Espacement maximal, lecture lente.' },
];

export const PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS: {
  value: PortfolioWorkProjectsSpecConsultDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'bracket',
    label: 'Bracket',
    description: 'Mono [ Consult → ] — style Framer (défaut).',
  },
  {
    value: 'link',
    label: 'Link',
    description: 'Lien texte + flèche ↗ dans la grille.',
  },
  {
    value: 'underline',
    label: 'Underline',
    description: 'Texte souligné animé, sans flèche.',
  },
  {
    value: 'footer',
    label: 'Footer',
    description: 'CTA sous la fiche, hors grille label/valeur.',
  },
  {
    value: 'pill',
    label: 'Pill',
    description: 'Bouton pastille rempli (accent).',
  },
  {
    value: 'outline',
    label: 'Outline',
    description: 'Bouton bordure seule.',
  },
  {
    value: 'ghost',
    label: 'Ghost',
    description: 'Fond soft teinté, sans bordure forte.',
  },
  {
    value: 'solid',
    label: 'Solid',
    description: 'Bouton plein token titre / tools (pas CTA).',
  },
];

export const PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS: {
  value: PortfolioWorkProjectsLedgerExpandMode;
  label: string;
  description: string;
}[] = [
  {
    value: 'hover',
    label: 'Hover',
    description: 'Détails au survol (desktop) — Framer index style.',
  },
  {
    value: 'click',
    label: 'Click',
    description: 'Ouvre / ferme au clic — idéal mobile.',
  },
  {
    value: 'always',
    label: 'Always open',
    description: 'Description et stack toujours visibles sous chaque titre.',
  },
];

export const PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS: {
  value: PortfolioWorkSectionDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'projects-board',
    label: 'Projects board',
    description: 'Asymmetric two-up cards — thumbnail, big title, description, tags and a case-study link at the bottom.',
  },
  {
    value: 'projects-accordion',
    label: 'Accordion',
    description: 'Accordion + large preview — swap columns, role/category, Consult text link.',
  },
  {
    value: 'projects-frames',
    label: 'Frames',
    description: 'Horizontal frames — image left, info right, stack as plain text (not tags).',
  },
  {
    value: 'projects-index',
    label: 'Index',
    description:
      'Cinematic full-bleed scenes — one project fills the screen, scroll-scrubbed curtain wipe, reactive backdrop, magnetic cursor.',
  },
  {
    value: 'projects-grid',
    label: 'Grid',
    description: 'Thumbnail cards — title + description, 2 or 3 per row on large screens.',
  },
  {
    value: 'projects-split',
    label: 'Split',
    description: 'Large thumbnail beside a top-aligned title — sides and zigzag configurable.',
  },
  {
    value: 'projects-carousel',
    label: 'Carousel',
    description:
      'Horizontal drag carousel — hover a slide for a frosted dark veil with a staggered text reveal.',
  },
  {
    value: 'projects-showcase',
    label: 'Showcase',
    description:
      'Large media + details — chevrons and three thumbnails to switch the active project.',
  },
  {
    value: 'projects-ledger',
    label: 'Ledger',
    description:
      'Index typographique Framer — lignes, titres, rôle, détails au survol. Données seulement, sans miniature.',
  },
  {
    value: 'projects-spec',
    label: 'Spec',
    description:
      'Editorial datasheet — clean and textual at rest; hovering a title reveals a floating cursor-tracking image.',
  },
  {
    value: 'projects-case',
    label: 'Case',
    description: 'Grande miniature 50/50 à gauche + fiche Spec à droite.',
  },
  {
    value: 'projects-press',
    label: 'Press',
    description: 'Newsroom feed — thumbnail rows with just a role, category, and title.',
  },
  {
    value: 'projects-duotone',
    label: 'Duotone',
    description: 'One project per screen, split 50/50 — details on one side, a framed thumbnail on the other. Sticky, Scroll, or Slide.',
  },
  {
    value: 'projects-cascade',
    label: 'Cascade',
    description:
      "Same stacking-cards scroll effect as Experience — full-cover sticky cards receding behind each other — with each project's thumbnail beside the text.",
  },
];

/** Header designs — applied from Header, independent of the project layout chosen in Design. */
export const PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS: {
  value: PortfolioWorkHeaderDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Kicker + masked line-reveal title + subtitle — premium GSAP entrance.',
  },
  {
    value: 'marquee',
    label: 'Marquee',
    description: 'Bold title over a scrolling decorative word band.',
  },
  {
    value: 'index',
    label: 'Index',
    description: 'Ledger-style divider rule, a counting project-count numeral, and the title split by a vertical rule.',
  },
  {
    value: 'accent-count',
    label: 'Accent count',
    description: 'Small accent badge with the project count, lead line, and title.',
  },
  {
    value: 'serif-lead',
    label: 'Serif lead',
    description: 'Small label above a large serif title.',
  },
  {
    value: 'billboard',
    label: 'Billboard',
    description: 'Big faint background word behind the title, with a project-count line.',
  },
  {
    value: 'masthead',
    label: 'Masthead',
    description: 'Monumental uppercase headline with an intro line underneath.',
  },
  {
    value: 'split-heading',
    label: 'Split heading',
    description: 'Title left with an editorial italic word, small label top-right.',
  },
];

export const PORTFOLIO_WORK_ACCORDION_ALIGN_OPTIONS: {
  value: PortfolioWorkProjectsAccordionSettings['headerAlign'];
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Title and subtitle align left.' },
  { value: 'center', label: 'Center', description: 'Title and subtitle centered (default).' },
  { value: 'right', label: 'Right', description: 'Title and subtitle align right.' },
];

export const PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS: {
  value: PortfolioWorkProjectsAccordionSettings['previewSide'];
  label: string;
  description: string;
}[] = [
  {
    value: 'right',
    label: 'Preview right',
    description: 'Accordion list on the left, large image on the right.',
  },
  {
    value: 'left',
    label: 'Preview left',
    description: 'Large image on the left, accordion list on the right.',
  },
];

/** Settings bundled when picking a named section design. */
export function workSectionDesignSettingsPatch(
  sectionDesign: PortfolioWorkSectionDesign
): Partial<PortfolioWorkPresentationSettings> {
  if (sectionDesign === 'projects-board') {
    return {
      sectionDesign,
      galleryLayout: 'grid',
      itemsPerRow: 2,
      cardDesign: 'minimal',
      showCardMedia: false,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'bottom',
      cardMaxWidth: 'full',
      cardBorder: 'soft',
      cardShadow: 'none',
      cardBackgroundEnabled: true,
      cardBorderRadius: 'lg',
      cardPadding: 'lg',
      cardGap: 'md',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsBoard: { ...DEFAULT_PROJECTS_BOARD_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-accordion') {
    return {
      sectionDesign,
      galleryLayout: 'accordion',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'soft',
      cardShadow: 'none',
      cardBackgroundEnabled: true,
      cardBorderRadius: 'xl',
      cardPadding: 'lg',
      cardGap: 'md',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsAccordion: { ...DEFAULT_PROJECTS_ACCORDION_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-frames') {
    return {
      sectionDesign,
      galleryLayout: 'stack',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: true,
      cardBorderRadius: 'xl',
      cardPadding: 'md',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'center',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsFrames: { ...DEFAULT_PROJECTS_FRAMES_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-index') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: false,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'bottom',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'md',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsIndex: { ...DEFAULT_PROJECTS_INDEX_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-grid') {
    return {
      sectionDesign,
      galleryLayout: 'grid',
      itemsPerRow: 2,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'bottom',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'lg',
      cardPadding: 'md',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: false,
      showCardToolIcons: false,
      showCardToolList: false,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsGrid: { ...DEFAULT_PROJECTS_GRID_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-split') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: false,
      showCardTools: false,
      showCardToolIcons: false,
      showCardToolList: false,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsSplit: { ...DEFAULT_PROJECTS_SPLIT_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-carousel') {
    return {
      sectionDesign,
      galleryLayout: 'carousel',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: false,
      showCardDescription: false,
      showCardTools: false,
      showCardToolIcons: false,
      showCardToolList: false,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      projectsCarousel: { ...DEFAULT_PROJECTS_CAROUSEL_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-showcase') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'xl',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: false,
      showCardToolIcons: false,
      showCardToolList: false,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsShowcase: { ...DEFAULT_PROJECTS_SHOWCASE_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-ledger') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: false,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: true,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsLedger: { ...DEFAULT_PROJECTS_LEDGER_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-spec') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: false,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: true,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsSpec: { ...DEFAULT_PROJECTS_SPEC_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-case') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: true,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsCase: { ...DEFAULT_PROJECTS_CASE_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-press') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'md',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsPress: { ...DEFAULT_PROJECTS_PRESS_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-duotone') {
    return {
      sectionDesign,
      galleryLayout: 'stack',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsDuotone: { ...DEFAULT_PROJECTS_DUOTONE_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-cascade') {
    return {
      sectionDesign,
      galleryLayout: 'stack',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: true,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'none',
      cardShadow: 'none',
      cardBackgroundEnabled: false,
      cardBorderRadius: 'none',
      cardPadding: 'none',
      cardGap: 'lg',
      cardAlignment: 'left',
      cardContentAlignment: 'left',
      cardContentVerticalAlign: 'top',
      showCardTitle: true,
      showCardDescription: true,
      showCardTools: true,
      showCardToolIcons: false,
      showCardToolList: true,
      showToolsLabel: false,
      toolsDisplay: 'list',
      showCardCta: false,
      showCategoryOnCard: true,
      showMarketplaceLink: false,
      projectsCascade: { ...DEFAULT_PROJECTS_CASCADE_SETTINGS },
    };
  }
  return { sectionDesign: DEFAULT_PORTFOLIO_WORK_SECTION_DESIGN };
}

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
  /** Header design applied from Header (above every Design layout, independent of it). */
  headerDesign: PortfolioWorkHeaderDesign;
  /** Master switch for the header's GSAP entrance/scroll motion (respects prefers-reduced-motion regardless). */
  headerAnimationEnabled: boolean;
  headerAlignment: PortfolioWorkHeaderAlignment;
  /** Bottom spacing under every header design — shared across all of them. */
  headerMarginBottom: PortfolioWorkHeaderMarginBottom;
  /** Title size/weight — shared across every header design. */
  headerTitleSize: PortfolioWorkHeaderTitleSize;
  headerTitleWeight: PortfolioWorkHeaderTitleWeight;
  /** Accent count header — badge text supports a {count} token for the project count. */
  accentCountBadgeText: string;
  accentCountLeadText: string;
  /** Accent count header — badge and lead bound to a palette token, independently. */
  accentCountBadgeColor: PortfolioWorkPaletteToken;
  accentCountLeadColor: PortfolioWorkPaletteToken;
  /** Accent count header — one size/weight for the whole line (badge + lead flow together). */
  accentCountSize: PortfolioWorkHeaderTitleSize;
  accentCountWeight: PortfolioWorkHeaderTitleWeight;
  /** Accent count header — its own 3-way alignment (adds "right", unlike the shared control). */
  accentCountAlignment: PortfolioWorkAccentCountAlignment;
  /** Serif lead header — small label above the large serif title. */
  serifLeadLabelText: string;
  /** Serif lead header — the large serif title itself, independent of the section title. */
  serifLeadTitleText: string;
  /** Serif lead header — each element bound to a palette token, independently. */
  serifLeadLabelColor: PortfolioWorkPaletteToken;
  serifLeadTitleColor: PortfolioWorkPaletteToken;
  serifLeadSubtitleColor: PortfolioWorkPaletteToken;
  /** Serif lead header — each element sized/weighted independently. */
  serifLeadLabelSize: PortfolioWorkHeaderTitleSize;
  serifLeadTitleSize: PortfolioWorkHeaderTitleSize;
  serifLeadSubtitleSize: PortfolioWorkHeaderTitleSize;
  serifLeadLabelWeight: PortfolioWorkHeaderTitleWeight;
  serifLeadTitleWeight: PortfolioWorkHeaderTitleWeight;
  serifLeadSubtitleWeight: PortfolioWorkHeaderTitleWeight;
  /** Billboard header — big faint background word + a {count}-token project line. */
  billboardBigWord: string;
  billboardCountText: string;
  /** Billboard header — the editorial split title beneath the big word, independent of the section title. */
  billboardTitleText: string;
  /** Billboard header — outline (stroke only) or fill (solid) big word. */
  billboardWordStyle: PortfolioWorkBillboardWordStyle;
  /** Billboard header — each element bound to a palette token, independently. */
  billboardWordColor: PortfolioWorkPaletteToken;
  billboardTitleColor: PortfolioWorkPaletteToken;
  billboardMetaColor: PortfolioWorkPaletteToken;
  /** Split heading header — small label on the side opposite the narrative title. */
  splitHeadingLabelText: string;
  /** Split heading header — the narrative title itself, independent of the section title. */
  splitHeadingTitleText: string;
  /** Split heading header — each element bound to a palette token, independently. */
  splitHeadingTitleColor: PortfolioWorkPaletteToken;
  splitHeadingLabelColor: PortfolioWorkPaletteToken;
  /** Split heading header — each element sized/weighted independently. */
  splitHeadingTitleSize: PortfolioWorkHeaderTitleSize;
  splitHeadingTitleWeight: PortfolioWorkHeaderTitleWeight;
  splitHeadingLabelSize: PortfolioWorkHeaderTitleSize;
  splitHeadingLabelWeight: PortfolioWorkHeaderTitleWeight;
  /** Masthead header — up to 3 independent lines, monumental headline text,
   *  each stacked into the mast (no more period-splitting a single string). */
  mastheadLine1Text: string;
  mastheadLine2Text: string;
  mastheadLine3Text: string;
  /** Masthead header — one color for the whole headline, across every line. */
  mastheadHeadlineColor: PortfolioWorkPaletteToken;
  /** Masthead header — one size/weight for the whole headline, across every line. */
  mastheadHeadlineSize: PortfolioWorkHeaderTitleSize;
  mastheadHeadlineWeight: PortfolioWorkHeaderTitleWeight;
  /** Index header — small label on the top divider rule (e.g. "Index", "Catalog"). */
  indexLabelText: string;
  /** Index header — the title beside the counting numeral, independent of the section title. */
  indexTitleText: string;
  /** Index header — caption under the counter (e.g. "Projects"). Empty falls back to automatic "Project" / "Projects" pluralization. */
  indexCountLabelText: string;
  /** Index header — the small subtitle under the title, independent of the section subtitle. */
  indexSubtitleText: string;
  /** Index header — each element bound to a palette token, independently. */
  indexLabelColor: PortfolioWorkPaletteToken;
  indexNumberColor: PortfolioWorkPaletteToken;
  indexTitleColor: PortfolioWorkPaletteToken;
  indexSubtitleColor: PortfolioWorkPaletteToken;
  /** Index header — each element sized/weighted independently. */
  indexLabelSize: PortfolioWorkHeaderTitleSize;
  indexLabelWeight: PortfolioWorkHeaderTitleWeight;
  indexTitleSize: PortfolioWorkHeaderTitleSize;
  indexTitleWeight: PortfolioWorkHeaderTitleWeight;
  indexSubtitleSize: PortfolioWorkHeaderTitleSize;
  indexSubtitleWeight: PortfolioWorkHeaderTitleWeight;
  /** Marquee header — up to 4 independent words in the repeating band, each its own field (empty slots are dropped). */
  marqueeWord1Text: string;
  marqueeWord2Text: string;
  marqueeWord3Text: string;
  marqueeWord4Text: string;
  /** Marquee header — alternating fill/outline words bound to one palette token. */
  marqueeWordColor: PortfolioWorkPaletteToken;
  /** Marquee header — scales the repeating word band. */
  marqueeSize: PortfolioWorkHeaderTitleSize;
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
  /** Named Portfolio section design (Settings → Design). */
  sectionDesign: PortfolioWorkSectionDesign;
  /** Projects board–only options (ignored by Classic). */
  projectsBoard: PortfolioWorkProjectsBoardSettings;
  /** Accordion design–only options (ignored by Classic / Projects board). */
  projectsAccordion: PortfolioWorkProjectsAccordionSettings;
  /** Frames design–only options (horizontal image + info cards). */
  projectsFrames: PortfolioWorkProjectsFramesSettings;
  /** Index design–only options (numbered rows + separators). */
  projectsIndex: PortfolioWorkProjectsIndexSettings;
  /** Grid design–only options (thumbnail + title + description cards). */
  projectsGrid: PortfolioWorkProjectsGridSettings;
  /** Split design–only options (large thumbnail left + title right). */
  projectsSplit: PortfolioWorkProjectsSplitSettings;
  /** Carousel design–only options (image-only horizontal slides). */
  projectsCarousel: PortfolioWorkProjectsCarouselSettings;
  /** Showcase design–only options (media + details + thumbnail selector). */
  projectsShowcase: PortfolioWorkProjectsShowcaseSettings;
  /** Ledger design–only options (typographic index rows, data-only). */
  projectsLedger: PortfolioWorkProjectsLedgerSettings;
  /** Spec design–only options (technical datasheet rows, data-only). */
  projectsSpec: PortfolioWorkProjectsSpecSettings;
  /** Case design–only options (50/50 thumbnail + Spec datasheet). */
  projectsCase: PortfolioWorkProjectsCaseSettings;
  /** Press design–only options (newsroom feed — intro blurb + thumbnail radius). */
  projectsPress: PortfolioWorkProjectsPressSettings;
  /** Duotone design–only options (split 50/50, sticky/scroll/slide). */
  projectsDuotone: PortfolioWorkProjectsDuotoneSettings;
  /** Cascade design–only options (Experience Cards stacking scroll effect + thumbnail). */
  projectsCascade: PortfolioWorkProjectsCascadeSettings;
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
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
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
  headerDesign: 'editorial',
  headerAnimationEnabled: true,
  headerAlignment: 'left',
  headerMarginBottom: 'md',
  headerTitleSize: 'md',
  headerTitleWeight: 'regular',
  accentCountBadgeText: '',
  accentCountLeadText: '',
  accentCountBadgeColor: 'principal',
  accentCountLeadColor: 'secondaire',
  accentCountSize: 'md',
  accentCountWeight: 'regular',
  accentCountAlignment: 'left',
  serifLeadLabelText: '',
  serifLeadTitleText: '',
  serifLeadLabelColor: 'texteFort',
  serifLeadTitleColor: 'texteFort',
  serifLeadSubtitleColor: 'texteFort',
  serifLeadLabelSize: 'md',
  serifLeadTitleSize: 'md',
  serifLeadSubtitleSize: 'md',
  serifLeadLabelWeight: 'regular',
  serifLeadTitleWeight: 'regular',
  serifLeadSubtitleWeight: 'regular',
  billboardBigWord: '',
  billboardCountText: '',
  billboardTitleText: '',
  billboardWordStyle: 'outline',
  billboardWordColor: 'principal',
  billboardTitleColor: 'principal',
  billboardMetaColor: 'secondaire',
  splitHeadingLabelText: '',
  splitHeadingTitleText: '',
  splitHeadingTitleColor: 'principal',
  splitHeadingLabelColor: 'secondaire',
  splitHeadingTitleSize: 'md',
  splitHeadingTitleWeight: 'regular',
  splitHeadingLabelSize: 'md',
  splitHeadingLabelWeight: 'regular',
  mastheadLine1Text: '',
  mastheadLine2Text: '',
  mastheadLine3Text: '',
  mastheadHeadlineColor: 'principal',
  mastheadHeadlineSize: 'md',
  mastheadHeadlineWeight: 'regular',
  indexLabelText: '',
  indexTitleText: '',
  indexCountLabelText: '',
  indexSubtitleText: '',
  indexLabelColor: 'texteFort',
  indexNumberColor: 'principal',
  indexTitleColor: 'texteFort',
  indexSubtitleColor: 'texteFort',
  indexLabelSize: 'md',
  indexLabelWeight: 'regular',
  indexTitleSize: 'md',
  indexTitleWeight: 'regular',
  indexSubtitleSize: 'md',
  indexSubtitleWeight: 'regular',
  marqueeWord1Text: '',
  marqueeWord2Text: '',
  marqueeWord3Text: '',
  marqueeWord4Text: '',
  marqueeWordColor: 'principal',
  marqueeSize: 'md',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  contentPlacement: 'side',
  galleryLayout: 'stack',
  sectionDesign: DEFAULT_PORTFOLIO_WORK_SECTION_DESIGN,
  projectsBoard: { ...DEFAULT_PROJECTS_BOARD_SETTINGS },
  projectsAccordion: { ...DEFAULT_PROJECTS_ACCORDION_SETTINGS },
  projectsFrames: { ...DEFAULT_PROJECTS_FRAMES_SETTINGS },
  projectsIndex: { ...DEFAULT_PROJECTS_INDEX_SETTINGS },
  projectsGrid: { ...DEFAULT_PROJECTS_GRID_SETTINGS },
  projectsSplit: { ...DEFAULT_PROJECTS_SPLIT_SETTINGS },
  projectsCarousel: { ...DEFAULT_PROJECTS_CAROUSEL_SETTINGS },
  projectsShowcase: { ...DEFAULT_PROJECTS_SHOWCASE_SETTINGS },
  projectsLedger: { ...DEFAULT_PROJECTS_LEDGER_SETTINGS },
  projectsSpec: { ...DEFAULT_PROJECTS_SPEC_SETTINGS },
  projectsCase: { ...DEFAULT_PROJECTS_CASE_SETTINGS },
  projectsPress: { ...DEFAULT_PROJECTS_PRESS_SETTINGS },
  projectsDuotone: { ...DEFAULT_PROJECTS_DUOTONE_SETTINGS },
  projectsCascade: { ...DEFAULT_PROJECTS_CASCADE_SETTINGS },
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
  colorModeOverride: 'auto',
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
export const WORK_HEADER_DESIGNS = [
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
] as const;
export const WORK_HEADER_MARGIN_BOTTOM_STEPS = ['sm', 'md', 'lg', 'xl'] as const;
export const WORK_HEADER_TITLE_SIZES = ['sm', 'md', 'lg', 'xl'] as const;
export const WORK_HEADER_TITLE_WEIGHTS = ['light', 'regular', 'semibold', 'bold'] as const;
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
    label: 'Stacked',
    description: 'Title above, gallery below.',
  },
  {
    value: 'aside-left',
    label: 'Title left',
    description: 'Title on the left, gallery on the right (side by side).',
  },
  {
    value: 'aside-right',
    label: 'Title right',
    description: 'Gallery on the left, title on the right (side by side).',
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
  short: 'Selected projects.',
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

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  no ad-hoc CTA/accent field, every header element bound to one of our
 *  actual palette colors. */
export function workPaletteTokenColor(token: PortfolioWorkPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}

export const WORK_PALETTE_TOKENS = ['principal', 'secondaire', 'texteFort'] as const;

export const WORK_PALETTE_TOKEN_OPTIONS: {
  value: PortfolioWorkPaletteToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Global principal token.' },
  { value: 'secondaire', label: 'Secondary', description: 'Global secondary token.' },
  { value: 'texteFort', label: 'Strong text', description: 'Strong ink token.' },
];

export const WORK_ACCENT_COUNT_ALIGNMENTS = ['left', 'center', 'right'] as const;

export const WORK_ACCENT_COUNT_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkAccentCountAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default editorial alignment.' },
  { value: 'center', label: 'Center', description: 'Centered line.' },
  { value: 'right', label: 'Right', description: 'Right-aligned line.' },
];

export const WORK_BILLBOARD_WORD_STYLES = ['outline', 'fill', 'simple'] as const;

export const WORK_BILLBOARD_WORD_STYLE_OPTIONS: {
  value: PortfolioWorkBillboardWordStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: 'Outline', description: 'Stroke only, with a soft glow.' },
  { value: 'fill', label: 'Fill', description: 'Solid characters, with a soft glow.' },
  { value: 'simple', label: 'Simple', description: 'Solid characters, no glow — plain.' },
];

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
  const sectionDesign = record.sectionDesign;
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
    headerDesign: pickAllowlisted(
      record.headerDesign,
      WORK_HEADER_DESIGNS,
      base.headerDesign ?? 'editorial'
    ),
    headerAnimationEnabled:
      typeof record.headerAnimationEnabled === 'boolean'
        ? record.headerAnimationEnabled
        : (base.headerAnimationEnabled ?? true),
    headerAlignment:
      headerAlignment === 'left' || headerAlignment === 'center' || headerAlignment === 'right'
        ? headerAlignment
        : base.headerAlignment,
    headerMarginBottom: pickAllowlisted(
      record.headerMarginBottom,
      WORK_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pickAllowlisted(
      record.headerTitleSize,
      WORK_HEADER_TITLE_SIZES,
      base.headerTitleSize ?? 'md'
    ),
    headerTitleWeight: pickAllowlisted(
      record.headerTitleWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.headerTitleWeight ?? 'regular'
    ),
    accentCountBadgeText:
      typeof record.accentCountBadgeText === 'string' ? record.accentCountBadgeText : base.accentCountBadgeText,
    accentCountLeadText:
      typeof record.accentCountLeadText === 'string' ? record.accentCountLeadText : base.accentCountLeadText,
    accentCountBadgeColor: pickAllowlisted(
      record.accentCountBadgeColor,
      WORK_PALETTE_TOKENS,
      base.accentCountBadgeColor ?? 'principal'
    ),
    accentCountLeadColor: pickAllowlisted(
      record.accentCountLeadColor,
      WORK_PALETTE_TOKENS,
      base.accentCountLeadColor ?? 'secondaire'
    ),
    accentCountSize: pickAllowlisted(
      record.accentCountSize,
      WORK_HEADER_TITLE_SIZES,
      base.accentCountSize ?? 'md'
    ),
    accentCountWeight: pickAllowlisted(
      record.accentCountWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.accentCountWeight ?? 'regular'
    ),
    accentCountAlignment: pickAllowlisted(
      record.accentCountAlignment,
      WORK_ACCENT_COUNT_ALIGNMENTS,
      base.accentCountAlignment ?? 'left'
    ),
    serifLeadLabelText:
      typeof record.serifLeadLabelText === 'string' ? record.serifLeadLabelText : base.serifLeadLabelText,
    serifLeadTitleText:
      typeof record.serifLeadTitleText === 'string' ? record.serifLeadTitleText : base.serifLeadTitleText,
    serifLeadLabelColor: pickAllowlisted(
      record.serifLeadLabelColor,
      WORK_PALETTE_TOKENS,
      base.serifLeadLabelColor ?? 'texteFort'
    ),
    serifLeadTitleColor: pickAllowlisted(
      record.serifLeadTitleColor,
      WORK_PALETTE_TOKENS,
      base.serifLeadTitleColor ?? 'texteFort'
    ),
    serifLeadSubtitleColor: pickAllowlisted(
      record.serifLeadSubtitleColor,
      WORK_PALETTE_TOKENS,
      base.serifLeadSubtitleColor ?? 'texteFort'
    ),
    serifLeadLabelSize: pickAllowlisted(
      record.serifLeadLabelSize,
      WORK_HEADER_TITLE_SIZES,
      base.serifLeadLabelSize ?? 'md'
    ),
    serifLeadTitleSize: pickAllowlisted(
      record.serifLeadTitleSize,
      WORK_HEADER_TITLE_SIZES,
      base.serifLeadTitleSize ?? 'md'
    ),
    serifLeadSubtitleSize: pickAllowlisted(
      record.serifLeadSubtitleSize,
      WORK_HEADER_TITLE_SIZES,
      base.serifLeadSubtitleSize ?? 'md'
    ),
    serifLeadLabelWeight: pickAllowlisted(
      record.serifLeadLabelWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.serifLeadLabelWeight ?? 'regular'
    ),
    serifLeadTitleWeight: pickAllowlisted(
      record.serifLeadTitleWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.serifLeadTitleWeight ?? 'regular'
    ),
    serifLeadSubtitleWeight: pickAllowlisted(
      record.serifLeadSubtitleWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.serifLeadSubtitleWeight ?? 'regular'
    ),
    billboardBigWord:
      typeof record.billboardBigWord === 'string' ? record.billboardBigWord : base.billboardBigWord,
    billboardCountText:
      typeof record.billboardCountText === 'string' ? record.billboardCountText : base.billboardCountText,
    billboardTitleText:
      typeof record.billboardTitleText === 'string' ? record.billboardTitleText : base.billboardTitleText,
    billboardWordStyle: pickAllowlisted(
      record.billboardWordStyle,
      WORK_BILLBOARD_WORD_STYLES,
      base.billboardWordStyle ?? 'outline'
    ),
    billboardWordColor: pickAllowlisted(
      record.billboardWordColor,
      WORK_PALETTE_TOKENS,
      base.billboardWordColor ?? 'principal'
    ),
    billboardTitleColor: pickAllowlisted(
      record.billboardTitleColor,
      WORK_PALETTE_TOKENS,
      base.billboardTitleColor ?? 'principal'
    ),
    billboardMetaColor: pickAllowlisted(
      record.billboardMetaColor,
      WORK_PALETTE_TOKENS,
      base.billboardMetaColor ?? 'secondaire'
    ),
    splitHeadingLabelText:
      typeof record.splitHeadingLabelText === 'string' ? record.splitHeadingLabelText : base.splitHeadingLabelText,
    splitHeadingTitleText:
      typeof record.splitHeadingTitleText === 'string' ? record.splitHeadingTitleText : base.splitHeadingTitleText,
    splitHeadingTitleColor: pickAllowlisted(
      record.splitHeadingTitleColor,
      WORK_PALETTE_TOKENS,
      base.splitHeadingTitleColor ?? 'principal'
    ),
    splitHeadingLabelColor: pickAllowlisted(
      record.splitHeadingLabelColor,
      WORK_PALETTE_TOKENS,
      base.splitHeadingLabelColor ?? 'secondaire'
    ),
    splitHeadingTitleSize: pickAllowlisted(
      record.splitHeadingTitleSize,
      WORK_HEADER_TITLE_SIZES,
      base.splitHeadingTitleSize ?? 'md'
    ),
    splitHeadingTitleWeight: pickAllowlisted(
      record.splitHeadingTitleWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.splitHeadingTitleWeight ?? 'regular'
    ),
    splitHeadingLabelSize: pickAllowlisted(
      record.splitHeadingLabelSize,
      WORK_HEADER_TITLE_SIZES,
      base.splitHeadingLabelSize ?? 'md'
    ),
    splitHeadingLabelWeight: pickAllowlisted(
      record.splitHeadingLabelWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.splitHeadingLabelWeight ?? 'regular'
    ),
    mastheadLine1Text:
      typeof record.mastheadLine1Text === 'string' ? record.mastheadLine1Text : base.mastheadLine1Text,
    mastheadLine2Text:
      typeof record.mastheadLine2Text === 'string' ? record.mastheadLine2Text : base.mastheadLine2Text,
    mastheadLine3Text:
      typeof record.mastheadLine3Text === 'string' ? record.mastheadLine3Text : base.mastheadLine3Text,
    mastheadHeadlineColor: pickAllowlisted(
      record.mastheadHeadlineColor,
      WORK_PALETTE_TOKENS,
      base.mastheadHeadlineColor ?? 'principal'
    ),
    mastheadHeadlineSize: pickAllowlisted(
      record.mastheadHeadlineSize,
      WORK_HEADER_TITLE_SIZES,
      base.mastheadHeadlineSize ?? 'md'
    ),
    mastheadHeadlineWeight: pickAllowlisted(
      record.mastheadHeadlineWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.mastheadHeadlineWeight ?? 'regular'
    ),
    indexLabelText:
      typeof record.indexLabelText === 'string' ? record.indexLabelText : base.indexLabelText,
    indexTitleText:
      typeof record.indexTitleText === 'string' ? record.indexTitleText : base.indexTitleText,
    indexCountLabelText:
      typeof record.indexCountLabelText === 'string' ? record.indexCountLabelText : base.indexCountLabelText,
    indexSubtitleText:
      typeof record.indexSubtitleText === 'string' ? record.indexSubtitleText : base.indexSubtitleText,
    indexLabelColor: pickAllowlisted(
      record.indexLabelColor,
      WORK_PALETTE_TOKENS,
      base.indexLabelColor ?? 'texteFort'
    ),
    indexNumberColor: pickAllowlisted(
      record.indexNumberColor,
      WORK_PALETTE_TOKENS,
      base.indexNumberColor ?? 'principal'
    ),
    indexTitleColor: pickAllowlisted(
      record.indexTitleColor,
      WORK_PALETTE_TOKENS,
      base.indexTitleColor ?? 'texteFort'
    ),
    indexSubtitleColor: pickAllowlisted(
      record.indexSubtitleColor,
      WORK_PALETTE_TOKENS,
      base.indexSubtitleColor ?? 'texteFort'
    ),
    indexLabelSize: pickAllowlisted(
      record.indexLabelSize,
      WORK_HEADER_TITLE_SIZES,
      base.indexLabelSize ?? 'md'
    ),
    indexLabelWeight: pickAllowlisted(
      record.indexLabelWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.indexLabelWeight ?? 'regular'
    ),
    indexTitleSize: pickAllowlisted(
      record.indexTitleSize,
      WORK_HEADER_TITLE_SIZES,
      base.indexTitleSize ?? 'md'
    ),
    indexTitleWeight: pickAllowlisted(
      record.indexTitleWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.indexTitleWeight ?? 'regular'
    ),
    indexSubtitleSize: pickAllowlisted(
      record.indexSubtitleSize,
      WORK_HEADER_TITLE_SIZES,
      base.indexSubtitleSize ?? 'md'
    ),
    indexSubtitleWeight: pickAllowlisted(
      record.indexSubtitleWeight,
      WORK_HEADER_TITLE_WEIGHTS,
      base.indexSubtitleWeight ?? 'regular'
    ),
    marqueeWord1Text:
      typeof record.marqueeWord1Text === 'string' ? record.marqueeWord1Text : base.marqueeWord1Text,
    marqueeWord2Text:
      typeof record.marqueeWord2Text === 'string' ? record.marqueeWord2Text : base.marqueeWord2Text,
    marqueeWord3Text:
      typeof record.marqueeWord3Text === 'string' ? record.marqueeWord3Text : base.marqueeWord3Text,
    marqueeWord4Text:
      typeof record.marqueeWord4Text === 'string' ? record.marqueeWord4Text : base.marqueeWord4Text,
    marqueeWordColor: pickAllowlisted(
      record.marqueeWordColor,
      WORK_PALETTE_TOKENS,
      base.marqueeWordColor ?? 'principal'
    ),
    marqueeSize: pickAllowlisted(
      record.marqueeSize,
      WORK_HEADER_TITLE_SIZES,
      base.marqueeSize ?? 'md'
    ),
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
    sectionDesign: resolveWorkSectionDesign(sectionDesign ?? base.sectionDesign),
    projectsBoard: mergeProjectsBoardSettings(
      mergeProjectsBoardSettings(DEFAULT_PROJECTS_BOARD_SETTINGS, base.projectsBoard),
      record.projectsBoard
    ),
    projectsAccordion: mergeProjectsAccordionSettings(
      mergeProjectsAccordionSettings(DEFAULT_PROJECTS_ACCORDION_SETTINGS, base.projectsAccordion),
      record.projectsAccordion
    ),
    projectsFrames: mergeProjectsFramesSettings(
      mergeProjectsFramesSettings(DEFAULT_PROJECTS_FRAMES_SETTINGS, base.projectsFrames),
      record.projectsFrames
    ),
    projectsIndex: mergeProjectsIndexSettings(
      mergeProjectsIndexSettings(DEFAULT_PROJECTS_INDEX_SETTINGS, base.projectsIndex),
      record.projectsIndex
    ),
    projectsGrid: mergeProjectsGridSettings(
      mergeProjectsGridSettings(DEFAULT_PROJECTS_GRID_SETTINGS, base.projectsGrid),
      record.projectsGrid
    ),
    projectsSplit: mergeProjectsSplitSettings(
      mergeProjectsSplitSettings(DEFAULT_PROJECTS_SPLIT_SETTINGS, base.projectsSplit),
      record.projectsSplit
    ),
    projectsCarousel: mergeProjectsCarouselSettings(
      mergeProjectsCarouselSettings(DEFAULT_PROJECTS_CAROUSEL_SETTINGS, base.projectsCarousel),
      record.projectsCarousel
    ),
    projectsShowcase: mergeProjectsShowcaseSettings(
      mergeProjectsShowcaseSettings(DEFAULT_PROJECTS_SHOWCASE_SETTINGS, base.projectsShowcase),
      record.projectsShowcase
    ),
    projectsLedger: mergeProjectsLedgerSettings(
      mergeProjectsLedgerSettings(DEFAULT_PROJECTS_LEDGER_SETTINGS, base.projectsLedger),
      record.projectsLedger
    ),
    projectsSpec: mergeProjectsSpecSettings(
      mergeProjectsSpecSettings(DEFAULT_PROJECTS_SPEC_SETTINGS, base.projectsSpec),
      record.projectsSpec
    ),
    projectsCase: mergeProjectsCaseSettings(
      mergeProjectsCaseSettings(DEFAULT_PROJECTS_CASE_SETTINGS, base.projectsCase),
      record.projectsCase
    ),
    projectsPress: mergeProjectsPressSettings(
      mergeProjectsPressSettings(DEFAULT_PROJECTS_PRESS_SETTINGS, base.projectsPress),
      record.projectsPress
    ),
    projectsDuotone: mergeProjectsDuotoneSettings(
      mergeProjectsDuotoneSettings(DEFAULT_PROJECTS_DUOTONE_SETTINGS, base.projectsDuotone),
      record.projectsDuotone
    ),
    projectsCascade: mergeProjectsCascadeSettings(
      mergeProjectsCascadeSettings(DEFAULT_PROJECTS_CASCADE_SETTINGS, base.projectsCascade),
      record.projectsCascade
    ),
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
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
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
