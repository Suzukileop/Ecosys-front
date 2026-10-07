import type { PortfolioContactHeaderFont } from '@/components/portfolio/portfolio-contact-settings';

/**
 * Header — one shared, GSAP-animated header mounted above the Contact section, copied
 * 1:1 from the Portfolio/Work section's "Header" mechanism (chosen from 8 editorial
 * layouts). Independent of Design's `cardDesign` (which layout the contact card renders in).
 */
export type PortfolioContactHeaderDesign =
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

export type PortfolioContactHeaderDesignAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every Header design — one shared scale, same 4 steps everywhere. */
export type PortfolioContactHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const CONTACT_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioContactHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioContactHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioContactHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioContactHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count Header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioContactHeaderAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioContactHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const CONTACT_HEADER_DESIGNS: PortfolioContactHeaderDesign[] = [
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
];

export const CONTACT_HEADER_MARGIN_BOTTOM_STEPS: PortfolioContactHeaderMarginBottom[] = [
  'sm',
  'md',
  'lg',
  'xl',
];
export const CONTACT_HEADER_TITLE_SIZES: PortfolioContactHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const CONTACT_HEADER_TITLE_WEIGHTS: PortfolioContactHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
export const CONTACT_HEADER_PALETTE_TOKENS: PortfolioContactHeaderPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
];
export const CONTACT_HEADER_ACCENT_COUNT_ALIGNMENTS: PortfolioContactHeaderAccentCountAlignment[] = [
  'left',
  'center',
  'right',
];
export const CONTACT_HEADER_BILLBOARD_WORD_STYLES: PortfolioContactHeaderBillboardWordStyle[] = [
  'outline',
  'fill',
  'simple',
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function contactHeaderPaletteTokenColor(token: PortfolioContactHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}

export function contactHeaderDesignFontClass(
  font: PortfolioContactHeaderFont,
  kind: 'title' | 'subtitle'
): string {
  if (kind === 'title') {
    switch (font) {
      case 'serif':
        return 'font-serif font-bold tracking-[-0.03em]';
      case 'display':
        return 'font-black uppercase tracking-[0.08em]';
      default:
        return 'font-extrabold tracking-[-0.04em]';
    }
  }
  switch (font) {
    case 'serif':
      return 'font-serif leading-relaxed';
    case 'display':
      return 'font-bold uppercase tracking-[0.12em]';
    default:
      return 'leading-relaxed';
  }
}
