'use client';

import { HeaderElementToggles } from '@/components/portfolio/portfolio-header-style-controls';
import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  mergeServicesColorBindings,
  mergeServicesPalette,
  patchServicesColorBinding,
  patchServicesColorField,
  type ServicesColorSlot,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  DEFAULT_SERVICES_PRICING_STYLE_SETTINGS,
  PORTFOLIO_SERVICES_BILLING_SOURCE_OPTIONS,
  PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS,
  PORTFOLIO_SERVICES_FEATURED_SOURCE_OPTIONS,
  PORTFOLIO_SERVICES_LIST_BULLET_OPTIONS,
  SERVICES_LIST_BULLET_DESIGNS,
  type PortfolioServicesListBullet,
  PORTFOLIO_SERVICES_HOVER_EFFECT_OPTIONS,
  SERVICES_FEATURED_DEFAULT_OPACITY,
  type ServicesFeaturedDesignKey,
  PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CTA_STYLE_OPTIONS,
  type PortfolioServicesPricingStyleSettings,
} from '@/components/portfolio/portfolio-services-pricing-style';
import {
  DEFAULT_SERVICES_INDEX_LIST_SETTINGS,
  DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS,
  DEFAULT_SERVICES_ICON_CARDS_SETTINGS,
  DEFAULT_SERVICES_BAND_INDEX_SETTINGS,
  DEFAULT_SERVICES_CAPABILITIES_SETTINGS,
  PORTFOLIO_SERVICES_CAPABILITIES_NUMBER_OPTIONS,
  PORTFOLIO_SERVICES_CAPABILITIES_FRAME_OPTIONS,
  type PortfolioServicesCapabilitiesSettings,
  DEFAULT_SERVICES_CASCADE_SETTINGS,
  PORTFOLIO_SERVICES_BAND_INDEX_HOVER_FILL_OPTIONS,
  PORTFOLIO_SERVICES_BAND_INDEX_PREVIEW_OPTIONS,
  PORTFOLIO_SERVICES_BAND_INDEX_TASKS_STYLE_OPTIONS,
  PORTFOLIO_SERVICES_BAND_INDEX_TITLE_SIZE_OPTIONS,
  PORTFOLIO_SERVICES_CASCADE_HEIGHT_OPTIONS,
  PORTFOLIO_SERVICES_CASCADE_MEDIA_SIDE_OPTIONS,
  PORTFOLIO_SERVICES_CASCADE_STACK_OPTIONS,
  PORTFOLIO_SERVICES_CASCADE_WIDTH_OPTIONS,
  type PortfolioServicesBandIndexSettings,
  type PortfolioServicesBandIndexTasksStyle,
  type PortfolioServicesCascadeSettings,
  PORTFOLIO_SERVICES_ICON_CARDS_HOVER_OPTIONS,
  PORTFOLIO_SERVICES_ICON_CARDS_ICON_COLOR_OPTIONS,
  PORTFOLIO_SERVICES_ICON_CARDS_ICON_SHAPE_OPTIONS,
  PORTFOLIO_SERVICES_ICON_CARDS_ICON_SIZE_OPTIONS,
  PORTFOLIO_SERVICES_ICON_CARDS_STYLE_OPTIONS,
  PORTFOLIO_SERVICES_ICON_CARDS_TASKS_STYLE_OPTIONS,
  type PortfolioServicesIconCardsTasksStyle,
  type PortfolioServicesIconCardsIconShape,
  type PortfolioServicesIconCardsSettings,
  type PortfolioServicesIconCardsStyle,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS,
  PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS,
  type PortfolioServicesMediaColumnsRadius,
  type PortfolioServicesMediaColumnsRatio,
  type PortfolioServicesMediaColumnsSettings,
  DEFAULT_SERVICES_PRICING_AURORA_SETTINGS,
  DEFAULT_SERVICES_PRICING_CARDS_SETTINGS,
  PORTFOLIO_SERVICES_INDEX_LIST_HOVER_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CARDS_COLUMNS_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_CARDS_LAYOUT_OPTIONS,
  type PortfolioServicesPricingCardsColumns,
  type PortfolioServicesPricingCardsLayout,
  PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS,
  PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS,
  PORTFOLIO_SERVICES_INDEX_LIST_ROW_GAP_OPTIONS,
  PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS,
  type PortfolioServicesIndexListLayout,
  type PortfolioServicesIndexListSettings,
  type PortfolioServicesIndexListTasksStyle,
  PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS,
  PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_AURORA_COLUMNS_OPTIONS,
  PORTFOLIO_SERVICES_PRICING_AURORA_FEATURED_POSITION_OPTIONS,
  DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS,
  DEFAULT_SERVICES_PRESENTATION,
  PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS,
  SERVICES_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS,
  SERVICES_HEADER_BILLBOARD_WORD_STYLE_OPTIONS,
  SERVICES_HEADER_PALETTE_TOKEN_OPTIONS,
  servicesHeaderPaletteTokenColor,
  type PortfolioServicesHeaderAccentCountAlignment,
  type PortfolioServicesHeaderBillboardWordStyle,
  type PortfolioServicesHeaderDesign,
  type PortfolioServicesHeaderDesignAlignment,
  type PortfolioServicesHeaderPaletteToken,
  type PortfolioServicesHeaderTitleSize,
  type PortfolioServicesHeaderTitleWeight,
  type PortfolioServicesPricingAuroraColumns,
  type PortfolioServicesSectionDesign,
  type PortfolioServicesSectionSettings,
  PORTFOLIO_SERVICES_PREMIUM_FONT_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-services-settings';
import { PortfolioHeaderDesignOption } from '@/components/portfolio/portfolio-header-design-lock';
import {
  SERVICE_ICON_OPTIONS,
  resolveServiceIconKey,
  serviceIconPaths,
  type ServiceIconChoice,
  type ServiceIconKey,
} from '@/components/portfolio/portfolio-services-icon-cards-icons';
import {
  SERVICES_OPT_IN_FIELDS,
  servicesDesignAllows,
  servicesDesignHasOwnFrame,
  servicesIsOptIn,
  servicesOptInBlock,
  type ServicesOptInElement,
} from '@/components/portfolio/portfolio-services-card-elements';
import {
  SettingsVariantView,
  SvChoiceTiles,
  SvPickOne,
  SvSlider,
  SvSwatches,
  SvTextInput,
  type SettingDensity,
  type SettingGroup,
  type SettingItem,
} from '@/components/portfolio/portfolio-settings-variants';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import {
  NpBackRow,
  NpCollapsibleSection,
  NpOptionCard,
  NpOptionCardGroup,
  NpPanelShell,
  NpPickerRow,
  NpToggleRow,
  type NpPanelChrome,
} from '@/components/portfolio/portfolio-nav-panel-ui';

/** Top-level settings entry: kept for API compatibility with callers, though only
 *  'services' is currently wired up anywhere in the app (no live 'skills' entry point). */
type ServicesSettingsFocus = 'skills' | 'services';

export type ServicesSubSection = 'general' | 'design' | 'background' | 'header';

const SERVICES_SUB_SECTIONS: { id: ServicesSubSection; label: string; description: string }[] = [
  { id: 'general', label: msg('General'), description: msg('Section visibility and defaults.') },
  { id: 'design', label: msg('Design'), description: msg('Layout and visual style.') },
  { id: 'header', label: msg('Header'), description: msg('Title, subtitle, fonts, and colors.') },
  { id: 'background', label: msg('Background'), description: msg('Fill behind this section.') },
];

/** The only section designs with their own options band in the Design tab — every other one
 *  renders straight from the services themselves (same hint pattern as Gallery's). */
const SERVICES_DESIGNS_WITH_OPTIONS = new Set<PortfolioServicesSectionDesign>([
  'services-index-list',
  'services-media-columns',
  'services-icon-cards',
  'services-band-index',
  'services-cascade',
  'services-capabilities',
  'services-pricing',
  'services-pricing-aurora',
  'services-pricing-toggle',
]);

/** Map legacy subsection ids (saved UI state / search) onto the current Services menu. */
export function normalizeServicesSubSection(value: string | undefined): ServicesSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  if (value === 'cards' || value === 'layout' || value === 'frame') return 'design';
  return 'general';
}

function asServicesPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioServicesSectionSettings> {
  return patch as Partial<PortfolioServicesSectionSettings>;
}

/** Same animated switch as Stack/Contact/Info's settings panels — shared settings-UI chrome. */
function ServicesSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #171717) 22%, var(--pf-palette-fond, #ffffff))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #171717)',
        }}
      />
    </span>
  );
}

/** Small keyboard-accessible "i" tooltip — same mechanism as Stack/Contact/Info. */
function ServicesInfoTooltip({ text }: { text: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  return (
    <span className="relative inline-flex shrink-0">
      <span
        role="button"
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        aria-label={t('More info: {text}', { text })}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event) => event.stopPropagation()}
        className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-muted)] transition hover:text-[color:var(--pf-palette-texte-fort)] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-400"
      >
        <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="6.1" stroke="currentColor" strokeWidth="1.15" />
          <circle cx="7" cy="4.35" r="0.95" fill="currentColor" />
          <rect x="6.3" y="6.05" width="1.4" height="4.4" rx="0.7" fill="currentColor" />
        </svg>
      </span>
      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-[color:var(--np-primary-bg,#171717)] px-2.5 py-1.5 text-xs font-medium leading-snug text-[color:var(--np-primary-ink,#ffffff)] shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

/** One-per-line visibility row (hairline divider) — the same pattern as the Footer's,
 *  Gallery's and Team's General tabs. */
function ServicesVisibilityRow({
  label,
  info,
  checked,
  onChange,
}: {
  label: string;
  info?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--pf-palette-bordure)] py-3.5 last:border-b-0">
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <span
          className="min-w-0 cursor-pointer truncate text-sm font-medium text-[color:var(--pf-palette-texte-fort)]"
          onClick={() => onChange(!checked)}
        >
          {label}
        </span>
        {info ? <ServicesInfoTooltip text={info} /> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="shrink-0"
      >
        <ServicesSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

/**
 * How field labels read: small uppercase captions by default, or plain sentence-case row titles
 * inside a settings block (the grouped-rows look of a phone's system settings).
 */
const ServicesLabelStyleContext = createContext<'caps' | 'row'>('caps');

const SERVICES_ROW_LABEL_CLASS =
  'text-[14px] font-medium leading-snug text-[color:var(--pf-palette-texte-fort,#171717)]';

function ServicesSectionLabel({ children }: { children: string }) {
  const mode = useContext(ServicesLabelStyleContext);
  if (mode === 'row') return <p className={SERVICES_ROW_LABEL_CLASS}>{children}</p>;
  return <p className="pf-stack-block-label">{children}</p>;
}

function ServicesGroupLabel({ children }: { children: string }) {
  const mode = useContext(ServicesLabelStyleContext);
  if (mode === 'row') return <p className={SERVICES_ROW_LABEL_CLASS}>{children}</p>;
  return <p className="text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">{children}</p>;
}

const SERVICES_INPUT_CLASS =
  'w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]';

/** Label + input — replaces the old "block heading, then a nested Text sub-label" shape
 *  the Header tab used, so a text field reads the same here as in Gallery/Team. */
function ServicesTextField({
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
    <div>
      <ServicesSectionLabel>{label}</ServicesSectionLabel>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={2}
          aria-label={label}
          className={`mt-2 ${SERVICES_INPUT_CLASS} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className={`mt-2 ${SERVICES_INPUT_CLASS}`}
        />
      )}
    </div>
  );
}

/** Mini wireframes for the "Section design" picker cards (`.pf-stack-mini-*` classes are
 *  generic shared settings-UI chrome, not Stack-specific). Deliberately monochrome and quiet:
 *  hairline outlines, two grey tones for text and media, lots of air — no palette accent, so the
 *  catalogue reads as structure, not decoration. A "featured" element is told apart by a slightly
 *  fuller grey, never by colour. */
const HAIR = 0.75;

function MiniCard({ x, y, w, h, r = 3.5, filled = false }: { x: number; y: number; w: number; h: number; r?: number; filled?: boolean }) {
  return filled ? (
    <rect className="pf-stack-mini-mute" x={x} y={y} width={w} height={h} rx={r} />
  ) : (
    <rect className="pf-stack-mini-ring" x={x} y={y} width={w} height={h} rx={r} strokeWidth={HAIR} />
  );
}

function MiniLine({ x, y, w, strong = false, h }: { x: number; y: number; w: number; strong?: boolean; h?: number }) {
  const height = h ?? (strong ? 3 : 1.6);
  return (
    <rect
      className={strong ? 'pf-stack-mini-ink' : 'pf-stack-mini-mute'}
      x={x}
      y={y}
      width={w}
      height={height}
      rx={height / 2}
    />
  );
}

function MiniRule({ x, y, w }: { x: number; y: number; w: number }) {
  return <rect className="pf-stack-mini-ink" x={x} y={y} width={w} height={0.6} opacity={0.7} />;
}

function ServicesDesignWireframe({ design }: { design: PortfolioServicesSectionDesign }) {
  if (design === 'services-pricing') {
    // Three plans, the middle one a touch taller and softly filled.
    return (
      <ServicesMiniSlide>
        {[0, 1, 2].map((i) => {
          const x = 13 + i * 33;
          const featured = i === 1;
          const y = featured ? 11 : 15;
          return (
            <g key={i}>
              <MiniCard x={x} y={y} w={28} h={featured ? 50 : 42} filled={featured} />
              <MiniLine x={x + 5} y={y + 6} w={10} />
              <MiniLine x={x + 5} y={y + 11} w={14} strong h={4} />
              <MiniLine x={x + 5} y={y + 20} w={17} />
              <MiniLine x={x + 5} y={y + 24} w={13} />
              <rect className="pf-stack-mini-ring" x={x + 5} y={y + (featured ? 41 : 33)} width={18} height={4.5} rx={2.25} strokeWidth={HAIR} />
            </g>
          );
        })}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-pricing-aurora') {
    // Frameless plans side by side, separated by thin vertical rules; big price figures.
    return (
      <ServicesMiniSlide>
        {[0, 1, 2].map((i) => {
          const x = 14 + i * 33;
          return (
            <g key={i}>
              {i > 0 ? <rect className="pf-stack-mini-mute" x={x - 5} y={14} width={0.6} height={44} /> : null}
              <MiniLine x={x} y={16} w={12} />
              <MiniLine x={x} y={23} w={i === 1 ? 20 : 16} strong h={6} />
              <MiniLine x={x} y={35} w={20} />
              <MiniLine x={x} y={39.5} w={16} />
              <MiniLine x={x} y={44} w={18} />
              <MiniLine x={x} y={52} w={i === 1 ? 22 : 14} strong h={1.6} />
            </g>
          );
        })}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-pricing-toggle') {
    // Accordion of plans: the first row open, the others closed behind hairlines.
    return (
      <ServicesMiniSlide>
        <MiniRule x={12} y={12} w={96} />
        <MiniLine x={12} y={17} w={26} strong />
        <MiniLine x={92} y={17} w={16} strong />
        <MiniLine x={12} y={25} w={44} />
        <MiniLine x={12} y={29.5} w={36} />
        <rect className="pf-stack-mini-ring" x={12} y={34} width={20} height={5} rx={2.5} strokeWidth={HAIR} />
        {[0, 1].map((i) => (
          <g key={i}>
            <MiniRule x={12} y={45 + i * 11} w={96} />
            <MiniLine x={12} y={49 + i * 11} w={22 - i * 4} strong />
            <MiniLine x={96} y={49.5 + i * 11} w={12} />
          </g>
        ))}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-index-list') {
    // Numbered rows: text + tags on the left, media on the right.
    return (
      <ServicesMiniSlide>
        {[0, 1].map((i) => {
          const y = 11 + i * 28;
          return (
            <g key={i}>
              <MiniRule x={12} y={y} w={96} />
              <MiniLine x={12} y={y + 5} w={5} />
              <MiniLine x={12} y={y + 10} w={28} strong />
              <MiniLine x={12} y={y + 17} w={34} />
              <rect className="pf-stack-mini-ring" x={12} y={y + 21} width={11} height={3.6} rx={1.8} strokeWidth={HAIR} />
              <rect className="pf-stack-mini-ring" x={25} y={y + 21} width={14} height={3.6} rx={1.8} strokeWidth={HAIR} />
              <MiniCard x={64} y={y + 4} w={44} h={20} r={2} filled />
            </g>
          );
        })}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-media-columns') {
    return (
      <ServicesMiniSlide>
        {[0, 1, 2].map((i) => {
          const x = 13 + i * 33;
          return (
            <g key={i}>
              <MiniCard x={x} y={11} w={28} h={30} r={2.5} filled />
              <MiniLine x={x} y={46} w={18} strong />
              <MiniLine x={x} y={53} w={26} />
              <MiniLine x={x} y={57.5} w={20} />
            </g>
          );
        })}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-icon-cards') {
    return (
      <ServicesMiniSlide>
        {[0, 1, 2, 3].map((i) => {
          const x = 13 + (i % 2) * 49;
          const y = 10 + Math.floor(i / 2) * 27;
          return (
            <g key={i}>
              <MiniCard x={x} y={y} w={45} h={23} />
              <circle className="pf-stack-mini-ring" cx={x + 8} cy={y + 7.5} r={3} strokeWidth={HAIR} />
              <MiniLine x={x + 5} y={y + 13} w={18} strong h={2.6} />
              <MiniLine x={x + 5} y={y + 18} w={28} />
            </g>
          );
        })}
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-band-index') {
    // Full-width bands; the hovered one lifts a floating media card.
    return (
      <ServicesMiniSlide>
        {[0, 1, 2, 3].map((i) => {
          const y = 11 + i * 13;
          return (
            <g key={i}>
              <MiniRule x={12} y={y} w={96} />
              <MiniLine x={12} y={y + 5.5} w={4} />
              <MiniLine x={21} y={y + 4.5} w={i === 1 ? 40 : 34 - i * 3} strong h={3.4} />
              <MiniLine x={98} y={y + 5.5} w={10} />
            </g>
          );
        })}
        <rect className="pf-stack-mini-stage" x={70} y={17} width={18} height={22} rx={2} transform="rotate(-5 79 28)" />
        <rect className="pf-stack-mini-mute" x={70} y={17} width={18} height={22} rx={2} transform="rotate(-5 79 28)" />
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-cascade') {
    // Stacked cards receding behind the front one (text left, media right).
    return (
      <ServicesMiniSlide>
        {/* Receding cards: only their top edges, open where the front card covers them. */}
        <path className="pf-stack-mini-ring" d="M24 19V12a4 4 0 0 1 4-4h64a4 4 0 0 1 4 4v7" strokeWidth={HAIR} opacity={0.55} />
        <path className="pf-stack-mini-ring" d="M18 19v-2a4 4 0 0 1 4-4h76a4 4 0 0 1 4 4v2" strokeWidth={HAIR} opacity={0.8} />
        <MiniCard x={12} y={19} w={96} h={44} r={4.5} />
        <MiniLine x={18} y={25} w={8} />
        <MiniLine x={18} y={31} w={30} strong h={4} />
        <MiniLine x={18} y={40} w={34} />
        <MiniLine x={18} y={44.5} w={26} />
        <rect className="pf-stack-mini-ring" x={18} y={52} width={16} height={5} rx={2.5} strokeWidth={HAIR} />
        <MiniCard x={64} y={24} w={39} h={34} r={2.5} filled />
      </ServicesMiniSlide>
    );
  }
  if (design === 'services-capabilities') {
    // Text-only columns under hairline rules.
    return (
      <ServicesMiniSlide>
        {[0, 1, 2].map((i) => {
          const x = 13 + i * 33;
          return (
            <g key={i}>
              <MiniRule x={x} y={12} w={28} />
              <MiniLine x={x} y={18} w={20 - i * 2} strong h={3.4} />
              <MiniLine x={x} y={26} w={27} />
              <MiniLine x={x} y={30.5} w={22} />
              <MiniLine x={x} y={39} w={15} />
              <MiniLine x={x} y={43.5} w={19} />
              <MiniLine x={x} y={48} w={12} />
            </g>
          );
        })}
      </ServicesMiniSlide>
    );
  }
  return (
    <ServicesMiniSlide>
      {[0, 1, 2].map((i) => {
        const x = 13 + i * 33;
        return (
          <g key={i}>
            <MiniCard x={x} y={14} w={28} h={44} />
            <MiniLine x={x + 5} y={46} w={16} strong />
          </g>
        );
      })}
    </ServicesMiniSlide>
  );
}

/** The "Section design" picker — collapses to the selected design; click to expand and change. */
function ServicesDesignChoiceGrid({
  value,
  onChange,
  showGrid,
  setShowGrid,
}: {
  value: PortfolioServicesSectionDesign;
  onChange: (value: PortfolioServicesSectionDesign) => void;
  /** Owned by the panel so the selected design's options hide while the catalogue is open. */
  showGrid: boolean;
  setShowGrid: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS[0];
  if (showGrid) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Services design')} onBack={() => setShowGrid(false)} />
        <NpOptionCardGroup label={t('Choose a design')} columns={2}>
          {PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS.map((option) => {
            return (
              <NpOptionCard
                key={option.value}
                selected={option.value === value}
                title={t(option.label)}
                subtitle={t(option.description)}
                illustration={<ServicesDesignWireframe design={option.value} />}
                onClick={() => {
                  onChange(option.value);
                  setShowGrid(false);
                }}
              />
            );
          })}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <NpPickerRow label={t('Design')} value={t(selected.label)} thumbnail={<ServicesDesignWireframe design={value} />} onClick={() => setShowGrid(true)} />
  );
}

function ServicesManualColorField({
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
      <p className="pf-stack-block-label">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
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
  );
}

/** Palette-bound color field — dropdown of theme tokens when the Hero palette is on,
 *  manual hex picker when it's off. Same mechanism as FAQ/Stack's own color fields. */
function ServicesColorField({
  services,
  onChange,
  slot,
  label,
  value,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  slot: ServicesColorSlot;
  label: string;
  value: string;
}) {
  const t = useT();
  if (services.useHeroPalette === false) {
    return (
      <ServicesManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asServicesPatch(patchServicesColorField(services, slot, hex)))}
      />
    );
  }

  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(DEFAULT_SERVICES_COLOR_BINDINGS, services.servicesColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="pf-stack-block-label">{label}</p>
        <span
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-[color:var(--pf-palette-bordure)]"
          style={{ backgroundColor: resolved }}
          title={resolved}
          aria-hidden
        />
      </div>
      <select
        value={token}
        onChange={(event) =>
          onChange(asServicesPatch(patchServicesColorBinding(services, slot, event.target.value as HeroPaletteTokenId)))
        }
        className="w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3 py-2 text-sm text-[color:var(--pf-palette-texte-fort)] focus:border-[color:var(--pf-palette-texte-muted)] focus:outline-hidden"
        aria-label={t('{label} palette token', { label })}
      >
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
    </div>
  );
}

const SERVICES_BACKGROUND_LABEL_SLOTS: Record<string, ServicesColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Color A': 'sectionSplitA',
  'Color B': 'sectionSplitB',
};

/** Mini wireframe canvas — shared settings-UI chrome (`.pf-stack-*` classes are generic,
 *  not Stack-specific — reused across every section panel that has this Header mechanism). */
function ServicesMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function ServicesMiniType({
  x,
  y,
  children,
  size = 8,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      className="pf-stack-mini-type"
      x={x}
      y={y}
      fontSize={size}
      fontWeight={700}
      letterSpacing="0.1em"
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

/** Expandable picker card — the Footer/Gallery/Team chrome: no visible border at rest, a
 *  hover brighten + 1px lift, and the selected card signalled only by its label turning the
 *  accent color (see `.pf-services-design-card` in globals.css). */
function _ServicesPickerCard({
  active,
  label,
  onClick,
  children,
  compact,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** Smaller padding/type for secondary thumbnail grids (cards per row, …). */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className={`pf-services-design-card relative text-left ${compact ? 'p-2' : 'p-3'}`}
    >
      {children}
      <span
        className={`pf-services-card-label block font-semibold leading-tight ${
          compact ? 'mt-2 text-xs' : 'mt-3 text-[14px]'
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/** Compact pill picker — for simple choices (alignment, weight, presets) where a big
 *  descriptive card is overkill. Same markup as Gallery's and Team's own OptionGrid. */
function ServicesOptionGrid<T extends string | number>({
  label,
  options,
  value,
  onChange,
  columns,
  hideLabel = false,
}: {
  label: string;
  options: readonly { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  /** Keeps `label` as the accessible name only — for a pill that sits under its own heading. */
  hideLabel?: boolean;
}) {
  const t = useT();
  const count = options.length;
  const cols = columns ?? (count <= 4 ? Math.max(count, 1) : 2);
  return (
    <div>
      {hideLabel ? null : <ServicesGroupLabel>{label}</ServicesGroupLabel>}
      <div
        role="radiogroup"
        aria-label={label}
        className={`${hideLabel ? '' : 'mt-2'} grid gap-1.5`}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition ${
                active ? SERVICES_STYLE_PILL_ACTIVE : SERVICES_STYLE_PILL_IDLE
              }`}
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Mini "N equal bars" preview for a cards-per-row picker — mirrors Work Board's
 *  `workColumnsGlyph`, adapted to the 64×34 stage used by `ServicesPreviewCardGrid`. */
function servicesPricingColumnsGlyph(n: 1 | 2 | 3 | 4): ReactNode {
  const stageX = 5;
  const stageWidth = 54;
  const gap = 3;
  const barWidth = (stageWidth - gap * (n - 1)) / n;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          className="pf-stack-mini-ink"
          x={stageX + i * (barWidth + gap)}
          y={9}
          width={barWidth}
          height={16}
          rx={2}
        />
      ))}
    </>
  );
}

/** Mini media-side previews for Index List's layout picker (64×34 stage): text bars + a media block. */
function servicesIndexListLayoutGlyph(layout: PortfolioServicesIndexListLayout): ReactNode {
  const row = (y: number, h: number, mediaLeft: boolean) => (
    <>
      <rect className="pf-stack-mini-mute" x={mediaLeft ? 6 : 36} y={y} width={22} height={h} rx={1.5} />
      <rect className="pf-stack-mini-ink" x={mediaLeft ? 34 : 6} y={y} width={16} height={2} rx={1} />
      <rect className="pf-stack-mini-ink" x={mediaLeft ? 34 : 6} y={y + 5} width={11} height={1.5} rx={0.75} />
      <rect className="pf-stack-mini-ink" x={mediaLeft ? 34 : 6} y={y + 9} width={14} height={1.5} rx={0.75} />
    </>
  );
  if (layout === 'zigzag') {
    return (
      <>
        {row(5, 11, false)}
        {row(19, 11, true)}
      </>
    );
  }
  return row(9, 16, layout === 'media-left');
}

/** Media Columns' ratio picker: a media block of the real proportion plus a text line. */
function servicesMediaColumnsRatioGlyph(ratio: PortfolioServicesMediaColumnsRatio): ReactNode {
  const dims: Record<PortfolioServicesMediaColumnsRatio, [number, number]> = {
    portrait: [18, 22],
    square: [20, 20],
    landscape: [26, 19],
    wide: [32, 18],
  };
  const [w, h] = dims[ratio];
  const x = 32 - w / 2;
  const y = 3 + (24 - h) / 2;
  return (
    <>
      <rect className="pf-stack-mini-ink" x={x} y={y} width={w} height={h} rx={2} />
      <rect className="pf-stack-mini-mute" x={x} y={29} width={w * 0.7} height={2} rx={1} />
    </>
  );
}

/** Media Columns' radius picker: a block drawn with the real rounding (scaled to the stage). */
/** Text block + media block on the 64×34 stage, media on the given side. */
function servicesSplitSideGlyph(side: 'left' | 'right' | 'zigzag'): ReactNode {
  if (side === 'zigzag') {
    return (
      <g>
        <rect className="pf-stack-mini-accent" x="40" y="4" width="16" height="11" rx="2" />
        <rect className="pf-stack-mini-ink" x="8" y="6" width="16" height="3" rx="1.5" />
        <rect className="pf-stack-mini-mute" x="8" y="11" width="22" height="2" rx="1" />
        <rect className="pf-stack-mini-accent" x="8" y="19" width="16" height="11" rx="2" />
        <rect className="pf-stack-mini-ink" x="34" y="21" width="16" height="3" rx="1.5" />
        <rect className="pf-stack-mini-mute" x="34" y="26" width="22" height="2" rx="1" />
      </g>
    );
  }
  const mediaX = side === 'left' ? 7 : 35;
  const textX = side === 'left' ? 37 : 7;
  return (
    <g>
      <rect className="pf-stack-mini-accent" x={mediaX} y="6" width="22" height="22" rx="2.5" />
      <rect className="pf-stack-mini-ink" x={textX} y="10" width="18" height="4" rx="1.5" />
      <rect className="pf-stack-mini-mute" x={textX} y="17" width="20" height="2" rx="1" />
      <rect className="pf-stack-mini-mute" x={textX} y="22" width="14" height="2" rx="1" />
    </g>
  );
}

/** One service icon's strokes for a settings tile (drawn in a 24×24 box). */
function servicesIconGlyph(key: ServiceIconKey): ReactNode {
  return (
    <g stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" fill="none">
      {serviceIconPaths(key)}
    </g>
  );
}

function servicesIconAutoGlyph(): ReactNode {
  return (
    <text x="12" y="15.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" stroke="none">
      AUTO
    </text>
  );
}

/** Icon Cards card style on the 64×34 stage: shadow / hairline / tint / no card. */
function servicesIconCardsStyleGlyph(style: PortfolioServicesIconCardsStyle): ReactNode {
  return (
    <g>
      {style === 'elevated' ? (
        <rect className="pf-stack-mini-mute" x="17" y="8" width="32" height="22" rx="4" opacity={0.6} />
      ) : null}
      {style === 'elevated' || style === 'tinted' ? (
        <rect
          className={style === 'tinted' ? 'pf-stack-mini-accent' : 'pf-stack-mini-stage'}
          x="15"
          y="5"
          width="34"
          height="23"
          rx="4"
          opacity={style === 'tinted' ? 0.3 : 1}
        />
      ) : null}
      {style === 'outlined' ? (
        <rect className="pf-stack-mini-ring" x="15" y="5" width="34" height="23" rx="4" />
      ) : null}
      <circle className="pf-stack-mini-accent" cx="32" cy="12" r="3" />
      <rect className="pf-stack-mini-ink" x="24" y="18" width="16" height="2.5" rx="1.25" />
      <rect className="pf-stack-mini-mute" x="22" y="23" width="20" height="1.6" rx="0.8" />
    </g>
  );
}

function servicesIconCardsShapeGlyph(shape: PortfolioServicesIconCardsIconShape): ReactNode {
  if (shape === 'bare') {
    return <path d="M33 8 26 18h5l-1 8 7-10h-5l1-8Z" className="pf-stack-mini-accent" />;
  }
  return (
    <rect
      className="pf-stack-mini-accent"
      x="22"
      y="7"
      width="20"
      height="20"
      rx={shape === 'circle' ? 10 : 6}
    />
  );
}

function servicesMediaColumnsRadiusGlyph(radius: PortfolioServicesMediaColumnsRadius): ReactNode {
  const rx: Record<PortfolioServicesMediaColumnsRadius, number> = {
    none: 0,
    small: 1.5,
    medium: 3.5,
    large: 7,
    round: 11,
  };
  return <rect className="pf-stack-mini-ink" x={20} y={5} width={24} height={24} rx={rx[radius]} />;
}

/** Mini previews for Index List's task presentations (64×34 stage). */
/** Band Index tasks styles reuse the Index list wireframes; Checklist gets its own. */
function servicesBandTasksGlyph(style: PortfolioServicesBandIndexTasksStyle): ReactNode {
  if (style === 'checklist') {
    return (
      <>
        {[9, 17, 25].map((y) => (
          <g key={y}>
            <circle className="pf-stack-mini-accent" cx={10} cy={y} r={2.6} />
            <rect className="pf-stack-mini-ink" x={16} y={y - 1.2} width={y === 17 ? 30 : 38} height={2.4} rx={1.2} />
          </g>
        ))}
      </>
    );
  }
  const map: Record<Exclude<PortfolioServicesBandIndexTasksStyle, 'checklist'>, PortfolioServicesIndexListTasksStyle> = {
    rows: 'ledger',
    pills: 'pills',
    columns: 'numbered',
    inline: 'inline',
  };
  return servicesIndexListTasksGlyph(map[style]);
}

function servicesIndexListTasksGlyph(style: PortfolioServicesIndexListTasksStyle): ReactNode {
  switch (style) {
    case 'ledger':
      return (
        <>
          {[8, 16, 24].map((y) => (
            <g key={y}>
              <rect className="pf-stack-mini-ink" x={6} y={y} width={52} height={0.8} />
              <rect className="pf-stack-mini-ink" x={8} y={y + 3} width={20} height={2} rx={1} />
              <rect className="pf-stack-mini-accent" x={52} y={y + 3} width={4} height={2} rx={1} />
            </g>
          ))}
        </>
      );
    case 'numbered':
      return (
        <>
          {[0, 1].map((col) =>
            [8, 16, 24].map((y) => (
              <g key={`${col}-${y}`}>
                <rect className="pf-stack-mini-ink" x={6 + col * 28} y={y} width={24} height={0.8} />
                <rect className="pf-stack-mini-accent" x={7 + col * 28} y={y + 3} width={3} height={2} rx={1} />
                <rect className="pf-stack-mini-ink" x={12 + col * 28} y={y + 3} width={12} height={2} rx={1} />
              </g>
            ))
          )}
        </>
      );
    case 'inline':
      return (
        <>
          <rect className="pf-stack-mini-ink" x={6} y={11} width={14} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-mute" x={23} y={10} width={1.5} height={5} />
          <rect className="pf-stack-mini-ink" x={27} y={11} width={18} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-mute" x={48} y={10} width={1.5} height={5} />
          <rect className="pf-stack-mini-ink" x={52} y={11} width={6} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-ink" x={6} y={20} width={20} height={2.5} rx={1.25} />
          <rect className="pf-stack-mini-mute" x={29} y={19} width={1.5} height={5} />
          <rect className="pf-stack-mini-ink" x={33} y={20} width={12} height={2.5} rx={1.25} />
        </>
      );
    default:
      return (
        <>
          <rect className="pf-stack-mini-ring" x={6} y={9} width={20} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={29} y={9} width={14} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={46} y={9} width={12} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={6} y={19} width={14} height={6.5} rx={3.25} />
          <rect className="pf-stack-mini-ring" x={23} y={19} width={22} height={6.5} rx={3.25} />
        </>
      );
  }
}

/** Collapsed-state row shared by the Header design choice grid: a compact scaled-down
 *  thumbnail, the selected design's name, and a trailing chevron — the whole row opens
 *  the grid. Same mechanism as Stack/Contact's own design summary row. */
function _ServicesDesignSummaryRow({
  label,
  name,
  onOpen,
  children,
}: {
  label: string;
  name: string;
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <ServicesSectionLabel>{label}</ServicesSectionLabel>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Change ${label.toLowerCase()}`}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[color:var(--pf-palette-bordure)] px-3 py-2.5 text-left transition hover:border-[color:var(--pf-palette-texte-muted)]"
      >
        <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent">
          <span className="flex w-[116px] shrink-0 origin-center scale-[1.05] items-center justify-center">
            {children}
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[color:var(--pf-palette-texte-muted)]" aria-hidden>
          <path
            d="M7.5 4.5l5 5.5-5 5.5"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

/** S/M/L/XL, each button's own label rendered at the size it represents —
 *  the pill illustrates the scale directly, no separate value readout needed. */
const SERVICES_SIZE_PILL_OPTIONS: { value: PortfolioServicesHeaderTitleSize; label: string; fontPx: number }[] = [
  { value: 'sm', label: 'S', fontPx: 12 },
  { value: 'md', label: 'M', fontPx: 15 },
  { value: 'lg', label: 'L', fontPx: 18 },
  { value: 'xl', label: 'XL', fontPx: 22 },
];

function ServicesSizePill({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioServicesHeaderTitleSize;
  onChange: (value: PortfolioServicesHeaderTitleSize) => void;
}) {
  const t = useT();
  return (
    <div>
      <ServicesGroupLabel>{label}</ServicesGroupLabel>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-4 gap-1.5">
        {SERVICES_SIZE_PILL_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-2.5 py-2 text-center font-semibold leading-none transition ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
              style={{ fontSize: `${option.fontPx}px` }}
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Chosen option: a light border and a faint tint instead of a solid fill — reads the same in light and dark. */
const SERVICES_STYLE_PILL_ACTIVE =
  'border border-[color:color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_40%,transparent)] bg-[color-mix(in_srgb,var(--pf-palette-texte-fort,#171717)_7%,transparent)] text-[color:var(--pf-palette-texte-fort,#171717)]';
const SERVICES_STYLE_PILL_IDLE = 'border border-transparent bg-[color:var(--pf-surface)] text-[color:var(--pf-palette-texte-muted)] hover:bg-[color:var(--pf-surface)]';

const SERVICES_SIZE_STEPS: { value: PortfolioServicesHeaderTitleSize; tick: string; name: string }[] = [
  { value: 'sm', tick: 'S', name: 'Small' },
  { value: 'md', tick: 'M', name: 'Medium' },
  { value: 'lg', tick: 'L', name: 'Large' },
  { value: 'xl', tick: 'XL', name: 'Extra large' },
];

/** `css` is the real font-weight each step is drawn in, so the scale can be read at a glance. */
const SERVICES_WEIGHT_STEPS: { value: PortfolioServicesHeaderTitleWeight; tick: string; css: number }[] = [
  { value: 'light', tick: 'Light', css: 300 },
  { value: 'regular', tick: 'Regular', css: 400 },
  { value: 'semibold', tick: 'Semibold', css: 600 },
  { value: 'bold', tick: 'Bold', css: 800 },
];

/** Horizontal bar with one stop per option — same `.pf-exp-centered-slider` control as the
 *  Experience panel's stepped sliders. The current step is named on the right of the label. */
function ServicesSteppedSlider<T extends string>({
  label,
  steps,
  value,
  currentName,
  onChange,
  stepStyle,
}: {
  label: string;
  steps: { value: T; tick: string }[];
  value: T;
  currentName: string;
  onChange: (value: T) => void;
  stepStyle?: (step: { value: T; tick: string }) => CSSProperties;
}) {
  const index = Math.max(0, steps.findIndex((step) => step.value === value));
  const current = steps[index]!;
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <ServicesGroupLabel>{label}</ServicesGroupLabel>
        <span className="text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]" style={stepStyle ? stepStyle(current) : undefined}>
          {currentName}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        step={1}
        value={index}
        aria-label={label}
        aria-valuetext={currentName}
        onChange={(event) => {
          const next = steps[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        className="pf-exp-centered-slider pf-exp-centered-slider--thick"
        style={{ '--pf-exp-slider-fill': `${(index / Math.max(steps.length - 1, 1)) * 100}%` } as CSSProperties}
      />
      <div
        className="pf-exp-centered-slider-ticks"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => (
          <button
            key={step.value}
            type="button"
            data-active={step.value === value ? 'true' : 'false'}
            onClick={() => onChange(step.value)}
            style={{ ...(stepStyle ? stepStyle(step) : null), fontSize: 11, textTransform: 'none', letterSpacing: 0 }}
          >
            {step.tick}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Palette token picker: three equal buttons (dot centered), the chosen name on the right of the label. */
function ServicesColorRow({
  label = 'Color',
  value,
  onChange,
}: {
  label?: string;
  value: PortfolioServicesHeaderPaletteToken;
  onChange: (value: PortfolioServicesHeaderPaletteToken) => void;
}) {
  const t = useT();
  return (
    <div>
      <div className="pf-exp-centered-slider-head">
        <ServicesGroupLabel>{label}</ServicesGroupLabel>
        <span className="text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">
          {SERVICES_HEADER_PALETTE_TOKEN_OPTIONS.find((option) => option.value === value)?.label}
        </span>
      </div>
      <div role="radiogroup" aria-label={label} className="mt-3 grid grid-cols-3 gap-2">
        {SERVICES_HEADER_PALETTE_TOKEN_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={t(option.label)}
              title={t(option.label)}
              onClick={() => onChange(option.value)}
              className={`flex h-10 w-full items-center justify-center rounded-lg transition ${
                active ? SERVICES_STYLE_PILL_ACTIVE : SERVICES_STYLE_PILL_IDLE
              }`}
            >
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-black/10"
                style={{ backgroundColor: servicesHeaderPaletteTokenColor(option.value) }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const SERVICES_MARQUEE_WORD_PLACEHOLDERS = ['Services', 'Optional', 'Optional', 'Optional'] as const;
const SERVICES_MARQUEE_MAX_WORDS = 4;

/**
 * Marquee's words, added one at a time: only Word 1 to start, "Add word" up to four, the last one removable. A removed word is cleared, so the
 * saved header never keeps text the editor no longer shows.
 */
function ServicesMarqueeWords({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const t = useT();
  const keys = [
    'headerMarqueeWord1Text',
    'headerMarqueeWord2Text',
    'headerMarqueeWord3Text',
    'headerMarqueeWord4Text',
  ] as const;
  const lastFilled = keys.reduce((last, key, index) => (services[key]?.trim() ? index : last), -1);
  const [count, setCount] = useState(Math.max(1, lastFilled + 1));

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      {keys.slice(0, count).map((key, index) => {
        const isLast = index === count - 1;
        return (
          <div key={key}>
            <div className="flex h-5 items-center justify-between gap-2">
              <ServicesSectionLabel>{`Word ${index + 1}`}</ServicesSectionLabel>
              {isLast && count > 1 ? (
                <button
                  type="button"
                  aria-label={`Remove word ${index + 1}`}
                  title={t('Remove word')}
                  onClick={() => {
                    onChange({ [key]: '' } as Partial<PortfolioServicesSectionSettings>);
                    setCount(count - 1);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[color:var(--pf-palette-texte-muted)] transition hover:bg-[color:var(--pf-surface)] hover:text-[color:var(--pf-palette-texte-fort)]"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              ) : null}
            </div>
            <input
              type="text"
              value={services[key]}
              placeholder={SERVICES_MARQUEE_WORD_PLACEHOLDERS[index]}
              aria-label={`Word ${index + 1}`}
              onChange={(event) => onChange({ [key]: event.target.value } as Partial<PortfolioServicesSectionSettings>)}
              className={`mt-2 ${SERVICES_INPUT_CLASS}`}
            />
          </div>
        );
      })}
      {count < SERVICES_MARQUEE_MAX_WORDS ? (
        <div className="flex flex-col">
          <div className="h-5" aria-hidden />
          <button
            type="button"
            onClick={() => setCount(count + 1)}
            className="mt-2 flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-[color:var(--pf-palette-bordure)] text-sm font-medium text-[color:var(--pf-palette-texte-muted)] transition hover:border-[color:var(--pf-palette-texte-muted)] hover:text-[color:var(--pf-palette-texte-fort)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('Add word')}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Marquee's words share one style: a single color and size for the whole running line. */
function ServicesMarqueeStyle({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const t = useT();
  const color = services.headerMarqueeWordColor ?? 'principal';
  const size = services.headerMarqueeSize ?? 'md';
  const styled = color !== 'principal' || size !== 'md';
  return (
    <div className="pf-exp-centered-config space-y-8">
      <div className="flex items-center justify-between gap-3">
        <ServicesGroupLabel>{t('Text style')}</ServicesGroupLabel>
        {styled ? (
          <button
            type="button"
            onClick={() => onChange({ headerMarqueeWordColor: 'principal', headerMarqueeSize: 'md' })}
            className="text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline-offset-2 transition hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
          >
            {t('Reset')}
          </button>
        ) : null}
      </div>
      <ServicesColorRow value={color} onChange={(headerMarqueeWordColor) => onChange({ headerMarqueeWordColor })} />
      <ServicesSteppedSlider
        label={t('Size')}
        steps={SERVICES_SIZE_STEPS}
        value={size}
        currentName={SERVICES_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
        onChange={(headerMarqueeSize) => onChange({ headerMarqueeSize })}
      />
    </div>
  );
}

/** One styleable text of a header: which settings hold its color / size / weight (any can be absent). */
type ServicesStyleTarget = {
  id: string;
  label: string;
  color?: { key: string; fallback: PortfolioServicesHeaderPaletteToken };
  size?: { key: string; fallback: PortfolioServicesHeaderTitleSize };
  weight?: { key: string; fallback: PortfolioServicesHeaderTitleWeight };
};

/**
 * Style editor shared by every Services header design: pick the text to style (radio — hidden when
 * there is only one), then set only the controls that text actually has: color, size, weight.
 * Replaces a Color / Size / Weight triplet per text, so each design reads the same way.
 */
function ServicesStyleTargetsEditor({
  services,
  onChange,
  targets,
  initialId,
  title = 'Text style',
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  targets: ServicesStyleTarget[];
  initialId?: string;
  title?: string;
}) {
  const t = useT();
  const [targetId, setTargetId] = useState(initialId ?? targets[0]!.id);
  const target = targets.find((item) => item.id === targetId) ?? targets[0]!;
  const record = services as unknown as Record<string, unknown>;
  const read = <T,>(field: { key: string; fallback: T }): T => (record[field.key] as T | undefined) ?? field.fallback;
  const apply = (key: string, value: string) =>
    onChange({ [key]: value } as Partial<PortfolioServicesSectionSettings>);

  const color = target.color ? read(target.color) : null;
  const size = target.size ? read(target.size) : null;
  const weight = target.weight ? read(target.weight) : null;
  const styled =
    (target.color && color !== target.color.fallback) ||
    (target.size && size !== target.size.fallback) ||
    (target.weight && weight !== target.weight.fallback);

  return (
    <div className="pf-exp-centered-config space-y-8">
      <div className="flex items-center justify-between gap-3">
        <ServicesGroupLabel>{title}</ServicesGroupLabel>
        {styled ? (
          <button
            type="button"
            onClick={() => {
              const patch: Record<string, string> = {};
              for (const field of [target.color, target.size, target.weight]) {
                if (field) patch[field.key] = field.fallback;
              }
              onChange(patch as Partial<PortfolioServicesSectionSettings>);
            }}
            className="text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline-offset-2 transition hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
          >
            {t('Reset')}
          </button>
        ) : null}
      </div>

      {targets.length > 1 ? (
        <div
          role="radiogroup"
          aria-label={t('Text to style')}
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${targets.length}, minmax(0, 1fr))` }}
        >
          {targets.map((item) => {
            const on = item.id === target.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTargetId(item.id)}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-[13px] font-semibold transition ${
                  on ? SERVICES_STYLE_PILL_ACTIVE : SERVICES_STYLE_PILL_IDLE
                }`}
              >
                <span
                  aria-hidden
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    on ? 'border-current' : 'border-[color:var(--pf-palette-bordure)]'
                  }`}
                >
                  {on ? <span className="h-2 w-2 rounded-full bg-current" /> : null}
                </span>
                <span className="truncate">{t(item.label)}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {target.color && color ? (
        <ServicesColorRow value={color} onChange={(next) => apply(target.color!.key, next)} />
      ) : null}

      {target.size && size ? (
        <ServicesSteppedSlider
          label={t('Size')}
          steps={SERVICES_SIZE_STEPS}
          value={size}
          currentName={SERVICES_SIZE_STEPS.find((step) => step.value === size)?.name ?? ''}
          onChange={(next) => apply(target.size!.key, next)}
        />
      ) : null}

      {target.weight && weight ? (
        <ServicesSteppedSlider
          label={t('Weight')}
          steps={SERVICES_WEIGHT_STEPS}
          value={weight}
          currentName={SERVICES_WEIGHT_STEPS.find((step) => step.value === weight)?.tick ?? ''}
          onChange={(next) => apply(target.weight!.key, next)}
          stepStyle={(step) => ({ fontWeight: SERVICES_WEIGHT_STEPS.find((item) => item.value === step.value)?.css })}
        />
      ) : null}
    </div>
  );
}

/** Label / Title / Subtitle, each with color + size + weight (Editorial, Index, Serif lead). */
function ServicesTextStyleEditor({
  services,
  onChange,
  prefix,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  /** Settings key prefix of the header design, e.g. `headerEditorial` -> `headerEditorialTitleColor`. */
  prefix: 'headerEditorial' | 'headerIndex' | 'headerSerifLead';
}) {
  const targets: ServicesStyleTarget[] = (['Label', 'Title', 'Subtitle'] as const).map((name) => ({
    id: name,
    label: name,
    color: { key: `${prefix}${name}Color`, fallback: 'texteFort' },
    size: { key: `${prefix}${name}Size`, fallback: 'md' },
    weight: { key: `${prefix}${name}Weight`, fallback: 'regular' },
  }));
  return <ServicesStyleTargetsEditor services={services} onChange={onChange} targets={targets} initialId="Title" />;
}

/** Hairline-separated block under a design's text fields. */
function ServicesHeaderBlock({ children }: { children: ReactNode }) {
  return <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">{children}</div>;
}

/** Mini wireframes for the 8 Header design picker cards — same ServicesMiniSlide mechanism
 *  as the generic shapes Stack/Contact use for their own Header design picker. */
function ServicesHeaderDesignWireframe({ design }: { design: PortfolioServicesHeaderDesign }) {
  const t = useT();
  switch (design) {
    case 'editorial':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="16" width="18" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="26" width="64" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="42" width="46" height="4" rx="2" />
        </ServicesMiniSlide>
      );
    case 'marquee':
      return (
        <ServicesMiniSlide>
          <text
            x="60"
            y="34"
            fontSize={22}
            fontWeight={800}
            textAnchor="middle"
            opacity={0.14}
            className="pf-stack-mini-ink"
          >
            {t('SERVICES')}
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="84" height="10" rx="2" />
        </ServicesMiniSlide>
      );
    case 'index':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="4" height="4" />
          <rect className="pf-stack-mini-mute" x="20" y="13" width="90" height="1" />
          <ServicesMiniType x={10} y={40} size={22}>
            04
          </ServicesMiniType>
          <rect className="pf-stack-mini-mute" x="46" y="22" width="1" height="18" />
          <rect className="pf-stack-mini-ink" x="54" y="24" width="46" height="7" rx="2" />
        </ServicesMiniSlide>
      );
    case 'accent-count':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-accent" x="10" y="12" width="26" height="8" rx="4" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="40" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="33" width="60" height="7" rx="2" />
        </ServicesMiniSlide>
      );
    case 'serif-lead':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="14" width="20" height="3" rx="1.5" />
          <rect className="pf-stack-mini-ink" x="10" y="24" width="76" height="11" rx="2" />
        </ServicesMiniSlide>
      );
    case 'billboard':
      return (
        <ServicesMiniSlide>
          <text
            x="60"
            y="30"
            fontSize={26}
            fontWeight={900}
            textAnchor="middle"
            opacity={0.1}
            className="pf-stack-mini-ink"
          >
            {t('SERVICES')}
          </text>
          <rect className="pf-stack-mini-ink" x="18" y="30" width="60" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="18" y="42" width="40" height="3" rx="1.5" />
        </ServicesMiniSlide>
      );
    case 'masthead':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="100" height="1" />
          <rect className="pf-stack-mini-ink" x="10" y="20" width="100" height="12" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="38" width="100" height="1" />
        </ServicesMiniSlide>
      );
    case 'split-heading':
      return (
        <ServicesMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="20" width="58" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="86" y="18" width="24" height="3" rx="1.5" />
        </ServicesMiniSlide>
      );
    default: {
      const _exhaustive: never = design;
      return _exhaustive;
    }
  }
}

/** Same collapsed-preview / expand-to-grid mechanism as Stack/Contact's own Header design picker. */
function ServicesHeaderChoiceGrid({
  value,
  onChange,
  open: showGrid,
  onOpenChange: setShowGrid,
}: {
  value: PortfolioServicesHeaderDesign;
  onChange: (value: PortfolioServicesHeaderDesign) => void;
  /** Whether the catalog of designs is open (owned by the panel so it can hide the settings below). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const selected =
    PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS.find((option) => option.value === value) ??
    PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS[0];

  if (showGrid) {
    return (
      <div className="np-stack">
        <NpBackRow title={t('Header design')} onBack={() => setShowGrid(false)} />
        <NpOptionCardGroup label={t('Choose a header')} columns={2}>
          {PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS.map((option) => {
            return (
              <PortfolioHeaderDesignOption key={option.value} design={option.value}>
                <NpOptionCard
                  selected={option.value === value}
                  title={t(option.label)}
                  illustration={<ServicesHeaderDesignWireframe design={option.value} />}
                  onClick={() => {
                    onChange(option.value);
                    setShowGrid(false);
                  }}
                />
              </PortfolioHeaderDesignOption>
            );
          })}
        </NpOptionCardGroup>
      </div>
    );
  }

  return (
    <NpPickerRow label={t('Header design')} value={t(selected.label)} thumbnail={<ServicesHeaderDesignWireframe design={value} />} onClick={() => setShowGrid(true)} />
  );
}

const SERVICES_HEADER_MARGIN_BOTTOM_OPTIONS = [
  { value: 'sm' as const, label: msg('Small') },
  { value: 'md' as const, label: msg('Medium') },
  { value: 'lg' as const, label: msg('Large') },
  { value: 'xl' as const, label: 'XL' },
];

const SERVICES_HEADER_TITLE_WEIGHT_OPTIONS = [
  { value: 'light' as const, label: msg('Light'), description: msg('Lighter than this design’s default.') },
  { value: 'regular' as const, label: msg('Regular'), description: msg('This design’s default weight.') },
  { value: 'semibold' as const, label: msg('Semibold'), description: msg('A step bolder.') },
  { value: 'bold' as const, label: msg('Bold'), description: msg('The boldest step.') },
];

/** Bottom spacing — plus alignment and the shared title size/weight, but
 *  only where the chosen design actually reads them (dead controls left visible are
 *  confusing, so each branch passes `hideAlignment`/`hideTitleControls` to match). Same
 *  shape as Gallery's and Team's own shared header controls. */
function ServicesHeaderSharedAdvancedControls({
  services,
  onChange,
  hideAlignment = false,
  hideTitleControls = false,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  hideAlignment?: boolean;
  hideTitleControls?: boolean;
}) {
  const t = useT();
  return (
    <div className="space-y-7 border-t border-[color:var(--pf-palette-bordure)] pt-9">
      {hideAlignment ? null : (
        <ServicesOptionGrid
          label={t('Header alignment')}
          options={[
            { value: 'left' as const, label: t('Left') },
            { value: 'center' as const, label: t('Center') },
            { value: 'right' as const, label: t('Right') },
          ]}
          value={services.headerDesignAlignment}
          onChange={(headerDesignAlignment: PortfolioServicesHeaderDesignAlignment) => onChange({ headerDesignAlignment })}
          columns={3}
        />
      )}
      <ServicesOptionGrid
        label={t('Bottom spacing')}
        options={SERVICES_HEADER_MARGIN_BOTTOM_OPTIONS}
        value={services.headerMarginBottom ?? 'md'}
        onChange={(headerMarginBottom) => onChange({ headerMarginBottom })}
        columns={4}
      />
      {hideTitleControls ? null : (
        <>
          <ServicesSizePill
            label={t('Title size')}
            value={services.headerTitleSize ?? 'md'}
            onChange={(headerTitleSize) => onChange({ headerTitleSize })}
          />
          <ServicesOptionGrid
            label={t('Title weight')}
            options={SERVICES_HEADER_TITLE_WEIGHT_OPTIONS}
            value={services.headerTitleWeight ?? 'regular'}
            onChange={(headerTitleWeight: PortfolioServicesHeaderTitleWeight) => onChange({ headerTitleWeight })}
            columns={4}
          />
        </>
      )}
    </div>
  );
}

const SERVICES_RADIUS_GLYPH_PX: Record<string, number> = { auto: 6, square: 0, soft: 3, rounded: 7, xl: 11 };
const SERVICES_BORDER_GLYPH_STROKE: Record<string, number> = { auto: 1.6, none: 0, thin: 1, medium: 2.2, thick: 3.6 };

function servicesRadiusGlyph(value: string): ReactNode {
  return (
    <rect
      x="6"
      y="5"
      width="28"
      height="18"
      rx={SERVICES_RADIUS_GLYPH_PX[value] ?? 6}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeDasharray={value === 'auto' ? '3 2.5' : undefined}
    />
  );
}

function servicesBorderGlyph(value: string): ReactNode {
  const stroke = SERVICES_BORDER_GLYPH_STROKE[value] ?? 1.6;
  return (
    <rect
      x="6"
      y="5"
      width="28"
      height="18"
      rx="5"
      fill={value === 'none' ? 'currentColor' : 'none'}
      fillOpacity={value === 'none' ? 0.14 : undefined}
      stroke={value === 'none' ? 'none' : 'currentColor'}
      strokeWidth={stroke}
      strokeDasharray={value === 'auto' ? '3 2.5' : undefined}
    />
  );
}

function ServicesLayoutSettingsBand({
  children,
  motionKey,
  id = 'services-layout-settings-title',
  title = 'Header settings',
  ariaTitle,
  flush = false,
}: {
  children: ReactNode;
  motionKey: string;
  id?: string;
  /** Visible heading; pass '' to hide it (the band then announces `ariaTitle` instead). */
  title?: string;
  ariaTitle?: string;
  /** Drops the boxed frame so the fields use the dock's full width. */
  flush?: boolean;
}) {
  return (
    <section
      className={`pf-exp-layout-settings${flush ? ' pf-exp-layout-settings--flush' : ''}`}
      aria-labelledby={id}
    >
      {title ? (
        <h3 id={id} className="pf-exp-layout-settings-title">
          {title}
        </h3>
      ) : (
        <h3 id={id} className="sr-only">
          {ariaTitle}
        </h3>
      )}
      <div key={motionKey} className={`pf-exp-layout-settings-body ${flush ? 'space-y-9' : 'space-y-7'}`}>
        {children}
      </div>
    </section>
  );
}


/* ---------------------------------------------------------------------- */
/* Pricing designs — the card / border / button options they all share.     */
/* ---------------------------------------------------------------------- */

/** 40×28 preview of one List bullet option: the marker in front of two text lines. */
function servicesListBulletGlyph(bullet: PortfolioServicesListBullet): ReactNode {
  const line = (y: number) => <rect key={y} x="14" y={y - 1} width="20" height="2" rx="1" fill="currentColor" opacity="0.45" />;
  const mark = (y: number, n: number) => {
    switch (bullet) {
      case 'auto':
        return (
          <text key={`m${y}`} x="9" y={y + 2.5} fontSize="7" fontWeight="700" textAnchor="middle" fill="currentColor">
            A
          </text>
        );
      case 'check':
        return <path key={`m${y}`} d={`M6 ${y}l2 2 4-4`} stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      case 'checkCircle':
        return (
          <g key={`m${y}`}>
            <circle cx="9" cy={y} r="4" fill="currentColor" opacity="0.2" />
            <path d={`M7 ${y}l1.4 1.4 2.6-2.8`} stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'dot':
        return <circle key={`m${y}`} cx="9" cy={y} r="1.6" fill="currentColor" />;
      case 'dash':
        return <rect key={`m${y}`} x="5" y={y - 0.6} width="7" height="1.2" fill="currentColor" />;
      case 'arrow':
        return <path key={`m${y}`} d={`M5 ${y}h6m-2.5-2.5L11 ${y}l-2.5 2.5`} stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />;
      case 'plus':
        return <path key={`m${y}`} d={`M9 ${y - 3}v6M6 ${y}h6`} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />;
      case 'number':
        return (
          <text key={`m${y}`} x="9" y={y + 2.2} fontSize="6" fontFamily="monospace" textAnchor="middle" fill="currentColor">
            {`0${n}`}
          </text>
        );
      default:
        return null;
    }
  };
  return (
    <>
      {mark(9, 1)}
      {line(9)}
      {mark(19, 2)}
      {line(19)}
    </>
  );
}

/** General → Price text: the wording for services priced on request or free, read by every
 *  Services design (an empty field keeps the design's own wording). */
function ServicesPriceTextFields({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: ServicesSettingsChange;
}) {
  const t = useT();
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  return (
    <div className="space-y-5">
      <div>
        <ServicesSectionLabel>{t('Price on request')}</ServicesSectionLabel>
        <div className="mt-2">
          <SvTextInput
            label={t('Price on request text')}
            density="regular"
            allowEmpty
            maxLength={32}
            value={style.quotePriceLabel ?? ''}
            placeholder={t('Custom, On request, Let\'s talk…')}
            onCommit={(quotePriceLabel) => setStyle({ quotePriceLabel })}
          />
        </div>
      </div>
      <div>
        <ServicesSectionLabel>{t('Free')}</ServicesSectionLabel>
        <div className="mt-2">
          <SvTextInput
            label={t('Free price text')}
            density="regular"
            allowEmpty
            maxLength={32}
            value={style.freePriceLabel ?? ''}
            placeholder={t('Free')}
            onCommit={(freePriceLabel) => setStyle({ freePriceLabel })}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * General → Order button: one set of options (label, look, shape, destination) read by every Services
 * design that has an order button — Pricing Cards, Aurora and Toggle — so nothing
 * has to be configured again per design.
 */
function ServicesOrderButtonFields({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: ServicesSettingsChange;
}) {
  const t = useT();
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  return (
    <div className="space-y-5">
      <div>
        <ServicesSectionLabel>{t('Button label')}</ServicesSectionLabel>
        <div className="mt-2">
          <SvTextInput
            label={t('Button label')}
            density="regular"
            maxLength={32}
            value={services.ctaLabel}
            placeholder={t('Get started')}
            onCommit={(ctaLabel) => onChange({ ctaLabel })}
          />
        </div>
      </div>
      <ServicesOptionGrid
        label={t('Button look')}
        options={PORTFOLIO_SERVICES_PRICING_CTA_STYLE_OPTIONS}
        value={style.ctaStyle}
        onChange={(ctaStyle) => setStyle({ ctaStyle })}
        columns={4}
      />
      <ServicesOptionGrid
        label={t('Button shape')}
        options={PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS}
        value={style.ctaShape}
        onChange={(ctaShape) => setStyle({ ctaShape })}
        columns={4}
      />
      <ServicesOptionGrid
        label={t('Links to')}
        options={PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS}
        value={style.ctaLinkMode}
        onChange={(ctaLinkMode) => setStyle({ ctaLinkMode })}
        columns={3}
      />
      {style.ctaLinkMode === 'section' ? (
        <ServicesOptionGrid
          label={t('Section')}
          options={PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS}
          value={style.ctaLinkSection}
          onChange={(ctaLinkSection) => setStyle({ ctaLinkSection })}
          columns={3}
        />
      ) : null}
      {style.ctaLinkMode === 'url' ? (
        <>
          <ServicesTextField
            label={t('Link')}
            value={style.ctaLinkUrl}
            placeholder="https://cal.com/you or you@mail.com"
            onChange={(ctaLinkUrl) => setStyle({ ctaLinkUrl })}
          />
          <ServicesVisibilityRow
            label={t('Open in a new tab')}
            checked={style.ctaLinkNewTab}
            onChange={(ctaLinkNewTab) => setStyle({ ctaLinkNewTab })}
          />
        </>
      ) : null}
    </div>
  );
}

function ServicesHeaderDesignFields({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const t = useT();
  const design = services.headerDesign ?? 'editorial';

  if (design === 'index') {
    const numberColor = services.headerIndexNumberColor ?? 'principal';
    return (
      <>
        <div className="space-y-6">
          <ServicesTextField
            label={t('Rule label')}
            value={services.headerIndexLabelText}
            placeholder={t('Index')}
            onChange={(headerIndexLabelText) => onChange({ headerIndexLabelText })}
          />
          <ServicesTextField
            label={t('Title')}
            value={services.headerIndexTitleText}
            placeholder={t('Core services')}
            onChange={(headerIndexTitleText) => onChange({ headerIndexTitleText })}
          />
          <ServicesTextField
            label={t('Subtitle')}
            value={services.headerIndexSubtitleText}
            placeholder={t('A clear breakdown of what you can hire me for.')}
            onChange={(headerIndexSubtitleText) => onChange({ headerIndexSubtitleText })}
            multiline
          />
          <ServicesTextField
            label={t('Count label')}
            value={services.headerIndexCountLabelText}
            placeholder={t('Services')}
            onChange={(headerIndexCountLabelText) => onChange({ headerIndexCountLabelText })}
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <ServicesTextStyleEditor services={services} onChange={onChange} prefix="headerIndex" />
        </div>
        <div className="pf-exp-centered-config border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <div className="mb-8 flex items-center justify-between gap-3">
            <ServicesGroupLabel>{t('Counter')}</ServicesGroupLabel>
            {numberColor !== 'principal' ? (
              <button
                type="button"
                onClick={() => onChange({ headerIndexNumberColor: 'principal' })}
                className="text-xs font-medium text-[color:var(--pf-palette-texte-muted)] underline-offset-2 transition hover:text-[color:var(--pf-palette-texte-fort)] hover:underline"
              >
                {t('Reset')}
              </button>
            ) : null}
          </div>
          <ServicesColorRow
            label={t('Numeral color')}
            value={numberColor}
            onChange={(headerIndexNumberColor) => onChange({ headerIndexNumberColor })}
          />
        </div>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'marquee') {
    return (
      <>
        <ServicesMarqueeWords services={services} onChange={onChange} />
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <ServicesMarqueeStyle services={services} onChange={onChange} />
        </div>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  if (design === 'accent-count') {
    return (
      <>
        <div className="space-y-6">
          <ServicesTextField
            label={t('Badge text')}
            value={services.headerAccentCountBadgeText}
            placeholder={t('{count}+ services')}
            onChange={(headerAccentCountBadgeText) => onChange({ headerAccentCountBadgeText })}
          />
          <ServicesTextField
            label={t('Lead text')}
            value={services.headerAccentCountLeadText}
            placeholder={t('A curated set of services, ready when you need them.')}
            onChange={(headerAccentCountLeadText) => onChange({ headerAccentCountLeadText })}
            multiline
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            initialId="lead"
            targets={[
              { id: 'badge', label: t('Badge'), color: { key: 'headerAccentCountBadgeColor', fallback: 'principal' } },
              {
                id: 'lead',
                label: t('Lead'),
                color: { key: 'headerAccentCountLeadColor', fallback: 'secondaire' },
                weight: { key: 'headerAccentCountWeight', fallback: 'regular' },
              },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderBlock>
          <div className="pf-exp-centered-config space-y-8">
            <ServicesSteppedSlider
              label={t('Size (badge and lead)')}
              steps={SERVICES_SIZE_STEPS}
              value={services.headerAccentCountSize ?? 'md'}
              currentName={SERVICES_SIZE_STEPS.find((step) => step.value === (services.headerAccentCountSize ?? 'md'))?.name ?? ''}
              onChange={(headerAccentCountSize) => onChange({ headerAccentCountSize })}
            />
            <ServicesOptionGrid
              label={t('Alignment')}
              options={SERVICES_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS}
              value={services.headerAccentCountAlignment ?? 'left'}
              onChange={(headerAccentCountAlignment: PortfolioServicesHeaderAccentCountAlignment) =>
                onChange({ headerAccentCountAlignment })
              }
              columns={3}
            />
          </div>
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  if (design === 'serif-lead') {
    return (
      <>
        <div className="space-y-6">
          <ServicesTextField
            label={t('Label')}
            value={services.headerSerifLeadLabelText}
            placeholder={t('Services')}
            onChange={(headerSerifLeadLabelText) => onChange({ headerSerifLeadLabelText })}
          />
          <ServicesTextField
            label={t('Title')}
            value={services.headerSerifLeadTitleText}
            placeholder={t('A focused set of services, built around what you need.')}
            onChange={(headerSerifLeadTitleText) => onChange({ headerSerifLeadTitleText })}
            multiline
          />
          <ServicesTextField
            label={t('Subtitle')}
            value={services.headerSerifLeadSubtitleText}
            placeholder={t('What I can help you with.')}
            onChange={(headerSerifLeadSubtitleText) => onChange({ headerSerifLeadSubtitleText })}
            multiline
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <ServicesHeaderBlock>
          <ServicesTextStyleEditor services={services} onChange={onChange} prefix="headerSerifLead" />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'billboard') {
    return (
      <>
        <div className="space-y-6">
          <ServicesTextField
            label={t('Big background word')}
            value={services.headerBillboardBigWord}
            placeholder="SERVICES"
            onChange={(headerBillboardBigWord) => onChange({ headerBillboardBigWord })}
          />
          <ServicesTextField
            label={t('Title')}
            value={services.headerBillboardTitleText}
            placeholder={t('Core services')}
            onChange={(headerBillboardTitleText) => onChange({ headerBillboardTitleText })}
          />
          <ServicesTextField
            label={t('Count line')}
            value={services.headerBillboardCountText}
            placeholder={t('{count} services')}
            onChange={(headerBillboardCountText) => onChange({ headerBillboardCountText })}
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            initialId="title"
            targets={[
              { id: 'word', label: t('Big word'), color: { key: 'headerBillboardWordColor', fallback: 'principal' } },
              { id: 'title', label: t('Title'), color: { key: 'headerBillboardTitleColor', fallback: 'principal' } },
              { id: 'count', label: t('Count line'), color: { key: 'headerBillboardMetaColor', fallback: 'secondaire' } },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderBlock>
          <ServicesOptionGrid
            label={t('Big word style')}
            options={SERVICES_HEADER_BILLBOARD_WORD_STYLE_OPTIONS}
            value={services.headerBillboardWordStyle ?? 'outline'}
            onChange={(headerBillboardWordStyle: PortfolioServicesHeaderBillboardWordStyle) =>
              onChange({ headerBillboardWordStyle })
            }
            columns={3}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  if (design === 'masthead') {
    return (
      <>
        <div className="space-y-6">
          <ServicesTextField
            label={t('Line 1')}
            value={services.headerMastheadLine1Text}
            placeholder={t('Core services.')}
            onChange={(headerMastheadLine1Text) => onChange({ headerMastheadLine1Text })}
          />
          <ServicesTextField
            label={t('Line 2')}
            value={services.headerMastheadLine2Text}
            placeholder={t('Chosen with intent.')}
            onChange={(headerMastheadLine2Text) => onChange({ headerMastheadLine2Text })}
          />
          <ServicesTextField
            label={t('Line 3')}
            value={services.headerMastheadLine3Text}
            placeholder={t('Kept up to date.')}
            onChange={(headerMastheadLine3Text) => onChange({ headerMastheadLine3Text })}
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            title={t('Headline style')}
            targets={[
              {
                id: 'headline',
                label: t('Headline'),
                color: { key: 'headerMastheadHeadlineColor', fallback: 'principal' },
                size: { key: 'headerMastheadHeadlineSize', fallback: 'md' },
                weight: { key: 'headerMastheadHeadlineWeight', fallback: 'regular' },
              },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
      </>
    );
  }

  if (design === 'split-heading') {
    return (
      <>
        <div className="space-y-6">
          <ServicesTextField
            label={t('Title')}
            value={services.headerSplitHeadingTitleText}
            placeholder={t('Core services')}
            onChange={(headerSplitHeadingTitleText) => onChange({ headerSplitHeadingTitleText })}
          />
          <ServicesTextField
            label={t('Label')}
            value={services.headerSplitHeadingLabelText}
            placeholder={t('Services')}
            onChange={(headerSplitHeadingLabelText) => onChange({ headerSplitHeadingLabelText })}
          />
        </div>
        <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
          <HeaderElementToggles
            design={design}
            settings={services}
            onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
          />
        </div>
        <ServicesHeaderBlock>
          <ServicesStyleTargetsEditor
            services={services}
            onChange={onChange}
            initialId="title"
            targets={[
              {
                id: 'title',
                label: t('Title'),
                color: { key: 'headerSplitHeadingTitleColor', fallback: 'principal' },
                size: { key: 'headerSplitHeadingTitleSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingTitleWeight', fallback: 'regular' },
              },
              {
                id: 'label',
                label: t('Label'),
                color: { key: 'headerSplitHeadingLabelColor', fallback: 'secondaire' },
                size: { key: 'headerSplitHeadingLabelSize', fallback: 'md' },
                weight: { key: 'headerSplitHeadingLabelWeight', fallback: 'regular' },
              },
            ]}
          />
        </ServicesHeaderBlock>
        <ServicesHeaderSharedAdvancedControls
          services={services}
          onChange={onChange}
          hideAlignment
          hideTitleControls
        />
      </>
    );
  }

  // Editorial — kicker + title + subtitle: the three texts first, then one shared style editor.
  // An empty text falls back to the kicker "Services" / the section title / the section subtitle.
  return (
    <>
      <div className="space-y-6">
        <ServicesTextField
          label={t('Label')}
          value={services.headerEditorialLabelText}
          placeholder={t('Services')}
          onChange={(headerEditorialLabelText) => onChange({ headerEditorialLabelText })}
        />
        <ServicesTextField
          label={t('Title')}
          value={services.headerEditorialTitleText}
          placeholder={t('What I offer')}
          onChange={(headerEditorialTitleText) => onChange({ headerEditorialTitleText })}
        />
        <ServicesTextField
          label={t('Subtitle')}
          value={services.headerEditorialSubtitleText}
          placeholder={t('What I can help you with.')}
          onChange={(headerEditorialSubtitleText) => onChange({ headerEditorialSubtitleText })}
          multiline
        />
      </div>
      <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
        <HeaderElementToggles
          design={design}
          settings={services}
          onPatch={(patch) => onChange(patch as Partial<PortfolioServicesSectionSettings>)}
        />
      </div>
      <div className="border-t border-[color:var(--pf-palette-bordure)] pt-9">
        <ServicesTextStyleEditor services={services} onChange={onChange} prefix="headerEditorial" />
      </div>
      <ServicesHeaderSharedAdvancedControls services={services} onChange={onChange} hideTitleControls />
    </>
  );
}

type ServicesSettingsChange = (patch: Partial<PortfolioServicesSectionSettings>) => void;

function servicesLabelOf(options: readonly { value: string | number; label: string }[], value: string | number): string {
  return options.find((option) => String(option.value) === String(value))?.label ?? '';
}

function servicesSettingDot(color: string, auto = false): ReactNode {
  return (
    <span
      aria-hidden
      className={`block h-3.5 w-3.5 rounded-full ${auto ? 'border border-dashed border-current' : 'border border-black/10'}`}
      style={auto ? undefined : { backgroundColor: color }}
    />
  );
}

function servicesSettingGlyph(shape: ReactNode): ReactNode {
  return (
    <svg viewBox="0 0 40 28" className="h-5 w-7" fill="none" aria-hidden>
      {shape}
    </svg>
  );
}

function servicesPaletteColor(services: PortfolioServicesSectionSettings, token: string): string {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  return resolveHeroPaletteColor(palette, token as HeroPaletteTokenId);
}

/** "Cards per row" item shared by the column-based designs. */
function servicesColumnsItem<T extends number>(
  options: readonly { value: T; label: string }[],
  value: T,
  onPick: (value: T) => void,
  label = 'Cards per row'
): SettingItem {
  return {
    id: 'cards-per-row',
    label,
    value: servicesLabelOf(options, value),
    render: (density) => (
      <SvChoiceTiles
        label={label}
        density={density}
        glyphViewBox="0 0 64 34"
        stage
        options={options.map((option) => ({
          value: String(option.value),
          label: option.label,
          glyph: servicesPricingColumnsGlyph(option.value as 1 | 2 | 3 | 4),
        }))}
        value={String(value)}
        onChange={(next) => onPick(Number(next) as T)}
      />
    ),
  };
}

/** The shared "Featured card" group: which card, its badge, its colour and (where it has a
 *  background) its background opacity. Every Services design with cards reads the same fields. */
function servicesFeaturedGroup(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange,
  availableServices: { id: string; title: string }[],
  opacityDesign: ServicesFeaturedDesignKey | null
): SettingGroup {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  const items: SettingItem[] = [
    {
      id: 'featured-source',
      label: 'Featured card',
      info: 'Highlights one card. Pick it here, or let the services you marked Popular in the Services editor decide.',
      value: servicesLabelOf(PORTFOLIO_SERVICES_FEATURED_SOURCE_OPTIONS, style.featuredSource),
      render: (density) => (
        <SvChoiceTiles
          label="Featured card"
          density={density}
          options={PORTFOLIO_SERVICES_FEATURED_SOURCE_OPTIONS}
          value={style.featuredSource}
          onChange={(featuredSource) => setStyle({ featuredSource })}
        />
      ),
    },
  ];
  if (style.featuredSource === 'index') {
    const options = availableServices.map((service, index) => ({
      value: String(index),
      label: service.title.trim() || `Service ${index + 1}`,
    }));
    const value = String(Math.min(style.featuredIndex, Math.max(availableServices.length - 1, 0)));
    items.push({
      id: 'featured-pick',
      label: 'Which card',
      value: options.length ? servicesLabelOf(options, value) : 'None yet',
      wide: true,
      render: (density) =>
        options.length ? (
          <SvPickOne
            label="Featured card"
            density={density}
            options={options}
            value={value}
            onChange={(next) => setStyle({ featuredIndex: Number(next) })}
          />
        ) : (
          <p className="text-xs text-[color:var(--pf-palette-texte-muted)]">Add a service to choose which card is featured.</p>
        ),
    });
  }
  if (style.featuredSource === 'service') {
    items.push({
      id: 'featured-from-flag',
      label: 'Marked popular',
      wide: true,
      render: () => (
        <p className="text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">
          The first service you ticked <strong>Popular</strong> in the Services editor is featured.
        </p>
      ),
    });
  }
  if (style.featuredSource !== 'none') {
    items.push({
      id: 'featured-show-label',
      label: 'Show a label',
      toggle: { checked: style.featuredShowLabel, onChange: (featuredShowLabel) => setStyle({ featuredShowLabel }) },
    });
    if (style.featuredShowLabel) {
      items.push({
        id: 'featured-label',
        label: 'Label text',
        info: 'The badge on the featured card — Popular, Best value, Top pick…',
        value: style.featuredLabel || 'Popular',
        wide: true,
        render: (density) => (
          <SvTextInput
            label="Featured label"
            density={density}
            allowEmpty
            maxLength={32}
            value={style.featuredLabel}
            placeholder="Popular"
            onCommit={(featuredLabel) => setStyle({ featuredLabel })}
          />
        ),
      });
    }
    const colorOptions = PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS.map((option) => ({
      value: option.value,
      label: option.label,
      auto: option.value === 'auto',
      color: option.value === 'auto' ? 'transparent' : servicesPaletteColor(services, option.value),
    }));
    items.push({
      id: 'featured-color',
      label: 'Color',
      info: "Colors the featured card from the active theme palette. Default keeps the design's own accent.",
      value: servicesLabelOf(colorOptions, style.featuredColor),
      preview: servicesSettingDot(servicesPaletteColor(services, style.featuredColor), style.featuredColor === 'auto'),
      render: (density) => (
        <SvSwatches
          label="Featured card color"
          density={density}
          options={colorOptions}
          value={style.featuredColor}
          onChange={(next) => setStyle({ featuredColor: next as typeof style.featuredColor })}
        />
      ),
    });
    if (opacityDesign) {
      const opacity = style.featuredOpacity ?? SERVICES_FEATURED_DEFAULT_OPACITY[opacityDesign];
      items.push({
        id: 'featured-opacity',
        label: 'Background opacity',
        info: 'How strongly the colour fills the featured card. Lower it to let the page show through.',
        value: `${opacity}%`,
        render: (density) => (
          <SvSlider
            label="Featured background opacity"
            density={density}
            value={opacity}
            onChange={(featuredOpacity) => setStyle({ featuredOpacity })}
          />
        ),
      });
    }
  }
  return { id: 'featured', title: 'Featured card', items };
}

/** "Price" group: the price's period suffix ("/ month") — from each service's own billing period,
 *  one label for all, or hidden. Whether the price shows at all is General → Price. */
function servicesPriceGroup(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange
): SettingGroup {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  const items: SettingItem[] = [];
  {
    items.push({
      id: 'billing-source',
      label: 'Billing period',
      info: "Each service's period (per day, month or year) is set in the Services editor and shown after its price.",
      value: servicesLabelOf(PORTFOLIO_SERVICES_BILLING_SOURCE_OPTIONS, style.billingSource),
      render: (density) => (
        <SvChoiceTiles
          label="Billing period"
          density={density}
          options={PORTFOLIO_SERVICES_BILLING_SOURCE_OPTIONS}
          value={style.billingSource}
          onChange={(billingSource) => setStyle({ billingSource })}
        />
      ),
    });
    if (style.billingSource === 'custom') {
      items.push({
        id: 'billing-label',
        label: 'Period text',
        value: style.billingCustomLabel || 'None',
        wide: true,
        render: (density) => (
          <SvTextInput
            label="Period text"
            density={density}
            allowEmpty
            maxLength={24}
            value={style.billingCustomLabel}
            placeholder="/ month"
            onCommit={(billingCustomLabel) => setStyle({ billingCustomLabel })}
          />
        ),
      });
    }
  }
  return { id: 'price', title: 'Price', items };
}

/** "Hover" group: one simple effect per card — none of them dims the other cards. */
function servicesCardHoverGroup(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange
): SettingGroup {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  return {
    id: 'hover',
    title: 'Hover',
    items: [
      {
        id: 'hover-effect',
        label: 'Hover effect',
        info: 'Lift raises the card, Glow follows the cursor with a soft light, Tilt leans it toward the cursor. Desktop mouse only.',
        value: servicesLabelOf(PORTFOLIO_SERVICES_HOVER_EFFECT_OPTIONS, style.hoverEffect),
        render: (density) => (
          <SvChoiceTiles
            label="Hover effect"
            density={density}
            options={PORTFOLIO_SERVICES_HOVER_EFFECT_OPTIONS}
            value={style.hoverEffect}
            onChange={(hoverEffect) => onChange({ pricingStyle: { ...style, hoverEffect } })}
          />
        ),
      },
    ],
  };
}

/** Wireframes for the Pricing Cards layout picker (64×34 stage). */
function servicesPricingLayoutGlyph(layout: PortfolioServicesPricingCardsLayout): ReactNode {
  if (layout === 'monolith') {
    return (
      <>
        <rect className="pf-stack-mini-ring" x="8" y="9" width="14" height="19" rx="3" />
        <rect className="pf-stack-mini-ring" x="25" y="7" width="14" height="23" rx="3" />
        <rect className="pf-stack-mini-ring" x="42" y="9" width="14" height="19" rx="3" />
        <rect className="pf-stack-mini-ink" x="11" y="17" width="8" height="4" rx="1" />
        <rect className="pf-stack-mini-ink" x="28" y="16" width="8" height="5" rx="1" />
        <rect className="pf-stack-mini-ink" x="45" y="17" width="8" height="4" rx="1" />
      </>
    );
  }
  if (layout === 'bento') {
    return (
      <>
        <rect className="pf-stack-mini-accent" x="8" y="6" width="31" height="22" rx="3" />
        <rect className="pf-stack-mini-mute" x="42" y="6" width="14" height="22" rx="3" />
        <rect className="pf-stack-mini-ink" x="12" y="10" width="14" height="4" rx="1" />
      </>
    );
  }
  return (
    <>
      <rect className="pf-stack-mini-mute" x="8" y="11" width="14" height="17" rx="3" />
      <rect className="pf-stack-mini-accent" x="25" y="6" width="14" height="22" rx="3" />
      <rect className="pf-stack-mini-mute" x="42" y="11" width="14" height="17" rx="3" />
    </>
  );
}

/** Card "Corner radius" item (shared `pricingStyle.cardRadius`) — the pricing designs' Cards group and Cascade. */
function servicesCardRadiusItem(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange
): SettingItem {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  return {
      id: 'radius',
      label: 'Corner radius',
      value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS, style.cardRadius),
      preview: servicesSettingGlyph(servicesRadiusGlyph(style.cardRadius)),
      render: (density) => (
        <SvChoiceTiles
          label="Corner radius"
          density={density}
          options={PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS.map((option) => ({
            ...option,
            glyph: servicesRadiusGlyph(option.value),
          }))}
          value={style.cardRadius}
          onChange={(cardRadius) => setStyle({ cardRadius })}
        />
      ),
    };
}

/** Border / Border color items (shared `pricingStyle` keys) — the pricing designs' Cards group, Cascade and Icon Cards. */
function servicesCardBorderItems(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange
): SettingItem[] {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  const borderColorOptions = PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    auto: option.value === 'auto',
    color: option.value === 'auto' ? 'transparent' : servicesPaletteColor(services, option.value),
  }));
  const items: SettingItem[] = [
    {
      id: 'border',
      label: 'Border',
      value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS, style.cardBorderWidth),
      preview: servicesSettingGlyph(servicesBorderGlyph(style.cardBorderWidth)),
      render: (density) => (
        <SvChoiceTiles
          label="Border"
          density={density}
          options={PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS.map((option) => ({
            ...option,
            glyph: servicesBorderGlyph(option.value),
          }))}
          value={style.cardBorderWidth}
          onChange={(cardBorderWidth) => setStyle({ cardBorderWidth })}
        />
      ),
    },
  ];
  if (style.cardBorderWidth !== 'none') {
    items.push({
      id: 'border-color',
      label: 'Border color',
      value: servicesLabelOf(borderColorOptions, style.cardBorderColor),
      preview: servicesSettingDot(
        servicesPaletteColor(services, style.cardBorderColor),
        style.cardBorderColor === 'auto'
      ),
      render: (density) => (
        <SvSwatches
          label="Border color"
          density={density}
          options={borderColorOptions}
          value={style.cardBorderColor}
          onChange={(next) => setStyle({ cardBorderColor: next as typeof style.cardBorderColor })}
        />
      ),
    });
  }
  return items;
}

/** Design → Background → "Background frame" (shared `pricingStyle.showFrame`). */
function servicesBackgroundFrameGroup(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange
): SettingGroup {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  return {
    id: 'background',
    title: 'Background',
    items: [
      {
        id: 'frame',
        label: 'Background frame',
        info: 'Paints a full-width backdrop behind the services. Off by default so your page background shows through.',
        toggle: {
          checked: style.showFrame,
          onChange: (showFrame) => onChange({ pricingStyle: { ...style, showFrame } }),
        },
      },
    ],
  };
}

/** Cards / Order button / Background groups shared by the five pricing designs. */
function servicesPricingStyleGroups(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange
): SettingGroup[] {
  const style = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const setStyle = (patch: Partial<PortfolioServicesPricingStyleSettings>) =>
    onChange({ pricingStyle: { ...style, ...patch } });
  const cards: SettingItem[] = [
    servicesCardRadiusItem(services, onChange),
    ...servicesCardBorderItems(services, onChange),
  ];

  const groups: SettingGroup[] = [
    { id: 'cards', title: 'Cards', items: cards },
  ];
  {
    groups.push({
      id: 'background',
      title: 'Background',
      items: [
        {
          id: 'frame',
          label: 'Background frame',
          info: 'Paints a full-width backdrop behind the cards. Off by default so your page background shows through.',
          toggle: { checked: style.showFrame, onChange: (showFrame) => setStyle({ showFrame }) },
        },
      ],
    });
  }
  return groups;
}

/** Tiny wireframes of the four Icon Cards task layouts (64×34 stage). */
function servicesIconCardsTasksGlyph(style: PortfolioServicesIconCardsTasksStyle): ReactNode {
  if (style === 'tags') {
    return (
      <>
        <rect className="pf-stack-mini-ring" x="10" y="9" width="18" height="6" rx="3" />
        <rect className="pf-stack-mini-ring" x="31" y="9" width="22" height="6" rx="3" />
        <rect className="pf-stack-mini-ring" x="16" y="19" width="26" height="6" rx="3" />
      </>
    );
  }
  if (style === 'list') {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect className="pf-stack-mini-ink" x="12" y={10 + i * 7} width={26 - i * 4} height="2" rx="1" />
            <rect className="pf-stack-mini-mute" x="12" y={14 + i * 7} width="40" height="0.8" />
          </g>
        ))}
      </>
    );
  }
  if (style === 'inline') {
    return (
      <>
        <rect className="pf-stack-mini-ink" x="8" y="15" width="12" height="2" rx="1" />
        <circle className="pf-stack-mini-mute" cx="23" cy="16" r="1" />
        <rect className="pf-stack-mini-ink" x="26" y="15" width="14" height="2" rx="1" />
        <circle className="pf-stack-mini-mute" cx="43" cy="16" r="1" />
        <rect className="pf-stack-mini-ink" x="46" y="15" width="10" height="2" rx="1" />
      </>
    );
  }
  return (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle className="pf-stack-mini-accent" cx="15" cy={10 + i * 7} r="2.2" />
          <rect className="pf-stack-mini-ink" x="20" y={9 + i * 7} width={28 - i * 5} height="2" rx="1" />
        </g>
      ))}
    </>
  );
}

/** Icon Cards → one row per service (current icon, title, choice); the icon catalog opens under
 *  the row being edited only, instead of repeating the whole catalog for every service. */
function ServicesIconPicker({
  services,
  icons,
  options,
  density,
  onChange,
}: {
  services: { id: string; title: string }[];
  icons: Record<string, ServiceIconChoice>;
  options: { value: ServiceIconChoice; label: string; glyph: ReactNode }[];
  density: SettingDensity;
  onChange: (id: string, next: ServiceIconChoice) => void;
}) {
  const t = useT();
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="divide-y divide-black/[0.08] dark:divide-white/[0.1]">
      {services.map((service, index) => {
        const choice = icons[service.id] ?? 'auto';
        const resolved = resolveServiceIconKey(choice, service.title, index);
        const open = openId === service.id;
        const title = service.title || `Service ${index + 1}`;
        return (
          <div key={service.id} className="py-1.5 first:pt-0 last:pb-0">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : service.id)}
              className="flex w-full items-center gap-3 rounded-lg py-2 text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] dark:bg-white/[0.08]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                  {servicesIconGlyph(resolved)}
                </svg>
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{title}</span>
              <span className="shrink-0 text-[12px] text-[color:var(--pf-palette-texte-muted)]">
                {choice === 'auto'
                  ? `Auto · ${servicesLabelOf(SERVICE_ICON_OPTIONS, resolved)}`
                  : servicesLabelOf(SERVICE_ICON_OPTIONS, choice)}
              </span>
              <svg
                viewBox="0 0 16 16"
                className={`h-3.5 w-3.5 shrink-0 text-[color:var(--pf-palette-texte-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                aria-hidden
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open ? (
              <div className="pb-2 pt-1">
                <SvChoiceTiles
                  label={t('Icon for {title}', { title })}
                  density={density}
                  columns={6}
                  glyphViewBox="-8 -2 40 28"
                  options={options}
                  value={choice}
                  onChange={(next) => onChange(service.id, next)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Every Services design's own options as one description (`SettingGroup[]`), so the two views
 * (Expanded / Compact) render exactly the same settings. `null` when the design has none.
 */
function servicesDesignSettingGroups(
  services: PortfolioServicesSectionSettings,
  onChange: ServicesSettingsChange,
  availableServices: { id: string; title: string }[]
): SettingGroup[] | null {
  switch (services.sectionDesign) {
    case 'services-pricing': {
      const cards = services.pricingCards ?? DEFAULT_SERVICES_PRICING_CARDS_SETTINGS;
      const setCards = (patch: Partial<typeof cards>) => onChange({ pricingCards: { ...cards, ...patch } });
      const opacityDesign: ServicesFeaturedDesignKey =
        cards.layout === 'grid' ? 'cardsGrid' : cards.layout === 'monolith' ? 'cardsMonolith' : 'cardsBento';
      const layoutItems: SettingItem[] = [
        {
          id: 'card-layout',
          label: 'Card layout',
          info: 'The same plans, three ways to lay them out. Switch any time — your featured card, prices and hover effect carry over.',
          value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_CARDS_LAYOUT_OPTIONS, cards.layout),
          render: (density) => (
            <SvChoiceTiles
              label="Card layout"
              density={density}
              glyphViewBox="0 0 64 34"
              stage
              options={PORTFOLIO_SERVICES_PRICING_CARDS_LAYOUT_OPTIONS.map((option) => ({
                ...option,
                glyph: servicesPricingLayoutGlyph(option.value),
              }))}
              value={cards.layout}
              onChange={(layout) => setCards({ layout })}
            />
          ),
        },
      ];
      if (cards.layout !== 'bento') {
        layoutItems.push(
          servicesColumnsItem(
            PORTFOLIO_SERVICES_PRICING_CARDS_COLUMNS_OPTIONS,
            cards.cardsPerRow ?? 3,
            (cardsPerRow) => setCards({ cardsPerRow: cardsPerRow as PortfolioServicesPricingCardsColumns })
          )
        );
        // Monolith always centers its last row; Grid makes it a choice.
        if (cards.layout === 'grid') {
          layoutItems.push({
            id: 'center-last-row',
            label: 'Center incomplete rows',
            info: 'When the last row has fewer cards than the others, center it instead of leaving it flush left.',
            toggle: {
              checked: cards.centerLastRow === true,
              onChange: (centerLastRow) => setCards({ centerLastRow }),
            },
          });
        }
      } else {
        layoutItems.push({
          id: 'pattern',
          label: 'Header pattern',
          info: "The pattern drawn in the featured card's header. Pick None to remove it.",
          value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS, cards.graphicMotif),
          render: (density) => (
            <SvChoiceTiles
              label="Featured card pattern"
              density={density}
              columns={3}
              options={PORTFOLIO_SERVICES_PRICING_BENTO_MOTIF_OPTIONS}
              value={cards.graphicMotif}
              onChange={(graphicMotif) => setCards({ graphicMotif })}
            />
          ),
        });
        layoutItems.push({
          id: 'included-label',
          label: 'Included label',
          info: 'The small heading above the list on the wide featured card. Leave empty to hide it.',
          value: cards.includedLabel || 'Hidden',
          wide: true,
          render: (density) => (
            <SvTextInput
              label="Included label"
              density={density}
              allowEmpty
              maxLength={40}
              value={cards.includedLabel ?? "What's included"}
              placeholder="What's included"
              onCommit={(includedLabel) => setCards({ includedLabel })}
            />
          ),
        });
      }
      return [
        { id: 'layout', title: 'Layout', items: layoutItems },
        servicesFeaturedGroup(services, onChange, availableServices, opacityDesign),
        servicesPriceGroup(services, onChange),
        servicesCardHoverGroup(services, onChange),
        ...servicesPricingStyleGroups(services, onChange),
      ];
    }
    case 'services-pricing-aurora': {
      const aurora = { ...DEFAULT_SERVICES_PRICING_AURORA_SETTINGS, ...(services.servicesPricingAurora ?? {}) };
      const setAurora = (patch: Partial<typeof aurora>) =>
        onChange({ servicesPricingAurora: { ...aurora, ...patch } });
      const featuredStyle = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
      const featured = servicesFeaturedGroup(services, onChange, availableServices, 'aurora');
      if (featuredStyle.featuredSource !== 'none') {
        // Right after "Which card" (or the source picker when the popular flag decides).
        const pickAt = featured.items.findIndex((item) => item.id === 'featured-pick' || item.id === 'featured-from-flag');
        featured.items.splice(pickAt >= 0 ? pickAt + 1 : 1, 0, {
          id: 'featured-position',
          label: 'Position',
          info: 'Where the featured card sits in the row. "Its place" keeps the order of your services.',
          value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_AURORA_FEATURED_POSITION_OPTIONS, aurora.featuredPosition),
          render: (density) => (
            <SvChoiceTiles
              label="Featured card position"
              density={density}
              options={PORTFOLIO_SERVICES_PRICING_AURORA_FEATURED_POSITION_OPTIONS}
              value={aurora.featuredPosition}
              onChange={(featuredPosition) => setAurora({ featuredPosition })}
            />
          ),
        });
      }
      const price = servicesPriceGroup(services, onChange);
      return [
        {
          id: 'layout',
          title: 'Layout',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_PRICING_AURORA_COLUMNS_OPTIONS, aurora.cardsPerRow ?? 3, (cardsPerRow) =>
              onChange({
                servicesPricingAurora: {
                  ...aurora,
                  cardsPerRow: cardsPerRow as PortfolioServicesPricingAuroraColumns,
                },
              })
            ),
          ],
        },
        featured,
        price,
        servicesCardHoverGroup(services, onChange),
        ...servicesPricingStyleGroups(services, onChange),
      ];
    }
    case 'services-pricing-toggle': {
      const toggle = { ...DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS, ...(services.pricingToggle ?? {}) };
      const setToggle = (patch: Partial<typeof toggle>) => onChange({ pricingToggle: { ...toggle, ...patch } });
      const featuredStyle = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
      const featured = servicesFeaturedGroup(services, onChange, availableServices, 'toggle');
      if (featuredStyle.featuredSource !== 'none') {
        const pickAt = featured.items.findIndex((item) => item.id === 'featured-pick' || item.id === 'featured-from-flag');
        featured.items.splice(pickAt >= 0 ? pickAt + 1 : 1, 0, {
          id: 'featured-position',
          label: 'Position',
          info: 'Where the featured row sits in the list. "Its place" keeps the order of your services.',
          value: servicesLabelOf(PORTFOLIO_SERVICES_PRICING_AURORA_FEATURED_POSITION_OPTIONS, toggle.featuredPosition),
          render: (density) => (
            <SvChoiceTiles
              label="Featured row position"
              density={density}
              options={PORTFOLIO_SERVICES_PRICING_AURORA_FEATURED_POSITION_OPTIONS}
              value={toggle.featuredPosition}
              onChange={(featuredPosition) => setToggle({ featuredPosition })}
            />
          ),
        });
      }
      const listItems: SettingItem[] = [
        {
          id: 'included-heading',
          label: 'Included heading',
          info: 'A small heading above each task list.',
          toggle: { checked: toggle.showIncludedLabel, onChange: (showIncludedLabel) => setToggle({ showIncludedLabel }) },
        },
      ];
      if (toggle.showIncludedLabel) {
        listItems.push({
          id: 'included-label',
          label: 'Heading text',
          value: toggle.includedLabel || "What's included",
          wide: true,
          render: (density) => (
            <SvTextInput
              label="Heading text"
              density={density}
              allowEmpty
              maxLength={40}
              value={toggle.includedLabel}
              placeholder="What's included"
              onCommit={(includedLabel) => setToggle({ includedLabel })}
            />
          ),
        });
      }
      return [
        featured,
        { id: 'list', title: 'Task list', items: listItems },
        servicesPriceGroup(services, onChange),
        servicesCardHoverGroup(services, onChange),
        ...servicesPricingStyleGroups(services, onChange),
      ];
    }
    case 'services-media-columns': {
      const media = services.mediaColumns ?? DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS;
      const setMedia = (patch: Partial<PortfolioServicesMediaColumnsSettings>) =>
        onChange({ mediaColumns: { ...media, ...patch } });
      return [
        {
          id: 'grid',
          title: 'Grid',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS, media.columns, (columns) =>
              setMedia({ columns: columns as 2 | 3 | 4 })
            ),
            {
              id: 'gap',
              label: 'Gap',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS, media.gap),
              render: (density) => (
                <SvChoiceTiles
                  label="Gap"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS}
                  value={media.gap}
                  onChange={(gap) => setMedia({ gap })}
                />
              ),
            },
            {
              id: 'center-last-row',
              label: 'Center incomplete rows',
              info: 'When the last row has fewer cards than the others, center it instead of leaving it flush left.',
              toggle: { checked: media.centerLastRow, onChange: (centerLastRow) => setMedia({ centerLastRow }) },
            },
          ],
        },
        {
          id: 'media',
          title: 'Media',
          items: [
            {
              id: 'ratio',
              label: 'Media ratio',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS, media.mediaRatio),
              render: (density) => (
                <SvChoiceTiles
                  label="Media ratio"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_RATIO_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesMediaColumnsRatioGlyph(option.value),
                  }))}
                  value={media.mediaRatio}
                  onChange={(mediaRatio) => setMedia({ mediaRatio })}
                />
              ),
            },
            {
              id: 'radius',
              label: 'Corner radius',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS, media.cardRadius),
              render: (density) => (
                <SvChoiceTiles
                  label="Corner radius"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesMediaColumnsRadiusGlyph(option.value),
                  }))}
                  value={media.cardRadius}
                  onChange={(cardRadius) => setMedia({ cardRadius })}
                />
              ),
            },
            {
              id: 'hover',
              label: 'Hover effect',
              info: 'Zoom enlarges the media, Lift raises the card, Glow rings it with the accent colour. Desktop mouse only.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS, media.hoverEffect),
              render: (density) => (
                <SvChoiceTiles
                  label="Hover effect"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_HOVER_OPTIONS}
                  value={media.hoverEffect}
                  onChange={(hoverEffect) => setMedia({ hoverEffect })}
                />
              ),
            },
          ],
        },
        {
          id: 'text',
          title: 'Text',
          items: [
            {
              id: 'align',
              label: 'Text alignment',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS, media.textAlign),
              render: (density) => (
                <SvChoiceTiles
                  label="Text alignment"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS}
                  value={media.textAlign}
                  onChange={(textAlign) => setMedia({ textAlign })}
                />
              ),
            },
            {
              id: 'description',
              label: 'Show description',
              toggle: { checked: media.showDescription, onChange: (showDescription) => setMedia({ showDescription }) },
            },
          ],
        },
        servicesPriceGroup(services, onChange),
      ];
    }
    case 'services-icon-cards': {
      const cards = services.iconCards ?? DEFAULT_SERVICES_ICON_CARDS_SETTINGS;
      const setCards = (patch: Partial<PortfolioServicesIconCardsSettings>) =>
        onChange({ iconCards: { ...cards, ...patch } });
      const iconTileOptions = [
        { value: 'auto' as ServiceIconChoice, label: 'Auto (from the title)', glyph: servicesIconAutoGlyph() },
        ...SERVICE_ICON_OPTIONS.map((option) => ({
          value: option.value as ServiceIconChoice,
          label: option.label,
          glyph: servicesIconGlyph(option.value),
        })),
      ];
      const iconItems: SettingItem[] =
        availableServices.length > 0
          ? [
              {
                id: 'icons',
                label: 'Icons',
                info: 'Pick a service to change its icon. Auto picks one from the title.',
                wide: true,
                render: (density) => (
                  <ServicesIconPicker
                    services={availableServices}
                    icons={cards.icons}
                    options={iconTileOptions}
                    density={density}
                    onChange={(id, next) => setCards({ icons: { ...cards.icons, [id]: next } })}
                  />
                ),
              },
            ]
          : [];
      const groups: SettingGroup[] = [
        {
          id: 'grid',
          title: 'Grid',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS, cards.columns, (columns) =>
              setCards({ columns: columns as 2 | 3 | 4 })
            ),
            {
              id: 'gap',
              label: 'Gap',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS, cards.gap),
              render: (density) => (
                <SvChoiceTiles
                  label="Gap"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_GAP_OPTIONS}
                  value={cards.gap}
                  onChange={(gap) => setCards({ gap })}
                />
              ),
            },
            {
              id: 'center-last-row',
              label: 'Center incomplete rows',
              info: 'When the last row has fewer cards than the others, center it instead of leaving it flush left.',
              toggle: { checked: cards.centerLastRow, onChange: (centerLastRow) => setCards({ centerLastRow }) },
            },
          ],
        },
        {
          id: 'card',
          title: 'Card',
          items: [
            {
              id: 'card-style',
              label: 'Card style',
              info: 'Shadow lifts white cards off the page, Outline draws a hairline, Tinted washes them with the accent colour, Plain removes the card.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_ICON_CARDS_STYLE_OPTIONS, cards.cardStyle),
              render: (density) => (
                <SvChoiceTiles
                  label="Card style"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_ICON_CARDS_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIconCardsStyleGlyph(option.value),
                  }))}
                  value={cards.cardStyle}
                  onChange={(cardStyle) => setCards({ cardStyle })}
                />
              ),
            },
            {
              id: 'card-color',
              label: 'Card color',
              info: 'Fills every card with a colour from your site palette. Default keeps the card style\'s own background. Text switches to whatever reads best on it.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS, cards.cardColor ?? 'auto'),
              preview: servicesSettingDot(servicesPaletteColor(services, cards.cardColor ?? 'auto'), (cards.cardColor ?? 'auto') === 'auto'),
              render: (density) => (
                <SvSwatches
                  label="Card color"
                  density={density}
                  options={PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                    auto: option.value === 'auto',
                    color: option.value === 'auto' ? 'transparent' : servicesPaletteColor(services, option.value),
                  }))}
                  value={cards.cardColor ?? 'auto'}
                  onChange={(next) => setCards({ cardColor: next as PortfolioServicesIconCardsSettings['cardColor'] })}
                />
              ),
            },
            ...((cards.cardColor ?? 'auto') === 'auto'
              ? []
              : [
                  {
                    id: 'card-color-opacity',
                    label: 'Color intensity',
                    info: 'How strongly the colour fills the cards. Lower it for a soft tint.',
                    value: `${cards.cardColorOpacity ?? 100}%`,
                    render: (density: SettingDensity) => (
                      <SvSlider
                        label="Card color intensity"
                        density={density}
                        value={cards.cardColorOpacity ?? 100}
                        onChange={(cardColorOpacity) => setCards({ cardColorOpacity })}
                      />
                    ),
                  },
                ]),
            ...servicesCardBorderItems(services, onChange),
            {
              id: 'radius',
              label: 'Corner radius',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS, cards.cardRadius),
              render: (density) => (
                <SvChoiceTiles
                  label="Corner radius"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_RADIUS_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesMediaColumnsRadiusGlyph(option.value),
                  }))}
                  value={cards.cardRadius}
                  onChange={(cardRadius) => setCards({ cardRadius })}
                />
              ),
            },
            {
              id: 'hover',
              label: 'Hover effect',
              info: 'Lift raises the card, Glow rings it with the accent colour, Icon pop tilts and grows the icon. Desktop mouse only.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_ICON_CARDS_HOVER_OPTIONS, cards.hoverEffect),
              render: (density) => (
                <SvChoiceTiles
                  label="Hover effect"
                  density={density}
                  options={PORTFOLIO_SERVICES_ICON_CARDS_HOVER_OPTIONS}
                  value={cards.hoverEffect}
                  onChange={(hoverEffect) => setCards({ hoverEffect })}
                />
              ),
            },
          ],
        },
        {
          id: 'icon',
          title: 'Icon',
          items: [
            {
              id: 'icon-shape',
              label: 'Badge shape',
              value: servicesLabelOf(PORTFOLIO_SERVICES_ICON_CARDS_ICON_SHAPE_OPTIONS, cards.iconShape),
              render: (density) => (
                <SvChoiceTiles
                  label="Badge shape"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_ICON_CARDS_ICON_SHAPE_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIconCardsShapeGlyph(option.value),
                  }))}
                  value={cards.iconShape}
                  onChange={(iconShape) => setCards({ iconShape })}
                />
              ),
            },
            {
              id: 'icon-size',
              label: 'Icon size',
              value: servicesLabelOf(PORTFOLIO_SERVICES_ICON_CARDS_ICON_SIZE_OPTIONS, cards.iconSize),
              render: (density) => (
                <SvChoiceTiles
                  label="Icon size"
                  density={density}
                  options={PORTFOLIO_SERVICES_ICON_CARDS_ICON_SIZE_OPTIONS}
                  value={cards.iconSize}
                  onChange={(iconSize) => setCards({ iconSize })}
                />
              ),
            },
            {
              id: 'icon-color',
              label: 'Icon colors',
              info: 'Multicolor gives each card its own colour (teal, red, blue, yellow…). Accent uses the section accent colour. Mono uses the text colour.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_ICON_CARDS_ICON_COLOR_OPTIONS, cards.iconColor),
              render: (density) => (
                <SvChoiceTiles
                  label="Icon colors"
                  density={density}
                  options={PORTFOLIO_SERVICES_ICON_CARDS_ICON_COLOR_OPTIONS}
                  value={cards.iconColor}
                  onChange={(iconColor) => setCards({ iconColor })}
                />
              ),
            },
          ],
        },
        {
          id: 'text',
          title: 'Text',
          items: [
            {
              id: 'align',
              label: 'Text alignment',
              value: servicesLabelOf(PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS, cards.textAlign),
              render: (density) => (
                <SvChoiceTiles
                  label="Text alignment"
                  density={density}
                  options={PORTFOLIO_SERVICES_MEDIA_COLUMNS_TEXT_ALIGN_OPTIONS}
                  value={cards.textAlign}
                  onChange={(textAlign) => setCards({ textAlign })}
                />
              ),
            },
            {
              id: 'tasks-style',
              label: 'Tasks layout',
              info: 'How the task list looks once General → Card elements → Tasks checklist is on.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_ICON_CARDS_TASKS_STYLE_OPTIONS, cards.tasksStyle),
              render: (density) => (
                <SvChoiceTiles
                  label="Tasks layout"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_ICON_CARDS_TASKS_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIconCardsTasksGlyph(option.value),
                  }))}
                  value={cards.tasksStyle}
                  onChange={(tasksStyle) => setCards({ tasksStyle })}
                />
              ),
            },
          ],
        },
      ];
      if (iconItems.length > 0) groups.push({ id: 'icons', title: 'Icon per service', items: iconItems });
      groups.push(servicesPriceGroup(services, onChange));
      return groups;
    }
    case 'services-capabilities': {
      const caps = services.capabilities ?? DEFAULT_SERVICES_CAPABILITIES_SETTINGS;
      const setCaps = (patch: Partial<PortfolioServicesCapabilitiesSettings>) =>
        onChange({ capabilities: { ...caps, ...patch } });
      return [
        {
          id: 'grid',
          title: 'Grid',
          items: [
            servicesColumnsItem(PORTFOLIO_SERVICES_MEDIA_COLUMNS_COUNT_OPTIONS, caps.columns, (columns) =>
              setCaps({ columns: columns as 2 | 3 | 4 })
            , 'Columns'),
            {
              id: 'center-last-row',
              label: 'Center incomplete rows',
              info: 'When the last row has fewer items than the others, center it instead of leaving it flush left.',
              toggle: { checked: caps.centerLastRow, onChange: (centerLastRow) => setCaps({ centerLastRow }) },
            },
          ],
        },
        {
          id: 'items',
          title: 'Items',
          items: [
            {
              id: 'item-frame',
              label: 'Frame',
              info: 'Boxes each service. Outline draws a hairline border, Filled a soft card. None keeps bare columns under a rule.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_CAPABILITIES_FRAME_OPTIONS, caps.itemFrame),
              render: (density) => (
                <SvChoiceTiles
                  label="Frame"
                  density={density}
                  options={PORTFOLIO_SERVICES_CAPABILITIES_FRAME_OPTIONS}
                  value={caps.itemFrame}
                  onChange={(itemFrame) => setCaps({ itemFrame })}
                />
              ),
            },
            ...(caps.itemFrame === 'none'
              ? [
                  {
                    id: 'rule',
                    label: 'Rule above each column',
                    toggle: { checked: caps.showRule, onChange: (showRule: boolean) => setCaps({ showRule }) },
                  },
                ]
              : [
                  servicesCardRadiusItem(services, onChange),
                  ...(caps.itemFrame === 'outline' ? servicesCardBorderItems(services, onChange) : []),
                ]),
            {
              id: 'number',
              label: 'Numbers',
              info: 'Small shows "(01)" above the title. Large draws a big outlined numeral.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_CAPABILITIES_NUMBER_OPTIONS, caps.numberStyle),
              render: (density) => (
                <SvChoiceTiles
                  label="Numbers"
                  density={density}
                  options={PORTFOLIO_SERVICES_CAPABILITIES_NUMBER_OPTIONS}
                  value={caps.numberStyle}
                  onChange={(numberStyle) => setCaps({ numberStyle })}
                />
              ),
            },
          ],
        },
        (() => {
          // Off by default here; the shared Featured options only show once it is on.
          const featured = servicesFeaturedGroup(services, onChange, availableServices, null);
          return {
            ...featured,
            items: [
              {
                id: 'show-featured',
                label: 'Highlight a featured service',
                info: 'Colors one service’s rule or frame and shows its badge. Off by default.',
                toggle: { checked: caps.showFeatured, onChange: (showFeatured: boolean) => setCaps({ showFeatured }) },
              },
              ...(caps.showFeatured ? featured.items : []),
            ],
          };
        })(),
        servicesPriceGroup(services, onChange),
      ];
    }
    case 'services-band-index': {
      const band = services.bandIndex ?? DEFAULT_SERVICES_BAND_INDEX_SETTINGS;
      const setBand = (patch: Partial<PortfolioServicesBandIndexSettings>) =>
        onChange({ bandIndex: { ...band, ...patch } });
      return [
        {
          id: 'bands',
          title: 'Bands',
          items: [
            {
              id: 'title-size',
              label: 'Title size',
              value: servicesLabelOf(PORTFOLIO_SERVICES_BAND_INDEX_TITLE_SIZE_OPTIONS, band.titleSize),
              render: (density) => (
                <SvChoiceTiles
                  label="Title size"
                  density={density}
                  options={PORTFOLIO_SERVICES_BAND_INDEX_TITLE_SIZE_OPTIONS}
                  value={band.titleSize}
                  onChange={(titleSize) => setBand({ titleSize })}
                />
              ),
            },
            {
              id: 'uppercase',
              label: 'Uppercase titles',
              toggle: { checked: band.uppercase, onChange: (uppercase) => setBand({ uppercase }) },
            },
            {
              id: 'show-index',
              label: 'Show index numbers',
              toggle: { checked: band.showIndex, onChange: (showIndex) => setBand({ showIndex }) },
            },
            {
              id: 'show-meta',
              label: 'Show price and delivery',
              info: 'Delivery time and price at the right end of each band (hidden on phones until the band is opened).',
              toggle: { checked: band.showMeta, onChange: (showMeta) => setBand({ showMeta }) },
            },
            {
              id: 'expandable',
              label: 'Open details on click',
              info: 'Clicking a band unfolds its description and tasks (and its media on touch screens).',
              toggle: { checked: band.expandable, onChange: (expandable) => setBand({ expandable }) },
            },
            ...(band.expandable
              ? [
                  {
                    id: 'tasks-style',
                    label: 'Tasks style',
                    info: 'How the tasks read once a band is opened.',
                    value: servicesLabelOf(PORTFOLIO_SERVICES_BAND_INDEX_TASKS_STYLE_OPTIONS, band.tasksStyle ?? 'rows'),
                    render: (density: SettingDensity) => (
                      <SvChoiceTiles
                        label="Tasks style"
                        density={density}
                        glyphViewBox="0 0 64 34"
                        stage
                        columns={3}
                        options={PORTFOLIO_SERVICES_BAND_INDEX_TASKS_STYLE_OPTIONS.map((option) => ({
                          ...option,
                          glyph: servicesBandTasksGlyph(option.value),
                        }))}
                        value={band.tasksStyle ?? 'rows'}
                        onChange={(tasksStyle) => setBand({ tasksStyle })}
                      />
                    ),
                  },
                ]
              : []),
          ],
        },
        {
          id: 'hover',
          title: 'Hover',
          items: [
            {
              id: 'preview',
              label: 'Media preview',
              info: 'Follow cursor floats the service media under the pointer. Inline slides a small media pill open inside the band. Desktop mouse only.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_BAND_INDEX_PREVIEW_OPTIONS, band.preview),
              render: (density) => (
                <SvChoiceTiles
                  label="Media preview"
                  density={density}
                  options={PORTFOLIO_SERVICES_BAND_INDEX_PREVIEW_OPTIONS}
                  value={band.preview}
                  onChange={(preview) => setBand({ preview })}
                />
              ),
            },
            {
              id: 'hover-fill',
              label: 'Band fill',
              info: 'Invert floods the band with the text colour, Accent with the accent colour.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_BAND_INDEX_HOVER_FILL_OPTIONS, band.hoverFill),
              render: (density) => (
                <SvChoiceTiles
                  label="Band fill"
                  density={density}
                  options={PORTFOLIO_SERVICES_BAND_INDEX_HOVER_FILL_OPTIONS}
                  value={band.hoverFill}
                  onChange={(hoverFill) => setBand({ hoverFill })}
                />
              ),
            },
          ],
        },
        servicesFeaturedGroup(services, onChange, availableServices, null),
        servicesPriceGroup(services, onChange),
      ];
    }
    case 'services-cascade': {
      const cascade = services.servicesCascade ?? DEFAULT_SERVICES_CASCADE_SETTINGS;
      const setCascade = (patch: Partial<PortfolioServicesCascadeSettings>) =>
        onChange({ servicesCascade: { ...cascade, ...patch } });
      return [
        {
          id: 'stack',
          title: 'Stack',
          items: [
            {
              id: 'stack-effect',
              label: 'Scroll effect',
              info: 'Stack: each card sticks and recedes as the next one slides over it (desktop mouse only). Static: a plain list.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_CASCADE_STACK_OPTIONS, cascade.stackEffect),
              render: (density) => (
                <SvChoiceTiles
                  label="Scroll effect"
                  density={density}
                  options={PORTFOLIO_SERVICES_CASCADE_STACK_OPTIONS}
                  value={cascade.stackEffect}
                  onChange={(stackEffect) => setCascade({ stackEffect })}
                />
              ),
            },
            {
              id: 'equal-height',
              label: 'Equal card height',
              info: 'Every card takes the tallest card’s height, so no card peeks out from under the next one.',
              toggle: { checked: cascade.equalHeight, onChange: (equalHeight) => setCascade({ equalHeight }) },
            },
          ],
        },
        {
          id: 'card',
          title: 'Card',
          items: [
            {
              id: 'width',
              label: 'Card width',
              value: servicesLabelOf(PORTFOLIO_SERVICES_CASCADE_WIDTH_OPTIONS, cascade.cardWidth),
              render: (density) => (
                <SvChoiceTiles
                  label="Card width"
                  density={density}
                  options={PORTFOLIO_SERVICES_CASCADE_WIDTH_OPTIONS}
                  value={cascade.cardWidth}
                  onChange={(cardWidth) => setCascade({ cardWidth })}
                />
              ),
            },
            {
              id: 'height',
              label: 'Card height',
              value: servicesLabelOf(PORTFOLIO_SERVICES_CASCADE_HEIGHT_OPTIONS, cascade.cardHeight),
              render: (density) => (
                <SvChoiceTiles
                  label="Card height"
                  density={density}
                  options={PORTFOLIO_SERVICES_CASCADE_HEIGHT_OPTIONS}
                  value={cascade.cardHeight}
                  onChange={(cardHeight) => setCascade({ cardHeight })}
                />
              ),
            },
            {
              id: 'media-side',
              label: 'Media position',
              value: servicesLabelOf(PORTFOLIO_SERVICES_CASCADE_MEDIA_SIDE_OPTIONS, cascade.mediaSide),
              render: (density) => (
                <SvChoiceTiles
                  label="Media position"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_CASCADE_MEDIA_SIDE_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesSplitSideGlyph(option.value),
                  }))}
                  value={cascade.mediaSide}
                  onChange={(mediaSide) => setCascade({ mediaSide })}
                />
              ),
            },
            {
              ...servicesCardRadiusItem(services, onChange),
              info: 'Rounds the card and its media together — the media follows the card’s corners.',
            },
            ...servicesCardBorderItems(services, onChange),
          ],
        },
        {
          id: 'content',
          title: 'Content',
          items: [
            {
              id: 'numbering',
              label: 'Numbering',
              info: 'The “01 / 03” counter above each title. Which elements show (tasks, delivery, price…) is set in General → Card elements.',
              toggle: { checked: cascade.showNumbering, onChange: (showNumbering) => setCascade({ showNumbering }) },
            },
          ],
        },
        servicesPriceGroup(services, onChange),
      ];
    }
    case 'services-index-list': {
      const list = services.indexList ?? DEFAULT_SERVICES_INDEX_LIST_SETTINGS;
      const setList = (patch: Partial<PortfolioServicesIndexListSettings>) =>
        onChange({ indexList: { ...list, ...patch } });
      return [
        {
          id: 'layout',
          title: 'Layout',
          items: [
            {
              id: 'layout',
              label: 'Layout',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS, list.layout),
              render: (density) => (
                <SvChoiceTiles
                  label="Layout"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_INDEX_LIST_LAYOUT_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIndexListLayoutGlyph(option.value),
                  }))}
                  value={list.layout}
                  onChange={(layout) => setList({ layout })}
                />
              ),
            },
            {
              id: 'ratio',
              label: 'Media ratio',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS, list.mediaRatio),
              render: (density) => (
                <SvChoiceTiles
                  label="Media ratio"
                  density={density}
                  options={PORTFOLIO_SERVICES_INDEX_LIST_MEDIA_RATIO_OPTIONS}
                  value={list.mediaRatio}
                  onChange={(mediaRatio) => setList({ mediaRatio })}
                />
              ),
            },
            {
              id: 'row-gap',
              label: 'Vertical gap',
              info: 'Space between two services in the list.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_ROW_GAP_OPTIONS, list.rowGap ?? 'normal'),
              render: (density) => (
                <SvChoiceTiles
                  label="Vertical gap"
                  density={density}
                  options={PORTFOLIO_SERVICES_INDEX_LIST_ROW_GAP_OPTIONS}
                  value={list.rowGap ?? 'normal'}
                  onChange={(rowGap) => setList({ rowGap })}
                />
              ),
            },
          ],
        },
        {
          id: 'content',
          title: 'Content',
          items: [
            {
              id: 'tasks',
              label: 'Tasks style',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS, list.tasksStyle),
              render: (density) => (
                <SvChoiceTiles
                  label="Tasks style"
                  density={density}
                  glyphViewBox="0 0 64 34"
                  stage
                  options={PORTFOLIO_SERVICES_INDEX_LIST_TASKS_STYLE_OPTIONS.map((option) => ({
                    ...option,
                    glyph: servicesIndexListTasksGlyph(option.value),
                  }))}
                  value={list.tasksStyle}
                  onChange={(tasksStyle) => setList({ tasksStyle })}
                />
              ),
            },
            {
              id: 'show-index',
              label: 'Show index numbers',
              toggle: { checked: list.showIndex, onChange: (showIndex) => setList({ showIndex }) },
            },
            {
              id: 'hover-effect',
              label: 'Hover effect',
              info: 'Zoom enlarges the media, Slide nudges the title, Tint washes the row with the accent colour. Desktop mouse only.',
              value: servicesLabelOf(PORTFOLIO_SERVICES_INDEX_LIST_HOVER_OPTIONS, list.hoverEffect),
              render: (density) => (
                <SvChoiceTiles
                  label="Hover effect"
                  density={density}
                  options={PORTFOLIO_SERVICES_INDEX_LIST_HOVER_OPTIONS}
                  value={list.hoverEffect}
                  onChange={(hoverEffect) => setList({ hoverEffect })}
                />
              ),
            },
          ],
        },
        servicesPriceGroup(services, onChange),
      ];
    }
    default:
      return null;
  }
}

/** Visible caption above each design's options. */
const SERVICES_DESIGN_OPTIONS_TITLE: Partial<Record<PortfolioServicesSectionDesign, string>> = {
  'services-pricing': 'Pricing Cards options',
  'services-pricing-aurora': 'Aurora options',
  'services-pricing-toggle': 'Pricing Toggle options',
  'services-media-columns': 'Media Columns options',
  'services-icon-cards': 'Icon Cards options',
  'services-band-index': 'Band Index options',
  'services-cascade': 'Cascade options',
  'services-capabilities': 'Capabilities options',
  'services-index-list': 'Index List options',
};

export function ServicesSettingsPanel({
  services,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  availableServices = [],
  chrome,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  subSection?: ServicesSubSection;
  onSubSectionChange?: (value: ServicesSubSection) => void;
  settingsFocus?: ServicesSettingsFocus;
  /** Real service items (id + title) from the live preview — powers the "Featured card"
   *  picker below so the creator picks by actual title instead of a bare index. */
  availableServices?: { id: string; title: string }[];
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ServicesSubSection>('general');
  const subSection = normalizeServicesSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ServicesSubSection) => {
    const next = normalizeServicesSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const servicesStyle = services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS;
  const servicesShown = services.showServices !== false;
  // Media Columns / Icon Cards keep tasks, delivery and button off until General turns them on
  // for that design; elsewhere these rows drive the shared switches directly.
  const optInBlock = servicesOptInBlock(services.sectionDesign);
  const optInShown = (element: ServicesOptInElement, global: boolean | undefined) =>
    global !== false && servicesDesignAllows(services, element);
  const optInPatch = (
    element: ServicesOptInElement,
    globalKey: 'showServiceTasks' | 'showServiceDelivery' | 'showServiceCta' | 'showServicePrice',
    next: boolean
  ): Partial<PortfolioServicesSectionSettings> => {
    if (!optInBlock || !servicesIsOptIn(services.sectionDesign, element)) return { [globalKey]: next };
    const field = SERVICES_OPT_IN_FIELDS[element];
    const current =
      optInBlock === 'mediaColumns'
        ? { ...DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS, ...(services.mediaColumns ?? {}) }
        : optInBlock === 'iconCards'
          ? { ...DEFAULT_SERVICES_ICON_CARDS_SETTINGS, ...(services.iconCards ?? {}) }
          : { ...DEFAULT_SERVICES_CAPABILITIES_SETTINGS, ...(services.capabilities ?? {}) };
    return {
      [globalKey]: next || services[globalKey] !== false,
      [optInBlock]: { ...current, [field]: next },
    } as Partial<PortfolioServicesSectionSettings>;
  };
  // Capabilities keeps its price behind its own opt-in switch instead of pricingStyle.showPrice.
  const priceOptIn = servicesIsOptIn(services.sectionDesign, 'price');
  const deliveryShown = optInShown('delivery', services.showServiceDelivery);
  // Pricing tables always show the price; every other design hides it until General turns it on.
  const pricingTable =
    services.sectionDesign === 'services-pricing' ||
    services.sectionDesign === 'services-pricing-aurora' ||
    services.sectionDesign === 'services-pricing-toggle';
  const defaults: PortfolioServicesSectionSettings = {
    enabled: true,
    title: 'Services',
    subtitle: 'Tailored services — built to take your ideas from brief to something you’re proud to share.',
    ...DEFAULT_SERVICES_PRESENTATION,
  };
  const modified = JSON.stringify(services) !== JSON.stringify(defaults);
  return (
    <NpPanelShell
      title={t('Services')}
      modified={modified}
      tabs={SERVICES_SUB_SECTIONS.map((item) => ({ id: item.id, label: t(item.label) }))}
      activeTab={subSection}
      onTabChange={setSubSection}
      onReset={() => onChange(defaults)}
      chrome={chrome}
    >

      {subSection === 'general' ? (
        <div className="np-stack">
          <NpToggleRow card title={t('Show Services section')} description={servicesShown ? undefined : t('Visitors go straight to the next section.')} checked={servicesShown} onChange={(showServices) =>
              onChange({
                showServices,
                enabled: showServices || services.showSkills !== false,
                sectionOrganization: 'distinct',
                layoutMode: 'separated',
              })
            } />
          <div className="np-dimmable" data-disabled={servicesShown ? 'false' : 'true'} inert={!servicesShown}>
          {/* No "Section heading" toggles here: `showServicesSubheading` / `showResponseTime` are
              combined-mode leftovers that mergeServicesPresentation forces off, so a switch for them
              could never stay on. The heading's own elements live in Header → visible elements. */}
          <NpCollapsibleSection title={t('Card elements')}>
              <NpToggleRow
                title={t('Title')}
                checked={services.showServiceTitle !== false}
                onChange={(showServiceTitle) => onChange({ showServiceTitle })}
              />
              <NpToggleRow
                title={t('Description')}
                checked={services.showServiceDescription !== false}
                onChange={(showServiceDescription) => onChange({ showServiceDescription })}
              />
              <NpToggleRow
                title={t('Price')}
                checked={
                  priceOptIn
                    ? optInShown('price', services.showServicePrice)
                    : services.showServicePrice !== false && (pricingTable || servicesStyle.showPrice)
                }
                onChange={(showServicePrice) =>
                  onChange(
                    priceOptIn
                      ? optInPatch('price', 'showServicePrice', showServicePrice)
                      : pricingTable
                      ? { showServicePrice }
                      : {
                          // Non-pricing designs hide the price by default (pricingStyle.showPrice);
                          // this one switch turns both gates on or off together.
                          showServicePrice: showServicePrice || services.showServicePrice !== false,
                          pricingStyle: { ...servicesStyle, showPrice: showServicePrice },
                        }
                  )
                }
              />
              <NpToggleRow
                title={t('Delivery time')}
                checked={deliveryShown}
                onChange={(next) => onChange(optInPatch('delivery', 'showServiceDelivery', next))}
              />
              {deliveryShown ? (
                <div className="pb-3 pt-1">
                  <SvTextInput
                    label={t('Delivery text')}
                    density="regular"
                    allowEmpty
                    maxLength={60}
                    value={services.serviceDeliveryTemplate ?? '{time} delivery'}
                    placeholder={t('{time} delivery')}
                    onCommit={(serviceDeliveryTemplate) => onChange({ serviceDeliveryTemplate })}
                  />
                  <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--pf-palette-texte-muted)]">
                    {'{time}'} {t('becomes the service\'s delivery time (“3 days”). Applies to every design.')}
                  </p>
                </div>
              ) : null}
              <NpToggleRow
                title={t('Tasks checklist')}
                checked={optInShown('tasks', services.showServiceTasks)}
                onChange={(next) => onChange(optInPatch('tasks', 'showServiceTasks', next))}
              />
              <NpToggleRow
                title={t('Order / contact button')}
                checked={optInShown('cta', services.showServiceCta)}
                onChange={(next) => onChange(optInPatch('cta', 'showServiceCta', next))}
              />
          </NpCollapsibleSection>
          </div>
        </div>
      ) : null}

      {subSection !== 'general' && !servicesShown ? <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ showServices: true, enabled: true, sectionOrganization: 'distinct', layoutMode: 'separated' })} /></div> : null}

      {subSection === 'design' && servicesShown ? (
        <div className="np-stack">
          <ServicesDesignChoiceGrid
            showGrid={designCatalogOpen}
            setShowGrid={setDesignCatalogOpen}
            value={services.sectionDesign ?? 'services-index-list'}
            onChange={(sectionDesign) => onChange({ sectionDesign })}
          />

          {designCatalogOpen
            ? null
            : (() => {
                const designGroups = servicesDesignSettingGroups(services, onChange, availableServices);
                if (!designGroups) return null;
                // Pricing designs already list it in their Background group.
                const groups = servicesDesignHasOwnFrame(services.sectionDesign)
                  ? designGroups
                  : [...designGroups, servicesBackgroundFrameGroup(services, onChange)];
                const title = SERVICES_DESIGN_OPTIONS_TITLE[services.sectionDesign] ?? t('Options');
                return (
                  <ServicesLayoutSettingsBand
                    motionKey={services.sectionDesign}
                    id="services-design-options-title"
                    title=""
                    ariaTitle={title}
                    flush
                  >
                    {/* Expanded view only: the Compact (focus rows) view was dropped for Services. */}
                    <SettingsVariantView variant="flat" groups={groups} />
                  </ServicesLayoutSettingsBand>
                );
              })()}

          {designCatalogOpen || SERVICES_DESIGNS_WITH_OPTIONS.has(services.sectionDesign) ? null : (
            <p className="text-[13px] text-[color:var(--pf-palette-texte-muted)]">
              {t('This design has no options of its own — what shows on a card is set in General → Card elements.')}
            </p>
          )}

          {designCatalogOpen ? null : (
            <>
          <NpCollapsibleSection title={t('Style')}>
          <SectionColorModeControl
            label={t('Color mode')}
            value={services.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />

          <ServicesOptionGrid
            label={t('Text size')}
            options={PORTFOLIO_SERVICES_PREMIUM_FONT_SIZE_OPTIONS}
            value={services.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('List bullet')}>
            <p className="-mt-2 text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">
              {t('The mark in front of each task. Applies to')} {Object.values(SERVICES_LIST_BULLET_DESIGNS).join(', ')}.
              {SERVICES_LIST_BULLET_DESIGNS[services.sectionDesign ?? '']
                ? ''
                : t(' Your current design lays its tasks out its own way, so it keeps them as they are.')}
            </p>
            <div className="mt-4">
              <SvChoiceTiles
                label={t('List bullet')}
                density="regular"
                columns={3}
                options={PORTFOLIO_SERVICES_LIST_BULLET_OPTIONS.map((option) => ({
                  ...option,
                  glyph: servicesListBulletGlyph(option.value),
                }))}
                value={(services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS).listBullet ?? 'auto'}
                onChange={(listBullet) =>
                  onChange({
                    pricingStyle: { ...(services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS), listBullet },
                  })
                }
              />
            </div>
            {(services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS).listBullet !== 'none' ? (
              <div className="mt-5">
                <p className="text-xs font-medium text-[color:var(--pf-palette-texte-muted)]">{t('Bullet color')}</p>
                <div className="mt-2.5">
                  <SvSwatches
                    label={t('Bullet color')}
                    density="regular"
                    options={PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                      auto: option.value === 'auto',
                      color: option.value === 'auto' ? 'transparent' : servicesPaletteColor(services, option.value),
                    }))}
                    value={(services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS).listBulletColor ?? 'auto'}
                    onChange={(next) =>
                      onChange({
                        pricingStyle: {
                          ...(services.pricingStyle ?? DEFAULT_SERVICES_PRICING_STYLE_SETTINGS),
                          listBulletColor: next as PortfolioServicesPricingStyleSettings['listBulletColor'],
                        },
                      })
                    }
                  />
                </div>
              </div>
            ) : null}
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Price text')}>
            <p className="-mt-2 text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">
              {t('What every design shows instead of a figure. Leave empty to keep each design\'s own wording.')}
            </p>
            <div className="mt-4">
              <ServicesPriceTextFields services={services} onChange={onChange} />
            </div>
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Order button')}>
            <p className="-mt-2 text-[13px] leading-5 text-[color:var(--pf-palette-texte-muted)]">
              {t('One button setup for every design — label, look, shape and where it leads.')}
            </p>
            <div className="mt-4">
              <ServicesOrderButtonFields services={services} onChange={onChange} />
            </div>
          </NpCollapsibleSection>
            </>
          )}
        </div>
      ) : null}

      {subSection === 'background' && servicesShown ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={services}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => {
              const slot = SERVICES_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return <ServicesManualColorField label={label} value={value} onChange={onColorChange} />;
              }
              return (
                <ServicesColorField services={services} onChange={onChange} slot={slot} label={label} value={value} />
              );
            }}
          />
          </NpCollapsibleSection>
        </div>
      ) : null}

      {subSection === 'header' && servicesShown ? (
        <div className="np-stack">
          <NpCollapsibleSection title={t('Header design')}>
          <ServicesHeaderChoiceGrid
            value={services.headerDesign ?? 'editorial'}
            onChange={(headerDesign) => onChange({ headerDesign })}
            open={headerCatalogOpen}
            onOpenChange={setHeaderCatalogOpen}
          />
          </NpCollapsibleSection>

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen ? null : (
            <NpCollapsibleSection title={t('Header settings')}>
              <ServicesHeaderDesignFields services={services} onChange={onChange} />
            </NpCollapsibleSection>
          )}
        </div>
      ) : null}
    </NpPanelShell>
  );
}
