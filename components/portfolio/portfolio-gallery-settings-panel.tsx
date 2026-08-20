'use client';

import {
  galleryDesignUsesCarouselNav,
  galleryDesignUsesColumns,
  galleryDesignUsesCaptionCardWidth,
  gallerySectionLayoutIsAside,
  PORTFOLIO_GALLERY_DESIGN_OPTIONS,
  PORTFOLIO_GALLERY_FEATURED_RAIL_OPTIONS,
  PORTFOLIO_GALLERY_FEATURED_WIDTH_SCOPE_OPTIONS,
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
          {gallery.design === 'featured-strip' ? (
            <>
              <Select
                label="Placement des miniatures"
                value={gallery.featuredRailPlacement}
                options={PORTFOLIO_GALLERY_FEATURED_RAIL_OPTIONS}
                onChange={(featuredRailPlacement) => onChange({ featuredRailPlacement })}
              />
              {gallery.featuredRailPlacement === 'bottom' ? (
                <>
                  <Select
                    label="Appliquer largeur et placement"
                    value={gallery.featuredHeroWidthScope ?? 'hero'}
                    options={PORTFOLIO_GALLERY_FEATURED_WIDTH_SCOPE_OPTIONS}
                    onChange={(featuredHeroWidthScope) => onChange({ featuredHeroWidthScope })}
                  />
                  <Range
                    label={
                      gallery.featuredHeroWidthScope === 'global'
                        ? 'Largeur de l’affichage principal'
                        : 'Largeur de l’image principale'
                    }
                    value={gallery.featuredHeroWidthPercent}
                    min={50}
                    max={100}
                    suffix="%"
                    onChange={(featuredHeroWidthPercent) => onChange({ featuredHeroWidthPercent })}
                  />
                  <Select
                    label={
                      gallery.featuredHeroWidthScope === 'global'
                        ? 'Placement de l’affichage principal'
                        : 'Placement de l’image principale'
                    }
                    value={gallery.featuredHeroPlacement}
                    options={[
                      { value: 'left', label: 'Gauche' },
                      { value: 'center', label: 'Centre' },
                      { value: 'right', label: 'Droite' },
                    ]}
                    onChange={(featuredHeroPlacement) => onChange({ featuredHeroPlacement })}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {galleryDesignUsesCarouselNav(gallery.design) ? (
            <Toggle
              label="Flèches de navigation"
              description="Boutons précédent / suivant pour les galeries défilantes."
              checked={gallery.showCarouselNav}
              onChange={(showCarouselNav) => onChange({ showCarouselNav })}
            />
          ) : null}
          {galleryDesignUsesCaptionCardWidth(gallery.design) ? (
            <>
              <Range
                label="Largeur des cartes"
                value={gallery.captionCardWidthPx}
                min={180}
                max={420}
                onChange={(captionCardWidthPx) => onChange({ captionCardWidthPx })}
              />
              {gallery.design === 'caption-carousel' || gallery.design === 'cinema-strip' ? (
                <p className="text-sm text-neutral-500">
                  Largeur de chaque carte uniquement. La hauteur de l’image suit le ratio (onglet
                  Médias) : portrait s’allonge, cinéma s’aplatit.
                </p>
              ) : null}
            </>
          ) : null}
          {gallery.design === 'caption-carousel' ? (
            <>
              <Toggle
                label="Contrôles du carrousel"
                description="Afficher les boutons sous les cartes."
                checked={gallery.showPagination}
                onChange={(showPagination) => onChange({ showPagination })}
              />
              <Select
                label="Style des contrôles"
                value={gallery.captionPager ?? 'chevrons'}
                options={[
                  { value: 'chevrons', label: 'Chevrons — comme la bande cinéma' },
                  { value: 'dots', label: 'Points de pagination' },
                ]}
                onChange={(captionPager) => onChange({ captionPager })}
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
          <Range label="Espace horizontal" value={gallery.gap} min={0} max={64} onChange={(gap) => onChange({ gap })} />
          <Range
            label="Espace vertical"
            value={gallery.verticalGap >= 0 ? gallery.verticalGap : gallery.gap}
            min={0}
            max={64}
            onChange={(verticalGap) => onChange({ verticalGap })}
          />
          <button
            type="button"
            onClick={() => onChange({ verticalGap: -1 })}
            className={`text-xs font-medium transition ${
              gallery.verticalGap < 0
                ? 'text-neutral-400 cursor-default'
                : 'text-violet-600 hover:text-violet-800'
            }`}
            disabled={gallery.verticalGap < 0}
          >
            {gallery.verticalGap < 0 ? 'Espacement uniforme (lié)' : 'Lier les espacements'}
          </button>
          <Range label="Coins arrondis" value={gallery.radius} min={0} max={48} onChange={(radius) => onChange({ radius })} />
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
          {gallery.design === 'tall-row' ? (
            <Select
              label="Titre sur l’image haute + rangée"
              value={gallery.tallRowTitleReveal ?? 'always'}
              options={[
                { value: 'always', label: 'Toujours visible sur la photo' },
                { value: 'hover', label: 'Au survol — assombrit un peu l’image' },
              ]}
              onChange={(tallRowTitleReveal) => onChange({ tallRowTitleReveal })}
            />
          ) : null}
          <Select
            label="Ratio de l’image"
            value={gallery.imageAspect}
            options={[
              { value: 'auto', label: 'Original — proportions du fichier' },
              { value: 'square', label: 'Carré — 1:1' },
              { value: 'portrait', label: 'Portrait — 4:5' },
              { value: 'landscape', label: 'Paysage — 4:3' },
              { value: 'cinema', label: 'Cinéma — 16:7' },
            ]}
            onChange={(imageAspect) => onChange({ imageAspect })}
          />
          <p className="text-sm text-neutral-500">
            Forme du cadre photo sur toutes les cartes. Indépendant de la largeur des cartes
            (Disposition). Portrait = plus haut que large, paysage = plus large que haut.
          </p>
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
            ) : gallery.sectionLayout === 'over-thumbs' ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                Titre centré au-dessus des miniatures (Image haute + rangée), ou dans le vide à
                côté de l’image à la une si sa largeur laisse de la place.
              </p>
            ) : null}
          </div>

          <Select label="Title" value={gallery.titlePreset} options={PORTFOLIO_GALLERY_TITLE_PRESET_OPTIONS} onChange={(titlePreset) => onChange({ titlePreset })} />
          {gallery.titlePreset === 'custom' ? <input value={gallery.titleCustom} onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })} className="w-full rounded-xl border px-3 py-2.5" placeholder="Gallery" /> : null}
          <Select label="Subtitle" value={gallery.subtitlePreset} options={PORTFOLIO_GALLERY_SUBTITLE_PRESET_OPTIONS} onChange={(subtitlePreset) => onChange({ subtitlePreset })} />
          {gallery.subtitlePreset === 'custom' ? <textarea value={gallery.subtitleCustom} onChange={(event) => onChange({ subtitleCustom: event.target.value, subtitle: event.target.value })} className="w-full rounded-xl border px-3 py-2.5" rows={3} /> : null}
          <Select label="Police du titre" value={gallery.titleFont} options={[{ value: 'sans', label: 'Sans' }, { value: 'serif', label: 'Serif' }, { value: 'display', label: 'Display' }]} onChange={(titleFont) => onChange({ titleFont })} />
          <Select label="Police du sous-titre" value={gallery.subtitleFont} options={[{ value: 'sans', label: 'Sans' }, { value: 'serif', label: 'Serif' }, { value: 'display', label: 'Display' }]} onChange={(subtitleFont) => onChange({ subtitleFont })} />
          {gallerySectionLayoutIsAside(gallery.sectionLayout) || gallery.sectionLayout === 'over-thumbs' ? (
            <p className="text-sm text-neutral-500">
              Alignement horizontal masqué : le titre est déjà{' '}
              {gallery.sectionLayout === 'over-thumbs'
                ? 'centré au-dessus des miniatures'
                : gallery.sectionLayout === 'aside-right'
                  ? 'placé à droite de la grille'
                  : 'placé à gauche de la grille'}
              .
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
