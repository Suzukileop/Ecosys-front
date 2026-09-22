'use client';

import { useState, type ReactNode } from 'react';
import type {
  PortfolioContactCardDesign,
  PortfolioContactSectionSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import { PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS } from '@/components/portfolio/portfolio-contact-settings';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import {
  DEFAULT_HERO_PALETTE,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type ContactSubSection = 'general' | 'design' | 'background' | 'header';

const CONTACT_SUB_SECTIONS: { id: ContactSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility and defaults.' },
  { id: 'design', label: 'Design', description: 'Layout and visual style.' },
  { id: 'background', label: 'Background', description: 'Fill behind this section.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
];

/** Map legacy subsection ids (saved UI state / search) onto the current Contact menu. */
export function normalizeContactSubSection(value: string | undefined): ContactSubSection {
  if (value === 'general' || value === 'design' || value === 'background' || value === 'header') {
    return value;
  }
  return 'general';
}

function ContactSubSectionPlaceholder({ description }: { description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/60 px-4 py-10 text-center">
      <p className="text-sm font-semibold text-neutral-700">Coming soon</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
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
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-200/80 py-3.5 last:border-b-0">
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

/** The 11 new premium, full-bleed designs — shown first in the Design tab. The other 9
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
  'brutalist-overlap',
  'split-manifesto',
  'magnetic-overlap',
];

/** Mini wireframe canvas — shared settings-UI chrome (`.pf-stack-*` classes are generic,
 *  not Stack-specific — reused across every section panel with this picker mechanism). */
function ContactMiniSlide({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 120 72" className="pf-stack-mini h-[4.35rem] w-full" aria-hidden>
      <rect className="pf-stack-mini-stage" x="1.25" y="1.25" width="117.5" height="69.5" rx="9" />
      {children}
    </svg>
  );
}

function ContactPickerCard({
  active,
  label,
  description,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="pf-stack-design-card rounded-2xl px-3 pb-3 pt-2.5 text-left"
    >
      {active ? (
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--pf-palette-principal, #f97316)' }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-2.5 w-2.5">
            <path d="M4 10.5l3.5 3.5L16 6" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
      {children}
      <span className="mt-2.5 block">
        <span className="pf-stack-card-label block text-sm font-semibold leading-none tracking-tight">{label}</span>
        <span className="mt-1.5 block text-xs leading-relaxed text-neutral-500">{description}</span>
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
    case 'brutalist-overlap':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-mute" x="10" y="8" width="36" height="8" rx="2" opacity={0.35} />
          <rect className="pf-stack-mini-ink" x="10" y="20" width="30" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="44" y="18" width="10" height="12" rx="1" />
          <rect className="pf-stack-mini-ink" x="10" y="42" width="44" height="6" rx="1" />
          <rect className="pf-stack-mini-mute" x="10" y="50" width="44" height="1.5" />
          <rect className="pf-stack-mini-mute" x="86" y="46" width="24" height="2" rx="1" opacity={0.6} />
        </ContactMiniSlide>
      );
    case 'split-manifesto':
      return (
        <ContactMiniSlide>
          <rect className="pf-stack-mini-mute" x="1.25" y="1.25" width="52" height="69.5" rx="1" />
          <rect className="pf-stack-mini-ink" x="64" y="10" width="46" height="8" rx="2" />
          <rect className="pf-stack-mini-mute" x="64" y="30" width="18" height="14" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="88" y="30" width="18" height="14" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="64" y="50" width="18" height="14" rx="1" opacity={0.5} />
          <rect className="pf-stack-mini-mute" x="88" y="50" width="18" height="14" rx="1" opacity={0.5} />
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

function ContactTextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          rows={2}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
        />
      )}
    </label>
  );
}

export function ContactSettingsPanel({
  contact,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  heroPalette,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: (patch: Partial<PortfolioContactSectionSettings>) => void;
  subSection?: ContactSubSection;
  onSubSectionChange?: (value: ContactSubSection) => void;
  heroPalette?: PortfolioHeroPalette;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ContactSubSection>('general');
  const subSection = normalizeContactSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ContactSubSection) => {
    const next = normalizeContactSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta = CONTACT_SUB_SECTIONS.find((section) => section.id === subSection) ?? CONTACT_SUB_SECTIONS[0];

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

          <SectionColorModeControl value={contact.colorModeOverride} onChange={(colorModeOverride) => onChange({ colorModeOverride })} />
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Design</p>
            <div className="relative mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PREMIUM_CONTACT_DESIGNS.map((design) => {
                const option = PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS.find((item) => item.value === design);
                if (!option) return null;
                return (
                  <ContactPickerCard
                    key={design}
                    active={contact.cardDesign === design}
                    label={option.label}
                    description={option.description}
                    onClick={() => onChange({ cardDesign: design })}
                  >
                    <ContactDesignWireframe design={design} />
                  </ContactPickerCard>
                );
              })}
            </div>
          </div>

          {contact.cardDesign === 'editorial-focus' ? (
            <ContactTextField
              label="Headline"
              value={contact.editorialFocusHeadline}
              onChange={(editorialFocusHeadline) => onChange({ editorialFocusHeadline })}
              placeholder={"Let's build /\nSomething"}
              multiline
            />
          ) : null}

          {contact.cardDesign === 'liquid-distortion' ? (
            <ContactTextField
              label="Background watermark word"
              value={contact.liquidDistortionWatermark}
              onChange={(liquidDistortionWatermark) => onChange({ liquidDistortionWatermark })}
              placeholder="CONNECT"
            />
          ) : null}

          {contact.cardDesign === 'split-grid' ? (
            <ContactTextField
              label="Marquee phrase"
              value={contact.premiumMarqueeText}
              onChange={(premiumMarqueeText) => onChange({ premiumMarqueeText })}
              placeholder="Let's talk — Say hello — Reach out — "
            />
          ) : null}

          {contact.cardDesign === 'sequential-reveal' ? (
            <ContactTextField
              label="Slogan"
              value={contact.sequentialRevealTagline}
              onChange={(sequentialRevealTagline) => onChange({ sequentialRevealTagline })}
              placeholder="Share your idea, let's build something meaningful together."
              multiline
            />
          ) : null}

          {contact.cardDesign === 'studio-overlap' ? (
            <ContactTextField
              label="Image badge label"
              value={contact.studioOverlapBadgeLabel}
              onChange={(studioOverlapBadgeLabel) => onChange({ studioOverlapBadgeLabel })}
              placeholder="The Studio"
            />
          ) : null}

          {contact.cardDesign === 'borderless-grid' ? (
            <ContactTextField
              label="Second headline line"
              value={contact.borderlessGridSubline}
              onChange={(borderlessGridSubline) => onChange({ borderlessGridSubline })}
              placeholder="Start a conversation."
            />
          ) : null}

          {contact.cardDesign === 'split-manifesto' ? (
            <ContactTextField
              label="Manifesto line"
              value={contact.splitManifestoTagline}
              onChange={(splitManifestoTagline) => onChange({ splitManifestoTagline })}
              placeholder="We craft digital work that moves people…"
              multiline
            />
          ) : null}

          {contact.cardDesign === 'magnetic-overlap' ? (
            <ContactTextField
              label="Eyebrow"
              value={contact.magneticOverlapEyebrow}
              onChange={(magneticOverlapEyebrow) => onChange({ magneticOverlapEyebrow })}
              placeholder="Say hey"
            />
          ) : null}
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

      {subSection === 'header' ? <ContactSubSectionPlaceholder description={activeMeta.description} /> : null}
    </div>
  );
}
