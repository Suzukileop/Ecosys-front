'use client';

import { useState, type ReactNode } from 'react';
import {
  PORTFOLIO_WORK_CARD_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CARD_BORDER_OPTIONS,
  PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CARD_CONTENT_VERTICAL_ALIGN_OPTIONS,
  PORTFOLIO_WORK_CARD_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CARD_GAP_OPTIONS,
  PORTFOLIO_WORK_CARD_MAX_WIDTH_OPTIONS,
  PORTFOLIO_WORK_CARD_PADDING_OPTIONS,
  PORTFOLIO_WORK_CARD_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CARD_SHADOW_OPTIONS,
  PORTFOLIO_WORK_CARD_SHADOW_PRESET_INTENSITY,
  PORTFOLIO_WORK_CONTENT_FRAME_GAP_OPTIONS,
  PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS,
  PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS,
  PORTFOLIO_WORK_NO_MEDIA_INFO_LAYOUT_OPTIONS,
  PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS,
  PORTFOLIO_WORK_CTA_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CTA_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_WORK_CTA_DESIGN_OPTIONS,
  PORTFOLIO_WORK_CTA_ICON_OPTIONS,
  PORTFOLIO_WORK_CTA_ICON_POSITION_OPTIONS,
  PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS,
  PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS,
  PORTFOLIO_WORK_ACCORDION_ALIGN_OPTIONS,
  PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS,
  PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS,
  PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS,
  PORTFOLIO_WORK_INDEX_ROW_GAP_OPTIONS,
  PORTFOLIO_WORK_INDEX_MARKER_OPTIONS,
  workSectionDesignSettingsPatch,
  DEFAULT_PROJECTS_BOARD_SETTINGS,
  DEFAULT_PROJECTS_ACCORDION_SETTINGS,
  DEFAULT_PROJECTS_FRAMES_SETTINGS,
  DEFAULT_PROJECTS_INDEX_SETTINGS,
  PORTFOLIO_WORK_GRID_COLUMNS_OPTIONS,
  DEFAULT_PROJECTS_GRID_SETTINGS,
  DEFAULT_PROJECTS_SPLIT_SETTINGS,
  DEFAULT_PROJECTS_CAROUSEL_SETTINGS,
  DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS,
  DEFAULT_PROJECTS_SHOWCASE_SETTINGS,
  DEFAULT_PROJECTS_EDITORIAL_SETTINGS,
  DEFAULT_PROJECTS_LEDGER_SETTINGS,
  DEFAULT_PROJECTS_FOLIO_SETTINGS,
  DEFAULT_PROJECTS_SPEC_SETTINGS,
  DEFAULT_PROJECTS_CASE_SETTINGS,
  PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS,
  PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS,
  PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS,
  PORTFOLIO_WORK_SPEC_FRAME_OPTIONS,
  PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS,
  PORTFOLIO_WORK_FOLIO_STACK_DESIGN_OPTIONS,
  PORTFOLIO_WORK_EDITORIAL_RIGHT_PANEL_OPTIONS,
  PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS,
  PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS,
  PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS,
  PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS,
  PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS,
  PORTFOLIO_WORK_SPLIT_TITLE_SIDE_OPTIONS,
  PORTFOLIO_WORK_SPLIT_TITLE_VERTICAL_OPTIONS,
  PORTFOLIO_WORK_SPLIT_DESCRIPTION_PLACEMENT_OPTIONS,
  PORTFOLIO_WORK_SPLIT_DESCRIPTION_VERTICAL_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS,
  PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS,
  PORTFOLIO_WORK_SPOTLIGHT_LIST_SIDE_OPTIONS,
  PORTFOLIO_WORK_SPOTLIGHT_STACK_STYLE_OPTIONS,
  PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS,
  PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS,
  PORTFOLIO_WORK_ILLUSTRATION_OPTIONS,
  PORTFOLIO_WORK_ILLUSTRATION_PLACEMENT_OPTIONS,
  PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS,
  PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS,
  PORTFOLIO_WORK_OVERLAY_LAYOUT_MODE_OPTIONS,
  PORTFOLIO_WORK_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_WORK_STYLE_TARGET_OPTIONS,
  PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_WORK_TITLE_PRESET_OPTIONS,
  PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS,
  WORK_TOOLS_MARGIN_TOP_PX_MAX,
  WORK_TOOLS_MARGIN_TOP_PX_MIN,
  WORK_ELEMENT_CHROME_PADDING_PRESET_PX,
  WORK_ELEMENT_CHROME_PADDING_PX_MAX,
  WORK_ELEMENT_CHROME_PADDING_PX_MIN,
  clampWorkElementChromePaddingPx,
  clampWorkToolsMarginTopPx,
  normalizeWorkElementStyles,
  patchWorkElementChrome,
  patchWorkElementStyle,
  resolveWorkElementChromePaddingPx,
  workGalleryLayoutSettingsPatch,
  workSectionLayoutIsAside,
  DEFAULT_WORK_OVERLAY_ELEMENT_BANDS,
  DEFAULT_WORK_ELEMENT_CHROMES,
  type PortfolioWorkCardPadding,
  type PortfolioWorkElementChromeId,
  type PortfolioWorkItemsPerRow,
  type PortfolioWorkOverlayCellPlacement,
  type PortfolioWorkOverlayElementBand,
  type PortfolioWorkOverlayElementId,
  type PortfolioWorkSectionSettings,
  type PortfolioWorkStyleTarget,
  workCardIsStacked,
  workGallerySupportsItemsPerRow,
  workItemsPerRowResponsiveHint,
} from '@/components/portfolio/portfolio-work-settings';
import { PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS } from '@/components/portfolio/portfolio-element-text-style';
import { PortfolioElementStyleFields } from '@/components/portfolio/portfolio-element-style-fields';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  applyWorkPaletteToSettings,
  DEFAULT_WORK_COLOR_BINDINGS,
  DEFAULT_WORK_PALETTE,
  mergeWorkColorBindings,
  mergeWorkPalette,
  patchWorkColorBinding,
  patchWorkColorField,
  patchWorkColorFieldManual,
  PORTFOLIO_WORK_COLOR_SLOT_OPTIONS,
  WORK_STYLE_TARGET_COLOR_SLOT,
  type WorkColorSlot,
} from '@/components/portfolio/portfolio-work-palette-settings';

export type WorkSettingsSubSection =
  | 'general'
  | 'header'
  | 'design'
  | 'categories'
  | 'cards'
  | 'media'
  | 'title'
  | 'description'
  | 'tools'
  | 'cta'
  | 'background'
  | 'palette'
  /** @deprecated Prefer title / description / tools / cta */
  | 'style';

const WORK_SETTINGS_SUB_SECTIONS: {
  id: Exclude<WorkSettingsSubSection, 'style'>;
  label: string;
  description: string;
}[] = [
  { id: 'general', label: 'General', description: 'Section visibility and marketplace link.' },
  { id: 'header', label: 'Header', description: 'Title and subtitle presets, fonts, and colors.' },
  {
    id: 'design',
    label: 'Design',
    description: 'Named Portfolio layouts — classic gallery or projects board.',
  },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Filter chips, category on cards, placement, and typography.',
  },
  {
    id: 'cards',
    label: 'Cards',
    description: 'Gallery layout, columns, frame, and card design.',
  },
  {
    id: 'media',
    label: 'Media',
    description: 'Project image placement (left / right / top / bottom), size, and border.',
  },
  {
    id: 'title',
    label: 'Titre',
    description: 'Project title visibility, overlay placement, and typography.',
  },
  {
    id: 'description',
    label: 'Description',
    description: 'Description visibility, overlay placement, and typography.',
  },
  {
    id: 'tools',
    label: 'Outils',
    description: 'Tools row, icons, overlay placement, and typography.',
  },
  {
    id: 'cta',
    label: 'CTA',
    description: 'View project button design, placement, and typography.',
  },
  { id: 'background', label: 'Background', description: 'Section fill, gradients, and opacity.' },
  {
    id: 'palette',
    label: 'Palette',
    description: 'Use the Global site palette and bind section colors to tokens.',
  },
];

/** Map legacy subsection ids (saved UI state / search) to the new element menus. */
export function normalizeWorkSettingsSubSection(value: string | undefined): WorkSettingsSubSection {
  if (value === 'style') return 'title';
  if (
    value === 'general' ||
    value === 'header' ||
    value === 'design' ||
    value === 'categories' ||
    value === 'cards' ||
    value === 'media' ||
    value === 'title' ||
    value === 'description' ||
    value === 'tools' ||
    value === 'cta' ||
    value === 'background' ||
    value === 'palette'
  ) {
    return value;
  }
  return 'header';
}

const WORK_BACKGROUND_LABEL_SLOTS: Record<string, WorkColorSlot> = {
  Color: 'sectionBackground',
  'Gradient start': 'sectionGradientFrom',
  'Gradient end': 'sectionGradientTo',
  'Couleur zone haut': 'sectionSplitA',
  'Couleur zone gauche': 'sectionSplitA',
  'Couleur zone bas': 'sectionSplitB',
  'Couleur zone droite': 'sectionSplitB',
  'Couleur de la ligne': 'sectionDivider',
};

function asWorkPatch(
  patch: Record<string, unknown> | object
): Partial<PortfolioWorkSectionSettings> {
  return patch as Partial<PortfolioWorkSectionSettings>;
}

function WorkUsePaletteToggle({
  work,
  onChange,
  description,
  enabledHint,
  disabledHint,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  description: string;
  enabledHint?: string;
  disabledHint?: string;
}) {
  return (
    <SectionHeroPaletteToggle
      enabled={work.useHeroPalette !== false}
      onChange={(useHeroPalette) =>
        onChange(
          asWorkPatch(
            useHeroPalette
              ? { useHeroPalette, ...applyWorkPaletteToSettings(work) }
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

function WorkColorField({
  work,
  onChange,
  slot,
  label,
  description,
  value,
  allowManualHex = false,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  slot: WorkColorSlot;
  label: string;
  description?: string;
  value: string;
  /** When palette is on, also show a hex picker that overrides the token until rebound. */
  allowManualHex?: boolean;
}) {
  const paletteOn = work.useHeroPalette !== false;
  const isManualOverride =
    (slot === 'contentFrameBackground' && work.contentFrameBackgroundManual) ||
    (slot === 'contentFrameBorder' && work.contentFrameBorderManual) ||
    (slot === 'overlayBottomRule' && work.overlayBottomRuleManual);

  if (!paletteOn) {
    return (
      <WorkManualColorField
        label={label}
        description={description}
        value={value}
        onChange={(hex) => onChange(asWorkPatch(patchWorkColorField(work, slot, hex)))}
      />
    );
  }

  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const token = bindings[slot];
  const resolved = resolveHeroPaletteColor(palette, token);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
            {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
          </div>
          <span
            className="mt-0.5 h-7 w-7 shrink-0 rounded-full border border-neutral-200"
            style={{ backgroundColor: isManualOverride ? value : resolved }}
            title={isManualOverride ? value : resolved}
            aria-hidden
          />
        </div>
        <select
          value={token}
          onChange={(event) =>
            onChange(
              asWorkPatch(
                patchWorkColorBinding(work, slot, event.target.value as HeroPaletteTokenId)
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
        {!allowManualHex ? (
          <p className="text-xs text-neutral-500">
            Bound to token · edit hex under{' '}
            <span className="font-semibold text-neutral-700">Global → Theme</span>
          </p>
        ) : (
          <p className="text-xs text-neutral-500">
            Token palette{isManualOverride ? ' · override manuel actif' : ''} · changez le token pour
            resynchroniser.
          </p>
        )}
      </div>

      {allowManualHex ? (
        <WorkManualColorField
          label="Couleur manuelle"
          description="Hex indépendant du token. Changer le token ci-dessus annule l’override."
          value={value}
          onChange={(hex) => onChange(asWorkPatch(patchWorkColorFieldManual(work, slot, hex)))}
        />
      ) : null}
    </div>
  );
}

function WorkManualColorField({
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

function WorkPalettePanel({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  const palette = mergeWorkPalette(DEFAULT_WORK_PALETTE, work.workPalette);
  const bindings = mergeWorkColorBindings(DEFAULT_WORK_COLOR_BINDINGS, work.workColorBindings);
  const paletteOn = work.useHeroPalette !== false;

  return (
    <div className="space-y-6">
      <WorkUsePaletteToggle
        work={work}
        onChange={onChange}
        description="When on, Portfolio colors follow the Global site palette. Turn off to edit colors manually in Header, Cards, Style, and Background."
        enabledHint="Edit the dark/light token pair under Global → Theme. Bindings below pick which token each portfolio color uses."
        disabledHint="Global palette tokens still exist, but Portfolio uses manual hex colors until you turn this back on."
      />

      <p className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 px-4 py-3 text-sm text-neutral-600">
        The site color palette lives in <span className="font-semibold">Global → Theme</span> as a
        coupled dark / light pair. Portfolio no longer has its own Mode sombre / Mode clair editor.
      </p>

      {paletteOn ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Color bindings
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Pick which Global token each portfolio color uses. Swatches preview the active mode.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PORTFOLIO_WORK_COLOR_SLOT_OPTIONS.map((slot) => {
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
                        asWorkPatch(
                          patchWorkColorBinding(
                            work,
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
          or edit hex fields under Header / Cards / Style / Background.
        </p>
      )}
    </div>
  );
}

function WorkToggleRow({
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

const WORK_ELEMENT_CHROME_COLOR_SLOTS: Record<
  PortfolioWorkElementChromeId,
  { background: WorkColorSlot; border: WorkColorSlot }
> = {
  categoryOnCard: {
    background: 'categoryChromeBackground',
    border: 'categoryChromeBorder',
  },
  cardTitle: {
    background: 'titleChromeBackground',
    border: 'titleChromeBorder',
  },
  cardDescription: {
    background: 'descriptionChromeBackground',
    border: 'descriptionChromeBorder',
  },
  tools: {
    background: 'toolsChromeBackground',
    border: 'toolsChromeBorder',
  },
};

function WorkElementChromeControls({
  work,
  chromeId,
  onChange,
  title = 'Fond de l’élément',
  description = 'Ajoute un fond derrière cet élément — padding, marge, couleur et bordure.',
}: {
  work: PortfolioWorkSectionSettings;
  chromeId: PortfolioWorkElementChromeId;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  title?: string;
  description?: string;
}) {
  const chrome = work.elementChromes?.[chromeId] ?? DEFAULT_WORK_ELEMENT_CHROMES[chromeId];
  const slots = WORK_ELEMENT_CHROME_COLOR_SLOTS[chromeId];

  const patchChrome = (patch: Partial<typeof chrome>) => {
    onChange({
      elementChromes: patchWorkElementChrome(
        work.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES,
        chromeId,
        patch
      ),
    });
  };

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>
      <WorkToggleRow
        label="Activer le fond"
        description="Encadre cet élément avec un fond et optionnellement une bordure."
        checked={chrome.enabled}
        onChange={(enabled) => patchChrome({ enabled })}
      />
      {chrome.enabled ? (
        <>
          <WorkToggleRow
            label="Remplissage"
            description="Couleur de fond derrière le texte / les icônes."
            checked={chrome.backgroundEnabled}
            onChange={(backgroundEnabled) => patchChrome({ backgroundEnabled })}
          />
          {chromeId === 'tools' ? (
            <WorkToggleRow
              label="Limiter aux icônes"
              description="Le fond et la bordure s’ajustent à la largeur des icônes (pas toute la colonne)."
              checked={chrome.fitContent}
              onChange={(fitContent) => patchChrome({ fitContent })}
            />
          ) : null}
          {chrome.backgroundEnabled ? (
            <WorkColorField
              work={work}
              onChange={onChange}
              slot={slots.background}
              label="Couleur de fond"
              value={chrome.backgroundColor}
            />
          ) : null}
          <WorkOptionGrid
            label="Bordure"
            options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
            value={chrome.border}
            onChange={(border) => patchChrome({ border })}
            columns={2}
          />
          {chrome.border === 'soft' || chrome.border === 'solid' ? (
            <WorkColorField
              work={work}
              onChange={onChange}
              slot={slots.border}
              label="Couleur de bordure"
              value={chrome.borderColor}
            />
          ) : null}
          <WorkOptionGrid
            label="Coins"
            options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
            value={chrome.borderRadius}
            onChange={(borderRadius) => patchChrome({ borderRadius })}
            columns={2}
          />
          <WorkOptionGrid
            label="Padding (intérieur)"
            options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
            value={
              chrome.padding === 'custom'
                ? ('' as PortfolioWorkCardPadding)
                : chrome.padding
            }
            onChange={(padding) =>
              patchChrome({
                padding,
                paddingPx: WORK_ELEMENT_CHROME_PADDING_PRESET_PX[padding],
              })
            }
            columns={2}
          />
          {chrome.padding === 'custom' ? (
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
                {resolveWorkElementChromePaddingPx(chrome)}px
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Marge intérieure exacte du fond (ex. Tools).
            </p>
            <input
              type="range"
              min={WORK_ELEMENT_CHROME_PADDING_PX_MIN}
              max={WORK_ELEMENT_CHROME_PADDING_PX_MAX}
              step={1}
              value={resolveWorkElementChromePaddingPx(chrome)}
              onChange={(event) => {
                const px = clampWorkElementChromePaddingPx(Number(event.target.value), 16);
                patchChrome({ padding: 'custom', paddingPx: px });
              }}
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Padding intérieur manuel en pixels"
            />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
              <span>{WORK_ELEMENT_CHROME_PADDING_PX_MIN}px</span>
              <span>{WORK_ELEMENT_CHROME_PADDING_PX_MAX}px</span>
            </div>
          </div>
          <WorkOptionGrid
            label="Marge (extérieur)"
            options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
            value={chrome.margin}
            onChange={(margin) => patchChrome({ margin })}
            columns={2}
          />
        </>
      ) : null}
    </div>
  );
}

function WorkOptionGrid<T extends string | number>({
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
  columns?: 1 | 2 | 3 | 4;
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
              key={String(option.value)}
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

/** Compact 3×3 snap grid for overlay immersive free placement (desktop). */
function WorkOverlayCellPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PortfolioWorkOverlayCellPlacement;
  onChange: (value: PortfolioWorkOverlayCellPlacement) => void;
}) {
  const activeLabel =
    PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS.find((option) => option.value === value)?.label ?? value;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-2 inline-grid grid-cols-3 gap-1.5 rounded-xl border border-neutral-200 bg-white p-2">
        {PORTFOLIO_WORK_OVERLAY_CELL_OPTIONS.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={`${label}: ${option.label}`}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                active
                  ? 'border-neutral-900 bg-neutral-950 text-white shadow-sm'
                  : 'border-neutral-300 bg-white text-neutral-400 hover:border-neutral-500 hover:text-neutral-700'
              }`}
            >
              <span
                className={`block h-2 w-2 rounded-full ${active ? 'bg-orange-400' : 'bg-current'}`}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs font-medium text-neutral-600">{activeLabel}</p>
    </div>
  );
}

/** Per-element overlay free placement — mirrors Hero’s per-element layout block. */
function WorkOverlayElementPlacementControls({
  work,
  elementId,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  elementId: PortfolioWorkOverlayElementId;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  if (work.galleryLayout !== 'overlay') {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
        Le placement libre 3×3 est disponible uniquement avec la disposition{' '}
        <span className="font-semibold text-neutral-700">Overlay immersif</span> (onglet Cards).
      </p>
    );
  }

  const band = work.overlayElementBands?.[elementId] ?? DEFAULT_WORK_OVERLAY_ELEMENT_BANDS[elementId];
  const bandOptions: {
    value: PortfolioWorkOverlayElementBand;
    label: string;
    description: string;
  }[] = [
    {
      value: 'on-media',
      label: 'Sur le média',
      description: 'Affiché dans l’image, avec le style overlay immersif.',
    },
    {
      value: 'above',
      label: 'Au-dessus',
      description: 'Affiché dans le flux normal avant le média.',
    },
    {
      value: 'below',
      label: 'En dessous',
      description: 'Affiché dans le flux normal après le média.',
    },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-950">Zone de placement</p>
        <p className="mt-1 text-sm text-neutral-500">
          Choisissez si cet élément apparaît sur le média ou à l’extérieur de celui-ci.
        </p>
      </div>

      <WorkOptionGrid
        label="Bande"
        options={bandOptions}
        value={band}
        onChange={(nextBand) =>
          onChange({
            overlayElementBands: {
              ...(work.overlayElementBands ?? DEFAULT_WORK_OVERLAY_ELEMENT_BANDS),
              [elementId]: nextBand,
            },
          })
        }
        columns={3}
      />

      {band === 'on-media' ? (
        work.overlayLayoutMode !== 'free' ? (
          <WorkToggleRow
            label="Activer le placement libre"
            description="Passe la carte overlay en disposition libre (desktop). Les autres éléments restent configurables dans leur sous-section."
            checked={false}
            onChange={(enabled) => {
              if (enabled) onChange({ overlayLayoutMode: 'free' });
            }}
          />
        ) : (
          <WorkOverlayCellPicker
            label="Cellule 3×3"
            value={work.overlayElementPlacements[elementId]}
            onChange={(cell) =>
              onChange({
                overlayElementPlacements: {
                  ...work.overlayElementPlacements,
                  [elementId]: cell,
                },
              })
            }
          />
        )
      ) : (
        <p className="text-xs leading-relaxed text-neutral-500">
          L’alignement horizontal conserve la colonne de la cellule 3×3 enregistrée pour cet élément.
        </p>
      )}
    </div>
  );
}

function WorkInlineTypography({
  work,
  target,
  onChange,
  title = 'Typography',
  extra,
}: {
  work: PortfolioWorkSectionSettings;
  target: PortfolioWorkStyleTarget;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  title?: string;
  extra?: ReactNode;
}) {
  const elementStyles = normalizeWorkElementStyles(work.elementStyles);
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <PortfolioElementStyleFields
        targets={PORTFOLIO_WORK_STYLE_TARGET_OPTIONS}
        activeTarget={target}
        onTargetChange={() => {}}
        hideTargetPicker
        title={title}
        style={elementStyles[target]}
        onStyleChange={(patch) =>
          onChange({ elementStyles: patchWorkElementStyle(elementStyles, target, patch) })
        }
        renderColorField={({ label, value }) => (
          <WorkColorField
            work={work}
            onChange={onChange}
            slot={WORK_STYLE_TARGET_COLOR_SLOT[target]}
            label={label}
            value={value}
          />
        )}
        extra={extra}
      />
    </div>
  );
}

function WorkTitleSubtitlePersonalization({
  work,
  onChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white/80 p-3.5 sm:p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Titre & sous-titre
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Personnalise le titre et le sous-titre de la section pour ce design.
        </p>
      </div>

      <WorkOptionGrid
        label="Title preset"
        options={PORTFOLIO_WORK_TITLE_PRESET_OPTIONS}
        value={work.titlePreset}
        onChange={(titlePreset) => onChange({ titlePreset })}
        columns={2}
      />
      {work.titlePreset === 'custom' ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
          <input
            type="text"
            value={work.titleCustom || work.title}
            onChange={(event) =>
              onChange({ titleCustom: event.target.value, title: event.target.value })
            }
            placeholder="PORTFOLIO"
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
          />
        </div>
      ) : null}

      <WorkOptionGrid
        label="Subtitle preset"
        options={PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS}
        value={work.subtitlePreset}
        onChange={(subtitlePreset) => onChange({ subtitlePreset })}
        columns={2}
      />
      {work.subtitlePreset === 'custom' || work.subtitlePreset === 'default' ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            {work.subtitlePreset === 'custom' ? 'Custom subtitle' : 'Subtitle text'}
          </p>
          <textarea
            rows={3}
            value={
              work.subtitlePreset === 'custom' ? work.subtitleCustom || work.subtitle : work.subtitle
            }
            onChange={(event) =>
              onChange(
                work.subtitlePreset === 'custom'
                  ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                  : { subtitle: event.target.value }
              )
            }
            placeholder="Selected projects."
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
          />
        </div>
      ) : null}
    </div>
  );
}

export function WorkSettingsPanel({
  work,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  work: PortfolioWorkSectionSettings;
  onChange: (patch: Partial<PortfolioWorkSectionSettings>) => void;
  subSection?: WorkSettingsSubSection;
  onSubSectionChange?: (value: WorkSettingsSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<WorkSettingsSubSection>('header');
  const subSection = normalizeWorkSettingsSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: WorkSettingsSubSection) => {
    const next = normalizeWorkSettingsSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta =
    WORK_SETTINGS_SUB_SECTIONS.find((section) => section.id === subSection) ?? WORK_SETTINGS_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Portfolio subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <label className="min-w-[12rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Portfolio settings subsection</span>
          <select
            value={subSection}
            onChange={(event) => setSubSection(event.target.value as WorkSettingsSubSection)}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900"
          >
            {WORK_SETTINGS_SUB_SECTIONS.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-4">
          <WorkToggleRow
            label="Show section"
            description="Display the portfolio block on your public portfolio."
            checked={work.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <WorkToggleRow
            label="Show marketplace link"
            description='“View all projects” link under the section header.'
            checked={work.showMarketplaceLink}
            onChange={(showMarketplaceLink) => onChange({ showMarketplaceLink })}
          />
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, Portfolio colors follow the semantic palette (Principal, Fond, Bordure…). Turn off to set each color manually in the other tabs."
          />
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Project content is edited in Creator Studio → Information. These settings control visibility and
            presentation on the portfolio page.
          </p>
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, title and subtitle colors follow palette tokens. Turn off to pick them freely below."
          />

          <WorkOptionGrid
            label="Disposition titre / contenu"
            options={PORTFOLIO_WORK_SECTION_LAYOUT_OPTIONS}
            value={work.sectionLayout ?? 'stacked'}
            onChange={(sectionLayout) => onChange({ sectionLayout })}
            columns={1}
          />
          {workSectionLayoutIsAside(work.sectionLayout) ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              En côte à côte, le titre et la galerie s’affichent en deux colonnes sur grand écran
              (empilés sur mobile).
            </p>
          ) : null}

          <WorkOptionGrid
            label="Title preset"
            options={PORTFOLIO_WORK_TITLE_PRESET_OPTIONS}
            value={work.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {work.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={work.titleCustom || work.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                placeholder="PORTFOLIO"
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}

          <WorkOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_WORK_SUBTITLE_PRESET_OPTIONS}
            value={work.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {work.subtitlePreset === 'custom' || work.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                {work.subtitlePreset === 'custom' ? 'Custom subtitle' : 'Subtitle text'}
              </p>
              <textarea
                rows={3}
                value={work.subtitlePreset === 'custom' ? work.subtitleCustom || work.subtitle : work.subtitle}
                onChange={(event) =>
                  onChange(
                    work.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                placeholder="Selected projects."
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <WorkColorField
              work={work}
              onChange={onChange}
              slot="title"
              label="Title color"
              value={work.titleColor}
            />
            <WorkColorField
              work={work}
              onChange={onChange}
              slot="subtitle"
              label="Subtitle color"
              value={work.subtitleColor}
            />
          </div>

          {workSectionLayoutIsAside(work.sectionLayout) ? (
            <p className="text-sm text-neutral-500">
              Alignement horizontal masqué : le titre est déjà placé{' '}
              {work.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} de la galerie.
            </p>
          ) : (
            <WorkOptionGrid
              label="Header alignment"
              options={[
                { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
                { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
              ]}
              value={work.headerAlignment}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
              columns={2}
            />
          )}

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Illustration décorative</p>
              <p className="mt-1 text-sm text-neutral-500">
                SVG décoratif à côté de la galerie. Choisissez un style, puis placez-le à gauche ou
                à droite sur grand écran.
              </p>
            </div>
            <WorkOptionGrid
              label="Style SVG"
              options={PORTFOLIO_WORK_ILLUSTRATION_OPTIONS}
              value={work.illustrationVariant ?? 'none'}
              onChange={(illustrationVariant) => onChange({ illustrationVariant })}
              columns={2}
            />
            {(work.illustrationVariant ?? 'none') !== 'none' ? (
              <WorkOptionGrid
                label="Placement du SVG"
                options={PORTFOLIO_WORK_ILLUSTRATION_PLACEMENT_OPTIONS}
                value={work.illustrationPlacement ?? 'right'}
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
                columns={2}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {subSection === 'design' ? (
        <div className="space-y-6">
          <WorkOptionGrid
            label="Section design"
            options={PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS}
            value={work.sectionDesign ?? 'classic'}
            onChange={(sectionDesign) => onChange(workSectionDesignSettingsPatch(sectionDesign))}
            columns={1}
          />

          {(work.sectionDesign ?? 'classic') === 'projects-board' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Projects board options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  These toggles apply only to this design. Thumbnails and links come from Information →
                  Portfolio.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkToggleRow
                label="Show thumbnails"
                description="Image above each card (upload in Information → Portfolio)."
                checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showThumbnail}
                onChange={(showThumbnail) =>
                  onChange({
                    projectsBoard: {
                      ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                      showThumbnail,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show role"
                description="Role label on the left (accent color)."
                checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showRole}
                onChange={(showRole) =>
                  onChange({
                    projectsBoard: {
                      ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show category"
                description="Category on the same row as the role, aligned to the right."
                checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showCategory}
                onChange={(showCategory) =>
                  onChange({
                    projectsBoard: {
                      ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                      showCategory,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Consult on thumbnail hover"
                description="Centered “Consult” button on the image when hovering — uses the project link."
                checked={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showConsultOnHover}
                onChange={(showConsultOnHover) =>
                  onChange({
                    projectsBoard: {
                      ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                      showConsultOnHover,
                    },
                  })
                }
              />

              {(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).showConsultOnHover ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult button label
                  </p>
                  <input
                    type="text"
                    value={(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS).consultLabel}
                    onChange={(event) =>
                      onChange({
                        projectsBoard: {
                          ...(work.projectsBoard ?? DEFAULT_PROJECTS_BOARD_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                    placeholder="Consult"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-accordion' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Accordion options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Titles open one at a time; the preview column shows a large thumbnail and stacks.
                  Content comes from Information → Portfolio.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Title / subtitle alignment"
                options={PORTFOLIO_WORK_ACCORDION_ALIGN_OPTIONS}
                value={(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).headerAlign}
                onChange={(headerAlign) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      headerAlign,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Preview placement"
                options={PORTFOLIO_WORK_ACCORDION_PREVIEW_SIDE_OPTIONS}
                value={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).previewSide ??
                  'right'
                }
                onChange={(previewSide) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      previewSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show tools under preview"
                description="Stack chips below the large thumbnail."
                checked={(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showTools}
                onChange={(showTools) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      showTools,
                    },
                  })
                }
              />

              {(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showTools ? (
                <>
                  <WorkToggleRow
                    label="Show tools label"
                    description="Heading and short rule above the stack chips. Off by default."
                    checked={
                      (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                        .showToolsLabel === true
                    }
                    onChange={(showToolsLabel) =>
                      onChange({
                        projectsAccordion: {
                          ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                          showToolsLabel,
                        },
                      })
                    }
                  />

                  {(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                    .showToolsLabel === true ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Tools label
                      </p>
                      <input
                        type="text"
                        value={
                          (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).toolsLabel
                        }
                        onChange={(event) =>
                          onChange({
                            projectsAccordion: {
                              ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                              toolsLabel: event.target.value,
                            },
                          })
                        }
                        placeholder="Tools I use"
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
              <WorkToggleRow
                label="Show description in panel"
                description="Project description inside the open accordion item."
                checked={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showDescription
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show role"
                description="Role under the description, left side."
                checked={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                    .showRoleInPanel !== false
                }
                onChange={(showRoleInPanel) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      showRoleInPanel,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show category"
                description="Category under the description, right side."
                checked={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS)
                    .showCategoryInPanel !== false
                }
                onChange={(showCategoryInPanel) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      showCategoryInPanel,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show Consult link"
                description="Text link with arrow under the preview image (not a hover overlay) — uses the project link."
                checked={
                  (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showConsult !==
                  false
                }
                onChange={(showConsult) =>
                  onChange({
                    projectsAccordion: {
                      ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).showConsult !==
              false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult button label
                  </p>
                  <input
                    type="text"
                    value={
                      (work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS).consultLabel
                    }
                    onChange={(event) =>
                      onChange({
                        projectsAccordion: {
                          ...(work.projectsAccordion ?? DEFAULT_PROJECTS_ACCORDION_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                    placeholder="Consult"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-frames' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Frames options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Horizontal cards — image + info. Stack shows as plain text with hairline
                  separators (not tags). Content from Information → Portfolio.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Thumbnail size"
                options={PORTFOLIO_WORK_FRAMES_THUMBNAIL_SIZE_OPTIONS}
                value={
                  (work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).thumbnailSize ?? 'xl'
                }
                onChange={(thumbnailSize) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      thumbnailSize,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Image placement"
                options={PORTFOLIO_WORK_FRAMES_IMAGE_SIDE_OPTIONS}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).imageSide ?? 'left'}
                onChange={(imageSide) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      imageSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Corner radius"
                options={PORTFOLIO_WORK_FRAMES_RADIUS_OPTIONS}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).radius ?? 'xl'}
                onChange={(radius) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      radius,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Espacement vertical"
                options={PORTFOLIO_WORK_FRAMES_CARD_GAP_OPTIONS}
                value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).cardGap ?? 'tight'}
                onChange={(cardGap) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      cardGap,
                    },
                  })
                }
                columns={3}
              />

              <WorkToggleRow
                label="Image padding"
                description="Off = thumbnail flush to the card edge. On = small gap inside the frame."
                checked={
                  (work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).imagePadding !== false
                }
                onChange={(imagePadding) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      imagePadding,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Alternate image sides"
                description="Odd cards use the placement above; even cards flip image left ↔ right."
                checked={
                  (work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).alternateSides === true
                }
                onChange={(alternateSides) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      alternateSides,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show role"
                description="Role above the title (accent color)."
                checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showRole}
                onChange={(showRole) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show category"
                description="Category on the same row as the role, right-aligned."
                checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showCategory}
                onChange={(showCategory) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      showCategory,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Project description in the info column."
                checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showDescription}
                onChange={(showDescription) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show stack"
                description="Tools as plain text with thin separators at the bottom — not pill tags."
                checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showStack}
                onChange={(showStack) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show Consult link"
                description="Text link under the stack — uses the project link."
                checked={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showConsult}
                onChange={(showConsult) =>
                  onChange({
                    projectsFrames: {
                      ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).showConsult ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult button label
                  </p>
                  <input
                    type="text"
                    value={(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS).consultLabel}
                    onChange={(event) =>
                      onChange({
                        projectsFrames: {
                          ...(work.projectsFrames ?? DEFAULT_PROJECTS_FRAMES_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                    placeholder="Consult"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-index' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Index options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Numbered rows with thin separators — narrow index, wide title + stack, description
                  on the right. Content from Information → Portfolio.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Espacement des lignes"
                options={PORTFOLIO_WORK_INDEX_ROW_GAP_OPTIONS}
                value={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).rowGap ?? 'md'}
                onChange={(rowGap) =>
                  onChange({
                    projectsIndex: {
                      ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                      rowGap,
                    },
                  })
                }
                columns={3}
              />

              <WorkToggleRow
                label="Show index marker"
                description="Number or bullet in the narrow left column."
                checked={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showNumber !== false}
                onChange={(showNumber) =>
                  onChange({
                    projectsIndex: {
                      ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                      showNumber,
                    },
                  })
                }
              />

              {(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showNumber !== false ? (
                <WorkOptionGrid
                  label="Index marker style"
                  options={PORTFOLIO_WORK_INDEX_MARKER_OPTIONS}
                  value={
                    (work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).indexMarker ?? 'number'
                  }
                  onChange={(indexMarker) =>
                    onChange({
                      projectsIndex: {
                        ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                        indexMarker,
                      },
                    })
                  }
                  columns={2}
                />
              ) : null}

              <WorkToggleRow
                label="Show stack"
                description="Stack chips directly under the title."
                checked={(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showStack !== false}
                onChange={(showStack) =>
                  onChange({
                    projectsIndex: {
                      ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Description in the right column."
                checked={
                  (work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS).showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsIndex: {
                      ...(work.projectsIndex ?? DEFAULT_PROJECTS_INDEX_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-grid' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Grid options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Thumbnail, title, and description only. Content from Information → Portfolio.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Columns on large screens"
                options={PORTFOLIO_WORK_GRID_COLUMNS_OPTIONS}
                value={
                  (work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).columnsPerRow ?? 2
                }
                onChange={(columnsPerRow) =>
                  onChange({
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      columnsPerRow,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Card border"
                options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
                value={(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).cardBorder ?? 'none'}
                onChange={(cardBorder) =>
                  onChange({
                    cardBorder,
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      cardBorder,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Arrondi"
                options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                value={(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).cardRadius ?? 'none'}
                onChange={(cardRadius) =>
                  onChange({
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      cardRadius,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Carousel navigation"
                description="When more projects than fit in one row, slide one card at a time with arrow buttons."
                checked={
                  (work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).carouselEnabled === true
                }
                onChange={(carouselEnabled) =>
                  onChange({
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      carouselEnabled,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Short description under the title."
                checked={
                  (work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS).showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsGrid: {
                      ...(work.projectsGrid ?? DEFAULT_PROJECTS_GRID_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-split' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Split options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Large thumbnail beside the title. Choose sides and optional row alternation.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Image placement"
                options={PORTFOLIO_WORK_SPLIT_IMAGE_SIDE_OPTIONS}
                value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).imageSide ?? 'left'}
                onChange={(imageSide) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      imageSide,
                      ...(imageSide === 'center'
                        ? {
                            alternateSides: false,
                            titleSide: 'left',
                            titleVerticalAlign: 'top',
                            descriptionPlacement: 'with-title',
                          }
                        : {}),
                    },
                  })
                }
                columns={3}
              />

              {(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).imageSide === 'center' ? (
                <>
                  <WorkOptionGrid
                    label="Title placement"
                    options={PORTFOLIO_WORK_SPLIT_TITLE_SIDE_OPTIONS}
                    value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).titleSide ?? 'left'}
                    onChange={(titleSide) =>
                      onChange({
                        projectsSplit: {
                          ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                          titleSide,
                        },
                      })
                    }
                    columns={2}
                  />
                  <WorkOptionGrid
                    label="Title vertical"
                    options={PORTFOLIO_WORK_SPLIT_TITLE_VERTICAL_OPTIONS}
                    value={
                      (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).titleVerticalAlign ??
                      'top'
                    }
                    onChange={(titleVerticalAlign) =>
                      onChange({
                        projectsSplit: {
                          ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                          titleVerticalAlign,
                        },
                      })
                    }
                    columns={2}
                  />
                  <WorkOptionGrid
                    label="Description placement"
                    options={PORTFOLIO_WORK_SPLIT_DESCRIPTION_PLACEMENT_OPTIONS}
                    value={
                      (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).descriptionPlacement ??
                      'with-title'
                    }
                    onChange={(descriptionPlacement) =>
                      onChange({
                        projectsSplit: {
                          ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                          descriptionPlacement,
                          ...(descriptionPlacement === 'opposite'
                            ? { showDescription: true }
                            : {}),
                        },
                      })
                    }
                    columns={2}
                  />
                  {(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).descriptionPlacement ===
                  'opposite' ? (
                    <WorkOptionGrid
                      label="Description vertical"
                      options={PORTFOLIO_WORK_SPLIT_DESCRIPTION_VERTICAL_OPTIONS}
                      value={
                        (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS)
                          .descriptionVerticalAlign ?? 'bottom'
                      }
                      onChange={(descriptionVerticalAlign) =>
                        onChange({
                          projectsSplit: {
                            ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                            descriptionVerticalAlign,
                          },
                        })
                      }
                      columns={2}
                    />
                  ) : null}
                </>
              ) : (
                <WorkToggleRow
                  label="Alternate image sides"
                  description="Odd rows use the placement above; even rows flip image ↔ title."
                  checked={
                    (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).alternateSides === true
                  }
                  onChange={(alternateSides) =>
                    onChange({
                      projectsSplit: {
                        ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                        alternateSides,
                      },
                    })
                  }
                />
              )}

              <WorkOptionGrid
                label="Thumbnail size"
                options={PORTFOLIO_WORK_SPLIT_THUMBNAIL_SIZE_OPTIONS}
                value={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).thumbnailSize ?? 'xl'
                }
                onChange={(thumbnailSize) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      thumbnailSize,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Thumbnail radius"
                options={PORTFOLIO_WORK_SPLIT_RADIUS_OPTIONS}
                value={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).thumbnailRadius ?? 'none'
                }
                onChange={(thumbnailRadius) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      thumbnailRadius,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Row spacing"
                options={PORTFOLIO_WORK_SPLIT_ROW_GAP_OPTIONS}
                value={(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).rowGap ?? 'md'}
                onChange={(rowGap) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      rowGap,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show description"
                description="Optional short text under the title."
                checked={
                  (work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS).showDescription === true
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsSplit: {
                      ...(work.projectsSplit ?? DEFAULT_PROJECTS_SPLIT_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-carousel' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Carousel options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Image-only horizontal carousel. Configure slide size, ratio, radius, and spacing.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Image size"
                options={PORTFOLIO_WORK_CAROUSEL_IMAGE_SIZE_OPTIONS}
                value={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).imageSize ?? 'lg'
                }
                onChange={(imageSize) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      imageSize,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Aspect ratio"
                options={PORTFOLIO_WORK_CAROUSEL_ASPECT_OPTIONS}
                value={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).aspectRatio ??
                  'square'
                }
                onChange={(aspectRatio) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      aspectRatio,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Image radius"
                options={PORTFOLIO_WORK_CAROUSEL_RADIUS_OPTIONS}
                value={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).imageRadius ?? 'none'
                }
                onChange={(imageRadius) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      imageRadius,
                    },
                  })
                }
                columns={3}
              />

              <WorkOptionGrid
                label="Gap between images"
                options={PORTFOLIO_WORK_CAROUSEL_GAP_OPTIONS}
                value={(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).gap ?? 'md'}
                onChange={(gap) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      gap,
                    },
                  })
                }
                columns={3}
              />

              <WorkToggleRow
                label="Hover reveal"
                description="Au survol : zoom léger, assombrit l’image et affiche titre + description au centre."
                checked={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).hoverReveal !== false
                }
                onChange={(hoverReveal) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      hoverReveal,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Focus blur"
                description="Au survol d’une image, floute légèrement les autres pour un mode focus."
                checked={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS)
                    .focusBlurSiblings !== false
                }
                onChange={(focusBlurSiblings) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      focusBlurSiblings,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Hover stack"
                description="Au survol : affiche le stack sous l’image, dans un cadre sans bordure."
                checked={
                  (work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS).hoverStack !== false
                }
                onChange={(hoverStack) =>
                  onChange({
                    projectsCarousel: {
                      ...(work.projectsCarousel ?? DEFAULT_PROJECTS_CAROUSEL_SETTINGS),
                      hoverStack,
                    },
                  })
                }
              />
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-spotlight' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Spotlight options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Cadre fin — détails à gauche, sélecteur de titres à droite. Palette Work
                  respectée.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Disposition"
                options={PORTFOLIO_WORK_SPOTLIGHT_LIST_SIDE_OPTIONS}
                value={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).listSide ?? 'right'
                }
                onChange={(listSide) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      listSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show role"
                description="Affiche le rôle au-dessus du titre du projet."
                checked={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showRole !== false
                }
                onChange={(showRole) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Affiche la description du projet sélectionné."
                checked={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS)
                    .showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show Consult"
                description="Bouton Consult (lien du projet)."
                checked={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showConsult !==
                  false
                }
                onChange={(showConsult) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showConsult !==
              false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).consultLabel ||
                      'Consult'
                    }
                    onChange={(event) =>
                      onChange({
                        projectsSpotlight: {
                          ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}

              <WorkToggleRow
                label="Show stack"
                description="Affiche le stack du projet sélectionné."
                checked={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showStack !== false
                }
                onChange={(showStack) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              {(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showStack !==
              false ? (
                <WorkOptionGrid
                  label="Stack style"
                  options={PORTFOLIO_WORK_SPOTLIGHT_STACK_STYLE_OPTIONS}
                  value={
                    (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).stackStyle ??
                    'tags'
                  }
                  onChange={(stackStyle) =>
                    onChange({
                      projectsSpotlight: {
                        ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                        stackStyle,
                      },
                    })
                  }
                  columns={3}
                />
              ) : null}

              <WorkToggleRow
                label="Frame fill"
                description="Fond et padding intérieur du cadre. Désactive pour un layout à plat."
                checked={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).showFrameFill !==
                  false
                }
                onChange={(showFrameFill) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      showFrameFill,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Frame radius"
                options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                value={
                  (work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS).frameRadius ?? 'xl'
                }
                onChange={(frameRadius) =>
                  onChange({
                    projectsSpotlight: {
                      ...(work.projectsSpotlight ?? DEFAULT_PROJECTS_SPOTLIGHT_SETTINGS),
                      frameRadius,
                    },
                  })
                }
                columns={3}
              />
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-showcase' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Showcase options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Large media + details. Chevrons and three thumbnails switch the active project.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Media placement"
                options={PORTFOLIO_WORK_SHOWCASE_MEDIA_SIDE_OPTIONS}
                value={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).mediaSide ?? 'left'
                }
                onChange={(mediaSide) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      mediaSide,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Media radius"
                options={PORTFOLIO_WORK_SHOWCASE_RADIUS_OPTIONS}
                value={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).mediaRadius ?? 'xl'
                }
                onChange={(mediaRadius) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      mediaRadius,
                    },
                  })
                }
                columns={3}
              />

              <WorkToggleRow
                label="Show role on media"
                description="Compact role label overlaid on the primary image."
                checked={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showRole !== false
                }
                onChange={(showRole) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Project description under the title."
                checked={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showDescription !==
                  false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show category"
                description="Category label + value under the description."
                checked={
                  (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showCategory !==
                  false
                }
                onChange={(showCategory) =>
                  onChange({
                    projectsShowcase: {
                      ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                      showCategory,
                    },
                  })
                }
              />

              {(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).showCategory !==
              false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Category label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS).categoryLabel ||
                      'Category'
                    }
                    onChange={(event) =>
                      onChange({
                        projectsShowcase: {
                          ...(work.projectsShowcase ?? DEFAULT_PROJECTS_SHOWCASE_SETTINGS),
                          categoryLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-editorial' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Editorial options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Grand numéro + rôle + titre à gauche. À droite : infos sticky, ou miniature seule
                  (sans bordure / radius).
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Panneau droit"
                options={PORTFOLIO_WORK_EDITORIAL_RIGHT_PANEL_OPTIONS}
                value={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).rightPanel ??
                  'info'
                }
                onChange={(rightPanel) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      rightPanel,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show role"
                description="Rôle sous le numéro, avec un petit trait."
                checked={
                  (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showRole !== false
                }
                onChange={(showRole) =>
                  onChange({
                    projectsEditorial: {
                      ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).rightPanel !==
              'thumbnail' ? (
                <>
                  <WorkToggleRow
                    label="Show description"
                    description="Bloc Description dans la colonne de droite."
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .showDescription !== false
                    }
                    onChange={(showDescription) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          showDescription,
                        },
                      })
                    }
                  />

                  <WorkToggleRow
                    label="Show stack"
                    description="Bloc Stack (outils du projet) à droite."
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showStack !==
                      false
                    }
                    onChange={(showStack) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          showStack,
                        },
                      })
                    }
                  />

                  <WorkToggleRow
                    label="Show Consult"
                    description="Bouton Consult (pill + flèche) sous les infos."
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showConsult !==
                      false
                    }
                    onChange={(showConsult) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          showConsult,
                        },
                      })
                    }
                  />

                  {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS).showConsult !==
                  false ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Consult label
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Phrase du lien (ex. « Consult this project ») + flèche ↗.
                      </p>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                        value={
                          (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                            .consultLabel || 'Consult this project'
                        }
                        placeholder="Consult this project"
                        onChange={(event) =>
                          onChange({
                            projectsEditorial: {
                              ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                              consultLabel: event.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <WorkToggleRow
                    label="Hover reveal"
                    description="Au survol : assombrit l’image du bas vers le haut et affiche description, stack et Consult."
                    checked={
                      (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .thumbnailHoverReveal !== false
                    }
                    onChange={(thumbnailHoverReveal) =>
                      onChange({
                        projectsEditorial: {
                          ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                          thumbnailHoverReveal,
                        },
                      })
                    }
                  />

                  {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                    .thumbnailHoverReveal !== false ? (
                    <>
                      <WorkToggleRow
                        label="Show description"
                        description="Description dans le hover de la miniature."
                        checked={
                          (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                            .showDescription !== false
                        }
                        onChange={(showDescription) =>
                          onChange({
                            projectsEditorial: {
                              ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                              showDescription,
                            },
                          })
                        }
                      />

                      <WorkToggleRow
                        label="Show stack"
                        description="Stack dans le hover de la miniature."
                        checked={
                          (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                            .showStack !== false
                        }
                        onChange={(showStack) =>
                          onChange({
                            projectsEditorial: {
                              ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                              showStack,
                            },
                          })
                        }
                      />

                      <WorkToggleRow
                        label="Show Consult"
                        description="Bouton Consult (pill) dans le hover."
                        checked={
                          (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                            .showConsult !== false
                        }
                        onChange={(showConsult) =>
                          onChange({
                            projectsEditorial: {
                              ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                              showConsult,
                            },
                          })
                        }
                      />

                      {(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                        .showConsult !== false ? (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Consult label
                          </p>
                          <input
                            type="text"
                            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                            value={
                              (work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS)
                                .consultLabel || 'Consult this project'
                            }
                            placeholder="Consult this project"
                            onChange={(event) =>
                              onChange({
                                projectsEditorial: {
                                  ...(work.projectsEditorial ?? DEFAULT_PROJECTS_EDITORIAL_SETTINGS),
                                  consultLabel: event.target.value,
                                },
                              })
                            }
                          />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                      Hover désactivé : la miniature s’affiche seule, sans overlay.
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-ledger' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Ledger options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Index typographique (style Framer) — titres, rôles et détails. Aucune miniature.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Reveal details"
                options={PORTFOLIO_WORK_LEDGER_EXPAND_OPTIONS}
                value={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).expandMode ?? 'hover'}
                onChange={(expandMode) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      expandMode,
                    },
                  })
                }
                columns={3}
              />

              <WorkToggleRow
                label="Show count"
                description="Compteur de projets à droite du titre de section."
                checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showCount !== false}
                onChange={(showCount) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      showCount,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show index"
                description="Numéros 01, 02… à gauche de chaque ligne."
                checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showIndex !== false}
                onChange={(showIndex) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      showIndex,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show role"
                description="Rôle / catégorie aligné à droite sur desktop."
                checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showRole !== false}
                onChange={(showRole) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Texte projet dans le panneau déplié."
                checked={
                  (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show stack"
                description="Outils en mono uppercase sous la description."
                checked={(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showStack !== false}
                onChange={(showStack) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show Consult"
                description="Lien texte + flèche ↗ sous les détails."
                checked={
                  (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showConsult !== false
                }
                onChange={(showConsult) =>
                  onChange({
                    projectsLedger: {
                      ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).showConsult !== false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS).consultLabel ||
                      'Consult this project'
                    }
                    placeholder="Consult this project"
                    onChange={(event) =>
                      onChange({
                        projectsLedger: {
                          ...(work.projectsLedger ?? DEFAULT_PROJECTS_LEDGER_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-folio' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Folio options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Dossier sticky à gauche, liste de titres à droite. Données seulement — aucune
                  miniature.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkToggleRow
                label="Show role"
                description="Micro-label de rôle au-dessus du trait d’accent dans le dossier."
                checked={(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showRole !== false}
                onChange={(showRole) =>
                  onChange({
                    projectsFolio: {
                      ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Description du projet dans le panneau dossier."
                checked={
                  (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsFolio: {
                      ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show stack"
                description="Bloc outils dans le dossier — 5 designs au choix."
                checked={(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showStack !== false}
                onChange={(showStack) =>
                  onChange({
                    projectsFolio: {
                      ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              {(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showStack !== false ? (
                <>
                  <WorkOptionGrid
                    label="Stack design"
                    options={PORTFOLIO_WORK_FOLIO_STACK_DESIGN_OPTIONS}
                    value={
                      (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).stackDesign ??
                      'tags-outline'
                    }
                    onChange={(stackDesign) =>
                      onChange({
                        projectsFolio: {
                          ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                          stackDesign,
                        },
                      })
                    }
                    columns={2}
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Stack label
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Titre du bloc (ex. « Core stack »).
                    </p>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                      value={
                        (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).stackLabel ||
                        'Core stack'
                      }
                      placeholder="Core stack"
                      onChange={(event) =>
                        onChange({
                          projectsFolio: {
                            ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                            stackLabel: event.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </>
              ) : null}

              <WorkToggleRow
                label="Show Consult"
                description="Lien texte + flèche ↗ sous le dossier."
                checked={(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showConsult !== false}
                onChange={(showConsult) =>
                  onChange({
                    projectsFolio: {
                      ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).showConsult !== false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Consult label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS).consultLabel ||
                      'Consult this project'
                    }
                    placeholder="Consult this project"
                    onChange={(event) =>
                      onChange({
                        projectsFolio: {
                          ...(work.projectsFolio ?? DEFAULT_PROJECTS_FOLIO_SETTINGS),
                          consultLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-spec' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Spec options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Fiche technique / datasheet — titre + grille label/valeur. Données seulement, sans
                  miniature.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Colonnes (écran large)"
                options={PORTFOLIO_WORK_SPEC_COLUMNS_OPTIONS}
                value={
                  (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showThumbnail === true
                    ? '1'
                    : (String(
                        (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).columnsPerRow ?? 1
                      ) as '1' | '2')
                }
                onChange={(value) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      columnsPerRow: value === '2' ? 2 : 1,
                      // 2-up and outside-left thumbnail are mutually exclusive
                      ...(value === '2' ? { showThumbnail: false } : {}),
                    },
                  })
                }
                columns={2}
              />

              {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showThumbnail === true ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Miniature activée : affichage forcé en <span className="font-semibold text-neutral-700">1 par ligne</span>,
                  image à l’extérieur à gauche.
                </p>
              ) : null}

              <WorkOptionGrid
                label="Encadrement"
                options={PORTFOLIO_WORK_SPEC_FRAME_OPTIONS}
                value={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).sheetFrame ?? 'none'}
                onChange={(sheetFrame) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      sheetFrame,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Espacement entre projets"
                options={PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS}
                value={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).sheetGap ?? 'xl'}
                onChange={(sheetGap) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      sheetGap,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show thumbnail"
                description="Miniature à l’extérieur à gauche — désactive auto « 2 par ligne »."
                checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showThumbnail === true}
                onChange={(showThumbnail) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showThumbnail,
                      ...(showThumbnail ? { columnsPerRow: 1 as const } : {}),
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show category"
                description="Catégorie à gauche — couleur principale (CTA)."
                checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showCategory !== false}
                onChange={(showCategory) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showCategory,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show role"
                description="Rôle à droite du micro-header."
                checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showRole !== false}
                onChange={(showRole) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show field labels"
                description="Affiche ou masque les 3 labels Summary / Stack / Link."
                checked={
                  (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showFieldLabels !== false
                }
                onChange={(showFieldLabels) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showFieldLabels,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Ligne Summary dans la grille définition."
                checked={
                  (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showDescription !== false &&
              (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showFieldLabels !== false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Description label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).descriptionLabel ||
                      'Summary'
                    }
                    placeholder="Summary"
                    onChange={(event) =>
                      onChange({
                        projectsSpec: {
                          ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                          descriptionLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}

              <WorkToggleRow
                label="Show stack"
                description="Outils en tags (comme Projects board)."
                checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showStack !== false}
                onChange={(showStack) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showStack !== false &&
              (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showFieldLabels !== false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Stack label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).stackLabel || 'Stack'}
                    placeholder="Stack"
                    onChange={(event) =>
                      onChange({
                        projectsSpec: {
                          ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                          stackLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}

              <WorkToggleRow
                label="Show Consult"
                description="CTA vers le projet — plusieurs designs au choix."
                checked={(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showConsult !== false}
                onChange={(showConsult) =>
                  onChange({
                    projectsSpec: {
                      ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).showConsult !== false ? (
                <>
                  <WorkOptionGrid
                    label="Consult design"
                    options={PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS}
                    value={
                      (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).consultDesign ??
                      'bracket'
                    }
                    onChange={(consultDesign) =>
                      onChange({
                        projectsSpec: {
                          ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                          consultDesign,
                        },
                      })
                    }
                    columns={2}
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Consult label
                    </p>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                      value={
                        (work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS).consultLabel ||
                        'Consult this project'
                      }
                      placeholder="Consult this project"
                      onChange={(event) =>
                        onChange({
                          projectsSpec: {
                            ...(work.projectsSpec ?? DEFAULT_PROJECTS_SPEC_SETTINGS),
                            consultLabel: event.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : (work.sectionDesign ?? 'classic') === 'projects-case' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Case options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Grande miniature 50/50 à gauche + fiche Spec à droite. Réglage « Hauteur miniature »
                  juste sous Show thumbnail.
                </p>
              </div>

              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />

              <WorkOptionGrid
                label="Espacement entre projets"
                options={PORTFOLIO_WORK_SPEC_SHEET_GAP_OPTIONS}
                value={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).sheetGap ?? 'xl'}
                onChange={(sheetGap) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      sheetGap,
                    },
                  })
                }
                columns={2}
              />

              <WorkOptionGrid
                label="Encadrement"
                options={PORTFOLIO_WORK_SPEC_FRAME_OPTIONS}
                value={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).sheetFrame ?? 'thin'}
                onChange={(sheetFrame) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      sheetFrame,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show thumbnail"
                description="Grande miniature à gauche (~50%). Désactivé = contenu pleine largeur."
                checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showThumbnail !== false}
                onChange={(showThumbnail) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showThumbnail,
                    },
                  })
                }
              />

              <WorkOptionGrid
                label="Hauteur miniature"
                options={PORTFOLIO_WORK_CASE_THUMBNAIL_HEIGHT_OPTIONS}
                value={
                    (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).thumbnailHeight ?? 'xl'
                  }
                onChange={(thumbnailHeight) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      thumbnailHeight,
                      // Ensure thumbnail is on when picking a height
                      showThumbnail: true,
                    },
                  })
                }
                columns={2}
              />

              <WorkToggleRow
                label="Show category"
                description="Catégorie à gauche — couleur principale (CTA)."
                checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showCategory !== false}
                onChange={(showCategory) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showCategory,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show role"
                description="Rôle à droite du micro-header."
                checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showRole !== false}
                onChange={(showRole) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showRole,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show field labels"
                description="Affiche ou masque les 3 labels Summary / Stack / Link."
                checked={
                  (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !== false
                }
                onChange={(showFieldLabels) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showFieldLabels,
                    },
                  })
                }
              />

              <WorkToggleRow
                label="Show description"
                description="Ligne Summary dans la grille définition."
                checked={
                  (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showDescription !== false
                }
                onChange={(showDescription) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showDescription,
                    },
                  })
                }
              />

              {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showDescription !== false &&
              (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !== false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Description label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={
                      (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).descriptionLabel ||
                      'Summary'
                    }
                    placeholder="Summary"
                    onChange={(event) =>
                      onChange({
                        projectsCase: {
                          ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                          descriptionLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}

              <WorkToggleRow
                label="Show stack"
                description="Outils en tags (comme Projects board)."
                checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showStack !== false}
                onChange={(showStack) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showStack,
                    },
                  })
                }
              />

              {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showStack !== false &&
              (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !== false ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Stack label
                  </p>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                    value={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).stackLabel || 'Stack'}
                    placeholder="Stack"
                    onChange={(event) =>
                      onChange({
                        projectsCase: {
                          ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                          stackLabel: event.target.value,
                        },
                      })
                    }
                  />
                </div>
              ) : null}

              <WorkToggleRow
                label="Show Consult"
                description="CTA vers le projet — plusieurs designs au choix."
                checked={(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showConsult !== false}
                onChange={(showConsult) =>
                  onChange({
                    projectsCase: {
                      ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                      showConsult,
                    },
                  })
                }
              />

              {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showConsult !== false ? (
                <>
                  <WorkOptionGrid
                    label="Consult design"
                    options={PORTFOLIO_WORK_SPEC_CONSULT_DESIGN_OPTIONS}
                    value={
                      (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).consultDesign ??
                      'bracket'
                    }
                    onChange={(consultDesign) =>
                      onChange({
                        projectsCase: {
                          ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                          consultDesign,
                        },
                      })
                    }
                    columns={2}
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Consult label
                    </p>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                      value={
                        (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).consultLabel ||
                        'Consult this project'
                      }
                      placeholder="Consult this project"
                      onChange={(event) =>
                        onChange({
                          projectsCase: {
                            ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                            consultLabel: event.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  {(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).showFieldLabels !==
                  false ? (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Link label
                      </p>
                      <input
                        type="text"
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
                        value={
                          (work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS).linkLabel || 'Link'
                        }
                        placeholder="Link"
                        onChange={(event) =>
                          onChange({
                            projectsCase: {
                              ...(work.projectsCase ?? DEFAULT_PROJECTS_CASE_SETTINGS),
                              linkLabel: event.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4 sm:p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Classic options
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Layout details live under Cards / Media / Categories. Personnalise ici le titre et
                  le sous-titre de la section.
                </p>
              </div>
              <WorkTitleSubtitlePersonalization work={work} onChange={onChange} />
            </div>
          )}
        </div>
      ) : null}

      {subSection === 'categories' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, category chip colors follow palette tokens. Turn off to pick them freely below."
          />

          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
            Categories come from each content’s <span className="font-semibold text-neutral-700">Category</span>{' '}
            field (set when you publish). Projects without one appear under “Other”.
          </p>
          <WorkOptionGrid
            label="Category mode"
            options={PORTFOLIO_WORK_CATEGORY_MODE_OPTIONS}
            value={work.categoryMode}
            onChange={(categoryMode) => onChange({ categoryMode })}
            columns={2}
          />
          {work.categoryMode !== 'off' ? (
            <>
              <WorkOptionGrid
                label="Filter design"
                options={PORTFOLIO_WORK_CATEGORY_DESIGN_OPTIONS}
                value={work.categoryDesign}
                onChange={(categoryDesign) => onChange({ categoryDesign })}
                columns={2}
              />
              <WorkToggleRow
                label="Show category on cards"
                description="Display the category name above each project title."
                checked={work.showCategoryOnCard}
                onChange={(showCategoryOnCard) => onChange({ showCategoryOnCard })}
              />
              {work.showCategoryOnCard ? (
                <>
                  <WorkOverlayElementPlacementControls
                    work={work}
                    elementId="category"
                    onChange={onChange}
                  />
                  <WorkElementChromeControls
                    work={work}
                    chromeId="categoryOnCard"
                    onChange={onChange}
                    title="Fond de la catégorie"
                    description="Fond derrière le label TECH / catégorie sur la carte."
                  />
                  <WorkInlineTypography
                    work={work}
                    target="categoryOnCard"
                    onChange={onChange}
                    title="Category on card typography"
                  />
                </>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    “All” label
                  </p>
                  <input
                    type="text"
                    value={work.categoryAllLabel}
                    onChange={(event) => onChange({ categoryAllLabel: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Uncategorized label
                  </p>
                  <input
                    type="text"
                    value={work.categoryUncategorizedLabel}
                    onChange={(event) => onChange({ categoryUncategorizedLabel: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="categoryActive"
                  label="Active category"
                  value={work.categoryActiveColor}
                />
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="categoryMuted"
                  label="Muted category"
                  value={work.categoryMutedColor}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'cards' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, card border and background colors follow palette tokens. Turn off to pick them freely below."
          />

          <WorkOptionGrid
            label="Disposition de la galerie"
            options={PORTFOLIO_WORK_GALLERY_LAYOUT_OPTIONS}
            value={work.galleryLayout}
            onChange={(galleryLayout) => onChange(workGalleryLayoutSettingsPatch(galleryLayout))}
            columns={2}
          />

          {work.galleryLayout === 'overlay' ? (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">Assombrissement du média</p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Ajuste le voile sombre derrière les textes de la carte immersive.
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-neutral-700">
                    {work.overlayMediaDarkness ?? 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={1}
                  value={work.overlayMediaDarkness ?? 100}
                  onChange={(event) =>
                    onChange({ overlayMediaDarkness: Number(event.target.value) })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Intensité d’assombrissement du média"
                />
              </div>
              <div className="h-px bg-neutral-200/80" />
              <div>
                <p className="text-sm font-semibold text-neutral-950">Trait inférieur</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Ajoute un séparateur fin sous chaque carte Overlay immersif.
                </p>
              </div>
              <WorkToggleRow
                label="Afficher le trait inférieur"
                description="Le trait suit par défaut le token Bordure de la palette Portfolio."
                checked={work.overlayBottomRuleEnabled === true}
                onChange={(overlayBottomRuleEnabled) => onChange({ overlayBottomRuleEnabled })}
              />
              {work.overlayBottomRuleEnabled ? (
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="overlayBottomRule"
                  label="Couleur du trait"
                  description="Choisissez un token de palette ou une couleur hexadécimale personnalisée."
                  value={work.overlayBottomRuleColor}
                  allowManualHex
                />
              ) : null}
            </div>
          ) : null}

          {workGallerySupportsItemsPerRow(work.galleryLayout) ? (
            <div className="space-y-3">
              <WorkOptionGrid
                label="Cadres par ligne"
                options={PORTFOLIO_WORK_ITEMS_PER_ROW_OPTIONS}
                value={String(
                  work.itemsPerRow === 2 || work.itemsPerRow === 3 || work.itemsPerRow === 4
                    ? work.itemsPerRow
                    : 1
                ) as '1' | '2' | '3' | '4'}
                onChange={(value) =>
                  onChange({ itemsPerRow: Number(value) as PortfolioWorkItemsPerRow })
                }
                columns={2}
              />
              {(() => {
                const perRow = (
                  work.itemsPerRow === 2 || work.itemsPerRow === 3 || work.itemsPerRow === 4
                    ? work.itemsPerRow
                    : 1
                ) as PortfolioWorkItemsPerRow;
                const hint = workItemsPerRowResponsiveHint(perRow);
                if (!hint) return null;
                return (
                  <p
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      perRow >= 3
                        ? 'border-amber-200 bg-amber-50 text-amber-900'
                        : 'border-dashed border-neutral-200 bg-white text-neutral-500'
                    }`}
                  >
                    {hint}
                  </p>
                );
              })()}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Le nombre de cadres par ligne s’applique à{' '}
              <span className="font-semibold text-neutral-700">Grille portfolio</span>,{' '}
              <span className="font-semibold text-neutral-700">Grille compacte</span> et{' '}
              <span className="font-semibold text-neutral-700">Overlay</span>. Liste, accordéon et
              carrousel restent sur une seule colonne.
            </p>
          )}

          <WorkOptionGrid
            label="Largeur de la carte"
            options={PORTFOLIO_WORK_CARD_MAX_WIDTH_OPTIONS}
            value={work.cardMaxWidth}
            onChange={(cardMaxWidth) => onChange({ cardMaxWidth })}
            columns={2}
          />
          {work.cardMaxWidth !== 'full' ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Largeur plafonnée — la carte garde une forme verticale (média + infos) au lieu de s’étirer
              sur toute la colonne. Combine avec{' '}
              <span className="font-semibold text-neutral-700">Cadres par ligne</span> pour la grille.
            </p>
          ) : null}

          <WorkOptionGrid
            label="Alignement de la carte"
            options={PORTFOLIO_WORK_CARD_ALIGNMENT_OPTIONS}
            value={work.cardAlignment}
            onChange={(cardAlignment) => onChange({ cardAlignment })}
            columns={3}
          />
          <p className="text-sm text-neutral-500">
            Positionne le <span className="font-semibold text-neutral-700">cadre</span> dans la colonne
            (quand la largeur est plafonnée). N’aligne pas le texte à l’intérieur.
            {work.categoryMode !== 'off'
              ? ' Les filtres catégories suivent aussi cet alignement.'
              : ''}
          </p>

          <WorkOptionGrid
            label="Alignement du contenu"
            options={PORTFOLIO_WORK_CARD_CONTENT_ALIGNMENT_OPTIONS}
            value={work.cardContentAlignment}
            onChange={(cardContentAlignment) => onChange({ cardContentAlignment })}
            columns={3}
          />
          <p className="text-sm text-neutral-500">
            Aligne uniquement les éléments <span className="font-semibold text-neutral-700">à l’intérieur</span> de
            la carte (titre, description, outils…). Le bouton CTA a son propre alignement dans la sous-section CTA.
          </p>

          <WorkOptionGrid
            label="Centrage vertical"
            options={PORTFOLIO_WORK_CARD_CONTENT_VERTICAL_ALIGN_OPTIONS}
            value={work.cardContentVerticalAlign}
            onChange={(cardContentVerticalAlign) => onChange({ cardContentVerticalAlign })}
            columns={3}
          />
          <p className="text-sm text-neutral-500">
            Place le bloc d’infos (catégorie → CTA) en haut, au centre ou en bas de la colonne — surtout utile
            quand le média est à gauche / à droite.
          </p>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre & espacement</p>
              <p className="mt-1 text-sm text-neutral-500">
                Bordure, ombre flottante, coins arrondis, fond, marge intérieure et espace entre les
                projets — s’applique à toutes les dispositions de galerie, indépendamment du card design.
              </p>
            </div>

            <WorkOptionGrid
              label="Bordure"
              options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
              value={work.cardBorder}
              onChange={(cardBorder) => onChange({ cardBorder })}
              columns={2}
            />

            {work.cardBorder === 'soft' || work.cardBorder === 'solid' ? (
              <WorkColorField
                work={work}
                onChange={onChange}
                slot="cardBorder"
                label="Couleur de bordure"
                value={work.cardBorderColor}
              />
            ) : null}

            <WorkOptionGrid
              label="Ombre / flotte"
              options={PORTFOLIO_WORK_CARD_SHADOW_OPTIONS}
              value={work.cardShadow ?? 'float'}
              onChange={(cardShadow) =>
                onChange({
                  cardShadow,
                  cardShadowIntensity: PORTFOLIO_WORK_CARD_SHADOW_PRESET_INTENSITY[cardShadow],
                })
              }
              columns={2}
            />
            {(work.cardShadow ?? 'float') !== 'none' ? (
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Intensité de l’ombre
                  </p>
                  <span className="text-sm font-semibold text-neutral-700">
                    {work.cardShadowIntensity ?? 55}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={work.cardShadowIntensity ?? 55}
                  onChange={(event) =>
                    onChange({ cardShadowIntensity: Number(event.target.value) })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Intensité de l’ombre flottante"
                />
                <p className="mt-2 text-sm text-neutral-500">
                  Règle librement la légèreté du halo. En mode sombre, l’effet devient un
                  halo clair (une ombre noire disparaîtrait sur fond noir).
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Halo flou autour de la carte pour la détacher du fond — indépendant de la bordure
                (tu peux laisser bordure sur{' '}
                <span className="font-semibold text-neutral-700">Aucune</span>).
              </p>
            )}

            <WorkToggleRow
              label="Fond du cadre"
              description="Appliquer une couleur de fond derrière le contenu de la carte."
              checked={work.cardBackgroundEnabled}
              onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
            />

            {work.cardBackgroundEnabled ? (
              <WorkColorField
                work={work}
                onChange={onChange}
                slot="cardBackground"
                label="Couleur de fond"
                value={work.cardBackgroundColor}
              />
            ) : null}

            <WorkOptionGrid
              label="Coins arrondis"
              options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
              value={work.cardBorderRadius}
              onChange={(cardBorderRadius) => onChange({ cardBorderRadius })}
              columns={3}
            />

            <WorkOptionGrid
              label="Marge intérieure"
              options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
              value={work.cardPadding}
              onChange={(cardPadding) => onChange({ cardPadding })}
              columns={2}
            />

            <WorkOptionGrid
              label="Espace entre projets"
              options={PORTFOLIO_WORK_CARD_GAP_OPTIONS}
              value={work.cardGap}
              onChange={(cardGap) => onChange({ cardGap })}
              columns={2}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
            <div>
              <p className="text-sm font-semibold text-neutral-950">Cadre des informations</p>
              <p className="mt-1 text-sm text-neutral-500">
                Encadre le bloc titre / description / outils / CTA à côté ou sous le média. Couleurs
                liées à la palette (tokens) avec override hex manuel pour le fond et la bordure.
              </p>
            </div>

            <WorkToggleRow
              label="Activer le cadre info"
              description="Ajoute un panneau distinct autour des informations du projet."
              checked={work.contentFrameEnabled}
              onChange={(contentFrameEnabled) => onChange({ contentFrameEnabled })}
            />

            {work.contentFrameEnabled ? (
              <>
                <WorkOptionGrid
                  label="Bordure"
                  options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
                  value={work.contentFrameBorder}
                  onChange={(contentFrameBorder) => onChange({ contentFrameBorder })}
                  columns={2}
                />

                {work.contentFrameBorder === 'soft' || work.contentFrameBorder === 'solid' ? (
                  <WorkColorField
                    work={work}
                    onChange={onChange}
                    slot="contentFrameBorder"
                    label="Couleur de bordure"
                    value={work.contentFrameBorderColor}
                    allowManualHex
                  />
                ) : null}

                <WorkToggleRow
                  label="Fond du cadre info"
                  description="Couleur de fond derrière les informations."
                  checked={work.contentFrameBackgroundEnabled}
                  onChange={(contentFrameBackgroundEnabled) =>
                    onChange({ contentFrameBackgroundEnabled })
                  }
                />

                {work.contentFrameBackgroundEnabled ? (
                  <WorkColorField
                    work={work}
                    onChange={onChange}
                    slot="contentFrameBackground"
                    label="Couleur de fond"
                    value={work.contentFrameBackgroundColor}
                    allowManualHex
                  />
                ) : null}

                <WorkOptionGrid
                  label="Coins arrondis"
                  options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                  value={work.contentFrameBorderRadius}
                  onChange={(contentFrameBorderRadius) => onChange({ contentFrameBorderRadius })}
                  columns={3}
                />

                <WorkOptionGrid
                  label="Marge intérieure"
                  options={PORTFOLIO_WORK_CARD_PADDING_OPTIONS}
                  value={work.contentFramePadding}
                  onChange={(contentFramePadding) => onChange({ contentFramePadding })}
                  columns={2}
                />

                <WorkOptionGrid
                  label="Espace vertical entre blocs"
                  options={PORTFOLIO_WORK_CONTENT_FRAME_GAP_OPTIONS}
                  value={work.contentFrameGap}
                  onChange={(contentFrameGap) => onChange({ contentFrameGap })}
                  columns={2}
                />
              </>
            ) : null}
          </div>

          {work.galleryLayout === 'stack' || work.galleryLayout === 'carousel' ? (
            <div className="space-y-3">
              {work.galleryLayout === 'carousel' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Carrousel : un seul projet visible. Les flèches gauche / droite passent au projet
                  suivant ou précédent. Combine avec{' '}
                  <span className="font-semibold text-neutral-700">Largeur de la carte</span> pour
                  centrer une carte portrait comme sur la référence.
                </p>
              ) : null}
              <WorkOptionGrid
                label="Card design"
                options={PORTFOLIO_WORK_CARD_DESIGN_OPTIONS.filter(
                  (option) => option.value !== 'compact' && option.value !== 'overlay'
                )}
                value={
                  work.cardDesign === 'compact' || work.cardDesign === 'overlay'
                    ? 'editorial'
                    : work.cardDesign
                }
                onChange={(cardDesign) => onChange({ cardDesign })}
                columns={2}
              />
              <p className="text-sm text-neutral-500">
                Espacement, ombres et densité uniquement — la bordure et les coins se règlent dans{' '}
                <span className="font-semibold text-neutral-700">Cadre & espacement</span>. Emplacement
                et taille du média : sous-section{' '}
                <span className="font-semibold text-neutral-700">Media</span>.
              </p>
            </div>
          ) : work.galleryLayout === 'grid' ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Grille compacte force le design{' '}
              <span className="font-semibold text-neutral-700">Compact</span> : typo serrée,
              descriptions coupées. Place le média (gauche / droite / haut / bas) dans{' '}
              <span className="font-semibold text-neutral-700">Media</span>.
            </p>
          ) : work.galleryLayout === 'overlay' ? (
            <div className="space-y-4">
              <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                Overlay immersif force le design{' '}
                <span className="font-semibold text-neutral-700">Overlay</span> — texte superposé sur le
                média. Place chaque élément (titre, description, outils, CTA…) dans sa propre
                sous-section.
              </p>

              <WorkOptionGrid
                label="Disposition des éléments"
                options={PORTFOLIO_WORK_OVERLAY_LAYOUT_MODE_OPTIONS}
                value={work.overlayLayoutMode}
                onChange={(overlayLayoutMode) => onChange({ overlayLayoutMode })}
                columns={2}
              />

              {work.overlayLayoutMode === 'free' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Mode libre actif — ouvre{' '}
                  <span className="font-semibold text-neutral-700">Titre</span>,{' '}
                  <span className="font-semibold text-neutral-700">Description</span>,{' '}
                  <span className="font-semibold text-neutral-700">Outils</span>,{' '}
                  <span className="font-semibold text-neutral-700">CTA</span> ou{' '}
                  <span className="font-semibold text-neutral-700">Categories</span> pour placer chaque
                  élément dans la grille 3×3 (grand écran uniquement).
                </p>
              ) : null}
            </div>
          ) : work.galleryLayout === 'list' || work.galleryLayout === 'accordion' ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Emplacement et taille de la vignette : sous-section{' '}
              <span className="font-semibold text-neutral-700">Media</span>.
            </p>
          ) : null}
        </div>
      ) : null}

      {subSection === 'media' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, media border color can follow the palette card-border token. Turn off to pick freely."
          />

          <WorkToggleRow
            label="Afficher le média"
            description="Image / vidéo du projet sur les cartes, listes et accordéons — sans supprimer le fichier Studio."
            checked={work.showCardMedia}
            onChange={(showCardMedia) => onChange({ showCardMedia })}
          />

          {!work.showCardMedia ? (
            <div className="space-y-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
              <WorkOptionGrid
                label="Info layout without media"
                options={PORTFOLIO_WORK_NO_MEDIA_INFO_LAYOUT_OPTIONS}
                value={work.noMediaInfoLayout}
                onChange={(noMediaInfoLayout) => onChange({ noMediaInfoLayout })}
                columns={3}
              />
              <p className="text-sm text-neutral-500">
                Sans média, le contenu remonte pour remplir la carte. Choisis la largeur et
                l’alignement du bloc d’informations.
              </p>
            </div>
          ) : (
            <>
              <WorkOptionGrid
                label="Emplacement du média"
                options={PORTFOLIO_WORK_CONTENT_PLACEMENT_OPTIONS}
                value={work.contentPlacement}
                onChange={(contentPlacement) => onChange({ contentPlacement })}
                columns={2}
              />
              <p className="text-sm text-neutral-500">
                Position par rapport aux infos (titre, description, outils, CTA). S’applique à toutes
                les dispositions de galerie — en grille multi-colonnes, le mode côte-à-côte peut
                repasser en empilé pour la lisibilité.
              </p>

              {work.galleryLayout === 'overlay' ? (
                <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  Overlay immersif : le média reste le fond de la carte ; l’emplacement vertical
                  (haut / bas) ajuste surtout le ratio de hauteur.
                </p>
              ) : null}

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    {workCardIsStacked(work.cardDesign, work.contentPlacement)
                      ? 'Hauteur du média'
                      : 'Taille / ratio média'}
                  </p>
                  <span className="text-sm font-semibold text-neutral-700">{work.mediaRatio}%</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={70}
                  step={1}
                  value={work.mediaRatio}
                  onChange={(event) => onChange({ mediaRatio: Number(event.target.value) })}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Taille du média"
                />
                <p className="mt-2 text-sm text-neutral-500">
                  {workCardIsStacked(work.cardDesign, work.contentPlacement)
                    ? 'Ajuste la hauteur de l’image par rapport au bloc texte.'
                    : 'Redimensionne l’aperçu média par rapport à la colonne infos (desktop).'}
                </p>
              </div>

              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Bordure & coins du média</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Chrome autour de l’image (ou de la carte quand le média est empilé).
                  </p>
                </div>
                <WorkOptionGrid
                  label="Bordure"
                  options={PORTFOLIO_WORK_CARD_BORDER_OPTIONS}
                  value={work.cardBorder}
                  onChange={(cardBorder) => onChange({ cardBorder })}
                  columns={2}
                />
                {work.cardBorder !== 'none' && work.cardBorder !== 'accent' ? (
                  <WorkColorField
                    work={work}
                    onChange={onChange}
                    slot="cardBorder"
                    label="Couleur de bordure"
                    value={work.cardBorderColor}
                  />
                ) : null}
                <WorkOptionGrid
                  label="Coins"
                  options={PORTFOLIO_WORK_CARD_RADIUS_OPTIONS}
                  value={work.cardBorderRadius}
                  onChange={(cardBorderRadius) => onChange({ cardBorderRadius })}
                  columns={3}
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      {subSection === 'title' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, project title color follows its palette token. Turn off to pick the text color freely."
          />
          <WorkToggleRow
            label="Show project title"
            description="Display the project name on each card."
            checked={work.showCardTitle}
            onChange={(showCardTitle) => onChange({ showCardTitle })}
          />
          {work.showCardTitle ? (
            <>
              <WorkOverlayElementPlacementControls work={work} elementId="title" onChange={onChange} />
              <WorkElementChromeControls
                work={work}
                chromeId="cardTitle"
                onChange={onChange}
                title="Fond du titre"
                description="Fond derrière le titre du projet sur la carte."
              />
              <WorkInlineTypography
                work={work}
                target="cardTitle"
                onChange={onChange}
                title="Title typography"
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'description' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, description color follows its palette token. Turn off to pick the text color freely."
          />
          <WorkToggleRow
            label="Show description"
            description="Display the project description under the title."
            checked={work.showCardDescription}
            onChange={(showCardDescription) => onChange({ showCardDescription })}
          />
          {work.showCardDescription ? (
            <>
              <WorkOverlayElementPlacementControls
                work={work}
                elementId="description"
                onChange={onChange}
              />
              <WorkElementChromeControls
                work={work}
                chromeId="cardDescription"
                onChange={onChange}
                title="Fond de la description"
                description="Fond derrière le texte de description sur la carte."
              />
              <WorkInlineTypography
                work={work}
                target="cardDescription"
                onChange={onChange}
                title="Description typography"
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'tools' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, tools label and list colors follow palette tokens. Turn off to set them freely below."
          />
          <WorkToggleRow
            label="Show tools block"
            description="Display tools used on each project card."
            checked={work.showCardTools}
            onChange={(showCardTools) => onChange({ showCardTools })}
          />
          {work.showCardTools ? (
            <>
              <WorkToggleRow
                label="Tool icons"
                checked={work.showCardToolIcons}
                onChange={(showCardToolIcons) => onChange({ showCardToolIcons })}
              />
              <WorkToggleRow
                label="Tool text list"
                checked={work.showCardToolList}
                onChange={(showCardToolList) => onChange({ showCardToolList })}
              />
              <WorkToggleRow
                label="“Tools to use” label"
                checked={work.showToolsLabel}
                onChange={(showToolsLabel) => onChange({ showToolsLabel })}
              />
              {work.showToolsLabel ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Label text
                  </p>
                  <input
                    type="text"
                    value={work.toolsLabelText}
                    placeholder="Tools to use"
                    onChange={(event) => onChange({ toolsLabelText: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                  />
                </div>
              ) : null}

              <WorkOptionGrid
                label="Tools display"
                options={PORTFOLIO_WORK_TOOLS_DISPLAY_OPTIONS}
                value={work.toolsDisplay}
                onChange={(toolsDisplay) => onChange({ toolsDisplay })}
                columns={2}
              />

              <WorkToggleRow
                label="Aligner tools en bas (grand écran)"
                description="Pousse le bloc tools vers le bas des cartes (grand écran) pour aligner les rangées. Le margin-top reste toujours appliqué au-dessus de Tools."
                checked={work.toolsPinToBottom !== false}
                onChange={(toolsPinToBottom) => onChange({ toolsPinToBottom })}
              />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Margin top tools
                  </p>
                  <span className="text-sm font-semibold text-neutral-700">
                    {clampWorkToolsMarginTopPx(work.toolsMarginTopPx, 0)}px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  Espace fixe au-dessus de Tools — tous les designs. Fonctionne aussi quand
                  l’alignement bas est activé.
                </p>
                <input
                  type="range"
                  min={WORK_TOOLS_MARGIN_TOP_PX_MIN}
                  max={WORK_TOOLS_MARGIN_TOP_PX_MAX}
                  step={1}
                  value={clampWorkToolsMarginTopPx(work.toolsMarginTopPx, 0)}
                  onChange={(event) =>
                    onChange({ toolsMarginTopPx: Number(event.target.value) })
                  }
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                />
              </div>

              <WorkOptionGrid
                label="Tools icon size"
                options={PORTFOLIO_TOOLS_ICON_SIZE_OPTIONS}
                value={work.toolsIconSize}
                onChange={(toolsIconSize) => onChange({ toolsIconSize })}
                columns={2}
              />

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Max tools shown
                  </p>
                  <span className="text-sm font-semibold text-neutral-700">{work.maxToolsShown}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  value={work.maxToolsShown}
                  onChange={(event) => onChange({ maxToolsShown: Number(event.target.value) })}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                />
                <p className="mt-2 text-sm text-neutral-500">
                  Tool logos appear when they exist in the NoProbleme library for each project&apos;s
                  tools.
                </p>
              </div>

              <WorkOverlayElementPlacementControls work={work} elementId="tools" onChange={onChange} />

              <WorkElementChromeControls
                work={work}
                chromeId="tools"
                onChange={onChange}
                title="Fond des outils"
                description="Fond derrière les icônes (et le label si « Limiter aux icônes » est désactivé)."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="toolsIconBackground"
                  label="Icon background"
                  value={work.toolsIconBackgroundColor}
                />
                <WorkColorField
                  work={work}
                  onChange={onChange}
                  slot="toolsIconBorder"
                  label="Icon border"
                  value={work.toolsIconBorderColor}
                />
              </div>

              {work.showToolsLabel ? (
                <WorkInlineTypography
                  work={work}
                  target="toolsLabel"
                  onChange={onChange}
                  title="Tools label typography"
                />
              ) : null}
              {work.showCardToolList ? (
                <WorkInlineTypography
                  work={work}
                  target="toolsList"
                  onChange={onChange}
                  title="Tools list typography"
                />
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'cta' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, CTA accent and text colors follow palette tokens. Turn off to pick them freely below."
          />

          <WorkToggleRow
            label="Show view project button"
            checked={work.showCardCta}
            onChange={(showCardCta) => onChange({ showCardCta })}
          />

          {work.showCardCta ? (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Button label
                </p>
                <input
                  type="text"
                  value={work.ctaLabel}
                  onChange={(event) => onChange({ ctaLabel: event.target.value })}
                  placeholder="View project"
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900"
                />
              </div>

              <WorkOptionGrid
                label="Button style"
                options={PORTFOLIO_WORK_CTA_DESIGN_OPTIONS}
                value={work.ctaDesign}
                onChange={(ctaDesign) => onChange({ ctaDesign })}
                columns={2}
              />

              <WorkToggleRow
                label="Show CTA icon"
                description="Glyph next to the button label (arrow, play, plus…)."
                checked={work.ctaShowIcon !== false}
                onChange={(ctaShowIcon) => onChange({ ctaShowIcon })}
              />

              {work.ctaShowIcon !== false ? (
                <>
                  <WorkOptionGrid
                    label="Icon position"
                    options={PORTFOLIO_WORK_CTA_ICON_POSITION_OPTIONS}
                    value={work.ctaIconPosition ?? 'right'}
                    onChange={(ctaIconPosition) => onChange({ ctaIconPosition })}
                    columns={2}
                  />
                  <WorkOptionGrid
                    label="CTA icon"
                    options={PORTFOLIO_WORK_CTA_ICON_OPTIONS}
                    value={work.ctaIcon ?? 'arrow-up-right'}
                    onChange={(ctaIcon) => onChange({ ctaIcon })}
                    columns={2}
                  />
                </>
              ) : null}

              <WorkOptionGrid
                label="Épaisseur de bordure"
                options={PORTFOLIO_WORK_CTA_BORDER_WIDTH_OPTIONS}
                value={work.ctaBorderWidth}
                onChange={(ctaBorderWidth) => onChange({ ctaBorderWidth })}
                columns={2}
              />

              <WorkOptionGrid
                label="Coins arrondis (CTA)"
                options={PORTFOLIO_WORK_CTA_BORDER_RADIUS_OPTIONS}
                value={work.ctaBorderRadius}
                onChange={(ctaBorderRadius) => onChange({ ctaBorderRadius })}
                columns={3}
              />
              {(work.ctaDesign === 'circle-icon' || work.ctaDesign === 'text-arrow') && (
                <p className="text-sm text-neutral-500">
                  Le rayon s’applique aux styles <span className="font-semibold text-neutral-700">pill</span>.
                  Circle icon garde un cercle ; Text + arrow n’a pas de boîte.
                </p>
              )}

              <WorkColorField
                work={work}
                onChange={onChange}
                slot="ctaAccent"
                label="Button accent (fill / outline)"
                value={work.ctaColor}
              />

              <WorkColorField
                work={work}
                onChange={onChange}
                slot="ctaBorder"
                label="Button border"
                value={work.ctaBorderColor}
              />

              <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Effet au survol</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Comme la Navigation — couleurs de fond, texte et bordure au hover, liées à la
                    palette.
                  </p>
                </div>

                <WorkToggleRow
                  label="Activer le hover"
                  description="Au survol, le bouton bascule vers les couleurs ci-dessous."
                  checked={work.ctaHoverEnabled}
                  onChange={(ctaHoverEnabled) => onChange({ ctaHoverEnabled })}
                />

                {work.ctaHoverEnabled ? (
                  <>
                    <WorkColorField
                      work={work}
                      onChange={onChange}
                      slot="ctaHoverBackground"
                      label="Fond au survol"
                      value={work.ctaHoverBackgroundColor}
                    />
                    <WorkColorField
                      work={work}
                      onChange={onChange}
                      slot="ctaHoverText"
                      label="Texte au survol"
                      value={work.ctaHoverTextColor}
                    />
                    <WorkColorField
                      work={work}
                      onChange={onChange}
                      slot="ctaHoverBorder"
                      label="Bordure au survol"
                      value={work.ctaHoverBorderColor}
                    />
                  </>
                ) : null}
              </div>

              <WorkOptionGrid
                label="Emplacement du bouton (pile)"
                options={PORTFOLIO_WORK_CTA_ALIGNMENT_OPTIONS}
                value={work.ctaAlignment}
                onChange={(ctaAlignment) => onChange({ ctaAlignment })}
                columns={3}
              />

              <WorkOverlayElementPlacementControls work={work} elementId="cta" onChange={onChange} />

              <WorkInlineTypography
                work={work}
                target="cta"
                onChange={onChange}
                title="CTA typography"
                extra={
                  <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                    Sur les pills remplies, le texte suit le <span className="font-semibold text-neutral-700">fond de page</span>{' '}
                    (token fond) — pas un blanc fixe. Outline / circle / text utilisent « CTA text »
                    (texteFort). Le hover suit les tokens ci-dessus.
                  </p>
                }
              />
            </>
          ) : null}
        </div>
      ) : null}

      {subSection === 'background' ? (
        <div className="space-y-6">
          <WorkUsePaletteToggle
            work={work}
            onChange={onChange}
            description="When on, section fill colors follow palette tokens. Turn off to pick them freely below."
          />

          <SectionBackgroundSettingsFields
            settings={work}
            onChange={onChange}
            renderColorField={({ label, value, onChange: onBgColorChange }) => {
              const slot = WORK_BACKGROUND_LABEL_SLOTS[label];
              if (!slot) {
                return (
                  <WorkManualColorField
                    label={label}
                    value={value}
                    onChange={onBgColorChange}
                  />
                );
              }
              return (
                <WorkColorField
                  work={work}
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

      {subSection === 'palette' ? <WorkPalettePanel work={work} onChange={onChange} /> : null}
    </div>
  );
}
