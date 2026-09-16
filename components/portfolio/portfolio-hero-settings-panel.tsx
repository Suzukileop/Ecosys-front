'use client';

import { useState } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { resolveHeroVisualFreeCell } from '@/components/portfolio/portfolio-hero-settings';
import {
  PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS,
  PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS,
  PORTFOLIO_HERO_EDITORIAL_OVERLAP_ALIGN_OPTIONS,
  PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS,
  PORTFOLIO_HERO_IDENTITY_INDEX_PORTRAIT_RADIUS_OPTIONS,
  PORTFOLIO_HERO_PORTRAIT_IDENTITY_BOTTOM_GAP_OPTIONS,
  PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS,
  heroBannerDesignSettingsPatch,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import { HeroBannerDesignPreview } from '@/components/portfolio/portfolio-hero-banner-skeletons';
import {
  applyHeroLayoutDivision,
  HERO_COLUMNS_3_MIDDLE_WEIGHT_MAX,
  HERO_COLUMNS_3_MIDDLE_WEIGHT_MIN,
  HERO_COLUMNS_3_SLOT_OPTIONS,
  HERO_VERTICAL_FRAME_GAP_PX_MAX,
  HERO_VERTICAL_FRAME_GAP_PX_MIN,
  isColumns3HeroDivision,
  isHorizontalHeroDivision,
  isVerticalHeroDivision,
  moveHeroColumns3Slot,
  PORTFOLIO_HERO_COLUMNS_3_VERTICAL_OPTIONS,
  PORTFOLIO_HERO_LAYOUT_DIVISION_OPTIONS,
  resolveHeroColumns3MiddleWeight,
  resolveHeroColumns3Order,
  resolveHeroColumns3SlotVertical,
  resolveHeroLayoutDivision,
  resolveHeroVerticalFrameGapPx,
  type HeroLayoutDivision,
} from '@/components/portfolio/portfolio-hero-layout-division';
import {
  applyHeroUltraWideColumns,
  autoPlaceHeroUltraWideSlots,
  HERO_COPY_COLUMN_SLOT_OPTIONS,
  HERO_VISUAL_COLUMN_SLOT_OPTIONS,
  PORTFOLIO_HERO_ULTRAWIDE_COLUMN_OPTIONS,
  resolveHeroUltraWideColumnLayout,
  type HeroColumnIndex,
  type HeroCopyColumnSlot,
  type HeroUltraWideColumnCount,
  type HeroVisualColumnSlot,
} from '@/components/portfolio/portfolio-hero-ultrawide-columns';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { HERO_VERTICAL_CELL_PLACEMENT_OPTIONS, type HeroVerticalCellPlacement } from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import { applyHeroPaletteToPresentation } from '@/components/portfolio/portfolio-hero-palette-settings';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';
import { PortfolioBackgroundImageUpload, PortfolioHeroBannerMediaUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { usePortfolioBackgroundLibrary } from '@/components/portfolio/portfolio-background-library-context';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

export type HeroSettingsSubSection = 'general' | 'banner';

const HERO_SETTINGS_SUB_SECTIONS: {
  id: HeroSettingsSubSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility, titles, and screen division (copy vs visual groups).',
  },
  {
    id: 'banner',
    label: 'Banner',
    description: 'Hero banner layouts — Classic, Swiss editorial, and future designs.',
  },
];

/** Map legacy subsection ids (saved UI state / search) onto remaining Hero menus. */
export function normalizeHeroSettingsSubSection(value: string | undefined): HeroSettingsSubSection {
  return value === 'banner' ? 'banner' : 'general';
}

/** Same pill-tab bar as the Stack/Tools settings panels. */
function HeroSubSectionTabs({
  value,
  onChange,
}: {
  value: HeroSettingsSubSection;
  onChange: (value: HeroSettingsSubSection) => void;
}) {
  const current = normalizeHeroSettingsSubSection(value);
  return (
    <div className="flex flex-wrap gap-2">
      {HERO_SETTINGS_SUB_SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChange(section.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            current === section.id
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

/** Same animated switch as the Stack/Tools settings panels (ToolsSwitchTrack/StackSwitchTrack). */
function HeroSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, var(--pf-palette-fond, #0a0a0a))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #ffffff)',
        }}
      />
    </span>
  );
}

function HeroToggleRow({
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
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-4 text-left"
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-900">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <span className="mt-1">
        <HeroSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

function HeroColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
          aria-label={`${label} hex`}
        />
        <span
          className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function HeroOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div
        className={`mt-3 grid gap-2 ${
          columns === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : columns === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : columns === 1
                ? 'grid-cols-1'
                : 'sm:grid-cols-2'
        }`}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Compact 3×3 snap grid for vertical screen-division placement. */
function HeroVerticalCellPicker({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: HeroVerticalCellPlacement;
  onChange: (value: HeroVerticalCellPlacement) => void;
}) {
  const activeLabel =
    HERO_VERTICAL_CELL_PLACEMENT_OPTIONS.find((option) => option.value === value)?.label ?? value;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
      <div className="mt-3 inline-grid grid-cols-3 gap-2 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-3">
        {HERO_VERTICAL_CELL_PLACEMENT_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                active
                  ? 'border-neutral-900 bg-neutral-950 text-white shadow-sm'
                  : 'border-neutral-300 bg-white text-neutral-400 hover:border-neutral-500 hover:text-neutral-700'
              }`}
            >
              <span
                className={`block h-2.5 w-2.5 rounded-full ${
                  active ? 'bg-orange-400' : 'bg-current'
                }`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-semibold text-neutral-800">{activeLabel}</p>
    </div>
  );
}

/** Visual picker matching the screen-division sketches (2×2 + 3-col). */
function HeroLayoutDivisionPicker({
  value,
  onChange,
}: {
  value: HeroLayoutDivision;
  onChange: (value: HeroLayoutDivision) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {PORTFOLIO_HERO_LAYOUT_DIVISION_OPTIONS.map((option) => {
        const active = option.value === value;
        const columns3 = option.value === 'columns-3';
        const horizontal = isHorizontalHeroDivision(option.value);
        const copyFirst =
          option.value === 'horizontal-copy-left' ||
          option.value === 'vertical-copy-top';

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border p-3 text-left transition ${
              active
                ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
            }`}
          >
            {columns3 ? (
              <div className="flex h-20 w-full flex-row gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-2">
                <div className="flex flex-1 items-center justify-center rounded-lg bg-neutral-900/80">
                  <span className="h-5 w-8 rounded-full bg-white/90" />
                </div>
                <div className="flex flex-1 items-center justify-center rounded-lg bg-neutral-300">
                  <span className="h-8 w-8 rounded-md bg-neutral-500/80" />
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-lg bg-neutral-200/90 px-1">
                  <span className="h-1.5 w-6 rounded-full bg-neutral-500/70" />
                  <span className="h-1.5 w-5 rounded-full bg-neutral-500/50" />
                  <span className="h-1.5 w-6 rounded-full bg-neutral-500/70" />
                </div>
              </div>
            ) : (
              <div
                className={`flex h-20 w-full gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 p-2 ${
                  horizontal ? 'flex-row' : 'flex-col'
                }`}
              >
                <div
                  className={`flex flex-1 items-center justify-center rounded-lg bg-neutral-900/80 ${
                    copyFirst ? 'order-1' : 'order-2'
                  }`}
                >
                  <span className="h-5 w-8 rounded-full bg-white/90" />
                </div>
                <div
                  className={`flex flex-1 items-center justify-center rounded-lg bg-neutral-300 ${
                    copyFirst ? 'order-2' : 'order-1'
                  }`}
                >
                  <span className="h-8 w-8 rounded-md bg-neutral-500/80" />
                </div>
              </div>
            )}
            <p className="mt-2.5 text-sm font-semibold text-neutral-950">{option.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}

function HeroPxSlider({
  label,
  value,
  onChange,
  max,
  min = 0,
  unit = 'px',
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span className="text-sm font-semibold text-neutral-700">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
        aria-label={label}
      />
    </div>
  );
}

/** Use-color-palette control shown in remaining Hero menus. */
function HeroUsePaletteToggle({
  hero,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  hero: PortfolioHeroSectionSettings;
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={hero.useHeroPalette !== false}
      onChange={(useHeroPalette) =>
        onChange(
          useHeroPalette
            ? { useHeroPalette, ...applyHeroPaletteToPresentation(hero) }
            : { useHeroPalette }
        )
      }
      title="Use global color palette"
      description={description}
      enabledHint={
        enabledHint ??
        'Palette mode — colors follow Global → Theme tokens. Turn this off for free hex pickers.'
      }
      disabledHint={
        disabledHint ??
        'Manual mode — color pickers below set hex values directly and are no longer overwritten by the global palette.'
      }
    />
  );
}

export function HeroSettingsPanel({
  hero,
  availableTools,
  availableWorks = [],
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  hero: PortfolioHeroSectionSettings;
  availableTools: string[];
  availableWorks?: { id: string; title: string; imageUrl: string }[];
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  subSection?: HeroSettingsSubSection;
  onSubSectionChange?: (value: HeroSettingsSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<HeroSettingsSubSection>('general');
  const subSection = normalizeHeroSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: HeroSettingsSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  const activeMeta =
    HERO_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ?? HERO_SETTINGS_SUB_SECTIONS[0];

  const normalizedTools = Array.from(
    new Set(availableTools.map((item) => item.trim()).filter(Boolean))
  );
  const backgroundLibrary = usePortfolioBackgroundLibrary();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <HeroSubSectionTabs value={subSection} onChange={setSubSection} />
        <p className="text-sm text-neutral-500">{activeMeta.description}</p>
      </div>

      {subSection === 'banner' ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Design Banner
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Tous les layouts Hero banner — Classic, Swiss editorial, Portrait identity,
              Editorial rail, Statement CTA, Portrait balance.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map((option) => {
                const active = (hero.heroBannerDesign ?? 'swiss-editorial') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(heroBannerDesignSettingsPatch(option.value))}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <HeroBannerDesignPreview design={option.value} />
                    <span className="mt-3 block text-sm font-semibold text-neutral-950">{option.label}</span>
                    <span className="mt-1 block text-sm text-neutral-500">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <HeroToggleRow
            label="Noir et blanc (images)"
            description="Applique un filtre grayscale sur les portraits et médias du banner sélectionné."
            checked={hero.heroImageGrayscale === true}
            onChange={(heroImageGrayscale) => onChange({ heroImageGrayscale })}
          />

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'swiss-editorial' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Swiss editorial
              </p>
              <p className="text-sm text-neutral-500">
                Le statement utilise la Description du profil. Currently / Specialized in suivent
                disponibilité et spécialité. Couleurs = palette Hero (Fond, Texte fort, Muted,
                Bordure).
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Label Currently
                </p>
                <input
                  type="text"
                  value={hero.heroCurrentlyLabel ?? 'Currently'}
                  onChange={(event) => onChange({ heroCurrentlyLabel: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Label Specialized in
                </p>
                <input
                  type="text"
                  value={hero.heroSpecializedInLabel ?? 'Specialized in'}
                  onChange={(event) => onChange({ heroSpecializedInLabel: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Signature word
                </p>
                <input
                  type="text"
                  value={hero.heroSignatureWord ?? ''}
                  onChange={(event) => onChange({ heroSignatureWord: event.target.value })}
                  placeholder="Vide = prénom en majuscules"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <HeroToggleRow
                label="Interchanger bio ↔ nom + spécialité"
                description="Échange le statement (bio) avec la signature uniquement. La spécialité reste dans le rail Specialized in."
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-identity' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Portrait identity
              </p>
              <HeroToggleRow
                label="Interchanger bio ↔ nom + spécialité"
                description="Échange le placement : bio en haut à gauche avec le bloc nom + expertise en bas à droite. Disponibilité, portrait et Contact restent en place."
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
            </div>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Encadrement (tous les banners)
            </p>
            <p className="text-sm text-neutral-500">
              Zone texte sous la composition. Masquée si label et texte sont vides.
            </p>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Label (haut du cadre)
              </p>
              <input
                type="text"
                value={hero.heroPortraitIdentityBottomLabel ?? ''}
                onChange={(event) =>
                  onChange({ heroPortraitIdentityBottomLabel: event.target.value })
                }
                placeholder="Ex. Note, About, …"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Texte libre (bas du hero)
              </p>
              <textarea
                rows={4}
                value={hero.heroPortraitIdentityBottomText ?? ''}
                onChange={(event) =>
                  onChange({ heroPortraitIdentityBottomText: event.target.value })
                }
                placeholder="Écris librement ici…"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <HeroOptionGrid
              label="Largeur du cadre"
              columns={3}
              options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
              value={hero.heroPortraitIdentityBottomWidth ?? 'large'}
              onChange={(heroPortraitIdentityBottomWidth) =>
                onChange({ heroPortraitIdentityBottomWidth })
              }
            />
            <HeroOptionGrid
              label="Emplacement"
              columns={3}
              options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_ALIGN_OPTIONS}
              value={hero.heroPortraitIdentityBottomAlign ?? 'left'}
              onChange={(heroPortraitIdentityBottomAlign) =>
                onChange({ heroPortraitIdentityBottomAlign })
              }
            />
            <HeroOptionGrid
              label="Espace au-dessus du cadre"
              columns={2}
              options={PORTFOLIO_HERO_PORTRAIT_IDENTITY_BOTTOM_GAP_OPTIONS}
              value={hero.heroPortraitIdentityBottomGap ?? 'medium'}
              onChange={(heroPortraitIdentityBottomGap) =>
                onChange({ heroPortraitIdentityBottomGap })
              }
            />
            <HeroPxSlider
              label="Taille du texte"
              value={hero.heroPortraitIdentityBottomFontSizePx ?? 18}
              min={12}
              max={48}
              unit="px"
              onChange={(heroPortraitIdentityBottomFontSizePx) =>
                onChange({ heroPortraitIdentityBottomFontSizePx })
              }
            />
            <HeroColorField
              label="Fond du cadre"
              description="Par défaut = couleur Fond de la palette. Choisis une autre teinte si besoin."
              value={
                hero.heroPortraitIdentityBottomBgColor?.trim() ||
                hero.palette?.fond ||
                '#FFFFFF'
              }
              onChange={(heroPortraitIdentityBottomBgColor) =>
                onChange({ heroPortraitIdentityBottomBgColor })
              }
            />
            {(hero.heroPortraitIdentityBottomBgColor ?? '').trim() ? (
              <button
                type="button"
                onClick={() => onChange({ heroPortraitIdentityBottomBgColor: '' })}
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
              >
                Reset fond — couleur Fond
              </button>
            ) : null}
          </div>

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-rail' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Editorial rail
              </p>
              <HeroToggleRow
                label="Description sous le portrait"
                description="Déplace la bio sous l’image à droite. Availability + titre restent à gauche. Ignoré si « Nom + spécialité sous le portrait » est actif."
                checked={hero.heroEditorialRailBioUnderPortrait === true}
                onChange={(heroEditorialRailBioUnderPortrait) =>
                  onChange({ heroEditorialRailBioUnderPortrait })
                }
              />
              <HeroToggleRow
                label="Nom + spécialité sous le portrait"
                description="Place le nom et la spécialité sous l’image en liste (→). La bio revient automatiquement à gauche, avec une taille plus grande."
                checked={hero.heroEditorialRailIdentityUnderPortrait === true}
                onChange={(heroEditorialRailIdentityUnderPortrait) =>
                  onChange({ heroEditorialRailIdentityUnderPortrait })
                }
              />
              <HeroToggleRow
                label="CTA sous la bio"
                description="Affiche « Start a project » (bouton) et « View project » (lien souligné) juste sous la description."
                checked={hero.heroEditorialRailShowCta === true}
                onChange={(heroEditorialRailShowCta) =>
                  onChange({ heroEditorialRailShowCta })
                }
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Tools affichés
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Choisis jusqu’à 4 tools. Vide = les 4 premiers du profil.
                </p>
                {normalizedTools.length > 0 ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {normalizedTools.map((tool) => {
                        const picked = hero.heroEditorialRailSelectedTools ?? [];
                        const active =
                          picked.length > 0
                            ? picked.includes(tool)
                            : normalizedTools.slice(0, 4).includes(tool);
                        const disabled =
                          picked.length > 0 && !active && picked.length >= 4;
                        return (
                          <button
                            key={tool}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const current =
                                (hero.heroEditorialRailSelectedTools?.length ?? 0) > 0
                                  ? [...(hero.heroEditorialRailSelectedTools ?? [])]
                                  : normalizedTools.slice(0, 4);
                              const next = current.includes(tool)
                                ? current.filter((item) => item !== tool)
                                : current.length >= 4
                                  ? current
                                  : [...current, tool];
                              onChange({ heroEditorialRailSelectedTools: next });
                            }}
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                              active
                                ? 'border-neutral-900 bg-neutral-950 text-white'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            <CreatorToolLogo label={tool} size={22} />
                            {tool}
                          </button>
                        );
                      })}
                    </div>
                    {(hero.heroEditorialRailSelectedTools?.length ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => onChange({ heroEditorialRailSelectedTools: [] })}
                        className="mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                      >
                        Reset — 4 premiers du profil
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">
                    Aucun tool dans le profil. Ajoute-les dans Profil → Tools.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'statement-cta' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Statement CTA
              </p>
              <p className="text-sm text-neutral-500">
                Disposition fixe : salutation + nom/spécialité, disponibilité, CTAs, bio, trait,
                tools. Palette Hero uniquement.
              </p>
              <HeroToggleRow
                label="Portrait rond au centre"
                description="Affiche l’avatar du profil en cercle au centre. Déplace automatiquement les CTAs sous la bio. Désactive la cover horizontale."
                checked={hero.heroStatementCtaCenterPortrait === true}
                onChange={(heroStatementCtaCenterPortrait) =>
                  onChange({
                    heroStatementCtaCenterPortrait,
                    ...(heroStatementCtaCenterPortrait
                      ? { heroStatementCtaCenterCover: false }
                      : {}),
                  })
                }
              />
              {hero.heroStatementCtaCenterPortrait === true ? (
                <>
                  <HeroToggleRow
                    label="Anneau couleur principal"
                    description="Bordure principal autour du portrait, avec un écart (style Instagram) — ne colle pas au bord de l’image."
                    checked={hero.heroStatementCtaPortraitRing === true}
                    onChange={(heroStatementCtaPortraitRing) =>
                      onChange({ heroStatementCtaPortraitRing })
                    }
                  />
                  <HeroPxSlider
                    label="Taille portrait (moyen → XL)"
                    value={hero.heroStatementCtaPortraitScale ?? 125}
                    min={100}
                    max={180}
                    unit="%"
                    onChange={(heroStatementCtaPortraitScale) =>
                      onChange({ heroStatementCtaPortraitScale })
                    }
                  />
                </>
              ) : null}

              <HeroToggleRow
                label="Cover horizontale"
                description="Rectangle horizontal à gauche, aligné au début de la bio. CTAs sous la bio. Désactive le portrait rond."
                checked={hero.heroStatementCtaCenterCover === true}
                onChange={(heroStatementCtaCenterCover) =>
                  onChange({
                    heroStatementCtaCenterCover,
                    ...(heroStatementCtaCenterCover
                      ? { heroStatementCtaCenterPortrait: false }
                      : {}),
                  })
                }
              />
              {hero.heroStatementCtaCenterCover === true ? (
                <PortfolioBackgroundImageUpload
                  label="Image cover"
                  url={hero.heroStatementCtaCoverImageUrl ?? ''}
                  onChange={(heroStatementCtaCoverImageUrl) =>
                    onChange({ heroStatementCtaCoverImageUrl })
                  }
                  library={backgroundLibrary?.library}
                  onLibraryChange={backgroundLibrary?.onLibraryChange}
                  helperText="Image du rectangle horizontal — indépendante du profil et du portrait rond."
                />
              ) : null}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Tools affichés
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Choisis jusqu’à 5 tools (bandeau bas). Vide = les 5 premiers du profil.
                </p>
                {normalizedTools.length > 0 ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {normalizedTools.map((tool) => {
                        const picked = hero.heroEditorialRailSelectedTools ?? [];
                        const active =
                          picked.length > 0
                            ? picked.includes(tool)
                            : normalizedTools.slice(0, 5).includes(tool);
                        const disabled =
                          picked.length > 0 && !active && picked.length >= 5;
                        return (
                          <button
                            key={tool}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const current =
                                (hero.heroEditorialRailSelectedTools?.length ?? 0) > 0
                                  ? [...(hero.heroEditorialRailSelectedTools ?? [])]
                                  : normalizedTools.slice(0, 5);
                              const next = current.includes(tool)
                                ? current.filter((item) => item !== tool)
                                : current.length >= 5
                                  ? current
                                  : [...current, tool];
                              onChange({ heroEditorialRailSelectedTools: next });
                            }}
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                              active
                                ? 'border-neutral-900 bg-neutral-950 text-white'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            <CreatorToolLogo label={tool} size={22} />
                            {tool}
                          </button>
                        );
                      })}
                    </div>
                    {(hero.heroEditorialRailSelectedTools?.length ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => onChange({ heroEditorialRailSelectedTools: [] })}
                        className="mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                      >
                        Reset — 5 premiers du profil
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">
                    Aucun tool dans le profil. Ajoute-les dans Profil → Tools.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-balance' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Portrait balance
              </p>
              <p className="text-sm text-neutral-500">
                Core stack en tags au-dessus du trait, sous le titre. Palette Hero uniquement.
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Tools affichés
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Choisis jusqu’à 12 tools. Vide = les 12 premiers du profil.
                </p>
                {normalizedTools.length > 0 ? (
                  <>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {normalizedTools.map((tool) => {
                        const picked = hero.heroEditorialRailSelectedTools ?? [];
                        const active =
                          picked.length > 0
                            ? picked.includes(tool)
                            : normalizedTools.slice(0, 12).includes(tool);
                        const disabled =
                          picked.length > 0 && !active && picked.length >= 12;
                        return (
                          <button
                            key={tool}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const current =
                                (hero.heroEditorialRailSelectedTools?.length ?? 0) > 0
                                  ? [...(hero.heroEditorialRailSelectedTools ?? [])]
                                  : normalizedTools.slice(0, 12);
                              const next = current.includes(tool)
                                ? current.filter((item) => item !== tool)
                                : current.length >= 12
                                  ? current
                                  : [...current, tool];
                              onChange({ heroEditorialRailSelectedTools: next });
                            }}
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                              active
                                ? 'border-neutral-900 bg-neutral-950 text-white'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            <CreatorToolLogo label={tool} size={22} />
                            {tool}
                          </button>
                        );
                      })}
                    </div>
                    {(hero.heroEditorialRailSelectedTools?.length ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => onChange({ heroEditorialRailSelectedTools: [] })}
                        className="mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                      >
                        Reset — 12 premiers du profil
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">
                    Aucun tool dans le profil. Ajoute-les dans Profil → Tools.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'left-portrait' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Left portrait
              </p>
              <p className="text-sm text-neutral-500">
                Portrait à gauche. En haut à droite : disponibilité + « Hello, I&apos;m nom — a
                spécialité ». En bas : bio + CTAs « Let&apos;s talk » / « View project ». Palette
                Hero uniquement.
              </p>
              <HeroToggleRow
                label="Surbrillance spécialité"
                description="Met en surbrillance la spécialité dans le titre, en couleur Principal (sans soulignement)."
                checked={hero.heroLeftPortraitSpecialtyMark === true}
                onChange={(heroLeftPortraitSpecialtyMark) =>
                  onChange({ heroLeftPortraitSpecialtyMark })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'circle-portrait' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Circle portrait
              </p>
              <p className="text-sm text-neutral-500">
                Portrait circulaire à gauche ; titre en bas par défaut (nom + spécialité + traits
                Principal). Bio à gauche, CTAs centrés. Toggle « Titre en haut » pour le layout
                classique. Palette Hero uniquement.
              </p>
              <HeroToggleRow
                label="Surbrillance spécialité"
                description="Met en surbrillance la spécialité dans le titre, en couleur Principal."
                checked={hero.heroCirclePortraitSpecialtyMark === true}
                onChange={(heroCirclePortraitSpecialtyMark) =>
                  onChange({ heroCirclePortraitSpecialtyMark })
                }
              />
              <HeroToggleRow
                label="Titre en haut"
                description="Place le titre au-dessus de la bio (layout classique). Par défaut, le titre reste en bas avec traits Principal."
                checked={hero.heroCirclePortraitTitleBottom === false}
                onChange={(titleTop) =>
                  onChange({ heroCirclePortraitTitleBottom: !titleTop })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'experience-split' ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Experience split
              </p>
              <p className="text-sm text-neutral-500">
                Par défaut : deux colonnes — titre + CTAs à gauche (trait Principal),
                portrait + years/bio à droite. Palette Hero uniquement.
              </p>
              <HeroToggleRow
                label="Bio à droite"
                description="Layout par défaut. Désactive pour remettre years/bio à gauche du titre."
                checked={hero.heroExperienceSplitBioRight !== false}
                onChange={(heroExperienceSplitBioRight) =>
                  onChange({ heroExperienceSplitBioRight })
                }
              />
              <HeroToggleRow
                label="Cadre global"
                description="Ajoute un cadre discret autour du contenu (token Bordure)."
                checked={hero.heroExperienceSplitGlobalFrame === true}
                onChange={(heroExperienceSplitGlobalFrame) =>
                  onChange({ heroExperienceSplitGlobalFrame })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-overlap' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Editorial overlap
              </p>
              <p className="text-sm text-neutral-500">
                Collage éditorial : grande photo + panneau texte scoopé en bas à gauche. Palette
                Hero uniquement. L’image de fond n’est pas le portrait de profil.
              </p>
              <PortfolioBackgroundImageUpload
                label="Image de scène"
                url={hero.heroEditorialOverlapImageUrl ?? ''}
                onChange={(heroEditorialOverlapImageUrl) =>
                  onChange({ heroEditorialOverlapImageUrl })
                }
                library={backgroundLibrary?.library}
                onLibraryChange={backgroundLibrary?.onLibraryChange}
                helperText="Photo paysage derrière le panneau — indépendante de l’avatar profil."
              />
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Titre éditorial (optionnel)
                </span>
                <textarea
                  rows={2}
                  value={hero.heroEditorialOverlapHeadline ?? ''}
                  onChange={(event) =>
                    onChange({ heroEditorialOverlapHeadline: event.target.value })
                  }
                  placeholder="Hi, I'm …"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none ring-neutral-900/10 placeholder:text-neutral-400 focus:ring-2"
                />
                <span className="block text-xs text-neutral-500">
                  Vide = salutation + nom. Panneau : spécialité → salutation → bio.
                </span>
              </label>
              <HeroOptionGrid
                label="Largeur du cadre"
                columns={3}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
                value={hero.heroEditorialOverlapWidth ?? 'full'}
                onChange={(heroEditorialOverlapWidth) =>
                  onChange({ heroEditorialOverlapWidth })
                }
              />
              <HeroOptionGrid
                label="Position"
                columns={3}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_ALIGN_OPTIONS}
                value={hero.heroEditorialOverlapAlign ?? 'left'}
                onChange={(heroEditorialOverlapAlign) =>
                  onChange({ heroEditorialOverlapAlign })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'selected-works' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Selected works
              </p>
              <p className="text-sm text-neutral-500">
                Nom / spécialité + bio (split) ou titre centré avec trait (centré) ; miniatures +
                See all. Palette Hero uniquement.
              </p>
              <HeroOptionGrid
                label="Disposition identité"
                columns={2}
                options={PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS}
                value={hero.heroSelectedWorksIdentityLayout ?? 'split'}
                onChange={(heroSelectedWorksIdentityLayout) =>
                  onChange({ heroSelectedWorksIdentityLayout })
                }
              />
              <HeroPxSlider
                label="Assombrissement miniatures"
                value={hero.heroSelectedWorksDimIntensity ?? 40}
                min={0}
                max={80}
                unit="%"
                onChange={(heroSelectedWorksDimIntensity) =>
                  onChange({ heroSelectedWorksDimIntensity })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'identity-index' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Identity index
              </p>
              <p className="text-sm text-neutral-500">
                Nom (2 mots du profil), rail Specialty / Availability / Years of experience, puis
                la description en bas. Couleurs = palette Hero. Le contenu se règle dans Creator
                Studio → Information.
              </p>
              <HeroToggleRow
                label="Interchanger nom ↔ bio"
                description="Échange uniquement le placement : la bio passe en haut, le nom en bas. Le rail Specialty / Availability / Years reste au milieu."
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
              <HeroToggleRow
                label="Portrait en bas à droite"
                description="Affiche la photo de profil en bas à droite, alignée horizontalement avec la description à gauche. Le nom et le rail au-dessus restent inchangés."
                checked={hero.heroIdentityIndexShowPortrait === true}
                onChange={(heroIdentityIndexShowPortrait) =>
                  onChange({ heroIdentityIndexShowPortrait })
                }
              />
              {hero.heroIdentityIndexShowPortrait === true ? (
                <>
                  <HeroToggleRow
                    label="Interchanger bio ↔ image"
                    description="Échange le placement : image à gauche, bio à droite (et inversement). Le nom et le rail restent en place."
                    checked={hero.heroIdentityIndexSwapBioPortrait === true}
                    onChange={(heroIdentityIndexSwapBioPortrait) =>
                      onChange({ heroIdentityIndexSwapBioPortrait })
                    }
                  />
                  <HeroOptionGrid
                    label="Arrondi de l’image"
                    columns={3}
                    options={PORTFOLIO_HERO_IDENTITY_INDEX_PORTRAIT_RADIUS_OPTIONS}
                    value={hero.heroIdentityIndexPortraitRadius ?? 'none'}
                    onChange={(heroIdentityIndexPortraitRadius) =>
                      onChange({ heroIdentityIndexPortraitRadius })
                    }
                  />
                </>
              ) : null}
              <HeroToggleRow
                label="Cadre média en bas"
                description="Ajoute un cadre photo/vidéo pleine largeur sous tous les éléments (nom, rail, bio, portrait)."
                checked={hero.heroIdentityIndexShowBottomMedia === true}
                onChange={(heroIdentityIndexShowBottomMedia) =>
                  onChange({ heroIdentityIndexShowBottomMedia })
                }
              />
              {hero.heroIdentityIndexShowBottomMedia === true ? (
                <PortfolioHeroBannerMediaUpload
                  label="Photo / vidéo du cadre"
                  url={hero.heroIdentityIndexBottomMediaUrl ?? ''}
                  onChange={(heroIdentityIndexBottomMediaUrl) =>
                    onChange({ heroIdentityIndexBottomMediaUrl })
                  }
                  helperText="Média indépendant du portrait profil. S’affiche en pleine largeur tout en bas du hero."
                />
              ) : null}
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'studio-split' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Studio split
              </p>
              <p className="text-sm text-neutral-500">
                Bande Principal : eyebrow + « Hi, I&apos;m » nom / spécialité à gauche ; bio, CTAs
                Let&apos;s talk / View my work et disponibilité à droite. Cadre média arrondi en
                bas. Couleurs = palette Hero (Principal / Fond).
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Eyebrow (ex. Portfolio)
                </p>
                <input
                  type="text"
                  value={hero.heroStudioSplitEyebrow ?? 'Portfolio'}
                  onChange={(event) => onChange({ heroStudioSplitEyebrow: event.target.value })}
                  placeholder="Portfolio"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <PortfolioHeroBannerMediaUpload
                label="Photo / vidéo du cadre"
                url={hero.heroStudioSplitMediaUrl ?? ''}
                onChange={(heroStudioSplitMediaUrl) => onChange({ heroStudioSplitMediaUrl })}
                helperText="Grand cadre arrondi sous le bandeau — indépendant de l’avatar profil."
              />
              <HeroOptionGrid
                label="Largeur du cadre"
                columns={3}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
                value={hero.heroStudioSplitMediaWidth ?? 'full'}
                onChange={(heroStudioSplitMediaWidth) => onChange({ heroStudioSplitMediaWidth })}
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'work-duo' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Work duo
              </p>
              <p className="text-sm text-neutral-500">
                Gauche : disponibilité, « Hi, I&apos;m » nom — spécialité, bio, CTAs Let&apos;s talk /
                View projects, années d&apos;expérience. Droite : See all + 2 Selected works
                (cadres très arrondis). Couleurs = palette Hero.
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Selected works affichés
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Choisis jusqu&apos;à 2 projets. Vide = les 2 premiers avec média.
                </p>
                {availableWorks.length > 0 ? (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableWorks.map((work) => {
                        const picked = hero.heroWorkDuoSelectedWorkIds ?? [];
                        const active =
                          picked.length > 0
                            ? picked.includes(work.id)
                            : availableWorks.slice(0, 2).some((item) => item.id === work.id);
                        const disabled =
                          picked.length > 0 && !active && picked.length >= 2;
                        return (
                          <button
                            key={work.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const current =
                                (hero.heroWorkDuoSelectedWorkIds?.length ?? 0) > 0
                                  ? [...(hero.heroWorkDuoSelectedWorkIds ?? [])]
                                  : availableWorks.slice(0, 2).map((item) => item.id);
                              const next = current.includes(work.id)
                                ? current.filter((id) => id !== work.id)
                                : current.length >= 2
                                  ? current
                                  : [...current, work.id];
                              onChange({ heroWorkDuoSelectedWorkIds: next });
                            }}
                            className={`overflow-hidden rounded-xl border text-left transition ${
                              active
                                ? 'border-neutral-900 ring-2 ring-neutral-900/20'
                                : 'border-neutral-200 hover:border-neutral-300'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            <span className="relative block aspect-[4/3] w-full bg-neutral-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={work.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </span>
                            <span className="block truncate px-2.5 py-2 text-xs font-medium text-neutral-800">
                              {work.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {(hero.heroWorkDuoSelectedWorkIds?.length ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={() => onChange({ heroWorkDuoSelectedWorkIds: [] })}
                        className="mt-3 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                      >
                        Reset — 2 premiers projets
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">
                    Aucun projet avec média. Ajoute des works dans Creator Studio.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'bowl-intro' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Bowl intro
              </p>
              <p className="text-sm text-neutral-500">
                Gauche : badge disponibilité (vert), portrait arrondi + motif, nom sous
                l&apos;image. Droite : spécialité (Principal, grand titre), bio, CTAs
                alignés à gauche — View my work (plein) et Contact me (contour).
              </p>
              <HeroOptionGrid
                label="Motif derrière le portrait"
                columns={2}
                options={PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS}
                value={hero.heroBowlIntroMotif ?? 'bowl'}
                onChange={(heroBowlIntroMotif) => onChange({ heroBowlIntroMotif })}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {subSection === 'general' ? (
        <div className="space-y-5">
          <HeroToggleRow
            label="Show section"
            description="Display the hero block on your public portfolio."
            checked={hero.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />

          <HeroUsePaletteToggle
            hero={hero}
            onChange={onChange}
            description="When on, Hero colors follow the semantic palette (Principal, Fond, Bordure…)."
            enabledHint="Palette mode — colors follow Global → Theme tokens."
            disabledHint="Manual mode — Hero no longer overwrites colors from the global palette. Other sections can still sync to those tokens."
          />

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section title</p>
            <input
              type="text"
              value={hero.title}
              onChange={(event) => onChange({ title: event.target.value })}
              placeholder="Hero"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section subtitle</p>
            <textarea
              rows={3}
              value={hero.subtitle}
              onChange={(event) => onChange({ subtitle: event.target.value })}
              placeholder="Optional supporting line under the title"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Screen division</p>
              <p className="mt-1 text-sm text-neutral-500">
                Group left (copy) and right (portrait, motif, stats), then place the two groups
                side-by-side or stacked. In vertical mode the top block shrinks to its content,
                then a tunable gap before the visual block.
              </p>
            </div>
            <HeroLayoutDivisionPicker
              value={resolveHeroLayoutDivision(hero)}
              onChange={(heroLayoutDivision) =>
                onChange(applyHeroLayoutDivision(hero, heroLayoutDivision))
              }
            />
            <HeroToggleRow
              label="Hide empty parts"
              description="Automatically remove the Copy or Visual side (and empty columns-3 slots) when they have no content, so the remaining part can use the full space."
              checked={hero.heroHideEmptyDivisionParts === true}
              onChange={(heroHideEmptyDivisionParts) => onChange({ heroHideEmptyDivisionParts })}
            />
            {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ||
            isColumns3HeroDivision(resolveHeroLayoutDivision(hero)) ? (
              <HeroPxSlider
                label="Gap between frames"
                value={resolveHeroVerticalFrameGapPx(hero)}
                min={HERO_VERTICAL_FRAME_GAP_PX_MIN}
                max={HERO_VERTICAL_FRAME_GAP_PX_MAX}
                onChange={(heroVerticalFrameGapPx) => onChange({ heroVerticalFrameGapPx })}
              />
            ) : null}
            {isColumns3HeroDivision(resolveHeroLayoutDivision(hero)) ? (
              <div className="space-y-3">
                <HeroPxSlider
                  label="Middle column width"
                  value={resolveHeroColumns3MiddleWeight(hero)}
                  min={HERO_COLUMNS_3_MIDDLE_WEIGHT_MIN}
                  max={HERO_COLUMNS_3_MIDDLE_WEIGHT_MAX}
                  unit=""
                  onChange={(heroColumns3MiddleWeight) => onChange({ heroColumns3MiddleWeight })}
                />
                <p className="-mt-1 text-xs text-neutral-500">
                  Sides stay at 1×. Middle is {(resolveHeroColumns3MiddleWeight(hero) / 10).toFixed(1)}
                  × — gives the center column more (or less) room.
                </p>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Column order &amp; vertical
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Reorder columns, then place each block (Copy, Portrait, Stats) at Top /
                    Center / Bottom inside the full viewport.
                  </p>
                </div>
                <ul className="space-y-2">
                  {resolveHeroColumns3Order(hero).map((slot, index, order) => {
                    const label =
                      HERO_COLUMNS_3_SLOT_OPTIONS.find((option) => option.value === slot)?.label ??
                      slot;
                    const slotVertical = resolveHeroColumns3SlotVertical(hero);
                    return (
                      <li
                        key={slot}
                        className="space-y-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-xs font-bold text-neutral-400">{index + 1}</span>
                          <span className="flex-1 text-sm font-semibold text-neutral-950">{label}</span>
                          {index === 1 ? (
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                              Middle
                            </span>
                          ) : null}
                          <button
                            type="button"
                            disabled={index === 0}
                            aria-label={`Move ${label} earlier`}
                            onClick={() =>
                              onChange({
                                heroColumns3Order: moveHeroColumns3Slot(order, slot, -1),
                              })
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={index === order.length - 1}
                            aria-label={`Move ${label} later`}
                            onClick={() =>
                              onChange({
                                heroColumns3Order: moveHeroColumns3Slot(order, slot, 1),
                              })
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pl-8">
                          {PORTFOLIO_HERO_COLUMNS_3_VERTICAL_OPTIONS.map((option) => {
                            const active = slotVertical[slot] === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  onChange({
                                    heroColumns3SlotVertical: {
                                      ...slotVertical,
                                      [slot]: option.value,
                                    },
                                  })
                                }
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                                  active
                                    ? 'bg-neutral-900 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
            {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
              <HeroVerticalCellPicker
                label="Free zone position"
                description='Anchor for elements set to "Free zone (other part)" — they move into the empty area of the visual frame (e.g. top right beside the stats).'
                value={resolveHeroVisualFreeCell(hero)}
                onChange={(heroVisualFreeCell) => onChange({ heroVisualFreeCell })}
              />
            ) : null}
          </div>

          {isVerticalHeroDivision(resolveHeroLayoutDivision(hero)) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Desktop columns (xl+)
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Split each unit (copy / visual) into 1, 2, or 3 columns and place
                  elements left / center / right per column. Changing the count
                  auto-positions elements.
                </p>
              </div>

              {(() => {
                const ultraWide = resolveHeroUltraWideColumnLayout(hero);
                const setColumns = (columns: HeroUltraWideColumnCount) => {
                  onChange({
                    heroUltraWideColumns: applyHeroUltraWideColumns(
                      hero.heroUltraWideColumns,
                      columns
                    ),
                  });
                };
                const patchCopySlot = (slot: HeroCopyColumnSlot, column: HeroColumnIndex) => {
                  const next = resolveHeroUltraWideColumnLayout(hero);
                  onChange({
                    heroUltraWideColumns: {
                      ...next,
                      copySlots: { ...next.copySlots, [slot]: column },
                    },
                  });
                };
                const patchVisualSlot = (
                  slot: HeroVisualColumnSlot,
                  column: HeroColumnIndex
                ) => {
                  const next = resolveHeroUltraWideColumnLayout(hero);
                  onChange({
                    heroUltraWideColumns: {
                      ...next,
                      visualSlots: { ...next.visualSlots, [slot]: column },
                    },
                  });
                };
                const columnChoices = Array.from(
                  { length: ultraWide.columns },
                  (_, i) => (i + 1) as HeroColumnIndex
                );

                return (
                  <>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {PORTFOLIO_HERO_ULTRAWIDE_COLUMN_OPTIONS.map((option) => {
                        const active = ultraWide.columns === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setColumns(option.value)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                                : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                            }`}
                          >
                            <p className="text-sm font-bold text-neutral-950">{option.label}</p>
                            <p className="mt-1 text-xs text-neutral-500">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    {ultraWide.columns > 1 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Element columns
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              onChange({
                                heroUltraWideColumns: autoPlaceHeroUltraWideSlots(
                                  ultraWide.columns
                                ),
                              })
                            }
                            className="inline-flex min-h-9 items-center rounded-full border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
                          >
                            Auto-place elements
                          </button>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                          <p className="text-sm font-semibold text-neutral-950">Copy unit</p>
                          <div className="mt-3 space-y-2">
                            {HERO_COPY_COLUMN_SLOT_OPTIONS.map((slot) => (
                              <div
                                key={slot.value}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <span className="text-sm text-neutral-700">{slot.label}</span>
                                <div className="flex gap-1">
                                  {columnChoices.map((col) => (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => patchCopySlot(slot.value, col)}
                                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                        ultraWide.copySlots[slot.value] === col
                                          ? 'bg-neutral-950 text-white'
                                          : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200/80 bg-white p-4">
                          <p className="text-sm font-semibold text-neutral-950">Visual unit</p>
                          <div className="mt-3 space-y-2">
                            {HERO_VISUAL_COLUMN_SLOT_OPTIONS.map((slot) => (
                              <div
                                key={slot.value}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <span className="text-sm text-neutral-700">{slot.label}</span>
                                <div className="flex gap-1">
                                  {columnChoices.map((col) => (
                                    <button
                                      key={col}
                                      type="button"
                                      onClick={() => patchVisualSlot(slot.value, col)}
                                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                                        ultraWide.visualSlots[slot.value] === col
                                          ? 'bg-neutral-950 text-white'
                                          : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                                      }`}
                                    >
                                      {col}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                );
              })()}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Content for this section is edited in Creator Studio → Information. These settings control visibility and
        presentation on the portfolio page.
      </p>
    </div>
  );
}

export function HeroPresentationPanel(props: {
  hero: PortfolioHeroSectionSettings;
  availableTools: string[];
  availableWorks?: { id: string; title: string; imageUrl: string }[];
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
}) {
  return <HeroSettingsPanel {...props} />;
}
