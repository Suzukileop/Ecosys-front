'use client';

import { useState } from 'react';
import {
  PORTFOLIO_LIST_MARKER_SOURCE_OPTIONS,
  PORTFOLIO_LIST_MARKER_STYLE_OPTIONS,
} from '@/components/portfolio/portfolio-list-marker';
import { PortfolioListMarkerSizeWeightControls } from '@/components/portfolio/PortfolioListMarkerSizeWeightControls';
import {
  PORTFOLIO_FAQ_CONTENT_ALIGN_OPTIONS,
  PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS,
  PORTFOLIO_FAQ_ILLUSTRATION_OPTIONS,
  PORTFOLIO_FAQ_ILLUSTRATION_PLACEMENT_OPTIONS,
  PORTFOLIO_FAQ_ITEM_DESIGN_OPTIONS,
  PORTFOLIO_FAQ_DESIGN_OPTIONS,
  PORTFOLIO_FAQ_PANEL_SHADOW_OPTIONS,
  PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY,
  PORTFOLIO_FAQ_SPLIT_SIDE_OPTIONS,
  PORTFOLIO_FAQ_CTA_SPLIT_SIDE_OPTIONS,
  defaultsForFaqDesign,
  PORTFOLIO_FAQ_ITEM_GAP_OPTIONS,
  PORTFOLIO_FAQ_LIST_MAX_WIDTH_OPTIONS,
  PORTFOLIO_FAQ_LIST_PLACEMENT_OPTIONS,
  PORTFOLIO_FAQ_SECTION_LAYOUT_OPTIONS,
  PORTFOLIO_FAQ_SUBTITLE_PRESET_OPTIONS,
  PORTFOLIO_FAQ_TITLE_PRESET_OPTIONS,
  faqSectionLayoutIsAside,
  type PortfolioFaqSectionSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  applyFaqPaletteToSettings,
  DEFAULT_FAQ_COLOR_BINDINGS,
  DEFAULT_FAQ_PALETTE,
  mergeFaqColorBindings,
  mergeFaqPalette,
  patchFaqColorBinding,
  patchFaqColorField,
  type FaqColorSlot,
} from '@/components/portfolio/portfolio-faq-palette-settings';
import {
  PortfolioCardFrameSettingsFields,
  type PortfolioCardFrameColorFieldKey,
} from '@/components/portfolio/portfolio-card-frame-settings-fields';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';

const FAQ_FRAME_SLOTS: Record<PortfolioCardFrameColorFieldKey, FaqColorSlot> = {
  cardBorderColor: 'cardBorder',
  cardBackgroundColor: 'cardBackground',
  cardBackgroundColorA: 'cardBackgroundA',
  cardBackgroundColorB: 'cardBackgroundB',
  cardDividerColor: 'cardDivider',
};

export type FaqSubSection = 'general' | 'header' | 'items' | 'frame';

const FAQ_SUB_SECTIONS: { id: FaqSubSection; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Section visibility, ready-to-use design, item design, and spacing.' },
  { id: 'header', label: 'Header', description: 'Title, subtitle, fonts, and colors.' },
  { id: 'items', label: 'Items', description: 'Alignment, visibility toggles, icons, and accent colors.' },
  { id: 'frame', label: 'Frame', description: 'Complete card frame controls (border, split background, radius).' },
];

/** Map legacy subsection ids (saved UI state / search) onto remaining FAQ menus. */
export function normalizeFaqSubSection(value: string | undefined): FaqSubSection {
  if (value === 'header' || value === 'items' || value === 'frame' || value === 'general') {
    return value;
  }
  return 'general';
}

function asFaqPatch(patch: Record<string, unknown> | object): Partial<PortfolioFaqSectionSettings> {
  return patch as Partial<PortfolioFaqSectionSettings>;
}

function FaqToggleRow({
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

function FaqOptionGrid<T extends string>({
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

function FaqManualColorField({
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

function FaqColorField({
  faq,
  onChange,
  slot,
  label,
  value,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  slot: FaqColorSlot;
  label: string;
  value: string;
}) {
  if (faq.useHeroPalette === false) {
    return (
      <FaqManualColorField
        label={label}
        value={value}
        onChange={(hex) => onChange(asFaqPatch(patchFaqColorField(faq, slot, hex)))}
      />
    );
  }

  const palette = mergeFaqPalette(DEFAULT_FAQ_PALETTE, faq.faqPalette);
  const bindings = mergeFaqColorBindings(DEFAULT_FAQ_COLOR_BINDINGS, faq.faqColorBindings);
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
          onChange(asFaqPatch(patchFaqColorBinding(faq, slot, event.target.value as HeroPaletteTokenId)))
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

export function FaqSettingsPanel({
  faq,
  onChange,
  subSection: controlledSubSection,
  onSubSectionChange,
}: {
  faq: PortfolioFaqSectionSettings;
  onChange: (patch: Partial<PortfolioFaqSectionSettings>) => void;
  subSection?: FaqSubSection;
  onSubSectionChange?: (value: FaqSubSection) => void;
}) {
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<FaqSubSection>('header');
  const subSection = normalizeFaqSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: FaqSubSection) => {
    const next = normalizeFaqSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta = FAQ_SUB_SECTIONS.find((section) => section.id === subSection) ?? FAQ_SUB_SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">FAQ subsection</p>
          <p className="mt-1 text-sm text-neutral-500">{activeMeta.description}</p>
        </div>
        <select
          value={subSection}
          onChange={(event) => setSubSection(event.target.value as FaqSubSection)}
          className="w-full min-w-0 rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 sm:min-w-[12rem] sm:max-w-xs sm:flex-1"
        >
          {FAQ_SUB_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {subSection === 'general' ? (
        <div className="space-y-6">
          <FaqToggleRow
            label="Show section"
            description="Display the FAQ block on your public portfolio."
            checked={faq.enabled}
            onChange={(enabled) => onChange({ enabled })}
          />
          <SectionHeroPaletteToggle
            enabled={faq.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                asFaqPatch(
                  useHeroPalette ? { useHeroPalette, ...applyFaqPaletteToSettings(faq) } : { useHeroPalette }
                )
              )
            }
          />
          <FaqOptionGrid
            label="Design"
            options={PORTFOLIO_FAQ_DESIGN_OPTIONS}
            value={faq.design ?? 'two-column'}
            onChange={(design) => onChange(asFaqPatch(defaultsForFaqDesign(design)))}
            columns={1}
          />
          {faq.design === 'panel' ? (
            <>
              <FaqOptionGrid
                label="Ombre de la carte"
                options={PORTFOLIO_FAQ_PANEL_SHADOW_OPTIONS}
                value={faq.panelShadow ?? 'medium'}
                onChange={(panelShadow) =>
                  onChange({
                    panelShadow,
                    panelShadowIntensity: PORTFOLIO_FAQ_PANEL_SHADOW_PRESET_INTENSITY[panelShadow],
                  })
                }
                columns={2}
              />
              {(faq.panelShadow ?? 'medium') !== 'none' ? (
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                      Intensité de l’ombre
                    </p>
                    <span className="text-sm font-semibold text-neutral-700">
                      {faq.panelShadowIntensity ?? 55}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={faq.panelShadowIntensity ?? 55}
                    onChange={(event) =>
                      onChange({ panelShadowIntensity: Number(event.target.value) })
                    }
                    className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                    aria-label="Intensité de l’ombre de la carte FAQ"
                  />
                </div>
              ) : null}
            </>
          ) : null}
          {faq.design === 'split' || faq.design === 'cta-split' ? (
            <>
              <FaqOptionGrid
                label={faq.design === 'cta-split' ? 'Placement SVG / questions' : 'Placement titre / questions'}
                options={
                  faq.design === 'cta-split'
                    ? PORTFOLIO_FAQ_CTA_SPLIT_SIDE_OPTIONS
                    : PORTFOLIO_FAQ_SPLIT_SIDE_OPTIONS
                }
                value={
                  faq.illustrationPlacement ?? (faq.design === 'cta-split' ? 'right' : 'left')
                }
                onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
                columns={2}
              />
              <FaqOptionGrid
                label="SVG"
                options={PORTFOLIO_FAQ_ILLUSTRATION_OPTIONS}
                value={
                  faq.illustrationVariant ?? (faq.design === 'cta-split' ? 'chat' : 'question')
                }
                onChange={(illustrationVariant) => onChange({ illustrationVariant })}
                columns={2}
              />
            </>
          ) : null}
          <FaqOptionGrid
            label="Item design"
            options={PORTFOLIO_FAQ_ITEM_DESIGN_OPTIONS}
            value={faq.itemDesign}
            onChange={(itemDesign) => onChange({ itemDesign })}
            columns={2}
          />
          <FaqOptionGrid
            label="Espacement vertical"
            options={PORTFOLIO_FAQ_ITEM_GAP_OPTIONS}
            value={faq.itemGap}
            onChange={(itemGap) => onChange({ itemGap })}
            columns={2}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FaqOptionGrid
              label="List width"
              options={PORTFOLIO_FAQ_LIST_MAX_WIDTH_OPTIONS}
              value={faq.listMaxWidth}
              onChange={(listMaxWidth) => onChange({ listMaxWidth })}
              columns={2}
            />
            <FaqOptionGrid
              label="List placement"
              options={PORTFOLIO_FAQ_LIST_PLACEMENT_OPTIONS}
              value={faq.listPlacement}
              onChange={(listPlacement) => onChange({ listPlacement })}
              columns={2}
            />
          </div>
          <FaqColorField faq={faq} onChange={onChange} slot="accent" label="Accent color" value={faq.accentColor} />
        </div>
      ) : null}

      {subSection === 'header' ? (
        <div className="space-y-6">
          <FaqOptionGrid
            label="Disposition titre / liste"
            options={PORTFOLIO_FAQ_SECTION_LAYOUT_OPTIONS}
            value={faq.sectionLayout ?? 'stacked'}
            onChange={(sectionLayout) => onChange({ sectionLayout })}
            columns={1}
          />
          {faqSectionLayoutIsAside(faq.sectionLayout) ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              En côte à côte, le titre et les questions s’affichent en deux colonnes sur grand écran
              (empilés sur mobile).
            </p>
          ) : null}
          <FaqOptionGrid
            label="Title preset"
            options={PORTFOLIO_FAQ_TITLE_PRESET_OPTIONS}
            value={faq.titlePreset}
            onChange={(titlePreset) => onChange({ titlePreset })}
            columns={2}
          />
          {faq.titlePreset === 'custom' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Custom title</p>
              <input
                type="text"
                value={faq.titleCustom || faq.title}
                onChange={(event) => onChange({ titleCustom: event.target.value, title: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <FaqOptionGrid
            label="Subtitle preset"
            options={PORTFOLIO_FAQ_SUBTITLE_PRESET_OPTIONS}
            value={faq.subtitlePreset}
            onChange={(subtitlePreset) => onChange({ subtitlePreset })}
            columns={2}
          />
          {faq.subtitlePreset === 'custom' || faq.subtitlePreset === 'default' ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Subtitle text</p>
              <textarea
                rows={3}
                value={faq.subtitlePreset === 'custom' ? faq.subtitleCustom || faq.subtitle : faq.subtitle}
                onChange={(event) =>
                  onChange(
                    faq.subtitlePreset === 'custom'
                      ? { subtitleCustom: event.target.value, subtitle: event.target.value }
                      : { subtitle: event.target.value }
                  )
                }
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FaqColorField faq={faq} onChange={onChange} slot="title" label="Title color" value={faq.titleColor} />
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot="subtitle"
              label="Subtitle color"
              value={faq.subtitleColor}
            />
          </div>

          {faqSectionLayoutIsAside(faq.sectionLayout) ? (
            <p className="text-sm text-neutral-500">
              Alignement du texte du titre : le titre est déjà placé{' '}
              {faq.sectionLayout === 'aside-right' ? 'à droite' : 'à gauche'} de la liste.
            </p>
          ) : (
            <FaqOptionGrid
              label="Header alignment"
              options={[
                { value: 'left' as const, label: 'Left', description: 'Default editorial alignment.' },
                { value: 'center' as const, label: 'Center', description: 'Centered title and subtitle.' },
                { value: 'right' as const, label: 'Right', description: 'Align header to the right.' },
              ]}
              value={faq.headerAlignment}
              onChange={(headerAlignment) => onChange({ headerAlignment })}
              columns={3}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FaqToggleRow
              label="Uppercase title"
              checked={faq.titleUppercase}
              onChange={(titleUppercase) => onChange({ titleUppercase })}
            />
            <FaqToggleRow
              label="Uppercase subtitle"
              checked={faq.subtitleUppercase}
              onChange={(subtitleUppercase) => onChange({ subtitleUppercase })}
            />
          </div>
        </div>
      ) : null}

      {subSection === 'frame' ? (
        <PortfolioCardFrameSettingsFields
          settings={faq}
          onChange={onChange}
          heading="FAQ frame"
          description="Outer shell for every design — Bordure, couleur, fond, arrondi. Padding carte also scales row/card inset equally across designs."
          renderColorField={({ field, label, value }) => (
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot={FAQ_FRAME_SLOTS[field]}
              label={label}
              value={value}
            />
          )}
        />
      ) : null}

      {subSection === 'items' ? (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Visibility</p>
            <FaqToggleRow
              label="Item markers"
              description="Show a number or bullet before each question (same puces as Experience / Services tasks)."
              checked={faq.showItemNumbers}
              onChange={(showItemNumbers) => onChange({ showItemNumbers })}
            />
            {faq.showItemNumbers ? (
              <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Marker style</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Same task-bullet vocabulary as Global / Experience / Services.
                  </p>
                </div>
                <FaqOptionGrid
                  label="Source"
                  options={PORTFOLIO_LIST_MARKER_SOURCE_OPTIONS}
                  value={faq.itemMarkerSource ?? 'section'}
                  onChange={(itemMarkerSource) => onChange({ itemMarkerSource })}
                  columns={2}
                />
                {(faq.itemMarkerSource ?? 'section') === 'section' ? (
                  <>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        Style
                      </p>
                      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                        {PORTFOLIO_LIST_MARKER_STYLE_OPTIONS.map((option) => {
                          const active = (faq.itemMarkerStyle ?? 'number') === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              title={`${option.label} — ${option.description}`}
                              onClick={() => onChange({ itemMarkerStyle: option.value })}
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
                    {(faq.itemMarkerStyle ?? 'number') !== 'none' ? (
                      <>
                        <PortfolioListMarkerSizeWeightControls
                          size={faq.itemMarkerSize ?? 'md'}
                          sizePx={faq.itemMarkerSizePx}
                          weight={faq.itemMarkerWeight ?? 'regular'}
                          weightAmount={faq.itemMarkerWeightAmount}
                          OptionGrid={FaqOptionGrid}
                          sizeLabel="Size"
                          weightLabel="Weight"
                          onChange={(patch) =>
                            onChange({
                              ...(patch.size !== undefined ? { itemMarkerSize: patch.size } : null),
                              ...(patch.sizePx !== undefined ? { itemMarkerSizePx: patch.sizePx } : null),
                              ...(patch.weight !== undefined ? { itemMarkerWeight: patch.weight } : null),
                              ...(patch.weightAmount !== undefined
                                ? { itemMarkerWeightAmount: patch.weightAmount }
                                : null),
                            })
                          }
                        />
                        <FaqColorField
                          faq={faq}
                          onChange={(patch) => {
                            if (typeof patch.numberColor === 'string') {
                              onChange({
                                ...patch,
                                itemMarkerColor: patch.numberColor,
                              });
                              return;
                            }
                            onChange(patch);
                          }}
                          slot="number"
                          label="Marker color"
                          value={faq.itemMarkerColor || faq.numberColor}
                        />
                      </>
                    ) : null}
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">
                    Using Global → Task list bullets. Switch to Section to override here.
                  </p>
                )}
              </div>
            ) : null}
            <FaqToggleRow
              label="Answer accent border"
              description="Left border on expanded answers."
              checked={faq.showAnswerAccentBorder}
              onChange={(showAnswerAccentBorder) => onChange({ showAnswerAccentBorder })}
            />
            <FaqToggleRow
              label="Expand icon"
              description="Plus or chevron icon on each question row."
              checked={faq.showExpandIcon}
              onChange={(showExpandIcon) => onChange({ showExpandIcon })}
            />
            <FaqToggleRow
              label="Expandable accordion"
              description="Off = all answers stay open and cannot fold. On = click to expand / collapse."
              checked={faq.expandable !== false}
              onChange={(expandable) => onChange({ expandable })}
            />
            {faq.expandable !== false ? (
              <FaqToggleRow
                label="One answer at a time"
                description="Opening a question automatically closes any other open answer."
                checked={
                  faq.design === 'two-column' ||
                  faq.design === 'panel' ||
                  faq.design === 'split' ||
                  faq.design === 'cta-split' ||
                  faq.accordionExclusive === true
                }
                onChange={(accordionExclusive) => onChange({ accordionExclusive })}
              />
            ) : null}
            <FaqToggleRow
              label="Align answers with questions"
              description="Remove the left indent so answers sit on the same edge as the question text."
              checked={faq.answerFlushWithQuestion === true}
              onChange={(answerFlushWithQuestion) => onChange({ answerFlushWithQuestion })}
            />
          </div>

          {faq.design === 'split' || faq.design === 'cta-split' ? null : (
            <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">FAQ illustration</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Decorative SVG beside the list. Choose a style, then place it left or right on large
                  screens.
                </p>
              </div>
              <FaqOptionGrid
                label="SVG style"
                options={PORTFOLIO_FAQ_ILLUSTRATION_OPTIONS}
                value={faq.illustrationVariant ?? 'none'}
                onChange={(illustrationVariant) => onChange({ illustrationVariant })}
                columns={2}
              />
              {(faq.illustrationVariant ?? 'none') !== 'none' ? (
                <FaqOptionGrid
                  label="SVG placement"
                  options={PORTFOLIO_FAQ_ILLUSTRATION_PLACEMENT_OPTIONS}
                  value={faq.illustrationPlacement ?? 'right'}
                  onChange={(illustrationPlacement) => onChange({ illustrationPlacement })}
                  columns={2}
                />
              ) : null}
            </div>
          )}

          <FaqOptionGrid
            label="Content alignment"
            options={PORTFOLIO_FAQ_CONTENT_ALIGN_OPTIONS}
            value={faq.itemAlign}
            onChange={(itemAlign) => onChange({ itemAlign })}
            columns={3}
          />

          <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Accents & icon</p>
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot="answerAccentBorder"
              label="Answer border color"
              value={faq.answerAccentBorderColor}
            />
            <FaqOptionGrid
              label="Expand icon style"
              options={PORTFOLIO_FAQ_EXPAND_ICON_OPTIONS}
              value={faq.expandIconStyle}
              onChange={(expandIconStyle) => onChange({ expandIconStyle })}
              columns={2}
            />
            <FaqColorField
              faq={faq}
              onChange={onChange}
              slot="expandIcon"
              label="Expand icon color"
              value={faq.expandIconColor}
            />
          </div>
        </div>
      ) : null}

    </div>
  );
}
