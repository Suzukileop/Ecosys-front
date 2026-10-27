'use client';

import {
  ARDOISE_DARK_HERO_PALETTE,
  ARDOISE_LIGHT_HERO_PALETTE,
  CITRON_DARK_HERO_PALETTE,
  CITRON_LIGHT_HERO_PALETTE,
  DEFAULT_HERO_PALETTE,
  ECARLATE_DARK_HERO_PALETTE,
  ECARLATE_LIGHT_HERO_PALETTE,
  INDIGO_DARK_HERO_PALETTE,
  INDIGO_LIGHT_HERO_PALETTE,
  LIGHT_HERO_PALETTE,
  ROUGE_DARK_HERO_PALETTE,
  ROUGE_LIGHT_HERO_PALETTE,
  SAFRAN_DARK_HERO_PALETTE,
  SAFRAN_LIGHT_HERO_PALETTE,
  VERDANT_DARK_HERO_PALETTE,
  VERDANT_LIGHT_HERO_PALETTE,
  VIVE_DARK_HERO_PALETTE,
  VIVE_LIGHT_HERO_PALETTE,
  type PortfolioHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { NpToggleRow } from '@/components/portfolio/portfolio-nav-panel-ui';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/**
 * A section can follow the site palette (Global → Theme) or use its own: one of the site's palette
 * families, in the section's own light / dark mode. `global` = follow the site.
 */
export type SectionPaletteFamily =
  | 'global'
  | 'indigo'
  | 'classic'
  | 'verdant'
  | 'vive'
  | 'safran'
  | 'citron'
  | 'rouge'
  | 'ecarlate'
  | 'ardoise';

const FAMILIES: {
  value: Exclude<SectionPaletteFamily, 'global'>;
  label: string;
  dark: PortfolioHeroPalette;
  light: PortfolioHeroPalette;
}[] = [
  { value: 'indigo', label: msg('Indigo'), dark: INDIGO_DARK_HERO_PALETTE, light: INDIGO_LIGHT_HERO_PALETTE },
  { value: 'classic', label: msg('Classic'), dark: DEFAULT_HERO_PALETTE, light: LIGHT_HERO_PALETTE },
  { value: 'verdant', label: msg('Verdant'), dark: VERDANT_DARK_HERO_PALETTE, light: VERDANT_LIGHT_HERO_PALETTE },
  { value: 'vive', label: msg('Vivid'), dark: VIVE_DARK_HERO_PALETTE, light: VIVE_LIGHT_HERO_PALETTE },
  { value: 'safran', label: msg('Saffron'), dark: SAFRAN_DARK_HERO_PALETTE, light: SAFRAN_LIGHT_HERO_PALETTE },
  { value: 'citron', label: msg('Ruby'), dark: CITRON_DARK_HERO_PALETTE, light: CITRON_LIGHT_HERO_PALETTE },
  { value: 'rouge', label: msg('Red'), dark: ROUGE_DARK_HERO_PALETTE, light: ROUGE_LIGHT_HERO_PALETTE },
  { value: 'ecarlate', label: msg('Scarlet'), dark: ECARLATE_DARK_HERO_PALETTE, light: ECARLATE_LIGHT_HERO_PALETTE },
  { value: 'ardoise', label: msg('Slate'), dark: ARDOISE_DARK_HERO_PALETTE, light: ARDOISE_LIGHT_HERO_PALETTE },
];

const FAMILY_VALUES: readonly string[] = ['global', ...FAMILIES.map((family) => family.value)];

export function mergeSectionPaletteFamily(value: unknown, fallback: SectionPaletteFamily = 'global'): SectionPaletteFamily {
  return typeof value === 'string' && FAMILY_VALUES.includes(value) ? (value as SectionPaletteFamily) : fallback;
}

/** The family's palette for the given mode, or `null` when the section follows the site. */
export function sectionFamilyPalette(
  family: SectionPaletteFamily | undefined,
  mode: 'light' | 'dark'
): PortfolioHeroPalette | null {
  if (!family || family === 'global') return null;
  const entry = FAMILIES.find((item) => item.value === family);
  return entry ? (mode === 'light' ? entry.light : entry.dark) : null;
}

/**
 * "Palette" block of a section's Background tab: a switch to use an individual palette, and — when
 * on — a dropdown to choose it among the site's palettes, with a four-color preview.
 */
export function SectionPaletteFamilyControl({
  value,
  onChange,
  mode = 'dark',
}: {
  value: SectionPaletteFamily;
  onChange: (value: SectionPaletteFamily) => void;
  /** Light / dark mode the preview is drawn in (the section's own mode). */
  mode?: 'light' | 'dark';
}) {
  const t = useT();
  const enabled = value !== 'global';
  const preview = sectionFamilyPalette(value, mode);
  return (
    <div className="np-stack">
      <NpToggleRow
        title={t('Individual palette')}
        description={t('Pick one of the site palettes for this section only.')}
        checked={enabled}
        onChange={(checked) => onChange(checked ? 'classic' : 'global')}
      />
      {enabled ? (
        <div className="np-field">
          <label className="np-field-label" htmlFor="section-palette-family">
            {t('Palette')}
          </label>
          <select
            id="section-palette-family"
            value={value}
            onChange={(event) => onChange(mergeSectionPaletteFamily(event.target.value, 'classic'))}
            className="np-input"
          >
            {FAMILIES.map((family) => (
              <option key={family.value} value={family.value}>
                {t(family.label)}
              </option>
            ))}
          </select>
          {preview ? (
            <div className="mt-3 flex items-center gap-2" aria-hidden>
              {([preview.fond, preview.neutre, preview.principal, preview.secondaire, preview.texteFort] as string[]).map(
                (color, index) => (
                  <span
                    key={index}
                    className="h-6 w-6 rounded-full shadow-[inset_0_0_0_1px_rgb(128_128_128/0.35)]"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
