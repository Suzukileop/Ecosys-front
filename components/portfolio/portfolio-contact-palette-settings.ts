/**
 * Contact palette bindings — which Global token paints icon / CTA colors.
 * Concrete hex fields still drive render; bindings choose the token when palette is on.
 */

import {
  HERO_PALETTE_TOKEN_IDS,
  type HeroPaletteTokenId,
} from '@/components/portfolio/portfolio-hero-palette-settings';

export type ContactColorSlot = 'iconColor' | 'iconBorder' | 'iconBackground' | 'cta';

export type PortfolioContactColorBindings = Record<ContactColorSlot, HeroPaletteTokenId>;

const CONTACT_COLOR_SLOT_IDS: ContactColorSlot[] = [
  'iconColor',
  'iconBorder',
  'iconBackground',
  'cta',
];

export const DEFAULT_CONTACT_COLOR_BINDINGS: PortfolioContactColorBindings = {
  iconColor: 'principal',
  iconBorder: 'bordure',
  iconBackground: 'principal',
  cta: 'principal',
};

export function mergeContactColorBindings(
  base: PortfolioContactColorBindings = DEFAULT_CONTACT_COLOR_BINDINGS,
  patch?: unknown
): PortfolioContactColorBindings {
  const next = { ...base };
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return next;
  const record = patch as Record<string, unknown>;
  for (const slot of CONTACT_COLOR_SLOT_IDS) {
    const value = record[slot];
    if (typeof value === 'string' && (HERO_PALETTE_TOKEN_IDS as string[]).includes(value)) {
      next[slot] = value as HeroPaletteTokenId;
    }
  }
  return next;
}
