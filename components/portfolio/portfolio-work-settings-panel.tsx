'use client';
import { TextSizeSlider } from './portfolio-text-size-slider';
import { WorkBoardControls } from './portfolio-work-board-controls';
import { WorkAccordionControls } from './portfolio-work-accordion-controls';
import { WorkFramesControls } from './portfolio-work-frames-controls';
import { WorkIndexControls } from './portfolio-work-index-controls';
import { WorkGridControls } from './portfolio-work-grid-controls';
import { WorkSplitControls } from './portfolio-work-split-controls';
import { WorkCarouselControls } from './portfolio-work-carousel-controls';
import { WorkShowcaseControls } from './portfolio-work-showcase-controls';
import { WorkLedgerControls } from './portfolio-work-ledger-controls';
import { WorkSpecControls } from './portfolio-work-spec-controls';
import { WorkCaseControls } from './portfolio-work-case-controls';
import { WorkPressControls } from './portfolio-work-press-controls';
import { WorkDuotoneControls } from './portfolio-work-duotone-controls';
import { WorkCascadeControls } from './portfolio-work-cascade-controls';
import { PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS, PORTFOLIO_WORK_SPEC_FRAME_OPTIONS } from './portfolio-work-settings';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { WorkDesignIllustration } from './portfolio-work-design-illustration';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {StackPreviewSkeleton} from './portfolio-stack-preview-skeleton';
import {StackHeaderSkeleton} from './portfolio-stack-header-skeleton';
import {useThumbnailTheme} from './portfolio-thumbnail-theme';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import { useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS, workSectionDesignSettingsPatch, DEFAULT_WORK_PRESENTATION, DEFAULT_PROJECTS_BOARD_SETTINGS, DEFAULT_PROJECTS_ACCORDION_SETTINGS, DEFAULT_PROJECTS_FRAMES_SETTINGS, DEFAULT_PROJECTS_INDEX_SETTINGS, DEFAULT_PROJECTS_GRID_SETTINGS, DEFAULT_PROJECTS_SPLIT_SETTINGS, DEFAULT_PROJECTS_CAROUSEL_SETTINGS, DEFAULT_PROJECTS_SHOWCASE_SETTINGS, DEFAULT_PROJECTS_LEDGER_SETTINGS, DEFAULT_PROJECTS_SPEC_SETTINGS, DEFAULT_PROJECTS_CASE_SETTINGS, DEFAULT_PROJECTS_PRESS_SETTINGS, PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS, PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS, DEFAULT_PROJECTS_CASCADE_SETTINGS, WORK_PALETTE_TOKEN_OPTIONS, WORK_BILLBOARD_WORD_STYLE_OPTIONS, WORK_ACCENT_COUNT_ALIGNMENT_OPTIONS, workPaletteTokenColor, resolveWorkSectionTitle, resolveWorkSectionSubtitle, type PortfolioWorkHeaderDesign, type PortfolioWorkSectionDesign, type PortfolioWorkSectionSettings } from '@/components/portfolio/portfolio-work-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import {
  DEFAULT_WORK_COLOR_BINDINGS,
  DEFAULT_WORK_PALETTE,
  mergeWorkColorBindings,
  mergeWorkPalette,
  patchWorkColorBinding,
  patchWorkColorField,
  patchWorkColorFieldManual,
  type WorkColorSlot,
} from '@/components/portfolio/portfolio-work-palette-settings';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpPanelShell,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';

export type WorkSettingsSubSection =
  | 'general'
  | 'header'
  | 'design'
  | 'background'
  /** @deprecated Categories / Cards / Media / Title / Description / Tools / CTA / Palette now live under Design */
  | 'categories'
  | 'cards'
  | 'media'
  | 'title'
  | 'description'
  | 'tools'
  | 'cta'
  | 'palette'
  /** @deprecated Prefer Design */
  | 'style';

const WORK_SETTINGS_SUB_SECTIONS: {
  id: Exclude<WorkSettingsSubSection, 'style' | 'categories' | 'cards' | 'media' | 'title' | 'description' | 'tools' | 'cta' | 'palette'>;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: msg('General'),
    description: msg('Content is edited in Creator Studio → Information — this tab only controls visibility & presentation.'),
  },
  {
    id: 'design',
    label: msg('Design'),
    description: msg('Named Portfolio layouts — projects board, accordion, frames, and more.'),
  },
  { id: 'header', label: msg('Header'), description: msg('Title and subtitle presets, fonts, and colors.') },
  { id: 'background', label: msg('Background'), description: msg('Section fill, gradients, and opacity.') },
];

/** Map legacy subsection ids (saved UI state / search) to the current 4-tab menu. */
export function normalizeWorkSettingsSubSection(value: string | undefined): WorkSettingsSubSection {
  if (value === 'general' || value === 'header' || value === 'design' || value === 'background') {
    return value;
  }
  if (
    value === 'style' ||
    value === 'categories' ||
    value === 'cards' ||
    value === 'media' ||
    value === 'title' ||
    value === 'description' ||
    value === 'tools' ||
    value === 'cta' ||
    value === 'palette'
  ) {
    return 'design';
  }
  return 'general';
}

const WORK_BACKGROUND_LABEL_SLOTS: Record<string, WorkColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asWorkPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioWorkSectionSettings> {
  return patch as Partial<PortfolioWorkSectionSettings>;
}

const WORK_BACKGROUND_SWATCH_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
];

/** Shared five-role background palette; identical colors are grouped by ColorSwatchRow. */
function WorkBackgroundColorField({
  work,
  onChange,
  slot,
  label,
  value,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  slot: WorkColorSlot;
  label: string;
  value: string;
}) {
  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const usingPalette = work.useHeroPalette !== false;
  const options = WORK_BACKGROUND_SWATCH_TOKENS.map((token) => ({
    value: token.value as string,
    label: token.label,
    color: resolveHeroPaletteColor(palette, token.value),
  }));
  const current = usingPalette
    ? (bindings[slot] as string)
    : (options.find((option) => option.color.toLowerCase() === value.trim().toLowerCase())?.value ?? '');
  return (
    <ColorSwatchRow
      label={label}
      options={options}
      value={current}
      onChange={(next) => {
        const token = next as HeroPaletteTokenId;
        onChange(
          asWorkPatch(
            usingPalette
              ? patchWorkColorBinding(work, slot, token)
              : patchWorkColorField(work, slot, resolveHeroPaletteColor(palette, token))
          )
        );
      }}
    />
  );
}

function WorkColorField({
  work,
  onChange,
  slot,
  label,
  description,
  value,
  allowManualHex = false,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  slot: WorkColorSlot;
  label: string;
  description?: string;
  value: string;
  /** When palette is on, also show a hex picker that overrides the token until rebound. */
  allowManualHex?: boolean;
}) {
  const t = useT();
  const paletteOn = work.useHeroPalette !== false;
  const isManualOverride =
    (slot === 'contentFrameBackground' && work.contentFrameBackgroundManual) ||
    (slot === 'contentFrameBorder' && work.contentFrameBorderManual) ||
    (slot === 'overlayBottomRule' && work.overlayBottomRuleManual);

  if (!paletteOn) {
    return (
      <WorkManualColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => onChange(asWorkPatch(patchWorkColorField(work, slot, hex)))}
      />
    );
  }

  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const token = bindings[slot];
    return (
    <div className="np-field">
      <div className="np-stack !gap-3">
        {description ? <p className="np-subtle">{description}</p> : null}
        <ColorSwatchRow
          label={label}
          options={PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
            color: resolveHeroPaletteColor(palette, option.value),
          }))}
          value={isManualOverride ? '' : token}
          onChange={(next) => onChange(asWorkPatch(patchWorkColorBinding(work, slot, next as HeroPaletteTokenId)))}
        />
        {!allowManualHex ? (
          <p className="np-help">
            {t('Bound to token · edit hex under')}{' '}
            <span className="font-semibold">{t('Global → Theme')}</span>
          </p>
        ) : (
          <p className="np-help">
            {t('Token palette')}{isManualOverride ? t('· manual override on') : ''} {t('· change the token to resync.')}
          </p>
        )}
      {allowManualHex ? (
        <WorkManualColorField
          label={t('Manual colour')}
          description={t('Hex independent of the token. Changing the token above cancels the override.')}
          value={value}
          onChange={(hex) => onChange(asWorkPatch(patchWorkColorFieldManual(work, slot, hex)))}
        />
      ) : null}
    </div>
    </div>
  );
}

function WorkManualColorField({
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
    <div className="np-field">
      <p className="np-field-label">{label}</p>
      {description ? <p className="np-subtle -mt-1 mb-3">{description}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="np-color-input h-11 w-14 cursor-pointer"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="np-input w-28 font-mono"
          aria-label={`${label} hex`}
        />
        <span
          className="h-11 w-20 rounded-xl border border-[color:var(--np-border)] shadow-inner"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function WorkToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <NpToggleRow
      title={label}
      checked={checked}
      onChange={onChange}
    />
  );
}

function WorkOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns: _columns = 2,
  icons: _icons,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3 | 4;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const t = useT();
  return (
    <NpSegmentedControl
      label={label}
      value={String(value)}
      options={options.map((option) => ({ value: String(option.value), label: t(option.label), title: t(option.description) }))}
      onChange={(next) => {
        const option = options.find((item) => String(item.value) === next);
        if (option) onChange(option.value);
      }}
    />
  );
}

/** Ordered/continuous-scale control (size, spacing) — a single drag surface snapping
 *  between the option's discrete steps, with the current step named live. */
function WorkSlider<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const t = useT();
  if (options.length > 4) {
    return (
      <div className="np-field">
        <p className="np-field-label">{label}</p>
        <div className="np-chips" role="group" aria-label={label}>
          {options.map((option) => (
            <button key={option.value} type="button" className="np-chip" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
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
      value={value}
      options={options.map((option) => ({ value: option.value, label: t(option.label) }))}
      onChange={onChange}
    />
  );
}


/** Wraps the per-layout settings body, remounted (via `motionKey`) so switching the
 *  chosen Portfolio layout cross-fades/slides the settings body in. */
function WorkLayoutSettingsBand({
  children,
  motionKey,
  title,
}: {
  children: ReactNode;
  motionKey: string;
  title?: string;
}) {
  const t = useT();
  if (!children) return null;
  if (['projects-board','projects-accordion','projects-frames','projects-index','projects-grid','projects-split','projects-carousel','projects-showcase','projects-ledger','projects-spec','projects-case','projects-press'].includes(motionKey)) return <div key={motionKey}>{children}</div>;
  const resolvedTitle = title ?? t(motionKey === 'projects-index' ? 'Layout' : 'Design settings');
  return (
    <NpCollapsibleSection title={resolvedTitle}>
      <div key={motionKey} className="np-stack">
        {children}
      </div>
    </NpCollapsibleSection>
  );
}

/** N evenly spaced bars — glyph for "columns per row" preview cards. */
function workColumnsGlyph(n: 1 | 2 | 3 | 4): ReactNode {
  const gap = 4;
  const totalWidth = 48;
  const startX = 8;
  const barWidth = (totalWidth - gap * (n - 1)) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="pf-work-mini-ink"
          x={startX + i * (barWidth + gap)}
          y={8}
          width={barWidth}
          height={18}
          rx={2}
        />
      ))}
    </>
  );
}

/** Media-on-left / media-on-right glyphs for the various image-side pickers. */
function workSideLeftGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-work-mini-ink" x="8" y="9" width="22" height="16" rx="2" />
      <rect className="pf-work-mini-mute" x="36" y="10" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="36" y="16" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="36" y="22" width="14" height="3" rx="1.5" />
    </>
  );
}

function workSideRightGlyph(): ReactNode {
  return (
    <>
      <rect className="pf-work-mini-mute" x="8" y="10" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="8" y="16" width="20" height="3" rx="1.5" />
      <rect className="pf-work-mini-mute" x="8" y="22" width="14" height="3" rx="1.5" />
      <rect className="pf-work-mini-ink" x="34" y="9" width="22" height="16" rx="2" />
    </>
  );
}

/** Mini swatch for a palette-token color picker — the actual resolved color,
 *  not just a text label. */
/** Work stores its header texts / styles under their own keys (`indexLabelText`, `marqueeSize`…):
 *  this maps the shared Header fields' `headerXxx` keys onto them, so the tab is the shared one. */
const WORK_HEADER_KEY_EXCEPTIONS: Record<string, string> = {
  headerDesignAlignment: 'headerAlignment',
  headerEditorialTitleSize: 'headerTitleSize',
  headerEditorialTitleWeight: 'headerTitleWeight',
};
const WORK_HEADER_KEPT_KEYS = new Set([
  'headerDesign',
  'headerHiddenElements',
  'headerMarginBottom',
  'headerTitleSize',
  'headerTitleWeight',
  'headerAlignment',
]);

function workHeaderKey(key: string): string {
  if (WORK_HEADER_KEY_EXCEPTIONS[key]) return WORK_HEADER_KEY_EXCEPTIONS[key];
  if (WORK_HEADER_KEPT_KEYS.has(key)) return key;
  const match = /^header([A-Z][A-Za-z0-9]*)$/.exec(key);
  return match ? match[1]!.charAt(0).toLowerCase() + match[1]!.slice(1) : key;
}

function WorkHeaderDesignFields({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  const t = useT();
  const view = new Proxy(work as object, {
    get: (target, prop) => (typeof prop === 'string' ? (target as Record<string, unknown>)[workHeaderKey(prop)] : undefined),
  });
  const copy: HeaderCopy = {
    editorial: {
      label: t('Portfolio'),
      title: workSectionTitlePlaceholder(work),
      subtitle: workSectionSubtitlePlaceholder(work),
    },
    index: { rule: t('Index'), title: t('Selected work'), subtitle: t('Selected projects.'), count: t('Projects') },
    marquee: [t('Selected'), t('Work'), t('Optional'), t('Optional')],
    accent: { badge: t('{count}+ projects'), lead: t('A selection of recent work.') },
    serif: { label: t('Portfolio'), title: t('A curated collection of work, built with care.'), subtitle: workSectionSubtitlePlaceholder(work) },
    billboard: { word: 'WORK', title: t('Selected work'), count: t('{count} projects') },
    masthead: [t('Selected work.'), t('Crafted with intent.'), t('Delivered with care.')],
    split: { title: t('Selected work'), label: t('Portfolio') },
  };
  return (
    <HeaderDesignFields
      settings={view}
      onPatch={(patch: HeaderPatch) => {
        const mapped: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(patch)) mapped[workHeaderKey(key)] = value;
        onChange(mapped as Partial<PortfolioWorkSectionSettings>);
      }}
      copy={copy}
      colorOptions={WORK_PALETTE_TOKEN_OPTIONS}
      resolveColor={workPaletteTokenColor}
      accentAlignmentOptions={WORK_ACCENT_COUNT_ALIGNMENT_OPTIONS}
      billboardStyleOptions={WORK_BILLBOARD_WORD_STYLE_OPTIONS}
    />
  );
}

/** Placeholders for the Editorial header's text fields — what shows when left empty. */
function workSectionTitlePlaceholder(work: PortfolioWorkSectionSettings): string {
  return resolveWorkSectionTitle(work) || 'Portfolio';
}

function workSectionSubtitlePlaceholder(work: PortfolioWorkSectionSettings): string {
  return resolveWorkSectionSubtitle(work);
}

/** Mini wireframes for the 14 "Section design" picker cards. */

/** The main "Section design" picker — collapses to the selected design; click to expand and change. */
function WorkDesignChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioWorkSectionDesign;onChange:(value:PortfolioWorkSectionDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const selected=PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return (
  <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>
   {PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.map(option => (
    <DesignCatalogueCard key={option.value} label={t(option.label)} selected={value === option.value}
     onSelect={() => onChange(option.value)}
     onCustomize={() => { if (value !== option.value) onChange(option.value); setShowGrid(false); }}>
     <span className="block aspect-[16/9] w-full overflow-hidden rounded-lg">
      <WorkDesignIllustration design={option.value} />
     </span>
    </DesignCatalogueCard>
   ))}
  </div>
 );
}


/** Same large, theme-aware header anatomy used by Stack and Info. */
function WorkHeaderWireframe({ design }: { design: PortfolioWorkHeaderDesign }) {
  return <StackPreviewSkeleton section="work"><StackHeaderSkeleton design={design} compact word="WORK" title="Selected work" lead="Selected" count="04"/></StackPreviewSkeleton>;
}

/** The "Header design" picker — one shared, GSAP-animated header applied above every layout. */
function WorkHeaderChoiceGrid({value,onChange,open:showGrid,onOpenChange:setShowGrid}:{value:PortfolioWorkHeaderDesign;onChange:(value:PortfolioWorkHeaderDesign)=>void;open:boolean;onOpenChange:(open:boolean)=>void}){
 const t=useT();
 const previewSource=usePortfolioDesignPreviewSource();
 const theme=useThumbnailTheme('work');
 const selected=PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS.find(option=>option.value===value)??PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS[0];
 if(!showGrid)return <NpBackRow title={t(selected.label)} onBack={()=>setShowGrid(true)}/>;
 return <div className="flex flex-col gap-8" aria-label={t('Choose a header')}>{PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS.map(option=>{
  if(option.value==='none')return <button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)} className="flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm font-medium transition-colors hover:bg-neutral-500/5 focus-visible:outline-2 focus-visible:outline-offset-2" style={{borderColor:value===option.value?'var(--pf-palette-principal,#f97316)':'color-mix(in srgb,currentColor 18%,transparent)'}}>{t(option.label)}</button>;
  const skeleton=<WorkHeaderWireframe design={option.value}/>;
  return <PortfolioHeaderDesignOption key={option.value} design={option.value}><DesignCatalogueCard label={t(option.label)} selected={value===option.value} previewBackground={theme.background} onSelect={()=>onChange(option.value)} onCustomize={()=>{if(value!==option.value)onChange(option.value);setShowGrid(false);}}><span className="relative block aspect-[3/1] w-full" style={{backgroundColor:theme.background}}>{previewSource?<PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'workHeader',design:option.value})+'&previewRevision=work-header-compact-v4'} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={skeleton} animateSkeleton={false} backgroundColor={theme.background}/>:skeleton}</span></DesignCatalogueCard></PortfolioHeaderDesignOption>;
 })}</div>;
}


function WorkLayoutDisplayOptions({work,onChange}: {work:PortfolioWorkSectionSettings;onChange:(patch:Partial<PortfolioWorkSectionSettings>)=>void;inline?:boolean}) {
 const t=useT();
 switch(work.sectionDesign??'projects-board') {
 case 'projects-board': { const settings={...DEFAULT_PROJECTS_BOARD_SETTINGS,...work.projectsBoard}; return <>{<WorkToggleRow key="showThumbnail" label={t('Thumbnails')} checked={settings.showThumbnail !== false} onChange={showThumbnail=>onChange({projectsBoard:{...settings,showThumbnail}})}/>}
{<WorkToggleRow key="showRole" label={t('Role')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsBoard:{...settings,showRole}})}/>}
{<WorkToggleRow key="showCategory" label={t('Category')} checked={settings.showCategory !== false} onChange={showCategory=>onChange({projectsBoard:{...settings,showCategory}})}/>}
{<WorkToggleRow key="showConsultOnHover" label={t('Case study link')} checked={settings.showConsultOnHover !== false} onChange={showConsultOnHover=>onChange({projectsBoard:{...settings,showConsultOnHover}})}/>}</>; }
case 'projects-accordion': { const settings={...DEFAULT_PROJECTS_ACCORDION_SETTINGS,...work.projectsAccordion}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsAccordion:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRoleInPanel" label={t('Role')} checked={settings.showRoleInPanel !== false} onChange={showRoleInPanel=>onChange({projectsAccordion:{...settings,showRoleInPanel}})}/>}
{<WorkToggleRow key="showCategoryInPanel" label={t('Category')} checked={settings.showCategoryInPanel !== false} onChange={showCategoryInPanel=>onChange({projectsAccordion:{...settings,showCategoryInPanel}})}/>}
{<WorkToggleRow key="showTools" label={t('Tools')} checked={settings.showTools !== false} onChange={showTools=>onChange({projectsAccordion:{...settings,showTools}})}/>}
{settings.showTools ? <WorkToggleRow key="showToolsLabel" label={t('Tools label')} checked={settings.showToolsLabel !== false} onChange={showToolsLabel=>onChange({projectsAccordion:{...settings,showToolsLabel}})}/> : null}
{<WorkToggleRow key="showConsult" label={t('Case study link')} checked={settings.showConsult !== false} onChange={showConsult=>onChange({projectsAccordion:{...settings,showConsult}})}/>}</>; }
case 'projects-frames': { const settings={...DEFAULT_PROJECTS_FRAMES_SETTINGS,...work.projectsFrames}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsFrames:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRole" label={t('Role')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsFrames:{...settings,showRole}})}/>}
{<WorkToggleRow key="showCategory" label={t('Category')} checked={settings.showCategory !== false} onChange={showCategory=>onChange({projectsFrames:{...settings,showCategory}})}/>}
{<WorkToggleRow key="showStack" label={t('Tools')} checked={settings.showStack !== false} onChange={showStack=>onChange({projectsFrames:{...settings,showStack}})}/>}
{<WorkToggleRow key="showConsult" label={t('Case study link')} checked={settings.showConsult !== false} onChange={showConsult=>onChange({projectsFrames:{...settings,showConsult}})}/>}</>; }
case 'projects-grid': { const settings={...DEFAULT_PROJECTS_GRID_SETTINGS,...work.projectsGrid}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsGrid:{...settings,showDescription}})}/>}</>; }
case 'projects-split': { const settings={...DEFAULT_PROJECTS_SPLIT_SETTINGS,...work.projectsSplit}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsSplit:{...settings,showDescription}})}/>}</>; }
case 'projects-showcase': { const settings={...DEFAULT_PROJECTS_SHOWCASE_SETTINGS,...work.projectsShowcase}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsShowcase:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRole" label={t('Role on media')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsShowcase:{...settings,showRole}})}/>}
{<WorkToggleRow key="showCategory" label={t('Category')} checked={settings.showCategory !== false} onChange={showCategory=>onChange({projectsShowcase:{...settings,showCategory}})}/>}</>; }
case 'projects-ledger': { const settings={...DEFAULT_PROJECTS_LEDGER_SETTINGS,...work.projectsLedger}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsLedger:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRole" label={t('Role')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsLedger:{...settings,showRole}})}/>}
{<WorkToggleRow key="showStack" label={t('Tools')} checked={settings.showStack !== false} onChange={showStack=>onChange({projectsLedger:{...settings,showStack}})}/>}
{<WorkToggleRow key="showConsult" label={t('Case study link')} checked={settings.showConsult !== false} onChange={showConsult=>onChange({projectsLedger:{...settings,showConsult}})}/>}</>; }
case 'projects-spec': { const settings={...DEFAULT_PROJECTS_SPEC_SETTINGS,...work.projectsSpec}; return <>{<WorkToggleRow key="showThumbnail" label={t('Thumbnails')} checked={settings.showThumbnail !== false} onChange={showThumbnail=>onChange({projectsSpec:{...settings,showThumbnail}})}/>}
{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsSpec:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRole" label={t('Role')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsSpec:{...settings,showRole}})}/>}
{<WorkToggleRow key="showCategory" label={t('Category')} checked={settings.showCategory !== false} onChange={showCategory=>onChange({projectsSpec:{...settings,showCategory}})}/>}
{<WorkToggleRow key="showStack" label={t('Tools')} checked={settings.showStack !== false} onChange={showStack=>onChange({projectsSpec:{...settings,showStack}})}/>}
{<WorkToggleRow key="showFieldLabels" label={t('Field labels')} checked={settings.showFieldLabels !== false} onChange={showFieldLabels=>onChange({projectsSpec:{...settings,showFieldLabels}})}/>}
{<WorkToggleRow key="showConsult" label={t('Case study link')} checked={settings.showConsult !== false} onChange={showConsult=>onChange({projectsSpec:{...settings,showConsult}})}/>}</>; }
case 'projects-case': { const settings={...DEFAULT_PROJECTS_CASE_SETTINGS,...work.projectsCase}; return <>{<WorkToggleRow key="showThumbnail" label={t('Thumbnails')} checked={settings.showThumbnail !== false} onChange={showThumbnail=>onChange({projectsCase:{...settings,showThumbnail}})}/>}
{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsCase:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRole" label={t('Role')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsCase:{...settings,showRole}})}/>}
{<WorkToggleRow key="showCategory" label={t('Category')} checked={settings.showCategory !== false} onChange={showCategory=>onChange({projectsCase:{...settings,showCategory}})}/>}
{<WorkToggleRow key="showStack" label={t('Tools')} checked={settings.showStack !== false} onChange={showStack=>onChange({projectsCase:{...settings,showStack}})}/>}
{<WorkToggleRow key="showFieldLabels" label={t('Field labels')} checked={settings.showFieldLabels !== false} onChange={showFieldLabels=>onChange({projectsCase:{...settings,showFieldLabels}})}/>}
{<WorkToggleRow key="showConsult" label={t('Case study link')} checked={settings.showConsult !== false} onChange={showConsult=>onChange({projectsCase:{...settings,showConsult}})}/>}</>; }
case 'projects-cascade': { const settings={...DEFAULT_PROJECTS_CASCADE_SETTINGS,...work.projectsCascade}; return <>{<WorkToggleRow key="showDescription" label={t('Project description')} checked={settings.showDescription !== false} onChange={showDescription=>onChange({projectsCascade:{...settings,showDescription}})}/>}
{<WorkToggleRow key="showRole" label={t('Role')} checked={settings.showRole !== false} onChange={showRole=>onChange({projectsCascade:{...settings,showRole}})}/>}
{<WorkToggleRow key="showCategory" label={t('Category')} checked={settings.showCategory !== false} onChange={showCategory=>onChange({projectsCascade:{...settings,showCategory}})}/>}
{<WorkToggleRow key="showTools" label={t('Tools')} checked={settings.showTools !== false} onChange={showTools=>onChange({projectsCascade:{...settings,showTools}})}/>}
{<WorkToggleRow key="showTags" label={t('Tags')} checked={settings.showTags !== false} onChange={showTags=>onChange({projectsCascade:{...settings,showTags}})}/>}
{<WorkToggleRow key="showLink" label={t('Case study link')} checked={settings.showLink !== false} onChange={showLink=>onChange({projectsCascade:{...settings,showLink}})}/>}</>; }
 default: return null;
 }
}

const DEFAULT_WORK_SECTION_SETTINGS: PortfolioWorkSectionSettings = {
  enabled: true,
  title: 'Portfolio',
  subtitle: 'Selected projects.',
  ...DEFAULT_WORK_PRESENTATION,
};

function workSettingsModified(work: PortfolioWorkSectionSettings) {
  const keys = Object.keys({ ...DEFAULT_WORK_SECTION_SETTINGS, ...work }) as (
    keyof PortfolioWorkSectionSettings
  )[];
  return keys.some((key) => {
    const current = work[key] === undefined ? DEFAULT_WORK_SECTION_SETTINGS[key] : work[key];
    return JSON.stringify(current) !== JSON.stringify(DEFAULT_WORK_SECTION_SETTINGS[key]);
  });
}

function WorkHiddenNotice({ onEnable }: { onEnable: () => void }) {
  const t = useT();
  return (
    <div className="np-toggle-card flex-col !items-stretch gap-4">
      <div>
        <p className="np-card-title">{t('Portfolio section is hidden')}</p>
        <p className="np-subtle mt-1">{t('Enable it to edit this tab and show it in the portfolio.')}</p>
      </div>
      <button type="button" className="np-primary-btn" onClick={onEnable}>
        {t('Show Portfolio section')}
      </button>
    </div>
  );
}

export function WorkSettingsPanel({
  work,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  chrome,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  subSection?: WorkSettingsSubSection;
  onSubSectionChange?: (value: WorkSettingsSubSection) => void;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<WorkSettingsSubSection>('general');
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const subSection = normalizeWorkSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if(previousSubSection !== subSection){
    setPreviousSubSection(subSection);
    if(subSection === 'design')setDesignCatalogOpen(true);
    if(subSection === 'header')setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: WorkSettingsSubSection) => {
    const next = normalizeWorkSettingsSubSection(value);
    if(next === 'design')setDesignCatalogOpen(true);
    if(next === 'header')setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const modified = workSettingsModified(work);
  return (
    <NpPanelShell
      title={t('Portfolio')}
      modified={modified}
      tabs={WORK_SETTINGS_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange({ ...DEFAULT_WORK_SECTION_SETTINGS })}
      chrome={chrome}
    >

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow
            card
            title={t('Show Portfolio section')}
            description={work.enabled ? undefined : t('Visitors go straight to the next section.')}
            checked={work.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <div className="pb-6"><SectionColorModeControl hideLabel
            label={t('Color mode')}
            value={work.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          /></div>
          <div className="np-dimmable" data-disabled={work.enabled ? 'false' : 'true'} aria-disabled={!work.enabled} inert={!work.enabled}>
          {/* Section-wide, shared by every design — so it lives with the other section switches. */}
          <NpCollapsibleSection title={t('Style')}>
            <TextSizeSlider label={t('Text size')}
              options={[{value:'small',label:'Small'},{value:'medium',label:'Medium'},{value:'large',label:'Large'},{value:'xlarge',label:'Extra large'}] as const}
              value={work.textSize??'medium'} onChange={textSize=>onChange({textSize})}/>
          </NpCollapsibleSection>

          <NpCollapsibleSection title={t('Content shown')}>
              {(!work.sectionDesign || work.sectionDesign === 'projects-board') ? <><NpToggleRow
                title={t('Project description')}
                checked={work.showCardDescription !== false}
                onChange={(showCardDescription) => onChange({ showCardDescription })}
              />
              <NpToggleRow
                title={t('Tools')}
                checked={work.showCardTools !== false}
                onChange={(showCardTools) => onChange({ showCardTools })}
              />
              </> : null}
              {work.sectionDesign === 'projects-index' ? <>
                <NpToggleRow
                  title={t('Stack')}
                  checked={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showStack !== false}
                  onChange={showStack => onChange({ projectsIndex: { ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS), showStack } })}
                />
                <NpToggleRow
                  title={t('Description')}
                  checked={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showDescription !== false}
                  onChange={showDescription => onChange({ projectsIndex: { ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS), showDescription } })}
                />
              </> : null}
              <WorkLayoutDisplayOptions work={work} onChange={onChange} inline />
          </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection !== 'general' && !work.enabled ? <WorkHiddenNotice onEnable={() => onChange({ enabled: true })} /> : null}

      {subSection === 'header' && work.enabled ? (
        headerCatalogOpen ? (
          <WorkHeaderChoiceGrid
            value={work.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open
            onOpenChange={setHeaderCatalogOpen}
          />
        ) : (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Header design')}>
            <WorkHeaderChoiceGrid
              value={work.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
              open={false}
              onOpenChange={setHeaderCatalogOpen}
            />
          </NpCollapsibleSection>

            {work.headerDesign === 'none' ? null : <NpCollapsibleSection title={t('Header settings')}>
              <WorkHeaderDesignFields work={work} onChange={onChange} />
            </NpCollapsibleSection>}
        </div>
        )
      ) : null}

      {subSection === 'design' && work.enabled ? (
        designCatalogOpen ? (
          <WorkDesignChoiceGrid
            value={work.sectionDesign ?? 'projects-board'}
            onChange={(sectionDesign) => onChange(workSectionDesignSettingsPatch(sectionDesign))}
            open
            onOpenChange={setDesignCatalogOpen}
          />
        ) : (
        <div className="np-stack">
            <WorkDesignChoiceGrid
              value={work.sectionDesign ?? 'projects-board'}
              onChange={(sectionDesign) => onChange(workSectionDesignSettingsPatch(sectionDesign))}
              open={false}
              onOpenChange={setDesignCatalogOpen}
            />
          {(work.sectionDesign === 'projects-duotone') ? <WorkDuotoneControls work={work} onChange={onChange}/> : work.sectionDesign === 'projects-cascade' ? <WorkCascadeControls work={work} onChange={onChange}/> : <WorkLayoutSettingsBand motionKey={work.sectionDesign ?? 'projects-board'}>
          {(work.sectionDesign ?? 'projects-board') === 'projects-board' ? (
            <WorkBoardControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-accordion' ? (
            <WorkAccordionControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-frames' ? (
            <WorkFramesControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-index' ? (
            <WorkIndexControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-grid' ? (
            <WorkGridControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-split' ? (
            <WorkSplitControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-carousel' ? (
            <WorkCarouselControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-showcase' ? (
            <WorkShowcaseControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-ledger' ? (
            <WorkLedgerControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-spec' ? (
            <WorkSpecControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-case' ? (
            <WorkCaseControls work={work} onChange={onChange}/>
          ) : (work.sectionDesign ?? 'projects-board') === 'projects-press' ? (
            <WorkPressControls work={work} onChange={onChange}/>
          ) : null}
</WorkLayoutSettingsBand>}
        </div>
        )
      ) : null}

      {subSection === 'background' && work.enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={work.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={work.colorModeOverride === 'light' ? 'light' : 'dark'}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={work}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              // Labels arrive translated: match them against the translated keys too.
              const slot =
                WORK_BACKGROUND_LABEL_SLOTS[label] ??
                Object.entries(WORK_BACKGROUND_LABEL_SLOTS).find(([key]) => t(key) === label)?.[1];
              if (!slot) {
                return (
                  <WorkManualColorField
                    label={label}
                    value={value}
                    onChange={onBgColorChange}
                  />
                );
              }
              return (
                <WorkBackgroundColorField
                  work={work}
                  onChange={onChange}
                  slot={slot}
                  label={label}
                  value={value}
                />
              );
            }}
          />
          </NpCollapsibleSection>
        </div>
      ) : null}
    </NpPanelShell>
  );
}
