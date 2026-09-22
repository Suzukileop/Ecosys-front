'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioServiceItem } from '@/components/portfolio/PortfolioServicesChrome';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_PALETTE,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';

/**
 * Local copies of PortfolioServicesChrome's private price helpers — that file does not
 * currently `export` them (only the `PortfolioServiceItem` type is exported), and this
 * design file is not allowed to edit it. Logic kept identical on purpose; see notes.
 */
function isFreePrice(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

/**
 * This design's own small presentational settings — none of these have a backing field on
 * the real `PortfolioServiceItem` data model (no `period` / `isPopular` / `ctaText`). Defined
 * locally and read defensively off `presentation`, mirroring the real `pricingGrid` field +
 * merge dispatcher in portfolio-services-settings.ts — keep both in sync when adding a field.
 */
/** One of 4 fixed palette tokens the creator can pick for the popular card's fill — always a
 *  real color from the active theme palette, never a free hex picker. */
type PortfolioServicesPricingGridPopularColorToken = 'principal' | 'secondaire' | 'texteFort' | 'neutre';

type PortfolioServicesPricingGridSettings = {
  /** 0-based index of the service that renders as the centered, elevated "popular" tier. */
  popularIndex: number;
  /** Micro-label on the popular card's badge ("Popular", "Top"…). Empty hides it. */
  popularBadgeLabel: string;
  /** Small suffix after the price ("/ month"…). Hidden on Free / price-on-request cards. */
  periodLabel: string;
  /** CTA button label — the real data model has no per-item CTA text field. */
  ctaLabel: string;
  /** Which palette token fills the popular card's background (dark mode). */
  popularColorToken: PortfolioServicesPricingGridPopularColorToken;
};

const DEFAULT_SERVICES_PRICING_GRID_SETTINGS: PortfolioServicesPricingGridSettings = {
  popularIndex: 1,
  popularBadgeLabel: 'Popular',
  periodLabel: '/ month',
  ctaLabel: 'Get started',
  popularColorToken: 'principal',
};

function resolvePricingGridSettings(
  presentation: PortfolioServicesPresentationSettings
): PortfolioServicesPricingGridSettings {
  const raw = (presentation as unknown as { pricingGrid?: unknown }).pricingGrid;
  if (!raw || typeof raw !== 'object') return DEFAULT_SERVICES_PRICING_GRID_SETTINGS;
  const record = raw as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? Math.max(0, Math.round(record.popularIndex))
        : DEFAULT_SERVICES_PRICING_GRID_SETTINGS.popularIndex,
    popularBadgeLabel:
      typeof record.popularBadgeLabel === 'string'
        ? record.popularBadgeLabel
        : DEFAULT_SERVICES_PRICING_GRID_SETTINGS.popularBadgeLabel,
    periodLabel:
      typeof record.periodLabel === 'string'
        ? record.periodLabel
        : DEFAULT_SERVICES_PRICING_GRID_SETTINGS.periodLabel,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : DEFAULT_SERVICES_PRICING_GRID_SETTINGS.ctaLabel,
    popularColorToken:
      record.popularColorToken === 'principal' ||
      record.popularColorToken === 'secondaire' ||
      record.popularColorToken === 'texteFort' ||
      record.popularColorToken === 'neutre'
        ? record.popularColorToken
        : DEFAULT_SERVICES_PRICING_GRID_SETTINGS.popularColorToken,
  };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Gates 3D tilt + neighbor focus-blur: fine pointer AND >=768px, exactly per the brief
 *  ("below 768px … disable 3D tilt and kinetic blur"). Same useSyncExternalStore idiom used
 *  throughout this codebase (e.g. useCascadeFinePointerDesktop in portfolio-work-projects-cascade.tsx). */
function useFinePointerDesktop() {
  const query = '(min-width: 768px) and (hover: hover) and (pointer: fine)';
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false
  );
}

/** Nearest scrollable ancestor — this app can render inside a nested overflow-y:auto
 *  "pages" container (Studio preview), and a hardcoded `window` scroller silently never
 *  fires there. Duplicated per-file on purpose — every design file here is self-contained. */
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

/** '#f97316' -> '#0a0a0a' | '#f5f5f5', whichever reads better against that fill. */
function pickContrastInk(hex: string): string {
  const clean = hex.trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#f5f5f5';
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0a0a0a' : '#f5f5f5';
}

function hexToRgbTuple(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

/** Blends `hexA` toward `hexB` by `weightA` (1 = pure A, 0 = pure B) — plain JS hex math, not
 *  a CSS `color-mix()` string, so the result stays a real hex `pickContrastInk` can parse. */
function mixHex(hexA: string, hexB: string, weightA: number): string {
  const a = hexToRgbTuple(hexA);
  const b = hexToRgbTuple(hexB);
  if (!a || !b) return hexA;
  const w = Math.min(1, Math.max(0, weightA));
  const channel = (i: number) => Math.round(a[i] * w + b[i] * (1 - w));
  return `#${[channel(0), channel(1), channel(2)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

type PricingGridTokens = {
  ink: string;
  muted: string;
  cardBg: string;
  cardBorder: string;
  popularBg: string;
  popularInk: string;
  popularMuted: string;
  popularBorder: string;
};

/** Resolves the concrete light/dark color set from the section's own active mode — no `.dark`
 *  body class, no `prefers-color-scheme` CSS variables; every color is a concrete hex/rgba
 *  string passed as inline `style`, exactly like every other design in this codebase (see
 *  `presentation.activeColorMode` usage in portfolio-services-design-showcase-hero.tsx). */
function resolvePricingGridTokens(
  presentation: PortfolioServicesPresentationSettings,
  popularColorToken: PortfolioServicesPricingGridPopularColorToken
): PricingGridTokens {
  const isLight = presentation.activeColorMode === 'light';
  // "Inversion radicale des teintes": the popular card inverts to one of 4 fixed palette colors
  // the creator picks in Layout settings (Principal/Secondary/Contrast/Neutral), blended toward
  // a deep near-black in both modes — reads as a strong, deliberate contrast against the classic
  // cards around it either way.
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
  const rawPopularBg = resolveHeroPaletteColor(palette, popularColorToken);
  // The raw, fully-saturated accent (e.g. a bright #ff3333) read as too high-contrast/neon next
  // to the flat near-black cards around it — blend in a little of that same dark card tone so
  // the popular card still pops but doesn't look like a jarring, unmixed color swatch.
  const popularBg = mixHex(rawPopularBg, isLight ? '#0c0c0c' : '#0b0b0b', 0.85);
  const popularInk = pickContrastInk(popularBg);
  return {
    ink: isLight ? '#0a0a0a' : '#f5f5f5',
    muted: isLight ? 'rgba(10,10,10,0.58)' : 'rgba(245,245,245,0.58)',
    cardBg: isLight ? '#fbfbfa' : '#0b0b0b',
    cardBorder: isLight ? 'rgba(10,10,10,0.1)' : 'rgba(245,245,245,0.12)',
    popularBg,
    popularInk,
    popularMuted: `${popularInk}93`,
    popularBorder: `${popularInk}24`,
  };
}

type PricingGridCard = {
  item: PortfolioServiceItem;
  features: string[];
  priceLabel: string;
  isFree: boolean;
  isPopular: boolean;
};

export function isServicesPricingGridDesign(
  presentation: Pick<PortfolioServicesPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  // Cast: 'services-pricing-grid' isn't in PortfolioServicesSectionDesign's union yet — the
  // coordinator adds it to portfolio-services-settings.ts (see `unionValue`). Once that lands
  // this still holds; the cast only keeps *this* file tsc-clean in the meantime.
  return (presentation?.sectionDesign as string | undefined) === 'services-pricing-grid';
}

/**
 * Services "Pricing Grid" — an Awwwards-grade three-tier pricing table. Large-radius,
 * thin-bordered editorial cards; the popular tier radically inverts its fill (near-black in
 * light mode, a felted gold or the project's own accent in dark mode) and lifts slightly above
 * its neighbors, with a small capitalized badge top-right. Prices are massive display type with
 * a tiny, airy period suffix; feature lists drop checkmarks entirely for pure, breathable
 * opacity-0.6 lines. Hovering a card gives it a soft mouse-driven 3D tilt while every sibling
 * dims to 0.15 opacity with a light kinetic blur, and the "Get started" button is magnetic
 * (gsap.quickTo) and smooth-scrolls to Contact on click. Below 768px, or on any device without
 * a fine hover pointer, tilt/blur are fully disabled: cards stack edge-to-edge at rest, the
 * popular card keeping only its color inversion, with large (48px+) tap targets.
 */
export function ServicesPricingGridSection({
  services,
  presentation,
}: {
  services: PortfolioServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;

  const settings = useMemo(() => resolvePricingGridSettings(presentation), [presentation]);
  const tokens = useMemo(
    () => resolvePricingGridTokens(presentation, settings.popularColorToken),
    [presentation, settings.popularColorToken]
  );
  const tiltCapable = useFinePointerDesktop();
  const { href, onNavigate } = useServicesOrderCtaNav();

  const popularIndex = count > 0 ? Math.min(settings.popularIndex, count - 1) : -1;
  const periodLabel = settings.periodLabel.trim();

  const cards: PricingGridCard[] = useMemo(
    () =>
      items.map((item, index) => ({
        item,
        features: (item.tasks ?? []).map((task) => task.value.trim()).filter(Boolean),
        priceLabel: formatPrice(item.basePriceCents),
        isFree: isFreePrice(item.basePriceCents),
        isPopular: index === popularIndex,
      })),
    [items, popularIndex]
  );

  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ctaRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[index] = el;
  };
  const setCtaRef = (index: number) => (el: HTMLAnchorElement | null) => {
    ctaRefs.current[index] = el;
  };

  // Entrance: cards lift in with a short stagger once the grid scrolls into view.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || count === 0) return undefined;
    const grid = gridRef.current;
    if (!grid) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = getScrollParent(grid) ?? undefined;
    const cardEls = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    const reduce = prefersReducedMotion();

    // The popular card rests slightly lifted (translateY(-20px), no scale — see the tilt
    // effect below for why scale was dropped) once revealed; every other card settles at 0.
    // A function-based `y` end-value keeps this inside the single staggered tween instead of
    // splitting into two calls (which would break the left-to-right stagger order).
    const restY = (_i: number, target: Element) =>
      (target as HTMLElement).dataset.popular === 'true' ? -20 : 0;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(cardEls, { y: restY, opacity: 1 });
        return;
      }
      gsap.set(cardEls, { y: 40, opacity: 0 });
      gsap.to(cardEls, {
        y: restY,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: grid, scroller, start: 'top 85%', once: true },
      });
    }, grid);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ServicesPricingGridSection] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [count]);

  // 3D tilt on the hovered card + massive dim/blur on its siblings. Desktop, fine-pointer,
  // >=768px only (useFinePointerDesktop), and skipped for prefers-reduced-motion.
  useEffect(() => {
    if (!tiltCapable || count === 0 || prefersReducedMotion()) return undefined;
    const cardEls = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (cardEls.length === 0) return undefined;

    const detachers: Array<() => void> = [];
    cardEls.forEach((card) => {
      gsap.set(card, { transformPerspective: 1000 });
      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });

      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotY(px * 6);
        rotX(py * -6);
      };
      const onEnter = () => {
        cardEls.forEach((other) => {
          if (other === card) return;
          gsap.to(other, {
            opacity: 0.15,
            filter: 'blur(1.5px)',
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        cardEls.forEach((other) => {
          gsap.to(other, {
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);
      detachers.push(() => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(card);
        gsap.set(card, { clearProps: 'rotationX,rotationY,opacity,filter,transformPerspective' });
      });
    });

    return () => detachers.forEach((detach) => detach());
  }, [tiltCapable, count]);

  // Magnetic "Get started" buttons — gsap.quickTo per pointer move (not gsap.to per frame),
  // exact shape used throughout this codebase for magnetic elements.
  useEffect(() => {
    if (!tiltCapable || count === 0 || prefersReducedMotion()) return undefined;
    const ctaEls = ctaRefs.current.filter((el): el is HTMLAnchorElement => Boolean(el));
    if (ctaEls.length === 0) return undefined;

    const detachers: Array<() => void> = [];
    ctaEls.forEach((el) => {
      const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        moveX((event.clientX - (rect.left + rect.width / 2)) * 0.4);
        moveY((event.clientY - (rect.top + rect.height / 2)) * 0.4);
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      detachers.push(() => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(el);
      });
    });

    return () => detachers.forEach((detach) => detach());
  }, [tiltCapable, count]);

  if (count === 0) return null;

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      style={{ perspective: 1200 }}
    >
      {cards.map((card, index) => {
        const { item, features, priceLabel, isFree, isPopular } = card;
        const cardBg = isPopular ? tokens.popularBg : tokens.cardBg;
        const cardInk = isPopular ? tokens.popularInk : tokens.ink;
        const cardMuted = isPopular ? tokens.popularMuted : tokens.muted;
        const cardBorder = isPopular ? tokens.popularBorder : tokens.cardBorder;
        const showPeriod = !isFree && Boolean(priceLabel) && Boolean(periodLabel);

        return (
          <div
            key={item.id}
            ref={setCardRef(index)}
            className={`relative flex h-full flex-col rounded-[2rem] border p-8 will-change-transform sm:p-9 ${
              isPopular ? 'lg:-translate-y-5' : ''
            }`}
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              boxShadow: isPopular ? `0 36px 60px -28px ${cardBg}66` : 'none',
              zIndex: isPopular ? 2 : 1,
            }}
            data-pf-no-color-transition=""
            data-popular={isPopular ? 'true' : undefined}
          >
            {isPopular && settings.popularBadgeLabel.trim() ? (
              <span
                className="absolute right-7 top-8 text-[10px] font-semibold uppercase tracking-[0.26em]"
                style={{ color: cardMuted }}
              >
                {settings.popularBadgeLabel}
              </span>
            ) : null}

            <h3
              className={`text-xl font-black tracking-[-0.01em] sm:text-2xl ${isPopular ? 'pr-16' : ''}`}
              style={{ color: cardInk }}
            >
              {item.title}
            </h3>

            {item.description.trim() ? (
              <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: cardMuted }}>
                {item.description.trim()}
              </p>
            ) : null}

            <div className="mt-9 flex items-baseline gap-2">
              <span
                className="text-[2.75rem] font-black leading-none tracking-[-0.03em] sm:text-[3.1rem]"
                style={{ color: cardInk }}
              >
                {priceLabel || 'On request'}
              </span>
              {showPeriod ? (
                <span className="text-[0.7rem] font-light tracking-[0.02em]" style={{ color: cardMuted }}>
                  {periodLabel}
                </span>
              ) : null}
            </div>

            {features.length > 0 ? (
              <ul className="mt-10 flex flex-1 flex-col gap-5">
                {features.map((feature, featureIndex) => (
                  <li
                    key={`${item.id}-feature-${featureIndex}`}
                    className="text-[0.95rem] font-normal leading-snug"
                    style={{ color: cardInk, opacity: 0.6 }}
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1" />
            )}

            <a
              ref={setCtaRef(index)}
              href={href}
              onClick={(event) => handleServicesOrderCtaClick(event, href, onNavigate)}
              className="mt-10 inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-6 text-sm font-semibold"
              style={
                isPopular
                  ? { backgroundColor: cardInk, color: cardBg }
                  : { backgroundColor: tokens.ink, color: tokens.cardBg }
              }
              data-pf-no-color-transition=""
            >
              {settings.ctaLabel}
            </a>
          </div>
        );
      })}
    </div>
  );
}
