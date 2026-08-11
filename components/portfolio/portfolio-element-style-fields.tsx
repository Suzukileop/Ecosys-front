'use client';

import type { ReactNode } from 'react';
import {
  ELEMENT_TEXT_SIZE_PRESET_PX,
  ELEMENT_TEXT_SIZE_PX_MAX,
  ELEMENT_TEXT_SIZE_PX_MIN,
  ELEMENT_TEXT_WEIGHT_AMOUNT_MAX,
  ELEMENT_TEXT_WEIGHT_AMOUNT_MIN,
  ELEMENT_TEXT_WEIGHT_AMOUNT_STEP,
  ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT,
  PORTFOLIO_ELEMENT_FONT_OPTIONS,
  PORTFOLIO_ELEMENT_TEXT_DECORATION_OPTIONS,
  PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS,
  PORTFOLIO_ELEMENT_TEXT_WEIGHT_OPTIONS,
  clampElementTextSizePx,
  clampElementTextWeightAmount,
  resolveElementTextSizePx,
  resolveElementTextWeightAmount,
  type PortfolioElementTextRole,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

function StyleToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-white px-4 py-3.5">
      <span className="text-sm font-semibold text-neutral-950">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900"
      />
    </label>
  );
}

function StyleOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T | '';
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                  : 'border-neutral-200/80 bg-white hover:border-neutral-300'
              }`}
            >
              <p className="text-sm font-semibold text-neutral-950">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StyleColorField({
  label,
  value,
  onChange,
  render,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  render?: (props: { label: string; value: string; onChange: (value: string) => void }) => ReactNode;
}) {
  if (render) {
    return <>{render({ label, value, onChange })}</>;
  }
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={isValidProfileHexColor(value) ? value : '#525252'}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 font-mono text-sm text-neutral-900"
        />
      </div>
    </div>
  );
}

export function PortfolioElementStyleFields({
  targets,
  activeTarget,
  onTargetChange,
  style,
  onStyleChange,
  extra,
  hideTargetPicker = false,
  hideUppercase = false,
  showDecoration = false,
  title,
  textRole = 'body',
  renderColorField,
  renderDarkColorField,
  showDarkColor = false,
}: {
  targets: { value: string; label: string; description: string }[];
  activeTarget: string;
  onTargetChange: (value: string) => void;
  style: PortfolioElementTextStyle;
  onStyleChange: (patch: Partial<PortfolioElementTextStyle>) => void;
  extra?: ReactNode;
  /** When true, skip the multi-target picker (single element already known). */
  hideTargetPicker?: boolean;
  /** Hide the Uppercase toggle (e.g. headline prefix — casing comes from the typed text). */
  hideUppercase?: boolean;
  /** Show underline / highlight decoration controls (headline emphasis word). */
  showDecoration?: boolean;
  /** Optional heading above the typography fields. */
  title?: string;
  /** Role used for Manual size preset px mapping (title / body / label). */
  textRole?: PortfolioElementTextRole;
  renderColorField?: (props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => ReactNode;
  /** Optional separate dark-mode color field (manual palette-off mode). */
  renderDarkColorField?: (props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) => ReactNode;
  /** When false, hide the dark color picker (palette mode). Default true. */
  showDarkColor?: boolean;
}) {
  const showDark = showDarkColor !== false;
  const sizePresets = ELEMENT_TEXT_SIZE_PRESET_PX[textRole];
  const resolvedSizePx = resolveElementTextSizePx(style.size, style.sizePx, textRole);
  const resolvedWeightAmount = resolveElementTextWeightAmount(style.weight, style.weightAmount);
  const sizeGridValue = style.size === 'custom' ? ('' as const) : style.size;
  const weightValue = style.weight ?? (style.bold ? 'bold' : 'normal');
  const weightGridValue = weightValue === 'custom' ? ('' as const) : weightValue;

  return (
    <div className="space-y-6">
      {title ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
        </div>
      ) : null}

      {!hideTargetPicker ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Element</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {targets.map((target) => {
              const active = activeTarget === target.value;
              return (
                <button
                  key={target.value}
                  type="button"
                  onClick={() => onTargetChange(target.value)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-neutral-900 bg-neutral-50 ring-2 ring-neutral-900/10'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-neutral-950">{target.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">{target.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <StyleColorField
        label={showDark ? 'Color (light)' : 'Color'}
        value={style.color}
        onChange={(color) => onStyleChange({ color })}
        render={renderColorField}
      />

      {showDark ? (
        <StyleColorField
          label="Color (dark)"
          value={style.colorDark || style.color}
          onChange={(colorDark) => onStyleChange({ colorDark })}
          render={renderDarkColorField ?? renderColorField}
        />
      ) : null}

      <StyleOptionGrid
        label="Font"
        options={PORTFOLIO_ELEMENT_FONT_OPTIONS}
        value={style.font}
        onChange={(font) => onStyleChange({ font })}
      />

      <StyleOptionGrid
        label="Size"
        options={PORTFOLIO_ELEMENT_TEXT_SIZE_OPTIONS}
        value={sizeGridValue}
        onChange={(size) =>
          onStyleChange({
            size,
            sizePx: sizePresets[size],
          })
        }
      />
      {style.size === 'custom' ? (
        <p className="text-xs font-medium text-amber-700">
          Mode manuel actif — choisis un preset ci-dessus pour quitter Manual.
        </p>
      ) : null}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Manual size (px)
          </p>
          <span className="tabular-nums text-sm font-semibold text-neutral-700">
            {resolvedSizePx}px
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Taille exacte du texte en pixels — titre et description réglables indépendamment.
        </p>
        <input
          type="range"
          min={ELEMENT_TEXT_SIZE_PX_MIN}
          max={ELEMENT_TEXT_SIZE_PX_MAX}
          step={1}
          value={resolvedSizePx}
          onChange={(event) => {
            const px = clampElementTextSizePx(Number(event.target.value), sizePresets.md);
            onStyleChange({ size: 'custom', sizePx: px });
          }}
          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
          aria-label="Manual text size in pixels"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>{ELEMENT_TEXT_SIZE_PX_MIN}px</span>
          <span>{ELEMENT_TEXT_SIZE_PX_MAX}px</span>
        </div>
      </div>

      <StyleOptionGrid
        label="Weight"
        options={PORTFOLIO_ELEMENT_TEXT_WEIGHT_OPTIONS}
        value={weightGridValue}
        onChange={(weight) =>
          onStyleChange({
            weight,
            weightAmount: ELEMENT_TEXT_WEIGHT_PRESET_AMOUNT[weight],
            bold: weight === 'bold' || weight === 'semibold',
          })
        }
      />
      {weightValue === 'custom' ? (
        <p className="text-xs font-medium text-amber-700">
          Mode manuel actif — choisis un preset ci-dessus pour quitter Manual.
        </p>
      ) : null}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
            Manual weight
          </p>
          <span className="tabular-nums text-sm font-semibold text-neutral-700">
            {resolvedWeightAmount}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">Graisse exacte du texte (100–900).</p>
        <input
          type="range"
          min={ELEMENT_TEXT_WEIGHT_AMOUNT_MIN}
          max={ELEMENT_TEXT_WEIGHT_AMOUNT_MAX}
          step={ELEMENT_TEXT_WEIGHT_AMOUNT_STEP}
          value={resolvedWeightAmount}
          onChange={(event) => {
            const amount = clampElementTextWeightAmount(Number(event.target.value));
            onStyleChange({
              weight: 'custom',
              weightAmount: amount,
              bold: amount >= 600,
            });
          }}
          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
          aria-label="Manual text weight"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>Fin</span>
          <span>Épais</span>
        </div>
      </div>

      <div className="space-y-2">
        <StyleToggleRow label="Italic" checked={style.italic} onChange={(italic) => onStyleChange({ italic })} />
        {!hideUppercase ? (
          <StyleToggleRow
            label="Uppercase"
            checked={style.uppercase}
            onChange={(uppercase) => onStyleChange({ uppercase })}
          />
        ) : null}
      </div>

      {showDecoration ? (
        <div className="space-y-4">
          <StyleOptionGrid
            label="Decoration"
            options={PORTFOLIO_ELEMENT_TEXT_DECORATION_OPTIONS}
            value={style.decoration}
            onChange={(decoration) => onStyleChange({ decoration })}
          />
          {style.decoration === 'highlight' ? (
            <StyleColorField
              label="Highlight color"
              value={style.highlightColor}
              onChange={(highlightColor) => onStyleChange({ highlightColor })}
              render={renderColorField}
            />
          ) : null}
        </div>
      ) : null}

      {extra}
    </div>
  );
}
