'use client';

import type { ReactNode } from 'react';
import {
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_SIZE_PX_MAX,
  LIST_MARKER_SIZE_PX_MIN,
  LIST_MARKER_WEIGHT_AMOUNT_MAX,
  LIST_MARKER_WEIGHT_AMOUNT_MIN,
  LIST_MARKER_WEIGHT_AMOUNT_STEP,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  PORTFOLIO_LIST_MARKER_SIZE_OPTIONS,
  PORTFOLIO_LIST_MARKER_WEIGHT_OPTIONS,
  clampListMarkerSizePx,
  clampListMarkerWeightAmount,
  resolveListMarkerSizePx,
  resolveListMarkerWeightAmount,
  type PortfolioListMarkerSize,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';

type SizeWeightPatch = {
  size?: PortfolioListMarkerSize;
  sizePx?: number;
  weight?: PortfolioListMarkerWeight;
  weightAmount?: number;
};

/**
 * Shared Size + Weight presets with Manual (px / stroke) sliders.
 * Mirrors Experience media / About gap “Manual” pattern.
 */
export function PortfolioListMarkerSizeWeightControls({
  size,
  sizePx,
  weight,
  weightAmount,
  onChange,
  OptionGrid,
  sizeLabel = 'Bullet size',
  weightLabel = 'Bullet weight',
  sizePresets = LIST_MARKER_SIZE_PRESET_PX,
}: {
  size: PortfolioListMarkerSize;
  sizePx?: number;
  weight: PortfolioListMarkerWeight;
  weightAmount?: number;
  onChange: (patch: SizeWeightPatch) => void;
  OptionGrid: <T extends string>(props: {
    label: string;
    options: { value: T; label: string; description: string }[];
    value: T | '';
    onChange: (value: T) => void;
    columns?: number;
  }) => ReactNode;
  sizeLabel?: string;
  weightLabel?: string;
  sizePresets?: Record<'sm' | 'md' | 'lg' | 'xl', number>;
}) {
  const resolvedSizePx = resolveListMarkerSizePx(size, sizePx, sizePresets);
  const resolvedWeightAmount = resolveListMarkerWeightAmount(weight, weightAmount);

  const sizeGridValue =
    size === 'custom' ? ('' as 'md') : ((size || 'md') as 'sm' | 'md' | 'lg' | 'xl');
  const weightGridValue =
    weight === 'custom'
      ? ('' as 'regular')
      : ((weight || 'regular') as 'light' | 'regular' | 'bold' | 'heavy');

  return (
    <>
      <OptionGrid
        label={sizeLabel}
        options={PORTFOLIO_LIST_MARKER_SIZE_OPTIONS as {
          value: 'sm' | 'md' | 'lg' | 'xl';
          label: string;
          description: string;
        }[]}
        value={sizeGridValue}
        onChange={(next) =>
          onChange({
            size: next,
            sizePx: sizePresets[next],
          })
        }
        columns={4}
      />
      {size === 'custom' ? (
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
        <p className="mt-1 text-sm text-neutral-500">Taille exacte de la puce en pixels.</p>
        <input
          type="range"
          min={LIST_MARKER_SIZE_PX_MIN}
          max={LIST_MARKER_SIZE_PX_MAX}
          step={1}
          value={resolvedSizePx}
          onChange={(event) => {
            const px = clampListMarkerSizePx(Number(event.target.value), sizePresets.md);
            onChange({ size: 'custom', sizePx: px });
          }}
          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
          aria-label="Manual bullet size in pixels"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>{LIST_MARKER_SIZE_PX_MIN}px</span>
          <span>{LIST_MARKER_SIZE_PX_MAX}px</span>
        </div>
      </div>

      <OptionGrid
        label={weightLabel}
        options={PORTFOLIO_LIST_MARKER_WEIGHT_OPTIONS as {
          value: 'light' | 'regular' | 'bold' | 'heavy';
          label: string;
          description: string;
        }[]}
        value={weightGridValue}
        onChange={(next) =>
          onChange({
            weight: next,
            weightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT[next],
          })
        }
        columns={4}
      />
      {weight === 'custom' ? (
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
            {resolvedWeightAmount.toFixed(2)}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Épaisseur du trait (glyphes) / graisse du texte (chiffres).
        </p>
        <input
          type="range"
          min={LIST_MARKER_WEIGHT_AMOUNT_MIN}
          max={LIST_MARKER_WEIGHT_AMOUNT_MAX}
          step={LIST_MARKER_WEIGHT_AMOUNT_STEP}
          value={resolvedWeightAmount}
          onChange={(event) => {
            const amount = clampListMarkerWeightAmount(Number(event.target.value));
            onChange({ weight: 'custom', weightAmount: amount });
          }}
          className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
          aria-label="Manual bullet weight / stroke"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>Fin</span>
          <span>Épais</span>
        </div>
      </div>
    </>
  );
}
