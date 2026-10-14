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
import { msg } from '@/lib/i18n/config';

export type PortfolioServicesPricingCardRadius = 'auto' | 'square' | 'soft' | 'rounded' | 'xl';
export type PortfolioServicesPricingBorderWidth = 'auto' | 'none' | 'thin' | 'medium' | 'thick';
export type PortfolioServicesPricingBorderColor =
  | 'auto'
  | 'principal'
  | 'secondaire'
  | 'texteFort'
  | 'neutre';
export type PortfolioServicesPricingCtaShape = 'auto' | 'square' | 'rounded' | 'pill';
/** Look of the order button on every design: `auto` keeps each design's own. */
export type PortfolioServicesPricingCtaStyle = 'auto' | 'filled' | 'outline' | 'link';
export type PortfolioServicesPricingCtaLinkMode = 'contact' | 'section' | 'url';
/** Simple card hover effects — none of them dims or blurs the neighbouring cards. */
export type PortfolioServicesHoverEffect = 'lift' | 'glow' | 'tilt' | 'none';
/** Where the price suffix ("/ month") comes from: each service's own billing period, one custom
 *  label for every card, or nothing. */
export type PortfolioServicesBillingSource = 'service' | 'custom' | 'hidden';
/** How the featured card is chosen: by position, by the service's own "popular" flag, or none. */
export type PortfolioServicesFeaturedSource = 'index' | 'service' | 'none';
/** Marker in front of each task line on the designs with a vertical task list. `auto` keeps
 *  each design's own marker. */
export type PortfolioServicesListBullet =
  | 'auto'
  | 'check'
  | 'checkCircle'
  | 'dot'
  | 'dash'
  | 'arrow'
  | 'plus'
  | 'number'
  | 'none';
export type PortfolioServicesFeaturedColor = 'auto' | 'principal' | 'secondaire' | 'texteFort' | 'neutre';

export type PortfolioServicesPricingStyleSettings = {
  cardRadius: PortfolioServicesPricingCardRadius;
  cardBorderWidth: PortfolioServicesPricingBorderWidth;
  cardBorderColor: PortfolioServicesPricingBorderColor;
  /** Corner shape of the filled order buttons (Grid / Bento / Toggle). */
  ctaShape: PortfolioServicesPricingCtaShape;
  ctaStyle: PortfolioServicesPricingCtaStyle;
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
  /** Hover effect on a card (every Services design with cards reads this). */
  hoverEffect: PortfolioServicesHoverEffect;
  /** Where the period suffix after a price comes from. */
  billingSource: PortfolioServicesBillingSource;
  /** Suffix used when `billingSource === 'custom'`. */
  billingCustomLabel: string;
  /** Shows the price (+ period) on designs that are not pricing tables (Showcase / Index / Media). */
  showPrice: boolean;
  featuredSource: PortfolioServicesFeaturedSource;
  /** 0-based position of the featured card when `featuredSource === 'index'`. */
  featuredIndex: number;
  /** Text of the featured card's badge ("Popular", "Best value", "Top pick"…). */
  featuredLabel: string;
  featuredShowLabel: boolean;
  /** `auto` keeps each design's own accent; the others are palette tokens. */
  featuredColor: PortfolioServicesFeaturedColor;
  /** 0–100 opacity of the featured card's background fill; null keeps the design's own. */
  featuredOpacity: number | null;
  /** Text shown instead of a figure on a service priced "on request" (every design). Empty keeps
   *  each design's own wording ("Custom", "Price on request"…). */
  quotePriceLabel: string;
  /** Text shown instead of a figure on a free service. Empty keeps "Free". */
  freePriceLabel: string;
  listBullet: PortfolioServicesListBullet;
  /** Marker color of the list bullet (palette token); `auto` keeps each design's own. */
  listBulletColor: PortfolioServicesFeaturedColor;
};

export const DEFAULT_SERVICES_PRICING_STYLE_SETTINGS: PortfolioServicesPricingStyleSettings = {
  cardRadius: 'auto',
  cardBorderWidth: 'auto',
  cardBorderColor: 'auto',
  ctaShape: 'auto',
  ctaStyle: 'auto',
  ctaLinkMode: 'contact',
  ctaLinkSection: 'contact',
  ctaLinkUrl: '',
  ctaLinkNewTab: true,
  showFrame: false,
  hoverEffect: 'lift',
  billingSource: 'service',
  billingCustomLabel: '/ month',
  showPrice: false,
  featuredSource: 'index',
  featuredIndex: 1,
  featuredLabel: 'Popular',
  featuredShowLabel: true,
  featuredColor: 'auto',
  featuredOpacity: null,
  quotePriceLabel: '',
  freePriceLabel: '',
  listBullet: 'auto',
  listBulletColor: 'auto',
};

export const PORTFOLIO_SERVICES_HOVER_EFFECT_OPTIONS: {
  value: PortfolioServicesHoverEffect;
  label: string;
}[] = [
  { value: 'lift', label: msg('Lift') },
  { value: 'glow', label: msg('Glow') },
  { value: 'tilt', label: msg('Tilt') },
  { value: 'none', label: msg('None') },
];

export const PORTFOLIO_SERVICES_BILLING_SOURCE_OPTIONS: {
  value: PortfolioServicesBillingSource;
  label: string;
}[] = [
  { value: 'service', label: msg("Service's own") },
  { value: 'custom', label: msg('Same for all') },
  { value: 'hidden', label: msg('Hidden') },
];

export const PORTFOLIO_SERVICES_FEATURED_SOURCE_OPTIONS: {
  value: PortfolioServicesFeaturedSource;
  label: string;
}[] = [
  { value: 'index', label: msg('Pick one') },
  { value: 'service', label: msg('Marked popular') },
  { value: 'none', label: msg('None') },
];

export const PORTFOLIO_SERVICES_LIST_BULLET_OPTIONS: {
  value: PortfolioServicesListBullet;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'check', label: msg('Check') },
  { value: 'checkCircle', label: msg('Check in a disc') },
  { value: 'dot', label: msg('Dot') },
  { value: 'dash', label: msg('Dash') },
  { value: 'arrow', label: msg('Arrow') },
  { value: 'plus', label: msg('Plus') },
  { value: 'number', label: msg('Numbers') },
  { value: 'none', label: msg('None') },
];

/** Designs whose tasks are a vertical list, so the List bullet option applies to them. */
export const SERVICES_LIST_BULLET_DESIGNS: Record<string, string> = {
  'services-pricing': 'Pricing Cards',
  'services-pricing-aurora': 'Pricing Aurora',
  'services-pricing-toggle': 'Pricing Toggle',
  'services-cascade': 'Cascade',
  'services-capabilities': 'Capabilities',
};

export const PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS: {
  value: PortfolioServicesFeaturedColor;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'principal', label: msg('Principal') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Contrast') },
  { value: 'neutre', label: msg('Neutral') },
];

export const PORTFOLIO_SERVICES_PRICING_CARD_RADIUS_OPTIONS: {
  value: PortfolioServicesPricingCardRadius;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'square', label: msg('Square') },
  { value: 'soft', label: msg('Soft') },
  { value: 'rounded', label: msg('Rounded') },
  { value: 'xl', label: msg('Extra round') },
];

export const PORTFOLIO_SERVICES_PRICING_BORDER_WIDTH_OPTIONS: {
  value: PortfolioServicesPricingBorderWidth;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'none', label: msg('None') },
  { value: 'thin', label: msg('Thin') },
  { value: 'medium', label: msg('Medium') },
  { value: 'thick', label: msg('Thick') },
];

export const PORTFOLIO_SERVICES_PRICING_BORDER_COLOR_OPTIONS: {
  value: PortfolioServicesPricingBorderColor;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'principal', label: msg('Principal') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Contrast') },
  { value: 'neutre', label: msg('Neutral') },
];

export const PORTFOLIO_SERVICES_PRICING_CTA_SHAPE_OPTIONS: {
  value: PortfolioServicesPricingCtaShape;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'square', label: msg('Square') },
  { value: 'rounded', label: msg('Rounded') },
  { value: 'pill', label: msg('Pill') },
];

export const PORTFOLIO_SERVICES_PRICING_CTA_STYLE_OPTIONS: {
  value: PortfolioServicesPricingCtaStyle;
  label: string;
}[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'filled', label: msg('Filled') },
  { value: 'outline', label: msg('Outline') },
  { value: 'link', label: msg('Link') },
];

export const PORTFOLIO_SERVICES_PRICING_CTA_LINK_MODE_OPTIONS: {
  value: PortfolioServicesPricingCtaLinkMode;
  label: string;
}[] = [
  { value: 'contact', label: msg('Contact section') },
  { value: 'section', label: msg('Another section') },
  { value: 'url', label: msg('Custom link') },
];

/** Sections an order button can scroll to. Ids match the `id` on each public section. */
export const PORTFOLIO_SERVICES_PRICING_CTA_SECTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'contact', label: msg('Contact') },
  { value: 'work', label: msg('Portfolio') },
  { value: 'services', label: msg('Services') },
  { value: 'experience', label: msg('Experience') },
  { value: 'faq', label: 'FAQ' },
  { value: 'footer', label: msg('Footer') },
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
    ctaStyle: pickOne(
      record.ctaStyle,
      PORTFOLIO_SERVICES_PRICING_CTA_STYLE_OPTIONS.map((o) => o.value),
      base.ctaStyle
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
    hoverEffect: pickOne(
      record.hoverEffect,
      PORTFOLIO_SERVICES_HOVER_EFFECT_OPTIONS.map((o) => o.value),
      base.hoverEffect
    ),
    billingSource: pickOne(
      record.billingSource,
      PORTFOLIO_SERVICES_BILLING_SOURCE_OPTIONS.map((o) => o.value),
      base.billingSource
    ),
    billingCustomLabel:
      typeof record.billingCustomLabel === 'string'
        ? record.billingCustomLabel.trim().slice(0, 24)
        : base.billingCustomLabel,
    showPrice: typeof record.showPrice === 'boolean' ? record.showPrice : base.showPrice,
    featuredSource: pickOne(
      record.featuredSource,
      PORTFOLIO_SERVICES_FEATURED_SOURCE_OPTIONS.map((o) => o.value),
      base.featuredSource
    ),
    featuredIndex:
      typeof record.featuredIndex === 'number' && Number.isFinite(record.featuredIndex)
        ? Math.max(0, Math.round(record.featuredIndex))
        : base.featuredIndex,
    featuredLabel:
      typeof record.featuredLabel === 'string' ? record.featuredLabel.trim().slice(0, 32) : base.featuredLabel,
    featuredShowLabel:
      typeof record.featuredShowLabel === 'boolean' ? record.featuredShowLabel : base.featuredShowLabel,
    featuredColor: pickOne(
      record.featuredColor,
      PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS.map((o) => o.value),
      base.featuredColor
    ),
    featuredOpacity:
      record.featuredOpacity === null
        ? null
        : typeof record.featuredOpacity === 'number' && Number.isFinite(record.featuredOpacity)
          ? Math.min(100, Math.max(0, Math.round(record.featuredOpacity)))
          : base.featuredOpacity,
    quotePriceLabel:
      typeof record.quotePriceLabel === 'string' ? record.quotePriceLabel.trim().slice(0, 32) : base.quotePriceLabel,
    freePriceLabel:
      typeof record.freePriceLabel === 'string' ? record.freePriceLabel.trim().slice(0, 32) : base.freePriceLabel,
    listBullet: pickOne(
      record.listBullet,
      PORTFOLIO_SERVICES_LIST_BULLET_OPTIONS.map((o) => o.value),
      base.listBullet
    ),
    listBulletColor: pickOne(
      record.listBulletColor,
      PORTFOLIO_SERVICES_FEATURED_COLOR_OPTIONS.map((o) => o.value),
      base.listBulletColor
    ),
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

/** Featured card color resolved from the Services palette, or `null` to keep the design's own. */
export function pricingFeaturedColor(
  style: PortfolioServicesPricingStyleSettings,
  servicesPalette: PortfolioServicesPalette | undefined
): string | null {
  if (style.featuredColor === 'auto') return null;
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, servicesPalette);
  return resolveHeroPaletteColor(palette, style.featuredColor);
}

/** List-bullet marker color resolved from the Services palette, or `null` to keep the design's own. */
export function pricingListBulletColor(
  style: PortfolioServicesPricingStyleSettings,
  servicesPalette: PortfolioServicesPalette | undefined
): string | null {
  if (style.listBulletColor === 'auto') return null;
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, servicesPalette);
  return resolveHeroPaletteColor(palette, style.listBulletColor);
}

/** Background opacity (0–100) each design gives its featured card when the creator has not set one. */
export const SERVICES_FEATURED_DEFAULT_OPACITY = {
  cardsGrid: 100,
  cardsMonolith: 10,
  cardsBento: 20,
  aurora: 10,
  toggle: 100,
  index: 8,
} as const;

export type ServicesFeaturedDesignKey = keyof typeof SERVICES_FEATURED_DEFAULT_OPACITY;

/**
 * Which card is featured: the one at `featuredIndex` (clamped to the list), the first service the
 * creator marked "popular", or none. Returns -1 when nothing is featured.
 */
export function resolveFeaturedIndex(
  style: PortfolioServicesPricingStyleSettings,
  flags: readonly boolean[]
): number {
  if (flags.length === 0 || style.featuredSource === 'none') return -1;
  if (style.featuredSource === 'service') return flags.findIndex(Boolean);
  return Math.min(style.featuredIndex, flags.length - 1);
}

/** Moves the featured card (at `index` in the original order) to the chosen slot. "center" is the
 *  middle of the first row of `columns`, so a 3-up row puts it in the middle column. */
export function moveFeatured<T>(
  list: T[],
  index: number,
  position: 'keep' | 'first' | 'center' | 'last',
  columns: number
): T[] {
  if (index < 0 || index >= list.length || position === 'keep') return list;
  const rest = list.filter((_, i) => i !== index);
  const target =
    position === 'first'
      ? 0
      : position === 'last'
        ? rest.length
        : Math.floor((Math.min(columns, list.length) - 1) / 2);
  return [...rest.slice(0, target), list[index], ...rest.slice(target)];
}

/** The creator's General → Price text for an on-request / free price, or `fallback` (the
 *  design's own wording) when they left it empty. */
export function priceWordLabel(
  style: PortfolioServicesPricingStyleSettings,
  kind: 'quote' | 'free',
  fallback: string
): string {
  const custom = kind === 'quote' ? style.quotePriceLabel : style.freePriceLabel;
  return custom.trim() || fallback;
}

/** Same price parts with `text` swapped for the creator's on-request / free wording. */
export function applyServicePriceLabels<T extends { kind: 'free' | 'quote' | 'amount'; text: string }>(
  parts: T,
  style: PortfolioServicesPricingStyleSettings
): T {
  if (parts.kind === 'amount') return parts;
  return { ...parts, text: priceWordLabel(style, parts.kind, parts.text) };
}

/** "/ month" for one service according to the billing setting; null hides the suffix. */
export function resolveBillingSuffix(
  style: PortfolioServicesPricingStyleSettings,
  servicePeriod: string | null
): string | null {
  if (style.billingSource === 'hidden') return null;
  if (style.billingSource === 'custom') return style.billingCustomLabel.trim() || null;
  return servicePeriod;
}
