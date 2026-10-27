'use client';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {FooterHeaderSkeleton} from './portfolio-footer-header-skeleton';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { HeaderSteppedSlider } from '@/components/portfolio/portfolio-header-style-controls';
import { FooterDesignThumbnail } from '@/components/portfolio/portfolio-footer-design-thumbnail';
import { FooterPreviewSkeleton } from './portfolio-footer-preview-skeleton';
import {
  PortfolioDesignLivePreview,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { createContext, Fragment, useContext, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { PortfolioSettingsPhotoField } from '@/components/portfolio/portfolio-settings-photo-field';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_FOOTER_COLOR_BINDINGS,
  DEFAULT_FOOTER_PALETTE,
  mergeFooterColorBindings,
  mergeFooterPalette,
  patchFooterColorBinding,
  patchFooterColorFieldManual,
  type FooterColorSlot,
} from '@/components/portfolio/portfolio-footer-palette-settings';
import {
  PORTFOLIO_FOOTER_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_MINI_BAR_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_PREMIUM_FONT_SIZE_OPTIONS,
  FOOTER_CONTACT_CARD_COLOR_TOKEN_OPTIONS,
  DEFAULT_FOOTER_LINK_COLUMNS,
  DEFAULT_FOOTER_LANDING_BRAND_GAP_PX,
  DEFAULT_FOOTER_PRESENTATION,
  isLegacyLandingMarketingColumns,
  type PortfolioFooterDesign,
  type PortfolioFooterMiniBarDesign,
  type PortfolioFooterContactCardColorToken,
  type PortfolioFooterLinkItem,
  type PortfolioFooterSectionSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { FooterMiniBarMinimalWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-minimal';
import { FooterMiniBarKineticWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-kinetic';
import { FooterMiniBarSplitCapsWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-split-caps';
import { FooterMiniBarLandingWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-landing';
import { FooterMiniBarContactCtaWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-contact-cta';
import { FooterMiniBarHeroColumnsWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-hero-columns';
import { FooterMiniBarInvertedWordmarkWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-inverted-wordmark';
import { FooterMiniBarServicesRevealWireframe } from '@/components/portfolio/portfolio-footer-mini-bar-services-reveal';
import {
  FOOTER_DESIGN_LAYOUT_SPECS,
  footerLayoutOverride,
  patchFooterLayoutElement,
  patchFooterSectionLink,
  resolveFooterLayoutBioCustom,
  resolveFooterLayoutBioSource,
  resolveFooterLayoutOption,
  resolveFooterLayoutTarget,
  resolveFooterLayoutVisible,
  resolveFooterSelectedSectionIds,
  footerCustomLinks,
  FOOTER_BIO_CUSTOM_MAX,
  footerDesignAcceptsCustomLinks,
  patchFooterCustomLinks,
  type FooterContactTargetMode,
  type FooterLayoutBioSpec,
  type FooterLayoutElementSpec,
  type FooterLayoutOptionSpec,
  type FooterLayoutTargetSpec,
  type FooterLayoutTextSpec,
  type PortfolioFooterSectionLinkOption,
} from '@/components/portfolio/portfolio-footer-design-layout';
import {
  PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS,
  FOOTER_HEADER_PALETTE_TOKEN_OPTIONS,
  FOOTER_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  footerHeaderPaletteTokenColor,
  type PortfolioFooterHeaderBillboardWordStyle,
  type PortfolioFooterHeaderDesign,
  type PortfolioFooterHeaderTitleSize,
  type PortfolioFooterHeaderTitleWeight,
  type PortfolioFooterHeaderPaletteToken,
} from '@/components/portfolio/portfolio-footer-header-settings';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpOptionCard,
  NpOptionCardGroup,
  NpPanelShell,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';
import { PORTFOLIO_SECTION_COLOR_MODE_OPTIONS } from '@/components/portfolio/portfolio-section-color-mode';
import { headerElementVisibility, toggleHeaderElement } from '@/components/portfolio/portfolio-header-elements';



/** A footer wireframe (120×72 drawing) fitted into an option card, or bare into a picker thumbnail. */
function FooterWireThumb({ children, framed = true }: { children: ReactNode; framed?: boolean }) {
  return (
    <span className={`${framed ? 'np-illus np-illus--glyph' : 'flex h-full w-full'} np-glyph np-wire`} aria-hidden>
      {children}
    </span>
  );
}

/** The main "Section design" picker — the current design with "Change"; the catalogue replaces it
 *  until a card is picked. Same mechanism as Navigation › Layout. */
function FooterDesignChoiceGrid({value,onChange,showGrid,setShowGrid}:{value:PortfolioFooterDesign;onChange:(value:PortfolioFooterDesign)=>void;showGrid:boolean;setShowGrid:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const selected=PORTFOLIO_FOOTER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_FOOTER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>{PORTFOLIO_FOOTER_DESIGN_OPTIONS.map(option=><DesignCatalogueCard key={option.value} label={t(option.label)} selected={option.value===value} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}>{previewSource?<span className="relative block aspect-[2/1] w-full overflow-hidden rounded-lg"><PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'footer',design:option.value})} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={<FooterPreviewSkeleton design={option.value} dark={(previewSource.settings.footer.colorModeOverride === 'auto' ? previewSource.settings.global.colorMode : previewSource.settings.footer.colorModeOverride) !== 'light'} />}/></span>:<FooterDesignThumbnail design={option.value} mode="light" priority={option.value===value}/>}</DesignCatalogueCard>)}</div>;
}



function FooterMiniBarWireframe({ design }: { design: PortfolioFooterMiniBarDesign }) {
  switch (design) {
    case 'kinetic':
      return <FooterMiniBarKineticWireframe />;
    case 'split-caps':
      return <FooterMiniBarSplitCapsWireframe />;
    case 'landing':
      return <FooterMiniBarLandingWireframe />;
    case 'contact-cta':
      return <FooterMiniBarContactCtaWireframe />;
    case 'hero-columns':
      return <FooterMiniBarHeroColumnsWireframe />;
    case 'inverted-wordmark':
      return <FooterMiniBarInvertedWordmarkWireframe />;
    case 'services-reveal':
      return <FooterMiniBarServicesRevealWireframe />;
    default:
      return <FooterMiniBarMinimalWireframe />;
  }
}

/** 8 options — always shown as cards, two per row (no "Change" step for a short list). */
function FooterMiniBarDesignGrid({
  value,
  onChange,
}: {
  value: PortfolioFooterMiniBarDesign;
  onChange: (value: PortfolioFooterMiniBarDesign) => void;
}) {
  const t = useT();
    return (
    <NpOptionCardGroup label={t('Bar design')}>
      {PORTFOLIO_FOOTER_MINI_BAR_DESIGN_OPTIONS.map((option) => (
        <NpOptionCard
          key={option.value}
          selected={option.value === value}
          title={t(option.label)}
          illustration={
            <FooterWireThumb>
              <FooterMiniBarWireframe design={option.value} />
            </FooterWireThumb>
          }
          onClick={() => onChange(option.value)}
        />
      ))}
    </NpOptionCardGroup>
  );
}

export type FooterSubSection = 'general' | 'design' | 'background' | 'header';

const FOOTER_SUB_SECTIONS: { id: FooterSubSection; label: string; description: string }[] = [
  { id: 'general', label: msg('General'), description: msg('Section visibility and defaults.') },
  { id: 'design', label: msg('Design'), description: msg('Layout and visual style.') },
  { id: 'header', label: msg('Header'), description: msg('Title, subtitle, fonts, and colors.') },
  { id: 'background', label: msg('Background'), description: msg('Fill behind this section.') },
];

/** Map legacy subsection ids (saved UI state / search) onto the current Footer menu. */
export function normalizeFooterSubSection(value: string | undefined): FooterSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  return 'general';
}

function asFooterPatch(patch: Record<string, unknown> | object): Partial<PortfolioFooterSectionSettings> {
  return patch as Partial<PortfolioFooterSectionSettings>;
}

/* ---------------------------------------------------------------------- */
/* Shared controls — thin wrappers over the Navigation panel's building   */
/* blocks (portfolio-nav-panel-ui), so every Footer tab reads the same.   */
/* ---------------------------------------------------------------------- */

/** One-line segmented choice. `hideLabel` keeps `label` as the accessible name only — for a choice
 *  that sits right under the switch it belongs to. */
function FooterOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  hideLabel?: boolean;
}) {
  const t = useT();
    const translated = options.map((option) => ({ value: option.value, label: t(option.label) }));
  if (!hideLabel) {
    return <NpSegmentedControl label={label} options={translated} value={value} onChange={onChange} />;
  }
  return (
    <div
      role="group"
      aria-label={label}
      className="np-seg"
      style={{ gridTemplateColumns: `repeat(${translated.length}, minmax(0, 1fr))` }}
    >
      {translated.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className="np-seg-btn"
        >
          <span className="relative truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

const FOOTER_HEADER_SIZE_STEPS: { value: PortfolioFooterHeaderTitleSize; tick: string; label: string }[] = [
  { value: 'sm', tick: 'S', label: msg('Small') },
  { value: 'md', tick: 'M', label: msg('Medium') },
  { value: 'lg', tick: 'L', label: msg('Large') },
  { value: 'xl', tick: 'XL', label: msg('Extra large') },
];

const FOOTER_HEADER_WEIGHT_STEPS: {
  value: PortfolioFooterHeaderTitleWeight;
  tick: string;
  label: string;
  fontWeight: number;
}[] = [
  { value: 'light', tick: '300', label: msg('Light'), fontWeight: 300 },
  { value: 'regular', tick: '400', label: msg('Regular'), fontWeight: 400 },
  { value: 'semibold', tick: '600', label: msg('Semibold'), fontWeight: 600 },
  { value: 'bold', tick: '800', label: msg('Bold'), fontWeight: 800 },
];

function FooterScaleControl<T extends string>({
  label,
  steps,
  value,
  onChange,
  stepStyle,
}: {
  label: string;
  steps: { value: T; tick: string; label: string }[];
  value: T;
  onChange: (value: T) => void;
  stepStyle?: (value: T) => CSSProperties;
}) {
  const t = useT();
  const selected = steps.find((step) => step.value === value) ?? steps[0];
  return (
    <HeaderSteppedSlider
      label={label}
      steps={steps.map((step) => ({ value: step.value, tick: step.tick }))}
      value={value}
      currentName={selected ? t(selected.label) : ''}
      onChange={onChange}
      stepStyle={stepStyle ? (step) => stepStyle(step.value) : undefined}
    />
  );
}

function FooterAlignmentIcon({ value }: { value: 'left' | 'center' | 'right' }) {
  const x = value === 'left' ? 3 : value === 'center' ? 9 : 15;
  const anchor = value === 'left' ? 'start' : value === 'center' ? 'middle' : 'end';
  const line = (width: number) => (anchor === 'start' ? x : anchor === 'middle' ? x - width / 2 : x - width);
  return (
    <svg viewBox="0 0 18 18" className="relative z-[1] h-[18px] w-[18px]" fill="none" aria-hidden>
      <path d={`M${line(12)} 4.5h12M${line(8)} 9h8M${line(10)} 13.5h10`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FooterAlignmentControl({
  value,
  onChange,
}: {
  value: 'left' | 'center' | 'right';
  onChange: (value: 'left' | 'center' | 'right') => void;
}) {
  const t = useT();
  const options = [
    { value: 'left' as const, label: t('Left') },
    { value: 'center' as const, label: t('Center') },
    { value: 'right' as const, label: t('Right') },
  ];
  return (
    <div>
      <p className="np-field-label">{t('Alignment')}</p>
      <div className="np-seg grid-cols-3" role="group" aria-label={t('Alignment')}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="np-seg-btn gap-2"
            aria-label={option.label}
            title={option.label}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            <FooterAlignmentIcon value={option.value} />
            <span className="sr-only">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

type FooterHeaderSettingKey = keyof PortfolioFooterSectionSettings;

type FooterHeaderElementTarget = {
  id: string;
  label: string;
  text?: {
    key: FooterHeaderSettingKey;
    label?: string;
    placeholder?: string;
    multiline?: boolean;
  };
  color?: {
    key: FooterHeaderSettingKey;
    label?: string;
    fallback?: PortfolioFooterHeaderPaletteToken;
  };
  sizeKey?: FooterHeaderSettingKey;
  weightKey?: FooterHeaderSettingKey;
  wordStyleKey?: FooterHeaderSettingKey;
  note?: string;
};

const FOOTER_HEADER_ELEMENT_TARGETS: Record<Exclude<PortfolioFooterHeaderDesign, 'none'>, FooterHeaderElementTarget[]> = {
  editorial: [
    {
      id: 'title',
      label: msg('Title'),
      text: { key: 'headerEditorialTitleText', placeholder: msg("Let's work together."), multiline: true },
      color: { key: 'headerEditorialTitleColor' },
    },
    {
      id: 'subtitle',
      label: msg('Subtitle'),
      text: { key: 'headerEditorialSubtitleText', placeholder: msg('Optional subtitle') },
    },
  ],
  'serif-lead': [
    {
      id: 'label',
      label: msg('Label'),
      text: { key: 'headerSerifLeadLabelText', placeholder: msg('Contact') },
      color: { key: 'headerSerifLeadLabelColor' },
      sizeKey: 'headerSerifLeadLabelSize',
      weightKey: 'headerSerifLeadLabelWeight',
    },
    {
      id: 'title',
      label: msg('Title'),
      text: { key: 'headerSerifLeadTitleText', placeholder: msg('A few ways to start a conversation and say hello.'), multiline: true },
      color: { key: 'headerSerifLeadTitleColor' },
      sizeKey: 'headerSerifLeadTitleSize',
      weightKey: 'headerSerifLeadTitleWeight',
    },
    {
      id: 'subtitle',
      label: msg('Subtitle'),
      text: { key: 'headerSerifLeadSubtitleText', placeholder: msg('Reach out — I read every message.'), multiline: true },
      color: { key: 'headerSerifLeadSubtitleColor' },
      sizeKey: 'headerSerifLeadSubtitleSize',
      weightKey: 'headerSerifLeadSubtitleWeight',
    },
  ],
  billboard: [
    {
      id: 'word',
      label: msg('Big word'),
      text: { key: 'headerBillboardBigWord', placeholder: 'TALK' },
      color: { key: 'headerBillboardWordColor', label: msg('Word color'), fallback: 'principal' },
      wordStyleKey: 'headerBillboardWordStyle',
    },
  ],
  index: [
    {
      id: 'label',
      label: msg('Rule label'),
      text: { key: 'headerIndexLabelText', placeholder: msg('Contact') },
      color: { key: 'headerIndexLabelColor' },
      sizeKey: 'headerIndexLabelSize',
      weightKey: 'headerIndexLabelWeight',
    },
    {
      id: 'number',
      label: msg('Counter'),
      color: { key: 'headerIndexNumberColor', label: msg('Number color'), fallback: 'principal' },
    },
    {
      id: 'countLabel',
      label: msg('Count label'),
      text: { key: 'headerIndexCountLabelText', placeholder: msg('Links') },
    },
    {
      id: 'title',
      label: msg('Title'),
      text: { key: 'headerIndexTitleText', placeholder: msg("Let's talk") },
      color: { key: 'headerIndexTitleColor' },
      sizeKey: 'headerIndexTitleSize',
      weightKey: 'headerIndexTitleWeight',
    },
    {
      id: 'subtitle',
      label: msg('Subtitle'),
      text: { key: 'headerIndexSubtitleText', placeholder: msg('Reach out — I read every message.'), multiline: true },
      color: { key: 'headerIndexSubtitleColor' },
      sizeKey: 'headerIndexSubtitleSize',
      weightKey: 'headerIndexSubtitleWeight',
    },
  ],
  masthead: [
    {
      id: 'line1',
      label: msg('Line 1'),
      text: { key: 'headerMastheadLine1Text', placeholder: msg('Always open.') },
      color: { key: 'headerMastheadHeadlineColor', label: msg('Headline color'), fallback: 'principal' },
      sizeKey: 'headerMastheadHeadlineSize',
      weightKey: 'headerMastheadHeadlineWeight',
    },
    {
      id: 'line2',
      label: msg('Line 2'),
      text: { key: 'headerMastheadLine2Text', placeholder: msg('Quick to reply.') },
      color: { key: 'headerMastheadHeadlineColor', label: msg('Headline color'), fallback: 'principal' },
      sizeKey: 'headerMastheadHeadlineSize',
      weightKey: 'headerMastheadHeadlineWeight',
    },
    {
      id: 'line3',
      label: msg('Line 3'),
      text: { key: 'headerMastheadLine3Text', placeholder: msg('Easy to reach.') },
      color: { key: 'headerMastheadHeadlineColor', label: msg('Headline color'), fallback: 'principal' },
      sizeKey: 'headerMastheadHeadlineSize',
      weightKey: 'headerMastheadHeadlineWeight',
    },
  ],
  hero: [
    {
      id: 'title',
      label: msg('Title'),
      text: { key: 'headerHeroTitleText', placeholder: msg("Let's build a space\nthat feels alive."), multiline: true },
      color: { key: 'headerHeroTitleColor', label: msg('Title & button color') },
    },
    {
      id: 'cta',
      label: msg('Button'),
      text: { key: 'headerHeroCtaLabel', label: msg('Button label'), placeholder: msg('Get in touch') },
      color: { key: 'headerHeroTitleColor', label: msg('Title & button color') },
    },
  ],
  name: [
    {
      id: 'name',
      label: msg('Name'),
      color: { key: 'headerNameColor', label: msg('Name color') },
      note: msg('Always shows your creator name — nothing to type here.'),
    },
  ],
  timezone: [
    {
      id: 'kicker',
      label: msg('Kicker'),
      text: { key: 'headerTimezoneKickerText', placeholder: msg('( Get in touch )') },
      color: { key: 'headerTimezoneTitleColor', label: msg('Header color') },
    },
    {
      id: 'title',
      label: msg('Title'),
      text: { key: 'headerTimezoneTitleText', placeholder: msg("Let's start\na conversation."), multiline: true },
      color: { key: 'headerTimezoneTitleColor', label: msg('Header color') },
    },
    {
      id: 'description',
      label: msg('Description'),
      text: { key: 'headerTimezoneDescriptionText', placeholder: msg('Reach out and tell us about your project — we read every message.'), multiline: true },
      color: { key: 'headerTimezoneTitleColor', label: msg('Header color') },
    },
    {
      id: 'clock',
      label: msg('Local time'),
      note: msg('The local time is generated automatically from your profile data.'),
    },
    {
      id: 'location',
      label: msg('Location'),
      note: msg('The location comes from your real profile data.'),
    },
  ],
};

function FooterHeaderElementEditor({
  design,
  footer,
  onChange,
}: {
  design: Exclude<PortfolioFooterHeaderDesign, 'none'>;
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  const t = useT();
  const targets = FOOTER_HEADER_ELEMENT_TARGETS[design];
  const preferred = targets.find((item) => item.id === 'title') ?? targets[0];
  const [activeElement, setActiveElement] = useState(preferred.id);
  const target = targets.find((item) => item.id === activeElement) ?? preferred;
  const visibilityDesign = `footer-${design}`;
  const visible = headerElementVisibility(footer.headerHiddenElements, visibilityDesign)(target.id);
  const settings = footer as unknown as Record<string, unknown>;
  const updateSetting = (key: FooterHeaderSettingKey, value: unknown) =>
    onChange({ [key]: value } as Partial<PortfolioFooterSectionSettings>);
  const selectorStyle: CSSProperties =
    targets.length > 3
      ? { gridAutoFlow: 'column', gridAutoColumns: 'minmax(96px, max-content)' }
      : { gridTemplateColumns: `repeat(${targets.length}, minmax(0, 1fr))` };

  return (
    <div className="flex flex-col gap-[30px]">
      {targets.length > 1 ? (
        <div
          role="group"
          aria-label={t('Header element')}
          className={`np-seg ${targets.length > 3 ? 'overflow-x-auto' : ''}`}
          style={selectorStyle}
        >
          {targets.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.id === target.id}
              className="np-seg-btn"
              onClick={() => setActiveElement(item.id)}
            >
              <span className="relative z-[1] truncate">{t(item.label)}</span>
            </button>
          ))}
        </div>
      ) : null}

      <NpToggleRow
        title={t('Visible')}
        checked={visible}
        onChange={(next) =>
          onChange({
            headerHiddenElements: toggleHeaderElement(
              footer.headerHiddenElements,
              visibilityDesign,
              target.id,
              next
            ),
          })
        }
      />

      <div className={visible ? 'flex flex-col gap-[30px]' : 'pointer-events-none opacity-40'} aria-disabled={!visible}>
        {target.note ? <p className="np-subtle">{t(target.note)}</p> : null}
        {target.text ? (
          <FooterHeaderTextField
            label={t(target.text.label ?? target.label)}
            value={String(settings[target.text.key] ?? '')}
            placeholder={target.text.placeholder ? t(target.text.placeholder) : undefined}
            multiline={target.text.multiline}
            onChange={(value) => updateSetting(target.text!.key, value)}
          />
        ) : null}
        {target.wordStyleKey ? (
          <FooterOptionGrid
            label={t('Word style')}
            options={FOOTER_HEADER_BILLBOARD_WORD_STYLE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            value={(settings[target.wordStyleKey] ?? 'outline') as PortfolioFooterHeaderBillboardWordStyle}
            onChange={(value) => updateSetting(target.wordStyleKey!, value)}
          />
        ) : null}
        {target.color ? (
          <FooterHeaderPaletteSwatches
            label={t(target.color.label ?? 'Color')}
            value={(settings[target.color.key] ?? target.color.fallback ?? 'texteFort') as PortfolioFooterHeaderPaletteToken}
            onChange={(value) => updateSetting(target.color!.key, value)}
          />
        ) : null}
        {target.sizeKey ? (
          <FooterScaleControl
            label={t('Size')}
            steps={FOOTER_HEADER_SIZE_STEPS}
            value={(settings[target.sizeKey] ?? 'md') as PortfolioFooterHeaderTitleSize}
            onChange={(value) => updateSetting(target.sizeKey!, value)}
          />
        ) : null}
        {target.weightKey ? (
          <FooterScaleControl
            label={t('Weight')}
            steps={FOOTER_HEADER_WEIGHT_STEPS}
            value={(settings[target.weightKey] ?? 'regular') as PortfolioFooterHeaderTitleWeight}
            onChange={(value) => updateSetting(target.weightKey!, value)}
            stepStyle={(step) => ({
              fontWeight: FOOTER_HEADER_WEIGHT_STEPS.find((item) => item.value === step)?.fontWeight,
            })}
          />
        ) : null}
      </div>
    </div>
  );
}

/** Palette tokens as chips, each with its colour dot. */
function FooterHeaderPaletteSwatches({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioFooterHeaderPaletteToken;
  onChange: (value: PortfolioFooterHeaderPaletteToken) => void;
}) {
      return (
    <ColorSwatchRow
      label={label}
      options={FOOTER_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        color: footerHeaderPaletteTokenColor(option.value),
      }))}
      value={value}
      onChange={(next) => onChange(next as PortfolioFooterHeaderPaletteToken)}
    />
  );
}

function FooterHeaderTextField({
  label,
  value,
  placeholder,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="np-field block">
      <span className="np-field-label">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          className="np-input"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="np-input"
        />
      )}
    </label>
  );
}

function FooterHeaderMiniWireframe({design}:{design:PortfolioFooterHeaderDesign}){
 return <StackPreviewSkeleton section="footer"><FooterHeaderSkeleton design={design} compact/></StackPreviewSkeleton>;
}

/** Same picker as Section design; `open` is owned by the panel so the header's settings hide while
 *  the catalogue is browsed. */
function FooterHeaderDesignGrid({value,onChange,open,onOpenChange}:{value:PortfolioFooterHeaderDesign;onChange:(value:PortfolioFooterHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('footer');
 const selected=PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS[0];
 if(!open)return <NpBackRow title={t(selected.label)} onBack={()=>onOpenChange(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>
  {PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.map(option=>{
   if(option.value==='none')return <button
    key={option.value}
    type="button"
    aria-pressed={value===option.value}
    onClick={()=>onChange(option.value)}
    className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}
   >{t(option.label)}</button>;
   return <DesignCatalogueCard
    key={option.value}
    label={t(option.label)}
    selected={value===option.value}
    previewBackground={theme.background}
    onSelect={()=>onChange(option.value)}
    onCustomize={()=>{if(value!==option.value)onChange(option.value);onOpenChange(false);}}
   >
    <span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>{previewSource?<PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'footerHeader',design:option.value})+'&previewRevision=footer-header-compact-v3'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={<FooterHeaderMiniWireframe design={option.value}/>} animateSkeleton={false} backgroundColor={theme.background}/>:<FooterHeaderMiniWireframe design={option.value}/>}</span>
   </DesignCatalogueCard>;
  })}
 </div>;
}


/** Free colour: round swatch (native picker), name, editable hex. */
function FooterManualColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="np-swatch min-w-0 flex-1">
        <span className="np-swatch-dot" style={{ backgroundColor: value }}>
          <input type="color" value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${label} picker`} />
        </span>
        <span className="np-swatch-name">{label}</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          const next = event.target.value.trim();
          if (isValidProfileHexColor(next)) onChange(next);
        }}
        className="np-input !w-28 shrink-0 font-mono uppercase"
        aria-label={`${label} hex`}
      />
    </div>
  );
}

/** Palette-bound color field — a theme token picker when the Hero palette is on, a free colour
 *  when it's off. Same mechanism as Services/FAQ/Stack's own color fields. */
function FooterColorField({
  footer,
  onChange,
  slot,
  label,
  value,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
  slot: FooterColorSlot;
  label: string;
  value: string;
}) {
    if (footer.useHeroPalette === false) {
    return (
      <FooterManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asFooterPatch(patchFooterColorFieldManual(footer, slot, hex)))}
      />
    );
  }

  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
  const token = bindings[slot];
    return (
    <ColorSwatchRow
      label={label}
      options={PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        color: resolveHeroPaletteColor(palette, option.value),
      }))}
      value={token}
      onChange={(next) =>
        onChange(asFooterPatch(patchFooterColorBinding(footer, slot, next as HeroPaletteTokenId)))
      }
    />
  );
}

/* ---------------------------------------------------------------------- */
/* Design tab → Layout settings — one band per selected design, generated  */
/* from FOOTER_DESIGN_LAYOUT_SPECS so each design only lists what it       */
/* actually renders (links, identity, editable words).                     */
/* ---------------------------------------------------------------------- */

type FooterLayoutPatch = (patch: Partial<PortfolioFooterSectionSettings>) => void;

const FOOTER_BIO_SOURCE_OPTIONS = [
  { value: 'bio' as const, label: msg('Profile bio') },
  { value: 'custom' as const, label: msg('Custom') },
];

/** Groups longer than this start folded (Settings design standard, rule 5). */
const FOOTER_LAYOUT_COLLAPSE_AFTER = 5;

/** The sections linked from the footer, as chips — the same picker as Navigation's dropdown menus. */
function FooterSectionLinksPicker({
  footer,
  options,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  options: PortfolioFooterSectionLinkOption[];
  onChange: FooterLayoutPatch;
}) {
  const id = useId();
  const t = useT();
    const selected = new Set(resolveFooterSelectedSectionIds(footer, footer.design));
  const selectedCount = options.filter((option) => selected.has(option.id)).length;
  const customLinks = footerCustomLinks(footer, footer.design);
  const canAddLinks = footerDesignAcceptsCustomLinks(footer.design);

  if (options.length === 0 && !canAddLinks) {
    return <p className="np-note">{t('Visible sections will appear here.')}</p>;
  }

  return (
    <div className="np-field">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p id={id} className="np-field-label !mb-0">
          {t('Links shown')}
        </p>
        <span className="np-value-badge tabular-nums">
          {selectedCount}/{options.length}
        </span>
      </div>
      <div role="group" aria-labelledby={id} className="np-chips">
        {options.map((option) => {
          const checked = selected.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={checked}
              onClick={() => onChange(patchFooterSectionLink(footer, footer.design, option.id, !checked))}
              className="np-chip"
            >
              {t(option.label)}
            </button>
          );
        })}
        {customLinks.map((link) => (
          <span key={link.id} className="np-chip inline-flex items-center gap-1.5" aria-pressed="true" title={link.href}>
            {link.label}
            <button
              type="button"
              aria-label={t('Remove {label}', { label: link.label })}
              onClick={() => onChange(patchFooterCustomLinks(footer, footer.design, customLinks.filter((item) => item.id !== link.id)))}
              className="-mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full opacity-70 transition hover:opacity-100"
            >
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden>
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      {canAddLinks ? <FooterCustomLinkForm footer={footer} links={customLinks} onChange={onChange} /> : null}
    </div>
  );
}

const FOOTER_CUSTOM_LINKS_MAX = 6;
const FOOTER_CUSTOM_LABEL_MAX = 30;

/** A typed address as a safe href: http(s), mailto, tel, a path or an anchor; a bare domain gets https://. */
function normalizeFooterCustomHref(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.length > 500 || /\s/.test(value)) return null;
  if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
  return /^[^.\s]+\.[^.\s]+/.test(value) ? `https://${value}` : null;
}

/** Add a link of your own next to the section chips: a label and where it points. */
function FooterCustomLinkForm({
  footer,
  links,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  links: PortfolioFooterLinkItem[];
  onChange: FooterLayoutPatch;
}) {
  const count = links.length;
  const t = useT();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (count >= FOOTER_CUSTOM_LINKS_MAX) {
    return <p className="np-note mt-3">{t('You can add up to {max} links of your own.', { max: FOOTER_CUSTOM_LINKS_MAX })}</p>;
  }
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="np-chip mt-3" aria-expanded={false}>
        + {t('Add your own link')}
      </button>
    );
  }

  const submit = () => {
    const trimmed = label.trim();
    const href = normalizeFooterCustomHref(url);
    if (!trimmed) return setError(t('Give the link a name.'));
    if (!href) return setError(t('Enter a valid address, like example.com or https://…'));
    const link = {
      id: `link-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      label: trimmed,
      href,
    };
    onChange(patchFooterCustomLinks(footer, footer.design, [...links, link]));
    setLabel('');
    setUrl('');
    setError(null);
    setOpen(false);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="np-field-label !mb-1">{t('Link name')}</p>
          <span className="text-xs tabular-nums text-[color:var(--pf-palette-texte-muted)]">
            {label.length}/{FOOTER_CUSTOM_LABEL_MAX}
          </span>
        </div>
        <input
          type="text"
          value={label}
          maxLength={FOOTER_CUSTOM_LABEL_MAX}
          placeholder={t('Blog')}
          aria-label={t('Link name')}
          onChange={(event) => setLabel(event.target.value)}
          className="np-input"
        />
      </div>
      <div>
        <p className="np-field-label !mb-1">{t('Link address')}</p>
        <input
          type="text"
          value={url}
          placeholder="example.com"
          aria-label={t('Link address')}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
          className="np-input"
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <div className="flex gap-2">
        <button type="button" onClick={submit} className="np-chip" aria-pressed="true">
          {t('Add link')}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="np-chip"
        >
          {t('Cancel')}
        </button>
      </div>
    </div>
  );
}

function FooterLayoutTextField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutTextSpec;
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  const design = footer.design;
  const hideable = spec.hideable !== false;
  const visible = resolveFooterLayoutVisible(footer, design, spec.key);
  const value = footerLayoutOverride(footer, design, spec.key)?.text ?? '';
  const placeholder = spec.defaultText(footer).trim() || spec.placeholder || '';
  const setText = (text: string) => onChange(patchFooterLayoutElement(footer, design, spec.key, { text }));

  return (
    <div className="flex flex-col gap-2">
      {hideable ? (
        <NpToggleRow
          title={t(spec.label)}
          checked={visible}
          onChange={(checked) => onChange(patchFooterLayoutElement(footer, design, spec.key, { visible: checked }))}
        />
      ) : (
        <div className="flex items-baseline justify-between gap-3">
          <p className="np-field-label !mb-1">{t(spec.label)}</p>
          {spec.maxLength ? (
            <span
              aria-live="polite"
              className={`text-xs tabular-nums ${
                value.length >= spec.maxLength
                  ? 'font-semibold text-[color:var(--pf-palette-texte-fort)]'
                  : 'text-[color:var(--pf-palette-texte-muted)]'
              }`}
            >
              {value.length}/{spec.maxLength}
            </span>
          ) : null}
        </div>
      )}
      {visible ? (
        spec.multiline ? (
          <textarea
            value={value}
            placeholder={placeholder}
            rows={2}
            aria-label={t(spec.label)}
            onChange={(event) => setText(event.target.value)}
            className="np-input"
          />
        ) : (
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            aria-label={t(spec.label)}
            maxLength={spec.maxLength}
            onChange={(event) => setText(event.target.value)}
            className="np-input"
          />
        )
      ) : null}
    </div>
  );
}

function FooterLayoutBioField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutBioSpec;
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  const design = footer.design;
  const visible = resolveFooterLayoutVisible(footer, design, spec.key);
  const source = resolveFooterLayoutBioSource(footer, design, spec.key);

  return (
    <div className="flex flex-col gap-2">
      <NpToggleRow
        title={t(spec.label)}
        checked={visible}
        onChange={(checked) => onChange(patchFooterLayoutElement(footer, design, spec.key, { visible: checked }))}
      />
      {visible ? (
        <>
          <FooterOptionGrid
            label={`${spec.label} source`}
            hideLabel
            options={FOOTER_BIO_SOURCE_OPTIONS}
            value={source}
            onChange={(next) => onChange(patchFooterLayoutElement(footer, design, spec.key, { source: next }))}
          />
          {source === 'custom' ? (
            <>
              <textarea
                value={resolveFooterLayoutBioCustom(footer, design, spec.key)}
                rows={3}
                maxLength={FOOTER_BIO_CUSTOM_MAX}
                aria-label={`${spec.label} text`}
                onChange={(event) =>
                  onChange(patchFooterLayoutElement(footer, design, spec.key, { text: event.target.value }))
                }
                className="np-input"
              />
              <span
                aria-live="polite"
                className={`self-end text-xs tabular-nums ${
                  resolveFooterLayoutBioCustom(footer, design, spec.key).length >= FOOTER_BIO_CUSTOM_MAX
                    ? 'font-semibold text-[color:var(--pf-palette-texte-fort)]'
                    : 'text-[color:var(--pf-palette-texte-muted)]'
                }`}
              >
                {resolveFooterLayoutBioCustom(footer, design, spec.key).length}/{FOOTER_BIO_CUSTOM_MAX}
              </span>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/** Colour choices as chips, each with its colour dot (same look as the header's palette tokens). */
function FooterSwatchChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; color: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
    return (
    <ColorSwatchRow
      label={label}
      options={options}
      value={value}
      onChange={(next) => onChange(next as T)}
    />
  );
}

function FooterLayoutOptionField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutOptionSpec;
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  const value = resolveFooterLayoutOption(footer, footer.design, spec.key);
  const setValue = (choice: string) =>
    onChange(patchFooterLayoutElement(footer, footer.design, spec.key, { choice }));

  if (!spec.options.some((option) => option.swatch)) {
    return <FooterOptionGrid label={t(spec.label)} options={spec.options} value={value} onChange={setValue} />;
  }

  return (
    <FooterSwatchChips
      label={t(spec.label)}
      options={spec.options.map((option) => ({ value: option.value, label: option.label, color: option.swatch ?? 'transparent' }))}
      value={value}
      onChange={setValue}
    />
  );
}

type FooterContactLinkOption = { id: string; label: string; href: string };

/** The profile's own contact links (from the live preview) — offered by "Button link" pickers. */
const FooterContactLinkOptionsContext = createContext<FooterContactLinkOption[]>([]);

const FOOTER_CONTACT_TARGET_OPTIONS: { value: FooterContactTargetMode; label: string }[] = [
  { value: 'email', label: msg('Email') },
  { value: 'phone', label: msg('Phone') },
  { value: 'link', label: msg('Link') },
];

const FOOTER_CUSTOM_LINK_VALUE = '__custom';

function FooterLayoutTargetField({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutTargetSpec;
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  const design = footer.design;
  const linkOptions = useContext(FooterContactLinkOptionsContext);
  const target = resolveFooterLayoutTarget(footer, design, spec.key);
  // Raw saved text (not the sanitized href) so the input never rewrites what the creator types.
  const rawUrl = footerLayoutOverride(footer, design, spec.key)?.text ?? '';
  const matchesProfileLink = linkOptions.some((option) => option.href === rawUrl);
  const [customLink, setCustomLink] = useState(Boolean(rawUrl.trim()) && !matchesProfileLink);
  const showCustomInput = customLink || linkOptions.length === 0;
  const patch = (next: { choice?: string; text?: string }) =>
    onChange(patchFooterLayoutElement(footer, design, spec.key, next));

  return (
    <div className="flex flex-col gap-2">
      <FooterOptionGrid
        label={t(spec.label)}
        options={FOOTER_CONTACT_TARGET_OPTIONS}
        value={target.mode}
        onChange={(mode) => patch({ choice: mode })}
      />
      {target.mode === 'link' ? (
        <>
          {linkOptions.length > 0 ? (
            <select
              aria-label={`${spec.label} destination`}
              value={showCustomInput ? FOOTER_CUSTOM_LINK_VALUE : matchesProfileLink ? rawUrl : ''}
              onChange={(event) => {
                const value = event.target.value;
                if (value === FOOTER_CUSTOM_LINK_VALUE) {
                  setCustomLink(true);
                  patch({ text: '' });
                  return;
                }
                setCustomLink(false);
                patch({ text: value });
              }}
              className="np-input"
            >
              <option value="" disabled>
                {t('Choose a link')}
              </option>
              {linkOptions.map((option) => (
                <option key={option.id} value={option.href}>
                  {t(option.label)}
                </option>
              ))}
              <option value={FOOTER_CUSTOM_LINK_VALUE}>{t('Custom URL')}</option>
            </select>
          ) : null}
          {showCustomInput ? (
            <input
              type="url"
              value={matchesProfileLink ? '' : rawUrl}
              placeholder="https://"
              aria-label={`${spec.label} URL`}
              onChange={(event) => patch({ text: event.target.value })}
              className="np-input"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function FooterLayoutElementControl({
  footer,
  spec,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  spec: FooterLayoutElementSpec;
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  switch (spec.kind) {
    case 'target':
      return <FooterLayoutTargetField footer={footer} spec={spec} onChange={onChange} />;
    case 'toggle':
      return (
        <NpToggleRow
          title={t(spec.label)}
          checked={resolveFooterLayoutVisible(footer, footer.design, spec.key)}
          onChange={(checked) =>
            onChange(patchFooterLayoutElement(footer, footer.design, spec.key, { visible: checked }))
          }
        />
      );
    case 'choice':
      return (
        <FooterOptionGrid
          label={t(spec.label)}
          hideLabel
          options={spec.options}
          value={footer[spec.field] ?? spec.options[0].value}
          onChange={(value) => onChange({ [spec.field]: value })}
        />
      );
    case 'option':
      return <FooterLayoutOptionField footer={footer} spec={spec} onChange={onChange} />;
    case 'bio':
      return <FooterLayoutBioField footer={footer} spec={spec} onChange={onChange} />;
    case 'text':
      return <FooterLayoutTextField footer={footer} spec={spec} onChange={onChange} />;
  }
}

/** One group of the chosen design's elements as its own section: the on/off switches first, as a
 *  tight list, then the fields. Long groups start folded. */
function FooterLayoutGroup({
  title,
  elements,
  footer,
  onChange,
}: {
  title: string;
  elements: FooterLayoutElementSpec[];
  footer: PortfolioFooterSectionSettings;
  onChange: FooterLayoutPatch;
}) {
  const toggles = elements.filter((element) => element.kind === 'toggle');
  const rest = elements.filter((element) => element.kind !== 'toggle');

  return (
    <NpCollapsibleSection title={title} defaultOpen={elements.length <= FOOTER_LAYOUT_COLLAPSE_AFTER}>
      {toggles.length > 0 ? (
        <div className="flex flex-col">
          {toggles.map((spec) => (
            <FooterLayoutElementControl key={spec.key} footer={footer} spec={spec} onChange={onChange} />
          ))}
        </div>
      ) : null}
      {rest.map((spec) => (
        <FooterLayoutElementControl key={spec.key} footer={footer} spec={spec} onChange={onChange} />
      ))}
    </NpCollapsibleSection>
  );
}

/** Contact card design only — the left info card's fill, from the palette. */
function FooterContactCardColorField({
  footer,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  const t = useT();
  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
  return (
    <FooterSwatchChips
      label={t('Card background color')}
      options={FOOTER_CONTACT_CARD_COLOR_TOKEN_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        color: resolveHeroPaletteColor(palette, option.value),
      }))}
      value={footer.contactCardColorToken ?? 'principal'}
      onChange={(contactCardColorToken: PortfolioFooterContactCardColorToken) => onChange({ contactCardColorToken })}
    />
  );
}

/** The chosen design's own settings, generated from FOOTER_DESIGN_LAYOUT_SPECS: one section per
 *  group (section links, wordmark, text, headings), keyed by design so switching starts fresh. */
function FooterLayoutSettingsSections({
  footer,
  sectionLinkOptions,
  profileAvatarUrl,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  sectionLinkOptions: PortfolioFooterSectionLinkOption[];
  profileAvatarUrl?: string | null;
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  const spec = FOOTER_DESIGN_LAYOUT_SPECS[footer.design];
  if (!spec) return null;
  const elements = spec.elements.filter((element) => !element.showWhen || element.showWhen(footer));
  const identity = elements.filter((element) => element.group === 'identity');
  // The giant decorative name (Inverted wordmark, Monumental / Timezone watermark) is styling, not
  // identity — it keeps its own group so hiding Identity doesn't take these controls with it.
  const wordmark = elements.filter((element) => element.group === 'wordmark');
  const text = elements.filter((element) => element.group === 'text');
  const headings = elements.filter((element) => element.group === 'labels');
  const photoVisibilityKey: Partial<Record<PortfolioFooterDesign, string>> = {
    landing: 'avatar',
    minimal: 'avatar',
    'hero-columns': 'portrait',
    'split-form': 'portrait',
    'timezone-editorial': 'avatar',
    'editorial-grid': 'avatar',
  };
  const photoKey = photoVisibilityKey[footer.design];
  const showsPhotoControl =
    footer.design === 'centered-minimal'
      ? footer.centeredIdentity === 'avatar' && resolveFooterLayoutVisible(footer, footer.design, 'identity')
      : Boolean(photoKey && resolveFooterLayoutVisible(footer, footer.design, photoKey));

  return (
    <Fragment key={footer.design}>
      {identity.length > 0 ? (
        <FooterLayoutGroup title={t('Identity')} elements={identity} footer={footer} onChange={onChange} />
      ) : null}
      {showsPhotoControl ? (
        <NpCollapsibleSection title={t('Photo')}>
          <PortfolioSettingsPhotoField
            label={t('Photo')}
            photoUrl={footer.photoUrl ?? ''}
            profileAvatarUrl={profileAvatarUrl ?? null}
            onChange={(photoUrl) => onChange({ photoUrl })}
          />
        </NpCollapsibleSection>
      ) : null}
      {spec.sectionLinks ? (
        <NpCollapsibleSection title={t('Section links')}>
          <FooterSectionLinksPicker footer={footer} options={sectionLinkOptions} onChange={onChange} />
        </NpCollapsibleSection>
      ) : null}
      {wordmark.length > 0 ? (
        <FooterLayoutGroup title={t('Wordmark')} elements={wordmark} footer={footer} onChange={onChange} />
      ) : null}
      {text.length > 0 ? (
        <FooterLayoutGroup title={t('Text')} elements={text} footer={footer} onChange={onChange} />
      ) : null}
      {headings.length > 0 ? (
        <FooterLayoutGroup title={t('Headings')} elements={headings} footer={footer} onChange={onChange} />
      ) : null}
    </Fragment>
  );
}

const FOOTER_BACKGROUND_LABEL_SLOTS: Record<string, FooterColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Color A': 'sectionSplitA',
  'Color B': 'sectionSplitB',
};

/** What each Footer design renders (measured design by design). General only offers the switches
 *  that change something on the chosen design — email and phone are shown by every design. */
const FOOTER_DESIGN_SHOWS: Record<
  PortfolioFooterSectionSettings['design'],
  { location: boolean; hours: boolean; copyright: boolean; marketplace: boolean }
> = {
  'centered-minimal': { location: false, hours: false, copyright: false, marketplace: false },
  landing: { location: true, hours: true, copyright: false, marketplace: false },
  compact: { location: true, hours: false, copyright: true, marketplace: false },
  minimal: { location: true, hours: false, copyright: false, marketplace: true },
  'contact-card': { location: true, hours: false, copyright: true, marketplace: false },
  monumental: { location: true, hours: false, copyright: true, marketplace: false },
  'hero-columns': { location: true, hours: false, copyright: false, marketplace: false },
  'split-form': { location: true, hours: true, copyright: false, marketplace: false },
  'timezone-editorial': { location: false, hours: false, copyright: true, marketplace: false },
  'inverted-wordmark': { location: false, hours: false, copyright: false, marketplace: false },
  'services-reveal': { location: true, hours: false, copyright: false, marketplace: false },
  'editorial-grid': { location: true, hours: false, copyright: false, marketplace: false },
  'headline-reveal': { location: true, hours: false, copyright: false, marketplace: false },
  dispatch: { location: true, hours: false, copyright: false, marketplace: false },
};

/** Header designs that apply the shared "Title style" controls (the others have a fixed type). */
const FOOTER_HEADER_TITLE_STYLE: Partial<Record<string, { sizeAndWeight: boolean }>> = {
  editorial: { sizeAndWeight: true },
  masthead: { sizeAndWeight: false },
  'serif-lead': { sizeAndWeight: false },
};

/** Shown on Design / Header / Background while the Footer is off — with the way back. */
function FooterHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !gap-0 !py-6 text-center">
      <p className="np-card-title">{t('The footer is hidden')}</p>
      <p className="np-subtle mt-1">{t('Turn it on to choose its design.')}</p>
      <button type="button" onClick={onEnable} className="np-primary-btn mt-5">
        {t('Show footer')}
      </button>
    </div>
  );
}

const FOOTER_SPACING_OPTIONS = [
  { value: 'none' as const, tick: '0', label: msg('None') },
  { value: 'sm' as const, tick: 'S', label: msg('Small') },
  { value: 'md' as const, tick: 'M', label: msg('Medium') },
  { value: 'lg' as const, tick: 'L', label: msg('Large') },
  { value: 'xl' as const, tick: 'XL', label: msg('Extra large') },
];

/** What "Reset" restores and what the header's status compares against. */
const FOOTER_DEFAULTS: PortfolioFooterSectionSettings = { enabled: true, ...DEFAULT_FOOTER_PRESENTATION };

/** A setting left unset counts as its default, so an old portfolio isn't reported as modified. */
function isFooterModified(footer: PortfolioFooterSectionSettings) {
  const keys = Object.keys({ ...FOOTER_DEFAULTS, ...footer }) as (keyof PortfolioFooterSectionSettings)[];
  return keys.some((key) => {
    const value = footer[key] === undefined ? FOOTER_DEFAULTS[key] : footer[key];
    return JSON.stringify(value) !== JSON.stringify(FOOTER_DEFAULTS[key]);
  });
}

/**
 * Footer settings, one question per tab — framed like the Navigation panel (header with status and
 * history, underline tabs, folding sections, reset · done):
 *  - General: is there a footer, and which details it shows (contact, bottom line).
 *  - Design: which footer, its style, the chosen design's own options, the optional mini bar.
 *  - Header: the title block above it — design, words, title style, spacing (folded).
 *  - Background: the fill behind it.
 * With the footer off, General stays visible but dimmed and the other tabs say so instead of showing
 * settings that change nothing. `chrome` gives the panel its own header and footer (the studio
 * dock); without it the host frames the tabs.
 */
export function FooterSettingsPanel({
  footer,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  sectionLinkOptions = [],
  profileAvatarUrl = null,
  contactLinkOptions = [],
  chrome,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
  subSection?: FooterSubSection;
  onSubSectionChange?: (value: FooterSubSection) => void;
  /** Sections currently visible in the live preview — the Section links picker. */
  sectionLinkOptions?: PortfolioFooterSectionLinkOption[];
  /** Account profile photo — shown in Design → Photo until a custom one replaces it. */
  profileAvatarUrl?: string | null;
  /** Profile contact links — destinations offered by the "Button link" pickers. */
  contactLinkOptions?: FooterContactLinkOption[];
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const backgroundTheme = useThumbnailTheme('footer');
  const backgroundPalette = footer.lockPaletteAcrossColorModes ? mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette) : backgroundTheme.palette;
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FooterSubSection>('general');
  const subSection = normalizeFooterSubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if(previousSubSection !== subSection){
    setPreviousSubSection(subSection);
    if(subSection === 'design')setDesignCatalogOpen(true);
    if(subSection === 'header')setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: FooterSubSection) => {
    const next = normalizeFooterSubSection(value);
    if(next === 'design')setDesignCatalogOpen(true);
    if(next === 'header')setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const enabled = footer.enabled !== false;
  const enable = () => onChange({ enabled: true });
  const designShows = FOOTER_DESIGN_SHOWS[footer.design] ?? FOOTER_DESIGN_SHOWS.minimal;
  // The mini bar can carry the copyright, location and hours under any design.
  const miniBarOn = footer.showMiniBar === true;
  const headerDesign = footer.headerDesign ?? 'editorial';
  const headerTitleStyle = FOOTER_HEADER_TITLE_STYLE[headerDesign];

  return (
    <NpPanelShell
      title={t('Footer')}
      modified={isFooterModified(footer)}
      tabs={FOOTER_SUB_SECTIONS.map((section) => ({ id: section.id, label: t(section.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange({ ...FOOTER_DEFAULTS })}
      chrome={chrome}
    >
      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show footer')}
            checked={enabled}
            onChange={(next) => onChange({ enabled: next })}
          />
          <div className="pb-6"><NpSegmentedControl hideLabel
                label={t('Color mode')}
                options={PORTFOLIO_SECTION_COLOR_MODE_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
                value={footer.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              /></div>

          <div className="np-dimmable" data-disabled={enabled ? 'false' : 'true'} aria-disabled={!enabled} inert={!enabled}>
            <NpCollapsibleSection title={t('Content shown')}>
              <NpToggleRow title={t('Email')} checked={footer.showEmail !== false} onChange={(showEmail) => onChange({ showEmail })} />
              <NpToggleRow title={t('Phone')} checked={footer.showPhone !== false} onChange={(showPhone) => onChange({ showPhone })} />
              {designShows.location || miniBarOn ? (
                <NpToggleRow title={t('Location')} checked={footer.showLocation !== false} onChange={(showLocation) => onChange({ showLocation })} />
              ) : null}
              {designShows.hours || miniBarOn ? (
                <NpToggleRow title={t('Hours')} checked={footer.showHours !== false} onChange={(showHours) => onChange({ showHours })} />
              ) : null}
              {designShows.copyright || miniBarOn ? (
                <NpToggleRow title={t('Copyright')} checked={footer.showCopyright !== false} onChange={(showCopyright) => onChange({ showCopyright })} />
              ) : null}
              {designShows.marketplace ? (
                <NpToggleRow title={t('Marketplace link')} checked={footer.showMarketplaceLink === true} onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })} />
              ) : null}
            </NpCollapsibleSection>

            <NpCollapsibleSection title={t('Style')}>
              
              <TextSizeSlider
                label={t('Text size')}
                options={PORTFOLIO_FOOTER_PREMIUM_FONT_SIZE_OPTIONS}
                value={footer.premiumFontSize ?? 'medium'}
                onChange={(premiumFontSize) => onChange({ premiumFontSize })}
              />
            </NpCollapsibleSection>

            <NpCollapsibleSection title={t('Mini bottom bar')}>
              <NpToggleRow
                title={t('Show mini bottom bar')}
                description={t('An independent, edge-to-edge bar below the Footer — works with every design.')}
                checked={miniBarOn}
                onChange={(showMiniBar) => onChange({ showMiniBar })}
              />
              {miniBarOn ? (
                <FooterMiniBarDesignGrid value={footer.miniBarDesign} onChange={(miniBarDesign) => onChange({ miniBarDesign })} />
              ) : null}
            </NpCollapsibleSection>

          </div>
        </div>
      ) : null}

      {subSection !== 'general' && !enabled ? <FooterHiddenNotice onEnable={enable} /> : null}

      {subSection === 'design' && enabled ? (
        designCatalogOpen ? (
          /* Browsing the catalogue is a task of its own: it takes the whole tab, like Navigation › Layout. */
          <FooterDesignChoiceGrid
            showGrid
            setShowGrid={setDesignCatalogOpen}
            value={footer.design}
            onChange={(design) => onChange(footerDesignPatch(design, footer))}
          />
        ) : (
          <div className="np-stack">
              <FooterDesignChoiceGrid
                showGrid={false}
                setShowGrid={setDesignCatalogOpen}
                value={footer.design}
                onChange={(design) => onChange(footerDesignPatch(design, footer))}
              />
            <FooterContactLinkOptionsContext.Provider value={contactLinkOptions}>
              <FooterLayoutSettingsSections
                footer={footer}
                sectionLinkOptions={sectionLinkOptions}
                profileAvatarUrl={profileAvatarUrl}
                onChange={onChange}
              />
            </FooterContactLinkOptionsContext.Provider>

            {footer.design === 'contact-card' ? (
              <NpCollapsibleSection title={t('Contact card')}>
                <FooterContactCardColorField footer={footer} onChange={onChange} />
              </NpCollapsibleSection>
            ) : null}

          </div>
        )
      ) : null}

      {subSection === 'header' && enabled ? (
        <div className="np-stack">
          <div className="np-stack">
            <FooterHeaderDesignGrid
              value={headerDesign}
              onChange={(next) => onChange({ headerDesign: next })}
              open={headerCatalogOpen}
              onOpenChange={setHeaderCatalogOpen}
            />
            {!headerCatalogOpen && headerDesign === 'none' ? (
              <p className="np-note">
                {t('No header is shown above the footer — the section’s own layout starts right away.')}
              </p>
            ) : null}
          </div>

          {/* Browsing the catalogue is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen || headerDesign === 'none' ? null : (
            <Fragment key={headerDesign}>
              <NpCollapsibleSection title={t('Content')}>
                <FooterHeaderElementEditor design={headerDesign} footer={footer} onChange={onChange} />
              </NpCollapsibleSection>

              {headerTitleStyle ? (
                <NpCollapsibleSection title={t('Title style')}>
                  <FooterAlignmentControl
                    value={footer.headerDesignAlignment ?? 'left'}
                    onChange={(headerDesignAlignment) => onChange({ headerDesignAlignment })}
                  />
                  {headerTitleStyle.sizeAndWeight ? (
                    <>
                      <FooterScaleControl
                        label={t('Title size')}
                        steps={FOOTER_HEADER_SIZE_STEPS}
                        value={footer.headerTitleSize ?? 'xl'}
                        onChange={(headerTitleSize) => onChange({ headerTitleSize })}
                      />
                      <FooterScaleControl
                        label={t('Title weight')}
                        steps={FOOTER_HEADER_WEIGHT_STEPS}
                        value={footer.headerTitleWeight ?? 'bold'}
                        onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
                        stepStyle={(step) => ({
                          fontWeight: FOOTER_HEADER_WEIGHT_STEPS.find((item) => item.value === step)?.fontWeight,
                        })}
                      />
                    </>
                  ) : null}
                </NpCollapsibleSection>
              ) : null}

              {/* Rarely touched: folded, like Global's Preferences. */}
              <NpCollapsibleSection title={t('Spacing')} defaultOpen={false}>
                <FooterScaleControl
                  label={t('Space above the title')}
                  steps={FOOTER_SPACING_OPTIONS}
                  value={footer.headerPaddingTop ?? 'none'}
                  onChange={(headerPaddingTop) => onChange({ headerPaddingTop })}
                />
                <FooterScaleControl
                  label={t('Space below the title')}
                  steps={FOOTER_SPACING_OPTIONS}
                  value={footer.headerPaddingBottom ?? 'none'}
                  onChange={(headerPaddingBottom) => onChange({ headerPaddingBottom })}
                />
                <FooterScaleControl
                  label={t('Gap before the footer')}
                  steps={FOOTER_SPACING_OPTIONS}
                  value={footer.headerMarginBottom ?? 'md'}
                  onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
                />
              </NpCollapsibleSection>
            </Fragment>
          )}
        </div>
      ) : null}

      {subSection === 'background' && enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={footer.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={backgroundTheme.mode}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
            <SectionBackgroundSettingsFields
              settings={footer}
              onChange={onChange}
              renderColorField={({ label, value, onChange: onColorChange }) => {
                const slot = Object.entries(FOOTER_BACKGROUND_LABEL_SLOTS).find(([key]) => t(key) === label)?.[1];
                const options = ([['fond', 'Background'], ['neutre', 'Surface'], ['principal', 'Primary'], ['secondaire', 'Secondary'], ['texteFort', 'Strong text']] as const).map(([token, text]) => ({ value: token, label: t(text), color: backgroundPalette[token] }));
                const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
                return <ColorSwatchRow label={label} options={options} value={slot ? bindings[slot] : options.find(option => option.color.toLowerCase() === value.toLowerCase())?.value ?? ''} onChange={token => {
                  if (slot) onChange({ useHeroPalette: true, footerPalette: backgroundPalette, ...asFooterPatch(patchFooterColorBinding({ ...footer, footerPalette: backgroundPalette }, slot, token as HeroPaletteTokenId)) });
                  else { const option = options.find(option => option.value === token); if (option) onColorChange(option.color); }
                }} />;
              }}
            />
            {footer.sectionBackgroundEnabled ? (
              <NpToggleRow
                title={t('Unify header background')}
                checked={footer.headerBackgroundUnified === true}
                onChange={(headerBackgroundUnified) => onChange({ headerBackgroundUnified })}
              />
            ) : null}
          </NpCollapsibleSection>
        </div>
      ) : null}
    </NpPanelShell>
  );
}

/** What picking a footer design also resets — designs that reorganise their content start clean. */
function footerDesignPatch(
  design: PortfolioFooterDesign,
  footer: PortfolioFooterSectionSettings
): Partial<PortfolioFooterSectionSettings> {
  if (design === 'centered-minimal') {
    return {
      design,
      showBrand: true,
      showDescription: false,
      showContactLinks: true,
      showContactCta: false,
      showMarketplaceLink: false,
      showCopyright: true,
      showDesignCredit: false,
      showTopBorder: false,
      showContentDivider: true,
      showEmail: true,
      showPhone: true,
      showLocation: false,
      showHours: false,
      showContactIcons: true,
    };
  }
  if (design === 'contact-card' || design === 'landing') {
    const existing = footer.linkColumns ?? [];
    const useDefaults = existing.length === 0 || isLegacyLandingMarketingColumns(existing);
    const linkColumns = useDefaults
      ? DEFAULT_FOOTER_LINK_COLUMNS.map((col) => ({ ...col, links: col.links.map((link) => ({ ...link })) }))
      : existing;
    if (design === 'contact-card') {
      return {
        design,
        showBrand: true,
        showDescription: false,
        showContactLinks: true,
        showCopyright: true,
        showDesignCredit: false,
        showMarketplaceLink: false,
        showLandingMarketplaceLink: false,
        showMarketplaceColumnLink: false,
        showNopbProfileLink: false,
        showEmail: true,
        showPhone: true,
        showLocation: true,
        showHours: false,
        showContactIcons: true,
        showContactCta: false,
        linkColumns,
      };
    }
    return {
      design,
      showBrand: true,
      showDescription: true,
      showContactLinks: true,
      showCopyright: true,
      showDesignCredit: false,
      showMarketplaceLink: false,
      showLandingMarketplaceLink: false,
      showMarketplaceColumnLink: false,
      showNopbProfileLink: false,
      showProfileVisits: false,
      showEmail: true,
      showPhone: true,
      showLocation: true,
      showHours: true,
      contactIconSize: 'lg',
      landingBrandGapPx: DEFAULT_FOOTER_LANDING_BRAND_GAP_PX,
      linkColumns,
    };
  }
  return { design };
}
