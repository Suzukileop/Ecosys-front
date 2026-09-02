'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
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

type PortfolioHalfPanelNavProps = {
  items: NavItem[];
  settings: PortfolioNavSettings;
  activeId?: string;
  onNavigate?: (id: string) => void;
  avatarUrl?: string | null;
  contentGutter?: PortfolioContentGutter;
  visible?: boolean;
  socialLinkOptions?: PortfolioNavChromeLink[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  showColorModeToggle?: boolean;
  colorMode?: 'light' | 'dark';
  onColorModeToggle?: () => void;
};

const DRAWER_TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };
const LINK_STAGGER = 0.04;
const TRIGGER_INSET_PX = 16;
const COLLAPSED_TOP_GAP_PX = 12;
const SAFE_AREA_TOP = 'env(safe-area-inset-top, 0px)';

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

function formatContactPhoneDisplay(phone: string): string {
  return phone.trim();
}

function formatContactEmailDisplay(email: string): string {
  return email.trim();
}

function HalfPanelFooter({
  settings,
  socialLinkOptions,
  contactPhone,
  contactEmail,
  strongInk,
  mutedInk,
  reduceMotion,
}: {
  settings: PortfolioNavSettings;
  socialLinkOptions: PortfolioNavChromeLink[];
  contactPhone?: string | null;
  contactEmail?: string | null;
  strongInk: string;
  mutedInk: string;
  reduceMotion: boolean | null;
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

  return (
    <motion.footer
      className="shrink-0 space-y-8 border-t px-8 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10 md:px-12"
      style={{ borderColor: `${mutedInk}22` }}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.14, duration: 0.28 }}
    >
      {showContact && (mailHref || phoneHref) ? (
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.08em] opacity-55" style={{ color: mutedInk }}>
            Contact Us
          </p>
          <p
            className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[clamp(1rem,2vw,1.35rem)] font-medium leading-snug tracking-[-0.01em]"
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
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-[0.08em] opacity-55" style={{ color: mutedInk }}>
            Stay Connected
          </p>
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
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

function HalfPanelLink({
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
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * LINK_STAGGER, ...DRAWER_TRANSITION }}
    >
      <button
        type="button"
        onClick={(event) => onNavigate(item.id, event)}
        aria-current={active ? 'page' : undefined}
        className="group/link block w-full py-1.5 text-left sm:py-2"
      >
        <span
          className={`relative inline-block text-[clamp(1.15rem,2.4vw,1.65rem)] leading-[1.2] tracking-[-0.02em] transition-[color,transform] duration-300 group-hover/link:-translate-x-0.5 ${
            active ? 'font-medium' : 'font-normal'
          }`}
          style={{ color: active ? strongInk : mutedInk }}
        >
          {label}
          <span
            className={`absolute -bottom-0.5 left-0 h-px transition-all duration-300 ${
              active ? 'w-full' : 'w-0 group-hover/link:w-full'
            }`}
            style={{ backgroundColor: active ? accent : `${mutedInk}88` }}
          />
        </span>
      </button>
    </motion.li>
  );
}

export function PortfolioHalfPanelNav({
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
}: PortfolioHalfPanelNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
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
  const triggerInk = settings.itemTextColor ?? strongInk;
  const triggerFill = resolveHeroPaletteColor(navPalette, 'neutre');
  const columns = settings.dutenPanelColumns ?? 2;
  const menuTrigger = settings.caseOverlayMenuTrigger ?? 'icon';
  const menuIcon = (settings.menuControlIcon ?? 'menu') as PortfolioNavMenuControlIcon;
  const discoverLabel = (settings.halfPanelDiscoverLabel ?? 'Discover Pages').trim() || 'Discover Pages';
  const useIconTrigger = menuTrigger === 'icon';

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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  usePortfolioNavTopClearanceSync({
    rootRef: triggerRef,
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
  const drawerTransition = reduceMotion ? { duration: 0 } : DRAWER_TRANSITION;

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && sectionItems.length <= 1) return null;
  if (sectionItems.length === 0) return null;
  if (!mounted) return null;

  const leftColumn = sectionItems.filter((_, index) => index % columns === 0);
  const rightColumn = columns === 2 ? sectionItems.filter((_, index) => index % columns === 1) : [];

  const triggerTop = `calc(${SAFE_AREA_TOP} + ${COLLAPSED_TOP_GAP_PX}px)`;

  const colorModeToggle = (
    <PortfolioNavColorModeToggleButton
      settings={settings}
      compact
      overlayInteraction
      inkColor={open ? strongInk : triggerInk}
    />
  );

  return createPortal(
    <PortfolioNavColorModeToggleProvider
      show={showColorModeToggle}
      colorMode={colorMode}
      onToggle={() => onColorModeToggle?.()}
    >
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            key="half-panel-scrim"
            type="button"
            aria-label="Close navigation menu"
            className="fixed inset-0 z-[225] backdrop-blur-[1px]"
            style={{ backgroundColor: `${scrim}66` }}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.32 }}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {open ? (
          <motion.aside
            key="half-panel-drawer"
            id="portfolio-half-panel-drawer"
            role="dialog"
            aria-modal
            aria-label="Navigation menu"
            className="fixed inset-y-0 right-0 z-[230] flex w-[min(100%,50vw)] min-w-[min(100%,18rem)] max-w-[32rem] flex-col shadow-[-24px_0_80px_rgba(0,0,0,0.12)]"
            style={{
              backgroundColor: panelFill,
              color: strongInk,
              borderLeft: `1px solid ${panelBorder}55`,
              paddingTop: SAFE_AREA_TOP,
            }}
            initial={reduceMotion ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduceMotion ? undefined : { x: '100%' }}
            transition={drawerTransition}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 px-8 pb-4 pt-6 sm:px-10 sm:pt-8 md:px-12">
              <div className="min-w-0">
                <PortfolioNavCenterBrand settings={brandSettings} compact />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {colorModeToggle}
                <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
                style={{ color: strongInk }}
              >
                <OverlayMenuGlyph icon="x" open />
              </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pb-6 sm:px-10 md:px-12 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <p
                className="mb-5 text-sm font-medium tracking-[0.08em] opacity-55 sm:mb-6"
                style={{ color: mutedInk }}
              >
                {discoverLabel}
              </p>

              <div
                className={`grid gap-x-8 gap-y-0 sm:gap-x-10 md:gap-x-14 ${
                  columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
                }`}
              >
                <ul className="space-y-0.5">
                  {leftColumn.map((item, index) => (
                    <HalfPanelLink
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
                  <ul className="space-y-0.5">
                    {rightColumn.map((item, index) => (
                      <HalfPanelLink
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

            <HalfPanelFooter
              settings={settings}
              socialLinkOptions={socialLinkOptions}
              contactPhone={contactPhone}
              contactEmail={contactEmail}
              strongInk={strongInk}
              mutedInk={mutedInk}
              reduceMotion={reduceMotion}
            />
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <motion.div
        ref={triggerRef}
        data-portfolio-nav-clearance-box
        className={`fixed z-[120] transition-opacity duration-300 ${
          !visible || open ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
        }`}
        style={{ top: triggerTop, right: TRIGGER_INSET_PX }}
      >
        <div className="flex items-center gap-2">
          {colorModeToggle}
          <button
          type="button"
          aria-expanded={open}
          aria-controls="portfolio-half-panel-drawer"
          aria-label={useIconTrigger ? 'Open navigation menu' : undefined}
          onClick={() => setOpen(true)}
          className={`inline-flex items-center justify-center transition hover:opacity-80 ${
            useIconTrigger
              ? 'h-11 w-11 rounded-full'
              : 'h-10 rounded-full px-4 text-xs font-medium tracking-[0.14em] sm:text-sm'
          }`}
          style={{
            color: triggerInk,
            backgroundColor: `${triggerFill}ee`,
            border: `1px solid ${panelBorder}55`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {useIconTrigger ? (
            <OverlayMenuGlyph icon={menuIcon} open={false} />
          ) : (
            'Menu'
          )}
        </button>
        </div>
      </motion.div>
    </>
    </PortfolioNavColorModeToggleProvider>,
    document.body
  );
}
