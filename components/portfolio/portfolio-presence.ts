import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBriefcase, faBuilding, faLink, faStore } from '@fortawesome/free-solid-svg-icons';
import type { ProfileSectionId } from '@/components/creator/studio/profile-section-nav';

export type PortfolioPresenceKind = 'portfolio' | 'storefront' | 'business' | 'linktrue';

export type PortfolioPresenceOption = {
  id: PortfolioPresenceKind;
  title: string;
  teaser: string;
  icon: IconDefinition;
  sections: readonly ProfileSectionId[];
};

export const PORTFOLIO_PRESENCE_OPTIONS: readonly PortfolioPresenceOption[] = [
  {
    id: 'portfolio',
    title: 'Portfolio',
    teaser: 'Launch a custom page in minutes',
    icon: faBriefcase,
    sections: [
      'about',
      'whyMe',
      'experience',
      'strengths',
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
    icon: faStore,
    sections: ['about', 'aboutUs', 'services', 'products', 'faq', 'links', 'contact', 'reputation'],
  },
  {
    id: 'business',
    title: 'Business presence',
    teaser: 'A clear brand for your company',
    icon: faBuilding,
    sections: [
      'about',
      'aboutUs',
      'whyMe',
      'experience',
      'strengths',
      'team',
      'gallery',
      'faq',
      'links',
      'contact',
      'reputation',
    ],
  },
  {
    id: 'linktrue',
    title: 'Linktrue',
    teaser: 'All your links in one place',
    icon: faLink,
    sections: ['about', 'links', 'contact', 'reputation'],
  },
];

export function getPortfolioPresenceOption(
  kind: PortfolioPresenceKind | null
): PortfolioPresenceOption | undefined {
  if (!kind) return undefined;
  return PORTFOLIO_PRESENCE_OPTIONS.find((option) => option.id === kind);
}

export function isPortfolioPresenceKind(value: unknown): value is PortfolioPresenceKind {
  return value === 'portfolio' || value === 'storefront' || value === 'business' || value === 'linktrue';
}

export function portfolioPresenceShowsAboutUs(kind: string | null | undefined): boolean {
  return kind === 'business' || kind === 'storefront';
}
