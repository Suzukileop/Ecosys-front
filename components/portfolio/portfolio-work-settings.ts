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
 * `stacked` â€” title above the projects (default).
 * `aside-left` / `aside-right` â€” title beside the gallery on large screens.
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

/** Soft lift around the card â€” independent of border (use for float without outline). */
export type PortfolioWorkCardShadow = 'none' | 'soft' | 'float' | 'deep';

export type PortfolioWorkGalleryLayout =
  | 'stack'
  | 'grid'
  | 'list'
  | 'overlay'
  | 'accordion'
  | 'carousel';

/**
 * Named Portfolio section designs (Settings â†’ Portfolio â†’ Design).
 * `classic` keeps the existing gallery/card controls; presets may lock layout.
 */
export type PortfolioWorkSectionDesign =
  | 'classic'
  | 'projects-board'
  | 'projects-accordion'
  | 'projects-frames'
  | 'projects-index'
  | 'projects-grid'
  | 'projects-split'
  | 'projects-carousel'
  | 'projects-spotlight'
  | 'projects-showcase'
  | 'projects-editorial'
  | 'projects-ledger'
  | 'projects-folio'
  | 'projects-spec'
  | 'projects-case';

/** Options that apply only when `sectionDesign === 'projects-board'`. */
export type PortfolioWorkProjectsBoardSettings = {
  /** Thumbnail above each card. */
  showThumbnail: boolean;
  /** Role label on the left (accent). */
  showRole: boolean;
  /** Category on the same row, right-aligned. */
  showCategory: boolean;
  /** Centered â€œConsultâ€ control on thumbnail hover (uses project link). */
  showConsultOnHover: boolean;
  consultLabel: string;
};

export const DEFAULT_PROJECTS_BOARD_SETTINGS: PortfolioWorkProjectsBoardSettings = {
  showThumbnail: true,
  showRole: true,
  showCategory: true,
  showConsultOnHover: true,
  consultLabel: 'Consult',
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
  return {
    showThumbnail:
      typeof record.showThumbnail === 'boolean' ? record.showThumbnail : base.showThumbnail,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showCategory: typeof record.showCategory === 'boolean' ? record.showCategory : base.showCategory,
    showConsultOnHover:
      typeof record.showConsultOnHover === 'boolean'
        ? record.showConsultOnHover
        : base.showConsultOnHover,
    consultLabel: label,
  };
}

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
  /** Text â€œConsultâ€ link under the preview (uses project link). */
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
  { value: 'xxl', label: 'Huge', description: 'Very large â€” bigger than the previous max.' },
  {
    value: 'half',
    label: 'Two columns',
    description: 'Image and info split evenly â€” 50 / 50.',
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
  { value: 'tight', label: 'SerrÃ©', description: 'Current compact spacing between cards.' },
  { value: 'md', label: 'Moyen', description: 'More vertical breathing room.' },
  { value: 'xl', label: 'TrÃ¨s grand', description: 'Wide vertical gap between each card.' },
];

/** Options that apply only when `sectionDesign === 'projects-index'`. */
export type PortfolioWorkProjectsIndexMarker = 'number' | 'bullet';

export type PortfolioWorkProjectsIndexSettings = {
  showNumber: boolean;
  /** Left column marker â€” padded numbers or list bullet. */
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
  { value: 'number', label: 'NumÃ©rotation', description: '001, 002â€¦ in the left column.' },
  { value: 'bullet', label: 'Puce', description: 'Simple list bullet instead of numbers.' },
];

export const PORTFOLIO_WORK_INDEX_ROW_GAP_OPTIONS: {
  value: PortfolioWorkProjectsIndexSettings['rowGap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'SerrÃ©', description: 'Compact padding above / below each separator.' },
  { value: 'md', label: 'Moyen', description: 'Balanced spacing (default).' },
  { value: 'xl', label: 'TrÃ¨s grand', description: 'Airy space between numbered rows.' },
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
  { value: 'tight', label: 'SerrÃ©', description: 'Compact spacing between rows.' },
  { value: 'md', label: 'Moyen', description: 'Balanced spacing (default).' },
  { value: 'xl', label: 'TrÃ¨s grand', description: 'Airy vertical rhythm.' },
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
    description: 'AlignÃ© en haut avec le bord supÃ©rieur de lâ€™image.',
  },
  {
    value: 'bottom',
    label: 'En bas',
    description: 'AlignÃ© en bas â€” titre au bas du cÃ´tÃ©.',
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
    label: 'Autre cÃ´tÃ©',
    description: 'La description passe de lâ€™autre cÃ´tÃ© de lâ€™image (titre inchangÃ©).',
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
    description: 'Description en haut, de lâ€™autre cÃ´tÃ© de lâ€™image.',
  },
  {
    value: 'bottom',
    label: 'En bas',
    description: 'Description en bas, de lâ€™autre cÃ´tÃ© de lâ€™image.',
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
  { value: 'sm', label: 'Petite', description: 'Images compactes â€” plusieurs visibles Ã  la fois.' },
  { value: 'md', label: 'Moyenne', description: 'Taille Ã©quilibrÃ©e.' },
  { value: 'lg', label: 'Grande', description: 'Image dominante (dÃ©faut).' },
  { value: 'xl', label: 'TrÃ¨s grande', description: 'Presque plein Ã©cran, lÃ©ger aperÃ§u suivant.' },
];

export const PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS: {
  value: PortfolioWorkProjectsCarouselRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'Coins droits (dÃ©faut).' },
  { value: 'md', label: 'Medium', description: 'Coins lÃ©gÃ¨rement arrondis.' },
  { value: 'xl', label: 'Large', description: 'Coins trÃ¨s arrondis.' },
];

export const PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS: {
  value: PortfolioWorkProjectsCarouselAspect;
  label: string;
  description: string;
}[] = [
  { value: 'square', label: 'CarrÃ©', description: 'Format 1:1 (dÃ©faut).' },
  { value: 'landscape', label: 'Paysage', description: 'Format 4:3 horizontal.' },
  { value: 'portrait', label: 'Portrait', description: 'Format 3:4 vertical.' },
];

export const PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS: {
  value: PortfolioWorkProjectsCarouselSettings['gap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'SerrÃ©', description: 'Peu dâ€™espace entre les images.' },
  { value: 'md', label: 'Moyen', description: 'Espacement lisible entre les slides.' },
  { value: 'xl', label: 'Large', description: 'Grand air entre chaque image.' },
];

/** Options that apply only when `sectionDesign === 'projects-spotlight'`. */
export type PortfolioWorkProjectsSpotlightStackStyle = 'tags' | 'hairline' | 'list';

export type PortfolioWorkProjectsSpotlightSettings = {
  /** Title selector list on the left or right (details take the other side). */
  listSide: 'left' | 'right';
  showRole: boolean;
  showDescription: boolean;
  showConsult: boolean;
  consultLabel: string;
  showStack: boolean;
  /** Three stack presentations: pills, hairline row, or vertical list. */
  stackStyle: PortfolioWorkProjectsSpotlightStackStyle;
  /** Fill the outer frame with the card background color. */
  showFrameFill: boolean;
  /** Corner radius of the outer frame. */
  frameRadius: PortfolioWorkCardRadius;
};

export const DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS: PortfolioWorkProjectsSpotlightSettings = {
  listSide: 'right',
  showRole: true,
  showDescription: true,
  showConsult: true,
  consultLabel: 'Consult',
  showStack: true,
  stackStyle: 'tags',
  showFrameFill: true,
  frameRadius: 'xl',
};

export function mergeProjectsSpotlightSettings(
  base: PortfolioWorkProjectsSpotlightSettings,
  patch: unknown
): PortfolioWorkProjectsSpotlightSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    listSide: record.listSide === 'left' || record.listSide === 'right' ? record.listSide : base.listSide,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel:
      typeof record.consultLabel === 'string' && record.consultLabel.trim()
        ? record.consultLabel.trim()
        : base.consultLabel,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    stackStyle:
      record.stackStyle === 'tags' ||
      record.stackStyle === 'hairline' ||
      record.stackStyle === 'list'
        ? record.stackStyle
        : base.stackStyle,
    showFrameFill:
      typeof record.showFrameFill === 'boolean' ? record.showFrameFill : base.showFrameFill,
    frameRadius:
      record.frameRadius === 'none' ||
      record.frameRadius === 'sm' ||
      record.frameRadius === 'md' ||
      record.frameRadius === 'lg' ||
      record.frameRadius === 'xl'
        ? record.frameRadius
        : base.frameRadius,
  };
}

export const PORTFOLIO_WORK_SPOTLIGHT_LIST_SIDE_OPTIONS: {
  value: PortfolioWorkProjectsSpotlightSettings['listSide'];
  label: string;
  description: string;
}[] = [
  {
    value: 'right',
    label: 'Titres Ã  droite',
    description: 'DÃ©tails Ã  gauche, sÃ©lecteur de titres Ã  droite (dÃ©faut).',
  },
  {
    value: 'left',
    label: 'Titres Ã  gauche',
    description: 'SÃ©lecteur Ã  gauche, dÃ©tails Ã  droite.',
  },
];

export const PORTFOLIO_WORK_SPOTLIGHT_STACK_STYLE_OPTIONS: {
  value: PortfolioWorkProjectsSpotlightStackStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'tags',
    label: 'Tags',
    description: 'Labels sÃ©parÃ©s par | , couleur titre.',
  },
  {
    value: 'hairline',
    label: 'Ligne',
    description: 'Labels compacts sÃ©parÃ©s par | .',
  },
  {
    value: 'list',
    label: 'Liste',
    description: 'Stack en liste verticale aÃ©rÃ©e.',
  },
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

/** Options that apply only when `sectionDesign === 'projects-editorial'`. */
export type PortfolioWorkProjectsEditorialRightPanel = 'info' | 'thumbnail';

export type PortfolioWorkProjectsEditorialSettings = {
  /** Right rail: project info (default) or media thumbnail only. */
  rightPanel: PortfolioWorkProjectsEditorialRightPanel;
  /**
   * Thumbnail mode only: on hover, darken from bottom and reveal
   * description / stack / Consult on the image.
   */
  thumbnailHoverReveal: boolean;
  showRole: boolean;
  showDescription: boolean;
  showStack: boolean;
  showConsult: boolean;
  consultLabel: string;
  descriptionLabel: string;
  categoryLabel: string;
  stackLabel: string;
  roleLabel: string;
};

export const DEFAULT_PROJECTS_EDITORIAL_SETTINGS: PortfolioWorkProjectsEditorialSettings = {
  rightPanel: 'info',
  thumbnailHoverReveal: true,
  showRole: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  consultLabel: 'Consult this project',
  descriptionLabel: 'Description',
  categoryLabel: 'Category',
  stackLabel: 'Stack',
  roleLabel: '',
};

export function mergeProjectsEditorialSettings(
  base: PortfolioWorkProjectsEditorialSettings,
  patch: unknown
): PortfolioWorkProjectsEditorialSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    rightPanel:
      record.rightPanel === 'info' || record.rightPanel === 'thumbnail'
        ? record.rightPanel
        : base.rightPanel,
    thumbnailHoverReveal:
      typeof record.thumbnailHoverReveal === 'boolean'
        ? record.thumbnailHoverReveal
        : base.thumbnailHoverReveal,
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel:
      typeof record.consultLabel === 'string' && record.consultLabel.trim()
        ? record.consultLabel.trim()
        : base.consultLabel,
    descriptionLabel:
      typeof record.descriptionLabel === 'string' && record.descriptionLabel.trim()
        ? record.descriptionLabel.trim()
        : base.descriptionLabel,
    categoryLabel:
      typeof record.categoryLabel === 'string' && record.categoryLabel.trim()
        ? record.categoryLabel.trim()
        : base.categoryLabel,
    stackLabel:
      typeof record.stackLabel === 'string' && record.stackLabel.trim()
        ? record.stackLabel.trim()
        : base.stackLabel,
    roleLabel: typeof record.roleLabel === 'string' ? record.roleLabel.trim() : base.roleLabel,
  };
}

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
  };
}

/** Options that apply only when `sectionDesign === 'projects-folio'`. */
export type PortfolioWorkProjectsFolioStackDesign =
  | 'index'
  | 'list'
  | 'inline'
  | 'grid'
  | 'rail'
  | 'tags-soft'
  | 'tags-outline'
  | 'tags-solid';

export type PortfolioWorkProjectsFolioSettings = {
  showRole: boolean;
  showDescription: boolean;
  showStack: boolean;
  showConsult: boolean;
  consultLabel: string;
  /** Label above the core stack list (default: Core stack). */
  stackLabel: string;
  /** Visual treatment for the tools / core stack block. */
  stackDesign: PortfolioWorkProjectsFolioStackDesign;
};

export const DEFAULT_PROJECTS_FOLIO_SETTINGS: PortfolioWorkProjectsFolioSettings = {
  showRole: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  consultLabel: 'Consult this project',
  stackLabel: 'Core stack',
  stackDesign: 'tags-outline',
};

function normalizeFolioStackDesign(value: unknown): PortfolioWorkProjectsFolioStackDesign | null {
  if (value === 'tags') return 'tags-outline'; // legacy â†’ current default
  if (
    value === 'index' ||
    value === 'list' ||
    value === 'inline' ||
    value === 'grid' ||
    value === 'rail' ||
    value === 'tags-soft' ||
    value === 'tags-outline' ||
    value === 'tags-solid'
  ) {
    return value;
  }
  return null;
}

export function mergeProjectsFolioSettings(
  base: PortfolioWorkProjectsFolioSettings,
  patch: unknown
): PortfolioWorkProjectsFolioSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const stackDesign = normalizeFolioStackDesign(record.stackDesign);
  return {
    showRole: typeof record.showRole === 'boolean' ? record.showRole : base.showRole,
    showDescription:
      typeof record.showDescription === 'boolean' ? record.showDescription : base.showDescription,
    showStack: typeof record.showStack === 'boolean' ? record.showStack : base.showStack,
    showConsult: typeof record.showConsult === 'boolean' ? record.showConsult : base.showConsult,
    consultLabel:
      typeof record.consultLabel === 'string' && record.consultLabel.trim()
        ? record.consultLabel.trim()
        : base.consultLabel,
    stackLabel:
      typeof record.stackLabel === 'string' && record.stackLabel.trim()
        ? record.stackLabel.trim()
        : base.stackLabel,
    stackDesign: stackDesign ?? base.stackDesign,
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
  /** Thumbnail height preset â€” `md` matches the original Case size. */
  thumbnailHeight: 'sm' | 'md' | 'lg' | 'xl';
  /** Show Summary / Stack / Link labels in the definition grid. */
  showFieldLabels: boolean;
  /** Label for the description row (default: Summary). */
  descriptionLabel: string;
  /** Label for the stack row (default: Stack). */
  stackLabel: string;
  /** Label for the consult row (default: Link). */
  linkLabel: string;
};

export const DEFAULT_PROJECTS_CASE_SETTINGS: PortfolioWorkProjectsCaseSettings = {
  showRole: true,
  showCategory: true,
  showDescription: true,
  showStack: true,
  showConsult: true,
  consultLabel: 'Consult this project',
  consultDesign: 'bracket',
  sheetGap: 'xl',
  sheetFrame: 'thin',
  showThumbnail: true,
  thumbnailHeight: 'xl',
  showFieldLabels: true,
  descriptionLabel: 'Summary',
  stackLabel: 'Stack',
  linkLabel: 'Link',
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
  };
}

export const PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS: {
  value: PortfolioWorkProjectsCaseSettings['thumbnailHeight'];
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'Petite', description: 'Hauteur rÃ©duite.' },
  { value: 'md', label: 'Moyenne', description: 'Hauteur moyenne.' },
  { value: 'lg', label: 'Grande', description: 'Miniature plus haute.' },
  { value: 'xl', label: 'TrÃ¨s grande', description: 'Hauteur maximale (dÃ©faut).' },
];

export const PORTFOLIO_WORK_SPEC_FRAME_OPTIONS: {
  value: PortfolioWorkProjectsSpecSettings['sheetFrame'];
  label: string;
  description: string;
}[] = [
  {
    value: 'none',
    label: 'Aucun',
    description: 'Pas de cadre (dÃ©faut).',
  },
  {
    value: 'thin',
    label: 'Fin',
    description: 'Trait fin (token bordure carte).',
  },
  {
    value: 'solid',
    label: 'Solid',
    description: 'Cadre plus marquÃ© autour de la fiche.',
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
    description: 'Fiche pleine largeur (dÃ©faut).',
  },
  {
    value: '2',
    label: '2 par ligne',
    description: '2 colonnes en grand Ã©cran + titre rÃ©duit + gap horizontal.',
  },
];

export const PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS: {
  value: PortfolioWorkProjectsSpecSettings['sheetGap'];
  label: string;
  description: string;
}[] = [
  { value: 'tight', label: 'SerrÃ©', description: 'Compact, un peu plus dâ€™air quâ€™avant.' },
  { value: 'md', label: 'Moyen', description: 'Espacement gÃ©nÃ©reux entre fiches.' },
  { value: 'xl', label: 'Large', description: 'TrÃ¨s aÃ©rÃ© (dÃ©faut).' },
  { value: '2xl', label: 'TrÃ¨s large', description: 'Espacement maximal, lecture lente.' },
];

export const PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS: {
  value: PortfolioWorkProjectsSpecConsultDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'bracket',
    label: 'Bracket',
    description: 'Mono [ Consult â†’ ] â€” style Framer (dÃ©faut).',
  },
  {
    value: 'link',
    label: 'Link',
    description: 'Lien texte + flÃ¨che â†— dans la grille.',
  },
  {
    value: 'underline',
    label: 'Underline',
    description: 'Texte soulignÃ© animÃ©, sans flÃ¨che.',
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
    description: 'Fond soft teintÃ©, sans bordure forte.',
  },
  {
    value: 'solid',
    label: 'Solid',
    description: 'Bouton plein token titre / tools (pas CTA).',
  },
];

export const PORTFOLIO_WORK_FOLIO_STACK_DESIGN_OPTIONS: {
  value: PortfolioWorkProjectsFolioStackDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'tags-outline',
    label: 'Tags outline',
    description: 'Pastilles transparentes, bordure seulement (dÃ©faut).',
  },
  {
    value: 'tags-soft',
    label: 'Tags soft',
    description: 'Pastilles teintÃ©es accent.',
  },
  {
    value: 'tags-solid',
    label: 'Tags solid',
    description: 'Pastilles pleines (token tools / titre â€” pas la CTA).',
  },
  {
    value: 'index',
    label: 'Index',
    description: '01 Â·Â·Â·Â·Â·Â·Â·Â·Â· outil â€” table des matiÃ¨res.',
  },
  {
    value: 'list',
    label: 'Liste',
    description: 'Liste uppercase tracked, une ligne par outil.',
  },
  {
    value: 'inline',
    label: 'Inline',
    description: 'Outils en une phrase sÃ©parÃ©s par Â·',
  },
  {
    value: 'grid',
    label: 'Grille',
    description: 'Grille 2 colonnes compacte.',
  },
  {
    value: 'rail',
    label: 'Rail',
    description: 'Barre accent + outils empilÃ©s Ã  droite.',
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
    description: 'DÃ©tails au survol (desktop) â€” Framer index style.',
  },
  {
    value: 'click',
    label: 'Click',
    description: 'Ouvre / ferme au clic â€” idÃ©al mobile.',
  },
  {
    value: 'always',
    label: 'Always open',
    description: 'Description et stack toujours visibles sous chaque titre.',
  },
];

export const PORTFOLIO_WORK_EDITORIAL_RIGHT_PANEL_OPTIONS: {
  value: PortfolioWorkProjectsEditorialRightPanel;
  label: string;
  description: string;
}[] = [
  {
    value: 'info',
    label: 'Infos',
    description: 'Description, stack et Consult Ã  droite (sticky).',
  },
  {
    value: 'thumbnail',
    label: 'Miniature',
    description: 'Uniquement la miniature projet Ã  droite â€” sans bordure ni radius.',
  },
];

export const PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS: {
  value: PortfolioWorkSectionDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Full gallery controls â€” media, columns, and card chrome from Cards / Media.',
  },
  {
    value: 'projects-board',
    label: 'Projects board',
    description: 'Two cards per row with design-only options: thumbnail, category, Consult hover.',
  },
  {
    value: 'projects-accordion',
    label: 'Accordion',
    description: 'Accordion + large preview â€” swap columns, role/category, Consult text link.',
  },
  {
    value: 'projects-frames',
    label: 'Frames',
    description: 'Horizontal frames â€” image left, info right, stack as plain text (not tags).',
  },
  {
    value: 'projects-index',
    label: 'Index',
    description: 'Numbered rows with thin rules â€” title + stack, description on the right.',
  },
  {
    value: 'projects-grid',
    label: 'Grid',
    description: 'Thumbnail cards â€” title + description, 2 or 3 per row on large screens.',
  },
  {
    value: 'projects-split',
    label: 'Split',
    description: 'Large thumbnail beside a top-aligned title â€” sides and zigzag configurable.',
  },
  {
    value: 'projects-carousel',
    label: 'Carousel',
    description: 'Image-only horizontal carousel â€” configure slide size, ratio, and spacing.',
  },
  {
    value: 'projects-spotlight',
    label: 'Spotlight',
    description:
      'Cadre fin â€” dÃ©tails projet Ã  gauche, sÃ©lecteur de titres Ã  droite (pas accordion).',
  },
  {
    value: 'projects-showcase',
    label: 'Showcase',
    description:
      'Large media + details â€” chevrons and three thumbnails to switch the active project.',
  },
  {
    value: 'projects-editorial',
    label: 'Editorial',
    description:
      'Grand numÃ©ro + rÃ´le + titre Ã  gauche, description / catÃ©gorie / stack Ã  droite â€” sans image.',
  },
  {
    value: 'projects-ledger',
    label: 'Ledger',
    description:
      'Index typographique Framer â€” lignes, titres, rÃ´le, dÃ©tails au survol. DonnÃ©es seulement, sans miniature.',
  },
  {
    value: 'projects-folio',
    label: 'Folio',
    description:
      'Dossier sticky Ã  gauche + liste de titres Ã  droite â€” lecture Ã©ditoriale, donnÃ©es seulement, sans miniature.',
  },
  {
    value: 'projects-spec',
    label: 'Spec',
    description:
      'Fiche technique / datasheet â€” titre + grille label/valeur. DonnÃ©es seulement, sans miniature.',
  },
  {
    value: 'projects-case',
    label: 'Case',
    description: 'Grande miniature 50/50 Ã  gauche + fiche Spec Ã  droite.',
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'projects',
      subtitlePreset: 'short',
      subtitleCustom: 'Selected projects.',
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
      illustrationVariant: 'none',
      headerAlignment: 'center',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'custom',
      subtitleCustom: 'A closer look at platforms I designed and built.',
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'custom',
      subtitleCustom: 'Projects in focus.',
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Capabilities',
      subtitlePreset: 'custom',
      subtitleCustom: 'What I ship across design and engineering.',
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'custom',
      subtitleCustom: 'Recent projects.',
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'custom',
      subtitleCustom: 'Recent projects.',
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'custom',
      subtitleCustom: 'Recent projects.',
      projectsCarousel: { ...DEFAULT_PROJECTS_CAROUSEL_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-spotlight') {
    return {
      sectionDesign,
      galleryLayout: 'list',
      itemsPerRow: 1,
      cardDesign: 'minimal',
      showCardMedia: false,
      noMediaInfoLayout: 'fill',
      contentPlacement: 'side',
      cardMaxWidth: 'full',
      cardBorder: 'soft',
      cardShadow: 'none',
      cardBackgroundEnabled: true,
      cardBorderRadius: 'xl',
      cardPadding: 'lg',
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
      showCategoryOnCard: false,
      showMarketplaceLink: false,
      illustrationVariant: 'none',
      headerAlignment: 'center',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

      projectsSpotlight: { ...DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS },
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

      projectsShowcase: { ...DEFAULT_PROJECTS_SHOWCASE_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-editorial') {
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

      projectsEditorial: { ...DEFAULT_PROJECTS_EDITORIAL_SETTINGS },
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

      projectsLedger: { ...DEFAULT_PROJECTS_LEDGER_SETTINGS },
    };
  }
  if (sectionDesign === 'projects-folio') {
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

      projectsFolio: { ...DEFAULT_PROJECTS_FOLIO_SETTINGS },
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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

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
      illustrationVariant: 'none',
      headerAlignment: 'left',
      sectionLayout: 'stacked',
      titlePreset: 'custom',
      titleCustom: 'Selected work',
      subtitlePreset: 'minimal',
      subtitleCustom: '',

      projectsCase: { ...DEFAULT_PROJECTS_CASE_SETTINGS },
    };
  }
  return { sectionDesign: 'classic' };
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
    description: 'Texte empilÃ© en bas de la carte (tous Ã©crans).',
  },
  {
    value: 'free',
    label: 'Libre (grand Ã©cran)',
    description: 'Place chaque Ã©lÃ©ment dans une cellule 3Ã—3 â€” desktop seulement.',
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
  { value: 'category', label: 'CatÃ©gorie' },
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

/** Vertical row of a free-placement cell â€” lets small screens keep the chosen band. */
export function workOverlayCellRow(
  cell: PortfolioWorkOverlayCellPlacement
): 'top' | 'center' | 'bottom' {
  return overlayCellMeta(cell).row;
}

/** Horizontal column of a free-placement cell â€” lets small screens keep the chosen side. */
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
  { value: 'toolsLabel', label: 'Tools label', description: 'â€œTools to useâ€ heading above the tool logos.' },
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

/** Inner padding for per-element chrome â€” includes free `custom` px mode. */
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
  /** Outer spacing around the element â€” not tied to content-frame vertical gap. */
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

/** Preset â†’ px map for element chrome inner padding (Compact / Standard / Confortable). */
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
   * `stacked` â€” title above the gallery (default).
   * `aside-left` / `aside-right` â€” title beside the gallery on large screens.
   */
  sectionLayout: PortfolioWorkSectionLayout;
  /** Decorative SVG beside the gallery (`none` hides it). */
  illustrationVariant: PortfolioWorkIllustrationVariant;
  /** Side of the gallery for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioWorkIllustrationPlacement;
  contentPlacement: PortfolioWorkContentPlacement;
  galleryLayout: PortfolioWorkGalleryLayout;
  /** Named Portfolio section design (Settings â†’ Design). */
  sectionDesign: PortfolioWorkSectionDesign;
  /** Projects boardâ€“only options (ignored by Classic). */
  projectsBoard: PortfolioWorkProjectsBoardSettings;
  /** Accordion designâ€“only options (ignored by Classic / Projects board). */
  projectsAccordion: PortfolioWorkProjectsAccordionSettings;
  /** Frames designâ€“only options (horizontal image + info cards). */
  projectsFrames: PortfolioWorkProjectsFramesSettings;
  /** Index designâ€“only options (numbered rows + separators). */
  projectsIndex: PortfolioWorkProjectsIndexSettings;
  /** Grid designâ€“only options (thumbnail + title + description cards). */
  projectsGrid: PortfolioWorkProjectsGridSettings;
  /** Split designâ€“only options (large thumbnail left + title right). */
  projectsSplit: PortfolioWorkProjectsSplitSettings;
  /** Carousel designâ€“only options (image-only horizontal slides). */
  projectsCarousel: PortfolioWorkProjectsCarouselSettings;
  /** Spotlight designâ€“only options (left details + right title selector). */
  projectsSpotlight: PortfolioWorkProjectsSpotlightSettings;
  /** Showcase designâ€“only options (media + details + thumbnail selector). */
  projectsShowcase: PortfolioWorkProjectsShowcaseSettings;
  /** Editorial designâ€“only options (number + title left, meta rail right). */
  projectsEditorial: PortfolioWorkProjectsEditorialSettings;
  /** Ledger designâ€“only options (typographic index rows, data-only). */
  projectsLedger: PortfolioWorkProjectsLedgerSettings;
  /** Folio designâ€“only options (sticky dossier + title list, data-only). */
  projectsFolio: PortfolioWorkProjectsFolioSettings;
  /** Spec designâ€“only options (technical datasheet rows, data-only). */
  projectsSpec: PortfolioWorkProjectsSpecSettings;
  /** Case designâ€“only options (50/50 thumbnail + Spec datasheet). */
  projectsCase: PortfolioWorkProjectsCaseSettings;
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
  /** 0â€“100 continuous strength of the float / shadow halo. */
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
  /** Manual hex override â€” palette sync skipped until the token binding changes. */
  contentFrameBorderManual: boolean;
  contentFrameBackgroundManual: boolean;
  contentFrameBorderRadius: PortfolioWorkCardRadius;
  contentFramePadding: PortfolioWorkCardPadding;
  /** Vertical gap between info blocks inside the frame. */
  contentFrameGap: PortfolioWorkCardGap;
  /** Optional surface behind category / title / description / tools (padding, margin, border, fill). */
  elementChromes: PortfolioWorkElementChromes;
  /**
   * Overlay immersive only: classic bottom stack, or free 3Ã—3 placement on lg+.
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
  /** CTA outline â€” bound to the same palette token as Hero `ctaBorder`. */
  ctaBorderColor: string;
  /** Border thickness on pill / circle CTA. */
  ctaBorderWidth: PortfolioWorkCtaBorderWidth;
  /** Corner radius on pill CTAs (circle icon shell stays round). */
  ctaBorderRadius: PortfolioWorkCtaBorderRadius;
  /** Hover fill â€” palette `ctaHoverBackground`. */
  ctaHoverBackgroundColor: string;
  /** Hover label / icon ink â€” palette `ctaHoverText`. */
  ctaHoverTextColor: string;
  /** Hover outline â€” palette `ctaHoverBorder`. */
  ctaHoverBorderColor: string;
  /** When false, CTA keeps resting colors on hover. */
  ctaHoverEnabled: boolean;
  /** Tool icon chip fill â€” bound to Hero `toolsIconBackground`. */
  toolsIconBackgroundColor: string;
  /** Tool icon chip outline â€” bound to Hero `toolsIconBorder`. */
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
  sectionDesign: 'classic',
  projectsBoard: { ...DEFAULT_PROJECTS_BOARD_SETTINGS },
  projectsAccordion: { ...DEFAULT_PROJECTS_ACCORDION_SETTINGS },
  projectsFrames: { ...DEFAULT_PROJECTS_FRAMES_SETTINGS },
  projectsIndex: { ...DEFAULT_PROJECTS_INDEX_SETTINGS },
  projectsGrid: { ...DEFAULT_PROJECTS_GRID_SETTINGS },
  projectsSplit: { ...DEFAULT_PROJECTS_SPLIT_SETTINGS },
  projectsCarousel: { ...DEFAULT_PROJECTS_CAROUSEL_SETTINGS },
  projectsSpotlight: { ...DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS },
  projectsShowcase: { ...DEFAULT_PROJECTS_SHOWCASE_SETTINGS },
  projectsEditorial: { ...DEFAULT_PROJECTS_EDITORIAL_SETTINGS },
  projectsLedger: { ...DEFAULT_PROJECTS_LEDGER_SETTINGS },
  projectsFolio: { ...DEFAULT_PROJECTS_FOLIO_SETTINGS },
  projectsSpec: { ...DEFAULT_PROJECTS_SPEC_SETTINGS },
  projectsCase: { ...DEFAULT_PROJECTS_CASE_SETTINGS },
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
  { value: 'serif', label: 'Editorial serif', description: 'Playfair Display â€” magazine feel.' },
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
    label: 'EmpilÃ©',
    description: 'Titre au-dessus, projets en dessous.',
  },
  {
    value: 'aside-left',
    label: 'Titre Ã  gauche',
    description: 'Titre Ã  gauche, galerie Ã  droite (cÃ´te Ã  cÃ´te).',
  },
  {
    value: 'aside-right',
    label: 'Titre Ã  droite',
    description: 'Galerie Ã  gauche, titre Ã  droite (cÃ´te Ã  cÃ´te).',
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
  { value: 'none', label: 'Aucun', description: 'Pas de SVG dÃ©coratif Ã  cÃ´tÃ© de la galerie.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point dâ€™interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposÃ©s.' },
  { value: 'support', label: 'Support', description: 'Illustration support.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_WORK_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioWorkIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG Ã  gauche de la galerie.' },
  { value: 'right', label: 'Droite', description: 'SVG Ã  droite de la galerie.' },
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
  { value: 'stack', label: 'Grille portfolio', description: 'Grandes cartes Ã©ditoriales â€” colonnes rÃ©glables, design libre.' },
  { value: 'grid', label: 'Grille compacte', description: 'Tuiles denses : mÃ©dia bas, texte serrÃ© â€” colonnes rÃ©glables.' },
  { value: 'carousel', label: 'Carrousel', description: 'Un projet Ã  la fois â€” flÃ¨ches gauche / droite pour naviguer.' },
  { value: 'list', label: 'Liste compacte', description: 'Lignes Ã©levÃ©es : grande vignette, tools Ã  droite, action encerclÃ©e.' },
  { value: 'overlay', label: 'Overlay immersif', description: 'Media plein avec texte superposÃ© â€” colonnes rÃ©glables.' },
  { value: 'accordion', label: 'AccordÃ©on', description: 'Lignes dÃ©pliables rÃ©vÃ©lant les dÃ©tails du projet.' },
];

export const PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS: {
  value: '1' | '2' | '3' | '4';
  label: string;
  description: string;
}[] = [
  { value: '1', label: '1 par ligne', description: 'Pleine largeur â€” idÃ©al mobile et grands projets.' },
  { value: '2', label: '2 par ligne', description: '2 colonnes dÃ¨s tablette (md).' },
  { value: '3', label: '3 par ligne', description: '2 dÃ¨s sm, 3 dÃ¨s xl â€” dense sur grand Ã©cran.' },
  { value: '4', label: '4 par ligne', description: 'Jusquâ€™Ã  4 sur trÃ¨s grand Ã©cran â€” trÃ¨s compact.' },
];

export const PORTFOLIO_WORK_CARD_MAX_WIDTH_OPTIONS: {
  value: PortfolioWorkCardMaxWidth;
  label: string;
  description: string;
}[] = [
  { value: 'full', label: 'Pleine largeur', description: 'La carte remplit toute la colonne (comportement actuel).' },
  { value: 'xl', label: 'Large', description: 'Max ~42rem â€” encore confortable, moins Ã©tirÃ©e.' },
  { value: 'lg', label: 'Carte portrait', description: 'Max ~36rem â€” forme verticale type rÃ©fÃ©rence.' },
  { value: 'md', label: 'Moyenne', description: 'Max ~32rem â€” carte plus compacte.' },
  { value: 'sm', label: 'Compacte', description: 'Max ~28rem â€” tuile Ã©troite.' },
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
  { value: 'pills', label: 'Pills', description: 'Rounded chips â€” clear and tap-friendly.' },
  { value: 'underline', label: 'Underline', description: 'Text links with an active underline.' },
  { value: 'tabs', label: 'Tabs', description: 'Segmented control in a soft tray.' },
  { value: 'minimal', label: 'Minimal', description: 'Plain text row, no chrome.' },
];

export const PORTFOLIO_WORK_CARD_RADIUS_OPTIONS: {
  value: PortfolioWorkCardRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'CarrÃ©', description: 'Coins droits.' },
  { value: 'sm', label: 'LÃ©ger', description: 'Arrondi subtil.' },
  { value: 'md', label: 'Moyen', description: 'Arrondi Ã©quilibrÃ©.' },
  { value: 'lg', label: 'Large', description: 'Coins bien arrondis (dÃ©faut).' },
  { value: 'xl', label: 'TrÃ¨s large', description: 'Arrondi prononcÃ©.' },
];

export const PORTFOLIO_WORK_CARD_PADDING_OPTIONS: {
  value: PortfolioWorkCardPadding;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de marge intÃ©rieure.' },
  { value: 'sm', label: 'Compact', description: 'Marge intÃ©rieure rÃ©duite.' },
  { value: 'md', label: 'Standard', description: 'Marge intÃ©rieure Ã©quilibrÃ©e.' },
  { value: 'lg', label: 'Confortable', description: 'Marge intÃ©rieure gÃ©nÃ©reuse.' },
];

export const PORTFOLIO_WORK_CARD_GAP_OPTIONS: {
  value: PortfolioWorkCardGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'SerrÃ©', description: 'Peu dâ€™espace entre les projets.' },
  { value: 'md', label: 'Moyen', description: 'Espacement modÃ©rÃ© entre les projets.' },
  { value: 'lg', label: 'Large', description: 'Espacement gÃ©nÃ©reux (dÃ©faut).' },
  { value: 'xl', label: 'TrÃ¨s large', description: 'Espacement maximal entre les projets.' },
];

export const PORTFOLIO_WORK_CONTENT_FRAME_GAP_OPTIONS: {
  value: PortfolioWorkCardGap;
  label: string;
  description: string;
}[] = [
  { value: 'sm', label: 'SerrÃ©', description: 'Peu dâ€™espace entre catÃ©gorie, titre, outilsâ€¦' },
  { value: 'md', label: 'Moyen', description: 'Espacement modÃ©rÃ© entre les blocs dâ€™info.' },
  { value: 'lg', label: 'Large', description: 'Espacement gÃ©nÃ©reux entre les blocs.' },
  { value: 'xl', label: 'TrÃ¨s large', description: 'Espacement maximal entre les blocs.' },
];

export const PORTFOLIO_WORK_CARD_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCardAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Place le cadre de la carte Ã  gauche de la colonne.' },
  { value: 'center', label: 'Centre', description: 'Centre le cadre de la carte dans la colonne.' },
  { value: 'right', label: 'Droite', description: 'Place le cadre de la carte Ã  droite de la colonne.' },
];

export const PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCardContentAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Titre, texte et outils Ã  lâ€™intÃ©rieur de la carte â€” gauche.' },
  { value: 'center', label: 'Centre', description: 'Ã‰lÃ©ments Ã  lâ€™intÃ©rieur de la carte â€” centrÃ©s.' },
  { value: 'right', label: 'Droite', description: 'Ã‰lÃ©ments Ã  lâ€™intÃ©rieur de la carte â€” droite.' },
];

export const PORTFOLIO_WORK_CARD_CONTENT_VERTICAL_ALIGN_OPTIONS: {
  value: PortfolioWorkCardContentVerticalAlign;
  label: string;
  description: string;
}[] = [
  {
    value: 'top',
    label: 'Haut',
    description: 'Infos collÃ©es en haut de la colonne (espace vide en bas).',
  },
  {
    value: 'center',
    label: 'Centre',
    description: 'Infos centrÃ©es verticalement face au mÃ©dia.',
  },
  {
    value: 'bottom',
    label: 'Bas',
    description: 'Infos collÃ©es en bas de la colonne.',
  },
];

export const PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS: {
  value: PortfolioWorkCtaAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'Bouton alignÃ© Ã  gauche.' },
  { value: 'center', label: 'Centre', description: 'Bouton centrÃ©.' },
  { value: 'right', label: 'Droite', description: 'Bouton alignÃ© Ã  droite.' },
];

export const PORTFOLIO_WORK_CARD_DESIGN_OPTIONS: {
  value: PortfolioWorkCardDesign;
  label: string;
  description: string;
}[] = [
  { value: 'editorial', label: 'Editorial', description: 'Rounded media, roomy typography â€” the default.' },
  { value: 'minimal', label: 'Minimal', description: 'Flat sharp media, mono CTA, thin content divider.' },
  { value: 'compact', label: 'Compact', description: 'Smaller preview and tighter content stack.' },
  { value: 'stacked', label: 'Stacked', description: 'Full-width media with content underneath.' },
  { value: 'overlay', label: 'Overlay', description: 'Text layered over media with a dark gradient.' },
  { value: 'framed', label: 'Framed', description: 'Denser spacing and shadow â€” borders are set in Cadre & espacement.' },
];

export const PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS: {
  value: PortfolioWorkContentPlacement;
  label: string;
  description: string;
}[] = [
  {
    value: 'side',
    label: 'MÃ©dia Ã  gauche',
    description: 'Image Ã  gauche, infos complÃ©mentaires Ã  droite.',
  },
  {
    value: 'side-reverse',
    label: 'MÃ©dia Ã  droite',
    description: 'Infos Ã  gauche, image Ã  droite.',
  },
  {
    value: 'bottom',
    label: 'MÃ©dia en haut',
    description: 'Image au-dessus, texte et CTA en dessous.',
  },
  {
    value: 'top',
    label: 'MÃ©dia en bas',
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
    description: 'Largeur limitÃ©e (comme Ã  cÃ´tÃ© du mÃ©dia) pour une lecture confortable.',
  },
  {
    value: 'centered',
    label: 'CentrÃ©',
    description: 'Bloc dâ€™infos centrÃ© avec largeur limitÃ©e.',
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

/** Thumb sizing for list rows â€” full-bleed when stacked, square when beside. */
export function workListThumbClass(
  placement: PortfolioWorkContentPlacement,
  mediaRatio = 50
): string {
  if (placement === 'bottom' || placement === 'top') {
    return 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10';
  }
  const clamped = Math.min(70, Math.max(30, Math.round(mediaRatio)));
  // 30 â†’ ~5.5rem, 50 â†’ 7â€“8rem, 70 â†’ ~10rem on sm+
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
  { value: 'none', label: 'Aucune', description: 'Pas de bordure â€” les coins restent rÃ©glables ci-dessous.' },
  { value: 'soft', label: 'Fine', description: 'Contour lÃ©ger autour du mÃ©dia ou de la carte.' },
  { value: 'solid', label: 'Pleine', description: 'Bordure marquÃ©e autour du mÃ©dia ou de la carte.' },
  { value: 'accent', label: 'Accent', description: 'Bordure teintÃ©e avec la couleur dâ€™accent.' },
];

export const PORTFOLIO_WORK_CARD_SHADOW_OPTIONS: {
  value: PortfolioWorkCardShadow;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Carte Ã  plat â€” pas de profondeur.' },
  { value: 'soft', label: 'Douce', description: 'Ombre lÃ©gÃ¨re pour un lÃ©ger relief.' },
  {
    value: 'float',
    label: 'Flottante',
    description: 'Halo flou autour de la carte â€” effet de flotte sans bordure.',
  },
  { value: 'deep', label: 'Profonde', description: 'Ombre marquÃ©e pour un fort dÃ©tachement du fond.' },
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
    description: 'Label + cercle flÃ¨che â€” bordure et hover sur lâ€™icÃ´ne.',
  },
  {
    value: 'pill-dark',
    label: 'Dark pill',
    description: 'Capsule remplie (accent) â€” bordure et hover configurables.',
  },
  {
    value: 'pill-outline',
    label: 'Outline pill',
    description: 'Capsule Ã  contour â€” au survol, fond hover + texte.',
  },
  {
    value: 'pill-accent',
    label: 'Accent pill',
    description: 'Capsule accent vive â€” bordure fine + swap de couleurs au survol.',
  },
  {
    value: 'text-arrow',
    label: 'Text + arrow',
    description: 'Lien minimal â€” soulignement et couleurs au survol.',
  },
];

export const PORTFOLIO_WORK_CTA_BORDER_WIDTH_OPTIONS: {
  value: PortfolioWorkCtaBorderWidth;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucune', description: 'Pas de contour sur le bouton.' },
  { value: 'thin', label: 'Fine', description: 'Contour lÃ©ger (1px).' },
  { value: 'medium', label: 'Moyenne', description: 'Contour marquÃ© (2px).' },
  { value: 'thick', label: 'Ã‰paisse', description: 'Contour fort (3px).' },
];

export const PORTFOLIO_WORK_CTA_BORDER_RADIUS_OPTIONS: {
  value: PortfolioWorkCtaBorderRadius;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'CarrÃ©', description: 'Coins droits.' },
  { value: 'sm', label: 'LÃ©ger', description: 'Arrondi subtil.' },
  { value: 'md', label: 'Moyen', description: 'Arrondi Ã©quilibrÃ©.' },
  { value: 'lg', label: 'Large', description: 'Coins bien arrondis.' },
  { value: 'full', label: 'Pilule', description: 'Capsule complÃ¨tement ronde (dÃ©faut).' },
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
 * Pin-to-bottom uses a sibling flex spacer (see EditorialWorkCard) â€” not mt-auto here â€”
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
  settings: Pick<
    PortfolioWorkSectionSettings,
    'subtitlePreset' | 'subtitleCustom' | 'subtitle' | 'sectionDesign'
  >
): string {
  // Spotlight / Showcase / Editorial / Ledger / Folio / Spec / Case: no section subtitle by default (hide stock lines from older saves).
  if (
    settings.sectionDesign === 'projects-spotlight' ||
    settings.sectionDesign === 'projects-showcase' ||
    settings.sectionDesign === 'projects-editorial' ||
    settings.sectionDesign === 'projects-ledger' ||
    settings.sectionDesign === 'projects-folio' ||
    settings.sectionDesign === 'projects-spec' ||
    settings.sectionDesign === 'projects-case'
  ) {
    if (settings.subtitlePreset === 'minimal') return '';
    if (settings.subtitlePreset === 'default') {
      const text = (settings.subtitle || '').trim();
      if (!text || text === 'Selected projects.') return '';
    }
    if (settings.subtitlePreset === 'custom') {
      const custom = (settings.subtitleCustom || settings.subtitle || '').trim();
      if (!custom || custom === 'Recent projects.') return '';
    }
  }

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
    // Media sits flush with the info block â€” no empty band between them.
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
        // Overlay chrome expects media as the canvas â€” default to media on top.
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
 * Liste compacte â€” flat surface (no forced ambient shadow).
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
    // Plate vs page fond â€” dark/light via theme tokens (not light-only --pf-surface).
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
      return 'Sur mobile, les cartes restent sur 1 colonne. 2 colonnes Ã  partir des grands Ã©crans (lg).';
    case 3:
      return 'Sur mobile : 1 colonne. Tablette : 2. Grand Ã©cran (xl) : 3.';
    case 4:
      return '4 colonnes uniquement sur trÃ¨s grand Ã©cran (2xl). Sur laptop max 3 ; tablette 2 ; mobile 1.';
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

/** Align constrained cards inside their grid / flex cell â€” card frame only. */
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
 * Soft lift / float halo around the card â€” independent of border.
 * Prefer on an outer wrapper (not the same node as overflow-hidden) so the blur isnâ€™t clipped.
 * Intensity (0â€“100) freely scales blur size + opacity via `--pf-card-lift`.
 * Dark vs light shadow recipe is applied in CSS (`.pf-work-card-lift`) so black-on-black
 * doesnâ€™t swallow the effect in dark mode.
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

/** Card-design behavior only (shadow, hover) â€” border and radius come from manual edge settings. */
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

/** Maps mediaRatio (30â€“70) to aspect ratio for stacked layouts â€” lower = shorter, higher = taller. */
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

/** Mix hex toward black (positive amount) or white (negative). amount âˆˆ 0â€“1. */
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
 * Filled pills: label ink = page background (`fond`) â€” not fixed white â€”
 * so light/dark modes stay consistent with the original contrast rule.
 */
export function workCtaSurfaceStyle(
  design: PortfolioWorkCtaDesign,
  presentation: WorkCtaSurfacePresentation
): CSSProperties {
  const accent = sanitizeHex(presentation.ctaColor, DEFAULT_WORK_CTA_COLOR);
  const border = sanitizeHex(presentation.ctaBorderColor, accent);
  const labelInk = sanitizeHex(presentation.elementStyles?.cta?.color ?? accent, accent);
  /** Page fill â€” dark in dark mode, light in light mode. */
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
    // Filled on hover â†’ page-fond ink (same rule as accent pills).
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

/** Relative luminance 0â€“1 for work contrast helpers. */
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

/** Tool icon circle surface â€” follows Hero tools icon palette tokens. */
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
    sectionDesign:
      sectionDesign === 'classic' ||
      sectionDesign === 'projects-board' ||
      sectionDesign === 'projects-accordion' ||
      sectionDesign === 'projects-frames' ||
      sectionDesign === 'projects-index' ||
      sectionDesign === 'projects-grid' ||
      sectionDesign === 'projects-split' ||
      sectionDesign === 'projects-carousel' ||
      sectionDesign === 'projects-spotlight' ||
      sectionDesign === 'projects-showcase' ||
      sectionDesign === 'projects-editorial' ||
      sectionDesign === 'projects-ledger' ||
      sectionDesign === 'projects-folio' ||
      sectionDesign === 'projects-spec' ||
      sectionDesign === 'projects-case'
        ? sectionDesign
        : base.sectionDesign,
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
    projectsSpotlight: mergeProjectsSpotlightSettings(
      mergeProjectsSpotlightSettings(DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS, base.projectsSpotlight),
      record.projectsSpotlight
    ),
    projectsShowcase: mergeProjectsShowcaseSettings(
      mergeProjectsShowcaseSettings(DEFAULT_PROJECTS_SHOWCASE_SETTINGS, base.projectsShowcase),
      record.projectsShowcase
    ),
    projectsEditorial: mergeProjectsEditorialSettings(
      mergeProjectsEditorialSettings(DEFAULT_PROJECTS_EDITORIAL_SETTINGS, base.projectsEditorial),
      record.projectsEditorial
    ),
    projectsLedger: mergeProjectsLedgerSettings(
      mergeProjectsLedgerSettings(DEFAULT_PROJECTS_LEDGER_SETTINGS, base.projectsLedger),
      record.projectsLedger
    ),
    projectsFolio: mergeProjectsFolioSettings(
      mergeProjectsFolioSettings(DEFAULT_PROJECTS_FOLIO_SETTINGS, base.projectsFolio),
      record.projectsFolio
    ),
    projectsSpec: mergeProjectsSpecSettings(
      mergeProjectsSpecSettings(DEFAULT_PROJECTS_SPEC_SETTINGS, base.projectsSpec),
      record.projectsSpec
    ),
    projectsCase: mergeProjectsCaseSettings(
      mergeProjectsCaseSettings(DEFAULT_PROJECTS_CASE_SETTINGS, base.projectsCase),
      record.projectsCase
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
