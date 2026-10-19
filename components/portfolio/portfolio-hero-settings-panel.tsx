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
  PORTFOLIO_HERO_STUDIO_SPLIT_FRAME_STYLE_OPTIONS,
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
import {
  createDefaultPortfolioSettings,
  type PortfolioHeroSectionSettings,
} from '@/components/portfolio/portfolio-settings-types';
import { PortfolioBackgroundImageUpload, PortfolioHeroBannerMediaUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { usePortfolioBackgroundLibrary } from '@/components/portfolio/portfolio-background-library-context';
import { useT } from '@/lib/i18n/I18nProvider';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpOptionCard,
  NpPanelShell,
  NpPickerRow,
  NpRangeField,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';
import { msg } from '@/lib/i18n/config';

export type HeroSettingsSubSection = 'general' | 'banner' | 'background';

const HERO_SETTINGS_SUB_SECTIONS: {
  id: HeroSettingsSubSection;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: msg('General'),
    description: msg('Section visibility and shared image settings.'),
  },
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
  return value === 'general' || value === 'background' || value === 'banner' ? value : 'general';
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
  return <NpToggleRow title={label} checked={checked} onChange={onChange} />;
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
    <div className="np-field">
      <span className="np-field-label">{label}</span>
      <div className="np-swatch w-full">
        <span className="np-swatch-dot" style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="np-color-input"
          aria-label={`${label} picker`}
        />
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="np-input !h-9 !w-28 font-mono uppercase"
          aria-label={`${label} hex`}
        />
      </div>
    </div>
  );
}

function HeroOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useT();
  if (options.length >= 5) {
    return (
      <div className="np-field">
        <span className="np-field-label">{label}</span>
        <div className="np-chips" role="group" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={option.value === value}
              className="np-chip"
              onClick={() => onChange(option.value)}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <NpSegmentedControl
      label={label}
      options={options.map((option) => ({ ...option, label: t(option.label) }))}
      value={value}
      onChange={onChange}
    />
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
  return (
    <NpRangeField label={label} value={value} min={min} max={max} unit={unit} onChange={onChange} />
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
    return <p className="np-note">{t('Add tools to your profile to show them here.')}</p>;
  }
  const picked = value.length > 0 ? value : tools.slice(0, limit);
  return (
    <>
      <div className="np-chips">
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
              className="np-chip"
              data-active={active ? 'true' : 'false'}
            >
              <CreatorToolLogo label={tool} size={18} />
              {tool}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="np-value-badge">{t('{count} of {limit} shown', { count: picked.length, limit })}</span>
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="np-link-btn"
          >
            {t('Use profile order')}
          </button>
        ) : null}
      </div>
    </>
  );
}

const HERO_DEFAULTS = createDefaultPortfolioSettings().hero;

function isHeroModified(hero: PortfolioHeroSectionSettings) {
  const keys = Object.keys({ ...HERO_DEFAULTS, ...hero }) as (keyof PortfolioHeroSectionSettings)[];
  return keys.some((key) => {
    const value = hero[key] === undefined ? HERO_DEFAULTS[key] : hero[key];
    return JSON.stringify(value) !== JSON.stringify(HERO_DEFAULTS[key]);
  });
}

const HERO_DESIGNS_WITH_OPTIONS = new Set([
  'swiss-editorial',
  'portrait-identity',
  'editorial-rail',
  'statement-cta',
  'portrait-balance',
  'left-portrait',
  'circle-portrait',
  'experience-split',
  'editorial-overlap',
  'selected-works',
  'identity-index',
  'studio-split',
  'work-duo',
  'bowl-intro',
]);

function HeroHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !gap-0 !py-6 text-center">
      <p className="np-card-title">{t('The Hero section is hidden')}</p>
      <p className="np-subtle mt-1">{t('Turn it on to customize its presentation.')}</p>
      <button type="button" onClick={onEnable} className="np-primary-btn mt-5">
        {t('Show section')}
      </button>
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
  chrome,
}: {
  hero: PortfolioHeroSectionSettings;
  availableTools: string[];
  availableWorks?: { id: string; title: string; imageUrl: string }[];
  onChange: (patch: Partial<PortfolioHeroSectionSettings>) => void;
  subSection?: HeroSettingsSubSection;
  onSubSectionChange?: (value: HeroSettingsSubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<HeroSettingsSubSection>('general');
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
    <NpPanelShell
      title={t('Hero')}
      modified={isHeroModified(hero)}
      tabs={HERO_SETTINGS_SUB_SECTIONS.map((section) => ({ id: section.id, label: t(section.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange({ ...HERO_DEFAULTS })}
      chrome={chrome}
    >
      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show Hero section')}
            description={hero.enabled ? t('The opening section of the public portfolio.') : t('The page starts with the next section.')}
            checked={hero.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div className="np-dimmable" data-disabled={hero.enabled ? 'false' : 'true'} aria-disabled={!hero.enabled} inert={!hero.enabled}>
            <NpCollapsibleSection title={t('Images')}>
              <NpToggleRow
                title={t('Black & white images')}
                checked={hero.heroImageGrayscale === true}
                onChange={(heroImageGrayscale) => onChange({ heroImageGrayscale })}
              />
            </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection === 'banner' && !hero.enabled ? <HeroHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'banner' && hero.enabled ? (
          showBannerGrid ? (
            <div className="np-stack">
              <NpBackRow title={t('Hero design')} onBack={() => setShowBannerGrid(false)} />
              {previewSource ? (
                /* In the studio: every banner rendered for real, one per row. */
                <div className="mt-3 flex flex-col gap-7">
                  {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map((option) => (
                    <PortfolioDesignLivePreviewCard
                      key={option.value}
                      cardClassName="pf-stack-design-card pf-hero-design-card"
                      labelClassName="pf-stack-card-label"
                      showPreviewRing={false}
                      showCurrentBadge={false}
                      flush
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
              <div className="mt-3 grid grid-cols-2 gap-3">
                {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map((option) => {
                  const active = selectedBannerDesign === option.value;
                  return (
                    <NpOptionCard
                      key={option.value}
                      selected={active}
                      title={t(option.label)}
                      onClick={() => {
                        onChange(heroBannerDesignSettingsPatch(option.value));
                        setShowBannerGrid(false);
                      }}
                      illustration={
                      <div className="h-full w-full overflow-hidden rounded-md">
                        {/* No `hero` prop here: this grid compares many designs at once, so
                            it must stay an abstract mini-schema (fixed shape count, uniform
                            height) — real content (variable-length text, pills, dots) belongs
                            only in the single-design detail preview above. */}
                        <HeroBannerDesignPreview design={option.value} />
                      </div>
                      }
                    />
                  );
                })}
              </div>
              )}
            </div>
          ) : (
            <div className="np-stack">
              <NpCollapsibleSection title={t('Layout')}>
                <NpPickerRow
                  label={t('Hero design')}
                  value={t(selectedBannerLabel)}
                  thumbnail={
                    <div className="h-full w-full overflow-hidden rounded-md">
                      <HeroBannerDesignPreview design={selectedBannerDesign} hero={hero} />
                    </div>
                  }
                  onClick={() => setShowBannerGrid(true)}
                />
              </NpCollapsibleSection>

              {HERO_DESIGNS_WITH_OPTIONS.has(selectedBannerDesign) ? (
              <NpCollapsibleSection title={t('Layout options')}>

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'swiss-editorial' ? (
                <div className="space-y-6">
                  <HeroToggleRow
                    label={t('Swap bio ↔ name + specialty')}
                    checked={hero.heroBannerSwapBioName === true}
                    onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
                  />
                  <div className="space-y-4">
                    <label className="np-field block">
                      <span className="np-field-label">{t('Currently label')}</span>
                      <input
                        type="text"
                        value={hero.heroCurrentlyLabel ?? 'Currently'}
                        onChange={(event) => onChange({ heroCurrentlyLabel: event.target.value })}
                        className="np-input"
                      />
                    </label>
                    <label className="np-field block">
                      <span className="np-field-label">{t('Specialized in label')}</span>
                      <input
                        type="text"
                        value={hero.heroSpecializedInLabel ?? 'Specialized in'}
                        onChange={(event) => onChange({ heroSpecializedInLabel: event.target.value })}
                        className="np-input"
                      />
                    </label>
                    <label className="np-field block">
                      <span className="np-field-label">{t('Signature word')}</span>
                      <input
                        type="text"
                        value={hero.heroSignatureWord ?? ''}
                        onChange={(event) => onChange({ heroSignatureWord: event.target.value })}
                        placeholder={t('e.g. JOHN')}
                        className="np-input"
                      />
                    </label>
                  </div>
                </div>
              ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-identity' ? (
            <div className="space-y-4">
              <HeroToggleRow
                label={t('Swap bio ↔ name + specialty')}
                checked={hero.heroBannerSwapBioName === true}
                onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
              />
            </div>
          ) : null}


          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'editorial-rail' ? (
            <div className="space-y-4">
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
                <span className="np-field-label">{t('Tools shown')}</span>
                <HeroToolPicker tools={normalizedTools} limit={4} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'statement-cta' ? (
            <div className="space-y-4">
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
                <span className="np-field-label">{t('Tools shown')}</span>
                <HeroToolPicker tools={normalizedTools} limit={5} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-balance' ? (
            <div className="space-y-4">
              <div>
                <span className="np-field-label">{t('Tools shown')}</span>
                <HeroToolPicker tools={normalizedTools} limit={12} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'left-portrait' ? (
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            <div className="space-y-3">
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
            <div className="space-y-4">
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
              <label className="np-field block">
                <span className="np-field-label">
                  {t('Editorial title (optional)')}
                </span>
                <textarea
                  rows={2}
                  value={hero.heroEditorialOverlapHeadline ?? ''}
                  onChange={(event) =>
                    onChange({ heroEditorialOverlapHeadline: event.target.value })
                  }
                  placeholder={t('Hi, I\'m …')}
                  className="np-input !h-auto min-h-20 resize-y py-3"
                />
              </label>
              <HeroOptionGrid
                label={t('Frame width')}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
                value={hero.heroEditorialOverlapWidth ?? 'full'}
                onChange={(heroEditorialOverlapWidth) =>
                  onChange({ heroEditorialOverlapWidth })
                }
              />
              <HeroOptionGrid
                label={t('Position')}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_ALIGN_OPTIONS}
                value={hero.heroEditorialOverlapAlign ?? 'left'}
                onChange={(heroEditorialOverlapAlign) =>
                  onChange({ heroEditorialOverlapAlign })
                }
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'selected-works' ? (
            <div className="space-y-4">
              <HeroOptionGrid
                label={t('Identity layout')}
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
            <div className="space-y-4">
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
            <div className="space-y-4">
              <label className="np-field block">
                <span className="np-field-label">
                  {t('Eyebrow (e.g. Portfolio)')}
                </span>
                <input
                  type="text"
                  value={hero.heroStudioSplitEyebrow ?? 'Portfolio'}
                  onChange={(event) => onChange({ heroStudioSplitEyebrow: event.target.value })}
                  placeholder={t('Portfolio')}
                  className="np-input"
                />
              </label>
              <PortfolioHeroBannerMediaUpload
                label={t('Frame photo / video')}
                url={hero.heroStudioSplitMediaUrl ?? ''}
                onChange={(heroStudioSplitMediaUrl) => onChange({ heroStudioSplitMediaUrl })}
                helperText={t('Optional custom media. Without one, the circle, portrait and square formats use the profile portrait; panorama keeps the abstract scene.')}
              />
              <HeroOptionGrid
                label={t('Frame format')}
                options={PORTFOLIO_HERO_STUDIO_SPLIT_FRAME_STYLE_OPTIONS}
                value={hero.heroStudioSplitFrameStyle ?? 'circle-center'}
                onChange={(heroStudioSplitFrameStyle) => onChange({ heroStudioSplitFrameStyle })}
              />
              <HeroOptionGrid
                label={t('Frame size')}
                options={PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS}
                value={hero.heroStudioSplitMediaWidth ?? 'full'}
                onChange={(heroStudioSplitMediaWidth) => onChange({ heroStudioSplitMediaWidth })}
              />
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'work-duo' ? (
            <div className="space-y-4">
              <label className="np-field block">
                <span className="np-field-label">{t('Experience label')}</span>
                <input
                  type="text"
                  value={hero.heroWorkDuoExperienceLabel ?? 'Experience built through real projects'}
                  onChange={(event) => onChange({ heroWorkDuoExperienceLabel: event.target.value })}
                  placeholder={t('Experience built through real projects')}
                  className="np-input"
                />
              </label>
              <div className="np-field">
                <span className="np-field-label">{t('Selected works shown')}</span>
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
                            className={`overflow-hidden rounded-xl border bg-[color:var(--np-card)] text-left transition ${
                              active
                                ? 'border-[color:var(--np-accent)] ring-2 ring-[color:var(--np-accent)]'
                                : 'border-[color:var(--np-card-border)] hover:border-[color:var(--np-muted)]'
                            } disabled:cursor-not-allowed disabled:opacity-45`}
                          >
                            <span className="relative block aspect-[4/3] w-full bg-[color:var(--np-well)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={work.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </span>
                            <span className="block truncate px-2.5 py-2 text-xs font-medium text-[color:var(--np-text)]">
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
                        className="np-link-btn mt-3"
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
            <div className="space-y-4">
              <HeroOptionGrid
                label={t('Portrait motif')}
                options={PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS}
                value={hero.heroBowlIntroMotif ?? 'bowl'}
                onChange={(heroBowlIntroMotif) => onChange({ heroBowlIntroMotif })}
              />
            </div>
          ) : null}

              </NpCollapsibleSection>
              ) : null}
            </div>
          )
      ) : null}

      {subSection === 'background' && !hero.enabled ? <HeroHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'background' && hero.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Fill')}>
          <HeroOptionGrid
            label={t('Fill')}
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
              <div className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-4">
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
                options={HERO_BACKGROUND_IMAGE_SIZE_OPTIONS}
                value={hero.heroSectionBackgroundImageSize}
                onChange={(heroSectionBackgroundImageSize) => onChange({ heroSectionBackgroundImageSize })}
              />
              <HeroOptionGrid
                label={t('Position')}
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
          </NpCollapsibleSection>
        </div>
      ) : null}
    </NpPanelShell>
  );
}
