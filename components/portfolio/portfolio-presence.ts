import type { ProfileSectionId } from '@/components/creator/studio/profile-section-nav';

export type PortfolioPresenceKind = 'portfolio' | 'storefront' | 'business';

/**
 * Retired. Accounts that picked it before it was removed still have the string on record, so it is
 * translated on read rather than rejected — otherwise those creators would be thrown back to the
 * picker with their section filter silently reset. `portfolio` is the closest survivor: it is the
 * only remaining kind whose sections still include `links`.
 */
const RETIRED_PRESENCE_KINDS: Record<string, PortfolioPresenceKind> = { linktrue: 'portfolio' };

export type PortfolioPresenceOption = {
  id: PortfolioPresenceKind;
  title: string;
  teaser: string;
  /* No icon here any more: the panel's mark is a drawn SVG keyed by `id` in
     `portfolio-presence-icons`, which keeps this module free of any icon library. */
  sections: readonly ProfileSectionId[];
};

export const PORTFOLIO_PRESENCE_OPTIONS: readonly PortfolioPresenceOption[] = [
  {
    id: 'portfolio',
    title: 'Portfolio',
    teaser: 'Launch a custom page in minutes',
    sections: [
      'about',
      'aboutPage',
      'experience',
      'strengths',
      'tools',
      'portfolio',
      'gallery',
      'faq',
      'links',
      'contact',
      'reputation',
    ],
  },
  {
    id: 'storefront',
    title: 'Storefront',
    teaser: 'Sell products and services simply',
    sections: ['about', 'aboutPage', 'aboutUs', 'services', 'products', 'faq', 'links', 'contact', 'reputation'],
  },
  {
    id: 'business',
    title: 'Business presence',
    teaser: 'A clear brand for your company',
    sections: [
      'about',
      'aboutPage',
      'aboutUs',
      'experience',
      'strengths',
      'tools',
      'team',
      'gallery',
      'faq',
      'links',
      'contact',
      'reputation',
    ],
  },
];

export function getPortfolioPresenceOption(
  kind: PortfolioPresenceKind | null
): PortfolioPresenceOption | undefined {
  if (!kind) return undefined;
  return PORTFOLIO_PRESENCE_OPTIONS.find((option) => option.id === kind);
}

export function isPortfolioPresenceKind(value: unknown): value is PortfolioPresenceKind {
  return value === 'portfolio' || value === 'storefront' || value === 'business';
}

/** Normalises a stored value, translating any retired kind. Returns null when unrecognised. */
export function normalizePortfolioPresenceKind(value: unknown): PortfolioPresenceKind | null {
  if (isPortfolioPresenceKind(value)) return value;
  if (typeof value === 'string' && value in RETIRED_PRESENCE_KINDS) {
    return RETIRED_PRESENCE_KINDS[value];
  }
  return null;
}

export function portfolioPresenceShowsAboutUs(kind: string | null | undefined): boolean {
  return kind === 'business' || kind === 'storefront';
}
