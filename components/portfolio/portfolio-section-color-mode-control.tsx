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
      <p className="pf-stack-block-label pf-stack-option-label">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="pf-stack-segment grid grid-cols-3 gap-[3px] p-[3px]"
        data-compact="true"
      >
        {PORTFOLIO_SECTION_COLOR_MODE_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              data-active={active ? 'true' : 'false'}
              className="pf-stack-segment-btn flex items-center justify-center px-2.5 py-1.5 text-center text-[13px] font-medium tracking-tight"
            >
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
