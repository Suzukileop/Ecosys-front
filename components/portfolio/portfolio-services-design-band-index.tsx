'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { legibleFeaturedFill, mixHex, readableInk, withAlpha } from '@/components/portfolio/portfolio-services-pricing-shared';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_SERVICES_PALETTE, mergeServicesPalette } from '@/components/portfolio/portfolio-services-palette-settings';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import {
  applyServicePriceLabels,
  resolveBillingSuffix,
  resolveFeaturedIndex,
} from '@/components/portfolio/portfolio-services-pricing-style';
import {
  ServicesOrderButton,
  resolveServicesCardElements,
  resolveServicesCtaLabel,
} from '@/components/portfolio/portfolio-services-card-elements';
import { formatServiceDelivery, getServicePriceParts } from '@/lib/profile-services';
import {
  DEFAULT_SERVICES_BAND_INDEX_SETTINGS,
  type PortfolioServicesBandIndexTitleSize,
  type PortfolioServicesBandIndexTasksStyle,
  type PortfolioServicesBandIndexToggleStyle,
  type PortfolioServicesPresentationSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
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

const TITLE_SIZE: Record<PortfolioServicesBandIndexTitleSize, string> = {
  medium: 'clamp(1rem, 0.9rem + 0.4vw, 1.2rem)',
  large: 'clamp(1.15rem, 0.95rem + 0.8vw, 1.6rem)',
  huge: 'clamp(1.4rem, 1rem + 1.6vw, 2.5rem)',
};

/** Frame of the unfold button, per style. */
const TOGGLE_FRAME: Record<PortfolioServicesBandIndexToggleStyle, string> = {
  circle: 'h-9 w-9 rounded-full border border-current opacity-80 sm:h-11 sm:w-11',
  soft: 'h-9 w-9 rounded-full bg-[color-mix(in_srgb,currentColor_14%,transparent)] sm:h-11 sm:w-11',
  plain: 'h-9 w-9 opacity-80 sm:h-11 sm:w-11',
  chevron: 'h-9 w-9 opacity-80 sm:h-11 sm:w-11',
};

const FONT = (rem: number) => `calc(${rem}rem * var(--pf-services-font-scale, 1))`;
const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

/** The tasks of an opened band, in the creator's chosen style. */
function BandTasks({ tasks, style }: { tasks: string[]; style: PortfolioServicesBandIndexTasksStyle }) {
  if (style === 'checklist') {
    return (
      <ul className="flex min-w-0 flex-col gap-3.5">
        {tasks.map((task, i) => (
          <li key={`${task}-${i}`} className="flex items-start gap-3" style={{ fontSize: FONT(0.95) }}>
            <span
              aria-hidden
              className="mt-[0.1em] inline-flex h-[1.3em] w-[1.3em] shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, currentColor 14%, transparent)' }}
            >
              <svg viewBox="0 0 16 16" className="h-[0.75em] w-[0.75em]" fill="none">
                <path d="M3.5 8.5l2.8 2.8L12.5 5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="leading-snug">{task}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (style === 'pills') {
    return (
      <ul className="flex min-w-0 flex-wrap content-start gap-2">
        {tasks.map((task, i) => (
          <li
            key={`${task}-${i}`}
            className="rounded-full border border-[color:var(--bi-line)] px-4 py-2 leading-none"
            style={{ fontSize: FONT(0.82) }}
          >
            {task}
          </li>
        ))}
      </ul>
    );
  }
  if (style === 'columns') {
    return (
      <ul className="grid min-w-0 grid-cols-1 gap-x-8 sm:grid-cols-2">
        {tasks.map((task, i) => (
          <li
            key={`${task}-${i}`}
            className="flex items-baseline gap-3 border-t border-[color:var(--bi-line)] py-3"
            style={{ fontSize: FONT(0.9) }}
          >
            <span aria-hidden className="font-mono text-[0.75rem] opacity-70">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{task}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (style === 'inline') {
    return (
      <p className="min-w-0 leading-[1.7]" style={{ fontSize: FONT(1.1) }}>
        {tasks.map((task, i) => (
          <span key={`${task}-${i}`}>
            {task}
            {i < tasks.length - 1 ? (
              <span aria-hidden className="mx-2.5 opacity-40">
                /
              </span>
            ) : null}
          </span>
        ))}
      </p>
    );
  }
  return (
    <ul className="min-w-0 border-b border-[color:var(--bi-line)]">
      {tasks.map((task, i) => (
        <li
          key={`${task}-${i}`}
          className="flex items-baseline gap-4 border-t border-[color:var(--bi-line)] py-3"
          style={{ fontSize: FONT(0.95) }}
        >
          <span className="font-mono text-[0.75rem] opacity-70">{String(i + 1).padStart(2, '0')}</span>
          <span>{task}</span>
        </li>
      ))}
    </ul>
  );
}

/** Floating preview card size (px) — used to centre it on the cursor. */
const FOLLOW_W = 280;
const FOLLOW_H = 350;

/**
 * Services "Band Index" — one service per full-width band, like a typographic index: a small
 * number, a large title, then delivery time and price on the far right. Hovering a band floods it
 * with ink (or the accent) from the bottom edge, nudges the title and either floats the service
 * media under the cursor (a card that trails the pointer and leans with its speed) or slides the
 * media open inside the band. Clicking a band (or resting on it, by choice) unfolds its description,
 * tasks and — on touch screens, which have no hover — its media. Bands rise in one after the other on scroll.
 */
export function ServicesBandIndexSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const settings = presentation.bandIndex ?? DEFAULT_SERVICES_BAND_INDEX_SETTINGS;

  const isLight = presentation.activeColorMode !== 'dark';
  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  const inverse = isLight ? '#fafafa' : '#0a0a0a';
  // The hover fill: the text ink, or a palette colour, at the creator's opacity. Text on it is picked from
  // the opaque colour the fill really shows as over the page, so a pale wash keeps dark text and a solid
  // fill flips it, whichever colour or opacity is chosen.
  const palette = mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette);
  const fillBase = settings.hoverFill === 'color' ? resolveHeroPaletteColor(palette, settings.hoverColor) : ink;
  const fillAlpha = Math.min(100, Math.max(20, settings.hoverOpacity ?? 100)) / 100;
  const fill = fillAlpha >= 1 ? fillBase : withAlpha(fillBase, fillAlpha);
  const onFill = readableInk(mixHex(fillBase, inverse, fillAlpha));
  const fallbackGradient = `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 45%, #0a0a0a) 100%)`;

  const pricingStyle = useServicesPricingStyle(presentation);
  const featuredAt = resolveFeaturedIndex(
    pricingStyle.style,
    items.map((item) => item.popular === true)
  );
  const featuredColor = pricingStyle.featuredColor ?? accent;
  const featuredBadge =
    pricingStyle.style.featuredShowLabel && pricingStyle.style.featuredLabel.trim()
      ? pricingStyle.style.featuredLabel.trim()
      : null;

  const show = resolveServicesCardElements(presentation);
  const ctaLabel = resolveServicesCtaLabel(presentation);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<HTMLDivElement>(null);
  const followMotion = useRef<{
    x: gsap.QuickToFunc;
    y: gsap.QuickToFunc;
    r: gsap.QuickToFunc;
    lastX: number | null;
  } | null>(null);

  const followOn = settings.preview === 'follow';
  const entranceKey = `${count}|${settings.titleSize}|${settings.showIndex}|${settings.showPrice}|${settings.showDelivery}|${show.title}|${show.description}|${show.price}|${show.delivery}|${show.tasks}|${show.cta}`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || count === 0) return undefined;
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | null = null;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      const scroller = getScrollParent(root) ?? undefined;
      const lines = root.querySelectorAll<HTMLElement>('[data-bi-line]');
      const bands = root.querySelectorAll<HTMLElement>('[data-bi-band]');
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root, scroller, start: 'top 85%', once: true } });
        tl.fromTo(
          lines,
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: 'power3.inOut', stagger: 0.07, clearProps: 'transform' },
          0
        ).fromTo(
          bands,
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.07, clearProps: 'transform,opacity' },
          0.15
        );
      }, root);
      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesBandIndexSection] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesBandIndexSection] GSAP entrance setup failed', error);
    }
    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entranceKey encodes count + layout settings
  }, [entranceKey]);

  // Cursor-following preview: GSAP quickTo gives the card a little lag, and its tilt follows the
  // horizontal speed of the pointer, which is what makes it feel physical rather than glued on.
  useLayoutEffect(() => {
    const el = followRef.current;
    if (!followOn || !el || !hasFinePointer()) return undefined;
    gsap.set(el, { xPercent: 0, yPercent: 0 });
    followMotion.current = {
      x: gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' }),
      r: gsap.quickTo(el, 'rotation', { duration: 0.8, ease: 'power3.out' }),
      lastX: null,
    };
    return () => {
      followMotion.current = null;
      gsap.killTweensOf(el);
    };
  }, [followOn, count]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const motion = followMotion.current;
    const root = rootRef.current;
    if (!motion || !root || event.pointerType !== 'mouse') return;
    const rect = root.getBoundingClientRect();
    const x = event.clientX - rect.left - FOLLOW_W / 2;
    const y = event.clientY - rect.top - FOLLOW_H / 2;
    if (motion.lastX === null) {
      // First move: jump there instead of flying in from the corner.
      gsap.set(followRef.current, { x, y });
    }
    const dx = motion.lastX === null ? 0 : event.clientX - motion.lastX;
    motion.lastX = event.clientX;
    motion.x(x);
    motion.y(y);
    motion.r(Math.max(-9, Math.min(9, dx * 0.5)));
  };

  const onPointerLeave = () => {
    setHoverIndex(null);
    if (followMotion.current) {
      followMotion.current.lastX = null;
      followMotion.current.r(0);
    }
  };

  if (count === 0) return null;

  const vars = {
    '--bi-ink': ink,
    '--bi-fill': fill,
    '--bi-on-fill': onFill,
    '--bi-line': isLight ? 'rgba(10,10,10,0.18)' : 'rgba(250,250,250,0.2)',
    color: 'var(--bi-ink)',
  } as CSSProperties;

  const hoverFill = settings.hoverFill !== 'none';
  const hoverMode = settings.openOn === 'hover';
  const previewShown = hoverIndex !== null && (hoverMode || openIndex !== hoverIndex);
  // The number column is only reserved while numbers show: without it the title sits flush left.
  const gridCols = settings.showIndex ? 'grid-cols-[auto_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]';
  // Details line up under the title, past the number column when there is one.
  const detailsInset = settings.showIndex ? 'sm:pl-[calc(3rem+2rem+1.25rem)]' : '';

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      style={vars}
      onPointerMove={followOn ? onPointerMove : undefined}
      onPointerLeave={onPointerLeave}
    >
      {items.map((item, index) => {
        const open = openIndex === index;
        const featured = index === featuredAt;
        const description = show.description ? item.description?.trim() : '';
        const tasks = show.tasks ? (item.tasks ?? []).map((task) => task.trim()).filter(Boolean) : [];
        const delivery = settings.showDelivery && show.delivery ? formatServiceDelivery(item, show.deliveryTemplate) : null;
        const priceParts = settings.showPrice && show.price && pricingStyle.style.showPrice ? applyServicePriceLabels(getServicePriceParts(item), pricingStyle.style) : null;
        const priceSuffix =
          priceParts && priceParts.kind === 'amount' ? resolveBillingSuffix(pricingStyle.style, priceParts.period) : null;
        const interactive = Boolean(description) || tasks.length > 0 || Boolean(item.coverImageUrl) || show.cta;
        const panelId = `bi-panel-${item.id || index}`;

        const rowInner = (
          <>
            {hoverFill ? (
              <span data-pf-no-color-transition=""
                aria-hidden
                // A soft rise-and-fade, timed with the text colour below so fill and ink change together.
                className={`pointer-events-none absolute inset-0 origin-bottom scale-y-[0.86] bg-[color:var(--bi-fill)] opacity-0 transition-[opacity,transform,scale] duration-[700ms] ${EASE} md:group-hover/band:scale-y-100 md:group-hover/band:opacity-100 ${
                  open ? 'scale-y-100 opacity-100' : ''
                }`}
              />
            ) : null}
            <span data-pf-no-color-transition="" className={`relative grid w-full ${gridCols} items-center gap-x-4 sm:gap-x-8`}>
              {settings.showIndex ? (
                <span data-pf-no-color-transition="" className="w-8 font-mono text-[0.8rem] tabular-nums opacity-70 sm:w-12" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
              ) : null}
              <span data-pf-no-color-transition="" className="flex min-w-0 items-center gap-5">
                <span data-pf-no-color-transition=""
                  className={`min-w-0 font-sans font-medium leading-[1] tracking-[-0.035em] transition-transform duration-[650ms] ${EASE} md:group-hover/band:translate-x-3 ${
                    settings.uppercase ? 'uppercase' : ''
                  }`}
                  style={{
                    fontSize: `calc(${TITLE_SIZE[settings.titleSize]} * var(--pf-services-font-scale, 1))`,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {show.title ? item.title : null}
                  {featured && featuredBadge ? (
                    <span data-pf-no-color-transition=""
                      className="ml-3 inline-block -translate-y-[0.35em] rounded-full px-2.5 py-1 align-middle font-sans text-[11px] font-semibold uppercase leading-none tracking-[0.12em]"
                      // The accent can be a mid-tone where neither ink reaches 4.5:1: deepen the pill just enough.
                      style={{ backgroundColor: legibleFeaturedFill(featuredColor, 100, '#000000').fill, color: legibleFeaturedFill(featuredColor, 100, '#000000').ink }}
                    >
                      {featuredBadge}
                    </span>
                  ) : null}
                </span>
                {settings.preview === 'inline' ? (
                  <span
                    aria-hidden
                    className={`relative hidden h-[clamp(3rem,5vw,4.75rem)] w-0 shrink-0 overflow-hidden rounded-full transition-[width] duration-[650ms] ${EASE} md:block md:group-hover/band:w-[clamp(6rem,10vw,9.5rem)]`}
                    data-pf-no-color-transition=""
                  >
                    <span data-pf-no-color-transition="" className="absolute inset-y-0 left-0 block w-[clamp(6rem,10vw,9.5rem)]">
                      {item.coverImageUrl ? (
                        <PortfolioDeferredMedia
                          src={item.coverImageUrl}
                          alt=""
                          className="h-full w-full"
                          objectFit="cover"
                          sizes="160px"
                        />
                      ) : (
                        <span data-pf-no-color-transition="" className="block h-full w-full" style={{ background: fallbackGradient }} />
                      )}
                    </span>
                  </span>
                ) : null}
              </span>
              <span data-pf-no-color-transition="" className="flex items-center gap-5 sm:gap-8">
                {delivery || priceParts ? (
                  <span data-pf-no-color-transition="" className="hidden flex-col items-end gap-1 text-right sm:flex">
                    {priceParts ? (
                      <span data-pf-no-color-transition="" className="font-semibold tracking-tight" style={{ fontSize: FONT(1) }}>
                        {priceParts.isFrom && priceParts.kind === 'amount' ? `${t('From')} ` : ''}
                        {priceParts.text}
                        {priceSuffix ? (
                          <span data-pf-no-color-transition="" className="ml-1 font-normal opacity-75" style={{ fontSize: FONT(0.82) }}>
                            {priceSuffix}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                    {delivery ? (
                      <span data-pf-no-color-transition="" className="opacity-75" style={{ fontSize: FONT(0.85) }}>
                        {delivery}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {interactive ? (
                  <span data-pf-no-color-transition=""
                    aria-hidden
                    className={`relative flex shrink-0 items-center justify-center ${TOGGLE_FRAME[settings.toggleStyle ?? 'circle']}`}
                  >
                    {settings.toggleStyle === 'chevron' ? (
                      <svg data-pf-no-color-transition=""
                        viewBox="0 0 24 24"
                        className={`h-5 w-5 transition-transform duration-500 ${EASE} ${open ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <>
                        <span data-pf-no-color-transition="" className="absolute h-px w-3.5 bg-current" />
                        <span data-pf-no-color-transition=""
                          className={`absolute h-3.5 w-px bg-current transition-transform duration-500 ${EASE} ${
                            open ? 'scale-y-0' : ''
                          }`}
                        />
                      </>
                    )}
                  </span>
                ) : (
                  <svg data-pf-no-color-transition=""
                    viewBox="0 0 24 24"
                    className={`h-6 w-6 shrink-0 -rotate-45 opacity-0 transition-[transform,translate,scale,rotate,opacity] duration-500 ${EASE} md:group-hover/band:rotate-0 md:group-hover/band:opacity-100`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.6}
                    aria-hidden
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </span>
          </>
        );

        const rowClass = `group/band relative flex w-full items-center overflow-hidden px-3 py-7 text-left transition-colors duration-[700ms] ${EASE} sm:px-5 sm:py-9 ${
          hoverFill ? 'md:hover:text-[color:var(--bi-on-fill)]' : ''
        } ${open && hoverFill ? 'text-[color:var(--bi-on-fill)]' : ''}`;

        return (
          <article
            key={item.id || index}
            className="relative"
            onPointerEnter={(event) => {
              setHoverIndex(index);
              if (hoverMode && interactive && event.pointerType === 'mouse') setOpenIndex(index);
            }}
            onPointerLeave={(event) => {
              if (hoverMode && event.pointerType === 'mouse') setOpenIndex((current) => (current === index ? null : current));
            }}
          >
            <div data-bi-line="" className="h-px w-full origin-left bg-[color:var(--bi-line)]" aria-hidden />
            <div className="overflow-hidden">
              <div data-bi-band="">
                {interactive ? (
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={(event) => {
                      // With "open on hover" a mouse click does nothing; a keyboard press (detail 0) or a tap still toggles.
                      if (hoverMode && hasFinePointer() && event.detail > 0) return;
                      setOpenIndex(open ? null : index);
                    }}
                    className={`${rowClass} focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-current`}
                    data-pf-no-color-transition=""
                  >
                    {rowInner}
                  </button>
                ) : (
                  <div className={rowClass} data-pf-no-color-transition="">
                    {rowInner}
                  </div>
                )}
              </div>
            </div>
            {interactive ? (
              <div
                id={panelId}
                role="region"
                aria-label={item.title}
                data-pf-no-color-transition=""
                className={`grid transition-[grid-template-rows] duration-[650ms] ${EASE} ${
                  open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    data-pf-no-color-transition=""
                    className={`grid gap-8 px-3 pb-10 pt-8 transition-opacity duration-500 sm:px-5 ${detailsInset} lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14 ${
                      open ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="min-w-0">
                      {description ? (
                        <p className="max-w-[36rem] leading-[1.7] opacity-85" style={{ fontSize: FONT(1) }}>
                          {description}
                        </p>
                      ) : null}
                      {delivery || priceParts ? (
                        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 opacity-90 sm:hidden" style={{ fontSize: FONT(0.92) }}>
                          {priceParts ? <span className="font-semibold">{priceParts.text}</span> : null}
                          {delivery ? <span>{delivery}</span> : null}
                        </p>
                      ) : null}
                      {show.cta ? (
                        <div className="mt-7">
                          <ServicesOrderButton
                            pricingStyle={pricingStyle}
                            label={ctaLabel}
                            ink={ink}
                            surface={inverse}
                            className="group/cta inline-flex items-center gap-2 rounded-full border border-current px-5 py-2.5 text-[0.95rem] font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-current"
                            autoContent={
                              <>
                                {ctaLabel}
                                <span aria-hidden className="inline-block transition-transform duration-500 group-hover/cta:translate-x-1" data-pf-no-color-transition="">
                                  &rarr;
                                </span>
                              </>
                            }
                          />
                        </div>
                      ) : null}
                      {item.coverImageUrl && settings.preview !== 'none' ? (
                        <div className="relative mt-7 aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl lg:hidden">
                          <PortfolioDeferredMedia
                            src={item.coverImageUrl}
                            alt={item.title}
                            className="h-full w-full"
                            objectFit="cover"
                            crisp
                            sizes="(min-width: 640px) 28rem, 90vw"
                          />
                        </div>
                      ) : null}
                    </div>
                    {tasks.length > 0 ? <BandTasks tasks={tasks} style={settings.tasksStyle ?? 'rows'} /> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
      <div className="h-px w-full bg-[color:var(--bi-line)]" aria-hidden />

      {followOn ? (
        <div
          ref={followRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 hidden md:block"
          style={{ width: FOLLOW_W, height: FOLLOW_H }}
          data-pf-no-color-transition=""
        >
          <div
            data-pf-no-color-transition=""
            className={`relative h-full w-full overflow-hidden rounded-2xl shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)] transition-[clip-path,opacity] duration-500 ${EASE}`}
            style={{
              clipPath: previewShown ? 'inset(0% 0% 0% 0% round 1rem)' : 'inset(50% 50% 50% 50% round 1rem)',
              opacity: previewShown ? 1 : 0,
            }}
          >
            {items.map((item, index) => (
              <div
                key={item.id || index}
                data-pf-no-color-transition=""
                className={`absolute inset-0 transition-[opacity,transform,translate,scale,rotate] duration-500 ${EASE}`}
                style={{
                  opacity: hoverIndex === index ? 1 : 0,
                  transform: hoverIndex === index ? 'scale(1)' : 'scale(1.12)',
                }}
              >
                {item.coverImageUrl ? (
                  <PortfolioDeferredMedia
                    src={item.coverImageUrl}
                    alt=""
                    className="h-full w-full"
                    objectFit="cover"
                    crisp
                    sizes={`${FOLLOW_W}px`}
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: fallbackGradient }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
