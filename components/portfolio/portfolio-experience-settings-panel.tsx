'use client';

import { useState } from 'react';
import {
  PORTFOLIO_EXPERIENCE_ASIDE_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_BENTO_DETAILS_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_CONTENT_ALIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_ELEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_ASPECT_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_FIT_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_POSITION_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_SIZE_OPTIONS,
  PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS,
  PORTFOLIO_EXPERIENCE_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_EXPERIENCE_ILLUSTRATION_OPTIONS,
  PORTFOLIO_EXPERIENCE_ILLUSTRATION_PLACEMENT_OPTIONS,
  experienceSectionLayoutIsAside,
  PORTFOLIO_EXPERIENCE_ITEM_DENSITY_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_TASK_ITEM_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_ITEMS_PER_ROW_OPTIONS,
  PORTFOLIO_EXPERIENCE_LIST_MAX_WIDTH_OPTIONS,
  PORTFOLIO_EXPERIENCE_LIST_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_MAGAZINE_COLUMN_RATIO_OPTIONS,
  PORTFOLIO_EXPERIENCE_STORY_CONTENT_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_DETAILS_CONTENT_GAP_OPTIONS,
  EXPERIENCE_STORY_CONTENT_GAP_PRESET_PX,
  EXPERIENCE_DETAILS_CONTENT_GAP_PRESET_PX,
  EXPERIENCE_STORY_CONTENT_GAP_PX_MIN,
  EXPERIENCE_STORY_CONTENT_GAP_PX_MAX,
  EXPERIENCE_DETAILS_CONTENT_GAP_PX_MIN,
  EXPERIENCE_DETAILS_CONTENT_GAP_PX_MAX,
  EXPERIENCE_ENTRY_MEDIA_SIZE_PRESET_PX,
  EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MIN,
  EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MAX,
  EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX,
  EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MIN,
  EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MAX,
  EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MIN,
  EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MAX,
  PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_HEIGHT_OPTIONS,
  clampExperienceStoryContentGapPx,
  clampExperienceDetailsContentGapPx,
  clampExperienceEntryMediaSizePx,
  clampExperienceEntryMediaHeightPx,
  clampExperienceMagazineSeparatorSpacingPx,
  resolveExperienceEntryMediaSizePx,
  resolveExperienceEntryMediaHeightPx,
  clampExperiencePeriodRuleOpacity,
  clampExperiencePeriodRuleThickness,
  clampExperienceTimelineRailOpacity,
  clampExperienceToolsSeparatorOpacity,
  EXPERIENCE_PERIOD_RULE_THICKNESS_MIN,
  EXPERIENCE_PERIOD_RULE_THICKNESS_MAX,
  isExperienceTimelineDesign,
  PORTFOLIO_EXPERIENCE_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_EXPERIENCE_TITLE_PRESET_OPTIONS,
  PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_STATUS_BADGE_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_PROOF_LINK_STYLE_OPTIONS,
  PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_DISPLAY_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ENTRY_SIDE_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ICON_BORDER_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_CHROME_BORDER_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_CHROME_PADDING_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_CHROME_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_TOOLS_ZONE_OPTIONS,
  EXPERIENCE_TOOLS_ICON_PADDING_PX_MIN,
  EXPERIENCE_TOOLS_ICON_PADDING_PX_MAX,
  EXPERIENCE_TOOLS_ICON_GAP_PX_MIN,
  EXPERIENCE_TOOLS_ICON_GAP_PX_MAX,
  EXPERIENCE_TOOLS_CHROME_PADDING_PRESET_PX,
  EXPERIENCE_TOOLS_CHROME_PADDING_PX_MIN,
  EXPERIENCE_TOOLS_CHROME_PADDING_PX_MAX,
  DEFAULT_EXPERIENCE_TOOLS_CHROME,
  clampExperienceToolsIconPaddingPx,
  clampExperienceToolsIconGapPx,
  clampExperienceToolsChromePaddingPx,
  mergeExperienceToolsChrome,
  resolveExperienceToolsChromePaddingPx,
  PORTFOLIO_EXPERIENCE_PROOF_ZONE_OPTIONS,
  PORTFOLIO_EXPERIENCE_YEARS_PRESET_OPTIONS,
  PORTFOLIO_EXPERIENCE_YEARS_SIZE_OPTIONS,
  experienceDesignSupportsItemsPerRow,
  experienceLayerToCardFrameSettings,
  moveExperienceElementOrder,
  moveExperienceElementToCardZone,
  normalizeExperienceElementOrder,
  normalizeExperienceElementStyles,
  normalizeExperienceElementZones,
  patchExperienceElementStyle,
  patchExperienceLayerFrame,
  patchExperienceProofPlacement,
  patchExperienceToolsPlacement,
  resolveExperienceElementZone,
  DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
  type PortfolioExperienceItemsPerRow,
  type PortfolioExperienceLayerFrame,
  type PortfolioExperienceSectionSettings,
  type PortfolioExperienceStyleTarget,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  PORTFOLIO_LIST_MARKER_SOURCE_OPTIONS,
  PORTFOLIO_LIST_MARKER_STYLE_OPTIONS,
} from '@/components/portfolio/portfolio-list-marker';
import { PortfolioListMarkerSizeWeightControls } from '@/components/portfolio/PortfolioListMarkerSizeWeightControls';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  applyExperiencePaletteToSettings,
  DEFAULT_EXPERIENCE_COLOR_BINDINGS,
  DEFAULT_EXPERIENCE_PALETTE,
  EXPERIENCE_BLOCK_STYLE_TARGETS,
  EXPERIENCE_ENTRY_STYLE_TARGETS,
  EXPERIENCE_STYLE_TARGET_COLOR_SLOT,
  mergeExperienceColorBindings,
  mergeExperiencePalette,
  patchExperienceColorBinding,
  patchExperienceColorField,
  PORTFOLIO_EXPERIENCE_COLOR_SLOT_OPTIONS,
  type ExperienceColorSlot,
} from '@/components/portfolio/portfolio-experience-palette-settings';
import {
  PortfolioCardFrameSettingsFields,
  type PortfolioCardFrameColorFieldKey,
} from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

type ExperienceFrameLayer = 'entry' | 'story' | 'details' | 'detailsSecondary';

const EXPERIENCE_BACKGROUND_LABEL_SLOTS: Record<string, ExperienceColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

const EXPERIENCE_FRAME_SLOTS: Record<
  ExperienceFrameLayer,
  Record<PortfolioCardFrameColorFieldKey, ExperienceColorSlot>
> = {
  entry: {
    cardBorderColor: 'entryBorder',
    cardBackgroundColor: 'entryBackground',
    cardBackgroundColorA: 'entryBackgroundA',
    cardBackgroundColorB: 'entryBackgroundB',
    cardDividerColor: 'entryDivider',
  },
  story: {
    cardBorderColor: 'storyBorder',
    cardBackgroundColor: 'storyBackground',
    cardBackgroundColorA: 'storyBackgroundA',
    cardBackgroundColorB: 'storyBackgroundB',
    cardDividerColor: 'storyDivider',
  },
  details: {
    cardBorderColor: 'detailsBorder',
    cardBackgroundColor: 'detailsBackground',
    cardBackgroundColorA: 'detailsBackgroundA',
    cardBackgroundColorB: 'detailsBackgroundB',
    cardDividerColor: 'detailsDivider',
  },
  detailsSecondary: {
    cardBorderColor: 'detailsBorder',
    cardBackgroundColor: 'detailsBackground',
    cardBackgroundColorA: 'detailsBackgroundA',
    cardBackgroundColorB: 'detailsBackgroundB',
    cardDividerColor: 'detailsDivider',
  },
};

export type ExperienceSubSection =
  | 'general'
  | 'media'
  | 'palette'
  | 'header'
  | 'years'
  | 'content'
  | 'styleEntry'
  | 'styleYears'
  | 'styleBlocks'
  | 'frame'
  | 'background';

const EXPERIENCE_SUB_SECTIONS: { id: ExperienceSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility, item design, list width, spacing, and accent.',
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Image / vidéo de chaque expérience : placement (hors carte, sticky), taille, ratio.',
  },
  { id: 'palette', label: 'Palette', description: 'Use the Global site palette and bind section colors to tokens.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'years', label: 'Years', description: 'Years summary phrase and typography.' },
  {
    id: 'content',
    label: 'Content',
    description: 'Visible fields, move blocks between cards, labels, and display order.',
  },
  {
    id: 'styleEntry',
    label: 'Style entry',
    description: 'Color, font, size, and weight for title, organization, meta, and description.',
  },
  {
    id: 'styleYears',
    label: 'Style years',
    description: 'Years phrase colors (bound under Palette when enabled).',
  },
  {
    id: 'styleBlocks',
    label: 'Style blocks',
    description: 'Color, font, size, and weight for labels, tasks, proof, note, skills, and tools.',
  },
  {
    id: 'frame',
    label: 'Frame',
    description: 'Separate controls for entry background, story card, tasks card, and proof card.',
  },
  { id: 'background', label: 'Background', description: 'Optional fill behind this section.' },
];

/** Legacy saved UI id `style` → Style entry. */
export function normalizeExperienceSubSection(value: string | undefined): ExperienceSubSection {
  if (value === 'style') return 'styleEntry';
  if (EXPERIENCE_SUB_SECTIONS.some((section) => section.id === value)) {
    return value as ExperienceSubSection;
  }
  return 'general';
}

function asExperiencePatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioExperienceSectionSettings> {
  return patch as Partial<PortfolioExperienceSectionSettings>;
}

const FRAME_LAYER_OPTIONS: { id: ExperienceFrameLayer; label: string; description: string }[] = [
  {
    id: 'entry',
    label: 'Entry background',
    description: 'Outer shell around the whole experience entry (the gray background).',
  },
  {
    id: 'story',
    label: 'Story card',
    description: 'Inner frame for title, organization, meta, and description.',
  },
  {
    id: 'details',
    label: 'Details card (Tasks)',
    description: 'Inner frame for the tasks list card.',
  },
  {
    id: 'detailsSecondary',
    label: 'Details card (Proof & skills)',
    description: 'Inner frame for proof links and skills (separate from tasks).',
  },
];

function ExperienceToggleRow({
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

function ExperienceOptionGrid<T extends string>({
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

function ExperienceManualColorField({
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

function ExperienceColorField({
  experience,
  onChange,
  slot,
  label,
  value,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
  slot: ExperienceColorSlot;
  label: string;
  value: string;
}) {
  if (experience.useHeroPalette === false) {
    return (
      <ExperienceManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asExperiencePatch(patchExperienceColorField(experience, slot, hex)))}
      />
    );
  }

  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, experience.experiencePalette);
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
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
            asExperiencePatch(
              patchExperienceColorBinding(experience, slot, event.target.value as HeroPaletteTokenId)
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

function ExperienceToolsStyleControls({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const toolsChrome = mergeExperienceToolsChrome(
    DEFAULT_EXPERIENCE_TOOLS_CHROME,
    experience.toolsChrome ?? DEFAULT_EXPERIENCE_TOOLS_CHROME
  );

  const patchToolsChrome = (patch: Partial<typeof toolsChrome>) => {
    onChange({ toolsChrome: mergeExperienceToolsChrome(toolsChrome, patch) });
  };

  return (
    <>
      <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <div>
          <p className="text-sm font-semibold text-neutral-950">Tools icon surface</p>
          <p className="mt-1 text-sm text-neutral-500">
            Chip fill, padding, and spacing for each tool logo — independent from Proof / Skills chips.
          </p>
        </div>
        <ExperienceToggleRow
          label="Icon background"
          description="Filled plate behind each tool glyph. Off shows logos only."
          checked={experience.toolsIconBackgroundEnabled !== false}
          onChange={(toolsIconBackgroundEnabled) => onChange({ toolsIconBackgroundEnabled })}
        />
        {experience.toolsIconBackgroundEnabled !== false ? (
          <ExperienceColorField
            experience={experience}
            onChange={onChange}
            slot="toolsIconBackground"
            label="Icon background color"
            value={experience.toolsIconBackgroundColor}
          />
        ) : null}
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icon padding</p>
            <span className="tabular-nums text-sm font-semibold text-neutral-700">
              {experience.toolsIconPaddingPx ?? 10}px
            </span>
          </div>
          <input
            type="range"
            min={EXPERIENCE_TOOLS_ICON_PADDING_PX_MIN}
            max={EXPERIENCE_TOOLS_ICON_PADDING_PX_MAX}
            step={1}
            value={experience.toolsIconPaddingPx ?? 10}
            onChange={(event) =>
              onChange({
                toolsIconPaddingPx: clampExperienceToolsIconPaddingPx(Number(event.target.value), 10),
              })
            }
            className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
            aria-label="Tools icon padding in pixels"
          />
          <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
            <span>{EXPERIENCE_TOOLS_ICON_PADDING_PX_MIN}px</span>
            <span>{EXPERIENCE_TOOLS_ICON_PADDING_PX_MAX}px</span>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Icon gap</p>
            <span className="tabular-nums text-sm font-semibold text-neutral-700">
              {experience.toolsIconGapPx ?? 8}px
            </span>
          </div>
          <input
            type="range"
            min={EXPERIENCE_TOOLS_ICON_GAP_PX_MIN}
            max={EXPERIENCE_TOOLS_ICON_GAP_PX_MAX}
            step={1}
            value={experience.toolsIconGapPx ?? 8}
            onChange={(event) =>
              onChange({
                toolsIconGapPx: clampExperienceToolsIconGapPx(Number(event.target.value), 8),
              })
            }
            className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
            aria-label="Tools icon gap in pixels"
          />
          <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
            <span>{EXPERIENCE_TOOLS_ICON_GAP_PX_MIN}px</span>
            <span>{EXPERIENCE_TOOLS_ICON_GAP_PX_MAX}px</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
        <div>
          <p className="text-sm font-semibold text-neutral-950">Fond des outils</p>
          <p className="mt-1 text-sm text-neutral-500">
            Optional surface behind the tools icons row — padding, fill, border, and fit-content wrap.
          </p>
        </div>
        <ExperienceToggleRow
          label="Activer le fond"
          description="Encadre les icônes outils avec un fond et optionnellement une bordure."
          checked={toolsChrome.enabled}
          onChange={(enabled) => patchToolsChrome({ enabled })}
        />
        {toolsChrome.enabled ? (
          <>
            <ExperienceToggleRow
              label="Remplissage"
              description="Couleur de fond derrière les icônes."
              checked={toolsChrome.backgroundEnabled}
              onChange={(backgroundEnabled) => patchToolsChrome({ backgroundEnabled })}
            />
            <ExperienceToggleRow
              label="Limiter aux icônes"
              description="Le fond s’ajuste à la largeur des icônes (le label reste à l’extérieur)."
              checked={toolsChrome.fitContent}
              onChange={(fitContent) => patchToolsChrome({ fitContent })}
            />
            {toolsChrome.backgroundEnabled ? (
              <ExperienceColorField
                experience={experience}
                onChange={onChange}
                slot="toolsChromeBackground"
                label="Couleur de fond"
                value={toolsChrome.backgroundColor}
              />
            ) : null}
            <ExperienceOptionGrid
              label="Bordure"
              options={PORTFOLIO_EXPERIENCE_TOOLS_CHROME_BORDER_OPTIONS}
              value={toolsChrome.border}
              onChange={(border) => patchToolsChrome({ border })}
              columns={3}
            />
            {toolsChrome.border === 'soft' || toolsChrome.border === 'solid' ? (
              <ExperienceManualColorField
                label="Couleur de bordure"
                value={toolsChrome.borderColor}
                onChange={(borderColor) => patchToolsChrome({ borderColor })}
              />
            ) : null}
            <ExperienceOptionGrid
              label="Coins"
              options={PORTFOLIO_EXPERIENCE_TOOLS_CHROME_RADIUS_OPTIONS}
              value={toolsChrome.borderRadius}
              onChange={(borderRadius) => patchToolsChrome({ borderRadius })}
              columns={3}
            />
            <ExperienceOptionGrid
              label="Padding (intérieur)"
              options={PORTFOLIO_EXPERIENCE_TOOLS_CHROME_PADDING_OPTIONS}
              value={
                toolsChrome.padding === 'custom'
                  ? ('' as (typeof PORTFOLIO_EXPERIENCE_TOOLS_CHROME_PADDING_OPTIONS)[number]['value'])
                  : toolsChrome.padding
              }
              onChange={(padding) =>
                patchToolsChrome({
                  padding,
                  paddingPx: EXPERIENCE_TOOLS_CHROME_PADDING_PRESET_PX[padding],
                })
              }
              columns={2}
            />
            {toolsChrome.padding === 'custom' ? (
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
                  {resolveExperienceToolsChromePaddingPx(toolsChrome)}px
                </span>
              </div>
              <input
                type="range"
                min={EXPERIENCE_TOOLS_CHROME_PADDING_PX_MIN}
                max={EXPERIENCE_TOOLS_CHROME_PADDING_PX_MAX}
                step={1}
                value={resolveExperienceToolsChromePaddingPx(toolsChrome)}
                onChange={(event) => {
                  const px = clampExperienceToolsChromePaddingPx(Number(event.target.value), 16);
                  patchToolsChrome({ padding: 'custom', paddingPx: px });
                }}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Padding intérieur manuel en pixels"
              />
              <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                <span>{EXPERIENCE_TOOLS_CHROME_PADDING_PX_MIN}px</span>
                <span>{EXPERIENCE_TOOLS_CHROME_PADDING_PX_MAX}px</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

function ExperiencePalettePanel({
  experience,
  onChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
}) {
  const palette = mergeExperiencePalette(DEFAULT_EXPERIENCE_PALETTE, experience.experiencePalette);
  const bindings = mergeExperienceColorBindings(
    DEFAULT_EXPERIENCE_COLOR_BINDINGS,
    experience.experienceColorBindings
  );
  const paletteOn = experience.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <SectionHeroPaletteToggle
        enabled={paletteOn}
        onChange={(useHeroPalette) =>
          onChange(
            asExperiencePatch(
              useHeroPalette
                ? { useHeroPalette, ...applyExperiencePaletteToSettings(experience) }
                : { useHeroPalette }
            )
          )
        }
        title="Use global color palette"
        description="When on, Experience colors follow the Global site palette. Turn off to edit colors manually in other tabs."
        enabledHint="Edit the dark/light token pair under Global → Theme. Bindings below pick which token each Experience color uses."
        disabledHint="Global palette tokens still exist, but Experience uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        The site color palette lives in <span className="font-semibold">Global → Theme</span> as a
        coupled dark / light pair. Experience no longer has its own Mode sombre / Mode clair editor.
      </p>

      {paletteOn ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Color bindings
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick which Global token each Experience color uses. Swatches preview the active mode.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_EXPERIENCE_COLOR_SLOT_OPTIONS.map((slot) => (
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
                      asExperiencePatch(
                        patchExperienceColorBinding(
                          experience,
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

export function ExperienceSettingsPanel({
  experience,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  experience: PortfolioExperienceSectionSettings;
  onChange: (patch: Partial<PortfolioExperienceSectionSettings>) => void;
  subSection?: ExperienceSubSection;
  onSubSectionChange?: (value: ExperienceSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ExperienceSubSection>('general');
  const subSection = normalizeExperienceSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ExperienceSubSection) => {
    const next = normalizeExperienceSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const [frameLayer, setFrameLayer] = useState<ExperienceFrameLayer>('entry');
  const [styleTarget, setStyleTarget] = useState<PortfolioExperienceStyleTarget>('title');
  const activeMeta =
    EXPERIENCE_SUB_SECTIONS.find((section) => section.id === subSection) ?? EXPERIENCE_SUB_SECTIONS[0];

  const activeFrame: PortfolioExperienceLayerFrame =
    frameLayer === 'entry'
      ? experience.entryFrame
      : frameLayer === 'story'
        ? experience.storyFrame
        : frameLayer === 'detailsSecondary'
          ? experience.detailsSecondaryFrame
          : experience.detailsFrame;

  const patchActiveFrame = (patch: Partial<PortfolioExperienceLayerFrame>) => {
    const key =
      frameLayer === 'entry'
        ? 'entryFrame'
        : frameLayer === 'story'
          ? 'storyFrame'
          : frameLayer === 'detailsSecondary'
            ? 'detailsSecondaryFrame'
            : 'detailsFrame';
    onChange({ [key]: patchExperienceLayerFrame(activeFrame, patch) });
  };

  const elementOrder = normalizeExperienceElementOrder(experience.elementOrder);
  const elementZones = normalizeExperienceElementZones(experience.elementZones);
  const elementStyles = normalizeExperienceElementStyles(experience.elementStyles);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Experience subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as ExperienceSubSection)}
          className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:min-w-[12rem] sm:max-w-xs sm:flex-1"
        >
          {EXPERIENCE_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <ExperienceToggleRow
            label="Show section"
            description="Display the experience block on your public portfolio."
            checked={experience.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionHeroPaletteToggle
            enabled={experience.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                asExperiencePatch(
                  useHeroPalette
                    ? { useHeroPalette, ...applyExperiencePaletteToSettings(experience) }
                    : { useHeroPalette }
                )
              )
            }
          />
          <ExperienceOptionGrid
            label="Item design"
            options={PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS}
            value={experience.experienceDesign}
            onChange={(experienceDesign) => onChange({ experienceDesign })}
            columns={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="List width"
              options={PORTFOLIO_EXPERIENCE_LIST_MAX_WIDTH_OPTIONS}
              value={experience.listMaxWidth}
              onChange={(listMaxWidth) => onChange({ listMaxWidth })}
              columns={2}
            />
            <ExperienceOptionGrid
              label="List placement"
              options={PORTFOLIO_EXPERIENCE_LIST_PLACEMENT_OPTIONS}
              value={experience.listPlacement}
              onChange={(listPlacement) => onChange({ listPlacement })}
              columns={3}
            />
          </div>
          {experienceDesignSupportsItemsPerRow(experience.experienceDesign) ? (
            <ExperienceOptionGrid
              label="Items per row"
              options={PORTFOLIO_EXPERIENCE_ITEMS_PER_ROW_OPTIONS}
              value={String(experience.itemsPerRow ?? 1) as '1' | '2' | '3'}
              onChange={(value) =>
                onChange({ itemsPerRow: Number(value) as PortfolioExperienceItemsPerRow })
              }
              columns={3}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Items per row applies to <span className="font-semibold text-neutral-700">Panel cards</span>,{' '}
              <span className="font-semibold text-neutral-700">Stepped cards</span>, and{' '}
              <span className="font-semibold text-neutral-700">Bento</span>. Timeline rails stay one column for
              readability.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Entry spacing"
              options={PORTFOLIO_EXPERIENCE_ITEM_GAP_OPTIONS}
              value={experience.itemGap}
              onChange={(itemGap) => onChange({ itemGap })}
              columns={4}
            />
            <ExperienceOptionGrid
              label="Inner density"
              options={PORTFOLIO_EXPERIENCE_ITEM_DENSITY_OPTIONS}
              value={experience.itemDensity}
              onChange={(itemDensity) => onChange({ itemDensity })}
              columns={2}
            />
          </div>
          {experience.experienceDesign === 'timeline-editorial' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Mise en page Magazine</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Ces réglages s’appliquent uniquement au design Magazine sur grand écran. Les colonnes
                  restent empilées sur mobile.
                </p>
              </div>
              <ExperienceOptionGrid
                label="Répartition image / contenu"
                options={PORTFOLIO_EXPERIENCE_MAGAZINE_COLUMN_RATIO_OPTIONS}
                value={experience.magazineColumnRatio ?? 'media-wide'}
                onChange={(magazineColumnRatio) => onChange({ magazineColumnRatio })}
                columns={3}
              />
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Espace avant le séparateur
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Ajoute de la respiration sous le contenu et les outils avant la ligne horizontale.
                    </p>
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {clampExperienceMagazineSeparatorSpacingPx(
                      experience.magazineSeparatorSpacingPx,
                      64
                    )}
                    px
                  </span>
                </div>
                <input
                  type="range"
                  min={EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MIN}
                  max={EXPERIENCE_MAGAZINE_SEPARATOR_SPACING_PX_MAX}
                  step={4}
                  value={clampExperienceMagazineSeparatorSpacingPx(
                    experience.magazineSeparatorSpacingPx,
                    64
                  )}
                  onChange={(event) =>
                    onChange({
                      magazineSeparatorSpacingPx: clampExperienceMagazineSeparatorSpacingPx(
                        Number(event.target.value),
                        64
                      ),
                    })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Espace avant le séparateur des expériences Magazine"
                />
              </div>
            </div>
          ) : null}
          <ExperienceColorField
            experience={experience}
            onChange={onChange}
            slot="accent"
            label="Accent color"
            value={experience.accentColor}
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Pour placer l&apos;image à droite de la carte (hors fond) ou activer le sticky : onglet{' '}
            <span className="font-semibold text-neutral-700">Media</span> → Emplacement →{' '}
            <span className="font-semibold text-neutral-700">Hors carte (droite)</span>.
          </p>
        </div>
      ) : null}

      {subSection === 'media' ? (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Image / vidéo de l&apos;expérience</p>
              <p className="mt-1 text-sm text-neutral-500">
                Fichier ajouté dans Creator Studio → Information. L&apos;emplacement s&apos;applique à tous les
                designs d&apos;entrée.
              </p>
            </div>
            <ExperienceToggleRow
              label="Afficher le média"
              description="Masquer toutes les images sans les supprimer du Studio."
              checked={experience.showEntryMedia !== false}
              onChange={(showEntryMedia) => onChange({ showEntryMedia })}
            />
            {experience.showEntryMedia !== false ? (
              <>
                <ExperienceOptionGrid
                  label="Emplacement"
                  options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_PLACEMENT_OPTIONS}
                  value={experience.entryMediaPlacement ?? 'aside-right'}
                  onChange={(entryMediaPlacement) => onChange({ entryMediaPlacement })}
                  columns={2}
                />
                {(experience.entryMediaPlacement ?? 'aside-right') !== 'hidden' ? (
                  <>
                    {(experience.entryMediaPlacement === 'outside-right' ||
                      experience.entryMediaPlacement === 'outside-left') && (
                      <ExperienceToggleRow
                        label="Sticky (grands écrans)"
                        description="L’image reste visible pendant le scroll de cette entrée, puis disparaît avec elle. Desktop uniquement."
                        checked={experience.entryMediaSticky !== false}
                        onChange={(entryMediaSticky) => onChange({ entryMediaSticky })}
                      />
                    )}
                    <div className="space-y-4">
                      <ExperienceOptionGrid
                        label="Taille"
                        options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_SIZE_OPTIONS}
                        value={
                          experience.entryMediaSize === 'custom'
                            ? ('' as 'md')
                            : ((experience.entryMediaSize ?? 'md') as 'sm' | 'md' | 'lg' | 'full')
                        }
                        onChange={(entryMediaSize) =>
                          onChange({
                            entryMediaSize,
                            entryMediaSizePx: EXPERIENCE_ENTRY_MEDIA_SIZE_PRESET_PX[entryMediaSize],
                          })
                        }
                        columns={4}
                      />
                      {experience.entryMediaSize === 'custom' ? (
                        <p className="text-xs font-medium text-amber-700">
                          Mode manuel actif — choisis un preset ci-dessus pour quitter Manual.
                        </p>
                      ) : null}
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Agrandissement manuel (px)
                          </p>
                          <span className="tabular-nums text-sm font-semibold text-neutral-700">
                            {resolveExperienceEntryMediaSizePx(experience)}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MIN}
                          max={EXPERIENCE_ENTRY_MEDIA_SIZE_PX_MAX}
                          step={4}
                          value={resolveExperienceEntryMediaSizePx(experience)}
                          onChange={(event) => {
                            const px = clampExperienceEntryMediaSizePx(
                              Number(event.target.value),
                              224
                            );
                            onChange({ entryMediaSize: 'custom', entryMediaSizePx: px });
                          }}
                          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                          aria-label="Largeur manuelle de l’image en pixels"
                        />
                        <p className="mt-2 text-sm text-neutral-500">
                          Desktop (lg+) — s’applique à tous les emplacements (à côté, hors carte,
                          au-dessus). Mobile reste pleine largeur.
                        </p>
                      </div>
                      <ExperienceOptionGrid
                        label="Coins"
                        options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_RADIUS_OPTIONS}
                        value={experience.entryMediaRadius ?? 'lg'}
                        onChange={(entryMediaRadius) => onChange({ entryMediaRadius })}
                        columns={3}
                      />
                    </div>
                    <ExperienceOptionGrid
                      label="Format"
                      options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_ASPECT_OPTIONS}
                      value={experience.entryMediaAspect ?? '4/5'}
                      onChange={(entryMediaAspect) => onChange({ entryMediaAspect })}
                      columns={3}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <ExperienceOptionGrid
                        label="Ajustement dans le cadre"
                        options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_FIT_OPTIONS}
                        value={experience.entryMediaFit ?? 'cover'}
                        onChange={(entryMediaFit) => onChange({ entryMediaFit })}
                        columns={2}
                      />
                      <ExperienceOptionGrid
                        label="Position / point focal"
                        options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_POSITION_OPTIONS}
                        value={experience.entryMediaPosition ?? 'center'}
                        onChange={(entryMediaPosition) => onChange({ entryMediaPosition })}
                        columns={3}
                      />
                    </div>
                    <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500">
                      L’ajustement et le point focal sont partagés par tous les designs Expérience qui
                      affichent une image ou une vidéo.
                    </p>
                    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-950">
                            Assombrissement du média
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            Ajoute un voile sombre sur toutes les images et vidéos Expérience.
                          </p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-neutral-700">
                          {experience.entryMediaDarkness ?? 0}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={1}
                        value={experience.entryMediaDarkness ?? 0}
                        onChange={(event) =>
                          onChange({ entryMediaDarkness: Number(event.target.value) })
                        }
                        className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                        aria-label="Intensité d’assombrissement du média Expérience"
                      />
                    </div>
                    <div className="space-y-4">
                      <ExperienceOptionGrid
                        label="Hauteur"
                        options={PORTFOLIO_EXPERIENCE_ENTRY_MEDIA_HEIGHT_OPTIONS}
                        value={
                          experience.entryMediaHeight === 'custom'
                            ? ('' as 'auto')
                            : ((experience.entryMediaHeight ?? 'auto') as
                                | 'auto'
                                | 'sm'
                                | 'md'
                                | 'lg'
                                | 'xl')
                        }
                        onChange={(entryMediaHeight) =>
                          onChange({
                            entryMediaHeight,
                            ...(entryMediaHeight !== 'auto'
                              ? {
                                  entryMediaHeightPx:
                                    EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX[entryMediaHeight],
                                }
                              : {}),
                          })
                        }
                        columns={3}
                      />
                      {experience.experienceDesign === 'timeline-stepped' ? (
                        <p className="text-sm text-neutral-500">
                          Stepped cards : la hauteur contrôle le bandeau panoramique en tête de carte
                          (Auto = 240px).
                        </p>
                      ) : null}
                      {experience.entryMediaHeight === 'custom' ? (
                        <p className="text-xs font-medium text-amber-700">
                          Hauteur manuelle active — choisis un preset ci-dessus pour quitter Manual.
                        </p>
                      ) : null}
                      {(experience.entryMediaSize ?? 'md') === 'full' &&
                      (experience.entryMediaHeight ?? 'auto') === 'auto' ? (
                        <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500">
                          XL est plafonné à ~360px en Auto. Choisis S–XL ou le slider pour fixer la
                          hauteur exacte — l’image reste centrée dans le cadre.
                        </p>
                      ) : null}
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Hauteur manuelle (px)
                          </p>
                          <span className="tabular-nums text-sm font-semibold text-neutral-700">
                            {resolveExperienceEntryMediaHeightPx(experience) ??
                              EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX.md}
                            px
                          </span>
                        </div>
                        <input
                          type="range"
                          min={EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MIN}
                          max={EXPERIENCE_ENTRY_MEDIA_HEIGHT_PX_MAX}
                          step={4}
                          value={
                            resolveExperienceEntryMediaHeightPx(experience) ??
                            EXPERIENCE_ENTRY_MEDIA_HEIGHT_PRESET_PX.md
                          }
                          onChange={(event) => {
                            const px = clampExperienceEntryMediaHeightPx(
                              Number(event.target.value),
                              280
                            );
                            onChange({ entryMediaHeight: 'custom', entryMediaHeightPx: px });
                          }}
                          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                          aria-label="Hauteur manuelle de l’image en pixels"
                        />
                        <p className="mt-2 text-sm text-neutral-500">
                          Le cadre conserve cette hauteur ; l’ajustement et le point focal choisis
                          ci-dessus déterminent le recadrage.
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
                <ExperienceOptionGrid
                  label="Emplacement du Proof"
                  options={PORTFOLIO_EXPERIENCE_PROOF_ZONE_OPTIONS}
                  value={experience.proofZone ?? 'details'}
                  onChange={(proofZone) =>
                    onChange(patchExperienceProofPlacement(experience, proofZone))
                  }
                  columns={2}
                />
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'content' ? (
        <div className="space-y-6">
          <ExperienceOptionGrid
            label="Details placement"
            options={PORTFOLIO_EXPERIENCE_ASIDE_PLACEMENT_OPTIONS}
            value={experience.asidePlacement}
            onChange={(asidePlacement) => onChange({ asidePlacement })}
            columns={2}
          />
          {experience.experienceDesign === 'large' ||
          experience.experienceDesign === 'timeline-editorial' ? (
            <ExperienceOptionGrid
              label={
                experience.experienceDesign === 'timeline-editorial'
                  ? 'Magazine — position des détails'
                  : 'Bento — position des détails'
              }
              options={
                experience.experienceDesign === 'timeline-editorial'
                  ? PORTFOLIO_EXPERIENCE_BENTO_DETAILS_PLACEMENT_OPTIONS.filter(
                      (option) => option.value === 'aside' || option.value === 'under-story'
                    )
                  : PORTFOLIO_EXPERIENCE_BENTO_DETAILS_PLACEMENT_OPTIONS
              }
              value={experience.bentoDetailsPlacement ?? 'aside'}
              onChange={(bentoDetailsPlacement) => onChange({ bentoDetailsPlacement })}
              columns={2}
            />
          ) : null}
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Swap story ↔ details: use <span className="font-semibold text-neutral-700">Details right / below</span>{' '}
            (title on top) or <span className="font-semibold text-neutral-700">Details left / above</span> (card on
            top). In split navigation the columns stack vertically with the same rule. Image hors carte : onglet{' '}
            <span className="font-semibold text-neutral-700">Media</span>. Sur Magazine / Bento :{' '}
            <span className="font-semibold text-neutral-700">À côté</span> (3 colonnes égales) ou{' '}
            <span className="font-semibold text-neutral-700">Sous la description</span>.
          </p>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Story column spacing</p>
              <p className="mt-1 text-sm text-neutral-500">
                Vertical gap between title, organization, meta, description, and tools on the left.
              </p>
            </div>
            <ExperienceOptionGrid
              label="Presets"
              options={PORTFOLIO_EXPERIENCE_STORY_CONTENT_GAP_OPTIONS}
              value={
                experience.storyContentGap === 'custom'
                  ? ('' as 'md')
                  : ((experience.storyContentGap ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'xl')
              }
              onChange={(gap) =>
                onChange({
                  storyContentGap: gap,
                  storyContentGapPx: EXPERIENCE_STORY_CONTENT_GAP_PRESET_PX[gap],
                })
              }
              columns={3}
            />
            {experience.storyContentGap === 'custom' ? (
              <p className="text-xs font-medium text-amber-700">
                Manual mode active — choose a preset above to leave Manual.
              </p>
            ) : null}
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Manual (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampExperienceStoryContentGapPx(experience.storyContentGapPx, 16)}px
                </span>
              </div>
              <input
                type="range"
                min={EXPERIENCE_STORY_CONTENT_GAP_PX_MIN}
                max={EXPERIENCE_STORY_CONTENT_GAP_PX_MAX}
                step={1}
                value={clampExperienceStoryContentGapPx(experience.storyContentGapPx, 16)}
                onChange={(event) => {
                  const px = clampExperienceStoryContentGapPx(Number(event.target.value), 16);
                  onChange({ storyContentGap: 'custom', storyContentGapPx: px });
                }}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Story column vertical spacing in pixels"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Details column spacing</p>
              <p className="mt-1 text-sm text-neutral-500">
                Vertical gap between tasks, proof, note, skills, and tools in the details panel.
              </p>
            </div>
            <ExperienceOptionGrid
              label="Presets"
              options={PORTFOLIO_EXPERIENCE_DETAILS_CONTENT_GAP_OPTIONS}
              value={
                experience.detailsContentGap === 'custom'
                  ? ('' as 'md')
                  : ((experience.detailsContentGap ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'xl')
              }
              onChange={(gap) =>
                onChange({
                  detailsContentGap: gap,
                  detailsContentGapPx: EXPERIENCE_DETAILS_CONTENT_GAP_PRESET_PX[gap],
                })
              }
              columns={3}
            />
            {experience.detailsContentGap === 'custom' ? (
              <p className="text-xs font-medium text-amber-700">
                Manual mode active — choose a preset above to leave Manual.
              </p>
            ) : null}
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Manual (px)
                </p>
                <span className="tabular-nums text-sm font-semibold text-neutral-700">
                  {clampExperienceDetailsContentGapPx(experience.detailsContentGapPx, 16)}px
                </span>
              </div>
              <input
                type="range"
                min={EXPERIENCE_DETAILS_CONTENT_GAP_PX_MIN}
                max={EXPERIENCE_DETAILS_CONTENT_GAP_PX_MAX}
                step={1}
                value={clampExperienceDetailsContentGapPx(experience.detailsContentGapPx, 16)}
                onChange={(event) => {
                  const px = clampExperienceDetailsContentGapPx(Number(event.target.value), 16);
                  onChange({ detailsContentGap: 'custom', detailsContentGapPx: px });
                }}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Details column vertical spacing in pixels"
              />
            </div>
          </div>

          {experience.experienceDesign === 'timeline-editorial' ||
          experience.experienceDesign === 'large' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  {experience.experienceDesign === 'large'
                    ? 'Period rule (Large / bento)'
                    : 'Period rule (Magazine)'}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {experience.experienceDesign === 'large'
                    ? 'Horizontal line beside the year at the top of each entry.'
                    : 'Horizontal line beside the year badge at the top of each entry.'}
                </p>
              </div>
              <ExperienceToggleRow
                label="Show horizontal rule"
                description="Hide to keep only the year label."
                checked={experience.periodRuleEnabled !== false}
                onChange={(periodRuleEnabled) => onChange({ periodRuleEnabled })}
              />
              {experience.periodRuleEnabled !== false ? (
                <>
                  {experience.useHeroPalette !== false ? (
                    <ExperienceToggleRow
                      label="Suivre la palette"
                      description="On = synchronisé clair/sombre via Global → Theme. Off = couleurs manuelles séparées."
                      checked={experience.periodRuleFollowPalette !== false}
                      onChange={(periodRuleFollowPalette) => onChange({ periodRuleFollowPalette })}
                    />
                  ) : null}
                  {experience.useHeroPalette !== false &&
                  experience.periodRuleFollowPalette !== false ? (
                    <>
                      <ExperienceColorField
                        experience={experience}
                        onChange={onChange}
                        slot="periodRule"
                        label="Rule color (token)"
                        value={experience.periodRuleColor || '#a3a3a3'}
                      />
                      <p className="text-sm text-neutral-500">
                        Suit automatiquement le couple <span className="font-semibold">clair / sombre</span>{' '}
                        de Global → Theme (token lié). Évite <span className="font-semibold">Fond</span> —
                        préfère <span className="font-semibold">Bordure</span>.
                      </p>
                    </>
                  ) : (
                    <>
                      <ExperienceManualColorField
                        label="Rule color (clair)"
                        value={experience.periodRuleColor || '#a3a3a3'}
                        onChange={(periodRuleColor) =>
                          onChange({
                            periodRuleColor,
                            periodRuleFollowPalette: false,
                          })
                        }
                      />
                      <ExperienceManualColorField
                        label="Rule color (sombre)"
                        value={experience.periodRuleColorDark || '#e5e5e5'}
                        onChange={(periodRuleColorDark) =>
                          onChange({
                            periodRuleColorDark,
                            periodRuleFollowPalette: false,
                          })
                        }
                      />
                      <p className="text-sm text-neutral-500">
                        Les deux couleurs s&apos;appliquent selon le mode Global (clair / sombre).
                      </p>
                    </>
                  )}
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Thickness
                      </p>
                      <span className="tabular-nums text-sm font-semibold text-neutral-700">
                        {clampExperiencePeriodRuleThickness(experience.periodRuleThickness, 1)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={EXPERIENCE_PERIOD_RULE_THICKNESS_MIN}
                      max={EXPERIENCE_PERIOD_RULE_THICKNESS_MAX}
                      step={1}
                      value={clampExperiencePeriodRuleThickness(experience.periodRuleThickness, 1)}
                      onChange={(event) =>
                        onChange({
                          periodRuleThickness: clampExperiencePeriodRuleThickness(
                            Number(event.target.value),
                            1
                          ),
                        })
                      }
                      className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                      aria-label="Period rule thickness"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Opacity
                      </p>
                      <span className="tabular-nums text-sm font-semibold text-neutral-700">
                        {clampExperiencePeriodRuleOpacity(experience.periodRuleOpacity, 70)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={clampExperiencePeriodRuleOpacity(experience.periodRuleOpacity, 70)}
                      onChange={(event) =>
                        onChange({
                          periodRuleOpacity: clampExperiencePeriodRuleOpacity(
                            Number(event.target.value),
                            70
                          ),
                        })
                      }
                      className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                      aria-label="Period rule opacity"
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {isExperienceTimelineDesign(experience.experienceDesign) ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">Timeline rail (vertical)</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Vertical line beside the years — Classic rail, Accent rail, or Magazine left stripe.
                </p>
              </div>
              <ExperienceToggleRow
                label="Show vertical rail"
                description="Hide the line (nodes / stripe stay optional via color opacity)."
                checked={experience.timelineRailEnabled !== false}
                onChange={(timelineRailEnabled) => onChange({ timelineRailEnabled })}
              />
              {experience.timelineRailEnabled !== false ? (
                <>
                  <ExperienceColorField
                    experience={experience}
                    onChange={onChange}
                    slot="timelineRail"
                    label="Rail color"
                    value={experience.timelineRailColor || '#d4d4d4'}
                  />
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Opacity
                      </p>
                      <span className="tabular-nums text-sm font-semibold text-neutral-700">
                        {clampExperienceTimelineRailOpacity(experience.timelineRailOpacity, 85)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={clampExperienceTimelineRailOpacity(experience.timelineRailOpacity, 85)}
                      onChange={(event) =>
                        onChange({
                          timelineRailOpacity: clampExperienceTimelineRailOpacity(
                            Number(event.target.value),
                            85
                          ),
                        })
                      }
                      className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                      aria-label="Timeline rail opacity"
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Tools separator (horizontal)</p>
              <p className="mt-1 text-sm text-neutral-500">
                Thin line above the Tools block at the bottom of each entry.
              </p>
            </div>
            <ExperienceToggleRow
              label="Show tools separator"
              checked={experience.toolsSeparatorEnabled !== false}
              onChange={(toolsSeparatorEnabled) => onChange({ toolsSeparatorEnabled })}
            />
            {experience.toolsSeparatorEnabled !== false ? (
              <>
                <ExperienceColorField
                  experience={experience}
                  onChange={onChange}
                  slot="toolsSeparator"
                  label="Separator color"
                  value={experience.toolsSeparatorColor || '#d4d4d4'}
                />
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Opacity
                    </p>
                    <span className="tabular-nums text-sm font-semibold text-neutral-700">
                      {clampExperienceToolsSeparatorOpacity(experience.toolsSeparatorOpacity, 55)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={clampExperienceToolsSeparatorOpacity(experience.toolsSeparatorOpacity, 55)}
                    onChange={(event) =>
                      onChange({
                        toolsSeparatorOpacity: clampExperienceToolsSeparatorOpacity(
                          Number(event.target.value),
                          55
                        ),
                      })
                    }
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label="Tools separator opacity"
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Tools placement"
              options={PORTFOLIO_EXPERIENCE_TOOLS_ZONE_OPTIONS}
              value={experience.toolsZone}
              onChange={(toolsZone) => onChange(patchExperienceToolsPlacement(experience, toolsZone))}
              columns={1}
            />
            <ExperienceOptionGrid
              label="Tools display"
              options={PORTFOLIO_EXPERIENCE_TOOLS_DISPLAY_OPTIONS}
              value={experience.toolsDisplay}
              onChange={(toolsDisplay) => onChange({ toolsDisplay })}
              columns={2}
            />
          </div>
          {experience.toolsZone === 'entry' ? (
            <ExperienceOptionGrid
              label="Outside position"
              options={PORTFOLIO_EXPERIENCE_TOOLS_ENTRY_SIDE_OPTIONS}
              value={experience.toolsEntrySide}
              onChange={(toolsEntrySide) => onChange({ toolsEntrySide })}
              columns={2}
            />
          ) : null}

          <ExperienceOptionGrid
            label="Tools icon size"
            options={PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS}
            value={experience.toolsIconSize}
            onChange={(toolsIconSize) => onChange({ toolsIconSize })}
            columns={2}
          />

          <ExperienceOptionGrid
            label="Tools icon border"
            options={PORTFOLIO_EXPERIENCE_TOOLS_ICON_BORDER_OPTIONS}
            value={experience.toolsIconBorder ?? 'solid'}
            onChange={(toolsIconBorder) => onChange({ toolsIconBorder })}
            columns={3}
          />
          {(experience.toolsIconBorder ?? 'solid') !== 'none' ? (
            <ExperienceColorField
              experience={experience}
              onChange={onChange}
              slot="toolsIconBorder"
              label="Tools icon border color"
              value={experience.toolsIconBorderColor || experience.entryChipBorderColor}
            />
          ) : null}

          <ExperienceToolsStyleControls experience={experience} onChange={onChange} />

          <ExperienceOptionGrid
            label="Skills tag style"
            options={PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS}
            value={experience.skillsTagStyle}
            onChange={(skillsTagStyle) => onChange({ skillsTagStyle })}
            columns={2}
          />

          <ExperienceOptionGrid
            label="Proof link style"
            options={PORTFOLIO_EXPERIENCE_PROOF_LINK_STYLE_OPTIONS}
            value={experience.proofLinkStyle ?? 'pill'}
            onChange={(proofLinkStyle) => onChange({ proofLinkStyle })}
            columns={2}
          />

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Block labels</p>
            <p className="text-sm text-neutral-500">
              Rename Tasks, Proof, Note, Skills, and Tools. Leave blank to keep the default English
              label. Uncheck a row to hide that heading only.
            </p>
            <ExperienceToggleRow
              label="Show block labels"
              description="Master switch — off hides every heading. On, use the checkboxes below per label."
              checked={experience.showBlockLabels}
              onChange={(showBlockLabels) => onChange({ showBlockLabels })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { id: 'tasks', key: 'tasksLabel', label: 'Tasks', placeholder: 'Tasks' },
                  { id: 'proof', key: 'proofLabel', label: 'Proof', placeholder: 'Proof' },
                  { id: 'note', key: 'noteLabel', label: 'Note', placeholder: 'Note' },
                  { id: 'skills', key: 'skillsLabel', label: 'Skills', placeholder: 'Skills' },
                  { id: 'tools', key: 'toolsLabel', label: 'Tools', placeholder: 'Tools' },
                ] as const
              ).map((field) => {
                const visibility = {
                  ...DEFAULT_EXPERIENCE_BLOCK_LABEL_VISIBILITY,
                  ...(experience.blockLabelVisibility ?? {}),
                };
                const labelShown = experience.showBlockLabels !== false && visibility[field.id] !== false;
                return (
                  <div
                    key={field.key}
                    className={`rounded-xl border px-3 py-3 ${
                      labelShown
                        ? 'border-neutral-200 bg-white'
                        : 'border-neutral-200/70 bg-neutral-50/80'
                    }`}
                  >
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        {field.label}
                      </span>
                      <input
                        type="checkbox"
                        checked={visibility[field.id] !== false}
                        disabled={experience.showBlockLabels === false}
                        onChange={(event) =>
                          onChange({
                            blockLabelVisibility: {
                              ...visibility,
                              [field.id]: event.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 disabled:opacity-40"
                        aria-label={`Show ${field.label} label`}
                      />
                    </label>
                    <input
                      type="text"
                      value={experience[field.key]}
                      placeholder={field.placeholder}
                      disabled={experience.showBlockLabels === false || visibility[field.id] === false}
                      onChange={(event) => onChange({ [field.key]: event.target.value })}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Display order</p>
            <p className="text-sm text-neutral-500">
              Reorder elements, and move any block between the Story card and the Details card.
            </p>
            <div className="space-y-2">
              {elementOrder.map((id, index) => {
                const meta = PORTFOLIO_EXPERIENCE_ELEMENT_OPTIONS.find((option) => option.value === id);
                const resolvedZone = resolveExperienceElementZone(
                  id,
                  elementZones,
                  experience.toolsZone,
                  experience.proofZone ?? 'details'
                );
                const zoneLabel =
                  resolvedZone === 'entry'
                    ? experience.toolsEntrySide === 'right'
                      ? 'Outside · under right'
                      : 'Outside · under left'
                    : resolvedZone === 'under-media'
                      ? 'Sous le média'
                      : resolvedZone === 'story'
                        ? id === 'tools'
                          ? 'Story · under description'
                          : 'Carte story'
                        : 'Carte détails';
                const otherCardZone = resolvedZone === 'story' ? 'details' : 'story';
                const canMoveBetweenCards = resolvedZone === 'story' || resolvedZone === 'details';
                const isProof = id === 'proof';
                return (
                  <div
                    key={id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                  >
                    <span className="w-6 text-center text-xs font-bold tabular-nums text-neutral-400">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-neutral-950">
                        {meta?.label ?? id}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                        {zoneLabel}
                      </span>
                    </span>
                    <div className="flex shrink-0 flex-wrap gap-1">
                      {isProof ? (
                        <>
                          {resolvedZone !== 'story' ? (
                            <button
                              type="button"
                              onClick={() =>
                                onChange(patchExperienceProofPlacement(experience, 'story'))
                              }
                              className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700"
                            >
                              → Story
                            </button>
                          ) : null}
                          {resolvedZone !== 'details' ? (
                            <button
                              type="button"
                              onClick={() =>
                                onChange(patchExperienceProofPlacement(experience, 'details'))
                              }
                              className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700"
                            >
                              → Details
                            </button>
                          ) : null}
                          {resolvedZone !== 'under-media' ? (
                            <button
                              type="button"
                              onClick={() =>
                                onChange(patchExperienceProofPlacement(experience, 'under-media'))
                              }
                              className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700"
                            >
                              → Media
                            </button>
                          ) : null}
                        </>
                      ) : canMoveBetweenCards ? (
                        <button
                          type="button"
                          onClick={() =>
                            onChange(
                              moveExperienceElementToCardZone(
                                elementZones,
                                id,
                                otherCardZone,
                                experience.toolsZone,
                                elementOrder,
                                experience.proofZone ?? 'details'
                              )
                            )
                          }
                          className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700"
                        >
                          → {otherCardZone === 'story' ? 'Story' : 'Details'}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() =>
                          onChange({ elementOrder: moveExperienceElementOrder(elementOrder, index, -1) })
                        }
                        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 disabled:opacity-30"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        disabled={index === elementOrder.length - 1}
                        onClick={() =>
                          onChange({ elementOrder: moveExperienceElementOrder(elementOrder, index, 1) })
                        }
                        className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-semibold text-neutral-700 disabled:opacity-30"
                      >
                        Down
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <p className="text-sm font-semibold text-neutral-950">Visible elements</p>
            <p className="text-sm text-neutral-500">
              Toggle every block inside an experience entry. Applies to all designs.
            </p>
            <div className="space-y-2">
              <ExperienceToggleRow
                label="Period"
                description="Year or date range badge."
                checked={experience.showPeriod}
                onChange={(showPeriod) => onChange({ showPeriod })}
              />
              <ExperienceToggleRow
                label="Job title"
                checked={experience.showTitle}
                onChange={(showTitle) => onChange({ showTitle })}
              />
              <ExperienceToggleRow
                label="Organization"
                checked={experience.showOrganization}
                onChange={(showOrganization) => onChange({ showOrganization })}
              />
              <ExperienceToggleRow
                label="Description"
                checked={experience.showDescription}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <ExperienceToggleRow
                label="Meta chips"
                description="Status, employment type, location."
                checked={experience.showMeta}
                onChange={(showMeta) => onChange({ showMeta })}
              />
              {experience.showMeta ? (
                <ExperienceOptionGrid
                  label="Status badge style"
                  options={PORTFOLIO_EXPERIENCE_STATUS_BADGE_STYLE_OPTIONS}
                  value={experience.statusBadgeStyle ?? 'pill'}
                  onChange={(statusBadgeStyle) => onChange({ statusBadgeStyle })}
                  columns={2}
                />
              ) : null}
              <ExperienceToggleRow
                label="Tasks"
                checked={experience.showTasks}
                onChange={(showTasks) => onChange({ showTasks })}
              />
              {experience.showTasks ? (
                <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-white p-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">Task list bullets</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Same puce styles as About → Why me. Choose Global to follow Global → Titles &amp;
                      motion → Task list bullets.
                    </p>
                  </div>
                  <ExperienceOptionGrid
                    label="Source"
                    options={PORTFOLIO_LIST_MARKER_SOURCE_OPTIONS}
                    value={experience.taskBulletSource ?? 'global'}
                    onChange={(taskBulletSource) => onChange({ taskBulletSource })}
                    columns={2}
                  />
                  <ExperienceOptionGrid
                    label="Espacement entre tâches"
                    options={PORTFOLIO_EXPERIENCE_TASK_ITEM_GAP_OPTIONS}
                    value={experience.taskItemGap ?? 'md'}
                    onChange={(taskItemGap) => onChange({ taskItemGap })}
                    columns={4}
                  />
                  {experience.taskBulletSource === 'section' ? (
                    <>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                          Style
                        </p>
                        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                          {PORTFOLIO_LIST_MARKER_STYLE_OPTIONS.map((option) => {
                            const active = (experience.taskBulletStyle ?? 'disc') === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                title={`${option.label} — ${option.description}`}
                                onClick={() => onChange({ taskBulletStyle: option.value })}
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
                      {(experience.taskBulletStyle ?? 'disc') !== 'none' ? (
                        <>
                          <PortfolioListMarkerSizeWeightControls
                            size={experience.taskBulletSize ?? 'md'}
                            sizePx={experience.taskBulletSizePx}
                            weight={experience.taskBulletWeight ?? 'regular'}
                            weightAmount={experience.taskBulletWeightAmount}
                            OptionGrid={ExperienceOptionGrid}
                            sizeLabel="Size"
                            weightLabel="Weight"
                            onChange={(patch) =>
                              onChange({
                                ...(patch.size !== undefined ? { taskBulletSize: patch.size } : null),
                                ...(patch.sizePx !== undefined ? { taskBulletSizePx: patch.sizePx } : null),
                                ...(patch.weight !== undefined ? { taskBulletWeight: patch.weight } : null),
                                ...(patch.weightAmount !== undefined
                                  ? { taskBulletWeightAmount: patch.weightAmount }
                                  : null),
                              })
                            }
                          />
                          <ExperienceManualColorField
                            label="Bullet color"
                            value={experience.taskBulletColor}
                            onChange={(taskBulletColor) => onChange({ taskBulletColor })}
                          />
                        </>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-neutral-500">
                      Using Global task list bullets. Switch to Section to override here.
                    </p>
                  )}
                </div>
              ) : null}
              <ExperienceToggleRow
                label="Tools"
                checked={experience.showTools}
                onChange={(showTools) => onChange({ showTools })}
              />
              <ExperienceToggleRow
                label="Proof links"
                checked={experience.showProof}
                onChange={(showProof) => onChange({ showProof })}
              />
              <ExperienceToggleRow
                label="Note / remarks"
                checked={experience.showNote}
                onChange={(showNote) => onChange({ showNote })}
              />
              <ExperienceToggleRow
                label="Skills tags"
                checked={experience.showSkills}
                onChange={(showSkills) => onChange({ showSkills })}
              />
            </div>
          </div>
        </div>
      ) : null}

      {subSection === 'palette' ? (
        <ExperiencePalettePanel experience={experience} onChange={onChange} />
      ) : null}

      {subSection === 'styleEntry' ? (
        <PortfolioElementStyleFields
          targets={PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS.filter((option) =>
            EXPERIENCE_ENTRY_STYLE_TARGETS.includes(option.value)
          )}
          activeTarget={styleTarget}
          onTargetChange={(value) => setStyleTarget(value as PortfolioExperienceStyleTarget)}
          style={
            {
              ...elementStyles[styleTarget],
              weight: elementStyles[styleTarget].bold ? 'bold' : 'normal',
              decoration: 'none',
              highlightColor: '#fde68a',
            } as import('@/components/portfolio/portfolio-element-text-style').PortfolioElementTextStyle
          }
          onStyleChange={(patch) => {
            const next = patchExperienceElementStyle(
              elementStyles,
              styleTarget,
              patch as Partial<
                import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceTextStyle
              >
            );
            const slot = EXPERIENCE_STYLE_TARGET_COLOR_SLOT[styleTarget];
            onChange(
              asExperiencePatch(
                experience.useHeroPalette !== false && patch.color
                  ? { elementStyles: next, ...patchExperienceColorField(experience, slot, patch.color) }
                  : { elementStyles: next }
              )
            );
          }}
          renderColorField={({ label, value }) => (
            <ExperienceColorField
              experience={experience}
              onChange={onChange}
              slot={EXPERIENCE_STYLE_TARGET_COLOR_SLOT[styleTarget]}
              label={label}
              value={value}
            />
          )}
          extra={
            styleTarget === 'meta' ? (
              <ExperienceOptionGrid
                label="Status badge style"
                options={PORTFOLIO_EXPERIENCE_STATUS_BADGE_STYLE_OPTIONS}
                value={experience.statusBadgeStyle ?? 'pill'}
                onChange={(statusBadgeStyle) => onChange({ statusBadgeStyle })}
                columns={2}
              />
            ) : null
          }
        />
      ) : null}

      {subSection === 'styleYears' ? (
        <div className="space-y-6">
          <ExperienceColorField
            experience={experience}
            onChange={onChange}
            slot="years"
            label="Phrase color"
            value={experience.yearsColor}
          />
          <ExperienceColorField
            experience={experience}
            onChange={onChange}
            slot="yearsHighlight"
            label="Years count color"
            value={experience.yearsHighlightColor}
          />
        </div>
      ) : null}

      {subSection === 'styleBlocks' ? (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Tools / Proof / Skills chips
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Pill fill and border — synced with light / dark Global palette when palette mode is on.
              </p>
            </div>
            <ExperienceColorField
              experience={experience}
              onChange={onChange}
              slot="entryChipBackground"
              label="Chip background"
              value={experience.entryChipBackgroundColor}
            />
            <ExperienceColorField
              experience={experience}
              onChange={onChange}
              slot="entryChipBorder"
              label="Chip border"
              value={experience.entryChipBorderColor}
            />
          </div>
          <PortfolioElementStyleFields
            targets={PORTFOLIO_EXPERIENCE_STYLE_TARGET_OPTIONS.filter((option) =>
              EXPERIENCE_BLOCK_STYLE_TARGETS.includes(option.value)
            )}
            activeTarget={styleTarget}
            onTargetChange={(value) => setStyleTarget(value as PortfolioExperienceStyleTarget)}
          style={
            {
              ...elementStyles[styleTarget],
              weight: elementStyles[styleTarget].bold ? 'bold' : 'normal',
              decoration: 'none',
              highlightColor: '#fde68a',
            } as import('@/components/portfolio/portfolio-element-text-style').PortfolioElementTextStyle
          }
          onStyleChange={(patch) => {
            const next = patchExperienceElementStyle(
              elementStyles,
              styleTarget,
              patch as Partial<
                import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceTextStyle
              >
            );
              const slot = EXPERIENCE_STYLE_TARGET_COLOR_SLOT[styleTarget];
              onChange(
                asExperiencePatch(
                  experience.useHeroPalette !== false && patch.color
                    ? { elementStyles: next, ...patchExperienceColorField(experience, slot, patch.color) }
                    : { elementStyles: next }
                )
              );
            }}
            renderColorField={({ label, value }) => (
              <ExperienceColorField
                experience={experience}
                onChange={onChange}
                slot={EXPERIENCE_STYLE_TARGET_COLOR_SLOT[styleTarget]}
                label={label}
                value={value}
              />
            )}
            extra={
            styleTarget === 'skills' ? (
              <ExperienceOptionGrid
                label="Skills tag chrome"
                options={PORTFOLIO_EXPERIENCE_SKILLS_TAG_STYLE_OPTIONS}
                value={experience.skillsTagStyle}
                onChange={(skillsTagStyle) => onChange({ skillsTagStyle })}
                columns={2}
              />
            ) : styleTarget === 'proof' ? (
              <ExperienceOptionGrid
                label="Proof link chrome"
                options={PORTFOLIO_EXPERIENCE_PROOF_LINK_STYLE_OPTIONS}
                value={experience.proofLinkStyle ?? 'pill'}
                onChange={(proofLinkStyle) => onChange({ proofLinkStyle })}
                columns={2}
              />
            ) : styleTarget === 'tools' ? (
              <>
                <ExperienceOptionGrid
                  label="Tools icon size"
                  options={PORTFOLIO_EXPERIENCE_TOOLS_ICON_SIZE_OPTIONS}
                  value={experience.toolsIconSize}
                  onChange={(toolsIconSize) => onChange({ toolsIconSize })}
                  columns={2}
                />
                <ExperienceOptionGrid
                  label="Tools icon border"
                  options={PORTFOLIO_EXPERIENCE_TOOLS_ICON_BORDER_OPTIONS}
                  value={experience.toolsIconBorder ?? 'solid'}
                  onChange={(toolsIconBorder) => onChange({ toolsIconBorder })}
                  columns={3}
                />
                {(experience.toolsIconBorder ?? 'solid') !== 'none' ? (
                  <ExperienceColorField
                    experience={experience}
                    onChange={onChange}
                    slot="toolsIconBorder"
                    label="Tools icon border color"
                    value={experience.toolsIconBorderColor || experience.entryChipBorderColor}
                  />
                ) : null}
                <ExperienceToolsStyleControls experience={experience} onChange={onChange} />
              </>
            ) : null
          }
        />
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Layer</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FRAME_LAYER_OPTIONS.map((layer) => {
                const active = frameLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setFrameLayer(layer.id)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                    }`}
                  >
                    <p className="text-sm font-semibold text-neutral-950">{layer.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">{layer.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <ExperienceToggleRow
            label={
              frameLayer === 'entry'
                ? 'Show entry background'
                : frameLayer === 'story'
                  ? 'Show story card frame'
                  : frameLayer === 'detailsSecondary'
                    ? 'Show proof card frame'
                    : 'Show tasks card frame'
            }
            description={
              frameLayer === 'entry'
                ? 'Outer background around both columns. Card designs keep a shell even when off; turn on for timeline Magazine / rails.'
                : 'Independent border, fill, radius, and padding for this inner card.'
            }
            checked={activeFrame.enabled}
            onChange={(enabled) => patchActiveFrame({ enabled })}
          />

          <PortfolioCardFrameSettingsFields
            settings={experienceLayerToCardFrameSettings(activeFrame)}
            onChange={patchActiveFrame}
            heading={FRAME_LAYER_OPTIONS.find((layer) => layer.id === frameLayer)?.label ?? 'Frame'}
            description="Border, fill, radius, and padding for this layer only."
            renderColorField={({ field, label, value }) =>
              frameLayer === 'detailsSecondary' && experience.useHeroPalette === false ? (
                <ExperienceManualColorField
                  label={label}
                  value={value}
                  onChange={(hex) =>
                    patchActiveFrame({
                      [field]: hex,
                      ...(field === 'cardBackgroundColor' ||
                      field === 'cardBackgroundColorA' ||
                      field === 'cardBackgroundColorB'
                        ? { cardBackgroundEnabled: true }
                        : {}),
                    })
                  }
                />
              ) : (
                <ExperienceColorField
                  experience={experience}
                  onChange={onChange}
                  slot={EXPERIENCE_FRAME_SLOTS[frameLayer][field]}
                  label={label}
                  value={value}
                />
              )
            }
          />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <ExperienceOptionGrid
            label="Disposition titre / liste"
            options={PORTFOLIO_EXPERIENCE_SECTION_LAYOUT_OPTIONS}
            value={experience.sectionLayout ?? 'stacked'}
            onChange={(sectionLayout) => onChange({ sectionLayout })}
            columns={1}
          />
          {experienceSectionLayoutIsAside(experience.sectionLayout) ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              En côte à côte, le titre et les expériences s’affichent en deux colonnes sur grand écran
              (empilés sur mobile).
            </p>
          ) : null}
          <ExperienceOptionGrid
            label="Title preset"
            options={PORTFOLIO_EXPERIENCE_TITLE_PRESET_OPTIONS}
            value={experience.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {experience.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={experience.titleCustom || experience.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <ExperienceOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_EXPERIENCE_SUBTITLE_PRESET_OPTIONS}
            value={experience.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {experience.subtitlePreset === 'custom' || experience.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={
                  experience.subtitlePreset === 'custom'
                    ? experience.subtitleCustom || experience.subtitle
                    : experience.subtitle
                }
                onChange={(event) =>
                  onChange(
                    experience.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceOptionGrid
              label="Title font"
              options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
              value={experience.titleFont}
              onChange={(titleFont) => onChange({ titleFont })}
              columns={2}
            />
            <ExperienceOptionGrid
              label="Subtitle font"
              options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
              value={experience.subtitleFont}
              onChange={(subtitleFont) => onChange({ subtitleFont })}
              columns={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceColorField
              experience={experience}
              onChange={onChange}
              slot="title"
              label="Title color"
              value={experience.titleColor}
            />
            <ExperienceColorField
              experience={experience}
              onChange={onChange}
              slot="subtitle"
              label="Subtitle color"
              value={experience.subtitleColor}
            />
          </div>

          {experienceSectionLayoutIsAside(experience.sectionLayout) ? (
            <p className="text-sm text-neutral-500">
              Alignement du texte du titre : le titre est déjà placé{' '}
              {experience.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} de la liste.
            </p>
          ) : (
            <ExperienceOptionGrid
              label="Header alignment"
              options={[
                { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
                { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
                { value: 'right' as const, label: 'Right', description: 'Align header to the right.' },
              ]}
              value={experience.headerAlignment}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
              columns={3}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <ExperienceToggleRow
              label="Uppercase title"
              checked={experience.titleUppercase}
              onChange={(titleUppercase) => onChange({ titleUppercase })}
            />
            <ExperienceToggleRow
              label="Uppercase subtitle"
              checked={experience.subtitleUppercase}
              onChange={(subtitleUppercase) => onChange({ subtitleUppercase })}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Illustration Experience</p>
              <p className="mt-1 text-sm text-neutral-500">
                SVG décoratif à côté de la liste. Choisissez un style, puis placez-le à gauche ou à
                droite sur grand écran.
              </p>
            </div>
            <ExperienceOptionGrid
              label="Style SVG"
              options={PORTFOLIO_EXPERIENCE_ILLUSTRATION_OPTIONS}
              value={experience.illustrationVariant ?? 'none'}
              onChange={(illustrationVariant) => onChange({ illustrationVariant })}
              columns={2}
            />
            {(experience.illustrationVariant ?? 'none') !== 'none' ? (
              <ExperienceOptionGrid
                label="Position du SVG"
                options={PORTFOLIO_EXPERIENCE_ILLUSTRATION_PLACEMENT_OPTIONS}
                value={experience.illustrationPlacement ?? 'right'}
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
                columns={2}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'years' ? (
        <div className="space-y-6">
          <ExperienceToggleRow
            label="Show years line"
            description="Display the years-of-experience summary above the list."
            checked={experience.showYears}
            onChange={(showYears) => onChange({ showYears })}
          />
          {experience.showYears ? (
            <>
              <ExperienceOptionGrid
                label="Phrase preset"
                options={PORTFOLIO_EXPERIENCE_YEARS_PRESET_OPTIONS}
                value={experience.yearsPreset}
                onChange={(yearsPreset) => onChange({ yearsPreset })}
              />
              {experience.yearsPreset === 'custom' ? (
                <>
                  <input
                    type="text"
                    value={experience.yearsCustom}
                    onChange={(event) => onChange({ yearsCustom: event.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                  <p className="text-xs text-neutral-500">
                    Use {'{years}'} for the count — e.g. {'{years}+ years of hands-on experience in my field.'}
                  </p>
                </>
              ) : null}
              <ExperienceOptionGrid
                label="Phrase font"
                options={PORTFOLIO_EXPERIENCE_HEADER_FONT_OPTIONS}
                value={experience.yearsFont}
                onChange={(yearsFont) => onChange({ yearsFont })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Phrase size"
                options={PORTFOLIO_EXPERIENCE_YEARS_SIZE_OPTIONS.map((option) => ({
                  ...option,
                  description: option.label,
                }))}
                value={experience.yearsSize}
                onChange={(yearsSize) => onChange({ yearsSize })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Phrase alignment"
                options={PORTFOLIO_EXPERIENCE_CONTENT_ALIGN_OPTIONS}
                value={experience.yearsAlignment}
                onChange={(yearsAlignment) => onChange({ yearsAlignment })}
                columns={3}
              />
              <ExperienceColorField
                experience={experience}
                onChange={onChange}
                slot="years"
                label="Phrase color"
                value={experience.yearsColor}
              />
              <ExperienceColorField
                experience={experience}
                onChange={onChange}
                slot="yearsHighlight"
                label="Years count color"
                value={experience.yearsHighlightColor}
              />
              <ExperienceToggleRow
                label="Bold years count"
                checked={experience.yearsBoldYears}
                onChange={(yearsBoldYears) => onChange({ yearsBoldYears })}
              />
              <ExperienceToggleRow
                label="Italic phrase"
                checked={experience.yearsItalic}
                onChange={(yearsItalic) => onChange({ yearsItalic })}
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <SectionBackgroundSettingsFields
          settings={experience}
          onChange={onChange}
          renderColorField={({ label, value, onChange: onBgColorChange }) => {
            const slot = EXPERIENCE_BACKGROUND_LABEL_SLOTS[label];
            if (!slot) {
              return (
                <ExperienceManualColorField label={label} value={value} onChange={onBgColorChange} />
              );
            }
            return (
              <ExperienceColorField
                experience={experience}
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
