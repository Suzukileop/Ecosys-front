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
  | 'editorial-split';
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
export type PortfolioGalleryTitlePreset = 'gallery' | 'selected-work' | 'visual-journal' | 'custom';
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
};

export type PortfolioGallerySectionSettings =
  PortfolioSectionCopy & PortfolioGalleryPresentationSettings;

export const PORTFOLIO_GALLERY_DESIGN_OPTIONS = [
  { value: 'framed-grid', label: 'Grille encadrée', description: 'Grille responsive classique avec légendes.' },
  { value: 'masonry', label: 'Masonry', description: 'Colonnes fluides qui respectent la hauteur des médias.' },
  { value: 'cinema-strip', label: 'Bande cinéma', description: 'Défilement horizontal avec accrochage par image.' },
  { value: 'lightbox-stack', label: 'Lightbox stack', description: 'Grille dense pensée pour une ouverture plein écran.' },
  { value: 'editorial-split', label: 'Editorial split', description: 'Alternance de compositions larges et compactes.' },
] as const;

export const PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS = [
  { value: 'gallery', label: 'Galerie', description: 'Titre français simple.' },
  { value: 'selected-work', label: 'Sélection visuelle', description: 'Une sélection de créations.' },
  { value: 'visual-journal', label: 'Journal visuel', description: 'Une approche plus éditoriale.' },
  { value: 'custom', label: 'Personnalisé', description: 'Saisissez votre propre titre.' },
] as const;

export const PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS = [
  { value: 'default', label: 'Défaut', description: 'Images, films et instants choisis.' },
  { value: 'selection', label: 'Sélection', description: 'Une sélection de travaux récents.' },
  { value: 'journal', label: 'Journal', description: 'Fragments de projets et recherches visuelles.' },
  { value: 'minimal', label: 'Aucun', description: 'Masquer le sous-titre.' },
  { value: 'custom', label: 'Personnalisé', description: 'Saisissez votre propre texte.' },
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
};

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
    design: pickString(record.design, ['framed-grid', 'masonry', 'cinema-strip', 'lightbox-stack', 'editorial-split'], base.design),
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
    titlePreset: pickString(record.titlePreset, ['gallery', 'selected-work', 'visual-journal', 'custom'], base.titlePreset),
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
  };
}

export function pickGalleryPresentationSettings(value: unknown): PortfolioGalleryPresentationSettings {
  return mergeGalleryPresentation(DEFAULT_GALLERY_PRESENTATION, value);
}

export function resolveGallerySectionTitle(settings: PortfolioGallerySectionSettings): string {
  if (settings.titlePreset === 'selected-work') return 'SÉLECTION VISUELLE';
  if (settings.titlePreset === 'visual-journal') return 'JOURNAL VISUEL';
  if (settings.titlePreset === 'custom') return settings.titleCustom.trim() || settings.title.trim() || 'Galerie';
  return 'GALERIE';
}

export function resolveGallerySectionSubtitle(settings: PortfolioGallerySectionSettings): string {
  if (settings.subtitlePreset === 'minimal') return '';
  if (settings.subtitlePreset === 'selection') return 'Une sélection de travaux récents.';
  if (settings.subtitlePreset === 'journal') return 'Fragments de projets et recherches visuelles.';
  if (settings.subtitlePreset === 'custom') return settings.subtitleCustom.trim() || settings.subtitle.trim();
  return settings.subtitle.trim() || 'Images, films et instants choisis.';
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
