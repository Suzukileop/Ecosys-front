'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PortfolioServiceItem } from '@/components/portfolio/PortfolioServicesChrome';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_PALETTE,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';

export function isServicesPricingAuroraDesign(
  presentation: Pick<PortfolioServicesPresentationSettings, 'sectionDesign'> | undefined
): boolean {
  return (presentation?.sectionDesign as string | undefined) === 'services-pricing-aurora';
}

/* -----------------------------------------------------------------------
 * Per-design settings — mirrors the real, already-wired `PortfolioServicesPricingAuroraSettings`
 * in portfolio-services-settings.ts (type/default/merge kept in lockstep here, same convention
 * as portfolio-services-pricing-grid.tsx's own local mirror — this file reads its settings via
 * an unsafe cast rather than importing the canonical type/merge directly).
 * ----------------------------------------------------------------------- */
type PortfolioServicesPricingAuroraColumns = 1 | 2 | 3 | 4;
/** One of 4 fixed palette tokens the creator can pick for the featured card's accent —
 *  same convention as Pricing Grid's `popularColorToken`. */
type PortfolioServicesPricingAuroraPopularColorToken = 'principal' | 'secondaire' | 'texteFort' | 'neutre';

type PortfolioServicesPricingAuroraSettings = {
  /** 0-based index into the real (filtered) services list that gets the
   *  featured-card accent treatment. -1 disables the focus entirely. */
  popularIndex: number;
  /** Suffix shown after a numeric price, e.g. "/ month". Empty hides it. */
  periodLabel: string;
  /** Magnetic CTA label, e.g. "Try for free". */
  ctaLabel: string;
  /** Cards per row on tablet/desktop; mobile always stays a single stacked column. */
  cardsPerRow: PortfolioServicesPricingAuroraColumns;
  /** Which palette token drives the featured card's gradient-border/glass-tint accent. */
  popularColorToken: PortfolioServicesPricingAuroraPopularColorToken;
};

const DEFAULT_SERVICES_PRICING_AURORA_SETTINGS: PortfolioServicesPricingAuroraSettings = {
  popularIndex: 1,
  periodLabel: '/ month',
  ctaLabel: 'Try for free',
  cardsPerRow: 3,
  popularColorToken: 'principal',
};

function mergeServicesPricingAuroraSettings(
  base: PortfolioServicesPricingAuroraSettings,
  patch: unknown
): PortfolioServicesPricingAuroraSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? record.popularIndex
        : base.popularIndex,
    periodLabel: typeof record.periodLabel === 'string' ? record.periodLabel : base.periodLabel,
    ctaLabel: typeof record.ctaLabel === 'string' ? record.ctaLabel : base.ctaLabel,
    cardsPerRow:
      record.cardsPerRow === 1 || record.cardsPerRow === 2 || record.cardsPerRow === 3 || record.cardsPerRow === 4
        ? record.cardsPerRow
        : base.cardsPerRow,
    popularColorToken:
      record.popularColorToken === 'principal' ||
      record.popularColorToken === 'secondaire' ||
      record.popularColorToken === 'texteFort' ||
      record.popularColorToken === 'neutre'
        ? record.popularColorToken
        : base.popularColorToken,
  };
}

/** Reads this design's settings off `presentation.servicesPricingAurora` via a cast, then
 *  re-parses through this file's own local merge (see block comment above). */
function readPricingAuroraSettings(
  presentation: PortfolioServicesPresentationSettings
): PortfolioServicesPricingAuroraSettings {
  const raw = (presentation as unknown as Record<string, unknown>).servicesPricingAurora;
  return mergeServicesPricingAuroraSettings(DEFAULT_SERVICES_PRICING_AURORA_SETTINGS, raw);
}

/* -----------------------------------------------------------------------
 * Price helpers — same logic as formatPrice/isFreePrice in
 * PortfolioServicesChrome.tsx. Duplicated locally because those two aren't
 * exported from that file yet; never hand-formats currency beyond this.
 * ----------------------------------------------------------------------- */
function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

function isFreePrice(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

/** Splits an already-formatted price ("120.00 €") into a giant numeral and
 *  a smaller trailing currency unit, purely for typographic presentation —
 *  the number itself always comes from `formatPrice`, never re-derived. */
function splitPriceDisplay(formatted: string): { amount: string; unit: string } {
  const match = formatted.match(/^(.*\d)\s*(€)$/);
  if (match) return { amount: match[1], unit: match[2] };
  return { amount: formatted, unit: '' };
}

function serviceFeatureLabels(item: PortfolioServiceItem, max = 8): string[] {
  return (item.tasks ?? [])
    .map((task) => task.value?.trim())
    .filter((value): value is string => Boolean(value))
    .slice(0, max);
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True only for a genuine desktop/laptop pointer at >=768px — gates the 3D
 *  tilt, sibling focus-blur, and magnetic CTA off for touch/coarse pointers
 *  and for any viewport under the mobile breakpoint, same idiom as
 *  usePortfolioFinePointerDesktop in portfolio-section-primitives.tsx. */
function useAuroraFinePointerDesktop(minWidthPx = 768) {
  const query = `(min-width: ${minWidthPx}px) and (hover: hover) and (pointer: fine)`;
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

/** Nearest scrollable ancestor — this app can render inside a nested
 *  overflow-y:auto "pages" container (Studio preview), and a hardcoded
 *  `window` scroller silently never fires there. Duplicated per-file on
 *  purpose — every design file in this codebase is self-contained. */
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

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Mirrors the identical helper in portfolio-services-pricing-monolith.tsx —
 *  duplicated on purpose (every design file in this codebase is self-contained). */
function hexToRgba(hex: string, alpha: number): string {
  const match = HEX_COLOR_RE.exec(hex.trim());
  if (!match) return `rgba(249, 115, 22, ${alpha})`;
  let value = match[1];
  if (value.length === 3) {
    value = value
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type AuroraTokens = {
  stageBg: string;
  ink: string;
  muted: string;
  cardBg: string;
  cardBorder: string;
  shadow: string;
  popularCardBg: string;
  popularCardBorder: string;
};

/** Resolved light/dark hex tokens — reads `presentation.activeColorMode`
 *  (the per-section override already computed for every design, see
 *  portfolio-section-color-mode.ts) and picks a concrete color set, same
 *  pattern as heroTokens() in portfolio-services-design-showcase-hero.tsx.
 *  No `.dark` body class, no CSS custom properties, no parallel mechanism.
 *  The featured card is a plain accent-tinted glass fill (same recipe as
 *  portfolio-services-pricing-monolith.tsx) instead of a gradient-border
 *  cutout — one flat treatment, no extra nesting. */
function auroraTokens(activeColorMode: 'light' | 'dark' | undefined, accentColor: string): AuroraTokens {
  const isDark = activeColorMode !== 'light';
  const accent = HEX_COLOR_RE.test(accentColor?.trim() ?? '') ? accentColor.trim() : '#f97316';
  if (isDark) {
    return {
      stageBg: '#000000',
      ink: '#ffffff',
      muted: 'rgba(255,255,255,0.55)',
      cardBg: 'rgba(255,255,255,0.045)',
      cardBorder: 'rgba(255,255,255,0.12)',
      shadow: 'rgba(0,0,0,0.6)',
      popularCardBg: hexToRgba(accent, 0.1),
      popularCardBorder: hexToRgba(accent, 0.55),
    };
  }
  return {
    stageBg: '#ffffff',
    ink: '#0a0a0a',
    muted: 'rgba(10,10,10,0.55)',
    cardBg: 'rgba(10,10,10,0.025)',
    cardBorder: 'rgba(10,10,10,0.09)',
    shadow: 'rgba(10,10,10,0.14)',
    popularCardBg: hexToRgba(accent, 0.06),
    popularCardBorder: hexToRgba(accent, 0.42),
  };
}

/** A flex row (not CSS grid) is what makes an incomplete last row center itself
 *  automatically — no per-index "lone card" special-casing needed. `basis()` is the
 *  per-card width at a given column count/gap; capped to `items.length` so a higher
 *  cards-per-row setting than the item count never leaves dead empty columns. Mirrors
 *  the identical helper in portfolio-services-pricing-monolith.tsx (each design file
 *  in this codebase is self-contained). */
function basis(columns: number, gapPx: number): string {
  return `calc((100% - ${gapPx * (columns - 1)}px) / ${columns})`;
}

function effectiveColumns(cardsPerRow: number, ceiling: number, count: number): number {
  return Math.max(1, Math.min(cardsPerRow, ceiling, count));
}

/**
 * Services "Pricing Aurora" — a borderless glassmorphic 3-tier pricing grid.
 * Translucent backdrop-blur cards (no opaque white rectangles), the popular
 * tier singled out by a fine luminous gradient border instead of a pill
 * badge, monumental clamp()-sized prices, a bracketed magnetic CTA link, and
 * a 3D mouse-tilt + theatrical sibling blur on hover — desktop/fine-pointer
 * only. Below 768px (or any non-fine pointer) the grid stacks edge-to-edge,
 * flat, at rest, with full-width comfortable tap targets.
 */
export function ServicesPricingAuroraSection({
  services,
  presentation,
}: {
  services: PortfolioServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const items = useMemo(
    () => services.filter((service) => service.title.trim().length > 0),
    [services]
  );

  const settings = readPricingAuroraSettings(presentation);
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
  const accent = resolveHeroPaletteColor(palette, settings.popularColorToken);
  const tokens = auroraTokens(presentation.activeColorMode, accent);
  const popularIndex =
    settings.popularIndex >= 0 && settings.popularIndex < items.length ? settings.popularIndex : -1;

  const { href: ctaHref, onNavigate: ctaOnNavigate } = useServicesOrderCtaNav();
  const interactive = useAuroraFinePointerDesktop(768);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const ctaRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const arrowRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // Entrance reveal — cards fade/rise in once, staggered, the first time the
  // grid scrolls into view. Always via ScrollTrigger + the shared deferred
  // refresh()-in-a-try/catch pattern (a real, already-fixed crash class).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const grid = gridRef.current;
    if (!grid) return undefined;
    const cards = cardRefs.current.filter((el): el is HTMLElement => Boolean(el));
    if (cards.length === 0) return undefined;

    gsap.registerPlugin(ScrollTrigger);
    const scroller = getScrollParent(grid) ?? undefined;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(cards, { opacity: 0, y: 32 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: grid, scroller, start: 'top 85%', once: true },
      });
    }, grid);

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [items.length]);

  // Magnetic CTA (proximity within 60px) + arrow spring-sweep on hover.
  // Native listeners in a layout effect — gsap.quickTo per anchor, created
  // once and reused across every pointermove for smooth interpolation.
  useLayoutEffect(() => {
    if (!interactive || prefersReducedMotion()) return undefined;
    const cleanups: Array<() => void> = [];

    items.forEach((_, i) => {
      const card = cardRefs.current[i];
      const cta = ctaRefs.current[i];
      const arrow = arrowRefs.current[i];
      if (!card || !cta) return;

      const moveX = gsap.quickTo(cta, 'x', { duration: 0.45, ease: 'power3' });
      const moveY = gsap.quickTo(cta, 'y', { duration: 0.45, ease: 'power3' });
      const radius = 60;

      const onPointerMove = (event: PointerEvent) => {
        const rect = cta.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const pull = (1 - dist / radius) * 0.5;
          moveX(dx * pull);
          moveY(dy * pull);
        } else {
          moveX(0);
          moveY(0);
        }
      };
      const onPointerLeave = () => {
        gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      };
      const onCtaEnter = () => {
        if (arrow) gsap.to(arrow, { x: 8, duration: 0.5, ease: 'elastic.out(1, 0.35)', overwrite: 'auto' });
      };
      const onCtaLeave = () => {
        if (arrow) gsap.to(arrow, { x: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      };

      card.addEventListener('pointermove', onPointerMove);
      card.addEventListener('pointerleave', onPointerLeave);
      cta.addEventListener('pointerenter', onCtaEnter);
      cta.addEventListener('pointerleave', onCtaLeave);
      cleanups.push(() => {
        card.removeEventListener('pointermove', onPointerMove);
        card.removeEventListener('pointerleave', onPointerLeave);
        cta.removeEventListener('pointerenter', onCtaEnter);
        cta.removeEventListener('pointerleave', onCtaLeave);
      });
    });

    return () => {
      cleanups.forEach((off) => off());
    };
  }, [interactive, items]);

  // Safety net — if the viewport crosses the 768px/fine-pointer gate while a
  // card is mid-tilt (a live resize, not just the initial mount), snap every
  // transform/opacity/filter this design ever sets back to rest.
  useEffect(() => {
    if (interactive) return undefined;
    cardRefs.current.forEach((card) => {
      if (card) gsap.set(card, { clearProps: 'transform,opacity,filter' });
    });
    ctaRefs.current.forEach((cta) => {
      if (cta) gsap.set(cta, { clearProps: 'transform' });
    });
    arrowRefs.current.forEach((arrow) => {
      if (arrow) gsap.set(arrow, { clearProps: 'transform' });
    });
    return undefined;
  }, [interactive]);

  const handleCardEnter = (index: number) => {
    if (!interactive || prefersReducedMotion()) return;
    cardRefs.current.forEach((card, i) => {
      if (i === index || !card) return;
      gsap.to(card, { opacity: 0.1, filter: 'blur(2px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    });
  };

  const handleCardMove = (index: number, event: ReactMouseEvent<HTMLElement>) => {
    if (!interactive || prefersReducedMotion()) return;
    const card = cardRefs.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: py * -4,
      rotateY: px * 4,
      transformPerspective: 900,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const handleCardLeave = (index: number) => {
    const card = cardRefs.current[index];
    if (card) {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
    }
    cardRefs.current.forEach((sibling) => {
      if (!sibling) return;
      gsap.to(sibling, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
    });
  };

  if (items.length === 0) return null;

  // Tablet caps the user's setting at 2-up; desktop honors it exactly up to 4. Both are
  // also capped to the item count so a higher setting than the number of services never
  // strands empty columns — the row just centers instead. Mirrors the identical scheme
  // in portfolio-services-pricing-monolith.tsx.
  const GAP_TABLET_PX = 24;
  const GAP_DESKTOP_PX = 28;
  const colsTablet = effectiveColumns(settings.cardsPerRow, 2, items.length);
  const colsDesktop = effectiveColumns(settings.cardsPerRow, 4, items.length);
  const tabletBasis = colsTablet === 1 ? '28rem' : basis(colsTablet, GAP_TABLET_PX);
  const desktopBasis = colsDesktop === 1 ? '28rem' : basis(colsDesktop, GAP_DESKTOP_PX);

  return (
    <div
      className="relative left-1/2 w-screen -translate-x-1/2 md:static md:left-auto md:w-auto md:translate-x-0"
      style={{ backgroundColor: tokens.stageBg }}
      data-pf-no-color-transition=""
    >
      <style>{`
        .pf-svc-pricing-aurora-row {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          justify-content: center;
          gap: 0px;
        }
        .pf-svc-pricing-aurora-card {
          flex: 0 1 100%;
          min-width: 0;
          max-width: 100%;
        }
        @media (min-width: 640px) {
          .pf-svc-pricing-aurora-row { gap: ${GAP_TABLET_PX}px; }
          .pf-svc-pricing-aurora-card { flex-basis: ${tabletBasis}; max-width: ${tabletBasis}; }
        }
        @media (min-width: 1024px) {
          .pf-svc-pricing-aurora-row { gap: ${GAP_DESKTOP_PX}px; }
          .pf-svc-pricing-aurora-card { flex-basis: ${desktopBasis}; max-width: ${desktopBasis}; }
        }
      `}</style>
      <div className="mx-auto w-full max-w-6xl px-0 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div ref={gridRef} className="pf-svc-pricing-aurora-row">
          {items.map((item, i) => {
            const isPopular = i === popularIndex;
            const priceFormatted = formatPrice(item.basePriceCents);
            const free = isFreePrice(item.basePriceCents);
            const isCustom = priceFormatted === '';
            const { amount, unit } = splitPriceDisplay(priceFormatted);
            const showPeriod = !free && !isCustom && settings.periodLabel.trim().length > 0;
            const features = serviceFeatureLabels(item);
            const title = item.title.trim();
            const description = item.description.trim();

            const content = (
              <div className="relative flex h-full flex-col gap-8 p-8 sm:p-10 lg:p-11">
                {/* Always reserves the badge's row height (via `visibility: hidden`, not a
                    conditional render) so the title/price/description/features below it start
                    at the exact same Y across every card in the row — only the popular card's
                    badge is ever visible, but every card keeps the same top offset. */}
                <span
                  aria-hidden={!isPopular}
                  className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    color: accent,
                    borderColor: tokens.popularCardBorder,
                    visibility: isPopular ? 'visible' : 'hidden',
                  }}
                >
                  Popular
                </span>
                <div className="flex flex-col gap-3">
                  <p
                    className="text-[0.68rem] font-semibold uppercase"
                    style={{ letterSpacing: '0.2em', color: tokens.muted }}
                  >
                    {title}
                  </p>
                  <div
                    className="flex items-end gap-1.5 font-black leading-[0.95] tracking-[-0.02em]"
                    style={{ fontSize: 'clamp(2.75rem, 8vw, 4.25rem)', color: tokens.ink }}
                  >
                    <span>{isCustom ? 'Custom' : amount}</span>
                    {unit ? (
                      <span className="mb-1.5 text-[0.32em] font-semibold" style={{ opacity: 0.6 }}>
                        {unit}
                      </span>
                    ) : null}
                  </div>
                  {showPeriod ? (
                    <p className="text-[0.8rem]" style={{ color: tokens.muted }}>
                      {settings.periodLabel}
                    </p>
                  ) : null}
                </div>

                {description ? (
                  <p
                    className="max-w-[34ch] text-[0.92rem] font-light"
                    style={{ color: tokens.ink, opacity: 0.5, lineHeight: 1.6 }}
                  >
                    {description}
                  </p>
                ) : null}

                {features.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {features.map((feature, featureIndex) => (
                      <li
                        key={`${item.id}-${featureIndex}`}
                        className="flex items-start gap-3 text-[0.86rem]"
                        style={{ color: tokens.ink, opacity: 0.72 }}
                      >
                        <span
                          aria-hidden
                          className="mt-[0.5em] h-[3px] w-[3px] shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-auto pt-2">
                  <a
                    ref={(el) => {
                      ctaRefs.current[i] = el;
                    }}
                    href={ctaHref}
                    onClick={(event) => handleServicesOrderCtaClick(event, ctaHref, ctaOnNavigate)}
                    className="flex min-h-12 w-full items-center justify-center gap-2 text-[0.95rem] font-medium will-change-transform sm:w-auto sm:justify-start"
                    style={{ color: tokens.ink }}
                    data-pf-no-color-transition=""
                  >
                    <span aria-hidden style={{ opacity: 0.5 }}>
                      [
                    </span>
                    <span>{settings.ctaLabel}</span>
                    <span
                      ref={(el) => {
                        arrowRefs.current[i] = el;
                      }}
                      aria-hidden
                      className="inline-block will-change-transform"
                      data-pf-no-color-transition=""
                    >
                      →
                    </span>
                    <span aria-hidden style={{ opacity: 0.5 }}>
                      ]
                    </span>
                  </a>
                </div>
              </div>
            );

            return (
              <article
                key={item.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                aria-label={title || 'Service'}
                onMouseEnter={() => handleCardEnter(i)}
                onMouseMove={(event) => handleCardMove(i, event)}
                onMouseLeave={() => handleCardLeave(i)}
                className="pf-svc-pricing-aurora-card relative rounded-none will-change-transform sm:rounded-[28px]"
                style={{
                  backgroundColor: isPopular ? tokens.popularCardBg : tokens.cardBg,
                  border: `1px solid ${isPopular ? tokens.popularCardBorder : tokens.cardBorder}`,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: `0 24px 64px -34px ${tokens.shadow}`,
                }}
                data-pf-no-color-transition=""
              >
                {content}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
