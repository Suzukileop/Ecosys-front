'use client';

import type { ReactNode } from 'react';
import {
  PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS,
  type PortfolioSectionBackgroundFill,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import { PortfolioBackgroundImageUpload } from '@/components/portfolio/portfolio-background-image-upload';
import {
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS,
  PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS,
} from '@/components/portfolio/portfolio-global-settings';

function ToggleRow({
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
    return <>{render({ label, value, onChange })}</>;
  }
  return <DefaultColorField label={label} value={value} onChange={onChange} />;
}

/** Fixed neutral spread — light to dark, pairs cleanly with any accent palette. No free-form
 *  hex input: pick a swatch, that's it. */
const BACKGROUND_COLOR_PRESETS: { hex: string; label: string }[] = [
  { hex: '#FFFFFF', label: 'Blanc' },
  { hex: '#F5F5F5', label: 'Clair' },
  { hex: '#171717', label: 'Sombre' },
  { hex: '#0A0A0A', label: 'Noir' },
];

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
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {BACKGROUND_COLOR_PRESETS.map((preset) => {
          const active = preset.hex.toLowerCase() === activeHex;
          return (
            <button
              key={preset.hex}
              type="button"
              onClick={() => onChange(preset.hex)}
              aria-pressed={active}
              aria-label={preset.label}
              title={preset.label}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition ${
                active ? 'ring-2 ring-neutral-900 ring-offset-2' : 'hover:bg-neutral-100'
              }`}
            >
              <span
                className="h-9 w-9 rounded-full border border-neutral-200/80 shadow-inner"
                style={{ backgroundColor: preset.hex }}
              />
              <span className="text-[11px] font-medium text-neutral-500">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
  compact = false,
}: {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
  /** Labels only, tight pill row — no per-option description text. */
  compact?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div
        className={
          compact
            ? 'mt-3 grid grid-cols-3 gap-2'
            : `mt-3 grid gap-2 ${columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`
        }
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={
                compact
                  ? `rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300'
                    }`
                  : `rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:bg-neutral-50/80'
                    }`
              }
            >
              <p className={compact ? '' : 'text-sm font-semibold text-neutral-950'}>{option.label}</p>
              {!compact && option.description ? (
                <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OpacitySlider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
        <span className="text-sm font-semibold text-neutral-700">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
      />
    </div>
  );
}

export type GradientOrientation = 'horizontal' | 'vertical' | 'diagonal';

export const GRADIENT_ORIENTATION_ANGLE: Record<GradientOrientation, number> = {
  horizontal: 90,
  vertical: 180,
  diagonal: 135,
};

export const GRADIENT_ORIENTATION_OPTIONS: { value: GradientOrientation; label: string }[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'diagonal', label: 'Diagonal' },
];

/** The stored value is still a free angle (for older data) — snap it to whichever of the 3
 *  orientation presets it's closest to, purely for display; picking a preset writes the exact angle. */
export function gradientOrientationFromAngle(angle: number): GradientOrientation {
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
  { value: 'y', label: 'Horizontal' },
  { value: 'x', label: 'Vertical' },
];

/** Fill type (solid / gradient / split / image), the relevant color(s) or uploaded photo, a
 *  compact orientation/direction/size/position picker per fill, and opacity. No explanatory
 *  copy, no preview swatch, no split-divider sub-controls. */
export function SectionBackgroundFillControls({
  settings,
  onChange,
  renderColorField,
}: {
  settings: PortfolioSectionBackgroundSettings;
  onChange: (patch: Partial<PortfolioSectionBackgroundSettings>) => void;
  renderColorField?: BackgroundColorFieldRenderer;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <OptionGrid
        label="Fill type"
        options={PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS}
        value={settings.sectionBackgroundFill}
        onChange={(sectionBackgroundFill) => onChange({ sectionBackgroundFill })}
        compact
      />

      {settings.sectionBackgroundFill === 'gradient' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Gradient start"
              value={settings.sectionBackgroundGradientFrom}
              onChange={(sectionBackgroundGradientFrom) => onChange({ sectionBackgroundGradientFrom })}
              render={renderColorField}
            />
            <ColorField
              label="Gradient end"
              value={settings.sectionBackgroundGradientTo}
              onChange={(sectionBackgroundGradientTo) => onChange({ sectionBackgroundGradientTo })}
              render={renderColorField}
            />
          </div>
          <OptionGrid
            label="Orientation"
            options={GRADIENT_ORIENTATION_OPTIONS}
            value={gradientOrientationFromAngle(settings.sectionBackgroundGradientAngle)}
            onChange={(orientation) =>
              onChange({ sectionBackgroundGradientAngle: GRADIENT_ORIENTATION_ANGLE[orientation] })
            }
            compact
          />
        </>
      ) : settings.sectionBackgroundFill === 'split' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Color A"
              value={settings.sectionBackgroundColorA}
              onChange={(sectionBackgroundColorA) => onChange({ sectionBackgroundColorA })}
              render={renderColorField}
            />
            <ColorField
              label="Color B"
              value={settings.sectionBackgroundColorB}
              onChange={(sectionBackgroundColorB) => onChange({ sectionBackgroundColorB })}
              render={renderColorField}
            />
          </div>
          <OptionGrid
            label="Direction"
            options={SPLIT_DIRECTION_OPTIONS}
            value={settings.sectionBackgroundSplitAxis}
            onChange={(sectionBackgroundSplitAxis) => onChange({ sectionBackgroundSplitAxis })}
            compact
          />
        </>
      ) : settings.sectionBackgroundFill === 'image' ? (
        <>
          <PortfolioBackgroundImageUpload
            url={settings.sectionBackgroundImageUrl}
            onChange={(sectionBackgroundImageUrl) => onChange({ sectionBackgroundImageUrl })}
            label="Background image"
          />
          <OptionGrid
            label="Image size"
            options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_SIZE_OPTIONS}
            value={settings.sectionBackgroundImageSize}
            onChange={(sectionBackgroundImageSize) => onChange({ sectionBackgroundImageSize })}
            compact
          />
          <OptionGrid
            label="Image position"
            options={PORTFOLIO_GLOBAL_BACKGROUND_IMAGE_POSITION_OPTIONS}
            value={settings.sectionBackgroundImagePosition}
            onChange={(sectionBackgroundImagePosition) => onChange({ sectionBackgroundImagePosition })}
            compact
          />
        </>
      ) : (
        <ColorField
          label="Color"
          value={settings.sectionBackgroundColor}
          onChange={(sectionBackgroundColor) => onChange({ sectionBackgroundColor })}
          render={renderColorField}
        />
      )}

      <OpacitySlider
        label="Opacity"
        value={settings.sectionBackgroundOpacity}
        onChange={(sectionBackgroundOpacity) => onChange({ sectionBackgroundOpacity })}
      />

      <ToggleRow
        label="Top/bottom fade"
        description="Softens the background into the next section instead of a hard cut."
        checked={settings.sectionBackgroundEdgeFade}
        onChange={(sectionBackgroundEdgeFade) => onChange({ sectionBackgroundEdgeFade })}
      />
    </div>
  );
}

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
  return (
    <div className="space-y-4">
      <ToggleRow
        label="Enable section background"
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

export type { PortfolioSectionBackgroundFill };
