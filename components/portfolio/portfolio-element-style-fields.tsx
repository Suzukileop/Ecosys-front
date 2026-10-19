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
import { useT } from '@/lib/i18n/I18nProvider';

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
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[color:var(--np-card-border)] bg-[color:var(--np-card)] px-4 py-3.5">
      <span className="text-sm font-semibold text-[color:var(--np-text)]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded accent-[color:var(--np-accent)]"
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">{label}</p>
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
                  ? 'border-[color:var(--np-accent)] bg-[color:var(--np-card)] ring-2 ring-[color:var(--np-accent-soft)]'
                  : 'border-[color:var(--np-card-border)] bg-[color:var(--np-card)] hover:border-[color:var(--np-illus-strong)]'
              }`}
            >
              <p className="text-sm font-semibold text-[color:var(--np-text)]">{option.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--np-muted)]">{option.description}</p>
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={isValidProfileHexColor(value) ? value : '#525252'}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-[color:var(--np-well-border)] bg-[color:var(--np-well)] p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-28 rounded-xl border border-[color:var(--np-well-border)] bg-[color:var(--np-well)] px-3 py-2.5 font-mono text-sm text-[color:var(--np-text)]"
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
  hideFontPicker = true,
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
  /** Per-element typeface is retired — Global → Police principale owns family. */
  hideFontPicker?: boolean;
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
  const t = useT();
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">{title}</p>
        </div>
      ) : null}

      {!hideTargetPicker ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">{t('Element')}</p>
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
                      ? 'border-[color:var(--np-accent)] bg-[color:var(--np-card)] ring-2 ring-[color:var(--np-accent-soft)]'
                      : 'border-[color:var(--np-card-border)] bg-[color:var(--np-card)] hover:border-[color:var(--np-illus-strong)]'
                  }`}
                >
                  <p className="text-sm font-semibold text-[color:var(--np-text)]">{target.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--np-muted)]">{target.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <StyleColorField
        label={showDark ? t('Color (light)') : t('Color')}
        value={style.color}
        onChange={(color) => onStyleChange({ color })}
        render={renderColorField}
      />

      {showDark ? (
        <StyleColorField
          label={t('Color (dark)')}
          value={style.colorDark || style.color}
          onChange={(colorDark) => onStyleChange({ colorDark })}
          render={renderDarkColorField ?? renderColorField}
        />
      ) : null}

      {hideFontPicker ? null : (
        <StyleOptionGrid
          label={t('Font')}
          options={PORTFOLIO_ELEMENT_FONT_OPTIONS}
          value={style.font}
          onChange={(font) => onStyleChange({ font })}
        />
      )}

      <StyleOptionGrid
        label={t('Size')}
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
          {t('Mode manuel actif — choisis un preset ci-dessus pour quitter Manual.')}
        </p>
      ) : null}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">
            {t('Manual size (px)')}
          </p>
          <span className="tabular-nums text-sm font-semibold text-[color:var(--np-label)]">
            {t('{resolvedSizePx}px', { resolvedSizePx })}
          </span>
        </div>
        <p className="mt-1 text-sm text-[color:var(--np-muted)]">
          {t('Taille exacte du texte en pixels — titre et description réglables indépendamment.')}
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
          className="mt-3 h-2 w-full cursor-pointer accent-[color:var(--np-accent)]"
          aria-label={t('Manual text size in pixels')}
        />
        <div className="mt-1 flex justify-between text-[11px] text-[color:var(--np-muted)]">
          <span>{t('{ELEMENTTEXTSIZEPXMIN}px', { ELEMENTTEXTSIZEPXMIN: ELEMENT_TEXT_SIZE_PX_MIN })}</span>
          <span>{t('{ELEMENTTEXTSIZEPXMAX}px', { ELEMENTTEXTSIZEPXMAX: ELEMENT_TEXT_SIZE_PX_MAX })}</span>
        </div>
      </div>

      <StyleOptionGrid
        label={t('Weight')}
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
          {t('Mode manuel actif — choisis un preset ci-dessus pour quitter Manual.')}
        </p>
      ) : null}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--np-muted)]">
            {t('Manual weight')}
          </p>
          <span className="tabular-nums text-sm font-semibold text-[color:var(--np-label)]">
            {resolvedWeightAmount}
          </span>
        </div>
        <p className="mt-1 text-sm text-[color:var(--np-muted)]">{t('Graisse exacte du texte (100–900).')}</p>
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
          className="mt-3 h-2 w-full cursor-pointer accent-[color:var(--np-accent)]"
          aria-label={t('Manual text weight')}
        />
        <div className="mt-1 flex justify-between text-[11px] text-[color:var(--np-muted)]">
          <span>{t('Fin')}</span>
          <span>{t('Épais')}</span>
        </div>
      </div>

      <div className="space-y-2">
        <StyleToggleRow label={t('Italic')} checked={style.italic} onChange={(italic) => onStyleChange({ italic })} />
        {!hideUppercase ? (
          <StyleToggleRow
            label={t('Uppercase')}
            checked={style.uppercase}
            onChange={(uppercase) => onStyleChange({ uppercase })}
          />
        ) : null}
      </div>

      {showDecoration ? (
        <div className="space-y-4">
          <StyleOptionGrid
            label={t('Decoration')}
            options={PORTFOLIO_ELEMENT_TEXT_DECORATION_OPTIONS}
            value={style.decoration}
            onChange={(decoration) => onStyleChange({ decoration })}
          />
          {style.decoration === 'highlight' ? (
            <StyleColorField
              label={t('Highlight color')}
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
