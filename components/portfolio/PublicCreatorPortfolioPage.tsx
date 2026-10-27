'use client';
import aboutUsContentStyles from './portfolio-about-us-content.module.css';
import { withFooterTypography } from './portfolio-footer-content';
import { withPeopleMediaTypography } from './portfolio-people-media-content';
import { withContactTypography } from './portfolio-contact-content';
import { withFaqTypography } from './portfolio-faq-content';
import { withExperienceTypography } from './portfolio-experience-content';
import servicesContentStyles from './portfolio-services-content.module.css';
import { resolveWorkReadingPresentation } from './portfolio-work-resolved-palette';
import { formatInfoBio } from './portfolio-info-bio';
import { ensureExperienceInkContrast } from './portfolio-experience-settings';
import stackCatalogueStyles from './portfolio-stack-catalogue-preview.module.css';
import toolsCatalogueStyles from './portfolio-tools-catalogue-preview.module.css';
import servicesCatalogueStyles from './portfolio-services-catalogue-preview.module.css';
import experienceCatalogueStyles from './portfolio-experience-catalogue-preview.module.css';
import stackHeaderPreviewStyles from './portfolio-stack-header-preview.module.css';
import workHeaderPreviewStyles from './portfolio-work-header-preview.module.css';
import toolsHeaderPreviewStyles from './portfolio-tools-header-preview.module.css';
import servicesHeaderPreviewStyles from './portfolio-services-header-preview.module.css';
import experienceHeaderPreviewStyles from './portfolio-experience-header-preview.module.css';
import teamHeaderPreviewStyles from './portfolio-team-header-preview.module.css';
import galleryHeaderPreviewStyles from './portfolio-gallery-header-preview.module.css';
import faqHeaderPreviewStyles from './portfolio-faq-header-preview.module.css';
import footerHeaderPreviewStyles from './portfolio-footer-header-preview.module.css';
import {headerPreviewCopy} from './portfolio-header-preview-copy';
import infoHeaderPreviewStyles from './portfolio-info-header-preview.module.css';
import {PortfolioSmoothScroll} from './portfolio-smooth-scroll';

// @refresh reset

import { sectionFamilyPalette } from '@/components/portfolio/portfolio-section-palette-family';
import {
  ExperienceHeaderAccentCountHeader,
  ExperienceHeaderBillboardHeader,
  ExperienceHeaderEditorialHeader,
  ExperienceHeaderIndexHeader,
  ExperienceHeaderMarqueeHeader,
  ExperienceHeaderMastheadHeader,
  ExperienceHeaderSerifLeadHeader,
  ExperienceHeaderSplitHeadingHeader,
} from '@/components/portfolio/experience-portfolio-header-designs';
import dynamic from 'next/dynamic';
import {
  Fragment,
  startTransition,
  useCallback,
  useEffect, useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { publishProfileVisits, useProfileVisits } from '@/components/portfolio/profile-visits-store';
import Link from 'next/link';
import { usePortfolioStudioInspect } from '@/components/portfolio/usePortfolioStudioInspect';
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
import { SOCIAL_PLATFORMS } from '@/types/profile';
import type { ProfileServiceItem } from '@/types/profile';
import type { MarketplaceContentItem, MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { buildCreatorPortfolioPath } from '@/lib/portfolio-url';
import { PortfolioHeroSection } from '@/components/portfolio/PortfolioHeroSection';
import { PortfolioPagesSlideViewport } from '@/components/portfolio/portfolio-pages-transition';
import { patchNavPalette } from '@/components/portfolio/portfolio-nav-palette-settings';
import { resolveStudioSplitSurface } from '@/components/portfolio/portfolio-studio-split-surface';
import { useNavigationSection } from '@/components/portfolio/use-navigation-section';
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
import {
  DESIGN_PREVIEW_LOCATION_LABEL,
  DESIGN_PREVIEW_PORTFOLIO_POSTS,
  designPreviewReadyMessage,
  designPreviewSizeMessage,
  withDesignPreviewProfile,
  type DesignPreviewTarget,
} from '@/lib/portfolio-design-preview';
import { scrollToPortfolioSection } from '@/components/portfolio/portfolio-nav-top-clearance';
import { writeHeroBannerDesignHint, writeHeroLoadingSettingsHint } from '@/components/portfolio/portfolio-hero-banner-hint';
import {
  DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN,
  normalizePortfolioHeroBannerDesign,
  resolveHeroSpecialtyValue,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import { resolveHeroLayoutDivision } from '@/components/portfolio/portfolio-hero-layout-division';
import {
  EditorialSectionStickyHeader,
  portfolioEditorialShellClass,
  SIDE_INFO_ICONS,
  ServicesOrderCtaHrefProvider,
} from '@/components/portfolio/portfolio-section-primitives';
/* The navigation is on screen from the first paint, so it stays in the page bundle. */
import { PortfolioFloatingNav, useNavVisibility } from '@/components/portfolio/portfolio-section-nav';
import { ServicesBackgroundFrame } from '@/components/portfolio/portfolio-services-card-elements';
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
  ProjectsAccordionGallery,
  ProjectsBoardGallery,
  ProjectsCarouselSection,
  ProjectsCascadeGallery,
  ProjectsCaseGallery,
  ProjectsDuotoneGallery,
  ProjectsFramesGallery,
  ProjectsGridSection,
  ProjectsIndexGallery,
  ProjectsLedgerGallery,
  ProjectsPressGallery,
  ProjectsShowcaseGallery,
  ProjectsSpecGallery,
  ProjectsSplitGallery,
} from '@/components/portfolio/portfolio-work-project-layouts';
import {
  galleryPremiumFontScale,
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

import {
  pickHeroPresentationSettings,
  resolveHeroTools,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  resolveHeroEditorialRailTools,
  resolveHeroStatementCtaTools,
  resolveHeroPortraitBalanceTools,
} from '@/components/portfolio/portfolio-hero-banner-settings';
import { resolveWorkSectionSubtitle, resolveWorkSectionTitle, workSectionDesignSettingsPatch } from '@/components/portfolio/portfolio-work-settings';
import { WorkTextScale, SectionContentTextScale } from './portfolio-work-text-scale';
import { aboutContentPairAlignClass, aboutSidePanelTwinAlignClass, filterAboutStats, isAboutSideInfoItemVisible, pickAboutPresentationSettings } from '@/components/portfolio/portfolio-about-settings';
import {
  pickServicesPresentationSettings,
  resolveServicesSectionSubtitle,
  resolveServicesSectionTitle,
  resolveServicesOrderCtaHref,
  servicesPremiumFontScale,
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
  faqPremiumFontScale,
  faqTextColorVars,
  resolveFaqHeaderPosition,
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
  FaqHeaderSignalHeader,
  FaqHeaderQueryHeader,
  FaqHeaderDialogueHeader,
} from '@/components/portfolio/faq-portfolio-header-designs';
import { FaqDesignFrame, FaqHeaderPlacement, faqDesignAllowsFrame } from '@/components/portfolio/portfolio-faq-frame';
import {
  pickTeamPresentationSettings,
  teamPremiumFontScale,
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
  pickInfoPresentationSettings,
  resolveInfoSectionSubtitle,
  resolveInfoSectionTitle,
  infoDesignSettingsPatch,
  resolveInfoVisibleBlocks,
} from '@/components/portfolio/portfolio-info-settings';
import { pickToolsPresentationSettings, resolveToolsSectionSubtitle, resolveToolsSectionTitle, toolsDesignSettingsPatch } from '@/components/portfolio/portfolio-tools-settings';
import { pickStackPresentationSettings, resolveStackSectionSubtitle, resolveStackSectionTitle, stackSectionLayoutIsAside, type PortfolioStackPresentationSettings } from '@/components/portfolio/portfolio-stack-settings';
import { stackDesignSettingsPatch } from '@/components/portfolio/portfolio-stack-design-patch';
import { portfolioNavLayoutDesignPatch } from '@/components/portfolio/portfolio-nav-layout-design';
import { heroBannerDesignSettingsPatch } from '@/components/portfolio/portfolio-hero-banner-settings';
import {
  aboutUsDesignEmbedsHeader,
  aboutUsHeaderFontClass,
  aboutUsHeaderFontStyle,
  aboutUsSectionLayoutIsAside,
  aboutUsSubtitleColorStyle,
  aboutUsTitleColorStyle,
  defaultsForAboutUsDesign,
  pickAboutUsPresentationSettings,
  resolveAboutUsSectionSubtitle,
  resolveAboutUsSectionTitle,
} from '@/components/portfolio/portfolio-about-us-settings';
import { portfolioPresenceShowsAboutUs } from '@/components/portfolio/portfolio-presence';
import { pickExperiencePresentationSettings, resolveExperienceSectionSubtitle, resolveExperienceSectionTitle, experienceDesignUsesFlatHeader, experienceDesignUsesTableHeader, experienceDesignUsesCardsHeader, experienceHeaderDesignIsApplied, experiencePremiumFontScale } from '@/components/portfolio/portfolio-experience-settings';
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
import {
  pickFooterPresentationSettings,
  portfolioFooterNavClearanceClass,
  resolveFooterCopyrightLabel,
} from '@/components/portfolio/portfolio-footer-settings';
import type { PortfolioFooterSectionLinkOption } from '@/components/portfolio/portfolio-footer-design-layout';
import { PortfolioFooterMiniBar } from '@/components/portfolio/portfolio-footer-mini-bar';
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
  resolveHeroPaletteFromSettings,
} from '@/components/portfolio/portfolio-section-palette';
import { portfolioPaletteCssVars, resolveActivePortfolioPalette } from '@/components/portfolio/portfolio-color-mode';
import {
  resolveSectionActiveMode,
  resolveSectionBackgroundIsolation,
  resolveSectionContrastOverride,
  resolveSectionVisibleSurface,
  resolveSectionPalette,
} from '@/components/portfolio/portfolio-section-color-mode';
import { resolveHeroPaletteColor, applyHeroPaletteToPresentation } from '@/components/portfolio/portfolio-hero-palette-settings';
import { heroSectionBackgroundFields } from './portfolio-hero-section-background';
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
import {
  sectionBackgroundStyle,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import {
  buildPortfolioNavChromeLinks,
  buildPortfolioNavSocialLinkOptions,
} from '@/components/portfolio/portfolio-nav-extras';
import { DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES } from '@/components/portfolio/portfolio-settings-types';
import { motionProfileEnablesHeroGeomFade } from '@/components/portfolio/portfolio-motion-settings';
import {
  PortfolioHeaderMotionOffContext,
  PortfolioMotionOffContext,
  setPortfolioMotionOff,
} from '@/components/portfolio/portfolio-motion-off';
import { PortfolioMotionProvider } from '@/components/portfolio/PortfolioMotionItem';
import { PortfolioTaskListMarkerProvider } from '@/components/portfolio/portfolio-task-list-marker-context';
import { useT } from '@/lib/i18n/I18nProvider';

/** Navigation design preview: links shown, and how much the bar is blown up to read at card size. */
const NAV_PREVIEW_MAX_ITEMS = 3;
const NAV_PREVIEW_ZOOM = 1.75;

/**
 * About and Experience sections are optional and the page renders one Services and one FAQ
 * design, so each is its own chunk.
 */
const loadExperienceLists = () => import('@/components/portfolio/portfolio-experience-lists');
const EditorialExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.EditorialExperienceList)));
const MilestoneExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.MilestoneExperienceList)));
const TableExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.TableExperienceList)));
const CardsExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.CardsExperienceList)));
const ReelExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.ReelExperienceList)));
const DuotoneExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.DuotoneExperienceList)));
const GalleryExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.GalleryExperienceList)));
const LoftExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.LoftExperienceList)));
const PressExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.PressExperienceList)));
const LegacyExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.LegacyExperienceList)));
const KineticExperienceList = withExperienceTypography(dynamic(() => loadExperienceLists().then((m) => m.KineticExperienceList)));
/*
 * Every other section is its own chunk (they used to share one 11,000-line module): a portfolio
 * only downloads the sections it shows. Server rendering is unchanged — next/dynamic renders them
 * on the server and preloads their chunks for hydration.
 */
const EditorialWorkGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-section-work').then((m) => m.EditorialWorkGallery)
);
const loadSideInfo = () => import('@/components/portfolio/portfolio-section-side-info');
const EditorialSideInfoHeading = dynamic(() => loadSideInfo().then((m) => m.EditorialSideInfoHeading));
const EditorialSideInfoPanel = dynamic(() => loadSideInfo().then((m) => m.EditorialSideInfoPanel));
const EditorialStatGrid = dynamic(() => loadSideInfo().then((m) => m.EditorialStatGrid));
const EditorialTeamGallery = withPeopleMediaTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-team-designs').then((m) => m.EditorialTeamGallery)
));
const EditorialGallerySection = withPeopleMediaTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-section-gallery').then((m) => m.EditorialGallerySection)
));
const EditorialFaqList = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-section-faq').then((m) => m.EditorialFaqList)
));
const EditorialContactSection = withContactTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-section-contact').then((m) => m.EditorialContactSection)
));
const EditorialPortfolioFooter = withFooterTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-section-footer').then((m) => m.EditorialPortfolioFooter)
));

/* The footer, reading the visit counter from its own store (profile-visits-store) so the update
   that follows the recorded view re-renders the footer alone rather than the whole page. */
function PortfolioFooterWithVisits({
  initialVisits,
  ...props
}: Omit<ComponentProps<typeof EditorialPortfolioFooter>, 'profileVisits'> & { initialVisits: number }) {
  const profileVisits = useProfileVisits(props.creatorId, initialVisits);
  return <EditorialPortfolioFooter {...props} profileVisits={profileVisits} />;
}

/* Tools pulls GSAP + ScrollTrigger, Stack its level designs: both are optional sections. */
const EditorialToolsGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-tools-section').then((m) => m.EditorialToolsGallery)
);
const EditorialStackGallery = dynamic(() =>
  import('@/components/portfolio/portfolio-stack-section').then((m) => m.EditorialStackGallery)
);
const EditorialAboutMeSection = dynamic(() =>
  import('@/components/portfolio/EditorialAboutMeSection').then((m) => m.EditorialAboutMeSection)
);
const EditorialAboutUsSection = dynamic(() =>
  import('@/components/portfolio/EditorialAboutUsSection').then((m) => m.EditorialAboutUsSection)
);
const ServicesPricingCardsSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-pricing-cards').then((m) => m.ServicesPricingCardsSection)
);
const ServicesPricingAuroraSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-pricing-aurora').then((m) => m.ServicesPricingAuroraSection)
);
const ServicesMediaColumnsSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-design-media-columns').then((m) => m.ServicesMediaColumnsSection)
);
const ServicesIconCardsSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-design-icon-cards').then((m) => m.ServicesIconCardsSection)
);
const ServicesBandIndexSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-design-band-index').then((m) => m.ServicesBandIndexSection)
);
const ServicesCascadeSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-design-cascade').then((m) => m.ServicesCascadeSection)
);
const ServicesCapabilitiesSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-design-capabilities').then((m) => m.ServicesCapabilitiesSection)
);
const ServicesIndexListSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-design-index-list').then((m) => m.ServicesIndexListSection)
);
const ServicesPricingToggleSection = dynamic(() =>
  import('@/components/portfolio/portfolio-services-pricing-toggle').then((m) => m.ServicesPricingToggleSection)
);
const FaqKineticSplitDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-kinetic-split').then((m) => m.FaqKineticSplitDesign)
));
const FaqFloatingGalleryDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-floating-gallery').then((m) => m.FaqFloatingGalleryDesign)
));
const FaqEditorialMasonryDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-editorial-masonry').then((m) => m.FaqEditorialMasonryDesign)
));
const FaqPrismCardsDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-prism-cards').then((m) => m.FaqPrismCardsDesign)
));
const FaqTriGridDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-tri-grid').then((m) => m.FaqTriGridDesign)
));
const FaqSplitIndexDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-split-index').then((m) => m.FaqSplitIndexDesign)
));
const FaqCenteredFocusDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-centered-focus').then((m) => m.FaqCenteredFocusDesign)
));
const FaqBentoDualDesign = withFaqTypography(dynamic(() =>
  import('@/components/portfolio/portfolio-faq-bento-dual').then((m) => m.FaqBentoDualDesign)
));

type PublicCreatorPortfolioPageProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  locationLabel: string | null;
  portfolioPosts?: MarketplaceContentItem[];
  /** Dashboard Live Preview iframe — hide owner chrome and follow parent settings. */
  studioEmbed?: boolean;
  /** Studio design picker preview (embed only): render just this section, in this design, with
   *  placeholder profile data — see lib/portfolio-design-preview. */
  designPreview?: DesignPreviewTarget | null;
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
  } else if (profile.starCount > 0) {
    stats.push({ value: String(profile.starCount), label: 'Stars' });
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
  if (profile.starCount > 0) {
    stats.push({ value: String(profile.starCount), label: 'Stars' });
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
  const t = useT();
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
  profile: sourceProfile,
  isAuthenticated,
  locationLabel: sourceLocationLabel,
  portfolioPosts: sourcePortfolioPosts,
  studioEmbed = false,
  designPreview = null,
}: PublicCreatorPortfolioPageProps) {
  const t = useT();
  const previewTarget = studioEmbed ? designPreview : null;
  const isDesignPreview = previewTarget != null;
  const isFooterPreview = previewTarget?.section === 'footer';
  const usesPreviewSampleContent = isDesignPreview && previewTarget?.section !== 'footerHeader';
  // Picker previews keep the creator's portrait while filling sparse content with sample data.
  const profile = useMemo(
    () => (usesPreviewSampleContent ? withDesignPreviewProfile(sourceProfile) : sourceProfile),
    [usesPreviewSampleContent, sourceProfile]
  );
  const locationLabel = usesPreviewSampleContent ? DESIGN_PREVIEW_LOCATION_LABEL : sourceLocationLabel;
  // The Work section reads this prop before the profile's own posts — placeholders win in a preview.
  const portfolioPosts = usesPreviewSampleContent ? DESIGN_PREVIEW_PORTFOLIO_POSTS : sourcePortfolioPosts;
  const { user, isLoading: authLoading } = useAuth();
  const isPortfolioOwner = !authLoading && user?.id === creatorId;
  const hideOwnerChrome = studioEmbed;
  const resolvedContactEmail = primaryContactEmail(profile);
  const onVisitRecorded = useCallback(
    (visits: number) => publishProfileVisits(creatorId, visits),
    [creatorId]
  );
  const {
    settings: storedSettings,
    setColorMode,
    applyExternalSettings,
  } =
    usePortfolioSettings(creatorId, {
      initialSettings: profile.portfolioSettings,
      canEdit: isPortfolioOwner && !hideOwnerChrome,
    });
  // Design picker preview: the studio's live settings, with the previewed section forced on and
  // set to the design this card shows.
  const settings = useMemo(() => {
    if (!previewTarget) return storedSettings;
    switch (previewTarget.section) {
      case 'footer':
        return { ...storedSettings, footer: { ...storedSettings.footer, enabled: true, design: previewTarget.design } };
      case 'footerHeader':
        return {
          ...storedSettings,
          footer: { ...storedSettings.footer, enabled: true, headerDesign: previewTarget.design },
        };
      case 'contact':
        return { ...storedSettings, contact: { ...storedSettings.contact, enabled: true, cardDesign: previewTarget.design } };
      case 'team':
        return { ...storedSettings, team: { ...storedSettings.team, enabled: true, layout: previewTarget.design } };
      case 'teamHeader':
        return {...storedSettings,team:{...storedSettings.team,...headerPreviewCopy('team',t),enabled:true,headerDesign:previewTarget.design}};
      case 'gallery':
        return { ...storedSettings, gallery: { ...storedSettings.gallery, enabled: true, design: previewTarget.design } };
      case 'galleryHeader':
        return {...storedSettings,gallery:{...storedSettings.gallery,...headerPreviewCopy('gallery',t),enabled:true,headerDesign:previewTarget.design}};
      case 'faq':
        return { ...storedSettings, faq: { ...storedSettings.faq, enabled: true, design: previewTarget.design } };
      case 'faqHeader':
        return { ...storedSettings, faq: { ...storedSettings.faq, enabled: true, headerDesign: previewTarget.design } };
      case 'experience':
        return {
          ...storedSettings,
          experience: { ...storedSettings.experience, enabled: true, experienceDesign: previewTarget.design },
        };
      case 'experienceHeader':
        return {...storedSettings,experience:{...storedSettings.experience,...headerPreviewCopy('experience',t),enabled:true,headerDesign:previewTarget.design}};
      case 'aboutUs':
        // Picking an About us design also applies that design's own defaults (see the panel).
        return {
          ...storedSettings,
          aboutUs: { ...storedSettings.aboutUs, ...defaultsForAboutUsDesign(previewTarget.design), enabled: true },
        };
      case 'services':
        return {
          ...storedSettings,
          services: { ...storedSettings.services, enabled: true, sectionDesign: previewTarget.design },
        };
      case 'servicesHeader':
        return {...storedSettings,services:{...storedSettings.services,...headerPreviewCopy('services',t),enabled:true,headerDesign:previewTarget.design}};
      case 'toolsHeader':
        return { ...storedSettings, tools: { ...storedSettings.tools, ...headerPreviewCopy('tools',t), enabled: true, headerDesign: previewTarget.design } };
      case 'tools':
        return {
          ...storedSettings,
          tools: {
            ...storedSettings.tools,
            ...toolsDesignSettingsPatch(storedSettings.tools, previewTarget.design),
            enabled: true,
          },
        };
      case 'workHeader':
        return { ...storedSettings, work: { ...storedSettings.work, ...headerPreviewCopy('work',t), enabled: true, headerDesign: previewTarget.design } };
      case 'work':
        return {
          ...storedSettings,
          work: { ...storedSettings.work, ...workSectionDesignSettingsPatch(previewTarget.design), enabled: true },
        };
      case 'infoHeader':
        return { ...storedSettings, info: { ...storedSettings.info, ...headerPreviewCopy('info',t), enabled: true, headerDesign: previewTarget.design } };
      case 'info':
        return {
          ...storedSettings,
          info: { ...storedSettings.info, ...infoDesignSettingsPatch(previewTarget.design), enabled: true },
        };
      case 'stackHeader':
        return { ...storedSettings, stack: { ...storedSettings.stack, ...headerPreviewCopy('stack',t), enabled: true, headerDesign: previewTarget.design } };
      case 'stack':
        return {
          ...storedSettings,
          stack: {
            ...storedSettings.stack,
            ...stackDesignSettingsPatch(storedSettings.stack, previewTarget.design),
            enabled: true,
          },
        };
      case 'hero':
        return {
          ...storedSettings,
          hero: { ...storedSettings.hero, ...heroBannerDesignSettingsPatch(previewTarget.design), enabled: true },
        };
      case 'navigation': {
        const pill = previewTarget.design === 'floating-pill';
        return {
          ...storedSettings,
          global: pill ? { ...storedSettings.global, showColorModeToggleInNav: true } : storedSettings.global,
          navigation: {
            ...storedSettings.navigation,
            ...portfolioNavLayoutDesignPatch(previewTarget.design, storedSettings.navigation),
            ...(pill ? { mobileLayout: 'brand-bar' as const } : {}),
            // The card shows the bar itself, whatever the scroll-based "When to appear" says.
            displayMode: 'always' as const,
            enabled: true,
          },
        };
      }
    }
  }, [previewTarget, storedSettings, t]);
  const previewSectionFocusRef = useRef<(sectionId: string) => void>(() => {});
  /* Studio preview only: hover outlines a section, a click opens its settings (set by the studio). */
  const [studioInspect, setStudioInspect] = useState(false);
  const [studioInspectSection, setStudioInspectSection] = useState<string | null>(null);
  usePortfolioStudioInspect({
    enabled: hideOwnerChrome && studioInspect,
    activeSectionId: studioInspectSection,
  });

  /**
   * Inside the studio preview the iframe does two contradictory things at once: it applies the
   * colour-mode change optimistically *and* it treats the parent's `apply-settings` stream as the
   * source of truth. Any settings frame the parent had already queued still carries the previous
   * mode, so it lands a few hundred ms later and rolls the change back — the visitor sees
   * light → dark → light. Measured on 2026-09-25: local flip at 130ms, stale echo reverted it at
   * 554ms, the parent's real update only arrived at 1627ms.
   *
   * This ref remembers where we just moved to. While it is set, an `apply-settings` still carrying
   * the old mode is a stale echo and is dropped; the first frame that agrees clears it.
   */
  const pendingColorModeRef = useRef<'light' | 'dark' | null>(null);
  const pendingColorModeTimerRef = useRef<number | null>(null);

  const cyclePortfolioColorMode = useCallback(() => {
    const next = (settings.global.colorMode ?? 'dark') === 'light' ? 'dark' : 'light';
    if (hideOwnerChrome && typeof window !== 'undefined' && window.parent !== window) {
      pendingColorModeRef.current = next;
      // Safety valve: if the parent never acknowledges (message dropped, save failed), the guard
      // must not wedge the preview into ignoring every future settings frame.
      if (pendingColorModeTimerRef.current) window.clearTimeout(pendingColorModeTimerRef.current);
      pendingColorModeTimerRef.current = window.setTimeout(() => {
        pendingColorModeRef.current = null;
        pendingColorModeTimerRef.current = null;
      }, 4000);
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
    writeHeroLoadingSettingsHint([creatorId, profile.id, profile.username], settings);
  }, [creatorId, profile.id, profile.username, settings]);

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
  // Portfolio → General → Content shown: "Project description" / "Tools" apply to every
  // Projects layout at once, so they're stripped here instead of in each of the 14 designs.
  const hideWorkDescription = settings.work.showCardDescription === false;
  const hideWorkTools = settings.work.showCardTools === false;
  const workSectionItems = useMemo(() => {
    if (!hideWorkDescription && !hideWorkTools) return workItems;
    return workItems.map((item) => ({
      ...item,
      ...(hideWorkDescription ? { description: null } : null),
      ...(hideWorkTools ? { toolsUsed: [] } : null),
    }));
  }, [workItems, hideWorkDescription, hideWorkTools]);
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
            title: item.title?.trim() || t('Untitled project'),
            imageUrl: raw,
            href: workHref,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [workItems, t]
  );
  const heroFeaturedWorks = useMemo(() => {
    const banner = normalizePortfolioHeroBannerDesign(
      settings.hero.heroBannerDesign ?? DEFAULT_PORTFOLIO_HERO_BANNER_DESIGN
    );
    if (banner === 'work-duo') {
      const selectedIds = settings.hero.heroWorkDuoSelectedWorkIds ?? [];
      const byId = new Map(availableHeroWorks.map((work) => [work.id, work]));
      return selectedIds
        .map((id) => byId.get(id))
        .filter((work): work is NonNullable<typeof work> => Boolean(work))
        .slice(0, 2);
    }
    if (banner === 'selected-works') {
      const selectedIds = settings.hero.heroSelectedWorksSelectedWorkIds;
      // null keeps the historical automatic selection; an empty array is an
      // intentional, valid identity-only composition.
      if (selectedIds === null || selectedIds === undefined) {
        return availableHeroWorks.slice(0, 4);
      }
      const byId = new Map(availableHeroWorks.map((work) => [work.id, work]));
      return selectedIds
        .map((id) => byId.get(id))
        .filter((work): work is NonNullable<typeof work> => Boolean(work))
        .slice(0, 4);
    }
    if (banner === 'colophon') {
      const selected = settings.hero.heroColophonSelectedWorkIds;
      if (selected == null) return availableHeroWorks.slice(0, 4);
      const byId = new Map(availableHeroWorks.map(work => [work.id, work]));
      return selected.map(id => byId.get(id)).filter((work): work is NonNullable<typeof work> => Boolean(work)).slice(0, 4);
    }
    return availableHeroWorks.slice(0, 4);
  }, [
    availableHeroWorks,
    settings.hero.heroBannerDesign,
    settings.hero.heroSelectedWorksSelectedWorkIds,
    settings.hero.heroColophonSelectedWorkIds,
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
  /* toLocaleDateString builds an Intl formatter per call, and this component re-renders often. */
  const memberSinceLabel = useMemo(() => formatMemberSince(profile.memberSince), [profile.memberSince]);
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

  const previewGalleryKey = JSON.stringify(profile.galleryItems ?? []);
  const previewApplyRequestRef = useRef<number | null>(null);
  const [previewApplyRevision, setPreviewApplyRevision] = useState(0);
  useEffect(() => {
    if (!isDesignPreview || previewApplyRequestRef.current == null) return;
    const previewRequestId = previewApplyRequestRef.current;
    const frame = requestAnimationFrame(() => {
      window.parent.postMessage({ source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'design-preview-applied', previewRequestId }, window.location.origin);
      if (previewApplyRequestRef.current === previewRequestId) previewApplyRequestRef.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [settings, isDesignPreview, previewApplyRevision]);
  const previewGalleryItems = useMemo(
    () => JSON.parse(previewGalleryKey) as NonNullable<typeof profile.galleryItems>,
    [previewGalleryKey]
  );

  useEffect(() => {
    if (!hideOwnerChrome || typeof window === 'undefined' || window.parent === window) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isPortfolioStudioPreviewMessage(event.data)) return;
      if (event.data.type === 'apply-settings') {
        const pending = pendingColorModeRef.current;
        if (pending) {
          const incoming = (event.data.settings as { global?: { colorMode?: string } } | undefined)
            ?.global?.colorMode;
          // Still the mode we just left: a frame the parent queued before it processed our
          // `color-mode-change`. Applying it is what produced the visible back-and-forth.
          if (incoming !== pending) return;
          pendingColorModeRef.current = null;
          if (pendingColorModeTimerRef.current) {
            window.clearTimeout(pendingColorModeTimerRef.current);
            pendingColorModeTimerRef.current = null;
          }
        }
        // A transition, not an urgent update: picking a design (or anything that mounts a section
        // component not downloaded yet) suspends on its `next/dynamic` chunk. Those have no
        // Suspense of their own, so urgently the suspension reaches the route's `loading.tsx` and
        // the WHOLE page is swapped for the skeleton and remounted (scroll reset, every entrance
        // replayed). In a transition React keeps the current page on screen until the chunk is in.
        const incomingSettings = event.data.settings;
        if (isDesignPreview && typeof event.data.previewRequestId === 'number') {
          previewApplyRequestRef.current = event.data.previewRequestId;
        }
        startTransition(() => {
          applyExternalSettings(incomingSettings);
          // Equal settings may intentionally skip the settings state update. Still
          // acknowledge this request after commit so its card never waits forever.
          if (previewApplyRequestRef.current != null) setPreviewApplyRevision(previewApplyRequestRef.current);
        });
        return;
      }
      if (event.data.type === 'scroll-to-section') {
        const sectionId = event.data.sectionId;
        requestAnimationFrame(() => previewSectionFocusRef.current(sectionId));
        return;
      }
      if (event.data.type === 'set-inspect') {
        setStudioInspect(event.data.enabled);
        setStudioInspectSection(event.data.sectionId ?? null);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [hideOwnerChrome, applyExternalSettings]);

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
    () => {
      const presentation = pickHeroPresentationSettings(settings.hero);
      const background = heroSectionBackgroundFields(presentation);
      // Procedural art already derives its own tones; only custom solid fills need rebalancing.
      if (!background.sectionBackgroundEnabled || background.sectionBackgroundFill !== 'solid' || (presentation.heroSectionBackgroundArt && presentation.heroSectionBackgroundArt !== 'none')) return presentation;
      const palette = resolveHeroPaletteFromSettings(presentation.palette);
      const surface = resolveSectionVisibleSurface(background, palette.fond);
      const baseMode = resolveSectionActiveMode(settings.hero.colorModeOverride, settings.global.colorMode ?? 'dark');
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', {
        ...background, sectionBackgroundColor: surface, sectionBackgroundOpacity: 100,
      }, baseMode), baseMode);
      const readingPalette = { ...(mode === baseMode ? palette : sectionFamilyPalette(settings.hero.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode })), fond: surface };
      return { ...presentation, ...applyHeroPaletteToPresentation({ ...presentation, palette: readingPalette }),
        palette: readingPalette,
        // Never repaint the selected background from the contrasting foreground palette.
        heroSectionBackgroundColor: presentation.heroSectionBackgroundColor,
        heroSectionBackgroundGradientFrom: presentation.heroSectionBackgroundGradientFrom,
        heroSectionBackgroundGradientTo: presentation.heroSectionBackgroundGradientTo,
        heroSectionBackgroundColorA: presentation.heroSectionBackgroundColorA,
        heroSectionBackgroundColorB: presentation.heroSectionBackgroundColorB,
      };
    },
    [settings.hero, settings.global]
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
      sectionFamilyPalette(
        settings.work.paletteFamily,
        resolveSectionActiveMode(settings.work.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(settings.work.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [
      settings.work.paletteFamily,
      settings.work.colorModeOverride,
      settings.global.colorMode,
      activeGlobalPalette,
      lightGlobalPalette,
      darkGlobalPalette,
    ]
  );
  const workResolved = useMemo(
    () => resolveWorkReadingPresentation(settings.work, settings.global, workPalette),
    [settings.work, settings.global, workPalette]
  );
  const workPresentation = workResolved.presentation;
  const workReadingPalette = workResolved.palette;
  const workColorMode = workResolved.mode;
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
      sectionFamilyPalette(
        settings.experience.paletteFamily,
        resolveSectionActiveMode(settings.experience.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
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
    , settings.experience.paletteFamily, settings.global.colorMode]
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
    const isolated = resolveSectionBackgroundIsolation(painted, experienceOverride, experiencePalette.fond);
    return {
      ...isolated,
      // A disabled fill is stored for later, but must not remain the contrast surface.
      sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : experiencePalette.fond,
      ...periodRulePair,
      activeColorMode: mode,
    };
  }, [settings.experience, settings.global, experiencePalette, lightGlobalPalette, darkGlobalPalette]);
  const experienceReadingPalette = useMemo(() => {
    const surface = experiencePresentation.sectionBackgroundEnabled && experiencePresentation.sectionBackgroundOpacity === 100 && experiencePresentation.sectionBackgroundFill === 'solid'
      ? experiencePresentation.sectionBackgroundColor : experiencePalette.fond;
    const ink = (color: string) => ensureExperienceInkContrast(color, experiencePresentation.activeColorMode === 'dark', '#171717', '#f5f5f5', surface);
    return { ...experiencePalette, fond: surface,
      texteFort: ink(experiencePalette.texteFort), texteMuted: ink(experiencePalette.texteMuted), texteFaint: ink(experiencePalette.texteFaint),
      principal: ink(experiencePalette.principal), secondaire: ink(experiencePalette.secondaire) };
  }, [experiencePresentation, experiencePalette]);
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
      sectionFamilyPalette(
        settings.gallery.paletteFamily,
        resolveSectionActiveMode(settings.gallery.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
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
    , settings.gallery.paletteFamily, settings.global.colorMode]
  );
  const galleryResolved = useMemo(() => {
    const picked = pickGalleryPresentationSettings(settings.gallery);
    const painted =
      picked.useHeroPalette === false
        ? picked
        : { ...picked, ...applyGalleryPaletteToSettings(picked, galleryPalette) };
    const isolated = resolveSectionBackgroundIsolation(
      painted,
      settings.gallery.colorModeOverride,
      galleryPalette.fond
    );
    const baseMode = resolveSectionActiveMode(settings.gallery.colorModeOverride, settings.global.colorMode ?? 'dark');
    const surface = resolveSectionVisibleSurface(isolated, galleryPalette.fond);
    const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', { ...isolated, sectionBackgroundEnabled: true, sectionBackgroundFill: 'solid', sectionBackgroundColor: surface, sectionBackgroundOpacity: 100 }, baseMode), baseMode);
    const palette = mode === baseMode ? galleryPalette : sectionFamilyPalette(settings.gallery.paletteFamily, mode)
      ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
    return { presentation: { ...isolated, ...applyGalleryPaletteToSettings(isolated, palette),
      sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : galleryPalette.fond,
      activeColorMode: mode,
    }, palette: { ...palette, fond: surface } };
  }, [settings.gallery, settings.global, galleryPalette]);
  const galleryPresentation = galleryResolved.presentation;
  const galleryReadingPalette = galleryResolved.palette;
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
      sectionFamilyPalette(
        settings.services.paletteFamily,
        resolveSectionActiveMode(settings.services.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
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
    , settings.services.paletteFamily, settings.global.colorMode]
  );
  const servicesResolved = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToServices(
          pickServicesPresentationSettings(settings.services),
          servicesPalette
        ),
        settings.services.colorModeOverride,
        servicesPalette.fond
      );
      const baseMode = resolveSectionActiveMode(
        settings.services.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      );
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', isolated, baseMode), baseMode);
      const readingPalette = mode === baseMode ? servicesPalette : sectionFamilyPalette(settings.services.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
      const painted = applyHeroPaletteToServices(isolated, readingPalette);
      const surface = isolated.sectionBackgroundEnabled && isolated.sectionBackgroundFill === 'solid' && isolated.sectionBackgroundOpacity === 100
        ? isolated.sectionBackgroundColor : servicesPalette.fond;
      return {
        presentation: { ...painted,
          sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : servicesPalette.fond,
          activeColorMode: mode,
        },
        palette: { ...readingPalette, fond: surface },
      };
    },
    [settings.services, settings.global, servicesPalette]
  );
  const servicesPresentation = servicesResolved.presentation;
  const servicesReadingPalette = servicesResolved.palette;
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
      sectionFamilyPalette(
        settings.faq.paletteFamily,
        resolveSectionActiveMode(settings.faq.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(settings.faq.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.faq.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette, settings.faq.paletteFamily, settings.global.colorMode]
  );
  const faqResolved = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToFaq(pickFaqPresentationSettings(settings.faq), faqPalette),
        settings.faq.colorModeOverride,
        faqPalette.fond
      );
      const baseMode = resolveSectionActiveMode(settings.faq.colorModeOverride, settings.global.colorMode ?? 'dark');
      const surface = resolveSectionVisibleSurface(isolated, faqPalette.fond);
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', { ...isolated, sectionBackgroundEnabled: true, sectionBackgroundFill: 'solid', sectionBackgroundColor: surface, sectionBackgroundOpacity: 100 }, baseMode), baseMode);
      const palette = mode === baseMode ? faqPalette : sectionFamilyPalette(settings.faq.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
      return { presentation: { ...applyHeroPaletteToFaq(isolated, palette),
        sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : faqPalette.fond,
      }, palette: { ...palette, fond: surface }, mode };
    },
    [settings.faq, settings.global, faqPalette]
  );
  const faqPresentation = faqResolved.presentation;
  const faqReadingPalette = faqResolved.palette;
  // Prism Cards, Star Scroll, Tri Grid, Split Index, Centered Focus and Bento Dual
  // read this to resolve `[data-pf-faq-mode]` — Kinetic Split, Floating Gallery and
  // Editorial Masonry track `--pf-palette-fond` directly instead.
  const faqActiveColorMode = faqResolved.mode;
  // Multiplies every premium FAQ design's own font-size declarations via a shared
  // `--pf-faq-font-scale` CSS custom property — see General tab's "Font size" control.
  const faqFontSizeScale = faqPremiumFontScale(faqPresentation.premiumFontSize);
  const faqSectionTitle = useMemo(() => resolveFaqSectionTitle(settings.faq), [settings.faq]);
  const faqSectionSubtitle = useMemo(() => resolveFaqSectionSubtitle(settings.faq), [settings.faq]);
  const teamPalette = useMemo(
    () =>
      sectionFamilyPalette(
        settings.team.paletteFamily,
        resolveSectionActiveMode(settings.team.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(settings.team.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.team.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette, settings.team.paletteFamily, settings.global.colorMode]
  );
  const teamResolved = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToTeam(pickTeamPresentationSettings(settings.team), teamPalette),
        settings.team.colorModeOverride,
        teamPalette.fond
      );
      const baseMode = resolveSectionActiveMode(
        settings.team.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      );
      const surface = resolveSectionVisibleSurface(isolated, teamPalette.fond);
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', { ...isolated, sectionBackgroundEnabled: true, sectionBackgroundFill: 'solid', sectionBackgroundColor: surface, sectionBackgroundOpacity: 100 }, baseMode), baseMode);
      const readingPalette = mode === baseMode ? teamPalette : sectionFamilyPalette(settings.team.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
      return { presentation: { ...applyHeroPaletteToTeam(isolated, readingPalette),
        sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : teamPalette.fond,
        activeColorMode: mode,
      }, palette: { ...readingPalette, fond: surface } };
    },
    [settings.team, settings.global, teamPalette]
  );
  const teamPresentation = teamResolved.presentation;
  const teamReadingPalette = teamResolved.palette;
  const teamSectionTitle = useMemo(() => resolveTeamSectionTitle(settings.team), [settings.team]);
  const teamSectionSubtitle = useMemo(() => resolveTeamSectionSubtitle(settings.team), [settings.team]);
  // Info's effective light/dark mode: the owner's override, or — on 'auto' — the mode its own
  // opaque Background-tab fill reads as, so a black fill on a light site gets light ink.
  const infoColorModeOverride = useMemo(
    () =>
      resolveSectionContrastOverride(
        settings.info.colorModeOverride,
        pickInfoPresentationSettings(settings.info),
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    [settings.info, settings.global.colorMode]
  );
  const infoPalette = useMemo(
    () =>
      sectionFamilyPalette(
        settings.info.paletteFamily,
        resolveSectionActiveMode(infoColorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(infoColorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [infoColorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette, settings.info.paletteFamily, settings.global.colorMode]
  );
  const infoPresentation = useMemo(
    () => ({
      ...resolveSectionBackgroundIsolation(
        applyHeroPaletteToInfo(pickInfoPresentationSettings(settings.info), infoPalette),
        infoColorModeOverride,
        infoPalette.fond
      ),
      activeColorMode: resolveSectionActiveMode(
        infoColorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      ),
    }),
    [settings.info, settings.global.colorMode, infoPalette, infoColorModeOverride]
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
      sectionFamilyPalette(
        settings.tools.paletteFamily,
        resolveSectionActiveMode(settings.tools.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(settings.tools.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.tools.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette, settings.tools.paletteFamily, settings.global.colorMode]
  );
  const toolsPresentation = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToTools(pickToolsPresentationSettings(settings.tools), toolsPalette),
        settings.tools.colorModeOverride,
        toolsPalette.fond
      );
      const baseMode = resolveSectionActiveMode(
        settings.tools.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      );
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', isolated, baseMode), baseMode);
      const palette = mode === baseMode ? toolsPalette : sectionFamilyPalette(settings.tools.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
      return { ...applyHeroPaletteToTools(isolated, palette),
        sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : toolsPalette.fond,
        toolsPalette: palette, activeColorMode: mode };
    },
    [settings.tools, settings.global, toolsPalette]
  );
  const toolsReadingPalette = toolsPresentation.toolsPalette ?? toolsPalette;
  const stackPalette = useMemo(
    () =>
      sectionFamilyPalette(
        settings.stack.paletteFamily,
        resolveSectionActiveMode(settings.stack.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(settings.stack.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.stack.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette, settings.stack.paletteFamily, settings.global.colorMode]
  );
  const stackPresentation = useMemo((): PortfolioStackPresentationSettings & {
    activeColorMode: 'light' | 'dark';
  } => {
    const picked = pickStackPresentationSettings(settings.stack);
    const isBrandCards = picked.design === 'brand-cards';
    const stackSupportsDescription =
      picked.design === 'brand-cards' || picked.design === 'brand-index';
    const isolated = resolveSectionBackgroundIsolation(applyHeroPaletteToStack(picked, stackPalette), settings.stack.colorModeOverride, stackPalette.fond);
    const baseMode = resolveSectionActiveMode(settings.stack.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark');
    const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', isolated, baseMode), baseMode);
    const palette = mode === baseMode ? stackPalette : sectionFamilyPalette(settings.stack.paletteFamily, mode)
      ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
    return {
      ...picked,
      ...applyHeroPaletteToStack(isolated, palette),
      sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : stackPalette.fond,
      toolsPalette: palette,
      activeColorMode: mode,
      showUseCases: isBrandCards ? picked.showUseCases !== false : false,
      showCategory: picked.design === 'brand-index',
      showDescription: stackSupportsDescription ? picked.showDescription !== false : false,
      showLevel: isBrandCards ? picked.showLevel !== false : picked.showLevel,
    };
  }, [settings.stack, settings.global, stackPalette]);
  const stackReadingPalette = stackPresentation.toolsPalette ?? stackPalette;
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
      sectionFamilyPalette(
        settings.aboutUs.paletteFamily,
        resolveSectionActiveMode(settings.aboutUs.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
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
    , settings.aboutUs.paletteFamily, settings.global.colorMode]
  );
  const aboutUsPresentation = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToAboutUs(pickAboutUsPresentationSettings(settings.aboutUs), aboutUsPalette),
        settings.aboutUs.colorModeOverride,
        aboutUsPalette.fond
      );
      const mode = resolveSectionActiveMode(
        settings.aboutUs.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      );
      const surface = isolated.sectionBackgroundEnabled && isolated.sectionBackgroundFill === 'solid' && isolated.sectionBackgroundOpacity === 100
        ? isolated.sectionBackgroundColor : aboutUsPalette.fond;
      const ink = (color: string) => ensureExperienceInkContrast(color, mode === 'dark', '#171717', '#f5f5f5', surface);
      return {
        ...isolated,
        sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : aboutUsPalette.fond,
        titleColor: ink(isolated.titleColor), subtitleColor: ink(isolated.subtitleColor),
        descriptionColor: ink(isolated.descriptionColor), taskColor: ink(isolated.taskColor),
        quoteColor: ink(isolated.quoteColor), founderNameColor: ink(isolated.founderNameColor),
        founderFunctionColor: ink(isolated.founderFunctionColor), accentColor: ink(isolated.accentColor),
        editorialTitleColor: isolated.editorialTitleColor ? ink(isolated.editorialTitleColor) : undefined,
        activeColorMode: mode,
      };
    },
    [settings.aboutUs, settings.global.colorMode, aboutUsPalette]
  );
  const aboutUsReadingPalette = useMemo(() => ({ ...aboutUsPalette,
    fond: aboutUsPresentation.sectionBackgroundEnabled && aboutUsPresentation.sectionBackgroundFill === 'solid' && aboutUsPresentation.sectionBackgroundOpacity === 100 ? aboutUsPresentation.sectionBackgroundColor : aboutUsPalette.fond,
    texteFort: aboutUsPresentation.titleColor,
    texteMuted: aboutUsPresentation.descriptionColor,
    texteFaint: aboutUsPresentation.subtitleColor,
    principal: aboutUsPresentation.accentColor,
  }), [aboutUsPalette, aboutUsPresentation]);
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
      sectionFamilyPalette(
        settings.contact.paletteFamily,
        resolveSectionActiveMode(settings.contact.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
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
    , settings.contact.paletteFamily, settings.global.colorMode]
  );
  const contactResolved = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToContact(pickContactPresentationSettings(settings.contact), contactPalette),
        settings.contact.colorModeOverride,
        contactPalette.fond
      );
      const baseMode = resolveSectionActiveMode(
        settings.contact.colorModeOverride,
        (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
      );
      const surface = resolveSectionVisibleSurface(isolated, contactPalette.fond);
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', { ...isolated, sectionBackgroundEnabled: true, sectionBackgroundFill: 'solid', sectionBackgroundColor: surface, sectionBackgroundOpacity: 100 }, baseMode), baseMode);
      const palette = mode === baseMode ? contactPalette : sectionFamilyPalette(settings.contact.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
      return { presentation: { ...applyHeroPaletteToContact(isolated, palette),
        sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : contactPalette.fond,
        activeColorMode: mode,
      }, palette: { ...palette, fond: surface } };
    },
    [settings.contact, settings.global, contactPalette]
  );
  const contactPresentation = contactResolved.presentation;
  const contactReadingPalette = contactResolved.palette;
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
      sectionFamilyPalette(
        settings.footer.paletteFamily,
        resolveSectionActiveMode(settings.footer.colorModeOverride, (settings.global.colorMode ?? 'dark') as 'light' | 'dark')
      ) ??
      resolveSectionPalette(settings.footer.colorModeOverride, {
        auto: activeGlobalPalette,
        light: lightGlobalPalette,
        dark: darkGlobalPalette,
      }),
    [settings.footer.colorModeOverride, activeGlobalPalette, lightGlobalPalette, darkGlobalPalette, settings.footer.paletteFamily, settings.global.colorMode]
  );
  const footerResolved = useMemo(
    () => {
      const isolated = resolveSectionBackgroundIsolation(
        applyHeroPaletteToFooter(pickFooterPresentationSettings(settings.footer), footerPalette),
        settings.footer.colorModeOverride,
        footerPalette.fond
      );
      const basePalette = isolated.footerPalette ?? footerPalette;
      const surface = resolveSectionVisibleSurface(isolated, basePalette.fond);
      const baseMode = resolveSectionActiveMode(settings.footer.colorModeOverride, settings.global.colorMode ?? 'dark');
      const mode = resolveSectionActiveMode(resolveSectionContrastOverride('auto', { ...isolated, sectionBackgroundEnabled: true, sectionBackgroundFill: 'solid', sectionBackgroundColor: surface, sectionBackgroundOpacity: 100 }, baseMode), baseMode);
      const palette = mode === baseMode ? basePalette : sectionFamilyPalette(settings.footer.paletteFamily, mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: mode });
      return { presentation: { ...applyHeroPaletteToFooter({ ...isolated, lockPaletteAcrossColorModes: false }, palette),
        lockPaletteAcrossColorModes: isolated.lockPaletteAcrossColorModes,
        sectionBackgroundColor: isolated.sectionBackgroundEnabled ? isolated.sectionBackgroundColor : basePalette.fond,
      }, palette: { ...palette, fond: surface }, mode };
    },
    [settings.footer, settings.global, footerPalette]
  );
  const footerPresentation = footerResolved.presentation;
  const footerReadingPalette = footerResolved.palette;
  const footerColorMode = footerResolved.mode;
  const footerHeaderReadingPalette = footerPresentation.headerBackgroundUnified && footerPresentation.sectionBackgroundEnabled ? footerReadingPalette : footerPalette;
  // Same resolved Background-tab style the main Footer section's own designs now paint
  // with (see `EditorialPortfolioFooter`'s `footerBackgroundStyle`) — the Mini bar is a
  // separate sibling element below it, so it needs its own copy of this computation to
  // stay in sync rather than owning any hardcoded canvas fill of its own.
  const footerMiniBarBackgroundStyle = useMemo(
    () => sectionBackgroundStyle(footerPresentation),
    [footerPresentation]
  );
  // The header block above the Footer (`footerHeaderBlock`) has its own root, separate from
  // the Footer body — it stays transparent over the global page wallpaper by default. Only
  // when the Background tab's "Unify header background" toggle is on does it also paint the
  // Footer's own `sectionBackground*` fill, matching `footerMiniBarBackgroundStyle` above.
  const footerHeaderBackgroundStyle = useMemo(
    () => (footerPresentation.headerBackgroundUnified ? sectionBackgroundStyle(footerPresentation) : undefined),
    [footerPresentation]
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
          if (!sectionVisibility[sectionKey] && !(sectionKey === 'contact' && settings.footer.enabled)) return null;

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
      settings.footer.enabled,
      settings.navigation.itemLabels,
      settings.navigation.itemIcons,
    ]
  );

  const pagesNavItems = useMemo(() => {
    const pages: { id: string; label: string; icon: PortfolioNavIconVariant }[] = [];
    if (settings.hero.enabled) {
      pages.push({ id: 'hero', label: t('Home'), icon: 'home' });
    }
    pages.push(...navItems);
    return pages;
  }, [navItems, settings.hero.enabled, t]);

  // Keyed on content, not identity: every settings apply from the studio dock rebuilds
  // `navItems`, and a new identity here would re-post `ready` → the dock re-sends settings →
  // another apply, looping forever.
  const footerSectionLinkOptionsKey = JSON.stringify([
    ...(settings.hero.enabled ? [{ id: 'hero', label: t('Home'), href: '#hero' }] : []),
    ...navItems.map((item) => ({ id: item.id, label: item.label, href: `#${item.id}` })),
  ]);
  const footerSectionLinkOptions = useMemo(
    () => JSON.parse(footerSectionLinkOptionsKey) as PortfolioFooterSectionLinkOption[],
    [footerSectionLinkOptionsKey]
  );

  useEffect(() => {
    if (!hideOwnerChrome || typeof window === 'undefined' || window.parent === window) return;
    // A design picker card, not the live preview: say so with our own message, so the studio's
    // live-preview listener doesn't take this iframe (and its placeholder profile) for its page.
    if (isDesignPreview) {
      window.parent.postMessage(designPreviewReadyMessage(), window.location.origin);
      return;
    }

    const meta = {
      availableTools: strengthNames,
      availableSkills: [...(profile.aboutSkills ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).filter(skill => skill.title.trim()).map(({ id, title }) => ({ id, title })),
      availableWorks: availableHeroWorks.map(({ id, title, imageUrl }) => ({ id, title, imageUrl })),
      availableServices,
      navSocialLinkOptions,
      sectionLinkOptions: footerSectionLinkOptions,
      profileAvatarUrl: profile.avatarUrl?.trim() || null,
      availableGallery: previewGalleryItems,
    };
    window.parent.postMessage(
      { source: PORTFOLIO_STUDIO_PREVIEW_SOURCE, type: 'ready', meta },
      window.location.origin
    );
  }, [
    hideOwnerChrome,
    strengthNames,
    availableHeroWorks,
    availableServices,
    navSocialLinkOptions,
    footerSectionLinkOptions,
    profile.avatarUrl,
    profile.aboutSkills,
    previewGalleryItems,
    isDesignPreview,
  ]);

  // Design picker preview: report the section's height so the card can size its frame to it.
  useEffect(() => {
    if (!isDesignPreview || typeof window === 'undefined' || window.parent === window) return;
    const root = document.querySelector<HTMLElement>('[data-design-preview-root]');
    if (!root) return;
    const report = () =>
      window.parent.postMessage(
        designPreviewSizeMessage(Math.ceil(root.getBoundingClientRect().height)),
        window.location.origin
      );
    const observer = new ResizeObserver(report);
    observer.observe(root);
    report();
    return () => observer.disconnect();
  }, [isDesignPreview]);

  // Navigation preview: the nav is fixed, so size its band to the bar itself — the same gap
  // below it as the layout leaves above it (none for full-width bars, an even margin for
  // floating ones). Re-measured a few times so entrance animations have settled.
  const isNavigationPreview = previewTarget?.section === 'navigation';
  const [navPreviewBandHeight, setNavPreviewBandHeight] = useState(48);
  // Blown up so the bar reads at card size. CSS zoom leaves media queries on the real 1280px
  // viewport, so the desktop layout is kept while the bar is laid out on a narrower width.
  useLayoutEffect(() => {
    if (!isNavigationPreview) return;
    const root = document.documentElement;
    const previous = root.style.zoom;
    root.style.zoom = String(NAV_PREVIEW_ZOOM);
    return () => {
      root.style.zoom = previous;
    };
  }, [isNavigationPreview]);
  useEffect(() => {
    if (!isNavigationPreview || typeof window === 'undefined') return;
    const measure = () => {
      let top = Infinity;
      let bottom = 0;
      document.body.querySelectorAll<HTMLElement>('*').forEach((element) => {
        if (element.tagName === 'NEXTJS-PORTAL') return;
        const style = window.getComputedStyle(element);
        // Only fixed layers with content: empty ones (the toast host, pinned to the bottom) are not the nav.
        if (style.position !== 'fixed' || element.childElementCount === 0 || element.offsetHeight === 0) return;
        const rect = element.getBoundingClientRect();
        if (rect.top > 300) return;
        top = Math.min(top, Math.max(0, rect.top));
        bottom = Math.max(bottom, rect.bottom);
      });
      if (bottom > 0) setNavPreviewBandHeight(Math.max(20, Math.ceil((bottom + top) / NAV_PREVIEW_ZOOM)));
    };
    const timers = [150, 700, 1600].map((delay) => window.setTimeout(measure, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isNavigationPreview, settings.navigation]);

  const navMode = settings.navigation.navMode ?? 'default';
  const isPagesMode = navMode === 'pages';

  // Sections the creator left out of the menu stay on the page (reached by scrolling). Pages mode
  // has no scrolling, so there every section keeps its link.
  const hiddenNavItems = settings.navigation.hiddenNavItems;
  // "When to appear" for the menu-panel layouts (the floating bar handles it itself). Pages mode
  // has no page scroll, so the bar stays.
  const panelNavVisible = useNavVisibility(settings.navigation.displayMode, isPagesMode);
  const navBarItems = useMemo(() => {
    const hidden = new Set(hiddenNavItems ?? []);
    const items = isPagesMode ? pagesNavItems : navItems.filter((item) => !hidden.has(item.id));
    return isNavigationPreview ? items.slice(0, NAV_PREVIEW_MAX_ITEMS) : items;
  }, [isPagesMode, pagesNavItems, navItems, hiddenNavItems, isNavigationPreview]);
  const isCaseOverlayNav = portfolioNavUsesCaseOverlayLayout(settings.navigation);
  const isDutenPanelNav = portfolioNavUsesDutenPanelLayout(settings.navigation);
  const isHalfPanelNav = portfolioNavUsesHalfPanelLeftLayout(settings.navigation);
  const [activePageId, setActivePageId] = useState(() => pagesNavItems[0]?.id ?? 'hero');
  const [pageSlideDirection, setPageSlideDirection] = useState<1 | -1>(1);
  const navigationSectionIds = useMemo(() => [...new Set(['hero', ...contentSectionOrder, 'footer'])], [contentSectionOrder]);
  const scrollingSectionId = useNavigationSection(navigationSectionIds, !isPagesMode);
  const navigationSectionId = isPagesMode ? activePageId : scrollingSectionId;
  const studioNavSurface = resolveStudioSplitSurface(
    heroPresentation.heroStudioSplitAccentColor?.trim() || heroPalette.principal,
    heroPresentation.heroStudioSplitAccentOpacity,
    heroPalette.fond
  );
  const heroNavPalette = heroPresentation.heroBannerDesign === 'studio-split'
    ? { ...(sectionFamilyPalette(settings.hero.paletteFamily, studioNavSurface.mode)
        ?? resolveActivePortfolioPalette({ ...settings.global, colorMode: studioNavSurface.mode })),
        fond: studioNavSurface.surface, texteFort: studioNavSurface.ink,
        texteMuted: studioNavSurface.ink }
    : heroPalette;
  const pagePalette = ({ hero: heroNavPalette, work: workReadingPalette, about: aboutPalette,
    aboutUs: aboutUsReadingPalette, info: infoPalette, experience: experienceReadingPalette,
    gallery: galleryReadingPalette, services: servicesReadingPalette, faq: faqReadingPalette,
    team: teamReadingPalette, tools: toolsReadingPalette, stack: stackReadingPalette, contact: contactReadingPalette, footer: footerReadingPalette,
  } as Record<string, typeof activeGlobalPalette>)[navigationSectionId] ?? activeGlobalPalette;
  const pageModeOverride = navigationSectionId === 'info' ? infoColorModeOverride
    : (settings[navigationSectionId as keyof typeof settings] as { colorModeOverride?: 'auto' | 'light' | 'dark' } | undefined)?.colorModeOverride;
  const navActiveColorMode = resolveSectionActiveMode(
    pageModeOverride,
    (settings.global.colorMode ?? 'dark') as 'light' | 'dark'
  );
  // Runtime-only palette: preserve the creator's saved navigation settings and DOM.
  const pageNavigationSettings = { ...settings.navigation, ...patchNavPalette(settings.navigation, pagePalette) };

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
    return pageId === 'contact';
  };

  const contactCtaHref =
    primaryLink?.url ??
    (resolvedContactEmail ? `mailto:${resolvedContactEmail}` : '#footer');
  const pagesContactTarget = sectionVisibility.contact || settings.footer.enabled
    ? 'contact'
    : lastContentPageId ?? 'contact';

  const navigateToPage = (sectionId: string) => {
    const normalized =
      sectionId === 'footer' || sectionId === 'contact' ? pagesContactTarget : sectionId;
    const targetIndex = pagesNavItems.findIndex((item) => item.id === normalized);
    if (targetIndex < 0) {
      if (lastContentPageId) {
        startTransition(() => setActivePageId(pagesContactTarget));
      }
      return;
    }
    const currentIndex = pagesNavItems.findIndex((item) => item.id === activePageId);
    startTransition(() => {
      if (currentIndex >= 0 && targetIndex !== currentIndex) {
        setPageSlideDirection(targetIndex > currentIndex ? 1 : -1);
      }
      setActivePageId(normalized);
    });
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
  const footerHeaderPresentation = footerPresentation.headerBackgroundUnified && footerPresentation.sectionBackgroundEnabled
    ? footerPresentation : applyHeroPaletteToFooter(pickFooterPresentationSettings(settings.footer), footerHeaderReadingPalette);
  const footerHeaderProps = {
    title: previewTarget?.section === 'footerHeader' ? 'Alex Martin' : profile.fullName,
    subtitle: undefined as string | undefined,
    presentation: previewTarget?.section === 'footerHeader' ? {...footerHeaderPresentation,...headerPreviewCopy('footer',t)} : footerHeaderPresentation,
    itemCount: uniqueContactLinks.length,
    ctaHref: resolvedContactEmail ? `mailto:${resolvedContactEmail}` : heroContactHref,
    locationLabel,
    timezoneId: profile.timezoneId,
  };
  // Feeds only the Mini bar catalog's 5 "design-origin" variants (Landing/Contact CTA/Hero
  // columns/Inverted wordmark/Services reveal) — see footer-minibar-catalog-extraction memory.
  const footerMiniBarCopyrightText = resolveFooterCopyrightLabel(footerPresentation.copyrightLabel, profile.fullName);
  const footerHeaderBlock =
    footerPresentation.headerDesign === 'none' ? null : footerPresentation.headerDesign === 'index' ? (
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
    : sectionVisibility.contact || settings.footer.enabled
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
  /** The sections' column: Content width caps it (centred), Side margins pad it. Full-bleed
   *  section backgrounds break out of it on their own (w-screen layers). */
  const contentShellClass = `mx-auto ${globalWidthClass} ${editorialShellClass}`;
  const titleScrollBehavior = settings.global.titleScroll;
  const effectiveTitleScroll = titleScrollBehavior;
  const motionEnabled = settings.global.motionEnabled !== false;
  // Before any child renders: effects run child-first, so this must happen during render.
  setPortfolioMotionOff(isDesignPreview || !motionEnabled);
  const motionProfile = motionEnabled ? settings.global.motionProfile : 'none';
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
    return {
      title: { ...title, style: { ...title.style, color: aboutUsPresentation.titleColor } },
      subtitle: { ...subtitle, style: { ...subtitle.style, color: aboutUsPresentation.subtitleColor } },
    };
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
        style: { ...title.style, color: contactPresentation.titleColor },
      },
      subtitle: { ...subtitle, style: { ...subtitle.style, color: contactPresentation.subtitleColor } },
    };
  }, [settings.global, contactPresentation, globalTypographyContext]);

  const aboutSideInfoItems = useMemo(() => {
    const items = [];

    if (locationLabel && isAboutSideInfoItemVisible('location', settings.about)) {
      items.push({
        id: 'location',
        icon: SIDE_INFO_ICONS.location,
        label: t('Location'),
        title: locationLabel,
        subtitle:
          profile.timezoneId
            ? `${profile.timezoneId.replace(/_/g, ' ')}${availabilityDisplay ? ' · Available remotely' : ''}`
            : availabilityDisplay
              ? t('Available remotely')
              : undefined,
      });
    }

    if (languageCount > 0 && isAboutSideInfoItemVisible('languages', settings.about)) {
      items.push({
        id: 'languages',
        icon: SIDE_INFO_ICONS.languages,
        label: t('Languages'),
        // Single line so horizontal layouts stay bottom-aligned with other 2-line cells.
        title: languageList.join(', '),
      });
    }

    if (profile.gender?.trim() && isAboutSideInfoItemVisible('gender', settings.about)) {
      items.push({
        id: 'gender',
        icon: SIDE_INFO_ICONS.gender,
        label: t('Gender'),
        title: profile.gender,
      });
    }

    if (memberSinceLabel && isAboutSideInfoItemVisible('member-since', settings.about)) {
      items.push({
        id: 'member-since',
        icon: SIDE_INFO_ICONS.memberSince,
        label: t('Member since'),
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
        label: t('Availability'),
        title: profile.isAvailable === false ? t('Currently unavailable') : (availabilityDisplay ?? ''),
        lines: availabilityLines,
        subtitle:
          profile.isAvailable !== false &&
          profile.responseTimeLabel?.trim() &&
          settings.about.showSidePanelResponseTime
            ? t('Reply {toLowerCase}', { toLowerCase: profile.responseTimeLabel.toLowerCase() })
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
        // mechanism as Portfolio/Work, Stack, Tools, and Contact). Count = info blocks actually on
        // the page (populated, switched on, and drawn by the chosen design), used by 3 of the designs.
        const infoBlocks = resolveInfoVisibleBlocks(infoPresentation);
        const infoHeaderItemCount = [
          infoBlocks.skills && (profile.aboutSkills?.length ?? 0) > 0,
          infoBlocks.strengths && (profile.aboutStrengths?.length ?? 0) > 0,
          infoBlocks.interests && (profile.aboutInterests?.length ?? 0) > 0,
          infoBlocks.languages &&
            ((profile.spokenLanguages?.length ?? 0) > 0 || (profile.languages?.length ?? 0) > 0),
          infoBlocks.education && (profile.aboutEducation?.length ?? 0) > 0,
          infoBlocks.systemsTools && (profile.aboutSystemsTools?.length ?? 0) > 0,
        ].filter(Boolean).length;
        const infoHeaderProps = {
          title: infoSectionTitle,
          // About · manifesto shows the subtitle as its own statement — never twice.
          subtitle:
            infoPresentation.design === 'about-manifesto' ? undefined : infoSectionSubtitle || undefined,
          presentation: infoPresentation,
          itemCount: infoHeaderItemCount,
        };
        const infoHeaderBlock =
          infoPresentation.headerDesign === 'none' ? null : infoPresentation.headerDesign === 'marquee' ? (
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
        if (previewTarget?.section === 'infoHeader') {
          return (
            <div id="info" className="flex min-h-[480px] w-full items-center justify-center" style={{ ...portfolioPaletteCssVars(infoPalette), backgroundColor: infoPalette.fond }}>
              <div className={infoHeaderPreviewStyles.preview} data-info-header-preview={infoPresentation.headerDesign} style={{ width: '86%' }}>{infoHeaderBlock}</div>
            </div>
          );
        }
        return (
          <PortfolioSectionShell
            id="info"
            // A section in its own mode re-scopes the palette tokens, so token-driven pieces
            // (the shared header) follow it instead of the Global palette on the theme root.
            cssVars={infoColorModeOverride === 'auto' && (settings.info.paletteFamily ?? 'global') === 'global' ? undefined : portfolioPaletteCssVars(infoPalette)}
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
            <div data-info-bio-font={infoPresentation.bioFontFamily} className={`contents pf-info-bio-format${infoPresentation.bioColor || (infoPresentation.bioOpacity ?? 100) !== 100 ? ' pf-info-bio-custom-color' : ''}${infoPresentation.bioFontSize ? ' pf-info-bio-custom-size' : ''}${infoPresentation.bioBold ? ' pf-info-bio-bold' : ''}${infoPresentation.bioItalic ? ' pf-info-bio-italic' : ''}${infoPresentation.bioLineHeight ? ' pf-info-bio-spacing' : ''}`} style={{ '--info-bio-color': infoPresentation.bioColor === 'principal' ? 'var(--pf-palette-principal)' : infoPresentation.bioColor === 'texteMuted' ? 'var(--pf-palette-texte-muted, #a3a3a3)' : infoPresentation.bioColor === 'texteFort' ? 'var(--pf-palette-texte-fort)' : infoPresentation.bodyColor, '--info-bio-opacity': (infoPresentation.bioOpacity ?? 100) / 100, '--info-bio-line-height': infoPresentation.bioLineHeight, '--info-bio-font-size': infoPresentation.bioFontSize ? infoPresentation.bioFontSize + 'px' : undefined, '--info-default-font-family': infoPresentation.titleFont === 'serif' ? "ui-serif, Georgia, 'Times New Roman', serif" : undefined } as CSSProperties}>
            <EditorialAboutMeSection
              title={infoSectionTitle}
              subtitle={infoSectionSubtitle}
              bio={formatInfoBio(infoPresentation.bioCustom?.trim() || profile.bio || '', infoPresentation.bioCase)}
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
            </div>
          </PortfolioSectionShell>
        );
      }
      case 'work': {
        const layout = workPresentation.sectionLayout ?? 'stacked';
        const aside = faqSectionLayoutIsAside(layout);
        const workDesign = workPresentation.sectionDesign;
        const previewCount = ['projects-index', 'projects-duotone', 'projects-frames', 'projects-case', 'projects-split'].includes(workDesign) ? 1 : ['projects-grid', 'projects-accordion', 'projects-carousel', 'projects-showcase', 'projects-ledger', 'projects-spec'].includes(workDesign) ? 3 : 2;
        const designItems = previewTarget?.section === 'work'
          ? workSectionItems.slice(0, previewCount).map(item => ({ ...item, description: item.description?.slice(0, 100) ?? null, toolsUsed: item.toolsUsed?.slice(0, 2) }))
          : workSectionItems;
        const projectsBoard = workDesign === 'projects-board';
        const projectsAccordion = workDesign === 'projects-accordion';
        const projectsFrames = workDesign === 'projects-frames';
        const projectsIndex = workDesign === 'projects-index';
        const projectsGrid = workDesign === 'projects-grid';
        const projectsSplit = workDesign === 'projects-split';
        const projectsCarousel = workDesign === 'projects-carousel';
        const projectsShowcase = workDesign === 'projects-showcase';
        const projectsLedger = workDesign === 'projects-ledger';
        const projectsSpec = workDesign === 'projects-spec';
        const projectsCase = workDesign === 'projects-case';
        const projectsPress = workDesign === 'projects-press';
        const projectsDuotone = workDesign === 'projects-duotone';
        const projectsCascade = workDesign === 'projects-cascade';
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
        // One shared, GSAP-animated header design (Header → Design) mounts above every
        // project layout — no per-layout header is baked in here anymore.
        const workHeaderProps = {
          sectionTitle: workSectionTitle,
          sectionSubtitle: workSectionSubtitle || undefined,
          presentation: workPresentation,
        };
        const workHeaderCountProps = { ...workHeaderProps, projectCount: workItems.length };
        const headerBlock = workPresentation.headerDesign === 'none' ? null : (
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
        if (previewTarget?.section === 'workHeader') {
          return (
            <div id="work" className="flex min-h-[480px] w-full items-center justify-center" style={{...portfolioPaletteCssVars(workReadingPalette),backgroundColor:workReadingPalette.fond}}>
              <div className={workHeaderPreviewStyles.preview} data-work-header-preview={workPresentation.headerDesign} style={{width:'86%'}}>{headerBlock}</div>
            </div>
          );
        }
        const contentBlock = (
          <WorkTextScale size={settings.work.textSize}>
          <SectionIllustratedContent
            variant={namedWorkDesign ? 'none' : workPresentation.illustrationVariant}
            placement={workPresentation.illustrationPlacement}
            accent={workPresentation.ctaColor}
            ink={workPresentation.titleColor}
            surface={workPresentation.cardBackgroundColor}
          >
            {projectsBoard ? (
              <ProjectsBoardGallery
                items={designItems}
                presentation={workPresentation}
              />
            ) : projectsAccordion ? (
              <ProjectsAccordionGallery items={designItems} presentation={workPresentation} />
            ) : projectsFrames ? (
              <ProjectsFramesGallery items={designItems} presentation={workPresentation} />
            ) : projectsIndex ? (
              <ProjectsIndexGallery items={designItems} presentation={workPresentation} />
            ) : projectsGrid ? (
              <ProjectsGridSection items={designItems} presentation={workPresentation} />
            ) : projectsCarousel ? (
              <ProjectsCarouselSection
                title={workSectionTitle}
                items={designItems}
                presentation={workPresentation}
              />
            ) : projectsShowcase ? (
              <ProjectsShowcaseGallery items={designItems} presentation={workPresentation} />
            ) : projectsLedger ? (
              <ProjectsLedgerGallery items={designItems} presentation={workPresentation} />
            ) : projectsSpec ? (
              <ProjectsSpecGallery items={designItems} presentation={workPresentation} />
            ) : projectsCase ? (
              <ProjectsCaseGallery items={designItems} presentation={workPresentation} />
            ) : projectsPress ? (
              <ProjectsPressGallery items={designItems} presentation={workPresentation} />
            ) : projectsDuotone ? (
              <ProjectsDuotoneGallery items={designItems} presentation={workPresentation} />
            ) : projectsCascade ? (
              <ProjectsCascadeGallery items={designItems} presentation={workPresentation} colorMode={workColorMode} />
            ) : projectsSplit ? (
              <ProjectsSplitGallery items={designItems} presentation={workPresentation} />
            ) : (
              <EditorialWorkGallery
                items={designItems}
                presentation={workPresentation}
                motionProfile={motionProfile}
              />
            )}
          </SectionIllustratedContent>
          </WorkTextScale>
        );
        if (previewTarget?.section === 'work') {
          return (
            <PortfolioSectionShell id="work" cssVars={portfolioPaletteCssVars(workReadingPalette)}
              background={workPresentation} fitContent
              suppressBackground={suppressSectionBackground(workPresentation)}
              topSpacingClass="pt-0" bottomSpacingClass="pb-0">
              <div className="flex min-h-[640px] w-full items-center py-10"><div className="w-full">{contentBlock}</div></div>
            </PortfolioSectionShell>
          );
        }
        return (
          <PortfolioSectionShell
            id="work"
            // Same as Info: a section in its own mode re-scopes the palette tokens, so the
            // token-driven Work headers (var(--pf-palette-*)) follow it, not the Global palette.
            cssVars={portfolioPaletteCssVars(workReadingPalette)}
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
        const cataloguePreview=previewTarget?.section==='services';
        const rowPreview=['services-pricing-toggle','services-index-list','services-band-index','services-cascade'].includes(servicesPresentation.sectionDesign);
        const services=cataloguePreview?(profile.profileServices??[]).slice(0,rowPreview?1:servicesPresentation.sectionDesign==='services-icon-cards'?2:3).map(service=>({...service,description:servicesPresentation.sectionDesign.startsWith('services-pricing')?'':service.description,tasks:service.tasks?.slice(0,1)})):profile.profileServices??[];
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
          servicesPresentation.headerDesign === 'none' ? null : servicesPresentation.headerDesign === 'marquee' ? (
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
        const servicesDesign = servicesPresentation.sectionDesign;
        const servicesPricingCards = servicesDesign === 'services-pricing';
        const servicesPricingAurora = servicesDesign === 'services-pricing-aurora';
        const servicesPricingToggle = servicesDesign === 'services-pricing-toggle';
        const servicesIndexList = servicesDesign === 'services-index-list';
        const servicesMediaColumns = servicesDesign === 'services-media-columns';
        const servicesIconCards = servicesDesign === 'services-icon-cards';
        const servicesBandIndex = servicesDesign === 'services-band-index';
        const servicesCascade = servicesDesign === 'services-cascade';
        const servicesCapabilities = servicesDesign === 'services-capabilities';
        const namedServicesDesign =
          servicesCapabilities ||
          servicesIconCards ||
          servicesBandIndex ||
          servicesCascade ||
          servicesMediaColumns ||
          servicesIndexList ||
          servicesPricingCards ||
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
                <div className={servicesContentStyles.content}>
                <ServicesBackgroundFrame presentation={servicesPresentation}>
                {servicesMediaColumns ? (
                  <ServicesMediaColumnsSection services={services} presentation={servicesPresentation} />
                ) : servicesIconCards ? (
                  <ServicesIconCardsSection services={services} presentation={servicesPresentation} />
                ) : servicesBandIndex ? (
                  <ServicesBandIndexSection services={services} presentation={servicesPresentation} />
                ) : servicesCascade ? (
                  <ServicesCascadeSection services={services} presentation={servicesPresentation} />
                ) : servicesCapabilities ? (
                  <ServicesCapabilitiesSection services={services} presentation={servicesPresentation} />
                ) : servicesPricingCards ? (
                  <ServicesPricingCardsSection services={services} presentation={servicesPresentation} />
                ) : servicesPricingAurora ? (
                  <ServicesPricingAuroraSection services={services} presentation={servicesPresentation} />
                ) : servicesPricingToggle ? (
                  <ServicesPricingToggleSection services={services} presentation={servicesPresentation} />
                ) : (
                  <ServicesIndexListSection services={services} presentation={servicesPresentation} />
                )}
                </ServicesBackgroundFrame>
                </div>
                {services.length === 0 ? (
                  <p className="mt-8 text-base leading-relaxed text-neutral-500">
                    {t('Contact me to discuss a custom engagement.')}
                  </p>
                ) : null}
              </>
            </SectionIllustratedContent>
          </ServicesOrderCtaHrefProvider>
        );

        // General tab "Font size" — one scale read by every Services design via
        // `--pf-services-font-scale` (see the standardized override block in globals.css).
        const servicesFontScaleVars: CSSProperties = {
          ...portfolioPaletteCssVars(servicesReadingPalette),
          '--pf-services-font-scale': servicesPremiumFontScale(servicesPresentation.premiumFontSize),
        } as CSSProperties;

        if(cataloguePreview){
          return <PortfolioSectionShell id="services" cssVars={servicesFontScaleVars} background={servicesPresentation} fitContent suppressBackground={suppressSectionBackground(servicesPresentation)} topSpacingClass="pt-0" bottomSpacingClass="pb-0">
            <div className="flex min-h-[426px] w-full items-center py-4"><div className={`${servicesCatalogueStyles.preview} w-full`} data-services-design-preview={servicesDesign}>{servicesContentBlock}</div></div>
          </PortfolioSectionShell>;
        }
        if (previewTarget?.section === 'servicesHeader') {
          return (
            <div id="services" className="flex min-h-[480px] w-full items-center justify-center" style={{...servicesFontScaleVars,backgroundColor:servicesReadingPalette.fond}}>
              <div className={servicesHeaderPreviewStyles.preview} data-services-header-preview={servicesPresentation.headerDesign} style={{width:'86%'}}>
                {servicesHeaderBlock}
              </div>
            </div>
          );
        }

        return (
          <PortfolioSectionShell
            id="services"
            cssVars={servicesFontScaleVars}
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
        const appliedHeaderDesign = experiencePresentation.headerDesign ?? 'none';
        const showAppliedHeaderZone = experienceHeaderDesignIsApplied(
          appliedHeaderDesign,
          experiencePresentation.experienceDesign
        );
        const wrapAppliedExperienceHeader = (node: ReactNode) => (
          <div className="pf-exp-applied-header relative w-full" style={portfolioPaletteCssVars(experienceReadingPalette)}>{node}</div>
        );
        const experienceHeaderProps = {
          title: experienceSectionTitle,
          subtitle: experienceSectionSubtitle || undefined,
          presentation: experiencePresentation,
          itemCount: experienceBlocks.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        let appliedExperienceHeaderZone: ReactNode = null;
        if (showAppliedHeaderZone) {
          switch (appliedHeaderDesign) {
            case 'marquee':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderMarqueeHeader {...experienceHeaderProps} />);
              break;
            case 'index':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderIndexHeader {...experienceHeaderProps} />);
              break;
            case 'accent-count':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderAccentCountHeader {...experienceHeaderProps} />);
              break;
            case 'serif-lead':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderSerifLeadHeader {...experienceHeaderProps} />);
              break;
            case 'billboard':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderBillboardHeader {...experienceHeaderProps} />);
              break;
            case 'masthead':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderMastheadHeader {...experienceHeaderProps} />);
              break;
            case 'split-heading':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderSplitHeadingHeader {...experienceHeaderProps} />);
              break;
            case 'editorial':
              appliedExperienceHeaderZone = wrapAppliedExperienceHeader(<ExperienceHeaderEditorialHeader {...experienceHeaderProps} />);
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

        // General tab "Font size" — one scale read by every Experience design via
        // `--pf-experience-font-scale` (see the standardized override block in globals.css).
        const experienceFontScaleVars: CSSProperties = {
          '--pf-experience-font-scale': experiencePremiumFontScale(experiencePresentation.premiumFontSize),
        } as CSSProperties;

        if (previewTarget?.section === 'experienceHeader') {
          return (
            <div
              id="experience"
              className="flex min-h-[480px] w-full items-center justify-center"
              style={{...experienceFontScaleVars,...portfolioPaletteCssVars(experiencePalette),backgroundColor:experiencePalette.fond}}
            >
              <div className={experienceHeaderPreviewStyles.preview} data-experience-header-preview={appliedHeaderDesign} style={{width:'86%'}}>
                {appliedExperienceHeaderZone}
              </div>
            </div>
          );
        }

        if (previewTarget?.section === 'experience') {
          const design = experiencePresentation.experienceDesign;
          const single = ['kinetic', 'reel', 'duotone', 'legacy', 'cards'].includes(design);
          const blocks = experienceBlocks.slice(0, single ? 1 : 2).map(block => ({
            ...block,
            tasks: block.tasks?.slice(0, 2),
            tools: block.tools?.slice(0, 2),
            links: [],
          }));
          const props = { blocks, presentation: experiencePresentation, motionProfile };
          const content = design === 'kinetic' ? <KineticExperienceList {...props} />
            : design === 'reel' ? <ReelExperienceList {...props} />
            : design === 'duotone' ? <DuotoneExperienceList {...props} />
            : design === 'gallery' ? <GalleryExperienceList {...props} />
            : design === 'loft' ? <LoftExperienceList {...props} />
            : design === 'press' ? <PressExperienceList {...props} />
            : design === 'legacy' ? <LegacyExperienceList {...props} />
            : design === 'milestone' ? <MilestoneExperienceList {...props} />
            : design === 'table' ? <TableExperienceList {...props} />
            : design === 'cards' ? <CardsExperienceList {...props} />
            : <EditorialExperienceList {...props} />;
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              cssVars={{ '--pf-experience-font-scale': experiencePremiumFontScale(experiencePresentation.premiumFontSize) * (design === 'kinetic' ? 1.2 : 1.55) } as CSSProperties}
              background={experiencePresentation}
              fitContent
              suppressBackground={suppressSectionBackground(experiencePresentation)}
              topSpacingClass="pt-0"
              bottomSpacingClass="pb-0"
            >
              <div className={`${experienceCatalogueStyles.preview} pf-experience-catalogue-preview flex min-h-[800px] w-full items-center py-10`}>
                <div className="w-full">{content}</div>
              </div>
            </PortfolioSectionShell>
          );
        }
        if (experiencePresentation.experienceDesign === 'reel') {
          return wrapExperienceLinks(
            <PortfolioSectionShell
              id="experience"
              cssVars={experienceFontScaleVars}
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
              cssVars={experienceFontScaleVars}
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
              cssVars={experienceFontScaleVars}
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
              cssVars={experienceFontScaleVars}
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
              cssVars={experienceFontScaleVars}
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
              cssVars={experienceFontScaleVars}
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
              cssVars={experienceFontScaleVars}
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
            cssVars={experienceFontScaleVars}
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
            className={`${aboutUsContentStyles.header} ${aside ? 'mb-0 w-full' : ''}`}
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
            ctaHref={navContactHref}
            onCtaNavigate={onServicesOrderCtaNavigate}
          />
        );
        return (
          <PortfolioSectionShell
            id="aboutUs"
            cssVars={portfolioPaletteCssVars(aboutUsReadingPalette)}
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
          teamPresentation.headerDesign === 'none' ? null : teamPresentation.headerDesign === 'marquee' ? (
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
            <EditorialTeamGallery
              members={teamMembers}
              presentation={teamPresentation}
              contentGutter={settings.global.contentGutter}
            />
          </SectionIllustratedContent>
        );
        // General tab "Font size" — one scale read by every member-facing text size across the
        // ten Team designs via `--pf-team-font-scale`.
        const teamFontScaleVars: CSSProperties = {
          ...portfolioPaletteCssVars(teamReadingPalette),
          '--pf-team-font-scale': teamPremiumFontScale(teamPresentation.premiumFontSize),
        } as CSSProperties;
        if (previewTarget?.section === 'teamHeader') {
          return (
            <div
              id="team"
              className="flex min-h-[480px] w-full items-center justify-center"
              style={{...teamFontScaleVars,backgroundColor:teamReadingPalette.fond}}
            >
              <div
                className={teamHeaderPreviewStyles.preview}
                data-team-header-preview={teamPresentation.headerDesign}
                style={{width:'86%'}}
              >
                {headerBlock}
              </div>
            </div>
          );
        }
        return (
          <PortfolioSectionShell
            id="team"
            cssVars={teamFontScaleVars}
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
          galleryPresentation.headerDesign === 'none' ? null : gallerySectionTitle || gallerySectionSubtitle ? (
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
        // General tab "Font size" — one scale read by `.pf-gallery-media-title*` and the
        // lightbox caption via `--pf-gallery-font-scale` (see globals.css).
        const galleryFontScaleVars: CSSProperties = {
          ...portfolioPaletteCssVars(galleryReadingPalette),
          '--pf-gallery-font-scale': galleryPremiumFontScale(galleryPresentation.premiumFontSize),
        } as CSSProperties;
        if (previewTarget?.section === 'galleryHeader') {
          return (
            <div
              id="gallery"
              className="flex min-h-[480px] w-full items-center justify-center"
              style={{...galleryFontScaleVars,backgroundColor:galleryReadingPalette.fond}}
            >
              <div
                className={galleryHeaderPreviewStyles.preview}
                data-gallery-header-preview={galleryPresentation.headerDesign}
                style={{width:'86%'}}
              >
                {headerBlock}
              </div>
            </div>
          );
        }
        return (
          <PortfolioSectionShell
            id="gallery"
            cssVars={galleryFontScaleVars}
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
        const faqPalette = faqReadingPalette;
        // These designs own their layout: a persisted aside setting must not select the generic list.
        const faqAside = faqPresentation.design !== 'editorial-masonry' &&
          faqPresentation.design !== 'prism-cards' &&
          faqPresentation.design !== 'tri-grid' &&
          faqPresentation.design !== 'split-index' &&
          faqPresentation.design !== 'centered-focus' &&
          faqPresentation.design !== 'bento-dual' &&
          faqSectionLayoutIsAside(faqPresentation.sectionLayout ?? 'stacked');
        // Every bespoke FAQ design (see each component's own portfolio-faq-*.tsx file)
        // embeds the shared Header block inside its own layout, same as the aside layout —
        // never the shell's own top header slot.
        const faqKinetic = faqPresentation.design === 'kinetic-split';
        const faqFloatingGallery = faqPresentation.design === 'floating-gallery';
        const faqMasonry = faqPresentation.design === 'editorial-masonry';
        const faqPrismCards = faqPresentation.design === 'prism-cards';
        const faqTriGrid = faqPresentation.design === 'tri-grid';
        const faqSplitIndex = faqPresentation.design === 'split-index';
        const faqCenteredFocus = faqPresentation.design === 'centered-focus';
        const faqBentoDual = faqPresentation.design === 'bento-dual';
        const faqBespokeDesign =
          faqKinetic ||
          faqFloatingGallery ||
          faqMasonry ||
          faqPrismCards ||
          faqTriGrid ||
          faqSplitIndex ||
          faqCenteredFocus ||
          faqBentoDual;
        // Header — mounts above the section, independent of the Design tab's own per-design
        // layout. 7 of the original 8 editorial layouts (same mechanism as Portfolio/Work,
        // Stack, Tools, Contact, Team, Gallery, and Info) are frozen — still rendered for any
        // account that already has one saved, but no longer selectable from FAQ's own settings
        // UI (see faq-settings-header-removed-pill-tabs memory). FAQ's Header tab now offers 4
        // designs: 'editorial' (the original classic layout, re-exposed) plus 3 newer,
        // purpose-built ones — 'signal' | 'query' | 'dialogue' (see
        // faq-header-tab-3-new-designs memory).
        const faqHeaderProps = {
          title: previewTarget?.section === 'faqHeader' ? t('Your questions, our answers.') : faqSectionTitle,
          subtitle: previewTarget?.section === 'faqHeader' ? t('The essentials for moving forward together.') : faqSectionSubtitle || undefined,
          presentation: faqPresentation,
          itemCount: faqItems.length,
        };
        const faqHeaderBlock =
          faqPresentation.headerDesign === 'none' ? null : faqPresentation.headerDesign === 'marquee' ? (
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
          ) : faqPresentation.headerDesign === 'signal' ? (
            <FaqHeaderSignalHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'query' ? (
            <FaqHeaderQueryHeader {...faqHeaderProps} />
          ) : faqPresentation.headerDesign === 'dialogue' ? (
            <FaqHeaderDialogueHeader {...faqHeaderProps} />
          ) : (
            <FaqHeaderEditorialHeader {...faqHeaderProps} />
          );
        // Header placement. A design renders the header itself only when the creator's position is its native
        // one (Kinetic split: left, the others: top); any other position puts the header outside it.
        const faqHeaderPosition = resolveFaqHeaderPosition(faqPresentation.headerPosition, faqPresentation.design);
        const faqHeaderExternal =
          Boolean(faqHeaderBlock) &&
          faqBespokeDesign &&
          !faqAside &&
          faqHeaderPosition !== (faqKinetic ? 'left' : 'top');
        const faqDesignHeader = faqHeaderExternal ? undefined : faqHeaderBlock;
        if (previewTarget?.section === 'faqHeader') {
          return (
            <div id="faq" className="flex min-h-[480px] w-full items-center justify-center" style={{...portfolioPaletteCssVars(faqPalette),backgroundColor:faqPalette.fond}}>
              <div className={faqHeaderPreviewStyles.preview} data-faq-header-preview={faqPresentation.headerDesign} style={{width:'86%'}}>{faqHeaderBlock}</div>
            </div>
          );
        }
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

        if (previewTarget?.section === 'faq') {
          const previewItems = faqItems.slice(0, faqKinetic ? 3 : 4);
          const previewProps = { items: previewItems, header: faqHeaderBlock, fontSizeScale: faqFontSizeScale * 1.1, activeColorMode: faqActiveColorMode };
          const previewContent = faqKinetic ? <FaqKineticSplitDesign {...previewProps} />
            : faqFloatingGallery ? <FaqFloatingGalleryDesign {...previewProps} />
            : faqMasonry ? <FaqEditorialMasonryDesign {...previewProps} />
            : faqPrismCards ? <FaqPrismCardsDesign {...previewProps} />
            : faqTriGrid ? <FaqTriGridDesign {...previewProps} />
            : faqSplitIndex ? <FaqSplitIndexDesign {...previewProps} />
            : faqCenteredFocus ? <FaqCenteredFocusDesign {...previewProps} />
            : faqBentoDual ? <FaqBentoDualDesign {...previewProps}
                cardColor={faqPalette[faqPresentation.bentoDualCardColorToken]}
                cardRadius={faqPresentation.bentoDualCardRadius}
                cardBorder={faqPresentation.bentoDualCardBorder}
                cardOpacity={faqPresentation.bentoDualCardOpacity}
                cardsStyle={faqPresentation.cardsStyle}
                palette={faqPalette}
              /> : faqListBlock;
          return (
            <PortfolioSectionShell
              id="faq"
              background={faqPresentation}
              cssVars={portfolioPaletteCssVars(faqReadingPalette)}
              fitContent
              suppressBackground={suppressSectionBackground(faqPresentation)}
              topSpacingClass="pt-0"
              bottomSpacingClass="pb-0"
            >
              <div className="flex min-h-[640px] w-full items-center justify-center overflow-hidden">
                <div className="w-full">
                  <FaqDesignFrame frame={faqDesignAllowsFrame(faqPresentation.design) ? faqPresentation.designFrame : { ...faqPresentation.designFrame, enabled: false }} textColors={faqTextColorVars(faqPresentation)} marker={faqPresentation.questionMarker ?? 'auto'}>
                    {previewContent}
                  </FaqDesignFrame>
                </div>
              </div>
            </PortfolioSectionShell>
          );
        }
        return (
          <PortfolioSectionShell
            id="faq"
            background={faqPresentation}
            cssVars={portfolioPaletteCssVars(faqReadingPalette)}
            fitContent
            suppressBackground={suppressSectionBackground(faqPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            topSpacingStyle={sectionTopSpacingStyle}
            bottomSpacingClass={sectionBottomSpacingClass}
            bottomSpacingStyle={sectionBottomSpacingStyle}
            header={faqAside || faqBespokeDesign ? undefined : faqHeaderBlock}
          >
            <FaqDesignFrame frame={faqDesignAllowsFrame(faqPresentation.design) ? faqPresentation.designFrame : { ...faqPresentation.designFrame, enabled: false }} textColors={faqTextColorVars(faqPresentation)} marker={faqPresentation.questionMarker ?? 'auto'}>
            <FaqHeaderPlacement position={faqHeaderExternal ? faqHeaderPosition : null} header={faqHeaderBlock}>
            {faqAside ? (
              <SectionAsideContent
                layout={faqPresentation.sectionLayout ?? 'aside-left'}
                header={faqHeaderBlock}
              >
                {faqListBlock}
              </SectionAsideContent>
            ) : faqKinetic ? (
              <FaqKineticSplitDesign items={faqItems} header={faqDesignHeader} fontSizeScale={faqFontSizeScale} />
            ) : faqFloatingGallery ? (
              <FaqFloatingGalleryDesign items={faqItems} header={faqDesignHeader} fontSizeScale={faqFontSizeScale} />
            ) : faqMasonry ? (
              <FaqEditorialMasonryDesign items={faqItems} header={faqDesignHeader} fontSizeScale={faqFontSizeScale} />
            ) : faqPrismCards ? (
              <FaqPrismCardsDesign
                items={faqItems}
                header={faqDesignHeader}
                activeColorMode={faqActiveColorMode}
                fontSizeScale={faqFontSizeScale}
              />
            ) : faqTriGrid ? (
              <FaqTriGridDesign
                items={faqItems}
                header={faqDesignHeader}
                activeColorMode={faqActiveColorMode}
                fontSizeScale={faqFontSizeScale}
              />
            ) : faqSplitIndex ? (
              <FaqSplitIndexDesign
                items={faqItems}
                header={faqDesignHeader}
                activeColorMode={faqActiveColorMode}
                fontSizeScale={faqFontSizeScale}
              />
            ) : faqCenteredFocus ? (
              <FaqCenteredFocusDesign
                items={faqItems}
                header={faqDesignHeader}
                activeColorMode={faqActiveColorMode}
                fontSizeScale={faqFontSizeScale}
              />
            ) : faqBentoDual ? (
              <FaqBentoDualDesign
                items={faqItems}
                header={faqDesignHeader}
                activeColorMode={faqActiveColorMode}
                fontSizeScale={faqFontSizeScale}
                cardColor={faqPalette[faqPresentation.bentoDualCardColorToken]}
                cardRadius={faqPresentation.bentoDualCardRadius}
                cardBorder={faqPresentation.bentoDualCardBorder}
                cardOpacity={faqPresentation.bentoDualCardOpacity}
                cardsStyle={faqPresentation.cardsStyle}
                palette={faqPalette}
              />
            ) : (
              faqListBlock
            )}
            </FaqHeaderPlacement>
            </FaqDesignFrame>
          </PortfolioSectionShell>
        );
      }
      case 'contact':
        return (
          <EditorialContactSection
            pageNavigation={isDesignPreview || isPagesMode}
            previewFontScale={isDesignPreview ? 1.1 : 1}
            creatorId={creatorId}
            email={resolvedContactEmail || null}
            phone={profile.phone}
            locationLabel={locationLabel}
            links={isDesignPreview ? uniqueContactLinks.slice(0, 3) : uniqueContactLinks}
            ctaHref={contactCtaHref}
            responseTimeLabel={profile.responseTimeLabel}
            heroImageUrl={profile.avatarUrl}
            heroImageAlt={profile.fullName}
            contentGutter={settings.global.contentGutter}
            globalColorMode={contactPresentation.activeColorMode}
            paletteCssVars={portfolioPaletteCssVars(contactReadingPalette)}
            sectionTitle={contactSectionTitle}
            sectionSubtitle={contactSectionSubtitle || undefined}
            presentation={contactPresentation}
            motionProfile={motionProfile}
            topSpacingClass={isDesignPreview ? 'pt-0' : sectionTopSpacingClass}
            topSpacingStyle={isDesignPreview ? undefined : sectionTopSpacingStyle}
            bottomSpacingClass={isDesignPreview ? 'pb-0' : sectionBottomSpacingClass}
            bottomSpacingStyle={isDesignPreview ? undefined : sectionBottomSpacingStyle}
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
                    {t('Sign in')}
                  </Link>{' '}
                  {t('to see more contact details.')}
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
        const headerBlock = stackPresentation.headerDesign === 'none' ? null : (
          <div
            className={stackAside ? 'w-full' : undefined}
            style={portfolioPaletteCssVars(stackReadingPalette)}
          >
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
        const stackGallery = <SectionContentTextScale size={settings.stack.textSize}><EditorialStackGallery items={stackItems} presentation={stackPresentation} /></SectionContentTextScale>;
        if (previewTarget?.section === 'stackHeader') {
          return (
            <div id="stack" className="flex min-h-[480px] w-full items-center justify-center" style={{ ...portfolioPaletteCssVars(stackPalette), backgroundColor: stackPalette.fond }}>
              <div className={stackHeaderPreviewStyles.preview} data-stack-header-preview={stackPresentation.headerDesign} style={{ width: '86%' }}>{headerBlock}</div>
            </div>
          );
        }
        if (previewTarget?.section === 'stack') {
          const design = stackPresentation.design;
          const indexPreview = design === 'brand-index';
          const rows = ['brand-index', 'level-progress-rows', 'level-category-rows', 'level-table-rows', 'level-star-cards'].includes(design);
          const count = design === 'workflow-rail' ? 5 : design === 'stack-tags' || design === 'level-bento-categories' ? 6 : indexPreview ? 2 : rows ? 3 : 4;
          const items = stackItems.slice(0, count).map(item => indexPreview
            ? typeof item === 'string'
              ? { name: item, description: t('Development and integration') }
              : { ...item, description: item.description?.trim() || item.useCases?.slice(0, 2).join(' · ') || t('Development and integration') }
            : item);
          return (
            <PortfolioSectionShell
              id="stack"
              background={stackPresentation}
              fitContent
              suppressBackground={suppressSectionBackground(stackPresentation)}
              topSpacingClass="pt-0"
              bottomSpacingClass="pb-0"
            >
              <div className="flex min-h-[426px] w-full items-center py-4">
                <div className={`${stackCatalogueStyles.preview} w-full [&_.pf-stack-brand-index-name]:!text-[2.75rem] [&_.pf-stack-brand-index-description]:!text-[1.5rem] [&_.pf-stack-brand-index-description]:!leading-relaxed`}>
                  <EditorialStackGallery items={items} presentation={{ ...stackPresentation, sectionLayout: 'stacked', showDescription: indexPreview, showCategory: indexPreview ? false : stackPresentation.showCategory, showUseCases: false }} />
                </div>
              </div>
            </PortfolioSectionShell>
          );
        }
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
            cssVars={portfolioPaletteCssVars(stackReadingPalette)}
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
        const toolsAside = toolsPresentation.sectionLayout === 'aside-left' || toolsPresentation.sectionLayout === 'aside-right';
        const toolsHeaderProps = {
          title: toolsSectionTitle,
          subtitle: toolsSectionSubtitle || undefined,
          presentation: toolsPresentation,
          itemCount: strengths.length,
        };
        // One shared, GSAP-animated header design (Header) mounts above the section.
        const toolsHeaderContent =
          toolsPresentation.headerDesign === 'none' ? null : toolsPresentation.headerDesign === 'marquee' ? (
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
        const headerBlock = toolsHeaderContent ? (
          <div style={portfolioPaletteCssVars(toolsReadingPalette)}>{toolsHeaderContent}</div>
        ) : null;
        if (previewTarget?.section === 'toolsHeader') {
          return (
            <div id="tools" className="flex min-h-[480px] w-full items-center justify-center" style={{...portfolioPaletteCssVars(toolsPalette),backgroundColor:toolsPalette.fond}}>
              <div className={toolsHeaderPreviewStyles.preview} data-tools-header-preview={toolsPresentation.headerDesign} style={{width:'86%'}}>{headerBlock}</div>
            </div>
          );
        }
        if (previewTarget?.section === 'tools') {
          const indexPreview = toolsPresentation.design === 'brand-index';
          const rows = ['brand-directory', 'brand-index', 'level-progress-rows', 'level-category-rows', 'level-table-rows', 'level-star-cards'].includes(toolsPresentation.design);
          const count = toolsPresentation.design === 'workflow-rail' ? 5 : indexPreview ? 2 : rows ? 3 : 4;
          const previewTools = strengths.slice(0, count).map(tool => indexPreview
            ? typeof tool === 'string'
              ? { name: tool, description: t('Design and creation') }
              : { ...tool, description: tool.description?.trim() || tool.useCases?.slice(0, 2).join(' · ') || t('Design and creation') }
            : tool);
          return (
            <PortfolioSectionShell
              id="tools"
              background={toolsPresentation}
              fitContent
              suppressBackground={suppressSectionBackground(toolsPresentation)}
              topSpacingClass="pt-0"
              bottomSpacingClass="pb-0"
            >
              <div className="flex min-h-[426px] w-full items-center py-4">
                <div className={`${toolsCatalogueStyles.preview} w-full [&_.pf-stack-brand-index-name]:!text-[2.75rem] [&_.pf-stack-brand-index-description]:!text-[1.5rem] [&_.pf-stack-brand-index-description]:!leading-relaxed`}>
                  <EditorialToolsGallery tools={previewTools} presentation={{ ...toolsPresentation, showDescription: indexPreview, showCategory: indexPreview ? false : toolsPresentation.showCategory, showUseCases: false }} />
                </div>
              </div>
            </PortfolioSectionShell>
          );
        }
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
            header={toolsAside ? undefined : headerBlock}
            cssVars={portfolioPaletteCssVars(toolsReadingPalette)}
          >
            {toolsAside ? <SectionAsideContent layout={toolsPresentation.sectionLayout ?? 'aside-left'} header={headerBlock} centerHeader={(toolsPresentation.asideTitlePlacement ?? 'center') === 'center'} stickyHeader={toolsPresentation.asideTitleSticky !== false}>
              <SectionContentTextScale size={settings.tools.textSize}>
              <EditorialToolsGallery tools={strengths} presentation={{ ...toolsPresentation, levelProgressColumnsPerRow: 1, brandCardsColumnsPerRow: ['level-circular-cards', 'level-star-cards', 'level-svg-rings'].includes(toolsPresentation.design) ? 2 : 1, brandRowColumnsPerRow: 1 }} />
              </SectionContentTextScale>
            </SectionAsideContent> : <SectionContentTextScale size={settings.tools.textSize}><EditorialToolsGallery tools={strengths} presentation={toolsPresentation} /></SectionContentTextScale>}
          </PortfolioSectionShell>
        );
      }
      default:
        return null;
    }
  }

  /** The site navigation — shared by both layouts and the design preview. */
  const navElement =
    isCaseOverlayNav ? (
      <PortfolioCaseOverlayNav
        items={navBarItems}
        visible={panelNavVisible}
        settings={pageNavigationSettings}
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
        items={navBarItems}
        visible={panelNavVisible}
        settings={pageNavigationSettings}
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
        items={navBarItems}
        visible={panelNavVisible}
        settings={pageNavigationSettings}
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
          items={navBarItems}
          settings={pageNavigationSettings}
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
    );

  /** The hero banner — shared by both layouts and the design preview. */
  const heroElement = (
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
  );

  /** Footer header block + Footer + Mini bar — shared by both layouts and the design preview.
   *  The design preview leaves the header block out: it has its own design setting, so it would
   *  only repeat the same block on top of every card. */
  const footerMiniBar = isPagesMode || footerPresentation.showMiniBar ? (
        <PortfolioFooterMiniBar
          design={footerPresentation.miniBarDesign}
          creatorName={profile.fullName}
          locationLabel={footerPresentation.showLocation !== false ? locationLabel : null}
          timezoneId={profile.timezoneId}
          colorMode={footerColorMode}
          accentColor={footerPresentation.accentColor}
          contentGutter={settings.global.contentGutter}
          copyrightText={footerMiniBarCopyrightText}
          showCopyright={footerPresentation.showCopyright !== false}
          isAvailable={profile.isAvailable}
          hoursLabel={footerPresentation.showHours !== false ? availabilityDisplay : null}
          creditLabel={footerPresentation.invertedWordmarkCredit}
          backgroundStyle={footerMiniBarBackgroundStyle}
        />
  ) : null;

  const footerStack = (
    <div
      className={isFooterPreview ? 'flex min-h-[640px] w-full flex-col justify-center' : 'mt-auto w-full shrink-0'}
      style={isFooterPreview ? { backgroundColor: footerPalette.fond, ...sectionBackgroundStyle(footerPresentation) } : undefined}
    >
      {isFooterPreview ? null : (
        <div
          className={`w-full ${contentShellClass}`}
          style={{
            ...portfolioPaletteCssVars(footerHeaderReadingPalette),
            ...footerHeaderBackgroundStyle,
          }}
        >
          {footerHeaderBlock}
        </div>
      )}
      <PortfolioFooterWithVisits
        creatorName={profile.fullName}
        creatorId={creatorId}
        avatarUrl={profile.avatarUrl}
        bio={isFooterPreview ? (profile.bio ?? '').slice(0, 120) : profile.bio}
        email={resolvedContactEmail || null}
        phone={profile.phone}
        locationLabel={locationLabel}
        hoursLabel={availabilityDisplay}
        initialVisits={profile.profileVisits ?? 0}
        links={isFooterPreview ? uniqueContactLinks.slice(0, 4) : uniqueContactLinks}
        contentClassName={contentShellClass}
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
        sectionLinkOptions={isFooterPreview ? footerSectionLinkOptions.slice(0, 4) : footerSectionLinkOptions}
                sectionPalette={footerPalette}
        globalColorMode={footerColorMode}
        timezoneId={profile.timezoneId}
        contentGutter={settings.global.contentGutter}
      />
      {!isFooterPreview && (!isPagesMode || isDesignPreview) ? footerMiniBar : null}
    </div>
  );

  if (isDesignPreview) {
    return (
      <PortfolioMotionOffContext.Provider value={true}>
        <PortfolioHeaderMotionOffContext.Provider value={true}>
          <PortfolioMotionProvider timing={settings.global.motionTiming}>
            <PortfolioThemeRoot
              themeId={settings.themeId}
              customThemes={settings.customThemes}
              monochromeUi={settings.global.monochromeUi}
              colorMode={(settings.global.colorMode ?? 'dark') as 'dark' | 'light'}
              activePalette={activeGlobalPalette}
              fixedBackgroundStyle={globalFixedBgStyle}
              suppressDefaultBackground={hasGlobalBg}
            >
              <style>{`
                /* Catalogue iframes never scroll. The public page's stable scrollbar gutter
                   otherwise leaves a strip of the GLOBAL canvas beside a section-local theme. */
                html[data-portfolio-color-mode] {
                  scrollbar-gutter: auto !important;
                  scrollbar-width: none !important;
                  overflow: hidden !important;
                }
                html[data-portfolio-color-mode] body {
                  overflow: hidden !important;
                }
                html::-webkit-scrollbar, body::-webkit-scrollbar {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
              `}</style>
              <div data-design-preview-root className="flex w-full flex-col">
                {previewTarget.section === 'footer' ? (
                  footerStack
                ) : previewTarget.section === 'contact' ? (
                  <main className="flex min-h-[640px] w-full items-center" style={{ backgroundColor: contactPalette.fond, ...sectionBackgroundStyle(contactPresentation) }}>
                    <div className="w-full">{renderContentSection('contact')}</div>
                  </main>
                ) : previewTarget.section === 'footerHeader' ? (
                  <div
                    className="flex min-h-[480px] w-full items-center justify-center"
                    style={{
                      ...portfolioPaletteCssVars(footerHeaderReadingPalette),
                      backgroundColor:footerHeaderReadingPalette.fond,
                      ...footerHeaderBackgroundStyle,
                    }}
                  >
                    <div className={footerHeaderPreviewStyles.preview} data-footer-header-preview={footerPresentation.headerDesign} style={{width:'86%'}}>{footerHeaderBlock}</div>
                  </div>
                ) : previewTarget.section === 'hero' ? (
                  heroElement
                ) : previewTarget.section === 'navigation' ? (
                  /* The nav alone (it is fixed), in a band sized to the bar — see navPreviewBandHeight. */
                  <div className="relative" style={{ height: navPreviewBandHeight }}>
                    {navElement}
                  </div>
                ) : previewTarget.section === 'galleryHeader' ? (
                  <main className="w-full">{renderContentSection('gallery')}</main>
                ) : previewTarget.section === 'teamHeader' ? (
                  <main className="w-full">{renderContentSection('team')}</main>
                ) : previewTarget.section === 'experienceHeader' ? (
                  <main className="w-full">{renderContentSection('experience')}</main>
                ) : previewTarget.section === 'servicesHeader' ? (
                  <main className="w-full">{renderContentSection('services')}</main>
                ) : previewTarget.section === 'faqHeader' ? (
                  <main className="w-full">{renderContentSection('faq')}</main>
                ) : previewTarget.section === 'infoHeader' ? (
                  <main className="w-full">{renderContentSection('info')}</main>
                ) : previewTarget.section === 'workHeader' ? (
                  <main className="w-full">{renderContentSection('work')}</main>
                ) : previewTarget.section === 'stackHeader' ? (
                  <main className="w-full">{renderContentSection('stack')}</main>
                ) : previewTarget.section === 'toolsHeader' ? (
                  <main className="w-full">{renderContentSection('tools')}</main>
                ) : (
                  <main className={`w-full ${contentShellClass}`}>{renderContentSection(previewTarget.section)}</main>
                )}
              </div>
            </PortfolioThemeRoot>
          </PortfolioMotionProvider>
        </PortfolioHeaderMotionOffContext.Provider>
      </PortfolioMotionOffContext.Provider>
    );
  }

  return (
    <PortfolioMotionOffContext.Provider value={!motionEnabled}>
    <PortfolioHeaderMotionOffContext.Provider value={settings.global.headerMotionEnabled === false}>
    <PortfolioMotionProvider key={motionEnabled ? 'motion-on' : 'motion-off'} timing={settings.global.motionTiming}>
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
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={onVisitRecorded} />
      <PortfolioSmoothScroll enabled={!isDesignPreview&&settings.global.smoothScrollEnabled===true&&motionEnabled} softness={settings.global.smoothScrollSoftness??50} wheelSpeed={settings.global.smoothScrollWheelSpeed??100} pages={isPagesMode}/>
      {navElement}

      {isPagesMode ? (
        <div className="relative flex h-[100dvh] flex-col overflow-hidden">
          <div className="min-h-0 flex-1">
          <PortfolioPagesSlideViewport pageId={activePageId} direction={pageSlideDirection}>
            <div className="flex min-h-full w-full flex-col">
            <div className="flex-1">
            {settings.hero.enabled && activePageId === 'hero' ? heroElement : null}

            {contentSectionOrder.map((sectionKey) => {
              if (!sectionVisibility[sectionKey] && !(sectionKey === 'contact' && settings.footer.enabled)) return null;
              if (activePageId !== sectionKey) return null;
              const showFooter = shouldShowFooterOnPage(sectionKey);
              return (
                <div
                  key={sectionKey}
                  className="flex w-full flex-col overflow-x-clip"
                >
                  <main
                    className={`flex w-full flex-col ${contentShellClass}`}
                  >
                    {renderContentSection(sectionKey)}
                  </main>
                  {showFooter ? footerStack : null}
                </div>
              );
            })}
            </div>
          <div className="w-full shrink-0" data-pf-pages-mini-bar="">
            {footerMiniBar}
          </div>
            </div>
          </PortfolioPagesSlideViewport>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[100dvh] min-h-screen max-w-full flex-col overflow-x-clip">
          {settings.hero.enabled ? heroElement : null}

          <main
            className={`w-full flex-1 grow space-y-0 ${contentShellClass} ${
              settings.footer.enabled ? 'pb-0' : 'pb-24 sm:pb-28 xl:pb-20'
            }`}
          >
            {contentSectionOrder.map((sectionKey) => (
              <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
            ))}
          </main>

          {settings.footer.enabled ? (
            <>
              {!sectionVisibility.contact ? <span id="contact" aria-hidden="true" className="block scroll-mt-24" /> : null}
              {footerStack}
            </>
          ) : null}
        </div>
      )}
    </PortfolioThemeRoot>
    </PortfolioTaskListMarkerProvider>
    </PortfolioMotionProvider>
    </PortfolioHeaderMotionOffContext.Provider>
    </PortfolioMotionOffContext.Provider>
  );
}
