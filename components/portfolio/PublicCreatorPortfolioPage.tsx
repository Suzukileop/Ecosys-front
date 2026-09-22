'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CreatorProfileViewTracker } from '@/components/marketplace/CreatorProfileViewTracker';
import { formatAvailabilityHours, formatAvailabilityHoursLines, parseAvailabilityHours } from '@/lib/availabilityHours';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import {
  portfolioUsesMonochromeChrome,
  portfolioMonochromeSocialBrandClass,
} from '@/components/portfolio/portfolio-themes';
import { SOCIAL_PLATFORMS } from '@/types/ecosystem';
import type { ProfileServiceItem } from '@/types/ecosystem';
import type { PortfolioServiceItem } from '@/components/portfolio/PortfolioServicesChrome';
import type { MarketplaceContentItem, MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { PortfolioHeroSection } from '@/components/portfolio/PortfolioHeroSection';
import { PortfolioPagesSlideViewport } from '@/components/portfolio/portfolio-pages-transition';
import { PortfolioCaseOverlayNav } from '@/components/portfolio/portfolio-case-overlay-nav';
import { PortfolioDutenPanelNav } from '@/components/portfolio/portfolio-duten-panel-nav';
import { PortfolioHalfPanelNav } from '@/components/portfolio/portfolio-half-panel-nav';
import {
  portfolioNavUsesCaseOverlayLayout,
  portfolioNavUsesDutenPanelLayout,
  portfolioNavUsesHalfPanelLeftLayout,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { PortfolioFixedMotifsLayer } from '@/components/portfolio/PortfolioHeroMotifsLayer';
import { PortfolioSectionShell } from '@/components/portfolio/PortfolioSectionShell';
import { PortfolioThemeRoot } from '@/components/portfolio/PortfolioThemeRoot';
import { FaqSectionIllustration } from '@/components/portfolio/FaqSectionIllustration';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import {
  isPortfolioStudioPreviewMessage,
  PORTFOLIO_STUDIO_PREVIEW_SOURCE,
} from '@/lib/portfolio-studio-preview';
import { scrollToPortfolioSection } from '@/components/portfolio/portfolio-nav-top-clearance';
import { writeHeroBannerDesignHint } from '@/components/portfolio/portfolio-hero-banner-hint';
import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  normalizePortfolioHeroBannerDesign,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import { resolveHeroLayoutDivision } from '@/components/portfolio/portfolio-hero-layout-division';
import {
  EditorialContactSection,
  EditorialExperienceList,
  ExperienceEditorialHeader,
  ExperienceMilestoneHeader,
  MilestoneExperienceList,
  TableExperienceList,
  CardsExperienceList,
  ReelExperienceList,
  DuotoneExperienceList,
  GalleryExperienceList,
  LoftExperienceList,
  PressExperienceList,
  LegacyExperienceList,
  KineticExperienceList,
  EditorialFaqList,
  EditorialGallerySection,
  EditorialPortfolioFooter,
  EditorialSectionStickyHeader,
  EditorialTeamGallery,
  EditorialSideInfoHeading,
  EditorialSideInfoPanel,
  EditorialStatGrid,
  EditorialWorkGallery,
  MarketplaceProfileLink,
  portfolioEditorialShellClass,
  PortfolioFloatingNav,
  SIDE_INFO_ICONS,
  ServicesOrderCtaHrefProvider,
} from '@/components/portfolio/portfolio-section-primitives';
import {
  ExperienceCardsHeader,
  ExperienceDuotoneHeader,
  ExperienceGalleryHeader,
  ExperienceLegacyHeader,
  ExperienceLoftHeader,
  ExperiencePressHeader,
  ExperienceReelHeader,
  ExperienceSpotlightHeader,
  ExperienceTableHeader,
} from '@/components/portfolio/experience-header-designs';
import {
  WorkEditorialHeader,
  WorkMarqueeHeader,
  WorkIndexHeader,
  WorkAccentCountHeader,
  WorkSerifLeadHeader,
  WorkBillboardHeader,
  WorkMastheadHeader,
  WorkSplitHeadingHeader,
} from '@/components/portfolio/work-header-designs';
import {
  StackHeaderEditorialHeader,
  StackHeaderMarqueeHeader,
  StackHeaderIndexHeader,
  StackHeaderAccentCountHeader,
  StackHeaderSerifLeadHeader,
  StackHeaderBillboardHeader,
  StackHeaderMastheadHeader,
  StackHeaderSplitHeadingHeader,
} from '@/components/portfolio/stack-portfolio-header-designs';
import {
  InfoHeaderEditorialHeader,
  InfoHeaderMarqueeHeader,
  InfoHeaderIndexHeader,
  InfoHeaderAccentCountHeader,
  InfoHeaderSerifLeadHeader,
  InfoHeaderBillboardHeader,
  InfoHeaderMastheadHeader,
  InfoHeaderSplitHeadingHeader,
  InfoHeaderChapterHeader,
  InfoHeaderCoverHeader,
} from '@/components/portfolio/info-portfolio-header-designs';
import {
  ToolsHeaderEditorialHeader,
  ToolsHeaderMarqueeHeader,
  ToolsHeaderIndexHeader,
  ToolsHeaderAccentCountHeader,
  ToolsHeaderSerifLeadHeader,
  ToolsHeaderBillboardHeader,
  ToolsHeaderMastheadHeader,
  ToolsHeaderSplitHeadingHeader,
} from '@/components/portfolio/tools-portfolio-header-designs';
import {
  isProjectsBoardDesign,
  ProjectsBoardGallery,
  ProjectsBoardSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-board';
import {
  isProjectsAccordionDesign,
  ProjectsAccordionGallery,
  ProjectsAccordionSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-accordion';
import {
  isProjectsFramesDesign,
  ProjectsFramesGallery,
  ProjectsFramesSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-frames';
import {
  isProjectsIndexDesign,
  ProjectsIndexGallery,
  ProjectsIndexSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-index';
import {
  isProjectsGridDesign,
  ProjectsGridSection,
} from '@/components/portfolio/portfolio-work-projects-grid';
import {
  isProjectsSplitDesign,
  ProjectsSplitGallery,
  ProjectsSplitSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-split';
import {
  isProjectsCarouselDesign,
  ProjectsCarouselSection,
  ProjectsCarouselSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-carousel';
import {
  isProjectsShowcaseDesign,
  ProjectsShowcaseGallery,
  ProjectsShowcaseSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-showcase';
import {
  isProjectsLedgerDesign,
  ProjectsLedgerGallery,
  ProjectsLedgerSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-ledger';
import {
  isProjectsSpecDesign,
  ProjectsSpecGallery,
  ProjectsSpecSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-spec';
import {
  isProjectsCaseDesign,
  ProjectsCaseGallery,
  ProjectsCaseSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-case';
import {
  isProjectsPressDesign,
  ProjectsPressGallery,
} from '@/components/portfolio/portfolio-work-projects-press';
import {
  isProjectsDuotoneDesign,
  ProjectsDuotoneGallery,
} from '@/components/portfolio/portfolio-work-projects-duotone';
import {
  isProjectsCascadeDesign,
  ProjectsCascadeGallery,
} from '@/components/portfolio/portfolio-work-projects-cascade';
import {
  gallerySectionLayoutIsAside,
  pickGalleryPresentationSettings,
  resolveGallerySectionSubtitle,
  resolveGallerySectionTitle,
} from '@/components/portfolio/portfolio-gallery-settings';
import {
  GalleryHeaderEditorialHeader,
  GalleryHeaderMarqueeHeader,
  GalleryHeaderIndexHeader,
  GalleryHeaderAccentCountHeader,
  GalleryHeaderSerifLeadHeader,
  GalleryHeaderBillboardHeader,
  GalleryHeaderMastheadHeader,
  GalleryHeaderSplitHeadingHeader,
} from '@/components/portfolio/gallery-portfolio-header-designs';
import { applyGalleryPaletteToSettings } from '@/components/portfolio/portfolio-gallery-palette-settings';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';

import {
  pickHeroPresentationSettings,
  resolveHeroTools,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  resolveHeroEditorialRailTools,
  resolveHeroStatementCtaTools,
  resolveHeroPortraitBalanceTools,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  pickWorkPresentationSettings,
  resolveWorkSectionSubtitle,
  resolveWorkSectionTitle,
  workHeaderFontClass,
  workHeaderFontStyle,
  workSubtitleColorStyle,
  workTitleColorStyle,
} from '@/components/portfolio/portfolio-work-settings';
import {
  aboutMainGridClass,
  aboutContentPairAlignClass,
  aboutSidePanelTwinAlignClass,
  filterAboutStats,
  isAboutSideInfoItemVisible,
  pickAboutPresentationSettings,
} from '@/components/portfolio/portfolio-about-settings';
import {
  pickServicesPresentationSettings,
  resolveServicesSectionSubtitle,
  resolveServicesSectionTitle,
  resolveServicesOrderCtaHref,
} from '@/components/portfolio/portfolio-services-settings';
import {
  resolveDistinctBlockSectionSubtitle,
  resolveDistinctBlockSectionTitle,
  resolvePortfolioContentSectionOrder,
  servicesUsesDistinctSections,
} from '@/components/portfolio/portfolio-services-block-settings';
import {
  pickFaqPresentationSettings,
  resolveFaqSectionSubtitle,
  resolveFaqSectionTitle,
  faqListPlacementClass,
  faqListMaxWidthClass,
  faqSectionLayoutIsAside,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  FaqHeaderEditorialHeader,
  FaqHeaderMarqueeHeader,
  FaqHeaderIndexHeader,
  FaqHeaderAccentCountHeader,
  FaqHeaderSerifLeadHeader,
  FaqHeaderBillboardHeader,
  FaqHeaderMastheadHeader,
  FaqHeaderSplitHeadingHeader,
} from '@/components/portfolio/faq-portfolio-header-designs';
import { FaqKineticSplitDesign } from '@/components/portfolio/portfolio-faq-kinetic-split';
import { FaqFloatingGalleryDesign } from '@/components/portfolio/portfolio-faq-floating-gallery';
import { FaqEditorialMasonryDesign } from '@/components/portfolio/portfolio-faq-editorial-masonry';
import { FaqPrismCardsDesign } from '@/components/portfolio/portfolio-faq-prism-cards';
import { FaqStarScrollDesign } from '@/components/portfolio/portfolio-faq-star-scroll';
import { FaqTriGridDesign } from '@/components/portfolio/portfolio-faq-tri-grid';
import { FaqSplitIndexDesign } from '@/components/portfolio/portfolio-faq-split-index';
import { FaqCenteredFocusDesign } from '@/components/portfolio/portfolio-faq-centered-focus';
import { FaqBentoDualDesign } from '@/components/portfolio/portfolio-faq-bento-dual';
import {
  pickTeamPresentationSettings,
  resolveTeamSectionSubtitle,
  resolveTeamSectionTitle,
  teamSectionLayoutIsAside,
} from '@/components/portfolio/portfolio-team-settings';
import {
  TeamHeaderEditorialHeader,
  TeamHeaderMarqueeHeader,
  TeamHeaderIndexHeader,
  TeamHeaderAccentCountHeader,
  TeamHeaderSerifLeadHeader,
  TeamHeaderBillboardHeader,
  TeamHeaderMastheadHeader,
  TeamHeaderSplitHeadingHeader,
} from '@/components/portfolio/team-portfolio-header-designs';
import {
  FooterHeaderEditorialHeader,
  FooterHeaderIndexHeader,
  FooterHeaderSerifLeadHeader,
  FooterHeaderBillboardHeader,
  FooterHeaderMastheadHeader,
  FooterHeaderHeroHeader,
  FooterHeaderNameHeader,
  FooterHeaderTimezoneHeader,
} from '@/components/portfolio/footer-portfolio-header-designs';
import {
  ServicesHeaderEditorialHeader,
  ServicesHeaderMarqueeHeader,
  ServicesHeaderIndexHeader,
  ServicesHeaderAccentCountHeader,
  ServicesHeaderSerifLeadHeader,
  ServicesHeaderBillboardHeader,
  ServicesHeaderMastheadHeader,
  ServicesHeaderSplitHeadingHeader,
} from '@/components/portfolio/services-portfolio-header-designs';
import {
  isServicesShowcaseHeroDesign,
  ServicesShowcaseHero,
} from '@/components/portfolio/portfolio-services-design-showcase-hero';
import {
  isServicesPricingGridDesign,
  ServicesPricingGridSection,
} from '@/components/portfolio/portfolio-services-pricing-grid';
import {
  isServicesPricingBentoDesign,
  ServicesPricingBentoSection,
} from '@/components/portfolio/portfolio-services-pricing-bento';
import {
  isServicesPricingMonolithDesign,
  ServicesPricingMonolithSection,
} from '@/components/portfolio/portfolio-services-pricing-monolith';
import {
  isServicesPricingAuroraDesign,
  ServicesPricingAuroraSection,
} from '@/components/portfolio/portfolio-services-pricing-aurora';
import {
  isServicesPricingToggleDesign,
  ServicesPricingToggleSection,
} from '@/components/portfolio/portfolio-services-pricing-toggle';
import {
  pickInfoPresentationSettings,
  resolveInfoSectionSubtitle,
  resolveInfoSectionTitle,
} from '@/components/portfolio/portfolio-info-settings';
import { EditorialAboutMeSection } from '@/components/portfolio/EditorialAboutMeSection';
import {
  pickToolsPresentationSettings,
  resolveToolsSectionSubtitle,
  resolveToolsSectionTitle,
  toolsHeaderFontClass,
  toolsHeaderFontStyle,
  toolsSubtitleColorStyle,
  toolsTitleColorStyle,
} from '@/components/portfolio/portfolio-tools-settings';
import {
  pickStackPresentationSettings,
  resolveStackSectionSubtitle,
  resolveStackSectionTitle,
  resolveStackSubtitleSize,
  resolveStackTitleSize,
  stackHeaderFontClass,
  stackHeaderFontStyle,
  stackSectionLayoutIsAside,
  stackSectionSubtitleSizeClass,
  stackSectionTitleSizeClass,
  stackSubtitleColorStyle,
  stackTitleColorStyle,
  type PortfolioStackPresentationSettings,
} from '@/components/portfolio/portfolio-stack-settings';
import { EditorialStackGallery } from '@/components/portfolio/portfolio-stack-section';
import { EditorialToolsGallery } from '@/components/portfolio/portfolio-tools-section';
import {
  aboutUsDesignEmbedsHeader,
  aboutUsHeaderFontClass,
  aboutUsHeaderFontStyle,
  aboutUsSectionLayoutIsAside,
  aboutUsSubtitleColorStyle,
  aboutUsTitleColorStyle,
  pickAboutUsPresentationSettings,
  resolveAboutUsSectionSubtitle,
  resolveAboutUsSectionTitle,
} from '@/components/portfolio/portfolio-about-us-settings';
import { EditorialAboutUsSection } from '@/components/portfolio/EditorialAboutUsSection';
import { portfolioPresenceShowsAboutUs } from '@/components/portfolio/portfolio-presence';
import {
  pickExperiencePresentationSettings,
  resolveExperienceSectionSubtitle,
  resolveExperienceSectionTitle,
  experienceDesignUsesFlatHeader,
  experienceDesignUsesTableHeader,
  experienceDesignUsesCardsHeader,
  experienceHeaderDesignIsApplied,
  accentYearsHasCustomCopy,
  experienceHeaderFontClass,
  experienceHeaderFontStyle,
  experienceSubtitleColorStyle,
  experienceTitleColorStyle,
} from '@/components/portfolio/portfolio-experience-settings';
import { PortfolioLinkArrowProvider } from '@/components/portfolio/portfolio-link-buttons';
import {
  pickContactPresentationSettings,
  resolveContactSectionSubtitle,
  resolveContactSectionTitle,
  contactHeaderFontClass,
  contactHeaderFontStyle,
  contactSubtitleColorStyle,
  contactTitleColorStyle,
  isContactPremiumDesign,
} from '@/components/portfolio/portfolio-contact-settings';
import { pickFooterPresentationSettings, portfolioFooterNavClearanceClass } from '@/components/portfolio/portfolio-footer-settings';
import {
  applyHeroPaletteToAbout,
  applyHeroPaletteToAboutUs,
  applyHeroPaletteToContact,
  applyHeroPaletteToExperience,
  applyHeroPaletteToFaq,
  applyHeroPaletteToFooter,
  applyHeroPaletteToInfo,
  applyHeroPaletteToServices,
  applyHeroPaletteToStack,
  applyHeroPaletteToTeam,
  applyHeroPaletteToTools,
  applyHeroPaletteToWork,
  resolveHeroPaletteFromSettings,
} from '@/components/portfolio/portfolio-section-palette';
import { resolveActivePortfolioPalette } from '@/components/portfolio/portfolio-color-mode';
import {
  resolveSectionActiveMode,
  resolveSectionBackgroundIsolation,
  resolveSectionPalette,
} from '@/components/portfolio/portfolio-section-color-mode';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { syncExperiencePeriodRulePair } from '@/components/portfolio/portfolio-experience-palette-settings';
import {
  resolveNavItemLabel,
  type PortfolioNavSectionKey,
  type PortfolioNavIconVariant,
} from '@/components/portfolio/portfolio-nav-items';
import {
  globalContentWidthClass,
  globalFixedBackgroundImageStyle,
  globalSectionTitleTopClass,
  globalSectionTitleTopExtraStyle,
  globalSectionTitleBottomClass,
  globalSectionTitleBottomExtraStyle,
  hasGlobalPageBackground,
  resolveGlobalSectionSubtitleTypography,
  resolveGlobalSectionTitleChrome,
  resolveGlobalSectionTitleTypography,
  resolveSectionHeaderAlign,
  resolveSectionTitleOrientation,
} from '@/components/portfolio/portfolio-global-settings';
import type { PortfolioSectionBackgroundSettings } from '@/components/portfolio/portfolio-section-background-settings';
import {
  buildPortfolioNavChromeLinks,
  buildPortfolioNavSocialLinkOptions,
} from '@/components/portfolio/portfolio-nav-extras';
import { DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES } from '@/components/portfolio/portfolio-settings-types';
import { motionProfileEnablesHeroGeomFade } from '@/components/portfolio/portfolio-motion-settings';
import { PortfolioMotionProvider } from '@/components/portfolio/PortfolioMotionItem';
import { PortfolioTaskListMarkerProvider } from '@/components/portfolio/portfolio-task-list-marker-context';

type PublicCreatorPortfolioPageProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  locationLabel: string | null;
  portfolioPosts?: MarketplaceContentItem[];
  /** Dashboard Live Preview iframe — hide owner chrome and follow parent settings. */
  studioEmbed?: boolean;
};

function socialLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function splitDisplayName(name: string): { lead: string; accent: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lead: name.trim(), accent: '' };
  const accent = parts.pop() ?? '';
  return { lead: parts.join(' '), accent };
}

function primaryContactEmail(profile: MarketplaceCreatorPublicProfile): string {
  return (
    profile.contactEmails?.map((entry) => entry.value.trim()).find(Boolean) ||
    profile.contactEmail?.trim() ||
    ''
  );
}

function resolvePrimaryLink(profile: MarketplaceCreatorPublicProfile): { label: string; url: string } | null {
  const first = profile.profileLinks?.[0];
  if (first?.url?.trim()) {
    const url = first.url.trim();
    let hostname = 'Link';
    try {
      hostname = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
        /^www\./i,
        ''
      );
    } catch {
      /* ignore */
    }
    return { label: first.label?.trim() || hostname || 'Contact me', url };
  }
  if (profile.ctaUrl?.trim()) {
    return { label: profile.ctaLabel?.trim() || 'Contact me', url: profile.ctaUrl.trim() };
  }
  const email = primaryContactEmail(profile);
  if (email) {
    return { label: 'Start a project', url: `mailto:${email}` };
  }
  return null;
}

function resolveDisplayLinks(profile: MarketplaceCreatorPublicProfile) {
  if (profile.profileLinks && profile.profileLinks.length > 0) {
    return profile.profileLinks.filter((link) => link.url.trim());
  }
  const legacy: Array<{
    id: string;
    label: string;
    url: string;
    type: string;
    platform?: string | null;
    iconUrl?: string | null;
  }> = [];
  if (profile.websiteUrl?.trim()) {
    legacy.push({ id: 'website', label: 'Website', url: profile.websiteUrl.trim(), type: 'WEBSITE' });
  }
  if (profile.ctaUrl?.trim()) {
    legacy.push({
      id: 'cta',
      label: profile.ctaLabel?.trim() || 'Contact me',
      url: profile.ctaUrl.trim(),
      type: 'CTA',
    });
  }
  if (profile.socialLinks) {
    for (const [platform, url] of Object.entries(profile.socialLinks)) {
      if (url.trim()) {
        legacy.push({ id: platform, label: socialLabel(platform), url, type: 'SOCIAL', platform });
      }
    }
  }
  return legacy;
}

function normalizeContactUrl(url: string): string {
  return url.trim().toLowerCase().replace(/\/$/, '');
}

function dedupeContactLinks(links: ReturnType<typeof resolveDisplayLinks>) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = normalizeContactUrl(link.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildHeroDescription(
  profile: MarketplaceCreatorPublicProfile,
  locationLabel: string | null
): string {
  if (profile.bio?.trim()) {
    return profile.bio.trim().replace(/\s+/g, ' ');
  }

  const parts: string[] = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    parts.push(
      `${profile.yearsOfExperience} an${profile.yearsOfExperience > 1 ? 's' : ''} d'expérience`
    );
  }
  if (locationLabel) parts.push(`basé à ${locationLabel}`);
  return parts.join(' · ') || 'Découvrez mon travail et contactez-moi pour collaborer.';
}

function resolveHeroSocialLinks(
  profile: MarketplaceCreatorPublicProfile,
  displayLinks: ReturnType<typeof resolveDisplayLinks>
) {
  const fromProfileLinks = displayLinks
    .filter((link) => link.type === 'SOCIAL' && link.url.trim())
    .map((link) => ({
      id: link.id,
      platform: ('platform' in link ? link.platform : link.label) ?? link.label,
      url: link.url.trim(),
      label: link.label,
    }));

  if (fromProfileLinks.length > 0) return fromProfileLinks;

  if (!profile.socialLinks) return [];

  return Object.entries(profile.socialLinks)
    .filter(([, url]) => url?.trim())
    .map(([platform, url]) => ({
      id: platform,
      platform,
      url: url.trim(),
      label: socialLabel(platform),
    }));
}

function resolveExactContentCount(profile: MarketplaceCreatorPublicProfile): number | null {
  if (profile.contentCount != null && profile.contentCount > 0) {
    return profile.contentCount;
  }
  return null;
}

function buildHeroStats(
  profile: MarketplaceCreatorPublicProfile,
  languageCount: number
): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    stats.push({ value: `${profile.yearsOfExperience}+`, label: 'Years exp.' });
  }
  const contentCount = resolveExactContentCount(profile);
  if (contentCount != null && contentCount > 0) {
    stats.push({ value: String(contentCount), label: 'Projects' });
  }
  if (languageCount > 0) {
    stats.push({ value: String(languageCount), label: 'Languages' });
  } else if (profile.followerCount != null && profile.followerCount > 0) {
    stats.push({ value: `${profile.followerCount}+`, label: 'Followers' });
  } else if (profile.averageRating != null) {
    stats.push({ value: profile.averageRating.toFixed(1), label: 'Rating' });
  }
  return stats.slice(0, 3);
}

function buildStats(
  profile: MarketplaceCreatorPublicProfile,
  languageCount: number
): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    stats.push({ value: `${profile.yearsOfExperience}+`, label: 'Years' });
  }
  const contentCount = resolveExactContentCount(profile);
  if (contentCount != null && contentCount > 0) {
    stats.push({ value: String(contentCount), label: 'Content' });
  }
  if (languageCount > 0) {
    stats.push({ value: String(languageCount), label: 'Languages' });
  }
  if (profile.averageRating != null) {
    stats.push({ value: profile.averageRating.toFixed(1), label: 'Rating' });
  }
  return stats;
}

type SectionTitleLayout = 'stacked' | 'aside-left' | 'aside-right';
type SectionIllustrationVariant = 'none' | 'chat' | 'question' | 'docs' | 'support' | 'hex';

function asideAwareHeaderAlign(
  layout: SectionTitleLayout | undefined,
  fallback: { centered: boolean; alignRight: boolean; alwaysCentered: boolean }
) {
  if (layout === 'aside-left' || layout === 'aside-right') {
    return { centered: true, alignRight: false, alwaysCentered: true };
  }
  return fallback;
}

function SectionIllustratedContent({
  variant,
  placement = 'right',
  accent,
  ink,
  surface,
  children,
}: {
  variant?: SectionIllustrationVariant;
  placement?: 'left' | 'right';
  accent: string;
  ink: string;
  surface: string;
  children: ReactNode;
}) {
  if (!variant || variant === 'none') return <>{children}</>;
  const illustration = <FaqSectionIllustration variant={variant} />;
  return (
    <div
      className={`grid w-full min-w-0 gap-8 lg:items-center ${
        placement === 'left'
          ? 'lg:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)]'
          : 'lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.32fr)]'
      }`}
      style={
        {
          '--faq-accent': accent,
          '--faq-ink': ink,
          '--faq-surface': surface,
        } as CSSProperties
      }
    >
      {placement === 'left' ? (
        <>
          {illustration}
          <div className="min-w-0">{children}</div>
        </>
      ) : (
        <>
          <div className="min-w-0">{children}</div>
          {illustration}
        </>
      )}
    </div>
  );
}

function SectionAsideContent({
  layout,
  header,
  children,
  centerHeader = true,
  stickyHeader = false,
}: {
  layout: SectionTitleLayout;
  header: ReactNode;
  children: ReactNode;
  centerHeader?: boolean;
  /** Keep the title visible while scrolling through the section (lg+). */
  stickyHeader?: boolean;
}) {
  const stickyTop = 'max(5.5rem, var(--portfolio-nav-top-clearance, 5.5rem))';
  // Match title column height to the list so vertical centering / sticky have room to move.
  const stretchRow = centerHeader || stickyHeader;
  const align = stretchRow ? 'lg:items-stretch' : 'lg:items-start';
  const grid =
    layout === 'aside-right'
      ? `grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] ${align} lg:gap-x-12 xl:gap-x-16`
      : `grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] ${align} lg:gap-x-12 xl:gap-x-16`;

  const stickyHeaderNode = stickyHeader ? (
    <div
      className="flex w-full flex-col items-center text-center lg:sticky lg:z-10 lg:self-start"
      style={{ top: stickyTop }}
    >
      {header}
    </div>
  ) : (
    header
  );

  const headerNode = centerHeader ? (
    <div className="flex min-h-full w-full flex-col items-center justify-center text-center">
      {stickyHeaderNode}
    </div>
  ) : (
    stickyHeaderNode
  );

  const headerCell = stretchRow
    ? 'relative min-w-0 min-h-0 self-stretch'
    : 'min-w-0 self-start';

  return (
    <div className={grid}>
      {layout === 'aside-right' ? (
        <>
          <div className="min-w-0">{children}</div>
          <div className={headerCell}>{headerNode}</div>
        </>
      ) : (
        <>
          <div className={headerCell}>{headerNode}</div>
          <div className="min-w-0">{children}</div>
        </>
      )}
    </div>
  );
}

/**
 * Every Services pricing design renders off `PortfolioServiceItem` (`tasks: {value}[]`) —
 * the studio-editor shape — rather than the real public-page shape `ProfileServiceItem`
 * (`tasks?: string[]`) that `services` actually is here (from `profile.profileServices`).
 * Converts once at the dispatch call sites below instead of editing each design file.
 */
function toPortfolioServiceItems(items: ProfileServiceItem[]): PortfolioServiceItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    basePriceCents: item.basePriceCents,
    deadline: item.deadline ?? '',
    tasks: (item.tasks ?? []).map((value) => ({ value })),
  }));
}

export function PublicCreatorPortfolioPage({
  creatorId,
  profile,
  isAuthenticated,
  locationLabel,
  portfolioPosts,
  studioEmbed = false,
}: PublicCreatorPortfolioPageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const isPortfolioOwner = !authLoading && user?.id === creatorId;
  const hideOwnerChrome = studioEmbed;
  const resolvedContactEmail = primaryContactEmail(profile);
  const [profileVisits, setProfileVisits] = useState<number>(profile.profileVisits ?? 0);
  const {
    settings,
    setColorMode,
    applyExternalSettings,
  } =
    usePortfolioSettings(creatorId, {
      initialSettings: profile.portfolioSettings,
      canEdit: isPortfolioOwner && !hideOwnerChrome,
    });
  const previewSectionFocusRef = useRef<(sectionId: string) => void>(() => {});

  const cyclePortfolioColorMode = useCallback(() => {
    const next = (settings.global.colorMode ?? 'dark') === 'light' ? 'dark' : 'light';
    if (hideOwnerChrome && typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage(
        {
          source: PORTFOLIO_STUDIO_PREVIEW_SOURCE,
          type: 'color-mode-change',
          mode: next,
        },
        window.location.origin
      );
    }
    setColorMode(next);
  }, [hideOwnerChrome, setColorMode, settings.global.colorMode]);

  useEffect(() => {
    const design = normalizePortfolioHeroBannerDesign(
      settings.hero.heroBannerDesign ?? DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN
    );
    writeHeroBannerDesignHint([creatorId, profile.id, profile.username], design);
  }, [creatorId, profile.id, profile.username, settings.hero.heroBannerDesign]);

  const workItems = useMemo(() => {
    const posts = portfolioPosts ?? profile.portfolioPosts ?? [];
    const works = profile.portfolioWorks;
    if (!works?.length) return posts;
    const byId = new Map(works.map((work) => [String(work.id), work]));
    return posts.map((post) => {
      const work = byId.get(String(post.id));
      if (!work) return post;
      const role = post.role?.trim() || work.role?.trim() || null;
      const category = post.category?.trim() || work.category?.trim() || null;
      return {
        ...post,
        role,
        category,
        genre: post.genre?.trim() || category || role || null,
      };
    });
  }, [portfolioPosts, profile.portfolioPosts, profile.portfolioWorks]);
  const availableHeroWorks = useMemo(
    () =>
      workItems
        .map((item) => {
          const raw = typeof item.mediaUrl === 'string' ? item.mediaUrl.trim() : '';
          if (!raw) return null;
          
          // Priority: 1) External linkUrl, 2) Section link with work ID, 3) Marketplace fallback
          const externalUrl = item.linkUrl?.trim();
          const workHref = externalUrl || `#work-${item.id}`;
          
          return {
            id: item.id,
            title: item.title?.trim() || 'Untitled project',
            imageUrl: raw,
            href: workHref,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [workItems]
  );
  const heroFeaturedWorks = useMemo(() => {
    const banner = normalizePortfolioHeroBannerDesign(
      settings.hero.heroBannerDesign ?? DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN
    );
    if (banner === 'work-duo') {
      const selectedIds = settings.hero.heroWorkDuoSelectedWorkIds ?? [];
      if (selectedIds.length > 0) {
        const byId = new Map(availableHeroWorks.map((work) => [work.id, work]));
        return selectedIds
          .map((id) => byId.get(id))
          .filter((work): work is NonNullable<typeof work> => Boolean(work))
          .slice(0, 2);
      }
      return availableHeroWorks.slice(0, 2);
    }
    return availableHeroWorks.slice(0, 4);
  }, [
    availableHeroWorks,
    settings.hero.heroBannerDesign,
    settings.hero.heroWorkDuoSelectedWorkIds,
  ]);
  const experienceBlocks = profile.experienceBlocks ?? [];
  const strengths = useMemo(
    () => profile.strengthsToolsMastered ?? [],
    [profile.strengthsToolsMastered]
  );
  const stackItems = useMemo(
    () => profile.profileStack ?? [],
    [profile.profileStack]
  );
  const strengthNames = useMemo(
    () => strengths.map((item) => (typeof item === 'string' ? item : item.name)),
    [strengths]
  );
  const services = profile.profileServices ?? [];
  const availableServices = useMemo(
    () => services.map((item) => ({ id: item.id, title: item.title })),
    [services]
  );
  const faqItems = profile.faqItems ?? [];
  const teamMembers = profile.teamMembers ?? [];
  const galleryItems = profile.galleryItems ?? [];
  const aboutUs = profile.aboutUs ?? null;
  const displayLinks = resolveDisplayLinks(profile);
  const uniqueContactLinks = useMemo(() => dedupeContactLinks(displayLinks), [displayLinks]);
  const primaryLink = resolvePrimaryLink(profile);
  const legacyLanguages = profile.languages?.trim();
  const memberSinceLabel = formatMemberSince(profile.memberSince);
  const availabilityDisplay = profile.availabilityHours?.trim()
    ? formatAvailabilityHours(parseAvailabilityHours(profile.availabilityHours), profile.timezoneId)
    : null;
  const languageList = useMemo(() => {
    const spokenLanguages = profile.spokenLanguages ?? [];
    return spokenLanguages.length > 0
      ? spokenLanguages
      : legacyLanguages
        ? legacyLanguages.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
  }, [profile.spokenLanguages, legacyLanguages]);
  const languageCount = languageList.length;

  const { lead: nameLead, accent: nameAccent } = splitDisplayName(profile.fullName);
  const heroDescription = buildHeroDescription(profile, locationLabel);
  const heroStats = buildHeroStats(profile, languageCount);
  const rawAboutStats = buildStats(profile, languageCount);

  const hasServicesSection = services.length > 0;
  const hasExperienceSection = experienceBlocks.length > 0 || profile.yearsOfExperience != null;
  const hasFaqSection = faqItems.length > 0;
  const hasTeamSection = teamMembers.length > 0;
  const hasGallerySection = galleryItems.length > 0;
  const hasAboutUsSection =
    portfolioPresenceShowsAboutUs(settings.global.presenceKind) &&
    Boolean(
      aboutUs &&
        (aboutUs.title?.trim() ||
          aboutUs.description?.trim() ||
          (aboutUs.tasks ?? []).some((task) => task.trim()) ||
          (aboutUs.imageUrls ?? []).some((url) => (url ?? '').trim()) ||
          aboutUs.quote?.trim() ||
          aboutUs.founder?.name?.trim() ||
          aboutUs.founder?.function?.trim() ||
          aboutUs.founder?.logoUrl?.trim())
    );
  const hasContactSection = Boolean(
    resolvedContactEmail ||
      profile.phone?.trim() ||
      locationLabel ||
      displayLinks.length > 0 ||
      primaryLink
  );

  const socialLinks = useMemo(
    () => resolveHeroSocialLinks(profile, displayLinks),
    [profile, displayLinks]
  );

  const navProfileLinkOptions = useMemo(
    () =>
      buildPortfolioNavSocialLinkOptions({
        profileLinks: displayLinks.map((link) => ({
          id: link.id,
          label: link.label,
          url: link.url,
          platform: link.platform ?? null,
          iconUrl: link.iconUrl ?? null,
        })),
      }),
    [displayLinks]
  );

  const navSocialLinkOptions = navProfileLinkOptions;

  useEffect(() => {
    if (!hideOwnerChrome || typeof window === 'undefined' || window.parent === window) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isPortfolioStudioPreviewMessage(event.data)) return;
      if (event.data.type === 'apply-settings') {
        applyExternalSettings(event.data.settings);
        return;
      }
      if (event.data.type === 'scroll-to-section') {
        const sectionId = event.data.sectionId;
        requestAnimationFrame(() => previewSectionFocusRef.current(sectionId));
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [hideOwnerChrome, applyExternalSettings]);

  useEffect(() => {
    if (!hideOwnerChrome || typeof window === 'undefined' || window.parent === window) return;

    const meta = {
      availableTools: strengthNames,
      availableWorks: availableHeroWorks.map(({ id, title, imageUrl }) => ({ id, title, imageUrl })),
      availableServices,
      navSocialLinkOptions,
    };
    window.parent.postMessage(
      { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'ready', meta },
      window.location.origin
    );
  }, [hideOwnerChrome, strengthNames, availableHeroWorks, availableServices, navSocialLinkOptions]);

  const navChromeLinks = useMemo(() => {
    const structuredBar =
      settings.navigation.navLayoutDesign === 'editorial-bar' ||
      settings.navigation.navLayoutDesign === 'duten-panel' ||
      settings.navigation.navLayoutDesign === 'half-panel-left';
    if (structuredBar) {
      return navProfileLinkOptions;
    }
    return buildPortfolioNavChromeLinks({
      sources:
        settings.navigation.linkIconSources ?? DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES,
      email: resolvedContactEmail || null,
      socialLinks,
    });
  }, [
    settings.navigation.navLayoutDesign,
    settings.navigation.linkIconSources,
    resolvedContactEmail,
    socialLinks,
    navProfileLinkOptions,
  ]);

  const usesMonochromeChrome = portfolioUsesMonochromeChrome(
    settings.themeId,
    settings.global.monochromeUi
  );

  const showWorkSection = workItems.length > 0 && settings.work.enabled;
  const showServicesSection = hasServicesSection && settings.services.enabled;
  const showAboutSection = false;
  const showInfoSection = settings.info.enabled;
  const showExperienceSection = hasExperienceSection && settings.experience.enabled;
  const showFaqSection = hasFaqSection && settings.faq.enabled;
  const showTeamSection = hasTeamSection && settings.team.enabled;
  const showGallerySection = hasGallerySection && settings.gallery.enabled;
  const showAboutUsSection = hasAboutUsSection && settings.aboutUs.enabled;
  // Contact's Design tab now has 4 real premium designs — but only those 4 (not the 9
  // legacy card designs, which still have no UI to pick/reconfigure them). Any account
  // still on a legacy `cardDesign` stays hidden until it's switched to one of the new ones.
  const showContactSectionResolved =
    hasContactSection && settings.contact.enabled && isContactPremiumDesign(settings.contact.cardDesign);
  const showToolsSection = strengths.length > 0 && settings.tools.enabled;
  const showStackSection = stackItems.length > 0 && settings.stack.enabled;
  const footerVisibleSectionLinks = {
    gallery: showGallerySection,
    aboutUs: showAboutUsSection,
    team: showTeamSection,
    services: showServicesSection,
    work: showWorkSection,
  };

  const heroTools = useMemo(
    () => resolveHeroTools(strengthNames, settings.hero.selectedTools),
    [strengthNames, settings.hero.selectedTools]
  );
  /** Editorial rail: profile tools (selected first, then new additions) — max 4. */
  const editorialRailTools = useMemo(
    () =>
      resolveHeroEditorialRailTools(
        strengthNames,
        settings.hero.heroEditorialRailSelectedTools
      ),
    [strengthNames, settings.hero.heroEditorialRailSelectedTools]
  );
  /** Statement CTA: up to 5 tools for the mock tool row. */
  const statementCtaTools = useMemo(
    () =>
      resolveHeroStatementCtaTools(
        strengthNames,
        settings.hero.heroEditorialRailSelectedTools
      ),
    [strengthNames, settings.hero.heroEditorialRailSelectedTools]
  );
  /** Portrait balance: up to 12 tool tags above the bio. */
  const portraitBalanceTools = useMemo(
    () =>
      resolveHeroPortraitBalanceTools(
        strengthNames,
        settings.hero.heroEditorialRailSelectedTools
      ),
    [strengthNames, settings.hero.heroEditorialRailSelectedTools]
  );
  const bannerTools = useMemo(() => {
    if (settings.hero.heroBannerDesign === 'editorial-rail') return editorialRailTools;
    if (settings.hero.heroBannerDesign === 'statement-cta') return statementCtaTools;
    if (settings.hero.heroBannerDesign === 'portrait-balance') return portraitBalanceTools;
    return heroTools;
  }, [
    editorialRailTools,
    heroTools,
    portraitBalanceTools,
    settings.hero.heroBannerDesign,
    statementCtaTools,
  ]);
  const heroToolDetails = useMemo(() => {
    return bannerTools.map(
      (name) =>
        strengths.find((item) => (typeof item === 'string' ? item : item.name) === name) ?? name
    );
  }, [bannerTools, strengths]);
  /** Banner designs that always need profile tools — ignore classic “Show tools row” gate. */
  const passHeroTools =
    settings.hero.showTools === true ||
    settings.hero.heroBannerDesign === 'editorial-rail' ||
    settings.hero.heroBannerDesign === 'statement-cta' ||
    settings.hero.heroBannerDesign === 'portrait-balance';
  const heroToolsProp = passHeroTools ? bannerTools : [];
  const heroToolDetailsProp = passHeroTools ? heroToolDetails : [];

  const heroPresentation = useMemo(
    () => pickHeroPresentationSettings(settings.hero),
    [settings.hero]
  );
  const heroPalette = useMemo(
    () => resolveHeroPaletteFromSettings(heroPresentation.palette),
    [heroPresentation.palette]
  );
  const activeGlobalPalette = useMemo(
    () => resolveActivePortfolioPalette(settings.global),
    [settings.global]
  );
  // Auto / Light / Dark base for a section's own colorModeOverride (Global → Theme's palette
  // pair, independent of which half Global itself currently shows) — resolved once and reused
  // by every section so a per-section override never has to re-derive the pair itself.
  const lightGlobalPalette = useMemo(
    () => resolveActivePortfolioPalette({ ...settings.global, colorMode: 'light' }),
    [settings.global]
  );
  const darkGlobalPalette = useMemo(
    () => resolveActivePortfolioPalette({ ...settings.global, colorMode: 'dark' }),
    [settings.global]
  );
  const workPalette = useMemo(
    () =>
      resolveSectionPalette(settings.work.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.work.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const workPresentation = useMemo(
    () =>
      resolveSectionBackgroundIsolation(
        applyHeroPaletteToWork(pickWorkPresentationSettings(settings.work), workPalette),
        settings.work.colorModeOverride,
        workPalette.fond
      ),
    [settings.work, workPalette]
  );
  const workColorMode = useMemo(
    () =>
      resolveSectionActiveMode(
        settings.work.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    [settings.work.colorModeOverride, settings.global.colorMode]
  );
  const workSectionTitle = useMemo(
    () => resolveWorkSectionTitle(settings.work),
    [settings.work]
  );
  const workSectionSubtitle = useMemo(
    () => resolveWorkSectionSubtitle(settings.work),
    [settings.work]
  );
  const aboutPalette = useMemo(
    () =>
      resolveSectionPalette(settings.about.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.about.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const aboutPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToAbout(pickAboutPresentationSettings(settings.about), aboutPalette),
        settings.about.colorModeOverride,
        aboutPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.about.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.about, settings.global.colorMode, aboutPalette]
  );
  const stats = useMemo(
    () => filterAboutStats(rawAboutStats, aboutPresentation),
    [rawAboutStats, aboutPresentation]
  );
  const experiencePalette = useMemo(
    () =>
      resolveSectionPalette(settings.experience.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [
      settings.experience.colorModeOverride,
      activeGlobalPalette,
      lightGlobalPalette,
      darkGlobalPalette,
    ]
  );
  const experiencePresentation = useMemo(() => {
    const picked = pickExperiencePresentationSettings(settings.experience);
    const painted = applyHeroPaletteToExperience(picked, experiencePalette);
    const mode = resolveSectionActiveMode(
      settings.experience.colorModeOverride,
      (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
    );
    // When forced to one mode, both slots of the period-rule pair collapse to that mode's
    // palette (the rule never flips with prefers-color-scheme for a section pinned open).
    const experienceOverride = settings.experience.colorModeOverride;
    const periodRuleLightPalette =
      experienceOverride === 'dark' ? darkGlobalPalette : lightGlobalPalette;
    const periodRuleDarkPalette =
      experienceOverride === 'light' ? lightGlobalPalette : darkGlobalPalette;
    const periodRulePair =
      picked.useHeroPalette === false
        ? {
            periodRuleColor: picked.periodRuleColor,
            periodRuleColorDark: picked.periodRuleColorDark,
          }
        : syncExperiencePeriodRulePair(painted, periodRuleLightPalette, periodRuleDarkPalette) ?? {
            periodRuleColor: picked.periodRuleColor,
            periodRuleColorDark: picked.periodRuleColorDark,
            periodRuleFollowPalette: false as const,
          };
    return {
      ...resolveSectionBackgroundIsolation(painted, experienceOverride, experiencePalette.fond),
      ...periodRulePair,
      activeColorMode: mode,
    };
  }, [settings.experience, settings.global, experiencePalette, lightGlobalPalette, darkGlobalPalette]);
  const experienceSectionTitle = useMemo(
    () => resolveExperienceSectionTitle(settings.experience),
    [settings.experience]
  );
  const experienceSectionSubtitle = useMemo(
    () => resolveExperienceSectionSubtitle(settings.experience),
    [settings.experience]
  );
  const galleryPalette = useMemo(
    () =>
      resolveSectionPalette(settings.gallery.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [
      settings.gallery.colorModeOverride,
      activeGlobalPalette,
      lightGlobalPalette,
      darkGlobalPalette,
    ]
  );
  const galleryPresentation = useMemo(() => {
    const picked = pickGalleryPresentationSettings(settings.gallery);
    const painted =
      picked.useHeroPalette === false
        ? picked
        : { ...picked, ...applyGalleryPaletteToSettings(picked, galleryPalette) };
    return resolveSectionBackgroundIsolation(
      painted,
      settings.gallery.colorModeOverride,
      galleryPalette.fond
    );
  }, [settings.gallery, galleryPalette]);
  const gallerySectionTitle = useMemo(
    () => resolveGallerySectionTitle(settings.gallery),
    [settings.gallery]
  );
  const gallerySectionSubtitle = useMemo(
    () => resolveGallerySectionSubtitle(settings.gallery),
    [settings.gallery]
  );
  const servicesPalette = useMemo(
    () =>
      resolveSectionPalette(settings.services.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [
      settings.services.colorModeOverride,
      activeGlobalPalette,
      lightGlobalPalette,
      darkGlobalPalette,
    ]
  );
  const servicesPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToServices(
          pickServicesPresentationSettings(settings.services),
          servicesPalette
        ),
        settings.services.colorModeOverride,
        servicesPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.services.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.services, settings.global.colorMode, servicesPalette]
  );
  const isDistinctServicesOrganization = servicesUsesDistinctSections(
    servicesPresentation.sectionOrganization
  );
  const contentSectionOrder = useMemo(
    () =>
      resolvePortfolioContentSectionOrder(
        settings.global.sectionOrder,
        servicesPresentation.sectionOrganization
      ),
    [settings.global.sectionOrder, servicesPresentation.sectionOrganization]
  );
  const sectionVisibility = useMemo(
    () => ({
      work: showWorkSection,
      services:
        showServicesSection &&
        (!isDistinctServicesOrganization || servicesPresentation.showServices),
      about: showAboutSection,
      info: showInfoSection,
      aboutUs: showAboutUsSection,
      experience: showExperienceSection,
      team: showTeamSection,
      gallery: showGallerySection,
      faq: showFaqSection,
      contact: showContactSectionResolved,
      stack: showStackSection,
      tools: showToolsSection,
    }),
    [
      showWorkSection,
      showServicesSection,
      isDistinctServicesOrganization,
      servicesPresentation.showServices,
      showAboutSection,
      showInfoSection,
      showAboutUsSection,
      showExperienceSection,
      showTeamSection,
      showGallerySection,
      showFaqSection,
      showContactSectionResolved,
      showStackSection,
      showToolsSection,
    ]
  );
  const servicesSectionTitle = useMemo(
    () => resolveServicesSectionTitle(settings.services),
    [settings.services]
  );
  const servicesSectionSubtitle = useMemo(
    () => resolveServicesSectionSubtitle(settings.services),
    [settings.services]
  );
  const faqPalette = useMemo(
    () =>
      resolveSectionPalette(settings.faq.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.faq.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const faqPresentation = useMemo(
    () =>
      resolveSectionBackgroundIsolation(
        applyHeroPaletteToFaq(pickFaqPresentationSettings(settings.faq), faqPalette),
        settings.faq.colorModeOverride,
        faqPalette.fond
      ),
    [settings.faq, faqPalette]
  );
  // Prism Cards, Star Scroll, Tri Grid, Split Index, Centered Focus and Bento Dual
  // read this to resolve `[data-pf-faq-mode]` — Kinetic Split, Floating Gallery and
  // Editorial Masonry track `--pf-palette-fond` directly instead.
  const faqActiveColorMode = useMemo(
    () =>
      resolveSectionActiveMode(
        settings.faq.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    [settings.faq.colorModeOverride, settings.global.colorMode]
  );
  const faqSectionTitle = useMemo(() => resolveFaqSectionTitle(settings.faq), [settings.faq]);
  const faqSectionSubtitle = useMemo(() => resolveFaqSectionSubtitle(settings.faq), [settings.faq]);
  const teamPalette = useMemo(
    () =>
      resolveSectionPalette(settings.team.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.team.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const teamPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToTeam(pickTeamPresentationSettings(settings.team), teamPalette),
        settings.team.colorModeOverride,
        teamPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.team.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.team, settings.global.colorMode, teamPalette]
  );
  const teamSectionTitle = useMemo(() => resolveTeamSectionTitle(settings.team), [settings.team]);
  const teamSectionSubtitle = useMemo(() => resolveTeamSectionSubtitle(settings.team), [settings.team]);
  const infoPalette = useMemo(
    () =>
      resolveSectionPalette(settings.info.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.info.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const infoPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToInfo(pickInfoPresentationSettings(settings.info), infoPalette),
        settings.info.colorModeOverride,
        infoPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.info.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.info, settings.global.colorMode, infoPalette]
  );
  // About · terminal "Always dark" — colors for the terminal shell ONLY, resolved from the
  // dark global palette regardless of the Info section's own light/dark mode. Everything
  // outside the terminal (section background, shared header, nav) keeps following the
  // section's normal mode via infoPresentation above.
  const infoAboutTerminalDarkColors = useMemo(() => {
    if (settings.info.design !== 'about-terminal' || settings.info.aboutTerminalAlwaysDark !== true) {
      return null;
    }
    const dark = applyHeroPaletteToInfo(pickInfoPresentationSettings(settings.info), darkGlobalPalette);
    return {
      accentColor: dark.accentColor,
      titleColor: dark.titleColor,
      subtitleColor: dark.subtitleColor,
      bodyColor: dark.bodyColor,
      cardBackgroundColor: dark.cardBackgroundColor,
      cardBorderColor: dark.cardBorderColor,
    };
  }, [settings.info, darkGlobalPalette]);
  const infoSectionTitle = useMemo(() => resolveInfoSectionTitle(settings.info), [settings.info]);
  const infoSectionSubtitle = useMemo(
    () => resolveInfoSectionSubtitle(settings.info),
    [settings.info]
  );
  const isAboutSplitInfo = infoPresentation.design === 'about-split';
  const isAboutBannerInfo = infoPresentation.design === 'about-banner';
  const isAboutHeroInfo = isAboutSplitInfo || isAboutBannerInfo;
  const toolsPalette = useMemo(
    () =>
      resolveSectionPalette(settings.tools.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.tools.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const toolsPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToTools(pickToolsPresentationSettings(settings.tools), toolsPalette),
        settings.tools.colorModeOverride,
        toolsPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.tools.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.tools, settings.global.colorMode, toolsPalette]
  );
  const stackPalette = useMemo(
    () =>
      resolveSectionPalette(settings.stack.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.stack.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const stackPresentation = useMemo((): PortfolioStackPresentationSettings & {
    activeColorMode: 'light' | 'dark';
  } => {
    const picked = pickStackPresentationSettings(settings.stack);
    const isBrandCards = picked.design === 'brand-cards';
    const stackSupportsDescription =
      picked.design === 'brand-cards' || picked.design === 'brand-index';
    return {
      ...picked,
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToStack(picked, stackPalette),
        settings.stack.colorModeOverride,
        stackPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.stack.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
      showUseCases: isBrandCards ? picked.showUseCases !== false : false,
      showCategory: picked.design === 'brand-index',
      showDescription: stackSupportsDescription ? picked.showDescription !== false : false,
      showLevel: isBrandCards ? picked.showLevel !== false : picked.showLevel,
    };
  }, [settings.stack, settings.global.colorMode, stackPalette]);
  const toolsSectionTitle = useMemo(() => resolveToolsSectionTitle(settings.tools), [settings.tools]);
  const toolsSectionSubtitle = useMemo(
    () => resolveToolsSectionSubtitle(settings.tools),
    [settings.tools]
  );
  const stackSectionTitle = useMemo(() => resolveStackSectionTitle(settings.stack), [settings.stack]);
  const stackSectionSubtitle = useMemo(
    () => resolveStackSectionSubtitle(settings.stack),
    [settings.stack]
  );
  const aboutUsPalette = useMemo(
    () =>
      resolveSectionPalette(settings.aboutUs.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [
      settings.aboutUs.colorModeOverride,
      activeGlobalPalette,
      lightGlobalPalette,
      darkGlobalPalette,
    ]
  );
  const aboutUsPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToAboutUs(pickAboutUsPresentationSettings(settings.aboutUs), aboutUsPalette),
        settings.aboutUs.colorModeOverride,
        aboutUsPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.aboutUs.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.aboutUs, settings.global.colorMode, aboutUsPalette]
  );
  const aboutUsSectionTitle = useMemo(
    () => resolveAboutUsSectionTitle(settings.aboutUs),
    [settings.aboutUs]
  );
  const aboutUsSectionSubtitle = useMemo(
    () => resolveAboutUsSectionSubtitle(settings.aboutUs),
    [settings.aboutUs]
  );
  const contactPalette = useMemo(
    () =>
      resolveSectionPalette(settings.contact.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [
      settings.contact.colorModeOverride,
      activeGlobalPalette,
      lightGlobalPalette,
      darkGlobalPalette,
    ]
  );
  const contactPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToContact(pickContactPresentationSettings(settings.contact), contactPalette),
        settings.contact.colorModeOverride,
        contactPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        settings.contact.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.contact, settings.global.colorMode, contactPalette]
  );
  const contactSectionTitle = useMemo(
    () => resolveContactSectionTitle(settings.contact),
    [settings.contact]
  );
  const contactSectionSubtitle = useMemo(
    () => resolveContactSectionSubtitle(settings.contact, profile.responseTimeLabel),
    [settings.contact, profile.responseTimeLabel]
  );
  const footerPalette = useMemo(
    () =>
      resolveSectionPalette(settings.footer.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.footer.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette]
  );
  const footerPresentation = useMemo(
    () =>
      resolveSectionBackgroundIsolation(
        applyHeroPaletteToFooter(pickFooterPresentationSettings(settings.footer), footerPalette),
        settings.footer.colorModeOverride,
        footerPalette.fond
      ),
    [settings.footer, footerPalette]
  );
  const footerColorMode = useMemo(
    () =>
      resolveSectionActiveMode(
        settings.footer.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    [settings.footer.colorModeOverride, settings.global.colorMode]
  );
  const footerNavClearanceClass = useMemo(
    () =>
      portfolioFooterNavClearanceClass(settings.navigation.placement, {
        navMode: settings.navigation.navMode,
        enabled: settings.navigation.enabled,
      }),
    [
      settings.navigation.placement,
      settings.navigation.navMode,
      settings.navigation.enabled,
    ]
  );
  const navItems = useMemo(
    () =>
      contentSectionOrder
        .map((sectionKey) => {
          if (!sectionVisibility[sectionKey]) return null;

          return {
            id: sectionKey,
            label: resolveNavItemLabel(sectionKey, settings.navigation.itemLabels),
            icon: settings.navigation.itemIcons[sectionKey],
          };
        })
        .filter(Boolean) as { id: PortfolioNavSectionKey; label: string; icon: PortfolioNavIconVariant }[],
    [
      contentSectionOrder,
      sectionVisibility,
      settings.navigation.itemLabels,
      settings.navigation.itemIcons,
    ]
  );

  const pagesNavItems = useMemo(() => {
    const pages: { id: string; label: string; icon: PortfolioNavIconVariant }[] = [];
    if (settings.hero.enabled) {
      pages.push({ id: 'hero', label: 'Home', icon: 'home' });
    }
    pages.push(...navItems);
    return pages;
  }, [navItems, settings.hero.enabled]);

  const navMode = settings.navigation.navMode ?? 'default';
  const isPagesMode = navMode === 'pages';
  const navActiveColorMode = resolveSectionActiveMode(
    settings.navigation.colorModeOverride,
    (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
  );
  const isCaseOverlayNav = portfolioNavUsesCaseOverlayLayout(settings.navigation);
  const isDutenPanelNav = portfolioNavUsesDutenPanelLayout(settings.navigation);
  const isHalfPanelNav = portfolioNavUsesHalfPanelLeftLayout(settings.navigation);
  const [activePageId, setActivePageId] = useState(() => pagesNavItems[0]?.id ?? 'hero');
  const [pageSlideDirection, setPageSlideDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (!isPagesMode || pagesNavItems.length === 0) return;
    if (!pagesNavItems.some((item) => item.id === activePageId)) {
      setActivePageId(pagesNavItems[0].id);
    }
  }, [isPagesMode, pagesNavItems, activePageId]);

  useEffect(() => {
    if (!isPagesMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isPagesMode]);

  const lastContentPageId = navItems[navItems.length - 1]?.id;
  const shouldShowFooterOnPage = (pageId: string) => {
    if (!settings.footer.enabled) return false;
    if (sectionVisibility.contact) return pageId === 'contact';
    return Boolean(lastContentPageId) && pageId === lastContentPageId;
  };

  const contactCtaHref =
    primaryLink?.url ??
    (resolvedContactEmail ? `mailto:${resolvedContactEmail}` : '#footer');
  const pagesContactTarget = sectionVisibility.contact
    ? 'contact'
    : lastContentPageId ?? 'contact';

  const navigateToPage = (sectionId: string) => {
    const normalized =
      sectionId === 'footer' || sectionId === 'contact' ? pagesContactTarget : sectionId;
    const targetIndex = pagesNavItems.findIndex((item) => item.id === normalized);
    if (targetIndex < 0) {
      if (lastContentPageId) {
        setActivePageId(pagesContactTarget);
      }
      return;
    }
    const currentIndex = pagesNavItems.findIndex((item) => item.id === activePageId);
    if (currentIndex >= 0 && targetIndex !== currentIndex) {
      setPageSlideDirection(targetIndex > currentIndex ? 1 : -1);
    }
    setActivePageId(normalized);
  };

  previewSectionFocusRef.current = (sectionId: string) => {
    if (isPagesMode) {
      navigateToPage(sectionId);
      return;
    }
    if (scrollToPortfolioSection(sectionId)) return;
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const heroContactHref = isPagesMode ? `#${pagesContactTarget}` : '#footer';
  // One shared, GSAP-animated header design (Header) mounts above the Footer section,
  // independent of `footerPresentation.design` (which of Footer's own layouts renders
  // the content below) — same mechanism/placement convention as Team/Work/Info/etc.
  const footerHeaderProps = {
    title: profile.fullName,
    subtitle: undefined as string | undefined,
    presentation: footerPresentation,
    itemCount: uniqueContactLinks.length,
    ctaHref: resolvedContactEmail ? `mailto:${resolvedContactEmail}` : heroContactHref,
    locationLabel,
    timezoneId: profile.timezoneId,
  };
  const footerHeaderBlock =
    footerPresentation.headerDesign === 'index' ? (
      <FooterHeaderIndexHeader {...footerHeaderProps} />
    ) : footerPresentation.headerDesign === 'serif-lead' ? (
      <FooterHeaderSerifLeadHeader {...footerHeaderProps} />
    ) : footerPresentation.headerDesign === 'billboard' ? (
      <FooterHeaderBillboardHeader {...footerHeaderProps} />
    ) : footerPresentation.headerDesign === 'masthead' ? (
      <FooterHeaderMastheadHeader {...footerHeaderProps} />
    ) : footerPresentation.headerDesign === 'hero' ? (
      <FooterHeaderHeroHeader {...footerHeaderProps} />
    ) : footerPresentation.headerDesign === 'name' ? (
      <FooterHeaderNameHeader {...footerHeaderProps} />
    ) : footerPresentation.headerDesign === 'timezone' ? (
      <FooterHeaderTimezoneHeader {...footerHeaderProps} />
    ) : (
      <FooterHeaderEditorialHeader {...footerHeaderProps} />
    );
  const navContactHref = isPagesMode
    ? `#${pagesContactTarget}`
    : sectionVisibility.contact
      ? '#contact'
      : contactCtaHref;
  const servicesOrderCtaHref = resolveServicesOrderCtaHref({
    contactSectionVisible: showContactSectionResolved,
    phone: profile.phone,
    contactHref: isPagesMode ? `#${pagesContactTarget}` : '#contact',
  });
  const heroWorkHref = showWorkSection
    ? '#work'
    : showGallerySection
      ? '#gallery'
      : showServicesSection
        ? '#services'
        : showContactSectionResolved
          ? '#contact'
          : '#hero';
  const onNavigateSection = isPagesMode
    ? (sectionId: string) => {
        navigateToPage(sectionId);
      }
    : undefined;
  const onServicesOrderCtaNavigate = isPagesMode
    ? (href: string) => {
        if (href.startsWith('tel:') || href.startsWith('mailto:')) {
          window.location.assign(href);
          return;
        }
        const sectionId = href.replace(/^#/, '') || 'footer';
        onNavigateSection?.(sectionId);
      }
    : undefined;

  const isEditorialLayout = true;

  const hasGlobalBg = useMemo(() => hasGlobalPageBackground(settings.global), [settings.global]);
  /**
   * The global page background is an image-only wallpaper — it never suppresses a
   * section's own fill, so every section paints (or not) purely based on its own
   * "enable background" setting.
   */
  const suppressSectionBackground = (
    _section?: Pick<PortfolioSectionBackgroundSettings, 'sectionBackgroundEnabled'> | null
  ) => false;

  const sectionBackgroundByKey = useMemo((): Partial<
    Record<PortfolioNavSectionKey, PortfolioSectionBackgroundSettings>
  > => {
    return {
      info: infoPresentation,
      work: workPresentation,
      services: servicesPresentation,
      about: aboutPresentation,
      aboutUs: aboutUsPresentation,
      experience: experiencePresentation,
      team: teamPresentation,
      faq: faqPresentation,
      contact: contactPresentation,
      stack: stackPresentation,
      tools: toolsPresentation,
    };
  }, [
    infoPresentation,
    workPresentation,
    servicesPresentation,
    aboutPresentation,
    aboutUsPresentation,
    experiencePresentation,
    teamPresentation,
    faqPresentation,
    contactPresentation,
    stackPresentation,
    toolsPresentation,
  ]);

  const footerPaintsOwnBackground = Boolean(footerPresentation.sectionBackgroundEnabled);
  const globalFixedBgStyle = useMemo(
    () => globalFixedBackgroundImageStyle(settings.global),
    [settings.global]
  );
  const globalWidthClass = useMemo(
    () => globalContentWidthClass(settings.global.contentWidth),
    [settings.global.contentWidth]
  );
  const editorialShellClass = useMemo(
    () => portfolioEditorialShellClass(settings.global.contentGutter),
    [settings.global.contentGutter]
  );
  const titleScrollBehavior = settings.global.titleScroll;
  const effectiveTitleScroll = titleScrollBehavior;
  const motionProfile = settings.global.motionProfile;
  const titleChrome = useMemo(
    () => resolveGlobalSectionTitleChrome(settings.global),
    [settings.global]
  );
  const globalTypographyContext = useMemo(() => ({ splitRail: false }), []);
  const sectionTopSpacingClass = useMemo(
    () => globalSectionTitleTopClass(settings.global.sectionTitleTopSpacing),
    [settings.global.sectionTitleTopSpacing]
  );
  const sectionTopSpacingStyle = useMemo(
    () => globalSectionTitleTopExtraStyle(settings.global.sectionTitleTopExtraPx ?? 0),
    [settings.global.sectionTitleTopExtraPx]
  );
  const sectionBottomSpacingClass = useMemo(
    () => globalSectionTitleBottomClass(settings.global.sectionTitleBottomSpacing),
    [settings.global.sectionTitleBottomSpacing]
  );
  const sectionBottomSpacingStyle = useMemo(
    () => globalSectionTitleBottomExtraStyle(settings.global.sectionTitleBottomExtraPx ?? 0),
    [settings.global.sectionTitleBottomExtraPx]
  );

  const workHeaderAlign = useMemo(
    () =>
      asideAwareHeaderAlign(
        workPresentation.sectionLayout,
        resolveSectionHeaderAlign(settings.global, settings.work.headerAlignment)
      ),
    [settings.global, settings.work.headerAlignment, workPresentation.sectionLayout]
  );
  const experienceHeaderAlign = useMemo(() => {
    const layout = experiencePresentation.sectionLayout;
    if (layout === 'aside-left' || layout === 'aside-right') {
      return asideAwareHeaderAlign(layout, {
        centered: false,
        alignRight: false,
        alwaysCentered: false,
      });
    }
    if (settings.experience.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    const sectionAlign = settings.experience.headerAlignment === 'center' ? 'center' : 'left';
    return resolveSectionHeaderAlign(settings.global, sectionAlign);
  }, [experiencePresentation.sectionLayout, settings.global, settings.experience.headerAlignment]);
  const toolsHeaderAlign = useMemo(() => {
    if (toolsPresentation.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    return resolveSectionHeaderAlign(
      settings.global,
      toolsPresentation.headerAlignment === 'center' ? 'center' : 'left'
    );
  }, [settings.global, toolsPresentation.headerAlignment]);
  const stackHeaderAlign = useMemo(() => {
    const layout = stackPresentation.sectionLayout ?? 'stacked';
    if (layout === 'aside-left' || layout === 'aside-right') {
      return { centered: true, alignRight: false, alwaysCentered: true };
    }
    if (stackPresentation.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    return resolveSectionHeaderAlign(
      settings.global,
      stackPresentation.headerAlignment === 'center' ? 'center' : 'left'
    );
  }, [settings.global, stackPresentation.headerAlignment, stackPresentation.sectionLayout]);
  const aboutUsHeaderAlign = useMemo(() => {
    const layout = aboutUsPresentation.sectionLayout;
    if (layout === 'aside-left' || layout === 'aside-right') {
      return asideAwareHeaderAlign(layout, {
        centered: false,
        alignRight: false,
        alwaysCentered: false,
      });
    }
    if (aboutUsPresentation.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    return resolveSectionHeaderAlign(
      settings.global,
      aboutUsPresentation.headerAlignment === 'center' ? 'center' : 'left'
    );
  }, [settings.global, aboutUsPresentation.headerAlignment, aboutUsPresentation.sectionLayout]);
  const workHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: workHeaderFontClass(workPresentation.titleFont, 'title'),
      fontStyle: workHeaderFontStyle(workPresentation.titleFont),
      colorStyle: workTitleColorStyle(workPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: workHeaderFontClass(workPresentation.subtitleFont, 'subtitle'),
      fontStyle: workHeaderFontStyle(workPresentation.subtitleFont),
      colorStyle: workSubtitleColorStyle(workPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, workPresentation, globalTypographyContext]);

  const experienceHeaderTypography = useMemo(() => {
    const titleClass = [
      experienceHeaderFontClass(experiencePresentation.titleFont, 'title'),
      experiencePresentation.titleUppercase && experiencePresentation.titleFont !== 'display'
        ? 'uppercase'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
    const subtitleClass = [
      experienceHeaderFontClass(experiencePresentation.subtitleFont, 'subtitle'),
      experiencePresentation.subtitleUppercase && experiencePresentation.subtitleFont !== 'display'
        ? 'uppercase'
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: titleClass,
      fontStyle: experienceHeaderFontStyle(experiencePresentation.titleFont),
      colorStyle: experienceTitleColorStyle(experiencePresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: subtitleClass,
      fontStyle: experienceHeaderFontStyle(experiencePresentation.subtitleFont),
      colorStyle: experienceSubtitleColorStyle(experiencePresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, experiencePresentation, globalTypographyContext]);

  const toolsHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
        fontClass: toolsHeaderFontClass(toolsPresentation.titleFont, 'title'),
        fontStyle: toolsHeaderFontStyle(toolsPresentation.titleFont),
        colorStyle: toolsTitleColorStyle(toolsPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
        fontClass: toolsHeaderFontClass(toolsPresentation.subtitleFont, 'subtitle'),
        fontStyle: toolsHeaderFontStyle(toolsPresentation.subtitleFont),
        colorStyle: toolsSubtitleColorStyle(toolsPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, toolsPresentation, globalTypographyContext]);

  const stackHeaderTypography = useMemo(() => {
    const titleSize = resolveStackTitleSize(stackPresentation.titleSize);
    const subtitleSize = resolveStackSubtitleSize(stackPresentation.subtitleSize);
    const globalTitleScope = settings.global.titleTypography.scope;
    const globalSubtitleScope = settings.global.subtitleTypography.scope;
    const globalForTitle =
      globalTitleScope === 'global'
        ? {
            ...settings.global,
            titleTypography: { ...settings.global.titleTypography, size: titleSize },
          }
        : settings.global;
    const globalForSubtitle =
      globalSubtitleScope === 'global'
        ? {
            ...settings.global,
            subtitleTypography: { ...settings.global.subtitleTypography, size: subtitleSize },
          }
        : settings.global;

    const title = resolveGlobalSectionTitleTypography(
      globalForTitle,
      {
        fontClass: [
          stackHeaderFontClass(stackPresentation.titleFont, 'title'),
          globalTitleScope === 'section' ? stackSectionTitleSizeClass(titleSize) : '',
        ]
          .filter(Boolean)
          .join(' '),
        fontStyle: stackHeaderFontStyle(stackPresentation.titleFont),
        colorStyle: stackTitleColorStyle(stackPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      globalForSubtitle,
      {
        fontClass: [
          stackHeaderFontClass(stackPresentation.subtitleFont, 'subtitle'),
          globalSubtitleScope === 'section' ? stackSectionSubtitleSizeClass(subtitleSize) : '',
        ]
          .filter(Boolean)
          .join(' '),
        fontStyle: stackHeaderFontStyle(stackPresentation.subtitleFont),
        colorStyle: stackSubtitleColorStyle(stackPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return {
      title: {
        ...title,
        customSizing: true,
      },
      subtitle: {
        ...subtitle,
        customSizing: true,
      },
    };
  }, [settings.global, stackPresentation, globalTypographyContext]);

  const aboutUsHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
        fontClass: aboutUsHeaderFontClass(aboutUsPresentation.titleFont, 'title'),
        fontStyle: aboutUsHeaderFontStyle(aboutUsPresentation.titleFont),
        colorStyle: aboutUsTitleColorStyle(aboutUsPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
        fontClass: aboutUsHeaderFontClass(aboutUsPresentation.subtitleFont, 'subtitle'),
        fontStyle: aboutUsHeaderFontStyle(aboutUsPresentation.subtitleFont),
        colorStyle: aboutUsSubtitleColorStyle(aboutUsPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, aboutUsPresentation, globalTypographyContext]);

  const contactHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: contactHeaderFontClass(contactPresentation.titleFont, 'title'),
      fontStyle: contactHeaderFontStyle(
        contactPresentation.titleFont,
        contactPresentation.subtitleSerif,
        'title'
      ),
      colorStyle: contactTitleColorStyle(contactPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: contactHeaderFontClass(contactPresentation.subtitleFont, 'subtitle'),
      fontStyle: contactHeaderFontStyle(
        contactPresentation.subtitleFont,
        contactPresentation.subtitleSerif,
        'subtitle'
      ),
      colorStyle: contactSubtitleColorStyle(contactPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    // Contact titles are always sentence case — strip any global/CSS uppercase.
    return {
      title: {
        ...title,
        className: title.className.replace(/\buppercase\b/g, '').replace(/\s+/g, ' ').trim(),
      },
      subtitle,
    };
  }, [settings.global, contactPresentation, globalTypographyContext]);

  const aboutSideInfoItems = useMemo(() => {
    const items = [];

    if (locationLabel && isAboutSideInfoItemVisible('location', settings.about)) {
      items.push({
        id: 'location',
        icon: SIDE_INFO_ICONS.location,
        label: 'Location',
        title: locationLabel,
        subtitle:
          profile.timezoneId
            ? `${profile.timezoneId.replace(/_/g, ' ')}${availabilityDisplay ? ' · Available remotely' : ''}`
            : availabilityDisplay
              ? 'Available remotely'
              : undefined,
      });
    }

    if (languageCount > 0 && isAboutSideInfoItemVisible('languages', settings.about)) {
      items.push({
        id: 'languages',
        icon: SIDE_INFO_ICONS.languages,
        label: 'Languages',
        // Single line so horizontal layouts stay bottom-aligned with other 2-line cells.
        title: languageList.join(', '),
      });
    }

    if (profile.gender?.trim() && isAboutSideInfoItemVisible('gender', settings.about)) {
      items.push({
        id: 'gender',
        icon: SIDE_INFO_ICONS.gender,
        label: 'Gender',
        title: profile.gender,
      });
    }

    if (memberSinceLabel && isAboutSideInfoItemVisible('member-since', settings.about)) {
      items.push({
        id: 'member-since',
        icon: SIDE_INFO_ICONS.memberSince,
        label: 'Member since',
        title: memberSinceLabel,
      });
    }

    if (
      (profile.isAvailable === false || availabilityDisplay) &&
      isAboutSideInfoItemVisible('availability', settings.about)
    ) {
      const availabilityLines =
        profile.isAvailable === false
          ? undefined
          : profile.availabilityHours?.trim()
            ? formatAvailabilityHoursLines(parseAvailabilityHours(profile.availabilityHours))
            : undefined;
      items.push({
        id: 'availability',
        icon: SIDE_INFO_ICONS.availability,
        label: 'Availability',
        title: profile.isAvailable === false ? 'Currently unavailable' : (availabilityDisplay ?? ''),
        lines: availabilityLines,
        subtitle:
          profile.isAvailable !== false &&
          profile.responseTimeLabel?.trim() &&
          settings.about.showSidePanelResponseTime
            ? `Reply ${profile.responseTimeLabel.toLowerCase()}`
            : undefined,
      });
    }

    return items;
  }, [
    availabilityDisplay,
    languageCount,
    languageList,
    locationLabel,
    memberSinceLabel,
    profile.availabilityHours,
    profile.gender,
    profile.isAvailable,
    profile.responseTimeLabel,
    profile.timezoneId,
    settings.about,
  ]);

  function renderContentSection(sectionKey: PortfolioNavSectionKey) {
    if (!sectionVisibility[sectionKey]) return null;

    switch (sectionKey) {
      case 'info': {
        // Header — one shared, GSAP-animated header (chosen from 8 editorial layouts, same
        // mechanism as Portfolio/Work, Stack, Tools, and Contact). Count = visible info
        // highlights (populated + toggled-on content blocks), used by 3 of the 8 designs.
        const infoHeaderItemCount = [
          infoPresentation.showSkills !== false && (profile.aboutSkills?.length ?? 0) > 0,
          infoPresentation.showStrengths !== false && (profile.aboutStrengths?.length ?? 0) > 0,
          infoPresentation.showInterests !== false && (profile.aboutInterests?.length ?? 0) > 0,
          infoPresentation.showLanguages !== false &&
            ((profile.spokenLanguages?.length ?? 0) > 0 || (profile.languages?.length ?? 0) > 0),
          infoPresentation.showEducation !== false && (profile.aboutEducation?.length ?? 0) > 0,
          infoPresentation.showSystemsTools !== false && (profile.aboutSystemsTools?.length ?? 0) > 0,
        ].filter(Boolean).length;
        const infoHeaderProps = {
          title: infoSectionTitle,
          subtitle: infoSectionSubtitle || undefined,
          presentation: infoPresentation,
          itemCount: infoHeaderItemCount,
        };
        const infoHeaderBlock =
          infoPresentation.headerDesign === 'marquee' ? (
            <InfoHeaderMarqueeHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'index' ? (
            <InfoHeaderIndexHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'accent-count' ? (
            <InfoHeaderAccentCountHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'serif-lead' ? (
            <InfoHeaderSerifLeadHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'billboard' ? (
            <InfoHeaderBillboardHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'masthead' ? (
            <InfoHeaderMastheadHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'split-heading' ? (
            <InfoHeaderSplitHeadingHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'chapter' ? (
            <InfoHeaderChapterHeader {...infoHeaderProps} />
          ) : infoPresentation.headerDesign === 'cover' ? (
            <InfoHeaderCoverHeader {...infoHeaderProps} />
          ) : (
            <InfoHeaderEditorialHeader {...infoHeaderProps} />
          );
        return (
          <PortfolioSectionShell
            id="info"
            background={infoPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(infoPresentation)}
            topSpacingClass={
              isAboutBannerInfo
                ? 'pt-[calc(var(--portfolio-nav-top-clearance,5.5rem)+0.5rem)]'
                : isAboutSplitInfo
                  ? 'pt-[calc(var(--portfolio-nav-top-clearance,5.5rem)+1.25rem)]'
                  : sectionTopSpacingClass
            }
            topSpacingStyle={isAboutHeroInfo ? undefined : sectionTopSpacingStyle}
            bottomSpacingClass={isAboutHeroInfo ? 'pb-0' : sectionBottomSpacingClass}
            bottomSpacingStyle={isAboutHeroInfo ? undefined : sectionBottomSpacingStyle}
            header={infoHeaderBlock}
          >
            <EditorialAboutMeSection
              title={infoSectionTitle}
              subtitle={infoSectionSubtitle}
              bio={profile.bio}
              specialty={resolveHeroSpecialtyValue(profile.specialite)}
              avatarUrl={profile.avatarUrl}
              fullName={profile.fullName}
              education={profile.aboutEducation}
              skills={profile.aboutSkills}
              strengths={profile.aboutStrengths}
              interests={profile.aboutInterests}
              languages={profile.spokenLanguages}
              languagesFallback={profile.languages}
              systemsTools={profile.aboutSystemsTools}
              presentation={infoPresentation}
              heroPalette={infoPalette}
              terminalDarkColors={infoAboutTerminalDarkColors}
            />
          </PortfolioSectionShell>
        );
      }
      case 'work': {
        const layout = workPresentation.sectionLayout ?? 'stacked';
        const aside = faqSectionLayoutIsAside(layout);
        const projectsBoard = isProjectsBoardDesign(workPresentation);
        const projectsAccordion = isProjectsAccordionDesign(workPresentation);
        const projectsFrames = isProjectsFramesDesign(workPresentation);
        const projectsIndex = isProjectsIndexDesign(workPresentation);
        const projectsGrid = isProjectsGridDesign(workPresentation);
        const projectsSplit = isProjectsSplitDesign(workPresentation);
        const projectsCarousel = isProjectsCarouselDesign(workPresentation);
        const projectsShowcase = isProjectsShowcaseDesign(workPresentation);
        const projectsLedger = isProjectsLedgerDesign(workPresentation);
        const projectsSpec = isProjectsSpecDesign(workPresentation);
        const projectsCase = isProjectsCaseDesign(workPresentation);
        const projectsPress = isProjectsPressDesign(workPresentation);
        const projectsDuotone = isProjectsDuotoneDesign(workPresentation);
        const projectsCascade = isProjectsCascadeDesign(workPresentation);
        const namedWorkDesign =
          projectsBoard ||
          projectsAccordion ||
          projectsFrames ||
          projectsIndex ||
          projectsGrid ||
          projectsSplit ||
          projectsCarousel ||
          projectsShowcase ||
          projectsLedger ||
          projectsSpec ||
          projectsCase ||
          projectsPress ||
          projectsDuotone ||
          projectsCascade;
        const marketplaceTrailing = settings.work.showMarketplaceLink ? (
          <MarketplaceProfileLink creatorId={creatorId} color={workPresentation.titleColor} />
        ) : null;
        // One shared, GSAP-animated header design (Header → Design) mounts above every
        // project layout — no per-layout header is baked in here anymore.
        const workHeaderProps = {
          sectionTitle: workSectionTitle,
          sectionSubtitle: workSectionSubtitle || undefined,
          presentation: workPresentation,
          trailing: marketplaceTrailing,
        };
        const workHeaderCountProps = { ...workHeaderProps, projectCount: workItems.length };
        const headerBlock = (
          <div className={aside ? 'w-full' : undefined}>
            {workPresentation.headerDesign === 'marquee' ? (
              <WorkMarqueeHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'index' ? (
              <WorkIndexHeader {...workHeaderCountProps} />
            ) : workPresentation.headerDesign === 'accent-count' ? (
              <WorkAccentCountHeader {...workHeaderCountProps} />
            ) : workPresentation.headerDesign === 'serif-lead' ? (
              <WorkSerifLeadHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'billboard' ? (
              <WorkBillboardHeader {...workHeaderCountProps} />
            ) : workPresentation.headerDesign === 'masthead' ? (
              <WorkMastheadHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'split-heading' ? (
              <WorkSplitHeadingHeader {...workHeaderProps} />
            ) : (
              <WorkEditorialHeader {...workHeaderProps} />
            )}
          </div>
        );
        const contentBlock = (
          <SectionIllustratedContent
            variant={namedWorkDesign ? 'none' : workPresentation.illustrationVariant}
            placement={workPresentation.illustrationPlacement}
            accent={workPresentation.ctaColor}
            ink={workPresentation.titleColor}
            surface={workPresentation.cardBackgroundColor}
          >
            {projectsBoard ? (
              <ProjectsBoardGallery
                items={workItems}
                presentation={workPresentation}
              />
            ) : projectsAccordion ? (
              <ProjectsAccordionGallery items={workItems} presentation={workPresentation} />
            ) : projectsFrames ? (
              <ProjectsFramesGallery items={workItems} presentation={workPresentation} />
            ) : projectsIndex ? (
              <ProjectsIndexGallery items={workItems} presentation={workPresentation} />
            ) : projectsGrid ? (
              <ProjectsGridSection items={workItems} presentation={workPresentation} />
            ) : projectsCarousel ? (
              <ProjectsCarouselSection
                title={workSectionTitle}
                items={workItems}
                presentation={workPresentation}
              />
            ) : projectsShowcase ? (
              <ProjectsShowcaseGallery items={workItems} presentation={workPresentation} />
            ) : projectsLedger ? (
              <ProjectsLedgerGallery items={workItems} presentation={workPresentation} />
            ) : projectsSpec ? (
              <ProjectsSpecGallery items={workItems} presentation={workPresentation} />
            ) : projectsCase ? (
              <ProjectsCaseGallery items={workItems} presentation={workPresentation} />
            ) : projectsPress ? (
              <ProjectsPressGallery items={workItems} presentation={workPresentation} />
            ) : projectsDuotone ? (
              <ProjectsDuotoneGallery items={workItems} presentation={workPresentation} />
            ) : projectsCascade ? (
              <ProjectsCascadeGallery items={workItems} presentation={workPresentation} colorMode={workColorMode} />
            ) : projectsSplit ? (
              <ProjectsSplitGallery items={workItems} presentation={workPresentation} />
            ) : (
              <EditorialWorkGallery
                items={workItems}
                presentation={workPresentation}
                motionProfile={motionProfile}
              />
            )}
          </SectionIllustratedContent>
        );
        return (
          <PortfolioSectionShell
            id="work"
            background={workPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(workPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={aside ? undefined : headerBlock}
          >
            {aside ? (
              <SectionAsideContent layout={layout} header={headerBlock}>
                {contentBlock}
              </SectionAsideContent>
            ) : (
              contentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'services': {
        const servicesLayout = settings.services.servicesHeader.sectionLayout ?? 'stacked';
        const servicesAside =
          isDistinctServicesOrganization && faqSectionLayoutIsAside(servicesLayout);
        const servicesHeaderProps = {
          title: isDistinctServicesOrganization
            ? resolveDistinctBlockSectionTitle(settings.services, 'services')
            : servicesSectionTitle,
          subtitle:
            (isDistinctServicesOrganization
              ? resolveDistinctBlockSectionSubtitle(settings.services, 'services')
              : servicesSectionSubtitle) || undefined,
          presentation: servicesPresentation,
          itemCount: services.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        const servicesHeaderBlock =
          servicesPresentation.headerDesign === 'marquee' ? (
            <ServicesHeaderMarqueeHeader {...servicesHeaderProps} />
          ) : servicesPresentation.headerDesign === 'index' ? (
            <ServicesHeaderIndexHeader {...servicesHeaderProps} />
          ) : servicesPresentation.headerDesign === 'accent-count' ? (
            <ServicesHeaderAccentCountHeader {...servicesHeaderProps} />
          ) : servicesPresentation.headerDesign === 'serif-lead' ? (
            <ServicesHeaderSerifLeadHeader {...servicesHeaderProps} />
          ) : servicesPresentation.headerDesign === 'billboard' ? (
            <ServicesHeaderBillboardHeader {...servicesHeaderProps} />
          ) : servicesPresentation.headerDesign === 'masthead' ? (
            <ServicesHeaderMastheadHeader {...servicesHeaderProps} />
          ) : servicesPresentation.headerDesign === 'split-heading' ? (
            <ServicesHeaderSplitHeadingHeader {...servicesHeaderProps} />
          ) : (
            <ServicesHeaderEditorialHeader {...servicesHeaderProps} />
          );
        const servicesShowcaseHero = isServicesShowcaseHeroDesign(servicesPresentation);
        const servicesPricingGrid = isServicesPricingGridDesign(servicesPresentation);
        const servicesPricingBento = isServicesPricingBentoDesign(servicesPresentation);
        const servicesPricingMonolith = isServicesPricingMonolithDesign(servicesPresentation);
        const servicesPricingAurora = isServicesPricingAuroraDesign(servicesPresentation);
        const servicesPricingToggle = isServicesPricingToggleDesign(servicesPresentation);
        const namedServicesDesign =
          servicesShowcaseHero ||
          servicesPricingGrid ||
          servicesPricingBento ||
          servicesPricingMonolith ||
          servicesPricingAurora ||
          servicesPricingToggle;
        const servicesContentBlock = (
          <ServicesOrderCtaHrefProvider
            href={servicesOrderCtaHref}
            onNavigate={onServicesOrderCtaNavigate}
          >
            <SectionIllustratedContent
              variant={namedServicesDesign ? 'none' : servicesPresentation.servicesIllustrationVariant}
              placement={servicesPresentation.servicesIllustrationPlacement}
              accent={servicesPresentation.ctaColor}
              ink={servicesPresentation.titleColor}
              surface={servicesPresentation.cardBackgroundColor}
            >
              <>
                {servicesShowcaseHero ? (
                  <ServicesShowcaseHero services={services} presentation={servicesPresentation} />
                ) : servicesPricingGrid ? (
                  <ServicesPricingGridSection
                    services={toPortfolioServiceItems(services)}
                    presentation={servicesPresentation}
                  />
                ) : servicesPricingBento ? (
                  <ServicesPricingBentoSection
                    services={toPortfolioServiceItems(services)}
                    presentation={servicesPresentation}
                  />
                ) : servicesPricingMonolith ? (
                  <ServicesPricingMonolithSection
                    services={toPortfolioServiceItems(services)}
                    presentation={servicesPresentation}
                  />
                ) : servicesPricingAurora ? (
                  <ServicesPricingAuroraSection
                    services={toPortfolioServiceItems(services)}
                    presentation={servicesPresentation}
                  />
                ) : servicesPricingToggle ? (
                  <ServicesPricingToggleSection
                    services={toPortfolioServiceItems(services)}
                    presentation={servicesPresentation}
                  />
                ) : (
                  <ServicesShowcaseHero services={services} presentation={servicesPresentation} />
                )}
                {services.length === 0 ? (
                  <p className="mt-8 text-base leading-relaxed text-neutral-500">
                    Contact me to discuss a custom engagement.
                  </p>
                ) : null}
              </>
            </SectionIllustratedContent>
          </ServicesOrderCtaHrefProvider>
        );

        return (
          <PortfolioSectionShell
            id="services"
            background={servicesPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(servicesPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={servicesAside ? undefined : servicesHeaderBlock}
          >
            {servicesAside ? (
              <SectionAsideContent layout={servicesLayout} header={servicesHeaderBlock}>
                {servicesContentBlock}
              </SectionAsideContent>
            ) : (
              servicesContentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'about': {
        // About chrome (section title, subtitle, SVG) removed — only Infos panel remains.
        const aboutBody = (() => {
          const showPanel = settings.about.showSidePanel && aboutSideInfoItems.length > 0;
          const isFullWidth = settings.about.layoutMode === 'full-width';
          const hasSidebar = showPanel && !isFullWidth;
          const layoutMode = settings.about.layoutMode;
          const isTwinColumns = layoutMode === 'twin-columns';
          const pairAlignClass = aboutContentPairAlignClass(
            aboutPresentation.contentPairAlign ?? 'start'
          );
          const panelPlacement = settings.about.fullWidthPanelPlacement;
          const statsBlockSpacing = settings.about.showStats && stats.length > 0 ? 'mt-14' : 'mt-10';
          const sidePanelPresentation = aboutPresentation;

          const sidePanelColumn = showPanel ? (
            isTwinColumns ? (
              <div
                className={`flex min-w-0 w-full ${aboutSidePanelTwinAlignClass(
                  settings.about.sidePanelTwinAlign
                )}`}
              >
                <aside className="w-full max-w-full shrink-0 space-y-4 lg:w-fit lg:max-w-[20rem] lg:self-start xl:max-w-[22rem]">
                  <EditorialSideInfoHeading presentation={sidePanelPresentation} />
                  <EditorialSideInfoPanel
                    items={aboutSideInfoItems}
                    presentation={sidePanelPresentation}
                    layoutMode={layoutMode}
                  />
                </aside>
              </div>
            ) : (
              <aside
                className={`space-y-4 ${
                  hasSidebar ? 'lg:sticky lg:top-32 lg:self-start xl:top-28' : ''
                }`.trim()}
              >
                <EditorialSideInfoHeading presentation={sidePanelPresentation} />
                <EditorialSideInfoPanel
                  items={aboutSideInfoItems}
                  presentation={sidePanelPresentation}
                  layoutMode={layoutMode}
                />
              </aside>
            )
          ) : null;

          const renderFullWidthPanel = (position: typeof panelPlacement) =>
            isFullWidth && sidePanelColumn && panelPlacement === position ? (
              <div className={statsBlockSpacing}>{sidePanelColumn}</div>
            ) : null;

          if (isFullWidth) {
            const statsTopSpacing =
              showPanel && panelPlacement === 'above-stats' ? 'mt-14' : undefined;

            return (
              <>
                {renderFullWidthPanel('above-stats')}
                {settings.about.showStats && stats.length > 0 ? (
                  <div className={statsTopSpacing}>
                    <EditorialStatGrid stats={stats} presentation={aboutPresentation} motionProfile={motionProfile} />
                  </div>
                ) : null}
                {renderFullWidthPanel('below-stats')}
                {renderFullWidthPanel('below-content')}
              </>
            );
          }

          return (
            <>
              {settings.about.showStats && stats.length > 0 ? (
                <EditorialStatGrid stats={stats} presentation={aboutPresentation} motionProfile={motionProfile} />
              ) : null}
              <div
                className={`flex w-full ${pairAlignClass}${statsBlockSpacing ? ` ${statsBlockSpacing}` : ''}`}
              >
                {sidePanelColumn}
              </div>
            </>
          );
        })();
        return (
          <PortfolioSectionShell
            id="about"
            background={aboutPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(aboutPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
          >
            {aboutBody}
          </PortfolioSectionShell>
        );
      }
      case 'experience': {
        const showExperienceYears =
          settings.experience.showYears &&
          profile.yearsOfExperience != null &&
          profile.yearsOfExperience > 0;
        const appliedHeaderDesign = experiencePresentation.headerDesign ?? 'none';
        const showAppliedHeaderZone = experienceHeaderDesignIsApplied(
          appliedHeaderDesign,
          experiencePresentation.experienceDesign
        );
        const wrapAppliedExperienceHeader = (node: ReactNode) => (
          <div className="pf-exp-applied-header relative w-full">{node}</div>
        );
        let appliedExperienceHeaderZone: ReactNode = null;
        if (showAppliedHeaderZone) {
          switch (appliedHeaderDesign) {
            case 'editorial':
              appliedExperienceHeaderZone =
                showExperienceYears || accentYearsHasCustomCopy(experiencePresentation)
                  ? wrapAppliedExperienceHeader(
                      <ExperienceEditorialHeader
                        years={profile.yearsOfExperience ?? 0}
                        presentation={experiencePresentation}
                      />
                    )
                  : null;
              break;
            case 'milestone':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceMilestoneHeader
                  sectionTitle={experienceSectionTitle}
                  sectionSubtitle={experienceSectionSubtitle}
                  years={profile.yearsOfExperience}
                  presentation={experiencePresentation}
                />
              );
              break;
            case 'table':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceTableHeader
                  sectionTitle={experienceSectionTitle}
                  sectionSubtitle={experienceSectionSubtitle}
                  years={profile.yearsOfExperience}
                  presentation={experiencePresentation}
                />
              );
              break;
            case 'cards':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceCardsHeader
                  sectionTitle={experienceSectionTitle}
                  sectionSubtitle={experienceSectionSubtitle}
                  years={profile.yearsOfExperience}
                  presentation={experiencePresentation}
                />
              );
              break;
            case 'reel':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceReelHeader
                  sectionTitle={experienceSectionTitle}
                  sectionSubtitle={experienceSectionSubtitle}
                  presentation={experiencePresentation}
                />
              );
              break;
            case 'duotone':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceDuotoneHeader
                  sectionTitle={experienceSectionTitle}
                  sectionSubtitle={experienceSectionSubtitle}
                  presentation={experiencePresentation}
                />
              );
              break;
            case 'gallery':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceGalleryHeader
                  roleCount={experienceBlocks.length}
                  presentation={experiencePresentation}
                />
              );
              break;
            case 'spotlight':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceSpotlightHeader presentation={experiencePresentation} />
              );
              break;
            case 'loft':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceLoftHeader presentation={experiencePresentation} />
              );
              break;
            case 'press':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperiencePressHeader presentation={experiencePresentation} />
              );
              break;
            case 'legacy':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(
                <ExperienceLegacyHeader presentation={experiencePresentation} />
              );
              break;
            default:
              appliedExperienceHeaderZone = null;
          }
        }

        const wrapExperienceLinks = (node: ReactNode) => (
          <PortfolioLinkArrowProvider value={experiencePresentation.linkArrowStyle ?? 'northeast'}>
            {node}
          </PortfolioLinkArrowProvider>
        );

        if (experiencePresentation.experienceDesign === 'reel') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass=""
              bottomSpacingClass=""
            >
              {appliedExperienceHeaderZone}
              <ReelExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'duotone') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass={sectionTopSpacingClass}
              topSpacingStyle={sectionTopSpacingStyle}
              bottomSpacingClass=""
            >
              {appliedExperienceHeaderZone}
              <DuotoneExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'gallery') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass={sectionTopSpacingClass}
              topSpacingStyle={sectionTopSpacingStyle}
              bottomSpacingClass={sectionBottomSpacingClass}
              bottomSpacingStyle={sectionBottomSpacingStyle}
            >
              {appliedExperienceHeaderZone}
              <GalleryExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'loft') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass={sectionTopSpacingClass}
              topSpacingStyle={sectionTopSpacingStyle}
              bottomSpacingClass={sectionBottomSpacingClass}
              bottomSpacingStyle={sectionBottomSpacingStyle}
            >
              {appliedExperienceHeaderZone}
              <LoftExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'press') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass={sectionTopSpacingClass}
              topSpacingStyle={sectionTopSpacingStyle}
              bottomSpacingClass={sectionBottomSpacingClass}
              bottomSpacingStyle={sectionBottomSpacingStyle}
            >
              {appliedExperienceHeaderZone}
              <PressExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'legacy') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass={sectionTopSpacingClass}
              topSpacingStyle={sectionTopSpacingStyle}
              bottomSpacingClass={sectionBottomSpacingClass}
              bottomSpacingStyle={sectionBottomSpacingStyle}
            >
              {appliedExperienceHeaderZone}
              <LegacyExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'kinetic') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass={sectionTopSpacingClass}
              topSpacingStyle={sectionTopSpacingStyle}
              bottomSpacingClass={sectionBottomSpacingClass}
              bottomSpacingStyle={sectionBottomSpacingStyle}
            >
              {appliedExperienceHeaderZone}
              <KineticExperienceList
                blocks={experienceBlocks}
                presentation={experiencePresentation}
              />
            </PortfolioSectionShell>
          );
        }
        const layout = experiencePresentation.sectionLayout ?? 'stacked';
        const usesFlatExperienceHeader = experienceDesignUsesFlatHeader(
          experiencePresentation.experienceDesign
        );
        const usesTableExperienceHeader = experienceDesignUsesTableHeader(
          experiencePresentation.experienceDesign
        );
        const usesCardsExperienceHeader = experienceDesignUsesCardsHeader(
          experiencePresentation.experienceDesign
        );
        const usesCustomExperienceHeader = usesTableExperienceHeader || usesCardsExperienceHeader;
        const aside =
          !usesFlatExperienceHeader &&
          !usesCustomExperienceHeader &&
          faqSectionLayoutIsAside(layout);
        // Section lead comes only from Experience → Header (applied zone). Design-owned
        // default headers are stripped — table/cards/years/sticky title no longer mount here.
        const headerBlock = appliedExperienceHeaderZone;
        const contentBlock = (
          <SectionIllustratedContent
            variant={experiencePresentation.illustrationVariant}
            placement={experiencePresentation.illustrationPlacement}
            accent={experiencePresentation.accentColor}
            ink={experiencePresentation.titleColor}
            surface={experiencePresentation.entryFrame.cardBackgroundColor}
          >
            {experiencePresentation.experienceDesign === 'milestone' ? (
              <MilestoneExperienceList
                blocks={experienceBlocks}
                presentation={experiencePresentation}
                motionProfile={motionProfile}
              />
            ) : experiencePresentation.experienceDesign === 'table' ? (
              <TableExperienceList
                blocks={experienceBlocks}
                presentation={experiencePresentation}
                motionProfile={motionProfile}
              />
            ) : experiencePresentation.experienceDesign === 'cards' ? (
              <CardsExperienceList
                blocks={experienceBlocks}
                presentation={experiencePresentation}
                motionProfile={motionProfile}
              />
            ) : (
              <EditorialExperienceList
                blocks={experienceBlocks}
                presentation={experiencePresentation}
                motionProfile={motionProfile}
              />
            )}
          </SectionIllustratedContent>
        );
        return wrapExperienceLinks(
          <PortfolioSectionShell
            id="experience"
            background={experiencePresentation}
            fitContent
            suppressBackground={suppressSectionBackground(experiencePresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={aside || !headerBlock ? undefined : headerBlock}
          >
            {aside && headerBlock ? (
              <SectionAsideContent layout={layout} header={headerBlock}>
                {contentBlock}
              </SectionAsideContent>
            ) : (
              contentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'aboutUs': {
        if (!aboutUs) return null;
        const layout = aboutUsPresentation.sectionLayout ?? 'stacked';
        const embedHeader = aboutUsDesignEmbedsHeader(aboutUsPresentation.design);
        const aside = !embedHeader && aboutUsSectionLayoutIsAside(layout);
        const headerBlock = (
          <EditorialSectionStickyHeader
            title={aboutUsSectionTitle}
            subtitle={aboutUsSectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={aboutUsHeaderAlign.centered}
            alignRight={aboutUsHeaderAlign.alignRight}
            alwaysCentered={aboutUsHeaderAlign.alwaysCentered}
            className={aside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={aboutUsHeaderTypography.title.className}
            titleTypographyStyle={aboutUsHeaderTypography.title.style}
            titleDecorationStyle={aboutUsHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={aboutUsHeaderTypography.title.customSizing}
            subtitleTypographyClass={aboutUsHeaderTypography.subtitle.className}
            subtitleTypographyStyle={aboutUsHeaderTypography.subtitle.style}
            subtitleDecorationStyle={aboutUsHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={aboutUsHeaderTypography.subtitle.customSizing}
            scrollBehavior={effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'aboutUs')}
          />
        );
        const contentBlock = (
          <EditorialAboutUsSection
            aboutUs={aboutUs}
            presentation={aboutUsPresentation}
            sectionTitle={aboutUsSectionTitle}
            sectionSubtitle={aboutUsSectionSubtitle}
            founderRating={typeof profile.averageRating === 'number' ? profile.averageRating : 4.5}
          />
        );
        return (
          <PortfolioSectionShell
            id="aboutUs"
            background={aboutUsPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(aboutUsPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={embedHeader || aside ? undefined : headerBlock}
          >
            {aside ? (
              <SectionAsideContent layout={layout} header={headerBlock}>
                {contentBlock}
              </SectionAsideContent>
            ) : (
              contentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'team': {
        const layout = teamPresentation.sectionLayout ?? 'stacked';
        const aside = teamSectionLayoutIsAside(layout);
        const teamHeaderProps = {
          title: teamSectionTitle,
          subtitle: teamSectionSubtitle || undefined,
          presentation: teamPresentation,
          itemCount: teamMembers.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        const headerBlock =
          teamPresentation.headerDesign === 'marquee' ? (
            <TeamHeaderMarqueeHeader {...teamHeaderProps} />
          ) : teamPresentation.headerDesign === 'index' ? (
            <TeamHeaderIndexHeader {...teamHeaderProps} />
          ) : teamPresentation.headerDesign === 'accent-count' ? (
            <TeamHeaderAccentCountHeader {...teamHeaderProps} />
          ) : teamPresentation.headerDesign === 'serif-lead' ? (
            <TeamHeaderSerifLeadHeader {...teamHeaderProps} />
          ) : teamPresentation.headerDesign === 'billboard' ? (
            <TeamHeaderBillboardHeader {...teamHeaderProps} />
          ) : teamPresentation.headerDesign === 'masthead' ? (
            <TeamHeaderMastheadHeader {...teamHeaderProps} />
          ) : teamPresentation.headerDesign === 'split-heading' ? (
            <TeamHeaderSplitHeadingHeader {...teamHeaderProps} />
          ) : (
            <TeamHeaderEditorialHeader {...teamHeaderProps} />
          );
        const contentBlock = (
          <SectionIllustratedContent
            variant={teamPresentation.illustrationVariant}
            placement={teamPresentation.illustrationPlacement}
            accent={teamPresentation.nameColor}
            ink={teamPresentation.titleColor}
            surface={teamPresentation.cardBackgroundColor}
          >
            <EditorialTeamGallery members={teamMembers} presentation={teamPresentation} />
          </SectionIllustratedContent>
        );
        return (
          <PortfolioSectionShell
            id="team"
            background={teamPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(teamPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={aside ? undefined : headerBlock}
          >
            {aside ? (
              <SectionAsideContent layout={layout} header={headerBlock} centerHeader>
                {contentBlock}
              </SectionAsideContent>
            ) : (
              contentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'gallery': {
        const layout = galleryPresentation.sectionLayout ?? 'stacked';
        const aside = gallerySectionLayoutIsAside(layout);
        const galleryHeaderProps = {
          title: gallerySectionTitle,
          subtitle: gallerySectionSubtitle || undefined,
          presentation: galleryPresentation,
          itemCount: galleryItems.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        const headerBlock =
          gallerySectionTitle || gallerySectionSubtitle ? (
            galleryPresentation.headerDesign === 'marquee' ? (
              <GalleryHeaderMarqueeHeader {...galleryHeaderProps} />
            ) : galleryPresentation.headerDesign === 'index' ? (
              <GalleryHeaderIndexHeader {...galleryHeaderProps} />
            ) : galleryPresentation.headerDesign === 'accent-count' ? (
              <GalleryHeaderAccentCountHeader {...galleryHeaderProps} />
            ) : galleryPresentation.headerDesign === 'serif-lead' ? (
              <GalleryHeaderSerifLeadHeader {...galleryHeaderProps} />
            ) : galleryPresentation.headerDesign === 'billboard' ? (
              <GalleryHeaderBillboardHeader {...galleryHeaderProps} />
            ) : galleryPresentation.headerDesign === 'masthead' ? (
              <GalleryHeaderMastheadHeader {...galleryHeaderProps} />
            ) : galleryPresentation.headerDesign === 'split-heading' ? (
              <GalleryHeaderSplitHeadingHeader {...galleryHeaderProps} />
            ) : (
              <GalleryHeaderEditorialHeader {...galleryHeaderProps} />
            )
          ) : null;
        const contentBlock = (
          <SectionIllustratedContent
            variant={galleryPresentation.illustrationVariant}
            placement={galleryPresentation.illustrationPlacement}
            accent={galleryPresentation.itemTitleColor}
            ink={galleryPresentation.titleColor}
            surface={galleryPresentation.sectionBackgroundColor}
          >
            <EditorialGallerySection
              items={galleryItems}
              presentation={galleryPresentation}
            />
          </SectionIllustratedContent>
        );
        return (
          <PortfolioSectionShell
            id="gallery"
            background={galleryPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(galleryPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={aside ? undefined : headerBlock}
          >
            {aside ? (
              <SectionAsideContent layout={layout} header={headerBlock}>
                {contentBlock}
              </SectionAsideContent>
            ) : (
              contentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'faq': {
        const faqAside = faqSectionLayoutIsAside(faqPresentation.sectionLayout ?? 'stacked');
        // Every bespoke FAQ design (see each component's own portfolio-faq-*.tsx file)
        // embeds the shared Header block inside its own layout, same as the aside layout —
        // never the shell's own top header slot.
        const faqKinetic = faqPresentation.design === 'kinetic-split';
        const faqFloatingGallery = faqPresentation.design === 'floating-gallery';
        const faqMasonry = faqPresentation.design === 'editorial-masonry';
        const faqPrismCards = faqPresentation.design === 'prism-cards';
        const faqStarScroll = faqPresentation.design === 'star-scroll';
        const faqTriGrid = faqPresentation.design === 'tri-grid';
        const faqSplitIndex = faqPresentation.design === 'split-index';
        const faqCenteredFocus = faqPresentation.design === 'centered-focus';
        const faqBentoDual = faqPresentation.design === 'bento-dual';
        const faqBespokeDesign =
          faqKinetic ||
          faqFloatingGallery ||
          faqMasonry ||
          faqPrismCards ||
          faqStarScroll ||
          faqTriGrid ||
          faqSplitIndex ||
          faqCenteredFocus ||
          faqBentoDual;
        // Header — one shared, GSAP-animated header (chosen from 8 editorial layouts, same
        // mechanism as Portfolio/Work, Stack, Tools, Contact, Team, Gallery, and Info) mounts
        // above the section, independent of the Design tab's own per-design layout.
        const faqHeaderProps = {
          title: faqSectionTitle,
          subtitle: faqSectionSubtitle || undefined,
          presentation: faqPresentation,
          itemCount: faqItems.length,
        };
        const faqHeaderBlock =
          faqPresentation.headerDesign === 'marquee' ? (
            <FaqHeaderMarqueeHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'index' ? (
            <FaqHeaderIndexHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'accent-count' ? (
            <FaqHeaderAccentCountHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'serif-lead' ? (
            <FaqHeaderSerifLeadHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'billboard' ? (
            <FaqHeaderBillboardHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'masthead' ? (
            <FaqHeaderMastheadHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'split-heading' ? (
            <FaqHeaderSplitHeadingHeader {...faqHeaderProps} />
          ) : (
            <FaqHeaderEditorialHeader {...faqHeaderProps} />
          );
        const faqListBlock = (
          <div
            className={
              faqAside
                ? 'w-full min-w-0'
                : `${faqListPlacementClass(faqPresentation.listPlacement)} ${faqListMaxWidthClass(
                    faqPresentation.listMaxWidth
                  )}`
            }
          >
            <EditorialFaqList
              items={faqItems}
              presentation={faqPresentation}
              motionProfile={motionProfile}
              askCtaHref="#contact"
              askCtaLabel="Ask a question"
            />
          </div>
        );

        return (
          <PortfolioSectionShell
            id="faq"
            background={faqPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(faqPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={faqAside || faqBespokeDesign ? undefined : faqHeaderBlock}
          >
            {faqAside ? (
              <SectionAsideContent
                layout={faqPresentation.sectionLayout ?? 'aside-left'}
                header={faqHeaderBlock}
              >
                {faqListBlock}
              </SectionAsideContent>
            ) : faqKinetic ? (
              <FaqKineticSplitDesign items={faqItems} header={faqHeaderBlock} />
            ) : faqFloatingGallery ? (
              <FaqFloatingGalleryDesign items={faqItems} header={faqHeaderBlock} />
            ) : faqMasonry ? (
              <FaqEditorialMasonryDesign items={faqItems} header={faqHeaderBlock} />
            ) : faqPrismCards ? (
              <FaqPrismCardsDesign items={faqItems} header={faqHeaderBlock} activeColorMode={faqActiveColorMode} />
            ) : faqStarScroll ? (
              <FaqStarScrollDesign items={faqItems} header={faqHeaderBlock} activeColorMode={faqActiveColorMode} />
            ) : faqTriGrid ? (
              <FaqTriGridDesign items={faqItems} header={faqHeaderBlock} activeColorMode={faqActiveColorMode} />
            ) : faqSplitIndex ? (
              <FaqSplitIndexDesign items={faqItems} header={faqHeaderBlock} activeColorMode={faqActiveColorMode} />
            ) : faqCenteredFocus ? (
              <FaqCenteredFocusDesign items={faqItems} header={faqHeaderBlock} activeColorMode={faqActiveColorMode} />
            ) : faqBentoDual ? (
              <FaqBentoDualDesign
                items={faqItems}
                header={faqHeaderBlock}
                activeColorMode={faqActiveColorMode}
                cardColor={faqPalette[faqPresentation.bentoDualCardColorToken]}
                cardRadius={faqPresentation.bentoDualCardRadius}
                cardBorder={faqPresentation.bentoDualCardBorder}
                cardOpacity={faqPresentation.bentoDualCardOpacity}
              />
            ) : (
              faqListBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'contact':
        return (
          <EditorialContactSection
            creatorId={creatorId}
            email={resolvedContactEmail || null}
            phone={profile.phone}
            locationLabel={locationLabel}
            links={uniqueContactLinks}
            ctaHref={contactCtaHref}
            responseTimeLabel={profile.responseTimeLabel}
            heroImageUrl={profile.avatarUrl}
            heroImageAlt={profile.fullName}
            contentGutter={settings.global.contentGutter}
            globalColorMode={settings.global.colorMode ?? 'dark'}
            sectionTitle={contactSectionTitle}
            sectionSubtitle={contactSectionSubtitle || undefined}
            presentation={contactPresentation}
            motionProfile={motionProfile}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            titleTypographyClass={contactHeaderTypography.title.className}
            titleTypographyStyle={contactHeaderTypography.title.style}
            subtitleTypographyClass={contactHeaderTypography.subtitle.className}
            subtitleTypographyStyle={contactHeaderTypography.subtitle.style}
            suppressBackground={suppressSectionBackground(contactPresentation)}
            renderSocialIcon={(platform, className) => (
              <SocialPlatformIcon platform={platform} className={className} />
            )}
            socialBrandClass={
              portfolioUsesMonochromeChrome(settings.themeId, settings.global.monochromeUi)
                ? portfolioMonochromeSocialBrandClass
                : socialPlatformBrandClass
            }
            membersOnlyNode={
              !isAuthenticated && profile.membersOnlyContactAvailable ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(buildCreatorPortfolioPath(creatorId, profile.username))}`}
                    className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    Sign in
                  </Link>{' '}
                  to see more contact details.
                </p>
              ) : null
            }
          />
        );
      case 'stack': {
        const stackAside = stackSectionLayoutIsAside(stackPresentation.sectionLayout);
        const stackAsideTitleCentered =
          (stackPresentation.asideTitlePlacement ?? 'center') === 'center';
        const stackHeaderProps = {
          title: stackSectionTitle,
          subtitle: stackSectionSubtitle || undefined,
          presentation: stackPresentation,
          itemCount: stackItems.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        const headerBlock = (
          <div className={stackAside ? 'w-full' : undefined}>
            {stackPresentation.headerDesign === 'marquee' ? (
              <StackHeaderMarqueeHeader {...stackHeaderProps} />
            ) : stackPresentation.headerDesign === 'index' ? (
              <StackHeaderIndexHeader {...stackHeaderProps} />
            ) : stackPresentation.headerDesign === 'accent-count' ? (
              <StackHeaderAccentCountHeader {...stackHeaderProps} />
            ) : stackPresentation.headerDesign === 'serif-lead' ? (
              <StackHeaderSerifLeadHeader {...stackHeaderProps} />
            ) : stackPresentation.headerDesign === 'billboard' ? (
              <StackHeaderBillboardHeader {...stackHeaderProps} />
            ) : stackPresentation.headerDesign === 'masthead' ? (
              <StackHeaderMastheadHeader {...stackHeaderProps} />
            ) : stackPresentation.headerDesign === 'split-heading' ? (
              <StackHeaderSplitHeadingHeader {...stackHeaderProps} />
            ) : (
              <StackHeaderEditorialHeader {...stackHeaderProps} />
            )}
          </div>
        );
        const stackGallery = <EditorialStackGallery items={stackItems} presentation={stackPresentation} />;
        return (
          <PortfolioSectionShell
            id="stack"
            background={stackPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(stackPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={stackAside ? undefined : headerBlock}
          >
            {stackAside ? (
              <SectionAsideContent
                layout={stackPresentation.sectionLayout ?? 'aside-left'}
                header={headerBlock}
                centerHeader={stackAsideTitleCentered}
                stickyHeader={stackPresentation.asideTitleSticky !== false}
              >
                {stackGallery}
              </SectionAsideContent>
            ) : (
              stackGallery
            )}
          </PortfolioSectionShell>
        );
      }
      case 'tools': {
        const toolsHeaderProps = {
          title: toolsSectionTitle,
          subtitle: toolsSectionSubtitle || undefined,
          presentation: toolsPresentation,
          itemCount: strengths.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        const headerBlock =
          toolsPresentation.headerDesign === 'marquee' ? (
            <ToolsHeaderMarqueeHeader {...toolsHeaderProps} />
          ) : toolsPresentation.headerDesign === 'index' ? (
            <ToolsHeaderIndexHeader {...toolsHeaderProps} />
          ) : toolsPresentation.headerDesign === 'accent-count' ? (
            <ToolsHeaderAccentCountHeader {...toolsHeaderProps} />
          ) : toolsPresentation.headerDesign === 'serif-lead' ? (
            <ToolsHeaderSerifLeadHeader {...toolsHeaderProps} />
          ) : toolsPresentation.headerDesign === 'billboard' ? (
            <ToolsHeaderBillboardHeader {...toolsHeaderProps} />
          ) : toolsPresentation.headerDesign === 'masthead' ? (
            <ToolsHeaderMastheadHeader {...toolsHeaderProps} />
          ) : toolsPresentation.headerDesign === 'split-heading' ? (
            <ToolsHeaderSplitHeadingHeader {...toolsHeaderProps} />
          ) : (
            <ToolsHeaderEditorialHeader {...toolsHeaderProps} />
          );
        return (
          <PortfolioSectionShell
            id="tools"
            background={toolsPresentation}
            fitContent
            suppressBackground={suppressSectionBackground(toolsPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={headerBlock}
          >
            <EditorialToolsGallery tools={strengths} presentation={toolsPresentation} />
          </PortfolioSectionShell>
        );
      }
      default:
        return null;
    }
  }

  return (
    <PortfolioMotionProvider timing={settings.global.motionTiming}>
    <PortfolioTaskListMarkerProvider
      value={{
        taskListBulletStyle: settings.global.taskListBulletStyle ?? 'disc',
        taskListBulletColor: resolveHeroPaletteColor(heroPalette, 'principal'),
        taskListBulletSize: settings.global.taskListBulletSize ?? 'md',
        taskListBulletSizePx: settings.global.taskListBulletSizePx,
        taskListBulletWeight: settings.global.taskListBulletWeight ?? 'regular',
        taskListBulletWeightAmount: settings.global.taskListBulletWeightAmount,
      }}
    >
    <PortfolioThemeRoot
      themeId={settings.themeId}
      customThemes={settings.customThemes}
      monochromeUi={settings.global.monochromeUi}
      colorMode={(settings.global.colorMode ?? 'dark') as 'dark' | 'light'}
      activePalette={activeGlobalPalette}
      fixedBackgroundStyle={globalFixedBgStyle}
      suppressDefaultBackground={hasGlobalBg}
      fixedMotifsLayer={
        <PortfolioFixedMotifsLayer
          motifs={heroPresentation.heroMotifs ?? []}
          background={heroPresentation}
          visualEdge={
            resolveHeroLayoutDivision(heroPresentation) === 'horizontal-copy-right'
              ? 'left'
              : 'right'
          }
          colorMode={(settings.global.colorMode ?? 'dark') as 'light' | 'dark'}
        />
      }
    >
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={setProfileVisits} />
      {isCaseOverlayNav ? (
        <PortfolioCaseOverlayNav
          items={isPagesMode ? pagesNavItems : navItems}
          settings={settings.navigation}
          activeId={isPagesMode ? activePageId : undefined}
          onNavigate={isPagesMode ? (id) => navigateToPage(id) : undefined}
          brandName={(profile.fullName ?? '').trim().split(/\s+/).filter(Boolean)[0] ?? ''}
          avatarUrl={profile.avatarUrl}
          contentGutter={settings.global.contentGutter}
          showColorModeToggle={settings.global.showColorModeToggleInNav ?? false}
          colorMode={navActiveColorMode}
          onColorModeToggle={cyclePortfolioColorMode}
        />
      ) : isDutenPanelNav ? (
        <PortfolioDutenPanelNav
          items={isPagesMode ? pagesNavItems : navItems}
          settings={settings.navigation}
          activeId={isPagesMode ? activePageId : undefined}
          onNavigate={isPagesMode ? (id) => navigateToPage(id) : undefined}
          avatarUrl={profile.avatarUrl}
          contentGutter={settings.global.contentGutter}
          socialLinkOptions={navProfileLinkOptions}
          contactPhone={profile.phone}
          contactEmail={resolvedContactEmail}
          showColorModeToggle={settings.global.showColorModeToggleInNav ?? false}
          colorMode={navActiveColorMode}
          onColorModeToggle={cyclePortfolioColorMode}
        />
      ) : isHalfPanelNav ? (
        <PortfolioHalfPanelNav
          items={isPagesMode ? pagesNavItems : navItems}
          settings={settings.navigation}
          activeId={isPagesMode ? activePageId : undefined}
          onNavigate={isPagesMode ? (id) => navigateToPage(id) : undefined}
          avatarUrl={profile.avatarUrl}
          contentGutter={settings.global.contentGutter}
          socialLinkOptions={navProfileLinkOptions}
          contactPhone={profile.phone}
          contactEmail={resolvedContactEmail}
          showColorModeToggle={settings.global.showColorModeToggleInNav ?? false}
          colorMode={navActiveColorMode}
          onColorModeToggle={cyclePortfolioColorMode}
        />
      ) : (
        <>
          <PortfolioFloatingNav
            items={isPagesMode ? pagesNavItems : navItems}
            settings={settings.navigation}
            activeId={isPagesMode ? activePageId : undefined}
            onNavigate={isPagesMode ? (id) => navigateToPage(id) : undefined}
            chromeLinks={navChromeLinks}
            monochrome={usesMonochromeChrome}
            contactHref={navContactHref}
            onContactNavigate={isPagesMode ? () => navigateToPage(pagesContactTarget) : undefined}
            contactPhone={profile.phone}
            contactEmail={resolvedContactEmail}
            avatarUrl={profile.avatarUrl}
            brandName={(profile.fullName ?? '').trim().split(/\s+/).filter(Boolean)[0] ?? ''}
            contentGutter={settings.global.contentGutter}
            showColorModeToggle={settings.global.showColorModeToggleInNav ?? false}
            colorMode={navActiveColorMode}
            onColorModeToggle={cyclePortfolioColorMode}
          />
        </>
      )}

      {isPagesMode ? (
        <div className="relative flex h-[100dvh] flex-col overflow-hidden">
          <PortfolioPagesSlideViewport pageId={activePageId} direction={pageSlideDirection}>
            {settings.hero.enabled && activePageId === 'hero' ? (
              <PortfolioHeroSection
                creatorId={creatorId}
                username={profile.username}
                fullName={profile.fullName}
                nameLead={nameLead}
                nameAccent={nameAccent}
                specialite={profile.specialite}
                description={heroDescription}
                avatarUrl={profile.avatarUrl}
                isVerified={profile.isVerified}
                isAvailable={profile.isAvailable}
                responseTimeLabel={profile.responseTimeLabel}
                yearsOfExperience={profile.yearsOfExperience}
                workCount={resolveExactContentCount(profile) ?? undefined}
                locationLabel={locationLabel}
                stats={heroStats}
                socialLinks={socialLinks}
                tools={heroToolsProp}
                toolDetails={heroToolDetailsProp}
                contactHref={heroContactHref}
                workHref={heroWorkHref}
                featuredWorks={heroFeaturedWorks}
                onNavigateSection={onNavigateSection}
                showWorkCta={showWorkSection || showGallerySection}
                showContactCta={settings.hero.showContactCta}
                navItems={navItems}
                presentation={heroPresentation}
                suppressBackground={false}
                geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
                motionProfile={motionProfile}
                contentGutter={settings.global.contentGutter}
                contentWidthClass={globalWidthClass}
                colorMode={(settings.global.colorMode ?? 'dark') as 'light' | 'dark'}
              />
            ) : null}

            {contentSectionOrder.map((sectionKey) => {
              if (!sectionVisibility[sectionKey]) return null;
              if (activePageId !== sectionKey) return null;
              const showFooter = shouldShowFooterOnPage(sectionKey);
              return (
                <div
                  key={sectionKey}
                  className="flex min-h-full w-full flex-col overflow-x-clip"
                  style={{ minHeight: '100%' }}
                >
                  <main
                    className={`flex w-full flex-1 grow flex-col ${editorialShellClass} ${
                      showFooter ? 'pb-0' : 'pb-24 sm:pb-28'
                    }`}
                  >
                    {renderContentSection(sectionKey)}
                  </main>
                  {showFooter ? (
                    <div className="mt-auto w-full shrink-0">
                      <div className={`w-full pf-footer-shell-x ${editorialShellClass}`}>{footerHeaderBlock}</div>
                      <EditorialPortfolioFooter
                        creatorName={profile.fullName}
                        creatorId={creatorId}
                        avatarUrl={profile.avatarUrl}
                        bio={profile.bio}
                        email={resolvedContactEmail || null}
                        phone={profile.phone}
                        locationLabel={locationLabel}
                        hoursLabel={availabilityDisplay}
                        profileVisits={profileVisits}
                        links={uniqueContactLinks}
                        contentClassName={editorialShellClass}
                        presentation={footerPresentation}
                        transparentBase={hasGlobalBg && !footerPaintsOwnBackground}
                        isAvailable={profile.isAvailable}
                        responseTimeLabel={profile.responseTimeLabel}
                        contactHref={
                          resolvedContactEmail
                            ? `mailto:${resolvedContactEmail}`
                            : heroContactHref
                        }
                        motionProfile={motionProfile}
                        bottomClearanceClass={footerNavClearanceClass}
                        visibleSectionLinks={footerVisibleSectionLinks}
                        globalColorMode={footerColorMode}
                        timezoneId={profile.timezoneId}
                        contentGutter={settings.global.contentGutter}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </PortfolioPagesSlideViewport>
        </div>
      ) : (
        <div className="flex min-h-[100dvh] min-h-screen max-w-full flex-col overflow-x-clip">
          {settings.hero.enabled ? (
            <PortfolioHeroSection
              creatorId={creatorId}
              username={profile.username}
              fullName={profile.fullName}
              nameLead={nameLead}
              nameAccent={nameAccent}
              specialite={profile.specialite}
              description={heroDescription}
              avatarUrl={profile.avatarUrl}
              isVerified={profile.isVerified}
              isAvailable={profile.isAvailable}
              responseTimeLabel={profile.responseTimeLabel}
              yearsOfExperience={profile.yearsOfExperience}
              workCount={resolveExactContentCount(profile) ?? undefined}
              locationLabel={locationLabel}
              stats={heroStats}
              socialLinks={socialLinks}
              tools={heroToolsProp}
              toolDetails={heroToolDetailsProp}
              contactHref={heroContactHref}
              workHref={heroWorkHref}
              featuredWorks={heroFeaturedWorks}
              onNavigateSection={onNavigateSection}
              showWorkCta={showWorkSection || showGallerySection}
              showContactCta={settings.hero.showContactCta}
              navItems={navItems}
              presentation={heroPresentation}
              suppressBackground={false}
              geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
              motionProfile={motionProfile}
              contentGutter={settings.global.contentGutter}
              contentWidthClass={globalWidthClass}
              colorMode={(settings.global.colorMode ?? 'dark') as 'light' | 'dark'}
            />
          ) : null}

          <main
            className={`w-full flex-1 grow space-y-0 ${editorialShellClass} ${
              settings.footer.enabled ? 'pb-0' : 'pb-24 sm:pb-28 xl:pb-20'
            }`}
          >
            {contentSectionOrder.map((sectionKey) => (
              <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
            ))}
          </main>

          {settings.footer.enabled ? (
            <div className="mt-auto w-full shrink-0">
              <div className={`w-full pf-footer-shell-x ${editorialShellClass}`}>{footerHeaderBlock}</div>
              <EditorialPortfolioFooter
                creatorName={profile.fullName}
                creatorId={creatorId}
                avatarUrl={profile.avatarUrl}
                bio={profile.bio}
                email={resolvedContactEmail || null}
                phone={profile.phone}
                locationLabel={locationLabel}
                hoursLabel={availabilityDisplay}
                profileVisits={profileVisits}
                links={uniqueContactLinks}
                contentClassName={editorialShellClass}
                presentation={footerPresentation}
                transparentBase={hasGlobalBg && !footerPaintsOwnBackground}
                isAvailable={profile.isAvailable}
                responseTimeLabel={profile.responseTimeLabel}
                contactHref={
                  resolvedContactEmail
                    ? `mailto:${resolvedContactEmail}`
                    : heroContactHref
                }
                motionProfile={motionProfile}
                bottomClearanceClass={footerNavClearanceClass}
                visibleSectionLinks={footerVisibleSectionLinks}
                globalColorMode={footerColorMode}
                timezoneId={profile.timezoneId}
                contentGutter={settings.global.contentGutter}
              />
            </div>
          ) : null}
        </div>
      )}
    </PortfolioThemeRoot>
    </PortfolioTaskListMarkerProvider>
    </PortfolioMotionProvider>
  );
}
