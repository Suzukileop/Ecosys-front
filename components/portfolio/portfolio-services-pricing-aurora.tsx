'use client';

import gsap from 'gsap';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { fluidColumns, useFluidTrack } from '@/components/portfolio/portfolio-services-fluid-columns';
import type { ProfileServiceItem } from '@/types/profile';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_PALETTE,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  buildPricingCards,
  ctaLookOverride,
  featuredFill,
  readableInk,
  prefersReducedMotion,
  useServicesCardHover,
  useServicesFinePointer,
  withAlpha,
} from '@/components/portfolio/portfolio-services-pricing-shared';
import { resolveServicesCardElements, resolveServicesCtaLabel, ServicesHoverAnchor } from '@/components/portfolio/portfolio-services-card-elements';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import {
  moveFeatured,
  priceWordLabel,
  resolveBillingSuffix,
  resolveFeaturedIndex,
  SERVICES_FEATURED_DEFAULT_OPACITY,
} from '@/components/portfolio/portfolio-services-pricing-style';
import { ServicesBulletItem } from '@/components/portfolio/portfolio-services-list-marker';
import {
  DEFAULT_SERVICES_PRICING_AURORA_SETTINGS,
  type PortfolioServicesPresentationSettings,
  type PortfolioServicesPricingAuroraSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

/** Aurora's own options (button label, cards per row). Featured card, price period and hover live
 *  in the shared `pricingStyle`. */
function readAuroraSettings(presentation: PortfolioServicesPresentationSettings): PortfolioServicesPricingAuroraSettings {
  return { ...DEFAULT_SERVICES_PRICING_AURORA_SETTINGS, ...(presentation.servicesPricingAurora ?? {}) };
}

type AuroraTokens = {
  stageBg: string;
  ink: string;
  muted: string;
  cardBg: string;
  cardBorder: string;
  shadow: string;
  isLight: boolean;
};

function auroraTokens(isLight: boolean): AuroraTokens {
  return isLight
    ? {
        isLight,
        stageBg: '#ffffff',
        ink: '#0a0a0a',
        muted: 'rgba(10,10,10,0.55)',
        cardBg: 'rgba(10,10,10,0.025)',
        cardBorder: 'rgba(10,10,10,0.09)',
        shadow: 'rgba(10,10,10,0.14)',
      }
    : {
        isLight,
        stageBg: '#000000',
        ink: '#ffffff',
        muted: 'rgba(255,255,255,0.55)',
        cardBg: 'rgba(255,255,255,0.045)',
        cardBorder: 'rgba(255,255,255,0.12)',
        shadow: 'rgba(0,0,0,0.6)',
      };
}

/** A flex row (not a CSS grid) is what lets an incomplete last row centre itself. `basis()` is the
 *  per-card width at a column count/gap, capped to the item count so a high setting never strands
 *  empty columns. */
function basis(columns: number, gapPx: number): string {
  return `calc((100% - ${gapPx * (columns - 1)}px) / ${columns})`;
}

/** Narrowest an Aurora card may get before its monumental price and features wrap badly. */
const MIN_CARD_WIDTH = 272;
const auroraGapFor = (width: number) => (width < 640 ? 12 : width < 1024 ? 24 : 28);

function effectiveColumns(cardsPerRow: number, ceiling: number, count: number): number {
  return Math.max(1, Math.min(cardsPerRow, ceiling, count));
}

/**
 * Services "Pricing Aurora" — a borderless glassmorphic pricing grid. Translucent backdrop-blur
 * cards, the featured plan singled out by an accent tint and border, monumental clamp()-sized
 * prices (real currency, "from" marker, the service's own billing period), a bracketed magnetic
 * button, and one simple hover effect (lift / glow / tilt) that never dims the other cards.
 * Below 768px the grid stacks edge-to-edge, flat, with full-width 48px tap targets.
 */
export function ServicesPricingAuroraSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const show = resolveServicesCardElements(presentation);
  const listed = useMemo(
    () => buildPricingCards(services, show),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is rebuilt every render; its six flags are the real deps
    [services, show.title, show.description, show.price, show.delivery, show.tasks, show.cta, show.deliveryTemplate]
  );
  const settings = readAuroraSettings(presentation);
  const pricingStyle = useServicesPricingStyle(presentation);
  const style = pricingStyle.style;
  const tokens = auroraTokens(presentation.activeColorMode === 'light');

  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
  const accent = pricingStyle.featuredColor ?? resolveHeroPaletteColor(palette, 'principal');
  const featuredOpacity = (style.featuredOpacity ?? SERVICES_FEATURED_DEFAULT_OPACITY.aurora) / 100;
  // The featured fill is translucent over the stage, so the colour it really appears as is the
  // accent blended into that stage — text and badge are picked against that, never the page.
  const filled = featuredFill(accent, featuredOpacity * 100, tokens.stageBg);
  const featured = { ...filled, ink: readableInk(filled.blended) };
  const featuredBg = featured.fill;
  const strongFill = featuredOpacity >= 0.35;
  const featuredBorder = strongFill ? withAlpha(featured.ink, 0.22) : withAlpha(accent, tokens.isLight ? 0.42 : 0.55);
  const featuredTokens = {
    ink: featured.ink,
    muted: withAlpha(featured.ink, 0.74),
    body: 1,
    bullet: strongFill ? featured.ink : accent,
    ctaContrast: featured.blended,
  };
  const baseTokens = {
    ink: tokens.ink,
    muted: tokens.muted,
    body: 0.92,
    bullet: accent,
    ctaContrast: tokens.isLight ? '#ffffff' : '#0a0a0a',
  };
  const listedFeatured = resolveFeaturedIndex(
    style,
    listed.map((item) => item.popularFlag)
  );
  const colsDesktop = effectiveColumns(settings.cardsPerRow, 4, listed.length);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Columns follow the block's real width (see portfolio-services-fluid-columns).
  const track = useFluidTrack(rootRef, listed.length > 0, auroraGapFor, MIN_CARD_WIDTH);
  const fluidCols = track ? fluidColumns(listed.length, colsDesktop, track.fit) : null;
  const items = moveFeatured(listed, listedFeatured, settings.featuredPosition, fluidCols ?? colsDesktop);
  const featuredId = listedFeatured >= 0 ? listed[listedFeatured]?.id : undefined;
  const badge = style.featuredShowLabel && style.featuredLabel.trim() ? style.featuredLabel.trim() : null;

  const finePointer = useServicesFinePointer();
  // Order-insensitive: measuring the block re-seats the featured card, which reorders `items` once after
  // mount — that must not tear the entrance animation down and rebuild it mid-flight.
  const itemsKey = items
    .map((item) => item.id)
    .sort()
    .join('|');

  // Entrance — cards rise in once, staggered, when the grid scrolls into view.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = rootRef.current;
    if (!root) return undefined;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-svc-card]'));
    if (cards.length === 0) return undefined;
    if (prefersReducedMotion()) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return undefined;
    }

    // An IntersectionObserver starts the entrance instead of a ScrollTrigger: creating a ScrollTrigger
    // refreshes every other one on the page, and when one of those (another section's `once` trigger)
    // fires and kills itself mid-refresh, GSAP reads a missing entry and throws "reading 'end'".
    let ctx: gsap.Context | undefined;
    let observer: IntersectionObserver | undefined;
    try {
      ctx = gsap.context(() => {
        gsap.set(cards, { opacity: 0, y: 32 });
        const entrance = gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          clearProps: 'opacity',
          paused: true,
        });
        observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer?.disconnect();
            entrance.play();
          },
          { rootMargin: '0px 0px -12% 0px' }
        );
        observer.observe(root);
      }, root);
    } catch (error) {
      console.error('[ServicesPricingAurora] entrance setup failed', error);
      // The cards were hidden for the entrance: never leave them invisible if it could not run.
      cards.forEach((card) => {
        card.style.opacity = '';
        card.style.transform = '';
      });
    }
    return () => {
      observer?.disconnect();
      ctx?.revert();
    };
  }, [itemsKey]);

  useServicesCardHover(rootRef, style.hoverEffect, finePointer, itemsKey);


  if (items.length === 0) return null;

  // Tablet caps the setting at 2-up; desktop honours it up to 4. Both capped to the item count.
  const GAP_TABLET_PX = 24;
  const GAP_DESKTOP_PX = 28;
  const colsTablet = effectiveColumns(settings.cardsPerRow, 2, items.length);
  // One per row = a full-width card (its features move to a second column on desktop).
  const tabletBasis = colsTablet === 1 ? '100%' : basis(colsTablet, GAP_TABLET_PX);
  const desktopBasis = colsDesktop === 1 ? '100%' : basis(colsDesktop, GAP_DESKTOP_PX);
  const wide = colsDesktop === 1;
  // Narrow columns (3–4 up) get less inner padding so the text keeps its room.
  const shownCols = fluidCols ?? colsDesktop;
  const padClass = shownCols >= 3 ? 'p-7 sm:p-8 xl:p-9' : 'p-7 sm:p-10 lg:p-11';
  const fluidBasis = fluidCols && track ? (fluidCols === 1 ? '100%' : basis(fluidCols, track.gap)) : null;

  return (
    <div
      className="relative left-1/2 w-screen -translate-x-1/2 md:static md:left-auto md:w-auto md:translate-x-0"
      style={style.showFrame ? { backgroundColor: tokens.stageBg } : undefined}
      data-pf-no-color-transition=""
    >
      <style>{`
        .pf-svc-pricing-aurora-row {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          justify-content: center;
          gap: 12px;
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
          .pf-svc-pricing-aurora-wide {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            column-gap: 4rem;
            align-content: start;
          }
          .pf-svc-pricing-aurora-wide > * { grid-column: 1; }
          .pf-svc-pricing-aurora-wide > [data-aurora-features] {
            grid-column: 2;
            grid-row: 1 / span 6;
            align-self: center;
          }
        }
      `}</style>
      {/* The inset padding only belongs to the optional background frame; without it the cards sit
          flush in the section (mobile keeps a 16px gutter, the wrapper is full-bleed there). */}
      <div
        className={
          style.showFrame
            ? 'mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-28'
            : 'mx-auto w-full max-w-7xl px-4 md:px-0'
        }
      >
        <div ref={rootRef} className="pf-svc-pricing-aurora-row" style={track ? { gap: track.gap } : undefined}>
          {items.map((item) => {
            const isFeatured = item.id === featuredId;
            const ink = isFeatured ? featuredTokens : baseTokens;
            const { price } = item;
            const period = price.kind === 'amount' ? resolveBillingSuffix(style, price.period) : null;
            const figure =
              price.kind === 'amount'
                ? price.amount
                : price.kind === 'free'
                  ? priceWordLabel(style, 'free', settings.freePriceLabel || 'Free')
                  : priceWordLabel(style, 'quote', settings.customPriceLabel || 'Custom');
            // Words ("Custom", "Free") read heavier than digits, so they are set smaller.
            const priceSize = price.kind === 'amount' ? 'clamp(2rem, 4.2vw, 3rem)' : 'clamp(1.6rem, 3.2vw, 2.25rem)';

            return (
              <article
                key={item.id}
                data-svc-card=""
                data-svc-hover={style.hoverEffect}
                data-rest-y={0}
                aria-label={item.title}
                className="pf-svc-pricing-aurora-card relative rounded-[22px] sm:rounded-[var(--pf-aurora-radius,28px)]"
                style={{
                  ...(pricingStyle.cardRadiusPx != null
                    ? ({ '--pf-aurora-radius': `${pricingStyle.cardRadiusPx}px` } as CSSProperties)
                    : null),
                  ...(fluidBasis ? { flexBasis: fluidBasis, maxWidth: fluidBasis } : null),
                  '--svc-glow': pricingStyle.glowColor ?? tokens.ink,
                  '--svc-glow-a': pricingStyle.glowAlpha,
                  '--svc-shadow': tokens.isLight ? 'rgba(10,10,10,0.22)' : 'rgba(0,0,0,0.65)',
                  backgroundColor: isFeatured ? featuredBg : tokens.cardBg,
                  borderStyle: 'solid',
                  borderWidth: pricingStyle.borderWidthPx ?? 1,
                  borderColor: pricingStyle.borderColor ?? (isFeatured ? featuredBorder : tokens.cardBorder),
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: `0 24px 64px -34px ${tokens.shadow}`,
                } as CSSProperties}
                data-pf-no-color-transition=""
              >
                <div
                  className={`relative z-[1] flex h-full flex-col gap-7 sm:gap-8 ${padClass}${wide ? ' pf-svc-pricing-aurora-wide' : ''}`}
                >
                  {/* The badge row is always reserved (hidden, not removed) so every card's title,
                      price and list start at the same height. */}
                  <span
                    aria-hidden={!(isFeatured && badge)}
                    className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[length:calc(0.6875rem*var(--pf-services-font-scale,1))] font-bold uppercase tracking-[0.16em]"
                    style={{
                      backgroundColor: featured.ink,
                      color: featured.blended,
                      visibility: isFeatured && badge ? 'visible' : 'hidden',
                    }}
                  >
                    {badge ?? t('Popular')}
                  </span>
                  <div className="flex flex-col gap-3">
                    {show.title ? (
                      <p
                        className="text-[length:calc(0.8125rem*var(--pf-services-font-scale,1))] font-semibold uppercase"
                        style={{ letterSpacing: '0.16em', color: ink.ink }}
                      >
                        {item.title}
                      </p>
                    ) : null}
                    {show.price ? (
                    <div>
                      {price.isFrom && price.kind === 'amount' ? (
                        <span
                          className="mb-1 block text-[length:calc(0.75rem*var(--pf-services-font-scale,1))] font-semibold uppercase tracking-[0.16em]"
                          style={{ color: ink.muted }}
                        >
                          {t('From')}
                        </span>
                      ) : null}
                      <div
                        className="flex flex-wrap items-baseline gap-x-1.5 font-extrabold leading-none tracking-[-0.02em]"
                        style={{
                          fontSize: `calc(${priceSize} * var(--pf-services-font-scale, 1))`,
                          color: ink.ink,
                        }}
                      >
                        {price.kind === 'amount' && price.symbolFirst ? (
                          <span className="text-[0.4em] font-semibold" style={{ opacity: 0.6 }}>
                            {price.symbol}
                          </span>
                        ) : null}
                        <span>{figure}</span>
                        {price.kind === 'amount' && !price.symbolFirst ? (
                          <span className="text-[0.4em] font-semibold" style={{ opacity: 0.6 }}>
                            {price.symbol}
                          </span>
                        ) : null}
                        {period ? (
                          <span
                            className="ml-1 font-normal tracking-normal"
                            style={{ color: ink.muted, fontSize: 'max(0.8rem, 0.3em)' }}
                          >
                            {period}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    ) : null}
                    {item.delivery ? (
                      <p className="text-[length:calc(0.8125rem*var(--pf-services-font-scale,1))] font-medium" style={{ color: ink.muted }}>
                        {item.delivery}
                      </p>
                    ) : null}
                  </div>

                  {item.description ? (
                    <p
                      className="max-w-[34ch] text-[0.95rem] font-normal"
                      style={{ color: ink.ink, opacity: isFeatured ? 0.85 : 0.68, lineHeight: 1.6 }}
                    >
                      {item.description}
                    </p>
                  ) : null}

                  {item.features.length > 0 ? (
                    <ul data-aurora-features="" className="flex flex-col gap-3">
                      {item.features.slice(0, 8).map((feature, featureIndex) =>
                        style.listBullet !== 'auto' ? (
                          <ServicesBulletItem
                            key={`${item.id}-${featureIndex}`}
                            bullet={style.listBullet}
                            index={featureIndex}
                            markerColor={pricingStyle.bulletColor ?? ink.bullet}
                            className="text-[0.92rem]"
                            textStyle={{ color: ink.ink, opacity: ink.body }}
                          >
                            {feature}
                          </ServicesBulletItem>
                        ) : (
                        <li
                          key={`${item.id}-${featureIndex}`}
                          className="flex items-start gap-3 text-[0.92rem]"
                          style={{ color: ink.ink, opacity: ink.body }}
                        >
                          <span
                            aria-hidden
                            className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full"
                            style={{ backgroundColor: ink.bullet }}
                          />
                          <span>{feature}</span>
                        </li>
                        )
                      )}
                    </ul>
                  ) : null}

                  {show.cta ? (
                  <div className="mt-auto pt-2">
                    <ServicesHoverAnchor
                      pricingStyle={pricingStyle}
                      label={resolveServicesCtaLabel(presentation)}
                      className="flex min-h-12 w-full items-center justify-center gap-2 text-[0.95rem] font-medium sm:w-auto sm:justify-start"
                      style={{
                        color: ink.ink,
                        ...ctaLookOverride(style.ctaStyle, ink.ink, ink.ctaContrast, pricingStyle.ctaRadius),
                      }}
                    >
                      {style.ctaStyle === 'auto' ? (
                        <span aria-hidden style={{ opacity: 0.5 }}>
                          [
                        </span>
                      ) : null}
                      <span>{resolveServicesCtaLabel(presentation)}</span>
                      <span aria-hidden className="inline-block" data-pf-no-color-transition="">
                        →
                      </span>
                      {style.ctaStyle === 'auto' ? (
                        <span aria-hidden style={{ opacity: 0.5 }}>
                          ]
                        </span>
                      ) : null}
                    </ServicesHoverAnchor>
                  </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
