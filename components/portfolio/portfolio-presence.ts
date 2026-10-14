import type { ProfileSectionId } from '@/components/creator/studio/profile-section-nav';
import { msg } from '@/lib/i18n/config';

export type PortfolioPresenceKind = 'portfolio' | 'storefront' | 'business';

/**
 * Retired. Accounts that picked it before it was removed still have the string on record, so it is
 * translated on read rather than rejected — otherwise those creators would be thrown back to the
 * picker with their section filter silently reset. `portfolio` is the closest survivor: it is the
 * only remaining kind whose sections still include `links`.
 */
const RETIRED_PRESENCE_KINDS: Record<string, PortfolioPresenceKind> = { linktrue: 'portfolio' };

type PortfolioPresenceOption = {
  id: PortfolioPresenceKind;
  title: string;
  teaser: string;
  /** The longer line, revealed on hover — what the kind actually gives you, not a slogan. */
  description: string;
  /** Landing-hero still used as the card's full-bleed background. */
  image: string;
  imageAlt: string;
  /* No icon here any more: the panel's mark is a drawn SVG keyed by `id` in
     `portfolio-presence-icons`, which keeps this module free of any icon library. */
  sections: readonly ProfileSectionId[];
};

export const PORTFOLIO_PRESENCE_OPTIONS: readonly PortfolioPresenceOption[] = [
  {
    id: 'portfolio',
    title: msg('Portfolio'),
    teaser: msg('Launch a custom page in minutes'),
    description:
      msg('Your work, experience, tools and contact details on one page you can send anywhere.'),
    image: '/landing/hero/presence-portfolio-v11.jpg',
    imageAlt: msg('Professional in a navy blazer with arms crossed and a wristwatch, face out of frame'),
    sections: [
      'about',
      'aboutPage',
      'aboutUs',
      'experience',
      'strengths',
      'tools',
      'portfolio',
      'gallery',
      'faq',
      'links',
      'contact',
    ],
  },
  {
    id: 'storefront',
    title: msg('Storefront'),
    teaser: msg('Sell products and services simply'),
    description:
      msg('Products and services with pricing, plus the pages a buyer reads before they commit.'),
    image: '/landing/hero/presence-storefront-v8.jpg',
    imageAlt: msg('Refined boutique with tailored suits, a watch vitrine and perfume shelves'),
    sections: ['about', 'aboutPage', 'aboutUs', 'services', 'products', 'faq', 'links', 'contact'],
  },
  {
    id: 'business',
    title: msg('Business presence'),
    teaser: msg('A clear brand for your company'),
    description:
      msg('Team, about and gallery sections, for a brand that speaks for more than one person.'),
    image: '/landing/hero/presence-business-v11.jpg',
    imageAlt: msg('Hands working on a laptop spreadsheet at a bright desk, seen from above'),
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
    ],
  },
];

export function getPortfolioPresenceOption(
  kind: PortfolioPresenceKind | null
): PortfolioPresenceOption | undefined {
  if (!kind) return undefined;
  return PORTFOLIO_PRESENCE_OPTIONS.find((option) => option.id === kind);
}

function isPortfolioPresenceKind(value: unknown): value is PortfolioPresenceKind {
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

/** About us (company story, founder, tasks) is offered to every presence: a freelancer or a
 *  solo portfolio can present their studio too. It still only renders once it has content. */
export function portfolioPresenceShowsAboutUs(kind: string | null | undefined): boolean {
  void kind;
  return true;
}
