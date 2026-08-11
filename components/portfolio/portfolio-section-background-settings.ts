import type { CSSProperties } from 'react';
import {
  buildGradientBackground,
  colorWithOpacity,
  type HeroBackgroundGradientType,
} from '@/components/portfolio/portfolio-hero-background-settings';
import { isValidProfileHexColor } from '@/components/portfolio/portfolio-hero-profile-settings';
import type {
  PortfolioGlobalBackgroundImagePosition,
  PortfolioGlobalBackgroundImageSize,
} from '@/components/portfolio/portfolio-global-settings';
import {
  DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A,
  DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B,
  DEFAULT_SERVICES_CARD_DIVIDER_COLOR,
  servicesCardSplitBackgroundLayerStyle,
  type PortfolioServicesCardDividerShape,
  type PortfolioServicesCardSplitAxis,
} from '@/components/portfolio/portfolio-services-card-background-settings';

export type PortfolioSectionBackgroundFill = 'solid' | 'gradient' | 'image' | 'split';

export type PortfolioSectionBackgroundSplitAxis = PortfolioServicesCardSplitAxis;

export type PortfolioSectionBackgroundDividerShape = PortfolioServicesCardDividerShape;

export type PortfolioSectionBackgroundSettings = {
  sectionBackgroundEnabled: boolean;
  sectionBackgroundFill: PortfolioSectionBackgroundFill;
  sectionBackgroundColor: string;
  sectionBackgroundOpacity: number;
  sectionBackgroundGradientType: HeroBackgroundGradientType;
  sectionBackgroundGradientFrom: string;
  sectionBackgroundGradientTo: string;
  sectionBackgroundGradientAngle: number;
  sectionBackgroundImageUrl: string;
  sectionBackgroundImageSize: PortfolioGlobalBackgroundImageSize;
  sectionBackgroundImagePosition: PortfolioGlobalBackgroundImagePosition;
  /** Split X/Y zone A (top / left). */
  sectionBackgroundColorA: string;
  /** Split X/Y zone B (bottom / right). */
  sectionBackgroundColorB: string;
  sectionBackgroundSplitAxis: PortfolioSectionBackgroundSplitAxis;
  sectionBackgroundSplitPosition: number;
  sectionBackgroundDividerEnabled: boolean;
  sectionBackgroundDividerShape: PortfolioSectionBackgroundDividerShape;
  sectionBackgroundDividerAngle: number;
  sectionBackgroundDividerCurveDepth: number;
  sectionBackgroundDividerColor: string;
  sectionBackgroundDividerThickness: number;
  sectionBackgroundDividerOpacity: number;
};

export const DEFAULT_SECTION_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_SECTION_BACKGROUND_ZONE_A = DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_A;
export const DEFAULT_SECTION_BACKGROUND_ZONE_B = DEFAULT_SERVICES_CARD_BACKGROUND_ZONE_B;
export const DEFAULT_SECTION_BACKGROUND_DIVIDER_COLOR = DEFAULT_SERVICES_CARD_DIVIDER_COLOR;

export const DEFAULT_SECTION_BACKGROUND: PortfolioSectionBackgroundSettings = {
  sectionBackgroundEnabled: false,
  sectionBackgroundFill: 'solid',
  sectionBackgroundColor: DEFAULT_SECTION_BACKGROUND_COLOR,
  sectionBackgroundOpacity: 100,
  sectionBackgroundGradientType: 'linear',
  sectionBackgroundGradientFrom: '#ffffff',
  sectionBackgroundGradientTo: '#f5f5f5',
  sectionBackgroundGradientAngle: 160,
  sectionBackgroundImageUrl: '',
  sectionBackgroundImageSize: 'cover',
  sectionBackgroundImagePosition: 'center',
  sectionBackgroundColorA: DEFAULT_SECTION_BACKGROUND_ZONE_A,
  sectionBackgroundColorB: DEFAULT_SECTION_BACKGROUND_ZONE_B,
  sectionBackgroundSplitAxis: 'y',
  sectionBackgroundSplitPosition: 50,
  sectionBackgroundDividerEnabled: false,
  sectionBackgroundDividerShape: 'straight',
  sectionBackgroundDividerAngle: 135,
  sectionBackgroundDividerCurveDepth: 14,
  sectionBackgroundDividerColor: DEFAULT_SECTION_BACKGROUND_DIVIDER_COLOR,
  sectionBackgroundDividerThickness: 2,
  sectionBackgroundDividerOpacity: 85,
};

export const PORTFOLIO_SECTION_BACKGROUND_FILL_OPTIONS: {
  value: PortfolioSectionBackgroundFill;
  label: string;
  description: string;
}[] = [
  { value: 'solid', label: 'Solid', description: 'Single flat color — not combined with image.' },
  { value: 'gradient', label: 'Gradient', description: 'Blend two colors — linear or radial.' },
  {
    value: 'split',
    label: 'Split X / Y',
    description: 'Two color zones separated by a geometric line — like card fills.',
  },
  { value: 'image', label: 'Image', description: 'Uploaded photo only — replaces solid/gradient.' },
];

export const PORTFOLIO_SECTION_BACKGROUND_GRADIENT_TYPE_OPTIONS: {
  value: HeroBackgroundGradientType;
  label: string;
  description: string;
}[] = [
  { value: 'linear', label: 'Linear', description: 'Directional fade — angle controls rotation.' },
  { value: 'radial', label: 'Radial', description: 'Circular glow from the center outward.' },
];

export const PORTFOLIO_SECTION_BACKGROUND_SPLIT_AXIS_OPTIONS: {
  value: PortfolioSectionBackgroundSplitAxis;
  label: string;
  description: string;
}[] = [
  { value: 'y', label: 'Axe Y (horizontal)', description: 'Zone haut / zone bas.' },
  { value: 'x', label: 'Axe X (vertical)', description: 'Zone gauche / zone droite.' },
];

export const PORTFOLIO_SECTION_BACKGROUND_DIVIDER_SHAPE_OPTIONS: {
  value: PortfolioSectionBackgroundDividerShape;
  label: string;
  description: string;
}[] = [
  { value: 'straight', label: 'Droite', description: 'Ligne droite horizontale ou verticale.' },
  { value: 'diagonal', label: 'Diagonale', description: 'Séparation inclinée — angle et position réglables.' },
  { value: 'curve', label: 'Courbe', description: 'Arc doux entre les deux zones.' },
  { value: 'wave', label: 'Vague', description: 'Ligne ondulée pour un rendu organique.' },
];

function sanitizeHex(value: unknown, fallback: string): string {
  if (typeof value === 'string' && isValidProfileHexColor(value)) return value.trim();
  return fallback;
}

function sanitizeOpacity(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : fallback;
}

function clampPercent(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function clampDividerThickness(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(8, Math.max(1, Math.round(n)));
}

function clampAngle(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function clampCurveDepth(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(40, Math.max(0, Math.round(n)));
}

function sanitizeImageUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('data:image/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return trimmed;
  } catch {
    return '';
  }
  return '';
}

function imagePositionCss(position: PortfolioGlobalBackgroundImagePosition): string {
  switch (position) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    case 'left':
      return 'left center';
    case 'right':
      return 'right center';
    case 'top-left':
      return 'left top';
    case 'top-right':
      return 'right top';
    case 'bottom-left':
      return 'left bottom';
    case 'bottom-right':
      return 'right bottom';
    default:
      return 'center center';
  }
}

function imageSizeCss(size: PortfolioGlobalBackgroundImageSize): string {
  switch (size) {
    case 'contain':
      return 'contain';
    case 'fill':
      return '100% 100%';
    default:
      return 'cover';
  }
}

export function sectionSplitBackgroundLayerStyle(
  settings: PortfolioSectionBackgroundSettings
): CSSProperties | undefined {
  const splitStyle = servicesCardSplitBackgroundLayerStyle({
    cardBackgroundFill: 'split',
    cardBackgroundColorA: settings.sectionBackgroundColorA,
    cardBackgroundColorB: settings.sectionBackgroundColorB,
    cardBackgroundSplitAxis: settings.sectionBackgroundSplitAxis,
    cardBackgroundSplitPosition: settings.sectionBackgroundSplitPosition,
    cardDividerEnabled: settings.sectionBackgroundDividerEnabled,
    cardDividerShape: settings.sectionBackgroundDividerShape,
    cardDividerAngle: settings.sectionBackgroundDividerAngle,
    cardDividerCurveDepth: settings.sectionBackgroundDividerCurveDepth,
    cardDividerColor: settings.sectionBackgroundDividerColor,
    cardDividerThickness: settings.sectionBackgroundDividerThickness,
    cardDividerOpacity: settings.sectionBackgroundDividerOpacity,
  });
  if (!splitStyle) return undefined;
  return {
    ...splitStyle,
    opacity: settings.sectionBackgroundOpacity / 100,
  };
}

export function sectionBackgroundStyle(
  settings: PortfolioSectionBackgroundSettings
): CSSProperties | undefined {
  if (!settings.sectionBackgroundEnabled) return undefined;

  const opacity = settings.sectionBackgroundOpacity;

  if (settings.sectionBackgroundFill === 'image') {
    const url = sanitizeImageUrl(settings.sectionBackgroundImageUrl);
    if (!url) return undefined;
    // Image fill is exclusive — no solid/gradient underneath.
    // Opacity on this dedicated layer only (content stays fully opaque).
    return {
      backgroundImage: `url(${JSON.stringify(url)})`,
      backgroundSize: imageSizeCss(settings.sectionBackgroundImageSize),
      backgroundPosition: imagePositionCss(settings.sectionBackgroundImagePosition),
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'transparent',
      opacity: opacity / 100,
    };
  }

  if (settings.sectionBackgroundFill === 'split') {
    return sectionSplitBackgroundLayerStyle(settings);
  }

  if (settings.sectionBackgroundFill === 'gradient') {
    return {
      background: buildGradientBackground({
        type: settings.sectionBackgroundGradientType,
        from: settings.sectionBackgroundGradientFrom,
        to: settings.sectionBackgroundGradientTo,
        angle: settings.sectionBackgroundGradientAngle,
        opacityPercent: opacity,
      }),
    };
  }

  return {
    backgroundColor: colorWithOpacity(settings.sectionBackgroundColor, opacity),
  };
}

/** True when this section fully covers the global wallpaper (no see-through). */
export function hasOpaqueSectionBackground(
  settings: PortfolioSectionBackgroundSettings | undefined | null
): boolean {
  if (!settings?.sectionBackgroundEnabled) return false;
  if ((settings.sectionBackgroundOpacity ?? 100) < 100) return false;
  if (settings.sectionBackgroundFill === 'image') {
    return Boolean(sanitizeImageUrl(settings.sectionBackgroundImageUrl));
  }
  return (
    settings.sectionBackgroundFill === 'solid' ||
    settings.sectionBackgroundFill === 'gradient' ||
    settings.sectionBackgroundFill === 'split'
  );
}

/** Solid color used to fill remaining page space under a short opaque section. */
export function sectionBackgroundBlockColor(
  settings: Pick<
    PortfolioSectionBackgroundSettings,
    | 'sectionBackgroundFill'
    | 'sectionBackgroundGradientFrom'
    | 'sectionBackgroundColorA'
    | 'sectionBackgroundColor'
  >
): string {
  if (settings.sectionBackgroundFill === 'gradient') {
    return settings.sectionBackgroundGradientFrom || DEFAULT_SECTION_BACKGROUND_COLOR;
  }
  if (settings.sectionBackgroundFill === 'split') {
    return settings.sectionBackgroundColorA || DEFAULT_SECTION_BACKGROUND_COLOR;
  }
  if (settings.sectionBackgroundFill === 'solid') {
    return settings.sectionBackgroundColor || DEFAULT_SECTION_BACKGROUND_COLOR;
  }
  return DEFAULT_SECTION_BACKGROUND_COLOR;
}

export function mergeSectionBackground(
  base: PortfolioSectionBackgroundSettings,
  patch: unknown
): PortfolioSectionBackgroundSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;

  const fill = record.sectionBackgroundFill;
  const gradientType = record.sectionBackgroundGradientType;
  const imageSize = record.sectionBackgroundImageSize;
  const imagePosition = record.sectionBackgroundImagePosition;
  const splitAxis = record.sectionBackgroundSplitAxis;
  const dividerShape = record.sectionBackgroundDividerShape;

  return {
    sectionBackgroundEnabled:
      typeof record.sectionBackgroundEnabled === 'boolean'
        ? record.sectionBackgroundEnabled
        : base.sectionBackgroundEnabled,
    sectionBackgroundFill:
      fill === 'solid' || fill === 'gradient' || fill === 'image' || fill === 'split'
        ? fill
        : base.sectionBackgroundFill,
    sectionBackgroundColor: sanitizeHex(record.sectionBackgroundColor, base.sectionBackgroundColor),
    sectionBackgroundOpacity: sanitizeOpacity(record.sectionBackgroundOpacity, base.sectionBackgroundOpacity),
    sectionBackgroundGradientType:
      gradientType === 'linear' || gradientType === 'radial'
        ? gradientType
        : base.sectionBackgroundGradientType,
    sectionBackgroundGradientFrom: sanitizeHex(
      record.sectionBackgroundGradientFrom,
      base.sectionBackgroundGradientFrom
    ),
    sectionBackgroundGradientTo: sanitizeHex(record.sectionBackgroundGradientTo, base.sectionBackgroundGradientTo),
    sectionBackgroundGradientAngle:
      typeof record.sectionBackgroundGradientAngle === 'number'
        ? clampAngle(record.sectionBackgroundGradientAngle)
        : base.sectionBackgroundGradientAngle,
    sectionBackgroundImageUrl:
      typeof record.sectionBackgroundImageUrl === 'string'
        ? record.sectionBackgroundImageUrl.trim()
        : base.sectionBackgroundImageUrl,
    sectionBackgroundImageSize:
      imageSize === 'cover' || imageSize === 'contain' || imageSize === 'fill'
        ? imageSize
        : base.sectionBackgroundImageSize,
    sectionBackgroundImagePosition:
      imagePosition === 'center' ||
      imagePosition === 'top' ||
      imagePosition === 'bottom' ||
      imagePosition === 'left' ||
      imagePosition === 'right' ||
      imagePosition === 'top-left' ||
      imagePosition === 'top-right' ||
      imagePosition === 'bottom-left' ||
      imagePosition === 'bottom-right'
        ? imagePosition
        : base.sectionBackgroundImagePosition,
    sectionBackgroundColorA: sanitizeHex(
      record.sectionBackgroundColorA,
      base.sectionBackgroundColorA ?? DEFAULT_SECTION_BACKGROUND_ZONE_A
    ),
    sectionBackgroundColorB: sanitizeHex(
      record.sectionBackgroundColorB,
      base.sectionBackgroundColorB ?? DEFAULT_SECTION_BACKGROUND_ZONE_B
    ),
    sectionBackgroundSplitAxis:
      splitAxis === 'x' || splitAxis === 'y'
        ? splitAxis
        : (base.sectionBackgroundSplitAxis ?? 'y'),
    sectionBackgroundSplitPosition: clampPercent(
      record.sectionBackgroundSplitPosition,
      base.sectionBackgroundSplitPosition ?? 50
    ),
    sectionBackgroundDividerEnabled:
      typeof record.sectionBackgroundDividerEnabled === 'boolean'
        ? record.sectionBackgroundDividerEnabled
        : (base.sectionBackgroundDividerEnabled ?? false),
    sectionBackgroundDividerShape:
      dividerShape === 'straight' ||
      dividerShape === 'diagonal' ||
      dividerShape === 'curve' ||
      dividerShape === 'wave'
        ? dividerShape
        : (base.sectionBackgroundDividerShape ?? 'straight'),
    sectionBackgroundDividerAngle:
      typeof record.sectionBackgroundDividerAngle === 'number'
        ? clampAngle(record.sectionBackgroundDividerAngle)
        : (base.sectionBackgroundDividerAngle ?? 135),
    sectionBackgroundDividerCurveDepth: clampCurveDepth(
      record.sectionBackgroundDividerCurveDepth,
      base.sectionBackgroundDividerCurveDepth ?? 14
    ),
    sectionBackgroundDividerColor: sanitizeHex(
      record.sectionBackgroundDividerColor,
      base.sectionBackgroundDividerColor ?? DEFAULT_SECTION_BACKGROUND_DIVIDER_COLOR
    ),
    sectionBackgroundDividerThickness: clampDividerThickness(
      record.sectionBackgroundDividerThickness,
      base.sectionBackgroundDividerThickness ?? 2
    ),
    sectionBackgroundDividerOpacity: clampPercent(
      record.sectionBackgroundDividerOpacity,
      base.sectionBackgroundDividerOpacity ?? 85
    ),
  };
}

export function pickSectionBackgroundSettings(source: unknown): PortfolioSectionBackgroundSettings {
  return mergeSectionBackground(DEFAULT_SECTION_BACKGROUND, source);
}
