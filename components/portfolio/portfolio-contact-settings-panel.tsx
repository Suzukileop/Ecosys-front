'use client';

import { useState, type ReactNode } from 'react';
import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS,
  PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS,
  PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS,
  PORTFOLIO_CONTACT_CARD_PADDING_OPTIONS,
  PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS,
  PORTFOLIO_CONTACT_CHANNEL_CARDS_BORDER_OPTIONS,
  PORTFOLIO_CONTACT_CTA_DESIGN_OPTIONS,
  PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS,
  PORTFOLIO_CONTACT_FORM_DESIGN_OPTIONS,
  PORTFOLIO_CONTACT_FORM_PLACEMENT_OPTIONS,
  PORTFOLIO_CONTACT_FORM_SHADOW_OPTIONS,
  PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY,
  PORTFOLIO_CONTACT_FORM_STACK_GAP_OPTIONS,
  PORTFOLIO_CONTACT_ICON_BORDER_OPTIONS,
  PORTFOLIO_CONTACT_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_CONTACT_ICON_RADIUS_OPTIONS,
  PORTFOLIO_CONTACT_ICON_SIZE_OPTIONS,
  PORTFOLIO_CONTACT_ILLUSTRATION_OPTIONS,
  PORTFOLIO_CONTACT_ILLUSTRATION_PLACEMENT_OPTIONS,
  PORTFOLIO_CONTACT_ITEM_GAP_OPTIONS,
  PORTFOLIO_CONTACT_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_CONTACT_STYLE_TARGET_OPTIONS,
  PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS,
  normalizeContactElementStyles,
  patchContactElementStyle,
  contactSectionLayoutIsAside,
  isContactInquiryPanelDesign,
  isContactDeskDesign,
  isContactInfoPanelDesign,
  isContactChannelCardsDesign,
  isContactSwissEditorialDesign,
  isContactOwnedLayoutDesign,
  migrateContactFormDesignFromCardDesign,
  resolveContactFormDesign,
  DEFAULT_CONTACT_SWISS_COBALT,
  DEFAULT_CONTACT_SWISS_SUBTITLE,
  DEFAULT_CONTACT_SWISS_TITLE,
  type PortfolioContactChannelCardsBorder,
  type PortfolioContactSectionSettings,
  type PortfolioContactStyleTarget,
} from '@/components/portfolio/portfolio-contact-settings';
import { PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS } from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_HERO_PALETTE,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { PortfolioCardFrameSettingsFields } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';

export type ContactSubSection =
  | 'general'
  | 'header'
  | 'frame'
  | 'content'
  | 'form'
  | 'style'
  | 'background';

const CONTACT_SUB_SECTIONS: { id: ContactSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility, card design, icons, and CTA styling.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, layout, fonts, colors, and SVG.' },
  { id: 'style', label: 'Typography', description: 'Colors, fonts, and formatting for card body text.' },
  { id: 'frame', label: 'Card frame', description: 'Border, split background, radius, and inner spacing.' },
  { id: 'content', label: 'Content', description: 'Show or hide contact channels and the CTA.' },
  {
    id: 'form',
    label: 'Formulaire',
    description: 'Message form design, placement, copy, and container chrome.',
  },
  { id: 'background', label: 'Background', description: 'Optional fill behind this section.' },
];

/** Same animated switch as the Stack/Tools settings panels (`.pf-stack-*` classes are generic
 *  settings-UI chrome, not Stack-specific — shared across every section panel now). */
function ContactSwitchTrack({ checked }: { checked: boolean }) {
  return (
    <span
      className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        backgroundColor: checked
          ? 'var(--pf-palette-texte-fort, #171717)'
          : 'color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 22%, var(--pf-palette-fond, #0a0a0a))',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full transition-[left,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: checked ? '1.125rem' : '0.125rem',
          backgroundColor: checked
            ? 'var(--pf-palette-fond, #ffffff)'
            : 'var(--pf-palette-texte-fort, #ffffff)',
        }}
      />
    </span>
  );
}

function ContactToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer flex-col gap-1 text-left"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-neutral-950">{label}</span>
          {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
        </span>
        <ContactSwitchTrack checked={checked} />
      </span>
    </button>
  );
}

/** Compact segmented pill picker — for simple choices (alignment, placement, on/off-style
 *  variants) where a big descriptive card is overkill. Same mechanism as Stack/Tools'
 *  OptionGrid: up to 4 options sit on one row, larger sets wrap to 2 columns. */
function ContactSegmentGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns,
  icons,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
  icons?: Partial<Record<string, ReactNode>>;
}) {
  const count = options.length;
  const cols = columns ?? (count <= 4 ? Math.max(count, 1) : 2);
  const compact = cols === count && count >= 2 && count <= 5;
  return (
    <div>
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-stack-segment grid gap-[3px] p-[3px]"
        data-compact={compact ? 'true' : 'false'}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value;
          const icon = icons?.[String(option.value)];
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              title={option.description}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-stack-segment-btn flex items-center justify-center px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
              style={active ? undefined : { color: '#c4c4c4', WebkitTextFillColor: '#c4c4c4' }}
            >
              {icon ? <span className="pf-stack-segment-icon">{icon}</span> : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Ordered-scale slider — for size/spacing progressions (icon size, gaps, padding, shadow
 *  depth). Same mechanism as Stack/Tools' Slider: one drag surface snapping between steps. */
function ContactSlider<T extends string>({
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
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const lastIndex = options.length - 1;
  const percent = lastIndex > 0 ? (index / lastIndex) * 100 : 0;
  const current = options[index] ?? options[0];
  return (
    <div>
      <div className="pf-stack-slider-row">
        <span className="pf-stack-slider-label">{label}</span>
        <span className="pf-stack-slider-value">{current?.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(lastIndex, 0)}
        step={1}
        value={index}
        onChange={(event) => {
          const next = options[Number(event.target.value)];
          if (next) onChange(next.value);
        }}
        aria-label={label}
        className="pf-stack-slider-input"
        style={{
          background: `linear-gradient(to right, var(--pf-palette-texte-fort, #f5f5f5) ${percent}%, color-mix(in srgb, var(--pf-palette-texte-fort, #ffffff) 16%, var(--pf-palette-fond, #0a0a0a)) ${percent}%)`,
        }}
      />
    </div>
  );
}

/** Visual-difference choice — a compact preview card per option, for genuinely distinct
 *  layout/design choices (Card design, Form design) where a description earns its keep. */
function ContactOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className={`mt-3 grid gap-2 ${columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContactManualColorField({
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
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
        />
      </div>
    </div>
  );
}

/** Curated palette-token swatches for the Background tab — "Fond"/"Neutre"/"Principal"/
 *  "Texte muted", same set Stack/Tools use for section fills. Contact has no per-section
 *  palette-binding record of its own (unlike Stack/Tools' toolsPalette), so this resolves
 *  directly against the site's default Global palette rather than a stored snapshot —
 *  still palette-driven, just without the binding indirection Stack/Tools use. */
const CONTACT_BACKGROUND_PALETTE_TOKENS: { value: HeroPaletteTokenId; label: string }[] = [
  { value: 'fond', label: 'Fond' },
  { value: 'neutre', label: 'Neutre' },
  { value: 'principal', label: 'Principal' },
  { value: 'texteMuted', label: 'Texte muted' },
];

function ContactBackgroundColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const activeHex = value.trim().toLowerCase();
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        {CONTACT_BACKGROUND_PALETTE_TOKENS.map((token) => {
          const hex = resolveHeroPaletteColor(DEFAULT_HERO_PALETTE, token.value);
          const active = activeHex === hex.toLowerCase();
          return (
            <button
              key={token.value}
              type="button"
              title={token.label}
              aria-label={token.label}
              aria-pressed={active}
              onClick={() => onChange(hex)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className="h-8 w-8 rounded-full border-2 transition"
                style={{
                  backgroundColor: hex,
                  borderColor: active ? '#171717' : '#e5e5e5',
                  boxShadow: active ? '0 0 0 2px rgba(23,23,23,0.15)' : 'none',
                }}
              />
              <span className={`text-[11px] font-medium ${active ? 'text-neutral-900' : 'text-neutral-500'}`}>
                {token.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContactAlignLeftIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="0" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function ContactAlignCenterIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="1.5" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

function ContactAlignRightIcon() {
  return (
    <svg viewBox="0 0 16 12" width="14" height="11" fill="none" aria-hidden>
      <rect x="0" y="0" width="16" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="6" y="5.2" width="10" height="1.6" rx="0.8" fill="currentColor" />
      <rect x="3" y="10.4" width="13" height="1.6" rx="0.8" fill="currentColor" />
    </svg>
  );
}

const CONTACT_ALIGNMENT_ICONS: Partial<Record<string, ReactNode>> = {
  left: <ContactAlignLeftIcon />,
  center: <ContactAlignCenterIcon />,
  right: <ContactAlignRightIcon />,
};

/** Titled bordered band grouping related controls — same `.pf-stack-layout-settings*`
 *  chrome Stack/Tools use for their Design-tab and Content-visibility groupings. */
function ContactSettingsBand({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="pf-stack-layout-settings" aria-labelledby="contact-settings-band-title">
      <h3 id="contact-settings-band-title" className="pf-stack-layout-settings-title">
        {title}
      </h3>
      <div className="pf-stack-layout-settings-body space-y-6">{children}</div>
    </section>
  );
}

export function ContactSettingsPanel({
  contact,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: (patch: Partial<PortfolioContactSectionSettings>) => void;
  subSection?: ContactSubSection;
  onSubSectionChange?: (value: ContactSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ContactSubSection>('header');
  const [styleTarget, setStyleTarget] = useState<PortfolioContactStyleTarget>('channelValue');
  const subSection = controlledSubSection ?? uncontrolledSubSection;
  const formDesign = resolveContactFormDesign(contact);
  const setSubSection = (value: ContactSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  const elementStyles = normalizeContactElementStyles(contact.elementStyles);

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
        <div className="space-y-6">
          <ContactToggleRow
            label="Show section"
            description="Display the contact block on your public portfolio."
            checked={contact.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionColorModeControl
            value={contact.colorModeOverride}
            onChange={(colorModeOverride) => onChange({ colorModeOverride })}
          />
          <ContactOptionGrid
            label="Card design"
            options={PORTFOLIO_CONTACT_CARD_DESIGN_OPTIONS}
            value={contact.cardDesign}
            onChange={(cardDesign) =>
              onChange(
                isContactDeskDesign(cardDesign) || isContactInfoPanelDesign(cardDesign)
                  ? {
                      cardDesign,
                      showContactForm: true,
                      formDesign: migrateContactFormDesignFromCardDesign(cardDesign),
                      showLocation: true,
                      showPhone: true,
                      showEmail: true,
                      headerAlignment: 'center',
                      cardMaxWidth:
                        contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth,
                      ...(isContactInfoPanelDesign(cardDesign)
                        ? {
                            cardBackgroundEnabled: true,
                            cardBorder: contact.cardBorder === 'none' ? 'soft' : contact.cardBorder,
                          }
                        : {}),
                    }
                  : isContactChannelCardsDesign(cardDesign)
                    ? {
                        cardDesign,
                        headerAlignment: 'center',
                        iconRadius: 'full',
                        iconPlacement: 'top',
                        showPhone: true,
                        showEmail: true,
                        showLocation: true,
                        showContactForm: false,
                        channelCardsBackgroundEnabled: true,
                        channelCardsBorder: 'thin',
                        cardMaxWidth:
                          contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth,
                      }
                    : cardDesign === 'editorial'
                      ? {
                          cardDesign,
                          showContactForm: true,
                          contactFormPlacement: 'side',
                          iconPlacement: 'left',
                          formDesign: 'inquiry-panel',
                          headerAlignment: 'left',
                          sectionLayout: 'stacked',
                        }
                      : cardDesign === 'directory'
                        ? {
                            cardDesign,
                            headerAlignment: 'center',
                            iconPlacement: 'left',
                            iconRadius: 'full',
                            iconBorder: 'soft',
                            iconUseBrandColors: true,
                            iconSize: 'xl',
                            showEmail: false,
                            showPhone: false,
                            showLocation: false,
                            showSocialLinks: true,
                            showContactForm: true,
                            contactFormPlacement: 'side',
                            formDesign: 'minimal-underline',
                            sectionLayout: 'stacked',
                            cardMaxWidth:
                              contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth,
                          }
                        : cardDesign === 'tiles'
                          ? {
                              cardDesign,
                              showContactForm: true,
                              contactFormPlacement: 'side',
                              formDesign: 'stepped-inquiry',
                              cardBackgroundEnabled: false,
                              cardBorder: 'none',
                              iconPlacement: 'top',
                              showEmail: true,
                              showPhone: true,
                              showLocation: true,
                              showSocialLinks: true,
                              cardMaxWidth:
                                contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth,
                            }
                          : isContactSwissEditorialDesign(cardDesign)
                            ? {
                                cardDesign,
                                showContactForm: true,
                                formDesign: 'swiss-editorial',
                                titlePreset: 'custom' as const,
                                titleCustom: DEFAULT_CONTACT_SWISS_TITLE,
                                title: DEFAULT_CONTACT_SWISS_TITLE,
                                subtitlePreset: 'custom' as const,
                                subtitleCustom: DEFAULT_CONTACT_SWISS_SUBTITLE,
                                headerAlignment: 'left' as const,
                                showEmail: true,
                                showPhone: true,
                                showLocation: true,
                                showSocialLinks: true,
                                showCta: false,
                                ctaColor: DEFAULT_CONTACT_SWISS_COBALT,
                                cardBackgroundEnabled: false,
                                cardBorder: 'soft' as const,
                                cardMaxWidth: 'xl' as const,
                              }
                    : isContactOwnedLayoutDesign(cardDesign)
                    ? {
                        cardDesign,
                        showContactForm: true,
                        formDesign: migrateContactFormDesignFromCardDesign(cardDesign),
                      }
                    : { cardDesign }
              )
            }
            columns={2}
          />
          {isContactInquiryPanelDesign(contact.cardDesign) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Inquiry panel — textes gauche</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Uniquement pour Inquiry panel. Ces deux phrases remplacent le titre / sous-titre
                  section dans ce layout.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Titre (gauche)
                </p>
                <textarea
                  rows={2}
                  value={contact.inquiryHeadline ?? ''}
                  onChange={(event) => onChange({ inquiryHeadline: event.target.value })}
                  placeholder="Start your project today!"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Sous-texte (gauche)
                </p>
                <textarea
                  rows={3}
                  value={contact.inquirySupporting ?? ''}
                  onChange={(event) => onChange({ inquirySupporting: event.target.value })}
                  placeholder="Share a short brief about your goals…"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          ) : null}
          {isContactDeskDesign(contact.cardDesign) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Contact desk — layout</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Width and placement for the desk section. Topic chips live under Formulaire when
                  the Desk form design is selected.
                </p>
              </div>
              <ContactSlider
                label="Desk width"
                options={PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS}
                value={contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth}
                onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
              />
              <ContactSegmentGrid
                label="Placement (large screens)"
                options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
                value={contact.cardPlacement}
                icons={CONTACT_ALIGNMENT_ICONS}
                onChange={(cardPlacement) => onChange({ cardPlacement })}
              />
            </div>
          ) : null}
          {isContactInfoPanelDesign(contact.cardDesign) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Info panel — textes gauche</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Titre + paragraphe à gauche. Le bloc formulaire suit la couleur CTA / palette.
                  Fond et bordure du cadre : onglet Card frame. Fond de section : onglet Background.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Titre (gauche)
                </p>
                <textarea
                  rows={2}
                  value={contact.infoPanelHeadline ?? ''}
                  onChange={(event) => onChange({ infoPanelHeadline: event.target.value })}
                  placeholder="Contact Information"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Sous-texte (gauche)
                </p>
                <textarea
                  rows={3}
                  value={contact.infoPanelSupporting ?? ''}
                  onChange={(event) => onChange({ infoPanelSupporting: event.target.value })}
                  placeholder="Reach out with a short brief…"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                />
              </div>
              <ContactSlider
                label="Panel width"
                options={PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS}
                value={contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth}
                onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
              />
              <ContactSegmentGrid
                label="Placement (large screens)"
                options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
                value={contact.cardPlacement}
                icons={CONTACT_ALIGNMENT_ICONS}
                onChange={(cardPlacement) => onChange({ cardPlacement })}
              />
            </div>
          ) : null}
          {contact.cardDesign === 'inquiry' ? (
            <p className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-3 text-sm text-neutral-600">
              Inquiry split : titre / sous-titre + illustration à gauche, formulaire carte à droite.
              Le formulaire est activé automatiquement.
            </p>
          ) : null}
          {isContactInquiryPanelDesign(contact.cardDesign) ? (
            <p className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-3 text-sm text-neutral-600">
              Inquiry panel : headline + canaux à gauche, formulaire (nom / email / message) avec
              cadre accent à droite. Le formulaire est activé automatiquement.
            </p>
          ) : null}
          {isContactDeskDesign(contact.cardDesign) ? (
            <p className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-3 text-sm text-neutral-600">
              Contact desk : cartes Location / Phone / Email en haut, formulaire 2 colonnes + chips
              Option en bas. Active Location / Phone / Email dans Contenu pour remplir les cartes.
            </p>
          ) : null}
          {isContactInfoPanelDesign(contact.cardDesign) ? (
            <p className="rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-3 text-sm text-neutral-600">
              Info panel : infos à gauche, formulaire sur carte accent (CTA / Hero palette). Cadre
              extérieur via Card frame ; fond de section via Background.
            </p>
          ) : null}
          {isContactChannelCardsDesign(contact.cardDesign) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Fond & bordure</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Uniquement pour Contact cards : fond et trait des tuiles Phone / Email / Address.
                </p>
              </div>
              <ContactToggleRow
                label="Fond de la carte"
                description="Remplit les trois tuiles. Désactivé = fond de section visible."
                checked={contact.channelCardsBackgroundEnabled !== false}
                onChange={(channelCardsBackgroundEnabled) =>
                  onChange({ channelCardsBackgroundEnabled })
                }
              />
              {contact.channelCardsBackgroundEnabled !== false ? (
                <ContactManualColorField
                  label="Couleur du fond"
                  value={contact.channelCardsBackgroundColor || contact.cardBackgroundColor}
                  onChange={(channelCardsBackgroundColor) =>
                    onChange({ channelCardsBackgroundColor })
                  }
                />
              ) : null}
              <ContactSegmentGrid
                label="Bordure"
                options={PORTFOLIO_CONTACT_CHANNEL_CARDS_BORDER_OPTIONS.map((option) => ({
                  value: option.value as PortfolioContactChannelCardsBorder,
                  label: option.label,
                }))}
                value={contact.channelCardsBorder ?? 'thin'}
                onChange={(channelCardsBorder) => onChange({ channelCardsBorder })}
              />
              {(contact.channelCardsBorder ?? 'thin') !== 'none' ? (
                <ContactManualColorField
                  label="Couleur de bordure"
                  value={contact.channelCardsBorderColor || contact.cardBorderColor}
                  onChange={(channelCardsBorderColor) => onChange({ channelCardsBorderColor })}
                />
              ) : null}
            </div>
          ) : null}
          <ContactSegmentGrid
            label="Icon placement"
            options={PORTFOLIO_CONTACT_ICON_PLACEMENT_OPTIONS}
            value={contact.iconPlacement ?? 'left'}
            onChange={(iconPlacement) => onChange({ iconPlacement })}
          />

          <ContactSettingsBand title="Link / contact icons">
            <ContactToggleRow
              label="Icon background"
              description="Turn off to show glyphs only (no circular fill)."
              checked={contact.iconBackgroundEnabled !== false}
              onChange={(iconBackgroundEnabled) => onChange({ iconBackgroundEnabled })}
            />
            <ContactSlider
              label="Icon size"
              options={PORTFOLIO_CONTACT_ICON_SIZE_OPTIONS}
              value={contact.iconSize ?? 'md'}
              onChange={(iconSize) => onChange({ iconSize })}
            />
            <ContactSlider
              label="Icon corners"
              options={PORTFOLIO_CONTACT_ICON_RADIUS_OPTIONS}
              value={contact.iconRadius ?? 'lg'}
              onChange={(iconRadius) => onChange({ iconRadius })}
            />
            <ContactSegmentGrid
              label="Icon border"
              options={PORTFOLIO_CONTACT_ICON_BORDER_OPTIONS}
              value={contact.iconBorder ?? 'none'}
              onChange={(iconBorder) => onChange({ iconBorder })}
            />
            {(contact.iconBorder ?? 'none') !== 'none' ? (
              <ContactManualColorField
                label="Icon border color"
                value={contact.iconBorderColor || contact.cardBorderColor}
                onChange={(iconBorderColor) => onChange({ iconBorderColor })}
              />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {contact.iconBackgroundEnabled !== false ? (
                <div>
                  <ContactManualColorField
                    label="Icon background"
                    value={contact.iconBackgroundColor || '#fff7ed'}
                    onChange={(iconBackgroundColor) => onChange({ iconBackgroundColor })}
                  />
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
                    onClick={() => onChange({ iconBackgroundColor: '' })}
                  >
                    Reset to soft accent
                  </button>
                </div>
              ) : null}
              <div>
                <ContactManualColorField
                  label="Icon color"
                  value={contact.iconColor || contact.ctaColor}
                  onChange={(iconColor) => onChange({ iconColor })}
                />
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
                  onClick={() => onChange({ iconColor: '' })}
                >
                  Reset to CTA accent
                </button>
              </div>
            </div>
            <ContactToggleRow
              label="Brand colors for social"
              description="Keep Instagram, GitHub, etc. in their platform colors. Off = same chrome as email/phone."
              checked={contact.iconUseBrandColors !== false}
              onChange={(iconUseBrandColors) => onChange({ iconUseBrandColors })}
            />
          </ContactSettingsBand>

          <ContactSlider
            label="Item spacing"
            options={PORTFOLIO_CONTACT_ITEM_GAP_OPTIONS}
            value={contact.itemGap ?? 'md'}
            onChange={(itemGap) => onChange({ itemGap })}
          />
          <ContactSlider
            label="Card padding (list + form)"
            options={PORTFOLIO_CONTACT_CARD_PADDING_OPTIONS}
            value={contact.cardPadding ?? 'md'}
            onChange={(cardPadding) => onChange({ cardPadding })}
          />
          <ContactSegmentGrid
            label="Block order"
            options={PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS}
            value={contact.blockOrder}
            onChange={(blockOrder) => onChange({ blockOrder })}
          />
          <ContactSlider
            label="Card max width"
            options={PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS}
            value={contact.cardMaxWidth}
            onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
          />
          <ContactSegmentGrid
            label="Card placement"
            options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
            value={contact.cardPlacement}
            icons={CONTACT_ALIGNMENT_ICONS}
            onChange={(cardPlacement) => onChange({ cardPlacement })}
          />
          <ContactOptionGrid
            label="CTA design"
            options={PORTFOLIO_CONTACT_CTA_DESIGN_OPTIONS}
            value={contact.ctaDesign}
            onChange={(ctaDesign) => onChange({ ctaDesign })}
            columns={2}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">CTA label</p>
            <input
              type="text"
              value={contact.ctaLabel}
              onChange={(event) => onChange({ ctaLabel: event.target.value })}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <ContactManualColorField
            label="CTA color"
            value={contact.ctaColor}
            onChange={(ctaColor) => onChange({ ctaColor })}
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <ContactOptionGrid
            label="Disposition titre / contenu"
            options={PORTFOLIO_CONTACT_SECTION_LAYOUT_OPTIONS}
            value={contact.sectionLayout ?? 'stacked'}
            onChange={(sectionLayout) => onChange({ sectionLayout })}
            columns={2}
          />
          {isContactOwnedLayoutDesign(contact.cardDesign) ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Les mises en page Inquiry, Inquiry panel, Desk et Info panel gèrent déjà leur propre
              composition (colonnes, illustration intégrée). Elles peuvent conserver un comportement
              empilé pour le titre de section, indépendamment de ce réglage.
            </p>
          ) : contactSectionLayoutIsAside(contact.sectionLayout) ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              En côte à côte, le titre et le contenu contact s’affichent en deux colonnes sur grand
              écran (empilés sur mobile).
            </p>
          ) : null}

          <ContactSegmentGrid
            label="Title preset"
            options={PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS}
            value={contact.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
          />
          {contact.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={contact.titleCustom || contact.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <ContactSegmentGrid
            label="Subtitle preset"
            options={PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS}
            value={contact.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
          />
          {contact.subtitlePreset === 'custom' || contact.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={
                  contact.subtitlePreset === 'custom' ? contact.subtitleCustom || contact.subtitle : contact.subtitle
                }
                onChange={(event) =>
                  onChange(
                    contact.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactManualColorField
              label="Title color"
              value={contact.titleColor}
              onChange={(titleColor) => onChange({ titleColor })}
            />
            <ContactManualColorField
              label="Subtitle color"
              value={contact.subtitleColor}
              onChange={(subtitleColor) => onChange({ subtitleColor })}
            />
          </div>

          {contactSectionLayoutIsAside(contact.sectionLayout) ? (
            <p className="text-sm text-neutral-500">
              Alignement du texte du titre : le titre est déjà placé{' '}
              {contact.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} du contenu.
            </p>
          ) : (
            <ContactSegmentGrid
              label="Header alignment"
              options={[
                { value: 'left' as const, label: 'Left' },
                { value: 'center' as const, label: 'Center' },
              ]}
              icons={CONTACT_ALIGNMENT_ICONS}
              value={contact.headerAlignment}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
            />
          )}

          <ContactSettingsBand title="Illustration SVG">
            <p className="text-sm text-neutral-500">
              SVG décoratif à côté du contenu. Choisissez un style, puis placez-le à gauche ou à
              droite sur grand écran. Les layouts Inquiry / Desk / Info panel peuvent ignorer ce
              réglage au profit de leur illustration intégrée.
            </p>
            <ContactOptionGrid
              label="Style SVG"
              options={PORTFOLIO_CONTACT_ILLUSTRATION_OPTIONS}
              value={contact.illustrationVariant ?? 'none'}
              onChange={(illustrationVariant) => onChange({ illustrationVariant })}
              columns={2}
            />
            {(contact.illustrationVariant ?? 'none') !== 'none' ? (
              <ContactSegmentGrid
                label="Placement SVG"
                options={PORTFOLIO_CONTACT_ILLUSTRATION_PLACEMENT_OPTIONS}
                value={contact.illustrationPlacement ?? 'right'}
                icons={CONTACT_ALIGNMENT_ICONS}
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
              />
            ) : null}
          </ContactSettingsBand>
        </div>
      ) : null}

      {subSection === 'style' ? (
        <PortfolioElementStyleFields
          targets={PORTFOLIO_CONTACT_STYLE_TARGET_OPTIONS}
          activeTarget={styleTarget}
          onTargetChange={(value) => setStyleTarget(value as PortfolioContactStyleTarget)}
          style={elementStyles[styleTarget]}
          onStyleChange={(patch) =>
            onChange({ elementStyles: patchContactElementStyle(elementStyles, styleTarget, patch) })
          }
          showDarkColor={contact.useHeroPalette === false}
          extra={
            styleTarget === 'ctaLabel' ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                The <span className="font-semibold text-neutral-700">General</span> tab still controls CTA shape and
                accent fill color. This panel drives the button label typography.
              </p>
            ) : null
          }
        />
      ) : null}

      {subSection === 'frame' ? (
        <PortfolioCardFrameSettingsFields
          settings={contact}
          onChange={onChange}
          heading="Contact card frame"
          description="Border, background, radius and padding for the contact list. Form container border and shadow are under Formulaire."
        />
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-4">
          <ContactSettingsBand title="Content visibility">
            <ContactToggleRow
              label="Email"
              description="Show email address channel."
              checked={contact.showEmail}
              onChange={(showEmail) => onChange({ showEmail })}
            />
            <ContactToggleRow
              label="Phone"
              description="Show phone number channel."
              checked={contact.showPhone}
              onChange={(showPhone) => onChange({ showPhone })}
            />
            <ContactToggleRow
              label="Location"
              description="Show city or region."
              checked={contact.showLocation}
              onChange={(showLocation) => onChange({ showLocation })}
            />
            <ContactToggleRow
              label="Social links"
              description="Instagram, LinkedIn, and other profiles."
              checked={contact.showSocialLinks}
              onChange={(showSocialLinks) => onChange({ showSocialLinks })}
            />
            <ContactToggleRow
              label="CTA button"
              description="Primary action button below channels."
              checked={contact.showCta}
              onChange={(showCta) => onChange({ showCta })}
            />
            <ContactToggleRow
              label="Response time in subtitle"
              description="Include typical reply speed when using the response-time preset."
              checked={contact.showResponseTimeInSubtitle}
              onChange={(showResponseTimeInSubtitle) => onChange({ showResponseTimeInSubtitle })}
            />
          </ContactSettingsBand>

          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Contact details are edited in Creator Studio → Information. Message form controls live
            under <span className="font-semibold text-neutral-700">Formulaire</span>.
          </p>
        </div>
      ) : null}

      {subSection === 'form' ? (
        <div className="space-y-4">
          <ContactToggleRow
            label="Contact form"
            description={
              isContactOwnedLayoutDesign(contact.cardDesign)
                ? 'Required for this layout — always on.'
                : 'Show a send-message form beside or stacked under your contact info.'
            }
            checked={isContactOwnedLayoutDesign(contact.cardDesign) ? true : contact.showContactForm}
            onChange={(showContactForm) => {
              if (isContactOwnedLayoutDesign(contact.cardDesign)) return;
              onChange({ showContactForm });
            }}
          />
          {contact.showContactForm || isContactOwnedLayoutDesign(contact.cardDesign) ? (
            <>
              <ContactOptionGrid
                label="Form design"
                options={PORTFOLIO_CONTACT_FORM_DESIGN_OPTIONS}
                value={formDesign}
                onChange={(formDesign) => onChange({ formDesign })}
                columns={2}
              />

              {!isContactOwnedLayoutDesign(contact.cardDesign) ? (
                <>
                  <ContactSegmentGrid
                    label="Form layout"
                    options={PORTFOLIO_CONTACT_FORM_PLACEMENT_OPTIONS}
                    value={contact.contactFormPlacement ?? 'below'}
                    onChange={(contactFormPlacement) => onChange({ contactFormPlacement })}
                  />
                  {(contact.contactFormPlacement ?? 'below') === 'below' ? (
                    <ContactSlider
                      label="Space between list and form"
                      options={PORTFOLIO_CONTACT_FORM_STACK_GAP_OPTIONS}
                      value={contact.formStackGap ?? 'lg'}
                      onChange={(formStackGap) => onChange({ formStackGap })}
                    />
                  ) : null}
                </>
              ) : null}

              <ContactSlider
                label="Card padding (list + form)"
                options={PORTFOLIO_CONTACT_CARD_PADDING_OPTIONS}
                value={contact.cardPadding ?? 'md'}
                onChange={(cardPadding) => onChange({ cardPadding })}
              />

              <ContactSettingsBand title="Form container">
                <p className="text-sm text-neutral-500">
                  Outer fill, border and drop shadow around the message form — all nine form
                  designs.
                </p>

                <ContactToggleRow
                  label="Form background"
                  description="Fill the form frame. Off keeps the same color as the section background."
                  checked={contact.formBackgroundEnabled === true}
                  onChange={(formBackgroundEnabled) =>
                    onChange({
                      formBackgroundEnabled,
                      formBackgroundColor:
                        contact.formBackgroundColor ||
                        contact.cardBackgroundColor ||
                        '#f5f5f5',
                    })
                  }
                />
                {contact.formBackgroundEnabled ? (
                  <ContactManualColorField
                    label="Form background color"
                    value={contact.formBackgroundColor || contact.cardBackgroundColor || '#f5f5f5'}
                    onChange={(formBackgroundColor) => onChange({ formBackgroundColor })}
                  />
                ) : null}

                <ContactSegmentGrid
                  label="Form border"
                  options={PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS}
                  value={contact.formBorder ?? 'soft'}
                  onChange={(formBorder) => onChange({ formBorder })}
                />

                {contact.formBorder === 'soft' || contact.formBorder === 'solid' ? (
                  <ContactManualColorField
                    label="Form border color"
                    value={contact.formBorderColor || contact.cardBorderColor}
                    onChange={(formBorderColor) => onChange({ formBorderColor })}
                  />
                ) : null}

                <ContactSlider
                  label="Form shadow"
                  options={PORTFOLIO_CONTACT_FORM_SHADOW_OPTIONS}
                  value={contact.formShadow ?? 'float'}
                  onChange={(formShadow) =>
                    onChange({
                      formShadow,
                      formShadowIntensity:
                        PORTFOLIO_CONTACT_FORM_SHADOW_PRESET_INTENSITY[formShadow],
                    })
                  }
                />

                {(contact.formShadow ?? 'float') !== 'none' ? (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Shadow intensity
                      </p>
                      <span className="text-sm font-semibold text-neutral-700">
                        {contact.formShadowIntensity ?? 55}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={contact.formShadowIntensity ?? 55}
                      onChange={(event) =>
                        onChange({ formShadowIntensity: Number(event.target.value) })
                      }
                      className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                      aria-label="Form shadow intensity"
                    />
                  </div>
                ) : null}
              </ContactSettingsBand>

              {formDesign === 'project-brief' ||
              formDesign === 'workspace-chat' ||
              formDesign === 'minimal-underline' ||
              formDesign === 'classic' ||
              formDesign === 'stepped-inquiry' ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Form title
                  </p>
                  <input
                    type="text"
                    value={contact.contactFormTitle}
                    onChange={(event) => onChange({ contactFormTitle: event.target.value })}
                    placeholder={
                      formDesign === 'project-brief'
                        ? 'Start a project'
                        : formDesign === 'workspace-chat'
                          ? "Let's connect"
                          : 'Send a message'
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                </div>
              ) : null}

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Submit label
                </p>
                <input
                  type="text"
                  value={contact.contactFormSubmitLabel}
                  onChange={(event) => onChange({ contactFormSubmitLabel: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  placeholder={
                    formDesign === 'inquiry'
                      ? 'Submit'
                      : formDesign === 'workspace-chat'
                        ? 'Send Message'
                        : 'Send message'
                  }
                />
              </div>

              {formDesign === 'stepped-inquiry' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Step inquiry walks visitors through name, email, subject, then message — with
                  Back / Next, keyboard support, and a final submit on the last step.
                </p>
              ) : null}

              {formDesign === 'workspace-chat' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Workspace chat includes an on-form Message / Quote Request toggle. Quote mode
                  prefixes the subject and adapts labels — the API payload stays the same.
                </p>
              ) : null}

              {formDesign === 'project-brief' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Project brief shows your visible email, phone, and location in a footer strip
                  under the form (from Content toggles + Creator Studio → Information).
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields
          settings={contact}
          onChange={onChange}
          renderColorField={({ label, value, onChange: setColor }) => (
            <ContactBackgroundColorField label={label} value={value} onChange={setColor} />
          )}
        />
      ) : null}
    </div>
  );
}
