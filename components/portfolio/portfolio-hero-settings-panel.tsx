'use client';
import { InfoBioToolbar } from './portfolio-info-bio-toolbar';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import { BowlPortraitOptionPreview } from './bowl-portrait-option-preview';
import { PortfolioHeroAdaptiveBackground } from './PortfolioHeroAdaptiveBackground';
import { SectionColorModeControl } from './portfolio-section-color-mode-control';
import { applyActivePortfolioPalette } from './portfolio-color-mode';
import {SectionPaletteFamilyControl} from './portfolio-section-palette-family';
import {SectionBackgroundSettingsFields} from './portfolio-section-background-controls';
import {heroSectionBackgroundFields,patchHeroSectionBackground} from './portfolio-hero-section-background';
import {ColorSwatchRow} from './portfolio-color-swatch-row';
import {sectionFamilyPalette} from './portfolio-section-palette-family';
import {DEFAULT_HERO_COLOR_BINDINGS,DEFAULT_HERO_PALETTE,type HeroColorSlot,type HeroPaletteTokenId} from './portfolio-hero-palette-settings';
import { usePortfolioBackgroundLibrary } from '@/components/portfolio/portfolio-background-library-context';

import { useState, type CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS,
  PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS,
  PORTFOLIO_HERO_EDITORIAL_OVERLAP_WIDTH_OPTIONS,
  PORTFOLIO_HERO_IDENTITY_INDEX_PORTRAIT_RADIUS_OPTIONS,
  PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS,
  PORTFOLIO_HERO_STUDIO_SPLIT_FRAME_STYLE_OPTIONS,
  heroBannerDesignSettingsPatch,
  PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS,
  type PortfolioHeroStudioSplitFrameStyle,
  type PortfolioHeroPortraitShape,
  type PortfolioHeroBowlIntroMotif,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import { HeroBannerDesignPreview } from '@/components/portfolio/portfolio-hero-banner-skeletons';
import {
  createDefaultPortfolioSettings,
  type PortfolioHeroSectionSettings,
} from '@/components/portfolio/portfolio-settings-types';
import { PortfolioBackgroundImageUpload, PortfolioHeroBannerMediaUpload } from '@/components/portfolio/portfolio-background-image-upload';
import { PortfolioSettingsPhotoField } from '@/components/portfolio/portfolio-settings-photo-field';
import { useT } from '@/lib/i18n/I18nProvider';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpPanelShell,
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
    description: msg('Settings shared by all Hero designs.'),
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
  return value === 'background' ? 'background' : value === 'banner' ? 'banner' : 'general';
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


/** Banner designs that show a portrait and honor the "Portrait shape" option. */
const HERO_PORTRAIT_SHAPE_DESIGNS: ReadonlySet<string> = new Set([
  'portrait-identity',
  'editorial-rail',
  'circle-portrait',
  'editorial-overlap',
  'bowl-intro',
]);

function HeroOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  portraitPreview = false,
  bowlPreview,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  portraitPreview?: boolean;
  bowlPreview?: { shape: PortfolioHeroPortraitShape; motif: PortfolioHeroBowlIntroMotif; kind: 'shape' | 'motif' };
}) {
  const t = useT();
  if (portraitPreview || bowlPreview) {
    return (
      <div className="np-field">
        <span className="np-field-label">{label}</span>
        <div className="np-portrait-shapes" role="group" aria-label={label}>
          {options.map((option) => (
            <button key={option.value} type="button" className="np-portrait-shape-card" title={option.description ? t(option.description) : undefined} aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
              {bowlPreview ? <BowlPortraitOptionPreview
                shape={bowlPreview.kind === 'shape' ? option.value as PortfolioHeroPortraitShape : 'auto'}
                motif={bowlPreview.kind === 'motif' ? option.value as PortfolioHeroBowlIntroMotif : undefined}
                defaultMotif={bowlPreview.motif}
              /> : <span className="np-portrait-shape-stage" aria-hidden="true">
                <span className="np-portrait-shape" data-shape={option.value}>
                  <span className="np-portrait-shape-head" />
                  <span className="np-portrait-shape-body" />
                </span>
              </span>}
              <span>{t(option.label)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
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

function StudioFrameFormatPicker({
  value,
  onChange,
}: {
  value: PortfolioHeroStudioSplitFrameStyle;
  onChange: (value: PortfolioHeroStudioSplitFrameStyle) => void;
}) {
  const t = useT();

  return (
    <div className="np-field">
      <span className="np-field-label">{t('Frame format')}</span>
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t('Frame format')}>
        {PORTFOLIO_HERO_STUDIO_SPLIT_FRAME_STYLE_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`group flex min-w-0 flex-col gap-2 rounded-xl border p-2.5 text-left transition ${
                active
                  ? 'border-[color:var(--np-text)] bg-[color:var(--np-seg-active)] shadow-[var(--np-seg-shadow)]'
                  : 'border-[color:var(--np-well-border)] bg-[color:var(--np-well)] hover:border-[color:var(--np-muted)]'
              }`}
            >
              <span className="relative flex h-[4.5rem] w-full items-center justify-center overflow-hidden rounded-lg bg-[color:var(--np-card)]" aria-hidden>
                <span
                  className={`border-2 border-[color:var(--np-muted)] bg-[color:var(--np-hover)] transition-colors group-hover:border-[color:var(--np-text)] ${
                    option.value === 'circle-center'
                      ? 'h-12 w-12 rounded-full'
                      : option.value === 'panorama'
                        ? 'h-9 w-[82%] [clip-path:polygon(0_0,88%_0,100%_28%,100%_100%,0_100%)]'
                        : option.value === 'portrait'
                          ? 'h-14 w-11 rounded-[0.65rem]'
                          : 'h-12 w-12 translate-x-2 [clip-path:polygon(0_0,84%_0,100%_16%,100%_100%,0_100%)]'
                  }`}
                />
                {option.value === 'offset-square' ? (
                  <span className="absolute h-12 w-12 -translate-x-1 translate-y-1 border border-dashed border-[color:var(--np-muted)]" />
                ) : null}
              </span>
              <span className="truncate text-[12px] font-semibold text-[color:var(--np-text)]">{t(option.label)}</span>
            </button>
          );
        })}
      </div>
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
    <div className="np-round-range">
    <NpRangeField label={label} value={value} min={min} max={max} unit={unit} onChange={onChange} />
    </div>
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
    return <><span className="np-field-label">{t('Tools shown')}</span><p className="np-note">{t('Add tools to your profile to show them here.')}</p></>;
  }
  const picked = (value.length > 0 ? value : tools).filter((tool) => tools.includes(tool)).slice(0, limit);
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="np-field-label !mb-0">{t('Tools shown')}</span>
        <span className="np-value-badge shrink-0">{t('{count} of {limit} shown', { count: picked.length, limit })}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tools.map((tool) => {
          const active = picked.includes(tool);
          return (
            <div key={tool} className="flex min-h-12 items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3 text-sm text-[var(--np-label)]">
                <CreatorToolLogo label={tool} size={22} />
                <span className="truncate">{tool}</span>
              </span>
            <button
              type="button"
              aria-pressed={active}
              aria-label={`${t('Tools shown')} — ${tool}`}
              disabled={!active && picked.length >= limit}
              onClick={() =>
                onChange(active ? picked.filter((item) => item !== tool) : [...picked, tool].slice(0, limit))
              }
              className="np-visibility-btn shrink-0 disabled:opacity-40"
              data-active={active ? 'true' : 'false'}
            >
              <FontAwesomeIcon icon={active ? faEye : faEyeSlash} className="h-4 w-4" aria-hidden="true" />
            </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
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
  'colophon',
  'statement-overlap',
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
  const availableWorkIds = new Set(availableWorks.map((work) => work.id));
  const selectedWorksIds = (
    hero.heroSelectedWorksSelectedWorkIds ?? availableWorks.slice(0, 4).map((work) => work.id)
  ).filter((id) => availableWorkIds.has(id)).slice(0, 4);
  const selectedWorkDuoIds = (hero.heroWorkDuoSelectedWorkIds ?? [])
    .filter((id) => availableWorkIds.has(id))
    .slice(0, 2);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<HeroSettingsSubSection>('general');
  const subSection = normalizeHeroSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: HeroSettingsSubSection) => {
    if(value==='banner')setShowBannerGrid(true);
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  // Banner tab: browse designs (grid) vs configure the selected one (detail) — picking a
  // design jumps straight to its settings instead of leaving them buried below the grid.
  const [showBannerGrid, setShowBannerGrid] = useState(true);
  const [catalogueVisited, setCatalogueVisited] = useState(subSection === 'banner');
  if (subSection === 'banner' && !catalogueVisited) setCatalogueVisited(true);
  const [previousSubSection,setPreviousSubSection]=useState(subSection);
  if(previousSubSection!==subSection){setPreviousSubSection(subSection);if(subSection==='banner')setShowBannerGrid(true);}
  const previewSource = usePortfolioDesignPreviewSource();
  const backgroundLibrary=usePortfolioBackgroundLibrary();
  const backgroundMode = hero.colorModeOverride === 'light' || hero.colorModeOverride === 'dark' ? hero.colorModeOverride : previewSource?.settings.global.colorMode ?? 'dark';
  const backgroundPalette = previewSource
    ? applyActivePortfolioPalette({ ...previewSource.settings, hero: { ...previewSource.settings.hero, ...hero } }).hero.palette ?? DEFAULT_HERO_PALETTE
    : sectionFamilyPalette(hero.paletteFamily, backgroundMode) ?? hero.palette ?? DEFAULT_HERO_PALETTE;
  const selectedBannerDesign = hero.heroBannerDesign ?? 'swiss-editorial';
  const selectedBannerLabel =
    PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.find((option) => option.value === selectedBannerDesign)?.label ??
    selectedBannerDesign;
  const normalizedTools = Array.from(
    new Set(availableTools.map((item) => item.trim()).filter(Boolean))
  );

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
        <div className="np-stack mb-6">
          <NpToggleRow
            card
            title={t('Show Hero section')}
            checked={hero.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionColorModeControl hideLabel label={t('Color mode')} value={hero.colorModeOverride ?? 'auto'} onChange={colorModeOverride => onChange({ colorModeOverride })} />
<div className="np-dimmable mt-6" data-disabled={hero.enabled ? 'false' : 'true'} aria-disabled={!hero.enabled} inert={!hero.enabled}>
              <NpCollapsibleSection title={t('Availability')}>
                <NpToggleRow title={t('Show availability badge')} checked={hero.showAvailabilityBadge !== false} onChange={(showAvailabilityBadge) => onChange({ showAvailabilityBadge })} />
                <div className="np-field">
                  <span className="np-field-label">{t('Badge style')}</span>
                  <div className="np-availability-style-grid" role="group" aria-label={t('Badge style')}>
                    {([
                      { value: 'default', label: 'Design default' },
                      { value: 'pill-live', label: 'Live pill' },
                      { value: 'pill-minimal', label: 'Minimal' },
                      { value: 'bordered', label: 'Bordered' },
                      { value: 'soft', label: 'Soft' },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="np-availability-style-card"
                        aria-pressed={(hero.availabilityStyleOverride ?? 'default') === option.value}
                        onClick={() => onChange({ availabilityStyleOverride: option.value === 'default' ? undefined : option.value })}
                      >
                        <span className="np-availability-style-stage" data-availability-style={option.value === 'default' ? undefined : option.value} aria-hidden="true" style={{
                          '--hero-status-accent': backgroundPalette.secondaire,
                          '--hero-status-ink': backgroundPalette.texteFort,
                          '--hero-status-surface': backgroundPalette.fond,
                          backgroundColor: backgroundPalette.fond,
                          borderRadius: 6,
                        } as CSSProperties}>
                          <span data-hero-availability className="np-availability-style-sample">{t('Available for work')}</span>
                        </span>
                        <span>{t(option.label)}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="np-field block">
                  <span className="np-field-label">{t('Available label')}</span>
                  <input className="np-input" type="text" maxLength={100} value={hero.availabilityLabel} onChange={(event) => onChange({ availabilityLabel: event.target.value })} />
                </label>
                <label className="np-field block">
                  <span className="np-field-label">{t('Unavailable label')}</span>
                  <input className="np-input" type="text" maxLength={100} value={hero.availabilityUnavailableLabel} onChange={(event) => onChange({ availabilityUnavailableLabel: event.target.value })} />
                </label>
              </NpCollapsibleSection>
              <NpCollapsibleSection title={t('Biography')}>
                <InfoBioToolbar info={hero} onChange={onChange}/>
                <label className="np-field block">
                  <span className="np-field-label">{t('Biography')}</span>
                  <textarea
                    rows={7}
                    maxLength={5000}
                    className="np-input !h-auto min-h-40 resize-y py-3"
                    value={hero.heroBioCustom ?? ''}
                    placeholder={t('Leave empty to use your profile biography.')}
                    onChange={(event) => onChange({ heroBioCustom: event.target.value })}
                  />
                </label>
                {hero.heroBioCustom ? (
                  <button type="button" className="np-link-btn" onClick={() => onChange({ heroBioCustom: '' })}>
                    {t('Use profile biography')}
                  </button>
                ) : null}
              </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection === 'banner' && !hero.enabled && !showBannerGrid ? <HeroHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {catalogueVisited && hero.enabled ? (
            <div className="np-stack" hidden={subSection !== 'banner' || !showBannerGrid}>
              {previewSource ? (
                /* In the studio: every banner rendered for real, one per row. */
                <div className="mt-3 flex flex-col gap-7" aria-label={t('Choose a design')}>
                  {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map((option) => (
                    <PortfolioDesignLivePreviewCard
                      key={option.value}
                      cardClassName="pf-stack-design-card pf-hero-design-card"
                      labelClassName="pf-stack-card-label"
                      showPreviewRing={false}
                      showCurrentBadge={false}
                      autoLoad
                      flush
                      active={selectedBannerDesign === option.value}
                      label={t(option.label)}
                      src={`/portfolio/hero-preview?creator=${encodeURIComponent(previewSource.portfolioPath.split('/').filter(Boolean).pop() ?? '')}&design=${encodeURIComponent(option.value)}`}
                      thumbnail={<HeroBannerDesignPreview design={option.value} />}
                      settings={previewSource.settings}
                      onClick={() => {
                        onChange(heroBannerDesignSettingsPatch(option.value));
                      }}
                      onCustomize={()=>{if(selectedBannerDesign!==option.value)onChange(heroBannerDesignSettingsPatch(option.value));setShowBannerGrid(false);}}
                    />
                  ))}
                </div>
              ) : (
              <div className="mt-3 flex flex-col gap-7" aria-label={t('Choose a design')}>
                {PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.map(option=><DesignCatalogueCard key={option.value} label={t(option.label)} selected={selectedBannerDesign===option.value} onSelect={()=>onChange(heroBannerDesignSettingsPatch(option.value))} onCustomize={()=>{if(selectedBannerDesign!==option.value)onChange(heroBannerDesignSettingsPatch(option.value));setShowBannerGrid(false);}}><HeroBannerDesignPreview design={option.value}/></DesignCatalogueCard>)}
              </div>
              )}
            </div>
      ) : null}
      {subSection === 'banner' && hero.enabled && !showBannerGrid ? (
            <div className="np-stack">
              <NpBackRow title={t(selectedBannerLabel)} onBack={()=>setShowBannerGrid(true)}/>
              {['editorial-rail','statement-cta','portrait-balance','left-portrait','circle-portrait','experience-split','editorial-overlap','studio-split','work-duo'].includes(selectedBannerDesign)?<label className="np-field block"><span className="np-field-label">{t('Greeting')}</span><textarea aria-label={t('Greeting')} className="np-input !h-auto min-h-20 resize-y py-3" rows={3} maxLength={500} value={hero.heroGreetingOverrides?.[selectedBannerDesign]??''} placeholder={t("Hi, I'm {name} — a {specialty}.",{name:'{name}',specialty:'{specialty}'})} onChange={event=>onChange({heroGreetingOverrides:{...hero.heroGreetingOverrides,[selectedBannerDesign]:event.target.value}})}/><span className="np-note">{t('Use {name} and {specialty} for your profile details. Leave empty to keep the original greeting.',{name:'{name}',specialty:'{specialty}'})}</span></label>:null}
                {selectedBannerDesign !== 'colophon' ? <NpToggleRow title={t('Black & white images')} checked={hero.heroImageGrayscale === true} onChange={heroImageGrayscale => onChange({ heroImageGrayscale })} /> : null}

              {HERO_DESIGNS_WITH_OPTIONS.has(selectedBannerDesign) ? (
              <div className="flex flex-col gap-[30px]">
              {selectedBannerDesign === 'statement-overlap' ? (
                <div className="flex flex-col gap-6">
                  <p className="np-note">{t('By default the big words are one word each: your specialty and your first name. Type your own words to replace them; a trailing full stop is drawn in the accent colour.')}</p>
                  {([
                    ['heroStatementStart', 'First half', 'Your specialty', 40],
                    ['heroStatementEnd', 'Second half', 'Your first name', 40],
                    ['heroStatementTagline', 'Tagline', 'Use the start of your bio', 160],
                    ['heroStatementCtaLabel', 'Button label', 'Let’s talk about your project', 48],
                  ] as const).map(([key, label, placeholder, max]) => (
                    <label key={key} className="np-field block">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="np-field-label">{t(label)}</span>
                        <span className="text-xs tabular-nums text-[color:var(--pf-palette-texte-muted)]">{(hero[key] ?? '').length}/{max}</span>
                      </div>
                      <input className="np-input" value={hero[key] ?? ''} maxLength={max} placeholder={t(placeholder)}
                        onChange={event => onChange({ [key]: event.target.value })} />
                    </label>
                  ))}
                  <HeroOptionGrid
                    label={t('Statement font')}
                    options={[{ value: 'serif' as const, label: t('Serif') }, { value: 'body' as const, label: t('Match site font') }]}
                    value={hero.heroStatementFont ?? 'serif'}
                    onChange={heroStatementFont => onChange({ heroStatementFont })}
                  />
                  <NpToggleRow title={t('Scroll cue')} checked={hero.heroStatementShowScroll !== false}
                    onChange={heroStatementShowScroll => onChange({ heroStatementShowScroll })} />
                  <PortfolioSettingsPhotoField label={t('Portrait photo')} photoUrl={hero.heroStatementImageUrl ?? ''}
                    profileAvatarUrl={previewSource?.profileAvatarUrl ?? null}
                    onChange={heroStatementImageUrl => onChange({ heroStatementImageUrl })} />
                </div>
              ) : null}
              {selectedBannerDesign === 'colophon' ? (
                <div className="flex flex-col gap-6">
                  <label className="np-field block">
                    <span className="np-field-label">{t('Display name')}</span>
                    <input className="np-input" value={hero.heroColophonName ?? ''} maxLength={160}
                      placeholder={t('Use profile name')}
                      onChange={event => onChange({ heroColophonName: event.target.value })} />
                  </label>
                  <NpToggleRow title={t('Uppercase name')} checked={hero.heroColophonUppercase === true}
                    onChange={heroColophonUppercase => onChange({ heroColophonUppercase })} />
                  <div className="np-field">
                    <span className="np-field-label">{t('Selected works shown')}</span>
                    <p className="np-note mt-2">{t('Choose up to 4 projects.')}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {availableWorks.map(work => {
                        const picked = (hero.heroColophonSelectedWorkIds ?? availableWorks.slice(0, 4).map(item => item.id)).filter(id => availableWorkIds.has(id));
                        const active = picked.includes(work.id);
                        return <button key={work.id} type="button" aria-pressed={active} disabled={!active && picked.length >= 4}
                          onClick={() => onChange({ heroColophonSelectedWorkIds: active ? picked.filter(id => id !== work.id) : [...picked, work.id] })}
                          className={`min-w-0 rounded-xl border p-3 text-left text-xs leading-relaxed transition disabled:opacity-40 ${active ? 'border-[color:var(--np-label)] ring-1 ring-[color:var(--np-label)]' : 'border-[color:var(--np-card-border)]'}`}>
                          <span className="mb-2 block font-mono text-[color:var(--np-muted)]">{active ? String(picked.indexOf(work.id) + 1).padStart(2, '0') : '+'}</span>
                          <span className="block break-words">{work.title}</span>
                        </button>;
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4">
                      <button type="button" className="np-link-btn" onClick={() => onChange({ heroColophonSelectedWorkIds: [] })}>{t('Show no project')}</button>
                      <button type="button" className="np-link-btn" onClick={() => onChange({ heroColophonSelectedWorkIds: null })}>{t('Reset — first 4 projects')}</button>
                    </div>
                  </div>
                </div>
              ) : null}
              {selectedBannerDesign === 'portrait-identity' ? (
                <HeroToggleRow
                  label={t('Swap bio ↔ name + specialty')}
                  checked={hero.heroBannerSwapBioName === true}
                  onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
                />
              ) : null}
              {selectedBannerDesign === 'editorial-rail' ? (
                <div className="flex flex-col gap-3">
                  <HeroToggleRow
                    label={t('Bio under the portrait')}
                    checked={hero.heroEditorialRailBioUnderPortrait === true}
                    onChange={(heroEditorialRailBioUnderPortrait) => onChange({ heroEditorialRailBioUnderPortrait })}
                  />
                  <HeroToggleRow
                    label={t('Name + specialty under the portrait')}
                    checked={hero.heroEditorialRailIdentityUnderPortrait === true}
                    onChange={(heroEditorialRailIdentityUnderPortrait) => onChange({ heroEditorialRailIdentityUnderPortrait })}
                  />
                  <HeroToggleRow
                    label={t('CTA under the bio')}
                    checked={hero.heroEditorialRailShowCta === true}
                    onChange={(heroEditorialRailShowCta) => onChange({ heroEditorialRailShowCta })}
                  />
                </div>
              ) : null}
              {selectedBannerDesign === 'editorial-rail' ? (
                <div>
                  <HeroToolPicker tools={normalizedTools} limit={4} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
                </div>
              ) : null}
              {HERO_PORTRAIT_SHAPE_DESIGNS.has(selectedBannerDesign) ? (
                <HeroOptionGrid
                  label={t('Portrait shape')}
                  portraitPreview
                  bowlPreview={selectedBannerDesign === 'bowl-intro' ? { shape: hero.heroPortraitShape ?? 'auto', motif: hero.heroBowlIntroMotif ?? 'bowl', kind: 'shape' } : undefined}
                  options={
                    (selectedBannerDesign === 'portrait-identity' || selectedBannerDesign === 'editorial-rail')
                      ? PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS.filter((option) => option.value !== 'auto')
                      : PORTFOLIO_HERO_PORTRAIT_SHAPE_OPTIONS
                  }
                  value={
                    (selectedBannerDesign === 'portrait-identity' || selectedBannerDesign === 'editorial-rail') && (hero.heroPortraitShape ?? 'auto') === 'auto'
                      ? 'rectangle'
                      : hero.heroPortraitShape ?? 'auto'
                  }
                  onChange={(heroPortraitShape) => onChange({ heroPortraitShape })}
                />
              ) : null}

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'swiss-editorial' ? (
                <div className="space-y-6">
                  <HeroToggleRow
                    label={t('Swap bio ↔ name + specialty')}
                    checked={hero.heroBannerSwapBioName === true}
                    onChange={(heroBannerSwapBioName) => onChange({ heroBannerSwapBioName })}
                  />
                </div>
              ) : null}

              {(hero.heroBannerDesign ?? 'swiss-editorial') === 'swiss-editorial' ? (
                  <NpCollapsibleSection title={t('Labels')}>
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
                  </NpCollapsibleSection>
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
                <HeroToolPicker tools={normalizedTools} limit={5} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
              </div>
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'portrait-balance' ? (
            <div className="space-y-4">
              <div>
                <HeroToolPicker tools={normalizedTools} limit={4} value={hero.heroEditorialRailSelectedTools ?? []} onChange={(heroEditorialRailSelectedTools) => onChange({ heroEditorialRailSelectedTools })} />
                <label className="np-field mt-6 block">
                  <span className="np-field-label">{t('Stack label')}</span>
                  <input className="np-input" type="text" maxLength={80} value={hero.toolsLabelText ?? ''} placeholder={t('Core stack')} onChange={(event) => onChange({ toolsLabelText: event.target.value })} />
                </label>
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
              <HeroOptionGrid
                label={t('Button shape')}
                options={[{ value: 'pill', label: t('Pill') }, { value: 'rectangle', label: t('Rectangle') }]}
                value={hero.heroCirclePortraitButtonShape ?? 'pill'}
                onChange={(heroCirclePortraitButtonShape) => onChange({ heroCirclePortraitButtonShape })}
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
              <HeroOptionGrid
                label={t('Button shape')}
                options={[{ value: 'pill', label: t('Pill') }, { value: 'rectangle', label: t('Rectangle') }]}
                value={hero.heroExperienceSplitButtonShape ?? 'pill'}
                onChange={(heroExperienceSplitButtonShape) => onChange({ heroExperienceSplitButtonShape })}
              />
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
            </div>
          ) : null}

          {(hero.heroBannerDesign ?? 'swiss-editorial') === 'selected-works' ? (
            <div className="space-y-5">
              <HeroOptionGrid
                label={t('Identity layout')}
                options={PORTFOLIO_HERO_SELECTED_WORKS_IDENTITY_LAYOUT_OPTIONS}
                value={hero.heroSelectedWorksIdentityLayout ?? 'split'}
                onChange={(heroSelectedWorksIdentityLayout) =>
                  onChange({ heroSelectedWorksIdentityLayout })
                }
              />
              <div className="np-field pt-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="np-field-label">{t('Selected works shown')}</span>
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">
                    {selectedWorksIds.length} / 4
                  </span>
                </div>
                <p className="mt-2 max-w-[34rem] text-xs leading-[1.65] text-[color:var(--np-muted)]">
                  {t('Choose up to 4 projects. The composition adapts to every selection size, including none.')}
                </p>
                {availableWorks.length > 0 ? (
                  <>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {availableWorks.map((work) => {
                        const current = selectedWorksIds;
                        const active = current.includes(work.id);
                        const disabled = !active && current.length >= 4;
                        return (
                          <button
                            key={work.id}
                            type="button"
                            disabled={disabled}
                            aria-pressed={active}
                            onClick={() => {
                              const next = active
                                ? current.filter((id) => id !== work.id)
                                : [...current, work.id];
                              onChange({ heroSelectedWorksSelectedWorkIds: next });
                            }}
                            className={`min-w-0 overflow-hidden rounded-xl border bg-[color:var(--np-card)] text-left transition ${
                              active
                                ? 'border-[color:var(--np-label)] ring-2 ring-[color:var(--np-label)]'
                                : 'border-[color:var(--np-card-border)] hover:border-[color:var(--np-muted)]'
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            <span className="relative block aspect-[4/3] w-full bg-[color:var(--np-well)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={work.imageUrl} alt="" className="h-full w-full object-cover" />
                              {active ? (
                                <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black text-[0.65rem] font-bold text-white">
                                  {current.indexOf(work.id) + 1}
                                </span>
                              ) : null}
                            </span>
                            <span className="block truncate px-3 py-2.5 text-xs font-medium text-[color:var(--np-text)]">
                              {work.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[color:var(--np-card-border)] pt-3">
                      {(hero.heroSelectedWorksSelectedWorkIds ?? []).length > 0 || hero.heroSelectedWorksSelectedWorkIds === null ? (
                        <button
                          type="button"
                          onClick={() => onChange({ heroSelectedWorksSelectedWorkIds: [] })}
                          className="np-link-btn"
                        >
                          {t('Show no project')}
                        </button>
                      ) : null}
                      {hero.heroSelectedWorksSelectedWorkIds !== null ? (
                        <button
                          type="button"
                          onClick={() => onChange({ heroSelectedWorksSelectedWorkIds: null })}
                          className="np-link-btn"
                        >
                          {t('Reset — first 4 projects')}
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-xs text-[color:var(--np-muted)]">{t('No project with an image is available yet.')}</p>
                )}
              </div>
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
              <NpToggleRow title={t('Show availability')} checked={hero.showAvailabilityBadge!==false} onChange={showAvailabilityBadge=>onChange({showAvailabilityBadge})}/>
              {([
                ['heroIdentityIndexSpecialtyLabel','Specialty'],
                ['heroIdentityIndexAvailabilityLabel','Availability'],
                ['heroIdentityIndexExperienceLabel','Years of experience'],
                ['availabilityLabel','Available label'],
                ['availabilityUnavailableLabel','Unavailable label'],
              ] as const).map(([field,label])=><label key={field} className="np-field block"><span className="np-field-label">{t(label)}</span><input className="np-input" maxLength={120} value={hero[field]??''} placeholder={t(label)} onChange={event=>onChange({[field]:event.target.value})}/></label>)}
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
            <div className="flex flex-col gap-7">
              <div className="-my-2">
                <ColorSwatchRow
                  label={t('Accent')}
                  options={[
                    { value: '', label: t('Palette'), color: backgroundPalette.principal, auto: true },
                    { value: '#E51B23', label: t('Red'), color: '#E51B23' },
                    { value: '#4338CA', label: t('Indigo'), color: '#4338CA' },
                    { value: '#087A5B', label: t('Verdant'), color: '#087A5B' },
                    { value: '#B45309', label: t('Saffron'), color: '#B45309' },
                    { value: '#334155', label: t('Slate'), color: '#334155' },
                  ]}
                  value={hero.heroStudioSplitAccentColor ?? ''}
                  onChange={(heroStudioSplitAccentColor) => onChange({ heroStudioSplitAccentColor })}
                />
                <NpRangeField
                  label={t('Opacity')}
                  value={hero.heroStudioSplitAccentOpacity ?? 100}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(heroStudioSplitAccentOpacity) => onChange({ heroStudioSplitAccentOpacity })}
                />
              </div>
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
              <StudioFrameFormatPicker
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
                <div className="flex items-center justify-between gap-3">
                  <span className="np-field-label !mb-0">{t('Selected works shown')}</span>
                  <span className="np-value-badge shrink-0">{selectedWorkDuoIds.length} / 2</span>
                </div>
                {availableWorks.length > 0 ? (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {availableWorks.map((work) => {
                        const picked = selectedWorkDuoIds;
                        const active = picked.includes(work.id);
                        const disabled = !active && picked.length >= 2;
                        return (
                          <button
                            key={work.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const current = [...selectedWorkDuoIds];
                              const next = current.includes(work.id)
                                ? current.filter((id) => id !== work.id)
                                : current.length >= 2
                                  ? current
                                  : [...current, work.id];
                              onChange({ heroWorkDuoSelectedWorkIds: next });
                            }}
                            className={`overflow-hidden rounded-xl border bg-[color:var(--np-card)] text-left transition ${
                              active
                                ? 'border-[color:var(--np-label)] ring-2 ring-[color:var(--np-label)]'
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
                    {selectedWorkDuoIds.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => onChange({ heroWorkDuoSelectedWorkIds: [] })}
                        className="np-link-btn mt-3"
                      >
                        {t('Clear selection')}
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
                bowlPreview={{ shape: hero.heroPortraitShape ?? 'auto', motif: hero.heroBowlIntroMotif ?? 'bowl', kind: 'motif' }}
                options={PORTFOLIO_HERO_BOWL_INTRO_MOTIF_OPTIONS}
                value={hero.heroBowlIntroMotif ?? 'bowl'}
                onChange={(heroBowlIntroMotif) => onChange({ heroBowlIntroMotif })}
              />
              <HeroOptionGrid
                label={t('Button shape')}
                options={[{ value: 'pill', label: t('Pill') }, { value: 'rectangle', label: t('Rectangle') }]}
                value={hero.heroBowlIntroButtonShape ?? 'rectangle'}
                onChange={(heroBowlIntroButtonShape) => onChange({ heroBowlIntroButtonShape })}
              />
            </div>
          ) : null}

              </div>
              ) : null}
            </div>
      ) : null}

      {subSection === 'background' && !hero.enabled ? <HeroHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'background' && hero.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl value={hero.paletteFamily??'global'} onChange={paletteFamily=>onChange({paletteFamily})} mode={backgroundMode}/>
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
            <div className="grid grid-cols-2 gap-3" aria-label={t('Background styles')}>
              {(['none', 'mesh', 'particles', 'particle-ribbon', 'layered-waves', 'arc', 'silk-arc', 'eclipse-arc'] as const).map(art => (
                <button key={art} type="button" aria-pressed={(hero.heroSectionBackgroundArt ?? 'none') === art}
                  onClick={() => onChange({ heroSectionBackgroundArt: art, ...(art !== 'none' ? { heroSectionBackgroundEnabled: true } : {}) })}
                  className="overflow-hidden rounded-lg border p-1.5 text-left"
                  style={{ borderColor: (hero.heroSectionBackgroundArt ?? 'none') === art ? 'var(--np-accent)' : 'var(--np-card-border)' }}>
                  <span className="relative block aspect-[16/9] overflow-hidden rounded-md" style={{ backgroundColor: backgroundPalette.fond }}>
                    {art !== 'none' ? <PortfolioHeroAdaptiveBackground art={art} palette={backgroundPalette} thumbnail /> : null}
                  </span>
                  <span className="block px-1 py-2 text-xs font-medium">{t(art === 'none' ? 'Custom' : art === 'mesh' ? 'Soft mesh' : art === 'particles' ? 'Particle wave' : art === 'particle-ribbon' ? 'Particle ribbon' : art === 'layered-waves' ? 'Layered waves' : art === 'silk-arc' ? 'Silk arc' : art === 'eclipse-arc' ? 'Eclipse arc' : 'Luminous arc')}</span>
                </button>
              ))}
            </div>
            {hero.heroSectionBackgroundArt && hero.heroSectionBackgroundArt !== 'none' ? <>
              <NpToggleRow title={t('Background')} checked={hero.heroSectionBackgroundEnabled !== false} onChange={enabled => onChange({ heroSectionBackgroundEnabled: enabled })} />
              <NpRangeField label={t('Opacity')} value={hero.heroSectionBackgroundOpacity ?? 100} min={0} max={100} onChange={value => onChange({ heroSectionBackgroundOpacity: value })} />
            </> : <SectionBackgroundSettingsFields settings={heroSectionBackgroundFields(hero)} onChange={patch=>onChange(patchHeroSectionBackground(hero,patch))} renderColorField={({label})=>{
              const slot:HeroColorSlot=label===t('Gradient start')?'sectionGradientFrom':label===t('Gradient end')?'sectionGradientTo':label===t('Color A')?'sectionSplitA':label===t('Color B')?'sectionSplitB':'sectionBackground';
              return <ColorSwatchRow label={label} options={[{value:'fond',label:t('Background')},{value:'neutre',label:t('Surface')},{value:'principal',label:t('Primary')},{value:'secondaire',label:t('Secondary')},{value:'texteFort',label:t('Strong text')}].map(option=>({...option,color:backgroundPalette[option.value as HeroPaletteTokenId]}))} value={hero.colorBindings?.[slot]??DEFAULT_HERO_COLOR_BINDINGS[slot]} onChange={token=>onChange({heroBackgroundPaletteBindings:true,colorBindings:{...DEFAULT_HERO_COLOR_BINDINGS,...hero.colorBindings,[slot]:token as HeroPaletteTokenId}})}/>;
            }}/>}
          </NpCollapsibleSection>
        </div>
      ) : null}

    </NpPanelShell>
  );
}
