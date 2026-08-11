'use client';

import { useState } from 'react';
import {
  PORTFOLIO_FOOTER_CTA_BUTTONS_ALIGN_OPTIONS,
  PORTFOLIO_FOOTER_CONTACT_CTA_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_CONTACT_ICON_SIZE_OPTIONS,
  PORTFOLIO_FOOTER_DESCRIPTION_SOURCE_OPTIONS,
  PORTFOLIO_FOOTER_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_ALIGNMENT_OPTIONS,
  PORTFOLIO_FOOTER_MARGIN_TOP_OPTIONS,
  PORTFOLIO_FOOTER_MARKETPLACE_CTA_DESIGN_OPTIONS,
  PORTFOLIO_FOOTER_PADDING_OPTIONS,
  PORTFOLIO_FOOTER_PATTERN_OPTIONS,
  PORTFOLIO_FOOTER_STYLE_TARGET_OPTIONS,
  DEFAULT_FOOTER_CENTERED_LINKS,
  DEFAULT_FOOTER_LINK_COLUMNS,
  DEFAULT_FOOTER_MARKETPLACE_CTA_LABEL,
  DEFAULT_FOOTER_COPYRIGHT_LABEL,
  DEFAULT_FOOTER_LANDING_BRAND_GAP_PX,
  DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX,
  FOOTER_LANDING_BRAND_GAP_PX_MAX,
  FOOTER_LANDING_BRAND_GAP_PX_MIN,
  FOOTER_COLUMN_HEADING_GAP_PX_MAX,
  FOOTER_COLUMN_HEADING_GAP_PX_MIN,
  FOOTER_MARGIN_TOP_PRESET_PX,
  FOOTER_MARGIN_TOP_PX_MAX,
  FOOTER_MARGIN_TOP_PX_MIN,
  FOOTER_PADDING_PRESET_PX,
  FOOTER_PADDING_PX_MAX,
  FOOTER_PADDING_PX_MIN,
  clampFooterLandingBrandGapPx,
  clampFooterColumnHeadingGapPx,
  clampFooterMarginTopPx,
  clampFooterPaddingPx,
  createFooterLinkColumn,
  createFooterLinkItem,
  footerColorLuminance,
  footerContrastingPrimary,
  isFooterBackgroundLight,
  isLegacyLandingMarketingColumns,
  normalizeFooterElementStyles,
  patchFooterElementStyle,
  resolveFooterMarginTopPx,
  resolveFooterPaddingSides,
  syncFooterLegacyTypographyFromElementStyles,
  type PortfolioFooterSectionSettings,
  type PortfolioFooterCenteredIdentity,
  type PortfolioFooterStyleTarget,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  applyFooterPaletteToSettings,
  DEFAULT_FOOTER_COLOR_BINDINGS,
  DEFAULT_FOOTER_PALETTE,
  FOOTER_STYLE_TARGET_COLOR_SLOT,
  mergeFooterColorBindings,
  mergeFooterPalette,
  patchFooterColorBinding,
  patchFooterColorField,
  PORTFOLIO_FOOTER_COLOR_SLOT_OPTIONS,
  type FooterColorSlot,
} from '@/components/portfolio/portfolio-footer-palette-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

export type FooterSubSection = 'general' | 'palette' | 'content' | 'typography' | 'background';

const FOOTER_SUB_SECTIONS: { id: FooterSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Visibility, design, and layout.' },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Follow Global theme tokens and bind each footer color.',
  },
  {
    id: 'content',
    label: 'Content',
    description: 'Brand, description, contact details, links, and credit.',
  },
  {
    id: 'typography',
    label: 'Typography',
    description: 'Icons, colors, fonts, sizes, and formatting for footer text.',
  },
  {
    id: 'background',
    label: 'Background',
    description: 'Fill, gradient, and pattern motifs behind this section.',
  },
];

const FOOTER_CENTERED_IDENTITY_OPTIONS: {
  value: PortfolioFooterCenteredIdentity;
  label: string;
  description: string;
}[] = [
  { value: 'avatar', label: 'Avatar', description: 'Profile image, with initials as fallback.' },
  { value: 'name', label: 'Name', description: 'Your public creator name.' },
  { value: 'custom', label: 'Custom', description: 'A custom wordmark or logo image.' },
];

const FOOTER_BACKGROUND_LABEL_SLOTS: Record<string, FooterColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asFooterPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioFooterSectionSettings> {
  return patch as Partial<PortfolioFooterSectionSettings>;
}

function FooterToggleRow({
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

function FooterOptionGrid<T extends string>({
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

function FooterColorField({
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

function FooterPaletteColorField({
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
      <FooterColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asFooterPatch(patchFooterColorField(footer, slot, hex)))}
      />
    );
  }

  const palette = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
          style={{ backgroundColor: resolved }}
          title={resolved}
          aria-hidden
        />
      </div>
      <select
        value={token}
        onChange={(event) =>
          onChange(
            asFooterPatch(
              patchFooterColorBinding(footer, slot, event.target.value as HeroPaletteTokenId)
            )
          )
        }
        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
        aria-label={`${label} palette token`}
      >
        {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FooterPalettePanel({
  footer,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  const bindings = mergeFooterColorBindings(DEFAULT_FOOTER_COLOR_BINDINGS, footer.footerColorBindings);
  const paletteOn = footer.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <SectionHeroPaletteToggle
        enabled={paletteOn}
        onChange={(useHeroPalette) =>
          onChange(
            asFooterPatch(
              useHeroPalette
                ? { useHeroPalette, ...applyFooterPaletteToSettings(footer) }
                : { useHeroPalette, lockPaletteAcrossColorModes: false }
            )
          )
        }
        title="Use global color palette"
        description="When on, Footer colors follow the Global site palette. Turn off to edit colors manually in Background and other tabs."
        enabledHint="Edit the dark/light token pair under Global → Theme. Bindings below pick which token each footer color uses."
        disabledHint="Global palette tokens still exist, but Footer uses manual hex colors until you turn this back on."
      />

      {paletteOn ? (
        <FooterToggleRow
          label="Garder ces couleurs en sombre / clair"
          description="Fige la palette actuelle du footer. Changer le mode Global (sombre ↔ clair) ne remplacera plus ces couleurs. Désactive puis réactive pour reprendre la palette du mode actif."
          checked={footer.lockPaletteAcrossColorModes === true}
          onChange={(lockPaletteAcrossColorModes) => {
            if (!lockPaletteAcrossColorModes) {
              onChange({ lockPaletteAcrossColorModes: false });
              return;
            }
            // Snapshot current footer palette (already painted from active mode) and lock it.
            const snapshot = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
            onChange(
              asFooterPatch({
                lockPaletteAcrossColorModes: true,
                footerPalette: snapshot,
                ...applyFooterPaletteToSettings({ ...footer, footerPalette: snapshot }),
              })
            );
          }}
        />
      ) : null}

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        The site color palette lives in <span className="font-semibold">Global → Theme</span>. Footer
        bindings map each slot (background, text, CTAs) to one of those tokens.
      </p>

      {paletteOn ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Color bindings</p>
          <p className="mt-1 text-sm text-neutral-500">
            Change a binding to recolor that part of the footer from the Global palette.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {PORTFOLIO_FOOTER_COLOR_SLOT_OPTIONS.map((slot) => (
              <div key={slot.value}>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                    {slot.label}
                  </span>
                  <select
                    value={bindings[slot.value]}
                    onChange={(event) =>
                      onChange(
                        asFooterPatch(
                          patchFooterColorBinding(
                            footer,
                            slot.value,
                            event.target.value as HeroPaletteTokenId
                          )
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800"
                  >
                    {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                      <option key={token.value} value={token.value}>
                        {token.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="mt-1 text-xs text-neutral-500">{slot.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          Palette is off — edit hex colors in Background / General. Turn palette on to bind colors to
          Global tokens.
        </p>
      )}
    </div>
  );
}

function FooterMarketplaceCtaFields({
  footer,
  onChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Marketplace CTA</p>
      <FooterToggleRow
        label="Show Marketplace button"
        description="Paired with Contact me on every footer design — label, URL, and presets."
        checked={footer.showMarketplaceLink}
        onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
      />
      {footer.showMarketplaceLink ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-4">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Label</span>
            <input
              type="text"
              value={footer.marketplaceCtaLabel ?? DEFAULT_FOOTER_MARKETPLACE_CTA_LABEL}
              onChange={(event) => onChange({ marketplaceCtaLabel: event.target.value })}
              placeholder={DEFAULT_FOOTER_MARKETPLACE_CTA_LABEL}
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
              Redirect URL
            </span>
            <input
              type="text"
              value={footer.marketplaceCtaHref ?? ''}
              onChange={(event) => onChange({ marketplaceCtaHref: event.target.value })}
              placeholder="Empty = /marketplace/{your-id} · or https://… · #contact"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-mono text-neutral-900"
            />
            <span className="mt-1.5 block text-xs text-neutral-500">
              Leave empty for your NoProbleme marketplace profile. Any link works:{' '}
              <span className="font-mono">https://…</span>, <span className="font-mono">#contact</span>, or{' '}
              <span className="font-mono">__profile__</span>.
            </span>
          </label>
          <FooterOptionGrid
            label="Predefined designs"
            options={PORTFOLIO_FOOTER_MARKETPLACE_CTA_DESIGN_OPTIONS}
            value={footer.marketplaceCtaDesign ?? 'pill-outline'}
            onChange={(marketplaceCtaDesign) => onChange({ marketplaceCtaDesign })}
            columns={2}
          />
          <FooterToggleRow
            label="Show arrow"
            description="↗ icon next to the label."
            checked={footer.marketplaceCtaShowArrow !== false}
            onChange={(marketplaceCtaShowArrow) => onChange({ marketplaceCtaShowArrow })}
          />
          {(footer.marketplaceCtaDesign ?? 'text-arrow') !== 'text-arrow' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(footer.marketplaceCtaDesign === 'pill-dark' ||
                footer.marketplaceCtaDesign === 'pill-accent') && (
                <FooterColorField
                  label="Button text"
                  value={footer.marketplaceCtaTextColor ?? '#fafafa'}
                  onChange={(marketplaceCtaTextColor) => onChange({ marketplaceCtaTextColor })}
                />
              )}
              {footer.marketplaceCtaDesign === 'pill-dark' ? (
                <FooterColorField
                  label="Button background"
                  value={footer.marketplaceCtaBackgroundColor ?? '#0a0a0a'}
                  onChange={(marketplaceCtaBackgroundColor) =>
                    onChange({ marketplaceCtaBackgroundColor })
                  }
                />
              ) : null}
              {footer.marketplaceCtaDesign === 'pill-outline' ? (
                <FooterColorField
                  label="Outline / text"
                  value={footer.marketplaceCtaBorderColor ?? '#0a0a0a'}
                  onChange={(marketplaceCtaBorderColor) => onChange({ marketplaceCtaBorderColor })}
                />
              ) : null}
              {footer.marketplaceCtaDesign === 'pill-accent' ? (
                <p className="sm:col-span-2 text-sm text-neutral-500">
                  Accent pill uses the{' '}
                  <span className="font-semibold text-neutral-700">General → accent</span> color for the
                  fill.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">
              Text + arrow color: Typography → Marketplace CTA (or accent). Your current look is{' '}
              <span className="font-semibold text-neutral-700">Text + arrow</span>.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function FooterSettingsPanel({
  footer,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  footer: PortfolioFooterSectionSettings;
  onChange: (patch: Partial<PortfolioFooterSectionSettings>) => void;
  subSection?: FooterSubSection;
  onSubSectionChange?: (value: FooterSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FooterSubSection>('general');
  const [styleTarget, setStyleTarget] = useState<PortfolioFooterStyleTarget>('brand');
  const subSection = controlledSubSection ?? uncontrolledSubSection;
  const setSubSection = (value: FooterSubSection) => {
    onSubSectionChange?.(value);
    if (controlledSubSection === undefined) setUncontrolledSubSection(value);
  };
  const activeMeta = FOOTER_SUB_SECTIONS.find((section) => section.id === subSection) ?? FOOTER_SUB_SECTIONS[0];
  const elementStyles = normalizeFooterElementStyles(footer.elementStyles, footer);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Footer subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as FooterSubSection)}
          className="min-w-[12rem] flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:max-w-xs"
        >
          {FOOTER_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <FooterToggleRow
            label="Show section"
            description="Display the footer on your public portfolio."
            checked={footer.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionHeroPaletteToggle
            enabled={footer.useHeroPalette}
            onChange={(useHeroPalette) =>
              onChange(
                asFooterPatch(
                  useHeroPalette
                    ? { useHeroPalette, ...applyFooterPaletteToSettings(footer) }
                    : { useHeroPalette, lockPaletteAcrossColorModes: false }
                )
              )
            }
          />
          {footer.useHeroPalette ? (
            <FooterToggleRow
              label="Garder ces couleurs en sombre / clair"
              description="Fige la palette actuelle du footer. Le mode Global sombre ↔ clair ne la remplacera plus."
              checked={footer.lockPaletteAcrossColorModes === true}
              onChange={(lockPaletteAcrossColorModes) => {
                if (!lockPaletteAcrossColorModes) {
                  onChange({ lockPaletteAcrossColorModes: false });
                  return;
                }
                const snapshot = mergeFooterPalette(DEFAULT_FOOTER_PALETTE, footer.footerPalette);
                onChange(
                  asFooterPatch({
                    lockPaletteAcrossColorModes: true,
                    footerPalette: snapshot,
                    ...applyFooterPaletteToSettings({ ...footer, footerPalette: snapshot }),
                  })
                );
              }}
            />
          ) : null}
          <FooterOptionGrid
            label="Design"
            options={PORTFOLIO_FOOTER_DESIGN_OPTIONS}
            value={footer.design}
            onChange={(design) => {
              if (design === 'centered-minimal') {
                onChange({
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
                });
                return;
              }
              if (design === 'landing') {
                const existing = footer.linkColumns ?? [];
                const useDefaults =
                  existing.length === 0 || isLegacyLandingMarketingColumns(existing);
                onChange({
                  design,
                  showBrand: true,
                  showDescription: true,
                  showContactLinks: true,
                  showCopyright: true,
                  showDesignCredit: false,
                  showMarketplaceLink: true,
                  showProfileVisits: false,
                  showEmail: true,
                  showPhone: true,
                  showLocation: true,
                  showHours: true,
                  linkColumns: useDefaults
                    ? DEFAULT_FOOTER_LINK_COLUMNS.map((col) => ({
                        ...col,
                        links: col.links.map((link) => ({ ...link })),
                      }))
                    : existing,
                });
                return;
              }
              onChange({ design });
            }}
            columns={2}
          />
          {footer.design === 'editorial' ? (
            <FooterOptionGrid
              label="Column layout"
              options={PORTFOLIO_FOOTER_ALIGNMENT_OPTIONS}
              value={footer.alignment ?? 'split'}
              onChange={(alignment) => onChange({ alignment })}
              columns={3}
            />
          ) : null}
          <FooterOptionGrid
            label="Padding"
            options={PORTFOLIO_FOOTER_PADDING_OPTIONS}
            value={
              footer.padding === 'custom'
                ? ('' as 'standard')
                : ((footer.padding ?? 'standard') as
                    | 'compact'
                    | 'standard'
                    | 'comfortable'
                    | 'spacious')
            }
            onChange={(padding) => {
              const sides = FOOTER_PADDING_PRESET_PX[padding];
              onChange({
                padding,
                paddingTopPx: sides.top,
                paddingBottomPx: sides.bottom,
                paddingLeftPx: sides.left,
                paddingRightPx: sides.right,
              });
            }}
            columns={2}
          />
          {footer.padding === 'custom' ? (
            <p className="text-xs font-medium text-amber-700">
              Manual padding — pick a preset above to reset all sides.
            </p>
          ) : null}
          <div className="grid gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:grid-cols-2">
            <p className="sm:col-span-2 text-sm text-neutral-500">
              Sur mobile, un padding horizontal sûr est rétabli automatiquement (le contenu ne
              colle plus au bord).
            </p>
            {(
              [
                ['Top', 'paddingTopPx'],
                ['Bottom', 'paddingBottomPx'],
                ['Left', 'paddingLeftPx'],
                ['Right', 'paddingRightPx'],
              ] as const
            ).map(([label, key]) => {
              const sides = resolveFooterPaddingSides(footer);
              const live =
                key === 'paddingTopPx'
                  ? sides.top
                  : key === 'paddingBottomPx'
                    ? sides.bottom
                    : key === 'paddingLeftPx'
                      ? sides.left
                      : sides.right;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      {label}
                    </p>
                    <span className="tabular-nums text-sm font-semibold text-neutral-700">
                      {live}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={FOOTER_PADDING_PX_MIN}
                    max={FOOTER_PADDING_PX_MAX}
                    step={2}
                    value={
                      footer.padding === 'custom'
                        ? clampFooterPaddingPx(footer[key], live)
                        : live
                    }
                    onChange={(event) => {
                      const px = clampFooterPaddingPx(Number(event.target.value), live);
                      onChange({ padding: 'custom', [key]: px });
                    }}
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label={`Footer padding ${label.toLowerCase()} in pixels`}
                  />
                </div>
              );
            })}
          </div>
          <FooterOptionGrid
            label="Margin top"
            options={PORTFOLIO_FOOTER_MARGIN_TOP_OPTIONS}
            value={
              footer.marginTop === 'custom'
                ? ('' as 'none')
                : ((footer.marginTop ?? 'none') as
                    | 'none'
                    | 'compact'
                    | 'standard'
                    | 'comfortable'
                    | 'spacious')
            }
            onChange={(marginTop) =>
              onChange({
                marginTop,
                marginTopPx: FOOTER_MARGIN_TOP_PRESET_PX[marginTop],
              })
            }
            columns={2}
          />
          {footer.marginTop === 'custom' ? (
            <p className="text-xs font-medium text-amber-700">
              Manual mode — pick a preset above to leave custom px.
            </p>
          ) : null}
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Margin top (px)
              </p>
              <span className="tabular-nums text-sm font-semibold text-neutral-700">
                {resolveFooterMarginTopPx(footer)}px
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Exact space above the footer. Drag to switch to manual.
            </p>
            <input
              type="range"
              min={FOOTER_MARGIN_TOP_PX_MIN}
              max={FOOTER_MARGIN_TOP_PX_MAX}
              step={2}
              value={clampFooterMarginTopPx(footer.marginTopPx, resolveFooterMarginTopPx(footer))}
              onChange={(event) => {
                const px = clampFooterMarginTopPx(Number(event.target.value), 0);
                onChange({ marginTop: 'custom', marginTopPx: px });
              }}
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Footer margin top in pixels"
            />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
              <span>{FOOTER_MARGIN_TOP_PX_MIN}px</span>
              <span>{FOOTER_MARGIN_TOP_PX_MAX}px</span>
            </div>
          </div>
          {footer.design === 'landing' ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Landing — left column gap
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampFooterLandingBrandGapPx(
                    footer.landingBrandGapPx,
                    DEFAULT_FOOTER_LANDING_BRAND_GAP_PX
                  )}
                  px
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Vertical space between brand, bio, social icons, and buttons.
              </p>
              <input
                type="range"
                min={FOOTER_LANDING_BRAND_GAP_PX_MIN}
                max={FOOTER_LANDING_BRAND_GAP_PX_MAX}
                step={1}
                value={clampFooterLandingBrandGapPx(
                  footer.landingBrandGapPx,
                  DEFAULT_FOOTER_LANDING_BRAND_GAP_PX
                )}
                onChange={(event) =>
                  onChange({
                    landingBrandGapPx: clampFooterLandingBrandGapPx(
                      Number(event.target.value),
                      DEFAULT_FOOTER_LANDING_BRAND_GAP_PX
                    ),
                  })
                }
                className="mt-1 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Landing left column vertical gap"
              />
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>{FOOTER_LANDING_BRAND_GAP_PX_MIN}px</span>
                <span>{FOOTER_LANDING_BRAND_GAP_PX_MAX}px</span>
              </div>
            </div>
          ) : null}
          {footer.design === 'landing' || footer.design === 'editorial' ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Titre → liste (Contact / Links)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampFooterColumnHeadingGapPx(
                    footer.columnHeadingGapPx,
                    DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX
                  )}
                  px
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                Espacement commun sous les titres Contact et Links avant leurs éléments.
              </p>
              <input
                type="range"
                min={FOOTER_COLUMN_HEADING_GAP_PX_MIN}
                max={FOOTER_COLUMN_HEADING_GAP_PX_MAX}
                step={1}
                value={clampFooterColumnHeadingGapPx(
                  footer.columnHeadingGapPx,
                  DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX
                )}
                onChange={(event) =>
                  onChange({
                    columnHeadingGapPx: clampFooterColumnHeadingGapPx(
                      Number(event.target.value),
                      DEFAULT_FOOTER_COLUMN_HEADING_GAP_PX
                    ),
                  })
                }
                className="mt-1 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Espacement sous les titres Contact et Links"
              />
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>{FOOTER_COLUMN_HEADING_GAP_PX_MIN}px</span>
                <span>{FOOTER_COLUMN_HEADING_GAP_PX_MAX}px</span>
              </div>
            </div>
          ) : null}
          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Contact CTA</p>
            <FooterToggleRow
              label="Show contact button"
              description="“Contact me” — shown with Marketplace on every footer design."
              checked={footer.showContactCta}
              onChange={(showContactCta) => onChange({ showContactCta })}
            />
            <FooterOptionGrid
              label="Buttons align (large screen)"
              options={PORTFOLIO_FOOTER_CTA_BUTTONS_ALIGN_OPTIONS}
              value={footer.ctaButtonsAlign ?? 'center'}
              onChange={(ctaButtonsAlign) => onChange({ ctaButtonsAlign })}
              columns={3}
            />
            {footer.showContactCta ? (
              <>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Button label
                  </span>
                  <input
                    type="text"
                    value={footer.ctaButtonLabel}
                    onChange={(event) => onChange({ ctaButtonLabel: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </label>
                <FooterOptionGrid
                  label="Predefined designs"
                  options={PORTFOLIO_FOOTER_CONTACT_CTA_DESIGN_OPTIONS}
                  value={footer.ctaDesign ?? 'pill-outline'}
                  onChange={(ctaDesign) => onChange({ ctaDesign })}
                  columns={2}
                />
                <p className="text-sm text-neutral-500">
                  Contact me only. Marketplace has its own design under Marketplace CTA.
                </p>
                <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white/80 p-4">
                  <p className="text-sm font-semibold text-neutral-950">Colors</p>
                  {(footer.ctaDesign ?? 'pill-outline') === 'pill-dark' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FooterColorField
                        label="Button background"
                        value={footer.ctaButtonBackgroundColor ?? '#ffffff'}
                        onChange={(ctaButtonBackgroundColor) => onChange({ ctaButtonBackgroundColor })}
                      />
                      <FooterColorField
                        label="Button text"
                        value={footer.ctaButtonTextColor ?? '#0a0a0a'}
                        onChange={(ctaButtonTextColor) => onChange({ ctaButtonTextColor })}
                      />
                    </div>
                  ) : null}
                  {(footer.ctaDesign ?? 'pill-outline') === 'pill-outline' ? (
                    <FooterColorField
                      label="Outline / text"
                      value={footer.ctaButtonBorderColor || footer.ctaButtonTextColor || '#ffffff'}
                      onChange={(hex) =>
                        onChange({ ctaButtonBorderColor: hex, ctaButtonTextColor: hex })
                      }
                    />
                  ) : null}
                  {(footer.ctaDesign ?? 'pill-outline') === 'pill-accent' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FooterColorField
                        label="Button text"
                        value={footer.ctaButtonTextColor ?? '#ffffff'}
                        onChange={(ctaButtonTextColor) => onChange({ ctaButtonTextColor })}
                      />
                      <p className="text-sm text-neutral-500 sm:col-span-1 self-end">
                        Fill uses General → accent.
                      </p>
                    </div>
                  ) : null}
                  {(footer.ctaDesign ?? 'pill-outline') === 'text-arrow' ? (
                    <p className="text-sm text-neutral-500">
                      Text color: Typography → CTA button (or accent). Low-contrast colors are
                      auto-boosted on dark footers.
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </div>
          <FooterMarketplaceCtaFields footer={footer} onChange={onChange} />
          <FooterToggleRow
            label="Top border"
            description="Separator line above the footer."
            checked={footer.showTopBorder}
            onChange={(showTopBorder) => onChange({ showTopBorder })}
          />
          <FooterToggleRow
            label="Content divider"
            description="Petit trait entre les blocs d’infos (vertical desktop, horizontal mobile) — tous les designs."
            checked={footer.showContentDivider !== false}
            onChange={(showContentDivider) => onChange({ showContentDivider })}
          />
          {footer.showContentDivider !== false ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[10rem] flex-1">
                  <FooterColorField
                    label="Couleur du trait"
                    value={
                      footer.contentDividerColor?.trim() ||
                      (isFooterBackgroundLight(footer) ? '#a3a3a3' : '#737373')
                    }
                    onChange={(contentDividerColor) => onChange({ contentDividerColor })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ contentDividerColor: '' })}
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Auto
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Opacité
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {Math.min(100, Math.max(0, footer.contentDividerOpacity ?? 40))}%
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={100}
                  step={2}
                  value={Math.min(100, Math.max(0, footer.contentDividerOpacity ?? 40))}
                  onChange={(event) =>
                    onChange({ contentDividerOpacity: Number(event.target.value) })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Content divider opacity"
                />
              </div>
            </div>
          ) : null}
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Chrome colors</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FooterColorField
                label="Icons"
                value={footer.iconColor}
                onChange={(iconColor) => onChange({ iconColor })}
              />
              <FooterColorField
                label="Marketplace link / CTA band"
                value={footer.accentColor}
                onChange={(accentColor) => onChange({ accentColor })}
              />
            </div>
            <p className="text-sm text-neutral-500">
              Text colors for brand, contact lines, meta, and CTA copy are in the{' '}
              <span className="font-semibold text-neutral-700">Typography</span> tab.
            </p>
            <button
              type="button"
              onClick={() =>
                onChange({
                  primaryColor: footerContrastingPrimary(footer),
                  textColor: isFooterBackgroundLight(footer) ? '#737373' : '#a3a3a3',
                  iconColor: isFooterBackgroundLight(footer) ? '#525252' : '#737373',
                })
              }
              className="text-sm font-semibold text-neutral-700 underline-offset-2 hover:underline"
            >
              Auto-contrast text from background
            </button>
          </div>
        </div>
      ) : null}

      {subSection === 'palette' ? <FooterPalettePanel footer={footer} onChange={onChange} /> : null}

      {subSection === 'content' ? (
        <div className="space-y-6">
          {footer.design === 'centered-minimal' ? (
            <div className="space-y-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Centered minimal content
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Choose the centered identity and the internal sections shown above your social icons.
                </p>
              </div>

              <FooterOptionGrid
                label="Identity"
                options={FOOTER_CENTERED_IDENTITY_OPTIONS}
                value={footer.centeredIdentity ?? 'name'}
                onChange={(centeredIdentity) => onChange({ centeredIdentity })}
                columns={3}
              />

              {(footer.centeredIdentity ?? 'name') === 'custom' ? (
                <div className="grid gap-4 rounded-2xl border border-neutral-200/80 bg-white p-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Custom text
                    </span>
                    <input
                      type="text"
                      value={footer.centeredCustomText ?? ''}
                      onChange={(event) => onChange({ centeredCustomText: event.target.value })}
                      placeholder="Logo"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Logo image URL (optional)
                    </span>
                    <input
                      type="url"
                      value={footer.centeredCustomLogoUrl ?? ''}
                      onChange={(event) => onChange({ centeredCustomLogoUrl: event.target.value })}
                      placeholder="https://…/logo.svg"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-mono text-neutral-900"
                    />
                  </label>
                  <p className="text-xs text-neutral-500 sm:col-span-2">
                    The logo URL takes priority. Custom text is used as its fallback.
                  </p>
                </div>
              ) : null}

              <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Internal links
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Supported anchors: #hero, #work, #skills, #services, #about, #experience, #faq, #contact.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        centeredLinks: DEFAULT_FOOTER_CENTERED_LINKS.map((link) => ({ ...link })),
                      })
                    }
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Reset defaults
                  </button>
                </div>

                {(footer.centeredLinks ?? []).map((link, index) => (
                  <div key={link.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
                    <input
                      type="text"
                      value={link.label}
                      placeholder="Label"
                      aria-label={`Centered link ${index + 1} label`}
                      onChange={(event) =>
                        onChange({
                          centeredLinks: footer.centeredLinks.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item
                          ),
                        })
                      }
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                    />
                    <input
                      type="text"
                      value={link.href}
                      placeholder="#hero · #work · #contact"
                      aria-label={`Centered link ${index + 1} anchor`}
                      onChange={(event) =>
                        onChange({
                          centeredLinks: footer.centeredLinks.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, href: event.target.value } : item
                          ),
                        })
                      }
                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-mono text-neutral-900"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          centeredLinks: footer.centeredLinks.filter((_, itemIndex) => itemIndex !== index),
                        })
                      }
                      className="rounded-xl px-2 text-xs font-semibold text-neutral-500 hover:text-red-600"
                      aria-label={`Remove ${link.label || `link ${index + 1}`}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      centeredLinks: [
                        ...(footer.centeredLinks ?? []),
                        createFooterLinkItem({ label: 'Link', href: '#contact' }),
                      ],
                    })
                  }
                  className="text-left text-xs font-semibold text-neutral-700 underline-offset-2 hover:underline"
                >
                  + Add link
                </button>
              </div>
            </div>
          ) : null}

          {footer.design !== 'centered-minimal' ? (
          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Brand</p>
            <FooterToggleRow
              label="Name / brand"
              description="Show your name as the footer brand."
              checked={footer.showBrand}
              onChange={(showBrand) => onChange({ showBrand })}
            />
            <FooterToggleRow
              label="Avatar / logo"
              description="Use your profile photo as a small logo."
              checked={footer.showAvatar}
              onChange={(showAvatar) => onChange({ showAvatar })}
            />
            <FooterToggleRow
              label="Description"
              description="Short bio or why-me blurb under the brand."
              checked={footer.showDescription}
              onChange={(showDescription) => onChange({ showDescription })}
            />
            {footer.showDescription ? (
              <>
                <FooterOptionGrid
                  label="Description source"
                  options={PORTFOLIO_FOOTER_DESCRIPTION_SOURCE_OPTIONS}
                  value={footer.descriptionSource}
                  onChange={(descriptionSource) => onChange({ descriptionSource })}
                  columns={3}
                />
                {footer.descriptionSource === 'custom' ? (
                  <textarea
                    value={footer.descriptionCustom}
                    onChange={(event) => onChange({ descriptionCustom: event.target.value })}
                    rows={3}
                    placeholder="A short line about you or your studio…"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                ) : null}
              </>
            ) : null}
          </div>
          ) : null}

          {footer.design === 'landing' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Columns
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Two columns by default: <span className="font-semibold text-neutral-700">Contact</span>{' '}
                    (email, phone, …) and{' '}
                    <span className="font-semibold text-neutral-700">Links</span> (Marketplace,
                    NoProbleme profile, Services, Work).
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        linkColumns: DEFAULT_FOOTER_LINK_COLUMNS.map((col) => ({
                          ...col,
                          links: col.links.map((link) => ({ ...link })),
                        })),
                      })
                    }
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Reset Contact + Links
                  </button>
                  <button
                    type="button"
                    disabled={(footer.linkColumns?.length ?? 0) >= 2}
                    onClick={() =>
                      onChange({
                        linkColumns: [
                          ...(footer.linkColumns ?? []),
                          createFooterLinkColumn({
                            title: 'Links',
                            links: [createFooterLinkItem({ label: 'Link', href: '#' })],
                          }),
                        ],
                      })
                    }
                    className="rounded-xl border border-neutral-900 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Add column
                  </button>
                </div>
              </div>

              {(footer.linkColumns ?? []).map((column, columnIndex) => (
                <div
                  key={column.id}
                  className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="min-w-0 flex-1">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                        Column title
                      </span>
                      <input
                        type="text"
                        value={column.title}
                        onChange={(event) => {
                          const next = (footer.linkColumns ?? []).map((col, index) =>
                            index === columnIndex ? { ...col, title: event.target.value } : col
                          );
                          onChange({ linkColumns: next });
                        }}
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          linkColumns: (footer.linkColumns ?? []).filter(
                            (_, index) => index !== columnIndex
                          ),
                        })
                      }
                      className="mt-6 text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {column.id === 'contact' ? (
                    <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500">
                      This column shows email, phone, location, and hours from the Contact toggles
                      below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {column.links.map((link, linkIndex) => (
                        <div key={link.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
                          <input
                            type="text"
                            value={link.label}
                            placeholder="Label"
                            onChange={(event) => {
                              const next = (footer.linkColumns ?? []).map((col, index) => {
                                if (index !== columnIndex) return col;
                                return {
                                  ...col,
                                  links: col.links.map((item, i) =>
                                    i === linkIndex ? { ...item, label: event.target.value } : item
                                  ),
                                };
                              });
                              onChange({ linkColumns: next });
                            }}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                          />
                          <input
                            type="text"
                            value={link.href}
                            placeholder="#services · /marketplace · __profile__"
                            onChange={(event) => {
                              const next = (footer.linkColumns ?? []).map((col, index) => {
                                if (index !== columnIndex) return col;
                                return {
                                  ...col,
                                  links: col.links.map((item, i) =>
                                    i === linkIndex ? { ...item, href: event.target.value } : item
                                  ),
                                };
                              });
                              onChange({ linkColumns: next });
                            }}
                            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-mono text-neutral-900"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = (footer.linkColumns ?? []).map((col, index) => {
                                if (index !== columnIndex) return col;
                                return {
                                  ...col,
                                  links: col.links.filter((_, i) => i !== linkIndex),
                                };
                              });
                              onChange({ linkColumns: next });
                            }}
                            className="rounded-xl px-2 text-xs font-semibold text-neutral-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const next = (footer.linkColumns ?? []).map((col, index) =>
                            index === columnIndex
                              ? {
                                  ...col,
                                  links: [
                                    ...col.links,
                                    createFooterLinkItem({ label: 'Link', href: '#' }),
                                  ],
                                }
                              : col
                          );
                          onChange({ linkColumns: next });
                        }}
                        className="text-xs font-semibold text-neutral-700 underline-offset-2 hover:underline"
                      >
                        + Add link
                      </button>
                      <p className="text-xs text-neutral-500">
                        Use <span className="font-mono">__profile__</span> for the creator’s
                        NoProbleme marketplace profile. Section anchors:{' '}
                        <span className="font-mono">#services</span>,{' '}
                        <span className="font-mono">#work</span>.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {footer.design === 'centered-minimal' ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Icons row
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Social profile links plus contact icons (email, phone, …) on the same centered row.
                </p>
              </div>
              <FooterToggleRow
                label="Social / website icons"
                description="Show profile social links as circular icons."
                checked={footer.showContactLinks}
                onChange={(showContactLinks) => onChange({ showContactLinks })}
              />
              <FooterToggleRow
                label="Email icon"
                checked={footer.showEmail}
                onChange={(showEmail) => onChange({ showEmail })}
              />
              <FooterToggleRow
                label="Phone icon"
                checked={footer.showPhone}
                onChange={(showPhone) => onChange({ showPhone })}
              />
              <FooterToggleRow
                label="Location icon"
                checked={footer.showLocation}
                onChange={(showLocation) => onChange({ showLocation })}
              />
              <FooterToggleRow
                label="Hours icon"
                checked={footer.showHours}
                onChange={(showHours) => onChange({ showHours })}
              />
              <FooterToggleRow
                label="Copyright"
                description="© year and creator name under the divider."
                checked={footer.showCopyright}
                onChange={(showCopyright) => onChange({ showCopyright })}
              />
            </div>
          ) : (
            <>
              <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Contact</p>
                <FooterToggleRow
                  label="Email"
                  checked={footer.showEmail}
                  onChange={(showEmail) => onChange({ showEmail })}
                />
                <FooterToggleRow
                  label="Phone"
                  checked={footer.showPhone}
                  onChange={(showPhone) => onChange({ showPhone })}
                />
                <FooterToggleRow
                  label="Location"
                  checked={footer.showLocation}
                  onChange={(showLocation) => onChange({ showLocation })}
                />
                <FooterToggleRow
                  label="Availability / hours"
                  checked={footer.showHours}
                  onChange={(showHours) => onChange({ showHours })}
                />
                <FooterToggleRow
                  label="Contact icons"
                  description="Phone, email, location, and clock glyphs beside each line."
                  checked={footer.showContactIcons !== false}
                  onChange={(showContactIcons) => onChange({ showContactIcons })}
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Links & credit</p>
                <FooterToggleRow
                  label="Social / contact links"
                  description="Website and social shortcuts under the brand."
                  checked={footer.showContactLinks}
                  onChange={(showContactLinks) => onChange({ showContactLinks })}
                />
                <FooterToggleRow
                  label="Copyright"
                  description="© year and creator name (customize the label under Typography → Meta line)."
                  checked={footer.showCopyright}
                  onChange={(showCopyright) => onChange({ showCopyright })}
                />
                <FooterToggleRow
                  label="Design credit"
                  description={
                    footer.design === 'landing' ||
                    footer.design === 'editorial' ||
                    footer.design === 'compact' ||
                    footer.design === 'minimal'
                      ? 'Not shown on this footer design.'
                      : '“Design by NoProbleme” line.'
                  }
                  checked={footer.showDesignCredit}
                  onChange={(showDesignCredit) => onChange({ showDesignCredit })}
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      {subSection === 'typography' ? (
        <div className="space-y-6">
          {footer.useHeroPalette ? (
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
              Palette is on — text and icon colors use Global tokens below. Pick a token, or turn off{' '}
              <span className="font-semibold">Use global color palette</span> for free hex colors.
            </p>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icons</p>
              <p className="mt-1 text-sm text-neutral-500">
                Contact-line glyphs (phone, email, pin, clock) and the Contact me envelope.
              </p>
            </div>
            <FooterToggleRow
              label="Show contact icons"
              description="Glyphs beside phone, email, location, and hours."
              checked={footer.showContactIcons !== false}
              onChange={(showContactIcons) => onChange({ showContactIcons })}
            />
            <FooterToggleRow
              label="Show Contact me icon"
              description="Envelope glyph inside the Contact me button."
              checked={footer.showCtaIcon !== false}
              onChange={(showCtaIcon) => onChange({ showCtaIcon })}
            />
            <FooterOptionGrid
              label="Contact icon size"
              options={PORTFOLIO_FOOTER_CONTACT_ICON_SIZE_OPTIONS}
              value={footer.contactIconSize ?? 'md'}
              onChange={(contactIconSize) => onChange({ contactIconSize })}
              columns={3}
            />
            <FooterPaletteColorField
              footer={footer}
              onChange={onChange}
              slot="icon"
              label="Icon color"
              value={footer.iconColor}
            />
          </div>

          <PortfolioElementStyleFields
            targets={PORTFOLIO_FOOTER_STYLE_TARGET_OPTIONS}
            activeTarget={styleTarget}
            onTargetChange={(value) => setStyleTarget(value as PortfolioFooterStyleTarget)}
            style={elementStyles[styleTarget]}
            showDarkColor={footer.useHeroPalette === false}
            onStyleChange={(patch) => {
              const nextStyles = patchFooterElementStyle(elementStyles, styleTarget, patch, footer);
              const slot = FOOTER_STYLE_TARGET_COLOR_SLOT[styleTarget];
              if (footer.useHeroPalette && patch.color) {
                onChange(
                  asFooterPatch({
                    elementStyles: nextStyles,
                    ...syncFooterLegacyTypographyFromElementStyles(nextStyles),
                    ...patchFooterColorField(footer, slot, patch.color),
                  })
                );
                return;
              }
              onChange({
                elementStyles: nextStyles,
                ...syncFooterLegacyTypographyFromElementStyles(nextStyles),
              });
            }}
            renderColorField={({ label, value }) => (
              <FooterPaletteColorField
                footer={footer}
                onChange={(patch) => {
                  if (patch.elementStyles) {
                    const next = normalizeFooterElementStyles(patch.elementStyles, {
                      ...footer,
                      ...patch,
                    });
                    onChange({
                      ...patch,
                      elementStyles: next,
                      ...syncFooterLegacyTypographyFromElementStyles(next),
                    });
                    return;
                  }
                  onChange(patch);
                }}
                slot={FOOTER_STYLE_TARGET_COLOR_SLOT[styleTarget]}
                label={label}
                value={value}
              />
            )}
            extra={
              styleTarget === 'meta' ? (
                <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                      Copyright label
                    </span>
                    <input
                      type="text"
                      value={footer.copyrightLabel ?? DEFAULT_FOOTER_COPYRIGHT_LABEL}
                      onChange={(event) => onChange({ copyrightLabel: event.target.value })}
                      placeholder={DEFAULT_FOOTER_COPYRIGHT_LABEL}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                    />
                  </label>
                  <p className="text-sm text-neutral-500">
                    Placeholders:{' '}
                    <span className="font-mono text-neutral-700">{'{year}'}</span>,{' '}
                    <span className="font-mono text-neutral-700">{'{name}'}</span>. Empty uses{' '}
                    <span className="font-mono text-neutral-700">{DEFAULT_FOOTER_COPYRIGHT_LABEL}</span>.
                  </p>
                  <FooterToggleRow
                    label="Show copyright"
                    description="Toggle the meta copyright line on the footer."
                    checked={footer.showCopyright}
                    onChange={(showCopyright) => onChange({ showCopyright })}
                  />
                </div>
              ) : styleTarget === 'marketplaceLink' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Marketplace arrow toggle stays under{' '}
                  <span className="font-semibold text-neutral-700">Content → Marketplace CTA</span>.
                </p>
              ) : styleTarget === 'ctaButton' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Button chrome stays under{' '}
                  <span className="font-semibold text-neutral-700">General → Contact CTA</span>. Envelope
                  icon is controlled in the Icons block above.
                </p>
              ) : null
            }
          />
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          {footer.useHeroPalette ? (
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
              Palette is on — background colors use Global tokens below. To pick a free hex, turn off{' '}
              <span className="font-semibold">Use global color palette</span> (General or Palette tab).
            </p>
          ) : null}
          <SectionBackgroundSettingsFields
            settings={footer}
            onChange={(patch) => {
              const next = { ...footer, ...patch };
              const shouldFlipPrimary =
                isFooterBackgroundLight(next) && footerColorLuminance(footer.primaryColor) > 0.85;
              onChange({
                ...patch,
                ...(shouldFlipPrimary
                  ? {
                      primaryColor: footerContrastingPrimary(next),
                      textColor: '#737373',
                      iconColor: '#525252',
                    }
                  : {}),
              });
            }}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              const slot = FOOTER_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return <FooterColorField label={label} value={value} onChange={onBgColorChange} />;
              }
              return (
                <FooterPaletteColorField
                  footer={footer}
                  onChange={onChange}
                  slot={slot}
                  label={label}
                  value={value}
                />
              );
            }}
          />
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Background pattern
            </p>
            <FooterOptionGrid
              label="Motif"
              options={PORTFOLIO_FOOTER_PATTERN_OPTIONS}
              value={footer.pattern}
              onChange={(pattern) => onChange({ pattern })}
              columns={2}
            />
            {footer.pattern !== 'none' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FooterPaletteColorField
                  footer={footer}
                  onChange={onChange}
                  slot="pattern"
                  label="Pattern color"
                  value={footer.patternColor}
                />
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                    Pattern opacity · {footer.patternOpacity}%
                  </span>
                  <input
                    type="range"
                    min={4}
                    max={60}
                    step={1}
                    value={footer.patternOpacity}
                    onChange={(event) => onChange({ patternOpacity: Number(event.target.value) })}
                    className="mt-3 w-full accent-neutral-900"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
