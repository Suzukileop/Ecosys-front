import { msg } from '@/lib/i18n/config';
/**
 * Header — a second, independent header slot for the Stack section, copied
 * 1:1 from the Portfolio/Work section's "Header" mechanism (one shared,
 * GSAP-animated header design mounted above the section, chosen from 8
 * editorial layouts). Kept fully separate from Stack's own `headerDesign`
 * (mask/split/typewriter/…) — Header renders as an additional block, not a
 * replacement.
 */
export type PortfolioStackHeaderDesign =
  | 'none'
  | 'editorial'
  | 'marquee'
  | 'index'
  | 'accent-count'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  | 'split-heading';

type PortfolioStackHeaderFont = 'sans' | 'serif' | 'display';

export type PortfolioStackHeaderDesignAlignment = 'left' | 'center' | 'right';

/** Bottom spacing under every Header design — one shared scale, same 4 steps everywhere. */
export type PortfolioStackHeaderMarginBottom = 'sm' | 'md' | 'lg' | 'xl';
export const STACK_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioStackHeaderMarginBottom, number> = {
  sm: 1.5,
  md: 2.5,
  lg: 4,
  xl: 6,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioStackHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioStackHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioStackHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Accent count Header — its own 3-way alignment, independent of the shared left/center. */
export type PortfolioStackHeaderAccentCountAlignment = 'left' | 'center' | 'right';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioStackHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const STACK_HEADER_DESIGNS: PortfolioStackHeaderDesign[] = [
  'none',
  'editorial',
  'marquee',
  'index',
  'accent-count',
  'serif-lead',
  'billboard',
  'masthead',
  'split-heading',
];

export const STACK_HEADER_MARGIN_BOTTOM_STEPS: PortfolioStackHeaderMarginBottom[] = [
  'sm',
  'md',
  'lg',
  'xl',
];
export const STACK_HEADER_TITLE_SIZES: PortfolioStackHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const STACK_HEADER_TITLE_WEIGHTS: PortfolioStackHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
export const STACK_HEADER_PALETTE_TOKENS: PortfolioStackHeaderPaletteToken[] = [
  'principal',
  'secondaire',
  'texteFort',
];
export const STACK_HEADER_ACCENT_COUNT_ALIGNMENTS: PortfolioStackHeaderAccentCountAlignment[] = [
  'left',
  'center',
  'right',
];
export const STACK_HEADER_BILLBOARD_WORD_STYLES: PortfolioStackHeaderBillboardWordStyle[] = [
  'outline',
  'fill',
  'simple',
];

/** Header designs — one shared, GSAP-animated header mounted above the Stack section,
 *  independent of Stack's own Header. */
export const PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS: {
  value: PortfolioStackHeaderDesign;
  label: string;
  description: string;
}[] = [
  { value: 'none', label: msg('None'), description: '' },
  {
    value: 'editorial',
    label: msg('Editorial'),
    description: msg('Kicker + masked line-reveal title + subtitle — premium GSAP entrance.'),
  },
  {
    value: 'marquee',
    label: msg('Marquee'),
    description: msg('Bold title over a scrolling decorative word band.'),
  },
  {
    value: 'index',
    label: msg('Index'),
    description: msg('Ledger-style divider rule, a counting numeral, and the title split by a vertical rule.'),
  },
  {
    value: 'accent-count',
    label: msg('Accent count'),
    description: msg('Small accent badge with a live count, lead line, and title.'),
  },
  {
    value: 'serif-lead',
    label: msg('Serif lead'),
    description: msg('Small label above a large serif title.'),
  },
  {
    value: 'billboard',
    label: msg('Billboard'),
    description: msg('Big faint background word behind the title, with a count line.'),
  },
  {
    value: 'masthead',
    label: msg('Masthead'),
    description: msg('Monumental uppercase headline with an intro line underneath.'),
  },
  {
    value: 'split-heading',
    label: msg('Split heading'),
    description: msg('Title left with an editorial italic word, small label top-right.'),
  },
];

export const STACK_HEADER_PALETTE_TOKEN_OPTIONS: {
  value: PortfolioStackHeaderPaletteToken;
  label: string;
  description: string;
}[] = [
  { value: 'principal', label: msg('Principal'), description: msg('Global principal token.') },
  { value: 'secondaire', label: msg('Secondary'), description: msg('Global secondary token.') },
  { value: 'texteFort', label: msg('Strong text'), description: msg('Strong ink token.') },
];

export const STACK_HEADER_ACCENT_COUNT_ALIGNMENT_OPTIONS: {
  value: PortfolioStackHeaderAccentCountAlignment;
  label: string;
  description: string;
}[] = [
  { value: 'left', label: msg('Left'), description: msg('Default editorial alignment.') },
  { value: 'center', label: msg('Center'), description: msg('Centered line.') },
  { value: 'right', label: msg('Right'), description: msg('Right-aligned line.') },
];

export const STACK_HEADER_BILLBOARD_WORD_STYLE_OPTIONS: {
  value: PortfolioStackHeaderBillboardWordStyle;
  label: string;
  description: string;
}[] = [
  { value: 'outline', label: msg('Outline'), description: msg('Stroke only, with a soft glow.') },
  { value: 'fill', label: msg('Fill'), description: msg('Solid characters, with a soft glow.') },
  { value: 'simple', label: msg('Simple'), description: msg('Solid characters, no glow — plain.') },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function stackHeaderPaletteTokenColor(token: PortfolioStackHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}

export function stackHeaderDesignFontClass(
  font: PortfolioStackHeaderFont,
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
