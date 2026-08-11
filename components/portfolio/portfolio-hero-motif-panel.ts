import type { CSSProperties } from 'react';

export type MotifPanelPosition = { x: number; y: number };

export type MotifPanelSize = { width: number; height: number };

export type MotifPanelTransform = {
  position: MotifPanelPosition;
  size: MotifPanelSize;
};

export const DEFAULT_RIGHT_MOTIF_POSITION: MotifPanelPosition = { x: 75, y: 50 };

/**
 * Wide enough that center at 75% places the right edge flush with the content frame
 * (start of the right side margin / content-width bound).
 */
export const DEFAULT_RIGHT_MOTIF_SIZE: MotifPanelSize = { width: 50, height: 76 };

export const DEFAULT_RIGHT_MOTIF_TRANSFORM: MotifPanelTransform = {
  position: { ...DEFAULT_RIGHT_MOTIF_POSITION },
  size: { ...DEFAULT_RIGHT_MOTIF_SIZE },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampMotifPanelPosition(
  position: MotifPanelPosition,
  side: 'left' | 'right',
  size?: MotifPanelSize,
  options?: {
    /**
     * Allow the panel center anywhere on the hero (0–100).
     * Needed for large curve strokes — the usual half-size clamp locked a ~90% panel
     * to x∈[45,55] / y∈[47,53], so it could not move to top / bottom / corners.
     */
    allowOverflow?: boolean;
  }
): MotifPanelPosition {
  if (options?.allowOverflow) {
    return {
      x: clamp(position.x, 0, 100),
      y: clamp(position.y, 0, 100),
    };
  }

  const halfW = (size?.width ?? 30) / 2;
  const halfH = (size?.height ?? 30) / 2;
  const minX = halfW;
  const maxX = 100 - halfW;
  const minY = halfH;
  const maxY = 100 - halfH;

  void side; // kept for call-site compatibility (left/right used to differ; clamp is symmetric)
  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

export function clampMotifPanelSize(
  size: MotifPanelSize,
  side: 'left' | 'right',
  options?: { freePlacement?: boolean }
): MotifPanelSize {
  // Curves need wide/tall bands that can still be nudged freely.
  const min = options?.freePlacement ? 8 : side === 'left' ? 10 : 14;
  const max = options?.freePlacement ? 120 : 100;
  return {
    width: clamp(size.width, min, max),
    height: clamp(size.height, min, max),
  };
}

export function sanitizeMotifPanelPosition(
  value: unknown,
  base: MotifPanelPosition,
  side: 'left' | 'right',
  size?: MotifPanelSize,
  options?: { allowOverflow?: boolean }
): MotifPanelPosition {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const x = typeof record.x === 'number' ? record.x : base.x;
  const y = typeof record.y === 'number' ? record.y : base.y;
  return clampMotifPanelPosition({ x, y }, side, size, options);
}

export function sanitizeMotifPanelSize(
  value: unknown,
  base: MotifPanelSize,
  side: 'left' | 'right',
  options?: { freePlacement?: boolean }
): MotifPanelSize {
  if (!value || typeof value !== 'object') return base;
  const record = value as Record<string, unknown>;
  const width = typeof record.width === 'number' ? record.width : base.width;
  const height = typeof record.height === 'number' ? record.height : base.height;
  return clampMotifPanelSize({ width, height }, side, options);
}

export function motifPanelContainerStyle(
  position: MotifPanelPosition,
  size: MotifPanelSize,
  opacity = 1,
  /** Use `%` when the panel lives inside the editorial content inset; `vw` for full-bleed layers. */
  horizontalUnit: 'vw' | '%' = 'vw'
): CSSProperties {
  if (horizontalUnit === '%') {
    const halfW = size.width / 2;
    const minX = halfW;
    const maxX = 100 - halfW;
    const centerX = Math.min(Math.max(position.x, minX), maxX);
    // right: 0 when center is at maxX → flush with content-frame right edge (side-margin start).
    const rightOffset = Math.max(0, 100 - centerX - halfW);

    return {
      right: `${rightOffset}%`,
      left: 'auto',
      top: `${position.y}%`,
      width: `${size.width}%`,
      height: `${size.height}%`,
      transform: 'translateY(-50%)',
      ...(opacity >= 1 ? {} : { opacity, willChange: 'opacity' }),
    };
  }

  return {
    left: `${position.x}vw`,
    top: `${position.y}vh`,
    width: `${size.width}vw`,
    height: `${size.height}vh`,
    transform: 'translate(-50%, -50%)',
    ...(opacity >= 1 ? {} : { opacity, willChange: 'opacity' }),
  };
}

/** Map hero vw/vh to editor viewBox (0–100). */
export function heroToEditorPoint(position: MotifPanelPosition): MotifPanelPosition {
  return { x: position.x, y: position.y };
}

export function editorToHeroPoint(point: MotifPanelPosition, side: 'left' | 'right'): MotifPanelPosition {
  return clampMotifPanelPosition(point, side);
}

export function getMotifPanelDefaultsForLayout(
  layout: 'centered' | 'full'
): MotifPanelTransform {
  if (layout === 'full') {
    return {
      position: { x: 75, y: 50 },
      size: { width: 50, height: 96 },
    };
  }
  return {
    position: { ...DEFAULT_RIGHT_MOTIF_POSITION },
    size: { ...DEFAULT_RIGHT_MOTIF_SIZE },
  };
}

/**
 * Keep a motif inside the content frame (clamp only).
 * Soft-snap to the frame edge was removed: for large circles / ovals it created a
 * dead zone (e.g. width 50% → any x in ~63–75 snapped back to 75), so a small
 * drag either did nothing or jumped ~10%+ once past the threshold.
 */
export function normalizeMotifPositionForContentFrame(
  position: MotifPanelPosition,
  size: MotifPanelSize,
  _edge: 'left' | 'right' = 'right'
): MotifPanelPosition {
  const halfW = size.width / 2;
  const halfH = size.height / 2;
  const minX = halfW;
  const maxX = 100 - halfW;
  const minY = halfH;
  const maxY = 100 - halfH;
  return {
    x: Math.min(Math.max(position.x, minX), maxX),
    y: Math.min(Math.max(position.y, minY), maxY),
  };
}

/** @deprecated Prefer normalizeMotifPositionForContentFrame(..., 'right') */
export function normalizeRightMotifPositionForContentFrame(
  position: MotifPanelPosition,
  size: MotifPanelSize
): MotifPanelPosition {
  return normalizeMotifPositionForContentFrame(position, size, 'right');
}
