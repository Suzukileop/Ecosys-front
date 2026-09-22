/**
 * Header — a second, independent header slot for the FAQ section, copied
 * 1:1 from the Portfolio/Work section's "Header" mechanism (one shared,
 * GSAP-animated header design mounted above the section, chosen from 8
 * editorial layouts — same mechanism as Stack, Tools, Contact, Team, Gallery,
 * and Info). Kept fully separate from FAQ's own `design` (two-column/panel/
 * split/cta-split) — Header renders as the section's title block, wherever
 * that design places it, not a replacement for the design itself.
 */
export type PortfolioFaqHeaderDesign =
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

export type PortfolioFaqHeaderDesignAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every Header design — one shared scale, same 4 steps everywhere. */
export type PortfolioFaqHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const FAQ_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioFaqHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioFaqHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioFaqHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioFaqHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count Header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioFaqHeaderAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioFaqHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const FAQ_HEADER_DESIGNS: PortfolioFaqHeaderDesign[] = [
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
];

export const FAQ_HEADER_MARGIN_BOTTOM_STEPS: PortfolioFaqHeaderMarginBottom[] = ['sm', 'md', 'lg', 'xl'];
export const FAQ_HEADER_TITLE_SIZES: PortfolioFaqHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const FAQ_HEADER_TITLE_WEIGHTS: PortfolioFaqHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
export const FAQ_HEADER_PALETTE_TOKENS: PortfolioFaqHeaderPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
];
export const FAQ_HEADER_ACCENT_COUNT_ALIGNMENTS: PortfolioFaqHeaderAccentCountAlignment[] = [
  'left',
  'center',
  'right',
];
export const FAQ_HEADER_BILLBOARD_WORD_STYLES: PortfolioFaqHeaderBillboardWordStyle[] = [
  'outline',
  'fill',
  'simple',
];

/** Header designs — one shared, GSAP-animated header mounted above the FAQ section,
 *  independent of FAQ's own Design tab. */
export const PORTFOLIO_FAQ_HEADER_DESIGN_OPTIONS: {
  value: PortfolioFaqHeaderDesign;
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

export const PORTFOLIO_FAQ_HEADER_PALETTE_TOKEN_OPTIONS: {
  value: PortfolioFaqHeaderPaletteToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: 'Principal', description: 'Global principal token.' },
  { value: 'secondaire', label: 'Secondary', description: 'Global secondary token.' },
  { value: 'texteFort', label: 'Strong text', description: 'Strong ink token.' },
];

export const PORTFOLIO_FAQ_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS: {
  value: PortfolioFaqHeaderAccentCountAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: 'Left', description: 'Default editorial alignment.' },
  { value: 'center', label: 'Center', description: 'Centered line.' },
  { value: 'right', label: 'Right', description: 'Right-aligned line.' },
];

export const PORTFOLIO_FAQ_HEADER_BILLBOARD_WORD_STYLE_OPTIONS: {
  value: PortfolioFaqHeaderBillboardWordStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: 'Outline', description: 'Stroke only, with a soft glow.' },
  { value: 'fill', label: 'Fill', description: 'Solid characters, with a soft glow.' },
  { value: 'simple', label: 'Simple', description: 'Solid characters, no glow — plain.' },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function faqHeaderPaletteTokenColor(token: PortfolioFaqHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}
