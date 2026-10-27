'use client';
import {DesignCatalogueCard} from './portfolio-design-catalogue-card';
import {ContactDesignThumbnail} from '@/components/portfolio/portfolio-contact-design-thumbnail';
import { ContactPreviewSkeleton } from './portfolio-contact-preview-skeleton';
import { PortfolioDesignLivePreview, usePortfolioDesignPreviewSource } from './PortfolioDesignLivePreview';
import { withDesignPreview } from '@/lib/portfolio-design-preview';

import { SectionPaletteFamilyControl } from '@/components/portfolio/portfolio-section-palette-family';
import { TextSizeSlider } from '@/components/portfolio/portfolio-text-size-slider';
import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { resolveThumbnailTheme } from './portfolio-thumbnail-theme';
import { HeaderDesignFields, type HeaderCopy } from '@/components/portfolio/portfolio-header-design-fields';
import { HeaderDesignPicker } from '@/components/portfolio/portfolio-header-design-picker';
import type { HeaderPatch } from '@/components/portfolio/portfolio-header-style-controls';
import { contactHeaderPaletteTokenColor } from '@/components/portfolio/portfolio-contact-header-settings';
import { CardsStyleControls } from '@/components/portfolio/portfolio-cards-style-controls';
import { DEFAULT_CARDS_STYLE } from '@/components/portfolio/portfolio-cards-style';
import { useState, type ReactNode } from 'react';
import type {
  PortfolioContactCardDesign,
  PortfolioContactPremiumDesign,
  PortfolioContactSectionSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  DEFAULT_CONTACT_PRESENTATION,
  PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS,
  PORTFOLIO_CONTACT_PREMIUM_FONT_SIZE_OPTIONS,
  isContactPremiumDesign,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  CONTACT_DESIGN_LAYOUT_SPECS,
  CONTACT_LAYOUT_GROUP_TITLES,
  contactLayoutOverride,
  patchContactLayoutElement,
  resolveContactLayoutOption,
  resolveContactLayoutVisible,
  type ContactLayoutElementSpec,
  type ContactLayoutGroup,
} from '@/components/portfolio/portfolio-contact-design-layout';
import { PortfolioSettingsPhotoField } from '@/components/portfolio/portfolio-settings-photo-field';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import {
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { SettingRow, SettingsRowsScope, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';
import { NpBackRow, NpCollapsibleSection, NpPanelShell, NpToggleRow, type NpPanelChrome } from '@/components/portfolio/portfolio-nav-panel-ui';

export type ContactSubSection = 'general' | 'design' | 'header' | 'background';

const CONTACT_SUB_SECTIONS: { id: ContactSubSection; label: string; description: string }[] = [
  { id: 'general', label: msg('General'), description: msg('Section visibility and defaults.') },
  { id: 'design', label: msg('Design'), description: msg('Layout and visual style.') },
  { id: 'header', label: msg('Header'), description: msg('What the title block above the section shows.') },
  { id: 'background', label: msg('Background'), description: msg('Fill behind this section.') },
];

/** Map legacy subsection ids (saved UI state / search) onto the current Contact menu. */
const CONTACT_HEADER_COPY: HeaderCopy = {
  editorial: { label: msg('Contact'), title: msg('Let’s work together'), subtitle: msg('Tell me about your project — I reply quickly.') },
  index: { rule: 'Index', title: msg('Let’s work together'), subtitle: msg('Tell me about your project — I reply quickly.'), count: 'Channels' },
  marquee: ['Contact', 'Optional', 'Optional', 'Optional'],
  accent: { badge: 'Open to work', lead: 'Tell me about your project — I reply quickly.' },
  serif: { label: msg('Contact'), title: msg('Let’s build something together.'), subtitle: msg('Tell me about your project — I reply quickly.') },
  billboard: { word: 'CONTACT', title: msg('Let’s work together'), count: 'Reply within 24h' },
  masthead: ['Let’s talk.', 'Share your idea.', 'Get a reply.'],
  split: { title: msg('Let’s work together'), label: msg('Contact') },
};

const CONTACT_HEADER_COLOR_OPTIONS = [
  { value: 'principal' as const, label: msg('Principal') },
  { value: 'secondaire' as const, label: msg('Secondary') },
  { value: 'texteFort' as const, label: msg('Strong text') },
];

const CONTACT_HEADER_ALIGNMENT_OPTIONS = [
  { value: 'left' as const, label: msg('Left') },
  { value: 'center' as const, label: msg('Center') },
  { value: 'right' as const, label: msg('Right') },
];

const CONTACT_HEADER_BILLBOARD_OPTIONS = [
  { value: 'outline' as const, label: msg('Outline') },
  { value: 'fill' as const, label: msg('Fill') },
  { value: 'simple' as const, label: msg('Simple') },
];

export function normalizeContactSubSection(value: string | undefined): ContactSubSection {
  if (value === 'general' || value === 'design' || value === 'header' || value === 'background') {
    return value;
  }
  return 'general';
}

/* ---------------------------------------------------------------------- */
/* General tab — same toggle-row + switch mechanism as every other        */
/* section's General tab (Work, Info, FAQ).                                */
/* ---------------------------------------------------------------------- */

function ContactSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span className="np-switch" aria-checked={checked} aria-hidden data-switch-track="">
      <span className="np-switch-knob" />
    </span>
  );
}

function ContactToggleRow({
  label,
  checked,
  onChange,
  divider = true,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** false when the row heads its own input (a text field's show/hide switch). */
  divider?: boolean;
}) {
  const rows = useSettingsRows();
    if (rows) return <SettingRow label={label} toggle={{ checked, onChange }} />;
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        divider ? 'border-b border-[color:var(--pf-palette-bordure)] py-3.5 last:border-b-0' : 'pt-1'
      }`}
    >
      <span
        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-[color:var(--pf-palette-texte-fort)]"
        onClick={() => onChange(!checked)}
      >
        {label}
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="shrink-0">
        <ContactSwitchTrack checked={checked} />
      </button>
    </div>
  );
}

function ContactOptionGrid<T extends string>({
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
  columns?: 1 | 2 | 3 | 4 | 5;
}) {
  const t = useT();
  const rows = useSettingsRows();
      return (
    <SettingRow label={label} value={String(options.find((option) => option.value === value)?.label ?? '')}>
    <div>
      {rows ? null : (<p className="pf-stack-block-label">{label}</p>)}
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-2 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(option.description)}
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition ${
                active ? 'pf-choice pf-choice--active' : 'pf-choice'
              }`}
            >
              {t(option.label)}
            </button>
          );
        })}
      </div>
    </div>
    </SettingRow>
  );
}

/* ---------------------------------------------------------------------- */
/* Background tab — section-background color fields, bound to the         */
/* portfolio's own Hero palette (4 fixed swatches, no free-form hex) —     */
/* same mechanism as Info's Background tab.                                */
/* ---------------------------------------------------------------------- */

const CONTACT_PALETTE_SWATCH_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: msg('Background') },
  { value: 'neutre', label: msg('Neutral') },
  { value: 'principal', label: msg('Primary') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Strong text') },
];

function ContactPaletteSwatchPicker({
  label,
  palette,
  value,
  onChange,
}: {
  label: string;
  palette: PortfolioHeroPalette;
  value: string;
  onChange: (hex: string) => void;
}) {
      const activeHex = value.trim().toLowerCase();
  const options = CONTACT_PALETTE_SWATCH_TOKENS.map((token) => {
    const hex = resolveHeroPaletteColor(palette, token.value);
    return { value: hex, label: token.label, color: hex };
  });
  const current = options.find((option) => option.value.toLowerCase() === activeHex)?.value ?? '';
  return <ColorSwatchRow label={label} options={options} value={current} onChange={onChange} />;
}

/** The 9 new premium, full-bleed designs — shown first in the Design tab. The other 9
 *  legacy card designs still exist in the data model (old accounts keep rendering
 *  correctly) but aren't surfaced in this picker yet — same "clean slate" convention
 *  as every other section's Design tab in this rollout. */
const PREMIUM_CONTACT_DESIGNS: PortfolioContactPremiumDesign[] = [
  'editorial-focus',
  'split-grid',
  'liquid-distortion',
  'sequential-reveal',
  'studio-overlap',
  'broken-grid',
  'numbered-narrative',
  'magnetic-overlap',
];

/** What each premium design renders. They all show email and phone; none has the shared
 *  section header, a CTA switch, a response-time subtitle or an optional form (the two with a
 *  form always show it) — those settings only exist for the legacy card designs. */
const CONTACT_PREMIUM_DESIGN_SHOWS: Record<
  PortfolioContactPremiumDesign,
  { location: boolean; socialLinks: boolean; photo: boolean }
> = {
  'editorial-focus': { location: true, socialLinks: true, photo: false },
  'split-grid': { location: true, socialLinks: true, photo: true },
  'liquid-distortion': { location: true, socialLinks: true, photo: false },
  'sequential-reveal': { location: true, socialLinks: false, photo: true },
  'studio-overlap': { location: true, socialLinks: false, photo: true },
  'broken-grid': { location: true, socialLinks: true, photo: true },
  'numbered-narrative': { location: true, socialLinks: true, photo: true },
  'magnetic-overlap': { location: false, socialLinks: true, photo: true },
};

/** Mini wireframe canvas — shared settings-UI chrome (`.pf-stack-*` classes are generic,
 *  not Stack-specific — reused across every section panel with this picker mechanism). */
function ContactMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" preserveAspectRatio="none" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

/** Wireframe + name only — no description paragraph (see the "Settings design standard"
 *  text-reduction rule). Tinted background (no visible border on rest); the selected card's
 *  only signal is its label switching to the accent color (plus a faint accent-tinted card
 *  background) — no stripe, no floating badge. Hover lift/brighten — see
 *  `.pf-contact-design-card` in globals.css (same recipe as Footer's own picker card). */
function _ContactPickerCard({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      className="pf-contact-design-card relative rounded-2xl p-2.5 text-left"
    >
      {children}
      <span className="pf-contact-card-label mt-2 block text-sm font-semibold leading-none tracking-tight">
        {label}
      </span>
    </button>
  );
}

function ContactDesignWireframe({ design }: { design: PortfolioContactCardDesign }) {
  const t = useT();
  switch (design) {
    case 'editorial-focus':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="18" width="30" height="9" rx="2" />
          <rect className="pf-stack-mini-ink" x="10" y="30" width="42" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="72" y="16" width="34" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="80" y="26" width="26" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="70" y="40" width="30" height="3" rx="1.5" />
        </ContactMiniSlide>
      );
    case 'split-grid':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="16" width="16" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="20" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="10" y="36" width="14" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-ink" x="52" y="20" width="58" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="52" y="38" width="40" height="3" rx="1.5" />
        </ContactMiniSlide>
      );
    case 'liquid-distortion':
      return (
        <ContactMiniSlide>
          <text x="60" y="42" fontSize={26} fontWeight={900} textAnchor="middle" opacity={0.12} className="pf-stack-mini-ink">
            {t('OK')}
          </text>
          <rect className="pf-stack-mini-mute" x="10" y="12" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="88" y="14" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="10" y="54" width="22" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="88" y="52" width="22" height="3" rx="1.5" />
        </ContactMiniSlide>
      );
    case 'sequential-reveal':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="10" width="50" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="26" width="30" height="2.4" rx="1.2" opacity={0.6} />
          <rect className="pf-stack-mini-ink" x="10" y="34" width="100" height="20" rx="2" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="10" y="60" width="40" height="2.4" rx="1.2" />
          <rect className="pf-stack-mini-mute" x="60" y="60" width="40" height="2.4" rx="1.2" />
        </ContactMiniSlide>
      );
    case 'studio-overlap':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="10" width="42" height="14" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="34" width="20" height="2.4" rx="1.2" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="10" y="40" width="34" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="10" y="50" width="20" height="2.4" rx="1.2" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="10" y="56" width="28" height="3" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="66" y="8" width="44" height="56" rx="1" />
          <rect className="pf-stack-mini-ink" x="88" y="52" width="22" height="10" rx="1" />
        </ContactMiniSlide>
      );
    case 'broken-grid':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="10" width="30" height="7" rx="2" />
          <rect className="pf-stack-mini-mute" x="94" y="10" width="16" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="94" y="16" width="16" height="2" rx="1" />
          <circle className="pf-stack-mini-mute" cx="60" cy="38" r="12" />
          <rect className="pf-stack-mini-ink" x="70" y="54" width="40" height="8" rx="2" />
        </ContactMiniSlide>
      );
    case 'numbered-narrative':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="8" width="40" height="6" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="24" width="4" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="10" y="28" width="40" height="2" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="10" y="38" width="4" height="2" rx="1" />
          <rect className="pf-stack-mini-mute" x="10" y="42" width="40" height="2" rx="1" opacity={0.5} />
          <circle className="pf-stack-mini-mute" cx="96" cy="16" r="8" />
          <rect className="pf-stack-mini-mute" x="88" y="50" width="20" height="2" rx="1" opacity={0.6} />
        </ContactMiniSlide>
      );
    case 'magnetic-overlap':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="8" width="14" height="2" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-ink" x="10" y="16" width="46" height="10" rx="2" />
          <rect className="pf-stack-mini-mute" x="66" y="10" width="44" height="30" rx="1" opacity={0.7} />
          <rect className="pf-stack-mini-mute" x="10" y="58" width="26" height="6" rx="3" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="40" y="58" width="26" height="6" rx="3" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="70" y="58" width="26" height="6" rx="3" opacity={0.6} />
        </ContactMiniSlide>
      );
    default:
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="18" width="100" height="9" rx="2" />
          <rect className="pf-stack-mini-mute" x="10" y="34" width="70" height="3" rx="1.5" />
        </ContactMiniSlide>
      );
  }
}

/** Collapsed-state row: thumbnail + selected design name + chevron; the whole row opens the
 *  catalogue. Same pattern as Footer's design picker. */
function _ContactDesignSummaryRow({
  design,
  name,
  onOpen,
}: {
  design: PortfolioContactCardDesign;
  name: string;
  onOpen: () => void;
}) {
  return (
    <div>
      <p className="pf-stack-block-label">Design</p>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Change section design"
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[color:var(--pf-palette-bordure)] px-3 py-2.5 text-left transition hover:border-[color:var(--pf-palette-texte-muted)]"
      >
        <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent">
          <span className="flex w-[116px] shrink-0 items-center justify-center">
            <ContactDesignWireframe design={design} />
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[color:var(--pf-palette-texte-fort)]">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[color:var(--pf-palette-texte-muted)]" aria-hidden>
          <path d="M7.5 4.5l5 5.5-5 5.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Design tab → Layout settings — one band per selected premium design,    */
/* generated from CONTACT_DESIGN_LAYOUT_SPECS (same pattern as Footer).    */
/* ---------------------------------------------------------------------- */

type ContactLayoutPatch = (patch: Partial<PortfolioContactSectionSettings>) => void;

const CONTACT_LAYOUT_INPUT_CLASS =
  'w-full rounded-xl border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-2.5 text-sm text-[color:var(--pf-palette-texte-fort)] placeholder:text-[color:var(--pf-palette-texte-muted)]';

const CONTACT_LAYOUT_GROUP_ORDER: ContactLayoutGroup[] = ['image', 'text', 'details', 'form', 'labels', 'effects'];

/** Groups longer than this start collapsed (Settings design standard, rule 5). */
const CONTACT_LAYOUT_COLLAPSE_AFTER = 5;

function ContactLayoutControl({
  contact,
  design,
  spec,
  onChange,
}: {
  contact: PortfolioContactSectionSettings;
  design: PortfolioContactPremiumDesign;
  spec: ContactLayoutElementSpec;
  onChange: ContactLayoutPatch;
}) {
  const t = useT();
  const setOverride = (patch: { visible?: boolean; text?: string; choice?: string }) =>
    onChange(patchContactLayoutElement(contact, design, spec.key, patch));

  if (spec.kind === 'toggle') {
    return (
      <ContactToggleRow
        label={t(spec.label)}
        checked={resolveContactLayoutVisible(contact, design, spec.key)}
        onChange={(visible) => setOverride({ visible })}
      />
    );
  }

  if (spec.kind === 'option') {
    return (
      <ContactOptionGrid
        label={t(spec.label)}
        options={spec.options}
        value={resolveContactLayoutOption(contact, design, spec.key)}
        onChange={(choice) => setOverride({ choice })}
        columns={Math.min(spec.options.length, 4) as 2 | 3 | 4}
      />
    );
  }

  const hideable = spec.hideable !== false;
  const visible = resolveContactLayoutVisible(contact, design, spec.key);
  const value = contactLayoutOverride(contact, design, spec.key)?.text ?? '';
  const placeholder = spec.placeholder?.(contact) || spec.defaultText(contact);
  return (
    <div className="space-y-2">
      {hideable ? (
        <ContactToggleRow
          label={t(spec.label)}
          checked={visible}
          divider={false}
          onChange={(next) => setOverride({ visible: next })}
        />
      ) : (
        <p className="pt-1 text-sm font-medium text-[color:var(--pf-palette-texte-fort)]">{t(spec.label)}</p>
      )}
      {visible ? (
        spec.multiline ? (
          <textarea
            rows={2}
            value={value}
            placeholder={placeholder}
            aria-label={t(spec.label)}
            onChange={(event) => setOverride({ text: event.target.value })}
            className={`${CONTACT_LAYOUT_INPUT_CLASS} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            aria-label={t(spec.label)}
            onChange={(event) => setOverride({ text: event.target.value })}
            className={CONTACT_LAYOUT_INPUT_CLASS}
          />
        )
      ) : null}
    </div>
  );
}

function ContactLayoutGroupBlock({ group, specs, contact, design, onChange }: {
  group: ContactLayoutGroup; specs: ContactLayoutElementSpec[];
  contact: PortfolioContactSectionSettings; design: PortfolioContactPremiumDesign; onChange: ContactLayoutPatch;
}) {
  const fields = specs.filter((spec) => spec.kind !== 'toggle');
  return <NpCollapsibleSection title={CONTACT_LAYOUT_GROUP_TITLES[group]} defaultOpen={fields.length <= CONTACT_LAYOUT_COLLAPSE_AFTER}>
    <div className="space-y-5">
      {specs.map((spec) => (
        <ContactLayoutControl key={spec.key} contact={contact} design={design} spec={spec} onChange={onChange} />
      ))}
    </div>
  </NpCollapsibleSection>;
}

function ContactLayoutSettingsBand({
  contact,
  onChange,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: ContactLayoutPatch;
}) {
  const t = useT();
  if (!isContactPremiumDesign(contact.cardDesign)) return null;
  const design = contact.cardDesign as PortfolioContactPremiumDesign;
  const specs = (CONTACT_DESIGN_LAYOUT_SPECS[design] ?? []).filter((spec) => !spec.showWhen || spec.showWhen(contact));
  if (specs.length === 0) return null;

  return (
    <section aria-labelledby="contact-layout-settings-title">
      <h3 id="contact-layout-settings-title" className="sr-only">
        {t('Layout settings')}
      </h3>
      <div key={design}>
        {CONTACT_LAYOUT_GROUP_ORDER.map((group) => {
          const groupSpecs = specs.filter((spec) => spec.group === group);
          if (groupSpecs.length === 0) return null;
          return (
            <ContactLayoutGroupBlock
              key={group}
              group={group}
              specs={groupSpecs}
              contact={contact}
              design={design}
              onChange={onChange}
            />
          );
        })}
      </div>
    </section>
  );
}

export function ContactSettingsPanel({
  contact,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  profileAvatarUrl = null,
  chrome,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: (patch: Partial<PortfolioContactSectionSettings>) => void;
  subSection?: ContactSubSection;
  onSubSectionChange?: (value: ContactSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
  /** Account profile photo — shown in General → Photo until a custom one replaces it. */
  profileAvatarUrl?: string | null;
  chrome?: NpPanelChrome;
}) {
  const t = useT();
  const [designCatalogOpen, setDesignCatalogOpen] = useState(true);
  const previewSource = usePortfolioDesignPreviewSource();
  const thumbnailMode = (contact.colorModeOverride === 'auto' ? previewSource?.settings.global.colorMode : contact.colorModeOverride) === 'light' ? 'light' : 'dark';
  const backgroundTheme = resolveThumbnailTheme(previewSource?.settings.global, contact);
  const [headerCatalogOpen, setHeaderCatalogOpen] = useState(true);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ContactSubSection>('general');
  const premiumShows = isContactPremiumDesign(contact.cardDesign)
    ? CONTACT_PREMIUM_DESIGN_SHOWS[contact.cardDesign as PortfolioContactPremiumDesign]
    : null;
  // Premium designs never render the shared section header, so its tab would edit nothing.
  const tabs = premiumShows ? CONTACT_SUB_SECTIONS.filter((tab) => tab.id !== 'header') : CONTACT_SUB_SECTIONS;
  const requestedSubSection = normalizeContactSubSection(controlledSubSection ?? uncontrolledSubSection);
  const subSection = premiumShows && requestedSubSection === 'header' ? 'general' : requestedSubSection;
  const [previousSubSection, setPreviousSubSection] = useState(subSection);
  if(previousSubSection !== subSection){
    setPreviousSubSection(subSection);
    if(subSection === 'design')setDesignCatalogOpen(true);
    if(subSection === 'header')setHeaderCatalogOpen(true);
  }
  const setSubSection = (value: ContactSubSection) => {
    const next = normalizeContactSubSection(value);
    if(next === 'design')setDesignCatalogOpen(true);
    if(next === 'header')setHeaderCatalogOpen(true);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const defaults: PortfolioContactSectionSettings = { enabled: true, title: 'Contact', subtitle: 'Should you have a project in mind, I would be pleased to hear from you to discuss your objectives.', ...DEFAULT_CONTACT_PRESENTATION };
  return (
    <NpPanelShell title={t('Contact')} modified={JSON.stringify(contact) !== JSON.stringify(defaults)} tabs={tabs.map((item) => ({ id: item.id, label: t(item.label) }))} activeTab={subSection} onTabChange={setSubSection} onReset={() => onChange(defaults)} chrome={chrome}>

      {subSection === 'general' ? (
        <div className="np-stack"><NpToggleRow card title={t('Show Contact section')} description={contact.enabled ? undefined : t('Visitors go straight to the next section.')} checked={contact.enabled} onChange={(enabled) => onChange({ enabled })} />
          <div className="pb-6"><SectionColorModeControl hideLabel label={t('Color mode')} value={contact.colorModeOverride} onChange={(colorModeOverride) => onChange({ colorModeOverride })} /></div><div className="np-dimmable" data-disabled={contact.enabled ? 'false' : 'true'} inert={!contact.enabled}>
          <NpCollapsibleSection title={t('Content shown')}>
              <NpToggleRow title={t('Email')} checked={contact.showEmail} onChange={(showEmail) => onChange({ showEmail })} />
              <NpToggleRow title={t('Phone')} checked={contact.showPhone} onChange={(showPhone) => onChange({ showPhone })} />
              {!premiumShows || premiumShows.location ? (
                <NpToggleRow title={t('Location')} checked={contact.showLocation} onChange={(showLocation) => onChange({ showLocation })} />
              ) : null}
              {!premiumShows || premiumShows.socialLinks ? (
                <NpToggleRow
                  title={t('Social links')}
                  checked={contact.showSocialLinks}
                  onChange={(showSocialLinks) => onChange({ showSocialLinks })}
                />
              ) : null}
              {premiumShows ? null : (
                <>
                  <NpToggleRow title={t('CTA button')} checked={contact.showCta} onChange={(showCta) => onChange({ showCta })} />
                  <NpToggleRow
                    title={t('Response time in subtitle')}
                    checked={contact.showResponseTimeInSubtitle}
                    onChange={(showResponseTimeInSubtitle) => onChange({ showResponseTimeInSubtitle })}
                  />
                  <NpToggleRow
                    title={t('Contact form')}
                    checked={contact.showContactForm}
                    onChange={(showContactForm) => onChange({ showContactForm })}
                  />
                </>
              )}
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Style')}>
            
            <TextSizeSlider label={t('Text size')} options={PORTFOLIO_CONTACT_PREMIUM_FONT_SIZE_OPTIONS} value={contact.premiumFontSize ?? 'medium'} onChange={(premiumFontSize) => onChange({ premiumFontSize })} />
          </NpCollapsibleSection>
        </div></div>
      ) : null}

      {subSection !== 'general' && !contact.enabled ? <div className="np-stack"><NpToggleRow card title={t('This section is hidden')} description={t('Enable it to edit its settings and make it visible on the portfolio.')} checked={false} onChange={() => onChange({ enabled: true })} /></div> : null}

      {subSection === 'design' && contact.enabled ? (
        <div className="np-stack">
          {designCatalogOpen ? (
            <div className="np-stack">
              <div className="flex flex-col gap-8" aria-label={t('Choose a design')}>
                {PREMIUM_CONTACT_DESIGNS.map(design=>{
                  const option=PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS.find(item=>item.value===design);
                  if(!option)return null;
                  return <DesignCatalogueCard key={design} label={t(option.label)} selected={contact.cardDesign===design} onSelect={()=>onChange({cardDesign:design})} onCustomize={()=>{if(contact.cardDesign!==design)onChange({cardDesign:design});setDesignCatalogOpen(false);}}>{previewSource?<span className="relative block aspect-[2/1] w-full overflow-hidden rounded-lg"><PortfolioDesignLivePreview src={withDesignPreview(previewSource.portfolioPath,{section:'contact',design})} settings={previewSource.settings} fill loadMargin="48px 0px" skeleton={<ContactPreviewSkeleton design={design} dark={thumbnailMode==='dark'}/>} /></span>:<ContactDesignThumbnail design={design} mode={thumbnailMode} priority={contact.cardDesign===design}/>}</DesignCatalogueCard>;
                })}
              </div>
            </div>
          ) : (
            <>
              <NpBackRow title={t(PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS.find(item=>item.value===contact.cardDesign)?.label??'Contact design')} onBack={()=>setDesignCatalogOpen(true)}/>
              <SettingsRowsScope title={t('Layout options')}><ContactLayoutSettingsBand contact={contact} onChange={onChange} /></SettingsRowsScope>
            </>
          )}
          {/* Only Sequential reveal (and the legacy card designs) paint cards; every other premium design ignores these. */}
          {designCatalogOpen || (premiumShows && contact.cardDesign !== 'sequential-reveal') ? null : (
            <CardsStyleControls
              value={contact.cardsStyle ?? DEFAULT_CARDS_STYLE}
              onChange={(cardsStyle) => onChange({ cardsStyle })}
            />
          )}
          {/* The Style section only holds the photo, so designs without a photo have nothing to show in it. */}
          {designCatalogOpen || (premiumShows && !premiumShows.photo) ? null : (
          <NpCollapsibleSection title={t('Style')}>
            <PortfolioSettingsPhotoField
              photoUrl={contact.photoUrl ?? ''}
              profileAvatarUrl={profileAvatarUrl}
              onChange={(photoUrl) => onChange({ photoUrl })}
            />
          </NpCollapsibleSection>
          )}
        </div>
      ) : null}

      {subSection === 'header' && contact.enabled ? (
        <div className="np-stack">
            <HeaderDesignPicker
              catalogueMode
              value={contact.headerDesign ?? 'editorial'}
              onChange={(headerDesign) => onChange({ headerDesign })}
              open={headerCatalogOpen}
              onOpenChange={setHeaderCatalogOpen}
              word={t('CONTACT')}
            />

          {/* Browsing the catalog is a different task from tuning the chosen design: no settings below it. */}
          {headerCatalogOpen ? null : (
            <NpCollapsibleSection title={t('Header settings')}>
              <HeaderDesignFields
                settings={contact}
                onPatch={(patch: HeaderPatch) => onChange(patch as Partial<PortfolioContactSectionSettings>)}
                copy={CONTACT_HEADER_COPY}
                colorOptions={CONTACT_HEADER_COLOR_OPTIONS}
                resolveColor={contactHeaderPaletteTokenColor}
                accentAlignmentOptions={CONTACT_HEADER_ALIGNMENT_OPTIONS}
                billboardStyleOptions={CONTACT_HEADER_BILLBOARD_OPTIONS}
              />
            </NpCollapsibleSection>
          )}
        </div>
      ) : null}

      {subSection === 'background' && contact.enabled ? (
        <div className="np-stack"><NpCollapsibleSection title={t('Palette')}>
            <SectionPaletteFamilyControl
              value={contact.paletteFamily ?? 'global'}
              onChange={(paletteFamily) => onChange({ paletteFamily })}
              mode={backgroundTheme.mode}
            />
          </NpCollapsibleSection>
          <NpCollapsibleSection title={t('Background')}>
          <SectionBackgroundSettingsFields
            settings={contact}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => (
              <ContactPaletteSwatchPicker
                label={label}
                palette={backgroundTheme.palette}
                value={value}
                onChange={onColorChange}
              />
            )}
          />
        </NpCollapsibleSection></div>
      ) : null}
    </NpPanelShell>
  );
}
