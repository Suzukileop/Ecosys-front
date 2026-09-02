'use client';

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { DEFAULT_CONTENT_GUTTER } from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-global-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  PortfolioNavCenterBrand,
  PortfolioNavBrandLinkButton,
  PortfolioNavColorModeToggleButton,
  PortfolioNavColorModeToggleProvider,
  resolveDutenPanelSocialLinks,
  resolveEditorialBarContactHref,
  type PortfolioNavChromeLink,
} from '@/components/portfolio/portfolio-nav-extras';
import {
  DEFAULT_NAV_PALETTE,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import { formatNavLabel } from '@/components/portfolio/portfolio-nav-settings';
import {
  deferAfterPortfolioNavOverlayClose,
  scrollToPortfolioSection,
  unlockPortfolioPageScroll,
  usePortfolioNavTopClearanceSync,
} from '@/components/portfolio/portfolio-nav-top-clearance';
import { usePortfolioSectionSpy } from '@/components/portfolio/portfolio-nav-section-spy';
import type { PortfolioNavIconVariant } from '@/components/portfolio/portfolio-nav-items';
import type {
  PortfolioNavMenuControlIcon,
  PortfolioNavSettings,
} from '@/components/portfolio/portfolio-settings-types';

type NavItem = {
  id: string;
  label: string;
  icon: PortfolioNavIconVariant;
};

type PortfolioDutenPanelNavProps = {
  items: NavItem[];
  settings: PortfolioNavSettings;
  activeId?: string;
  onNavigate?: (id: string) => void;
  avatarUrl?: string | null;
  contentGutter?: PortfolioContentGutter;
  visible?: boolean;
  /** Profile Links section — used for the social row in the open panel footer. */
  socialLinkOptions?: PortfolioNavChromeLink[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  showColorModeToggle?: boolean;
  colorMode?: 'light' | 'dark';
  onColorModeToggle?: () => void;
};

const HEADER_ROW_CLASS =
  'grid w-full shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 sm:px-6';
const HEADER_CELL_CLASS = 'flex min-h-12 min-w-0 items-center sm:min-h-[3.25rem]';

const PANEL_TRANSITION = { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const };
/** Wait for logo layout morph before showing the side section label again. */
const LOGO_MORPH_SETTLE_MS = 0.42;
const LINK_STAGGER = 0.045;
/** Pill ends — subtle rounding, not a full stadium. */
const COLLAPSED_RADIUS = 16;
/** Open panel corners — modest rounding. */
const EXPANDED_RADIUS = 18;
/** Tighter side margins when collapsed so the pill spans wider. */
const COLLAPSED_HORIZONTAL_INSET = 10;
/** Breathing room above the pill when the page is at the top — removed on scroll. */
const COLLAPSED_TOP_GAP_PX = 12;
/** Near page top — always show the breathing gap. */
const DOCK_SCROLL_THRESHOLD_PX = 8;
/** Ignore tiny scroll jitter when detecting direction. */
const SCROLL_DIRECTION_DELTA_PX = 4;
const SAFE_AREA_TOP = 'env(safe-area-inset-top, 0px)';
/** Pill glide when docking / undocking on scroll — numeric y, not top calc. */
const DOCK_GLIDE_TRANSITION = { duration: 0.46, ease: [0.22, 1, 0.36, 1] as const };
const PANEL_BOTTOM_INSET_PX = 16;
/** Scroll inside open panel — bar hidden, wheel / touch still work. */
const PANEL_SCROLL_CLASS =
  'min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden';
/** Hero word — max cap before single-line fit scales down. */
const HERO_WORD_MAX_FONT_PX = 416;
const HERO_WORD_MIN_FONT_PX = 22;

function measureDutenHeroWordFontPx(
  containerWidth: number,
  textEl: HTMLElement
): number {
  if (containerWidth <= 0) return HERO_WORD_MIN_FONT_PX;

  const maxPx = Math.min(
    window.innerWidth * 0.32,
    window.innerHeight * 0.42,
    HERO_WORD_MAX_FONT_PX
  );
  const minPx = HERO_WORD_MIN_FONT_PX;

  textEl.style.whiteSpace = 'nowrap';
  textEl.style.wordBreak = 'normal';
  textEl.style.overflowWrap = 'normal';

  let lo = minPx;
  let hi = maxPx;
  let best = minPx;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    textEl.style.fontSize = `${mid}px`;
    if (textEl.scrollWidth <= containerWidth) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
}

function DelayedSideLabel({
  open,
  reduceMotion,
  children,
}: {
  open: boolean;
  reduceMotion: boolean | null;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: open ? 0 : 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.22,
        delay: open || reduceMotion ? 0 : LOGO_MORPH_SETTLE_MS,
      }}
      aria-hidden={open}
      className={`min-w-0 ${open ? 'pointer-events-none' : ''}`}
    >
      {children}
    </motion.div>
  );
}

function OverlayMenuGlyph({
  icon,
  open,
}: {
  icon: PortfolioNavMenuControlIcon;
  open: boolean;
}) {
  if (open) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (icon === 'menu') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }
  if (icon === 'x') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (icon === 'chevron') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    );
  }
  if (icon === 'dots-v') {
    return (
      <span className="inline-flex flex-col items-center gap-1" aria-hidden>
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="h-1 w-1 rounded-full bg-current" />
      </span>
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

function ClosedBarTrigger({
  open,
  triggerStyle,
  menuIcon,
  ink,
  accent,
  reduceMotion,
  onToggle,
}: {
  open: boolean;
  triggerStyle: 'text' | 'icon';
  menuIcon: PortfolioNavMenuControlIcon;
  ink: string;
  accent: string;
  reduceMotion: boolean | null;
  onToggle: () => void;
}) {
  const useIcon = triggerStyle === 'icon';

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="portfolio-duten-panel"
      aria-label={useIcon ? (open ? 'Close navigation menu' : 'Open navigation menu') : undefined}
      onClick={onToggle}
      className={`group relative inline-flex h-10 items-center justify-center self-center transition ${
        useIcon ? 'w-10 rounded-full' : 'min-w-0 px-1 text-xs font-medium tracking-[0.14em] sm:text-sm sm:tracking-[0.12em]'
      }`}
      style={{ color: ink }}
    >
      {useIcon ? (
        <OverlayMenuGlyph icon={menuIcon} open={open} />
      ) : (
        <span className="relative overflow-hidden uppercase">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'close' : 'menu'}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              {open ? 'Close' : 'Menu'}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
      {!useIcon ? (
        <span
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function formatContactPhoneDisplay(phone: string): string {
  const trimmed = phone.trim();
  return /^tel:/i.test(trimmed) ? trimmed.replace(/^tel:/i, '') : trimmed;
}

function formatContactEmailDisplay(email: string): string {
  const trimmed = email.trim();
  return /^mailto:/i.test(trimmed) ? trimmed.replace(/^mailto:/i, '') : trimmed;
}

function DutenPanelFooter({
  settings,
  socialLinkOptions,
  contactPhone,
  contactEmail,
  strongInk,
  mutedInk,
  reduceMotion,
  placement = 'bottom',
}: {
  settings: PortfolioNavSettings;
  socialLinkOptions: PortfolioNavChromeLink[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  strongInk: string;
  mutedInk: string;
  reduceMotion: boolean | null;
  /** When stacked above the hero word, use tighter padding. */
  placement?: 'bottom' | 'aboveHero';
}) {
  const showContact = settings.dutenPanelShowContact ?? false;
  const showSocial = settings.dutenPanelShowSocial ?? false;
  const mailHref = resolveEditorialBarContactHref('mail', { email: contactEmail });
  const phoneHref = resolveEditorialBarContactHref('phone', { phone: contactPhone });
  const mailLabel = contactEmail?.trim() ? formatContactEmailDisplay(contactEmail) : null;
  const phoneLabel = contactPhone?.trim() ? formatContactPhoneDisplay(contactPhone) : null;
  const profileSocialLinks = socialLinkOptions.filter((link) => link.source !== 'mail');
  const socialLinks = showSocial
    ? resolveDutenPanelSocialLinks(profileSocialLinks, settings, 5)
    : [];

  if (!showContact && socialLinks.length === 0) return null;
  if (showContact && !mailHref && !phoneHref && socialLinks.length === 0) return null;

  const aboveHero = placement === 'aboveHero';

  return (
    <motion.footer
      className={`shrink-0 border-t ${
        aboveHero
          ? 'px-6 pb-4 pt-6 sm:px-10 sm:pb-5 sm:pt-8'
          : 'px-6 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10'
      }`}
      style={{ borderColor: `${mutedInk}22` }}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.12, duration: 0.28 }}
    >
      {showContact && (mailHref || phoneHref) ? (
        <div className="space-y-3 sm:space-y-4">
          <p
            className="text-sm font-medium tracking-[0.08em] opacity-55 sm:text-[15px]"
            style={{ color: mutedInk }}
          >
            Contact Us
          </p>
          <p
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[clamp(1.05rem,2.2vw,1.65rem)] font-medium leading-snug tracking-[-0.01em]"
            style={{ color: strongInk }}
          >
            {mailHref && mailLabel ? (
              <a href={mailHref} className="transition hover:opacity-70">
                {mailLabel}
              </a>
            ) : null}
            {mailHref && phoneHref ? (
              <span className="text-[0.85em] opacity-35" aria-hidden>
                |
              </span>
            ) : null}
            {phoneHref && phoneLabel ? (
              <a href={phoneHref} className="transition hover:opacity-70">
                {phoneLabel}
              </a>
            ) : null}
          </p>
        </div>
      ) : null}

      {socialLinks.length > 0 ? (
        <div className={`space-y-4 sm:space-y-5 ${showContact && (mailHref || phoneHref) ? 'mt-8 sm:mt-10' : ''}`}>
          <p
            className="text-sm font-medium tracking-[0.08em] opacity-55 sm:text-[15px]"
            style={{ color: mutedInk }}
          >
            Stay Connected
          </p>
          <div className="flex flex-wrap items-center gap-5 sm:gap-6 md:gap-8">
            {socialLinks.map((link) => (
              <PortfolioNavBrandLinkButton
                key={link.id}
                link={link}
                iconSize="lg"
                monochrome={false}
              />
            ))}
          </div>
        </div>
      ) : null}
    </motion.footer>
  );
}

function DutenPanelHeroWord({
  text,
  strongInk,
  divider,
  reduceMotion,
  showTopBorder = true,
}: {
  text: string;
  strongInk: string;
  divider: string;
  reduceMotion: boolean | null;
  showTopBorder?: boolean;
}) {
  const display = text.trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    if (!display) return;
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const fit = () => {
      const next = measureDutenHeroWordFontPx(container.clientWidth, textEl);
      textEl.style.fontSize = `${next}px`;
    };

    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    ro?.observe(container);
    window.addEventListener('resize', fit);

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [display]);

  if (!display) return null;

  return (
    <motion.div
      className={`flex min-h-0 flex-1 flex-col justify-end px-4 pb-3 pt-4 sm:px-8 sm:pb-5 sm:pt-5 ${
        showTopBorder ? 'border-t' : ''
      }`}
      style={showTopBorder ? { borderColor: `${divider}55` } : undefined}
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.12, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <div ref={containerRef} className="w-full min-w-0 overflow-hidden">
        <p
          ref={textRef}
          aria-label={display}
          className="w-full select-none whitespace-nowrap font-semibold uppercase leading-[0.76] tracking-[-0.06em]"
          style={{
            color: strongInk,
            fontSize: `${HERO_WORD_MIN_FONT_PX}px`,
          }}
        >
          {display}
        </p>
      </div>
    </motion.div>
  );
}

function DutenPanelLinkRedirectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7h-8M17 7v8" />
    </svg>
  );
}

function DutenPanelLink({
  item,
  index,
  active,
  labelCase,
  strongInk,
  mutedInk,
  accent,
  reduceMotion,
  onNavigate,
}: {
  item: NavItem;
  index: number;
  active: boolean;
  labelCase: PortfolioNavSettings['labelCase'];
  strongInk: string;
  mutedInk: string;
  accent: string;
  reduceMotion: boolean | null;
  onNavigate: (id: string, event?: ReactMouseEvent) => void;
}) {
  const label = formatNavLabel(item.label, labelCase);

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * LINK_STAGGER, ...PANEL_TRANSITION }}
    >
      <button
        type="button"
        onClick={(event) => onNavigate(item.id, event)}
        aria-current={active ? 'page' : undefined}
        className="group/link flex w-full items-baseline py-2 text-left sm:py-2.5"
      >
        <span
          className={`inline text-[clamp(1.65rem,4.5vw,2.85rem)] leading-[1.08] tracking-[-0.02em] transition-[color,font-weight] duration-300 ${
            active ? 'font-semibold' : 'font-normal'
          }`}
          style={{ color: active ? strongInk : mutedInk }}
        >
          {label}
        </span>
        <span
          className="inline-flex max-w-0 shrink-0 -translate-x-1.5 items-baseline overflow-hidden opacity-0 transition-[max-width,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/link:max-w-[3rem] group-hover/link:translate-x-0 group-hover/link:opacity-100 group-hover/link:ml-2 group-focus-visible/link:max-w-[3rem] group-focus-visible/link:translate-x-0 group-focus-visible/link:opacity-100 group-focus-visible/link:ml-2 sm:group-hover/link:ml-2.5 sm:group-focus-visible/link:ml-2.5"
          style={{ color: active ? accent : mutedInk }}
        >
          <DutenPanelLinkRedirectIcon className="h-[clamp(1.35rem,3.4vw,2.25rem)] w-[clamp(1.35rem,3.4vw,2.25rem)] min-w-[clamp(1.35rem,3.4vw,2.25rem)]" />
        </span>
      </button>
    </motion.li>
  );
}

export function PortfolioDutenPanelNav({
  items,
  settings,
  activeId: controlledActiveId,
  onNavigate,
  avatarUrl,
  contentGutter: _contentGutter = DEFAULT_CONTENT_GUTTER,
  visible = true,
  socialLinkOptions = [],
  contactPhone,
  contactEmail,
  showColorModeToggle = false,
  colorMode = 'dark',
  onColorModeToggle,
}: PortfolioDutenPanelNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState(48);
  const [dockedToTop, setDockedToTop] = useState(false);
  const navRootRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const isControlled = typeof onNavigate === 'function';
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
  const {
    activeId: spiedActiveId,
    lockForNavigation,
  } = usePortfolioSectionSpy(sectionIds, !isControlled);
  const activeId = isControlled
    ? (controlledActiveId ?? items[0]?.id ?? '')
    : spiedActiveId;
  const sectionItems = items;

  const navPalette = useMemo(
    () => mergeNavPalette(DEFAULT_NAV_PALETTE, settings.navPalette),
    [settings.navPalette]
  );
  const accent = settings.activeAccentColor ?? resolveHeroPaletteColor(navPalette, 'principal');
  const strongInk = resolveHeroPaletteColor(navPalette, 'texteFort');
  const mutedInk = resolveHeroPaletteColor(navPalette, 'texteMuted');
  const panelFill = resolveHeroPaletteColor(navPalette, 'neutre');
  const panelBorder = resolveHeroPaletteColor(navPalette, 'bordure');
  const scrim = resolveHeroPaletteColor(navPalette, 'fond');
  const barInk = settings.itemTextColor ?? strongInk;
  const columns = settings.dutenPanelColumns ?? 2;
  const menuSide = settings.caseOverlayMenuSide ?? 'right';
  const menuTrigger = settings.caseOverlayMenuTrigger ?? 'text';
  const menuIcon = (settings.menuControlIcon ?? 'menu') as PortfolioNavMenuControlIcon;

  const brandSettings = useMemo(() => {
    const logoUrl =
      (settings.customExtraLogoUrl ?? '').trim() || (avatarUrl ?? '').trim();
    return {
      ...settings,
      customExtraEnabled: true,
      customExtraDisplay: 'logo' as const,
      customExtraLogoUrl: logoUrl,
      customExtraText: '',
      customExtraBackgroundColor: 'transparent',
      customExtraBorderEnabled: false,
      customExtraPaddingX: 0,
      customExtraPaddingY: 0,
      customExtraTextColor: strongInk,
    };
  }, [settings, avatarUrl, strongInk]);

  const activeItem = sectionItems.find((item) => item.id === activeId);
  const activeLabel = activeItem
    ? formatNavLabel(activeItem.label, settings.labelCase ?? 'titlecase')
    : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () => setCollapsedHeight(header.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, [activeLabel, menuSide, menuTrigger, settings.customExtraLogoSizePx]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    const syncDock = () => {
      const y = window.scrollY;
      const lastY = lastScrollYRef.current;
      const delta = y - lastY;
      lastScrollYRef.current = y;

      if (y <= DOCK_SCROLL_THRESHOLD_PX) {
        setDockedToTop(false);
        return;
      }

      if (delta > SCROLL_DIRECTION_DELTA_PX) {
        setDockedToTop(true);
      } else if (delta < -SCROLL_DIRECTION_DELTA_PX) {
        setDockedToTop(false);
      }
    };

    lastScrollYRef.current = window.scrollY;
    syncDock();
    window.addEventListener('scroll', syncDock, { passive: true });
    return () => window.removeEventListener('scroll', syncDock);
  }, []);

  useEffect(() => {
    if (open) return;
    lastScrollYRef.current = window.scrollY;
    if (window.scrollY <= DOCK_SCROLL_THRESHOLD_PX) {
      setDockedToTop(false);
    }
  }, [open]);

  usePortfolioNavTopClearanceSync({
    rootRef: headerRef,
    active: true,
    visible,
  });

  const handleNavigate = (id: string, event?: ReactMouseEvent) => {
    event?.preventDefault();
    setOpen(false);
    unlockPortfolioPageScroll();
    deferAfterPortfolioNavOverlayClose(() => {
      if (onNavigate) {
        onNavigate(id);
        return;
      }
      if (scrollToPortfolioSection(id)) {
        lockForNavigation(id);
      }
    });
  };

  const reduceMotion = useReducedMotion();
  const shellTransition = reduceMotion ? { duration: 0 } : PANEL_TRANSITION;

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && sectionItems.length <= 1) return null;
  if (sectionItems.length === 0) return null;
  if (!mounted) return null;

  const menuButton = (
    <ClosedBarTrigger
      open={open}
      triggerStyle={menuTrigger}
      menuIcon={menuIcon}
      ink={barInk}
      accent={accent}
      reduceMotion={reduceMotion}
      onToggle={() => setOpen((value) => !value)}
    />
  );

  const activeChip =
    activeLabel ? (
      <p className="truncate text-[11px] font-medium leading-none tracking-[0.08em] opacity-55 sm:text-xs" style={{ color: barInk }}>
        {activeLabel}
      </p>
    ) : (
      <span aria-hidden className="block h-4" />
    );

  const logoNode = (
    <motion.div
      layoutId="duten-nav-logo"
      layout="position"
      transition={{ layout: shellTransition }}
      className="flex min-w-0 items-center"
    >
      <PortfolioNavCenterBrand settings={brandSettings} compact />
    </motion.div>
  );

  const sideLabel = (
    <DelayedSideLabel open={open} reduceMotion={reduceMotion}>
      {activeChip}
    </DelayedSideLabel>
  );

  const centerPlaceholder = <span className="inline-block h-4 w-px shrink-0 opacity-0" aria-hidden />;

  const colorModeToggle = (
    <PortfolioNavColorModeToggleButton
      settings={settings}
      compact
      overlayInteraction
      inkColor={barInk}
    />
  );
  const menuCluster = (
    <div className="flex items-center gap-2">
      {menuSide === 'left' ? (
        <>
          {menuButton}
          {colorModeToggle}
        </>
      ) : (
        <>
          {colorModeToggle}
          {menuButton}
        </>
      )}
    </div>
  );

  let headerLeft: ReactNode;
  let headerCenter: ReactNode;
  let headerRight: ReactNode;

  if (menuSide === 'left') {
    headerLeft = open ? logoNode : menuCluster;
    headerCenter = open ? centerPlaceholder : sideLabel;
    headerRight = open ? menuCluster : logoNode;
  } else {
    headerLeft = open ? logoNode : sideLabel;
    headerCenter = open ? centerPlaceholder : logoNode;
    headerRight = menuCluster;
  }

  const leftColumn = sectionItems.filter((_, index) => index % columns === 0);
  const rightColumn = columns === 2 ? sectionItems.filter((_, index) => index % columns === 1) : [];

  const collapsedTop = SAFE_AREA_TOP;
  const collapsedYOffset = dockedToTop ? 0 : COLLAPSED_TOP_GAP_PX;
  const topGapPx = dockedToTop ? 0 : COLLAPSED_TOP_GAP_PX;
  const expandedHeight = `calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - ${topGapPx + PANEL_BOTTOM_INSET_PX}px)`;
  const showFooter =
    (settings.dutenPanelShowContact ?? false) || (settings.dutenPanelShowSocial ?? false);
  const showHeroWord = settings.dutenPanelShowHeroWord ?? false;
  const heroWord = (settings.dutenPanelHeroWord ?? '').trim();
  const hasHeroWord = showHeroWord && heroWord.length > 0;
  const footerAboveHero = showFooter && hasHeroWord;

  const footerNode = showFooter ? (
    <DutenPanelFooter
      settings={settings}
      socialLinkOptions={socialLinkOptions}
      contactPhone={contactPhone}
      contactEmail={contactEmail}
      strongInk={strongInk}
      mutedInk={mutedInk}
      reduceMotion={reduceMotion}
      placement={footerAboveHero ? 'aboveHero' : 'bottom'}
    />
  ) : null;

  return createPortal(
    <PortfolioNavColorModeToggleProvider
      show={showColorModeToggle}
      colorMode={colorMode}
      onToggle={() => onColorModeToggle?.()}
    >
    <LayoutGroup id="portfolio-duten-nav">
      <AnimatePresence>
        {open ? (
          <motion.button
            key="duten-scrim"
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-[225] backdrop-blur-[2px]"
            style={{ backgroundColor: `${scrim}88` }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.32 }}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        ref={navRootRef}
        id="portfolio-duten-panel"
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? 'Navigation menu' : 'Portfolio navigation'}
        className={`fixed flex flex-col overflow-hidden ${
          open ? 'z-[230]' : 'z-[120]'
        } ${
          visible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{
          backgroundColor: panelFill,
          border: `1px solid ${panelBorder}66`,
          color: strongInk,
          boxShadow: open
            ? '0 24px 80px rgba(0,0,0,0.12)'
            : '0 4px 24px rgba(0,0,0,0.06)',
          transformOrigin: 'top center',
        }}
        initial={false}
        animate={{
          top: collapsedTop,
          y: collapsedYOffset,
          left: COLLAPSED_HORIZONTAL_INSET,
          right: COLLAPSED_HORIZONTAL_INSET,
          height: open ? expandedHeight : collapsedHeight,
          borderRadius: open ? EXPANDED_RADIUS : COLLAPSED_RADIUS,
        }}
        transition={{
          height: reduceMotion ? { duration: 0 } : PANEL_TRANSITION,
          borderRadius: reduceMotion ? { duration: 0 } : PANEL_TRANSITION,
          y: reduceMotion ? { duration: 0 } : DOCK_GLIDE_TRANSITION,
        }}
      >
        <nav
          ref={headerRef}
          data-portfolio-nav-clearance-box
          aria-label="Portfolio navigation"
          className={HEADER_ROW_CLASS}
        >
          <div className={`${HEADER_CELL_CLASS} justify-start`}>{headerLeft}</div>
          <div className={`${HEADER_CELL_CLASS} justify-center`}>{headerCenter}</div>
          <div className={`${HEADER_CELL_CLASS} justify-end`}>{headerRight}</div>
        </nav>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="duten-links"
              className={PANEL_SCROLL_CLASS}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.06, duration: 0.22 }}
            >
              <div className="flex min-h-full min-w-0 flex-col">
                <div className="shrink-0 px-6 pb-2 pt-1 sm:px-10 sm:pb-3">
                  <div
                    className={`grid gap-x-10 gap-y-1 sm:gap-x-16 md:gap-x-24 ${
                      columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    <ul className="space-y-1">
                      {leftColumn.map((item, index) => (
                        <DutenPanelLink
                          key={item.id}
                          item={item}
                          index={index}
                          active={activeId === item.id}
                          labelCase={settings.labelCase ?? 'titlecase'}
                          strongInk={strongInk}
                          mutedInk={mutedInk}
                          accent={accent}
                          reduceMotion={reduceMotion}
                          onNavigate={handleNavigate}
                        />
                      ))}
                    </ul>
                    {columns === 2 ? (
                      <ul className="space-y-1">
                        {rightColumn.map((item, index) => (
                          <DutenPanelLink
                            key={item.id}
                            item={item}
                            index={leftColumn.length + index}
                            active={activeId === item.id}
                            labelCase={settings.labelCase ?? 'titlecase'}
                            strongInk={strongInk}
                            mutedInk={mutedInk}
                            accent={accent}
                            reduceMotion={reduceMotion}
                            onNavigate={handleNavigate}
                          />
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
                {footerAboveHero ? footerNode : null}
                {hasHeroWord ? (
                  <DutenPanelHeroWord
                    text={heroWord}
                    strongInk={strongInk}
                    divider={panelBorder}
                    reduceMotion={reduceMotion}
                    showTopBorder={!footerAboveHero}
                  />
                ) : (
                  <div className="min-h-0 flex-1" aria-hidden />
                )}
                {!footerAboveHero ? footerNode : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
    </PortfolioNavColorModeToggleProvider>,
    document.body
  );
}
