'use client';

import { useState } from 'react';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
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
import { SettingRow, SettingsRowsScope, settingValueLabel, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import {
  FieldLabel,
  PF_TEXT_INPUT,
  SectionHiddenNotice,
  SelectedBadge,
  SettingsSwitch,
  SettingsSwitchRow,
  SettingsTabs,
  pfChipClass,
} from '@/components/portfolio/portfolio-settings-ui';
import { msg } from '@/lib/i18n/config';

export type HeroSettingsSubSection = 'general' | 'banner' | 'background';

const HERO_SETTINGS_SUB_SECTIONS: {
  id: HeroSettingsSubSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'banner',
    label: msg('Design'),
    description: msg('Hero banner layouts — Classic, Swiss editorial, and future designs.'),
  },
  {
    id: 'background',
    label: msg('Background'),
    description: msg('Section-wide fill — solid, gradient, image, or split — behind every banner design.'),
  },
];

/** Map legacy subsection ids (saved UI state / search) onto remaining Hero menus. */
export function normalizeHeroSettingsSubSection(value: string | undefined): HeroSettingsSubSection {
  // 'general' (legacy / search) held only "Show section", which now opens the Design tab.
  return value === 'background' ? 'background' : 'banner';
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

function HeroToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const rows = useSettingsRows();
  if (rows) return <SettingRow label={label} toggle={{ checked: checked, onChange: onChange }} />;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left"
    >
      <span className="min-w-0 text-[14px] font-medium text-[color:var(--pf-palette-texte-fort)]">{label}</span>
      <SettingsSwitch checked={checked} />
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
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={value.toUpperCase()} preview={<span aria-hidden className="block h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: value }} />}>
    <div>
      {rows ? null : <FieldLabel>{label}</FieldLabel>}
      <div className={`${rows ? '' : 'mt-3 '}flex flex-wrap items-center gap-3`}>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm font-mono text-[color:var(--pf-palette-texte-fort)]"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
    </SettingRow>
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
  const t = useT();
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={settingValueLabel(options, value)}>
    <div>
      {rows ? null : <FieldLabel>{label}</FieldLabel>}
      <div
        className={`${rows ? '' : 'mt-3 '}grid gap-2 ${
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
              className={`px-3 text-center ${active ? 'pf-choice pf-choice--active' : 'pf-choice'}`}
            >
              <span>{t(option.label)}</span>
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

const HERO_BACKGROUND_IMAGE_SIZE_OPTIONS: {
  value: PortfolioHeroBackgroundSettings['heroSectionBackgroundImageSize'];
  label: string;
}[] = [
  { value: 'cover', label: msg('Fill screen') },
  { value: 'contain', label: msg('Whole image') },
  { value: 'fill', label: msg('Stretch') },
];

const HERO_BACKGROUND_IMAGE_POSITION_OPTIONS: {
  value: PortfolioHeroBackgroundSettings['heroSectionBackgroundImagePosition'];
  label: string;
}[] = [
  { value: 'center', label: msg('Center') },
  { value: 'top', label: msg('Top') },
  { value: 'bottom', label: msg('Bottom') },
  { value: 'left', label: msg('Left') },
  { value: 'right', label: msg('Right') },
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
  const rows = useSettingsRows();
  return (
    <SettingRow label={label} value={`${value}${unit}`}>
    <div>
      <div className={rows ? 'hidden' : 'flex items-center justify-between gap-4'}>
        <FieldLabel>{label}</FieldLabel>
        <span className="text-sm font-semibold text-[color:var(--pf-palette-texte-muted)]">
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
        className={`${rows ? '' : 'mt-3 '}h-2 w-full cursor-pointer accent-[color:var(--pf-palette-texte-fort)]`}
        aria-label={label}
      />
    </div>
    </SettingRow>
  );
}

/**
 * The profile's tools as pills, up to `limit` picked for the banner. With nothing picked the banner
 * shows the first `limit` from the profile — the pills say so by showing those as selected.
 */
function HeroToolPicker({
  tools,
  limit,
  value,
  onChange,
}: {
  tools: string[];
  limit: number;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const t = useT();
  if (tools.length === 0) {
    return <p className="mt-2 text-[13px] text-[color:var(--pf-palette-texte-muted)]">{t('Add tools to your profile to show them here.')}</p>;
  }
  const picked = value.length > 0 ? value : tools.slice(0, limit);
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tools.map((tool) => {
          const active = picked.includes(tool);
          return (
            <button
              key={tool}
              type="button"
              aria-pressed={active}
              disabled={!active && picked.length >= limit}
              onClick={() =>
                onChange(active ? picked.filter((item) => item !== tool) : [...picked, tool].slice(0, limit))
              }
              className={pfChipClass(active)}
            >
              <CreatorToolLogo label={tool} size={18} />
              {tool}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 text-[12px] text-[color:var(--pf-palette-texte-muted)]">
        <span>{t('{count} of {limit} shown', { count: picked.length, limit })}</span>
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-semibold underline-offset-4 hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
          >
            {t('Use profile order')}
          </button>
        ) : null}
      </div>
    </>
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
  const t = useT();
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<HeroSettingsSubSection>('banner');
  const subSection = normalizeHeroSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: HeroSettingsSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  // Banner tab: browse designs (grid) vs configure the selected one (detail) — picking a
  // design jumps straight to its settings instead of leaving them buried below the grid.
  const [showBannerGrid, setShowBannerGrid] = useState(false);
  const previewSource = usePortfolioDesignPreviewSource();
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
        <SettingsTabs tabs={HERO_SETTINGS_SUB_SECTIONS} value={subSection} onChange={setSubSection} />
      </div>

      {subSection === 'banner' ? (
        <div className="space-y-6">
          <SettingsSwitchRow
            label={t('Show section')}
            description={hero.enabled ? undefined : t('The page starts with the next section.')}
            checked={hero.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          {!hero.enabled ? null : showBannerGrid ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <FieldLabel>{t('Design Banner')}</FieldLabel>
                <button
                  type="button"
                  onClick={() => setShowBannerGrid(false)}
                  className="text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
                >
                  {t('← Back')}
                </button>
              </div>
              {previewSource ? (
                /* In the studio: every banner rendered for real, one per row. */
                <div className="mt-4 flex flex-col gap-3">
                  {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map((option) => (
                    <PortfolioDesignLivePreviewCard
                      key={option.value}
                      cardClassName="pf-stack-design-card"
                      labelClassName="pf-stack-card-label"
                      active={selectedBannerDesign === option.value}
                      label={t(option.label)}
                      src={withDesignPreview(previewSource.portfolioPath, { section: 'hero', design: option.value })}
                      settings={previewSource.settings}
                      onClick={() => {
                        onChange(heroBannerDesignSettingsPatch(option.value));
                        setShowBannerGrid(false);
                      }}
                    />
                  ))}
                </div>
              ) : (
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
                      className={`relative rounded-2xl p-3 text-left transition-shadow focus-visible:outline-none ${
                        active
                          ? 'shadow-[inset_0_0_0_2px_var(--pf-palette-texte-fort)]'
                          : 'shadow-[inset_0_0_0_1px_var(--pf-palette-bordure)] hover:shadow-[inset_0_0_0_1px_var(--pf-palette-texte-muted)] focus-visible:shadow-[inset_0_0_0_2px_var(--pf-palette-texte-muted)]'
                      }`}
                    >
                      {active ? <SelectedBadge /> : null}
                      <div className="overflow-hidden rounded-xl">
                        {/* No `hero` prop here: this grid compares many designs at once, so
                            it must stay an abstract mini-schema (fixed shape count, uniform
                            height) — real content (variable-length text, pills, dots) belongs
                            only in the single-design detail preview above. */}
                        <HeroBannerDesignPreview design={option.value} />
                      </div>
                      <span
                        className={`mt-3 block text-sm ${
                          active ? 'font-semibold text-[color:var(--pf-palette-texte-fort)]' : 'font-medium text-[color:var(--pf-palette-texte-muted)]'
                        }`}
                      >
                        {t(option.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="group relative w-full overflow-hidden rounded-2xl border border-[color:var(--pf-palette-bordure)]">
                  <HeroBannerDesignPreview design={selectedBannerDesign} hero={hero} />

                  {/* Desktop: full dark overlay revealed on hover/keyboard focus. */}
                  <button
                    type="button"
                    onClick={() => setShowBannerGrid(true)}
                    aria-label={t('Change banner design')}
                    className="absolute inset-0 hidden items-center justify-center bg-black/55 opacity-0 outline-none transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 sm:flex"
                  >
                    <span className="inline-flex items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)] shadow-lg">
                      <HeroChangeIcon className="h-4 w-4" />
                      {t('Change banner')}
                    </span>
                  </button>

                  {/* Mobile/touch: no hover, so keep a small persistent affordance instead. */}
                  <button
                    type="button"
                    onClick={() => setShowBannerGrid(true)}
                    aria-label={t('Change banner design')}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white sm:hidden"
                  >
                    <HeroChangeIcon className="h-3.5 w-3.5" />
                    {t('Change')}
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{selectedBannerLabel}</p>
                <p className="mt-0.5 text-xs text-[color:var(--pf-palette-texte-muted)]">
                  <span className="hidden sm:inline">{t('Hover preview to change')}</span>
                  <span className="sm:hidden">{t('Tap preview to change')}</span>
                </p>
              </div>

              <SettingsRowsScope title={t('{design} options', { design: t(selectedBannerLabel) })}>
              <HeroToggleRow
                label={t('Black & white images')}
                checked={hero.heroImageGrayscale === true}
                onChange={(heroImageGrayscale) => onChange({ heroImageGrayscale })}
              />

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'cinematic-reveal' ? (
                <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
                  <div>
                    <FieldLabel>{t('Tools in the band')}</FieldLabel>
                    <HeroToolPicker tools={normalizedTools} limit={8} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
                  </div>
                </div>
              ) : null}

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'swiss-editorial' ? (
                <div className="space-y-6 border-t border-[color:var(--pf-palette-bordure)] pt-6">
                  <HeroToggleRow
                    label={t('Swap bio ↔ name + specialty')}
                    checked={hero.heroBannerSwapBioName === true}
                    onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
                  />
                  <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
                    <div>
                      <FieldLabel>{t('Currently label')}</FieldLabel>
                      <input
                        type="text"
                        value={hero.heroCurrentlyLabel ?? 'Currently'}
                        onChange={(event) => onChange({ heroCurrentlyLabel: event.target.value })}
                        className={`mt-2 ${PF_TEXT_INPUT}`}
                      />
                    </div>
                    <div>
                      <FieldLabel>{t('Specialized in label')}</FieldLabel>
                      <input
                        type="text"
                        value={hero.heroSpecializedInLabel ?? 'Specialized in'}
                        onChange={(event) => onChange({ heroSpecializedInLabel: event.target.value })}
                        className={`mt-2 ${PF_TEXT_INPUT}`}
                      />
                    </div>
                    <div>
                      <FieldLabel>{t('Signature word')}</FieldLabel>
                      <input
                        type="text"
                        value={hero.heroSignatureWord ?? ''}
                        onChange={(event) => onChange({ heroSignatureWord: event.target.value })}
                        placeholder={t('e.g. JOHN')}
                        className={`mt-2 ${PF_TEXT_INPUT}`}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-identity' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-7">
              <HeroToggleRow
                label={t('Swap bio ↔ name + specialty')}
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
            </div>
          ) : null}


          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-rail' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroToggleRow
                label={t('Bio under the portrait')}
                checked={hero.heroEditorialRailBioUnderPortrait === true}
                onChange={(heroEditorialRailBioUnderPortrait) =>
                  onChange({ heroEditorialRailBioUnderPortrait })
                }
              />
              <HeroToggleRow
                label={t('Name + specialty under the portrait')}
                checked={hero.heroEditorialRailIdentityUnderPortrait === true}
                onChange={(heroEditorialRailIdentityUnderPortrait) =>
                  onChange({ heroEditorialRailIdentityUnderPortrait })
                }
              />
              <HeroToggleRow
                label={t('CTA under the bio')}
                checked={hero.heroEditorialRailShowCta === true}
                onChange={(heroEditorialRailShowCta) =>
                  onChange({ heroEditorialRailShowCta })
                }
              />

              <div>
                <FieldLabel>{t('Tools shown')}</FieldLabel>
                <HeroToolPicker tools={normalizedTools} limit={4} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'statement-cta' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroToggleRow
                label={t('Round portrait in the center')}
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
                    label={t('Accent color ring')}
                    checked={hero.heroStatementCtaPortraitRing === true}
                    onChange={(heroStatementCtaPortraitRing) =>
                      onChange({ heroStatementCtaPortraitRing })
                    }
                  />
                  <HeroPxSlider
                    label={t('Portrait size')}
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
                label={t('Horizontal cover')}
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
                  label={t('Image cover')}
                  url={hero.heroStatementCtaCoverImageUrl ?? ''}
                  onChange={(heroStatementCtaCoverImageUrl) =>
                    onChange({ heroStatementCtaCoverImageUrl })
                  }
                  library={backgroundLibrary?.library}
                  onLibraryChange={backgroundLibrary?.onLibraryChange}
                  helperText={t('Image for the horizontal rectangle — independent of the profile and the round portrait.')}
                />
              ) : null}
              <div>
                <FieldLabel>{t('Tools shown')}</FieldLabel>
                <HeroToolPicker tools={normalizedTools} limit={5} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-balance' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <div>
                <FieldLabel>{t('Tools shown')}</FieldLabel>
                <HeroToolPicker tools={normalizedTools} limit={12} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'left-portrait' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroToggleRow
                label={t('Specialty highlight')}
                checked={hero.heroLeftPortraitSpecialtyMark === true}
                onChange={(heroLeftPortraitSpecialtyMark) =>
                  onChange({ heroLeftPortraitSpecialtyMark })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'circle-portrait' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroToggleRow
                label={t('Specialty highlight')}
                checked={hero.heroCirclePortraitSpecialtyMark === true}
                onChange={(heroCirclePortraitSpecialtyMark) =>
                  onChange({ heroCirclePortraitSpecialtyMark })
                }
              />
              <HeroToggleRow
                label={t('Title at the top')}
                checked={hero.heroCirclePortraitTitleBottom === false}
                onChange={(titleTop) =>
                  onChange({ heroCirclePortraitTitleBottom: !titleTop })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'experience-split' ? (
            <div className="space-y-3 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroToggleRow
                label={t('Bio on the right')}
                checked={hero.heroExperienceSplitBioRight !== false}
                onChange={(heroExperienceSplitBioRight) =>
                  onChange({ heroExperienceSplitBioRight })
                }
              />
              <HeroToggleRow
                label={t('Overall frame')}
                checked={hero.heroExperienceSplitGlobalFrame === true}
                onChange={(heroExperienceSplitGlobalFrame) =>
                  onChange({ heroExperienceSplitGlobalFrame })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-overlap' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <PortfolioBackgroundImageUpload
                label={t('Scene image')}
                url={hero.heroEditorialOverlapImageUrl ?? ''}
                onChange={(heroEditorialOverlapImageUrl) =>
                  onChange({ heroEditorialOverlapImageUrl })
                }
                library={backgroundLibrary?.library}
                onLibraryChange={backgroundLibrary?.onLibraryChange}
                helperText={t('Landscape photo behind the panel — independent of the profile avatar.')}
              />
              <label className="block space-y-2">
                <span className="block text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">
                  {t('Editorial title (optional)')}
                </span>
                <textarea
                  rows={2}
                  value={hero.heroEditorialOverlapHeadline ?? ''}
                  onChange={(event) =>
                    onChange({ heroEditorialOverlapHeadline: event.target.value })
                  }
                  placeholder={t('Hi, I\'m …')}
                  className={PF_TEXT_INPUT}
                />
              </label>
              <HeroOptionGrid
                label={t('Frame width')}
                columns={3}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
                value={hero.heroEditorialOverlapWidth ?? 'full'}
                onChange={(heroEditorialOverlapWidth) =>
                  onChange({ heroEditorialOverlapWidth })
                }
              />
              <HeroOptionGrid
                label={t('Position')}
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
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroOptionGrid
                label={t('Identity layout')}
                columns={2}
                options={PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS}
                value={hero.heroSelectedWorksIdentityLayout ?? 'split'}
                onChange={(heroSelectedWorksIdentityLayout) =>
                  onChange({ heroSelectedWorksIdentityLayout })
                }
              />
              <HeroPxSlider
                label={t('Thumbnail dimming')}
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
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroToggleRow
                label={t('Swap name ↔ bio')}
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
              <HeroToggleRow
                label={t('Portrait bottom right')}
                checked={hero.heroIdentityIndexShowPortrait === true}
                onChange={(heroIdentityIndexShowPortrait) =>
                  onChange({ heroIdentityIndexShowPortrait })
                }
              />
              {hero.heroIdentityIndexShowPortrait === true ? (
                <>
                  <HeroToggleRow
                    label={t('Swap bio ↔ image')}
                    checked={hero.heroIdentityIndexSwapBioPortrait === true}
                    onChange={(heroIdentityIndexSwapBioPortrait) =>
                      onChange({ heroIdentityIndexSwapBioPortrait })
                    }
                  />
                  <HeroOptionGrid
                    label={t('Image rounding')}
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
                label={t('Media frame at the bottom')}
                checked={hero.heroIdentityIndexShowBottomMedia === true}
                onChange={(heroIdentityIndexShowBottomMedia) =>
                  onChange({ heroIdentityIndexShowBottomMedia })
                }
              />
              {hero.heroIdentityIndexShowBottomMedia === true ? (
                <PortfolioHeroBannerMediaUpload
                  label={t('Frame photo / video')}
                  url={hero.heroIdentityIndexBottomMediaUrl ?? ''}
                  onChange={(heroIdentityIndexBottomMediaUrl) =>
                    onChange({ heroIdentityIndexBottomMediaUrl })
                  }
                  helperText={t('Media independent of the profile portrait. Shown full width at the very bottom of the hero.')}
                />
              ) : null}
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'studio-split' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--pf-palette-texte-muted)]">
                  {t('Eyebrow (e.g. Portfolio)')}
                </p>
                <input
                  type="text"
                  value={hero.heroStudioSplitEyebrow ?? 'Portfolio'}
                  onChange={(event) => onChange({ heroStudioSplitEyebrow: event.target.value })}
                  placeholder={t('Portfolio')}
                  className={`mt-2 ${PF_TEXT_INPUT}`}
                />
              </div>
              <PortfolioHeroBannerMediaUpload
                label={t('Frame photo / video')}
                url={hero.heroStudioSplitMediaUrl ?? ''}
                onChange={(heroStudioSplitMediaUrl) => onChange({ heroStudioSplitMediaUrl })}
                helperText={t('Large rounded frame under the band — independent of the profile avatar.')}
              />
              <HeroOptionGrid
                label={t('Frame width')}
                columns={3}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
                value={hero.heroStudioSplitMediaWidth ?? 'full'}
                onChange={(heroStudioSplitMediaWidth) => onChange({ heroStudioSplitMediaWidth })}
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'work-duo' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <div>
                <FieldLabel>{t('Selected works shown')}</FieldLabel>
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
                                ? 'border-[color:var(--pf-palette-texte-fort)] ring-2 ring-[color:var(--pf-palette-texte-fort)]'
                                : 'border-[color:var(--pf-palette-bordure)] hover:border-[color:var(--pf-palette-texte-muted)]'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            <span className="relative block aspect-[4/3] w-full bg-[color:var(--pf-surface)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={work.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </span>
                            <span className="block truncate px-2.5 py-2 text-xs font-medium text-[color:var(--pf-palette-texte-fort)]">
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
                        className="mt-3 text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
                      >
                        {t('Reset — first 2 projects')}
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'bowl-intro' ? (
            <div className="space-y-4 border-t border-[color:var(--pf-palette-bordure)] pt-6">
              <HeroOptionGrid
                label={t('Pattern behind the portrait')}
                columns={2}
                options={PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS}
                value={hero.heroBowlIntroMotif ?? 'bowl'}
                onChange={(heroBowlIntroMotif) => onChange({ heroBowlIntroMotif })}
              />
            </div>
          ) : null}
                          </SettingsRowsScope>
            </div>
          )}
        </div>
      ) : null}

      {subSection === 'background' && !hero.enabled ? <SectionHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'background' && hero.enabled ? (
        <div className="space-y-5">
          <HeroOptionGrid
            label={t('Fill')}
            columns={3}
            options={PORTFOLIO_HERO_SECTION_BACKGROUND_FILL_OPTIONS}
            value={hero.heroSectionBackgroundFill}
            onChange={(heroSectionBackgroundFill) => onChange({ heroSectionBackgroundFill })}
          />

          {hero.heroSectionBackgroundFill === 'solid' ? (
            <HeroColorField
              label={t('Color')}
              value={hero.heroSectionBackgroundColor}
              onChange={(heroSectionBackgroundColor) => onChange({ heroSectionBackgroundColor })}
            />
          ) : null}

          {hero.heroSectionBackgroundFill === 'gradient' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <HeroColorField
                  label={t('Gradient start')}
                  value={hero.heroSectionBackgroundGradientFrom}
                  onChange={(heroSectionBackgroundGradientFrom) =>
                    onChange({ heroSectionBackgroundGradientFrom })
                  }
                />
                <HeroColorField
                  label={t('Gradient end')}
                  value={hero.heroSectionBackgroundGradientTo}
                  onChange={(heroSectionBackgroundGradientTo) =>
                    onChange({ heroSectionBackgroundGradientTo })
                  }
                />
              </div>
              <HeroOptionGrid
                label={t('Type')}
                columns={2}
                options={PORTFOLIO_HERO_BACKGROUND_GRADIENT_TYPE_OPTIONS}
                value={hero.heroSectionBackgroundGradientType}
                onChange={(heroSectionBackgroundGradientType) =>
                  onChange({ heroSectionBackgroundGradientType })
                }
              />
              <HeroPxSlider
                label={t('Angle')}
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
                  label={t('Color A')}
                  value={hero.heroSectionBackgroundColorA}
                  onChange={(heroSectionBackgroundColorA) => onChange({ heroSectionBackgroundColorA })}
                />
                <HeroColorField
                  label={t('Color B')}
                  value={hero.heroSectionBackgroundColorB}
                  onChange={(heroSectionBackgroundColorB) => onChange({ heroSectionBackgroundColorB })}
                />
              </div>
              <HeroOptionGrid
                label={t('Direction')}
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
                label={t('Image')}
                url={hero.heroSectionBackgroundImageUrl}
                onChange={(heroSectionBackgroundImageUrl) => onChange({ heroSectionBackgroundImageUrl })}
                library={backgroundLibrary?.library}
                onLibraryChange={backgroundLibrary?.onLibraryChange}
              />
              <HeroOptionGrid
                label={t('Size')}
                columns={3}
                options={HERO_BACKGROUND_IMAGE_SIZE_OPTIONS}
                value={hero.heroSectionBackgroundImageSize}
                onChange={(heroSectionBackgroundImageSize) => onChange({ heroSectionBackgroundImageSize })}
              />
              <HeroOptionGrid
                label={t('Position')}
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
              label={t('Opacity')}
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
