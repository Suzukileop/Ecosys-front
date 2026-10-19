'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { pickContrastInk } from '@/components/portfolio/portfolio-services-pricing-shared';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import {
  ServicesOrderButton,
  resolveServicesCardElements,
  resolveServicesCtaLabel,
} from '@/components/portfolio/portfolio-services-card-elements';
import {
  applyServicePriceLabels,
  resolveBillingSuffix,
} from '@/components/portfolio/portfolio-services-pricing-style';
import { ServicesBulletItem } from '@/components/portfolio/portfolio-services-list-marker';
import { formatServiceDelivery, getServicePriceParts } from '@/lib/profile-services';
import {
  DEFAULT_SERVICES_CASCADE_SETTINGS,
  type PortfolioServicesCascadeCardHeight,
  type PortfolioServicesCascadeCardWidth,
  type PortfolioServicesCascadeSettings,
  type PortfolioServicesPresentationSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Nearest scrollable ancestor — the Studio preview renders inside a nested overflow-y:auto
 *  container, where a scroll listener on `window` would silently never fire. */
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

/** Genuine desktop pointer only — width alone misclassifies big tablets, which get the static list. */
function useFinePointerDesktop(minWidthPx = 1024) {
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

const WIDTH_CLASS: Record<PortfolioServicesCascadeCardWidth, string> = {
  small: 'max-w-3xl',
  medium: 'max-w-5xl',
  large: 'max-w-6xl xl:max-w-7xl',
};

/** Desktop min-height — via `lg:items-stretch` it also drives the media's height. */
const HEIGHT_CLASS: Record<PortfolioServicesCascadeCardHeight, string> = {
  compact: 'lg:min-h-[26rem]',
  standard: 'lg:min-h-[32rem]',
  tall: 'lg:min-h-[40rem]',
};

/** Card corner radius when Corner radius is on Default (= the class's rounded-[1.75rem]). */
const DEFAULT_CARD_RADIUS_PX = 28;

/** One Corner radius drives both: the media's corners follow the card's, kept a bit tighter so
 *  the inner curve sits concentric-looking inside the padding. */
function mediaRadiusFor(cardRadiusPx: number): number {
  return Math.round(cardRadiusPx * 0.6);
}

const FONT = (rem: number) => `calc(${rem}rem * var(--pf-services-font-scale, 1))`;

/** Same constants and "escalier" depth model as Work's Cascade / Experience Cards: cumulative
 *  steps, geometry only. Never fade a covering card — on a light card text ghosts through. */
const STACK_TOP_PX = 96;
const SCALE_STEP = 0.02;
const SINK_PX = 20;
const GAP_PX = 40;

function buildDepths(stepProgress: number[]): number[] {
  const depths = new Array<number>(stepProgress.length + 1).fill(0);
  for (let i = stepProgress.length - 1; i >= 0; i -= 1) {
    depths[i] = stepProgress[i] + depths[i + 1];
  }
  return depths;
}

function CascadeServiceCard({
  item,
  index,
  total,
  settings,
  presentation,
  cardBg,
  isLight,
  accent,
}: {
  item: ProfileServiceItem;
  index: number;
  total: number;
  settings: PortfolioServicesCascadeSettings;
  presentation: PortfolioServicesPresentationSettings;
  cardBg: string;
  isLight: boolean;
  accent: string;
}) {
  const t = useT();
  const articleRef = useRef<HTMLElement | null>(null);
  const titleInnerRef = useRef<HTMLSpanElement | null>(null);
  const pricingStyle = useServicesPricingStyle(presentation);

  const title = item.title.trim();
  const show = resolveServicesCardElements(presentation);
  const description = show.description ? item.description?.trim() || '' : '';
  const tasks = show.tasks ? (item.tasks ?? []).map((task) => task.trim()).filter(Boolean).slice(0, 6) : [];
  const delivery = show.delivery ? formatServiceDelivery(item, show.deliveryTemplate) : null;
  const specialty = item.specialty?.trim() || '';
  const priceParts = show.price && pricingStyle.style.showPrice ? applyServicePriceLabels(getServicePriceParts(item), pricingStyle.style) : null;
  const priceSuffix =
    priceParts && priceParts.kind === 'amount' ? resolveBillingSuffix(pricingStyle.style, priceParts.period) : null;
  const ctaLabel = resolveServicesCtaLabel(presentation);
  // Zig-zag: media right on the 1st card, left on the 2nd…
  const mediaLeft = settings.mediaSide === 'zigzag' ? index % 2 === 1 : settings.mediaSide === 'left';
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  const bulletColor = pricingStyle.bulletColor ?? accent;
  // Shared Border / Border color (pricingStyle); Default keeps the faint 1px ring.
  const ringWidth = pricingStyle.borderWidthPx ?? 1;
  const ringColor =
    pricingStyle.borderColor ??
    (pricingStyle.borderWidthPx == null
      ? isLight ? 'rgba(10,10,10,0.06)' : 'rgba(255,255,255,0.06)'
      : isLight ? 'rgba(10,10,10,0.16)' : 'rgba(255,255,255,0.18)');
  const ring = ringWidth > 0 ? `, inset 0 0 0 ${ringWidth}px ${ringColor}` : '';
  const fallbackGradient = `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 45%, #0a0a0a) 100%)`;

  // Entrance, once per card: title slides up out of its mask, the rest rises in. The
  // data-entrance-ready gate holds the stack recede at 0 until this has finished, so a fast
  // scroll cannot cover a card that has not appeared yet (the race fixed on Experience Cards).
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const article = articleRef.current;
    if (!article) return undefined;
    const titleInner = titleInnerRef.current;
    const bits = Array.from(article.querySelectorAll<HTMLElement>('[data-cc-rise]'));
    const media = article.querySelector<HTMLElement>('[data-cc-media]');

    if (prefersReducedMotion()) {
      article.setAttribute('data-entrance-ready', 'true');
      return undefined;
    }
    article.setAttribute('data-entrance-ready', 'false');

    let ctx: gsap.Context | null = null;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      const scroller = getScrollParent(article) ?? undefined;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: article, scroller, start: 'top 82%', once: true },
          onComplete: () => article.setAttribute('data-entrance-ready', 'true'),
        });
        if (titleInner) tl.fromTo(titleInner, { yPercent: 110 }, { yPercent: 0, duration: 0.95, ease: 'power4.out', clearProps: 'transform' }, 0);
        if (bits.length) {
          tl.fromTo(
            bits,
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' },
            0.2
          );
        }
        if (media) {
          tl.fromTo(
            media,
            { clipPath: 'inset(12% 12% 12% 12% round 1.5rem)', scale: 1.08 },
            { clipPath: 'inset(0% 0% 0% 0% round 0rem)', scale: 1, duration: 1.2, ease: 'power3.out', clearProps: 'clipPath,transform' },
            0.05
          );
        }
      }, article);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesCascadeSection] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesCascadeSection] GSAP entrance setup failed', error);
      article.setAttribute('data-entrance-ready', 'true');
    }
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
  }, [title, description, tasks.length, show.title, show.cta, priceParts?.text, delivery]);

  return (
    <article
      ref={articleRef}
      data-cc-card=""
      data-entrance-ready="false"
      data-pf-no-color-transition=""
      className={`relative flex min-w-0 flex-col-reverse gap-8 overflow-hidden rounded-[1.75rem] p-6 sm:p-9 lg:items-stretch lg:gap-14 lg:p-12 ${
        mediaLeft ? 'lg:flex-row-reverse' : 'lg:flex-row'
      } ${HEIGHT_CLASS[settings.cardHeight]}`}
      style={{
        backgroundColor: cardBg,
        color: ink,
        // Shared Corner radius (pricingStyle); Default keeps the class's 1.75rem.
        borderRadius: pricingStyle.cardRadiusPx ?? undefined,
        transformOrigin: 'top center',
        boxShadow: `${isLight ? '0 18px 40px -18px rgba(15,23,42,0.22)' : '0 18px 40px -16px rgba(0,0,0,0.6)'}${ring}`,
      }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {settings.showNumbering || specialty ? (
        <div data-cc-rise="" className="flex items-center justify-between gap-4">
          <p
            className="flex flex-wrap items-center gap-x-2.5 text-[0.66rem] font-semibold uppercase opacity-60"
            style={{ letterSpacing: '0.18em' }}
          >
            {settings.showNumbering ? (
              <span className="tabular-nums">
                {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            ) : null}
            {settings.showNumbering && specialty ? (
              <span aria-hidden className="opacity-50">
                &middot;
              </span>
            ) : null}
            {specialty ? <span>{specialty}</span> : null}
          </p>
        </div>
        ) : null}

        {show.title ? (
        <h3
          className={`overflow-hidden pb-[0.08em] leading-[1] tracking-[-0.02em] ${settings.showNumbering || specialty ? 'mt-7 sm:mt-9' : ''}`}
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: `calc(clamp(1.95rem, 1.2rem + 2.3vw, 3.15rem) * var(--pf-services-font-scale, 1))`,
            overflowWrap: 'anywhere',
          }}
        >
          <span ref={titleInnerRef} className="block">
            {title}
          </span>
        </h3>
        ) : null}

        {description ? (
          <p
            data-cc-rise=""
            className="mt-6 max-w-xl font-light leading-[1.7] opacity-65"
            style={{ fontSize: FONT(0.98) }}
          >
            {description}
          </p>
        ) : null}

        {tasks.length > 0 ? (
          <ul className="mt-8 flex flex-col gap-2.5">
            {tasks.map((task, taskIndex) =>
              pricingStyle.style.listBullet !== 'auto' ? (
                <ServicesBulletItem
                  key={`${task}-${taskIndex}`}
                  bullet={pricingStyle.style.listBullet}
                  index={taskIndex}
                  markerColor={bulletColor}
                  dataAttrs={{ 'data-cc-rise': '' }}
                  style={{ fontSize: FONT(0.92) }}
                  textStyle={{ opacity: 0.85 }}
                >
                  {task}
                </ServicesBulletItem>
              ) : (
              <li
                key={`${task}-${taskIndex}`}
                data-cc-rise=""
                className="flex items-baseline gap-3"
                style={{ fontSize: FONT(0.92) }}
              >
                <span aria-hidden style={{ color: bulletColor, opacity: 0.8 }}>
                  &mdash;
                </span>
                <span className="opacity-85">{task}</span>
              </li>
              )
            )}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-10">
          <div data-cc-rise="" className="flex flex-col gap-1">
            {priceParts ? (
              <p className="font-semibold tracking-tight" style={{ fontSize: FONT(1.4) }}>
                {priceParts.isFrom && priceParts.kind === 'amount' ? (
                  <span className="mr-1.5 font-normal opacity-60" style={{ fontSize: FONT(0.8) }}>
                    {t('From')}
                  </span>
                ) : null}
                {priceParts.text}
                {priceSuffix ? (
                  <span className="ml-1.5 font-normal opacity-60" style={{ fontSize: FONT(0.8) }}>
                    {priceSuffix}
                  </span>
                ) : null}
              </p>
            ) : null}
            {delivery ? (
              <p className="text-[0.66rem] font-medium uppercase opacity-55" style={{ letterSpacing: '0.16em' }}>
                {delivery}
              </p>
            ) : null}
          </div>
          {show.cta ? (
            <ServicesOrderButton
              data-cc-rise=""
              pricingStyle={pricingStyle}
              label={ctaLabel}
              ink={ink}
              surface={isLight ? '#fafafa' : '#0a0a0a'}
              className="group/cta inline-flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[0.85rem] font-medium transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
              style={{ backgroundColor: ink, color: isLight ? '#fafafa' : '#0a0a0a' }}
              autoContent={
                <>
                  {ctaLabel}
                  <span
                    aria-hidden
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:rotate-45"
                    style={{ backgroundColor: accent, color: pickContrastInk(accent) }}
                  >
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                      <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </>
              }
            />
          ) : null}
        </div>
      </div>

      <div className="relative aspect-[4/3] w-full shrink-0 lg:aspect-auto lg:w-[44%]">
        <div
          data-cc-media=""
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: mediaRadiusFor(pricingStyle.cardRadiusPx ?? DEFAULT_CARD_RADIUS_PX) }}
          data-pf-no-color-transition=""
        >
          {item.coverImageUrl ? (
            <PortfolioDeferredMedia
              src={item.coverImageUrl}
              alt={title}
              className="h-full w-full"
              objectFit="cover"
              crisp
              sizes="(min-width: 1024px) 45vw, 92vw"
            />
          ) : (
            <div className="h-full w-full" style={{ background: fallbackGradient }} aria-hidden />
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Services "Cascade" — the Work section's Cascade (itself the Experience "Cards" stacking effect)
 * applied to services: big cards with the text on one side and the service media on the other.
 * On a desktop pointer every card sticks at the same top offset and recedes (cumulative scale +
 * sink, never an opacity fade) as the next one slides over it; touch devices and the Static
 * option get a plain list. Cards can share the tallest card's height so none peeks out from
 * under its neighbour; the media can sit left, right or alternate (zig-zag). Each card carries an
 * optional "01 / 05" counter, specialty, serif title,
 * description, tasks, price, delivery time and the order button.
 */
export function ServicesCascadeSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const cardElements = resolveServicesCardElements(presentation);
  const elementsKey = [cardElements.title, cardElements.description, cardElements.price, cardElements.delivery, cardElements.tasks, cardElements.cta].join();
  const settings = presentation.servicesCascade ?? DEFAULT_SERVICES_CASCADE_SETTINGS;
  const stackRef = useRef<HTMLDivElement | null>(null);
  const isDesktop = useFinePointerDesktop(1024);
  const stacking = settings.stackEffect === 'stack' && isDesktop;

  const isLight = presentation.activeColorMode !== 'dark';
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const sectionBg = presentation.sectionBackgroundColor?.trim() || '#0a0a0a';
  // Dark canvas: the section's own colour, slightly raised — not an unrelated black box.
  const cardBg = isLight ? '#ffffff' : `color-mix(in srgb, ${sectionBg} 94%, white 6%)`;


  // Equal height: sticky siblings are not a grid, so there is no stretch to lean on — measure.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !settings.equalHeight) return undefined;
    const stack = stackRef.current;
    if (!stack) return undefined;
    const cards = Array.from(stack.querySelectorAll<HTMLElement>('[data-cc-card]'));
    if (cards.length < 2) return undefined;

    let frame = 0;
    const equalize = () => {
      frame = 0;
      cards.forEach((card) => {
        card.style.minHeight = '';
      });
      // offsetHeight, not getBoundingClientRect: the stack's scale() would shrink receded cards.
      const tallest = Math.max(...cards.map((card) => card.offsetHeight));
      cards.forEach((card) => {
        card.style.minHeight = `${Math.ceil(tallest)}px`;
      });
    };
    const onResize = () => {
      if (!frame) frame = window.requestAnimationFrame(equalize);
    };
    equalize();
    let cancelled = false;
    void document.fonts?.ready?.then(() => {
      if (!cancelled) equalize();
    });
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      cards.forEach((card) => {
        card.style.minHeight = '';
      });
    };
  }, [items, settings.equalHeight, settings.cardWidth, settings.cardHeight, settings.showNumbering, elementsKey]);

  // Depth recede — rAF-throttled getBoundingClientRect() on the next card, on the real scroller.
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !stacking || prefersReducedMotion()) return undefined;
    const stack = stackRef.current;
    if (!stack) return undefined;
    const stackItems = Array.from(stack.querySelectorAll<HTMLElement>(':scope > [data-cc-item]'));
    const pairs = stackItems
      .map((el, index) => ({ card: el.querySelector<HTMLElement>('[data-cc-card]'), nextItem: stackItems[index + 1] }))
      .filter((pair): pair is { card: HTMLElement; nextItem: HTMLElement } => Boolean(pair.card && pair.nextItem));
    if (pairs.length === 0) return undefined;

    const scrollTarget: EventTarget = getScrollParent(stack) ?? window;
    let ticking = false;
    const update = () => {
      ticking = false;
      const travel = Math.max(window.innerHeight - STACK_TOP_PX, 1);
      const stepProgress = pairs.map(({ nextItem }) => {
        const remaining = nextItem.getBoundingClientRect().top - STACK_TOP_PX;
        return Math.min(1, Math.max(0, 1 - remaining / travel));
      });
      const depths = buildDepths(stepProgress);
      pairs.forEach(({ card }, i) => {
        const depth = card.getAttribute('data-entrance-ready') === 'true' ? depths[i] : 0;
        card.style.transform = `scale(${1 - depth * SCALE_STEP}) translateY(-${depth * SINK_PX}px)`;
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    update();
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      pairs.forEach(({ card }) => {
        card.style.transform = '';
      });
    };
  }, [items, stacking, settings.cardWidth, settings.cardHeight]);

  if (count === 0) return null;

  return (
    <div className={`mx-auto w-full ${WIDTH_CLASS[settings.cardWidth]}`}>
      <div ref={stackRef} className="flex w-full flex-col" style={{ isolation: 'isolate' } as CSSProperties}>
        {items.map((item, index) => (
          <div
            key={item.id || index}
            data-cc-item=""
            style={{
              position: stacking ? 'sticky' : 'static',
              top: stacking ? STACK_TOP_PX : undefined,
              zIndex: index + 1,
              marginBottom: index === count - 1 && !stacking ? 0 : GAP_PX,
            }}
          >
            <CascadeServiceCard
              item={item}
              index={index}
              total={count}
              settings={settings}
              presentation={presentation}
              cardBg={cardBg}
              isLight={isLight}
              accent={accent}
            />
          </div>
        ))}
        {/* Trailing room so the last card can travel up and the stack reads as finished. */}
        {stacking ? <div aria-hidden className="pointer-events-none h-[min(60vh,30rem)] w-full" /> : null}
      </div>
    </div>
  );
}
