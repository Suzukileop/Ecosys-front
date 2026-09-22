'use client';

import { SectionColorModeControl } from '@/components/portfolio/portfolio-section-color-mode-control';
import {
  PORTFOLIO_TEAM_GAP_OPTIONS,
  PORTFOLIO_TEAM_LAYOUT_OPTIONS,
  type PortfolioTeamSectionSettings,
} from '@/components/portfolio/portfolio-team-settings';

/** Team's settings were trimmed down to just General — every other subsection (Header, Cards,
 *  Images, Socials, Palette, Background) was removed at the user's request. Kept as a union
 *  (rather than a plain string) and normalized the same way every other section's subsection
 *  type is, so `PortfolioSettingsModal`'s shared subSection plumbing keeps working unchanged. */
export type TeamSubSection = 'general';

export function normalizeTeamSubSection(_value: string | undefined): TeamSubSection {
  return 'general';
}

function SelectField<T extends string | number>({
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
          const option = options.find((item) => String(item.value) === event.target.value);
          if (option) onChange(option.value);
        }}
        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900"
      >
        {options.map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
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
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4" />
    </label>
  );
}

export function TeamSettingsPanel({
  team,
  onChange,
}: {
  team: PortfolioTeamSectionSettings;
  onChange: (patch: Partial<PortfolioTeamSectionSettings>) => void;
  /** Kept for API parity with every other section's settings panel (PortfolioSettingsModal's
   *  shared subSection plumbing passes these unconditionally) — General is Team's only
   *  subsection now, so there's nothing left to switch between. */
  subSection?: TeamSubSection;
  onSubSectionChange?: (value: TeamSubSection) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <Toggle label="Afficher la section" checked={team.enabled} onChange={(enabled) => onChange({ enabled })} />
        <SectionColorModeControl
          value={team.colorModeOverride}
          onChange={(colorModeOverride) => onChange({ colorModeOverride })}
        />
        <div className="grid gap-3">
          {PORTFOLIO_TEAM_LAYOUT_OPTIONS.map((layout) => (
            <button
              key={layout.value}
              type="button"
              onClick={() => onChange({ layout: layout.value })}
              className={`rounded-2xl border p-4 text-left ${team.layout === layout.value ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10' : 'border-neutral-200 bg-white'}`}
            >
              <span className="block text-sm font-bold text-neutral-950">{layout.label}</span>
              <span className="mt-1 block text-xs text-neutral-500">{layout.description}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Colonnes" value={team.columns} options={[1, 2, 3, 4].map((value) => ({ value: value as 1 | 2 | 3 | 4, label: String(value) }))} onChange={(columns) => onChange({ columns })} />
          <SelectField label="Espacement" value={team.gap} options={PORTFOLIO_TEAM_GAP_OPTIONS} onChange={(gap) => onChange({ gap })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="Afficher les noms" checked={team.showName} onChange={(showName) => onChange({ showName })} />
          <Toggle label="Afficher les rôles" checked={team.showResponsibility} onChange={(showResponsibility) => onChange({ showResponsibility })} />
          <Toggle label="Afficher les images" checked={team.showImage} onChange={(showImage) => onChange({ showImage })} />
          <Toggle label="Afficher les réseaux" checked={team.showSocials} onChange={(showSocials) => onChange({ showSocials })} />
        </div>
      </div>
    </div>
  );
}
