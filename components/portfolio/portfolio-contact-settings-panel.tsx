'use client';

import { useState } from 'react';
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
  PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS,
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
  isContactOwnedLayoutDesign,
  migrateContactFormDesignFromCardDesign,
  resolveContactFormDesign,
  type PortfolioContactChannelCardsBorder,
  type PortfolioContactSectionSettings,
  type PortfolioContactStyleTarget,
} from '@/components/portfolio/portfolio-contact-settings';
import { PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS } from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_CONTACT_COLOR_BINDINGS,
  mergeContactColorBindings,
  patchContactColorBinding,
  type ContactColorSlot,
} from '@/components/portfolio/portfolio-contact-palette-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { PortfolioCardFrameSettingsFields } from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-neutral-950">{label}</span>
        {description ? <span className="mt-1 block text-sm text-neutral-500">{description}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
      />
    </label>
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

/** Hex picker when palette is off; Global token select when palette is on. */
function ContactColorField({
  contact,
  onChange,
  slot,
  label,
  value,
}: {
  contact: PortfolioContactSectionSettings;
  onChange: (patch: Partial<PortfolioContactSectionSettings>) => void;
  slot: ContactColorSlot;
  label: string;
  value: string;
}) {
  if (contact.useHeroPalette === false) {
    return (
      <ContactManualColorField
        label={label}
        value={value}
        onChange={(hex) => {
          if (slot === 'iconColor') onChange({ iconColor: hex });
          else if (slot === 'iconBorder') onChange({ iconBorderColor: hex });
          else if (slot === 'iconBackground') onChange({ iconBackgroundColor: hex });
          else if (slot === 'cta') onChange({ ctaColor: hex });
        }}
      />
    );
  }

  const bindings = mergeContactColorBindings(
    DEFAULT_CONTACT_COLOR_BINDINGS,
    contact.contactColorBindings
  );
  const token = bindings[slot];
  const swatch = isValidProfileHexColor(value) ? value : '#ea580c';

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: swatch }}
          title={swatch}
          aria-hidden
        />
      </div>
      <select
        value={token}
        onChange={(event) => {
          const nextToken = event.target.value as HeroPaletteTokenId;
          onChange(patchContactColorBinding(contact, slot, nextToken));
        }}
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
        aria-label={`${label} palette token`}
      >
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-neutral-500">
        Bound to Global palette token — change the token color under Global → Theme.
      </p>
    </div>
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
  const activeMeta = CONTACT_SUB_SECTIONS.find((section) => section.id === subSection) ?? CONTACT_SUB_SECTIONS[0];
  const elementStyles = normalizeContactElementStyles(contact.elementStyles);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Contact subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ContactSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
        >
          {CONTACT_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <ContactToggleRow
            label="Show section"
            description="Display the contact block on your public portfolio."
            checked={contact.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionHeroPaletteToggle
            enabled={contact.useHeroPalette}
            onChange={(useHeroPalette) => onChange({ useHeroPalette })}
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
              <ContactOptionGrid
                label="Desk width"
                options={PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS}
                value={
                  contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth
                }
                onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
                columns={3}
              />
              <ContactOptionGrid
                label="Placement (large screens)"
                options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
                value={contact.cardPlacement}
                onChange={(cardPlacement) => onChange({ cardPlacement })}
                columns={3}
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
              <ContactOptionGrid
                label="Panel width"
                options={PORTFOLIO_CONTACT_DESK_WIDTH_OPTIONS}
                value={contact.cardMaxWidth === 'md' ? 'xl' : contact.cardMaxWidth}
                onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
                columns={3}
              />
              <ContactOptionGrid
                label="Placement (large screens)"
                options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
                value={contact.cardPlacement}
                onChange={(cardPlacement) => onChange({ cardPlacement })}
                columns={3}
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
              Inquiry panel : headline + email/téléphone à gauche, formulaire carte sur bloc accent à
              droite. Le formulaire est activé automatiquement.
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
              <div>
                <p className="text-xs font-semibold text-neutral-500">Bordure</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {PORTFOLIO_CONTACT_CHANNEL_CARDS_BORDER_OPTIONS.map((option) => {
                    const active = option.value === (contact.channelCardsBorder ?? 'thin');
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          onChange({
                            channelCardsBorder: option.value as PortfolioContactChannelCardsBorder,
                          })
                        }
                        className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition ${
                          active
                            ? 'border-neutral-900 bg-white ring-2 ring-neutral-900/10'
                            : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {(contact.channelCardsBorder ?? 'thin') !== 'none' ? (
                <ContactManualColorField
                  label="Couleur de bordure"
                  value={contact.channelCardsBorderColor || contact.cardBorderColor}
                  onChange={(channelCardsBorderColor) => onChange({ channelCardsBorderColor })}
                />
              ) : null}
            </div>
          ) : null}
          <ContactOptionGrid
            label="Icon placement"
            options={PORTFOLIO_CONTACT_ICON_PLACEMENT_OPTIONS}
            value={contact.iconPlacement ?? 'left'}
            onChange={(iconPlacement) => onChange({ iconPlacement })}
            columns={3}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Link / contact icons</p>
              <p className="mt-1 text-sm text-neutral-500">
                Size, corners, border, and colors for email, phone, location, and social badges.
              </p>
            </div>
            <ContactToggleRow
              label="Icon background"
              description="Turn off to show glyphs only (no circular fill)."
              checked={contact.iconBackgroundEnabled !== false}
              onChange={(iconBackgroundEnabled) => onChange({ iconBackgroundEnabled })}
            />
            <ContactOptionGrid
              label="Icon size"
              options={PORTFOLIO_CONTACT_ICON_SIZE_OPTIONS}
              value={contact.iconSize ?? 'md'}
              onChange={(iconSize) => onChange({ iconSize })}
              columns={2}
            />
            <ContactOptionGrid
              label="Icon corners"
              options={PORTFOLIO_CONTACT_ICON_RADIUS_OPTIONS}
              value={contact.iconRadius ?? 'lg'}
              onChange={(iconRadius) => onChange({ iconRadius })}
              columns={2}
            />
            <ContactOptionGrid
              label="Icon border"
              options={PORTFOLIO_CONTACT_ICON_BORDER_OPTIONS}
              value={contact.iconBorder ?? 'none'}
              onChange={(iconBorder) => onChange({ iconBorder })}
              columns={3}
            />
            {(contact.iconBorder ?? 'none') !== 'none' ? (
              <ContactColorField
                contact={contact}
                onChange={onChange}
                slot="iconBorder"
                label="Icon border color"
                value={contact.iconBorderColor || contact.cardBorderColor}
              />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {contact.useHeroPalette === false && contact.iconBackgroundEnabled !== false ? (
                <div>
                  <ContactColorField
                    contact={contact}
                    onChange={onChange}
                    slot="iconBackground"
                    label="Icon background"
                    value={contact.iconBackgroundColor || '#fff7ed'}
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
                <ContactColorField
                  contact={contact}
                  onChange={onChange}
                  slot="iconColor"
                  label="Icon color"
                  value={contact.iconColor || contact.ctaColor}
                />
                {contact.useHeroPalette === false ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:underline"
                    onClick={() => onChange({ iconColor: '' })}
                  >
                    Reset to CTA accent
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-neutral-500">
                    Soft badge fill follows this token (accent tint). Edit the token under Global →
                    Theme.
                  </p>
                )}
              </div>
            </div>
            <ContactToggleRow
              label="Brand colors for social"
              description="Keep Instagram, GitHub, etc. in their platform colors. Off = same chrome as email/phone."
              checked={contact.iconUseBrandColors !== false}
              onChange={(iconUseBrandColors) => onChange({ iconUseBrandColors })}
            />
          </div>

          <ContactOptionGrid
            label="Item spacing"
            options={PORTFOLIO_CONTACT_ITEM_GAP_OPTIONS}
            value={contact.itemGap ?? 'md'}
            onChange={(itemGap) => onChange({ itemGap })}
            columns={2}
          />
          <ContactOptionGrid
            label="Card padding (list + form)"
            options={PORTFOLIO_CONTACT_CARD_PADDING_OPTIONS}
            value={contact.cardPadding ?? 'md'}
            onChange={(cardPadding) => onChange({ cardPadding })}
            columns={2}
          />
          <ContactOptionGrid
            label="Block order"
            options={PORTFOLIO_CONTACT_BLOCK_ORDER_OPTIONS}
            value={contact.blockOrder}
            onChange={(blockOrder) => onChange({ blockOrder })}
            columns={2}
          />
          <ContactOptionGrid
            label="Card max width"
            options={PORTFOLIO_CONTACT_CARD_MAX_WIDTH_OPTIONS}
            value={contact.cardMaxWidth}
            onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
            columns={2}
          />
          <ContactOptionGrid
            label="Card placement"
            options={PORTFOLIO_CONTACT_CARD_PLACEMENT_OPTIONS}
            value={contact.cardPlacement}
            onChange={(cardPlacement) => onChange({ cardPlacement })}
            columns={3}
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
          <ContactColorField
            contact={contact}
            onChange={onChange}
            slot="cta"
            label="CTA color"
            value={contact.ctaColor}
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

          <ContactOptionGrid
            label="Title preset"
            options={PORTFOLIO_CONTACT_TITLE_PRESET_OPTIONS}
            value={contact.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
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

          <ContactOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_CONTACT_SUBTITLE_PRESET_OPTIONS}
            value={contact.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
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
            <ContactOptionGrid
              label="Title font"
              options={PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS}
              value={contact.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <ContactOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_CONTACT_HEADER_FONT_OPTIONS}
              value={contact.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <ContactToggleRow
            label="Serif subtitle"
            description="Use Playfair Display for the subtitle (editorial default)."
            checked={contact.subtitleSerif}
            onChange={(subtitleSerif) => onChange({ subtitleSerif })}
          />

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
            <ContactOptionGrid
              label="Header alignment"
              options={[
                { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
                { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
              ]}
              value={contact.headerAlignment}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
              columns={2}
            />
          )}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Illustration SVG</p>
              <p className="mt-1 text-sm text-neutral-500">
                SVG décoratif à côté du contenu. Choisissez un style, puis placez-le à gauche ou à
                droite sur grand écran. Les layouts Inquiry / Desk / Info panel peuvent ignorer ce
                réglage au profit de leur illustration intégrée.
              </p>
            </div>
            <ContactOptionGrid
              label="Style SVG"
              options={PORTFOLIO_CONTACT_ILLUSTRATION_OPTIONS}
              value={contact.illustrationVariant ?? 'none'}
              onChange={(illustrationVariant) => onChange({ illustrationVariant })}
              columns={2}
            />
            {(contact.illustrationVariant ?? 'none') !== 'none' ? (
              <ContactOptionGrid
                label="Placement SVG"
                options={PORTFOLIO_CONTACT_ILLUSTRATION_PLACEMENT_OPTIONS}
                value={contact.illustrationPlacement ?? 'right'}
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
                columns={2}
              />
            ) : null}
          </div>
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
                  <ContactOptionGrid
                    label="Form layout"
                    options={PORTFOLIO_CONTACT_FORM_PLACEMENT_OPTIONS}
                    value={contact.contactFormPlacement ?? 'below'}
                    onChange={(contactFormPlacement) => onChange({ contactFormPlacement })}
                    columns={2}
                  />
                  {(contact.contactFormPlacement ?? 'below') === 'below' ? (
                    <ContactOptionGrid
                      label="Space between list and form"
                      options={PORTFOLIO_CONTACT_FORM_STACK_GAP_OPTIONS}
                      value={contact.formStackGap ?? 'lg'}
                      onChange={(formStackGap) => onChange({ formStackGap })}
                      columns={2}
                    />
                  ) : null}
                </>
              ) : null}

              <ContactOptionGrid
                label="Card padding (list + form)"
                options={PORTFOLIO_CONTACT_CARD_PADDING_OPTIONS}
                value={contact.cardPadding ?? 'md'}
                onChange={(cardPadding) => onChange({ cardPadding })}
                columns={2}
              />

              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Form container</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Outer fill, border and drop shadow around the message form — all nine form
                    designs.
                  </p>
                </div>

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

                <ContactOptionGrid
                  label="Form border"
                  options={PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS}
                  value={contact.formBorder ?? 'soft'}
                  onChange={(formBorder) => onChange({ formBorder })}
                  columns={2}
                />

                {contact.formBorder === 'soft' || contact.formBorder === 'solid' ? (
                  <ContactManualColorField
                    label="Form border color"
                    value={contact.formBorderColor || contact.cardBorderColor}
                    onChange={(formBorderColor) => onChange({ formBorderColor })}
                  />
                ) : null}

                <ContactOptionGrid
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
                  columns={2}
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
              </div>

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
        <SectionBackgroundSettingsFields settings={contact} onChange={onChange} />
      ) : null}
    </div>
  );
}
