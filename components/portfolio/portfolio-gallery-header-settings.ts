import type { CSSProperties } from 'react';
import type { PortfolioGalleryHeaderFont } from '@/components/portfolio/portfolio-gallery-settings';

/**
 * Header — one shared, GSAP-animated header mounted above the Gallery section, copied
 * 1:1 from the Portfolio/Work section's "Header" mechanism (chosen from 8 editorial
 * layouts). Independent of Design's `design` (which grid layout the gallery renders in).
 */
export type PortfolioGalleryHeaderDesign =
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

export type PortfolioGalleryHeaderDesignAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every Header design — one shared scale, same 4 steps everywhere. */
export type PortfolioGalleryHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const GALLERY_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioGalleryHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioGalleryHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioGalleryHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioGalleryHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count Header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioGalleryHeaderAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioGalleryHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const GALLERY_HEADER_DESIGNS: PortfolioGalleryHeaderDesign[] = [
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
];

export const GALLERY_HEADER_MARGIN_BOTTOM_STEPS: PortfolioGalleryHeaderMarginBottom[] = [
  'sm',
  'md',
  'lg',
  'xl',
];
export const GALLERY_HEADER_TITLE_SIZES: PortfolioGalleryHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const GALLERY_HEADER_TITLE_WEIGHTS: PortfolioGalleryHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
export const GALLERY_HEADER_PALETTE_TOKENS: PortfolioGalleryHeaderPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
];
export const GALLERY_HEADER_ACCENT_COUNT_ALIGNMENTS: PortfolioGalleryHeaderAccentCountAlignment[] = [
  'left',
  'center',
  'right',
];
export const GALLERY_HEADER_BILLBOARD_WORD_STYLES: PortfolioGalleryHeaderBillboardWordStyle[] = [
  'outline',
  'fill',
  'simple',
];

/** Header designs — one shared, GSAP-animated header mounted above the Gallery section. */
export const PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS: {
  value: PortfolioGalleryHeaderDesign;
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
];

export const GALLERY_HEADER_PALETTE_TOKEN_OPTIONS: {
  value: PortfolioGalleryHeaderPaletteToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Global principal token.' },
  { value: 'secondaire', label: 'Secondary', description: 'Global secondary token.' },
  { value: 'texteFort', label: 'Strong text', description: 'Strong ink token.' },
];

export const GALLERY_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS: {
  value: PortfolioGalleryHeaderAccentCountAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default editorial alignment.' },
  { value: 'center', label: 'Center', description: 'Centered line.' },
  { value: 'right', label: 'Right', description: 'Right-aligned line.' },
];

export const GALLERY_HEADER_BILLBOARD_WORD_STYLE_OPTIONS: {
  value: PortfolioGalleryHeaderBillboardWordStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: 'Outline', description: 'Stroke only, with a soft glow.' },
  { value: 'fill', label: 'Fill', description: 'Solid characters, with a soft glow.' },
  { value: 'simple', label: 'Simple', description: 'Solid characters, no glow — plain.' },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function galleryHeaderPaletteTokenColor(token: PortfolioGalleryHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}

export function galleryHeaderDesignFontClass(
  font: PortfolioGalleryHeaderFont,
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

export function galleryHeaderDesignFontStyle(_font: PortfolioGalleryHeaderFont): CSSProperties | undefined {
  return undefined;
}
