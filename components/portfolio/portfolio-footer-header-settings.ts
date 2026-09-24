/**
 * Header — one shared, GSAP-animated header mounted above the Footer section, copied
 * 1:1 (rename-only) from the same mechanism already used by Work/Stack/Tools/Contact/
 * Team/Gallery/Info/FAQ/Services. Independent of the section's own `design` (which of
 * Footer's ~12 layouts renders the content below).
 *
 * Editorial has no pre-existing `titleColor`/`titleFont` fields to borrow here (unlike
 * Team, where Editorial reuses Team's own older title-color system) — Footer never had
 * an equivalent, so Editorial gets its own dedicated `headerEditorialTitleText/
 * SubtitleText/TitleColor` fields instead, following the same per-design-field shape
 * every other design already uses.
 */
export type PortfolioFooterHeaderDesign =
  /** No header mounted above the Footer section at all — the section's own layout
   *  (design below) starts right away. */
  | 'none'
  | 'editorial'
  | 'index'
  | 'serif-lead'
  | 'billboard'
  | 'masthead'
  /** A Footer-local design (same precedent as Info's own local `chapter`/`cover`
   *  additions) — a centered monumental headline with a pill CTA button underneath,
   *  modeled on the "Hero columns" Footer design's own top block. */
  | 'hero'
  /** A Footer-local design — nothing but the creator's full name, fit-to-width,
   *  edge-to-edge, no dedicated text field. Modeled on the "Editorial grid" Footer
   *  design's own monumental name block. */
  | 'name'
  /** A Footer-local design — asymmetric two-column layout, modeled on the
   *  "Timezone editorial" Footer design's own left column (kicker + 2-line headline
   *  + description) with a live local clock + location pinned top-right. */
  | 'timezone';

export type PortfolioFooterHeaderDesignAlignment = 'left' | 'center' | 'right';

/**
 * Bottom spacing under every Header design — one shared scale. `none` collapses the gap
 * entirely, useful with `headerBackgroundUnified` for a seamless header-into-footer canvas.
 */
export type PortfolioFooterHeaderMarginBottom = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export const FOOTER_HEADER_MARGIN_BOTTOM_REM: Record<PortfolioFooterHeaderMarginBottom, number> = {
  none: 0,
  sm: 3,
  md: 5,
  lg: 8,
  xl: 12,
};

/**
 * Header's own internal top/bottom padding — independent of `headerMarginBottom` (the gap
 * AFTER the header, before the Footer body). Same shared step scale, reused for both edges.
 */
export type PortfolioFooterHeaderPaddingStep = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export const FOOTER_HEADER_PADDING_REM: Record<PortfolioFooterHeaderPaddingStep, number> = {
  none: 0,
  sm: 3,
  md: 5,
  lg: 8,
  xl: 12,
};

/** Title size/weight — one shared scale applied proportionally by every Header design. */
export type PortfolioFooterHeaderTitleSize = 'sm' | 'md' | 'lg' | 'xl';
export type PortfolioFooterHeaderTitleWeight = 'light' | 'regular' | 'semibold' | 'bold';

/** Per-element Header colors — real palette tokens only, no ad-hoc CTA/accent field. */
export type PortfolioFooterHeaderPaletteToken = 'principal' | 'secondaire' | 'texteFort';

/** Billboard Header — outline (stroke only), fill (solid color), or simple
 *  (solid color, no glow) big word. */
export type PortfolioFooterHeaderBillboardWordStyle = 'outline' | 'fill' | 'simple';

export const FOOTER_HEADER_DESIGNS: PortfolioFooterHeaderDesign[] = [
  'none', 'editorial', 'index', 'serif-lead', 'billboard', 'masthead', 'hero', 'name', 'timezone',
];

export const FOOTER_HEADER_MARGIN_BOTTOM_STEPS: PortfolioFooterHeaderMarginBottom[] = ['none', 'sm', 'md', 'lg', 'xl'];
export const FOOTER_HEADER_PADDING_STEPS: PortfolioFooterHeaderPaddingStep[] = ['none', 'sm', 'md', 'lg', 'xl'];
export const FOOTER_HEADER_TITLE_SIZES: PortfolioFooterHeaderTitleSize[] = ['sm', 'md', 'lg', 'xl'];
export const FOOTER_HEADER_TITLE_WEIGHTS: PortfolioFooterHeaderTitleWeight[] = ['light', 'regular', 'semibold', 'bold'];
export const FOOTER_HEADER_PALETTE_TOKENS: PortfolioFooterHeaderPaletteToken[] = ['principal', 'secondaire', 'texteFort'];
export const FOOTER_HEADER_BILLBOARD_WORD_STYLES: PortfolioFooterHeaderBillboardWordStyle[] = ['outline', 'fill', 'simple'];

/** Header designs — one shared, GSAP-animated header mounted above the Footer section. */
export const PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS: {
  value: PortfolioFooterHeaderDesign; label: string; description: string;
}[] = [
  { value: 'none', label: 'None', description: 'No header — the footer section starts right away.' },
  { value: 'editorial', label: 'Editorial', description: 'Monumental masked-reveal headline — premium GSAP entrance.' },
  { value: 'index', label: 'Index', description: 'Ledger-style divider rule, a counting numeral, and the title split by a vertical rule.' },
  { value: 'serif-lead', label: 'Serif lead', description: 'Small label above a large serif title.' },
  { value: 'billboard', label: 'Billboard', description: 'Big faint background word behind the title, with a count line.' },
  { value: 'masthead', label: 'Masthead', description: 'Monumental uppercase headline with an intro line underneath.' },
  { value: 'hero', label: 'Hero', description: 'Centered monumental headline with a pill "Get in touch" button underneath.' },
  { value: 'name', label: 'Name', description: 'Just your full name, fit-to-width and edge-to-edge — nothing else.' },
  { value: 'timezone', label: 'Timezone', description: 'Kicker + two-line headline + description on the left, a live local clock and location on the right.' },
];

export const FOOTER_HEADER_PALETTE_TOKEN_OPTIONS: { value: PortfolioFooterHeaderPaletteToken; label: string; description: string }[] = [
  { value: 'principal', label: 'Principal', description: 'Global principal token.' },
  { value: 'secondaire', label: 'Secondary', description: 'Global secondary token.' },
  { value: 'texteFort', label: 'Strong text', description: 'Strong ink token.' },
];

export const FOOTER_HEADER_BILLBOARD_WORD_STYLE_OPTIONS: { value: PortfolioFooterHeaderBillboardWordStyle; label: string; description: string }[] = [
  { value: 'outline', label: 'Outline', description: 'Stroke only, with a soft glow.' },
  { value: 'fill', label: 'Fill', description: 'Solid characters, with a soft glow.' },
  { value: 'simple', label: 'Simple', description: 'Solid characters, no glow — plain.' },
];

/** Resolves a palette-token choice to a concrete color — no free-form hex,
 *  every Header element bound to one of our actual palette colors. */
export function footerHeaderPaletteTokenColor(token: PortfolioFooterHeaderPaletteToken): string {
  if (token === 'secondaire') return 'var(--pf-palette-secondaire, #3b82f6)';
  if (token === 'texteFort') return 'var(--pf-palette-texte-fort, #f5f5f5)';
  return 'var(--pf-palette-principal, #f97316)';
}
