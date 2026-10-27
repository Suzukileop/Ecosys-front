'use client';

import type { ReactNode } from 'react';
import {
  PORTFOLIO_CARDS_BORDER_COLOR_OPTIONS,
  PORTFOLIO_CARDS_BORDER_WIDTH_OPTIONS,
  PORTFOLIO_CARDS_RADIUS_OPTIONS,
  cardsPaletteColor,
  type PortfolioCardsStyle,
} from '@/components/portfolio/portfolio-cards-style';
import { NpCollapsibleSection } from '@/components/portfolio/portfolio-nav-panel-ui';
import { SettingRow, settingValueLabel, useSettingsRows } from '@/components/portfolio/portfolio-settings-rows';
import {
  SV_TEXT_FAINT,
  SV_TEXT_STRONG,
  SvChoiceTiles,
  SvSwatches,
} from '@/components/portfolio/portfolio-settings-variants';
import { useT } from '@/lib/i18n/I18nProvider';

const RADIUS_GLYPH_PX: Record<string, number> = { auto: 6, square: 0, soft: 3, rounded: 7, xl: 11 };
const BORDER_GLYPH_STROKE: Record<string, number> = { auto: 1.6, none: 0, thin: 1, medium: 2.2, thick: 3.6 };

function radiusGlyph(value: string): ReactNode {
  return (
    <rect
      x="6"
      y="5"
      width="28"
      height="18"
      rx={RADIUS_GLYPH_PX[value] ?? 6}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeDasharray={value === 'auto' ? '3 2.5' : undefined}
    />
  );
}

function borderGlyph(value: string): ReactNode {
  return (
    <rect
      x="6"
      y="5"
      width="28"
      height="18"
      rx="5"
      fill={value === 'none' ? 'currentColor' : 'none'}
      fillOpacity={value === 'none' ? 0.14 : undefined}
      stroke={value === 'none' ? 'none' : 'currentColor'}
      strokeWidth={BORDER_GLYPH_STROKE[value] ?? 1.6}
      strokeDasharray={value === 'auto' ? '3 2.5' : undefined}
    />
  );
}

function PreviewGlyph({ shape }: { shape: ReactNode }) {
  return (
    <svg viewBox="0 0 40 28" className="h-5 w-7" fill="none" aria-hidden>
      {shape}
    </svg>
  );
}

/**
 * The one "Cards" block every section with cards shows in its Design tab: Corner radius,
 * Border and Border color. Same tiles and swatches as Services → Design → Cards.
 * Use inside a `SettingsRowsScope` (Expanded / Compact views) — it also works outside one.
 */
export function CardsStyleControls({
  value,
  onChange,
  palette,
  collapsible = true,
}: {
  value: PortfolioCardsStyle;
  onChange: (next: PortfolioCardsStyle) => void;
  /** A foldable "Cards" section like the other blocks; pass `false` when already inside one. */
  collapsible?: boolean;
  /** Section palette the border color swatches resolve against (Hero palette when omitted). */
  palette?: unknown;
}) {
  const t = useT();
  const inRows = useSettingsRows();
  const set = (patch: Partial<PortfolioCardsStyle>) => onChange({ ...value, ...patch });

  const colorOptions = PORTFOLIO_CARDS_BORDER_COLOR_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    auto: option.value === 'auto',
    color: option.value === 'auto' ? 'transparent' : cardsPaletteColor(option.value as Exclude<PortfolioCardsStyle['cardBorderColor'], 'auto'>, palette),
  }));
  const colorOf = (token: string) => (token === 'auto' ? 'transparent' : cardsPaletteColor(token as Exclude<PortfolioCardsStyle['cardBorderColor'], 'auto'>, palette));

  const row = (
    id: string,
    label: string,
    valueLabel: string,
    preview: ReactNode,
    control: ReactNode
  ): ReactNode =>
    inRows ? (
      <SettingRow key={id} label={t(label)} value={t(valueLabel)} preview={preview}>
        {control}
      </SettingRow>
    ) : (
      <div key={id} className="py-4">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <span className={`text-[14px] font-semibold ${SV_TEXT_STRONG}`}>{t(label)}</span>
          <span className={`text-[13px] ${SV_TEXT_FAINT}`}>{t(valueLabel)}</span>
        </div>
        {control}
      </div>
    );

  const rowsNode = (
    <>
      {row(
        'radius',
        'Corner radius',
        settingValueLabel(PORTFOLIO_CARDS_RADIUS_OPTIONS, value.cardRadius),
        <PreviewGlyph shape={radiusGlyph(value.cardRadius)} />,
        <SvChoiceTiles
          label="Corner radius"
          density="regular"
          options={PORTFOLIO_CARDS_RADIUS_OPTIONS.map((option) => ({ ...option, glyph: radiusGlyph(option.value) }))}
          value={value.cardRadius}
          onChange={(cardRadius) => set({ cardRadius })}
        />
      )}
      {row(
        'border',
        'Border',
        settingValueLabel(PORTFOLIO_CARDS_BORDER_WIDTH_OPTIONS, value.cardBorderWidth),
        <PreviewGlyph shape={borderGlyph(value.cardBorderWidth)} />,
        <SvChoiceTiles
          label="Border"
          density="regular"
          options={PORTFOLIO_CARDS_BORDER_WIDTH_OPTIONS.map((option) => ({ ...option, glyph: borderGlyph(option.value) }))}
          value={value.cardBorderWidth}
          onChange={(cardBorderWidth) => set({ cardBorderWidth })}
        />
      )}
      {value.cardBorderWidth !== 'none'
        ? row(
            'border-color',
            'Border color',
            settingValueLabel(PORTFOLIO_CARDS_BORDER_COLOR_OPTIONS, value.cardBorderColor),
            <span
              aria-hidden
              className={`block h-3.5 w-3.5 rounded-full ${
                value.cardBorderColor === 'auto' ? 'border border-dashed border-current' : 'border border-[color:color-mix(in_srgb,currentColor_45%,transparent)]'
              }`}
              style={value.cardBorderColor === 'auto' ? undefined : { backgroundColor: colorOf(value.cardBorderColor) }}
            />,
            <SvSwatches
              label="Border color"
              density="regular"
              options={colorOptions}
              value={value.cardBorderColor}
              onChange={(next) => set({ cardBorderColor: next as PortfolioCardsStyle['cardBorderColor'] })}
            />
          )
        : null}
    </>
  );
  if (collapsible) {
    return (
      <NpCollapsibleSection title={t('Cards')}>
        <div data-cards-style-controls>{rowsNode}</div>
      </NpCollapsibleSection>
    );
  }
  return (
    <section aria-label={t('Cards')} data-cards-style-controls>
      <h4 className={`mb-1 mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${SV_TEXT_FAINT}`}>{t('Cards')}</h4>
      {rowsNode}
    </section>
  );
}
