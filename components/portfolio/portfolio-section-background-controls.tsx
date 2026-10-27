'use client';

import { ColorSwatchRow } from '@/components/portfolio/portfolio-color-swatch-row';
import { BackgroundSwatchesContext } from './portfolio-background-swatches';
import { useId, type ReactNode } from 'react';
import { PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS, type PortfolioSectionBackgroundSettings } from '@/components/portfolio/portfolio-section-background-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';
import {
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-global-settings';
import { NpRangeField, NpSegmentedControl, NpToggleRow } from '@/components/portfolio/portfolio-nav-panel-ui';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/*
 * Every section panel now sits in the Navigation-style frame (NpPanelShell), so these fields are
 * drawn with its building blocks: switches, segmented choices, chips and the range slider.
 */

type BackgroundColorFieldRenderer = (props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => ReactNode;

function ColorField({
  label,
  value,
  onChange,
  render,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  render?: BackgroundColorFieldRenderer;
}) {
  if (render) {
    return <BackgroundSwatchesContext.Provider value={true}>{render({ label, value, onChange })}</BackgroundSwatchesContext.Provider>;
  }
  return <BackgroundSwatchesContext.Provider value={true}><DefaultColorField label={label} value={value} onChange={onChange} /></BackgroundSwatchesContext.Provider>;
}

/** Fixed neutral spread — light to dark, pairs cleanly with any accent palette. No free-form
 *  hex input: pick a swatch, that's it. */
const BACKGROUND_COLOR_PRESETS: { hex: string; label: string }[] = [
  { hex: '#FFFFFF', label: msg('Blanc') },
  { hex: '#F5F5F5', label: msg('Clair') },
  { hex: '#171717', label: msg('Sombre') },
  { hex: '#0A0A0A', label: msg('Noir') },
];

/** The presets as chips, each with its colour dot. */
function DefaultColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
      const activeHex = value.trim().toLowerCase();
  return (
    <ColorSwatchRow
      label={label}
      options={BACKGROUND_COLOR_PRESETS.map((preset) => ({ value: preset.hex, label: preset.label, color: preset.hex }))}
      value={BACKGROUND_COLOR_PRESETS.find((preset) => preset.hex.toLowerCase() === activeHex)?.hex ?? ''}
      onChange={onChange}
    />
  );
}

/** One-line segmented choice; five options or more wrap as chips instead. */
function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const t = useT();
  const id = useId();
  if (options.length < 5) {
    return (
      <NpSegmentedControl
        label={label}
        options={options.map((option) => ({ value: option.value, label: t(option.label) }))}
        value={value}
        onChange={onChange}
      />
    );
  }
  return (
    <div className="np-field">
      <p id={id} className="np-field-label">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="np-chips">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
            className="np-chip"
          >
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
  );
}

type GradientOrientation = 'horizontal' | 'vertical' | 'diagonal';

const GRADIENT_ORIENTATION_ANGLE: Record<GradientOrientation, number> = {
  horizontal: 90,
  vertical: 180,
  diagonal: 135,
};

const GRADIENT_ORIENTATION_OPTIONS: { value: GradientOrientation; label: string }[] = [
  { value: 'horizontal', label: msg('Horizontal') },
  { value: 'vertical', label: msg('Vertical') },
  { value: 'diagonal', label: msg('Diagonal') },
];

/** The stored value is still a free angle (for older data) — snap it to whichever of the 3
 *  orientation presets it's closest to, purely for display; picking a preset writes the exact angle. */
function gradientOrientationFromAngle(angle: number): GradientOrientation {
  let closest: GradientOrientation = 'diagonal';
  let closestDiff = Infinity;
  (Object.keys(GRADIENT_ORIENTATION_ANGLE) as GradientOrientation[]).forEach((key) => {
    const diff = Math.abs(GRADIENT_ORIENTATION_ANGLE[key] - angle);
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = key;
    }
  });
  return closest;
}

const SPLIT_DIRECTION_OPTIONS: { value: PortfolioSectionBackgroundSettings['sectionBackgroundSplitAxis']; label: string }[] = [
  { value: 'y', label: msg('Horizontal') },
  { value: 'x', label: msg('Vertical') },
];

/** Fill type (solid / gradient / split / image), the relevant color(s) or uploaded photo, a
 *  compact orientation/direction/size/position picker per fill, and opacity. No explanatory
 *  copy, no preview swatch, no split-divider sub-controls. */
function SectionBackgroundFillControls({
  settings,
  onChange,
  renderColorField,
}: {
  settings: PortfolioSectionBackgroundSettings;
  onChange: (patch: Partial<PortfolioSectionBackgroundSettings>) => void;
  renderColorField?: BackgroundColorFieldRenderer;
}) {
  const t = useT();
  return (
    <>
      <OptionGrid
        label={t('Fill type')}
        options={PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS}
        value={settings.sectionBackgroundFill}
        onChange={(sectionBackgroundFill) => onChange({ sectionBackgroundFill })}
      />

      {settings.sectionBackgroundFill === 'gradient' ? (
        <>
          <ColorField
            label={t('Gradient start')}
            value={settings.sectionBackgroundGradientFrom}
            onChange={(sectionBackgroundGradientFrom) => onChange({ sectionBackgroundGradientFrom })}
            render={renderColorField}
          />
          <ColorField
            label={t('Gradient end')}
            value={settings.sectionBackgroundGradientTo}
            onChange={(sectionBackgroundGradientTo) => onChange({ sectionBackgroundGradientTo })}
            render={renderColorField}
          />
          <OptionGrid
            label={t('Orientation')}
            options={GRADIENT_ORIENTATION_OPTIONS}
            value={gradientOrientationFromAngle(settings.sectionBackgroundGradientAngle)}
            onChange={(orientation) =>
              onChange({ sectionBackgroundGradientAngle: GRADIENT_ORIENTATION_ANGLE[orientation] })
            }
          />
        </>
      ) : settings.sectionBackgroundFill === 'split' ? (
        <>
          <ColorField
            label={t('Color A')}
            value={settings.sectionBackgroundColorA}
            onChange={(sectionBackgroundColorA) => onChange({ sectionBackgroundColorA })}
            render={renderColorField}
          />
          <ColorField
            label={t('Color B')}
            value={settings.sectionBackgroundColorB}
            onChange={(sectionBackgroundColorB) => onChange({ sectionBackgroundColorB })}
            render={renderColorField}
          />
          <OptionGrid
            label={t('Direction')}
            options={SPLIT_DIRECTION_OPTIONS}
            value={settings.sectionBackgroundSplitAxis}
            onChange={(sectionBackgroundSplitAxis) => onChange({ sectionBackgroundSplitAxis })}
          />
        </>
      ) : settings.sectionBackgroundFill === 'image' ? (
        <>
          <PortfolioBackgroundImageUpload
            url={settings.sectionBackgroundImageUrl}
            onChange={(sectionBackgroundImageUrl) => onChange({ sectionBackgroundImageUrl })}
            label={t('Background image')}
          />
          <OptionGrid
            label={t('Image size')}
            options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS}
            value={settings.sectionBackgroundImageSize}
            onChange={(sectionBackgroundImageSize) => onChange({ sectionBackgroundImageSize })}
          />
          <OptionGrid
            label={t('Image position')}
            options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS}
            value={settings.sectionBackgroundImagePosition}
            onChange={(sectionBackgroundImagePosition) => onChange({ sectionBackgroundImagePosition })}
          />
        </>
      ) : (
        <ColorField
          label={t('Color')}
          value={settings.sectionBackgroundColor}
          onChange={(sectionBackgroundColor) => onChange({ sectionBackgroundColor })}
          render={renderColorField}
        />
      )}

      <NpRangeField
        label={t('Opacity')}
        value={settings.sectionBackgroundOpacity}
        min={0}
        max={100}
        unit="%"
        onChange={(sectionBackgroundOpacity) => onChange({ sectionBackgroundOpacity })}
      />

      <NpToggleRow
        title={t('Top/bottom fade')}
        description={t('Softens the background into the next section instead of a hard cut.')}
        checked={settings.sectionBackgroundEdgeFade}
        onChange={(sectionBackgroundEdgeFade) => onChange({ sectionBackgroundEdgeFade })}
      />
    </>
  );
}

/** The section's background: on/off, then the fill controls. Lays out as a flat column — the host
 *  places it in a collapsible section. */
export function SectionBackgroundSettingsFields({
  settings,
  onChange,
  renderColorField,
}: {
  settings: PortfolioSectionBackgroundSettings;
  onChange: (patch: Partial<PortfolioSectionBackgroundSettings>) => void;
  /** Accepted for backward compatibility with existing callers — no longer rendered
   *  (no header copy above the fill-type picker). */
  title?: string;
  description?: string;
  /** Not wired here — a per-section image fill is a single uploaded photo (see the Image
   *  fill type), not a reusable library like the Global page background's. Accepted for
   *  backward compatibility with existing callers only. */
  imageLibrary?: string[];
  onImageLibraryChange?: (urls: string[]) => void;
  renderColorField?: BackgroundColorFieldRenderer;
}) {
  const t = useT();
  return (
    <div className="flex flex-col gap-[30px]">
      <NpToggleRow
        title={t('Enable section background')}
        checked={settings.sectionBackgroundEnabled}
        onChange={(sectionBackgroundEnabled) => onChange({ sectionBackgroundEnabled })}
      />
      {settings.sectionBackgroundEnabled ? (
        <SectionBackgroundFillControls
          settings={settings}
          onChange={onChange}
          renderColorField={renderColorField}
        />
      ) : null}
    </div>
  );
}
