/**
 * Shared "card style" options for the Services pricing designs (Grid / Bento / Monolith /
 * Aurora / Toggle): corner radius, border, order button shape + destination, and the optional
 * background frame. One object (`presentation.pricingStyle`) read by every pricing design, so
 * the same settings band works the same way everywhere. Every field defaults to `auto` /
 * "off", which keeps each design's own look exactly as it was before these options existed.
 */
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_PALETTE,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import type { PortfolioServicesPalette } from '@/components/portfolio/portfolio-services-palette-settings';

export type PortfolioServicesPricingCardRadius = 'auto' | 'square' | 'soft' | 'rounded' | 'xl';
export type PortfolioServicesPricingBorderWidth = 'auto' | 'none' | 'thin' | 'medium' | 'thick';
export type PortfolioServicesPricingBorderColor =
  | 'auto'
  | 'principal'
  | 'secondaire'
  | 'texteFort'
  | 'neutre';
export type PortfolioServicesPricingCtaShape = 'auto' | 'square' | 'rounded' | 'pill';
export type PortfolioServicesPricingCtaLinkMode = 'contact' | 'section' | 'url';

export type PortfolioServicesPricingStyleSettings = {
  cardRadius: PortfolioServicesPricingCardRadius;
  cardBorderWidth: PortfolioServicesPricingBorderWidth;
  cardBorderColor: PortfolioServicesPricingBorderColor;
  /** Corner shape of the filled order buttons (Grid / Bento / Toggle). */
  ctaShape: PortfolioServicesPricingCtaShape;
  /** Where every order button points: the Contact section, another section, or a custom URL. */
  ctaLinkMode: PortfolioServicesPricingCtaLinkMode;
  /** Section id used when `ctaLinkMode === 'section'`. */
  ctaLinkSection: string;
  /** Destination used when `ctaLinkMode === 'url'`. */
  ctaLinkUrl: string;
  /** Open a custom URL in a new tab. */
  ctaLinkNewTab: boolean;
  /** Paint the design's own full-width backdrop behind the cards (Bento / Monolith / Aurora /
   *  Toggle). Off by default so the page's own background shows through. */
  showFrame: boolean;
};

export const DEFAULT_SERVICES_PRICING_STYLE_SETTINGS: PortfolioServicesPricingStyleSettings = {
  cardRadius: 'auto',
  cardBorderWidth: 'auto',
  cardBorderColor: 'auto',
  ctaShape: 'auto',
  ctaLinkMode: 'contact',
  ctaLinkSection: 'contact',
  ctaLinkUrl: '',
  ctaLinkNewTab: true,
  showFrame: false,
};

export const PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS: {
  value: PortfolioServicesPricingCardRadius;
  label: string;
}[] = [
  { value: 'auto', label: 'Default' },
  { value: 'square', label: 'Square' },
  { value: 'soft', label: 'Soft' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'xl', label: 'Extra round' },
];

export const PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS: {
  value: PortfolioServicesPricingBorderWidth;
  label: string;
}[] = [
  { value: 'auto', label: 'Default' },
  { value: 'none', label: 'None' },
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
];

export const PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS: {
  value: PortfolioServicesPricingBorderColor;
  label: string;
}[] = [
  { value: 'auto', label: 'Default' },
  { value: 'principal', label: 'Principal' },
  { value: 'secondaire', label: 'Secondary' },
  { value: 'texteFort', label: 'Contrast' },
  { value: 'neutre', label: 'Neutral' },
];

export const PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS: {
  value: PortfolioServicesPricingCtaShape;
  label: string;
}[] = [
  { value: 'auto', label: 'Default' },
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
];

export const PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS: {
  value: PortfolioServicesPricingCtaLinkMode;
  label: string;
}[] = [
  { value: 'contact', label: 'Contact section' },
  { value: 'section', label: 'Another section' },
  { value: 'url', label: 'Custom link' },
];

/** Sections an order button can scroll to. Ids match the `id` on each public section. */
export const PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'contact', label: 'Contact' },
  { value: 'work', label: 'Portfolio' },
  { value: 'services', label: 'Services' },
  { value: 'experience', label: 'Experience' },
  { value: 'faq', label: 'FAQ' },
  { value: 'footer', label: 'Footer' },
];

const SECTION_IDS = PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS.map((option) => option.value);

function pickOne<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

export function mergeServicesPricingStyleSettings(
  base: PortfolioServicesPricingStyleSettings,
  patch: unknown
): PortfolioServicesPricingStyleSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    cardRadius: pickOne(
      record.cardRadius,
      PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS.map((o) => o.value),
      base.cardRadius
    ),
    cardBorderWidth: pickOne(
      record.cardBorderWidth,
      PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS.map((o) => o.value),
      base.cardBorderWidth
    ),
    cardBorderColor: pickOne(
      record.cardBorderColor,
      PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS.map((o) => o.value),
      base.cardBorderColor
    ),
    ctaShape: pickOne(
      record.ctaShape,
      PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS.map((o) => o.value),
      base.ctaShape
    ),
    ctaLinkMode: pickOne(
      record.ctaLinkMode,
      PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS.map((o) => o.value),
      base.ctaLinkMode
    ),
    ctaLinkSection: pickOne(record.ctaLinkSection, SECTION_IDS, base.ctaLinkSection),
    ctaLinkUrl: typeof record.ctaLinkUrl === 'string' ? record.ctaLinkUrl.trim().slice(0, 500) : base.ctaLinkUrl,
    ctaLinkNewTab: typeof record.ctaLinkNewTab === 'boolean' ? record.ctaLinkNewTab : base.ctaLinkNewTab,
    showFrame: typeof record.showFrame === 'boolean' ? record.showFrame : base.showFrame,
  };
}

/** Reads the shared style off a presentation object defensively (the field may be absent on
 *  older stored settings or on a presentation built before this option existed). */
export function readServicesPricingStyle(presentation: unknown): PortfolioServicesPricingStyleSettings {
  const raw =
    presentation && typeof presentation === 'object'
      ? (presentation as { pricingStyle?: unknown }).pricingStyle
      : undefined;
  return mergeServicesPricingStyleSettings(DEFAULT_SERVICES_PRICING_STYLE_SETTINGS, raw);
}

const CARD_RADIUS_PX: Record<Exclude<PortfolioServicesPricingCardRadius, 'auto'>, number> = {
  square: 0,
  soft: 12,
  rounded: 24,
  xl: 40,
};

const BORDER_WIDTH_PX: Record<Exclude<PortfolioServicesPricingBorderWidth, 'auto'>, number> = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 4,
};

const CTA_RADIUS: Record<Exclude<PortfolioServicesPricingCtaShape, 'auto'>, string> = {
  square: '0px',
  rounded: '12px',
  pill: '9999px',
};

/** Card corner radius in px, or `null` to keep the design's own radius. */
export function pricingCardRadiusPx(style: PortfolioServicesPricingStyleSettings): number | null {
  return style.cardRadius === 'auto' ? null : CARD_RADIUS_PX[style.cardRadius];
}

/** Border width in px, or `null` to keep the design's own width. */
export function pricingBorderWidthPx(style: PortfolioServicesPricingStyleSettings): number | null {
  return style.cardBorderWidth === 'auto' ? null : BORDER_WIDTH_PX[style.cardBorderWidth];
}

/** Border color resolved from the Services palette, or `null` to keep the design's own. */
export function pricingBorderColor(
  style: PortfolioServicesPricingStyleSettings,
  servicesPalette: PortfolioServicesPalette | undefined
): string | null {
  if (style.cardBorderColor === 'auto') return null;
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, servicesPalette);
  return resolveHeroPaletteColor(palette, style.cardBorderColor);
}

/** CSS border-radius for an order button, or `null` to keep the design's own shape. */
export function pricingCtaRadius(style: PortfolioServicesPricingStyleSettings): string | null {
  return style.ctaShape === 'auto' ? null : CTA_RADIUS[style.ctaShape];
}

/** Normalises a user-typed destination: bare domains get `https://`, anchors / paths /
 *  mailto / tel pass through. Returns '' for an empty value. */
export function normalizePricingCtaUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:|#|\/)/i.test(value)) return value;
  return `https://${value}`;
}
