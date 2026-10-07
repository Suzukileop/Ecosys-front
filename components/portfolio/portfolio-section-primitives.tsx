'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';
import {
  normalizeSocialPlatformKey,
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { mediaImageResponsive, mediaImageSrc, mediaImageSrcSet } from '@/lib/media-image-url';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { PortfolioToolsStackedIcons } from '@/components/portfolio/portfolio-tools-stacked-icons';
import { PortfolioWorkCtaGlyph } from '@/components/portfolio/portfolio-work-cta-icons';
import type { PortfolioWorkCtaIcon } from '@/components/portfolio/portfolio-work-cta-icons';
import { formatPhoneDisplay } from '@/lib/phone';
import type { FaqItem, ProfileGalleryItem } from '@/types/profile';
import type { MarketplaceContentItem } from '@/types/marketplace';
import {
  galleryAspectStyle,
  galleryDesignUsesCarouselNav,
  galleryEffectiveVerticalGap,
  galleryItemDisplayTitle,
  galleryMaxWidthClass,
  galleryPlacementClass,
  type PortfolioGalleryPresentationSettings,
} from '@/components/portfolio/portfolio-gallery-settings';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import { PortfolioListMarker } from '@/components/portfolio/PortfolioListMarker';
import {
  portfolioSectionTitleClassWithoutUppercase,
  portfolioSectionTitleSentenceCase,
} from '@/components/portfolio/portfolio-section-title';
import { resolveTaskListMarker, listMarkerStrokeWidth, listMarkerFontWeightFromAmount, resolveListMarkerSizePx, resolveListMarkerWeightAmount, type PortfolioListMarkerWeight } from '@/components/portfolio/portfolio-list-marker';
import { usePortfolioTaskListMarkerGlobal } from '@/components/portfolio/portfolio-task-list-marker-context';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import {
  DEFAULT_MOTION_PROFILE,
} from '@/components/portfolio/portfolio-motion-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';
import { formatNavLabel, portfolioNavBarContainerClass, portfolioNavBarHeightClass, portfolioNavBarInnerClass, portfolioNavBarShellStyle, portfolioNavBarWidthClass, portfolioNavIconGlyphClass, portfolioNavIsVertical, portfolioNavItemActiveClass, portfolioNavItemBaseClass, portfolioNavLabelFontSizeClass, portfolioNavItemColorStyles, portfolioNavItemHoverClass, portfolioNavItemHoverCssVars, portfolioNavItemHoverIconClass, portfolioNavItemHoverPresentation, portfolioNavEditorialBarItemHoverPresentation, portfolioNavFloatingPillItemHoverPresentation, portfolioNavCenterLogoSplitItemHoverPresentation, portfolioNavItemHoverTextClass, portfolioNavDrawerItemHoverClass, portfolioNavActiveItemStyle, portfolioNavActiveIndicatorSlot, portfolioNavUsesFlatMenuIndicatorLayout, portfolioNavTextIndicatorReserveClass, portfolioNavUsesTextIndicatorReserve, portfolioNavDockGlyphClass, portfolioNavEffectiveContentMode, applyPortfolioNavEditorialBarActiveInk, resolvePortfolioNavEditorialBarMenuAccentColor, resolvePortfolioNavMenuGroupActiveStyle, portfolioNavPlacementClass, portfolioNavRailDividerClass, portfolioNavBarHostsInlineExtras, portfolioNavItemGapClass, portfolioNavTriZoneItemGapClass, resolveNavBarSurfaceBackground, resolveNavDrawerPanelBackground, resolvePortfolioNavMobileChrome, type PortfolioNavMenuControlAlign, type PortfolioNavMenuControlIcon } from '@/components/portfolio/portfolio-nav-settings';
import {
  portfolioNavUsesCenterLogoSplitLayout,
  portfolioNavUsesEditorialBarLayout,
  portfolioNavUsesFloatingPillLayout,
  portfolioNavFloatingPillShowsLogo,
  portfolioNavFloatingPillShowsContact,
  portfolioNavUsesStructuredBarLayout,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { splitNavMenuEntries } from '@/components/portfolio/portfolio-nav-split-layout';
import {
  DEFAULT_NAV_PALETTE,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import {
  portfolioNavTopClearanceActive,
  portfolioNavTopScrollMarginClass,
  scrollToPortfolioSection,
  usePortfolioNavTopClearanceSync,
} from '@/components/portfolio/portfolio-nav-top-clearance';
import { usePortfolioSectionSpy } from '@/components/portfolio/portfolio-nav-section-spy';
import {
  sectionHeaderOuterLayoutClass,
  sectionHeaderSubtitleAlignClass,
  sectionHeaderTitleTextAlignClass,
  sectionHeaderTitleWrapClass,
  sectionHeaderTrailingLayoutClass,
} from '@/components/portfolio/portfolio-global-settings';
import { PortfolioNavMenuGroupDropdown } from '@/components/portfolio/portfolio-nav-menu-group-dropdown';
import { resolveNavMenuEntries } from '@/components/portfolio/portfolio-nav-menu-groups';
import type { PortfolioNavIconVariant } from '@/components/portfolio/portfolio-nav-items';
import {
  galleryIndexLabel,
  useGalleryMosaicParallax,
  useGalleryReveal,
} from '@/components/portfolio/portfolio-gallery-design-motion';
import {
  PortfolioNavAdjacentExtras,
  PortfolioNavCenterBrand,
  PortfolioNavColorModeToggleButton,
  PortfolioNavColorModeToggleProvider,
  PortfolioNavEditorialRightSlot,
  PortfolioNavFloatingPillRightSlot,
  PortfolioNavFreeSpaceLinks,
  PortfolioNavInlineExtras,
  type PortfolioNavChromeLink,
} from '@/components/portfolio/portfolio-nav-extras';
import { DEFAULT_ABOUT_PRESENTATION, aboutAccentColor, aboutStatFontStyle, aboutStatLabelColorStyle, aboutStatValueColorStyle, aboutSidePanelShellClass, aboutSidePanelAutoCenterClass, aboutSidePanelAccentSoftBackground, aboutSidePanelCardBackgroundSettings, aboutSidePanelContentGapStyle, aboutSidePanelDividerColor, aboutSidePanelFrameClass, aboutSidePanelFrameStyle, aboutSidePanelFullWidthLayoutClass, aboutSidePanelInfoBarLayoutClass, aboutSidePanelItemCellClass, aboutPalettePrincipalColor, aboutSidePanelMicroLabelColor, aboutStatsAutoCenterClass, aboutStatCardFrameClass, aboutStatCardFrameStyle, aboutStatEditorialSuffix, aboutStatsGapStyle, aboutStatFontClass, aboutStatIconColorStyle, aboutStatIconSizeClass, aboutStatLabelSizeClass, aboutStatLabelTrackingClass, aboutStatLabelWeightClass, aboutStatValueSizeClass, aboutStatValueWeightClass, sidePanelHeadingClass, sidePanelHeadingStyle, resolveSidePanelHeading, formatWhyMeIndexLabel, resolveSidePanelMarkerColor, ABOUT_WHY_ME_MARKER_SIZE_PRESET_PX, sidePanelIconPlacementClass, isAboutRatingStat, type AboutStatValueSizeContext, type PortfolioAboutLayoutMode, type PortfolioAboutPresentationSettings, type PortfolioAboutSidePanelIconPlacement, type PortfolioAboutWhyMeMarkerSize, type PortfolioAboutWhyMeMarkerStyle } from '@/components/portfolio/portfolio-about-settings';
import {
  elementTextInlineStyle,
  elementTextStyleClass,
  toolsIconPixelSize,
  toolsIconShellClass,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
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
  faqSeparatedCardFrameClass,
  faqSummaryHorizontalPaddingClass,
  faqSummaryPaddingClass,
  type PortfolioFaqExpandIconStyle,
  type PortfolioFaqPresentationSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import { DEFAULT_CONTACT_PRESENTATION, contactCardFrameClass, contactCardFrameStyle, contactCardMaxWidthClass, contactCardPlacementClass, contactCardShellClass, contactAsideLayoutClass, contactChromeCssVars, contactCtaClassName, contactCtaStyle, contactFormStackGapClass, contactFormFrameClass, contactFormFrameStyle, contactInquiryFormCardClass, contactInquiryAccentBlockClass, contactInquiryChannelCardClass, contactChannelCardsCardClass, contactChannelCardsCardStyle, contactChannelCardsIconClass, contactDeskChannelCardClass, contactDeskFormPanelClass, contactDeskMaxWidthClass, contactInfoPanelShellClass, contactInfoPanelShellStyle, contactInfoPanelFormCardClass, contactInfoPanelFormCardStyle, contactSwissEditorialFrameClass, contactSwissEditorialFrameStyle, DEFAULT_CONTACT_SWISS_AVAILABILITY, DEFAULT_CONTACT_SWISS_COBALT, DEFAULT_CONTACT_SWISS_SUBTITLE, DEFAULT_CONTACT_SWISS_TITLE, isContactInquiryPanelDesign, isContactDeskDesign, isContactInfoPanelDesign, isContactChannelCardsDesign, isContactSwissEditorialDesign, isContactOwnedLayoutDesign, contactActiveColorMode, resolveContactFormDesign, resolveContactInquiryHeadline, resolveContactInquirySupporting, resolveContactInfoPanelHeadline, resolveContactInfoPanelSupporting, contactIconGlyphClass, contactIconPlacementClass, contactIconShellClass, contactIconShellStyle, contactIconBorderClass, contactItemRowShellClass, contactItemsLayoutClass, normalizeContactElementStyles, contactPremiumFontScale, type PortfolioContactElementStyles, type PortfolioContactIconBorder, type PortfolioContactIconPlacement, type PortfolioContactPresentationSettings } from '@/components/portfolio/portfolio-contact-settings';
import {
  ContactHeaderEditorialHeader,
  ContactHeaderMarqueeHeader,
  ContactHeaderIndexHeader,
  ContactHeaderAccentCountHeader,
  ContactHeaderSerifLeadHeader,
  ContactHeaderBillboardHeader,
  ContactHeaderMastheadHeader,
  ContactHeaderSplitHeadingHeader,
} from '@/components/portfolio/contact-portfolio-header-designs';
import { ContactMessageForm } from '@/components/portfolio/portfolio-contact-message-form';
import { ContactInquiryIllustration } from '@/components/portfolio/ContactInquiryIllustration';
import { createContactDesignLayoutResolver } from '@/components/portfolio/portfolio-contact-design-layout';
import { FaqSectionIllustration } from '@/components/portfolio/FaqSectionIllustration';
import { DEFAULT_FOOTER_PRESENTATION, footerDividerClass, footerIconStyle, footerLayoutClass, footerContentPaddingStyle, footerContentPaddingClassName, footerPatternStyle, footerContactCtaStyle, footerContactIconSizeClass, footerMarketplaceCtaClass, footerMarketplaceCtaStyle, footerPresetCtaClass, footerReadableOnBackground, footerColorLuminance, footerShellClass, footerTopMarginClass, footerTopMarginStyle, clampFooterColumnHeadingGapPx, resolveFooterCopyrightLabel, isFooterBackgroundLight, normalizeFooterElementStyles, resolveFooterLinkHref, DEFAULT_FOOTER_CONNECT_LABEL, DEFAULT_FOOTER_ACCENT_COLOR, resolveFooterMarketplaceCtaHref, footerPremiumFontScale, type PortfolioFooterPresentationSettings } from '@/components/portfolio/portfolio-footer-settings';
import {
  createFooterDesignLayoutResolver,
  resolveFooterSectionNavLinks,
  type FooterInkToken,
  type PortfolioFooterSectionLinkOption,
} from '@/components/portfolio/portfolio-footer-design-layout';
import {
  sectionBackgroundStyle,
} from '@/components/portfolio/portfolio-section-background-settings';
import { DEFAULT_CONTENT_GUTTER, portfolioEditorialGutterX, portfolioEditorialShellClass, type PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
// The Team section's member layouts now live in their own module (premium rework + shared GSAP
// entrance); re-exported here so existing `portfolio-section-primitives` importers keep working.
export { EditorialTeamGallery } from '@/components/portfolio/portfolio-team-designs';

/** The page renders one Gallery, Contact and Footer design, so each design is its own chunk. */
const GalleryTallRow = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-tall-row').then((m) => m.GalleryTallRow)
);
const GalleryFloatingCanvas = dynamic(() =>
  import('@/components/portfolio/portfolio-gallery-design-floating-canvas').then((m) => m.GalleryFloatingCanvas)
);
const ContactDesignEditorialFocus = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-editorial-focus').then((m) => m.ContactDesignEditorialFocus)
);
const ContactDesignSplitGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-split-grid').then((m) => m.ContactDesignSplitGrid)
);
const ContactDesignLiquidDistortion = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-liquid-distortion').then((m) => m.ContactDesignLiquidDistortion)
);
const ContactDesignSequentialReveal = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-sequential-reveal').then((m) => m.ContactDesignSequentialReveal)
);
const ContactDesignStudioOverlap = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-studio-overlap').then((m) => m.ContactDesignStudioOverlap)
);
const ContactDesignBorderlessGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-borderless-grid').then((m) => m.ContactDesignBorderlessGrid)
);
const ContactDesignBrokenGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-broken-grid').then((m) => m.ContactDesignBrokenGrid)
);
const ContactDesignNumberedNarrative = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-numbered-narrative').then((m) => m.ContactDesignNumberedNarrative)
);
const ContactDesignMagneticOverlap = dynamic(() =>
  import('@/components/portfolio/portfolio-contact-design-magnetic-overlap').then((m) => m.ContactDesignMagneticOverlap)
);
const FooterDesignMonumental = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-monumental').then((m) => m.FooterDesignMonumental)
);
const FooterDesignContactCard = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-contact-card').then((m) => m.FooterDesignContactCard)
);
const FooterDesignCompact = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-compact').then((m) => m.FooterDesignCompact)
);
const FooterDesignCenteredMinimal = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-centered-minimal').then((m) => m.FooterDesignCenteredMinimal)
);
const FooterDesignLanding = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-landing').then((m) => m.FooterDesignLanding)
);
const FooterDesignHeroColumns = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-hero-columns').then((m) => m.FooterDesignHeroColumns)
);
const FooterDesignSplitForm = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-split-form').then((m) => m.FooterDesignSplitForm)
);
const FooterDesignTimezoneEditorial = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-timezone-editorial').then((m) => m.FooterDesignTimezoneEditorial)
);
const FooterDesignInvertedWordmark = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-inverted-wordmark').then((m) => m.FooterDesignInvertedWordmark)
);
const FooterDesignServicesReveal = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-services-reveal').then((m) => m.FooterDesignServicesReveal)
);
const FooterDesignEditorialGrid = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-editorial-grid').then((m) => m.FooterDesignEditorialGrid)
);
const FooterDesignHeadlineReveal = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-headline-reveal').then((m) => m.FooterDesignHeadlineReveal)
);
const FooterDesignDispatch = dynamic(() =>
  import('@/components/portfolio/portfolio-footer-design-dispatch').then((m) => m.FooterDesignDispatch)
);

export const SERIF = "'Playfair Display', serif";

export {
  portfolioEditorialShellClass,
};

/** Shared chrome for floating nav pill and sticky section titles. */
const PORTFOLIO_FLOATING_CHROME =
  'rounded-full border border-neutral-200/80 bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/90';

const PORTFOLIO_FLOATING_CHROME_LABEL =
  'px-4 py-2 text-[11px] font-bold normal-case tracking-[0.04em]';

/** Nearest scrollable ancestor (pages mode uses nested overflow-y-auto). */
export function getScrollParent(el: HTMLElement | null): HTMLElement | null {
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
  const [cinemaX, setCinemaX] = useState(0);
  const [cinemaStep, setCinemaStep] = useState(0);
  const [cinemaSliding, setCinemaSliding] = useState(false);
  const cinemaViewRef = useRef<HTMLDivElement>(null);
  const cinemaLockRef = useRef(false);
  const cinemaUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  // Shared scroll entrance for every design's tiles (portfolio-gallery-design-motion).
  const revealRef = useGalleryReveal<HTMLDivElement>(`${presentation.design}:${items.length}`);
  // Hero mosaic only: the cursor-depth layer. Mounted unconditionally (hooks cannot be
  // conditional) and inert for every other design, since its ref is never attached.
  const mosaicParallaxRef = useGalleryMosaicParallax<HTMLDivElement>(
    `${presentation.design}:${items.length}`,
    presentation.design === 'hero-mosaic'
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const captionDrag = useRef<{ pointerId: number; startX: number; startLeft: number; moved: boolean } | null>(null);
  const scrollCarouselLock = useRef(false);
  const scrollCarouselRestore = useRef<(() => void) | null>(null);
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items]
  );

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveItem(null);
        return;
      }
      // Arrow keys walk the gallery from inside the lightbox — without them the only way to see
      // the next image was to close and re-open it.
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      if (sortedItems.length < 2) return;
      event.preventDefault();
      const current = sortedItems.findIndex((item) => item.id === activeItem.id);
      if (current < 0) return;
      const step = event.key === 'ArrowRight' ? 1 : -1;
      setActiveItem(sortedItems[(current + step + sortedItems.length) % sortedItems.length]);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeItem, sortedItems]);

  useEffect(() => {
    setCarouselPage(0);
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
  const baseWidth = `${galleryMaxWidthClass(presentation.maxWidth)} ${galleryPlacementClass(presentation.placement)} w-full`;
  const useOverlayTitles = presentation.titlePlacement === 'overlay';
  /**
   * Hero mosaic focus. `mosaicFocusEnabled` is the user's switch; when it is off the tiles carry
   * no opacity/filter rules at all rather than a disabled version of them.
   */
  const mosaicFocus = presentation.design === 'hero-mosaic' && presentation.mosaicFocusEnabled !== false;
  const mosaicFocusClass = mosaicFocus
    ? 'transition-[opacity,filter] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/mosaic:opacity-[0.55] hover:!opacity-100 hover:brightness-[1.06] hover:contrast-[1.04]'
    : '';
  const isClipCoverDesign = presentation.design === 'tall-row';

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
      const item = sortedItems[(offset + sortedItems.length) % sortedItems.length];
      if (!item?.mediaUrl || item.mediaType === 'VIDEO') return;
      const image = new window.Image();
      image.src = item.mediaUrl;
    };
    preload(1);
    preload(-1);
  }, [presentation.design, sortedItems]);

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
    const zoomHover =
      presentation.hoverZoom && !lightbox && !isClipCoverDesign && presentation.design !== 'cinema-strip';
    // Long expo push-in rather than the old snappy 500ms/scale-105: at this size a fast zoom
    // reads as a UI reaction, a slow one reads as the image breathing.
    const zoomClass = zoomHover
      ? 'h-full w-full transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]'
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
        noColorTransition={zoomHover}
      />
    );
    if (!lightbox) return deferred;
    return <div className="relative h-[min(82vh,900px)] w-[min(92vw,1200px)] max-w-[92vw]">{deferred}</div>;
  };

  const persistentOverlayTitle = (itemTitle: string, revealOnHover = false, roomy = false) => {
    const reveal = revealOnHover
      ? ' opacity-0 transition-[opacity,transform] duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-within:opacity-100'
      : '';
    // `roomy`: the mosaic sets its titles inside a much wider margin and reads them off the
    // bottom-left corner rather than centred. At mosaic scale a centred caption tight against
    // the frame looks cropped by it; a corner with real air around it looks placed.
    const framing = roomy
      ? ' px-7 py-7 text-left sm:px-9 sm:py-8 lg:px-10 lg:py-9'
      : ' px-4 py-5 text-center sm:px-5 sm:py-6';
    return (
      <>
        {/* Scrim: `.pf-gallery-media-title` force-disables text-shadow, so white caption text over
            a light photograph has nothing to sit on. The gradient is the only way to keep it
            readable, and it doubles as the classic editorial foot of the frame. */}
        <span
          aria-hidden
          className={`pf-gallery-scrim pointer-events-none absolute inset-x-0 bottom-0 z-[9] block h-[42%]${
            revealOnHover
              ? ' opacity-0 transition-opacity duration-[620ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-within:opacity-100'
              : ''
          }`}
          data-pf-no-color-transition=""
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0) 100%)',
          }}
        />
        <span
          className={`pf-gallery-media-title pf-gallery-media-title--in-frame pointer-events-none absolute inset-x-0 bottom-0 z-10 text-white${framing}${
            presentation.design === 'tall-row' ? ' pf-gallery-media-title--plain pf-gallery-media-title--tall' : ''
          }${reveal}${revealOnHover ? ' translate-y-2 group-hover:translate-y-0 group-focus-within:translate-y-0' : ''}`}
          data-pf-no-color-transition=""
        >
          {itemTitle}
        </span>
      </>
    );
  };

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
      /** Hero mosaic: roomy corner-set titles, and no black veil under them. */
      overlayVariant?: 'mosaic';
      /** Hero mosaic: wraps the media in its own transform layer, at this depth factor. */
      parallaxDepth?: number;
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
      presentation.design !== 'cinema-strip' && presentation.design !== 'tall-row';
    return (
      <article
        key={item.id}
        data-gallery-reveal=""
        className={`group relative break-inside-avoid ${
          isCinemaStrip ? 'flex flex-col overflow-visible' : 'flex flex-col overflow-hidden'
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
            ? `Show ${galleryItemDisplayTitle(item.title) || 'this media'}`
            : presentation.lightboxEnabled
              ? `Open ${item.title}`
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
            options?.fill
              ? 'flex-1 min-h-[12rem] bg-neutral-100 dark:bg-neutral-900'
              : isCinemaStrip
                ? 'z-10 w-full bg-transparent'
                : // The tile is a flex column and the media grows inside it. `h-full` used to make
                  // the media fill the tile outright, which pushed an under-caption past the
                  // tile's own `overflow:hidden` edge — the caption was in the DOM, styled
                  // correctly, and clipped out of existence. Growing instead keeps the caption
                  // inside while images still fill a stretched grid row.
                  'min-h-[12rem] flex-1 bg-neutral-100 dark:bg-neutral-900'
          } ${
            isCinemaStrip
              ? 'transition-transform duration-[760ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:-translate-y-16'
              : ''
          }`}
          data-pf-no-color-transition=""
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
          {options?.parallaxDepth ? (
            // Its own layer, inside the tile's `overflow-hidden`: the hover push-in is a CSS
            // `scale` on the media node itself, so GSAP must not write `transform` there too.
            <div
              className="h-full w-full will-change-transform"
              data-gallery-parallax={String(options.parallaxDepth)}
              data-pf-no-color-transition=""
            >
              {media(item, false, loadMediaEager, options?.emphasis === 'hero')}
            </div>
          ) : (
            media(item, false, loadMediaEager, options?.emphasis === 'hero')
          )}
          {overlayOnHover && options?.overlayVariant !== 'mosaic' ? (
            <span
              className="pointer-events-none absolute inset-0 z-[9] bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
              aria-hidden
            />
          ) : null}
          {overlayActive && itemTitle
            ? persistentOverlayTitle(itemTitle, overlayOnHover, options?.overlayVariant === 'mosaic')
            : null}
        </div>
        {showUnderTitle ? (
          <h3
            className={
              isCinemaStrip
                ? 'pf-gallery-media-title pf-gallery-media-title--cinema pf-gallery-media-title--plain pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-2 px-3 pb-1 text-center opacity-0 transition-[opacity,transform] duration-[760ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100'
                : 'pf-gallery-media-title px-1 pb-1 pt-3 text-center'
            }
            data-pf-no-color-transition=""
            style={{ color: presentation.itemTitleColor }}
          >
            {itemTitle}
          </h3>
        ) : null}
      </article>
    );
  };

  /**
   * Caption cards — a frameless editorial rail. The card is no longer a bordered box holding a
   * small picture: the image floats on the section's own ground, and the rail is sized by HEIGHT
   * so every plate lines up on one baseline whatever its ratio, exactly like a printed contact
   * sheet. `Image size` therefore drives that height (320 → 62vh, the design's reference scale);
   * the width follows from each image's own aspect.
   */
  const captionRailHeight = `clamp(15rem, ${((presentation.captionCardWidthPx || 320) / 320) * 62}vh, 44rem)`;

  /** Mouse drag on the caption rail. Touch and trackpad keep the native, momentum-preserving scroll. */
  const onCaptionPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollRef.current;
    if (!scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
    captionDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startLeft: scroller.scrollLeft,
      moved: false,
    };
  };

  const onCaptionPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const scroller = scrollRef.current;
    const drag = captionDrag.current;
    if (!scroller || !drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(delta) > 4) {
      drag.moved = true;
      scroller.setPointerCapture?.(event.pointerId);
    }
    if (!drag.moved) return;
    scroller.scrollLeft = drag.startLeft - delta;
  };

  const endCaptionDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = captionDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    scrollRef.current?.releasePointerCapture?.(event.pointerId);
    // Keep the flag one frame longer so the click that ends a drag never opens the lightbox.
    if (drag.moved) window.setTimeout(() => { captionDrag.current = null; }, 0);
    else captionDrag.current = null;
  };

  const captionCard = (item: ProfileGalleryItem, index = 0) => {
    const itemTitle = galleryItemDisplayTitle(item.title);
    const isOriginalRatio = presentation.imageAspect === 'auto';
    const mediaAspect = galleryAspectStyle(presentation.imageAspect);
    return (
      <article
        key={item.id}
        data-gallery-carousel-item
        data-gallery-reveal=""
        data-pf-no-color-transition=""
        /* Cinema-strip mechanism: the card box stays put and only the plate rises, uncovering a
           caption that was parked behind it at the foot. So no card-level lift here — two stacked
           translations would just double the travel — and `overflow-visible` so the plate can
           leave the box. */
        className={`group relative shrink-0 snap-start overflow-visible ${
          presentation.lightboxEnabled ? 'cursor-zoom-in' : ''
        } flex flex-col bg-transparent`}
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
          /* `z-10` over the caption's `z-0`: the plate covers it at rest and slides off it on
             hover, rather than the caption fading in on top of the image. */
          className={`relative z-10 shrink-0 overflow-hidden bg-transparent${
            showItemTitle && itemTitle
              ? ' transition-transform duration-[760ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:-translate-y-12 group-focus-within:-translate-y-12'
              : ''
          }`}
          data-pf-no-color-transition=""
          /* With a ratio set, the plate is height-driven and its width follows — one baseline for
             the whole rail. `Original ratio` stays width-driven on purpose: sizing an unknown
             ratio from its height would make the plate's width depend on the image and the image's
             width depend on the plate, which browsers resolve to a collapsed box. */
          style={{
            ...(isOriginalRatio
              ? { width: `min(86vw, ${Math.round((presentation.captionCardWidthPx || 320) * 1.9)}px)` }
              : { height: captionRailHeight, ...mediaAspect }),
            borderRadius: `${presentation.radius}px`,
          }}
        >
          <PortfolioDeferredMedia
            src={item.mediaUrl}
            alt={galleryItemDisplayTitle(item.title) || 'Gallery media'}
            className={`h-full w-full ${
              presentation.hoverZoom
                ? 'transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]'
                : ''
            }`}
            noColorTransition={presentation.hoverZoom}
            sizes="(max-width: 768px) 80vw, 46vh"
            eager={index < 2}
            kind={item.mediaType === 'VIDEO' ? 'video' : 'image'}
            objectFit={isOriginalRatio ? 'contain' : presentation.objectFit}
            objectPosition={presentation.objectPosition}
            autoPlayVideo={item.mediaType === 'VIDEO'}
            showPlayBadge={item.mediaType === 'VIDEO'}
            fillParent={!isOriginalRatio}
          />
          {/* The plate lifts out of the section's ground on hover: a hairline edge catches the
              light and the image warms very slightly. Both are barely-there by design. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] block opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] transition-opacity duration-[760ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100"
            data-pf-no-color-transition=""
            style={{ borderRadius: `${presentation.radius}px` }}
          />
        </div>
        {showItemTitle && itemTitle ? (
          // Not `.pf-gallery-media-title--caption`: that class is locked to a centred 18px with
          // `!important`. This reads the same `--pf-gallery-font-scale` the Font size control sets,
          // so the setting still works, but the caption can be a real editorial line — monospaced,
          // tracked, sitting under the left edge of its own plate.
          <h3
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 max-w-[26rem] translate-y-2 pb-1 font-mono text-[calc(0.82rem*var(--pf-gallery-font-scale,1))] font-medium uppercase leading-[1.5] tracking-[0.16em] opacity-0 transition-[opacity,transform] duration-[760ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
            data-pf-no-color-transition=""
            style={{ color: presentation.itemTitleColor }}
          >
            <span className="mr-3 opacity-45">{String(index + 1).padStart(2, '0')}</span>
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
      <div
        /* The caller's own `justify-*` has to replace the default, not compete with it: two
           justify utilities on one element resolve by CSS source order, so `justify-end` passed
           by tall-row silently lost to the hardcoded `justify-center`. */
        className={`flex items-center gap-3 ${className?.includes('justify-') ? '' : 'justify-center'} ${className ?? ''}`}
      >
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => (onNavigate ?? scrollCarousel)(direction)}
            /* Hairline circle + a drawn arrow that steps in its own direction on hover — the
               glyph chevrons in a filled button were the most generic thing in the section. */
            className={`group/nav relative flex items-center justify-center overflow-hidden rounded-full border transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-current active:scale-95 ${
              size === 'lg' ? 'h-14 w-14' : 'h-12 w-12'
            }`}
            data-pf-no-color-transition=""
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={`relative h-[38%] w-[38%] transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                direction === -1
                  ? 'group-hover/nav:-translate-x-1 rotate-180'
                  : 'group-hover/nav:translate-x-1'
              }`}
              data-pf-no-color-transition=""
            >
              <path d="M4 12h15" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        ))}
      </div>
    ) : null;

  const paginationDots =
    presentation.design === 'caption-carousel' && presentation.showPagination && captionPageCount > 1 ? (
      <div className="mt-8 flex items-center justify-center gap-2">
        {Array.from({ length: captionPageCount }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToCarouselPage(index)}
            /* Palette-bound pills, not hardcoded neutral dots: the old ones ignored the gallery
               palette entirely and went invisible on a dark section. The active page stretches
               instead of just darkening. */
            className={`h-1.5 rounded-full transition-[width,opacity] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              carouselPage === index ? 'w-8 opacity-100' : 'w-1.5 opacity-40 hover:opacity-70'
            }`}
            data-pf-no-color-transition=""
            style={{ backgroundColor: presentation.itemTitleColor }}
            aria-label={`Page ${index + 1}`}
            aria-current={carouselPage === index ? 'true' : undefined}
          />
        ))}
      </div>
    ) : null;

  const content =
    presentation.design === 'caption-carousel' ? (
      <div className={baseWidth} style={{ padding: `${presentation.padding}px` }}>
        {/* Chevrons above the rail, aligned right: at this scale a pair of buttons centred under
            the images reads as a footer for them; up here it reads as the rail's own control. */}
        {presentation.captionPager === 'dots'
          ? null
          : carouselNavButtons('mb-8 justify-end', undefined, 'lg', presentation.showPagination)}
        <div
          ref={scrollRef}
          onPointerDown={onCaptionPointerDown}
          onPointerMove={onCaptionPointerMove}
          onPointerUp={endCaptionDrag}
          onPointerCancel={endCaptionDrag}
          // Without this the browser starts its own image drag as soon as the pointer moves over a
          // plate, which swallows the pointermove stream and the rail never scrolls.
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            // A drag that ends on a plate must not also open the lightbox.
            if (captionDrag.current?.moved) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          /* `overflow-x-auto` computes `overflow-y` to `auto` too, so the plate's hover lift would
             be clipped (or spawn a vertical scrollbar) without room reserved for it up top —
             exactly the `pt-16` the cinema strip keeps above its own track. */
          className={`flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:cursor-grab sm:active:cursor-grabbing${
            showItemTitle ? ' pt-12' : ''
          }`}
          style={{ gap: `${Math.max(presentation.gap, 28)}px` }}
        >
          {sortedItems.map(captionCard)}
        </div>
        {presentation.captionPager === 'dots' ? paginationDots : null}
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
      // `group/mosaic` is what lets one tile pull focus: every tile dims while the mosaic is
      // hovered, and the one under the pointer overrides that back to full. Both rules land on
      // the same specificity, so the winner carries `!` rather than relying on source order.
      <div
        ref={mosaicParallaxRef}
        className={`${baseWidth} flex flex-col${mosaicFocus ? ' group/mosaic' : ''}`}
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
              <div className={`min-w-0 ${plan.heroClass} ${mosaicFocusClass}`} data-pf-no-color-transition="">
                {card(heroItem, offset, {
                  fill: true,
                  emphasis: 'hero',
                  hideTitle: !showItemTitle,
                  overlayOnHover: showItemTitle,
                  overlayVariant: 'mosaic',
                  // The hero is the far plane: it drifts least, which is what reads as depth
                  // against the small tiles rather than as the whole mosaic sliding.
                  parallaxDepth: 0.55,
                  eager: chunkIndex === 0,
                })}
              </div>
              {tiles.map((item, index) => (
                <div
                  key={item.id}
                  className={`min-w-0 ${plan.tileClass(index)} ${mosaicFocusClass}`}
                  data-pf-no-color-transition=""
                >
                  {card(item, offset + index + 1, {
                    fill: true,
                    hideTitle: !showItemTitle,
                    overlayOnHover: showItemTitle,
                    overlayVariant: 'mosaic',
                    parallaxDepth: 1,
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    ) : presentation.design === 'floating-canvas' ? (
      /* `overflow-visible`: this design's title pills hang half-way past their card's bottom
         edge and its float shadows bleed past their frames — a clipping wrapper would cut both. */
      <div
        className={`${baseWidth} overflow-visible`}
        style={{ padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined }}
      >
        <GalleryFloatingCanvas
          items={sortedItems}
          presentation={presentation}
          onOpen={presentation.lightboxEnabled ? openLightbox : undefined}
          showTitle={showItemTitle}
        />
      </div>
    ) : presentation.design === 'tall-row' ? (
      <div
        className={baseWidth}
        style={{
          padding: presentation.padding > 0 ? `${presentation.padding}px` : undefined,
          ['--gallery-frame-radius' as string]: `${presentation.radius}px`,
        }}
      >
        <GalleryTallRow
          items={sortedItems}
          presentation={presentation}
          header={embeddedHeader}
          renderMedia={(item, index, eager) => media(item, false, eager, index === 0)}
          onOpen={presentation.lightboxEnabled ? openLightbox : undefined}
          reduceMotion={Boolean(reduceMotion)}
          showTitle={showItemTitle}
        />
      </div>
    ) : (
      <div
        className={`${baseWidth} grid grid-cols-1 sm:grid-cols-2 lg:[grid-template-columns:repeat(var(--gallery-columns),minmax(0,1fr))]`}
        style={gridStyle}
      >
        {sortedItems.map((item, index) => card(item, index))}
      </div>
    );

  const lightboxIndex = activeItem ? sortedItems.findIndex((item) => item.id === activeItem.id) : -1;
  const stepLightbox = (direction: -1 | 1) => {
    if (sortedItems.length < 2 || lightboxIndex < 0) return;
    setActiveItem(sortedItems[(lightboxIndex + direction + sortedItems.length) % sortedItems.length]);
  };
  const lightboxArrow = (direction: -1 | 1) => (
    <button
      type="button"
      onClick={() => stepLightbox(direction)}
      className={`group/lb pointer-events-auto absolute top-1/2 z-[2] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,transform] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-14 sm:w-14 ${
        direction === -1 ? 'left-3 sm:left-6' : 'right-3 sm:right-6'
      }`}
      data-pf-no-color-transition=""
      aria-label={direction === -1 ? 'Previous image' : 'Next image'}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`h-[38%] w-[38%] transition-transform duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          direction === -1 ? 'rotate-180 group-hover/lb:-translate-x-1' : 'group-hover/lb:translate-x-1'
        }`}
        data-pf-no-color-transition=""
      >
        <path d="M4 12h15" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </button>
  );

  return (
    <>
      <div ref={revealRef} className="w-full">
        {content}
      </div>
      {activeItem && presentation.lightboxEnabled
        ? createPortal(
            <motion.div
              className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label={activeItem.title}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setActiveItem(null);
              }}
            >
              {/* Counter, close and the two arrows are pinned to the viewport, not to the image:
                  an image-relative close button drifts off-screen on a tall portrait. */}
              {sortedItems.length > 1 ? (
                <span
                  className="pointer-events-none absolute left-5 top-5 z-[2] text-[0.68rem] font-medium uppercase tracking-[0.2em] tabular-nums text-white/70 sm:left-8 sm:top-8"
                  data-pf-no-color-transition=""
                >
                  {galleryIndexLabel(Math.max(0, lightboxIndex))}
                  <span className="text-white/35"> / {galleryIndexLabel(sortedItems.length - 1)}</span>
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="absolute right-4 top-4 z-[2] flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-[background-color,transform] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-8 sm:top-8"
                data-pf-no-color-transition=""
                aria-label="Close the gallery"
                autoFocus
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden className="h-[38%] w-[38%]">
                  <path d="M5 5 19 19M19 5 5 19" />
                </svg>
              </button>
              {sortedItems.length > 1 ? lightboxArrow(-1) : null}
              {sortedItems.length > 1 ? lightboxArrow(1) : null}
              <motion.div
                key={activeItem.id}
                className="relative flex max-h-[92vh] max-w-[96vw] flex-col items-center gap-5"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.985, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                {media(activeItem, true)}
                {presentation.showTitle && galleryItemDisplayTitle(activeItem.title) ? (
                  <p className="text-center text-sm font-medium text-white sm:text-base">
                    {galleryItemDisplayTitle(activeItem.title)}
                  </p>
                ) : null}
              </motion.div>
            </motion.div>,
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

function ArrowUpRight({
  className,
  style,
  noColorTransition = false,
}: {
  className?: string;
  style?: CSSProperties;
  noColorTransition?: boolean;
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
      {...(noColorTransition ? { 'data-pf-no-color-transition': '' } : {})}
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
  const query = `(min-width: ${px}px)`;
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** lg breakpoint (1024) — used to remap side nav / icon labels on small–mid screens. */
function usePortfolioLgUp() {
  return usePortfolioMinWidth(1024);
}

/** xl breakpoint (1280) — reserved for hero dual-column if JS gating is needed. */
function usePortfolioXlUp() {
  return usePortfolioMinWidth(1280);
}

/** True only for a genuine desktop/laptop pointer: wide viewport AND a persistent,
 * precise pointer (mouse/trackpad) with hover support. Width alone is not a reliable
 * "desktop" signal — large tablets (e.g. a 12.9" iPad in portrait is exactly 1024px
 * wide, wider still in landscape) would otherwise be misclassified as desktop. Used
 * to gate depth/parallax effects that are only legible with a hovering cursor and
 * should stay static on touch, regardless of how wide the touch screen is. */
export function usePortfolioFinePointerDesktop(minWidthPx = 1024) {
  const query = `(min-width: ${minWidthPx}px) and (hover: hover) and (pointer: fine)`;
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

type NavPresenceState = {
  /** Combined with display visibility — false when reveal mode is collapsed. */
  expanded: boolean;
  /** Opacity for hide/reveal chrome (hover/tap) — not used for dim mode. */
  chromeOpacity: number;
  /** Dim mode at rest: soften labels only; bar background stays opaque. */
  dimResting: boolean;
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
/** Foreground (labels/icons) opacity in discreet nav — shell background stays opaque. */
const DIM_FOREGROUND_OPACITY = 0.38;
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
    // Keep shell opaque — dim only menu foreground (see dimResting + CSS).
    chromeOpacity = 1;
  } else if (mode === 'hover' || mode === 'tap') {
    chromeOpacity = isRevealed || showHandle ? 1 : 0;
  }

  const dimResting = displayVisible && mode === 'dim' && !isDimActive;

  return {
    expanded: isRevealed,
    chromeOpacity,
    dimResting,
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
  contactPhone,
  contactEmail,
  avatarUrl,
  brandName,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  showColorModeToggle = false,
  colorMode = 'dark',
  onColorModeToggle,
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
  /** Profile phone — editorial bar tel: link. */
  contactPhone?: string | null;
  /** Profile email — editorial bar mailto: link. */
  contactEmail?: string | null;
  /** Profile avatar for mobile drawer brand (`mobileBrand: 'avatar'`). */
  avatarUrl?: string | null;
  /** Fallback word for mobile drawer brand when `mobileBrandWord` is empty. */
  brandName?: string;
  /** Global side gutters — aligns in-bar brand / CTA with hero and sections. */
  contentGutter?: PortfolioContentGutter;
  /** Global → Theme: show sun/moon control in the navigation bar. */
  showColorModeToggle?: boolean;
  colorMode?: 'light' | 'dark';
  onColorModeToggle?: () => void;
}) {
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
  const menuEntries = useMemo(
    () => resolveNavMenuEntries(sectionItems, settings.navMenuGroups ?? []),
    [sectionItems, settings.navMenuGroups]
  );
  const splitMenuRails = useMemo(
    () => splitNavMenuEntries(menuEntries, settings.splitNavLeftSectionKeys ?? []),
    [menuEntries, settings.splitNavLeftSectionKeys]
  );
  const sectionIds = useMemo(() => sectionItems.map((item) => item.id), [sectionItems]);
  const {
    activeId: spiedActiveId,
    lockForNavigation,
  } = usePortfolioSectionSpy(sectionIds, !isControlled);

  // Close reveal menus after choosing a page/section.
  const handleNavigate = (id: string, event?: ReactMouseEvent) => {
    presence.onInteract();
    setDrawerOpen(false);
    if (onNavigate) {
      onNavigate(id);
      return;
    }
    event?.preventDefault();
    if (scrollToPortfolioSection(id)) {
      lockForNavigation(id);
    }
  };
  const activeId = isControlled
    ? (controlledActiveId ?? sectionItems[0]?.id ?? items[0]?.id ?? '')
    : spiedActiveId;
  const innerRef = useRef<HTMLDivElement>(null);
  const navRootRef = useRef<HTMLElement>(null);

  const mobileChrome = resolvePortfolioNavMobileChrome(settings, isLgUp, isXlUp);
  const contentMode = mobileChrome.contentMode;
  const effectiveContentMode = portfolioNavEffectiveContentMode(contentMode);
  const effectivePlacement = mobileChrome.placement;
  const itemGap = mobileChrome.itemGap;
  const barWidth = mobileChrome.barWidth;
  const compact = mobileChrome.compact;
  const allowWrap = mobileChrome.allowWrap;
  const allowScroll = mobileChrome.allowScroll;
  const useDrawer = mobileChrome.useDrawer;
  const useBrandBar = mobileChrome.useBrandBar;
  const useMobileMenu = useDrawer || useBrandBar;
  const navPalette = useMemo(
    () => mergeNavPalette(DEFAULT_NAV_PALETTE, settings.navPalette),
    [settings.navPalette]
  );
  const effectiveBarBackground = useMemo(
    () => resolveNavBarSurfaceBackground(settings, navPalette),
    [
      settings.navBarSurface,
      settings.barBackgroundColor,
      settings.useNavPalette,
      settings.navPalette,
      navPalette,
    ]
  );
  const drawerPanelBackground = useMemo(
    () => resolveNavDrawerPanelBackground(settings, navPalette),
    [
      settings.navBarSurface,
      settings.barBackgroundColor,
      settings.useNavPalette,
      settings.navPalette,
      navPalette,
    ]
  );
  const navBarSurfaceTransparent = (settings.navBarSurface ?? 'neutre') === 'transparent';
  const navStrongTextColor = resolveHeroPaletteColor(navPalette, 'texteFort');
  const navNeutreColor = resolveHeroPaletteColor(navPalette, 'neutre');
  const navPageFillColor = resolveHeroPaletteColor(navPalette, 'fond');

  useEffect(() => {
    if (!useMobileMenu) setDrawerOpen(false);
  }, [useMobileMenu]);

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
    visible: useMobileMenu
      ? visible
      : visible &&
        presence.chromeOpacity > 0.05 &&
        (presence.expanded || presence.showHandle),
  });

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && menuEntries.length <= 1) return null;
  if (menuEntries.length === 0) return null;
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

  if (useMobileMenu) {
    const mobileBrand = settings.mobileBrand ?? 'none';
    const drawerSide = settings.mobileDrawerSide ?? 'right';
    const drawerLabelSizeClass = portfolioNavLabelFontSizeClass(settings.labelFontSize ?? 'sm', true);
    const brandWord =
      (settings.mobileBrandWord ?? '').trim() ||
      (brandName ?? '').trim() ||
      (settings.customExtraText ?? '').trim() ||
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
    const brandBarInk = settings.itemTextColor ?? navStrongTextColor;
    const brandBarLogoUrl = (settings.customExtraLogoUrl ?? '').trim();
    const brandBarText =
      (settings.customExtraText ?? '').trim() || (brandName ?? '').trim() || 'Logo';
    const brandBarSettings: PortfolioNavSettings = {
      ...settings,
      customExtraEnabled: true,
      customExtraDisplay: brandBarLogoUrl ? 'logo' : 'text',
      customExtraLogoUrl: brandBarLogoUrl,
      customExtraText: brandBarText,
      customExtraBackgroundColor: 'transparent',
      customExtraBorderEnabled: false,
      customExtraPaddingX: 0,
      customExtraPaddingY: 0,
      customExtraTextColor: brandBarInk,
      customExtraFontWeight: settings.customExtraFontWeight ?? 'semibold',
    };
    const brandEl = showAvatar ? (
      avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaImageSrc(avatarSrc, 32)}
          srcSet={mediaImageSrcSet(avatarSrc, 32)}
          alt=""
          decoding="async"
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
    const openMenuButton = (
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-expanded={drawerOpen}
        aria-controls="portfolio-nav-drawer"
        aria-label="Open navigation menu"
        className={
          useBrandBar
            ? 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition hover:bg-black/5'
            : `${handleChromeClass} h-11 w-11 min-h-11`
        }
        data-pf-no-color-transition=""
        style={useBrandBar ? { color: brandBarInk } : handleChromeStyle}
      >
        <NavMenuControlGlyph icon={menuControlIcon} />
      </button>
    );
    const drawerControls =
      menuControlAlign === 'right' ? (
        <>
          {brandEl}
          {openMenuButton}
        </>
      ) : (
        <>
          {openMenuButton}
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
          {useBrandBar ? (
            <div
              data-portfolio-nav-clearance-box
              className="pointer-events-auto flex w-full items-center justify-between gap-3 border-b px-4 py-3.5 sm:gap-4 sm:px-5"
              style={{
                backgroundColor: effectiveBarBackground,
                color: brandBarInk,
                borderColor: navBarSurfaceTransparent
                  ? 'transparent'
                  : `${settings.barBorderColor ?? '#e5e5e5'}55`,
                boxShadow: settings.barShadowEnabled !== false ? '0 1px 0 rgba(0,0,0,0.04)' : undefined,
              }}
            >
              <div className="min-w-0 flex-1">
                <PortfolioNavCenterBrand settings={brandBarSettings} compact />
              </div>
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <PortfolioNavColorModeToggleButton
                  settings={settings}
                  compact
                  overlayInteraction
                  inkColor={brandBarInk}
                />
                {openMenuButton}
              </div>
            </div>
          ) : (
            <div
              data-portfolio-nav-clearance-box
              className={`pointer-events-auto flex w-full items-center gap-2.5 px-3 py-2.5 ${barJustify}`}
            >
              {menuControlAlign === 'center' ? (
                <div className="inline-flex items-center gap-2.5">{drawerControls}</div>
              ) : (
                drawerControls
              )}
            </div>
          )}
        </nav>

        {drawerOpen ? (
          <div className="fixed inset-0 z-[225] isolate" role="presentation">
            <button
              type="button"
              className="absolute inset-0 z-0 bg-neutral-950/50 backdrop-blur-[2px] transition-opacity"
              aria-label="Close navigation menu"
              onClick={() => setDrawerOpen(false)}
            />
            <aside
              id="portfolio-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              className={`absolute top-0 z-10 flex h-full w-[min(18.5rem,86vw)] flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                drawerSide === 'left' ? 'left-0' : 'right-0'
              } ${
                drawerEntered
                  ? 'translate-x-0'
                  : drawerSide === 'left'
                    ? '-translate-x-full'
                    : 'translate-x-full'
              }`}
              style={{
                backgroundColor: drawerPanelBackground,
                color: settings.itemTextColor ?? '#525252',
                borderColor: navBarSurfaceTransparent
                  ? `${settings.barBorderColor ?? '#e5e5e5'}55`
                  : settings.barBorderColor ?? '#e5e5e5',
                borderLeftWidth:
                  drawerSide === 'right' && (settings.barBorderEnabled ?? true) && !navBarSurfaceTransparent
                    ? 1
                    : 0,
                borderRightWidth:
                  drawerSide === 'left' && (settings.barBorderEnabled ?? true) && !navBarSurfaceTransparent
                    ? 1
                    : 0,
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
                  data-pf-no-color-transition=""
                  style={handleChromeStyle}
                >
                  <NavMenuControlGlyph icon="x" expanded />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-6 pt-1">
                <ul className="flex flex-col gap-1.5">
                  {menuEntries.map((entry) => {
                    if (entry.type === 'group') {
                      return (
                        <li key={entry.id}>
                          <PortfolioNavMenuGroupDropdown
                            groupLabel={entry.label}
                            items={entry.items}
                            activeId={activeId}
                            isControlled={isControlled}
                            settings={settings}
                            contentMode={effectiveContentMode}
                            vertical
                            triggerClassName="hidden"
                            triggerStyle={{}}
                            allowScroll={false}
                            onNavigate={handleNavigate}
                            onInteract={presence.onInteract}
                          />
                        </li>
                      );
                    }

                    const item = entry.item;
                    const active = activeId === item.id;
                    const label = formatNavLabel(item.label, settings.labelCase);
                    const accent = settings.activeAccentColor ?? '#f97316';
                    const drawerHoverVars = portfolioNavItemHoverCssVars({
                      active,
                      backgroundColor: settings.itemBackgroundColor ?? '#ffffff',
                      borderColor: settings.itemBorderColor ?? '#e5e5e5',
                      iconColor: settings.itemIconColor ?? '#525252',
                      textColor: settings.itemTextColor ?? '#525252',
                      hoverIconColor: settings.itemHoverIconColor ?? accent,
                      hoverTextColor: settings.itemHoverTextColor ?? settings.itemTextColor ?? '#525252',
                      hoverBackgroundColor:
                        settings.itemHoverBackgroundColor ?? accent,
                      hoverBorderColor: settings.itemHoverBorderColor ?? accent,
                      borderEnabled: settings.itemBorderEnabled ?? true,
                      barBackgroundColor: drawerPanelBackground,
                      activeStyle: settings.activeStyle,
                    });
                    const drawerHoverClass = portfolioNavDrawerItemHoverClass(
                      active,
                      settings.activeStyle
                    );
                    return (
                      <li key={item.id}>
                        {isControlled ? (
                          <button
                            type="button"
                            onClick={() => handleNavigate(item.id)}
                            aria-current={active ? 'page' : undefined}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold transition ${drawerLabelSizeClass} ${drawerHoverClass}`}
                            style={
                              active
                                ? {
                                    backgroundColor: accent,
                                    color: '#ffffff',
                                  }
                                : {
                                    color: settings.itemTextColor ?? '#525252',
                                    ...drawerHoverVars,
                                  }
                            }
                          >
                            <span
                              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${active ? 'opacity-90' : 'opacity-85 transition-opacity duration-200 group-hover:opacity-100 group-hover:[color:var(--nav-item-hover-icon)]'}`}
                              data-pf-no-color-transition=""
                            >
                              <PortfolioNavIcon variant={item.icon} className="h-5 w-5" />
                            </span>
                            <span className={`min-w-0 flex-1 truncate ${active ? '' : 'transition-colors duration-200 group-hover:[color:var(--nav-item-hover-text)]'}`}>{label}</span>
                          </button>
                        ) : (
                          <a
                            href={`#${item.id}`}
                            aria-current={active ? 'page' : undefined}
                            onClick={(event) => handleNavigate(item.id, event)}
                            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold transition ${drawerLabelSizeClass} ${drawerHoverClass}`}
                            style={
                              active
                                ? {
                                    backgroundColor: accent,
                                    color: '#ffffff',
                                  }
                                : {
                                    color: settings.itemTextColor ?? '#525252',
                                    ...drawerHoverVars,
                                  }
                            }
                          >
                            <span
                              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${active ? 'opacity-90' : 'opacity-85 transition-opacity duration-200 group-hover:opacity-100 group-hover:[color:var(--nav-item-hover-icon)]'}`}
                              data-pf-no-color-transition=""
                            >
                              <PortfolioNavIcon variant={item.icon} className="h-5 w-5" />
                            </span>
                            <span className={`min-w-0 flex-1 truncate ${active ? '' : 'transition-colors duration-200 group-hover:[color:var(--nav-item-hover-text)]'}`}>{label}</span>
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
  const floatingPillLayout = portfolioNavUsesFloatingPillLayout(settings);
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
  const navBarHeight = settings.navBarHeight ?? 'md';
  const structuredBarHeightClass = portfolioNavBarHeightClass(navBarHeight, 'structured');
  const containerClass = portfolioNavBarContainerClass(
    settings.barDesign,
    navBarSurfaceTransparent ? false : settings.glassEffect,
    vertical,
    settings.barPadding ?? 'md',
    barWidth,
    navBarSurfaceTransparent ? false : (settings.barBorderEnabled ?? true),
    navBarSurfaceTransparent ? false : (settings.barShadowEnabled ?? true),
    settings.barBlurStrength ?? 'md',
    settings.barShadowStrength ?? 'md',
    navBarHeight
  );
  const shellStyle =
    settings.barDesign === 'dock'
      ? undefined
      : portfolioNavBarShellStyle(
          effectiveBarBackground,
          navBarSurfaceTransparent ? 'transparent' : settings.barBorderColor,
          navBarSurfaceTransparent ? false : settings.glassEffect,
          navBarSurfaceTransparent ? false : (settings.barBorderEnabled ?? true)
        );
  const dimShellStyle: CSSProperties | undefined =
    shellStyle && presence.dimResting && navBarSurfaceTransparent
      ? {
          ...shellStyle,
          backgroundColor: `${navNeutreColor}f2`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }
      : shellStyle;
  const itemBaseClass = portfolioNavItemBaseClass(
    settings.barDesign,
    effectiveContentMode,
    settings.buttonDesign,
    settings.labelCase,
    compact,
    vertical,
    settings.barThickness,
    settings.buttonPadding ?? 'md',
    settings.labelFontSize ?? 'sm',
    navBarHeight,
    settings.activeStyle
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
  const editorialBarLayout = portfolioNavUsesEditorialBarLayout(settings);
  const floatingPillShowsLogo =
    portfolioNavFloatingPillShowsLogo(settings);
  const floatingPillShowsContact = portfolioNavFloatingPillShowsContact(settings);
  const floatingPillHasRightColumn =
    floatingPillLayout &&
    (showColorModeToggle ||
      floatingPillShowsContact ||
      (showExpandedToggle && (menuControlAlign === 'right' || menuControlAlign === 'center')));
  const floatingPillGridColsClass =
    floatingPillShowsLogo && floatingPillHasRightColumn
      ? 'grid-cols-[auto_minmax(0,1fr)_auto]'
      : floatingPillShowsLogo
        ? 'grid-cols-[auto_minmax(0,1fr)]'
        : floatingPillHasRightColumn
          ? 'grid-cols-[minmax(0,1fr)_auto]'
          : 'grid-cols-[minmax(0,1fr)]';
  const centerLogoSplitLayout = portfolioNavUsesCenterLogoSplitLayout(settings);
  const effectiveButtonDesign = settings.buttonDesign;
  const structuredBarLayout = portfolioNavUsesStructuredBarLayout(settings);
  const inlineExtras =
    structuredBarLayout ||
    (anyFreeSideExtras && portfolioNavBarHostsInlineExtras(barWidth, effectivePlacement));
  const placementIsStart =
    effectivePlacement === 'top-left' || effectivePlacement === 'bottom-left';
  const placementIsEnd =
    effectivePlacement === 'top-right' || effectivePlacement === 'bottom-right';
  const placementIsCentered = !vertical && !placementIsStart && !placementIsEnd;
  const itemsGapClass = centerLogoSplitLayout
    ? portfolioNavTriZoneItemGapClass(itemGap, vertical)
    : portfolioNavItemGapClass(itemGap, vertical);
  const navContentGutterClass =
    !vertical && barWidth === 'full' ? portfolioEditorialGutterX(contentGutter) : '';
  const navUsesGlobalGutterInset = !vertical && barWidth === 'full';
  const innerBarLayoutClass =
    editorialBarLayout || centerLogoSplitLayout
      ? `grid w-full max-w-full items-center gap-x-3 sm:gap-x-4 ${structuredBarHeightClass} ${
          centerLogoSplitLayout
            ? 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] !grid'
            : 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'
        }`
      : floatingPillLayout
        ? `grid w-fit max-w-[calc(100vw-1.5rem)] ${floatingPillGridColsClass} items-center gap-x-4 sm:gap-x-6 lg:gap-x-8 !px-2 sm:!px-3 ${structuredBarHeightClass}`
        : innerWidthClass;

  const expandedToggleButton = showExpandedToggle ? (
    <button
      type="button"
      onClick={presence.onCollapse}
      aria-label="Hide navigation"
      title="Hide menu"
      className={`${handleChromeClass} h-10 w-10 min-h-10`}
      data-pf-no-color-transition=""
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
    : centerLogoSplitLayout
      ? 'w-full justify-items-stretch items-center'
    : placementIsStart
      ? 'justify-items-start items-center'
      : placementIsEnd
        ? 'justify-items-end items-center'
        : 'place-items-center';
  /** Full-width bars must stretch the fold stack — centering shrink-wraps and collapses free-space slots. */
  const foldStackWidthClass =
    !vertical && (barWidth === 'full' || editorialBarLayout || centerLogoSplitLayout) && !collapsedToHandle
      ? 'w-full'
      : '';
  const foldMotion =
    'transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform';

  const renderNavSectionItem = (item: NavItem, index: number, splitSide?: 'left' | 'right') => {
      const active = activeId === item.id;
      const menuAccentColor =
        editorialBarLayout || floatingPillLayout
          ? resolvePortfolioNavEditorialBarMenuAccentColor(settings, navPalette)
          : settings.activeAccentColor ?? '#f97316';
      const splitHeroBarHover =
        editorialBarLayout || centerLogoSplitLayout || floatingPillLayout;
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
        hoverIconColor:
          settings.itemHoverIconColor ??
          (splitHeroBarHover ? menuAccentColor : settings.activeAccentColor ?? '#e2572e'),
        hoverTextColor:
          settings.itemHoverTextColor ??
          (splitHeroBarHover ? menuAccentColor : '#f4f3ef'),
        hoverBackgroundColor:
          settings.itemHoverBackgroundColor ??
          (splitHeroBarHover ? menuAccentColor : settings.activeAccentColor ?? '#e2572e'),
        hoverBorderColor:
          settings.itemHoverBorderColor ??
          (splitHeroBarHover ? menuAccentColor : settings.activeAccentColor ?? '#e2572e'),
        borderEnabled: settings.itemBorderEnabled ?? true,
        barBackgroundColor: effectiveBarBackground,
        activeStyle: settings.activeStyle,
      });
      const itemHoverPresentation = editorialBarLayout
        ? portfolioNavEditorialBarItemHoverPresentation({
            active,
            activeStyle: settings.activeStyle,
            contentMode: effectiveContentMode,
          })
        : floatingPillLayout
          ? portfolioNavFloatingPillItemHoverPresentation({
              active,
              activeStyle: settings.activeStyle,
              contentMode: effectiveContentMode,
            })
          : centerLogoSplitLayout && splitSide
              ? portfolioNavCenterLogoSplitItemHoverPresentation({
                  active,
                  activeStyle: settings.activeStyle,
                  contentMode: effectiveContentMode,
                  splitSide,
                })
              : portfolioNavItemHoverPresentation({
                active,
                design: settings.barDesign,
                buttonDesign: effectiveButtonDesign,
                activeStyle: settings.activeStyle,
                contentMode: effectiveContentMode,
                vertical,
              });
      const isBottomLine = effectiveButtonDesign === 'bottom-line';
      const dockWithLabel =
        settings.barDesign === 'dock' && effectiveContentMode === 'both' && !isBottomLine;
      const activeAccentStyle = applyPortfolioNavEditorialBarActiveInk(
        portfolioNavActiveItemStyle({
          active,
          design: settings.barDesign,
          buttonDesign: effectiveButtonDesign,
          activeStyle: settings.activeStyle,
          accentColor: menuAccentColor,
          surfaceColor: navNeutreColor,
          strongTextColor: navStrongTextColor,
          pageFillColor: navPageFillColor,
          vertical,
        }),
        settings,
        navPalette,
        active
      );
      const usesFlatIndicator = portfolioNavUsesFlatMenuIndicatorLayout(settings.activeStyle);
      const usesIndicatorShell =
        usesFlatIndicator || settings.activeStyle === 'filled-pill';
      const itemShellStyle =
        isBottomLine && !active
          ? ({
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderStyle: 'solid' as const,
              ...itemHoverVars,
            } as CSSProperties)
          : dockWithLabel
          ? ({
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderStyle: 'solid' as const,
              ...(active ? {} : itemHoverVars),
            } as CSSProperties)
          : active
            ? usesIndicatorShell
              ? ({ ...activeAccentStyle, borderStyle: 'solid' as const } as CSSProperties)
              : { ...itemColors.shell, ...activeAccentStyle }
            : usesIndicatorShell
              ? ({
                  ...itemHoverVars,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                  borderStyle: 'solid',
                } as CSSProperties)
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
        active && activeAccentStyle?.color
          ? { color: activeAccentStyle.color }
          : !active &&
              !editorialBarLayout &&
              !centerLogoSplitLayout &&
              !floatingPillLayout &&
              (usesFlatIndicator || settings.activeStyle === 'filled-pill')
            ? { color: settings.itemTextColor ?? '#525252', opacity: 0.55 }
            : undefined;
      const accentColor = menuAccentColor;
      const usesTextIndicatorReserve = portfolioNavUsesTextIndicatorReserve(
        settings.activeStyle,
        effectiveContentMode
      );
      const textIndicatorReserveClass = portfolioNavTextIndicatorReserveClass(settings.activeStyle);
      const activeIndicatorSlot = portfolioNavActiveIndicatorSlot(settings.activeStyle, active);
      const activeIndicator = (() => {
        if (!active) return null;
        switch (activeIndicatorSlot) {
          case 'dot-below':
            return (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            );
          case 'dot-left':
            return (
              <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            );
          case 'underline-bar':
            return (
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            );
          case 'underline-animated':
            return (
              <span
                aria-hidden
                className="portfolio-nav-underline-animated pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            );
          default:
            return null;
        }
      })();
      const itemClassName = `${itemBaseClass} ${
        dockWithLabel
          ? ''
          : portfolioNavItemActiveClass(
              settings.barDesign,
              effectiveButtonDesign,
              settings.activeStyle,
              active,
              vertical
            )
      } ${portfolioNavItemHoverClass(
              active,
              effectiveButtonDesign,
              vertical,
              itemHoverPresentation
            )} ${usesTextIndicatorReserve ? '' : activeIndicatorSlot ? 'relative' : ''} ${allowScroll ? 'shrink-0' : ''}`.trim();
      const hoverDot =
        itemHoverPresentation.showHoverDot ? (
          <span
            aria-hidden
            className={itemHoverPresentation.hoverDotClass}
            style={{
              backgroundColor: accentColor,
            }}
          />
        ) : null;
      const itemContent =
        effectiveContentMode === 'icons' ? (
          <span
            className={portfolioNavItemHoverIconClass(active, itemHoverPresentation)}
            style={
              active && activeAccentStyle?.color ? { color: activeAccentStyle.color } : undefined
            }
          >
            <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
          </span>
        ) : effectiveContentMode === 'both' ? (
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
                  className={portfolioNavItemHoverIconClass(active, itemHoverPresentation)}
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
                className={`max-w-[4.5rem] truncate text-center leading-tight ${portfolioNavItemHoverTextClass(active, itemHoverPresentation)}`}
                style={activeTextStyle}
              >
                {label}
              </span>
            </>
          ) : (
            <>
              <span
                className={portfolioNavItemHoverIconClass(active, itemHoverPresentation)}
                style={
                  active && activeAccentStyle?.color
                    ? { color: activeAccentStyle.color }
                    : undefined
                }
              >
                <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
              </span>
              <span
                className={`text-center leading-tight ${portfolioNavItemHoverTextClass(active, itemHoverPresentation)}`}
                style={activeTextStyle}
              >
                {label}
              </span>
            </>
          )
        ) : usesTextIndicatorReserve ? (
            <span className={textIndicatorReserveClass}>
              <span
                className={portfolioNavItemHoverTextClass(active, itemHoverPresentation)}
                style={activeTextStyle}
              >
                {label}
              </span>
              {activeIndicator}
            </span>
          ) : (
            <span
              className={portfolioNavItemHoverTextClass(active, itemHoverPresentation)}
              style={activeTextStyle}
            >
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
              title={effectiveContentMode === 'icons' ? label : undefined}
              className={itemClassName}
              style={itemShellStyle}
            >
              {itemContent}
              {usesTextIndicatorReserve ? null : activeIndicator}
              {hoverDot}
            </button>
          ) : (
            <a
              href={`#${item.id}`}
              aria-label={label}
              title={effectiveContentMode === 'icons' ? label : undefined}
              className={itemClassName}
              style={itemShellStyle}
              onClick={(event) => handleNavigate(item.id, event)}
            >
              {itemContent}
              {usesTextIndicatorReserve ? null : activeIndicator}
              {hoverDot}
            </a>
          )}
        </Fragment>
      );
  };

  const renderNavSectionButtonsForEntries = (
    entries: typeof menuEntries,
    indexOffset = 0,
    splitSide?: 'left' | 'right'
  ) =>
    entries.map((entry, index) => {
      const globalIndex = indexOffset + index;
      if (entry.type === 'group') {
        const groupActive = entry.items.some((child) => child.id === activeId);
        const groupActiveStyle = groupActive
          ? resolvePortfolioNavMenuGroupActiveStyle(settings, navPalette)
          : null;
        const triggerClassName = `${itemBaseClass} ${portfolioNavItemHoverClass(
          groupActive,
          settings.buttonDesign,
          vertical
        )} ${allowScroll ? 'shrink-0' : ''}`.trim();
        const triggerStyle: CSSProperties = groupActive
          ? {
              backgroundColor: groupActiveStyle?.backgroundColor,
              color: groupActiveStyle?.color,
              borderWidth: 0,
              borderStyle: 'solid',
            }
          : {
              color: settings.itemTextColor ?? '#525252',
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderStyle: 'solid',
            };

        return (
          <Fragment key={entry.id}>
            {showRailDividers && globalIndex > 0 ? (
              <span className={portfolioNavRailDividerClass(vertical)} aria-hidden />
            ) : null}
            <PortfolioNavMenuGroupDropdown
              groupLabel={entry.label}
              items={entry.items}
              activeId={activeId}
              isControlled={isControlled}
              settings={settings}
              contentMode={effectiveContentMode}
              vertical={vertical}
              triggerClassName={triggerClassName}
              triggerStyle={triggerStyle}
              allowScroll={allowScroll}
              onNavigate={handleNavigate}
              onInteract={presence.onInteract}
            />
          </Fragment>
        );
      }

      return renderNavSectionItem(entry.item, globalIndex, splitSide);
    });

  const renderNavSectionButtons = () => renderNavSectionButtonsForEntries(menuEntries);

  const splitNavScrollClass = allowScroll
    ? 'min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overflow-y:visible]'
    : '';

  return createPortal(
    <PortfolioNavColorModeToggleProvider
      show={showColorModeToggle}
      colorMode={colorMode}
      onToggle={() => onColorModeToggle?.()}
    >
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
            data-pf-no-color-transition=""
          >
            {showMenuIcon ? <NavMenuControlGlyph icon={menuControlIcon} /> : null}
            {showMenuText ? (
              <span className="text-xs font-bold uppercase tracking-[0.14em]">Menu</span>
            ) : null}
          </button>

          <div
            ref={innerRef}
            className={`${foldMotion} col-start-1 row-start-1 ${innerBarLayoutClass} ${containerClass} ${
              centerLogoSplitLayout ? '!rounded-none !border-0 !shadow-none !overflow-visible' : ''
            } ${
              editorialBarLayout || floatingPillLayout ? '!overflow-visible' : ''
            } ${
              inlineExtras && !structuredBarLayout ? '!justify-start' : ''
            } ${navContentGutterClass} ${
              presence.dimResting ? 'portfolio-nav-dim-rest' : ''
            } ${
              presence.expanded
                ? 'relative z-0 translate-x-0 translate-y-0 scale-100 opacity-100 delay-75'
                : `pointer-events-none absolute z-0 delay-0 ${foldExitClass}`
            }`}
            style={{
              ...dimShellStyle,
              ...(presence.dimResting
                ? ({
                    ['--portfolio-nav-dim-foreground-opacity' as string]: String(
                      DIM_FOREGROUND_OPACITY
                    ),
                  } as CSSProperties)
                : null),
            }}
            aria-hidden={!presence.expanded}
          >
          {centerLogoSplitLayout ? (
            <>
              <div className="flex w-full min-w-0 items-center justify-start justify-self-stretch gap-2">
                {menuControlAlign === 'left' ? expandedToggleButton : null}
                <div
                  className={`flex min-w-0 items-center justify-start ${itemsGapClass} ${splitNavScrollClass}`}
                >
                  {renderNavSectionButtonsForEntries(splitMenuRails.left, 0, 'left')}
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-center justify-self-center px-2 sm:px-3">
                <PortfolioNavCenterBrand settings={settings} compact />
              </div>
              <div className="flex w-full min-w-0 items-center justify-end justify-self-stretch gap-2">
                <div
                  className={`flex min-w-0 items-center justify-end ${itemsGapClass} ${splitNavScrollClass}`}
                >
                  {renderNavSectionButtonsForEntries(
                    splitMenuRails.right,
                    splitMenuRails.left.length,
                    'right'
                  )}
                </div>
                <PortfolioNavColorModeToggleButton settings={settings} compact />
                {menuControlAlign === 'right' || menuControlAlign === 'center'
                  ? expandedToggleButton
                  : null}
              </div>
            </>
          ) : editorialBarLayout ? (
            <>
              <div className="flex min-w-0 items-center justify-self-start gap-2">
                {menuControlAlign === 'left' ? expandedToggleButton : null}
                <PortfolioNavCenterBrand settings={settings} compact />
              </div>
              <div
                className={`flex min-w-0 items-center justify-center justify-self-center ${itemsGapClass} ${splitNavScrollClass}`}
              >
                {renderNavSectionButtons()}
              </div>
              <div className="flex min-w-0 items-center justify-end justify-self-end gap-2">
                <PortfolioNavEditorialRightSlot
                  settings={settings}
                  links={chromeLinks}
                  contactHref={contactHref}
                  contactPhone={contactPhone}
                  contactEmail={contactEmail}
                  onContactNavigate={onContactNavigate}
                  compact
                />
                {menuControlAlign === 'right' || menuControlAlign === 'center'
                  ? expandedToggleButton
                  : null}
              </div>
            </>
          ) : floatingPillLayout ? (
            <>
              {floatingPillShowsLogo ? (
                <div className="flex min-w-0 items-center justify-self-start">
                  <PortfolioNavCenterBrand settings={settings} compact />
                </div>
              ) : null}
              <div
                className={`flex min-w-0 items-center justify-center justify-self-center overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overflow-y:visible] ${itemsGapClass}`}
              >
                {renderNavSectionButtons()}
              </div>
              {floatingPillHasRightColumn ? (
                <div className="flex min-w-0 items-center justify-end justify-self-end gap-2">
                  <PortfolioNavFloatingPillRightSlot
                    settings={settings}
                    contactHref={contactHref}
                    onContactNavigate={onContactNavigate}
                    compact
                  />
                  {menuControlAlign === 'right' || menuControlAlign === 'center'
                    ? expandedToggleButton
                    : null}
                </div>
              ) : null}
            </>
          ) : (
            <>
          {inlineExtras ? (
            <div
              className={`flex min-w-0 items-center gap-2 ${
                structuredBarLayout
                  ? 'justify-self-start'
                  : placementIsCentered || placementIsEnd
                    ? 'flex-1'
                    : 'shrink-0'
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
            } ${
              structuredBarLayout
                ? 'min-w-0 justify-center justify-self-center'
                : inlineExtras || adjacentExtras
                  ? 'shrink-0'
                  : 'contents'
            } ${
              (inlineExtras || adjacentExtras) && allowScroll
                ? 'min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [overflow-y:visible]'
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
          {renderNavSectionButtons()}
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
                structuredBarLayout
                  ? 'justify-self-end'
                  : placementIsCentered || placementIsStart
                    ? 'flex-1'
                    : 'shrink-0'
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
          ) : showColorModeToggle || menuControlAlign === 'right' || menuControlAlign === 'center' ? (
            <div className="flex shrink-0 items-center justify-end gap-2">
              <PortfolioNavColorModeToggleButton settings={settings} compact />
              {menuControlAlign === 'right' || menuControlAlign === 'center'
                ? expandedToggleButton
                : null}
            </div>
          ) : null}
            </>
          )}
      </div>
        </div>
      </div>
    </nav>
      {!inlineExtras &&
      !editorialBarLayout &&
      !centerLogoSplitLayout &&
      !floatingPillLayout ? (
        <PortfolioNavFreeSpaceLinks
          settings={settings}
          links={chromeLinks}
          monochrome={monochrome}
          contactHref={contactHref}
          onContactNavigate={onContactNavigate}
          navRevealed={presence.expanded}
          contentGutter={contentGutter}
          useGlobalGutterInset={navUsesGlobalGutterInset}
          onMouseEnter={presence.onMouseEnter}
          onMouseLeave={presence.onMouseLeave}
          onFocusCapture={presence.onFocusCapture}
          onBlurCapture={presence.onBlurCapture}
        />
      ) : null}
    </>
    </PortfolioNavColorModeToggleProvider>,
    document.body
  );
}

function EditorialWorkCard({
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
                <Link href={href} className="transition hover:opacity-80" data-pf-no-color-transition="">
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
          <Link href={href} className="transition hover:opacity-80" data-pf-no-color-transition="">
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
            <Link href={href} className="transition hover:opacity-80" data-pf-no-color-transition="">
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
          data-pf-no-color-transition=""
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
      data-pf-no-color-transition=""
      style={{
        color: cta,
        borderColor: `color-mix(in srgb, ${cta} 40%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${cta} 10%, transparent)`,
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition duration-300 group-hover:opacity-100"
        data-pf-no-color-transition=""
        style={{ backgroundColor: `color-mix(in srgb, ${cta} 22%, transparent)` }}
        aria-hidden
      />
      <ArrowUpRight
        className="relative h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-[1.125rem] sm:w-[1.125rem]"
        noColorTransition
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
              data-pf-no-color-transition=""
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
      data-pf-no-color-transition=""
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
      data-pf-no-color-transition=""
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
                      data-pf-no-color-transition=""
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
                      data-pf-no-color-transition=""
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
                    data-pf-no-color-transition=""
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

export function useServicesOrderCtaNav(): ServicesOrderCtaNav {
  const value = useContext(ServicesOrderCtaHrefContext);
  return value.href ? value : { href: '#contact', onNavigate: value.onNavigate };
}

export function handleServicesOrderCtaClick(
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
    scrollToPortfolioSection(href.slice(1));
  }
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

function EditorialFaqItem({
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
  const plainExpandIcon = design === 'two-column';
  const isCard = faqIsCardDesign(design);
  const shellClass = faqItemShellClass(design, presentation.itemGap);
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
    ...(design === 'two-column' ? { weight: 'semibold' as const, bold: false } : {}),
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
      taskBulletSize: presentation.itemMarkerSize ?? 'sm',
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
  const openQuestionColor = openFill ? '#ffffff' : undefined;
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
          ? { color: openFill ? '#ffffff' : presentation.expandIconColor }
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
}: {
  items: FaqItem[];
  presentation?: PortfolioFaqPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
  askCtaHref?: string;
  askCtaLabel?: string;
  updatedLabel?: string | null;
}) {
  const [exclusiveOpenId, setExclusiveOpenId] = useState<string | null>(null);
  const exclusive = presentation.expandable !== false && presentation.accordionExclusive === true;

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
  const showIllustration = illustrationVariant !== 'none';
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
      className={faqListShellClass(presentation.itemDesign, presentation.itemGap)}
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
          data-pf-no-color-transition=""
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

  if (!showIllustration) return framedList;

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
          <div className="min-w-0">{framedList}</div>
        </>
      ) : (
        <>
          <div className="min-w-0">{framedList}</div>
          {illustration}
        </>
      )}
    </div>
  );
}

function SideInfoCard({
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
    <div className={`${placement.icon} ${iconWrapClass}`.trim()} data-pf-no-color-transition="" style={iconWrapStyle} aria-hidden>
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

type EditorialSideInfoItem = {
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
    const markerSize = presentation.sidePanelMarkerSize ?? 'sm';
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
  const glyphClass = contactIconGlyphClass(presentation.iconSize ?? 'sm');
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
    <div className={contactItemsLayoutClass(presentation.cardDesign, presentation.itemGap ?? 'sm')}>
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
    : contactIconGlyphClass(presentation.iconSize ?? 'sm');
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
            data-pf-no-color-transition=""
            style={shellStyle}
          >
            {iconNode}
          </a>
        );
      })}
    </nav>
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
  const glyphClass = contactIconGlyphClass(presentation.iconSize ?? 'sm');
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
  heroImageUrl,
  heroImageAlt,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  globalColorMode = 'dark',
  membersOnlyNode,
  renderSocialIcon,
  socialBrandClass,
  sectionTitle,
  sectionSubtitle,
  presentation = DEFAULT_CONTACT_PRESENTATION,
  titleTypographyClass,
  titleTypographyStyle,
  subtitleTypographyClass,
  subtitleTypographyStyle,
  suppressBackground = false,
  motionProfile = DEFAULT_MOTION_PROFILE,
  topSpacingClass = 'pt-12 sm:pt-16 lg:pt-20',
  topSpacingStyle,
  bottomSpacingClass = 'pb-12 sm:pb-16 lg:pb-20',
  bottomSpacingStyle,
}: {
  creatorId?: string;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  ctaHref: string;
  ctaLabel?: string;
  responseTimeLabel?: string | null;
  /** Real creator photo for "Sequential reveal"'s clip-path hero image (falls back to initials). */
  heroImageUrl?: string | null;
  heroImageAlt?: string;
  /** Same site-wide editorial gutter every other section uses — premium full-bleed designs
   *  don't go through `PortfolioSectionShell` (which applies this automatically), so they need
   *  it passed in explicitly to line their own content up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
  /** The portfolio's real active appearance (settings.global.colorMode) — every premium
   *  Contact design mirrors it now (pure white / pure black canvas, synced text). */
  globalColorMode?: 'light' | 'dark';
  membersOnlyNode?: React.ReactNode;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  sectionTitle?: string;
  sectionSubtitle?: React.ReactNode;
  presentation?: PortfolioContactPresentationSettings;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  /** When a global solid is active, sections without their own fill stay clear; an enabled section fill paints on top. */
  suppressBackground?: boolean;
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Global padding-top above the section title. */
  topSpacingClass?: string;
  /** Optional CSS vars for Split screen px fine-tune. */
  topSpacingStyle?: React.CSSProperties;
  /** Global padding-bottom below section content. */
  bottomSpacingClass?: string;
  bottomSpacingStyle?: React.CSSProperties;
}) {
  const contactFontScale = contactPremiumFontScale(presentation.premiumFontSize);
  const contactSectionStyle = {
    ...topSpacingStyle,
    ...bottomSpacingStyle,
    '--pf-contact-font-scale': contactFontScale,
  } as CSSProperties;
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

  // Header — one shared, GSAP-animated header (chosen from 8 editorial layouts, same
  // mechanism as Portfolio/Work, Stack, and Tools). Count = visible contact methods
  // (email/phone/location) + visible social links, used by 3 of the 8 designs.
  const contactHeaderItemCount =
    [visibleEmail, visiblePhone, visibleLocation].filter((value) => Boolean(value?.trim())).length +
    visibleLinks.length;
  const contactHeaderProps = {
    title: resolvedTitle,
    subtitle: typeof sectionSubtitle === 'string' ? sectionSubtitle : undefined,
    presentation,
    itemCount: contactHeaderItemCount,
  };
  const renderContactHeader = () =>
    presentation.headerDesign === 'marquee' ? (
      <ContactHeaderMarqueeHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'index' ? (
      <ContactHeaderIndexHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'accent-count' ? (
      <ContactHeaderAccentCountHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'serif-lead' ? (
      <ContactHeaderSerifLeadHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'billboard' ? (
      <ContactHeaderBillboardHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'masthead' ? (
      <ContactHeaderMastheadHeader {...contactHeaderProps} />
    ) : presentation.headerDesign === 'split-heading' ? (
      <ContactHeaderSplitHeadingHeader {...contactHeaderProps} />
    ) : (
      <ContactHeaderEditorialHeader {...contactHeaderProps} />
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

  // Premium, full-bleed designs — each owns its whole composition (no card, no form);
  // the black canvas and internal padding live inside the design component itself, but
  // the global Section spacing setting still applies as extra padding on the wrapping
  // <section>, same as every other section on the page, keyed by presentation.cardDesign.
  // The Background tab's fill paints on this wrapping <section> itself (full-bleed, behind
  // everything, `position:relative` + `inset-0`) rather than on the design's own inner root —
  // that inner root only spans the space *between* the section's top/bottom spacing padding,
  // so painting there left that padding showing the page wallpaper instead of this section's
  // own background. Same fix shape as `PortfolioSectionShell`'s bgStyle layer.
  // General → Photo replaces the profile photo in every premium design that shows one.
  const contactPhotoUrl = presentation.photoUrl?.trim() || heroImageUrl || null;

  const contactBackgroundLayer = bgStyle ? (
    <div
      aria-hidden
      className="pf-theme-layer pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
      style={bgStyle}
    />
  ) : null;

  if (presentation.cardDesign === 'editorial-focus') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignEditorialFocus
            layout={createContactDesignLayoutResolver(presentation, 'editorial-focus')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            ctaHref={ctaHref}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'split-grid') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignSplitGrid
            layout={createContactDesignLayoutResolver(presentation, 'split-grid')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'liquid-distortion') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignLiquidDistortion
            layout={createContactDesignLayoutResolver(presentation, 'liquid-distortion')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'sequential-reveal') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignSequentialReveal
            layout={createContactDesignLayoutResolver(presentation, 'sequential-reveal')}
            creatorId={creatorId}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            presentation={presentation}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'studio-overlap') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignStudioOverlap
            layout={createContactDesignLayoutResolver(presentation, 'studio-overlap')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'borderless-grid') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignBorderlessGrid
            layout={createContactDesignLayoutResolver(presentation, 'borderless-grid')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'broken-grid') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignBrokenGrid
            layout={createContactDesignLayoutResolver(presentation, 'broken-grid')}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'numbered-narrative') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignNumberedNarrative
            layout={createContactDesignLayoutResolver(presentation, 'numbered-narrative')}
            creatorId={creatorId}
            email={visibleEmail}
            phone={visiblePhone}
            locationLabel={visibleLocation}
            links={visibleLinks}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            presentation={presentation}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

  if (presentation.cardDesign === 'magnetic-overlap') {
    return (
      <section
        id="contact"
        style={contactSectionStyle}
        className={`relative ${topSpacingClass} ${bottomSpacingClass}`}
      >
        {contactBackgroundLayer}
        <div className="relative z-[1]">
          <ContactDesignMagneticOverlap
            layout={createContactDesignLayoutResolver(presentation, 'magnetic-overlap')}
            email={visibleEmail}
            phone={visiblePhone}
            links={visibleLinks}
            heroImageUrl={contactPhotoUrl}
            heroImageAlt={heroImageAlt ?? ''}
            sectionTitle={sectionTitle}
            contentGutter={contentGutter}
            colorMode={globalColorMode}
          />
        </div>
      </section>
    );
  }

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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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

    const deskHeader = <div className="relative z-[1] w-full">{renderContactHeader()}</div>;

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
                        className={contactIconGlyphClass(presentation.iconSize ?? 'sm')}
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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
                                data-pf-no-color-transition=""
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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
                          data-pf-no-color-transition=""
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
                        data-pf-no-color-transition=""
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
                        data-pf-no-color-transition=""
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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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

    const editorialHeader = <div className="relative z-[1] w-full">{renderContactHeader()}</div>;

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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
        {withContactIllustration(editorialBody)}
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

    const directoryHeader = <div className="relative z-[1] w-full">{renderContactHeader()}</div>;

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
        style={contactSectionStyle}
        className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
        {withContactIllustration(directoryBody)}
      </section>
    );
  }

  const contactAside =
    presentation.sectionLayout === 'aside-left' || presentation.sectionLayout === 'aside-right';
  const header = (
    <div className={`relative z-[1] ${contactAside ? 'w-full' : ''}`}>{renderContactHeader()}</div>
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
      style={contactSectionStyle}
      className={`relative isolate ${portfolioNavTopScrollMarginClass()} ${topSpacingClass} ${bottomSpacingClass}`}
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
      {contactAside ? (
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

/**
 * "Contact CTA" (design `minimal`) interactive body — borderless two-column layout (no central
 * rule, no icon chips). Bio, location/phone/email, and social icons render at full, plain
 * opacity at all times; hovering a link or social icon only brightens that element itself
 * (`hover:opacity-70`), never any other line in the composition. No hardcoded closing
 * copyright line either — that bar was extracted into the shared Mini bar catalog's own
 * "Contact CTA" variant (see footer-minibar-catalog-extraction memory), toggled on
 * separately via Footer > Design > "Mini bar" rather than being always-on here.
 */
function FooterContactCtaBody({
  creatorName,
  showBrand,
  brandClass,
  brandStyle,
  bio,
  descriptionClass,
  descriptionStyle,
  ctaRow,
  contactItems,
  contactLineClass,
  contactLineStyle,
  socialLinks,
  iconStyle,
  avatarUrl,
  showAvatar,
}: {
  creatorName: string;
  showBrand: boolean;
  brandClass: string;
  brandStyle: CSSProperties;
  bio: string | null;
  descriptionClass: string;
  descriptionStyle: CSSProperties;
  ctaRow: ReactNode;
  contactItems: { id: string; label: string; href?: string }[];
  contactLineClass: string;
  contactLineStyle: CSSProperties;
  socialLinks: EditorialContactLink[];
  iconStyle: CSSProperties;
  /** Optional portrait filling the wide empty gap on the right at desktop widths —
   *  opt-in via the existing site-wide "Avatar" content-visibility toggle, same one
   *  the other Footer designs (e.g. Centered minimal) already read. */
  avatarUrl?: string | null;
  showAvatar?: boolean;
}) {
  const showPortrait = Boolean(showAvatar && avatarUrl);

  const cleanBrandClass = brandClass.replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '').trim();
  const cleanDescriptionClass = descriptionClass.replace(/\bfont-(?:bold|medium)\b/g, '').trim();
  const cleanContactLineClass = contactLineClass
    .replace(/\bfont-(?:bold|medium|normal|semibold)\b/g, '')
    .trim();

  return (
    <div className="flex min-w-0 flex-col gap-10 sm:gap-12">
      <div
        className={`grid w-full grid-cols-1 gap-10 lg:items-start lg:gap-16 xl:gap-24 ${
          showPortrait ? 'lg:grid-cols-[1.1fr_1fr_auto]' : 'lg:grid-cols-2'
        }`}
      >
        <div className="min-w-0 space-y-6 text-left sm:space-y-7 lg:pr-8 xl:pr-12">
          {showBrand ? (
            <p className={`tracking-tight font-semibold ${cleanBrandClass}`} style={{ ...brandStyle, fontWeight: 600 }}>
              {creatorName}
            </p>
          ) : null}
          {bio ? (
            <p
              data-pf-no-color-transition=""
              className={`text-pretty ${cleanDescriptionClass}`}
              style={{
                ...descriptionStyle,
                fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                lineHeight: 1.6,
              }}
            >
              {bio}
            </p>
          ) : null}
          {ctaRow ? (
            <div data-pf-no-color-transition="" className="inline-flex w-fit [&_a]:!font-semibold">
              {ctaRow}
            </div>
          ) : null}
        </div>

        {contactItems.length > 0 || socialLinks.length > 0 ? (
          <div className="flex min-w-0 flex-col items-start gap-8 text-left">
            {contactItems.length > 0 ? (
              <ul className="flex w-full max-w-md flex-col items-start gap-6">
                {contactItems.map((item) =>
                  item.href ? (
                    <li key={item.id} className="w-full">
                      <a
                        href={item.href}
                        data-pf-no-color-transition=""
                        className={`inline-block text-pretty transition-opacity duration-300 hover:opacity-70 ${cleanContactLineClass} font-semibold`}
                        style={{
                          ...contactLineStyle,
                          fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.id} className="w-full">
                      <span
                        data-pf-no-color-transition=""
                        className={`inline-block text-pretty ${cleanContactLineClass} font-semibold`}
                        style={{
                          ...contactLineStyle,
                          fontSize: 'calc(var(--pf-footer-body-size) * var(--pf-footer-font-scale, 1))',
                        }}
                      >
                        {item.label}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : null}

            {socialLinks.length > 0 ? (
              <nav className="flex flex-wrap items-center gap-6" aria-label="Social">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    data-pf-no-color-transition=""
                    className="inline-flex items-center justify-center transition-opacity duration-300 hover:opacity-70"
                    style={iconStyle}
                  >
                    <FooterSocialLinkIcon link={link} bare iconClassName="h-5 w-5" />
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        ) : null}

        {showPortrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...mediaImageResponsive(avatarUrl!, [384, 640])}
            sizes="(min-width: 1280px) 288px, 256px"
            alt=""
            loading="lazy"
            decoding="async"
            className="hidden aspect-[4/5] w-full max-w-[19rem] shrink-0 rounded-[1.5rem] object-cover lg:block lg:w-64 xl:w-72"
          />
        ) : null}
      </div>
    </div>
  );
}

export function EditorialPortfolioFooter({
  creatorName,
  creatorId,
  avatarUrl: profileAvatarUrl,
  bio,
  email,
  phone,
  locationLabel,
  hoursLabel,
  profileVisits: _profileVisits,
  links,
  contentClassName,
  presentation = DEFAULT_FOOTER_PRESENTATION,
  transparentBase = false,
  contactHref = '#footer',
  motionProfile = DEFAULT_MOTION_PROFILE,
  bottomClearanceClass,
  sectionLinkOptions,
  sectionPalette,
  globalColorMode = 'dark',
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
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
  /** Sections currently visible on the page (nav order + labels) — each design's Layout
   *  settings pick which of these its links column shows. */
  sectionLinkOptions?: PortfolioFooterSectionLinkOption[];
  /** Footer's own resolved palette (honors its light/dark override) — for designs that let the
   *  creator pick a palette token (e.g. Inverted wordmark's wordmark color). */
  sectionPalette?: Partial<Record<FooterInkToken, string>>;
  /** Resolved active color mode (Global → Theme, honoring the section's own override) — the
   *  premium full-bleed designs (Monumental's siblings) branch their literal colors on this
   *  instead of reading the shared CSS palette tokens. */
  globalColorMode?: 'light' | 'dark';
  /** IANA timezone id (profile.timezoneId) — only consumed by the Timezone editorial design. */
  timezoneId?: string | null;
  /** Site-wide editorial gutter (settings.global.contentGutter) — the full-bleed premium
   *  designs bypass the legacy shell, so this is threaded in explicitly wherever one of them
   *  needs to line its own horizontal padding up with the rest of the page. */
  contentGutter?: PortfolioContentGutter;
}) {
  // Every design below used to hardcode its own solid black/white canvas, silently ignoring
  // this section's own Background tab. None of them own a background by default anymore —
  // `sectionBackgroundStyle` already returns `undefined` (transparent) when the Background
  // tab is off, so the page/global wallpaper shows through until the user explicitly turns
  // this section's background on.
  const footerBackgroundStyle = sectionBackgroundStyle(presentation);
  // Multiplies every Footer design's own standardized body/label text sizes via a shared
  // `--pf-footer-font-scale` CSS custom property — see General tab's "Font size" control.
  const footerFontSizeScale = footerPremiumFontScale(presentation.premiumFontSize);
  // General → Photo replaces the profile photo in every design that shows one.
  const avatarUrl = presentation.photoUrl?.trim() || profileAvatarUrl;
  const footerLayout = createFooterDesignLayoutResolver(presentation, presentation.design);
  const footerNavLinks = resolveFooterSectionNavLinks(presentation, presentation.design, sectionLinkOptions);
  const footerNavLinkItems = footerNavLinks.map((link) => ({
    id: link.id,
    label: link.label,
    url: resolveFooterLinkHref(link.href, creatorId),
  }));

  if (presentation.design === 'monumental') {
    return (
      <FooterDesignMonumental
        creatorName={creatorName}
        creatorId={creatorId}
        email={email ?? null}
        phone={phone ?? null}
        locationLabel={locationLabel ?? null}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'compact') {
    return (
      <FooterDesignCompact
        creatorName={creatorName}
        creatorId={creatorId}
        bio={bio}
        email={email ?? null}
        phone={phone ?? null}
        locationLabel={locationLabel ?? null}
        links={links}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'centered-minimal') {
    return (
      <FooterDesignCenteredMinimal
        creatorName={creatorName}
        creatorId={creatorId}
        avatarUrl={avatarUrl}
        email={email}
        phone={phone}
        locationLabel={locationLabel}
        hoursLabel={hoursLabel}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'landing') {
    return (
      <FooterDesignLanding
        creatorName={creatorName}
        creatorId={creatorId}
        avatarUrl={avatarUrl}
        bio={bio}
        email={email}
        phone={phone}
        locationLabel={locationLabel}
        hoursLabel={hoursLabel}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (presentation.design === 'contact-card') {
    return (
      <FooterDesignContactCard
        creatorName={creatorName}
        creatorId={creatorId}
        email={email ?? null}
        phone={phone ?? null}
        locationLabel={locationLabel ?? null}
        links={links}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        presentation={presentation}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

  if (
    presentation.design === 'hero-columns' ||
    presentation.design === 'split-form' ||
    presentation.design === 'timezone-editorial' ||
    presentation.design === 'inverted-wordmark' ||
    presentation.design === 'services-reveal' ||
    presentation.design === 'editorial-grid' ||
    presentation.design === 'headline-reveal' ||
    presentation.design === 'dispatch'
  ) {
    const premiumCopyrightText = presentation.showCopyright
      ? resolveFooterCopyrightLabel(presentation.copyrightLabel, creatorName)
      : '';
    const premiumContactHref = contactHref ?? '#footer';

    if (presentation.design === 'hero-columns') {
      return (
        <FooterDesignHeroColumns
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          bio={bio}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'split-form') {
      return (
        <FooterDesignSplitForm
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          bio={bio}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          hoursLabel={hoursLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'timezone-editorial') {
      return (
        <FooterDesignTimezoneEditorial
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          email={email}
          phone={phone}
          links={links}
          layout={footerLayout}
          copyrightText={premiumCopyrightText}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'inverted-wordmark') {
      return (
        <FooterDesignInvertedWordmark
          creatorName={creatorName}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          links={links}
          email={email}
          phone={phone}
          colorMode={globalColorMode}
          palette={sectionPalette}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'editorial-grid') {
      return (
        <FooterDesignEditorialGrid
          creatorName={creatorName}
          creatorId={creatorId}
          avatarUrl={avatarUrl}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          contactHref={premiumContactHref}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'headline-reveal') {
      return (
        <FooterDesignHeadlineReveal
          creatorName={creatorName}
          creatorId={creatorId}
          bio={bio}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          copyrightText={premiumCopyrightText}
          contactHref={premiumContactHref}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    if (presentation.design === 'dispatch') {
      return (
        <FooterDesignDispatch
          creatorName={creatorName}
          creatorId={creatorId}
          email={email}
          phone={phone}
          locationLabel={locationLabel}
          links={links}
          navLinks={footerNavLinkItems}
          layout={footerLayout}
          colorMode={globalColorMode}
          contentGutter={contentGutter}
          backgroundStyle={footerBackgroundStyle}
          fontSizeScale={footerFontSizeScale}
        />
      );
    }

    return (
      <FooterDesignServicesReveal
        creatorName={creatorName}
        email={email}
        phone={phone}
        locationLabel={locationLabel}
        navLinks={footerNavLinkItems}
        layout={footerLayout}
        links={links}
        colorMode={globalColorMode}
        contentGutter={contentGutter}
        backgroundStyle={footerBackgroundStyle}
        fontSizeScale={footerFontSizeScale}
      />
    );
  }

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
  const elementStyles = normalizeFooterElementStyles(presentation.elementStyles, presentation);
  const brandClass = elementTextStyleClass(elementStyles.brand, 'title');
  const brandStyle = elementTextInlineStyle(elementStyles.brand);
  const descriptionClass = elementTextStyleClass(elementStyles.description, 'body');
  const descriptionStyle = elementTextInlineStyle(elementStyles.description);
  const columnHeadingStyleBase = elementTextInlineStyle(elementStyles.columnHeading);
  const contactLineClass = elementTextStyleClass(elementStyles.contactLine, 'body');
  const contactLineStyleBase = elementTextInlineStyle(elementStyles.contactLine);
  const columnHeadingStyle = columnHeadingStyleBase;
  const contactLineStyle = contactLineStyleBase;
  const landingColumnTextClass = contactLineClass;
  const landingColumnTextStyle = contactLineStyle;
  const metaClass = elementTextStyleClass(elementStyles.meta, 'body');
  const metaStyle = elementTextInlineStyle(elementStyles.meta);
  const marketplaceLinkClass = elementTextStyleClass(elementStyles.marketplaceLink, 'body');
  const marketplaceLinkStyle = elementTextInlineStyle(elementStyles.marketplaceLink);
  const ctaButtonTextClass = elementTextStyleClass(elementStyles.ctaButton, 'body');
  const ctaButtonTextStyle = elementTextInlineStyle(elementStyles.ctaButton);
  const iconStyleBase = footerIconStyle(presentation.iconColor);
  const iconStyle = iconStyleBase;
  const patternStyle = footerPatternStyle(presentation);

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

  const visibleLinks = presentation.showContactLinks
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
          link.type === 'WEBSITE' && /^site\s*web$/i.test(rawLabel) ? 'Website' : rawLabel || hostname || url;
        return { ...link, label };
      })
    : [];
  const ctaHref =
    contactHref?.trim() ||
    (emailValue ? `mailto:${emailValue}` : '#footer');

  const showContactIcons = presentation.showContactIcons !== false;
  const contactIconSizeClass = footerContactIconSizeClass(presentation.contactIconSize ?? 'sm');
  const renderFooterContactList = (
    items: typeof contactItems,
    centered = false,
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
                data-pf-no-color-transition=""
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

  const marketplaceLink = presentation.showMarketplaceLink ? (
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
  const contactCtaLabel =
    presentation.design === 'minimal'
      ? footerLayout.text('ctaLabel')
      : presentation.ctaButtonLabel?.trim() || 'Contact me';
  const contactCtaButton =
    (presentation.showContactCta || presentation.design === 'minimal') && contactCtaLabel ? (
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
      {contactCtaLabel}
    </a>
  ) : null;
  const dualCtaRowStart =
    contactCtaButton || marketplaceLink ? (
      <div className="flex flex-wrap items-center gap-3 sm:gap-3.5">
        {contactCtaButton}
        {marketplaceLink}
      </div>
    ) : null;

  let body: React.ReactNode;

  if (presentation.design === 'minimal') {
    // Design 3 — Contact CTA: name + bio + CTA | location + contact + socials
    const ctaBio = footerLayout.bio('bio', bio, 220);
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
    body = (
      <FooterContactCtaBody
        creatorName={creatorName}
        showBrand={footerLayout.isVisible('name')}
        brandClass={brandClass}
        brandStyle={brandStyle}
        bio={ctaBio}
        descriptionClass={descriptionClass}
        descriptionStyle={descriptionStyle}
        ctaRow={dualCtaRowStart}
        contactItems={ctaContactColumnItems}
        contactLineClass={contactLineClass}
        contactLineStyle={contactLineStyle}
        socialLinks={visibleLinks}
        iconStyle={iconStyle}
        avatarUrl={avatarUrl}
        showAvatar={footerLayout.isVisible('avatar')}
      />
    );
  } else {
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
    const internalLinks = { title: 'Links', links: footerNavLinks };
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
                data-pf-no-color-transition=""
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
                          data-pf-no-color-transition=""
                          style={linkStyle}
                          {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link href={href} className={linkClass} data-pf-no-color-transition="" style={linkStyle}>
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
  }

  const fallbackBg = bgStyle || transparentBase ? '' : lightBackground ? 'bg-neutral-100' : 'bg-neutral-950';
  return (
    <footer
      id="footer"
      className={`relative isolate max-w-full overflow-x-clip ${topMarginClass} ${shellClass} ${clearanceClass} ${fallbackBg}`}
      style={{ ...topMarginStyle, '--pf-footer-font-scale': footerFontSizeScale } as CSSProperties}
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
          className={`min-w-0 w-full ${footerContentPaddingClassName()}`}
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

export function FooterSocialLinkIcon({
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

export function FooterContactIcon({
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
      href={`/providers/${creatorId}`}
      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] transition hover:opacity-75"
      data-pf-no-color-transition=""
      style={color ? { color } : undefined}
    >
      View all projects
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
