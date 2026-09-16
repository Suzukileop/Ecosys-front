'use client';

import {
  PORTFOLIO_SECTION_COLOR_MODE_OPTIONS,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';

/**
 * Shared 3-way Auto / Light / Dark control for a section's own "General" tab —
 * same visual language (rounded-xl hairline cards) as every other settings panel.
 */
export function SectionColorModeControl({
  value,
  onChange,
  label = 'Appearance',
}: {
  value: PortfolioSectionColorMode;
  onChange: (value: PortfolioSectionColorMode) => void;
  label?: string;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">{label}</span>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {PORTFOLIO_SECTION_COLOR_MODE_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
