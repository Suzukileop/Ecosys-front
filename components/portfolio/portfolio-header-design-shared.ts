/**
 * Shared contract for every header-design component in `stack-header-designs/` and
 * `tools-header-designs/`. Both folders' components only ever read title/subtitle
 * color+font, an optional accent and rule color, and alignment — a small slice both
 * Stack's and Tools' full presentation settings satisfy by construction. Typing every
 * component against this minimal shape (instead of the section-specific presentation
 * type) is what lets Stack render any Tools header design and vice versa: either
 * section's full presentation object can be passed straight through, no adapting.
 */

export type PortfolioHeaderDesign =
  | 'mask'
  | 'split'
  | 'typewriter'
  | 'index'
  | 'masthead'
  | 'marquee'
  | 'focus'
  | 'terminal'
  | 'bracket'
  | 'underline'
  | 'cascade'
  | 'mosaic';

export type PortfolioHeaderVisualFont = 'sans' | 'serif' | 'display';
export type PortfolioHeaderVisualAlignment = 'left' | 'center' | 'right';

/** Gap between the header block (title/subtitle/decoration) and whatever renders
 *  below it (the gallery). Applied as the header root's own margin-bottom, so it
 *  works the same way regardless of which of the 12 header designs is active. */
export type PortfolioHeaderBottomSpacing = 'tight' | 'medium' | 'large' | 'xlarge';

export const PORTFOLIO_HEADER_BOTTOM_SPACING_OPTIONS: {
  value: PortfolioHeaderBottomSpacing;
  label: string;
}[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra large' },
];

const HEADER_BOTTOM_SPACING_CLASS: Record<PortfolioHeaderBottomSpacing, string> = {
  tight: 'mb-6 sm:mb-8',
  medium: 'mb-10 sm:mb-12',
  large: 'mb-14 sm:mb-16',
  xlarge: 'mb-20 sm:mb-24',
};

export function headerBottomSpacingClass(spacing: PortfolioHeaderBottomSpacing | undefined): string {
  return HEADER_BOTTOM_SPACING_CLASS[spacing ?? 'medium'];
}

export type PortfolioHeaderVisualPresentation = {
  titleColor?: string;
  subtitleColor?: string;
  cardBorderColor?: string;
  levelAccentColor?: string;
  titleFont?: PortfolioHeaderVisualFont;
  subtitleFont?: PortfolioHeaderVisualFont;
  headerAlignment?: PortfolioHeaderVisualAlignment;
  headerBottomSpacing?: PortfolioHeaderBottomSpacing;
};

export type PortfolioHeaderDesignProps = {
  title: string;
  subtitle?: string;
  presentation: PortfolioHeaderVisualPresentation;
};

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function headerDesignAlignClass(alignment: PortfolioHeaderVisualAlignment | undefined): string {
  if (alignment === 'center') return 'items-center text-center mx-auto';
  if (alignment === 'right') return 'items-end text-right ml-auto';
  return 'items-start text-left';
}
