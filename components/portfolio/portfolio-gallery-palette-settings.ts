import {
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioGalleryPresentationSettings } from '@/components/portfolio/portfolio-gallery-settings';

export type GalleryColorSlot =
  | 'sectionBackground'
  | 'cardSurface'
  | 'title'
  | 'subtitle'
  | 'itemTitle'
  | 'overlay';

export type PortfolioGalleryColorBindings = Record<GalleryColorSlot, HeroPaletteTokenId>;

export const DEFAULT_GALLERY_COLOR_BINDINGS: PortfolioGalleryColorBindings = {
  sectionBackground: 'fond',
  cardSurface: 'neutre',
  title: 'texteFort',
  subtitle: 'texteMuted',
  itemTitle: 'texteFort',
  overlay: 'fond',
};

export const PORTFOLIO_GALLERY_COLOR_SLOT_OPTIONS: {
  value: GalleryColorSlot;
  label: string;
  description: string;
}[] = [
  { value: 'sectionBackground', label: 'Section background', description: 'Main gallery fill.' },
  { value: 'cardSurface', label: 'Card surface', description: 'Gallery card background and border (dark mode).' },
  { value: 'title', label: 'Section title', description: 'Gallery heading color.' },
  { value: 'subtitle', label: 'Subtitle', description: 'Intro text under the title.' },
  { value: 'itemTitle', label: 'Media titles', description: 'Captions under the images.' },
  { value: 'overlay', label: 'Overlay', description: 'Veil behind overlaid captions.' },
];

export type PortfolioGalleryPaletteHost = Partial<PortfolioGalleryPresentationSettings> & {
  galleryPalette?: Partial<PortfolioHeroPalette>;
  galleryColorBindings?: Partial<PortfolioGalleryColorBindings>;
};

export function mergeGalleryColorBindings(
  value: unknown
): PortfolioGalleryColorBindings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_GALLERY_COLOR_BINDINGS };
  const record = value as Record<string, unknown>;
  const next = { ...DEFAULT_GALLERY_COLOR_BINDINGS };
  for (const slot of Object.keys(next) as GalleryColorSlot[]) {
    if (typeof record[slot] === 'string') next[slot] = record[slot] as HeroPaletteTokenId;
  }
  return next;
}

export function applyGalleryPaletteToSettings(
  gallery: PortfolioGalleryPaletteHost,
  palettePatch?: Partial<PortfolioHeroPalette>
): Partial<PortfolioGalleryPresentationSettings> & {
  galleryPalette: PortfolioHeroPalette;
  galleryColorBindings: PortfolioGalleryColorBindings;
} {
  const galleryPalette = mergeHeroPalette(
    DEFAULT_HERO_PALETTE,
    palettePatch ?? gallery.galleryPalette
  );
  const galleryColorBindings = mergeGalleryColorBindings(gallery.galleryColorBindings);
  return {
    galleryPalette,
    galleryColorBindings,
    sectionBackgroundColor: resolveHeroPaletteColor(galleryPalette, galleryColorBindings.sectionBackground),
    cardSurfaceColor: resolveHeroPaletteColor(galleryPalette, galleryColorBindings.cardSurface),
    titleColor: resolveHeroPaletteColor(galleryPalette, galleryColorBindings.title),
    subtitleColor: resolveHeroPaletteColor(galleryPalette, galleryColorBindings.subtitle),
    itemTitleColor: resolveHeroPaletteColor(galleryPalette, galleryColorBindings.itemTitle),
    overlayColor: resolveHeroPaletteColor(galleryPalette, galleryColorBindings.overlay),
  };
}

export function patchGalleryColorBinding(
  gallery: PortfolioGalleryPaletteHost,
  slot: GalleryColorSlot,
  token: HeroPaletteTokenId
) {
  const galleryColorBindings = {
    ...mergeGalleryColorBindings(gallery.galleryColorBindings),
    [slot]: token,
  };
  return applyGalleryPaletteToSettings({ ...gallery, galleryColorBindings });
}
