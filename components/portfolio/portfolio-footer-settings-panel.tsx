'use client';

import { HeaderElementToggles } from '@/components/portfolio/portfolio-header-style-controls';
import {
  PortfolioDesignLivePreviewCard,
  usePortfolioDesignPreviewSource,
} from '@/components/portfolio/PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';
import { createContext, Fragment, useContext, useId, useState, type ReactNode } from 'react';
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
import { FooterHeroColumnsWireframe } from '@/components/portfolio/portfolio-footer-design-hero-columns';
import { FooterSplitFormWireframe } from '@/components/portfolio/portfolio-footer-design-split-form';
import { FooterTimezoneEditorialWireframe } from '@/components/portfolio/portfolio-footer-design-timezone-editorial';
import { FooterInvertedWordmarkWireframe } from '@/components/portfolio/portfolio-footer-design-inverted-wordmark';
import { FooterServicesRevealWireframe } from '@/components/portfolio/portfolio-footer-design-services-reveal';
import { FooterEditorialGridWireframe } from '@/components/portfolio/portfolio-footer-design-editorial-grid';
import { FooterHeadlineRevealWireframe } from '@/components/portfolio/portfolio-footer-design-headline-reveal';
import { FooterDispatchWireframe } from '@/components/portfolio/portfolio-footer-design-dispatch';
import { FooterCompactWireframe } from '@/components/portfolio/portfolio-footer-design-compact';
import { FooterCenteredMinimalWireframe } from '@/components/portfolio/portfolio-footer-design-centered-minimal';
import { FooterLandingWireframe } from '@/components/portfolio/portfolio-footer-design-landing';
import { FooterContactCardWireframe } from '@/components/portfolio/portfolio-footer-design-contact-card';
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
  type PortfolioFooterHeaderDesign,
  type PortfolioFooterHeaderTitleSize,
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
  NpPickerRow,
  NpSegmentedControl,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';
import { PORTFOLIO_SECTION_COLOR_MODE_OPTIONS } from '@/components/portfolio/portfolio-section-color-mode';

function FooterMinimalCtaWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-ink" x="8" y="12" width="30" height="6" rx="2" />
      <rect className="pf-stack-mini-mute" x="8" y="24" width="60" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="8" y="30" width="46" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-accent" x="8" y="40" width="26" height="8" rx="4" />
      <rect className="pf-stack-mini-mute" x="8" y="58" width="20" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x="32" y="58" width="20" height="2" rx="1" />
      <circle className="pf-stack-mini-ring" cx="100" cy="59" r="4" strokeWidth={1.2} />
      <circle className="pf-stack-mini-ring" cx="110" cy="59" r="4" strokeWidth={1.2} />
    </svg>
  );
}

function FooterMonumentalWireframe() {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      <rect className="pf-stack-mini-ink" x="6" y="10" width="70" height="11" rx="2" />
      <rect className="pf-stack-mini-ink" x="6" y="24" width="46" height="11" rx="2" opacity={0.55} />
      <rect className="pf-stack-mini-mute" x="80" y="14" width="32" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="21" width="32" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="80" y="28" width="20" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="6" y="50" width="108" height="16" rx="3" opacity={0.18} />
    </svg>
  );
}

/** Abstract mini-schema preview for every "Section design" option — one wireframe per
 *  design, no exceptions, matching the thumbnail convention already used by Info/Stack/
 *  Services/Work's own design pickers (see the "Settings design standard" rules). */
function FooterDesignWireframe({ design }: { design: PortfolioFooterDesign }) {
  switch (design) {
    case 'centered-minimal':
      return <FooterCenteredMinimalWireframe />;
    case 'landing':
      return <FooterLandingWireframe />;
    case 'minimal':
      return <FooterMinimalCtaWireframe />;
    case 'contact-card':
      return <FooterContactCardWireframe />;
    case 'monumental':
      return <FooterMonumentalWireframe />;
    case 'hero-columns':
      return <FooterHeroColumnsWireframe />;
    case 'split-form':
      return <FooterSplitFormWireframe />;
    case 'timezone-editorial':
      return <FooterTimezoneEditorialWireframe />;
    case 'inverted-wordmark':
      return <FooterInvertedWordmarkWireframe />;
    case 'services-reveal':
      return <FooterServicesRevealWireframe />;
    case 'editorial-grid':
      return <FooterEditorialGridWireframe />;
    case 'headline-reveal':
      return <FooterHeadlineRevealWireframe />;
    case 'dispatch':
      return <FooterDispatchWireframe />;
    case 'compact':
      return <FooterCompactWireframe />;
    default:
      return null;
  }
}

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
function FooterDesignChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioFooterDesign;
  onChange: (value: PortfolioFooterDesign) => void;
  /** Owned by the panel so the selected design's settings can hide while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const t = useT();
  const previewSource = usePortfolioDesignPreviewSource();
  const selected =
    PORTFOLIO_FOOTER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_FOOTER_DESIGN_OPTIONS[0];
  const pick = (design: PortfolioFooterDesign) => {
    onChange(design);
    setShowGrid(false);
  };

  if (!showGrid) {
    return (
      <NpPickerRow
        label={t('Section design')}
        value={t(selected.label)}
        onClick={() => setShowGrid(true)}
        thumbnail={
          <FooterWireThumb framed={false}>
            <FooterDesignWireframe design={value} />
          </FooterWireThumb>
        }
      />
    );
  }

  return (
    <div>
      <NpBackRow title={t('Section design')} onBack={() => setShowGrid(false)} />
      {previewSource ? (
        /* In the studio: every design rendered for real, one per row. */
        <div className="flex flex-col gap-4">
          {PORTFOLIO_FOOTER_DESIGN_OPTIONS.map((option) => (
            <PortfolioDesignLivePreviewCard
              key={option.value}
              cardClassName="pf-stack-design-card"
              labelClassName="pf-stack-card-label"
              active={option.value === value}
              label={t(option.label)}
              src={withDesignPreview(previewSource.portfolioPath, { section: 'footer', design: option.value })}
              settings={previewSource.settings}
              onClick={() => pick(option.value)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {PORTFOLIO_FOOTER_DESIGN_OPTIONS.map((option) => (
            <NpOptionCard
              key={option.value}
              selected={option.value === value}
              title={t(option.label)}
              illustration={
                <FooterWireThumb>
                  <FooterDesignWireframe design={option.value} />
                </FooterWireThumb>
              }
              onClick={() => pick(option.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
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

function FooterGroupLabel({ children, id }: { children: string; id?: string }) {
  return (
    <p id={id} className="np-field-label">
      {children}
    </p>
  );
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

const FOOTER_HEADER_SIZE_PILL_OPTIONS: { value: PortfolioFooterHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

/** S · M · L · XL, each letter drawn at its own size. */
function FooterHeaderSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioFooterHeaderTitleSize;
  onChange: (value: PortfolioFooterHeaderTitleSize) => void;
}) {
  return (
    <NpSegmentedControl
      label={label}
      options={FOOTER_HEADER_SIZE_PILL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        sizePx: option.fontPx,
      }))}
      value={value}
      onChange={onChange}
    />
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
  const t = useT();
  const id = useId();
  return (
    <div className="np-field">
      <FooterGroupLabel id={id}>{label}</FooterGroupLabel>
      <div role="group" aria-labelledby={id} className="np-chips">
        {FOOTER_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className="np-chip"
          >
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
              style={{ backgroundColor: footerHeaderPaletteTokenColor(option.value) }}
            />
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
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

function FooterHeaderMiniWireframe({ design }: { design: PortfolioFooterHeaderDesign }) {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {design === 'none' ? (
        <rect className="pf-stack-mini-mute" x="44" y="34" width="32" height="2.5" rx="1.25" opacity={0.5} />
      ) : design === 'billboard' ? (
        <>
          <rect className="pf-stack-mini-mute" x="4" y="10" width="112" height="24" rx="2" opacity={0.35} />
          <rect className="pf-stack-mini-ink" x="8" y="46" width="50" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="8" y="58" width="30" height="2.5" rx="1.25" />
        </>
      ) : design === 'masthead' ? (
        <>
          <rect className="pf-stack-mini-ink" x="8" y="12" width="90" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="70" height="10" rx="2" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="80" height="10" rx="2" opacity={0.3} />
        </>
      ) : design === 'index' ? (
        <>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="104" height="1.5" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="22" height="18" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="40" y="26" width="1.5" height="18" />
          <rect className="pf-stack-mini-ink" x="50" y="28" width="60" height="8" rx="2" />
        </>
      ) : design === 'serif-lead' ? (
        <>
          <rect className="pf-stack-mini-mute" x="8" y="14" width="24" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="26" width="100" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="40" width="70" height="10" rx="2" opacity={0.5} />
        </>
      ) : design === 'hero' ? (
        <>
          <rect className="pf-stack-mini-ink" x="22" y="14" width="76" height="10" rx="2" />
          <rect className="pf-stack-mini-ink" x="30" y="28" width="60" height="10" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-accent" x="42" y="48" width="36" height="10" rx="5" />
        </>
      ) : design === 'name' ? (
        <>
          <rect className="pf-stack-mini-ink" x="4" y="24" width="112" height="24" rx="2" />
        </>
      ) : design === 'timezone' ? (
        <>
          <rect className="pf-stack-mini-mute" x="8" y="12" width="18" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="8" y="20" width="44" height="8" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="30" width="36" height="8" rx="2" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="8" y="42" width="30" height="2.5" rx="1.25" />
          <rect className="pf-stack-mini-ink" x="86" y="12" width="24" height="6" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="92" y="20" width="18" height="2.5" rx="1.25" />
        </>
      ) : (
        <>
          <rect className="pf-stack-mini-ink" x="8" y="16" width="104" height="12" rx="2" />
          <rect className="pf-stack-mini-ink" x="8" y="34" width="70" height="12" rx="2" opacity={0.55} />
          <rect className="pf-stack-mini-mute" x="8" y="54" width="46" height="2.5" rx="1.25" />
        </>
      )}
    </svg>
  );
}

/** Same picker as Section design; `open` is owned by the panel so the header's settings hide while
 *  the catalogue is browsed. */
function FooterHeaderDesignGrid({
  value,
  onChange,
  open,
  onOpenChange,
}: {
  value: PortfolioFooterHeaderDesign;
  onChange: (value: PortfolioFooterHeaderDesign) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS[0];

  if (!open) {
    return (
      <NpPickerRow
        label={t('Header design')}
        value={t(selected.label)}
        onClick={() => onOpenChange(true)}
        thumbnail={
          <FooterWireThumb framed={false}>
            <FooterHeaderMiniWireframe design={value} />
          </FooterWireThumb>
        }
      />
    );
  }

  return (
    <div>
      <NpBackRow title={t('Header design')} onBack={() => onOpenChange(false)} />
      <div className="grid grid-cols-2 gap-3">
        {PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.map((option) => (
          <NpOptionCard
            key={option.value}
            selected={option.value === value}
            title={t(option.label)}
            illustration={
              <FooterWireThumb>
                <FooterHeaderMiniWireframe design={option.value} />
              </FooterWireThumb>
            }
            onClick={() => {
              onChange(option.value);
              onOpenChange(false);
            }}
          />
        ))}
      </div>
    </div>
  );
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
  const t = useT();
  const id = useId();
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
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="np-field">
      <label htmlFor={id} className="np-field-label">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <span className="np-swatch-dot" style={{ backgroundColor: resolved }} title={resolved} aria-hidden />
        <select
          id={id}
          value={token}
          onChange={(event) =>
            onChange(asFooterPatch(patchFooterColorBinding(footer, slot, event.target.value as HeroPaletteTokenId)))
          }
          className="np-input min-w-0 flex-1"
          aria-label={t('{label} palette token', { label })}
        >
          {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </div>
    </div>
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
  const t = useT();
  const id = useId();
  const selected = new Set(resolveFooterSelectedSectionIds(footer, footer.design));
  const selectedCount = options.filter((option) => selected.has(option.id)).length;

  if (options.length === 0) {
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
        <p className="np-field-label !mb-1">{t(spec.label)}</p>
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
            <textarea
              value={resolveFooterLayoutBioCustom(footer, design, spec.key)}
              rows={3}
              aria-label={`${spec.label} text`}
              onChange={(event) =>
                onChange(patchFooterLayoutElement(footer, design, spec.key, { text: event.target.value }))
              }
              className="np-input"
            />
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
  const t = useT();
  const id = useId();
  return (
    <div className="np-field">
      <FooterGroupLabel id={id}>{label}</FooterGroupLabel>
      <div role="group" aria-labelledby={id} className="np-chips">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className="np-chip"
          >
            <span
              aria-hidden
              className="h-3 w-3 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
              style={{ backgroundColor: option.color }}
            />
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
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
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  sectionLinkOptions: PortfolioFooterSectionLinkOption[];
  onChange: FooterLayoutPatch;
}) {
  const t = useT();
  const spec = FOOTER_DESIGN_LAYOUT_SPECS[footer.design];
  if (!spec) return null;
  // "Identity" (name/avatar/portrait/bio/watermark show-hide + style) is intentionally not
  // surfaced here — identity content is configured once in the account's own General/profile
  // settings, so exposing a second per-design override for it in Layout settings was redundant.
  // Elements still render at their spec default (`defaultVisible`/`defaultText`/`defaultValue`);
  // only the ability to override them per Footer design from this panel was removed.
  const elements = spec.elements.filter(
    (element) => element.group !== 'identity' && (!element.showWhen || element.showWhen(footer))
  );
  // The giant decorative name (Inverted wordmark, Monumental / Timezone watermark) is styling, not
  // identity — it keeps its own group so hiding Identity doesn't take these controls with it.
  const wordmark = elements.filter((element) => element.group === 'wordmark');
  const text = elements.filter((element) => element.group === 'text');
  const headings = elements.filter((element) => element.group === 'labels');

  return (
    <Fragment key={footer.design}>
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
  { value: 'none' as const, label: msg('None') },
  { value: 'sm' as const, label: msg('Small') },
  { value: 'md' as const, label: msg('Medium') },
  { value: 'lg' as const, label: msg('Large') },
  { value: 'xl' as const, label: 'XL' },
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
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FooterSubSection>('general');
  const subSection = normalizeFooterSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: FooterSubSection) => {
    const next = normalizeFooterSubSection(value);
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
  const showBottomLine = designShows.copyright || designShows.marketplace || miniBarOn;

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
            description={enabled ? t('Contact details at the bottom of the page') : t('The page ends with its last section.')}
            checked={enabled}
            onChange={(next) => onChange({ enabled: next })}
          />

          <div className="np-dimmable" data-disabled={enabled ? 'false' : 'true'} aria-disabled={!enabled} inert={!enabled}>
            <NpCollapsibleSection title={t('Contact details')}>
              <div className="flex flex-col">
                <NpToggleRow title={t('Email')} checked={footer.showEmail !== false} onChange={(showEmail) => onChange({ showEmail })} />
                <NpToggleRow title={t('Phone')} checked={footer.showPhone !== false} onChange={(showPhone) => onChange({ showPhone })} />
                {designShows.location || miniBarOn ? (
                  <NpToggleRow
                    title={t('Location')}
                    checked={footer.showLocation !== false}
                    onChange={(showLocation) => onChange({ showLocation })}
                  />
                ) : null}
                {designShows.hours || miniBarOn ? (
                  <NpToggleRow title={t('Hours')} checked={footer.showHours !== false} onChange={(showHours) => onChange({ showHours })} />
                ) : null}
              </div>
            </NpCollapsibleSection>

            {showBottomLine ? (
              <NpCollapsibleSection title={t('Bottom line')}>
                <div className="flex flex-col">
                  {designShows.copyright || miniBarOn ? (
                    <NpToggleRow
                      title={t('Copyright')}
                      checked={footer.showCopyright !== false}
                      onChange={(showCopyright) => onChange({ showCopyright })}
                    />
                  ) : null}
                  {designShows.marketplace ? (
                    <NpToggleRow
                      title={t('Marketplace link')}
                      checked={footer.showMarketplaceLink === true}
                      onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
                    />
                  ) : null}
                </div>
              </NpCollapsibleSection>
            ) : null}
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
            <NpCollapsibleSection title={t('Layout')}>
              <FooterDesignChoiceGrid
                showGrid={false}
                setShowGrid={setDesignCatalogOpen}
                value={footer.design}
                onChange={(design) => onChange(footerDesignPatch(design, footer))}
              />
            </NpCollapsibleSection>

            <NpCollapsibleSection title={t('Style')}>
              <NpSegmentedControl
                label={t('Color mode')}
                options={PORTFOLIO_SECTION_COLOR_MODE_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
                value={footer.colorModeOverride}
                onChange={(colorModeOverride) => onChange({ colorModeOverride })}
              />
              <FooterOptionGrid
                label={t('Text size')}
                options={PORTFOLIO_FOOTER_PREMIUM_FONT_SIZE_OPTIONS}
                value={footer.premiumFontSize ?? 'medium'}
                onChange={(premiumFontSize) => onChange({ premiumFontSize })}
              />
              <PortfolioSettingsPhotoField
                label={t('Photo')}
                photoUrl={footer.photoUrl ?? ''}
                profileAvatarUrl={profileAvatarUrl}
                onChange={(photoUrl) => onChange({ photoUrl })}
              />
            </NpCollapsibleSection>

            <FooterContactLinkOptionsContext.Provider value={contactLinkOptions}>
              <FooterLayoutSettingsSections footer={footer} sectionLinkOptions={sectionLinkOptions} onChange={onChange} />
            </FooterContactLinkOptionsContext.Provider>

            {footer.design === 'contact-card' ? (
              <NpCollapsibleSection title={t('Contact card')}>
                <FooterContactCardColorField footer={footer} onChange={onChange} />
              </NpCollapsibleSection>
            ) : null}

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
        )
      ) : null}

      {subSection === 'header' && enabled ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Header design')}>
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
          </NpCollapsibleSection>

          {/* Browsing the catalogue is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen || headerDesign === 'none' ? null : (
            <Fragment key={headerDesign}>
              <NpCollapsibleSection title={t('Content')}>
                <HeaderElementToggles
                  design={`footer-${headerDesign}`}
                  settings={footer}
                  onPatch={(patch) => onChange(patch as Partial<PortfolioFooterSectionSettings>)}
                />
                <FooterHeaderContentFields footer={footer} onChange={onChange} />
              </NpCollapsibleSection>

              {headerTitleStyle ? (
                <NpCollapsibleSection title={t('Title style')}>
                  <FooterOptionGrid
                    label={t('Alignment')}
                    options={[
                      { value: 'left' as const, label: msg('Left') },
                      { value: 'center' as const, label: msg('Center') },
                      { value: 'right' as const, label: msg('Right') },
                    ]}
                    value={footer.headerDesignAlignment ?? 'left'}
                    onChange={(headerDesignAlignment) => onChange({ headerDesignAlignment })}
                  />
                  {headerTitleStyle.sizeAndWeight ? (
                    <>
                      <FooterHeaderSizePill
                        label={t('Title size')}
                        value={footer.headerTitleSize ?? 'xl'}
                        onChange={(headerTitleSize) => onChange({ headerTitleSize })}
                      />
                      <FooterOptionGrid
                        label={t('Title weight')}
                        options={[
                          { value: 'light' as const, label: msg('Light') },
                          { value: 'regular' as const, label: msg('Regular') },
                          { value: 'semibold' as const, label: msg('Semibold') },
                          { value: 'bold' as const, label: msg('Bold') },
                        ]}
                        value={footer.headerTitleWeight ?? 'bold'}
                        onChange={(headerTitleWeight) => onChange({ headerTitleWeight })}
                      />
                    </>
                  ) : null}
                </NpCollapsibleSection>
              ) : null}

              {/* Rarely touched: folded, like Global's Preferences. */}
              <NpCollapsibleSection title={t('Spacing')} defaultOpen={false}>
                <FooterOptionGrid
                  label={t('Space above the title')}
                  options={FOOTER_SPACING_OPTIONS}
                  value={footer.headerPaddingTop ?? 'none'}
                  onChange={(headerPaddingTop) => onChange({ headerPaddingTop })}
                />
                <FooterOptionGrid
                  label={t('Space below the title')}
                  options={FOOTER_SPACING_OPTIONS}
                  value={footer.headerPaddingBottom ?? 'none'}
                  onChange={(headerPaddingBottom) => onChange({ headerPaddingBottom })}
                />
                <FooterOptionGrid
                  label={t('Gap before the footer')}
                  options={FOOTER_SPACING_OPTIONS}
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
          <NpCollapsibleSection title={t('Background')}>
            <SectionBackgroundSettingsFields
              settings={footer}
              onChange={onChange}
              renderColorField={({ label, value, onChange: onColorChange }) => {
                const slot = FOOTER_BACKGROUND_LABEL_SLOTS[label];
                if (!slot) {
                  return <FooterManualColorField label={label} value={value} onChange={onColorChange} />;
                }
                return <FooterColorField footer={footer} onChange={onChange} slot={slot} label={label} value={value} />;
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

/** The words of the chosen header design (and its colour) — one set of fields per design. */
function FooterHeaderContentFields({
  footer,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  const t = useT();
  switch (footer.headerDesign ?? 'editorial') {
    case 'editorial':
      return (
        <>
          <FooterHeaderTextField label={t('Title')} value={footer.headerEditorialTitleText} placeholder={t('Let\'s work together.')} onChange={(headerEditorialTitleText) => onChange({ headerEditorialTitleText })} multiline />
          <FooterHeaderTextField label={t('Subtitle (optional)')} value={footer.headerEditorialSubtitleText} placeholder="" onChange={(headerEditorialSubtitleText) => onChange({ headerEditorialSubtitleText })} />
          <FooterHeaderPaletteSwatches label={t('Title color')} value={footer.headerEditorialTitleColor ?? 'texteFort'} onChange={(headerEditorialTitleColor) => onChange({ headerEditorialTitleColor })} />
        </>
      );
    case 'index':
      return (
        <>
          <FooterHeaderTextField label={t('Rule label')} value={footer.headerIndexLabelText} placeholder={t('Contact')} onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })} />
          <FooterHeaderTextField label={t('Title')} value={footer.headerIndexTitleText} placeholder={t('Let\'s talk')} onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })} />
          <FooterHeaderTextField label={t('Subtitle')} value={footer.headerIndexSubtitleText} placeholder={t('Reach out — I read every message.')} onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })} multiline />
          <FooterHeaderTextField label={t('Count label (optional)')} value={footer.headerIndexCountLabelText} placeholder={t('Links')} onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })} />
          <FooterHeaderPaletteSwatches label={t('Number color')} value={footer.headerIndexNumberColor ?? 'principal'} onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })} />
          <FooterHeaderPaletteSwatches label={t('Title color')} value={footer.headerIndexTitleColor ?? 'texteFort'} onChange={(headerIndexTitleColor) => onChange({ headerIndexTitleColor })} />
        </>
      );
    case 'serif-lead':
      return (
        <>
          <FooterHeaderTextField label={t('Label')} value={footer.headerSerifLeadLabelText} placeholder={t('Contact')} onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })} />
          <FooterHeaderTextField label={t('Title')} value={footer.headerSerifLeadTitleText} placeholder={t('A few ways to start a conversation and say hello.')} onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })} multiline />
          <FooterHeaderPaletteSwatches label={t('Title color')} value={footer.headerSerifLeadTitleColor ?? 'texteFort'} onChange={(headerSerifLeadTitleColor) => onChange({ headerSerifLeadTitleColor })} />
        </>
      );
    case 'billboard':
      return (
        <>
          <FooterHeaderTextField label={t('Big word')} value={footer.headerBillboardBigWord} placeholder="TALK" onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })} />
          <FooterOptionGrid
            label={t('Word style')}
            options={FOOTER_HEADER_BILLBOARD_WORD_STYLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={footer.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle) => onChange({ headerBillboardWordStyle })}
          />
          <FooterHeaderPaletteSwatches label={t('Word color')} value={footer.headerBillboardWordColor ?? 'principal'} onChange={(headerBillboardWordColor) => onChange({ headerBillboardWordColor })} />
        </>
      );
    case 'masthead':
      return (
        <>
          <FooterHeaderTextField label={t('Line 1')} value={footer.headerMastheadLine1Text} placeholder={t('Always open.')} onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })} />
          <FooterHeaderTextField label={t('Line 2')} value={footer.headerMastheadLine2Text} placeholder={t('Quick to reply.')} onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })} />
          <FooterHeaderTextField label={t('Line 3')} value={footer.headerMastheadLine3Text} placeholder={t('Easy to reach.')} onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })} />
          <FooterHeaderPaletteSwatches label={t('Headline color')} value={footer.headerMastheadHeadlineColor ?? 'principal'} onChange={(headerMastheadHeadlineColor) => onChange({ headerMastheadHeadlineColor })} />
        </>
      );
    case 'hero':
      return (
        <>
          <FooterHeaderTextField label={t('Title')} value={footer.headerHeroTitleText} placeholder={t('Let\'s build a space\nthat feels alive.')} onChange={(headerHeroTitleText) => onChange({ headerHeroTitleText })} multiline />
          <FooterHeaderTextField label={t('Button label')} value={footer.headerHeroCtaLabel} placeholder={t('Get in touch')} onChange={(headerHeroCtaLabel) => onChange({ headerHeroCtaLabel })} />
          <FooterHeaderPaletteSwatches label={t('Title & button color')} value={footer.headerHeroTitleColor ?? 'texteFort'} onChange={(headerHeroTitleColor) => onChange({ headerHeroTitleColor })} />
        </>
      );
    case 'name':
      return (
        <>
          <p className="np-subtle">{t('Always shows your creator name — nothing to type here.')}</p>
          <FooterHeaderPaletteSwatches label={t('Name color')} value={footer.headerNameColor ?? 'texteFort'} onChange={(headerNameColor) => onChange({ headerNameColor })} />
        </>
      );
    case 'timezone':
      return (
        <>
          <FooterHeaderTextField label={t('Kicker')} value={footer.headerTimezoneKickerText} placeholder={t('( Get in touch )')} onChange={(headerTimezoneKickerText) => onChange({ headerTimezoneKickerText })} />
          <FooterHeaderTextField label={t('Title')} value={footer.headerTimezoneTitleText} placeholder={t('Let\'s start\na conversation.')} onChange={(headerTimezoneTitleText) => onChange({ headerTimezoneTitleText })} multiline />
          <FooterHeaderTextField label={t('Description')} value={footer.headerTimezoneDescriptionText} placeholder={t('Reach out and tell us about your project — we read every message.')} onChange={(headerTimezoneDescriptionText) => onChange({ headerTimezoneDescriptionText })} multiline />
          <FooterHeaderPaletteSwatches label={t('Title color')} value={footer.headerTimezoneTitleColor ?? 'texteFort'} onChange={(headerTimezoneTitleColor) => onChange({ headerTimezoneTitleColor })} />
          <p className="np-subtle">{t('The clock and location on the right always come from your real profile data.')}</p>
        </>
      );
    default:
      return null;
  }
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
