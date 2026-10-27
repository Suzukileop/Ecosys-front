'use client';
import { LayoutControlGroups } from './portfolio-tools-control-groups';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import { AboutUsDesignIllustration } from './portfolio-about-us-design-illustration';
import { SectionBackgroundSettingsFields } from './portfolio-section-background-controls';
import { usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { resolveThumbnailTheme } from './portfolio-thumbnail-theme';
import { ColorSwatchRow } from './portfolio-color-swatch-row';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useState } from 'react';
import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  AboutUsQuoteSvg,
  DEFAULT_ABOUT_US_QUOTE_SVG_URLS,
  PORTFOLIO_ABOUT_US_QUOTE_SVG_OPTIONS,
  quoteSvgSlotIndex,
  type AboutUsQuoteSvgId,
} from '@/components/portfolio/about-us-quote-svgs';
import {
  aboutUsDesignUsesSplitChrome,
  defaultsForAboutUsDesign,
  DEFAULT_ABOUT_US_PRESENTATION,
  isAboutUsSplitVariant,
  PORTFOLIO_ABOUT_US_CARD_SHADOW_OPTIONS,
  PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS,
  PORTFOLIO_ABOUT_US_DESIGN_CATALOG,
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS,
  PORTFOLIO_ABOUT_US_IMAGE_FRAME_OPTIONS,
  PORTFOLIO_ABOUT_US_MEDIA_SIDE_OPTIONS,
  PORTFOLIO_ABOUT_US_QUOTE_MEDIA_OPTIONS,
  PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS,
  PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS,
  ABOUT_US_EDITORIAL_TITLE_AUTO_PX,
  ABOUT_US_EDITORIAL_TITLE_PX_MAX,
  ABOUT_US_EDITORIAL_TITLE_PX_MIN,
  resolveAboutUsCtaStyle,
  resolveAboutUsMediaSide,
  type PortfolioAboutUsCardShadow,
  type PortfolioAboutUsContentPlacement,
  type PortfolioAboutUsCtaStyle,
  type PortfolioAboutUsDesign,
  type PortfolioAboutUsImageFrame,
  type PortfolioAboutUsMediaSide,
  type PortfolioAboutUsQuoteMedia,
  type PortfolioAboutUsSectionLayout,
  type PortfolioAboutUsSectionSettings,
} from '@/components/portfolio/portfolio-about-us-settings';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpOptionCard,
  NpOptionCardGroup,
  NpPanelShell,
    NpRangeField,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';

/** A few strokes per style, drawn with currentColor so the picker card stays on-palette. */
function AboutUsCtaStyleIllustration({ style }: { style: PortfolioAboutUsCtaStyle }) {
  const arrow = <path d="M4 7h8M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />;
  return (
    <svg viewBox="0 0 64 28" className="h-7 w-16" aria-hidden>
      {style === 'solid' ? <rect x="12" y="6" width="40" height="16" rx="8" fill="currentColor" opacity="0.8" /> : null}
      {style === 'link' ? (
        <>
          <rect x="14" y="10" width="22" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
          <g transform="translate(38 4)">{arrow}</g>
          <rect x="14" y="20" width="36" height="1.5" rx="0.75" fill="currentColor" opacity="0.9" />
        </>
      ) : null}
      {style === 'outline' ? <rect x="12.5" y="6.5" width="39" height="15" rx="7.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.8" /> : null}
      {style === 'circle' ? (
        <>
          <rect x="10" y="12" width="26" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
          <circle cx="47" cy="14" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.8" />
          <g transform="translate(40 7)">{arrow}</g>
        </>
      ) : null}
      {style === 'underline' ? (
        <>
          <rect x="14" y="10" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
          <rect x="14" y="19" width="36" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
          <rect x="14" y="18.75" width="12" height="1.5" rx="0.75" fill="currentColor" />
        </>
      ) : null}
    </svg>
  );
}

/** Tiny schematic of each split style: copy lines on the left, the visual treatment on the right. */
function AboutUsSplitVariantIllustration({ variant }: { variant: 'split-overlap' | 'split-founder' | 'split-media-left' }) {
  return (
    <svg viewBox="0 0 64 36" className="h-9 w-16" aria-hidden>
      <rect x="4" y="9" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.7" />
      <rect x="4" y="15" width="24" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="4" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.3" />
      {variant === 'split-overlap' ? (
        <>
          <rect x="38" y="5" width="20" height="14" rx="3" fill="currentColor" opacity="0.35" />
          <rect x="32" y="15" width="22" height="16" rx="3" fill="currentColor" opacity="0.7" />
        </>
      ) : null}
      {variant === 'split-founder' ? (
        <>
          <rect x="36" y="6" width="24" height="24" rx="3" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <rect x="40" y="10" width="20" height="22" rx="3" fill="currentColor" opacity="0.6" />
          <circle cx="8" cy="29" r="3" fill="currentColor" opacity="0.6" />
        </>
      ) : null}
      {variant === 'split-media-left' ? <rect x="34" y="4" width="26" height="28" rx="6" fill="currentColor" opacity="0.65" /> : null}
    </svg>
  );
}

export type AboutUsSubSection = 'general' | 'design' | 'header' | 'background';

const ABOUT_US_SUB_SECTIONS: { id: AboutUsSubSection; label: string }[] = [
  { id: 'general', label: msg('General') },
  { id: 'design', label: msg('Design') },
  { id: 'header', label: msg('Header') },
  { id: 'background', label: msg('Background') },
];

export function normalizeAboutUsSubSection(value: string | undefined): AboutUsSubSection {
  return value === 'design' || value === 'header' || value === 'background' ? value : 'general';
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
  suffix = '%',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return <NpRangeField label={label} value={value} min={min} max={max} unit={suffix} onChange={onChange} />;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const hex = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#e5e7eb';
  return (
    <label className="block">
      <span className="pf-stack-block-label">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-[color:var(--pf-palette-bordure)] bg-transparent p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)]"
        />
      </div>
    </label>
  );
}

function patchTuple<T>(values: [T, T, T, T], index: number, value: T): [T, T, T, T] {
  const next: [T, T, T, T] = [values[0], values[1], values[2], values[3]];
  next[index] = value;
  return next;
}

function QuoteSvgEditor({
  selectedId,
  urls,
  accent,
  onSelectId,
  onUrlsChange,
}: {
  selectedId: AboutUsQuoteSvgId;
  urls: [string, string, string, string];
  accent: string;
  onSelectId: (id: AboutUsQuoteSvgId) => void;
  onUrlsChange: (urls: [string, string, string, string]) => void;
}) {
  const t = useT();
  const slot = quoteSvgSlotIndex(selectedId);
  const custom = (urls[slot] ?? '').trim();
  const { inputRef, uploading, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'fr',
    onUrlChange: (url) => onUrlsChange(patchTuple(urls, slot, url)),
  });

  return (
    <div className="space-y-3">
      <div>
        <p className="pf-stack-block-label">{t('SVG illustration')}</p>
        <p className="mt-1 text-sm text-[color:var(--pf-palette-texte-muted)]">
          {t('One visual on screen at a time. Click to switch between them.')}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg"
        className="hidden"
        onChange={onFileChange}
      />
      <div className="grid grid-cols-2 gap-2">
        {PORTFOLIO_ABOUT_US_QUOTE_SVG_OPTIONS.map((option) => {
          const active = option.value === selectedId;
          const optionCustom = (urls[quoteSvgSlotIndex(option.value)] ?? '').trim();
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectId(option.value)}
              className={`rounded-2xl border p-3 text-left transition ${
                active
                  ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                  : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
              }`}
            >
              <span
                className="flex h-16 w-full items-center justify-center"
                style={{
                  color: accent,
                  ['--about-us-ink' as string]: '#171717',
                  ['--about-us-surface' as string]: '#ffffff',
                }}
              >
                {optionCustom ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={optionCustom} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ) : (
                  <span className="h-14 w-14">
                    <AboutUsQuoteSvg id={option.value} />
                  </span>
                )}
              </span>
              <p className="mt-2 text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          className="flex-1 rounded-xl border border-[color:var(--pf-palette-bordure)] px-3 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]"
        >
          {uploading ? t('Uploading…') : t('Replace this one')}
        </button>
        {custom ? (
          <button
            type="button"
            onClick={() => onUrlsChange(patchTuple(urls, slot, ''))}
            className="rounded-xl border border-[color:var(--pf-palette-bordure)] px-3 py-2 text-sm font-semibold text-[color:var(--pf-palette-texte-muted)] hover:border-[color:var(--pf-palette-texte-muted)]"
          >
            {t('Original SVG')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TextField({
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
      <span className="pf-stack-block-label">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)]"
      />
    </label>
  );
}

export function AboutUsSettingsPanel({
  aboutUs,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  chrome,
}: {
  aboutUs: PortfolioAboutUsSectionSettings;
  onChange: (patch: Partial<PortfolioAboutUsSectionSettings>) => void;
  subSection?: AboutUsSubSection;
  onSubSectionChange?: (value: AboutUsSubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const isSplitOverlap = aboutUs.design === 'split-overlap';
  const isSplitFounder = aboutUs.design === 'split-founder';
  const isSplitMediaLeft = aboutUs.design === 'split-media-left';
  const isSplitCard = aboutUs.design === 'split-card';
  const isSplitQuote = aboutUs.design === 'split-quote';
  const isEditorial = aboutUs.design === 'editorial';
  const isPanorama = aboutUs.design === 'panorama';
  const isFolio = aboutUs.design === 'folio';
  const isCentered = aboutUs.design === 'centered';
  // Panorama and Folio have no left / right side: the photo is full-width or a fixed portrait column.
  const hasFixedMediaSide = isPanorama || isFolio || isCentered;
  const hasCustomHeadline = isEditorial || isPanorama || isFolio || isCentered;
  const usesSplitChrome = aboutUsDesignUsesSplitChrome(aboutUs.design);
  const mediaSide = resolveAboutUsMediaSide(aboutUs.design, aboutUs.mediaSide);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<AboutUsSubSection>('general');
  const previewSource = usePortfolioDesignPreviewSource();
  const backgroundTheme = resolveThumbnailTheme(previewSource?.settings.global, aboutUs);
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const subSection = normalizeAboutUsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection,setPreviousSubSection]=useState(subSection);
  if(previousSubSection!==subSection){setPreviousSubSection(subSection);if(subSection==='design')setDesignCatalogOpen(true);}
  const setSubSection = (value: AboutUsSubSection) => {
    if(value==='design')setDesignCatalogOpen(true);
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };

  const defaults: PortfolioAboutUsSectionSettings = {
    enabled: true,
    title: 'About us',
    subtitle: 'Who we are, what we do, and the people behind the work.',
    ...DEFAULT_ABOUT_US_PRESENTATION,
  };
  const modified = JSON.stringify(aboutUs) !== JSON.stringify(defaults);
  const isSplitFamily = isAboutUsSplitVariant(aboutUs.design);
  const selectedVariant = PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS.find((option) => option.value === aboutUs.design);
  const selectedDesign = isSplitFamily
    ? PORTFOLIO_ABOUT_US_DESIGN_CATALOG.find((option) => isAboutUsSplitVariant(option.value)) ?? PORTFOLIO_ABOUT_US_DESIGN_CATALOG[0]
    : PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.find((option) => option.value === aboutUs.design) ?? PORTFOLIO_ABOUT_US_DESIGN_OPTIONS[0];

  return (
    <NpPanelShell
      title={t('About us')}
      modified={modified}
      tabs={ABOUT_US_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange(defaults)}
      chrome={chrome}
    >

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow card title={t('Show About us section')} checked={aboutUs.enabled} onChange={(enabled) => onChange({ enabled })} />
          <div className="pb-6"><SectionColorModeControl hideLabel
                label={t('Color mode')}
                value={aboutUs.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              /></div>
          <div className="np-dimmable" data-disabled={aboutUs.enabled ? 'false' : 'true'} inert={!aboutUs.enabled}>
          <NpCollapsibleSection title={t('Style')}>
              {/* Both apply to the whole section, whichever design is active. */}
              
              <TextSizeSlider label={t('Text size')} options={PORTFOLIO_ABOUT_US_TEXT_SIZE_OPTIONS} value={aboutUs.textSize ?? 'medium'} onChange={(textSize) => onChange({ textSize })} />
            </NpCollapsibleSection>
            <NpCollapsibleSection title={t('Content shown')}>

      {/* Every design renders the task list, so every design gets its switch. */}
      <NpToggleRow
        title={t('Show task list')}
        description={isSplitFounder || isSplitCard || isSplitQuote ? t('Hidden by default on this design.') : undefined}
        checked={aboutUs.showTasks}
        onChange={(showTasks) => onChange({ showTasks })}
      />
      {usesSplitChrome ? null : (
        <>
          <NpToggleRow
            title={t('Show quote')}
            checked={aboutUs.showQuote}
            onChange={(showQuote) => onChange({ showQuote })}
          />
          <NpToggleRow
            title={t('Show founder')}
            checked={aboutUs.showFounder}
            onChange={(showFounder) => onChange({ showFounder })}
          />
        </>
      )}

      {usesSplitChrome ? (
        <>
          <NpToggleRow
            title={t('Show button')}
            description={t('Button under the text. Links to Contact.')}
            checked={aboutUs.showCta}
            onChange={(showCta) => onChange({ showCta })}
          />
          {aboutUs.showCta ? (
            <TextField
              label={t('Button label')}
              value={aboutUs.ctaLabel}
              onChange={(ctaLabel) => onChange({ ctaLabel })}
            />
          ) : null}
          {aboutUs.showCta ? (
            <NpOptionCardGroup label={t('Button style')} columns={2}>
              {PORTFOLIO_ABOUT_US_CTA_STYLE_OPTIONS.map((option) => (
                <NpOptionCard
                  key={option.value}
                  compact
                  selected={option.value === resolveAboutUsCtaStyle(aboutUs)}
                  title={t(option.label)}
                  subtitle={t(option.description)}
                  illustration={<AboutUsCtaStyleIllustration style={option.value} />}
                  onClick={() => onChange({ ctaStyle: option.value })}
                />
              ))}
            </NpOptionCardGroup>
          ) : null}
          {isSplitOverlap || isSplitMediaLeft || isSplitCard || isSplitQuote || isEditorial || isPanorama || isFolio || isCentered ? (
            <NpToggleRow
              title={t('Show quote')}
              checked={aboutUs.showQuote}
              onChange={(showQuote) => onChange({ showQuote })}
            />
          ) : null}
          <NpToggleRow
            title={t('Show founder')}
            checked={aboutUs.showFounder}
            onChange={(showFounder) => onChange({ showFounder })}
          />
          {/* No "founder rating" switch: nothing records a rating, so the stars it turned on
              could only ever show an invented score. */}
        </>
      ) : null}

            </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection !== 'general' && !aboutUs.enabled ? (
        <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its design and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div>
      ) : null}

      {subSection === 'header' && aboutUs.enabled ? <div className="np-stack">
        <NpCollapsibleSection title={t('Header settings')}>
          <TextField label={t('Section title')} value={aboutUs.title} onChange={title => onChange({ title })} />
          {usesSplitChrome && !isSplitQuote && !isEditorial && !isPanorama && !isFolio && !isCentered ? null : <TextField label={t('Section subtitle')} value={aboutUs.subtitle} onChange={subtitle => onChange({ subtitle })} />}
        </NpCollapsibleSection>
      </div> : null}

      {subSection === 'background' && aboutUs.enabled ? <div className="np-stack">
        <NpCollapsibleSection title={t('Palette')}>
          <SectionPaletteFamilyControl value={aboutUs.paletteFamily ?? 'global'} onChange={paletteFamily => onChange({ paletteFamily })} mode={backgroundTheme.mode} />
        </NpCollapsibleSection>
        <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields settings={aboutUs} onChange={patch => onChange(patch)} renderColorField={({ label, value, onChange: changeColor }) => {
            const options = ([['fond', 'Background'], ['neutre', 'Neutral'], ['principal', 'Primary'], ['secondaire', 'Secondary'], ['texteFort', 'Strong text']] as const)
              .map(([token, text]) => ({ value: token, color: backgroundTheme.palette[token], label: t(text) }));
            return <ColorSwatchRow label={label} value={options.find(option => option.color.toLowerCase() === value.toLowerCase())?.value ?? ''} onChange={token => { const option = options.find(option => option.value === token); if (option) changeColor(option.color); }} options={options} />;
          }} />
        </NpCollapsibleSection>
      </div> : null}

      {subSection === 'design' && aboutUs.enabled ? (
        <div className="np-stack">
          {designCatalogOpen ? (
            <>
              <div className="flex flex-col gap-7" aria-label={t('Choose a design')}>
                {PORTFOLIO_ABOUT_US_DESIGN_CATALOG.map(option=>{
                  const active=isAboutUsSplitVariant(option.value)?isSplitFamily:option.value===aboutUs.design;
                  const select=()=>{if(!active)onChange(defaultsForAboutUsDesign(option.value as PortfolioAboutUsDesign));};
                  return <DesignCatalogueCard key={option.value} label={t(option.label)} selected={active} onSelect={select} onCustomize={()=>{select();setDesignCatalogOpen(false);}}><span className="block aspect-[8/5] w-full overflow-hidden rounded-lg"><AboutUsDesignIllustration design={active && isSplitFamily && isAboutUsSplitVariant(option.value) ? aboutUs.design : option.value} /></span></DesignCatalogueCard>;
                })}
              </div>
            </>
          ) : (
            <>
          <NpBackRow title={selectedVariant?`${t(selectedDesign.label)} · ${t(selectedVariant.label)}`:t(selectedDesign.label)} onBack={()=>setDesignCatalogOpen(true)}/>

          <LayoutControlGroups>
      {hasCustomHeadline ? (
        <div className="space-y-4">
          <p className="pf-stack-block-label">{t('Headline')}</p>
          <ColorField
            label={t('Headline color')}
            value={aboutUs.editorialTitleColor ?? aboutUs.titleColor}
            onChange={(editorialTitleColor) => onChange({ editorialTitleColor })}
          />
          <NpRangeField
            label={t('Headline size')}
            value={aboutUs.editorialTitleSizePx ?? (isFolio ? 60 : isCentered ? 56 : isPanorama ? 56 : ABOUT_US_EDITORIAL_TITLE_AUTO_PX)}
            min={ABOUT_US_EDITORIAL_TITLE_PX_MIN}
            max={ABOUT_US_EDITORIAL_TITLE_PX_MAX}
            step={2}
            unit="px"
            onChange={(editorialTitleSizePx) => onChange({ editorialTitleSizePx })}
          />
          <p className="text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">
            {aboutUs.editorialTitleSizePx
              ? t('Desktop size; it steps down on smaller screens. Text size no longer changes the headline.')
              : t('Automatic: follows the screen width and the Text size setting.')}
          </p>
          {aboutUs.editorialTitleColor || aboutUs.editorialTitleSizePx ? (
            <button
              type="button"
              onClick={() => onChange({ editorialTitleColor: undefined, editorialTitleSizePx: undefined })}
              className="text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline underline-offset-4 hover:text-[color:var(--pf-palette-texte-fort)]"
            >
              {t('Reset headline to automatic')}
            </button>
          ) : null}
        </div>
      ) : null}
      {isSplitFamily ? (
        <NpOptionCardGroup label={t('Split style')} columns={3}>
          {PORTFOLIO_ABOUT_US_SPLIT_VARIANT_OPTIONS.map((option) => (
            <NpOptionCard
              key={option.value}
              compact
              selected={option.value === aboutUs.design}
              title={t(option.label)}
              illustration={<AboutUsSplitVariantIllustration variant={option.value} />}
              // Only the layout changes: toggles, colours, image side and the rest stay as they are.
              onClick={() => onChange({ design: option.value, mediaSide: resolveAboutUsMediaSide(aboutUs.design, aboutUs.mediaSide) })}
            />
          ))}
        </NpOptionCardGroup>
      ) : null}
      {usesSplitChrome ? (
        <>
          <p className="rounded-2xl border border-dashed border-[color:var(--pf-palette-bordure)] bg-transparent px-4 py-3 text-sm text-[color:var(--pf-palette-texte-muted)]">
            {isCentered
              ? t('Everything sits on one centred axis. The round portrait is the first photo (or the founder’s photo); the list runs as one line of words, with a dot between them unless you pick a bullet.')
              : isFolio
              ? t('The section title is the label on the top rule; a custom subtitle sits opposite it. The portrait is the first photo (or the founder’s photo), with the founder under it; the list is plain unless you pick a bullet.')
              : isPanorama
              ? t('The section title is the small label on the left; a custom subtitle closes the page on the right. The first photo, list, quote and founder come from Information → About us.')
              : isEditorial
              ? t('The section title is the small label above the headline; a custom subtitle sits opposite it. The first photo, quote, list and founder come from Information → About us. Flip the photo left or right.')
              : isSplitQuote
              ? t('Pick Photo or SVG on the right (or left). The photo comes from Information → About us.')
              : isSplitCard
              ? t('Everything sits in one large frame. The quote shows by default. Flip the image left or right without changing the design.')
              : isSplitFounder
                ? t('Founder is shown under the button. The task list is hidden unless you turn it on. Flip the image left or right.')
                : isSplitMediaLeft
                  ? t('A large rounded photo on one side, text and list on the other. Flip the image left or right.')
                  : t('Quote and founder stay hidden unless you turn them on. Flip the image left or right.')}
          </p>
          {hasFixedMediaSide ? null : (
          <div>
            <p className="pf-stack-block-label">{t('Image')}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PORTFOLIO_ABOUT_US_MEDIA_SIDE_OPTIONS.map((option) => {
                const active = option.value === mediaSide;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange({ mediaSide: option.value as PortfolioAboutUsMediaSide })}
                    className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                        : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
          )}
          {isSplitQuote ? (
            <div>
              <p className="pf-stack-block-label">
                {t('Photo or SVG')}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {PORTFOLIO_ABOUT_US_QUOTE_MEDIA_OPTIONS.map((option) => {
                  const active = (aboutUs.quoteMedia ?? 'svg') === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ quoteMedia: option.value as PortfolioAboutUsQuoteMedia })}
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                          : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {isSplitQuote && (aboutUs.quoteMedia ?? 'svg') === 'svg' ? (
            <QuoteSvgEditor
              selectedId={aboutUs.quoteSvgId ?? 'globe'}
              urls={aboutUs.quoteSvgUrls ?? DEFAULT_ABOUT_US_QUOTE_SVG_URLS}
              accent={aboutUs.accentColor}
              onSelectId={(quoteSvgId) => onChange({ quoteSvgId })}
              onUrlsChange={(quoteSvgUrls) => onChange({ quoteSvgUrls })}
            />
          ) : null}
          <div>
            <p className="pf-stack-block-label">{t('Placement')}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PORTFOLIO_ABOUT_US_CONTENT_PLACEMENT_OPTIONS.map((option) => {
                const active = option.value === (aboutUs.contentPlacement ?? 'left');
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onChange({ contentPlacement: option.value as PortfolioAboutUsContentPlacement })
                    }
                    className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                        : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
                    }`}
                  >
                    {t(option.label)}
                  </button>
                );
              })}
            </div>
          </div>
          <Range
            label={t('Width')}
            value={aboutUs.contentWidthPercent ?? 100}
            min={50}
            max={100}
            onChange={(contentWidthPercent) => onChange({ contentWidthPercent })}
          />
          {isSplitFounder ? (
            <div>
              <p className="pf-stack-block-label">
                {t('Image shape')}
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PORTFOLIO_ABOUT_US_IMAGE_FRAME_OPTIONS.map((option) => {
                  const active = option.value === (aboutUs.imageFrame ?? 'layered');
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onChange({ imageFrame: option.value as PortfolioAboutUsImageFrame })
                      }
                      className={`rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                          : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {isSplitCard || isSplitQuote ? (
            <div className="space-y-5">
              <p className="pf-stack-block-label">
                {isSplitQuote ? t('Quote card') : t('Frame')}
              </p>
              <CardsStyleControls
 collapsible={false}
                value={aboutUs.cardsStyle ?? DEFAULT_CARDS_STYLE}
                onChange={(cardsStyle) => onChange({ cardsStyle })}
              />
              <div>
                <p className="text-xs font-semibold text-[color:var(--pf-palette-texte-muted)]">{t('Shadow')}</p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {PORTFOLIO_ABOUT_US_CARD_SHADOW_OPTIONS.map((option) => {
                    const active = option.value === (aboutUs.cardShadow ?? 'medium');
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange({ cardShadow: option.value as PortfolioAboutUsCardShadow })}
                        className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                            : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
                        }`}
                      >
                        {t(option.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
              {isSplitQuote ? (
                <NpToggleRow
                  title={t('Quote background')}
                  description={t('Turn off for a transparent background. The border stays.')}
                  checked={aboutUs.cardBackgroundEnabled !== false}
                  onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
                />
              ) : null}
              {isSplitQuote && aboutUs.cardBackgroundEnabled === false ? null : (
                <ColorField
                  label={isSplitQuote ? t('Background colour') : t('Frame background')}
                  value={aboutUs.cardBackgroundColor ?? '#ffffff'}
                  onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                />
              )}
            </div>
          ) : null}
        </>
      ) : (
        <div>
          <p className="pf-stack-block-label">
            {t('Title / content layout')}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PORTFOLIO_ABOUT_US_SECTION_LAYOUT_OPTIONS.map((option) => {
              const active = option.value === aboutUs.sectionLayout;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ sectionLayout: option.value as PortfolioAboutUsSectionLayout })}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-transparent bg-[color:var(--np-active-bg)] text-[color:var(--np-active-ink)]'
                      : 'border-transparent bg-[color:var(--np-idle-bg)] text-[color:var(--np-label)] hover:bg-[color:var(--np-idle-hover)]'
                  }`}
                >
                  <p className="text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{t(option.label)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">{t(option.description)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

          </LayoutControlGroups>
          {aboutUs.showTasks ? (
            <NpCollapsibleSection title={t('List bullets')}>
              <NpOptionCardGroup label={t('Task list bullet')} columns={3}>
                {PORTFOLIO_ABOUT_US_TASK_BULLET_OPTIONS.map((option) => (
                  <NpOptionCard
                    key={option.value}
                    compact
                    selected={option.value === aboutUs.taskBulletStyle}
                    title={t(option.label)}
                    illustration={
                      option.value === 'none' ? (
                        <span className="text-xs opacity-60">—</span>
                      ) : (
                        <span className="flex items-center gap-1.5" style={{ color: aboutUs.accentColor }}>
                          <PortfolioListMarker style={option.value} color={aboutUs.accentColor} index={0} size="md" className="!mt-0" />
                          <span className="h-1.5 w-8 rounded-full bg-current opacity-25" style={{ color: 'currentColor' }} />
                        </span>
                      )
                    }
                    onClick={() => onChange({ taskBulletStyle: option.value })}
                  />
                ))}
              </NpOptionCardGroup>
              {aboutUs.taskBulletStyle ? (
                <button
                  type="button"
                  onClick={() => onChange({ taskBulletStyle: undefined })}
                  className="mt-3 text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline underline-offset-4 hover:text-[color:var(--pf-palette-texte-fort)]"
                >
                  {t('Use this design’s default bullet')}
                </button>
              ) : null}
            </NpCollapsibleSection>
          ) : null}
            </>
          )}
        </div>
      ) : null}
    </NpPanelShell>
  );
}
