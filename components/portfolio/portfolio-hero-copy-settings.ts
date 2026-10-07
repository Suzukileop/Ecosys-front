export type HeroCopyPlacementMode = 'flow' | 'free';

/** Viewport anchor for the hero text block (headline, pitch, CTA). */
export type HeroCopyPosition = { x: number; y: number };

export type PortfolioHeroCopySettings = {
  heroCopyPlacementMode: HeroCopyPlacementMode;
  heroCopyPosition: HeroCopyPosition;
};

const DEFAULT_HERO_COPY_POSITION: HeroCopyPosition = { x: 22, y: 42 };

export const DEFAULT_HERO_COPY_SETTINGS: PortfolioHeroCopySettings = {
  heroCopyPlacementMode: 'flow',
  heroCopyPosition: { ...DEFAULT_HERO_COPY_POSITION },
};

function clampAxis(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampHeroCopyPosition(position: HeroCopyPosition): HeroCopyPosition {
  return {
    x: clampAxis(position.x, 4, 96),
    y: clampAxis(position.y, 10, 92),
  };
}

function sanitizeHeroCopyPosition(value: unknown, base: HeroCopyPosition): HeroCopyPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampHeroCopyPosition({ x, y });
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
