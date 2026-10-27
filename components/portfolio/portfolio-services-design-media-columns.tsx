'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import { fluidColumns, useFluidTrack } from '@/components/portfolio/portfolio-services-fluid-columns';
import type { ProfileServiceItem } from '@/types/profile';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import { readableInk } from '@/components/portfolio/portfolio-services-pricing-shared';
import {
  applyServicePriceLabels,
  resolveBillingSuffix,
} from '@/components/portfolio/portfolio-services-pricing-style';
import {
  ServicesOrderButton,
  resolveServicesCardElements,
  resolveServicesCtaLabel,
} from '@/components/portfolio/portfolio-services-card-elements';
import { formatServiceDelivery, getServicePriceParts } from '@/lib/profile-services';
import {
  DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS,
  type PortfolioServicesMediaColumnsGap,
  type PortfolioServicesMediaColumnsRadius,
  type PortfolioServicesMediaColumnsRatio,
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

const RATIO_CLASS: Record<PortfolioServicesMediaColumnsRatio, string> = {
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
};

/** Narrowest a media card may get before its title and price wrap word by word. */
const MIN_CARD_WIDTH = 240;

const RADIUS: Record<PortfolioServicesMediaColumnsRadius, string> = {
  none: '0px',
  small: '6px',
  medium: '12px',
  large: '24px',
  round: '40px',
};

/** Column gap in px; the row gap is derived from it so cards never touch the next row's text. */
const GAP_PX: Record<PortfolioServicesMediaColumnsGap, number> = {
  tight: 12,
  normal: 24,
  wide: 40,
  roomy: 56,
};

const FONT = (rem: number) => `calc(${rem}rem * var(--pf-services-font-scale, 1))`;

/**
 * Services "Media Columns" — a clean grid of service cards: cover media on top, the title and the
 * description underneath. Fully configurable from Layout settings: cards per row (desktop and
 * phone), media ratio, corner radius, gap, text alignment, whether an incomplete last row is
 * centered, the description, and the hover effect (zoom / lift / glow / none). Cards are laid out with
 * flex-wrap + a width calc driven by CSS variables, which is what lets an incomplete last row be
 * centered (a CSS grid cannot do that). Cards rise in with a short stagger when scrolled into view.
 */
export function ServicesMediaColumnsSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const settings = presentation.mediaColumns ?? DEFAULT_SERVICES_MEDIA_COLUMNS_SETTINGS;

  const isLight = presentation.activeColorMode === 'light';
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const fallbackGradient = `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 45%, #0a0a0a) 100%)`;

  const pricingStyle = useServicesPricingStyle(presentation);
  const show = resolveServicesCardElements(presentation);
  const ctaLabel = resolveServicesCtaLabel(presentation);
  // Neutral ink like the other designs: the card titles and prices must not pick up the section's title/accent colour.
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  const muted = presentation.subtitleColor?.trim() || ink;
  const inverse = readableInk(ink);
  // Tells the browser how wide each image is really drawn, so it asks for a matching rendition
  // instead of the 100vw default (a right-sized, properly resampled picture is the crisp one).
  const mediaSizes = `(min-width: 1024px) ${Math.round(100 / settings.columns)}vw, (min-width: 640px) 50vw, 100vw`;

  const gapPx = GAP_PX[settings.gap];
  const listRef = useRef<HTMLDivElement>(null);
  // Columns follow the block's real width (see portfolio-services-fluid-columns): the asked-for
  // count is a ceiling, never forced when a card would get squeezed.
  const track = useFluidTrack(listRef, count > 0, (width) => (width < 640 ? Math.min(gapPx, 24) : gapPx), MIN_CARD_WIDTH, `${gapPx}`);
  const fluidCols = track ? fluidColumns(count, settings.columns, track.fit) : null;
  const vars = {
    '--mc-gap': `${track ? track.gap : gapPx}px`,
    '--mc-row-gap': `${Math.round((track ? track.gap : gapPx) * 1.6)}px`,
    // Phones always stack one card per row until the block measures itself.
    '--mc-c-base': fluidCols ?? 1,
    '--mc-c-md': fluidCols ?? 2,
    '--mc-c-lg': fluidCols ?? settings.columns,
    '--mc-ink': ink,
    '--mc-muted': muted,
    '--mc-accent': accent,
    color: 'var(--mc-ink)',
  } as CSSProperties;

  const entranceKey = `${count}|${settings.columns}|${settings.mediaRatio}|${show.title}|${show.description}|${show.price}|${show.delivery}|${show.tasks}|${show.cta}`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || count === 0) return undefined;
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | null = null;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      const scroller = getScrollParent(list) ?? undefined;
      const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-mc-card]'));
      ctx = gsap.context(() => {
        gsap.fromTo(
          cards,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            stagger: 0.09,
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: list, scroller, start: 'top 88%', once: true },
          }
        );
      }, list);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesMediaColumnsSection] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesMediaColumnsSection] GSAP entrance setup failed', error);
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entranceKey encodes count + layout settings
  }, [entranceKey]);

  if (count === 0) return null;

  const centered = settings.textAlign === 'center';

  return (
    <div
      ref={listRef}
      className={`flex w-full flex-wrap gap-x-[var(--mc-gap)] gap-y-[var(--mc-row-gap)] ${
        settings.centerLastRow ? 'justify-center' : 'justify-start'
      }`}
      style={vars}
    >
      {items.map((item, index) => {
        const description = show.description ? item.description?.trim() : '';
        const delivery = show.delivery ? formatServiceDelivery(item, show.deliveryTemplate) : null;
        const tasks = show.tasks ? (item.tasks ?? []).map((task) => task.trim()).filter(Boolean) : [];
        const priceParts = show.price && pricingStyle.style.showPrice ? applyServicePriceLabels(getServicePriceParts(item), pricingStyle.style) : null;
        const priceSuffix =
          priceParts && priceParts.kind === 'amount'
            ? resolveBillingSuffix(pricingStyle.style, priceParts.period)
            : null;
        return (
          <article
            key={item.id || index}
            data-mc-card=""
            className={`group min-w-0 [--c:var(--mc-c-base)] sm:[--c:var(--mc-c-md)] lg:[--c:var(--mc-c-lg)] w-[calc((100%-(var(--c)-1)*var(--mc-gap))/var(--c))] ${
              centered ? 'text-center' : 'text-left'
            } ${
              settings.hoverEffect === 'lift'
                ? 'md:transition-transform md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:-translate-y-4'
                : ''
            }`}
            data-pf-no-color-transition=""
          >
            <div data-pf-no-color-transition=""
              className={`relative w-full overflow-hidden transition-shadow duration-500 ${RATIO_CLASS[settings.mediaRatio]} ${
                settings.hoverEffect === 'lift'
                  ? 'md:group-hover:shadow-[0_30px_44px_-24px_rgba(0,0,0,0.4)]'
                  : ''
              }`}
              style={{ borderRadius: RADIUS[settings.cardRadius] }}
            >
              {/* No will-change here: a promoted layer is rasterised once at 1x and then scaled, which
                  is what made the image go soft on hover. Without it the browser re-rasterises at the
                  zoomed size and the picture stays sharp. */}
              <div
                className={`absolute inset-0 ${
                  settings.hoverEffect === 'zoom'
                    ? 'md:transition-transform md:duration-[900ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.05]'
                    : ''
                }`}
                data-pf-no-color-transition=""
              >
                {item.coverImageUrl ? (
                  <PortfolioDeferredMedia
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="h-full w-full"
                    objectFit="cover"
                    crisp
                    sizes={mediaSizes}
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: fallbackGradient }} aria-hidden />
                )}
              </div>
            </div>
            {show.title ? (
            <h3
              className="mt-4 font-sans font-normal leading-[1.15] tracking-[-0.015em] sm:mt-5"
              style={{
                fontSize: `calc(clamp(1.05rem, 0.9rem + 1.2vw, 1.5rem) * var(--pf-services-font-scale, 1))`,
                overflowWrap: 'anywhere',
              }}
            >
              {item.title}
            </h3>
            ) : null}
            {priceParts ? (
              <p className="mt-2 font-semibold tracking-tight" style={{ fontSize: FONT(1) }}>
                {priceParts.isFrom && priceParts.kind === 'amount' ? `${t('From')} ` : ''}
                {priceParts.text}
                {priceSuffix ? (
                  <span className="ml-1.5 font-normal text-[color:var(--mc-muted)]" style={{ fontSize: FONT(0.8) }}>
                    {priceSuffix}
                  </span>
                ) : null}
              </p>
            ) : null}
            {delivery ? (
              <p className="mt-2 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-[color:var(--mc-muted)]">
                {delivery}
              </p>
            ) : null}
            {settings.showDescription && description ? (
              <p
                className="mt-3 leading-[1.55] text-[color:var(--mc-muted)]"
                style={{ fontSize: FONT(0.95) }}
              >
                {description}
              </p>
            ) : null}
            {tasks.length > 0 ? (
              <ul
                className={`mt-3 flex flex-col gap-y-1 text-[color:var(--mc-ink)] sm:flex-row sm:flex-wrap sm:gap-x-3 ${
                  centered ? 'items-center sm:justify-center' : 'items-start sm:justify-start'
                }`}
                style={{ fontSize: FONT(0.9) }}
                aria-label={t('{title} — included', { title: item.title })}
              >
                {tasks.map((task, taskIndex) => (
                  <li key={`${task}-${taskIndex}`} className="flex items-center gap-3">
                    {/* Phones list one task per line, so the separator only shows from sm up. */}
                    {taskIndex > 0 ? <span aria-hidden className="hidden opacity-50 sm:inline">&middot;</span> : null}
                    {task}
                  </li>
                ))}
              </ul>
            ) : null}
            {show.cta ? (
              <ServicesOrderButton
                pricingStyle={pricingStyle}
                label={ctaLabel}
                ink={ink}
                surface={inverse}
                className="group/cta mt-5 inline-flex items-center gap-2 border-b border-current pb-1 text-[0.95rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
                autoContent={
                  <>
                    {ctaLabel}
                    <span data-pf-no-color-transition="" aria-hidden className="inline-block transition-transform duration-500 group-hover/cta:translate-x-1">
                      &rarr;
                    </span>
                  </>
                }
              />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
