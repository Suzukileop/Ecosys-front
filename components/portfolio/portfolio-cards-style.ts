/**
 * Shared "Cards" style (Design → Cards): corner radius, border width and border color, with
 * the same choices in every section that draws cards (Services, Team, Gallery, Work, …).
 * Every field defaults to `auto`, which keeps each design's own look untouched; a non-auto
 * value overrides it through `cardsStyleCss`.
 */
import {
  resolveHeroPaletteColor,
  DEFAULT_HERO_PALETTE,
  mergeHeroPalette,
} from '@/components/portfolio/portfolio-hero-palette-settings';
import { msg } from '@/lib/i18n/config';
import type { CSSProperties } from 'react';

export type PortfolioCardsRadius = 'auto' | 'square' | 'soft' | 'rounded' | 'xl';
export type PortfolioCardsBorderWidth = 'auto' | 'none' | 'thin' | 'medium' | 'thick';
export type PortfolioCardsBorderColor = 'auto' | 'principal' | 'secondaire' | 'texteFort' | 'neutre';

export type PortfolioCardsStyle = {
  cardRadius: PortfolioCardsRadius;
  cardBorderWidth: PortfolioCardsBorderWidth;
  cardBorderColor: PortfolioCardsBorderColor;
};

export const DEFAULT_CARDS_STYLE: PortfolioCardsStyle = {
  cardRadius: 'auto',
  cardBorderWidth: 'auto',
  cardBorderColor: 'auto',
};

export const PORTFOLIO_CARDS_RADIUS_OPTIONS: { value: PortfolioCardsRadius; label: string }[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'square', label: msg('Square') },
  { value: 'soft', label: msg('Soft') },
  { value: 'rounded', label: msg('Rounded') },
  { value: 'xl', label: msg('Extra round') },
];

export const PORTFOLIO_CARDS_BORDER_WIDTH_OPTIONS: { value: PortfolioCardsBorderWidth; label: string }[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'none', label: msg('None') },
  { value: 'thin', label: msg('Thin') },
  { value: 'medium', label: msg('Medium') },
  { value: 'thick', label: msg('Thick') },
];

export const PORTFOLIO_CARDS_BORDER_COLOR_OPTIONS: { value: PortfolioCardsBorderColor; label: string }[] = [
  { value: 'auto', label: msg('Default') },
  { value: 'principal', label: msg('Principal') },
  { value: 'secondaire', label: msg('Secondary') },
  { value: 'texteFort', label: msg('Contrast') },
  { value: 'neutre', label: msg('Neutral') },
];

const RADIUS_PX: Record<Exclude<PortfolioCardsRadius, 'auto'>, number> = {
  square: 0,
  soft: 12,
  rounded: 24,
  xl: 40,
};

const BORDER_WIDTH_PX: Record<Exclude<PortfolioCardsBorderWidth, 'auto'>, number> = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 4,
};

function pickOne<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function mergeCardsStyle(base: PortfolioCardsStyle, patch: unknown): PortfolioCardsStyle {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    cardRadius: pickOne(record.cardRadius, PORTFOLIO_CARDS_RADIUS_OPTIONS.map((o) => o.value), base.cardRadius),
    cardBorderWidth: pickOne(
      record.cardBorderWidth,
      PORTFOLIO_CARDS_BORDER_WIDTH_OPTIONS.map((o) => o.value),
      base.cardBorderWidth
    ),
    cardBorderColor: pickOne(
      record.cardBorderColor,
      PORTFOLIO_CARDS_BORDER_COLOR_OPTIONS.map((o) => o.value),
      base.cardBorderColor
    ),
  };
}

/** Reads `cardsStyle` off a presentation object (absent on older stored settings → all `auto`). */
export function readCardsStyle(presentation: unknown): PortfolioCardsStyle {
  const raw =
    presentation && typeof presentation === 'object'
      ? (presentation as { cardsStyle?: unknown }).cardsStyle
      : undefined;
  return mergeCardsStyle(DEFAULT_CARDS_STYLE, raw);
}

const PALETTE_CSS_VAR: Record<Exclude<PortfolioCardsBorderColor, 'auto'>, string> = {
  principal: 'principal',
  secondaire: 'secondaire',
  texteFort: 'texte-fort',
  neutre: 'neutre',
};

/** Palette token → color: the section's own palette when it has one, else the live
 *  `--pf-palette-*` variable (set by the Hero palette on the public page). */
export function cardsPaletteColor(token: Exclude<PortfolioCardsBorderColor, 'auto'>, palette?: unknown): string {
  if (palette && typeof palette === 'object') {
    return resolveHeroPaletteColor(mergeHeroPalette(DEFAULT_HERO_PALETTE, palette), token);
  }
  return `var(--pf-palette-${PALETTE_CSS_VAR[token]}, ${resolveHeroPaletteColor(DEFAULT_HERO_PALETTE, token)})`;
}

/** Border color for the style, or `null` for `auto`. */
export function cardsBorderColor(style: PortfolioCardsStyle, palette?: unknown): string | null {
  return style.cardBorderColor === 'auto' ? null : cardsPaletteColor(style.cardBorderColor, palette);
}

/**
 * Inline style overrides for one card. Returns `{}` when everything is `auto`, so spreading it
 * after a design's own style changes nothing until the creator picks a value.
 */
export function cardsStyleCss(
  style: PortfolioCardsStyle | undefined | null,
  /** Section palette (any `*Palette` object); the Hero palette defaults fill what is missing. */
  palette?: unknown
): CSSProperties {
  if (!style) return {};
  const css: CSSProperties = {};
  if (style.cardRadius !== 'auto') css.borderRadius = RADIUS_PX[style.cardRadius];
  if (style.cardBorderWidth !== 'auto') {
    const width = BORDER_WIDTH_PX[style.cardBorderWidth];
    css.borderWidth = width;
    css.borderStyle = width === 0 ? 'none' : 'solid';
  }
  const color = cardsBorderColor(style, palette);
  if (color) {
    css.borderColor = color;
    // A color alone must show: give the border a width when the design had none.
    if (style.cardBorderWidth === 'auto') {
      css.borderStyle = 'solid';
      css.borderWidth = 1;
    }
  }
  return css;
}

const RADIUS_CLASS: Record<Exclude<PortfolioCardsRadius, 'auto'>, string> = {
  square: 'rounded-none',
  soft: 'rounded-xl',
  rounded: 'rounded-3xl',
  xl: 'rounded-[2.5rem]',
};

/** Tailwind radius class for designs that size corners with classes, or `null` to keep their own. */
export function cardsRadiusClass(style: PortfolioCardsStyle | undefined | null): string | null {
  return style && style.cardRadius !== 'auto' ? RADIUS_CLASS[style.cardRadius] : null;
}

/** Just the border part of `cardsStyleCss` (for designs whose radius comes from elsewhere). */
export function cardsBorderCss(
  style: PortfolioCardsStyle | undefined | null,
  palette?: unknown
): CSSProperties {
  const { borderRadius: _radius, ...border } = cardsStyleCss(style, palette);
  void _radius;
  return border;
}

/** Corner radius in px for numeric-radius designs, or `null` to keep the design's own. */
export function cardsRadiusPx(style: PortfolioCardsStyle | undefined | null): number | null {
  return style && style.cardRadius !== 'auto' ? RADIUS_PX[style.cardRadius] : null;
}

/**
 * Root props for sections whose cards are styled from CSS (Tools / Stack): CSS variables plus
 * `data-pf-cards-*` flags that the `[data-pf-cards-…]` rules in globals.css key on. Spreads to
 * nothing while every field is `auto`.
 */
export function cardsStyleRootProps(
  style: PortfolioCardsStyle | undefined | null,
  palette?: unknown
): { style?: CSSProperties; 'data-pf-cards-radius'?: ''; 'data-pf-cards-border'?: ''; 'data-pf-cards-border-color'?: '' } {
  if (!style) return {};
  const vars: Record<string, string> = {};
  const props: ReturnType<typeof cardsStyleRootProps> = {};
  const radius = cardsRadiusPx(style);
  if (radius !== null) {
    vars['--pf-cards-radius'] = `${radius}px`;
    props['data-pf-cards-radius'] = '';
  }
  const color = cardsBorderColor(style, palette);
  if (style.cardBorderWidth !== 'auto' || color) {
    vars['--pf-cards-border-width'] = `${style.cardBorderWidth === 'auto' ? 1 : BORDER_WIDTH_PX[style.cardBorderWidth]}px`;
    props['data-pf-cards-border'] = '';
  }
  if (color) {
    vars['--pf-cards-border-color'] = color;
    props['data-pf-cards-border-color'] = '';
  }
  if (Object.keys(vars).length > 0) props.style = vars as CSSProperties;
  return props;
}
