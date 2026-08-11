import type { CSSProperties } from 'react';
import {
  DEFAULT_LEFT_CUSTOM_MOTIF_POINTS,
  motifPointsToClipPath,
  sanitizeMotifPoints,
  type MotifPoint,
} from '@/components/portfolio/portfolio-hero-motif-geometry';
import {
  clampMotifPanelPosition,
  clampMotifPanelSize,
  motifPanelContainerStyle,
  sanitizeMotifPanelPosition,
  sanitizeMotifPanelSize,
  type MotifPanelPosition,
  type MotifPanelSize,
} from '@/components/portfolio/portfolio-hero-motif-panel';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

export type { MotifPoint };

export type PortfolioHeroLeftMotifPattern =
  | 'none'
  | 'dots'
  | 'grid'
  | 'diagonal'
  | 'waves'
  | 'crosshatch'
  | 'circles'
  | 'hexagons'
  | 'custom';

export type LeftMotifPosition = MotifPanelPosition;

export type LeftMotifSize = MotifPanelSize;

export type PortfolioHeroLeftMotifSettings = {
  leftMotifEnabled: boolean;
  leftMotifPattern: PortfolioHeroLeftMotifPattern;
  leftMotifColor: string;
  leftMotifOpacity: number;
  leftMotifPosition: LeftMotifPosition;
  leftMotifSize: LeftMotifSize;
  leftCustomMotifPoints: MotifPoint[];
};

export const DEFAULT_LEFT_MOTIF_POSITION: LeftMotifPosition = { x: 22, y: 82 };

export const DEFAULT_LEFT_MOTIF_SIZE: LeftMotifSize = { width: 44, height: 40 };

export { DEFAULT_LEFT_CUSTOM_MOTIF_POINTS } from '@/components/portfolio/portfolio-hero-motif-geometry';

export const DEFAULT_HERO_LEFT_MOTIF_SETTINGS: PortfolioHeroLeftMotifSettings = {
  leftMotifEnabled: false,
  leftMotifPattern: 'dots',
  leftMotifColor: '#d4d4d4',
  leftMotifOpacity: 35,
  leftMotifPosition: { ...DEFAULT_LEFT_MOTIF_POSITION },
  leftMotifSize: { ...DEFAULT_LEFT_MOTIF_SIZE },
  leftCustomMotifPoints: DEFAULT_LEFT_CUSTOM_MOTIF_POINTS.map((point) => ({ ...point })),
};

export const PORTFOLIO_HERO_LEFT_MOTIF_OPTIONS: {
  value: PortfolioHeroLeftMotifPattern;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No background pattern.' },
  { value: 'dots', label: 'Dots', description: 'Soft dotted texture — subtle and clean.' },
  { value: 'grid', label: 'Grid', description: 'Fine editorial grid lines.' },
  { value: 'diagonal', label: 'Diagonal lines', description: '45° stripe hatching.' },
  { value: 'waves', label: 'Waves', description: 'Flowing wave lines at the bottom.' },
  { value: 'crosshatch', label: 'Crosshatch', description: 'Intersecting diagonal weave.' },
  { value: 'circles', label: 'Rings', description: 'Concentric circle outlines.' },
  { value: 'hexagons', label: 'Hexagons', description: 'Honeycomb geometric mesh.' },
  {
    value: 'custom',
    label: 'Custom editor',
    description: 'Draw freely — drag points to create any shape on the left.',
  },
];

export const PORTFOLIO_HERO_LEFT_MOTIF_POSITION_PRESETS: {
  id: string;
  label: string;
  position: LeftMotifPosition;
}[] = [
  { id: 'default', label: 'Bottom left', position: { x: 22, y: 82 } },
  { id: 'lower', label: 'Lower center', position: { x: 28, y: 90 } },
  { id: 'mid', label: 'Mid left', position: { x: 24, y: 62 } },
  { id: 'upper', label: 'Upper left', position: { x: 20, y: 38 } },
];

export function clampLeftMotifPosition(position: LeftMotifPosition, size?: LeftMotifSize): LeftMotifPosition {
  return clampMotifPanelPosition(position, 'left', size);
}

export function clampLeftMotifSize(size: LeftMotifSize): LeftMotifSize {
  return clampMotifPanelSize(size, 'left');
}

export function sanitizeLeftMotifPosition(
  value: unknown,
  base: LeftMotifPosition,
  size?: LeftMotifSize
): LeftMotifPosition {
  return sanitizeMotifPanelPosition(value, base, 'left', size);
}

export function sanitizeLeftMotifSize(value: unknown, base: LeftMotifSize): LeftMotifSize {
  return sanitizeMotifPanelSize(value, base, 'left');
}

export function leftMotifContainerStyle(settings: PortfolioHeroLeftMotifSettings): CSSProperties {
  const size = clampLeftMotifSize(settings.leftMotifSize);
  const position = clampLeftMotifPosition(settings.leftMotifPosition, size);
  const opacity = Math.min(100, Math.max(0, settings.leftMotifOpacity)) / 100;
  return motifPanelContainerStyle(position, size, opacity);
}

function svgDataUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function buildPatternSvg(pattern: Exclude<PortfolioHeroLeftMotifPattern, 'none' | 'custom'>, color: string): string {
  switch (pattern) {
    case 'grid':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M32 0H0V32" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    case 'diagonal':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M-2 14L14 -2M2 18L18 2M6 22L22 6" fill="none" stroke="${color}" stroke-width="1.2"/></svg>`;
    case 'waves':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><path d="M0 28C20 12 40 36 60 20s40 8 60-8" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
    case 'crosshatch':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 20L20 0M-2 2L2 -2M18 22L22 18" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    case 'circles':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="20" fill="none" stroke="${color}" stroke-width="1.5"/><circle cx="24" cy="24" r="12" fill="none" stroke="${color}" stroke-width="1"/></svg>`;
    case 'hexagons':
      return `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="48" viewBox="0 0 56 48"><path d="M14 4L42 4L56 24L42 44L14 44L0 24Z" fill="none" stroke="${color}" stroke-width="1.2"/></svg>`;
    default:
      // Small centered tile — with background-position on the copy edge,
      // dots sit flush enough to match Contact / text (no hollow strip).
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2" fill="${color}"/></svg>`;
  }
}

function patternSize(pattern: Exclude<PortfolioHeroLeftMotifPattern, 'none' | 'custom'>): string {
  switch (pattern) {
    case 'grid':
      return '32px 32px';
    case 'diagonal':
    case 'crosshatch':
      return '20px 20px';
    case 'waves':
      return '120px 40px';
    case 'circles':
      return '48px 48px';
    case 'hexagons':
      return '56px 48px';
    default:
      return '16px 16px';
  }
}

export function resolveLeftMotifClipPath(points: MotifPoint[]): string {
  return motifPointsToClipPath(points);
}

export function shouldRenderLeftMotif(settings: PortfolioHeroLeftMotifSettings): boolean {
  return settings.leftMotifEnabled && settings.leftMotifPattern !== 'none';
}

export function leftMotifInnerStyle(
  settings: PortfolioHeroLeftMotifSettings,
  /** Align the repeating tile to the copy column edge so dots meet Contact / text. */
  tileAlign: 'left' | 'right' | 'center' = 'left'
): CSSProperties {
  const color = isValidProfileHexColor(settings.leftMotifColor)
    ? settings.leftMotifColor.trim()
    : DEFAULT_HERO_LEFT_MOTIF_SETTINGS.leftMotifColor;

  if (settings.leftMotifPattern === 'custom') {
    return {
      backgroundColor: color,
      clipPath: resolveLeftMotifClipPath(settings.leftCustomMotifPoints),
    };
  }

  if (settings.leftMotifPattern === 'none') {
    return {};
  }

  const pattern = settings.leftMotifPattern;
  const svg = buildPatternSvg(pattern, color);
  const size = patternSize(pattern);
  const backgroundPosition =
    tileAlign === 'right' ? 'right bottom' : tileAlign === 'center' ? 'center bottom' : 'left bottom';

  return {
    backgroundImage: svgDataUrl(svg),
    backgroundSize: size,
    backgroundRepeat: 'repeat',
    backgroundPosition,
    maskImage: 'linear-gradient(to top, black 0%, black 60%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(to top, black 0%, black 60%, transparent 100%)',
  };
}

export function mergeHeroLeftMotifSettings(
  base: PortfolioHeroLeftMotifSettings,
  patch: unknown
): PortfolioHeroLeftMotifSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const leftMotifPattern = record.leftMotifPattern;
  let leftMotifOpacity = base.leftMotifOpacity;
  if (typeof record.leftMotifOpacity === 'number') {
    leftMotifOpacity = Math.min(100, Math.max(0, record.leftMotifOpacity));
  }

  const leftMotifColor =
    typeof record.leftMotifColor === 'string' && isValidProfileHexColor(record.leftMotifColor)
      ? record.leftMotifColor.trim()
      : base.leftMotifColor;

  const leftMotifSize = sanitizeLeftMotifSize(record.leftMotifSize, base.leftMotifSize);

  return {
    leftMotifEnabled:
      typeof record.leftMotifEnabled === 'boolean' ? record.leftMotifEnabled : base.leftMotifEnabled,
    leftMotifPattern:
      leftMotifPattern === 'none' ||
      leftMotifPattern === 'dots' ||
      leftMotifPattern === 'grid' ||
      leftMotifPattern === 'diagonal' ||
      leftMotifPattern === 'waves' ||
      leftMotifPattern === 'crosshatch' ||
      leftMotifPattern === 'circles' ||
      leftMotifPattern === 'hexagons' ||
      leftMotifPattern === 'custom'
        ? leftMotifPattern
        : base.leftMotifPattern,
    leftMotifColor,
    leftMotifOpacity,
    leftMotifPosition: sanitizeLeftMotifPosition(record.leftMotifPosition, base.leftMotifPosition, leftMotifSize),
    leftMotifSize,
    leftCustomMotifPoints: sanitizeMotifPoints(
      record.leftCustomMotifPoints !== undefined ? record.leftCustomMotifPoints : base.leftCustomMotifPoints,
      DEFAULT_LEFT_CUSTOM_MOTIF_POINTS
    ),
  };
}
