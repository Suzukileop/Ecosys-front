'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import type { PortfolioServiceItem } from '@/components/portfolio/PortfolioServicesChrome';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';

/**
 * Pricing Monolith — Services body design (`sectionDesign === 'services-pricing-monolith'`).
 * A classic 3-tier pricing grid rebuilt as borderless glassmorphic slabs: massive
 * high-contrast display prices, feather-thin micro-caps tier names, a GSAP 3D tilt
 * + sibling depth-of-field on hover (desktop fine-pointer only), and a magnetic
 * "[ Get Started → ]" link per card that routes to the Contact section. The
 * "populaire" tier (`settings.popularIndex`) gets an accent-tinted glass fill and a
 * slight monolithic lift instead of a loud badge-only treatment.
 *
 * Light/dark follows the section's own resolved mode exactly like every other
 * design in this codebase — `presentation.activeColorMode` (never a `.dark` body
 * class or a parallel `prefers-color-scheme` system) — and every color is a
 * concrete hex/rgba string passed as inline `style`, keyed off
 * `presentation.cardAccentColor` for the accent.
 */

const DESIGN_ID = 'services-pricing-monolith';

/* ----------------------------------------------------------------------- *
 * This design's own settings — first Services design to need one (Services
 * has no per-design settings machinery yet, unlike Work's 14-design system).
 * The coordinator moves this block into portfolio-services-settings.ts and
 * adds `servicesPricingMonolith?: PortfolioServicesPricingMonolithSettings`
 * to `PortfolioServicesPresentationSettings` — see `settingsTypeCode` in the
 * wiring package. Until then, `resolvePricingMonolithSettings` below reads
 * the field through a local structural extension so this file type-checks
 * standalone.
 * ----------------------------------------------------------------------- */

export type PortfolioServicesPricingMonolithColumns = 1 | 2 | 3 | 4;

export type PortfolioServicesPricingMonolithSettings = {
  /** 0-based item index rendered as the "Popular" focal tier; -1 (or out of range) = none. */
  popularIndex: number;
  /** Suffix after the price on paid tiers, e.g. "/ month", "/ life". */
  periodLabel: string;
  /** Whether the period suffix renders at all. */
  showPeriod: boolean;
  /** The magnetic CTA link label ("[ Get Started → ]"). */
  ctaLabel: string;
  /** Cards per row on tablet/desktop; mobile always stays a single stacked column. */
  cardsPerRow: PortfolioServicesPricingMonolithColumns;
};

export const DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS: PortfolioServicesPricingMonolithSettings = {
  popularIndex: 1,
  periodLabel: '/ month',
  showPeriod: true,
  ctaLabel: 'Get Started',
  cardsPerRow: 3,
};

export function mergeServicesPricingMonolithSettings(
  base: PortfolioServicesPricingMonolithSettings,
  patch: unknown
): PortfolioServicesPricingMonolithSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    popularIndex:
      typeof record.popularIndex === 'number' && Number.isFinite(record.popularIndex)
        ? Math.trunc(record.popularIndex)
        : base.popularIndex,
    periodLabel:
      typeof record.periodLabel === 'string' && record.periodLabel.trim()
        ? record.periodLabel
        : base.periodLabel,
    showPeriod: typeof record.showPeriod === 'boolean' ? record.showPeriod : base.showPeriod,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
    cardsPerRow:
      record.cardsPerRow === 1 || record.cardsPerRow === 2 || record.cardsPerRow === 3 || record.cardsPerRow === 4
        ? record.cardsPerRow
        : base.cardsPerRow,
  };
}

/** Structural extension so `presentation.servicesPricingMonolith` reads cleanly
 *  before the coordinator adds the field to the real settings type. */
type PresentationWithPricingMonolith = PortfolioServicesPresentationSettings & {
  servicesPricingMonolith?: unknown;
};

function resolvePricingMonolithSettings(
  presentation: PortfolioServicesPresentationSettings
): PortfolioServicesPricingMonolithSettings {
  const raw = (presentation as PresentationWithPricingMonolith).servicesPricingMonolith;
  return mergeServicesPricingMonolithSettings(DEFAULT_SERVICES_PRICING_MONOLITH_SETTINGS, raw);
}

/* ----------------------------------------------------------------------- *
 * Pricing helpers — mirror PortfolioServicesChrome's private `formatPrice` /
 * `isFreePrice` 1:1 (they are not exported there yet; see wiring notes) so
 * this file never hand-formats currency independently.
 * ----------------------------------------------------------------------- */

function isFreePrice(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

/** Splits "100.00 €" into a huge-display `amount` ("100.00") and a small-caps
 *  `suffix` ("€") rendered at a fraction of the amount's font size — keeps the
 *  currency glyph legible instead of ballooning to the same display size as the
 *  digits (the digits themselves are sized in `cqi` off the card's own width, see
 *  the `[container-type:inline-size]` card wrapper below, so this never overflows
 *  a narrow column regardless of the cards-per-row setting). Mirrors Aurora's
 *  `splitPriceDisplay` 1:1 (each design file stays self-contained). */
function splitPriceDisplay(formatted: string): { amount: string; suffix: string } {
  const match = formatted.match(/^(.*\d)\s*(€)$/);
  if (match) return { amount: match[1], suffix: match[2] };
  return { amount: formatted, suffix: '' };
}

/* ----------------------------------------------------------------------- *
 * Color tokens — resolved hex/rgba strings keyed off the section's own
 * resolved light/dark mode + accent color, passed down as inline style.
 * ----------------------------------------------------------------------- */

/** Mirrors DEFAULT_SERVICES_ACCENT_COLOR in portfolio-services-settings.ts — kept
 *  as a local literal since only the presentation *type* may be imported from there. */
const FALLBACK_ACCENT = '#f97316';
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

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

type MonolithTokens = {
  bg: string;
  ink: string;
  muted: string;
  faint: string;
  hairline: string;
  cardBg: string;
  cardBorder: string;
  popularCardBg: string;
  popularCardBorder: string;
  accent: string;
};

function monolithTokens(isDark: boolean, accentColor: string): MonolithTokens {
  const accent = HEX_COLOR_RE.test(accentColor?.trim() ?? '') ? accentColor.trim() : FALLBACK_ACCENT;
  return isDark
    ? {
        bg: '#050505',
        ink: '#f5f5f4',
        muted: 'rgba(245, 245, 244, 0.6)',
        faint: 'rgba(245, 245, 244, 0.4)',
        hairline: 'rgba(245, 245, 244, 0.12)',
        cardBg: 'rgba(255, 255, 255, 0.045)',
        cardBorder: 'rgba(255, 255, 255, 0.12)',
        popularCardBg: hexToRgba(accent, 0.1),
        popularCardBorder: hexToRgba(accent, 0.55),
        accent,
      }
    : {
        bg: '#ffffff',
        ink: '#0a0a0a',
        muted: 'rgba(10, 10, 10, 0.58)',
        faint: 'rgba(10, 10, 10, 0.38)',
        hairline: 'rgba(10, 10, 10, 0.1)',
        cardBg: 'rgba(10, 10, 10, 0.022)',
        cardBorder: 'rgba(10, 10, 10, 0.1)',
        popularCardBg: hexToRgba(accent, 0.06),
        popularCardBorder: hexToRgba(accent, 0.42),
        accent,
      };
}

/* ----------------------------------------------------------------------- *
 * Motion utilities
 * ----------------------------------------------------------------------- */

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fine-pointer desktop gate — tilt/blur/magnet are all inert below this (touch, or a
 *  narrow fine-pointer viewport under 768px both fall back to resting cards). */
const FINE_POINTER_DESKTOP_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 768px)';

function useFinePointerDesktop(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia(FINE_POINTER_DESKTOP_QUERY);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(FINE_POINTER_DESKTOP_QUERY).matches),
    () => false
  );
}

/** Nearest scrollable ancestor — the Studio preview can render this section inside a
 *  nested scroll container, where a hardcoded `window` scroller never fires. Duplicated
 *  per design file on purpose (every design file in this codebase is self-contained). */
function getScrollParent(el: HTMLElement | null): HTMLElement | undefined {
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
  return undefined;
}

/** A flex row (not CSS grid) is what makes an incomplete last row center itself
 *  automatically — no per-index "lone card" special-casing needed. `basis()` is the
 *  per-card width at a given column count/gap; capped to `services.length` so a
 *  higher cards-per-row setting than the item count never leaves dead empty columns. */
function basis(columns: number, gapPx: number): string {
  return `calc((100% - ${gapPx * (columns - 1)}px) / ${columns})`;
}

function effectiveColumns(cardsPerRow: number, ceiling: number, count: number): number {
  return Math.max(1, Math.min(cardsPerRow, ceiling, count));
}

function CheckGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" aria-hidden>
      <path
        d="M3 8.5l3 3 7-7.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const MOBILE_EDGE_STYLE: CSSProperties = { WebkitTapHighlightColor: 'transparent' };

export function isServicesPricingMonolithDesign(
  presentation: { sectionDesign?: string } | null | undefined
): boolean {
  return presentation?.sectionDesign === DESIGN_ID;
}

export function ServicesPricingMonolithSection({
  services,
  presentation,
}: {
  services: PortfolioServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const arrowRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isFinePointerDesktop = useFinePointerDesktop();
  const nav = useServicesOrderCtaNav();

  const itemsKey = useMemo(() => services.map((item) => item.id).join('|'), [services]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (cards.length === 0) return undefined;

    const reduced = prefersReducedMotion();

    // Baseline — tilt/blur always start at rest; only the interactive branch below
    // ever moves them away from this.
    gsap.set(cards, { rotateX: 0, rotateY: 0, filter: 'blur(0px)', transformPerspective: 900 });

    let ctx: gsap.Context | undefined;
    if (reduced) {
      gsap.set(cards, { opacity: 1, y: 0 });
    } else {
      ctx = gsap.context(() => {
        gsap.set(cards, { opacity: 0, y: 28 });
        ScrollTrigger.batch(cards, {
          scroller: getScrollParent(root),
          start: 'top 90%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }),
        });
        const refreshId = window.setTimeout(() => {
          try {
            ScrollTrigger.refresh();
          } catch (error) {
            console.error('[ScrollTrigger] deferred refresh() failed', error);
          }
        }, 90);
        return () => window.clearTimeout(refreshId);
      }, root);
    }

    const cleanups: Array<() => void> = [];

    if (isFinePointerDesktop && !reduced) {
      // 3D tilt + sibling depth-of-field focus, per card.
      const tiltSetters = cards.map((card) => ({
        rx: gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3' }),
        ry: gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3' }),
      }));

      cards.forEach((card, index) => {
        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width - 0.5;
          const py = (event.clientY - rect.top) / rect.height - 0.5;
          tiltSetters[index].ry(px * 9);
          tiltSetters[index].rx(py * -9);
        };
        const onEnter = () => {
          cards.forEach((other, otherIndex) => {
            if (otherIndex === index) return;
            gsap.to(other, { opacity: 0.12, filter: 'blur(2px)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          });
        };
        const onLeave = () => {
          tiltSetters[index].rx(0);
          tiltSetters[index].ry(0);
          cards.forEach((other) => {
            gsap.to(other, { opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
          });
        };
        card.addEventListener('pointermove', onMove);
        card.addEventListener('pointerenter', onEnter);
        card.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          card.removeEventListener('pointermove', onMove);
          card.removeEventListener('pointerenter', onEnter);
          card.removeEventListener('pointerleave', onLeave);
        });
      });

      // Magnetic "[ Get Started → ]" CTA, per card.
      ctaRefs.current.forEach((cta, index) => {
        if (!cta) return;
        const arrow = arrowRefs.current[index];
        const moveX = gsap.quickTo(cta, 'x', { duration: 0.45, ease: 'power3' });
        const moveY = gsap.quickTo(cta, 'y', { duration: 0.45, ease: 'power3' });
        const onMove = (event: PointerEvent) => {
          const rect = cta.getBoundingClientRect();
          moveX((event.clientX - (rect.left + rect.width / 2)) * 0.35);
          moveY((event.clientY - (rect.top + rect.height / 2)) * 0.35);
        };
        const onEnter = () => {
          if (!arrow) return;
          gsap
            .timeline({ defaults: { overwrite: 'auto' } })
            .to(arrow, { x: 7, duration: 0.16, ease: 'power2.out' })
            .to(arrow, { x: 0, duration: 0.55, ease: 'elastic.out(1, 0.35)' });
        };
        const onLeave = () => {
          gsap.to(cta, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
        };
        cta.addEventListener('pointermove', onMove);
        cta.addEventListener('pointerenter', onEnter);
        cta.addEventListener('pointerleave', onLeave);
        cleanups.push(() => {
          cta.removeEventListener('pointermove', onMove);
          cta.removeEventListener('pointerenter', onEnter);
          cta.removeEventListener('pointerleave', onLeave);
        });
      });
    }

    return () => {
      ctx?.revert();
      cleanups.forEach((off) => off());
    };
  }, [isFinePointerDesktop, itemsKey]);

  if (services.length === 0) return null;

  const settings = resolvePricingMonolithSettings(presentation);
  const isDark = presentation.activeColorMode !== 'light';
  const tokens = monolithTokens(isDark, presentation.cardAccentColor);
  const popularIndex =
    settings.popularIndex >= 0 && settings.popularIndex < services.length ? settings.popularIndex : -1;

  // Tablet caps the user's setting at 2-up (these cards are text-dense); desktop honors
  // it exactly. Both are also capped to the item count so a higher setting than the
  // number of services never strands empty columns — the row just centers instead.
  const GAP_MOBILE_PX = 16;
  const GAP_TABLET_PX = 24;
  const GAP_DESKTOP_PX = 32;
  const colsTablet = effectiveColumns(settings.cardsPerRow, 2, services.length);
  const colsDesktop = effectiveColumns(settings.cardsPerRow, 4, services.length);
  const tabletBasis = colsTablet === 1 ? '28rem' : basis(colsTablet, GAP_TABLET_PX);
  const desktopBasis = colsDesktop === 1 ? '28rem' : basis(colsDesktop, GAP_DESKTOP_PX);

  return (
    <div ref={rootRef} className="relative" data-pf-no-color-transition="">
      <style>{`
        .pf-svc-pricing-monolith-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: ${GAP_MOBILE_PX}px;
        }
        .pf-svc-pricing-monolith-card {
          flex: 0 1 100%;
          min-width: 0;
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .pf-svc-pricing-monolith-row { gap: ${GAP_TABLET_PX}px; }
          .pf-svc-pricing-monolith-card { flex-basis: ${tabletBasis}; max-width: ${tabletBasis}; }
        }
        @media (min-width: 1024px) {
          .pf-svc-pricing-monolith-row { gap: ${GAP_DESKTOP_PX}px; }
          .pf-svc-pricing-monolith-card { flex-basis: ${desktopBasis}; max-width: ${desktopBasis}; }
        }
      `}</style>
      {/* Only this backdrop breaks full-bleed — the content below stays in normal flow so it
          inherits the page's own content max-width + left/right gutter from `<main>`, exactly
          like every other section (mirrors `PortfolioSectionShell`'s own background layer). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 left-1/2 z-0 w-screen -translate-x-1/2"
        style={{ backgroundColor: tokens.bg }}
        data-pf-no-color-transition=""
      />
      <div className="relative z-[1] w-full py-20 sm:py-24 md:py-28">
        <div className="pf-svc-pricing-monolith-row">
          {services.map((item, index) => {
            const isPopular = index === popularIndex;
            const priceText = formatPrice(item.basePriceCents);
            const free = isFreePrice(item.basePriceCents);
            const { amount: priceAmount, suffix: priceSuffix } = splitPriceDisplay(priceText);
            const features = item.tasks.map((task) => task.value.trim()).filter(Boolean);
            const cardBg = isPopular ? tokens.popularCardBg : tokens.cardBg;
            const cardBorder = isPopular ? tokens.popularCardBorder : tokens.cardBorder;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                data-pf-no-color-transition=""
                className={`pf-svc-pricing-monolith-card group/pricing relative flex flex-col gap-7 rounded-[22px] border px-6 py-10 backdrop-blur-[12px] will-change-transform [container-type:inline-size] sm:px-8 md:rounded-[28px] md:px-7 md:py-11 ${
                  isPopular ? 'md:-translate-y-3 md:py-14' : ''
                }`}
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  ...MOBILE_EDGE_STYLE,
                }}
              >
                {isPopular ? (
                  <span
                    className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: tokens.accent, borderColor: tokens.popularCardBorder }}
                  >
                    Popular
                  </span>
                ) : null}

                <p
                  className="text-[11px] font-medium uppercase leading-none tracking-[0.18em]"
                  style={{ color: tokens.muted }}
                >
                  {item.title}
                </p>

                <div className="flex min-w-0 flex-wrap items-end gap-x-2 gap-y-1">
                  {priceText ? (
                    <span
                      className="whitespace-nowrap text-[clamp(2.25rem,13cqi,4.5rem)] font-black leading-[0.9] tracking-[-0.04em]"
                      style={{ color: tokens.ink }}
                    >
                      {priceAmount}
                      {priceSuffix ? (
                        <span
                          className="ml-1 text-[0.32em] font-semibold"
                          style={{ opacity: 0.65 }}
                        >
                          {priceSuffix}
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span
                      className="text-[clamp(2rem,11cqi,3.75rem)] font-black leading-[0.9] tracking-[-0.04em]"
                      style={{ color: tokens.ink }}
                    >
                      Custom
                    </span>
                  )}
                  {settings.showPeriod && !free && priceText ? (
                    <span
                      className="pb-[0.3em] text-[11px] font-medium uppercase leading-none tracking-[0.18em]"
                      style={{ color: tokens.faint }}
                    >
                      {settings.periodLabel}
                    </span>
                  ) : null}
                </div>

                {features.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2.5 text-sm leading-[1.5]">
                        <CheckGlyph color={tokens.accent} />
                        <span style={{ color: tokens.muted }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <a
                  ref={(el) => {
                    ctaRefs.current[index] = el;
                  }}
                  href={nav.href}
                  onClick={(event) => handleServicesOrderCtaClick(event, nav.href, nav.onNavigate)}
                  data-pf-no-color-transition=""
                  className="mt-auto flex min-h-[48px] w-full items-center justify-center gap-1.5 pt-4 text-sm font-medium tracking-[0.02em] will-change-transform md:w-fit md:justify-start"
                  style={{ color: tokens.ink, borderTop: `1px solid ${tokens.hairline}` }}
                >
                  <span aria-hidden style={{ color: tokens.faint }}>
                    [
                  </span>
                  <span>{settings.ctaLabel}</span>
                  <span
                    ref={(el) => {
                      arrowRefs.current[index] = el;
                    }}
                    aria-hidden
                    data-pf-no-color-transition=""
                    className="inline-block will-change-transform"
                  >
                    →
                  </span>
                  <span aria-hidden style={{ color: tokens.faint }}>
                    ]
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
