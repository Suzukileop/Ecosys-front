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
  | 'title'
  | 'subtitle'
  | 'itemTitle'
  | 'overlay';

export type PortfolioGalleryColorBindings = Record<GalleryColorSlot, HeroPaletteTokenId>;

export const DEFAULT_GALLERY_COLOR_BINDINGS: PortfolioGalleryColorBindings = {
  sectionBackground: 'fond',
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
  { value: 'sectionBackground', label: 'Fond de section', description: 'Remplissage principal de la galerie.' },
  { value: 'title', label: 'Titre de section', description: 'Couleur du titre Galerie.' },
  { value: 'subtitle', label: 'Sous-titre', description: 'Texte introductif sous le titre.' },
  { value: 'itemTitle', label: 'Titre des médias', description: 'Légendes sous les images.' },
  { value: 'overlay', label: 'Overlay', description: 'Voile derrière les légendes superposées.' },
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
