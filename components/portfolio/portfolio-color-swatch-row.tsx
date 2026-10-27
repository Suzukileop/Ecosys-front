'use client';

import { SV_TEXT_FAINT, SV_TEXT_STRONG, SvSwatches } from '@/components/portfolio/portfolio-settings-variants';
import { useT } from '@/lib/i18n/I18nProvider';
import { useContext } from 'react';
import { BackgroundSwatchesContext, organizeBackgroundSwatches } from './portfolio-background-swatches';

/**
 * The one way a color choice is shown in a settings panel: a row of equal tiles holding only the
 * color (no "Primary / Secondary" captions), with the label on the left and the chosen color's
 * name on the right — same look as Cards → Border color. `auto` options draw a dashed dot.
 */
export type ColorSwatchOption = { value: string; label: string; color: string; auto?: boolean };

export function ColorSwatchRow({
  label,
  options,
  value,
  onChange,
  showValueName = true,
}: {
  label: string;
  options: readonly ColorSwatchOption[];
  value: string;
  onChange: (value: string) => void;
  showValueName?: boolean;
}) {
  const t = useT();
  const background = useContext(BackgroundSwatchesContext);
  const displayed = background ? organizeBackgroundSwatches(options, value, t) : { options, value };
  const current = displayed.options.find((option) => option.value === displayed.value);
  return (
    <div className="py-2">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className={`text-[14px] font-semibold ${SV_TEXT_STRONG}`}>{label}</span>
        {showValueName && current ? <span className={`text-[13px] ${SV_TEXT_FAINT}`}>{t(current.label)}</span> : null}
      </div>
      <SvSwatches label={label} density="regular" options={displayed.options} value={displayed.value} onChange={onChange} />
    </div>
  );
}
