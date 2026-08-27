'use client';

import {
  Fragment,
  useEffect,
  useMemo,
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
import { PortfolioFixedMotifsLayer } from '@/components/portfolio/PortfolioHeroMotifsLayer';
import { PortfolioSectionShell } from '@/components/portfolio/PortfolioSectionShell';
import {
  PortfolioSplitScreenFrame,
} from '@/components/portfolio/portfolio-split-screen';
import { PortfolioSettingsButton, PortfolioSettingsModal } from '@/components/portfolio/PortfolioSettingsModal';
import { PortfolioThemeRoot } from '@/components/portfolio/PortfolioThemeRoot';
import { FaqSectionIllustration } from '@/components/portfolio/FaqSectionIllustration';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import { resolveHeroLayoutDivision } from '@/components/portfolio/portfolio-hero-layout-division';
import {
  EditorialContactSection,
  EditorialExperienceList,
  EditorialExperienceYears,
  EditorialFaqList,
  EditorialGallerySection,
  EditorialPortfolioFooter,
  EditorialSectionStickyHeader,
  EditorialServicesSkillsSection,
  EditorialServicesCarousel,
  EditorialTeamGallery,
  EditorialSkillShowcase,
  EditorialSideInfoHeading,
  EditorialSideInfoPanel,
  EditorialStatGrid,
  EditorialWhyMeHeading,
  EditorialWhyMeList,
  EditorialWorkGallery,
  MarketplaceProfileLink,
  portfolioEditorialShellClass,
  PortfolioFloatingNav,
  PortfolioPerPageNav,
  SIDE_INFO_ICONS,
  ServicesOrderCtaHrefProvider,
} from '@/components/portfolio/portfolio-section-primitives';
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
  whyMeContentAlignClass,
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
  experienceHeaderFontClass,
  experienceHeaderFontStyle,
  experienceSubtitleColorStyle,
  experienceTitleColorStyle,
} from '@/components/portfolio/portfolio-experience-settings';
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
  applyHeroPaletteToServices,
  applyHeroPaletteToTeam,
  applyHeroPaletteToWork,
  resolveHeroPaletteFromSettings,
} from '@/components/portfolio/portfolio-section-palette';
import { resolveActivePortfolioPalette } from '@/components/portfolio/portfolio-color-mode';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { syncExperiencePeriodRulePair } from '@/components/portfolio/portfolio-experience-palette-settings';
import {
  resolveNavItemLabel,
  type PortfolioNavSectionKey,
  type PortfolioNavIconVariant,
} from '@/components/portfolio/portfolio-nav-items';
import {
  globalBackgroundPatternStyle,
  globalBackgroundStyle,
  globalContentWidthClass,
  globalFixedBackgroundImageStyle,
  globalSectionTitleTopClass,
  globalSectionTitleTopExtraStyle,
  globalSplitContentTopClass,
  globalSplitContentTopExtraStyle,
  hasGlobalPageBackground,
  hasGlobalSolidBackground,
  resolveGlobalSectionSubtitleTypography,
  resolveGlobalSectionTitleChrome,
  resolveGlobalSectionTitleTypography,
  resolveGlobalSplitTitleFrame,
  resolveSectionHeaderAlign,
  resolveSectionTitleOrientation,
} from '@/components/portfolio/portfolio-global-settings';
import {
  hasOpaqueSectionBackground,
  sectionBackgroundBlockColor,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import {
  buildPortfolioNavChromeLinks,
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
  const legacy: Array<{ id: string; label: string; url: string; type: string; platform?: string | null }> = [];
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
}: {
  layout: SectionTitleLayout;
  header: ReactNode;
  children: ReactNode;
  centerHeader?: boolean;
}) {
  const align = centerHeader ? 'lg:items-stretch' : 'lg:items-start';
  const grid =
    layout === 'aside-right'
      ? `grid w-full gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)] ${align} lg:gap-x-12 xl:gap-x-16`
      : `grid w-full gap-10 lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)] ${align} lg:gap-x-12 xl:gap-x-16`;
  const headerCell = centerHeader
    ? 'flex min-w-0 flex-col items-center justify-center self-stretch text-center'
    : 'min-w-0';
  return (
    <div className={grid}>
      {layout === 'aside-right' ? (
        <>
          <div className="min-w-0">{children}</div>
          <div className={headerCell}>{header}</div>
        </>
      ) : (
        <>
          <div className={headerCell}>{header}</div>
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
}: PublicCreatorPortfolioPageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const isPortfolioOwner = !authLoading && user?.id === creatorId;
  const resolvedContactEmail = primaryContactEmail(profile);
  const [profileVisits, setProfileVisits] = useState<number>(profile.profileVisits ?? 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    settings,
    updateSection,
    resetSettings,
    resetBuiltinTheme,
    setThemeId,
    updateNavigation,
    updateGlobal,
    flushPendingSave,
    persistStatus,
    saveCustomTheme,
    renameCustomTheme,
    duplicateTheme,
    deleteCustomTheme,
    setColorMode,
    patchGlobalPalette,
    setGlobalPalettePair,
    undoSettings,
    redoSettings,
    canUndo,
    canRedo,
  } =
    usePortfolioSettings(creatorId, {
      initialSettings: profile.portfolioSettings,
      canEdit: isPortfolioOwner,
    });

  useEffect(() => {
    if (!isPortfolioOwner) return;
    if (!(settings.global.settingsShortcutEnabled ?? true)) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isComma = event.key === ',' || event.code === 'Comma';
      if (!isComma || !(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      setSettingsOpen((open) => {
        if (open) {
          flushPendingSave();
          return false;
        }
        return true;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isPortfolioOwner,
    settings.global.settingsShortcutEnabled,
    flushPendingSave,
  ]);

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
          return {
            id: item.id,
            title: item.title?.trim() || 'Untitled project',
            imageUrl: raw,
            href: `/marketplace/content/${item.id}`,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [workItems]
  );
  const heroFeaturedWorks = useMemo(() => {
    const banner = settings.hero.heroBannerDesign ?? 'classic';
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
  const whyMeBlocks = profile.whyMeBlocks ?? [];
  const experienceBlocks = profile.experienceBlocks ?? [];
  const strengths = useMemo(
    () => profile.strengthsToolsMastered ?? [],
    [profile.strengthsToolsMastered]
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

  const hasServicesSection = services.length > 0 || strengths.length > 0;
  const hasAboutSection = Boolean(
    whyMeBlocks.length > 0 ||
      rawAboutStats.length > 0 ||
      languageCount > 0 ||
      profile.gender?.trim() ||
      memberSinceLabel ||
      profile.responseTimeLabel?.trim() ||
      locationLabel
  );
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

  const navChromeLinks = useMemo(
    () =>
      buildPortfolioNavChromeLinks({
        sources: settings.navigation.linkIconSources ?? DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES,
        email: resolvedContactEmail || null,
        socialLinks,
      }),
    [settings.navigation.linkIconSources, resolvedContactEmail, socialLinks]
  );

  const usesMonochromeChrome = portfolioUsesMonochromeChrome(
    settings.themeId,
    settings.global.monochromeUi
  );

  const showWorkSection = workItems.length > 0 && settings.work.enabled;
  const showServicesSection = hasServicesSection && settings.services.enabled;
  const showAboutSection = hasAboutSection && settings.about.enabled;
  const showExperienceSection = hasExperienceSection && settings.experience.enabled;
  const showFaqSection = hasFaqSection && settings.faq.enabled;
  const showTeamSection = hasTeamSection && settings.team.enabled;
  const showGallerySection = hasGallerySection && settings.gallery.enabled;
  const showAboutUsSection = hasAboutUsSection && settings.aboutUs.enabled;
  const showContactSectionResolved = hasContactSection && settings.contact.enabled;
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
  const workPresentation = useMemo(
    () => applyHeroPaletteToWork(pickWorkPresentationSettings(settings.work), heroPalette),
    [settings.work, heroPalette]
  );
  const workSectionTitle = useMemo(
    () => resolveWorkSectionTitle(settings.work),
    [settings.work]
  );
  const workSectionSubtitle = useMemo(
    () => resolveWorkSectionSubtitle(settings.work),
    [settings.work]
  );
  const aboutPresentation = useMemo(
    () => ({
      ...applyHeroPaletteToAbout(pickAboutPresentationSettings(settings.about), heroPalette),
      activeColorMode: (settings.global.colorMode ?? 'dark') as 'light' | 'dark',
    }),
    [settings.about, settings.global.colorMode, heroPalette]
  );
  const stats = useMemo(
    () => filterAboutStats(rawAboutStats, aboutPresentation),
    [rawAboutStats, aboutPresentation]
  );
  const experiencePresentation = useMemo(() => {
    const picked = pickExperiencePresentationSettings(settings.experience);
    const painted = applyHeroPaletteToExperience(picked, heroPalette);
    const mode = (settings.global.colorMode ?? 'dark') as 'light' | 'dark';
    const lightPalette = resolveActivePortfolioPalette({ ...settings.global, colorMode: 'light' });
    const darkPalette = resolveActivePortfolioPalette({ ...settings.global, colorMode: 'dark' });
    const periodRulePair =
      picked.useHeroPalette === false
        ? {
            periodRuleColor: picked.periodRuleColor,
            periodRuleColorDark: picked.periodRuleColorDark,
          }
        : syncExperiencePeriodRulePair(painted, lightPalette, darkPalette) ?? {
            periodRuleColor: picked.periodRuleColor,
            periodRuleColorDark: picked.periodRuleColorDark,
            periodRuleFollowPalette: false as const,
          };
    return {
      ...painted,
      ...periodRulePair,
      activeColorMode: mode,
    };
  }, [settings.experience, settings.global, heroPalette]);
  const experienceSectionTitle = useMemo(
    () => resolveExperienceSectionTitle(settings.experience),
    [settings.experience]
  );
  const experienceSectionSubtitle = useMemo(
    () => resolveExperienceSectionSubtitle(settings.experience),
    [settings.experience]
  );
  const galleryPresentation = useMemo(() => {
    const picked = pickGalleryPresentationSettings(settings.gallery);
    return picked.useHeroPalette === false
      ? picked
      : { ...picked, ...applyGalleryPaletteToSettings(picked, heroPalette) };
  }, [settings.gallery, heroPalette]);
  const gallerySectionTitle = useMemo(
    () => resolveGallerySectionTitle(settings.gallery),
    [settings.gallery]
  );
  const gallerySectionSubtitle = useMemo(
    () => resolveGallerySectionSubtitle(settings.gallery),
    [settings.gallery]
  );
  const servicesPresentation = useMemo(
    () => ({
      ...applyHeroPaletteToServices(pickServicesPresentationSettings(settings.services), heroPalette),
      activeColorMode: (settings.global.colorMode ?? 'dark') as 'light' | 'dark',
    }),
    [settings.services, settings.global.colorMode, heroPalette]
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
      skills:
        showServicesSection &&
        isDistinctServicesOrganization &&
        servicesPresentation.showSkills &&
        strengths.length > 0,
      about: showAboutSection,
      aboutUs: showAboutUsSection,
      experience: showExperienceSection,
      team: showTeamSection,
      gallery: showGallerySection,
      faq: showFaqSection,
      contact: showContactSectionResolved,
    }),
    [
      showWorkSection,
      showServicesSection,
      isDistinctServicesOrganization,
      servicesPresentation.showServices,
      servicesPresentation.showSkills,
      strengths.length,
      showAboutSection,
      showAboutUsSection,
      showExperienceSection,
      showTeamSection,
      showGallerySection,
      showFaqSection,
      showContactSectionResolved,
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
  const faqPresentation = useMemo(
    () => applyHeroPaletteToFaq(pickFaqPresentationSettings(settings.faq), heroPalette),
    [settings.faq, heroPalette]
  );
  const faqSectionTitle = useMemo(() => resolveFaqSectionTitle(settings.faq), [settings.faq]);
  const faqSectionSubtitle = useMemo(() => resolveFaqSectionSubtitle(settings.faq), [settings.faq]);
  const teamPresentation = useMemo(
    () => ({
      ...applyHeroPaletteToTeam(pickTeamPresentationSettings(settings.team), heroPalette),
      activeColorMode: (settings.global.colorMode ?? 'dark') as 'light' | 'dark',
    }),
    [settings.team, settings.global.colorMode, heroPalette]
  );
  const teamSectionTitle = useMemo(() => resolveTeamSectionTitle(settings.team), [settings.team]);
  const teamSectionSubtitle = useMemo(() => resolveTeamSectionSubtitle(settings.team), [settings.team]);
  const aboutUsPresentation = useMemo(
    () => ({
      ...applyHeroPaletteToAboutUs(pickAboutUsPresentationSettings(settings.aboutUs), heroPalette),
      activeColorMode: (settings.global.colorMode ?? 'dark') as 'light' | 'dark',
    }),
    [settings.aboutUs, settings.global.colorMode, heroPalette]
  );
  const aboutUsSectionTitle = useMemo(
    () => resolveAboutUsSectionTitle(settings.aboutUs),
    [settings.aboutUs]
  );
  const aboutUsSectionSubtitle = useMemo(
    () => resolveAboutUsSectionSubtitle(settings.aboutUs),
    [settings.aboutUs]
  );
  const contactPresentation = useMemo(
    () => ({
      ...applyHeroPaletteToContact(pickContactPresentationSettings(settings.contact), heroPalette),
      activeColorMode: (settings.global.colorMode ?? 'dark') as 'light' | 'dark',
    }),
    [settings.contact, settings.global.colorMode, heroPalette]
  );
  const contactSectionTitle = useMemo(
    () => resolveContactSectionTitle(settings.contact),
    [settings.contact]
  );
  const contactSectionSubtitle = useMemo(
    () => resolveContactSectionSubtitle(settings.contact, profile.responseTimeLabel),
    [settings.contact, profile.responseTimeLabel]
  );
  const footerPresentation = useMemo(
    () =>
      applyHeroPaletteToFooter(pickFooterPresentationSettings(settings.footer), heroPalette),
    [settings.footer, heroPalette]
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

  const perPageNavItems = useMemo(() => {
    const pages: { id: string; label: string; icon: PortfolioNavIconVariant }[] = [];
    if (settings.hero.enabled) {
      pages.push({ id: 'hero', label: 'Home', icon: 'home' });
    }
    pages.push(...navItems);
    return pages;
  }, [navItems, settings.hero.enabled]);

  const navMode = settings.navigation.navMode ?? 'default';
  const isPagesMode = navMode === 'pages';
  /** Large-screen split: title/description left (~40%), content right (~60%) — hero stays full-bleed. */
  const isSplitMode = navMode === 'split';
  const sectionContentLayout = isSplitMode ? 'split' : 'stacked';
  const globalTypographyContext = useMemo(
    () => ({ splitRail: isSplitMode }),
    [isSplitMode]
  );
  const [activePageId, setActivePageId] = useState(() => perPageNavItems[0]?.id ?? 'hero');

  useEffect(() => {
    if (!isPagesMode || perPageNavItems.length === 0) return;
    if (!perPageNavItems.some((item) => item.id === activePageId)) {
      setActivePageId(perPageNavItems[0].id);
    }
  }, [isPagesMode, perPageNavItems, activePageId]);

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
        const normalized = sectionId === 'footer' ? pagesContactTarget : sectionId;
        if (perPageNavItems.some((item) => item.id === normalized)) {
          setActivePageId(normalized);
        } else if (lastContentPageId) {
          setActivePageId(pagesContactTarget);
        }
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
   * Global solid page color: sections without their own fill stay transparent so the
   * global color shows through. An enabled section background always paints on top
   * (section wins — e.g. footer fill overrides global on the footer only).
   * Image wallpaper never suppresses section fills.
   */
  const hasGlobalSolid = useMemo(
    () => hasGlobalSolidBackground(settings.global),
    [settings.global]
  );
  const suppressSectionBackground = (
    section?: Pick<PortfolioSectionBackgroundSettings, 'sectionBackgroundEnabled'> | null
  ) => hasGlobalSolid && !section?.sectionBackgroundEnabled;

  const sectionBackgroundByKey = useMemo((): Partial<
    Record<PortfolioNavSectionKey, PortfolioSectionBackgroundSettings>
  > => {
    return {
      work: workPresentation,
      skills: servicesPresentation,
      services: servicesPresentation,
      about: aboutPresentation,
      aboutUs: aboutUsPresentation,
      experience: experiencePresentation,
      team: teamPresentation,
      faq: faqPresentation,
      contact: contactPresentation,
    };
  }, [
    workPresentation,
    servicesPresentation,
    aboutPresentation,
    aboutUsPresentation,
    experiencePresentation,
    teamPresentation,
    faqPresentation,
    contactPresentation,
  ]);

  const resolvePageSectionBlocksGlobal = (sectionKey: PortfolioNavSectionKey) => {
    return hasOpaqueSectionBackground(sectionBackgroundByKey[sectionKey]);
  };
  const footerPaintsOwnBackground = Boolean(footerPresentation.sectionBackgroundEnabled);
  const globalBgStyle = useMemo(() => globalBackgroundStyle(settings.global), [settings.global]);
  const globalFixedBgStyle = useMemo(
    () => globalFixedBackgroundImageStyle(settings.global),
    [settings.global]
  );
  const globalPatternStyle = useMemo(
    () => globalBackgroundPatternStyle(settings.global),
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
  const effectiveTitleScroll = isSplitMode ? 'static' : titleScrollBehavior;
  const motionProfile = settings.global.motionProfile;
  const titleChrome = useMemo(
    () => resolveGlobalSectionTitleChrome(settings.global),
    [settings.global]
  );
  const splitTitleFrame = useMemo(
    () => resolveGlobalSplitTitleFrame(settings.global),
    [settings.global]
  );
  const sectionTopSpacingClass = useMemo(
    () =>
      isSplitMode
        ? globalSplitContentTopClass(settings.global.splitContentTopSpacing ?? 'compact')
        : globalSectionTitleTopClass(settings.global.sectionTitleTopSpacing),
    [
      isSplitMode,
      settings.global.splitContentTopSpacing,
      settings.global.sectionTitleTopSpacing,
    ]
  );
  const sectionTopSpacingStyle = useMemo(
    () =>
      isSplitMode
        ? globalSplitContentTopExtraStyle(settings.global.splitContentTopExtraPx ?? 0)
        : globalSectionTitleTopExtraStyle(settings.global.sectionTitleTopExtraPx ?? 0),
    [
      isSplitMode,
      settings.global.splitContentTopExtraPx,
      settings.global.sectionTitleTopExtraPx,
    ]
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
  const skillsHeaderAlign = useMemo(() => {
    const layout = settings.services.skillsHeader.sectionLayout ?? 'stacked';
    if (layout === 'aside-left' || layout === 'aside-right') {
      return { centered: true, alignRight: false, alwaysCentered: true };
    }
    return resolveSectionHeaderAlign(
      settings.global,
      settings.services.skillsHeader.headerAlignment
    );
  }, [
    settings.global,
    settings.services.skillsHeader.headerAlignment,
    settings.services.skillsHeader.sectionLayout,
  ]);
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

  const skillsHeaderTypography = useMemo(() => {
    const header = servicesPresentation.skillsHeader;
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
  }, [settings.global, servicesPresentation.skillsHeader, globalTypographyContext]);

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
      case 'work': {
        const layout = workPresentation.sectionLayout ?? 'stacked';
        const aside = !isSplitMode && faqSectionLayoutIsAside(layout);
        const projectsBoard = isProjectsBoardDesign(workPresentation);
        const projectsAccordion = isProjectsAccordionDesign(workPresentation);
        const projectsFrames = isProjectsFramesDesign(workPresentation);
        const projectsIndex = isProjectsIndexDesign(workPresentation);
        const projectsGrid = isProjectsGridDesign(workPresentation);
        const projectsSplit = isProjectsSplitDesign(workPresentation);
        const namedWorkDesign =
          projectsBoard ||
          projectsAccordion ||
          projectsFrames ||
          projectsIndex ||
          projectsGrid ||
          projectsSplit;
        const marketplaceTrailing = settings.work.showMarketplaceLink ? (
          <MarketplaceProfileLink creatorId={creatorId} color={workPresentation.titleColor} />
        ) : null;
        const accordionAlign =
          workPresentation.projectsAccordion?.headerAlign ?? 'center';
        const headerBlock = projectsBoard ? (
          <ProjectsBoardSectionHeader
            title={workSectionTitle}
            subtitle={workSectionSubtitle || undefined}
            accentColor={workPresentation.ctaColor || workPresentation.categoryActiveColor}
            titleColor={workPresentation.titleColor}
            subtitleColor={workPresentation.subtitleColor}
            trailing={marketplaceTrailing}
            className={aside ? 'w-full' : undefined}
          />
        ) : projectsAccordion ? (
          <ProjectsAccordionSectionHeader
            title={workSectionTitle}
            subtitle={workSectionSubtitle || undefined}
            titleColor={workPresentation.titleColor}
            subtitleColor={workPresentation.subtitleColor}
            align={accordionAlign}
            className={aside ? 'w-full' : undefined}
          />
        ) : projectsFrames ? (
          <ProjectsFramesSectionHeader
            title={workSectionTitle}
            subtitle={workSectionSubtitle || undefined}
            titleColor={workPresentation.titleColor}
            subtitleColor={workPresentation.subtitleColor}
            className={aside ? 'w-full' : undefined}
          />
        ) : projectsIndex ? (
          <ProjectsIndexSectionHeader
            title={workSectionTitle}
            subtitle={workSectionSubtitle || undefined}
            titleColor={workPresentation.titleColor}
            subtitleColor={workPresentation.subtitleColor}
            className={aside ? 'w-full' : undefined}
          />
        ) : projectsGrid ? null : projectsSplit ? (
          <ProjectsSplitSectionHeader
            title={workSectionTitle}
            subtitle={workSectionSubtitle || undefined}
            titleColor={workPresentation.titleColor}
            subtitleColor={workPresentation.subtitleColor}
            className={aside ? 'w-full' : undefined}
          />
        ) : (
          <EditorialSectionStickyHeader
            title={workSectionTitle}
            subtitle={workSectionSubtitle || undefined}
            trailing={marketplaceTrailing}
            editorialLayout={isEditorialLayout}
            centered={workHeaderAlign.centered}
            alignRight={workHeaderAlign.alignRight}
            alwaysCentered={workHeaderAlign.alwaysCentered}
            className={aside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={workHeaderTypography.title.className}
            titleTypographyStyle={workHeaderTypography.title.style}
            titleDecorationStyle={workHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={workHeaderTypography.title.customSizing}
            subtitleTypographyClass={workHeaderTypography.subtitle.className}
            subtitleTypographyStyle={workHeaderTypography.subtitle.style}
            subtitleDecorationStyle={workHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={workHeaderTypography.subtitle.customSizing}
            scrollBehavior={effectiveTitleScroll}
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'work')}
          />
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
                forceSingleColumn={isSplitMode}
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
                forceSingleColumn={isSplitMode}
              />
            ) : projectsSplit ? (
              <ProjectsSplitGallery items={workItems} presentation={workPresentation} />
            ) : (
              <EditorialWorkGallery
                items={workItems}
                presentation={workPresentation}
                motionProfile={motionProfile}
                forceSingleColumn={isSplitMode}
              />
            )}
          </SectionIllustratedContent>
        );
        return (
          <PortfolioSectionShell
            id="work"
            background={workPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(workPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
      case 'skills': {
        const skillsLayout = settings.services.skillsHeader.sectionLayout ?? 'stacked';
        const skillsAside = !isSplitMode && faqSectionLayoutIsAside(skillsLayout);
        const skillsHeaderBlock = (
          <EditorialSectionStickyHeader
            title={resolveDistinctBlockSectionTitle(settings.services, 'skills')}
            subtitle={resolveDistinctBlockSectionSubtitle(settings.services, 'skills') || undefined}
            editorialLayout={isEditorialLayout}
            centered={skillsHeaderAlign.centered}
            alignRight={skillsHeaderAlign.alignRight}
            alwaysCentered={skillsHeaderAlign.alwaysCentered}
            className={skillsAside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={skillsHeaderTypography.title.className}
            titleTypographyStyle={skillsHeaderTypography.title.style}
            titleDecorationStyle={skillsHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={skillsHeaderTypography.title.customSizing}
            subtitleTypographyClass={skillsHeaderTypography.subtitle.className}
            subtitleTypographyStyle={skillsHeaderTypography.subtitle.style}
            subtitleDecorationStyle={skillsHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={skillsHeaderTypography.subtitle.customSizing}
            scrollBehavior={effectiveTitleScroll}
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'skills')}
          />
        );
        const skillsContentBlock = (
          <div className="min-w-0">
            <EditorialSkillShowcase
              skills={strengths}
              presentation={resolveServicesBlockPresentation(servicesPresentation, 'skills')}
              motionProfile={motionProfile}
            />
          </div>
        );

        return (
          <PortfolioSectionShell
            id="skills"
            background={servicesPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(servicesPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
            header={skillsAside ? undefined : skillsHeaderBlock}
          >
            {skillsAside ? (
              <SectionAsideContent layout={skillsLayout} header={skillsHeaderBlock}>
                {skillsContentBlock}
              </SectionAsideContent>
            ) : (
              skillsContentBlock
            )}
          </PortfolioSectionShell>
        );
      }
      case 'services': {
        const servicesLayout = settings.services.servicesHeader.sectionLayout ?? 'stacked';
        const servicesAside =
          isDistinctServicesOrganization &&
          !isSplitMode &&
          faqSectionLayoutIsAside(servicesLayout);
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
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'services')}
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
              {isDistinctServicesOrganization ? (
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
              ) : (
                <>
                  <EditorialServicesSkillsSection
                    skills={strengths}
                    services={services}
                    presentation={servicesPresentation}
                    motionProfile={motionProfile}
                  />

                  {services.length === 0 && strengths.length > 0 && servicesPresentation.showSkills ? (
                    <p className="mt-8 text-base leading-relaxed text-neutral-500">
                      Contact me to discuss a custom engagement.
                    </p>
                  ) : null}
                </>
              )}
            </SectionIllustratedContent>
          </ServicesOrderCtaHrefProvider>
        );

        return (
          <PortfolioSectionShell
            id="services"
            background={servicesPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(servicesPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
        // About chrome (section title, subtitle, SVG) removed — only Infos + Why choose me remain.
        const aboutBody = (() => {
          const showPanel = settings.about.showSidePanel && aboutSideInfoItems.length > 0;
          // Split nav: profile as a full-width frame directly above Why Me (not a narrow sidebar).
          const splitProfileBand = isSplitMode && showPanel;
          const isFullWidth = splitProfileBand || settings.about.layoutMode === 'full-width';
          const hasSidebar = showPanel && !isFullWidth;
          const layoutMode = splitProfileBand ? 'full-width' : settings.about.layoutMode;
          const isTwinColumns = layoutMode === 'twin-columns';
          const gridClass = aboutMainGridClass(
            layoutMode,
            hasSidebar,
            aboutPresentation.contentPairAlign ?? 'start',
            aboutPresentation.twinColumnsSplit ?? 'why-me-70'
          );
          const pairAlignClass = aboutContentPairAlignClass(
            aboutPresentation.contentPairAlign ?? 'start'
          );
          const panelPlacement = splitProfileBand
            ? 'below-stats'
            : settings.about.fullWidthPanelPlacement;
          const statsBlockSpacing = settings.about.showStats && stats.length > 0 ? 'mt-14' : 'mt-10';
          const whyMePresentation = aboutPresentation;
          const sidePanelPresentation = splitProfileBand
            ? {
                ...aboutPresentation,
                // Keep the panel full-bleed above Why me in split nav, but respect
                // the user's Sidebar design (framed / cards / minimal / info-bar / list / info-strip / profile-cv).
                sidePanelAutoCenter: false,
              }
            : aboutPresentation;

          const pairCentered =
            (aboutPresentation.contentPairAlign ?? 'start') === 'center' ||
            (aboutPresentation.contentPairAlign ?? 'start') === 'end';
          const whyMeAlign = whyMeContentAlignClass(whyMePresentation.whyMeContentAlign);
          const isWhyMeTimeline = whyMePresentation.whyMeDesign === 'timeline';
          const isWhyMeSplit = whyMePresentation.whyMeDesign === 'split';
          const isWhyMeLinedList = whyMePresentation.whyMeDesign === 'lined-list';
          const isWhyMeMediaAside = whyMePresentation.whyMeDesign === 'media-aside';
          const whyMeOwnsFullWidth =
            isWhyMeTimeline || isWhyMeSplit || isWhyMeLinedList || isWhyMeMediaAside;
          const mainColumn = (
            <div
              className={`space-y-12 ${
                pairCentered && !whyMeOwnsFullWidth ? 'w-fit max-w-full' : 'w-full min-w-0'
              }`}
            >
              {settings.about.showWhyMe && whyMeBlocks.length > 0 ? (
                <div
                  className={`flex w-full min-w-0 flex-col ${
                    whyMeOwnsFullWidth ? 'items-stretch' : whyMeAlign.column
                  }`}
                >
                  <div className={whyMeOwnsFullWidth ? 'w-full min-w-0' : whyMeAlign.track}>
                    <div
                      className={
                        isWhyMeTimeline || isWhyMeLinedList
                          ? 'mx-auto w-full max-w-5xl'
                          : undefined
                      }
                    >
                      <EditorialWhyMeHeading presentation={whyMePresentation} />
                    </div>
                    <EditorialWhyMeList
                      blocks={whyMeBlocks}
                      presentation={whyMePresentation}
                      motionProfile={motionProfile}
                      forceStack={isSplitMode}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );

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
                <div className={statsBlockSpacing}>{mainColumn}</div>
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
                <div className={`grid gap-8 sm:gap-10 ${gridClass}`}>
                  {layoutMode === 'sidebar-left' ? (
                    <>
                      {sidePanelColumn}
                      {mainColumn}
                    </>
                  ) : (
                    <>
                      {mainColumn}
                      {sidePanelColumn}
                    </>
                  )}
                </div>
              </div>
            </>
          );
        })();
        return (
          <PortfolioSectionShell
            id="about"
            background={aboutPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(aboutPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
          >
            {aboutBody}
          </PortfolioSectionShell>
        );
      }
      case 'experience': {
        const layout = experiencePresentation.sectionLayout ?? 'stacked';
        const aside = !isSplitMode && faqSectionLayoutIsAside(layout);
        const headerBlock = (
          <EditorialSectionStickyHeader
            title={experienceSectionTitle}
            subtitle={experienceSectionSubtitle || undefined}
            editorialLayout={isEditorialLayout}
            centered={experienceHeaderAlign.centered}
            alignRight={experienceHeaderAlign.alignRight}
            alwaysCentered={experienceHeaderAlign.alwaysCentered}
            className={aside ? 'mb-0 w-full' : undefined}
            titleTypographyClass={experienceHeaderTypography.title.className}
            titleTypographyStyle={experienceHeaderTypography.title.style}
            titleDecorationStyle={experienceHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={experienceHeaderTypography.title.customSizing}
            subtitleTypographyClass={experienceHeaderTypography.subtitle.className}
            subtitleTypographyStyle={experienceHeaderTypography.subtitle.style}
            subtitleDecorationStyle={experienceHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={experienceHeaderTypography.subtitle.customSizing}
            scrollBehavior={effectiveTitleScroll}
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'experience')}
          />
        );
        const contentBlock = (
          <SectionIllustratedContent
            variant={experiencePresentation.illustrationVariant}
            placement={experiencePresentation.illustrationPlacement}
            accent={experiencePresentation.accentColor}
            ink={experiencePresentation.titleColor}
            surface={experiencePresentation.entryFrame.cardBackgroundColor}
          >
            {settings.experience.showYears &&
            profile.yearsOfExperience != null &&
            profile.yearsOfExperience > 0 ? (
              <PortfolioMotionItem profile={motionProfile} index={0}>
                <EditorialExperienceYears years={profile.yearsOfExperience} presentation={experiencePresentation} />
              </PortfolioMotionItem>
            ) : null}
            <EditorialExperienceList
              blocks={experienceBlocks}
              presentation={experiencePresentation}
              motionProfile={motionProfile}
              forceSingleColumn={isSplitMode}
            />
          </SectionIllustratedContent>
        );
        return (
          <PortfolioSectionShell
            id="experience"
            background={experiencePresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(experiencePresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
      case 'aboutUs': {
        if (!aboutUs) return null;
        const layout = aboutUsPresentation.sectionLayout ?? 'stacked';
        const embedHeader = aboutUsDesignEmbedsHeader(aboutUsPresentation.design);
        const aside = !embedHeader && !isSplitMode && aboutUsSectionLayoutIsAside(layout);
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
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'aboutUs')}
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
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(aboutUsPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
        const aside = !isSplitMode && teamSectionLayoutIsAside(layout);
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
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'team')}
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
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(teamPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
        const aside = !isSplitMode && gallerySectionLayoutIsAside(layout);
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
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'gallery')}
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
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(galleryPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
          !isSplitMode &&
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
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'faq')}
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
            fillAvailableHeight={isPagesMode}
            className={navMode === 'per-page' ? 'pb-28 sm:pb-24' : undefined}
            suppressBackground={suppressSectionBackground(faqPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            contentLayout={sectionContentLayout}
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
            contentLayout={sectionContentLayout}
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
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'contact')}
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
      bodyFont={settings.global.bodyFont}
      bodyFontForceAll={settings.global.bodyFontForceAll}
      colorMode={(settings.global.colorMode ?? 'dark') as 'dark' | 'light'}
      globalStyle={globalBgStyle}
      fixedBackgroundStyle={globalFixedBgStyle}
      patternBackgroundStyle={globalPatternStyle}
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
      {navMode === 'per-page' ? (
        <PortfolioPerPageNav items={perPageNavItems} settings={settings.navigation} />
      ) : (
        <>
          <PortfolioFloatingNav
            items={isPagesMode ? perPageNavItems : navItems}
            settings={settings.navigation}
            activeId={isPagesMode ? activePageId : undefined}
            onNavigate={
              isPagesMode
                ? (id) => setActivePageId(id === 'contact' ? pagesContactTarget : id)
                : undefined
            }
            chromeLinks={navChromeLinks}
            monochrome={usesMonochromeChrome}
            contactHref={navContactHref}
            onContactNavigate={
              isPagesMode ? () => setActivePageId(pagesContactTarget) : undefined
            }
            avatarUrl={profile.avatarUrl}
            brandName={(profile.fullName ?? '').trim().split(/\s+/).filter(Boolean)[0] ?? ''}
          />
        </>
      )}

      {isPortfolioOwner ? (
        <PortfolioSettingsButton
          onClick={() => setSettingsOpen(true)}
          storageKey={`portfolio-settings-btn:${creatorId}`}
          shortcutHint={
            settings.global.settingsShortcutEnabled ?? true ? 'Ctrl+,' : null
          }
        />
      ) : null}

      {isPortfolioOwner ? (
        <PortfolioSettingsModal
          open={settingsOpen}
          onClose={() => {
            flushPendingSave();
            setSettingsOpen(false);
          }}
          settings={settings}
          persistStatus={persistStatus}
          onChange={updateSection}
          onThemeChange={setThemeId}
          onNavigationChange={updateNavigation}
          onGlobalChange={updateGlobal}
          onColorModeChange={setColorMode}
          onGlobalPaletteChange={patchGlobalPalette}
          onGlobalPalettePairChange={setGlobalPalettePair}
          onSaveCustomTheme={saveCustomTheme}
          onRenameCustomTheme={renameCustomTheme}
          onDuplicateTheme={duplicateTheme}
          onResetBuiltinTheme={resetBuiltinTheme}
          onDeleteCustomTheme={deleteCustomTheme}
          onReset={resetSettings}
          onUndo={undoSettings}
          onRedo={redoSettings}
          canUndo={canUndo}
          canRedo={canRedo}
          availableTools={strengthNames}
          availableWorks={availableHeroWorks}
        />
      ) : null}

      {isPagesMode ? (
        <div className="relative flex h-[100dvh] flex-col overflow-hidden">
          {settings.hero.enabled && activePageId === 'hero' ? (
            <div
              key="hero-page"
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
            >
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
                suppressBackground={hasGlobalSolid}
                globalBackgroundStyle={globalBgStyle}
                geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
                motionProfile={motionProfile}
                contentGutter={settings.global.contentGutter}
                contentWidthClass={globalWidthClass}
                colorMode={(settings.global.colorMode ?? 'dark') as 'light' | 'dark'}
              />
            </div>
          ) : null}

          {contentSectionOrder.map((sectionKey) => {
            if (!sectionVisibility[sectionKey]) return null;
            if (activePageId !== sectionKey) return null;
            const showFooter = shouldShowFooterOnPage(sectionKey);
            const sectionBlocksGlobal = resolvePageSectionBlocksGlobal(sectionKey);
            const sectionBg = sectionBackgroundByKey[sectionKey];
            const pageFillColor =
              sectionBlocksGlobal && sectionBg
                ? sectionBackgroundBlockColor(sectionBg)
                : undefined;
            return (
              <div
                key={sectionKey}
                className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
              >
                {/*
                  Fill the scrollport height so short pages pin the footer to the bottom
                  (no white void under the footer).
                  When this page section has an opaque background, paint the page column
                  with that fill so the fixed global wallpaper cannot show in empty space.
                */}
                <div
                  className={`flex min-h-full w-full flex-col overflow-x-clip ${
                    !hasGlobalBg && !sectionBlocksGlobal ? 'bg-white' : ''
                  }`}
                  style={{
                    minHeight: '100%',
                    ...(pageFillColor ? { backgroundColor: pageFillColor } : null),
                  }}
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
                        whyMeText={whyMeBlocks[0]?.text ?? null}
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
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`flex min-h-[100dvh] min-h-screen max-w-full flex-col ${
          isSplitMode ? '' : 'overflow-x-clip'
        }`}>
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
              suppressBackground={hasGlobalSolid}
              globalBackgroundStyle={globalBgStyle}
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
            } ${hasGlobalBg ? '' : 'bg-white'}`}
          >
            {isSplitMode ? (
              <PortfolioSplitScreenFrame
                titleMotion={settings.global.splitTitleMotion ?? 'fade-up'}
                titleFrame={splitTitleFrame}
              >
                {contentSectionOrder.map((sectionKey) => (
                  <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
                ))}
              </PortfolioSplitScreenFrame>
            ) : (
              contentSectionOrder.map((sectionKey) => (
                <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
              ))
            )}
          </main>

          {settings.footer.enabled ? (
            <div className="mt-auto w-full shrink-0">
              <EditorialPortfolioFooter
                creatorName={profile.fullName}
                creatorId={creatorId}
                avatarUrl={profile.avatarUrl}
                bio={profile.bio}
                whyMeText={whyMeBlocks[0]?.text ?? null}
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
