import type { CSSProperties } from 'react';

export type HeroCopyPlacementMode = 'flow' | 'free';

/** Viewport anchor for the hero text block (headline, pitch, CTA). */
export type HeroCopyPosition = { x: number; y: number };

export type PortfolioHeroCopySettings = {
  heroCopyPlacementMode: HeroCopyPlacementMode;
  heroCopyPosition: HeroCopyPosition;
};

export const DEFAULT_HERO_COPY_POSITION: HeroCopyPosition = { x: 22, y: 42 };

export const DEFAULT_HERO_COPY_POSITION_FLIPPED: HeroCopyPosition = { x: 78, y: 42 };

export const DEFAULT_HERO_COPY_SETTINGS: PortfolioHeroCopySettings = {
  heroCopyPlacementMode: 'flow',
  heroCopyPosition: { ...DEFAULT_HERO_COPY_POSITION },
};

export const PORTFOLIO_HERO_COPY_POSITION_PRESETS: {
  id: string;
  label: string;
  position: HeroCopyPosition;
}[] = [
  { id: 'left-mid', label: 'Left center', position: { x: 22, y: 42 } },
  { id: 'left-lower', label: 'Left lower', position: { x: 24, y: 62 } },
  { id: 'left-upper', label: 'Left upper', position: { x: 20, y: 26 } },
  { id: 'right-mid', label: 'Right center', position: { x: 78, y: 42 } },
  { id: 'right-lower', label: 'Right lower', position: { x: 76, y: 62 } },
  { id: 'center', label: 'Center', position: { x: 50, y: 44 } },
];

function clampAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampHeroCopyPosition(position: HeroCopyPosition): HeroCopyPosition {
  return {
    x: clampAxis(position.x, 4, 96),
    y: clampAxis(position.y, 10, 92),
  };
}

export function sanitizeHeroCopyPosition(value: unknown, base: HeroCopyPosition): HeroCopyPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampHeroCopyPosition({ x, y });
}

export function heroCopyPositionStyle(position: HeroCopyPosition): CSSProperties {
  const clamped = clampHeroCopyPosition(position);
  return {
    left: `${clamped.x}vw`,
    top: `${clamped.y}vh`,
    transform: 'translate(-50%, -50%)',
  };
}

export function defaultHeroCopyPositionForLayout(flipped: boolean): HeroCopyPosition {
  return flipped ? { ...DEFAULT_HERO_COPY_POSITION_FLIPPED } : { ...DEFAULT_HERO_COPY_POSITION };
}

export function mergeHeroCopySettings(
  base: PortfolioHeroCopySettings,
  patch: unknown
): PortfolioHeroCopySettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const mode = record.heroCopyPlacementMode;

  return {
    heroCopyPlacementMode:
      mode === 'flow' || mode === 'free' ? mode : base.heroCopyPlacementMode,
    heroCopyPosition: sanitizeHeroCopyPosition(record.heroCopyPosition, base.heroCopyPosition),
  };
}
