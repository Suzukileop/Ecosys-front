'use client';

import {
  PORTFOLIO_SECTION_COLOR_MODE_OPTIONS,
  type PortfolioSectionColorMode,
} from '@/components/portfolio/portfolio-section-color-mode';
import { NpSegmentedControl } from '@/components/portfolio/portfolio-nav-panel-ui';
import { useT } from '@/lib/i18n/I18nProvider';

/**
 * Shared 3-way Auto / Light / Dark control for a section's settings — the Navigation panel's
 * segmented control, since every section panel now sits in that frame.
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
  const t = useT();
  return (
    <NpSegmentedControl
      label={label}
      options={PORTFOLIO_SECTION_COLOR_MODE_OPTIONS.map((option) => ({ value: option.value, label: t(option.label) }))}
      value={value}
      onChange={onChange}
    />
  );
}
