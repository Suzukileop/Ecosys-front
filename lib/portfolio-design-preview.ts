import {
  PORTFOLIO_FOOTER_DESIGN_OPTIONS,
  type PortfolioFooterDesign,
} from '@/components/portfolio/portfolio-footer-settings';
import {
  PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS,
  type PortfolioFooterHeaderDesign,
} from '@/components/portfolio/portfolio-footer-header-settings';
import {
  CONTACT_PREMIUM_DESIGNS,
  type PortfolioContactPremiumDesign,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  PORTFOLIO_TEAM_LAYOUT_OPTIONS,
  type PortfolioTeamLayout,
} from '@/components/portfolio/portfolio-team-settings';
import {
  PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS,
  type PortfolioTeamHeaderDesign,
} from '@/components/portfolio/portfolio-team-header-settings';
import {
  PORTFOLIO_GALLERY_DESIGN_OPTIONS,
  type PortfolioGalleryDesign,
} from '@/components/portfolio/portfolio-gallery-settings';
import {
  PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS,
  type PortfolioGalleryHeaderDesign,
} from '@/components/portfolio/portfolio-gallery-header-settings';
import {
  PORTFOLIO_FAQ_DESIGN_OPTIONS,
  type PortfolioFaqDesign,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS,
  type PortfolioExperienceDesign,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  PORTFOLIO_EXPERIENCE_HEADER_DESIGN_OPTIONS,
  type PortfolioExperienceHeaderDesign,
} from '@/components/portfolio/portfolio-experience-header-settings';
import {
  PORTFOLIO_ABOUT_US_DESIGN_OPTIONS,
  type PortfolioAboutUsDesign,
} from '@/components/portfolio/portfolio-about-us-settings';
import {
  PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS,
  type PortfolioServicesSectionDesign,
} from '@/components/portfolio/portfolio-services-settings';
import { PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS, type PortfolioServicesHeaderDesign } from '@/components/portfolio/portfolio-services-header-settings';
import {
  PORTFOLIO_TOOLS_DESIGN_OPTIONS,
  type PortfolioToolsDesign,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS,
  type PortfolioWorkSectionDesign,
} from '@/components/portfolio/portfolio-work-settings';
import {
  PORTFOLIO_INFO_DESIGN_OPTIONS,
  type PortfolioInfoDesign,
} from '@/components/portfolio/portfolio-info-settings';
import {
  PORTFOLIO_STACK_DESIGN_OPTIONS,
  type PortfolioStackDesign,
} from '@/components/portfolio/portfolio-stack-settings';
import {
  PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS,
  type PortfolioHeroBannerDesign,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS,
  type PortfolioNavLayoutDesign,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { PORTFOLIO_STUDIO_PREVIEW_SOURCE, withPortfolioStudioEmbed } from '@/lib/portfolio-studio-preview';
import type { MarketplaceContentItem, MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS, type PortfolioFaqHeaderDesignSelectable } from '@/components/portfolio/portfolio-faq-header-settings';

/**
 * Live design previews for the studio's design pickers: each picker card loads the creator's own
 * portfolio page (embed mode) in a small iframe with `?previewSection=<section>&previewDesign=<design>`.
 * That page renders only that section, in the requested design, with the studio's current
 * settings (sent with the regular `apply-settings` message) and sample content. The creator's own
 * portrait is preserved, so the card shows both the real design and the correct profile image.
 *
 * The preview page talks back with its own message types, which the main live preview's listener
 * ignores (they are not studio preview messages), so a card's iframe never stands in for it.
 */

import { PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS, type PortfolioStackHeaderDesign } from '@/components/portfolio/portfolio-stack-header-settings';
import { PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS, type PortfolioToolsHeaderDesign } from '@/components/portfolio/portfolio-tools-header-settings';
const SECTION_QUERY = 'previewSection';
import { PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS, type PortfolioInfoHeaderDesign } from '@/components/portfolio/portfolio-info-header-settings';
import { PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS, type PortfolioWorkHeaderDesign } from '@/components/portfolio/portfolio-work-settings';
const DESIGN_QUERY = 'previewDesign';

/** Width the preview page is laid out at before being scaled into a card (a common laptop width). */
export const DESIGN_PREVIEW_VIEWPORT_WIDTH = 1280;

/** A section's design, as one picker card shows it. */
export type DesignPreviewTarget =
  | { section: 'footer'; design: PortfolioFooterDesign }
  | { section: 'footerHeader'; design: Exclude<PortfolioFooterHeaderDesign, 'none'> }
  | { section: 'contact'; design: PortfolioContactPremiumDesign }
  | { section: 'team'; design: PortfolioTeamLayout }
  | { section: 'teamHeader'; design: Exclude<PortfolioTeamHeaderDesign, 'none'> }
  | { section: 'gallery'; design: PortfolioGalleryDesign }
  | { section: 'galleryHeader'; design: Exclude<PortfolioGalleryHeaderDesign, 'none'> }
  | { section: 'faq'; design: PortfolioFaqDesign }
  | { section: 'faqHeader'; design: Exclude<PortfolioFaqHeaderDesignSelectable, 'none'> }
  | { section: 'experience'; design: PortfolioExperienceDesign }
  | { section: 'experienceHeader'; design: Exclude<PortfolioExperienceHeaderDesign, 'none'> }
  | { section: 'aboutUs'; design: PortfolioAboutUsDesign }
  | { section: 'services'; design: PortfolioServicesSectionDesign }
  | { section: 'servicesHeader'; design: Exclude<PortfolioServicesHeaderDesign, 'none'> }
  | { section: 'tools'; design: PortfolioToolsDesign }
  | { section: 'toolsHeader'; design: Exclude<PortfolioToolsHeaderDesign, 'none'> }
  | { section: 'work'; design: PortfolioWorkSectionDesign }
  | { section: 'workHeader'; design: Exclude<PortfolioWorkHeaderDesign, 'none'> }
  | { section: 'info'; design: PortfolioInfoDesign }
  | { section: 'infoHeader'; design: Exclude<PortfolioInfoHeaderDesign, 'none'> }
  | { section: 'stack'; design: PortfolioStackDesign }
  | { section: 'stackHeader'; design: Exclude<PortfolioStackHeaderDesign, 'none'> }
  | { section: 'hero'; design: PortfolioHeroBannerDesign }
  | { section: 'navigation'; design: PortfolioNavLayoutDesign };

export type DesignPreviewSection = DesignPreviewTarget['section'];

type DesignPreviewMessage =
  | { source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE; type: 'design-preview-ready' }
  | { source: typeof PORTFOLIO_STUDIO_PREVIEW_SOURCE; type: 'design-preview-size'; height: number };

export function isDesignPreviewMessage(data: unknown): data is DesignPreviewMessage {
  if (!data || typeof data !== 'object') return false;
  const record = data as { source?: unknown; type?: unknown };
  return (
    record.source === PORTFOLIO_STUDIO_PREVIEW_SOURCE &&
    (record.type === 'design-preview-ready' || record.type === 'design-preview-size')
  );
}

export function designPreviewReadyMessage(): DesignPreviewMessage {
  return { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'design-preview-ready' };
}

export function designPreviewSizeMessage(height: number): DesignPreviewMessage {
  return { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'design-preview-size', height };
}

export function withDesignPreview(portfolioPath: string, target: DesignPreviewTarget): string {
  const embedded = withPortfolioStudioEmbed(portfolioPath);
  return `${embedded}&${SECTION_QUERY}=${target.section}&${DESIGN_QUERY}=${encodeURIComponent(target.design)}`;
}

function firstParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ? raw.trim() : null;
}

/** Reads the route's preview params; anything not a known section + design pair is ignored. */
export function readDesignPreviewTarget(
  section: string | string[] | undefined,
  design: string | string[] | undefined
): DesignPreviewTarget | null {
  const sectionValue = firstParam(section);
  const designValue = firstParam(design);
  if (!designValue) return null;
  if (sectionValue === 'footer') {
    const match = PORTFOLIO_FOOTER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'footer', design: match.value } : null;
  }
  if (sectionValue === 'footerHeader') {
    const match = PORTFOLIO_FOOTER_HEADER_DESIGN_OPTIONS.find(
      (option) => option.value !== 'none' && option.value === designValue
    );
    return match
      ? { section: 'footerHeader', design: match.value as Exclude<PortfolioFooterHeaderDesign, 'none'> }
      : null;
  }
  if (sectionValue === 'contact') {
    const match = CONTACT_PREMIUM_DESIGNS.find((value) => value === designValue);
    return match ? { section: 'contact', design: match } : null;
  }
  if (sectionValue === 'team') {
    const match = PORTFOLIO_TEAM_LAYOUT_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'team', design: match.value } : null;
  }
  if (sectionValue === 'teamHeader') {
    const match = PORTFOLIO_TEAM_HEADER_DESIGN_OPTIONS.find(
      (option) => option.value !== 'none' && option.value === designValue
    );
    return match
      ? { section: 'teamHeader', design: match.value as Exclude<PortfolioTeamHeaderDesign, 'none'> }
      : null;
  }
  if (sectionValue === 'gallery') {
    const match = PORTFOLIO_GALLERY_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'gallery', design: match.value } : null;
  }
  if (sectionValue === 'galleryHeader') {
    const match = PORTFOLIO_GALLERY_HEADER_DESIGN_OPTIONS.find(
      (option) => option.value !== 'none' && option.value === designValue
    );
    return match
      ? { section: 'galleryHeader', design: match.value as Exclude<PortfolioGalleryHeaderDesign, 'none'> }
      : null;
  }
  if (sectionValue === 'faq') {
    const match = PORTFOLIO_FAQ_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'faq', design: match.value } : null;
  }
  if (sectionValue === 'faqHeader') {
    const match = PORTFOLIO_FAQ_HEADER_DESIGN_SELECTABLE_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'faqHeader', design: match.value } : null;
  }
  if (sectionValue === 'experience') {
    const match = PORTFOLIO_EXPERIENCE_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'experience', design: match.value } : null;
  }
  if (sectionValue === 'experienceHeader') {
    const match = PORTFOLIO_EXPERIENCE_HEADER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'experienceHeader', design: match.value } : null;
  }
  if (sectionValue === 'aboutUs') {
    const match = PORTFOLIO_ABOUT_US_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'aboutUs', design: match.value as PortfolioAboutUsDesign } : null;
  }
  if (sectionValue === 'services') {
    const match = PORTFOLIO_SERVICES_SECTION_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'services', design: match.value } : null;
  }
  if (sectionValue === 'servicesHeader') {
    const match = PORTFOLIO_SERVICES_HEADER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'servicesHeader', design: match.value } : null;
  }
  if (sectionValue === 'tools') {
    const match = PORTFOLIO_TOOLS_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'tools', design: match.value } : null;
  }
  if (sectionValue === 'toolsHeader') {
    const match = PORTFOLIO_TOOLS_HEADER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'toolsHeader', design: match.value } : null;
  }
  if (sectionValue === 'work') {
    const match = PORTFOLIO_WORK_SECTION_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'work', design: match.value } : null;
  }
  if (sectionValue === 'workHeader') {
    const match = PORTFOLIO_WORK_HEADER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'workHeader', design: match.value } : null;
  }
  if (sectionValue === 'info') {
    const match = PORTFOLIO_INFO_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'info', design: match.value } : null;
  }
  if (sectionValue === 'infoHeader') {
    const match = PORTFOLIO_INFO_HEADER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'infoHeader', design: match.value } : null;
  }
  if (sectionValue === 'stack') {
    const match = PORTFOLIO_STACK_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'stack', design: match.value } : null;
  }
  if (sectionValue === 'stackHeader') {
    const match = PORTFOLIO_STACK_HEADER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match && match.value !== 'none' ? { section: 'stackHeader', design: match.value } : null;
  }
  if (sectionValue === 'hero') {
    const match = PORTFOLIO_HERO_BANNER_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'hero', design: match.value } : null;
  }
  if (sectionValue === 'navigation') {
    const match = PORTFOLIO_NAV_LAYOUT_DESIGN_OPTIONS.find((option) => option.value === designValue);
    return match ? { section: 'navigation', design: match.value } : null;
  }
  return null;
}

/** Placeholder projects for the Portfolio (Work) section's previews. */
export const DESIGN_PREVIEW_PORTFOLIO_POSTS: MarketplaceContentItem[] = [
  {
    id: 'preview-work-1',
    title: 'Northwind booking',
    genre: 'Web design',
    description: 'A calmer booking flow for a travel platform — 18% more completed bookings.',
    mediaUrl: '/landing/showcase/portfolio.jpg',
    mediaType: 'FILE',
    toolsUsed: ['Figma', 'Framer'],
    tags: ['UX', 'Web'],
    role: 'Lead designer',
    category: 'Business',
    linkUrl: 'https://example.com/',
  },
  {
    id: 'preview-work-2',
    title: 'Atelier Lumière',
    genre: 'Branding',
    description: 'Identity and website for a lighting studio in Lyon.',
    mediaUrl: '/landing/hero/hero-freelance.jpg',
    mediaType: 'FILE',
    toolsUsed: ['Illustrator', 'Webflow'],
    tags: ['Brand', 'Web'],
    role: 'Brand designer',
    category: 'Lifestyle',
  },
  {
    id: 'preview-work-3',
    title: 'Open office',
    genre: 'Art direction',
    description: 'Photo art direction for a co-working space launch.',
    mediaUrl: '/landing/hero/empty-space.jpg',
    mediaType: 'FILE',
    toolsUsed: ['Lightroom'],
    tags: ['Photo'],
    role: 'Art director',
    category: 'Architecture',
  },
  {
    id: 'preview-work-4',
    title: 'Quiet desk',
    genre: 'Product design',
    description: 'A focus app for remote teams — from research to launch.',
    mediaUrl: '/landing/v2/hero.jpg',
    mediaType: 'FILE',
    toolsUsed: ['Figma', 'Notion'],
    tags: ['App', 'UX'],
    role: 'Product designer',
    category: 'Technology',
  },
  {
    id: 'preview-work-5',
    title: 'Workshop goods',
    genre: 'E-commerce',
    description: 'An online shop for a small furniture workshop.',
    mediaUrl: '/landing/audience/seller.jpg',
    mediaType: 'FILE',
    toolsUsed: ['Shopify', 'Photoshop'],
    tags: ['Shop'],
    role: 'Web designer',
    category: 'Retail',
  },
  {
    id: 'preview-work-6',
    title: 'Late session',
    genre: 'Editorial',
    description: 'A long-form story site for an independent magazine.',
    mediaUrl: '/landing/hero/hero-pro.jpg',
    mediaType: 'FILE',
    toolsUsed: ['Next.js'],
    tags: ['Editorial', 'Web'],
    role: 'Designer & developer',
    category: 'Media',
  },
];

/** Placeholder identity shown in design previews, so every design reads as a finished page. */
export const DESIGN_PREVIEW_LOCATION_LABEL = 'Paris, France';

export function withDesignPreviewProfile(profile: MarketplaceCreatorPublicProfile): MarketplaceCreatorPublicProfile {
  const profileAvatarUrl = profile.avatarUrl?.trim() || '/landing/audience/freelancer-dev.jpg';

  return {
    ...profile,
    fullName: 'Alex Martin',
    bio: 'Independent designer and developer. I build clear, fast websites and brands for small studios.',
    // Keep the creator recognizable in the picker; the stock portrait is only a no-photo fallback.
    avatarUrl: profileAvatarUrl,
    contactEmail: 'hello@alexmartin.com',
    contactEmails: [{ id: 'preview-email', sortOrder: 0, value: 'hello@alexmartin.com' }],
    phone: '+33 6 12 34 56 78',
    contactPhones: [{ id: 'preview-phone', sortOrder: 0, value: '+33 6 12 34 56 78' }],
    contactAddresses: [{ id: 'preview-address', sortOrder: 0, value: '12 rue des Arts, 75003 Paris' }],
    locationCity: 'Paris',
    locationCountry: 'France',
    timezoneId: 'Europe/Paris',
    isAvailable: true,
    availabilityHours: 'Mon–Fri · 09:00–18:00',
    responseTimeLabel: '< 24 h',
    membersOnlyContactAvailable: false,
    profileLinks: [
      { id: 'preview-linkedin', type: 'SOCIAL', label: 'LinkedIn', url: 'https://www.linkedin.com/', sortOrder: 0, platform: 'linkedin' },
      { id: 'preview-instagram', type: 'SOCIAL', label: 'Instagram', url: 'https://www.instagram.com/', sortOrder: 1, platform: 'instagram' },
      { id: 'preview-dribbble', type: 'SOCIAL', label: 'Dribbble', url: 'https://dribbble.com/', sortOrder: 2, platform: 'dribbble' },
      { id: 'preview-website', type: 'WEBSITE', label: 'Website', url: 'https://example.com/', sortOrder: 3 },
    ],
    teamMembers: [
      {
        id: 'preview-team-1',
        sortOrder: 0,
        name: 'Maya Chen',
        responsibility: 'Art director',
        imageUrl: '/landing/audience/student-glasses.jpg',
        socialLinks: [{ id: 'preview-team-1-in', platform: 'LINKEDIN', url: 'https://www.linkedin.com/', sortOrder: 0 }],
      },
      {
        id: 'preview-team-2',
        sortOrder: 1,
        name: 'Tom Bauer',
        responsibility: 'Product designer',
        imageUrl: '/landing/audience/seller.jpg',
        socialLinks: [{ id: 'preview-team-2-ig', platform: 'INSTAGRAM', url: 'https://www.instagram.com/', sortOrder: 0 }],
      },
      {
        id: 'preview-team-3',
        sortOrder: 2,
        name: 'Sara Lopez',
        responsibility: 'Brand strategist',
        imageUrl: '/landing/audience/client.jpg',
        socialLinks: [{ id: 'preview-team-3-in', platform: 'LINKEDIN', url: 'https://www.linkedin.com/', sortOrder: 0 }],
      },
      {
        id: 'preview-team-4',
        sortOrder: 3,
        name: 'Alex Martin',
        responsibility: 'Developer',
        imageUrl: '/landing/audience/freelancer-dev.jpg',
        socialLinks: [{ id: 'preview-team-4-gh', platform: 'GITHUB', url: 'https://github.com/', sortOrder: 0 }],
      },
    ],
    galleryItems: [
      { id: 'preview-gallery-1', sortOrder: 0, title: 'Studio light', mediaUrl: '/landing/hero/hero-freelance.jpg', mediaType: 'IMAGE' },
      { id: 'preview-gallery-2', sortOrder: 1, title: 'Quiet desk', mediaUrl: '/landing/v2/hero.jpg', mediaType: 'IMAGE' },
      { id: 'preview-gallery-3', sortOrder: 2, title: 'Open office', mediaUrl: '/landing/hero/empty-space.jpg', mediaType: 'IMAGE' },
      { id: 'preview-gallery-4', sortOrder: 3, title: 'Portfolio launch', mediaUrl: '/landing/showcase/portfolio.jpg', mediaType: 'IMAGE' },
      { id: 'preview-gallery-5', sortOrder: 4, title: 'Workshop', mediaUrl: '/landing/audience/seller.jpg', mediaType: 'IMAGE' },
      { id: 'preview-gallery-6', sortOrder: 5, title: 'Late session', mediaUrl: '/landing/hero/hero-pro.jpg', mediaType: 'IMAGE' },
    ],
    yearsOfExperience: 8,
    specialite: 'Designer & developer',
    portfolioPosts: DESIGN_PREVIEW_PORTFOLIO_POSTS,
    portfolioWorks: [],
    profileStack: [
      { name: 'Forma', iconUrl: '/images/portfolio/demo-brands/forma.svg', category: 'Creation', level: 'advanced', experienceYears: 4, currentlyUsed: true, useCases: ['Visual identity'] },
      { name: 'Orbit', iconUrl: '/images/portfolio/demo-brands/orbit.svg', category: 'Strategy', level: 'advanced', experienceYears: 5, currentlyUsed: true, useCases: ['Planning'] },
      { name: 'Luma', iconUrl: '/images/portfolio/demo-brands/luma.svg', category: 'Creation', level: 'advanced', experienceYears: 4, currentlyUsed: true, useCases: ['Art direction'] },
      { name: 'Arc', iconUrl: '/images/portfolio/demo-brands/arc.svg', category: 'Design', level: 'expert', experienceYears: 4, currentlyUsed: true, useCases: ['Composition'] },
      { name: 'Nova', iconUrl: '/images/portfolio/demo-brands/nova.svg', category: 'Production', level: 'intermediate', experienceYears: 3, currentlyUsed: true, useCases: ['Production'] },
      { name: 'Muse', iconUrl: '/images/portfolio/demo-brands/muse.svg', category: 'Creation', level: 'intermediate', experienceYears: 3, currentlyUsed: true, useCases: ['Research'] },
      { name: 'Flow', iconUrl: '/images/portfolio/demo-brands/flow.svg', category: 'Organization', level: 'expert', experienceYears: 7, currentlyUsed: true, useCases: ['Workflow'] },
      { name: 'Aura', iconUrl: '/images/portfolio/demo-brands/aura.svg', category: 'Design', level: 'advanced', experienceYears: 3, currentlyUsed: true, useCases: ['Presentation'] },
    ],
    strengthsToolsMastered: [
      { name: 'Forma', iconUrl: '/images/portfolio/demo-brands/forma.svg', category: 'Creation', level: 'advanced', experienceYears: 4, currentlyUsed: true, useCases: ['Visual identity'] },
      { name: 'Orbit', iconUrl: '/images/portfolio/demo-brands/orbit.svg', category: 'Strategy', level: 'advanced', experienceYears: 5, currentlyUsed: true, useCases: ['Planning'] },
      { name: 'Luma', iconUrl: '/images/portfolio/demo-brands/luma.svg', category: 'Creation', level: 'advanced', experienceYears: 4, currentlyUsed: true, useCases: ['Art direction'] },
      { name: 'Arc', iconUrl: '/images/portfolio/demo-brands/arc.svg', category: 'Design', level: 'expert', experienceYears: 4, currentlyUsed: true, useCases: ['Composition'] },
      { name: 'Nova', iconUrl: '/images/portfolio/demo-brands/nova.svg', category: 'Production', level: 'intermediate', experienceYears: 3, currentlyUsed: true, useCases: ['Production'] },
      { name: 'Muse', iconUrl: '/images/portfolio/demo-brands/muse.svg', category: 'Creation', level: 'intermediate', experienceYears: 3, currentlyUsed: true, useCases: ['Research'] },
      { name: 'Flow', iconUrl: '/images/portfolio/demo-brands/flow.svg', category: 'Organization', level: 'expert', experienceYears: 7, currentlyUsed: true, useCases: ['Workflow'] },
      { name: 'Aura', iconUrl: '/images/portfolio/demo-brands/aura.svg', category: 'Design', level: 'advanced', experienceYears: 3, currentlyUsed: true, useCases: ['Presentation'] },
    ],
    aboutSkills: [
      { id: 'preview-skill-1', sortOrder: 0, title: 'Interface design', description: 'Clear, accessible screens for web and mobile.' },
      { id: 'preview-skill-2', sortOrder: 1, title: 'Brand identity', description: 'Logos, type and color systems that last.' },
      { id: 'preview-skill-3', sortOrder: 2, title: 'Front-end', description: 'Fast, responsive websites built to be edited.' },
    ],
    aboutStrengths: ['Clear communication', 'Attention to detail', 'Calm under deadlines'],
    aboutSystemsTools: ['Figma', 'Webflow', 'Notion', 'Next.js'],
    aboutInterests: ['Photography', 'Architecture', 'Typography'],
    aboutEducation: [
      { id: 'preview-edu-1', sortOrder: 0, schoolYear: '2014 — 2017', title: 'BA in Graphic Design', institution: 'École de design de Lyon' },
      { id: 'preview-edu-2', sortOrder: 1, schoolYear: '2017 — 2018', title: 'UX certificate', institution: 'Interaction Design Foundation' },
    ],
    spokenLanguages: [
      { name: 'French', level: 'expert' },
      { name: 'English', level: 'advanced' },
      { name: 'Spanish', level: 'intermediate' },
    ],
    experienceBlocks: [
      {
        id: 'preview-exp-1',
        sortOrder: 0,
        title: 'Brand designer',
        organization: 'Atelier Forma',
        text: 'Created a new visual identity and website for an independent design studio.',
        mediaUrl: '/landing/showcase/portfolio.jpg',
        mediaType: 'IMAGE',
        period: '2024 — present',
        status: 'ONGOING',
        tasks: ['Visual identity and brand guidelines', 'Website design and launch', 'Creative direction'],
        tools: ['Forma', 'Orbit', 'Luma'],
        location: 'Paris',
        employmentType: 'FULL_TIME',
      },
      {
        id: 'preview-exp-2',
        sortOrder: 1,
        title: 'Freelance web designer',
        organization: 'Studio Horizon',
        text: 'Designed websites and visual identities for local businesses and creative teams.',
        mediaUrl: '/landing/hero/hero-freelance.jpg',
        mediaType: 'IMAGE',
        period: '2021 — 2024',
        status: 'FINISHED',
        tasks: ['Responsive website design', 'Brand identity systems', 'Photo art direction'],
        tools: ['Arc', 'Nova', 'Muse'],
        location: 'Remote',
        employmentType: 'FREELANCE',
      },
      {
        id: 'preview-exp-3',
        sortOrder: 2,
        title: 'Junior UI designer',
        organization: 'Luma Collective',
        text: 'Designed clear, accessible interfaces for everyday digital products.',
        mediaUrl: '/landing/hero/empty-space.jpg',
        mediaType: 'IMAGE',
        period: '2019 — 2021',
        status: 'FINISHED',
        tasks: ['Mobile app screens', 'Prototypes for user tests'],
        tools: ['Flow', 'Aura'],
        location: 'Lyon',
        employmentType: 'FULL_TIME',
      },
    ],
    profileServices: [
      {
        id: 'preview-svc-1',
        sortOrder: 0,
        title: 'Brand identity',
        description: 'Logo, colors, type and a short guide your team can actually use.',
        basePriceCents: 120000,
        deadline: null,
        tasks: ['Logo and variations', 'Color and type system', 'Brand guidelines'],
        pricingType: 'FROM',
        coverImageUrl: '/landing/showcase/portfolio.jpg',
        status: 'ACTIVE',
        currency: 'EUR',
        deliveryValue: 3,
        deliveryUnit: 'WEEKS',
      },
      {
        id: 'preview-svc-2',
        sortOrder: 1,
        title: 'Website design',
        description: 'A fast, clear website designed and built around what your clients need.',
        basePriceCents: 250000,
        deadline: null,
        tasks: ['Up to 8 pages', 'Responsive design', 'Simple editor'],
        pricingType: 'FROM',
        coverImageUrl: '/landing/hero/hero-freelance.jpg',
        status: 'ACTIVE',
        currency: 'EUR',
        deliveryValue: 5,
        deliveryUnit: 'WEEKS',
        popular: true,
      },
      {
        id: 'preview-svc-3',
        sortOrder: 2,
        title: 'Product design',
        description: 'Interfaces for apps and dashboards, from research to final screens.',
        basePriceCents: 60000,
        deadline: null,
        tasks: ['User flows', 'High-fidelity screens', 'Clickable prototype'],
        pricingType: 'FROM',
        coverImageUrl: '/landing/hero/empty-space.jpg',
        status: 'ACTIVE',
        currency: 'EUR',
        deliveryValue: 2,
        deliveryUnit: 'WEEKS',
        billingPeriod: 'MONTH',
      },
      {
        id: 'preview-svc-4',
        sortOrder: 3,
        title: 'Design audit',
        description: 'A clear review of your site or app, with a prioritised list of fixes.',
        basePriceCents: 45000,
        deadline: null,
        tasks: ['UX review', 'Accessibility check', 'Action plan'],
        pricingType: 'FIXED',
        coverImageUrl: '/landing/v2/hero.jpg',
        status: 'ACTIVE',
        currency: 'EUR',
        deliveryValue: 5,
        deliveryUnit: 'DAYS',
      },
    ],
    aboutUs: {
      title: 'A small studio for clear, lasting work',
      description:
        'We help independent brands look as good as what they make — with honest advice, careful craft and websites that are easy to keep up to date.',
      tasks: ['Brand identity', 'Websites', 'Product design', 'Art direction'],
      imageUrls: ['/landing/hero/hero-freelance.jpg', '/landing/hero/empty-space.jpg'],
      quote: 'Good design is the shortest path between a good idea and the people who need it.',
      founder: { name: 'Alex Martin', function: 'Founder & designer', logoUrl: '/landing/audience/freelancer-dev.jpg' },
    },
    faqItems: [
      {
        id: 'preview-faq-1',
        sortOrder: 0,
        question: 'How long does a project take?',
        answer: 'Most websites take three to six weeks, from the first call to launch.',
      },
      {
        id: 'preview-faq-2',
        sortOrder: 1,
        question: 'What do you need from me to start?',
        answer: 'A short brief, your brand assets if you have them, and a few examples you like.',
      },
      {
        id: 'preview-faq-3',
        sortOrder: 2,
        question: 'Do you work with clients abroad?',
        answer: 'Yes — I work remotely with studios across Europe and North America.',
      },
      {
        id: 'preview-faq-4',
        sortOrder: 3,
        question: 'Can I update the site myself afterwards?',
        answer: 'Yes. Every site comes with a simple editor and a short handover session.',
      },
    ],
  };
}
