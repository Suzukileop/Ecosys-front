'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { ProfileServiceItem } from '@/types/profile';
import { PortfolioDeferredMedia } from '@/components/portfolio/PortfolioDeferredMedia';
import { useServicesPricingStyle } from '@/components/portfolio/portfolio-services-pricing-runtime';
import {
  applyServicePriceLabels,
  resolveBillingSuffix,
} from '@/components/portfolio/portfolio-services-pricing-style';
import { IndexListCta } from '@/components/portfolio/portfolio-services-index-cta';
import { resolveHeroPaletteColor } from '@/components/portfolio/portfolio-hero-palette-settings';
import { DEFAULT_SERVICES_PALETTE, mergeServicesPalette } from '@/components/portfolio/portfolio-services-palette-settings';
import {
  resolveServicesCardElements,
  resolveServicesCtaLabel,
} from '@/components/portfolio/portfolio-services-card-elements';
import { formatServiceDelivery, getServicePriceParts } from '@/lib/profile-services';
import {
  DEFAULT_SERVICES_INDEX_LIST_SETTINGS,
  type PortfolioServicesIndexListMediaRatio,
  type PortfolioServicesIndexListRowGap,
  type PortfolioServicesIndexListSettings,
  type PortfolioServicesIndexListTasksStyle,
  type PortfolioServicesPresentationSettings,
} from '@/components/portfolio/portfolio-services-settings';
import { useT } from '@/lib/i18n/I18nProvider';

/** Vertical space between rows — phone / from md. Spacious is deliberately monumental. */
const ROW_GAP: Record<PortfolioServicesIndexListRowGap, CSSProperties> = {
  tight: { '--il-row-gap': '3rem', '--il-row-gap-md': '4.5rem' } as CSSProperties,
  normal: { '--il-row-gap': '5rem', '--il-row-gap-md': '7.5rem' } as CSSProperties,
  airy: { '--il-row-gap': '8rem', '--il-row-gap-md': '13rem' } as CSSProperties,
  spacious: { '--il-row-gap': '12rem', '--il-row-gap-md': '22rem' } as CSSProperties,
};

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

/** Colors are exposed as CSS variables on the list root so hover states (which need to swap
 *  ink and its inverse) can live in plain Tailwind classes instead of JS handlers. */
function indexListVars(colorMode: 'light' | 'dark' | undefined, accent: string): CSSProperties {
  const isLight = colorMode === 'light';
  return {
    '--il-ink': isLight ? '#0a0a0a' : '#fafafa',
    '--il-inv': isLight ? '#fafafa' : '#0a0a0a',
    '--il-muted': isLight ? 'rgba(10,10,10,0.62)' : 'rgba(250,250,250,0.62)',
    '--il-line': isLight ? 'rgba(10,10,10,0.28)' : 'rgba(250,250,250,0.3)',
    '--il-soft': isLight ? 'rgba(10,10,10,0.16)' : 'rgba(250,250,250,0.18)',
    '--il-accent': accent,
    color: 'var(--il-ink)',
  } as CSSProperties;
}

const RATIO_CLASS: Record<PortfolioServicesIndexListMediaRatio, string> = {
  wide: 'aspect-[16/9]',
  standard: 'aspect-[4/3]',
  square: 'aspect-square',
};

/** Ink wipes up from the bottom edge on hover and the text flips to its inverse. Shared by the
 *  pill and tile task styles. */
const FILL_SWEEP_CLASS =
  'bg-[linear-gradient(var(--il-ink),var(--il-ink))] bg-no-repeat bg-[position:bottom] bg-[length:100%_0%] ' +
  'transition-[background-size,color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ' +
  'hover:bg-[length:100%_100%] hover:text-[color:var(--il-inv)] hover:border-[color:var(--il-ink)]';

const FONT = (rem: number) => `calc(${rem}rem * var(--pf-services-font-scale, 1))`;

function TasksPills({ tasks }: { tasks: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2.5">
      {tasks.map((task, i) => (
        <li
          key={`${task}-${i}`}
          data-index-chip=""
          data-pf-no-color-transition=""
          className={`cursor-default rounded-full border border-[color:var(--il-line)] px-4 py-2 leading-none text-[color:var(--il-ink)] ${FILL_SWEEP_CLASS}`}
          style={{ fontSize: FONT(0.85) }}
        >
          {task}
        </li>
      ))}
    </ul>
  );
}

/** Full-width hairline rows; the label slides right and an arrow draws in on hover. */
function TasksLedger({ tasks }: { tasks: string[] }) {
  return (
    <ul className="border-b border-[color:var(--il-line)]">
      {tasks.map((task, i) => (
        <li
          key={`${task}-${i}`}
          data-index-chip=""
          data-pf-no-color-transition=""
          className="group/task flex cursor-default items-center justify-between gap-4 border-t border-[color:var(--il-line)] py-3.5"
          style={{ fontSize: FONT(0.95) }}
        >
          <span data-pf-no-color-transition="" className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/task:translate-x-2.5">
            {task}
          </span>
          <span data-pf-no-color-transition=""
            aria-hidden
            className="-translate-x-2 opacity-0 transition-[transform,translate,scale,rotate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/task:translate-x-0 group-hover/task:opacity-100"
          >
            ↗
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Two-column grid, each task prefixed by a small monospaced counter that lights up on hover. */
function TasksNumbered({ tasks }: { tasks: string[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {tasks.map((task, i) => (
        <li
          key={`${task}-${i}`}
          data-index-chip=""
          data-pf-no-color-transition=""
          className="group/task flex cursor-default items-baseline gap-3 border-t border-[color:var(--il-line)] py-3.5"
          style={{ fontSize: FONT(0.95) }}
        >
          <span data-pf-no-color-transition=""
            className="font-mono text-[0.8rem] text-[color:var(--il-muted)] transition-colors duration-300 group-hover/task:text-[color:var(--il-accent)]"
            aria-hidden
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>{task}</span>
        </li>
      ))}
    </ul>
  );
}

/** One flowing sentence of tasks separated by slashes; each underlines left-to-right on hover. */
function TasksInline({ tasks }: { tasks: string[] }) {
  return (
    <p className="leading-[1.7]" style={{ fontSize: FONT(1.2) }}>
      {tasks.map((task, i) => (
        <span key={`${task}-${i}`}>
          <span
            data-index-chip=""
            data-pf-no-color-transition=""
            className="inline cursor-default bg-[linear-gradient(var(--il-ink),var(--il-ink))] bg-no-repeat bg-[position:0_100%] bg-[length:0%_1px] transition-[background-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[length:100%_1px]"
          >
            {task}
          </span>
          {i < tasks.length - 1 ? (
            <span aria-hidden className="mx-2.5 text-[color:var(--il-muted)]">
              /
            </span>
          ) : null}
        </span>
      ))}
    </p>
  );
}

function TasksBlock({
  style,
  tasks,
}: {
  style: PortfolioServicesIndexListTasksStyle;
  tasks: string[];
}) {
  switch (style) {
    case 'ledger':
      return <TasksLedger tasks={tasks} />;
    case 'numbered':
      return <TasksNumbered tasks={tasks} />;
    case 'inline':
      return <TasksInline tasks={tasks} />;
    default:
      return <TasksPills tasks={tasks} />;
  }
}

function resolveIndexListSettings(
  presentation: PortfolioServicesPresentationSettings
): PortfolioServicesIndexListSettings {
  return presentation.indexList ?? DEFAULT_SERVICES_INDEX_LIST_SETTINGS;
}

/**
 * Services "Index list" — an editorial, numbered list. Every service is one row split in two:
 * on the left a hairline rule, a small monospaced index ("01/"), a large light title, a short
 * description and the service's tasks; on the right its cover media. Layout settings choose the
 * media side (right, left, or a zigzag that alternates every row), the media ratio, whether the
 * index shows, and one of four task presentations (pills, ledger, numbered, inline). Rows reveal one by one as they scroll into view (rule draws left to right, the media
 * opens with a clip-path wipe, the text and tasks rise in a stagger). On hover a row either zooms
 * its media, slides its title, washes its background, or does nothing (Layout settings). Below
 * `lg` each row stacks: text first, media underneath, and there is no hover motion.
 */
export function ServicesIndexListSection({
  services,
  presentation,
}: {
  services: ProfileServiceItem[];
  presentation: PortfolioServicesPresentationSettings;
}) {
  const t = useT();
  const items = useMemo(() => services.filter((service) => service.title?.trim()), [services]);
  const count = items.length;
  const settings = resolveIndexListSettings(presentation);

  const accent = presentation.ctaColor || presentation.cardAccentColor || '#f97316';
  const fallbackGradient = `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 45%, #0a0a0a) 100%)`;
  const vars = indexListVars(presentation.activeColorMode, accent);
  const pricingStyle = useServicesPricingStyle(presentation);
  const show = resolveServicesCardElements(presentation);
  const ctaLabel = resolveServicesCtaLabel(presentation);
  const isLight = presentation.activeColorMode === 'light';
  const ink = isLight ? '#0a0a0a' : '#fafafa';
  const inverse = isLight ? '#fafafa' : '#0a0a0a';
  const ctaToken = settings.ctaColor ?? 'auto';
  const ctaColor =
    ctaToken === 'auto'
      ? null
      : resolveHeroPaletteColor(mergeServicesPalette(DEFAULT_SERVICES_PALETTE, presentation.servicesPalette), ctaToken);
  const pageBg = /^#[0-9a-f]{6}$/i.test(presentation.sectionBackgroundColor?.trim() ?? '')
    ? (presentation.sectionBackgroundColor as string).trim()
    : inverse;

  const listRef = useRef<HTMLDivElement>(null);

  // Re-run the entrance when the structure of the rows changes (not on every color edit).
  const entranceKey = `${count}|${settings.layout}|${settings.tasksStyle}|${settings.mediaRatio}|${show.title}|${show.description}|${show.price}|${show.delivery}|${show.tasks}|${show.cta}`;

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || count === 0) return undefined;
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return undefined;

    let ctx: gsap.Context | null = null;
    let refreshId = 0;
    try {
      gsap.registerPlugin(ScrollTrigger);
      const scroller = getScrollParent(list) ?? undefined;
      const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-index-row]'));

      ctx = gsap.context(() => {
        rows.forEach((row) => {
          const line = row.querySelector<HTMLElement>('[data-index-line]');
          const textBits = row.querySelectorAll<HTMLElement>('[data-index-text]');
          const chips = row.querySelectorAll<HTMLElement>('[data-index-chip]');
          const media = row.querySelector<HTMLElement>('[data-index-media]');
          // Mirrored rows wipe in from the side the media sits on.
          const fromLeft = row.dataset.mediaSide === 'left';

          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, scroller, start: 'top 88%', once: true },
            defaults: { ease: 'power3.out' },
          });
          if (line) {
            tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.9, clearProps: 'transform' }, 0);
          }
          if (textBits.length) {
            tl.fromTo(
              textBits,
              { y: 22, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, clearProps: 'transform,opacity' },
              0.1
            );
          }
          if (chips.length) {
            tl.fromTo(
              chips,
              { y: 14, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.55, stagger: 0.04, clearProps: 'transform,opacity' },
              0.35
            );
          }
          if (media) {
            tl.fromTo(
              media,
              { clipPath: fromLeft ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
              { clipPath: 'inset(0 0% 0 0%)', duration: 1.1, ease: 'power4.out', clearProps: 'clipPath' },
              0.05
            );
          }
        });
      }, list);

      refreshId = window.setTimeout(() => {
        try {
          ScrollTrigger.refresh();
        } catch (error) {
          console.error('[ServicesIndexListSection] deferred refresh() failed', error);
        }
      }, 90);
    } catch (error) {
      console.error('[ServicesIndexListSection] GSAP entrance setup failed', error);
    }

    return () => {
      window.clearTimeout(refreshId);
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entranceKey encodes count + layout settings
  }, [entranceKey]);

  if (count === 0) return null;

  return (
    <div
      ref={listRef}
      className="flex w-full flex-col gap-[var(--il-row-gap)] md:gap-[var(--il-row-gap-md)]"
      style={{ ...vars, ...ROW_GAP[settings.rowGap ?? 'normal'] }}
    >
      {items.map((item, index) => {
        const tasks = show.tasks ? (item.tasks ?? []).map((task) => task.trim()).filter(Boolean) : [];
        const description = show.description ? item.description?.trim() : '';
        const delivery = show.delivery ? formatServiceDelivery(item, show.deliveryTemplate) : null;
        const mediaLeft =
          settings.layout === 'media-left' || (settings.layout === 'zigzag' && index % 2 === 1);
        const priceParts = show.price && pricingStyle.style.showPrice ? applyServicePriceLabels(getServicePriceParts(item), pricingStyle.style) : null;
        const priceSuffix =
          priceParts && priceParts.kind === 'amount'
            ? resolveBillingSuffix(pricingStyle.style, priceParts.period)
            : null;
        return (
          <article
            key={item.id || index}
            data-index-row=""
            data-media-side={mediaLeft ? 'left' : 'right'}
            className={`group/row grid grid-cols-1 gap-8 lg:gap-10 ${
              mediaLeft
                ? 'lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]'
                : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'
            }`}
            data-pf-no-color-transition=""
          >
            <div className={`min-w-0 ${mediaLeft ? 'lg:order-2' : ''}`}>
              <div
                data-index-line=""
                className="h-px w-full origin-left bg-[color:var(--il-line)]"
                aria-hidden
              />
              {settings.showIndex ? (
                <div data-index-text="" className="mt-5 flex items-center gap-3">
                  <p className="font-mono text-[0.8rem] leading-none tracking-wide text-[color:var(--il-muted)]">
                    {String(index + 1).padStart(2, '0')}/
                  </p>
                </div>
              ) : null}
              {show.title ? (
              <h3
                data-index-text=""
                className={`font-sans font-normal leading-[1.02] tracking-[-0.025em] ${
                  settings.showIndex ? 'mt-6' : 'mt-7'
                }`}
                style={{
                  fontSize: 'calc(clamp(1.7rem, 2.8vw, 2.6rem) * var(--pf-services-font-scale, 1))',
                  overflowWrap: 'anywhere',
                }}
              >
                {item.title}
              </h3>
              ) : null}
              {priceParts ? (
                <p data-index-text="" className="mt-5 font-semibold tracking-tight" style={{ fontSize: FONT(1.05) }}>
                  {priceParts.isFrom && priceParts.kind === 'amount' ? `${t('From')} ` : ''}
                  {priceParts.text}
                  {priceSuffix ? (
                    <span className="ml-1.5 font-normal text-[color:var(--il-muted)]" style={{ fontSize: FONT(0.85) }}>
                      {priceSuffix}
                    </span>
                  ) : null}
                </p>
              ) : null}
              {delivery ? (
                <p data-index-text="" className="mt-3 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-[color:var(--il-muted)]">
                  {delivery}
                </p>
              ) : null}
              {description ? (
                <p
                  data-index-text=""
                  className="mt-7 max-w-[28rem] leading-[1.6]"
                  style={{ fontSize: FONT(1) }}
                >
                  {description}
                </p>
              ) : null}
              {tasks.length > 0 ? (
                <div className="mt-7">
                  <TasksBlock style={settings.tasksStyle} tasks={tasks} />
                </div>
              ) : null}
              {show.cta ? (
                <IndexListCta
                  design={settings.ctaDesign ?? 'classic'}
                  color={ctaColor}
                  pageBg={pageBg}
                  ink={ink}
                  inverse={inverse}
                  pricingStyle={pricingStyle}
                  label={ctaLabel}
                />
              ) : null}
            </div>

            <div className={`min-w-0 ${mediaLeft ? 'lg:order-1' : ''}`}>
              <div
                data-index-media=""
                className={`group/media relative w-full overflow-hidden ${RATIO_CLASS[settings.mediaRatio]}`}
              >
                {/* Zoom only, triggered by hovering the thumbnail itself. No will-change: a promoted
                    layer is rasterised at 1x and then scaled, which softens the picture on hover. */}
                <div
                  className="absolute inset-0 lg:transition-transform lg:duration-[900ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover/media:scale-[1.035]"
                  data-pf-no-color-transition=""
                >
                  {item.coverImageUrl ? (
                    <PortfolioDeferredMedia
                      src={item.coverImageUrl}
                      alt={item.title}
                      className="h-full w-full"
                      objectFit="cover"
                      crisp
                      sizes="(min-width: 1024px) 55vw, 100vw"
                    />
                  ) : (
                    <div className="h-full w-full" style={{ background: fallbackGradient }} aria-hidden />
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
