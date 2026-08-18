import type { CSSProperties } from 'react';
import {
  DEFAULT_SECTION_BACKGROUND,
  mergeSectionBackground,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import type { PortfolioSectionCopy } from '@/components/portfolio/portfolio-settings-types';
import type { PortfolioHeroPalette } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioGalleryColorBindings } from '@/components/portfolio/portfolio-gallery-palette-settings';

export type PortfolioGalleryDesign =
  | 'framed-grid'
  | 'masonry'
  | 'cinema-strip'
  | 'lightbox-stack'
  | 'editorial-split'
  | 'caption-carousel'
  | 'hero-mosaic'
  | 'featured-strip';
export type PortfolioGalleryTitlePlacement = 'under' | 'overlay' | 'hidden';
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
export type PortfolioGalleryTitlePreset = 'gallery' | 'selected-work' | 'visual-journal' | 'custom' | 'none';
export type PortfolioGallerySubtitlePreset = 'default' | 'selection' | 'journal' | 'minimal' | 'custom';
/**
 * `stacked` — section title above the gallery grid (default).
 * `aside-left` / `aside-right` — section title beside the grid on large screens.
 * Distinct from per-item `titlePlacement` and block `placement`.
 */
export type PortfolioGallerySectionLayout = 'stacked' | 'aside-left' | 'aside-right';
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
  radius: number;
  padding: number;
  titlePlacement: PortfolioGalleryTitlePlacement;
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
   * Not the same as item `titlePlacement` (Médias) or block `placement` (Disposition).
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
  galleryPalette?: PortfolioHeroPalette;
  galleryColorBindings?: PortfolioGalleryColorBindings;
  maxWidth: PortfolioGalleryMaxWidth;
  placement: PortfolioGalleryPlacement;
  /** Prev/next arrows for strip and carousel designs. */
  showCarouselNav: boolean;
  /** Dot indicators under caption carousel. */
  showPagination: boolean;
  /** Surface behind caption-carousel cards. */
  cardSurfaceColor: string;
};

export type PortfolioGallerySectionSettings =
  PortfolioSectionCopy & PortfolioGalleryPresentationSettings;

export const PORTFOLIO_GALLERY_DESIGN_OPTIONS: {
  value: PortfolioGalleryDesign;
  label: string;
  description: string;
}[] = [
  { value: 'framed-grid', label: 'Grille encadrée', description: 'Grille responsive classique avec légendes.' },
  { value: 'caption-carousel', label: 'Cartes légendées', description: 'Cartes avec image et titre, défilement horizontal et points.' },
  { value: 'cinema-strip', label: 'Bande cinéma', description: 'Grand défilement horizontal avec flèches de navigation.' },
  { value: 'hero-mosaic', label: 'Mosaïque héros', description: 'Une grande image à gauche et une grille 2×2 à droite.' },
  { value: 'featured-strip', label: 'À la une + rail', description: 'Image vedette et bande horizontale avec légendes.' },
  { value: 'masonry', label: 'Masonry', description: 'Colonnes fluides qui respectent la hauteur des médias.' },
  { value: 'lightbox-stack', label: 'Lightbox stack', description: 'Grille dense pensée pour une ouverture plein écran.' },
  { value: 'editorial-split', label: 'Editorial split', description: 'Alternance de compositions larges et compactes.' },
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
    label: 'Empilé',
    description: 'Titre de section au-dessus de la grille.',
  },
  {
    value: 'aside-left',
    label: 'Titre à gauche',
    description: 'Titre de section à gauche, grille à droite (côte à côte).',
  },
  {
    value: 'aside-right',
    label: 'Titre à droite',
    description: 'Grille à gauche, titre de section à droite (côte à côte).',
  },
];

export const PORTFOLIO_GALLERY_ILLUSTRATION_OPTIONS: {
  value: PortfolioGalleryIllustrationVariant;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Aucun', description: 'Pas de SVG décoratif à côté de la grille.' },
  { value: 'chat', label: 'Chat', description: 'Bulles de conversation.' },
  { value: 'question', label: 'Question', description: 'Point d’interrogation graphique.' },
  { value: 'docs', label: 'Docs', description: 'Documents superposés.' },
  { value: 'support', label: 'Support', description: 'Illustration support.' },
  { value: 'hex', label: 'Hex', description: 'Symbole hexagonal.' },
];

export const PORTFOLIO_GALLERY_ILLUSTRATION_PLACEMENT_OPTIONS: {
  value: PortfolioGalleryIllustrationPlacement;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Gauche', description: 'SVG à gauche de la grille.' },
  { value: 'right', label: 'Droite', description: 'SVG à droite de la grille.' },
];

export const GALLERY_SECTION_LAYOUTS = ['stacked', 'aside-left', 'aside-right'] as const;
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
  return value === 'stacked' || value === 'aside-left' || value === 'aside-right';
}

export function gallerySectionLayoutIsAside(
  layout: PortfolioGallerySectionLayout | undefined
): boolean {
  return layout === 'aside-left' || layout === 'aside-right';
}

export const DEFAULT_GALLERY_PRESENTATION: PortfolioGalleryPresentationSettings = {
  ...DEFAULT_SECTION_BACKGROUND,
  design: 'framed-grid',
  columns: 3,
  gap: 24,
  radius: 16,
  padding: 0,
  titlePlacement: 'under',
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
  maxWidth: 'full',
  placement: 'center',
  showCarouselNav: true,
  showPagination: true,
  cardSurfaceColor: '#ffffff',
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

export function galleryDesignUsesCarouselNav(design: PortfolioGalleryDesign): boolean {
  return design === 'cinema-strip' || design === 'caption-carousel' || design === 'featured-strip';
}

export function galleryDesignUsesColumns(design: PortfolioGalleryDesign): boolean {
  return design !== 'cinema-strip' && design !== 'caption-carousel' && design !== 'featured-strip' && design !== 'hero-mosaic';
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
    radius: clamp(record.radius, 0, 48, base.radius),
    padding: clamp(record.padding, 0, 96, base.padding),
    titlePlacement: pickString(record.titlePlacement, ['under', 'overlay', 'hidden'], base.titlePlacement),
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
    cardSurfaceColor: color(record.cardSurfaceColor, base.cardSurfaceColor),
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
  if (settings.titlePreset === 'selected-work') return 'Selected work';
  if (settings.titlePreset === 'visual-journal') return 'Visual journal';
  if (settings.titlePreset === 'custom') return settings.titleCustom.trim() || settings.title.trim();
  return DEFAULT_GALLERY_TITLE_EN;
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

export function galleryHeaderFontStyle(font: PortfolioGalleryHeaderFont): CSSProperties | undefined {
  return font === 'serif' ? { fontFamily: "'Playfair Display', serif" } : undefined;
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

export function galleryAspectStyle(aspect: PortfolioGalleryAspect): CSSProperties {
  const ratio = aspect === 'square' ? '1 / 1' : aspect === 'portrait' ? '4 / 5' : aspect === 'cinema' ? '16 / 7' : aspect === 'landscape' ? '4 / 3' : undefined;
  return ratio ? { aspectRatio: ratio } : {};
}
