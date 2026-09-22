'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PortfolioServiceItem } from '@/components/portfolio/PortfolioServicesChrome';
import type { PortfolioServicesPresentationSettings } from '@/components/portfolio/portfolio-services-settings';
import {
  handleServicesOrderCtaClick,
  useServicesOrderCtaNav,
} from '@/components/portfolio/portfolio-section-primitives';

/**
 * Services "Pricing Bento" — a two-tier premium bento composition: one card carries a
 * textured, asymmetric graphic header built from interlocking geometric shapes in the
 * palette accent, the other(s) stay borderless and minimal. Massive display pricing,
 * bullet-less features floating at 0.5 opacity with generous line-height, a magnetic
 * "Get Started" CTA routed to Contact, a soft 3D cursor tilt (max 4°) with cinematic
 * focus-blur on sibling cards while one is hovered, and a scroll-triggered cascade
 * entrance (cards up, then features line-reveal at a 30ms stagger). 3D tilt/blur and the
 * CTA magnet are gated to fine-pointer desktops at 768px+ and off entirely under
 * prefers-reduced-motion; below that the grid becomes a single, edge-to-edge vertical
 * flow with full-width, thumb-friendly CTAs.
 *
 * Self-contained by this codebase's convention (every design file duplicates its own
 * small helpers rather than sharing cross-design internals) — see `notes` in this
 * design's returned wiring package for the two deliberate deviations: `formatPrice` /
 * `isFreePrice` are re-implemented locally because `PortfolioServicesChrome.tsx` does not
 * currently export them, and this design's own settings (`PortfolioServicesPricingBentoSettings`)
 * are read defensively off `presentation` until the coordinator wires the `pricingBento`
 * field onto `PortfolioServicesPresentationSettings`.
 */

/* ------------------------------------------------------------------------------------ *
 * This design's own settings — a single small typed object the creator configures once
 * in Settings > Services > Design, mirroring every `PortfolioWorkProjectsXSettings` in
 * portfolio-work-settings.ts. Kept local (not imported) since this file must not edit
 * portfolio-services-settings.ts — the coordinator pastes an exported copy of this same
 * type/default/merge trio there and wires a `pricingBento` field onto the presentation
 * type, per this design's returned `settingsTypeCode`.
 * ------------------------------------------------------------------------------------ */
type PortfolioServicesPricingBentoSettings = {
  /** Index (within the rendered service list) of the card that gets the textured,
   *  asymmetric graphic header. Clamped to the available items at render time. */
  graphicHeaderIndex: number;
  /** Small suffix shown after a non-free price (e.g. "/ project", "/ mo"). Empty hides it. */
  periodLabel: string;
  /** Label on every card's CTA button (routes to the Contact section). */
  ctaLabel: string;
};

const DEFAULT_SERVICES_PRICING_BENTO_SETTINGS: PortfolioServicesPricingBentoSettings = {
  graphicHeaderIndex: 0,
  periodLabel: '/ project',
  ctaLabel: 'Get Started',
};

function mergeServicesPricingBentoSettings(
  base: PortfolioServicesPricingBentoSettings,
  patch: unknown
): PortfolioServicesPricingBentoSettings {
  if (!patch || typeof patch !== 'object') return base;
  const record = patch as Record<string, unknown>;
  return {
    graphicHeaderIndex:
      typeof record.graphicHeaderIndex === 'number' && Number.isFinite(record.graphicHeaderIndex)
        ? Math.max(0, Math.round(record.graphicHeaderIndex))
        : base.graphicHeaderIndex,
    periodLabel: typeof record.periodLabel === 'string' ? record.periodLabel : base.periodLabel,
    ctaLabel:
      typeof record.ctaLabel === 'string' && record.ctaLabel.trim()
        ? record.ctaLabel.trim()
        : base.ctaLabel,
  };
}

/** Local equivalents of PortfolioServicesChrome's price helpers — that module does not
 *  currently export `isFreePrice`/`formatPrice` (verified before writing this file), and
 *  this file must not edit any other file, so the exact same logic is duplicated here
 *  rather than imported. See `notes` in the returned wiring package. */
function isFreePrice(cents: number | null | undefined): boolean {
  return cents != null && !Number.isNaN(cents) && cents === 0;
}

function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  if (cents === 0) return 'Free';
  return `${(cents / 100).toFixed(2)} €`;
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Fine-pointer desktop AND 768px+ — 3D tilt / cinematic blur are explicitly off both on
 *  touch devices and on any narrow viewport, even one with a real mouse attached. */
function useTiltCapableViewport(): boolean {
  const query = '(hover: hover) and (pointer: fine) and (min-width: 768px)';
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false
  );
}

/** Nearest scrollable ancestor — this app can render inside a nested scroll container
 *  (Studio preview), where a hardcoded `window` scroller would silently never fire. */
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

type BentoTokens = {
  bg: string;
  ink: string;
  inkMuted: string;
  border: string;
  cardBg: string;
  cardBgGraphic: string;
  accent: string;
  accentSoft: string;
};

function bentoTokens(presentation: PortfolioServicesPresentationSettings): BentoTokens {
  const isDark = presentation.activeColorMode !== 'light';
  const accent = presentation.cardAccentColor || presentation.ctaColor || '#f97316';
  const bg = isDark ? '#050505' : '#ffffff';
  const ink = isDark ? '#f5f5f5' : '#0a0a0a';
  return {
    bg,
    ink,
    inkMuted: isDark ? 'rgba(245,245,245,0.5)' : 'rgba(10,10,10,0.5)',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,10,10,0.18)',
    cardBg: isDark ? '#0c0c0c' : '#ffffff',
    cardBgGraphic: isDark
      ? `color-mix(in srgb, ${accent} 22%, #0c0c0c)`
      : `color-mix(in srgb, ${accent} 10%, #ffffff)`,
    accent,
    accentSoft: `color-mix(in srgb, ${accent} 55%, ${bg})`,
  };
}

/** Textured, asymmetric header — interlocking geometric shapes in the palette accent.
 *  Only the featured card renders this; every other card stays borderless and minimal. */
function GraphicHeader({ tokens }: { tokens: BentoTokens }) {
  return (
    <div
      className="relative h-36 w-full overflow-hidden sm:h-40"
      style={{ backgroundColor: tokens.cardBgGraphic }}
      aria-hidden
    >
      <span
        className="absolute -right-10 -top-14 h-48 w-48"
        style={{
          background: `linear-gradient(135deg, ${tokens.accent} 0%, ${tokens.accentSoft} 100%)`,
          borderRadius: '38% 62% 63% 37% / 41% 44% 56% 59%',
          opacity: 0.95,
        }}
      />
      <span
        className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full"
        style={{ backgroundColor: tokens.accentSoft, opacity: 0.5 }}
      />
      <span
        className="absolute right-10 top-8 h-16 w-16 rounded-[26%] border"
        style={{ borderColor: tokens.ink, opacity: 0.16, transform: 'rotate(22deg)' }}
      />
      <span
        className="absolute bottom-6 left-10 h-2 w-14 rounded-full"
        style={{ backgroundColor: tokens.ink, opacity: 0.14 }}
      />
    </div>
  );
}

/** Magnetic CTA — `gsap.quickTo` follows the cursor within the button while hovered,
 *  elastic-settles back to rest on leave. No glow; a clean flat/outline pill. */
function MagneticCta({
  href,
  onNavigate,
  label,
  tokens,
  magnetic,
  variant,
}: {
  href: string;
  onNavigate?: (href: string) => void;
  label: string;
  tokens: BentoTokens;
  magnetic: boolean;
  variant: 'solid' | 'outline';
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !magnetic || prefersReducedMotion()) return undefined;

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
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.set(el, { clearProps: 'x,y' });
    };
  }, [magnetic]);

  const solid = variant === 'solid';

  return (
    <a
      ref={ref}
      href={href}
      onClick={(event) => handleServicesOrderCtaClick(event, href, onNavigate)}
      className="group relative inline-flex w-full items-center justify-center gap-2 rounded-full px-6 text-[0.95rem] font-semibold will-change-transform md:w-auto"
      style={{
        minHeight: 48,
        backgroundColor: solid ? tokens.ink : 'transparent',
        color: solid ? tokens.bg : tokens.ink,
        border: `1px solid ${solid ? tokens.ink : tokens.border}`,
      }}
      data-pf-no-color-transition=""
    >
      {label}
      <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}

function PricingCard({
  item,
  isGraphic,
  spanFullRow,
  tokens,
  ctaLabel,
  periodLabel,
  ctaHref,
  ctaOnNavigate,
  magnetic,
  cardRef,
}: {
  item: PortfolioServiceItem;
  isGraphic: boolean;
  spanFullRow: boolean;
  tokens: BentoTokens;
  ctaLabel: string;
  periodLabel: string;
  ctaHref: string;
  ctaOnNavigate?: (href: string) => void;
  magnetic: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const priceDisplay = formatPrice(item.basePriceCents);
  const free = isFreePrice(item.basePriceCents);
  const features = item.tasks.map((task) => task.value.trim()).filter((value) => value.length > 0);

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col overflow-hidden rounded-[28px] border will-change-transform ${
        spanFullRow ? 'md:col-span-2' : ''
      }`}
      style={{ backgroundColor: isGraphic ? tokens.cardBgGraphic : tokens.cardBg, borderColor: tokens.border }}
      data-pf-no-color-transition=""
    >
      {isGraphic ? (
        <GraphicHeader tokens={tokens} />
      ) : (
        <div className="h-2 w-full" style={{ backgroundColor: tokens.cardBg }} aria-hidden />
      )}

      <div className="flex flex-1 flex-col p-7 sm:p-9">
        <h3
          className="font-sans text-2xl font-black leading-[1.05] tracking-tight sm:text-[1.7rem]"
          style={{ color: tokens.ink }}
        >
          {item.title}
        </h3>

        {item.description.trim() ? (
          <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: tokens.inkMuted }}>
            {item.description}
          </p>
        ) : null}

        {free || priceDisplay ? (
          <div className="mt-7 flex items-baseline gap-1.5">
            <span
              className="text-[2.6rem] font-black leading-none tracking-tight sm:text-5xl"
              style={{ color: tokens.ink }}
            >
              {free ? 'Free' : priceDisplay}
            </span>
            {!free && periodLabel.trim() ? (
              <span className="text-[0.85rem] font-light tracking-wide" style={{ color: tokens.inkMuted }}>
                {periodLabel}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-7 text-[1.05rem] font-medium italic" style={{ color: tokens.inkMuted }}>
            Price on request
          </p>
        )}

        {item.deadline.trim() ? (
          <p className="mt-1.5 text-[13px] font-medium" style={{ color: tokens.inkMuted }}>
            {item.deadline}
          </p>
        ) : null}

        {features.length > 0 ? (
          <ul className="mt-8 list-none space-y-0 pl-0">
            {features.map((feature, featureIndex) => (
              <li key={featureIndex} className="overflow-hidden">
                <span
                  className="block py-[0.35rem] text-[1.05rem]"
                  style={{ color: tokens.ink, opacity: 0.5, lineHeight: 1.7 }}
                  data-feature-line
                  data-pf-no-color-transition=""
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-9">
          <MagneticCta
            href={ctaHref}
            onNavigate={ctaOnNavigate}
            label={ctaLabel}
            tokens={tokens}
            magnetic={magnetic}
            variant={isGraphic ? 'solid' : 'outline'}
          />
        </div>
      </div>
    </div>
  );
}

export function ServicesPricingBentoSection({
  services,
  presentation,
}: {
  services: PortfolioServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  // Defensive read: `pricingBento` isn't on `PortfolioServicesPresentationSettings` yet —
  // the coordinator wires it on afterward (see this design's `settingsTypeCode`). Reading
  // it this way keeps this file both self-contained and forward-compatible without
  // editing the shared settings file.
  const pricingBento = mergeServicesPricingBentoSettings(
    DEFAULT_SERVICES_PRICING_BENTO_SETTINGS,
    (presentation as unknown as { pricingBento?: unknown }).pricingBento
  );
  const tokens = bentoTokens(presentation);
  const tiltCapable = useTiltCapableViewport();
  const nav = useServicesOrderCtaNav();

  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // The featured card always leads the grid — reorder once here rather than just flagging
  // its original position, so "featured" reliably reads as "shown first" for the creator.
  const orderedServices = useMemo(() => {
    if (services.length === 0) return services;
    const featuredIndex = Math.min(pricingBento.graphicHeaderIndex, services.length - 1);
    if (featuredIndex === 0) return services;
    const featured = services[featuredIndex];
    const rest = services.filter((_, index) => index !== featuredIndex);
    return [featured, ...rest];
  }, [services, pricingBento.graphicHeaderIndex]);

  const graphicIndex = 0;
  const graphicSpansFullRow = orderedServices.length >= 3;

  // Scroll-triggered cascade: cards rise in (power3.out, staggered), then each card's
  // feature lines reveal through their overflow-hidden masks at a fast 30ms stagger.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (!grid || cards.length === 0) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(cards, { opacity: 1, y: 0 });
      cards.forEach((card) => {
        const lines = card.querySelectorAll<HTMLElement>('[data-feature-line]');
        if (lines.length) gsap.set(lines, { yPercent: 0 });
      });
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);
    let ctx: ReturnType<typeof gsap.context> | undefined;
    try {
      ctx = gsap.context(() => {
        ScrollTrigger.batch(cards, {
          scroller: getScrollParent(grid),
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.85,
                ease: 'power3.out',
                stagger: 0.12,
                onComplete: () => {
                  (batch as HTMLElement[]).forEach((card) => {
                    const lines = card.querySelectorAll<HTMLElement>('[data-feature-line]');
                    if (!lines.length) return;
                    gsap.fromTo(
                      lines,
                      { yPercent: 100 },
                      { yPercent: 0, duration: 0.5, ease: 'power2.out', stagger: 0.03 }
                    );
                  });
                },
              }
            );
          },
        });
      }, grid);
    } catch (error) {
      console.error('[ServicesPricingBentoSection] ScrollTrigger setup failed', error);
    }

    const refreshId = window.setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('[ScrollTrigger] deferred refresh() failed', error);
      }
    }, 90);

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [orderedServices.length]);

  // 3D cursor tilt (max ±4°) + cinematic sibling focus-blur — fine-pointer desktop only,
  // off under prefers-reduced-motion. Cleans up every inline transform/opacity/filter it
  // sets so nothing is left stuck once the viewport drops out of tilt range.
  useEffect(() => {
    const cards = cardRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (!tiltCapable || cards.length === 0 || prefersReducedMotion()) return undefined;

    const detachers: Array<() => void> = [];

    cards.forEach((card, index) => {
      gsap.set(card, { transformPerspective: 1000 });
      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });

      const onMove = (event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        rotX(py * -8);
        rotY(px * 8);
      };

      const onEnter = () => {
        cards.forEach((other, otherIndex) => {
          if (otherIndex === index) return;
          gsap.to(other, { opacity: 0.12, filter: 'blur(1.5px)', duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        });
      };

      const onLeave = () => {
        rotX(0);
        rotY(0);
        cards.forEach((other) => {
          gsap.to(other, { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        });
      };

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointerleave', onLeave);
      detachers.push(() => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointerleave', onLeave);
      });
    });

    return () => {
      detachers.forEach((detach) => detach());
      cards.forEach((card) => gsap.set(card, { clearProps: 'rotationX,rotationY,opacity,filter,transformPerspective' }));
    };
  }, [tiltCapable, orderedServices.length]);

  if (services.length === 0) return null;

  return (
    <section
      className="relative w-full px-0 py-14 sm:py-16 md:px-6 md:py-20 lg:px-10"
      style={{ backgroundColor: tokens.bg }}
      data-pf-no-color-transition=""
    >
      <div ref={gridRef} className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {orderedServices.map((item, index) => (
          <PricingCard
            key={item.id}
            item={item}
            isGraphic={index === graphicIndex}
            spanFullRow={index === graphicIndex && graphicSpansFullRow}
            tokens={tokens}
            ctaLabel={pricingBento.ctaLabel}
            periodLabel={pricingBento.periodLabel}
            ctaHref={nav.href}
            ctaOnNavigate={nav.onNavigate}
            magnetic={tiltCapable}
            cardRef={(el) => {
              cardRefs.current[index] = el;
            }}
          />
        ))}
      </div>
    </section>
  );
}

export function isServicesPricingBentoDesign(presentation: PortfolioServicesPresentationSettings): boolean {
  // Cast: `'services-pricing-bento'` isn't in the `PortfolioServicesSectionDesign` union
  // yet — the coordinator adds it there (see `unionValue`). Comparing through `string`
  // keeps this file compiling standalone in the meantime without editing that file.
  return (presentation.sectionDesign as string) === 'services-pricing-bento';
}
