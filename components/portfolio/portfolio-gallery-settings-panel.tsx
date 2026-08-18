'use client';

import {
  galleryDesignUsesCarouselNav,
  galleryDesignUsesColumns,
  gallerySectionLayoutIsAside,
  PORTFOLIO_GALLERY_DESIGN_OPTIONS,
  PORTFOLIO_GALLERY_ILLUSTRATION_OPTIONS,
  PORTFOLIO_GALLERY_ILLUSTRATION_PLACEMENT_OPTIONS,
  PORTFOLIO_GALLERY_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS,
  type PortfolioGallerySectionSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import {
  applyGalleryPaletteToSettings,
  mergeGalleryColorBindings,
  patchGalleryColorBinding,
  PORTFOLIO_GALLERY_COLOR_SLOT_OPTIONS,
} from '@/components/portfolio/portfolio-gallery-palette-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

export type GallerySettingsSubSection = 'general' | 'layout' | 'media' | 'header' | 'background' | 'palette';

const SUB_SECTIONS: { value: GallerySettingsSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'layout', label: 'Disposition' },
  { value: 'media', label: 'Médias' },
  { value: 'header', label: 'En-tête' },
  { value: 'background', label: 'Arrière-plan' },
  { value: 'palette', label: 'Palette' },
];

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
      <span>
        <span className="block text-sm font-semibold text-neutral-950">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4" />
    </label>
  );
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)} className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
  suffix = 'px',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
        <span>{label}</span><span>{value}{suffix}</span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-neutral-950" />
    </label>
  );
}

function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-14 rounded-lg border p-1" />
        <span className="font-mono text-sm text-neutral-600">{value}</span>
      </div>
    </label>
  );
}

export function GallerySettingsPanel({
  gallery,
  onChange,
  subSection = 'general',
  onSubSectionChange,
}: {
  gallery: PortfolioGallerySectionSettings;
  onChange: (patch: Partial<PortfolioGallerySectionSettings>) => void;
  subSection?: GallerySettingsSubSection;
  onSubSectionChange?: (value: GallerySettingsSubSection) => void;
}) {
  const paletteBindings = mergeGalleryColorBindings(gallery.galleryColorBindings);
  return (
    <div className="space-y-6">
      <Select label="Réglages de la galerie" value={subSection} options={SUB_SECTIONS} onChange={(value) => onSubSectionChange?.(value)} />

      {subSection === 'general' ? (
        <div className="space-y-4">
          <Toggle label="Afficher la galerie" checked={gallery.enabled} onChange={(enabled) => onChange({ enabled })} />
          <Toggle label="Afficher les titres" description="Chaque média affiche uniquement son titre." checked={gallery.showTitle} onChange={(showTitle) => onChange({ showTitle })} />
          <Toggle label="Activer la lightbox" description="Ouvre le média dans une superposition accessible." checked={gallery.lightboxEnabled} onChange={(lightboxEnabled) => onChange({ lightboxEnabled })} />
        </div>
      ) : null}

      {subSection === 'layout' ? (
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Design</p>
            <div className="grid gap-3">
              {PORTFOLIO_GALLERY_DESIGN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ design: option.value })}
                  className={`rounded-2xl border p-4 text-left ${
                    gallery.design === option.value
                      ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <span className="block text-sm font-bold text-neutral-950">{option.label}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
          {galleryDesignUsesColumns(gallery.design) ? (
            <Select label="Colonnes" value={String(gallery.columns)} options={['1', '2', '3', '4'].map((value) => ({ value, label: value }))} onChange={(columns) => onChange({ columns: Number(columns) as 1 | 2 | 3 | 4 })} />
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
              Ce design utilise une mise en page fixe — les colonnes ne s’appliquent pas.
            </p>
          )}
          {galleryDesignUsesCarouselNav(gallery.design) ? (
            <Toggle
              label="Flèches de navigation"
              description="Boutons précédent / suivant pour les galeries défilantes."
              checked={gallery.showCarouselNav}
              onChange={(showCarouselNav) => onChange({ showCarouselNav })}
            />
          ) : null}
          {gallery.design === 'caption-carousel' ? (
            <>
              <Toggle
                label="Points de pagination"
                description="Indicateurs sous le carrousel de cartes."
                checked={gallery.showPagination}
                onChange={(showPagination) => onChange({ showPagination })}
              />
              {!gallery.useHeroPalette ? (
                <Color
                  label="Fond des cartes"
                  value={gallery.cardSurfaceColor}
                  onChange={(cardSurfaceColor) => onChange({ cardSurfaceColor })}
                />
              ) : null}
            </>
          ) : null}
          <Range label="Espace" value={gallery.gap} min={0} max={64} onChange={(gap) => onChange({ gap })} />
          <Range label="Coins" value={gallery.radius} min={0} max={48} onChange={(radius) => onChange({ radius })} />
          <Range label="Padding" value={gallery.padding} min={0} max={96} onChange={(padding) => onChange({ padding })} />
          <Select label="Largeur maximale" value={gallery.maxWidth} options={[{ value: 'md', label: 'Moyenne' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Très large' }, { value: 'full', label: 'Pleine largeur' }]} onChange={(maxWidth) => onChange({ maxWidth })} />
          <Select
            label="Placement du bloc galerie"
            value={gallery.placement}
            options={[
              { value: 'left', label: 'Gauche' },
              { value: 'center', label: 'Centre' },
              { value: 'right', label: 'Droite' },
            ]}
            onChange={(placement) => onChange({ placement })}
          />
          <p className="text-sm text-neutral-500">
            Placement horizontal du bloc média dans la section — distinct de la disposition titre /
            grille (En-tête) et du placement du titre de chaque média (Médias).
          </p>
        </div>
      ) : null}

      {subSection === 'media' ? (
        <div className="space-y-5">
          <Select
            label="Placement du titre des médias"
            value={gallery.titlePlacement}
            options={[
              { value: 'under', label: 'Sous le média' },
              { value: 'overlay', label: 'Superposé' },
              { value: 'hidden', label: 'Masqué' },
            ]}
            onChange={(titlePlacement) => onChange({ titlePlacement })}
          />
          <p className="text-sm text-neutral-500">
            Position du titre sur chaque élément de la grille — distinct de la disposition du titre
            de section (En-tête).
          </p>
          <Select label="Ratio" value={gallery.imageAspect} options={[{ value: 'auto', label: 'Original' }, { value: 'square', label: 'Carré' }, { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Paysage' }, { value: 'cinema', label: 'Cinéma' }]} onChange={(imageAspect) => onChange({ imageAspect })} />
          <Select label="Ajustement" value={gallery.objectFit} options={[{ value: 'cover', label: 'Couvrir' }, { value: 'contain', label: 'Contenir' }]} onChange={(objectFit) => onChange({ objectFit })} />
          <Select label="Position" value={gallery.objectPosition} options={[{ value: 'center', label: 'Centre' }, { value: 'top', label: 'Haut' }, { value: 'bottom', label: 'Bas' }, { value: 'left', label: 'Gauche' }, { value: 'right', label: 'Droite' }]} onChange={(objectPosition) => onChange({ objectPosition })} />
          <Toggle label="Zoom au survol" checked={gallery.hoverZoom} onChange={(hoverZoom) => onChange({ hoverZoom })} />
          <Range label="Opacité overlay" value={gallery.overlayOpacity} min={0} max={90} suffix="%" onChange={(overlayOpacity) => onChange({ overlayOpacity })} />
          {!gallery.useHeroPalette ? <><Color label="Titre des médias" value={gallery.itemTitleColor} onChange={(itemTitleColor) => onChange({ itemTitleColor })} /><Color label="Overlay" value={gallery.overlayColor} onChange={(overlayColor) => onChange({ overlayColor })} /></> : null}
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-5">
          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Disposition titre / grille</p>
              <p className="mt-1 text-sm text-neutral-500">
                Composition du titre de section par rapport à la grille — pas le placement du titre
                de chaque média (Médias), ni le placement du bloc galerie (Disposition).
              </p>
            </div>
            <div className="grid gap-3">
              {PORTFOLIO_GALLERY_SECTION_LAYOUT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ sectionLayout: option.value })}
                  className={`rounded-2xl border p-4 text-left ${
                    (gallery.sectionLayout ?? 'stacked') === option.value
                      ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <span className="block text-sm font-bold text-neutral-950">{option.label}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                </button>
              ))}
            </div>
            {gallerySectionLayoutIsAside(gallery.sectionLayout) ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                En côte à côte, le titre de section et la grille s’affichent en deux colonnes sur
                grand écran (empilés sur mobile).
              </p>
            ) : null}
          </div>

          <Select label="Title" value={gallery.titlePreset} options={PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS} onChange={(titlePreset) => onChange({ titlePreset })} />
          {gallery.titlePreset === 'custom' ? <input value={gallery.titleCustom} onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })} className="w-full rounded-xl border px-3 py-2.5" placeholder="Gallery" /> : null}
          <Select label="Subtitle" value={gallery.subtitlePreset} options={PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS} onChange={(subtitlePreset) => onChange({ subtitlePreset })} />
          {gallery.subtitlePreset === 'custom' ? <textarea value={gallery.subtitleCustom} onChange={(event) => onChange({ subtitleCustom: event.target.value, subtitle: event.target.value })} className="w-full rounded-xl border px-3 py-2.5" rows={3} /> : null}
          <Select label="Police du titre" value={gallery.titleFont} options={[{ value: 'sans', label: 'Sans' }, { value: 'serif', label: 'Serif' }, { value: 'display', label: 'Display' }]} onChange={(titleFont) => onChange({ titleFont })} />
          <Select label="Police du sous-titre" value={gallery.subtitleFont} options={[{ value: 'sans', label: 'Sans' }, { value: 'serif', label: 'Serif' }, { value: 'display', label: 'Display' }]} onChange={(subtitleFont) => onChange({ subtitleFont })} />
          {gallerySectionLayoutIsAside(gallery.sectionLayout) ? (
            <p className="text-sm text-neutral-500">
              Alignement horizontal masqué : le titre est déjà placé{' '}
              {gallery.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} de la grille.
            </p>
          ) : (
            <Select
              label="Alignement"
              value={gallery.headerAlignment}
              options={[
                { value: 'left', label: 'Gauche' },
                { value: 'center', label: 'Centre' },
              ]}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
            />
          )}
          {!gallery.useHeroPalette ? <><Color label="Titre" value={gallery.titleColor} onChange={(titleColor) => onChange({ titleColor })} /><Color label="Sous-titre" value={gallery.subtitleColor} onChange={(subtitleColor) => onChange({ subtitleColor })} /></> : null}

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Illustration décorative</p>
              <p className="mt-1 text-sm text-neutral-500">
                SVG décoratif à côté de la grille. Distinct du placement des médias dans Disposition.
              </p>
            </div>
            <Select
              label="Style SVG"
              value={gallery.illustrationVariant ?? 'none'}
              options={PORTFOLIO_GALLERY_ILLUSTRATION_OPTIONS}
              onChange={(illustrationVariant) => onChange({ illustrationVariant })}
            />
            {(gallery.illustrationVariant ?? 'none') !== 'none' ? (
              <Select
                label="Placement du SVG"
                value={gallery.illustrationPlacement ?? 'right'}
                options={PORTFOLIO_GALLERY_ILLUSTRATION_PLACEMENT_OPTIONS}
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'background' ? <SectionBackgroundSettingsFields settings={gallery} onChange={onChange} /> : null}

      {subSection === 'palette' ? (
        <div className="space-y-5">
          <Toggle
            label="Utiliser la palette Hero"
            checked={gallery.useHeroPalette}
            onChange={(useHeroPalette) => onChange(useHeroPalette ? { useHeroPalette, ...applyGalleryPaletteToSettings(gallery) } : { useHeroPalette })}
          />
          {gallery.useHeroPalette ? PORTFOLIO_GALLERY_COLOR_SLOT_OPTIONS.map((slot) => (
            <Select
              key={slot.value}
              label={slot.label}
              value={paletteBindings[slot.value]}
              options={PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS}
              onChange={(token) => onChange(patchGalleryColorBinding(gallery, slot.value, token as HeroPaletteTokenId))}
            />
          )) : <p className="text-sm text-neutral-500">Palette désactivée : utilisez les couleurs manuelles dans Médias, En-tête et Arrière-plan.</p>}
        </div>
      ) : null}
    </div>
  );
}
