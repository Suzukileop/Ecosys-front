'use client';

import { useState } from 'react';
import {
  EXPERIENCE_CARDS_GRID_GAP_PRESET_PX,
  EXPERIENCE_CARDS_GRID_GAP_PX_MAX,
  EXPERIENCE_CARDS_GRID_GAP_PX_MIN,
  PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS,
  PORTFOLIO_EXPERIENCE_CARDS_GRID_GAP_OPTIONS,
  PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS,
  PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS,
  PORTFOLIO_EXPERIENCE_STATUS_PLACEMENT_OPTIONS,
  PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS,
  clampExperienceCardsGridGapPx,
  resolveExperienceCardsGridGapPx,
  type PortfolioExperienceSectionSettings,
} from '@/components/portfolio/portfolio-experience-settings';

export type ExperienceSubSection = 'general' | 'design';

const EXPERIENCE_SUB_SECTIONS: { id: ExperienceSubSection; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Section visibility and how responsibilities are shown.',
  },
  {
    id: 'design',
    label: 'Design',
    description: 'Choose the Experience layout design.',
  },
];

/** Maps any legacy subsection id (media, palette, etc.) to a known Experience subsection. */
export function normalizeExperienceSubSection(value: string | undefined): ExperienceSubSection {
  if (value === 'general' || value === 'design') return value;
  return 'design';
}

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
  const [uncontrolledSubSection, setUncontrolledSubSection] = useState<ExperienceSubSection>('design');
  const subSection = normalizeExperienceSubSection(controlledSubSection ?? uncontrolledSubSection);
  const setSubSection = (value: ExperienceSubSection) => {
    const next = normalizeExperienceSubSection(value);
    onSubSectionChange?.(next);
    if (controlledSubSection === undefined) setUncontrolledSubSection(next);
  };
  const activeMeta =
    EXPERIENCE_SUB_SECTIONS.find((section) => section.id === subSection) ?? EXPERIENCE_SUB_SECTIONS[0];
  const design = experience.experienceDesign;
  const isEditorial = design === 'editorial';
  const isTable = design === 'table';
  const isCards = design === 'cards';
  const showStackLabel = isEditorial || design === 'milestone';

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
          <ExperienceOptionGrid
            label="Tasks display"
            options={PORTFOLIO_EXPERIENCE_TASKS_DISPLAY_OPTIONS}
            value={experience.tasksDisplay ?? 'arrows'}
            onChange={(tasksDisplay) => onChange({ tasksDisplay })}
            columns={2}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ExperienceOptionGrid
            label="Item design"
            options={PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS}
            value={experience.experienceDesign}
            onChange={(experienceDesign) => onChange({ experienceDesign })}
            columns={2}
          />
          {isTable ? (
            <ExperienceToggleRow
              label="Striped rows"
              description="Alternate subtle row backgrounds for easier scanning."
              checked={experience.tableStripedRows === true}
              onChange={(tableStripedRows) => onChange({ tableStripedRows })}
            />
          ) : null}
          {isCards ? (
            <>
              <ExperienceOptionGrid
                label="Card gap"
                options={PORTFOLIO_EXPERIENCE_CARDS_GRID_GAP_OPTIONS}
                value={
                  (experience.cardsGridGap ?? 'md') === 'custom'
                    ? ''
                    : (experience.cardsGridGap ?? 'md')
                }
                onChange={(cardsGridGap) =>
                  onChange({
                    cardsGridGap,
                    cardsGridGapPx: EXPERIENCE_CARDS_GRID_GAP_PRESET_PX[cardsGridGap],
                  })
                }
                columns={4}
              />
              {experience.cardsGridGap === 'custom' ? (
                <p className="text-xs font-medium text-amber-700">
                  Manual mode — pick a preset above to leave custom spacing.
                </p>
              ) : null}
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                    Manual gap (px)
                  </p>
                  <span className="tabular-nums text-sm font-semibold text-neutral-700">
                    {resolveExperienceCardsGridGapPx(experience)}px
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  One value for both the horizontal gutter between columns and the vertical gutter
                  between rows.
                </p>
                <input
                  type="range"
                  min={EXPERIENCE_CARDS_GRID_GAP_PX_MIN}
                  max={EXPERIENCE_CARDS_GRID_GAP_PX_MAX}
                  step={1}
                  value={resolveExperienceCardsGridGapPx(experience)}
                  onChange={(event) => {
                    const px = clampExperienceCardsGridGapPx(Number(event.target.value), 36);
                    onChange({ cardsGridGap: 'custom', cardsGridGapPx: px });
                  }}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Card grid gap in pixels, horizontal and vertical"
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
                  <span>{EXPERIENCE_CARDS_GRID_GAP_PX_MIN}px</span>
                  <span>{EXPERIENCE_CARDS_GRID_GAP_PX_MAX}px</span>
                </div>
              </div>
              <ExperienceOptionGrid
                label="Card border radius"
                options={PORTFOLIO_EXPERIENCE_CARDS_BORDER_RADIUS_OPTIONS}
                value={experience.cardsBorderRadius ?? 'none'}
                onChange={(cardsBorderRadius) => onChange({ cardsBorderRadius })}
                columns={3}
              />
            </>
          ) : null}
          {isEditorial ? (
            <>
              <ExperienceOptionGrid
                label="Entry expand"
                options={PORTFOLIO_EXPERIENCE_ENTRY_EXPAND_MODE_OPTIONS}
                value={experience.entryExpandMode ?? 'accordion'}
                onChange={(entryExpandMode) => onChange({ entryExpandMode })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Period / timeline"
                options={PORTFOLIO_EXPERIENCE_PERIOD_DESIGN_OPTIONS}
                value={experience.periodDesign ?? 'plain'}
                onChange={(periodDesign) => onChange({ periodDesign })}
                columns={2}
              />
              <ExperienceOptionGrid
                label="Status placement"
                options={PORTFOLIO_EXPERIENCE_STATUS_PLACEMENT_OPTIONS}
                value={experience.statusPlacement ?? 'inline'}
                onChange={(statusPlacement) => onChange({ statusPlacement })}
                columns={2}
              />
            </>
          ) : null}
          {showStackLabel ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Stack label
              </label>
              <p className="mt-1 text-sm text-neutral-500">
                Custom heading above the tool tags. Leave empty to use “Stack”.
              </p>
              <input
                type="text"
                value={experience.toolsLabel}
                onChange={(event) => onChange({ toolsLabel: event.target.value })}
                placeholder="Stack"
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm font-medium text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
