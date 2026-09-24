'use client';

import { useState, type ReactNode } from 'react';
import type {
  PortfolioContactCardDesign,
  PortfolioContactPremiumDesign,
  PortfolioContactSectionSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import {
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
  DEFAULT_HERO_PALETTE,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type ContactSubSection = 'general' | 'design' | 'background';

const CONTACT_SUB_SECTIONS: { id: ContactSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and defaults.' },
  { id: 'design', label: 'Design', description: 'Layout and visual style.' },
  { id: 'background', label: 'Background', description: 'Fill behind this section.' },
];

/** Map legacy subsection ids (saved UI state / search) onto the current Contact menu. */
export function normalizeContactSubSection(value: string | undefined): ContactSubSection {
  if (value === 'general' || value === 'design' || value === 'background') {
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
          backgroundColor: checked ? 'var(--pf-palette-fond, #ffffff)' : 'var(--pf-palette-texte-fort, #171717)',
        }}
      />
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
  return (
    <div
      className={`flex items-center justify-between gap-4 ${
        divider ? 'border-b border-neutral-200/80 py-3.5 last:border-b-0' : 'pt-1'
      }`}
    >
      <span
        className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-neutral-950"
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
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
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
              title={option.description}
              onClick={() => onChange(option.value)}
              className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold transition ${
                active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Background tab — section-background color fields, bound to the         */
/* portfolio's own Hero palette (4 fixed swatches, no free-form hex) —     */
/* same mechanism as Info's Background tab.                                */
/* ---------------------------------------------------------------------- */

const CONTACT_PALETTE_SWATCH_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: 'Fond' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'principal', label: 'Principal' },
  { value: 'texteMuted', label: 'Texte muted' },
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
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      <div className="mt-2 flex flex-wrap gap-3">
        {CONTACT_PALETTE_SWATCH_TOKENS.map((token) => {
          const hex = resolveHeroPaletteColor(palette, token.value);
          const active = hex.toLowerCase() === activeHex;
          return (
            <button
              key={token.value}
              type="button"
              onClick={() => onChange(hex)}
              aria-pressed={active}
              aria-label={token.label}
              title={token.label}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition ${
                active ? 'ring-2 ring-neutral-900 ring-offset-2' : 'hover:bg-neutral-100'
              }`}
            >
              <span className="h-9 w-9 rounded-full border border-neutral-200/80 shadow-inner" style={{ backgroundColor: hex }} />
              <span className="text-[11px] font-medium text-neutral-500">{token.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The 9 new premium, full-bleed designs — shown first in the Design tab. The other 9
 *  legacy card designs still exist in the data model (old accounts keep rendering
 *  correctly) but aren't surfaced in this picker yet — same "clean slate" convention
 *  as every other section's Design tab in this rollout. */
const PREMIUM_CONTACT_DESIGNS: PortfolioContactCardDesign[] = [
  'editorial-focus',
  'split-grid',
  'liquid-distortion',
  'sequential-reveal',
  'studio-overlap',
  'borderless-grid',
  'broken-grid',
  'numbered-narrative',
  'magnetic-overlap',
];

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
function ContactPickerCard({
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
            OK
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
    case 'borderless-grid':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-ink" x="10" y="12" width="40" height="8" rx="2" />
          <rect className="pf-stack-mini-ink" x="10" y="46" width="40" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="66" y="14" width="24" height="2" rx="1" opacity={0.6} />
          <rect className="pf-stack-mini-mute" x="66" y="28" width="40" height="5" rx="1.5" />
          <rect className="pf-stack-mini-mute" x="66" y="42" width="46" height="7" rx="1.5" />
          <circle className="pf-stack-mini-mute" cx="70" cy="60" r="2" />
          <circle className="pf-stack-mini-mute" cx="80" cy="60" r="2" />
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
function ContactDesignSummaryRow({
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
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Design</p>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Change section design"
        className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-neutral-200/80 px-3 py-2.5 text-left transition hover:border-neutral-300"
      >
        <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200/80 bg-white">
          <span className="flex w-[116px] shrink-0 items-center justify-center">
            <ContactDesignWireframe design={design} />
          </span>
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-950">{name}</span>
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden>
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
  'w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400';

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
  const setOverride = (patch: { visible?: boolean; text?: string; choice?: string }) =>
    onChange(patchContactLayoutElement(contact, design, spec.key, patch));

  if (spec.kind === 'toggle') {
    return (
      <ContactToggleRow
        label={spec.label}
        checked={resolveContactLayoutVisible(contact, design, spec.key)}
        onChange={(visible) => setOverride({ visible })}
      />
    );
  }

  if (spec.kind === 'option') {
    return (
      <ContactOptionGrid
        label={spec.label}
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
          label={spec.label}
          checked={visible}
          divider={false}
          onChange={(next) => setOverride({ visible: next })}
        />
      ) : (
        <p className="pt-1 text-sm font-medium text-neutral-950">{spec.label}</p>
      )}
      {visible ? (
        spec.multiline ? (
          <textarea
            rows={2}
            value={value}
            placeholder={placeholder}
            aria-label={spec.label}
            onChange={(event) => setOverride({ text: event.target.value })}
            className={`${CONTACT_LAYOUT_INPUT_CLASS} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={value}
            placeholder={placeholder}
            aria-label={spec.label}
            onChange={(event) => setOverride({ text: event.target.value })}
            className={CONTACT_LAYOUT_INPUT_CLASS}
          />
        )
      ) : null}
    </div>
  );
}

function ContactLayoutGroupBlock({
  group,
  specs,
  contact,
  design,
  onChange,
}: {
  group: ContactLayoutGroup;
  specs: ContactLayoutElementSpec[];
  contact: PortfolioContactSectionSettings;
  design: PortfolioContactPremiumDesign;
  onChange: ContactLayoutPatch;
}) {
  // Switches (e.g. "Contact form") always stay visible; only the secondary fields collapse.
  const toggles = specs.filter((spec) => spec.kind === 'toggle');
  const fields = specs.filter((spec) => spec.kind !== 'toggle');
  const collapsible = fields.length > CONTACT_LAYOUT_COLLAPSE_AFTER;
  const [open, setOpen] = useState(!collapsible);
  const title = CONTACT_LAYOUT_GROUP_TITLES[group];

  return (
    <div className="space-y-3">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex items-baseline gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{title}</span>
            <span className="text-[11px] font-semibold tabular-nums text-neutral-400">{fields.length}</span>
          </span>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden
            className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">{title}</p>
      )}
      {!collapsible ? (
        <div className="space-y-4">
          {specs.map((spec) => (
            <ContactLayoutControl key={spec.key} contact={contact} design={design} spec={spec} onChange={onChange} />
          ))}
        </div>
      ) : (
        <>
          {toggles.length > 0 ? (
            <div>
              {toggles.map((spec) => (
                <ContactLayoutControl key={spec.key} contact={contact} design={design} spec={spec} onChange={onChange} />
              ))}
            </div>
          ) : null}
          {open ? (
            <div className="space-y-4">
              {fields.map((spec) => (
                <ContactLayoutControl key={spec.key} contact={contact} design={design} spec={spec} onChange={onChange} />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ContactLayoutSettingsBand({
  contact,
  onChange,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: ContactLayoutPatch;
}) {
  if (!isContactPremiumDesign(contact.cardDesign)) return null;
  const design = contact.cardDesign as PortfolioContactPremiumDesign;
  const specs = (CONTACT_DESIGN_LAYOUT_SPECS[design] ?? []).filter((spec) => !spec.showWhen || spec.showWhen(contact));
  if (specs.length === 0) return null;

  return (
    <section className="pf-exp-layout-settings" aria-labelledby="contact-layout-settings-title">
      <h3 id="contact-layout-settings-title" className="pf-exp-layout-settings-title">
        Layout settings
      </h3>
      <div key={design} className="pf-exp-layout-settings-body space-y-7">
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
  heroPalette,
  profileAvatarUrl = null,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: (patch: Partial<PortfolioContactSectionSettings>) => void;
  subSection?: ContactSubSection;
  onSubSectionChange?: (value: ContactSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
  /** Account profile photo — shown in General → Photo until a custom one replaces it. */
  profileAvatarUrl?: string | null;
}) {
  const [designCatalogOpen, setDesignCatalogOpen] = useState(false);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ContactSubSection>('general');
  const subSection = normalizeContactSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ContactSubSection) => {
    const next = normalizeContactSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CONTACT_SUB_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setSubSection(section.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              subSection === section.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {subSection === 'general' ? (
        <div className="space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Visibility</p>
            <div className="mt-4">
              <ContactToggleRow label="Contact section" checked={contact.enabled} onChange={(enabled) => onChange({ enabled })} />
              <ContactToggleRow label="Email" checked={contact.showEmail} onChange={(showEmail) => onChange({ showEmail })} />
              <ContactToggleRow label="Phone" checked={contact.showPhone} onChange={(showPhone) => onChange({ showPhone })} />
              <ContactToggleRow label="Location" checked={contact.showLocation} onChange={(showLocation) => onChange({ showLocation })} />
              <ContactToggleRow
                label="Social links"
                checked={contact.showSocialLinks}
                onChange={(showSocialLinks) => onChange({ showSocialLinks })}
              />
              <ContactToggleRow label="CTA button" checked={contact.showCta} onChange={(showCta) => onChange({ showCta })} />
              <ContactToggleRow
                label="Response time in subtitle"
                checked={contact.showResponseTimeInSubtitle}
                onChange={(showResponseTimeInSubtitle) => onChange({ showResponseTimeInSubtitle })}
              />
              <ContactToggleRow
                label="Contact form"
                checked={contact.showContactForm}
                onChange={(showContactForm) => onChange({ showContactForm })}
              />
            </div>
          </div>

          <PortfolioSettingsPhotoField
            photoUrl={contact.photoUrl ?? ''}
            profileAvatarUrl={profileAvatarUrl}
            onChange={(photoUrl) => onChange({ photoUrl })}
          />

          <SectionColorModeControl value={contact.colorModeOverride} onChange={(colorModeOverride) => onChange({ colorModeOverride })} />

          <ContactOptionGrid
            label="Font size"
            options={PORTFOLIO_CONTACT_PREMIUM_FONT_SIZE_OPTIONS}
            value={contact.premiumFontSize ?? 'medium'}
            onChange={(premiumFontSize) => onChange({ premiumFontSize })}
            columns={3}
          />
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          {designCatalogOpen ? (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Section design</p>
                <button
                  type="button"
                  onClick={() => setDesignCatalogOpen(false)}
                  className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                >
                  ← Back
                </button>
              </div>
              <div className="relative mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {PREMIUM_CONTACT_DESIGNS.map((design) => {
                  const option = PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS.find((item) => item.value === design);
                  if (!option) return null;
                  return (
                    <ContactPickerCard
                      key={design}
                      active={contact.cardDesign === design}
                      label={option.label}
                      onClick={() => {
                        onChange({ cardDesign: design });
                        setDesignCatalogOpen(false);
                      }}
                    >
                      <ContactDesignWireframe design={design} />
                    </ContactPickerCard>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <ContactDesignSummaryRow
                design={contact.cardDesign}
                name={
                  PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS.find((item) => item.value === contact.cardDesign)?.label ??
                  'Choose a design'
                }
                onOpen={() => setDesignCatalogOpen(true)}
              />
              <ContactLayoutSettingsBand contact={contact} onChange={onChange} />
            </>
          )}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-4">
          <SectionBackgroundSettingsFields
            settings={contact}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onColorChange }) => (
              <ContactPaletteSwatchPicker
                label={label}
                palette={heroPalette ?? DEFAULT_HERO_PALETTE}
                value={value}
                onChange={onColorChange}
              />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
