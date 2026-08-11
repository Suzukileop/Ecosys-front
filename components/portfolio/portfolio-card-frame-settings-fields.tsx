'use client';

import type React from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS,
  PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS,
  PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS,
  servicesCardSplitBackgroundLayerStyle,
  type PortfolioServicesCardBackgroundSettings,
} from '@/components/portfolio/portfolio-services-card-background-settings';
import {
  PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS,
  PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS,
  PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS,
  type PortfolioServicesCardBorder,
  type PortfolioServicesCardPadding,
  type PortfolioServicesCardRadius,
} from '@/components/portfolio/portfolio-services-settings';

export type PortfolioCardFrameSettings = PortfolioServicesCardBackgroundSettings & {
  cardBorder: PortfolioServicesCardBorder;
  cardBorderColor: string;
  cardBackgroundEnabled: boolean;
  cardBackgroundColor: string;
  cardBorderRadius: PortfolioServicesCardRadius;
  cardPadding: PortfolioServicesCardPadding;
};

function FrameOptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className={`mt-3 grid gap-2 ${columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className={`mt-1 block text-xs leading-relaxed ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type PortfolioCardFrameColorFieldKey =
  | 'cardBorderColor'
  | 'cardBackgroundColor'
  | 'cardBackgroundColorA'
  | 'cardBackgroundColorB'
  | 'cardDividerColor';

export type PortfolioCardFrameColorFieldRenderer = (props: {
  field: PortfolioCardFrameColorFieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => React.ReactNode;

function FrameColorField({
  field,
  label,
  value,
  onChange,
  render,
}: {
  field: PortfolioCardFrameColorFieldKey;
  label: string;
  value: string;
  onChange: (value: string) => void;
  render?: PortfolioCardFrameColorFieldRenderer;
}) {
  if (render) {
    return <>{render({ field, label, value, onChange })}</>;
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 cursor-pointer rounded-xl border border-neutral-200 bg-white p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (isValidProfileHexColor(next)) onChange(next);
          }}
          className="w-28 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-mono text-neutral-900"
        />
        <span className="h-11 w-20 rounded-xl border border-neutral-200/80 shadow-inner" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

function FrameToggleRow({
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

export function PortfolioCardFrameSettingsFields({
  settings,
  onChange,
  heading = 'Cadre & fond',
  description = 'Bordure, couleur, fond, arrondi et padding des cartes.',
  renderColorField,
}: {
  settings: PortfolioCardFrameSettings;
  onChange: (patch: Partial<PortfolioCardFrameSettings>) => void;
  heading?: string;
  description?: string;
  renderColorField?: PortfolioCardFrameColorFieldRenderer;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-neutral-950">{heading}</p>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>

      <FrameOptionGrid
        label="Bordure"
        options={PORTFOLIO_SERVICES_CARD_BORDER_OPTIONS}
        value={settings.cardBorder}
        onChange={(cardBorder) => onChange({ cardBorder })}
        columns={2}
      />

      {settings.cardBorder === 'soft' || settings.cardBorder === 'solid' ? (
        <FrameColorField
          field="cardBorderColor"
          label="Couleur de bordure"
          value={settings.cardBorderColor}
          onChange={(cardBorderColor) => onChange({ cardBorderColor })}
          render={renderColorField}
        />
      ) : null}

      <FrameOptionGrid
        label="Type de fond"
        options={PORTFOLIO_SERVICES_CARD_BACKGROUND_FILL_OPTIONS}
        value={settings.cardBackgroundFill}
        onChange={(cardBackgroundFill) => onChange({ cardBackgroundFill })}
        columns={2}
      />

      {settings.cardBackgroundFill === 'solid' ? (
        <>
          <FrameToggleRow
            label="Fond du cadre"
            description="Appliquer une couleur de fond derrière le contenu de la carte."
            checked={settings.cardBackgroundEnabled}
            onChange={(cardBackgroundEnabled) => onChange({ cardBackgroundEnabled })}
          />

          {settings.cardBackgroundEnabled ? (
            <FrameColorField
              field="cardBackgroundColor"
              label="Couleur de fond"
              value={settings.cardBackgroundColor}
              onChange={(cardBackgroundColor) => onChange({ cardBackgroundColor })}
              render={renderColorField}
            />
          ) : null}
        </>
      ) : (
        <div className="space-y-4 rounded-2xl border border-neutral-200/60 bg-white/70 p-4">
          <div>
            <p className="text-sm font-semibold text-neutral-950">Fond divisé X / Y</p>
            <p className="mt-1 text-sm text-neutral-500">
              Deux couleurs de zone séparées par une ligne géométrique positionnable.
            </p>
          </div>

          <FrameOptionGrid
            label="Axe de séparation"
            options={PORTFOLIO_SERVICES_CARD_SPLIT_AXIS_OPTIONS}
            value={settings.cardBackgroundSplitAxis}
            onChange={(cardBackgroundSplitAxis) => onChange({ cardBackgroundSplitAxis })}
            columns={2}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FrameColorField
              field="cardBackgroundColorA"
              label={
                settings.cardBackgroundSplitAxis === 'y' ? 'Couleur zone haut' : 'Couleur zone gauche'
              }
              value={settings.cardBackgroundColorA}
              onChange={(cardBackgroundColorA) => onChange({ cardBackgroundColorA })}
              render={renderColorField}
            />
            <FrameColorField
              field="cardBackgroundColorB"
              label={
                settings.cardBackgroundSplitAxis === 'y' ? 'Couleur zone bas' : 'Couleur zone droite'
              }
              value={settings.cardBackgroundColorB}
              onChange={(cardBackgroundColorB) => onChange({ cardBackgroundColorB })}
              render={renderColorField}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                Position de la séparation
              </p>
              <span className="text-sm font-semibold text-neutral-700">
                {settings.cardBackgroundSplitPosition}%
              </span>
            </div>
            <input
              type="range"
              min={8}
              max={92}
              step={1}
              value={settings.cardBackgroundSplitPosition}
              onChange={(event) =>
                onChange({ cardBackgroundSplitPosition: Number(event.target.value) })
              }
              className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
              aria-label="Position de la séparation"
            />
          </div>

          <div
            className="h-24 overflow-hidden rounded-2xl border border-neutral-200/80 shadow-inner"
            style={servicesCardSplitBackgroundLayerStyle(settings)}
            aria-hidden
          />

          <FrameToggleRow
            label="Ligne de séparation"
            description="Afficher une ligne entre les deux zones de couleur."
            checked={settings.cardDividerEnabled}
            onChange={(cardDividerEnabled) => onChange({ cardDividerEnabled })}
          />

          <FrameOptionGrid
            label="Forme de la ligne"
            options={PORTFOLIO_SERVICES_CARD_DIVIDER_SHAPE_OPTIONS}
            value={settings.cardDividerShape}
            onChange={(cardDividerShape) => onChange({ cardDividerShape })}
            columns={2}
          />

          {settings.cardDividerShape === 'diagonal' ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Angle</p>
                <span className="text-sm font-semibold text-neutral-700">{settings.cardDividerAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                step={1}
                value={settings.cardDividerAngle}
                onChange={(event) => onChange({ cardDividerAngle: Number(event.target.value) })}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Angle de la diagonale"
              />
            </div>
          ) : settings.cardDividerShape === 'curve' || settings.cardDividerShape === 'wave' ? (
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  {settings.cardDividerShape === 'curve' ? 'Courbure' : 'Amplitude vague'}
                </p>
                <span className="text-sm font-semibold text-neutral-700">
                  {settings.cardDividerCurveDepth}%
                </span>
              </div>
              <input
                type="range"
                min={4}
                max={40}
                step={1}
                value={settings.cardDividerCurveDepth}
                onChange={(event) => onChange({ cardDividerCurveDepth: Number(event.target.value) })}
                className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                aria-label="Profondeur de courbe"
              />
            </div>
          ) : null}

          {settings.cardDividerEnabled ? (
            <div className="space-y-4">
              <FrameColorField
                field="cardDividerColor"
                label="Couleur de la ligne"
                value={settings.cardDividerColor}
                onChange={(cardDividerColor) => onChange({ cardDividerColor })}
                render={renderColorField}
              />
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Épaisseur</p>
                  <span className="text-sm font-semibold text-neutral-700">
                    {settings.cardDividerThickness}px
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={settings.cardDividerThickness}
                  onChange={(event) => onChange({ cardDividerThickness: Number(event.target.value) })}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Épaisseur de la ligne"
                />
              </div>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Opacité</p>
                  <span className="text-sm font-semibold text-neutral-700">
                    {settings.cardDividerOpacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={1}
                  value={settings.cardDividerOpacity}
                  onChange={(event) => onChange({ cardDividerOpacity: Number(event.target.value) })}
                  className="mt-3 h-2 w-full cursor-pointer accent-neutral-900"
                  aria-label="Opacité de la ligne"
                />
              </div>
            </div>
          ) : null}
        </div>
      )}

      <FrameOptionGrid
        label="Arrondi"
        options={PORTFOLIO_SERVICES_CARD_RADIUS_OPTIONS}
        value={settings.cardBorderRadius}
        onChange={(cardBorderRadius) => onChange({ cardBorderRadius })}
        columns={3}
      />

      <FrameOptionGrid
        label="Padding carte"
        options={PORTFOLIO_SERVICES_CARD_PADDING_OPTIONS}
        value={settings.cardPadding}
        onChange={(cardPadding) => onChange({ cardPadding })}
        columns={2}
      />
    </div>
  );
}
