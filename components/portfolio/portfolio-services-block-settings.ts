import { resolveSectionOrder } from '@/components/portfolio/portfolio-global-settings';
import { portfolioSectionTitleSentenceCase } from '@/components/portfolio/portfolio-section-title';
import type { PortfolioNavSectionKey } from '@/components/portfolio/portfolio-nav-items';
import type { PortfolioServicesBlockScope, PortfolioServicesSectionOrganization, PortfolioServicesSectionSettings } from '@/components/portfolio/portfolio-services-settings';

export function servicesUsesDistinctSections(
  organization: PortfolioServicesSectionOrganization
): boolean {
  return organization === 'distinct';
}

export function resolveDistinctBlockSectionTitle(
  settings: PortfolioServicesSectionSettings,
  kind: PortfolioServicesBlockScope
): string {
  const header = kind === 'skills' ? settings.skillsHeader : settings.servicesHeader;

  const raw = (() => {
    if (kind === 'skills') {
      switch (header.titlePreset) {
        case 'expertise':
          return 'EXPERTISE';
        case 'skills-services':
          return 'SKILLS & SERVICES';
        case 'custom':
          return header.titleCustom.trim() || 'SKILLS & TOOLS';
        default:
          return 'SKILLS & TOOLS';
      }
    }

    switch (header.titlePreset) {
      case 'what-i-offer':
        return 'WHAT I OFFER';
      case 'expertise':
        return 'EXPERTISE';
      case 'skills-services':
        return 'SERVICES';
      case 'custom':
        return header.titleCustom.trim() || 'SERVICES';
      default:
        return 'SERVICES';
    }
  })();

  return portfolioSectionTitleSentenceCase(raw);
}

export function resolveDistinctBlockSectionSubtitle(
  settings: PortfolioServicesSectionSettings,
  kind: PortfolioServicesBlockScope
): string {
  const header = kind === 'skills' ? settings.skillsHeader : settings.servicesHeader;

  if (kind === 'skills') {
    switch (header.subtitlePreset) {
      case 'minimal':
        return '';
      case 'short':
        return 'Software, plugins, and workflow essentials I rely on every day.';
      case 'craft':
        return 'Hands-on expertise across the tools and technologies behind my work.';
      case 'custom':
        return header.subtitleCustom.trim();
      default:
        return '';
    }
  }

  switch (header.subtitlePreset) {
    case 'minimal':
      return '';
    case 'short':
      return 'Clear packages, pricing, and delivery — built around your project.';
    case 'collaboration':
      return 'Tailored support from brief to delivery — built around your goals.';
    case 'craft':
      return 'Reliable services and deliverables you can count on.';
    case 'custom':
      return header.subtitleCustom.trim();
    default:
      return '';
  }
}

export function resolvePortfolioContentSectionOrder(
  order: PortfolioNavSectionKey[] | undefined,
  _sectionOrganization?: PortfolioServicesSectionOrganization
): PortfolioNavSectionKey[] {
  // Skills and Infos / Why choose me (about) were removed as portfolio content sections.
  return resolveSectionOrder(order).filter(
    (key) => (key as string) !== 'skills' && key !== 'about'
  );
}
