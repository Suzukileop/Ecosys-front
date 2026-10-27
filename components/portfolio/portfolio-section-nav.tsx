'use client';

/**
 * Floating portfolio navigation (every navigation layout).
 * Split out of portfolio-section-primitives so the public portfolio only downloads the sections it
 * renders (each is loaded with next/dynamic by PublicCreatorPortfolioPage).
 */
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { mediaImageSrc, mediaImageSrcSet } from '@/lib/media-image-url';
import { readableMix } from '@/components/portfolio/stack-designs/readable-ink';
import { servicesColorLuminance } from '@/components/portfolio/portfolio-services-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  formatNavLabel,
  portfolioNavBarContainerClass,
  portfolioNavBarHeightClass,
  portfolioNavBarInnerClass,
  portfolioNavBarShellStyle,
  portfolioNavBarWidthClass,
  portfolioNavIconGlyphClass,
  portfolioNavIsVertical,
  portfolioNavItemActiveClass,
  portfolioNavItemBaseClass,
  portfolioNavLabelFontSizeClass,
  portfolioNavItemColorStyles,
  portfolioNavItemHoverClass,
  portfolioNavItemHoverCssVars,
  portfolioNavItemHoverIconClass,
  portfolioNavItemHoverPresentation,
  portfolioNavEditorialBarItemHoverPresentation,
  portfolioNavFloatingPillItemHoverPresentation,
  portfolioNavCenterLogoSplitItemHoverPresentation,
  portfolioNavItemHoverTextClass,
  portfolioNavDrawerItemHoverClass,
  portfolioNavActiveItemStyle,
  portfolioNavActiveIndicatorSlot,
  portfolioNavUsesFlatMenuIndicatorLayout,
  portfolioNavTextIndicatorReserveClass,
  portfolioNavUsesTextIndicatorReserve,
  portfolioNavDockGlyphClass,
  portfolioNavEffectiveContentMode,
  applyPortfolioNavEditorialBarActiveInk,
  resolvePortfolioNavEditorialBarMenuAccentColor,
  resolvePortfolioNavMenuGroupActiveStyle,
  portfolioNavPlacementClass,
  portfolioNavRailDividerClass,
  portfolioNavBarHostsInlineExtras,
  portfolioNavItemGapClass,
  portfolioNavTriZoneItemGapClass,
  resolveNavBarSurfaceBackground,
  resolveNavDrawerPanelBackground,
  resolvePortfolioNavMobileChrome,
  type PortfolioNavMenuControlAlign,
  type PortfolioNavMenuControlIcon,
} from '@/components/portfolio/portfolio-nav-settings';
import {
  portfolioNavUsesCenterLogoSplitLayout,
  portfolioNavUsesEditorialBarLayout,
  portfolioNavUsesFloatingPillLayout,
  portfolioNavFloatingPillShowsLogo,
  portfolioNavFloatingPillShowsContact,
  portfolioNavUsesStructuredBarLayout,
} from '@/components/portfolio/portfolio-nav-layout-design';
import { splitNavMenuEntries } from '@/components/portfolio/portfolio-nav-split-layout';
import { DEFAULT_NAV_PALETTE, mergeNavPalette } from '@/components/portfolio/portfolio-nav-palette-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import { portfolioNavTopClearanceActive, scrollToPortfolioSection, usePortfolioNavTopClearanceSync } from '@/components/portfolio/portfolio-nav-top-clearance';
import { usePortfolioSectionSpy } from '@/components/portfolio/portfolio-nav-section-spy';
import { PortfolioNavMenuGroupDropdown } from '@/components/portfolio/portfolio-nav-menu-group-dropdown';
import { resolveNavMenuEntries } from '@/components/portfolio/portfolio-nav-menu-groups';
import type { PortfolioNavIconVariant } from '@/components/portfolio/portfolio-nav-items';
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
import { DEFAULT_CONTENT_GUTTER, portfolioEditorialGutterX, type PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import { useT } from '@/lib/i18n/I18nProvider';

type NavItem = { id: string; label: string; icon: PortfolioNavIconVariant };

export function useNavVisibility(
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

/**
 * In-bar links (floating pill, editorial bar). Centred while they fit; once the bar runs out of
 * room they scroll sideways instead of spilling over the brand or the buttons (`safe center`
 * keeps the first one reachable), faded edges hint at the hidden ones, and the active link is
 * kept in view.
 */
function NavLinksRail({
  className,
  activeKey,
  children,
}: {
  className: string;
  activeKey?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const max = node.scrollWidth - node.clientWidth;
        const next = { start: max > 1 && node.scrollLeft > 1, end: max > 1 && node.scrollLeft < max - 1 };
        setOverflow((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener('scroll', update);
    };
  }, [children]);

  useEffect(() => {
    const node = ref.current;
    const active = node?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!node || !active || node.scrollWidth <= node.clientWidth) return;
    const nodeRect = node.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    node.scrollTo({
      left: node.scrollLeft + activeRect.left - nodeRect.left - (nodeRect.width - activeRect.width) / 2,
      behavior: 'smooth',
    });
  }, [activeKey]);

  const fade =
    overflow.start || overflow.end
      ? `linear-gradient(to right, ${overflow.start ? 'transparent' : '#000'} 0, #000 28px, #000 calc(100% - 28px), ${
          overflow.end ? 'transparent' : '#000'
        } 100%)`
      : undefined;
  return (
    <div ref={ref} className={className} style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}>
      {children}
    </div>
  );
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
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isControlled = typeof onNavigate === 'function';
  // Pages mode uses an inner scroller — window.scrollY never moves.
  const visible = useNavVisibility(settings.displayMode, isControlled);
  const isLgUp = usePortfolioLgUp();
  const isXlUp = usePortfolioXlUp();
  const presence = useNavPresence(settings.presence, visible);
  const presenceMode = settings.presence ?? 'full';
  // The optional CTA is independent of the menu. Some layouts/placements don't render it,
  // so enabling it must never remove the only visible Contact destination.
  const sectionItems = items;
  const menuEntries = useMemo(
    () => resolveNavMenuEntries(sectionItems, settings.navMenuGroups ?? []),
    [sectionItems, settings.navMenuGroups]
  );
  const drawerMenuEntries = menuEntries;
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
    const previous = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('#portfolio-nav-drawer button')?.focus({ preventScroll: true }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
      if (event.key === 'Tab') {
        const focusable = Array.from(document.querySelectorAll<HTMLElement>('#portfolio-nav-drawer button:not([disabled]), #portfolio-nav-drawer a[href], #portfolio-nav-drawer [tabindex="0"]'));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
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
    const drawerDesign = settings.mobileDrawerDesign ?? 'classic';
    const drawerSurface = drawerDesign === 'contrast'
      ? servicesColorLuminance(settings.itemTextColor ?? '#171717') < 0.45 ? settings.itemTextColor ?? '#171717' : '#171717'
      : drawerPanelBackground;
    const drawerInk = readableMix(servicesColorLuminance(drawerSurface) < 0.45 ? '#fafafa' : settings.itemTextColor ?? '#171717', 100, drawerSurface);
    const drawerLabelSizeClass = portfolioNavLabelFontSizeClass(settings.labelFontSize ?? 'sm', true);
    const brandWord =
      (settings.mobileBrandWord ?? '').trim() ||
      (brandName ?? '').trim() ||
      (settings.customExtraText ?? '').trim() ||
      t('Menu');
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
        aria-label={t('Open navigation menu')}
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
          data-pf-page-palette="" data-pf-nav-typography=""
          ref={navRootRef}
          className={`pointer-events-none fixed inset-x-0 top-0 z-[100] transition-opacity duration-300 ${
            visible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-label={t('Portfolio navigation')}
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
              aria-label={t('Close navigation menu')}
              onClick={() => setDrawerOpen(false)}
            />
            <aside
              id="portfolio-nav-drawer"
              data-pf-drawer-design={drawerDesign}
              role="dialog" data-pf-nav-typography=""
              aria-modal="true"
              aria-label={t('Navigation')}
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
                backgroundColor: drawerSurface,
                '--pf-drawer-ink': drawerInk,
                '--pf-drawer-muted': readableMix(drawerInk, 70, drawerSurface),
                '--pf-drawer-accent': settings.navPalette?.principal ?? settings.activeAccentColor ?? '#f97316',
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
              } as CSSProperties}
            >
              <div className="pf-drawer-header flex items-center justify-between gap-3 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60">{t('Menu')}</p>
                <div className="inline-flex items-center gap-2">
                  <PortfolioNavColorModeToggleProvider
                    show={showColorModeToggle}
                    colorMode={colorMode}
                    onToggle={() => onColorModeToggle?.()}
                  >
                    <PortfolioNavColorModeToggleButton
                      settings={settings}
                      inkColor={settings.itemTextColor ?? '#525252'}
                    />
                  </PortfolioNavColorModeToggleProvider>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label={t('Close navigation')}
                    className={`${handleChromeClass} h-11 w-11 min-h-11`}
                    data-pf-no-color-transition=""
                    style={handleChromeStyle}
                  >
                    <NavMenuControlGlyph icon="x" expanded />
                  </button>
                </div>
              </div>
              <div className="pf-drawer-body min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-1">
                <ul className="pf-drawer-list flex flex-col gap-1.5">
                  {drawerMenuEntries.map((entry, index) => {
                    if (entry.type === 'group') {
                      return (
                        <li key={entry.id} className="pf-drawer-group">
                          <PortfolioNavMenuGroupDropdown
                            groupLabel={t(entry.label)}
                            items={entry.items}
                            activeId={activeId}
                            isControlled={isControlled}
                            settings={drawerDesign === 'classic' ? settings : {
                              ...settings,
                              barBackgroundColor: drawerSurface,
                              itemTextColor: drawerInk,
                              navPalette: { ...navPalette, fond: drawerSurface, neutre: drawerSurface, texteFort: drawerInk },
                            }}
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
                            data-pf-drawer-link=""
                            data-index={String(index + 1).padStart(2, '0')}
                            aria-label={label}
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
                            data-pf-drawer-link=""
                            data-index={String(index + 1).padStart(2, '0')}
                            aria-label={label}
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
              {drawerDesign !== 'classic' && brandName ? <div className="pf-drawer-signature">{brandName}</div> : null}
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
            : 'grid-cols-[minmax(max-content,1fr)_minmax(0,auto)_minmax(max-content,1fr)]'
        }`
      : floatingPillLayout
        ? `grid w-fit max-w-[calc(100vw-1.5rem)] ${floatingPillGridColsClass} items-center gap-x-4 sm:gap-x-6 lg:gap-x-8 !px-2 sm:!px-3 ${structuredBarHeightClass}`
        : innerWidthClass;

  const expandedToggleButton = showExpandedToggle ? (
    <button
      type="button"
      onClick={presence.onCollapse}
      aria-label={t('Hide navigation')}
      title={t('Hide menu')}
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
    'transition-[opacity,transform,translate,scale,rotate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform';

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
              groupLabel={t(entry.label)}
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
      data-pf-page-palette="" data-pf-nav-typography=""
      ref={navRootRef}
      className={`pointer-events-none fixed z-[100] ${placementClass} ${widthClass}`}
      aria-label={t('Portfolio navigation')}
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
            aria-label={t('Show navigation')}
            tabIndex={presence.showHandle ? 0 : -1}
            data-pf-no-color-transition=""
          >
            {showMenuIcon ? <NavMenuControlGlyph icon={menuControlIcon} /> : null}
            {showMenuText ? (
              <span className="text-xs font-bold uppercase tracking-[0.14em]">{t('Menu')}</span>
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
              <NavLinksRail
                activeKey={activeId}
                className={`flex min-w-0 items-center justify-self-stretch [justify-content:safe_center] overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${itemsGapClass}`}
              >
                {renderNavSectionButtons()}
              </NavLinksRail>
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
              <NavLinksRail
                activeKey={activeId}
                className={`flex min-w-0 items-center justify-self-stretch [justify-content:safe_center] overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${itemsGapClass}`}
              >
                {renderNavSectionButtons()}
              </NavLinksRail>
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
