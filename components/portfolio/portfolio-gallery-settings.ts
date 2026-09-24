import type { CSSProperties } from 'react';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import type { PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioGalleryColorBindings } from '@/components/portfolio/portfolio-gallery-palette-settings';
import {
  mergeSectionColorMode,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import {
  GALLERY_HEADER_ACCENT_COUNT_ALIGNMENTS,
  GALLERY_HEADER_BILLBOARD_WORD_STYLES,
  GALLERY_HEADER_DESIGNS,
  GALLERY_HEADER_MARGIN_BOTTOM_STEPS,
  GALLERY_HEADER_PALETTE_TOKENS,
  GALLERY_HEADER_TITLE_SIZES,
  GALLERY_HEADER_TITLE_WEIGHTS,
  type PortfolioGalleryHeaderAccentCountAlignment,
  type PortfolioGalleryHeaderBillboardWordStyle,
  type PortfolioGalleryHeaderDesign,
  type PortfolioGalleryHeaderDesignAlignment,
  type PortfolioGalleryHeaderMarginBottom,
  type PortfolioGalleryHeaderPaletteToken,
  type PortfolioGalleryHeaderTitleSize,
  type PortfolioGalleryHeaderTitleWeight,
} from '@/components/portfolio/portfolio-gallery-header-settings';

export type PortfolioGalleryDesign =
  | 'framed-grid'
  | 'cinema-strip'
  | 'editorial-split'
  | 'caption-carousel'
  | 'hero-mosaic'
  | 'featured-strip'
  | 'tall-row';
export type PortfolioGalleryCaptionPager = 'chevrons' | 'dots';
export type PortfolioGalleryTitlePlacement = 'under' | 'overlay' | 'hidden';
export type PortfolioGalleryTallRowTitleReveal = 'always' | 'hover';
export type PortfolioGalleryAspect = 'auto' | 'square' | 'portrait' | 'landscape' | 'cinema';
export type PortfolioGalleryObjectFit = 'cover' | 'contain';
export type PortfolioGalleryObjectPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';
export type PortfolioGalleryHeaderFont = 'sans' | 'serif' | 'display';
export type PortfolioGalleryHeaderAlignment = 'left' | 'center';
export type PortfolioGalleryMaxWidth = 'md' | 'lg' | 'xl' | 'full';
export type PortfolioGalleryPlacement = 'left' | 'center' | 'right';
export type PortfolioGalleryFeaturedRailPlacement = 'right' | 'bottom';
/** Where featured width/placement apply when thumbnails sit below the hero. */
export type PortfolioGalleryFeaturedWidthScope = 'global' | 'hero';
export type PortfolioGalleryTitlePreset = 'gallery' | 'selected-work' | 'visual-journal' | 'custom' | 'none';
export type PortfolioGallerySubtitlePreset = 'default' | 'selection' | 'journal' | 'minimal' | 'custom';
/**
 * `stacked` — section title above the gallery grid (default).
 * `aside-left` / `aside-right` — section title beside the grid on large screens.
 * `over-thumbs` — title centered above the thumbnails (Image haute + rangée).
 * Distinct from per-item `titlePlacement` and block `placement`.
 */
export type PortfolioGallerySectionLayout = 'stacked' | 'aside-left' | 'aside-right' | 'over-thumbs';
/**
 * Global type-size control for the Gallery section — same standardized-shared-value
 * architecture as the Experience/Footer/FAQ sections' "Font size" control: a single
 * `--pf-gallery-font-scale` CSS custom property, set once on the section's shared
 * `PortfolioSectionShell` root (`id="gallery"`, via `cssVars` in `PublicCreatorPortfolioPage.tsx`,
 * from `galleryPremiumFontScale(presentation.premiumFontSize)`), multiplies every one of the
 * Gallery's body/caption font-size declarations (`.pf-gallery-media-title*` in globals.css, and
 * the lightbox caption text). `medium` is the current baseline size — the other tiers scale
 * relative to that, not to some other absolute reference.
 */
export type PortfolioGalleryPremiumFontSize = 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export const GALLERY_PREMIUM_FONT_SIZES: PortfolioGalleryPremiumFontSize[] = [
  'small',
  'medium',
  'large',
  'xlarge',
  'xxlarge',
];

export const PORTFOLIO_GALLERY_PREMIUM_FONT_SIZE_OPTIONS: {
  value: PortfolioGalleryPremiumFontSize;
  label: string;
  description: string;
}[] = [
  { value: 'small', label: 'Small', description: 'Compact type across the Gallery.' },
  { value: 'medium', label: 'Medium', description: 'Default, balanced type size.' },
  { value: 'large', label: 'Large', description: 'Bigger type for maximum readability.' },
  { value: 'xlarge', label: 'Extra Large', description: 'Extra large type for a bold, high-impact look.' },
  {
    value: 'xxlarge',
    label: 'Super Extra Large',
    description: 'Maximum type size for the most dramatic, oversized look.',
  },
];

/** Multiplier the Gallery's own standardized body/caption text sizes are scaled by, via
 *  `calc(<base> * var(--pf-gallery-font-scale, 1))` in globals.css — same values as the
 *  Experience/Footer/FAQ sections' scale, kept in sync deliberately. */
const GALLERY_PREMIUM_FONT_SCALE: Record<PortfolioGalleryPremiumFontSize, number> = {
  small: 0.85,
  medium: 1,
  large: 1.15,
  xlarge: 1.3,
  xxlarge: 1.45,
};

export function galleryPremiumFontScale(size: PortfolioGalleryPremiumFontSize): number {
  return GALLERY_PREMIUM_FONT_SCALE[size] ?? 1;
}

/** Decorative SVG beside the gallery grid (`none` hides it). */
export type PortfolioGalleryIllustrationVariant =
  | 'none'
  | 'chat'
  | 'question'
  | 'docs'
  | 'support'
  | 'hex';
/** Side of the grid for the decorative SVG on large screens. */
export type PortfolioGalleryIllustrationPlacement = 'left' | 'right';

export type PortfolioGalleryPresentationSettings = PortfolioSectionBackgroundSettings & {
  design: PortfolioGalleryDesign;
  columns: 1 | 2 | 3 | 4;
  gap: number;
  /** Vertical (row) gap — defaults to `gap` when not set or -1. */
  verticalGap: number;
  radius: number;
  padding: number;
  titlePlacement: PortfolioGalleryTitlePlacement;
  /** Tall-row: item titles always on the photo, or only on hover with a dim veil. */
  tallRowTitleReveal: PortfolioGalleryTallRowTitleReveal;
  imageAspect: PortfolioGalleryAspect;
  objectFit: PortfolioGalleryObjectFit;
  objectPosition: PortfolioGalleryObjectPosition;
  hoverZoom: boolean;
  showTitle: boolean;
  lightboxEnabled: boolean;
  titlePreset: PortfolioGalleryTitlePreset;
  titleCustom: string;
  subtitlePreset: PortfolioGallerySubtitlePreset;
  subtitleCustom: string;
  titleFont: PortfolioGalleryHeaderFont;
  subtitleFont: PortfolioGalleryHeaderFont;
  headerAlignment: PortfolioGalleryHeaderAlignment;
  /**
   * Section title vs gallery grid composition.
   * Not the same as item `titlePlacement` or block `placement` (Design tab).
   */
  sectionLayout: PortfolioGallerySectionLayout;
  /** Decorative SVG beside the gallery grid (`none` hides it). */
  illustrationVariant: PortfolioGalleryIllustrationVariant;
  /** Side of the grid for the decorative SVG on large screens. */
  illustrationPlacement: PortfolioGalleryIllustrationPlacement;
  titleColor: string;
  subtitleColor: string;
  itemTitleColor: string;
  overlayColor: string;
  overlayOpacity: number;
  useHeroPalette: boolean;
  /** User override — 'auto' (default) follows Global → Theme's site-wide mode. */
  colorModeOverride: PortfolioSectionColorMode;
  galleryPalette?: PortfolioHeroPalette;
  galleryColorBindings?: PortfolioGalleryColorBindings;
  maxWidth: PortfolioGalleryMaxWidth;
  placement: PortfolioGalleryPlacement;
  /** Prev/next arrows for strip and carousel designs. */
  showCarouselNav: boolean;
  /** Dot indicators under caption carousel. */
  showPagination: boolean;
  /** Caption-carousel pager: cinema-style chevrons, or page dots. */
  captionPager: PortfolioGalleryCaptionPager;
  /** Surface behind caption-carousel cards. */
  cardSurfaceColor: string;
  /** Card width for the caption-carousel design. */
  captionCardWidthPx: number;
  /** Featured-strip thumbnails: stacked on the right, or in a row under the hero. */
  featuredRailPlacement: PortfolioGalleryFeaturedRailPlacement;
  /** Apply width/placement to the whole block, or only the top image. */
  featuredHeroWidthScope: PortfolioGalleryFeaturedWidthScope;
  /** Width of the featured hero (or whole bottom layout) as a percent of the gallery. */
  featuredHeroWidthPercent: number;
  /** Horizontal placement of the featured hero (or whole bottom layout). */
  featuredHeroPlacement: PortfolioGalleryPlacement;
  /**
   * Header — one shared, GSAP-animated header mounted above the Gallery section, copied
   * from the Portfolio/Work section's Header mechanism (gallery-portfolio-header-designs/*).
   */
  headerDesign: PortfolioGalleryHeaderDesign;
  /** Master switch for the header's GSAP entrance/scroll motion (respects prefers-reduced-motion regardless). */
  headerAnimationEnabled: boolean;
  headerDesignAlignment: PortfolioGalleryHeaderDesignAlignment;
  /** Bottom spacing under every header design — shared across all of them. */
  headerMarginBottom: PortfolioGalleryHeaderMarginBottom;
  /** Title size/weight — shared across every header design. */
  headerTitleSize: PortfolioGalleryHeaderTitleSize;
  headerTitleWeight: PortfolioGalleryHeaderTitleWeight;
  /** Header accent count — badge text supports a {count} token for the gallery item count. */
  headerAccentCountBadgeText: string;
  headerAccentCountLeadText: string;
  /** Header accent count — badge and lead bound to a palette token, independently. */
  headerAccentCountBadgeColor: PortfolioGalleryHeaderPaletteToken;
  headerAccentCountLeadColor: PortfolioGalleryHeaderPaletteToken;
  /** Header accent count — one size/weight for the whole line (badge + lead flow together). */
  headerAccentCountSize: PortfolioGalleryHeaderTitleSize;
  headerAccentCountWeight: PortfolioGalleryHeaderTitleWeight;
  /** Header accent count — its own 3-way alignment (adds "right", unlike the shared control). */
  headerAccentCountAlignment: PortfolioGalleryHeaderAccentCountAlignment;
  /** Header serif lead — small label above the large serif title. */
  headerSerifLeadLabelText: string;
  /** Header serif lead — the large serif title itself, independent of the section title. */
  headerSerifLeadTitleText: string;
  /** Header serif lead — each element bound to a palette token, independently. */
  headerSerifLeadLabelColor: PortfolioGalleryHeaderPaletteToken;
  headerSerifLeadTitleColor: PortfolioGalleryHeaderPaletteToken;
  headerSerifLeadSubtitleColor: PortfolioGalleryHeaderPaletteToken;
  /** Header serif lead — each element sized/weighted independently. */
  headerSerifLeadLabelSize: PortfolioGalleryHeaderTitleSize;
  headerSerifLeadTitleSize: PortfolioGalleryHeaderTitleSize;
  headerSerifLeadSubtitleSize: PortfolioGalleryHeaderTitleSize;
  headerSerifLeadLabelWeight: PortfolioGalleryHeaderTitleWeight;
  headerSerifLeadTitleWeight: PortfolioGalleryHeaderTitleWeight;
  headerSerifLeadSubtitleWeight: PortfolioGalleryHeaderTitleWeight;
  /** Header billboard — big faint background word + a {count}-token line. */
  headerBillboardBigWord: string;
  headerBillboardCountText: string;
  /** Header billboard — the editorial split title beneath the big word, independent of the section title. */
  headerBillboardTitleText: string;
  /** Header billboard — outline (stroke only) or fill (solid) big word. */
  headerBillboardWordStyle: PortfolioGalleryHeaderBillboardWordStyle;
  /** Header billboard — each element bound to a palette token, independently. */
  headerBillboardWordColor: PortfolioGalleryHeaderPaletteToken;
  headerBillboardTitleColor: PortfolioGalleryHeaderPaletteToken;
  headerBillboardMetaColor: PortfolioGalleryHeaderPaletteToken;
  /** Header split heading — small label on the side opposite the narrative title. */
  headerSplitHeadingLabelText: string;
  /** Header split heading — the narrative title itself, independent of the section title. */
  headerSplitHeadingTitleText: string;
  /** Header split heading — each element bound to a palette token, independently. */
  headerSplitHeadingTitleColor: PortfolioGalleryHeaderPaletteToken;
  headerSplitHeadingLabelColor: PortfolioGalleryHeaderPaletteToken;
  /** Header split heading — each element sized/weighted independently. */
  headerSplitHeadingTitleSize: PortfolioGalleryHeaderTitleSize;
  headerSplitHeadingTitleWeight: PortfolioGalleryHeaderTitleWeight;
  headerSplitHeadingLabelSize: PortfolioGalleryHeaderTitleSize;
  headerSplitHeadingLabelWeight: PortfolioGalleryHeaderTitleWeight;
  /** Header masthead — up to 3 independent lines, monumental headline text,
   *  one color/size/weight for the whole headline. */
  headerMastheadLine1Text: string;
  headerMastheadLine2Text: string;
  headerMastheadLine3Text: string;
  /** Header masthead — one color for the whole headline, across every line. */
  headerMastheadHeadlineColor: PortfolioGalleryHeaderPaletteToken;
  /** Header masthead — one size/weight for the whole headline, across every line. */
  headerMastheadHeadlineSize: PortfolioGalleryHeaderTitleSize;
  headerMastheadHeadlineWeight: PortfolioGalleryHeaderTitleWeight;
  /** Header index — small label on the top divider rule (e.g. "Index", "Catalog"). */
  headerIndexLabelText: string;
  /** Header index — the title beside the counting numeral, independent of the section title. */
  headerIndexTitleText: string;
  /** Header index — caption under the counter (e.g. "Items"). Empty falls back to automatic pluralization. */
  headerIndexCountLabelText: string;
  /** Header index — the small subtitle under the title, independent of the section subtitle. */
  headerIndexSubtitleText: string;
  /** Header index — each element bound to a palette token, independently. */
  headerIndexLabelColor: PortfolioGalleryHeaderPaletteToken;
  headerIndexNumberColor: PortfolioGalleryHeaderPaletteToken;
  headerIndexTitleColor: PortfolioGalleryHeaderPaletteToken;
  headerIndexSubtitleColor: PortfolioGalleryHeaderPaletteToken;
  /** Header index — each element sized/weighted independently. */
  headerIndexLabelSize: PortfolioGalleryHeaderTitleSize;
  headerIndexLabelWeight: PortfolioGalleryHeaderTitleWeight;
  headerIndexTitleSize: PortfolioGalleryHeaderTitleSize;
  headerIndexTitleWeight: PortfolioGalleryHeaderTitleWeight;
  headerIndexSubtitleSize: PortfolioGalleryHeaderTitleSize;
  headerIndexSubtitleWeight: PortfolioGalleryHeaderTitleWeight;
  /** Header marquee — up to 4 independent words in the repeating band, each its own field (empty slots are dropped). */
  headerMarqueeWord1Text: string;
  headerMarqueeWord2Text: string;
  headerMarqueeWord3Text: string;
  headerMarqueeWord4Text: string;
  /** Header marquee — alternating fill/outline words bound to one palette token. */
  headerMarqueeWordColor: PortfolioGalleryHeaderPaletteToken;
  /** Header marquee — scales the repeating word band. */
  headerMarqueeSize: PortfolioGalleryHeaderTitleSize;
  /** General tab "Font size" — section-wide body/caption type scale. */
  premiumFontSize: PortfolioGalleryPremiumFontSize;
};

export type PortfolioGallerySectionSettings =
  PortfolioSectionCopy & PortfolioGalleryPresentationSettings;

export const PORTFOLIO_GALLERY_DESIGN_OPTIONS: {
  value: PortfolioGalleryDesign;
  label: string;
  description: string;
}[] = [
  { value: 'framed-grid', label: 'Framed grid', description: 'Classic responsive grid with captions.' },
  { value: 'caption-carousel', label: 'Caption cards', description: 'Image-and-title cards, horizontal scroll with arrows.' },
  { value: 'cinema-strip', label: 'Cinema strip', description: 'Wide horizontal scroll with navigation arrows.' },
  { value: 'hero-mosaic', label: 'Hero mosaic', description: 'Featured image with a mosaic that adapts to the media count.' },
  { value: 'featured-strip', label: 'Featured + rail', description: 'Large image on the left, thumbnails stacked on the right.' },
  { value: 'tall-row', label: 'Tall + row', description: 'A taller first image on the left, three shorter ones on the right.' },
  { value: 'editorial-split', label: 'Editorial split', description: 'Alternating wide and compact compositions.' },
];

export const PORTFOLIO_GALLERY_DESIGNS = PORTFOLIO_GALLERY_DESIGN_OPTIONS.map((option) => option.value);

export const PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS = [
  { value: 'none', label: 'None', description: 'Hide the gallery section title.' },
  { value: 'gallery', label: 'Gallery', description: 'Simple English title.' },
  { value: 'selected-work', label: 'Selected work', description: 'A selection of work.' },
  { value: 'visual-journal', label: 'Visual journal', description: 'A more editorial heading.' },
  { value: 'custom', label: 'Custom', description: 'Enter your own title.' },
] as const;

export const PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS = [
  { value: 'default', label: 'Default', description: 'Images, films, and chosen moments.' },
  { value: 'selection', label: 'Selection', description: 'A selection of recent work.' },
  { value: 'journal', label: 'Journal', description: 'Fragments of projects and visual research.' },
  { value: 'minimal', label: 'None', description: 'Hide the subtitle.' },
  { value: 'custom', label: 'Custom', description: 'Enter your own text.' },
] as const;

export const PORTFOLIO_GALLERY_SECTION_LAYOUT_OPTIONS: {
  value: PortfolioGallerySectionLayout;
  label: string;
  description: string;
}[] = [
  {
    value: 'stacked',
    label: 'Stacked',
    description: 'Section title above the grid.',
  },
  {
    value: 'aside-left',
    label: 'Title left',
    description: 'Section title on the left, grid on the right (side by side).',
  },
  {
    value: 'aside-right',
    label: 'Title right',
    description: 'Grid on the left, section title on the right (side by side).',
  },
  {
    value: 'over-thumbs',
    label: 'Above thumbnails',
    description: 'Title and subtitle centered above the thumbnails (Tall + row), or in the empty space beside the featured image.',
  },
];

export const PORTFOLIO_GALLERY_ILLUSTRATION_OPTIONS: {
  value: PortfolioGalleryIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No decorative SVG beside the grid.' },
  { value: 'chat', label: 'Chat', description: 'Conversation bubbles.' },
  { value: 'question', label: 'Question', description: 'Graphic question mark.' },
  { value: 'docs', label: 'Docs', description: 'Stacked documents.' },
  { value: 'support', label: 'Support', description: 'Support illustration.' },
  { value: 'hex', label: 'Hex', description: 'Hexagonal symbol.' },
];

export const PORTFOLIO_GALLERY_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioGalleryIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'SVG on the left of the grid.' },
  { value: 'right', label: 'Right', description: 'SVG on the right of the grid.' },
];

export const GALLERY_SECTION_LAYOUTS = ['stacked', 'aside-left', 'aside-right', 'over-thumbs'] as const;
export const GALLERY_ILLUSTRATION_VARIANTS = [
  'none',
  'chat',
  'question',
  'docs',
  'support',
  'hex',
] as const;
export const GALLERY_ILLUSTRATION_PLACEMENTS = ['left', 'right'] as const;

export function isPortfolioGallerySectionLayout(
  value: unknown
): value is PortfolioGallerySectionLayout {
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right' || value === 'over-thumbs';
}

export function gallerySectionLayoutIsAside(
  layout: PortfolioGallerySectionLayout | undefined
): layout is 'aside-left' | 'aside-right' {
  return layout === 'aside-left' || layout === 'aside-right';
}

export function gallerySectionLayoutEmbedsInTallRow(
  layout: PortfolioGallerySectionLayout | undefined,
  design: PortfolioGalleryDesign | undefined
): boolean {
  return design === 'tall-row' && layout === 'over-thumbs';
}

/** Leftover width beside the featured hero is enough for the section title. */
export function galleryFeaturedHeroHasTitleVoid(
  presentation: Pick<
    PortfolioGalleryPresentationSettings,
    | 'design'
    | 'featuredRailPlacement'
    | 'featuredHeroWidthScope'
    | 'featuredHeroWidthPercent'
    | 'featuredHeroPlacement'
  >
): boolean {
  if (presentation.design !== 'featured-strip') return false;
  if ((presentation.featuredRailPlacement ?? 'right') !== 'bottom') return false;
  if ((presentation.featuredHeroWidthScope ?? 'hero') === 'global') return false;
  const percent = presentation.featuredHeroWidthPercent ?? 100;
  const leftover = 100 - percent;
  if (leftover < 22) return false;
  if ((presentation.featuredHeroPlacement ?? 'center') === 'center') {
    return leftover / 2 >= 16;
  }
  return true;
}

export function gallerySectionLayoutEmbedsHeader(
  layout: PortfolioGallerySectionLayout | undefined,
  presentation: Pick<
    PortfolioGalleryPresentationSettings,
    | 'design'
    | 'featuredRailPlacement'
    | 'featuredHeroWidthScope'
    | 'featuredHeroWidthPercent'
    | 'featuredHeroPlacement'
  >
): boolean {
  if (gallerySectionLayoutIsAside(layout)) return false;
  if (gallerySectionLayoutEmbedsInTallRow(layout, presentation.design)) return true;
  return galleryFeaturedHeroHasTitleVoid(presentation);
}

export const DEFAULT_GALLERY_PRESENTATION: PortfolioGalleryPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'framed-grid',
  columns: 3,
  gap: 24,
  verticalGap: -1,
  radius: 16,
  padding: 0,
  titlePlacement: 'under',
  tallRowTitleReveal: 'always',
  imageAspect: 'landscape',
  objectFit: 'cover',
  objectPosition: 'center',
  hoverZoom: true,
  showTitle: true,
  lightboxEnabled: true,
  titlePreset: 'gallery',
  titleCustom: '',
  subtitlePreset: 'default',
  subtitleCustom: '',
  titleFont: 'sans',
  subtitleFont: 'sans',
  headerAlignment: 'left',
  sectionLayout: 'stacked',
  illustrationVariant: 'none',
  illustrationPlacement: 'right',
  titleColor: '#0a0a0a',
  subtitleColor: '#737373',
  itemTitleColor: '#171717',
  overlayColor: '#000000',
  overlayOpacity: 46,
  useHeroPalette: true,
  colorModeOverride: 'auto',
  maxWidth: 'full',
  placement: 'center',
  showCarouselNav: true,
  showPagination: true,
  captionPager: 'chevrons',
  cardSurfaceColor: '#ffffff',
  captionCardWidthPx: 320,
  featuredRailPlacement: 'right',
  featuredHeroWidthScope: 'hero',
  featuredHeroWidthPercent: 100,
  featuredHeroPlacement: 'center',
  headerDesign: 'editorial',
  headerAnimationEnabled: true,
  headerDesignAlignment: 'left',
  headerMarginBottom: 'md',
  headerTitleSize: 'md',
  headerTitleWeight: 'regular',
  headerAccentCountBadgeText: '',
  headerAccentCountLeadText: '',
  headerAccentCountBadgeColor: 'principal',
  headerAccentCountLeadColor: 'secondaire',
  headerAccentCountSize: 'md',
  headerAccentCountWeight: 'regular',
  headerAccentCountAlignment: 'left',
  headerSerifLeadLabelText: '',
  headerSerifLeadTitleText: '',
  headerSerifLeadLabelColor: 'texteFort',
  headerSerifLeadTitleColor: 'texteFort',
  headerSerifLeadSubtitleColor: 'texteFort',
  headerSerifLeadLabelSize: 'md',
  headerSerifLeadTitleSize: 'md',
  headerSerifLeadSubtitleSize: 'md',
  headerSerifLeadLabelWeight: 'regular',
  headerSerifLeadTitleWeight: 'regular',
  headerSerifLeadSubtitleWeight: 'regular',
  headerBillboardBigWord: '',
  headerBillboardCountText: '',
  headerBillboardTitleText: '',
  headerBillboardWordStyle: 'outline',
  headerBillboardWordColor: 'principal',
  headerBillboardTitleColor: 'principal',
  headerBillboardMetaColor: 'secondaire',
  headerSplitHeadingLabelText: '',
  headerSplitHeadingTitleText: '',
  headerSplitHeadingTitleColor: 'principal',
  headerSplitHeadingLabelColor: 'secondaire',
  headerSplitHeadingTitleSize: 'md',
  headerSplitHeadingTitleWeight: 'regular',
  headerSplitHeadingLabelSize: 'md',
  headerSplitHeadingLabelWeight: 'regular',
  headerMastheadLine1Text: '',
  headerMastheadLine2Text: '',
  headerMastheadLine3Text: '',
  headerMastheadHeadlineColor: 'principal',
  headerMastheadHeadlineSize: 'md',
  headerMastheadHeadlineWeight: 'regular',
  headerIndexLabelText: '',
  headerIndexTitleText: '',
  headerIndexCountLabelText: '',
  headerIndexSubtitleText: '',
  headerIndexLabelColor: 'texteFort',
  headerIndexNumberColor: 'principal',
  headerIndexTitleColor: 'texteFort',
  headerIndexSubtitleColor: 'texteFort',
  headerIndexLabelSize: 'md',
  headerIndexLabelWeight: 'regular',
  headerIndexTitleSize: 'md',
  headerIndexTitleWeight: 'regular',
  headerIndexSubtitleSize: 'md',
  headerIndexSubtitleWeight: 'regular',
  headerMarqueeWord1Text: '',
  headerMarqueeWord2Text: '',
  headerMarqueeWord3Text: '',
  headerMarqueeWord4Text: '',
  headerMarqueeWordColor: 'principal',
  headerMarqueeSize: 'md',
  premiumFontSize: 'medium',
};

export const DEFAULT_GALLERY_TITLE_EN = 'Gallery';
export const DEFAULT_GALLERY_SUBTITLE_EN = 'Images, films, and chosen moments.';
const LEGACY_GALLERY_TITLES = new Set(['Galerie', 'GALERIE']);
const LEGACY_GALLERY_SUBTITLES = new Set(['Images, films et instants choisis.']);

export function migrateLegacyGalleryCopy(title: string, subtitle: string): { title: string; subtitle: string } {
  return {
    title: LEGACY_GALLERY_TITLES.has(title.trim()) ? DEFAULT_GALLERY_TITLE_EN : title,
    subtitle: LEGACY_GALLERY_SUBTITLES.has(subtitle.trim()) ? DEFAULT_GALLERY_SUBTITLE_EN : subtitle,
  };
}

export {
  PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS,
  GALLERY_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  GALLERY_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  GALLERY_HEADER_PALETTE_TOKEN_OPTIONS,
  galleryHeaderDesignFontClass,
  galleryHeaderDesignFontStyle,
  galleryHeaderPaletteTokenColor,
  type PortfolioGalleryHeaderAccentCountAlignment,
  type PortfolioGalleryHeaderBillboardWordStyle,
  type PortfolioGalleryHeaderDesign,
  type PortfolioGalleryHeaderDesignAlignment,
  type PortfolioGalleryHeaderMarginBottom,
  type PortfolioGalleryHeaderPaletteToken,
  type PortfolioGalleryHeaderTitleSize,
  type PortfolioGalleryHeaderTitleWeight,
} from '@/components/portfolio/portfolio-gallery-header-settings';

export const PORTFOLIO_GALLERY_FEATURED_RAIL_OPTIONS: {
  value: PortfolioGalleryFeaturedRailPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'right', label: 'Stacked right', description: 'Thumbnails stacked to the right of the main image.' },
  { value: 'bottom', label: 'Row below', description: 'Thumbnails in a row under the main image.' },
];

export const PORTFOLIO_GALLERY_FEATURED_WIDTH_SCOPE_OPTIONS: {
  value: PortfolioGalleryFeaturedWidthScope;
  label: string;
  description: string;
}[] = [
  { value: 'hero', label: 'Top image only', description: 'Width and placement applied to the main image only.' },
  { value: 'global', label: 'Whole block', description: 'Width and placement applied to the image and thumbnails together.' },
];

export function galleryDesignUsesCarouselNav(design: PortfolioGalleryDesign): boolean {
  return design === 'cinema-strip' || design === 'caption-carousel' || design === 'featured-strip' || design === 'tall-row';
}

export function galleryDesignUsesColumns(design: PortfolioGalleryDesign): boolean {
  return design !== 'cinema-strip' && design !== 'caption-carousel' && design !== 'featured-strip' && design !== 'hero-mosaic' && design !== 'tall-row';
}

export function galleryDesignUsesCaptionCardWidth(design: PortfolioGalleryDesign): boolean {
  return design === 'cinema-strip' || design === 'caption-carousel';
}

export function galleryCaptionCardWidthClass(columns: number): string {
  if (columns === 1) return 'w-[88vw] sm:w-full';
  if (columns === 2) return 'w-[72vw] sm:w-[calc((100%-var(--gallery-gap,24px))/2)]';
  if (columns === 4) return 'w-[56vw] sm:w-[calc((100%-var(--gallery-gap,24px)*3)/4)]';
  return 'w-[64vw] sm:w-[calc((100%-var(--gallery-gap,24px)*2)/3)]';
}

function pickString<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

function color(value: unknown, fallback: string): string {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : fallback;
}

export function mergeGalleryPresentation(
  base: PortfolioGalleryPresentationSettings,
  patch: unknown
): PortfolioGalleryPresentationSettings {
  if (!patch || typeof patch !== 'object') return { ...base };
  const record = patch as Record<string, unknown>;
  return {
    ...mergeSectionBackground(base, patch),
    design: pickString(record.design, PORTFOLIO_GALLERY_DESIGNS, base.design),
    columns: clamp(record.columns, 1, 4, base.columns) as 1 | 2 | 3 | 4,
    gap: clamp(record.gap, 0, 64, base.gap),
    verticalGap: clamp(record.verticalGap, -1, 64, base.verticalGap),
    radius: clamp(record.radius, 0, 48, base.radius),
    padding: clamp(record.padding, 0, 96, base.padding),
    titlePlacement: pickString(record.titlePlacement, ['under', 'overlay', 'hidden'], base.titlePlacement),
    tallRowTitleReveal: pickString(record.tallRowTitleReveal, ['always', 'hover'], base.tallRowTitleReveal),
    imageAspect: pickString(record.imageAspect, ['auto', 'square', 'portrait', 'landscape', 'cinema'], base.imageAspect),
    objectFit: pickString(record.objectFit, ['cover', 'contain'], base.objectFit),
    objectPosition: pickString(record.objectPosition, ['center', 'top', 'bottom', 'left', 'right'], base.objectPosition),
    hoverZoom: typeof record.hoverZoom === 'boolean' ? record.hoverZoom : base.hoverZoom,
    showTitle: typeof record.showTitle === 'boolean' ? record.showTitle : base.showTitle,
    lightboxEnabled: typeof record.lightboxEnabled === 'boolean' ? record.lightboxEnabled : base.lightboxEnabled,
    titlePreset: pickString(record.titlePreset, ['none', 'gallery', 'selected-work', 'visual-journal', 'custom'], base.titlePreset),
    titleCustom: typeof record.titleCustom === 'string' ? record.titleCustom : base.titleCustom,
    subtitlePreset: pickString(record.subtitlePreset, ['default', 'selection', 'journal', 'minimal', 'custom'], base.subtitlePreset),
    subtitleCustom: typeof record.subtitleCustom === 'string' ? record.subtitleCustom : base.subtitleCustom,
    titleFont: pickString(record.titleFont, ['sans', 'serif', 'display'], base.titleFont),
    subtitleFont: pickString(record.subtitleFont, ['sans', 'serif', 'display'], base.subtitleFont),
    headerAlignment: pickString(record.headerAlignment, ['left', 'center'], base.headerAlignment),
    sectionLayout: pickString(
      record.sectionLayout,
      GALLERY_SECTION_LAYOUTS,
      base.sectionLayout ?? 'stacked'
    ),
    illustrationVariant: pickString(
      record.illustrationVariant,
      GALLERY_ILLUSTRATION_VARIANTS,
      base.illustrationVariant ?? 'none'
    ),
    illustrationPlacement: pickString(
      record.illustrationPlacement,
      GALLERY_ILLUSTRATION_PLACEMENTS,
      base.illustrationPlacement ?? 'right'
    ),
    titleColor: color(record.titleColor, base.titleColor),
    subtitleColor: color(record.subtitleColor, base.subtitleColor),
    itemTitleColor: color(record.itemTitleColor, base.itemTitleColor),
    overlayColor: color(record.overlayColor, base.overlayColor),
    overlayOpacity: clamp(record.overlayOpacity, 0, 90, base.overlayOpacity),
    useHeroPalette: typeof record.useHeroPalette === 'boolean' ? record.useHeroPalette : base.useHeroPalette,
    colorModeOverride: mergeSectionColorMode(record.colorModeOverride, base.colorModeOverride),
    galleryPalette:
      record.galleryPalette && typeof record.galleryPalette === 'object'
        ? (record.galleryPalette as PortfolioHeroPalette)
        : base.galleryPalette,
    galleryColorBindings:
      record.galleryColorBindings && typeof record.galleryColorBindings === 'object'
        ? (record.galleryColorBindings as PortfolioGalleryColorBindings)
        : base.galleryColorBindings,
    maxWidth: pickString(record.maxWidth, ['md', 'lg', 'xl', 'full'], base.maxWidth),
    placement: pickString(record.placement, ['left', 'center', 'right'], base.placement),
    showCarouselNav: typeof record.showCarouselNav === 'boolean' ? record.showCarouselNav : base.showCarouselNav,
    showPagination: typeof record.showPagination === 'boolean' ? record.showPagination : base.showPagination,
    captionPager: pickString(record.captionPager, ['chevrons', 'dots'], base.captionPager),
    cardSurfaceColor: color(record.cardSurfaceColor, base.cardSurfaceColor),
    captionCardWidthPx: clamp(record.captionCardWidthPx, 180, 420, base.captionCardWidthPx),
    featuredRailPlacement: pickString(record.featuredRailPlacement, ['right', 'bottom'], base.featuredRailPlacement),
    featuredHeroWidthScope: pickString(record.featuredHeroWidthScope, ['global', 'hero'], base.featuredHeroWidthScope),
    featuredHeroWidthPercent: clamp(record.featuredHeroWidthPercent, 50, 100, base.featuredHeroWidthPercent),
    featuredHeroPlacement: pickString(record.featuredHeroPlacement, ['left', 'center', 'right'], base.featuredHeroPlacement),
    headerDesign: pickString(record.headerDesign, GALLERY_HEADER_DESIGNS, base.headerDesign ?? 'editorial'),
    headerAnimationEnabled:
      typeof record.headerAnimationEnabled === 'boolean'
        ? record.headerAnimationEnabled
        : (base.headerAnimationEnabled ?? true),
    headerDesignAlignment: pickString(
      record.headerDesignAlignment,
      ['left', 'center', 'right'] as const,
      base.headerDesignAlignment ?? 'left'
    ),
    headerMarginBottom: pickString(
      record.headerMarginBottom,
      GALLERY_HEADER_MARGIN_BOTTOM_STEPS,
      base.headerMarginBottom ?? 'md'
    ),
    headerTitleSize: pickString(record.headerTitleSize, GALLERY_HEADER_TITLE_SIZES, base.headerTitleSize ?? 'md'),
    headerTitleWeight: pickString(
      record.headerTitleWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
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
    headerAccentCountBadgeColor: pickString(
      record.headerAccentCountBadgeColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerAccentCountBadgeColor ?? 'principal'
    ),
    headerAccentCountLeadColor: pickString(
      record.headerAccentCountLeadColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerAccentCountLeadColor ?? 'secondaire'
    ),
    headerAccentCountSize: pickString(
      record.headerAccentCountSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerAccentCountSize ?? 'md'
    ),
    headerAccentCountWeight: pickString(
      record.headerAccentCountWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
      base.headerAccentCountWeight ?? 'regular'
    ),
    headerAccentCountAlignment: pickString(
      record.headerAccentCountAlignment,
      GALLERY_HEADER_ACCENT_COUNT_ALIGNMENTS,
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
    headerSerifLeadLabelColor: pickString(
      record.headerSerifLeadLabelColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadLabelColor ?? 'texteFort'
    ),
    headerSerifLeadTitleColor: pickString(
      record.headerSerifLeadTitleColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadTitleColor ?? 'texteFort'
    ),
    headerSerifLeadSubtitleColor: pickString(
      record.headerSerifLeadSubtitleColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerSerifLeadSubtitleColor ?? 'texteFort'
    ),
    headerSerifLeadLabelSize: pickString(
      record.headerSerifLeadLabelSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerSerifLeadLabelSize ?? 'md'
    ),
    headerSerifLeadTitleSize: pickString(
      record.headerSerifLeadTitleSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerSerifLeadTitleSize ?? 'md'
    ),
    headerSerifLeadSubtitleSize: pickString(
      record.headerSerifLeadSubtitleSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerSerifLeadSubtitleSize ?? 'md'
    ),
    headerSerifLeadLabelWeight: pickString(
      record.headerSerifLeadLabelWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadLabelWeight ?? 'regular'
    ),
    headerSerifLeadTitleWeight: pickString(
      record.headerSerifLeadTitleWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
      base.headerSerifLeadTitleWeight ?? 'regular'
    ),
    headerSerifLeadSubtitleWeight: pickString(
      record.headerSerifLeadSubtitleWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
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
    headerBillboardWordStyle: pickString(
      record.headerBillboardWordStyle,
      GALLERY_HEADER_BILLBOARD_WORD_STYLES,
      base.headerBillboardWordStyle ?? 'outline'
    ),
    headerBillboardWordColor: pickString(
      record.headerBillboardWordColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerBillboardWordColor ?? 'principal'
    ),
    headerBillboardTitleColor: pickString(
      record.headerBillboardTitleColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerBillboardTitleColor ?? 'principal'
    ),
    headerBillboardMetaColor: pickString(
      record.headerBillboardMetaColor,
      GALLERY_HEADER_PALETTE_TOKENS,
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
    headerSplitHeadingTitleColor: pickString(
      record.headerSplitHeadingTitleColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingTitleColor ?? 'principal'
    ),
    headerSplitHeadingLabelColor: pickString(
      record.headerSplitHeadingLabelColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerSplitHeadingLabelColor ?? 'secondaire'
    ),
    headerSplitHeadingTitleSize: pickString(
      record.headerSplitHeadingTitleSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerSplitHeadingTitleSize ?? 'md'
    ),
    headerSplitHeadingTitleWeight: pickString(
      record.headerSplitHeadingTitleWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
      base.headerSplitHeadingTitleWeight ?? 'regular'
    ),
    headerSplitHeadingLabelSize: pickString(
      record.headerSplitHeadingLabelSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerSplitHeadingLabelSize ?? 'md'
    ),
    headerSplitHeadingLabelWeight: pickString(
      record.headerSplitHeadingLabelWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
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
    headerMastheadHeadlineColor: pickString(
      record.headerMastheadHeadlineColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerMastheadHeadlineColor ?? 'principal'
    ),
    headerMastheadHeadlineSize: pickString(
      record.headerMastheadHeadlineSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerMastheadHeadlineSize ?? 'md'
    ),
    headerMastheadHeadlineWeight: pickString(
      record.headerMastheadHeadlineWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
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
    headerIndexLabelColor: pickString(
      record.headerIndexLabelColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerIndexLabelColor ?? 'texteFort'
    ),
    headerIndexNumberColor: pickString(
      record.headerIndexNumberColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerIndexNumberColor ?? 'principal'
    ),
    headerIndexTitleColor: pickString(
      record.headerIndexTitleColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerIndexTitleColor ?? 'texteFort'
    ),
    headerIndexSubtitleColor: pickString(
      record.headerIndexSubtitleColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerIndexSubtitleColor ?? 'texteFort'
    ),
    headerIndexLabelSize: pickString(
      record.headerIndexLabelSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerIndexLabelSize ?? 'md'
    ),
    headerIndexLabelWeight: pickString(
      record.headerIndexLabelWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
      base.headerIndexLabelWeight ?? 'regular'
    ),
    headerIndexTitleSize: pickString(
      record.headerIndexTitleSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerIndexTitleSize ?? 'md'
    ),
    headerIndexTitleWeight: pickString(
      record.headerIndexTitleWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
      base.headerIndexTitleWeight ?? 'regular'
    ),
    headerIndexSubtitleSize: pickString(
      record.headerIndexSubtitleSize,
      GALLERY_HEADER_TITLE_SIZES,
      base.headerIndexSubtitleSize ?? 'md'
    ),
    headerIndexSubtitleWeight: pickString(
      record.headerIndexSubtitleWeight,
      GALLERY_HEADER_TITLE_WEIGHTS,
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
    headerMarqueeWordColor: pickString(
      record.headerMarqueeWordColor,
      GALLERY_HEADER_PALETTE_TOKENS,
      base.headerMarqueeWordColor ?? 'principal'
    ),
    headerMarqueeSize: pickString(record.headerMarqueeSize, GALLERY_HEADER_TITLE_SIZES, base.headerMarqueeSize ?? 'md'),
    premiumFontSize: pickString(record.premiumFontSize, GALLERY_PREMIUM_FONT_SIZES, base.premiumFontSize ?? 'medium'),
  };
}

export function pickGalleryPresentationSettings(value: unknown): PortfolioGalleryPresentationSettings {
  return mergeGalleryPresentation(DEFAULT_GALLERY_PRESENTATION, value);
}

/** Placeholder leftovers like "title" / "title 0" from older gallery items — not real captions. */
export function galleryItemDisplayTitle(title: string | null | undefined): string {
  const trimmed = (title ?? '').trim();
  if (!trimmed) return '';
  if (/^title(\s+\d+)?$/i.test(trimmed)) return '';
  return trimmed;
}

export function resolveGallerySectionTitle(
  settings: Pick<PortfolioGallerySectionSettings, 'titlePreset' | 'titleCustom' | 'title'>
): string {
  if (settings.titlePreset === 'none') return '';
  const raw =
    settings.titlePreset === 'selected-work'
      ? 'Selected work'
      : settings.titlePreset === 'visual-journal'
        ? 'Visual journal'
        : settings.titlePreset === 'custom'
          ? settings.titleCustom.trim() || settings.title.trim()
          : DEFAULT_GALLERY_TITLE_EN;
  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveGallerySectionSubtitle(
  settings: Pick<PortfolioGallerySectionSettings, 'subtitlePreset' | 'subtitleCustom' | 'subtitle'>
): string {
  if (settings.subtitlePreset === 'minimal') return '';
  if (settings.subtitlePreset === 'selection') return 'A selection of recent work.';
  if (settings.subtitlePreset === 'journal') return 'Fragments of projects and visual research.';
  if (settings.subtitlePreset === 'custom') return settings.subtitleCustom.trim() || settings.subtitle.trim();
  const stored = settings.subtitle.trim();
  if (!stored || LEGACY_GALLERY_SUBTITLES.has(stored)) return DEFAULT_GALLERY_SUBTITLE_EN;
  return stored;
}

export function galleryHeaderFontClass(font: PortfolioGalleryHeaderFont, kind: 'title' | 'subtitle'): string {
  if (font === 'serif') return kind === 'title' ? 'font-serif font-bold tracking-[-0.03em]' : 'font-serif leading-relaxed';
  if (font === 'display') return kind === 'title' ? 'font-black uppercase tracking-[0.08em]' : 'font-semibold uppercase tracking-[0.1em]';
  return kind === 'title' ? 'font-extrabold tracking-[-0.04em]' : 'leading-relaxed';
}

export function galleryHeaderFontStyle(_font: PortfolioGalleryHeaderFont): CSSProperties | undefined {
  return undefined;
}

export function galleryTitleColorStyle(value: string | undefined): CSSProperties {
  return { color: color(value, '#0a0a0a') };
}

export function gallerySubtitleColorStyle(value: string | undefined): CSSProperties {
  return { color: color(value, '#737373') };
}

export function galleryMaxWidthClass(width: PortfolioGalleryMaxWidth): string {
  if (width === 'md') return 'max-w-4xl';
  if (width === 'lg') return 'max-w-6xl';
  if (width === 'xl') return 'max-w-screen-2xl';
  return 'max-w-none';
}

export function galleryPlacementClass(placement: PortfolioGalleryPlacement): string {
  if (placement === 'left') return 'mr-auto';
  if (placement === 'right') return 'ml-auto';
  return 'mx-auto';
}

/** Resolved vertical gap — falls back to horizontal `gap` when verticalGap is -1. */
export function galleryEffectiveVerticalGap(presentation: Pick<PortfolioGalleryPresentationSettings, 'gap' | 'verticalGap'>): number {
  return presentation.verticalGap >= 0 ? presentation.verticalGap : presentation.gap;
}

export function galleryAspectStyle(aspect: PortfolioGalleryAspect): CSSProperties {
  const ratio = aspect === 'square' ? '1 / 1' : aspect === 'portrait' ? '4 / 5' : aspect === 'cinema' ? '16 / 7' : aspect === 'landscape' ? '4 / 3' : undefined;
  return ratio ? { aspectRatio: ratio } : {};
}
