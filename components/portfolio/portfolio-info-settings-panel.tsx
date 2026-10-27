'use client';
import { InfoDesignControls } from './portfolio-info-design-controls';







import { InfoBioStyle } from './portfolio-info-bio-style';
import { InfoBioColor } from './portfolio-info-bio-color';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import { InfoClassicIllustration } from './portfolio-info-classic-illustration';
import { InfoTraitIllustration } from './portfolio-info-trait-illustration';
import { InfoSplitIllustration } from './portfolio-info-split-illustration';
import { InfoBannerIllustration } from './portfolio-info-banner-illustration';
import { InfoPlatformIllustration } from './portfolio-info-platform-illustration';
import { InfoRemainingIllustration } from './portfolio-info-remaining-illustration';
import { InfoHeaderSkeleton } from './portfolio-info-header-skeleton';
import { StackPreviewSkeleton } from './portfolio-stack-preview-skeleton';
import { resolveThumbnailTheme, useThumbnailTheme } from './portfolio-thumbnail-theme';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { countInfoBioWords, INFO_BIO_WORD_LIMIT, limitInfoBio } from './portfolio-info-bio';
import { InfoBioToolbar } from './portfolio-info-bio-toolbar';

import { infoDesignSettingsPatch, portfolioInfoDesignContent, portfolioInfoDesignHasPortrait, resolveInfoPortrait, DEFAULT_INFO_PRESENTATION, PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS, PORTFOLIO_INFO_DESIGN_OPTIONS, PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS, INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS, INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS, INFO_HEADER_PALETTE_TOKEN_OPTIONS, infoHeaderPaletteTokenColor, INFO_DESIGNS_WITH_BLOCK_LABEL_COLOR, INFO_BLOCK_LABEL_MAX_LENGTH, type PortfolioInfoBlockLabelKey, PORTFOLIO_INFO_BLOCK_LABEL_COLOR_OPTIONS, type PortfolioInfoDesign, type PortfolioInfoHeaderDesign, type PortfolioInfoSectionSettings } from '@/components/portfolio/portfolio-info-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import {
  DEFAULT_HERO_PALETTE,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import {
  HeaderBlock,
  HeaderColorRow,
  HeaderStyleTargetsEditor,
  HeaderTextField,
} from '@/components/portfolio/portfolio-header-style-controls';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { PortfolioSettingsPhotoField } from '@/components/portfolio/portfolio-settings-photo-field';
import { NpBackRow, NpCollapsibleSection, NpPanelShell, NpToggleRow, type NpPanelChrome } from '@/components/portfolio/portfolio-nav-panel-ui';

/** Same general / design / header / background pill-switcher mechanism as the Stack section settings panel.
 *  Header is one shared, GSAP-animated header (copied from the Portfolio/Work section's Header mechanism)
 *  mounted above the section, independent of Design's per-design layout. */
export type InfoSubSection = 'general' | 'design' | 'header' | 'background';

const INFO_SUB_SECTIONS: { id: InfoSubSection; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
  { id: 'header', label: msg('Header') },
  { id: 'background', label: msg('Background') },
];

function normalizeInfoSubSection(value: string | undefined): InfoSubSection {
  return INFO_SUB_SECTIONS.some((item) => item.id === value)
    ? (value as InfoSubSection)
    : 'general';
}




/** Same curated 4-token swatch set as the Stack section's background color pickers
 *  (STACK_BACKGROUND_PALETTE_TOKENS) — no free-form hex anywhere in Info: every color comes
 *  from the portfolio's own Hero palette, picked as a swatch. */
const INFO_PALETTE_SWATCH_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
];

function InfoPaletteSwatchPicker({
  label,
  palette,
  value,
  tokens = INFO_PALETTE_SWATCH_TOKENS,
  onChange,
}: {
  label: string;
  palette: PortfolioHeroPalette;
  value: string;
  tokens?: { value: HeroPaletteTokenId; label: string }[];
  onChange: (hex: string) => void;
}) {
    const activeHex = value.trim().toLowerCase();
  const options = tokens.map((token) => {
    const hex = resolveHeroPaletteColor(palette, token.value);
    return { value: hex, label: token.label, color: hex };
  });
  const current = options.find((option) => option.value.toLowerCase() === activeHex)?.value ?? '';
  return <ColorSwatchRow label={label} options={options} value={current} onChange={onChange} />;
}

/** Small keyboard-accessible "i" tooltip — shows non-obvious info on hover or focus
 *  instead of a permanent line of text under a toggle. Same mechanism as Stack/Contact. */


/** Same minimal segmented-pill control as the Stack section settings panel's sub-choice pickers
 *  (StackOptionGrid) — text (+ optional icon) pills, no wireframe. The wireframe/picker-card
 *  mechanism above is reserved for the top-level Design picker only. */


/** One mini-wireframe per PortfolioInfoDesign — same StackDesignWireframe mechanism, tuned to each
 *  About layout's actual anatomy so the picker card reads as a preview, not a generic placeholder. */
function InfoDesignWireframe({ design }: { design: PortfolioInfoDesign }) {
  let illustration: ReactNode;
  switch (design) {
    case 'about-me': illustration = <InfoClassicIllustration />; break;
    case 'about-me-trait': illustration = <InfoTraitIllustration />; break;
    case 'about-split': illustration = <InfoSplitIllustration />; break;
    case 'about-banner': illustration = <InfoBannerIllustration />; break;
    case 'about-platform': illustration = <InfoPlatformIllustration />; break;
    default: illustration = <InfoRemainingIllustration design={design} />; break;
  }
  return <span className="block aspect-[8/5] w-full overflow-hidden rounded-lg">{illustration}</span>;
}

/** Collapsed-state row shared by every design/header choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens the
 *  grid. The thumbnail wraps whatever wireframe is passed (sized for a full-width card) in a
 *  fixed 128×80 box and scales it down, instead of the old wide preview box that left a lot of
 *  empty space on both sides of the much narrower mini-schema it centered. */


function InfoDesignChoiceGrid({value:rawValue,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioInfoDesign;onChange:(value:PortfolioInfoDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 // "About · index" is now the Index layout of "About me": it shows up as that card.
 const value=rawValue==='about-index'?'about-me':rawValue;
 const selected=PORTFOLIO_INFO_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_INFO_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-7" aria-label={t('Choose a design')}>{PORTFOLIO_INFO_DESIGN_OPTIONS.map(option=><DesignCatalogueCard key={option.value} label={t(option.label)} selected={value===option.value} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}><InfoDesignWireframe design={option.value}/></DesignCatalogueCard>)}</div>;
}


/** Header catalogue shares Stack's neutral loading treatment and readable preview sizing. */
function InfoHeaderDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioInfoHeaderDesign;onChange:(value:PortfolioInfoHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('info');
 const selected=PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>{PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.map(option=>{
  if(option.value==='none')return <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)} className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>{t(option.label)}</button>;
  const skeleton = <StackPreviewSkeleton section="info"><InfoHeaderSkeleton design={option.value} compact/></StackPreviewSkeleton>;
  return <PortfolioHeaderDesignOption key={option.value} design={option.value}><DesignCatalogueCard label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}>
    <span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>
      {previewSource ? <PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'infoHeader',design:option.value})+'&previewRevision=info-header-compact-v6'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}/> : skeleton}
    </span>
  </DesignCatalogueCard></PortfolioHeaderDesignOption>;
 })}</div>;
}


function InfoLayoutSettingsBand({
  children,
  motionKey,
  title,
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  const t = useT();
  return (
    <NpCollapsibleSection title={title ?? t('Design settings')}>
      <div key={motionKey} className="np-stack">
        {children}
      </div>
    </NpCollapsibleSection>
  );
}


/** Info's two own header designs (chapter, cover) — same layout as the shared ones. */
function infoExtraHeaderDesign(
  design: string,
  info: PortfolioInfoSectionSettings,
  onPatch: (patch: HeaderPatch) => void,
  shared: (opts?: { hideAlignment?: boolean; hideTitleControls?: boolean }) => ReactNode,
  toggles: ReactNode
): ReactNode {
  const colorProps = { colorOptions: INFO_HEADER_PALETTE_TOKEN_OPTIONS, resolveColor: infoHeaderPaletteTokenColor };
  if (design === 'chapter') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label="Index"
            value={info.headerChapterIndexText}
            placeholder="02 /"
            onChange={(headerChapterIndexText) => onPatch({ headerChapterIndexText })}
          />
          <HeaderTextField
            label="Title"
            value={info.headerChapterTitleText}
            placeholder="Expertise & Mindset"
            onChange={(headerChapterTitleText) => onPatch({ headerChapterTitleText })}
          />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={info}
            onPatch={onPatch}
            initialId="title"
            targets={[
              { id: 'index', label: 'Index', color: { key: 'headerChapterIndexColor', fallback: 'principal' } },
              {
                id: 'title',
                label: 'Title',
                color: { key: 'headerChapterTitleColor', fallback: 'texteFort' },
                size: { key: 'headerChapterTitleSize', fallback: 'md' },
                weight: { key: 'headerChapterTitleWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideTitleControls: true })}
      </>
    );
  }
  if (design === 'cover') {
    return (
      <>
        <div className="space-y-6">
          <HeaderTextField
            label="Line 1"
            value={info.headerCoverLine1Text}
            placeholder="Built To Ship"
            onChange={(headerCoverLine1Text) => onPatch({ headerCoverLine1Text })}
          />
          <HeaderTextField
            label="Line 2"
            value={info.headerCoverLine2Text}
            placeholder="Designed To"
            onChange={(headerCoverLine2Text) => onPatch({ headerCoverLine2Text })}
          />
          <HeaderTextField
            label="Line 3"
            value={info.headerCoverLine3Text}
            placeholder="Scale"
            onChange={(headerCoverLine3Text) => onPatch({ headerCoverLine3Text })}
          />
        </div>
        {toggles}
        <HeaderBlock>
          <HeaderStyleTargetsEditor
            settings={info}
            onPatch={onPatch}
            title="Headline style"
            targets={[
              {
                id: 'headline',
                label: 'Headline',
                color: { key: 'headerCoverHeadlineColor', fallback: 'texteFort' },
                size: { key: 'headerCoverHeadlineSize', fallback: 'md' },
                weight: { key: 'headerCoverHeadlineWeight', fallback: 'regular' },
              },
            ]}
            {...colorProps}
          />
        </HeaderBlock>
        {shared({ hideAlignment: true, hideTitleControls: true })}
      </>
    );
  }
  return null;
}

const INFO_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Info'), title: msg('About me'), subtitle: msg('Background, education, and how I work.') },
  index: { rule: 'Index', title: msg('About me'), subtitle: msg('Background, education, and how I work.'), count: 'Highlights' },
  marquee: ['About', 'Optional', 'Optional', 'Optional'],
  accent: { badge: '{count}+ highlights', lead: 'A few things worth knowing about me.' },
  serif: { label: msg('Info'), title: msg('A closer look at who I am and how I work.'), subtitle: msg('Background, education, and how I work.') },
  billboard: { word: 'INFO', title: msg('About me'), count: '{count} things worth knowing' },
  masthead: ['Get to know me.', 'A bit of my story.', 'Background, skills, and how I work.'],
  split: { title: msg('About me'), label: msg('Info') },
};

/** The Header tab body: this design's texts, one style editor, then the controls every design shares. */
function InfoHeaderDesignFields({
  info,
  onChange,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
}) {
  const onPatch = (patch: HeaderPatch) => onChange(patch as Partial<PortfolioInfoSectionSettings>);
  return (
    <HeaderDesignFields
      settings={info}
      onPatch={onPatch}
      copy={INFO_HEADER_COPY}
      colorOptions={INFO_HEADER_PALETTE_TOKEN_OPTIONS}
      resolveColor={infoHeaderPaletteTokenColor}
      accentAlignmentOptions={INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
      billboardStyleOptions={INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
      extra={(design, shared, toggles) => infoExtraHeaderDesign(design, info, onPatch, shared, toggles)}
    />
  );
}

const DEFAULT_INFO_SECTION_SETTINGS: PortfolioInfoSectionSettings = {
  enabled: true,
  title: 'About me',
  subtitle: 'Background, education and how I work.',
  ...DEFAULT_INFO_PRESENTATION,
};

function infoSettingsModified(info: PortfolioInfoSectionSettings) {
  const keys = Object.keys({ ...DEFAULT_INFO_SECTION_SETTINGS, ...info }) as (
    keyof PortfolioInfoSectionSettings
  )[];
  return keys.some((key) => {
    const current = info[key] === undefined ? DEFAULT_INFO_SECTION_SETTINGS[key] : info[key];
    return JSON.stringify(current) !== JSON.stringify(DEFAULT_INFO_SECTION_SETTINGS[key]);
  });
}

function InfoHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !items-stretch gap-4">
      <div>
        <p className="np-card-title">{t('Info section is hidden')}</p>
        <p className="np-subtle mt-1">{t('Enable it to edit this tab and show it in the portfolio.')}</p>
      </div>
      <button type="button" className="np-primary-btn" onClick={onEnable}>
        {t('Show Info section')}
      </button>
    </div>
  );
}

export function InfoSettingsPanel({
  info,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  heroPalette,
  chrome,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
  subSection?: InfoSubSection;
  onSubSectionChange?: (value: InfoSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [uncontrolled, setUncontrolled] = useState<InfoSubSection>('general');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const subSection = normalizeInfoSubSection(controlledSubSection ?? uncontrolled);
  const [previousSubSection,setPreviousSubSection]=useState(subSection);
  if(previousSubSection!==subSection){setPreviousSubSection(subSection);if(subSection==='design')setDesignCatalogOpen(true);if(subSection==='header')setHeaderCatalogOpen(true);}
  const design = info.design ?? 'about-me';
  const designContent = portfolioInfoDesignContent(design);
  const setSubSection = (value: InfoSubSection) => {
    const next = normalizeInfoSubSection(value);
    if(next==='design')setDesignCatalogOpen(true);
    if(next==='header')setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection == null) setUncontrolled(next);
  };
  const modified = infoSettingsModified(info);
  const previewSource = usePortfolioDesignPreviewSource();
  const labelPalette = previewSource
    ? resolveThumbnailTheme(previewSource.settings.global, info).palette
    : heroPalette ?? DEFAULT_HERO_PALETTE;

  return (
    <NpPanelShell
      title={t('Info')}
      modified={modified}
      tabs={INFO_SUB_SECTIONS.map((item) => ({ ...item, label: t(item.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange({ ...DEFAULT_INFO_SECTION_SETTINGS })}
      chrome={chrome}
    >

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show Info section')}
            description={info.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={info.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div className="pb-6"><SectionColorModeControl hideLabel
                label={t('Color mode')}
                value={info.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              /></div>
          <div
            className="np-dimmable"
            data-disabled={info.enabled ? 'false' : 'true'}
            aria-disabled={!info.enabled}
            inert={!info.enabled}
          >
              {/* Section-wide, shared by every design — so they live with the other section switches. */}
              <NpCollapsibleSection title={t('Style')}>
              
              <TextSizeSlider label={t('Text size')} options={PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS} value={info.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
              {INFO_DESIGNS_WITH_BLOCK_LABEL_COLOR.includes(design) ? (
                <HeaderColorRow
                  label={t('Block label color')}
                  value={info.blockLabelColor ?? 'muted'}
                  options={PORTFOLIO_INFO_BLOCK_LABEL_COLOR_OPTIONS.map((option) => ({
                    ...option,
                    label: t(option.label),
                  }))}
                  resolveColor={token => token === 'muted'
                    ? `color-mix(in srgb, ${labelPalette.texteFort} 62%, ${labelPalette.fond})`
                    : labelPalette[token]}
                  onChange={(blockLabelColor) => onChange({ blockLabelColor })}
                />
              ) : null}
              {INFO_DESIGNS_WITH_BLOCK_LABEL_COLOR.includes(design) ? (
                <TextSizeSlider label={t('Block label size')} options={PORTFOLIO_INFO_PREMIUM_FONT_SIZE_OPTIONS} value={info.blockLabelSize ?? 'medium'} onChange={(blockLabelSize) => onChange({ blockLabelSize })} />
              ) : null}
              </NpCollapsibleSection>
              {/* Each design draws its own set of blocks: only the switches it honours are offered. */}
<NpCollapsibleSection title={t('Content shown')}>
                <NpToggleRow
                  title={t('Education')}
                  checked={
                    design === 'about-value-steps' || design === 'about-manifesto'
                      ? info.showEducation === true
                      : info.showEducation !== false
                  }
                  onChange={(showEducation) => onChange({ showEducation })}
                />
                {design === 'about-portrait-skills' ? (
                  <NpToggleRow
                    title={t('Interests + languages')}
                    checked={info.aboutPortraitSkillsMetaEnabled !== false}
                    onChange={(aboutPortraitSkillsMetaEnabled) =>
                      onChange({ aboutPortraitSkillsMetaEnabled })
                    }
                  />
                ) : designContent.interests ? (
                  <NpToggleRow
                    title={t('Interests')}
                    checked={info.showInterests !== false}
                    onChange={(showInterests) => onChange({ showInterests })}
                  />
                ) : null}
                <NpToggleRow
                  title={t('Skills')}
                  checked={info.showSkills !== false}
                  onChange={(showSkills) => onChange({ showSkills })}
                />
                <NpToggleRow
                  title={t('Strengths')}
                  checked={info.showStrengths !== false}
                  onChange={(showStrengths) => onChange({ showStrengths })}
                />
                {designContent.languages && design !== 'about-portrait-skills' ? (
                  <NpToggleRow
                    title={t('Languages')}
                    checked={
                      design === 'about-value-steps'
                        ? info.showLanguages === true
                        : info.showLanguages !== false
                    }
                    onChange={(showLanguages) => onChange({ showLanguages })}
                  />
                ) : null}
                {designContent.systemsTools ? (
                  <NpToggleRow
                    title={t('Systems & tools')}
                    checked={
                      design === 'about-value-steps'
                        ? info.showSystemsTools === true
                        : info.showSystemsTools !== false
                    }
                    onChange={(showSystemsTools) => onChange({ showSystemsTools })}
                  />
                ) : null}
              </NpCollapsibleSection>
              {portfolioInfoDesignHasPortrait(design) ? (
                <NpCollapsibleSection title={t('Portrait')}>
                  {/* Shared by every design that draws a portrait; off, the design recomposes without it. */}
                  <NpToggleRow
                    title={t('Show portrait')}
                    checked={resolveInfoPortrait(info, previewSource?.profileAvatarUrl).show}
                    onChange={(infoShowPortrait) => onChange({ infoShowPortrait })}
                  />
                  {resolveInfoPortrait(info, previewSource?.profileAvatarUrl).show ? (
                    <PortfolioSettingsPhotoField
                      label={t('Portrait photo')}
                      photoUrl={info.infoPortraitUrl ?? ''}
                      profileAvatarUrl={previewSource?.profileAvatarUrl ?? null}
                      onChange={(infoPortraitUrl) => onChange({ infoPortraitUrl })}
                    />
                  ) : null}
                </NpCollapsibleSection>
              ) : null}
              <NpCollapsibleSection title={t('Block labels')} defaultOpen={false}>
                <p className="np-note">{t('Rename the block titles. Leave a field empty to keep the default name; it applies to every design.')}</p>
                {([
                  ['education', 'Education', true],
                  ['skills', 'Skills', true],
                  ['strengths', 'Strengths', true],
                  ['languages', 'Languages', designContent.languages && design !== 'about-portrait-skills'],
                  ['interests', 'Interests', designContent.interests && design !== 'about-portrait-skills'],
                  ['tools', 'Systems & tools', designContent.systemsTools],
                ] as [PortfolioInfoBlockLabelKey, string, boolean][])
                  .filter(([, , shown]) => shown)
                  .map(([key, defaultName]) => {
                    const value = info.blockLabels?.[key] ?? '';
                    return (
                      <div key={key} className="np-field">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="np-field-label !mb-1">{t(defaultName)}</p>
                          <span className="text-xs tabular-nums text-[color:var(--pf-palette-texte-muted)]">
                            {value.length}/{INFO_BLOCK_LABEL_MAX_LENGTH}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={value}
                          maxLength={INFO_BLOCK_LABEL_MAX_LENGTH}
                          placeholder={t(defaultName)}
                          aria-label={`${t(defaultName)} — ${t('Block labels')}`}
                          onChange={(event) => {
                            const next = { ...(info.blockLabels ?? {}) };
                            if (event.target.value.trim()) next[key] = event.target.value;
                            else delete next[key];
                            onChange({ blockLabels: next });
                          }}
                          className="np-input"
                        />
                      </div>
                    );
                  })}
              </NpCollapsibleSection>
              <NpCollapsibleSection title={t('Biography')}>
                <label className="np-field block">
                  <span className="np-field-label">{t('Biography')}</span>
                  <textarea rows={5} className="np-input min-h-32 resize-y"
                    value={info.bioCustom ?? ''}
                    onChange={event => onChange({ bioCustom: limitInfoBio(event.target.value) })}
                    placeholder={t('Leave empty to use your profile biography.')}
                    aria-describedby="info-bio-word-count" />
                  <span id="info-bio-word-count" className="np-subtle mt-2 block text-right" aria-live="polite">
                    {countInfoBioWords(info.bioCustom ?? '')} / {INFO_BIO_WORD_LIMIT} {t('words')}
                  </span>
                </label>
                <InfoBioStyle info={info} onChange={onChange}/>
                <InfoBioToolbar info={info} onChange={onChange} />
                <InfoBioColor info={info} onChange={onChange} />
              </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection !== 'general' && !info.enabled ? <InfoHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'design' && info.enabled ? (
        designCatalogOpen ? (
          <InfoDesignChoiceGrid
            value={info.design ?? 'about-me'}
            onChange={(design) => onChange(design==='about-me'&&info.design==='about-index'?{}:infoDesignSettingsPatch(design))}
            open
            onOpenChange={setDesignCatalogOpen}
          />
        ) : (
        <div className="np-stack">
            <InfoDesignChoiceGrid
              value={info.design ?? 'about-me'}
              onChange={(design) => onChange(design==='about-me'&&info.design==='about-index'?{}:infoDesignSettingsPatch(design))}
              open={false}
              onOpenChange={setDesignCatalogOpen}
            />

          <InfoDesignControls info={info} onChange={onChange}/>
        </div>
        )
      ) : null}

      {subSection === 'header' && info.enabled ? (
        headerCatalogOpen ? (
          <InfoHeaderDesignChoiceGrid
            value={info.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open
            onOpenChange={setHeaderCatalogOpen}
          />
        ) : (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Header design')}>
            <InfoHeaderDesignChoiceGrid
              value={info.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
              open={false}
              onOpenChange={setHeaderCatalogOpen}
            />
          </NpCollapsibleSection>
            {info.headerDesign === 'none' ? null : <InfoLayoutSettingsBand motionKey={info.headerDesign ?? 'editorial'} title={t('Header settings')}>
              <InfoHeaderDesignFields info={info} onChange={onChange} />
            </InfoLayoutSettingsBand>}
        </div>
        )
      ) : null}

      {subSection === 'background' && info.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={info.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={info.colorModeOverride === 'light' ? 'light' : 'dark'}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={info}
            onChange={(patch) => onChange(patch)}
            title={t('Info section background')}
            renderColorField={({ label, value, onChange: onColorChange }) => (
              <InfoPaletteSwatchPicker
                label={label}
                palette={heroPalette ?? DEFAULT_HERO_PALETTE}
                value={value}
                onChange={onColorChange}
              />
            )}
          />
          </NpCollapsibleSection>
        </div>
      ) : null}
    </NpPanelShell>
  );
}
