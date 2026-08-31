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
import { portfolioEditorialGutterX, DEFAULT_CONTENT_GUTTER } from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-global-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_NAV_PALETTE,
  mergeNavPalette,
} from '@/components/portfolio/portfolio-nav-palette-settings';
import { formatNavLabel } from '@/components/portfolio/portfolio-nav-settings';
import { PortfolioNavCenterBrand } from '@/components/portfolio/portfolio-nav-extras';
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

type PortfolioCaseOverlayNavProps = {
  items: NavItem[];
  settings: PortfolioNavSettings;
  activeId?: string;
  onNavigate?: (id: string) => void;
  brandName?: string;
  avatarUrl?: string | null;
  contentGutter?: PortfolioContentGutter;
  visible?: boolean;
};

const ROW_STAGGER = 0.06;
const OVERLAY_TRANSITION = { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0');
}

function CaseOverlayMenuGlyph({
  icon,
  open,
}: {
  icon: PortfolioNavMenuControlIcon;
  open: boolean;
}) {
  if (open) {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }

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
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (icon === 'chevron') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    );
  }
  if (icon === 'menu') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
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

function CaseOverlayActiveLabel({
  label,
  accent,
  align,
}: {
  label: string;
  accent: string;
  align: 'start' | 'center' | 'end';
}) {
  const alignClass =
    align === 'center' ? 'justify-self-center text-center' : align === 'end' ? 'justify-self-end text-right' : 'justify-self-start text-left';
  return (
    <p
      className={`min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.18em] ${alignClass}`}
      style={{ color: accent }}
    >
      {label}
    </p>
  );
}

function CaseOverlayMenuTrigger({
  open,
  triggerStyle,
  menuIcon,
  ink,
  triggerInk,
  accent,
  reduceMotion,
  onToggle,
}: {
  open: boolean;
  triggerStyle: 'text' | 'icon';
  menuIcon: PortfolioNavMenuControlIcon;
  ink: string;
  triggerInk: string;
  accent: string;
  reduceMotion: boolean | null;
  onToggle: () => void;
}) {
  const useIcon = triggerStyle === 'icon';
  const label = open ? 'Close' : 'Menu';

  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="portfolio-case-overlay-panel"
      aria-label={useIcon ? (open ? 'Close navigation menu' : 'Open navigation menu') : undefined}
      onClick={onToggle}
      className={`group relative inline-flex min-h-11 items-center justify-center transition ${
        useIcon ? 'h-11 w-11 rounded-full' : 'px-1 text-sm font-semibold uppercase tracking-[0.22em]'
      }`}
      style={{ color: open ? ink : triggerInk }}
    >
      {useIcon ? (
        <CaseOverlayMenuGlyph icon={menuIcon} open={open} />
      ) : (
        <span className="relative overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? 'close' : 'menu'}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="inline-block"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      )}
      {!useIcon ? (
        <span
          className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function CaseOverlayRowHintLine({
  active,
  accent,
  mutedInk,
}: {
  active: boolean;
  accent: string;
  mutedInk: string;
}) {
  return (
    <span
      className="hidden h-px w-10 shrink-0 transition-[width,opacity] duration-300 group-hover:w-14 sm:block sm:w-12 sm:group-hover:w-16"
      style={{
        backgroundColor: active ? accent : mutedInk,
        opacity: active ? 1 : 0.35,
      }}
      aria-hidden
    />
  );
}

function CaseOverlayRow({
  index,
  item,
  activeId,
  labelCase,
  accent,
  ink,
  mutedInk,
  divider,
  onNavigate,
}: {
  index: number;
  item: NavItem;
  activeId: string;
  labelCase: PortfolioNavSettings['labelCase'];
  accent: string;
  ink: string;
  mutedInk: string;
  divider: string;
  onNavigate: (id: string, event?: ReactMouseEvent) => void;
}) {
  const reduceMotion = useReducedMotion();
  const active = activeId === item.id;
  const label = formatNavLabel(item.label, labelCase);

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * ROW_STAGGER, ...OVERLAY_TRANSITION }}
      className="group relative border-b"
      style={{ borderColor: divider }}
    >
      <button
        type="button"
        onClick={(event) => onNavigate(item.id, event)}
        aria-current={active ? 'page' : undefined}
        className="grid w-full grid-cols-1 items-center gap-4 py-5 pl-6 pr-4 text-left transition sm:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] sm:gap-8 sm:py-6 sm:pl-8 sm:pr-6 md:py-7 lg:py-8"
      >
        <span
          className="pointer-events-none absolute bottom-[18%] left-0 top-[18%] w-px origin-left scale-y-0 opacity-0 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:scale-y-100 group-focus-visible:opacity-100"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        {active ? (
          <span
            className="pointer-events-none absolute bottom-[12%] left-0 top-[12%] w-px"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
        ) : null}
        <span className="flex min-w-0 items-baseline gap-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5 sm:gap-6">
          <span
            className="w-7 shrink-0 text-[11px] font-semibold tracking-[0.22em] sm:w-8 sm:text-xs"
            style={{ color: accent }}
          >
            {formatIndex(index)}
          </span>
          <span
            className="min-w-0 truncate text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-[2.65rem] lg:leading-none"
            style={{ color: active ? accent : ink }}
          >
            {label}
          </span>
        </span>
        <span className="hidden items-center justify-end sm:flex">
          <CaseOverlayRowHintLine active={active} accent={accent} mutedInk={mutedInk} />
        </span>
      </button>
    </motion.li>
  );
}

export function PortfolioCaseOverlayNav({
  items,
  settings,
  activeId: controlledActiveId,
  onNavigate,
  brandName: _brandName,
  avatarUrl,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  visible = true,
}: PortfolioCaseOverlayNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navRootRef = useRef<HTMLElement>(null);
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
  const overlayBg = resolveHeroPaletteColor(navPalette, 'fond');
  const ink = resolveHeroPaletteColor(navPalette, 'texteFort');
  const mutedInk = resolveHeroPaletteColor(navPalette, 'texteMuted');
  const divider = resolveHeroPaletteColor(navPalette, 'bordure');
  const triggerBg = settings.barBackgroundColor ?? 'rgba(10,10,10,0.72)';
  const triggerInk = settings.itemTextColor ?? ink;
  const gutterClass = portfolioEditorialGutterX(contentGutter);
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
    };
  }, [settings, avatarUrl]);
  const activeItem = sectionItems.find((item) => item.id === activeId);
  const activeLabel = activeItem
    ? formatNavLabel(activeItem.label, settings.labelCase ?? 'uppercase')
    : null;
  const menuSide = settings.caseOverlayMenuSide ?? 'right';
  const menuTrigger = settings.caseOverlayMenuTrigger ?? 'text';
  const menuIcon = (settings.menuControlIcon ?? 'menu') as PortfolioNavMenuControlIcon;

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
    rootRef: navRootRef,
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

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && sectionItems.length <= 1) return null;
  if (sectionItems.length === 0) return null;
  if (!mounted) return null;

  const menuButton = (
    <CaseOverlayMenuTrigger
      open={open}
      triggerStyle={menuTrigger}
      menuIcon={menuIcon}
      ink={ink}
      triggerInk={triggerInk}
      accent={accent}
      reduceMotion={reduceMotion}
      onToggle={() => setOpen((value) => !value)}
    />
  );

  const activeSection =
    !open && activeLabel ? (
      <CaseOverlayActiveLabel
        label={activeLabel}
        accent={accent}
        align={menuSide === 'left' ? 'end' : 'start'}
      />
    ) : (
      <span aria-hidden />
    );

  const logoNode = <PortfolioNavCenterBrand settings={brandSettings} compact />;

  const leftSlot = menuSide === 'left' ? menuButton : activeSection;
  const centerSlot = menuSide === 'left' ? activeSection : logoNode;
  const rightSlot = menuSide === 'left' ? logoNode : menuButton;

  return createPortal(
    <>
      <nav
        ref={navRootRef}
        className={`pointer-events-none fixed inset-x-0 top-0 transition-opacity duration-300 ${
          open ? 'z-[230]' : 'z-[120]'
        } ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Portfolio navigation"
        aria-hidden={!visible}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div
          data-portfolio-nav-clearance-box
          className={`pointer-events-auto grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 py-3 backdrop-blur-md sm:gap-4 ${gutterClass}`}
          style={{
            backgroundColor: open ? `${overlayBg}ee` : triggerBg,
            color: open ? ink : triggerInk,
            borderBottom: `1px solid ${open ? divider : `${divider}33`}`,
          }}
        >
          <div className="flex min-w-0 items-center justify-start">{leftSlot}</div>

          <div className="flex min-w-0 items-center justify-center">{centerSlot}</div>

          <div className="flex min-w-0 items-center justify-end">{rightSlot}</div>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="portfolio-case-overlay-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-0 z-[230] flex flex-col"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0"
              style={{
                background: `linear-gradient(165deg, ${overlayBg} 0%, ${overlayBg}ee 42%, #050505 100%)`,
              }}
              onClick={() => setOpen(false)}
            />

            <div
              className={`pointer-events-none relative flex min-h-0 flex-1 flex-col ${gutterClass}`}
              style={{ color: ink }}
            >
              <div className="pointer-events-auto min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))] pt-[calc(5.5rem+env(safe-area-inset-top,0px))] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-h-full w-full flex-col justify-center">
                  <motion.p
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={OVERLAY_TRANSITION}
                    className="mb-8 shrink-0 text-[11px] font-semibold uppercase tracking-[0.24em]"
                    style={{ color: mutedInk }}
                  >
                    Navigation
                  </motion.p>

                  <ul className="w-full shrink-0">
                    {sectionItems.map((item, index) => (
                      <CaseOverlayRow
                        key={item.id}
                        index={index}
                        item={item}
                        activeId={activeId}
                        labelCase={settings.labelCase ?? 'uppercase'}
                        accent={accent}
                        ink={ink}
                        mutedInk={mutedInk}
                        divider={divider}
                        onNavigate={handleNavigate}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>,
    document.body
  );
}
