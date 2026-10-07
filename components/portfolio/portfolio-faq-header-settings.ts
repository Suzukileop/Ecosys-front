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
  | 'split-heading'
  | 'signal'
  | 'query'
  | 'dialogue';

/** The 4 designs surfaced in FAQ's own Header tab (see portfolio-faq-settings-panel.tsx) —
 *  'editorial' is the original classic layout (kicker + masked-reveal title + subtitle),
 *  re-exposed here by request after being removed from the UI along with the other 7 (see
 *  faq-settings-header-removed-pill-tabs memory); the other 7 of the original 8 stay frozen
 *  — still fully rendered for any account that already has one saved, but not selectable from
 *  this UI. 'signal'/'query'/'dialogue' are 3 newer, purpose-built designs (see
 *  faq-header-tab-3-new-designs memory), not a restoration of the old set. */
export type PortfolioFaqHeaderDesignSelectable = 'editorial' | 'signal' | 'query' | 'dialogue';

export const FAQ_HEADER_DESIGNS_SELECTABLE: PortfolioFaqHeaderDesignSelectable[] = [
  'editorial',
  'signal',
  'query',
  'dialogue',
];

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
  'signal',
  'query',
  'dialogue',
];

export const FAQ_HEADER_MARGIN_BOTTOM_STEPS: PortfolioFaqHeaderMarginBottom[] = ['sm', 'md', 'lg', 'xl'];
export const FAQ_HEADER_TITLE_SIZES: PortfolioFaqHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const FAQ_HEADER_TITLE_WEIGHTS: PortfolioFaqHeaderTitleWeight[] = [
  'light',
  'regular',
  'semibold',
  'bold',
];
/** Editorial's own `headerTitleWeight` scale: the shared 4 steps plus a heavier top step
 *  (Editorial reads every step one notch lighter, so 'extrabold' renders as plain Bold).
 *  Kept separate so the legacy designs' weight Records don't have to grow a 5th key. */
export type PortfolioFaqHeaderEditorialTitleWeight = PortfolioFaqHeaderTitleWeight | 'extrabold';
export const FAQ_HEADER_EDITORIAL_TITLE_WEIGHTS: PortfolioFaqHeaderEditorialTitleWeight[] = [
  ...FAQ_HEADER_TITLE_WEIGHTS,
  'extrabold',
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

/** What FAQ's own Header tab picker actually renders (see portfolio-faq-settings-panel.tsx),
 *  narrowed to `PortfolioFaqHeaderDesignSelectable`. Kept as its own literal array rather than
 *  filtering the big list above so its `value` type narrows correctly for the picker/wireframe
 *  components. 'editorial' reuses the exact same `FaqHeaderEditorialHeader` component/entry as
 *  the frozen legacy one above — same design, just re-exposed in this picker. */
export const PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS: {
  value: PortfolioFaqHeaderDesignSelectable;
  label: string;
  description: string;
}[] = [
  {
    value: 'editorial',
    label: 'Editorial',
    description: 'Kicker + masked line-reveal title + subtitle — premium GSAP entrance.',
  },
  {
    value: 'signal',
    label: 'Signal',
    description: 'Pulsing "live" status pill with a question count, asymmetric title + side-note subtitle.',
  },
  {
    value: 'query',
    label: 'Query',
    description: 'Vertical rotated label, giant faint "?" watermark drifting behind the title on scroll.',
  },
  {
    value: 'dialogue',
    label: 'Dialogue',
    description: 'Title words alternate bold/light for a conversational rhythm, floating question-count badge.',
  },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function faqHeaderPaletteTokenColor(token: PortfolioFaqHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}
