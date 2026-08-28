'use client';

import Link from 'next/link';
import { Fragment, createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  normalizeSocialPlatformKey,
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { PortfolioToolsStackedIcons } from '@/components/portfolio/portfolio-tools-stacked-icons';
import { PortfolioWorkCtaGlyph } from '@/components/portfolio/portfolio-work-cta-icons';
import type { PortfolioWorkCtaIcon } from '@/components/portfolio/portfolio-work-cta-icons';
import {
  resolveSkillCategory,
  resolveSkillDescription,
  resolveSkillExperienceLabel,
  resolveSkillIconUrl,
  resolveSkillLevelLabel,
  resolveSkillName,
  resolveSkillUseCases,
  type PortfolioSkillRef,
} from '@/components/portfolio/skill-usage-descriptions';
import { formatPhoneDisplay } from '@/lib/phone';
import type {
  ExperienceBlockStatus,
  ExperienceEmploymentType,
  ExperienceProofLink,
  FaqItem,
  ProfileGalleryItem,
  ProfileMediaBlock,
  ProfileServiceItem,
  ProfileTeamMember,
} from '@/types/ecosystem';
import type { MarketplaceContentItem } from '@/types/marketplace';
import {
  galleryAspectStyle,
  galleryDesignUsesCarouselNav,
  galleryEffectiveVerticalGap,
  galleryItemDisplayTitle,
  galleryMaxWidthClass,
  galleryPlacementClass,
  galleryFeaturedHeroHasTitleVoid,
  type PortfolioGalleryPresentationSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import {
  portfolioSectionTitleClassWithoutUppercase,
  portfolioSectionTitleSentenceCase,
} from '@/components/portfolio/portfolio-section-title';
import {
  resolveTaskListMarker,
  listMarkerStrokeWidth,
  listMarkerDashHeightPx,
  listMarkerFontWeightFromAmount,
  resolveListMarkerSizePx,
  resolveListMarkerWeightAmount,
  LIST_MARKER_SIZE_PRESET_PX,
  LIST_MARKER_WEIGHT_PRESET_AMOUNT,
  type PortfolioListMarkerWeight,
} from '@/components/portfolio/portfolio-list-marker';
import { usePortfolioTaskListMarkerGlobal } from '@/components/portfolio/portfolio-task-list-marker-context';
import { PortfolioSplitScreenTitle } from '@/components/portfolio/portfolio-split-screen';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  formatNavLabel,
  portfolioNavBarContainerClass,
  portfolioNavBarInnerClass,
  portfolioNavBarShellStyle,
  portfolioNavBarWidthClass,
  portfolioNavIconGlyphClass,
  portfolioNavIsVertical,
  portfolioNavItemActiveClass,
  portfolioNavItemBaseClass,
  portfolioNavItemColorStyles,
  portfolioNavItemHoverClass,
  portfolioNavItemHoverCssVars,
  portfolioNavItemHoverIconClass,
  portfolioNavItemHoverTextClass,
  portfolioNavActiveItemStyle,
  portfolioNavDockGlyphClass,
  portfolioNavPlacementClass,
  portfolioNavRailDividerClass,
  portfolioNavBarHostsInlineExtras,
  portfolioNavItemGapClass,
  resolvePortfolioNavMobileChrome,
  type PortfolioNavMenuControlAlign,
  type PortfolioNavMenuControlIcon,
} from '@/components/portfolio/portfolio-nav-settings';
import {
  DEFAULT_NAV_PALETTE,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import {
  portfolioNavTopClearanceActive,
  portfolioNavTopScrollMarginClass,
  usePortfolioNavTopClearanceSync,
} from '@/components/portfolio/portfolio-nav-top-clearance';
import {
  sectionHeaderOuterLayoutClass,
  sectionHeaderSubtitleAlignClass,
  sectionHeaderTitleTextAlignClass,
  sectionHeaderTitleWrapClass,
  sectionHeaderTrailingLayoutClass,
} from '@/components/portfolio/portfolio-global-settings';
import type { PortfolioNavIconVariant } from '@/components/portfolio/portfolio-nav-items';
import {
  teamAvatarSizeClass,
  teamCardClass,
  teamCardFooterPaddingClass,
  teamCardFrameClass,
  teamCardMaxWidthClass,
  teamCardStyle,
  teamCircleAvatarClass,
  teamContentAlignClass,
  teamDirectoryMaxWidthClass,
  teamDirectoryStackGapClass,
  teamFlexAlignClass,
  teamFloatCardBodyPadClass,
  teamFloatCardMinHeightClass,
  teamFloatAvatarAnchorClass,
  teamFloatGridOffsetClass,
  teamGridClass,
  teamHoverOverlayPaddingClass,
  teamHoverPhotoClass,
  teamListAlignClass,
  teamProfilePhotoHeightClass,
  teamReadableCardText,
  teamSocialAlignClass,
  teamSocialIconButtonClass,
  teamSocialIconGlyphClass,
  teamSpotlightGridClass,
  teamSpotlightMaxWidthClass,
  teamSpotlightNameClass,
  teamSpotlightPhotoSizeClass,
  teamSpotlightRoleClass,
  teamSpotlightThumbClass,
  type PortfolioTeamPresentationSettings,
} from '@/components/portfolio/portfolio-team-settings';
import {
  PortfolioNavAdjacentExtras,
  PortfolioNavFreeSpaceLinks,
  PortfolioNavInlineExtras,
  type PortfolioNavChromeLink,
} from '@/components/portfolio/portfolio-nav-extras';
import {
  DEFAULT_ABOUT_PRESENTATION,
  aboutAccentColor,
  aboutSidePanelShellClass,
  aboutSidePanelAutoCenterClass,
  aboutSidePanelAccentSoftBackground,
  aboutSidePanelCardBackgroundSettings,
  aboutSidePanelContentGapStyle,
  aboutSidePanelDividerColor,
  aboutSidePanelFrameClass,
  aboutSidePanelFrameStyle,
  aboutSidePanelFullWidthLayoutClass,
  aboutSidePanelInfoBarLayoutClass,
  aboutSidePanelItemCellClass,
  aboutPalettePrincipalColor,
  aboutSidePanelMicroLabelColor,
  aboutActiveColorMode,
  aboutHeaderFontClass,
  resolveWhyMeTimelineSurfaceColor,
  resolveWhyMeTimelineLineColor,
  aboutStatsAutoCenterClass,
  aboutStatCardFrameClass,
  aboutStatCardFrameStyle,
  aboutStatEditorialSuffix,
  aboutStatsGapStyle,
  aboutStatFontClass,
  aboutStatFontStyle,
  aboutStatIconColorStyle,
  aboutStatIconSizeClass,
  aboutStatLabelColorStyle,
  aboutStatLabelSizeClass,
  aboutStatLabelTrackingClass,
  aboutStatLabelWeightClass,
  aboutStatValueColorStyle,
  aboutStatValueSizeClass,
  aboutStatValueWeightClass,
  aboutWhyMeBlockClass,
  aboutWhyMeContentPaddingClass,
  aboutWhyMeEffectivePadding,
  aboutWhyMeLayersSettings,
  aboutWhyMeFrameClass,
  aboutWhyMeFrameStyle,
  whyMeGapStyle,
  resolveWhyMeGapPx,
  resolveWhyMeHeading,
  resolveWhyMeMediaLayout,
  resolveWhyMeItemsPerRow,
  whyMeItemsPerRowGridClass,
  whyMeBlockHasMedia,
  whyMeContentAlignClass,
  whyMeDesignEmbedsHeading,
  whyMeDesignUsesHeroHeading,
  whyMeHeadingClass,
  whyMeHeadingStyle,
  sidePanelHeadingClass,
  sidePanelHeadingStyle,
  resolveSidePanelHeading,
  formatWhyMeIndexLabel,
  isWhyMeHyperBulletMarker,
  resolveWhyMeMarkerColor,
  resolveSidePanelMarkerColor,
  ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX,
  DEFAULT_ABOUT_WHY_ME_HEADING_COLOR,
  sidePanelIconPlacementClass,
  isAboutRatingStat,
  type AboutStatValueSizeContext,
  type PortfolioAboutLayoutMode,
  type PortfolioAboutPresentationSettings,
  type PortfolioAboutSidePanelIconPlacement,
  type PortfolioAboutWhyMeMarkerSize,
  type PortfolioAboutWhyMeMarkerStyle,
} from '@/components/portfolio/portfolio-about-settings';
import {
  elementTextInlineStyle,
  elementTextStyleClass,
  toolsIconPixelSize,
  toolsIconShellClass,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  DEFAULT_EXPERIENCE_PRESENTATION,
  experienceAccentColor,
  experienceChipChromeStyle,
  experienceSoftChipChromeStyle,
  experienceDetailsPanelClass,
  experienceDetailsPanelStyle,
  experienceDetailsSecondaryPanelClass,
  experienceDetailsSecondaryPanelStyle,
  experienceDesignUsesEntryCard,
  experienceEntryHasMedia,
  experienceEntryMediaAspectClass,
  experienceEntryMediaIsOutside,
  experienceEntryMediaPositionClass,
  experienceEntryMediaRadiusClass,
  experienceEntryMediaSizeClass,
  experienceEntryMediaSizeStyle,
  experienceEntryMediaHeightStyle,
  experienceEntryMediaUsesFixedHeight,
  resolveExperienceSteppedBannerHeightPx,
  experienceEntryShellClass,
  experienceEntryShellStyle,
  experienceEntryShellUsesFrame,
  experienceBlockLabelVisible,
  experienceItemGapClass,
  experienceTaskItemGapClass,
  experienceItemsPerRowGridClass,
  experienceLayerToCardFrameSettings,
  experienceLayerFrameClass,
  experienceLayerFrameStyle,
  experienceListShellClass,
  experiencePeriodRuleStyle,
  experienceStoryContentGapStyle,
  experienceDetailsContentGapStyle,
  experienceStoryPanelClass,
  experienceStoryPanelStyle,
  experienceTextInlineStyle,
  experienceTextStyleClass,
  experienceToolsIconPixelSize,
  experienceToolsIconShellClass,
  experienceToolsIconBorderClass,
  experienceToolsIconChromeStyle,
  experienceToolsChromeClass,
  experienceToolsChromeStyle,
  experienceToolsSeparatorStyle,
  experienceHairlineBorderTopStyle,
  experienceHairlineBorderBottomStyle,
  resolveExperienceHairlineColor,
  experienceTimelineRailLineStyle,
  experienceTimelineRailNodeStyle,
  experienceMagazineRailStyle,
  experienceYearsClass,
  experienceYearsHighlightStyle,
  experienceYearsStyle,
  isExperienceDetailsElement,
  isExperienceStoryElement,
  normalizeExperienceElementOrder,
  normalizeExperienceElementStyles,
  normalizeExperienceElementZones,
  resolveExperienceBlockLabel,
  resolveExperienceBodyLayout,
  resolveExperienceItemsPerRow,
  resolveExperienceYearsTemplate,
  type PortfolioExperienceAsidePlacement,
  type PortfolioExperienceElementId,
  type PortfolioExperienceElementStyles,
  type PortfolioExperienceElementZones,
  type PortfolioExperiencePresentationSettings,
  type PortfolioExperienceProofLinkStyle,
  type PortfolioExperienceProofZone,
  type PortfolioExperienceSkillsTagStyle,
  type PortfolioExperienceStatusBadgeStyle,
  type PortfolioExperienceTaskItemGap,
  type PortfolioExperienceTextStyle,
  type PortfolioExperienceToolsDisplay,
  type PortfolioExperienceToolsEntrySide,
  type PortfolioExperienceToolsIconBorder,
  type PortfolioExperienceToolsIconSize,
  type PortfolioExperienceToolsZone,
  type PortfolioExperienceToolsChromeSettings,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_WORK_PRESENTATION,
  DEFAULT_WORK_OVERLAY_ELEMENT_BANDS,
  DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS,
  DEFAULT_WORK_ELEMENT_CHROMES,
  PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS,
  WORK_CATEGORY_ALL_KEY,
  collectWorkCategories,
  filterWorkItemsByCategory,
  groupWorkItemsByCategory,
  normalizeWorkElementStyles,
  workCardContentAlignClass,
  workCardContentOrderClass,
  workCardContentVerticalAlignClass,
  workCardEdgeClass,
  workCardEdgeStyle,
  workCardFrameClass,
  workCardFrameStyle,
  workCardGapClass,
  workCardGridStyle,
  workCardIsStacked,
  workCardLiftClass,
  workCardLiftStyle,
  workCardMaxWidthClass,
  workCardMaxWidthFlexAlignClass,
  workCardMaxWidthJustifyClass,
  workListCardSurfaceClass,
  workListCardSurfaceStyle,
  workListMediaFlexClass,
  workListThumbClass,
  workCategoryBarAlignClass,
  workContentFrameClass,
  workContentFrameGapClass,
  workContentFrameStyle,
  workElementChromeClass,
  workElementChromeStyle,
  workCardMediaAspectClass,
  workCardMediaAspectStyle,
  workCardMediaBehaviorClass,
  workCardMediaOrderClass,
  workCardShellClass,
  workCategoryChipClass,
  workCategoryNavClass,
  workCompactGalleryGap,
  workCtaAlignClass,
  workCtaClassName,
  workCtaIconShellClass,
  workCtaIconShellStyle,
  workCtaStyle,
  workEffectiveContentPlacement,
  workNoMediaInfoWidthClass,
  workOverlayCellAbsoluteStyle,
  workOverlayCellAlignClass,
  workOverlayCellColumn,
  workOverlayCellRow,
  workOverlayCellRowAlignClass,
  workOverlayElementInk,
  workOverlayReadableColor,
  workContrastingInk,
  workToolIconShellStyle,
  workToolsBlockClass,
  workToolsBlockStyle,
  workToolsPinSpacerEnabled,
  resolveWorkItemsPerRow,
  workItemsPerRowGridClass,
  type PortfolioWorkOverlayCellPlacement,
  type PortfolioWorkOverlayElementId,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_SERVICES_PRESENTATION,
  DEFAULT_SERVICES_ACCENT_COLOR,
  DEFAULT_SERVICES_CARD_BORDER_COLOR,
  DEFAULT_SERVICES_ELEMENT_CHROMES,
  DEFAULT_SERVICES_TASK_BULLET_COLOR,
  clampSkillsInspectorIconGapPx,
  servicesElementChromeClass,
  servicesElementChromeStyle,
  normalizeServicesElementStyles,
  resolveServicesServicesSubheadingLabel,
  resolveServicesSkillsSubheadingLabel,
  servicesCardFillDataAttrs,
  servicesCardFrameClass,
  servicesCardShellClass,
  servicesCardSurfaceStyle,
  servicesMediaCardSurfaceStyle,
  resolveServicesMediaCardPresentation,
  servicesReadableCardInk,
  pickServicesCardTextContrast,
  resolveServicesCardSurfaceHex,
  servicesSkillIconChromeStyle,
  servicesSoftIconChipBg,
  servicesCardWidthClass,
  servicesCardMaxWidthShellClass,
  servicesCardMaxWidthClass,
  resolveMediaBannerCardMaxWidth,
  servicesMediaOnLeft,
  skillsInspectorMaxWidthShellClass,
  servicesContentAlignClass,
  servicesCardContentGapProps,
  servicesGalleryContainerClass,
  servicesGallerySupportsMarquee,
  servicesGallerySupportsCoverflow,
  servicesListRowShellClass,
  servicesPricingHeroShellClass,
  servicesTierShellClass,
  servicesServiceCardMinHeight,
  servicesSkillCardMinHeight,
  servicesCurrencySymbol,
  servicesCtaAlignClass,
  servicesCtaWorkPresentation,
  servicesColorLuminance,
  resolveServicePricePrefix,
  resolveServiceCurrencyPlacement,
  formatServicesPriceAmount,
  servicePriceAlignClass,
  servicePriceBoxStyle,
  pickServicesStageChrome,
  servicesStageShellClass,
  servicesStageShellStyle,
  resolveServicesCardTone,
  resolveServicesTaskBulletColor,
  resolveServicesTaskBulletSource,
  servicesPrincipalSurfaceActive,
  type PortfolioServicesPresentationSettings,
  type PortfolioServicesStageChromeSettings,
  type PortfolioServicesStageDesign,
  type PortfolioServicesTaskBulletStyle,
} from '@/components/portfolio/portfolio-services-settings';
import {
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  mergeServicesColorBindings,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  resolveServicesBlockPresentation,
} from '@/components/portfolio/portfolio-services-block-settings';
import { PortfolioServicesCoverflow } from '@/components/portfolio/portfolio-skills-coverflow';
import { PortfolioServicesDeck } from '@/components/portfolio/portfolio-skills-deck';
import {
  ServicesCardBackgroundLayers,
  ServicesCardForeground,
} from '@/components/portfolio/portfolio-services-card-background-layers';
import {
  DEFAULT_FAQ_PRESENTATION,
  faqAnswerBorderStyle,
  faqAnswerPaddingClass,
  faqContentAlignClass,
  faqExpandIconStyle,
  faqFrameClass,
  faqFrameStyle,
  faqIsCardDesign,
  faqItemAccentStyle,
  faqItemBorderCssVars,
  faqItemShellClass,
  faqListShellClass,
  faqPanelInnerClass,
  faqPanelShadowStyle,
  faqSeparatedCardFrameClass,
  faqSummaryHorizontalPaddingClass,
  faqSummaryPaddingClass,
  type PortfolioFaqExpandIconStyle,
  type PortfolioFaqPresentationSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  DEFAULT_CONTACT_PRESENTATION,
  contactCardFrameClass,
  contactCardFrameStyle,
  contactCardMaxWidthClass,
  contactCardPlacementClass,
  contactCardShellClass,
  contactAsideLayoutClass,
  contactChromeCssVars,
  contactCtaClassName,
  contactCtaStyle,
  contactFormStackGapClass,
  contactFormFrameClass,
  contactFormFrameStyle,
  contactInquiryFormCardClass,
  contactInquiryAccentBlockClass,
  contactInquiryChannelCardClass,
  contactInquiryPanelStatCardClass,
  contactChannelCardsCardClass,
  contactChannelCardsCardStyle,
  contactChannelCardsIconClass,
  contactDeskChannelCardClass,
  contactDeskFormPanelClass,
  contactDeskMaxWidthClass,
  contactInfoPanelShellClass,
  contactInfoPanelShellStyle,
  contactInfoPanelFormCardClass,
  contactInfoPanelFormCardStyle,
  contactSwissEditorialFrameClass,
  contactSwissEditorialFrameStyle,
  DEFAULT_CONTACT_SWISS_AVAILABILITY,
  DEFAULT_CONTACT_SWISS_COBALT,
  DEFAULT_CONTACT_SWISS_SUBTITLE,
  DEFAULT_CONTACT_SWISS_TITLE,
  isContactInquiryPanelDesign,
  isContactDeskDesign,
  isContactInfoPanelDesign,
  isContactChannelCardsDesign,
  isContactSwissEditorialDesign,
  isContactOwnedLayoutDesign,
  contactActiveColorMode,
  resolveContactFormDesign,
  resolveContactInquiryHeadline,
  resolveContactInquirySupporting,
  resolveContactInfoPanelHeadline,
  resolveContactInfoPanelSupporting,
  contactIconGlyphClass,
  contactIconPlacementClass,
  contactIconShellClass,
  contactIconShellStyle,
  contactIconBorderClass,
  contactItemRowShellClass,
  contactItemsLayoutClass,
  normalizeContactElementStyles,
  type PortfolioContactElementStyles,
  type PortfolioContactIconBorder,
  type PortfolioContactIconPlacement,
  type PortfolioContactPresentationSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import { ContactMessageForm } from '@/components/portfolio/portfolio-contact-message-form';
import { ContactInquiryIllustration } from '@/components/portfolio/ContactInquiryIllustration';
import { FaqSectionIllustration } from '@/components/portfolio/FaqSectionIllustration';
import {
  DEFAULT_FOOTER_PRESENTATION,
  footerDividerClass,
  footerIconStyle,
  footerLayoutClass,
  footerContentPaddingStyle,
  footerContentPaddingClassName,
  footerContentDividerStyle,
  footerPatternStyle,
  footerCtaButtonClass,
  footerCtaButtonStyle,
  footerCtaButtonsAlignClass,
  footerContactCtaStyle,
  footerContactIconSizeClass,
  footerContactIconSizeClassCompact,
  footerMarketplaceCtaClass,
  footerMarketplaceCtaStyle,
  footerPresetCtaClass,
  footerReadableOnBackground,
  footerColorLuminance,
  footerShellClass,
  footerTopMarginClass,
  footerTopMarginStyle,
  footerLandingBrandGapStyle,
  footerColumnHeadingGapStyle,
  clampFooterColumnHeadingGapPx,
  resolveFooterCopyrightLabel,
  isFooterBackgroundLight,
  normalizeFooterElementStyles,
  resolveFooterCtaSubtitle,
  resolveFooterDescription,
  resolveFooterLinkHref,
  isFooterNopbProfileLink,
  isFooterMarketplaceColumnLink,
  resolveFooterLandingSectionLinks,
  resolveFooterInternalLinksColumn,
  DEFAULT_FOOTER_CONNECT_LABEL,
  DEFAULT_FOOTER_ACCENT_COLOR,
  type PortfolioFooterAutoSectionKey,
  resolveFooterMarketplaceCtaHref,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { sectionBackgroundStyle } from '@/components/portfolio/portfolio-section-background-settings';
import {
  PORTFOLIO_EDITORIAL_GUTTER_X,
  PORTFOLIO_HERO_LAYER_INSET,
  portfolioEditorialShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';
export const SERIF = "'Playfair Display', serif";

/** Shared max width for portfolio page sections */
export const PORTFOLIO_PAGE_MAX = 'mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12';

export { PORTFOLIO_EDITORIAL_GUTTER_X, PORTFOLIO_HERO_LAYER_INSET, portfolioEditorialShellClass };

/** Editorial hero — same equal gutters as sections below (no max-width shift). */
export const PORTFOLIO_HERO_EDITORIAL_MAX = portfolioEditorialShellClass('medium');

/** Editorial sections below hero — viewport-wide, equal left/right inset */
export const PORTFOLIO_EDITORIAL_SECTION_MAX = portfolioEditorialShellClass('medium');

/** Shared chrome for floating nav pill and sticky section titles. */
export const PORTFOLIO_FLOATING_CHROME =
  'rounded-full border border-neutral-200/80 bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/90';

export const PORTFOLIO_FLOATING_CHROME_LABEL =
  'px-4 py-2 text-[11px] font-bold normal-case tracking-[0.04em]';

/** Nearest scrollable ancestor (pages mode uses nested overflow-y-auto). */
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node && node !== document.body) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

const HERO_MOSAIC_CHUNK = 5;

function chunkHeroMosaicItems<T>(items: T[]): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += HERO_MOSAIC_CHUNK) {
    chunks.push(items.slice(index, index + HERO_MOSAIC_CHUNK));
  }
  const last = chunks[chunks.length - 1];
  const previous = chunks[chunks.length - 2];
  if (last && previous && last.length === 1) {
    last.unshift(...previous.splice(3));
  }
  return chunks;
}

function heroMosaicPlan(count: number): {
  containerClass: string;
  heroClass: string;
  tileClass: (index: number) => string;
} {
  if (count <= 1) {
    return {
      containerClass: 'grid-cols-1 lg:[aspect-ratio:16/7]',
      heroClass: '[aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: () => '',
    };
  }
  if (count === 2) {
    return {
      containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-1 lg:[aspect-ratio:16/7]',
      heroClass:
        'sm:col-span-1 lg:col-span-5 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: () =>
        'sm:col-span-1 lg:col-span-3 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
    };
  }
  if (count === 3) {
    return {
      containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-2 lg:[aspect-ratio:16/9]',
      heroClass:
        'sm:col-span-2 lg:col-span-4 lg:row-span-2 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: () =>
        'sm:col-span-1 lg:col-span-4 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
    };
  }
  if (count === 4) {
    return {
      containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-2 lg:[aspect-ratio:16/9]',
      heroClass:
        'sm:col-span-2 lg:col-span-4 lg:row-span-2 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
      tileClass: (index) =>
        index === 0
          ? 'sm:col-span-2 lg:col-span-4 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]'
          : 'sm:col-span-1 lg:col-span-2 [aspect-ratio:1/1] lg:[aspect-ratio:auto]',
    };
  }
  return {
    containerClass: 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-8 lg:grid-rows-2 lg:[aspect-ratio:16/9]',
    heroClass:
      'sm:col-span-2 lg:col-span-4 lg:row-span-2 [aspect-ratio:var(--hero-mosaic-aspect)] lg:[aspect-ratio:auto]',
    tileClass: () => 'sm:col-span-1 lg:col-span-2 [aspect-ratio:1/1] lg:[aspect-ratio:auto]',
  };
}

function featuredStripPlan(total: number): {
  layout: 'solo' | 'split';
  scrollable: boolean;
} {
  const tiles = Math.max(0, total - 1);
  if (tiles === 0) return { layout: 'solo', scrollable: false };
  return { layout: 'split', scrollable: tiles > 3 };
}

const TALL_ROW_SLIDE_MS = 620;
const CINEMA_SLIDE_MS = 540;

export function EditorialGallerySection({
  items,
  presentation,
  embeddedHeader,
}: {
  items: ProfileGalleryItem[];
  presentation: PortfolioGalleryPresentationSettings;
  embeddedHeader?: ReactNode;
}) {
  const [activeItem, setActiveItem] = useState<ProfileGalleryItem | null>(null);
  const [carouselPage, setCarouselPage] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [gallerySlideDir, setGallerySlideDir] = useState<1 | -1>(1);
  const [tallThumbAnim, setTallThumbAnim] = useState<{ from: number; dir: 1 | -1 } | null>(null);
  const [tallThumbStep, setTallThumbStep] = useState(0);
  const [tallThumbX, setTallThumbX] = useState(0);
  const [tallThumbTween, setTallThumbTween] = useState(false);
  const tallThumbViewRef = useRef<HTMLDivElement>(null);
  const tallThumbAnimRef = useRef<{ from: number; dir: 1 | -1 } | null>(null);
  const tallThumbTweenRef = useRef(false);
  const tallThumbUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tallThumbPrevFrame = useRef<number | null>(null);
  const [cinemaX, setCinemaX] = useState(0);
  const [cinemaStep, setCinemaStep] = useState(0);
  const [cinemaSliding, setCinemaSliding] = useState(false);
  const cinemaViewRef = useRef<HTMLDivElement>(null);
  const cinemaLockRef = useRef(false);
  const cinemaUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollCarouselLock = useRef(false);
  const scrollCarouselRestore = useRef<(() => void) | null>(null);
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  );

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setActiveItem(null);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeItem]);

  useEffect(() => {
    setCarouselPage(0);
    setFeaturedIndex(0);
    tallThumbAnimRef.current = null;
    tallThumbTweenRef.current = false;
    if (tallThumbUnlockTimer.current) {
      clearTimeout(tallThumbUnlockTimer.current);
      tallThumbUnlockTimer.current = null;
    }
    if (tallThumbPrevFrame.current != null) {
      cancelAnimationFrame(tallThumbPrevFrame.current);
      tallThumbPrevFrame.current = null;
    }
    setTallThumbAnim(null);
    setTallThumbX(0);
    setTallThumbTween(false);
    cinemaLockRef.current = false;
    if (cinemaUnlockTimer.current) {
      clearTimeout(cinemaUnlockTimer.current);
      cinemaUnlockTimer.current = null;
    }
    setCinemaX(0);
    setCinemaSliding(false);
  }, [presentation.design, presentation.columns, sortedItems.length]);

  useEffect(() => {
    return () => {
      if (tallThumbUnlockTimer.current) clearTimeout(tallThumbUnlockTimer.current);
      if (tallThumbPrevFrame.current != null) cancelAnimationFrame(tallThumbPrevFrame.current);
      if (cinemaUnlockTimer.current) clearTimeout(cinemaUnlockTimer.current);
      scrollCarouselRestore.current?.();
    };
  }, []);

  const showItemTitle = presentation.showTitle && presentation.titlePlacement !== 'hidden';
  const hGap = presentation.gap;
  const captionGap = Math.max(hGap + 28, 56);
  const vGap = galleryEffectiveVerticalGap(presentation);
  const gapPx = `${hGap}px`;
  const vGapPx = `${vGap}px`;
  const gridStyle: CSSProperties = {
    '--gallery-columns': presentation.columns,
    '--gallery-gap': gapPx,
    '--gallery-vgap': vGapPx,
    columnGap: `${hGap}px`,
    rowGap: `${vGap}px`,
    padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
  } as CSSProperties;
  const mosaicChunks = useMemo(
    () => (presentation.design === 'hero-mosaic' ? chunkHeroMosaicItems(sortedItems) : []),
    [presentation.design, sortedItems]
  );
  const mosaicAspect =
    galleryAspectStyle(presentation.imageAspect === 'auto' ? 'landscape' : presentation.imageAspect)
      .aspectRatio ?? '4 / 3';
  const mosaicGridStyle: CSSProperties = {
    columnGap: `${hGap}px`,
    rowGap: `${vGap}px`,
    ['--hero-mosaic-aspect' as string]: mosaicAspect,
  };
  const stripPlan = useMemo(
    () => featuredStripPlan(presentation.design === 'featured-strip' ? sortedItems.length : 0),
    [presentation.design, sortedItems.length]
  );
  const stripGap = `${hGap}px`;
  const stripClipStyle: CSSProperties = {
    borderRadius: 'var(--gallery-frame-radius, 16px)',
    overflow: 'hidden',
  };
  const featuredItem = sortedItems[Math.min(Math.max(0, featuredIndex), Math.max(0, sortedItems.length - 1))] ?? null;
  const featuredThumbs = sortedItems
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index !== featuredIndex);
  const tallRowVisibleCount = Math.min(4, sortedItems.length);
  const tallThumbVisible = Math.min(3, Math.max(0, sortedItems.length - 1));
  const tallRowItems = sortedItems.length
    ? Array.from({ length: tallRowVisibleCount }, (_, offset) => {
        const index = (featuredIndex + offset) % sortedItems.length;
        return { item: sortedItems[index], index };
      })
    : [];
  const tallHero = tallRowItems[0] ?? null;
  const tallThumbsAt = (start: number) =>
    Array.from({ length: tallThumbVisible }, (_, offset) => {
      const index = (start + 1 + offset) % sortedItems.length;
      return { item: sortedItems[index], index };
    });
  const tallThumbBaseIndex = tallThumbAnim?.from ?? featuredIndex;
  const tallThumbs = tallThumbsAt(tallThumbBaseIndex);
  const tallThumbExtra = (start: number) => {
    const index = (start + 1 + tallThumbVisible) % sortedItems.length;
    return { item: sortedItems[index], index };
  };
  const tallThumbTrack =
    tallThumbVisible === 0
      ? []
      : tallThumbAnim?.dir === -1
        ? [{ item: sortedItems[tallThumbBaseIndex], index: tallThumbBaseIndex }, ...tallThumbs]
        : [...tallThumbs, tallThumbExtra(tallThumbBaseIndex)];
  const finishTallThumbAnim = () => {
    if (!tallThumbAnimRef.current) return;
    if (tallThumbUnlockTimer.current) {
      clearTimeout(tallThumbUnlockTimer.current);
      tallThumbUnlockTimer.current = null;
    }
    if (tallThumbPrevFrame.current != null) {
      cancelAnimationFrame(tallThumbPrevFrame.current);
      tallThumbPrevFrame.current = null;
    }
    tallThumbAnimRef.current = null;
    tallThumbTweenRef.current = false;
    setTallThumbTween(false);
    setTallThumbX(0);
    setTallThumbAnim(null);
  };
  const measureTallThumbStep = (node: HTMLDivElement) => {
    if (tallThumbVisible <= 0) return 0;
    const itemWidth = (node.clientWidth - (tallThumbVisible - 1) * hGap) / tallThumbVisible;
    return itemWidth + hGap;
  };
  const cycleFeatured = (direction: -1 | 1) => {
    if (sortedItems.length < 2) return;
    if (presentation.design === 'tall-row') {
      if (tallThumbAnimRef.current) return;
      const from = featuredIndex;
      const node = tallThumbViewRef.current;
      const step = node && tallThumbVisible > 0 ? measureTallThumbStep(node) : tallThumbStep;
      if (step > 0 && Math.abs(step - tallThumbStep) > 0.25) setTallThumbStep(step);
      setGallerySlideDir(direction);
      setFeaturedIndex((current) => (current + direction + sortedItems.length) % sortedItems.length);
      if (reduceMotion || tallThumbVisible === 0 || step <= 0) return;
      const nextAnim = { from, dir: direction };
      tallThumbAnimRef.current = nextAnim;
      setTallThumbAnim(nextAnim);
      if (direction === 1) {
        tallThumbTweenRef.current = true;
        setTallThumbTween(true);
        setTallThumbX(-step);
      } else {
        tallThumbTweenRef.current = false;
        setTallThumbTween(false);
        setTallThumbX(-step);
      }
      if (tallThumbUnlockTimer.current) clearTimeout(tallThumbUnlockTimer.current);
      tallThumbUnlockTimer.current = setTimeout(() => {
        finishTallThumbAnim();
      }, TALL_ROW_SLIDE_MS + 48);
      return;
    }
    setGallerySlideDir(direction);
    setFeaturedIndex((current) => (current + direction + sortedItems.length) % sortedItems.length);
  };
  const baseWidth = `${galleryMaxWidthClass(presentation.maxWidth)} ${galleryPlacementClass(presentation.placement)} w-full`;
  const useOverlayTitles = presentation.titlePlacement === 'overlay';
  const isClipCoverDesign = presentation.design === 'featured-strip' || presentation.design === 'tall-row';

  useLayoutEffect(() => {
    if (presentation.design !== 'tall-row' || tallThumbVisible === 0) return;
    const node = tallThumbViewRef.current;
    if (!node) return;
    const update = () => {
      if (tallThumbAnimRef.current) return;
      const itemWidth = (node.clientWidth - (tallThumbVisible - 1) * hGap) / tallThumbVisible;
      const step = itemWidth + hGap;
      if (step > 0) {
        setTallThumbStep((current) => (Math.abs(current - step) > 0.25 ? step : current));
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [presentation.design, tallThumbVisible, hGap, embeddedHeader, sortedItems.length]);

  useLayoutEffect(() => {
    if (!tallThumbAnim || tallThumbAnim.dir !== -1 || reduceMotion) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !tallThumbAnimRef.current || tallThumbAnimRef.current.dir !== -1) return;
        tallThumbTweenRef.current = true;
        setTallThumbTween(true);
        setTallThumbX(0);
      });
    });
    tallThumbPrevFrame.current = frame;
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      tallThumbPrevFrame.current = null;
    };
  }, [tallThumbAnim, reduceMotion]);

  useLayoutEffect(() => {
    if (presentation.design !== 'cinema-strip') return;
    const view = cinemaViewRef.current;
    if (!view) return;
    const update = () => {
      const card = view.querySelector<HTMLElement>('[data-gallery-carousel-item]');
      if (!card) return;
      const step = card.getBoundingClientRect().width + presentation.gap;
      if (step <= 0) return;
      setCinemaStep((current) => (Math.abs(current - step) > 0.25 ? step : current));
      const trackWidth = step * sortedItems.length - presentation.gap;
      const maxX = Math.max(0, trackWidth - view.clientWidth);
      setCinemaX((current) => Math.max(0, Math.min(maxX, current)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(view);
    return () => observer.disconnect();
  }, [presentation.design, presentation.gap, presentation.captionCardWidthPx, sortedItems.length]);

  useEffect(() => {
    if (presentation.design !== 'tall-row' || sortedItems.length < 2) return;
    const preload = (offset: number) => {
      const item = sortedItems[(featuredIndex + offset + sortedItems.length) % sortedItems.length];
      if (!item?.mediaUrl || item.mediaType === 'VIDEO') return;
      const image = new window.Image();
      image.src = item.mediaUrl;
    };
    preload(1);
    preload(-1);
  }, [featuredIndex, presentation.design, sortedItems]);

  const openLightbox = (item: ProfileGalleryItem) => {
    if (presentation.lightboxEnabled) setActiveItem(item);
  };

  const scrollCarousel = (direction: -1 | 1) => {
    const node = scrollRef.current;
    if (!node || scrollCarouselLock.current) return;
    const cards = Array.from(node.querySelectorAll<HTMLElement>('[data-gallery-carousel-item]'));
    if (!cards.length) return;

    const scrollerRect = node.getBoundingClientRect();
    const leftOf = (card: HTMLElement) =>
      card.getBoundingClientRect().left - scrollerRect.left + node.scrollLeft;
    const current = node.scrollLeft;
    const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
    const nextCard =
      direction === 1
        ? cards.find((card) => leftOf(card) > current + 4)
        : [...cards].reverse().find((card) => leftOf(card) < current - 4);
    const targetLeft = Math.max(
      0,
      Math.min(maxScroll, nextCard ? leftOf(nextCard) : direction === 1 ? maxScroll : 0)
    );
    if (Math.abs(targetLeft - current) < 1) return;

    scrollCarouselRestore.current?.();
    scrollCarouselLock.current = true;
    const previousSnap = node.style.scrollSnapType;
    node.style.scrollSnapType = 'none';
    node.scrollTo({ left: targetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      scrollCarouselLock.current = false;
      node.style.scrollSnapType = previousSnap;
      node.removeEventListener('scrollend', restore);
      if (scrollCarouselRestore.current === restore) scrollCarouselRestore.current = null;
    };
    scrollCarouselRestore.current = restore;
    node.addEventListener('scrollend', restore);
    window.setTimeout(restore, reduceMotion ? 32 : 720);
  };

  const cycleCinema = (direction: -1 | 1) => {
    const view = cinemaViewRef.current;
    if (!view || cinemaLockRef.current || sortedItems.length < 2) return;
    const card = view.querySelector<HTMLElement>('[data-gallery-carousel-item]');
    const step = card ? card.getBoundingClientRect().width + presentation.gap : cinemaStep;
    if (step <= 0) return;
    const trackWidth = step * sortedItems.length - presentation.gap;
    const maxX = Math.max(0, trackWidth - view.clientWidth);
    const next = Math.max(0, Math.min(maxX, cinemaX + direction * step));
    if (Math.abs(next - cinemaX) < 0.5) return;
    if (Math.abs(step - cinemaStep) > 0.25) setCinemaStep(step);
    if (!reduceMotion) {
      cinemaLockRef.current = true;
      setCinemaSliding(true);
      if (cinemaUnlockTimer.current) clearTimeout(cinemaUnlockTimer.current);
      cinemaUnlockTimer.current = setTimeout(() => {
        cinemaLockRef.current = false;
        setCinemaSliding(false);
        cinemaUnlockTimer.current = null;
      }, CINEMA_SLIDE_MS + 40);
    }
    setCinemaX(next);
  };

  const scrollToCarouselPage = (page: number) => {
    const node = scrollRef.current;
    if (!node) return;
    setCarouselPage(page);
    const card = node.querySelector<HTMLElement>('[data-gallery-carousel-item]');
    const step = card ? card.offsetWidth + captionGap : node.clientWidth * 0.85;
    node.scrollTo({ left: page * step * presentation.columns, behavior: 'smooth' });
  };

  const captionPageCount = useMemo(() => {
    if (presentation.design !== 'caption-carousel') return 1;
    return Math.max(1, Math.ceil(sortedItems.length / presentation.columns));
  }, [presentation.design, presentation.columns, sortedItems.length]);

  const media = (item: ProfileGalleryItem, lightbox = false, eager = false, highPriority = false) => {
    const zoomClass =
      presentation.hoverZoom && !lightbox && !isClipCoverDesign && presentation.design !== 'cinema-strip'
        ? 'h-full w-full transition-transform duration-500 group-hover:scale-105'
        : 'h-full w-full';
    const objectFit = lightbox
      ? 'contain'
      : isClipCoverDesign || presentation.design === 'cinema-strip'
        ? 'cover'
        : presentation.objectFit;
    const columnShare = Math.max(2, presentation.columns || 2);
    const sizes = lightbox
      ? '100vw'
      : highPriority
        ? '(max-width: 768px) 100vw, min(1200px, 72vw)'
        : presentation.design === 'cinema-strip'
          ? '(max-width: 768px) 86vw, 680px'
          : presentation.design === 'caption-carousel'
            ? '(max-width: 768px) 88vw, 420px'
            : `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${Math.round(100 / columnShare)}vw`;
    const deferred = (
      <PortfolioDeferredMedia
        src={item.mediaUrl}
        alt={galleryItemDisplayTitle(item.title) || 'Gallery media'}
        className={zoomClass}
        sizes={sizes}
        eager={lightbox || eager}
        highPriority={lightbox || highPriority}
        kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
        objectFit={objectFit}
        objectPosition={presentation.objectPosition}
        autoPlayVideo={!lightbox && item.mediaType === 'VIDEO'}
        controls={lightbox && item.mediaType === 'VIDEO'}
        showPlayBadge={!lightbox && item.mediaType === 'VIDEO'}
        fillParent={lightbox || presentation.imageAspect !== 'auto'}
      />
    );
    if (!lightbox) return deferred;
    return <div className="relative h-[min(82vh,900px)] w-[min(92vw,1200px)] max-w-[92vw]">{deferred}</div>;
  };

  const persistentOverlayTitle = (itemTitle: string, revealOnHover = false) => (
    <span
      className={`pf-gallery-media-title pf-gallery-media-title--in-frame pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 py-5 text-center text-white sm:px-5 sm:py-6${
        presentation.design === 'tall-row' ? ' pf-gallery-media-title--aeonik pf-gallery-media-title--tall' : ''
      }${
        revealOnHover
          ? ' opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100'
          : ''
      }`}
    >
      {itemTitle}
    </span>
  );

  const card = (
    item: ProfileGalleryItem,
    index: number,
    options?: {
      forceOverlay?: boolean;
      overlayOnHover?: boolean;
      forceAspect?: CSSProperties;
      fill?: boolean;
      emphasis?: 'hero';
      hideTitle?: boolean;
      onActivate?: () => void;
      eager?: boolean;
    }
  ) => {
    const isCinemaStrip = presentation.design === 'cinema-strip';
    const cinemaStart = cinemaStep > 0 ? Math.max(0, Math.round(cinemaX / cinemaStep)) : 0;
    const loadMediaEager =
      Boolean(options?.eager) ||
      (isCinemaStrip && index >= cinemaStart - 1 && index <= cinemaStart + 4);
    const itemTitle = galleryItemDisplayTitle(item.title);
    const isEditorial = presentation.design === 'editorial-split';
    const editorialClass = isEditorial
      ? index % 3 === 0
        ? 'lg:col-span-2'
        : 'lg:col-span-1'
      : '';
    const aspect =
      options?.fill
        ? {}
        : options?.forceAspect ??
          (presentation.imageAspect === 'auto'
            ? {}
            : galleryAspectStyle(presentation.imageAspect));
    const overlayOnHover = Boolean(options?.overlayOnHover);
    const overlayActive =
      !isCinemaStrip &&
      Boolean(itemTitle) &&
      (Boolean(options?.forceOverlay) ||
        overlayOnHover ||
        (!options?.hideTitle && showItemTitle && useOverlayTitles));
    const showUnderTitle =
      !options?.hideTitle &&
      showItemTitle &&
      Boolean(itemTitle) &&
      (isCinemaStrip || presentation.titlePlacement === 'under');
    const activate = () => {
      if (options?.onActivate) {
        options.onActivate();
        return;
      }
      openLightbox(item);
    };
    const isInteractive = Boolean(options?.onActivate || presentation.lightboxEnabled);
    const deferLayoutPaint =
      presentation.design !== 'cinema-strip' &&
      presentation.design !== 'featured-strip' &&
      presentation.design !== 'tall-row';
    return (
      <article
        key={item.id}
        className={`group relative break-inside-avoid ${
          isCinemaStrip ? 'flex flex-col overflow-visible' : 'overflow-hidden'
        } ${editorialClass} ${
          options?.fill ? 'flex h-full w-full flex-col' : ''
        } ${deferLayoutPaint ? 'pf-gallery-tile' : ''} ${
          isInteractive
            ? `${options?.onActivate ? 'cursor-pointer' : 'cursor-zoom-in'} focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500`
            : ''
        }`}
        style={{
          borderRadius: isClipCoverDesign ? 'var(--gallery-frame-radius, 16px)' : `${presentation.radius}px`,
          overflow: isCinemaStrip ? 'visible' : 'hidden',
        }}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        aria-label={
          options?.onActivate
            ? `Afficher ${galleryItemDisplayTitle(item.title) || 'ce média'}`
            : presentation.lightboxEnabled
              ? `Ouvrir ${item.title}`
              : undefined
        }
        onClick={activate}
        onKeyDown={(event) => {
          if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            activate();
          }
        }}
      >
        <div
          className={`relative w-full overflow-hidden ${
            options?.fill ? 'flex-1 min-h-[12rem] bg-neutral-100 dark:bg-neutral-900' : isCinemaStrip ? 'z-10 w-full bg-transparent' : 'h-full min-h-[12rem] bg-neutral-100 dark:bg-neutral-900'
          } ${
            isCinemaStrip
              ? 'transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-16'
              : ''
          }`}
          style={
            isClipCoverDesign
              ? {
                  ...aspect,
                  borderRadius: 'var(--gallery-frame-radius, 16px)',
                  overflow: 'hidden',
                }
              : {
                  ...aspect,
                  borderRadius: isCinemaStrip ? `${presentation.radius}px` : undefined,
                }
          }
        >
          {media(item, false, loadMediaEager, options?.emphasis === 'hero')}
          {overlayOnHover ? (
            <span
              className="pointer-events-none absolute inset-0 z-[9] bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
              aria-hidden
            />
          ) : null}
          {overlayActive && itemTitle ? persistentOverlayTitle(itemTitle, overlayOnHover) : null}
        </div>
        {showUnderTitle ? (
          <h3
            className={
              isCinemaStrip
                ? 'pf-gallery-media-title pf-gallery-media-title--cinema pf-gallery-media-title--aeonik pointer-events-none absolute inset-x-0 bottom-0 z-0 px-3 pb-1 text-center opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100'
                : 'pf-gallery-media-title px-1 pb-1 pt-3 text-center'
            }
            style={{ color: presentation.itemTitleColor }}
          >
            {itemTitle}
          </h3>
        ) : null}
      </article>
    );
  };

  const captionCard = (item: ProfileGalleryItem, index = 0) => {
    const itemTitle = galleryItemDisplayTitle(item.title);
    const cardSizePx = presentation.captionCardWidthPx;
    const cardPadding = Math.max(12, Math.min(presentation.padding || 16, 18));
    const cardBorderColor =
      presentation.galleryPalette?.bordure ??
      `color-mix(in srgb, ${presentation.cardSurfaceColor} 38%, transparent)`;
    const isOriginalRatio = presentation.imageAspect === 'auto';
    const mediaAspect = galleryAspectStyle(presentation.imageAspect);
    return (
      <article
        key={item.id}
        data-gallery-carousel-item
        className={`group shrink-0 snap-start ${
          presentation.lightboxEnabled ? 'cursor-zoom-in' : ''
        } flex flex-col gap-3 border bg-transparent px-[var(--gallery-card-padding-x)] py-[var(--gallery-card-padding-y)] transition-all duration-300`}
        style={
          {
            width: `min(88vw, ${cardSizePx}px)`,
            borderRadius: `${presentation.radius}px`,
            borderColor: cardBorderColor,
            '--gallery-card-padding-x': `${cardPadding}px`,
            '--gallery-card-padding-y': `${cardPadding}px`,
          } as CSSProperties
        }
        role={presentation.lightboxEnabled ? 'button' : undefined}
        tabIndex={presentation.lightboxEnabled ? 0 : undefined}
        onClick={() => openLightbox(item)}
        onKeyDown={(event) => {
          if (presentation.lightboxEnabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            openLightbox(item);
          }
        }}
      >
        <div
          className="relative w-full shrink-0 overflow-hidden bg-transparent"
          style={{
            ...mediaAspect,
            borderRadius: `${presentation.radius}px`,
          }}
        >
          <PortfolioDeferredMedia
            src={item.mediaUrl}
            alt={galleryItemDisplayTitle(item.title) || 'Gallery media'}
            className="h-full w-full"
            sizes="(max-width: 768px) 88vw, 420px"
            eager={index < 2}
            kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
            objectFit={isOriginalRatio ? 'contain' : presentation.objectFit}
            objectPosition={presentation.objectPosition}
            autoPlayVideo={item.mediaType === 'VIDEO'}
            showPlayBadge={item.mediaType === 'VIDEO'}
            fillParent={!isOriginalRatio}
          />
        </div>
        {showItemTitle && itemTitle ? (
          <h3
            className="pf-gallery-media-title pf-gallery-media-title--caption w-full shrink-0 pb-1 pt-1 text-center"
            style={{ color: presentation.subtitleColor }}
          >
            {itemTitle}
          </h3>
        ) : null}
      </article>
    );
  };

  const carouselNavButtons = (
    className?: string,
    onNavigate?: (direction: -1 | 1) => void,
    size: 'md' | 'lg' = 'md',
    forceVisible = false
  ) =>
    (forceVisible || (presentation.showCarouselNav && galleryDesignUsesCarouselNav(presentation.design))) ? (
      <div className={`flex items-center justify-center gap-4 ${className ?? ''}`}>
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => (onNavigate ?? scrollCarousel)(direction)}
            className={`flex items-center justify-center rounded-full border transition duration-200 ease-out hover:scale-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-current active:scale-95 ${
              size === 'lg' ? 'h-16 w-16 text-3xl' : 'h-14 w-14 text-2xl'
            }`}
            style={{
              backgroundColor:
                presentation.galleryPalette?.neutre ?? presentation.cardSurfaceColor ?? '#ffffff',
              borderColor:
                presentation.galleryPalette?.bordure ??
                `color-mix(in srgb, ${presentation.itemTitleColor} 32%, transparent)`,
              color: presentation.itemTitleColor,
            }}
            aria-label={direction === -1 ? 'Previous' : 'Next'}
          >
            {direction === -1 ? '‹' : '›'}
          </button>
        ))}
      </div>
    ) : null;

  const paginationDots =
    presentation.design === 'caption-carousel' && presentation.showPagination && captionPageCount > 1 ? (
      <div className="mt-6 flex items-center justify-center gap-3">
        {Array.from({ length: captionPageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToCarouselPage(index)}
            className={`h-4 w-4 rounded-full transition ${
              carouselPage === index ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
            aria-label={`Page ${index + 1}`}
            aria-current={carouselPage === index ? 'true' : undefined}
          />
        ))}
      </div>
    ) : null;

  const content =
    presentation.design === 'caption-carousel' ? (
      <div className={baseWidth} style={{ padding: `${presentation.padding}px` }}>
        <div
          ref={scrollRef}
          className="flex items-start snap-x snap-mandatory overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: `${presentation.gap}px` }}
        >
          {sortedItems.map(captionCard)}
        </div>
        {presentation.captionPager === 'dots'
          ? paginationDots
          : carouselNavButtons('mt-6', undefined, 'lg', presentation.showPagination)}
      </div>
    ) : presentation.design === 'cinema-strip' ? (
      <div className={baseWidth} style={{ padding: `${presentation.padding}px` }}>
        <div className="mb-4 flex justify-end">{carouselNavButtons(undefined, cycleCinema)}</div>
        <div
          ref={cinemaViewRef}
          className={`overflow-hidden pt-16 ${cinemaSliding ? 'pointer-events-none' : ''}`}
        >
          <motion.div
            className="flex items-end transform-gpu"
            style={{ gap: `${presentation.gap}px` }}
            initial={false}
            animate={{ x: -cinemaX }}
            transition={
              reduceMotion
                ? { type: false }
                : { type: 'tween', duration: CINEMA_SLIDE_MS / 1000, ease: [0.33, 1, 0.68, 1] }
            }
          >
            {sortedItems.map((item, index) => (
              <div
                key={item.id}
                data-gallery-carousel-item
                className="h-auto shrink-0"
                style={{ width: `min(86vw, ${Math.round(presentation.captionCardWidthPx * 1.65)}px)` }}
              >
                {card(item, index)}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    ) : presentation.design === 'hero-mosaic' ? (
      <div
        className={`${baseWidth} flex flex-col`}
        style={{
          rowGap: `${Math.max(vGap, 24)}px`,
          padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
        }}
      >
        {mosaicChunks.map((chunk, chunkIndex) => {
          const plan = heroMosaicPlan(chunk.length);
          const [heroItem, ...tiles] = chunk;
          const offset = chunkIndex * HERO_MOSAIC_CHUNK;
          if (!heroItem) return null;
          return (
            <div
              key={heroItem.id}
              className={`grid ${plan.containerClass}`}
              style={mosaicGridStyle}
            >
              <div className={`min-w-0 ${plan.heroClass}`}>
                {card(heroItem, offset, { fill: true, emphasis: 'hero', hideTitle: true, eager: chunkIndex === 0 })}
              </div>
              {tiles.map((item, index) => (
                <div key={item.id} className={`min-w-0 ${plan.tileClass(index)}`}>
                  {card(item, offset + index + 1, { fill: true, hideTitle: true })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    ) : presentation.design === 'featured-strip' ? (
      <div
        className={baseWidth}
        style={{
          padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
          ['--gallery-frame-radius' as string]: `${presentation.radius}px`,
        }}
      >
        {stripPlan.layout === 'solo' || !featuredItem ? (
          <div
            className="h-[min(62vh,580px)] w-full overflow-hidden"
            style={stripClipStyle}
          >
            {featuredItem
              ? (
                <div key={featuredItem.id} className="pf-featured-in">
                  {card(featuredItem, featuredIndex, { fill: true, emphasis: 'hero', hideTitle: true, eager: true })}
                </div>
              )
              : null}
          </div>
        ) : presentation.featuredRailPlacement === 'bottom' ? (
          <div
            className={`flex w-full max-w-full flex-col ${
              (presentation.featuredHeroWidthScope ?? 'hero') === 'global'
                ? galleryPlacementClass(presentation.featuredHeroPlacement)
                : ''
            }`}
            style={{
              gap: stripGap,
              ...((presentation.featuredHeroWidthScope ?? 'hero') === 'global'
                ? { width: `${presentation.featuredHeroWidthPercent ?? 100}%` }
                : {}),
            }}
          >
            {embeddedHeader && galleryFeaturedHeroHasTitleVoid(presentation) ? (
              <div className="lg:hidden">{embeddedHeader}</div>
            ) : null}
            {(() => {
              const heroPercent = presentation.featuredHeroWidthPercent ?? 100;
              const heroPlace = presentation.featuredHeroPlacement ?? 'center';
              const titleBeside =
                Boolean(embeddedHeader) && galleryFeaturedHeroHasTitleVoid(presentation);
              const titleCell = titleBeside ? (
                <div className="hidden min-h-0 min-w-0 px-4 lg:flex lg:items-center lg:justify-center">
                  <div className="max-w-lg text-center">{embeddedHeader}</div>
                </div>
              ) : null;
              const heroCell = (
                <div
                  className={`h-[min(58vh,540px)] max-w-full overflow-hidden ${
                    titleBeside
                      ? 'w-full'
                      : (presentation.featuredHeroWidthScope ?? 'hero') === 'hero'
                        ? galleryPlacementClass(heroPlace)
                        : 'w-full'
                  }`}
                  style={{
                    ...stripClipStyle,
                    ...(!titleBeside && (presentation.featuredHeroWidthScope ?? 'hero') === 'hero'
                      ? { width: `${heroPercent}%` }
                      : {}),
                  }}
                >
                  <div key={featuredItem.id} className="pf-featured-in">
                    {card(featuredItem, featuredIndex, { fill: true, emphasis: 'hero', hideTitle: true, eager: true })}
                  </div>
                </div>
              );
              const heroTrackClass =
                titleBeside && heroPlace === 'right'
                  ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,var(--featured-hero-w))]'
                  : titleBeside && heroPlace === 'center'
                    ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,var(--featured-hero-w))_minmax(0,1fr)]'
                    : titleBeside
                      ? 'lg:grid-cols-[minmax(0,var(--featured-hero-w))_minmax(0,1fr)]'
                      : '';
              return (
                <div
                  className={`grid w-full max-w-full grid-cols-1 items-stretch ${heroTrackClass}`}
                  style={
                    {
                      gap: stripGap,
                      ['--featured-hero-w' as string]: `${heroPercent}%`,
                    } as CSSProperties
                  }
                >
                  {titleBeside && heroPlace === 'right' ? titleCell : null}
                  {titleBeside && heroPlace === 'center' ? <div className="hidden lg:block" aria-hidden /> : null}
                  {heroCell}
                  {titleBeside && heroPlace !== 'right' ? titleCell : null}
                </div>
              );
            })()}
            <div
              ref={scrollRef}
              className={
                featuredThumbs.length > 4
                  ? 'flex snap-x snap-proximity overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                  : 'grid'
              }
              style={
                featuredThumbs.length > 4
                  ? { gap: stripGap }
                  : {
                      gap: stripGap,
                      gridTemplateColumns: `repeat(${Math.max(1, featuredThumbs.length)}, minmax(0, 1fr))`,
                    }
              }
            >
              {featuredThumbs.map(({ item, index }, slot) => (
                <div
                  key={item.id}
                  data-gallery-carousel-item
                  className={
                    featuredThumbs.length > 4
                      ? 'aspect-[4/3] h-[min(22vh,210px)] w-auto shrink-0 snap-start overflow-hidden'
                      : 'aspect-[4/3] min-h-[160px] min-w-0 overflow-hidden'
                  }
                  style={stripClipStyle}
                >
                  {card(item, index, {
                    fill: true,
                    hideTitle: true,
                    onActivate: () => setFeaturedIndex(index),
                    eager: slot < 4,
                  })}
                </div>
              ))}
            </div>
            {sortedItems.length > 1 ? carouselNavButtons('mt-4 lg:justify-end', cycleFeatured) : null}
          </div>
        ) : (
          <div className="flex w-full flex-col" style={{ gap: stripGap }}>
            <div
              className="grid grid-cols-1 items-stretch lg:h-[min(64vh,600px)] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
              style={{ gap: stripGap }}
            >
              <div
                className="min-h-[260px] min-w-0 overflow-hidden lg:h-full lg:min-h-0"
                style={stripClipStyle}
              >
                <div key={featuredItem.id} className="pf-featured-in">
                  {card(featuredItem, featuredIndex, { fill: true, emphasis: 'hero', hideTitle: true, eager: true })}
                </div>
              </div>
              <div
                ref={scrollRef}
                className={`grid h-full min-h-0 min-w-0 auto-rows-[minmax(140px,auto)] lg:auto-rows-[minmax(0,1fr)] lg:overflow-hidden ${
                  featuredThumbs.length > 1 ? 'lg:grid-cols-2' : 'grid-cols-1'
                } ${featuredThumbs.length > 4 ? 'lg:overflow-y-auto' : ''}`}
                style={{ gap: `min(${stripGap}, 14px)` }}
              >
                {featuredThumbs.map(({ item, index }, slot) => (
                  <div
                    key={item.id}
                    data-gallery-carousel-item
                    className="min-h-[140px] min-w-0 overflow-hidden lg:min-h-0"
                    style={stripClipStyle}
                  >
                    {card(item, index, {
                      fill: true,
                      hideTitle: true,
                      onActivate: () => setFeaturedIndex(index),
                      eager: slot < 4,
                    })}
                  </div>
                ))}
              </div>
            </div>
            {sortedItems.length > 1 ? carouselNavButtons('justify-end', cycleFeatured) : null}
          </div>
        )}
      </div>
    ) : presentation.design === 'tall-row' ? (
      <div
        className={baseWidth}
        style={{
          padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
          ['--gallery-frame-radius' as string]: `${presentation.radius}px`,
        }}
      >
        <div className="flex w-full flex-col" style={{ gap: stripGap }}>
          <div className="flex flex-col lg:flex-row lg:items-stretch" style={{ gap: stripGap }}>
            {tallHero ? (
              <div
                className="relative min-w-0 overflow-hidden lg:w-[min(100%,32%)] lg:flex-none"
                style={{
                  ...stripClipStyle,
                  aspectRatio: '3 / 4',
                }}
              >
                <AnimatePresence initial={false}>
                  <motion.div key={tallHero.item.id} className="absolute inset-0" initial={false}>
                    {card(tallHero.item, tallHero.index, {
                      fill: true,
                      emphasis: 'hero',
                      hideTitle: true,
                      forceOverlay: showItemTitle && (presentation.tallRowTitleReveal ?? 'always') !== 'hover',
                      overlayOnHover: showItemTitle && (presentation.tallRowTitleReveal ?? 'always') === 'hover',
                      eager: true,
                    })}
                    {reduceMotion ? null : (
                      <motion.div
                        className="pointer-events-none absolute inset-0 z-20 bg-neutral-950/15"
                        initial={{ opacity: 0.55 }}
                        animate={{ opacity: 0 }}
                        transition={{
                          duration: TALL_ROW_SLIDE_MS / 1000,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {embeddedHeader ? (
                <div className="px-2 text-center">{embeddedHeader}</div>
              ) : null}
              {tallThumbTrack.length ? (
                <div
                  ref={tallThumbViewRef}
                  className="mt-8 w-full overflow-hidden [container-type:inline-size] lg:mt-auto lg:h-[74%] lg:flex-none"
                >
                  <motion.div
                    className="flex h-full transform-gpu"
                    style={{
                      gap: stripGap,
                      willChange: tallThumbTween ? 'transform' : 'auto',
                    }}
                    initial={false}
                    animate={{ x: tallThumbX }}
                    transition={
                      reduceMotion || !tallThumbTween
                        ? { type: false }
                        : { type: 'tween', duration: TALL_ROW_SLIDE_MS / 1000, ease: [0.33, 1, 0.68, 1] }
                    }
                    onAnimationComplete={() => {
                      if (!tallThumbAnimRef.current || !tallThumbTweenRef.current) return;
                      finishTallThumbAnim();
                    }}
                  >
                    {tallThumbTrack.map(({ item, index }, slot) => (
                      <div
                        key={item.id}
                        className="aspect-square min-h-[140px] overflow-hidden lg:aspect-auto lg:h-full lg:min-h-0"
                        style={{
                          ...stripClipStyle,
                          flex: `0 0 ${
                            tallThumbStep > 0
                              ? `${Math.max(0, tallThumbStep - hGap)}px`
                              : `calc((100cqi - ${(tallThumbVisible - 1) * hGap}px) / ${Math.max(1, tallThumbVisible)})`
                          }`,
                        }}
                      >
                        {card(item, index, {
                          fill: true,
                          hideTitle: true,
                          forceOverlay: showItemTitle && (presentation.tallRowTitleReveal ?? 'always') !== 'hover',
                          overlayOnHover: showItemTitle && (presentation.tallRowTitleReveal ?? 'always') === 'hover',
                          eager: slot < tallThumbVisible,
                        })}
                      </div>
                    ))}
                  </motion.div>
                </div>
              ) : null}
            </div>
          </div>
          {sortedItems.length > 1 ? carouselNavButtons('justify-end', cycleFeatured) : null}
        </div>
      </div>
    ) : (
      <div
        className={`${baseWidth} grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr))]`}
        style={gridStyle}
      >
        {sortedItems.map((item, index) => card(item, index))}
      </div>
    );

  return (
    <>
      {content}
      {activeItem && presentation.lightboxEnabled
        ? createPortal(
            <div
              className="fixed inset-0 z-[220] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-label={activeItem.title}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setActiveItem(null);
              }}
            >
              <div className="relative flex max-h-[92vh] max-w-[96vw] flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="absolute -right-2 -top-12 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  aria-label="Fermer la galerie"
                  autoFocus
                >
                  ×
                </button>
                {media(activeItem, true)}
                {presentation.showTitle && galleryItemDisplayTitle(activeItem.title) ? (
                  <p className="text-center text-sm font-medium text-white sm:text-base">
                    {galleryItemDisplayTitle(activeItem.title)}
                  </p>
                ) : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function useSectionTitleStuck(enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsStuck(false);
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const scrollRoot = getScrollParent(sentinel);
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      {
        root: scrollRoot,
        threshold: 0,
        rootMargin: scrollRoot ? '0px 0px 0px 0px' : '-72px 0px 0px 0px',
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled]);

  return { sentinelRef, isStuck };
}

/**
 * Tracks whether the section enclosing the returned ref currently spans the
 * vertical center of the viewport (or pages-mode scroll pane).
 */
function useSectionCenterActive(enabled: boolean) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    const anchor = anchorRef.current;
    const section = anchor?.closest('section');
    if (!section) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollRoot = getScrollParent(section as HTMLElement);
      const rect = section.getBoundingClientRect();
      if (scrollRoot) {
        const rootRect = scrollRoot.getBoundingClientRect();
        const centerY = rootRect.top + rootRect.height / 2;
        setActive(rect.top <= centerY && rect.bottom >= centerY);
      } else {
        const centerY = window.innerHeight / 2;
        setActive(rect.top <= centerY && rect.bottom >= centerY);
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const scrollRoot = getScrollParent(section as HTMLElement);
    update();
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return { anchorRef, active };
}

function wrapSectionTitleChrome(
  node: React.ReactNode,
  chromeClass?: string,
  chromeStyle?: React.CSSProperties
) {
  const hasChrome =
    Boolean(chromeClass?.trim()) || Boolean(chromeStyle && Object.keys(chromeStyle).length > 0);
  if (!hasChrome) return node;
  return (
    <div className={chromeClass} style={chromeStyle}>
      {node}
    </div>
  );
}

/**
 * Split-screen left rail: one word per line (title only).
 * We intentionally avoid breaking a single word into multiple lines (letter-wrap).
 * If the word doesn't fit, the auto-fit logic reduces font-size instead.
 */
function SplitRailTitleLines({
  title,
  decorationStyle,
}: {
  title: string;
  decorationStyle?: React.CSSProperties;
}) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const hasDecoration = Boolean(decorationStyle && Object.keys(decorationStyle).length > 0);

  if (words.length <= 1) {
    const content = hasDecoration ? <span style={decorationStyle}>{title}</span> : <>{title}</>;
    return (
      <span className="block max-w-full whitespace-nowrap text-balance">
        {content}
      </span>
    );
  }

  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="block max-w-full whitespace-nowrap text-balance"
        >
          {hasDecoration ? <span style={decorationStyle}>{word}</span> : word}
        </span>
      ))}
    </>
  );
}

const SPLIT_RAIL_DEFAULT_TITLE_CLASS =
  'text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:text-5xl lg:leading-[0.95] dark:text-white';

function useSplitRailAutoFitTitle(
  titleRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
  deps: unknown[]
) {
  useLayoutEffect(() => {
    const title = titleRef.current;
    const container = containerRef.current;
    if (!title || !container) return;

    const fit = () => {
      title.style.fontSize = '';
      const computed = window.getComputedStyle(title);
      let sizePx = Number.parseFloat(computed.fontSize);
      if (!Number.isFinite(sizePx)) return;

      const minPx = 14;
      const maxWidth = container.clientWidth;
      if (maxWidth <= 0) return;

      let guard = 0;
      while (title.scrollWidth > maxWidth && sizePx > minPx && guard < 96) {
        sizePx -= 1;
        title.style.fontSize = `${sizePx}px`;
        guard += 1;
      }
    };

    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(container);
    window.addEventListener('resize', fit);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, deps);
}

function SplitRailAutoFitHeading({
  className,
  style,
  children,
  chromeClass,
  chromeStyle,
}: {
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  chromeClass?: string;
  chromeStyle?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useSplitRailAutoFitTitle(titleRef, containerRef, [className, style, children]);

  return (
    <div ref={containerRef} className="w-full max-w-full">
      {wrapSectionTitleChrome(
        <h2
          ref={titleRef}
          className={`max-w-full ${className}`}
          style={style}
        >
          {children}
        </h2>,
        chromeClass,
        chromeStyle
      )}
    </div>
  );
}

function formatServiceDeliveryLabel(deadline: string): string {
  const trimmed = deadline.trim();
  if (!trimmed) return '';

  if (/day|days|week|hour|month/i.test(trimmed)) {
    return trimmed;
  }

  const numberMatch = trimmed.match(/^(\d+)/);
  if (numberMatch) {
    const count = Number.parseInt(numberMatch[1], 10);
    if (Number.isFinite(count)) {
      return `${count} ${count === 1 ? 'day' : 'days'}`;
    }
  }

  return trimmed;
}

function resolveServicePrice(service: ProfileServiceItem): {
  hasPrice: boolean;
  isFree: boolean;
  amount: string | null;
} {
  if (service.basePriceCents == null || Number.isNaN(Number(service.basePriceCents))) {
    return { hasPrice: false, isFree: false, amount: null };
  }
  const cents = Number(service.basePriceCents);
  if (cents === 0) {
    return { hasPrice: true, isFree: true, amount: 'Free' };
  }
  return {
    hasPrice: true,
    isFree: false,
    amount: formatServicesPriceAmount(cents),
  };
}

function ServicePriceAmount({
  amount,
  currencySymbol,
  pricePrefix,
  currencyPlacement,
  isFree = false,
}: {
  amount: string;
  currencySymbol: string;
  pricePrefix: string | null;
  currencyPlacement: 'before' | 'after';
  isFree?: boolean;
}) {
  if (isFree) {
    return <>Free</>;
  }
  return (
    <>
      {pricePrefix ? <span className="mr-2 opacity-55">{pricePrefix}</span> : null}
      {currencyPlacement === 'before' ? (
        <span className="mr-0.5">{currencySymbol}</span>
      ) : null}
      {amount}
      {currencyPlacement === 'after' ? (
        <span className="ml-1">{currencySymbol}</span>
      ) : null}
    </>
  );
}

function servicePriceTextStyle(style: CSSProperties): CSSProperties {
  // All service card designs: price / tarif always bold.
  return { ...style, fontWeight: 700 };
}

function resolveServicesPrincipalColor(
  presentation: PortfolioServicesPresentationSettings
): string {
  if (presentation.useHeroPalette !== false) {
    return resolveHeroPaletteColor(
      mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette),
      'principal'
    );
  }
  return presentation.cardAccentColor?.trim() || DEFAULT_SERVICES_ACCENT_COLOR;
}

/** Hover: title / price ink → palette principal (inline color needs !important). */
const SERVICES_CARD_TITLE_HOVER_CLASS =
  'transition-colors duration-200 group-hover:!text-[color:var(--pf-services-principal)]';
const SERVICES_CARD_PRICE_HOVER_CLASS =
  'transition-colors duration-300 ease-out group-hover:!text-[color:var(--pf-services-principal)]';

/** Shared principal-fill hover for non-featured cards (Plan / Liste / Liste commerciale / Plan en colonnes). */
const SERVICES_PRINCIPAL_HOVER_INK_CLASS =
  'transition-colors duration-300 ease-out group-hover:![color:var(--pf-services-principal-hover-ink)]';
const SERVICES_PRINCIPAL_HOVER_MUTED_CLASS =
  'transition-colors duration-300 ease-out group-hover:![color:var(--pf-services-principal-hover-muted)]';
const SERVICES_PRINCIPAL_HOVER_CARD_CLASS =
  'transition-[background-color,border-color,box-shadow] duration-300 ease-out hover:border-[color:var(--pf-services-principal)] hover:![background-color:var(--pf-services-principal)] hover:shadow-md';
const SERVICES_PRINCIPAL_HOVER_CTA_WRAP_CLASS =
  '[&_a]:transition-[background-color,color,border-color,box-shadow] [&_a]:duration-300 [&_a]:ease-out group-hover:[&_a]:!border-[color:var(--pf-services-principal-hover-ink)] group-hover:[&_a]:!bg-[var(--pf-services-principal-hover-ink)] group-hover:[&_a]:!text-[var(--pf-services-principal)] group-hover:[&_a_span]:!text-[var(--pf-services-principal)] group-hover:[&_a_svg]:!text-[var(--pf-services-principal)] group-hover:[&_a]:!shadow-none';

/**
 * Featured principal-surface cards: static principal fill + inverted ink/CTA.
 * No hover that changes this principal background (other cards keep full hover).
 */
const SERVICES_PRINCIPAL_SURFACE_CARD_CLASS =
  '![background-color:var(--pf-services-principal)] !border-2 !border-[color:var(--pf-services-principal)] shadow-md';
const SERVICES_PRINCIPAL_SURFACE_INK_CLASS =
  '![color:var(--pf-services-principal-hover-ink)]';
const SERVICES_PRINCIPAL_SURFACE_MUTED_CLASS =
  '![color:var(--pf-services-principal-hover-muted)]';
const SERVICES_PRINCIPAL_SURFACE_CTA_WRAP_CLASS =
  '[&_a]:!border-[color:var(--pf-services-principal-hover-ink)] [&_a]:!bg-[var(--pf-services-principal-hover-ink)] [&_a]:!text-[var(--pf-services-principal)] [&_a_span]:!text-[var(--pf-services-principal)] [&_a_svg]:!text-[var(--pf-services-principal)] [&_a]:!shadow-none';
const SERVICES_PRINCIPAL_SURFACE_DIVIDER_CLASS =
  '![border-color:var(--pf-services-principal-hover-ink)]';

function servicesPrincipalCardClass(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0,
  extra = ''
): string {
  const surface = servicesPrincipalSurfaceActive(presentation, cardIndex);
  return [
    surface ? SERVICES_PRINCIPAL_SURFACE_CARD_CLASS : SERVICES_PRINCIPAL_HOVER_CARD_CLASS,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

function servicesPrincipalInkClass(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0,
  extra = ''
): string {
  return [
    servicesPrincipalSurfaceActive(presentation, cardIndex)
      ? SERVICES_PRINCIPAL_SURFACE_INK_CLASS
      : SERVICES_PRINCIPAL_HOVER_INK_CLASS,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

function servicesPrincipalMutedClass(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0,
  extra = ''
): string {
  return [
    servicesPrincipalSurfaceActive(presentation, cardIndex)
      ? SERVICES_PRINCIPAL_SURFACE_MUTED_CLASS
      : SERVICES_PRINCIPAL_HOVER_MUTED_CLASS,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

function servicesPrincipalCtaWrapClass(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0,
  extra = ''
): string {
  return [
    servicesPrincipalSurfaceActive(presentation, cardIndex)
      ? SERVICES_PRINCIPAL_SURFACE_CTA_WRAP_CLASS
      : SERVICES_PRINCIPAL_HOVER_CTA_WRAP_CLASS,
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

function servicesPrincipalBulletClass(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0,
  extra = ''
): string {
  return [
    servicesPrincipalSurfaceActive(presentation, cardIndex)
      ? // Filled glyphs (check-circle-fill): light disc + principal check on surface.
        '![color:var(--pf-services-principal-hover-ink)] ![--pf-list-marker-glyph:var(--pf-services-principal)]'
      : // Hover fill → white disc needs a dark check.
        'transition-colors duration-300 ease-out group-hover:![color:var(--pf-services-principal-hover-ink)] group-hover:[!--pf-list-marker-glyph:#111111]',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

function servicesPrincipalDividerClass(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0,
  extra = ''
): string {
  return [
    servicesPrincipalSurfaceActive(presentation, cardIndex)
      ? SERVICES_PRINCIPAL_SURFACE_DIVIDER_CLASS
      : 'transition-[border-color] duration-300 ease-out group-hover:!border-[color:var(--pf-services-principal-hover-ink)]',
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

/** Inline colors that stay readable on principal-surface cards (beats element hexes). */
function servicesPrincipalSurfaceInkColors(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex = 0
): { active: boolean; ink: string; muted: string; principal: string } {
  const principal = resolveServicesPrincipalColor(presentation);
  const active = servicesPrincipalSurfaceActive(presentation, cardIndex);
  const darkPrincipal = servicesColorLuminance(principal) < 0.55;
  return {
    active,
    principal,
    ink: darkPrincipal ? '#ffffff' : '#111111',
    muted: darkPrincipal
      ? 'color-mix(in srgb, #ffffff 80%, transparent)'
      : 'color-mix(in srgb, #111111 72%, transparent)',
  };
}

function listMarkerGlyphFallback(fillColor: string): string {
  return servicesColorLuminance(fillColor) < 0.55 ? '#ffffff' : '#111111';
}

function servicesCardPrincipalStyle(
  presentation: PortfolioServicesPresentationSettings,
  base?: CSSProperties
): CSSProperties {
  return {
    ...base,
    ['--pf-services-principal' as string]: resolveServicesPrincipalColor(presentation),
  };
}

function servicesPrincipalHoverStyle(
  presentation: PortfolioServicesPresentationSettings,
  base?: CSSProperties,
  tone: 'light' | 'muted' = 'light'
): CSSProperties {
  const principal = resolveServicesPrincipalColor(presentation);
  const ink = servicesColorLuminance(principal) < 0.55 ? '#ffffff' : '#111111';
  const muted =
    servicesColorLuminance(principal) < 0.55
      ? 'color-mix(in srgb, #ffffff 80%, transparent)'
      : 'color-mix(in srgb, #111111 72%, transparent)';
  const restSurface =
    (typeof base?.backgroundColor === 'string' && base.backgroundColor.trim()) ||
    resolveServicesCardSurfaceHex(presentation, tone) ||
    '#ffffff';
  const restInkStrong = servicesColorLuminance(restSurface) < 0.55 ? '#ffffff' : '#111111';
  const restInkMuted =
    servicesColorLuminance(restSurface) < 0.55
      ? 'color-mix(in srgb, #ffffff 80%, transparent)'
      : 'color-mix(in srgb, #111111 72%, transparent)';
  return {
    ...servicesCardPrincipalStyle(presentation, base),
    ['--pf-services-principal-hover-ink' as string]: ink,
    ['--pf-services-principal-hover-muted' as string]: muted,
    ['--pf-services-plan-hover-ink' as string]: ink,
    ['--pf-services-plan-hover-muted' as string]: muted,
    ['--pf-services-card-surface' as string]: restSurface,
    ['--pf-services-card-ink' as string]: restInkStrong,
    ['--pf-services-card-muted' as string]: restInkMuted,
    ['--pf-services-card-divider' as string]: `color-mix(in srgb, ${restInkStrong} 28%, transparent)`,
  };
}

function resolveServiceTasks(service: ProfileServiceItem): string[] {
  if (!Array.isArray(service.tasks)) return [];
  return service.tasks.map((task) => task.trim()).filter(Boolean);
}

function ServiceBriefIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path strokeLinecap="round" d="M7 5l2-2h6l2 2" />
      <path strokeLinecap="round" d="M9 12h6M12 9v6" />
    </svg>
  );
}

function ServicesCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ServicesArrowBulletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 5l5 5-5 5" />
    </svg>
  );
}

function ServicesTaskBulletMarker({
  style,
  color,
  index = 0,
  size = 'md',
  sizePx,
  weight = 'regular',
  weightAmount,
  className = '',
}: {
  style: PortfolioServicesTaskBulletStyle;
  color: string;
  index?: number;
  size?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSize;
  sizePx?: number;
  weight?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerWeight;
  weightAmount?: number;
  className?: string;
}) {
  return (
    <PortfolioListMarker
      style={style}
      color={color}
      index={index}
      size={size}
      sizePx={sizePx}
      weight={weight}
      weightAmount={weightAmount}
      className={className}
    />
  );
}

/** Shared task checklist used across service card layouts. */
function resolveServicesTaskListMarker(
  presentation: PortfolioServicesPresentationSettings,
  taskListBulletGlobal: ReturnType<typeof usePortfolioTaskListMarkerGlobal>
) {
  const layout = presentation.servicesGalleryLayout;
  const isCardFamily =
    layout === 'card' || layout === 'plan' || layout === 'tier' || layout === 'plan-split';
  const isCommercialList = layout === 'commercial-list';
  const isServiceSelector = layout === 'service-selector';
  let bulletSource = resolveServicesTaskBulletSource(presentation);
  let bulletStyle = (presentation.servicesTaskBulletStyle ?? 'check') as PortfolioServicesTaskBulletStyle;
  let sectionBulletColor = resolveServicesTaskBulletColor(presentation);
  let sizeOverride: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSize | undefined;
  let sizePxOverride: number | undefined;

  if (isServiceSelector) {
    // Service selector: simple dash trait.
    bulletSource = 'section';
    bulletStyle = 'dash';
    sizeOverride = 'lg';
    if (presentation.useHeroPalette !== false) {
      const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
      const bindings = mergeServicesColorBindings(
        DEFAULT_SERVICES_COLOR_BINDINGS,
        presentation.servicesColorBindings
      );
      sectionBulletColor = resolveHeroPaletteColor(
        palette,
        bindings.tasksBullet || 'texteMuted'
      );
    } else {
      const tasksInk = presentation.elementStyles?.tasks?.color?.trim();
      sectionBulletColor =
        tasksInk ||
        presentation.servicesTaskBulletColor?.trim() ||
        presentation.cardAccentColor?.trim() ||
        sectionBulletColor;
    }
  } else if (isCommercialList) {
    // Liste commerciale: plain check (no round border), larger glyph.
    bulletSource = 'section';
    bulletStyle = 'check';
    sizeOverride = 'custom';
    sizePxOverride = 24;
    if (presentation.useHeroPalette !== false) {
      const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
      sectionBulletColor = resolveHeroPaletteColor(palette, 'principal');
    } else {
      sectionBulletColor =
        presentation.ctaColor?.trim() ||
        presentation.cardAccentColor?.trim() ||
        sectionBulletColor;
    }
  } else if (isCardFamily) {
    bulletSource = 'section';
    // Plan / Offre / Carte always show a visible marker (never inherit "none").
    if (!bulletStyle || bulletStyle === 'none') {
      bulletStyle = layout === 'card' ? 'check-circle-fill' : 'check-circle';
    }
    if (layout === 'card') {
      bulletStyle = 'check-circle-fill';
    }

    if (presentation.useHeroPalette !== false) {
      const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
      const bindings = mergeServicesColorBindings(
        DEFAULT_SERVICES_COLOR_BINDINGS,
        presentation.servicesColorBindings
      );
      sectionBulletColor = resolveHeroPaletteColor(palette, bindings.tasksBullet || 'principal');
      // Visible accent: principal for Carte + Plan + Plan en colonnes.
      if (layout === 'card' || layout === 'plan' || layout === 'plan-split') {
        sectionBulletColor = resolveHeroPaletteColor(palette, 'principal');
      }
    } else {
      sectionBulletColor =
        presentation.ctaColor?.trim() ||
        presentation.cardAccentColor?.trim() ||
        sectionBulletColor;
    }
  }

  const resolved = resolveTaskListMarker(
    taskListBulletGlobal,
    {
      taskBulletSource: bulletSource,
      taskBulletStyle: bulletStyle,
      taskBulletColor: sectionBulletColor,
      taskBulletSize: sizeOverride ?? presentation.servicesTaskBulletSize ?? 'md',
      taskBulletSizePx: sizePxOverride ?? presentation.servicesTaskBulletSizePx,
      taskBulletWeight: presentation.servicesTaskBulletWeight ?? 'regular',
      taskBulletWeightAmount: presentation.servicesTaskBulletWeightAmount,
    },
    sectionBulletColor
  );

  if (isCommercialList) {
    return {
      ...resolved,
      style: 'check' as const,
      size: 'custom' as const,
      sizePx: sizePxOverride ?? 24,
      weight: 'bold' as const,
    };
  }

  if (isServiceSelector) {
    return {
      ...resolved,
      style: 'dash' as const,
      size: 'lg' as const,
      sizePx: LIST_MARKER_SIZE_PRESET_PX.lg,
      weight: 'bold' as const,
      weightAmount: LIST_MARKER_WEIGHT_PRESET_AMOUNT.bold,
    };
  }

  return resolved;
}

/** Shared task checklist used across service card layouts. */
function ServicesTaskList({
  tasks,
  presentation,
  alignClass = '',
  itemJustifyClass = '',
  textStyle,
  textClassName = '',
  listClassName = 'space-y-3.5',
  bulletColorOverride,
  bulletClassName = '',
}: {
  tasks: string[];
  presentation: PortfolioServicesPresentationSettings;
  alignClass?: string;
  itemJustifyClass?: string;
  textStyle?: CSSProperties;
  textClassName?: string;
  /** Track layout for the checklist (e.g. two columns on the service selector). */
  listClassName?: string;
  /** When set, replaces resolved marker color (e.g. muted ink on Offre / Tarif). */
  bulletColorOverride?: string;
  /** Optional class on each marker (e.g. principal-fill hover ink). */
  bulletClassName?: string;
}) {
  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  if (tasks.length === 0) return null;

  const resolved = resolveServicesTaskListMarker(presentation, taskListBulletGlobal);
  const bulletColor = bulletColorOverride?.trim() || resolved.color;
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const glyphContrast = listMarkerGlyphFallback(bulletColor);

  return (
    <ul className={`w-full ${listClassName} ${alignClass}`.trim()}>
      {tasks.map((task, index) => (
        <li key={`${index}-${task}`} className={`flex items-start gap-2.5 ${itemJustifyClass}`.trim()}>
          <span
            className={`shrink-0 ${bulletClassName}`.trim()}
            style={{
              color: bulletColor,
              ['--pf-list-marker-glyph' as string]: glyphContrast,
            }}
          >
            <ServicesTaskBulletMarker
              style={resolved.style}
              color={bulletClassName.trim() ? 'currentColor' : bulletColor}
              index={index}
              size={resolved.size}
              sizePx={resolved.sizePx}
              weight={resolved.weight}
              weightAmount={resolved.weightAmount}
              className={bulletClassName}
            />
          </span>
          <span
            className={`min-w-0 leading-relaxed ${elementTextStyleClass(elementStyles.tasks, 'body')} ${textClassName}`.trim()}
            style={textStyle}
          >
            {task}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ArrowUpRight({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

/** Label + optional CTA glyph (left/right) for Work project buttons. */
function WorkCtaLabelAndIcon({
  presentation,
  label,
  labelClassName,
  labelStyle,
  nowrap = false,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  presentation: Record<string, any>;
  label: string;
  labelClassName?: string;
  labelStyle?: CSSProperties;
  nowrap?: boolean;
}) {
  const showIcon = presentation.ctaShowIcon !== false;
  const position = presentation.ctaIconPosition === 'left' ? 'left' : 'right';
  const icon = (presentation.ctaIcon ?? 'arrow-up-right') as PortfolioWorkCtaIcon;
  const design = (presentation.ctaDesign ?? 'pill-accent') as PortfolioWorkPresentationSettings['ctaDesign'];
  const iconNode = showIcon ? (
    <span
      className={`shrink-0 ${workCtaIconShellClass(design, presentation as never)}`}
      style={workCtaIconShellStyle(design, presentation as never)}
    >
      <PortfolioWorkCtaGlyph variant={icon} className="h-4 w-4" />
    </span>
  ) : null;
  const labelNode = (
    <span
      className={`min-w-0 ${nowrap ? 'shrink whitespace-nowrap' : 'break-words'} ${labelClassName ?? ''}`.trim()}
      style={labelStyle}
    >
      {label}
    </span>
  );
  return (
    <>
      {position === 'left' ? iconNode : null}
      {labelNode}
      {position === 'right' ? iconNode : null}
    </>
  );
}

function SideInfoCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.438 7-10a7 7 0 10-14 0c0 5.562 7 10 7 10z"
      />
    </svg>
  );
}

function SideInfoLanguagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.4 2.8-3.6 5.6-3.6 9s1.2 6.2 3.6 9c2.4-2.8 3.6-5.6 3.6-9s-1.2-6.2-3.6-9z" />
    </svg>
  );
}

function SideInfoUserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SideInfoCalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function SideInfoClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

export const SIDE_INFO_ICONS = {
  location: SideInfoCardIcon,
  languages: SideInfoLanguagesIcon,
  gender: SideInfoUserIcon,
  memberSince: SideInfoCalendarIcon,
  availability: SideInfoClockIcon,
} as const;

export function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
      {index} · {label}
    </p>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="mx-auto max-w-2xl text-center xl:mx-0 xl:max-w-none xl:text-left">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h2>
        {subtitle ? (
          <p
            className="mt-3 max-w-2xl text-base italic leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-lg xl:mx-0"
            style={{ fontFamily: SERIF }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Sticky section title — sticks for the full section height until the next section title replaces it. */
export function EditorialSectionStickyHeader({
  title,
  subtitle,
  trailing,
  subtitleSerif = false,
  editorialLayout = false,
  centered = false,
  alignRight = false,
  alwaysCentered = false,
  kicker,
  className = '',
  titleTypographyClass = '',
  titleTypographyStyle,
  subtitleTypographyClass = '',
  subtitleTypographyStyle,
  titleDecorationStyle,
  subtitleDecorationStyle,
  titleChromeClass,
  titleChromeStyle,
  scrollBehavior = 'sticky',
  customTitleSizing = false,
  customSubtitleSizing = false,
  orientation = 'horizontal',
  /** Split-screen left rail: title + subtitle + trailing as one atomic block (no staggered motion). */
  splitRailBundle = false,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  subtitleSerif?: boolean;
  /** Editorial wide layout — compact title on the nav row (lg+). */
  editorialLayout?: boolean;
  /** Center title, subtitle, and trailing content (FAQ, Contact, etc.). */
  centered?: boolean;
  /** Small label above the title (FAQ kicker, etc.). */
  kicker?: React.ReactNode;
  /** Align title, subtitle, and trailing content to the right (global override). */
  alignRight?: boolean;
  /** Keep title centered on scroll — no top-left sticky pill (Contact). */
  alwaysCentered?: boolean;
  className?: string;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  /** Inline decoration (underline/highlight) applied to a span hugging the text. */
  titleDecorationStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
  /** Global scroll behavior for section titles: floating pill or static. */
  scrollBehavior?: 'sticky' | 'static';
  /** When true, skip default editorial title scale (global typography controls size). */
  customTitleSizing?: boolean;
  /** When true, skip default subtitle scale and muted color. */
  customSubtitleSizing?: boolean;
  /** Global title orientation — horizontal (default) or rotated vertical rail. */
  orientation?: 'horizontal' | 'vertical';
  splitRailBundle?: boolean;
}) {
  const displayTitle = portfolioSectionTitleSentenceCase(title);
  const titleClassName = `${portfolioSectionTitleClassWithoutUppercase(
    titleTypographyClass
  )} normal-case`.trim();
  const spacingClass = className || 'mb-12 lg:mb-16';
  const stickyEnabled = scrollBehavior !== 'static';
  const pillMode = editorialLayout && stickyEnabled;
  const { sentinelRef, isStuck } = useSectionTitleStuck(stickyEnabled && !alwaysCentered);
  const centerContent = centered && !alignRight && (alwaysCentered || !isStuck || !stickyEnabled);
  const rightContent = alignRight && (alwaysCentered || !isStuck || !stickyEnabled);
  const showPill = pillMode && isStuck && !alwaysCentered;

  const positionClass = !stickyEnabled
    ? 'relative'
    : pillMode
      ? 'sticky top-16 sm:top-[4.75rem] lg:top-5'
      : isStuck
        ? 'sticky top-16 border-b border-neutral-200/70 bg-white/95 py-3 backdrop-blur-md sm:top-[4.75rem] sm:py-4 dark:border-neutral-800 dark:bg-neutral-950/95'
        : 'sticky top-16 sm:top-[4.75rem]';

  const titleSizeClass = showPill
    ? `leading-none text-neutral-950 dark:text-white ${PORTFOLIO_FLOATING_CHROME_LABEL}`
    : customTitleSizing
      ? 'text-neutral-950 dark:text-white'
      : stickyEnabled && !pillMode && isStuck
        ? 'text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:leading-[0.95] dark:text-white'
        : 'text-5xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl lg:leading-[0.95] dark:text-white';

  if (orientation === 'vertical') {
    return (
      <VerticalSectionTitle
        title={displayTitle}
        subtitle={subtitle}
        trailing={trailing}
        subtitleSerif={subtitleSerif}
        centered={centered}
        alignRight={alignRight}
        spacingClass={spacingClass}
        titleTypographyClass={titleClassName}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customTitleSizing={customTitleSizing}
        customSubtitleSizing={customSubtitleSizing}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
      />
    );
  }

  // Split left rail: one compact cadre — title, description, trailing (not a tall column).
  if (splitRailBundle) {
    return (
      <div className="flex w-full max-w-full flex-col items-center px-1 text-center sm:px-2">
        <SplitRailAutoFitHeading
          className={`${titleClassName} ${
            customTitleSizing
              ? 'text-neutral-950 dark:text-white'
              : SPLIT_RAIL_DEFAULT_TITLE_CLASS
          }`}
          style={titleTypographyStyle}
          chromeClass={titleChromeClass}
          chromeStyle={titleChromeStyle}
        >
          <SplitRailTitleLines title={displayTitle} decorationStyle={titleDecorationStyle} />
        </SplitRailAutoFitHeading>
        {subtitle ? (
          <p
            className={`mt-4 w-full max-w-full leading-relaxed ${
              customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
            } ${subtitleTypographyClass}`}
            style={{
              ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
              ...subtitleTypographyStyle,
            }}
          >
            {subtitleDecorationStyle && Object.keys(subtitleDecorationStyle).length > 0 ? (
              <span style={subtitleDecorationStyle}>{subtitle}</span>
            ) : (
              subtitle
            )}
          </p>
        ) : null}
        {trailing ? <div className="mt-5 flex justify-center">{trailing}</div> : null}
      </div>
    );
  }

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div
        className={`z-40 w-full transition-all duration-300 ease-out ${sectionHeaderOuterLayoutClass(
          centerContent,
          rightContent
        )} ${positionClass}`}
      >
        <div
          className={sectionHeaderTitleWrapClass(
            showPill,
            centered,
            alignRight,
            PORTFOLIO_FLOATING_CHROME
          )}
        >
          {!showPill && kicker ? (
            <div
              className={`mb-3 ${sectionHeaderTitleTextAlignClass(centered, alignRight)}`}
            >
              {kicker}
            </div>
          ) : null}
          {wrapSectionTitleChrome(
            <h2
              className={`transition-all duration-300 ease-out ${sectionHeaderTitleTextAlignClass(
                centered,
                alignRight
              )} ${titleClassName} ${titleSizeClass}`}
              style={titleTypographyStyle}
            >
              {titleDecorationStyle && Object.keys(titleDecorationStyle).length > 0 ? (
                <span style={titleDecorationStyle}>{displayTitle}</span>
              ) : (
                displayTitle
              )}
            </h2>,
            titleChromeClass,
            titleChromeStyle
          )}
        </div>
      </div>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
          } ${sectionHeaderSubtitleAlignClass(centered, alignRight)} ${subtitleTypographyClass} ${
            trailing ? 'mb-4' : spacingClass
          }`}
          style={{
            ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
            ...subtitleTypographyStyle,
          }}
        >
          {subtitleDecorationStyle && Object.keys(subtitleDecorationStyle).length > 0 ? (
            <span style={subtitleDecorationStyle}>{subtitle}</span>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
      {trailing ? (
        <div className={`${spacingClass} ${sectionHeaderTrailingLayoutClass(centered, alignRight)}`}>
          {trailing}
        </div>
      ) : null}
      {!subtitle && !trailing ? <div className={spacingClass} aria-hidden /> : null}
    </>
  );
}

/**
 * Vertical (rotated) section title. On large screens it is fixed and centered
 * vertically, appearing only while its own section owns the middle of the
 * viewport — so a single title shows at a time and never bleeds into the
 * section above or below. On small screens it renders inline in normal flow.
 */
function VerticalSectionTitle({
  title,
  subtitle,
  trailing,
  subtitleSerif = false,
  centered = false,
  alignRight = false,
  spacingClass,
  titleTypographyClass = '',
  titleTypographyStyle,
  titleDecorationStyle,
  subtitleTypographyClass = '',
  subtitleTypographyStyle,
  subtitleDecorationStyle,
  customTitleSizing = false,
  customSubtitleSizing = false,
  titleChromeClass,
  titleChromeStyle,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  subtitleSerif?: boolean;
  centered?: boolean;
  alignRight?: boolean;
  spacingClass: string;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  titleDecorationStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  customTitleSizing?: boolean;
  customSubtitleSizing?: boolean;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
}) {
  const { anchorRef, active } = useSectionCenterActive(true);

  const verticalTitleSize = customTitleSizing
    ? 'text-neutral-950 dark:text-white'
    : 'text-5xl font-black tracking-[-0.02em] text-neutral-950 sm:text-6xl lg:text-7xl dark:text-white';

  // For upright vertical text a highlight band should run alongside the column,
  // so flip the marker gradient from vertical (to bottom) to horizontal (to right).
  const toVerticalDecoration = (
    decoration?: React.CSSProperties
  ): React.CSSProperties | undefined => {
    if (!decoration || !decoration.backgroundImage) return decoration;
    return {
      ...decoration,
      backgroundImage: String(decoration.backgroundImage).replace(
        'linear-gradient(',
        'linear-gradient(to right, '
      ),
    };
  };
  const verticalTitleDecoration = toVerticalDecoration(titleDecorationStyle);
  const verticalSubtitleDecoration = toVerticalDecoration(subtitleDecorationStyle);

  const flowJustify = 'justify-center xl:justify-start';
  const flowJustifyResolved = centered
    ? 'justify-center'
    : alignRight
      ? 'justify-center xl:justify-end'
      : flowJustify;

  const fixedPositionClass = centered
    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    : alignRight
      ? 'top-1/2 right-6 -translate-y-1/2 xl:right-10'
      : 'top-1/2 left-6 -translate-y-1/2 xl:left-10';

  const titleNode = wrapSectionTitleChrome(
    <h2
      className={`${titleTypographyClass} ${verticalTitleSize}`}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'upright',
        letterSpacing: '-0.05em',
        lineHeight: 1,
        ...titleTypographyStyle,
      }}
    >
      {verticalTitleDecoration && Object.keys(verticalTitleDecoration).length > 0 ? (
        <span style={verticalTitleDecoration}>{title}</span>
      ) : (
        title
      )}
    </h2>,
    titleChromeClass,
    titleChromeStyle
  );

  return (
    <>
      <div ref={anchorRef} className="h-px w-full" aria-hidden />
      {/* In-flow on small screens */}
      <div className={`mb-10 flex w-full items-start ${flowJustifyResolved} lg:hidden`}>{titleNode}</div>
      {/* Fixed & centered on large screens, visible only while the section owns the viewport center */}
      <div
        className={`pointer-events-none fixed z-30 hidden transition-opacity duration-500 ease-out lg:flex ${fixedPositionClass} ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {titleNode}
      </div>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
          } ${sectionHeaderSubtitleAlignClass(centered, alignRight)} ${subtitleTypographyClass} ${
            trailing ? 'mb-4' : spacingClass
          }`}
          style={{
            ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
            ...subtitleTypographyStyle,
          }}
        >
          {verticalSubtitleDecoration && Object.keys(verticalSubtitleDecoration).length > 0 ? (
            <span style={verticalSubtitleDecoration}>{subtitle}</span>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
      {trailing ? (
        <div className={`${spacingClass} ${sectionHeaderTrailingLayoutClass(centered, alignRight)}`}>
          {trailing}
        </div>
      ) : null}
    </>
  );
}

type NavItem = { id: string; label: string; icon: PortfolioNavIconVariant };

function useNavVisibility(
  displayMode: PortfolioNavSettings['displayMode'],
  /** Pages mode locks body scroll — force always-visible chrome. */
  forceAlways = false
) {
  const [visible, setVisible] = useState(displayMode === 'always' || forceAlways);

  useEffect(() => {
    if (forceAlways || displayMode === 'always') {
      setVisible(true);
      return;
    }

    const update = () => {
      if (displayMode === 'on-scroll') {
        setVisible(window.scrollY > 96);
        return;
      }
      setVisible(window.scrollY > window.innerHeight * 0.72);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [displayMode, forceAlways]);

  return visible;
}

/** Match Tailwind `lg` / `xl` for layout remaps that need JS. */
function usePortfolioMinWidth(px: number) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [px]);
  return matches;
}

/** lg breakpoint (1024) — used to remap side nav / icon labels on small–mid screens. */
function usePortfolioLgUp() {
  return usePortfolioMinWidth(1024);
}

/** xl breakpoint (1280) — reserved for hero dual-column if JS gating is needed. */
function usePortfolioXlUp() {
  return usePortfolioMinWidth(1280);
}

type NavPresenceState = {
  /** Combined with display visibility — false when reveal mode is collapsed. */
  expanded: boolean;
  /** Opacity for the bar chrome (0–1). */
  chromeOpacity: number;
  /** Show the peek / menu handle. */
  showHandle: boolean;
  /** Dim mode: currently brightened by interaction. */
  isDimActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocusCapture: () => void;
  onBlurCapture: (event: FocusEvent<HTMLElement>) => void;
  onPointerDown: () => void;
  onToggle: () => void;
  onCollapse: () => void;
  onInteract: () => void;
};

const DIM_IDLE_MS = 1600;
const DIM_REST_OPACITY = 0.32;
/** Time to cross the gap between a detached nav rail and free-space link icons. */
const HOVER_LEAVE_GRACE_MS = 1200;

function NavMenuControlGlyph({
  icon,
  expanded = false,
}: {
  icon: PortfolioNavMenuControlIcon;
  expanded?: boolean;
}) {
  if (icon === 'dots-v') {
    return (
      <span className="inline-flex flex-col items-center gap-0.5" aria-hidden>
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
    );
  }
  if (icon === 'x') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (icon === 'chevron') {
    return (
      <svg
        className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    );
  }
  if (icon === 'menu') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}

function useNavPresence(
  presence: PortfolioNavSettings['presence'] | undefined,
  displayVisible: boolean
): NavPresenceState {
  const mode = presence ?? 'full';
  const [expanded, setExpanded] = useState(mode === 'full' || mode === 'dim');
  const [hovered, setHovered] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdle = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  };

  const clearHoverLeave = () => {
    if (hoverLeaveTimer.current) {
      clearTimeout(hoverLeaveTimer.current);
      hoverLeaveTimer.current = null;
    }
  };

  const scheduleIdle = () => {
    clearIdle();
    if (mode !== 'dim') return;
    idleTimer.current = setTimeout(() => setEngaged(false), DIM_IDLE_MS);
  };

  const scheduleHoverCollapse = () => {
    clearHoverLeave();
    if (mode !== 'hover') return;
    hoverLeaveTimer.current = setTimeout(() => {
      setExpanded(false);
      hoverLeaveTimer.current = null;
    }, HOVER_LEAVE_GRACE_MS);
  };

  useEffect(() => {
    if (mode === 'full' || mode === 'dim') {
      setExpanded(true);
      setHovered(false);
      setEngaged(false);
      clearIdle();
      clearHoverLeave();
    } else {
      setExpanded(false);
      setHovered(false);
      setEngaged(false);
      clearIdle();
      clearHoverLeave();
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      clearIdle();
      clearHoverLeave();
    };
  }, []);

  const bumpEngaged = () => {
    setEngaged(true);
    scheduleIdle();
  };

  // Dim must NOT treat "expanded" as active — the bar is always expanded in dim mode.
  const isDimActive = hovered || engaged;
  const isRevealed =
    mode === 'full' || mode === 'dim' || expanded || (mode === 'hover' && hovered);
  const showHandle =
    displayVisible && (mode === 'tap' || mode === 'hover') && !isRevealed;

  let chromeOpacity = 1;
  if (!displayVisible) {
    chromeOpacity = 0;
  } else if (mode === 'dim') {
    chromeOpacity = isDimActive ? 1 : DIM_REST_OPACITY;
  } else if (mode === 'hover' || mode === 'tap') {
    chromeOpacity = isRevealed || showHandle ? 1 : 0;
  }

  return {
    expanded: isRevealed,
    chromeOpacity,
    showHandle,
    isDimActive,
    onMouseEnter: () => {
      clearHoverLeave();
      setHovered(true);
      if (mode === 'hover') setExpanded(true);
      if (mode === 'dim') {
        setEngaged(true);
        clearIdle();
      }
    },
    onMouseLeave: () => {
      setHovered(false);
      if (mode === 'hover') scheduleHoverCollapse();
      if (mode === 'dim') scheduleIdle();
    },
    onFocusCapture: () => {
      clearHoverLeave();
      if (mode === 'dim') {
        setEngaged(true);
        clearIdle();
      }
      if (mode === 'hover') setExpanded(true);
    },
    onBlurCapture: (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && event.currentTarget.contains(next)) return;
      if (mode === 'hover') scheduleHoverCollapse();
      if (mode === 'dim') scheduleIdle();
    },
    onPointerDown: () => {
      bumpEngaged();
    },
    onToggle: () => {
      clearHoverLeave();
      if (mode === 'tap' || mode === 'hover') {
        setExpanded((prev) => !prev);
      }
    },
    onCollapse: () => {
      clearHoverLeave();
      if (mode === 'tap' || mode === 'hover') setExpanded(false);
    },
    onInteract: bumpEngaged,
  };
}

export function PortfolioFloatingNav({
  items,
  settings,
  activeId: controlledActiveId,
  onNavigate,
  chromeLinks = [],
  monochrome,
  contactHref = '#contact',
  onContactNavigate,
  avatarUrl,
  brandName,
}: {
  items: NavItem[];
  settings: PortfolioNavSettings;
  /** Controlled active section (pages mode). */
  activeId?: string;
  /** When set, nav buttons switch pages instead of scrolling to hash anchors. */
  onNavigate?: (id: string) => void;
  /** Mail / social icons (+ optional Contact) for free-space or in-bar extras. */
  chromeLinks?: PortfolioNavChromeLink[];
  monochrome?: boolean;
  contactHref?: string;
  onContactNavigate?: () => void;
  /** Profile avatar for mobile drawer brand (`mobileBrand: 'avatar'`). */
  avatarUrl?: string | null;
  /** Fallback word for mobile drawer brand when `mobileBrandWord` is empty. */
  brandName?: string;
}) {
  const [observedActiveId, setObservedActiveId] = useState(items[0]?.id ?? '');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isControlled = typeof onNavigate === 'function';
  // Pages mode uses an inner scroller — window.scrollY never moves.
  const visible = useNavVisibility(settings.displayMode, isControlled);
  const isLgUp = usePortfolioLgUp();
  const isXlUp = usePortfolioXlUp();
  const presence = useNavPresence(settings.presence, visible);
  const presenceMode = settings.presence ?? 'full';
  const contactButtonEnabled = settings.contactButtonEnabled ?? false;
  const sectionItems = contactButtonEnabled
    ? items.filter((item) => item.id !== 'contact')
    : items;

  // Close reveal menus after choosing a page/section.
  const handleNavigate = (id: string) => {
    presence.onInteract();
    setDrawerOpen(false);
    onNavigate?.(id);
  };
  const activeId = isControlled
    ? (controlledActiveId ?? sectionItems[0]?.id ?? items[0]?.id ?? '')
    : observedActiveId;
  const innerRef = useRef<HTMLDivElement>(null);
  const navRootRef = useRef<HTMLElement>(null);
  const [autoNeedsScroll, setAutoNeedsScroll] = useState(false);

  const mobileChrome = resolvePortfolioNavMobileChrome(settings, isLgUp, isXlUp);
  const contentMode = mobileChrome.contentMode;
  const effectivePlacement = mobileChrome.placement;
  const itemGap = mobileChrome.itemGap;
  const barWidth = mobileChrome.barWidth;
  const compact = mobileChrome.compact;
  const allowWrap = mobileChrome.allowWrap;
  const allowScroll = mobileChrome.allowScroll || autoNeedsScroll;
  const useDrawer = mobileChrome.useDrawer;
  const navPalette = useMemo(
    () => mergeNavPalette(DEFAULT_NAV_PALETTE, settings.navPalette),
    [settings.navPalette]
  );
  const navStrongTextColor = resolveHeroPaletteColor(navPalette, 'texteFort');
  const navPageFillColor = resolveHeroPaletteColor(navPalette, 'fond');

  useEffect(() => {
    if (!useDrawer) setDrawerOpen(false);
  }, [useDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  const [drawerEntered, setDrawerEntered] = useState(false);
  useEffect(() => {
    if (!drawerOpen) {
      setDrawerEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setDrawerEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [drawerOpen]);

  useEffect(() => {
    if (isControlled || sectionItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry?.target.id) {
          setObservedActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );

    for (const item of sectionItems) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [sectionItems, isControlled]);

  // Auto mode: if icons still overflow after tight gap, enable swipe.
  useEffect(() => {
    const isAuto = (settings.mobileLayout ?? 'auto') === 'auto';
    if (isLgUp || !isAuto || allowWrap) {
      setAutoNeedsScroll(false);
      return;
    }
    const el = innerRef.current;
    if (!el) return;

    const measure = () => {
      setAutoNeedsScroll(el.scrollWidth > el.clientWidth + 2);
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isLgUp, settings.mobileLayout, allowWrap, sectionItems.length, itemGap, contentMode, barWidth]);

  /**
   * Keep the outer shell at bar size while the bar is fading out, then hug the handle.
   * Expanding grows the shell immediately so the bar has room — avoids a layout jump mid-fold.
   */
  const [shellHugged, setShellHugged] = useState(presence.showHandle);
  useEffect(() => {
    if (presence.showHandle) {
      const t = window.setTimeout(() => setShellHugged(true), 420);
      return () => window.clearTimeout(t);
    }
    setShellHugged(false);
    return undefined;
  }, [presence.showHandle]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const topClearanceActive = portfolioNavTopClearanceActive(settings, effectivePlacement);
  usePortfolioNavTopClearanceSync({
    rootRef: navRootRef,
    active: topClearanceActive,
    visible: useDrawer
      ? visible
      : visible &&
        presence.chromeOpacity > 0.05 &&
        (presence.expanded || presence.showHandle),
  });

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && sectionItems.length <= 1) return null;
  if (sectionItems.length === 0) return null;
  if (!mounted) return null;

  const menuControlIcon = (settings.menuControlIcon ?? 'dots-h') as PortfolioNavMenuControlIcon;
  const menuControlAlign = (settings.menuControlAlign ?? 'right') as PortfolioNavMenuControlAlign;
  const handleChromeStyle = {
    backgroundColor: settings.menuHandleBackgroundColor ?? '#ffffff',
    color: settings.menuHandleIconColor ?? '#171717',
    borderColor:
      (settings.menuHandleBorderEnabled ?? true)
        ? settings.menuHandleBorderColor ?? '#d4d4d4'
        : 'transparent',
    borderWidth: (settings.menuHandleBorderEnabled ?? true) ? 1 : 0,
    borderStyle: 'solid' as const,
  };
  const handleChromeClass =
    'inline-flex shrink-0 items-center justify-center rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-md transition hover:opacity-90';

  if (useDrawer) {
    const mobileBrand = settings.mobileBrand ?? 'none';
    const drawerSide = settings.mobileDrawerSide ?? 'right';
    const brandWord =
      (settings.mobileBrandWord ?? '').trim() ||
      (brandName ?? '').trim() ||
      'Menu';
    const showAvatar = mobileBrand === 'avatar';
    const showWord = mobileBrand === 'word';
    const barJustify =
      menuControlAlign === 'left'
        ? 'justify-start'
        : menuControlAlign === 'center'
          ? 'justify-center'
          : 'justify-end';
    const avatarSrc = avatarUrl?.trim() || '';
    const brandEl = showAvatar ? (
      avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarSrc}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/10"
        />
      ) : (
        <span
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ring-black/10"
          style={{
            backgroundColor: settings.menuHandleBackgroundColor ?? '#ffffff',
            color: settings.menuHandleIconColor ?? '#171717',
          }}
          aria-hidden
        >
          {(brandWord.charAt(0) || 'M').toUpperCase()}
        </span>
      )
    ) : showWord ? (
      <span
        className="max-w-[10rem] truncate text-sm font-semibold tracking-tight"
        style={{ color: settings.menuHandleIconColor ?? '#171717' }}
      >
        {brandWord}
      </span>
    ) : null;
    const menuButton = (
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-expanded={drawerOpen}
        aria-controls="portfolio-nav-drawer"
        aria-label="Open navigation menu"
        className={`${handleChromeClass} h-11 w-11 min-h-11`}
        style={handleChromeStyle}
      >
        <NavMenuControlGlyph icon={menuControlIcon} />
      </button>
    );
    const controls =
      menuControlAlign === 'right' ? (
        <>
          {brandEl}
          {menuButton}
        </>
      ) : (
        <>
          {menuButton}
          {brandEl}
        </>
      );

    return createPortal(
      <>
        <nav
          ref={navRootRef}
          className={`pointer-events-none fixed inset-x-0 top-0 z-[100] transition-opacity duration-300 ${
            visible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-label="Portfolio navigation"
          aria-hidden={!visible}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div
            data-portfolio-nav-clearance-box
            className={`pointer-events-auto flex w-full items-center gap-2.5 px-3 py-2.5 ${barJustify}`}
          >
            {menuControlAlign === 'center' ? (
              <div className="inline-flex items-center gap-2.5">{controls}</div>
            ) : (
              controls
            )}
          </div>
        </nav>

        {drawerOpen ? (
          <div className="fixed inset-0 z-[110]" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-neutral-950/45 backdrop-blur-[2px] transition-opacity"
              aria-label="Close navigation menu"
              onClick={() => setDrawerOpen(false)}
            />
            <aside
              id="portfolio-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className={`absolute top-0 flex h-full w-[min(18.5rem,86vw)] flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                drawerSide === 'left' ? 'left-0' : 'right-0'
              } ${
                drawerEntered
                  ? 'translate-x-0'
                  : drawerSide === 'left'
                    ? '-translate-x-full'
                    : 'translate-x-full'
              }`}
              style={{
                backgroundColor: settings.barBackgroundColor ?? '#ffffff',
                color: settings.itemTextColor ?? '#525252',
                borderColor: settings.barBorderColor ?? '#e5e5e5',
                borderLeftWidth: drawerSide === 'right' && (settings.barBorderEnabled ?? true) ? 1 : 0,
                borderRightWidth: drawerSide === 'left' && (settings.barBorderEnabled ?? true) ? 1 : 0,
                borderStyle: 'solid',
                paddingTop: 'env(safe-area-inset-top, 0px)',
              }}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60">Menu</p>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className={`${handleChromeClass} h-10 w-10 min-h-10`}
                  style={handleChromeStyle}
                >
                  <NavMenuControlGlyph icon="x" expanded />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6 pt-1">
                <ul className="flex flex-col gap-1.5">
                  {sectionItems.map((item) => {
                    const active = activeId === item.id;
                    const label = formatNavLabel(item.label, settings.labelCase);
                    const accent = settings.activeAccentColor ?? '#f97316';
                    return (
                      <li key={item.id}>
                        {isControlled ? (
                          <button
                            type="button"
                            onClick={() => handleNavigate(item.id)}
                            aria-current={active ? 'page' : undefined}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                              active ? 'shadow-sm' : 'hover:bg-black/[0.04]'
                            }`}
                            style={
                              active
                                ? {
                                    backgroundColor: accent,
                                    color: '#ffffff',
                                  }
                                : {
                                    color: settings.itemTextColor ?? '#525252',
                                  }
                            }
                          >
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center opacity-90">
                              <PortfolioNavIcon variant={item.icon} className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{label}</span>
                          </button>
                        ) : (
                          <a
                            href={`#${item.id}`}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => setDrawerOpen(false)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                              active ? 'shadow-sm' : 'hover:bg-black/[0.04]'
                            }`}
                            style={
                              active
                                ? {
                                    backgroundColor: accent,
                                    color: '#ffffff',
                                  }
                                : {
                                    color: settings.itemTextColor ?? '#525252',
                                  }
                            }
                          >
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center opacity-90">
                              <PortfolioNavIcon variant={item.icon} className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{label}</span>
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        ) : null}
      </>,
      document.body
    );
  }

  const vertical = portfolioNavIsVertical(effectivePlacement);
  /** Collapsed reveal handle must hug its content so top-center stays centered (wide bars otherwise pin the handle left). */
  const collapsedToHandle = shellHugged && presence.showHandle;
  const placementClass = portfolioNavPlacementClass(
    effectivePlacement,
    settings.edgeOffset,
    collapsedToHandle ? 'hug' : barWidth,
    settings.edgeOffsetCloseOnMobile ?? true
  );
  const widthClass = collapsedToHandle
    ? 'w-fit max-w-[calc(100vw-1.5rem)]'
    : portfolioNavBarWidthClass(barWidth, vertical);
  const innerWidthClass = portfolioNavBarInnerClass(
    barWidth,
    vertical,
    itemGap,
    effectivePlacement,
    { wrap: allowWrap, scroll: allowScroll }
  );
  const containerClass = portfolioNavBarContainerClass(
    settings.barDesign,
    settings.glassEffect,
    vertical,
    settings.barPadding ?? 'md',
    barWidth,
    settings.barBorderEnabled ?? true,
    settings.barShadowEnabled ?? true,
    settings.barBlurStrength ?? 'md',
    settings.barShadowStrength ?? 'md'
  );
  const shellStyle =
    settings.barDesign === 'dock'
      ? undefined
      : portfolioNavBarShellStyle(
          settings.barBackgroundColor,
          settings.barBorderColor,
          settings.glassEffect,
          settings.barBorderEnabled ?? true
        );
  const itemBaseClass = portfolioNavItemBaseClass(
    settings.barDesign,
    contentMode,
    settings.buttonDesign,
    settings.labelCase,
    compact,
    vertical,
    settings.barThickness,
    settings.buttonPadding ?? 'md'
  );
  const iconGlyphClass = portfolioNavIconGlyphClass(settings.barThickness);
  const showRailDividers = settings.barDesign === 'rail' && sectionItems.length > 1 && !allowWrap;
  const menuHandleContent = settings.menuHandleContent ?? 'both';
  const showMenuIcon = menuHandleContent === 'icon' || menuHandleContent === 'both';
  const showMenuText = menuHandleContent === 'text' || menuHandleContent === 'both';
  const showExpandedToggle = presenceMode === 'tap' && presence.expanded;
  const iconsPlacementMode = settings.extrasPlacement ?? 'free-side';
  const contactPlacementMode =
    settings.contactExtrasPlacement ?? settings.extrasPlacement ?? 'free-side';
  const customPlacementMode =
    settings.customExtraLayoutPlacement ?? settings.extrasPlacement ?? 'free-side';
  const isAdjacentPlacement = (value: string | undefined) =>
    value === 'before-nav' || value === 'after-nav';
  const adjacentExtras =
    isAdjacentPlacement(iconsPlacementMode) ||
    isAdjacentPlacement(contactPlacementMode) ||
    isAdjacentPlacement(customPlacementMode);
  const anyFreeSideExtras =
    iconsPlacementMode === 'free-side' ||
    contactPlacementMode === 'free-side' ||
    customPlacementMode === 'free-side';
  const inlineExtras =
    anyFreeSideExtras && portfolioNavBarHostsInlineExtras(barWidth, effectivePlacement);
  const placementIsStart =
    effectivePlacement === 'top-left' || effectivePlacement === 'bottom-left';
  const placementIsEnd =
    effectivePlacement === 'top-right' || effectivePlacement === 'bottom-right';
  const placementIsCentered = !vertical && !placementIsStart && !placementIsEnd;
  const itemsGapClass = portfolioNavItemGapClass(itemGap, vertical);

  const expandedToggleButton = showExpandedToggle ? (
    <button
      type="button"
      onClick={presence.onCollapse}
      aria-label="Hide navigation"
      title="Hide menu"
      className={`${handleChromeClass} h-10 w-10 min-h-10`}
      style={handleChromeStyle}
    >
      <NavMenuControlGlyph icon={menuControlIcon} expanded />
    </button>
  ) : null;

  const foldExitClass = vertical
    ? effectivePlacement === 'right-center'
      ? 'translate-x-3 scale-[0.9] opacity-0'
      : '-translate-x-3 scale-[0.9] opacity-0'
    : effectivePlacement.startsWith('bottom')
      ? 'translate-y-3 scale-[0.92] opacity-0'
      : placementIsStart
        ? '-translate-x-2 -translate-y-1 scale-[0.92] opacity-0'
        : placementIsEnd
          ? 'translate-x-2 -translate-y-1 scale-[0.92] opacity-0'
          : '-translate-y-3 scale-[0.92] opacity-0';
  /** Edge-align the crossfade stack so the handle doesn’t jump to the center of a tall/wide bar. */
  const foldStackAlign = vertical
    ? effectivePlacement === 'right-center'
      ? 'justify-items-end items-center'
      : 'justify-items-start items-center'
    : placementIsStart
      ? 'justify-items-start items-center'
      : placementIsEnd
        ? 'justify-items-end items-center'
        : 'place-items-center';
  /** Full-width bars must stretch the fold stack — centering shrink-wraps and collapses free-space slots. */
  const foldStackWidthClass = !vertical && barWidth === 'full' && !collapsedToHandle ? 'w-full' : '';
  const foldMotion =
    'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform';

  return createPortal(
    <>
    <nav
      ref={navRootRef}
      className={`pointer-events-none fixed z-[100] ${placementClass} ${widthClass}`}
      aria-label="Portfolio navigation"
      aria-hidden={!visible || (!presence.expanded && !presence.showHandle)}
    >
      <div
        data-portfolio-nav-clearance-box
        className={`pointer-events-auto transition-opacity duration-500 ease-out ${
          foldStackWidthClass
            ? 'w-full'
            : placementIsCentered || collapsedToHandle
              ? 'flex justify-center'
              : ''
        }`}
        style={{ opacity: presence.chromeOpacity }}
        onMouseEnter={presence.onMouseEnter}
        onMouseLeave={presence.onMouseLeave}
        onFocusCapture={presence.onFocusCapture}
        onBlurCapture={presence.onBlurCapture}
        onPointerDown={presence.onPointerDown}
      >
        <div className={`grid ${foldStackAlign} ${foldStackWidthClass}`}>
          {/* Collapsed handle — crossfades with the bar (no abrupt mount jump). */}
          <button
            type="button"
            onClick={presence.onToggle}
            className={`${handleChromeClass} ${foldMotion} col-start-1 row-start-1 z-[1] min-h-11 ${
              showMenuText && showMenuIcon
                ? 'gap-2 px-3.5 py-2'
                : showMenuText
                  ? 'px-4 py-2'
                  : 'h-11 w-11'
            } ${
              presence.showHandle
                ? 'relative scale-100 opacity-100 delay-100'
                : 'pointer-events-none absolute scale-90 opacity-0 delay-0'
            }`}
            style={handleChromeStyle}
            aria-expanded={presence.expanded}
            aria-label="Show navigation"
            tabIndex={presence.showHandle ? 0 : -1}
          >
            {showMenuIcon ? <NavMenuControlGlyph icon={menuControlIcon} /> : null}
            {showMenuText ? (
              <span className="text-xs font-bold uppercase tracking-[0.14em]">Menu</span>
            ) : null}
          </button>

          <div
            ref={innerRef}
            className={`${foldMotion} col-start-1 row-start-1 ${innerWidthClass} ${containerClass} ${
              inlineExtras ? '!justify-start' : ''
            } ${
              presence.expanded
                ? 'relative z-0 translate-x-0 translate-y-0 scale-100 opacity-100 delay-75'
                : `pointer-events-none absolute z-0 delay-0 ${foldExitClass}`
            }`}
            style={shellStyle}
            aria-hidden={!presence.expanded}
          >
          {inlineExtras ? (
            <div
              className={`flex min-w-0 items-center gap-2 ${
                placementIsCentered || placementIsEnd ? 'flex-1' : 'shrink-0'
              }`}
            >
              {menuControlAlign === 'left' ? expandedToggleButton : null}
              <PortfolioNavInlineExtras
                settings={settings}
                links={chromeLinks}
                monochrome={monochrome}
                contactHref={contactHref}
                onContactNavigate={onContactNavigate}
                side="left"
              />
            </div>
          ) : menuControlAlign === 'left' ? (
            expandedToggleButton
          ) : null}

          <div
            className={`flex items-center ${itemsGapClass} ${
              vertical ? 'flex-col' : 'flex-row'
            } ${inlineExtras || adjacentExtras ? 'shrink-0' : 'contents'} ${
              (inlineExtras || adjacentExtras) && allowScroll
                ? 'min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                : ''
            }`}
          >
          {adjacentExtras ? (
            <PortfolioNavAdjacentExtras
              settings={settings}
              links={chromeLinks}
              monochrome={monochrome}
              contactHref={contactHref}
              onContactNavigate={onContactNavigate}
              position="before"
            />
          ) : null}
          {sectionItems.map((item, index) => {
          const active = activeId === item.id;
          const label = formatNavLabel(item.label, settings.labelCase);
          const itemColors = portfolioNavItemColorStyles(
            settings.itemIconColor ?? '#525252',
            settings.itemTextColor ?? '#525252',
            settings.itemBackgroundColor ?? '#ffffff',
            settings.itemBorderColor ?? '#e5e5e5',
            active,
            settings.itemBorderEnabled ?? true
          );
          const itemHoverVars = portfolioNavItemHoverCssVars({
            active,
            backgroundColor: settings.itemBackgroundColor ?? '#ffffff',
            borderColor: settings.itemBorderColor ?? '#e5e5e5',
            iconColor: settings.itemIconColor ?? '#525252',
            textColor: settings.itemTextColor ?? '#525252',
            hoverIconColor: settings.itemHoverIconColor ?? settings.activeAccentColor ?? '#e2572e',
            hoverTextColor: settings.itemHoverTextColor ?? '#f4f3ef',
            hoverBackgroundColor:
              settings.itemHoverBackgroundColor ?? settings.activeAccentColor ?? '#e2572e',
            hoverBorderColor:
              settings.itemHoverBorderColor ?? settings.activeAccentColor ?? '#e2572e',
            borderEnabled: settings.itemBorderEnabled ?? true,
          });
          const isBottomLine = settings.buttonDesign === 'bottom-line';
          const dockWithLabel =
            settings.barDesign === 'dock' && contentMode === 'both' && !isBottomLine;
          const activeAccentStyle = portfolioNavActiveItemStyle({
            active,
            design: settings.barDesign,
            buttonDesign: settings.buttonDesign,
            activeStyle: settings.activeStyle,
            accentColor: settings.activeAccentColor ?? '#f97316',
            surfaceColor: settings.itemBackgroundColor ?? '#ffffff',
            strongTextColor: navStrongTextColor,
            pageFillColor: navPageFillColor,
            vertical,
          });
          // Inactive: CSS vars + Tailwind classes (no inline hex bg — that blocked hover).
          // Active: keep accent inline styles so they always win.
          // dockWithLabel: outer shell stays transparent; circular chrome lives on the glyph.
          // bottom-line: no box border — hairline via hover/active box-shadow.
          const itemShellStyle = isBottomLine
            ? ({
                backgroundColor: 'transparent',
                borderWidth: 0,
                borderStyle: 'solid' as const,
                ...(active ? activeAccentStyle : itemHoverVars),
              } as CSSProperties)
            : dockWithLabel
            ? ({
                backgroundColor: 'transparent',
                borderWidth: 0,
                borderStyle: 'solid' as const,
                ...(active ? {} : itemHoverVars),
              } as CSSProperties)
            : active
              ? { ...itemColors.shell, ...activeAccentStyle }
              : ({
                  ...itemHoverVars,
                  borderWidth: settings.itemBorderEnabled === false ? 0 : 1,
                  borderStyle: 'solid',
                } as CSSProperties);
          const dockGlyphStyle: CSSProperties | undefined = dockWithLabel
            ? active
              ? {
                  backgroundColor: activeAccentStyle?.backgroundColor,
                  borderColor: activeAccentStyle?.borderColor,
                  color: activeAccentStyle?.color,
                  borderWidth: activeAccentStyle?.borderWidth ?? 1,
                  borderStyle: 'solid',
                }
              : ({
                  ...itemHoverVars,
                  borderWidth: settings.itemBorderEnabled === false ? 0 : 1,
                  borderStyle: 'solid',
                } as CSSProperties)
            : undefined;
          const activeTextStyle =
            active &&
            (settings.barDesign === 'dock' ||
              isBottomLine ||
              settings.activeStyle === 'accent-text' ||
              settings.activeStyle === 'outline' ||
              settings.activeStyle === 'soft-badge' ||
              settings.activeStyle === 'accent-fill' ||
              settings.activeStyle === 'filled-pill' ||
              settings.activeStyle === 'dot') &&
            activeAccentStyle?.color
              ? { color: activeAccentStyle.color }
              : undefined;
          const itemClassName = `${itemBaseClass} ${
            dockWithLabel
              ? ''
              : portfolioNavItemActiveClass(
                  settings.barDesign,
                  settings.buttonDesign,
                  settings.activeStyle,
                  active,
                  vertical
                )
          } ${portfolioNavItemHoverClass(active, settings.buttonDesign, vertical)} ${allowScroll ? 'shrink-0' : ''}`.trim();
          const activeDot =
            active && settings.barDesign === 'classic' && settings.activeStyle === 'dot' ? (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                style={{
                  backgroundColor: settings.activeAccentColor ?? '#f97316',
                }}
              />
            ) : null;
          const itemContent =
            contentMode === 'icons' ? (
              <span
                className={portfolioNavItemHoverIconClass(active)}
                style={
                  active && activeAccentStyle?.color
                    ? { color: activeAccentStyle.color }
                    : undefined
                }
              >
                <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
              </span>
            ) : contentMode === 'both' ? (
              dockWithLabel ? (
                <>
                  <span
                    className={`${portfolioNavDockGlyphClass(
                      settings.barThickness,
                      compact,
                      active
                    )} ${
                      active
                        ? ''
                        : 'bg-[var(--nav-item-bg)] border-[color:var(--nav-item-border)] transition-colors duration-200 group-hover:bg-[var(--nav-item-hover-bg)] group-hover:border-[color:var(--nav-item-hover-border)]'
                    }`}
                    style={dockGlyphStyle}
                  >
                    <span
                      className={portfolioNavItemHoverIconClass(active)}
                      style={
                        active && activeAccentStyle?.color
                          ? { color: activeAccentStyle.color }
                          : undefined
                      }
                    >
                      <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
                    </span>
                  </span>
                  <span
                    className={`max-w-[4.5rem] truncate text-center leading-tight ${portfolioNavItemHoverTextClass(active)}`}
                    style={activeTextStyle}
                  >
                    {label}
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={portfolioNavItemHoverIconClass(active)}
                    style={
                      active && activeAccentStyle?.color
                        ? { color: activeAccentStyle.color }
                        : undefined
                    }
                  >
                    <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
                  </span>
                  <span
                    className={portfolioNavItemHoverTextClass(active)}
                    style={activeTextStyle}
                  >
                    {label}
                  </span>
                </>
              )
            ) : (
              <span className={portfolioNavItemHoverTextClass(active)} style={activeTextStyle}>
                {label}
              </span>
            );

          return (
            <Fragment key={item.id}>
              {showRailDividers && index > 0 ? (
                <span className={portfolioNavRailDividerClass(vertical)} aria-hidden />
              ) : null}
              {isControlled ? (
                <button
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  title={contentMode === 'icons' ? label : undefined}
                  className={itemClassName}
                  style={itemShellStyle}
                >
                  {itemContent}
                  {activeDot}
                </button>
              ) : (
                <a
                  href={`#${item.id}`}
                  aria-label={label}
                  title={contentMode === 'icons' ? label : undefined}
                  className={itemClassName}
                  style={itemShellStyle}
                  onClick={() => {
                    presence.onInteract();
                  }}
                >
                  {itemContent}
                  {activeDot}
                </a>
              )}
            </Fragment>
          );
        })}
          {adjacentExtras ? (
            <PortfolioNavAdjacentExtras
              settings={settings}
              links={chromeLinks}
              monochrome={monochrome}
              contactHref={contactHref}
              onContactNavigate={onContactNavigate}
              position="after"
            />
          ) : null}
          </div>

          {inlineExtras ? (
            <div
              className={`flex min-w-0 items-center justify-end gap-2 ${
                placementIsCentered || placementIsStart ? 'flex-1' : 'shrink-0'
              }`}
            >
              <PortfolioNavInlineExtras
                settings={settings}
                links={chromeLinks}
                monochrome={monochrome}
                contactHref={contactHref}
                onContactNavigate={onContactNavigate}
                side="right"
              />
              {menuControlAlign === 'right' || menuControlAlign === 'center'
                ? expandedToggleButton
                : null}
            </div>
          ) : menuControlAlign === 'right' || menuControlAlign === 'center' ? (
            expandedToggleButton
          ) : null}
      </div>
        </div>
      </div>
    </nav>
      {!inlineExtras ? (
        <PortfolioNavFreeSpaceLinks
          settings={settings}
          links={chromeLinks}
          monochrome={monochrome}
          contactHref={contactHref}
          onContactNavigate={onContactNavigate}
          navRevealed={presence.expanded}
          onMouseEnter={presence.onMouseEnter}
          onMouseLeave={presence.onMouseLeave}
          onFocusCapture={presence.onFocusCapture}
          onBlurCapture={presence.onBlurCapture}
        />
      ) : null}
    </>,
    document.body
  );
}

type PerPageNavItem = {
  id: string;
  label: string;
  icon: PortfolioNavIconVariant;
};

export function PortfolioPerPageNav({
  items,
  settings,
}: {
  items: PerPageNavItem[];
  settings: PortfolioNavSettings;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const visible = useNavVisibility(settings.displayMode);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.2, 0.45, 0.7] }
    );

    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [items]);

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && items.length <= 1) return null;
  if (items.length === 0) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );
  const activeItem = items[activeIndex] ?? items[0];
  const prevItem = activeIndex > 0 ? items[activeIndex - 1] : null;
  const nextItem = activeIndex < items.length - 1 ? items[activeIndex + 1] : null;

  const goTo = (id: string) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <nav
      className={`pointer-events-none fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 transition-opacity duration-300 sm:bottom-8 sm:right-6 pb-[env(safe-area-inset-bottom,0px)] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Page navigation"
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-2.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-md">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-label={item.label}
              title={item.label}
              className={`h-2.5 w-2.5 rounded-full transition ${
                active ? 'scale-125 bg-neutral-950' : 'bg-neutral-300 hover:bg-neutral-500'
              }`}
            />
          );
        })}
      </div>

      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => prevItem && goTo(prevItem.id)}
          disabled={!prevItem}
          aria-label="Previous section"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-[5.5rem] px-1 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            {activeIndex + 1} / {items.length}
          </p>
          <p className="truncate text-xs font-semibold text-neutral-900">
            {formatNavLabel(activeItem.label, settings.labelCase)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => nextItem && goTo(nextItem.id)}
          disabled={!nextItem}
          aria-label="Next section"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function expandMarqueeItems(items: string[], minCount = 8): string[] {
  if (items.length === 0) return [];
  const cycles = Math.max(1, Math.ceil(minCount / items.length));
  const expanded: string[] = [];
  for (let copy = 0; copy < cycles; copy += 1) {
    for (const item of items) expanded.push(item);
  }
  return expanded;
}

/**
 * How many items one marquee track needs so the strip always fills the viewport
 * (avoids the empty “fin” on the right with few skills/services).
 */
function useMarqueeTrackMinCount(itemCount: number, cardApproxPx = 400): {
  viewportRef: RefObject<HTMLDivElement | null>;
  minCount: number;
} {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [minCount, setMinCount] = useState(() => Math.max(6, itemCount * 2));

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || itemCount <= 0) return;

    const update = () => {
      const width = el.clientWidth || window.innerWidth;
      // Fill the viewport + 2 cards of buffer so the right edge never goes empty mid-scroll.
      const need = Math.ceil(width / Math.max(240, cardApproxPx)) + 2;
      setMinCount(Math.max(need, itemCount * 2, 6));
    };

    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [itemCount, cardApproxPx]);

  return { viewportRef, minCount };
}

function MarqueeTrack({ tools, hidden = false }: { tools: string[]; hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {tools.map((tool, index) => (
        <span key={`${tool}-${index}`} className="inline-flex shrink-0 items-center gap-3 px-5 sm:px-7">
          <CreatorToolLogo label={tool} size={36} className="rounded-none" />
          <span className="whitespace-nowrap text-sm font-medium text-neutral-700 dark:text-neutral-200">{tool}</span>
          <span className="h-1 w-1 shrink-0 bg-orange-500" aria-hidden />
        </span>
      ))}
    </div>
  );
}

export function PortfolioToolsMarquee({ tools }: { tools: string[] }) {
  const unique = Array.from(new Set(tools.map((item) => item.trim()).filter(Boolean)));
  if (unique.length === 0) return null;

  const trackItems = expandMarqueeItems(unique, 6);

  return (
    <div className="overflow-hidden border-y border-neutral-200/80 py-5 dark:border-neutral-800 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="portfolio-marquee flex w-max will-change-transform">
        <MarqueeTrack tools={trackItems} />
        <MarqueeTrack tools={trackItems} hidden />
      </div>
    </div>
  );
}

export function EditorialWorkCard({
  item,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  item: MarketplaceContentItem;
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const externalLink = item.linkUrl?.trim() || null;
  const href =
    externalLink ||
    (item.creatorId ? `/marketplace/content/${item.id}` : '#work');
  const title = item.title?.trim() || 'Untitled project';
  const description =
    item.description?.trim() ||
    (item.priceInfo?.trim() && !/^https?:\/\//i.test(item.priceInfo.trim())
      ? item.priceInfo.trim()
      : null);
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const toolsLabelText = presentation.toolsLabelText.trim() || 'Tools to use';
  const iconShellClass = toolsIconShellClass(presentation.toolsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.toolsIconSize);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const useSplitToolsList = tools.length > 5;
  const splitAt = useSplitToolsList ? Math.ceil(tools.length / 2) : tools.length;
  const primaryTools = tools.slice(0, splitAt);
  const overflowTools = tools.slice(splitAt);
  const showStacked = presentation.toolsDisplay === 'stacked';
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' ||
      presentation.toolsDisplay === 'both' ||
      showStacked);
  const showList =
    presentation.showCardTools &&
    presentation.showCardToolList &&
    !showStacked &&
    (presentation.toolsDisplay === 'list' || presentation.toolsDisplay === 'both');
  const isOverlay = presentation.cardDesign === 'overlay';
  const isCompact = presentation.cardDesign === 'compact';
  const showMedia = presentation.showCardMedia !== false;
  const effectivePlacement = workEffectiveContentPlacement(presentation);
  /** Overlay without media → plain text card (no empty scrim). */
  const useOverlayChrome = isOverlay && showMedia;
  const shellClass = workCardShellClass(
    useOverlayChrome ? 'overlay' : showMedia ? presentation.cardDesign : 'stacked',
    effectivePlacement
  );
  const gridStyle = workCardGridStyle(
    showMedia ? presentation.cardDesign : 'stacked',
    effectivePlacement,
    presentation.mediaRatio
  );
  const mediaOrderClass = workCardMediaOrderClass(presentation.cardDesign, effectivePlacement);
  const contentOrderClass = workCardContentOrderClass(presentation.cardDesign, effectivePlacement);
  const edgeClass = workCardEdgeClass(presentation);
  const edgeStyle = workCardEdgeStyle(presentation);
  const frameClass = workCardFrameClass(presentation);
  const frameStyle = workCardFrameStyle(presentation);
  const liftClass = workCardLiftClass(presentation);
  const liftStyle = workCardLiftStyle(presentation);
  const edgeOnShell =
    !showMedia ||
    workCardIsStacked(
      useOverlayChrome ? 'overlay' : presentation.cardDesign,
      effectivePlacement
    );
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const contentVerticalAlign = workCardContentVerticalAlignClass(
    presentation.cardContentVerticalAlign
  );
  const ctaAlign =
    !showMedia && presentation.noMediaInfoLayout === 'centered'
      ? 'justify-center'
      : workCtaAlignClass(presentation.ctaAlignment);
  const contentGapClass = isCompact ? 'gap-3' : 'gap-5';
  const framed = presentation.contentFrameEnabled;
  const mediaAspectClass = workCardMediaAspectClass(
    presentation.cardDesign,
    effectivePlacement,
    presentation.mediaRatio
  );
  const mediaAspectStyle = workCardMediaAspectStyle(
    presentation.cardDesign,
    effectivePlacement,
    presentation.mediaRatio
  );
  const infoWidthClass = showMedia
    ? framed
      ? 'w-full max-w-full'
      : isCompact
        ? 'w-full max-w-full space-y-2'
        : 'w-full max-w-full space-y-3'
    : `${workNoMediaInfoWidthClass(presentation.noMediaInfoLayout)} ${framed ? '' : 'space-y-3'}`;
  const toolsWidthClass = showMedia
    ? `min-w-0 ${contentAlign.block}`
    : `min-w-0 ${workNoMediaInfoWidthClass(presentation.noMediaInfoLayout)} ${
        presentation.noMediaInfoLayout === 'centered' ? '' : contentAlign.block
      }`;
  const infoShellClass = framed
    ? `flex w-full min-w-0 flex-col ${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)} ${
        showMedia
          ? contentAlign.container
          : presentation.noMediaInfoLayout === 'centered'
            ? 'items-center'
            : contentAlign.container
      }`
    : `flex w-full min-w-0 flex-col ${contentGapClass} ${
        showMedia
          ? contentAlign.container
          : presentation.noMediaInfoLayout === 'centered'
            ? 'items-center'
            : contentAlign.container
      }`;
  const infoShellStyle = framed ? workContentFrameStyle(presentation) : undefined;
  const descTopGap = framed ? '' : isCompact ? 'mt-1.5 line-clamp-3' : 'mt-2';
  const toolsIconsTopGap = framed ? '' : presentation.showToolsLabel ? 'mt-1.5' : '';
  const toolsListTopGap = framed ? '' : showIcons ? 'mt-2' : presentation.showToolsLabel ? 'mt-1.5' : '';
  const ctaTopGap = framed ? '' : 'pt-1';
  const cardWidthClass = workCardMaxWidthClass(presentation.cardMaxWidth);
  const chromes = presentation.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES;
  const categoryChrome = chromes.categoryOnCard;
  const titleChrome = chromes.cardTitle;
  const descriptionChrome = chromes.cardDescription;
  const toolsChrome = chromes.tools;
  const toolsChromeFit = Boolean(toolsChrome?.enabled && toolsChrome.fitContent);
  /** Pin-to-bottom fights vertical centering — only pin when aligned to top. */
  const pinToolsEligible =
    edgeOnShell && presentation.cardContentVerticalAlign !== 'center' && presentation.cardContentVerticalAlign !== 'bottom';

  const mediaInner = item.mediaUrl ? (
    <ProductThumbnailMedia
      url={item.mediaUrl}
      alt={title}
      fit="cover"
      autoPlay
      zoomOnHover
      className="h-full w-full"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500 dark:bg-neutral-800">
      Preview unavailable
    </div>
  );

  const mediaBlock = showMedia ? (
    <Link
      href={href}
      className={`${workCardMediaBehaviorClass(presentation.cardDesign)} ${
        edgeOnShell ? '' : edgeClass
      } ${mediaOrderClass}`.trim()}
      style={edgeOnShell ? undefined : edgeStyle}
    >
      <div className={`${mediaAspectClass} w-full`} style={mediaAspectStyle}>
        {mediaInner}
      </div>
    </Link>
  ) : null;

  const contentBlock = (
    <div
      className={`flex h-full min-w-0 flex-col self-stretch lg:min-h-0 lg:py-0 ${
        edgeOnShell ? 'flex-1' : ''
      } ${contentOrderClass} ${
        framed
          ? contentAlign.container
          : showMedia
            ? contentAlign.container
            : presentation.noMediaInfoLayout === 'centered'
              ? 'items-center'
              : contentAlign.container
      }`.trim()}
    >
      <div
        className={`${infoShellClass} ${contentVerticalAlign}${
          edgeOnShell || showMedia ? ' h-full flex-1' : ''
        }`.trim()}
        style={infoShellStyle}
      >
      {presentation.showCategoryOnCard && item.genre?.trim() ? (
        <div
          className={`${workElementChromeClass(categoryChrome)} ${
            showMedia
              ? contentAlign.block
              : presentation.noMediaInfoLayout === 'centered'
                ? ''
                : contentAlign.block
          } ${showMedia ? '' : workNoMediaInfoWidthClass(presentation.noMediaInfoLayout)}`.trim()}
          style={workElementChromeStyle(categoryChrome, presentation.ctaColor)}
        >
          <p
            className={`${elementTextStyleClass(styles.categoryOnCard, 'label')} ${
              showMedia
                ? contentAlign.text
                : presentation.noMediaInfoLayout === 'centered'
                  ? 'text-center'
                  : contentAlign.text
            }`}
            style={elementTextInlineStyle(styles.categoryOnCard)}
          >
            {item.genre.trim()}
          </p>
        </div>
      ) : null}
      {presentation.showCardTitle || (presentation.showCardDescription && description) ? (
        <div
          className={`${infoWidthClass} ${
            framed ? `flex flex-col ${workContentFrameGapClass(presentation.contentFrameGap)}` : ''
          } ${
            showMedia
              ? contentAlign.block
              : presentation.noMediaInfoLayout === 'centered'
                ? ''
                : contentAlign.block
          }`.trim()}
        >
          {presentation.showCardTitle ? (
            <div
              className={workElementChromeClass(titleChrome)}
              style={workElementChromeStyle(titleChrome, presentation.ctaColor)}
            >
              <h3
                className={`break-words leading-tight tracking-[-0.02em] ${elementTextStyleClass(styles.cardTitle, 'title')} ${
                  showMedia
                    ? contentAlign.text
                    : presentation.noMediaInfoLayout === 'centered'
                      ? 'text-center'
                      : contentAlign.text
                }`}
                style={elementTextInlineStyle(styles.cardTitle)}
              >
                <Link href={href} className="transition hover:opacity-80">
                  {title}
                </Link>
              </h3>
            </div>
          ) : null}
          {presentation.showCardDescription && description ? (
            <div
              className={workElementChromeClass(descriptionChrome)}
              style={workElementChromeStyle(descriptionChrome, presentation.ctaColor)}
            >
              <p
                className={`break-words leading-relaxed [overflow-wrap:anywhere] ${descTopGap} ${elementTextStyleClass(styles.cardDescription, 'body')} ${
                  showMedia
                    ? contentAlign.text
                    : presentation.noMediaInfoLayout === 'centered'
                      ? 'text-center'
                      : contentAlign.text
                }`}
                style={elementTextInlineStyle(styles.cardDescription)}
              >
                {description}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {showIcons || showList ? (
        <>
          {workToolsPinSpacerEnabled(presentation, pinToolsEligible) ? (
            <div className="hidden min-h-0 flex-1 lg:block" aria-hidden />
          ) : null}
          <div
            className={workToolsBlockClass(
              presentation,
              pinToolsEligible,
              `${toolsWidthClass} flex flex-col gap-1.5 ${
                toolsChromeFit ? '' : workElementChromeClass(toolsChrome)
              }`
            )}
            style={workToolsBlockStyle(
              presentation,
              pinToolsEligible,
              toolsChromeFit
                ? undefined
                : workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
          {presentation.showToolsLabel && (showIcons || showList) ? (
            <p
              className={`${elementTextStyleClass(styles.toolsLabel, 'label')} ${
                showMedia
                  ? contentAlign.text
                  : presentation.noMediaInfoLayout === 'centered'
                    ? 'text-center'
                    : contentAlign.text
              }`}
              style={elementTextInlineStyle(styles.toolsLabel)}
            >
              {toolsLabelText}
            </p>
          ) : null}
          {showIcons ? (
            showStacked ? (
              <div
                className={`${contentAlign.row} ${toolsIconsTopGap} ${
                  toolsChromeFit ? workElementChromeClass(toolsChrome) : ''
                }`}
                style={
                  toolsChromeFit
                    ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                    : undefined
                }
              >
                <PortfolioToolsStackedIcons
                  tools={tools}
                  sizePx={iconPixelSize + 10}
                  borderColor={
                    workToolIconShellStyle(presentation).borderColor as string | undefined
                  }
                  shellBackground={
                    workToolIconShellStyle(presentation).backgroundColor as string | undefined
                  }
                />
              </div>
            ) : (
              <div
                className={`flex flex-wrap gap-2.5 sm:gap-3 ${contentAlign.row} ${toolsIconsTopGap} ${
                  toolsChromeFit ? workElementChromeClass(toolsChrome) : ''
                }`}
                style={
                  toolsChromeFit
                    ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                    : undefined
                }
              >
                {tools.map((tool) => {
                  const _iconShellStyle = workToolIconShellStyle(presentation);
                  return (
                    <div
                      key={`icon-${tool}`}
                      title={tool}
                      aria-label={tool}
                      className={`flex shrink-0 items-center justify-center rounded-full border shadow-sm ${iconShellClass}`}
                      style={_iconShellStyle}
                    >
                      <CreatorToolLogo
                        label={tool}
                        size={iconPixelSize}
                        className="rounded-full !bg-transparent"
                        brandColor={undefined}
                        bgColor={(_iconShellStyle.backgroundColor as string | undefined) ?? undefined}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : null}
          {showList ? (
            <>
              <div
                className={`${toolsListTopGap} lg:hidden ${
                  toolsChromeFit && !showIcons ? workElementChromeClass(toolsChrome) : ''
                }`}
                style={
                  toolsChromeFit && !showIcons
                    ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                    : undefined
                }
              >
                <EditorialWorkToolsList
                  tools={tools}
                  textStyle={styles.toolsList}
                  accentColor={presentation.ctaColor}
                />
              </div>
              {useSplitToolsList ? (
                <div
                  className={`${toolsListTopGap} hidden gap-x-8 lg:grid lg:grid-cols-2 ${
                    toolsChromeFit && !showIcons ? workElementChromeClass(toolsChrome) : ''
                  }`}
                  style={
                    toolsChromeFit && !showIcons
                      ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                      : undefined
                  }
                >
                  <EditorialWorkToolsList
                    tools={primaryTools}
                    textStyle={styles.toolsList}
                    accentColor={presentation.ctaColor}
                  />
                  <EditorialWorkToolsList
                    tools={overflowTools}
                    textStyle={styles.toolsList}
                    accentColor={presentation.ctaColor}
                  />
                </div>
              ) : (
                <div
                  className={`${toolsListTopGap} hidden lg:block ${
                    toolsChromeFit && !showIcons ? workElementChromeClass(toolsChrome) : ''
                  }`}
                  style={
                    toolsChromeFit && !showIcons
                      ? workElementChromeStyle(toolsChrome, presentation.ctaColor)
                      : undefined
                  }
                >
                  <EditorialWorkToolsList
                    tools={tools}
                    textStyle={styles.toolsList}
                    accentColor={presentation.ctaColor}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
        </>
      ) : null}

      {presentation.showCardCta ? (
        <div
          className={`flex w-full min-w-0 ${ctaTopGap} ${ctaAlign}${
            edgeOnShell &&
            !(showIcons || showList) &&
            presentation.cardContentVerticalAlign === 'top'
              ? ' mt-auto'
              : ''
          }`.trim()}
        >
          <Link
            href={href}
            className={workCtaClassName(presentation.ctaDesign, presentation)}
            style={workCtaStyle(presentation.ctaDesign, presentation)}
          >
            <WorkCtaLabelAndIcon
              presentation={presentation}
              label={presentation.ctaLabel}
              labelClassName={elementTextStyleClass(styles.cta, 'body')}
              labelStyle={(() => {
                const fontOnly = { ...elementTextInlineStyle(styles.cta) };
                delete fontOnly.color;
                return fontOnly;
              })()}
            />
          </Link>
        </div>
      ) : null}
      </div>
    </div>
  );

  if (useOverlayChrome) {
    const overlayTools = tools.slice(0, Math.min(presentation.maxToolsShown, 6));
    const overlayIconShell = toolsIconShellClass('sm');
    const overlayIconPx = toolsIconPixelSize('sm');
    const titleStyle = {
      ...elementTextInlineStyle(styles.cardTitle),
      color: workOverlayElementInk(styles.cardTitle.color, titleChrome),
    };
    const descStyle = {
      ...elementTextInlineStyle(styles.cardDescription),
      color: workOverlayElementInk(
        styles.cardDescription.color,
        descriptionChrome,
        'rgba(255,255,255,0.88)'
      ),
    };
    const toolsListStyle = {
      ...elementTextInlineStyle(styles.toolsList),
      color: workOverlayElementInk(styles.toolsList.color, toolsChrome, 'rgba(255,255,255,0.85)'),
    };
    const ctaInk = workOverlayReadableColor(styles.cta.color);
    const ctaFontStyle = (() => {
      const fontOnly = { ...elementTextInlineStyle(styles.cta) };
      delete fontOnly.color;
      return fontOnly;
    })();
    const ctaSurfaceStyle = (() => {
      const base = workCtaStyle(presentation.ctaDesign, presentation) ?? {};
      // Filled pills already use page `fond` — don't force overlay-white ink.
      if (presentation.ctaDesign === 'pill-accent' || presentation.ctaDesign === 'pill-dark') {
        return base;
      }
      // Outline / circle / text on dark scrim: keep readable resting label.
      return {
        ...base,
        ['--work-cta-text' as string]: ctaInk,
        ['--work-cta-hover-text' as string]:
          presentation.ctaDesign === 'pill-outline'
            ? ((base as Record<string, string>)['--work-cta-page-fond'] ?? ctaInk)
            : presentation.ctaColor || ctaInk,
      };
    })();
    const overlayIconStyle = workToolIconShellStyle(presentation);
    const overlayIconBg =
      (overlayIconStyle.backgroundColor as string | undefined) ?? undefined;
    const categoryCompactWidthClass =
      categoryChrome?.enabled && categoryChrome.fitContent === false
        ? '!w-fit !max-w-full lg:!w-full'
        : '!w-fit !max-w-full';
    const useFreeOverlay = presentation.overlayLayoutMode === 'free';
    const placements = presentation.overlayElementPlacements ?? DEFAULT_WORK_OVERLAY_ELEMENT_PLACEMENTS;
    const bands = presentation.overlayElementBands ?? DEFAULT_WORK_OVERLAY_ELEMENT_BANDS;
    const overlayDarkness = Math.min(
      200,
      Math.max(0, presentation.overlayMediaDarkness ?? 100)
    ) / 100;

    const categoryNode =
      presentation.showCategoryOnCard && item.genre?.trim() ? (
        <div
          className={`${categoryCompactWidthClass} ${workElementChromeClass(categoryChrome)}`}
          style={workElementChromeStyle(categoryChrome, presentation.ctaColor)}
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.16em]"
            style={{
              ...elementTextInlineStyle(styles.categoryOnCard),
              color: workOverlayElementInk(styles.categoryOnCard.color, categoryChrome),
            }}
          >
            {item.genre.trim()}
          </p>
        </div>
      ) : null;

    const titleNode = presentation.showCardTitle ? (
      <div
        className={workElementChromeClass(titleChrome)}
        style={workElementChromeStyle(titleChrome, presentation.ctaColor)}
      >
        <h3
          className="line-clamp-2 break-words text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl"
          style={titleStyle}
        >
          <Link href={href} className="transition hover:opacity-80">
            {title}
          </Link>
        </h3>
      </div>
    ) : null;

    const descriptionNode =
      presentation.showCardDescription && description ? (
        <div
          className={workElementChromeClass(descriptionChrome)}
          style={workElementChromeStyle(descriptionChrome, presentation.ctaColor)}
        >
          <p
            className="line-clamp-3 max-w-xl break-words text-sm leading-relaxed [overflow-wrap:anywhere] sm:text-base"
            style={descStyle}
          >
            {description}
          </p>
        </div>
      ) : null;

    const toolsNode =
      showIcons && overlayTools.length > 0 ? (
        showStacked ? (
          <div
            className={workToolsBlockClass(
              presentation,
              false,
              workElementChromeClass(toolsChrome)
            )}
            style={workToolsBlockStyle(
              presentation,
              false,
              workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
            <PortfolioToolsStackedIcons
              tools={overlayTools}
              sizePx={overlayIconPx + 8}
              borderColor={
                typeof overlayIconStyle.borderColor === 'string'
                  ? overlayIconStyle.borderColor
                  : '#0a0a0a'
              }
              shellBackground={overlayIconBg}
            />
          </div>
        ) : (
          <div
            className={workToolsBlockClass(
              presentation,
              false,
              `flex flex-wrap gap-2 ${workElementChromeClass(toolsChrome)}`
            )}
            style={workToolsBlockStyle(
              presentation,
              false,
              workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
            {overlayTools.map((tool) => (
              <div
                key={`overlay-icon-${tool}`}
                title={tool}
                aria-label={tool}
                className={`flex shrink-0 items-center justify-center rounded-full border backdrop-blur-sm ${overlayIconShell}`}
                style={overlayIconStyle}
              >
                <CreatorToolLogo
                  label={tool}
                  size={overlayIconPx}
                  className="rounded-full !bg-transparent"
                  brandColor={undefined}
                  bgColor={overlayIconBg}
                />
              </div>
            ))}
          </div>
        )
      ) : showList && tools.length > 0 ? (
        <div
          className={workToolsBlockClass(
            presentation,
            false,
            workElementChromeClass(toolsChrome)
          )}
          style={workToolsBlockStyle(
            presentation,
            false,
            workElementChromeStyle(toolsChrome, presentation.ctaColor)
          )}
        >
          <p className="line-clamp-2 break-words text-sm" style={toolsListStyle}>
            {tools.join(' · ')}
          </p>
        </div>
      ) : null;

    const ctaNode = presentation.showCardCta ? (
      <Link
        href={href}
        className={`${workCtaClassName(presentation.ctaDesign, presentation)} shrink-0 flex-nowrap`}
        style={ctaSurfaceStyle}
      >
        <WorkCtaLabelAndIcon
          presentation={presentation}
          label={presentation.ctaLabel}
          labelClassName={elementTextStyleClass(styles.cta, 'body')}
          labelStyle={ctaFontStyle}
          nowrap
        />
      </Link>
    ) : null;

    const elementNodes: Record<PortfolioWorkOverlayElementId, ReactNode> = {
      category: categoryNode,
      title: titleNode,
      description: descriptionNode,
      tools: toolsNode,
      cta: ctaNode,
    };

    const flowElementNodes: Record<PortfolioWorkOverlayElementId, ReactNode> = {
      category:
        presentation.showCategoryOnCard && item.genre?.trim() ? (
          <div
            className={`${categoryCompactWidthClass} ${workElementChromeClass(categoryChrome)}`}
            style={workElementChromeStyle(categoryChrome, presentation.ctaColor)}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.16em]"
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </p>
          </div>
        ) : null,
      title: presentation.showCardTitle ? (
        <div
          className={`w-full ${workElementChromeClass(titleChrome)}`}
          style={workElementChromeStyle(titleChrome, presentation.ctaColor)}
        >
          <h3
            className="w-full break-words text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl"
            style={elementTextInlineStyle(styles.cardTitle)}
          >
            <Link href={href} className="transition hover:opacity-80">
              {title}
            </Link>
          </h3>
        </div>
      ) : null,
      description:
        presentation.showCardDescription && description ? (
          <div
            className={`w-full ${workElementChromeClass(descriptionChrome)}`}
            style={workElementChromeStyle(descriptionChrome, presentation.ctaColor)}
          >
            <p
              className="w-full max-w-none break-words text-sm leading-relaxed [overflow-wrap:anywhere] sm:text-base"
              style={elementTextInlineStyle(styles.cardDescription)}
            >
              {description}
            </p>
          </div>
        ) : null,
      tools:
        showIcons && overlayTools.length > 0 ? (
          toolsNode
        ) : showList && tools.length > 0 ? (
          <div
            className={workToolsBlockClass(
              presentation,
              false,
              workElementChromeClass(toolsChrome)
            )}
            style={workToolsBlockStyle(
              presentation,
              false,
              workElementChromeStyle(toolsChrome, presentation.ctaColor)
            )}
          >
            <p
              className="break-words text-sm"
              style={elementTextInlineStyle(styles.toolsList)}
            >
              {tools.join(' · ')}
            </p>
          </div>
        ) : null,
      cta: presentation.showCardCta ? (
        <Link
          href={href}
          className={`${workCtaClassName(presentation.ctaDesign, presentation)} shrink-0 flex-nowrap`}
          style={workCtaStyle(presentation.ctaDesign, presentation)}
        >
          <WorkCtaLabelAndIcon
            presentation={presentation}
            label={presentation.ctaLabel}
            labelClassName={elementTextStyleClass(styles.cta, 'body')}
            labelStyle={ctaFontStyle}
            nowrap
          />
        </Link>
      ) : null,
    };

    const onMediaElement = (id: PortfolioWorkOverlayElementId) =>
      bands[id] === 'on-media' ? elementNodes[id] : null;

    const stackBody = (
      <div
        className={`pointer-events-auto flex w-full min-w-0 flex-col ${
          framed
            ? `${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)}`
            : 'gap-2.5 sm:gap-3'
        } ${contentAlign.container} ${contentAlign.text}`}
        style={framed ? workContentFrameStyle(presentation) : undefined}
      >
        {onMediaElement('category') ? <div className={contentAlign.text}>{categoryNode}</div> : null}
        {onMediaElement('title') ? <div className={contentAlign.text}>{titleNode}</div> : null}
        {onMediaElement('description') ? <div className={contentAlign.block}>{descriptionNode}</div> : null}
        {onMediaElement('tools') ? (
          <div className={showIcons && overlayTools.length > 0 ? contentAlign.row : undefined}>
            {toolsNode}
          </div>
        ) : null}
        {onMediaElement('cta') ? <div className={`flex w-full min-w-0 pt-0.5 ${ctaAlign}`}>{ctaNode}</div> : null}
      </div>
    );

    const freeCellGroups = (() => {
      const groups = new Map<PortfolioWorkOverlayCellPlacement, PortfolioWorkOverlayElementId[]>();
      for (const id of PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS) {
        if (bands[id] !== 'on-media' || !elementNodes[id]) continue;
        const cell = placements[id];
        const list = groups.get(cell) ?? [];
        list.push(id);
        groups.set(cell, list);
      }
      return Array.from(groups.entries());
    })();

    /** Small screens keep the chosen top / middle / bottom band instead of one bottom pile. */
    const freeRowGroups = (['top', 'center', 'bottom'] as const).map((row) => ({
      row,
      ids: PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS.filter(
        (id) =>
          bands[id] === 'on-media' &&
          elementNodes[id] &&
          workOverlayCellRow(placements[id]) === row
      ),
    }));

    const freeMobileBody = (
      <>
        {freeRowGroups.map(({ row, ids }) => {
          /** Same band = same line: left / center / right stay side by side, and wrap when too narrow. */
          const columnGroups = (['left', 'center', 'right'] as const)
            .map((col) => ({
              col,
              ids: ids.filter((id) => workOverlayCellColumn(placements[id]) === col),
            }))
            .filter((group) => group.ids.length > 0);
          return (
            <div
              key={row}
              className={`flex w-full min-w-0 flex-wrap gap-x-4 ${
                framed
                  ? `${workContentFrameGapClass(presentation.contentFrameGap)} ${
                      ids.length > 0 ? workContentFrameClass(presentation) : ''
                    }`
                  : 'gap-y-2.5 sm:gap-y-3'
              } ${
                row === 'top'
                  ? 'items-start'
                  : row === 'center'
                    ? 'my-auto items-center'
                    : 'items-end'
              }`}
              style={framed && ids.length > 0 ? workContentFrameStyle(presentation) : undefined}
            >
              {columnGroups.map(({ col, ids: columnIds }) => (
                <div
                  key={col}
                  className={`flex min-w-0 flex-1 basis-40 flex-col gap-2.5 ${
                    col === 'left'
                      ? 'items-start'
                      : col === 'center'
                        ? 'items-center'
                        : 'items-end'
                  }`}
                >
                  {columnIds.map((id) => {
                    const cell = placements[id];
                    return (
                      <div
                        key={id}
                        className={`pointer-events-auto flex w-full min-w-0 flex-col ${workOverlayCellAlignClass(
                          cell
                        )} ${
                          id === 'cta' || id === 'tools' ? workOverlayCellRowAlignClass(cell) : ''
                        }`}
                      >
                        {elementNodes[id]}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </>
    );

    const flowBand = (band: 'above' | 'below') => {
      const ids = PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS.filter(
        (id) => bands[id] === band && flowElementNodes[id]
      );
      if (ids.length === 0) return null;
      return (
        <div className="flex w-full min-w-0 flex-col gap-3 p-5 sm:gap-4 sm:p-7">
          {ids.map((id) => {
            const node = flowElementNodes[id];
            const cell = placements[id];
            return (
              <div
                key={id}
                className={`flex w-full min-w-0 flex-col ${workOverlayCellAlignClass(cell)} ${
                  id === 'cta' || id === 'tools' ? workOverlayCellRowAlignClass(cell) : ''
                }`}
              >
                {node}
              </div>
            );
          })}
        </div>
      );
    };

    const overlayInner = (
      <>
        {flowBand('above')}
        <div
          className={`group relative overflow-hidden transition duration-300 hover:-translate-y-0.5 ${edgeClass}`}
          style={{
            ...edgeStyle,
            ...(presentation.cardBackgroundEnabled
              ? { backgroundColor: presentation.cardBackgroundColor }
              : undefined),
          }}
        >
        <Link href={href} className="relative block">
          <div
            className={`${workCardMediaAspectClass('overlay', presentation.contentPlacement, presentation.mediaRatio)} min-h-[18rem] w-full sm:min-h-[22rem]`}
            style={mediaAspectStyle}
          >
            {mediaInner}
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,${Math.min(1, 0.9 * overlayDarkness)}), rgba(0,0,0,${Math.min(1, 0.45 * overlayDarkness)}), rgba(0,0,0,${Math.min(1, 0.1 * overlayDarkness)}))`,
            }}
            aria-hidden
          />
        </Link>

        {/* Mobile / tablet: free mode keeps its bands, stack mode uses the bottom pile */}
        {useFreeOverlay ? (
          <div className="pointer-events-none absolute inset-0 flex flex-col gap-3 overflow-hidden p-5 sm:gap-4 sm:p-7 lg:hidden">
            {freeMobileBody}
          </div>
        ) : (
          <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 flex max-h-[78%] flex-col justify-end gap-3 overflow-hidden p-5 sm:gap-4 sm:p-7 ${contentAlign.container}`}
          >
            {stackBody}
          </div>
        )}

        {/* Large screens + free mode: absolute 3×3 cells */}
        {useFreeOverlay ? (
          <div className="pointer-events-none absolute inset-0 hidden p-5 sm:p-7 lg:block">
            {freeCellGroups.map(([cell, ids]) => {
              const needsReadableWidth = ids.some(
                (id) => id === 'title' || id === 'description' || id === 'tools'
              );
              return (
              <div
                key={cell}
                className={`pointer-events-auto absolute flex w-max max-w-[min(100%,22rem)] flex-col gap-2.5 ${
                  needsReadableWidth ? 'min-w-[min(100%,16rem)]' : ''
                } ${workOverlayCellAlignClass(cell)}`}
                style={workOverlayCellAbsoluteStyle(cell)}
              >
                {ids.map((id) => {
                  const node = elementNodes[id];
                  if (!node) return null;
                  if (id === 'cta') {
                    return (
                      <div key={id} className={`flex w-auto shrink-0 ${workOverlayCellRowAlignClass(cell)}`}>
                        {node}
                      </div>
                    );
                  }
                  if (id === 'tools') {
                    return (
                      <div key={id} className={`flex w-full ${workOverlayCellRowAlignClass(cell)}`}>
                        {node}
                      </div>
                    );
                  }
                  return <div key={id} className="w-full min-w-0">{node}</div>;
                })}
              </div>
              );
            })}
          </div>
        ) : null}
        </div>
        {flowBand('below')}
        {presentation.overlayBottomRuleEnabled ? (
          <span
            className="mx-5 mt-5 block h-px sm:mx-7 sm:mt-7"
            style={{ backgroundColor: presentation.overlayBottomRuleColor }}
            aria-hidden
          />
        ) : null}
      </>
    );
    const hasOutsideBand = PORTFOLIO_WORK_OVERLAY_ELEMENT_IDS.some(
      (id) => bands[id] === 'above' || bands[id] === 'below'
    );
    const overlayFrameStyle = hasOutsideBand
      ? { ...frameStyle, backgroundColor: 'transparent' }
      : frameStyle;

    if (frameClass) {
      return (
        <article
          className={`h-full ${cardWidthClass} ${frameClass} ${liftClass}`.trim()}
          style={{ ...overlayFrameStyle, ...liftStyle }}
        >
          {overlayInner}
        </article>
      );
    }
    return (
      <article className={`h-full ${cardWidthClass} ${liftClass}`.trim()} style={liftStyle}>
        {overlayInner}
      </article>
    );
  }

  const cardShell = (
    <div
      className={[edgeOnShell ? `${edgeClass} overflow-hidden` : '', shellClass].filter(Boolean).join(' ')}
      style={{
        ...(edgeOnShell ? edgeStyle : undefined),
        ...gridStyle,
      }}
    >
      {mediaBlock}
      {contentBlock}
    </div>
  );

  if (frameClass) {
    return (
      <article
        className={`h-full ${cardWidthClass} ${frameClass} ${liftClass}`.trim()}
        style={{ ...frameStyle, ...liftStyle }}
      >
        {cardShell}
      </article>
    );
  }

  return (
    <article className={`h-full ${cardWidthClass} ${liftClass}`.trim()} style={liftStyle}>
      {cardShell}
    </article>
  );
}

function WorkChevronIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function WorkCardThumb({
  item,
  title,
  className,
}: {
  item: MarketplaceContentItem;
  title: string;
  className: string;
}) {
  return item.mediaUrl ? (
    <div className={className}>
      <ProductThumbnailMedia url={item.mediaUrl} alt={title} fit="cover" className="h-full w-full" />
    </div>
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-neutral-200 text-[10px] text-neutral-500 dark:bg-neutral-800`}
    >
      N/A
    </div>
  );
}

/** Design 2 — Liste compacte: elevated row, bold thumb, balanced content, circled action. */
function EditorialWorkListCard({
  item,
  presentation,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
}) {
  const href =
    item.linkUrl?.trim() ||
    (item.creatorId ? `/marketplace/content/${item.id}` : '#work');
  const title = item.title?.trim() || 'Untitled project';
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const surfaceClass = workListCardSurfaceClass(presentation);
  const surfaceStyle = workListCardSurfaceStyle(presentation);
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const cardWidthClass = workCardMaxWidthClass(presentation.cardMaxWidth);
  const showMedia = presentation.showCardMedia !== false;
  const mediaPlacement = workEffectiveContentPlacement(presentation);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const showStacked = presentation.toolsDisplay === 'stacked';
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' ||
      presentation.toolsDisplay === 'both' ||
      showStacked) &&
    tools.length > 0;
  const showList =
    presentation.showCardTools &&
    presentation.showCardToolList &&
    !showStacked &&
    (presentation.toolsDisplay === 'list' || presentation.toolsDisplay === 'both') &&
    tools.length > 0;
  const iconShellClass = toolsIconShellClass('sm');
  const iconPixelSize = toolsIconPixelSize('sm');
  const chromes = presentation.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES;
  const cta = presentation.ctaColor;

  const toolsBlock =
    showIcons || showList ? (
      <div
        className={workToolsBlockClass(
          presentation,
          false,
          `space-y-1.5 ${contentAlign.container} ${workElementChromeClass(chromes.tools)}`
        )}
        style={workToolsBlockStyle(
          presentation,
          false,
          workElementChromeStyle(chromes.tools, cta)
        )}
      >
        {showIcons ? (
          showStacked ? (
            <div className={contentAlign.row}>
              <PortfolioToolsStackedIcons
                tools={tools}
                sizePx={iconPixelSize + 8}
                borderColor={
                  workToolIconShellStyle(presentation).borderColor as string | undefined
                }
                shellBackground={
                  workToolIconShellStyle(presentation).backgroundColor as string | undefined
                }
              />
            </div>
          ) : (
            <div className={`flex flex-wrap gap-1.5 ${contentAlign.row}`}>
              {tools.map((tool) => {
                const _iconShellStyle = workToolIconShellStyle(presentation);
                return (
                  <div
                    key={`list-icon-${item.id}-${tool}`}
                    title={tool}
                    aria-label={tool}
                    className={`flex shrink-0 items-center justify-center rounded-full border shadow-sm ${iconShellClass}`}
                    style={_iconShellStyle}
                  >
                    <CreatorToolLogo
                      label={tool}
                      size={iconPixelSize}
                      className="rounded-full !bg-transparent"
                      brandColor={undefined}
                      bgColor={(_iconShellStyle.backgroundColor as string | undefined) ?? undefined}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : null}
        {showList ? (
          <p
            className={`line-clamp-1 break-words ${elementTextStyleClass(styles.toolsList, 'body')}`}
            style={elementTextInlineStyle(styles.toolsList)}
          >
            {tools.join(' · ')}
          </p>
        ) : null}
      </div>
    ) : null;

  const actionButton = (
    <span
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
      style={{
        color: cta,
        borderColor: `color-mix(in srgb, ${cta} 40%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${cta} 10%, transparent)`,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `color-mix(in srgb, ${cta} 22%, transparent)` }}
        aria-hidden
      />
      <ArrowUpRight
        className="relative h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-[1.125rem] sm:w-[1.125rem]"
        style={{ color: cta }}
        aria-hidden
      />
    </span>
  );

  return (
    <Link
      href={href}
      className={`group flex w-full ${workListMediaFlexClass(mediaPlacement)} ${cardWidthClass} ${surfaceClass}`.trim()}
      style={surfaceStyle}
    >
      {showMedia ? (
        <WorkCardThumb
          item={item}
          title={title}
          className={workListThumbClass(mediaPlacement, presentation.mediaRatio)}
        />
      ) : null}

      <div
        className={
          presentation.contentFrameEnabled
            ? `flex min-w-0 w-full flex-1 flex-col ${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)} ${contentAlign.text}`
            : `min-w-0 w-full flex-1 space-y-2 ${contentAlign.text}`
        }
        style={{
          ...(presentation.contentFrameEnabled ? workContentFrameStyle(presentation) : {}),
          maxWidth: '42rem',
        }}
      >
        {presentation.showCategoryOnCard && item.genre?.trim() ? (
          <div
            className={workElementChromeClass(chromes.categoryOnCard)}
            style={workElementChromeStyle(chromes.categoryOnCard, cta)}
          >
            <p
              className={`mb-0.5 ${elementTextStyleClass(styles.categoryOnCard, 'label')}`}
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </p>
          </div>
        ) : null}
        {presentation.showCardTitle ? (
          <div
            className={workElementChromeClass(chromes.cardTitle)}
            style={workElementChromeStyle(chromes.cardTitle, cta)}
          >
            <p
              className={`line-clamp-2 break-words transition duration-200 group-hover:opacity-90 ${elementTextStyleClass(styles.cardTitle, 'body')}`}
              style={elementTextInlineStyle(styles.cardTitle)}
            >
              {title}
            </p>
          </div>
        ) : null}
        {presentation.showCardDescription && description ? (
          <div
            className={workElementChromeClass(chromes.cardDescription)}
            style={workElementChromeStyle(chromes.cardDescription, cta)}
          >
            <p
              className={`break-words [overflow-wrap:anywhere] sm:line-clamp-2 ${elementTextStyleClass(styles.cardDescription, 'body')}`}
              style={elementTextInlineStyle(styles.cardDescription)}
            >
              {description}
            </p>
          </div>
        ) : null}
      </div>

      {/* Mobile: tools + action on one bottom row. Desktop: tools beside circled action. */}
      <div className="flex w-full items-center justify-between gap-3 sm:ml-auto sm:w-auto sm:justify-end sm:gap-4">
        {toolsBlock ? <div className="min-w-0 flex-1 sm:flex-none">{toolsBlock}</div> : <span className="flex-1 sm:hidden" />}
        {actionButton}
      </div>
    </Link>
  );
}

/** Design 4 — Accordéon: expandable row revealing description, tools, and CTA. */
function EditorialWorkAccordionRow({
  item,
  presentation,
  defaultOpen = false,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const href =
    item.linkUrl?.trim() ||
    (item.creatorId ? `/marketplace/content/${item.id}` : '#work');
  const title = item.title?.trim() || 'Untitled project';
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.toolsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.toolsIconSize);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const showStacked = presentation.toolsDisplay === 'stacked';
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' ||
      presentation.toolsDisplay === 'both' ||
      showStacked);
  const edgeClass = workCardEdgeClass(presentation);
  const edgeStyle = workCardEdgeStyle(presentation);
  const frameClass = workCardFrameClass(presentation);
  const frameStyle = workCardFrameStyle(presentation);
  const liftClass = workCardLiftClass(presentation);
  const liftStyle = workCardLiftStyle(presentation);
  const cardWidthClass = workCardMaxWidthClass(presentation.cardMaxWidth);
  const baseFrame = [edgeClass, frameClass, 'overflow-hidden'].filter(Boolean).join(' ');
  const innerPad = presentation.cardPadding === 'none' ? 'px-4 sm:px-5' : '';
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const ctaAlign = workCtaAlignClass(presentation.ctaAlignment);
  const showMedia = presentation.showCardMedia !== false;
  const mediaPlacement = workEffectiveContentPlacement(presentation);
  const stackedMedia = mediaPlacement === 'bottom' || mediaPlacement === 'top';
  const accordionThumbClass = stackedMedia
    ? 'aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl'
    : 'h-12 w-12 shrink-0 overflow-hidden rounded-lg';
  const chromes = presentation.elementChromes ?? DEFAULT_WORK_ELEMENT_CHROMES;
  const rowStyle: CSSProperties = {
    ...frameStyle,
    ...edgeStyle,
  };

  const accordionThumb =
    showMedia ? (
      <WorkCardThumb item={item} title={title} className={accordionThumbClass} />
    ) : null;

  const accordionTitleRow = (
    <span className="flex min-w-0 flex-1 items-center gap-4">
      {showMedia && mediaPlacement === 'side' ? accordionThumb : null}
      <span className="min-w-0 flex-1">
        {presentation.showCategoryOnCard && item.genre?.trim() ? (
          <span
            className={`mb-0.5 block ${workElementChromeClass(chromes.categoryOnCard)}`}
            style={workElementChromeStyle(chromes.categoryOnCard, presentation.ctaColor)}
          >
            <span
              className={elementTextStyleClass(styles.categoryOnCard, 'label')}
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </span>
          </span>
        ) : null}
        {presentation.showCardTitle ? (
          <span
            className={`block ${workElementChromeClass(chromes.cardTitle)}`}
            style={workElementChromeStyle(chromes.cardTitle, presentation.ctaColor)}
          >
            <span
              className={`block line-clamp-2 break-words ${elementTextStyleClass(styles.cardTitle, 'body')}`}
              style={elementTextInlineStyle(styles.cardTitle)}
            >
              {title}
            </span>
          </span>
        ) : null}
      </span>
      {showMedia && mediaPlacement === 'side-reverse' ? accordionThumb : null}
      <WorkChevronIcon
        className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
          open ? 'rotate-180' : ''
        }`}
        style={{ color: presentation.categoryMutedColor }}
      />
    </span>
  );

  return (
    <div className={`${cardWidthClass} ${liftClass}`.trim()} style={liftStyle}>
    <div className={baseFrame} style={rowStyle}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full flex-col gap-3 py-4 text-left ${innerPad}`}
        aria-expanded={open}
      >
        {stackedMedia && mediaPlacement === 'bottom' ? accordionThumb : null}
        {accordionTitleRow}
        {stackedMedia && mediaPlacement === 'top' ? accordionThumb : null}
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
            <div
              className={`flex flex-col pb-5 ${innerPad} ${contentAlign.container} ${
                presentation.contentFrameEnabled
                  ? `${workContentFrameGapClass(presentation.contentFrameGap)} ${workContentFrameClass(presentation)}`
                  : 'gap-4'
              }`}
              style={presentation.contentFrameEnabled ? workContentFrameStyle(presentation) : undefined}
            >
            {presentation.showCardDescription && description ? (
              <div
                className={workElementChromeClass(chromes.cardDescription)}
                style={workElementChromeStyle(chromes.cardDescription, presentation.ctaColor)}
              >
                <p
                  className={`break-words leading-relaxed [overflow-wrap:anywhere] ${elementTextStyleClass(styles.cardDescription, 'body')} ${contentAlign.text}`}
                  style={elementTextInlineStyle(styles.cardDescription)}
                >
                  {description}
                </p>
              </div>
            ) : null}
            {showIcons && tools.length > 0 ? (
              showStacked ? (
                <div
                  className={workToolsBlockClass(
                    presentation,
                    false,
                    `${contentAlign.row} ${workElementChromeClass(chromes.tools)}`
                  )}
                  style={workToolsBlockStyle(
                    presentation,
                    false,
                    workElementChromeStyle(chromes.tools, presentation.ctaColor)
                  )}
                >
                  <PortfolioToolsStackedIcons
                    tools={tools}
                    sizePx={iconPixelSize + 10}
                    borderColor={
                      workToolIconShellStyle(presentation).borderColor as string | undefined
                    }
                    shellBackground={
                      workToolIconShellStyle(presentation).backgroundColor as string | undefined
                    }
                  />
                </div>
              ) : (
                <div
                  className={workToolsBlockClass(
                    presentation,
                    false,
                    `flex flex-wrap gap-2.5 ${contentAlign.row} ${workElementChromeClass(chromes.tools)}`
                  )}
                  style={workToolsBlockStyle(
                    presentation,
                    false,
                    workElementChromeStyle(chromes.tools, presentation.ctaColor)
                  )}
                >
                  {tools.map((tool) => {
                    const _iconShellStyle = workToolIconShellStyle(presentation);
                    return (
                      <div
                        key={`acc-${item.id}-${tool}`}
                        title={tool}
                        aria-label={tool}
                        className={`flex shrink-0 items-center justify-center rounded-full border shadow-sm ${iconShellClass}`}
                        style={_iconShellStyle}
                      >
                        <CreatorToolLogo
                          label={tool}
                          size={iconPixelSize}
                          className="rounded-full !bg-transparent"
                          brandColor={undefined}
                          bgColor={(_iconShellStyle.backgroundColor as string | undefined) ?? undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              )
            ) : null}
            {presentation.showCardCta ? (
              <div className={`flex w-full min-w-0 ${ctaAlign}`}>
                <Link
                  href={href}
                  className={workCtaClassName(presentation.ctaDesign, presentation)}
                  style={workCtaStyle(presentation.ctaDesign, presentation)}
                >
                  <WorkCtaLabelAndIcon
                    presentation={presentation}
                    label={presentation.ctaLabel}
                    labelClassName={elementTextStyleClass(styles.cta, 'body')}
                    labelStyle={(() => {
                      const fontOnly = { ...elementTextInlineStyle(styles.cta) };
                      delete fontOnly.color;
                      return fontOnly;
                    })()}
                  />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

/** Renders the full collection of work items according to the chosen gallery layout. */
export function EditorialWorkGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Split-screen nav: one project card per row so content matches the fixed title rail. */
  forceSingleColumn?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState(WORK_CATEGORY_ALL_KEY);
  const categories = useMemo(
    () => collectWorkCategories(items, presentation.categoryUncategorizedLabel),
    [items, presentation.categoryUncategorizedLabel]
  );
  const showFilter =
    (presentation.categoryMode === 'filter' || presentation.categoryMode === 'filter-and-group') &&
    categories.length > 1;
  const showGroups =
    presentation.categoryMode === 'group' || presentation.categoryMode === 'filter-and-group';

  useEffect(() => {
    if (activeCategory === WORK_CATEGORY_ALL_KEY) return;
    if (!categories.some((category) => category.key === activeCategory)) {
      setActiveCategory(WORK_CATEGORY_ALL_KEY);
    }
  }, [activeCategory, categories]);

  const filteredItems = useMemo(
    () => (showFilter ? filterWorkItemsByCategory(items, activeCategory) : items),
    [activeCategory, items, showFilter]
  );

  const groups = useMemo(
    () =>
      showGroups
        ? groupWorkItemsByCategory(filteredItems, presentation.categoryUncategorizedLabel)
        : [{ key: WORK_CATEGORY_ALL_KEY, label: '', items: filteredItems }],
    [filteredItems, presentation.categoryUncategorizedLabel, showGroups]
  );

  const filterBar =
    showFilter ? (
      <div className={workCategoryBarAlignClass(presentation.cardAlignment)}>
      <nav
        className={workCategoryNavClass(presentation.categoryDesign)}
        aria-label="Work categories"
        style={
          presentation.categoryDesign === 'tabs'
            ? { backgroundColor: `${presentation.cardBorderColor}55` }
            : presentation.categoryDesign === 'underline'
              ? { borderColor: presentation.cardBorderColor }
              : undefined
        }
      >
        {[
          {
            key: WORK_CATEGORY_ALL_KEY,
            label: presentation.categoryAllLabel,
            count: items.length,
          },
          ...categories,
        ].map((category) => {
          const active = category.key === activeCategory;
          const activeInk = workContrastingInk(presentation.categoryActiveColor);
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={workCategoryChipClass(presentation.categoryDesign, active)}
              style={
                active
                  ? presentation.categoryDesign === 'pills'
                    ? {
                        // Actif = accent ; encre contrastée pour rester lisible clair / sombre.
                        backgroundColor: presentation.categoryActiveColor,
                        color: activeInk,
                        borderColor: presentation.categoryActiveColor,
                      }
                    : presentation.categoryDesign === 'tabs'
                      ? {
                          backgroundColor: presentation.categoryActiveColor,
                          color: activeInk,
                        }
                      : { color: presentation.categoryActiveColor }
                  : {
                      color: presentation.categoryMutedColor,
                      borderColor: presentation.cardBorderColor,
                      backgroundColor: 'transparent',
                      ['--work-cat-hover-bg' as string]: `${presentation.categoryActiveColor}29`,
                      ['--work-cat-hover-border' as string]: presentation.categoryActiveColor,
                      ['--work-cat-hover-text' as string]: presentation.categoryActiveColor,
                    }
              }
              aria-pressed={active}
            >
              {category.label}
              <span className="ml-1.5 text-xs font-medium opacity-60">{category.count}</span>
            </button>
          );
        })}
      </nav>
      </div>
    ) : null;

  let motionIndex = 0;
  const galleryBlocks = groups.map((group) => {
    if (group.items.length === 0) return null;
    const block = (
      <WorkGalleryLayout
        key={group.key}
        items={group.items}
        presentation={presentation}
        motionProfile={motionProfile}
        startIndex={motionIndex}
        forceSingleColumn={forceSingleColumn}
      />
    );
    motionIndex += group.items.length;
    if (!showGroups || !group.label) return block;
    return (
      <div key={group.key} className="space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="text-sm font-bold uppercase tracking-[0.16em]"
            style={{ color: presentation.categoryActiveColor }}
          >
            {group.label}
          </h3>
          <span className="text-xs font-medium" style={{ color: presentation.categoryMutedColor }}>
            {group.items.length}
          </span>
        </div>
        {block}
      </div>
    );
  });

  return (
    <div className="space-y-8">
      {filterBar}
      <div className={showGroups ? 'space-y-10' : undefined}>{galleryBlocks}</div>
    </div>
  );
}

function WorkGalleryCarousel({
  items,
  presentation,
  motionProfile,
  startIndex = 0,
}: {
  items: MarketplaceContentItem[];
  presentation: PortfolioWorkPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
  startIndex?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardZoneRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
  const itemsLengthRef = useRef(items.length);
  itemsLengthRef.current = items.length;
  const itemSignature = items.map((item) => item.id).join('|');

  useEffect(() => {
    setActiveIndex(0);
  }, [itemSignature]);

  useEffect(() => {
    if (items.length === 0) return;
    setActiveIndex((current) => Math.min(current, items.length - 1));
  }, [items.length]);

  /** Hover on the card: block page scroll and map wheel to prev/next project. */
  useEffect(() => {
    const el = cardZoneRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (itemsLengthRef.current <= 1) return;

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(delta) < 6) return;

      event.preventDefault();
      event.stopPropagation();

      if (wheelLockRef.current) return;
      wheelLockRef.current = true;

      if (delta > 0) {
        setActiveIndex((current) => (current + 1) % itemsLengthRef.current);
      } else {
        setActiveIndex(
          (current) => (current - 1 + itemsLengthRef.current) % itemsLengthRef.current
        );
      }

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 450);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const carouselPresentation: PortfolioWorkPresentationSettings = {
    ...presentation,
    cardDesign:
      presentation.cardDesign === 'compact' || presentation.cardDesign === 'overlay'
        ? 'editorial'
        : presentation.cardDesign,
  };

  const canNavigate = items.length > 1;
  const safeIndex = items.length === 0 ? 0 : Math.min(activeIndex, items.length - 1);
  const activeItem = items[safeIndex] ?? null;

  /** Next projects only — max 2 peeks, large screens only (rendered below). */
  const peekItems = useMemo(() => {
    if (items.length <= 1) return [] as { item: MarketplaceContentItem; index: number }[];
    const peeks: { item: MarketplaceContentItem; index: number }[] = [];
    for (let step = 1; step < items.length && peeks.length < 2; step += 1) {
      const index = (safeIndex + step) % items.length;
      const item = items[index];
      if (!item) continue;
      peeks.push({ item, index });
    }
    return peeks;
  }, [items, safeIndex]);

  const goPrev = () => {
    if (!canNavigate) return;
    setActiveIndex((current) => (current - 1 + items.length) % items.length);
  };

  const goNext = () => {
    if (!canNavigate) return;
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const accent = presentation.ctaColor || presentation.categoryActiveColor || '#e2572e';
  const border = presentation.cardBorderColor || '#e5e5e5';
  const surface = presentation.sectionBackgroundColor || '#ffffff';

  if (!activeItem) return null;

  const navButtonClassName =
    'group flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition enabled:hover:shadow-md disabled:cursor-default disabled:opacity-35 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]';
  const navButtonStyle = {
    borderColor: border,
    backgroundColor: surface,
    color: accent,
  } as const;

  const prevButton = (placement: 'side' | 'bottom') => (
    <button
      type="button"
      onClick={goPrev}
      disabled={!canNavigate}
      aria-label="Projet précédent"
      className={`${navButtonClassName} ${
        placement === 'side'
          ? 'hidden enabled:hover:-translate-x-0.5 sm:flex'
          : 'enabled:hover:-translate-x-0.5'
      }`}
      style={navButtonStyle}
    >
      <WorkChevronIcon
        className={`rotate-90 ${placement === 'side' ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6'}`}
        style={{ color: accent }}
      />
    </button>
  );

  const nextButton = (placement: 'side' | 'bottom') => (
    <button
      type="button"
      onClick={goNext}
      disabled={!canNavigate}
      aria-label="Projet suivant"
      className={`${navButtonClassName} ${
        placement === 'side'
          ? 'hidden enabled:hover:translate-x-0.5 sm:flex'
          : 'enabled:hover:translate-x-0.5'
      }`}
      style={navButtonStyle}
    >
      <WorkChevronIcon
        className={`-rotate-90 ${placement === 'side' ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6'}`}
        style={{ color: accent }}
      />
    </button>
  );

  return (
    <div
      className="w-full outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio projects"
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goPrev();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
        }
      }}
    >
      <div className="flex w-full flex-col items-stretch">
        <div className="flex w-full items-center justify-center gap-2 sm:gap-4 lg:gap-6">
          {prevButton('side')}

          <div className="relative min-w-0 flex-1">
            <div
              ref={cardZoneRef}
              className={`mx-auto w-full overscroll-contain ${workCardMaxWidthClass(presentation.cardMaxWidth)} ${
                presentation.cardMaxWidth !== 'full'
                  ? presentation.cardAlignment === 'right'
                    ? 'ml-auto'
                    : presentation.cardAlignment === 'left'
                      ? 'mr-auto'
                      : 'mx-auto'
                  : ''
              }`.trim()}
            >
              <PortfolioMotionItem
                profile={motionProfile}
                index={startIndex}
                className="w-full min-w-0"
              >
                <div className="w-full min-w-0">
                  {items[safeIndex] ? (
                    <EditorialWorkCard
                      key={items[safeIndex].id}
                      item={items[safeIndex]}
                      presentation={carouselPresentation}
                    />
                  ) : null}
                </div>
              </PortfolioMotionItem>
            </div>
            {peekItems.length > 0 ? (
              <div
                className="mt-2.5 hidden justify-end gap-1.5 lg:flex"
                aria-label="Aperçus des autres projets"
              >
                {peekItems.map(({ item, index }) => {
                  const title = item.title?.trim() || 'Projet';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      title={title}
                      aria-label={`Afficher ${title}`}
                      className="relative h-10 w-8 shrink-0 overflow-hidden rounded-md border transition hover:opacity-100 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        borderColor: border,
                        backgroundColor: surface,
                        opacity: 0.72,
                        ['--tw-outline-color' as string]: accent,
                      }}
                    >
                      {item.mediaUrl ? (
                        <ProductThumbnailMedia
                          url={item.mediaUrl}
                          alt=""
                          fit="cover"
                          className="h-full w-full"
                        />
                      ) : (
                        <span
                          className="flex h-full w-full items-center justify-center px-0.5 text-center text-[7px] font-bold uppercase leading-none tracking-wide"
                          style={{ color: accent }}
                        >
                          {title.slice(0, 2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : null}
            {canNavigate ? (
              <div
                className="mt-3 hidden items-center justify-center gap-2 sm:flex"
                role="tablist"
                aria-label="Projets du carrousel"
              >
                {items.map((item, index) => {
                  const active = index === safeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Projet ${index + 1} sur ${items.length}`}
                      onClick={() => setActiveIndex(index)}
                      className={`rounded-full transition ${
                        active ? 'h-2 w-2 sm:h-2.5 sm:w-2.5' : 'h-1.5 w-1.5 sm:h-2 sm:w-2 opacity-45 hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: accent,
                      }}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          {nextButton('side')}
        </div>

        {/* Mobile: arrows + dots at the bottom */}
        {canNavigate ? (
          <div className="mt-4 flex items-center justify-center gap-4 sm:hidden">
            {prevButton('bottom')}
            <div
              className="flex items-center justify-center gap-2"
              role="tablist"
              aria-label="Projets du carrousel"
            >
              {items.map((item, index) => {
                const active = index === safeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Projet ${index + 1} sur ${items.length}`}
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-full transition ${
                      active ? 'h-2 w-2' : 'h-1.5 w-1.5 opacity-45 hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: accent,
                    }}
                  />
                );
              })}
            </div>
            {nextButton('bottom')}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WorkGalleryLayout({
  items,
  presentation,
  motionProfile,
  startIndex = 0,
  forceSingleColumn = false,
}: {
  items: MarketplaceContentItem[];
  presentation: PortfolioWorkPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
  startIndex?: number;
  forceSingleColumn?: boolean;
}) {
  const gapClass = workCardGapClass(presentation.cardGap);
  const itemsPerRow = forceSingleColumn
    ? 1
    : resolveWorkItemsPerRow(presentation.galleryLayout, presentation.itemsPerRow);
  const widthJustify = workCardMaxWidthJustifyClass(
    presentation.cardMaxWidth,
    presentation.cardAlignment
  );
  const widthFlexAlign = workCardMaxWidthFlexAlignClass(
    presentation.cardMaxWidth,
    presentation.cardAlignment
  );
  const multiColClass = `${workItemsPerRowGridClass(itemsPerRow, presentation.cardGap)} ${widthJustify}`.trim();

  if (presentation.galleryLayout === 'carousel') {
    return (
      <WorkGalleryCarousel
        items={items}
        presentation={presentation}
        motionProfile={motionProfile}
        startIndex={startIndex}
      />
    );
  }

  if (presentation.galleryLayout === 'list') {
    return (
      <div className={`flex flex-col ${gapClass} ${widthFlexAlign}`.trim()}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkListCard item={item} presentation={presentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'accordion') {
    return (
      <div className={`flex flex-col ${gapClass} ${widthFlexAlign}`.trim()}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkAccordionRow
              item={item}
              presentation={presentation}
              defaultOpen={startIndex + index === 0}
            />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'grid') {
    const gridPresentation: PortfolioWorkPresentationSettings = {
      ...presentation,
      cardDesign: 'compact',
    };
    const gridClass =
      `${workItemsPerRowGridClass(itemsPerRow, workCompactGalleryGap(presentation.cardGap))} ${widthJustify}`.trim();
    return (
      <div className={gridClass}>
        {items.map((item, index) => (
          <PortfolioMotionItem
            key={item.id}
            profile={motionProfile}
            index={startIndex + index}
            className="h-full min-w-0"
          >
            <EditorialWorkCard item={item} presentation={gridPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'overlay') {
    const overlayPresentation: PortfolioWorkPresentationSettings = {
      ...presentation,
      cardDesign: 'overlay',
      // Keep Media placement (top/bottom) — overlay chrome is always stacked.
    };
    return (
      <div className={multiColClass}>
        {items.map((item, index) => (
          <PortfolioMotionItem
            key={item.id}
            profile={motionProfile}
            index={startIndex + index}
            className="h-full min-w-0"
          >
            <EditorialWorkCard item={item} presentation={overlayPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  // stack — Grille portfolio: roomy editorial cards (never compact tile density).
  // Multi-column: side-by-side media|copy squeezes — fall back to stacked top/bottom only.
  const stackPresentation: PortfolioWorkPresentationSettings = {
    ...presentation,
    cardDesign:
      presentation.cardDesign === 'compact' || presentation.cardDesign === 'overlay'
        ? 'editorial'
        : presentation.cardDesign,
    ...(itemsPerRow > 1 &&
    (presentation.contentPlacement === 'side' ||
      presentation.contentPlacement === 'side-reverse')
      ? { contentPlacement: 'bottom' as const }
      : null),
  };

  if (itemsPerRow <= 1) {
    return (
      <div className={`flex flex-col ${gapClass} ${widthFlexAlign}`.trim()}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkCard item={item} presentation={stackPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  return (
    <div className={multiColClass}>
      {items.map((item, index) => (
        <PortfolioMotionItem
          key={item.id}
          profile={motionProfile}
          index={startIndex + index}
          className="h-full min-w-0"
        >
          <EditorialWorkCard item={item} presentation={stackPresentation} />
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function EditorialWorkToolsList({
  tools,
  className = '',
  textStyle,
  accentColor,
}: {
  tools: string[];
  className?: string;
  textStyle?: PortfolioElementTextStyle;
  accentColor?: string;
}) {
  if (tools.length === 0) return null;
  const accent = accentColor || '#ea580c';

  return (
    <ul className={`space-y-3 ${className}`.trim()}>
      {tools.map((tool) => (
        <li
          key={tool}
          className={`flex items-start gap-3.5 leading-relaxed ${
            textStyle ? elementTextStyleClass(textStyle, 'body') : 'text-base font-medium text-neutral-700 sm:text-lg dark:text-neutral-200'
          }`}
          style={textStyle ? elementTextInlineStyle(textStyle) : undefined}
        >
          <span
            className="relative mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center"
            aria-hidden
          >
            <span
              className="absolute inset-0 rounded-full border-2 opacity-90"
              style={{ borderColor: accent }}
            />
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: accent,
                boxShadow: `0 0 0 2px ${accent}26`,
              }}
            />
          </span>
          <span>{tool}</span>
        </li>
      ))}
    </ul>
  );
}

type EditorialMarqueeCardTone = 'light' | 'muted';

/** Resolve skill/service card text colors against the painted surface (not only the token). */
function servicesCardReadableText(
  presentation: PortfolioServicesPresentationSettings,
  tone: EditorialMarqueeCardTone,
  preferredStrong: string,
  preferredMuted: string,
  surfaceHexOverride?: string
) {
  return servicesReadableCardInk(
    presentation,
    tone,
    preferredStrong,
    preferredMuted,
    surfaceHexOverride
  );
}

/** Order / Commander / GET CTA — Contact → tel → footer (plain <a>, not next/link). */
type ServicesOrderCtaNav = {
  href: string;
  onNavigate?: (href: string) => void;
};

const ServicesOrderCtaHrefContext = createContext<ServicesOrderCtaNav>({ href: '#contact' });

export function ServicesOrderCtaHrefProvider({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate?: (href: string) => void;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ href: href || '#contact', onNavigate }),
    [href, onNavigate]
  );
  return (
    <ServicesOrderCtaHrefContext.Provider value={value}>
      {children}
    </ServicesOrderCtaHrefContext.Provider>
  );
}

function useServicesOrderCtaNav(): ServicesOrderCtaNav {
  const value = useContext(ServicesOrderCtaHrefContext);
  return value.href ? value : { href: '#contact', onNavigate: value.onNavigate };
}

function handleServicesOrderCtaClick(
  event: ReactMouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: (href: string) => void
) {
  if (href.startsWith('tel:') || href.startsWith('mailto:') || /^https?:/i.test(href)) {
    return;
  }
  if (onNavigate) {
    event.preventDefault();
    onNavigate(href);
    return;
  }
  if (href.startsWith('#')) {
    event.preventDefault();
    const id = href.slice(1);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function ServicesOrderCtaLink({
  className,
  style,
  ariaLabel,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const { href, onNavigate } = useServicesOrderCtaNav();
  return (
    <a
      href={href}
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={(event) => handleServicesOrderCtaClick(event, href, onNavigate)}
    >
      {children}
    </a>
  );
}

const SERVICES_CUSTOM_QUOTE_LABEL = 'Custom quote';
const SERVICES_CUSTOM_QUOTE_CTA_LABEL = 'Discuss';

function ServiceOrderCta({
  presentation,
  className = '',
  fullWidth,
  labelOverride,
}: {
  presentation: PortfolioServicesPresentationSettings;
  className?: string;
  /**
   * Stretch CTA across the card. Compact left only for Carte horizontal;
   * Offre / Tarif and other layouts use full-width by default.
   */
  fullWidth?: boolean;
  /** When set, replaces the presentation CTA label (e.g. Discuss for custom quote). */
  labelOverride?: string;
}) {
  if (presentation.showServiceCta === false) return null;
  const layout = presentation.servicesGalleryLayout;
  // Liste commerciale + Offre / Tarif + Plan: filled CTA by default.
  const design =
    layout === 'commercial-list' ||
    layout === 'tier' ||
    layout === 'plan' ||
    layout === 'plan-split' ||
    layout === 'media-banner' ||
    layout === 'media-checklist'
      ? 'pill-accent'
      : (presentation.ctaDesign ?? 'pill-accent');
  const workCta = servicesCtaWorkPresentation(presentation);
  const label = labelOverride?.trim() || presentation.ctaLabel?.trim() || 'Get started';
  const stretch = fullWidth ?? layout !== 'card';
  const align = stretch ? 'justify-stretch' : servicesCtaAlignClass('left');
  const ctaPresentation = {
    ...workCta,
    ctaDesign: design,
  };

  return (
    <div className={`flex w-full min-w-0 ${align} ${className}`.trim()}>
      <ServicesOrderCtaLink
        className={`${workCtaClassName(design, workCta)} ${
          stretch
            ? 'w-full flex-nowrap items-center justify-center whitespace-nowrap'
            : 'shrink-0'
        }`.trim()}
        style={workCtaStyle(design, workCta)}
      >
        <WorkCtaLabelAndIcon
          presentation={ctaPresentation}
          label={label}
          nowrap={stretch || layout === 'commercial-list'}
        />
      </ServicesOrderCtaLink>
    </div>
  );
}

function ServicesCustomQuoteLabel({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      className={`w-auto text-left text-[0.8125rem] font-bold leading-snug tracking-[-0.01em] ${className}`.trim()}
      style={{ fontWeight: 700, ...style }}
    >
      {SERVICES_CUSTOM_QUOTE_LABEL}
    </p>
  );
}

/** Prefer principal-surface ink when active so quote/delivery labels stay readable. */
function servicesPrincipalAwareColorStyle(
  presentation: PortfolioServicesPresentationSettings,
  cardIndex: number,
  baseColor: string | undefined,
  kind: 'ink' | 'muted' = 'ink'
): CSSProperties {
  const surface = servicesPrincipalSurfaceInkColors(presentation, cardIndex);
  if (!surface.active) {
    return baseColor ? { color: baseColor } : {};
  }
  return { color: kind === 'ink' ? surface.ink : surface.muted };
}

function EditorialServiceSelector({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const selectorId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeServiceId = useMemo(() => {
    if (selectedServiceId && services.some((service) => service.id === selectedServiceId)) {
      return selectedServiceId;
    }
    return services[0]?.id ?? '';
  }, [selectedServiceId, services]);
  const activeService = services.find((service) => service.id === activeServiceId);

  if (!activeService) return null;

  const activeServiceIndex = services.indexOf(activeService);
  const tasks = resolveServiceTasks(activeService);
  const { hasPrice, isFree, amount } = resolveServicePrice(activeService);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const colorMode =
    presentation.useHeroPalette === false && presentation.activeColorMode !== 'light'
      ? 'dark'
      : 'light';
  const accent = presentation.cardAccentColor?.trim() || DEFAULT_SERVICES_ACCENT_COLOR;
  const border = presentation.cardBorderColor?.trim() || DEFAULT_SERVICES_CARD_BORDER_COLOR;
  const surface =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? presentation.cardBackgroundColorDark
      : presentation.cardBackgroundColor;
  const titleStyle = elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = elementTextInlineStyle(elementStyles.tasks, colorMode);
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const currencyPlacement = resolveServiceCurrencyPlacement(
    presentation.serviceCurrencyPlacement
  );
  const pricePrefix = resolveServicePricePrefix(presentation);
  /** Active tab ink: the accent fill needs a contrasting label. */
  const activeTabInk = servicesColorLuminance(accent) > 0.55 ? '#0b0b0d' : '#ffffff';

  const showPrice = presentation.showServicePrice !== false && hasPrice && Boolean(amount);
  const showCustomQuote = presentation.showServicePrice !== false && !hasPrice;
  const description = activeService.description?.trim() ?? '';
  const showDescription = presentation.showServiceDescription !== false && Boolean(description);
  const showTasks = presentation.showServiceTasks !== false && tasks.length > 0;
  const showCta = presentation.showServiceCta !== false;
  const showDivider = showDescription && (showTasks || showCta);

  const activateTabAt = (index: number) => {
    const target = services[(index + services.length) % services.length];
    if (!target) return;
    setSelectedServiceId(target.id);
    tabRefs.current[services.indexOf(target)]?.focus();
  };

  const onTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        activateTabAt(index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        activateTabAt(index - 1);
        break;
      case 'Home':
        activateTabAt(0);
        break;
      case 'End':
        activateTabAt(services.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div
      className="group mx-auto w-full max-w-6xl min-w-0"
      style={servicesCardPrincipalStyle(presentation)}
    >
      <div className="grid w-full min-w-0 gap-5 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,1.35fr)] lg:gap-7">
        <div className="flex min-w-0 flex-col">
          <div
            role="tablist"
            aria-label="Services"
            aria-orientation="vertical"
            className="flex min-w-0 flex-col gap-3"
          >
            {services.map((service, index) => {
              const active = service.id === activeService.id;
              const idleFill = surface
                ? surface
                : `color-mix(in srgb, ${border} 32%, transparent)`;
              return (
                <button
                  key={service.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  id={`${selectorId}-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${selectorId}-panel`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setSelectedServiceId(service.id)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                  className="flex min-h-[3.65rem] w-full items-center justify-between gap-4 rounded-xl border px-5 py-3.5 text-left text-base font-bold leading-snug transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{
                    borderColor: active ? accent : border,
                    backgroundColor: active ? accent : idleFill,
                    color: active ? activeTabInk : titleStyle.color,
                    '--tw-ring-color': accent,
                  } as CSSProperties}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="min-w-0 truncate">{service.title}</span>
                  </span>
                  <span aria-hidden className="shrink-0 text-base font-medium">
                    →
                  </span>
                </button>
              );
            })}
          </div>
          <p
            className="mt-4 text-center text-[9px] font-medium uppercase tracking-[0.16em]"
            style={{ color: bodyStyle.color }}
          >
            Select a service
          </p>
        </div>

        <article
          id={`${selectorId}-panel`}
          role="tabpanel"
          aria-labelledby={`${selectorId}-tab-${activeServiceIndex}`}
          tabIndex={0}
          className="flex min-h-[23rem] min-w-0 flex-col rounded-2xl border p-5 focus-visible:outline-none sm:p-8"
          style={{
            borderColor: border,
            backgroundColor: presentation.cardBackgroundEnabled === false ? 'transparent' : surface,
          }}
        >
          <div className="flex min-w-0 items-start justify-between gap-6">
            <div className="min-w-0 flex-1 basis-0">
              {presentation.showServiceTitle !== false ? (
                <h3
                  className={`break-words text-xl font-extrabold leading-tight tracking-[-0.02em] sm:text-2xl ${SERVICES_CARD_TITLE_HOVER_CLASS} ${elementTextStyleClass(
                    elementStyles.cardTitle,
                    'title'
                  )}`}
                  style={titleStyle}
                >
                  {activeService.title}
                </h3>
              ) : null}
            </div>

            {showPrice && amount ? (
              <p
                className={`shrink-0 whitespace-nowrap text-right text-xl font-bold tabular-nums leading-none sm:text-2xl ${elementTextStyleClass(
                  elementStyles.price,
                  'title'
                )}`}
                style={priceStyle}
              >
                <ServicePriceAmount
                  amount={amount}
                  currencySymbol={currencySymbol}
                  pricePrefix={pricePrefix}
                  currencyPlacement={currencyPlacement}
                  isFree={isFree}
                />
              </p>
            ) : showCustomQuote ? (
              <ServicesCustomQuoteLabel
                className="shrink-0 whitespace-nowrap text-right"
                style={{ color: priceStyle.color, textAlign: 'right' }}
              />
            ) : null}
          </div>

          {showDescription ? (
            <p
              className={`mt-4 max-w-3xl text-sm leading-6 ${elementTextStyleClass(
                elementStyles.cardBody,
                'body'
              )}`}
              style={bodyStyle}
            >
              {description}
            </p>
          ) : null}

          {showDivider ? (
            <div className="my-6 border-t" style={{ borderColor: border }} />
          ) : null}

          {showTasks ? (
            <div className={`min-w-0 ${showDivider || showDescription ? '' : 'mt-6'}`.trim()}>
              <ServicesTaskList
                tasks={tasks}
                presentation={presentation}
                listClassName="grid gap-x-8 gap-y-4 sm:grid-cols-2"
                textStyle={tasksStyle}
                bulletColorOverride={
                  typeof tasksStyle.color === 'string' && tasksStyle.color.trim()
                    ? tasksStyle.color
                    : undefined
                }
              />
            </div>
          ) : null}

          {showCta ? (
            <div className="mt-auto flex w-full flex-col items-stretch gap-2 pt-8">
              <ServiceOrderCta
                presentation={{
                  ...presentation,
                  ctaDesign: 'pill-accent',
                }}
                fullWidth
                labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
              />
            </div>
          ) : null}
        </article>
      </div>
    </div>
  );
}

function EditorialServiceAccordion({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const [openServiceId, setOpenServiceId] = useState<string | null>(
    () => services[0]?.id ?? null
  );
  const accordionId = useId();
  /** Resolve open id against current list so remove/reorder stays visually consistent. */
  const resolvedOpenServiceId = useMemo(() => {
    if (openServiceId === null) return null;
    if (services.some((service) => service.id === openServiceId)) return openServiceId;
    return services[0]?.id ?? null;
  }, [openServiceId, services]);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const colorMode =
    presentation.useHeroPalette === false && presentation.activeColorMode !== 'light'
      ? 'dark'
      : 'light';
  const accent = presentation.cardAccentColor?.trim() || DEFAULT_SERVICES_ACCENT_COLOR;
  const border = presentation.cardBorderColor?.trim() || DEFAULT_SERVICES_CARD_BORDER_COLOR;
  const titleStyle = elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = elementTextInlineStyle(elementStyles.tasks, colorMode);
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const currencyPlacement = resolveServiceCurrencyPlacement(
    presentation.serviceCurrencyPlacement
  );
  const pricePrefix = resolveServicePricePrefix(presentation);
  const periodSuffix = presentation.servicePricePeriodSuffix?.trim() || '';
  const frameClass = servicesCardFrameClass(presentation);
  const fillAttrs = servicesCardFillDataAttrs(presentation);

  const toggleService = (serviceId: string) => {
    setOpenServiceId((current) => {
      const effective =
        current === null
          ? null
          : services.some((service) => service.id === current)
            ? current
            : services[0]?.id ?? null;
      return effective === serviceId ? null : serviceId;
    });
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {services.map((service, index) => {
        const open = service.id === resolvedOpenServiceId;
        const panelId = `${accordionId}-panel-${index}`;
        const headerId = `${accordionId}-header-${index}`;
        const tasks = resolveServiceTasks(service);
        const { hasPrice, isFree, amount } = resolveServicePrice(service);
        const description = service.description?.trim() ?? '';
        const showPrice =
          presentation.showServicePrice !== false && hasPrice && Boolean(amount);
        const showDescription =
          presentation.showServiceDescription !== false && Boolean(description);
        const showTasks = presentation.showServiceTasks !== false && tasks.length > 0;
        const showCta = presentation.showServiceCta !== false;
        const hasExpandedContent = showDescription || showTasks || showCta;
        const tone = resolveServicesCardTone(
          index,
          presentation.cardBackgroundAlternation,
          1
        );
        const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);

        return (
          <article
            key={service.id}
            className={`relative w-full min-w-0 overflow-hidden ${frameClass}`}
            style={{ ...surfaceStyle, padding: 0 }}
            {...fillAttrs}
          >
            <ServicesCardBackgroundLayers presentation={presentation} cardIndex={index} />
            <ServicesCardForeground>
              <h3 className="min-w-0">
                <button
                  id={headerId}
                  type="button"
                  aria-expanded={hasExpandedContent ? open : false}
                  aria-controls={hasExpandedContent ? panelId : undefined}
                  onClick={() => {
                    if (!hasExpandedContent) return;
                    toggleService(service.id);
                  }}
                  className="grid min-h-[4.25rem] w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-4 text-left transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset sm:gap-4 sm:px-5"
                  style={{ '--tw-ring-color': accent } as CSSProperties}
                >
                  <span
                    className={`min-w-0 truncate text-sm font-extrabold sm:text-base ${elementTextStyleClass(
                      elementStyles.cardTitle,
                      'title'
                    )}`}
                    style={titleStyle}
                  >
                    {service.title}
                  </span>
                  {showPrice && amount ? (
                    <span
                      className={`shrink-0 whitespace-nowrap text-sm font-extrabold tabular-nums sm:text-base ${elementTextStyleClass(
                        elementStyles.price,
                        'title'
                      )}`}
                      style={priceStyle}
                    >
                      <ServicePriceAmount
                        amount={amount}
                        currencySymbol={currencySymbol}
                        pricePrefix={pricePrefix}
                        currencyPlacement={currencyPlacement}
                isFree={isFree}
              />
                      {periodSuffix ? <span className="ml-1">{periodSuffix}</span> : null}
                    </span>
                  ) : null}
                  {hasExpandedContent ? (
                    <span
                      aria-hidden
                      className="ml-1 shrink-0 text-xs leading-none opacity-60"
                      style={{ color: bodyStyle.color }}
                    >
                      {open ? '▲' : '▼'}
                    </span>
                  ) : (
                    <span className="ml-1 w-3 shrink-0" aria-hidden />
                  )}
                </button>
              </h3>

              {hasExpandedContent ? (
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  hidden={!open}
                  className="border-t px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6"
                  style={{ borderColor: border }}
                >
                  {showDescription ? (
                    <p
                      className={`max-w-4xl text-sm leading-6 sm:text-[15px] ${elementTextStyleClass(
                        elementStyles.cardBody,
                        'body'
                      )}`}
                      style={bodyStyle}
                    >
                      {description}
                    </p>
                  ) : null}

                  {showTasks ? (
                    <ServicesTaskList
                      tasks={tasks}
                      presentation={presentation}
                      listClassName={`flex flex-wrap gap-x-5 gap-y-3 ${
                        showDescription ? 'mt-5' : ''
                      }`}
                      textStyle={tasksStyle}
                      textClassName="text-xs sm:text-sm"
                    />
                  ) : null}

                  {showCta ? (
                    <div
                      className={`flex w-full flex-col items-stretch gap-2 ${
                        showDescription || showTasks ? 'mt-6' : ''
                      }`}
                    >
                      {presentation.showServicePrice !== false && !hasPrice ? (
                        <ServicesCustomQuoteLabel
                          style={{ color: priceStyle.color, textAlign: 'left' }}
                        />
                      ) : null}
                      <ServiceOrderCta
                        presentation={presentation}
                        labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </ServicesCardForeground>
          </article>
        );
      })}
    </div>
  );
}

export function EditorialServiceCard({
  service,
  tone = 'light',
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
}: {
  service: ProfileServiceItem;
  tone?: EditorialMarqueeCardTone;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
}) {
  const { hasPrice, isFree, amount: priceAmount } = resolveServicePrice(service);
  const serviceTasks = resolveServiceTasks(service);
  const shellClass = servicesCardShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const pricePlacement = presentation.servicesPricePlacement;
  const minHeightClass = servicesServiceCardMinHeight(presentation.cardDesign);
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const deliveryColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.delivery.colorDark || elementStyles.delivery.color
      : elementStyles.delivery.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const cardInk = servicesCardReadableText(presentation, tone, titleColor, bodyColor);
  const priceInk = servicesCardReadableText(presentation, tone, priceColor, deliveryColor);
  // Trust painted element hex unless A/B ink pairs are explicitly enabled.
  const cardTitleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const cardBodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const deliveryStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.delivery, colorMode), color: priceInk.muted }
    : elementTextInlineStyle(elementStyles.delivery, colorMode);

  const accent = presentation.cardAccentColor?.trim() || DEFAULT_SERVICES_ACCENT_COLOR;
  const cardBorder = presentation.cardBorderColor?.trim() || DEFAULT_SERVICES_CARD_BORDER_COLOR;
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceAlignClass = servicePriceAlignClass(presentation.servicePriceAlign);
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const tasksInk = servicesCardReadableText(presentation, tone, tasksColor, tasksColor);
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);
  const showTasks = presentation.showServiceTasks !== false && serviceTasks.length > 0;
  const surfaceInk = servicesPrincipalSurfaceInkColors(presentation, cardIndex);
  const deliveryNode =
    presentation.showServiceDelivery && deliveryLabel ? (
      <div
        className={servicesElementChromeClass(chromes.delivery)}
        style={servicesElementChromeStyle(chromes.delivery, accent)}
      >
        <p
          className={`inline-flex max-w-full shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 sm:px-3 ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
          style={{
            ...deliveryStyle,
            ...(surfaceInk.active
              ? {
                  color: surfaceInk.ink,
                  borderColor: `color-mix(in srgb, ${surfaceInk.ink} 55%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${surfaceInk.ink} 12%, transparent)`,
                }
              : {
                  borderColor: cardBorder,
                  backgroundColor: 'color-mix(in srgb, currentColor 6%, transparent)',
                }),
          }}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: surfaceInk.active ? surfaceInk.ink : accent }}
            aria-hidden
          />
          <span className="min-w-0 break-words">Delivery · {deliveryLabel}</span>
        </p>
      </div>
    ) : null;
  const isCustomQuote = !hasPrice;
  const showNumericPrice =
    presentation.showServicePrice !== false && hasPrice && Boolean(priceAmount);
  const showCustomQuoteLabel = presentation.showServicePrice !== false && isCustomQuote;
  const priceBlock = showNumericPrice ? (
    <div
      className={`w-full shrink-0 ${pricePlacement === 'top' ? '' : 'mt-auto'} ${priceAlignClass} ${servicesElementChromeClass(chromes.price)}`}
      style={{
        ...servicesElementChromeStyle(chromes.price, accent),
        ...priceMargins,
        ...(usePairAbInk ? { color: priceInk.strong } : priceStyle),
        ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
      }}
    >
      <p
        className={`min-w-0 shrink font-bold leading-none break-words ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'title')}`}
        style={{
          ...priceStyle,
          ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
        }}
      >
        <ServicePriceAmount
          amount={priceAmount!}
          currencySymbol={currencySymbol}
          pricePrefix={pricePrefix}
          currencyPlacement={currencyPlacement}
          isFree={isFree}
        />
      </p>
    </div>
  ) : null;
  const customQuoteLabel = showCustomQuoteLabel ? (
    <ServicesCustomQuoteLabel
      className={`${servicesPrincipalMutedClass(presentation, cardIndex)} ${servicesElementChromeClass(chromes.price)}`.trim()}
      style={{
        ...servicesElementChromeStyle(chromes.price, accent),
        color: surfaceInk.active
          ? surfaceInk.muted
          : usePairAbInk
            ? priceInk.muted
            : priceStyle.color,
      }}
    />
  ) : null;

  const isHorizontalCard = presentation.servicesGalleryLayout === 'card';
  const taskBulletColor = surfaceInk.active ? surfaceInk.ink : undefined;

  const card = (
    <article
      className={`group ${shellClass} ${frameClass} ${minHeightClass} ${servicesPrincipalCardClass(presentation, cardIndex)} flex h-full w-full flex-col ${align.container}`}
      style={servicesPrincipalHoverStyle(presentation, surfaceStyle, tone)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
      {pricePlacement === 'top' ? priceBlock : null}

      {/* Title + description — full description always visible; tasks stretch for vertical alignment. */}
      <div className="w-full shrink-0">
        {presentation.showServiceTitle ? (
          <div
            className={servicesElementChromeClass(chromes.cardTitle)}
            style={servicesElementChromeStyle(chromes.cardTitle, accent)}
          >
            <h3
              className={`leading-tight tracking-[-0.02em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardTitle, 'title')} ${align.text}`}
              style={{
                ...cardTitleStyle,
                ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
              }}
            >
              {service.title}
            </h3>
          </div>
        ) : null}

        {presentation.showServiceDescription !== false && service.description?.trim() ? (
          <div
            className={`mt-4 ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
            style={servicesElementChromeStyle(chromes.cardBody, accent)}
          >
            <p
              className={`leading-relaxed ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardBody, 'body')} ${align.text}`}
              style={{
                ...cardBodyStyle,
                ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
              }}
            >
              {service.description.trim()}
            </p>
          </div>
        ) : null}
      </div>

      {showTasks ? (
        <div
          className={`w-full min-h-0 flex-1 ${servicesElementChromeClass(chromes.tasks)}`.trim()}
          style={servicesElementChromeStyle(chromes.tasks, accent)}
        >
          <ServicesTaskList
            tasks={serviceTasks}
            presentation={presentation}
            alignClass={align.container}
            itemJustifyClass={
              presentation.servicesContentAlignment === 'center'
                ? 'justify-center'
                : presentation.servicesContentAlignment === 'right'
                  ? 'justify-end'
                  : ''
            }
            textClassName={`${align.text} ${servicesPrincipalInkClass(presentation, cardIndex)}`.trim()}
            textStyle={{
              ...tasksStyle,
              ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
            }}
            bulletClassName={servicesPrincipalBulletClass(presentation, cardIndex)}
            bulletColorOverride={taskBulletColor}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}

      {pricePlacement !== 'top' ? priceBlock : null}
      {presentation.showServiceCta !== false || deliveryNode || customQuoteLabel ? (
        <div
          className={`mt-auto flex w-full flex-col items-stretch gap-2 ${
            pricePlacement !== 'top' && !priceBlock ? '' : ''
          } ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`.trim()}
        >
          {customQuoteLabel}
          <div className="flex w-full items-end justify-between gap-3">
            <div className="min-w-0 shrink-0">
              <ServiceOrderCta
                presentation={presentation}
                labelOverride={isCustomQuote ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
              />
            </div>
            {deliveryNode ? <div className="shrink-0 self-end">{deliveryNode}</div> : null}
          </div>
        </div>
      ) : null}
      </ServicesCardForeground>
    </article>
  );

  if (!isHorizontalCard) return card;

  return (
    <div className="pf-services-card-float-host h-full w-full min-w-0">
      {card}
    </div>
  );
}

function resolveServicesListAccentColor(
  presentation: PortfolioServicesPresentationSettings
): string {
  const workCta = servicesCtaWorkPresentation(presentation);
  const candidates = [
    workCta.ctaColor,
    presentation.cardAccentColor,
    presentation.titleColor,
    DEFAULT_SERVICES_ACCENT_COLOR,
  ];
  for (const raw of candidates) {
    const hex = typeof raw === 'string' ? raw.trim() : '';
    if (!hex || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex)) continue;
    // Skip near-white / pastel fills that vanish on light cards.
    if (servicesColorLuminance(hex) < 0.62) return hex;
  }
  return DEFAULT_SERVICES_ACCENT_COLOR;
}

function EditorialServiceListRow({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const shellClass = servicesListRowShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const pricePlacement = presentation.servicesPricePlacement;
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  // Liste / menu: description under delivery is always part of this design.
  const showDescription = true;
  const showDelivery = presentation.showServiceDelivery !== false;
  const showCta = presentation.showServiceCta !== false;
  const showPrice = presentation.showServicePrice;
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const priceStyle = servicePriceTextStyle(elementTextInlineStyle(elementStyles.price));
  const bodyStyle = elementTextInlineStyle(elementStyles.cardBody);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const accent = resolveServicesListAccentColor(presentation);
  const onAccent = servicesColorLuminance(accent) < 0.55 ? '#ffffff' : '#0a0a0a';
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceAlignClass = servicePriceAlignClass(presentation.servicePriceAlign);
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const surfaceInk = servicesPrincipalSurfaceInkColors(presentation, cardIndex);
  const ctaLabel = presentation.ctaLabel?.trim() || 'Get started';
  const isCustomQuote = !hasPrice;
  const resolvedCtaLabel = isCustomQuote ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : ctaLabel;
  const priceAboveTitle = pricePlacement === 'top';
  const descriptionText = service.description?.trim() || '';

  const titleBlock = presentation.showServiceTitle ? (
    <div
      className={`pf-services-list-ink shrink-0 ${servicesElementChromeClass(chromes.cardTitle)}`}
      style={servicesElementChromeStyle(chromes.cardTitle, accent)}
    >
      <h3
        className={`break-words [overflow-wrap:anywhere] leading-tight tracking-[-0.025em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
        style={{
          ...elementTextInlineStyle(elementStyles.cardTitle),
          ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
        }}
      >
        {service.title}
      </h3>
    </div>
  ) : null;

  /** Reserved price row so delivery stays on one horizontal band. */
  const priceBlock = showPrice ? (
    <div
      className={`pf-services-list-ink shrink-0 ${priceAlignClass} ${servicesElementChromeClass(chromes.price)}`}
      style={{
        ...servicesElementChromeStyle(chromes.price, accent),
        ...priceMargins,
      }}
    >
      {hasPrice && amount ? (
        <p
          className={`flex min-h-[2rem] min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 break-words ${servicesPrincipalInkClass(presentation, cardIndex)}`}
          style={{
            ...priceStyle,
            ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
          }}
        >
          {!isFree && pricePrefix ? (
            <span className={`pf-services-list-prefix text-sm font-bold leading-none ${servicesPrincipalMutedClass(presentation, cardIndex)}`}>
              {pricePrefix}
            </span>
          ) : null}
          <span
            className={`text-[1.65rem] font-bold leading-none tracking-[-0.04em] sm:text-[1.85rem] ${elementTextStyleClass(elementStyles.price, 'title')}`}
            style={{ fontWeight: 700 }}
          >
            {isFree ? (
              amount
            ) : (
              <>
                {currencyPlacement === 'before' ? (
                  <span className="mr-0.5 text-[0.85em] font-bold">{currencySymbol}</span>
                ) : null}
                {amount}
                {currencyPlacement === 'after' ? (
                  <span className="ml-1 text-[0.85em] font-bold">{currencySymbol}</span>
                ) : null}
              </>
            )}
          </span>
        </p>
      ) : (
        <p
          className={`flex min-h-[2rem] items-center text-[0.8125rem] font-medium leading-snug tracking-[-0.01em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'label')}`}
          style={{
            ...priceStyle,
            ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
          }}
        >
          {SERVICES_CUSTOM_QUOTE_LABEL}
        </p>
      )}
    </div>
  ) : (
    <div className="min-h-[2rem] shrink-0" aria-hidden />
  );

  const deliveryBlock = showDelivery ? (
    <div
      className={`flex min-h-[1.75rem] shrink-0 items-center ${servicesElementChromeClass(chromes.delivery)}`}
      style={servicesElementChromeStyle(chromes.delivery, accent)}
    >
      {deliveryLabel ? (
        <span
          className={`pf-services-list-delivery inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
          style={{
            ...elementTextInlineStyle(elementStyles.delivery),
            ...(surfaceInk.active
              ? {
                  color: surfaceInk.ink,
                  borderColor: `color-mix(in srgb, ${surfaceInk.ink} 55%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${surfaceInk.ink} 12%, transparent)`,
                }
              : null),
          }}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: surfaceInk.active ? surfaceInk.ink : accent }}
            aria-hidden
          />
          <span className="min-w-0 truncate tracking-[0.12em] uppercase">
            Delivery · {deliveryLabel}
          </span>
        </span>
      ) : null}
    </div>
  ) : null;

  /* Full description — no clamp; cards grow vertically so text stays visible. */
  const descriptionBlock = showDescription && descriptionText ? (
    <div
      className={`pf-services-list-muted shrink-0 ${servicesElementChromeClass(chromes.cardBody)}`}
      style={servicesElementChromeStyle(chromes.cardBody, accent)}
    >
      <p
        className={`leading-relaxed ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
        style={{
          ...bodyStyle,
          ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
        }}
      >
        {descriptionText}
      </p>
    </div>
  ) : null;

  const metaStack = (
    <div className={`flex flex-col gap-2.5 ${align.text}`}>
      {priceBlock}
      {deliveryBlock}
      {descriptionBlock}
    </div>
  );

  return (
    <article
      className={`pf-services-list-card group flex h-full w-full flex-col ${shellClass} ${frameClass} ${servicesPrincipalCardClass(presentation, cardIndex)} ${align.container}`}
      style={
        {
          ...servicesPrincipalHoverStyle(presentation, surfaceStyle, tone),
          ['--pf-services-list-accent' as string]: accent,
        } as CSSProperties
      }
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex h-full flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
        <div className={`mb-1 flex w-full items-center gap-3 ${align.row}`}>
          <div className={`pf-services-list-icon shrink-0 ${servicesPrincipalInkClass(presentation, cardIndex)}`} aria-hidden>
            <ServiceBriefIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
        </div>

        {/* title → price → delivery (aligned) → description */}
        <div className={`flex min-w-0 flex-1 flex-col ${align.text}`}>
          {priceAboveTitle ? (
            <>
              <div className="mb-4">{metaStack}</div>
              {titleBlock}
            </>
          ) : (
            <>
              {titleBlock}
              <div className="mt-5">{metaStack}</div>
            </>
          )}
        </div>

        {showCta ? (
          <div className={`mt-auto flex w-full pt-4 sm:pt-5 ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`}>
            <ServicesOrderCtaLink
              className="pf-services-list-cta group/cta inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-sm font-medium tracking-wide shadow-sm transition-[background-color,color,border-color,box-shadow] duration-300 ease-out"
              style={{
                color: onAccent,
                backgroundColor: accent,
                border: `1px solid ${accent}`,
              }}
              ariaLabel={resolvedCtaLabel}
            >
              <span className="leading-none">{resolvedCtaLabel}</span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 transition duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                aria-hidden
              />
            </ServicesOrderCtaLink>
          </div>
        ) : null}
      </ServicesCardForeground>
    </article>
  );
}

/**
 * Commercial list — full-width numbered offer row:
 * service story and inclusions → prominent price → conversion action.
 */
function EditorialServiceCommercialRow({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const tasks = resolveServiceTasks(service);
  const shellClass = servicesListRowShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const accent = presentation.cardAccentColor?.trim() || DEFAULT_SERVICES_ACCENT_COLOR;
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceMargins = servicePriceBoxStyle(presentation);
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const periodSuffix = presentation.servicePricePeriodSuffix?.trim() || '';
  const colorMode =
    presentation.useHeroPalette === false && presentation.activeColorMode !== 'light'
      ? 'dark'
      : 'light';
  const titleStyle = elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const tasksStyle = elementTextInlineStyle(elementStyles.tasks, colorMode);
  const priceStyle = servicePriceTextStyle(
    elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const deliveryStyle = elementTextInlineStyle(elementStyles.delivery, colorMode);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const columnGap = presentation.commercialColumnGapPx ?? 48;
  const priceWidth = presentation.commercialPriceWidthPx ?? 200;
  const ctaWidth = presentation.commercialCtaWidthPx ?? 210;

  return (
    <article
      className={`group relative w-full overflow-hidden ${shellClass} ${frameClass} ${servicesPrincipalCardClass(presentation, cardIndex)}`}
      style={servicesPrincipalHoverStyle(presentation, surfaceStyle, tone)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className="relative grid min-w-0 grid-cols-1 gap-y-6 lg:grid-cols-[minmax(0,1fr)_var(--commercial-price-width)_var(--commercial-cta-width)] lg:items-center"
        style={{
          columnGap: `${columnGap}px`,
          ['--commercial-price-width' as string]: `${priceWidth}px`,
          ['--commercial-cta-width' as string]: `${ctaWidth}px`,
        }}
      >
        <div
          className={`min-w-0 flex flex-col ${contentGap.className}`.trim()}
          style={contentGap.style}
        >
          {presentation.showServiceTitle ? (
            <div
              className={servicesElementChromeClass(chromes.cardTitle)}
              style={servicesElementChromeStyle(chromes.cardTitle, accent)}
            >
              <h3
                className={`leading-tight tracking-[-0.025em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
                style={titleStyle}
              >
                {service.title}
              </h3>
            </div>
          ) : null}

          {presentation.showServiceDescription && service.description?.trim() ? (
            <div
              className={`min-w-0 w-full ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
              style={servicesElementChromeStyle(chromes.cardBody, accent)}
            >
              <p
                className={`leading-relaxed ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
                style={bodyStyle}
              >
                {service.description}
              </p>
            </div>
          ) : null}

          {presentation.showServiceTasks !== false && tasks.length > 0 ? (
            <div
              className={`min-w-0 w-full pr-2 ${servicesElementChromeClass(chromes.tasks)}`.trim()}
              style={servicesElementChromeStyle(chromes.tasks, accent)}
            >
              <ServicesTaskList
                tasks={tasks}
                presentation={presentation}
                textStyle={tasksStyle}
                textClassName={`break-words [overflow-wrap:normal] ${servicesPrincipalInkClass(presentation, cardIndex)}`}
                bulletClassName={servicesPrincipalBulletClass(presentation, cardIndex)}
                bulletColorOverride={
                  servicesPrincipalSurfaceActive(presentation, cardIndex)
                    ? servicesColorLuminance(resolveServicesPrincipalColor(presentation)) < 0.55
                      ? '#ffffff'
                      : '#111111'
                    : resolveServicesPrincipalColor(presentation)
                }
              />
            </div>
          ) : null}
        </div>

        {presentation.showServicePrice ? (
          <div
            className={`min-w-0 border-t pt-5 ${servicesPrincipalDividerClass(presentation, cardIndex)} lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0 ${servicesElementChromeClass(chromes.price)}`.trim()}
            style={{
              ...servicesElementChromeStyle(chromes.price, accent),
              ...priceMargins,
              borderColor: `color-mix(in srgb, ${presentation.cardBorderColor || accent} 45%, transparent)`,
            }}
          >
            {hasPrice && amount ? (
              <div className="flex min-w-0 flex-col gap-1.5">
                <p
                  className={`font-bold leading-none tracking-[-0.055em] text-[clamp(1.75rem,3vw,2.65rem)] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'title')}`}
                  style={priceStyle}
                >
                  <ServicePriceAmount
                    amount={amount}
                    currencySymbol={currencySymbol}
                    pricePrefix={pricePrefix}
                    currencyPlacement={currencyPlacement}
                    isFree={isFree}
                  />
                </p>
                {periodSuffix ? (
                  <span
                    className={`text-sm font-medium tracking-normal opacity-65 ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                    style={deliveryStyle}
                  >
                    {periodSuffix}
                  </span>
                ) : null}
              </div>
            ) : (
              <p
                className={`text-[0.8125rem] font-bold tracking-[-0.01em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'label')}`}
                style={{
                  ...priceStyle,
                  ...servicesPrincipalAwareColorStyle(
                    presentation,
                    cardIndex,
                    typeof priceStyle.color === 'string' ? priceStyle.color : undefined
                  ),
                }}
              >
                {SERVICES_CUSTOM_QUOTE_LABEL}
              </p>
            )}
            {presentation.showServiceDelivery && deliveryLabel ? (
              <p
                className={`mt-2 text-sm leading-snug ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.delivery, 'label')} ${servicesElementChromeClass(chromes.delivery)}`.trim()}
                style={{
                  ...deliveryStyle,
                  ...servicesElementChromeStyle(chromes.delivery, accent),
                  ...servicesPrincipalAwareColorStyle(
                    presentation,
                    cardIndex,
                    typeof deliveryStyle.color === 'string' ? deliveryStyle.color : undefined,
                    'muted'
                  ),
                }}
              >
                Delivery · {deliveryLabel}
              </p>
            ) : null}
          </div>
        ) : null}

        {presentation.showServiceCta !== false ? (
          <div className={`flex w-full min-w-0 ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`}>
            <ServiceOrderCta
              presentation={{
                ...presentation,
                ctaDesign: 'pill-accent',
              }}
              fullWidth
              labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
            />
          </div>
        ) : null}

        {service.popular ||
        presentation.commercialPopularItemNumber === cardIndex + 1 ? (
          <span
            className="absolute right-0 top-0 rounded-bl-xl px-3 py-1.5 text-[0.65rem] font-bold tracking-[0.18em] uppercase transition-colors duration-300 ease-out group-hover:![background-color:var(--pf-services-principal-hover-ink)] group-hover:![color:var(--pf-services-principal)]"
            style={{
              color: servicesColorLuminance(accent) < 0.55 ? '#ffffff' : '#0a0a0a',
              backgroundColor: accent,
            }}
          >
            {presentation.commercialPopularLabel?.trim() || 'Popular'}
          </span>
        ) : null}
      </ServicesCardForeground>
    </article>
  );
}

function EditorialServicePricingHeroCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const shellClass = servicesPricingHeroShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const accent = presentation.cardAccentColor;
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceAlignClass = servicePriceAlignClass(presentation.servicePriceAlign);
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const priceStyle = servicePriceTextStyle(elementTextInlineStyle(elementStyles.price));
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const descriptionLines = (service.description ?? '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  const serviceTasks = resolveServiceTasks(service);
  const featureLines =
    presentation.showServiceTasks !== false && serviceTasks.length > 0
      ? serviceTasks
      : presentation.showServiceDescription
        ? descriptionLines
        : [];
  const features: { key: string; content: string; kind: 'delivery' | 'body' }[] = [
    deliveryLabel && presentation.showServiceDelivery
      ? { key: 'delivery', content: `Delivery in ${deliveryLabel}`, kind: 'delivery' as const }
      : null,
    ...featureLines.map((line, index) => ({
      key: `task-${index}`,
      content: line,
      kind: 'body' as const,
    })),
    !hasPrice && presentation.showServicePrice
      ? { key: 'quote', content: 'Custom quote based on your project', kind: 'body' as const }
      : null,
  ].filter((item): item is { key: string; content: string; kind: 'delivery' | 'body' } => item !== null);

  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  const taskMarker = resolveTaskListMarker(
    taskListBulletGlobal,
    {
      taskBulletSource: resolveServicesTaskBulletSource(presentation),
      taskBulletStyle: presentation.servicesTaskBulletStyle ?? 'check',
      taskBulletColor: presentation.servicesTaskBulletColor,
      taskBulletSize: presentation.servicesTaskBulletSize ?? 'md',
      taskBulletSizePx: presentation.servicesTaskBulletSizePx,
      taskBulletWeight: presentation.servicesTaskBulletWeight ?? 'regular',
      taskBulletWeightAmount: presentation.servicesTaskBulletWeightAmount,
    },
    resolveServicesTaskBulletColor(presentation)
  );
  const principal = resolveServicesPrincipalColor(presentation);
  const principalSurfaceActive = servicesPrincipalSurfaceActive(presentation, cardIndex);
  const principalSurfaceInk =
    servicesColorLuminance(principal) < 0.55 ? '#ffffff' : '#111111';

  return (
    <article
      className={`group ${shellClass} ${frameClass} ${servicesPrincipalCardClass(presentation, cardIndex)} flex h-full w-full flex-col ${align.container} ${align.text}`}
      style={servicesPrincipalHoverStyle(presentation, surfaceStyle, tone)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
      {presentation.showServicePrice ? (
        <div
          className={`w-full shrink-0 ${priceAlignClass} ${servicesElementChromeClass(chromes.price)}`}
          style={{
            ...servicesElementChromeStyle(chromes.price, accent),
            ...priceMargins,
          }}
        >
          {hasPrice && amount ? (
            <p
              className={`shrink-0 font-bold tracking-[-0.05em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'title')}`}
              style={priceStyle}
            >
              <ServicePriceAmount
                amount={amount}
                currencySymbol={currencySymbol}
                pricePrefix={pricePrefix}
                currencyPlacement={currencyPlacement}
                isFree={isFree}
              />
            </p>
          ) : (
            <p
              className={`text-[0.8125rem] font-bold tracking-[-0.01em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'label')}`}
              style={priceStyle}
            >
              {SERVICES_CUSTOM_QUOTE_LABEL}
            </p>
          )}
        </div>
      ) : null}
      {presentation.showServiceTitle ? (
        <div
          className={servicesElementChromeClass(chromes.cardTitle)}
          style={servicesElementChromeStyle(chromes.cardTitle, accent)}
        >
          <h3
            className={`shrink-0 leading-tight tracking-[-0.02em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
            style={elementTextInlineStyle(elementStyles.cardTitle)}
          >
            {service.title}
          </h3>
        </div>
      ) : null}
      {features.length > 0 ? (
        <ul className="min-h-0 w-full flex-1 space-y-3.5">
          {features.map((feature) => {
            const isTask = feature.key.startsWith('task-');
            const taskIndex = isTask ? Number(feature.key.replace('task-', '')) || 0 : 0;
            const bulletStyle = taskMarker.style;
            const featureBulletClass = servicesPrincipalBulletClass(presentation, cardIndex);
            const bulletColor = principalSurfaceActive ? principalSurfaceInk : taskMarker.color;
            const bulletSize = taskMarker.size;
            const bulletSizePx = taskMarker.sizePx;
            const bulletWeight = taskMarker.weight;
            const bulletWeightAmount = taskMarker.weightAmount;
            const textTarget = feature.kind === 'delivery'
              ? elementStyles.delivery
              : isTask
                ? elementStyles.tasks
                : elementStyles.cardBody;
            const chromeTarget = feature.kind === 'delivery' ? chromes.delivery : isTask ? chromes.tasks : chromes.cardBody;

            return (
            <li
              key={feature.key}
              className={`flex items-start gap-2.5 leading-relaxed ${
                presentation.servicesContentAlignment === 'center'
                  ? 'justify-center'
                  : presentation.servicesContentAlignment === 'right'
                    ? 'justify-end'
                    : ''
              }`}
            >
              {isTask ? (
                <span className={featureBulletClass} style={{ color: bulletColor }}>
                  <ServicesTaskBulletMarker
                    style={bulletStyle}
                    color={featureBulletClass.trim() ? 'currentColor' : bulletColor}
                    index={taskIndex}
                    size={bulletSize}
                    sizePx={bulletSizePx}
                    weight={bulletWeight}
                    weightAmount={bulletWeightAmount}
                  />
                </span>
              ) : (
                <ServicesCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              )}
              <span
                className={`${align.text} ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(
                  textTarget,
                  feature.kind === 'delivery' ? 'label' : 'body'
                )} ${servicesElementChromeClass(chromeTarget)}`}
                style={{
                  ...elementTextInlineStyle(textTarget),
                  ...servicesElementChromeStyle(chromeTarget, accent),
                }}
              >
                {feature.content}
              </span>
            </li>
            );
          })}
        </ul>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}
      <div className={`mt-auto flex w-full shrink-0 pt-6 ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`}>
        <ServiceOrderCta
          presentation={presentation}
          fullWidth
          labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
        />
      </div>
      </ServicesCardForeground>
    </article>
  );
}

/**
 * Offre / Tarif — pricing card:
 * price → title → tasks → outline CTA (full width).
 * Checklist markers follow the section palette (tasksBullet / task ink).
 */
function EditorialServiceTierCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const shellClass = servicesTierShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const accent = presentation.cardAccentColor;
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceAlignClass = servicePriceAlignClass(
    presentation.servicePriceAlign ?? presentation.servicesContentAlignment
  );
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const description = service.description?.trim() || '';
  const serviceTasks = resolveServiceTasks(service);
  const showTasks = presentation.showServiceTasks !== false && serviceTasks.length > 0;
  const dividerColor = presentation.cardBorderColor || 'currentColor';
  const periodSuffix = presentation.servicePricePeriodSuffix?.trim() || '';
  const dividerStyle = {
    borderColor: `color-mix(in srgb, ${dividerColor} 35%, transparent)`,
  } as const;

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const priceInk = servicesCardReadableText(
    presentation,
    tone,
    priceColor,
    priceColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const titleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);
  const bulletColor = resolveServicesTaskBulletColor(presentation);
  const periodStyle = {
    ...elementTextInlineStyle(elementStyles.delivery, colorMode),
    color:
      (typeof tasksStyle.color === 'string' && tasksStyle.color.trim()) ||
      bulletColor,
  };

  const showPriceBlock = presentation.showServicePrice !== false;
  const showTitle = presentation.showServiceTitle !== false;
  const showDescription = presentation.showServiceDescription !== false && Boolean(description);
  const surfaceInk = servicesPrincipalSurfaceInkColors(presentation, cardIndex);
  const taskBulletColor = surfaceInk.active ? surfaceInk.ink : bulletColor;
  const surfacePriceStyle = {
    ...priceStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfaceTitleStyle = {
    ...titleStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfaceBodyStyle = {
    ...bodyStyle,
    ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
  };
  const surfaceTasksStyle = {
    ...tasksStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfacePeriodStyle = {
    ...periodStyle,
    ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
  };

  const card = (
    <article
      className={`group ${shellClass} ${frameClass} ${servicesPrincipalCardClass(presentation, cardIndex)} flex h-full w-full flex-col ${align.container}`}
      style={servicesPrincipalHoverStyle(presentation, surfaceStyle, tone)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
        {/* Reserved price band so titles align across cards. */}
        {showPriceBlock ? (
          <div
            className={`flex min-h-[3.35rem] w-full shrink-0 items-center justify-center ${priceAlignClass} ${servicesElementChromeClass(chromes.price)}`}
            style={{
              ...servicesElementChromeStyle(chromes.price, accent),
              ...priceMargins,
            }}
          >
            {hasPrice && amount ? (
              <div className={`flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 ${align.row}`}>
                <p
                  className={`shrink-0 font-bold tracking-[-0.04em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'title')}`}
                  style={surfacePriceStyle}
                >
                  <ServicePriceAmount
                    amount={amount}
                    currencySymbol={currencySymbol}
                    pricePrefix={pricePrefix}
                    currencyPlacement={currencyPlacement}
                    isFree={isFree}
                  />
                </p>
                {periodSuffix ? (
                  <span
                    className={`text-sm font-bold tracking-normal ${servicesPrincipalMutedClass(presentation, cardIndex)} ${align.text} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                    style={surfacePeriodStyle}
                  >
                    {periodSuffix}
                  </span>
                ) : null}
              </div>
            ) : (
              <ServicesCustomQuoteLabel
                className={`text-center ${servicesPrincipalInkClass(presentation, cardIndex)}`}
                style={{
                  ...servicesPrincipalAwareColorStyle(
                    presentation,
                    cardIndex,
                    typeof priceStyle.color === 'string' ? priceStyle.color : undefined
                  ),
                  textAlign: 'center',
                }}
              />
            )}
          </div>
        ) : (
          <div className="min-h-[3.35rem] w-full shrink-0" aria-hidden />
        )}

        {showTitle ? (
          <div
            className={`flex min-h-[2.75rem] w-full shrink-0 items-center justify-center border-y py-1.5 ${servicesPrincipalDividerClass(presentation, cardIndex)} ${servicesElementChromeClass(chromes.cardTitle)}`.trim()}
            style={{
              ...dividerStyle,
              ...servicesElementChromeStyle(chromes.cardTitle, accent),
              ...(surfaceInk.active
                ? { borderColor: `color-mix(in srgb, ${surfaceInk.ink} 45%, transparent)` }
                : null),
            }}
          >
            <h3
              className={`w-full text-center leading-tight tracking-[-0.02em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
              style={surfaceTitleStyle}
            >
              {service.title}
            </h3>
          </div>
        ) : null}

        {showDescription ? (
          <div
            className={`w-full shrink-0 ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
            style={servicesElementChromeStyle(chromes.cardBody, accent)}
          >
            <p
              className={`text-left leading-relaxed ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
              style={surfaceBodyStyle}
            >
              {description}
            </p>
          </div>
        ) : null}

        {showTasks ? (
          <div
            className={`w-full min-h-0 flex-1 pt-4 ${servicesElementChromeClass(chromes.tasks)}`.trim()}
            style={servicesElementChromeStyle(chromes.tasks, accent)}
          >
            <ServicesTaskList
              tasks={serviceTasks}
              presentation={presentation}
              alignClass={align.container}
              itemJustifyClass={align.row}
              textClassName={`${align.text} ${servicesPrincipalInkClass(presentation, cardIndex)}`.trim()}
              textStyle={surfaceTasksStyle}
              bulletClassName={servicesPrincipalBulletClass(presentation, cardIndex)}
              bulletColorOverride={taskBulletColor}
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1" aria-hidden />
        )}

        <div className={`mt-auto w-full shrink-0 pt-2 ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`}>
          <ServiceOrderCta
            presentation={{
              ...presentation,
              ctaDesign: 'pill-accent',
            }}
            fullWidth
            labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
          />
        </div>
      </ServicesCardForeground>
    </article>
  );

  return (
    <div className="pf-services-card-float-host h-full w-full min-w-0">
      {card}
    </div>
  );
}

function ServicesCheckCircleIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.75} />
      <path
        d="M8.2 12.2l2.4 2.4 5.2-5.4"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServicesLockIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth={1.75} />
      <path
        d="M8 11V8a4 4 0 118 0v3"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Parse plan features — prefix with `lock:` or `!` to mark as unavailable. */
function resolveServicePlanFeatures(
  service: ProfileServiceItem
): { key: string; label: string; locked: boolean }[] {
  return resolveServiceTasks(service).map((raw, index) => {
    const locked =
      /^lock:\s*/i.test(raw) || raw.startsWith('!') || raw.startsWith('🔒');
    const label = raw
      .replace(/^lock:\s*/i, '')
      .replace(/^!\s*/, '')
      .replace(/^🔒\s*/, '')
      .trim();
    return { key: `plan-feature-${index}`, label, locked };
  });
}

/**
 * Plan tarifaire — title → description → price → CTA → feature list (check / lock).
 */
function EditorialServicePlanCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const shellClass = servicesTierShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const accent = presentation.cardAccentColor;
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceAlignClass = servicePriceAlignClass(
    presentation.servicePriceAlign ?? presentation.servicesContentAlignment
  );
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const description = service.description?.trim() || '';
  const features = resolveServicePlanFeatures(service);
  const showFeatures = presentation.showServiceTasks !== false && features.length > 0;
  const periodSuffix = presentation.servicePricePeriodSuffix?.trim() || '';
  const priceNote =
    presentation.showServiceDelivery !== false && service.deadline?.trim()
      ? formatServiceDeliveryLabel(service.deadline)
      : '';

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const deliveryColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.delivery.colorDark || elementStyles.delivery.color
      : elementStyles.delivery.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const priceInk = servicesCardReadableText(
    presentation,
    tone,
    priceColor,
    priceColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const noteInk = servicesCardReadableText(
    presentation,
    tone,
    deliveryColor,
    deliveryColor,
    readingSurface
  );
  const titleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);
  const noteStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.delivery, colorMode), color: noteInk.muted }
    : elementTextInlineStyle(elementStyles.delivery, colorMode);
  const lockedColor = `color-mix(in srgb, ${String(tasksStyle.color || '#a3a3a3')} 55%, transparent)`;
  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  const taskMarker = resolveServicesTaskListMarker(presentation, taskListBulletGlobal);
  const bulletColor = taskMarker.color;
  const showTitle = presentation.showServiceTitle !== false;
  const showDescription = presentation.showServiceDescription === true && Boolean(description);
  const showPrice = presentation.showServicePrice !== false;
  const showCta = presentation.showServiceCta !== false;
  const surfaceInk = servicesPrincipalSurfaceInkColors(presentation, cardIndex);
  const surfaceTitleStyle = {
    ...titleStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfaceBodyStyle = {
    ...bodyStyle,
    ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
  };
  const surfacePriceStyle = {
    ...priceStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfaceNoteStyle = {
    ...noteStyle,
    ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
  };
  const surfaceTasksStyle = {
    ...tasksStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfaceLockedColor = surfaceInk.active
    ? `color-mix(in srgb, ${surfaceInk.muted} 55%, transparent)`
    : lockedColor;
  const surfaceBulletColor = surfaceInk.active ? surfaceInk.ink : bulletColor;

  return (
    <article
      className={`group ${shellClass} ${frameClass} ${servicesPrincipalCardClass(presentation, cardIndex)} flex h-full w-full flex-col ${align.container}`}
      style={servicesPrincipalHoverStyle(presentation, surfaceStyle, tone)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
        {/* Reserved title band so price + CTA align across cards. */}
        {showTitle ? (
          <div
            className={`flex min-h-[3.4em] w-full shrink-0 items-start ${align.block} ${servicesElementChromeClass(chromes.cardTitle)}`.trim()}
            style={servicesElementChromeStyle(chromes.cardTitle, accent)}
          >
            <h3
              className={`line-clamp-2 w-full leading-tight tracking-[-0.02em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${align.text} ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
              style={surfaceTitleStyle}
            >
              {service.title}
            </h3>
          </div>
        ) : (
          <div className="min-h-[3.4em] w-full shrink-0" aria-hidden />
        )}

        {showDescription ? (
          <div
            className={`w-full shrink-0 ${align.block} ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
            style={servicesElementChromeStyle(chromes.cardBody, accent)}
          >
            <p
              className={`leading-relaxed ${servicesPrincipalMutedClass(presentation, cardIndex)} ${align.text} ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
              style={surfaceBodyStyle}
            >
              {description}
            </p>
          </div>
        ) : null}

        {/* Reserved price / custom-quote band so CTAs share one horizontal line. */}
        {showPrice ? (
          <div
            className={`flex min-h-[4.25rem] w-full shrink-0 flex-col justify-center ${priceAlignClass} ${servicesElementChromeClass(chromes.price)}`}
            style={{
              ...servicesElementChromeStyle(chromes.price, accent),
              ...priceMargins,
            }}
          >
            {hasPrice && amount ? (
              <>
                <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${align.row}`}>
                  <p
                    className={`shrink-0 font-bold tracking-[-0.05em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'title')}`}
                    style={surfacePriceStyle}
                  >
                    <ServicePriceAmount
                      amount={amount}
                      currencySymbol={currencySymbol}
                      pricePrefix={pricePrefix}
                      currencyPlacement={currencyPlacement}
                      isFree={isFree}
                    />
                  </p>
                  {periodSuffix ? (
                    <span
                      className={`text-sm font-medium opacity-70 ${servicesPrincipalMutedClass(presentation, cardIndex)} ${align.text} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                      style={surfaceNoteStyle}
                    >
                      {periodSuffix}
                    </span>
                  ) : null}
                </div>
                {priceNote ? (
                  <p
                    className={`mt-1.5 text-sm leading-snug opacity-70 ${servicesPrincipalMutedClass(presentation, cardIndex)} ${align.text} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                    style={surfaceNoteStyle}
                  >
                    {priceNote}
                  </p>
                ) : null}
              </>
            ) : (
              <ServicesCustomQuoteLabel
                className={`tracking-[-0.02em] ${servicesPrincipalInkClass(presentation, cardIndex)}`}
                style={{
                  ...servicesPrincipalAwareColorStyle(
                    presentation,
                    cardIndex,
                    typeof priceStyle.color === 'string' ? priceStyle.color : undefined
                  ),
                  textAlign: 'left',
                  fontSize: '1.2rem',
                  lineHeight: 1.2,
                }}
              />
            )}
          </div>
        ) : (
          <div className="min-h-[4.25rem] w-full shrink-0" aria-hidden />
        )}

        {showCta ? (
          <div className={`flex w-full shrink-0 justify-start ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`}>
            <ServiceOrderCta
              presentation={presentation}
              labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
            />
          </div>
        ) : null}

        {showFeatures ? (
          <ul
            className={`mt-1 min-h-0 w-full flex-1 space-y-4 ${align.container} ${servicesElementChromeClass(chromes.tasks)}`.trim()}
            style={servicesElementChromeStyle(chromes.tasks, accent)}
          >
            {features.map((feature, index) => {
              const featureBulletClass = feature.locked
                ? servicesPrincipalMutedClass(presentation, cardIndex)
                : servicesPrincipalBulletClass(presentation, cardIndex);
              return (
              <li
                key={feature.key}
                className={`flex items-start gap-3 ${align.row}`}
              >
                <span
                  className={`mt-0.5 shrink-0 ${featureBulletClass}`}
                  style={{
                    color: feature.locked ? surfaceLockedColor : surfaceBulletColor,
                    ['--pf-list-marker-glyph' as string]: surfaceInk.active
                      ? surfaceInk.principal
                      : listMarkerGlyphFallback(surfaceBulletColor),
                  }}
                >
                  {feature.locked ? (
                    <ServicesLockIcon className="h-5 w-5" />
                  ) : (
                    <ServicesTaskBulletMarker
                      style={taskMarker.style}
                      color={featureBulletClass.trim() ? 'currentColor' : surfaceBulletColor}
                      index={index}
                      size={taskMarker.size}
                      sizePx={taskMarker.sizePx}
                      weight={taskMarker.weight}
                      weightAmount={taskMarker.weightAmount}
                      className={featureBulletClass}
                    />
                  )}
                </span>
                <span
                  className={`min-w-0 leading-snug ${align.text} ${elementTextStyleClass(elementStyles.tasks, 'body')} ${
                    feature.locked
                      ? `opacity-55 ${servicesPrincipalMutedClass(presentation, cardIndex)}`
                      : servicesPrincipalInkClass(presentation, cardIndex)
                  }`}
                  style={
                    feature.locked
                      ? { ...surfaceTasksStyle, color: surfaceLockedColor }
                      : surfaceTasksStyle
                  }
                >
                  {feature.label}
                </span>
              </li>
              );
            })}
          </ul>
        ) : (
          <div className="min-h-0 flex-1" aria-hidden />
        )}
      </ServicesCardForeground>
    </article>
  );
}

/**
 * Plan en colonnes — bandeau 3 colonnes :
 * titre + description | inclusions | prix + période + CTA.
 */
function EditorialServicePlanSplitCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const shellClass = servicesTierShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const accent = presentation.cardAccentColor;
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const description = service.description?.trim() || '';
  const serviceTasks = resolveServiceTasks(service);
  const periodSuffix = presentation.servicePricePeriodSuffix?.trim() || '';
  const dividerColor = presentation.cardBorderColor || 'currentColor';
  const dividerBorder = {
    borderColor: `color-mix(in srgb, ${dividerColor} 28%, transparent)`,
  } as const;
  const principal = resolveServicesPrincipalColor(presentation);

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const priceInk = servicesCardReadableText(
    presentation,
    tone,
    priceColor,
    priceColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const titleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);
  const periodStyle = {
    ...elementTextInlineStyle(elementStyles.delivery, colorMode),
    color:
      (typeof tasksStyle.color === 'string' && tasksStyle.color.trim()) ||
      cardInk.muted,
  };

  const showTitle = presentation.showServiceTitle !== false;
  const showDescription = presentation.showServiceDescription !== false && Boolean(description);
  const showTasks = presentation.showServiceTasks !== false && serviceTasks.length > 0;
  const showPrice = presentation.showServicePrice !== false;
  const showCta = presentation.showServiceCta !== false;
  const surfaceInk = servicesPrincipalSurfaceInkColors(presentation, cardIndex);
  const taskBulletColor = surfaceInk.active ? surfaceInk.ink : principal;
  const surfaceTitleStyle = {
    ...titleStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfaceBodyStyle = {
    ...bodyStyle,
    ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
  };
  const surfacePriceStyle = {
    ...priceStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };
  const surfacePeriodStyle = {
    ...periodStyle,
    ...(surfaceInk.active ? { color: surfaceInk.muted } : null),
  };
  const surfaceTasksStyle = {
    ...tasksStyle,
    ...(surfaceInk.active ? { color: surfaceInk.ink } : null),
  };

  return (
    <article
      className={`group ${shellClass} ${frameClass} ${servicesPrincipalCardClass(presentation, cardIndex)} !px-6 !py-8 sm:!px-8 sm:!py-10 lg:!px-10 lg:!py-11 flex h-full w-full flex-col`}
      style={servicesPrincipalHoverStyle(presentation, surfaceStyle, tone)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.25fr)_minmax(15.5rem,0.9fr)] lg:items-stretch"
      >
        {/* Col 1 — titre + description */}
        <div
          className={`flex min-w-0 flex-col justify-center border-b py-1 ${servicesPrincipalDividerClass(presentation, cardIndex)} lg:border-b-0 lg:border-r lg:pr-10 ${contentGap.className}`.trim()}
          style={{
            ...contentGap.style,
            ...dividerBorder,
            ...(surfaceInk.active
              ? { borderColor: `color-mix(in srgb, ${surfaceInk.ink} 40%, transparent)` }
              : null),
          }}
        >
          {showTitle ? (
            <div
              className={servicesElementChromeClass(chromes.cardTitle)}
              style={servicesElementChromeStyle(chromes.cardTitle, accent)}
            >
              <h3
                className={`leading-tight tracking-[-0.03em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
                style={surfaceTitleStyle}
              >
                {service.title}
              </h3>
            </div>
          ) : null}
          {showDescription ? (
            <div
              className={servicesElementChromeClass(chromes.cardBody)}
              style={servicesElementChromeStyle(chromes.cardBody, accent)}
            >
              <p
                className={`leading-relaxed ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
                style={surfaceBodyStyle}
              >
                {description}
              </p>
            </div>
          ) : null}
        </div>

        {/* Col 2 — inclusions */}
        <div
          className={`flex min-w-0 flex-col justify-center border-b py-5 ${servicesPrincipalDividerClass(presentation, cardIndex)} lg:border-b-0 lg:border-r lg:px-10 lg:py-1 ${servicesElementChromeClass(chromes.tasks)}`.trim()}
          style={{
            ...dividerBorder,
            ...servicesElementChromeStyle(chromes.tasks, accent),
            ...(surfaceInk.active
              ? { borderColor: `color-mix(in srgb, ${surfaceInk.ink} 40%, transparent)` }
              : null),
          }}
        >
          {showTasks ? (
            <ServicesTaskList
              tasks={serviceTasks}
              presentation={presentation}
              textStyle={surfaceTasksStyle}
              textClassName={`text-left break-words [overflow-wrap:normal] ${servicesPrincipalInkClass(presentation, cardIndex)}`}
              listClassName="space-y-5"
              bulletClassName={servicesPrincipalBulletClass(presentation, cardIndex)}
              bulletColorOverride={taskBulletColor}
            />
          ) : null}
        </div>

        {/* Col 3 — prix + CTA */}
        <div className="flex min-w-0 flex-col justify-center gap-4 py-1 lg:pl-10">
          {showPrice ? (
            <div
              className={`flex w-full flex-col ${servicesElementChromeClass(chromes.price)}`}
              style={{
                ...servicesElementChromeStyle(chromes.price, accent),
                ...priceMargins,
              }}
            >
              {hasPrice && amount ? (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p
                    className={`relative shrink-0 font-bold tracking-[-0.04em] ${servicesPrincipalInkClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.price, 'title')}`}
                    style={surfacePriceStyle}
                  >
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute inset-x-0 bottom-[0.12em] z-0 h-[0.38em] rounded-sm transition-opacity duration-300 ${
                        surfaceInk.active ? 'opacity-0' : 'opacity-35 group-hover:opacity-0'
                      }`}
                      style={{ backgroundColor: principal }}
                    />
                    <span className="relative z-[1]">
                      <ServicePriceAmount
                        amount={amount}
                        currencySymbol={currencySymbol}
                        pricePrefix={pricePrefix}
                        currencyPlacement={currencyPlacement}
                        isFree={isFree}
                      />
                    </span>
                  </p>
                  {periodSuffix ? (
                    <span
                      className={`text-sm font-medium opacity-70 ${servicesPrincipalMutedClass(presentation, cardIndex)} ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                      style={surfacePeriodStyle}
                    >
                      {periodSuffix}
                    </span>
                  ) : null}
                </div>
              ) : (
                <ServicesCustomQuoteLabel
                  className={servicesPrincipalInkClass(presentation, cardIndex)}
                  style={{
                    ...servicesPrincipalAwareColorStyle(
                      presentation,
                      cardIndex,
                      typeof priceStyle.color === 'string' ? priceStyle.color : undefined
                    ),
                    fontSize: '1.2rem',
                    lineHeight: 1.2,
                  }}
                />
              )}
            </div>
          ) : null}

          {showCta ? (
            <div
              className={`w-full ${servicesPrincipalDividerClass(presentation, cardIndex)} ${showPrice ? 'border-t pt-4' : ''} ${servicesPrincipalCtaWrapClass(presentation, cardIndex)}`.trim()}
              style={showPrice ? dividerBorder : undefined}
            >
              <ServiceOrderCta
                presentation={{
                  ...presentation,
                  ctaDesign: 'pill-accent',
                }}
                fullWidth
                labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
              />
            </div>
          ) : null}
        </div>
      </ServicesCardForeground>
    </article>
  );
}

function useSkillListBullet(presentation: PortfolioServicesPresentationSettings) {
  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  if (presentation.skillsShowBullet !== true) return null;
  return resolveTaskListMarker(
    taskListBulletGlobal,
    {
      taskBulletSource: 'section',
      taskBulletStyle: presentation.skillsBulletStyle ?? 'disc',
      taskBulletColor: presentation.skillsBulletColor,
      taskBulletSize: presentation.skillsBulletSize ?? 'md',
      taskBulletSizePx: presentation.skillsBulletSizePx,
      taskBulletWeight: presentation.skillsBulletWeight ?? 'regular',
      taskBulletWeightAmount: presentation.skillsBulletWeightAmount,
    },
    presentation.skillsBulletColor || DEFAULT_SERVICES_TASK_BULLET_COLOR
  );
}

function SkillListBullet({
  marker,
  index = 0,
}: {
  marker: NonNullable<ReturnType<typeof useSkillListBullet>>;
  index?: number;
}) {
  if (marker.style === 'none') return null;
  return (
    <PortfolioListMarker
      style={marker.style}
      color={marker.color}
      index={index}
      size={marker.size}
      sizePx={marker.sizePx}
      weight={marker.weight}
      weightAmount={marker.weightAmount}
    />
  );
}

function resolveSkillCardChrome(
  presentation: PortfolioServicesPresentationSettings,
  skillName: string,
  tone: EditorialMarqueeCardTone = 'light'
) {
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const skillTitle = elementStyles.skillTitle;
  const skillBody = elementStyles.skillBody;
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? skillTitle.colorDark || skillTitle.color
      : skillTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? skillBody.colorDark || skillBody.color
      : skillBody.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const brandHex = null as string | null;
  const logoHex = null as string | null;
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const cardFillOff =
    !brandHex &&
    presentation.cardBackgroundFill !== 'split' &&
    !presentation.cardBackgroundEnabled;
  const iconChipBg = brandHex
    ? servicesSoftIconChipBg(brandHex)
    : cardFillOff
      ? servicesSoftIconChipBg(readingSurface)
      : readingSurface;
  const resolvedIconChipBg =
    presentation.skillsIconBackgroundEnabled === false
      ? readingSurface
      : presentation.skillsIconBackgroundManual
        ? presentation.skillsIconBackgroundColor
        : iconChipBg;
  return {
    skillTitle,
    skillBody,
    chromes,
    surfaceStyle,
    surfaceHex: readingSurface,
    brandHex,
    logoHex,
    colorMode,
    cardInk,
    skillTitleStyle: usePairAbInk
      ? { ...elementTextInlineStyle(skillTitle, colorMode, 'title'), color: cardInk.strong }
      : elementTextInlineStyle(skillTitle, colorMode, 'title'),
    skillBodyStyle: usePairAbInk
      ? { ...elementTextInlineStyle(skillBody, colorMode, 'body'), color: cardInk.muted }
      : elementTextInlineStyle(skillBody, colorMode, 'body'),
    iconChrome: {
      ...servicesSkillIconChromeStyle(presentation, tone),
      backgroundColor:
        presentation.skillsIconBackgroundEnabled === false
          ? 'transparent'
          : resolvedIconChipBg,
      borderColor:
        presentation.skillsIconBorderEnabled === false
          ? 'transparent'
          : presentation.skillsIconBorderManual
            ? presentation.skillsIconBorderColor
            : brandHex || cardFillOff
              ? 'transparent'
              : undefined,
    },
    iconChipBg: resolvedIconChipBg,
  };
}

function skillPillDotContrastRatio(color: string, surface: string): number {
  const colorLuminance = servicesColorLuminance(color);
  const surfaceLuminance = servicesColorLuminance(surface);
  const lighter = Math.max(colorLuminance, surfaceLuminance);
  const darker = Math.min(colorLuminance, surfaceLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function resolveSkillPillDotColor({
  brandColor,
  logoColor,
  accentColor,
  surfaceColor,
}: {
  brandColor: string | null;
  logoColor: string | null;
  accentColor: string;
  surfaceColor: string;
}): string {
  const logoLuminance = logoColor ? servicesColorLuminance(logoColor) : null;
  const logoIsNearNeutralExtreme =
    logoLuminance != null && (logoLuminance < 0.035 || logoLuminance > 0.94);
  const candidates = [
    brandColor,
    logoIsNearNeutralExtreme ? null : logoColor,
    accentColor,
    logoIsNearNeutralExtreme ? logoColor : null,
  ].filter((color): color is string => Boolean(color));

  const distinctCandidates = [...new Set(candidates)];
  return (
    distinctCandidates.find(
      (candidate) => skillPillDotContrastRatio(candidate, surfaceColor) >= 2
    ) ?? accentColor
  );
}

function EditorialSkillListRow({
  skill,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  skill: PortfolioSkillRef;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const skillName = resolveSkillName(skill);
  const description = resolveSkillDescription(skill);
  const shellClass = servicesListRowShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const {
    skillTitle,
    skillBody,
    chromes,
    surfaceStyle,
    skillTitleStyle,
    skillBodyStyle,
    iconChrome,
    iconChipBg,
    logoHex,
  } = resolveSkillCardChrome(presentation, skillName, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const contentAlign = presentation.skillsContentAlignment ?? 'left';
  const contentGap = servicesCardContentGapProps(
    presentation.skillsContentGap,
    presentation.skillsContentGapPx
  );
  const iconTop = presentation.skillsIconPlacement === 'top';
  const iconShellClass = toolsIconShellClass(presentation.skillsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.skillsIconSize);
  const bullet = useSkillListBullet(presentation);

  const icon = presentation.showSkillIcon ? (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border shadow-sm ${iconShellClass}`}
      style={iconChrome}
    >
      <CreatorToolLogo
        label={skillName}
        iconUrl={resolveSkillIconUrl(skill)}
        size={iconPixelSize}
        className="rounded-full"
        bgColor={iconChipBg}
        brandColor={logoHex ?? undefined}
      />
    </div>
  ) : null;

  const titleBlock = presentation.showSkillTitle ? (
    <div
      className={servicesElementChromeClass(chromes.skillTitle)}
      style={servicesElementChromeStyle(chromes.skillTitle)}
    >
      <p
        className={`break-words [overflow-wrap:anywhere] ${elementTextStyleClass(skillTitle, 'title')}`}
        style={skillTitleStyle}
      >
        {skillName}
      </p>
    </div>
  ) : null;

  const descriptionBlock = presentation.showSkillDescription ? (
    <div
      className={servicesElementChromeClass(chromes.skillBody)}
      style={servicesElementChromeStyle(chromes.skillBody)}
    >
      <p
        className={`mt-0.5 line-clamp-2 leading-snug ${elementTextStyleClass(skillBody, 'body')}`}
        style={skillBodyStyle}
      >
        {description}
      </p>
    </div>
  ) : null;

  if (iconTop) {
    return (
      <article
        className={`group flex h-full flex-col ${shellClass} ${frameClass} ${align.container}`}
        style={surfaceStyle}
        {...fillAttrs}
      >
        <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
        <ServicesCardForeground
          className={`flex h-full flex-col ${contentGap.className}`.trim()}
          style={contentGap.style}
        >
        {bullet ? <SkillListBullet marker={bullet} index={cardIndex} /> : null}
        {icon}
        <div className={`min-w-0 ${align.text}`}>
          {titleBlock}
          {descriptionBlock}
        </div>
        </ServicesCardForeground>
      </article>
    );
  }

  /**
   * Left = full-width row (icons share the same left edge).
   * Center / right = same fixed cluster width on every card so icon+label
   * move together AND icons stay vertically aligned across the column.
   */
  const clusterWidthClass =
    contentAlign === 'left' ? 'w-full' : 'w-[min(100%,15.5rem)] sm:w-[min(100%,16.5rem)]';

  return (
    <article
      className={`group relative ${shellClass} ${frameClass}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className={`flex w-full items-center ${align.row}`}>
        <div
          className={`grid ${clusterWidthClass} grid-cols-[auto_minmax(0,1fr)] items-center gap-3`}
        >
          <div className="flex shrink-0 items-center gap-2.5">
            {bullet ? <SkillListBullet marker={bullet} index={cardIndex} /> : null}
            {icon}
          </div>
          <div className="min-w-0 text-left">
            {titleBlock}
            {descriptionBlock}
          </div>
        </div>
      </ServicesCardForeground>
    </article>
  );
}

function EditorialSkillPricingHeroCard({
  skill,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  skill: PortfolioSkillRef;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const skillName = resolveSkillName(skill);
  const description = resolveSkillDescription(skill);
  const shellClass = servicesPricingHeroShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const {
    skillTitle,
    skillBody,
    chromes,
    surfaceStyle,
    skillTitleStyle,
    skillBodyStyle,
    iconChrome,
    iconChipBg,
    logoHex,
  } = resolveSkillCardChrome(presentation, skillName, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const contentGap = servicesCardContentGapProps(
    presentation.skillsContentGap,
    presentation.skillsContentGapPx
  );
  const contentAlign = presentation.skillsContentAlignment ?? 'left';
  const iconTop = presentation.skillsIconPlacement === 'top';
  const iconShellClass = toolsIconShellClass(presentation.skillsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.skillsIconSize);

  const icon = presentation.showSkillIcon ? (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border shadow-sm ${iconShellClass}`}
      style={iconChrome}
    >
      <CreatorToolLogo
        label={skillName}
        iconUrl={resolveSkillIconUrl(skill)}
        size={iconPixelSize}
        className="rounded-full"
        bgColor={iconChipBg}
        brandColor={logoHex ?? undefined}
      />
    </div>
  ) : null;

  const titleBlock = presentation.showSkillTitle ? (
    <div
      className={servicesElementChromeClass(chromes.skillTitle)}
      style={servicesElementChromeStyle(chromes.skillTitle)}
    >
      <h3
        className={`shrink-0 leading-tight tracking-[-0.02em] ${elementTextStyleClass(skillTitle, 'title')}`}
        style={skillTitleStyle}
      >
        {skillName}
      </h3>
    </div>
  ) : null;

  return (
    <article
      className={`${shellClass} ${frameClass} flex h-full w-full flex-col ${align.container} ${align.text}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
      {presentation.showSkillIcon || presentation.showSkillTitle ? (
        <div
          className={`flex w-full ${
            iconTop ? `flex-col gap-3 ${align.container}` : `items-start gap-4 ${align.row}`
          }`}
        >
          {icon}
          {titleBlock ? (
            <div
              className={`min-w-0 ${iconTop ? '' : 'pt-1'} ${!iconTop && contentAlign === 'left' ? 'flex-1' : ''} ${align.text}`}
            >
              {titleBlock}
            </div>
          ) : null}
        </div>
      ) : null}
      {presentation.showSkillDescription ? (
        <div
          className={`min-h-0 flex-1 ${servicesElementChromeClass(chromes.skillBody)}`.trim()}
          style={servicesElementChromeStyle(chromes.skillBody)}
        >
          <p
            className={`min-h-0 flex-1 line-clamp-3 leading-relaxed ${elementTextStyleClass(skillBody, 'body')}`}
            style={skillBodyStyle}
          >
            {description}
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}
      </ServicesCardForeground>
    </article>
  );
}


/**
 * Carte média — content column (title, description, tasks, price / delivery)
 * + cover image on the right. English labels only.
 */
function EditorialServiceMediaCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const mediaPresentation = resolveServicesMediaCardPresentation(presentation);
  const shellClass = servicesTierShellClass(mediaPresentation.cardDesign, tone, mediaPresentation);
  const frameClass = servicesCardFrameClass(mediaPresentation);
  const surfaceStyle = servicesMediaCardSurfaceStyle(mediaPresentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(mediaPresentation);
  const accent = resolveServicesPrincipalColor(presentation);
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const description = service.description?.trim() || '';
  const serviceTasks = resolveServiceTasks(service);
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const coverSrc =
    resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl?.trim() || '';

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const priceInk = servicesCardReadableText(
    presentation,
    tone,
    priceColor,
    priceColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const titleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);

  const metaLabelStyle = { color: cardInk.muted };
  const markerColor = accent;

  const showTitle = presentation.showServiceTitle !== false;
  const showDescription = presentation.showServiceDescription !== false && Boolean(description);
  const showTasks = presentation.showServiceTasks !== false && serviceTasks.length > 0;
  const showPrice = presentation.showServicePrice !== false;
  const showDelivery = presentation.showServiceDelivery !== false && Boolean(deliveryLabel);
  const showCta = presentation.showServiceCta === true;
  const showMeta = showPrice || showDelivery;
  const mediaOnLeft = servicesMediaOnLeft(presentation, cardIndex);
  const mediaOrderClass = mediaOnLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2';
  const infoOrderClass = mediaOnLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1';
  const splitGridClass = mediaOnLeft
    ? 'lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.15fr)]'
    : 'lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)]';

  return (
    <article
      className={`${shellClass} ${frameClass} !p-5 sm:!p-6 lg:!p-7 flex h-full w-full flex-col`}
      style={servicesCardPrincipalStyle(presentation, surfaceStyle)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`grid min-h-0 flex-1 grid-cols-1 gap-6 lg:items-stretch lg:gap-8 ${splitGridClass}`}
      >
        <div
          className={`flex min-w-0 flex-col ${infoOrderClass} ${contentGap.className}`.trim()}
          style={contentGap.style}
        >
          {showTitle ? (
            <div
              className={servicesElementChromeClass(chromes.cardTitle)}
              style={servicesElementChromeStyle(chromes.cardTitle, accent)}
            >
              <h3
                className={`font-serif leading-tight tracking-[-0.03em] ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
                style={titleStyle}
              >
                {service.title}
              </h3>
            </div>
          ) : null}

          {showDescription ? (
            <div
              className={`mt-4 ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
              style={servicesElementChromeStyle(chromes.cardBody, accent)}
            >
              <p
                className={`leading-relaxed ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
                style={bodyStyle}
              >
                {description}
              </p>
            </div>
          ) : null}

          {showTasks ? (
            <ul
              className={`mt-5 w-full divide-y ${servicesElementChromeClass(chromes.tasks)}`.trim()}
              style={{
                ...servicesElementChromeStyle(chromes.tasks, accent),
                borderColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
              }}
            >
              {serviceTasks.map((task, index) => (
                <li
                  key={`${index}-${task}`}
                  className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                  }}
                >
                  <span
                    className="mt-0.5 inline-block h-5 w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: markerColor }}
                    aria-hidden
                  />
                  <span
                    className={`min-w-0 leading-snug ${elementTextStyleClass(elementStyles.tasks, 'body')}`}
                    style={tasksStyle}
                  >
                    {task}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="min-h-0 flex-1" aria-hidden />
          )}

          <div className="mt-auto flex w-full flex-col gap-4 pt-6">
            {showMeta ? (
              <div
                className={`flex w-full flex-wrap items-stretch gap-5 sm:gap-6 ${servicesElementChromeClass(chromes.price)}`.trim()}
                style={{
                  ...servicesElementChromeStyle(chromes.price, accent),
                  ...priceMargins,
                }}
              >
                {showPrice ? (
                  <div className="min-w-0">
                    <p
                      className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                      style={metaLabelStyle}
                    >
                      Price
                    </p>
                    {hasPrice && amount ? (
                      <p
                        className={`mt-0.5 font-bold leading-none tracking-[-0.03em] ${elementTextStyleClass(elementStyles.price, 'title')}`}
                        style={priceStyle}
                      >
                        <ServicePriceAmount
                          amount={amount}
                          currencySymbol={currencySymbol}
                          pricePrefix={pricePrefix}
                          currencyPlacement={currencyPlacement}
                          isFree={isFree}
                        />
                      </p>
                    ) : (
                      <ServicesCustomQuoteLabel
                        className="mt-0.5"
                        style={{
                          color:
                            typeof priceStyle.color === 'string' ? priceStyle.color : undefined,
                          fontSize: '1.15rem',
                          lineHeight: 1.2,
                        }}
                      />
                    )}
                  </div>
                ) : null}

                {showPrice && showDelivery ? (
                  <div
                    className="hidden w-px self-stretch sm:block"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
                    }}
                    aria-hidden
                  />
                ) : null}

                {showDelivery ? (
                  <div className="flex min-w-0 items-center gap-3">
                    <MediaCardClockIcon className="h-8 w-8 shrink-0" style={{ color: markerColor }} />
                    <div className="min-w-0">
                      <p
                        className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                        style={metaLabelStyle}
                      >
                        Delivery
                      </p>
                      <p
                        className={`mt-0.5 font-bold leading-none tracking-[-0.02em] ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                        style={priceStyle}
                      >
                        {deliveryLabel}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {showCta ? (
              <div className="w-full">
                <ServiceOrderCta
                  presentation={{
                    ...presentation,
                    ctaDesign: 'pill-accent',
                  }}
                  fullWidth
                  labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[1.35rem] lg:mx-0 lg:max-w-none lg:self-stretch lg:aspect-auto lg:min-h-[18rem] ${mediaOrderClass}`}
        >
          {coverSrc ? (
            <PortfolioDeferredMedia
              src={coverSrc}
              alt={service.title}
              className="h-full w-full"
              objectFit="cover"
              eager={cardIndex < 2}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, #111) 100%)`,
              }}
              aria-hidden
            >
              <MediaCardLayersIcon className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>
      </ServicesCardForeground>
    </article>
  );
}

/**
 * Bannière média — cover image left, content right with tag chips,
 * price / delivery meta and CTA. English labels. No principal hover.
 */
function EditorialServiceMediaBannerCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const mediaPresentation = resolveServicesMediaCardPresentation(presentation);
  const shellClass = servicesTierShellClass(mediaPresentation.cardDesign, tone, mediaPresentation);
  const frameClass = servicesCardFrameClass(mediaPresentation);
  const surfaceStyle = servicesMediaCardSurfaceStyle(mediaPresentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(mediaPresentation);
  const accent = resolveServicesPrincipalColor(presentation);
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const priceMargins = servicePriceBoxStyle(presentation);
  const contentGap = servicesCardContentGapProps(
    presentation.servicesContentGap,
    presentation.servicesContentGapPx
  );
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const description = service.description?.trim() || '';
  const serviceTasks = resolveServiceTasks(service);
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const coverSrc =
    resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl?.trim() || '';

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const priceInk = servicesCardReadableText(
    presentation,
    tone,
    priceColor,
    priceColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const titleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);

  const metaLabelStyle = {
    color: cardInk.muted,
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  };
  const markerColor = accent;
  const surfaceIsDark = servicesColorLuminance(readingSurface) < 0.45;
  const chipSurfaceHex = surfaceIsDark ? '#1c1c1f' : '#f4f4f5';
  const chipBg = surfaceIsDark
    ? `color-mix(in srgb, ${accent} 18%, ${chipSurfaceHex})`
    : `color-mix(in srgb, ${accent} 5%, ${chipSurfaceHex})`;
  const dividerColor = surfaceIsDark
    ? `color-mix(in srgb, ${accent} 22%, #3f3f46)`
    : `color-mix(in srgb, ${accent} 14%, #e5e5e5)`;
  const chipTextInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    chipSurfaceHex
  );
  const chipTaskStyle = {
    ...tasksStyle,
    color: chipTextInk.muted,
  };

  const showTitle = presentation.showServiceTitle !== false;
  const showDescription = presentation.showServiceDescription !== false && Boolean(description);
  const showTasks = presentation.showServiceTasks !== false && serviceTasks.length > 0;
  const showPrice = presentation.showServicePrice !== false;
  const showDelivery = presentation.showServiceDelivery !== false && Boolean(deliveryLabel);
  const showCta = presentation.showServiceCta !== false;
  const showMeta = showPrice || showDelivery;
  const showFooter = showMeta || showCta;
  const bannerWidthClass = servicesCardMaxWidthShellClass(
    resolveMediaBannerCardMaxWidth(presentation),
    presentation.cardAlignment === 'left' || presentation.cardAlignment === 'right'
      ? presentation.cardAlignment
      : 'center',
    'commercial-list'
  );
  const mediaOnLeft = servicesMediaOnLeft(presentation, cardIndex);
  const mediaOrderClass = mediaOnLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2';
  const infoOrderClass = mediaOnLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1';
  const splitGridClass = mediaOnLeft
    ? 'lg:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.35fr)]'
    : 'lg:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.9fr)]';

  return (
    <article
      className={`${shellClass} ${frameClass} ${bannerWidthClass} !p-0 flex h-full flex-col overflow-hidden`}
      style={servicesCardPrincipalStyle(presentation, surfaceStyle)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`grid min-h-0 flex-1 grid-cols-1 lg:items-stretch ${splitGridClass}`}
      >
        <div
          className={`relative min-h-[14rem] w-full overflow-hidden sm:min-h-[16rem] lg:min-h-full lg:self-stretch ${mediaOrderClass}`}
        >
          {coverSrc ? (
            <PortfolioDeferredMedia
              src={coverSrc}
              alt={service.title}
              className="h-full w-full min-h-[14rem] sm:min-h-[16rem] lg:absolute lg:inset-0 lg:min-h-0"
              objectFit="cover"
              eager={cardIndex < 2}
            />
          ) : (
            <div
              className="flex h-full min-h-[14rem] w-full items-center justify-center sm:min-h-[16rem] lg:absolute lg:inset-0 lg:min-h-0"
              style={{
                background: `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, #111) 100%)`,
              }}
              aria-hidden
            >
              <MediaCardLayersIcon className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>

        <div
          className={`flex min-w-0 flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8 ${infoOrderClass} ${contentGap.className}`.trim()}
          style={contentGap.style}
        >
          {showTitle ? (
            <div
              className={servicesElementChromeClass(chromes.cardTitle)}
              style={servicesElementChromeStyle(chromes.cardTitle, accent)}
            >
              <h3
                className={`font-serif leading-tight tracking-[-0.03em] ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
                style={titleStyle}
              >
                {service.title}
              </h3>
            </div>
          ) : null}

          {showDescription ? (
            <div
              className={`mt-3 ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
              style={servicesElementChromeStyle(chromes.cardBody, accent)}
            >
              <p
                className={`max-w-2xl leading-relaxed ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
                style={bodyStyle}
              >
                {description}
              </p>
            </div>
          ) : null}

          {showTasks ? (
            <ul
              className={`mt-5 flex w-full flex-wrap gap-2.5 ${servicesElementChromeClass(chromes.tasks)}`.trim()}
              style={servicesElementChromeStyle(chromes.tasks, accent)}
            >
              {serviceTasks.map((task, index) => (
                <li
                  key={`${index}-${task}`}
                  className="inline-flex max-w-full items-center rounded-md px-3 py-2"
                  style={{ backgroundColor: chipBg }}
                >
                  <span
                    className={`min-w-0 leading-snug ${elementTextStyleClass(elementStyles.tasks, 'body')}`}
                    style={chipTaskStyle}
                  >
                    {task}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {showFooter ? (
            <div className="mt-auto flex w-full flex-col gap-5 pt-6">
              <div className="h-px w-full" style={{ backgroundColor: dividerColor }} aria-hidden />
              <div className="flex w-full flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                {showMeta ? (
                  <div
                    className={`flex min-w-0 flex-1 flex-wrap items-stretch gap-5 sm:gap-8 ${servicesElementChromeClass(chromes.price)}`.trim()}
                    style={{
                      ...servicesElementChromeStyle(chromes.price, accent),
                      ...priceMargins,
                    }}
                  >
                    {showPrice ? (
                      <div className="min-w-0">
                        <p style={metaLabelStyle}>Price</p>
                        {hasPrice && amount ? (
                          <p
                            className={`mt-0.5 font-bold leading-none tracking-[-0.03em] ${elementTextStyleClass(elementStyles.price, 'title')}`}
                            style={priceStyle}
                          >
                            <ServicePriceAmount
                              amount={amount}
                              currencySymbol={currencySymbol}
                              pricePrefix={pricePrefix}
                              currencyPlacement={currencyPlacement}
                              isFree={isFree}
                            />
                          </p>
                        ) : (
                          <ServicesCustomQuoteLabel
                            className="mt-0.5"
                            style={{
                              color:
                                typeof priceStyle.color === 'string'
                                  ? priceStyle.color
                                  : undefined,
                              fontSize: '1.15rem',
                              lineHeight: 1.2,
                            }}
                          />
                        )}
                      </div>
                    ) : null}

                    {showDelivery ? (
                      <div className="flex min-w-0 items-center gap-3">
                        <MediaCardClockIcon
                          className="h-8 w-8 shrink-0"
                          style={{ color: markerColor }}
                        />
                        <div className="min-w-0">
                          <p style={metaLabelStyle}>Delivery</p>
                          <p
                            className={`mt-0.5 font-bold leading-none tracking-[-0.02em] ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                            style={priceStyle}
                          >
                            {deliveryLabel}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="min-w-0 flex-1" aria-hidden />
                )}

                {showCta ? (
                  <div className="w-full shrink-0 sm:w-auto sm:min-w-[12.5rem]">
                    <ServiceOrderCta
                      presentation={{
                        ...presentation,
                        ctaDesign: 'pill-accent',
                      }}
                      fullWidth
                      labelOverride={!hasPrice ? SERVICES_CUSTOM_QUOTE_CTA_LABEL : undefined}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </ServicesCardForeground>
    </article>
  );
}

/**
 * Média checklist — image left; right: large regular title, checked tasks,
 * divider, Get started CTA. Nothing else.
 */
function EditorialServiceMediaChecklistCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const mediaPresentation = resolveServicesMediaCardPresentation(presentation);
  const shellClass = servicesTierShellClass(mediaPresentation.cardDesign, tone, mediaPresentation);
  const frameClass = servicesCardFrameClass(mediaPresentation);
  const surfaceStyle = servicesMediaCardSurfaceStyle(mediaPresentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(mediaPresentation);
  const accent = resolveServicesPrincipalColor(presentation);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const serviceTasks = resolveServiceTasks(service);
  const coverSrc =
    resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl?.trim() || '';

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    titleColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const titleBaseStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const { fontSize: _titleFontSize, fontWeight: _titleFontWeight, ...titleStyleRest } =
    titleBaseStyle as CSSProperties & { fontSize?: unknown; fontWeight?: unknown };
  const titleStyle: CSSProperties = {
    ...titleStyleRest,
    fontWeight: 400,
    fontSize: 'clamp(2.35rem, 6vw, 4.75rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.04em',
  };
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);

  const dividerColor = `color-mix(in srgb, ${accent} 14%, #e5e5e5)`;
  const checklistPresentation = {
    ...presentation,
    servicesTaskBulletStyle: 'check' as const,
    servicesTaskBulletSource: 'section' as const,
  };
  const mediaOnLeft = servicesMediaOnLeft(presentation, cardIndex);
  const mediaOrderClass = mediaOnLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2';
  const infoOrderClass = mediaOnLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1';
  const splitGridClass = mediaOnLeft
    ? 'lg:grid-cols-[minmax(12rem,0.95fr)_minmax(0,1.2fr)]'
    : 'lg:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.95fr)]';

  const mediaColumn = (
        <div
          className={`relative min-h-[20rem] w-full overflow-hidden sm:min-h-[24rem] lg:min-h-full lg:self-stretch ${mediaOrderClass}`}
        >
          {coverSrc ? (
            <PortfolioDeferredMedia
              src={coverSrc}
              alt={service.title}
              className="h-full w-full min-h-[20rem] sm:min-h-[24rem] lg:absolute lg:inset-0 lg:min-h-0"
              objectFit="cover"
              eager={cardIndex < 2}
            />
          ) : (
            <div
              className="flex h-full min-h-[20rem] w-full items-center justify-center sm:min-h-[24rem] lg:absolute lg:inset-0 lg:min-h-0"
              style={{
                background: `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, #111) 100%)`,
              }}
              aria-hidden
            >
              <MediaCardLayersIcon className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>
  );

  const infoColumn = (
        <div
          className={`flex min-w-0 flex-col px-5 py-8 sm:px-7 sm:py-10 lg:px-9 lg:py-12 ${infoOrderClass}`}
        >
          <h3 className="font-normal" style={titleStyle}>
            {service.title}
          </h3>

          {serviceTasks.length > 0 ? (
            <div className="mt-8 sm:mt-10">
              <ServicesTaskList
                tasks={serviceTasks}
                presentation={checklistPresentation}
                listClassName="space-y-3"
                textStyle={tasksStyle}
                bulletColorOverride={accent}
              />
            </div>
          ) : null}

          <div className="mt-auto flex w-full flex-col gap-5 pt-10 sm:pt-12">
            <div className="h-px w-full" style={{ backgroundColor: dividerColor }} aria-hidden />
            <div className="w-full sm:w-auto sm:self-start sm:min-w-[11rem]">
              <ServiceOrderCta
                presentation={{
                  ...presentation,
                  showServiceCta: true,
                  ctaDesign: 'pill-accent',
                  ctaLabel: presentation.ctaLabel?.trim() || 'Get started',
                }}
                fullWidth
              />
            </div>
          </div>
        </div>
  );

  return (
    <article
      className={`${shellClass} ${frameClass} !p-0 flex h-full min-h-[22rem] w-full flex-col overflow-hidden sm:min-h-[26rem] lg:min-h-[30rem]`}
      style={servicesCardPrincipalStyle(presentation, surfaceStyle)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`grid min-h-0 flex-1 grid-cols-1 lg:items-stretch ${splitGridClass}`}
      >
        {mediaColumn}
        {infoColumn}
      </ServicesCardForeground>
    </article>
  );
}

/**
 * Média split — cover banner on top; below: title + description left,
 * checked tasks + price / delivery right (vertical divider between columns).
 */
function EditorialServiceMediaSplitCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, isFree, amount } = resolveServicePrice(service);
  const mediaPresentation = resolveServicesMediaCardPresentation(presentation);
  const shellClass = servicesTierShellClass(mediaPresentation.cardDesign, tone, mediaPresentation);
  const frameClass = servicesCardFrameClass(mediaPresentation);
  const surfaceStyle = servicesMediaCardSurfaceStyle(mediaPresentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(mediaPresentation);
  const accent = resolveServicesPrincipalColor(presentation);
  const currencySymbol = servicesCurrencySymbol(presentation.servicesCurrency);
  const pricePrefix = resolveServicePricePrefix(presentation);
  const currencyPlacement = resolveServiceCurrencyPlacement(presentation.serviceCurrencyPlacement);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const chromes = presentation.elementChromes ?? DEFAULT_SERVICES_ELEMENT_CHROMES;
  const description = service.description?.trim() || '';
  const serviceTasks = resolveServiceTasks(service);
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const coverSrc =
    resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl?.trim() || '';

  const colorMode =
    presentation.useHeroPalette === false
      ? presentation.activeColorMode === 'light'
        ? 'light'
        : 'dark'
      : 'light';
  const titleColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardTitle.colorDark || elementStyles.cardTitle.color
      : elementStyles.cardTitle.color;
  const bodyColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.cardBody.colorDark || elementStyles.cardBody.color
      : elementStyles.cardBody.color;
  const priceColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.price.colorDark || elementStyles.price.color
      : elementStyles.price.color;
  const tasksColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.tasks.colorDark || elementStyles.tasks.color
      : elementStyles.tasks.color;
  const usePairAbInk =
    pickServicesCardTextContrast(presentation.cardTextContrast, 'auto') === 'pair-ab';
  const readingSurface = resolveServicesCardSurfaceHex(presentation, tone);
  const surfaceIsDark = servicesColorLuminance(readingSurface) < 0.45;
  const cardInk = servicesCardReadableText(
    presentation,
    tone,
    titleColor,
    bodyColor,
    readingSurface
  );
  const priceInk = servicesCardReadableText(
    presentation,
    tone,
    priceColor,
    priceColor,
    readingSurface
  );
  const tasksInk = servicesCardReadableText(
    presentation,
    tone,
    tasksColor,
    tasksColor,
    readingSurface
  );
  const titleStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardTitle, colorMode), color: cardInk.strong }
    : elementTextInlineStyle(elementStyles.cardTitle, colorMode);
  const bodyStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.cardBody, colorMode), color: cardInk.muted }
    : elementTextInlineStyle(elementStyles.cardBody, colorMode);
  const priceStyle = servicePriceTextStyle(
    usePairAbInk
      ? { ...elementTextInlineStyle(elementStyles.price, colorMode), color: priceInk.strong }
      : elementTextInlineStyle(elementStyles.price, colorMode)
  );
  const tasksStyle = usePairAbInk
    ? { ...elementTextInlineStyle(elementStyles.tasks, colorMode), color: tasksInk.muted }
    : elementTextInlineStyle(elementStyles.tasks, colorMode);

  const dividerColor = surfaceIsDark
    ? `color-mix(in srgb, ${accent} 18%, #3f3f46)`
    : `color-mix(in srgb, ${accent} 12%, #e5e5e5)`;

  const showTitle = presentation.showServiceTitle !== false;
  const showDescription = presentation.showServiceDescription !== false && Boolean(description);
  const showTasks = presentation.showServiceTasks !== false && serviceTasks.length > 0;
  const showPrice = presentation.showServicePrice !== false;
  const showDelivery = presentation.showServiceDelivery !== false && Boolean(deliveryLabel);
  const showMeta = showPrice || showDelivery;

  return (
    <article
      className={`${shellClass} ${frameClass} !p-0 flex h-full w-full flex-col overflow-hidden`}
      style={servicesCardPrincipalStyle(presentation, surfaceStyle)}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex min-h-0 flex-1 flex-col">
        <div className="relative aspect-[2.35/1] w-full min-h-[11rem] overflow-hidden sm:min-h-[13rem]">
          {coverSrc ? (
            <PortfolioDeferredMedia
              src={coverSrc}
              alt={service.title}
              className="absolute inset-0 h-full w-full"
              objectFit="cover"
              eager={cardIndex < 2}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 55%, #111) 100%)`,
              }}
              aria-hidden
            >
              <MediaCardLayersIcon className="h-12 w-12 text-white/80" />
            </div>
          )}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col px-6 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
            {showTitle ? (
              <div
                className={servicesElementChromeClass(chromes.cardTitle)}
                style={servicesElementChromeStyle(chromes.cardTitle, accent)}
              >
                <h3
                  className={`font-serif leading-tight tracking-[-0.03em] ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
                  style={titleStyle}
                >
                  {service.title}
                </h3>
              </div>
            ) : null}

            {showDescription ? (
              <div
                className={`mt-4 ${servicesElementChromeClass(chromes.cardBody)}`.trim()}
                style={servicesElementChromeStyle(chromes.cardBody, accent)}
              >
                <p
                  className={`max-w-xl leading-relaxed ${elementTextStyleClass(elementStyles.cardBody, 'body')}`}
                  style={bodyStyle}
                >
                  {description}
                </p>
              </div>
            ) : null}
          </div>

          <div
            className="flex min-w-0 flex-col px-6 py-7 sm:px-8 sm:py-8 lg:border-l lg:px-9 lg:py-9"
            style={{ borderColor: dividerColor }}
          >
            {showTasks ? (
              <ul
                className={`w-full ${servicesElementChromeClass(chromes.tasks)}`.trim()}
                style={servicesElementChromeStyle(chromes.tasks, accent)}
              >
                {serviceTasks.map((task, index) => (
                  <li
                    key={`${index}-${task}`}
                    className="flex items-start gap-3 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0"
                    style={{ borderColor: dividerColor }}
                  >
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px]"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    >
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                    <span
                      className={`min-w-0 leading-snug ${elementTextStyleClass(elementStyles.tasks, 'body')}`}
                      style={tasksStyle}
                    >
                      {task}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {showMeta ? (
              <div
                className={`mt-auto flex w-full items-center gap-5 border-t pt-5 ${showTasks ? 'mt-6' : ''} ${servicesElementChromeClass(chromes.price)}`.trim()}
                style={{
                  ...servicesElementChromeStyle(chromes.price, accent),
                  borderColor: dividerColor,
                }}
              >
                {showPrice ? (
                  <div className="min-w-0" style={priceStyle}>
                    {hasPrice && amount ? (
                      <ServicePriceAmount
                        amount={amount}
                        currencySymbol={currencySymbol}
                        pricePrefix={pricePrefix}
                        currencyPlacement={currencyPlacement}
                        isFree={isFree}
                      />
                    ) : (
                      <span className="font-semibold tracking-tight">Custom quote</span>
                    )}
                  </div>
                ) : null}
                {showPrice && showDelivery ? (
                  <div
                    className="h-6 w-px shrink-0"
                    style={{ backgroundColor: dividerColor }}
                    aria-hidden
                  />
                ) : null}
                {showDelivery ? (
                  <p className="min-w-0 font-semibold tracking-tight" style={priceStyle}>
                    {deliveryLabel}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </ServicesCardForeground>
    </article>
  );
}

function MediaCardLayersIcon({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5L3.75 8 12 12.5 20.25 8 12 3.5z"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinejoin="round"
      />
      <path
        d="M3.75 12L12 16.5 20.25 12"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 16L12 20.5 20.25 16"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MediaCardClockIcon({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="9.25" stroke="currentColor" strokeWidth={1.7} />
      <path
        d="M16 11.2V16l3.4 2.2"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderServiceGalleryItem(
  service: ProfileServiceItem,
  presentation: PortfolioServicesPresentationSettings,
  index: number,
  tone: EditorialMarqueeCardTone
) {
  switch (presentation.servicesGalleryLayout) {
    case 'list':
      return (
        <EditorialServiceListRow
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'commercial-list':
      return (
        <EditorialServiceCommercialRow
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'pricing-hero':
      return (
        <EditorialServicePricingHeroCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'tier':
      return (
        <EditorialServiceTierCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'plan':
      return (
        <EditorialServicePlanCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'plan-split':
      return (
        <EditorialServicePlanSplitCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'card-media':
      return (
        <EditorialServiceMediaCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'media-banner':
      return (
        <EditorialServiceMediaBannerCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'media-checklist':
      return (
        <EditorialServiceMediaChecklistCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'media-split':
      return (
        <EditorialServiceMediaSplitCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    default:
      return (
        <EditorialServiceCard
          key={service.id}
          service={service}
          tone={tone}
          presentation={presentation}
          cardIndex={index}
        />
      );
  }
}

function renderSkillGalleryItem(
  skill: PortfolioSkillRef,
  presentation: PortfolioServicesPresentationSettings,
  index: number,
  tone: EditorialMarqueeCardTone,
  variant: 'default' | 'deck' = 'default',
  isDeckFront = true
) {
  const skillKey = resolveSkillName(skill);
  if (variant === 'deck') {
    return (
      <EditorialSkillCard
        key={skillKey}
        skill={skill}
        tone={tone}
        presentation={presentation}
        cardIndex={index}
        variant="deck"
        isDeckFront={isDeckFront}
      />
    );
  }
  switch (presentation.skillsGalleryLayout) {
    case 'list':
      return (
        <EditorialSkillListRow
          key={skillKey}
          skill={skill}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'pricing-hero':
      return (
        <EditorialSkillPricingHeroCard
          key={skillKey}
          skill={skill}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    default:
      return (
        <EditorialSkillCard
          key={skillKey}
          skill={skill}
          tone={tone}
          presentation={presentation}
          cardIndex={index}
        />
      );
  }
}

/** Outer stage wrapper around skills / services carousels (framed, soft, or custom chrome). */
export function EditorialMarqueeStage({
  children,
  stageDesign = 'framed',
  stageChrome,
}: {
  children: React.ReactNode;
  stageDesign?: PortfolioServicesStageDesign;
  stageChrome?: PortfolioServicesStageChromeSettings;
}) {
  const chrome: PortfolioServicesStageChromeSettings = stageChrome ?? {
    stageBackgroundEnabled: stageDesign === 'soft',
    stageBackgroundColor: '#fafafa',
    stageBackgroundOpacity: 80,
    stageBorder: stageDesign === 'framed' ? 'soft' : 'none',
    stageBorderColor: '#e5e5e5',
    stageBorderRadius: 'xl',
    stagePadding: stageDesign === 'open' || stageDesign === 'none' ? 'none' : 'md',
    stagePattern: 'none',
    stagePatternColor: '#a3a3a3',
    stagePatternOpacity: 18,
    stageCorners: 'none',
    stageMaxWidth: 'full',
  };
  const shellClass = servicesStageShellClass(stageDesign, chrome);
  if (!shellClass) return <>{children}</>;

  const corners = chrome.stageCorners ?? 'none';
  const cornerColor = chrome.stageBorderColor || '#e5e5e5';
  const showTl = corners === 'diagonal' || corners === 'all';
  const showBr = corners === 'diagonal' || corners === 'all';
  const showTr = corners === 'all';
  const showBl = corners === 'all';
  const markClass = 'pointer-events-none absolute z-[1] h-5 w-5 sm:h-6 sm:w-6';
  const widthClass = servicesCardMaxWidthShellClass(chrome.stageMaxWidth ?? 'full', 'center');

  return (
    <div className={`${shellClass} ${widthClass}`.trim()} style={servicesStageShellStyle(chrome)}>
      {showTl ? (
        <span
          aria-hidden
          className={`${markClass} left-2 top-2 border-l-2 border-t-2 sm:left-3 sm:top-3`}
          style={{ borderColor: cornerColor }}
        />
      ) : null}
      {showTr ? (
        <span
          aria-hidden
          className={`${markClass} right-2 top-2 border-r-2 border-t-2 sm:right-3 sm:top-3`}
          style={{ borderColor: cornerColor }}
        />
      ) : null}
      {showBl ? (
        <span
          aria-hidden
          className={`${markClass} bottom-2 left-2 border-b-2 border-l-2 sm:bottom-3 sm:left-3`}
          style={{ borderColor: cornerColor }}
        />
      ) : null}
      {showBr ? (
        <span
          aria-hidden
          className={`${markClass} bottom-2 right-2 border-b-2 border-r-2 sm:bottom-3 sm:right-3`}
          style={{ borderColor: cornerColor }}
        />
      ) : null}
      {children}
    </div>
  );
}

export function EditorialSkillCard({
  skill,
  tone = 'light',
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  variant = 'default',
  isDeckFront = true,
}: {
  skill: PortfolioSkillRef;
  tone?: EditorialMarqueeCardTone;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  /** Deck diagonal: exact square + icon on the right (reference ergonomics). */
  variant?: 'default' | 'deck';
  /** Deck only: rear peeks hide body copy so only the front card stays readable. */
  isDeckFront?: boolean;
}) {
  const skillName = resolveSkillName(skill);
  const description = resolveSkillDescription(skill);
  const shellClass = servicesCardShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const {
    skillTitle,
    skillBody,
    chromes,
    surfaceStyle,
    skillTitleStyle,
    skillBodyStyle,
    iconChrome,
    iconChipBg,
    logoHex,
  } = resolveSkillCardChrome(presentation, skillName, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const contentAlign = presentation.skillsContentAlignment ?? 'left';
  const contentGap = servicesCardContentGapProps(
    presentation.skillsContentGap,
    presentation.skillsContentGapPx
  );
  const iconTop = presentation.skillsIconPlacement === 'top';
  const isDeck = variant === 'deck';
  const minHeightClass = isDeck ? '' : servicesSkillCardMinHeight(presentation.cardDesign);
  // Deck: respect the Skills icon-size setting (no forced lg)
  const iconSize = presentation.skillsIconSize;
  const iconShellClass = toolsIconShellClass(iconSize);
  const iconPixelSize = toolsIconPixelSize(iconSize);
  const showDescription =
    presentation.showSkillDescription && (!isDeck || isDeckFront);
  const bullet = useSkillListBullet(presentation);

  const icon = presentation.showSkillIcon ? (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border shadow-sm ${
        isDeck ? `pf-deck-skill-icon ${iconShellClass}` : iconShellClass
      }`}
      style={iconChrome}
    >
      <CreatorToolLogo
        label={skillName}
        iconUrl={resolveSkillIconUrl(skill)}
        size={iconPixelSize}
        className="rounded-full"
        bgColor={iconChipBg}
        brandColor={logoHex ?? undefined}
      />
    </div>
  ) : null;

  if (isDeck) {
    return (
      <article
        className={`${shellClass} ${frameClass} pf-deck-skill-card flex h-full w-full flex-col`}
        style={surfaceStyle}
        {...fillAttrs}
      >
        <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
        <ServicesCardForeground
          className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
          style={contentGap.style}
        >
          <div
            className={`flex w-full ${
              iconTop ? `flex-col gap-3 ${align.container}` : `items-center gap-3.5 ${align.row}`
            }`}
          >
            {bullet ? <SkillListBullet marker={bullet} index={cardIndex} /> : null}
            {icon}
            {presentation.showSkillTitle ? (
              <div
                className={`min-w-0 ${!iconTop && contentAlign === 'left' ? 'flex-1' : ''} ${
                  iconTop ? align.text : 'text-left'
                } ${servicesElementChromeClass(chromes.skillTitle)}`.trim()}
                style={servicesElementChromeStyle(chromes.skillTitle)}
              >
                <h3
                  className={`leading-snug tracking-[-0.02em] ${elementTextStyleClass(skillTitle, 'title')}`}
                  style={skillTitleStyle}
                >
                  {skillName}
                </h3>
              </div>
            ) : null}
          </div>
          {showDescription ? (
            <div
              className={`min-h-0 flex-1 ${servicesElementChromeClass(chromes.skillBody)}`.trim()}
              style={servicesElementChromeStyle(chromes.skillBody)}
            >
              <p
                className={`line-clamp-4 leading-relaxed ${
                  iconTop ? align.text : 'text-left'
                } ${elementTextStyleClass(skillBody, 'body')}`}
                style={skillBodyStyle}
              >
                {description}
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1" aria-hidden />
          )}
        </ServicesCardForeground>
      </article>
    );
  }

  return (
    <article
      className={`${shellClass} ${frameClass} ${minHeightClass} flex h-full w-full flex-col ${align.container}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground
        className={`flex min-h-0 flex-1 flex-col ${contentGap.className}`.trim()}
        style={contentGap.style}
      >
      {presentation.showSkillIcon || presentation.showSkillTitle || bullet ? (
        <div
          className={`flex w-full ${
            iconTop ? `flex-col gap-3 ${align.container}` : `items-start gap-4 ${align.row}`
          }`}
        >
          {bullet ? <SkillListBullet marker={bullet} index={cardIndex} /> : null}
          {icon}
          {presentation.showSkillTitle ? (
            <div
              className={`min-w-0 ${iconTop ? '' : 'pt-1'} ${!iconTop && contentAlign === 'left' ? 'flex-1' : ''} ${align.text} ${servicesElementChromeClass(chromes.skillTitle)}`.trim()}
              style={servicesElementChromeStyle(chromes.skillTitle)}
            >
              <h3
                className={`leading-tight tracking-[-0.02em] ${elementTextStyleClass(skillTitle, 'title')}`}
                style={skillTitleStyle}
              >
                {skillName}
              </h3>
            </div>
          ) : null}
        </div>
      ) : null}
      {presentation.showSkillDescription ? (
        <div
          className={`min-h-0 flex-1 ${servicesElementChromeClass(chromes.skillBody)}`.trim()}
          style={servicesElementChromeStyle(chromes.skillBody)}
        >
          <p
            className={`leading-relaxed ${elementTextStyleClass(skillBody, 'body')} ${align.text}`}
            style={skillBodyStyle}
          >
            {description}
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}
      </ServicesCardForeground>
    </article>
  );
}

function expandSkillsForMarquee(
  items: PortfolioSkillRef[],
  minCount = 6
): Array<{ key: string; skill: PortfolioSkillRef }> {
  if (items.length === 0) return [];
  const cycles = Math.max(1, Math.ceil(minCount / items.length));
  const expanded: Array<{ key: string; skill: PortfolioSkillRef }> = [];
  for (let copy = 0; copy < cycles; copy += 1) {
    for (const skill of items) {
      expanded.push({
        key: `${resolveSkillName(skill)}-marquee-${copy}-${expanded.length}`,
        skill,
      });
    }
  }
  return expanded;
}

function SkillsMarqueeTrack({
  skills,
  startIndex = 0,
  ariaHidden = false,
  presentation = DEFAULT_SERVICES_PRESENTATION,
}: {
  skills: Array<{ key: string; skill: PortfolioSkillRef }>;
  startIndex?: number;
  ariaHidden?: boolean;
  presentation?: PortfolioServicesPresentationSettings;
}) {
  const widthClass = servicesCardWidthClass(presentation.displayMode);
  return (
    <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden={ariaHidden}>
      {skills.map((item, index) => (
        <div key={`${item.key}-${startIndex}`} className={widthClass}>
          {renderSkillGalleryItem(
            item.skill,
            presentation,
            startIndex + index,
            resolveServicesCardTone(
              startIndex + index,
              presentation.cardBackgroundAlternation,
              0
            )
          )}
        </div>
      ))}
    </div>
  );
}


function ToolInspectorSkillsGallery({
  skills,
  presentation,
}: {
  skills: PortfolioSkillRef[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inspectorId = useId();
  const inspectorTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const safeIndex = Math.min(selectedIndex, Math.max(0, skills.length - 1));
  const active = skills[safeIndex];
  const railPlacement = presentation.skillsInspectorRailPlacement ?? 'left';
  const railIsTop = railPlacement === 'top';
  const railFrameEnabled = presentation.skillsInspectorRailFrameEnabled !== false;
  const accent = presentation.cardAccentColor?.trim() || DEFAULT_SERVICES_ACCENT_COLOR;
  const contentGap = servicesCardContentGapProps(
    presentation.skillsContentGap,
    presentation.skillsContentGapPx
  );
  const chrome = active
    ? resolveSkillCardChrome(presentation, resolveSkillName(active))
    : null;
  const surface = chrome?.surfaceHex ?? resolveServicesCardSurfaceHex(presentation);
  const borderColor =
    presentation.cardBorder === 'none'
      ? 'transparent'
      : presentation.cardBorder === 'accent'
        ? accent
        : `color-mix(in srgb, ${presentation.cardBorderColor} ${presentation.cardBorderOpacity ?? 100}%, transparent)`;
  const inspectorFrameBorderWidth = presentation.cardBorder === 'none' ? 0 : undefined;

  if (!active || !chrome) return null;

  const skillName = resolveSkillName(active);
  const description = resolveSkillDescription(active);
  const levelLabel = resolveSkillLevelLabel(active);
  const categoryLabel = resolveSkillCategory(active);
  const useCases = resolveSkillUseCases(active);
  const experienceLabel = resolveSkillExperienceLabel(active);
  const iconPx = toolsIconPixelSize(presentation.skillsIconSize);
  const surfaceLuminance = servicesColorLuminance(surface);
  const contrastRatio = (foreground: string) => {
    const foregroundLuminance = servicesColorLuminance(foreground);
    const lighter = Math.max(foregroundLuminance, surfaceLuminance);
    const darker = Math.min(foregroundLuminance, surfaceLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  };
  const fallbackStrong = surfaceLuminance < 0.42 ? '#f8fafc' : '#111827';
  const fallbackMuted = surfaceLuminance < 0.42 ? '#a8b1c2' : '#526071';
  const strongInk =
    contrastRatio(chrome.cardInk.strong) >= 4.5 ? chrome.cardInk.strong : fallbackStrong;
  const mutedInk =
    contrastRatio(chrome.cardInk.muted) >= 4.5 ? chrome.cardInk.muted : fallbackMuted;
  const readableAccent = contrastRatio(accent) >= 4.5 ? accent : strongInk;
  const activeSurface = contrastRatio(accent) >= 1.5 ? accent : readableAccent;
  const softBorder = `color-mix(in srgb, ${strongInk} 14%, transparent)`;
  const quietSurface = `color-mix(in srgb, ${strongInk} 5%, ${surface})`;
  const activeLogoInk =
    servicesColorLuminance(activeSurface) > 0.52 ? '#111827' : '#ffffff';
  const inspectorIconChrome = servicesSkillIconChromeStyle(presentation);
  const iconBackgroundEnabled = presentation.skillsIconBackgroundEnabled !== false;
  const iconBackgroundManual = presentation.skillsIconBackgroundManual === true;
  const iconBorderEnabled = presentation.skillsIconBorderEnabled !== false;
  const iconBorderManual = presentation.skillsIconBorderManual === true;
  const inspectorCardShellClass = servicesCardShellClass(
    presentation.cardDesign,
    'light',
    presentation
  );
  const inspectorCardFrameClass = servicesCardFrameClass(presentation);

  const metaParts: string[] = [];
  if (presentation.showSkillLevel !== false) {
    if (levelLabel) metaParts.push(`LEVEL : ${levelLabel}`);
    if (categoryLabel) metaParts.push(categoryLabel.toUpperCase());
  }

  const rail = (
    <div
      className={`flex shrink-0 gap-3 overflow-x-auto ${
        railFrameEnabled ? 'rounded-2xl border p-3 md:p-4' : 'border border-transparent p-0'
      } ${
        railIsTop
          ? 'w-full flex-row items-center'
          : 'md:min-h-[23rem] md:w-20 md:flex-col md:items-center md:overflow-visible'
      }`}
      style={{
        backgroundColor: railFrameEnabled ? surface : 'transparent',
        borderColor: railFrameEnabled ? borderColor : 'transparent',
        borderWidth: railFrameEnabled ? inspectorFrameBorderWidth : 0,
        gap: `${clampSkillsInspectorIconGapPx(presentation.skillsInspectorIconGapPx, 12)}px`,
      }}
      role="tablist"
      aria-label="Technologies"
      onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
        const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
        const backward = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
        if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return;
        event.preventDefault();
        const nextIndex =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? skills.length - 1
              : forward
                ? (safeIndex + 1) % skills.length
                : (safeIndex - 1 + skills.length) % skills.length;
        setSelectedIndex(nextIndex);
        requestAnimationFrame(() => inspectorTabRefs.current[nextIndex]?.focus());
      }}
    >
      {skills.map((skill, index) => {
        const name = resolveSkillName(skill);
        const activeItem = index === safeIndex;
        return (
          <button
            key={`${name}-${index}`}
            type="button"
            role="tab"
            id={`${inspectorId}-tab-${index}`}
            aria-controls={`${inspectorId}-panel`}
            aria-selected={activeItem}
            tabIndex={activeItem ? 0 : -1}
            ref={(node) => {
              inspectorTabRefs.current[index] = node;
            }}
            onClick={() => setSelectedIndex(index)}
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              activeItem
                ? ''
                : 'opacity-80 hover:-translate-y-0.5 hover:opacity-100'
            }`}
            style={{
              ...inspectorIconChrome,
              backgroundColor: !iconBackgroundEnabled
                ? 'transparent'
                : iconBackgroundManual
                  ? presentation.skillsIconBackgroundColor
                  : activeItem
                    ? activeSurface
                    : quietSurface,
              borderColor: !iconBorderEnabled
                ? 'transparent'
                : iconBorderManual
                  ? presentation.skillsIconBorderColor
                  : activeItem
                    ? activeSurface
                    : softBorder,
              ['--tw-ring-color' as string]: readableAccent,
              ['--tw-ring-offset-color' as string]: surface,
            }}
            aria-label={name}
          >
            <CreatorToolLogo
              label={name}
              iconUrl={resolveSkillIconUrl(skill)}
              size={Math.max(20, iconPx - 6)}
              className="rounded-lg"
              bgColor={
                !iconBackgroundEnabled
                  ? surface
                  : iconBackgroundManual
                    ? presentation.skillsIconBackgroundColor
                    : activeItem
                      ? activeSurface
                      : surface
              }
              brandColor={activeItem ? activeLogoInk : undefined}
            />
            {activeItem ? (
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2"
                style={{ backgroundColor: readableAccent, borderColor: surface }}
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
      {!railIsTop && railFrameEnabled ? (
        <span
          className="hidden h-px w-full md:mt-auto md:block"
          style={{ backgroundColor: softBorder }}
          aria-hidden
        />
      ) : null}
    </div>
  );

  const detail = (
    <div
      id={`${inspectorId}-panel`}
      role="tabpanel"
      aria-labelledby={`${inspectorId}-tab-${safeIndex}`}
      tabIndex={0}
      className={`relative min-h-[23rem] min-w-0 flex-1 overflow-hidden ${inspectorCardShellClass} ${inspectorCardFrameClass}`}
      style={{
        ...chrome.surfaceStyle,
        borderWidth: inspectorFrameBorderWidth,
        borderColor,
      }}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={safeIndex} />
      <ServicesCardForeground className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start gap-4 sm:gap-5">
        {presentation.showSkillIcon !== false ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
            style={{
              ...inspectorIconChrome,
              backgroundColor: !iconBackgroundEnabled
                ? 'transparent'
                : iconBackgroundManual
                  ? presentation.skillsIconBackgroundColor
                  : `color-mix(in srgb, ${accent} 14%, ${surface})`,
              borderColor: !iconBorderEnabled
                ? 'transparent'
                : iconBorderManual
                  ? presentation.skillsIconBorderColor
                  : `color-mix(in srgb, ${accent} 45%, transparent)`,
            }}
          >
            <CreatorToolLogo
              label={skillName}
              iconUrl={resolveSkillIconUrl(active)}
              size={Math.min(24, iconPx)}
              className="rounded-md"
              bgColor={
                iconBackgroundEnabled && iconBackgroundManual
                  ? presentation.skillsIconBackgroundColor
                  : surface
              }
              brandColor={chrome.logoHex ?? undefined}
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          {presentation.showSkillTitle !== false ? (
            <h3
              className="text-xl font-extrabold tracking-[-0.025em] sm:text-2xl"
              style={{ ...chrome.skillTitleStyle, color: strongInk }}
            >
              {skillName}
            </h3>
          ) : null}
          {metaParts.length > 0 ? (
            <p
              className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em]"
              style={{ color: readableAccent }}
            >
              {metaParts.join(' / ')}
            </p>
          ) : null}
        </div>
      </div>

      {presentation.showSkillDescription !== false ? (
        <p
          className="mt-4 max-w-3xl text-sm leading-7 sm:text-[0.95rem]"
          style={{ ...chrome.skillBodyStyle, color: mutedInk }}
        >
          {description}
        </p>
      ) : null}

      {(presentation.showSkillUseCases !== false && useCases.length > 0) ||
      (presentation.showSkillExperience !== false && experienceLabel) ? (
        <div
          className="my-6 h-px w-full"
          style={{ backgroundColor: softBorder }}
        />
      ) : null}

      {presentation.showSkillUseCases !== false && useCases.length > 0 ? (
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: mutedInk }}
          >
            Cas d&apos;usage pratiques
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {useCases.map((useCase) => (
              <span
                key={useCase}
                className="inline-flex rounded-lg border px-3 py-1.5 text-xs font-medium"
                style={{
                  color: strongInk,
                  borderColor: softBorder,
                  backgroundColor: quietSurface,
                }}
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {presentation.showSkillExperience !== false && experienceLabel ? (
        <div
          className="mt-auto flex items-center gap-2 border-t pt-5 text-xs sm:text-sm"
          style={{ borderColor: softBorder, color: mutedInk }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
          </svg>
          <span>Experience: {experienceLabel}</span>
        </div>
      ) : null}
      </ServicesCardForeground>
    </div>
  );

  const inspector = (
    <div
      className={`flex min-w-0 flex-col md:items-stretch ${contentGap.className || 'gap-5'} ${
        railIsTop
          ? ''
          : railPlacement === 'right'
            ? 'md:flex-row-reverse'
            : 'md:flex-row'
      }`}
      style={contentGap.style}
    >
      {rail}
      {detail}
    </div>
  );
  const illustrationVariant = presentation.skillsInspectorIllustrationVariant ?? 'none';
  const illustrationPlacement = presentation.skillsInspectorIllustrationPlacement ?? 'right';
  const widthClass = skillsInspectorMaxWidthShellClass(
    presentation.cardMaxWidth,
    presentation.cardAlignment
  );

  return (
    <div className={widthClass}>
      {illustrationVariant === 'none' ? (
        inspector
      ) : (
        <div
          className={`grid w-full gap-8 lg:items-center ${
            illustrationPlacement === 'left'
              ? 'lg:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)]'
              : 'lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.32fr)]'
          }`}
          style={{
            ['--faq-accent' as string]: readableAccent,
            ['--faq-ink' as string]: strongInk,
            ['--faq-surface' as string]: surface,
          }}
        >
          {illustrationPlacement === 'left' ? (
            <>
              <FaqSectionIllustration variant={illustrationVariant} />
              {inspector}
            </>
          ) : (
            <>
              {inspector}
              <FaqSectionIllustration variant={illustrationVariant} />
            </>
          )}
        </div>
      )}
    </div>
  );
}


export function EditorialSkillsGallery({
  skills,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  skills: PortfolioSkillRef[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const items = useMemo(() => {
    const seen = new Set<string>();
    const result: PortfolioSkillRef[] = [];
    for (const skill of skills) {
      const name = resolveSkillName(skill).trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      result.push(typeof skill === 'string' ? name : skill);
    }
    return result;
  }, [skills]);
  const { viewportRef: skillsMarqueeViewportRef, minCount: skillsMarqueeMinCount } =
    useMarqueeTrackMinCount(items.length, 400);
  const trackSkills = useMemo(
    () => expandSkillsForMarquee(items, skillsMarqueeMinCount),
    [items, skillsMarqueeMinCount]
  );
  const blockPresentation = resolveServicesBlockPresentation(presentation, 'skills');
  const layout = blockPresentation.skillsGalleryLayout;
  const canCoverflow =
    servicesGallerySupportsCoverflow(layout) &&
    blockPresentation.displayMode === 'coverflow' &&
    items.length > 1;
  const canDeck = blockPresentation.displayMode === 'deck' && items.length > 1;
  const canMarquee =
    servicesGallerySupportsMarquee(layout) &&
    blockPresentation.displayMode === 'marquee' &&
    items.length > 1;

  if (items.length === 0) return null;

  if (layout === 'tool-inspector') {
    return (
      <ToolInspectorSkillsGallery
        skills={items}
        presentation={blockPresentation}
      />
    );
  }

  if (layout === 'pill-cloud') {
    return (
      <ul
        className="m-0 flex w-full list-none flex-wrap items-center justify-center gap-2.5 p-0 sm:gap-3"
        aria-label="Skills and tools"
      >
        {items.map((skill) => {
          const skillName = resolveSkillName(skill);
          const chrome = resolveSkillCardChrome(blockPresentation, skillName);
          const accentColor = resolveSkillPillDotColor({
            brandColor: chrome.brandHex,
            logoColor: chrome.logoHex,
            accentColor: blockPresentation.cardAccentColor,
            surfaceColor: chrome.surfaceHex,
          });
          const accentNeedsContrastRing =
            skillPillDotContrastRatio(accentColor, chrome.surfaceHex) < 2;
          const contrastRingColor =
            servicesColorLuminance(chrome.surfaceHex) > 0.5 ? '#111827' : '#f9fafb';
          const rawBorderColor =
            blockPresentation.cardBorder === 'accent'
              ? blockPresentation.cardAccentColor
              : blockPresentation.cardBorderColor;
          const borderColor =
            blockPresentation.cardBorder === 'none'
              ? 'transparent'
              : `color-mix(in srgb, ${rawBorderColor} ${blockPresentation.cardBorderOpacity}%, transparent)`;

          return (
            <li
              key={skillName}
              className="inline-flex min-h-10 max-w-full items-center gap-2.5 rounded-full border px-4 py-2"
              style={{
                backgroundColor: chrome.surfaceHex,
                borderColor,
                color: chrome.skillTitleStyle.color,
              }}
              aria-label={blockPresentation.showSkillTitle ? undefined : skillName}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: accentNeedsContrastRing
                    ? `0 0 0 1px ${contrastRingColor}`
                    : undefined,
                }}
                aria-hidden
              />
              {blockPresentation.showSkillTitle ? (
                <span
                  className="truncate text-sm font-semibold leading-none"
                  style={chrome.skillTitleStyle}
                >
                  {skillName}
                </span>
              ) : null}
              <span
                className="h-1 w-1 shrink-0 rounded-full bg-current opacity-30"
                aria-hidden
              />
            </li>
          );
        })}
      </ul>
    );
  }

  if (layout === 'icon-stack') {
    const iconPx = toolsIconPixelSize(blockPresentation.skillsIconSize);
    const iconChrome = servicesSkillIconChromeStyle(blockPresentation);
    const surface =
      typeof iconChrome.backgroundColor === 'string'
        ? iconChrome.backgroundColor
        : blockPresentation.cardBackgroundColor;
    const border =
      typeof iconChrome.borderColor === 'string'
        ? iconChrome.borderColor
        : blockPresentation.cardBorderColor;
    const borderWidth =
      typeof iconChrome.borderWidth === 'number' ? iconChrome.borderWidth : 0;
    return (
      <div className="flex w-full flex-wrap items-center">
        <PortfolioToolsStackedIcons
          tools={items.map((skill) => resolveSkillName(skill))}
          toolIcons={Object.fromEntries(
            items
              .map((skill) => {
                const name = resolveSkillName(skill);
                const icon = resolveSkillIconUrl(skill);
                return icon ? ([name, icon] as const) : null;
              })
              .filter((entry): entry is readonly [string, string] => entry != null)
          )}
          sizePx={iconPx + 12}
          borderColor={border}
          borderWidth={borderWidth}
          borderRadius={iconChrome.borderRadius}
          shellBackground={surface}
        />
      </div>
    );
  }

  if (canCoverflow) {
    const coverPresentation = {
      ...blockPresentation,
      skillsGalleryLayout: 'card' as const,
    };
    return (
      <PortfolioServicesCoverflow
        itemCount={items.length}
        presentation={coverPresentation}
        label="Skills coverflow"
        renderItem={(index) =>
          renderSkillGalleryItem(
            items[index],
            coverPresentation,
            index,
            resolveServicesCardTone(index, coverPresentation.cardBackgroundAlternation, 0)
          )
        }
      />
    );
  }

  if (canDeck) {
    const deckPresentation = {
      ...blockPresentation,
      skillsGalleryLayout: 'card' as const,
    };
    return (
      <PortfolioServicesDeck
        itemCount={items.length}
        presentation={deckPresentation}
        label="Skills deck"
        renderItem={(index, isFront) =>
          renderSkillGalleryItem(
            items[index],
            deckPresentation,
            index,
            resolveServicesCardTone(index, deckPresentation.cardBackgroundAlternation, 0),
            'deck',
            isFront
          )
        }
      />
    );
  }

  if (!canMarquee) {
    const containerClass = servicesGalleryContainerClass(
      layout,
      blockPresentation.displayMode === 'coverflow' || blockPresentation.displayMode === 'deck'
        ? 'stack'
        : blockPresentation.displayMode,
      'skills',
      blockPresentation.skillsColumns
    );
    const widthShell =
      blockPresentation.displayMode === 'stack' ||
      blockPresentation.displayMode === 'coverflow' ||
      blockPresentation.displayMode === 'deck'
        ? servicesCardMaxWidthShellClass(blockPresentation.cardMaxWidth, blockPresentation.cardAlignment)
        : 'w-full';
    return (
      <div className={widthShell}>
        <div className={containerClass}>
          {items.map((skill, index) => (
            <PortfolioMotionItem
              key={resolveSkillName(skill)}
              profile={motionProfile}
              index={index}
              className="h-full"
            >
              {renderSkillGalleryItem(
                skill,
                blockPresentation,
                index,
                resolveServicesCardTone(index, blockPresentation.cardBackgroundAlternation, 0)
              )}
            </PortfolioMotionItem>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className={servicesCardWidthClass(blockPresentation.displayMode)}>
        {renderSkillGalleryItem(items[0], blockPresentation, 0, 'light')}
      </div>
    );
  }

  const durationSec = Math.max(28, trackSkills.length * 9);
  const marqueeDirection = blockPresentation.skillsMarqueeDirection === 'right' ? 'right' : 'left';

  return (
    <div
      ref={skillsMarqueeViewportRef}
      className="group/skills-marquee overflow-x-hidden overflow-y-visible py-2 pb-3 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
    >
      <div
        className="portfolio-skills-marquee flex w-max items-stretch will-change-transform"
        data-direction={marqueeDirection}
        style={{ animationDuration: `${durationSec}s` }}
      >
        <SkillsMarqueeTrack skills={trackSkills} startIndex={0} presentation={blockPresentation} />
        <SkillsMarqueeTrack
          skills={trackSkills}
          startIndex={trackSkills.length}
          ariaHidden
          presentation={blockPresentation}
        />
      </div>
    </div>
  );
}

export function EditorialSkillShowcase({
  skills,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  skills: PortfolioSkillRef[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const blockPresentation = resolveServicesBlockPresentation(presentation, 'skills');
  return (
    <EditorialMarqueeStage
      stageDesign={blockPresentation.stageDesign}
      stageChrome={pickServicesStageChrome(blockPresentation)}
    >
      <EditorialSkillsGallery
        skills={skills}
        presentation={blockPresentation}
        motionProfile={motionProfile}
      />
    </EditorialMarqueeStage>
  );
}

function expandServicesForMarquee(items: ProfileServiceItem[], minCount = 6): ProfileServiceItem[] {
  if (items.length === 0) return [];
  const cycles = Math.max(1, Math.ceil(minCount / items.length));
  const expanded: ProfileServiceItem[] = [];
  for (let copy = 0; copy < cycles; copy += 1) {
    for (const item of items) {
      expanded.push({ ...item, id: `${item.id}-marquee-${copy}-${expanded.length}` });
    }
  }
  return expanded;
}

function ServicesMarqueeTrack({
  services,
  sequenceCount,
  startIndex = 0,
  ariaHidden = false,
  presentation = DEFAULT_SERVICES_PRESENTATION,
}: {
  services: ProfileServiceItem[];
  sequenceCount: number;
  startIndex?: number;
  ariaHidden?: boolean;
  presentation?: PortfolioServicesPresentationSettings;
}) {
  const widthClass = servicesCardWidthClass(presentation.displayMode);
  return (
    <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden={ariaHidden}>
      {services.map((service, index) => (
        <div key={`${service.id}-${startIndex}`} className={`${widthClass} overflow-visible py-2`}>
          {renderServiceGalleryItem(
            service,
            presentation,
            (startIndex + index) % sequenceCount,
            resolveServicesCardTone(
              (startIndex + index) % sequenceCount,
              presentation.cardBackgroundAlternation,
              1
            )
          )}
        </div>
      ))}
    </div>
  );
}

export function EditorialServicesGallery({
  services,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  services: ProfileServiceItem[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const blockPresentation = resolveServicesBlockPresentation(presentation, 'services');
  const layout = blockPresentation.servicesGalleryLayout;
  const canCoverflow =
    servicesGallerySupportsCoverflow(layout) &&
    blockPresentation.displayMode === 'coverflow' &&
    services.length > 1;
  const canDeck = blockPresentation.displayMode === 'deck' && services.length > 1;
  const canMarquee =
    servicesGallerySupportsMarquee(layout) &&
    blockPresentation.displayMode === 'marquee' &&
    services.length > 1;
  const { viewportRef: servicesMarqueeViewportRef, minCount: servicesMarqueeMinCount } =
    useMarqueeTrackMinCount(services.length, 420);
  const trackServices = useMemo(() => {
    if (services.length <= 1) return services;
    return expandServicesForMarquee(services, servicesMarqueeMinCount);
  }, [services, servicesMarqueeMinCount]);

  if (services.length === 0) return null;

  if (layout === 'service-selector') {
    return (
      <PortfolioMotionItem profile={motionProfile} index={0}>
        <EditorialServiceSelector services={services} presentation={blockPresentation} />
      </PortfolioMotionItem>
    );
  }

  if (layout === 'service-accordion') {
    return (
      <PortfolioMotionItem profile={motionProfile} index={0}>
        <EditorialServiceAccordion services={services} presentation={blockPresentation} />
      </PortfolioMotionItem>
    );
  }

  if (canCoverflow) {
    const coverPresentation = {
      ...blockPresentation,
      servicesGalleryLayout: 'card' as const,
    };
    return (
      <PortfolioServicesCoverflow
        itemCount={services.length}
        presentation={coverPresentation}
        label="Services coverflow"
        renderItem={(index) =>
          renderServiceGalleryItem(
            services[index],
            coverPresentation,
            index,
            resolveServicesCardTone(index, coverPresentation.cardBackgroundAlternation, 1)
          )
        }
      />
    );
  }

  if (canDeck) {
    const deckPresentation = {
      ...blockPresentation,
      servicesGalleryLayout: 'card' as const,
    };
    return (
      <PortfolioServicesDeck
        itemCount={services.length}
        presentation={deckPresentation}
        label="Services deck"
        renderItem={(index) =>
          renderServiceGalleryItem(
            services[index],
            deckPresentation,
            index,
            resolveServicesCardTone(index, deckPresentation.cardBackgroundAlternation, 1)
          )
        }
      />
    );
  }

  if (!canMarquee) {
    const containerClass = servicesGalleryContainerClass(
      layout,
      blockPresentation.displayMode === 'coverflow' || blockPresentation.displayMode === 'deck'
        ? 'stack'
        : blockPresentation.displayMode,
      'services',
      blockPresentation.servicesColumns
    );
    const widthShell =
      layout === 'commercial-list' || layout === 'plan-split'
        ? servicesCardMaxWidthShellClass(
            blockPresentation.cardMaxWidth,
            blockPresentation.cardAlignment,
            'commercial-list'
          )
        : layout === 'media-banner' || layout === 'media-checklist' || layout === 'media-split'
          ? servicesCardMaxWidthShellClass(
              layout === 'media-banner'
                ? resolveMediaBannerCardMaxWidth(blockPresentation)
                : layout === 'media-split'
                  ? blockPresentation.cardMaxWidth === 'full' ||
                    blockPresentation.cardMaxWidth === 'xl' ||
                    blockPresentation.cardMaxWidth === 'lg' ||
                    blockPresentation.cardMaxWidth === 'md' ||
                    blockPresentation.cardMaxWidth === 'sm'
                    ? blockPresentation.cardMaxWidth
                    : 'xl'
                  : blockPresentation.cardMaxWidth === 'full' ||
                      blockPresentation.cardMaxWidth === 'xl' ||
                      blockPresentation.cardMaxWidth === 'lg' ||
                      blockPresentation.cardMaxWidth === 'md' ||
                      blockPresentation.cardMaxWidth === 'sm'
                    ? blockPresentation.cardMaxWidth
                    : 'full',
              blockPresentation.cardAlignment === 'left' ||
                blockPresentation.cardAlignment === 'right'
                ? blockPresentation.cardAlignment
                : 'center',
              'commercial-list'
            )
        : blockPresentation.displayMode === 'stack' ||
            blockPresentation.displayMode === 'coverflow' ||
            blockPresentation.displayMode === 'deck'
          ? servicesCardMaxWidthShellClass(
              blockPresentation.cardMaxWidth,
              blockPresentation.cardAlignment
            )
          : 'w-full';
    const containerStyle =
      layout === 'commercial-list'
        ? { gap: `${blockPresentation.commercialRowGapPx ?? 20}px` }
        : undefined;
    return (
      <div className={widthShell}>
        <div className={containerClass} style={containerStyle}>
          {services.map((service, index) => (
            <PortfolioMotionItem
              key={service.id}
              profile={motionProfile}
              index={index}
              className={
                layout === 'card' || layout === 'tier'
                  ? `mx-auto h-full overflow-visible py-2 ${servicesCardMaxWidthClass(blockPresentation.cardMaxWidth)}`
                  : layout === 'plan'
                    ? `mx-auto h-full overflow-visible ${servicesCardMaxWidthClass(blockPresentation.cardMaxWidth)}`
                    : layout === 'media-banner' || layout === 'media-split'
                      ? 'h-full w-full'
                      : 'h-full'
              }
            >
              {renderServiceGalleryItem(
                service,
                blockPresentation,
                index,
                resolveServicesCardTone(index, blockPresentation.cardBackgroundAlternation, 1)
              )}
            </PortfolioMotionItem>
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 1) {
    return (
      <PortfolioMotionItem profile={motionProfile} index={0} className={servicesCardWidthClass(blockPresentation.displayMode)}>
        {renderServiceGalleryItem(services[0], blockPresentation, 0, 'light')}
      </PortfolioMotionItem>
    );
  }

  const durationSec = Math.max(28, trackServices.length * 9);
  const marqueeDirection = blockPresentation.servicesMarqueeDirection === 'right' ? 'right' : 'left';

  return (
    <div
      ref={servicesMarqueeViewportRef}
      className="group/services-marquee overflow-x-hidden overflow-y-visible pb-8 pt-0 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
    >
      <div
        className="portfolio-services-marquee flex w-max items-stretch will-change-transform"
        data-direction={marqueeDirection}
        style={{ animationDuration: `${durationSec}s` }}
      >
        <ServicesMarqueeTrack
          services={trackServices}
          sequenceCount={services.length}
          startIndex={0}
          presentation={blockPresentation}
        />
        <ServicesMarqueeTrack
          services={trackServices}
          sequenceCount={services.length}
          startIndex={trackServices.length}
          ariaHidden
          presentation={blockPresentation}
        />
      </div>
    </div>
  );
}

export function EditorialServicesCarousel({
  services,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  services: ProfileServiceItem[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const blockPresentation = resolveServicesBlockPresentation(presentation, 'services');
  return (
    <EditorialMarqueeStage
      stageDesign={blockPresentation.stageDesign}
      stageChrome={pickServicesStageChrome(blockPresentation)}
    >
      <EditorialServicesGallery
        services={services}
        presentation={blockPresentation}
        motionProfile={motionProfile}
      />
    </EditorialMarqueeStage>
  );
}

function EditorialServicesBlockSubheading({
  label,
  textStyle,
}: {
  label: string;
  textStyle: PortfolioElementTextStyle;
}) {
  return (
    <p
      className={`mb-4 sm:mb-5 ${elementTextStyleClass(textStyle, 'label')}`}
      style={elementTextInlineStyle(textStyle)}
    >
      {label}
    </p>
  );
}

export function EditorialServicesSkillsSection({
  skills,
  services,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  skills: PortfolioSkillRef[];
  services: ProfileServiceItem[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const showSkillsBlock = presentation.showSkills && skills.length > 0;
  const showServicesBlock = presentation.showServices && services.length > 0;

  if (!showSkillsBlock && !showServicesBlock) return null;

  const skillsPresentation = resolveServicesBlockPresentation(presentation, 'skills');
  const servicesPresentation = resolveServicesBlockPresentation(presentation, 'services');
  const usesSplitBlocks = presentation.sectionOrganization !== 'combined';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);

  const skillsContent = showSkillsBlock ? (
    <div>
      {!usesSplitBlocks && presentation.showSkillsSubheading ? (
        <EditorialServicesBlockSubheading
          label={resolveServicesSkillsSubheadingLabel(presentation)}
          textStyle={elementStyles.blockSubheading}
        />
      ) : null}
      <EditorialSkillShowcase skills={skills} presentation={skillsPresentation} motionProfile={motionProfile} />
    </div>
  ) : null;

  const servicesContent = showServicesBlock ? (
    <div>
      {!usesSplitBlocks && presentation.showServicesSubheading ? (
        <EditorialServicesBlockSubheading
          label={resolveServicesServicesSubheadingLabel(presentation)}
          textStyle={elementStyles.blockSubheading}
        />
      ) : null}
      <EditorialServicesCarousel services={services} presentation={servicesPresentation} motionProfile={motionProfile} />
    </div>
  ) : null;

  const blockEntries = (
    presentation.stackOrder === 'services-first'
      ? [
          { key: 'services' as const, content: servicesContent },
          { key: 'skills' as const, content: skillsContent },
        ]
      : [
          { key: 'skills' as const, content: skillsContent },
          { key: 'services' as const, content: servicesContent },
        ]
  ).filter((entry) => entry.content);

  if (usesSplitBlocks) {
    return (
      <div className="flex flex-col gap-8 lg:gap-12">
        {blockEntries.map((entry) => (
          <div key={entry.key}>{entry.content}</div>
        ))}
      </div>
    );
  }

  // Combined mode: one shared stage around both galleries (raw, no per-block stage).
  return (
    <EditorialMarqueeStage
      stageDesign={presentation.stageDesign}
      stageChrome={pickServicesStageChrome(presentation)}
    >
      {blockEntries.map((entry, index) => (
        <div key={entry.key} className={index > 0 ? 'mt-6 lg:mt-8' : undefined}>
          {entry.key === 'skills' && showSkillsBlock ? (
            <div>
              {presentation.showSkillsSubheading ? (
                <EditorialServicesBlockSubheading
                  label={resolveServicesSkillsSubheadingLabel(presentation)}
                  textStyle={elementStyles.blockSubheading}
                />
              ) : null}
              <EditorialSkillsGallery
                skills={skills}
                presentation={skillsPresentation}
                motionProfile={motionProfile}
              />
            </div>
          ) : entry.key === 'services' && showServicesBlock ? (
            <div>
              {presentation.showServicesSubheading ? (
                <EditorialServicesBlockSubheading
                  label={resolveServicesServicesSubheadingLabel(presentation)}
                  textStyle={elementStyles.blockSubheading}
                />
              ) : null}
              <EditorialServicesGallery
                services={services}
                presentation={servicesPresentation}
                motionProfile={motionProfile}
              />
            </div>
          ) : null}
        </div>
      ))}
    </EditorialMarqueeStage>
  );
}

export function StoryBlock({ block }: { block: ProfileMediaBlock }) {
  return <EditorialStoryBlock block={block} />;
}

const WHY_ME_ICONS = [
  function WhyMeSparkIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.4 4.3L17.5 8l-4.1 1.5L12 14l-1.4-4.5L6.5 8l4.1-1.7L12 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 18l.8 2.4 2.4.8-2.4.8L5 24l-.8-2.4-2.4-.8 2.4-.8L5 18zM19 14l.6 1.8 1.8.6-1.8.6L19 19l-.6-1.8-1.8-.6 1.8-.6L19 14z" />
      </svg>
    );
  },
  function WhyMeCheckIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  },
  function WhyMeUsersIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  },
  function WhyMeBoltIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    );
  },
  function WhyMeTargetIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  },
] as const;

type HighlightIcon = (props: { className?: string }) => React.ReactNode;

function EditorialHighlightMediaPreview({
  block,
  className = '',
  aspectClass = 'aspect-[4/5]',
  fullBleed = false,
}: {
  block: ProfileMediaBlock;
  className?: string;
  aspectClass?: string;
  /** Edge-to-edge inside the card (grid / stacked). */
  fullBleed?: boolean;
}) {
  if (!block.mediaUrl) return null;

  if (fullBleed) {
    return (
      <div className={`relative w-full overflow-hidden bg-neutral-950/5 ${aspectClass} ${className}`.trim()}>
        <ProductThumbnailMedia
          url={block.mediaUrl}
          alt=""
          fit="cover"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full max-w-[15rem] shrink-0 overflow-hidden rounded-2xl border border-neutral-200/80 shadow-sm sm:max-w-[17rem] lg:mx-0 lg:w-[14rem] xl:w-[16rem] ${className}`.trim()}
    >
      <div className={`relative w-full overflow-hidden bg-neutral-950/5 ${aspectClass}`}>
        <ProductThumbnailMedia
          url={block.mediaUrl}
          alt=""
          fit="cover"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}

function resolveWhyMeShellPresentation(
  presentation: PortfolioAboutPresentationSettings
): PortfolioAboutPresentationSettings {
  return { ...presentation, whyMePadding: aboutWhyMeEffectivePadding(presentation) };
}

function WhyMeCardShell({
  presentation,
  cardIndex = 0,
  className = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  cardIndex?: number;
  className?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const shell = resolveWhyMeShellPresentation(presentation);
  const frameClass = aboutWhyMeFrameClass(shell, { includePadding });
  const surfaceStyle = aboutWhyMeFrameStyle(shell);
  const layers = aboutWhyMeLayersSettings(shell);

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden ${frameClass} ${aboutWhyMeBlockClass(presentation.whyMeDesign)} ${className}`.trim()}
      style={surfaceStyle}
    >
      <ServicesCardBackgroundLayers presentation={layers} cardIndex={cardIndex} />
      {/* Pack chrome + copy to the top — never pin the phrase to the card bottom. */}
      <ServicesCardForeground className="flex h-full flex-col justify-start">
        {children}
      </ServicesCardForeground>
    </article>
  );
}

function WhyMeHyperBulletGlyph({
  style,
  className = '',
  strokeWidth = 1.75,
}: {
  style: PortfolioAboutWhyMeMarkerStyle;
  className?: string;
  strokeWidth?: number;
}) {
  const cn = `shrink-0 ${className}`.trim();
  const sw = strokeWidth;
  switch (style) {
    case 'disc':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <circle cx="10" cy="10" r={sw >= 2.4 ? 6 : sw >= 2 ? 5.75 : 5.5} />
        </svg>
      );
    case 'bar-dot':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect
            x={sw >= 2.4 ? 5.5 : 6.5}
            y="2.5"
            width={sw >= 2.4 ? 9 : 7}
            height="15"
            rx="1.5"
            fill="currentColor"
          />
          <circle cx="10" cy="10" r={sw >= 2 ? 2.25 : 2} fill="white" />
        </svg>
      );
    case 'bullseye':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth={sw} />
          <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth={Math.max(1, sw - 0.2)} />
          <circle cx="10" cy="10" r={sw >= 2.4 ? 1.7 : 1.4} fill="currentColor" />
        </svg>
      );
    case 'square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
        </svg>
      );
    case 'check-square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M7 10.2l2.1 2.1 3.9-4.2"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'x-square':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="4" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth={sw} />
          <path
            d="M7.5 7.5l5 5M12.5 7.5l-5 5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
          />
        </svg>
      );
    case 'check':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4.5 10.5l3.6 3.6 7.4-8"
            stroke="currentColor"
            strokeWidth={Math.max(1.5, sw + 0.25)}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'arrow':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3.5 10h12M11.5 5.5L16.5 10l-5 4.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chevron':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M7.5 4.5L13 10l-5.5 5.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'chevron-double':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M5.5 4.5L11 10l-5.5 5.5M10 4.5L15.5 10 10 15.5"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'triangle':
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          {/* Optically centered play-triangle — tip aims at mid text line */}
          <path d="M7 4.25v11.5L16.25 10 7 4.25z" />
        </svg>
      );
    default:
      return null;
  }
}

function WhyMeIndexMarker({
  index,
  style,
  accent,
  size = 'lg',
  sizePx,
  weight = 'regular',
  weightAmount,
  className = '',
  /** Beside body text — keeps first-line centering, uses a real S→XL scale. */
  inline = false,
}: {
  index: number;
  style: PortfolioAboutWhyMeMarkerStyle;
  accent: string;
  size?: PortfolioAboutWhyMeMarkerSize;
  sizePx?: number;
  weight?: PortfolioListMarkerWeight;
  weightAmount?: number;
  className?: string;
  inline?: boolean;
}) {
  if (style === 'none') return null;

  const px = resolveListMarkerSizePx(size, sizePx, ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX);
  const amount = resolveListMarkerWeightAmount(weight, weightAmount);
  const label = formatWhyMeIndexLabel(index, style);
  if (label) {
    return (
      <span
        className={`shrink-0 tabular-nums leading-none tracking-[-0.03em] ${
          inline ? '' : size === 'sm' ? 'uppercase tracking-[0.18em]' : ''
        } ${className}`.trim()}
        style={{
          color: accent,
          opacity: size === 'sm' ? 1 : 0.9,
          fontSize: px,
          fontWeight: listMarkerFontWeightFromAmount(amount),
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`.trim()}
      style={{ color: accent, width: px, height: px }}
    >
      <WhyMeHyperBulletGlyph
        style={style}
        className="h-full w-full"
        strokeWidth={listMarkerStrokeWidth(weight, amount)}
      />
    </span>
  );
}

/** First-line alignment slot — glyph may be larger than the line and still stay centered on it. */
function WhyMeInlineMarkerSlot({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-[1lh] min-h-[1.15em] shrink-0 items-center justify-center self-start overflow-visible leading-none ${className}`.trim()}
      aria-hidden
    >
      {children}
    </span>
  );
}

function WhyMeBlockHeader({
  index,
  Icon,
  align,
  design: _design,
  accent,
  markerStyle,
  markerSize,
  markerSizePx,
  markerWeight = 'regular',
  markerWeightAmount,
  markerColor,
  showMarker,
  showHeaderAccent,
}: {
  index: number;
  Icon: HighlightIcon;
  align: ReturnType<typeof whyMeContentAlignClass>;
  design: PortfolioAboutPresentationSettings['whyMeDesign'];
  accent: string;
  markerStyle: PortfolioAboutWhyMeMarkerStyle;
  markerSize: PortfolioAboutWhyMeMarkerSize;
  markerSizePx?: number;
  markerWeight?: PortfolioListMarkerWeight;
  markerWeightAmount?: number;
  markerColor: string;
  showMarker: boolean;
  showHeaderAccent: boolean;
}) {
  const softBg = aboutSidePanelAccentSoftBackground(accent);
  const marker = showMarker ? (
    <WhyMeIndexMarker
      index={index}
      style={markerStyle}
      accent={markerColor}
      size={markerSize}
      sizePx={markerSizePx}
      weight={markerWeight}
      weightAmount={markerWeightAmount}
    />
  ) : null;

  if (!marker && !showHeaderAccent) return null;
  return (
    <div className={`flex items-center gap-3 ${align.header}`}>
      {marker}
      {showHeaderAccent ? (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-[1.03]"
          style={{ color: accent, backgroundColor: softBg }}
        >
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
    </div>
  );
}

/** Shared header + phrase layout for every Why me design (stack or inline). */
function WhyMeHeaderAndBody({
  block,
  index,
  Icon,
  align,
  design,
  accent,
  presentation,
  density,
  flushTop,
}: {
  block: ProfileMediaBlock;
  index: number;
  Icon: HighlightIcon;
  align: ReturnType<typeof whyMeContentAlignClass>;
  design: PortfolioAboutPresentationSettings['whyMeDesign'];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  density: 'editorial' | 'compact' | 'minimal';
  flushTop: boolean;
}) {
  const markerStyle = presentation.whyMeMarkerStyle ?? 'number';
  const markerSize = presentation.whyMeMarkerSize ?? 'md';
  const markerSizePx = presentation.whyMeMarkerSizePx;
  const markerWeight = presentation.whyMeMarkerWeight ?? 'regular';
  const markerWeightAmount = presentation.whyMeMarkerWeightAmount;
  const markerColor = resolveWhyMeMarkerColor(presentation);
  const showHeaderMarker = (presentation.whyMeMarkerPlacement ?? 'top') === 'top';
  const showHeaderAccent = presentation.whyMeShowHeaderAccent !== false;
  const bodyLayout = presentation.whyMeBodyLayout === 'inline' ? 'inline' : 'stack';
  const inline = bodyLayout === 'inline';

  const header = (
    <WhyMeBlockHeader
      index={index}
      Icon={Icon}
      align={align}
      design={design}
      accent={accent}
      markerStyle={markerStyle}
      markerSize={markerSize}
      markerSizePx={markerSizePx}
      markerWeight={markerWeight}
      markerWeightAmount={markerWeightAmount}
      markerColor={markerColor}
      showMarker={showHeaderMarker}
      showHeaderAccent={showHeaderAccent}
    />
  );

  const body = (
    <WhyMeBlockText
      block={block}
      align={align}
      presentation={presentation}
      accent={accent}
      density={density}
      flushTop={inline || flushTop}
    />
  );

  if (inline) {
    return (
      <div className={`flex w-full flex-row items-center gap-3 sm:gap-4 ${align.header}`}>
        <div className="shrink-0">{header}</div>
        <div className={`min-w-0 flex-1 ${align.text}`}>{body}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-0">
      {header}
      {body}
    </div>
  );
}

function WhyMeLeadingMarkerRow({
  index,
  presentation,
  children,
}: {
  index: number;
  presentation: PortfolioAboutPresentationSettings;
  accent: string;
  flushWithText?: boolean;
  children: ReactNode;
}) {
  const style = presentation.whyMeMarkerStyle ?? 'number';
  const placement = presentation.whyMeMarkerPlacement ?? 'top';
  if (placement !== 'before' || style === 'none') {
    return <>{children}</>;
  }

  const markerColor = resolveWhyMeMarkerColor(presentation);
  const markerSize = presentation.whyMeMarkerSize ?? 'md';
  const markerSizePx = presentation.whyMeMarkerSizePx;
  const markerWeight = presentation.whyMeMarkerWeight ?? 'regular';
  const markerWeightAmount = presentation.whyMeMarkerWeightAmount;
  // Inherit Why me body type size so inline em glyphs lock to the first text line.
  const bodyClass = elementTextStyleClass(presentation.elementStyles.whyMeBody, 'body');
  const bodyStyle = elementTextInlineStyle(
    presentation.elementStyles.whyMeBody,
    aboutActiveColorMode(presentation)
  );

  return (
    <div className={`flex w-full items-start gap-2.5 sm:gap-3 ${bodyClass}`} style={bodyStyle}>
      <WhyMeInlineMarkerSlot>
        <WhyMeIndexMarker
          index={index}
          style={style}
          accent={markerColor}
          size={markerSize}
          sizePx={markerSizePx}
          weight={markerWeight}
          weightAmount={markerWeightAmount}
          inline
        />
      </WhyMeInlineMarkerSlot>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function WhyMeBlockText({
  block,
  align,
  presentation,
  accent,
  density = 'editorial',
  flushTop = false,
}: {
  block: ProfileMediaBlock;
  align: ReturnType<typeof whyMeContentAlignClass>;
  presentation: PortfolioAboutPresentationSettings;
  accent: string;
  density?: 'editorial' | 'compact' | 'minimal';
  /** When header chrome is hidden, start the phrase flush with the leading puce. */
  flushTop?: boolean;
}) {
  const hasText = Boolean(block.text?.trim());
  const subtitles = (block.subtitles ?? []).map((item) => item.trim()).filter(Boolean);
  const whyMeColorMode = aboutActiveColorMode(presentation);
  const bodyClass = elementTextStyleClass(presentation.elementStyles.whyMeBody, 'body');
  const bodyStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBody, whyMeColorMode);
  const bulletClass = elementTextStyleClass(presentation.elementStyles.whyMeBullet, 'body');
  const bulletStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBullet, whyMeColorMode);
  const textGap = flushTop
    ? 'mt-0'
    : density === 'compact'
      ? 'mt-2'
      : density === 'minimal'
        ? 'mt-2'
        : 'mt-2.5';
  const listGap = flushTop
    ? hasText
      ? density === 'compact'
        ? 'mt-2.5 space-y-2'
        : 'mt-3 space-y-2.5'
      : 'mt-0 space-y-2'
    : density === 'compact'
      ? 'mt-2.5 space-y-2'
      : density === 'minimal'
        ? 'mt-2.5 space-y-2'
        : 'mt-3 space-y-2.5';
  const listMarkerStyle = presentation.whyMeMarkerStyle ?? 'number';
  const useHyperListBullet = isWhyMeHyperBulletMarker(listMarkerStyle);
  const markerColor = resolveWhyMeMarkerColor(presentation);
  const markerSize = presentation.whyMeMarkerSize ?? 'md';
  const markerSizePx = presentation.whyMeMarkerSizePx;
  const markerWeight = presentation.whyMeMarkerWeight ?? 'regular';
  const markerWeightAmount = presentation.whyMeMarkerWeightAmount;
  const resolvedSizePx = resolveListMarkerSizePx(
    markerSize,
    markerSizePx,
    ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX
  );
  const resolvedWeightAmount = resolveListMarkerWeightAmount(markerWeight, markerWeightAmount);
  const bodyCopy = block.text?.trim() ?? '';

  return (
    <>
      {hasText && bodyCopy ? (
        <p className={`${textGap} whitespace-pre-line leading-relaxed ${bodyClass} ${align.text}`} style={bodyStyle}>
          {bodyCopy}
        </p>
      ) : null}
      {subtitles.length > 0 ? (
        <ul className={`${listGap}`}>
          {subtitles.map((item, subtitleIndex) => (
            <li
              key={`${subtitleIndex}-${item.slice(0, 24)}`}
              className={`flex items-start gap-2.5 leading-relaxed ${bulletClass} ${align.text}`}
              style={bulletStyle}
            >
              {useHyperListBullet ? (
                <WhyMeInlineMarkerSlot>
                  <span
                    className="inline-flex items-center justify-center"
                    style={{ color: markerColor, width: resolvedSizePx, height: resolvedSizePx }}
                  >
                    <WhyMeHyperBulletGlyph
                      style={listMarkerStyle}
                      className="h-full w-full"
                      strokeWidth={resolvedWeightAmount}
                    />
                  </span>
                </WhyMeInlineMarkerSlot>
              ) : density === 'minimal' ? (
                <WhyMeInlineMarkerSlot>
                  <span
                    className="w-3 shrink-0"
                    style={{
                      backgroundColor: markerColor,
                      height: listMarkerDashHeightPx(resolvedWeightAmount),
                    }}
                  />
                </WhyMeInlineMarkerSlot>
              ) : (
                <WhyMeInlineMarkerSlot>
                  <span className="relative flex h-[0.85em] w-[0.85em] items-center justify-center">
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: aboutSidePanelAccentSoftBackground(markerColor) }}
                    />
                    <span
                      className="relative h-[0.35em] w-[0.35em] rounded-full"
                      style={{ backgroundColor: markerColor }}
                    />
                  </span>
                </WhyMeInlineMarkerSlot>
              )}
              <span className="min-w-0 flex-1">{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function EditorialHighlightBlock({
  block,
  index,
  icons,
  presentation,
}: {
  block: ProfileMediaBlock;
  index: number;
  icons: readonly HighlightIcon[];
  presentation: PortfolioAboutPresentationSettings;
}) {
  const accent = aboutPalettePrincipalColor(presentation);
  const hasMedia = whyMeBlockHasMedia(block, presentation.whyMeMediaPlacement);
  const mediaLayout = hasMedia
    ? resolveWhyMeMediaLayout(presentation.whyMeMediaPlacement, index)
    : 'hidden';
  const align = whyMeContentAlignClass(presentation.whyMeContentAlign);
  const Icon = icons[index % icons.length];
  const density = 'editorial' as const;
  const isCompact = false;
  const isMinimal = false;
  const showHeaderMarker = (presentation.whyMeMarkerPlacement ?? 'top') === 'top';
  const showHeaderAccent = presentation.whyMeShowHeaderAccent !== false;
  const flushTop = !showHeaderMarker && !showHeaderAccent;

  // Side-by-side row only when media is actually shown — otherwise text uses full width.
  const flexDirection = !hasMedia
    ? 'flex-col'
    : mediaLayout === 'top'
      ? 'flex-col'
      : mediaLayout === 'left'
        ? 'lg:flex-row-reverse'
        : 'lg:flex-row';

  return (
    <WhyMeCardShell presentation={presentation} cardIndex={index}>
      <div
        className={`relative flex w-full ${flexDirection} ${
          hasMedia ? `lg:items-start ${align.items}` : align.items
        } ${isCompact ? 'gap-4 lg:gap-5' : isMinimal ? 'gap-4 lg:gap-5' : 'gap-5 lg:gap-6'}`}
      >
        {mediaLayout === 'top' && hasMedia ? (
          <EditorialHighlightMediaPreview
            block={block}
            className={`max-w-none lg:mx-0 lg:w-full lg:max-w-none ${isCompact ? 'sm:max-w-xl' : ''}`}
            aspectClass={isCompact ? 'aspect-[16/9]' : 'aspect-[16/10]'}
          />
        ) : null}

        <div className={`min-w-0 w-full ${hasMedia ? 'flex-1' : ''} ${align.text}`}>
          <WhyMeLeadingMarkerRow
            index={index}
            presentation={presentation}
            accent={accent}
            flushWithText={flushTop}
          >
            <WhyMeHeaderAndBody
              block={block}
              index={index}
              Icon={Icon}
              align={align}
              design={presentation.whyMeDesign}
              accent={accent}
              presentation={presentation}
              density={density}
              flushTop={flushTop}
            />
          </WhyMeLeadingMarkerRow>
        </div>

        {hasMedia && mediaLayout !== 'top' && mediaLayout !== 'hidden' ? (
          <EditorialHighlightMediaPreview
            block={block}
            className={
              isCompact
                ? 'max-w-[11rem] sm:max-w-[13rem] lg:w-[12rem] xl:w-[13rem]'
                : isMinimal
                  ? 'max-w-[12rem] opacity-95 sm:max-w-[14rem] lg:w-[12rem] xl:w-[14rem]'
                  : ''
            }
            aspectClass={isCompact || isMinimal ? 'aspect-[3/4]' : 'aspect-[4/5]'}
          />
        ) : null}
      </div>
    </WhyMeCardShell>
  );
}

function WhyMeGridBlock({
  block,
  index,
  icons,
  presentation,
}: {
  block: ProfileMediaBlock;
  index: number;
  icons: readonly HighlightIcon[];
  presentation: PortfolioAboutPresentationSettings;
}) {
  const accent = aboutPalettePrincipalColor(presentation);
  const align = whyMeContentAlignClass(presentation.whyMeContentAlign);
  const Icon = icons[index % icons.length];
  const hasMedia = whyMeBlockHasMedia(block, presentation.whyMeMediaPlacement);
  const showHeaderMarker = (presentation.whyMeMarkerPlacement ?? 'top') === 'top';
  const showHeaderAccent = presentation.whyMeShowHeaderAccent !== false;
  const flushTop = !showHeaderMarker && !showHeaderAccent;

  return (
    <WhyMeCardShell presentation={presentation} cardIndex={index} className="h-full" includePadding={false}>
      <div className={`flex h-full w-full flex-col justify-start ${align.items}`}>
        {hasMedia ? (
          <EditorialHighlightMediaPreview block={block} fullBleed aspectClass="aspect-[4/3]" />
        ) : null}
        <div
          className={`flex min-w-0 w-full flex-col justify-start ${aboutWhyMeContentPaddingClass(presentation)} ${align.text}`}
        >
          <WhyMeLeadingMarkerRow
            index={index}
            presentation={presentation}
            accent={accent}
            flushWithText={flushTop}
          >
            <WhyMeHeaderAndBody
              block={block}
              index={index}
              Icon={Icon}
              align={align}
              design={presentation.whyMeDesign}
              accent={accent}
              presentation={presentation}
              density="compact"
              flushTop={flushTop}
            />
          </WhyMeLeadingMarkerRow>
        </div>
      </div>
    </WhyMeCardShell>
  );
}

function WhyMeStackedBlock({
  block,
  index,
  icons,
  presentation,
}: {
  block: ProfileMediaBlock;
  index: number;
  icons: readonly HighlightIcon[];
  presentation: PortfolioAboutPresentationSettings;
}) {
  const accent = aboutPalettePrincipalColor(presentation);
  const align = whyMeContentAlignClass(presentation.whyMeContentAlign);
  const Icon = icons[index % icons.length];
  const hasMedia = whyMeBlockHasMedia(block, presentation.whyMeMediaPlacement);
  const showHeaderMarker = (presentation.whyMeMarkerPlacement ?? 'top') === 'top';
  const showHeaderAccent = presentation.whyMeShowHeaderAccent !== false;
  const flushTop = !showHeaderMarker && !showHeaderAccent;

  return (
    <WhyMeCardShell presentation={presentation} cardIndex={index} includePadding={false}>
      {hasMedia ? (
        <EditorialHighlightMediaPreview
          block={block}
          fullBleed
          aspectClass="aspect-[21/9] sm:aspect-[2/1]"
        />
      ) : null}
      <div className={`w-full ${aboutWhyMeContentPaddingClass(presentation)} ${align.text}`}>
        <WhyMeLeadingMarkerRow
          index={index}
          presentation={presentation}
          accent={accent}
          flushWithText={flushTop}
        >
          <WhyMeHeaderAndBody
            block={block}
            index={index}
            Icon={Icon}
            align={align}
            design={presentation.whyMeDesign}
            accent={accent}
            presentation={presentation}
            density="editorial"
            flushTop={flushTop}
          />
        </WhyMeLeadingMarkerRow>
      </div>
    </WhyMeCardShell>
  );
}

function whyMeBlockTitle(block: ProfileMediaBlock): string {
  return block.title?.trim() || block.text?.trim()?.split('\n')[0]?.trim() || 'Argument';
}

function whyMeBlockBody(block: ProfileMediaBlock): string {
  const titled = block.title?.trim();
  const text = block.text?.trim() || '';
  if (titled && text.startsWith(titled)) {
    return text.slice(titled.length).trim() || text;
  }
  if (titled && text) return text;
  if (!titled && text.includes('\n')) {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.slice(1).join('\n') || lines[0] || '';
  }
  return text;
}

function WhyMeBentoCard({
  block,
  index,
  presentation,
  spanClass,
}: {
  block: ProfileMediaBlock;
  index: number;
  presentation: PortfolioAboutPresentationSettings;
  spanClass: string;
}) {
  const accent = aboutAccentColor(presentation.accentColor);
  const markerColor = resolveWhyMeMarkerColor(presentation);
  const Icon = WHY_ME_ICONS[index % WHY_ME_ICONS.length];
  const title = whyMeBlockTitle(block);
  const body = whyMeBlockBody(block);
  const label = formatWhyMeIndexLabel(index, presentation.whyMeMarkerStyle ?? 'number') ?? String(index + 1).padStart(2, '0');
  const bodyStyle = elementTextInlineStyle(
    presentation.elementStyles.whyMeBody,
    aboutActiveColorMode(presentation)
  );
  const isHero = index === 0;

  return (
    <article
      className={`${spanClass} group relative flex h-full min-h-[11rem] flex-col justify-between overflow-hidden rounded-2xl border p-5 transition duration-300 sm:min-h-[13rem] sm:p-6 ${
        isHero ? 'sm:min-h-[16rem]' : ''
      }`}
      style={{
        backgroundColor: presentation.whyMeBackgroundEnabled === false ? 'transparent' : presentation.whyMeBackgroundColor || '#121214',
        borderColor: 'color-mix(in srgb, currentColor 12%, transparent)',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = accent;
        event.currentTarget.style.boxShadow = `0 0 0 1px ${accent}, 0 12px 40px color-mix(in srgb, ${accent} 22%, transparent)`;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = 'color-mix(in srgb, currentColor 12%, transparent)';
        event.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`font-extrabold tabular-nums tracking-[-0.04em] ${
            isHero ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'
          }`}
          style={{ color: markerColor }}
        >
          {label}
        </span>
        {presentation.whyMeShowHeaderAccent !== false ? (
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              color: accent,
              backgroundColor: aboutSidePanelAccentSoftBackground(accent),
              animation: index === 0 ? 'pf-whyme-pulse 2.4s ease-in-out infinite' : undefined,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-6 space-y-2">
        <h4
          className={`font-bold tracking-[-0.02em] ${isHero ? 'text-xl sm:text-2xl' : 'text-lg'}`}
          style={bodyStyle}
        >
          {title}
        </h4>
        {body && body !== title ? (
          <p
            className={`leading-relaxed opacity-70 ${elementTextStyleClass(presentation.elementStyles.whyMeBody, 'body')}`}
            style={bodyStyle}
          >
            {body}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function WhyMeBentoLayout({
  blocks,
  presentation,
  motionProfile,
}: {
  blocks: ProfileMediaBlock[];
  presentation: PortfolioAboutPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
}) {
  const spanFor = (index: number) => {
    switch (index % 4) {
      case 0:
        return 'md:col-span-4';
      case 1:
        return 'md:col-span-2';
      case 2:
        return 'md:col-span-3';
      default:
        return 'md:col-span-3';
    }
  };

  return (
    <div
      className="grid w-full grid-cols-1 md:grid-cols-6"
      style={whyMeGapStyle(presentation)}
    >
      {blocks.map((block, index) => (
        <PortfolioMotionItem
          key={block.id}
          profile={motionProfile}
          index={index}
          className={`h-full w-full ${spanFor(index)}`}
        >
          <WhyMeBentoCard
            block={block}
            index={index}
            presentation={presentation}
            spanClass="h-full"
          />
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function WhyMeTimelineLayout({
  blocks,
  presentation,
  motionProfile,
}: {
  blocks: ProfileMediaBlock[];
  presentation: PortfolioAboutPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
}) {
  const accent = aboutAccentColor(presentation.accentColor);
  const markerColor = resolveWhyMeMarkerColor(presentation);
  const surfaceColor = resolveWhyMeTimelineSurfaceColor(presentation);
  const lineColor = resolveWhyMeTimelineLineColor(presentation);
  const colorMode = aboutActiveColorMode(presentation);
  const bodyStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBody, colorMode);
  const gapPx = resolveWhyMeGapPx(presentation);

  const renderMacaron = (label: string) => (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold tabular-nums"
      style={{
        borderColor: accent,
        color: markerColor,
        /* Match page/section fond so the spine is masked in light and dark. */
        backgroundColor: surfaceColor,
      }}
    >
      {label}
    </span>
  );

  const renderCopy = (title: string, body: string | null, align: 'left' | 'right' | 'center') => {
    const copyStyle: CSSProperties = { ...bodyStyle, textAlign: align, fontWeight: 600 };
    return (
      <>
        <h4
          className="text-lg font-semibold tracking-[-0.02em] sm:text-xl md:text-[1.35rem]"
          style={copyStyle}
        >
          {title}
        </h4>
        {body && body !== title ? (
          <p
            className={`mt-2 leading-relaxed opacity-70 ${elementTextStyleClass(presentation.elementStyles.whyMeBody, 'body')}`}
            style={copyStyle}
          >
            {body}
          </p>
        ) : null}
      </>
    );
  };

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-5xl overflow-x-clip">
      {/* Mobile — spine + copy centered as a compact column */}
      <ol
        className="relative m-0 mx-auto flex w-fit max-w-full list-none flex-col p-0 md:hidden"
        style={{ gap: `${gapPx}px` }}
      >
        <div
          className="pointer-events-none absolute bottom-2 top-2 w-px"
          style={{
            backgroundColor: `color-mix(in srgb, ${lineColor} 55%, transparent)`,
            left: 'calc(1.25rem - 0.5px)',
          }}
          aria-hidden
        />
        {blocks.map((block, index) => {
          const label =
            formatWhyMeIndexLabel(index, presentation.whyMeMarkerStyle ?? 'number') ??
            String(index + 1).padStart(2, '0');
          const title = whyMeBlockTitle(block);
          const body = whyMeBlockBody(block);
          return (
            <li key={block.id} className="relative">
              <PortfolioMotionItem profile={motionProfile} index={index} className="w-full min-w-0">
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3">
                  <div className="relative z-[1] flex justify-center">{renderMacaron(label)}</div>
                  <div className="min-w-0 pt-1 text-left">{renderCopy(title, body, 'left')}</div>
                </div>
              </PortfolioMotionItem>
            </li>
          );
        })}
      </ol>

      {/* Desktop — centered spine with equal left / right columns */}
      <ol
        className="relative m-0 mx-auto hidden w-full list-none p-0 md:grid"
        style={{
          gridTemplateColumns: '1fr 2.5rem 1fr',
          columnGap: '1.75rem',
          rowGap: `${gapPx}px`,
        }}
      >
        <li
          aria-hidden
          className="pointer-events-none z-0 m-0 p-0"
          style={{
            gridColumn: 2,
            gridRow: `1 / ${blocks.length + 1}`,
            justifySelf: 'center',
            width: 1,
            marginTop: '0.5rem',
            marginBottom: '0.5rem',
            backgroundColor: `color-mix(in srgb, ${lineColor} 55%, transparent)`,
            listStyle: 'none',
          }}
        />
        {blocks.map((block, index) => {
          const label =
            formatWhyMeIndexLabel(index, presentation.whyMeMarkerStyle ?? 'number') ??
            String(index + 1).padStart(2, '0');
          const title = whyMeBlockTitle(block);
          const body = whyMeBlockBody(block);
          const onLeft = index % 2 === 0;
          const row = index + 1;

          return (
            <li key={block.id} className="contents" style={{ listStyle: 'none' }}>
              <div
                className="min-w-0 self-start text-right"
                style={{ gridColumn: 1, gridRow: row }}
              >
                {onLeft ? (
                  <PortfolioMotionItem profile={motionProfile} index={index} className="w-full">
                    {renderCopy(title, body, 'right')}
                  </PortfolioMotionItem>
                ) : null}
              </div>
              <div
                className="relative z-[1] flex justify-center self-start"
                style={{ gridColumn: 2, gridRow: row }}
              >
                {renderMacaron(label)}
              </div>
              <div
                className="min-w-0 self-start text-left"
                style={{ gridColumn: 3, gridRow: row }}
              >
                {!onLeft ? (
                  <PortfolioMotionItem profile={motionProfile} index={index} className="w-full">
                    {renderCopy(title, body, 'left')}
                  </PortfolioMotionItem>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Centered bullet list with fine horizontal rules between items. */
function WhyMeLinedListLayout({
  blocks,
  presentation,
  motionProfile,
}: {
  blocks: ProfileMediaBlock[];
  presentation: PortfolioAboutPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
}) {
  const accent = aboutAccentColor(presentation.accentColor);
  const markerColor = resolveWhyMeMarkerColor(presentation) || accent;
  const lineColor = resolveWhyMeTimelineLineColor(presentation);
  const colorMode = aboutActiveColorMode(presentation);
  const bodyStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBody, colorMode);
  const gapPx = Math.max(resolveWhyMeGapPx(presentation), 28);
  const markerStyle = presentation.whyMeMarkerStyle ?? 'disc';
  const markerSize = presentation.whyMeMarkerSize ?? 'md';
  const markerSizePx = presentation.whyMeMarkerSizePx;
  const markerWeight = presentation.whyMeMarkerWeight ?? 'regular';
  const markerWeightAmount = presentation.whyMeMarkerWeightAmount;
  const showMarker = markerStyle !== 'none';
  const ruleColor = `color-mix(in srgb, ${lineColor} 42%, transparent)`;

  return (
    <div className="relative mx-auto w-fit max-w-full min-w-0">
      <ul className="m-0 flex w-full list-none flex-col p-0" role="list">
        {blocks.map((block, index) => {
          const title = whyMeBlockTitle(block);
          const body = whyMeBlockBody(block);
          const isLast = index === blocks.length - 1;
          const copyStyle = { ...bodyStyle, fontWeight: 600 as const };

          return (
            <li key={block.id} className="m-0 w-full p-0">
              <PortfolioMotionItem profile={motionProfile} index={index} className="w-full">
                <div
                  className="flex w-full items-start gap-3 text-left sm:gap-3.5"
                  style={{
                    paddingTop: index === 0 ? 0 : `${Math.round(gapPx * 0.55)}px`,
                    paddingBottom: `${Math.round(gapPx * 0.55)}px`,
                  }}
                >
                  {showMarker ? (
                    <WhyMeInlineMarkerSlot>
                      <WhyMeIndexMarker
                        index={index}
                        style={markerStyle}
                        accent={markerColor}
                        size={markerSize}
                        sizePx={markerSizePx}
                        weight={markerWeight}
                        weightAmount={markerWeightAmount}
                        inline
                      />
                    </WhyMeInlineMarkerSlot>
                  ) : null}
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className="text-lg font-semibold tracking-[-0.02em] sm:text-xl md:text-[1.35rem]"
                      style={copyStyle}
                    >
                      {title}
                    </p>
                    {body && body !== title ? (
                      <p
                        className={`mt-2 leading-relaxed opacity-70 ${elementTextStyleClass(
                          presentation.elementStyles.whyMeBody,
                          'body'
                        )}`}
                        style={copyStyle}
                      >
                        {body}
                      </p>
                    ) : null}
                  </div>
                </div>
              </PortfolioMotionItem>
              {!isLast ? (
                <div className="h-px w-full" style={{ backgroundColor: ruleColor }} aria-hidden />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WhyMeSplitLayout({
  blocks,
  presentation,
  motionProfile,
}: {
  blocks: ProfileMediaBlock[];
  presentation: PortfolioAboutPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
}) {
  const accent = aboutAccentColor(presentation.accentColor);
  const markerColor = resolveWhyMeMarkerColor(presentation) || accent;
  const colorMode = aboutActiveColorMode(presentation);
  const bodyStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBody, colorMode);
  const headingBase = whyMeHeadingStyle({
    ...presentation,
    whyMeHeadingFont: presentation.whyMeHeadingFont || 'serif',
  });
  const defaultMutedHeading = DEFAULT_ABOUT_WHY_ME_HEADING_COLOR.toLowerCase();
  const rawHeading = String(headingBase.color || '').toLowerCase();
  const headingColor =
    !rawHeading || rawHeading === defaultMutedHeading
      ? colorMode === 'dark'
        ? '#fafafa'
        : '#171717'
      : headingBase.color;
  const titleColor =
    typeof bodyStyle.color === 'string' && bodyStyle.color.trim()
      ? bodyStyle.color
      : colorMode === 'dark'
        ? '#e5e5e5'
        : '#404040';

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-x-16 xl:gap-x-24">
      <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        {presentation.showWhyMeHeading !== false ? (
          <h3
            className="font-serif text-[3.25rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.5rem]"
            style={{ color: headingColor }}
          >
            {resolveWhyMeHeading(presentation)}
          </h3>
        ) : null}
      </div>

      <ul className="flex min-w-0 w-full flex-col gap-8 sm:gap-10 lg:gap-12 xl:gap-14">
        {blocks.map((block, index) => {
          const label =
            formatWhyMeIndexLabel(index, presentation.whyMeMarkerStyle ?? 'number') ??
            String(index + 1).padStart(2, '0');
          const title = whyMeBlockTitle(block);
          return (
            <PortfolioMotionItem key={block.id} profile={motionProfile} index={index} className="w-full min-w-0">
              <li className="w-full min-w-0">
                <div className="flex w-full min-w-0 items-baseline gap-4 sm:gap-5 lg:gap-6">
                  <span
                    className="shrink-0 font-serif text-sm tabular-nums tracking-[0.06em] sm:text-base"
                    style={{ color: markerColor }}
                  >
                    {label}
                  </span>
                  <p
                    className="min-w-0 flex-1 font-serif text-lg font-normal leading-snug tracking-[-0.01em] sm:text-xl lg:text-[1.4rem] lg:whitespace-nowrap"
                    style={{ ...bodyStyle, color: titleColor }}
                  >
                    {title}
                  </p>
                </div>
              </li>
            </PortfolioMotionItem>
          );
        })}
      </ul>
    </div>
  );
}

function WhyMeMediaAsideLayout({
  blocks,
  presentation,
  motionProfile,
}: {
  blocks: ProfileMediaBlock[];
  presentation: PortfolioAboutPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
}) {
  const accent = aboutAccentColor(presentation.accentColor);
  const markerColor = resolveWhyMeMarkerColor(presentation) || accent;
  const colorMode = aboutActiveColorMode(presentation);
  const bodyStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBody, colorMode);
  const headingStyle = whyMeHeadingStyle(presentation);
  const defaultMutedHeading = DEFAULT_ABOUT_WHY_ME_HEADING_COLOR.toLowerCase();
  const rawHeading = String(headingStyle.color || '').toLowerCase();
  const headingColor =
    !rawHeading || rawHeading === defaultMutedHeading
      ? colorMode === 'dark'
        ? '#fafafa'
        : '#171717'
      : headingStyle.color;
  const titleColor =
    typeof bodyStyle.color === 'string' && bodyStyle.color.trim()
      ? bodyStyle.color
      : colorMode === 'dark'
        ? '#e5e5e5'
        : '#171717';
  const surface =
    presentation.cardBackgroundColor?.trim() ||
    (colorMode === 'dark' ? '#0a0a0a' : '#ffffff');
  const gapPx = Math.max(resolveWhyMeGapPx(presentation), 28);
  const markerStyle = presentation.whyMeMarkerStyle ?? 'number';
  const markerSize = presentation.whyMeMarkerSize ?? 'md';
  const showMarker = markerStyle !== 'none';

  return (
    <div className="grid w-full min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-x-14 xl:gap-x-20">
      <div className="flex min-w-0 flex-col items-start justify-center gap-6 sm:gap-8">
        <div
          className="w-full max-w-[16rem] sm:max-w-[18rem]"
          style={
            {
              ['--faq-accent' as string]: accent,
              ['--faq-ink' as string]: headingColor,
              ['--faq-surface' as string]: surface,
            } as CSSProperties
          }
        >
          <FaqSectionIllustration variant="chat" className="mx-0 max-w-none" />
        </div>
        {presentation.showWhyMeHeading !== false ? (
          <h3
            className={`max-w-md text-left text-3xl font-semibold tracking-[-0.04em] sm:text-4xl md:text-5xl lg:text-[3.25rem] ${aboutHeaderFontClass(
              presentation.whyMeHeadingFont,
              'title'
            )}`}
            style={{
              ...headingStyle,
              color: headingColor,
              fontWeight: 600,
            }}
          >
            {resolveWhyMeHeading(presentation)}
          </h3>
        ) : null}
      </div>

      <ul className="m-0 flex min-w-0 w-full list-none flex-col p-0" role="list">
        {blocks.map((block, index) => {
          const title = whyMeBlockTitle(block);
          const body = whyMeBlockBody(block);
          const copyStyle = { ...bodyStyle, color: titleColor, fontWeight: 600 as const };

          return (
            <li key={block.id} className="m-0 w-full p-0">
              <PortfolioMotionItem profile={motionProfile} index={index} className="w-full min-w-0">
                <div
                  className="flex w-full min-w-0 items-start gap-3 sm:gap-3.5"
                  style={{
                    paddingTop: index === 0 ? 0 : `${Math.round(gapPx * 0.45)}px`,
                    paddingBottom: `${Math.round(gapPx * 0.45)}px`,
                  }}
                >
                  {showMarker ? (
                    <WhyMeInlineMarkerSlot>
                      <WhyMeIndexMarker
                        index={index}
                        style={markerStyle}
                        accent={markerColor}
                        size={markerSize}
                        sizePx={presentation.whyMeMarkerSizePx}
                        weight={presentation.whyMeMarkerWeight ?? 'regular'}
                        weightAmount={presentation.whyMeMarkerWeightAmount}
                        inline
                      />
                    </WhyMeInlineMarkerSlot>
                  ) : null}
                  <div className="min-w-0 flex-1 text-left">
                    <p
                      className="text-lg font-semibold tracking-[-0.02em] sm:text-xl md:text-[1.35rem]"
                      style={copyStyle}
                    >
                      {title}
                    </p>
                    {body && body !== title ? (
                      <p
                        className={`mt-2 leading-relaxed opacity-70 ${elementTextStyleClass(
                          presentation.elementStyles.whyMeBody,
                          'body'
                        )}`}
                        style={copyStyle}
                      >
                        {body}
                      </p>
                    ) : null}
                  </div>
                </div>
              </PortfolioMotionItem>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WhyMeElevateCard({
  block,
  index,
  presentation,
}: {
  block: ProfileMediaBlock;
  index: number;
  presentation: PortfolioAboutPresentationSettings;
}) {
  const accent = aboutAccentColor(presentation.accentColor);
  const markerColor = resolveWhyMeMarkerColor(presentation);
  const Icon = WHY_ME_ICONS[index % WHY_ME_ICONS.length];
  const title = whyMeBlockTitle(block);
  const body = whyMeBlockBody(block);
  const label =
    formatWhyMeIndexLabel(index, presentation.whyMeMarkerStyle ?? 'number') ??
    String(index + 1).padStart(2, '0');
  const bodyStyle = elementTextInlineStyle(
    presentation.elementStyles.whyMeBody,
    aboutActiveColorMode(presentation)
  );
  const fill =
    presentation.whyMeBackgroundEnabled === false
      ? 'transparent'
      : presentation.whyMeBackgroundColor || resolveWhyMeTimelineSurfaceColor(presentation);

  return (
    <article
      className="group relative flex h-full min-h-[14rem] flex-col overflow-hidden rounded-2xl border p-5 transition duration-300 ease-out hover:-translate-y-1 sm:p-6"
      style={{
        backgroundColor: fill,
        borderColor: 'color-mix(in srgb, currentColor 12%, transparent)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.borderColor = accent;
        event.currentTarget.style.boxShadow = `0 18px 40px color-mix(in srgb, ${accent} 28%, transparent), 0 0 0 1px ${accent}`;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.borderColor = 'color-mix(in srgb, currentColor 12%, transparent)';
        event.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="text-sm font-bold tabular-nums tracking-[0.16em] opacity-55"
          style={{ color: markerColor }}
        >
          {label}
        </span>
        {presentation.whyMeShowHeaderAccent !== false ? (
          <span className="inline-flex" style={{ color: accent }}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-auto space-y-2 pt-10">
        <h4 className="text-xl font-bold tracking-[-0.02em]" style={bodyStyle}>
          {title}
        </h4>
        {body && body !== title ? (
          <p
            className={`leading-relaxed opacity-70 ${elementTextStyleClass(presentation.elementStyles.whyMeBody, 'body')}`}
            style={bodyStyle}
          >
            {body}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function WhyMeElevateLayout({
  blocks,
  presentation,
  motionProfile,
}: {
  blocks: ProfileMediaBlock[];
  presentation: PortfolioAboutPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
}) {
  return (
    <div
      className="grid w-full grid-cols-1 sm:grid-cols-2"
      style={whyMeGapStyle(presentation)}
    >
      {blocks.map((block, index) => (
        <PortfolioMotionItem key={block.id} profile={motionProfile} index={index} className="h-full w-full">
          <WhyMeElevateCard block={block} index={index} presentation={presentation} />
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

export function EditorialWhyMeHeading({
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  presentation?: PortfolioAboutPresentationSettings;
}) {
  if (!presentation.showWhyMeHeading) return null;
  if (whyMeDesignEmbedsHeading(presentation.whyMeDesign)) return null;

  const isHeroHeading = whyMeDesignUsesHeroHeading(presentation.whyMeDesign);
  const colorMode = aboutActiveColorMode(presentation);
  const headingStyle = whyMeHeadingStyle(presentation);
  const defaultMutedHeading = DEFAULT_ABOUT_WHY_ME_HEADING_COLOR.toLowerCase();
  const rawHeading = String(headingStyle.color || '').toLowerCase();
  const heroColor =
    !rawHeading || rawHeading === defaultMutedHeading
      ? colorMode === 'dark'
        ? '#fafafa'
        : '#171717'
      : headingStyle.color;

  if (isHeroHeading) {
    return (
      <h3
        className={`mb-10 text-center text-4xl font-semibold tracking-[-0.04em] sm:mb-12 sm:text-5xl md:text-6xl lg:text-7xl ${aboutHeaderFontClass(
          presentation.whyMeHeadingFont,
          'title'
        )}`}
        style={{
          ...headingStyle,
          color: heroColor,
          fontWeight: 600,
        }}
      >
        {resolveWhyMeHeading(presentation)}
      </h3>
    );
  }

  return (
    <h3
      className={`mb-6 text-left ${whyMeHeadingClass({
        ...presentation,
        whyMeHeadingAlignment: 'left',
      })}`}
      style={whyMeHeadingStyle(presentation)}
    >
      {resolveWhyMeHeading(presentation)}
    </h3>
  );
}

/** Infos column heading — independent title from About / Why choose me. */
export function EditorialSideInfoHeading({
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  presentation?: PortfolioAboutPresentationSettings;
}) {
  if (presentation.showSidePanelHeading === false) return null;

  return (
    <h3 className={`mb-5 ${sidePanelHeadingClass()}`} style={sidePanelHeadingStyle(presentation)}>
      {resolveSidePanelHeading(presentation)}
    </h3>
  );
}

export function EditorialWhyMeBlock({
  block,
  index,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  block: ProfileMediaBlock;
  index: number;
  presentation?: PortfolioAboutPresentationSettings;
}) {
  return (
    <EditorialHighlightBlock
      block={block}
      index={index}
      icons={WHY_ME_ICONS}
      presentation={presentation}
    />
  );
}

export function EditorialWhyMeList({
  blocks,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceStack: _forceStack = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Kept for API compatibility — timeline/split own their layout. */
  forceStack?: boolean;
}) {
  if (blocks.length === 0) return null;

  const design = presentation.whyMeDesign;

  if (design === 'split') {
    return (
      <WhyMeSplitLayout blocks={blocks} presentation={presentation} motionProfile={motionProfile} />
    );
  }

  if (design === 'media-aside') {
    return (
      <WhyMeMediaAsideLayout
        blocks={blocks}
        presentation={presentation}
        motionProfile={motionProfile}
      />
    );
  }

  if (design === 'lined-list') {
    return (
      <WhyMeLinedListLayout
        blocks={blocks}
        presentation={presentation}
        motionProfile={motionProfile}
      />
    );
  }

  return (
    <WhyMeTimelineLayout blocks={blocks} presentation={presentation} motionProfile={motionProfile} />
  );
}

function splitExperienceText(text: string): { title: string | null; body: string | null } {
  const trimmed = text.trim();
  if (!trimmed) return { title: null, body: null };

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    return { title: lines[0], body: lines.slice(1).join('\n') };
  }

  return { title: null, body: trimmed };
}

function resolveExperienceContent(block: ProfileMediaBlock): {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  tags: string[];
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  toolIcons: Record<string, string>;
  links: ExperienceProofLink[];
  remarks: string | null;
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
} {
  const subtitles = (block.subtitles ?? []).map((item) => item.trim()).filter(Boolean);
  const period = block.period?.trim() || subtitles[0] || null;
  const tags = block.period?.trim() ? subtitles : subtitles.slice(1);
  const organization = block.organization?.trim() || null;
  const status =
    block.status === 'ONGOING' || block.status === 'FINISHED' ? block.status : null;
  const tasks = (block.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const tools: string[] = [];
  const toolIcons: Record<string, string> = {};
  for (const item of block.tools ?? []) {
    let name = '';
    let iconUrl: string | null = null;
    if (typeof item === 'string') {
      name = item.trim();
    } else if (item && typeof item === 'object') {
      const record = item as { name?: unknown; value?: unknown; iconUrl?: unknown };
      name = String(record.name ?? record.value ?? '').trim();
      iconUrl =
        typeof record.iconUrl === 'string' && record.iconUrl.trim() ? record.iconUrl.trim() : null;
    }
    if (!name) continue;
    const key = name.toLowerCase();
    if (tools.some((existing) => existing.toLowerCase() === key)) continue;
    tools.push(name);
    if (iconUrl) toolIcons[name] = iconUrl;
    if (tools.length >= 8) break;
  }
  const links = (block.links ?? [])
    .filter((link) => link.url?.trim() && link.label?.trim())
    .map((link, index) => ({
      id: link.id || `proof-${index}`,
      label: link.label.trim(),
      url: link.url.trim(),
      platform: link.platform ?? null,
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const remarks = block.remarks?.trim() || null;
  const location = block.location?.trim() || null;
  const employmentType = block.employmentType ?? null;

  const dedicatedTitle = block.title?.trim() || null;
  if (dedicatedTitle) {
    return {
      period,
      title: dedicatedTitle,
      organization,
      description: block.text?.trim() || null,
      tags,
      status,
      tasks,
      tools,
      toolIcons,
      links,
      remarks,
      location,
      employmentType,
    };
  }

  const split = splitExperienceText(block.text ?? '');
  return {
    period,
    title: split.title,
    organization,
    description: split.body,
    tags,
    status,
    tasks,
    tools,
    toolIcons,
    links,
    remarks,
    location,
    employmentType,
  };
}

const EMPLOYMENT_TYPE_LABELS: Record<ExperienceEmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
};

type ExperienceBodyProps = {
  title: string | null;
  organization: string | null;
  description: string | null;
  tags: string[];
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  toolIcons?: Record<string, string>;
  links: ExperienceProofLink[];
  remarks: string | null;
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
  accent: string;
  titleClassName?: string;
  layout?: 'stack' | 'split' | 'bento' | 'compact' | 'magazine' | 'stepped';
  /** Magazine: period shown as a discreet eyebrow above the title (not a floating badge). */
  period?: string | null;
  asidePlacement?: PortfolioExperienceAsidePlacement;
  /**
   * Split-screen navigation: flip the two-column entry into a vertical stack
   * (former right column on top, left column below).
   */
  stackColumnsForSplitNav?: boolean;
  detailsPanelClassName?: string;
  detailsPanelStyle?: CSSProperties;
  /** Frame for proof / skills secondary details card (bento / split stack). */
  detailsSecondaryPanelClassName?: string;
  detailsSecondaryPanelStyle?: CSSProperties;
  storyPanelClassName?: string;
  storyPanelStyle?: CSSProperties;
  /** Split / divider layers for the story card (when frame is enabled). */
  storyCardBackground?: import('@/components/portfolio/portfolio-services-card-background-settings').PortfolioServicesCardBackgroundSettings | null;
  /** Split / divider layers for the details card (when frame is enabled). */
  detailsCardBackground?: import('@/components/portfolio/portfolio-services-card-background-settings').PortfolioServicesCardBackgroundSettings | null;
  /** Split / divider layers for the proof / skills card (when frame is enabled). */
  detailsSecondaryCardBackground?: import('@/components/portfolio/portfolio-services-card-background-settings').PortfolioServicesCardBackgroundSettings | null;
  /** Hairline above Tools (color + opacity from settings). */
  toolsSeparatorStyle?: CSSProperties | null;
  /**
   * Shared horizontal traits (skills footer, fiche sections, …) —
   * always on; color from palette `bordure` via toolsSeparator slot.
   */
  hairlineBorderTopStyle?: CSSProperties | null;
  hairlineBorderBottomStyle?: CSSProperties | null;
  hairlineColor?: string | null;
  /** Vertical gap style for the story (left) column — overrides density space-y. */
  storyContentGapStyle?: CSSProperties;
  /** Vertical gap style for the details column (tasks, note, skills, tools…). */
  detailsContentGapStyle?: CSSProperties;
  density?: 'comfortable' | 'compact';
  elementOrder?: PortfolioExperienceElementId[];
  elementZones?: PortfolioExperienceElementZones;
  toolsZone?: PortfolioExperienceToolsZone;
  proofZone?: PortfolioExperienceProofZone;
  toolsEntrySide?: PortfolioExperienceToolsEntrySide;
  toolsDisplay?: PortfolioExperienceToolsDisplay;
  toolsIconSize?: PortfolioExperienceToolsIconSize;
  toolsIconBorder?: PortfolioExperienceToolsIconBorder;
  toolsIconChrome?: CSSProperties;
  toolsIconPaddingPx?: number;
  toolsIconGapPx?: number;
  toolsChrome?: PortfolioExperienceToolsChromeSettings;
  showBlockLabels?: boolean;
  tasksLabel?: string;
  proofLabel?: string;
  noteLabel?: string;
  skillsLabel?: string;
  toolsLabel?: string;
  skillsTagStyle?: PortfolioExperienceSkillsTagStyle;
  statusBadgeStyle?: PortfolioExperienceStatusBadgeStyle;
  proofLinkStyle?: PortfolioExperienceProofLinkStyle;
  elementStyles?: PortfolioExperienceElementStyles;
  chipChrome?: CSSProperties;
  softChipChrome?: CSSProperties;
  taskBulletSource?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSource;
  taskBulletStyle?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerStyle;
  taskBulletColor?: string;
  taskBulletSize?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSize;
  taskBulletSizePx?: number;
  taskBulletWeight?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerWeight;
  taskBulletWeightAmount?: number;
  taskItemGap?: PortfolioExperienceTaskItemGap;
  blockLabelVisibility?: import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceBlockLabelVisibility;
  /** When set (large/bento), media is placed inside the bento grid — not wrapped beside the whole body. */
  mediaSlot?: React.ReactNode;
  /** Aside side for mediaSlot inside bento. */
  mediaAside?: 'left' | 'right';
  /** Large / bento: stack details under the photo instead of a third column. */
  bentoDetailsPlacement?: import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceBentoDetailsPlacement;
  /** Entry media size — drives bento column width so enlarging pushes the story. */
  entryMediaSize?: import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceEntryMediaSize;
  /** Magazine only: relative width of media and content in two-column layouts. */
  magazineColumnRatio?: import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceMagazineColumnRatio;
};

function ExperienceBlockHeading({
  label,
  show,
  textStyle,
}: {
  label: string;
  show: boolean;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (!show || !label.trim()) return null;
  if (!textStyle) {
    return (
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
    );
  }
  return (
    <p
      className={`mb-3 leading-none ${experienceTextStyleClass(textStyle, 'label')}`}
      style={experienceTextInlineStyle(textStyle)}
    >
      {label}
    </p>
  );
}

function ExperienceEntryNote({
  remarks,
  label,
  showLabel,
  labelStyle,
  textStyle,
}: {
  remarks: string | null;
  label: string;
  showLabel: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  const text = remarks?.trim() || '';
  if (!text) return null;
  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <p
        className={`leading-relaxed ${textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-base italic text-neutral-500'}`}
        style={textStyle ? experienceTextInlineStyle(textStyle) : { fontFamily: SERIF }}
      >
        {text}
      </p>
    </div>
  );
}

function ExperienceEntrySkillsBlock({
  tags,
  label,
  showLabel,
  tagStyle,
  accent,
  labelStyle,
  textStyle,
  chipChrome,
  softChipChrome,
}: {
  tags: string[];
  label: string;
  showLabel: boolean;
  tagStyle: PortfolioExperienceSkillsTagStyle;
  accent: string;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
  chipChrome?: CSSProperties;
  softChipChrome?: CSSProperties;
}) {
  if (tags.length === 0) return null;
  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <ExperienceEntryTags
        tags={tags}
        tagStyle={tagStyle}
        accent={accent}
        textStyle={textStyle}
        chipChrome={chipChrome}
        softChipChrome={softChipChrome}
      />
    </div>
  );
}

function renderExperienceElement(
  id: PortfolioExperienceElementId,
  ctx: {
    title: string | null;
    organization: string | null;
    description: string | null;
    tags: string[];
    status: ExperienceBlockStatus | null;
    tasks: string[];
    tools: string[];
    toolIcons?: Record<string, string>;
    links: ExperienceProofLink[];
    remarks: string | null;
    location: string | null;
    employmentType: ExperienceEmploymentType | null;
    accent: string;
    titleClassName: string;
    denseTasks?: boolean;
    /** Where the ONGOING / FINISHED badge sits — Magazine uses byline. */
    statusPlacement?: 'title' | 'byline';
    toolsDisplay?: PortfolioExperienceToolsDisplay;
    toolsIconSize?: PortfolioExperienceToolsIconSize;
    toolsIconBorder?: PortfolioExperienceToolsIconBorder;
    toolsIconChrome?: CSSProperties;
    toolsIconPaddingPx?: number;
    toolsIconGapPx?: number;
    toolsChrome?: PortfolioExperienceToolsChromeSettings;
    showBlockLabels?: boolean;
    tasksLabel?: string;
    proofLabel?: string;
    noteLabel?: string;
    skillsLabel?: string;
    toolsLabel?: string;
    skillsTagStyle?: PortfolioExperienceSkillsTagStyle;
    statusBadgeStyle?: PortfolioExperienceStatusBadgeStyle;
    proofLinkStyle?: PortfolioExperienceProofLinkStyle;
    elementStyles?: PortfolioExperienceElementStyles;
    chipChrome?: CSSProperties;
    softChipChrome?: CSSProperties;
    taskBulletSource?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSource;
    taskBulletStyle?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerStyle;
    taskBulletColor?: string;
    taskBulletSize?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSize;
    taskBulletSizePx?: number;
    taskBulletWeight?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerWeight;
    taskBulletWeightAmount?: number;
    taskItemGap?: PortfolioExperienceTaskItemGap;
    blockLabelVisibility?: import('@/components/portfolio/portfolio-experience-settings').PortfolioExperienceBlockLabelVisibility;
  }
): React.ReactNode {
  const labelFlags = {
    showBlockLabels: ctx.showBlockLabels !== false,
    blockLabelVisibility: ctx.blockLabelVisibility,
  };
  const styles = normalizeExperienceElementStyles(ctx.elementStyles);
  const statusOnByline = ctx.statusPlacement === 'byline';
  const statusBadge =
    ctx.status === 'ONGOING' || ctx.status === 'FINISHED' ? (
      <ExperienceStatusBadge
        status={ctx.status}
        accent={ctx.accent}
        textStyle={styles.meta}
        softChipChrome={ctx.softChipChrome}
        badgeStyle={ctx.statusBadgeStyle}
      />
    ) : null;

  switch (id) {
    case 'title': {
      const titleStatus = !statusOnByline ? statusBadge : null;
      if (!ctx.title && !titleStatus) return null;
      return (
        <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
          {ctx.title ? (
            <h4
              className={`min-w-0 leading-snug tracking-[-0.02em] ${experienceTextStyleClass(styles.title, 'title')}`}
              style={experienceTextInlineStyle(styles.title)}
            >
              {ctx.title}
            </h4>
          ) : null}
          {titleStatus ? <div className="shrink-0 pt-0.5 sm:pt-1.5">{titleStatus}</div> : null}
        </div>
      );
    }
    case 'organization': {
      const showBylineStatus = statusOnByline && Boolean(statusBadge);
      if (!ctx.organization && !showBylineStatus) return null;
      return (
        <div
          className={`flex flex-wrap items-center gap-x-2 gap-y-2 ${experienceTextStyleClass(styles.organization, 'body')}`}
          style={experienceTextInlineStyle(styles.organization)}
        >
          {ctx.organization ? <span>{ctx.organization}</span> : null}
          {ctx.organization && ctx.location ? (
            <>
              <span className="font-normal text-neutral-500" aria-hidden>
                —
              </span>
              <span
                className={experienceTextStyleClass(styles.meta, 'label')}
                style={experienceTextInlineStyle(styles.meta)}
              >
                {ctx.location}
              </span>
            </>
          ) : null}
          {ctx.employmentType ? (
            <span
              className={`inline-flex rounded-full px-3 py-1.5 ${
                styles.meta
                  ? experienceTextStyleClass(styles.meta, 'label')
                  : 'text-xs font-semibold uppercase tracking-[0.12em]'
              }`}
              style={{
                ...ctx.softChipChrome,
                ...(styles.meta ? experienceTextInlineStyle(styles.meta) : undefined),
              }}
            >
              {EMPLOYMENT_TYPE_LABELS[ctx.employmentType]}
            </span>
          ) : null}
          {showBylineStatus ? <span className="inline-flex shrink-0">{statusBadge}</span> : null}
        </div>
      );
    }
    case 'meta':
      return (
        <ExperienceEntryMeta
          // Default: status on title. Magazine byline: status on organization row.
          // When org is hidden, surface status here for byline placement.
          status={statusOnByline && !ctx.organization ? ctx.status : null}
          employmentType={ctx.organization ? null : ctx.employmentType}
          location={ctx.organization ? null : ctx.location}
          accent={ctx.accent}
          textStyle={styles.meta}
          softChipChrome={ctx.softChipChrome}
          statusBadgeStyle={ctx.statusBadgeStyle}
        />
      );
    case 'description':
      return ctx.description ? (
        <p
          className={`max-w-3xl leading-relaxed ${experienceTextStyleClass(styles.description, 'body')}`}
          style={experienceTextInlineStyle(styles.description)}
        >
          {ctx.description}
        </p>
      ) : null;
    case 'tasks':
      return (
        <ExperienceEntryTasks
          tasks={ctx.tasks}
          accent={ctx.accent}
          dense={ctx.denseTasks}
          label={resolveExperienceBlockLabel(ctx.tasksLabel, 'Tasks')}
          showLabel={experienceBlockLabelVisible(labelFlags, 'tasks')}
          labelStyle={styles.blockLabel}
          textStyle={styles.tasks}
          taskBulletSource={ctx.taskBulletSource}
          taskBulletStyle={ctx.taskBulletStyle}
          taskBulletColor={ctx.taskBulletColor}
          taskBulletSize={ctx.taskBulletSize}
          taskBulletSizePx={ctx.taskBulletSizePx}
          taskBulletWeight={ctx.taskBulletWeight}
          taskBulletWeightAmount={ctx.taskBulletWeightAmount}
          taskItemGap={ctx.taskItemGap}
        />
      );
    case 'tools':
      return (
        <ExperienceEntryTools
          tools={ctx.tools}
          toolIcons={ctx.toolIcons}
          display={ctx.toolsDisplay ?? 'icons-and-labels'}
          iconSize={ctx.toolsIconSize ?? 'md'}
          iconBorder={ctx.toolsIconBorder ?? 'solid'}
          iconPaddingPx={ctx.toolsIconPaddingPx}
          iconGapPx={ctx.toolsIconGapPx}
          toolsChrome={ctx.toolsChrome}
          label={resolveExperienceBlockLabel(ctx.toolsLabel, 'Tools')}
          showHeading={
            experienceBlockLabelVisible(labelFlags, 'tools') &&
            ctx.toolsDisplay !== 'icons' &&
            ctx.toolsDisplay !== 'stacked'
          }
          labelStyle={styles.blockLabel}
          textStyle={styles.tools}
          chipChrome={ctx.toolsIconChrome ?? ctx.chipChrome}
        />
      );
    case 'proof':
      return (
        <ExperienceEntryLinks
          links={ctx.links}
          accent={ctx.accent}
          label={resolveExperienceBlockLabel(ctx.proofLabel, 'Proof')}
          showLabel={experienceBlockLabelVisible(labelFlags, 'proof')}
          labelStyle={styles.blockLabel}
          textStyle={styles.proof}
          chipChrome={ctx.chipChrome}
          softChipChrome={ctx.softChipChrome}
          linkStyle={ctx.proofLinkStyle ?? 'pill'}
        />
      );
    case 'note':
      return (
        <ExperienceEntryNote
          remarks={ctx.remarks}
          label={resolveExperienceBlockLabel(ctx.noteLabel, 'Note')}
          showLabel={experienceBlockLabelVisible(labelFlags, 'note')}
          labelStyle={styles.blockLabel}
          textStyle={styles.note}
        />
      );
    case 'skills':
      return (
        <ExperienceEntrySkillsBlock
          tags={ctx.tags}
          label={resolveExperienceBlockLabel(ctx.skillsLabel, 'Skills')}
          showLabel={experienceBlockLabelVisible(labelFlags, 'skills')}
          tagStyle={ctx.skillsTagStyle ?? 'soft'}
          accent={ctx.accent}
          labelStyle={styles.blockLabel}
          textStyle={styles.skills}
          chipChrome={ctx.chipChrome}
          softChipChrome={ctx.softChipChrome}
        />
      );
    default:
      return null;
  }
}

function stripTailwindSpaceY(className = ''): string {
  return className
    .split(/\s+/)
    .filter((token) => token.length > 0 && !/^space-y-/.test(token))
    .join(' ');
}

function ExperienceOrderedColumn({
  ids,
  className,
  style,
  childrenGapClass,
  contentGapStyle,
  cardBackground,
  toolsSeparatorStyle,
  divided = false,
  render,
}: {
  ids: PortfolioExperienceElementId[];
  className?: string;
  style?: CSSProperties;
  childrenGapClass: string;
  /** When set, uses flex + gap instead of Tailwind space-y. */
  contentGapStyle?: CSSProperties;
  /** When set, paints split / divider layers behind the column (Services-style). */
  cardBackground?: import('@/components/portfolio/portfolio-services-card-background-settings').PortfolioServicesCardBackgroundSettings | null;
  /** Optional hairline above the Tools block. */
  toolsSeparatorStyle?: CSSProperties | null;
  /** Magazine fiche: hairline between stacked sections. */
  divided?: boolean;
  render: (id: PortfolioExperienceElementId) => React.ReactNode;
}) {
  const nodes = ids.map((id) => ({ id, node: render(id) })).filter((item) => item.node != null);
  if (nodes.length === 0) return null;
  const gapClass = contentGapStyle
    ? 'flex flex-col'
    : divided
      ? 'flex flex-col'
      : childrenGapClass;
  // Hairline above the bottom tools strip (typical last block in the entry).
  const separateLast =
    !divided &&
    nodes.length > 1 &&
    nodes[nodes.length - 1]?.id === 'tools' &&
    toolsSeparatorStyle != null;
  const items = nodes.map((item, index) => {
    const isSeparatedLast = separateLast && index === nodes.length - 1;
    if (divided && index > 0) {
      return (
        <div
          key={item.id}
          className="pt-5"
          style={
            toolsSeparatorStyle ?? {
              borderTopWidth: 1,
              borderTopStyle: 'solid',
              borderTopColor: 'color-mix(in srgb, currentColor 12%, transparent)',
            }
          }
        >
          {item.node}
        </div>
      );
    }
    if (!isSeparatedLast) {
      return <Fragment key={item.id}>{item.node}</Fragment>;
    }
    return (
      <div key={item.id} className="pt-4" style={toolsSeparatorStyle ?? undefined}>
        {item.node}
      </div>
    );
  });

  if (!cardBackground) {
    const shellClass = contentGapStyle || divided ? stripTailwindSpaceY(className) : className;
    return (
      <div
        className={[gapClass, shellClass].filter(Boolean).join(' ')}
        style={
          contentGapStyle
            ? { ...style, ...contentGapStyle }
            : divided
              ? { ...style, gap: '1.25rem' }
              : style
        }
      >
        {items}
      </div>
    );
  }

  // Keep space-y / flex gap on the foreground only — not between layers and content.
  const shellClass = stripTailwindSpaceY(className);
  return (
    <div className={shellClass} style={style}>
      <ServicesCardBackgroundLayers presentation={cardBackground} />
      <ServicesCardForeground
        className={contentGapStyle || divided ? undefined : gapClass}
        style={
          contentGapStyle
            ? contentGapStyle
            : divided
              ? { display: 'flex', flexDirection: 'column', gap: '1.25rem' }
              : undefined
        }
      >
        {items}
      </ServicesCardForeground>
    </div>
  );
}

function ExperienceEntryTags({
  tags,
  tagStyle = 'soft',
  accent,
  textStyle,
  chipChrome,
  softChipChrome,
}: {
  tags: string[];
  tagStyle?: PortfolioExperienceSkillsTagStyle;
  accent?: string;
  textStyle?: PortfolioExperienceTextStyle;
  chipChrome?: CSSProperties;
  softChipChrome?: CSSProperties;
}) {
  if (tags.length === 0) return null;
  const typeClass = textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-sm font-medium';
  const typeStyle = textStyle ? experienceTextInlineStyle(textStyle) : undefined;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        if (tagStyle === 'plain') {
          return (
            <span key={tag} className={typeClass} style={typeStyle}>
              {tag}
            </span>
          );
        }
        if (tagStyle === 'pill') {
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 ${typeClass}`}
              style={{ ...chipChrome, ...typeStyle }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent ?? '#ea580c' }}
                aria-hidden
              />
              {tag}
            </span>
          );
        }
        if (tagStyle === 'outline') {
          return (
            <span
              key={tag}
              className={`inline-flex items-center rounded-full border px-3.5 py-2 ${typeClass}`}
              style={{ ...chipChrome, ...typeStyle }}
            >
              {tag}
            </span>
          );
        }
        return (
          <span
            key={tag}
            className={`rounded-full px-3.5 py-1.5 transition ${typeClass}`}
            style={{ ...softChipChrome, ...typeStyle }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}

function ExperienceStatusBadge({
  status,
  accent,
  textStyle,
  softChipChrome,
  badgeStyle = 'pill',
}: {
  status: 'ONGOING' | 'FINISHED';
  accent: string;
  textStyle?: PortfolioExperienceTextStyle;
  softChipChrome?: CSSProperties;
  badgeStyle?: PortfolioExperienceStatusBadgeStyle;
}) {
  const typeClass = textStyle
    ? experienceTextStyleClass(textStyle, 'label')
    : 'text-xs font-semibold uppercase tracking-[0.12em]';
  const label = status === 'ONGOING' ? 'Ongoing' : 'Finished';
  const isOngoing = status === 'ONGOING';
  const textInline = textStyle ? experienceTextInlineStyle(textStyle) : undefined;
  const soft = softChipChrome ?? {};

  if (badgeStyle === 'dot') {
    return (
      <span
        className={`inline-flex items-center gap-2 ${typeClass}`}
        style={{
          color: isOngoing ? accent : undefined,
          opacity: isOngoing ? 1 : 0.75,
          ...textInline,
        }}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: isOngoing ? accent : 'currentColor',
            opacity: isOngoing ? 1 : 0.45,
          }}
          aria-hidden
        />
        {label}
      </span>
    );
  }

  if (badgeStyle === 'plain') {
    return (
      <span
        className={`inline-flex ${typeClass}`}
        style={{
          color: isOngoing ? accent : undefined,
          opacity: isOngoing ? 1 : 0.72,
          ...textInline,
        }}
      >
        {label}
      </span>
    );
  }

  const radiusClass =
    badgeStyle === 'square' ? 'rounded-md' : 'rounded-full';
  const padClass = 'inline-flex px-3 py-1.5';

  if (badgeStyle === 'outline') {
    return (
      <span
        className={`${padClass} ${radiusClass} border ${typeClass}`}
        style={{
          borderColor: isOngoing ? accent : 'rgba(0,0,0,0.14)',
          color: isOngoing ? accent : undefined,
          backgroundColor: 'transparent',
          ...textInline,
        }}
      >
        {label}
      </span>
    );
  }

  if (badgeStyle === 'soft') {
    return (
      <span
        className={`${padClass} ${radiusClass} ${typeClass}`}
        style={{
          ...soft,
          ...(isOngoing ? { color: accent } : undefined),
          ...textInline,
        }}
      >
        {label}
      </span>
    );
  }

  if (badgeStyle === 'accent') {
    return (
      <span
        className={`${padClass} ${radiusClass} ${typeClass}`}
        style={
          isOngoing
            ? { backgroundColor: accent, color: '#ffffff' }
            : {
                backgroundColor: 'transparent',
                color: accent,
                border: `1px solid ${accent}`,
                ...textInline,
              }
        }
      >
        {label}
      </span>
    );
  }

  // pill (default) + square: Ongoing solid accent — Finished soft chip
  return (
    <span
      className={`${padClass} ${radiusClass} ${typeClass}`}
      style={
        isOngoing
          ? { backgroundColor: accent, color: '#ffffff' }
          : {
              ...soft,
              ...textInline,
            }
      }
    >
      {label}
    </span>
  );
}

function ExperienceEntryMeta({
  status,
  employmentType,
  location,
  accent,
  textStyle,
  softChipChrome,
  statusBadgeStyle,
}: {
  status: ExperienceBlockStatus | null;
  employmentType: ExperienceEmploymentType | null;
  location: string | null;
  accent: string;
  textStyle?: PortfolioExperienceTextStyle;
  softChipChrome?: CSSProperties;
  statusBadgeStyle?: PortfolioExperienceStatusBadgeStyle;
}) {
  const chips: { key: string; label: string; strong?: boolean }[] = [];
  if (status === 'ONGOING') chips.push({ key: 'status', label: 'Ongoing', strong: true });
  if (status === 'FINISHED') chips.push({ key: 'status', label: 'Finished' });
  if (employmentType) chips.push({ key: 'employment', label: EMPLOYMENT_TYPE_LABELS[employmentType] });
  if (location) chips.push({ key: 'location', label: location });
  if (chips.length === 0) return null;

  const typeClass = textStyle
    ? experienceTextStyleClass(textStyle, 'label')
    : 'text-xs font-semibold uppercase tracking-[0.12em]';

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) =>
        chip.key === 'status' && (status === 'ONGOING' || status === 'FINISHED') ? (
          <ExperienceStatusBadge
            key={chip.key}
            status={status}
            accent={accent}
            textStyle={textStyle}
            softChipChrome={softChipChrome}
            badgeStyle={statusBadgeStyle}
          />
        ) : (
          <span
            key={chip.key}
            className={`inline-flex rounded-full px-3 py-1.5 ${typeClass}`}
            style={
              chip.strong
                ? { backgroundColor: accent, color: '#ffffff' }
                : {
                    ...softChipChrome,
                    ...(textStyle ? experienceTextInlineStyle(textStyle) : undefined),
                  }
            }
          >
            {chip.label}
          </span>
        )
      )}
    </div>
  );
}

function ExperienceEntryTasks({
  tasks,
  accent,
  dense = false,
  label = 'Tasks',
  showLabel = true,
  labelStyle,
  textStyle,
  taskBulletSource = 'section',
  taskBulletStyle = 'disc',
  taskBulletColor,
  taskBulletSize = 'md',
  taskBulletSizePx,
  taskBulletWeight = 'regular',
  taskBulletWeightAmount,
  taskItemGap = 'md',
}: {
  tasks: string[];
  accent: string;
  dense?: boolean;
  label?: string;
  showLabel?: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
  taskBulletSource?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSource;
  taskBulletStyle?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerStyle;
  taskBulletColor?: string;
  taskBulletSize?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerSize;
  taskBulletSizePx?: number;
  taskBulletWeight?: import('@/components/portfolio/portfolio-list-marker').PortfolioListMarkerWeight;
  taskBulletWeightAmount?: number;
  taskItemGap?: PortfolioExperienceTaskItemGap;
}) {
  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  if (tasks.length === 0) return null;

  const marker = resolveTaskListMarker(
    taskListBulletGlobal,
    {
      taskBulletSource: 'section',
      taskBulletStyle,
      taskBulletColor: taskBulletColor || accent,
      taskBulletSize,
      taskBulletSizePx,
      taskBulletWeight,
      taskBulletWeightAmount,
    },
    accent
  );

  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <ul
        className={`${experienceTaskItemGapClass(taskItemGap)} leading-relaxed ${
          textStyle
            ? experienceTextStyleClass(textStyle, 'body')
            : dense
              ? 'text-base text-neutral-600'
              : 'text-base text-neutral-600 sm:text-[1.05rem]'
        }`}
        style={textStyle ? experienceTextInlineStyle(textStyle) : undefined}
      >
        {tasks.map((task, index) => (
          <li key={task} className="flex gap-3">
            <PortfolioListMarker
              style={marker.style}
              color={marker.color}
              index={index}
              size={marker.size}
              sizePx={marker.sizePx}
              weight={marker.weight}
              weightAmount={marker.weightAmount}
            />
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceEntryLinks({
  links,
  accent,
  label = 'Proof',
  showLabel = true,
  labelStyle,
  textStyle,
  chipChrome,
  softChipChrome,
  linkStyle = 'pill',
  fullWidth = false,
}: {
  links: ExperienceProofLink[];
  accent: string;
  label?: string;
  showLabel?: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
  chipChrome?: CSSProperties;
  softChipChrome?: CSSProperties;
  linkStyle?: PortfolioExperienceProofLinkStyle;
  /** Stepped cards: solid accent CTA, full column width, no tiny chip. */
  fullWidth?: boolean;
}) {
  if (links.length === 0) return null;
  const typeClass = textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-sm font-semibold';
  const typeStyle = textStyle ? experienceTextInlineStyle(textStyle) : undefined;
  const showArrow = linkStyle !== 'underline';

  if (fullWidth) {
    return (
      <div className="flex w-full flex-col gap-2.5">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold tracking-[-0.01em] text-white transition hover:opacity-90 sm:text-[0.9375rem] ${typeClass}`}
            style={{ ...typeStyle, backgroundColor: accent, color: '#ffffff' }}
          >
            <span className="min-w-0 truncate">{link.label}</span>
            <span aria-hidden className="shrink-0 opacity-90">
              →
            </span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <div
        className={
          linkStyle === 'underline' || linkStyle === 'plain'
            ? 'flex flex-col items-start gap-2'
            : 'flex flex-wrap gap-2'
        }
      >
        {links.map((link) => {
          const commonClass = `inline-flex items-center gap-2 transition hover:opacity-90 ${typeClass}`;
          let className = commonClass;
          let style: CSSProperties = { ...typeStyle };

          switch (linkStyle) {
            case 'soft':
              className = `${commonClass} rounded-full px-3.5 py-2 hover:-translate-y-0.5 hover:shadow-sm`;
              style = { ...softChipChrome, ...typeStyle };
              break;
            case 'outline':
              className = `${commonClass} rounded-xl border px-3.5 py-2 hover:-translate-y-0.5 hover:shadow-sm`;
              style = { ...chipChrome, ...typeStyle };
              break;
            case 'plain':
              className = `${commonClass} gap-1.5 hover:opacity-80`;
              break;
            case 'accent':
              className = `${commonClass} rounded-full px-3.5 py-2 text-white hover:-translate-y-0.5 hover:shadow-sm`;
              style = { ...typeStyle, backgroundColor: accent, color: '#ffffff' };
              break;
            case 'underline':
              className = `${commonClass} gap-1 underline decoration-from-font underline-offset-4 hover:opacity-80`;
              style = { ...typeStyle, color: accent };
              break;
            case 'pill':
            default:
              className = `${commonClass} rounded-full border px-3.5 py-2 hover:-translate-y-0.5 hover:shadow-sm`;
              style = { ...chipChrome, ...typeStyle };
              break;
          }

          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
              style={style}
            >
              {link.label}
              {showArrow ? (
                <span aria-hidden className="opacity-50">
                  ↗
                </span>
              ) : null}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceEntryTools({
  tools,
  toolIcons,
  display = 'icons-and-labels',
  iconSize = 'md',
  iconBorder = 'solid',
  iconPaddingPx = 10,
  iconGapPx = 8,
  toolsChrome,
  label = 'Tools',
  showHeading = true,
  labelStyle,
  textStyle,
  chipChrome,
}: {
  tools: string[];
  toolIcons?: Record<string, string>;
  display?: PortfolioExperienceToolsDisplay;
  iconSize?: PortfolioExperienceToolsIconSize;
  iconBorder?: PortfolioExperienceToolsIconBorder;
  iconPaddingPx?: number;
  iconGapPx?: number;
  toolsChrome?: PortfolioExperienceToolsChromeSettings;
  label?: string;
  showHeading?: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
  chipChrome?: CSSProperties;
}) {
  if (tools.length === 0) return null;
  const iconsOnly = display === 'icons';
  const stacked = display === 'stacked';
  const pixel = experienceToolsIconPixelSize(iconSize);
  const borderClass = experienceToolsIconBorderClass(iconBorder);
  const typeClass = textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-sm font-medium';
  const typeStyle = textStyle ? experienceTextInlineStyle(textStyle) : undefined;
  const pad = iconPaddingPx ?? 10;
  const gap = iconGapPx ?? 8;
  const chrome = toolsChrome;
  const chromeEnabled = Boolean(chrome?.enabled);
  const chromeFit = Boolean(chromeEnabled && chrome?.fitContent);
  const chromeClass = experienceToolsChromeClass(chrome);
  const chromeStyle = experienceToolsChromeStyle(chrome);
  const stackBorder =
    iconBorder === 'none'
      ? 'transparent'
      : typeof chipChrome?.borderColor === 'string' && chipChrome.borderColor.trim()
        ? chipChrome.borderColor
        : typeof chipChrome?.backgroundColor === 'string' && chipChrome.backgroundColor.trim()
          ? String(chipChrome.backgroundColor)
          : '#0a0a0a';
  const stackBorderWidth = iconBorder === 'none' ? 0 : iconBorder === 'soft' ? 1 : 2;
  const stackBg =
    typeof chipChrome?.backgroundColor === 'string' && chipChrome.backgroundColor.trim()
      ? String(chipChrome.backgroundColor)
      : undefined;

  const iconChipSize = pixel + pad * 2;

  const iconsRow = stacked ? (
    <PortfolioToolsStackedIcons
      tools={tools}
      toolIcons={toolIcons}
      sizePx={iconChipSize}
      borderColor={stackBorder}
      borderWidth={stackBorderWidth}
      shellBackground={stackBg}
    />
  ) : (
    <div
      className="flex flex-wrap items-center justify-start"
      style={{ gap }}
    >
      {tools.map((tool) =>
        iconsOnly ? (
          <span
            key={tool}
            className={`inline-flex shrink-0 items-center justify-center rounded-full ${borderClass}`}
            style={{
              ...chipChrome,
              width: iconChipSize,
              height: iconChipSize,
              padding: pad,
            }}
            title={tool}
          >
            <CreatorToolLogo label={tool} iconUrl={toolIcons?.[tool] ?? null} size={pixel} />
          </span>
        ) : (
          <span
            key={tool}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full ${borderClass} ${typeClass}`}
            style={{
              ...chipChrome,
              ...typeStyle,
              paddingTop: pad,
              paddingBottom: pad,
              paddingLeft: pad,
              paddingRight: pad + 6,
            }}
            title={tool}
          >
            <CreatorToolLogo label={tool} iconUrl={toolIcons?.[tool] ?? null} size={pixel} />
            <span className="max-w-[9rem] truncate">{tool}</span>
          </span>
        )
      )}
    </div>
  );

  const heading = (
    <ExperienceBlockHeading label={label} show={showHeading} textStyle={labelStyle} />
  );

  if (!chromeEnabled) {
    return (
      <div>
        {heading}
        {iconsRow}
      </div>
    );
  }

  if (chromeFit) {
    return (
      <div>
        {heading}
        <div className={chromeClass} style={chromeStyle}>
          {iconsRow}
        </div>
      </div>
    );
  }

  return (
    <div className={chromeClass} style={chromeStyle}>
      {heading}
      {iconsRow}
    </div>
  );
}

function ExperienceEntryMedia({
  block,
  presentation,
  className = '',
  fillHeight = false,
}: {
  block: ProfileMediaBlock;
  presentation: PortfolioExperiencePresentationSettings;
  className?: string;
  /** Stretch to the sibling column height (Magazine 3-col split). */
  fillHeight?: boolean;
}) {
  const mediaUrl = typeof block.mediaUrl === 'string' ? block.mediaUrl.trim() : '';
  if (!mediaUrl) return null;

  const placement = presentation.entryMediaPlacement ?? 'aside-right';
  const size = presentation.entryMediaSize ?? 'md';
  const radius = presentation.entryMediaRadius ?? 'lg';
  const aspect = presentation.entryMediaAspect ?? '4/5';
  const fit = presentation.entryMediaFit ?? 'cover';
  const positionClass = experienceEntryMediaPositionClass(
    presentation.entryMediaPosition ?? 'center'
  );
  const fixedHeight = fillHeight || experienceEntryMediaUsesFixedHeight(presentation);
  const aspectClass = fixedHeight ? '' : experienceEntryMediaAspectClass(aspect);
  const sizeClass = fillHeight
    ? 'w-full max-w-none'
    : experienceEntryMediaSizeClass(size, placement);
  const sizeStyle = {
    ...experienceEntryMediaSizeStyle(presentation),
    ...experienceEntryMediaHeightStyle(presentation),
  };
  const radiusClass = experienceEntryMediaRadiusClass(radius);
  const alt = block.title?.trim() || 'Experience media';
  const mediaDarkness = Math.min(
    200,
    Math.max(0, presentation.entryMediaDarkness ?? 0)
  ) / 100;
  const darknessLayer =
    mediaDarkness > 0 ? (
      <span
        className="pointer-events-none absolute inset-0 z-10 bg-black"
        style={{ opacity: Math.min(1, mediaDarkness) }}
        aria-hidden
      />
    ) : null;

  return (
    <div
      className={`flex w-full shrink-0 items-center justify-center overflow-hidden border border-neutral-200/80 bg-neutral-950/5 shadow-sm lg:mx-0 ${radiusClass} ${sizeClass} ${
        fillHeight ? 'h-full min-h-[16rem] lg:min-h-0' : ''
      } ${className}`.trim()}
      style={Object.keys(sizeStyle).length > 0 ? sizeStyle : undefined}
    >
      {fixedHeight || aspectClass ? (
        <div
          className={`relative w-full overflow-hidden ${
            fillHeight ? 'h-full min-h-[16rem]' : fixedHeight ? 'h-full min-h-0' : aspectClass
          }`}
        >
          <ProductThumbnailMedia
            url={mediaUrl}
            alt={alt}
            fit={fit}
            className={`absolute inset-0 h-full w-full ${positionClass}`}
          />
          {darknessLayer}
        </div>
      ) : (
        <div className="relative flex w-full items-center justify-center overflow-hidden">
          <ProductThumbnailMedia
            url={mediaUrl}
            alt={alt}
            fit={fit}
            className={`mx-auto h-auto max-h-[22rem] w-full ${positionClass}`}
          />
          {darknessLayer}
        </div>
      )}
    </div>
  );
}

/** Entry media with optional Proof links stacked underneath (proofZone === under-media). */
function ExperienceMediaWithOptionalProof({
  block,
  presentation,
  fillHeight = false,
}: {
  block: ProfileMediaBlock;
  presentation: PortfolioExperiencePresentationSettings;
  fillHeight?: boolean;
}) {
  const media = (
    <ExperienceEntryMedia block={block} presentation={presentation} fillHeight={fillHeight} />
  );
  const { links } = resolveExperienceContent(block);
  const proofLinks = presentation.showProof !== false ? links : [];
  const styles = normalizeExperienceElementStyles(presentation.elementStyles);
  const accent = experienceAccentColor(presentation.accentColor);
  const proofUnder =
    presentation.proofZone === 'under-media' &&
    presentation.showProof !== false &&
    proofLinks.length > 0 ? (
      <ExperienceEntryLinks
        links={proofLinks}
        accent={accent}
        label={resolveExperienceBlockLabel(presentation.proofLabel, 'Proof')}
        showLabel={experienceBlockLabelVisible(presentation, 'proof')}
        labelStyle={styles.blockLabel}
        textStyle={styles.proof}
        chipChrome={experienceChipChromeStyle(presentation)}
        softChipChrome={experienceSoftChipChromeStyle(presentation)}
        linkStyle={presentation.proofLinkStyle ?? 'pill'}
      />
    ) : null;

  if (!proofUnder) return media;

  return (
    <div
      className={`flex w-full max-w-full shrink-0 flex-col gap-3 ${
        fillHeight ? 'h-full' : 'items-center lg:w-fit'
      }`}
    >
      {media}
      {proofUnder}
    </div>
  );
}

function wrapExperienceEntryWithMedia(
  content: React.ReactNode,
  block: ProfileMediaBlock,
  presentation: PortfolioExperiencePresentationSettings
): React.ReactNode {
  if (!experienceEntryHasMedia(block, presentation)) {
    return content;
  }

  const placement = presentation.entryMediaPlacement ?? 'aside-right';
  // Outside placements are wrapped at the shell level (see wrapExperienceEntryOuterMedia).
  if (experienceEntryMediaIsOutside(placement)) {
    return content;
  }

  const media = <ExperienceMediaWithOptionalProof block={block} presentation={presentation} />;
  const densityGap =
    presentation.itemDensity === 'compact' ? 'gap-4 lg:gap-5' : 'gap-5 sm:gap-6 lg:gap-8';

  if (placement === 'story-top' || placement === 'entry-top') {
    return (
      <div className={`flex min-w-0 flex-col ${densityGap}`}>
        <div className="flex w-full shrink-0 justify-center">{media}</div>
        <div className="min-w-0 flex-1">{content}</div>
      </div>
    );
  }

  // aside-right / aside-left — media after text in DOM; reverse for left placement on lg+.
  const flexDirection =
    placement === 'aside-left' ? 'lg:flex-row-reverse' : 'lg:flex-row';

  return (
    <div className={`flex min-w-0 flex-col ${flexDirection} lg:items-center ${densityGap}`}>
      <div className="min-w-0 flex-1">{content}</div>
      <div className="flex w-full shrink-0 justify-center lg:w-auto">{media}</div>
    </div>
  );
}

/** Places outside-* media beside the painted card shell (not inside the chrome). */
function wrapExperienceEntryOuterMedia(
  entryShell: React.ReactNode,
  block: ProfileMediaBlock,
  presentation: PortfolioExperiencePresentationSettings
): React.ReactNode {
  if (!experienceEntryHasMedia(block, presentation)) {
    return entryShell;
  }

  const placement = presentation.entryMediaPlacement ?? 'aside-right';
  if (!experienceEntryMediaIsOutside(placement)) {
    return entryShell;
  }

  const media = <ExperienceMediaWithOptionalProof block={block} presentation={presentation} />;
  const densityGap =
    presentation.itemDensity === 'compact' ? 'gap-4 lg:gap-5' : 'gap-5 sm:gap-6 lg:gap-8';
  const sticky =
    presentation.entryMediaSticky !== false
      ? 'lg:sticky lg:top-24 lg:self-start'
      : '';

  return (
    <div
      className={`flex min-w-0 flex-col ${densityGap} lg:flex-row lg:items-center ${
        placement === 'outside-left' ? 'lg:flex-row-reverse' : ''
      }`}
    >
      <div className="min-w-0 flex-1">{entryShell}</div>
      <div
        className={[
          'flex w-full shrink-0 justify-center lg:w-auto',
          'order-first lg:order-none',
          sticky,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {media}
      </div>
    </div>
  );
}

function ExperienceEntryBody({
  title,
  organization,
  description,
  tags,
  status,
  tasks,
  tools,
  toolIcons,
  links,
  remarks,
  location,
  employmentType,
  accent,
  titleClassName = 'text-2xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-3xl',
  layout = 'split',
  period = null,
  asidePlacement = 'right',
  stackColumnsForSplitNav = false,
  detailsPanelClassName,
  detailsPanelStyle,
  detailsSecondaryPanelClassName,
  detailsSecondaryPanelStyle,
  storyPanelClassName,
  storyPanelStyle,
  storyCardBackground = null,
  detailsCardBackground = null,
  detailsSecondaryCardBackground = null,
  toolsSeparatorStyle = null,
  hairlineBorderTopStyle = null,
  hairlineBorderBottomStyle = null,
  hairlineColor = null,
  storyContentGapStyle,
  detailsContentGapStyle,
  density = 'comfortable',
  elementOrder,
  elementZones,
  toolsZone = 'details',
  proofZone = 'details',
  toolsEntrySide = 'left',
  toolsDisplay = 'icons-and-labels',
  toolsIconSize = 'md',
  toolsIconBorder = 'solid',
  toolsIconChrome,
  toolsIconPaddingPx = 10,
  toolsIconGapPx = 8,
  toolsChrome,
  showBlockLabels = true,
  tasksLabel = '',
  proofLabel = '',
  noteLabel = '',
  skillsLabel = '',
  toolsLabel = '',
  skillsTagStyle = 'soft',
  statusBadgeStyle = 'pill',
  proofLinkStyle = 'pill',
  elementStyles,
  chipChrome,
  softChipChrome,
  taskBulletSource = 'section',
  taskBulletStyle = 'disc',
  taskBulletColor,
  taskBulletSize = 'md',
  taskBulletSizePx,
  taskBulletWeight = 'regular',
  taskBulletWeightAmount,
  taskItemGap = 'md',
  blockLabelVisibility,
  mediaSlot = null,
  mediaAside = 'right',
  bentoDetailsPlacement = 'aside',
  entryMediaSize = 'md',
  magazineColumnRatio = 'media-wide',
}: ExperienceBodyProps) {
  const order = normalizeExperienceElementOrder(elementOrder);
  const zones = normalizeExperienceElementZones(elementZones);
  const styles = normalizeExperienceElementStyles(elementStyles);
  const storyOrder = order.filter((id) => isExperienceStoryElement(id, toolsZone, zones, proofZone));
  const detailsOrder = order.filter((id) => isExperienceDetailsElement(id, toolsZone, zones, proofZone));
  const sectionGap = density === 'compact' ? 'space-y-3' : 'space-y-4';
  const storyClassName = storyPanelClassName ?? sectionGap;
  const asideClassName =
    detailsPanelClassName ??
    (density === 'compact'
      ? 'space-y-4 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4'
      : 'space-y-6 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-5 sm:p-6');
  const secondaryAsideClassName =
    detailsSecondaryPanelClassName ?? asideClassName;
  const hasBentoMedia = Boolean(mediaSlot);

  const detailsTasksIds = detailsOrder.filter((id) => id === 'tasks');
  const detailsSecondaryIds = detailsOrder.filter((id) => id !== 'tasks');

  const elementCtx = {
    title,
    organization,
    description,
    tags,
    status,
    tasks,
    tools,
    toolIcons,
    links,
    remarks,
    location,
    employmentType,
    accent,
    titleClassName,
    statusPlacement: layout === 'magazine' ? ('byline' as const) : ('title' as const),
    toolsDisplay,
    toolsIconSize,
    toolsIconBorder,
    toolsIconChrome,
    toolsIconPaddingPx,
    toolsIconGapPx,
    toolsChrome,
    showBlockLabels,
    tasksLabel,
    proofLabel,
    noteLabel,
    skillsLabel,
    toolsLabel,
    skillsTagStyle,
    statusBadgeStyle,
    proofLinkStyle,
    elementStyles: styles,
    chipChrome,
    softChipChrome,
    taskBulletSource,
    taskBulletStyle,
    taskBulletColor: taskBulletColor || accent,
    taskBulletSize,
    taskBulletSizePx,
    taskBulletWeight,
    taskBulletWeightAmount,
    taskItemGap,
    blockLabelVisibility,
  };

  const storyColumn = (
    <ExperienceOrderedColumn
      ids={storyOrder}
      className={storyClassName}
      style={storyPanelStyle}
      childrenGapClass={sectionGap}
      contentGapStyle={storyContentGapStyle}
      cardBackground={storyCardBackground}
      toolsSeparatorStyle={toolsSeparatorStyle}
      render={(id) => renderExperienceElement(id, elementCtx)}
    />
  );

  const detailsAside =
    detailsTasksIds.length > 0 && detailsSecondaryIds.length > 0 ? (
      <div className="flex min-h-0 min-w-0 flex-col gap-4 sm:gap-5">
        <ExperienceOrderedColumn
          ids={detailsTasksIds}
          className={asideClassName}
          style={detailsPanelStyle}
          childrenGapClass={sectionGap}
          contentGapStyle={detailsContentGapStyle}
          cardBackground={detailsCardBackground}
          toolsSeparatorStyle={toolsSeparatorStyle}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
        <ExperienceOrderedColumn
          ids={detailsSecondaryIds}
          className={secondaryAsideClassName}
          style={detailsSecondaryPanelStyle}
          childrenGapClass={sectionGap}
          contentGapStyle={detailsContentGapStyle}
          cardBackground={detailsSecondaryCardBackground}
          toolsSeparatorStyle={toolsSeparatorStyle}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
      </div>
    ) : (
      <ExperienceOrderedColumn
        ids={detailsOrder}
        className={detailsTasksIds.length > 0 ? asideClassName : secondaryAsideClassName}
        style={
          detailsTasksIds.length > 0
            ? detailsPanelStyle
            : (detailsSecondaryPanelStyle)
        }
        childrenGapClass={sectionGap}
        contentGapStyle={detailsContentGapStyle}
        cardBackground={
          detailsTasksIds.length > 0
            ? detailsCardBackground
            : (detailsSecondaryCardBackground)
        }
        toolsSeparatorStyle={toolsSeparatorStyle}
        render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
      />
    );

  const entryToolsInline =
    toolsZone === 'entry' && tools.length > 0 ? (
      <div className="mt-4 pt-4" style={toolsSeparatorStyle ?? undefined}>
        <ExperienceEntryTools
          tools={tools}
          display={toolsDisplay}
          iconSize={toolsIconSize}
          iconBorder={toolsIconBorder}
          iconPaddingPx={toolsIconPaddingPx}
          iconGapPx={toolsIconGapPx}
          toolsChrome={toolsChrome}
          showHeading={false}
          textStyle={styles.tools}
          chipChrome={toolsIconChrome ?? chipChrome}
        />
      </div>
    ) : null;

  const withEntryToolsBelow = (content: React.ReactNode) => (
    <div className="min-w-0">
      {content}
      {toolsZone === 'entry' && tools.length > 0 && layout !== 'split' ? (
        <div
          className={`mt-4 pt-4 ${
            toolsEntrySide === 'right' ? 'flex justify-end' : 'flex justify-start'
          }`}
          style={toolsSeparatorStyle ?? undefined}
        >
          <ExperienceEntryTools
            tools={tools}
            display={toolsDisplay}
            iconSize={toolsIconSize}
            iconBorder={toolsIconBorder}
            iconPaddingPx={toolsIconPaddingPx}
            iconGapPx={toolsIconGapPx}
            toolsChrome={toolsChrome}
            showHeading={false}
            textStyle={styles.tools}
            chipChrome={toolsIconChrome ?? chipChrome}
          />
        </div>
      ) : null}
    </div>
  );

  /** Stepped cards — story left + unified technical fiche right (skills footer + proof CTA). */
  if (layout === 'stepped') {
    const storyIds = order.filter(
      (id) => id === 'title' || id === 'organization' || id === 'description'
    );
    const showSkills = tags.length > 0;
    const showProof = links.length > 0;
    const hairlineTop = hairlineBorderTopStyle ?? undefined;
    const ficheBorderColor = hairlineColor ?? undefined;
    const ficheClass =
      detailsPanelClassName ??
      'relative overflow-hidden rounded-2xl border bg-black/25 p-5 sm:p-6';
    const ficheShellStyle: CSSProperties | undefined =
      detailsPanelStyle || ficheBorderColor
        ? {
            ...detailsPanelStyle,
            ...(ficheBorderColor && !detailsPanelStyle?.borderColor
              ? { borderColor: ficheBorderColor }
              : null),
          }
        : undefined;

    const ficheCtx = { ...elementCtx, denseTasks: true as const, status: null };
    // Gate on data, not JSX — renderExperienceElement always returns an element,
    // even when Tasks/Tools/Note later render null (which left empty bordered wrappers).
    const ficheHasContent = (id: PortfolioExperienceElementId): boolean => {
      if (id === 'tasks') return tasks.length > 0;
      if (id === 'tools') return tools.length > 0;
      if (id === 'note') return Boolean(remarks?.trim());
      return false;
    };
    const visibleFicheItems = order
      .filter((id) => id === 'tasks' || id === 'tools' || id === 'note')
      .filter(ficheHasContent)
      .map((id) => ({ id, node: renderExperienceElement(id, ficheCtx) }));
    const hasFicheAboveProof = visibleFicheItems.length > 0;

    const storyBlock = (
      <div className="flex min-h-0 min-w-0 flex-col">
        <ExperienceOrderedColumn
          ids={storyIds}
          className="min-w-0 flex-1"
          childrenGapClass={density === 'compact' ? 'space-y-3' : 'space-y-4'}
          contentGapStyle={storyContentGapStyle}
          cardBackground={null}
          toolsSeparatorStyle={null}
          render={(id) => renderExperienceElement(id, { ...elementCtx, status: null })}
        />
        {showSkills ? (
          <div className="mt-auto pt-4 sm:pt-5" style={hairlineTop}>
            <p
              className={`leading-relaxed opacity-70 ${experienceTextStyleClass(styles.skills, 'body')}`}
              style={experienceTextInlineStyle(styles.skills)}
            >
              {tags.join(' · ')}
            </p>
          </div>
        ) : null}
      </div>
    );

    const ficheBlock = (
      <div className={ficheClass} style={ficheShellStyle}>
        {detailsCardBackground ? (
          <ServicesCardBackgroundLayers presentation={detailsCardBackground} />
        ) : null}
        <div className="relative z-[1] flex min-h-0 flex-col">
          {visibleFicheItems.map((item, index) => {
            const hasSectionBelow = index < visibleFicheItems.length - 1 || showProof;
            return (
              <div
                key={item.id}
                className={[
                  index > 0 ? 'pt-5 sm:pt-6' : null,
                  hasSectionBelow ? 'pb-5 sm:pb-6' : null,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined}
                style={index > 0 ? hairlineTop : undefined}
              >
                {item.node}
              </div>
            );
          })}
          {showProof ? (
            <div
              className={hasFicheAboveProof ? 'mt-auto pt-5 sm:pt-6' : 'mt-auto'}
              style={hasFicheAboveProof ? hairlineTop : undefined}
            >
              <ExperienceEntryLinks
                links={links}
                accent={accent}
                showLabel={false}
                textStyle={styles.proof}
                fullWidth
              />
            </div>
          ) : null}
        </div>
      </div>
    );

    if (stackColumnsForSplitNav) {
      return (
        <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
          {storyBlock}
          {ficheBlock}
        </div>
      );
    }

    return (
      <div className="grid min-w-0 items-stretch gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.9fr)]">
        {storyBlock}
        {ficheBlock}
      </div>
    );
  }

  /** Magazine — equal 3-col split on large screens, no chrome separators. */
  if (layout === 'magazine') {
    const detailsUnderStory = bentoDetailsPlacement === 'under-story';
    const magazineTwoColumnClass =
      magazineColumnRatio === 'balanced'
        ? 'lg:grid-cols-2'
        : magazineColumnRatio === 'media-wide'
          ? mediaAside === 'left'
            ? 'lg:grid-cols-[minmax(14rem,1.65fr)_minmax(0,0.85fr)]'
            : 'lg:grid-cols-[minmax(0,0.85fr)_minmax(14rem,1.65fr)]'
          : mediaAside === 'left'
            ? 'lg:grid-cols-[minmax(14rem,0.85fr)_minmax(0,1.65fr)]'
            : 'lg:grid-cols-[minmax(0,1.65fr)_minmax(14rem,0.85fr)]';

    const periodNode = period ? (
      <p
        className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] sm:mb-4 ${experienceTextStyleClass(styles.meta, 'label')}`}
        style={{
          ...experienceTextInlineStyle(styles.meta),
          color: accent,
          opacity: 0.9,
        }}
      >
        {period}
      </p>
    ) : null;

    // Frameless fiche — no border / gray plate between columns.
    const magazineFiche =
      detailsOrder.length > 0 ? (
        <ExperienceOrderedColumn
          ids={detailsOrder}
          className="min-w-0"
          childrenGapClass={density === 'compact' ? 'space-y-4' : 'space-y-5'}
          contentGapStyle={detailsContentGapStyle}
          cardBackground={null}
          toolsSeparatorStyle={null}
          divided={false}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
      ) : null;

    const magazineMedia = hasBentoMedia ? (
      <div className="min-w-0 w-full lg:h-full lg:self-stretch">{mediaSlot}</div>
    ) : null;

    if (detailsUnderStory) {
      // Story stays whole; only the tech sheet drops under the description.
      // Large screens → 2 unequal columns: info (flex) | media.
      const infoColumn = (
        <div className={`min-w-0 flex flex-col ${density === 'compact' ? 'gap-4' : 'gap-5 sm:gap-6'}`}>
          {periodNode}
          <ExperienceOrderedColumn
            ids={storyOrder}
            childrenGapClass={sectionGap}
            contentGapStyle={storyContentGapStyle}
            cardBackground={storyCardBackground}
            toolsSeparatorStyle={toolsSeparatorStyle}
            render={(id) => renderExperienceElement(id, elementCtx)}
          />
          {magazineFiche}
        </div>
      );

      if (magazineMedia) {
        return withEntryToolsBelow(
          <div
            className={`grid w-full grid-cols-1 items-start gap-6 sm:gap-8 ${magazineTwoColumnClass} lg:items-stretch lg:gap-8 xl:gap-10`}
          >
            {mediaAside === 'left' ? (
              <>
                {magazineMedia}
                {infoColumn}
              </>
            ) : (
              <>
                {infoColumn}
                {magazineMedia}
              </>
            )}
          </div>
        );
      }

      return withEntryToolsBelow(infoColumn);
    }

    const magazineStory = (
      <div className="min-w-0">
        {periodNode}
        <ExperienceOrderedColumn
          ids={storyOrder}
          childrenGapClass={sectionGap}
          contentGapStyle={storyContentGapStyle}
          cardBackground={storyCardBackground}
          toolsSeparatorStyle={toolsSeparatorStyle}
          render={(id) => renderExperienceElement(id, elementCtx)}
        />
      </div>
    );

    if (magazineMedia) {
      if (magazineFiche) {
        return withEntryToolsBelow(
          <div className="grid w-full grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-3 lg:items-stretch lg:gap-8 xl:gap-10">
            {mediaAside === 'left' ? (
              <>
                {magazineMedia}
                {magazineStory}
                {magazineFiche}
              </>
            ) : (
              <>
                {magazineStory}
                {magazineFiche}
                {magazineMedia}
              </>
            )}
          </div>
        );
      }
      return withEntryToolsBelow(
        <div
          className={`grid w-full grid-cols-1 items-start gap-6 sm:gap-8 ${magazineTwoColumnClass} lg:items-stretch lg:gap-8 xl:gap-10`}
        >
          {mediaAside === 'left' ? (
            <>
              {magazineMedia}
              {magazineStory}
            </>
          ) : (
            <>
              {magazineStory}
              {magazineMedia}
            </>
          )}
        </div>
      );
    }

    return withEntryToolsBelow(
      <div className="grid w-full grid-cols-1 items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-8 xl:gap-10">
        {magazineStory}
        {magazineFiche}
      </div>
    );
  }

  if (layout === 'compact') {
    const compactTasksIds = detailsOrder.filter((id) => id === 'tasks');
    const compactProofIds = detailsOrder.filter((id) => id === 'proof');
    const compactAside =
      compactTasksIds.length > 0 && compactProofIds.length > 0 ? (
        <div className="flex min-h-0 min-w-0 flex-col gap-4 sm:gap-5">
          <ExperienceOrderedColumn
            ids={compactTasksIds}
            className={asideClassName}
            style={detailsPanelStyle}
            childrenGapClass={density === 'compact' ? 'space-y-4' : 'space-y-5'}
            contentGapStyle={detailsContentGapStyle}
            cardBackground={detailsCardBackground}
            toolsSeparatorStyle={toolsSeparatorStyle}
            render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
          />
          <ExperienceOrderedColumn
            ids={compactProofIds}
            className={secondaryAsideClassName}
            style={detailsSecondaryPanelStyle}
            childrenGapClass={density === 'compact' ? 'space-y-4' : 'space-y-5'}
            contentGapStyle={detailsContentGapStyle}
            cardBackground={detailsSecondaryCardBackground}
            toolsSeparatorStyle={toolsSeparatorStyle}
            render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
          />
        </div>
      ) : (
        <ExperienceOrderedColumn
          ids={detailsOrder.filter((id) => id === 'tasks' || id === 'proof')}
          className={compactTasksIds.length > 0 ? asideClassName : secondaryAsideClassName}
          style={
            compactTasksIds.length > 0
              ? detailsPanelStyle
              : (detailsSecondaryPanelStyle)
          }
          childrenGapClass={density === 'compact' ? 'space-y-4' : 'space-y-5'}
          contentGapStyle={detailsContentGapStyle}
          cardBackground={
            compactTasksIds.length > 0
              ? detailsCardBackground
              : (detailsSecondaryCardBackground)
          }
          toolsSeparatorStyle={toolsSeparatorStyle}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
      );

    return withEntryToolsBelow(
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.85fr)]">
        <ExperienceOrderedColumn
          ids={[
            ...storyOrder,
            ...detailsOrder.filter((id) => id === 'note' || id === 'skills' || id === 'tools'),
          ]}
          className={storyClassName}
          style={storyPanelStyle}
          childrenGapClass={sectionGap}
          contentGapStyle={storyContentGapStyle}
          cardBackground={storyCardBackground}
          toolsSeparatorStyle={toolsSeparatorStyle}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
        {compactAside}
      </div>
    );
  }

  if (layout === 'bento') {
    const detailsUnderMedia = bentoDetailsPlacement === 'under-media' && hasBentoMedia;
    const detailsUnderStory = bentoDetailsPlacement === 'under-story';
    const detailsNotAside = detailsUnderMedia || detailsUnderStory;
    const zoneClass = `${asideClassName}${detailsNotAside ? '' : ' h-full'}`.trim();
    const secondaryZoneClass = `${secondaryAsideClassName}${detailsNotAside ? '' : ' h-full'}`.trim();
    const storyIds = [
      ...storyOrder.filter((id) => id === 'description' || id === 'tools'),
      ...detailsOrder.filter((id) => id === 'note' || id === 'tools'),
    ];
    const tasksIds = detailsOrder.filter((id) => id === 'tasks');
    const proofSkillsIds = detailsOrder.filter((id) => id === 'proof' || id === 'skills');

    const storyColumnNode = (
      <ExperienceOrderedColumn
        ids={storyIds}
        className={`min-w-0 ${storyClassName}`}
        style={storyPanelStyle}
        childrenGapClass={sectionGap}
        contentGapStyle={storyContentGapStyle}
        cardBackground={storyCardBackground}
        toolsSeparatorStyle={toolsSeparatorStyle}
        render={(id) => renderExperienceElement(id, elementCtx)}
      />
    );

    const detailsStackNode = (
      <div className="flex min-h-0 min-w-0 flex-col gap-4 sm:gap-5">
        {tasksIds.length > 0 ? (
          <ExperienceOrderedColumn
            ids={tasksIds}
            className={zoneClass}
            style={detailsPanelStyle}
            childrenGapClass={sectionGap}
            contentGapStyle={detailsContentGapStyle}
            cardBackground={detailsCardBackground}
            toolsSeparatorStyle={toolsSeparatorStyle}
            render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
          />
        ) : null}
        {proofSkillsIds.length > 0 ? (
          <ExperienceOrderedColumn
            ids={proofSkillsIds}
            className={secondaryZoneClass}
            style={detailsSecondaryPanelStyle}
            childrenGapClass={sectionGap}
            contentGapStyle={detailsContentGapStyle}
            cardBackground={detailsSecondaryCardBackground}
            toolsSeparatorStyle={toolsSeparatorStyle}
            render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
          />
        ) : null}
      </div>
    );

    const mediaColumnNode = hasBentoMedia ? (
      <div
        className={`w-full max-w-full shrink-0 justify-self-stretch lg:w-fit lg:justify-self-start lg:self-start ${
          entryMediaSize === 'full' ? 'min-w-0' : ''
        }`}
      >
        {mediaSlot}
      </div>
    ) : null;

    const storyWithDetailsNode = detailsUnderStory ? (
      <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
        {storyColumnNode}
        {detailsStackNode}
      </div>
    ) : null;

    const bentoHeaderStatus =
      status === 'ONGOING' || status === 'FINISHED' ? (
        <div className="shrink-0 pt-0.5 sm:pt-1.5">
          <ExperienceStatusBadge
            status={status}
            accent={accent}
            textStyle={styles.meta}
            softChipChrome={softChipChrome}
            badgeStyle={statusBadgeStyle}
          />
        </div>
      ) : null;

    return withEntryToolsBelow(
      <>
        <div className="mb-6 flex w-full flex-wrap items-start gap-x-4 gap-y-3 sm:mb-8">
          <ExperienceOrderedColumn
            ids={storyOrder.filter((id) => id === 'title' || id === 'organization')}
            className="min-w-0 flex-1 basis-[min(100%,28rem)]"
            childrenGapClass={sectionGap}
            contentGapStyle={storyContentGapStyle}
            render={(id) =>
              renderExperienceElement(id, {
                ...elementCtx,
                // Status is rendered on the far right of the bento header row.
                status: null,
              })
            }
          />
          {(storyOrder.includes('meta') || bentoHeaderStatus) ? (
            <div className="ml-auto flex shrink-0 items-start gap-3">
              {storyOrder.includes('meta') ? (
                <div className="pt-1">{renderExperienceElement('meta', elementCtx)}</div>
              ) : null}
              {bentoHeaderStatus}
            </div>
          ) : null}
        </div>

        {hasBentoMedia ? (
          detailsUnderMedia ? (
            <div className="grid w-full max-w-full items-start gap-4 sm:gap-5 lg:w-fit lg:gap-6 lg:grid-cols-[auto_auto]">
              {mediaAside === 'left' ? (
                <>
                  {mediaColumnNode}
                  {storyColumnNode}
                </>
              ) : (
                <>
                  {storyColumnNode}
                  {mediaColumnNode}
                </>
              )}
              <div className="col-span-full min-w-0 w-full">{detailsStackNode}</div>
            </div>
          ) : detailsUnderStory ? (
            <div className="grid w-full max-w-full items-start gap-4 sm:gap-5 lg:w-fit lg:gap-6 lg:grid-cols-[auto_auto]">
              {mediaAside === 'left' ? (
                <>
                  {mediaColumnNode}
                  {storyWithDetailsNode}
                </>
              ) : (
                <>
                  {storyWithDetailsNode}
                  {mediaColumnNode}
                </>
              )}
            </div>
          ) : (
            <div
              className={`grid w-full items-start gap-4 sm:gap-5 lg:gap-6 ${
                mediaAside === 'left'
                  ? 'lg:grid-cols-[auto_minmax(0,1.2fr)_minmax(12rem,0.9fr)]'
                  : 'lg:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.9fr)_auto]'
              }`}
            >
              {mediaAside === 'left' ? mediaColumnNode : null}
              {storyColumnNode}
              {detailsStackNode}
              {mediaAside === 'right' ? mediaColumnNode : null}
            </div>
          )
        ) : detailsUnderStory ? (
          <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
            {storyColumnNode}
            {detailsStackNode}
          </div>
        ) : (
          <div className="grid items-start gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-12">
            <div className="md:col-span-2 xl:col-span-6">{storyColumnNode}</div>
            <div className="xl:col-span-3">
              {tasksIds.length > 0 ? (
                <ExperienceOrderedColumn
                  ids={tasksIds}
                  className={zoneClass}
                  style={detailsPanelStyle}
                  childrenGapClass={sectionGap}
                  contentGapStyle={detailsContentGapStyle}
                  cardBackground={detailsCardBackground}
                  toolsSeparatorStyle={toolsSeparatorStyle}
                  render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
                />
              ) : null}
            </div>
            <div className="xl:col-span-3">
              {proofSkillsIds.length > 0 ? (
                <ExperienceOrderedColumn
                  ids={proofSkillsIds}
                  className={secondaryZoneClass}
                  style={detailsSecondaryPanelStyle}
                  childrenGapClass={sectionGap}
                  contentGapStyle={detailsContentGapStyle}
                  cardBackground={detailsSecondaryCardBackground}
                  toolsSeparatorStyle={toolsSeparatorStyle}
                  render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
                />
              ) : null}
            </div>
          </div>
        )}
      </>
    );
  }

  if (layout === 'stack') {
    const stackOrder = order.filter((id) => {
      if (id === 'tools' && toolsZone === 'entry') return false;
      if (id === 'proof' && proofZone === 'under-media') return false;
      return true;
    });
    return withEntryToolsBelow(
      <ExperienceOrderedColumn
        ids={stackOrder}
        className={storyClassName}
        style={storyPanelStyle}
        childrenGapClass={sectionGap}
        contentGapStyle={storyContentGapStyle}
        cardBackground={storyCardBackground}
        toolsSeparatorStyle={toolsSeparatorStyle}
        render={(id) => renderExperienceElement(id, elementCtx)}
      />
    );
  }

  // Split: tools sit directly under the chosen column card (not at the absolute entry bottom).
  const leftColumn = asidePlacement === 'left' ? detailsAside : storyColumn;
  const rightColumn = asidePlacement === 'left' ? storyColumn : detailsAside;

  // Forced vertical stack (e.g. split nav): respect Details placement for top/bottom order.
  // Details right → story on top, details below. Details left → details on top, story below.
  if (stackColumnsForSplitNav) {
    const topColumn = leftColumn;
    const bottomColumn = rightColumn;
    return (
      <div className="min-w-0">
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="min-w-0">
            {topColumn}
            {toolsEntrySide === 'left' ? entryToolsInline : null}
          </div>
          <div className="min-w-0">
            {bottomColumn}
            {toolsEntrySide === 'right' ? entryToolsInline : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="grid gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.9fr)] xl:items-start">
        <div className="min-w-0">
          {leftColumn}
          {toolsEntrySide === 'left' ? entryToolsInline : null}
        </div>
        <div className="min-w-0">
          {rightColumn}
          {toolsEntrySide === 'right' ? entryToolsInline : null}
        </div>
      </div>
    </div>
  );
}

function ExperienceTimelineRail({
  presentation,
  isLast,
  filled = false,
}: {
  presentation: PortfolioExperiencePresentationSettings;
  isLast: boolean;
  filled?: boolean;
}) {
  if (presentation.timelineRailEnabled === false) {
    return (
      <div className="relative flex h-full min-h-[5rem] justify-center">
        <div
          className={`relative z-[1] mt-1.5 shrink-0 rounded-full ${
            filled
              ? 'h-3.5 w-3.5 shadow-[0_0_0_4px_rgba(255,255,255,1)]'
              : 'h-3.5 w-3.5 border-2 bg-white'
          }`}
          style={experienceTimelineRailNodeStyle(presentation, filled)}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[5rem] justify-center">
      {!isLast ? (
        <div
          className="absolute bottom-0 top-3 w-px"
          style={experienceTimelineRailLineStyle(presentation, filled)}
          aria-hidden
        />
      ) : null}
      <div
        className={`relative z-[1] mt-1.5 shrink-0 rounded-full ${
          filled
            ? 'h-3.5 w-3.5 shadow-[0_0_0_4px_rgba(255,255,255,1)]'
            : 'h-3.5 w-3.5 border-2 bg-white'
        }`}
        style={experienceTimelineRailNodeStyle(presentation, filled)}
        aria-hidden
      />
    </div>
  );
}

export function EditorialExperienceYears({
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  years: number;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const template = resolveExperienceYearsTemplate(presentation);
  const marker = '{years}';
  const markerIndex = template.indexOf(marker);

  if (markerIndex === -1) {
    return (
      <p className={experienceYearsClass(presentation)} style={experienceYearsStyle(presentation)}>
        {template.replaceAll(marker, String(years))}
      </p>
    );
  }

  const before = template.slice(0, markerIndex);
  const after = template.slice(markerIndex + marker.length);
  const yearsNode = presentation.yearsBoldYears ? (
    <span className="font-bold" style={experienceYearsHighlightStyle(presentation)}>
      {years}
    </span>
  ) : (
    <span style={experienceYearsHighlightStyle(presentation)}>{years}</span>
  );

  return (
    <p className={experienceYearsClass(presentation)} style={experienceYearsStyle(presentation)}>
      {before}
      {yearsNode}
      {after}
    </p>
  );
}

export function EditorialExperienceBlock({
  block,
  index = 0,
  isLast = false,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  inMultiColumn = false,
  stackColumnsForSplitNav = false,
}: {
  block: ProfileMediaBlock;
  index?: number;
  isLast?: boolean;
  presentation?: PortfolioExperiencePresentationSettings;
  /** When true, prefer stacked body layout (cards in a 2–3 column grid). */
  inMultiColumn?: boolean;
  /**
   * Split-screen nav only: stack former right column on top, left column below
   * (story/details stay the same assignment — only orientation changes).
   */
  stackColumnsForSplitNav?: boolean;
}) {
  const {
    period,
    title,
    organization,
    description,
    tags,
    status,
    tasks,
    tools,
    toolIcons,
    links,
    remarks,
    location,
    employmentType,
  } = resolveExperienceContent(block);
  const accent = experienceAccentColor(presentation.accentColor);
  const design = presentation.experienceDesign;
  const entryLayers = experienceEntryShellUsesFrame(presentation)
    ? experienceLayerToCardFrameSettings({ ...presentation.entryFrame, enabled: true })
    : null;
  const shellClassBase = experienceEntryShellClass(presentation);
  const shellClass = entryLayers ? stripTailwindSpaceY(shellClassBase) : shellClassBase;
  const shellStyle = experienceEntryShellStyle(presentation);
  const bodyLayout = resolveExperienceBodyLayout(presentation, inMultiColumn);
  const detailsClass = experienceDetailsPanelClass(presentation);
  const detailsStyle = experienceDetailsPanelStyle(presentation);
  const detailsSecondaryClass = experienceDetailsSecondaryPanelClass(presentation);
  const detailsSecondaryStyle = experienceDetailsSecondaryPanelStyle(presentation);
  const storyClass = experienceStoryPanelClass(presentation);
  const storyStyle = experienceStoryPanelStyle(presentation);
  const hasEntryMedia = experienceEntryHasMedia(block, presentation);
  const effectiveProofZone =
    presentation.proofZone === 'under-media' && !hasEntryMedia
      ? 'details'
      : (presentation.proofZone ?? 'details');
  const bodyProps: ExperienceBodyProps = {
    title: presentation.showTitle ? title : null,
    organization: presentation.showOrganization ? organization : null,
    description: presentation.showDescription ? description : null,
    tags: presentation.showSkills ? tags : [],
    status: presentation.showMeta ? status : null,
    tasks: presentation.showTasks ? tasks : [],
    tools: presentation.showTools ? tools : [],
    toolIcons: presentation.showTools ? toolIcons : {},
    links: presentation.showProof ? links : [],
    remarks: design === 'timeline-editorial' ? null : presentation.showNote ? remarks : null,
    location: presentation.showMeta ? location : null,
    employmentType: presentation.showMeta ? employmentType : null,
    accent,
    asidePlacement: presentation.asidePlacement,
    stackColumnsForSplitNav,
    detailsPanelClassName: detailsClass || undefined,
    detailsPanelStyle: detailsStyle,
    detailsSecondaryPanelClassName: detailsSecondaryClass || undefined,
    detailsSecondaryPanelStyle: detailsSecondaryStyle,
    storyPanelClassName: storyClass || undefined,
    storyPanelStyle: storyStyle,
    storyCardBackground: presentation.storyFrame.enabled
      ? experienceLayerToCardFrameSettings(presentation.storyFrame)
      : null,
    detailsCardBackground:
      presentation.asidePlacement !== 'inline' &&
      presentation.detailsFrame.enabled &&
      presentation.detailsFrame.cardBackgroundEnabled
        ? experienceLayerToCardFrameSettings(presentation.detailsFrame)
        : null,
    detailsSecondaryCardBackground:
      presentation.asidePlacement !== 'inline' &&
      presentation.detailsSecondaryFrame.enabled &&
      presentation.detailsSecondaryFrame.cardBackgroundEnabled
        ? experienceLayerToCardFrameSettings(presentation.detailsSecondaryFrame)
        : null,
    toolsSeparatorStyle: experienceToolsSeparatorStyle(presentation) ?? null,
    hairlineBorderTopStyle: experienceHairlineBorderTopStyle(presentation),
    hairlineBorderBottomStyle: experienceHairlineBorderBottomStyle(presentation),
    hairlineColor: resolveExperienceHairlineColor(presentation),
    storyContentGapStyle: experienceStoryContentGapStyle(presentation),
    detailsContentGapStyle: experienceDetailsContentGapStyle(presentation),
    density: presentation.itemDensity,
    elementOrder: presentation.elementOrder,
    elementZones: presentation.elementZones,
    toolsZone: presentation.toolsZone,
    proofZone: effectiveProofZone,
    toolsEntrySide: presentation.toolsEntrySide,
    toolsDisplay: presentation.toolsDisplay,
    toolsIconSize: presentation.toolsIconSize,
    toolsIconBorder: presentation.toolsIconBorder ?? 'solid',
    toolsIconChrome: experienceToolsIconChromeStyle(presentation),
    toolsIconPaddingPx: presentation.toolsIconPaddingPx,
    toolsIconGapPx: presentation.toolsIconGapPx,
    toolsChrome: presentation.toolsChrome,
    showBlockLabels: presentation.showBlockLabels,
    blockLabelVisibility: presentation.blockLabelVisibility,
    tasksLabel: presentation.tasksLabel,
    proofLabel: presentation.proofLabel,
    noteLabel: presentation.noteLabel,
    skillsLabel: presentation.skillsLabel,
    toolsLabel: presentation.toolsLabel,
    skillsTagStyle: presentation.skillsTagStyle,
    statusBadgeStyle: presentation.statusBadgeStyle ?? 'pill',
    proofLinkStyle: presentation.proofLinkStyle,
    elementStyles: presentation.elementStyles,
    chipChrome: experienceChipChromeStyle(presentation),
    softChipChrome: experienceSoftChipChromeStyle(presentation),
    taskBulletSource: 'section',
    taskBulletStyle: presentation.taskBulletStyle,
    taskBulletColor: presentation.taskBulletColor,
    taskBulletSize: presentation.taskBulletSize,
    taskBulletSizePx: presentation.taskBulletSizePx,
    taskBulletWeight: presentation.taskBulletWeight,
    taskBulletWeightAmount: presentation.taskBulletWeightAmount,
    taskItemGap: presentation.taskItemGap ?? 'md',
    bentoDetailsPlacement: presentation.bentoDetailsPlacement ?? 'aside',
    entryMediaSize: presentation.entryMediaSize ?? 'md',
    magazineColumnRatio: presentation.magazineColumnRatio ?? 'media-wide',
  };
  const visiblePeriod = presentation.showPeriod ? period : null;
  const wrapEntryChrome = (content: React.ReactNode) =>
    entryLayers ? (
      <>
        <ServicesCardBackgroundLayers presentation={entryLayers} />
        <ServicesCardForeground>{content}</ServicesCardForeground>
      </>
    ) : (
      content
    );
  const wrapBody = (content: React.ReactNode) =>
    wrapExperienceEntryWithMedia(content, block, presentation);
  const wrapOuter = (shell: React.ReactNode) =>
    wrapExperienceEntryOuterMedia(shell, block, presentation);

  if (design === 'large') {
    const mediaPlacement = presentation.entryMediaPlacement ?? 'aside-right';
    const bentoAsideMedia =
      !inMultiColumn &&
      experienceEntryHasMedia(block, presentation) &&
      (mediaPlacement === 'aside-right' || mediaPlacement === 'aside-left') ? (
        <div
          className={
            presentation.entryMediaSticky !== false
              ? 'flex w-full justify-center lg:sticky lg:top-24 lg:w-auto lg:self-center'
              : 'flex w-full justify-center lg:w-auto'
          }
        >
          <ExperienceMediaWithOptionalProof block={block} presentation={presentation} />
        </div>
      ) : null;
    const useIntegratedBentoMedia = Boolean(bentoAsideMedia);

    return wrapOuter(
      <article
        className={`${shellClass} h-full`}
        style={shellStyle}
      >
        {wrapEntryChrome(
          <>
            <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-6">
              {visiblePeriod ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 sm:text-sm">
                  {visiblePeriod}
                </p>
              ) : null}
              {presentation.periodRuleEnabled !== false ? (
                <span
                  className="min-w-[3rem] flex-1"
                  style={experiencePeriodRuleStyle(presentation)}
                  aria-hidden
                />
              ) : null}
            </div>
            {useIntegratedBentoMedia ? (
              <ExperienceEntryBody
                {...bodyProps}
                layout="bento"
                mediaSlot={bentoAsideMedia}
                mediaAside={mediaPlacement === 'aside-left' ? 'left' : 'right'}
                titleClassName="text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-neutral-950 sm:text-4xl lg:text-5xl"
              />
            ) : (
              wrapBody(
                <ExperienceEntryBody
                  {...bodyProps}
                  layout={inMultiColumn ? 'stack' : bodyLayout === 'stack' ? 'stack' : 'bento'}
                  titleClassName={
                    inMultiColumn
                      ? 'text-2xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-3xl'
                      : 'text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-neutral-950 sm:text-4xl lg:text-5xl'
                  }
                />
              )
            )}
          </>
        )}
      </article>
    );
  }

  if (design === 'stacked') {
    return wrapOuter(
      <article className={`${shellClass} h-full`} style={shellStyle}>
        {wrapEntryChrome(
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
              {visiblePeriod ? (
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{ backgroundColor: `${accent}14`, color: accent }}
                >
                  {visiblePeriod}
                </span>
              ) : null}
            </div>
            {wrapBody(
              <ExperienceEntryBody
                {...bodyProps}
                layout={bodyLayout}
                titleClassName="text-xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-2xl lg:text-3xl"
              />
            )}
          </>
        )}
      </article>
    );
  }

  if (design === 'compact') {
    return wrapOuter(
      <article className={shellClass} style={shellStyle}>
        {wrapEntryChrome(
          <div className="grid gap-3 sm:gap-4 md:grid-cols-[6.5rem_minmax(0,1fr)] lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:gap-8">
            <p className="text-sm font-semibold tabular-nums text-neutral-400 md:pt-1">
              {visiblePeriod ?? '—'}
            </p>
            {wrapBody(<ExperienceEntryBody {...bodyProps} layout="compact" />)}
          </div>
        )}
      </article>
    );
  }

  if (design === 'timeline-accent') {
    return (
      <article className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-[5.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4 sm:pb-2 md:grid-cols-[7rem_2rem_minmax(0,1fr)] md:gap-x-6 lg:grid-cols-[8.5rem_2.25rem_minmax(0,1fr)]">
        <p className="text-sm font-semibold tabular-nums leading-snug sm:pt-1 sm:text-base" style={{ color: accent }}>
          {visiblePeriod ?? '—'}
        </p>
        <div className="hidden sm:block">
          <ExperienceTimelineRail presentation={presentation} isLast={isLast} filled />
        </div>
        {wrapOuter(
          <div className={`min-w-0 sm:pb-12 ${shellClass}`} style={shellStyle}>
            {wrapEntryChrome(wrapBody(<ExperienceEntryBody {...bodyProps} layout={bodyLayout} />))}
          </div>
        )}
      </article>
    );
  }

  if (design === 'timeline-editorial') {
    const mediaPlacement = presentation.entryMediaPlacement ?? 'aside-right';
    const magazineAsideMedia =
      !inMultiColumn &&
      experienceEntryHasMedia(block, presentation) &&
      (mediaPlacement === 'aside-right' || mediaPlacement === 'aside-left') ? (
        <div
          className={
            presentation.entryMediaSticky !== false
              ? 'flex h-full min-w-0 w-full lg:sticky lg:top-24 lg:self-stretch'
              : 'flex h-full min-w-0 w-full lg:self-stretch'
          }
        >
          <ExperienceMediaWithOptionalProof
            block={block}
            presentation={presentation}
            fillHeight
          />
        </div>
      ) : null;
    const useIntegratedMagazineMedia = Boolean(magazineAsideMedia);
    const magazineRailStyle = experienceMagazineRailStyle(presentation);
    const magazineSeparatorSpacingPx = Math.max(
      32,
      Math.min(160, Math.round(presentation.magazineSeparatorSpacingPx ?? 64))
    );
    const magazineEntryStyle: CSSProperties | undefined = isLast
      ? undefined
      : {
          ...experienceHairlineBorderBottomStyle(presentation, 50),
          paddingBottom: `${magazineSeparatorSpacingPx}px`,
        };

    return (
      <article
        className="relative mb-4 last:mb-0"
        style={magazineEntryStyle}
      >
        {magazineRailStyle ? (
          <div
            className="absolute bottom-0 left-0 top-0 hidden w-1 rounded-full lg:block"
            style={magazineRailStyle}
            aria-hidden
          />
        ) : null}
        {wrapOuter(
          <div className={`lg:pl-8 ${shellClass}`} style={shellStyle}>
            {wrapEntryChrome(
              useIntegratedMagazineMedia ? (
                <ExperienceEntryBody
                  {...bodyProps}
                  period={visiblePeriod}
                  layout={inMultiColumn ? 'stack' : 'magazine'}
                  mediaSlot={magazineAsideMedia}
                  mediaAside={mediaPlacement === 'aside-left' ? 'left' : 'right'}
                  titleClassName="text-2xl font-bold leading-[1.1] tracking-[-0.03em] text-neutral-950 sm:text-3xl lg:text-4xl"
                />
              ) : (
                wrapBody(
                  <ExperienceEntryBody
                    {...bodyProps}
                    period={visiblePeriod}
                    layout={inMultiColumn ? 'stack' : bodyLayout === 'stack' ? 'stack' : 'magazine'}
                    titleClassName="text-2xl font-bold leading-[1.1] tracking-[-0.03em] text-neutral-950 sm:text-3xl lg:text-4xl"
                  />
                )
              )
            )}
          </div>
        )}
      </article>
    );
  }

  if (design === 'timeline-stepped') {
    const step = String(index + 1).padStart(2, '0');
    const hasBannerMedia = experienceEntryHasMedia(block, presentation);
    const mediaUrl =
      typeof block.mediaUrl === 'string' && block.mediaUrl.trim() ? block.mediaUrl.trim() : '';
    const statusForBanner =
      presentation.showMeta && (status === 'ONGOING' || status === 'FINISHED') ? status : null;
    const styles = normalizeExperienceElementStyles(presentation.elementStyles);
    // Edge-to-edge banner: strip entry padding / vertical rhythm from the shell.
    const steppedFrameEnabled = experienceEntryShellUsesFrame(presentation);
    const steppedFrame = steppedFrameEnabled
      ? { ...presentation.entryFrame, enabled: true as const, cardPadding: 'none' as const }
      : null;
    const steppedShellClass = [
      steppedFrame
        ? experienceLayerFrameClass(steppedFrame, presentation.itemDensity)
            .split(/\s+/)
            .filter((token) => token && !token.startsWith('space-y-') && !/^p-/.test(token) && !/^sm:p-/.test(token) && !/^md:p-/.test(token) && !/^lg:p-/.test(token))
            .join(' ')
        : 'relative overflow-hidden rounded-2xl border border-neutral-200/80',
      'h-full',
    ]
      .filter(Boolean)
      .join(' ');
    const steppedShellStyle = steppedFrame
      ? experienceLayerFrameStyle(steppedFrame, accent)
      : shellStyle;
    const steppedChrome = (content: React.ReactNode) =>
      steppedFrame ? (
        <>
          <ServicesCardBackgroundLayers
            presentation={experienceLayerToCardFrameSettings(steppedFrame)}
          />
          <ServicesCardForeground>{content}</ServicesCardForeground>
        </>
      ) : (
        content
      );
    const statusBannerLabel =
      statusForBanner === 'ONGOING'
        ? 'Ongoing'
        : statusForBanner === 'FINISHED'
          ? 'Finished'
          : null;

    return (
      <article className={steppedShellClass} style={steppedShellStyle}>
        {steppedChrome(
          <div className="flex min-h-0 w-full flex-col">
            {hasBannerMedia && mediaUrl ? (
              <div
                className="relative w-full shrink-0 overflow-hidden"
                style={experienceHairlineBorderBottomStyle(presentation, 70)}
              >
                <div
                  className="w-full overflow-hidden bg-neutral-950/10"
                  style={{
                    height: `${resolveExperienceSteppedBannerHeightPx(presentation)}px`,
                  }}
                >
                  <ProductThumbnailMedia
                    url={mediaUrl}
                    alt={title?.trim() || block.title?.trim() || 'Experience media'}
                    fit={presentation.entryMediaFit ?? 'cover'}
                    className={`h-full w-full ${experienceEntryMediaPositionClass(
                      presentation.entryMediaPosition ?? 'center'
                    )}`}
                  />
                </div>
                {statusBannerLabel ? (
                  <span
                    className="absolute bottom-3 left-3 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-sm"
                    style={{ backgroundColor: accent }}
                  >
                    {statusBannerLabel}
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="p-6">
              <div className="mb-5 flex flex-wrap items-center gap-3 sm:gap-4">
                <span
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black tabular-nums tracking-[0.08em] sm:h-11 sm:w-11 sm:text-sm"
                  style={{ borderColor: accent, color: accent }}
                >
                  {step}
                </span>
                {visiblePeriod ? (
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">
                    {visiblePeriod}
                  </p>
                ) : null}
                {/* Status lives on the banner when media exists; otherwise keep a compact chip here. */}
                {!hasBannerMedia && statusForBanner ? (
                  <ExperienceStatusBadge
                    status={statusForBanner}
                    accent={accent}
                    textStyle={styles.meta}
                    softChipChrome={experienceSoftChipChromeStyle(presentation)}
                    badgeStyle={presentation.statusBadgeStyle ?? 'pill'}
                  />
                ) : null}
              </div>

              <ExperienceEntryBody
                {...bodyProps}
                status={null}
                layout={inMultiColumn ? 'stack' : 'stepped'}
                titleClassName="text-xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-2xl lg:text-[1.75rem]"
              />
            </div>
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-[5.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4 md:grid-cols-[7rem_2rem_minmax(0,1fr)] md:gap-x-6 lg:grid-cols-[8.5rem_2.25rem_minmax(0,1fr)]">
      <p className="text-sm font-medium tabular-nums leading-snug text-neutral-400 sm:pt-1 sm:text-base">
        {visiblePeriod ?? '—'}
      </p>
      <div className="hidden sm:block">
        <ExperienceTimelineRail presentation={presentation} isLast={isLast} />
      </div>
      {wrapOuter(
        <div className={`min-w-0 sm:pb-12 ${shellClass}`} style={shellStyle}>
          {wrapEntryChrome(wrapBody(<ExperienceEntryBody {...bodyProps} layout={bodyLayout} />))}
        </div>
      )}
    </article>
  );
}

export function EditorialExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  forceSingleColumn = false,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Split-screen nav: one experience entry per row in the right pane. */
  forceSingleColumn?: boolean;
}) {
  if (blocks.length === 0) return null;

  const design = presentation.experienceDesign;
  const itemsPerRow = forceSingleColumn
    ? 1
    : resolveExperienceItemsPerRow(design, presentation.itemsPerRow);
  const inMultiColumn = itemsPerRow > 1;
  const gridClass = experienceItemsPerRowGridClass(itemsPerRow, design, presentation.itemGap);
  const listGap = inMultiColumn
    ? ''
    : experienceDesignUsesEntryCard(design) || design === 'large' || design === 'compact'
      ? `flex flex-col ${experienceItemGapClass(presentation.itemGap)}`
      : 'space-y-0';

  return (
    <div
      className={experienceListShellClass(
        forceSingleColumn ? 'full' : presentation.listMaxWidth,
        forceSingleColumn ? 'left' : presentation.listPlacement
      )}
    >
      <div className={`${gridClass} ${listGap}`.trim()}>
        {blocks.map((block, index) => (
          <PortfolioMotionItem key={block.id} profile={motionProfile} index={index} className="h-full">
            <EditorialExperienceBlock
              block={block}
              index={index}
              isLast={index === blocks.length - 1}
              presentation={presentation}
              inMultiColumn={inMultiColumn}
              stackColumnsForSplitNav={forceSingleColumn}
            />
          </PortfolioMotionItem>
        ))}
      </div>
    </div>
  );
}

export function EditorialStoryBlock({ block }: { block: ProfileMediaBlock }) {
  const hasText = Boolean(block.text?.trim());

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm">
      {hasText ? (
        <div
          className={`px-6 py-5 sm:px-7 sm:py-6${block.mediaUrl ? ' border-b border-neutral-100' : ''}`}
        >
          <p
            className="whitespace-pre-line text-base leading-relaxed text-neutral-600 sm:text-[1.02rem]"
            style={{ fontFamily: SERIF }}
          >
            {block.text}
          </p>
        </div>
      ) : null}
      {block.mediaUrl ? (
        <div className="aspect-[2/1] max-h-[16rem] w-full overflow-hidden bg-neutral-100 sm:max-h-[18rem]">
          <ContentMediaPreview locale="en" mediaUrl={block.mediaUrl} mediaType="FILE" large fluid />
        </div>
      ) : null}
    </article>
  );
}

function AboutStatCalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function AboutStatFolderIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 7h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function AboutStatGlobeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 2.5 16.2 0 18M12 3c-2.5 2.8-2.5 16.2 0 18" />
    </svg>
  );
}

function AboutStatStarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M12 3.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 15.9l-4.7 2.47.9-5.23-3.8-3.7 5.25-.77L12 3.5z" />
    </svg>
  );
}

function AboutStatEditorialIcon({
  label,
  iconStyle,
  iconSizeClass,
}: {
  label: string;
  iconStyle: React.CSSProperties;
  iconSizeClass: string;
}) {
  const iconClass = `${iconSizeClass} shrink-0`;
  if (isAboutRatingStat(label)) return <AboutStatStarIcon className={iconClass} style={iconStyle} />;
  switch (label.toLowerCase()) {
    case 'content':
    case 'projects':
      return <AboutStatFolderIcon className={iconClass} style={iconStyle} />;
    case 'languages':
      return <AboutStatGlobeIcon className={iconClass} style={iconStyle} />;
    default:
      return <AboutStatCalendarIcon className={iconClass} style={iconStyle} />;
  }
}

function getAboutStatTypography(presentation: PortfolioAboutPresentationSettings, accent: string) {
  const labelClass = [
    aboutStatLabelSizeClass(presentation.statsLabelSize),
    aboutStatLabelWeightClass(presentation.statsLabelWeight),
    aboutStatLabelTrackingClass(presentation.statsLabelTracking),
    aboutStatFontClass(presentation.statsLabelFont, 'label'),
    presentation.statsLabelUppercase ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelStyle = {
    ...aboutStatLabelColorStyle(presentation.statsLabelColor),
    ...aboutStatFontStyle(presentation.statsLabelFont),
  };

  const iconStyle = aboutStatIconColorStyle(presentation.statsIconColor);
  const iconSizeClass = aboutStatIconSizeClass(presentation.statsIconSize);

  return {
    labelClass,
    labelStyle,
    iconStyle,
    iconSizeClass,
    valueClass: (context: AboutStatValueSizeContext) =>
      [
        aboutStatValueSizeClass(presentation.statsValueSize, context),
        aboutStatValueWeightClass(presentation.statsValueWeight),
        aboutStatFontClass(presentation.statsValueFont, 'value'),
      ].join(' '),
    valueStyle: (statLabel: string) => ({
      ...aboutStatValueColorStyle(presentation, statLabel, accent),
      ...aboutStatFontStyle(presentation.statsValueFont),
    }),
  };
}

function AboutStatCardShell({
  presentation,
  className = '',
  contentClassName = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  className?: string;
  contentClassName?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const frameClass = aboutStatCardFrameClass(presentation, { includePadding });
  const surfaceStyle = aboutStatCardFrameStyle(presentation);

  return (
    <div className={`relative overflow-hidden ${frameClass} ${className}`.trim()} style={surfaceStyle}>
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground className={contentClassName}>{children}</ServicesCardForeground>
    </div>
  );
}

function AboutUnifiedBandStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const typography = getAboutStatTypography(presentation, accent);
  const gapPx =
    presentation.statsGroupMode === 'unified'
      ? Math.max(12, presentation.statsGap)
      : Math.max(16, presentation.statsGap);
  const gapStyle = aboutStatsGapStyle(gapPx);
  const centerClass = aboutStatsAutoCenterClass(presentation.statsAutoCenter);

  // Always separate cards with gap — no shared bar / vertical dividers.
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 ${centerClass} ${
        presentation.statsAutoCenter ? 'justify-items-center' : ''
      }`}
      style={gapStyle}
    >
      {stats.map((stat, index) => (
        <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index} className="h-full">
          <AboutStatCardShell
            presentation={presentation}
            className={presentation.statsAutoCenter ? 'w-full min-w-0 max-w-[12rem]' : undefined}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <p className={typography.valueClass('band')} style={typography.valueStyle(stat.label)}>
                {stat.value}
              </p>
              <p className={`mt-2 ${typography.labelClass}`} style={typography.labelStyle}>
                {stat.label}
              </p>
            </div>
          </AboutStatCardShell>
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function AboutFeaturedStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const featured = stats.find((stat) => isAboutRatingStat(stat.label)) ?? stats[0];
  const secondary = stats.filter((stat) => stat !== featured);
  const typography = getAboutStatTypography(presentation, accent);
  const gapStyle = aboutStatsGapStyle(presentation.statsGap);
  const centerClass = presentation.statsAutoCenter ? 'justify-center' : '';

  return (
    <div className={`grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] ${centerClass} ${aboutStatsAutoCenterClass(presentation.statsAutoCenter)}`} style={gapStyle}>
      <PortfolioMotionItem profile={motionProfile} index={0}>
        <AboutStatCardShell presentation={presentation}>
          <div className="flex items-start gap-3">
            <p className={typography.valueClass('featured')} style={typography.valueStyle(featured.label)}>
              {featured.value}
            </p>
            {isAboutRatingStat(featured.label) ? (
              <AboutStatStarIcon
                className={`${typography.iconSizeClass} mt-2 shrink-0`}
                style={typography.iconStyle}
              />
            ) : null}
          </div>
          <p className={`mt-5 ${typography.labelClass}`} style={typography.labelStyle}>
            {isAboutRatingStat(featured.label) ? 'Note moyenne des clients' : featured.label}
          </p>
        </AboutStatCardShell>
      </PortfolioMotionItem>
      <div className="flex flex-col" style={gapStyle}>
        {secondary.map((stat, index) => (
          <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index + 1}>
            <AboutStatCardShell presentation={presentation}>
              <div className="flex items-center justify-between gap-4">
                <span className={typography.labelClass} style={typography.labelStyle}>
                  {stat.label}
                </span>
                <span className={typography.valueClass('bar')} style={typography.valueStyle(stat.label)}>
                  {stat.value}
                </span>
              </div>
            </AboutStatCardShell>
          </PortfolioMotionItem>
        ))}
      </div>
    </div>
  );
}

function AboutEditorialListStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const typography = getAboutStatTypography(presentation, accent);
  const gapStyle = aboutStatsGapStyle(presentation.statsGap);

  return (
    <div
      className={`flex flex-wrap ${presentation.statsAutoCenter ? 'justify-center' : ''} ${aboutStatsAutoCenterClass(presentation.statsAutoCenter)}`}
      style={gapStyle}
    >
      {stats.map((stat, index) => (
        <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index}>
          <div className="flex items-center gap-3">
            <AboutStatCardShell
              presentation={presentation}
              includePadding={false}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <AboutStatEditorialIcon
                label={stat.label}
                iconStyle={typography.iconStyle}
                iconSizeClass={typography.iconSizeClass}
              />
            </AboutStatCardShell>
            <p>
              <span className={typography.valueClass('editorial')} style={typography.valueStyle(stat.label)}>
                {stat.value}
              </span>{' '}
              <span
                className={[
                  aboutStatLabelSizeClass(presentation.statsLabelSize),
                  aboutStatFontClass(presentation.statsLabelFont, 'label'),
                ].join(' ')}
                style={typography.labelStyle}
              >
                {aboutStatEditorialSuffix(stat.label)}
              </span>
            </p>
          </div>
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

export function EditorialStatGrid({
  stats,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  presentation?: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  if (stats.length === 0) return null;

  const accent = aboutAccentColor(presentation.accentColor);

  switch (presentation.statsDesign) {
    case 'featured':
      return <AboutFeaturedStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
    case 'editorial-list':
      return <AboutEditorialListStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
    default:
      return <AboutUnifiedBandStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
  }
}

function FaqPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FaqChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FaqExpandIcon({
  style,
  className = 'h-4 w-4',
}: {
  style: PortfolioFaqExpandIconStyle;
  className?: string;
}) {
  return style === 'chevron' ? <FaqChevronIcon className={className} /> : <FaqPlusIcon className={className} />;
}

export function EditorialFaqItem({
  item,
  index,
  isLast = false,
  presentation = DEFAULT_FAQ_PRESENTATION,
  exclusiveOpen = null,
  onExclusiveToggle,
}: {
  item: FaqItem;
  index: number;
  isLast?: boolean;
  presentation?: PortfolioFaqPresentationSettings;
  /** When exclusive accordion is on — controlled open id (null = all closed). */
  exclusiveOpen?: string | null;
  onExclusiveToggle?: (itemId: string, open: boolean) => void;
}) {
  const design = presentation.itemDesign;
  const sectionDesign = presentation.design;
  const colorQuestionOnOpen =
    sectionDesign === 'panel' || sectionDesign === 'split' || sectionDesign === 'cta-split';
  const plainExpandIcon = design === 'two-column' || colorQuestionOnOpen;
  const isCard = faqIsCardDesign(design);
  const shellClass = faqItemShellClass(design, presentation.itemGap, sectionDesign);
  const accentStyle = faqItemAccentStyle(design, presentation.accentColor);
  const accent = presentation.accentColor;
  const expandFill = presentation.cardBackgroundColor;
  const iconStyles = faqExpandIconStyle(presentation.expandIconColor, presentation.accentColor, {
    fill: expandFill,
    border: presentation.cardBorderColor,
  });
  const summaryPadding = faqSummaryPaddingClass(design, presentation.cardPadding);
  const iconRotateClass =
    presentation.expandIconStyle === 'chevron'
      ? 'group-data-[open=true]:rotate-180'
      : 'group-data-[open=true]:rotate-45';

  const questionTextStyle = {
    ...presentation.elementStyles.question,
    ...(design === 'two-column' || colorQuestionOnOpen ? { weight: 'semibold' as const, bold: false } : {}),
  };
  const questionClass = `min-w-0 flex-1 leading-snug transition-colors duration-300 ${elementTextStyleClass(questionTextStyle, 'body')}`;
  const questionStyle = elementTextInlineStyle(questionTextStyle);
  const answerClass = `whitespace-pre-line leading-relaxed ${elementTextStyleClass(presentation.elementStyles.answer, 'body')}`;
  const answerStyle = elementTextInlineStyle(presentation.elementStyles.answer);
  const align = faqContentAlignClass(presentation.itemAlign);

  const taskListBulletGlobal = usePortfolioTaskListMarkerGlobal();
  const itemMarker = resolveTaskListMarker(
    taskListBulletGlobal,
    {
      taskBulletSource: presentation.itemMarkerSource ?? 'section',
      taskBulletStyle: presentation.itemMarkerStyle ?? 'number',
      taskBulletColor:
        presentation.itemMarkerColor ||
        presentation.numberColor ||
        presentation.elementStyles.number.color ||
        accent,
      taskBulletSize: presentation.itemMarkerSize ?? 'md',
      taskBulletSizePx: presentation.itemMarkerSizePx,
      taskBulletWeight: presentation.itemMarkerWeight ?? 'regular',
      taskBulletWeightAmount: presentation.itemMarkerWeightAmount,
    },
    presentation.numberColor || accent
  );
  const showItemMarker =
    presentation.showItemNumbers && itemMarker.style !== 'none' && design !== 'numbered-rail';
  const showRailMarker = presentation.showItemNumbers && itemMarker.style !== 'none';

  const showInlineNumber = showItemMarker;
  const isRaised = design === 'raised';
  const showQPrefix = isRaised && presentation.showItemNumbers;
  const expandable = presentation.expandable !== false;
  const exclusive = expandable && Boolean(onExclusiveToggle);
  const [localOpen, setLocalOpen] = useState(false);
  const isOpen = !expandable ? true : exclusive ? exclusiveOpen === item.id : localOpen;
  const openFill = design === 'two-column' && isOpen;
  const openQuestionColor = openFill ? '#ffffff' : colorQuestionOnOpen && isOpen ? accent : undefined;
  const flushAnswers = presentation.answerFlushWithQuestion === true || isRaised;
  const answerPadding = faqAnswerPaddingClass(
    design,
    presentation.cardPadding,
    showInlineNumber || showQPrefix,
    flushAnswers
  );

  const itemMarkerNode = showQPrefix ? (
    <span
      className="mt-0.5 shrink-0 text-[15px] font-bold leading-snug sm:text-base"
      style={{ color: presentation.numberColor || accent }}
      aria-hidden
    >
      Q.
    </span>
  ) : (
    <span className="mt-1 flex w-8 shrink-0 justify-center" style={{ color: itemMarker.color }}>
      <PortfolioListMarker
        style={itemMarker.style}
        color={itemMarker.color}
        index={index}
        size={itemMarker.size}
        sizePx={itemMarker.sizePx}
        weight={itemMarker.weight}
        weightAmount={itemMarker.weightAmount}
      />
    </span>
  );

  const questionRowClass = `flex w-full list-none items-start gap-3 sm:gap-5 bg-transparent text-left text-inherit appearance-none border-0 ${summaryPadding} ${align.row} ${
    expandable ? 'cursor-pointer' : 'cursor-default'
  }`;

  const expandIcon = expandable && presentation.showExpandIcon ? (
    <span
      className={
        plainExpandIcon
          ? `mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-neutral-400 transition duration-200 ${iconRotateClass}`
          : `mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition duration-200 sm:h-9 sm:w-9 ${iconRotateClass} group-data-[open=true]:border-[color:var(--faq-expand-open-border)] group-data-[open=true]:bg-[color:var(--faq-expand-open-bg)] group-data-[open=true]:text-[color:var(--faq-expand-open-color)]`
      }
      style={
        plainExpandIcon
          ? { color: openFill ? '#ffffff' : colorQuestionOnOpen && isOpen ? accent : presentation.expandIconColor }
          : {
              ...iconStyles.base,
              ['--faq-expand-open-bg' as string]: String(iconStyles.open.backgroundColor ?? ''),
              ['--faq-expand-open-border' as string]: String(iconStyles.open.borderColor ?? ''),
              ['--faq-expand-open-color' as string]: String(iconStyles.open.color ?? ''),
            }
      }
      aria-hidden
    >
      <FaqExpandIcon
        style={presentation.expandIconStyle}
        className={plainExpandIcon ? 'h-5 w-5' : 'h-4 w-4'}
      />
    </span>
  ) : null;

  const answerPanel = flushAnswers ? (
    <div
      className={`flex items-start gap-3 sm:gap-5 ${answerPadding} ${faqSummaryHorizontalPaddingClass(
        design,
        presentation.cardPadding
      )} ${align.row}`}
    >
      {showQPrefix ? (
        <span
          className="invisible shrink-0 text-[15px] font-bold leading-snug sm:text-base"
          aria-hidden
        >
          Q.
        </span>
      ) : showInlineNumber ? (
        <span className="w-8 shrink-0" aria-hidden />
      ) : null}
      <div className="min-w-0 flex-1">
        <div
          className={presentation.showAnswerAccentBorder ? 'border-l-2' : ''}
          style={
            presentation.showAnswerAccentBorder
              ? faqAnswerBorderStyle(presentation.answerAccentBorderColor)
              : undefined
          }
        >
          <p className={`${answerClass} ${align.text}`} style={openFill ? { ...answerStyle, color: 'rgba(255,255,255,0.92)' } : answerStyle}>
            {item.answer}
          </p>
        </div>
      </div>
      {expandable && presentation.showExpandIcon ? (
        <span className={plainExpandIcon ? 'h-8 w-8 shrink-0' : 'h-10 w-10 shrink-0 sm:h-9 sm:w-9'} aria-hidden />
      ) : null}
    </div>
  ) : (
    <div className={answerPadding}>
      <div
        className={`pl-3 sm:pl-6 ${presentation.showAnswerAccentBorder ? 'border-l-2' : ''}`}
        style={
          presentation.showAnswerAccentBorder
            ? faqAnswerBorderStyle(presentation.answerAccentBorderColor)
            : undefined
        }
      >
        <p
          className={`${answerClass} ${align.text}`}
          style={openFill ? { ...answerStyle, color: 'rgba(255,255,255,0.92)' } : answerStyle}
        >
          {item.answer}
        </p>
      </div>
    </div>
  );

  const toggleOpen = () => {
    if (!expandable) return;
    if (exclusive) {
      onExclusiveToggle?.(item.id, !isOpen);
      return;
    }
    setLocalOpen((open) => !open);
  };

  const details = (
    <div
      className={`group ${!isCard && design !== 'numbered-rail' ? shellClass : ''}`}
      style={{ ['--faq-accent' as string]: accent }}
      data-open={isOpen ? 'true' : 'false'}
      data-faq-card={!isCard ? item.id : undefined}
    >
      {expandable ? (
        <button type="button" className={questionRowClass} aria-expanded={isOpen} onClick={toggleOpen}>
          {showItemMarker || showQPrefix ? itemMarkerNode : null}
          <span className={`${questionClass} ${align.text}`} style={openQuestionColor ? { ...questionStyle, color: openQuestionColor } : questionStyle}>
            {item.question}
          </span>
          {expandIcon}
        </button>
      ) : (
        <div className={questionRowClass}>
          {showItemMarker || showQPrefix ? itemMarkerNode : null}
          <span className={`${questionClass} ${align.text}`} style={openQuestionColor ? { ...questionStyle, color: openQuestionColor } : questionStyle}>
            {item.question}
          </span>
        </div>
      )}
      {expandable ? (
        <div className="pf-faq-answer-fold" data-open={isOpen ? 'true' : 'false'}>
          <div className="pf-faq-answer-fold-inner">{answerPanel}</div>
        </div>
      ) : (
        answerPanel
      )}
    </div>
  );

  if (design === 'numbered-rail') {
    const railFill = presentation.cardBackgroundColor;
    return (
      <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-x-4">
        <div className="relative flex h-full min-h-[4.5rem] flex-col items-center">
          {!isLast ? (
            <div
              className="absolute bottom-0 top-10 w-px"
              style={{ backgroundColor: presentation.cardBorderColor }}
              aria-hidden
            />
          ) : null}
          {showRailMarker ? (
            itemMarker.style === 'number' || itemMarker.style === 'roman' ? (
              <div
                className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: itemMarker.color,
                  color: itemMarker.color,
                  backgroundColor: railFill,
                }}
              >
                <PortfolioListMarker
                  style={itemMarker.style}
                  color={itemMarker.color}
                  index={index}
                  size={itemMarker.size}
                  sizePx={itemMarker.sizePx}
                  weight={itemMarker.weight}
                  weightAmount={itemMarker.weightAmount}
                />
              </div>
            ) : (
              <div className="relative z-[1] mt-1 flex shrink-0 items-center justify-center" style={{ color: itemMarker.color }}>
                <PortfolioListMarker
                  style={itemMarker.style}
                  color={itemMarker.color}
                  index={index}
                  size={itemMarker.size}
                  sizePx={itemMarker.sizePx}
                  weight={itemMarker.weight}
                  weightAmount={itemMarker.weightAmount}
                />
              </div>
            )
          ) : (
            <div
              className="relative z-[1] mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2"
              style={{ borderColor: accent, backgroundColor: railFill }}
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 pb-4">{details}</div>
      </article>
    );
  }

  if (isCard) {
    const openCardStyle: CSSProperties = openFill
      ? {
          backgroundColor: accent,
          borderTopColor: accent,
          borderRightColor: accent,
          borderBottomColor: accent,
          borderLeftColor: accent,
          boxShadow: '0 16px 36px -16px rgba(15, 23, 42, 0.35)',
        }
      : {};
    return (
      <div
        className={faqSeparatedCardFrameClass(presentation, design)}
        data-faq-card={item.id}
        style={{ ...faqFrameStyle(presentation, design), ...accentStyle, ...openCardStyle }}
      >
        {openFill ? null : <ServicesCardBackgroundLayers presentation={presentation} />}
        <ServicesCardForeground>{details}</ServicesCardForeground>
      </div>
    );
  }

  return details;
}

export function EditorialFaqList({
  items,
  presentation = DEFAULT_FAQ_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
  askCtaHref = '#contact',
  askCtaLabel = 'Ask a question',
  updatedLabel,
  embeddedHeader,
}: {
  items: FaqItem[];
  presentation?: PortfolioFaqPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  askCtaHref?: string;
  askCtaLabel?: string;
  updatedLabel?: string | null;
  embeddedHeader?: ReactNode;
}) {
  const [exclusiveOpenId, setExclusiveOpenId] = useState<string | null>(null);
  const exclusive =
    presentation.expandable !== false &&
    (presentation.design === 'two-column' ||
      presentation.design === 'panel' ||
      presentation.design === 'split' ||
      presentation.design === 'cta-split' ||
      presentation.accordionExclusive === true);

  useEffect(() => {
    if (!exclusive || !exclusiveOpenId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(`[data-faq-card="${CSS.escape(exclusiveOpenId)}"]`)) return;
      setExclusiveOpenId(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [exclusive, exclusiveOpenId]);
  const illustrationVariant = presentation.illustrationVariant ?? 'none';
  const showIllustration =
    illustrationVariant !== 'none' &&
    presentation.design !== 'split' &&
    presentation.design !== 'cta-split';
  const illustrationPlacement = presentation.illustrationPlacement ?? 'right';
  const isRaised = presentation.itemDesign === 'raised';
  const accent = presentation.accentColor || '#f97316';

  const handleExclusiveToggle = (itemId: string, open: boolean) => {
    setExclusiveOpenId((current) => {
      if (open) return itemId;
      return current === itemId ? null : current;
    });
  };

  if (items.length === 0) return null;

  const itemBorderVars = faqItemBorderCssVars(presentation.cardBorderColor);
  const separatedCards = faqIsCardDesign(presentation.itemDesign);

  const list = (
    <div
      className={faqListShellClass(presentation.itemDesign, presentation.itemGap, presentation.design)}
      style={itemBorderVars}
    >
      {items.map((item, index) => (
        <PortfolioMotionItem key={item.id} profile={motionProfile} index={index}>
          <EditorialFaqItem
            item={item}
            index={index}
            isLast={index === items.length - 1}
            presentation={presentation}
            exclusiveOpen={exclusive ? exclusiveOpenId : null}
            onExclusiveToggle={exclusive ? handleExclusiveToggle : undefined}
          />
        </PortfolioMotionItem>
      ))}
    </div>
  );

  const footer = isRaised ? (
    <div className="mt-10 flex flex-col gap-5 border-t border-neutral-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1.5">
          <span style={{ color: accent }} aria-hidden>
            ✦
          </span>
          {items.length} {items.length === 1 ? 'question' : 'questions'}
        </span>
        {updatedLabel ? (
          <span className="inline-flex items-center gap-1.5">
            <span style={{ color: accent }} aria-hidden>
              ✦
            </span>
            {updatedLabel}
          </span>
        ) : null}
      </div>
      {askCtaHref ? (
        <a
          href={askCtaHref}
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(249,115,22,0.7)] transition hover:brightness-105"
          style={{ backgroundColor: accent }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {askCtaLabel}
        </a>
      ) : null}
    </div>
  ) : null;

  const framedList = separatedCards ? (
    <>
      {list}
      {footer}
    </>
  ) : (
    <div className={`${faqFrameClass(presentation)} relative overflow-x-hidden`} style={faqFrameStyle(presentation)}>
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground>
        {list}
        {footer}
      </ServicesCardForeground>
    </div>
  );

  const isPanel = presentation.design === 'panel';
  const panelList = isPanel ? (
    <div className="relative" style={faqPanelShadowStyle(presentation.panelShadow, presentation.panelShadowIntensity)}>
      <div
        className={faqPanelInnerClass(presentation)}
        style={{
          backgroundColor: presentation.cardBackgroundEnabled
            ? presentation.cardBackgroundColor
            : DEFAULT_FAQ_PRESENTATION.cardBackgroundColor,
        }}
      >
        {embeddedHeader ? <div className="mb-8 sm:mb-10">{embeddedHeader}</div> : null}
        {list}
        {footer}
      </div>
    </div>
  ) : (
    framedList
  );

  if (!showIllustration) return panelList;

  const illustration = (
    <div
      className="flex items-center justify-center"
      style={{
        ['--faq-accent' as string]: presentation.accentColor,
        ['--faq-ink' as string]: presentation.titleColor || presentation.questionColor,
        ['--faq-surface' as string]: presentation.cardBackgroundColor,
      }}
    >
      <FaqSectionIllustration variant={illustrationVariant} />
    </div>
  );

  return (
    <div
      className={`grid w-full items-center gap-8 lg:gap-12 ${
        illustrationPlacement === 'left'
          ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]'
          : 'lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]'
      }`}
    >
      {illustrationPlacement === 'left' ? (
        <>
          {illustration}
          <div className="min-w-0">{panelList}</div>
        </>
      ) : (
        <>
          <div className="min-w-0">{panelList}</div>
          {illustration}
        </>
      )}
    </div>
  );
}

function teamImageAspectClass(aspect: PortfolioTeamPresentationSettings['imageAspect']): string {
  if (aspect === 'square') return 'aspect-square w-full';
  if (aspect === 'landscape') return 'aspect-[4/3] w-full';
  if (aspect === 'auto') return 'min-h-48 w-full';
  return 'aspect-[4/5] w-full';
}

function TeamMemberImage({
  member,
  presentation,
  className = '',
  fill = false,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  className?: string;
  fill?: boolean;
}) {
  if (!presentation.showImage) return null;
  const fit = presentation.imageFit === 'contain' ? 'object-contain' : 'object-cover';
  const position = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
    left: 'object-left',
    right: 'object-right',
  }[presentation.imagePosition];
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${
        fill ? 'h-full w-full' : teamImageAspectClass(presentation.imageAspect)
      } ${className}`}
    >
      {member.imageUrl?.trim() ? (
        <PortfolioDeferredMedia
          src={member.imageUrl}
          alt={`Portrait de ${member.name}`}
          className={`h-full w-full ${fit} ${position}`}
          sizes="(max-width: 768px) 50vw, 280px"
          objectFit={presentation.imageFit === 'contain' ? 'contain' : 'cover'}
          objectPosition={presentation.imagePosition}
        />
      ) : (
        <div className="flex h-full min-h-0 items-center justify-center text-4xl font-bold text-neutral-400" aria-hidden>
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
    </div>
  );
}

function TeamSocialIcon({ platform, className }: { platform: string; className: string }) {
  if (platform === 'EMAIL') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><path d="M3.5 6.5h17v11h-17z" /><path d="m4 7 8 6 8-6" /></svg>;
  }
  if (platform === 'FACEBOOK') {
    return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.2v2H7.5v3h2.8v8h3.4Z" /></svg>;
  }
  if (platform === 'WEBSITE') {
    return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" /></svg>;
  }
  return <SocialPlatformIcon platform={platform} className={className} />;
}

function TeamSocialLinks({
  member,
  presentation,
  align = 'justify-center',
  hoverLight = false,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  align?: string;
  hoverLight?: boolean;
}) {
  const links = (member.socialLinks ?? []).filter((link) => link.url.trim());
  if (!presentation.showSocials) return null;
  const size = teamSocialIconButtonClass(presentation.socialIconSize);
  const slotHeight = size.split(' ')[0] ?? 'h-9';
  if (links.length === 0) {
    return <div className={`${slotHeight} ${align}`} aria-hidden />;
  }
  const glyph = teamSocialIconGlyphClass(presentation.socialIconSize);
  const chrome =
    presentation.socialIconStyle === 'minimal'
      ? 'border-transparent bg-transparent'
      : presentation.socialIconStyle === 'outline'
        ? 'border-current bg-transparent'
        : presentation.socialIconStyle === 'soft'
          ? 'border-transparent rounded-xl'
          : 'border-transparent rounded-full';
  const hoverTone = hoverLight
    ? 'group-hover:![border-color:color-mix(in_srgb,var(--team-float-hover-ink)_30%,transparent)] group-hover:![background-color:var(--team-float-hover-icon-bg)] group-hover:![color:var(--team-float-hover-ink)]'
    : '';
  return (
    <div className={`flex flex-wrap gap-2 ${align}`} aria-label={`Liens sociaux de ${member.name}`}>
      {links.map((link) => {
        const href =
          link.platform === 'EMAIL' && !/^mailto:/i.test(link.url)
            ? `mailto:${link.url}`
            : link.url;
        return (
          <a
            key={link.id}
            href={href}
            target={link.platform === 'EMAIL' ? undefined : '_blank'}
            rel={link.platform === 'EMAIL' ? undefined : 'noopener noreferrer'}
            aria-label={link.label?.trim() || `${link.platform} — ${member.name}`}
            className={`inline-flex shrink-0 items-center justify-center border transition hover:-translate-y-0.5 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${size} ${chrome} ${hoverTone}`}
            style={{
              color: presentation.socialIconColor,
              backgroundColor:
                presentation.socialIconStyle === 'minimal' || presentation.socialIconStyle === 'outline'
                  ? 'transparent'
                  : presentation.socialBackgroundColor,
            }}
          >
            <TeamSocialIcon platform={link.platform} className={glyph} />
          </a>
        );
      })}
    </div>
  );
}

function TeamMemberCopy({
  member,
  presentation,
  align = 'text-center',
  size = 'md',
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  align?: string;
  size?: 'md' | 'lg';
}) {
  const readable = teamReadableCardText(presentation);
  const nameClass = size === 'lg' ? 'text-2xl font-semibold leading-tight tracking-tight sm:text-[1.7rem]' : 'text-lg font-bold leading-tight';
  const roleClass =
    size === 'lg'
      ? 'mt-1.5 min-h-[1.5rem] text-base leading-relaxed'
      : 'mt-1 min-h-[1.25rem] text-sm leading-relaxed';
  return (
    <div className={align}>
      {presentation.showName ? (
        <h3 className={nameClass} style={{ color: readable.strong }}>
          {member.name}
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        <p className={roleClass} style={{ color: readable.muted }}>
          {member.responsibility.trim() || '\u00a0'}
        </p>
      ) : null}
    </div>
  );
}

function TeamStandardCard({
  member,
  presentation,
  polaroidIndex,
  copySize = 'md',
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  polaroidIndex?: number;
  copySize?: 'md' | 'lg';
}) {
  const rotation = polaroidIndex == null ? '' : ['-rotate-1', 'rotate-[0.8deg]', '-rotate-[0.4deg]', 'rotate-[1.2deg]'][polaroidIndex % 4];
  return (
    <article className={`flex h-full w-full flex-col ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardClass(presentation)} ${rotation} transition-transform hover:rotate-0 hover:-translate-y-1`} style={teamCardStyle(presentation)}>
      <TeamMemberImage member={member} presentation={presentation} className="rounded-[calc(2rem-0.75rem)]" />
      <div className={`flex min-h-0 flex-1 flex-col ${presentation.showImage ? 'mt-5' : ''}`}>
        <TeamMemberCopy member={member} presentation={presentation} size={copySize} />
        {presentation.showSocials ? (
          <div className="mt-auto pt-4">
            <TeamSocialLinks member={member} presentation={presentation} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamProfileCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  return (
    <article
      className={`flex h-full w-full flex-col ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} transition hover:-translate-y-0.5`}
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <div className={`w-full overflow-hidden ${teamProfilePhotoHeightClass(presentation.avatarSize)}`}>
          <TeamMemberImage member={member} presentation={presentation} fill />
        </div>
      ) : null}
      <div className={`${teamCardFooterPaddingClass(presentation.cardPadding)} ${teamContentAlignClass(align)} flex min-h-0 flex-1 flex-col`}>
        {presentation.showName ? (
          <h3 className="text-xl font-bold tracking-tight" style={{ color: readable.strong }}>
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p className="mt-1 min-h-[1.25rem] text-sm" style={{ color: readable.muted }}>
            {member.responsibility.trim() || '\u00a0'}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className={`mt-auto ${presentation.showName || presentation.showResponsibility ? 'pt-4' : ''}`}>
            <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamAvatarCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  return (
    <article
      className={`flex h-full w-full flex-col ${teamFlexAlignClass(align)} ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamCardFooterPaddingClass(presentation.cardPadding)} ${teamContentAlignClass(align)} transition hover:-translate-y-0.5`}
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <div className={`shrink-0 overflow-hidden rounded-full ${teamCircleAvatarClass(presentation.avatarSize)}`}>
          <TeamMemberImage
            member={member}
            presentation={{ ...presentation, imageAspect: 'square' }}
            fill
          />
        </div>
      ) : null}
      {presentation.showName ? (
        <h3
          className={`text-lg font-bold tracking-tight ${presentation.showImage ? 'mt-5' : ''}`}
          style={{ color: readable.strong }}
        >
          {member.name}
        </h3>
      ) : null}
      {presentation.showResponsibility ? (
        <p className={`min-h-[1.25rem] text-sm ${presentation.showName ? 'mt-1' : presentation.showImage ? 'mt-5' : ''}`} style={{ color: readable.muted }}>
          {member.responsibility.trim() || '\u00a0'}
        </p>
      ) : null}
      {presentation.showSocials ? (
        <div
          className={`mt-auto ${
            presentation.showImage || presentation.showName || presentation.showResponsibility ? 'pt-5' : ''
          }`}
        >
          <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
        </div>
      ) : null}
    </article>
  );
}

function TeamFloatCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'center';
  const cardStyle = teamCardStyle(presentation);
  const hoverFill =
    presentation.teamPalette?.principal?.trim() || presentation.socialIconColor;
  const hoverInk = servicesColorLuminance(hoverFill) > 0.55 ? '#111827' : '#ffffff';
  const hoverIconBg =
    servicesColorLuminance(hoverFill) > 0.55
      ? 'color-mix(in srgb, #111827 12%, transparent)'
      : 'color-mix(in srgb, #ffffff 22%, transparent)';
  return (
    <article className={`group relative flex h-full w-full flex-col overflow-visible ${presentation.showImage ? teamFloatGridOffsetClass(presentation.avatarSize) : ''} ${teamCardMaxWidthClass(presentation.cardMaxWidth)}`}>
      {presentation.showImage ? (
        <div
          className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 ${teamFloatAvatarAnchorClass(presentation.avatarSize)} ${teamCircleAvatarClass(presentation.avatarSize)}`}
          style={{
            borderColor: presentation.cardBackgroundColor,
            boxShadow: `0 0 0 1px ${presentation.cardBorderColor}`,
          }}
        >
          <TeamMemberImage
            member={member}
            presentation={{ ...presentation, imageAspect: 'square' }}
            fill
          />
        </div>
      ) : null}
      <div
        className={`flex h-full w-full flex-col ${teamCardFrameClass(presentation)} ${teamFlexAlignClass(align)} ${teamFloatCardBodyPadClass(presentation.avatarSize)} ${teamFloatCardMinHeightClass(presentation.avatarSize)} ${teamContentAlignClass(align)} transition-colors duration-200 group-hover:border-transparent group-hover:shadow-lg group-hover:![background-color:var(--team-float-hover)]`}
        style={
          {
            ...cardStyle,
            '--team-float-hover': hoverFill,
            '--team-float-hover-ink': hoverInk,
            '--team-float-hover-icon-bg': hoverIconBg,
          } as CSSProperties
        }
      >
        {presentation.showName ? (
          <h3
            className="text-lg font-bold tracking-tight transition-colors group-hover:![color:var(--team-float-hover-ink)]"
            style={{ color: readable.strong }}
          >
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p
            className={`min-h-[1.25rem] text-sm transition-colors group-hover:![color:color-mix(in_srgb,var(--team-float-hover-ink)_85%,transparent)] ${presentation.showName ? 'mt-1' : ''}`}
            style={{ color: readable.muted }}
          >
            {member.responsibility.trim() || '\u00a0'}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className={`mt-auto ${presentation.showName || presentation.showResponsibility ? 'pt-4' : ''}`}>
            <TeamSocialLinks
              member={member}
              presentation={presentation}
              align={teamSocialAlignClass(align)}
              hoverLight
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamHoverCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const readable = teamReadableCardText(presentation);
  const align = presentation.listAlign ?? 'left';
  const overlayRadius =
    presentation.cardRadius === 'none'
      ? 'rounded-none'
      : presentation.cardRadius === 'sm'
        ? 'rounded-lg'
        : presentation.cardRadius === 'xl'
          ? 'rounded-2xl'
          : 'rounded-xl';
  return (
    <article
      className={`group relative h-full w-full ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamHoverPhotoClass(presentation.avatarSize)}`}
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <TeamMemberImage
          member={member}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-neutral-400" aria-hidden>
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
      <div
        className={`absolute inset-x-3 bottom-3 z-10 ${overlayRadius} shadow-lg ${teamHoverOverlayPaddingClass(presentation.avatarSize)} ${teamContentAlignClass(align)} pointer-events-none opacity-0 translate-y-2 transition duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100`}
        style={{ backgroundColor: presentation.cardBackgroundColor }}
      >
        {presentation.showName ? (
          <h3 className="text-base font-bold leading-tight tracking-tight sm:text-lg" style={{ color: readable.strong }}>
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p className="mt-0.5 min-h-[1.25rem] text-sm" style={{ color: readable.muted }}>
            {member.responsibility.trim() || '\u00a0'}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className={presentation.showName || presentation.showResponsibility ? 'mt-3' : ''}>
            <TeamSocialLinks member={member} presentation={presentation} align={teamSocialAlignClass(align)} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamCoverCard({
  member,
  presentation,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
}) {
  const align = presentation.listAlign ?? 'center';
  const overlayAlign =
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';
  return (
    <article
      className={`group relative h-full w-full ${teamCardMaxWidthClass(presentation.cardMaxWidth)} ${teamCardFrameClass(presentation)} ${teamHoverPhotoClass(presentation.avatarSize)}`}
      style={teamCardStyle(presentation)}
    >
      {presentation.showImage ? (
        <TeamMemberImage
          member={member}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-neutral-400" aria-hidden>
          {member.name.trim().charAt(0).toUpperCase() || '—'}
        </div>
      )}
      <div
        className={`absolute inset-0 z-10 flex flex-col justify-center px-5 py-6 ${overlayAlign} pointer-events-none bg-black/55 opacity-0 transition duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100`}
      >
        {presentation.showName ? (
          <h3 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            {member.name}
          </h3>
        ) : null}
        {presentation.showResponsibility ? (
          <p className="mt-1 min-h-[1.25rem] text-sm text-white/80 sm:text-base">
            {member.responsibility.trim() || '\u00a0'}
          </p>
        ) : null}
        {presentation.showSocials ? (
          <div className={presentation.showName || presentation.showResponsibility ? 'mt-4' : ''}>
            <TeamSocialLinks
              member={member}
              presentation={{
                ...presentation,
                socialIconColor: '#171717',
                socialBackgroundColor: '#ffffff',
                socialIconStyle: 'circle',
              }}
              align={teamSocialAlignClass(align)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TeamSpotlight({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  const spotlightMembers = members.slice(0, 4);
  const [activeId, setActiveId] = useState(spotlightMembers[0]?.id ?? '');
  const active =
    spotlightMembers.find((member) => member.id === activeId) ?? spotlightMembers[0];
  if (!active) return null;
  const readable = teamReadableCardText(presentation);
  const portraitSize = presentation.avatarSize ?? 'md';
  return (
    <article
      className={`${teamCardClass(presentation)} grid w-full gap-4 ${teamSpotlightMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)} ${teamSpotlightGridClass()}`}
      style={teamCardStyle(presentation)}
    >
      <div className={`self-start shrink-0 overflow-hidden rounded-2xl aspect-[4/5] ${teamSpotlightPhotoSizeClass(portraitSize)}`}>
        <TeamMemberImage
          member={active}
          presentation={{ ...presentation, imageAspect: 'portrait' }}
          fill
          className="rounded-2xl"
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-col md:h-full">
        <div className="text-left">
          {presentation.showName ? (
            <h3
              className={teamSpotlightNameClass(presentation.cardMaxWidth)}
              style={{ color: readable.strong }}
            >
              {active.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p className={teamSpotlightRoleClass(presentation.cardMaxWidth)} style={{ color: readable.muted }}>
              {active.responsibility}
            </p>
          ) : null}
          <div
            className="mt-5 h-px w-full max-w-[12rem]"
            style={{ backgroundColor: presentation.cardBorderColor }}
            aria-hidden
          />
          <div className="mt-5">
            <TeamSocialLinks member={active} presentation={presentation} align="justify-start" />
          </div>
        </div>
        <div
          className="mt-6 grid grid-cols-4 gap-3 pb-1 md:mt-auto md:pt-6"
          role="tablist"
          aria-label="Choose a team member"
        >
          {spotlightMembers.map((member) => (
            <button
              key={member.id}
              type="button"
              role="tab"
              aria-selected={member.id === active.id}
              onClick={() => setActiveId(member.id)}
              className={`aspect-square w-full overflow-hidden rounded-xl border-2 transition ${
                member.id === active.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                borderColor:
                  member.id === active.id ? presentation.socialIconColor : presentation.cardBorderColor,
              }}
            >
              <TeamMemberImage
                member={member}
                presentation={{ ...presentation, imageAspect: 'square', showImage: true }}
                fill
              />
              <span className="sr-only">{member.name}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function TeamDirectoryRow({
  member,
  presentation,
  detached,
}: {
  member: ProfileTeamMember;
  presentation: PortfolioTeamPresentationSettings;
  detached: boolean;
}) {
  const readable = teamReadableCardText(presentation);
  const pad = teamCardFooterPaddingClass(presentation.cardPadding);
  return (
    <article
      className={`flex h-full flex-col gap-4 sm:flex-row sm:items-center ${
        detached
          ? `${teamCardFrameClass(presentation)} ${pad}`
          : `border-b last:border-b-0 ${pad}`
      }`}
      style={detached ? teamCardStyle(presentation) : { borderColor: presentation.cardBorderColor }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        {presentation.showImage ? (
          <div className={`shrink-0 overflow-hidden rounded-full ${teamAvatarSizeClass(presentation.avatarSize)}`}>
            <TeamMemberImage
              member={member}
              presentation={{ ...presentation, imageAspect: 'square' }}
              className="h-full min-h-0"
            />
          </div>
        ) : null}
        <div className="min-w-0 text-left">
          {presentation.showName ? (
            <h3 className="truncate text-xl font-semibold leading-tight tracking-tight sm:text-2xl" style={{ color: readable.strong }}>
              {member.name}
            </h3>
          ) : null}
          {presentation.showResponsibility ? (
            <p
              className={`min-h-[1.5rem] truncate text-base font-semibold sm:text-lg ${presentation.showName ? 'mt-1' : ''}`}
              style={{ color: readable.muted }}
            >
              {member.responsibility.trim() || '\u00a0'}
            </p>
          ) : null}
        </div>
      </div>
      <div className="sm:min-w-[5.5rem]">
        <TeamSocialLinks member={member} presentation={presentation} align="justify-start sm:justify-end" />
      </div>
    </article>
  );
}

export function EditorialTeamGallery({
  members,
  presentation,
}: {
  members: ProfileTeamMember[];
  presentation: PortfolioTeamPresentationSettings;
}) {
  if (members.length === 0) return null;
  if (presentation.layout === 'spotlight') {
    return <TeamSpotlight members={members} presentation={presentation} />;
  }
  if (presentation.layout === 'portrait-rail') {
    const railAlign =
      presentation.listAlign === 'left'
        ? 'justify-start'
        : presentation.listAlign === 'right'
          ? 'justify-end'
          : 'justify-center';
    return (
      <div className={`flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto pb-5 ${railAlign}`}>
        {members.map((member) => (
          <div key={member.id} className={`flex w-[72vw] shrink-0 snap-center self-stretch ${teamCardMaxWidthClass(presentation.cardMaxWidth)}`}>
            <TeamStandardCard
              member={member}
              presentation={{ ...presentation, imageAspect: 'portrait' }}
              copySize="lg"
            />
          </div>
        ))}
      </div>
    );
  }
  if (presentation.layout === 'directory') {
    const detached = presentation.directoryDetachedCards !== false;
    return (
      <div
        className={`w-full ${teamDirectoryMaxWidthClass(presentation.cardMaxWidth)} ${teamListAlignClass(presentation.listAlign)}`}
      >
        {detached ? (
          <div className={`flex w-full flex-col ${teamDirectoryStackGapClass(presentation.gap)}`}>
            {members.map((member) => (
              <TeamDirectoryRow key={member.id} member={member} presentation={presentation} detached />
            ))}
          </div>
        ) : (
          <div className={`overflow-hidden ${teamCardFrameClass(presentation)}`} style={teamCardStyle(presentation)}>
            {members.map((member) => (
              <TeamDirectoryRow key={member.id} member={member} presentation={presentation} detached={false} />
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className={`w-full overflow-visible ${teamGridClass(presentation.columns, presentation.gap, presentation.listAlign, presentation.layout)}`}
    >
      {members.map((member, index) =>
        presentation.layout === 'profile-cards' ? (
          <TeamProfileCard key={member.id} member={member} presentation={presentation} />
        ) : presentation.layout === 'hover-cards' ? (
          <TeamHoverCard key={member.id} member={member} presentation={presentation} />
        ) : presentation.layout === 'cover-cards' ? (
          <TeamCoverCard key={member.id} member={member} presentation={presentation} />
        ) : presentation.layout === 'avatar-cards' ? (
          <TeamAvatarCard key={member.id} member={member} presentation={presentation} />
        ) : presentation.layout === 'float-cards' ? (
          <TeamFloatCard key={member.id} member={member} presentation={presentation} />
        ) : (
          <TeamStandardCard
            key={member.id}
            member={member}
            presentation={presentation}
            polaroidIndex={presentation.layout === 'polaroid' ? index : undefined}
          />
        )
      )}
    </div>
  );
}

export function SkillPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
      <CreatorToolLogo label={label} size={22} />
      {label}
    </span>
  );
}

export function SideInfoCard({
  label,
  title,
  subtitle,
  lines,
  dark = false,
  action,
  icon: Icon,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  label: string;
  title: string;
  subtitle?: string;
  lines?: string[];
  dark?: boolean;
  action?: React.ReactNode;
  icon: (props: { className?: string }) => React.ReactNode;
  presentation?: PortfolioAboutPresentationSettings;
}) {
  const accent = aboutPalettePrincipalColor(presentation);
  // Separate cards stay solid — split/divider chrome belongs on the framed panel.
  const cardPresentation: PortfolioAboutPresentationSettings = {
    ...presentation,
    sidePanelBackgroundFill: 'solid',
    sidePanelDividerEnabled: false,
  };

  return (
    <AboutSidePanelCardShell
      presentation={cardPresentation}
      className="group w-full transition duration-200 hover:shadow-[0_14px_36px_-22px_rgba(0,0,0,0.28)]"
    >
      <SideInfoRow
        label={label}
        title={title}
        subtitle={subtitle}
        lines={lines}
        dark={dark}
        action={action}
        icon={Icon}
        presentation={presentation}
        accent={accent}
        iconPlacement={presentation.sidePanelIconPlacement ?? 'left'}
        showIcon={presentation.sidePanelShowIcons !== false}
      />
    </AboutSidePanelCardShell>
  );
}

function SideInfoRow({
  label,
  title,
  subtitle,
  lines,
  dark = false,
  action,
  icon: Icon,
  plainIcon = false,
  hideLabel = false,
  iconPlacement = 'left',
  iconShape = 'rounded',
  showIcon = true,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  accent: accentProp,
}: {
  label: string;
  title: string;
  subtitle?: string;
  /** When set, show a vertical list instead of (or in place of) a single title line. */
  lines?: string[];
  dark?: boolean;
  action?: React.ReactNode;
  icon: (props: { className?: string }) => React.ReactNode;
  plainIcon?: boolean;
  hideLabel?: boolean;
  iconPlacement?: PortfolioAboutSidePanelIconPlacement;
  /** Soft badge shape — circle for info-bar, rounded square for cards. */
  iconShape?: 'rounded' | 'circle';
  showIcon?: boolean;
  presentation?: PortfolioAboutPresentationSettings;
  accent?: string;
}) {
  const accent = accentProp ?? aboutPalettePrincipalColor(presentation);
  const microLabelColor = aboutSidePanelMicroLabelColor(presentation);
  const labelClass = elementTextStyleClass(presentation.elementStyles.sideLabel, 'label');
  const labelStyle = dark
    ? undefined
    : { ...elementTextInlineStyle(presentation.elementStyles.sideLabel), color: microLabelColor };
  const titleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
  const titleStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideTitle);
  const subtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
  const subtitleStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideSubtitle);
  const listLines = (lines ?? []).map((line) => line.trim()).filter(Boolean);
  const placement = sidePanelIconPlacementClass(showIcon ? iconPlacement : 'left');
  const badgeRadius = iconShape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const iconWrapClass = plainIcon
    ? `shrink-0 transition duration-200 ${dark ? 'text-emerald-400' : ''}`
    : `flex h-11 w-11 shrink-0 items-center justify-center ${badgeRadius} transition duration-200 group-hover:scale-[1.03] ${
        dark ? 'bg-emerald-500/15 text-emerald-400' : ''
      }`;
  const iconWrapStyle = dark
    ? undefined
    : plainIcon
      ? { color: accent }
      : { color: accent, backgroundColor: aboutSidePanelAccentSoftBackground(accent) };

  const iconNode = showIcon ? (
    <div className={`${placement.icon} ${iconWrapClass}`.trim()} style={iconWrapStyle} aria-hidden>
      <Icon className={plainIcon ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5'} />
    </div>
  ) : null;

  const textNode = (
    <div className={`${placement.text}${!showIcon || plainIcon || iconPlacement === 'top' ? '' : ' pt-0.5'}`}>
      {hideLabel ? null : (
        <p
          className={`leading-snug ${dark ? 'font-bold text-emerald-400' : labelClass}`}
          style={labelStyle}
        >
          {label}
        </p>
      )}
      {listLines.length > 0 ? (
        <ul
          className={`${hideLabel ? '' : 'mt-1.5'} space-y-0.5 ${dark ? 'font-bold text-white' : titleClass}`}
          style={titleStyle}
        >
          {listLines.map((line) => (
            <li key={line} className="leading-snug">
              {line}
            </li>
          ))}
        </ul>
      ) : (
        <p
          className={`leading-snug ${hideLabel ? '' : 'mt-1.5'} ${dark ? 'font-bold text-white' : titleClass}`}
          style={titleStyle}
        >
          {title}
        </p>
      )}
      {subtitle ? (
        <p className={`mt-1 leading-relaxed ${dark ? 'text-neutral-400' : subtitleClass}`} style={subtitleStyle}>
          {subtitle}
        </p>
      ) : null}
      {action ? <div className="mt-3.5">{action}</div> : null}
    </div>
  );

  if (!showIcon) {
    return <div className="w-full min-w-0">{textNode}</div>;
  }

  return (
    <div className={`${placement.row} w-full`}>
      {iconPlacement === 'top' ? (
        <>
          {iconNode}
          {textNode}
        </>
      ) : iconPlacement === 'right' ? (
        <>
          {textNode}
          {iconNode}
        </>
      ) : (
        <>
          {iconNode}
          {textNode}
        </>
      )}
    </div>
  );
}

export type EditorialSideInfoItem = {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  /** Vertical list body (languages, days/hours, …). */
  lines?: string[];
  icon: (props: { className?: string }) => React.ReactNode;
};

/** Single vertical panel for About sidebar details (location, languages, etc.). */
function AboutSidePanelCardShell({
  presentation,
  className = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  className?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const frameClass = aboutSidePanelFrameClass(presentation, { includePadding });
  const surfaceStyle = aboutSidePanelFrameStyle(presentation);
  const background = aboutSidePanelCardBackgroundSettings(presentation);

  return (
    <div className={`relative overflow-hidden ${frameClass} ${className}`.trim()} style={surfaceStyle}>
      <ServicesCardBackgroundLayers presentation={background} />
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </div>
  );
}

export function EditorialSideInfoPanel({
  items,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  layoutMode = 'sidebar-right',
}: {
  items: EditorialSideInfoItem[];
  presentation?: PortfolioAboutPresentationSettings;
  layoutMode?: PortfolioAboutLayoutMode;
}) {
  if (items.length === 0) return null;

  const isFullWidth = layoutMode === 'full-width';
  const isTwinColumns = layoutMode === 'twin-columns';
  const design = presentation.sidePanelDesign;
  const iconPlacement = presentation.sidePanelIconPlacement ?? 'left';
  const showIcons = presentation.sidePanelShowIcons !== false;
  const itemLayout = isFullWidth ? presentation.sidePanelFullWidthLayout : 'stacked';
  const supportsGap =
    itemLayout !== 'profile-frame' &&
    itemLayout !== 'inline-band' &&
    design !== 'info-bar';
  const layoutClass = aboutSidePanelFullWidthLayoutClass(itemLayout, {
    gapControlled: supportsGap,
  });
  const centerClass = aboutSidePanelAutoCenterClass(presentation.sidePanelAutoCenter, itemLayout);
  // Twin-columns: full width on mobile, hug content width on large screens.
  const twinFitClass = isTwinColumns
    ? 'w-full max-w-full lg:max-w-[20rem] xl:max-w-[22rem]'
    : '';
  const dividerColor = aboutSidePanelDividerColor(presentation);
  const accent = aboutPalettePrincipalColor(presentation);
  const gapStyle = supportsGap
    ? aboutSidePanelContentGapStyle(presentation, {
        minPx:
          itemLayout === 'horizontal' || itemLayout === 'grid-2' || itemLayout === 'grid-3'
            ? 24
            : undefined,
      })
    : undefined;
  const cellClass = aboutSidePanelItemCellClass(itemLayout, design, {
    gapControlled: supportsGap,
  });

  const renderItem = (
    item: EditorialSideInfoItem,
    options?: {
      hideLabel?: boolean;
      plainIcon?: boolean;
      iconShape?: 'rounded' | 'circle';
      cellClassName?: string;
      showIcon?: boolean;
    }
  ) => (
    <div key={item.id} className={options?.cellClassName ?? cellClass}>
      <SideInfoRow
        label={item.label}
        title={item.title}
        subtitle={item.subtitle}
        lines={item.lines}
        icon={item.icon}
        plainIcon={options?.plainIcon ?? true}
        hideLabel={options?.hideLabel ?? true}
        iconPlacement={iconPlacement}
        iconShape={options?.iconShape ?? 'rounded'}
        showIcon={options?.showIcon ?? showIcons}
        presentation={presentation}
        accent={accent}
      />
    </div>
  );

  // Liste à puces — markers like Why me, soft gap only (no vertical dividers / info-bar separators).
  if (design === 'list') {
    const markerStyle = presentation.sidePanelMarkerStyle ?? 'disc';
    const markerSize = presentation.sidePanelMarkerSize ?? 'md';
    const markerSizePx = presentation.sidePanelMarkerSizePx;
    const markerWeight = presentation.sidePanelMarkerWeight ?? 'regular';
    const markerWeightAmount = presentation.sidePanelMarkerWeightAmount;
    const markerColor = resolveSidePanelMarkerColor(presentation);
    const listGapStyle = aboutSidePanelContentGapStyle(presentation);

    return (
      <div className={`${aboutSidePanelShellClass('list')} ${centerClass} ${twinFitClass}`.trim()}>
        <ul className="flex flex-col" style={listGapStyle} role="list">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${elementTextStyleClass(
                presentation.elementStyles.sideTitle,
                'body'
              )}`}
              style={elementTextInlineStyle(presentation.elementStyles.sideTitle)}
            >
              {markerStyle !== 'none' ? (
                <WhyMeInlineMarkerSlot>
                  <WhyMeIndexMarker
                    index={index}
                    style={markerStyle}
                    accent={markerColor}
                    size={markerSize}
                    sizePx={markerSizePx}
                    weight={markerWeight}
                    weightAmount={markerWeightAmount}
                    inline
                  />
                </WhyMeInlineMarkerSlot>
              ) : null}
              <div className="min-w-0 flex-1">
                <SideInfoRow
                  label={item.label}
                  title={item.title}
                  subtitle={item.subtitle}
                  lines={item.lines}
                  icon={item.icon}
                  plainIcon
                  hideLabel={false}
                  iconPlacement="left"
                  showIcon={false}
                  presentation={presentation}
                  accent={accent}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (design === 'info-bar') {
    const infoCellClass = aboutSidePanelItemCellClass('stacked', 'info-bar', {
      gapControlled: false,
    });
    return (
      <AboutSidePanelCardShell
        presentation={presentation}
        includePadding={false}
        className={`${centerClass} ${twinFitClass}`.trim()}
      >
        <div className={aboutSidePanelInfoBarLayoutClass(items.length)}>
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 ? (
                <span
                  className="h-px w-full shrink-0 sm:h-auto sm:w-px sm:self-stretch"
                  style={{ backgroundColor: dividerColor }}
                  aria-hidden
                />
              ) : null}
              {renderItem(item, {
                hideLabel: false,
                plainIcon: false,
                iconShape: 'circle',
                cellClassName: infoCellClass,
              })}
            </Fragment>
          ))}
        </div>
      </AboutSidePanelCardShell>
    );
  }

  // Variante 1 — horizontal strip: no heavy white panel, equal columns, icon → label → value.
  if (design === 'info-strip') {
    const colCount = Math.min(Math.max(items.length, 2), 5);
    const stripCols =
      colCount <= 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : colCount === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : colCount === 4
            ? 'grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
    const titleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
    const titleStyle = elementTextInlineStyle(presentation.elementStyles.sideTitle);
    const subtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
    const subtitleStyle = elementTextInlineStyle(presentation.elementStyles.sideSubtitle);

    return (
      <div className={`${aboutSidePanelShellClass('info-strip')} ${centerClass}`.trim()}>
        <div className={`grid gap-x-8 gap-y-8 sm:gap-x-10 sm:gap-y-8 ${stripCols}`}>
          {items.map((item) => {
            const listLines = (item.lines ?? []).map((line) => line.trim()).filter(Boolean);
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex min-w-0 flex-col items-start gap-2.5">
                {showIcons ? (
                  <div className="shrink-0" style={{ color: accent }} aria-hidden>
                    <Icon className="h-5 w-5" />
                  </div>
                ) : null}
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.16em]"
                  style={{ color: aboutSidePanelMicroLabelColor(presentation) }}
                >
                  {item.label}
                </p>
                {listLines.length > 0 ? (
                  <ul className={`space-y-0.5 ${titleClass}`} style={titleStyle}>
                    {listLines.map((line) => (
                      <li key={line} className="leading-snug">
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`leading-snug ${titleClass}`} style={titleStyle}>
                    {item.title}
                  </p>
                )}
                {item.subtitle ? (
                  <p className={`leading-relaxed ${subtitleClass}`} style={subtitleStyle}>
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Variante 2 — CV résumé: optional bio, then equal-width info cards (full bleed, no Gender).
  if (design === 'profile-cv') {
    const bio = (presentation.sidePanelBio ?? '').trim();
    const showBio = presentation.showSidePanelBio !== false && Boolean(bio);
    const badgeTitleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
    const badgeTitleStyle = elementTextInlineStyle(presentation.elementStyles.sideTitle);
    const badgeSubtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
    const badgeSubtitleStyle = elementTextInlineStyle(presentation.elementStyles.sideSubtitle);
    // Drop Gender — keeps a clean 4-up dashboard aligned with Why me above.
    const cvItems = items.filter((item) => item.id !== 'gender').slice(0, 4);
    const colCount = Math.max(1, Math.min(4, cvItems.length));
    const cvGridClass =
      colCount <= 1
        ? 'grid-cols-1'
        : colCount === 2
          ? 'grid-cols-1 sm:grid-cols-2'
          : colCount === 3
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return (
      <div className={`${aboutSidePanelShellClass('profile-cv')} ${centerClass} w-full space-y-6`.trim()}>
        {showBio ? (
          <div className="min-w-0 max-w-3xl">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.16em]"
              style={{ color: aboutSidePanelMicroLabelColor(presentation) }}
            >
              Philosophie
            </p>
            <p
              className={`mt-3 text-base leading-relaxed sm:text-[1.05rem] sm:leading-relaxed ${elementTextStyleClass(
                presentation.elementStyles.sideSubtitle,
                'body'
              )}`}
              style={elementTextInlineStyle(presentation.elementStyles.sideSubtitle)}
            >
              {bio}
            </p>
          </div>
        ) : null}
        <div className={`grid w-full gap-4 sm:gap-5 ${cvGridClass}`}>
          {cvItems.map((item) => {
            const listLines = (item.lines ?? []).map((line) => line.trim()).filter(Boolean);
            const Icon = item.icon;
            const primary =
              listLines.length > 0
                ? [item.title, ...listLines]
                    .map((part) => part.trim())
                    .filter(Boolean)
                    .join(' · ')
                : item.title;
            return (
              <div
                key={item.id}
                className="flex h-full min-w-0 flex-col items-start gap-3 overflow-hidden rounded-[1.35rem] border border-neutral-200/80 bg-white px-5 py-4 sm:px-5 sm:py-5"
              >
                {showIcons ? (
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      color: accent,
                      backgroundColor: aboutSidePanelAccentSoftBackground(accent),
                    }}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                ) : null}
                <div className="min-w-0 w-full">
                  <p
                    className="text-[11px] font-medium uppercase tracking-[0.16em]"
                    style={{ color: aboutSidePanelMicroLabelColor(presentation) }}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`mt-1.5 break-words leading-snug ${badgeTitleClass}`}
                    style={badgeTitleStyle}
                  >
                    {primary}
                  </p>
                  {item.subtitle ? (
                    <p
                      className={`mt-1 break-words leading-snug ${badgeSubtitleClass}`}
                      style={badgeSubtitleStyle}
                    >
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (design === 'cards') {
    return (
      <div
        className={`${isFullWidth ? layoutClass : aboutSidePanelShellClass('cards')} ${centerClass} ${twinFitClass} ${
          presentation.sidePanelAutoCenter
            ? '[&>*]:w-full [&>*]:max-w-none sm:[&>*]:max-w-md'
            : '[&>*]:w-full'
        }`.trim()}
        style={gapStyle}
      >
        {items.map((item) => (
          <SideInfoCard
            key={item.id}
            label={item.label}
            title={item.title}
            subtitle={item.subtitle}
            lines={item.lines}
            icon={item.icon}
            presentation={presentation}
          />
        ))}
      </div>
    );
  }

  if (design === 'minimal') {
    const minimalStack = itemLayout === 'stacked' || !isFullWidth;
    return (
      <div
        className={`${isFullWidth && !minimalStack ? layoutClass : aboutSidePanelShellClass('minimal')} ${centerClass} ${twinFitClass}`.trim()}
        style={gapStyle}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={aboutSidePanelItemCellClass(itemLayout, 'minimal', {
              gapControlled: supportsGap,
            })}
            style={
              minimalStack && index > 0
                ? { borderTop: `1px solid ${dividerColor}` }
                : undefined
            }
          >
            <SideInfoRow
              label={item.label}
              title={item.title}
              subtitle={item.subtitle}
              lines={item.lines}
              icon={item.icon}
              plainIcon
              hideLabel
              iconPlacement={iconPlacement}
              showIcon={showIcons}
              presentation={presentation}
              accent={accent}
            />
          </div>
        ))}
      </div>
    );
  }

  if (itemLayout === 'profile-frame') {
    const locationItem =
      items.find((item) => item.id === 'location') ?? items[0] ?? null;
    const restItems = items.filter((item) => item.id !== locationItem?.id);
    // Prefer a 2×2 grid on the right; leftover items wrap into another row.
    const rightGridClass =
      restItems.length <= 2
        ? 'grid grid-cols-1 sm:grid-cols-2'
        : 'grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2';
    const frameBorder = { borderColor: dividerColor };

    return (
      <AboutSidePanelCardShell
        presentation={presentation}
        includePadding={false}
        className={`${centerClass} ${twinFitClass}`.trim()}
      >
        <div className="grid gap-0 lg:grid-cols-[minmax(11rem,0.38fr)_minmax(0,0.62fr)]">
          {/* Unequal left rail — location only */}
          <div
            className="flex min-w-0 flex-col justify-center border-b px-5 py-5 sm:px-6 sm:py-6 lg:border-r lg:border-b-0"
            style={frameBorder}
          >
            {locationItem ? renderItem(locationItem) : null}
          </div>
          {/* Right: two rows × two items */}
          <div
            className={`${rightGridClass} divide-y sm:divide-y-0 [&>*]:border-inherit sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(-n+2)]:border-b`}
            style={frameBorder}
          >
            {restItems.map((item) => renderItem(item))}
          </div>
        </div>
      </AboutSidePanelCardShell>
    );
  }

  const itemList = items.map((item) => renderItem(item));

  return (
    <AboutSidePanelCardShell
      presentation={presentation}
      className={`${centerClass} ${twinFitClass}`.trim()}
    >
      <div className={`${layoutClass} ${centerClass}`} style={gapStyle}>
        {itemList}
      </div>
    </AboutSidePanelCardShell>
  );
}

function ContactCardShell({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  const openChrome =
    presentation.cardDesign === 'tiles' ||
    presentation.cardDesign === 'channel-cards' ||
    isContactOwnedLayoutDesign(presentation.cardDesign);
  const skipOuterFill =
    presentation.cardDesign === 'tiles' ||
    presentation.cardDesign === 'channel-cards' ||
    isContactOwnedLayoutDesign(presentation.cardDesign);
  return (
    <div
      className={`relative ${openChrome ? 'overflow-visible' : 'overflow-hidden'} ${contactCardFrameClass(
        presentation
      )} ${contactCardShellClass(presentation.cardDesign)}`}
      style={{ ...contactCardFrameStyle(presentation), ...contactChromeCssVars(presentation) }}
    >
      {skipOuterFill ? null : <ServicesCardBackgroundLayers presentation={presentation} />}
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </div>
  );
}

function ContactFormShell({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  const formDesign = resolveContactFormDesign(presentation);
  if (formDesign === 'info-panel') {
    return (
      <div
        className={contactInfoPanelFormCardClass(presentation)}
        style={{
          ...contactInfoPanelFormCardStyle(presentation),
          ...contactChromeCssVars(presentation),
        }}
      >
        <ServicesCardForeground>{children}</ServicesCardForeground>
      </div>
    );
  }
  return (
    <div
      className={`${contactFormFrameClass(presentation)} flex h-full min-h-full w-full flex-col`}
      style={{ ...contactFormFrameStyle(presentation), ...contactChromeCssVars(presentation) }}
    >
      <ServicesCardForeground className="flex h-full min-h-0 w-full flex-1 flex-col">
        {children}
      </ServicesCardForeground>
    </div>
  );
}

function ContactChannelGlyph({
  kind,
  className = 'h-6 w-6',
}: {
  kind: 'email' | 'phone' | 'location';
  className?: string;
}) {
  if (kind === 'email') return <ContactEmailIcon className={className} />;
  if (kind === 'phone') return <ContactPhoneIcon className={className} />;
  return <ContactLocationIcon className={className} />;
}

function ContactItemIconBadge({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  const withThinBorder = {
    ...presentation,
    iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
  };
  return (
    <div
      className={contactIconShellClass(withThinBorder)}
      style={{
        ...contactIconShellStyle(withThinBorder),
        borderColor:
          presentation.iconBorderColor ||
          presentation.cardBorderColor ||
          'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
      }}
    >
      {children}
    </div>
  );
}

type ContactUnifiedItem = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  external?: boolean;
  icon: React.ReactNode;
  titleStyleTarget: 'channelValue' | 'locationValue' | 'linkLabel' | 'linksHeading' | 'linkUrl';
  subtitleStyleTarget: 'channelValue' | 'locationValue' | 'linkLabel' | 'linksHeading' | 'linkUrl';
};

function contactElementStyleForTarget(
  target: ContactUnifiedItem['titleStyleTarget'],
  elementStyles: PortfolioContactElementStyles
) {
  switch (target) {
    case 'locationValue':
      return elementStyles.locationValue;
    case 'linkLabel':
      return elementStyles.linkLabel;
    case 'linksHeading':
      return elementStyles.linksHeading;
    case 'linkUrl':
      return elementStyles.linkUrl;
    default:
      return elementStyles.channelValue;
  }
}

function ContactUnifiedItemRow({
  item,
  design,
  cardPadding,
  iconPlacement,
  elementStyles,
  colorMode = 'light',
}: {
  item: ContactUnifiedItem;
  design: PortfolioContactPresentationSettings['cardDesign'];
  cardPadding: PortfolioContactPresentationSettings['cardPadding'];
  iconPlacement: PortfolioContactIconPlacement;
  elementStyles: PortfolioContactElementStyles;
  colorMode?: 'light' | 'dark';
}) {
  const placement =
    design === 'directory'
      ? {
          row: 'flex flex-row items-center gap-3 text-left',
          icon: 'shrink-0',
          text: 'min-w-0 flex-1 text-left',
        }
      : contactIconPlacementClass(iconPlacement);
  const shell = contactItemRowShellClass(design, cardPadding);
  const titleStyleDefRaw = contactElementStyleForTarget(item.titleStyleTarget, elementStyles);
  const titleStyleDef =
    design === 'editorial' &&
    (item.titleStyleTarget === 'channelValue' || item.titleStyleTarget === 'locationValue')
      ? { ...titleStyleDefRaw, size: 'md' as const }
      : titleStyleDefRaw;
  const subtitleStyleDef = contactElementStyleForTarget(item.subtitleStyleTarget, elementStyles);
  const isChannelValue =
    item.titleStyleTarget === 'channelValue' ||
    item.titleStyleTarget === 'locationValue' ||
    item.titleStyleTarget === 'linkLabel';
  const titleClass = elementTextStyleClass(
    isChannelValue ? { ...titleStyleDef, weight: 'semibold' } : titleStyleDef,
    item.titleStyleTarget === 'linksHeading' || item.titleStyleTarget === 'linkUrl' ? 'label' : 'body'
  )
    .replace(/\bfont-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const titleStyle: CSSProperties = {
    ...elementTextInlineStyle(titleStyleDef, colorMode),
    ...(isChannelValue ? { fontWeight: 600 } : null),
  };
  const subtitleClass = elementTextStyleClass(
    subtitleStyleDef,
    item.subtitleStyleTarget === 'linksHeading' || item.subtitleStyleTarget === 'linkUrl'
      ? 'label'
      : 'body'
  );
  const subtitleStyle = elementTextInlineStyle(subtitleStyleDef, colorMode);
  const showSubtitle = Boolean(item.subtitle?.trim());

  const textBlock = (
    <div className={placement.text}>
      <p
        className={`truncate ${isChannelValue ? 'font-semibold' : ''} ${titleClass}`.trim()}
        style={titleStyle}
      >
        {item.title}
      </p>
      {showSubtitle ? (
        <p className={`mt-0.5 truncate ${subtitleClass}`} style={subtitleStyle}>
          {item.subtitle}
        </p>
      ) : null}
    </div>
  );

  return (
    <a
      href={item.href}
      {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`group relative ${shell} ${placement.row}`}
    >
      {iconPlacement === 'top' ? (
        <>
          <div className={placement.icon}>{item.icon}</div>
          {textBlock}
        </>
      ) : iconPlacement === 'right' ? (
        <>
          {textBlock}
          <div className={placement.icon}>{item.icon}</div>
        </>
      ) : (
        <>
          <div className={placement.icon}>{item.icon}</div>
          {textBlock}
        </>
      )}
    </a>
  );
}

function ContactUnifiedList({
  presentation,
  visibleEmail,
  visiblePhone,
  visibleLocation,
  links,
  renderSocialIcon,
  socialBrandClass,
  elementStyles,
  includeLinks = true,
}: {
  presentation: PortfolioContactPresentationSettings;
  visibleEmail: string | null;
  visiblePhone: string | null;
  visibleLocation: string | null;
  links: EditorialContactLink[];
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  elementStyles: PortfolioContactElementStyles;
  /** When false, only email / phone / location rows are rendered (Directory socials sit outside). */
  includeLinks?: boolean;
}) {
  const glyphClass = contactIconGlyphClass(presentation.iconSize ?? 'md');
  const isEditorial = presentation.cardDesign === 'editorial';
  const isDirectory = presentation.cardDesign === 'directory';
  const channelIconPresentation = isDirectory
    ? {
        ...presentation,
        iconRadius: 'full' as const,
        iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
        iconBackgroundEnabled: false,
        iconColor: presentation.iconColor?.trim() || presentation.ctaColor,
      }
    : presentation;
  // Filled channel glyphs read larger than social marks — keep them one step smaller in editorial.
  const channelGlyphClass = isEditorial
    ? contactIconGlyphClass(
        presentation.iconSize === 'xl'
          ? 'lg'
          : presentation.iconSize === 'lg'
            ? 'md'
            : 'sm'
      )
    : glyphClass;
  const channelItems: ContactUnifiedItem[] = [];
  if (visibleEmail?.trim()) {
    channelItems.push(
      isEditorial
        ? {
            id: 'channel-email',
            href: `mailto:${visibleEmail.trim()}`,
            title: visibleEmail.trim(),
            subtitle: '',
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="email" className={channelGlyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
        : {
            id: 'channel-email',
            href: `mailto:${visibleEmail.trim()}`,
            title: visibleEmail.trim(),
            subtitle: 'Email',
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="email" className={glyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
    );
  }
  if (visiblePhone?.trim()) {
    channelItems.push(
      isEditorial
        ? {
            id: 'channel-phone',
            href: `tel:${visiblePhone.trim()}`,
            title: formatPhoneDisplay(visiblePhone.trim()),
            subtitle: '',
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="phone" className={channelGlyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
        : {
            id: 'channel-phone',
            href: `tel:${visiblePhone.trim()}`,
            title: formatPhoneDisplay(visiblePhone.trim()),
            subtitle: 'Phone',
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="phone" className={glyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'channelValue',
            subtitleStyleTarget: 'linksHeading',
          }
    );
  }
  if (visibleLocation?.trim()) {
    channelItems.push(
      isEditorial
        ? {
            id: 'channel-location',
            href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
            title: visibleLocation.trim(),
            subtitle: '',
            external: true,
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="location" className={channelGlyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'locationValue',
            subtitleStyleTarget: 'linksHeading',
          }
        : {
            id: 'channel-location',
            href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
            title: visibleLocation.trim(),
            subtitle: 'Location',
            external: true,
            icon: (
              <ContactItemIconBadge presentation={channelIconPresentation}>
                <ContactChannelGlyph kind="location" className={glyphClass} />
              </ContactItemIconBadge>
            ),
            titleStyleTarget: 'locationValue',
            subtitleStyleTarget: 'linksHeading',
          }
    );
  }

  const linkItems: ContactUnifiedItem[] = includeLinks
    ? links.map((link) => {
        if (isEditorial) {
          return {
            id: link.id,
            href: link.url,
            title: contactSocialNetworkLabel(link),
            subtitle: '',
            external: true,
            icon: (
              <ContactLinkIcon
                link={link}
                presentation={presentation}
                renderSocialIcon={renderSocialIcon}
                socialBrandClass={socialBrandClass}
              />
            ),
            titleStyleTarget: 'linkLabel' as const,
            subtitleStyleTarget: 'linkUrl' as const,
          };
        }
        const url = link.url.trim();
        let hostname = '';
        try {
          hostname = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
            /^www\./i,
            ''
          );
        } catch {
          hostname = '';
        }
        const title = link.label?.trim() || hostname || url;
        return {
          id: link.id,
          href: link.url,
          title,
          subtitle: url.replace(/^https?:\/\//, ''),
          external: true,
          icon: (
            <ContactLinkIcon
              link={link}
              presentation={presentation}
              renderSocialIcon={renderSocialIcon}
              socialBrandClass={socialBrandClass}
            />
          ),
          titleStyleTarget: 'linkLabel' as const,
          subtitleStyleTarget: 'linkUrl' as const,
        };
      })
    : [];

  const items =
    presentation.blockOrder === 'links-first'
      ? [...linkItems, ...channelItems]
      : [...channelItems, ...linkItems];

  if (items.length === 0) return null;

  return (
    <div className={contactItemsLayoutClass(presentation.cardDesign, presentation.itemGap ?? 'md')}>
      {items.map((item) => (
        <ContactUnifiedItemRow
          key={item.id}
          item={item}
          design={presentation.cardDesign}
          cardPadding={presentation.cardPadding}
          iconPlacement={
            presentation.cardDesign === 'editorial'
              ? 'left'
              : presentation.cardDesign === 'directory'
                ? 'left'
                : (presentation.iconPlacement ?? 'left')
          }
          elementStyles={elementStyles}
        />
      ))}
    </div>
  );
}

/** Directory — social / website links as rounded logo-only chips outside the card. */
function ContactDirectorySocialIcons({
  links,
  presentation,
  renderSocialIcon,
  socialBrandClass,
  className = '',
  enlarged = false,
}: {
  links: EditorialContactLink[];
  presentation: PortfolioContactPresentationSettings;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  className?: string;
  /** Directory hero socials — much larger chips. */
  enlarged?: boolean;
}) {
  if (links.length === 0) return null;
  const glyphClass = enlarged
    ? 'h-10 w-10 sm:h-12 sm:w-12'
    : contactIconGlyphClass(presentation.iconSize ?? 'md');
  const thinBorderPresentation = {
    ...presentation,
    iconRadius: 'full' as const,
    iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
    ...(enlarged ? { iconSize: 'xl' as const } : null),
  };
  const enlargedShellClass = enlarged
    ? 'flex h-20 w-20 shrink-0 items-center justify-center rounded-full sm:h-24 sm:w-24'
    : '';

  return (
    <nav
      className={`flex flex-wrap items-center justify-center gap-6 sm:gap-8 ${className}`.trim()}
      aria-label="Social links"
    >
      {links.map((link) => {
        const platform = inferContactLinkPlatform(link);
        const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
        const isSocial = socialKey !== 'other';
        const useBrand = presentation.iconUseBrandColors !== false;
        const label =
          link.label?.trim() ||
          (platform ? platform.replace(/_/g, ' ').toLowerCase() : 'Link');

        let iconNode: React.ReactNode;
        let shellClass = `${
          enlarged ? enlargedShellClass : contactIconShellClass(thinBorderPresentation)
        } ${contactIconBorderClass(thinBorderPresentation.iconBorder)} transition hover:opacity-90`.trim();
        let shellStyle: React.CSSProperties = {
          ...contactIconShellStyle(thinBorderPresentation),
          borderColor:
            presentation.iconBorderColor ||
            presentation.cardBorderColor ||
            'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
        };

        if (isSocial && platform) {
          iconNode = renderSocialIcon?.(platform, glyphClass) ?? (
            <SocialPlatformIcon platform={platform} className={glyphClass} />
          );
          if (useBrand && presentation.iconBackgroundEnabled !== false) {
            const brandClass = socialBrandClass?.(platform) ?? socialPlatformBrandClass(platform);
            shellClass = `${shellClass} ${brandClass}`.trim();
          }
        } else if (link.type === 'WEBSITE') {
          iconNode = (
            <svg
              className={glyphClass}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          );
        } else {
          iconNode = (
            <svg
              className={glyphClass}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          );
        }

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className={shellClass}
            style={shellStyle}
          >
            {iconNode}
          </a>
        );
      })}
    </nav>
  );
}

export function ContactChannelCard({
  label,
  value,
  href,
  icon,
  embedded = false,
  plainIcon = false,
  showLabel = true,
  paddingClass = 'p-6 sm:p-7',
  valueTextClass = 'text-lg font-semibold leading-snug text-neutral-950',
  valueTextStyle,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  embedded?: boolean;
  plainIcon?: boolean;
  showLabel?: boolean;
  paddingClass?: string;
  valueTextClass?: string;
  valueTextStyle?: React.CSSProperties;
}) {
  // Legacy export kept for any external callers — mirrors unified left-icon row.
  return (
    <a
      href={href}
      aria-label={showLabel ? undefined : `${label}: ${value}`}
      className={`group relative flex items-center gap-4 transition duration-200 ${
        embedded
          ? `${paddingClass} hover:bg-[color:var(--contact-hover-fill,transparent)]`
          : `rounded-[1.35rem] border border-[color:var(--contact-border,#e5e5e5)] ${paddingClass}`
      }`}
    >
      {plainIcon ? (
        <div className="shrink-0 text-[color:var(--contact-accent,#ea580c)] [&_svg]:h-7 [&_svg]:w-7">{icon}</div>
      ) : (
        <ContactItemIconBadge presentation={DEFAULT_CONTACT_PRESENTATION}>{icon}</ContactItemIconBadge>
      )}
      <div className="min-w-0 flex-1">
        {showLabel ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--contact-accent,#ea580c)]">
            {label}
          </p>
        ) : null}
        <p className={`break-words leading-snug ${valueTextClass}`} style={valueTextStyle}>
          {value}
        </p>
      </div>
    </a>
  );
}

function ContactEmailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

function ContactPhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
      />
    </svg>
  );
}

function ContactLocationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
      />
    </svg>
  );
}

export type EditorialContactLink = {
  id: string;
  label: string;
  url: string;
  type: string;
  platform?: string | null;
};

function inferContactLinkPlatform(link: EditorialContactLink): string | null {
  if (link.platform?.trim()) return link.platform.trim();

  const haystack = `${link.url} ${link.label}`.toLowerCase();
  if (haystack.includes('youtube') || haystack.includes('youtu.be')) return 'YOUTUBE';
  if (haystack.includes('tiktok')) return 'TIKTOK';
  if (haystack.includes('instagram')) return 'INSTAGRAM';
  if (haystack.includes('linkedin')) return 'LINKEDIN';
  if (haystack.includes('github')) return 'GITHUB';
  if (haystack.includes('twitter') || haystack.includes('x.com')) return 'TWITTER';
  if (haystack.includes('facebook') || haystack.includes('fb.com') || haystack.includes('fb.me')) {
    return 'FACEBOOK';
  }

  return link.type === 'SOCIAL' ? link.label : null;
}

function contactSocialNetworkLabel(link: EditorialContactLink): string {
  const platform = inferContactLinkPlatform(link);
  if (platform) {
    const key = normalizeSocialPlatformKey(platform);
    switch (key) {
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      case 'github':
        return 'GitHub';
      case 'twitter':
        return 'X';
      default:
        break;
    }
  }
  if (link.type === 'WEBSITE') return 'Website';
  const label = link.label?.trim();
  if (label) return label;
  return 'Link';
}

function ContactLinkIcon({
  link,
  presentation,
  renderSocialIcon,
  socialBrandClass,
}: {
  link: EditorialContactLink;
  presentation: PortfolioContactPresentationSettings;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
}) {
  const platform = inferContactLinkPlatform(link);
  const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
  const isSocial = socialKey !== 'other';
  const glyphClass = contactIconGlyphClass(presentation.iconSize ?? 'md');
  const useBrand = presentation.iconUseBrandColors !== false;

  if (isSocial && platform && useBrand) {
    const brandClass = socialBrandClass?.(platform) ?? socialPlatformBrandClass(platform);
    const iconNode = renderSocialIcon?.(platform, glyphClass) ?? (
      <SocialPlatformIcon platform={platform} className={glyphClass} />
    );
    const noFill = presentation.iconBackgroundEnabled === false;
    const withThinBorder = {
      ...presentation,
      iconBorder: (presentation.iconBorder === 'solid' ? 'solid' : 'soft') as PortfolioContactIconBorder,
    };

    return (
      <div
        className={`${contactIconShellClass(withThinBorder)} ${noFill ? '' : brandClass}`.trim()}
        style={{
          ...(noFill ? contactIconShellStyle(withThinBorder) : {}),
          borderColor:
            presentation.iconBorderColor ||
            presentation.cardBorderColor ||
            'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
        }}
      >
        {iconNode}
      </div>
    );
  }

  if (isSocial && platform) {
    const iconNode = renderSocialIcon?.(platform, glyphClass) ?? (
      <SocialPlatformIcon platform={platform} className={glyphClass} />
    );
    return <ContactItemIconBadge presentation={presentation}>{iconNode}</ContactItemIconBadge>;
  }

  // Website / generic links — same accent badge as email / phone / location (palette sync).
  const glyph =
    link.type === 'WEBSITE' ? (
      <svg className={glyphClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ) : (
      <svg className={glyphClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    );

  return <ContactItemIconBadge presentation={presentation}>{glyph}</ContactItemIconBadge>;
}

export function EditorialContactSection({
  creatorId,
  email,
  phone,
  locationLabel,
  links,
  ctaHref,
  ctaLabel = 'Start a project',
  responseTimeLabel,
  membersOnlyNode,
  renderSocialIcon,
  socialBrandClass,
  editorialLayout = false,
  sectionTitle,
  sectionSubtitle,
  presentation = DEFAULT_CONTACT_PRESENTATION,
  titleTypographyClass,
  titleTypographyStyle,
  subtitleTypographyClass,
  subtitleTypographyStyle,
  titleDecorationStyle,
  subtitleDecorationStyle,
  titleChromeClass,
  titleChromeStyle,
  customTitleSizing,
  customSubtitleSizing,
  orientation,
  centered,
  alignRight = false,
  alwaysCentered,
  suppressBackground = false,
  scrollBehavior = 'sticky',
  motionProfile = DEFAULT_MOTION_PROFILE,
  topSpacingClass = 'pt-12 sm:pt-16 lg:pt-20',
  topSpacingStyle,
  contentLayout = 'stacked',
}: {
  creatorId?: string;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  ctaHref: string;
  ctaLabel?: string;
  responseTimeLabel?: string | null;
  membersOnlyNode?: React.ReactNode;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  editorialLayout?: boolean;
  sectionTitle?: string;
  sectionSubtitle?: React.ReactNode;
  presentation?: PortfolioContactPresentationSettings;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  titleDecorationStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
  customTitleSizing?: boolean;
  customSubtitleSizing?: boolean;
  orientation?: 'horizontal' | 'vertical';
  centered?: boolean;
  alignRight?: boolean;
  alwaysCentered?: boolean;
  /** When a global solid is active, sections without their own fill stay clear; an enabled section fill paints on top. */
  suppressBackground?: boolean;
  /** Global scroll behavior for section titles. */
  scrollBehavior?: 'sticky' | 'static';
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Global padding-top above the section title. */
  topSpacingClass?: string;
  /** Optional CSS vars for Split screen px fine-tune. */
  topSpacingStyle?: React.CSSProperties;
  /** Split screen nav: title left / content right on large screens. */
  contentLayout?: 'stacked' | 'split';
}) {
  const visibleEmail = presentation.showEmail ? (email ?? null) : null;
  const visiblePhone = presentation.showPhone ? (phone ?? null) : null;
  const visibleLocation = presentation.showLocation ? (locationLabel ?? null) : null;
  const visibleLinks = presentation.showSocialLinks ? links : [];
  const hasPrimary = Boolean(
    visibleEmail?.trim() || visiblePhone?.trim() || visibleLocation?.trim()
  );
  const hasLinks = visibleLinks.length > 0;
  const isInquiryPanel = isContactInquiryPanelDesign(presentation.cardDesign);
  const isInquiry = presentation.cardDesign === 'inquiry';
  const isDesk = isContactDeskDesign(presentation.cardDesign);
  const isInfoPanel = isContactInfoPanelDesign(presentation.cardDesign);
  const isChannelCards = isContactChannelCardsDesign(presentation.cardDesign);
  const isSwissEditorial = isContactSwissEditorialDesign(presentation.cardDesign);
  const formDesign = resolveContactFormDesign(presentation);
  const colorMode =
    presentation.useHeroPalette === false ? contactActiveColorMode(presentation) : 'light';
  const showContactForm =
    Boolean(presentation.showContactForm) ||
    isContactOwnedLayoutDesign(presentation.cardDesign) ||
    presentation.cardDesign === 'editorial' ||
    presentation.cardDesign === 'directory';
  const contactFormPlacement =
    presentation.cardDesign === 'editorial' || presentation.cardDesign === 'directory'
      ? 'side'
      : (presentation.contactFormPlacement ?? 'below');
  const hasContactList = hasPrimary || hasLinks;
  const bgStyle =
    !suppressBackground && presentation.sectionBackgroundEnabled
      ? sectionBackgroundStyle(presentation)
      : undefined;
  const resolvedCtaLabel = presentation.ctaLabel.trim() || ctaLabel;
  const elementStyles = normalizeContactElementStyles(presentation.elementStyles);
  const ctaTextClass = elementTextStyleClass(elementStyles.ctaLabel, 'label');
  const ctaLabelColor =
    presentation.useHeroPalette === false && colorMode === 'dark'
      ? elementStyles.ctaLabel.colorDark || elementStyles.ctaLabel.color
      : elementStyles.ctaLabel?.color;
  const ctaChrome = contactCtaStyle(presentation.ctaDesign, presentation.ctaColor, {
    ink: presentation.titleColor,
    label: ctaLabelColor,
  });
  const ctaTextStyle = {
    ...ctaChrome,
    ...elementTextInlineStyle(elementStyles.ctaLabel, colorMode),
    // Keep chrome fill/border; outline text must stay on ink (not neutre).
    backgroundColor: ctaChrome.backgroundColor,
    borderColor: ctaChrome.borderColor,
    color:
      presentation.ctaDesign === 'pill-outline'
        ? ctaChrome.color
        : (ctaLabelColor ?? ctaChrome.color),
  };
  const split = contentLayout === 'split';
  const chromeVars = contactChromeCssVars(presentation);
  const formChannelsMeta = {
    email: visibleEmail,
    phone: visiblePhone,
    locationLabel: visibleLocation,
    responseTimeLabel: responseTimeLabel ?? null,
  };

  const contactFormNode = (
    <ContactMessageForm
      creatorId={creatorId ?? ''}
      presentation={presentation}
      formDesign={formDesign}
      channelsMeta={formChannelsMeta}
    />
  );

  const resolvedTitle = sectionTitle ?? 'Contact';
  const resolvedSubtitle =
    sectionSubtitle ?? (
      <>
        Should you have a project in mind, I would be pleased to hear from you
        {responseTimeLabel?.trim() && presentation.showResponseTimeInSubtitle
          ? ` — I typically reply ${responseTimeLabel.toLowerCase()}.`
          : ' to discuss your objectives.'}
      </>
    );
  const withContactIllustration = (content: React.ReactNode) => {
    if (presentation.illustrationVariant === 'none') return content;
    const illustration = <FaqSectionIllustration variant={presentation.illustrationVariant} />;
    return (
      <div
        className={`grid w-full min-w-0 gap-8 lg:items-center ${
          presentation.illustrationPlacement === 'left'
            ? 'lg:grid-cols-[minmax(12rem,0.32fr)_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(0,1fr)_minmax(12rem,0.32fr)]'
        }`}
        style={
          {
            '--faq-accent': presentation.ctaColor,
            '--faq-ink': presentation.titleColor,
            '--faq-surface': presentation.cardBackgroundColor,
          } as CSSProperties
        }
      >
        {presentation.illustrationPlacement === 'left' ? (
          <>
            {illustration}
            <div className="min-w-0">{content}</div>
          </>
        ) : (
          <>
            <div className="min-w-0">{content}</div>
            {illustration}
          </>
        )}
      </div>
    );
  };

  if (isInquiry) {
    const inquiryTitleClass =
      titleTypographyClass ??
      'text-3xl font-bold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-4xl lg:text-[2.75rem]';
    const inquirySubtitleClass =
      subtitleTypographyClass ??
      'mt-4 max-w-md text-base leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-lg';

    const inquiryBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-stretch gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex min-h-full min-w-0 flex-col items-center justify-center text-center">
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--contact-accent, #ea580c)' }}
            >
              Contact
            </p>
            <h2 className={`mt-3 ${inquiryTitleClass}`} style={titleTypographyStyle}>
              {resolvedTitle}
            </h2>
            <div className={`${inquirySubtitleClass} mx-auto`} style={subtitleTypographyStyle}>
              {resolvedSubtitle}
            </div>
            <ContactInquiryIllustration className="mt-8 sm:mt-10" />
          </div>

          <div className="flex min-h-full min-w-0 w-full flex-col">
            <PortfolioMotionItem profile={motionProfile} index={0} className="flex min-h-0 flex-1 flex-col">
              <div
                className={`${contactInquiryFormCardClass(presentation)} flex h-full min-h-full w-full flex-1 flex-col`}
                style={contactFormFrameStyle(presentation)}
              >
                {contactFormNode}
              </div>
            </PortfolioMotionItem>
            {presentation.showCta ? (
              <div className="mt-5 flex justify-center">
                <PortfolioMotionItem profile={motionProfile} index={1}>
                  <a
                    href={ctaHref}
                    {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                      ? { target: '_blank', rel: 'noreferrer' }
                      : {})}
                    className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                    style={ctaTextStyle}
                  >
                    {resolvedCtaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </PortfolioMotionItem>
              </div>
            ) : null}
            {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
          </div>
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(inquiryBody)}
      </section>
    );
  }

  if (isInquiryPanel) {
    const fallbackTitle =
      typeof resolvedTitle === 'string' ? resolvedTitle : 'Contact us';
    const fallbackSupporting =
      typeof sectionSubtitle === 'string'
        ? sectionSubtitle
        : 'Share a short brief about your goals. I will get back to you with next steps.';
    const inquiryHeadline = resolveContactInquiryHeadline(presentation, fallbackTitle);
    const inquirySupporting = resolveContactInquirySupporting(
      presentation,
      fallbackSupporting
    );
    const inquiryTitleClass =
      titleTypographyClass ??
      'text-3xl font-semibold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]';
    const inquirySubtitleClass =
      subtitleTypographyClass ??
      'mt-4 max-w-md text-base leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-[1.05rem]';

    const inquiryPanelChannels: Array<{
      key: string;
      href: string;
      value: string;
      kind: 'email' | 'phone' | 'location';
      external?: boolean;
    }> = [];
    if (visibleEmail?.trim()) {
      inquiryPanelChannels.push({
        key: 'email',
        href: `mailto:${visibleEmail.trim()}`,
        value: visibleEmail.trim(),
        kind: 'email',
      });
    }
    if (visiblePhone?.trim()) {
      inquiryPanelChannels.push({
        key: 'phone',
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        value: formatPhoneDisplay(visiblePhone.trim()),
        kind: 'phone',
      });
    }
    if (visibleLocation?.trim()) {
      inquiryPanelChannels.push({
        key: 'location',
        href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
        value: visibleLocation.trim(),
        kind: 'location',
        external: true,
      });
    }

    const inquiryPanelBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex min-w-0 flex-col">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--contact-accent, #ea580c)' }}
            >
              Contact
            </p>
            <h2 className={`mt-3 ${inquiryTitleClass}`} style={titleTypographyStyle}>
              {inquiryHeadline}
            </h2>
            <p className={inquirySubtitleClass} style={subtitleTypographyStyle}>
              {inquirySupporting}
            </p>

            {inquiryPanelChannels.length > 0 ? (
              <div className="mt-8 flex w-full max-w-lg flex-col gap-3">
                {inquiryPanelChannels.map((channel) => (
                  <a
                    key={channel.key}
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className={contactInquiryChannelCardClass()}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center bg-transparent"
                      style={{
                        color: 'var(--contact-accent, #ea580c)',
                      }}
                    >
                      <ContactChannelGlyph kind={channel.kind} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 truncate text-[0.95rem] font-semibold leading-snug text-[color:var(--contact-ink,#0a0a0a)] sm:text-base">
                      {channel.value}
                    </span>
                  </a>
                ))}
              </div>
            ) : null}

            {visibleLinks.length > 0 ? (
              <nav
                className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
                aria-label="Social links"
              >
                {visibleLinks.map((link, index) => {
                  const platform = inferContactLinkPlatform(link);
                  const iconNode = platform ? (
                    renderSocialIcon?.(platform, 'h-5 w-5 sm:h-6 sm:w-6') ?? (
                      <SocialPlatformIcon platform={platform} className="h-5 w-5 sm:h-6 sm:w-6" />
                    )
                  ) : (
                    <svg
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  );
                  return (
                    <Fragment key={link.id}>
                      {index > 0 ? (
                        <span
                          aria-hidden
                          className="hidden h-5 w-px bg-[color:var(--contact-border,#e5e5e5)] sm:block"
                        />
                      ) : null}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2.5 text-base font-semibold text-[color:var(--contact-ink,#0a0a0a)] transition hover:text-[color:var(--contact-accent,#ea580c)] sm:text-lg"
                      >
                        <span
                          className="inline-flex items-center justify-center"
                          style={{ color: 'var(--contact-accent, #ea580c)' }}
                        >
                          {iconNode}
                        </span>
                        {contactSocialNetworkLabel(link)}
                      </a>
                    </Fragment>
                  );
                })}
              </nav>
            ) : null}
          </div>

          <div className="relative min-w-0 w-full">
            <PortfolioMotionItem profile={motionProfile} index={0}>
              <div className="relative isolate">
                <div className={contactInquiryAccentBlockClass(presentation)} aria-hidden />
                <div
                  className={`${contactInquiryFormCardClass(presentation)} relative z-[1] flex h-full w-full flex-col`}
                  style={contactFormFrameStyle(presentation)}
                >
                  {contactFormNode}
                </div>
              </div>
            </PortfolioMotionItem>
            {membersOnlyNode ? <div className="relative z-[1] mt-4">{membersOnlyNode}</div> : null}
          </div>
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(inquiryPanelBody)}
      </section>
    );
  }

  if (isDesk) {
    const deskChannels: {
      key: string;
      label: string;
      value: string;
      href?: string;
      kind: 'email' | 'phone' | 'location';
    }[] = [];
    if (visibleLocation?.trim()) {
      deskChannels.push({
        key: 'location',
        label: 'Location',
        value: visibleLocation.trim(),
        kind: 'location',
      });
    }
    if (visiblePhone?.trim()) {
      deskChannels.push({
        key: 'phone',
        label: 'Phone',
        value: formatPhoneDisplay(visiblePhone.trim()),
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        kind: 'phone',
      });
    }
    if (visibleEmail?.trim()) {
      deskChannels.push({
        key: 'email',
        label: 'Email',
        value: visibleEmail.trim(),
        href: `mailto:${visibleEmail.trim()}`,
        kind: 'email',
      });
    }

    const deskChannelGrid =
      deskChannels.length >= 3
        ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
        : deskChannels.length === 2
          ? 'grid gap-3 sm:grid-cols-2'
          : 'grid gap-3 sm:grid-cols-1 max-w-xl';

    const deskHeader = (
      <EditorialSectionStickyHeader
        title={resolvedTitle}
        subtitle={resolvedSubtitle}
        subtitleSerif={presentation.subtitleSerif}
        editorialLayout={editorialLayout}
        centered
        alignRight={false}
        alwaysCentered
        className="relative z-[1] mb-8 w-full lg:mb-10"
        titleTypographyClass={titleTypographyClass}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
        customTitleSizing={customTitleSizing}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customSubtitleSizing={customSubtitleSizing}
        orientation={orientation}
        scrollBehavior="static"
      />
    );

    const deskBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div
          className={`w-full ${contactDeskMaxWidthClass(presentation.cardMaxWidth)} ${contactCardPlacementClass(
            presentation.cardPlacement
          )}`}
        >
          {deskHeader}
          {deskChannels.length > 0 ? (
            <div className={`${deskChannelGrid} mb-4 sm:mb-5`}>
              {deskChannels.map((channel) => {
                const inner = (
                  <>
                    <span
                      className={contactIconShellClass(presentation)}
                      style={{
                        ...contactIconShellStyle(presentation),
                        ...(presentation.iconBorder !== 'none'
                          ? {
                              borderColor:
                                presentation.iconBorderColor ||
                                presentation.cardBorderColor ||
                                'color-mix(in srgb, var(--contact-border, #a3a3a3) 55%, transparent)',
                            }
                          : null),
                      }}
                    >
                      <ContactChannelGlyph
                        kind={channel.kind}
                        className={contactIconGlyphClass(presentation.iconSize ?? 'md')}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--contact-muted,#737373)]">
                        {channel.label}
                      </span>
                      <span className="mt-1 block truncate text-sm font-semibold text-[color:var(--contact-ink,#0a0a0a)] sm:text-[0.95rem]">
                        {channel.value}
                      </span>
                    </span>
                  </>
                );
                return channel.href ? (
                  <a
                    key={channel.key}
                    href={channel.href}
                    className={`${contactDeskChannelCardClass()} transition hover:border-[color:var(--contact-accent,#ea580c)]`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={channel.key} className={contactDeskChannelCardClass()}>
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : null}

          <PortfolioMotionItem profile={motionProfile} index={0}>
            <div
              className={`${contactDeskFormPanelClass(presentation)} flex w-full flex-col`}
              style={contactFormFrameStyle(presentation)}
            >
              {contactFormNode}
            </div>
          </PortfolioMotionItem>
          {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(deskBody)}
      </section>
    );
  }

  if (isInfoPanel) {
    const fallbackHeadline =
      typeof resolvedTitle === 'string' ? resolvedTitle : 'Contact Information';
    const fallbackSupporting =
      typeof sectionSubtitle === 'string'
        ? sectionSubtitle
        : 'Reach out with a short brief — I typically reply within one business day.';
    const infoHeadline = resolveContactInfoPanelHeadline(presentation, fallbackHeadline);
    const infoSupporting = resolveContactInfoPanelSupporting(
      presentation,
      fallbackSupporting
    );
    const infoTitleClass =
      titleTypographyClass ??
      'text-2xl font-bold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-3xl lg:text-[2rem]';
    const infoSubtitleClass =
      subtitleTypographyClass ??
      'mt-3 max-w-md text-sm leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-base';

    const infoChannels: {
      key: string;
      value: string;
      href?: string;
      kind: 'email' | 'phone' | 'location';
    }[] = [];
    if (visibleLocation?.trim()) {
      infoChannels.push({
        key: 'location',
        value: visibleLocation.trim(),
        kind: 'location',
      });
    }
    if (visiblePhone?.trim()) {
      infoChannels.push({
        key: 'phone',
        value: formatPhoneDisplay(visiblePhone.trim()),
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        kind: 'phone',
      });
    }
    if (visibleEmail?.trim()) {
      infoChannels.push({
        key: 'email',
        value: visibleEmail.trim(),
        href: `mailto:${visibleEmail.trim()}`,
        kind: 'email',
      });
    }

    const infoPanelBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div
          className={`w-full ${contactDeskMaxWidthClass(presentation.cardMaxWidth)} ${contactCardPlacementClass(
            presentation.cardPlacement
          )}`}
        >
          <PortfolioMotionItem profile={motionProfile} index={0}>
            <div
              className={contactInfoPanelShellClass(presentation)}
              style={contactInfoPanelShellStyle(presentation)}
            >
              <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-12">
                <div className="flex min-w-0 flex-col justify-center py-2 lg:py-4 lg:pr-2">
                  <h2 className={infoTitleClass} style={titleTypographyStyle}>
                    {infoHeadline}
                  </h2>
                  <p className={infoSubtitleClass} style={subtitleTypographyStyle}>
                    {infoSupporting}
                  </p>

                  {infoChannels.length > 0 ? (
                    <ul className="mt-9 flex flex-col gap-5">
                      {infoChannels.map((channel) => {
                        const row = (
                          <>
                            <span
                              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                              style={{
                                backgroundColor: 'var(--contact-accent, #ea580c)',
                              }}
                            >
                              <ContactChannelGlyph kind={channel.kind} className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 break-words text-[0.95rem] font-semibold leading-snug text-[color:var(--contact-ink,#0a0a0a)] sm:text-base">
                              {channel.value}
                            </span>
                          </>
                        );
                        return (
                          <li key={channel.key}>
                            {channel.href ? (
                              <a
                                href={channel.href}
                                className="flex items-center gap-4 transition hover:opacity-80"
                              >
                                {row}
                              </a>
                            ) : (
                              <div className="flex items-center gap-4">{row}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>

                <div
                  className={contactInfoPanelFormCardClass(presentation)}
                  style={contactInfoPanelFormCardStyle(presentation)}
                >
                  {contactFormNode}
                </div>
              </div>
            </div>
          </PortfolioMotionItem>
          {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(infoPanelBody)}
      </section>
    );
  }

  if (isChannelCards) {
    const hubTitleClass =
      titleTypographyClass ??
      'text-3xl font-bold tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] sm:text-4xl lg:text-[2.65rem]';
    const hubSubtitleClass =
      subtitleTypographyClass ??
      'mt-3 max-w-xl text-base leading-relaxed text-[color:var(--contact-muted,#737373)] sm:text-lg';

    const hubChannels: Array<{
      key: string;
      href: string;
      kind: 'phone' | 'email' | 'location';
      title: string;
      lines: string[];
      external?: boolean;
    }> = [];
    if (visiblePhone?.trim()) {
      hubChannels.push({
        key: 'phone',
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
        kind: 'phone',
        title: 'Phone',
        lines: [formatPhoneDisplay(visiblePhone.trim())],
      });
    }
    if (visibleEmail?.trim()) {
      hubChannels.push({
        key: 'email',
        href: `mailto:${visibleEmail.trim()}`,
        kind: 'email',
        title: 'Email',
        lines: [visibleEmail.trim()],
      });
    }
    if (visibleLocation?.trim()) {
      const parts = visibleLocation
        .split(/[\n,]/)
        .map((part) => part.trim())
        .filter(Boolean);
      hubChannels.push({
        key: 'location',
        href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
        kind: 'location',
        title: 'Address',
        lines: [parts.length >= 2 ? parts.join(' / ') : visibleLocation.trim()],
        external: true,
      });
    }

    const channelCardsBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <p
            className="text-sm font-bold uppercase tracking-[0.2em] sm:text-[0.9375rem]"
            style={{ color: 'var(--contact-accent, #ea580c)' }}
          >
            Contact
          </p>
          <h2 className={`mt-3 ${hubTitleClass}`} style={titleTypographyStyle}>
            {resolvedTitle}
          </h2>
          <div className={`${hubSubtitleClass} mx-auto`} style={subtitleTypographyStyle}>
            {resolvedSubtitle}
          </div>

          {hubChannels.length > 0 ? (
            <div
              className={`mt-10 grid w-full gap-5 sm:mt-12 sm:gap-6 ${
                hubChannels.length === 1
                  ? 'max-w-md'
                  : hubChannels.length === 2
                    ? 'max-w-3xl sm:grid-cols-2'
                    : 'sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {hubChannels.map((channel, index) => (
                <PortfolioMotionItem key={channel.key} profile={motionProfile} index={index}>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className={contactChannelCardsCardClass(presentation)}
                    style={contactChannelCardsCardStyle(presentation)}
                  >
                    <span className={contactChannelCardsIconClass()}>
                      <ContactChannelGlyph kind={channel.kind} className="h-7 w-7" />
                    </span>
                    <p className="mt-5 text-lg font-semibold text-[color:var(--contact-ink,#0a0a0a)]">
                      {channel.title}
                    </p>
                    <div className="mt-2 space-y-0.5 text-sm leading-relaxed text-[color:var(--contact-muted,#737373)]">
                      {channel.lines.map((line) => (
                        <p key={line} className="break-words">
                          {line}
                        </p>
                      ))}
                    </div>
                  </a>
                </PortfolioMotionItem>
              ))}
            </div>
          ) : null}

          {showContactForm ? (
            <div className="mt-10 w-full max-w-3xl sm:mt-12">
              <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
            </div>
          ) : null}

          {presentation.showCta ? (
            <div className="mt-8 flex justify-center">
              <PortfolioMotionItem profile={motionProfile} index={hubChannels.length + 1}>
                <a
                  href={ctaHref}
                  {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                  className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                  style={ctaTextStyle}
                >
                  {resolvedCtaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </PortfolioMotionItem>
            </div>
          ) : null}
          {membersOnlyNode ? <div className="mt-4">{membersOnlyNode}</div> : null}
        </div>
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {withContactIllustration(channelCardsBody)}
      </section>
    );
  }

  // Swiss editorial — ivory frame, serif headline + form, contact band, follow footer.
  if (isSwissEditorial) {
    const swissTitle =
      typeof resolvedTitle === 'string' && resolvedTitle.trim()
        ? resolvedTitle.trim()
        : DEFAULT_CONTACT_SWISS_TITLE;
    const swissSubtitle =
      typeof sectionSubtitle === 'string' && sectionSubtitle.trim()
        ? sectionSubtitle.trim()
        : DEFAULT_CONTACT_SWISS_SUBTITLE;
    const swissAccent = presentation.ctaColor?.trim() || DEFAULT_CONTACT_SWISS_COBALT;

    const swissChannels: Array<{
      key: string;
      label: string;
      value: string;
      href: string | null;
    }> = [];
    if (visibleEmail?.trim()) {
      swissChannels.push({
        key: 'email',
        label: 'EMAIL',
        value: visibleEmail.trim(),
        href: `mailto:${visibleEmail.trim()}`,
      });
    }
    if (visiblePhone?.trim()) {
      swissChannels.push({
        key: 'phone',
        label: 'PHONE',
        value: formatPhoneDisplay(visiblePhone.trim()),
        href: `tel:${visiblePhone.replace(/\s+/g, '')}`,
      });
    }
    if (visibleLocation?.trim()) {
      swissChannels.push({
        key: 'location',
        label: 'LOCATION',
        value: visibleLocation.trim(),
        href: `https://maps.google.com/?q=${encodeURIComponent(visibleLocation.trim())}`,
      });
    }

    const swissSocials = visibleLinks.map((link) => ({
      id: link.id,
      label: contactSocialNetworkLabel(link),
      url: link.url,
    }));

    const swissForm = (
      <ContactMessageForm
        creatorId={creatorId ?? ''}
        presentation={{ ...presentation, formDesign: 'swiss-editorial' }}
        formDesign="swiss-editorial"
        channelsMeta={formChannelsMeta}
      />
    );

    const swissBody = (
      <div className="relative z-[1] w-full">
        <div
          className={contactSwissEditorialFrameClass()}
          style={contactSwissEditorialFrameStyle({
            ctaColor: swissAccent,
            cardBackgroundEnabled: false,
            titleColor: presentation.titleColor,
            subtitleColor: presentation.subtitleColor,
            cardBorderColor: presentation.cardBorderColor,
          })}
        >
          <div className="grid gap-10 py-8 sm:py-10 md:grid-cols-2 md:items-stretch md:gap-10 md:py-12 xl:gap-14">
            <div className="flex min-w-0 gap-6 sm:gap-8 md:h-full">
              <span
                className="w-0.5 shrink-0 self-stretch min-h-[4.5rem] md:min-h-0"
                style={{ backgroundColor: 'var(--contact-swiss-accent, #1E4FD6)' }}
                aria-hidden
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pl-1 sm:pl-2 md:py-0">
                <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                  CONTACT
                </p>
                <h2
                  className="mt-4 text-[66px] font-normal leading-[1.05] tracking-[-0.03em] text-[color:var(--contact-ink,#0a0a0a)] md:mt-5 md:text-[110px] md:leading-[1.02]"
                  style={{ fontFamily: SERIF }}
                >
                  {swissTitle}
                </h2>
                <p className="mt-4 max-w-[520px] text-[18px] leading-relaxed text-[color:var(--contact-muted,#737373)] md:mt-5">
                  {swissSubtitle}
                </p>
              </div>
            </div>

            <div className="min-w-0 w-full">{swissForm}</div>
          </div>

          {swissChannels.length > 0 ? (
            <div className="border-t border-[color:var(--contact-border,#e5e5e5)] px-5 sm:px-8 lg:px-10">
              <div className="flex flex-col gap-6 py-6 md:grid md:grid-cols-3 md:gap-0 md:divide-x md:divide-[color:var(--contact-border,#e5e5e5)] md:py-0">
                {swissChannels.map((channel) => {
                  const valueNode = (
                    <span
                      className="mt-2 block break-words text-[19px] font-semibold leading-snug text-[color:var(--contact-ink,#0a0a0a)] underline decoration-[color:var(--contact-border,#d4d4d4)] underline-offset-4"
                      style={{ fontFamily: SERIF }}
                    >
                      {channel.value}
                    </span>
                  );
                  return (
                    <div key={channel.key} className="min-w-0 md:px-6 md:py-7 first:md:pl-0 last:md:pr-0">
                      <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-muted,#737373)]">
                        {channel.label}
                      </p>
                      {channel.href ? (
                        <a
                          href={channel.href}
                          {...(channel.key === 'location'
                            ? { target: '_blank', rel: 'noreferrer' }
                            : {})}
                          className="transition hover:opacity-70"
                        >
                          {valueNode}
                        </a>
                      ) : (
                        valueNode
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="border-t border-[color:var(--contact-border,#e5e5e5)] px-5 sm:px-8 lg:px-10">
            <div className="hidden py-6 md:grid md:grid-cols-3 md:items-center md:gap-6">
              <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                FOLLOW ME
              </p>
              {swissSocials.length > 0 ? (
                <nav
                  className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-[19px] font-semibold text-[color:var(--contact-ink,#0a0a0a)]"
                  aria-label="Social links"
                >
                  {swissSocials.map((link, index) => (
                    <Fragment key={link.id}>
                      {index > 0 ? (
                        <span className="px-1.5 text-[color:var(--contact-muted,#a3a3a3)]">/</span>
                      ) : null}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[color:var(--contact-border,#d4d4d4)] underline-offset-4 transition hover:opacity-70"
                      >
                        {link.label}
                      </a>
                    </Fragment>
                  ))}
                </nav>
              ) : (
                <span className="text-center text-[19px] font-semibold text-[color:var(--contact-muted,#a3a3a3)]">—</span>
              )}
              <p className="text-right text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                {DEFAULT_CONTACT_SWISS_AVAILABILITY}
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 py-5 text-center md:hidden">
              <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                FOLLOW ME
              </p>
              {swissSocials.length > 0 ? (
                <nav
                  className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-[19px] font-semibold text-[color:var(--contact-ink,#0a0a0a)]"
                  aria-label="Social links"
                >
                  {swissSocials.map((link, index) => (
                    <Fragment key={link.id}>
                      {index > 0 ? (
                        <span className="px-1.5 text-[color:var(--contact-muted,#a3a3a3)]">/</span>
                      ) : null}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[color:var(--contact-border,#d4d4d4)] underline-offset-4 transition hover:opacity-70"
                      >
                        {link.label}
                      </a>
                    </Fragment>
                  ))}
                </nav>
              ) : null}
            </div>
            <div className="border-t border-[color:var(--contact-border,#e5e5e5)] py-4 text-center md:hidden">
              <p className="text-[14px] font-bold uppercase tracking-[0.16em] text-[color:var(--contact-ink,#0a0a0a)]">
                {DEFAULT_CONTACT_SWISS_AVAILABILITY}
              </p>
            </div>
          </div>
        </div>
        {membersOnlyNode ? <div className="mt-6 flex justify-center">{membersOnlyNode}</div> : null}
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {swissBody}
      </section>
    );
  }

  // Editorial — title lives in the left column so the form aligns to the top
  // and both columns stretch to roughly equal height.
  if (presentation.cardDesign === 'editorial') {
    const editorialListCard = hasContactList ? (
      <ContactCardShell presentation={presentation}>
        <ContactUnifiedList
          presentation={presentation}
          visibleEmail={visibleEmail}
          visiblePhone={visiblePhone}
          visibleLocation={visibleLocation}
          links={visibleLinks}
          includeLinks
          renderSocialIcon={renderSocialIcon}
          socialBrandClass={socialBrandClass}
          elementStyles={elementStyles}
        />
      </ContactCardShell>
    ) : null;

    const editorialHeader = (
      <EditorialSectionStickyHeader
        title={resolvedTitle}
        subtitle={resolvedSubtitle}
        subtitleSerif={presentation.subtitleSerif}
        editorialLayout={editorialLayout}
        centered={false}
        alignRight={false}
        alwaysCentered={false}
        className="relative z-[1] mb-8 w-full lg:mb-10"
        titleTypographyClass={titleTypographyClass}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
        customTitleSizing={customTitleSizing}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customSubtitleSizing={customSubtitleSizing}
        orientation={orientation}
        scrollBehavior="static"
      />
    );

    const editorialBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="flex min-w-0 flex-col">
            {editorialHeader}
            {editorialListCard}
          </div>

          <div className="flex min-h-full min-w-0 flex-col">
            {showContactForm ? (
              <PortfolioMotionItem
                profile={motionProfile}
                index={0}
                className="flex min-h-full flex-1 flex-col"
              >
                <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
              </PortfolioMotionItem>
            ) : null}
          </div>
        </div>

        {presentation.showCta ? (
          <div
            className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
              presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
            }`}
          >
            <PortfolioMotionItem profile={motionProfile} index={1}>
              <a
                href={ctaHref}
                {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                style={ctaTextStyle}
              >
                {resolvedCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </PortfolioMotionItem>
            {membersOnlyNode}
          </div>
        ) : membersOnlyNode ? (
          <div className="mt-6 flex justify-center">{membersOnlyNode}</div>
        ) : null}
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {split ? (
          <>
            <div className="relative z-[1]">
              <PortfolioSplitScreenTitle>{editorialHeader}</PortfolioSplitScreenTitle>
            </div>
            <div className="relative z-[1] w-full" style={chromeVars}>
              <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
                <div className="min-w-0">{editorialListCard}</div>
                <div className="flex min-h-full min-w-0 flex-col">
                  {showContactForm ? (
                    <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          withContactIllustration(editorialBody)
        )}
      </section>
    );
  }

  // Directory — two columns: centered title + large socials left, form right.
  if (presentation.cardDesign === 'directory') {
    const directorySocials =
      visibleLinks.length > 0 ? (
        <ContactDirectorySocialIcons
          links={visibleLinks}
          presentation={presentation}
          renderSocialIcon={renderSocialIcon}
          socialBrandClass={socialBrandClass}
          enlarged
        />
      ) : null;

    const directoryHeader = (
      <EditorialSectionStickyHeader
        title={resolvedTitle}
        subtitle={resolvedSubtitle}
        subtitleSerif={presentation.subtitleSerif}
        editorialLayout={editorialLayout}
        centered
        alignRight={false}
        alwaysCentered
        className="relative z-[1] mb-0 w-full"
        titleTypographyClass={titleTypographyClass}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
        customTitleSizing={customTitleSizing}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customSubtitleSizing={customSubtitleSizing}
        orientation={orientation}
        scrollBehavior="static"
      />
    );

    const directoryBody = (
      <div className="relative z-[1] w-full" style={chromeVars}>
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <div className="flex min-h-full min-w-0 flex-col items-center justify-center text-center">
            {directoryHeader}
            {directorySocials ? <div className="mt-10 w-full sm:mt-12">{directorySocials}</div> : null}
          </div>

          <div className="flex min-h-full min-w-0 flex-col">
            {showContactForm ? (
              <PortfolioMotionItem
                profile={motionProfile}
                index={0}
                className="flex min-h-full flex-1 flex-col"
              >
                <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
              </PortfolioMotionItem>
            ) : null}
          </div>
        </div>

        {presentation.showCta ? (
          <div
            className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
              presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
            }`}
          >
            <PortfolioMotionItem profile={motionProfile} index={1}>
              <a
                href={ctaHref}
                {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
                style={ctaTextStyle}
              >
                {resolvedCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </PortfolioMotionItem>
            {membersOnlyNode}
          </div>
        ) : membersOnlyNode ? (
          <div className="mt-6 flex justify-center">{membersOnlyNode}</div>
        ) : null}
      </div>
    );

    return (
      <section
        id="contact"
        style={topSpacingStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
          bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
        }`}
      >
        {bgStyle ? (
          <>
            {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
              />
            ) : null}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
              style={bgStyle}
            />
          </>
        ) : null}
        {split ? (
          <>
            <div className="relative z-[1]">
              <PortfolioSplitScreenTitle>{directoryHeader}</PortfolioSplitScreenTitle>
            </div>
            <div className="relative z-[1] w-full" style={chromeVars}>
              {directorySocials ? (
                <div className="mb-10 flex justify-center">{directorySocials}</div>
              ) : null}
              <div className="grid w-full items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
                <div className="min-w-0" />
                <div className="flex min-h-full min-w-0 flex-col">
                  {showContactForm ? (
                    <ContactFormShell presentation={presentation}>{contactFormNode}</ContactFormShell>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : (
          withContactIllustration(directoryBody)
        )}
      </section>
    );
  }

  const contactAside =
    !split &&
    (presentation.sectionLayout === 'aside-left' ||
      presentation.sectionLayout === 'aside-right');
  const header = (
    <EditorialSectionStickyHeader
      title={resolvedTitle}
      subtitle={resolvedSubtitle}
      subtitleSerif={presentation.subtitleSerif}
      editorialLayout={editorialLayout}
      centered={centered}
      alignRight={alignRight}
      alwaysCentered={alwaysCentered}
      className={`relative z-[1] ${
        split || contactAside ? 'mb-0 w-full' : 'mb-10 lg:mb-12'
      }`}
      titleTypographyClass={titleTypographyClass}
      titleTypographyStyle={titleTypographyStyle}
      titleDecorationStyle={titleDecorationStyle}
      titleChromeClass={titleChromeClass}
      titleChromeStyle={titleChromeStyle}
      customTitleSizing={customTitleSizing}
      subtitleTypographyClass={subtitleTypographyClass}
      subtitleTypographyStyle={subtitleTypographyStyle}
      subtitleDecorationStyle={subtitleDecorationStyle}
      customSubtitleSizing={customSubtitleSizing}
      orientation={orientation}
      scrollBehavior={scrollBehavior}
    />
  );

  const contactListCard = hasContactList ? (
    <ContactCardShell presentation={presentation}>
      <ContactUnifiedList
        presentation={presentation}
        visibleEmail={visibleEmail}
        visiblePhone={visiblePhone}
        visibleLocation={visibleLocation}
        links={visibleLinks}
        includeLinks
        renderSocialIcon={renderSocialIcon}
        socialBrandClass={socialBrandClass}
        elementStyles={elementStyles}
      />
    </ContactCardShell>
  ) : null;

  const contactFormCard = showContactForm ? (
    <ContactFormShell presentation={presentation}>
      {contactFormNode}
    </ContactFormShell>
  ) : null;

  const hasListOrSocials = Boolean(contactListCard);
  const stackVertically =
    showContactForm && hasListOrSocials && contactFormPlacement === 'below';

  const contactBodyLayoutClass = stackVertically
    ? `flex flex-col ${contactFormStackGapClass(presentation.formStackGap ?? 'lg')}`
    : showContactForm && hasListOrSocials && contactFormPlacement === 'side'
      ? 'grid gap-6 lg:grid-cols-2'
      : 'flex flex-col gap-6';
  const contactBodyMaxWidth =
    showContactForm && hasListOrSocials && contactFormPlacement === 'side'
      ? 'full'
      : presentation.cardMaxWidth;

  const listBlock = contactListCard ? (
    <div className="flex w-full flex-col gap-6">{contactListCard}</div>
  ) : null;

  const body = (
    <div className="relative z-[1]">
      {(hasListOrSocials || showContactForm) && (
        <div
          className={`w-full ${contactCardMaxWidthClass(contactBodyMaxWidth)} ${contactCardPlacementClass(
            presentation.cardPlacement
          )}`}
        >
          <PortfolioMotionItem profile={motionProfile} index={0}>
            <div className={contactBodyLayoutClass}>
              {listBlock}
              {contactFormCard}
            </div>
          </PortfolioMotionItem>
        </div>
      )}

      {presentation.showCta ? (
        <div
          className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
            presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
          }`}
        >
          <PortfolioMotionItem profile={motionProfile} index={hasListOrSocials || showContactForm ? 1 : 0}>
            <a
              href={ctaHref}
              {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                ? { target: '_blank', rel: 'noreferrer' }
                : {})}
              className={`${contactCtaClassName(presentation.ctaDesign)} ${ctaTextClass}`.trim()}
              style={ctaTextStyle}
            >
              {resolvedCtaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </PortfolioMotionItem>
          {membersOnlyNode}
        </div>
      ) : null}
    </div>
  );
  const illustratedBody = withContactIllustration(body);

  return (
    <section
      id="contact"
      style={topSpacingStyle}
      className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${
        bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
      }`}
    >
      {bgStyle ? (
        <>
          {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 bg-white sm:-bottom-20"
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 z-0 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
            style={bgStyle}
          />
        </>
      ) : null}
      {split ? (
        <>
          <div className="relative z-[1]">
            <PortfolioSplitScreenTitle>{header}</PortfolioSplitScreenTitle>
          </div>
          {illustratedBody}
        </>
      ) : contactAside ? (
        <div className={contactAsideLayoutClass(presentation.sectionLayout)}>
          {presentation.sectionLayout === 'aside-right' ? (
            <>
              <div className="min-w-0">{illustratedBody}</div>
              <div className="flex min-w-0 flex-col items-center justify-center self-stretch text-center">
                {header}
              </div>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-col items-center justify-center self-stretch text-center">
                {header}
              </div>
              <div className="min-w-0">{illustratedBody}</div>
            </>
          )}
        </div>
      ) : (
        <>
          {header}
          {illustratedBody}
        </>
      )}
    </section>
  );
}

/** Thin rule between footer info blocks — vertical on lg+, horizontal when stacked. */
function FooterInfoDivider({
  enabled,
  style,
  horizontalOnly = false,
}: {
  enabled: boolean;
  style: CSSProperties;
  /** Force a full-width horizontal rule (compact / stacked sections). */
  horizontalOnly?: boolean;
}) {
  if (!enabled) return null;
  if (horizontalOnly) {
    return <span className="h-px w-full shrink-0" style={style} aria-hidden />;
  }
  return (
    <>
      <span className="h-px w-full shrink-0 lg:hidden" style={style} aria-hidden />
      <span
        className="mx-5 hidden w-px shrink-0 self-stretch lg:mx-6 lg:block xl:mx-8"
        style={style}
        aria-hidden
      />
    </>
  );
}

export function EditorialPortfolioFooter({
  creatorName,
  creatorId,
  avatarUrl,
  bio,
  whyMeText,
  email,
  phone,
  locationLabel,
  hoursLabel,
  profileVisits: _profileVisits,
  links,
  contentClassName,
  presentation = DEFAULT_FOOTER_PRESENTATION,
  transparentBase = false,
  isAvailable = true,
  responseTimeLabel = null,
  contactHref = '#footer',
  motionProfile = DEFAULT_MOTION_PROFILE,
  bottomClearanceClass,
  visibleSectionLinks,
}: {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  whyMeText?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
  profileVisits: number;
  links: EditorialContactLink[];
  contentClassName: string;
  presentation?: PortfolioFooterPresentationSettings;
  /** @deprecated Use presentation.marginTop instead. */
  stackOnContact?: boolean;
  /** Let the global page fill show through when the footer has no own background enabled. */
  transparentBase?: boolean;
  isAvailable?: boolean | null;
  responseTimeLabel?: string | null;
  contactHref?: string;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Nav safe-area padding on the footer so its background reaches the viewport bottom. */
  bottomClearanceClass?: string;
  /** Landing Links — show Gallery / About us / Team / Services / Work only when the section is on. */
  visibleSectionLinks?: Partial<Record<PortfolioFooterAutoSectionKey, boolean>>;
}) {
  const bgStyle =
    !transparentBase && presentation.sectionBackgroundEnabled
      ? sectionBackgroundStyle(presentation)
      : undefined;
  const lightBackground = isFooterBackgroundLight(presentation);
  const shellClass = footerShellClass(
    presentation.design,
    presentation.showTopBorder,
    lightBackground
  );
  const topMarginClass = footerTopMarginClass(presentation.marginTop ?? 'none');
  const topMarginStyle = footerTopMarginStyle(presentation);
  const clearanceClass =
    bottomClearanceClass ?? 'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]';
  const dividerClass = footerDividerClass(lightBackground);
  const showContentDivider = presentation.showContentDivider !== false;
  const contentDividerStyle = footerContentDividerStyle(presentation, lightBackground);
  const elementStyles = normalizeFooterElementStyles(presentation.elementStyles, presentation);
  const brandClass = elementTextStyleClass(elementStyles.brand, 'title');
  const brandStyle = elementTextInlineStyle(elementStyles.brand);
  const descriptionClass = elementTextStyleClass(elementStyles.description, 'body');
  const descriptionStyle = elementTextInlineStyle(elementStyles.description);
  const columnHeadingClass = elementTextStyleClass(elementStyles.columnHeading, 'body');
  const columnHeadingStyleBase = elementTextInlineStyle(elementStyles.columnHeading);
  const contactLineClass = elementTextStyleClass(elementStyles.contactLine, 'body');
  const contactLineStyleBase = elementTextInlineStyle(elementStyles.contactLine);
  const invertLandingColumns = presentation.design === 'landing';
  const columnHeadingStyle = invertLandingColumns
    ? { ...columnHeadingStyleBase, color: contactLineStyleBase.color }
    : columnHeadingStyleBase;
  const contactLineStyle = invertLandingColumns
    ? { ...contactLineStyleBase, color: columnHeadingStyleBase.color }
    : contactLineStyleBase;
  const landingColumnTextClass = invertLandingColumns
    ? `${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()} font-normal`
    : contactLineClass;
  const landingColumnTextStyle = invertLandingColumns
    ? { ...contactLineStyle, color: columnHeadingStyle.color, fontWeight: 400 }
    : contactLineStyle;
  const socialLabelClass = elementTextStyleClass(elementStyles.socialLabel, 'body');
  const socialLabelStyle = elementTextInlineStyle(elementStyles.socialLabel);
  const metaClass = elementTextStyleClass(elementStyles.meta, 'body');
  const metaStyle = elementTextInlineStyle(elementStyles.meta);
  const marketplaceLinkClass = elementTextStyleClass(elementStyles.marketplaceLink, 'body');
  const marketplaceLinkStyle = elementTextInlineStyle(elementStyles.marketplaceLink);
  const ctaTitleClass = elementTextStyleClass(elementStyles.ctaTitle, 'title');
  const ctaTitleStyle = elementTextInlineStyle(elementStyles.ctaTitle);
  const ctaSubtitleClass = elementTextStyleClass(elementStyles.ctaSubtitle, 'body');
  const ctaSubtitleStyle = elementTextInlineStyle(elementStyles.ctaSubtitle);
  const ctaButtonTextClass = elementTextStyleClass(elementStyles.ctaButton, 'body');
  const ctaButtonTextStyle = elementTextInlineStyle(elementStyles.ctaButton);
  const iconStyleBase = footerIconStyle(presentation.iconColor);
  const iconStyle = invertLandingColumns
    ? { ...iconStyleBase, color: landingColumnTextStyle.color }
    : iconStyleBase;
  const patternStyle = footerPatternStyle(presentation);

  const description = presentation.showDescription
    ? resolveFooterDescription({
        source: presentation.descriptionSource,
        custom: presentation.descriptionCustom,
        bio,
        whyMeText,
        maxLength: presentation.design === 'compact' ? 120 : presentation.design === 'landing' ? 280 : 220,
      })
    : null;

  const phoneDisplay = phone?.trim() ? formatPhoneDisplay(phone.trim()) : null;
  const emailValue = email?.trim() || null;
  const locationValue = locationLabel?.trim() || null;
  const hoursValue = hoursLabel?.trim() || null;

  const contactItems: { id: string; label: string; href?: string; icon: 'phone' | 'email' | 'location' | 'hours' }[] =
    [];
  if (presentation.showPhone && phoneDisplay) {
    contactItems.push({
      id: 'phone',
      label: phoneDisplay,
      href: `tel:${phone!.replace(/\s+/g, '')}`,
      icon: 'phone',
    });
  }
  if (presentation.showEmail && emailValue) {
    contactItems.push({
      id: 'email',
      label: emailValue,
      href: `mailto:${emailValue}`,
      icon: 'email',
    });
  }
  if (presentation.showLocation && locationValue) {
    contactItems.push({ id: 'location', label: locationValue, icon: 'location' });
  }
  if (presentation.showHours && hoursValue) {
    contactItems.push({ id: 'hours', label: hoursValue, icon: 'hours' });
  }

  const visibleLinks =
    presentation.design === 'centered-minimal'
      ? presentation.showContactLinks !== false
        ? links.map((link) => {
            const url = link.url.trim();
            let hostname = '';
            try {
              hostname = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
                /^www\./i,
                ''
              );
            } catch {
              hostname = '';
            }
            const rawLabel = link.label?.trim() ?? '';
            const label =
              link.type === 'WEBSITE' && /^site\s*web$/i.test(rawLabel)
                ? 'Website'
                : rawLabel || hostname || url;
            return { ...link, label };
          })
        : []
      : presentation.showContactLinks
        ? links.map((link) => {
            const url = link.url.trim();
            let hostname = '';
            try {
              hostname = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(
                /^www\./i,
                ''
              );
            } catch {
              hostname = '';
            }
            const rawLabel = link.label?.trim() ?? '';
            const label =
              link.type === 'WEBSITE' && /^site\s*web$/i.test(rawLabel)
                ? 'Website'
                : rawLabel || hostname || url;
            return { ...link, label };
          })
        : [];
  const ctaHref =
    contactHref?.trim() ||
    (emailValue ? `mailto:${emailValue}` : '#footer');
  const ctaSubtitle = resolveFooterCtaSubtitle({
    custom: presentation.ctaSubtitle,
    isAvailable,
    responseTimeLabel,
    hoursLabel,
  });

  const socialIconsLanding =
    visibleLinks.length > 0 ? (
      <nav className="flex flex-wrap gap-3" aria-label="Social">
        {visibleLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition hover:opacity-90 ${
              lightBackground
                ? 'border-black/10 bg-white hover:border-orange-500/30'
                : 'border-white/25 bg-white/10 hover:border-white/45'
            }`}
            style={iconStyle}
            title={link.label}
          >
            <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
          </a>
        ))}
      </nav>
    ) : null;

  const socialIconsRow =
    visibleLinks.length > 0 ? (
      <nav className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 xl:justify-start" aria-label="Social">
        {visibleLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="transition hover:opacity-80"
            title={link.label}
          >
            <FooterSocialLinkIcon link={link} />
          </a>
        ))}
      </nav>
    ) : null;

  const socialLinksColumn =
    visibleLinks.length > 0 ? (
      <nav className="flex flex-col gap-3.5" aria-label="Social">
        {visibleLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 transition hover:opacity-80"
          >
            <FooterSocialLinkIcon link={link} />
            <span className={`transition group-hover:opacity-80 ${socialLabelClass}`} style={socialLabelStyle}>
              {link.label}
            </span>
          </a>
        ))}
      </nav>
    ) : null;

  const showContactIcons = presentation.showContactIcons !== false;
  const contactIconSizeClass =
    presentation.design === 'landing'
      ? 'h-6 w-6'
      : footerContactIconSizeClass(presentation.contactIconSize ?? 'md');
  const contactIconSizeClassCompact = footerContactIconSizeClassCompact(
    presentation.contactIconSize ?? 'md'
  );
  // Contact CTA (minimal) always left-aligns the contact rail; editorial center may center.
  const contactLinesCentered = presentation.design === 'editorial';

  const renderFooterContactList = (
    items: typeof contactItems,
    centered = contactLinesCentered,
    options?: {
      iconAlign?: 'start' | 'center';
      lineClass?: string;
      lineStyle?: CSSProperties;
      glyphStyle?: CSSProperties;
    }
  ) => {
    const lineClass = options?.lineClass ?? landingColumnTextClass;
    const lineStyle = options?.lineStyle ?? landingColumnTextStyle;
    const glyphStyle = options?.glyphStyle ?? iconStyle;
    return items.length > 0 ? (
      <ul
        className={`space-y-5 text-left flex flex-col items-start ${
          centered ? 'mx-auto w-fit' : 'w-full'
        }`}
      >
        {items.map((item) => (
          <li key={item.id} className="flex w-full justify-start">
            {item.href ? (
              <a
                href={item.href}
                className={`flex items-center text-left transition hover:opacity-80 ${
                  showContactIcons ? 'gap-3.5' : ''
                } ${lineClass}`}
                style={lineStyle}
              >
                {showContactIcons ? (
                  <FooterContactIcon
                    type={item.icon}
                    className={`shrink-0 ${contactIconSizeClass}`}
                    style={glyphStyle}
                  />
                ) : null}
                <span className="min-w-0 text-left leading-none">{item.label}</span>
              </a>
            ) : (
              <span
                className={`flex items-center text-left ${showContactIcons ? 'gap-3.5' : ''} ${lineClass}`}
                style={lineStyle}
              >
                {showContactIcons ? (
                  <FooterContactIcon
                    type={item.icon}
                    className={`shrink-0 ${contactIconSizeClass}`}
                    style={glyphStyle}
                  />
                ) : null}
                <span className="min-w-0 text-left leading-none">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : null;
  };

  const contactStack = renderFooterContactList(
    contactItems,
    contactLinesCentered,
    invertLandingColumns
      ? {
          iconAlign: 'center',
          glyphStyle: { ...iconStyleBase, color: landingColumnTextStyle.color },
        }
      : undefined
  );

  const contactInline =
    contactItems.length > 0 ? (
      <div
        className={`flex min-w-0 flex-wrap items-center gap-x-1 gap-y-2 font-semibold ${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
        style={{ ...contactLineStyle, fontWeight: 600 }}
      >
        {contactItems.map((item, index) => (
          <span key={item.id} className="inline-flex max-w-full items-center gap-x-1">
            {index > 0 ? (
              <span className="mx-2 select-none opacity-35" aria-hidden>
                ·
              </span>
            ) : null}
            {item.href ? (
              <a
                href={item.href}
                className={`inline-flex max-w-full items-center transition hover:opacity-80 ${
                  showContactIcons ? 'gap-2.5' : ''
                }`}
              >
                {showContactIcons ? (
                  <FooterContactIcon
                    type={item.icon}
                    className={`shrink-0 ${contactIconSizeClassCompact}`}
                    style={iconStyle}
                  />
                ) : null}
                <span className="min-w-0 text-pretty break-words">{item.label}</span>
              </a>
            ) : (
              <span className={`inline-flex max-w-full items-center ${showContactIcons ? 'gap-2.5' : ''}`}>
                {showContactIcons ? (
                  <FooterContactIcon
                    type={item.icon}
                    className={`shrink-0 ${contactIconSizeClassCompact}`}
                    style={iconStyle}
                  />
                ) : null}
                <span className="min-w-0 text-pretty break-words">{item.label}</span>
              </span>
            )}
          </span>
        ))}
      </div>
    ) : null;

  const copyrightClass = `tracking-wide font-normal ${metaClass.replace(/\bfont-(?:bold|semibold|medium)\b/g, '').trim()}`;
  const copyrightStyle = { ...metaStyle, fontWeight: 400 as const };

  const copyrightLine = presentation.showCopyright ? (
    <p className={`text-pretty ${copyrightClass}`} style={copyrightStyle}>
      {resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)}
    </p>
  ) : null;

  const marketplaceHref = resolveFooterMarketplaceCtaHref(
    presentation.marketplaceCtaHref,
    creatorId
  );
  const marketplaceLabel =
    presentation.marketplaceCtaLabel?.trim() || 'Marketplace profile';
  const marketplaceDesign = presentation.marketplaceCtaDesign ?? 'pill-outline';
  const marketplaceShowArrow = presentation.marketplaceCtaShowArrow !== false;
  const marketplaceExternal =
    marketplaceHref.startsWith('http://') ||
    marketplaceHref.startsWith('https://') ||
    marketplaceHref.startsWith('mailto:');
  const marketplaceCtaChromeClass = footerMarketplaceCtaClass(marketplaceDesign);
  const marketplaceCtaChromeStyle = footerMarketplaceCtaStyle(presentation, { lightBackground });
  const marketplaceTextArrowStyle =
    marketplaceDesign === 'text-arrow'
      ? {
          ...marketplaceLinkStyle,
          color: footerReadableOnBackground(
            String(
              (marketplaceLinkStyle as { color?: string } | undefined)?.color ||
                presentation.accentColor ||
                '#fafafa'
            ),
            lightBackground
          ),
        }
      : null;
  const marketplaceCtaContent = (
    <>
      {marketplaceLabel}
      {marketplaceShowArrow ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> : null}
    </>
  );

  const marketplaceLink = (
    presentation.design === 'landing'
      ? presentation.showLandingMarketplaceLink === true
      : presentation.showMarketplaceLink
  ) ? (
    marketplaceExternal ? (
      <a
        href={marketplaceHref}
        target={marketplaceHref.startsWith('http') ? '_blank' : undefined}
        rel={marketplaceHref.startsWith('http') ? 'noreferrer' : undefined}
        className={`${marketplaceCtaChromeClass} ${
          marketplaceDesign === 'text-arrow' ? marketplaceLinkClass : ''
        }`}
        style={{
          ...marketplaceCtaChromeStyle,
          ...(marketplaceTextArrowStyle ?? {}),
        }}
      >
        {marketplaceCtaContent}
      </a>
    ) : (
      <Link
        href={marketplaceHref}
        className={`${marketplaceCtaChromeClass} ${
          marketplaceDesign === 'text-arrow' ? marketplaceLinkClass : ''
        }`}
        style={{
          ...marketplaceCtaChromeStyle,
          ...(marketplaceTextArrowStyle ?? {}),
        }}
      >
        {marketplaceCtaContent}
      </Link>
    )
  ) : null;

  /** Separated-columns: same CTA, slightly larger hit area on outline/pill. */
  const marketplaceButton = presentation.showMarketplaceLink ? (
    marketplaceExternal ? (
      <a
        href={marketplaceHref}
        target={marketplaceHref.startsWith('http') ? '_blank' : undefined}
        rel={marketplaceHref.startsWith('http') ? 'noreferrer' : undefined}
        className={marketplaceCtaChromeClass}
        style={marketplaceCtaChromeStyle}
      >
        {marketplaceLabel}
        {marketplaceShowArrow ? <ArrowUpRight className="h-4 w-4 shrink-0" /> : null}
      </a>
    ) : (
      <Link href={marketplaceHref} className={marketplaceCtaChromeClass} style={marketplaceCtaChromeStyle}>
        {marketplaceLabel}
        {marketplaceShowArrow ? <ArrowUpRight className="h-4 w-4 shrink-0" /> : null}
      </Link>
    )
  ) : null;

  const contactCtaDesign = presentation.ctaDesign ?? 'pill-outline';
  const contactCtaChromeClass = footerPresetCtaClass(contactCtaDesign);
  const contactCtaChromeStyle = footerContactCtaStyle(presentation, { lightBackground });
  const contactCtaTextArrowStyle =
    contactCtaDesign === 'text-arrow'
      ? {
          ...ctaButtonTextStyle,
          color: footerReadableOnBackground(
            String(
              (ctaButtonTextStyle as { color?: string } | undefined)?.color ||
                presentation.accentColor ||
                '#fafafa'
            ),
            lightBackground
          ),
        }
      : null;
  const contactCtaButton =
    presentation.showContactCta || presentation.design === 'minimal' ? (
    <a
      href={ctaHref}
      className={`${contactCtaChromeClass} ${ctaButtonTextClass} text-center`}
      style={{
        ...contactCtaChromeStyle,
        ...(contactCtaTextArrowStyle ?? {}),
      }}
    >
      {presentation.showCtaIcon !== false ? (
        <FooterCtaMailIcon className="h-4 w-4 shrink-0" />
      ) : null}
      {presentation.ctaButtonLabel?.trim() || 'Contact me'}
    </a>
  ) : null;
  const ctaButtonsAlignClass = footerCtaButtonsAlignClass(presentation.ctaButtonsAlign ?? 'center');
  const dualCtaRow =
    contactCtaButton || marketplaceLink ? (
      <div className={`flex flex-wrap items-center gap-3 sm:gap-3.5 ${ctaButtonsAlignClass}`}>
        {contactCtaButton}
        {marketplaceLink}
      </div>
    ) : null;
  const dualCtaRowStart =
    contactCtaButton || marketplaceLink ? (
      <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
        {contactCtaButton}
        {marketplaceLink}
      </div>
    ) : null;

  const designCredit = presentation.showDesignCredit ? (
    <p className={`tracking-wide ${metaClass}`} style={metaStyle}>
      Design by NoProblème
    </p>
  ) : null;

  const columnHeading = (label: string) => (
    <p
      className={columnHeadingClass}
      style={{ ...columnHeadingStyle, ...footerColumnHeadingGapStyle(presentation) }}
    >
      {label}
    </p>
  );

  let body: React.ReactNode;

  if (presentation.design === 'centered-minimal') {
    const centeredInitials =
      creatorName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'NP';
    const centeredIdentity = presentation.centeredIdentity ?? 'name';
    const centeredLinks = presentation.centeredLinks ?? [];
    const customLogoUrl = presentation.centeredCustomLogoUrl?.trim();
    const customText = presentation.centeredCustomText?.trim() || creatorName;

    const identity =
      centeredIdentity === 'avatar' ? (
        avatarUrl?.trim() ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`${creatorName} avatar`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-full border text-base ${brandClass}`}
            style={{ ...brandStyle, borderColor: presentation.accentColor }}
            aria-label={creatorName}
          >
            {centeredInitials}
          </span>
        )
      ) : centeredIdentity === 'custom' && customLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={customLogoUrl}
          alt={customText}
          className="max-h-16 max-w-[15rem] object-contain"
        />
      ) : (
        <p
          className={`tracking-tight font-semibold ${brandClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
          style={{ ...brandStyle, fontWeight: 600 }}
        >
          {centeredIdentity === 'custom' ? customText : creatorName}
        </p>
      );

    body = (
      <>
        <div className="flex justify-center">{identity}</div>
        {centeredLinks.length > 0 ? (
          <nav
            className="flex max-w-3xl flex-wrap items-center justify-center gap-x-7 gap-y-3 sm:gap-x-9"
            aria-label="Portfolio sections"
          >
            {centeredLinks.map((item) => {
              const href = resolveFooterLinkHref(item.href, creatorId);
              return (
                <Link
                  key={item.id}
                  href={href}
                  aria-label={`Go to ${item.label}`}
                  className={`font-semibold transition hover:opacity-70 ${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                  style={{ ...contactLineStyle, fontWeight: 600 }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
        {visibleLinks.length > 0 || contactItems.length > 0 ? (
          <nav
            className="flex flex-wrap items-center justify-center gap-2.5"
            aria-label="Social and contact links"
          >
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-transparent transition hover:opacity-70"
                style={{ ...iconStyle, borderColor: presentation.iconColor }}
              >
                <FooterSocialLinkIcon link={link} bare />
              </a>
            ))}
            {contactItems.map((item) => {
              const chipClass =
                'flex h-9 w-9 items-center justify-center rounded-full border bg-transparent transition hover:opacity-70';
              const chipStyle = { ...iconStyle, borderColor: presentation.iconColor };
              const glyph = (
                <FooterContactIcon type={item.icon} className="h-4 w-4" style={iconStyle} />
              );
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    aria-label={item.label}
                    title={item.label}
                    className={chipClass}
                    style={chipStyle}
                  >
                    {glyph}
                  </a>
                );
              }
              return (
                <span
                  key={item.id}
                  aria-label={item.label}
                  title={item.label}
                  className={chipClass}
                  style={chipStyle}
                >
                  {glyph}
                </span>
              );
            })}
          </nav>
        ) : null}
        <div
          aria-hidden
          className="mt-1 h-px w-full max-w-xl"
          style={contentDividerStyle}
        />
        <p
          className={`text-center text-pretty ${copyrightClass}`}
          style={copyrightStyle}
        >
          {resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)}
        </p>
      </>
    );
  } else if (presentation.design === 'landing') {
    const rawColumns = presentation.linkColumns ?? [];
    const linkColumns = rawColumns
      .map((col) => {
        let links = (col.links ?? []).filter((link) => link.label.trim() || link.href.trim());
        const isLinksColumn =
          col.id === 'links' || col.title.trim().toLowerCase() === 'links';
        if (presentation.showMarketplaceColumnLink === true && isLinksColumn) {
          if (!links.some((link) => isFooterMarketplaceColumnLink(link))) {
            links = [
              { id: 'marketplace', label: 'Marketplace', href: '/marketplace' },
              ...links,
            ];
          }
        } else {
          links = links.filter((link) => !isFooterMarketplaceColumnLink(link));
        }
        if (presentation.showNopbProfileLink === true && isLinksColumn) {
          if (!links.some((link) => isFooterNopbProfileLink(link))) {
            const insertAt = Math.min(
              links.some((link) => isFooterMarketplaceColumnLink(link)) ? 1 : 0,
              links.length
            );
            links = [
              ...links.slice(0, insertAt),
              { id: 'profile', label: 'NoProbleme profile', href: '__profile__' },
              ...links.slice(insertAt),
            ];
          }
        } else {
          links = links.filter((link) => !isFooterNopbProfileLink(link));
        }
        if (isLinksColumn) {
          links = resolveFooterLandingSectionLinks(links, visibleSectionLinks);
        }
        return { ...col, links };
      })
      .filter((col) => {
        // Drop empty rails (legacy Product/Creators/Legal leftovers) — no blank 4th column.
        if (col.id === 'contact') return true;
        return col.links.length > 0;
      });
    const brandInitials = creatorName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'NP';
    const year = new Date().getFullYear();
    const copyrightText = presentation.showCopyright
      ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName, year)
      : null;

    body = (
      <>
        {/*
          Content-sized columns + space-between: Links sits on the right edge
          instead of leaving a hollow equal-grid track after it.
        */}
        <div
          className={`mb-0 flex w-full flex-col md:flex-row md:items-stretch md:justify-between ${
            showContentDivider ? 'gap-8 md:gap-0' : 'gap-10 md:gap-x-8 lg:gap-x-12'
          }`}
        >
          <div
            className="flex min-w-0 max-w-sm flex-col md:max-w-md lg:max-w-lg"
            style={footerLandingBrandGapStyle(presentation)}
          >
            {presentation.showBrand ? (
              <div className="flex items-center gap-3">
                {presentation.showAvatar && avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover sm:h-12 sm:w-12"
                  />
                ) : (
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold text-white sm:h-12 sm:w-12"
                    style={{ backgroundColor: presentation.accentColor }}
                    aria-hidden
                  >
                    {brandInitials}
                  </div>
                )}
                <span
                  className={`tracking-tight font-semibold ${brandClass.replace(/\btext-(?:sm|base|lg|xl|2xl)\b/g, '').trim()}`}
                  style={{ ...brandStyle, fontWeight: 600, fontSize: '2.25rem', lineHeight: 1.15 }}
                >
                  {creatorName}
                </span>
              </div>
            ) : null}
            {description ? (
              <p
                className={`max-w-sm text-sm leading-relaxed ${descriptionClass}`}
                style={{
                  ...descriptionStyle,
                  ...(invertLandingColumns ? { color: landingColumnTextStyle.color } : null),
                }}
              >
                {description}
              </p>
            ) : null}
            {socialIconsLanding}
            {dualCtaRowStart}
          </div>

          {linkColumns.map((col) => {
            const isContactColumn = col.id === 'contact';
            return (
              <Fragment key={col.id}>
                <FooterInfoDivider enabled={showContentDivider} style={contentDividerStyle} />
                <div
                  className={`min-w-0 shrink-0 ${
                    isContactColumn ? 'md:max-w-sm lg:max-w-md' : 'md:max-w-[14rem] lg:max-w-[16rem]'
                  }`}
                >
                  {col.title.trim() ? (
                    <h4
                      className={`text-lg font-semibold ${landingColumnTextClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                      style={{
                        ...landingColumnTextStyle,
                        color: columnHeadingStyle.color,
                        fontFamily: undefined,
                        fontSize: '1.875rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: 'normal',
                        marginBottom: `${clampFooterColumnHeadingGapPx(presentation.columnHeadingGapPx) + 36}px`,
                      }}
                    >
                      {col.title.trim().charAt(0).toUpperCase() +
                        col.title.trim().slice(1).toLowerCase()}
                    </h4>
                  ) : null}
                  {isContactColumn ? (
                    contactStack ?? (
                      <p className={`text-sm ${descriptionClass}`} style={descriptionStyle}>
                        No contact details enabled.
                      </p>
                    )
                  ) : (
                    <ul className="space-y-2.5">
                      {col.links.map((link) => {
                        const href = resolveFooterLinkHref(link.href, creatorId);
                        const external = href.startsWith('http') || href.startsWith('mailto:');
                        return (
                          <li key={link.id}>
                            {external ? (
                              <a
                                href={href}
                                className={`text-sm transition hover:opacity-80 ${landingColumnTextClass}`}
                                style={landingColumnTextStyle}
                                {...(href.startsWith('http')
                                  ? { target: '_blank', rel: 'noreferrer' }
                                  : {})}
                              >
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                href={href}
                                className={`text-sm transition hover:opacity-80 ${landingColumnTextClass}`}
                                style={landingColumnTextStyle}
                              >
                                {link.label}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>

        {copyrightText ? (
          <div className={`border-t pt-5 ${dividerClass}`}>
            <p
              className={copyrightClass}
              style={copyrightStyle}
            >
              {copyrightText}
            </p>
          </div>
        ) : null}
      </>
    );
  } else if (presentation.design === 'compact') {
    // Design 2 — Compact SaaS (portfolio utility footer)
    // Hierarchy: brand block → contact → divider → meta. Socials sit with the brand
    // (not stranded on the far right). No design-credit / views noise.
    const compactCopyright = presentation.showCopyright ? (
      <p className={copyrightClass} style={copyrightStyle}>
        {resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)}
      </p>
    ) : null;
    const compactSocials =
      visibleLinks.length > 0 ? (
        <nav className="flex flex-wrap gap-3" aria-label="Social">
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border transition hover:opacity-90 ${
                lightBackground
                  ? 'border-black/8 bg-white hover:border-orange-500/30'
                  : 'border-white/10 bg-neutral-900 hover:border-orange-500/40'
              }`}
              style={iconStyle}
              title={link.label}
            >
              <FooterSocialLinkIcon link={link} bare iconClassName="h-6 w-6" />
            </a>
          ))}
        </nav>
      ) : null;

    body = (
      <>
        <div className="flex min-w-0 flex-col gap-6 sm:gap-7">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 max-w-xl space-y-3">
              {presentation.showBrand ? (
                <p
                  className={`tracking-tight font-semibold ${brandClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                  style={{ ...brandStyle, fontWeight: 600 }}
                >
                  {creatorName}
                </p>
              ) : null}
              {description ? (
                <p
                  className={`text-pretty text-sm leading-relaxed sm:text-[0.9375rem] ${descriptionClass}`}
                  style={descriptionStyle}
                >
                  {description}
                </p>
              ) : null}
            </div>
            {compactSocials ? <div className="shrink-0">{compactSocials}</div> : null}
          </div>

          {contactInline ? (
            <>
              <FooterInfoDivider
                enabled={showContentDivider}
                style={contentDividerStyle}
                horizontalOnly
              />
              <div
                className={`max-w-3xl text-sm leading-relaxed sm:text-[0.9375rem] ${
                  lightBackground ? 'text-neutral-600' : 'text-neutral-400'
                }`}
              >
                {contactInline}
              </div>
            </>
          ) : null}
        </div>

        {dualCtaRow ? <div className="pt-1">{dualCtaRow}</div> : null}

        <div
          className={`flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${dividerClass}`}
        >
          {compactCopyright}
        </div>
      </>
    );
  } else if (presentation.design === 'minimal') {
    // Design 3 — Contact CTA: name + bio + CTA | location + contact + socials
    const minimalCopyright = presentation.showCopyright ? (
      <div className={`border-t pt-5 ${dividerClass}`}>
        <p className={`text-center ${copyrightClass}`} style={copyrightStyle}>
          {resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)}
        </p>
      </div>
    ) : null;

    const ctaBio =
      description ||
      resolveFooterDescription({
        source: presentation.descriptionSource,
        custom: presentation.descriptionCustom,
        bio,
        whyMeText,
        maxLength: 220,
      });
    const ctaLocationItem = locationValue
      ? contactItems.find((item) => item.id === 'location') ?? {
          id: 'location',
          label: locationValue,
          icon: 'location' as const,
        }
      : null;
    const ctaContactColumnItems = [
      ...(ctaLocationItem ? [ctaLocationItem] : []),
      ...contactItems.filter((item) => item.id === 'phone' || item.id === 'email'),
    ];
    const ctaContactList = renderFooterContactList(ctaContactColumnItems, false, {
      iconAlign: 'center',
      lineClass: `${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()} font-semibold`,
      lineStyle: { ...contactLineStyle, fontWeight: 600 },
    });
    const ctaSocialIcons =
      visibleLinks.length > 0 ? (
        <nav className="flex flex-wrap gap-3" aria-label="Social">
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border transition hover:opacity-90 ${
                lightBackground
                  ? 'border-black/8 bg-white hover:border-orange-500/30'
                  : 'border-white/10 bg-neutral-900 hover:border-orange-500/40'
              }`}
              style={iconStyle}
              title={link.label}
            >
              <FooterSocialLinkIcon link={link} bare iconClassName="h-6 w-6" />
            </a>
          ))}
        </nav>
      ) : null;

    body = (
      <>
        <div className="flex min-w-0 flex-col gap-8 sm:gap-10">
          <div
            className={`grid w-full grid-cols-1 lg:grid-cols-2 lg:items-stretch ${
              showContentDivider ? 'gap-8 lg:gap-0' : 'gap-8 sm:gap-10 lg:gap-16 xl:gap-20'
            }`}
          >
            <div className="min-w-0 space-y-7 text-left sm:space-y-8 lg:pr-10 xl:pr-14">
              {presentation.showBrand ? (
                <p
                  className={`tracking-tight font-semibold ${brandClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                  style={{ ...brandStyle, fontWeight: 600 }}
                >
                  {creatorName}
                </p>
              ) : null}
              {ctaBio ? (
                <p
                  className={`text-pretty text-sm leading-relaxed sm:text-[0.9375rem] ${descriptionClass.replace(/\bfont-(?:bold|medium)\b/g, '').trim()}`}
                  style={descriptionStyle}
                >
                  {ctaBio}
                </p>
              ) : null}
              {dualCtaRowStart ? (
                <div className="[&_a]:!font-semibold">{dualCtaRowStart}</div>
              ) : null}
            </div>

            {ctaContactList || ctaSocialIcons ? (
              <div className="flex min-w-0 w-full flex-col lg:flex-row lg:items-stretch">
                <FooterInfoDivider enabled={showContentDivider} style={contentDividerStyle} />
                <div className="flex min-w-0 flex-1 flex-col items-start gap-5 text-left lg:items-end lg:pt-1">
                  <div className="flex w-full max-w-md flex-col items-start gap-5">
                    {ctaContactList}
                    {ctaSocialIcons}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {minimalCopyright}
        </div>
      </>
    );
  } else if (presentation.design === 'contact-card') {
    const cardBg = presentation.accentColor?.trim() || DEFAULT_FOOTER_ACCENT_COLOR;
    const cardIsLight = footerColorLuminance(cardBg) > 0.55;
    const cardText = cardIsLight ? '#0a0a0a' : '#fafafa';
    const cardMuted = cardIsLight ? 'rgba(10, 10, 10, 0.78)' : 'rgba(255, 255, 255, 0.88)';
    const cardGlyph = { color: cardText };
    const cardContactItems = contactItems.filter((item) => item.id === 'phone' || item.id === 'email');
    const cardContactList = renderFooterContactList(cardContactItems, false, {
      iconAlign: 'center',
      lineClass: 'font-semibold text-[0.9375rem]',
      lineStyle: { color: cardText, fontWeight: 600 },
      glyphStyle: cardGlyph,
    });
    const cardLocation = locationValue;
    const internalLinks = resolveFooterInternalLinksColumn(presentation, visibleSectionLinks);
    const cardSocials =
      visibleLinks.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className={`text-sm font-semibold ${descriptionClass}`} style={descriptionStyle}>
            {DEFAULT_FOOTER_CONNECT_LABEL}
          </span>
          <nav className="flex flex-wrap gap-3" aria-label="Social">
            {visibleLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition hover:opacity-90 ${
                  lightBackground
                    ? 'border-black/10 bg-white hover:border-orange-500/30'
                    : 'border-white/15 bg-white/10 hover:border-white/40'
                }`}
                style={iconStyle}
                title={link.label}
              >
                <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
              </a>
            ))}
          </nav>
        </div>
      ) : null;

    body = (
      <>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-stretch gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-20 xl:gap-28">
          <div className="w-full max-w-md lg:max-w-xl">
            <div
              className="rounded-2xl px-10 py-10 sm:px-12 sm:py-12"
              style={{ backgroundColor: cardBg, color: cardText }}
            >
              <div className="flex flex-col">
                {presentation.showBrand !== false ? (
                  <p
                    className="text-3xl font-semibold tracking-tight sm:text-[2rem]"
                    style={{ color: cardText, fontWeight: 600 }}
                  >
                    {creatorName}
                  </p>
                ) : null}
                {cardLocation ? (
                  <p className="mt-3.5 text-base leading-relaxed" style={{ color: cardMuted }}>
                    {cardLocation}
                  </p>
                ) : null}
                {cardContactList ? <div className="mt-8 space-y-1">{cardContactList}</div> : null}
              </div>
            </div>
            {cardSocials}
          </div>

          {internalLinks.links.length > 0 || copyrightLine ? (
            <div className="min-w-0 w-full max-w-xs shrink-0 lg:pt-2">
              {internalLinks.links.length > 0 ? (
                <>
              <h4
                className={`text-lg font-semibold ${landingColumnTextClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                style={{
                  ...landingColumnTextStyle,
                  color: columnHeadingStyle.color,
                  fontFamily: undefined,
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 'normal',
                  marginBottom: `${clampFooterColumnHeadingGapPx(presentation.columnHeadingGapPx) + 10}px`,
                }}
              >
                {internalLinks.title.trim().charAt(0).toUpperCase() +
                  internalLinks.title.trim().slice(1).toLowerCase()}
              </h4>
              <ul className="space-y-3.5">
                {internalLinks.links.map((link) => {
                  const href = resolveFooterLinkHref(link.href, creatorId);
                  const external = href.startsWith('http') || href.startsWith('mailto:');
                  const linkClass = `text-sm font-semibold transition hover:opacity-80 ${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`;
                  const linkStyle = { ...contactLineStyle, fontWeight: 600 };
                  return (
                    <li key={link.id}>
                      {external ? (
                        <a
                          href={href}
                          className={linkClass}
                          style={linkStyle}
                          {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={href} className={linkClass} style={linkStyle}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
                </>
              ) : null}
              {copyrightLine ? (
                <div className={`mt-8 border-t pt-4 text-left ${dividerClass}`}>
                  {copyrightLine}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </>
    );
  } else {
    const editorialLocationItem = locationValue
      ? contactItems.find((item) => item.id === 'location') ?? {
          id: 'location',
          label: locationValue,
          icon: 'location' as const,
        }
      : null;
    const editorialContactItems = [
      ...contactItems.filter((item) => item.id === 'phone' || item.id === 'email'),
      ...(editorialLocationItem ? [editorialLocationItem] : []),
    ];
    const editorialContactList = renderFooterContactList(editorialContactItems, true, {
      iconAlign: 'center',
      lineClass: `${contactLineClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()} font-semibold`,
      lineStyle: { ...contactLineStyle, fontWeight: 600 },
    });
    const editorialHeading = (label: string) => (
      <p
        className={`font-semibold ${columnHeadingClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
        style={{
          ...columnHeadingStyle,
          fontWeight: 600,
          ...footerColumnHeadingGapStyle(presentation),
        }}
      >
        {label}
      </p>
    );
    const socialIconsOnly =
      visibleLinks.length > 0 ? (
        <nav
          className="flex flex-wrap justify-center gap-5"
          aria-label="Social"
        >
          {visibleLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={link.label}
              className={`flex h-24 w-24 items-center justify-center rounded-xl border transition hover:opacity-90 ${
                lightBackground
                  ? 'border-black/8 bg-white hover:border-orange-500/30'
                  : 'border-white/10 bg-neutral-900 hover:border-orange-500/40'
              }`}
              style={iconStyle}
              title={link.label}
            >
              <FooterSocialLinkIcon link={link} bare iconClassName="h-12 w-12" />
            </a>
          ))}
        </nav>
      ) : null;

    body = (
      <>
        <div
          className={`flex w-full flex-col items-center ${
            showContentDivider ? 'gap-8 lg:flex-row lg:items-stretch lg:justify-center lg:gap-0' : 'gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-x-14'
          }`}
        >
          <div className="flex min-w-0 w-full max-w-md flex-col items-center space-y-4 text-center lg:w-auto lg:px-1">
            {editorialHeading('Networks')}
            {socialIconsOnly}
            {!socialIconsOnly && presentation.showBrand ? (
              <p
                className={`font-semibold ${brandClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim()}`}
                style={{ ...brandStyle, fontWeight: 600 }}
              >
                {creatorName}
              </p>
            ) : null}
            {description ? (
              <p
                className={`mx-auto max-w-xs text-pretty leading-relaxed ${descriptionClass}`}
                style={descriptionStyle}
              >
                {description}
              </p>
            ) : null}
          </div>
          <FooterInfoDivider enabled={showContentDivider} style={contentDividerStyle} />
          <div className="flex min-w-0 w-full max-w-md flex-col items-center space-y-4 text-center lg:w-auto lg:px-1">
            {editorialHeading('Contact')}
            {editorialContactList}
          </div>
        </div>
        {contactCtaButton || marketplaceButton || marketplaceLink ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {contactCtaButton}
            {marketplaceButton ?? marketplaceLink}
          </div>
        ) : null}
        {copyrightLine ? (
          <div className="w-full text-center">{copyrightLine}</div>
        ) : null}
      </>
    );
  }

  const fallbackBg = bgStyle || transparentBase ? '' : lightBackground ? 'bg-neutral-100' : 'bg-neutral-950';
  return (
    <footer
      id="footer"
      className={`relative isolate max-w-full overflow-x-clip ${topMarginClass} ${shellClass} ${clearanceClass} ${fallbackBg}`}
      style={Object.keys(topMarginStyle).length ? topMarginStyle : undefined}
    >
      {bgStyle ? (
        <>
          {(presentation.sectionBackgroundOpacity ?? 100) >= 100 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                backgroundColor:
                  presentation.sectionBackgroundColor?.trim() ||
                  (lightBackground ? '#ffffff' : '#0a0a0a'),
              }}
            />
          ) : null}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={bgStyle} />
        </>
      ) : null}
      {patternStyle ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={patternStyle} />
      ) : null}
      <div
        className={`relative z-[1] min-w-0 w-full pf-footer-shell-x ${contentClassName}`}
      >
        <div
          className={`min-w-0 w-full ${footerContentPaddingClassName()} ${
            presentation.design === 'editorial' ? 'pf-footer-editorial-lg-bottom' : ''
          } ${
            presentation.design === 'landing' ||
            presentation.design === 'compact' ||
            presentation.design === 'minimal'
              ? 'pf-footer-landing-pad-x'
              : ''
          } ${presentation.design === 'compact' ? 'pf-footer-compact-pad-x' : ''}`}
          style={footerContentPaddingStyle(presentation)}
        >
        <PortfolioMotionItem profile={motionProfile} index={0} className="w-full min-w-0">
          <div
            className={footerLayoutClass(presentation.design, presentation.alignment, {
              contentDivider: showContentDivider,
            })}
          >
            {body}
          </div>
        </PortfolioMotionItem>
        </div>
      </div>
    </footer>
  );
}

function FooterSocialLinkIcon({
  link,
  bare = false,
  iconClassName = 'h-4 w-4',
}: {
  link: EditorialContactLink;
  /** Icon only — no colored circular chip (landing-style buttons). */
  bare?: boolean;
  iconClassName?: string;
}) {
  const platform = inferContactLinkPlatform(link);
  const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
  const isSocial = socialKey !== 'other';

  if (isSocial && platform) {
    if (bare) {
      return <SocialPlatformIcon platform={platform} className={iconClassName} />;
    }
    return (
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${socialPlatformBrandClass(platform)}`}
      >
        <SocialPlatformIcon platform={platform} className={iconClassName} />
      </span>
    );
  }

  const isWebsite = link.type === 'WEBSITE';
  if (bare) {
    return (
      <svg className={iconClassName} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        {isWebsite ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
          />
        )}
      </svg>
    );
  }

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        isWebsite
          ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300'
          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
      }`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        {isWebsite ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
          />
        )}
      </svg>
    </span>
  );
}

function FooterCtaMailIcon({ className }: { className?: string }) {
  return <ContactEmailIcon className={className} />;
}

function FooterContactIcon({
  type,
  className = 'h-4 w-4',
  style,
}: {
  type: 'phone' | 'email' | 'location' | 'hours';
  className?: string;
  style?: CSSProperties;
}) {
  if (type === 'phone') {
    return (
      <span className="inline-flex" style={style}>
        <ContactPhoneIcon className={className} />
      </span>
    );
  }
  if (type === 'email') {
    return (
      <span className="inline-flex" style={style}>
        <ContactEmailIcon className={className} />
      </span>
    );
  }
  if (type === 'location') {
    return (
      <span className="inline-flex" style={style}>
        <ContactLocationIcon className={className} />
      </span>
    );
  }
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
      />
    </svg>
  );
}

export function MarketplaceProfileLink({
  creatorId,
  color,
}: {
  creatorId: string;
  /** Accent color from the Work palette (Section title / Principal). */
  color?: string;
}) {
  return (
    <Link
      href={`/marketplace/${creatorId}`}
      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] transition hover:opacity-75"
      style={color ? { color } : undefined}
    >
      View all projects
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
