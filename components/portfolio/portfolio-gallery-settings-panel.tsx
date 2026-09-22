'use client';

import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  galleryDesignUsesCarouselNav,
  galleryDesignUsesColumns,
  galleryDesignUsesCaptionCardWidth,
  PORTFOLIO_GALLERY_DESIGN_OPTIONS,
  PORTFOLIO_GALLERY_FEATURED_RAIL_OPTIONS,
  PORTFOLIO_GALLERY_FEATURED_WIDTH_SCOPE_OPTIONS,
  type PortfolioGallerySectionSettings,
} from '@/components/portfolio/portfolio-gallery-settings';

export type GallerySettingsSubSection = 'general' | 'layout';

const SUB_SECTIONS: { value: GallerySettingsSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'layout', label: 'Disposition' },
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

/** Same mini-wireframe/picker-card mechanism as Tools/Stack's Header design grid. */
/** Same animated switch + segmented option grid as Tools/Stack's layout settings. */
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
  return (
    <div className="space-y-6">
      <Select label="Réglages de la galerie" value={subSection} options={SUB_SECTIONS} onChange={(value) => onSubSectionChange?.(value)} />

      {subSection === 'general' ? (
        <div className="space-y-4">
          <Toggle label="Afficher la galerie" checked={gallery.enabled} onChange={(enabled) => onChange({ enabled })} />
          <Toggle label="Afficher les titres" description="Chaque média affiche uniquement son titre." checked={gallery.showTitle} onChange={(showTitle) => onChange({ showTitle })} />
          <Toggle label="Activer la lightbox" description="Ouvre le média dans une superposition accessible." checked={gallery.lightboxEnabled} onChange={(lightboxEnabled) => onChange({ lightboxEnabled })} />
          <SectionColorModeControl
            value={gallery.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
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
                  Largeur de chaque carte uniquement. La hauteur de l’image suit son ratio propre :
                  portrait s’allonge, cinéma s’aplatit.
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
            Placement horizontal du bloc média dans la section.
          </p>
        </div>
      ) : null}
    </div>
  );
}
