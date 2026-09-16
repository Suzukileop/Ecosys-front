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
  SpotlightExperienceList,
  LoftExperienceList,
  PressExperienceList,
  LegacyExperienceList,
  AsymmetricExperienceList,
  KineticExperienceList,
  EditorialFaqList,
  EditorialGallerySection,
  EditorialPortfolioFooter,
  EditorialSectionStickyHeader,
  EditorialServicesCarousel,
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
  WorkMinimalHeader,
  WorkEditorialHeader,
  WorkMarqueeHeader,
  WorkIndexHeader,
  WorkAccentCountHeader,
  WorkSerifLeadHeader,
  WorkBillboardHeader,
  WorkMastheadHeader,
} from '@/components/portfolio/work-header-designs';
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
  isProjectsSpotlightDesign,
  ProjectsSpotlightGallery,
  ProjectsSpotlightSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-spotlight';
import {
  isProjectsShowcaseDesign,
  ProjectsShowcaseGallery,
  ProjectsShowcaseSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-showcase';
import {
  isProjectsEditorialDesign,
  ProjectsEditorialGallery,
  ProjectsEditorialSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-editorial';
import {
  isProjectsLedgerDesign,
  ProjectsLedgerGallery,
  ProjectsLedgerSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-ledger';
import {
  isProjectsFolioDesign,
  ProjectsFolioGallery,
  ProjectsFolioSectionHeader,
} from '@/components/portfolio/portfolio-work-projects-folio';
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
  galleryHeaderFontClass,
  galleryHeaderFontStyle,
  gallerySectionLayoutEmbedsHeader,
  gallerySectionLayoutIsAside,
  pickGalleryPresentationSettings,
  resolveGallerySectionSubtitle,
  resolveGallerySectionTitle,
} from '@/components/portfolio/portfolio-gallery-settings';
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
  servicesHeaderFontClass,
  servicesHeaderFontStyle,
  servicesSubtitleColorStyle,
  servicesTitleColorStyle,
} from '@/components/portfolio/portfolio-services-settings';
import {
  resolveDistinctBlockSectionSubtitle,
  resolveDistinctBlockSectionTitle,
  resolvePortfolioContentSectionOrder,
  resolveServicesBlockPresentation,
  servicesUsesDistinctSections,
} from '@/components/portfolio/portfolio-services-block-settings';
import {
  pickFaqPresentationSettings,
  resolveFaqSectionSubtitle,
  resolveFaqSectionTitle,
  faqHeaderFontClass,
  FAQ_READY_TITLE_CLASS,
  faqHeaderFontStyle,
  faqListPlacementClass,
  faqListMaxWidthClass,
  faqSubtitleColorStyle,
  faqTitleColorStyle,
  faqSectionLayoutIsAside,
  faqDesignShowsTitleKicker,
  faqDesignIsSplit,
  faqDesignIsCtaSplit,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  pickTeamPresentationSettings,
  resolveTeamSectionSubtitle,
  resolveTeamSectionTitle,
  teamHeaderFontClass,
  teamHeaderFontStyle,
  teamSectionLayoutIsAside,
  teamSubtitleColorStyle,
  teamTitleColorStyle,
} from '@/components/portfolio/portfolio-team-settings';
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
      navSocialLinkOptions,
    };
    window.parent.postMessage(
      { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'ready', meta },
      window.location.origin
    );
  }, [hideOwnerChrome, strengthNames, availableHeroWorks, navSocialLinkOptions]);

  const navChromeLinks = useMemo(() => {
    const structuredBar =
      settings.navigation.navLayoutDesign === 'nav-logo-social' ||
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
  const showContactSectionResolved = hasContactSection && settings.contact.enabled;
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
    () => applyHeroPaletteToWork(pickWorkPresentationSettings(settings.work), workPalette),
    [settings.work, workPalette]
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
      ...applyHeroPaletteToAbout(pickAboutPresentationSettings(settings.about), aboutPalette),
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
      ...painted,
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
    return picked.useHeroPalette === false
      ? picked
      : { ...picked, ...applyGalleryPaletteToSettings(picked, galleryPalette) };
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
      ...applyHeroPaletteToServices(
        pickServicesPresentationSettings(settings.services),
        servicesPalette
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
    () => applyHeroPaletteToFaq(pickFaqPresentationSettings(settings.faq), faqPalette),
    [settings.faq, faqPalette]
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
      ...applyHeroPaletteToTeam(pickTeamPresentationSettings(settings.team), teamPalette),
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
      ...applyHeroPaletteToInfo(pickInfoPresentationSettings(settings.info), infoPalette),
      activeColorMode: resolveSectionActiveMode(
        settings.info.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.info, settings.global.colorMode, infoPalette]
  );
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
      ...applyHeroPaletteToTools(pickToolsPresentationSettings(settings.tools), toolsPalette),
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
      ...applyHeroPaletteToStack(picked, stackPalette),
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
      ...applyHeroPaletteToAboutUs(pickAboutUsPresentationSettings(settings.aboutUs), aboutUsPalette),
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
      ...applyHeroPaletteToContact(pickContactPresentationSettings(settings.contact), contactPalette),
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
      applyHeroPaletteToFooter(pickFooterPresentationSettings(settings.footer), footerPalette),
    [settings.footer, footerPalette]
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
  const servicesHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.headerAlignment),
    [settings.global, settings.services.headerAlignment]
  );
  const distinctServicesHeaderAlign = useMemo(
    () =>
      asideAwareHeaderAlign(
        settings.services.servicesHeader.sectionLayout,
        resolveSectionHeaderAlign(
          settings.global,
          settings.services.servicesHeader.headerAlignment
        )
      ),
    [
      settings.global,
      settings.services.servicesHeader.headerAlignment,
      settings.services.servicesHeader.sectionLayout,
    ]
  );
  const faqHeaderAlign = useMemo(() => {
    const layout = settings.faq.sectionLayout ?? 'stacked';
    if (layout === 'aside-left' || layout === 'aside-right') {
      return { centered: true, alignRight: false, alwaysCentered: true };
    }
    if (settings.faq.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    // Two-column (and FAQ center) stay centered even if Global titles are left-aligned.
    if (settings.faq.headerAlignment !== 'left') {
      return { centered: true, alignRight: false, alwaysCentered: true };
    }
    return resolveSectionHeaderAlign(settings.global, 'left');
  }, [settings.global, settings.faq.headerAlignment, settings.faq.sectionLayout]);
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
  const teamHeaderAlign = useMemo(() => {
    const layout = teamPresentation.sectionLayout;
    if (layout === 'aside-left' || layout === 'aside-right') {
      return { centered: true, alignRight: false, alwaysCentered: true };
    }
    if (teamPresentation.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    return resolveSectionHeaderAlign(
      settings.global,
      teamPresentation.headerAlignment === 'center' ? 'center' : 'left'
    );
  }, [settings.global, teamPresentation.headerAlignment, teamPresentation.sectionLayout]);
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
  const galleryHeaderAlign = useMemo(
    () =>
      asideAwareHeaderAlign(
        gallerySectionLayoutIsAside(galleryPresentation.sectionLayout)
          ? galleryPresentation.sectionLayout
          : undefined,
        resolveSectionHeaderAlign(settings.global, galleryPresentation.headerAlignment)
      ),
    [galleryPresentation.headerAlignment, galleryPresentation.sectionLayout, settings.global]
  );
  const contactHeaderAlign = useMemo(
    () =>
      asideAwareHeaderAlign(
        contactPresentation.sectionLayout,
        resolveSectionHeaderAlign(settings.global, settings.contact.headerAlignment)
      ),
    [contactPresentation.sectionLayout, settings.global, settings.contact.headerAlignment]
  );

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

  const servicesHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(servicesPresentation.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(servicesPresentation.titleFont),
      colorStyle: servicesTitleColorStyle(servicesPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(servicesPresentation.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(servicesPresentation.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(servicesPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, servicesPresentation, globalTypographyContext]);

  const distinctServicesHeaderTypography = useMemo(() => {
    const header = servicesPresentation.servicesHeader;
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(header.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(header.titleFont),
      colorStyle: servicesTitleColorStyle(header.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(header.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(header.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(header.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, servicesPresentation.servicesHeader, globalTypographyContext]);

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

  const teamHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
        fontClass: teamHeaderFontClass(teamPresentation.titleFont, 'title'),
        fontStyle: teamHeaderFontStyle(teamPresentation.titleFont),
        colorStyle: teamTitleColorStyle(teamPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
        fontClass: teamHeaderFontClass(teamPresentation.subtitleFont, 'subtitle'),
        fontStyle: teamHeaderFontStyle(teamPresentation.subtitleFont),
        colorStyle: teamSubtitleColorStyle(teamPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, teamPresentation, globalTypographyContext]);

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

  const galleryHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
        fontClass: galleryHeaderFontClass(galleryPresentation.titleFont, 'title'),
        fontStyle: galleryHeaderFontStyle(galleryPresentation.titleFont),
        colorStyle: { color: galleryPresentation.titleColor },
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
        fontClass: galleryHeaderFontClass(galleryPresentation.subtitleFont, 'subtitle'),
        fontStyle: galleryHeaderFontStyle(galleryPresentation.subtitleFont),
        colorStyle: { color: galleryPresentation.subtitleColor },
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, galleryPresentation, globalTypographyContext]);

  const faqHeaderTypography = useMemo(() => {
    const titleClass = [
      faqHeaderFontClass(faqPresentation.titleFont, 'title'),
      faqPresentation.titleUppercase && faqPresentation.titleFont !== 'display' ? 'uppercase' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const subtitleClass = [
      faqHeaderFontClass(faqPresentation.subtitleFont, 'subtitle'),
      faqPresentation.subtitleUppercase && faqPresentation.subtitleFont !== 'display'
        ? 'uppercase'
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: titleClass,
      fontStyle: faqHeaderFontStyle(faqPresentation.titleFont),
      colorStyle: faqTitleColorStyle(faqPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: subtitleClass,
      fontStyle: faqHeaderFontStyle(faqPresentation.subtitleFont),
      colorStyle: faqSubtitleColorStyle(faqPresentation.subtitleColor),
      },
      globalTypographyContext
    );

    if (
      (faqPresentation.design ?? 'two-column') === 'two-column' ||
      faqPresentation.design === 'panel' ||
      faqPresentation.design === 'split' ||
      faqPresentation.design === 'cta-split'
    ) {
      const readyTitleClass = [
        faqPresentation.titleFont === 'serif' ? 'font-serif' : '',
        faqPresentation.titleFont === 'display' ? 'font-black uppercase tracking-[0.08em]' : FAQ_READY_TITLE_CLASS,
        faqPresentation.titleUppercase && faqPresentation.titleFont !== 'display' ? 'uppercase' : '',
      ]
        .filter(Boolean)
        .join(' ');
      return {
        title: {
          className: readyTitleClass,
          style: {
            ...faqHeaderFontStyle(faqPresentation.titleFont),
            ...faqTitleColorStyle(faqPresentation.titleColor),
            fontWeight: faqPresentation.titleFont === 'display' ? undefined : 600,
          },
          decorationStyle: title.decorationStyle,
          customSizing: true,
        },
        subtitle,
      };
    }

    return { title, subtitle };
  }, [settings.global, faqPresentation, globalTypographyContext]);

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
      case 'info':
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
            />
          </PortfolioSectionShell>
        );
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
        const projectsSpotlight = isProjectsSpotlightDesign(workPresentation);
        const projectsShowcase = isProjectsShowcaseDesign(workPresentation);
        const projectsEditorial = isProjectsEditorialDesign(workPresentation);
        const projectsLedger = isProjectsLedgerDesign(workPresentation);
        const projectsFolio = isProjectsFolioDesign(workPresentation);
        const projectsSpec = isProjectsSpecDesign(workPresentation);
        const projectsCase = isProjectsCaseDesign(workPresentation);
        const namedWorkDesign =
          projectsBoard ||
          projectsAccordion ||
          projectsFrames ||
          projectsIndex ||
          projectsGrid ||
          projectsSplit ||
          projectsCarousel ||
          projectsSpotlight ||
          projectsShowcase ||
          projectsEditorial ||
          projectsLedger ||
          projectsFolio ||
          projectsSpec ||
          projectsCase;
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
            {workPresentation.headerDesign === 'editorial' ? (
              <WorkEditorialHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'marquee' ? (
              <WorkMarqueeHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'index' ? (
              <WorkIndexHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'accent-count' ? (
              <WorkAccentCountHeader {...workHeaderCountProps} />
            ) : workPresentation.headerDesign === 'serif-lead' ? (
              <WorkSerifLeadHeader {...workHeaderProps} />
            ) : workPresentation.headerDesign === 'billboard' ? (
              <WorkBillboardHeader {...workHeaderCountProps} />
            ) : workPresentation.headerDesign === 'masthead' ? (
              <WorkMastheadHeader {...workHeaderProps} />
            ) : (
              <WorkMinimalHeader {...workHeaderProps} />
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
              <ProjectsGridSection
                title={workSectionTitle}
                subtitle={workSectionSubtitle || undefined}
                titleColor={workPresentation.titleColor}
                subtitleColor={workPresentation.subtitleColor}
                trailing={marketplaceTrailing}
                items={workItems}
                presentation={workPresentation}
              />
            ) : projectsCarousel ? (
              <ProjectsCarouselSection
                title={workSectionTitle}
                items={workItems}
                presentation={workPresentation}
              />
            ) : projectsSpotlight ? (
              <ProjectsSpotlightGallery items={workItems} presentation={workPresentation} />
            ) : projectsShowcase ? (
              <ProjectsShowcaseGallery items={workItems} presentation={workPresentation} />
            ) : projectsEditorial ? (
              <ProjectsEditorialGallery items={workItems} presentation={workPresentation} />
            ) : projectsLedger ? (
              <ProjectsLedgerGallery items={workItems} presentation={workPresentation} />
            ) : projectsFolio ? (
              <ProjectsFolioGallery items={workItems} presentation={workPresentation} />
            ) : projectsSpec ? (
              <ProjectsSpecGallery items={workItems} presentation={workPresentation} />
            ) : projectsCase ? (
              <ProjectsCaseGallery items={workItems} presentation={workPresentation} />
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
        const servicesHeaderBlock = (
          <EditorialSectionStickyHeader
            title={
              isDistinctServicesOrganization
                ? resolveDistinctBlockSectionTitle(settings.services, 'services')
                : servicesSectionTitle
            }
            subtitle={
              (isDistinctServicesOrganization
                ? resolveDistinctBlockSectionSubtitle(settings.services, 'services')
                : servicesSectionSubtitle) || undefined
            }
            trailing={
              !isDistinctServicesOrganization &&
              servicesPresentation.showResponseTime &&
              profile.responseTimeLabel?.trim() ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Typically replies {profile.responseTimeLabel.toLowerCase()}
                </p>
              ) : undefined
            }
            editorialLayout={isEditorialLayout}
            centered={
              isDistinctServicesOrganization
                ? distinctServicesHeaderAlign.centered
                : servicesHeaderAlign.centered
            }
            alignRight={
              isDistinctServicesOrganization
                ? distinctServicesHeaderAlign.alignRight
                : servicesHeaderAlign.alignRight
            }
            alwaysCentered={
              isDistinctServicesOrganization
                ? distinctServicesHeaderAlign.alwaysCentered
                : servicesHeaderAlign.alwaysCentered
            }
            className={servicesAside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).title.className
            }
            titleTypographyStyle={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).title.style
            }
            titleDecorationStyle={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).title.decorationStyle
            }
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).title.customSizing
            }
            subtitleTypographyClass={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).subtitle.className
            }
            subtitleTypographyStyle={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).subtitle.style
            }
            subtitleDecorationStyle={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).subtitle.decorationStyle
            }
            customSubtitleSizing={
              (isDistinctServicesOrganization
                ? distinctServicesHeaderTypography
                : servicesHeaderTypography
              ).subtitle.customSizing
            }
            scrollBehavior={effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'services')}
          />
        );
        const servicesContentBlock = (
          <ServicesOrderCtaHrefProvider
            href={servicesOrderCtaHref}
            onNavigate={onServicesOrderCtaNavigate}
          >
            <SectionIllustratedContent
              variant={servicesPresentation.servicesIllustrationVariant}
              placement={servicesPresentation.servicesIllustrationPlacement}
              accent={servicesPresentation.ctaColor}
              ink={servicesPresentation.titleColor}
              surface={servicesPresentation.cardBackgroundColor}
            >
              <>
                <EditorialServicesCarousel
                  services={services}
                  presentation={resolveServicesBlockPresentation(servicesPresentation, 'services')}
                  motionProfile={motionProfile}
                />
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
              topSpacingClass=""
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
        if (experiencePresentation.experienceDesign === 'spotlight') {
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
              <SpotlightExperienceList blocks={experienceBlocks} presentation={experiencePresentation} />
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
        if (experiencePresentation.experienceDesign === 'asymmetric') {
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
              <AsymmetricExperienceList
                blocks={experienceBlocks}
                presentation={experiencePresentation}
              />
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
        const headerBlock = (
          <EditorialSectionStickyHeader
            title={teamSectionTitle}
            subtitle={teamSectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={teamHeaderAlign.centered}
            alignRight={teamHeaderAlign.alignRight}
            alwaysCentered={teamHeaderAlign.alwaysCentered}
            className={aside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={teamHeaderTypography.title.className}
            titleTypographyStyle={teamHeaderTypography.title.style}
            titleDecorationStyle={teamHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={teamHeaderTypography.title.customSizing}
            subtitleTypographyClass={teamHeaderTypography.subtitle.className}
            subtitleTypographyStyle={teamHeaderTypography.subtitle.style}
            subtitleDecorationStyle={teamHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={teamHeaderTypography.subtitle.customSizing}
            scrollBehavior={effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'team')}
          />
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
        const embedHeader = gallerySectionLayoutEmbedsHeader(layout, galleryPresentation);
        const headerBlock =
          gallerySectionTitle || gallerySectionSubtitle ? (
          <EditorialSectionStickyHeader
            title={gallerySectionTitle}
            subtitle={gallerySectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={embedHeader ? true : galleryHeaderAlign.centered}
            alignRight={embedHeader ? false : galleryHeaderAlign.alignRight}
            alwaysCentered={embedHeader ? true : galleryHeaderAlign.alwaysCentered}
            className={embedHeader ? 'mb-0' : aside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={galleryHeaderTypography.title.className}
            titleTypographyStyle={galleryHeaderTypography.title.style}
            titleDecorationStyle={galleryHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={galleryHeaderTypography.title.customSizing}
            subtitleTypographyClass={galleryHeaderTypography.subtitle.className}
            subtitleTypographyStyle={galleryHeaderTypography.subtitle.style}
            subtitleDecorationStyle={galleryHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={galleryHeaderTypography.subtitle.customSizing}
            scrollBehavior={embedHeader ? 'static' : effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'gallery')}
          />
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
              embeddedHeader={embedHeader ? headerBlock : undefined}
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
            header={aside || embedHeader ? undefined : headerBlock}
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
        const faqSplit = faqDesignIsSplit(faqPresentation.design);
        const faqCtaSplit = faqDesignIsCtaSplit(faqPresentation.design);
        const faqAside =
          !faqSplit &&
          !faqCtaSplit &&
          faqSectionLayoutIsAside(faqPresentation.sectionLayout ?? 'stacked');
        const faqPanel = faqPresentation.design === 'panel';
        const faqSplitTitleLeft = (faqPresentation.illustrationPlacement ?? 'left') !== 'right';
        const faqCtaSvgOnLeft = (faqPresentation.illustrationPlacement ?? 'right') === 'left';
        const faqHeaderBlock = (
          <EditorialSectionStickyHeader
            title={faqSectionTitle}
            subtitle={faqPanel ? undefined : faqSectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={faqHeaderAlign.centered}
            alignRight={faqHeaderAlign.alignRight}
            alwaysCentered={faqHeaderAlign.alwaysCentered || faqSplit || faqCtaSplit}
            kicker={
              faqDesignShowsTitleKicker(faqPresentation.design) ? (
                <span
                  className="text-base font-bold uppercase tracking-[0.18em] sm:text-lg"
                  style={{ color: faqPresentation.accentColor }}
                >
                  FAQ
                </span>
              ) : undefined
            }
            className={
              faqAside || faqPanel || faqSplit ? 'mb-0 w-full' : 'mb-10 lg:mb-12'
            }
            titleTypographyClass={faqHeaderTypography.title.className}
            titleTypographyStyle={faqHeaderTypography.title.style}
            titleDecorationStyle={faqHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={faqHeaderTypography.title.customSizing}
            subtitleTypographyClass={faqHeaderTypography.subtitle.className}
            subtitleTypographyStyle={faqHeaderTypography.subtitle.style}
            subtitleDecorationStyle={faqHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={faqHeaderTypography.subtitle.customSizing}
            scrollBehavior={faqPanel || faqSplit ? 'static' : effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'faq')}
          />
        );
        const faqListBlock = (
          <div
            className={
              faqAside || faqSplit || faqCtaSplit
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
              embeddedHeader={faqPanel ? faqHeaderBlock : undefined}
            />
          </div>
        );

        const faqSplitMedia =
          faqPresentation.illustrationVariant && faqPresentation.illustrationVariant !== 'none' ? (
            <div
              className="mt-8 w-full"
              style={
                {
                  ['--faq-accent' as string]: faqPresentation.accentColor,
                  ['--faq-ink' as string]: faqPresentation.titleColor || faqPresentation.questionColor,
                  ['--faq-surface' as string]: faqPresentation.cardBackgroundColor,
                } as CSSProperties
              }
            >
              <FaqSectionIllustration variant={faqPresentation.illustrationVariant} />
            </div>
          ) : null;

        const faqSplitTitleColumn = (
          <div className="flex min-h-[18rem] w-full flex-col items-center justify-center px-2 text-center lg:min-h-[28rem]">
            {faqHeaderBlock}
            {faqSplitMedia}
          </div>
        );

        const faqSplitBlock = (
          <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            <div className={faqSplitTitleLeft ? 'max-lg:order-1' : 'max-lg:order-1 lg:order-2'}>
              {faqSplitTitleColumn}
            </div>
            <div className={faqSplitTitleLeft ? 'max-lg:order-2 min-w-0' : 'max-lg:order-2 min-w-0 lg:order-1'}>
              {faqListBlock}
            </div>
          </div>
        );

        const faqCtaInk = faqPresentation.titleColor || faqPresentation.questionColor || '#0a0a0a';
        const faqCtaSplitMedia =
          faqPresentation.illustrationVariant && faqPresentation.illustrationVariant !== 'none' ? (
            <div
              className="w-full max-w-md"
              style={
                {
                  ['--faq-accent' as string]: faqPresentation.accentColor,
                  ['--faq-ink' as string]: faqCtaInk,
                  ['--faq-surface' as string]: faqPresentation.cardBackgroundColor,
                } as CSSProperties
              }
            >
              <FaqSectionIllustration variant={faqPresentation.illustrationVariant} />
            </div>
          ) : null;

        const faqCtaSplitColumn = (
          <div className="flex h-full min-h-[18rem] w-full flex-col items-center justify-center px-2 text-center lg:min-h-[28rem]">
            {faqCtaSplitMedia}
            <p
              className="mt-8 text-2xl font-semibold tracking-tight sm:text-[1.75rem] lg:text-[2rem]"
              style={{ color: faqCtaInk }}
            >
              Still have questions?
            </p>
            <a
              href={navContactHref}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 bg-transparent px-6 text-sm font-semibold transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[color:var(--faq-cta-ink)] hover:text-[color:var(--faq-cta-on-ink)] hover:shadow-[0_12px_28px_-12px_rgba(15,23,42,0.45)]"
              style={
                {
                  borderColor: faqCtaInk,
                  color: faqCtaInk,
                  ['--faq-cta-ink' as string]: faqCtaInk,
                  ['--faq-cta-on-ink' as string]:
                    faqPresentation.cardBackgroundColor?.trim() || '#ffffff',
                } as CSSProperties
              }
            >
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path strokeLinecap="round" d="M4 7l8 6 8-6" />
              </svg>
              Contact me
            </a>
          </div>
        );

        const faqCtaSplitBlock = (
          <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            <div className={faqCtaSvgOnLeft ? 'max-lg:order-2 min-w-0 lg:order-2' : 'max-lg:order-1 min-w-0'}>
              {faqListBlock}
            </div>
            <div className={faqCtaSvgOnLeft ? 'max-lg:order-1 lg:order-1' : 'max-lg:order-2'}>
              {faqCtaSplitColumn}
            </div>
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
            header={faqAside || faqPanel || faqSplit ? undefined : faqHeaderBlock}
          >
            {faqAside ? (
              <SectionAsideContent
                layout={faqPresentation.sectionLayout ?? 'aside-left'}
                header={faqHeaderBlock}
              >
                {faqListBlock}
              </SectionAsideContent>
            ) : faqSplit ? (
              faqSplitBlock
            ) : faqCtaSplit ? (
              faqCtaSplitBlock
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
            titleDecorationStyle={contactHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={contactHeaderTypography.title.customSizing}
            subtitleTypographyClass={contactHeaderTypography.subtitle.className}
            subtitleTypographyStyle={contactHeaderTypography.subtitle.style}
            subtitleDecorationStyle={contactHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={contactHeaderTypography.subtitle.customSizing}
            centered={contactHeaderAlign.centered}
            alignRight={contactHeaderAlign.alignRight}
            alwaysCentered={contactHeaderAlign.alwaysCentered}
            suppressBackground={suppressSectionBackground(contactPresentation)}
            scrollBehavior={effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'contact')}
            renderSocialIcon={(platform, className) => (
              <SocialPlatformIcon platform={platform} className={className} />
            )}
            socialBrandClass={
              portfolioUsesMonochromeChrome(settings.themeId, settings.global.monochromeUi)
                ? portfolioMonochromeSocialBrandClass
                : socialPlatformBrandClass
            }
            editorialLayout={isEditorialLayout}
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
        // Aside uses the sticky header in the title half — never embed tags kicker.
        const stackUsesEmbeddedHeader =
          !stackAside && stackPresentation.design === 'stack-tags';
        const headerBlock = stackUsesEmbeddedHeader ? null : (
          <EditorialSectionStickyHeader
            title={stackSectionTitle}
            subtitle={stackSectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={stackHeaderAlign.centered}
            alignRight={stackHeaderAlign.alignRight}
            alwaysCentered={stackHeaderAlign.alwaysCentered}
            className={stackAside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={stackHeaderTypography.title.className}
            titleTypographyStyle={stackHeaderTypography.title.style}
            titleDecorationStyle={stackHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={stackHeaderTypography.title.customSizing}
            subtitleTypographyClass={stackHeaderTypography.subtitle.className}
            subtitleTypographyStyle={stackHeaderTypography.subtitle.style}
            subtitleDecorationStyle={stackHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={stackHeaderTypography.subtitle.customSizing}
            scrollBehavior={stackAside ? 'static' : effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'stack')}
          />
        );
        const stackGallery = (
          <EditorialStackGallery
            items={stackItems}
            presentation={stackPresentation}
            embeddedTitle={stackUsesEmbeddedHeader ? stackSectionTitle : undefined}
            embeddedSubtitle={stackUsesEmbeddedHeader ? stackSectionSubtitle : undefined}
          />
        );
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
            {stackAside && headerBlock ? (
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
        const headerBlock = (
          <EditorialSectionStickyHeader
            title={toolsSectionTitle}
            subtitle={toolsSectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={toolsHeaderAlign.centered}
            alignRight={toolsHeaderAlign.alignRight}
            alwaysCentered={toolsHeaderAlign.alwaysCentered}
            titleTypographyClass={toolsHeaderTypography.title.className}
            titleTypographyStyle={toolsHeaderTypography.title.style}
            titleDecorationStyle={toolsHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={toolsHeaderTypography.title.customSizing}
            subtitleTypographyClass={toolsHeaderTypography.subtitle.className}
            subtitleTypographyStyle={toolsHeaderTypography.subtitle.style}
            subtitleDecorationStyle={toolsHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={toolsHeaderTypography.subtitle.customSizing}
            scrollBehavior={effectiveTitleScroll}
            orientation={resolveSectionTitleOrientation(settings.global, 'tools')}
          />
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
                    className={`mx-auto flex w-full flex-1 grow flex-col ${editorialShellClass} ${globalWidthClass} ${
                      showFooter ? 'pb-0' : 'pb-24 sm:pb-28'
                    }`}
                  >
                    {renderContentSection(sectionKey)}
                  </main>
                  {showFooter ? (
                    <div className="mt-auto w-full shrink-0">
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
            className={`mx-auto w-full flex-1 grow space-y-0 ${editorialShellClass} ${globalWidthClass} ${
              settings.footer.enabled ? 'pb-0' : 'pb-24 sm:pb-28 xl:pb-20'
            }`}
          >
            {contentSectionOrder.map((sectionKey) => (
              <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
            ))}
          </main>

          {settings.footer.enabled ? (
            <div className="mt-auto w-full shrink-0">
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
