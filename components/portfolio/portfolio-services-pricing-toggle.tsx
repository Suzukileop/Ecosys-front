'use client';

import { useLayoutEffect, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProfileServiceItem } from '@/types/profile';
import {
  buildPricingCards,
  ctaLookOverride,
  featuredFill,
  getScrollParent,
  prefersReducedMotion,
  useServicesCardHover,
  useServicesFinePointer,
  withAlpha,
} from '@/components/portfolio/portfolio-services-pricing-shared';
import { resolveServicesCardElements, resolveServicesCtaLabel } from '@/components/portfolio/portfolio-services-card-elements';
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
  DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS,
  type PortfolioServicesPresentationSettings,
  type PortfolioServicesPricingToggleSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

function readToggleSettings(presentation: PortfolioServicesPresentationSettings): PortfolioServicesPricingToggleSettings {
  return { ...DEFAULT_SERVICES_PRICING_TOGGLE_SETTINGS, ...(presentation.pricingToggle ?? {}) };
}

function isValidHex(value: string | undefined): value is string {
  return Boolean(value) && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test((value as string).trim());
}

type PricingTokens = {
  bg: string;
  ink: string;
  muted: string;
  border: string;
  cardBg: string;
  isLight: boolean;
};

function pricingTokens(isLight: boolean): PricingTokens {
  return isLight
    ? {
        isLight,
        bg: '#ffffff',
        ink: '#0a0a0a',
        muted: 'rgba(10,10,10,0.56)',
        border: 'rgba(10,10,10,0.1)',
        cardBg: 'rgba(10,10,10,0.025)',
      }
    : {
        isLight,
        bg: '#000000',
        ink: '#ffffff',
        muted: 'rgba(255,255,255,0.56)',
        border: 'rgba(255,255,255,0.14)',
        cardBg: 'rgba(255,255,255,0.035)',
      };
}

/**
 * Services "Pricing Toggle" — horizontal pricing rows (title + price / features / button), one
 * colour-inverted featured row that can be moved first / middle / last, a magnetic button and one
 * simple hover effect (lift / glow / tilt) that never dims the other rows. Type is set at Pricing
 * Aurora's scale. Each row's price comes from the service itself — currency, "from" marker and
 * its own billing period. Below 768px the rows collapse to a single vertical flow with a
 * full-width button and no hover motion.
 */
export function ServicesPricingToggleSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const settings = readToggleSettings(presentation);
  const pricingStyle = useServicesPricingStyle(presentation);
  const style = pricingStyle.style;
  const show = resolveServicesCardElements(presentation);
  const listed = useMemo(
    () => buildPricingCards(services, show),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `show` is rebuilt every render; its six flags are the real deps
    [services, show.title, show.description, show.price, show.delivery, show.tasks, show.cta, show.deliveryTemplate]
  );

  const tokens = pricingTokens(presentation.activeColorMode === 'light');
  const accentRaw = pricingStyle.featuredColor ?? (presentation.ctaColor || presentation.cardAccentColor);
  const accent = isValidHex(accentRaw) ? accentRaw : '#f97316';
  const fill = featuredFill(
    accent,
    style.featuredOpacity ?? SERVICES_FEATURED_DEFAULT_OPACITY.toggle,
    tokens.isLight ? '#ffffff' : '#0a0a0a'
  );
  const badge = style.featuredShowLabel && style.featuredLabel.trim() ? style.featuredLabel.trim() : null;
  const listedFeatured = resolveFeaturedIndex(
    style,
    listed.map((item) => item.popularFlag)
  );
  // Rows are one column, so "center" is the middle of the whole list.
  const items = moveFeatured(listed, listedFeatured, settings.featuredPosition, listed.length);
  const featuredId = listedFeatured >= 0 ? listed[listedFeatured]?.id : undefined;
  const includedLabel = settings.showIncludedLabel ? settings.includedLabel.trim() || t('What\'s included') : null;

  const finePointer = useServicesFinePointer();
  const rootRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const itemsKey = items.map((item) => item.id).join('|');

  // Entrance — rows fade/slide up once, on scroll into view.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || items.length === 0) return undefined;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-svc-card]'));
    if (prefersReducedMotion()) {
      gsap.set(rows, { opacity: 1, y: 0 });
      return undefined;
    }

    let ctx: gsap.Context | undefined;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        gsap.set(rows, { opacity: 0, y: 24 });
        gsap.to(rows, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: 'power3.out',
          clearProps: 'opacity',
          scrollTrigger: { trigger: root, scroller: getScrollParent(root), start: 'top 82%', once: true },
        });
      }, root);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ScrollTrigger] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesPricingToggle] entrance setup failed', error);
    }
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [itemsKey, items.length]);

  useServicesCardHover(rowsRef, style.hoverEffect, finePointer, itemsKey);

  // Magnetic button (fine pointer only).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !finePointer || prefersReducedMotion()) return undefined;
    const cleanups: Array<() => void> = [];
    Array.from(root.querySelectorAll<HTMLElement>('[data-svc-cta]')).forEach((el) => {
      const moveX = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' });
      const moveY = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' });
      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        moveX((event.clientX - (rect.left + rect.width / 2)) * 0.4);
        moveY((event.clientY - (rect.top + rect.height / 2)) * 0.4);
      };
      const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: 'x,y' });
      });
    });
    return () => cleanups.forEach((off) => off());
  }, [finePointer, itemsKey]);

  if (items.length === 0) return null;

  return (
    <div
      ref={rootRef}
      // The inset padding only belongs to the optional background frame; without it the rows sit
      // flush in the section like every other design.
      className={
        style.showFrame ? 'relative left-1/2 w-screen -translate-x-1/2 px-4 py-14 sm:px-8 md:py-24' : 'relative w-full'
      }
      style={style.showFrame ? { backgroundColor: tokens.bg } : undefined}
      data-pf-no-color-transition=""
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center">
        <div ref={rowsRef} className="flex w-full flex-col gap-4 sm:gap-6">
          {items.map((item) => {
            const isFeatured = item.id === featuredId;
            const { price } = item;
            const period = price.kind === 'amount' ? resolveBillingSuffix(style, price.period) : null;
            const ink = isFeatured ? fill.ink : tokens.ink;
            const muted = isFeatured ? withAlpha(fill.ink, 0.72) : tokens.muted;
            const featureOpacity = isFeatured ? 0.92 : 0.72;
            const figure =
              price.kind === 'amount'
                ? price.amount
                : priceWordLabel(style, price.kind, price.kind === 'free' ? 'Free' : 'Custom quote');
            // Pricing Aurora's scale; words ("Custom quote", "Free") read heavier, so they are smaller.
            const priceSize = price.kind === 'amount' ? 'clamp(2rem, 4.2vw, 3rem)' : 'clamp(1.6rem, 3.2vw, 2.25rem)';

            return (
              <div
                key={item.id}
                data-svc-card=""
                data-svc-hover={style.hoverEffect}
                data-rest-y={0}
                className="relative rounded-[1.5rem] px-5 py-7 sm:px-8 sm:py-8 md:rounded-[2rem] md:px-10 md:py-9"
                style={{
                  '--svc-glow': ink,
                  '--svc-shadow': tokens.isLight ? 'rgba(10,10,10,0.22)' : 'rgba(0,0,0,0.65)',
                  backgroundColor: isFeatured ? fill.fill : tokens.cardBg,
                  ...(pricingStyle.borderWidthPx != null || pricingStyle.borderColor != null
                    ? {
                        borderStyle: 'solid',
                        borderWidth: pricingStyle.borderWidthPx ?? (isFeatured ? 0 : 1),
                        borderColor: pricingStyle.borderColor ?? (isFeatured ? 'transparent' : tokens.border),
                      }
                    : { border: isFeatured ? 'none' : `1px solid ${tokens.border}` }),
                  ...(pricingStyle.cardRadiusPx != null ? { borderRadius: pricingStyle.cardRadiusPx } : null),
                  boxShadow: isFeatured ? '0 28px 64px -30px rgba(0,0,0,0.5)' : 'none',
                } as unknown as CSSProperties}
                data-pf-no-color-transition=""
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(200px,1fr)_minmax(0,1.55fr)_minmax(150px,auto)] md:items-center md:gap-10 lg:gap-14">
                  <div>
                    {isFeatured && badge ? (
                      <span
                        className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                        style={{ backgroundColor: withAlpha(ink, 0.14), color: ink }}
                      >
                        {badge}
                      </span>
                    ) : null}
                    {show.title ? (
                      <h3 className="font-sans text-[0.95rem] font-bold tracking-tight" style={{ color: ink }}>
                        {item.title}
                      </h3>
                    ) : null}
                    {item.description ? (
                      <p className="mt-1.5 max-w-xs text-[0.86rem] leading-relaxed" style={{ color: muted }}>
                        {item.description}
                      </p>
                    ) : null}
                    {show.price ? (
                    <div className="mt-4">
                      {price.isFrom && price.kind === 'amount' ? (
                        <span
                          className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: muted }}
                        >
                          {t('From')}
                        </span>
                      ) : null}
                      <div
                        className="flex flex-wrap items-baseline gap-x-1.5 font-extrabold leading-none tracking-[-0.02em]"
                        style={{ fontSize: `calc(${priceSize} * var(--pf-services-font-scale, 1))`, color: ink }}
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
                            style={{ color: muted, fontSize: 'max(0.8rem, 0.3em)' }}
                          >
                            {period}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    ) : null}
                    {item.delivery ? (
                      <p className="mt-2 text-[0.78rem] font-medium" style={{ color: muted }}>
                        {item.delivery}
                      </p>
                    ) : null}
                  </div>

                  {item.features.length > 0 ? (
                    <div>
                      {includedLabel ? (
                        <p
                          className="mb-3 text-[0.68rem] font-semibold uppercase"
                          style={{ letterSpacing: '0.2em', color: muted }}
                        >
                          {includedLabel}
                        </p>
                      ) : null}
                      <ul className="space-y-2.5">
                        {item.features.map((feature, featureIndex) =>
                          style.listBullet !== 'auto' ? (
                            <ServicesBulletItem
                              key={`${item.id}-feature-${featureIndex}`}
                              bullet={style.listBullet}
                              index={featureIndex}
                              markerColor={pricingStyle.bulletColor ?? ink}
                              className="text-[0.86rem] font-medium leading-[1.6]"
                              textStyle={{ color: ink, opacity: featureOpacity }}
                            >
                              {feature}
                            </ServicesBulletItem>
                          ) : (
                          <li
                            key={`${item.id}-feature-${featureIndex}`}
                            className="text-[0.86rem] font-medium leading-[1.6]"
                            style={{ color: ink, opacity: featureOpacity }}
                          >
                            {feature}
                          </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div aria-hidden />
                  )}

                  {show.cta ? (
                  <div className="flex md:justify-end">
                    <a
                      {...pricingStyle.anchorProps}
                      data-svc-cta=""
                      className="inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-full px-6 text-[0.9rem] font-semibold md:w-auto"
                      style={{
                        borderStyle: 'solid',
                        borderWidth: 1.5,
                        borderColor: withAlpha(ink, 0.4),
                        color: ink,
                        ...(pricingStyle.ctaRadius != null ? { borderRadius: pricingStyle.ctaRadius } : null),
                        ...ctaLookOverride(
                          style.ctaStyle,
                          ink,
                          isFeatured ? fill.blended : tokens.isLight ? '#ffffff' : '#0a0a0a',
                          pricingStyle.ctaRadius
                        ),
                      }}
                      data-pf-no-color-transition=""
                    >
                      {resolveServicesCtaLabel(presentation)}
                    </a>
                  </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
