'use client';

import { HeaderSteppedSlider } from '@/components/portfolio/portfolio-header-style-controls';
import { useT } from '@/lib/i18n/I18nProvider';

/** Short tick captions of the premium font-size scale, in order. */
const TICKS: Record<string, string> = { small: 'S', medium: 'M', large: 'L', xlarge: 'XL', xxlarge: 'XXL' };
export const SECTION_TEXT_SIZE_OPTIONS = [
  {value:'small',label:'Small'}, {value:'medium',label:'Medium'},
  {value:'large',label:'Large'}, {value:'xlarge',label:'Extra large'},
] as const;

/**
 * The one "Text size" control of every section's General / Style tab: a stepped bar (S → XXL)
 * instead of a grid of word buttons, with the chosen size named next to the label.
 */
export function TextSizeSlider<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useT();
  const steps = options.map((option) => ({ value: option.value, tick: TICKS[option.value] ?? t(option.label) }));
  const current = options.find((option) => option.value === value) ?? options[0]!;
  return (
    <div className="np-text-size-slider">
    <HeaderSteppedSlider
      label={label}
      steps={steps}
      value={current.value}
      currentName={t(current.label)}
      onChange={onChange}
    />
    </div>
  );
}
