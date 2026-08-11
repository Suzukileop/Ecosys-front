'use client';

import { useState, type ReactNode } from 'react';
import {
  PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS,
  PORTFOLIO_SERVICES_CARD_BACKGROUND_ALTERNATION_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DESIGN_INTENSITY_HINTS,
  PORTFOLIO_SERVICES_CARD_DESIGN_TINT_HINTS,
  PORTFOLIO_SERVICES_CARD_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS,
  PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_CARD_MAX_WIDTH_OPTIONS,
  PORTFOLIO_SERVICES_CARD_ALIGNMENT_OPTIONS,
  PORTFOLIO_SKILLS_INSPECTOR_MAX_WIDTH_OPTIONS,
  PORTFOLIO_SKILLS_INSPECTOR_ALIGNMENT_OPTIONS,
  PORTFOLIO_SERVICES_COLUMNS_OPTIONS,
  PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_SERVICES_CONTENT_GAP_OPTIONS,
  SERVICES_CONTENT_GAP_PRESET_PX,
  SERVICES_CONTENT_GAP_PX_MAX,
  SERVICES_CONTENT_GAP_PX_MIN,
  clampServicesContentGapPx,
  PORTFOLIO_SERVICES_CTA_ALIGNMENT_OPTIONS,
  PORTFOLIO_SERVICES_CTA_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_CTA_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_SERVICES_CTA_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_CTA_ICON_OPTIONS,
  PORTFOLIO_SERVICES_CTA_ICON_POSITION_OPTIONS,
  PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS,
  PORTFOLIO_SERVICES_MARQUEE_DIRECTION_OPTIONS,
  PORTFOLIO_SERVICES_DECK_ENTRANCE_EFFECT_OPTIONS,
  PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS,
  PORTFOLIO_SKILLS_GALLERY_LAYOUT_OPTIONS,
  PORTFOLIO_SERVICES_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_SKILLS_INSPECTOR_ILLUSTRATION_OPTIONS,
  PORTFOLIO_SKILLS_INSPECTOR_ILLUSTRATION_PLACEMENT_OPTIONS,
  PORTFOLIO_SERVICES_ILLUSTRATION_OPTIONS,
  PORTFOLIO_SERVICES_ILLUSTRATION_PLACEMENT_OPTIONS,
  servicesSectionLayoutIsAside,
  SKILLS_INSPECTOR_ICON_GAP_PX_MIN,
  SKILLS_INSPECTOR_ICON_GAP_PX_MAX,
  clampSkillsInspectorIconGapPx,
  PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS,
  PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS,
  PORTFOLIO_SKILLS_ICON_RADIUS_OPTIONS,
  SKILLS_ICON_BORDER_WIDTH_PX_MIN,
  SKILLS_ICON_BORDER_WIDTH_PX_MAX,
  clampSkillsIconBorderWidthPx,
  PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS,
  PORTFOLIO_SERVICES_PRICE_ALIGN_OPTIONS,
  PORTFOLIO_SERVICES_CURRENCY_OPTIONS,
  PORTFOLIO_SERVICES_CURRENCY_PLACEMENT_OPTIONS,
  SERVICE_PRICE_MARGIN_PX_MIN,
  SERVICE_PRICE_MARGIN_PX_MAX,
  clampServicePriceMarginPx,
  PORTFOLIO_SERVICES_STAGE_BORDER_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_CORNERS_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_DESIGN_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_PADDING_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_PATTERN_OPTIONS,
  PORTFOLIO_SERVICES_STAGE_RADIUS_OPTIONS,
  PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS,
  PORTFOLIO_SERVICES_TASK_BULLET_STYLE_OPTIONS,
  resolveServicesTaskBulletSource,
  PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SKILLS_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_SERVICES_DISTINCT_SKILLS_TITLE_PRESET_OPTIONS,
  normalizeServicesElementStyles,
  patchServicesElementStyle,
  patchServicesElementChrome,
  DEFAULT_SERVICES_ELEMENT_CHROMES,
  PORTFOLIO_SERVICES_CARD_TEXT_CONTRAST_OPTIONS,
  DEFAULT_SERVICES_CARD_INK_STRONG_A,
  DEFAULT_SERVICES_CARD_INK_MUTED_A,
  DEFAULT_SERVICES_CARD_INK_STRONG_B,
  DEFAULT_SERVICES_CARD_INK_MUTED_B,
  servicesCardDesignIntensityStyle,
  servicesCardDesignOwnsBackground,
  servicesCardDesignSupportsTint,
  servicesMarqueeActiveFor,
  servicesCoverflowActiveFor,
  servicesDeckActiveFor,
  servicesDisplayModeNeedsCardLayout,
  servicesDisplayModeSettingsPatch,
  servicesGalleryLayoutSettingsPatch,
  stageChromePresetForDesign,
  type PortfolioServicesCardDesign,
  type PortfolioServicesCardDesignIntensities,
  type PortfolioServicesCardDesignTints,
  type PortfolioServicesElementChromeId,
  type PortfolioServicesSectionSettings,
  type PortfolioServicesStyleTarget,
} from '@/components/portfolio/portfolio-services-settings';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { PortfolioListMarkerSizeWeightControls } from '@/components/portfolio/PortfolioListMarkerSizeWeightControls';
import { PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS } from '@/components/portfolio/portfolio-element-text-style';
import {
  PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS,
  PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS,
  servicesCardSplitBackgroundLayerStyle,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS,
  servicesCardDecorShellStyle,
} from '@/components/portfolio/portfolio-services-card-decor-settings';
import {
  patchServicesBlockSettings,
  patchServicesDistinctHeader,
  readServicesBlockField,
  resolveDistinctBlockSectionSubtitle,
  resolveDistinctBlockSectionTitle,
  resolveServicesBlockPresentation,
  servicesUsesSplitBlockConfig,
  type PortfolioServicesBlockScope,
} from '@/components/portfolio/portfolio-services-block-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  applyServicesPaletteToSettings,
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  mergeServicesColorBindings,
  mergeServicesPalette,
  patchServicesColorBinding,
  patchServicesColorField,
  PORTFOLIO_SERVICES_COLOR_SLOT_OPTIONS,
  SERVICES_ELEMENT_CHROME_COLOR_SLOTS,
  SERVICES_STYLE_TARGET_COLOR_SLOT,
  type ServicesColorSlot,
} from '@/components/portfolio/portfolio-services-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

export type ServicesSettingsFocus = 'skills' | 'services';

export type ServicesSubSection =
  | 'general'
  | 'header'
  | 'cards'
  | 'title'
  | 'description'
  | 'icon'
  | 'price'
  | 'delivery'
  | 'tasks'
  | 'cta'
  | 'background'
  | 'palette'
  /** @deprecated Mapped by normalizeServicesSubSection */
  | 'layout'
  | 'frame'
  | 'ergonomics'
  | 'content'
  | 'skills'
  | 'servicesText'
  | 'style';

type ServicesSubSectionMeta = {
  id: ServicesSubSection;
  label: string;
  description: string;
};

const SERVICES_SUB_SECTIONS_SKILLS: ServicesSubSectionMeta[] = [
  { id: 'general', label: 'General', description: 'Visibility and section options.' },
  { id: 'header', label: 'Header', description: 'Titre et sous-titre de la section.' },
  {
    id: 'cards',
    label: 'Cards',
    description: 'Design, grille, cadre et alignement des cartes skills.',
  },
  { id: 'title', label: 'Titre', description: 'Affichage, typographie et fond du titre de skill.' },
  {
    id: 'description',
    label: 'Description',
    description: 'Affichage, typographie et fond de la description.',
  },
  {
    id: 'icon',
    label: 'Icône',
    description: 'Icône outil, taille, placement et couleurs de marque.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Use the Global site palette and bind section colors to tokens.',
  },
];

const SERVICES_SUB_SECTIONS_SERVICES: ServicesSubSectionMeta[] = [
  { id: 'general', label: 'General', description: 'Visibility and section options.' },
  { id: 'header', label: 'Header', description: 'Titre et sous-titre de la section.' },
  {
    id: 'cards',
    label: 'Cards',
    description: 'Design, grille, cadre et alignement des cartes services.',
  },
  { id: 'title', label: 'Title', description: 'Show, typography and background for the service title.' },
  {
    id: 'description',
    label: 'Description',
    description: 'Show, typography and background for the description.',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    description: 'Show, typography and background for the deliverables checklist.',
  },
  { id: 'price', label: 'Price', description: 'Show, placement and typography for the price.' },
  {
    id: 'delivery',
    label: 'Delivery',
    description: 'Show and typography for the delivery time.',
  },
  {
    id: 'cta',
    label: 'CTA',
    description: 'Order button — style, colors, hover and typography.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Use the Global site palette and bind section colors to tokens.',
  },
];

function subSectionsForFocus(focus: ServicesSettingsFocus): ServicesSubSectionMeta[] {
  return focus === 'skills' ? SERVICES_SUB_SECTIONS_SKILLS : SERVICES_SUB_SECTIONS_SERVICES;
}

/** @deprecated Prefer subSectionsForFocus */
const SERVICES_SUB_SECTIONS = [...SERVICES_SUB_SECTIONS_SKILLS, ...SERVICES_SUB_SECTIONS_SERVICES];

/** Map legacy subsection ids (saved UI state / search) to the element menus. */
export function normalizeServicesSubSection(
  value: string | undefined,
  focus: ServicesSettingsFocus = 'services'
): ServicesSubSection {
  if (value === 'layout' || value === 'frame') return 'cards';
  if (value === 'skills' || value === 'servicesText' || value === 'style') return 'title';
  if (value === 'content' || value === 'ergonomics') {
    return focus === 'skills' ? 'icon' : 'title';
  }
  if (
    value === 'general' ||
    value === 'header' ||
    value === 'cards' ||
    value === 'title' ||
    value === 'description' ||
    value === 'icon' ||
    value === 'price' ||
    value === 'delivery' ||
    value === 'tasks' ||
    value === 'cta' ||
    value === 'background' ||
    value === 'palette'
  ) {
    return value;
  }
  return 'header';
}

const SERVICES_BACKGROUND_LABEL_SLOTS: Record<string, ServicesColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asServicesPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioServicesSectionSettings> {
  return patch as Partial<PortfolioServicesSectionSettings>;
}

function ServicesHeaderPreview({
  title,
  subtitle,
  titleColor,
  subtitleColor,
  alignment,
}: {
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  alignment: 'left' | 'center';
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-200/80 bg-neutral-50/50 px-5 py-4 ${
        alignment === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Aperçu en direct</p>
      <p className="mt-3 text-2xl font-bold uppercase tracking-[0.12em]" style={{ color: titleColor }}>
        {title || '—'}
      </p>
      {subtitle ? (
        <p className="mt-2 text-sm leading-relaxed" style={{ color: subtitleColor }}>
          {subtitle}
        </p>
      ) : (
        <p className="mt-2 text-sm italic text-neutral-400">Aucun sous-titre</p>
      )}
    </div>
  );
}

function ServicesHeaderConfigSection({
  heading,
  description,
  children,
}: {
  heading: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{heading}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

function ServicesDistinctHeaderPanel({
  services,
  blockScope,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  blockScope: PortfolioServicesBlockScope;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const header = blockScope === 'skills' ? services.skillsHeader : services.servicesHeader;
  const patchHeader = (patch: Parameters<typeof patchServicesDistinctHeader>[2]) =>
    onChange(patchServicesDistinctHeader(services, blockScope, patch));

  const titlePreview = resolveDistinctBlockSectionTitle(services, blockScope);
  const subtitlePreview = resolveDistinctBlockSectionSubtitle(services, blockScope);
  const titleOptions =
    blockScope === 'skills'
      ? PORTFOLIO_SERVICES_DISTINCT_SKILLS_TITLE_PRESET_OPTIONS
      : PORTFOLIO_SERVICES_DISTINCT_SERVICES_TITLE_PRESET_OPTIONS;
  const subtitleOptions =
    blockScope === 'skills'
      ? PORTFOLIO_SERVICES_DISTINCT_SKILLS_SUBTITLE_PRESET_OPTIONS
      : PORTFOLIO_SERVICES_DISTINCT_SERVICES_SUBTITLE_PRESET_OPTIONS;

  return (
    <>
      <ServicesHeaderPreview
        title={titlePreview}
        subtitle={subtitlePreview}
        titleColor={header.titleColor}
        subtitleColor={header.subtitleColor}
        alignment={header.headerAlignment}
      />

      <ServicesHeaderConfigSection
        heading="Titre principal"
        description="Grand titre en haut de la section — affiché en capitales sur le portfolio."
      >
        <ServicesOptionGrid
          label="Preset du titre"
          options={titleOptions}
          value={header.titlePreset}
          onChange={(titlePreset) => patchHeader({ titlePreset })}
        />
        {header.titlePreset === 'custom' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du titre
            </label>
            <input
              type="text"
              value={header.titleCustom}
              onChange={(event) => patchHeader({ titleCustom: event.target.value })}
              placeholder="Ex. MY TOOLKIT"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        <ServicesOptionGrid
          label="Police du titre"
          options={PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS}
          value={header.titleFont}
          onChange={(titleFont) => patchHeader({ titleFont })}
        />
        <ServicesColorField
          services={services}
          onChange={onChange}
          slot="title"
          label="Couleur du titre"
          value={header.titleColor}
          manualFallback={(titleColor) => patchHeader({ titleColor })}
        />
      </ServicesHeaderConfigSection>

      <ServicesHeaderConfigSection
        heading="Sous-titre"
        description="Ligne descriptive plus petite, sous le titre principal — optionnelle."
      >
        <ServicesOptionGrid
          label="Preset du sous-titre"
          options={subtitleOptions}
          value={header.subtitlePreset}
          onChange={(subtitlePreset) => patchHeader({ subtitlePreset })}
        />
        {header.subtitlePreset === 'custom' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Texte du sous-titre
            </label>
            <textarea
              value={header.subtitleCustom}
              onChange={(event) => patchHeader({ subtitleCustom: event.target.value })}
              rows={2}
              placeholder="Une phrase d'introduction sous le titre…"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
            />
          </div>
        ) : null}
        <ServicesOptionGrid
          label="Police du sous-titre"
          options={PORTFOLIO_SERVICES_HEADER_FONT_OPTIONS}
          value={header.subtitleFont}
          onChange={(subtitleFont) => patchHeader({ subtitleFont })}
        />
        <ServicesColorField
          services={services}
          onChange={onChange}
          slot="subtitle"
          label="Couleur du sous-titre"
          value={header.subtitleColor}
          manualFallback={(subtitleColor) => patchHeader({ subtitleColor })}
        />
      </ServicesHeaderConfigSection>

      <ServicesHeaderConfigSection
        heading="Alignement"
        description="Position du titre et du sous-titre dans la section."
      >
        <ServicesOptionGrid
          label="Disposition titre / contenu"
          options={PORTFOLIO_SERVICES_SECTION_LAYOUT_OPTIONS}
          value={header.sectionLayout ?? 'stacked'}
          onChange={(sectionLayout) => patchHeader({ sectionLayout })}
          columns={1}
        />
        {servicesSectionLayoutIsAside(header.sectionLayout) ? (
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Le titre et le contenu seront côte à côte sur grand écran, puis empilés sur mobile.
          </p>
        ) : (
          <ServicesOptionGrid
            label="Alignement horizontal"
            options={[
              { value: 'left', label: 'Gauche', description: 'Alignement éditorial par défaut.' },
              { value: 'center', label: 'Centré', description: 'Titre et sous-titre centrés.' },
            ]}
            value={header.headerAlignment}
            onChange={(headerAlignment) => patchHeader({ headerAlignment })}
          />
        )}
      </ServicesHeaderConfigSection>

      {blockScope === 'services' ? (
        <ServicesHeaderConfigSection
          heading="Illustration"
          description="SVG décoratif à côté du contenu de la section Services."
        >
          <ServicesOptionGrid
            label="Style du SVG"
            options={PORTFOLIO_SERVICES_ILLUSTRATION_OPTIONS}
            value={services.servicesIllustrationVariant ?? 'none'}
            onChange={(servicesIllustrationVariant) => onChange({ servicesIllustrationVariant })}
            columns={2}
          />
          {(services.servicesIllustrationVariant ?? 'none') !== 'none' ? (
            <ServicesOptionGrid
              label="Position du SVG"
              options={PORTFOLIO_SERVICES_ILLUSTRATION_PLACEMENT_OPTIONS}
              value={services.servicesIllustrationPlacement ?? 'right'}
              onChange={(servicesIllustrationPlacement) =>
                onChange({ servicesIllustrationPlacement })
              }
              columns={2}
            />
          ) : null}
        </ServicesHeaderConfigSection>
      ) : null}
    </>
  );
}

function ServicesToggleRow({
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

function ServicesToolInspectorAdvancedFields({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const iconGap = clampSkillsInspectorIconGapPx(services.skillsInspectorIconGapPx, 12);
  return (
    <>
      <ServicesToggleRow
        label="Cadre du rail d’icônes"
        description="Désactivez-le pour afficher les icônes sans conteneur autour."
        checked={services.skillsInspectorRailFrameEnabled !== false}
        onChange={(skillsInspectorRailFrameEnabled) =>
          onChange({ skillsInspectorRailFrameEnabled })
        }
      />
      <label className="block rounded-2xl border border-neutral-200/80 bg-white p-4">
        <span className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-neutral-900">Écart entre les icônes</span>
          <span className="tabular-nums text-sm font-semibold text-neutral-700">{iconGap}px</span>
        </span>
        <input
          type="range"
          min={SKILLS_INSPECTOR_ICON_GAP_PX_MIN}
          max={SKILLS_INSPECTOR_ICON_GAP_PX_MAX}
          step={1}
          value={iconGap}
          onChange={(event) =>
            onChange({
              skillsInspectorIconGapPx: clampSkillsInspectorIconGapPx(event.target.value, 12),
            })
          }
          className="mt-3 w-full accent-neutral-950"
        />
      </label>
      <ServicesOptionGrid
        label="SVG décoratif"
        options={PORTFOLIO_SKILLS_INSPECTOR_ILLUSTRATION_OPTIONS}
        value={services.skillsInspectorIllustrationVariant ?? 'none'}
        onChange={(skillsInspectorIllustrationVariant) =>
          onChange({ skillsInspectorIllustrationVariant })
        }
        columns={2}
      />
      {(services.skillsInspectorIllustrationVariant ?? 'none') !== 'none' ? (
        <ServicesOptionGrid
          label="Position du SVG"
          options={PORTFOLIO_SKILLS_INSPECTOR_ILLUSTRATION_PLACEMENT_OPTIONS}
          value={services.skillsInspectorIllustrationPlacement ?? 'right'}
          onChange={(skillsInspectorIllustrationPlacement) =>
            onChange({ skillsInspectorIllustrationPlacement })
          }
          columns={2}
        />
      ) : null}
    </>
  );
}

function ServicesOptionGrid<T extends string | number>({
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
              : columns === 1
                ? 'grid-cols-1'
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

const CARD_DESIGN_PREVIEW_BASE: Record<PortfolioServicesCardDesign, string> = {
  editorial: 'relative overflow-hidden rounded-xl bg-white',
  minimal: 'rounded-lg bg-white',
  compact: 'rounded-lg',
  glass: 'rounded-xl',
  frost: 'rounded-xl',
  accent: 'rounded-lg bg-white',
};

function ServicesCardDesignGrid({
  value,
  intensities,
  tints,
  accentColor,
  onChange,
  onIntensityChange,
  onTintChange,
}: {
  value: PortfolioServicesCardDesign;
  intensities: PortfolioServicesCardDesignIntensities;
  tints: PortfolioServicesCardDesignTints;
  accentColor: string;
  onChange: (value: PortfolioServicesCardDesign) => void;
  onIntensityChange: (intensity: number) => void;
  onTintChange: (tint: number) => void;
}) {
  const intensityHints = PORTFOLIO_SERVICES_CARD_DESIGN_INTENSITY_HINTS[value];
  const tintHints = PORTFOLIO_SERVICES_CARD_DESIGN_TINT_HINTS[value];
  const currentIntensity = intensities[value];
  const currentTint = tints[value];
  const supportsTint = servicesCardDesignSupportsTint(value);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Card design (style)</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO_SERVICES_CARD_DESIGN_OPTIONS.map((option) => {
            const active = option.value === value;
            const previewIntensity = intensities[option.value];
            const previewTint = tints[option.value];
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
                <div
                  className={`mb-3 h-12 w-full ${CARD_DESIGN_PREVIEW_BASE[option.value]}`}
                  style={servicesCardDesignIntensityStyle(
                    option.value,
                    previewIntensity,
                    accentColor,
                    previewTint
                  )}
                  aria-hidden
                />
                <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{intensityHints.label}</p>
          <span className="text-sm font-semibold text-neutral-700">{currentIntensity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={currentIntensity}
          onChange={(event) => onIntensityChange(Number(event.target.value))}
          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
          aria-label={intensityHints.label}
        />
        <div className="mt-2 flex justify-between gap-4 text-xs text-neutral-500">
          <span>{intensityHints.low}</span>
          <span className="text-right">{intensityHints.high}</span>
        </div>
      </div>

      {supportsTint ? (
        <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{tintHints.label}</p>
            <span className="text-sm font-semibold text-neutral-700">{currentTint}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={currentTint}
            onChange={(event) => onTintChange(Number(event.target.value))}
            className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
            aria-label={tintHints.label}
          />
          <div className="mt-2 flex justify-between gap-4 text-xs text-neutral-500">
            <span>{tintHints.low}</span>
            <span className="text-right">{tintHints.high}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ServicesManualColorField({
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
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
          aria-label={`${label} picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
          aria-label={`${label} hex`}
        />
        <span
          className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner"
          style={{ backgroundColor: value }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function ServicesUsePaletteToggle({
  services,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={services.useHeroPalette !== false}
      onChange={(useHeroPalette) =>
        onChange(
          asServicesPatch(
            useHeroPalette
              ? { useHeroPalette, ...applyServicesPaletteToSettings(services) }
              : { useHeroPalette }
          )
        )
      }
      title="Use global color palette"
      description={description}
      enabledHint={
        enabledHint ??
        'Palette mode — pick which Global token each color uses (edit tokens under Global → Theme). Free hex pickers stay locked.'
      }
      disabledHint={
        disabledHint ??
        'Manual mode — color pickers set hex values directly and are no longer overwritten by the global palette.'
      }
    />
  );
}

function ServicesColorField({
  services,
  onChange,
  slot,
  label,
  description,
  value,
  manualFallback,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  slot: ServicesColorSlot;
  label: string;
  description?: string;
  value: string;
  /** When palette is off, route manual edits (e.g. distinct block headers). */
  manualFallback?: (hex: string) => void;
}) {
  const paletteOn = services.useHeroPalette !== false;

  if (!paletteOn) {
    return (
      <ServicesManualColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => {
          if (manualFallback) {
            manualFallback(hex);
            return;
          }
          onChange(asServicesPatch(patchServicesColorField(services, slot, hex)));
        }}
      />
    );
  }

  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(
    DEFAULT_SERVICES_COLOR_BINDINGS,
    services.servicesColorBindings
  );
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
          {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
        </div>
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
            asServicesPatch(
              patchServicesColorBinding(services, slot, event.target.value as HeroPaletteTokenId)
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
      <p className="text-xs text-neutral-500">
        Bound to token · edit hex under{' '}
        <span className="font-semibold text-neutral-700">Global → Theme</span>
      </p>
    </div>
  );
}

function ServicesFrameColorField({
  services,
  onChange,
  slot,
  label,
  value,
  onManualChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  slot: ServicesColorSlot;
  label: string;
  value: string;
  onManualChange: (hex: string) => void;
}) {
  if (services.useHeroPalette !== false) {
    return (
      <ServicesColorField
        services={services}
        onChange={onChange}
        slot={slot}
        label={label}
        value={value}
      />
    );
  }
  return (
    <ServicesManualColorField label={label} value={value} onChange={onManualChange} />
  );
}

function ServicesPalettePanel({
  services,
  onChange,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
}) {
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, services.servicesPalette);
  const bindings = mergeServicesColorBindings(
    DEFAULT_SERVICES_COLOR_BINDINGS,
    services.servicesColorBindings
  );
  const paletteOn = services.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <ServicesUsePaletteToggle
        services={services}
        onChange={onChange}
        description="When on, section colors follow the Global site palette. Turn off to edit colors manually in Header, Frame, Skills, Services, and Background."
        enabledHint="Edit the dark/light token pair under Global → Theme. Bindings below pick which token each section color uses."
        disabledHint="Global palette tokens still exist, but this section uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        The site color palette lives in <span className="font-semibold">Global → Theme</span> as a
        coupled dark / light pair. This section no longer has its own Mode sombre / Mode clair editor.
      </p>

      {paletteOn ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Color bindings
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick which Global token each section color uses. Swatches preview the active mode.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_SERVICES_COLOR_SLOT_OPTIONS.map((slot) => {
              const resolved = resolveHeroPaletteColor(palette, bindings[slot.value]);
              return (
                <div
                  key={slot.value}
                  className="rounded-2xl border border-neutral-200/80 bg-white px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-800">{slot.label}</span>
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-neutral-200"
                      style={{ backgroundColor: resolved }}
                      aria-hidden
                    />
                  </div>
                  <select
                    value={bindings[slot.value]}
                    onChange={(event) =>
                      onChange(
                        asServicesPatch(
                          patchServicesColorBinding(
                            services,
                            slot.value,
                            event.target.value as HeroPaletteTokenId
                          )
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
                  >
                    {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                      <option key={token.value} value={token.value}>
                        {token.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-neutral-500">{slot.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-500">
          Palette is off — slot bindings are hidden. Turn it back on to bind colors to Global tokens,
          or edit hex fields under Header / Frame / Skills / Services / Background.
        </p>
      )}
    </div>
  );
}

function ServicesInlineTypography({
  services,
  onChange,
  target,
  title = 'Typographie',
  extra,
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  target: PortfolioServicesStyleTarget;
  title?: string;
  extra?: ReactNode;
}) {
  const elementStyles = normalizeServicesElementStyles(services.elementStyles);
  const textRole =
    target === 'skillTitle' ||
    target === 'cardTitle' ||
    target === 'price' ||
    target === 'blockSubheading'
      ? ('title' as const)
      : target === 'cta'
        ? ('label' as const)
        : ('body' as const);
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <PortfolioElementStyleFields
        targets={PORTFOLIO_SERVICES_STYLE_TARGET_OPTIONS}
        activeTarget={target}
        onTargetChange={() => {}}
        hideTargetPicker
        title={title}
        textRole={textRole}
        style={elementStyles[target]}
        onStyleChange={(patch) =>
          onChange({ elementStyles: patchServicesElementStyle(elementStyles, target, patch) })
        }
        showDarkColor={services.useHeroPalette === false}
        renderColorField={({ label, value }) => (
          <ServicesColorField
            services={services}
            onChange={onChange}
            slot={SERVICES_STYLE_TARGET_COLOR_SLOT[target]}
            label={label}
            value={value}
          />
        )}
        renderDarkColorField={({ label, value, onChange: onDark }) => (
          <ServicesManualColorField
            label={label}
            description="Used when Global → Theme is Dark and the section palette is off."
            value={value}
            onChange={onDark}
          />
        )}
        extra={extra}
      />
    </div>
  );
}

function ServicesElementChromeControls({
  services,
  chromeId,
  onChange,
  title = 'Fond de l’élément',
  description = 'Ajoute un fond derrière cet élément — padding, marge, couleur et bordure.',
}: {
  services: PortfolioServicesSectionSettings;
  chromeId: PortfolioServicesElementChromeId;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  title?: string;
  description?: string;
}) {
  const chrome =
    services.elementChromes?.[chromeId] ?? DEFAULT_SERVICES_ELEMENT_CHROMES[chromeId];
  const slots = SERVICES_ELEMENT_CHROME_COLOR_SLOTS[chromeId];

  const patchChrome = (patch: Partial<typeof chrome>) => {
    const nextChromes = patchServicesElementChrome(
      services.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES,
      chromeId,
      patch
    );
    if (services.useHeroPalette === false) {
      onChange({ elementChromes: nextChromes });
      return;
    }
    // Keep chrome fill/border hex in sync with the bound palette token.
    onChange(
      asServicesPatch(
        applyServicesPaletteToSettings({
          ...services,
          elementChromes: nextChromes,
        })
      )
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      <ServicesToggleRow
        label="Activer le fond"
        description="Encadre cet élément avec un fond et optionnellement une bordure."
        checked={chrome.enabled}
        onChange={(enabled) => patchChrome({ enabled })}
      />
      {chrome.enabled ? (
        <>
          <ServicesToggleRow
            label="Remplissage"
            description="Couleur de fond derrière le texte."
            checked={chrome.backgroundEnabled}
            onChange={(backgroundEnabled) => patchChrome({ backgroundEnabled })}
          />
          {chrome.backgroundEnabled ? (
            <ServicesColorField
              services={services}
              onChange={onChange}
              slot={slots.background}
              label="Couleur de fond"
              value={chrome.backgroundColor}
            />
          ) : null}
          <ServicesOptionGrid
            label="Bordure"
            options={PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS}
            value={chrome.border}
            onChange={(border) => patchChrome({ border })}
            columns={2}
          />
          {chrome.border === 'soft' || chrome.border === 'solid' ? (
            <ServicesColorField
              services={services}
              onChange={onChange}
              slot={slots.border}
              label="Couleur de bordure"
              value={chrome.borderColor}
            />
          ) : null}
          <ServicesOptionGrid
            label="Coins"
            options={PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS}
            value={chrome.borderRadius}
            onChange={(borderRadius) => patchChrome({ borderRadius })}
            columns={2}
          />
          <ServicesOptionGrid
            label="Padding (intérieur)"
            options={PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS}
            value={chrome.padding}
            onChange={(padding) => patchChrome({ padding })}
            columns={2}
          />
          <ServicesOptionGrid
            label="Marge (extérieur)"
            options={PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS}
            value={chrome.margin}
            onChange={(margin) => patchChrome({ margin })}
            columns={2}
          />
        </>
      ) : null}
    </div>
  );
}

export function ServicesSettingsPanel({
  services,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
  settingsFocus = 'services',
}: {
  services: PortfolioServicesSectionSettings;
  onChange: (patch: Partial<PortfolioServicesSectionSettings>) => void;
  subSection?: ServicesSubSection;
  onSubSectionChange?: (value: ServicesSubSection) => void;
  /** Top-level settings entry: Skills and Services are independent. */
  settingsFocus?: ServicesSettingsFocus;
}) {
  const focusSubSections = subSectionsForFocus(settingsFocus);
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ServicesSubSection>('header');
  const rawSubSection = normalizeServicesSubSection(
    controlledSubSection ?? uncontrolledSubSection,
    settingsFocus
  );
  const subSection = focusSubSections.some((item) => item.id === rawSubSection)
    ? rawSubSection
    : (focusSubSections[0]?.id ?? 'header');
  const setSubSection = (value: ServicesSubSection) => {
    const next = normalizeServicesSubSection(value, settingsFocus);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta =
    focusSubSections.find((item) => item.id === subSection) ?? focusSubSections[0];
  const blockScope: PortfolioServicesBlockScope = settingsFocus;
  const usesSplitBlocks = true;

  const patchBlock = (patch: Parameters<typeof patchServicesBlockSettings>[2]) =>
    onChange(patchServicesBlockSettings(services, blockScope, patch));

  /** Combined mode writes section + both blocks so design/frame stay in sync with the preview. */
  const patchFrame = (patch: Parameters<typeof patchServicesBlockSettings>[2]) => {
    if (usesSplitBlocks) {
      patchBlock(patch);
      return;
    }
    onChange({
      ...patch,
      skillsBlock: { ...services.skillsBlock, ...patch },
      servicesBlock: { ...services.servicesBlock, ...patch },
    });
  };

  const readBlock = <K extends keyof import('@/components/portfolio/portfolio-services-settings').PortfolioServicesBlockSettings>(
    field: K
  ) => readServicesBlockField(services, blockScope, field);

  const activeFrameSettings = usesSplitBlocks
    ? services[blockScope === 'skills' ? 'skillsBlock' : 'servicesBlock']
    : services;
  const activeCardDesign = readBlock('cardDesign');
  const isPillCloudLayout =
    blockScope === 'skills' && readBlock('galleryLayout') === 'pill-cloud';
  const isToolInspectorLayout =
    blockScope === 'skills' && readBlock('galleryLayout') === 'tool-inspector';
  const isSkillsSpecialLayout = isPillCloudLayout || isToolInspectorLayout;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Sub-section
        </label>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ServicesSubSection)}
          className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
        >
          {focusSubSections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-neutral-500">{activeMeta?.description}</p>
      </div>

      {subSection === 'general' ? (
        <>
          {settingsFocus === 'skills' ? (
            <ServicesToggleRow
              label="Show Skills section"
              description="Display the Skills section on your public portfolio."
              checked={services.showSkills !== false}
              onChange={(showSkills) =>
                onChange({
                  showSkills,
                  enabled: showSkills || services.showServices !== false,
                  sectionOrganization: 'distinct',
                  layoutMode: 'separated',
                })
              }
            />
          ) : (
            <ServicesToggleRow
              label="Show Services section"
              description="Display the Services section on your public portfolio."
              checked={services.showServices !== false}
              onChange={(showServices) =>
                onChange({
                  showServices,
                  enabled: showServices || services.showSkills !== false,
                  sectionOrganization: 'distinct',
                  layoutMode: 'separated',
                })
              }
            />
          )}
          <ServicesUsePaletteToggle
            services={services}
            onChange={onChange}
            description="When on, section colors follow palette tokens synced with Hero. Turn off to pick hex values freely in each tab."
          />
          {settingsFocus === 'services' ? (
            <ServicesToggleRow
              label="Show response time"
              description="Typically replies label in the section header."
              checked={services.showResponseTime}
              onChange={(showResponseTime) => onChange({ showResponseTime })}
            />
          ) : null}
          <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
            Skills et Services sont des sections{' '}
            <span className="font-semibold text-neutral-800">indépendantes</span> — réordonnez-les dans
            Global → Section order.
          </p>
        </>
      ) : null}

      {subSection === 'header' ? (
        <>
          <p className="rounded-2xl border border-violet-200/80 bg-violet-50/40 px-4 py-3 text-sm text-neutral-600">
            En-tête de la section{' '}
            <span className="font-semibold text-neutral-900">
              {settingsFocus === 'skills' ? 'Skills' : 'Services'}
            </span>
            .
          </p>
          <ServicesDistinctHeaderPanel
            services={services}
            blockScope={blockScope}
            onChange={onChange}
          />
        </>
      ) : null}

      {subSection === 'cards' ? (
        <>
          {usesSplitBlocks ? (
            <>
              <p className="text-sm text-neutral-500">
                Design, stage et cadre pour{' '}
                <span className="font-semibold text-neutral-800">
                  {settingsFocus === 'skills' ? 'Skills' : 'Services'}
                </span>
                .
              </p>
              <ServicesOptionGrid
                label={blockScope === 'skills' ? 'Design des outils / skills' : 'Design des services'}
                options={
                  blockScope === 'skills'
                    ? PORTFOLIO_SKILLS_GALLERY_LAYOUT_OPTIONS
                    : PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS
                }
                value={readBlock('galleryLayout')}
                onChange={(galleryLayout) => {
                  patchBlock({
                    galleryLayout,
                    ...(blockScope === 'skills' &&
                    (galleryLayout === 'pill-cloud' || galleryLayout === 'tool-inspector')
                      ? { displayMode: 'grid' as const }
                      : {}),
                    ...(blockScope === 'services' &&
                    (galleryLayout === 'commercial-list' ||
                      galleryLayout === 'service-selector' ||
                      galleryLayout === 'service-accordion')
                      ? {
                          displayMode: 'grid' as const,
                          columns: 1 as const,
                          contentAlignment: 'left' as const,
                        }
                      : {}),
                  });
                  if (blockScope === 'skills' && galleryLayout === 'tool-inspector') {
                    onChange({
                      showSkillDescription: true,
                      showSkillCurrentlyUsed: false,
                      skillsInspectorShowHint: false,
                    });
                  }
                  if (blockScope === 'services' && galleryLayout === 'commercial-list') {
                    onChange({
                      servicesContentAlignment: 'left',
                      servicePriceAlign: 'left',
                      ctaAlignment: 'right',
                    });
                  }
                  if (
                    blockScope === 'services' &&
                    (galleryLayout === 'service-selector' || galleryLayout === 'service-accordion')
                  ) {
                    onChange({
                      servicesContentAlignment: 'left',
                      servicePriceAlign: 'right',
                      ctaAlignment: 'center',
                    });
                  }
                  if (blockScope === 'services' && (galleryLayout === 'tier' || galleryLayout === 'plan')) {
                    onChange(
                      galleryLayout === 'tier'
                        ? {
                            servicesContentAlignment: 'center',
                            servicePriceAlign: 'center',
                            servicePricePrefixEnabled: false,
                            ctaAlignment: 'center',
                          }
                        : {
                            servicesContentAlignment: 'left',
                            servicePriceAlign: 'left',
                            servicePricePrefixEnabled: false,
                            ctaAlignment: 'left',
                          }
                    );
                  }
                }}
                columns={2}
              />

              {isToolInspectorLayout ? (
                <div className="space-y-3 rounded-2xl border border-sky-200/80 bg-sky-50/50 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-950">Tool inspector</p>
                  <p className="text-sm text-neutral-600">
                    Rail d&apos;icônes vertical ou horizontal + panneau détail.
                  </p>
                  <ServicesOptionGrid
                    label="Position du rail"
                    options={[
                      {
                        value: 'left',
                        label: 'Gauche',
                        description: 'Icônes à gauche, détail à droite.',
                      },
                      {
                        value: 'right',
                        label: 'Droite',
                        description: 'Détail à gauche, icônes à droite.',
                      },
                      {
                        value: 'top',
                        label: 'En haut',
                        description: 'Icônes alignées horizontalement au-dessus du détail.',
                      },
                    ]}
                    value={services.skillsInspectorRailPlacement}
                    onChange={(skillsInspectorRailPlacement) =>
                      onChange({ skillsInspectorRailPlacement })
                    }
                    columns={3}
                  />
                  <ServicesToolInspectorAdvancedFields
                    services={services}
                    onChange={onChange}
                  />
                  <ServicesToggleRow
                    label="Afficher la description"
                    description="Texte détaillé sous le nom de l’outil. Activé par défaut pour ce design."
                    checked={services.showSkillDescription !== false}
                    onChange={(showSkillDescription) => onChange({ showSkillDescription })}
                  />
                  <ServicesToggleRow
                    label="Afficher le niveau"
                    description="Ligne « Niveau : … / catégorie »."
                    checked={services.showSkillLevel !== false}
                    onChange={(showSkillLevel) => onChange({ showSkillLevel })}
                  />
                  <ServicesToggleRow
                    label="Afficher les cas d’usage"
                    description="Chips « Cas d’usage pratiques »."
                    checked={services.showSkillUseCases !== false}
                    onChange={(showSkillUseCases) => onChange({ showSkillUseCases })}
                  />
                  <ServicesToggleRow
                    label="Afficher l’expérience"
                    description="Années / libellé en pied de panneau."
                    checked={services.showSkillExperience !== false}
                    onChange={(showSkillExperience) => onChange({ showSkillExperience })}
                  />
                </div>
              ) : null}

              {blockScope === 'services' &&
              readBlock('galleryLayout') === 'commercial-list' ? (
                <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">
                      Réglages Liste commerciale
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Espacements, proportions des colonnes et offre mise en avant.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Offre populaire
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((itemNumber) => {
                        const active =
                          (services.commercialPopularItemNumber ?? 2) === itemNumber;
                        return (
                          <button
                            key={itemNumber}
                            type="button"
                            onClick={() =>
                              onChange({ commercialPopularItemNumber: itemNumber })
                            }
                            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                              active
                                ? 'border-neutral-950 bg-neutral-950 text-white'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            {itemNumber === 0 ? 'Aucune' : `Offre ${itemNumber}`}
                          </button>
                        );
                      })}
                    </div>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Texte du badge
                      </span>
                      <input
                        type="text"
                        maxLength={40}
                        value={services.commercialPopularLabel ?? 'Popular'}
                        onChange={(event) =>
                          onChange({ commercialPopularLabel: event.target.value })
                        }
                        placeholder="Popular"
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                      />
                    </label>
                  </div>

                  {[
                    {
                      label: 'Espace entre les offres',
                      description: 'Distance verticale entre chaque ligne.',
                      value: services.commercialRowGapPx ?? 20,
                      min: 0,
                      max: 80,
                      patch: (value: number) => ({ commercialRowGapPx: value }),
                    },
                    {
                      label: 'Espace interne',
                      description: 'Distance entre titre, description et tâches.',
                      value: services.servicesContentGapPx ?? 14,
                      min: 0,
                      max: 48,
                      patch: (value: number) => ({
                        servicesContentGap: 'custom' as const,
                        servicesContentGapPx: value,
                      }),
                    },
                    {
                      label: 'Espace horizontal',
                      description: 'Distance entre numéro, contenu, prix et bouton.',
                      value: services.commercialColumnGapPx ?? 32,
                      min: 12,
                      max: 80,
                      patch: (value: number) => ({ commercialColumnGapPx: value }),
                    },
                    {
                      label: 'Taille du numéro',
                      description: 'Diamètre du marqueur numéroté.',
                      value: services.commercialMarkerSizePx ?? 48,
                      min: 32,
                      max: 72,
                      patch: (value: number) => ({ commercialMarkerSizePx: value }),
                    },
                    {
                      label: 'Largeur prix',
                      description: 'Largeur de la colonne du tarif sur grand écran.',
                      value: services.commercialPriceWidthPx ?? 160,
                      min: 112,
                      max: 260,
                      patch: (value: number) => ({ commercialPriceWidthPx: value }),
                    },
                    {
                      label: 'Largeur bouton',
                      description: 'Largeur de la colonne CTA sur grand écran.',
                      value: services.commercialCtaWidthPx ?? 160,
                      min: 112,
                      max: 260,
                      patch: (value: number) => ({ commercialCtaWidthPx: value }),
                    },
                  ].map((control) => (
                    <label key={control.label} className="block">
                      <span className="flex items-center justify-between gap-4">
                        <span>
                          <span className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            {control.label}
                          </span>
                          <span className="mt-1 block text-sm text-neutral-500">
                            {control.description}
                          </span>
                        </span>
                        <span className="shrink-0 tabular-nums text-sm font-semibold text-neutral-800">
                          {control.value}px
                        </span>
                      </span>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        step={1}
                        value={control.value}
                        onChange={(event) =>
                          onChange(control.patch(Number(event.target.value)))
                        }
                        className="mt-3 w-full accent-neutral-950"
                      />
                    </label>
                  ))}

                  <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-500">
                    Le padding, le rayon, la bordure et le fond restent disponibles dans
                    <span className="font-semibold text-neutral-700"> Card frame</span>. Les tâches,
                    prix, devise et bouton restent réglables dans leurs onglets respectifs.
                  </p>
                </div>
              ) : null}
              {isPillCloudLayout ? (
                <p className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-neutral-600">
                  Le nuage de pilules gère sa géométrie compacte et son retour à la ligne. Les
                  colonnes, modes d&apos;affichage, largeurs de carte et animations ne s&apos;appliquent
                  pas à ce design.
                </p>
              ) : isToolInspectorLayout ? (
                <p className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-neutral-600">
                  Tool inspector ignore les colonnes et le mode d&apos;affichage. Sa largeur et son
                  alignement restent configurables ci-dessous.
                </p>
              ) : readBlock('galleryLayout') === 'service-selector' ||
              readBlock('galleryLayout') === 'service-accordion' ? (
                <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
                  Ce design occupe toute la largeur : les colonnes, le mode d&apos;affichage, la
                  largeur de carte et l&apos;alignement ne s&apos;appliquent pas.
                </p>
              ) : (
                <ServicesOptionGrid
                  label={blockScope === 'skills' ? 'Colonnes tools (écran large)' : 'Colonnes services (écran large)'}
                  options={PORTFOLIO_SERVICES_COLUMNS_OPTIONS}
                  value={readBlock('columns')}
                  onChange={(columns) => patchBlock({ columns })}
                  columns={2}
                />
              )}

              {isSkillsSpecialLayout ||
              readBlock('galleryLayout') === 'service-selector' ||
              readBlock('galleryLayout') === 'service-accordion' ? null : (
              <ServicesOptionGrid
                label="Mode d'affichage"
                options={PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS}
                value={readBlock('displayMode')}
                onChange={(displayMode) => {
                  if (servicesUsesSplitBlockConfig(services.sectionOrganization)) {
                    patchBlock({
                      displayMode,
                      ...(servicesDisplayModeNeedsCardLayout(displayMode)
                        ? { galleryLayout: 'card' as const }
                        : {}),
                    });
                  } else {
                    onChange(servicesDisplayModeSettingsPatch(services, displayMode));
                  }
                }}
                columns={3}
              />
              )}

              {isPillCloudLayout ||
              readBlock('galleryLayout') === 'service-selector' ||
              readBlock('galleryLayout') === 'service-accordion' ? null : (
                <>
                  <ServicesOptionGrid
                    label={
                      isToolInspectorLayout
                        ? 'Largeur de l’inspecteur'
                        : 'Largeur de la carte'
                    }
                    options={
                      isToolInspectorLayout
                        ? PORTFOLIO_SKILLS_INSPECTOR_MAX_WIDTH_OPTIONS
                        : PORTFOLIO_SERVICES_CARD_MAX_WIDTH_OPTIONS
                    }
                    value={services.cardMaxWidth}
                    onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
                    columns={2}
                  />
                  <ServicesOptionGrid
                    label={
                      isToolInspectorLayout
                        ? 'Position de l’inspecteur'
                        : 'Alignement de la carte'
                    }
                    options={
                      isToolInspectorLayout
                        ? PORTFOLIO_SKILLS_INSPECTOR_ALIGNMENT_OPTIONS
                        : PORTFOLIO_SERVICES_CARD_ALIGNMENT_OPTIONS
                    }
                    value={services.cardAlignment}
                    onChange={(cardAlignment) => onChange({ cardAlignment })}
                    columns={3}
                  />
                  {services.cardMaxWidth !== 'full' ? (
                    <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                      {isToolInspectorLayout
                        ? 'Largeur plafonnée — placez l’inspecteur à gauche, au centre ou à droite.'
                        : 'Largeur plafonnée — aligne le cadre (gauche / centre / droite) comme les cartes Work.'}
                    </p>
                  ) : null}
                </>
              )}

              {isSkillsSpecialLayout ||
              readBlock('galleryLayout') === 'service-selector' ||
              readBlock('galleryLayout') === 'service-accordion' ? null : readBlock(
                  'displayMode'
                ) === 'marquee' ? (
                <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-950">Carrousel infini</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Animation pour{' '}
                    <span className="font-semibold">
                      {blockScope === 'skills' ? 'Tools / Skills' : 'Services'}
                    </span>{' '}
                    — nécessite le design <span className="font-semibold">Carte verticale</span>.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        servicesMarqueeActiveFor(
                          resolveServicesBlockPresentation(services, blockScope),
                          blockScope
                        )
                          ? 'bg-emerald-500'
                          : 'bg-neutral-300'
                      }`}
                      aria-hidden
                    />
                    {readBlock('galleryLayout') === 'card' ? (
                      <span className="font-medium text-emerald-700">animé</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => patchBlock({ galleryLayout: 'card' })}
                        className="font-medium text-orange-600 underline-offset-2 hover:underline"
                      >
                        passer en Carte verticale
                      </button>
                    )}
                  </div>
                  <ServicesOptionGrid
                    label="Direction"
                    options={PORTFOLIO_SERVICES_MARQUEE_DIRECTION_OPTIONS}
                    value={
                      blockScope === 'skills'
                        ? services.skillsMarqueeDirection
                        : services.servicesMarqueeDirection
                    }
                    onChange={(direction) =>
                      onChange(
                        blockScope === 'skills'
                          ? { skillsMarqueeDirection: direction }
                          : { servicesMarqueeDirection: direction }
                      )
                    }
                    columns={2}
                  />
                </div>
              ) : readBlock('displayMode') === 'coverflow' ? (
                <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-950">Coverflow vertical</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Pile centrée auto-rotative pour{' '}
                    <span className="font-semibold">
                      {blockScope === 'skills' ? 'Tools / Skills' : 'Services'}
                    </span>{' '}
                    — nécessite le design <span className="font-semibold">Carte verticale</span>.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        servicesCoverflowActiveFor(
                          resolveServicesBlockPresentation(services, blockScope),
                          blockScope
                        )
                          ? 'bg-emerald-500'
                          : 'bg-neutral-300'
                      }`}
                      aria-hidden
                    />
                    {readBlock('galleryLayout') === 'card' ? (
                      <span className="font-medium text-emerald-700">animé</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => patchBlock({ galleryLayout: 'card' })}
                        className="font-medium text-orange-600 underline-offset-2 hover:underline"
                      >
                        passer en Carte verticale
                      </button>
                    )}
                  </div>
                </div>
              ) : readBlock('displayMode') === 'deck' ? (
                <div className="space-y-4 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-neutral-950">Deck diagonal</p>
                    <p className="text-sm leading-relaxed text-neutral-600">
                      Éventail diagonal fluide pour{' '}
                      <span className="font-semibold">
                        {blockScope === 'skills' ? 'Tools / Skills' : 'Services'}
                      </span>{' '}
                      — nécessite le design <span className="font-semibold">Carte verticale</span>.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-neutral-700">
                      <span
                        className={`inline-flex h-2 w-2 rounded-full ${
                          servicesDeckActiveFor(
                            resolveServicesBlockPresentation(services, blockScope),
                            blockScope
                          )
                            ? 'bg-emerald-500'
                            : 'bg-neutral-300'
                        }`}
                        aria-hidden
                      />
                      {readBlock('galleryLayout') === 'card' ? (
                        <span className="font-medium text-emerald-700">animé</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => patchBlock({ galleryLayout: 'card' })}
                          className="font-medium text-orange-600 underline-offset-2 hover:underline"
                        >
                          passer en Carte verticale
                        </button>
                      )}
                    </div>
                  </div>
                  <ServicesOptionGrid
                    label="Effet d'entrée du deck"
                    options={PORTFOLIO_SERVICES_DECK_ENTRANCE_EFFECT_OPTIONS}
                    value={services.deckEntranceEffect ?? 'expand'}
                    onChange={(deckEntranceEffect) => onChange({ deckEntranceEffect })}
                    columns={2}
                  />
                </div>
              ) : (
                <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
                  Animation : choisissez <span className="font-semibold text-neutral-700">Carrousel infini</span>,{' '}
                  <span className="font-semibold text-neutral-700">Coverflow vertical</span> ou{' '}
                  <span className="font-semibold text-neutral-700">Deck diagonal</span>, puis{' '}
                  <span className="font-semibold text-neutral-700">Carte verticale</span> pour ce bloc.
                </p>
              )}
            </>
          ) : (
            <>
          <ServicesOptionGrid
            label="Design des services"
            options={PORTFOLIO_SERVICES_GALLERY_LAYOUT_OPTIONS}
            value={services.servicesGalleryLayout}
            onChange={(servicesGalleryLayout) =>
              onChange(servicesGalleryLayoutSettingsPatch(servicesGalleryLayout))
            }
            columns={2}
          />

          {services.servicesGalleryLayout === 'service-selector' ||
          services.servicesGalleryLayout === 'service-accordion' ? (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              Ce design occupe toute la largeur : les colonnes, le mode d&apos;affichage, la largeur
              de carte et l&apos;alignement ne s&apos;appliquent pas aux Services.
            </p>
          ) : (
            <ServicesOptionGrid
              label="Colonnes services (écran large)"
              options={PORTFOLIO_SERVICES_COLUMNS_OPTIONS}
              value={services.servicesColumns}
              onChange={(servicesColumns) => onChange({ servicesColumns })}
              columns={2}
            />
          )}

          <ServicesOptionGrid
            label="Design des outils / skills"
            options={PORTFOLIO_SKILLS_GALLERY_LAYOUT_OPTIONS}
            value={services.skillsGalleryLayout}
            onChange={(skillsGalleryLayout) =>
              onChange({
                skillsGalleryLayout,
                ...(skillsGalleryLayout === 'pill-cloud' || skillsGalleryLayout === 'tool-inspector'
                  ? {
                      displayMode: 'grid' as const,
                      ...(skillsGalleryLayout === 'tool-inspector'
                        ? {
                            showSkillDescription: true,
                            showSkillCurrentlyUsed: false,
                            skillsInspectorShowHint: false,
                          }
                        : {}),
                    }
                  : {}),
              })
            }
            columns={2}
          />

              {services.skillsGalleryLayout === 'tool-inspector' ? (
                <div className="space-y-3 rounded-2xl border border-sky-200/80 bg-sky-50/50 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-950">Tool inspector</p>
                  <p className="text-sm text-neutral-600">
                    Rail d&apos;icônes vertical ou horizontal + panneau détail.
                  </p>
                  <ServicesOptionGrid
                    label="Position du rail"
                    options={[
                      {
                        value: 'left',
                        label: 'Gauche',
                        description: 'Icônes à gauche, détail à droite.',
                      },
                      {
                        value: 'right',
                        label: 'Droite',
                        description: 'Détail à gauche, icônes à droite.',
                      },
                      {
                        value: 'top',
                        label: 'En haut',
                        description: 'Icônes alignées horizontalement au-dessus du détail.',
                      },
                    ]}
                    value={services.skillsInspectorRailPlacement}
                    onChange={(skillsInspectorRailPlacement) =>
                      onChange({ skillsInspectorRailPlacement })
                    }
                    columns={3}
                  />
                  <ServicesToolInspectorAdvancedFields
                    services={services}
                    onChange={onChange}
                  />
                  <ServicesToggleRow
                    label="Afficher la description"
                    description="Texte détaillé sous le nom de l’outil. Activé par défaut pour ce design."
                    checked={services.showSkillDescription !== false}
                    onChange={(showSkillDescription) => onChange({ showSkillDescription })}
                  />
                  <ServicesToggleRow
                    label="Afficher le niveau"
                    description="Ligne « Niveau : … / catégorie »."
                    checked={services.showSkillLevel !== false}
                    onChange={(showSkillLevel) => onChange({ showSkillLevel })}
                  />
                  <ServicesToggleRow
                    label="Afficher les cas d’usage"
                    description="Chips « Cas d’usage pratiques »."
                    checked={services.showSkillUseCases !== false}
                    onChange={(showSkillUseCases) => onChange({ showSkillUseCases })}
                  />
                  <ServicesToggleRow
                    label="Afficher l’expérience"
                    description="Années / libellé en pied de panneau."
                    checked={services.showSkillExperience !== false}
                    onChange={(showSkillExperience) => onChange({ showSkillExperience })}
                  />
                </div>
              ) : null}

          <ServicesOptionGrid
            label="Colonnes tools (écran large)"
            options={PORTFOLIO_SERVICES_COLUMNS_OPTIONS}
            value={services.skillsColumns}
            onChange={(skillsColumns) => onChange({ skillsColumns })}
            columns={2}
          />

          {services.servicesGalleryLayout === 'service-selector' ||
          services.servicesGalleryLayout === 'service-accordion' ? null : (
            <ServicesOptionGrid
              label="Mode d'affichage"
              options={PORTFOLIO_SERVICES_DISPLAY_MODE_OPTIONS}
              value={services.displayMode}
              onChange={(displayMode) => onChange(servicesDisplayModeSettingsPatch(services, displayMode))}
              columns={2}
            />
          )}

          {services.servicesGalleryLayout === 'service-selector' ||
          services.servicesGalleryLayout === 'service-accordion' ? null : (
            <>
              <ServicesOptionGrid
                label="Largeur de la carte"
                options={PORTFOLIO_SERVICES_CARD_MAX_WIDTH_OPTIONS}
                value={services.cardMaxWidth}
                onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
                columns={2}
              />
              <ServicesOptionGrid
                label="Alignement de la carte"
                options={PORTFOLIO_SERVICES_CARD_ALIGNMENT_OPTIONS}
                value={services.cardAlignment}
                onChange={(cardAlignment) => onChange({ cardAlignment })}
                columns={3}
              />
              {services.cardMaxWidth !== 'full' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Largeur plafonnée — aligne le cadre (gauche / centre / droite) comme les cartes Work.
                </p>
              ) : null}
            </>
          )}

          {services.servicesGalleryLayout === 'service-selector' ||
          services.servicesGalleryLayout === 'service-accordion'
            ? null
            : services.displayMode === 'marquee' ? (
            <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-950">Carrousel infini</p>
              <p className="text-sm leading-relaxed text-neutral-600">
                L&apos;animation de défilement s&apos;applique bloc par bloc, uniquement quand le design est{' '}
                <span className="font-semibold">Carte verticale</span>.
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-700">
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      servicesMarqueeActiveFor(services, 'services') ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                    aria-hidden
                  />
                  Services —{' '}
                  {services.servicesGalleryLayout === 'card' ? (
                    <span className="font-medium text-emerald-700">animé</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange({ servicesGalleryLayout: 'card' })}
                      className="font-medium text-orange-600 underline-offset-2 hover:underline"
                    >
                      passer en Carte verticale
                    </button>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      servicesMarqueeActiveFor(services, 'skills') ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                    aria-hidden
                  />
                  Tools / skills —{' '}
                  {services.skillsGalleryLayout === 'card' ? (
                    <span className="font-medium text-emerald-700">animé</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange({ skillsGalleryLayout: 'card' })}
                      className="font-medium text-orange-600 underline-offset-2 hover:underline"
                    >
                      passer en Carte verticale
                    </button>
                  )}
                </li>
              </ul>
              <div className="grid gap-4 sm:grid-cols-2">
                <ServicesOptionGrid
                  label="Direction Services"
                  options={PORTFOLIO_SERVICES_MARQUEE_DIRECTION_OPTIONS}
                  value={services.servicesMarqueeDirection}
                  onChange={(servicesMarqueeDirection) => onChange({ servicesMarqueeDirection })}
                  columns={2}
                />
                <ServicesOptionGrid
                  label="Direction Skills"
                  options={PORTFOLIO_SERVICES_MARQUEE_DIRECTION_OPTIONS}
                  value={services.skillsMarqueeDirection}
                  onChange={(skillsMarqueeDirection) => onChange({ skillsMarqueeDirection })}
                  columns={2}
                />
              </div>
            </div>
          ) : services.displayMode === 'coverflow' ? (
            <div className="space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
              <p className="text-sm font-semibold text-neutral-950">Coverflow vertical</p>
              <p className="text-sm leading-relaxed text-neutral-600">
                Pile centrée auto-rotative, uniquement quand le design est{' '}
                <span className="font-semibold">Carte verticale</span>.
              </p>
              <ul className="space-y-1.5 text-sm text-neutral-700">
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      servicesCoverflowActiveFor(services, 'services') ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                    aria-hidden
                  />
                  Services —{' '}
                  {services.servicesGalleryLayout === 'card' ? (
                    <span className="font-medium text-emerald-700">animé</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange({ servicesGalleryLayout: 'card' })}
                      className="font-medium text-orange-600 underline-offset-2 hover:underline"
                    >
                      passer en Carte verticale
                    </button>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      servicesCoverflowActiveFor(services, 'skills') ? 'bg-emerald-500' : 'bg-neutral-300'
                    }`}
                    aria-hidden
                  />
                  Tools / skills —{' '}
                  {services.skillsGalleryLayout === 'card' ? (
                    <span className="font-medium text-emerald-700">animé</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChange({ skillsGalleryLayout: 'card' })}
                      className="font-medium text-orange-600 underline-offset-2 hover:underline"
                    >
                      passer en Carte verticale
                    </button>
                  )}
                </li>
              </ul>
            </div>
          ) : services.displayMode === 'deck' ? (
            <div className="space-y-4 rounded-2xl border border-orange-200/80 bg-orange-50/50 px-4 py-3">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-neutral-950">Deck diagonal</p>
                <p className="text-sm leading-relaxed text-neutral-600">
                  Éventail diagonal fluide, uniquement quand le design est{' '}
                  <span className="font-semibold">Carte verticale</span>.
                </p>
                <ul className="space-y-1.5 text-sm text-neutral-700">
                  <li className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        servicesDeckActiveFor(services, 'services') ? 'bg-emerald-500' : 'bg-neutral-300'
                      }`}
                      aria-hidden
                    />
                    Services —{' '}
                    {services.servicesGalleryLayout === 'card' ? (
                      <span className="font-medium text-emerald-700">animé</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onChange({ servicesGalleryLayout: 'card' })}
                        className="font-medium text-orange-600 underline-offset-2 hover:underline"
                      >
                        passer en Carte verticale
                      </button>
                    )}
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        servicesDeckActiveFor(services, 'skills') ? 'bg-emerald-500' : 'bg-neutral-300'
                      }`}
                      aria-hidden
                    />
                    Tools / skills —{' '}
                    {services.skillsGalleryLayout === 'card' ? (
                      <span className="font-medium text-emerald-700">animé</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onChange({ skillsGalleryLayout: 'card' })}
                        className="font-medium text-orange-600 underline-offset-2 hover:underline"
                      >
                        passer en Carte verticale
                      </button>
                    )}
                  </li>
                </ul>
              </div>
              <ServicesOptionGrid
                label="Effet d'entrée du deck"
                options={PORTFOLIO_SERVICES_DECK_ENTRANCE_EFFECT_OPTIONS}
                value={services.deckEntranceEffect ?? 'expand'}
                onChange={(deckEntranceEffect) => onChange({ deckEntranceEffect })}
                columns={2}
              />
            </div>
          ) : (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              Pour animer les cartes, choisissez{' '}
              <span className="font-semibold text-neutral-700">Carrousel infini</span>,{' '}
              <span className="font-semibold text-neutral-700">Coverflow vertical</span> ou{' '}
              <span className="font-semibold text-neutral-700">Deck diagonal</span>, puis le design{' '}
              <span className="font-semibold text-neutral-700">Carte verticale</span>.
            </p>
          )}
            </>
          )}

          <ServicesOptionGrid
            label="Stage frame"
            options={PORTFOLIO_SERVICES_STAGE_DESIGN_OPTIONS}
            value={readBlock('stageDesign')}
            onChange={(stageDesign) =>
              patchFrame({
                stageDesign,
                ...stageChromePresetForDesign(stageDesign),
              })
            }
          />

          {readBlock('stageDesign') === 'open' || readBlock('stageDesign') === 'none' ? (
            <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-500">
              Open / None n&apos;ajoutent pas de cadre par défaut. Activez un fond, une bordure ou un
              motif ci-dessous pour en créer un.
            </p>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Chrome du stage</p>
              <p className="mt-1 text-sm text-neutral-500">
                Fond, bordure, arrondi, padding et motif du panneau autour des cartes (Soft panel,
                Framed, ou Open personnalisé).
              </p>
            </div>

            <ServicesToggleRow
              label="Fond du stage"
              description="Couleur de fond derrière les carrousels (ex. Soft panel gris)."
              checked={readBlock('stageBackgroundEnabled')}
              onChange={(stageBackgroundEnabled) => patchFrame({ stageBackgroundEnabled })}
            />

            {readBlock('stageBackgroundEnabled') ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ServicesFrameColorField
                  services={services}
                  onChange={onChange}
                  slot="stageBackground"
                  label="Couleur de fond"
                  value={readBlock('stageBackgroundColor')}
                  onManualChange={(stageBackgroundColor) =>
                    patchFrame({ stageBackgroundColor, stageBackgroundEnabled: true })
                  }
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-800">
                    Opacité fond — {readBlock('stageBackgroundOpacity')}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={readBlock('stageBackgroundOpacity')}
                    onChange={(event) =>
                      patchFrame({ stageBackgroundOpacity: Number(event.target.value) })
                    }
                    className="w-full accent-neutral-900"
                  />
                </label>
              </div>
            ) : null}

            <ServicesOptionGrid
              label="Bordure du stage"
              options={PORTFOLIO_SERVICES_STAGE_BORDER_OPTIONS}
              value={readBlock('stageBorder')}
              onChange={(stageBorder) => patchFrame({ stageBorder })}
              columns={3}
            />

            {readBlock('stageBorder') !== 'none' ? (
              <ServicesFrameColorField
                services={services}
                onChange={onChange}
                slot="stageBorder"
                label="Couleur de bordure"
                value={readBlock('stageBorderColor')}
                onManualChange={(stageBorderColor) => patchFrame({ stageBorderColor })}
              />
            ) : null}

            <ServicesOptionGrid
              label="Arrondi"
              options={PORTFOLIO_SERVICES_STAGE_RADIUS_OPTIONS}
              value={readBlock('stageBorderRadius')}
              onChange={(stageBorderRadius) => patchFrame({ stageBorderRadius })}
            />

            <ServicesOptionGrid
              label="Padding"
              options={PORTFOLIO_SERVICES_STAGE_PADDING_OPTIONS}
              value={readBlock('stagePadding')}
              onChange={(stagePadding) => patchFrame({ stagePadding })}
            />

            <ServicesOptionGrid
              label="Coins du stage"
              options={PORTFOLIO_SERVICES_STAGE_CORNERS_OPTIONS}
              value={readBlock('stageCorners') ?? 'none'}
              onChange={(stageCorners) => patchFrame({ stageCorners })}
              columns={3}
            />

            <ServicesOptionGrid
              label="Largeur du stage"
              options={PORTFOLIO_SERVICES_CARD_MAX_WIDTH_OPTIONS}
              value={readBlock('stageMaxWidth') ?? 'full'}
              onChange={(stageMaxWidth) => patchFrame({ stageMaxWidth })}
              columns={2}
            />
            {readBlock('stageMaxWidth') && readBlock('stageMaxWidth') !== 'full' ? (
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                Plafonne la largeur du panneau (les côtés que tu marques). Pour zoomer les cartes
                elles-mêmes, utilise aussi <span className="font-semibold">Largeur de la carte</span>{' '}
                plus haut.
              </p>
            ) : null}

            <ServicesOptionGrid
              label="Motif de fond"
              options={PORTFOLIO_SERVICES_STAGE_PATTERN_OPTIONS}
              value={readBlock('stagePattern')}
              onChange={(stagePattern) => patchFrame({ stagePattern })}
              columns={2}
            />

            {readBlock('stagePattern') !== 'none' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <ServicesFrameColorField
                  services={services}
                  onChange={onChange}
                  slot="stagePattern"
                  label="Couleur du motif"
                  value={readBlock('stagePatternColor')}
                  onManualChange={(stagePatternColor) => patchFrame({ stagePatternColor })}
                />
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-800">
                    Opacité motif — {readBlock('stagePatternOpacity')}%
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={readBlock('stagePatternOpacity')}
                    onChange={(event) =>
                      patchFrame({ stagePatternOpacity: Number(event.target.value) })
                    }
                    className="w-full accent-neutral-900"
                  />
                </label>
              </div>
            ) : null}
          </div>

          {isPillCloudLayout ? (
            <ServicesFrameColorField
              services={services}
              onChange={onChange}
              slot="cardAccent"
              label="Couleur de secours des pastilles"
              value={readBlock('cardAccentColor')}
              onManualChange={(cardAccentColor) => patchFrame({ cardAccentColor })}
            />
          ) : (
            <>
              <ServicesCardDesignGrid
                value={activeCardDesign}
                intensities={readBlock('cardDesignIntensities')}
                tints={readBlock('cardDesignTints')}
                accentColor={readBlock('cardAccentColor')}
                onChange={(cardDesign) => patchFrame({ cardDesign })}
                onIntensityChange={(intensity) => {
                  const intensities = readBlock('cardDesignIntensities');
                  patchFrame({
                    cardDesignIntensities: {
                      ...intensities,
                      [activeCardDesign]: intensity,
                    },
                  });
                }}
                onTintChange={(tint) => {
                  const tints = readBlock('cardDesignTints');
                  patchFrame({
                    cardDesignTints: {
                      ...tints,
                      [activeCardDesign]: tint,
                    },
                  });
                }}
              />
              {activeCardDesign === 'accent' ||
              readBlock('cardBorder') === 'accent' ||
              servicesCardDesignSupportsTint(activeCardDesign) ? (
                <ServicesFrameColorField
                  services={services}
                  onChange={onChange}
                  slot="cardAccent"
                  label="Couleur de teinte / accent"
                  value={readBlock('cardAccentColor')}
                  onManualChange={(cardAccentColor) => patchFrame({ cardAccentColor })}
                />
              ) : null}
            </>
          )}
        </>
      ) : null}

      {subSection === 'cards' ? (
        <>
          {isPillCloudLayout ? (
            <p className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-neutral-600">
              Le nuage centre et répartit automatiquement ses capsules. Alignement interne,
              puces de liste et espacement de contenu sont désactivés pour ce design.
            </p>
          ) : (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Alignement contenu</p>
              <p className="mt-1 text-sm text-neutral-500">
                {settingsFocus === 'skills'
                  ? 'Icône + titre bougent ensemble (gauche / centre / droite), tout en gardant les icônes alignées verticalement.'
                  : 'Position du contenu à l’intérieur de chaque carte.'}
              </p>
            </div>
            <ServicesOptionGrid
              label="Content alignment"
              options={PORTFOLIO_SERVICES_CONTENT_ALIGNMENT_OPTIONS}
              value={readBlock('contentAlignment')}
              onChange={(contentAlignment) => patchBlock({ contentAlignment })}
              columns={3}
            />
            {settingsFocus === 'skills' ? (
              <div className="space-y-4 border-t border-neutral-200/80 pt-4">
                <ServicesToggleRow
                  label="List bullet"
                  description="Show a list marker before the skill icon / title inside each frame."
                  checked={services.skillsShowBullet === true}
                  onChange={(skillsShowBullet) => onChange({ skillsShowBullet })}
                />
                {services.skillsShowBullet === true ? (
                  <>
                    <ServicesOptionGrid
                      label="Bullet source"
                      options={[
                        {
                          value: 'global',
                          label: 'Global',
                          description: 'Follow Global → Task list bullets.',
                        },
                        {
                          value: 'section',
                          label: 'Section',
                          description: 'Override styles below for Skills only.',
                        },
                      ]}
                      value={services.skillsBulletSource ?? 'global'}
                      onChange={(skillsBulletSource) => onChange({ skillsBulletSource })}
                      columns={2}
                    />
                    {(services.skillsBulletSource ?? 'global') === 'section' ? (
                      <>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Bullet style
                          </p>
                          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                            {PORTFOLIO_SERVICES_TASK_BULLET_STYLE_OPTIONS.map((option) => {
                              const active = (services.skillsBulletStyle ?? 'disc') === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  title={`${option.label} — ${option.description}`}
                                  onClick={() => onChange({ skillsBulletStyle: option.value })}
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
                        {(services.skillsBulletStyle ?? 'disc') !== 'none' ? (
                          <>
                            <PortfolioListMarkerSizeWeightControls
                              size={services.skillsBulletSize ?? 'md'}
                              sizePx={services.skillsBulletSizePx}
                              weight={services.skillsBulletWeight ?? 'regular'}
                              weightAmount={services.skillsBulletWeightAmount}
                              OptionGrid={ServicesOptionGrid}
                              onChange={(patch) =>
                                onChange({
                                  ...(patch.size !== undefined ? { skillsBulletSize: patch.size } : null),
                                  ...(patch.sizePx !== undefined
                                    ? { skillsBulletSizePx: patch.sizePx }
                                    : null),
                                  ...(patch.weight !== undefined
                                    ? { skillsBulletWeight: patch.weight }
                                    : null),
                                  ...(patch.weightAmount !== undefined
                                    ? { skillsBulletWeightAmount: patch.weightAmount }
                                    : null),
                                })
                              }
                            />
                            <ServicesManualColorField
                              label="Bullet color"
                              value={services.skillsBulletColor || '#10b981'}
                              onChange={(skillsBulletColor) => onChange({ skillsBulletColor })}
                            />
                          </>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-sm text-neutral-500">
                        Using Global task list bullets. Switch to Section to override here.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            ) : null}
            <div className="space-y-3 border-t border-neutral-200/80 pt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Espacement vertical
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Écart entre tarif, titre, description, tâches et CTA dans la carte.
                </p>
              </div>
              <ServicesOptionGrid
                label="Presets"
                options={PORTFOLIO_SERVICES_CONTENT_GAP_OPTIONS}
                value={
                  (settingsFocus === 'skills'
                    ? services.skillsContentGap
                    : services.servicesContentGap) === 'custom'
                    ? ('' as 'md')
                    : ((settingsFocus === 'skills'
                        ? services.skillsContentGap
                        : services.servicesContentGap) as 'none' | 'sm' | 'md' | 'lg' | 'xl')
                }
                onChange={(gap) =>
                  onChange(
                    settingsFocus === 'skills'
                      ? {
                          skillsContentGap: gap,
                          skillsContentGapPx: SERVICES_CONTENT_GAP_PRESET_PX[gap],
                        }
                      : {
                          servicesContentGap: gap,
                          servicesContentGapPx: SERVICES_CONTENT_GAP_PRESET_PX[gap],
                        }
                  )
                }
                columns={3}
              />
              {(settingsFocus === 'skills'
                ? services.skillsContentGap
                : services.servicesContentGap) === 'custom' ? (
                <p className="text-xs font-medium text-amber-700">
                  Mode manuel actif — choisissez un preset ci-dessus pour en sortir.
                </p>
              ) : null}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Manuel (px)
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {clampServicesContentGapPx(
                      settingsFocus === 'skills'
                        ? services.skillsContentGapPx
                        : services.servicesContentGapPx,
                      14
                    )}
                    px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Valeur exacte entre les éléments à l&apos;intérieur de la carte.
                </p>
                <input
                  type="range"
                  min={SERVICES_CONTENT_GAP_PX_MIN}
                  max={SERVICES_CONTENT_GAP_PX_MAX}
                  step={1}
                  value={clampServicesContentGapPx(
                    settingsFocus === 'skills'
                      ? services.skillsContentGapPx
                      : services.servicesContentGapPx,
                    14
                  )}
                  onChange={(event) => {
                    const px = clampServicesContentGapPx(Number(event.target.value), 14);
                    onChange(
                      settingsFocus === 'skills'
                        ? { skillsContentGap: 'custom', skillsContentGapPx: px }
                        : { servicesContentGap: 'custom', servicesContentGapPx: px }
                    );
                  }}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Espacement vertical manuel en pixels"
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                  <span>{SERVICES_CONTENT_GAP_PX_MIN}px</span>
                  <span>{SERVICES_CONTENT_GAP_PX_MAX}px</span>
                </div>
              </div>
            </div>
            </div>
          )}
        </>
      ) : null}

      {subSection === 'cards' ? (
        <div className="space-y-6">
          <p className="text-sm text-neutral-500">
            Cadre et fond pour{' '}
            <span className="font-semibold text-neutral-800">
              {settingsFocus === 'skills' ? 'Skills' : 'Services'}
            </span>
            .
          </p>
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre & fond</p>
              <p className="mt-1 text-sm text-neutral-500">
                Bordure, couleur, fond, arrondi et padding pour les cartes de cette section.
              </p>
            </div>

            <ServicesOptionGrid
              label="Bordure"
              options={PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS}
              value={activeFrameSettings.cardBorder}
              onChange={(cardBorder) => patchFrame({ cardBorder })}
              columns={2}
            />

            {activeFrameSettings.cardBorder !== 'none' ? (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Opacité de la bordure
                  </p>
                  <span className="text-sm font-semibold text-neutral-700">
                    {activeFrameSettings.cardBorderOpacity ?? 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={activeFrameSettings.cardBorderOpacity ?? 100}
                  onChange={(event) =>
                    patchFrame({ cardBorderOpacity: Number(event.target.value) })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Opacité de la bordure de carte"
                />
              </div>
            ) : null}

            {servicesCardDesignOwnsBackground(activeCardDesign) ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Le design <span className="font-semibold">{activeCardDesign}</span> gère son propre fond
                (compact / glass). Changez de design carte pour appliquer les couleurs de cadre
                ci-dessous.
              </p>
            ) : null}

            <ServicesOptionGrid
              label="Type de fond"
              options={PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS}
              value={activeFrameSettings.cardBackgroundFill}
              onChange={(cardBackgroundFill) => {
                if (cardBackgroundFill === 'solid') {
                  patchFrame({
                    cardBackgroundFill,
                    cardBackgroundEnabled: true,
                    cardBackgroundColor:
                      activeFrameSettings.cardBackgroundColor ||
                      activeFrameSettings.cardBackgroundColorA,
                  });
                  return;
                }
                patchFrame({
                  cardBackgroundFill,
                  // Split and alternation conflict — keep uniform when switching to split.
                  cardBackgroundAlternation: 'uniform',
                });
              }}
              columns={2}
            />

            {activeFrameSettings.cardBackgroundFill === 'solid' ? (
              <>
                <ServicesOptionGrid
                  label="Alternance de fond"
                  options={PORTFOLIO_SERVICES_CARD_BACKGROUND_ALTERNATION_OPTIONS}
                  value={activeFrameSettings.cardBackgroundAlternation}
                  onChange={(cardBackgroundAlternation) =>
                    patchFrame({
                      cardBackgroundAlternation,
                      cardBackgroundEnabled: true,
                    })
                  }
                  columns={2}
                />

                <ServicesToggleRow
                  label="Fond du cadre"
                  description={
                    settingsFocus === 'skills'
                      ? 'Appliquer une couleur de fond derrière le contenu des cartes Skills uniquement.'
                      : 'Appliquer une couleur de fond derrière le contenu des cartes Services uniquement.'
                  }
                  checked={activeFrameSettings.cardBackgroundEnabled}
                  onChange={(cardBackgroundEnabled) => {
                    if (!cardBackgroundEnabled) {
                      patchFrame({
                        cardBackgroundEnabled: false,
                        cardBackgroundAlternation: 'uniform',
                      });
                      return;
                    }
                    patchFrame({ cardBackgroundEnabled: true });
                  }}
                />

                {activeFrameSettings.cardBackgroundEnabled ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ServicesFrameColorField
                        services={services}
                        onChange={onChange}
                        slot="cardBackground"
                        label={
                          activeFrameSettings.cardBackgroundAlternation === 'alternate'
                            ? 'Couleur cartes claires (light)'
                            : 'Couleur de fond (light)'
                        }
                        value={activeFrameSettings.cardBackgroundColor}
                        onManualChange={(cardBackgroundColor) =>
                          patchFrame({
                            cardBackgroundColor,
                            cardBackgroundColorA: cardBackgroundColor,
                            cardBackgroundEnabled: true,
                          })
                        }
                      />
                      {activeFrameSettings.cardBackgroundAlternation === 'alternate' ? (
                        <ServicesFrameColorField
                          services={services}
                          onChange={onChange}
                          slot="cardAccent"
                          label="Couleur cartes alternées (light)"
                          value={activeFrameSettings.cardBackgroundColorB}
                          onManualChange={(cardBackgroundColorB) =>
                            patchFrame({ cardBackgroundColorB })
                          }
                        />
                      ) : null}
                    </div>
                    {services.useHeroPalette === false ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <ServicesManualColorField
                          label={
                            activeFrameSettings.cardBackgroundAlternation === 'alternate'
                              ? 'Couleur cartes claires (dark)'
                              : 'Couleur de fond (dark)'
                          }
                          description="Global → Theme Dark, palette off."
                          value={
                            activeFrameSettings.cardBackgroundColorDark ||
                            services.cardBackgroundColorDark ||
                            '#171717'
                          }
                          onChange={(cardBackgroundColorDark) =>
                            patchFrame({ cardBackgroundColorDark })
                          }
                        />
                        {activeFrameSettings.cardBackgroundAlternation === 'alternate' ? (
                          <ServicesManualColorField
                            label="Couleur cartes alternées (dark)"
                            description="Global → Theme Dark, palette off."
                            value={
                              activeFrameSettings.cardBackgroundColorBDark ||
                              services.cardBackgroundColorBDark ||
                              '#262626'
                            }
                            onChange={(cardBackgroundColorBDark) =>
                              patchFrame({ cardBackgroundColorBDark })
                            }
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {activeFrameSettings.cardBackgroundAlternation === 'alternate' ? (
                      <div className="space-y-4 border-t border-neutral-200 pt-4">
                        <ServicesOptionGrid
                          label="Contraste du texte"
                          options={PORTFOLIO_SERVICES_CARD_TEXT_CONTRAST_OPTIONS}
                          value={services.cardTextContrast ?? 'auto'}
                          onChange={(cardTextContrast) => onChange({ cardTextContrast })}
                          columns={2}
                        />
                        {(services.cardTextContrast ?? 'auto') === 'pair-ab' ? (
                          <div className="space-y-4">
                            <p className="text-sm text-neutral-500">
                              Cartes claires (A) et cartes alternées (B) — deux paires, pas une
                              couleur par carte.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <ServicesManualColorField
                                label="Titre — cartes A"
                                value={services.cardInkStrongA || DEFAULT_SERVICES_CARD_INK_STRONG_A}
                                onChange={(cardInkStrongA) => onChange({ cardInkStrongA })}
                              />
                              <ServicesManualColorField
                                label="Description — cartes A"
                                value={services.cardInkMutedA || DEFAULT_SERVICES_CARD_INK_MUTED_A}
                                onChange={(cardInkMutedA) => onChange({ cardInkMutedA })}
                              />
                              <ServicesManualColorField
                                label="Titre — cartes B"
                                value={services.cardInkStrongB || DEFAULT_SERVICES_CARD_INK_STRONG_B}
                                onChange={(cardInkStrongB) => onChange({ cardInkStrongB })}
                              />
                              <ServicesManualColorField
                                label="Description — cartes B"
                                value={services.cardInkMutedB || DEFAULT_SERVICES_CARD_INK_MUTED_B}
                                onChange={(cardInkMutedB) => onChange({ cardInkMutedB })}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500">
                            En contraste auto, le texte devient clair ou foncé selon le fond de
                            chaque carte (ex. blanc → texte sombre, orange → texte clair).
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Fond divisé</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Deux zones de couleur sur chaque carte. L’alternance carte à carte est désactivée
                    en mode divisé.
                  </p>
                </div>

                <ServicesOptionGrid
                  label="Forme de séparation"
                  options={PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS}
                  value={activeFrameSettings.cardDividerShape}
                  onChange={(cardDividerShape) => patchFrame({ cardDividerShape })}
                  columns={2}
                />

                {activeFrameSettings.cardDividerShape === 'diagonal' ? (
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Angle de la diagonale
                      </p>
                      <span className="text-sm font-semibold text-neutral-700">
                        {activeFrameSettings.cardDividerAngle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={359}
                      step={1}
                      value={activeFrameSettings.cardDividerAngle}
                      onChange={(event) =>
                        patchFrame({ cardDividerAngle: Number(event.target.value) })
                      }
                      className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                      aria-label="Angle de la diagonale"
                    />
                  </div>
                ) : (
                  <ServicesOptionGrid
                    label="Axe de séparation"
                    options={PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS}
                    value={activeFrameSettings.cardBackgroundSplitAxis}
                    onChange={(cardBackgroundSplitAxis) => patchFrame({ cardBackgroundSplitAxis })}
                    columns={2}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <ServicesFrameColorField
                    services={services}
                    onChange={onChange}
                    slot="cardBackground"
                    label={
                      activeFrameSettings.cardDividerShape === 'diagonal'
                        ? 'Couleur zone A'
                        : activeFrameSettings.cardBackgroundSplitAxis === 'y'
                          ? 'Couleur zone haut'
                          : 'Couleur zone gauche'
                    }
                    value={activeFrameSettings.cardBackgroundColorA}
                    onManualChange={(cardBackgroundColorA) => patchFrame({ cardBackgroundColorA })}
                  />
                  <ServicesFrameColorField
                    services={services}
                    onChange={onChange}
                    slot="cardAccent"
                    label={
                      activeFrameSettings.cardDividerShape === 'diagonal'
                        ? 'Couleur zone B'
                        : activeFrameSettings.cardBackgroundSplitAxis === 'y'
                          ? 'Couleur zone bas'
                          : 'Couleur zone droite'
                    }
                    value={activeFrameSettings.cardBackgroundColorB}
                    onManualChange={(cardBackgroundColorB) => patchFrame({ cardBackgroundColorB })}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Position de la séparation
                    </p>
                    <span className="text-sm font-semibold text-neutral-700">
                      {activeFrameSettings.cardBackgroundSplitPosition}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={92}
                    step={1}
                    value={activeFrameSettings.cardBackgroundSplitPosition}
                    onChange={(event) =>
                      patchFrame({ cardBackgroundSplitPosition: Number(event.target.value) })
                    }
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label="Position de la séparation"
                  />
                </div>

                <div
                  className="h-16 w-full overflow-hidden rounded-xl border border-neutral-200/80"
                  style={servicesCardSplitBackgroundLayerStyle(activeFrameSettings)}
                  aria-hidden
                />

                <ServicesToggleRow
                  label="Ligne de séparation"
                  description="Afficher un trait sur la frontière entre les deux zones."
                  checked={activeFrameSettings.cardDividerEnabled}
                  onChange={(cardDividerEnabled) => patchFrame({ cardDividerEnabled })}
                />

                {activeFrameSettings.cardDividerEnabled ? (
                  <div className="space-y-4">
                    {activeFrameSettings.cardDividerShape === 'curve' ||
                    activeFrameSettings.cardDividerShape === 'wave' ? (
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            {activeFrameSettings.cardDividerShape === 'curve'
                              ? 'Courbure'
                              : 'Amplitude vague'}
                          </p>
                          <span className="text-xs font-semibold text-neutral-600">
                            {activeFrameSettings.cardDividerCurveDepth}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={2}
                          max={40}
                          step={1}
                          value={activeFrameSettings.cardDividerCurveDepth}
                          onChange={(event) =>
                            patchFrame({ cardDividerCurveDepth: Number(event.target.value) })
                          }
                          className="w-full accent-neutral-900"
                          aria-label="Profondeur de courbe"
                        />
                      </div>
                    ) : null}

                    <ServicesFrameColorField
                      services={services}
                      onChange={onChange}
                      slot="cardBorder"
                      label="Couleur du trait"
                      value={activeFrameSettings.cardDividerColor}
                      onManualChange={(cardDividerColor) => patchFrame({ cardDividerColor })}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Épaisseur
                          </p>
                          <span className="text-xs font-semibold text-neutral-600">
                            {activeFrameSettings.cardDividerThickness}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={8}
                          step={1}
                          value={activeFrameSettings.cardDividerThickness}
                          onChange={(event) =>
                            patchFrame({ cardDividerThickness: Number(event.target.value) })
                          }
                          className="w-full accent-neutral-900"
                        />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Opacité
                          </p>
                          <span className="text-xs font-semibold text-neutral-600">
                            {activeFrameSettings.cardDividerOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={1}
                          value={activeFrameSettings.cardDividerOpacity}
                          onChange={(event) =>
                            patchFrame({ cardDividerOpacity: Number(event.target.value) })
                          }
                          className="w-full accent-neutral-900"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Décor géométrique</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Teinte ou forme placée librement dans le cadre — redimensionnable, avec séquence
                  d’apparition optionnelle.
                </p>
              </div>

              <ServicesToggleRow
                label="Activer le décor"
                description="Affiche une forme ou teinte décorative derrière le contenu de la carte."
                checked={activeFrameSettings.cardDecorEnabled}
                onChange={(cardDecorEnabled) => patchFrame({ cardDecorEnabled })}
              />

              {activeFrameSettings.cardDecorEnabled ? (
                <>
                  <ServicesOptionGrid
                    label="Forme"
                    options={PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS}
                    value={activeFrameSettings.cardDecorShape}
                    onChange={(cardDecorShape) => patchFrame({ cardDecorShape })}
                    columns={2}
                  />

                  <ServicesFrameColorField
                    services={services}
                    onChange={onChange}
                    slot="cardAccent"
                    label="Couleur / teinte"
                    value={activeFrameSettings.cardDecorColor}
                    onManualChange={(cardDecorColor) => patchFrame({ cardDecorColor })}
                  />

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Opacité
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {activeFrameSettings.cardDecorOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={100}
                      step={1}
                      value={activeFrameSettings.cardDecorOpacity}
                      onChange={(event) =>
                        patchFrame({ cardDecorOpacity: Number(event.target.value) })
                      }
                      className="w-full accent-neutral-900"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Taille
                      </p>
                      <span className="text-xs font-semibold text-neutral-600">
                        {activeFrameSettings.cardDecorSize}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={160}
                      step={1}
                      value={activeFrameSettings.cardDecorSize}
                      onChange={(event) => patchFrame({ cardDecorSize: Number(event.target.value) })}
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
                          {activeFrameSettings.cardDecorX}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={activeFrameSettings.cardDecorX}
                        onChange={(event) => patchFrame({ cardDecorX: Number(event.target.value) })}
                        className="w-full accent-neutral-900"
                      />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Position Y
                        </p>
                        <span className="text-xs font-semibold text-neutral-600">
                          {activeFrameSettings.cardDecorY}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={activeFrameSettings.cardDecorY}
                        onChange={(event) => patchFrame({ cardDecorY: Number(event.target.value) })}
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
                        {activeFrameSettings.cardDecorRotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={activeFrameSettings.cardDecorRotation}
                      onChange={(event) =>
                        patchFrame({ cardDecorRotation: Number(event.target.value) })
                      }
                      className="w-full accent-neutral-900"
                    />
                  </div>

                  <ServicesOptionGrid
                    label="Séquence d’alternance"
                    options={PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS}
                    value={activeFrameSettings.cardDecorAlternation}
                    onChange={(cardDecorAlternation) => patchFrame({ cardDecorAlternation })}
                    columns={2}
                  />

                  <div className="relative h-28 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                    <div
                      className="absolute inset-0"
                      style={servicesCardDecorShellStyle(activeFrameSettings)}
                      aria-hidden
                    />
                    <p className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                      Aperçu position
                    </p>
                  </div>
                </>
              ) : null}
            </div>

            {activeFrameSettings.cardBorder === 'soft' || activeFrameSettings.cardBorder === 'solid' ? (
              <ServicesFrameColorField
                services={services}
                onChange={onChange}
                slot="cardBorder"
                label="Couleur de bordure"
                value={activeFrameSettings.cardBorderColor}
                onManualChange={(cardBorderColor) => patchFrame({ cardBorderColor })}
              />
            ) : null}

            {isPillCloudLayout ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3.5 py-3 text-sm text-neutral-500">
                Rayon et padding sont fixés par la géométrie compacte des pilules.
              </p>
            ) : (
              <>
                <ServicesOptionGrid
                  label="Arrondi"
                  options={PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS}
                  value={activeFrameSettings.cardBorderRadius}
                  onChange={(cardBorderRadius) => patchFrame({ cardBorderRadius })}
                  columns={3}
                />

                <ServicesOptionGrid
                  label="Padding carte"
                  options={PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS}
                  value={activeFrameSettings.cardPadding}
                  onChange={(cardPadding) => patchFrame({ cardPadding })}
                  columns={2}
                />
              </>
            )}
          </div>
        </div>
      ) : null}

      {subSection === 'title' ? (
        <div className="space-y-6">
          {settingsFocus === 'skills' ? (
            <>
              <ServicesToggleRow
                label="Skill title"
                description="Afficher le titre sur chaque carte skill."
                checked={services.showSkillTitle}
                onChange={(showSkillTitle) => onChange({ showSkillTitle })}
              />
              {isPillCloudLayout ? (
                <p className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-neutral-600">
                  Le fond individuel du titre est désactivé : la pilule fournit déjà sa surface.
                </p>
              ) : (
                <ServicesElementChromeControls
                  services={services}
                  chromeId="skillTitle"
                  onChange={onChange}
                  title="Fond du titre"
                  description="Fond derrière le titre de la carte skill."
                />
              )}
              <ServicesInlineTypography
                services={services}
                onChange={onChange}
                target="skillTitle"
                title="Typographie du titre"
              />
            </>
          ) : (
            <>
              <ServicesToggleRow
                label="Service title"
                description="Afficher le titre sur chaque carte service."
                checked={services.showServiceTitle}
                onChange={(showServiceTitle) => onChange({ showServiceTitle })}
              />
              <ServicesElementChromeControls
                services={services}
                chromeId="cardTitle"
                onChange={onChange}
                title="Fond du titre"
                description="Fond derrière le titre de la carte service."
              />
              <ServicesInlineTypography
                services={services}
                onChange={onChange}
                target="cardTitle"
                title="Typographie du titre"
              />
            </>
          )}
        </div>
      ) : null}

      {subSection === 'description' ? (
        <div className="space-y-6">
          {settingsFocus === 'skills' ? (
            isPillCloudLayout ? (
              <p className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-neutral-600">
                Le nuage de pilules n&apos;affiche pas les descriptions afin de conserver des
                capsules compactes.
              </p>
            ) : (
              <>
              <ServicesToggleRow
                label="Skill description"
                description="Afficher la description sur chaque carte skill."
                checked={services.showSkillDescription}
                onChange={(showSkillDescription) => onChange({ showSkillDescription })}
              />
              <ServicesElementChromeControls
                services={services}
                chromeId="skillBody"
                onChange={onChange}
                title="Fond de la description"
                description="Fond derrière la description de la carte skill."
              />
              <ServicesInlineTypography
                services={services}
                onChange={onChange}
                target="skillBody"
                title="Typographie de la description"
              />
              </>
            )
          ) : (
            <>
              <ServicesToggleRow
                label="Service description"
                description="Afficher la description sur chaque carte service."
                checked={services.showServiceDescription}
                onChange={(showServiceDescription) => onChange({ showServiceDescription })}
              />
              <ServicesElementChromeControls
                services={services}
                chromeId="cardBody"
                onChange={onChange}
                title="Fond de la description"
                description="Fond derrière la description de la carte service."
              />
              <ServicesInlineTypography
                services={services}
                onChange={onChange}
                target="cardBody"
                title="Typographie de la description"
              />
            </>
          )}
        </div>
      ) : null}

      {subSection === 'tasks' && settingsFocus === 'services' ? (
        <div className="space-y-6">
          <ServicesToggleRow
            label="Tasks"
            description="Show the deliverables checklist on each service card. Edit task text in Creator Studio → Base → Portfolio → Services."
            checked={services.showServiceTasks !== false}
            onChange={(showServiceTasks) => onChange({ showServiceTasks })}
          />
          <ServicesOptionGrid
            label="Bullet source"
            options={[
              {
                value: 'global',
                label: 'Global',
                description: 'Follow Global → Task list bullets.',
              },
              {
                value: 'section',
                label: 'Section',
                description: 'Override with styles below for Services only.',
              },
            ]}
            value={resolveServicesTaskBulletSource(services)}
            onChange={(servicesTaskBulletSource) => onChange({ servicesTaskBulletSource })}
            columns={2}
          />
          {resolveServicesTaskBulletSource(services) === 'section' ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Task bullet style
                </p>
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {PORTFOLIO_SERVICES_TASK_BULLET_STYLE_OPTIONS.map((option) => {
                    const active = (services.servicesTaskBulletStyle ?? 'check') === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        title={`${option.label} — ${option.description}`}
                        onClick={() => onChange({ servicesTaskBulletStyle: option.value })}
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
              {(services.servicesTaskBulletStyle ?? 'check') !== 'none' ? (
                <>
                  <PortfolioListMarkerSizeWeightControls
                    size={services.servicesTaskBulletSize ?? 'md'}
                    sizePx={services.servicesTaskBulletSizePx}
                    weight={services.servicesTaskBulletWeight ?? 'regular'}
                    weightAmount={services.servicesTaskBulletWeightAmount}
                    OptionGrid={ServicesOptionGrid}
                    onChange={(patch) =>
                      onChange({
                        ...(patch.size !== undefined
                          ? { servicesTaskBulletSize: patch.size }
                          : null),
                        ...(patch.sizePx !== undefined
                          ? { servicesTaskBulletSizePx: patch.sizePx }
                          : null),
                        ...(patch.weight !== undefined
                          ? { servicesTaskBulletWeight: patch.weight }
                          : null),
                        ...(patch.weightAmount !== undefined
                          ? { servicesTaskBulletWeightAmount: patch.weightAmount }
                          : null),
                      })
                    }
                  />
                  <ServicesColorField
                    services={services}
                    onChange={onChange}
                    slot="tasksBullet"
                    label="Task bullet color"
                    description="Marker color before each task line."
                    value={services.servicesTaskBulletColor}
                  />
                </>
              ) : null}
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Using Global task list bullets. Switch to Section to override style, size, weight, and color here.
            </p>
          )}
          <ServicesElementChromeControls
            services={services}
            chromeId="tasks"
            onChange={onChange}
            title="Tasks background"
            description="Background behind the tasks list on the card."
          />
          <ServicesInlineTypography
            services={services}
            onChange={onChange}
            target="tasks"
            title="Tasks typography"
          />
        </div>
      ) : null}

      {subSection === 'icon' && settingsFocus === 'skills' ? (
        <div className="space-y-6">
          {isPillCloudLayout ? (
            <p className="rounded-2xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-neutral-600">
              Ce design remplace les grands logos par une petite pastille de marque. Sa taille et
              sa position sont optimisées automatiquement.
            </p>
          ) : (
            <>
              <ServicesToggleRow
                label="Couleurs marque des outils"
                description="Chaque carte prend la couleur exacte de l’outil (Premiere, CapCut, Framer…). Texte et icônes s’adaptent automatiquement."
                checked={services.skillsCardBrandFill === true}
                onChange={(skillsCardBrandFill) => onChange({ skillsCardBrandFill })}
              />
              <ServicesToggleRow
                label="Tool icon"
                description="Afficher l'icône de l'outil sur chaque carte."
                checked={services.showSkillIcon}
                onChange={(showSkillIcon) => onChange({ showSkillIcon })}
              />
              <ServicesOptionGrid
                label="Emplacement icône"
                options={PORTFOLIO_SERVICES_ICON_PLACEMENT_OPTIONS}
                value={readBlock('iconPlacement')}
                onChange={(iconPlacement) => patchBlock({ iconPlacement })}
                columns={2}
              />
              <ServicesOptionGrid
                label="Taille de l'icône"
                options={PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS}
                value={services.skillsIconSize}
                onChange={(skillsIconSize) => onChange({ skillsIconSize })}
                columns={2}
              />
              <ServicesOptionGrid
                label="Coins de l’icône"
                options={PORTFOLIO_SKILLS_ICON_RADIUS_OPTIONS}
                value={services.skillsIconRadius ?? 'full'}
                onChange={(skillsIconRadius) => onChange({ skillsIconRadius })}
                columns={3}
              />
              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4">
                <ServicesToggleRow
                  label="Fond de l’icône"
                  description="Affiche une couleur derrière le logo de l’outil."
                  checked={services.skillsIconBackgroundEnabled !== false}
                  onChange={(skillsIconBackgroundEnabled) =>
                    onChange({ skillsIconBackgroundEnabled })
                  }
                />
                {services.skillsIconBackgroundEnabled !== false ? (
                  <>
                    <ServicesToggleRow
                      label="Couleur de fond automatique"
                      description="Adapte le fond à la carte et au mode clair/sombre."
                      checked={services.skillsIconBackgroundManual !== true}
                      onChange={(automatic) =>
                        onChange({ skillsIconBackgroundManual: !automatic })
                      }
                    />
                    {services.skillsIconBackgroundManual === true ? (
                      <ServicesManualColorField
                        label="Couleur de fond personnalisée"
                        value={services.skillsIconBackgroundColor}
                        onChange={(skillsIconBackgroundColor) =>
                          onChange({
                            skillsIconBackgroundColor,
                            skillsIconBackgroundManual: true,
                          })
                        }
                      />
                    ) : null}
                  </>
                ) : null}
              </div>
              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4">
                <ServicesToggleRow
                  label="Bordure de l’icône"
                  description="Ajoute une bordure autour du fond de l’icône."
                  checked={services.skillsIconBorderEnabled !== false}
                  onChange={(skillsIconBorderEnabled) =>
                    onChange({ skillsIconBorderEnabled })
                  }
                />
                {services.skillsIconBorderEnabled !== false ? (
                  <>
                    <ServicesToggleRow
                      label="Couleur de bordure automatique"
                      description="Suit la bordure de la carte et les couleurs de marque."
                      checked={services.skillsIconBorderManual !== true}
                      onChange={(automatic) =>
                        onChange({ skillsIconBorderManual: !automatic })
                      }
                    />
                    {services.skillsIconBorderManual === true ? (
                      <ServicesManualColorField
                        label="Couleur de bordure personnalisée"
                        value={services.skillsIconBorderColor}
                        onChange={(skillsIconBorderColor) =>
                          onChange({
                            skillsIconBorderColor,
                            skillsIconBorderManual: true,
                          })
                        }
                      />
                    ) : null}
                    <label className="block rounded-2xl border border-neutral-200/80 bg-white p-4">
                      <span className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-neutral-900">
                          Épaisseur de bordure
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-neutral-700">
                          {clampSkillsIconBorderWidthPx(
                            services.skillsIconBorderWidthPx,
                            1
                          )}
                          px
                        </span>
                      </span>
                      <input
                        type="range"
                        min={SKILLS_ICON_BORDER_WIDTH_PX_MIN}
                        max={SKILLS_ICON_BORDER_WIDTH_PX_MAX}
                        step={1}
                        value={clampSkillsIconBorderWidthPx(
                          services.skillsIconBorderWidthPx,
                          1
                        )}
                        onChange={(event) =>
                          onChange({
                            skillsIconBorderWidthPx: clampSkillsIconBorderWidthPx(
                              event.target.value,
                              1
                            ),
                          })
                        }
                        className="mt-3 w-full accent-neutral-950"
                      />
                    </label>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>
      ) : null}

      {subSection === 'price' && settingsFocus === 'services' ? (
        <div className="space-y-6">
          <ServicesToggleRow
            label="Price"
            description="Afficher le prix sur chaque carte service."
            checked={services.showServicePrice}
            onChange={(showServicePrice) => onChange({ showServicePrice })}
          />
          <ServicesOptionGrid
            label="Emplacement prix"
            options={PORTFOLIO_SERVICES_PRICE_PLACEMENT_OPTIONS}
            value={readBlock('pricePlacement')}
            onChange={(pricePlacement) => patchBlock({ pricePlacement })}
            columns={3}
          />
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Unité monétaire
            </p>
            <p className="text-sm text-neutral-500">
              Symbole affiché avant ou après le prix — adapte la devise à ton pays (€, $, MAD…).
            </p>
            <select
              value={services.servicesCurrency || 'EUR'}
              onChange={(event) => onChange({ servicesCurrency: event.target.value })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
              aria-label="Unité monétaire"
            >
              {PORTFOLIO_SERVICES_CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>
          <ServicesOptionGrid
            label="Position du symbole"
            options={PORTFOLIO_SERVICES_CURRENCY_PLACEMENT_OPTIONS}
            value={services.serviceCurrencyPlacement ?? 'after'}
            onChange={(serviceCurrencyPlacement) => onChange({ serviceCurrencyPlacement })}
            columns={2}
          />
          <ServicesToggleRow
            label="Show From label"
            description="Préfixe avant le montant (From, À partir de…). Désactivé par défaut — active pour l’afficher."
            checked={services.servicePricePrefixEnabled === true}
            onChange={(servicePricePrefixEnabled) => onChange({ servicePricePrefixEnabled })}
          />
          {services.servicePricePrefixEnabled === true ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Texte du préfixe
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Laisse vide pour garder « From » par défaut.
              </p>
              <input
                type="text"
                value={services.servicePricePrefix ?? 'From'}
                onChange={(event) => onChange({ servicePricePrefix: event.target.value })}
                placeholder="From"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                aria-label="Texte du préfixe prix"
              />
            </div>
          ) : null}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Suffixe période
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Affiché à côté du prix (ex. « / mois », « / first month ») — utile pour Plan tarifaire.
            </p>
            <input
              type="text"
              value={services.servicePricePeriodSuffix ?? ''}
              onChange={(event) => onChange({ servicePricePeriodSuffix: event.target.value })}
              placeholder="/ mois"
              className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              aria-label="Suffixe période du prix"
            />
          </div>
          <ServicesOptionGrid
            label="Alignement du prix"
            options={PORTFOLIO_SERVICES_PRICE_ALIGN_OPTIONS}
            value={services.servicePriceAlign ?? 'left'}
            onChange={(servicePriceAlign) => onChange({ servicePriceAlign })}
            columns={3}
          />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Marge haute (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampServicePriceMarginPx(services.servicePriceMarginTopPx, 0)}px
                </span>
              </div>
              <input
                type="range"
                min={SERVICE_PRICE_MARGIN_PX_MIN}
                max={SERVICE_PRICE_MARGIN_PX_MAX}
                step={1}
                value={clampServicePriceMarginPx(services.servicePriceMarginTopPx, 0)}
                onChange={(event) =>
                  onChange({
                    servicePriceMarginTopPx: clampServicePriceMarginPx(Number(event.target.value), 0),
                  })
                }
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Marge haute du prix en pixels"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{SERVICE_PRICE_MARGIN_PX_MIN}px</span>
                <span>{SERVICE_PRICE_MARGIN_PX_MAX}px</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Marge basse (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampServicePriceMarginPx(services.servicePriceMarginBottomPx, 0)}px
                </span>
              </div>
              <input
                type="range"
                min={SERVICE_PRICE_MARGIN_PX_MIN}
                max={SERVICE_PRICE_MARGIN_PX_MAX}
                step={1}
                value={clampServicePriceMarginPx(services.servicePriceMarginBottomPx, 0)}
                onChange={(event) =>
                  onChange({
                    servicePriceMarginBottomPx: clampServicePriceMarginPx(
                      Number(event.target.value),
                      0
                    ),
                  })
                }
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Marge basse du prix en pixels"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{SERVICE_PRICE_MARGIN_PX_MIN}px</span>
                <span>{SERVICE_PRICE_MARGIN_PX_MAX}px</span>
              </div>
            </div>
          </div>
          <ServicesElementChromeControls
            services={services}
            chromeId="price"
            onChange={onChange}
            title="Fond du prix"
            description="Fond derrière le prix affiché sur la carte."
          />
          <ServicesInlineTypography
            services={services}
            onChange={onChange}
            target="price"
            title="Typographie du prix"
          />
        </div>
      ) : null}

      {subSection === 'delivery' && settingsFocus === 'services' ? (
        <div className="space-y-6">
          <ServicesToggleRow
            label="Delivery time"
            description="Afficher le délai de livraison sur chaque carte service."
            checked={services.showServiceDelivery}
            onChange={(showServiceDelivery) => onChange({ showServiceDelivery })}
          />
          <ServicesElementChromeControls
            services={services}
            chromeId="delivery"
            onChange={onChange}
            title="Fond de la livraison"
            description="Fond derrière le badge de délai de livraison."
          />
          <ServicesInlineTypography
            services={services}
            onChange={onChange}
            target="delivery"
            title="Typographie de la livraison"
          />
        </div>
      ) : null}

      {subSection === 'cta' && settingsFocus === 'services' ? (
        <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
          <div>
            <p className="text-sm font-semibold text-neutral-950">Bouton Commander</p>
            <p className="mt-1 text-sm text-neutral-500">
              Mêmes designs que le bouton <span className="font-semibold text-neutral-700">View project</span> du
              Portfolio.
            </p>
          </div>

          <ServicesToggleRow
            label="Afficher le bouton"
            checked={services.showServiceCta !== false}
            onChange={(showServiceCta) => onChange({ showServiceCta })}
          />

          {services.showServiceCta !== false ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Libellé du bouton
                </p>
                <input
                  type="text"
                  value={services.ctaLabel ?? 'Commander'}
                  onChange={(event) => onChange({ ctaLabel: event.target.value })}
                  placeholder="Commander"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
              </div>

              <ServicesOptionGrid
                label="Style du bouton"
                options={PORTFOLIO_SERVICES_CTA_DESIGN_OPTIONS}
                value={services.ctaDesign ?? 'pill-accent'}
                onChange={(ctaDesign) => onChange({ ctaDesign })}
                columns={2}
              />

              <ServicesToggleRow
                label="Afficher l’icône CTA"
                description="Glyphe à côté du libellé (flèche, play, plus…)."
                checked={services.ctaShowIcon !== false}
                onChange={(ctaShowIcon) => onChange({ ctaShowIcon })}
              />

              {services.ctaShowIcon !== false ? (
                <>
                  <ServicesOptionGrid
                    label="Position de l’icône"
                    options={PORTFOLIO_SERVICES_CTA_ICON_POSITION_OPTIONS}
                    value={services.ctaIconPosition ?? 'right'}
                    onChange={(ctaIconPosition) => onChange({ ctaIconPosition })}
                    columns={2}
                  />
                  <ServicesOptionGrid
                    label="Icône CTA"
                    options={PORTFOLIO_SERVICES_CTA_ICON_OPTIONS}
                    value={services.ctaIcon ?? 'arrow-up-right'}
                    onChange={(ctaIcon) => onChange({ ctaIcon })}
                    columns={2}
                  />
                </>
              ) : null}

              <ServicesOptionGrid
                label="Épaisseur de bordure"
                options={PORTFOLIO_SERVICES_CTA_BORDER_WIDTH_OPTIONS}
                value={services.ctaBorderWidth ?? 'thin'}
                onChange={(ctaBorderWidth) => onChange({ ctaBorderWidth })}
                columns={2}
              />

              <ServicesOptionGrid
                label="Coins arrondis (CTA)"
                options={PORTFOLIO_SERVICES_CTA_BORDER_RADIUS_OPTIONS}
                value={services.ctaBorderRadius ?? 'full'}
                onChange={(ctaBorderRadius) => onChange({ ctaBorderRadius })}
                columns={3}
              />

              <ServicesColorField
                services={services}
                onChange={onChange}
                slot="ctaAccent"
                label="Couleur accent (fill / outline)"
                value={services.ctaColor ?? services.cardAccentColor}
              />

              <ServicesColorField
                services={services}
                onChange={onChange}
                slot="ctaBorder"
                label="Bordure du bouton"
                value={services.ctaBorderColor ?? services.cardBorderColor}
              />

              <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
                <ServicesToggleRow
                  label="Activer le hover"
                  description="Au survol, le bouton bascule vers les couleurs ci-dessous."
                  checked={services.ctaHoverEnabled !== false}
                  onChange={(ctaHoverEnabled) => onChange({ ctaHoverEnabled })}
                />
                {services.ctaHoverEnabled !== false ? (
                  <>
                    <ServicesColorField
                      services={services}
                      onChange={onChange}
                      slot="ctaHoverBackground"
                      label="Fond au survol"
                      value={services.ctaHoverBackgroundColor ?? services.ctaColor}
                    />
                    <ServicesColorField
                      services={services}
                      onChange={onChange}
                      slot="ctaHoverText"
                      label="Texte au survol"
                      value={services.ctaHoverTextColor ?? '#0b0b0d'}
                    />
                    <ServicesColorField
                      services={services}
                      onChange={onChange}
                      slot="ctaHoverBorder"
                      label="Bordure au survol"
                      value={services.ctaHoverBorderColor ?? services.ctaColor}
                    />
                  </>
                ) : null}
              </div>

              <ServicesOptionGrid
                label="Alignement du bouton"
                options={PORTFOLIO_SERVICES_CTA_ALIGNMENT_OPTIONS}
                value={services.ctaAlignment ?? 'left'}
                onChange={(ctaAlignment) => onChange({ ctaAlignment })}
                columns={3}
              />

              <ServicesInlineTypography
                services={services}
                onChange={onChange}
                target="cta"
                title="Typographie du bouton"
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'palette' ? (
        <ServicesPalettePanel services={services} onChange={onChange} />
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <ServicesUsePaletteToggle
            services={services}
            onChange={onChange}
            description="When on, section fill colors follow palette tokens. Turn off to pick them freely below."
          />

          <SectionBackgroundSettingsFields
            settings={services}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              const slot = SERVICES_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return (
                  <ServicesManualColorField
                    label={label}
                    value={value}
                    onChange={onBgColorChange}
                  />
                );
              }
              return (
                <ServicesColorField
                  services={services}
                  onChange={onChange}
                  slot={slot}
                  label={label}
                  value={value}
                />
              );
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
