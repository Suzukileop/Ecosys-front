'use client';

import type { PortfolioInfoSectionSettings } from '@/components/portfolio/portfolio-info-settings';

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

export function InfoSettingsPanel({
  info,
  onChange,
}: {
  info: PortfolioInfoSectionSettings;
  onChange: (patch: Partial<PortfolioInfoSectionSettings>) => void;
}) {
  return (
    <div className="space-y-4">
      <Toggle
        label="Afficher la section Info"
        checked={info.enabled}
        onChange={(enabled) => onChange({ enabled })}
      />
      <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-600">
        Section Info — placée sous le Hero. Le contenu et les réglages seront ajoutés prochainement.
      </p>
    </div>
  );
}
