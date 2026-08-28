'use client';

import { SectionBackgroundSettingsFields } from '@/components/portfolio/portfolio-section-background-controls';
import { SectionHeroPaletteToggle } from '@/components/portfolio/SectionHeroPaletteToggle';
import {
  PORTFOLIO_TOOLS_CARD_GAP_OPTIONS,
  PORTFOLIO_TOOLS_DESIGN_OPTIONS,
  PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS,
  PORTFOLIO_TOOLS_TITLE_PRESET_OPTIONS,
  type PortfolioToolsCardGap,
  type PortfolioToolsSectionSettings,
  type PortfolioToolsTileSize,
  type PortfolioToolsTitlePreset,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  applyToolsPaletteToSettings,
  DEFAULT_TOOLS_COLOR_BINDINGS,
  DEFAULT_TOOLS_PALETTE,
  mergeToolsColorBindings,
  mergeToolsPalette,
  patchToolsColorBinding,
  PORTFOLIO_TOOLS_COLOR_SLOT_OPTIONS,
  type ToolsColorSlot,
} from '@/components/portfolio/portfolio-tools-palette-settings';
import {
  PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS,
  resolveHeroPaletteColor,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type ToolsSubSection = 'general' | 'palette' | 'background';

const SUBSECTIONS: { value: ToolsSubSection; label: string }[] = [
  { value: 'general', label: 'Général' },
  { value: 'palette', label: 'Palette' },
  { value: 'background', label: 'Arrière-plan' },
];

export function normalizeToolsSubSection(value: string | undefined): ToolsSubSection {
  return SUBSECTIONS.some((item) => item.value === value) ? (value as ToolsSubSection) : 'general';
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-3">
      <span className="text-sm font-semibold text-neutral-900">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}

function SelectField<T extends string>({
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
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(event) => {
          const option = options.find((item) => item.value === event.target.value);
          if (option) onChange(option.value);
        }}
        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
        />
      </div>
    </label>
  );
}

type ToolsSettingsPanelProps = {
  tools: PortfolioToolsSectionSettings;
  onChange: (patch: Partial<PortfolioToolsSectionSettings>) => void;
  subSection?: ToolsSubSection;
  onSubSectionChange?: (value: ToolsSubSection) => void;
};

export function ToolsSettingsPanel({
  tools,
  onChange,
  subSection = 'general',
  onSubSectionChange,
}: ToolsSettingsPanelProps) {
  const palette = mergeToolsPalette(DEFAULT_TOOLS_PALETTE, tools.toolsPalette);
  const bindings = mergeToolsColorBindings(DEFAULT_TOOLS_COLOR_BINDINGS, tools.toolsColorBindings);
  const current = normalizeToolsSubSection(subSection);
  const isRichToolsDesign =
    tools.design === 'brand-cards' ||
    tools.design === 'brand-directory' ||
    tools.design === 'brand-showcase' ||
    tools.design === 'brand-tiles';
  const paletteSlots = PORTFOLIO_TOOLS_COLOR_SLOT_OPTIONS.filter((slot) => {
    if (
      slot.value === 'title' ||
      slot.value === 'tileBackground' ||
      slot.value === 'label' ||
      slot.value === 'sectionBackground'
    ) {
      return true;
    }
    if (!isRichToolsDesign) return false;
    return (
      slot.value === 'description' ||
      slot.value === 'cardBackground' ||
      slot.value === 'cardBorder' ||
      slot.value === 'chipBackground' ||
      slot.value === 'chipText' ||
      slot.value === 'levelAccent'
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SUBSECTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSubSectionChange?.(item.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              current === item.value
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {current === 'general' ? (
        <div className="space-y-4">
          <Toggle label="Afficher la section Tools" checked={tools.enabled} onChange={(enabled) => onChange({ enabled })} />
          <SelectField
            label="Design"
            value={tools.design}
            options={PORTFOLIO_TOOLS_DESIGN_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(design) => onChange({ design })}
          />
          <p className="text-sm text-neutral-500">
            {PORTFOLIO_TOOLS_DESIGN_OPTIONS.find((item) => item.value === tools.design)?.description}
          </p>
          <SelectField
            label="Titre"
            value={tools.titlePreset}
            options={PORTFOLIO_TOOLS_TITLE_PRESET_OPTIONS.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            onChange={(titlePreset: PortfolioToolsTitlePreset) => onChange({ titlePreset })}
          />
          {tools.titlePreset === 'custom' ? (
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">
                Titre personnalisé
              </span>
              <input
                type="text"
                value={tools.titleCustom}
                onChange={(event) => onChange({ titleCustom: event.target.value })}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
                placeholder="Workflow & Tools"
              />
            </label>
          ) : null}
          <SelectField
            label="Taille des logos"
            value={tools.tileSize}
            options={PORTFOLIO_TOOLS_TILE_SIZE_OPTIONS}
            onChange={(tileSize: PortfolioToolsTileSize) => onChange({ tileSize })}
          />
          <SelectField
            label="Écart entre les cartes"
            value={tools.cardGap ?? 'tight'}
            options={PORTFOLIO_TOOLS_CARD_GAP_OPTIONS}
            onChange={(cardGap: PortfolioToolsCardGap) => onChange({ cardGap })}
          />
          <Toggle
            label={isRichToolsDesign ? 'Afficher le nom' : 'Afficher le nom sous le logo'}
            checked={tools.showLabels !== false}
            onChange={(showLabels) => onChange({ showLabels })}
          />
          <Toggle
            label="Afficher le fond de l'icône"
            checked={tools.iconBackgroundEnabled === true}
            onChange={(iconBackgroundEnabled) => onChange({ iconBackgroundEnabled })}
          />
          {isRichToolsDesign ? (
            <>
              <Toggle
                label="Afficher la description"
                checked={tools.showDescription !== false}
                onChange={(showDescription) => onChange({ showDescription })}
              />
              <Toggle
                label="Afficher les use cases"
                checked={tools.showUseCases !== false}
                onChange={(showUseCases) => onChange({ showUseCases })}
              />
              <Toggle
                label="Afficher le niveau"
                checked={tools.showLevel !== false}
                onChange={(showLevel) => onChange({ showLevel })}
              />
            </>
          ) : null}
          <p className="rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
            {tools.design === 'brand-showcase'
              ? 'Brand showcase : panneau horizontal — logo dans une tuile proportionnée, puis nom / niveau / description / use cases.'
              : tools.design === 'brand-tiles'
                ? 'Brand tiles : grille compacte type réseaux sociaux — icône ronde à gauche, nom en gras à droite, détails optionnels en dessous.'
                : tools.design === 'brand-directory'
                  ? 'Brand directory : lignes éditoriales (logo · détails · niveau), séparateurs fins — style Webflow / Framer.'
                  : tools.design === 'brand-cards'
                    ? 'Brand cards : grille de cartes logo / nom / description / use cases / niveau.'
                    : 'Workflow rail : logos en rangée. Pas de sous-titre. Les outils viennent du profil.'}
          </p>
        </div>
      ) : null}

      {current === 'palette' ? (
        <div className="space-y-4">
          <SectionHeroPaletteToggle
            enabled={tools.useHeroPalette !== false}
            onChange={(useHeroPalette) =>
              onChange(
                (useHeroPalette
                  ? { useHeroPalette, ...applyToolsPaletteToSettings(tools) }
                  : { useHeroPalette }) as Partial<PortfolioToolsSectionSettings>
              )
            }
          />
          {tools.useHeroPalette !== false ? (
            paletteSlots.map((slot) => (
              <label
                key={slot.value}
                className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
              >
                <span className="text-sm font-semibold">{slot.label}</span>
                <span
                  className="h-5 w-5 rounded-full border"
                  style={{ backgroundColor: resolveHeroPaletteColor(palette, bindings[slot.value]) }}
                />
                <select
                  value={bindings[slot.value]}
                  onChange={(event) =>
                    onChange(
                      patchToolsColorBinding(
                        tools,
                        slot.value as ToolsColorSlot,
                        event.target.value as HeroPaletteTokenId
                      ) as Partial<PortfolioToolsSectionSettings>
                    )
                  }
                  className="col-span-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  {PORTFOLIO_HERO_PALETTE_TOKEN_OPTIONS.map((token) => (
                    <option key={token.value} value={token.value}>
                      {token.label}
                    </option>
                  ))}
                </select>
              </label>
            ))
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField label="Titre" value={tools.titleColor} onChange={(titleColor) => onChange({ titleColor })} />
              <ColorField
                label="Fond des tuiles"
                value={tools.tileBackgroundColor}
                onChange={(tileBackgroundColor) => onChange({ tileBackgroundColor })}
              />
              <ColorField label="Noms" value={tools.labelColor} onChange={(labelColor) => onChange({ labelColor })} />
              {isRichToolsDesign ? (
                <>
                  <ColorField
                    label="Description"
                    value={tools.descriptionColor}
                    onChange={(descriptionColor) => onChange({ descriptionColor })}
                  />
                  <ColorField
                    label="Fond cartes"
                    value={tools.cardBackgroundColor}
                    onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
                  />
                  <ColorField
                    label="Bordure / séparateurs"
                    value={tools.cardBorderColor}
                    onChange={(cardBorderColor) => onChange({ cardBorderColor })}
                  />
                  <ColorField
                    label="Fond use cases"
                    value={tools.chipBackgroundColor}
                    onChange={(chipBackgroundColor) => onChange({ chipBackgroundColor })}
                  />
                  <ColorField
                    label="Texte use cases"
                    value={tools.chipTextColor}
                    onChange={(chipTextColor) => onChange({ chipTextColor })}
                  />
                  <ColorField
                    label="Badge niveau"
                    value={tools.levelAccentColor}
                    onChange={(levelAccentColor) => onChange({ levelAccentColor })}
                  />
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {current === 'background' ? (
        <SectionBackgroundSettingsFields settings={tools} onChange={onChange} />
      ) : null}
    </div>
  );
}
