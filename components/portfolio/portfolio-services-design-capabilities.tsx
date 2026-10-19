'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import {
  DEFAULT_SERVICES_COLOR_BINDINGS,
  DEFAULT_SERVICES_PALETTE,
  mergeServicesPalette,
} from '@/components/portfolio/portfolio-services-palette-settings';
import {
  applyServicePriceLabels,
  resolveBillingSuffix,
  resolveFeaturedIndex,
} from '@/components/portfolio/portfolio-services-pricing-style';
import { ServicesBulletItem } from '@/components/portfolio/portfolio-services-list-marker';
import {
  ServicesOrderButton,
  resolveServicesCardElements,
  resolveServicesCtaLabel,
} from '@/components/portfolio/portfolio-services-card-elements';
import { formatServiceDelivery, getServicePriceParts } from '@/lib/profile-services';
import {
  DEFAULT_SERVICES_CAPABILITIES_SETTINGS,
  type PortfolioServicesPresentationSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Nearest scrollable ancestor — the Studio preview renders inside a nested overflow-y:auto
 *  container, where a hardcoded `window` scroller would never fire. */
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

const FONT = (rem: number) => `calc(${rem}rem * var(--pf-services-font-scale, 1))`;

/**
 * Services "Capabilities" — the quiet text-only grid branding studios use for "What we do": each
 * service is a column under a hairline rule, with its number, title, one short paragraph and its
 * tasks listed underneath as capabilities. No cards, no media — hierarchy comes from type and
 * white space alone. Columns per row, centering of an incomplete last row, an optional frame around
 * each item (outline or filled), number style (small, large outlined numeral, none) and the rules
 * are configurable; which elements show comes from General → Card elements (title, description and
 * tasks by default). Rules draw in left to right and the text rises in, column by column, when the
 * grid scrolls into view.
 */
export function ServicesCapabilitiesSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const settings = presentation.capabilities ?? DEFAULT_SERVICES_CAPABILITIES_SETTINGS;

  const isLight = presentation.activeColorMode !== 'dark';
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  // Description reads from its own palette token (the "card body" slot, texteMuted by default)
  // instead of a faded copy of the title ink, so it can be recoloured independently.
  const descriptionColor = resolveHeroPaletteColor(
    mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette),
    presentation.servicesColorBindings?.cardBody ?? DEFAULT_SERVICES_COLOR_BINDINGS.cardBody
  );

  const pricingStyle = useServicesPricingStyle(presentation);
  const featuredAt = settings.showFeatured
    ? resolveFeaturedIndex(
        pricingStyle.style,
        items.map((item) => item.popular === true)
      )
    : -1;
  const featuredColor = pricingStyle.featuredColor ?? accent;
  const featuredBadge =
    pricingStyle.style.featuredShowLabel && pricingStyle.style.featuredLabel.trim()
      ? pricingStyle.style.featuredLabel.trim()
      : null;

  const show = resolveServicesCardElements(presentation);
  const ctaLabel = resolveServicesCtaLabel(presentation);

  const gridRef = useRef<HTMLDivElement>(null);
  const entranceKey = `${count}|${settings.columns}|${settings.numberStyle}|${settings.itemFrame}|${settings.centerLastRow}|${show.title}|${show.description}|${show.price}|${show.delivery}|${show.tasks}|${show.cta}`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || count === 0) return undefined;
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return undefined;
    let ctx: gsap.Context | null = null;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      const scroller = getScrollParent(grid) ?? undefined;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: grid, scroller, start: 'top 85%', once: true } });
        grid.querySelectorAll<HTMLElement>('[data-cap-col]').forEach((col, index) => {
          const rule = col.querySelector<HTMLElement>('[data-cap-rule]');
          const bits = col.querySelectorAll<HTMLElement>('[data-cap-rise]');
          const at = index * 0.1;
          if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.inOut', clearProps: 'transform' }, at);
          if (bits.length) {
            tl.fromTo(
              bits,
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out', clearProps: 'transform,opacity' },
              at + 0.15
            );
          }
        });
      }, grid);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesCapabilitiesSection] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesCapabilitiesSection] GSAP entrance setup failed', error);
    }
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entranceKey encodes count + layout settings
  }, [entranceKey]);

  if (count === 0) return null;

  const framed = settings.itemFrame !== 'none';
  const frameRadius = pricingStyle.cardRadiusPx ?? 20;
  const vars = {
    '--cap-c': settings.columns,
    '--cap-line': isLight ? 'rgba(10,10,10,0.2)' : 'rgba(250,250,250,0.22)',
    '--cap-accent': accent,
    color: ink,
  } as CSSProperties;

  return (
    <div
      ref={gridRef}
      // flex-wrap + a width calc (not CSS grid) so an incomplete last row can be centered.
      className={`flex w-full flex-wrap ${settings.centerLastRow ? 'justify-center' : 'justify-start'} ${
        framed
          ? 'gap-4 [--cap-gx:1rem] lg:gap-6 lg:[--cap-gx:1.5rem]'
          : 'gap-x-10 gap-y-16 [--cap-gx:2.5rem] lg:gap-x-14 lg:gap-y-20 lg:[--cap-gx:3.5rem]'
      }`}
      style={vars}
    >
      {items.map((item, index) => {
        const description = show.description ? item.description?.trim() : '';
        const delivery = show.delivery ? formatServiceDelivery(item, show.deliveryTemplate) : null;
        const tasks = show.tasks ? (item.tasks ?? []).map((task) => task.trim()).filter(Boolean) : [];
        const featured = index === featuredAt;
        const number = String(index + 1).padStart(2, '0');
        const priceParts = show.price ? applyServicePriceLabels(getServicePriceParts(item), pricingStyle.style) : null;
        const priceSuffix =
          priceParts && priceParts.kind === 'amount' ? resolveBillingSuffix(pricingStyle.style, priceParts.period) : null;
        return (
          <article
            key={item.id || index}
            data-cap-col=""
            className={`group/cap flex w-full min-w-0 flex-col sm:w-[calc((100%-var(--cap-gx))/2)] lg:w-[calc((100%-(var(--cap-c)-1)*var(--cap-gx))/var(--cap-c))] ${
              framed ? 'p-7 lg:p-8' : ''
            }`}
            style={
              settings.itemFrame === 'outline'
                ? {
                    borderRadius: frameRadius,
                    border: `${pricingStyle.borderWidthPx ?? 1}px solid ${
                      pricingStyle.borderColor ?? (featured ? featuredColor : 'var(--cap-line)')
                    }`,
                  }
                : settings.itemFrame === 'filled'
                  ? {
                      borderRadius: frameRadius,
                      backgroundColor: `color-mix(in srgb, ${ink} ${isLight ? 4 : 6}%, transparent)`,
                      boxShadow: featured ? `inset 0 0 0 1px ${featuredColor}` : undefined,
                    }
                  : undefined
            }
          >
            {settings.showRule && !framed ? (
              <div
                data-cap-rule=""
                aria-hidden
                className="h-px w-full origin-left"
                style={{ backgroundColor: featured ? featuredColor : 'var(--cap-line)' }}
              />
            ) : null}

            {settings.numberStyle === 'large' ? (
              <p
                data-cap-rise=""
                aria-hidden
                className={`font-sans font-light leading-none tracking-[-0.05em] text-transparent ${framed ? '' : 'mt-6'}`}
                style={{
                  fontSize: FONT(4.5),
                  WebkitTextStroke: `1px ${isLight ? 'rgba(10,10,10,0.45)' : 'rgba(250,250,250,0.5)'}`,
                }}
              >
                {number}
              </p>
            ) : null}

            <div data-cap-rise="" className={`flex items-baseline gap-3 ${settings.numberStyle === 'large' ? 'mt-6' : framed ? '' : 'mt-5'}`}>
              {settings.numberStyle === 'small' ? (
                <span className="font-mono text-[0.72rem] tabular-nums opacity-50">({number})</span>
              ) : null}
              {featured && featuredBadge ? (
                <span
                  className="text-[0.66rem] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: featuredColor }}
                >
                  {featuredBadge}
                </span>
              ) : null}
            </div>

            {show.title ? (
            <h3
              data-cap-rise=""
              className="mt-4 font-sans font-medium leading-[1.08] tracking-[-0.03em]"
              style={{
                fontSize: `calc(clamp(1.6rem, 1.15rem + 1.3vw, 2.35rem) * var(--pf-services-font-scale, 1))`,
                overflowWrap: 'anywhere',
              }}
            >
              {item.title}
            </h3>
            ) : null}

            {priceParts ? (
              <p data-cap-rise="" className="mt-3 font-medium" style={{ fontSize: FONT(0.95) }}>
                {priceParts.isFrom && priceParts.kind === 'amount' ? `${t('From')} ` : ''}
                {priceParts.text}
                {priceSuffix ? (
                  <span className="ml-1 font-normal opacity-55" style={{ fontSize: FONT(0.78) }}>
                    {priceSuffix}
                  </span>
                ) : null}
              </p>
            ) : null}

            {delivery ? (
              <p data-cap-rise="" className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] opacity-55">
                {delivery}
              </p>
            ) : null}

            {description ? (
              <p
                data-cap-rise=""
                className="mt-5 max-w-[30rem] leading-[1.65]"
                style={{ fontSize: FONT(0.95), color: descriptionColor }}
              >
                {description}
              </p>
            ) : null}

            {tasks.length > 0 ? (
              <ul data-cap-rise="" className="mt-7 flex flex-col gap-1.5" aria-label={t('{title} — capabilities', { title: item.title })}>
                {tasks.map((task, taskIndex) =>
                  pricingStyle.style.listBullet !== 'auto' ? (
                    <ServicesBulletItem
                      key={`${task}-${taskIndex}`}
                      bullet={pricingStyle.style.listBullet}
                      index={taskIndex}
                      markerColor={pricingStyle.bulletColor ?? 'var(--cap-accent)'}
                      className="leading-[1.5]"
                      style={{ fontSize: FONT(0.95) }}
                    >
                      {task}
                    </ServicesBulletItem>
                  ) : (
                  <li
                    key={`${task}-${taskIndex}`}
                    className="group/task flex cursor-default items-center leading-[1.5]"
                    style={{ fontSize: FONT(0.95) }}
                    data-pf-no-color-transition=""
                  >
                    <span
                      aria-hidden
                      className="inline-block h-px w-0 bg-[color:var(--cap-accent)] transition-[width,margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/task:mr-2 group-hover/task:w-4"
                    />
                    <span className="transition-colors duration-300 group-hover/task:text-[color:var(--cap-accent)]">
                      {task}
                    </span>
                  </li>
                  )
                )}
              </ul>
            ) : null}

            {show.cta ? (
              <div className="mt-auto pt-8">
              <ServicesOrderButton
                data-cap-rise=""
                pricingStyle={pricingStyle}
                label={ctaLabel}
                ink={ink}
                surface={isLight ? '#fafafa' : '#0a0a0a'}
                className="group/cta inline-flex w-fit items-center gap-2 border-b border-current pb-1 text-[0.88rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
                autoContent={
                  <>
                    {ctaLabel}
                    <span aria-hidden className="inline-block transition-transform duration-500 group-hover/cta:translate-x-1">
                      &rarr;
                    </span>
                  </>
                }
              />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
