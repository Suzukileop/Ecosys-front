'use client';

import { useState } from 'react';
import {
  PORTFOLIO_ABOUT_FULL_WIDTH_PANEL_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_LAYOUT_MODE_OPTIONS,
  PORTFOLIO_ABOUT_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_ABOUT_ILLUSTRATION_OPTIONS,
  PORTFOLIO_ABOUT_ILLUSTRATION_PLACEMENT_OPTIONS,
  aboutSectionLayoutIsAside,
  PORTFOLIO_ABOUT_SIDE_PANEL_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_TWIN_ALIGN_OPTIONS,
  PORTFOLIO_ABOUT_TWIN_COLUMNS_SPLIT_OPTIONS,
  PORTFOLIO_ABOUT_CONTENT_PAIR_ALIGN_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_FULL_WIDTH_LAYOUT_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_CONTENT_GAP_OPTIONS,
  aboutSidePanelDesignOwnsLayout,
  ABOUT_SIDE_PANEL_CONTENT_GAP_PRESET_PX,
  ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN,
  ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX,
  clampAboutSidePanelContentGapPx,
  PORTFOLIO_ABOUT_STATS_DESIGN_OPTIONS,
  PORTFOLIO_ABOUT_STATS_GROUP_MODE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_ICON_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_LABEL_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_LABEL_TRACKING_OPTIONS,
  PORTFOLIO_ABOUT_STATS_LABEL_WEIGHT_OPTIONS,
  PORTFOLIO_ABOUT_STATS_VALUE_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_STATS_VALUE_WEIGHT_OPTIONS,
  PORTFOLIO_ABOUT_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_ABOUT_TITLE_PRESET_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_BODY_LAYOUT_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_GAP_OPTIONS,
  ABOUT_WHY_ME_GAP_PRESET_PX,
  ABOUT_WHY_ME_GAP_PX_MIN,
  ABOUT_WHY_ME_GAP_PX_MAX,
  clampAboutWhyMeGapPx,
  resolveWhyMeGapPx,
  PORTFOLIO_ABOUT_WHY_ME_HEADING_PRESET_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_HEADING_SIZE_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_DESIGN_OPTIONS,
  whyMeDesignSettingsPatch,
  PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS,
  PORTFOLIO_ABOUT_SIDE_PANEL_MARKER_STYLE_OPTIONS,
  PORTFOLIO_ABOUT_WHY_ME_MARKER_PLACEMENT_OPTIONS,
  ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX,
  PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS,
  patchAboutWhyMeFromCardFrame,
  aboutWhyMeToCardFrameSettings,
  aboutWhyMeCardDecorSettings,
  patchAboutSidePanelFromCardFrame,
  aboutSidePanelToCardFrameSettings,
  patchAboutElementStyle,
  type PortfolioAboutSectionSettings,
  type PortfolioAboutStyleTarget,
} from '@/components/portfolio/portfolio-about-settings';
import { PortfolioListMarkerSizeWeightControls } from '@/components/portfolio/PortfolioListMarkerSizeWeightControls';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  ABOUT_STYLE_TARGET_COLOR_SLOT,
  applyAboutPaletteToSettings,
  DEFAULT_ABOUT_COLOR_BINDINGS,
  DEFAULT_ABOUT_PALETTE,
  mergeAboutColorBindings,
  mergeAboutPalette,
  patchAboutColorBinding,
  patchAboutColorField,
  PORTFOLIO_ABOUT_COLOR_SLOT_OPTIONS,
  type AboutColorSlot,
} from '@/components/portfolio/portfolio-about-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  PortfolioCardFrameSettingsFields,
  type PortfolioCardFrameColorFieldKey,
} from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import {
  PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS,
  PORTFOLIO_ELEMENT_TEXT_WEIGHT_OPTIONS,
  type PortfolioElementTextSize,
  type PortfolioElementTextWeight,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS,
  servicesCardDecorShellStyle,
} from '@/components/portfolio/portfolio-services-card-decor-settings';

const ABOUT_BACKGROUND_LABEL_SLOTS: Record<string, AboutColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

const ABOUT_STATS_FRAME_SLOTS: Record<PortfolioCardFrameColorFieldKey, AboutColorSlot> = {
  cardBorderColor: 'cardBorder',
  cardBackgroundColor: 'cardBackground',
  cardBackgroundColorA: 'cardBackgroundA',
  cardBackgroundColorB: 'cardBackgroundB',
  cardDividerColor: 'cardDivider',
};

const ABOUT_SIDE_FRAME_SLOTS: Record<PortfolioCardFrameColorFieldKey, AboutColorSlot> = {
  cardBorderColor: 'sidePanelBorder',
  cardBackgroundColor: 'sidePanelBackground',
  cardBackgroundColorA: 'sidePanelBackgroundA',
  cardBackgroundColorB: 'sidePanelBackgroundB',
  cardDividerColor: 'sidePanelDivider',
};

const ABOUT_WHY_ME_FRAME_SLOTS: Record<PortfolioCardFrameColorFieldKey, AboutColorSlot> = {
  cardBorderColor: 'whyMeBorder',
  cardBackgroundColor: 'whyMeBackground',
  cardBackgroundColorA: 'whyMeBackgroundA',
  cardBackgroundColorB: 'whyMeBackgroundB',
  cardDividerColor: 'whyMeDivider',
};

export type AboutSubSection =
  | 'general'
  | 'header'
  | 'layout'
  | 'frame'
  | 'statsStyle'
  | 'sidePanel'
  | 'whyMe'
  | 'styleSide'
  | 'styleWhyMe'
  | 'content'
  | 'background'
  | 'palette';

const ABOUT_SUB_SECTIONS_ABOUT: { id: AboutSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility, stats toggle, and shared accent.' },
  { id: 'palette', label: 'Palette', description: 'Use the Global site palette and bind section colors to tokens.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  {
    id: 'layout',
    label: 'Layout',
    description: 'Page structure, twin columns, and stats row design.',
  },
  { id: 'frame', label: 'Cadre stats', description: 'Bordure, fond X/Y, arrondi et padding des cartes stats.' },
  {
    id: 'statsStyle',
    label: 'Style stats',
    description: 'Couleurs, polices, tailles et graisse des chiffres, libellés et icônes.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
];

const ABOUT_SUB_SECTIONS_INFOS: { id: AboutSubSection; label: string; description: string }[] = [
  {
    id: 'sidePanel',
    label: 'Design & contenu',
    description: 'Visibilité, design, puces et champs du panneau Infos.',
  },
  {
    id: 'styleSide',
    label: 'Style',
    description: 'Couleur, police, taille et graisse des lignes Infos.',
  },
];

const ABOUT_SUB_SECTIONS_WHY: { id: AboutSubSection; label: string; description: string }[] = [
  {
    id: 'whyMe',
    label: 'Design & contenu',
    description: 'Visibilité, designs, numérotation et titre Why choose me.',
  },
  {
    id: 'styleWhyMe',
    label: 'Style',
    description: 'Couleur, police, taille et graisse du corps et des puces.',
  },
];

const ABOUT_SUB_SECTIONS = [
  ...ABOUT_SUB_SECTIONS_ABOUT,
  ...ABOUT_SUB_SECTIONS_INFOS,
  ...ABOUT_SUB_SECTIONS_WHY,
];

export type AboutSettingsFocus = 'about' | 'infos' | 'whyChooseMe';

function aboutSubSectionsForFocus(focus: AboutSettingsFocus) {
  if (focus === 'infos') return ABOUT_SUB_SECTIONS_INFOS;
  if (focus === 'whyChooseMe') return ABOUT_SUB_SECTIONS_WHY;
  return ABOUT_SUB_SECTIONS_ABOUT;
}

function aboutFocusLabel(focus: AboutSettingsFocus): string {
  if (focus === 'infos') return 'Infos';
  if (focus === 'whyChooseMe') return 'Why choose me';
  return 'About';
}

/** Legacy saved UI id `style` → first typography subsection. */
export function normalizeAboutSubSection(
  value: string | undefined,
  focus: AboutSettingsFocus = 'about'
): AboutSubSection {
  const allowed = aboutSubSectionsForFocus(focus);
  if (value === 'style') {
    return focus === 'whyChooseMe' ? 'styleWhyMe' : focus === 'infos' ? 'styleSide' : 'styleSide';
  }
  if (allowed.some((section) => section.id === value)) return value as AboutSubSection;
  return allowed[0]?.id ?? 'header';
}

const ABOUT_SIDE_STYLE_TARGETS = PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS.filter((option) =>
  ['sideLabel', 'sideTitle', 'sideSubtitle'].includes(option.value)
);

const ABOUT_WHY_ME_STYLE_TARGETS = PORTFOLIO_ABOUT_STYLE_TARGET_OPTIONS.filter((option) =>
  ['whyMeBody', 'whyMeBullet'].includes(option.value)
);

function asAboutPatch(patch: Record<string, unknown> | object): Partial<PortfolioAboutSectionSettings> {
  return patch as Partial<PortfolioAboutSectionSettings>;
}

function AboutToggleRow({
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

function AboutOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T | '';
  onChange: (value: T) => void;
  columns?: number;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div
        className={`mt-3 grid gap-2 ${
          columns === 4
            ? 'grid-cols-2 sm:grid-cols-4'
            : columns === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : 'sm:grid-cols-2'
        }`}
      >
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

function AboutManualColorField({
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
        <span className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

function AboutColorField({
  about,
  onChange,
  slot,
  label,
  value,
}: {
  about: PortfolioAboutSectionSettings;
  onChange: (patch: Partial<PortfolioAboutSectionSettings>) => void;
  slot: AboutColorSlot;
  label: string;
  value: string;
}) {
  if (about.useHeroPalette === false) {
    return (
      <AboutManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asAboutPatch(patchAboutColorField(about, slot, hex)))}
      />
    );
  }

  const palette = mergeAboutPalette(DEFAULT_ABOUT_PALETTE, about.aboutPalette);
  const bindings = mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, about.aboutColorBindings);
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
            asAboutPatch(patchAboutColorBinding(about, slot, event.target.value as HeroPaletteTokenId))
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

function AboutPalettePanel({
  about,
  onChange,
}: {
  about: PortfolioAboutSectionSettings;
  onChange: (patch: Partial<PortfolioAboutSectionSettings>) => void;
}) {
  const palette = mergeAboutPalette(DEFAULT_ABOUT_PALETTE, about.aboutPalette);
  const bindings = mergeAboutColorBindings(DEFAULT_ABOUT_COLOR_BINDINGS, about.aboutColorBindings);
  const paletteOn = about.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <SectionHeroPaletteToggle
        enabled={paletteOn}
        onChange={(useHeroPalette) =>
          onChange(
            asAboutPatch(
              useHeroPalette
                ? { useHeroPalette, ...applyAboutPaletteToSettings(about) }
                : { useHeroPalette }
            )
          )
        }
        title="Use global color palette"
        description="When on, About colors follow the Global site palette. Turn off to edit colors manually in other tabs."
        enabledHint="Edit the dark/light token pair under Global → Theme. Bindings below pick which token each About color uses."
        disabledHint="Global palette tokens still exist, but About uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        The site color palette lives in <span className="font-semibold">Global → Theme</span> as a
        coupled dark / light pair. About no longer has its own Mode sombre / Mode clair editor.
      </p>

      {paletteOn ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Color bindings
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick which Global token each About color uses. Swatches preview the active mode.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_ABOUT_COLOR_SLOT_OPTIONS.map((slot) => (
              <div key={slot.value} className="rounded-2xl border border-neutral-200/80 bg-white px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-800">{slot.label}</span>
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-neutral-200"
                    style={{ backgroundColor: resolveHeroPaletteColor(palette, bindings[slot.value]) }}
                    aria-hidden
                  />
                </div>
                <select
                  value={bindings[slot.value]}
                  onChange={(event) =>
                    onChange(
                      asAboutPatch(
                        patchAboutColorBinding(about, slot.value, event.target.value as HeroPaletteTokenId)
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
                <p className="mt-1.5 text-xs text-neutral-500">{slot.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          Palette is off — slot bindings are hidden. Turn it back on to bind colors to Global tokens,
          or edit hex fields in other tabs.
        </p>
      )}
    </div>
  );
}

export function AboutSettingsPanel({
  about,
  onChange,
  settingsFocus = 'about',
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  about: PortfolioAboutSectionSettings;
  onChange: (patch: Partial<PortfolioAboutSectionSettings>) => void;
  settingsFocus?: AboutSettingsFocus;
  subSection?: AboutSubSection;
  onSubSectionChange?: (value: AboutSubSection) => void;
}) {
  const focusSubSections = aboutSubSectionsForFocus(settingsFocus);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<AboutSubSection>(
    focusSubSections[0]?.id ?? 'header'
  );
  const subSection = normalizeAboutSubSection(
    controlledSubSection ?? uncontrolledSubSection,
    settingsFocus
  );
  const setSubSection = (value: AboutSubSection) => {
    const next = normalizeAboutSubSection(value, settingsFocus);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const [sideStyleTarget, setSideStyleTarget] = useState<PortfolioAboutStyleTarget>('sideLabel');
  const [whyMeStyleTarget, setWhyMeStyleTarget] = useState<PortfolioAboutStyleTarget>('whyMeBody');
  const activeMeta =
    focusSubSections.find((section) => section.id === subSection) ?? focusSubSections[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            {aboutFocusLabel(settingsFocus)} subsection
          </p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta?.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as AboutSubSection)}
          className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:min-w-[12rem] sm:max-w-xs sm:flex-1"
        >
          {focusSubSections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-4">
          <AboutToggleRow
            label="Show section"
            description="Display the about block on your public portfolio."
            checked={about.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionHeroPaletteToggle
            enabled={about.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                asAboutPatch(
                  useHeroPalette
                    ? { useHeroPalette, ...applyAboutPaletteToSettings(about) }
                    : { useHeroPalette }
                )
              )
            }
          />
          <AboutToggleRow
            label="Afficher la section stats"
            description="Masque ou affiche la rangée Years / Content / Languages / Rating."
            checked={about.showStats}
            onChange={(showStats) => onChange({ showStats })}
          />
          {about.showStats ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Stats visibles</p>
              <AboutToggleRow label="Years" checked={about.showStatYears} onChange={(showStatYears) => onChange({ showStatYears })} />
              <AboutToggleRow label="Content" checked={about.showStatContent} onChange={(showStatContent) => onChange({ showStatContent })} />
              <AboutToggleRow label="Languages" checked={about.showStatLanguages} onChange={(showStatLanguages) => onChange({ showStatLanguages })} />
              <AboutToggleRow label="Rating" checked={about.showStatRating} onChange={(showStatRating) => onChange({ showStatRating })} />
            </div>
          ) : null}
          <AboutColorField
            about={about}
            onChange={onChange}
            slot="accent"
            label="Accent color"
            value={about.accentColor}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Infos et Why choose me sont des sections séparées dans le menu de gauche. Content is
            edited in Creator Studio → Information.
          </p>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Titre About
            </p>
            <p className="text-sm text-neutral-500">
              Indépendant d’Infos et de Why choose me — chacun a son propre titre.
            </p>
            <AboutToggleRow
              label="Afficher le titre About"
              checked={about.showAboutHeading !== false}
              onChange={(showAboutHeading) => onChange({ showAboutHeading })}
            />
          </div>

          <AboutOptionGrid
            label="Disposition titre / contenu"
            options={PORTFOLIO_ABOUT_SECTION_LAYOUT_OPTIONS}
            value={about.sectionLayout ?? 'stacked'}
            onChange={(sectionLayout) => onChange({ sectionLayout })}
            columns={1}
          />
          {aboutSectionLayoutIsAside(about.sectionLayout) ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              En côte à côte, le titre et le contenu s’affichent en deux colonnes sur grand écran
              (empilés sur mobile). Indépendant du mode de page (sidebar / twin-columns).
            </p>
          ) : null}

          <AboutOptionGrid
            label="Title preset"
            options={PORTFOLIO_ABOUT_TITLE_PRESET_OPTIONS}
            value={about.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
          />
          {about.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={about.titleCustom || about.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <AboutOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_ABOUT_SUBTITLE_PRESET_OPTIONS}
            value={about.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
          />
          {about.subtitlePreset === 'custom' || about.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={about.subtitlePreset === 'custom' ? about.subtitleCustom || about.subtitle : about.subtitle}
                onChange={(event) =>
                  onChange(
                    about.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutColorField about={about} onChange={onChange} slot="title" label="Title color" value={about.titleColor} />
            <AboutColorField
              about={about}
              onChange={onChange}
              slot="subtitle"
              label="Subtitle color"
              value={about.subtitleColor}
            />
          </div>

          {aboutSectionLayoutIsAside(about.sectionLayout) ? (
            <p className="text-sm text-neutral-500">
              Alignement du texte du titre : le titre est déjà placé{' '}
              {about.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} du contenu.
            </p>
          ) : (
            <AboutOptionGrid
              label="Header alignment"
              options={[
                { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
                { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
              ]}
              value={about.headerAlignment}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
            />
          )}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Illustration About</p>
              <p className="mt-1 text-sm text-neutral-500">
                SVG décoratif à côté du contenu. Choisissez un style, puis placez-le à gauche ou à
                droite sur grand écran.
              </p>
            </div>
            <AboutOptionGrid
              label="Style du SVG"
              options={PORTFOLIO_ABOUT_ILLUSTRATION_OPTIONS}
              value={about.illustrationVariant ?? 'none'}
              onChange={(illustrationVariant) => onChange({ illustrationVariant })}
              columns={2}
            />
            {(about.illustrationVariant ?? 'none') !== 'none' ? (
              <AboutOptionGrid
                label="Position du SVG"
                options={PORTFOLIO_ABOUT_ILLUSTRATION_PLACEMENT_OPTIONS}
                value={about.illustrationPlacement ?? 'right'}
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
                columns={2}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'layout' ? (
        <div className="space-y-6">
          <AboutOptionGrid
            label="Page layout"
            options={PORTFOLIO_ABOUT_LAYOUT_MODE_OPTIONS}
            value={about.layoutMode}
            onChange={(layoutMode) => onChange({ layoutMode })}
          />
          {about.layoutMode === 'full-width' && about.showSidePanel ? (
            <AboutOptionGrid
              label="Position du panneau Infos"
              options={PORTFOLIO_ABOUT_FULL_WIDTH_PANEL_PLACEMENT_OPTIONS}
              value={about.fullWidthPanelPlacement}
              onChange={(fullWidthPanelPlacement) => onChange({ fullWidthPanelPlacement })}
            />
          ) : null}
          {about.layoutMode === 'twin-columns' && about.showSidePanel ? (
            <>
              <AboutOptionGrid
                label="Répartition Why choose me / Infos"
                options={PORTFOLIO_ABOUT_TWIN_COLUMNS_SPLIT_OPTIONS}
                value={about.twinColumnsSplit ?? 'why-me-70'}
                onChange={(twinColumnsSplit) => onChange({ twinColumnsSplit })}
                columns={3}
              />
              <AboutOptionGrid
                label="Alignement du panneau Infos (grand écran)"
                options={PORTFOLIO_ABOUT_SIDE_PANEL_TWIN_ALIGN_OPTIONS}
                value={about.sidePanelTwinAlign ?? 'right'}
                onChange={(sidePanelTwinAlign) => onChange({ sidePanelTwinAlign })}
                columns={3}
              />
            </>
          ) : null}
          {about.layoutMode !== 'full-width' && about.showSidePanel ? (
            <AboutOptionGrid
              label="Position du duo Infos + Why choose me"
              options={PORTFOLIO_ABOUT_CONTENT_PAIR_ALIGN_OPTIONS}
              value={about.contentPairAlign ?? 'start'}
              onChange={(contentPairAlign) => onChange({ contentPairAlign })}
              columns={3}
            />
          ) : null}
          <AboutOptionGrid
            label="Design des stats"
            options={PORTFOLIO_ABOUT_STATS_DESIGN_OPTIONS}
            value={about.statsDesign}
            onChange={(statsDesign) => onChange({ statsDesign })}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Le design d’Infos se règle dans la section <span className="font-semibold">Infos</span> du
            menu. Why choose me a sa propre section dédiée.
          </p>
        </div>
      ) : null}

      {subSection === 'whyMe' ? (
        <div className="space-y-6">
          <AboutToggleRow
            label="Afficher Why choose me"
            description="Bloc Why choose me — indépendant du panneau Infos."
            checked={about.showWhyMe}
            onChange={(showWhyMe) => onChange({ showWhyMe })}
          />

          <AboutOptionGrid
            label="Design Why choose me"
            options={PORTFOLIO_ABOUT_WHY_ME_DESIGN_OPTIONS}
            value={about.whyMeDesign}
            onChange={(whyMeDesign) => onChange(whyMeDesignSettingsPatch(whyMeDesign))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Alignement du contenu"
              options={PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS}
              value={about.whyMeContentAlign}
              onChange={(whyMeContentAlign) => onChange({ whyMeContentAlign })}
              columns={2}
            />
            <AboutOptionGrid
              label="Disposition numéro / phrase"
              options={PORTFOLIO_ABOUT_WHY_ME_BODY_LAYOUT_OPTIONS}
              value={about.whyMeBodyLayout ?? 'stack'}
              onChange={(whyMeBodyLayout) => onChange({ whyMeBodyLayout })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <AboutOptionGrid
                label="Espacement entre blocs"
                options={PORTFOLIO_ABOUT_WHY_ME_GAP_OPTIONS}
                value={
                  about.whyMeGap === 'custom'
                    ? ('' as 'md')
                    : ((about.whyMeGap ?? 'md') as 'sm' | 'md' | 'lg')
                }
                onChange={(gap) =>
                  onChange({
                    whyMeGap: gap,
                    whyMeGapPx: ABOUT_WHY_ME_GAP_PRESET_PX[gap],
                  })
                }
                columns={2}
              />
              {about.whyMeGap === 'custom' ? (
                <p className="text-xs font-medium text-amber-700">
                  Mode manuel actif — choisis un preset ci-dessus pour quitter Manual.
                </p>
              ) : null}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Manuel (px)
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {resolveWhyMeGapPx(about)}px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Écart vertical entre chaque bloc — timeline, split, liste séparée et SVG + liste.
                </p>
                <input
                  type="range"
                  min={ABOUT_WHY_ME_GAP_PX_MIN}
                  max={ABOUT_WHY_ME_GAP_PX_MAX}
                  step={1}
                  value={clampAboutWhyMeGapPx(about.whyMeGapPx, resolveWhyMeGapPx(about))}
                  onChange={(event) => {
                    const px = clampAboutWhyMeGapPx(Number(event.target.value), 24);
                    onChange({ whyMeGap: 'custom', whyMeGapPx: px });
                  }}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Espacement manuel entre blocs en pixels"
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                  <span>{ABOUT_WHY_ME_GAP_PX_MIN}px</span>
                  <span>{ABOUT_WHY_ME_GAP_PX_MAX}px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Numérotation / puces</p>
              <p className="mt-1 text-sm text-neutral-500">
                Remplace 01–04 par des chiffres romains ou des puces hyper-style — en haut de carte ou
                devant chaque bloc.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Style du marqueur
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                {PORTFOLIO_ABOUT_WHY_ME_MARKER_STYLE_OPTIONS.map((option) => {
                  const active = about.whyMeMarkerStyle === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      title={`${option.label} — ${option.description}`}
                      onClick={() => onChange({ whyMeMarkerStyle: option.value })}
                      className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 transition ${
                        active
                          ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                          : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                      }`}
                    >
                      <span className="text-base font-semibold leading-none text-neutral-900">
                        {option.preview}
                      </span>
                      <span className="max-w-full truncate text-[10px] font-medium text-neutral-500">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {about.whyMeMarkerStyle !== 'none' ? (
              <>
                <AboutOptionGrid
                  label="Placement"
                  options={PORTFOLIO_ABOUT_WHY_ME_MARKER_PLACEMENT_OPTIONS}
                  value={about.whyMeMarkerPlacement}
                  onChange={(whyMeMarkerPlacement) => onChange({ whyMeMarkerPlacement })}
                  columns={2}
                />
                <PortfolioListMarkerSizeWeightControls
                  size={about.whyMeMarkerSize ?? 'md'}
                  sizePx={about.whyMeMarkerSizePx}
                  weight={about.whyMeMarkerWeight ?? 'regular'}
                  weightAmount={about.whyMeMarkerWeightAmount}
                  OptionGrid={AboutOptionGrid}
                  sizeLabel="Taille de la puce"
                  weightLabel="Graisse de la puce"
                  sizePresets={ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX}
                  onChange={(patch) =>
                    onChange({
                      ...(patch.size !== undefined ? { whyMeMarkerSize: patch.size } : null),
                      ...(patch.sizePx !== undefined ? { whyMeMarkerSizePx: patch.sizePx } : null),
                      ...(patch.weight !== undefined ? { whyMeMarkerWeight: patch.weight } : null),
                      ...(patch.weightAmount !== undefined
                        ? { whyMeMarkerWeightAmount: patch.weightAmount }
                        : null),
                    })
                  }
                />
                <AboutManualColorField
                  label="Couleur de la puce"
                  value={about.whyMeMarkerColor}
                  onChange={(whyMeMarkerColor) => onChange({ whyMeMarkerColor })}
                />
              </>
            ) : null}

            <AboutToggleRow
              label="Icône et filet"
              description="Pastille d’icône juste après la puce / le numéro (sans ligne décorative)."
              checked={about.whyMeShowHeaderAccent}
              onChange={(whyMeShowHeaderAccent) => onChange({ whyMeShowHeaderAccent })}
            />

            <AboutToggleRow
              label="Fond des cartes"
              description="Affiche ou masque le fond derrière chaque bloc Why me."
              checked={about.whyMeBackgroundEnabled}
              onChange={(whyMeBackgroundEnabled) => onChange({ whyMeBackgroundEnabled })}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Titre Why choose me
            </p>
            <p className="text-sm text-neutral-500">
              Titre propre à Why choose me — séparé du titre About et d’Infos.
            </p>
            <AboutToggleRow
              label="Afficher le titre"
              checked={about.showWhyMeHeading}
              onChange={(showWhyMeHeading) => onChange({ showWhyMeHeading })}
            />
            {about.showWhyMeHeading ? (
              <>
                <AboutOptionGrid
                  label="Preset du titre"
                  options={PORTFOLIO_ABOUT_WHY_ME_HEADING_PRESET_OPTIONS}
                  value={about.whyMeHeadingPreset}
                  onChange={(whyMeHeadingPreset) => onChange({ whyMeHeadingPreset })}
                />
                {about.whyMeHeadingPreset === 'default' || about.whyMeHeadingPreset === 'custom' ? (
                  <input
                    type="text"
                    value={
                      about.whyMeHeadingPreset === 'custom'
                        ? about.whyMeHeadingCustom || about.whyMeHeading
                        : about.whyMeHeading
                    }
                    onChange={(event) =>
                      onChange(
                        about.whyMeHeadingPreset === 'custom'
                          ? { whyMeHeadingCustom: event.target.value, whyMeHeading: event.target.value }
                          : { whyMeHeading: event.target.value }
                      )
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <AboutOptionGrid
                    label="Alignement titre"
                    options={PORTFOLIO_ABOUT_WHY_ME_CONTENT_ALIGN_OPTIONS}
                    value={about.whyMeHeadingAlignment}
                    onChange={(whyMeHeadingAlignment) => onChange({ whyMeHeadingAlignment })}
                    columns={2}
                  />
                  <AboutOptionGrid
                    label="Taille titre"
                    options={PORTFOLIO_ABOUT_WHY_ME_HEADING_SIZE_OPTIONS.map((option) => ({
                      ...option,
                      description: '',
                    }))}
                    value={about.whyMeHeadingSize}
                    onChange={(whyMeHeadingSize) => onChange({ whyMeHeadingSize })}
                    columns={3}
                  />
                </div>
                <AboutColorField
                  about={about}
                  onChange={onChange}
                  slot="whyMeHeading"
                  label="Couleur du titre"
                  value={about.whyMeHeadingColor}
                />
                <AboutToggleRow
                  label="Titre en majuscules"
                  checked={about.whyMeHeadingUppercase}
                  onChange={(whyMeHeadingUppercase) => onChange({ whyMeHeadingUppercase })}
                />
              </>
            ) : null}
          </div>

          <PortfolioCardFrameSettingsFields
            settings={aboutWhyMeToCardFrameSettings(about)}
            onChange={(patch) => onChange(patchAboutWhyMeFromCardFrame(patch))}
            heading="Cadre des blocs"
            description="Bordure, fond uni ou divisé X/Y, arrondi et padding pour chaque bloc Why me."
            renderColorField={({ field, label, value }) => (
              <AboutColorField
                about={about}
                onChange={onChange}
                slot={ABOUT_WHY_ME_FRAME_SLOTS[field]}
                label={label}
                value={value}
              />
            )}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Décor géométrique</p>
              <p className="mt-1 text-sm text-neutral-500">
                Teinte ou forme placée librement dans le cadre — redimensionnable, avec séquence
                d’apparition optionnelle.
              </p>
            </div>

            <AboutToggleRow
              label="Activer le décor"
              description="Affiche une forme ou teinte décorative derrière le contenu du bloc."
              checked={about.whyMeDecorEnabled}
              onChange={(whyMeDecorEnabled) => onChange({ whyMeDecorEnabled })}
            />

            {about.whyMeDecorEnabled ? (
              <>
                <AboutOptionGrid
                  label="Forme"
                  options={PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS}
                  value={about.whyMeDecorShape}
                  onChange={(whyMeDecorShape) => onChange({ whyMeDecorShape })}
                  columns={2}
                />

                <AboutColorField
                  about={about}
                  onChange={onChange}
                  slot="whyMeDecor"
                  label="Couleur / teinte"
                  value={about.whyMeDecorColor}
                />

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Opacité
                    </p>
                    <span className="text-xs font-semibold text-neutral-600">
                      {about.whyMeDecorOpacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={1}
                    value={about.whyMeDecorOpacity}
                    onChange={(event) => onChange({ whyMeDecorOpacity: Number(event.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Taille
                    </p>
                    <span className="text-xs font-semibold text-neutral-600">
                      {about.whyMeDecorSize}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={160}
                    step={1}
                    value={about.whyMeDecorSize}
                    onChange={(event) => onChange({ whyMeDecorSize: Number(event.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Position X
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {about.whyMeDecorX}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={about.whyMeDecorX}
                      onChange={(event) => onChange({ whyMeDecorX: Number(event.target.value) })}
                      className="w-full accent-neutral-900"
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Position Y
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {about.whyMeDecorY}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={about.whyMeDecorY}
                      onChange={(event) => onChange({ whyMeDecorY: Number(event.target.value) })}
                      className="w-full accent-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Rotation
                    </p>
                    <span className="text-xs font-semibold text-neutral-600">
                      {about.whyMeDecorRotation}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={1}
                    value={about.whyMeDecorRotation}
                    onChange={(event) => onChange({ whyMeDecorRotation: Number(event.target.value) })}
                    className="w-full accent-neutral-900"
                  />
                </div>

                <AboutOptionGrid
                  label="Séquence d’alternance"
                  options={PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS}
                  value={about.whyMeDecorAlternation}
                  onChange={(whyMeDecorAlternation) => onChange({ whyMeDecorAlternation })}
                  columns={2}
                />

                <div className="relative h-28 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <div
                    className="absolute inset-0"
                    style={servicesCardDecorShellStyle(aboutWhyMeCardDecorSettings(about))}
                    aria-hidden
                  />
                  <p className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                    Aperçu position
                  </p>
                </div>
              </>
            ) : null}
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Texte de la liste</p>
              <p className="mt-1 text-sm text-neutral-500">
                Taille et graisse du texte Why work with me (paragraphes et lignes à puces).
              </p>
            </div>
            <AboutOptionGrid
              label="Taille"
              options={PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS}
              value={about.elementStyles.whyMeBody.size}
              onChange={(size: PortfolioElementTextSize) => {
                let next = patchAboutElementStyle(about.elementStyles, 'whyMeBody', { size });
                next = patchAboutElementStyle(next, 'whyMeBullet', { size });
                onChange({ elementStyles: next });
              }}
              columns={2}
            />
            <AboutOptionGrid
              label="Graisse"
              options={PORTFOLIO_ELEMENT_TEXT_WEIGHT_OPTIONS}
              value={
                about.elementStyles.whyMeBody.weight ??
                (about.elementStyles.whyMeBody.bold ? 'bold' : 'normal')
              }
              onChange={(weight: PortfolioElementTextWeight) => {
                const patch = {
                  weight,
                  bold: weight === 'bold' || weight === 'semibold',
                };
                let next = patchAboutElementStyle(about.elementStyles, 'whyMeBody', patch);
                next = patchAboutElementStyle(next, 'whyMeBullet', patch);
                onChange({ elementStyles: next });
              }}
              columns={2}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <div className="space-y-6">
          <p className="text-sm text-neutral-500">
            Cadre et fond des cartes stats — bande unifiée, stat en vedette ou liste éditoriale.
          </p>

          {about.statsDesign === 'unified-band' ? (
            <AboutOptionGrid
              label="Disposition des stats"
              options={PORTFOLIO_ABOUT_STATS_GROUP_MODE_OPTIONS}
              value={about.statsGroupMode}
              onChange={(statsGroupMode) => onChange({ statsGroupMode })}
            />
          ) : null}

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Espacement entre les cadres
              </p>
              <span className="text-sm font-semibold text-neutral-700">{about.statsGap}px</span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Marge entre chaque cadre stat — horizontal et vertical.
            </p>
            <input
              type="range"
              min={0}
              max={48}
              step={2}
              value={about.statsGap}
              onChange={(event) => onChange({ statsGap: Number(event.target.value) })}
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Espacement entre les cadres stats"
            />
          </div>

          <PortfolioCardFrameSettingsFields
            settings={about}
            onChange={onChange}
            heading="Cadre des stats"
            description="Bordure, fond uni ou divisé X/Y, arrondi et padding pour chaque carte stat."
            renderColorField={({ field, label, value }) => (
              <AboutColorField
                about={about}
                onChange={onChange}
                slot={ABOUT_STATS_FRAME_SLOTS[field]}
                label={label}
                value={value}
              />
            )}
          />
        </div>
      ) : null}

      {subSection === 'statsStyle' ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <AboutColorField
              about={about}
              onChange={onChange}
              slot="statsValue"
              label="Couleur des chiffres"
              value={about.statsValueColor}
            />
            <AboutColorField
              about={about}
              onChange={onChange}
              slot="statsLabel"
              label="Couleur des libellés"
              value={about.statsLabelColor}
            />
            <AboutColorField
              about={about}
              onChange={onChange}
              slot="statsIcon"
              label="Couleur des icônes"
              value={about.statsIconColor}
            />
          </div>

          <AboutToggleRow
            label="Accent sur le rating"
            description="Colorer la note / rating avec la couleur accent de la section."
            checked={about.statsUseAccentForRating}
            onChange={(statsUseAccentForRating) => onChange({ statsUseAccentForRating })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Taille des chiffres"
              options={PORTFOLIO_ABOUT_STATS_VALUE_SIZE_OPTIONS}
              value={about.statsValueSize}
              onChange={(statsValueSize) => onChange({ statsValueSize })}
              columns={2}
            />
            <AboutOptionGrid
              label="Taille des libellés"
              options={PORTFOLIO_ABOUT_STATS_LABEL_SIZE_OPTIONS}
              value={about.statsLabelSize}
              onChange={(statsLabelSize) => onChange({ statsLabelSize })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutOptionGrid
              label="Graisse des chiffres"
              options={PORTFOLIO_ABOUT_STATS_VALUE_WEIGHT_OPTIONS.map((option) => ({
                ...option,
                description: '',
              }))}
              value={about.statsValueWeight}
              onChange={(statsValueWeight) => onChange({ statsValueWeight })}
              columns={2}
            />
            <AboutOptionGrid
              label="Graisse des libellés"
              options={PORTFOLIO_ABOUT_STATS_LABEL_WEIGHT_OPTIONS.map((option) => ({
                ...option,
                description: '',
              }))}
              value={about.statsLabelWeight}
              onChange={(statsLabelWeight) => onChange({ statsLabelWeight })}
              columns={2}
            />
          </div>

          <AboutOptionGrid
            label="Espacement des libellés"
            options={PORTFOLIO_ABOUT_STATS_LABEL_TRACKING_OPTIONS}
            value={about.statsLabelTracking}
            onChange={(statsLabelTracking) => onChange({ statsLabelTracking })}
            columns={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <AboutToggleRow
              label="Centrage automatique"
              description="Centre les chiffres quand la rangée est incomplète."
              checked={about.statsAutoCenter}
              onChange={(statsAutoCenter) => onChange({ statsAutoCenter })}
            />
            <AboutToggleRow
              label="Libellés en majuscules"
              description="YEARS, CONTENT… — désactiver pour un style phrase."
              checked={about.statsLabelUppercase}
              onChange={(statsLabelUppercase) => onChange({ statsLabelUppercase })}
            />
          </div>
          <AboutOptionGrid
            label="Taille des icônes"
            options={PORTFOLIO_ABOUT_STATS_ICON_SIZE_OPTIONS.map((option) => ({
              ...option,
              description: '',
            }))}
            value={about.statsIconSize}
            onChange={(statsIconSize) => onChange({ statsIconSize })}
            columns={3}
          />
        </div>
      ) : null}

      {subSection === 'sidePanel' ? (
        <div className="space-y-6">
          <AboutToggleRow
            label="Afficher Infos"
            description="Panneau Infos (location, langues, disponibilité…) — indépendant de Why choose me."
            checked={about.showSidePanel}
            onChange={(showSidePanel) => onChange({ showSidePanel })}
          />

          <AboutOptionGrid
            label="Design Infos"
            options={PORTFOLIO_ABOUT_SIDE_PANEL_DESIGN_OPTIONS}
            value={about.sidePanelDesign}
            onChange={(sidePanelDesign) => onChange({ sidePanelDesign })}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Titre Infos
            </p>
            <p className="text-sm text-neutral-500">
              Titre propre au panneau Infos — séparé du titre About et de Why choose me.
            </p>
            <AboutToggleRow
              label="Afficher le titre Infos"
              checked={about.showSidePanelHeading !== false}
              onChange={(showSidePanelHeading) => onChange({ showSidePanelHeading })}
            />
            {about.showSidePanelHeading !== false ? (
              <>
                <input
                  type="text"
                  value={about.sidePanelHeading}
                  onChange={(event) => onChange({ sidePanelHeading: event.target.value })}
                  placeholder="Infos"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  aria-label="Titre Infos"
                />
                <AboutColorField
                  about={about}
                  onChange={onChange}
                  slot="sidePanelHeading"
                  label="Couleur du titre Infos"
                  value={about.sidePanelHeadingColor}
                />
              </>
            ) : null}
          </div>

          {about.layoutMode === 'full-width' &&
          !aboutSidePanelDesignOwnsLayout(about.sidePanelDesign) ? (
            <AboutOptionGrid
              label="Disposition pleine largeur"
              options={PORTFOLIO_ABOUT_SIDE_PANEL_FULL_WIDTH_LAYOUT_OPTIONS}
              value={about.sidePanelFullWidthLayout}
              onChange={(sidePanelFullWidthLayout) => onChange({ sidePanelFullWidthLayout })}
            />
          ) : null}

          {about.sidePanelDesign === 'profile-cv' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Bio / philosophie</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Optionnel, au-dessus de la grille 4 cartes (Profil CV).
                </p>
              </div>
              <AboutToggleRow
                label="Afficher la bio"
                checked={about.showSidePanelBio}
                onChange={(showSidePanelBio) => onChange({ showSidePanelBio })}
              />
              {about.showSidePanelBio ? (
                <textarea
                  rows={4}
                  value={about.sidePanelBio}
                  onChange={(event) => onChange({ sidePanelBio: event.target.value })}
                  placeholder="Je conçois avec intention — du code clair, pensé pour les humains."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  aria-label="Bio du panneau profil CV"
                />
              ) : null}
            </div>
          ) : null}
          {about.sidePanelDesign === 'list' || about.layoutMode === 'twin-columns' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Liste à puces</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Marqueurs pour Infos uniquement — le titre se règle plus haut.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Style du marqueur
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {PORTFOLIO_ABOUT_SIDE_PANEL_MARKER_STYLE_OPTIONS.map((option) => {
                    const active = about.sidePanelMarkerStyle === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        title={`${option.label} — ${option.description}`}
                        onClick={() => onChange({ sidePanelMarkerStyle: option.value })}
                        className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 transition ${
                          active
                            ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                            : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                        }`}
                      >
                        <span className="text-base font-semibold leading-none text-neutral-900">
                          {option.preview}
                        </span>
                        <span className="max-w-full truncate text-[10px] font-medium text-neutral-500">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {about.sidePanelMarkerStyle !== 'none' ? (
                <>
                  <PortfolioListMarkerSizeWeightControls
                    size={about.sidePanelMarkerSize ?? 'md'}
                    sizePx={about.sidePanelMarkerSizePx}
                    weight={about.sidePanelMarkerWeight ?? 'regular'}
                    weightAmount={about.sidePanelMarkerWeightAmount}
                    OptionGrid={AboutOptionGrid}
                    sizeLabel="Taille de la puce"
                    weightLabel="Graisse de la puce"
                    sizePresets={ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX}
                    onChange={(patch) =>
                      onChange({
                        ...(patch.size !== undefined ? { sidePanelMarkerSize: patch.size } : null),
                        ...(patch.sizePx !== undefined
                          ? { sidePanelMarkerSizePx: patch.sizePx }
                          : null),
                        ...(patch.weight !== undefined
                          ? { sidePanelMarkerWeight: patch.weight }
                          : null),
                        ...(patch.weightAmount !== undefined
                          ? { sidePanelMarkerWeightAmount: patch.weightAmount }
                          : null),
                      })
                    }
                  />
                  <AboutManualColorField
                    label="Couleur de la puce"
                    value={about.sidePanelMarkerColor}
                    onChange={(sidePanelMarkerColor) => onChange({ sidePanelMarkerColor })}
                  />
                </>
              ) : null}
            </div>
          ) : null}

          {about.sidePanelDesign !== 'list' ? (
            <>
              <AboutToggleRow
                label="Afficher les icônes"
                description="Masque les pastilles d’icône dans le panneau d’informations."
                checked={about.sidePanelShowIcons}
                onChange={(sidePanelShowIcons) => onChange({ sidePanelShowIcons })}
              />
              {about.sidePanelShowIcons &&
              about.sidePanelDesign !== 'info-strip' &&
              about.sidePanelDesign !== 'profile-cv' ? (
                <AboutOptionGrid
                  label="Emplacement de l’icône"
                  options={PORTFOLIO_ABOUT_SIDE_PANEL_ICON_PLACEMENT_OPTIONS}
                  value={about.sidePanelIconPlacement}
                  onChange={(sidePanelIconPlacement) => onChange({ sidePanelIconPlacement })}
                  columns={2}
                />
              ) : null}
            </>
          ) : null}

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Infos visibles</p>
            <AboutToggleRow
              label="Location"
              checked={about.showSidePanelLocation}
              onChange={(showSidePanelLocation) => onChange({ showSidePanelLocation })}
            />
            <AboutToggleRow
              label="Languages"
              checked={about.showSidePanelLanguages}
              onChange={(showSidePanelLanguages) => onChange({ showSidePanelLanguages })}
            />
            {about.sidePanelDesign === 'profile-cv' ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500">
                Gender est masqué en Profil CV pour garder une grille à 4 cartes égales.
              </p>
            ) : (
              <AboutToggleRow
                label="Gender"
                checked={about.showSidePanelGender}
                onChange={(showSidePanelGender) => onChange({ showSidePanelGender })}
              />
            )}
            <AboutToggleRow
              label="Member since"
              checked={about.showSidePanelMemberSince}
              onChange={(showSidePanelMemberSince) => onChange({ showSidePanelMemberSince })}
            />
            <AboutToggleRow
              label="Availability"
              checked={about.showSidePanelAvailability}
              onChange={(showSidePanelAvailability) => onChange({ showSidePanelAvailability })}
            />
            <AboutToggleRow
              label="Temps de réponse"
              description="Ligne « Reply… » sous la disponibilité."
              checked={about.showSidePanelResponseTime}
              onChange={(showSidePanelResponseTime) => onChange({ showSidePanelResponseTime })}
            />
          </div>

          <AboutToggleRow
            label="Centrage automatique des cadres"
            description="Centre le panneau ou les cartes quand la grille est incomplète."
            checked={about.sidePanelAutoCenter}
            onChange={(sidePanelAutoCenter) => onChange({ sidePanelAutoCenter })}
          />

          {about.sidePanelDesign !== 'info-strip' && about.sidePanelDesign !== 'profile-cv' ? (
          <div className="space-y-3 border-t border-neutral-200/80 pt-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Vertical spacing — presets
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Espacement entre location, langues, disponibilité… dans le panneau. Choisissez un
                preset, ou Manual pour une valeur exacte en px.
              </p>
            </div>
            <AboutOptionGrid
              label="Presets"
              options={PORTFOLIO_ABOUT_SIDE_PANEL_CONTENT_GAP_OPTIONS}
              value={
                about.sidePanelContentGap === 'custom'
                  ? ('' as 'md')
                  : ((about.sidePanelContentGap ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'xl')
              }
              onChange={(gap) =>
                onChange({
                  sidePanelContentGap: gap,
                  sidePanelContentGapPx: ABOUT_SIDE_PANEL_CONTENT_GAP_PRESET_PX[gap],
                })
              }
              columns={3}
            />
            {about.sidePanelContentGap === 'custom' ? (
              <p className="text-xs font-medium text-amber-700">
                Manual mode active — no preset selected. Choose a preset above to leave Manual.
              </p>
            ) : null}
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Manual (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampAboutSidePanelContentGapPx(about.sidePanelContentGapPx, 32)}px
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500">
                Gap exact entre chaque info du panneau profil.
              </p>
              <input
                type="range"
                min={ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN}
                max={ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX}
                step={1}
                value={clampAboutSidePanelContentGapPx(about.sidePanelContentGapPx, 32)}
                onChange={(event) => {
                  const px = clampAboutSidePanelContentGapPx(Number(event.target.value), 32);
                  onChange({ sidePanelContentGap: 'custom', sidePanelContentGapPx: px });
                }}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Manual vertical spacing in pixels"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MIN}px</span>
                <span>{ABOUT_SIDE_PANEL_CONTENT_GAP_PX_MAX}px</span>
              </div>
            </div>
          </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              {about.sidePanelDesign === 'info-strip'
                ? 'Ligne d’infos : disposition horizontale fixe — l’espacement vertical classique ne s’applique pas.'
                : 'Profil CV : bio + badges — l’espacement vertical classique ne s’applique pas.'}
            </p>
          )}

          <p className="text-sm text-neutral-500">
            Cadre et fond du panneau profil (location, langues, disponibilité…). En pleine largeur, combinez avec
            une disposition ergonomique dans Layout.
          </p>
          <PortfolioCardFrameSettingsFields
            settings={aboutSidePanelToCardFrameSettings(about)}
            onChange={(patch) => onChange(patchAboutSidePanelFromCardFrame(patch))}
            heading="Cadre du panneau profil"
            description="Bordure, fond uni ou divisé X/Y, arrondi et padding — même logique que les stats."
            renderColorField={({ field, label, value }) => (
              <AboutColorField
                about={about}
                onChange={onChange}
                slot={ABOUT_SIDE_FRAME_SLOTS[field]}
                label={label}
                value={value}
              />
            )}
          />
        </div>
      ) : null}

      {subSection === 'palette' ? <AboutPalettePanel about={about} onChange={onChange} /> : null}

      {subSection === 'styleSide' ? (
        <PortfolioElementStyleFields
          targets={ABOUT_SIDE_STYLE_TARGETS}
          activeTarget={sideStyleTarget}
          onTargetChange={(value) => setSideStyleTarget(value as PortfolioAboutStyleTarget)}
          style={about.elementStyles[sideStyleTarget]}
          onStyleChange={(patch) => {
            const next = patchAboutElementStyle(about.elementStyles, sideStyleTarget, patch);
            const slot = ABOUT_STYLE_TARGET_COLOR_SLOT[sideStyleTarget];
            onChange(
              asAboutPatch(
                about.useHeroPalette !== false && patch.color
                  ? { elementStyles: next, ...patchAboutColorField(about, slot, patch.color) }
                  : { elementStyles: next }
              )
            );
          }}
          renderColorField={({ label, value }) => (
            <AboutColorField
              about={about}
              onChange={onChange}
              slot={ABOUT_STYLE_TARGET_COLOR_SLOT[sideStyleTarget]}
              label={label}
              value={value}
            />
          )}
        />
      ) : null}

      {subSection === 'styleWhyMe' ? (
        <PortfolioElementStyleFields
          targets={ABOUT_WHY_ME_STYLE_TARGETS}
          activeTarget={whyMeStyleTarget}
          onTargetChange={(value) => setWhyMeStyleTarget(value as PortfolioAboutStyleTarget)}
          style={about.elementStyles[whyMeStyleTarget]}
          onStyleChange={(patch) => {
            const next = patchAboutElementStyle(about.elementStyles, whyMeStyleTarget, patch);
            const slot = ABOUT_STYLE_TARGET_COLOR_SLOT[whyMeStyleTarget];
            onChange(
              asAboutPatch(
                about.useHeroPalette !== false && patch.color
                  ? { elementStyles: next, ...patchAboutColorField(about, slot, patch.color) }
                  : { elementStyles: next }
              )
            );
          }}
          showDarkColor={about.useHeroPalette === false}
          renderColorField={({ label, value }) => (
            <AboutColorField
              about={about}
              onChange={onChange}
              slot={ABOUT_STYLE_TARGET_COLOR_SLOT[whyMeStyleTarget]}
              label={label}
              value={value}
            />
          )}
        />
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-4">
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Visibilité Infos → section <span className="font-semibold">Infos</span>. Visibilité Why
            choose me → section <span className="font-semibold">Why choose me</span>.
          </p>
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields
          settings={about}
          onChange={onChange}
          renderColorField={({ label, value, onChange: onBgColorChange }) => {
            const slot = ABOUT_BACKGROUND_LABEL_SLOTS[label];
            if (!slot) {
              return (
                <AboutManualColorField label={label} value={value} onChange={onBgColorChange} />
              );
            }
            return (
              <AboutColorField
                about={about}
                onChange={onChange}
                slot={slot}
                label={label}
                value={value}
              />
            );
          }}
        />
      ) : null}
    </div>
  );
}
