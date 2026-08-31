/**
 * Equal left/right editorial gutters — shared by hero content and all sections below
 * (footer may opt out). Keep hero absolute layers in sync with these values.
 */

export type PortfolioContentGutter = 'none' | 'wide' | 'medium' | 'narrow';

export const DEFAULT_CONTENT_GUTTER: PortfolioContentGutter = 'medium';

const GUTTER_PADDING_X: Record<PortfolioContentGutter, string> = {
  none: 'px-0',
  /** Least inset — content hugs the edges (still phone-safe). */
  wide: 'px-4 sm:px-5 lg:px-8 xl:px-10 2xl:px-12',
  /** Default Editorial Warm — modest side padding, not a large empty frame. */
  medium: 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16',
  /** More inset — tighter content column. */
  narrow: 'px-5 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32',
};

const GUTTER_LAYER_INSET: Record<PortfolioContentGutter, string> = {
  none: 'left-0 right-0',
  wide: 'left-4 right-4 sm:left-5 sm:right-5 lg:left-8 lg:right-8 xl:left-10 xl:right-10 2xl:left-12 2xl:right-12',
  medium:
    'left-4 right-4 sm:left-6 sm:right-6 md:left-8 md:right-8 lg:left-10 lg:right-10 xl:left-12 xl:right-12 2xl:left-16 2xl:right-16',
  narrow:
    'left-5 right-5 sm:left-8 sm:right-8 md:left-12 md:right-12 lg:left-16 lg:right-16 xl:left-24 xl:right-24 2xl:left-32 2xl:right-32',
};

const GUTTER_INSET_LEFT: Record<PortfolioContentGutter, string> = {
  none: 'left-0',
  wide: 'left-4 sm:left-5 lg:left-8 xl:left-10 2xl:left-12',
  medium: 'left-4 sm:left-6 md:left-8 lg:left-10 xl:left-12 2xl:left-16',
  narrow: 'left-5 sm:left-8 md:left-12 lg:left-16 xl:left-24 2xl:left-32',
};

const GUTTER_INSET_RIGHT: Record<PortfolioContentGutter, string> = {
  none: 'right-0',
  wide: 'right-4 sm:right-5 lg:right-8 xl:right-10 2xl:right-12',
  medium: 'right-4 sm:right-6 md:right-8 lg:right-10 xl:right-12 2xl:right-16',
  narrow: 'right-5 sm:right-8 md:right-12 lg:right-16 xl:right-24 2xl:right-32',
};

export function portfolioEditorialGutterX(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return GUTTER_PADDING_X[gutter] ?? GUTTER_PADDING_X.medium;
}

export function portfolioHeroLayerInset(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return GUTTER_LAYER_INSET[gutter] ?? GUTTER_LAYER_INSET.medium;
}

export function portfolioEditorialShellClass(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return `w-full ${portfolioEditorialGutterX(gutter)}`;
}

export function portfolioEditorialGutterInsetLeft(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return GUTTER_INSET_LEFT[gutter] ?? GUTTER_INSET_LEFT.medium;
}

export function portfolioEditorialGutterInsetRight(
  gutter: PortfolioContentGutter = DEFAULT_CONTENT_GUTTER
): string {
  return GUTTER_INSET_RIGHT[gutter] ?? GUTTER_INSET_RIGHT.medium;
}

/**
 * Hero banner content shell — same max-width + horizontal gutter as portfolio `<main>`.
 * Use instead of hard-coded `max-w-[100rem]` / clamp / % side padding.
 */
export function portfolioHeroContentShellClass(
  contentGutter?: PortfolioContentGutter | null,
  contentWidthClass?: string | null
): string {
  const widthClass = contentWidthClass?.trim() || 'max-w-none';
  return `mx-auto w-full ${widthClass} ${portfolioEditorialGutterX(
    contentGutter ?? DEFAULT_CONTENT_GUTTER
  )}`;
}

/** @deprecated Prefer portfolioEditorialGutterX(settings) — medium default. */
export const PORTFOLIO_EDITORIAL_GUTTER_X = GUTTER_PADDING_X.medium;

/** @deprecated Prefer portfolioHeroLayerInset(settings) — medium default. */
export const PORTFOLIO_HERO_LAYER_INSET = GUTTER_LAYER_INSET.medium;
