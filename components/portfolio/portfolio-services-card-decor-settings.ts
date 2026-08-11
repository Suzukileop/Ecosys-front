import type { CSSProperties } from 'react';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';

export type PortfolioServicesCardDecorShape =
  | 'circle'
  | 'blob'
  | 'square'
  | 'diamond'
  | 'triangle'
  | 'ring'
  | 'tint';

/** When / which cards receive the decorative shape. */
export type PortfolioServicesCardDecorAlternation =
  | 'none'
  | 'even'
  | 'odd'
  | 'every-third'
  | 'every-third-b'
  | 'every-third-c';

export type PortfolioServicesCardDecorSettings = {
  cardDecorEnabled: boolean;
  cardDecorShape: PortfolioServicesCardDecorShape;
  cardDecorColor: string;
  cardDecorOpacity: number;
  /** Size as % of the card’s shorter side (approx via width %). */
  cardDecorSize: number;
  /** Horizontal anchor 0–100 (0 = left, 100 = right). */
  cardDecorX: number;
  /** Vertical anchor 0–100 (0 = top, 100 = bottom). */
  cardDecorY: number;
  cardDecorRotation: number;
  cardDecorAlternation: PortfolioServicesCardDecorAlternation;
};

export const DEFAULT_SERVICES_CARD_DECOR_COLOR = '#e5e5e5';

export const DEFAULT_SERVICES_CARD_DECOR_SETTINGS: PortfolioServicesCardDecorSettings = {
  cardDecorEnabled: false,
  cardDecorShape: 'circle',
  cardDecorColor: DEFAULT_SERVICES_CARD_DECOR_COLOR,
  cardDecorOpacity: 55,
  cardDecorSize: 42,
  cardDecorX: 92,
  cardDecorY: 8,
  cardDecorRotation: 0,
  cardDecorAlternation: 'none',
};

export const PORTFOLIO_SERVICES_CARD_DECOR_SHAPE_OPTIONS: {
  value: PortfolioServicesCardDecorShape;
  label: string;
  description: string;
}[] = [
  { value: 'circle', label: 'Cercle', description: 'Disque plein — classique en coin.' },
  { value: 'blob', label: 'Blob', description: 'Forme organique adoucie.' },
  { value: 'square', label: 'Carré', description: 'Carré aux coins légèrement arrondis.' },
  { value: 'diamond', label: 'Losange', description: 'Carré tourné à 45°.' },
  { value: 'triangle', label: 'Triangle', description: 'Pointe géométrique nette.' },
  { value: 'ring', label: 'Anneau', description: 'Cercle creux — contour seulement.' },
  { value: 'tint', label: 'Teinte douce', description: 'Tache floue large — wash de couleur.' },
];

export const PORTFOLIO_SERVICES_CARD_DECOR_ALTERNATION_OPTIONS: {
  value: PortfolioServicesCardDecorAlternation;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: 'Toutes', description: 'Le décor apparaît sur chaque carte.' },
  { value: 'even', label: 'Paires (1, 3, 5…)', description: 'Uniquement les cartes d’index pair.' },
  { value: 'odd', label: 'Impaires (2, 4, 6…)', description: 'Uniquement les cartes d’index impair.' },
  { value: 'every-third', label: '1 sur 3 (A)', description: 'Cartes 1, 4, 7…' },
  { value: 'every-third-b', label: '1 sur 3 (B)', description: 'Cartes 2, 5, 8…' },
  { value: 'every-third-c', label: '1 sur 3 (C)', description: 'Cartes 3, 6, 9…' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function mergeServicesCardDecorSettings(
  base: PortfolioServicesCardDecorSettings,
  patch: unknown
): PortfolioServicesCardDecorSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  const shape = record.cardDecorShape;
  const alternation = record.cardDecorAlternation;

  return {
    cardDecorEnabled:
      typeof record.cardDecorEnabled === 'boolean' ? record.cardDecorEnabled : base.cardDecorEnabled,
    cardDecorShape:
      shape === 'circle' ||
      shape === 'blob' ||
      shape === 'square' ||
      shape === 'diamond' ||
      shape === 'triangle' ||
      shape === 'ring' ||
      shape === 'tint'
        ? shape
        : base.cardDecorShape,
    cardDecorColor: sanitizeHex(record.cardDecorColor, base.cardDecorColor),
    cardDecorOpacity: clampInt(record.cardDecorOpacity, 5, 100, base.cardDecorOpacity),
    cardDecorSize: clampInt(record.cardDecorSize, 8, 160, base.cardDecorSize),
    cardDecorX: clampInt(record.cardDecorX, 0, 100, base.cardDecorX),
    cardDecorY: clampInt(record.cardDecorY, 0, 100, base.cardDecorY),
    cardDecorRotation: clampInt(record.cardDecorRotation, 0, 360, base.cardDecorRotation),
    cardDecorAlternation:
      alternation === 'none' ||
      alternation === 'even' ||
      alternation === 'odd' ||
      alternation === 'every-third' ||
      alternation === 'every-third-b' ||
      alternation === 'every-third-c'
        ? alternation
        : base.cardDecorAlternation,
  };
}

export function shouldShowServicesCardDecor(
  settings: Pick<PortfolioServicesCardDecorSettings, 'cardDecorEnabled' | 'cardDecorAlternation'>,
  cardIndex = 0
): boolean {
  if (!settings.cardDecorEnabled) return false;
  const i = Math.max(0, Math.floor(cardIndex));
  switch (settings.cardDecorAlternation) {
    case 'even':
      return i % 2 === 0;
    case 'odd':
      return i % 2 === 1;
    case 'every-third':
      return i % 3 === 0;
    case 'every-third-b':
      return i % 3 === 1;
    case 'every-third-c':
      return i % 3 === 2;
    default:
      return true;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const body = hex.replace('#', '');
  const full =
    body.length === 3
      ? body
          .split('')
          .map((ch) => `${ch}${ch}`)
          .join('')
      : body.slice(0, 6);
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function servicesCardDecorShellStyle(
  settings: PortfolioServicesCardDecorSettings
): CSSProperties {
  const color = sanitizeHex(settings.cardDecorColor, DEFAULT_SERVICES_CARD_DECOR_COLOR);
  const alpha = clampInt(settings.cardDecorOpacity, 5, 100, 55) / 100;
  const size = clampInt(settings.cardDecorSize, 8, 160, 42);
  const x = clampInt(settings.cardDecorX, 0, 100, 92);
  const y = clampInt(settings.cardDecorY, 0, 100, 8);
  const rotation = clampInt(settings.cardDecorRotation, 0, 360, 0);
  const fill = hexToRgba(color, alpha);

  const base: CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}%`,
    aspectRatio: '1 / 1',
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    pointerEvents: 'none',
  };

  switch (settings.cardDecorShape) {
    case 'blob':
      return {
        ...base,
        backgroundColor: fill,
        borderRadius: '58% 42% 55% 45% / 48% 52% 45% 55%',
      };
    case 'square':
      return {
        ...base,
        backgroundColor: fill,
        borderRadius: '12%',
      };
    case 'diamond':
      return {
        ...base,
        backgroundColor: fill,
        borderRadius: '10%',
        transform: `translate(-50%, -50%) rotate(${45 + rotation}deg)`,
      };
    case 'triangle':
      return {
        ...base,
        backgroundColor: fill,
        clipPath: 'polygon(50% 6%, 94% 90%, 6% 90%)',
        borderRadius: 0,
      };
    case 'ring':
      return {
        ...base,
        backgroundColor: 'transparent',
        border: `${Math.max(2, Math.round(size / 14))}px solid ${fill}`,
        borderRadius: '50%',
        boxSizing: 'border-box',
      };
    case 'tint':
      return {
        ...base,
        width: `${Math.min(160, Math.round(size * 1.35))}%`,
        backgroundColor: fill,
        borderRadius: '50%',
        filter: 'blur(18px)',
        opacity: 0.95,
      };
    default:
      return {
        ...base,
        backgroundColor: fill,
        borderRadius: '50%',
      };
  }
}
