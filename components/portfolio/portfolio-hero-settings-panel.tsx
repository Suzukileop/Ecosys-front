'use client';

import { useState } from 'react';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS,
  PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS,
  PORTFOLIO_HERO_EDITORIAL_OVERLAP_ALIGN_OPTIONS,
  PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS,
  PORTFOLIO_HERO_IDENTITY_INDEX_PORTRAIT_RADIUS_OPTIONS,
  PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS,
  heroBannerDesignSettingsPatch,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import { HeroBannerDesignPreview } from '@/components/portfolio/portfolio-hero-banner-skeletons';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS,
  PORTFOLIO_HERO_BACKGROUND_SPLIT_AXIS_OPTIONS,
  PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS,
  type PortfolioHeroBackgroundSettings,
} from '@/components/portfolio/portfolio-hero-background-settings';
import type { PortfolioHeroSectionSettings } from '@/components/portfolio/portfolio-settings-types';
import { PortfolioBackgroundImageUpload, PortfolioHeroBannerMediaUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { usePortfolioBackgroundLibrary } from '@/components/portfolio/portfolio-background-library-context';

export type HeroSettingsSubSection = 'general' | 'banner' | 'background';

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
  {
    id: 'background',
    label: 'Background',
    description: 'Section-wide fill — solid, gradient, image, or split — behind every banner design.',
  },
];

/** Map legacy subsection ids (saved UI state / search) onto remaining Hero menus. */
export function normalizeHeroSettingsSubSection(value: string | undefined): HeroSettingsSubSection {
  if (value === 'banner' || value === 'background') return value;
  return 'general';
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

function HeroChangeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M4 8a6 6 0 0 1 10.2-4.2M16 12a6 6 0 0 1-10.2 4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.2 2.4v3.4h-3.4M5.8 17.6v-3.4h3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Fixed, palette-independent colors — this is admin chrome, not portfolio content, so it must
 *  stay visible regardless of the portfolio's own palette/color-mode (which the settings modal
 *  otherwise inherits via .pf-theme-root). */
function HeroSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ backgroundColor: checked ? '#f97316' : '#d4d4d4' }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: checked ? '1.125rem' : '0.125rem' }}
      />
    </span>
  );
}

function HeroToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left"
    >
      <span className="min-w-0 text-sm font-semibold text-neutral-900">{label}</span>
      <HeroSwitchTrack checked={checked} />
    </button>
  );
}

function HeroColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
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
  options: { value: T; label: string; description?: string }[];
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
            </button>
          );
        })}
      </div>
    </div>
  );
}

const HERO_BACKGROUND_IMAGE_SIZE_OPTIONS: {
  value: PortfolioHeroBackgroundSettings['heroSectionBackgroundImageSize'];
  label: string;
}[] = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
];

const HERO_BACKGROUND_IMAGE_POSITION_OPTIONS: {
  value: PortfolioHeroBackgroundSettings['heroSectionBackgroundImagePosition'];
  label: string;
}[] = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

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
  // Banner tab: browse designs (grid) vs configure the selected one (detail) — picking a
  // design jumps straight to its settings instead of leaving them buried below the grid.
  const [showBannerGrid, setShowBannerGrid] = useState(false);
  const selectedBannerDesign = hero.heroBannerDesign ?? 'swiss-editorial';
  const selectedBannerLabel =
    PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.find((option) => option.value === selectedBannerDesign)?.label ??
    selectedBannerDesign;
  const normalizedTools = Array.from(
    new Set(availableTools.map((item) => item.trim()).filter(Boolean))
  );
  const backgroundLibrary = usePortfolioBackgroundLibrary();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <HeroSubSectionTabs value={subSection} onChange={setSubSection} />
      </div>

      {subSection === 'banner' ? (
        <div className="space-y-6">
          {showBannerGrid ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Design Banner
                </p>
                <button
                  type="button"
                  onClick={() => setShowBannerGrid(false)}
                  className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                >
                  ← Back
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-5">
                {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map((option) => {
                  const active = selectedBannerDesign === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        onChange(heroBannerDesignSettingsPatch(option.value));
                        setShowBannerGrid(false);
                      }}
                      className={`relative rounded-2xl border-2 p-4 text-left transition ${
                        active ? '' : 'border-neutral-200/80 hover:border-neutral-300'
                      }`}
                      style={active ? { borderColor: 'var(--pf-palette-principal, #f97316)' } : undefined}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ backgroundColor: 'var(--pf-palette-principal, #f97316)' }}
                        >
                          <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
                            <path
                              d="M4 10.5l3.5 3.5L16 6"
                              stroke="white"
                              strokeWidth={2.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : null}
                      <div className="overflow-hidden rounded-xl">
                        {/* No `hero` prop here: this grid compares many designs at once, so
                            it must stay an abstract mini-schema (fixed shape count, uniform
                            height) — real content (variable-length text, pills, dots) belongs
                            only in the single-design detail preview above. */}
                        <HeroBannerDesignPreview design={option.value} />
                      </div>
                      <span
                        className={`mt-3 block text-sm ${
                          active ? 'font-semibold text-neutral-950' : 'font-medium text-neutral-500'
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="group relative w-full overflow-hidden rounded-2xl border border-neutral-200/80">
                  <HeroBannerDesignPreview design={selectedBannerDesign} hero={hero} />

                  {/* Desktop: full dark overlay revealed on hover/keyboard focus. */}
                  <button
                    type="button"
                    onClick={() => setShowBannerGrid(true)}
                    aria-label="Change banner design"
                    className="absolute inset-0 hidden items-center justify-center bg-black/55 opacity-0 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 sm:flex"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 shadow-lg">
                      <HeroChangeIcon className="h-4 w-4" />
                      Change banner
                    </span>
                  </button>

                  {/* Mobile/touch: no hover, so keep a small persistent affordance instead. */}
                  <button
                    type="button"
                    onClick={() => setShowBannerGrid(true)}
                    aria-label="Change banner design"
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
                  >
                    <HeroChangeIcon className="h-3.5 w-3.5" />
                    Change
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold text-neutral-950">{selectedBannerLabel}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  <span className="hidden sm:inline">Hover preview to change</span>
                  <span className="sm:hidden">Tap preview to change</span>
                </p>
              </div>

              <HeroToggleRow
                label="Noir et blanc (images)"
                checked={hero.heroImageGrayscale === true}
                onChange={(heroImageGrayscale) => onChange({ heroImageGrayscale })}
              />

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'cinematic-reveal' ? (
                <div className="space-y-4 border-t border-neutral-200/70 pt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Contenu Cinematic reveal
                  </p>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Tools dans le bandeau
                    </p>
                    {normalizedTools.length > 0 ? (
                      <>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {normalizedTools.map((tool) => {
                            const picked = hero.heroEditorialRailSelectedTools ?? [];
                            const active =
                              picked.length > 0
                                ? picked.includes(tool)
                                : normalizedTools.slice(0, 8).includes(tool);
                            const disabled =
                              picked.length > 0 && !active && picked.length >= 8;
                            return (
                              <button
                                key={tool}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                  const current =
                                    (hero.heroEditorialRailSelectedTools?.length ?? 0) > 0
                                      ? [...(hero.heroEditorialRailSelectedTools ?? [])]
                                      : normalizedTools.slice(0, 8);
                                  const next = current.includes(tool)
                                    ? current.filter((item) => item !== tool)
                                    : current.length >= 8
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
                            Reset — 8 premiers du profil
                          </button>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'swiss-editorial' ? (
                <div className="space-y-6 border-t border-neutral-200/70 pt-6">
                  <HeroToggleRow
                    label="Swap bio ↔ name + specialty"
                    checked={hero.heroBannerSwapBioName === true}
                    onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
                  />
                  <div className="space-y-4 border-t border-neutral-200/70 pt-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Currently label
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
                        Specialized in label
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
                        placeholder="e.g. JOHN"
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-identity' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-neutral-400">
                This banner
              </p>
              <HeroToggleRow
                label="Swap bio ↔ name + specialty"
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
            </div>
          ) : null}


          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-rail' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Editorial rail
              </p>
              <HeroToggleRow
                label="Description sous le portrait"
                checked={hero.heroEditorialRailBioUnderPortrait === true}
                onChange={(heroEditorialRailBioUnderPortrait) =>
                  onChange({ heroEditorialRailBioUnderPortrait })
                }
              />
              <HeroToggleRow
                label="Nom + spécialité sous le portrait"
                checked={hero.heroEditorialRailIdentityUnderPortrait === true}
                onChange={(heroEditorialRailIdentityUnderPortrait) =>
                  onChange({ heroEditorialRailIdentityUnderPortrait })
                }
              />
              <HeroToggleRow
                label="CTA sous la bio"
                checked={hero.heroEditorialRailShowCta === true}
                onChange={(heroEditorialRailShowCta) =>
                  onChange({ heroEditorialRailShowCta })
                }
              />

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Tools affichés
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
                ) : null}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'statement-cta' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Statement CTA
              </p>
              <HeroToggleRow
                label="Portrait rond au centre"
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
                ) : null}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-balance' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Portrait balance
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Tools affichés
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
                ) : null}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'left-portrait' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Left portrait
              </p>
              <HeroToggleRow
                label="Surbrillance spécialité"
                checked={hero.heroLeftPortraitSpecialtyMark === true}
                onChange={(heroLeftPortraitSpecialtyMark) =>
                  onChange({ heroLeftPortraitSpecialtyMark })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'circle-portrait' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Circle portrait
              </p>
              <HeroToggleRow
                label="Surbrillance spécialité"
                checked={hero.heroCirclePortraitSpecialtyMark === true}
                onChange={(heroCirclePortraitSpecialtyMark) =>
                  onChange({ heroCirclePortraitSpecialtyMark })
                }
              />
              <HeroToggleRow
                label="Titre en haut"
                checked={hero.heroCirclePortraitTitleBottom === false}
                onChange={(titleTop) =>
                  onChange({ heroCirclePortraitTitleBottom: !titleTop })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'experience-split' ? (
            <div className="space-y-3 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Experience split
              </p>
              <HeroToggleRow
                label="Bio à droite"
                checked={hero.heroExperienceSplitBioRight !== false}
                onChange={(heroExperienceSplitBioRight) =>
                  onChange({ heroExperienceSplitBioRight })
                }
              />
              <HeroToggleRow
                label="Cadre global"
                checked={hero.heroExperienceSplitGlobalFrame === true}
                onChange={(heroExperienceSplitGlobalFrame) =>
                  onChange({ heroExperienceSplitGlobalFrame })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-overlap' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Editorial overlap
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
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Selected works
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
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Identity index
              </p>
              <HeroToggleRow
                label="Interchanger nom ↔ bio"
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
              <HeroToggleRow
                label="Portrait en bas à droite"
                checked={hero.heroIdentityIndexShowPortrait === true}
                onChange={(heroIdentityIndexShowPortrait) =>
                  onChange({ heroIdentityIndexShowPortrait })
                }
              />
              {hero.heroIdentityIndexShowPortrait === true ? (
                <>
                  <HeroToggleRow
                    label="Interchanger bio ↔ image"
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
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Studio split
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
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Work duo
              </p>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Selected works affichés
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
                ) : null}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'bowl-intro' ? (
            <div className="space-y-4 border-t border-neutral-200/70 pt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Contenu Bowl intro
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
          )}
        </div>
      ) : null}

      {subSection === 'general' ? (
        <div className="space-y-5">
          <HeroToggleRow
            label="Show section"
            checked={hero.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-5">
          <HeroOptionGrid
            label="Fill"
            columns={3}
            options={PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS}
            value={hero.heroSectionBackgroundFill}
            onChange={(heroSectionBackgroundFill) => onChange({ heroSectionBackgroundFill })}
          />

          {hero.heroSectionBackgroundFill === 'solid' ? (
            <HeroColorField
              label="Color"
              value={hero.heroSectionBackgroundColor}
              onChange={(heroSectionBackgroundColor) => onChange({ heroSectionBackgroundColor })}
            />
          ) : null}

          {hero.heroSectionBackgroundFill === 'gradient' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <HeroColorField
                  label="Gradient start"
                  value={hero.heroSectionBackgroundGradientFrom}
                  onChange={(heroSectionBackgroundGradientFrom) =>
                    onChange({ heroSectionBackgroundGradientFrom })
                  }
                />
                <HeroColorField
                  label="Gradient end"
                  value={hero.heroSectionBackgroundGradientTo}
                  onChange={(heroSectionBackgroundGradientTo) =>
                    onChange({ heroSectionBackgroundGradientTo })
                  }
                />
              </div>
              <HeroOptionGrid
                label="Type"
                columns={2}
                options={PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS}
                value={hero.heroSectionBackgroundGradientType}
                onChange={(heroSectionBackgroundGradientType) =>
                  onChange({ heroSectionBackgroundGradientType })
                }
              />
              <HeroPxSlider
                label="Angle"
                value={hero.heroSectionBackgroundGradientAngle}
                min={0}
                max={360}
                unit="°"
                onChange={(heroSectionBackgroundGradientAngle) =>
                  onChange({ heroSectionBackgroundGradientAngle })
                }
              />
            </>
          ) : null}

          {hero.heroSectionBackgroundFill === 'split' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <HeroColorField
                  label="Color A"
                  value={hero.heroSectionBackgroundColorA}
                  onChange={(heroSectionBackgroundColorA) => onChange({ heroSectionBackgroundColorA })}
                />
                <HeroColorField
                  label="Color B"
                  value={hero.heroSectionBackgroundColorB}
                  onChange={(heroSectionBackgroundColorB) => onChange({ heroSectionBackgroundColorB })}
                />
              </div>
              <HeroOptionGrid
                label="Direction"
                columns={2}
                options={PORTFOLIO_HERO_BACKGROUND_SPLIT_AXIS_OPTIONS}
                value={hero.heroSectionBackgroundSplitAxis}
                onChange={(heroSectionBackgroundSplitAxis) =>
                  onChange({ heroSectionBackgroundSplitAxis })
                }
              />
            </>
          ) : null}

          {hero.heroSectionBackgroundFill === 'image' ? (
            <>
              <PortfolioBackgroundImageUpload
                label="Image"
                url={hero.heroSectionBackgroundImageUrl}
                onChange={(heroSectionBackgroundImageUrl) => onChange({ heroSectionBackgroundImageUrl })}
                library={backgroundLibrary?.library}
                onLibraryChange={backgroundLibrary?.onLibraryChange}
              />
              <HeroOptionGrid
                label="Size"
                columns={3}
                options={HERO_BACKGROUND_IMAGE_SIZE_OPTIONS}
                value={hero.heroSectionBackgroundImageSize}
                onChange={(heroSectionBackgroundImageSize) => onChange({ heroSectionBackgroundImageSize })}
              />
              <HeroOptionGrid
                label="Position"
                columns={3}
                options={HERO_BACKGROUND_IMAGE_POSITION_OPTIONS}
                value={hero.heroSectionBackgroundImagePosition}
                onChange={(heroSectionBackgroundImagePosition) =>
                  onChange({ heroSectionBackgroundImagePosition })
                }
              />
            </>
          ) : null}

          {hero.heroSectionBackgroundFill !== 'transparent' && hero.heroSectionBackgroundFill !== 'none' ? (
            <HeroPxSlider
              label="Opacity"
              value={hero.heroSectionBackgroundOpacity}
              min={0}
              max={100}
              unit="%"
              onChange={(heroSectionBackgroundOpacity) => onChange({ heroSectionBackgroundOpacity })}
            />
          ) : null}
        </div>
      ) : null}
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
