import type { CSSProperties } from 'react';
import type { PortfolioInfoHeaderFont } from '@/components/portfolio/portfolio-info-settings';

/**
 * Header — one shared, GSAP-animated header mounted above the Info section, copied
 * 1:1 from the Portfolio/Work section's "Header" mechanism (chosen from 8 editorial
 * layouts). Independent of Design's `cardDesign` (which layout the info card renders in).
 */
export type PortfolioInfoHeaderDesign =
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading'
  | 'chapter'
  | 'cover';

export type PortfolioInfoHeaderDesignAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every Header design — one shared scale, same 4 steps everywhere. */
export type PortfolioInfoHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const INFO_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioInfoHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioInfoHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioInfoHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioInfoHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count Header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioInfoHeaderAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioInfoHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const INFO_HEADER_DESIGNS: PortfolioInfoHeaderDesign[] = [
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
  'chapter',
  'cover',
];

export const INFO_HEADER_MARGIN_BOTTOM_STEPS: PortfolioInfoHeaderMarginBottom[] = [
  'sm',
  'md',
  'lg',
  'xl',
];
export const INFO_HEADER_TITLE_SIZES: PortfolioInfoHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const INFO_HEADER_TITLE_WEIGHTS: PortfolioInfoHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
export const INFO_HEADER_PALETTE_TOKENS: PortfolioInfoHeaderPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
];
export const INFO_HEADER_ACCENT_COUNT_ALIGNMENTS: PortfolioInfoHeaderAccentCountAlignment[] = [
  'left',
  'center',
  'right',
];
export const INFO_HEADER_BILLBOARD_WORD_STYLES: PortfolioInfoHeaderBillboardWordStyle[] = [
  'outline',
  'fill',
  'simple',
];

/** Header designs — one shared, GSAP-animated header mounted above the Info section. */
export const PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS: {
  value: PortfolioInfoHeaderDesign;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Kicker + masked line-reveal title + subtitle — premium GSAP entrance.',
  },
  {
    value: 'marquee',
    label: 'Marquee',
    description: 'Bold title over a scrolling decorative word band.',
  },
  {
    value: 'index',
    label: 'Index',
    description: 'Ledger-style divider rule, a counting numeral, and the title split by a vertical rule.',
  },
  {
    value: 'accent-count',
    label: 'Accent count',
    description: 'Small accent badge with a live count, lead line, and title.',
  },
  {
    value: 'serif-lead',
    label: 'Serif lead',
    description: 'Small label above a large serif title.',
  },
  {
    value: 'billboard',
    label: 'Billboard',
    description: 'Big faint background word behind the title, with a count line.',
  },
  {
    value: 'masthead',
    label: 'Masthead',
    description: 'Monumental uppercase headline with an intro line underneath.',
  },
  {
    value: 'split-heading',
    label: 'Split heading',
    description: 'Title left with an editorial italic word, small label top-right.',
  },
  {
    value: 'chapter',
    label: 'Chapter',
    description: 'Italic serif chapter number inline with the title, underlined by an accent rule.',
  },
  {
    value: 'cover',
    label: 'Cover',
    description: 'Magazine-cover masthead — up to 3 centered italic serif lines, each masked and revealed on scroll.',
  },
];

export const INFO_HEADER_PALETTE_TOKEN_OPTIONS: {
  value: PortfolioInfoHeaderPaletteToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Global principal token.' },
  { value: 'secondaire', label: 'Secondary', description: 'Global secondary token.' },
  { value: 'texteFort', label: 'Strong text', description: 'Strong ink token.' },
];

export const INFO_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS: {
  value: PortfolioInfoHeaderAccentCountAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default editorial alignment.' },
  { value: 'center', label: 'Center', description: 'Centered line.' },
  { value: 'right', label: 'Right', description: 'Right-aligned line.' },
];

export const INFO_HEADER_BILLBOARD_WORD_STYLE_OPTIONS: {
  value: PortfolioInfoHeaderBillboardWordStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: 'Outline', description: 'Stroke only, with a soft glow.' },
  { value: 'fill', label: 'Fill', description: 'Solid characters, with a soft glow.' },
  { value: 'simple', label: 'Simple', description: 'Solid characters, no glow — plain.' },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function infoHeaderPaletteTokenColor(token: PortfolioInfoHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}

export function infoHeaderDesignFontClass(
  font: PortfolioInfoHeaderFont,
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

export function infoHeaderDesignFontStyle(_font: PortfolioInfoHeaderFont): CSSProperties | undefined {
  return undefined;
}
